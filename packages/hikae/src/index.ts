/**
 * HIKAE — Hikae Adaptive Conformal Control (HAC-CP) engine (Phase 1, ADR-M002).
 *
 * Chain: predictor → Prediction → HIKAE conformalizes → CoverageVerdict → GateDecision.
 *   L1 (l1-split)   — split conformal par classe, garantie type (i), score indicatif 0/1.
 *   L2 (l2-monitor) — MONITEUR IM-OCP (aucune garantie revendiquée, branche b, D4).
 *   L3 (l3-gate)    — politique COMMIT/DEFER/ABSTAIN, prédicat fermé (D5). Pas de trading (D0).
 *   region          — buildIntervalRegion (invariant M5, borné-ou-abstention), buildSetRegion.
 *   verdict         — assemblage CoverageVerdict (calib_digest par référence).
 *   predictor       — internal:momentum-4c, internal:oracle-didactique ; labelOf (D7/D8).
 *   s2              — instrument S2 (harnais jetable, R-22 ; fixtures étiquetées).
 *
 * Le code est le nôtre ; l'app Grok est un input de conception, jamais liftée.
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
