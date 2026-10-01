/**
 * HIKAE L1 — per-task-class split conformal (ADR-M002 D3, type-(i) guarantee).
 *
 * DECLARED guarantee: marginal, finite-sample, UNDER exchangeability within
 * class κ; NO coverage conditional on x; NEVER `p_correct`.
 * Sources [lu] (our archives): `(n+1)` correction — Barber, Candes, Ramdas, Tibshirani,
 * *Predictive inference with the jackknife+*, AoS 2021, note 1 p.4 (hikae/lecture/
 * L6-jackknife-lei.md:103 ; R2-cp-distfree.md:218); marginal split-CP validity — Barber
 * et al. 2020, Thm 2.1 p.5 (R2-cp-distfree.md:40,85); partition/strata — Thm 4.1 p.11.
 * Score WITHOUT logits — Su et al. *API Is Enough* (VERDICT-TASKCLASS-GROK §1).
 *
 * Beachhead: INDICATOR score `s(x,ŷ)=0, s(x,other)=1` (k=1). At this score `q̂ ∈ {0,1}`:
 * `q̂=0 ⇒ C={ŷ}` (singleton), `q̂=1 ⇒ C={up,down}`. CP richness does not show
 * on a binary — it is calibrated silence, not a defect (GROK-DECORTICATION §2).
 */

import { missUpperBound, parseAlpha, parseTestDelta, riskControlMaxExceedances, zeroErrorFloor } from "./binomial.ts";

/** Indicator score k=1 (D3): 0 if `y === yhat`, 1 otherwise. */
export function indicatorScore(yhat: string, y: string): 0 | 1 {
  return y === yhat ? 0 : 1;
}

/** L1 result: either the conformal quantile, or fail-closed under-calibration. */
export type SplitResult = { qhat: number } | { reason: "under_calib" };

/**
 * Split conformal quantile (D3): `p = ceil((n+1)(1-alpha))`, `q̂` = p-th smallest
 * score. FAIL-CLOSED (never a silently clamped `+inf`): `n < nMin` OR `p > n`
 * ⇒ `under_calib` (no `q̂` produced).
 */
export function splitQuantile(
  scores: readonly number[],
  alpha: number,
  nMin: number,
): SplitResult {
  const n = scores.length;
  if (n < nMin) return { reason: "under_calib" };
  const p = Math.ceil((n + 1) * (1 - alpha));
  if (p > n) return { reason: "under_calib" };
  const sorted = [...scores].sort((a, b) => a - b);
  const q = sorted[p - 1];
  if (q === undefined) return { reason: "under_calib" }; // noUncheckedIndexedAccess guard
  return { qhat: q };
}

/** Risk-controlling result: the served value at rank n - kStar, or fail-closed under-calibration (no `qhat` key). */
export type RiskControlResult =
  | { readonly qhat: number; readonly rank: number; readonly kStar: number; readonly kObs: number; readonly missBound: string }
  | { readonly reason: "under_calib" };

/**
 * Risk-controlling quantile of a per-calibration row (worksite 2, lot L2-2; ADR draft 0004 v3.1 D2 and D3).
 * kStar = the largest k >= 0 with P(Bin(n, alpha) <= k) <= test_delta, decided in exact rationals (binomial.ts);
 * served rank = n - kStar; qhat = the rank-th smallest score (with ties, the order statistic at that rank);
 * kObs = the count of scores strictly above qhat (descriptive, kObs <= kStar); missBound = U(n, kStar, test_delta),
 * never computed from kObs (an atom at qhat lowers kObs, not the miss rate). FAIL-CLOSED `under_calib`: n < nMin,
 * n < n0 (zero misses do not meet the rule), a refused alpha or test_delta (binomial.ts parsers), a NaN score,
 * a nMin that is not an integer. `splitQuantile` is unchanged.
 */
export function riskControlQuantile(scores: readonly number[], alphaDec: string, deltaDec: string, nMin: number): RiskControlResult {
  const under: RiskControlResult = { reason: "under_calib" };
  const n = scores.length;
  if (!Number.isSafeInteger(nMin) || n < nMin) return under;
  if (scores.some((s) => Number.isNaN(s))) return under;
  try {
    parseAlpha(alphaDec);
    parseTestDelta(deltaDec);
  } catch {
    return under;
  }
  if (n < zeroErrorFloor(alphaDec, deltaDec)) return under;
  const kStar = riskControlMaxExceedances(n, alphaDec, deltaDec);
  const rank = n - kStar;
  const sorted = [...scores].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
  const qhat = sorted[rank - 1];
  if (qhat === undefined) throw new RangeError(`served rank ${String(rank)} outside 1..${String(n)}`);
  const kObs = scores.filter((s) => s > qhat).length;
  return { qhat, rank, kStar, kObs, missBound: missUpperBound(n, kStar, deltaDec) };
}

/**
 * Conformal set `C(x) = { y : s(x,y) <= qhat }` (D3). `scoresByLabel` carries the indicator
 * score of EVERY candidate label for this x; the Map's iteration order is
 * preserved (serialization determinism).
 */
export function conformalSet(
  scoresByLabel: ReadonlyMap<string, number>,
  qhat: number,
): string[] {
  const out: string[] = [];
  for (const [label, s] of scoresByLabel) {
    if (s <= qhat) out.push(label);
  }
  return out;
}

/**
 * Indicator scores for a given x: `s(x,ŷ)=0`, `s(x,other)=1` over the `labels` space,
 * preserving the order of `labels` (ordered Map).
 */
export function indicatorScores(
  yhat: string,
  labels: readonly string[],
): Map<string, number> {
  const m = new Map<string, number>();
  for (const y of labels) m.set(y, indicatorScore(yhat, y));
  return m;
}
