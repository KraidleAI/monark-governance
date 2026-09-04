import type { AttestedPrice, Prediction, CoverageVerdict, GateDecision } from "./types.ts";
import {
  assertClosedAttestedPrice,
  assertClosedPrediction,
  assertClosedCoverageVerdict,
  assertClosedGateDecision,
} from "./closed-check.ts";
import { assertNoForbiddenKey } from "./forbidden-keys.ts";

/**
 * Canonical serializers (ADR-M001 D7 / C8), one per contract — modelled on Grok's
 * `serializeVerdict`, extended to the fleet. Each runs the PRIMARY closed-check
 * then the recursive forbidden-key guard, then emits JSON. A contract carrying an
 * unknown or forbidden key at any depth THROWS instead of serializing.
 */

export function serializeAttestedPrice(v: AttestedPrice): string {
  assertClosedAttestedPrice(v);
  assertNoForbiddenKey(v);
  return JSON.stringify(v);
}

export function serializePrediction(v: Prediction): string {
  assertClosedPrediction(v);
  assertNoForbiddenKey(v);
  return JSON.stringify(v);
}

export function serializeVerdict(v: CoverageVerdict): string {
  assertClosedCoverageVerdict(v);
  assertNoForbiddenKey(v);
  return JSON.stringify(v);
}

export function serializeGateDecision(v: GateDecision): string {
  assertClosedGateDecision(v);
  assertNoForbiddenKey(v);
  return JSON.stringify(v);
}
