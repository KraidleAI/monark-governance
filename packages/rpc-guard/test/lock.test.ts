import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { runCli, verifyCycleLedger, type Snapshot } from "@monark/rpc-guard";
import { acquireLock, LockHeldError } from "../src/lock.ts";
import { ensureCycleDir, openOperatorLedger } from "../src/ledger.ts";
import { makeClient } from "../src/client.ts";
import { HELIUS, tmp, heliusCfg } from "./harness.ts";
import type { Transport } from "../src/client.ts";

test("lock_blocks_second_writer", async () => {
  const { dir, cleanup } = tmp();
  try {
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const cd = ensureCycleDir(dir, "c13");
    // "process 1": makeClient acquires the helius lock at construction, then one call (1 transport).
    const c1 = makeClient(heliusCfg(), new Map([["helius", openOperatorLedger(cd, "helius", 0)]]), { transport: spy });
    await c1.call(HELIUS, "getTransaction", [1]);
    assert.equal(calls, 1);
    // "process 2": a SECOND makeClient on the SAME cycle dir fails to openSync("wx") => LockHeldError at construction,
    // BEFORE any transport (mutant "w" would overwrite the lock and let it through).
    const l2 = openOperatorLedger(cd, "helius", 0);
    assert.throws(() => makeClient(heliusCfg(), new Map([["helius", l2]]), { transport: spy }), LockHeldError);
    assert.equal(calls, 1, "the refused second constructor performs no transport");
  } finally { cleanup(); }
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
