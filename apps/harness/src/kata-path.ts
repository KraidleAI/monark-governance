/**
 * The pure kata path of contract 1.1.0, not served (lot CM-4b-a; docs/G0-lot-cm-4b.md; spec sections 9 and 11; plan r3
 * section 5.4; delegated decision CM-4b C-1 to C-11). The kata request contract, the served table files built in
 * process, and the cell lookup with the fields of a kata verdict. No served module imports this file before block D
 * (test kata_path_is_not_served). It uses the exports of tools/gate.ts at call time only, never while loading, so
 * gate.ts can import it in block D. The verdict fields stay in a local type until block C adds them to CoverageVerdict.
 */
import { sha256Canonical, type ClassEntry, type PolicyTable, type Prediction } from "@monark/contracts";
import { bandEdge } from "@monark/hikae";
import { lookupCommittedCalibration, UKEMI_LIQ_COMMITTED, USDE_STABLE_RUN_PREDICTOR_ID, USDE_STABLE_RUN_TASK_CLASS } from "./calibration.ts";
import { LIQ_POLICY, USDE_POLICY } from "./class-policy.ts";
import { kataClassEntries, kataKeyProblem } from "./policy-classes.ts";
import { marginalClassEntries, marginalRow, type MarginalInputs } from "./policy-marginal.ts";
import { buildPolicyTable, policyTableSha256 } from "./policy-table-file.ts";
import { HarnessToolError, PRODUCED_AT_FUTURE_TOLERANCE_MS, rfc3339Instant, type HarnessErrorCode, type HarnessParams } from "./tools/gate.ts";

/** The reasons a kata verdict can carry (spec section 6); block C checks KATA_REASONS within COVERAGE_REASONS, block D drops it. */
export const KATA_REASONS = ["covered", "set_too_large", "non_evaluable", "under_calib", "calib_silence", "calib_vetoed", "calib_retired", "out_of_support", "region_degenerate"] as const;
export type KataReason = (typeof KATA_REASONS)[number];
export type KataRegion = { readonly kind: "set"; readonly labels: readonly string[]; readonly label_schema: string } | { readonly kind: "interval"; readonly lo: number; readonly hi: number };

/** The fields of a kata verdict (spec section 5) that the class's table file determines. */
export interface KataVerdictFields {
  readonly method: "risk-control" | "split";
  readonly alpha: number;
  readonly n_calib: number;
  readonly region: KataRegion | null;
  readonly qhat: number | null;
  readonly qhat_unit: ClassEntry["qhat_unit"];
  readonly scale: number | null;
  readonly abstain: boolean;
  readonly reason: KataReason;
  readonly scores_sha256: string;
  readonly cell_key: string;
  readonly policy_row_sha256: string | null;
  readonly policy_table_sha256: string;
}

const refuse = (code: HarnessErrorCode, what: string): never => {
  throw new HarnessToolError(`${what} (contract 1.1.0, spec section 9)`, code);
};
const CALIB_REASONS: Partial<Record<string, KataReason>> = { silence: "calib_silence", vetoed: "calib_vetoed", retired: "calib_retired" };
const TIME_FIELDS = /[Tt]\d{2}:\d{2}:(\d{2})(?:\.(\d+))?(?:[Zz]|[+-]\d{2}:\d{2})$/;

/** produced_at on a kata class, after the grammar and future checks: the grid on the string's fields (seconds 00, every
 *  fraction digit 0, the instant a multiple of h), then, with nowMs only, the lateness bound (the 300 s of B-4). */
export function assertKataProducedAt(producedAt: string, cls: ClassEntry, nowMs?: number): void {
  const at = rfc3339Instant(producedAt) ?? refuse("produced_at_invalid", `invalid prediction.produced_at ${JSON.stringify(producedAt)}: expected an RFC 3339 date-time`);
  const f = TIME_FIELDS.exec(producedAt);
  if (f?.[1] !== "00" || /[^0]/.test(f[2] ?? "") || at % (cls.h_ms ?? NaN) !== 0) refuse("produced_at_off_grid", `prediction.produced_at '${producedAt}' is not on the ${String(cls.h_ms)} ms grid of '${cls.task_class}'`);
  if (nowMs !== undefined && nowMs - at > PRODUCED_AT_FUTURE_TOLERANCE_MS) refuse("produced_at_stale", `prediction.produced_at '${producedAt}' is more than ${String(PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000)} s before the server clock`);
}

/** The kata request contract, in its written order: grid and lateness, then yhat type, features_digest, key, domain,
 *  imposed alpha and nMin (also with no row), and the tau cap of a set class. A lean of 0 is not refused here. */
export function assertKataRequest(p: Prediction, params: HarnessParams, cls: ClassEntry, nowMs?: number): void {
  assertKataProducedAt(p.produced_at, cls, nowMs);
  const dir = cls.region_rule === "sign-set";
  const y = typeof p.yhat === "number" ? p.yhat : refuse("yhat_type_mismatch", `task_class '${cls.task_class}' expects a number yhat, got ${typeof p.yhat}`);
  if (p.features_digest === undefined) refuse("features_digest_required", `task_class '${cls.task_class}' requires prediction.features_digest`);
  const why = kataKeyProblem(p.predictor_id, cls.task_class);
  if (why !== undefined) refuse("kata_key_invalid", `prediction.predictor_id ${JSON.stringify(p.predictor_id)} ${why}`);
  if (dir ? !(y >= -1 && y <= 1) : !(Number.isFinite(y) && y > 0)) refuse("kata_yhat_domain", `yhat ${String(y)} is outside the domain of '${cls.task_class}' (${dir ? "a lean in [-1, 1]" : "a finite scale > 0"})`);
  if (params.alpha !== Number(cls.alpha)) refuse("policy_alpha_mismatch", `task_class '${cls.task_class}' requires params.alpha = ${String(cls.alpha)}, got ${String(params.alpha)}`);
  if (params.nMin !== cls.n_min) refuse("policy_nmin_mismatch", `task_class '${cls.task_class}' requires params.nMin = ${String(cls.n_min)}, got ${String(params.nMin)}`);
  if (dir && params.tau > 1) refuse("policy_tau_cap", `task_class '${cls.task_class}' requires params.tau <= 1, got ${String(params.tau)}`);
}

/** The cell lookup (spec sections 9 and 11): the key, then the current row of that key in the class's table, if any. */
export function kataVerdictFields(table: PolicyTable, p: Prediction, tau: number): KataVerdictFields {
  const cls = table.class;
  const y = p.yhat as number;
  const dir = cls.region_rule === "sign-set";
  const side = y > 0 ? "up" : "down";
  const current = table.rows.filter((r) => r.current);
  // C-8: the thresholds of the first current row of the side, in the table's order (equal on the side under the guard).
  const thr = current.find((r) => r.cell_key.startsWith(`${p.predictor_id}/${side}-`))?.thresholds ?? null;
  const m = Math.abs(y);
  const key = !dir ? `${p.predictor_id}/b0` : y === 0 ? p.predictor_id : thr === null ? `${p.predictor_id}/${side}` : `${p.predictor_id}/${side}-b${m <= Number(thr.t1) ? "1" : m <= Number(thr.t2) ? "2" : "3"}`;
  const noRow: KataVerdictFields = {
    method: cls.method, alpha: Number(cls.alpha), n_calib: 0, region: null, qhat: null, qhat_unit: cls.qhat_unit, scale: dir ? null : y,
    abstain: true, reason: "under_calib", scores_sha256: sha256Canonical([]), cell_key: key, policy_row_sha256: null, policy_table_sha256: policyTableSha256(table),
  };
  if (dir && y === 0) return { ...noRow, reason: "non_evaluable" };
  const row = current.find((r) => r.cell_key === key);
  if (row === undefined) return noRow;
  const at = { ...noRow, method: row.statement === "per-calibration" ? "risk-control" : "split", alpha: Number(row.alpha), n_calib: row.n, scores_sha256: row.scores_sha256, policy_row_sha256: sha256Canonical(row) } as const;
  const calib = CALIB_REASONS[row.status];
  if (dir) {
    const both = (cls.label_schema ?? "up|down").split("|");
    if (calib !== undefined) return { ...at, region: { kind: "set", labels: both, label_schema: cls.label_schema ?? "up|down" }, qhat: 1, abstain: true, reason: calib };
    // A served set follows the served set verdict rule (byoVerdict): abstain and set_too_large when |C| > tau.
    if (row.status === "region") return { ...at, region: { kind: "set", labels: [side], label_schema: cls.label_schema ?? "up|down" }, qhat: 0, abstain: 1 > tau, reason: 1 > tau ? "set_too_large" : "covered" };
    return at;
  }
  const s = row.calib_support;
  if (s !== null && !(y >= s.min && y <= s.max)) return { ...at, reason: "out_of_support" };
  if (calib !== undefined) return { ...at, reason: calib };
  if (row.status !== "region" || row.qhat === null) return at;
  const h = bandEdge(row.qhat, y);
  return h === null || h === 0 ? { ...at, reason: "region_degenerate" } : { ...at, region: { kind: "interval", lo: 0, hi: h }, qhat: row.qhat, abstain: false, reason: "covered" };
}

/** The kata path: the request contract first, so a lean of 0 answers non_evaluable only after every 400 check (C-7). */
export function kataPath(p: Prediction, params: HarnessParams, table: PolicyTable, nowMs?: number): KataVerdictFields {
  assertKataRequest(p, params, table.class, nowMs);
  return kataVerdictFields(table, p, params.tau);
}

/** The texts of the served tables (values fixed by MONARK's dated line before F-5a; synthetic in the tests). */
export type ServedTableTexts = { readonly classText: (taskClass: string) => string; readonly marginal: MarginalInputs };
export type ServedTable = { readonly task_class: string; readonly table: PolicyTable; readonly policy_table_sha256: string };

/** The served table files (C-10), built in process: the 32 wave 1 kata classes with no row (B-9), the stable-run,
 *  liquidation and cascade classes with their rows rebuilt from calibration.ts. Pure, deterministic, sorted by task_class. */
export function servedPolicyTables(texts: ServedTableTexts): readonly ServedTable[] {
  const [usde, liq, cascade] = marginalClassEntries(texts.classText) as [ClassEntry, ClassEntry, ClassEntry];
  const usdeCal = lookupCommittedCalibration(USDE_STABLE_RUN_TASK_CLASS, USDE_STABLE_RUN_PREDICTOR_ID);
  const tables = [
    ...kataClassEntries(texts.classText).map((c) => buildPolicyTable(c, [])),
    buildPolicyTable(usde, usdeCal === undefined ? [] : [marginalRow(usdeCal, usde, USDE_POLICY, "time", texts.marginal)]),
    buildPolicyTable(liq, UKEMI_LIQ_COMMITTED.map((c) => marginalRow(c, liq, LIQ_POLICY, "ascending", texts.marginal))),
    buildPolicyTable(cascade, []),
  ];
  return tables.map((table) => ({ task_class: table.class.task_class, table, policy_table_sha256: policyTableSha256(table) })).sort((a, b) => (a.task_class < b.task_class ? -1 : 1));
}
