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
