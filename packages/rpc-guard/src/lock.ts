// MONARK rpc-guard - the exclusive per-(cycle, operator) writer lock (C-9). HELIUS-1 ran parallel scripts on ONE
// budget.json (8 agents in flight); two writers appending chained lines FORK the chain. The lock is
// `openSync(<cycleDir>/<op>.lock, "wx")` - flag "wx" = create EXCLUSIVE, so a second writer for the same operator
// gets EEXIST => fail-closed (aligned "Chainstack cap = one role at a time"). A stale lock after a crash STAYS held
// (fail-closed, never a masked eternal block); release is the EXPLICIT served `unlock` subcommand, which appends a
// chained `outcome=unlocked` line (consigned, never an automatic theft).
import { existsSync, unlinkSync, type BigIntStats } from "node:fs";
import { join } from "node:path";
import { DURABLE_FS, type CycleLedger, type CycleLedgerEntry } from "./ledger.ts";

/** A second writer found the operator already locked for this cycle - fail-closed (not a budget stop, a concurrency
 *  stop; the caller must not proceed). */
export class LockHeldError extends Error {}

/** Acquire the lock. Writes {pid, iso} then CLOSES the fd immediately - the lock IS the file's existence; an open fd
 *  would block `unlinkSync` on Windows (so unlock + cleanup would break). Returns the lock path. */
export function acquireLock(cycleDir: string, op: string): string {
  const lockPath = join(cycleDir, `${op}.lock`);
  let fd: number;
  try { fd = DURABLE_FS.openSync(lockPath, "wx"); }
  catch (e) {
    if ((e as { code?: string }).code === "EEXIST") throw new LockHeldError(`rpc-guard: operator '${op}' is already locked for this cycle (fail-closed, C-9)`);
    throw e;
  }
  // GARDE-FSYNC-1: {pid, iso} fsynced BEFORE close (repair-tail reads this pid, C-2); a failure removes OUR file (sealOwnLock).
  sealOwnLock(lockPath, fd, () => { DURABLE_FS.writeSync(fd, JSON.stringify({ pid: process.pid, iso: new Date().toISOString() })); DURABLE_FS.fsyncSync(fd); });
  return lockPath;
}

/** Transient release WITHOUT a ledger line: `cli reconcile` acquires the lock only to guard its append against a
 *  concurrent course writer (C-G2-4), then releases. `unlock` (below) is the EXPLICIT, ledgered course release. */
export function releaseLock(cycleDir: string, op: string): void {
  const lockPath = join(cycleDir, `${op}.lock`);
  if (existsSync(lockPath)) unlinkSync(lockPath);
}

/** The served `unlock` release: append a chained `outcome=unlocked` line (verifyCycleLedger stays green) and remove
 *  the lock file. Explicit + consigned; the reason is recorded in the ledger. */
export function runUnlock(ledger: CycleLedger, op: string, reason: string): CycleLedgerEntry {
  const entry = ledger.appendChained("unlocked", { [`${op}|unlock`]: 1 }, 0, reason);
  const lockPath = join(ledger.cycleDir, `${op}.lock`);
  if (existsSync(lockPath)) unlinkSync(lockPath);
  return entry;
}

/** RPC-GUARD-LOCK-WRITE-LEAK-1: run `write` on the fd of the lock file THIS call created ("wx"), then close it. On a failure
 *  of the write, the fsync or the close, the file is removed iff the path still names the file this fd created (same dev,
 *  ino and birth time, read from the fd before the write), then the FIRST error is rethrown. A file swapped in at the path
 *  meanwhile (a foreign lock) is never removed. Best effort: an identity that cannot be read or is degenerate (ino or birth
 *  time 0n: no proof the file is ours), or a failed removal, leaves the file (fail-closed: lock_held until the served unlock). */
function sealOwnLock(lockPath: string, fd: number, write: () => void): void {
  let own: BigIntStats | undefined, failure: { error: unknown } | undefined;
  try { own = DURABLE_FS.fstatSync(fd); } catch { own = undefined; }
  try { write(); } catch (e) { failure = { error: e }; }
  try { DURABLE_FS.closeSync(fd); } catch (e) { failure ??= { error: e }; }
  if (failure === undefined) return;
  try {
    const now = DURABLE_FS.lstatSync(lockPath);
    const same = own !== undefined && own.ino !== 0n && own.birthtimeNs !== 0n && now.dev === own.dev && now.ino === own.ino && now.birthtimeNs === own.birthtimeNs;
    if (same) DURABLE_FS.unlinkSync(lockPath);
  } catch { /* best effort: the removal never masks the original error */ }
  throw failure.error;
}
