/**
 * HIKAE — Hikae Adaptive Conformal Control (HAC-CP) engine.
 *
 * Chain: predictor → Prediction → HIKAE conformalizes → CoverageVerdict → GateDecision.
 *   L1 (l1-split)   — per-class split conformal, type-(i) guarantee, 0/1 indicator score.
 *   L2 (l2-monitor) — IM-OCP MONITOR (no guarantee claimed).
 *   L3 (l3-gate)    — COMMIT/DEFER/ABSTAIN policy, closed predicate. No trading.
 *   region          — buildIntervalRegion (lo <= hi invariant, bounded-or-abstention), buildSetRegion.
 *   verdict         — CoverageVerdict assembly (scores_sha256 over the declared order; verdict without region).
 *   predictor       — internal:momentum-4c, internal:oracle-didactique ; labelOf.
 *   s2              — S2 instrument (disposable harness ; labelled fixtures).
 *
 * The code is our own.
 */

// L1 — split conformal.
export { indicatorScore, indicatorScores, splitQuantile, conformalSet, riskControlQuantile, scoresInDomain, splitRankExact, splitQuantileExact, riskControlRow, splitRankShortest, splitQuantileShortest } from "./l1-split.ts";
export type { SplitResult, RiskControlResult, ScoreDomain, RiskControlRow, RiskControlRowOptions } from "./l1-split.ts";

// Binomial core: exact comparator, k*, n0, the upper bound U, four-decimal rounding, spend.
export { parseUnitDecimal, parseAlpha, parseTestDelta, binomCdfLeq, riskControlMaxExceedances, zeroErrorFloor, missUpperBound, ceilDecimal4, spendDelta } from "./binomial.ts";
export type { Ratio } from "./binomial.ts";

// L2 — monitor (no guarantee claimed).
export { imocpStep, arrivedErrors, remainingBudget, budgetAt } from "./l2-monitor.ts";
export type { Miscover } from "./l2-monitor.ts";

// L3 — deferred gate.
export { gate, GATED_TOOLS } from "./l3-gate.ts";
export type { GateInput, GatedTool } from "./l3-gate.ts";

// Region constructors (the sole constructor of an interval region and its invariants).
export {
  buildIntervalRegion,
  scoreTestBand,
  buildSetRegion,
  BTC_DIR_LABEL_SCHEMA,
  NUMERIC_LABEL_SCHEMA,
  BTC_DIR_LABELS,
} from "./region.ts";
export type { SetRegion, IntervalRegion, IntervalRegionResult, BtcDirLabel } from "./region.ts";

// Verdict assembly.
export { buildVerdict, noRegionVerdict, underCalibVerdict, serialize } from "./verdict.ts";
export type { VerdictParams, VerdictCell, NoRegionParams } from "./verdict.ts";

// Interval conformer (regression) + the synthetic class ukemi-liquidable-24h.
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

// Predictors + labels.
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

// Quantile tracker: no consumer in this repository outside HIKAE's own tests; no guarantee claimed here.
export { trackerInit, trackerStepSize, trackerStep, clipScore, trackerReplay, trackerDigest } from "./tracker.ts";
export type { TrackerParams, TrackerState } from "./tracker.ts";

// Runs diagnostic: exact one-sided runs test on a time-ordered 0/1 sequence, balanced exceedance; import-guard input.
export { runsCount, runsLowerTailLeq, balancedExceedance } from "./runs.ts";
export type { Balanced, Bits, RunsTail } from "./runs.ts";

// Tail engine: tail indicator, exact adjacency upper tail from bits or from counts; import-guard input.
export { tailRank, tailExceedance, adjacencyUpperTail, adjacencyTailFromCounts, TailCountsError } from "./tail.ts";
export type { TailBit, TailCountsErrorCode, AdjacencyCountsTail, TailExceedance, AdjacencyTail } from "./tail.ts";

// Kata path: scaled band [0, h*], policy row canonicalizer, ordered digest.
export { bandEdge, conformScaledBand } from "./scaled-band.ts";
export type { ScaledBand, ScaledBandOptions } from "./scaled-band.ts";
export { canonicalRow, orderedCalibDigest } from "./canonical-row.ts";
export type { RowValue } from "./canonical-row.ts";

// Online tracking (step 6 of ROADMAP.md): the replay of a cell's evidence into the budget the gate reads, and its closed policy.
export { suiviDenBits, suiviReplay } from "./suivi/replay.ts";
export type { SuiviEvidence, SuiviReplay } from "./suivi/replay.ts";
export { assertSuiviPolicy, suiviPolicySha256 } from "./suivi/policy.ts";
export type { SuiviPolicy, BetsText, SuiviKey } from "./suivi/policy.ts";
export type { RefEvaluation, Outcome } from "./suivi/label.ts";
