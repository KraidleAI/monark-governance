import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openCycleLedger, acquireLock, runUnlock, LockHeldError, verifyCycleLedger } from "../src/index.ts";

test("lock_blocks_second_writer", () => {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-"));
  try {
    const ledger = openCycleLedger(dir, "cycle-13", 0);
    acquireLock(ledger.cycleDir, "helius"); // first writer holds the exclusive lock
    // a second writer for the SAME operator gets EEXIST (openSync "wx") => fail-closed. Mutant "w" would overwrite.
    assert.throws(() => acquireLock(ledger.cycleDir, "helius"), LockHeldError);
    // a DIFFERENT operator is independent (per-(cycle, operator) lock).
    assert.doesNotThrow(() => acquireLock(ledger.cycleDir, "chainstack"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("unlock_subcommand_chains_release", () => {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-"));
  try {
    const ledger = openCycleLedger(dir, "cycle-14", 0);
    const lockPath = acquireLock(ledger.cycleDir, "helius");
    assert.ok(existsSync(lockPath));
    const entry = runUnlock(ledger, "helius", "operator done; cycle rolled");
    assert.equal(entry.outcome, "unlocked");
    assert.equal(entry.reason, "operator done; cycle rolled");
    assert.ok(!existsSync(lockPath), "the lock file is removed on unlock");
    verifyCycleLedger(ledger.entries()); // the chain stays green after the appended unlocked line
    assert.doesNotThrow(() => acquireLock(ledger.cycleDir, "helius"), "the operator can be re-locked after an EXPLICIT unlock");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
