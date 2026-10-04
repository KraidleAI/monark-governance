import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { openGuardedClient, runCli, verifyCycleLedger, type Snapshot, type RunLimits } from "@monark/rpc-guard";
import { acquireLock, LockHeldError } from "../src/lock.ts";
import { DURABLE_FS, ensureCycleDir, openOperatorLedger } from "../src/ledger.ts";
import { FAKE_HELIUS_ENV, HELIUS, ONE_METHOD_LIMITS, journal, tmp } from "./harness.ts";

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

// RPC-GUARD-LOCK-WRITE-LEAK-1 (G2 of #137, H-1): a write, fsync or close failure AFTER a successful openSync("wx") used to leave
// the created lock on disk, outside openGuardedClient's `acquired` rollback: every later run read lock_held until the RUNBOOK's
// manual unlock. The faults are injected through the package's own seam (DURABLE_FS via harness.journal), never a real disk fault.
const fault = (code: string): Error => Object.assign(new Error(`${code}: injected lock fault`), { code });
const thrown = (f: () => unknown): unknown => { try { f(); } catch (e) { return e; } return undefined; };
const FOREIGN = JSON.stringify({ pid: 4242, iso: "2026-10-04T00:00:00.000Z" });

// killer: packages/rpc-guard/src/lock.ts:60 SDL "if (same) DURABLE_FS.unlinkSync(lockPath);" -> ""
test("lock_write_failure_removes_the_created_lock_and_rethrows", () => {
  const { dir, cleanup } = tmp();
  const err = fault("ENOSPC");
  const j = journal({ writeSync: () => { throw err; } });
  try {
    const cd = ensureCycleDir(dir, "c-leak");
    assert.equal(thrown(() => acquireLock(cd, "helius")), err, "the ORIGINAL write error surfaces (not a LockHeldError, not a cleanup error)");
    assert.deepEqual(j.ops, ["open:wx:helius.lock", "write:helius.lock", "close:helius.lock", "unlink:helius.lock"], "closed THEN removed (an open fd blocks unlink on Windows)");
    assert.equal(existsSync(join(cd, "helius.lock")), false, "no lock file left behind by the failed acquisition");
    j.restore();
    assert.doesNotThrow(() => acquireLock(cd, "helius"), "the next acquisition is not lock_held");
  } finally { j.restore(); cleanup(); }
});

// killer: packages/rpc-guard/src/lock.ts:62 SDL "throw failure.error;" -> ""
test("lock_fsync_failure_through_openGuardedClient_leaves_no_lock", () => {
  const { dir, cleanup } = tmp();
  const err = fault("EIO");
  const realOpen = DURABLE_FS.openSync, realFsync = DURABLE_FS.fsyncSync;
  let lockFd = -1;
  const j = journal({
    openSync: (p, f) => { const fd = realOpen(p, f); if (p.endsWith(".lock")) lockFd = fd; return fd; },
    fsyncSync: (fd) => { if (fd === lockFd) throw err; realFsync(fd); },
  });
  try {
    // The served path: the fsync of helius.lock fails => openGuardedClient throws THAT error, before any ledger is opened.
    assert.equal(thrown(() => openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: "c-fsync" })), err, "the original fsync error surfaces");
    assert.equal(existsSync(join(dir, "c-fsync", "helius.lock")), false, "the lock created before the failed fsync is removed");
    assert.equal(existsSync(join(dir, "c-fsync", "helius.jsonl")), false, "no ledger opened");
    j.restore();
    assert.doesNotThrow(() => openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: "c-fsync" }), "the next run is not lock_held");
  } finally { j.restore(); cleanup(); }
});

// killer: packages/rpc-guard/src/lock.ts:55 CONST "failure ??= { error: e }" -> "failure = { error: e }"
test("lock_close_failure_after_write_failure_surfaces_the_write_error", () => {
  const { dir, cleanup } = tmp();
  const writeErr = fault("ENOSPC"), closeErr = fault("EBADF");
  const realClose = DURABLE_FS.closeSync;
  const j = journal({ writeSync: () => { throw writeErr; }, closeSync: (fd) => { realClose(fd); throw closeErr; } });
  try {
    const cd = ensureCycleDir(dir, "c-close");
    assert.equal(thrown(() => acquireLock(cd, "helius")), writeErr, "the FIRST error (the write) surfaces, never masked by the close error");
    assert.equal(existsSync(join(cd, "helius.lock")), false, "removed although the close failed too");
    j.restore();
    // A close failure ALONE (write and fsync done) also fails the acquisition: the lock is not returned, so it is removed.
    const j2 = journal({ closeSync: (fd) => { realClose(fd); throw closeErr; } });
    try { assert.equal(thrown(() => acquireLock(cd, "helius")), closeErr, "the close error surfaces"); } finally { j2.restore(); }
    assert.equal(existsSync(join(cd, "helius.lock")), false, "no lock left after a close failure");
  } finally { j.restore(); cleanup(); }
});

// killer: packages/rpc-guard/src/lock.ts:59 CONST "own !== undefined && now.dev === own.dev && now.ino === own.ino && now.birthtimeNs === own.birthtimeNs" -> "own !== undefined"
test("lock_failure_never_removes_a_foreign_lock", () => {
  const { dir, cleanup } = tmp();
  const err = fault("EIO");
  try {
    // (a) A lock held by another writer: EEXIST => LockHeldError, its file and content untouched (nothing was created here).
    const held = ensureCycleDir(dir, "c-held");
    writeFileSync(join(held, "helius.lock"), FOREIGN);
    assert.throws(() => acquireLock(held, "helius"), LockHeldError);
    assert.equal(existsSync(join(held, "helius.lock")), true, "the held lock is still there");
    assert.equal(readFileSync(join(held, "helius.lock"), "utf8"), FOREIGN, "a pre-existing foreign lock is never removed");
    // (b) Our own failed acquisition IS cleaned (the fix is live in this test), ...
    const own = ensureCycleDir(dir, "c-own");
    const j1 = journal({ writeSync: () => { throw err; } });
    try { assert.equal(thrown(() => acquireLock(own, "helius")), err); } finally { j1.restore(); }
    assert.equal(existsSync(join(own, "helius.lock")), false, "our own failed lock is removed");
    // (c) ... but a lock that REPLACED ours at the path before the cleanup (our file released and another writer's lock in
    // place: a distinct file, created before ours went away) is foreign: kept, content intact, the original error surfaces.
    const swap = ensureCycleDir(dir, "c-swap");
    writeFileSync(join(swap, "other.tmp"), FOREIGN);
    const realClose = DURABLE_FS.closeSync;
    const j2 = journal({ writeSync: () => { throw err; }, closeSync: (fd) => { realClose(fd); renameSync(join(swap, "other.tmp"), join(swap, "helius.lock")); } });
    try { assert.equal(thrown(() => acquireLock(swap, "helius")), err, "the original error surfaces"); } finally { j2.restore(); }
    assert.equal(existsSync(join(swap, "helius.lock")), true, "the lock swapped in at the path is still there");
    assert.equal(readFileSync(join(swap, "helius.lock"), "utf8"), FOREIGN, "the foreign lock at the path is never removed");
  } finally { cleanup(); }
});
