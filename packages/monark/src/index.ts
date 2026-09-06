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
// Signature (two inputs) carried by the type annotation so the wiring shape stays documented and
// callers still typecheck against two params; the value takes no params (D9 ter §1: no unused vars,
// no rule suppression). The stub signature is NOT a frozen contract (ADR-M003 D4) and Lot I replaces it.
export const crossAgentGate: (price: AttestedPrice, prediction: Prediction) => GateDecision = () => {
  throw new Error(
    "MONARK cross-agent gate: not implemented in Phase 0 — integration is the Phase 2 milestone (ADR-M001).",
  );
};

export const MONARK_PHASE = "0-skeleton";
