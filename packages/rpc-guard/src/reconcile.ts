// MONARK rpc-guard - the SERVED, non-LLM reconciliation (GARDE-HELIUS task 4). The ledger counts REQUESTS/attempts
// (an upper bound); the dashboard counts billed requests/credits. A SYMMETRIC |dashboard - ledger| <= tol would hide
// a small bypass inside the tolerance, so the criterion is ASYMMETRIC (C-6):
//   HARD bound: deltadashboard <= ledger_run (per method). deltadashboard ABOVE the ledger = consumption OUTSIDE the guard
//               => verdict NO-GO (incident maintained). No tolerance on this side.
//   SOFT band:  ledger_run - deltadashboard <= max(50 cr, 0.5% of the run) - expected over-count (unbilled retries +
//               rounding, decision 113). Beyond the band => NO-GO.
// Rollover (before.cycle != after.cycle != --cycle) => NO-GO (two cycles' absolutes don't subtract, C-7). Every run
// APPENDS a chained `outcome=reconciled` line; the verdict is CONSUMED as the course exit code - this is the branch
// that makes the piece "built" (test T16/T17 replays it end-to-end).
import type { CycleLedger } from "./ledger.ts";
import type { CycleLedgerEntry } from "./ledger.ts";

/** A dashboard snapshot: the credit cycle id it was read under + billed credits per method. */
export interface Snapshot { readonly cycle: string; readonly byMethod: Readonly<Record<string, number>>; }
export type Verdict = "GO" | "NO-GO";
export interface ReconcileResult { readonly verdict: Verdict; readonly reason?: string; readonly exitCode: number; readonly entry: CycleLedgerEntry; }

/** ledger_run per method = sum credits_derived of the cycle's `attempted` lines, keyed by the method half of by_op_method. */
function ledgerRunByMethod(ledger: CycleLedger, cycle: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of ledger.entries()) {
    if (e.outcome !== "attempted" || e.cycle_id !== cycle) continue;
    for (const key of Object.keys(e.by_op_method)) {
      const method = key.split("|")[1] ?? key;
      out[method] = (out[method] ?? 0) + e.credits_derived;
    }
  }
  return out;
}

export function runReconcile(ledger: CycleLedger, before: Snapshot, after: Snapshot, cycle: string): ReconcileResult {
  const finish = (verdict: Verdict, reason?: string): ReconcileResult => {
    const entry = ledger.appendChained("reconciled", { [`reconcile|${verdict}`]: 1 }, 0, reason);
    return { verdict, ...(reason !== undefined ? { reason } : {}), exitCode: verdict === "GO" ? 0 : 1, entry };
  };
  if (before.cycle !== cycle || after.cycle !== cycle) return finish("NO-GO", "rollover");
  const run = ledgerRunByMethod(ledger, cycle);
  for (const method of new Set([...Object.keys(run), ...Object.keys(after.byMethod), ...Object.keys(before.byMethod)])) {
    const delta = (after.byMethod[method] ?? 0) - (before.byMethod[method] ?? 0);
    const runM = run[method] ?? 0;
    if (delta > runM) return finish("NO-GO", `hard:${method}`);           // dashboard above ledger = outside the guard
    if (runM - delta > Math.max(50, 0.005 * runM)) return finish("NO-GO", `soft:${method}`); // over-count beyond the band
  }
  return finish("GO");
}
