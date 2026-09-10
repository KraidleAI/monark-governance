/**
 * Harness — the `gate` tool (ADR-M005 D1/D5/D6/D8/D9).
 *
 * A PURE composition of the REAL HIKAE primitives (imported, never re-implemented): it dispatches
 * on `task_class`, conformalizes, then runs the frozen L3 `gate()` policy and returns a closed
 * `GateDecision`. NO side effects (K-8): this file — like everything under `src/tools/` — imports
 * no `node:fs`/`node:net`/`node:child_process`, calls no `fetch`, writes no `process.env`, reads no
 * clock (`produced_at` is the caller-carried instant from the `Prediction`).
 *
 * Dispatch (D5):
 *   - `btc-dir-15m`         → `conformalSet` over the committed SYNTHETIC calibration (region `set`).
 *   - `cascade-liquidable-24h` → `conformInterval` with NO committed calibration ⇒ empty region ⇒
 *                             `abstain`/`under_calib`. That is the honest expected result, not a defect.
 *
 * Server-owned fields (D6/K-4c/K-4d): `schema_version` is fixed here (`"1.0.0"`), `timedOut=false`,
 * `evaluable`/`nCalib` are derived; `clockOpen`, `tau`, `tauInterval`, `alpha`, `nMin`, `bFloor`,
 * `remainingBudget` (B_t), `intent`, `tool` are caller-carried. Invalid params (K-4a) ⇒ a tool error,
 * never a silent gate. The gate ONLY emits a decision; it NEVER calls `params.tool` (D0/D1).
 */
import {
  splitQuantile,
  conformalSet,
  indicatorScores,
  buildSetRegion,
  buildVerdict,
  underCalibVerdict,
  conformInterval,
  gate,
  BTC_DIR_LABELS,
} from "@monark/hikae";
import type { GateInput } from "@monark/hikae";
import { assertClosedGateDecision, assertNoForbiddenKey } from "@monark/contracts";
import type { GateDecision, Prediction, CoverageVerdict } from "@monark/contracts";
import { BTC_DIR_CALIB, BTC_DIR_CALIB_PROVENANCE } from "../calibration.ts";

/** Server-fixed contract version (K-4c) — NOT carried by the caller. */
export const SCHEMA_VERSION = "1.0.0";

export const TASK_BTC_DIR = "btc-dir-15m";
export const TASK_CASCADE = "cascade-liquidable-24h";

/** The one honesty sentence the `cascade` path MUST carry (K-4e). */
export const CASCADE_UNCALIBRATED_SENTENCE =
  "no cascade calibration is committed; the gate abstains (under_calib) on this class";

export const GATE_TOOL_NAME = "gate";

/** Tool description (K-4e): declares `synthetic` (btc-dir) and the cascade sentence. No banned vocab. */
export const GATE_TOOL_DESCRIPTION =
  "Coverage-gated decision from the real HIKAE L3 policy (commit/defer/abstain) over a caller-carried " +
  "authorization budget B_t. Dispatches on task_class. For 'btc-dir-15m' it conformalizes against a " +
  "committed synthetic calibration derived from the HIKAE S2a instrument (seed 101, n=300 draw), declared " +
  `synthetic — a plumbing fixture, not a measured predictor. For 'cascade-liquidable-24h' ${CASCADE_UNCALIBRATED_SENTENCE}. ` +
  "The gate only emits a decision; it never calls the named tool.";

/** Non-frozen gate parameters, caller-carried (ADR-M005 D5/D6). */
export interface HarnessParams {
  readonly remainingBudget: number;
  readonly bFloor: number;
  readonly tau: number;
  readonly tauInterval: number;
  readonly alpha: number;
  readonly nMin: number;
  readonly intent: string | number | null;
  readonly tool: string;
  readonly clockOpen: boolean;
}

/** A tool-level error (K-4a): surfaced by the MCP seam as a tool error, never a silent gate. */
export class HarnessToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HarnessToolError";
  }
}

function requireFinite(value: number, name: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HarnessToolError(`invalid param '${name}': expected a finite number`);
  }
}

/** Server-side validation of the non-frozen params (K-4a). Invalid ⇒ tool error. */
export function validateHarnessParams(params: HarnessParams): void {
  requireFinite(params.remainingBudget, "remainingBudget");
  requireFinite(params.bFloor, "bFloor");
  requireFinite(params.tau, "tau");
  requireFinite(params.tauInterval, "tauInterval");
  requireFinite(params.alpha, "alpha");
  if (!Number.isInteger(params.nMin) || params.nMin < 1) {
    throw new HarnessToolError("invalid param 'nMin': expected an integer >= 1");
  }
  if (!(params.alpha > 0 && params.alpha < 1)) {
    throw new HarnessToolError("invalid param 'alpha': expected a number in the open interval (0,1)");
  }
  if (params.tau < 0) throw new HarnessToolError("invalid param 'tau': expected >= 0");
  if (params.tauInterval < 0) throw new HarnessToolError("invalid param 'tauInterval': expected >= 0");
  if (params.bFloor < 0) throw new HarnessToolError("invalid param 'bFloor': expected >= 0");
  if (typeof params.tool !== "string" || params.tool.length === 0) {
    throw new HarnessToolError("invalid param 'tool': expected a non-empty string");
  }
  if (typeof params.clockOpen !== "boolean") {
    throw new HarnessToolError("invalid param 'clockOpen': expected a boolean");
  }
}

/**
 * `evaluable` derivation (K-4d): a right-typed but non-directional / non-finite `yhat` is a DECISION
 * (`abstain`/`non_evaluable`), never silence; a WRONG-typed `yhat` is a tool error (raised in `runGate`).
 */
function deriveEvaluable(taskClass: string, yhat: string | number): boolean {
  if (taskClass === TASK_BTC_DIR) {
    return typeof yhat === "string" && (BTC_DIR_LABELS as readonly string[]).includes(yhat);
  }
  return typeof yhat === "number" && Number.isFinite(yhat);
}

/** btc-dir verdict: conformal `set` over the committed synthetic calibration. */
function btcDirVerdict(prediction: Prediction, params: HarnessParams): CoverageVerdict {
  const split = splitQuantile(BTC_DIR_CALIB, params.alpha, params.nMin);
  if ("reason" in split) {
    // Caller demanded more calibration than the committed fixture holds ⇒ honest under-calibration.
    return underCalibVerdict({
      taskClass: TASK_BTC_DIR,
      method: "split",
      alpha: params.alpha,
      scores: BTC_DIR_CALIB,
      residual: [],
      producedAt: prediction.produced_at,
      schemaVersion: SCHEMA_VERSION,
    });
  }
  const yhat = typeof prediction.yhat === "string" ? prediction.yhat : String(prediction.yhat);
  const labels = conformalSet(indicatorScores(yhat, BTC_DIR_LABELS), split.qhat);
  const abstain = labels.length > params.tau;
  return buildVerdict({
    taskClass: TASK_BTC_DIR,
    method: "split",
    alpha: params.alpha,
    scores: BTC_DIR_CALIB,
    region: buildSetRegion(labels),
    qhat: split.qhat,
    abstain,
    reason: abstain ? "set_too_large" : "covered",
    residual: [],
    producedAt: prediction.produced_at,
    schemaVersion: SCHEMA_VERSION,
  });
}

/** cascade verdict: `conformInterval` with NO committed calibration ⇒ empty region ⇒ under_calib (D5). */
function cascadeVerdict(prediction: Prediction, params: HarnessParams): CoverageVerdict {
  const yhat = typeof prediction.yhat === "number" ? prediction.yhat : Number(prediction.yhat);
  return conformInterval({
    calib: [], // no cascade calibration exists — the honest, expected result is abstention
    yhat,
    alpha: params.alpha,
    nMin: params.nMin,
    taskClass: TASK_CASCADE,
    residual: [],
    producedAt: prediction.produced_at,
    schemaVersion: SCHEMA_VERSION,
  }).verdict;
}

/** The honesty text carried in the MCP tool result content (never inside the frozen decision, K-1). */
export function honestyText(taskClass: string): string {
  if (taskClass === TASK_BTC_DIR) return `${BTC_DIR_CALIB_PROVENANCE} B_t is caller-carried.`;
  return `${CASCADE_UNCALIBRATED_SENTENCE}; B_t is caller-carried.`;
}

/**
 * Compose the real primitives into a closed `GateDecision`. Throws `HarnessToolError` on an unknown
 * `task_class`, a wrong-typed `yhat`, or invalid params (K-4a). The gate NEVER calls `params.tool`.
 */
export function runGate(prediction: Prediction, params: HarnessParams): GateDecision {
  validateHarnessParams(params);
  if (prediction.schema_version !== SCHEMA_VERSION) {
    throw new HarnessToolError(
      `unsupported prediction.schema_version '${prediction.schema_version}': the harness speaks '${SCHEMA_VERSION}'`,
    );
  }

  const taskClass = prediction.task_class;
  let verdict: CoverageVerdict;
  let nCalib: number;

  if (taskClass === TASK_BTC_DIR) {
    if (typeof prediction.yhat !== "string") {
      throw new HarnessToolError(`task_class '${TASK_BTC_DIR}' expects a string yhat (label), got ${typeof prediction.yhat}`);
    }
    verdict = btcDirVerdict(prediction, params);
    nCalib = BTC_DIR_CALIB.length;
  } else if (taskClass === TASK_CASCADE) {
    if (typeof prediction.yhat !== "number") {
      throw new HarnessToolError(`task_class '${TASK_CASCADE}' expects a number yhat (amount), got ${typeof prediction.yhat}`);
    }
    verdict = cascadeVerdict(prediction, params);
    nCalib = verdict.n_calib; // 0 — no committed cascade calibration
  } else {
    throw new HarnessToolError(`unknown task_class '${taskClass}' (known: ${TASK_BTC_DIR}, ${TASK_CASCADE})`);
  }

  const gateInput: GateInput = {
    intent: params.intent,
    verdict,
    remainingBudget: params.remainingBudget,
    bFloor: params.bFloor,
    tau: params.tau,
    tauInterval: params.tauInterval,
    nCalib,
    nMin: params.nMin,
    clockOpen: params.clockOpen,
    timedOut: false, // K-4d — a pure server never invents an upstream timeout
    evaluable: deriveEvaluable(taskClass, prediction.yhat), // K-4d
    tool: params.tool, // NAMED, echoed — NEVER invoked (D0/D1)
    schemaVersion: SCHEMA_VERSION, // K-4c — server-fixed, not caller-carried
  };

  const decision = gate(gateInput);
  // Honesty gates (D9): the wire is the frozen, closed contract — nothing else.
  assertClosedGateDecision(decision);
  assertNoForbiddenKey(decision);
  return decision;
}
