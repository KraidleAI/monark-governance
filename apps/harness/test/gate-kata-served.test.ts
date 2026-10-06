/**
 * Harness - the served kata path (block D, lot D-2; docs/G0-bloc-d.md section 4.2; ADR-CM B-9 precisee and B-15; plan r3
 * section 5.4; LATE-CALL-WINDOW-1, Q-D4; test seam, Q-D5). The 32 kata classes of wave 1 are served from their empty
 * tables: the request contract answers its 8 named 400s over HTTP and MCP, a well-formed call abstains with no region,
 * the class text is the served sentence, the description carries the kata clause, and the lateness bound is the 300 s of
 * B-4. New exports are read through the module namespace, so the base loads this file and reddens by assertion. Each test
 * names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sha256Canonical, type ClassEntry, type PolicyRow, type Prediction } from "@monark/contracts";
import * as gate from "../src/tools/gate.ts";
import { CASCADE_UNCALIBRATED_SENTENCE, GATE_TOOL_DESCRIPTION, honestyText, runGate, toolErrorCode, type HarnessParams } from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";
import { kataClassEntries } from "../src/policy-classes.ts";
import * as classes from "../src/policy-classes.ts";
import * as kataPathModule from "../src/kata-path.ts";
import type { ServedTable } from "../src/policy-served.ts";

type Obj = Record<string, unknown>;
const T = Date.parse("2026-10-04T04:00:00Z");
const DIR_KEY = "kata:vote4@venue/BTCUSDT/1h";
const BAND_KEY = "kata:vote4@venue/BTCUSDT/4h";
const P_DIR: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.45, nMin: 6, intent: "up", tool: "perps_order_preview", clockOpen: true };
const P_BAND: HarnessParams = { ...P_DIR, alpha: 0.01, nMin: 299, intent: 0.01 };
const pred = (over: Partial<Prediction> = {}): Prediction =>
  ({ schema_version: "1.1.0", task_class: "btc-dir-1h", yhat: 0.3, predictor_id: DIR_KEY, produced_at: "2026-10-04T04:00:00Z", features_digest: "ab".repeat(32), ...over });
const band = (over: Partial<Prediction> = {}): Prediction => pred({ task_class: "btc-range-4h", yhat: 0.02, predictor_id: BAND_KEY, ...over });
const bare = (p: Prediction): Prediction => {
  const q = { ...p };
  delete q.features_digest;
  return q;
};
const sha = (s: string): string => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
const SUFFIX = "; B_t is caller-carried.";

async function http(prediction: Prediction, params: HarnessParams, now = T + 1000): Promise<{ status: number; body: Obj }> {
  const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify({ prediction, params }) }), () => now);
  return { status: res.status, body: JSON.parse(await res.text()) as Obj };
}
async function mcp(prediction: Prediction, params: HarnessParams, now = T + 1000): Promise<Obj> {
  const res = await createHarnessHandler(() => now).fetch(new Request("http://mcp.monarkgate.tech/", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: { prediction, params } } }),
  }));
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  return (JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: Obj }).result ?? {};
}
/** "ok" or the code of the refusal of a direct call. */
function direct(p: Prediction, params: HarnessParams, options: gate.RunGateOptions = {}): string {
  try {
    runGate(p, params, undefined, options);
    return "ok";
  } catch (e) {
    return String(toolErrorCode(e) ?? e);
  }
}

// Test T-8 (F2P): the kata request contract is served (B-9 precisee, B-15): its 8 named 400s over HTTP (body with code)
// and MCP (code in _meta), on a direction class and a band class.
// killer: apps/harness/src/tools/gate.ts:985 CONST "} else if (kataTable !== undefined) {" -> "} else if (false) {"
test("served_kata_request_contract", async () => {
  const cases: [string, Prediction, HarnessParams, number][] = [
    ["kata_key_invalid", pred({ predictor_id: "kata:vote4@venue/ETHUSDT/1h" }), P_DIR, T + 1000],
    ["kata_yhat_domain", pred({ yhat: 1.5 }), P_DIR, T + 1000],
    ["features_digest_required", bare(pred()), P_DIR, T + 1000],
    ["policy_tau_cap", pred(), { ...P_DIR, tau: 1.5 }, T + 1000],
    ["policy_alpha_mismatch", band(), { ...P_BAND, alpha: 0.02 }, T + 1000],
    ["policy_nmin_mismatch", band(), { ...P_BAND, nMin: 300 }, T + 1000],
    ["produced_at_off_grid", band({ produced_at: "2026-10-04T05:00:00Z" }), P_BAND, T + 3_600_000 + 1000],
    ["produced_at_stale", pred(), P_DIR, T + 300_001],
  ];
  const messages: string[] = [];
  for (const [code, p, params, now] of cases) {
    const h = await http(p, params, now);
    assert.deepEqual([h.status, h.body["code"]], [400, code], `HTTP ${code}`);
    messages.push(`${code} ${String(h.body["message"])}`);
    const m = await mcp(p, params, now);
    assert.deepEqual([m["isError"], (m["_meta"] as Obj | undefined)?.["monarkgate.tech/error_code"], (m["content"] as { text: string }[] | undefined)?.[0]?.text], [true, code, h.body["message"]], `MCP ${code}`);
  }
  assert.equal(sha(messages.join("\n")), "0670875ec020ce2ec17a7848073e0195ad6d1d4b247988a638a685da6af44aea", "the 8 served messages, byte for byte (listed in docs/G7-lot-d-2.md)");
});

// Test T-9 (F2P): a well-formed kata call abstains with no region (spec section 2.2.1), direction and band; a dir lean of
// 0 answers non_evaluable; the served sentence is the class text plus the B_t suffix.
// killer: apps/harness/src/kata-path.ts:111 CONST "policy_table_sha256: f.policy_table_sha256" -> "policy_table_sha256: null"
test("served_kata_no_row_verdict_and_decision", async () => {
  const table = (c: string): string => {
    const all = (gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined;
    return all?.find((t) => t.task_class === c)?.policy_table_sha256 ?? "absent";
  };
  const cases: [Prediction, HarnessParams, Obj][] = [
    [pred(), P_DIR, { method: "risk-control", alpha: 0.45, qhat_unit: "score", scale: null, reason: "under_calib", cell_key: `${DIR_KEY}/up` }],
    [pred({ yhat: -0.3 }), P_DIR, { method: "risk-control", alpha: 0.45, qhat_unit: "score", scale: null, reason: "under_calib", cell_key: `${DIR_KEY}/down` }],
    [pred({ yhat: 0 }), P_DIR, { method: "risk-control", alpha: 0.45, qhat_unit: "score", scale: null, reason: "non_evaluable", cell_key: DIR_KEY }],
    [band(), P_BAND, { method: "risk-control", alpha: 0.01, qhat_unit: "scale", scale: 0.02, reason: "under_calib", cell_key: `${BAND_KEY}/b0` }],
  ];
  for (const [p, params, want] of cases) {
    const h = await http(p, params);
    assert.equal(h.status, 200, `${p.task_class} ${String(p.yhat)}: 200`);
    const d = h.body["structuredContent"] as Obj;
    assert.deepEqual([d["action"], d["reason"]], ["abstain", want["reason"]], "the decision abstains with the verdict's reason");
    assert.deepEqual(d["verdict"], {
      schema_version: "1.1.0", task_class: p.task_class, method: want["method"], alpha: want["alpha"], n_calib: 0, region: null, qhat: null, qhat_unit: want["qhat_unit"],
      scale: want["scale"], abstain: true, reason: want["reason"], residual: [], scores_sha256: sha("[]"), cell_key: want["cell_key"], policy_row_sha256: null,
      policy_table_sha256: table(p.task_class), produced_at: p.produced_at,
    }, `${p.task_class} ${String(p.yhat)}: the verdict field by field`);
    const m = await mcp(p, params);
    const text = (m["content"] as { text: string }[] | undefined)?.[0]?.text ?? "";
    assert.ok(text.startsWith(`no ${p.task_class} calibration is committed for this cell_key; the gate abstains and serves no region${SUFFIX} verdict action=abstain`), text);
  }
});

// Test T-10 (F2P, LATE-CALL-WINDOW-1): the lateness bound is the 300 s of B-4, served with the injected clock over HTTP and
// MCP; the future check of B-4 answers first; a direct call without a clock runs the grid only.
// killer: apps/harness/src/tools/gate.ts:988 CONST "kataPath(prediction, params, kataTable, options.nowMs)" -> "kataPath(prediction, params, kataTable)"
test("served_kata_late_call_window", async () => {
  const at = (now: number): Promise<{ status: number; body: Obj }> => http(pred(), P_DIR, now);
  assert.equal((await at(T + 300_000)).status, 200, "300 s after t: admitted");
  assert.deepEqual([(await at(T + 300_001)).body["code"]], ["produced_at_stale"], "300 s and 1 ms after t: stale");
  assert.deepEqual([(await at(T - 300_001)).body["code"]], ["produced_at_future"], "the future check of B-4 first");
  assert.equal((await mcp(pred(), P_DIR, T + 300_000))["isError"], undefined, "MCP: 300 s admitted");
  assert.equal(((await mcp(pred(), P_DIR, T + 300_001))["_meta"] as Obj | undefined)?.["monarkgate.tech/error_code"], "produced_at_stale", "MCP: stale");
  assert.equal(direct(pred(), P_DIR), "ok", "a direct call without a clock: no lateness check");
  assert.equal(direct(pred({ produced_at: "2026-10-04T04:00:01Z" }), P_DIR), "produced_at_off_grid", "a direct call keeps the grid");
});

// Test T-11 (pin): the guards before the dispatch keep their codes on a kata class: a calibration on a kata name is
// reserved (B-1), an `attested` is inconsistent (no kata subject), a 1.0.0 prediction is refused. Green at the base
// (declared; killer fired by hand).
// killer: apps/harness/src/tools/gate.ts:935 CONST "if (lookAlike !== undefined) {" -> "if (false) {"
test("served_kata_order_against_byo_attested_version", () => {
  const cal = { ...P_DIR, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], mode: "interval" as const } };
  assert.equal(direct(pred(), cal), "byo_reserved_kata");
  let code = "ok";
  try {
    runGate(pred(), P_DIR, { schema_version: "1.0.0", subject: "x", attestor: "a", residual: [], transport: "t", price: 1, observed_at: "2026-10-04T04:00:00Z" } as never);
  } catch (e) {
    code = String(toolErrorCode(e) ?? e);
  }
  assert.equal(code, "attested_inconsistent");
  assert.equal(direct(pred({ schema_version: "1.0.0" }), P_DIR), "schema_version_unsupported");
});

const CLAUSE =
  "The 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` are served from their policy tables, which hold no committed " +
  "calibration row: every well-formed kata call abstains with no region (under_calib, or non_evaluable on a dir lean of exactly 0), and no kata " +
  "class has an attestation subject. A kata call carries a `predictor_id` of the form `kata:<kataId>@<venue>/<SYMBOL>/<h>` (no bucket, <h> the " +
  "class horizon), a `features_digest`, alpha = 0.45, nMin = 6 on dir classes and alpha = 0.01, nMin = 299 on the others, tau at most 1 on dir " +
  "classes, and a `produced_at` on the class horizon grid, received at most 300 s after it; the full request rules are in section 9 of the " +
  "contract 1.1.0 specification.";

// Test T-12 (F2P): the kata clause, rendered from the class entries and the B-4 constant, is MONARK's text byte for byte
// (Z-3 line of block D), placed after the liq clause and before the BYO sentence; no kata class takes the `For '...'` form.
// killer: apps/harness/src/tools/gate.ts:237 CONST "PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000" -> "PRODUCED_AT_FUTURE_TOLERANCE_MS / 100"
test("describe_gate_kata_clause", () => {
  const render = (gate as Obj)["kataClause"];
  assert.ok(typeof render === "function", "gate.ts renders the kata clause");
  const clause = (render as () => string)();
  assert.equal(clause, CLAUSE, "the rendered clause");
  assert.deepEqual([Buffer.byteLength(clause, "utf8"), sha(clause)], [723, "022756c39c3f3aa381a39f313ebb92236d237d75e770febe3822de047898e803"]);
  const at = GATE_TOOL_DESCRIPTION.indexOf(`. ${CLAUSE} When the caller instead supplies a \`calibration\``);
  assert.ok(at > GATE_TOOL_DESCRIPTION.indexOf("For 'liquidation-eligible-coverage'"), "after the liq clause, before the BYO sentence");
  assert.deepEqual([...GATE_TOOL_DESCRIPTION.matchAll(/For '([a-z0-9-]+)'/g)].map((m) => m[1]), ["cascade-liquidable-24h", "stable-run-velocity-24h", "liquidation-eligible-coverage"]);
  const entries = kataClassEntries(() => "");
  for (const [rule, alpha, nMin] of [["sign-set", "0.45", 6], ["scaled-band", "0.01", 299]] as const) {
    assert.deepEqual([...new Set(entries.filter((e) => e.region_rule === rule).map((e) => `${e.alpha ?? ""} ${String(e.n_min)}`))], [`${alpha} ${String(nMin)}`], rule);
  }
});

// Test T-13 (F2P): honestyText reads the kata tables: each of the 32 classes serves its class text plus the suffix, never
// the cascade sentence; the table text is the exact prefix of the served sentence (Z-3).
// killer: apps/harness/src/tools/gate.ts:738 CONST "tables: readonly ServedTable[] = SERVED_POLICY_TABLES" -> "tables: readonly ServedTable[] = SERVED_MARGINAL_TABLES"
test("kata_class_text_is_table_text_plus_suffix", () => {
  const names = kataClassEntries(() => "").map((e) => e.task_class);
  assert.equal(names.length, 32);
  const all = ((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? [];
  for (const c of names) {
    const served = honestyText(c, `${DIR_KEY}/up`, false);
    assert.notEqual(served, `${CASCADE_UNCALIBRATED_SENTENCE}${SUFFIX}`, `${c}: never the cascade sentence`);
    assert.equal(served, `no ${c} calibration is committed for this cell_key; the gate abstains and serves no region${SUFFIX}`, c);
    assert.equal(`${all.find((t) => t.task_class === c)?.table.class.text ?? "absent"}${SUFFIX}`, served, `${c}: table text + suffix`);
  }
});

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

// Test (F2P, Q-D5): the test seam RunGateOptions.policyTables reaches a kata row (a region row on btc-dir-1h commits),
// and no served module but tools/gate.ts names it, so the HTTP and MCP entry points never pass it.
// killer: apps/harness/src/tools/gate.ts:959 CONST "(options.policyTables ?? SERVED_POLICY_TABLES)" -> "(SERVED_POLICY_TABLES)"
test("entry_points_never_pass_policy_tables", () => {
  const all = ((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? [];
  const base = all.find((t) => t.task_class === "btc-dir-1h");
  assert.ok(base !== undefined, "the btc-dir-1h table is served");
  const row = { current: true, cell_key: `${DIR_KEY}/up-b1`, thresholds: { t1: "0.5", t2: "0.8" }, status: "region", statement: "per-calibration", alpha: "0.45", n: 20, scores_sha256: "cd".repeat(32), side: "up" } as unknown as PolicyRow;
  const seam: ServedTable[] = [{ ...base, table: { ...base.table, rows: [row] } }];
  let decision: Obj = {};
  try {
    decision = runGate(pred(), P_DIR, undefined, { nowMs: T + 1000, policyTables: seam }) as unknown as Obj;
  } catch (e) {
    decision = { error: String(toolErrorCode(e) ?? e) };
  }
  const v = (decision["verdict"] ?? {}) as Obj;
  assert.deepEqual([decision["action"], v["reason"], v["cell_key"], v["n_calib"], v["policy_row_sha256"]], ["commit", "covered", `${DIR_KEY}/up-b1`, 20, sha256Canonical(row)], "the seam reaches the row");
  const seen = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*\(?\s*"(\.{1,2}\/[^"]+)"/g)) walk(join(dirname(file), m[1] as string));
  };
  for (const f of ["server.ts", "http.ts", "openapi.ts", "schema-projection.ts", ...readdirSync(join(SRC, "tools")).map((t) => `tools/${t}`)]) walk(join(SRC, f));
  const naming = [...seen].filter((f) => readFileSync(f, "utf8").includes("policyTables")).map((f) => f.slice(SRC.length + 1).replace(/\\/g, "/"));
  assert.deepEqual(naming, ["tools/gate.ts"], "only tools/gate.ts names the seam");
});

/** A served kata table with one current row on DIR_KEY/up-b1 (the cell of pred(), lean 0.3), through the test seam. */
function withRow(status: string): ServedTable[] {
  const base = (((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? []).find((t) => t.task_class === "btc-dir-1h") ?? assert.fail("btc-dir-1h is served");
  const row = { current: true, cell_key: `${DIR_KEY}/up-b1`, thresholds: { t1: "0.5", t2: "0.8" }, status, statement: "per-calibration", alpha: "0.45", n: 20, scores_sha256: "cd".repeat(32), side: "up", text: `row text of ${status}` } as unknown as PolicyRow;
  return [{ ...base, table: { ...base.table, rows: [row] } }];
}

// Test T-16 (block D, lot D-3; C-4 condition 3, the end-to-end form): through the seam, a calib_* row of a dir class (silence,
// vetoed, retired) abstains with its reason, never defer set_too_large (tau 1, clock open, intent in {up, down}); a region
// row commits at tau 1 and defers set_too_large at tau 0. The honesty text read on the seam's tables is the row text (G2 N-2
// of D-2): honestyText reads the tables it is given, the served ones by default.
// killer: packages/hikae/src/l3-gate.ts:93 CONST "REASONS_WITHOUT_REGION.includes(input.verdict.reason)" -> "false"
test("served_calib_row_abstains_never_defers", () => {
  const decide = (status: string, tau: number): unknown[] => {
    const d = runGate(pred(), { ...P_DIR, tau }, undefined, { nowMs: T + 1000, policyTables: withRow(status) });
    return [d.action, d.reason, d.verdict.reason, d.verdict.n_calib, d.verdict.cell_key];
  };
  for (const s of ["silence", "vetoed", "retired"]) assert.deepEqual(decide(s, 1), ["abstain", `calib_${s}`, `calib_${s}`, 20, `${DIR_KEY}/up-b1`], `${s}: abstains, never defers`);
  assert.deepEqual(decide("region", 1), ["commit", "covered", "covered", 20, `${DIR_KEY}/up-b1`]);
  assert.deepEqual(decide("region", 0), ["defer", "set_too_large", "set_too_large", 20, `${DIR_KEY}/up-b1`]);
  const text: (c: string, k: string, byo: boolean, tables?: readonly ServedTable[]) => string = honestyText;
  assert.equal(text("btc-dir-1h", `${DIR_KEY}/up-b1`, false, withRow("silence")), `row text of silence${SUFFIX}`, "the seam's row text");
  assert.equal(text("btc-dir-1h", `${DIR_KEY}/up-b1`, false), `no btc-dir-1h calibration is committed for this cell_key; the gate abstains and serves no region${SUFFIX}`, "served: the class text");
});

// Test (block D, lot D-3; G2 N-6 of D-2): the tripwire of KATA-CLAUSE-COMMITTED-STATE-1. The kata clause describes kata tables
// with no row, so the served table build fails on a kata table that holds a row; the served tables pass, unchanged, and so
// does a marginal table with rows (USDe).
// killer: apps/harness/src/kata-path.ts:126 CONST "t.table.rows.length > 0" -> "false"
test("kata_tables_hold_no_row_tripwire", () => {
  const trip = (kataPathModule as Obj)["kataTablesHoldNoRow"];
  assert.ok(typeof trip === "function", "kata-path.ts exports the tripwire");
  const check = trip as (t: readonly ServedTable[]) => readonly ServedTable[];
  const all = ((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? [];
  assert.equal(check(all), all, "the served tables pass, unchanged");
  assert.ok(all.some((t) => t.table.class.cell_key_rule !== "kata-bucket" && t.table.rows.length > 0), "a marginal table with rows passes");
  assert.throws(() => check([...all.filter((t) => t.task_class !== "btc-dir-1h"), ...withRow("region")]), /KATA-CLAUSE-COMMITTED-STATE-1.*'btc-dir-1h'/);
  assert.ok(readFileSync(join(SRC, "tools/gate.ts"), "utf8").includes("= kataTablesHoldNoRow(servedPolicyTables(SERVED_TABLE_TEXTS));"), "the served build passes the tripwire");
});

// Test (block D, lot D-3; G2 N-5 of D-2): the kata clause reads every value it states: the class names from the entries (a
// product, checked), alpha and nMin per family, the tau cap of dir classes (KATA_DIR_TAU_CAP, also read by the policy_tau_cap
// refusal) and the 300 s of B-4. Rendered on other entries and another cap, it names them; by default it is the served clause.
// killer: apps/harness/src/tools/gate.ts:232 CONST "${names.join(\"-\")}" -> "{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}"
test("kata_clause_reads_its_names_and_tau_cap", () => {
  const render = (gate as Obj)["kataClause"] as (entries?: readonly ClassEntry[], tauCap?: number) => string;
  const some = kataClassEntries(() => "").filter((e) => /^(btc|eth)-.*-1h$/.test(e.task_class));
  const clause = render(some, 0.5);
  assert.ok(clause.startsWith("The 8 kata classes `{btc,eth}-{dir,range,mae-down,mae-up}-{1h}` are served"), clause.slice(0, 100));
  assert.ok(clause.includes(", tau at most 0.5 on dir classes, "), "the cap is read");
  assert.throws(() => render(some.slice(1)), /not the product/, "a set of classes that is not a product is refused");
  assert.equal(render(), CLAUSE, "by default, the served clause");
  assert.equal((classes as Obj)["KATA_DIR_TAU_CAP"], 1, "the cap of dir classes");
});

// G2 N-2 of D-3: the product check of the kata clause compares sets, not counts: a duplicate class in place of another (32
// entries, eth-dir-1h twice, no btc-dir-1h) is refused, never rendered as the full product.
// killer: apps/harness/src/tools/gate.ts:230 CONST "new Set(entries.map((e) => e.task_class)).size !== entries.length || " -> ""
test("kata_clause_refuses_duplicate_classes", () => {
  const render = (gate as Obj)["kataClause"] as (entries?: readonly ClassEntry[]) => string;
  const all = kataClassEntries(() => "");
  const twin = all.find((e) => e.task_class === "eth-dir-1h") ?? assert.fail("eth-dir-1h");
  assert.throws(() => render(all.map((e) => (e.task_class === "btc-dir-1h" ? twin : e))), /not the product/);
});

// Test (block D, lot D-3; G2 N-3 of D-2): the cycle gate.ts <-> kata-path.ts loads cold from either side. Each module is
// imported first in a fresh child process: kata-path.ts (the risky side: gate.ts then runs first and calls servedPolicyTables
// while it loads), then server.ts; both load and serve the 35 tables. This file loads gate.ts first, so its own load holds
// under the killer. Green at the base of D-3 (declared; killer fired by hand).
// killer: apps/harness/src/kata-path.ts:118 CONST "kataClassEntries(texts.classText)" -> "kataClassEntries(TIME_FIELDS.global ? texts.classText : texts.classText)"
test("kata_path_and_server_load_cold", async () => {
  const url = (f: string): string => JSON.stringify(pathToFileURL(join(SRC, f)).href);
  for (const first of ["kata-path.ts", "server.ts"]) {
    const script = `await import(${url(first)}); const g = await import(${url("tools/gate.ts")}); process.stdout.write(String(g.SERVED_POLICY_TABLES.length));`;
    const got = await new Promise<{ ok: boolean; out: string }>((resolve) => {
      execFile(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8", timeout: 60000 }, (e, stdout, stderr) => { resolve({ ok: e === null, out: e === null ? stdout : stderr.slice(0, 400) }); });
    });
    assert.deepEqual(got, { ok: true, out: "35" }, `${first} loads first`);
  }
});
