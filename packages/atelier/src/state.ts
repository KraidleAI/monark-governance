/**
 * MONARK atelier — PURE STATE module (ADR-M002 D1; test 24 `atelier_state_oracle`).
 * No DOM, no network, no clock read: everything comes from a frozen `GateDecision` (the
 * `@monark/contracts` contract, never reimplemented). What the screen shows is recomputable from here.
 */
import type { GateDecision, CoverageVerdict } from "@monark/contracts";
import { assertClosedGateDecision } from "@monark/contracts";

/** Label window of the `btc-dir-15m` beachhead (ADR-M002 D8) — DECLARED parameter, minutes. */
export const LABEL_WINDOW_MIN = 15;

export type Decision = "COMMIT" | "DEFER" | "ABSTAIN";

export interface ClockView {
  /** "coverage before decision": timestamp of the verdict (the verdict precedes the decision). */
  readonly coverageAt: string;
  /** "label arrived at t+w": when the label of candle [t, t+w) becomes known — on fixture. */
  readonly labelAt: string;
}

export interface ShogenPanel {
  /** Residual attestation hypotheses, as carried by the verdict (never invented). */
  readonly residual: readonly string[];
  readonly taskClass: string;
}

export interface HikaePanel {
  readonly method: string;
  readonly alpha: number;
  readonly nCalib: number;
  readonly qhat: number | null;
  /** Region rendered as text: `{up}` / `{up,down}` / `[lo, hi]` / `—` if abstaining without a region. */
  readonly region: string;
  readonly reason: string;
  readonly abstain: boolean;
}

export interface UkemiPanel {
  /** Phase 1: the block is NOT wired to the atelier (a later merge) — we write it, we do not simulate it. */
  readonly status: "not-wired-phase1";
}

export interface AtelierState {
  readonly id: string;
  readonly decision: Decision;
  readonly allow: boolean;
  readonly reason: string;
  /** Intent as carried by the decision: label (set), number (interval) or `null` (none). */
  readonly intent: string | number | null;
  readonly tool: string;
  /** B_t remaining AFTER this decision (authorization capacity, never a yield). */
  readonly remainingBudget: number;
  readonly clocks: ClockView;
  readonly shogen: ShogenPanel;
  readonly hikae: HikaePanel;
  readonly ukemi: UkemiPanel;
}

function decisionOf(action: GateDecision["action"]): Decision {
  switch (action) {
    case "commit":
      return "COMMIT";
    case "defer":
      return "DEFER";
    case "abstain":
      return "ABSTAIN";
  }
}

function regionText(v: CoverageVerdict): string {
  const r = v.region;
  if (r === undefined || r === null) return "—";
  if (r.kind === "set") return `{${r.labels.join(", ")}}`;
  return `[${r.lo}, ${r.hi}]`;
}

/** Adds `minutes` to a UTC ISO; pure, without reading the clock. */
export function plusMinutes(iso: string, minutes: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) throw new Error(`invalid timestamp: ${iso}`);
  return new Date(t + minutes * 60_000).toISOString().replace(".000Z", "Z");
}

/** Builds the screen state of ONE frozen decision. Throws if the decision is not closed (contract). */
export function buildState(id: string, d: GateDecision): AtelierState {
  assertClosedGateDecision(d);
  const v = d.verdict;
  return {
    id,
    decision: decisionOf(d.action),
    allow: d.allow,
    reason: d.reason,
    intent: d.intent,
    tool: d.tool,
    remainingBudget: d.remaining_budget,
    clocks: { coverageAt: v.produced_at, labelAt: plusMinutes(v.produced_at, LABEL_WINDOW_MIN) },
    shogen: { residual: v.residual, taskClass: v.task_class },
    hikae: {
      method: v.method,
      alpha: v.alpha,
      nCalib: v.n_calib,
      qhat: typeof v.qhat === "number" ? v.qhat : null,
      region: regionText(v),
      reason: v.reason,
      abstain: v.abstain,
    },
    ukemi: { status: "not-wired-phase1" },
  };
}

/** Decision distribution (the root set oracle is 3/2/3/1 with `under_calib` counted separately). */
export function distribution(states: readonly AtelierState[]): {
  COMMIT: number;
  DEFER: number;
  ABSTAIN: number;
  under_calib: number;
} {
  const c = { COMMIT: 0, DEFER: 0, ABSTAIN: 0, under_calib: 0 };
  for (const s of states) {
    if (s.reason === "under_calib") c.under_calib += 1;
    else c[s.decision] += 1;
  }
  return c;
}
