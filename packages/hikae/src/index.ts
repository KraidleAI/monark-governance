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
 *   s2              — S2 instrument (disposable harness, R-22 ; labelled fixtures).
 *
 * The code is our own; the Grok app is a design input, never lifted.
 */

// L1 — split conformal.
export { indicatorScore, indicatorScores, splitQuantile, conformalSet } from "./l1-split.ts";
export type { SplitResult } from "./l1-split.ts";

// L2 — monitor (no guarantee claimed).
export { imocpStep, arrivedErrors, remainingBudget, budgetAt } from "./l2-monitor.ts";
export type { Miscover } from "./l2-monitor.ts";

// L3 — deferred gate.
export { gate, GATED_TOOLS } from "./l3-gate.ts";
export type { GateInput, GatedTool } from "./l3-gate.ts";

// Region constructors (M5 invariant owner = Lot H, D9/C4).
export {
  buildIntervalRegion,
  buildSetRegion,
  BTC_DIR_LABEL_SCHEMA,
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
