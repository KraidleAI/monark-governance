/**
 * schemas/policy-row.schema.json (contract 1.1.0, block C, lot CM-3c-2; delegated decision Q-C4) against the closed check of block A
 * (src/policy-table.ts): a document the check admits is valid for the schema; probes on each of the 16 + 60 keys (and one level down)
 * get the same verdict from both, outside a CLOSED list of gaps named by the check's refusal. A new gap, or a schema refusal of an
 * admitted value, reddens. Synthetic values only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { POLICY_ALLOWED_KEYS, QHAT_UNITS, REGION_RULES, ROW_STATUSES, STATEMENTS, CELL_KEY_RULES, SCORE_ORDERS, CHECK_OUTCOMES, assertClosedClassEntry, assertClosedPolicyRow, assertClosedPolicyTable } from "../src/policy-table.ts";
import { canonicalJson, type CanonicalValue } from "../src/canonical.ts";

type Obj = Record<string, unknown>;
type Validate = (v: unknown) => boolean;
const require = createRequire(import.meta.url);
const Ajv = (require("ajv/dist/2020.js") as { default: new (o: Obj) => { addSchema: (s: unknown) => void; getSchema: (r: string) => Validate | undefined } }).default;
const FILE = new URL("../../../schemas/policy-row.schema.json", import.meta.url); // absent: every test fails by an assertion, not at load
const SCHEMA = (existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : { required: [], $defs: {} }) as { required: string[]; $defs: Record<string, { required: string[]; properties: Obj }> };
/** The probe values (below): every enum value of the check, then type, null, bound and pattern edges. */
const ajv = new Ajv({ strict: true, allowUnionTypes: true }); ajv.addSchema(SCHEMA);
const def = (ref: string): Validate => ajv.getSchema(`https://monark.local/schemas/policy-row.schema.json${ref}`) ?? assert.fail(ref);

const H = "ab".repeat(32);
const SOURCE = { registry_file: "apps/harness/src/calibration.ts", registry_sha256: H, trial_id: null, wave: null, generator: "calibration.ts" };
const MARGINAL: Obj = {
  ...Object.fromEntries(POLICY_ALLOWED_KEYS.policyRow.map((k) => [k, null])), row_format: "class-policy-v2", task_class: "stable-run-velocity-24h",
  cell_key: "usde:committed", region_rule: "additive-band", current: true, statement: "marginal", alpha: "0.1", calib_attempt: 1, n_min: 50, n: 120,
  p_served: 109, qhat: 0.42, marginal_alpha: "0.0917", status: "region", status_reason: "", scores_sha256: H, order: "time", source: SOURCE, text: "t",
};
const DIR: Obj = {
  ...MARGINAL, task_class: "btc-dir-1h", cell_key: "kata:k@binance/BTCUSDT/1h/up-b1", region_rule: "sign-set", kata_id: "k", w: 200, venue: "binance",
  symbol: "BTCUSDT", horizon: "1h", side: "up", bucket: "up-b1", thresholds: { t1: "0.2", t2: "0.5" }, statement: "per-calibration", alpha: "0.45",
  test_delta: "0.05", calib_cause: "initial", calib_parent: "none", epoch: 1, bound_on: "commit", tau_cap: 1, n_min: 6, n: 632, k_star: 263, p_served: 369,
  k_obs: 200, misses: 250, qhat: 0, miss_bound: "0.4494240", marginal_alpha: "0.3956", aux_seq: "label", runs_miss: "pass", runs_aux: "empty",
  runs_level: "0.05", test: { k_test: 351, n_test: 676, u_test: "0.5514708" }, vetoes: { test: false, bridge: null, fwd: null }, aux_sha256: H,
  series_sha256: H, source: { ...SOURCE, trial_id: "btc-dir-1h|k|CALIB", wave: 1 }, recompute: { verifier: "verifier-a", scores_sha256: H, report_sha256: H },
};
const BAND: Obj = {
  ...DIR, task_class: "btc-range-1h", cell_key: "kata:k@binance/BTCUSDT/1h/b0", region_rule: "scaled-band", side: null, bucket: "b0", thresholds: null,
  tau_cap: null, alpha: "0.01", n_min: 299, qhat: 2.5, aux_seq: "score", bound_on: "region", calib_support: { min: 0.001, max: 0.05 },
  scale_table: { kind: "hour-of-week", values: [0.8, 1.25, null], sha256: createHash("sha256").update("[0.8,1.25,null]").digest("hex") },
  tail_frac: "0.95", tail_m: 40, tail_a: 3, tail_tail_num: "1234", tail_tail_den: "9876", miss_adj_a: 2, miss_adj_tail_num: "0", miss_adj_tail_den: "12",
  bridge: { k_test: 3, n_test: 40, u_test: "1" }, fwd: { k_test: null, n_test: 0, u_test: null }, vetoes: { test: false, bridge: false, fwd: true },
};
const RETIRED: Obj = { ...DIR, status: "retired", status_reason: "retired: live:1", miss_bound: null, bound_on: null, retire: { cause: "live:1", k_test: 5, n_test: 30, u_test: "0.9000000" } };
const KATA_CLASS: Obj = {
  task_class: "btc-dir-1h", region_kind: "set", region_rule: "sign-set", qhat_unit: "score", statement: "per-calibration", method: "risk-control", alpha: "0.45",
  test_delta: "0.05", n_min: 6, h_ms: 3600000, grid: true, cell_key_rule: "kata-bucket", cell_key_base: null, strata_cuts: null, label_schema: "up|down", text: "t",
};
const LIQ_CLASS: Obj = {
  ...KATA_CLASS, task_class: "liquidation-eligible-coverage", region_kind: "interval", region_rule: "upper-bound", qhat_unit: "label", statement: "marginal",
  method: "split", alpha: "0.01", test_delta: null, n_min: 100, h_ms: null, grid: false, cell_key_rule: "liq-stratum", cell_key_base: "ukemi:liq-base",
  strata_cuts: [200000000000, 10000000000000], label_schema: null,
};

const PROBES: unknown[] = [
  ...QHAT_UNITS, ...REGION_RULES, ...ROW_STATUSES, ...STATEMENTS, ...CELL_KEY_RULES, ...SCORE_ORDERS, ...CHECK_OUTCOMES,
  "set", "interval", "risk-control", "split", "15m", "1h", "4h", "24h", "up", "down", "up-b2", "up-b3", "down-b1", "down-b2", "down-b3", "b0", "hour-of-week",
  "us-profile", "commit", "class-policy-v2", "none", H, H.toUpperCase(), `${H}0`, null, true, false, 0, -0, 1, 2, 4, 5, -1, 0.5, 2 ** 53 - 1, 2 ** 53, 1e300,
  "", "x", "1", "0", "-0", "0.1", "0.10000000000000001", "1e-7", "1e21", "1e+21", "0.0917", "0.09170", "0.4494240", "0.449424", "0.123456", "0.1234567",
  "0.12345678", "0.0001", "0.00001", "007", [], [1, 2], [2, 1], [0], [null], [0.5], {},
];
const admits = (check: (v: unknown) => void, v: unknown): string => { try { check(v); return "admitted"; } catch (e) { return (e as Error).message.replace(/^MONARK policy check: \S+ /, ""); } };

/** Every probe on every key of `base` (and one level down in an object value): disagreements as "key: check refusal". */
function disagreements(base: Obj, schema: Validate, check: (v: unknown) => void, at: string, out: Set<string>, depth = 0): void {
  const variants: [string, Obj][] = [[`${at}+extra`, { ...base, extra: 1 }]];
  for (const k of Object.keys(base)) {
    variants.push([`${at}.${k}-missing`, Object.fromEntries(Object.entries(base).filter(([x]) => x !== k))]);
    for (const p of PROBES) variants.push([`${at}.${k}`, { ...base, [k]: p }]);
    const sub = base[k];
    if (depth === 0 && sub !== null && typeof sub === "object" && !Array.isArray(sub)) disagreements(sub as Obj, (v) => schema({ ...base, [k]: v }), (v) => { check({ ...base, [k]: v }); }, `${at}.${k}`, out, 1);
  }
  for (const [name, v] of variants) {
    const c = admits(check, v), s = schema(v);
    if (c === "admitted" && !s) out.add(`SCHEMA REFUSES AN ADMITTED VALUE: ${name} = ${JSON.stringify(v).slice(0, 120)}`);
    if (c !== "admitted" && s) out.add(`${c.replace(/\.$/, "")}: ${name}`);
  }
}

/** The CLOSED list of gaps (valid for the schema, refused by the check) by refusal: the shortest round-trip writing (-0 and
 *  0.10000000000000001 below), the couplings of decision Q-1 condition 1, strata_cuts order and scale_table.sha256. */
const GAPS = Object.entries({
  "is not a shortest round-trip decimal": "class.alpha class.test_delta row.test_delta row.thresholds.t1 row.thresholds.t2",
  "is not strictly increasing": "class.strata_cuts",
  "has a sha256 that is not the digest of its values": "row.scale_table.sha256 row.scale_table.values",
  "has vetoes not matching its test, bridge and fwd blocks": "row.bridge row.fwd row.test row.vetoes row.vetoes.bridge row.vetoes.fwd",
  "has retire not null exactly when status is retired": "row.retire row.status",
  "has a tail numerator without its denominator": "row.miss_adj_tail_den row.miss_adj_tail_num row.tail_tail_den row.tail_tail_num",
  "has a side that does not lead its bucket": "row.bucket row.side",
  "has miss_bound and bound_on not both set on a region row": "row.bound_on row.miss_bound row.status",
  "breaks the sign-set columns": "row.region_rule row.tau_cap",
  "is set on a marginal row": "row.aux_seq row.aux_sha256 row.bucket row.calib_cause row.calib_parent row.epoch row.fit_sha256 row.horizon row.k_obs row.k_star " +
    "row.kata_id row.miss_adj_a row.misses row.runs_aux row.runs_level row.runs_miss row.series_sha256 row.statement row.symbol row.tail_a row.tail_frac row.tail_m row.test_delta row.venue row.w",
  "is a marginal row without p_served, qhat and marginal_alpha": "row.marginal_alpha row.p_served row.qhat",
}).flatMap(([rule, keys]) => keys.split(" ").map((k) => `${rule}: ${k}`));

// killer: schemas/policy-row.schema.json:45 CONST "\"kata_id\": {" -> "\"kata_ix\": {"
test("policy_row_schema_keys_equal_the_closed_check_keys_and_it_admits_the_admitted_tables", () => {
  assert.deepEqual(SCHEMA.required, ["row_format", "class", "rows"]);
  for (const [name, keys] of [["ClassEntry", POLICY_ALLOWED_KEYS.classEntry], ["PolicyRow", POLICY_ALLOWED_KEYS.policyRow]] as const) {
    const d = SCHEMA.$defs[name] ?? assert.fail(name);
    assert.deepEqual([d.required, Object.keys(d.properties)], [[...keys], [...keys]], `${name}: required and properties = the check's keys, in order`);
  }
  for (const t of [{ row_format: "class-policy-v2", class: KATA_CLASS, rows: [MARGINAL, DIR, BAND, RETIRED] }, { row_format: "class-policy-v2", class: LIQ_CLASS, rows: [] }]) {
    assertClosedPolicyTable(t); assert.ok(def("")(t), String(t.class["task_class"]));
  }
  assert.equal(def("")({ row_format: "class-policy-v2", class: LIQ_CLASS, rows: [], extra: 1 }), false, "the table file is closed");
});

// killer: schemas/policy-row.schema.json:49 CONST "\"4h\", " -> "\"4x\", "
test("policy_row_schema_parity_key_by_key_with_a_closed_list_of_gaps", () => {
  const out = new Set<string>();
  for (const row of [MARGINAL, DIR, BAND, RETIRED]) disagreements(row, def("#/$defs/PolicyRow"), (v) => { assertClosedPolicyRow(v); }, "row", out);
  for (const c of [KATA_CLASS, LIQ_CLASS]) disagreements(c, def("#/$defs/ClassEntry"), (v) => { assertClosedClassEntry(v); }, "class", out);
  assert.deepEqual([...out].sort(), [...GAPS].sort());
  for (const d of ["0.10", "+1", "1E+5", "01", "1.", "1e5", "1e+05", ".5"]) assert.equal(def("#/$defs/Dec")(d), false, `the decimal pattern refuses ${d}`);
  for (const d of ["-0", "0.10000000000000001"]) assert.equal(def("#/$defs/ClassEntry")({ ...KATA_CLASS, test_delta: d }), admits(assertClosedClassEntry, { ...KATA_CLASS, test_delta: d }) !== "admitted");
  assert.ok(def("#/$defs/PolicyRow")({ ...DIR, text: "\ud800" }) && admits((v) => canonicalJson(v as CanonicalValue), { ...DIR, text: "\ud800" }) !== "admitted", "gap: a lone surrogate, refused by the canonical writing");
});
