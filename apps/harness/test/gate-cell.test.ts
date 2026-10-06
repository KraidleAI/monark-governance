/**
 * Harness: the cell fields and the served tables of contract 1.1.0 (block C, lot CM-3c-3b2; delegated decisions Q-C1 and
 * Q-C3; G2 of lot 3c-3b1, m-1 and m-7). A BYO verdict has no class entry: qhat_unit is fixed by its mode, scale and the
 * three table fields are null. A served class reads its cell from its table: the key searched, the current row of that
 * key if any, the table digest; the numeric values served equal those of the admitted row. The texts and sources of the
 * tables are the Z-3 values; a liq row that breaks LIQ-BAND-EXACT-GUARD-1 is refused at the served load. Each test names
 * its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sha256Canonical, type GateDecision, type Prediction } from "@monark/contracts";
import { servedPolicyTables } from "../src/kata-path.ts";
import {
  runGate, CASCADE_UNCALIBRATED_SENTENCE, LIQ_COMMITTED_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE, SCHEMA_VERSION, SERVED_MARGINAL_TABLES,
  SERVED_TABLE_TEXTS, STABLE_RUN_COMMITTED_SENTENCE, STABLE_RUN_UNCALIBRATED_SENTENCE, type HarnessParams,
} from "../src/tools/gate.ts";
import { UKEMI_LIQ_PREDICTOR_BASE, USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";

const P: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const LIQ_P: HarnessParams = { ...P, alpha: 0.01, nMin: 100 };
const pred = (task_class: string, yhat: string | number, predictor_id: string): Prediction => ({ schema_version: SCHEMA_VERSION, task_class, yhat, predictor_id, produced_at: "2026-09-04T00:00:00Z" });
const USDE = pred("stable-run-velocity-24h", 0.0001, USDE_STABLE_RUN_PREDICTOR_ID);
const LIQ_S0 = pred("liquidation-eligible-coverage", 5000, "ukemi:client-supplied-key");
const LIQ_S3 = pred("liquidation-eligible-coverage", 500000000000000, "ukemi:client-supplied-key");
const table = (c: string): (typeof SERVED_MARGINAL_TABLES)[number] => SERVED_MARGINAL_TABLES.find((t) => t.task_class === c) ?? assert.fail(c);
const rowOf = (c: string, key: string) => table(c).table.rows.find((r) => r.current && r.cell_key === key) ?? assert.fail(key);
const cellOf = (d: GateDecision): unknown[] => [d.verdict.qhat_unit, d.verdict.scale, d.verdict.cell_key, d.verdict.policy_row_sha256, d.verdict.policy_table_sha256];

// Q-C1: four BYO verdicts (interval and set, served and under_calib): qhat_unit of the mode, scale and table fields null.
// killer: apps/harness/src/tools/gate.ts:489 CONST "\"label\" : \"score\"" -> "\"score\" : \"label\""
test("byo_qhat_unit_is_fixed_by_the_mode", () => {
  const scores = [0.3, 0.05, 0.2, 0.1, 0.25, 0.15, 0.08, 0.12, 0.18, 0.22];
  const byo = (yhat: string | number): Prediction => pred("byo-demo", yhat, "caller:model");
  const set = { mode: "set", candidates: [{ label: "A", score: 0.1 }, { label: "B", score: 0.9 }] } as const;
  const cases: [GateDecision, string, string][] = [
    [runGate(byo(0), { ...P, nMin: 5, tauInterval: 2, calibration: { scores, mode: "interval" } }), "label", "covered"],
    [runGate(byo(0), { ...P, nMin: 50, calibration: { scores, mode: "interval" } }), "label", "under_calib"],
    [runGate(byo("A"), { ...P, nMin: 5, intent: "A", calibration: { scores, ...set } }), "score", "covered"],
    [runGate(byo("A"), { ...P, nMin: 50, intent: "A", calibration: { scores, ...set } }), "score", "under_calib"],
  ];
  for (const [d, unit, reason] of cases) assert.deepEqual([d.verdict.reason, ...cellOf(d)], [reason, unit, null, null, null, null], `${unit} ${reason}`);
});

// The served classes read the current row of the key searched; a key with no row has none (liq s3, cascade).
// killer: apps/harness/src/tools/gate.ts:1050 CONST "r.current && r.cell_key === cellKey" -> "false"
test("served_cell_carries_the_current_row_of_the_key", () => {
  const s0 = `${UKEMI_LIQ_PREDICTOR_BASE}/s0`;
  const cases: [GateDecision, string, string, string | null][] = [
    [runGate(USDE, P), "stable-run-velocity-24h", USDE_STABLE_RUN_PREDICTOR_ID, sha256Canonical(rowOf("stable-run-velocity-24h", USDE_STABLE_RUN_PREDICTOR_ID))],
    [runGate(LIQ_S0, LIQ_P), "liquidation-eligible-coverage", s0, sha256Canonical(rowOf("liquidation-eligible-coverage", s0))],
    [runGate(LIQ_S3, LIQ_P), "liquidation-eligible-coverage", `${UKEMI_LIQ_PREDICTOR_BASE}/s3`, null],
  ];
  for (const [d, c, key, row] of cases) assert.deepEqual(cellOf(d), ["label", null, key, row, table(c).policy_table_sha256], key);
});

// The cascade key searched is the predictor_id received (no row: the class has no committed calibration).
// killer: apps/harness/src/tools/gate.ts:578 CONST "servedCell(TASK_CASCADE, prediction.predictor_id)" -> "servedCell(TASK_CASCADE, TASK_CASCADE)"
test("cascade_cell_key_is_the_received_predictor_id", () => {
  const d = runGate(pred("cascade-liquidable-24h", 12345, "internal:ukemi-cascade-v0"), P);
  assert.deepEqual(cellOf(d), ["label", null, "internal:ukemi-cascade-v0", null, table("cascade-liquidable-24h").policy_table_sha256]);
});

// G2 m-7: qhat, n_calib, alpha and scores_sha256 served on USDe and liq s0 equal those of the admitted row.
// killer: apps/harness/src/policy-marginal.ts:44 CONST "qhat: split.qhat," -> "qhat: split.qhat * 2,"
test("served_values_equal_the_admitted_row", () => {
  for (const [d, c] of [[runGate(USDE, P), "stable-run-velocity-24h"], [runGate(LIQ_S0, LIQ_P), "liquidation-eligible-coverage"]] as const) {
    const r = rowOf(c, d.verdict.cell_key ?? "");
    assert.deepEqual([d.verdict.reason, d.verdict.qhat, d.verdict.n_calib, String(d.verdict.alpha), d.verdict.scores_sha256], ["covered", r.qhat, r.n, r.alpha, r.scores_sha256], c);
  }
});

// Q-C3 and Q-3b-4: one function of bytes (kata parity), the class and row texts are the served sentences, the sources
// are the provenance already public (USDe: the fixture and its recorder; liq: held by liq_table_source_names_the_series_by_sha256_only).
// killer: apps/harness/src/tools/gate.ts:1038 CONST "registry_file: \"fixtures/usde-calib-scores.json\"" -> "registry_file: \"fixtures/usde.json\""
test("served_tables_texts_and_sources", () => {
  const names = SERVED_MARGINAL_TABLES.map((t) => t.task_class);
  assert.deepEqual(servedPolicyTables(SERVED_TABLE_TEXTS).filter((t) => names.includes(t.task_class)), [...SERVED_MARGINAL_TABLES].sort((a, b) => (a.task_class < b.task_class ? -1 : 1)));
  const texts = SERVED_MARGINAL_TABLES.map((t) => [t.table.class.text, ...t.table.rows.map((r) => r.text)]);
  // Block D (lot D-2): SERVED_MARGINAL_TABLES is a view of the served tables, in their order (by task_class).
  assert.deepEqual(texts, [[CASCADE_UNCALIBRATED_SENTENCE], [LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_COMMITTED_SENTENCE], [STABLE_RUN_UNCALIBRATED_SENTENCE, STABLE_RUN_COMMITTED_SENTENCE]]);
  const usde = rowOf("stable-run-velocity-24h", USDE_STABLE_RUN_PREDICTOR_ID).source;
  assert.deepEqual([usde.registry_file, usde.registry_sha256, usde.generator], ["fixtures/usde-calib-scores.json", "e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28", "scripts/record-usde-calib.mjs"]);
});

// LIQ-BAND-EXACT-GUARD-1 at the served load: a child imports gate.ts with the committed s0 entry renamed s3 (same scores,
// same q-hat, its pin renamed too); max yhat of s3 + q-hat exceeds 2^53, so the load throws; the same child without the
// rename loads.
// killer: apps/harness/src/policy-served.ts:27 SDL "    guardMarginalTable(table, cls, committed, policy, order, inp);" -> ""
test("liq_band_exact_guard_at_the_served_load", async () => {
  const hook = `import { registerHooks } from "node:module";
registerHooks({ load(url, context, nextLoad) {
  const r = nextLoad(url, context);
  if (!url.endsWith("/src/calibration.ts") || process.env.LIQ_BAND_RENAME !== "1") return r;
  const src = typeof r.source === "string" ? r.source : Buffer.from(r.source).toString("utf8");
  return { ...r, source: src.replace('/A/s0"', '/A/s3"').replace("}/s0" + String.fromCharCode(96), "}/s3" + String.fromCharCode(96)) };
} });`;
  const gate = pathToFileURL(fileURLToPath(new URL("../src/tools/gate.ts", import.meta.url))).href;
  const run = (rename: string): Promise<{ ok: boolean; stderr: string }> => new Promise((resolve) => {
    const args = ["--import", `data:text/javascript,${encodeURIComponent(hook)}`, "--input-type=module", "-e", `await import(${JSON.stringify(gate)});`];
    execFile(process.execPath, args, { env: { ...process.env, LIQ_BAND_RENAME: rename }, encoding: "utf8", timeout: 60000 }, (e, _out, stderr) => { resolve({ ok: e === null, stderr }); });
  });
  const clean = await run("0");
  assert.ok(clean.ok, clean.stderr.slice(0, 300));
  const forged = await run("1");
  assert.ok(!forged.ok && forged.stderr.includes(`LIQ-BAND-EXACT-GUARD-1: ${UKEMI_LIQ_PREDICTOR_BASE}/s3`), forged.stderr.slice(0, 400));
});

// Z-3 composition (rule of MONARK; Q-C3 condition 5; cut (a) of C2, with S-8): the served sentence is the table text of the
// resolved cell (its current row, else the class text) followed by the unchanged suffix, on USDe (its key and another),
// cascade and liq s0 to s3; the closed list of the liq gap is empty. USDe and cascade hold at the base (killer by hand).
// killer: apps/harness/src/tools/gate.ts:746 CONST "}; B_t is caller-carried.`;" -> "}. B_t is caller-carried.`;"
test("served_text_is_table_text_plus_suffix", () => {
  const run = (p: Prediction, params: HarnessParams): string => HARNESS_TOOLS.find((t) => t.name === "gate")?.run({ prediction: p, params }).text ?? "";
  const cases: [string, Prediction, HarnessParams, string][] = [
    ["usde", USDE, P, rowOf("stable-run-velocity-24h", USDE_STABLE_RUN_PREDICTOR_ID).text],
    ["usde other", pred("stable-run-velocity-24h", 0.0001, "narabi:other"), P, table("stable-run-velocity-24h").table.class.text],
    ["cascade", pred("cascade-liquidable-24h", 12345, "internal:ukemi-cascade-v0"), P, table("cascade-liquidable-24h").table.class.text],
    ["liq s0", LIQ_S0, LIQ_P, rowOf("liquidation-eligible-coverage", `${UKEMI_LIQ_PREDICTOR_BASE}/s0`).text],
    ...[1e12, 5e13, 5e14].map((y, i): [string, Prediction, HarnessParams, string] => [`liq s${String(i + 1)}`, pred("liquidation-eligible-coverage", y, "ukemi:k"), LIQ_P, table("liquidation-eligible-coverage").table.class.text]),
  ];
  const gaps = cases.filter(([, p, params, text]) => !run(p, params).startsWith(`${text}; B_t is caller-carried. verdict `)).map(([name]) => name);
  assert.deepEqual(gaps, [], "the closed list of the gap is empty");
});

// Q-3b2-2 (closed in lot CM-3c-4b): qhat, alpha and n_calib served on USDe and liq s0 are read on the admitted row, not
// recomputed from the scores. A child loads gate.ts with the row builder of policy-marginal.ts doubling qhat (the load
// guard rebuilds with the same builder, so it passes): the served qhat follows the row, twice the recomputed q-hat.
// killer: apps/harness/src/tools/gate.ts:635 CONST "admittedSplit(cell)" -> "{ ...splitQuantileShortest(scores, params.alpha, params.nMin), alpha: params.alpha }"
test("served_qhat_ncalib_alpha_read_from_the_admitted_row", async () => {
  const hook = `import { registerHooks } from "node:module";
registerHooks({ load(url, context, nextLoad) {
  const r = nextLoad(url, context);
  if (!url.endsWith("/src/policy-marginal.ts")) return r;
  const src = typeof r.source === "string" ? r.source : Buffer.from(r.source).toString("utf8");
  return { ...r, source: src.replace("qhat: split.qhat,", "qhat: split.qhat * 2,") };
} });`;
  const gate = pathToFileURL(fileURLToPath(new URL("../src/tools/gate.ts", import.meta.url))).href;
  const child = `const g = await import(${JSON.stringify(gate)});
const at = { schema_version: g.SCHEMA_VERSION, produced_at: "2026-09-04T00:00:00Z" };
const P = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "t", clockOpen: true };
const calls = [[{ ...at, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: ${JSON.stringify(USDE_STABLE_RUN_PREDICTOR_ID)} }, P],
  [{ ...at, task_class: "liquidation-eligible-coverage", yhat: 5000, predictor_id: "k" }, { ...P, alpha: 0.01, nMin: 100 }]];
const rows = g.SERVED_MARGINAL_TABLES.flatMap((t) => t.table.rows);
process.stdout.write(JSON.stringify(calls.map(([p, q]) => { const v = g.runGate(p, q).verdict; const r = rows.find((x) => x.cell_key === v.cell_key);
  return [v.qhat, r.qhat, String(v.alpha), r.alpha, v.n_calib, r.n]; })));`;
  const out = await new Promise<string>((resolve, reject) => {
    execFile(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(hook)}`, "--input-type=module", "-e", child], { encoding: "utf8", timeout: 60000 }, (e, stdout, stderr) => { if (e === null) resolve(stdout); else reject(new Error(stderr.slice(0, 400))); });
  });
  const got = JSON.parse(out) as [number, number, string, string, number, number][];
  const recomputed = [rowOf("stable-run-velocity-24h", USDE_STABLE_RUN_PREDICTOR_ID).qhat, rowOf("liquidation-eligible-coverage", `${UKEMI_LIQ_PREDICTOR_BASE}/s0`).qhat];
  got.forEach(([q, rq, a, ra, n, rn], i) => assert.deepEqual([q, a, n], [rq, ra, rn], `call ${String(i)}: the served values are the row's`));
  assert.deepEqual(got.map(([q]) => q), recomputed.map((q) => (q ?? Number.NaN) * 2), "the row of the child doubles the q-hat: the served one follows it");
});
