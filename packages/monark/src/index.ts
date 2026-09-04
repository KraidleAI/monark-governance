import type { AttestedPrice, Prediction, GateDecision } from "@monark/contracts";

/**
 * Cross-agent integration gate — STUB. Phase 0 freezes the WIRING SHAPE only;
 * no engine runs here.
 *
 * Phase 2 milestone (ADR-M001 §Phase 2, ROADMAP §4): a REAL Shogen `AttestedPrice`
 * → a HIKAE `CoverageVerdict` → this `GateDecision`, end-to-end, tested. That
 * end-to-end path IS the "the three agents work together" proof. The verdict/
 * budget (H5 B_t) attaches to MONARK, the single token (ADR-CERT-MONARK).
 */
export function crossAgentGate(_price: AttestedPrice, _prediction: Prediction): GateDecision {
  throw new Error(
    "MONARK cross-agent gate: not implemented in Phase 0 — integration is the Phase 2 milestone (ADR-M001).",
  );
}

export const MONARK_PHASE = "0-skeleton";
