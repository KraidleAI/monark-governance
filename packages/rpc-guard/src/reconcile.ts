// MONARK rpc-guard - the SERVED, non-LLM reconciliation (GARDE-HELIUS task 4). The ledger counts REQUESTS/attempts
// (an upper bound); the dashboard counts billed requests/credits. The criterion is ASYMMETRIC (C-6):
//   HARD bound: Delta_dashboard <= ledger_run (per method). Delta ABOVE the ledger = consumption OUTSIDE the guard => NO-GO.
//   SOFT band:  ledger_run - Delta_dashboard <= max(50 cr, 0.5% of the run) - expected over-count (decision 113).
// WINDOW (C-V-7): ledger_run = the `attempted` entries SINCE the last `reconciled` line (a chained boundary already in
// the ledger), NOT the whole cycle - otherwise a second honest course reds falsely and the hard bound is diluted.
// Rollover (before.cycle != after.cycle != --cycle) => NO-GO (C-7). Every run APPENDS a chained `reconciled` line; the
// verdict is CONSUMED as the course exit code (branchement; T16/T17 replay it).
import type { CycleLedger, CycleLedgerEntry } from "./ledger.ts";

export interface Snapshot { readonly cycle: string; readonly byMethod: Readonly<Record<string, number>>; }
export type Verdict = "GO" | "NO-GO";
export interface ReconcileResult { readonly verdict: Verdict; readonly reason?: string; readonly exitCode: number; readonly entry: CycleLedgerEntry; }

/** ledger_run per method = Sigma credits_derived of the `attempted` lines AFTER the last `reconciled` line (windowed). */
function ledgerRunSinceLastReconciled(ledger: CycleLedger, cycle: string): Record<string, number> {
  const es = ledger.entries();
  let start = 0;
  for (let i = es.length - 1; i >= 0; i--) if (es[i]!.outcome === "reconciled") { start = i + 1; break; }
  const out: Record<string, number> = {};
  for (let i = start; i < es.length; i++) {
    const e = es[i]!;
    if (e.outcome !== "attempted" || e.cycle_id !== cycle) continue;
    for (const key of Object.keys(e.by_op_method)) { const m = key.split("|")[1] ?? key; out[m] = (out[m] ?? 0) + e.credits_derived; }
  }
  return out;
}

export function runReconcile(ledger: CycleLedger, before: Snapshot, after: Snapshot, cycle: string): ReconcileResult {
  const finish = (verdict: Verdict, reason?: string): ReconcileResult => {
    const entry = ledger.appendChained("reconciled", { [`reconcile|${verdict}`]: 1 }, 0, reason);
    return { verdict, ...(reason !== undefined ? { reason } : {}), exitCode: verdict === "GO" ? 0 : 1, entry };
  };
  if (before.cycle !== cycle || after.cycle !== cycle) return finish("NO-GO", "rollover");
  const run = ledgerRunSinceLastReconciled(ledger, cycle);
  // HARD bound is PER METHOD (C-V-7); the SOFT band is 0.5% of the TOTAL run (decision 113 verbatim "0.5% du run",
  // C-G2-6), applied once to the aggregate over-count - never per method.
  let totalRun = 0, totalDelta = 0;
  for (const method of new Set([...Object.keys(run), ...Object.keys(after.byMethod), ...Object.keys(before.byMethod)])) {
    const delta = (after.byMethod[method] ?? 0) - (before.byMethod[method] ?? 0);
    const runM = run[method] ?? 0;
    if (delta > runM) return finish("NO-GO", `hard:${method}`);
    totalRun += runM; totalDelta += delta;
  }
  if (totalRun - totalDelta > Math.max(50, 0.005 * totalRun)) return finish("NO-GO", "soft");
  return finish("GO");
}
