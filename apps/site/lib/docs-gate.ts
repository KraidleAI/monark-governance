// apps/site/lib/docs-gate.ts: the words of the gate page of the documentation (/docs/gate). PURE DATA, no import, like
// lib/how-copy.ts. The action words and the reason codes are NEVER spelled here as values: the page renders them from the
// frozen enum (lib/gate-enums.ts), by position for the actions and by code for the reasons. This module carries only the
// plain-English glosses and the chamber each reason belongs to in the one-decision schema. The root test
// test/site-docs.test.ts pins the reason keys to the frozen enum both ways, and scans every string digit-free, dash-free.

/** Index into the frozen action enum [commit, defer, abstain] (order pinned by the root test gate_action_enum_order_is_frozen). */
export const DOCS_ACTION_COMMIT = 0;
export const DOCS_ACTION_DEFER = 1;
export const DOCS_ACTION_ABSTAIN = 2;

/** One gloss per action, in the frozen enum order. */
export const ACTION_GLOSSES: readonly string[] = [
  "The intended act lies inside a region small enough to act on, and the budget the caller sent is not below the caller's floor. The act is authorized, and the budget comes back as it was sent.",
  "The region is too large to act on yet: the set holds every label, or the interval is too wide. While the decision window is open, the gate waits for a better reading. The budget is untouched.",
  "The gate states no region it stands behind: too few calibration points, an intent outside the region, a budget below the floor, a missing or refused testimony, a window that closed. It is an answer, with its reason, and it invents no success.",
];

/** The stage of the one-decision schema a reason code belongs to. */
export type Chamber = "input" | "calibrate" | "gate" | "act";

export interface ReasonDoc {
  readonly chamber: Chamber;
  /** Index into the frozen action enum: the answer this reason goes with. */
  readonly tone: number;
  readonly gloss: string;
}

/** Every frozen reason code, with its chamber, its answer and a plain gloss. Keyed by the code (not a contract field). */
export const REASON_DOCS: Readonly<Record<string, ReasonDoc>> = {
  covered: { chamber: "act", tone: DOCS_ACTION_COMMIT, gloss: "the intent lies in a region small enough to act on, and the budget is not below its floor" },
  set_too_large: { chamber: "gate", tone: DOCS_ACTION_DEFER, gloss: "the set holds every label: nothing is ruled out yet" },
  interval_too_wide: { chamber: "gate", tone: DOCS_ACTION_DEFER, gloss: "the interval is wider than the act can tolerate" },
  intent_not_in_region: { chamber: "gate", tone: DOCS_ACTION_ABSTAIN, gloss: "the intended act lies outside what the region allows" },
  under_calib: { chamber: "calibrate", tone: DOCS_ACTION_ABSTAIN, gloss: "too few calibration points to state a region at all" },
  no_label_schema: { chamber: "calibrate", tone: DOCS_ACTION_ABSTAIN, gloss: "the task declares no label schema to conform against" },
  budget_exhausted: { chamber: "gate", tone: DOCS_ACTION_ABSTAIN, gloss: "the budget the caller sent is below the caller's floor; no bar is lowered" },
  clock_expired: { chamber: "gate", tone: DOCS_ACTION_ABSTAIN, gloss: "the region was too large and the decision window has closed, so waiting is no longer an answer" },
  upstream_timeout: { chamber: "input", tone: DOCS_ACTION_ABSTAIN, gloss: "the upstream sensor or predictor did not answer in time" },
  attestation_absent: { chamber: "input", tone: DOCS_ACTION_ABSTAIN, gloss: "a class that requires a testimony received none" },
  attestation_refused: { chamber: "input", tone: DOCS_ACTION_ABSTAIN, gloss: "the verifier refused the testimony: a hash or a signature did not hold" },
  binding_broken: { chamber: "input", tone: DOCS_ACTION_ABSTAIN, gloss: "the prediction is not bound to the testimony it claims" },
  non_evaluable: { chamber: "input", tone: DOCS_ACTION_ABSTAIN, gloss: "the input cannot be evaluated against the contract at all" },
};

/** The stages of the one-decision schema, in order, with their title. */
export const CHAMBERS: readonly { key: Chamber; title: string; blurb: string }[] = [
  { key: "input", title: "Read the input", blurb: "Origin and bytes ride along as named residuals. Never truth." },
  { key: "calibrate", title: "Calibrate", blurb: "Nonconformity scores, then a quantile, then a region at the target coverage." },
  { key: "gate", title: "Decide", blurb: "The region and the budget the caller carries give exactly one answer." },
  { key: "act", title: "Act", blurb: "Executes on commit only. The gate never calls the tool itself." },
];

/** The closed policy, as the questions it asks, in its declared order of priority (packages/hikae/src/l3-gate.ts). Each
 *  question lists the reason codes a No leads to; the page renders the codes from the frozen enum after checking them. */
export const POLICY_STEPS: readonly { question: string; onNo: readonly string[] }[] = [
  { question: "Can the input be read, and did the upstream answer in time?", onNo: ["non_evaluable", "upstream_timeout"] },
  { question: "Does the class hold enough calibration points for a region?", onNo: ["under_calib"] },
  { question: "Does the intended act lie inside the region?", onNo: ["intent_not_in_region"] },
  { question: "Is the budget the caller sent at or above the caller's floor?", onNo: ["budget_exhausted"] },
  { question: "Is the region small enough to act on?", onNo: ["set_too_large", "interval_too_wide", "clock_expired"] },
];
