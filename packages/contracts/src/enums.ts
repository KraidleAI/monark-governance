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

/**
 * AttestedBook residual assumptions (ADR-U1b D2ter) — a CLOSED enum, contract-specific (NOT the Shogen
 * assumptions registry, borrows no identifier from it). A residual outside this set is a fail-closed
 * refusal, never silent text. `no_third_party_verifier` is ALWAYS emitted (so `minItems:1` is never
 * vacuous, C-10): AttestedBook is a self-declared reading, no verifier runs. Single runtime source; the
 * JSON Schema enum is asserted identical to it (enums.test.ts). Extensible by ADR only (ADR-M008 D3 pattern).
 */
export const ATTESTED_BOOK_RESIDUALS = [
  "no_third_party_verifier",
  "oracle_price_as_read",
  "oracle_source_as_read",
  "rpc_quorum_2_keyless",
  "block_timestamp_not_submission",
  "emode_recompute_skipped",
] as const;
export type AttestedBookResidual = (typeof ATTESTED_BOOK_RESIDUALS)[number];

/**
 * AttestedBook `abstain.reason` (ADR-U1b D4) — a CLOSED enum that INCLUDES `null`. The coupling
 * `value ⇔ reason≠null` (fatal-only, D4 total witness) is enforced STRUCTURALLY by the frozen schema
 * (a `oneOf` on `abstain`), exercised in schema.test.ts (`attested_book_abstain_coupling`). `null` is
 * kept IN this runtime source (listed first) so the JSON Schema enum is asserted identical to it WITHOUT
 * any transformation (enums.test.ts), mirroring ATTESTED_FLOW_RESIDUALS.
 */
export const ATTESTED_BOOK_ABSTAIN_REASONS = [
  null,
  "no_quorum",
  "abi_mismatch",
  "unfinalized_block",
] as const;
export type AttestedBookAbstainReason = (typeof ATTESTED_BOOK_ABSTAIN_REASONS)[number];
