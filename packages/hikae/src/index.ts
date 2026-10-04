/**
 * HIKAE — Hikae Adaptive Conformal Control (HAC-CP) engine (Phase 1, ADR-M002).
 *
 * Chain: predictor → Prediction → HIKAE conformalizes → CoverageVerdict → GateDecision.
 *   L1 (l1-split)   — per-class split conformal, type-(i) guarantee, 0/1 indicator score.
 *   L2 (l2-monitor) — IM-OCP MONITOR (no guarantee claimed, branch b, D4).
 *   L3 (l3-gate)    — COMMIT/DEFER/ABSTAIN policy, closed predicate (D5). No trading (D0).
 *   region          — buildIntervalRegion (M5 invariant, bounded-or-abstention), buildSetRegion.
 *   verdict         — CoverageVerdict assembly (calib_digest by reference).
 *   predictor       — internal:momentum-4c, internal:oracle-didactique ; labelOf (D7/D8).
 *   s2              — S2 instrument (disposable harness ; labelled fixtures).
 *
 * The code is our own; the Grok app is a design input, never lifted.
 */

// L1 — split conformal.
export { indicatorScore, indicatorScores, splitQuantile, conformalSet, riskControlQuantile, scoresInDomain, splitRankExact, splitQuantileExact, riskControlRow } from "./l1-split.ts";
export type { SplitResult, RiskControlResult, ScoreDomain, RiskControlRow, RiskControlRowOptions } from "./l1-split.ts";

// Binomial core (worksite 2, lot L2-1): exact comparator, k*, n0, the upper bound U, four-decimal rounding, spend.
export { parseUnitDecimal, parseAlpha, parseTestDelta, binomCdfLeq, riskControlMaxExceedances, zeroErrorFloor, missUpperBound, ceilDecimal4, spendDelta } from "./binomial.ts";
export type { Ratio } from "./binomial.ts";

// L2 — monitor (no guarantee claimed).
export { imocpStep, arrivedErrors, remainingBudget, budgetAt } from "./l2-monitor.ts";
export type { Miscover } from "./l2-monitor.ts";

// L3 — deferred gate.
export { gate, GATED_TOOLS } from "./l3-gate.ts";
export type { GateInput, GatedTool } from "./l3-gate.ts";

// Region constructors (M5 invariant owner settled, D9/C4).
export {
  buildIntervalRegion,
  buildSetRegion,
  BTC_DIR_LABEL_SCHEMA,
  NUMERIC_LABEL_SCHEMA,
  BTC_DIR_LABELS,
} from "./region.ts";
export type { SetRegion, IntervalRegion, IntervalRegionResult, BtcDirLabel } from "./region.ts";

// Verdict assembly.
export { buildVerdict, underCalibVerdict, serialize } from "./verdict.ts";
export type { VerdictParams } from "./verdict.ts";

// Interval conformer (UKEMI regression, ADR-M003 D6.1) + synthetic class ukemi-liquidable-24h (D6.2).
export { conformInterval, absoluteResidualScores } from "./interval-conformer.ts";
export type { CalibPair, IntervalConformalParams, IntervalConformalResult } from "./interval-conformer.ts";
export {
  generateLiquidable24hPairs,
  liquidable24hProvenanceLine,
  LIQUIDABLE_24H_CLASS,
  LIQUIDABLE_24H_HARNESS,
  LIQUIDABLE_24H_ALPHA,
  LIQUIDABLE_24H_N,
  LIQUIDABLE_24H_NMIN,
} from "./liquidable-24h.ts";

// Predictors + labels (D7/D8).
export {
  MOMENTUM_4C_ID,
  ORACLE_DIDACTIQUE_ID,
  signDirection,
  labelOf,
  featureCloseAt,
  extractMomentumFeatures,
  momentum4c,
  oracleDidactique,
} from "./predictor.ts";
export type { Candle, Direction, MomentumFeatures } from "./predictor.ts";

// S2 instrument (disposable harness).
export {
  HARNESS_VERSION,
  mulberry32,
  generateLabeledSeries,
  strataOf,
  runSplitCampaign,
  demoStates,
  runMutants,
  generateCandleSeries,
  labeledFromPredictor,
} from "./s2/instrument.ts";
export type {
  LabeledPoint,
  Stratum,
  CampaignParams,
  CampaignResult,
  PointTrace,
  MutantOutcome,
  CandleGenParams,
  PredictorKind,
  PredictorRun,
} from "./s2/instrument.ts";
export { renderS2Report } from "./s2/report.ts";
export type { ReportInput } from "./s2/report.ts";
export { runS2, S2_DEFAULT } from "./s2/run.ts";
export type { S2Params, S2Output } from "./s2/run.ts";

// Quantile tracker (ADR-M009) — consumed out-of-tool by the sentinel (apps/sentinel/src/timeline.ts); no guarantee claimed here.
export { trackerInit, trackerStepSize, trackerStep, clipScore, trackerReplay, trackerDigest } from "./tracker.ts";
export type { TrackerParams, TrackerState } from "./tracker.ts";

// Runs diagnostic (worksite 2, lots L2-1r and L2-1r2): exact one-sided runs test on a time-ordered 0/1 sequence, balanced exceedance; import-guard input.
export { runsCount, runsLowerTailLeq, balancedExceedance } from "./runs.ts";
export type { Balanced, Bits, RunsTail } from "./runs.ts";

// Kata path, lot CM-3b (audit P3 S-4/E-1 engine side, E-2, S-13): scaled band [0, h*], F-7 row canonicalizer, ordered digest.
export { bandEdge, conformScaledBand } from "./scaled-band.ts";
export type { ScaledBand, ScaledBandOptions } from "./scaled-band.ts";
export { canonicalRow, orderedCalibDigest } from "./canonical-row.ts";
export type { RowValue } from "./canonical-row.ts";
