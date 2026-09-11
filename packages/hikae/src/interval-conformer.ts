/**
 * HIKAE — REGRESSION `interval` conformer (ADR-M003 D6.1; owner settled, D9/C4).
 *
 * Absolute-residual split conformal, for UKEMI's NUMERIC `Prediction` (liquidable amount,
 * class `ukemi-liquidable-24h`): from calibration pairs `(ŷ_i, y_i)`,
 *   - score `s_i = |y_i − ŷ_i|` (absolute residual);
 *   - `q̂` = ⌈(n+1)(1−α)⌉-th smallest score — REUSES `splitQuantile` (L1, l1-split.ts),
 *     the SOLE conformal-quantile implementation, NEVER rewritten here (shared fail-closed);
 *   - region `C(ŷ) = [ŷ − q̂, ŷ + q̂]` for the test point's prediction `ŷ`, via
 *     `buildIntervalRegion` (M5 invariant `lo ≤ hi` — trivially true since `q̂ ≥ 0`).
 *
 * DECLARED guarantee (inherited from L1): marginal, finite-sample coverage, UNDER exchangeability
 * within the class. NO conditional coverage, NEVER `p_correct`. The WIDTH judgment
 * (`(hi−lo) ≤ τ_interval` ⇒ COMMIT, else DEFER) belongs to L3 (l3-gate.ts), not to the conformer:
 * this module produces only the region and the `covered` verdict.
 *
 * Under-calibration (`n < nMin` or `⌈(n+1)(1−α)⌉ > n`): fail-closed via `underCalibVerdict` — the
 * SAME frozen literal as L1 (EMPTY `set` region, `abstain=true`, `qhat=null`, `reason=under_calib`);
 * we invent neither reason nor region, we never silently clamp a `q̂`.
 */
import type { CoverageVerdict } from "@monark/contracts";
import { splitQuantile } from "./l1-split.ts";
import { buildIntervalRegion } from "./region.ts";
import { buildVerdict, underCalibVerdict } from "./verdict.ts";

/** One calibration pair: prediction `ŷ_i` and realization `y_i` (amounts, finite numbers). */
export interface CalibPair {
  readonly yhat: number;
  readonly y: number;
}

export interface IntervalConformalParams {
  readonly calib: readonly CalibPair[];
  /** Prediction `ŷ` of the TEST POINT to conform (center of the region). */
  readonly yhat: number;
  readonly alpha: number;
  readonly nMin: number;
  readonly taskClass: string;
  readonly residual: readonly string[];
  readonly producedAt: string;
  readonly schemaVersion: string;
  /** Carry the scores on the wire (optional payload); off by default (recomputed via calib_digest). */
  readonly includeScores?: boolean;
}

export interface IntervalConformalResult {
  readonly verdict: CoverageVerdict;
  readonly qhat: number | null;
  readonly region: { readonly lo: number; readonly hi: number } | null;
}

/** Absolute-residual scores `s_i = |y_i − ŷ_i|` (ADR-M003 D6.1), in pair order. */
export function absoluteResidualScores(calib: readonly CalibPair[]): number[] {
  return calib.map((c) => Math.abs(c.y - c.yhat));
}

function underCalib(params: IntervalConformalParams): IntervalConformalResult {
  return {
    verdict: underCalibVerdict({
      taskClass: params.taskClass,
      method: "split",
      alpha: params.alpha,
      scores: absoluteResidualScores(params.calib),
      residual: params.residual,
      producedAt: params.producedAt,
      schemaVersion: params.schemaVersion,
    }),
    qhat: null,
    region: null,
  };
}

/**
 * Conforms the numeric prediction `ŷ` into an `interval` region (or under-calibrated abstention).
 * Deterministic; no timestamp read (`producedAt` injected, hash stability).
 */
export function conformInterval(params: IntervalConformalParams): IntervalConformalResult {
  const scores = absoluteResidualScores(params.calib);
  const split = splitQuantile(scores, params.alpha, params.nMin); // q̂ = ⌈(n+1)(1−α)⌉-th sorted (L1)
  if ("reason" in split) return underCalib(params); // fail-closed: under-calibration

  const qhat = split.qhat;
  const ir = buildIntervalRegion(params.yhat - qhat, params.yhat + qhat); // q̂ ≥ 0 ⇒ lo ≤ hi (M5)
  if (ir.abstain) return underCalib(params); // non-finite bound (ŷ ±inf/NaN) — never reached if ŷ finite

  const verdict = buildVerdict({
    taskClass: params.taskClass,
    method: "split",
    alpha: params.alpha,
    scores,
    region: ir.region,
    qhat,
    abstain: false,
    reason: "covered",
    residual: params.residual,
    producedAt: params.producedAt,
    schemaVersion: params.schemaVersion,
    ...(params.includeScores ? { includeScores: true } : {}),
  });
  return { verdict, qhat, region: { lo: ir.region.lo, hi: ir.region.hi } };
}
