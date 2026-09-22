/**
 * Harness -- served Mondrian strata + the liquidation-eligible-coverage UPPER-BOUND region helper
 * (U-4b-2a; ADR-U4b D1/D3; decisions 108/126; checkpoint-1 C-5 + checkpoint-1 delta D-1/D-2).
 *
 * PURE, no I/O: this module imports ONLY the real HIKAE region constructor. It does NOT import the frozen
 * score reducer (scripts/census/u4b/u4b-scores.mjs), which reads node:fs and apps/sentinel -- importing that
 * here would break the side-effect-free property the K-8 scan protects for the tools. Instead the strata cuts
 * and strateOf are RE-DECLARED (pinned by VALUE) and DOUBLE-TESTED against the frozen originals
 * (u4b_served_strata_cuts_and_boundaries in the harness; u4b_served_strateof_matches_frozen_on_jsonl in the
 * sentinel -- checkpoint-1 C-5 / delta D-4).
 *
 * The server DERIVES the stratum from yhat (the caller never picks it, C-10). Cuts are base 8-dec integers,
 * exact as float64 (all < 2^53): {2000e8, 100k$, 1M$} -> k in {0, 1, 2, 3}.
 */
import { buildIntervalRegion } from "@monark/hikae";
import type { IntervalRegionResult } from "@monark/hikae";

/**
 * Served Mondrian strata cuts on yhat (base 8-dec), the mirror BY VALUE of the FROZEN STRATA_CUTS
 * (scripts/census/u4b/u4b-scores.mjs): [2000e8, 100k$, 1M$]. Numbers (not bigint): the served yhat is a JSON
 * number, refused unless a non-negative safe integer (gate.ts), and every cut is < 2^53, so the float64
 * comparison is exact. deepEqual-pinned by u4b_served_strata_cuts_and_boundaries and, by index against the
 * frozen bigint cuts, by u4b_served_strateof_matches_frozen_on_jsonl.
 */
export const STRATA_CUTS_SERVED: readonly number[] = [200000000000, 10000000000000, 100000000000000];

/**
 * Stratum of yhat: half-open [cut, next) intervals, left-closed exactly like the frozen strateOf. k = 0 if
 * yhat < 2000e8; 1 if [2000e8, 100k$); 2 if [100k$, 1M$); 3 if >= 1M$. The caller does not choose k (C-10).
 */
export function strateOf(yhat: number): number {
  let k = 0;
  for (const c of STRATA_CUTS_SERVED) {
    if (yhat < c) return k;
    k++;
  }
  return k;
}

/**
 * The SERVED region of the calibrated liquidation-eligible-coverage class: a conformal UPPER BOUND
 * [0, yhat + qhat] (decision 126: the calibration score is UNILATERAL max(Y - yhat, 0), so the calibrated
 * margin is a HIGH bound, NOT a symmetric interval [yhat - qhat, yhat + qhat]). The wire `region.kind` stays
 * "interval" (frozen contract, types.ts); "upper bound" is a property of the SERVED TEXT, never a new kind.
 *
 * qhat === 0 (delta D-2 / D-12, ADR-M011 NDG-1 under the upper-bound form): a stratum whose conformal qhat
 * is 0 calibrated NO high margin, so serving [0, yhat] would FABRICATE certainty (the true liquidable amount
 * would never exceed yhat). The symmetric stable-run region hits NDG-1 automatically at qhat = 0
 * (buildIntervalRegion(yhat, yhat) has lo === hi), but the upper-bound [0, yhat] has lo = 0 != hi = yhat for
 * yhat > 0, so NDG-1 no longer fires -- this helper closes that hole explicitly: qhat === 0 -> abstain
 * under_calib. Otherwise buildIntervalRegion(0, yhat + qhat) REUSES the finiteness / M5 / NDG-1 guards
 * (yhat + qhat === 0 -> lo === hi === 0 -> under_calib). Pure; delegates every bound invariant to HIKAE.
 */
export function liqUpperBoundRegion(yhat: number, qhat: number): IntervalRegionResult {
  if (qhat === 0) {
    return { abstain: true, reason: "under_calib" };
  }
  return buildIntervalRegion(0, yhat + qhat);
}
