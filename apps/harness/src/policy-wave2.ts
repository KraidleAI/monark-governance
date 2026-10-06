/**
 * Wave 2 admission of a kata band row from its counts, and the calib_parent chain of a table (lot CM-4a-ii-b, block B2 of
 * 1.1.0; docs/G0-lot-cm-4a-ii-b.md; ADR 0006 D1, D2, D6 and addendum 8 sections 1 and 4; A-2 section 2.2 points 4 to 6;
 * amendment A-1 point 4). The one seam of the guard to packages/hikae/src/tail.ts. Fails closed: throws on the first difference.
 */
import { canonicalJson, sha256Canonical, type PolicyRow } from "@monark/contracts";
import { adjacencyTailFromCounts, tailRank, TailCountsError, type AdjacencyCountsTail } from "@monark/hikae";

/** tail_frac pinned per horizon (ADR 0006 D2). */
export const W2_TAIL_FRAC: Readonly<Record<string, string>> = { "1h": "0.95", "4h": "0.90" };
/** Points of the CALIB-2 block (D6, 2022-10-01 to 2023-10-01) per horizon: the bound on n before any tail arithmetic (G2 of #135, m-2). */
export const W2_CALIB_N_MAX: Readonly<Record<string, number>> = { "1h": 8760, "4h": 2190 };
/** Points of the bridge (365 days), TEST-2 and FWD-2 (183 days each) blocks of D6 per horizon: the bound on n_test before any bound or veto (G2 of lot b, m-2). */
export const W2_BLOCK_N_MAX: Readonly<Record<"bridge" | "test" | "fwd", Readonly<Record<string, number>>>> = { bridge: W2_CALIB_N_MAX, test: { "1h": 4392, "4h": 1098 }, fwd: { "1h": 4392, "4h": 1098 } };

type Is = (ok: boolean, what: string) => void;

/**
 * Addendum 8 section 1 on a calibrated wave 2 band row (n, tail_frac and runs_level already pinned by the caller): tail_m
 * at most n - r; both tails recomputed by the exact null and equal byte for byte to the row's unreduced strings, a null
 * pair when m = 0; a TailCountsError is a named refusal of the row, never under_calib (G2 of #135, m-3). `reject`: either
 * tail at or below runs_level; `empty`: tail_m = 0 (an empty check 1 is no refusal, D2).
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
  is((r.tail_m ?? 0) <= r.n - rank, `has tail_m above n - r (r ${String(rank)})`);
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
    chain.sort((x, y) => x.calib_attempt - y.calib_attempt);
    chain.forEach((r, i) => {
      const p = chain[i - 1];
      const ok = r.calib_attempt === i + 1 && r.calib_attempt === (r.source.wave === 2 ? 2 : 1) && r.current === (i === chain.length - 1) && (p === undefined ? r.calib_parent === "none" : r.calib_parent === sha256Canonical(p) && CELL.every((k) => canonicalJson(r[k]) === canonicalJson(p[k])));
      if (!ok) throw new Error(`MONARK import guard: ${key} breaks the calib_parent chain at attempt ${String(r.calib_attempt)} (attempts 1..k without a gap, attempt 1 on wave 1 and 2 on wave 2, parent = digest of the previous row, same kata cell and factor table, only the last row current).`);
    });
  }
}
