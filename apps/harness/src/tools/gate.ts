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
  buildIntervalRegion,
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
// (ADR-M007 D7): the BYO path REUSES the calibrate constants — the score cap (single source) and
// the K-1 honesty label (B-2: one constant, no paraphrase, no banned overclaim verb). Errors on the
// gate BYO path are `HarnessToolError` (already ∈ http.ts TOOL_ERROR_NAMES ⇒ 400), NOT CalibrateToolError.
import { CALIBRATE_MAX_N, CALIBRATE_LABEL } from "./calibrate.ts";

/** Server-fixed contract version (K-4c) — NOT carried by the caller. */
export const SCHEMA_VERSION = "1.0.0";

export const TASK_BTC_DIR = "btc-dir-15m";
export const TASK_CASCADE = "cascade-liquidable-24h";

/** The one honesty sentence the `cascade` path MUST carry (K-4e). */
export const CASCADE_UNCALIBRATED_SENTENCE =
  "no cascade calibration is committed; the gate abstains (under_calib) on this class";

export const GATE_TOOL_NAME = "gate";

/** Tool description (K-4e / C-2): declares `synthetic` (btc-dir), the cascade sentence, AND the BYO path.
 *  The BYO carrier REUSES `CALIBRATE_LABEL` (B-2: one honesty constant, no paraphrase, no banned vocab). */
export const GATE_TOOL_DESCRIPTION =
  "Coverage-gated decision from the real HIKAE L3 policy (commit/defer/abstain) over a caller-carried " +
  "authorization budget B_t. Dispatches on task_class. For 'btc-dir-15m' it conformalizes against a " +
  "committed synthetic calibration derived from the HIKAE S2a instrument (seed 101, n=300 draw), declared " +
  `synthetic — a plumbing fixture, not a measured predictor. For 'cascade-liquidable-24h' ${CASCADE_UNCALIBRATED_SENTENCE}. ` +
  "When the caller instead supplies a `calibration` (its own nonconformity scores plus a `mode`: `interval` " +
  "⇒ region [yhat - q̂, yhat + q̂], or `set` ⇒ a conformal set over caller `candidates`), the gate " +
  `conformalizes against THOSE caller-supplied scores (BYO): ${CALIBRATE_LABEL} ` +
  "The gate only emits a decision; it never calls the named tool.";

/** One BYO candidate (set mode): a label and its caller-supplied nonconformity score. */
export interface ByoCandidate {
  readonly label: string;
  readonly score: number;
}

/**
 * OPTIONAL caller-supplied calibration (ADR-M007 D7, the C2 BYO loop). Present ⇒ the gate conformalizes
 * against THESE scores on the caller's own model, not a committed class. `mode` selects the region kind;
 * `candidates` is required (and non-empty) in `set` mode, unused in `interval` mode.
 */
export interface ByoCalibration {
  readonly scores: readonly number[];
  readonly mode: "interval" | "set";
  readonly candidates?: readonly ByoCandidate[];
}

/** Non-frozen gate parameters, caller-carried (ADR-M005 D5/D6; C2 adds the optional BYO `calibration`). */
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
  /** OPTIONAL (ADR-M007 D7): caller-supplied calibration ⇒ the BYO conformal path. Absent ⇒ committed class. */
  readonly calibration?: ByoCalibration;
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
 * BYO branch (C2): interval ⇒ a finite number; set ⇒ a label present among the caller's candidates.
 */
function deriveEvaluable(taskClass: string, yhat: string | number, calibration?: ByoCalibration): boolean {
  if (calibration !== undefined) {
    if (calibration.mode === "interval") return typeof yhat === "number" && Number.isFinite(yhat);
    const labels = calibration.candidates ?? [];
    return typeof yhat === "string" && labels.some((c) => c.label === yhat);
  }
  if (taskClass === TASK_BTC_DIR) {
    return typeof yhat === "string" && (BTC_DIR_LABELS as readonly string[]).includes(yhat);
  }
  return typeof yhat === "number" && Number.isFinite(yhat);
}

/** Printable-ASCII label (frozen `label_schema` alphabet, prediction.schema.json:11 pattern `^[ -~]+$`). */
const PRINTABLE_ASCII = /^[ -~]+$/;

/**
 * Validate the caller-supplied calibration (C2, fail-closed ⇒ `HarnessToolError`, surfaced as 400). Runs
 * BEFORE any conformal computation. `interval` mode requires every score >= 0 (B-4/B-6): rejected here so
 * `buildIntervalRegion`'s `lo > hi` throw (region.ts:48) is UNREACHABLE. `set` mode requires a non-empty
 * `candidates` list whose labels are printable ASCII, non-empty, unique, and free of `|` (B-3: `|` is the
 * `label_schema` separator, so a label containing it would forge a false schema in the frozen decision).
 */
function validateCalibration(cal: ByoCalibration): void {
  if (cal.mode !== "interval" && cal.mode !== "set") {
    throw new HarnessToolError(`invalid calibration.mode: expected 'interval' or 'set'`);
  }
  // `scores`/`candidates` are typed arrays and array-typed at the SDK boundary (schema); we do NOT use
  // `Array.isArray` here — its guard narrows a typed array to `any[]` (signature `arg is any[]`), which
  // would poison the element types. We iterate the typed array directly (motif calibrate.ts).
  if (cal.scores.length > CALIBRATE_MAX_N) {
    throw new HarnessToolError(
      `invalid calibration.scores: ${String(cal.scores.length)} scores exceeds the cap of ${String(CALIBRATE_MAX_N)} (resource guard)`,
    );
  }
  for (let i = 0; i < cal.scores.length; i++) {
    const s = cal.scores[i];
    if (s === undefined || !Number.isFinite(s)) {
      throw new HarnessToolError(`invalid calibration.scores[${String(i)}]: expected a finite number`);
    }
  }
  if (cal.mode === "interval") {
    // B-4/B-6: a negative nonconformity score would make q̂ negative ⇒ lo > hi ⇒ buildIntervalRegion throws.
    for (let i = 0; i < cal.scores.length; i++) {
      if ((cal.scores[i] ?? 0) < 0) {
        throw new HarnessToolError(`invalid calibration.scores[${String(i)}]: interval mode requires non-negative nonconformity scores (B-6)`);
      }
    }
    return;
  }
  // set mode: candidates required, non-empty, well-formed, unique labels (B-3).
  const candidates = cal.candidates;
  if (candidates === undefined || candidates.length === 0) {
    throw new HarnessToolError("invalid calibration.candidates: set mode requires a non-empty candidate list");
  }
  if (candidates.length > CALIBRATE_MAX_N) {
    throw new HarnessToolError(`invalid calibration.candidates: ${String(candidates.length)} exceeds the cap of ${String(CALIBRATE_MAX_N)}`);
  }
  const seen = new Set<string>();
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (c === undefined || typeof c.label !== "string" || !PRINTABLE_ASCII.test(c.label)) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: expected a non-empty printable-ASCII string`);
    }
    if (c.label.includes("|")) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: must not contain '|' (label_schema separator, B-3)`);
    }
    if (seen.has(c.label)) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: duplicate label '${c.label}'`);
    }
    seen.add(c.label);
    if (typeof c.score !== "number" || !Number.isFinite(c.score)) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].score: expected a finite number`);
    }
  }
}

/**
 * BYO conformal path (C2, ADR-M007 D7): compose the SAME real HIKAE primitives on the CALLER's scores.
 * Order mirrors gate.ts:189-197 — validate, then check `yhat` TYPE for the mode (wrong type ⇒ tool error
 * BEFORE any computation), then `splitQuantile` (under-calibration ⇒ fail-closed `underCalibVerdict`),
 * then the region. `abstain`/`reason` conventions mirror the committed paths (set: |C|>tau ⇒ set_too_large
 * else covered — gate.ts:135/144; interval: abstain:false/covered — interval-conformer.ts:93-94; the L3
 * gate decides DEFER/ABSTAIN on the width). Every error is `HarnessToolError` (⇒ 400), never a 500.
 */
function byoVerdict(prediction: Prediction, params: HarnessParams, cal: ByoCalibration): CoverageVerdict {
  validateCalibration(cal);
  const taskClass = prediction.task_class;
  const yhat = prediction.yhat;

  // WRONG-typed yhat for the mode ⇒ tool error BEFORE the region (C-1, mirror gate.ts:189-197).
  if (cal.mode === "interval" && typeof yhat !== "number") {
    throw new HarnessToolError(`byo 'interval' mode expects a number yhat, got ${typeof yhat}`);
  }
  if (cal.mode === "set" && typeof yhat !== "string") {
    throw new HarnessToolError(`byo 'set' mode expects a string yhat (label), got ${typeof yhat}`);
  }

  // label_schema for set mode is DERIVED from the caller's candidates (B-3), joined by `|`.
  const labelSchema = cal.mode === "set" ? (cal.candidates ?? []).map((c) => c.label).join("|") : undefined;

  const split = splitQuantile(cal.scores, params.alpha, params.nMin);
  if ("reason" in split) {
    // Fail-closed under-calibration (n < nMin or p > n): EMPTY set region, qhat null, never clamped.
    return underCalibVerdict({
      taskClass,
      method: "split",
      alpha: params.alpha,
      scores: cal.scores,
      residual: [],
      producedAt: prediction.produced_at,
      schemaVersion: SCHEMA_VERSION,
      ...(labelSchema !== undefined ? { labelSchema } : {}),
    });
  }
  const qhat = split.qhat;

  if (cal.mode === "interval") {
    const center = yhat as number; // narrowed by the typeof guard above
    const ir = buildIntervalRegion(center - qhat, center + qhat);
    if (ir.abstain) {
      // A non-finite bound (yhat non-finite) ⇒ fail-closed under_calib (C-1, mirror interval-conformer.ts:84).
      return underCalibVerdict({
        taskClass,
        method: "split",
        alpha: params.alpha,
        scores: cal.scores,
        residual: [],
        producedAt: prediction.produced_at,
        schemaVersion: SCHEMA_VERSION,
      });
    }
    // residual is NOT an honesty carrier (M-2): frozen semantics inherited from the verdict contract.
    return buildVerdict({
      taskClass,
      method: "split",
      alpha: params.alpha,
      scores: cal.scores,
      region: ir.region,
      qhat,
      abstain: false,
      reason: "covered",
      residual: [],
      producedAt: prediction.produced_at,
      schemaVersion: SCHEMA_VERSION,
    });
  }

  // set mode: conformal set over the caller's candidate scores, label_schema derived from the candidates.
  const candidates = cal.candidates;
  if (candidates === undefined || candidates.length === 0) {
    throw new HarnessToolError("byo 'set' mode requires a non-empty candidate list");
  }
  const derivedSchema = labelSchema ?? candidates.map((c) => c.label).join("|");
  const labels = conformalSet(new Map(candidates.map((c) => [c.label, c.score] as const)), qhat);
  const abstain = labels.length > params.tau;
  return buildVerdict({
    taskClass,
    method: "split",
    alpha: params.alpha,
    scores: cal.scores,
    region: buildSetRegion(labels, derivedSchema),
    qhat,
    abstain,
    reason: abstain ? "set_too_large" : "covered",
    residual: [],
    producedAt: prediction.produced_at,
    schemaVersion: SCHEMA_VERSION,
  });
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

/**
 * The honesty text carried in the MCP tool result content (never inside the frozen decision, K-1).
 * B-1 (CRITICAL): keyed on the PRESENCE of calibration, NOT on `task_class` alone — a BYO decision on a
 * free-string class must NOT fall through to the CASCADE sentence (which would be false on the wire next
 * to a BYO COMMIT). The BYO carrier REUSES `CALIBRATE_LABEL` (B-2: one constant, no paraphrase).
 */
export function honestyText(taskClass: string, isByo: boolean): string {
  if (isByo) return `${CALIBRATE_LABEL} B_t is caller-carried.`;
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
  const calibration = params.calibration;
  let verdict: CoverageVerdict;
  let nCalib: number;

  if (calibration !== undefined) {
    // Anti-override guard (C2): a BYO calibration must NEVER silently overwrite the committed synthetic
    // classes. Strict equality on exactly the two committed classes ⇒ tool error (400).
    if (taskClass === TASK_BTC_DIR || taskClass === TASK_CASCADE) {
      throw new HarnessToolError(
        `calibration must not override the committed class '${taskClass}': use a caller-owned task_class for BYO (ADR-M007 D7)`,
      );
    }
    verdict = byoVerdict(prediction, params, calibration);
    nCalib = calibration.scores.length;
  } else if (taskClass === TASK_BTC_DIR) {
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
    throw new HarnessToolError(`unknown task_class '${taskClass}' (known: ${TASK_BTC_DIR}, ${TASK_CASCADE}; or supply params.calibration for BYO)`);
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
    evaluable: deriveEvaluable(taskClass, prediction.yhat, calibration), // K-4d
    tool: params.tool, // NAMED, echoed — NEVER invoked (D0/D1)
    schemaVersion: SCHEMA_VERSION, // K-4c — server-fixed, not caller-carried
  };

  const decision = gate(gateInput);
  // Honesty gates (D9): the wire is the frozen, closed contract — nothing else.
  assertClosedGateDecision(decision);
  assertNoForbiddenKey(decision);
  return decision;
}
