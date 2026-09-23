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
 *   - `stable-run-velocity-24h` → committed calibration looked up PER KEY (task_class, predictor_id)
 *                             (ADR-M008 Amendement bis): the USDe key ⇒ `splitQuantile` + `buildIntervalRegion`
 *                             over USDE_STABLE_RUN_CALIB (region `interval`); any other key ⇒ `under_calib`.
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
  NUMERIC_LABEL_SCHEMA,
} from "@monark/hikae";
import type { GateInput } from "@monark/hikae";
import { assertClosedGateDecision, assertNoForbiddenKey } from "@monark/contracts";
import type { GateDecision, Prediction, CoverageVerdict, AttestedPrice } from "@monark/contracts";
import {
  BTC_DIR_CALIB,
  BTC_DIR_CALIB_PROVENANCE,
  lookupCommittedCalibration,
  UKEMI_LIQ_PREDICTOR_BASE,
  hasCommittedCalibrationForClass,
} from "../calibration.ts";
// (ADR-U4b D1/D3/D4, decisions 108/126): the served Mondrian strata + the upper-bound region helper. A PURE
// sibling at src/ (no I/O; imports only @monark/hikae), so importing it keeps the K-8 tools scan meaningful
// and re-declares strateOf WITHOUT importing the frozen scorer (which reads node:fs + apps/sentinel, D-4).
import { strateOf, liqUpperBoundRegion } from "../ukemi-strata.ts";
// (ADR-M007 D7): the BYO path REUSES the calibrate constants — the score cap (single source) and
// the K-1 honesty label (B-2: one constant, no paraphrase, no banned overclaim verb). Errors on the
// gate BYO path are `HarnessToolError` (already ∈ http.ts TOOL_ERROR_NAMES ⇒ 400), NOT CalibrateToolError.
import { CALIBRATE_MAX_N, CALIBRATE_LABEL } from "./calibrate.ts";
// (ADR-M017 D2): the committed subject<->class binding table + the pure consistency predicate. A pure
// sibling module at src/ (no I/O, imports nothing from the tools), so the K-8 tools scan stays meaningful
// and there is no import cycle (attestation-binding.ts never imports gate.ts).
import { checkAttestedConsistency } from "../attestation-binding.ts";

/** Server-fixed contract version (K-4c) — NOT carried by the caller. */
export const SCHEMA_VERSION = "1.0.0";

export const TASK_BTC_DIR = "btc-dir-15m";
export const TASK_CASCADE = "cascade-liquidable-24h";
/**
 * Narabi velocity-forecast class (ADR-M008 D4). "24h" = the forecast horizon. Since F2-B (ADR-M008
 * Amendement bis) a calibration is committed PER KEY (task_class, predictor_id): the USDe key
 * (calibration.ts USDE_STABLE_RUN_PREDICTOR_ID) conformalizes; every other key abstains under_calib.
 */
export const TASK_STABLE_RUN = "stable-run-velocity-24h";

/**
 * Ukemi liquidation-eligible-coverage class (class A only, decision 108; ADR-U4b D1). Number yhat = the
 * caller-carried liquidable amount (base 8-dec). The stratum k = strateOf(yhat) is derived SERVER-SIDE (the
 * caller never picks it, C-10); alpha/nMin are SERVER-imposed (a divergent params value is a named 400). In
 * U-4b-2a the registry is EMPTY of this class ⇒ every yhat abstains under_calib (no served coverage claimed).
 */
export const TASK_LIQ_ELIGIBLE = "liquidation-eligible-coverage";

/** Server-imposed calibration params for the committed liq class (ADR-U4b D3; == the frozen generator
 *  ALPHA/NMIN). A divergent `params.alpha`/`params.nMin` is a NAMED 400, never a silent override: the L3
 *  gate reads `params.nMin`, so a divergent nMin would diverge the action (delta D-6, C-10). */
export const LIQ_ALPHA = 0.01;
export const LIQ_NMIN = 100;

/** The one honesty sentence the `cascade` path MUST carry (K-4e). */
export const CASCADE_UNCALIBRATED_SENTENCE =
  "no cascade calibration is committed; the gate abstains (under_calib) on this class";

/**
 * The honesty sentence the `stable-run-velocity-24h` path carries for a population WITHOUT a committed
 * calibration (K-4e, ADR-M008 D5 + Amendement bis A2). Now POPULATION-scoped (per key), not class-wide: a
 * committed key exists (USDe), so this is the honest text for EVERY OTHER (task_class, predictor_id).
 * Distinct from the cascade sentence: a fall-through to CASCADE_UNCALIBRATED_SENTENCE would be FALSE on the
 * wire next to a stable-run decision (validateur checkpoint, correction #2).
 */
export const STABLE_RUN_UNCALIBRATED_SENTENCE =
  "no stable-run velocity calibration is committed for this population; the gate abstains (under_calib)";

/**
 * The honesty sentence for the ONE committed stable-run population (ADR-M008 Amendement bis A2): USDe, the
 * synthetic-dollar-whitelisted-redeem family, measured over CALM 24h redemption-flow windows. The coverage
 * statement follows the split-conformal bound of Barber, Candes, Ramdas and Tibshirani 2023 (Thm 2, unit
 * weights): 1 - alpha is the coverage ONLY if the average total-variation gap between the calibration windows
 * and the next is zero (exchangeability). That gap is NOT estimated here and the calibration is MEASURED
 * non-stationary across half-years, so exchangeability is NOT assumed and no coverage is measured (ADR-M012 D7,
 * supersedes the ADR-M008 D7 declared-exchangeability wording). (The "every other population abstains
 * under_calib" queue lives in the full `STABLE_RUN_COMMITTED_SENTENCE` below; the description interpolates
 * this CORE, ADR-M012 item (i) dedup.) No marketing "calibrated" adjective, no "V1", no numeric
 * early-warning, no probability — measured, never scored.
 * NOTE (declared deviation): ADR-M012 D7 spells the third author's surname with a French diacritic; it is
 * rendered ASCII "Candes" here to match repo precedent (packages/hikae/src/l1-split.ts) and the English-only
 * export gate (ADR-M004 D7) — the diacritic reddens lang:gate + export:check (harness scope). Substance identical.
 */
export const STABLE_RUN_COMMITTED_CORE =
  "a committed stable-run velocity calibration for the USDe synthetic-dollar-whitelisted-redeem population " +
  "(key narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3) over calm-window " +
  "redemption flow; coverage is stated under the split-conformal bound of Barber, Candes, Ramdas and " +
  "Tibshirani 2023 (Thm 2, unit weights): at least 1 − α minus the average total-variation gap between " +
  "calibration windows and the next one; that gap is not estimated here and the calibration is measured " +
  "non-stationary across half-years, so 1 − α is the coverage only if that gap is zero (exchangeability), " +
  "which is not assumed here; no coverage is measured";

/**
 * The FULL committed sentence = CORE + the "every other population abstains" queue. `honestyText()`
 * (tools/call, K-1 carrier) renders THIS unchanged for the USDe COMMIT — byte-identical on the wire, its
 * VALUE unchanged from pre-b2. `GATE_TOOL_DESCRIPTION` (tools/list) interpolates `STABLE_RUN_COMMITTED_CORE`
 * ONLY: ADR-M012 item (i) dedup — the queue duplicated the description's `for any other population,
 * ${STABLE_RUN_UNCALIBRATED_SENTENCE}` clause (G2 F3). Split (not deleted), so NO K-1 carrier changes.
 */
export const STABLE_RUN_COMMITTED_SENTENCE =
  STABLE_RUN_COMMITTED_CORE + "; every other (task_class, predictor_id) abstains (under_calib)";

/**
 * SERVED text of the liquidation-eligible-coverage class (ADR-U4b D1; decision 126, borne haute; delta
 * D-1). The served region is a conformal UPPER BOUND [0, yhat + qhat]; the wire `region.kind` stays
 * "interval" (frozen contract) so "upper bound" is a property of THIS text, never a new kind, and the word
 * "interval" is deliberately ABSENT from it (delta D-1; mutant (o) is scoped to this constant, not to the
 * BYO clause of GATE_TOOL_DESCRIPTION nor to vocab-banned.json). No probability, no width/tightness claim.
 */
export const LIQ_UPPER_BOUND_SENTENCE =
  "a conformal upper bound on the liquidable amount for the calibrated class; the lower edge is 0 by " +
  "construction, not a calibrated bound; abstains (under_calib) outside it";

/** The SERVER-imposed params, declared in the class description (checkpoint-1 C-7). */
export const LIQ_REQUIREMENTS_SENTENCE = "this class requires alpha = 0.01, nMin = 100";

/** H-3 honesty (checkpoint-1 C-8): calibrated on ONE recorded episode, no coverage claimed on any other
 *  event, a YES on the exchangeability check licenses nothing more. ASCII only (lang:gate / export:check). */
export const LIQ_H3_SENTENCE =
  "calibrated on one recorded episode; no coverage is claimed on any other event; the H-3 " +
  "exchangeability check is a report, a YES licenses nothing more";

/** Conditional-coverage clause (ADR-U4b D1): the bound holds ONLY if yhat was produced by the frozen
 *  close-factor rule on a mono-collateral WETH account at the first crossing, which the gate does not check.
 *  Its ABSENCE is an over-revendication (mutant (h)); it MUST ride in the served text. */
export const LIQ_CONDITIONAL_SENTENCE =
  "the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH " +
  "account at the first crossing, which the gate does not check";

/** The FULL committed sentence for the SERVED (non-empty-registry) liq class (rendered by honestyText at
 *  -2b). Carries the upper bound + the H-3 clause + the conditional clause; never "interval",
 *  never a probability (u4b_liq_description_makes_no_probability_claim, u4b_liq_class_text_says_upper_bound_never_interval). */
export const LIQ_COMMITTED_SENTENCE = `${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;

/** Empty-registry (U-4b-2a) honesty: no calibration committed yet ⇒ abstains under_calib by construction.
 *  Keyed on REGISTRY presence (hasCommittedCalibrationForClass), never on a client-key lookup (delta D-3). */
export const LIQ_EMPTY_REGISTRY_SENTENCE =
  "no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction";

export const GATE_TOOL_NAME = "gate";

/**
 * ADR-M017 D2(iv) — the non-re-verification sentence carried VERBATIM in the tool description (phrase C-8):
 * the attestation is DECLARED-consistent and not re-verified at call time (no verifier runs here, K-8); `attest`
 * has no input and cannot recompute or verify a caller-carried attestation. Kept as one constant so the
 * "non-re-verification phrase removed from the description" mutant reddens `gate_description_declares_non_reverification` (test (4)).
 */
export const GATE_NON_REVERIFICATION_SENTENCE =
  "the attestation is carried by the caller and is not re-verified at call time (the verifier is not executed here); " +
  "`attest` only projects the committed witness — verify a caller-carried attestation offline with the Shōgen verifier";

/**
 * Tool description (K-4e / C-2): declares `synthetic` (btc-dir), the cascade sentence, AND the BYO path.
 * The BYO carrier REUSES `CALIBRATE_LABEL` (B-2: one honesty constant, no paraphrase, no banned vocab).
 * (HARNESS-DESC-1, CARTO-T1C-2; checkpoint-1 HARNESS-DESC-1 C-1/C-2) A PURE function of the REGISTRY state of the
 * liq class: `registryHasLiq` is hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), the SAME registry-level key
 * honestyText uses (delta D-3). EMPTY registry: the empty-registry sentence, the server-imposed params (their 400
 * fires BEFORE the lookup, so it holds on an empty registry; checkpoint-1 U-4b-2 C-7) and the conditional rule
 * (orchestrator ruling: a rule statement, not a coverage claim); NEVER the upper-bound sentence nor the H-3
 * sentence, since nothing is calibrated in the served registry (checkpoint-1 U-4b-2 C-1, G0 2a-3). NON-EMPTY
 * registry (U-4b-2b): the committed clause, byte-identical to the pre-HARNESS-DESC-1 text. Every other clause is
 * the same in both states.
 */
export function describeGate(registryHasLiq: boolean): string {
  const liqClause = registryHasLiq
    ? `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`
    : `${LIQ_EMPTY_REGISTRY_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;
  return (
    "Coverage-gated decision from the real HIKAE L3 policy (commit/defer/abstain) over a caller-carried " +
    "authorization budget B_t. Dispatches on task_class. For 'btc-dir-15m' it conformalizes against a " +
    "committed synthetic calibration derived from the HIKAE S2a instrument (seed 101, n=300 draw), declared " +
    `synthetic — a plumbing fixture, not a measured predictor. For 'cascade-liquidable-24h' ${CASCADE_UNCALIBRATED_SENTENCE}. ` +
    `For 'stable-run-velocity-24h' (Narabi: a redemption-flow velocity forecast) the gate holds ${STABLE_RUN_COMMITTED_CORE}; ` +
    `for any other population, ${STABLE_RUN_UNCALIBRATED_SENTENCE}. ` +
    `For '${TASK_LIQ_ELIGIBLE}' (Ukemi: a per-account liquidable-amount class, class A only) ${liqClause}. ` +
    "When the caller instead supplies a `calibration` (its own nonconformity scores plus a `mode`: `interval` " +
    "⇒ region [yhat - q̂, yhat + q̂], or `set` ⇒ a conformal set over caller `candidates`), the gate " +
    `conformalizes against THOSE caller-supplied scores (BYO): ${CALIBRATE_LABEL} ` +
    "A caller-carried `attested` price must declare a subject consistent with the committed task class " +
    "(exact committed-URL membership; BYO classes do not accept `attested` in P1); " +
    GATE_NON_REVERIFICATION_SENTENCE +
    "; no temporal binding in P1. " +
    "The gate only emits a decision; it never calls the named tool."
  );
}

/** The SERVED description (registry.ts -> tools/list, openapi.ts -> /openapi.json): describeGate at the registry
 *  state AT LOAD. COMMITTED_CALIBRATIONS is a module constant, so ONE state is observable per process; the switch to
 *  the committed clause is automatic at the first committed liq entry (U-4b-2b, item on G0 2b-7). */
export const GATE_TOOL_DESCRIPTION = describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE));

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
 * `buildIntervalRegion`'s `lo > hi` throw (region.ts:55) is UNREACHABLE. `set` mode requires a non-empty
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
 * Order mirrors `validateCalibration` then the committed dispatch — validate, then check `yhat` TYPE for the
 * mode (wrong type ⇒ tool error BEFORE any computation), then `splitQuantile` (under-calibration ⇒ fail-closed
 * `underCalibVerdict`), then the region. `abstain`/`reason` conventions mirror the committed paths (set:
 * |C|>tau ⇒ set_too_large else covered, as in `btcDirVerdict`; interval: abstain:false/covered, as in
 * `conformInterval`; the L3 gate decides DEFER/ABSTAIN on the width). Every error is `HarnessToolError`
 * (⇒ 400), never a 500. (Line-number cross-refs refreshed for F2-B — the "next touch" M011 promised.)
 */
function byoVerdict(prediction: Prediction, params: HarnessParams, cal: ByoCalibration): CoverageVerdict {
  validateCalibration(cal);
  const taskClass = prediction.task_class;
  const yhat = prediction.yhat;

  // WRONG-typed yhat for the mode ⇒ tool error BEFORE the region (C-1, mirror the committed dispatch's yhat check).
  if (cal.mode === "interval" && typeof yhat !== "number") {
    throw new HarnessToolError(`byo 'interval' mode expects a number yhat, got ${typeof yhat}`);
  }
  if (cal.mode === "set" && typeof yhat !== "string") {
    throw new HarnessToolError(`byo 'set' mode expects a string yhat (label), got ${typeof yhat}`);
  }

  // label_schema for set mode is DERIVED from the caller's candidates (B-3), joined by `|`; interval mode
  // is a NUMERIC class, so its empty under_calib region carries NUMERIC_LABEL_SCHEMA, never `up|down` (E9).
  const labelSchema = cal.mode === "set" ? (cal.candidates ?? []).map((c) => c.label).join("|") : NUMERIC_LABEL_SCHEMA;

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
      labelSchema,
    });
  }
  const qhat = split.qhat;

  if (cal.mode === "interval") {
    const center = yhat as number; // narrowed by the typeof guard above
    const ir = buildIntervalRegion(center - qhat, center + qhat);
    if (ir.abstain) {
      // Fail-closed under_calib (C-1, mirror interval-conformer.ts:86): a non-finite bound (yhat non-finite),
      // OR a zero-width region lo===hi (q̂=0 or float absorption `center±q̂===center`, NDG-1 ADR-M011).
      return underCalibVerdict({
        taskClass,
        method: "split",
        alpha: params.alpha,
        scores: cal.scores,
        residual: [],
        producedAt: prediction.produced_at,
        schemaVersion: SCHEMA_VERSION,
        labelSchema: NUMERIC_LABEL_SCHEMA,
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
 * stable-run velocity verdict (ADR-M008 D4 + Amendement bis, isolation of population on the wire, C-10):
 * keyed on (task_class, predictor_id). When a committed calibration exists for the key (USDe), conformalize
 * the caller-carried velocity forecast against THOSE committed nonconformity scores (split-conformal on the
 * scores directly — they are residuals |v − v̂|, NOT pairs — the SAME primitive chain as the BYO interval
 * branch: splitQuantile → buildIntervalRegion → buildVerdict; NDG-1 (ADR-M011) traverses buildIntervalRegion,
 * REUSED not re-added). For EVERY OTHER population (naked formula, another token, another chain, an altered
 * key) no committed calibration exists ⇒ empty region ⇒ honest `under_calib`. The velocity FORECAST itself is
 * the caller-carried `prediction.yhat` (the Narabi adapter's output); the gate only conformalizes and decides.
 */
function stableRunVerdict(prediction: Prediction, params: HarnessParams): CoverageVerdict {
  const yhat = typeof prediction.yhat === "number" ? prediction.yhat : Number(prediction.yhat);
  const committed = lookupCommittedCalibration(TASK_STABLE_RUN, prediction.predictor_id);
  if (committed === undefined) {
    // No committed calibration for THIS (task_class, predictor_id) ⇒ honest abstention (empty region ⇒
    // under_calib). This is the fail-closed isolation: msUSD, an L2 chain, or an altered key never reach USDe.
    return conformInterval({
      calib: [],
      yhat,
      alpha: params.alpha,
      nMin: params.nMin,
      taskClass: TASK_STABLE_RUN,
      residual: [],
      producedAt: prediction.produced_at,
      schemaVersion: SCHEMA_VERSION,
    }).verdict;
  }
  // Committed population (USDe): split-conformal over the committed SCORES. Same primitive chain as
  // byoVerdict's interval branch — one quantile implementation (L1), never re-rolled.
  const scores = committed.scores;
  const split = splitQuantile(scores, params.alpha, params.nMin);
  if ("reason" in split) {
    // Caller demanded more calibration than the committed set holds (n < nMin, or p > n) ⇒ honest under_calib.
    return underCalibVerdict({
      taskClass: TASK_STABLE_RUN, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      labelSchema: NUMERIC_LABEL_SCHEMA,
    });
  }
  const ir = buildIntervalRegion(yhat - split.qhat, yhat + split.qhat);
  if (ir.abstain) {
    // NDG-1 (ADR-M011): a zero-width region (q̂=0 or float absorption yhat±q̂===yhat) ⇒ under_calib. REUSED.
    return underCalibVerdict({
      taskClass: TASK_STABLE_RUN, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      labelSchema: NUMERIC_LABEL_SCHEMA,
    });
  }
  return buildVerdict({
    taskClass: TASK_STABLE_RUN, method: "split", alpha: params.alpha, scores,
    region: ir.region, qhat: split.qhat, abstain: false, reason: "covered",
    residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
  });
}

/**
 * liquidation-eligible-coverage verdict (ADR-U4b D1/D3, decisions 108/126; checkpoint-1 C-5/C-7/C-10, delta
 * D-1/D-2). `yhat` is the caller-carried liquidable amount (base 8-dec). SERVER-owned: alpha/nMin are imposed
 * (a divergent value is a NAMED 400 — the L3 gate reads `params.nMin`, so a divergent nMin would diverge the
 * action); the stratum `k = strateOf(yhat)` is derived SERVER-side; the lookup key is re-derived
 * `${UKEMI_LIQ_PREDICTOR_BASE}/s${k}` (the CLIENT predictor_id is IGNORED for this class). In U-4b-2a the
 * registry is EMPTY of this class, so every yhat abstains `under_calib`. When a stratum is committed (U-4b-2b)
 * with qhat > 0 the region is the conformal UPPER BOUND [0, yhat + qhat] (liqUpperBoundRegion, delta D-1);
 * qhat = 0 abstains `under_calib` on the committed scores (delta D-2). Same primitive chain as stableRunVerdict
 * (splitQuantile -> region -> buildVerdict), but the region is an upper bound, NOT the symmetric interval.
 */
function liqEligibleVerdict(prediction: Prediction, params: HarnessParams): CoverageVerdict {
  const yhat = prediction.yhat as number; // dispatch narrowed typeof === "number"
  // Domain (checkpoint-1 C-7): a non-negative SAFE integer. The frozen scorer THROWS on a non-integer; the
  // server refuses FIRST with a named 400 (never a silent gate, never strateOf over a lossy float).
  if (!Number.isSafeInteger(yhat) || yhat < 0) {
    throw new HarnessToolError(
      `task_class '${TASK_LIQ_ELIGIBLE}' expects yhat to be a non-negative safe integer (base 8-dec liquidable amount), got ${String(yhat)}`,
    );
  }
  // alpha/nMin are SERVER-IMPOSED for this committed class (C-10 / delta D-6): divergent ⇒ a named 400.
  if (params.alpha !== LIQ_ALPHA) {
    throw new HarnessToolError(
      `task_class '${TASK_LIQ_ELIGIBLE}' requires params.alpha = ${String(LIQ_ALPHA)} (server-imposed for the committed class), got ${String(params.alpha)}`,
    );
  }
  if (params.nMin !== LIQ_NMIN) {
    throw new HarnessToolError(
      `task_class '${TASK_LIQ_ELIGIBLE}' requires params.nMin = ${String(LIQ_NMIN)} (server-imposed for the committed class), got ${String(params.nMin)}`,
    );
  }
  const k = strateOf(yhat);
  const predictorId = `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(k)}`;
  const committed = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, predictorId);
  if (committed === undefined) {
    // EMPTY registry (U-4b-2a) OR an uncommitted stratum ⇒ honest abstention (empty scores, n_calib 0).
    return underCalibVerdict({
      taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores: [],
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      labelSchema: NUMERIC_LABEL_SCHEMA,
    });
  }
  // Committed stratum (U-4b-2b): split-conformal qhat over the committed scores, then the UPPER-BOUND region.
  const scores = committed.scores;
  const split = splitQuantile(scores, params.alpha, params.nMin);
  if ("reason" in split) {
    // n < nMin or p > n ⇒ honest under_calib (fail-closed, mirror stableRunVerdict).
    return underCalibVerdict({
      taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      labelSchema: NUMERIC_LABEL_SCHEMA,
    });
  }
  const region = liqUpperBoundRegion(yhat, split.qhat);
  if (region.abstain) {
    // qhat = 0 (delta D-2): the committed stratum calibrated no high margin ⇒ honest abstention on the
    // committed scores (n_calib = n; coherent at L3 — reason==="under_calib" ⇒ ABSTAIN even at n>=nMin).
    return underCalibVerdict({
      taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      labelSchema: NUMERIC_LABEL_SCHEMA,
    });
  }
  return buildVerdict({
    taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores,
    region: region.region, qhat: split.qhat, abstain: false, reason: "covered",
    residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
  });
}

/**
 * The honesty text carried in the MCP tool result content (never inside the frozen decision, K-1).
 * B-1 (CRITICAL): keyed on the PRESENCE of calibration, NOT on `task_class` alone — a BYO decision on a
 * free-string class must NOT fall through to the CASCADE sentence (which would be false on the wire next
 * to a BYO COMMIT). The BYO carrier REUSES `CALIBRATE_LABEL` (B-2: one constant, no paraphrase).
 * A2 (ADR-M008 Amendement bis): the `stable-run-velocity-24h` honesty is keyed on (task_class, predictor_id)
 * — the COMMITTED sentence for the USDe key, the UNCOMMITTED (under_calib) sentence for every other population.
 * A surclaim mutant (returning the committed sentence for a non-committed key) reddens the A7(f) test.
 */
export function honestyText(taskClass: string, predictorId: string, isByo: boolean): string {
  if (isByo) return `${CALIBRATE_LABEL} B_t is caller-carried.`;
  if (taskClass === TASK_BTC_DIR) return `${BTC_DIR_CALIB_PROVENANCE} B_t is caller-carried.`;
  if (taskClass === TASK_STABLE_RUN) {
    const committed = lookupCommittedCalibration(TASK_STABLE_RUN, predictorId);
    return committed !== undefined
      ? `${STABLE_RUN_COMMITTED_SENTENCE}; B_t is caller-carried.`
      : `${STABLE_RUN_UNCALIBRATED_SENTENCE}; B_t is caller-carried.`;
  }
  if (taskClass === TASK_LIQ_ELIGIBLE) {
    // Keyed on REGISTRY presence (delta D-3), NOT on lookupCommittedCalibration(TASK_LIQ, predictorId): the
    // server ignores the client key for this class, and `honestyText` has no `yhat` to derive the stratum, so
    // a per-key lookup would either surclaim "committed" for a non-served stratum or read "no calibration" for
    // every naked id. In U-4b-2a the registry is empty ⇒ the honest empty-registry text.
    return hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE)
      ? `${LIQ_COMMITTED_SENTENCE}; B_t is caller-carried.`
      : `${LIQ_EMPTY_REGISTRY_SENTENCE}; B_t is caller-carried.`;
  }
  return `${CASCADE_UNCALIBRATED_SENTENCE}; B_t is caller-carried.`;
}

/**
 * A compact, FACTUAL restatement of the frozen decision, carried in the MCP `content` text ALONGSIDE the
 * honesty prose (a delivery aid, NOT a 4th K-1 carrier). Motivation: some MCP clients forward only
 * `content` text to the model and DROP `structuredContent` (measured on Hermes v0.21), so a `commit` and
 * an `under_calib` would read identically in the prose channel. This line surfaces the DECISION — action,
 * the coverage `reason` (how `under_calib` becomes visibly distinct from `covered`), the region, q̂,
 * n_calib, and a TRUNCATED calib_digest (8 leading + 6 trailing; the full value stays in
 * `structuredContent`). DERIVED from the same closed `GateDecision` (single source, no drift), it restates
 * only fields already on the wire and asserts NO probability of being right.
 */
export function gateVerdictSummary(d: GateDecision): string {
  const v = d.verdict;
  const region =
    v.region.kind === "interval"
      ? `[${String(v.region.lo)}, ${String(v.region.hi)}]`
      : `{${v.region.labels.join(", ")}}`;
  const qhat = v.qhat === null ? "null" : String(v.qhat);
  const digest =
    v.calib_digest.length > 14 ? `${v.calib_digest.slice(0, 8)}...${v.calib_digest.slice(-6)}` : v.calib_digest;
  return `verdict action=${d.action} reason=${d.reason} region=${region} qhat=${qhat} n_calib=${String(v.n_calib)} calib_digest=${digest}`;
}

/**
 * Compose the real primitives into a closed `GateDecision`. Throws `HarnessToolError` on an unknown
 * `task_class`, a wrong-typed `yhat`, or invalid params (K-4a). The gate NEVER calls `params.tool`.
 */
export function runGate(prediction: Prediction, params: HarnessParams, attested?: AttestedPrice): GateDecision {
  validateHarnessParams(params);
  if (prediction.schema_version !== SCHEMA_VERSION) {
    throw new HarnessToolError(
      `unsupported prediction.schema_version '${prediction.schema_version}': the harness speaks '${SCHEMA_VERSION}'`,
    );
  }

  const taskClass = prediction.task_class;
  const calibration = params.calibration;

  // Anti-override guard (C2 + A6, ADR-M008 Amendement bis): a BYO calibration must NEVER overwrite a
  // COMMITTED calibration. btc-dir/cascade are committed on the CLASS ⇒ locked for any predictor_id. The
  // stable-run class is committed by KEY (task_class, predictor_id) ⇒ locked ONLY for a committed key; a
  // DIFFERENT population on the same class MAY bring its own scores (BYO by κ by family). Fail-closed (400).
  // Hoisted out of the dispatch (ADR-M017 D2(ii) order: validateHarnessParams -> anti-override BYO ->
  // attested consistency -> dispatch); the throw and its message are byte-identical to the pre-M017 inline guard.
  if (calibration !== undefined) {
    const overridesCommitted =
      taskClass === TASK_BTC_DIR ||
      taskClass === TASK_CASCADE ||
      taskClass === TASK_LIQ_ELIGIBLE || // class-lock: the liq class is committed on the CLASS (server-imposed
      // alpha/nMin + server-derived stratum), so a BYO `calibration` may never override it, even on the empty
      // -2a registry where lookupCommittedCalibration would return undefined (mutant (c) drops this ⇒ RED).
      lookupCommittedCalibration(taskClass, prediction.predictor_id) !== undefined;
    if (overridesCommitted) {
      throw new HarnessToolError(
        `calibration must not override the committed (task_class, predictor_id) '${taskClass}' / '${prediction.predictor_id}': use a caller-owned key for BYO (ADR-M007 D7, ADR-M008 A6)`,
      );
    }
  }

  // Attested-consistency guard (ADR-M017 D2(i)(ii)): a caller-carried `attested` must DECLARE a subject
  // consistent with the served class (exact committed-URL membership). Never a verification — no verifier
  // runs here (K-8); a free/BYO class or a discordant subject fails closed to a tool error (400), naming the
  // subject and the class with the two distinct texts. Absent `attested` ⇒ a no-op (byte-identical behaviour).
  if (attested !== undefined) {
    const inconsistency = checkAttestedConsistency(taskClass, attested.subject);
    if (inconsistency !== undefined) {
      throw new HarnessToolError(inconsistency);
    }
  }

  let verdict: CoverageVerdict;
  let nCalib: number;

  if (calibration !== undefined) {
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
  } else if (taskClass === TASK_STABLE_RUN) {
    if (typeof prediction.yhat !== "number") {
      throw new HarnessToolError(`task_class '${TASK_STABLE_RUN}' expects a number yhat (velocity forecast), got ${typeof prediction.yhat}`);
    }
    verdict = stableRunVerdict(prediction, params);
    nCalib = verdict.n_calib; // 613 for the committed USDe key; 0 for any other population (under_calib)
  } else if (taskClass === TASK_LIQ_ELIGIBLE) {
    if (typeof prediction.yhat !== "number") {
      throw new HarnessToolError(`task_class '${TASK_LIQ_ELIGIBLE}' expects a number yhat (liquidable amount), got ${typeof prediction.yhat}`);
    }
    verdict = liqEligibleVerdict(prediction, params);
    nCalib = verdict.n_calib; // 0 on the empty -2a registry (under_calib); the committed count at -2b
  } else {
    // delta D-4: an unknown class (e.g. the class-B name, decision 108 keeps B out of service) ⇒ a
    // HarnessToolError (⇒ 400 via http.ts), NEVER `under_calib`. The `known:` list carries no class-B name
    // (D-2(a) grep=0), so the B name only appears as the unknown `'${taskClass}'`, never as a served class.
    throw new HarnessToolError(`unknown task_class '${taskClass}' (known: ${TASK_BTC_DIR}, ${TASK_CASCADE}, ${TASK_STABLE_RUN}, ${TASK_LIQ_ELIGIBLE}; or supply params.calibration for BYO)`);
  }

  // ADR-M017 D2(iii)/D4(3) — attested `residual` seam (P1-b2). When a caller-carried `attested` is present
  // (and, by the guard above, DECLARED-consistent with the served class), thread ITS residual into
  // `verdict.residual` — the traceability field the contract inherits from `AttestedPrice.residual`. `residual`
  // is NOT an honesty carrier (M-2): the L3 gate never reads it (l3-gate.ts `decide()` reads only region/reason),
  // so action/reason/allow are UNCHANGED — only this field is filed, UNCONDITIONALLY on the reason (covered /
  // under_calib / set_too_large). `params` files nothing (D2(iii)). Absent `attested` ⇒ no-op (byte-identical, D4(5)).
  if (attested !== undefined) {
    verdict = { ...verdict, residual: [...attested.residual] };
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
