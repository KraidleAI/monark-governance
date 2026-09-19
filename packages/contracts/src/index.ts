/**
 * @monark/contracts — the frozen interface contracts of the MONARK fleet.
 * Source of truth: ../../schemas/*.json (language-neutral). ADR-M001.
 *
 * Pipeline:  predictor → Prediction → HIKAE conformalizes → CoverageVerdict → GateDecision
 * Upstream attestations:
 *   Shogen → AttestedPrice and Narabi → AttestedFlow are VERIFIED testimonies (emitted after Ok(Verdict));
 *   Ukemi → AttestedBook is a SELF-DECLARED book reading under a keyless RPC quorum — NO verifier (ADR-U1b).
 */

export type {
  Hex,
  Hex32,
  SemVer,
  IsoDateTime,
  Attestor,
  AttestedPrice,
  AttestedFlow,
  AttestedFlowResidual,
  AttestedBook,
  AttestedBookResidual,
  AttestedBookAbstainReason,
  Prediction,
  CoverageReason,
  PredictionRegion,
  CoverageVerdict,
  GateAction,
  Method,
  GateDecision,
} from "./types.ts";

export {
  COVERAGE_REASONS,
  GATE_ACTIONS,
  METHODS,
  ATTESTED_FLOW_RESIDUALS,
  ATTESTED_BOOK_RESIDUALS,
  ATTESTED_BOOK_ABSTAIN_REASONS,
} from "./enums.ts";

export { intentInRegion } from "./region.ts";
export { calibDigest } from "./calib-digest.ts";
export { FORBIDDEN_KEYS, findForbiddenKey, assertNoForbiddenKey } from "./forbidden-keys.ts";
export {
  ALLOWED_KEYS,
  assertClosedAttestedPrice,
  assertClosedAttestedFlow,
  assertClosedAttestedBook,
  assertClosedPrediction,
  assertClosedCoverageVerdict,
  assertClosedGateDecision,
} from "./closed-check.ts";
export {
  serializeAttestedPrice,
  serializeAttestedFlow,
  serializeAttestedBook,
  serializePrediction,
  serializeVerdict,
  serializeGateDecision,
} from "./serialize.ts";
