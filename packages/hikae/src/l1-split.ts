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

import { missUpperBound, parseAlpha, parseTestDelta, riskControlMaxExceedances, spendDelta, zeroErrorFloor } from "./binomial.ts";

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

/*
 * CM-3a (ADR-CM chantier moteur, audit P3 E-4, E-5, E-6, E-12): additions for the kata path only. splitQuantile and
 * riskControlQuantile above are unchanged, byte for byte (rule R-2: the served BYO, USDe, liq and cascade paths call
 * splitQuantile; no served path calls riskControlQuantile).
 */

/** Score domain of a calibration row (E-4): "finite" refuses NaN and the infinities; "band" also refuses negative scores. */
export type ScoreDomain = "finite" | "band";

/** E-4: true iff every score is a finite number and, for "band", not below 0 (-0 passes). An empty row passes. */
export function scoresInDomain(scores: readonly number[], domain: ScoreDomain): boolean {
  return scores.every((s) => Number.isFinite(s) && (domain === "finite" || s >= 0));
}

/** Three-way comparator (E-5): -1, 0 or 1, never NaN, unlike `a - b` (Infinity - Infinity). */
const ascending = (x: number, y: number): number => (x < y ? -1 : x > y ? 1 : 0);

/** E-5: the split rank ceil((n + 1)(1 - alpha)) in integer arithmetic, alpha a decimal string (parseAlpha refusals throw). */
export function splitRankExact(n: number, alphaDec: string): number {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(`n must be a non-negative integer, got ${String(n)}`);
  const a = parseAlpha(alphaDec);
  return Number((BigInt(n + 1) * (a.den - a.num) + a.den - 1n) / a.den);
}

/**
 * E-5: split conformal quantile at the exact integer rank p = ceil((n + 1)(1 - alpha)) (splitRankExact), the scores
 * sorted by a three-way comparator. FAIL-CLOSED `under_calib`: n < nMin, a nMin that is not an integer, a refused alpha,
 * a score outside `domain` (default "finite": NaN and the infinities), p > n. splitQuantile (float rank) is unchanged.
 */
export function splitQuantileExact(scores: readonly number[], alphaDec: string, nMin: number, domain: ScoreDomain = "finite"): SplitResult {
  const under: SplitResult = { reason: "under_calib" };
  const n = scores.length;
  if (!Number.isSafeInteger(nMin) || n < nMin || !scoresInDomain(scores, domain)) return under;
  let p: number;
  try {
    p = splitRankExact(n, alphaDec);
  } catch {
    return under;
  }
  const q = [...scores].sort(ascending)[p - 1];
  return q === undefined ? under : { qhat: q };
}

/** Options of riskControlRow (E-4, E-6, E-12); every field is optional. */
export interface RiskControlRowOptions {
  /** Score domain (E-4), default "finite"; "band" for the scaled bands of the kata path. */
  readonly domain?: ScoreDomain;
  /** calib_attempt (E-12), 1 to 4, default 1; returned with the row. */
  readonly attempt?: number;
  /**
   * E-12 under amendment A-1: h + 1, h the count of NON-exempt recalibrations, an integer in 1..attempt, default attempt;
   * the test delta is spendDelta(base, spendIndex).
   */
  readonly spendIndex?: number;
  /** E-6: the score at which the region is the whole label space (1 for the indicator score of a direction cell). */
  readonly silenceAt?: number;
}

/** Fields shared by the served and the silent rows (E-6, E-12). */
interface RowCore {
  readonly qhat: number;
  readonly rank: number;
  readonly kStar: number;
  readonly kObs: number;
  /** CALIB misses: in silence, the scores at silenceAt (a direction cell: its errors); otherwise kObs. */
  readonly calibMisses: number;
  readonly attempt: number;
  readonly spendIndex: number;
  readonly testDelta: string;
}

/** riskControlRow result: a row with its bound, a silent row (no missBound, E-6), or fail-closed under-calibration. */
export type RiskControlRow =
  | (RowCore & { readonly silence: false; readonly missBound: string })
  | (RowCore & { readonly silence: true })
  | { readonly reason: "under_calib" };

/**
 * Risk-controlling quantile of one calibration row for the kata path: riskControlQuantile at the test delta
 * spendDelta(baseDelta, spendIndex) (E-12, amendment A-1; returned with spendIndex and the attempt), after the score
 * domain check (E-4), with the CALIB misses counted apart and a silence flag (E-6): silenceAt is the largest score of the
 * label space, so no score may exceed it; silence iff qhat >= silenceAt (then qhat = silenceAt and kObs is 0, while
 * calibMisses counts the scores at silenceAt). A silent row carries no missBound (it would describe a region that is not
 * served). FAIL-CLOSED `under_calib`: every refusal of riskControlQuantile, a score outside the domain, a refused attempt,
 * spendIndex or base delta, a non-finite silenceAt, a score above silenceAt.
 */
export function riskControlRow(scores: readonly number[], alphaDec: string, baseDeltaDec: string, nMin: number, options: RiskControlRowOptions = {}): RiskControlRow {
  const under: RiskControlRow = { reason: "under_calib" };
  const { domain = "finite", attempt = 1, silenceAt } = options;
  const spendIndex = options.spendIndex ?? attempt;
  if (!scoresInDomain(scores, domain)) return under;
  if (silenceAt !== undefined && (!Number.isFinite(silenceAt) || scores.some((s) => s > silenceAt))) return under;
  let testDelta: string;
  try {
    spendDelta(baseDeltaDec, attempt);
    if (!Number.isSafeInteger(spendIndex) || spendIndex < 1 || spendIndex > attempt) return under;
    testDelta = spendDelta(baseDeltaDec, spendIndex);
  } catch {
    return under;
  }
  const r = riskControlQuantile(scores, alphaDec, testDelta, nMin);
  if ("reason" in r) return under;
  const calibMisses = silenceAt !== undefined && r.qhat >= silenceAt ? scores.filter((s) => s >= silenceAt).length : r.kObs;
  const core = { qhat: r.qhat, rank: r.rank, kStar: r.kStar, kObs: r.kObs, calibMisses, attempt, spendIndex, testDelta };
  return silenceAt !== undefined && r.qhat >= silenceAt ? { ...core, silence: true } : { ...core, silence: false, missBound: r.missBound };
}
