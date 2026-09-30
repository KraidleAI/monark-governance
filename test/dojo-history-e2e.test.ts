// MONARK Dojo -- PR-2b-4 integration test (ADR-DOJO-PR-2B section 3, "Test d'integration non-LLM"; TU-12a, TU-12b, TU-12d; wiring root
// `test`, precedent D-3 of ADR-DOJO-PR-4): the composition collector -> bundle -> third-party verifier, end to end, without LLM. The
// simulated chain is imported first: fetch is replaced before the guard is loaded, no socket, no name resolution, `.invalid` hosts, fake
// keys; the REAL openGuardedClient writes a temporary ledger; the caps come from the formulas of D-10 (those of act 1, for the three
// phases) and the guard x10 holds. The collector's CLI (main) runs phases A, B and C with the first day read written by PR-2's writer
// (C-29). The lines are compared to an oracle recoded HERE from the chain's truth balances, never from the collector: the day minima (the
// start of the day and after each transaction), day 1 = 0, the existence rule, the class by PR-1a's curve test; the root is PR-1a's. An
// anchor and the history line are then signed by an ephemeral key (PR-1b-1's fixture helper) and dojo-verify (PR-1b-2) reads the served
// tree, then three altered copies. Declared limits: the publisher (PR-3a) does not exist and the fixture signer replaces it (section 3
// step 6); the null window of a read without quorum is out of reach end to end while the bound noQuorum is 0 (dated line Q-2): such a
// read stops the course partial here (G1 journal, Q-G1-6), its window staying the pure test's (PR-2b-2).
import { HOSTS, MINT, firstReadDay, key, rowsAt, sim, world, type Tx } from "../apps/dojo/test/helpers/history-chain.ts";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonical } from "../apps/bell/scripts/bell-chain.mjs";
import { ownerClass, rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { dirSource, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { anchorBody, dateOf, dojoKeyringOf, historyBody, newKey, removeTrees, render, seedChain, writeTree,
  type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { DOJO_HISTORY_ENV, main } from "../apps/dojo/src/history-collect.ts";

const DAY = 86_400, D1 = 20_706, T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"; // day 1 = 2026-09-10 (mere D-18), days since 1970-01-01
const ENV = { BELL_SOLANA_RPC: `https://${HOSTS.a}`, CHAINSTACK_SOLANA_URL: `https://${HOSTS.b}`,
  ...Object.fromEntries(Object.values(DOJO_HISTORY_ENV).flatMap(([id, floor]) => [[id, "cyc"], [floor, "1"]])) };
const sha = (s: string | Buffer): string => createHash("sha256").update(s).digest("hex");
const dayOf = (t: Tx): number => Math.floor(Number(t.entry.blockTime) / DAY);
const roots: string[] = [];
after(() => { removeTrees(); for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });

/** The oracle (D-7; existence rule of D-12), from the chain's truth balances alone: per owner, the minimum of its balance at the start of
 *  the day and after each transaction of the day; a line when that value, or the last one before it, is positive; by day, then address in
 *  byte order; the class by PR-1a's curve test (ownerClass). */
function oracle(txs: readonly Tx[], last: number): string[] {
  const own = (t: Tx): Map<string, bigint> => { // the balance of each owner after t: the sum of its accounts
    const m = new Map<string, bigint>(); for (const [, [o, v]] of t.truth) m.set(o, (m.get(o) ?? 0n) + v); return m;
  };
  const rows: [number, string, bigint][] = [], prev = new Map<string, bigint>();
  let bal = new Map<string, bigint>(), k = 0;
  for (let d = D1; d <= last; d++) {
    const start = bal, low = new Map<string, bigint>(), take = (o: string, v: bigint): void => { if (!low.has(o) || v < (low.get(o) ?? v)) low.set(o, v); };
    for (const [o, v] of start) take(o, v);
    for (; k < txs.length && dayOf(txs[k] as Tx) === d; k++) {
      bal = own(txs[k] as Tx);
      for (const [o, v] of bal) { take(o, start.get(o) ?? 0n); take(o, v); }
      for (const o of low.keys()) take(o, bal.get(o) ?? 0n);
    }
    for (const [o, v] of low) { if (v > 0n || (prev.get(o) ?? 0n) > 0n) rows.push([d, o, v]); prev.set(o, v); }
  }
  rows.sort((p, q) => p[0] - q[0] || Buffer.compare(Buffer.from(p[1]), Buffer.from(q[1])));
  return rows.map(([d, o, v]) => canonical({ address: o, class: ownerClass(o), day: dateOf(d), day_value: String(v) }));
}

// killer: apps/dojo/src/history-collect.ts:432 CONST "status: \"complete\", stop_reason: null" -> "status: \"partial\", stop_reason: null"
test("dojo_history_collect_to_verify_end_to_end", async () => {
  Object.assign(sim, { txs: world(24, 2, 7, { gap: 40_000, mintless: [24], close: [10] }), reqs: [], tick: 0, drop: { a: new Set(), b: new Set() },
    pageDrop: new Set(), diverge: new Set(), override: null }); // days of blockTime, a transfer without the mint, a closed account
  const cut = (sim.txs.at(-1) as Tx).slot, fr = dayOf(sim.txs.at(-1) as Tx) + 2, last = fr - 1, S = 6467 * (fr - D1 + 1); // D_LAST = fr - 1 (D-3 l.230)
  const p = (x: number, L: number): number => Math.floor(x / L) + 1; // D-10 p(x, L), recoded
  sim.nowMs = (fr * DAY + 3600) * 1000;
  const root = mkdtempSync(join(tmpdir(), "dojo-e2e-")), mint = join(root, "mint.txt"), dir = firstReadDay(join(root, "first"), fr, cut, rowsAt(cut));
  roots.push(root);
  copyFileSync(new URL("../out/mint.txt", import.meta.url), mint);
  const state = (n: string): string => { const s = join(root, n); mkdirSync(join(s, "ledger"), { recursive: true }); return s; };
  const argv = (phase: string, st: string): string[] => ["--phase", phase, "--state", st, "--mint-file", mint, "--cut", String(cut), "--first-read", dir,
    "--max-calls", String(2 * p(S, 1000) + p(S, 100) + S), "--max-credits", String(p(S, 1000) + 10 * p(S, 100)), "--max-ru", String(2 * (p(S, 1000) + S)),
    "--deadline", new Date(sim.nowMs + 3_600_000).toISOString().replace(".000Z", "Z")]; // D-10 l.397-400, act 1
  const deps = { env: ENV, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() };
  const course = async (st: string): Promise<number[]> => [await main(argv("A", st), deps), await main(argv("B", st), deps), await main(argv("C", st), deps)];
  const status = (st: string): unknown => JSON.parse(readFileSync(join(st, "evidence", "status.json"), "utf8"));
  const st = state("state"), pub = join(st, "publish");
  assert.deepEqual(await course(st), [0, 0, 0], "the CLI runs phases A, B and C end to end: exit codes 0");
  assert.deepEqual(status(st), { status: "complete", stop_reason: null });
  const sums = readFileSync(join(pub, "SHA256SUMS"), "utf8").trimEnd().split("\n").map((l) => l.split("  "));
  assert.deepEqual(sums.map(([h, n = ""]) => sha(readFileSync(join(pub, ...n.split("/")))) === h), [true, true, true], "SHA256SUMS verified");
  const want = oracle(sim.txs, last), bytes = want.map((l) => `${l}\n`).join(""), [name = ""] = readdirSync(join(pub, "history"));
  assert.deepEqual([name, readFileSync(join(pub, "history", name), "utf8")], [`${sha(bytes)}.jsonl`, bytes], "the lines are the oracle's, byte for byte");
  const m = JSON.parse(readFileSync(join(pub, "manifest.json"), "utf8")) as Record<string, unknown>;
  assert.deepEqual([m.history_root, m.history_lines_count, m.history_first_day, m.history_last_day], [rootOf(want), want.length, "2026-09-10", dateOf(last)]);
  assert.ok(["program", "holder"].every((c) => want.some((l) => l.includes(`"class":"${c}"`))) && want.some((l) => l.includes('"day_value":"0"')));

  // Verification (section 3 step 4): an anchor and the history line signed by an ephemeral key; dojo-verify reads the served tree.
  const k = newKey(), seed = seedChain("dojo-e2e-anchor", 40);
  const steps: Step[] = [{ key: k, body: anchorBody(seed(0), 40, last) }, { key: k, body: historyBody(last) }]; // the anchor on the last history day
  const lines = want.map((l) => JSON.parse(l) as Record<string, string>), tree = render(steps, new Map([[1, lines]])), rel = `history/${name}`;
  assert.equal(tree.get(rel)?.toString("utf8"), bytes, "the served history file is the collector's, byte for byte");
  const kr = dojoKeyringOf([[k, 1]]), check = async (t: ReadonlyMap<string, Buffer>): Promise<string> => {
    const r = await verifyDojoServed({ source: dirSource(writeTree(t)), keyring: kr });
    return r.ok ? `${r.status} ${String(r.history?.history_lines_count)} ${r.history?.recomputed_root ?? ""}` : r.reason; };
  assert.equal(await check(tree), `consistent_with_supplied_keyring ${String(want.length)} ${rootOf(want)}`, "the supplied keyring; the history checks pass");
  // Mutations (section 3 step 5): a day_value changed by one unit; the same with sha and count recomputed; a line removed.
  const served = (text: string): Map<string, Buffer> => new Map([...tree].map(([n, b]) => [n, n === rel ? Buffer.from(text) : b]));
  const i = lines.findIndex((l) => l.day_value !== "0");
  const bumped = lines.map((l, j) => (j === i ? { ...l, day_value: String(BigInt(l.day_value ?? "0") + 1n) } : l));
  assert.equal(await check(served(bumped.map((l) => `${canonical(l)}\n`).join(""))), "history_sha_mismatch");
  assert.equal(await check(render(steps, new Map([[1, bumped]]), (s) => { (s[1] as Step).body.history_root = rootOf(want); })), "history_root_mismatch");
  assert.equal(await check(served(bytes.slice(bytes.indexOf("\n") + 1))), "history_count_mismatch");

  // DOJO-HISTORY-CHECKS-COMPOSITION-1: a mint after SIG0 (D-8 (i), R-d) stops phase B, then C: partial, never a publish/.
  const ins = ((sim.txs.filter((t) => !t.failed)[3] as Tx).body.transaction as { message: { instructions: unknown[] } }).message.instructions;
  ins.push({ programId: T22, parsed: { type: "mintTo", info: { mint: MINT, account: key("e2e minted"), amount: "5" } } });
  const s2 = state("minted");
  assert.deepEqual([await course(s2), status(s2), existsSync(join(s2, "publish"))], [[0, 1, 1], { status: "partial", stop_reason: "supply_mismatch" }, false]);
  ins.pop();
  sim.diverge.add((sim.txs.filter((t) => !t.failed)[2] as Tx).sig); // a read without quorum: partial while the bound noQuorum is 0 (Q-G1-6)
  const s3 = state("diverged");
  assert.deepEqual([await course(s3), status(s3), existsSync(join(s3, "publish"))], [[0, 1, 1], { status: "partial", stop_reason: "bound_exceeded" }, false]);
});
