/**
 * @monark/contracts — the frozen interface contracts of the MONARK fleet.
 * Source of truth: ../../schemas/*.json (language-neutral). ADR-M001.
 *
 * Pipeline:  predictor → Prediction → HIKAE conformalizes → CoverageVerdict → GateDecision
 * Upstream:  Shogen (AttestedPrice, a VERIFIED testimony).
 */

export type {
  Hex,
  Hex32,
  SemVer,
  IsoDateTime,
  Attestor,
  AttestedPrice,
  Prediction,
  CoverageReason,
  PredictionRegion,
  CoverageVerdict,
  GateAction,
  Method,
  GateDecision,
} from "./types.ts";

export { COVERAGE_REASONS, GATE_ACTIONS, METHODS } from "./enums.ts";

export { intentInRegion } from "./region.ts";
export { calibDigest } from "./calib-digest.ts";
export { FORBIDDEN_KEYS, findForbiddenKey, assertNoForbiddenKey } from "./forbidden-keys.ts";
export {
  ALLOWED_KEYS,
  assertClosedAttestedPrice,
  assertClosedPrediction,
  assertClosedCoverageVerdict,
  assertClosedGateDecision,
} from "./closed-check.ts";
export {
  serializeAttestedPrice,
  serializePrediction,
  serializeVerdict,
  serializeGateDecision,
} from "./serialize.ts";
