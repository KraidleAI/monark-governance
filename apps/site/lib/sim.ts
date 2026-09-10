// apps/site/lib/sim.ts — the ILLUSTRATIVE gate-policy simulation (ADR-M004 D15). COST, ALPHA, budget,
// AMBIENT and decide() are illustrative simulation parameters — NOT market figures, and NOT the real
// engine parameters (ADR-M003 K carries the real per-class alpha). This is a plain const/logic module:
// no JSX, no DOM, no node: imports, so it is client-safe AND, being non-rendered, never a test-44
// surface. Every number here (COST, ALPHA, the fresh() seeds, the AMBIENT readings, the timers' inputs)
// is a module constant, never a rendered literal — the sim is honest by construction (ADR-M004 D15).
//
// The three outcomes are represented by INDEX into the frozen gate-decision `action` enum
// [commit, defer, abstain] (order pinned by the C-9 root test). The third action doubles as a
// CoverageVerdict field name, so it is NEVER written as a string literal anywhere in apps/site — the
// client resolves it from the loaded enum (gate-enums.ts) by ACTION_ABSTAIN. commit/defer and the reason
// codes are not contract fields and are cited as plain literals.

/** Indices into the loaded `action` enum (gate-decision.schema.json); order pinned by root test C-9. */
export const ACTION_COMMIT = 0;
export const ACTION_DEFER = 1;
export const ACTION_ABSTAIN = 2;

/** Illustrative cost, in B_t, of one committed act (ADR-M004 D15 — not a market figure). */
export const COST = 0.15;
/** Illustrative target miscoverage level shown in the decision JSON (ADR-M004 D15; the real per-class
 *  value is ADR-M003 K, not this one). Coverage is one minus this level. */
export const ALPHA = 0.1;
/** Frozen contract version echoed as a VALUE in the illustrative decision JSON (not a field name). */
export const SCHEMA_VERSION = "1.0.0";
/** Ellipsis placeholder for a not-yet-decided field in the JSON view. */
export const ELLIPSIS = "…";
/** The C-5 illustrative caveat, rendered at EVERY sim mount (board / explainer / token). Kept here in the
 *  plain module so the R5 presence guard (test/ci-gates.test.ts) can import and assert its wording. */
export const CAVEAT = "An illustrative simulation of the gate policy — not market activity";
const EPSILON = 1e-9;
/** Newest-first cap on the visible decision log. */
const LOG_CAP = 6;

export type Intent = "up" | "down";
export type SimPhase = "idle" | "in" | "gate" | "out" | "done";

export interface AmbientInput {
  readonly reading: number;
  readonly spread: number;
  readonly intent: Intent;
}

// Auto-demo input sequence (illustrative). Readings/spreads become COMPUTED state, never rendered as
// literals; the only rendered strings are the intents ("up"/"down"), which carry no digit and are scanned
// by the numeric-hole test in test/ci-gates.test.ts.
export const AMBIENT: readonly AmbientInput[] = [
  { reading: 0.7, spread: 0.3, intent: "up" },
  { reading: 0.1, spread: 0.35, intent: "up" },
  { reading: 0.8, spread: 0.25, intent: "up" },
  { reading: -0.7, spread: 0.3, intent: "up" },
  { reading: -0.6, spread: 0.3, intent: "down" },
  { reading: 0.05, spread: 0.5, intent: "up" },
  { reading: 0.9, spread: 0.2, intent: "up" },
  { reading: 0.6, spread: 0.3, intent: "up" },
  { reading: -0.8, spread: 0.3, intent: "down" },
  { reading: 0.75, spread: 0.3, intent: "up" },
  { reading: 0.7, spread: 0.3, intent: "up" },
];

export interface SimInput {
  readonly reading: number;
  readonly spread: number;
  readonly intent: Intent;
  readonly timeout: boolean;
}

export interface Decision {
  /** Index into the loaded `action` enum (ACTION_COMMIT | ACTION_DEFER | ACTION_ABSTAIN). */
  readonly actionIndex: number;
  /** A reason code (a plain enum literal — not a contract field). */
  readonly reason: string;
  /** The coverage region labels, or null when there is no region (e.g. an upstream timeout). */
  readonly labels: readonly string[] | null;
}

export interface LogRow {
  readonly actionIndex: number;
  readonly reason: string;
  /** Budget after this decision, pre-formatted (a computed string, never a rendered literal). */
  readonly budget: string;
}

export interface SimState {
  readonly budget: number;
  readonly phase: SimPhase;
  /** null until the first decision of the epoch is applied. */
  readonly actionIndex: number | null;
  readonly reason: string | null;
  readonly labels: readonly string[] | null;
  readonly reading: number;
  readonly spread: number;
  readonly intent: Intent;
  readonly timeout: boolean;
  readonly epoch: number;
  readonly log: readonly LogRow[];
}

/** The initial per-epoch state (illustrative seeds). */
export function fresh(): SimState {
  return {
    budget: 1,
    phase: "idle",
    actionIndex: null,
    reason: null,
    labels: null,
    reading: 0.6,
    spread: 0.35,
    intent: "up",
    timeout: false,
    epoch: 1,
    log: [],
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
export function formatBudget(n: number): string {
  return n.toFixed(2);
}
export function formatSigned(n: number): string {
  return (n > 0 ? "+" : "") + n.toFixed(2);
}

/**
 * Pure illustrative gate policy. Returns the action by INDEX (never the third action as a literal) and a
 * reason code. The single-label branch reads the sign of the reading; the interval collapses to a set of
 * both labels when the reading is inside the calibration spread. COST is the illustrative per-commit cost.
 */
export function decide(state: SimState, input: SimInput): Decision {
  if (input.timeout) {
    return { actionIndex: ACTION_ABSTAIN, reason: "upstream_timeout", labels: null };
  }
  const single: Intent = input.reading > 0 ? "up" : "down";
  const labels: readonly string[] = Math.abs(input.reading) > input.spread ? [single] : ["up", "down"];
  if (labels.length > 1) {
    return { actionIndex: ACTION_DEFER, reason: "set_too_large", labels };
  }
  if (labels[0] !== input.intent) {
    return { actionIndex: ACTION_ABSTAIN, reason: "intent_not_in_region", labels };
  }
  if (state.budget < COST - EPSILON) {
    return { actionIndex: ACTION_ABSTAIN, reason: "budget_exhausted", labels };
  }
  return { actionIndex: ACTION_COMMIT, reason: "covered", labels };
}

/**
 * The "push" transition: apply a decision to the state, spending COST only on a commit. Pure — the client
 * hook drives the intermediate animation phases; this yields the settled post-decision state.
 */
export function applyDecision(state: SimState, input: SimInput, d: Decision): SimState {
  const spent = d.actionIndex === ACTION_COMMIT ? COST : 0;
  const budget = Math.max(0, round2(state.budget - spent));
  const row: LogRow = { actionIndex: d.actionIndex, reason: d.reason, budget: formatBudget(budget) };
  return {
    ...state,
    reading: input.reading,
    spread: input.spread,
    intent: input.intent,
    timeout: input.timeout,
    budget,
    actionIndex: d.actionIndex,
    reason: d.reason,
    labels: d.labels,
    phase: "out",
    log: [row, ...state.log].slice(0, LOG_CAP),
  };
}

/** Convenience: decide + apply in one step (used by the reduced-motion path that skips phases). */
export function push(state: SimState, input: SimInput): SimState {
  return applyDecision(state, input, decide(state, input));
}

/**
 * Build the illustrative GateDecision JSON string for the read-out. `actions` is the loaded enum; the
 * action word is resolved by INDEX (never a literal). Every object key is a bare identifier, so no frozen
 * contract field name is cited as a quoted literal. The numeric VALUES here (SCHEMA_VERSION, ALPHA,
 * remaining_budget, the task-class string) are the sim's illustrative output, rendered via a CALL
 * ({gateJson(...)}) — honest by construction (honesty-lint a8 + ADR-M004 D15 + the C-5 caveat).
 */
export function gateJson(state: SimState, actions: readonly string[]): string {
  const region = state.labels
    ? { kind: "set", labels: state.labels, label_schema: "up|down" }
    : null;
  const actionWord = state.actionIndex !== null ? actions[state.actionIndex] ?? ELLIPSIS : ELLIPSIS;
  const view = {
    schema_version: SCHEMA_VERSION,
    action: actionWord,
    allow: state.actionIndex === ACTION_COMMIT,
    tool: "perps_order_preview",
    intent: state.intent,
    verdict: region
      ? {
          task_class: "btc-dir-15m",
          method: "hac-cp",
          alpha: ALPHA,
          region,
          abstain: state.actionIndex === ACTION_ABSTAIN,
          reason: state.reason ?? ELLIPSIS,
          residual: ["assume:tls-notary", "assume:delegation"],
        }
      : ELLIPSIS,
    remaining_budget: round2(state.budget),
    reason: state.reason ?? ELLIPSIS,
  };
  return JSON.stringify(view, null, 2);
}

// ── Rendered-label data (covered by the numeric-hole scan in test/ci-gates.test.ts, C-4) ──────────────
export interface DiagramNode {
  readonly label: string;
  readonly y: number;
  readonly colorVar: string;
}

/** Sensor-lane labels for the flow diagram. Rendered via {property access}, so scanned by the
 *  numeric-hole test — none carries a digit. */
export const SENSOR_NODES: readonly DiagramNode[] = [
  { label: "Shōgen · attest", y: 70, colorVar: "var(--shogen)" },
  { label: "predictor · ŷ", y: 150, colorVar: "var(--ukemi)" },
  { label: "clock", y: 230, colorVar: "var(--ink2)" },
];

/** Output-lane geometry, positionally aligned with the loaded `action` enum [commit, defer, abstain].
 *  Labels come from the loaded enum (a prop), never from here. */
export const OUTPUT_LANES: readonly { readonly y: number; readonly colorVar: string }[] = [
  { y: 70, colorVar: "var(--ok)" },
  { y: 150, colorVar: "var(--defer)" },
  { y: 230, colorVar: "var(--abst)" },
];

/** Colour variable for a settled decision, chosen by action INDEX (parallel to OUTPUT_LANES). */
export function decisionColorVar(actionIndex: number | null): string {
  if (actionIndex === null) return "var(--ink2)";
  return OUTPUT_LANES[actionIndex]?.colorVar ?? "var(--ink2)";
}
