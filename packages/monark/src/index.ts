/**
 * MONARK — the cross-agent integration layer (ADR-M003 D4 "crossAgentGate", ADR-M005 D3).
 *
 * `crossAgentGate` is the "the three agents work together" path, end-to-end and PURE:
 *   Shogen AttestedPrice (verified projection) + UKEMI Prediction (a numeric cascade amount) + a seeded
 *   GateContext  ->  HIKAE conforms the prediction into an `interval` region  ->  the frozen L3 gate()
 *   policy  ->  a closed `GateDecision`.
 * It composes the REAL HIKAE primitives (imported, never re-implemented) and never calls the named tool
 * (D0: MONARK gates, it does not trade). The four frozen contracts are unchanged (ADR-M003 D2).
 *
 * Signature (ADR-M003 D4): `crossAgentGate(price, prediction, ctx: GateContext)`. D4 sketches
 * GateContext = { calib, budget, clock } with an ILLUSTRATIVE comment and states it is NOT one of the
 * four frozen contracts; we COMPLETE it with the caller-carried params ADR-M005 D5 K-4d makes
 * authoritative (bFloor, nMin, tool, intent, clockOpen). The derived calibration state D4's comment
 * lists (n_calib, qhat, calib_digest) is RECOMPUTED here from the seeded pairs, never trusted as input.
 */
import { conformInterval, gate } from "@monark/hikae";
import type { CalibPair, GateInput } from "@monark/hikae";
import {
  assertClosedAttestedPrice,
  assertClosedPrediction,
  assertClosedGateDecision,
  assertNoForbiddenKey,
} from "@monark/contracts";
import type { AttestedPrice, Prediction, GateDecision } from "@monark/contracts";

/** Server-fixed contract version (K-4c) — NOT carried by the caller. */
const SCHEMA_VERSION = "1.0.0";

/**
 * Seeded calibration for the `interval` conformer (D4: a seeded GateContext calibration). The pairs
 * `(y_hat_i, y_i)` are the calibration data; scores `|y_i - y_hat_i|`, `q_hat`, `n_calib` and
 * `calib_digest` are RECOMPUTED by the conformer (the sole conformal-quantile implementation).
 */
export interface CalibrationState {
  readonly pairs: readonly CalibPair[];
  readonly alpha: number;
  readonly nMin: number;
}

/** B_t and the thresholds (D4 budget = { B_t, tau }; `floor` = B_floor, caller-carried per M005 K-4d). */
export interface BudgetState {
  /** B_t — remaining conformal authorization capacity (never a yield). */
  readonly remaining: number;
  readonly floor: number;
  /** tau — the `interval` WIDTH threshold (also the `set`-size threshold, unused on the interval path). */
  readonly tau: number;
}

/** The caller's gated request (M005 K-4d: `intent` and `tool` are caller-carried; `tool` is NAMED, never called). */
export interface GateRequest {
  readonly tool: string;
  readonly intent: string | number | null;
}

/** Cross-agent gate context (ADR-M003 D4, completed per M005 D5 K-4d). NOT a frozen contract. */
export interface GateContext {
  readonly calib: CalibrationState;
  readonly budget: BudgetState;
  /** `now` -> the injected `produced_at`; `open` -> `clockOpen` (the decision window is open). */
  readonly clock: { readonly now: string; readonly open: boolean };
  readonly request: GateRequest;
}

/**
 * Composes a real Shogen `AttestedPrice`, a `Prediction`, and a seeded `GateContext` into a closed
 * `GateDecision`. Pure; no clock read (`produced_at` is `ctx.clock.now`); never calls `ctx.request.tool`.
 */
export function crossAgentGate(price: AttestedPrice, prediction: Prediction, ctx: GateContext): GateDecision {
  // (1) Both upstream inputs are PRECONDITIONS: closed, well-formed projections (fail-closed).
  assertClosedAttestedPrice(price);
  assertNoForbiddenKey(price);
  assertClosedPrediction(prediction);
  assertNoForbiddenKey(prediction);

  // (2) HIKAE conforms the NUMERIC prediction into an `interval` region over the seeded calibration
  //     (D4 pipeline). A non-finite y_hat is a DECISION (abstain/non_evaluable), never silence.
  const rawYhat = prediction.yhat;
  const numericYhat = typeof rawYhat === "number" && Number.isFinite(rawYhat) ? rawYhat : null;
  const evaluable = numericYhat !== null;
  const conformed = conformInterval({
    calib: evaluable ? ctx.calib.pairs : [], // non-evaluable y_hat -> empty -> under-calib region
    yhat: numericYhat ?? 0,
    alpha: ctx.calib.alpha,
    nMin: ctx.calib.nMin,
    taskClass: prediction.task_class,
    residual: price.residual, // AttestedPrice.residual -> CoverageVerdict.residual (traceability, C2)
    producedAt: ctx.clock.now,
    schemaVersion: SCHEMA_VERSION,
  });

  // (3) The frozen L3 policy (never re-implemented). Server-derived vs caller-carried split per M005 K-4d.
  const input: GateInput = {
    intent: ctx.request.intent,
    verdict: conformed.verdict,
    remainingBudget: ctx.budget.remaining,
    bFloor: ctx.budget.floor,
    tau: ctx.budget.tau,
    tauInterval: ctx.budget.tau,
    nCalib: conformed.verdict.n_calib,
    nMin: ctx.calib.nMin,
    clockOpen: ctx.clock.open,
    timedOut: false, // a pure composition never invents an upstream timeout (K-4d)
    evaluable, // non-finite y_hat -> non_evaluable (fail-closed)
    tool: ctx.request.tool, // NAMED, echoed — NEVER invoked (D0)
    schemaVersion: SCHEMA_VERSION, // server-fixed (K-4c)
  };
  const decision = gate(input);

  // (4) Honesty gates: the wire is the frozen, closed contract and nothing else.
  assertClosedGateDecision(decision);
  assertNoForbiddenKey(decision);
  return decision;
}

/** Phase 2 — the cross-agent gate is REAL (ADR-M003 D4). */
export const MONARK_PHASE = "2-integration";

// Adapter surface — re-exported on the barrel for downstream consumers (the harness `attest`
// tool, ADR-M005 H3). `@monark/monark` exposes a single `.` entry (package.json `exports`), so the barrel
// is where the Shōgen -> AttestedPrice adapter is published. Additive; the frozen contracts are unchanged.
export { fromShogen, isAdapterError, DEMONSTRATIVE_LABEL, SHOGEN_HEAD_SHA } from "./adapter-shogen.ts";
export type { AdapterOutput, AdapterError, AdapterProvenance, AdapterErrorReason } from "./adapter-shogen.ts";

// Narabi — the AttestedFlow -> Prediction (velocity forecast) adapter (ADR-M008 D4). Additive; the frozen
// contracts are unchanged. The velocity is derived here (recalculable), never carried pre-computed.
export {
  fromAttestedFlow,
  isNarabiError,
  NARABI_TASK_CLASS,
  NARABI_FORMULA,
  narabiPredictorId,
  NARABI_LABEL,
} from "./adapter-narabi.ts";
export type { NarabiOutput, NarabiError, NarabiProvenance, NarabiAdapterErrorReason } from "./adapter-narabi.ts";
