/**
 * Wave 2 admission of a kata band row from its counts, and the calib_parent chain of a table (lot CM-4a-ii-b, block B2 of
 * 1.1.0; docs/G0-lot-cm-4a-ii-b.md; ADR 0006 D1, D2, D6 and addendum 8 sections 1 and 4; A-2 section 2.2 points 4 to 6;
 * amendment A-1 point 4; wave 2b: the mark and refusals of FORMAT-wave2b). The one seam of the guard to packages/hikae/src/tail.ts. Fails closed.
 */
import { canonicalJson, sha256Canonical, type PolicyRow } from "@monark/contracts";
import { adjacencyTailFromCounts, tailRank, TailCountsError, type AdjacencyCountsTail } from "@monark/hikae";

/** tail_frac pinned per horizon (ADR 0006 D2). */
export const W2_TAIL_FRAC: Readonly<Record<string, string>> = { "1h": "0.95", "4h": "0.90" };
/** Points of the CALIB-2 block (D6, 2022-10-01 to 2023-10-01) per horizon: the bound on n before any tail arithmetic (G2 of #135, m-2). */
export const W2_CALIB_N_MAX: Readonly<Record<string, number>> = { "1h": 8760, "4h": 2190 };
/** Points of the bridge (365 days), TEST-2 and FWD-2 (183 days each) blocks of D6 per horizon: the bound on n_test before any bound or veto (G2 of lot b, m-2). */
export const W2_BLOCK_N_MAX: Readonly<Record<"bridge" | "test" | "fwd", Readonly<Record<string, number>>>> = { bridge: W2_CALIB_N_MAX, test: { "1h": 4392, "4h": 1098 }, fwd: { "1h": 4392, "4h": 1098 } };
/** Points of the longest UTC civil quarter (92 days) per horizon: the bound on the n_test of a live:<k> retire, refused before any bound or veto (ADR 0006 addendum 9 point 5; R-a of ENGINE-ROW-RETIRE-PATH-1). */
export const LIVE_N_MAX: Readonly<Record<string, number>> = { "1h": 2208, "4h": 552 };

type Is = (ok: boolean, what: string) => void;

/**
 * Addendum 8 section 1 on a calibrated wave 2 band row (n, tail_frac and runs_level already pinned by the caller): tail_m at most
 * n - r, and misses at most tail_m (every miss is a tail point, W2-GUARD-MISSES-TAIL-1); both tails recomputed by the exact null and
 * equal byte for byte to the row's unreduced strings, a null pair when m = 0; a TailCountsError is a named refusal of the row, never
 * under_calib (G2 of #135, m-3). `reject`: either tail at or below runs_level; `empty`: tail_m = 0 (an empty check 1 is no refusal, D2).
 */
export function wave2Admission(r: PolicyRow, is: Is): { reject: boolean; empty: boolean } {
  const exact = <T>(f: () => T): T => {
    try {
      return f();
    } catch (e) {
      is(!(e instanceof TailCountsError), `has counts the exact null of D2 refuses (${e instanceof TailCountsError ? e.code : ""})`);
      throw e;
    }
  };
  const rank = exact(() => tailRank(r.n, r.tail_frac ?? ""));
  is((r.tail_m ?? 0) <= r.n - rank, `has tail_m above n - r (r ${String(rank)})`); is(r.tail_m === null || (r.misses ?? 0) <= r.tail_m, `has misses above tail_m (misses ${String(r.misses)}, tail_m ${String(r.tail_m)}): qhat is at or above the tail threshold (n - k_star >= r), so every miss is a tail point`);
  const pair = (m: number | null, a: number | null): AdjacencyCountsTail => exact(() => adjacencyTailFromCounts(r.n, m ?? -1, a ?? -1, r.runs_level ?? ""));
  const t = pair(r.tail_m, r.tail_a);
  const c = pair(r.misses, r.miss_adj_a);
  const strings = (x: AdjacencyCountsTail): [string | null, string | null] => (x.empty ? [null, null] : [x.num, x.den]);
  is(canonicalJson([r.tail_tail_num, r.tail_tail_den, r.miss_adj_tail_num, r.miss_adj_tail_den]) === canonicalJson([...strings(t), ...strings(c)]), "has tail strings off the unreduced exact tails (a reduced tail is refused; m = 0 carries a null pair)");
  return { reject: (!t.empty && t.reject) || (!c.empty && c.reject), empty: t.empty };
}

const CELL = ["kata_id", "w", "venue", "symbol", "horizon", "side", "bucket", "thresholds", "scale_table"] as const;

/**
 * A-1 point 4 on the per-calibration rows of a table: per cell, attempts 1..k without a gap, attempt 1 on wave 1 and 2 on
 * wave 2 (D1; G2 of lot b, B-1); the calib_parent of attempt j >= 2 is the digest of the canonical writing of row j - 1 as
 * written in the table, current false (the policy_row_sha256 digest; declared reading, G2 of lot b, m-1); the same kata cell
 * and factor table as the parent (D1); only the last attempt is current (spec section 10).
 */
export function guardCalibChain(rows: readonly PolicyRow[]): void {
  const cells = new Map<string, PolicyRow[]>();
  for (const r of rows) if (r.statement === "per-calibration") cells.set(`${r.task_class} ${r.cell_key}`, [...(cells.get(`${r.task_class} ${r.cell_key}`) ?? []), r]);
  for (const [key, chain] of cells) {
    chain.sort((x, y) => x.calib_attempt - y.calib_attempt); wave2bCell(key, chain);
    chain.forEach((r, i) => {
      const p = chain[i - 1];
      const ok = r.calib_attempt === i + 1 && r.calib_attempt === (isWave2b(r) ? 1 : (r.source.wave === 2 ? 2 : 1)) && r.current === (i === chain.length - 1) && (p === undefined ? r.calib_parent === "none" : r.calib_parent === sha256Canonical(p) && CELL.every((k) => canonicalJson(r[k]) === canonicalJson(p[k])));
      if (!ok) throw new Error(`MONARK import guard: ${key} breaks the calib_parent chain at attempt ${String(r.calib_attempt)} (attempts 1..k without a gap, attempt 1 on wave 1 and 2 on wave 2, parent = digest of the previous row, same kata cell and factor table, only the last row current).`);
    });
  }
}

/** The source.registry_file of every wave 2b row: the pinned wave3.json that the wave 2b format names (its section « Admission at the guard »); its pins are the table's, held as for every registry (policy-guard.ts, source off the pins). */
export const W2B_REGISTRY_FILE = "wave3.json";
/** The wave 2b mark: a wave 2 row of the pinned wave3.json. */
export const isWave2b = (r: PolicyRow): boolean => r.source.wave === 2 && r.source.registry_file === W2B_REGISTRY_FILE;
/** The base test_delta of a wave 2b row, its only attempt (addendum 2 rules 3 and 4): exact strings, null off 1h and 4h. */
export const w2bDelta = (h: string | null): string | null => (h === "1h" ? "0.025" : h === "4h" ? "0.05" : null);
/** The window of a wave 2b estimator (FORMAT-wave2b, "The window W"), by explicit comparisons: no lookup in an object, whose prototype a kata_id could name. */
const w2bWindow = (k: string | null, w: number | null, h: string | null): boolean =>
  k === "ewma-vol-sp-v1" ? w === 101 : k === "har-rv15-sp-v1" ? w === (h === "1h" ? 168 : 42) : k === "garch11-sf-sp-v1" && w !== null && w >= 1 && w <= (h === "1h" ? 720 : 180);

/**
 * The wave 2b refusals 1 to 4 of the format (section « Admission at the guard »), on a wave 2 row, before any other wave 2 check. 1: the
 * columns agree with the mark: a wave 2b row has scale_table kind us-profile and a fit_sha256, a core row neither. 2: attempt 1, initial,
 * none, the base test_delta of the horizon (n_min, k_star and miss_bound are held at it by the guard's own clauses). 3: one of the three
 * kata ids, w in its range. 4: 26 profile values at 1h, 14 at 4h, each above 0. Returns whether the row is a wave 2b row.
 */
export function wave2Mark(r: PolicyRow, is: Is): boolean {
  const b = isWave2b(r);
  is(b === (r.scale_table?.kind === "us-profile") && b === (r.fit_sha256 !== null), `is a wave 2 row whose columns disagree with its mark: a row of the pinned ${W2B_REGISTRY_FILE} (wave 2b) has scale_table kind us-profile and a fit_sha256; without that mark the guard admits wave 2 core band rows only, with neither`);
  if (!b) return false;
  is(r.calib_attempt === 1 && r.calib_cause === "initial" && r.calib_parent === "none" && r.test_delta !== null && r.test_delta === w2bDelta(r.horizon), "is a wave 2b row off attempt 1 (calib_attempt 1, calib_cause initial, calib_parent none) or off the base test_delta of its horizon (0.025 at 1h, 0.05 at 4h): a later attempt of a wave 2b cell needs its own format");
  is(w2bWindow(r.kata_id, r.w, r.horizon), "is a wave 2b row whose kata_id is not one of the three wave 2b estimators or whose w is off its estimator (101; 168 at 1h and 42 at 4h; 1 to 720 at 1h and 1 to 180 at 4h)");
  const v = r.scale_table?.values ?? [];
  is(v.length === (r.horizon === "1h" ? 26 : 14) && v.every((x) => x !== null && x > 0), "is a wave 2b row whose scale_table does not have 26 values at 1h or 14 at 4h, each a number above 0");
  return true;
}

/** Refusal 6 of the wave 2b format, on the rows of one cell sorted by attempt: a cell of a wave 2b row holds that row only, current (a later attempt of a wave 2b cell needs its own format). */
function wave2bCell(key: string, chain: readonly PolicyRow[]): void {
  if (chain.some(isWave2b) && (chain.length !== 1 || chain[0]?.current !== true)) throw new Error(`MONARK import guard: ${key} is a wave 2b cell with more than one attempt, or whose attempt 1 is not current while it is the only one (a later attempt of a wave 2b cell needs its own format).`);
}
