/**
 * Harness — the `gate` tool.
 *
 * A PURE composition of the REAL HIKAE primitives (imported, never re-implemented): it dispatches
 * on `task_class`, conformalizes, then runs the frozen L3 `gate()` policy and returns a closed
 * `GateDecision`. NO side effects: this file — like everything under `src/tools/` — imports
 * no `node:fs`/`node:net`/`node:child_process`, calls no `fetch`, writes no `process.env`, reads no
 * clock (`produced_at` is the caller-carried instant from the `Prediction`).
 *
 * Dispatch:
 *   - `btc-dir-15m`         -> retired (2026-09-30): a named 400 `task_class_retired`; the
 *                             name stays reserved against BYO.
 *   - `cascade-liquidable-24h` → `conformInterval` with NO committed calibration ⇒ no region (null) ⇒
 *                             `abstain`/`under_calib`. That is the honest expected result, not a defect.
 *   - `stable-run-velocity-24h` → committed calibration looked up PER KEY (task_class, predictor_id):
 *                             the USDe key ⇒ its admitted row + `scoreTestBand`
 *                             over USDE_STABLE_RUN_CALIB (region `interval`); any other key ⇒ `under_calib`.
 *
 * Server-owned fields: `schema_version` is `SCHEMA_VERSION` of @monark/contracts, `timedOut=false`,
 * `evaluable`/`nCalib` are derived; `clockOpen`, `tau`, `tauInterval`, `alpha`, `nMin`, `bFloor`,
 * `remainingBudget` (B_t), `intent`, `tool` are caller-carried. Invalid params ⇒ a tool error,
 * never a silent gate. The gate ONLY emits a decision; it NEVER calls `params.tool`.
 */
import {
  splitQuantileShortest,
  conformalSet,
  buildSetRegion,
  scoreTestBand,
  buildVerdict,
  underCalibVerdict, noRegionVerdict, suiviDenBits, suiviReplay,
  conformInterval, aciBoundText, aciLevelText, aciReplay,
  gate,
} from "@monark/hikae";
import type { AciEvidence, AciState, GateInput, SuiviEvidence, VerdictCell } from "@monark/hikae";
import { assertClosedGateDecision, assertNoForbiddenKey, requestSha256, sha256Canonical, SCHEMA_VERSION, TOOL_ERROR_CODES } from "@monark/contracts";
import type { GateDecision, Prediction, CoverageVerdict, AttestedPrice, ClassEntry } from "@monark/contracts";
import {
  lookupCommittedCalibration,
  UKEMI_LIQ_PREDICTOR_BASE,
  hasCommittedCalibrationForClass,
  asciiLower,
  matchesCommittedKeyFolded,
  matchesCommittedKeyWith,
} from "../calibration.ts";
// The served Mondrian strata + the upper-bound region helper. A PURE
// sibling at src/ (no I/O; imports only @monark/hikae), so importing it keeps the tools scan meaningful
// and re-declares strateOf WITHOUT importing the frozen scorer (which reads node:fs + apps/sentinel).
import { strateOf, liqUpperBoundRegion } from "../ukemi-strata.ts";
// The BYO path REUSES the calibrate constants — the score cap (single source) and
// the honesty label (one constant, no paraphrase, no banned overclaim verb). Errors on the
// gate BYO path are `HarnessToolError` (already ∈ http.ts TOOL_ERROR_NAMES ⇒ 400), NOT CalibrateToolError.
import { ACI_LABEL, CALIBRATE_MAX_N, CALIBRATE_LABEL } from "./calibrate.ts";
// The class policy rows (alpha, nMin imposed for a committed calibration). Pure sibling at src/.
import { LIQ_POLICY, USDE_POLICY, type ClassPolicyRow } from "../class-policy.ts";
// The committed subject<->class binding table + the pure consistency predicate. A pure
// sibling module at src/ (no I/O, imports nothing from the tools), so the tools scan stays meaningful
// and there is no import cycle (attestation-binding.ts never imports gate.ts).
import { checkAttestedConsistency, NO_SERVED_ATTESTATION_SUBJECT_SENTENCE } from "../attestation-binding.ts";
import type { ServedTable, ServedTableTexts } from "../policy-served.ts";
// The served kata path. kata-path.ts reads the exports of this file at call time only, so the import
// cycle is safe; servedPolicyTables reads none of them while this file loads.
import { kataPath, kataTablesMatchPins, kataVerdict, servedPolicyTables } from "../kata-path.ts";
import { KATA_DIR_TAU_CAP, kataClassEntries } from "../policy-classes.ts";

/** Server-fixed contract version, the one constant of @monark/contracts — NOT carried by the caller. */
export { SCHEMA_VERSION };

/** Retired (decided 2026-09-30): answered by a named 400, the name reserved against BYO. */
export const TASK_BTC_DIR = "btc-dir-15m";
export const TASK_CASCADE = "cascade-liquidable-24h";
/**
 * Narabi velocity-forecast class. "24h" = the forecast horizon. A calibration is committed PER KEY
 * (task_class, predictor_id): the USDe key
 * (calibration.ts USDE_STABLE_RUN_PREDICTOR_ID) conformalizes; every other key abstains under_calib.
 */
export const TASK_STABLE_RUN = "stable-run-velocity-24h";

/**
 * Ukemi liquidation-eligible-coverage class (class A only). Number yhat = the
 * caller-carried liquidable amount (base 8-dec). The stratum k = strateOf(yhat) is derived SERVER-SIDE (the
 * caller never picks it); alpha/nMin are SERVER-imposed (a divergent params value is a named 400). The
 * committed registry holds stratum s0 (n = 170); a yhat of strata s1 to s3 abstains under_calib.
 */
export const TASK_LIQ_ELIGIBLE = "liquidation-eligible-coverage";

/** Server-imposed calibration params for the committed liq class (== the frozen generator
 *  ALPHA/NMIN). A divergent `params.alpha`/`params.nMin` is a NAMED 400, never a silent override: the L3
 *  gate reads `params.nMin`, so a divergent nMin would diverge the action. */
export const LIQ_ALPHA = LIQ_POLICY.alpha;
export const LIQ_NMIN = LIQ_POLICY.nMin;

/** The retirement message of `btc-dir-15m`. */
export const BTC_DIR_RETIRED_MESSAGE =
  `task_class '${TASK_BTC_DIR}' is retired: it is no longer served; the name stays reserved against BYO`;

/** The one honesty sentence the `cascade` path MUST carry. */
export const CASCADE_UNCALIBRATED_SENTENCE =
  "no cascade calibration is committed; the gate abstains (under_calib) on this class";

/**
 * The honesty sentence the `stable-run-velocity-24h` path carries for a population WITHOUT a committed
 * calibration. Now POPULATION-scoped (per key), not class-wide: a
 * committed key exists (USDe), so this is the honest text for EVERY OTHER (task_class, predictor_id).
 * Distinct from the cascade sentence: a fall-through to CASCADE_UNCALIBRATED_SENTENCE would be FALSE on the
 * wire next to a stable-run decision.
 */
export const STABLE_RUN_UNCALIBRATED_SENTENCE =
  "no stable-run velocity calibration is committed for this population; the gate abstains (under_calib)";

/**
 * The honesty sentence for the ONE committed stable-run population: USDe, the
 * synthetic-dollar-whitelisted-redeem family, measured over CALM 24h redemption-flow windows. The coverage
 * statement follows the split-conformal bound of Barber, Candes, Ramdas and Tibshirani 2023 (Thm 2, unit
 * weights): 1 - alpha is the coverage ONLY if the average total-variation gap between the calibration windows
 * and the next is zero (exchangeability). That gap is NOT estimated here and the calibration is MEASURED
 * non-stationary across half-years, so exchangeability is NOT assumed and no coverage is measured.
 * (The "every other population abstains
 * under_calib" queue lives in the full `STABLE_RUN_COMMITTED_SENTENCE` below; the description interpolates
 * this CORE.) No marketing "calibrated" adjective, no "V1", no numeric
 * early-warning, no probability — measured, never scored.
 * NOTE (declared deviation): the third author's surname takes a French diacritic; it is
 * rendered ASCII "Candes" here to match repo precedent (packages/hikae/src/l1-split.ts).
 * Substance identical.
 */
export const STABLE_RUN_COMMITTED_CORE =
  "a committed stable-run velocity calibration for the USDe synthetic-dollar-whitelisted-redeem population " +
  "(key narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3) over calm-window " +
  "redemption flow; coverage is stated under the split-conformal bound of Barber, Candes, Ramdas and " +
  "Tibshirani 2023 (Thm 2, unit weights): at least 1 − α minus the average total-variation gap between " +
  "calibration windows and the next one; that gap is not estimated here and the calibration is measured " +
  "non-stationary across half-years, so 1 − α is the coverage only if that gap is zero (exchangeability), " +
  "which is not assumed here; no coverage is measured";
// The band edges come from the score test (scoreTestBand of @monark/hikae), so the clause
// on the rounded additive edge is withdrawn (core, description, served content).

/** The SERVER-imposed params of the committed USDe key, declared in the class description. */
export const STABLE_RUN_REQUIREMENTS_SENTENCE = `on that key it requires alpha = ${String(USDE_POLICY.alpha)}, nMin = ${String(USDE_POLICY.nMin)}`;

/**
 * The FULL committed sentence = CORE + the "every other population abstains" queue. `honestyText()`
 * (tools/call, honesty carrier) renders THIS unchanged for the USDe COMMIT — byte-identical on the wire, its
 * VALUE unchanged. `GATE_TOOL_DESCRIPTION` (tools/list) interpolates `STABLE_RUN_COMMITTED_CORE`
 * ONLY: the queue duplicated the description's `for any other population,
 * ${STABLE_RUN_UNCALIBRATED_SENTENCE}` clause. Split (not deleted), so NO honesty carrier changes.
 */
export const STABLE_RUN_COMMITTED_SENTENCE =
  STABLE_RUN_COMMITTED_CORE + "; every other (task_class, predictor_id) abstains (under_calib)";

/**
 * SERVED text of the liquidation-eligible-coverage class.
 * The served region is a conformal UPPER BOUND [0, yhat + qhat]; the wire `region.kind` stays
 * "interval" (frozen contract) so "upper bound" is a property of THIS text, never a new kind, and the word
 * "interval" is deliberately ABSENT from it (mutant (o) is scoped to this constant, not to the
 * BYO clause of GATE_TOOL_DESCRIPTION nor to vocab-banned.json). No probability, no width/tightness claim.
 */
export const LIQ_UPPER_BOUND_SENTENCE =
  "a conformal upper bound on the liquidable amount for the calibrated class; the lower edge is 0 by " +
  "construction, not a calibrated bound; abstains (under_calib) outside it";

/** The SERVER-imposed params, declared in the class description. */
export const LIQ_REQUIREMENTS_SENTENCE = "this class requires alpha = 0.01, nMin = 100";

/** Honesty: calibrated on ONE recorded episode, no coverage claimed on any other
 *  event, a YES on the exchangeability check licenses nothing more. ASCII only. */
export const LIQ_H3_SENTENCE =
  "calibrated on one recorded episode; no coverage is claimed on any other event; the " +
  "exchangeability check is a report, a YES licenses nothing more";

/** Conditional-coverage clause: the bound holds ONLY if yhat was produced by the frozen
 *  close-factor rule on a mono-collateral WETH account at the first crossing, which the gate does not check.
 *  Its ABSENCE is an over-revendication (mutant (h)); it MUST ride in the served text. */
export const LIQ_CONDITIONAL_SENTENCE =
  "the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH " +
  "account at the first crossing, which the gate does not check";

/** The FULL committed sentence for the SERVED (non-empty-registry) liq class (rendered by honestyText).
 *  Carries the upper bound + the one-episode clause + the conditional clause; never "interval",
 *  never a probability (u4b_liq_description_makes_no_probability_claim, u4b_liq_class_text_says_upper_bound_never_interval). */
export const LIQ_COMMITTED_SENTENCE = `${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;

/** Empty-registry honesty: no calibration committed yet ⇒ abstains under_calib by construction.
 *  Keyed on REGISTRY presence (hasCommittedCalibrationForClass), never on a client-key lookup. */
export const LIQ_EMPTY_REGISTRY_SENTENCE =
  "no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction";

export const GATE_TOOL_NAME = "gate";

/**
 * The non-re-verification sentence carried VERBATIM in the tool description:
 * the attestation is DECLARED-consistent and not re-verified at call time (no verifier runs here). Since step 7 of
 * ROADMAP.md the harness has no `attest` tool, so the sentence names none. Kept as one constant so the
 * "non-re-verification phrase removed from the description" mutant reddens `gate_description_declares_non_reverification`.
 */
export const GATE_NON_REVERIFICATION_SENTENCE =
  "the attestation is carried by the caller and is not re-verified at call time (the verifier is not executed here); " +
  "verify a caller-carried attestation offline with the Shōgen verifier";

/**
 * Tool description: declares the retired btc-dir class, the cascade sentence, AND the BYO path.
 * The BYO carrier REUSES `CALIBRATE_LABEL` (one honesty constant, no paraphrase, no banned vocab).
 * A PURE function of the REGISTRY state of the
 * liq class: `registryHasLiq` is hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), the SAME registry-level key
 * honestyText uses. EMPTY registry: the empty-registry sentence, the server-imposed params (their 400
 * fires BEFORE the lookup, so it holds on an empty registry) and the conditional rule
 * (a rule statement, not a coverage claim); NEVER the upper-bound sentence nor the one-episode
 * sentence, since nothing is calibrated in the served registry. NON-EMPTY
 * registry: the committed clause. Every other clause is
 * the same in both states.
 */
/** "Not in the future" tolerance at the HTTP and MCP entry points: 300 s of clock skew. Also the
 *  lateness bound of a kata call (one constant of the version), and read by the kata clause below. */
export const PRODUCED_AT_FUTURE_TOLERANCE_MS = 300_000;

/** The class text of a kata table: one template, the class name substituted. It is served
 *  when no current row holds the resolved cell, so it speaks of the cell, never of the class as a whole. */
export function kataClassText(taskClass: string): string {
  return `no ${taskClass} calibration is committed for this cell_key; the gate abstains and serves no region`;
}

/** The kata clause of the gate description (tripwire kataTablesMatchPins): no class pinned, no
 *  row; else the committed state, for pinned and held classes that partition the entries, at least 2 of each, or a throw at load. Every value is read. */
export function kataClause(entries: readonly ClassEntry[] = kataClassEntries(kataClassText), tauCap = KATA_DIR_TAU_CAP, committed: readonly string[] = Object.keys(COMMITTED_TABLES), held: readonly string[] = [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES]): string {
  const parts = (i: 1 | 2 | 3): string[] => [...new Set(entries.map((e) => /^([a-z0-9]+)-(.+)-([a-z0-9]+)$/.exec(e.task_class)?.[i] ?? ""))];
  const one = (dir: boolean): { alpha: string; nMin: string } => {
    const es = entries.filter((e) => (e.region_rule === "sign-set") === dir), vals = new Set(es.map((e) => `${e.alpha ?? ""} ${String(e.n_min)}`));
    if (es.length === 0 || vals.size !== 1) throw new Error(`kata clause: alpha and nMin are not uniform on a family (${[...vals].join("; ")})`);
    return { alpha: es[0]?.alpha ?? "", nMin: String(es[0]?.n_min) };
  };
  const [d, b, names] = [one(true), one(false), ([1, 2, 3] as const).map((i) => `{${parts(i).join(",")}}`)];
  if (new Set(entries.map((e) => e.task_class)).size !== entries.length || entries.length !== parts(1).length * parts(2).length * parts(3).length) throw new Error("kata clause: the kata classes are not the product of their parts");
  const all = entries.map((e) => e.task_class), h = all.filter((c) => held.includes(c)), m = all.filter((c) => committed.includes(c)), [out, both, neither] = [[...committed, ...held].filter((c) => !all.includes(c)), m.filter((c) => h.includes(c)), all.filter((c) => !m.includes(c) && !h.includes(c))];
  const head = `The ${String(entries.length)} kata classes \`${names.join("-")}\` are served from their policy tables`, abstains = "abstains with no region (under_calib, or non_evaluable on a dir lean of exactly 0)";
  for (const [bad, why] of committed.length > 0 ? ([[out.length > 0, `not a kata class: ${out.join(", ")}`], [both.length > 0, `both pinned and held: ${both.join(", ")}`], [neither.length > 0, `neither pinned nor held: ${neither.join(", ")}`], [h.length < 2, `fewer than 2 held classes: ${String(h.length)}`], [m.length < 2, `fewer than 2 pinned classes: ${String(m.length)}`]] as const) : []) if (bad) throw new Error(`kata clause: ${why}; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each`);
  const pinned = `The other ${String(m.length)} hold committed calibration rows: each of their tables is the file \`apps/harness/data/kata/tables/<task_class>.json\` of the repository, one canonical JSON line read once at load; the load stops unless the bytes have the sha256 pinned for the class in \`apps/harness/src/policy-committed-pins.ts\`, and every decision on those classes names that table by its sha256 in \`policy_table_sha256\`; a call is answered from the current row of its cell, and abstains with no region when no current row holds that cell. The gate does not recompute \`yhat\` and does not check the bars behind \`features_digest\`; a call received after \`produced_at\` is inside what a row states only if it was made without information on prices after \`produced_at\`. `;
  const tail = "A kata call carries a `predictor_id` of the form `kata:<kataId>@<venue>/<SYMBOL>/<h>` (no bucket, <h> the class horizon, <SYMBOL> starting with the first part of the class name in capitals), a `features_digest`, a number `yhat` (a lean in [-1, 1] on dir classes, a finite scale above 0 on the others), " +
    `alpha = ${d.alpha}, nMin = ${d.nMin} on dir classes and alpha = ${b.alpha}, nMin = ${b.nMin} on the others, tau at most ${String(tauCap)} on dir classes, ` +
    `and a \`produced_at\` on the class horizon grid, received at most ${String(PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000)} s after it; ` +
    "a call that breaks one of these rules is refused with its named error code.";
  return committed.length === 0 ? `${head}, which hold no committed calibration row: every well-formed kata call ${abstains}, and no kata class has an attestation subject. ${tail}` : `${head}; no kata class has an attestation subject. Of the ${String(entries.length)}, ${String(h.length)} hold no committed calibration row (${h.map((c) => `\`${c}\``).join(", ")}): every well-formed kata call on them ${abstains}. ${pinned}${tail}`;
}

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
    `${kataClause()} ` +
    "When the caller instead supplies a `calibration` (its own nonconformity scores plus a `mode`: `interval` " +
    "⇒ region [yhat - q̂, yhat + q̂], or `set` ⇒ a conformal set over caller `candidates`), the gate " +
    `conformalizes against THOSE caller-supplied scores (BYO): ${CALIBRATE_LABEL} ` +
    `With \`calibration.aci\` (a step, a window and, for each score, how many had arrived when its signal was decided) the verdict's method is \`hac-cp\` and the region comes from an ${ACI_LABEL} ` +
    "A caller-carried `attested` price must declare a subject consistent with the committed task class " +
    "(exact committed-URL membership; BYO classes do not accept `attested`); " +
    GATE_NON_REVERIFICATION_SENTENCE +
    `; no temporal binding. ${NO_SERVED_ATTESTATION_SUBJECT_SENTENCE} ` +
    "The gate only emits a decision; it never calls the named tool."
  );
}

/** The SERVED description (registry.ts -> tools/list, openapi.ts -> /openapi.json): describeGate at the registry
 *  state AT LOAD. COMMITTED_CALIBRATIONS is a module constant, so ONE state is observable per process; the switch to
 *  the committed clause is automatic at the first committed liq entry. */
export const GATE_TOOL_DESCRIPTION = describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE));

/** One BYO candidate (set mode): a label and its caller-supplied nonconformity score. */
export interface ByoCandidate {
  readonly label: string;
  readonly score: number;
}

/**
 * OPTIONAL caller-supplied calibration (the BYO loop). Present ⇒ the gate conformalizes
 * against THESE scores on the caller's own model, not a committed class. `mode` selects the region kind;
 * `candidates` is required (and non-empty) in `set` mode, unused in `interval` mode.
 */
export interface ByoCalibration {
  readonly scores: readonly number[];
  readonly mode: "interval" | "set";
  readonly candidates?: readonly ByoCandidate[];
  /** OPTIONAL: the online level of the class. `scores` then holds every arrived score in arrival order, and the verdict reads the last `window` of them. */
  readonly aci?: AciEvidence;
}

/** Non-frozen gate parameters, caller-carried (with the optional BYO `calibration`). */
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
  /** OPTIONAL: caller-supplied calibration ⇒ the BYO conformal path. Absent ⇒ committed class. */
  readonly calibration?: ByoCalibration;
  /** OPTIONAL (step 6 of ROADMAP.md): the cell's tracking evidence, replayed; B_t = min(remainingBudget, its budget). */ readonly suivi?: SuiviEvidence;
}

/**
 * Stable error codes: a closed list. The HTTP mirror
 * carries the code in its error body, MCP in `_meta[ERROR_CODE_META_KEY]`. The four class defaults (attest, calibrate, cascade,
 * ukemi-predict; only calibrate is served since step 7) follow the gate codes; `task_class_retired` is thrown for `btc-dir-15m`.
 * A code is never renamed nor reused for another refusal.
 * Since contract 1.1.0 the list is TOOL_ERROR_CODES of @monark/contracts,
 * re-exported here: the 24 codes above in their order, then 8 codes added by 1.1.0: input_invalid and json_invalid,
 * served by the 400 bodies of http.ts, and 6 thrown by the served kata path
 * (kata_key_invalid, kata_yhat_domain, features_digest_required, policy_tau_cap, produced_at_off_grid, produced_at_stale).
 * /openapi.json projects them from schemas/tool-error.schema.json. Every code but output_invalid (its 500
 * path) has a served thrower; error-code.test.ts every_code_but_output_invalid_is_thrown_by_a_served_request checks it.
 * The block is kept at its former line count.
 */
export const HARNESS_ERROR_CODES = TOOL_ERROR_CODES;
export type HarnessErrorCode = (typeof HARNESS_ERROR_CODES)[number];

/** The MCP `_meta` key of a tool error's code. */
export const ERROR_CODE_META_KEY = "monarkgate.tech/error_code";

/** A tool-level error: surfaced by the MCP seam as a tool error, never a silent gate. */
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

/** Server-side validation of the non-frozen params. Invalid ⇒ tool error. */
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
 * `evaluable` derivation: a right-typed but non-directional / non-finite `yhat` is a DECISION
 * (`abstain`/`non_evaluable`), never silence; a WRONG-typed `yhat` is a tool error (raised in `runGate`).
 * BYO branch: interval ⇒ a finite number; set ⇒ a label present among the caller's candidates.
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
 * Validate the caller-supplied calibration (fail-closed ⇒ `HarnessToolError`, surfaced as 400). Runs
 * BEFORE any conformal computation. `interval` mode requires every score >= 0: rejected here so
 * `buildIntervalRegion`'s `lo > hi` throw (region.ts:55) is UNREACHABLE. `set` mode requires a non-empty
 * `candidates` list whose labels are printable ASCII, non-empty, unique, and free of `|` (`|` is the
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
    // A negative nonconformity score would make q̂ negative ⇒ lo > hi ⇒ buildIntervalRegion throws.
    for (let i = 0; i < cal.scores.length; i++) {
      if ((cal.scores[i] ?? 0) < 0) {
        throw new HarnessToolError(`invalid calibration.scores[${String(i)}]: interval mode requires non-negative nonconformity scores`, "byo_calibration_invalid");
      }
    }
    return;
  }
  // set mode: candidates required, non-empty, well-formed, unique labels.
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
      throw new HarnessToolError(`invalid calibration.candidates[${String(i)}].label: must not contain '|' (label_schema separator)`, "byo_calibration_invalid");
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
 * BYO set-mode tau cap: tau above the
 * number of candidates minus 1 would let a COMMIT stand on the whole candidate list, so it is a named tool error
 * (400) that names the required value. Runs after `validateCalibration` (label checks) and the yhat type
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
 * BYO conformal path: compose the SAME real HIKAE primitives on the CALLER's scores.
 * Order mirrors `validateCalibration` then the committed dispatch — validate, then check `yhat` TYPE for the
 * mode (wrong type ⇒ tool error BEFORE any computation), then `splitQuantile` (under-calibration ⇒ fail-closed
 * `underCalibVerdict`), then the region. `abstain`/`reason` conventions mirror the committed paths (set:
 * |C|>tau => set_too_large else covered, as the retired btc-dir path did, but |C|=0 => intent_not_in_region; interval: abstain:false/covered, as in
 * `conformInterval`; the L3 gate decides DEFER/ABSTAIN on the width). Every error is `HarnessToolError`
 * (⇒ 400), never a 500.
 */
function byoVerdict(prediction: Prediction, params: HarnessParams, cal: ByoCalibration): { readonly verdict: CoverageVerdict; readonly aci: AciState | undefined } {
  validateCalibration(cal);
  const taskClass = prediction.task_class;
  const yhat = prediction.yhat;

  // WRONG-typed yhat for the mode ⇒ tool error BEFORE the region (mirror the committed dispatch's yhat check).
  if (cal.mode === "interval" && typeof yhat !== "number") {
    throw new HarnessToolError(`byo 'interval' mode expects a number yhat, got ${typeof yhat}`, "byo_yhat_type");
  }
  if (cal.mode === "set" && typeof yhat !== "string") {
    throw new HarnessToolError(`byo 'set' mode expects a string yhat (label), got ${typeof yhat}`, "byo_yhat_type");
  }
  assertByoSetTauCap(params, cal); // order: after the label checks and the yhat type check

  // A BYO verdict has no class entry; qhat_unit is fixed by the mode, scale and the three table fields are null.
  const cell: VerdictCell = { qhatUnit: cal.mode === "interval" ? "label" : "score", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null };

  // With the online level of the class, the replay gives the region and the verdict describes the window it read; without it, the split path.
  const aci = cal.aci === undefined ? undefined : replayAci(cal.aci, cal.scores, params);
  const done = (verdict: CoverageVerdict) => ({ verdict, aci });
  const method = aci === undefined ? "split" : "hac-cp";
  const scores = aci === undefined ? cal.scores : aci.window;
  const noRegion = { taskClass, method, alpha: params.alpha, scores, residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION, cell } as const;
  if (aci?.region.kind === "empty") return done(noRegionVerdict("region_degenerate", noRegion)); // the level at 1 or above: nothing is covered
  const split = aci === undefined ? splitQuantileShortest(cal.scores, params.alpha, params.nMin) // exact rank of String(alpha)
    : aci.region.kind === "quantile" ? { qhat: aci.region.qhat } : { reason: "under_calib" as const }; // the warm-up, or the whole line: no finite region
  if ("reason" in split) {
    // Fail-closed under-calibration (n < nMin or p > n): EMPTY set region, qhat null, never clamped.
    return done(underCalibVerdict(noRegion));
  }
  const qhat = split.qhat;

  if (cal.mode === "interval") {
    const center = yhat as number; // narrowed by the typeof guard above
    const ir = scoreTestBand(center, qhat); // edges of the score test
    if (ir.abstain) {
      // Fail-closed (mirror interval-conformer.ts:88): under_calib on a non-finite bound (yhat non-finite),
      // region_degenerate on a zero-width region lo===hi (q̂=0 or float absorption).
      return done(noRegionVerdict(ir.reason, noRegion));
    }
    // residual is NOT an honesty carrier: frozen semantics inherited from the verdict contract.
    return done(buildVerdict({
      ...noRegion,
      region: ir.region,
      qhat,
      abstain: false,
      reason: "covered",
    }));
  }

  // set mode: conformal set over the caller's candidate scores, label_schema derived from the candidates.
  const candidates = cal.candidates;
  if (candidates === undefined || candidates.length === 0) {
    throw new HarnessToolError("byo 'set' mode requires a non-empty candidate list", "byo_calibration_invalid");
  }
  const derivedSchema = candidates.map((c) => c.label).join("|");
  const labels = conformalSet(new Map(candidates.map((c) => [c.label, c.score] as const)), qhat);
  // An EMPTY set holds no intent, so the verdict abstains with
  // intent_not_in_region (qhat stays the number, unlike under_calib); never covered. abstain = 1{|C| > tau or |C| = 0}.
  const empty = labels.length === 0;
  const abstain = empty || labels.length > params.tau;
  return done(buildVerdict({
    ...noRegion,
    region: buildSetRegion(labels, derivedSchema),
    qhat,
    abstain,
    reason: empty ? "intent_not_in_region" : abstain ? "set_too_large" : "covered",
  }));
}

/** cascade verdict: `conformInterval` with NO committed calibration ⇒ empty region ⇒ under_calib. */
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
    schemaVersion: SCHEMA_VERSION, cell: servedCell(TASK_CASCADE, prediction.predictor_id),
  }).verdict;
}

/**
 * Class policy row (ClassPolicyRow): a committed calibration's alpha and nMin are server-imposed; a different value is a named
 * 400 (strict equality), never a silent override.
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
 * stable-run velocity verdict (isolation of population on the wire):
 * keyed on (task_class, predictor_id). When a committed calibration exists for the key (USDe), conformalize
 * the caller-carried velocity forecast against THOSE committed nonconformity scores (split-conformal on the
 * scores directly — they are residuals |v − v̂|, NOT pairs — the SAME primitive chain as the BYO interval
 * branch: splitQuantile → buildIntervalRegion → buildVerdict; the zero-width check traverses buildIntervalRegion,
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
      schemaVersion: SCHEMA_VERSION, cell: servedCell(TASK_STABLE_RUN, prediction.predictor_id),
    }).verdict;
  }
  // Committed population (USDe): alpha/nMin are server-imposed, then split-conformal over the
  // committed SCORES. Same primitive chain as byoVerdict's interval branch (one quantile implementation, L1).
  assertPolicy(USDE_POLICY, params);
  const scores = committed.scores;
  const cell = servedCell(TASK_STABLE_RUN, prediction.predictor_id);
  const split = admittedSplit(cell); // qhat and alpha read on the admitted row (exact rank)
  if ("reason" in split) {
    // No current row for the key (unreachable for the committed key: its row is built at load) ⇒ honest under_calib.
    return underCalibVerdict({
      taskClass: TASK_STABLE_RUN, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      cell,
    });
  }
  const ir = scoreTestBand(yhat, split.qhat); // edges of the score test
  if (ir.abstain) {
    // A zero-width region (q̂=0 or float absorption) ⇒ region_degenerate. REUSED.
    return noRegionVerdict(ir.reason, {
      taskClass: TASK_STABLE_RUN, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      cell,
    });
  }
  return buildVerdict({
    taskClass: TASK_STABLE_RUN, method: "split", alpha: split.alpha, scores,
    region: ir.region, qhat: split.qhat, abstain: false, reason: "covered",
    residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION, cell,
  });
}

/**
 * liquidation-eligible-coverage verdict.
 * `yhat` is the caller-carried liquidable amount (base 8-dec). SERVER-owned: alpha/nMin are imposed
 * (a divergent value is a NAMED 400 — the L3 gate reads `params.nMin`, so a divergent nMin would diverge the
 * action); the stratum `k = strateOf(yhat)` is derived SERVER-side; the lookup key is re-derived
 * `${UKEMI_LIQ_PREDICTOR_BASE}/s${k}` (the CLIENT predictor_id is IGNORED for this class). The committed
 * registry holds stratum s0; s1 to s3 are uncommitted and abstain `under_calib`. For a committed stratum
 * with qhat > 0 the region is the conformal UPPER BOUND [0, yhat + qhat] (liqUpperBoundRegion);
 * qhat = 0 abstains `under_calib` on the committed scores. Same primitive chain as stableRunVerdict
 * (splitQuantile -> region -> buildVerdict), but the region is an upper bound, NOT the symmetric interval.
 */
function liqEligibleVerdict(prediction: Prediction, params: HarnessParams): CoverageVerdict {
  const yhat = prediction.yhat as number; // dispatch narrowed typeof === "number"
  // Domain: a non-negative SAFE integer. The frozen scorer THROWS on a non-integer; the
  // server refuses FIRST with a named 400 (never a silent gate, never strateOf over a lossy float).
  if (!Number.isSafeInteger(yhat) || yhat < 0) {
    throw new HarnessToolError(
      `task_class '${TASK_LIQ_ELIGIBLE}' expects yhat to be a non-negative safe integer (base 8-dec liquidable amount), got ${String(yhat)}`,
      "liq_yhat_domain",
    );
  }
  // alpha/nMin are SERVER-IMPOSED for this committed class (its policy row): divergent => a named 400.
  assertPolicy(LIQ_POLICY, params);
  const k = strateOf(yhat);
  const predictorId = `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(k)}`;
  const cell = servedCell(TASK_LIQ_ELIGIBLE, predictorId);
  const committed = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, predictorId);
  if (committed === undefined) {
    // An uncommitted stratum (s1 to s3) => honest abstention (empty scores, n_calib 0).
    return underCalibVerdict({
      taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores: [],
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      cell,
    });
  }
  // Committed stratum: split-conformal qhat over the committed scores, then the UPPER-BOUND region.
  const scores = committed.scores;
  const split = admittedSplit(cell); // qhat and alpha read on the admitted row (exact rank)
  if ("reason" in split) {
    // No current row for the stratum key ⇒ honest under_calib (fail-closed, mirror stableRunVerdict).
    return underCalibVerdict({
      taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      cell,
    });
  }
  const region = liqUpperBoundRegion(yhat, split.qhat);
  if (region.abstain) {
    // qhat = 0: the committed stratum calibrated no high margin ⇒ honest abstention on the
    // committed scores (n_calib = n; coherent at L3 — reason==="under_calib" ⇒ ABSTAIN even at n>=nMin).
    return underCalibVerdict({
      taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: params.alpha, scores,
      residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION,
      cell,
    });
  }
  return buildVerdict({
    taskClass: TASK_LIQ_ELIGIBLE, method: "split", alpha: split.alpha, scores,
    region: region.region, qhat: split.qhat, abstain: false, reason: "covered",
    residual: [], producedAt: prediction.produced_at, schemaVersion: SCHEMA_VERSION, cell,
  });
}

/**
 * The honesty text carried in the MCP tool result content (never inside the frozen decision).
 * CRITICAL: keyed on the PRESENCE of calibration, NOT on `task_class` alone — a BYO decision on a
 * free-string class must NOT fall through to the CASCADE sentence (which would be false on the wire next
 * to a BYO COMMIT). The BYO carrier REUSES `CALIBRATE_LABEL` (one constant, no paraphrase).
 * A served class reads the RESOLVED cell, `cellKey`, in its served table: the
 * verdict's cell_key (registry.ts), i.e. the stratum key the server derived for liq and the predictor_id for
 * the other classes. The text is the one of the current row of that key, else the class text of the table,
 * then the unchanged suffix (the table text is the exact prefix of the served sentence).
 * So the USDe committed sentence rides on the USDe key only and the uncommitted one on every other
 * population; the liq calibrated sentence rides on s0 only, and s1 to s3
 * (under_calib) read the class text. The old criterion (registry presence of the liq class)
 * served the calibrated sentence on s1 to s3 as well. An unknown class reads the cascade sentence, as before.
 * A surclaim mutant (the committed sentence for a key without a row) reddens the A7(f) test and liq_honesty_text_follows_the_resolved_cell.
 */
export function honestyText(taskClass: string, cellKey: string, isByo: boolean, tables: readonly ServedTable[] = SERVED_POLICY_TABLES): string {
  if (isByo) return `${CALIBRATE_LABEL} B_t is caller-carried.`;
  const served = tables.find((t) => t.task_class === taskClass);
  if (served === undefined) return `${CASCADE_UNCALIBRATED_SENTENCE}; B_t is caller-carried.`;
  // The current row of the resolved key (USDe key; liq s0), else the class text (other population; liq s1 to s3;
  // cascade, whose table has no row). One lookup for every served class: the composition holds by construction,
  // and a text change in the table is a change of the served sentence, never a second copy.
  const row = served.table.rows.find((r) => r.current && r.cell_key === cellKey);
  return `${row === undefined ? served.table.class.text : row.text}; B_t is caller-carried.`;
}
// Earlier, the liq branch read hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), so every stratum got
// the calibrated sentence; the USDe branch read lookupCommittedCalibration on the key, the same answer as the current row
// of the key (rows rebuilt from the same committed calibrations, guardMarginalTable). Line count kept for the killers.

/**
 * A compact, FACTUAL restatement of the frozen decision, carried in the MCP `content` text ALONGSIDE the
 * honesty prose (a delivery aid, NOT a 4th honesty carrier). Motivation: some MCP clients forward only
 * `content` text to the model and DROP `structuredContent` (measured on Hermes v0.21), so a `commit` and
 * an `under_calib` would read identically in the prose channel. This line surfaces the DECISION — action,
 * the coverage `reason` (how `under_calib` becomes visibly distinct from `covered`), the region, q̂,
 * n_calib, and a TRUNCATED scores_sha256 (8 leading + 6 trailing; the full value stays in
 * `structuredContent`). DERIVED from the same closed `GateDecision` (single source, no drift), it restates
 * only fields already on the wire and asserts NO probability of being right.
 */
export function gateVerdictSummary(d: GateDecision): string {
  const v = d.verdict;
  const region =
    v.region === null ? "null"
      : v.region.kind === "interval" ? `[${String(v.region.lo)}, ${String(v.region.hi)}]` : `{${v.region.labels.join(", ")}}`;
  const qhat = v.qhat === null ? "null" : String(v.qhat);
  const digest = `${v.scores_sha256.slice(0, 8)}...${v.scores_sha256.slice(-6)}`;
  return `verdict action=${d.action} reason=${d.reason} region=${region} qhat=${qhat} n_calib=${String(v.n_calib)} scores_sha256=${digest}`;
}

/** A leading or trailing blank (Unicode `\s`, which covers space, tab and no-break space). */
const EDGE_BLANK = /^\s|\s$/u;
/** The reserved kata class names (any 2 to 10 symbol; 15m, 1h, 4h and 24h). */
export const KATA_CLASS_RE = /^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$/;
/** The reserved kata key prefix. */
const KATA_KEY_PREFIX = "kata:";
/** The classes committed on the CLASS (any key), as in the exact guard of `runGate`. */
const CLASS_LOCKED = [TASK_BTC_DIR, TASK_CASCADE, TASK_LIQ_ELIGIBLE] as const;

/**
 * The ASCII confusable reduction, applied to both
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

/** The reserved kata class names, reduced: the exact image of KATA_CLASS_RE
 *  under confusableReduce. A reduced string never holds "rn", so "m" (from "rn") is its one symbol of a single letter. */
export const KATA_CLASS_REDUCED_RE = /^(?:m|[a-hj-km-z2-9ol]{2,10})-(dlr|range|mae-down|mae-up)-(l5m|lh|4h|24h)$/;
// Safety and exactness are tested on reduced strings (gate-byo-kata-wide.test.ts): every wide name, reduced, matches
// it, and every reduced string that matches it has a wide antecedent. No finite set any more: the wide pattern names
// unboundedly many classes, so byoConfusable compares a reduced BYO class to this reduced pattern.

/**
 * BYO confusable rule. Runs after the look-alike rule (byoLookAlike), so a name it refuses keeps its message and code.
 * Refuses a class whose reduction is a class-locked name or a reserved kata name, a (class, key) pair whose reduction
 * is a committed pair, and a key whose reduction, with "4" read as "a" (key prefix only), starts with "kata:". Any ASCII
 * look-alike outside this closed reduction still passes: a declared residual class. */
function byoConfusable(taskClass: string, predictorId: string): string | undefined {
  const cls = confusableReduce(taskClass);
  const lockedOrKata = CLASS_LOCKED.some((c) => confusableReduce(c) === cls) || KATA_CLASS_REDUCED_RE.test(cls);
  const kataKey = confusableReduce(predictorId).replace(/4/g, "a").startsWith(KATA_KEY_PREFIX);
  if (lockedOrKata || kataKey || matchesCommittedKeyWith(confusableReduce, taskClass, predictorId)) {
    return `task_class '${taskClass}' / predictor_id '${predictorId}' reduces to a committed or reserved name once ASCII confusables are folded (l, I, 1; rn, m; 0, o; _ and . as -; repeated -; blanks): use a distinct caller-owned name for BYO`;
  }
  return undefined;
}

/**
 * BYO look-alike rule. Returns the 400
 * message and its code when a BYO (task_class, predictor_id) imitates a committed name or takes a reserved kata name, else
 * undefined. Fold = `asciiLower` (A to Z only); non-ASCII homoglyphs are a declared residual.
 */
function byoLookAlike(taskClass: string, predictorId: string): { readonly message: string; readonly code: HarnessErrorCode } | undefined {
  if (EDGE_BLANK.test(taskClass) || EDGE_BLANK.test(predictorId)) {
    return { code: "byo_edge_blank", message: `byo task_class and predictor_id must not start or end with a blank: ${JSON.stringify(taskClass)} / ${JSON.stringify(predictorId)}` };
  }
  const cls = asciiLower(taskClass);
  const key = asciiLower(predictorId);
  if ((CLASS_LOCKED as readonly string[]).includes(cls) || matchesCommittedKeyFolded(taskClass, predictorId)) {
    return { code: "byo_lookalike_committed", message: `calibration must not override the committed (task_class, predictor_id) '${taskClass}' / '${predictorId}', compared without ASCII case: use a caller-owned key for BYO` };
  }
  if (KATA_CLASS_RE.test(cls) || key.startsWith(KATA_KEY_PREFIX)) {
    return { code: "byo_reserved_kata", message: `task_class '${taskClass}' / predictor_id '${predictorId}' takes a name reserved for MONARK kata classes (pattern ${KATA_CLASS_RE.source}, key prefix '${KATA_KEY_PREFIX}'): use a caller-owned name for BYO` };
  }
  return undefined;
}

/** RFC 3339 section 5.6 date-time: full-date "T" full-time, fraction optional, offset Z or +-hh:mm (T and Z in either case). */
const RFC3339_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/;

/**
 * The instant (epoch ms) of a STRICT RFC 3339 date-time, or undefined. The
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
 *  (no clock under src/tools/). Absent (a direct call) => only the RFC 3339 check runs (declared). */
export interface RunGateOptions {
  readonly nowMs?: number;
  /** TEST ONLY: the tables a kata class is looked up in, in place of SERVED_POLICY_TABLES. The HTTP and MCP
   *  entry points never pass it (test entry_points_never_pass_policy_tables). */
  readonly policyTables?: readonly ServedTable[];
}

/** `produced_at`: strict RFC 3339, else 400 `produced_at_invalid`; with `nowMs`, at most
 *  PRODUCED_AT_FUTURE_TOLERANCE_MS after it, else 400 `produced_at_future`. No bar grid (USDe, liq, cascade, BYO). */
function assertProducedAt(producedAt: string, nowMs: number | undefined): void {
  const at = typeof producedAt === "string" ? rfc3339Instant(producedAt) : undefined;
  if (at === undefined) {
    throw new HarnessToolError(`invalid prediction.produced_at ${JSON.stringify(producedAt)}: expected an RFC 3339 date-time`, "produced_at_invalid");
  }
  if (nowMs !== undefined && at > nowMs + PRODUCED_AT_FUTURE_TOLERANCE_MS) {
    throw new HarnessToolError(
      `prediction.produced_at '${producedAt}' is in the future: more than ${String(PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000)} s after the server clock`,
      "produced_at_future",
    );
  }
}

/**
 * Compose the real primitives into a closed `GateDecision`. Throws `HarnessToolError` on an unknown
 * `task_class`, a wrong-typed `yhat`, an invalid `produced_at`, or invalid params. The gate NEVER calls
 * `params.tool`.
 */
export function runGate(prediction: Prediction, params: HarnessParams, attested?: AttestedPrice, options: RunGateOptions = {}): GateDecision {
  return runGateExplained(prediction, params, attested, options).decision;
}

/** `runGate` with what the closed decision cannot carry: the state of the online level, when the caller carries its evidence. */
export function runGateExplained(prediction: Prediction, params: HarnessParams, attested?: AttestedPrice, options: RunGateOptions = {}): { readonly decision: GateDecision; readonly aci: AciState | undefined } {
  validateHarnessParams(params);
  if (prediction.schema_version !== SCHEMA_VERSION) {
    throw new HarnessToolError(
      `unsupported prediction.schema_version '${prediction.schema_version}': the gate speaks '${SCHEMA_VERSION}'; specification: https://github.com/KraidleAI/monark-kata-spec`,
      "schema_version_unsupported",
    );
  }
  assertProducedAt(prediction.produced_at, options.nowMs);

  const taskClass = prediction.task_class;
  const calibration = params.calibration;

  // Anti-override guard: a BYO calibration must NEVER overwrite a
  // COMMITTED calibration. btc-dir/cascade are committed on the CLASS ⇒ locked for any predictor_id. The
  // stable-run class is committed by KEY (task_class, predictor_id) ⇒ locked ONLY for a committed key; a
  // DIFFERENT population on the same class MAY bring its own scores (BYO by κ by family). Fail-closed (400).
  // Hoisted out of the dispatch (order: validateHarnessParams -> anti-override BYO ->
  // attested consistency -> dispatch); the throw and its message are byte-identical to the earlier inline guard.
  if (calibration !== undefined) {
    const overridesCommitted =
      taskClass === TASK_BTC_DIR ||
      taskClass === TASK_CASCADE ||
      taskClass === TASK_LIQ_ELIGIBLE || // class-lock: the liq class is committed on the CLASS (server-imposed
      // alpha/nMin + server-derived stratum), so a BYO `calibration` may never override it, whatever the key:
      // lookupCommittedCalibration only knows the s0 key (dropping this => RED, gate-liq.test.ts).
      lookupCommittedCalibration(taskClass, prediction.predictor_id) !== undefined;
    if (overridesCommitted) {
      throw new HarnessToolError(
        `calibration must not override the committed (task_class, predictor_id) '${taskClass}' / '${prediction.predictor_id}': use a caller-owned key for BYO`,
        "byo_overrides_committed",
      );
    }
    // Look-alike guard: AFTER the exact guard, so an exact committed name keeps its
    // message byte for byte; a name that only imitates one (ASCII case, edge blank, checksum-case address) or
    // takes a reserved kata name is refused too.
    const lookAlike = byoLookAlike(taskClass, prediction.predictor_id);
    if (lookAlike !== undefined) {
      throw new HarnessToolError(lookAlike.message, lookAlike.code);
    }
    // Confusable guard: after the look-alike guard, whose messages and codes stay byte-identical.
    const confusable = byoConfusable(taskClass, prediction.predictor_id);
    if (confusable !== undefined) {
      throw new HarnessToolError(confusable, "byo_lookalike_confusable");
    }
  }

  // Attested-consistency guard: a caller-carried `attested` must DECLARE a subject
  // consistent with the served class (exact committed-URL membership). Never a verification — no verifier
  // runs here; a free/BYO class or a discordant subject fails closed to a tool error (400), naming the
  // subject and the class with the two distinct texts. Absent `attested` ⇒ a no-op (byte-identical behaviour).
  if (attested !== undefined) {
    const inconsistency = checkAttestedConsistency(taskClass, attested.subject);
    if (inconsistency !== undefined) {
      throw new HarnessToolError(inconsistency, "attested_inconsistent");
    }
  }

  let verdict: CoverageVerdict;
  let nCalib: number;
  let aci: AciState | undefined;
  // A kata class is a class of the served class registry whose cell rule is kata-bucket.
  const kataTable = (options.policyTables ?? SERVED_POLICY_TABLES).find((t) => t.task_class === taskClass && t.table.class.cell_key_rule === "kata-bucket")?.table;

  if (calibration !== undefined) {
    ({ verdict, aci } = byoVerdict(prediction, params, calibration));
    nCalib = verdict.n_calib; // the scores the verdict read: all of them, or the window of the online level
  } else if (taskClass === TASK_BTC_DIR) {
    // Retired, never served; the BYO guards above keep the name reserved.
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
  } else if (kataTable !== undefined) {
    // The kata request contract (grid and lateness first), then the cell lookup; the verdict is assembled
    // here from the row's fields, and its n_calib is the row's n (0 with no row: under_calib).
    verdict = kataVerdict(kataPath(prediction, params, kataTable, options.nowMs), prediction, SCHEMA_VERSION);
    nCalib = verdict.n_calib;
  } else {
    // An unknown class (e.g. the class-B name, kept out of service) ⇒ a
    // HarnessToolError (⇒ 400 via http.ts), NEVER `under_calib`. The `known:` list carries no class-B name,
    // so the B name only appears as the unknown `'${taskClass}'`, never as a served class.
    throw new HarnessToolError(`unknown task_class '${taskClass}' (known: ${TASK_CASCADE}, ${TASK_STABLE_RUN}, ${TASK_LIQ_ELIGIBLE}; or supply params.calibration for BYO)`, "task_class_unknown");
  }

  // Attested `residual` seam. When a caller-carried `attested` is present
  // (and, by the guard above, DECLARED-consistent with the served class), thread ITS residual into
  // `verdict.residual` — the traceability field the contract inherits from `AttestedPrice.residual`. `residual`
  // is NOT an honesty carrier: the L3 gate never reads it (l3-gate.ts `decide()` reads only region/reason),
  // so action/reason/allow are UNCHANGED — only this field is filed, UNCONDITIONALLY on the reason (covered /
  // under_calib / set_too_large). `params` files nothing. Absent `attested` ⇒ no-op (byte-identical).
  // Dormant on the served surface: no served class has a committed subject;
  // the seam is kept.
  if (attested !== undefined) {
    verdict = { ...verdict, residual: [...attested.residual] };
  }

  const gateInput: GateInput = {
    intent: params.intent,
    verdict,
    remainingBudget: suiviBudget(prediction, params, verdict), // step 6: min(the caller's B_t, the replayed tracking budget)
    bFloor: params.bFloor,
    tau: params.tau,
    tauInterval: params.tauInterval,
    nCalib,
    nMin: params.nMin,
    clockOpen: params.clockOpen,
    timedOut: false, // a pure server never invents an upstream timeout
    evaluable: deriveEvaluable(taskClass, prediction.yhat, calibration),
    tool: params.tool, // NAMED, echoed — NEVER invoked
    schemaVersion: SCHEMA_VERSION, // server-fixed, not caller-carried
    requestSha256: envelopeSha256(prediction, params, attested), // contract 1.1.0: the envelope as received
  };

  const decision = gate(gateInput);
  // Honesty gates: the wire is the frozen, closed contract — nothing else.
  assertClosedGateDecision(decision);
  assertNoForbiddenKey(decision);
  return { decision, aci };
}

/** The texts and sources of the three served tables: the served sentences, byte for byte. */
export const SERVED_TABLE_TEXTS: ServedTableTexts = {
  classText: (c) => (c === TASK_STABLE_RUN ? STABLE_RUN_UNCALIBRATED_SENTENCE : c === TASK_LIQ_ELIGIBLE ? LIQ_EMPTY_REGISTRY_SENTENCE : c === TASK_CASCADE ? CASCADE_UNCALIBRATED_SENTENCE : kataClassText(c)),
  marginal: (c) => c === TASK_LIQ_ELIGIBLE
    ? { registry_file: "sha256:fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4", registry_sha256: "fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4", generator: "scripts/record-u4b-calib.mjs", text: LIQ_COMMITTED_SENTENCE }
    : { registry_file: "fixtures/usde-calib-scores.json", registry_sha256: "e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28", generator: "scripts/record-usde-calib.mjs", text: STABLE_RUN_COMMITTED_SENTENCE },
};

/** The served tables (the 32 kata tables, each from its committed table file when pinned, and the three marginal ones), built once at load, fail-closed. */
export const SERVED_POLICY_TABLES = kataTablesMatchPins(servedPolicyTables(SERVED_TABLE_TEXTS, readCommittedTables(COMMITTED_FILES, kataClassEntries(kataClassText), { tables: COMMITTED_TABLES, held: [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES] })), COMMITTED_TABLES, [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES]);
/** The three marginal tables (USDe, liq, cascade): a view of SERVED_POLICY_TABLES, not a second build. */
export const SERVED_MARGINAL_TABLES = SERVED_POLICY_TABLES.filter((t) => t.table.class.cell_key_rule !== "kata-bucket");

/** The cell of a served class (contract 1.1.0): its key, its current row if any, and its table, read from the served tables. */
function servedCell(taskClass: string, cellKey: string): VerdictCell {
  const t = SERVED_MARGINAL_TABLES.find((x) => x.task_class === taskClass);
  if (t === undefined) throw new Error(`no served table for '${taskClass}'`);
  const row = t.table.rows.find((r) => r.current && r.cell_key === cellKey);
  return { qhatUnit: t.table.class.qhat_unit, scale: null, cellKey, policyRowSha256: row === undefined ? null : sha256Canonical(row), policyTableSha256: t.policy_table_sha256 };
}

/** `request_sha256` of the envelope as received; one not written canonically (I-JSON: a lone surrogate, a number outside
 *  binary64) is a named 400 `param_invalid`, after every other check. Only the RangeError of the writer converts. */
function envelopeSha256(prediction: Prediction, params: HarnessParams, attested: AttestedPrice | undefined): string {
  try {
    return requestSha256({ prediction, params, ...(attested === undefined ? {} : { attested }) });
  } catch (e) {
    if (e instanceof RangeError) throw new HarnessToolError(`the request is not writable canonically (I-JSON, RFC 7493): ${e.message}`, "param_invalid");
    throw e;
  }
}

/** qhat and alpha of a committed key, read on the current row of its cell in the served table
 *  (the admitted row, built at load with the exact rank of its alpha); no current row ⇒ under_calib. */
function admittedSplit(cell: VerdictCell): { readonly qhat: number; readonly alpha: number } | { readonly reason: "under_calib" } {
  const row = SERVED_MARGINAL_TABLES.flatMap((t) => t.table.rows).find((r) => r.current && r.cell_key === cell.cellKey);
  return row === undefined || row.qhat === null ? { reason: "under_calib" } : { qhat: row.qhat, alpha: Number(row.alpha) };
}

/** Step 6 of ROADMAP.md: the bounds of a caller's tracking evidence; the first three also at the SDK boundary. The replay compares
 *  unreduced integers of about t L bits at each label t (L = suiviDenBits of the policy), about n products of n L bits per bet. The
 *  work bound keeps n L at most 3600 bits: 0.12 s at 500 labels for the USDe cell (L = 7), 0.3 s with 8 bets a mixture, measured
 *  on 2026-11-04. A rational text of at most 20 characters (nine digits on each side of the slash) keeps the parse itself cheap. */
export const SUIVI_MAX_N = 500;
export const SUIVI_MAX_BETS = 8;
export const SUIVI_MAX_TEXT = 20;
export const SUIVI_MAX_WORK_BITS = 3600;

function suiviRefusal(rule: string): never {
  throw new HarnessToolError(`invalid param 'suivi': ${rule}`, "param_invalid");
}

/** A JSON object of the caller (not a list). */
const isRecord = (v: unknown): v is Readonly<Record<string, unknown>> => typeof v === "object" && v !== null && !Array.isArray(v);

/** The lambdas and weights lists of a mixture read from caller JSON, before the policy check: those that are lists. */
const betsLists = (bets: unknown): readonly (readonly unknown[])[] =>
  isRecord(bets) ? [bets["lambdas"], bets["weights"]].filter((l): l is readonly unknown[] => Array.isArray(l)) : [];
/** The rational texts of a policy read from caller JSON: its seven scalars and the entries of its three mixtures. */
const policyTexts = (p: Readonly<Record<string, unknown>>): readonly unknown[] => [p["a"], p["m"], p["delta_adm"], p["delta_exh"],
  p["alpha_arl"], p["eta_m1"], p["sr_reading_threshold"], ...[p["bets_k"], p["bets_w"], p["bets_sr"]].flatMap(betsLists).flat()];

/** The shape the replay needs, checked on the caller's JSON before it runs (the replay checks the rest): the policy names the
 *  request's class and the verdict's cell, and the lists keep to their bounds. On the BYO path (`params.calibration`) the verdict
 *  names no cell (cell_key null, as closed-check.ts couples it to a null table sha): the cell is the request's class and key, so the
 *  policy names the request's predictor_id (decision of the founder, 2026-11-05). The evidence is the caller's; no signature is read. */
function checkSuivi(s: unknown, prediction: Prediction, verdict: CoverageVerdict, byo: boolean): asserts s is SuiviEvidence {
  const e: Readonly<Record<string, unknown>> = isRecord(s) ? s : {};
  const policy = isRecord(e.policy) ? e.policy : null;
  if (policy === null) suiviRefusal("expected an object with a policy object");
  const { evaluations, outcomes } = e;
  if (!Array.isArray(evaluations) || evaluations.length > SUIVI_MAX_N) suiviRefusal(`expected a list of at most ${String(SUIVI_MAX_N)} evaluations`);
  if (!Array.isArray(outcomes) || outcomes.length > SUIVI_MAX_N) suiviRefusal(`expected a list of at most ${String(SUIVI_MAX_N)} outcomes`);
  if ([policy["bets_k"], policy["bets_w"], policy["bets_sr"]].flatMap(betsLists).some((l) => l.length > SUIVI_MAX_BETS)) suiviRefusal(`expected at most ${String(SUIVI_MAX_BETS)} bets a mixture`);
  if (policyTexts(policy).some((t) => typeof t === "string" && t.length > SUIVI_MAX_TEXT)) suiviRefusal(`expected rational texts of at most ${String(SUIVI_MAX_TEXT)} characters`);
  if (policy["task_class"] !== prediction.task_class) suiviRefusal(`the policy's task_class is not the request's '${prediction.task_class}'`);
  if (byo) {
    if (policy["cell_key"] !== prediction.predictor_id) suiviRefusal(`the policy's cell_key is not the request's predictor_id '${prediction.predictor_id}' (a BYO cell is its class and key)`);
    return;
  }
  // Every served path names its cell (servedCell, kata-path.ts); kept so that a verdict with no cell still fails closed.
  if (verdict.cell_key === null) suiviRefusal("the verdict has no cell key");
  if (policy["cell_key"] !== verdict.cell_key) suiviRefusal(`the policy's cell_key is not the verdict's '${verdict.cell_key}'`);
}

/** B_t read by L3 (step 6 of ROADMAP.md): the caller's, or with `params.suivi` min(the caller's, the budget its replay gives), so the
 *  tracking only lowers it: -1 with no licence or after a closure, so `budget_exhausted`. Every refusal is a 400 `param_invalid`. */
function suiviBudget(prediction: Prediction, params: HarnessParams, verdict: CoverageVerdict): number {
  const s: unknown = params.suivi;
  if (s === undefined) return params.remainingBudget;
  checkSuivi(s, prediction, verdict, params.calibration !== undefined);
  try {
    const n = s.evaluations.length, bits = suiviDenBits(s.policy);
    if (n * bits > SUIVI_MAX_WORK_BITS) suiviRefusal(`the replay's work, ${String(n)} evaluations by ${String(bits)} bits, passes its bound of ${String(SUIVI_MAX_WORK_BITS)} bits`);
    return Math.min(params.remainingBudget, suiviReplay(s).budget);
  } catch (err) {
    if (err instanceof RangeError) suiviRefusal(err.message);
    throw err;
  }
}

/** The caller's evidence of the online level, replayed; each refusal is a 400 `byo_calibration_invalid`, the replay's RangeError included. */
function replayAci(evidence: unknown, scores: readonly number[], params: HarnessParams): AciState {
  const refuse = (rule: string): never => {
    throw new HarnessToolError(`invalid calibration.aci: ${rule}`, "byo_calibration_invalid");
  };
  if (!isRecord(evidence)) return refuse("expected an object");
  if (!Array.isArray(evidence["decided_after"])) return refuse("expected a list decided_after");
  try {
    return aciReplay(scores, params.alpha, params.nMin, evidence as unknown as AciEvidence);
  } catch (err) {
    if (err instanceof RangeError) return refuse(err.message);
    throw err;
  }
}

/** The honesty text of the online level, then what the level did: figures the closed decision cannot carry (a delivery aid, derived from the replay). */
export function aciHonestyText(s: AciState): string {
  const bound = s.bound === null ? "none" : aciBoundText(s.bound);
  return `${ACI_LABEL} B_t is caller-carried. aci level=${aciLevelText(s.level)} gamma=${String(s.gamma)} window=${String(s.windowSize)} T=${String(s.steps)} misses=${String(s.misses)} no_region=${String(s.noRegion)} max_delay=${String(s.maxDelay)} bound=${bound} region=${s.region.kind}`;
}

// The committed kata tables and their pins, read at line 1029; the pins also by the defaults of kataClause (line 222). Imports
// only below this point: ESM evaluates them before this file's body whatever their place, and neither module imports this file or kata-path.ts (no new cycle).
import { COMMITTED_FILES, readCommittedTables } from "../policy-committed.ts";
import { COMMITTED_TABLES, FLOOR_HELD_CLASSES, ORDER_HELD_CLASSES } from "../policy-committed-pins.ts";
