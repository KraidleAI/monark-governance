import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { openGuardedClient, runCli, verifyCycleLedger, type Snapshot, type RunLimits } from "@monark/rpc-guard";
import { acquireLock, LockHeldError } from "../src/lock.ts";
import { ensureCycleDir, openOperatorLedger } from "../src/ledger.ts";
import { HELIUS, tmp } from "./harness.ts";

test("lock_blocks_second_writer", async () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } }));
  try {
    const env = { BELL_SOLANA_RPC: "https://example.invalid/HELIUS", HELIUS_API_KEY: "FAKEKEY-9z9z9z" };
    const limits: RunLimits = { maxCalls: 100, runCaps: { helius: 1_000_000 }, methodCaps: { getTransaction: 100 }, cycleFloor: { helius: 0 } };
    // "process 1": openGuardedClient acquires the helius lock at construction (before opening the ledger), then one call.
    const c1 = openGuardedClient(env, limits, dir, { helius: "c13" });
    await c1.call(HELIUS, "getTransaction", [1]);
    // "process 2": a SECOND openGuardedClient on the SAME cycle dir fails to openSync("wx") => LockHeldError at
    // construction, BEFORE any transport (mutant "w" would overwrite the lock and let it through).
    assert.throws(() => openGuardedClient(env, limits, dir, { helius: "c13" }), LockHeldError);
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("unlock_subcommand_chains_release", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "c14");
    const lockPath = acquireLock(cd, "helius");
    assert.ok(existsSync(lockPath));
    // SERVED path: `runCli unlock` (C-V-9, T14 through the CLI, not runUnlock directly).
    const noSnap = (): Snapshot => ({ cycle: "", byMethod: {} });
    const r = runCli(["unlock", "--cycle", "c14", "--op", "helius", "--reason", "operator done; cycle rolled"], { ledgerDir: dir, floor: 0, readSnapshot: noSnap });
    assert.equal(r.exitCode, 0);
    assert.ok(!existsSync(lockPath), "the lock file is removed on unlock");
    const ledger = openOperatorLedger(cd, "helius", 0);
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "unlocked"); assert.equal(last.reason, "operator done; cycle rolled");
    verifyCycleLedger(ledger.entries()); // chain stays green after the appended unlocked line
    assert.doesNotThrow(() => acquireLock(cd, "helius"), "re-lockable after an EXPLICIT unlock");
  } finally { cleanup(); }
});
