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
import { canonicalJson, sha256Canonical, type ClassEntry, type PolicyRow, type PolicyTable, type Prediction } from "@monark/contracts";
import * as gate from "../src/tools/gate.ts";
import { CASCADE_UNCALIBRATED_SENTENCE, GATE_TOOL_DESCRIPTION, honestyText, runGate, toolErrorCode, type HarnessParams } from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";
import { importSpecifiers } from "./helpers/import-specifiers.ts";
import { kataClassEntries } from "../src/policy-classes.ts";
import * as classes from "../src/policy-classes.ts";
import * as kataPathModule from "../src/kata-path.ts";
import type { ServedTable } from "../src/policy-served.ts";
import { readCommittedTables } from "../src/policy-committed.ts";
import * as PINS from "../src/policy-committed-pins.ts";
import { guardKataTable } from "../src/policy-guard.ts";
import { projectCell, readRegistry, type ProjectionInputs } from "../src/policy-projection.ts";
import { buildPolicyTable, policyTableSha256 } from "../src/policy-table-file.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

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
const SYN = syntheticRegistry();
const INP: ProjectionInputs = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator",
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
/** The rows of a class projected from the synthetic registry (closed rows, as the writer projects them). */
const rowsOf = (c: string): PolicyRow[] => readRegistry(SYN.bytes).filter((x) => x.taskClass === c).map((x) => projectCell(x, INP)).filter((r) => r !== null);

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
/** kataClause: the class entries, the tau cap, the pinned classes and the held classes, each defaulting to its served value. */
type Render = (entries?: readonly ClassEntry[], tauCap?: number, committed?: readonly string[], held?: readonly string[]) => string;

// Test T-12 (F2P): the kata clause, rendered from the class entries, the B-4 constant and the pins, is MONARK's text byte for byte
// (Z-3 lines): with no class pinned, the clause of block D; with the pins of the release of the bands (the 8 dir classes held, the 24
// others pinned), the committed state. The clause at the served pins is placed after the liq clause and before the BYO sentence; no
// kata class takes the `For '...'` form.
// killer: apps/harness/src/tools/gate.ts:237 CONST "PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000" -> "PRODUCED_AT_FUTURE_TOLERANCE_MS / 100"
test("describe_gate_kata_clause", () => {
  const render = (gate as Obj)["kataClause"];
  assert.ok(typeof render === "function", "gate.ts renders the kata clause");
  const clause = (render as Render)(undefined, undefined, []);
  assert.equal(clause, CLAUSE, "the rendered clause, no class pinned");
  assert.deepEqual([Buffer.byteLength(clause, "utf8"), sha(clause)], [723, "022756c39c3f3aa381a39f313ebb92236d237d75e770febe3822de047898e803"]);
  const entries = kataClassEntries(() => ""), dir = entries.filter((e) => e.region_rule === "sign-set").map((e) => e.task_class);
  const bands = (render as Render)(undefined, undefined, entries.map((e) => e.task_class).filter((c) => !dir.includes(c)), dir);
  assert.deepEqual([Buffer.byteLength(bands, "utf8"), sha(bands)], [1465, "db7735357a898ccaba50a433a9451de713b127f7a92eb2adb1cdfe134181454d"], "the committed state, release of the bands");
  const at = GATE_TOOL_DESCRIPTION.indexOf(`. ${(render as Render)()} When the caller instead supplies a \`calibration\``);
  assert.ok(at > GATE_TOOL_DESCRIPTION.indexOf("For 'liquidation-eligible-coverage'"), "after the liq clause, before the BYO sentence");
  assert.deepEqual([...GATE_TOOL_DESCRIPTION.matchAll(/For '([a-z0-9-]+)'/g)].map((m) => m[1]), ["cascade-liquidable-24h", "stable-run-velocity-24h", "liquidation-eligible-coverage"]);
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
    for (const s of importSpecifiers(readFileSync(file, "utf8"))) if (/^\.{1,2}\//.test(s)) walk(join(dirname(file), s));
  };
  for (const f of ["server.ts", "http.ts", "openapi.ts", "schema-projection.ts", ...readdirSync(join(SRC, "tools")).map((t) => `tools/${t}`)]) walk(join(SRC, f));
  const naming = [...seen].filter((f) => readFileSync(f, "utf8").includes("policyTables")).map((f) => f.slice(SRC.length + 1).replace(/\\/g, "/"));
  assert.deepEqual(naming, ["tools/gate.ts"], "only tools/gate.ts names the seam");
});

/** A served kata table with one current row on DIR_KEY/up-b1 (the cell of pred(), lean 0.3), through the test seam: a closed
 *  row (a projected synthetic row, rekeyed), its table built by buildPolicyTable, and its policy_table_sha256 read from it. */
function withRow(status: string): ServedTable[] {
  const base = (((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? []).find((t) => t.task_class === "btc-dir-1h") ?? assert.fail("btc-dir-1h is served");
  const syn = rowsOf("btc-dir-1h").find((r) => r.bucket === "up-b1") ?? assert.fail("a synthetic btc-dir-1h up-b1 row");
  const row: PolicyRow = {
    ...syn, cell_key: `${DIR_KEY}/up-b1`, kata_id: "vote4", venue: "venue", thresholds: { t1: "0.5", t2: "0.8" }, status, statement: "per-calibration", alpha: "0.45", n: 20,
    scores_sha256: "cd".repeat(32), text: `row text of ${status}`, ...(status === "region" ? {} : { miss_bound: null, bound_on: null }),
    retire: status === "retired" ? { cause: "test", k_test: null, n_test: null, u_test: null } : null,
  } as PolicyRow;
  const table = buildPolicyTable(base.table.class, [row]);
  return [{ task_class: "btc-dir-1h", table, policy_table_sha256: policyTableSha256(table) }];
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

// Test (E-2a; block D, lot D-3, G2 N-6 of D-2): the tripwire of KATA-CLAUSE-COMMITTED-STATE-1 follows the pins. The kata tables
// that hold rows are exactly the pinned classes, each at its pinned sha256, and no held class holds a row: the served tables pass
// with the served pins (none, the bands, then the directions), a marginal table with rows passes, and a kata row outside the pins, a
// pinned class with no row or another sha256, or a held class with a row (even pinned), fails the load. Line 1042 and its imports are pinned.
// killer: apps/harness/src/kata-path.ts:125 CONST "held.some((c) => rows(c) > 0)" -> "false"
test("kata_tables_match_the_pins", () => {
  const trip = (kataPathModule as Obj)["kataTablesMatchPins"];
  assert.ok(typeof trip === "function", "kata-path.ts exports the tripwire");
  const check = trip as (t: readonly ServedTable[], committed: Readonly<Record<string, string>>, held: readonly string[]) => readonly ServedTable[];
  const all = ((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? [];
  const HELD = [...PINS.FLOOR_HELD_CLASSES, ...PINS.ORDER_HELD_CLASSES];
  assert.deepEqual(all.filter((t) => t.table.class.cell_key_rule === "kata-bucket" && t.table.rows.length > 0).map((t) => t.task_class), Object.keys(PINS.COMMITTED_TABLES).sort(), "the kata tables with rows are exactly the keys of COMMITTED_TABLES");
  assert.equal(check(all, PINS.COMMITTED_TABLES, HELD), all, "the served tables pass, unchanged");
  assert.ok(all.some((t) => t.table.class.cell_key_rule !== "kata-bucket" && t.table.rows.length > 0), "a marginal table with rows passes");
  const seam = [...all.filter((t) => t.task_class !== "btc-dir-1h"), ...withRow("region")];
  const pin = { ...PINS.COMMITTED_TABLES, "btc-dir-1h": withRow("region")[0]?.policy_table_sha256 ?? "" };
  assert.equal(check(seam, pin, ["eth-dir-4h"]), seam, "a pinned class at its sha256 passes");
  assert.throws(() => check(seam, PINS.COMMITTED_TABLES, []), /KATA-CLAUSE-COMMITTED-STATE-1: the kata tables with rows are not the pinned tables: btc-dir-1h$/, "a row outside the pins");
  assert.throws(() => check(seam, { ...pin, "btc-dir-1h": withRow("silence")[0]?.policy_table_sha256 ?? "" }, []), /not the pinned tables: btc-dir-1h$/, "another sha256");
  const empty = all.find((t) => t.task_class === "eth-dir-4h") ?? assert.fail("eth-dir-4h is served");
  assert.throws(() => check(seam, { ...pin, "eth-dir-4h": empty.policy_table_sha256 }, []), /not the pinned tables: eth-dir-4h$/, "a pinned class with no row, even at its sha256");
  assert.throws(() => check(seam, { ...pin, "btc-dir-2h": "ab".repeat(32) }, []), /not the pinned tables: btc-dir-2h$/, "a pin that is no served kata class");
  assert.throws(() => check(seam, pin, ["btc-dir-1h"]), /KATA-CLAUSE-COMMITTED-STATE-1: a held class holds rows: btc-dir-1h$/, "a held class with a row, though pinned");
  const d = runGate(pred(), P_DIR, undefined, { nowMs: T + 1000, policyTables: check(seam, pin, []) });
  const row = withRow("region")[0]?.table.rows[0] ?? assert.fail("the pinned row");
  assert.deepEqual([d.verdict.policy_table_sha256, d.verdict.policy_row_sha256], [pin["btc-dir-1h"], sha256Canonical(row)], "the verdict carries the pinned table and its row");
  const HELD_TEXT = "[...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES]", line1042 = readFileSync(join(SRC, "tools/gate.ts"), "utf8").split("\n")[1041];
  assert.equal(line1042, `export const SERVED_POLICY_TABLES = kataTablesMatchPins(servedPolicyTables(SERVED_TABLE_TEXTS, readCommittedTables(COMMITTED_FILES, kataClassEntries(kataClassText), { tables: COMMITTED_TABLES, held: ${HELD_TEXT} })), COMMITTED_TABLES, ${HELD_TEXT});`, "line 1042: the served build reads the committed tables against the pins and both held lists, then passes the tripwire");
  assert.deepEqual(readFileSync(join(SRC, "tools/gate.ts"), "utf8").split("\n").slice(1073, 1075), [`import { COMMITTED_FILES, readCommittedTables } from "../policy-committed.ts";`, `import { COMMITTED_TABLES, FLOOR_HELD_CLASSES, ORDER_HELD_CLASSES } from "../policy-committed-pins.ts";`], "lines 1074-1075: each name that line 1042 reads is imported as itself");
});

// Test (E-2a; the invariant "no kata row is served before the release of the bands"): while no table is pinned
// (COMMITTED_TABLES empty, until that release), the tripwire refuses every kata table that holds a row, whatever its class or
// rule and whether or not it is held, so the served kata tables are all empty.
// killer: apps/harness/src/kata-path.ts:127 CONST "off.length > 0" -> "false"
test("no_kata_row_is_served_while_no_table_is_pinned", () => {
  const trip = (kataPathModule as Obj)["kataTablesMatchPins"];
  assert.ok(typeof trip === "function", "kata-path.ts exports the tripwire on the pins");
  const check = trip as (t: readonly ServedTable[], committed: Readonly<Record<string, string>>, held: readonly string[]) => readonly ServedTable[];
  assert.deepEqual(PINS.COMMITTED_TABLES, {}, "no table is pinned");
  const all = ((gate as Obj)["SERVED_POLICY_TABLES"] as readonly ServedTable[] | undefined) ?? [];
  const kata = all.filter((t) => t.table.class.cell_key_rule === "kata-bucket");
  assert.deepEqual([kata.length, kata.filter((t) => t.table.rows.length > 0).length], [32, 0], "the 32 served kata tables are empty");
  for (const c of ["btc-range-1h", "btc-mae-down-1h"]) {
    const e = kata.find((t) => t.task_class === c) ?? assert.fail(c);
    const table = buildPolicyTable(e.table.class, rowsOf(c));
    const one: ServedTable = { task_class: c, table, policy_table_sha256: policyTableSha256(table) };
    assert.throws(() => check([...all.filter((t) => t.task_class !== c), one], PINS.COMMITTED_TABLES, []), new RegExp(`not the pinned tables: ${c}$`), `${c}: a band row, no pin`);
  }
  assert.throws(() => check([...all.filter((t) => t.task_class !== "btc-dir-1h"), ...withRow("region")], PINS.COMMITTED_TABLES, []), /not the pinned tables: btc-dir-1h$/, "a direction row, not held, no pin");
});

// Test T-4 (E-2a): committed tables reach the gate through the seam. Two synthetic band tables (btc-range-1h, btc-mae-down-1h),
// projected, admitted by the import guard, written canonically and pinned beside the real held lists, are read by
// readCommittedTables and served by servedPolicyTables: a silence cell abstains calib_silence with no region, a region cell
// commits with its band, each verdict carries its row and the sha256 of its file, and the honesty text is the row text.
// killer: apps/harness/src/kata-path.ts:118 CONST "committed.get(c.task_class) ?? buildPolicyTable(c, [])" -> "buildPolicyTable(c, [])"
test("committed_tables_reach_the_gate_through_the_seam", () => {
  const entries = kataClassEntries(gate.kataClassText);
  const files = new Map(["btc-range-1h", "btc-mae-down-1h"].map((c) => {
    const e = entries.find((x) => x.task_class === c) ?? assert.fail(c);
    const t = buildPolicyTable(e, rowsOf(c));
    guardKataTable(t, SYN.bytes, { ...INP, verifiers: ["verifier-b", "synthetic-generator"] }, e);
    return [c, new TextEncoder().encode(canonicalJson(t))] as const;
  }));
  const pins = { tables: Object.fromEntries([...files].map(([c, b]) => [c, createHash("sha256").update(b).digest("hex")])), held: [...PINS.FLOOR_HELD_CLASSES, ...PINS.ORDER_HELD_CLASSES] };
  const serve: (texts: typeof gate.SERVED_TABLE_TEXTS, committed: ReadonlyMap<string, PolicyTable>) => readonly ServedTable[] = kataPathModule.servedPolicyTables;
  const match = (kataPathModule as Obj)["kataTablesMatchPins"];
  assert.ok(typeof match === "function", "kata-path.ts exports the tripwire on the pins");
  const tables = (match as (t: readonly ServedTable[], c: Readonly<Record<string, string>>, h: readonly string[]) => readonly ServedTable[])(serve(gate.SERVED_TABLE_TEXTS, readCommittedTables(files, entries, pins)), pins.tables, pins.held);
  const decide = (c: string, key: string): unknown[] => {
    const row = rowsOf(c).find((r) => r.cell_key === `${key}/b0`) ?? assert.fail(key);
    const d = runGate(band({ task_class: c, predictor_id: key, produced_at: "2026-10-04T04:00:00Z", yhat: 0.01 }), P_BAND, undefined, { nowMs: T + 1000, policyTables: tables });
    return [d.action, d.verdict.reason, d.verdict.region?.kind ?? null, d.verdict.qhat, d.verdict.policy_row_sha256 === sha256Canonical(row), d.verdict.policy_table_sha256 === pins.tables[c]];
  };
  const RANGE = "kata:realized-vol-hw-v1@binance/BTCUSDT/1h", MAE = "kata:parkinson-hw-v1@binance/BTCUSDT/1h";
  assert.deepEqual(decide("btc-range-1h", RANGE), ["abstain", "calib_silence", null, null, true, true]);
  const region = rowsOf("btc-mae-down-1h").find((r) => r.status === "region") ?? assert.fail("a region row");
  assert.deepEqual(decide("btc-mae-down-1h", MAE), ["commit", "covered", "interval", region.qhat, true, true]);
  const text: (c: string, k: string, byo: boolean, tables?: readonly ServedTable[]) => string = honestyText;
  assert.equal(text("btc-mae-down-1h", `${MAE}/b0`, false, tables), `${region.text}${SUFFIX}`, "the row text, from the committed file");
});

// Test (block D, lot D-3; G2 N-5 of D-2): the kata clause reads every value it states: the class names from the entries (a
// product, checked), alpha and nMin per family, the tau cap of dir classes (KATA_DIR_TAU_CAP, also read by the policy_tau_cap
// refusal) and the 300 s of B-4. Rendered on other entries and another cap, it names them; with no class pinned, by default, it is CLAUSE.
// killer: apps/harness/src/tools/gate.ts:232 CONST "${names.join(\"-\")}" -> "{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}"
test("kata_clause_reads_its_names_and_tau_cap", () => {
  const render = (gate as Obj)["kataClause"] as Render;
  const some = kataClassEntries(() => "").filter((e) => /^(btc|eth)-.*-1h$/.test(e.task_class));
  const clause = render(some, 0.5, []);
  assert.ok(clause.startsWith("The 8 kata classes `{btc,eth}-{dir,range,mae-down,mae-up}-{1h}` are served"), clause.slice(0, 100));
  assert.ok(clause.includes(", tau at most 0.5 on dir classes, "), "the cap is read");
  assert.throws(() => render(some.slice(1)), /not the product/, "a set of classes that is not a product is refused");
  assert.equal(render(undefined, undefined, []), CLAUSE, "with no class pinned, by default, the clause of block D");
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

// Test T-2a (E-2a, in process): the kata clause follows the pins. Given pinned and held classes that partition the 32 kata classes,
// at least 2 of each, it renders the committed state: it counts both sides, names exactly the held classes, in entry order whatever
// the order of the held list, and takes no `For '...'` form. Out of that domain it throws, after the product check, one message per
// case, checked in this order: a name that is no kata class, a class both pinned and held, a class neither, fewer than 2 held classes,
// fewer than 2 pinned. Two conditions broken at once throw the first, with the whole message to its suffix: one case per adjacent pair
// of that order, so every order is held. The defaults of line 222 and the call of line 254 are pinned byte for byte.
// killer: apps/harness/src/tools/gate.ts:239 CONST "committed.length === 0" -> "true"
test("kata_clause_follows_the_committed_pins", () => {
  const render = (gate as Obj)["kataClause"] as Render;
  const all = kataClassEntries(() => "").map((e) => e.task_class), rest = (held: readonly string[]): string[] => all.filter((c) => !held.includes(c));
  for (const held of [["sol-mae-up-4h", "btc-dir-1h"], [...PINS.FLOOR_HELD_CLASSES, ...PINS.ORDER_HELD_CLASSES], rest(["btc-range-1h", "eth-mae-up-1h"])]) {
    const clause = render(undefined, undefined, rest(held), held), named = all.filter((c) => held.includes(c)).map((c) => `\`${c}\``).join(", ");
    assert.ok(clause.includes(`; no kata class has an attestation subject. Of the 32, ${String(held.length)} hold no committed calibration row (${named}): every well-formed kata call on them abstains with no region`), clause.slice(0, 400));
    assert.ok(clause.includes(`. The other ${String(32 - held.length)} hold committed calibration rows: each of their tables is published byte for byte`), "the pinned classes are counted");
    assert.deepEqual([clause.match(/`[a-z]+-[a-z-]+-[14]h`/g)?.length, /For '/.test(clause)], [held.length, false], "no other class is named; no `For '...'` form");
    assert.equal(render(undefined, undefined, [...rest(held), ...rest(held).slice(0, 1)], [...held].reverse().concat(held.slice(0, 1))), clause, "both lists are read as sets: order and repeats do not matter");
  }
  const some = kataClassEntries(() => "").filter((e) => /^(btc|eth)-.*-1h$/.test(e.task_class));
  assert.ok(render(some, undefined, ["btc-range-1h", "btc-mae-down-1h", "btc-mae-up-1h", "eth-range-1h", "eth-mae-down-1h", "eth-mae-up-1h"], ["eth-dir-1h", "btc-dir-1h"]).startsWith("The 8 kata classes `{btc,eth}-{dir,range,mae-down,mae-up}-{1h}` are served from their policy tables; no kata class has an attestation subject. Of the 8, 2 hold no committed calibration row (`btc-dir-1h`, `eth-dir-1h`): "), "on other entries, the committed state counts and names them");
  const dir = all.filter((c) => c.includes("-dir-")), bands = rest(dir);
  const refused = (committed: readonly string[], held: readonly string[], why: RegExp, what: string): void => assert.throws(() => render(undefined, undefined, committed, held), why, what);
  refused(bands.slice(1), dir, /kata clause: neither pinned nor held: btc-range-1h; /, "a class neither pinned nor held");
  refused([...bands, "btc-dir-1h"], dir, /kata clause: both pinned and held: btc-dir-1h; /, "a class both pinned and held");
  refused([...bands, "btc-dir-15m"], dir, /kata clause: not a kata class: btc-dir-15m; /, "a pinned name that is no kata class");
  refused(bands, [...dir, "btc-dir-15m"], /kata clause: not a kata class: btc-dir-15m; /, "a held name that is no kata class");
  refused(rest(["btc-dir-4h"]), ["btc-dir-4h"], /kata clause: fewer than 2 held classes: 1; /, "n < 2");
  refused(all, [], /kata clause: fewer than 2 held classes: 0; /, "n = 0, as when the digest floor is emptied after the release of the directions");
  refused(["btc-range-1h"], rest(["btc-range-1h"]), /kata clause: fewer than 2 pinned classes: 1; /, "m < 2");
  refused([...bands, "btc-dir-15m", "btc-dir-1h"], dir, /^Error: kata clause: not a kata class: btc-dir-15m; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each$/, "two conditions: the first in order throws, the whole message to its suffix");
  refused([...bands.slice(1), "btc-dir-1h"], dir, /^Error: kata clause: both pinned and held: btc-dir-1h; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each$/, "two conditions, both and neither: the first in order throws");
  refused(bands, ["btc-dir-1h"], /^Error: kata clause: neither pinned nor held: btc-dir-4h, eth-dir-1h, eth-dir-4h, bnb-dir-1h, bnb-dir-4h, sol-dir-1h, sol-dir-4h; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each$/, "two conditions, neither and n < 2: the first in order throws");
  assert.throws(() => render(some.filter((e) => /^btc-(dir|range)-/.test(e.task_class)), undefined, ["btc-range-1h"], ["btc-dir-1h"]), /^Error: kata clause: fewer than 2 held classes: 1; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each$/, "two conditions, n < 2 and m < 2, on the product 1x2x1: the first in order throws");
  assert.throws(() => render(some.slice(1), undefined, bands, dir), /not the product/, "the product check comes first");
  const lines = readFileSync(join(SRC, "tools/gate.ts"), "utf8").split("\n"), line222 = lines[221] ?? "";
  assert.ok(line222.endsWith(", committed: readonly string[] = Object.keys(COMMITTED_TABLES), held: readonly string[] = [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES]): string {"), "line 222: by default, the served pins and both held lists, as line 1042 reads them");
  assert.equal(lines[253], "    `${kataClause()} ` +", "line 254: the served description calls the clause with its defaults, so it follows the served pins");
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
