// Test harness for @monark/rpc-guard (NOT a *.test.ts, so it is never run as a test - only imported). Internals are
// reached by RELATIVE import (they are no longer public, C-V-2). Every operator gets a durable per-operator ledger.
// GARDE-HELIUS-2: RunLimits is PER OPERATOR (runCaps / cycleFloor are Record<label, number>); makeClient no longer
// locks (the sole public path openGuardedClient locks before opening the ledgers).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { DURABLE_FS, ensureCycleDir, openOperatorLedger, type CycleLedger, type DurableFs } from "../src/ledger.ts";
import { makeClient, type BudgetedClient, type ClientConfig, type Transport, type OperatorLabel, type RunLimits } from "../src/client.ts";
import { heliusCredits } from "../src/tariff.ts";

export const HELIUS = "helius" as OperatorLabel;
export const OK: Transport = () => Promise.resolve({ ok: 1 });

export function tmp(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-")); // OUTSIDE the repo (os tmp)
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
export function heliusLedger(dir: string, cycle = "c1", floor = 0): CycleLedger {
  return openOperatorLedger(ensureCycleDir(dir, cycle), "helius", floor);
}
export function heliusCfg(over: Partial<ClientConfig["limits"]> = {}, cap = 8_000_000): ClientConfig {
  return {
    operators: { helius: { unit: "credits", credits: heliusCredits, cycleCap: cap } },
    limits: { maxCalls: 100, runCaps: { helius: 1_000_000 }, methodCaps: { getTransaction: 100, getSignaturesForAddress: 100, getTransactionsForAddress: 100 }, cycleFloor: { helius: 0 }, ...over },
  };
}
export function heliusClient(cfg: ClientConfig, ledger: CycleLedger, transport: Transport): BudgetedClient {
  return makeClient(cfg, new Map([["helius", ledger]]), { transport });
}

/** A-7: the env of a child process with every paid endpoint key REMOVED - matched by PATTERN (every "*_API_KEY" and
 *  "CHAINSTACK_*_URL"), so no provider name is written in this EXPORTED file (decision 69, test/no-cash-provider-name). */
export const childEnv = (): NodeJS.ProcessEnv => { const e = { ...process.env }; for (const k of Object.keys(e)) if (/_API_KEY$|^CHAINSTACK_\w+_URL$/.test(k)) delete e[k]; return e; };
// GARDE-FSYNC-1 - the public path's inputs (fake key, .invalid host) and a fetch stub answering {"result":1}.
export const FAKE_HELIUS_ENV = { BELL_SOLANA_RPC: "https://example.invalid/HELIUS", HELIUS_API_KEY: "FAKEKEY-9z9z9z" };
export const ONE_METHOD_LIMITS: RunLimits = { maxCalls: 10, runCaps: { helius: 1000 }, methodCaps: { getTransaction: 5 }, cycleFloor: { helius: 0 } };
export const okFetch = (): Promise<Response> => Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } }));
/** GARDE-FSYNC-1 (C-8, G2 C-G2-1): a REAL writer - a child process runs openGuardedClient + n calls (fetch stubbed in
 *  the child), then exits WITHOUT unlock: it dies holding the lock, its fsynced {pid, iso} names a dead pid. */
export function realWriter(dir: string, cycle: string, n: number): SpawnSyncReturns<string> {
  const index = new URL("../src/index.ts", import.meta.url).href;
  const code = `const { openGuardedClient } = await import(${JSON.stringify(index)});
globalThis.fetch = () => Promise.resolve(new Response('{"result":1}', { status: 200, headers: { "content-type": "application/json" } }));
const c = openGuardedClient(${JSON.stringify(FAKE_HELIUS_ENV)}, ${JSON.stringify(ONE_METHOD_LIMITS)}, ${JSON.stringify(dir)}, { helius: ${JSON.stringify(cycle)} });
for (let i = 0; i < ${String(n)}; i++) await c.call("helius", "getTransaction", [i]);`;
  return spawnSync(process.execPath, ["--input-type=module", "-e", code], { env: childEnv(), encoding: "utf8" });
}
/** GARDE-FSYNC-1 (C-7): wrap the DURABLE_FS seam so every operation is journaled IN ORDER ("open:<flags>:<file>",
 *  "write:<file>", ...; base names), then delegated to `over` when given (fault injection) else to the real one. The
 *  caller MUST restore() in a finally. A COUNT cannot tell "fsync before write" from "write before fsync"; this can. */
export function journal(over: Partial<DurableFs> = {}): { ops: string[]; restore: () => void } {
  const real = { ...DURABLE_FS }, ops: string[] = [], names = new Map<number, string>();
  const nm = (fd: number): string => names.get(fd) ?? "?";
  DURABLE_FS.openSync = (p, f) => { const fd = (over.openSync ?? real.openSync)(p, f); names.set(fd, basename(p)); ops.push(`open:${f}:${basename(p)}`); return fd; };
  DURABLE_FS.writeSync = (fd, d) => { ops.push(`write:${nm(fd)}`); (over.writeSync ?? real.writeSync)(fd, d); };
  DURABLE_FS.fsyncSync = (fd) => { ops.push(`fsync:${nm(fd)}`); (over.fsyncSync ?? real.fsyncSync)(fd); };
  DURABLE_FS.closeSync = (fd) => { ops.push(`close:${nm(fd)}`); (over.closeSync ?? real.closeSync)(fd); };
  DURABLE_FS.renameSync = (a, b) => { ops.push(`rename:${basename(a)}>${basename(b)}`); (over.renameSync ?? real.renameSync)(a, b); };
  DURABLE_FS.ftruncateSync = (fd, n) => { ops.push(`ftruncate:${nm(fd)}`); (over.ftruncateSync ?? real.ftruncateSync)(fd, n); };
  DURABLE_FS.unlinkSync = (p) => { ops.push(`unlink:${basename(p)}`); (over.unlinkSync ?? real.unlinkSync)(p); };
  DURABLE_FS.sleepSync = (ms) => { ops.push(`sleep:${String(ms)}`); (over.sleepSync ?? real.sleepSync)(ms); };
  return { ops, restore: () => { Object.assign(DURABLE_FS, real); } };
}
