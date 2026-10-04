/**
 * The marginal rows of 1.1.0 (lot CM-4a-ii-a, block B2; docs/G0-lot-cm-4a-ii.md G-4, G-5; A-2 section 2.3; plan r3
 * sections 5.1 and 5.2.1): the class entries of the stable-run, liquidation and cascade classes, their rows built from
 * the committed calibrations of calibration.ts, and the guard of their table files (each row equals the row rebuilt
 * from the scores the server holds; LIQ-BAND-EXACT-GUARD-1). The source and text values are parameters (dated line
 * before F-5a).
 */
import { assertClosedPolicyRow, canonicalJson, POLICY_ALLOWED_KEYS, scoresSha256, type ClassEntry, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { ceilDecimal4, splitQuantileExact, splitRankExact } from "@monark/hikae";
import { UKEMI_LIQ_PREDICTOR_BASE, USDE_STABLE_RUN_TASK_CLASS, type CommittedCalibration } from "./calibration.ts";
import { LIQ_POLICY, type ClassPolicyRow } from "./class-policy.ts";
import { assertPolicyTableFile } from "./policy-table-file.ts";
import { STRATA_CUTS_SERVED } from "./ukemi-strata.ts";

/** The source and text of a marginal class's rows (values outside calibration.ts: parameters). */
export type MarginalInputs = { readonly registry_file: string; readonly registry_sha256: string; readonly generator: string; readonly text: string };

const fail = (what: string): never => {
  throw new Error(`MONARK marginal guard: ${what}.`);
};

/** The class entries of the stable-run, liquidation and cascade classes (plan r3 section 5.2.1). */
export function marginalClassEntries(text: (taskClass: string) => string): readonly ClassEntry[] {
  const base = { region_kind: "interval", qhat_unit: "label", statement: "marginal", method: "split", test_delta: null, h_ms: null, grid: false, label_schema: null } as const;
  const keyed = { region_rule: "additive-band", alpha: null, n_min: null, cell_key_rule: "committed-key", cell_key_base: null, strata_cuts: null } as const;
  return [
    { ...base, ...keyed, task_class: USDE_STABLE_RUN_TASK_CLASS, text: text(USDE_STABLE_RUN_TASK_CLASS) },
    { ...base, task_class: LIQ_POLICY.taskClass, region_rule: "upper-bound", alpha: String(LIQ_POLICY.alpha), n_min: LIQ_POLICY.nMin, cell_key_rule: "liq-stratum", cell_key_base: UKEMI_LIQ_PREDICTOR_BASE, strata_cuts: [...STRATA_CUTS_SERVED], text: text(LIQ_POLICY.taskClass) },
    { ...base, ...keyed, task_class: "cascade-liquidable-24h", text: text("cascade-liquidable-24h") },
  ];
}

/** The row of a committed calibration: n, the exact split rank and quantile, marginal_alpha, the scores digest in the stored order. */
export function marginalRow(c: CommittedCalibration, cls: ClassEntry, policy: ClassPolicyRow, order: "time" | "ascending", inp: MarginalInputs): PolicyRow {
  const alpha = String(policy.alpha);
  const n = c.scores.length;
  const p = splitRankExact(n, alpha);
  const split = splitQuantileExact(c.scores, alpha, policy.nMin);
  if (!("qhat" in split)) return fail(`${c.predictorId} does not serve a quantile (under_calib)`);
  if (order === "ascending" && c.scores.some((x, i) => i > 0 && (c.scores[i - 1] as number) > x)) fail(`${c.predictorId} declares the order ascending but its stored scores are not`);
  const row = {
    ...Object.fromEntries(POLICY_ALLOWED_KEYS.policyRow.map((k) => [k, null])),
    row_format: "class-policy-v2", task_class: c.taskClass, cell_key: c.predictorId, region_rule: cls.region_rule, current: true, statement: "marginal",
    alpha, calib_attempt: 1, n_min: policy.nMin, n, p_served: p, qhat: split.qhat, marginal_alpha: ceilDecimal4({ num: BigInt(n + 1 - p), den: BigInt(n + 1) }),
    status: "region", status_reason: "", scores_sha256: scoresSha256(c.scores), order,
    source: { registry_file: inp.registry_file, registry_sha256: inp.registry_sha256, trial_id: null, wave: null, generator: inp.generator }, text: inp.text,
  };
  assertClosedPolicyRow(row, c.predictorId);
  return row as PolicyRow;
}

/** LIQ-BAND-EXACT-GUARD-1 (ADR-CM section 10): max yhat of the row's stratum + qhat <= 2^53, the stratum key from the class base. */
export function assertLiqBandExact(row: PolicyRow, cls: ClassEntry): void {
  const cuts = cls.strata_cuts ?? [];
  const k = Number(/\/s([0-9]+)$/.exec(row.cell_key)?.[1]);
  if (cuts.length === 0 || !(k <= cuts.length) || row.cell_key !== `${String(cls.cell_key_base)}/s${String(k)}`) fail(`${row.cell_key} is not a stratum key of ${cls.task_class}`);
  const maxYhat = k < cuts.length ? (cuts[k] as number) - 1 : Number.MAX_SAFE_INTEGER;
  if (!(row.qhat !== null && row.qhat <= 2 ** 53 - maxYhat)) fail(`LIQ-BAND-EXACT-GUARD-1: ${row.cell_key}, max yhat ${String(maxYhat)} + qhat ${String(row.qhat)} exceeds 2^53`);
}

/** A marginal table file: its class entry is the expected one; its rows are exactly the rows rebuilt from the committed calibrations. */
export function guardMarginalTable(table: PolicyTable, expected: ClassEntry, committed: readonly CommittedCalibration[], policy: ClassPolicyRow, order: "time" | "ascending", inp: MarginalInputs): void {
  assertPolicyTableFile(table);
  if (canonicalJson(table.class) !== canonicalJson(expected)) fail(`${expected.task_class}: the class entry differs from the expected class entry`);
  const want = committed.filter((c) => c.taskClass === expected.task_class).map((c) => canonicalJson(marginalRow(c, expected, policy, order, inp))).sort();
  if (canonicalJson(table.rows.map((r) => canonicalJson(r)).sort()) !== canonicalJson(want)) fail(`${expected.task_class}: the rows differ from the rows rebuilt from calibration.ts`);
  if (expected.cell_key_rule === "liq-stratum") for (const r of table.rows) assertLiqBandExact(r, expected);
}
