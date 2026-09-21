// MONARK rpc-guard - the SERVED, non-LLM reconciliation (GARDE-HELIUS task 4). The ledger counts REQUESTS/attempts
// (an upper bound, in the operator's unit); the dashboard counts billed requests/credits/RU. The criterion is
// ASYMMETRIC (C-6):
//   HARD bound: Delta_dashboard <= ledger_run. Delta ABOVE the ledger = consumption OUTSIDE the guard => NO-GO.
//   SOFT band:  ledger_run - Delta_dashboard <= max(50, 0.5% of the run) - expected over-count (decision 113).
// WINDOW (C-V-7): ledger_run = the `attempted` entries SINCE the last `reconciled` line (a chained boundary already in
// the ledger), NOT the whole cycle. Rollover (before.cycle != after.cycle != --cycle) => NO-GO (C-7). Every run APPENDS
// a chained `reconciled` line; the verdict is CONSUMED as the course exit code (branchement; T16/T17 replay it).
//
// TWO DECLARED MODES (GARDE-HELIUS-2):
//   - "per-method" (Helius): the dashboard breaks down by method => HARD bound PER METHOD, SOFT band on the total.
//   - "aggregate" (Chainstack): the Statistics page has NO per-method breakdown, only a total RU per network per day
//     (FAITS 2026-09-21 pt 10) => HARD bound on the TOTAL only. The mode is NAMED in the result. A per-method snapshot
//     given in aggregate mode (or vice-versa) is FAIL-CLOSED (a NO-GO), never silently coerced.
import type { CycleLedger, CycleLedgerEntry } from "./ledger.ts";

/** A dashboard snapshot. `byMethod` is the per-method form (Helius credits); `total_ru` is the aggregate form
 *  (Chainstack RU/day, FAITS pt 10). Exactly one is present, matching the declared reconcile mode. */
export interface Snapshot { readonly cycle: string; readonly byMethod?: Readonly<Record<string, number>>; readonly total_ru?: number; }
export type Verdict = "GO" | "NO-GO";
export type ReconcileMode = "per-method" | "aggregate";
export interface ReconcileResult { readonly verdict: Verdict; readonly reason?: string; readonly exitCode: number; readonly entry: CycleLedgerEntry; readonly mode: ReconcileMode; }

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

export function runReconcile(ledger: CycleLedger, before: Snapshot, after: Snapshot, cycle: string, mode: ReconcileMode = "per-method"): ReconcileResult {
  const finish = (verdict: Verdict, reason?: string): ReconcileResult => {
    const entry = ledger.appendChained("reconciled", { [`reconcile|${verdict}`]: 1 }, 0, reason);
    return { verdict, ...(reason !== undefined ? { reason } : {}), exitCode: verdict === "GO" ? 0 : 1, entry, mode };
  };
  if (before.cycle !== cycle || after.cycle !== cycle) return finish("NO-GO", "rollover");
  const run = ledgerRunSinceLastReconciled(ledger, cycle);

  if (mode === "aggregate") {
    // Chainstack Statistics has NO per-method breakdown (FAITS pt 10): the dashboard gives one total RU. A per-method
    // snapshot reaching a DECLARED-aggregate operator is FAIL-CLOSED (never silently coerced to a per-method bound).
    // EXACTLY ONE field per mode: a missing total_ru OR a stray byMethod is a NO-GO (never a silent field-ignore).
    if (before.total_ru === undefined || after.total_ru === undefined) return finish("NO-GO", "aggregate_mode_needs_total_ru");
    if (before.byMethod !== undefined || after.byMethod !== undefined) return finish("NO-GO", "aggregate_mode_rejects_by_method");
    const ledgerTotal = Object.values(run).reduce((a, b) => a + b, 0); // Sigma conservative RU over the window
    const delta = after.total_ru - before.total_ru;
    if (delta > ledgerTotal) return finish("NO-GO", "hard:total"); // billed RU above the conservative ledger = outside the guard
    if (ledgerTotal - delta > Math.max(50, 0.005 * ledgerTotal)) return finish("NO-GO", "soft");
    return finish("GO");
  }

  // per-method (Helius): HARD bound PER METHOD (C-V-7); SOFT band = 0.5% of the TOTAL run (decision 113 verbatim,
  // applied once to the aggregate over-count, never per method). A total_ru-only snapshot here is FAIL-CLOSED.
  if (before.byMethod === undefined || after.byMethod === undefined) return finish("NO-GO", "per_method_mode_needs_by_method");
  if (before.total_ru !== undefined || after.total_ru !== undefined) return finish("NO-GO", "per_method_mode_rejects_total_ru");
  const bm = before.byMethod, am = after.byMethod;
  let totalRun = 0, totalDelta = 0;
  for (const method of new Set([...Object.keys(run), ...Object.keys(am), ...Object.keys(bm)])) {
    const delta = (am[method] ?? 0) - (bm[method] ?? 0);
    const runM = run[method] ?? 0;
    if (delta > runM) return finish("NO-GO", `hard:${method}`);
    totalRun += runM; totalDelta += delta;
  }
  if (totalRun - totalDelta > Math.max(50, 0.005 * totalRun)) return finish("NO-GO", "soft");
  return finish("GO");
}
