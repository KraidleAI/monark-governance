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
 *   - `btc-dir-15m`         -> retired (ADR 0005, 2026-09-30; ADR-CM B-5): a named 400 `task_class_retired`; the
 *                             name stays reserved against BYO.
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
  buildSetRegion,
  buildIntervalRegion,
  buildVerdict,
  underCalibVerdict,
  conformInterval,
  gate,
  NUMERIC_LABEL_SCHEMA,
} from "@monark/hikae";
import type { GateInput } from "@monark/hikae";
import { assertClosedGateDecision, assertNoForbiddenKey } from "@monark/contracts";
import type { GateDecision, Prediction, CoverageVerdict, AttestedPrice } from "@monark/contracts";
import {
  lookupCommittedCalibration,
  UKEMI_LIQ_PREDICTOR_BASE,
  hasCommittedCalibrationForClass,
  asciiLower,
  matchesCommittedKeyFolded,
  matchesCommittedKeyWith,
} from "../calibration.ts";
// (ADR-U4b D1/D3/D4, decisions 108/126): the served Mondrian strata + the upper-bound region helper. A PURE
// sibling at src/ (no I/O; imports only @monark/hikae), so importing it keeps the K-8 tools scan meaningful
// and re-declares strateOf WITHOUT importing the frozen scorer (which reads node:fs + apps/sentinel, D-4).
import { strateOf, liqUpperBoundRegion } from "../ukemi-strata.ts";
// (ADR-M007 D7): the BYO path REUSES the calibrate constants — the score cap (single source) and
// the K-1 honesty label (B-2: one constant, no paraphrase, no banned overclaim verb). Errors on the
// gate BYO path are `HarnessToolError` (already ∈ http.ts TOOL_ERROR_NAMES ⇒ 400), NOT CalibrateToolError.
import { CALIBRATE_MAX_N, CALIBRATE_LABEL } from "./calibrate.ts";
// (ADR-CM B-2, F-7): the class policy rows (alpha, nMin imposed for a committed calibration). Pure sibling at src/.
import { LIQ_POLICY, USDE_POLICY, type ClassPolicyRow } from "../class-policy.ts";
// (ADR-M017 D2): the committed subject<->class binding table + the pure consistency predicate. A pure
// sibling module at src/ (no I/O, imports nothing from the tools), so the K-8 tools scan stays meaningful
// and there is no import cycle (attestation-binding.ts never imports gate.ts).
import { checkAttestedConsistency, NO_SERVED_ATTESTATION_SUBJECT_SENTENCE } from "../attestation-binding.ts";

/** Server-fixed contract version (K-4c) — NOT carried by the caller. */
export const SCHEMA_VERSION = "1.0.0";

/** Retired (ADR 0005, decided 2026-09-30; ADR-CM B-5): answered by a named 400, the name reserved against BYO. */
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
 * caller never picks it, C-10); alpha/nMin are SERVER-imposed (a divergent params value is a named 400). The
 * committed registry holds stratum s0 (n = 170, U-4b-2b); a yhat of strata s1 to s3 abstains under_calib.
 */
export const TASK_LIQ_ELIGIBLE = "liquidation-eligible-coverage";

/** Server-imposed calibration params for the committed liq class (ADR-U4b D3; == the frozen generator
 *  ALPHA/NMIN). A divergent `params.alpha`/`params.nMin` is a NAMED 400, never a silent override: the L3
 *  gate reads `params.nMin`, so a divergent nMin would diverge the action (delta D-6, C-10). */
export const LIQ_ALPHA = LIQ_POLICY.alpha;
export const LIQ_NMIN = LIQ_POLICY.nMin;

/** The retirement message of `btc-dir-15m` (ADR-CM B-5). */
export const BTC_DIR_RETIRED_MESSAGE =
  `task_class '${TASK_BTC_DIR}' is retired (ADR 0005, decided 2026-09-30): it is no longer served; the name stays reserved against BYO`;

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
  "which is not assumed here; no coverage is measured; each band edge is yhat - qhat or yhat + qhat rounded to the " +
  "nearest double, so it can differ from the exact edge by up to half a unit in the last place of that edge; the " +
  "band is not widened for it";

/** The SERVER-imposed params of the committed USDe key, declared in the class description (ADR-CM B-2). */
export const STABLE_RUN_REQUIREMENTS_SENTENCE = `on that key it requires alpha = ${String(USDE_POLICY.alpha)}, nMin = ${String(USDE_POLICY.nMin)}`;

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
 * Tool description (K-4e / C-2): declares the retired btc-dir class (ADR-CM B-5), the cascade sentence, AND the BYO path.
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
    "authorization budget B_t. Dispatches on task_class. The class 'btc-dir-15m' is retired and answers a named " +
    `refusal. For 'cascade-liquidable-24h' ${CASCADE_UNCALIBRATED_SENTENCE}. ` +
    `For 'stable-run-velocity-24h' (Narabi: a redemption-flow velocity forecast) the gate holds ${STABLE_RUN_COMMITTED_CORE}; ` +
    `${STABLE_RUN_REQUIREMENTS_SENTENCE}; ` +
    `for any other population, ${STABLE_RUN_UNCALIBRATED_SENTENCE}. ` +
    `For '${TASK_LIQ_ELIGIBLE}' (Ukemi: a per-account liquidable-amount class, class A only) ${liqClause}. ` +
    "When the caller instead supplies a `calibration` (its own nonconformity scores plus a `mode`: `interval` " +
    "⇒ region [yhat - q̂, yhat + q̂], or `set` ⇒ a conformal set over caller `candidates`), the gate " +
    `conformalizes against THOSE caller-supplied scores (BYO): ${CALIBRATE_LABEL} ` +
    "A caller-carried `attested` price must declare a subject consistent with the committed task class " +
    "(exact committed-URL membership; BYO classes do not accept `attested` in P1); " +
    GATE_NON_REVERIFICATION_SENTENCE +
    `; no temporal binding in P1. ${NO_SERVED_ATTESTATION_SUBJECT_SENTENCE} ` +
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

/**
 * Stable error codes (ADR-CM section 5 B-3, audit P3 S-6; plan docs/G0-lot-cm-2a.md): a closed list, outside the frozen
 * contracts. The HTTP mirror carries the code in its error body, MCP in `_meta[ERROR_CODE_META_KEY]`. The four
 * class defaults (attest, calibrate, cascade, ukemi-predict) follow the gate codes; `task_class_retired` is
 * thrown for `btc-dir-15m` since CM-2b (ADR-CM B-5). A code is never renamed nor reused for another refusal.
 */
export const HARNESS_ERROR_CODES = [
  "param_invalid", "schema_version_unsupported", "byo_calibration_invalid", "byo_yhat_type", "byo_set_tau_cap",
  "yhat_type_mismatch", "liq_yhat_domain", "attested_inconsistent", "task_class_unknown", "byo_overrides_committed",
  "byo_edge_blank", "byo_lookalike_committed", "byo_reserved_kata", "byo_lookalike_confusable",
  "produced_at_invalid", "produced_at_future", "output_invalid",
  "policy_alpha_mismatch", "policy_nmin_mismatch", "task_class_retired",
  "attest_refused", "calibrate_input_invalid", "cascade_input_invalid", "ukemi_predict_input_invalid",
] as const;
export type HarnessErrorCode = (typeof HARNESS_ERROR_CODES)[number];

/** The MCP `_meta` key of a tool error's code (B-3, amendment "nuit, 2"). */
export const ERROR_CODE_META_KEY = "monarkgate.tech/error_code";

/** A tool-level error (K-4a): surfaced by the MCP seam as a tool error, never a silent gate. */
export class HarnessToolError extends Error {
  readonly code: HarnessErrorCode;
  constructor(message: string, code: HarnessErrorCode) {
    super(message);
    this.name = "HarnessToolError";
    this.code = code;
  }
}

/** The stable code of a harness tool error (any tool error class), or undefined for any other throw. */
export function toolErrorCode(error: unknown): HarnessErrorCode | undefined {
  if (!(error instanceof Error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return (HARNESS_ERROR_CODES as readonly unknown[]).includes(code) ? (code as HarnessErrorCode) : undefined;
}

function requireFinite(value: number, name: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HarnessToolError(`invalid param '${name}': expected a finite number`, "param_invalid");
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
    throw new HarnessToolError("invalid param 'nMin': expected an integer >= 1", "param_invalid");
  }
  if (!(params.alpha > 0 && params.alpha < 1)) {
    throw new HarnessToolError("invalid param 'alpha': expected a number in the open interval (0,1)", "param_invalid");
  }
  if (params.tau < 0) throw new HarnessToolError("invalid param 'tau': expected >= 0", "param_invalid");
  if (params.tauInterval < 0) throw new HarnessToolError("invalid param 'tauInterval': expected >= 0", "param_invalid");
  if (params.bFloor < 0) throw new HarnessToolError("invalid param 'bFloor': expected >= 0", "param_invalid");
  if (typeof params.tool !== "string" || params.tool.length === 0) {
    throw new HarnessToolError("invalid param 'tool': expected a non-empty string", "param_invalid");
  }
  if (typeof params.clockOpen !== "boolean") {
    throw new HarnessToolError("invalid param 'clockOpen': expected a boolean", "param_invalid");
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
    throw new HarnessToolError(`invalid calibration.mode: expected 'interval' or 'set'`, "byo_calibration_invalid");
  }
  // `scores`/`candidates` are typed arrays and array-typed at the SDK boundary (schema); we do NOT use
  // `Array.isArray` here — its guard narrows a typed array to `any[]` (signature `arg is any[]`), which
  // would poison the element types. We iterate the typed array directly (motif calibrate.ts).
  if (cal.scores.length > CALIBRATE_MAX_N) {
    throw new HarnessToolError(
      `invalid calibration.scores: ${String(cal.scores.length)} scores exceeds the cap of ${String(CALIBRATE_MAX_N)} (resource guard)`,
      "byo_calibration_invalid",
    );
  }
  for (let i = 0; i < cal.scores.length; i++) {
    const s = cal.scores[i];
    if (s === undefined || !Number.isFinite(s)) {
      throw new HarnessToolError(`invalid calibration.scores[${String(i)}]: expected a finite number`, "byo_calibration_invalid");
    }
  }
  if (cal.mode === "interval") {
    // B-4/B-6: a negative nonconformity score would make q̂ negative ⇒ lo > hi ⇒ buildIntervalRegion throws.
    for (let i = 0; i < cal.scores.length; i++) {
      if ((cal.scores[i] ?? 0) < 0) {
        throw new HarnessToolError(`invalid calibration.scores[${String(i)}]: interval mode requires non-negative nonconformity scores (B-6)`, "byo_calibration_invalid");
      }
    }
    return;
  }
  // set mode: candidates required, non-empty, well-formed, unique labels (B-3).
  const candidates = cal.candidates;
  if (candidates === undefined || candidates.length === 0) {
    throw new HarnessToolError("invalid calibration.candidates: set mode requires a non-empty candidate list", "byo_calibration_invalid");
  }
  if (candidates.length > CALIBRATE_MAX_N) {
    throw new HarnessToolError(`invalid calibration.candidates: ${String(candidates.length)} exceeds the cap of ${String(CALIBRATE_MAX_N)}`, "byo_calibration_invalid");
  }
  const seen = new Set<string>();
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (c === undefined || typeof c.label !== "string" || !PRINTABLE_ASCII.test(c.label)) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: expected a non-empty printable-ASCII string`, "byo_calibration_invalid");
    }
    if (c.label.includes("|")) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: must not contain '|' (label_schema separator, B-3)`, "byo_calibration_invalid");
    }
    if (seen.has(c.label)) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: duplicate label '${c.label}'`, "byo_calibration_invalid");
    }
    seen.add(c.label);
    if (typeof c.score !== "number" || !Number.isFinite(c.score)) {
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].score: expected a finite number`, "byo_calibration_invalid");
    }
  }
}

/**
 * BYO set-mode tau cap (ADR-M005 D5 K-4(d) amendment 2026-09-30, class policy v1, D3 and D5): tau above the
 * number of candidates minus 1 would let a COMMIT stand on the whole candidate list, so it is a named tool error
 * (400) that names the required value. Runs after `validateCalibration` (B-3 label checks) and the yhat type
 * check; interval mode is not capped.
 */
function assertByoSetTauCap(params: HarnessParams, cal: ByoCalibration): void {
  if (cal.mode !== "set") return;
  const candidates = cal.candidates ?? [];
  if (params.tau > candidates.length - 1) {
    throw new HarnessToolError(
      `byo 'set' mode requires params.tau = ${String(candidates.length - 1)} or smaller (the number of candidates minus 1, so a COMMIT is never on the whole candidate list), got ${String(params.tau)}`,
      "byo_set_tau_cap",
    );
  }
}

/**
 * BYO conformal path (C2, ADR-M007 D7): compose the SAME real HIKAE primitives on the CALLER's scores.
 * Order mirrors `validateCalibration` then the committed dispatch — validate, then check `yhat` TYPE for the
 * mode (wrong type ⇒ tool error BEFORE any computation), then `splitQuantile` (under-calibration ⇒ fail-closed
 * `underCalibVerdict`), then the region. `abstain`/`reason` conventions mirror the committed paths (set:
 * |C|>tau => set_too_large else covered, as the retired btc-dir path did, but |C|=0 => intent_not_in_region (P3, D8); interval: abstain:false/covered, as in
 * `conformInterval`; the L3 gate decides DEFER/ABSTAIN on the width). Every error is `HarnessToolError`
 * (⇒ 400), never a 500. (Line-number cross-refs refreshed for F2-B — the "next touch" M011 promised.)
 */
function byoVerdict(prediction: Prediction, params: HarnessParams, cal: ByoCalibration): CoverageVerdict {
  validateCalibration(cal);
  const taskClass = prediction.task_class;
  const yhat = prediction.yhat;

  // WRONG-typed yhat for the mode ⇒ tool error BEFORE the region (C-1, mirror the committed dispatch's yhat check).
  if (cal.mode === "interval" && typeof yhat !== "number") {
    throw new HarnessToolError(`byo 'interval' mode expects a number yhat, got ${typeof yhat}`, "byo_yhat_type");
  }
  if (cal.mode === "set" && typeof yhat !== "string") {
    throw new HarnessToolError(`byo 'set' mode expects a string yhat (label), got ${typeof yhat}`, "byo_yhat_type");
  }
  assertByoSetTauCap(params, cal); // D3 order: after the B-3 label checks and the yhat type check

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
    throw new HarnessToolError("byo 'set' mode requires a non-empty candidate list", "byo_calibration_invalid");
  }
  const derivedSchema = labelSchema ?? candidates.map((c) => c.label).join("|");
  const labels = conformalSet(new Map(candidates.map((c) => [c.label, c.score] as const)), qhat);
  // P3 (ADR-M005 D5 K-4(d) amendment 2026-09-30, D8): an EMPTY set holds no intent, so the verdict abstains with
  // intent_not_in_region (qhat stays the number, unlike under_calib); never covered. abstain = 1{|C| > tau or |C| = 0}.
  const empty = labels.length === 0;
  const abstain = empty || labels.length > params.tau;
  return buildVerdict({
    taskClass,
    method: "split",
    alpha: params.alpha,
    scores: cal.scores,
    region: buildSetRegion(labels, derivedSchema),
    qhat,
    abstain,
    reason: empty ? "intent_not_in_region" : abstain ? "set_too_large" : "covered",
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
 * F-7 policy (ADR-CM B-2): a committed calibration's alpha and nMin are server-imposed; a different value is a named
 * 400 (strict equality), never a silent override. The liq messages are byte-identical to the pre-F-7 ones.
 */
function assertPolicy(row: ClassPolicyRow, params: HarnessParams): void {
  const who = row.predictorId === null ? `task_class '${row.taskClass}'` : `task_class '${row.taskClass}' with predictor_id '${row.predictorId}'`;
  const what = row.predictorId === null ? "class" : "key";
  if (params.alpha !== row.alpha) {
    throw new HarnessToolError(
      `${who} requires params.alpha = ${String(row.alpha)} (server-imposed for the committed ${what}), got ${String(params.alpha)}`,
      "policy_alpha_mismatch",
    );
  }
  if (params.nMin !== row.nMin) {
    throw new HarnessToolError(
      `${who} requires params.nMin = ${String(row.nMin)} (server-imposed for the committed ${what}), got ${String(params.nMin)}`,
      "policy_nmin_mismatch",
    );
  }
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
  // Committed population (USDe): alpha/nMin are server-imposed (F-7, ADR-CM B-2), then split-conformal over the
  // committed SCORES. Same primitive chain as byoVerdict's interval branch (one quantile implementation, L1).
  assertPolicy(USDE_POLICY, params);
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
 * `${UKEMI_LIQ_PREDICTOR_BASE}/s${k}` (the CLIENT predictor_id is IGNORED for this class). The committed
 * registry holds stratum s0 (U-4b-2b); s1 to s3 are uncommitted and abstain `under_calib`. For a committed stratum
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
      "liq_yhat_domain",
    );
  }
  // alpha/nMin are SERVER-IMPOSED for this committed class (C-10 / delta D-6, F-7 row): divergent => a named 400.
  assertPolicy(LIQ_POLICY, params);
  const k = strateOf(yhat);
  const predictorId = `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(k)}`;
  const committed = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, predictorId);
  if (committed === undefined) {
    // An uncommitted stratum (s1 to s3) => honest abstention (empty scores, n_calib 0).
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
    // every naked id. Since U-4b-2b the registry carries s0 (n 170), so the committed text; an empty registry gives the empty-registry text.
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

/** A leading or trailing blank (Unicode `\s`, which covers space, tab and no-break space). */
const EDGE_BLANK = /^\s|\s$/u;
/** The reserved kata class names (ADR 0005 D3; widened for wave 2 by its own ADR). */
const KATA_CLASS_RE = /^(btc|eth|bnb|sol)-(dir|range|mae-down|mae-up)-(1h|4h)$/;
/** The reserved kata key prefix. */
const KATA_KEY_PREFIX = "kata:";
/** The classes committed on the CLASS (any key), as in the exact guard of `runGate`. */
const CLASS_LOCKED = [TASK_BTC_DIR, TASK_CASCADE, TASK_LIQ_ELIGIBLE] as const;

/**
 * The ASCII confusable reduction of ADR-CM B-10 (BYO-ASCII-LOOKALIKE-1; plan docs/G0-lot-cm-2c.md), applied to both
 * sides of every comparison: ASCII lower case; blanks removed; "rn" -> "m"; i, l and 1 -> "l" (upper-case I lowers to
 * i); "0" -> "o"; "_" and "." -> "-"; runs of "-" collapsed; "-" trimmed at both ends.
 */
export function confusableReduce(s: string): string {
  return asciiLower(s)
    .replace(/\s+/gu, "")
    .replace(/rn/g, "m")
    .replace(/[l1i]/g, "l")
    .replace(/0/g, "o")
    .replace(/[_.]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The 32 reserved kata class names, reduced (exact set, no reduced regex). */
const KATA_CLASSES_REDUCED: ReadonlySet<string> = new Set(
  ["btc", "eth", "bnb", "sol"].flatMap((a) =>
    ["dir", "range", "mae-down", "mae-up"].flatMap((f) => ["1h", "4h"].map((h) => confusableReduce(`${a}-${f}-${h}`))),
  ),
);

/**
 * BYO confusable rule (ADR-CM B-10). Runs after the B-1 rule, so a name B-1 refuses keeps its B-1 message and code.
 * Refuses a class whose reduction is a class-locked name or a reserved kata name, a (class, key) pair whose reduction
 * is a committed pair, and a key whose reduction, with "4" read as "a" (key prefix only), starts with "kata:". Any ASCII
 * look-alike outside this closed reduction still passes: a declared residual class (BYO-LOOKALIKE-RESIDUAL-1). */
function byoConfusable(taskClass: string, predictorId: string): string | undefined {
  const cls = confusableReduce(taskClass);
  const lockedOrKata = CLASS_LOCKED.some((c) => confusableReduce(c) === cls) || KATA_CLASSES_REDUCED.has(cls);
  const kataKey = confusableReduce(predictorId).replace(/4/g, "a").startsWith(KATA_KEY_PREFIX);
  if (lockedOrKata || kataKey || matchesCommittedKeyWith(confusableReduce, taskClass, predictorId)) {
    return `task_class '${taskClass}' / predictor_id '${predictorId}' reduces to a committed or reserved name once ASCII confusables are folded (l, I, 1; rn, m; 0, o; _ and . as -; repeated -; blanks): use a distinct caller-owned name for BYO (ADR-CM B-10)`;
  }
  return undefined;
}

/**
 * BYO look-alike rule (ADR-CM §5 B-1, audit P3 S-11; plan docs/G0-lot-cm-1-byo-near-name.md). Returns the 400
 * message and its code when a BYO (task_class, predictor_id) imitates a committed name or takes a reserved kata name, else
 * undefined. Fold = `asciiLower` (A to Z only); non-ASCII homoglyphs are a declared residual (BYO-HOMOGLYPH-1).
 */
function byoLookAlike(taskClass: string, predictorId: string): { readonly message: string; readonly code: HarnessErrorCode } | undefined {
  if (EDGE_BLANK.test(taskClass) || EDGE_BLANK.test(predictorId)) {
    return { code: "byo_edge_blank", message: `byo task_class and predictor_id must not start or end with a blank: ${JSON.stringify(taskClass)} / ${JSON.stringify(predictorId)} (ADR-CM B-1)` };
  }
  const cls = asciiLower(taskClass);
  const key = asciiLower(predictorId);
  if ((CLASS_LOCKED as readonly string[]).includes(cls) || matchesCommittedKeyFolded(taskClass, predictorId)) {
    return { code: "byo_lookalike_committed", message: `calibration must not override the committed (task_class, predictor_id) '${taskClass}' / '${predictorId}', compared without ASCII case: use a caller-owned key for BYO (ADR-CM B-1, ADR-M008 A6)` };
  }
  if (KATA_CLASS_RE.test(cls) || key.startsWith(KATA_KEY_PREFIX)) {
    return { code: "byo_reserved_kata", message: `task_class '${taskClass}' / predictor_id '${predictorId}' takes a name reserved for MONARK kata classes (pattern ${KATA_CLASS_RE.source}, key prefix '${KATA_KEY_PREFIX}'): use a caller-owned name for BYO (ADR-CM B-1)` };
  }
  return undefined;
}

/** "Not in the future" tolerance at the HTTP and MCP entry points (ADR-CM section 5 B-4): 300 s of clock skew. */
export const PRODUCED_AT_FUTURE_TOLERANCE_MS = 300_000;

/** RFC 3339 section 5.6 date-time: full-date "T" full-time, fraction optional, offset Z or +-hh:mm (T and Z in either case). */
const RFC3339_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/;

/**
 * The instant (epoch ms) of a STRICT RFC 3339 date-time, or undefined (ADR-CM B-4, audit P3 S-10 and P5(b)). The
 * calendar date (leap years included), hour 00-23 and minute 00-59 are checked by a round trip through a UTC date
 * (a field out of range rolls over and fails the round trip); offset at most 23:59; second 00-59, or 60 only when
 * the UTC time is 23:59 (a leap second, as the served ajv `date-time` format; it counts as the next second). The
 * fraction counts in milliseconds (its first 3 digits, truncated), so the 300 s tolerance is exact. Pure: no clock.
 */
export function rfc3339Instant(text: string): number | undefined {
  const m = RFC3339_DATE_TIME.exec(text);
  if (m === null) return undefined;
  const [y, mo, d, h, mi, sec] = [m[1], m[2], m[3], m[4], m[5], m[6]].map(Number) as [number, number, number, number, number, number];
  const ms = Number((m[7] ?? "").slice(0, 3).padEnd(3, "0"));
  const offH = Number(m[9] ?? "0");
  const offM = Number(m[10] ?? "0");
  if (sec > 60 || offH > 23 || offM > 59) return undefined;
  const t = new Date(0);
  t.setUTCFullYear(y, mo - 1, d);
  t.setUTCHours(h, mi, 0, 0);
  const roundTrip = t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d && t.getUTCHours() === h && t.getUTCMinutes() === mi;
  if (!roundTrip) return undefined;
  const sign = m[8] === "-" ? -1 : 1;
  const minuteUtc = new Date(t.getTime() - sign * (offH * 60 + offM) * 60_000);
  const leapMinute = minuteUtc.getUTCHours() === 23 && minuteUtc.getUTCMinutes() === 59;
  if (sec === 60 && !leapMinute) return undefined;
  return minuteUtc.getTime() + sec * 1000 + ms;
}

/** Options of `runGate`. `nowMs` is the current instant, read in src/ by the HTTP and MCP entry points and injected
 *  (K-8: no clock under src/tools/). Absent (a direct call) => only the RFC 3339 check runs (declared, B-4). */
export interface RunGateOptions {
  readonly nowMs?: number;
}

/** `produced_at` (ADR-CM B-4): strict RFC 3339, else 400 `produced_at_invalid`; with `nowMs`, at most
 *  PRODUCED_AT_FUTURE_TOLERANCE_MS after it, else 400 `produced_at_future`. No bar grid (USDe, liq, cascade, BYO). */
function assertProducedAt(producedAt: string, nowMs: number | undefined): void {
  const at = typeof producedAt === "string" ? rfc3339Instant(producedAt) : undefined;
  if (at === undefined) {
    throw new HarnessToolError(`invalid prediction.produced_at ${JSON.stringify(producedAt)}: expected an RFC 3339 date-time (ADR-CM B-4)`, "produced_at_invalid");
  }
  if (nowMs !== undefined && at > nowMs + PRODUCED_AT_FUTURE_TOLERANCE_MS) {
    throw new HarnessToolError(
      `prediction.produced_at '${producedAt}' is in the future: more than ${String(PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000)} s after the server clock (ADR-CM B-4)`,
      "produced_at_future",
    );
  }
}

/**
 * Compose the real primitives into a closed `GateDecision`. Throws `HarnessToolError` on an unknown
 * `task_class`, a wrong-typed `yhat`, an invalid `produced_at`, or invalid params (K-4a). The gate NEVER calls
 * `params.tool`.
 */
export function runGate(prediction: Prediction, params: HarnessParams, attested?: AttestedPrice, options: RunGateOptions = {}): GateDecision {
  validateHarnessParams(params);
  if (prediction.schema_version !== SCHEMA_VERSION) {
    throw new HarnessToolError(
      `unsupported prediction.schema_version '${prediction.schema_version}': the harness speaks '${SCHEMA_VERSION}'`,
      "schema_version_unsupported",
    );
  }
  assertProducedAt(prediction.produced_at, options.nowMs);

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
      // alpha/nMin + server-derived stratum), so a BYO `calibration` may never override it, whatever the key:
      // lookupCommittedCalibration only knows the s0 key (mutant (c) drops this => RED).
      lookupCommittedCalibration(taskClass, prediction.predictor_id) !== undefined;
    if (overridesCommitted) {
      throw new HarnessToolError(
        `calibration must not override the committed (task_class, predictor_id) '${taskClass}' / '${prediction.predictor_id}': use a caller-owned key for BYO (ADR-M007 D7, ADR-M008 A6)`,
        "byo_overrides_committed",
      );
    }
    // Look-alike guard (ADR-CM B-1, audit P3 S-11): AFTER the exact guard, so an exact committed name keeps its
    // message byte for byte; a name that only imitates one (ASCII case, edge blank, checksum-case address) or
    // takes a reserved kata name is refused too.
    const lookAlike = byoLookAlike(taskClass, prediction.predictor_id);
    if (lookAlike !== undefined) {
      throw new HarnessToolError(lookAlike.message, lookAlike.code);
    }
    // Confusable guard (ADR-CM B-10, BYO-ASCII-LOOKALIKE-1): after B-1, whose messages and codes stay byte-identical.
    const confusable = byoConfusable(taskClass, prediction.predictor_id);
    if (confusable !== undefined) {
      throw new HarnessToolError(confusable, "byo_lookalike_confusable");
    }
  }

  // Attested-consistency guard (ADR-M017 D2(i)(ii)): a caller-carried `attested` must DECLARE a subject
  // consistent with the served class (exact committed-URL membership). Never a verification — no verifier
  // runs here (K-8); a free/BYO class or a discordant subject fails closed to a tool error (400), naming the
  // subject and the class with the two distinct texts. Absent `attested` ⇒ a no-op (byte-identical behaviour).
  if (attested !== undefined) {
    const inconsistency = checkAttestedConsistency(taskClass, attested.subject);
    if (inconsistency !== undefined) {
      throw new HarnessToolError(inconsistency, "attested_inconsistent");
    }
  }

  let verdict: CoverageVerdict;
  let nCalib: number;

  if (calibration !== undefined) {
    verdict = byoVerdict(prediction, params, calibration);
    nCalib = calibration.scores.length;
  } else if (taskClass === TASK_BTC_DIR) {
    // ADR-CM B-5 (S-12): retired, never served; the BYO guards above keep the name reserved.
    throw new HarnessToolError(BTC_DIR_RETIRED_MESSAGE, "task_class_retired");
  } else if (taskClass === TASK_CASCADE) {
    if (typeof prediction.yhat !== "number") {
      throw new HarnessToolError(`task_class '${TASK_CASCADE}' expects a number yhat (amount), got ${typeof prediction.yhat}`, "yhat_type_mismatch");
    }
    verdict = cascadeVerdict(prediction, params);
    nCalib = verdict.n_calib; // 0 — no committed cascade calibration
  } else if (taskClass === TASK_STABLE_RUN) {
    if (typeof prediction.yhat !== "number") {
      throw new HarnessToolError(`task_class '${TASK_STABLE_RUN}' expects a number yhat (velocity forecast), got ${typeof prediction.yhat}`, "yhat_type_mismatch");
    }
    verdict = stableRunVerdict(prediction, params);
    nCalib = verdict.n_calib; // 613 for the committed USDe key; 0 for any other population (under_calib)
  } else if (taskClass === TASK_LIQ_ELIGIBLE) {
    if (typeof prediction.yhat !== "number") {
      throw new HarnessToolError(`task_class '${TASK_LIQ_ELIGIBLE}' expects a number yhat (liquidable amount), got ${typeof prediction.yhat}`, "yhat_type_mismatch");
    }
    verdict = liqEligibleVerdict(prediction, params);
    nCalib = verdict.n_calib; // 170 for the committed stratum s0; 0 for s1 to s3 (under_calib)
  } else {
    // delta D-4: an unknown class (e.g. the class-B name, decision 108 keeps B out of service) ⇒ a
    // HarnessToolError (⇒ 400 via http.ts), NEVER `under_calib`. The `known:` list carries no class-B name
    // (D-2(a) grep=0), so the B name only appears as the unknown `'${taskClass}'`, never as a served class.
    throw new HarnessToolError(`unknown task_class '${taskClass}' (known: ${TASK_CASCADE}, ${TASK_STABLE_RUN}, ${TASK_LIQ_ELIGIBLE}; or supply params.calibration for BYO)`, "task_class_unknown");
  }

  // ADR-M017 D2(iii)/D4(3) — attested `residual` seam (P1-b2). When a caller-carried `attested` is present
  // (and, by the guard above, DECLARED-consistent with the served class), thread ITS residual into
  // `verdict.residual` — the traceability field the contract inherits from `AttestedPrice.residual`. `residual`
  // is NOT an honesty carrier (M-2): the L3 gate never reads it (l3-gate.ts `decide()` reads only region/reason),
  // so action/reason/allow are UNCHANGED — only this field is filed, UNCONDITIONALLY on the reason (covered /
  // under_calib / set_too_large). `params` files nothing (D2(iii)). Absent `attested` ⇒ no-op (byte-identical, D4(5)).
  // Dormant on the served surface since CM-2b (ADR-CM amendment "nuit, 3"): no served class has a committed subject;
  // kept for ATTEST-KATA-SUBJECT-1.
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
