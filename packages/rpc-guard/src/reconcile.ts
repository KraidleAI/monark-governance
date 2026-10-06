// MONARK rpc-guard - the SERVED, non-LLM reconciliation (GARDE-HELIUS task 4). The ledger counts REQUESTS/attempts
// (an upper bound, in the operator's unit); the dashboard counts billed requests/credits/RU. The criterion is
// ASYMMETRIC (C-6):
//   HARD bound: Delta_dashboard <= ledger_run. Delta ABOVE the ledger = consumption OUTSIDE the guard => NO-GO.
//   SOFT band:  ledger_run - Delta_dashboard <= max(50, 0.5% of the run) - expected over-count (decision 113).
// WINDOW (C-V-7): by default ("since-last-reconciled") ledger_run = the `attempted` + `settled` (D-2) entries SINCE the last `reconciled` line
// (a chained boundary already in the ledger), NOT the whole cycle; a `course_reconciled` line NEVER bounds it. COURSE mode
// (--course-end <sha>, RECONCILE-WINDOW-1, ADR-RPC-GUARD-RECONCILE-1 D-1): the window of ONE course (courseWindow below).
// Rollover (before.cycle != after.cycle != --cycle) => NO-GO (C-7), checked first. Every run APPENDS a chained `reconciled`
// line (course mode: `course_reconciled` with `course: {from, to}`); the verdict is CONSUMED as the course exit code (T16/T17).
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
import { LEDGER_GENESIS, parseEntries, type CycleLedger, type CycleLedgerEntry } from "./ledger.ts";

/** A dashboard snapshot. `byMethod` is the per-method form (Helius credits); `total_ru` is the aggregate form
 *  (Chainstack RU/day, FAITS pt 10). Exactly one is present, matching the declared reconcile mode. */
export interface Snapshot { readonly cycle: string; readonly byMethod?: Readonly<Record<string, number>>; readonly total_ru?: number; }
export type Verdict = "GO" | "NO-GO";
/** "per-method" (Helius) | "aggregate" (Chainstack, soft band BLOCKS) | "aggregate-calibration" (Chainstack 1st course:
 *  hard bound BLOCKS, soft over-count CONSIGNED, exit 0). C-V-3: the calibration course has a NAMED code path. */
export type ReconcileMode = "per-method" | "aggregate" | "aggregate-calibration";
/** Q-O5: the COURSE table, rendered by runCli and printed by the bin (never in the ledger line). A row = the guard's count over
 *  the window, the dashboard delta and the row's hard-bound verdict; `total` carries the reconcile's own verdict. */
export interface CourseRow { readonly count: number; readonly delta: number; readonly verdict: Verdict; }
export interface CourseTable { readonly methods: Readonly<Record<string, CourseRow>>; readonly total: CourseRow; }
export interface ReconcileResult { readonly verdict: Verdict; readonly reason?: string; readonly exitCode: number; readonly entry: CycleLedgerEntry; readonly mode: ReconcileMode; readonly softDeviation?: number; readonly perMethod?: CourseTable; }

/** Operators whose dashboard has NO per-method breakdown (FAITS pt 10) => reconcile REQUIRES an aggregate mode flag;
 *  a per-method reconcile on such an operator is fail-closed (cli.ts). Chainstack today; extend at its trigger. */
export const AGGREGATE_ONLY_OPERATORS: ReadonlySet<string> = new Set(["chainstack"]);

/** The reconcile WINDOW start: the index of the first entry AFTER the last `reconciled` line (0 when there is none). */
function windowStart(es: readonly CycleLedgerEntry[]): number {
  for (let i = es.length - 1; i >= 0; i--) if (es[i]!.outcome === "reconciled") return i + 1;
  return 0;
}
/** RECONCILE-WINDOW-1 (D-1): the window of ONE course, [start, end). `to` = the entry_sha256 of the course's `unlocked` line
 *  (rendered by `unlock`, passed as --course-end), at index `end`; the window starts strictly after the last BOUNDARY line
 *  before it (`from`, LEDGER_GENESIS when none). Searched in THIS <cycle>/<op> ledger only (TY-2). A token is an ARGUMENT
 *  refusal: no window exists, so no line is ever written for it. */
const COURSE_BOUNDARIES: ReadonlySet<string> = new Set(["unlocked", "reconciled", "course_reconciled"]);
interface CourseWindow { readonly from: string; readonly to: string; readonly start: number; readonly end: number; }
function courseWindow(es: readonly CycleLedgerEntry[], to: string): CourseWindow | "course_end_unknown" | "course_end_not_unlocked" {
  const end = es.findIndex((e) => e.entry_sha256 === to);
  if (end < 0) return "course_end_unknown";
  if (es[end]!.outcome !== "unlocked") return "course_end_not_unlocked";
  let b = end - 1;
  while (b >= 0 && !COURSE_BOUNDARIES.has(es[b]!.outcome)) b--;
  return { from: b < 0 ? LEDGER_GENESIS : es[b]!.entry_sha256, to, start: b + 1, end };
}
/** The served PRE-LOCK refusal (cli.ts): a plain READ of <op>.jsonl - never openOperatorLedger, which may heal the head and
 *  remove an orphan <op>.head.tmp, never done without the lock (a live writer may own them). A torn line of a concurrent
 *  append throws (fail-closed). Returns the refusal token, or undefined when `to` is an `unlocked` line of this ledger. */
export function courseEndRefusal(cycleDir: string, op: string, to: string): string | undefined {
  const p = join(cycleDir, `${op}.jsonl`), w = courseWindow(existsSync(p) ? parseEntries(readFileSync(p, "utf8")) : [], to);
  return typeof w === "string" ? w : undefined;
}
/** GARDE-FSYNC-1 C-9 - the CONSUMER of <op>.repair.jsonl (repair-tail's records; a MANUAL repair only if its record is
 *  appended, RUNBOOK-rpc-guard section 4). Checked AFTER the rollover (a rollover NO-GO takes precedence, RUNBOOK section 3
 *  step 6) and BEFORE any bound: a repaired ledger may have lost SENT lines (pre-lot INCIDENT ~420) and the dashboard lags.
 *  A NUMERIC lines_after L flags ONE window: since-last-reconciled iff L >= its start (its NO-GO line then closes it); a
 *  course (D-FS-5) iff start <= L <= end, the index of `to` - L <= end means `to` was written AFTER the truncation (an
 *  `unlock` after repair-tail, which refuses a live writer), so the course lost its tail; L > end, the truncation followed
 *  the course; L < start, it preceded it (a course window never closes: a rerun is flagged again). This tool never computes
 *  a repaired window's bound (RUNBOOK section 3 step 6). A line that is unreadable or has no numeric lines_after flags EVERY
 *  window (fail-closed, never rolls) until lifted (section 5). */
function repairedInWindow(ledger: CycleLedger, w?: CourseWindow): boolean {
  const p = join(ledger.cycleDir, `${ledger.op}.repair.jsonl`);
  if (!existsSync(p)) return false;
  const start = windowStart(ledger.entries());
  return readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").some((l) => {
    try { const n = (JSON.parse(l) as { lines_after?: unknown }).lines_after; return typeof n !== "number" || (w === undefined ? n >= start : n >= w.start && n <= w.end); } catch { return true; }
  });
}
/** ledger_run per method = Sigma credits_derived of the `attempted` + `settled` lines (D-2: reservation + signed delta =
 *  the credits billed) of the window: AFTER the last `reconciled` line (since-last-reconciled), or the course window [start, end) (D-1). */
function ledgerRunInWindow(ledger: CycleLedger, cycle: string, w?: CourseWindow): Record<string, number> {
  const es = ledger.entries();
  const out: Record<string, number> = {};
  for (let i = w?.start ?? windowStart(es); i < (w?.end ?? es.length); i++) {
    const e = es[i]!;
    if ((e.outcome !== "attempted" && e.outcome !== "settled") || e.cycle_id !== cycle) continue;
    for (const key of Object.keys(e.by_op_method)) { const m = key.split("|")[1] ?? key; out[m] = (out[m] ?? 0) + e.credits_derived; }
  }
  return out;
}

/** The served reconcile (cli.ts runs it under the operator lock). `courseEnd` (--course-end) selects the COURSE window;
 *  without it, the since-last-reconciled window, byte-identical to the pre-D-1 code on VALID input (a snapshot value that is not a
 *  safe integer >= 0, or a negative per-method delta, is a NO-GO in both windows). Exported, OUTSIDE the served invariant "a course holds no
 *  reconcile line" (the cli appends under the lock, a direct call does not: cp-1 O-1). An unknown or non-`unlocked` courseEnd throws: no line. */
export function runReconcile(ledger: CycleLedger, before: Snapshot, after: Snapshot, cycle: string, mode: ReconcileMode = "per-method", courseEnd?: string): ReconcileResult {
  const w = courseEnd === undefined ? undefined : courseWindow(ledger.entries(), courseEnd);
  if (typeof w === "string") throw new Error(`rpc-guard: --course-end refused: ${w} (argument refusal, no line written, fail-closed)`);
  let table: { methods: Record<string, CourseRow>; count: number; delta: number } | undefined; // Q-O5: surfaced in course mode only
  const finish = (verdict: Verdict, reason?: string, softDeviation?: number): ReconcileResult => {
    const entry = w === undefined ? ledger.appendChained("reconciled", { [`reconcile|${verdict}`]: 1 }, 0, reason)
      : ledger.appendChained("course_reconciled", { [`reconcile|${verdict}`]: 1 }, 0, reason, { from: w.from, to: w.to });
    return { verdict, ...(reason !== undefined ? { reason } : {}), exitCode: verdict === "GO" ? 0 : 1, entry, mode, ...(softDeviation !== undefined ? { softDeviation } : {}),
      ...(w !== undefined && table !== undefined ? { perMethod: { methods: table.methods, total: { count: table.count, delta: table.delta, verdict } } } : {}) };
  };
  if (before.cycle !== cycle || after.cycle !== cycle) return finish("NO-GO", "rollover");
  if (repairedInWindow(ledger, w)) return finish("NO-GO", "repaired_in_window"); // C-9, before any bound (both modes)
  const run = ledgerRunInWindow(ledger, cycle, w);

  if (mode === "aggregate" || mode === "aggregate-calibration") {
    // Chainstack Statistics has NO per-method breakdown (FAITS pt 10): the dashboard gives one total RU. A per-method
    // snapshot reaching a DECLARED-aggregate operator is FAIL-CLOSED (never silently coerced to a per-method bound).
    // EXACTLY ONE field per mode: a missing total_ru OR a stray byMethod is a NO-GO (never a silent field-ignore).
    if (before.total_ru === undefined || after.total_ru === undefined) return finish("NO-GO", "aggregate_mode_needs_total_ru");
    if (before.byMethod !== undefined || after.byMethod !== undefined) return finish("NO-GO", "aggregate_mode_rejects_by_method");
    if (!isSnapshotCount(before.total_ru) || !isSnapshotCount(after.total_ru)) return finish("NO-GO", "snapshot_invalid"); // C-G2-1, Q-3
    const ledgerTotal = Object.values(run).reduce((a, b) => a + b, 0); // Sigma conservative RU over the window
    const delta = after.total_ru - before.total_ru;
    table = { methods: {}, count: ledgerTotal, delta };
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
  if (![...Object.values(bm), ...Object.values(am)].every(isSnapshotCount)) return finish("NO-GO", "snapshot_invalid"); // C-G2-1 (no table)
  let totalRun = 0, totalDelta = 0, hard: string | undefined, neg: string | undefined;
  const methods: Record<string, CourseRow> = {};
  for (const method of new Set([...Object.keys(run), ...Object.keys(am), ...Object.keys(bm)])) {
    const delta = (am[method] ?? 0) - (bm[method] ?? 0);
    const runM = run[method] ?? 0;
    methods[method] = { count: runM, delta, verdict: delta > runM ? "NO-GO" : "GO" };
    if (delta > runM) hard ??= method; // the FIRST violator in Set order names the NO-GO (the pre-D-1 early return)
    if (delta < 0) neg ??= method; // Q-G2-1 (a): a delta BELOW 0 (swapped or reset snapshots) is a NO-GO, never a soft credit
    totalRun += runM; totalDelta += delta;
  }
  table = { methods, count: totalRun, delta: totalDelta };
  if (hard !== undefined) return finish("NO-GO", `hard:${hard}`);
  if (neg !== undefined) return finish("NO-GO", `negative_delta:${neg}`); // after hard: outside-the-guard consumption outranks a bad pair
  if (totalRun - totalDelta > Math.max(50, 0.005 * totalRun)) return finish("NO-GO", "soft");
  return finish("GO");
}

/** RG-SNAPSHOT-NONNEG-INT-1 (Q-3): a dashboard value is a count, a safe integer >= 0 (a negative, fractional or unsafe value fakes
 *  a delta or subtracts inexactly); anything else is `snapshot_invalid`, in both modes and both windows, never coerced. */
function isSnapshotCount(v: number): boolean { return Number.isSafeInteger(v) && v >= 0; }
