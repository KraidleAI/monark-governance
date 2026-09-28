// scripts/oracle/lock.mjs: host lock with a FIFO queue and live-pid takeover (ADR-METHODE-2 D3, lot M-3).
// The mutex stays the directory <root>/oracle-lock taken by an atomic mkdir, so the older shell waiters (mkdir, 60 s poll,
// free-text owner.txt) and this module keep excluding each other. A waiter queues <root>/oracle-lock.queue/<ms>-<pid>.json;
// only the first queued entry whose pid is alive tries the mkdir, and a dead pid's entry is removed. A held lock whose
// owner.txt is JSON written HERE (lock: MARK) with a dead pid is taken over; any other owner never is: free text (older
// protocol, or being written), or JSON of another writer, whose pid may be of another namespace (MSYS bash `$$`).
// Declared residuals: older waiters do not queue, they may pass ahead (LOCK-LEGACY-1); a reused pid reads as alive, the wait
// ends at maxMs and a live lock is never stolen (ORACLE-PID-REUSE-1); on Windows a SIGTERM runs no handler (dead-pid takeover).
import { mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MARK = "oracle/lock.mjs"; // the owner.txt writer tag: only this module's pid is a pid of process.kill's namespace
export const alive = (pid) => { try { return process.kill(pid, 0); } catch (e) { return e.code === "EPERM"; } };
const ownerPid = (dir) => {
  try { const { pid, lock } = JSON.parse(readFileSync(join(dir, "owner.txt"), "utf8")); return lock === MARK && Number.isInteger(pid) && pid > 0 ? pid : undefined; } catch { return undefined; }
};
const dropLock = (dir) => { rmSync(join(dir, "owner.txt"), { force: true }); try { rmdirSync(dir); } catch { /* not empty: the mkdir decides */ } };

/** Waits in FIFO order; returns { release, waitedMs } once the lock is held, or null after maxMs. */
export async function acquire(root, owner, { pollMs = 5000, maxMs = 5_400_000 } = {}) {
  const dir = join(root, "oracle-lock"), queue = join(root, "oracle-lock.queue"), t0 = Date.now();
  const mine = `${String(t0).padStart(15, "0")}-${process.pid}.json`;
  mkdirSync(queue, { recursive: true });
  writeFileSync(join(queue, mine), JSON.stringify(owner));
  const release = () => { rmSync(join(queue, mine), { force: true }); if (ownerPid(dir) === process.pid) dropLock(dir); };
  process.once("exit", release);
  for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143]]) process.once(sig, () => process.exit(code));
  for (;;) {
    const head = readdirSync(queue).filter((f) => /^\d{15}-\d+\.json$/.test(f)).sort()
      .find((f) => alive(Number(f.slice(16, -5))) || (rmSync(join(queue, f), { force: true }), false)); // dead pid: entry removed
    if (head === mine) {
      const pid = ownerPid(dir);
      if (pid !== undefined && !alive(pid)) dropLock(dir); // dead owner: the lock is taken over
      try {
        mkdirSync(dir);
        writeFileSync(join(dir, "owner.txt"), JSON.stringify({ ...owner, lock: MARK, pid: process.pid }));
        rmSync(join(queue, mine), { force: true });
        return { release, waitedMs: Date.now() - t0 };
      } catch (e) { if (e.code !== "EEXIST") throw e; }
    }
    if (Date.now() - t0 >= maxMs) { release(); return null; }
    await new Promise((r) => setTimeout(r, pollMs));
  }
}
