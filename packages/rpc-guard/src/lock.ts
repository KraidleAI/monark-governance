// MONARK rpc-guard - the exclusive per-(cycle, operator) writer lock (C-9). HELIUS-1 ran parallel scripts on ONE
// budget.json (8 agents in flight); two writers appending chained lines FORK the chain. The lock is
// `openSync(<cycleDir>/<op>.lock, "wx")` - flag "wx" = create EXCLUSIVE, so a second writer for the same operator
// gets EEXIST => fail-closed (aligned "Chainstack cap = one role at a time"). A stale lock after a crash STAYS held
// (fail-closed, never a masked eternal block); release is the EXPLICIT served `unlock` subcommand, which appends a
// chained `outcome=unlocked` line (consigned, never an automatic theft).
import { existsSync, unlinkSync } from "node:fs";
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
  // GARDE-FSYNC-1: the {pid, iso} content is fsynced BEFORE close - repair-tail reads this pid to refuse a LIVE writer (C-2).
  try { DURABLE_FS.writeSync(fd, JSON.stringify({ pid: process.pid, iso: new Date().toISOString() })); DURABLE_FS.fsyncSync(fd); } finally { DURABLE_FS.closeSync(fd); }
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
