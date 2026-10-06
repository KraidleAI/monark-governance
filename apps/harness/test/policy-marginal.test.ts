/**
 * Marginal rows of 1.1.0 (lot CM-4a-ii-a, block B2; docs/G0-lot-cm-4a-ii.md G-4, G-5; A-2 section 2.3 and its killers,
 * section 5): class entries of the stable-run, liquidation and cascade classes, rows rebuilt from calibration.ts, their
 * table guard and LIQ-BAND-EXACT-GUARD-1. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedClassEntry, sha256Canonical, type ClassEntry, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { UKEMI_LIQ_COMMITTED, UKEMI_LIQ_PREDICTOR_BASE, USDE_STABLE_RUN_CALIB, USDE_STABLE_RUN_PREDICTOR_ID, USDE_STABLE_RUN_TASK_CLASS, type CommittedCalibration } from "../src/calibration.ts";
import { LIQ_POLICY, USDE_POLICY } from "../src/class-policy.ts";
import { assertLiqBandExact, guardMarginalTable, marginalClassEntries, marginalRow, type MarginalInputs } from "../src/policy-marginal.ts";
import { buildPolicyTable } from "../src/policy-table-file.ts";
import { STRATA_CUTS_SERVED } from "../src/ukemi-strata.ts";
import { TASK_CASCADE } from "../src/tools/gate.ts";

const ENTRIES = marginalClassEntries((c) => `class text of ${c}`);
const [USDE, LIQ, CASCADE] = ENTRIES as [ClassEntry, ClassEntry, ClassEntry];
const INP: MarginalInputs = { registry_file: "calibration.ts", registry_sha256: "ab".repeat(32), generator: "recorder", text: "row text" };
const USDE_CAL: CommittedCalibration = { taskClass: USDE_STABLE_RUN_TASK_CLASS, predictorId: USDE_STABLE_RUN_PREDICTOR_ID, scores: USDE_STABLE_RUN_CALIB, digestPinned: "", provenance: "" };
const usdeRow = marginalRow(USDE_CAL, USDE, USDE_POLICY, "time", INP);
const liqRow = marginalRow(UKEMI_LIQ_COMMITTED[0] as CommittedCalibration, LIQ, LIQ_POLICY, "ascending", INP);
const raw = (cls: ClassEntry, rows: PolicyRow[]): PolicyTable => ({ row_format: "class-policy-v2", class: cls, rows });
const guardUsde = (t: PolicyTable): void => guardMarginalTable(t, USDE, [USDE_CAL], USDE_POLICY, "time", INP);
const guardLiq = (t: PolicyTable): void => guardMarginalTable(t, LIQ, UKEMI_LIQ_COMMITTED, LIQ_POLICY, "ascending", INP);

// killer: apps/harness/src/policy-marginal.ts:28 CONST "\"upper-bound\"" -> "\"additive-band\""
test("marginal_class_entries_follow_plan_5_2_1", () => {
  for (const e of ENTRIES) assertClosedClassEntry(e);
  assert.deepEqual(ENTRIES.map((e) => e.task_class), [USDE_STABLE_RUN_TASK_CLASS, "liquidation-eligible-coverage", TASK_CASCADE]);
  for (const e of ENTRIES) assert.deepEqual([e.region_kind, e.qhat_unit, e.statement, e.method, e.test_delta, e.h_ms, e.grid, e.label_schema], ["interval", "label", "marginal", "split", null, null, false, null]);
  assert.deepEqual([USDE.region_rule, USDE.cell_key_rule, USDE.alpha, USDE.n_min, USDE.cell_key_base, USDE.strata_cuts], ["additive-band", "committed-key", null, null, null, null]);
  assert.deepEqual([LIQ.region_rule, LIQ.cell_key_rule, LIQ.alpha, LIQ.n_min, LIQ.cell_key_base, LIQ.strata_cuts], ["upper-bound", "liq-stratum", "0.01", 100, UKEMI_LIQ_PREDICTOR_BASE, [...STRATA_CUTS_SERVED]]);
  assert.ok((LIQ.strata_cuts ?? []).length > 0 && (LIQ.strata_cuts ?? []).every((x) => x < 2 ** 53));
  assert.deepEqual([CASCADE.region_rule, CASCADE.cell_key_rule, CASCADE.alpha, CASCADE.text], ["additive-band", "committed-key", null, `class text of ${TASK_CASCADE}`]);
});

// killer: apps/harness/src/policy-marginal.ts:45 CONST "scoresSha256(c.scores)" -> "scoresSha256([...c.scores].sort((a, b) => a - b))"
test("marginal_rows_rebuilt_from_calibration", () => {
  const sorted = [...USDE_STABLE_RUN_CALIB].sort((a, b) => a - b);
  assert.deepEqual([usdeRow.n, usdeRow.p_served, usdeRow.qhat, usdeRow.alpha, usdeRow.n_min, usdeRow.order], [613, 553, sorted[552], "0.1", 50, "time"]);
  assert.equal(usdeRow.scores_sha256, sha256Canonical(USDE_STABLE_RUN_CALIB));
  assert.notEqual(usdeRow.scores_sha256, sha256Canonical(sorted));
  assert.deepEqual([liqRow.cell_key, liqRow.n, liqRow.p_served, liqRow.qhat, liqRow.alpha, liqRow.n_min, liqRow.order], [`${UKEMI_LIQ_PREDICTOR_BASE}/s0`, 170, 170, 126184298996, "0.01", 100, "ascending"]);
  assert.deepEqual([usdeRow.marginal_alpha, liqRow.marginal_alpha], ["0.0994", "0.0059"]);
  for (const r of [usdeRow, liqRow]) {
    assert.deepEqual([r.k_star, r.k_obs, r.misses, r.miss_bound, r.test_delta, r.recompute, r.source.trial_id, r.source.wave, r.status, r.status_reason], [null, null, null, null, null, null, null, null, "region", ""]);
  }
  guardUsde(buildPolicyTable(USDE, [usdeRow]));
  guardLiq(buildPolicyTable(LIQ, [liqRow]));
  guardMarginalTable(buildPolicyTable(CASCADE, []), CASCADE, [], USDE_POLICY, "time", INP);
});

// killer: apps/harness/src/policy-marginal.ts:66 SDL "if (canonicalJson(table.rows.map((r) => canonicalJson(r)).sort())" -> ""
test("marginal_guard_refuses_altered_rows", () => {
  const sorted = [...USDE_STABLE_RUN_CALIB].sort((a, b) => a - b);
  const forged: [PolicyTable, RegExp][] = [
    [raw(USDE, [{ ...usdeRow, qhat: (usdeRow.qhat ?? 0) * 2 }]), /rows differ/],
    [raw(USDE, [{ ...usdeRow, scores_sha256: sha256Canonical(sorted) }]), /rows differ/],
    [raw(USDE, [{ ...usdeRow, order: "ascending" }]), /rows differ/],
    [raw(USDE, [{ ...usdeRow, source: { ...usdeRow.source, wave: 1 } }]), /rows differ/],
    [raw(USDE, []), /rows differ/],
    [raw(LIQ, [{ ...liqRow, qhat: 126184298995 }]), /rows differ/],
    [raw(USDE, [{ ...usdeRow, k_star: 0 }]), /set on a marginal row/],
    [raw(LIQ, [{ ...liqRow, miss_bound: "0.0100000", bound_on: "region" }]), /set on a marginal row/],
    [raw(USDE, [{ ...usdeRow, p_served: null }]), /without p_served/],
    [raw({ ...USDE, alpha: "0.02" }, [usdeRow]), /class entry differs/],
  ];
  for (const [t, re] of forged) assert.throws(() => (t.class.task_class === LIQ.task_class ? guardLiq(t) : guardUsde(t)), re);
  assert.throws(() => marginalRow(USDE_CAL, USDE, USDE_POLICY, "ascending", INP), /declares the order ascending but its stored scores are not/);
  assert.throws(() => marginalRow({ ...USDE_CAL, scores: USDE_STABLE_RUN_CALIB.slice(0, 40) }, USDE, USDE_POLICY, "time", INP), /under_calib/);
});

// killer: apps/harness/src/policy-marginal.ts:57 CONST "Number.MAX_SAFE_INTEGER" -> "0"
test("liq_band_exact_guard", () => {
  assertLiqBandExact(liqRow, LIQ);
  const at = (k: string, qhat: number): PolicyRow => ({ ...liqRow, cell_key: `${UKEMI_LIQ_PREDICTOR_BASE}/${k}`, qhat });
  assert.throws(() => assertLiqBandExact(at("s3", liqRow.qhat ?? 0), LIQ), /LIQ-BAND-EXACT-GUARD-1/);
  const edge = 2 ** 53 - ((STRATA_CUTS_SERVED[2] as number) - 1);
  assertLiqBandExact(at("s2", edge), LIQ);
  assert.throws(() => assertLiqBandExact(at("s2", edge + 1), LIQ), /LIQ-BAND-EXACT-GUARD-1/);
  for (const k of ["s4", "s01", "x"]) assert.throws(() => assertLiqBandExact(at(k, 1), LIQ), /not a stratum key/);
  assert.throws(() => assertLiqBandExact({ ...liqRow, cell_key: "other/base/s0" }, LIQ), /not a stratum key/);
  assert.throws(() => assertLiqBandExact(liqRow, { ...LIQ, strata_cuts: [] }), /not a stratum key/);
});
