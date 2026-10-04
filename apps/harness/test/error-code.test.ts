/**
 * Harness - stable error codes (chantier moteur, lot CM-2a, audit P3 points S-6 and S-15).
 * Oracle: docs/adr/ADR-CM-chantier-moteur-audit-P3.md section 5 B-3 (extended to MCP by the amendment "nuit, 2") and B-6;
 * plan docs/G0-lot-cm-2a.md. Every tool refusal carries a stable code from a closed list: in the HTTP error body
 * (`{error, operation, message, code}`) and in the MCP `_meta` (`monarkgate.tech/error_code`), the MCP text staying
 * byte-identical. The HTTP mirror validates its output before serving it. New names of the code are read through a
 * namespace import, so the base loads this file and reddens by assertion. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Prediction, AttestedPrice } from "@monark/contracts";
import * as gateModule from "../src/tools/gate.ts";
import { runGate, HarnessToolError, type HarnessParams } from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";
import { projectShogen } from "../src/tools/attest.ts";
import { SHOGEN_LOT_BYTES, SHOGEN_VERDICT_TEXT, SHOGEN_CONSTAT } from "../src/shogen-fixture.ts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";

/** The closed list of codes, pinned in order (G0 CM-2a, rules S-6 2 to 4). */
const CODES = [
  "param_invalid", "schema_version_unsupported", "byo_calibration_invalid", "byo_yhat_type", "byo_set_tau_cap",
  "yhat_type_mismatch", "liq_yhat_domain", "attested_inconsistent", "task_class_unknown", "byo_overrides_committed",
  "byo_edge_blank", "byo_lookalike_committed", "byo_reserved_kata", "byo_lookalike_confusable",
  "produced_at_invalid", "produced_at_future", "output_invalid",
  "policy_alpha_mismatch", "policy_nmin_mismatch", "task_class_retired",
  "attest_refused", "calibrate_input_invalid", "cascade_input_invalid", "ukemi_predict_input_invalid",
];

const LIQ = "liquidation-eligible-coverage";
const AT = "2026-09-04T00:00:00Z";
const PARAMS: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: "up", tool: "perps_order_preview", clockOpen: true };
const LIQ_PARAMS: HarnessParams = { ...PARAMS, alpha: 0.01, nMin: 100, intent: 1 };
const SCORES = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];
const INTERVAL = { scores: SCORES, mode: "interval" as const };
const SET = { scores: SCORES, mode: "set" as const, candidates: [{ label: "A", score: 0.5 }, { label: "B", score: 1.5 }] };
const UNKNOWN_MESSAGE =
  "unknown task_class 'nope-class' (known: cascade-liquidable-24h, stable-run-velocity-24h, liquidation-eligible-coverage; or supply params.calibration for BYO)";

function pred(taskClass: string, yhat: string | number, predictorId = "caller:model", schemaVersion = "1.0.0"): Prediction {
  return { schema_version: schemaVersion, task_class: taskClass, yhat, predictor_id: predictorId, produced_at: AT };
}

function attested(subject: string): AttestedPrice {
  return {
    schema_version: "1.0.0", subject, attestor: [{ identity: "shogen:test-attestor", key: "6b6579" }], residual: ["A(notary-neutrality)"],
    transport: "https-demo", utterance: { hash: "0".repeat(64) }, observed_at: { clock: "test-clock", instant: 0 }, octets_recalcules: true,
    verifier_revision: "test-rev",
  };
}

/** The code of the HarnessToolError thrown by `fn` (fails when nothing or something else is thrown). */
function codeOf(fn: () => unknown, at: string): { code: unknown; message: string } {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof HarnessToolError, `${at}: a HarnessToolError, got ${String(e)}`);
    return { code: (e as { code?: unknown }).code, message: e.message };
  }
  assert.fail(`${at}: expected a named refusal (400), the gate decided`);
}

async function mirror(path: string, body: unknown): Promise<{ status: number; text: string }> {
  const res = await handleJsonMirror(new Request(`http://api.monarkgate.tech${path}`, { method: "POST", body: JSON.stringify(body) }));
  return { status: res.status, text: await res.text() };
}

type Obj = Record<string, unknown>;
async function mcpToolsCall(name: string, args: Obj): Promise<Obj> {
  const res = await createHarnessHandler().fetch(
    new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    }),
  );
  assert.equal(res.status, 200, "MCP tools/call answers 200");
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  const reply = JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: Obj; error?: unknown };
  assert.equal(reply.error, undefined, `no JSON-RPC error: ${JSON.stringify(reply.error)}`);
  assert.ok(reply.result !== undefined, "a tools/call result");
  return reply.result;
}

// Test E-1 (F2P): the codes are a closed list, pinned in order (snake_case, unique).
// killer: apps/harness/src/tools/gate.ts:273 CONST "byo_set_tau_cap" -> "byo_tau_cap"
test("harness_error_codes_are_a_closed_pinned_list", () => {
  const listed = (gateModule as Record<string, unknown>)["HARNESS_ERROR_CODES"];
  assert.deepEqual(listed, CODES, "HARNESS_ERROR_CODES is the pinned closed list");
  assert.equal(new Set(CODES).size, CODES.length, "codes are unique");
  for (const c of CODES) assert.match(c, /^[a-z]+(?:_[a-z]+)*$/, `${c} is snake_case`);
  assert.equal((gateModule as Record<string, unknown>)["ERROR_CODE_META_KEY"], "monarkgate.tech/error_code", "the MCP _meta key");
});

/** The argument texts of the call whose "(" ends at `open` (strings, template literals and brackets aware). */
function callArgs(src: string, open: number): string[] {
  const args: string[] = [];
  const holes: number[] = [];
  let cur = "";
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < src.length; i++) {
    const c = src.charAt(i);
    if (quote !== null) {
      cur += c;
      if (c === "\\") { cur += src.charAt(++i); continue; }
      if (quote === "`" && c === "$" && src.charAt(i + 1) === "{") { cur += "{"; i++; holes.push(depth); depth++; quote = null; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; cur += c; continue; }
    if (c === "(" || c === "[" || c === "{") { depth++; cur += c; continue; }
    if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) { args.push(cur.trim()); return args.filter((a) => a !== ""); }
      depth--;
      cur += c;
      if (c === "}" && holes.length > 0 && holes[holes.length - 1] === depth) { holes.pop(); quote = "`"; }
      continue;
    }
    if (c === "," && depth === 0) { args.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  assert.fail("unclosed new HarnessToolError( call");
}

// Test E-2 (F2P): every `new HarnessToolError(` in apps/harness/src names a code; a literal code is in the list.
// killer: apps/harness/src/tools/gate.ts:316 CONST "\"param_invalid\");" -> ");"
test("every_harness_tool_error_names_a_code", () => {
  const SRC = fileURLToPath(new URL("../src", import.meta.url));
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : n.endsWith(".ts") ? [join(dir, n)] : []));
  const sites: { at: string; args: string[] }[] = [];
  for (const file of walk(SRC)) {
    const src = readFileSync(file, "utf8");
    const needle = "new HarnessToolError(";
    for (let i = src.indexOf(needle); i !== -1; i = src.indexOf(needle, i + 1)) {
      const line = src.slice(0, i).split("\n").length;
      sites.push({ at: `${file}:${String(line)}`, args: callArgs(src, i + needle.length) });
    }
  }
  assert.ok(sites.length >= 30, `the scan is non-vacuous, saw ${String(sites.length)} sites`);
  for (const s of sites) {
    assert.equal(s.args.length, 2, `${s.at}: new HarnessToolError(message, code) takes a code (${JSON.stringify(s.args)})`);
    const code = s.args[1] ?? "";
    const literal = /^"([^"]*)"$/.exec(code);
    if (literal !== null) assert.ok(CODES.includes(literal[1] ?? ""), `${s.at}: '${code}' is a listed code`);
  }
});

// Test E-3 (F2P): each refusal path of runGate carries its code; the four liq messages stay byte-identical.
// killer: apps/harness/src/tools/gate.ts:797 CONST "code: \"byo_reserved_kata\"" -> "code: \"byo_lookalike_committed\""
test("gate_refusals_carry_their_code", () => {
  const cases: [string, () => unknown, string][] = [
    ["nMin 0", () => runGate(pred("btc-dir-15m", "up"), { ...PARAMS, nMin: 0 }), "param_invalid"],
    ["schema 2.0.0", () => runGate(pred("btc-dir-15m", "up", "x", "2.0.0"), PARAMS), "schema_version_unsupported"],
    ["negative interval score", () => runGate(pred("byo-x", 1), { ...PARAMS, calibration: { scores: [-1, 1], mode: "interval" } }), "byo_calibration_invalid"],
    ["interval string yhat", () => runGate(pred("byo-x", "A"), { ...PARAMS, calibration: INTERVAL }), "byo_yhat_type"],
    ["set tau 5", () => runGate(pred("byo-x", "A"), { ...PARAMS, nMin: 5, tau: 5, calibration: SET }), "byo_set_tau_cap"],
    ["cascade string yhat", () => runGate(pred("cascade-liquidable-24h", "1"), PARAMS), "yhat_type_mismatch"],
    ["btc-dir retired", () => runGate(pred("btc-dir-15m", "up"), PARAMS), "task_class_retired"],
    ["discordant attested", () => runGate(pred("btc-dir-15m", "up"), PARAMS, attested("https://example.test/x")), "attested_inconsistent"],
    ["unknown class", () => runGate(pred("nope-class", 1), PARAMS), "task_class_unknown"],
    ["byo on btc-dir", () => runGate(pred("btc-dir-15m", 1), { ...PARAMS, calibration: INTERVAL }), "byo_overrides_committed"],
    ["edge blank", () => runGate(pred(" byo-x", 1), { ...PARAMS, calibration: INTERVAL }), "byo_edge_blank"],
    ["case look-alike", () => runGate(pred("BTC-DIR-15M", 1), { ...PARAMS, calibration: INTERVAL }), "byo_lookalike_committed"],
    ["kata name", () => runGate(pred("eth-dir-1h", 1), { ...PARAMS, calibration: INTERVAL }), "byo_reserved_kata"],
    ["set number yhat", () => runGate(pred("byo-x", 1), { ...PARAMS, nMin: 5, calibration: SET }), "byo_yhat_type"],
    ["set without candidates", () => runGate(pred("byo-x", "A"), { ...PARAMS, nMin: 5, calibration: { scores: SCORES, mode: "set" } }), "byo_calibration_invalid"],
    ["USDe string yhat", () => runGate(pred("stable-run-velocity-24h", "0.1", USDE_STABLE_RUN_PREDICTOR_ID), PARAMS), "yhat_type_mismatch"],
    ["attest refusal", () => projectShogen(SHOGEN_LOT_BYTES, SHOGEN_VERDICT_TEXT.replace("VERDICT : valide", "VERDICT : invalide"), SHOGEN_CONSTAT), "attest_refused"],
  ];
  for (const [at, fn, code] of cases) {
    if (code === "attest_refused") {
      // AttestToolError, not a HarnessToolError: read its code directly.
      let caught: unknown;
      try { fn(); } catch (e) { caught = e; }
      assert.ok(caught instanceof Error && caught.name === "AttestToolError", `${at}: an AttestToolError`);
      assert.equal((caught as { code?: unknown }).code, code, `${at}: code ${code}`);
      continue;
    }
    assert.equal(codeOf(fn, at).code, code, `${at}: code ${code}`);
  }

  // liq: codes, and the messages byte-identical to the base (B-3 adds a code, never rewrites a message).
  const liq: [string, () => unknown, string, string][] = [
    ["liq 1.5", () => runGate(pred(LIQ, 1.5), LIQ_PARAMS), "liq_yhat_domain",
      "task_class 'liquidation-eligible-coverage' expects yhat to be a non-negative safe integer (base 8-dec liquidable amount), got 1.5"],
    ["liq alpha", () => runGate(pred(LIQ, 5000), { ...LIQ_PARAMS, alpha: 0.1 }), "policy_alpha_mismatch",
      "task_class 'liquidation-eligible-coverage' requires params.alpha = 0.01 (server-imposed for the committed class), got 0.1"],
    ["liq nMin", () => runGate(pred(LIQ, 5000), { ...LIQ_PARAMS, nMin: 50 }), "policy_nmin_mismatch",
      "task_class 'liquidation-eligible-coverage' requires params.nMin = 100 (server-imposed for the committed class), got 50"],
    ["liq string yhat", () => runGate(pred(LIQ, "5000"), LIQ_PARAMS), "yhat_type_mismatch",
      "task_class 'liquidation-eligible-coverage' expects a number yhat (liquidable amount), got string"],
  ];
  for (const [at, fn, code, message] of liq) {
    const got = codeOf(fn, at);
    assert.equal(got.message, message, `${at}: message byte-identical`);
    assert.equal(got.code, code, `${at}: code ${code}`);
  }
});

// Test E-4 (F2P): the HTTP error body is {error, operation, message, code}, in that order, status 400, for the
// gate and for the other tools' error classes (default code per class).
// killer: apps/harness/src/http.ts:106 SDL ", code: toolErrorCode(error)" -> ""
test("http_tool_error_body_carries_the_code", async () => {
  const gateBody = (p: Prediction, params: HarnessParams): unknown => ({ prediction: p, params });
  const cases: [string, unknown, string, string, string][] = [
    ["/gate", gateBody(pred("btc-dir-15m", "up"), { ...PARAMS, tau: -1 }), "gate", "invalid param 'tau': expected >= 0", "param_invalid"],
    ["/gate", gateBody(pred("nope-class", 1), PARAMS), "gate", UNKNOWN_MESSAGE, "task_class_unknown"],
    ["/gate", gateBody(pred(LIQ, 5000), { ...LIQ_PARAMS, alpha: 0.1 }), "gate",
      "task_class 'liquidation-eligible-coverage' requires params.alpha = 0.01 (server-imposed for the committed class), got 0.1", "policy_alpha_mismatch"],
    ["/gate", gateBody(pred("stable-run-velocity-24h", "0.1", USDE_STABLE_RUN_PREDICTOR_ID), PARAMS), "gate",
      "task_class 'stable-run-velocity-24h' expects a number yhat (velocity forecast), got string", "yhat_type_mismatch"],
    ["/gate", gateBody(pred("byo-x", "A"), { ...PARAMS, nMin: 5, calibration: { scores: SCORES, mode: "set" } }), "gate",
      "invalid calibration.candidates: set mode requires a non-empty candidate list", "byo_calibration_invalid"],
    ["/gate", gateBody(pred("byo-x", 1), { ...PARAMS, nMin: 5, calibration: SET }), "gate", "byo 'set' mode expects a string yhat (label), got number", "byo_yhat_type"],
    ["/calibrate", { scores: [0.1, 0.2, 0.3], alpha: 1.5, nMin: 3 }, "calibrate", "invalid 'alpha': expected a finite number in the open interval (0,1)", "calibrate_input_invalid"],
    ["/cascade", { L: [[0, 100], [50, 0]], e: [40, 20], shock: 2, producedAt: AT }, "cascade", "invalid 'shock': expected a finite number in [0,1]", "cascade_input_invalid"],
  ];
  for (const [path, body, operation, message, code] of cases) {
    const r = await mirror(path, body);
    assert.equal(r.status, 400, `${path} ${code}: 400`);
    assert.equal(r.text, JSON.stringify({ error: "tool_error", operation, message, code }), `${path} ${code}: exact body`);
  }
});

// Test E-5 (F2P): an MCP tool error keeps today's text as its first (and only) content, isError, and adds the code
// in _meta.
// killer: apps/harness/src/tools/registry.ts:155 SDL ", _meta: { [ERROR_CODE_META_KEY]: code }" -> ""
test("mcp_tool_error_keeps_its_text_and_adds_the_code", async () => {
  const cases: [string, Obj, string, string][] = [
    ["gate", { prediction: pred("nope-class", 1), params: PARAMS }, UNKNOWN_MESSAGE, "task_class_unknown"],
    ["calibrate", { scores: [0.1, 0.2, 0.3], alpha: 1.5, nMin: 3 }, "invalid 'alpha': expected a finite number in the open interval (0,1)", "calibrate_input_invalid"],
  ];
  for (const [name, args, text, code] of cases) {
    const r = await mcpToolsCall(name, args);
    assert.equal(r["isError"], true, `${name}: isError`);
    assert.deepEqual(r["content"], [{ type: "text", text }], `${name}: the content is today's text, byte for byte`);
    assert.equal(r["structuredContent"], undefined, `${name}: no structured content on an error`);
    assert.deepEqual(r["_meta"], { "monarkgate.tech/error_code": code }, `${name}: the code rides in _meta`);
  }
});

// Test E-6 (F2P): the HTTP mirror validates its output against the tool's output schema: an invalid output is a 500
// with code output_invalid, never served; a valid one stays 200.
// killer: apps/harness/src/http.ts:112 CONST "checked.issues !== undefined" -> "false"
test("http_mirror_validates_its_output", async () => {
  const body = { prediction: pred("stable-run-velocity-24h", 0.0001, USDE_STABLE_RUN_PREDICTOR_ID), params: { ...PARAMS, intent: 0 } };
  const retired = await mirror("/gate", { ...body, prediction: pred("btc-dir-15m", "up", "internal:momentum-4c") });
  assert.equal(retired.status, 400, "btc-dir-15m is retired (CM-2b), the USDe key is the served vehicle");
  assert.match(retired.text, /"code":"task_class_retired"/, "retired code");
  const tool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(tool !== undefined, "the gate tool is registered");
  const ok = await mirror("/gate", body);
  assert.equal(ok.status, 200, "a valid output is served");
  const mutable = tool as { run: typeof tool.run };
  const original = tool.run;
  try {
    mutable.run = () => ({ text: "x", structured: { action: "commit", rogue: true } });
    const bad = await mirror("/gate", body);
    assert.equal(bad.status, 500, "an output outside the output schema is never served");
    assert.equal(bad.text, JSON.stringify({ error: "internal_error", operation: "gate", code: "output_invalid" }), "exact 500 body");
  } finally {
    mutable.run = original;
  }
  assert.equal((await mirror("/gate", body)).status, 200, "restored");
});
