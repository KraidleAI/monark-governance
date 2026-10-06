/**
 * Policy table formats `class-policy-v2` (spec section 10; lot CM-3c-1, block A, docs/G0-lot-cm-3c-1.md). The 60 row
 * columns are pinned here from the delegated decision of 2026-10-04 on Q-1 (table "colonne | type | obligatoire |
 * source" of the advisor's opinion), approved by MONARK. Admitted: a marginal row (stable-run shape), a kata direction
 * row, a wave 2 kata band row, a retired row, a kata class and the liquidation class. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { POLICY_ALLOWED_KEYS, assertClosedClassEntry, assertClosedPolicyRow, assertClosedPolicyTable } from "../src/policy-table.ts";

const ROW_KEYS = [
  "row_format", "task_class", "cell_key", "region_rule", "current", "kata_id", "w", "venue", "symbol", "horizon", "side", "bucket",
  "thresholds", "scale_table", "calib_support", "fit_sha256", "statement", "alpha", "test_delta", "calib_attempt", "calib_cause",
  "calib_parent", "epoch", "bound_on", "tau_cap", "n_min", "n", "k_star", "p_served", "k_obs", "misses", "qhat", "miss_bound",
  "marginal_alpha", "aux_seq", "runs_miss", "runs_aux", "tail_frac", "runs_level", "tail_m", "tail_a", "tail_tail_num",
  "tail_tail_den", "miss_adj_a", "miss_adj_tail_num", "miss_adj_tail_den", "test", "bridge", "fwd", "vetoes", "status",
  "status_reason", "retire", "scores_sha256", "aux_sha256", "series_sha256", "order", "source", "recompute", "text",
];
const CLASS_KEYS = [
  "task_class", "region_kind", "region_rule", "qhat_unit", "statement", "method", "alpha", "test_delta", "n_min", "h_ms",
  "grid", "cell_key_rule", "cell_key_base", "strata_cuts", "label_schema", "text",
];

type Obj = Record<string, unknown>;
const H = "ab".repeat(32);
const NULLS: Obj = Object.fromEntries(ROW_KEYS.map((k) => [k, null]));
const SOURCE = { registry_file: "apps/harness/src/calibration.ts", registry_sha256: H, trial_id: null, wave: null, generator: "calibration.ts" };
const MARGINAL: Obj = {
  ...NULLS, row_format: "class-policy-v2", task_class: "stable-run-velocity-24h", cell_key: "usde:committed", region_rule: "additive-band",
  current: true, statement: "marginal", alpha: "0.1", calib_attempt: 1, n_min: 50, n: 120, p_served: 109, qhat: 0.42,
  marginal_alpha: "0.0917", status: "region", status_reason: "", scores_sha256: H, order: "time", source: SOURCE, text: "t",
};
const DIR: Obj = {
  ...MARGINAL, task_class: "btc-dir-1h", cell_key: "kata:trend-ema-v1@binance/BTCUSDT/1h/up-b1", region_rule: "sign-set",
  kata_id: "trend-ema-v1", w: 200, venue: "binance", symbol: "BTCUSDT", horizon: "1h", side: "up", bucket: "up-b1",
  thresholds: { t1: "0.223425761335205", t2: "0.5091419976180096" }, statement: "per-calibration", alpha: "0.45", test_delta: "0.05",
  calib_cause: "initial", calib_parent: "none", epoch: 1, bound_on: "commit", tau_cap: 1, n_min: 6, n: 632, k_star: 263,
  p_served: 369, k_obs: 200, misses: 250, qhat: 0, miss_bound: "0.4494240", marginal_alpha: "0.3956", aux_seq: "label",
  runs_miss: "pass", runs_aux: "empty", runs_level: "0.05", test: { k_test: 351, n_test: 676, u_test: "0.5514708" },
  vetoes: { test: false, bridge: null, fwd: null }, aux_sha256: H, series_sha256: H,
  source: { ...SOURCE, registry_file: "kata/registry/wave1.json", trial_id: "btc-dir-1h|trend-ema-v1|CALIB", wave: 1 },
  recompute: { verifier: "verifier-a", scores_sha256: H, report_sha256: H },
};
const BAND: Obj = {
  ...DIR, task_class: "btc-range-1h", cell_key: "kata:vol-v1@binance/BTCUSDT/1h/b0", region_rule: "scaled-band", side: null,
  bucket: "b0", thresholds: null, tau_cap: null, alpha: "0.01", n_min: 299, qhat: 2.5, aux_seq: "score", bound_on: "region",
  scale_table: { kind: "hour-of-week", values: [0.8, 1.25, null], sha256: createHash("sha256").update("[0.8,1.25,null]").digest("hex") },
  calib_support: { min: 0.001, max: 0.05 }, tail_frac: "0.95", tail_m: 40, tail_a: 3, tail_tail_num: "123456789012345678901234567890",
  tail_tail_den: "987654321098765432109876543210", miss_adj_a: 2, miss_adj_tail_num: "0", miss_adj_tail_den: "12",
  bridge: { k_test: 3, n_test: 40, u_test: "1" }, fwd: { k_test: null, n_test: 0, u_test: null }, vetoes: { test: false, bridge: false, fwd: true },
};
const RETIRED: Obj = { ...DIR, status: "retired", status_reason: "retired: live:1", miss_bound: null, bound_on: null, retire: { cause: "live:1", k_test: 5, n_test: 30, u_test: "0.9000000" } };
const KATA_CLASS: Obj = {
  task_class: "btc-dir-1h", region_kind: "set", region_rule: "sign-set", qhat_unit: "score", statement: "per-calibration",
  method: "risk-control", alpha: "0.45", test_delta: "0.05", n_min: 6, h_ms: 3600000, grid: true, cell_key_rule: "kata-bucket",
  cell_key_base: null, strata_cuts: null, label_schema: "up|down", text: "t",
};
const LIQ_CLASS: Obj = {
  ...KATA_CLASS, task_class: "liquidation-eligible-coverage", region_kind: "interval", region_rule: "upper-bound", qhat_unit: "label",
  statement: "marginal", method: "split", alpha: "0.01", test_delta: null, n_min: 100, h_ms: null, grid: false,
  cell_key_rule: "liq-stratum", cell_key_base: "ukemi:liq-base", strata_cuts: [200000000000, 10000000000000, 100000000000000], label_schema: null,
};
const without = (o: Obj, key: string): Obj => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));
const refused = (row: Obj, re: RegExp): void => assert.throws(() => assertClosedPolicyRow(row), re, JSON.stringify(row).slice(0, 80));

// killer: packages/contracts/src/policy-table.ts:79 CONST "fwd: nul(VETO_BLOCK)" -> "fwd2: nul(VETO_BLOCK)"
test("policy_row_and_class_entry_keys_are_pinned", () => {
  assert.equal(ROW_KEYS.length, 60);
  assert.deepEqual([...POLICY_ALLOWED_KEYS.policyRow].sort(), [...ROW_KEYS].sort());
  assert.deepEqual([...POLICY_ALLOWED_KEYS.classEntry].sort(), [...CLASS_KEYS].sort());
});

// killer: packages/contracts/src/policy-table.ts:32 CONST "v > 0" -> "v > 1"
test("policy_rows_classes_and_table_admitted", () => {
  for (const row of [MARGINAL, DIR, BAND, RETIRED]) assertClosedPolicyRow(row);
  for (const c of [KATA_CLASS, LIQ_CLASS]) assertClosedClassEntry(c);
  assertClosedPolicyTable({ row_format: "class-policy-v2", class: KATA_CLASS, rows: [DIR, BAND] });
  assertClosedPolicyTable({ row_format: "class-policy-v2", class: LIQ_CLASS, rows: [] });
});

// killer: packages/contracts/src/policy-table.ts:44 SDL "for (const k of Object.keys(shape))" -> ""
test("policy_row_is_closed", () => {
  refused({ ...DIR, extra: 1 }, /unknown key 'extra'/);
  refused(without(DIR, "fwd"), /misses the key 'fwd'/);
  refused({ ...DIR, source: without(DIR["source"] as Obj, "wave") }, /PolicyRow\.source misses the key 'wave'/);
  refused({ ...DIR, source: { ...(DIR["source"] as Obj), extra: null } }, /PolicyRow\.source has an unknown key 'extra'/);
  refused({ ...DIR, n: "632" }, /PolicyRow\.n is not a safe integer/);
  refused({ ...DIR, current: null }, /PolicyRow\.current is not a boolean/);
  assert.throws(() => assertClosedPolicyRow([]), /is not an object/);
});

// killer: packages/contracts/src/policy-table.ts:124 SDL "MARGINAL_SET.includes(k)" -> ""
test("marginal_row_closed_column_list", () => {
  for (const k of ["test_delta", "calib_cause", "epoch", "k_star", "aux_seq", "runs_miss", "tail_m", "recompute", "kata_id", "w", "scale_table", "calib_support"]) {
    refused({ ...MARGINAL, [k]: DIR[k] ?? BAND[k] }, new RegExp(`PolicyRow\\.${k} is set on a marginal row`));
  }
  refused({ ...MARGINAL, test: DIR["test"], vetoes: DIR["vetoes"] }, /PolicyRow\.test is set on a marginal row/);
  for (const k of ["p_served", "qhat", "marginal_alpha"]) refused({ ...MARGINAL, [k]: null }, /marginal row without p_served/);
  refused({ ...MARGINAL, order: "random" }, /order is not one of time \| ascending/);
});

// killer: packages/contracts/src/policy-table.ts:116 SDL "(r.retire !== null)" -> ""
test("policy_row_couplings_of_blocks_retire_and_tails", () => {
  refused({ ...DIR, vetoes: null }, /vetoes not matching/);
  refused({ ...DIR, test: null }, /vetoes not matching/);
  refused({ ...BAND, bridge: null }, /vetoes not matching/);
  refused({ ...DIR, vetoes: { test: false, bridge: null, fwd: false } }, /vetoes not matching/);
  refused({ ...RETIRED, retire: null }, /retire not null exactly when status is retired/);
  refused({ ...DIR, retire: RETIRED["retire"] }, /retire not null exactly when status is retired/);
  refused({ ...BAND, tail_tail_den: null }, /tail numerator without its denominator/);
  refused({ ...BAND, miss_adj_tail_num: null }, /tail numerator without its denominator/);
});

// killer: packages/contracts/src/policy-table.ts:118 SDL "r.bucket.split" -> ""
test("policy_row_couplings_of_side_bound_sign_set_and_scale", () => {
  refused({ ...DIR, side: "down" }, /side that does not lead its bucket/);
  refused({ ...DIR, side: null }, /side that does not lead its bucket/);
  refused({ ...BAND, side: "up" }, /side that does not lead its bucket/);
  refused({ ...DIR, bound_on: null }, /miss_bound and bound_on/);
  refused({ ...DIR, status: "silence" }, /miss_bound and bound_on/);
  refused({ ...DIR, tau_cap: null }, /sign-set columns/);
  refused({ ...BAND, tau_cap: 1 }, /sign-set columns/);
  refused({ ...DIR, calib_support: { min: 0.001, max: 0.05 } }, /sign-set columns/);
  refused({ ...BAND, scale_table: { ...(BAND["scale_table"] as Obj), values: [0.8, 1.25, 1] } }, /sha256 that is not the digest/);
});

// killer: packages/contracts/src/policy-table.ts:50 CONST "0\\.[0-9]{7}" -> "0\\.[0-9]{1,7}"
test("policy_row_value_grammars", () => {
  refused({ ...DIR, test: { k_test: 351, n_test: 676, u_test: "0.55" } }, /test\.u_test is not a string/);
  refused({ ...DIR, miss_bound: "0.449424" }, /miss_bound is not a string/);
  refused({ ...MARGINAL, marginal_alpha: "0.09170" }, /marginal_alpha is not a string/);
  refused({ ...BAND, tail_tail_num: "0123" }, /tail_tail_num is not a string/);
  refused({ ...BAND, miss_adj_tail_den: "0" }, /miss_adj_tail_den is not a string/);
  refused({ ...BAND, tail_tail_num: 12 }, /tail_tail_num is not a string/);
  refused({ ...DIR, thresholds: { t1: "0.50", t2: "1" } }, /thresholds\.t1 is not a shortest round-trip decimal/);
  refused({ ...DIR, w: 2 ** 53 }, /w is not a safe integer/);
  refused({ ...DIR, calib_attempt: 5 }, /calib_attempt is not a safe integer in \[1, 4\]/);
  refused({ ...DIR, calib_parent: "parent" }, /calib_parent is not a string/);
  refused({ ...DIR, bucket: "up-b4" }, /bucket is not one of/);
  refused({ ...DIR, row_format: "class-policy-v1" }, /row_format is not one of class-policy-v2/);
  refused({ ...BAND, scale_table: { ...(BAND["scale_table"] as Obj), values: [0.8, 0, null] } }, /values\[1\] is not a finite number > 0/);
});

// killer: packages/contracts/src/policy-table.ts:71 CONST "[0-9]{0,3}[1-9]" -> "[0-9]{0,4}[1-9]"
test("policy_row_alpha_grammar", () => {
  for (const alpha of ["0.1", "0.45", "0.01", "0.0001", "0.9999", "0.1234"]) assertClosedPolicyRow({ ...DIR, alpha });
  for (const alpha of ["-0.1", "2", "1e-7", "0.12345", "0", "1", "0.450", "NaN", ".5", 0.5]) refused({ ...DIR, alpha }, /PolicyRow\.alpha is not a string/);
});

// killer: packages/contracts/src/policy-table.ts:109 SDL "cuts.every" -> ""
test("class_entry_and_table_refusals", () => {
  assert.throws(() => assertClosedClassEntry({ ...LIQ_CLASS, strata_cuts: [10, 10] }), /strata_cuts is not strictly increasing/);
  assert.throws(() => assertClosedClassEntry({ ...LIQ_CLASS, strata_cuts: [2 ** 53] }), /strata_cuts\[0\] is not a safe integer/);
  assert.throws(() => assertClosedClassEntry({ ...KATA_CLASS, qhat_unit: "unit" }), /qhat_unit is not one of label \| scale \| score/);
  assert.throws(() => assertClosedClassEntry({ ...KATA_CLASS, extra: 1 }), /unknown key 'extra'/);
  assert.throws(() => assertClosedPolicyTable({ row_format: "class-policy-v1", class: KATA_CLASS, rows: [] }), /PolicyTable\.row_format/);
  assert.throws(() => assertClosedPolicyTable({ row_format: "class-policy-v2", class: KATA_CLASS }), /misses the key 'rows'/);
  assert.throws(() => assertClosedPolicyTable({ row_format: "class-policy-v2", class: KATA_CLASS, rows: [DIR, { ...DIR, n: -1 }] }), /PolicyTable\.rows\[1\]\.n/);
});
