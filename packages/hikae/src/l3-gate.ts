/**
 * HIKAE L3 — deferred-commitment policy 控え (CLOSED predicate).
 *
 *   ABSTAIN  if parse non_evaluable | timeout | n<n_min | verdict under_calib | intent∉C | B_t<B_floor
 *            | (|C|>tau AND clock closed)          ← converted DEFER ⇒ clock_expired
 *   DEFER    if |C|>tau AND clock open
 *   COMMIT   if intent∈C, |C|<=tau, B_t>=B_floor
 *
 * Step 4 (contract 1.1.0): the
 * common ABSTAIN guard fires on `nCalib < nMin`, on a verdict without region, and on every no-region or `calib_*`
 * reason, with the verdict's reason (`under_calib` when that reason needs a region). A silent cell abstains, never defers.
 *
 * RETAINED clock reading (declared): the clock conditions ONLY the DEFER — an impossible
 * DEFER (clock closed) becomes ABSTAIN `clock_expired`; COMMIT has NO clock
 * condition (the COMMIT line of the predicate above, "intent∈C, |C|<=tau, B_t>=B_floor", has no clock term). This is the only
 * reading where the three predicate lines hold simultaneously. DEFER waits, ABSTAIN
 * refuses; PnL does not enter π.
 *
 * Reason priority order (declared, deterministic overlap):
 *   non_evaluable → upstream_timeout → non_evaluable (a non-finite numeric field) → step 4 (n<n_min, no region, no-region or calib_* reason) →
 *   intent_not_in_region → budget_exhausted → [ |C|>tau ? (clock ? DEFER:set_too_large : ABSTAIN:clock_expired)
 *                       : COMMIT:covered ].
 *   `interval` sub-path only: region_degenerate on lo>=hi (degenerate region), tested first, before budget.
 *
 * No order is sent from here: the gated tools
 * `perps_order_preview` / `perps_order_execute` are NAMED here but NEVER called (`decide` never calls `input.tool`).
 *
 * `interval` region (regression): dedicated path —
 *   ABSTAIN  if lo>=hi (zero-width / degenerate region ⇒ region_degenerate) — FIRST, before budget
 *   COMMIT   if intent ∈ [lo,hi] AND width (hi−lo) <= τ_interval
 *   DEFER    if width > τ_interval (clock open; otherwise ABSTAIN clock_expired)
 *   ABSTAIN  otherwise (intent ∉ [lo,hi]); + common upstream guards (parse/timeout/calib/budget).
 * `τ_interval` is DECLARED, UNFOUNDED: the caller sets it.
 */
import type { CoverageVerdict, GateDecision, GateAction, CoverageReason, PredictionRegion } from "@monark/contracts";
import { intentInRegion, REASONS_WITHOUT_REGION } from "@monark/contracts";

/** `interval` variant of the frozen region (regression), for the dedicated L3 path. */
type IntervalRegion = Extract<PredictionRegion, { kind: "interval" }>;

/** Gated market tools — NAMED, never invoked by HIKAE (neither real nor paper). */
export const GATED_TOOLS = ["perps_order_preview", "perps_order_execute"] as const;
export type GatedTool = (typeof GATED_TOOLS)[number];

/** Inputs of the L3 policy (already computed by L1/L2; every timestamp is injected upstream). */
export interface GateInput {
  intent: string | number | null;
  verdict: CoverageVerdict;
  /** B_t (L2 statistic) — remaining authorization capacity, never a yield. */
  remainingBudget: number;
  bFloor: number;
  /** Set-SIZE threshold for the `set` path (|C| <= tau ⇒ COMMIT). */
  tau: number;
  /**
   * WIDTH threshold for the `interval` path ((hi−lo) <= tauInterval ⇒ COMMIT). A quantity
   * DISTINCT from `tau` (a width in price units, not a cardinality) — DECLARED, UNFOUNDED
   * Required field; NOT frozen (GateInput is not one of the 4 frozen contracts).
   */
  tauInterval: number;
  nCalib: number;
  nMin: number;
  /** Is the coverage clock (decision window) still open? */
  clockOpen: boolean;
  /** Did the upstream (predictor) time out? ⇒ upstream_timeout, fail-closed. */
  timedOut: boolean;
  /** Is the ŷ parse evaluable? `false` ⇒ non_evaluable, fail-closed. */
  evaluable: boolean;
  /** The targeted gated tool (NAMED, never called — `gate` only copies it). */
  tool: string;
  schemaVersion: string;
  /** Digest of the request envelope as received (contract 1.1.0), written as `request_sha256`. */
  requestSha256: string;
}

interface Verdictum {
  action: GateAction;
  allow: boolean;
  reason: CoverageReason;
}

function decide(input: GateInput): Verdictum {
  const region = input.verdict.region;
  // Fail-closed upstream guards, COMMON to both region kinds: they were already the FIRST THREE
  // lines of the `set` path, so hoisting them before the branch is byte-neutral for `set`.
  if (!input.evaluable) return { action: "abstain", allow: false, reason: "non_evaluable" };
  if (input.timedOut) return { action: "abstain", allow: false, reason: "upstream_timeout" };
  // `x < NaN` and `x > NaN` are false, so a NaN in one of the six numeric fields would otherwise
  // reach COMMIT. A non-finite field abstains `non_evaluable` (the decision cannot be evaluated), before every other
  // numeric guard. The served harness already refuses these values upstream (validateHarnessParams, nCalib a length).
  if (!finiteFields(input)) return { action: "abstain", allow: false, reason: "non_evaluable" };
  // Step 4: `nCalib < nMin`, a verdict without region, and every no-region or `calib_*` reason
  // abstain with the verdict's reason (`under_calib` when that reason needs a region); a `calib_*` cell never defers.
  const noRegionReason = REASONS_WITHOUT_REGION.includes(input.verdict.reason);
  if (input.nCalib < input.nMin || region === null || noRegionReason) return { action: "abstain", allow: false, reason: noRegionReason ? input.verdict.reason : "under_calib" };

  // `interval` path (regression): its own declared order, in decideInterval.
  if (region.kind === "interval") return decideInterval(input, region);

  // `set` path (classification) — UNCHANGED: intent → budget → size.
  const setSize = region.labels.length;
  if (!intentInRegion(input.intent, region)) {
    return { action: "abstain", allow: false, reason: "intent_not_in_region" };
  }
  if (input.remainingBudget < input.bFloor) {
    return { action: "abstain", allow: false, reason: "budget_exhausted" };
  }
  if (setSize > input.tau) {
    // |C| > tau: DEFER if the clock is open, otherwise the DEFER converts to ABSTAIN.
    if (input.clockOpen) return { action: "defer", allow: false, reason: "set_too_large" };
    return { action: "abstain", allow: false, reason: "clock_expired" };
  }
  // intent∈C, |C|<=tau, B_t>=B_floor ⇒ COMMIT.
  return { action: "commit", allow: true, reason: "covered" };
}

/**
 * `interval` path. DECLARED order: degenerate region (`lo >= hi` ⇒ region_degenerate, a
 * zero-width/degenerate region, FIRST) → budget (fail-closed, takes precedence over DEFER — mirror of the
 * `set` path) → WIDTH (the DEFER is driven by the width, independently of the intent: literal reading
 * "DEFER if width > τ_interval, ABSTAIN otherwise") → intent. The DEFER obeys the module's clock
 * invariant (an impossible DEFER, clock closed, becomes ABSTAIN `clock_expired`).
 */
function decideInterval(input: GateInput, region: IntervalRegion): Verdictum {
  // A zero-width or inverted `interval` region reaching L3 — whatever its
  // provenance, INCLUDING one hand-built past `buildIntervalRegion` — NEVER commits. FIRST, before the
  // budget (priority region_degenerate > budget_exhausted, the declared order above). `>=` also captures `lo > hi`.
  if (region.lo >= region.hi) {
    return { action: "abstain", allow: false, reason: "region_degenerate" };
  }
  if (input.remainingBudget < input.bFloor) {
    return { action: "abstain", allow: false, reason: "budget_exhausted" };
  }
  const width = region.hi - region.lo;
  if (width > input.tauInterval) {
    if (input.clockOpen) return { action: "defer", allow: false, reason: "interval_too_wide" };
    return { action: "abstain", allow: false, reason: "clock_expired" };
  }
  if (!intentInRegion(input.intent, region)) {
    return { action: "abstain", allow: false, reason: "intent_not_in_region" };
  }
  // intent ∈ [lo,hi], width <= τ_interval, B_t >= B_floor ⇒ COMMIT.
  return { action: "commit", allow: true, reason: "covered" };
}

/**
 * L3 policy → `GateDecision` (frozen contract). The gate ONLY EMITS a decision;
 * it NEVER calls `input.tool` (it only copies it into the decision).
 */
export function gate(input: GateInput): GateDecision {
  const { action, allow, reason } = decide(input);
  return {
    schema_version: input.schemaVersion,
    action,
    allow,
    tool: input.tool,
    intent: input.intent,
    verdict: input.verdict,
    remaining_budget: input.remainingBudget,
    request_sha256: input.requestSha256,
    reason,
  };
}

/** True iff the six numeric fields read by `decide` are finite numbers. */
function finiteFields(input: GateInput): boolean {
  return [input.remainingBudget, input.bFloor, input.tau, input.tauInterval, input.nCalib, input.nMin].every((v) => Number.isFinite(v));
}
