// apps/site/lib/ukemi-copy.ts — the explanatory copy of /ukemi (temps 1: method + honest served state,
// investor decisions 51/123/126, G0 docs/G0-lot-site-release-1.md §18/B).
//
// PORTABILITY (mirrors lib/fleet.ts:20-21): Pure data — NO React/Next import — so the ROOT test can import
// it under node:test (nodenext) AND scripts/assert-fleet-html.mjs can dynamically import it at build time to
// derive the sentences it asserts on the rendered /ukemi body. Erasable-syntax only (const/interface/type):
// Node's type-stripping loads this module in assert-fleet-html.mjs main().
//
// TWO REGISTERS live here, kept apart on purpose (G0 §6.3, checkpoint-1 C-2):
//   (1) The FOUR SERVED constants, BYTE-IDENTICAL to apps/harness/src/tools/gate.ts (the single source of
//       truth for the served text). The root test site_ukemi_copy_equals_served_liq_text imports BOTH modules
//       and asserts equality; the A-9 mutant (site_ukemi_served_text_never_interval) replays the "interval"
//       injection on EACH of the four. LIQ_REQUIREMENTS_SENTENCE is DELIBERATELY OMITTED from the carried set
//       (it says "alpha = 0.01, nMin = 100" — digits — and temps 1 is digit-free, Q-5a); the closed set is 4.
//   (2) The EXPLANATORY PROSE (hero, is/is-not, method, limits, served-state framing). All DIGIT-FREE and
//       ASCII (the numeric-hole scan of the rendered <main> must be 0; F-2). This is honest restatement, not
//       the served constant: the byte-identical anchor is register (1).
//
// WHICH SERVED CONSTANTS RENDER (G0 §3.1/§7, C-1): only the two DIGIT-FREE ones ride in the body —
// LIQ_EMPTY_REGISTRY_SENTENCE (the temps-1 served state: the registry is empty ⇒ under_calib) and
// LIQ_CONDITIONAL_SENTENCE (the "which the gate does not check" clause). LIQ_UPPER_BOUND_SENTENCE ("...is 0
// by construction...") and LIQ_H3_SENTENCE ("...the H-3 exchangeability check...") carry DIGITS ("0", "H-3")
// and are therefore CARRIED here but NEVER RENDERED at temps 1 — a negative carrier in the root test forbids
// {LIQ_UPPER_BOUND_SENTENCE}/{LIQ_H3_SENTENCE} in the component. They ride live at U-4b-2b (calibration
// committed), never sooner.

/* ─────────────────────────── route (single source) ─────────────────────────── */
export const UKEMI_ROUTE = "/ukemi";

/* ─────────────────────────── (1) SERVED constants — BYTE-IDENTICAL to gate.ts ─────────────────────────── */

/** BYTE-IDENTICAL to apps/harness/src/tools/gate.ts LIQ_UPPER_BOUND_SENTENCE (:140-142). Carries "0" ⇒ NOT
 *  rendered at temps 1 (digit-free body); rides at U-4b-2b. Asserted equal by site_ukemi_copy_equals_served_liq_text. */
export const LIQ_UPPER_BOUND_SENTENCE =
  "a conformal upper bound on the liquidable amount for the calibrated class; the lower edge is 0 by " +
  "construction, not a calibrated bound; abstains (under_calib) outside it";

/** BYTE-IDENTICAL to gate.ts LIQ_H3_SENTENCE (:149-151). Carries "H-3" ⇒ NOT rendered at temps 1; rides at U-4b-2b. */
export const LIQ_H3_SENTENCE =
  "calibrated on one recorded episode; no coverage is claimed on any other event; the H-3 " +
  "exchangeability check is a report, a YES licenses nothing more";

/** BYTE-IDENTICAL to gate.ts LIQ_CONDITIONAL_SENTENCE (:156-158). Digit-free ⇒ RENDERED (carries the
 *  "which the gate does not check" clause that assertUkemiBody requires). */
export const LIQ_CONDITIONAL_SENTENCE =
  "the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH " +
  "account at the first crossing, which the gate does not check";

/** BYTE-IDENTICAL to gate.ts LIQ_EMPTY_REGISTRY_SENTENCE (:167-168). Digit-free ⇒ RENDERED as the temps-1
 *  served state, in a single {X} JSX child (C-1(b)). */
export const LIQ_EMPTY_REGISTRY_SENTENCE =
  "no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction";

/* ─────────────────────────── (2) explanatory prose — DIGIT-FREE, ASCII ─────────────────────────── */

/** A step in the method column (ordinal-free: the mockup "01 book"..."04 region" render digit-free, G0 §16.1). */
export interface MethodStep {
  readonly name: string;
  readonly title: string;
  readonly detail: string;
}
/** A declared limit card. */
export interface LimitCard {
  readonly title: string;
  readonly detail: string;
}

export const HERO_TITLE =
  "Eligible is not liquidated. Ukemi measures the difference and hands back a region, per stratum.";

export const HERO_DEK =
  "An attested measure of liquidation exposure on one lending venue: the lending book read at one declared " +
  "block, the oracle price path the protocol actually consulted, and a conformal region for the amount " +
  "liquidated, with its named residuals. Never a probability of being right.";

export const WHAT_LABEL = "what it is / what it is not";

export const IS_LIST: readonly string[] = [
  "A book at a block: every account holding the collateral and a debt, read at one declared reference " +
    "block, reduced to a digest anyone can recompute.",
  "A realized oracle path: the sequence of prices the protocol consulted over the window, recorded from " +
    "chain events, not a simulated market.",
  "A conformal region, per stratum: for a calibrated class, an upper bound on the amount realized, with " +
    "its named residuals. Never a probability.",
  "An abstention when it cannot know: too few calibration points for a population (under_calib), a read " +
    "without quorum, an account it cannot evaluate. The output is a named state, not a number.",
];

export const IS_NOT_LIST: readonly string[] = [
  "Not a forecast of the next price, and not a forecast that more liquidations will follow.",
  "Not a probability of liquidation for an account, and not a probability that a bound is right.",
  "Not a rating, a gauge or a ranking of a protocol, a market or an account.",
  "Not a risk parameter: it sets no threshold and no cap. A curator stays the curator.",
  "Not a claim about a new event: the measure is calibrated on one episode; exchangeability across events " +
    "is named, not assumed.",
];

export const SERVED_LABEL = "what is served";

/** Digit-free framing that precedes the SERVED empty-registry constant (rendered as a single {X} child). */
export const SERVED_STATE_LEAD =
  "The liquidation-eligible-coverage class is served through the gate. Until a calibration is committed, " +
  "the honest output is a named state:";

/** Digit-free restatement of the upper-bound method (NOT the served constant, which carries a digit). */
export const REGION_NOTE =
  "When a class holds enough calibration, the served region is a conformal upper bound on the amount " +
  "liquidated: an open floor by construction, not a calibrated bound. How far the bound reaches says " +
  "nothing about being right; a loose bound is a legitimate, informative answer.";

/** Digit-free lead that precedes the SERVED conditional constant (rendered as a single {X} child). */
export const CONDITIONAL_LEAD = "The bound is conditional, and the condition is stated, not hidden:";

export const COVERAGE_NOTE =
  "The strata, the coverage level and the minimum number of calibration points for a population are " +
  "written down before the run. A region is only ever emitted for a population that holds enough " +
  "calibration points; outside it the answer is under_calib, with the count. The largest-amount stratum " +
  "is expected to stay under_calib for a long time; the page will say so for as long as it is true.";

/** Schematic bar labels (rendered inside an aria-hidden bar; digit-free, ASCII — no graduation). */
export const BAR_UPPER_LABEL = "upper bound";
export const BAR_YHAT_LABEL = "y-hat";
export const BAR_FLOOR_LABEL = "open floor";

// Prose (NOT a per-state object with the gate action names as quoted keys): the frozen contract field names
// region and abstain must never be hard-coded as bare quoted literals in apps/site (root test
// frozen_contract_fields_stay_dynamic). The three outputs are named here as verbs inside sentences.
export const STATES_NOTE =
  "The gate has three outputs, and every one of them is an answer. It commits a region when the population " +
  "holds enough calibration points, emitted with its residuals. It defers, marked under_calib, when there " +
  "are too few points: the region is withheld and the count is published. It abstains when an input is " +
  "missing or disputed, with a typed reason.";

export const METHOD_LABEL = "method, each step recomputable";
export const METHOD_STEPS: readonly MethodStep[] = [
  {
    name: "book",
    title: "Read the book at the reference block",
    detail:
      "Holders of the collateral with a debt, the health factor as the protocol computes it. Two distinct " +
      "operators must agree, read by read.",
  },
  {
    name: "path",
    title: "Record the oracle path",
    detail:
      "The feed updates over the window, from chain events. The scenario is declared on this path, not on " +
      "an outside market price.",
  },
  {
    name: "label",
    title: "Join the realized labels",
    detail:
      "Per account, what was actually repaid and what deficit was left. Eligible and not liquidated counts " +
      "as nothing, and is kept.",
  },
  {
    name: "calibrate",
    title: "Calibrate, then emit",
    detail:
      "A split-conformal region per stratum at the pre-registered level. Too few points for a population: " +
      "under_calib, deferred. Missing input: an abstention, with the reason.",
  },
];

export const LIMITS_LABEL = "declared limits";
export const LIMITS: readonly LimitCard[] = [
  {
    title: "One venue, one collateral class",
    detail:
      "One lending venue, core market, single-collateral WETH accounts. An account holding any other " +
      "collateral is excluded and counted, non_evaluable. In the threshold recompute the other legs are " +
      "held at their book-block price: a declared limitation, not a repricing.",
  },
  {
    title: "Few episodes",
    detail:
      "Coverage holds per stratum, under exchangeability with the calibration episode. The distance to a " +
      "new event is named, never estimated away.",
  },
  {
    title: "Open questions stay open",
    detail:
      "The served-price delay seen in the design episode is unexplained. A small set of accounts is marked " +
      "non_evaluable until their category is read.",
  },
];
