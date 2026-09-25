// apps/site/lib/ukemi-copy.ts — the explanatory copy of /ukemi (temps 1: method + honest served state).
//
// PORTABILITY (mirrors lib/fleet.ts:20-21): Pure data — NO React/Next import — so the ROOT test can import
// it under node:test (nodenext) AND scripts/assert-fleet-html.mjs can dynamically import it at build time to
// derive the sentences it asserts on the rendered /ukemi body. Erasable-syntax only (const/interface/type):
// Node's type-stripping loads this module in assert-fleet-html.mjs main().
//
// TWO REGISTERS live here, kept apart on purpose:
//   (1) The FOUR SERVED constants, BYTE-IDENTICAL to apps/harness/src/tools/gate.ts (the single source of
//       truth for the served text). The root test site_ukemi_copy_equals_served_liq_text imports BOTH modules
//       and asserts equality; the A-9 mutant (site_ukemi_served_text_never_interval) replays the "interval"
//       injection on EACH of the four. LIQ_REQUIREMENTS_SENTENCE is DELIBERATELY OMITTED from the carried set
//       (it says "alpha = 0.01, nMin = 100" — digits — and temps 1 is digit-free, Q-5a); the closed set is 4.
//   (2) The EXPLANATORY PROSE (hero, is/is-not, method, limits, served-state framing). All DIGIT-FREE and
//       ASCII (the numeric-hole scan of the rendered <main> admits no number outside the closed list of figures;
//       F-2). This is honest restatement, not the served constant: the byte-identical anchor is register (1).
//
// WHICH SERVED CONSTANTS RENDER: only the two DIGIT-FREE ones ride in the body —
// LIQ_EMPTY_REGISTRY_SENTENCE (the temps-1 served state: the registry is empty ⇒ under_calib) and
// LIQ_CONDITIONAL_SENTENCE (the "which the gate does not check" clause). LIQ_UPPER_BOUND_SENTENCE ("...is 0
// by construction...") and LIQ_H3_SENTENCE ("...the H-3 exchangeability check...") carry DIGITS ("0", "H-3")
// and are therefore CARRIED here but NEVER RENDERED — a negative carrier in the root test forbids
// {LIQ_UPPER_BOUND_SENTENCE}/{LIQ_H3_SENTENCE} in the component: their numbers are outside the closed list this page
// may show. A committed served state renders as LIQ_COMMITTED_STATE_NOTE, a digit-free restatement, then the figures
// of the committed stratum (calibration points, bound margin, calibration digest, and the day they were read), read
// from the two committed, hashed files by lib/ukemi-served-figures.ts, never typed: the labels that frame them here
// carry no digit.

/* ─────────────────────────── route (single source) ─────────────────────────── */
export const UKEMI_ROUTE = "/ukemi";
/** The course page (the hypothesis report of the calibration course, read from its committed, hashed copy). */
export const UKEMI_COURSE_ROUTE = "/ukemi/course";

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

/** A step in the method column (ordinal-free: the mockup "01 book"..."04 region" render digit-free). */
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

// Tense and scope follow the served state without branching: each sentence is true while the registry is empty AND
// once a stratum is committed (the served state itself rides per the synced served-state file: the served
// empty-registry sentence, or the committed restatement below; the file is bound to the harness registry by the root
// test). "attested" is not used before the book witness is served. No sentence promises residuals with the bound: the
// served verdict of this class carries an empty residual list by construction (no attestation is accepted for it), so a
// commit carries the region and the count, nothing more.
export const HERO_TITLE =
  "Eligible is not liquidated. Ukemi measures the difference; once a stratum is committed, the gate hands back an " +
  "upper bound on the amount liquidated, per stratum.";

export const HERO_DEK =
  "A measure of liquidation exposure on one lending venue: the lending book read at one declared block, the " +
  "oracle price path the protocol actually consulted, and, once a stratum is committed, a conformal upper bound " +
  "on the amount liquidated. Never a probability of being right.";

export const WHAT_LABEL = "what it is / what it is not";

export const IS_LIST: readonly string[] = [
  "A book at a block: every account holding the collateral and a debt, read at one declared reference " +
    "block and reduced to a digest.",
  "A realized oracle path: the sequence of prices the protocol consulted over the window, recorded from " +
    "chain events, not a simulated market.",
  "A conformal region, per stratum: for a calibrated class, an upper bound on the amount realized. Never a " +
    "probability.",
  "An abstention when it cannot know: too few calibration points for a population (under_calib), a read " +
    "without quorum, an account it cannot evaluate. The output is a named state, not a number.",
];

export const IS_NOT_LIST: readonly string[] = [
  "Not a forecast of the next price, and not a forecast that more liquidations will follow.",
  "Not a probability of liquidation for an account, and not a probability that a bound is right.",
  "Not a rating, a gauge or a ranking of a protocol, a market or an account.",
  "Not a risk parameter: it sets no threshold and no cap. A curator stays the curator.",
  "Not a claim about a new event: once a stratum is committed, its bound is calibrated on one episode; " +
    "exchangeability across events is named, not assumed.",
];

export const SERVED_LABEL = "what is served";

/** Digit-free framing that precedes the SERVED empty-registry constant (rendered as a single {X} child). */
export const SERVED_STATE_LEAD =
  "The liquidation-eligible-coverage class is served through the gate. Until a calibration is committed, " +
  "the honest output is a named state:";

// COMMITTED served state (the switch of the class): the served clause of a committed class carries figures (the zero
// lower edge, alpha, nMin, the H-3 name) outside the closed list of numbers /ukemi may show, so it is NOT rendered; the
// page says the state in the words below, never presented as the served text, then /ukemi shows the figures of the
// committed stratum, read from the two committed, hashed files. /, /fleet
// and /ukemi render it exactly while the committed, hashed, dated served-state file (apps/site/data/ukemi-served.json)
// says "committed", the empty-registry sentence exactly while it says "empty" (root tests: site-ukemi, site-build).
/** Digit-free framing that precedes the committed-state restatement. */
export const SERVED_COMMITTED_LEAD =
  "The liquidation-eligible-coverage class is served through the gate. In words, without the figures of the served " +
  "clause, the served state is:";
/** Digit-free restatement of the COMMITTED served state (not a served constant): it says only what that state serves. */
export const LIQ_COMMITTED_STATE_NOTE =
  "where a stratum's calibration is committed, the gate serves a conformal upper bound on the liquidable amount; on " +
  "every other stratum it abstains (under_calib)";

// The figures block of the committed branch (/ukemi only): these labels frame the figures of the committed stratum, which
// lib/ukemi-served-figures.ts reads from the served verdict and the course report and the page renders by property
// access. The labels carry no digit, so every number of that block is a figure of the closed list.
/** Lead of the figures block; the day the served verdict was read follows it. */
export const FIGURES_LEAD = "On the committed stratum, as read from the served gate on";
export const FIGURE_POINTS_LABEL = "calibration points";
export const FIGURE_MARGIN_LABEL = "bound margin";
/** Unit of the bound margin: the course report's unit label without its decimal count (the root test binds the two). */
export const BOUND_UNIT = "in the lending venue's oracle base currency";
export const FIGURE_MARGIN_NOTE = "the upper bound for a prediction in this stratum is the prediction plus this margin";
export const FIGURE_DIGEST_LABEL = "calibration digest";
/** What the served calibration digest is: only what the gate serves with it (the root test replays two answers). */
export const DIGEST_NOTE =
  "The calibration digest identifies the calibration points this bound is computed from; the gate returns it with " +
  "every answer on this stratum, so an answer can be matched to its calibration.";

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
  "calibration points; outside it the answer is under_calib, and for a stratum that is not committed the served " +
  "answer counts no calibration point. The largest-amount stratum is expected to stay under_calib for a long " +
  "time; the course page shows every stratum's measured count against its floor.";

/** The course pointer on /ukemi, split around its link (digit-free, count-free and true in both registry states). */
export const COURSE_POINTER_LEAD =
  "The hypothesis report of the calibration course on one recorded lending episode (pre-registered " +
  "outcomes, counts and digests) is on the";
export const COURSE_POINTER_LINK = "course page";
export const COURSE_POINTER_TAIL =
  ". Committing the strata that meet the floor to the served class is a separate, recorded step.";

/** Schematic bar labels (rendered inside an aria-hidden bar; digit-free, ASCII — no graduation). */
export const BAR_UPPER_LABEL = "upper bound";
export const BAR_YHAT_LABEL = "y-hat";
export const BAR_FLOOR_LABEL = "open floor";

// Prose (NOT a per-state object with the gate action names as quoted keys): the frozen contract field names
// region and abstain must never be hard-coded as bare quoted literals in apps/site (root test
// frozen_contract_fields_stay_dynamic). The three outputs are named here as verbs inside sentences.
// Mirrors the closed policy of the gate: too few calibration points is an ABSTENTION marked under_calib (never a
// deferral); a deferral waits only while the clock is open and the region is too wide to act on.
export const STATES_NOTE =
  "The gate has three outputs, and every one of them is an answer. It commits, with the region, when the " +
  "population holds enough calibration points and the request falls inside a region narrow enough to act on. " +
  "It defers while its clock is open and the region is too wide to act on. It abstains otherwise, with a typed " +
  "reason, for example: too few calibration points (under_calib: the region is withheld, and on a stratum that " +
  "is not committed the served answer counts no calibration point; the measured counts are on the course page), " +
  "a missing or disputed input, a request outside the region, an exhausted budget.";

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
      "A split-conformal upper bound per stratum at the pre-registered level. Too few points for a population: " +
      "an abstention marked under_calib; while the stratum is not committed the served answer counts no " +
      "calibration point, and its measured count is on the course page. Missing input: an abstention, with the reason.",
  },
];

export const LIMITS_LABEL = "declared limits";
export const LIMITS: readonly LimitCard[] = [
  {
    title: "One venue, one collateral class",
    detail:
      "One lending venue, core market, single-collateral WETH accounts. An account holding any other " +
      "collateral is excluded, marked non_evaluable. In the threshold recompute the other legs are " +
      "held at their book-block price: a declared limitation, not a repricing.",
  },
  {
    title: "Few episodes",
    detail:
      "Once a stratum is committed, its coverage holds only under exchangeability with the calibration " +
      "episode. The distance to a new event is named, never estimated away.",
  },
  {
    title: "Open questions stay open",
    detail:
      "The served-price delay seen in the design episode is unexplained; on the course episode the lag is " +
      "measured against a pre-registered bound, not explained. An account in another efficiency-mode category " +
      "is excluded, marked non_evaluable: whether that category covers the collateral cannot be checked off-line.",
  },
];
