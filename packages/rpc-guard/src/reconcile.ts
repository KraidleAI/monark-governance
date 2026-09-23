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
//     C-6 (1b-0 fold / decision 121): "per network per day" is the DASHBOARD granularity; the LEDGER side sums the
//     ACCOUNT total across networks (one 16 M RU cap - reconcile reads the account total, `ledgerTotal` below has NO
//     network filter). These are CONSISTENT today because every cycle course is SINGLE-network and only ETH is billed.
//     A 121 MIXED account (Bell Solana + Ukemi ETH on ONE Chainstack account) makes "which total_ru snapshot
//     reconciles an account-total ledger" AMBIGUOUS - an OPEN item (ADR 1b0-B), trigger: the FIRST reconcile of a
//     Solana course (1b-i). NOT resolved here; the aggregate bound stays on the account total meanwhile.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CycleLedger, CycleLedgerEntry } from "./ledger.ts";

/** A dashboard snapshot. `byMethod` is the per-method form (Helius credits); `total_ru` is the aggregate form
 *  (Chainstack RU/day, FAITS pt 10). Exactly one is present, matching the declared reconcile mode. */
export interface Snapshot { readonly cycle: string; readonly byMethod?: Readonly<Record<string, number>>; readonly total_ru?: number; }
export type Verdict = "GO" | "NO-GO";
/** "per-method" (Helius) | "aggregate" (Chainstack, soft band BLOCKS) | "aggregate-calibration" (Chainstack 1st course:
 *  hard bound BLOCKS, soft over-count CONSIGNED, exit 0). C-V-3: the calibration course has a NAMED code path. */
export type ReconcileMode = "per-method" | "aggregate" | "aggregate-calibration";
export interface ReconcileResult { readonly verdict: Verdict; readonly reason?: string; readonly exitCode: number; readonly entry: CycleLedgerEntry; readonly mode: ReconcileMode; readonly softDeviation?: number; }

/** Operators whose dashboard has NO per-method breakdown (FAITS pt 10) => reconcile REQUIRES an aggregate mode flag;
 *  a per-method reconcile on such an operator is fail-closed (cli.ts). Chainstack today; extend at its trigger. */
export const AGGREGATE_ONLY_OPERATORS: ReadonlySet<string> = new Set(["chainstack"]);

/** The reconcile WINDOW start: the index of the first entry AFTER the last `reconciled` line (0 when there is none). */
function windowStart(es: readonly CycleLedgerEntry[]): number {
  for (let i = es.length - 1; i >= 0; i--) if (es[i]!.outcome === "reconciled") return i + 1;
  return 0;
}
/** GARDE-FSYNC-1 C-9 - the CONSUMER of <op>.repair.jsonl (repair-tail's records; a MANUAL repair only if its record is
 *  appended, RUNBOOK-rpc-guard section 4). lines_after >= the window start => NO-GO `repaired_in_window` BEFORE any bound
 *  (a repaired ledger may have lost SENT lines - pre-lot INCIDENT ~420 - and the dashboard lags). That NO-GO appends
 *  `reconciled`: a NUMERIC lines_after flags ONE window (never bounded by this tool, RUNBOOK section 3). A line that is
 *  unreadable or has no numeric lines_after flags EVERY window (fail-closed, never rolls) until lifted (section 5). */
function repairedInWindow(ledger: CycleLedger): boolean {
  const p = join(ledger.cycleDir, `${ledger.op}.repair.jsonl`);
  if (!existsSync(p)) return false;
  const start = windowStart(ledger.entries());
  return readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").some((l) => {
    try { const n = (JSON.parse(l) as { lines_after?: unknown }).lines_after; return typeof n !== "number" || n >= start; } catch { return true; }
  });
}
/** ledger_run per method = Sigma credits_derived of the `attempted` lines AFTER the last `reconciled` line (windowed). */
function ledgerRunSinceLastReconciled(ledger: CycleLedger, cycle: string): Record<string, number> {
  const es = ledger.entries();
  const out: Record<string, number> = {};
  for (let i = windowStart(es); i < es.length; i++) {
    const e = es[i]!;
    if (e.outcome !== "attempted" || e.cycle_id !== cycle) continue;
    for (const key of Object.keys(e.by_op_method)) { const m = key.split("|")[1] ?? key; out[m] = (out[m] ?? 0) + e.credits_derived; }
  }
  return out;
}

export function runReconcile(ledger: CycleLedger, before: Snapshot, after: Snapshot, cycle: string, mode: ReconcileMode = "per-method"): ReconcileResult {
  const finish = (verdict: Verdict, reason?: string, softDeviation?: number): ReconcileResult => {
    const entry = ledger.appendChained("reconciled", { [`reconcile|${verdict}`]: 1 }, 0, reason);
    return { verdict, ...(reason !== undefined ? { reason } : {}), exitCode: verdict === "GO" ? 0 : 1, entry, mode, ...(softDeviation !== undefined ? { softDeviation } : {}) };
  };
  if (before.cycle !== cycle || after.cycle !== cycle) return finish("NO-GO", "rollover");
  if (repairedInWindow(ledger)) return finish("NO-GO", "repaired_in_window"); // C-9, before any bound (both modes)
  const run = ledgerRunSinceLastReconciled(ledger, cycle);

  if (mode === "aggregate" || mode === "aggregate-calibration") {
    // Chainstack Statistics has NO per-method breakdown (FAITS pt 10): the dashboard gives one total RU. A per-method
    // snapshot reaching a DECLARED-aggregate operator is FAIL-CLOSED (never silently coerced to a per-method bound).
    // EXACTLY ONE field per mode: a missing total_ru OR a stray byMethod is a NO-GO (never a silent field-ignore).
    if (before.total_ru === undefined || after.total_ru === undefined) return finish("NO-GO", "aggregate_mode_needs_total_ru");
    if (before.byMethod !== undefined || after.byMethod !== undefined) return finish("NO-GO", "aggregate_mode_rejects_by_method");
    const ledgerTotal = Object.values(run).reduce((a, b) => a + b, 0); // Sigma conservative RU over the window
    const delta = after.total_ru - before.total_ru;
    if (delta < 0) return finish("NO-GO", "negative_delta"); // C-V-5: a reset daily counter is NOT a soft over-count
    if (delta > ledgerTotal) return finish("NO-GO", "hard:total"); // billed RU above the conservative ledger = outside the guard (BOTH modes)
    const softOver = ledgerTotal - delta;
    if (mode === "aggregate-calibration") {
      // C-V-3: the 1st Chainstack course. The hard bound BLOCKS (above); the soft over-count is CONSIGNED (no verdict,
      // exit 0) - a conservative 2-RU tariff over-counts a Global node, so the 2nd course's soft band is pre-registered
      // from THIS softOver, not read by a human from a failing `soft` reason.
      return finish("GO", `calibration_soft:${String(softOver)}`, softOver);
    }
    if (softOver > Math.max(50, 0.005 * ledgerTotal)) return finish("NO-GO", "soft");
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
