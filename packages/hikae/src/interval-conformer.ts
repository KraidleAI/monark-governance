/**
 * HIKAE — REGRESSION `interval` conformer (ADR-M003 D6.1; owner settled, D9/C4).
 *
 * Absolute-residual split conformal, for UKEMI's NUMERIC `Prediction` (liquidable amount,
 * class `ukemi-liquidable-24h`): from calibration pairs `(ŷ_i, y_i)`,
 *   - score `s_i = |y_i − ŷ_i|` (absolute residual);
 *   - `q̂` = ⌈(n+1)(1−α)⌉-th smallest score, exact rank — REUSES `splitQuantileShortest` (L1, B-12),
 *     the SOLE conformal-quantile implementation, NEVER rewritten here (shared fail-closed);
 *   - region `C(ŷ) = [ŷ − q̂, ŷ + q̂]` for the test point's prediction `ŷ`, via
 *     `buildIntervalRegion` (M5: `lo > hi` impossible since `q̂ ≥ 0`; NDG-1 ADR-M011: `q̂ = 0` — or
 *     float absorption `ŷ ± q̂ === ŷ` — ⇒ `lo === hi` ⇒ `region_degenerate` abstention (B-16; edges of the score test, B-13); a valid region is
 *     `lo < hi` STRICT, this module never emits a zero-width `covered`).
 *
 * DECLARED guarantee (inherited from L1): marginal, finite-sample coverage, UNDER exchangeability
 * within the class. NO conditional coverage, NEVER `p_correct`. The WIDTH judgment
 * (`(hi−lo) ≤ τ_interval` ⇒ COMMIT, else DEFER) belongs to L3 (l3-gate.ts), not to the conformer:
 * this module produces only the region and the `covered` verdict.
 *
 * Under-calibration (`n < nMin` or `⌈(n+1)(1−α)⌉ > n`): fail-closed via `underCalibVerdict` — the
 * SAME frozen literal as L1 (contract 1.1.0: `region: null`, `abstain=true`, `qhat=null`, `reason=under_calib`);
 * we invent neither reason nor region, we never silently clamp a `q̂`. The five cell fields are the caller's (`cell`).
 */
import type { CoverageVerdict } from "@monark/contracts";
import { splitQuantileShortest } from "./l1-split.ts";
import { scoreTestBand } from "./region.ts";
import { buildVerdict, noRegionVerdict, type VerdictCell } from "./verdict.ts";

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
  readonly cell: VerdictCell; // the five cell fields of the verdict (spec section 5), copied as given
  /** Carry the scores on the wire (optional payload); off by default (identified by scores_sha256). */
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

function underCalib(params: IntervalConformalParams, reason: "under_calib" | "region_degenerate" = "under_calib"): IntervalConformalResult {
  return {
    verdict: noRegionVerdict(reason, {
      taskClass: params.taskClass,
      method: "split",
      alpha: params.alpha,
      scores: absoluteResidualScores(params.calib),
      residual: params.residual,
      producedAt: params.producedAt,
      schemaVersion: params.schemaVersion,
      cell: params.cell,
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
  const split = splitQuantileShortest(scores, params.alpha, params.nMin); // q̂ at the exact rank ⌈(n+1)(1−α)⌉ (L1, B-12)
  if ("reason" in split) return underCalib(params); // fail-closed: under-calibration

  const qhat = split.qhat;
  const ir = scoreTestBand(params.yhat, qhat); // edges of the score test (B-13); lo<hi ⇒ q̂>0 ; converse FALSE under float absorption (M011 D1)
  if (ir.abstain) return underCalib(params, ir.reason); // non-finite bound (under_calib), OR zero width (region_degenerate, NDG-1 M011, B-16)

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
    cell: params.cell,
    ...(params.includeScores ? { includeScores: true } : {}),
  });
  return { verdict, qhat, region: { lo: ir.region.lo, hi: ir.region.hi } };
}
