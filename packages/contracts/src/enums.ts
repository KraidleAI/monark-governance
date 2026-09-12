/**
 * Single runtime source for the closed enums (ADR-M001 D5b/C7). The TS types are
 * DERIVED from these arrays, and the JSON Schemas are tested against them
 * (enums.test.ts), so the copies cannot drift silently. Closes G2 reserve M3.
 */

export const COVERAGE_REASONS = [
  "covered",
  "set_too_large",
  "interval_too_wide",
  "intent_not_in_region",
  "under_calib",
  "no_label_schema",
  "budget_exhausted",
  "clock_expired",
  "upstream_timeout",
  "attestation_absent",
  "attestation_refused",
  "binding_broken",
  "non_evaluable",
] as const;
export type CoverageReason = (typeof COVERAGE_REASONS)[number];

export const GATE_ACTIONS = ["commit", "defer", "abstain"] as const;
export type GateAction = (typeof GATE_ACTIONS)[number];

export const METHODS = ["split", "hac-cp"] as const;
export type Method = (typeof METHODS)[number];

/**
 * Narabi / AttestedFlow residual assumptions (ADR-M008 D3) — a CLOSED enum, stricter than
 * AttestedPrice's free-string `residual[]`: a residual outside this set is a fail-closed refusal, never
 * silent text. `attestor_silent`/`attestor_terminated` are bound to an OBSERVED 4xx/5xx (hashed in the
 * utterance), never to a missing field. Single runtime source; the JSON Schema enum is asserted identical
 * to it (enums.test.ts), so the two cannot drift.
 */
export const ATTESTED_FLOW_RESIDUALS = [
  "ap_capacity_unknown",
  "attestor_silent",
  "attestor_terminated",
  "primary_closed_weekend",
  "cross_venue_gap",
  "redeem_velocity_unexplained",
  "mint_wall",
] as const;
export type AttestedFlowResidual = (typeof ATTESTED_FLOW_RESIDUALS)[number];
