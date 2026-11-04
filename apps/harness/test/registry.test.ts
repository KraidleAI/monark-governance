/**
 * Harness — registry safety (K-8) and vocab honesty (ADR-M005 D9/D11).
 * No `any` (off the ratchet). The static scan targets DOUBLE/SINGLE-quoted module specifiers, so the
 * prose in the tool sources (which names these modules in backticks) is not a false positive.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePatterns, scanText } from "../../../scripts/grep-forbidden.mjs";
import type { CompiledRule } from "../../../scripts/grep-forbidden.mjs";
import { ALLOWED_TOOL_NAMES, REGISTERED_TOOL_NAMES, HARNESS_TOOLS } from "../src/tools/registry.ts";
import { createHarnessHandler } from "../src/server.ts";
import { honestyText, TASK_BTC_DIR, TASK_CASCADE, TASK_STABLE_RUN, TASK_LIQ_ELIGIBLE, LIQ_ALPHA, LIQ_NMIN } from "../src/tools/gate.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";
import { cascadeHonestyText, CASCADE_PREDICTOR_ID } from "../src/tools/cascade.ts";
import { attestHonestyText } from "../src/tools/attest.ts";
import { calibrateHonestyText } from "../src/tools/calibrate.ts";
import { JUDGE_EXIT_LABEL, JUDGE_LABEL, JUDGE_NO_VERDICT_LABEL, type KernelRunner } from "../src/tools/judge.ts";
import { UKEMI_LIQ_PREDICTOR_BASE, USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";

interface VocabRule { re: string; why: string; }
interface VocabConfig { banned: VocabRule[]; scan: { harness: { banned: VocabRule[] } }; }

const TOOLS_DIR = fileURLToPath(new URL("../src/tools/", import.meta.url));
const VOCAB_PATH = fileURLToPath(new URL("../../../vocab-banned.json", import.meta.url));

function collectTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...collectTs(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

/** Forbidden side-effect surfaces in a tool implementation (K-8). */
const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /["']node:fs["']/, why: "node fs import" },
  { re: /["']node:net["']/, why: "node net import" },
  { re: /["']node:child_process["']/, why: "node child_process import" },
  { re: /\bfetch\s*\(/, why: "fetch call" },
  { re: /\bprocess\.env(?:\.[A-Za-z_]\w*|\[[^\]]+\])\s*=(?!=)/, why: "process.env write" },
  { re: /\bDate\.now\b|new Date\(\s*\)|\bperformance\.now\b/, why: "clock read (a call or a reference, CM-2a C-7)" },
];

// Test — the registry is (a) within the closed allowlist and (b) EXACTLY the set {attest,gate,cascade,calibrate,judge}
// (ADR-M005 D9 at H3, ADR-M007 at C1, step 5 of ROADMAP.md for judge), and no tool implementation has a side effect.
// Mutants: a tool outside the allowlist, a stray/premature registration, or a `node:fs` import in a tools file ⇒ red.
test("mcp_tools_have_no_side_effects", () => {
  // (1) closed allowlist (K-8): registered ⊆ {attest, gate, cascade, calibrate, judge}, and all five are present.
  assert.ok(REGISTERED_TOOL_NAMES.length >= 1, "at least one tool registered");
  for (const name of REGISTERED_TOOL_NAMES) {
    assert.ok((ALLOWED_TOOL_NAMES as readonly string[]).includes(name), `tool '${name}' outside the closed allowlist`);
  }
  assert.ok(REGISTERED_TOOL_NAMES.includes("gate"), "the `gate` tool stays registered");
  assert.ok(REGISTERED_TOOL_NAMES.includes("cascade"), "the `cascade` tool stays registered");
  assert.ok(REGISTERED_TOOL_NAMES.includes("attest"), "the `attest` tool stays registered");
  assert.ok(REGISTERED_TOOL_NAMES.includes("calibrate"), "the `calibrate` tool is registered in C1");
  assert.ok(REGISTERED_TOOL_NAMES.includes("judge"), "the `judge` tool is registered (step 5 of ROADMAP.md)");
  // (1b) EXACT registry: exactly `attest` + `cascade` + `gate` + `calibrate` + `judge`, reached incrementally (H1 `gate`,
  // H2 `cascade`, H3 `attest`, C1 `calibrate`, step 5 `judge`). A premature or stray registration reddens here, where the
  // subset allowlist above would tolerate it.
  assert.deepEqual([...REGISTERED_TOOL_NAMES].sort(), ["attest", "calibrate", "cascade", "gate", "judge"], "the registry is exactly attest + calibrate + cascade + gate + judge");

  // (2) static side-effect scan of src/tools/**.
  const files = collectTs(TOOLS_DIR);
  assert.ok(files.length >= 2, `expected the tool sources, saw ${String(files.length)}`);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const { re, why } of FORBIDDEN) {
      assert.ok(!re.test(text), `side effect in ${file}: ${why}`);
    }
  }
});

// ---------------------------------------------------------------------------- served surface (A-9-OUTILLE)
// The REAL served surface, obtained IN-PROCESS through the stateless MCP handler (createHarnessHandler, server.ts):
// a JSON-RPC POST answered by the SDK exactly as on the mcp. host -- no socket, no listener, no network. tools/list
// and tools/call below are the bytes a client receives (A-9: the phrase ACTUALLY served, never an intermediate).
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

async function mcpCall(method: string, params?: Obj, kernel?: KernelRunner): Promise<Obj> {
  const res = await createHarnessHandler(Date.now, kernel).fetch(
    new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    }),
  );
  assert.equal(res.status, 200, `MCP ${method} answers 200`);
  const raw = await res.text();
  // The streamable-HTTP transport answers as SSE (`data: <json-rpc>`) or plain JSON -- read either.
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  const reply = JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: unknown; error?: unknown };
  assert.equal(reply.error, undefined, `MCP ${method} error: ${JSON.stringify(reply.error)}`);
  const result = reply.result;
  assert.ok(isObj(result), `MCP ${method} returns a result object`);
  return result;
}

/** Every string LEAF of a served JSON value, with its path (property names are keys, not rendered text). */
function stringLeaves(v: unknown, path: string): { path: string; text: string }[] {
  if (typeof v === "string") return [{ path, text: v }];
  if (Array.isArray(v)) return (v as unknown[]).flatMap((x, i) => stringLeaves(x, `${path}[${String(i)}]`));
  if (isObj(v)) return Object.entries(v).flatMap(([k, x]) => stringLeaves(x, `${path}.${k}`));
  return [];
}

/** The served tools/list (the SDK's rendering of the registry). */
async function servedToolsList(): Promise<Obj[]> {
  const tools = (await mcpCall("tools/list"))["tools"];
  assert.ok(Array.isArray(tools), "tools/list carries a tools array");
  return (tools as unknown[]).filter(isObj);
}

/** Scan every string leaf of every served tool; each hit NAMES its tool, its path and the matched word. */
function servedToolHits(tools: Obj[], patterns: CompiledRule[]): { tool: string; path: string; word: string }[] {
  const out: { tool: string; path: string; word: string }[] = [];
  for (const t of tools) {
    const name = typeof t["name"] === "string" ? t["name"] : "?";
    for (const { path, text } of stringLeaves(t, "")) {
      for (const hit of scanText(text, patterns)) out.push({ tool: name, path, word: hit.word });
    }
  }
  return out;
}

// Test — tool descriptions carry no banned vocabulary (GLOBAL + scan.harness). Mutant: put
// `confidence` in a description ⇒ red (the in-process scan and the grep-forbidden CLI both catch it).
// EXTENDED (A-9-OUTILLE, checkpoint-1 C-3): the scan also runs on the REAL served tools/list -- EVERY string leaf
// (each tool description AND every inputSchema/outputSchema description), obtained through createHarnessHandler --
// and the checkpoint-2 U-5a V5 surclaim slipped into EACH served tool description is caught ON THAT served list,
// every hit naming its tool (mission 3a). Mutant `schema-description-probability` (a naked "probability" in a
// PARAMS_SCHEMA description, i.e. an inputSchema leaf) => red here.
test("harness_tool_descriptions_pass_vocab", async () => {
  const config = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(config.banned), ...compilePatterns(config.scan.harness.banned)];
  // The harness scope must actually ban `confidence`, else this test would be vacuous.
  assert.ok(config.scan.harness.banned.some((r) => /confidence/.test(r.re)), "scan.harness must ban `confidence`");
  for (const tool of HARNESS_TOOLS) {
    const hits = scanText(tool.description, patterns);
    assert.equal(hits.length, 0, `tool '${tool.name}' description has banned vocab: ${JSON.stringify(hits)}`);
  }
  // A-9-OUTILLE: the served-vocabulary rules are live on this scope, else the served scan below is vacuous for them.
  for (const probe of ["the price is verified", "a probability of being right", "95% of the time", "the accuracy is high"]) {
    assert.ok(scanText(probe, compilePatterns(config.scan.harness.banned)).length >= 1, `scan.harness must redden '${probe}'`);
  }

  // (served) the REAL tools/list: exactly the registry; each served description === its registry constant (liage,
  // A-10); both schemas served; EVERY string leaf vocab-clean.
  const served = await servedToolsList();
  assert.deepEqual(served.map((t) => t["name"]), [...REGISTERED_TOOL_NAMES], "tools/list serves exactly the registry, in order");
  for (const t of served) {
    const tool = HARNESS_TOOLS.find((d) => d.name === t["name"]);
    assert.ok(tool !== undefined && t["description"] === tool.description, `served description of '${String(t["name"])}' === its registry constant`);
    assert.ok(isObj(t["inputSchema"]) && isObj(t["outputSchema"]), `'${String(t["name"])}' serves both schemas`);
  }
  const schemaDescriptions = served.flatMap((t) => stringLeaves(t, "")).filter((l) => /Schema\..*\.description$/.test(l.path));
  assert.ok(schemaDescriptions.length >= 20, `the schema descriptions are scanned leaves (non-vacuous), saw ${String(schemaDescriptions.length)}`);
  assert.deepEqual(servedToolHits(served, patterns), [], "the served tools/list is vocab-clean (every string leaf)");

  // (injection, mission 3a) V5 appended to EACH served tool description is caught on the SERVED tools/list, every hit
  // naming THAT tool; the descriptor is restored byte-exact after each round (same-file tests share the module).
  const V5 = "verified 95% probability of liquidation within the interval.";
  for (const tool of HARNESS_TOOLS) {
    const original = tool.description;
    const mutable = tool as { description: string };
    try {
      mutable.description = `${original} ${V5}`;
      const hits = servedToolHits(await servedToolsList(), patterns);
      assert.ok(hits.length >= 3, `the injection into '${tool.name}' is caught on the served tools/list: ${JSON.stringify(hits)}`);
      assert.ok(hits.every((x) => x.tool === tool.name && x.path === ".description"), `every hit names the injected tool '${tool.name}'`);
      assert.deepEqual([...new Set(hits.map((x) => x.word.toLowerCase()))].sort(), ["95%", "probability", "verified"], "verified, 95% and probability are each named");
    } finally {
      mutable.description = original;
    }
    assert.equal(tool.description, original, `'${tool.name}' description restored byte-exact`);
  }
  assert.deepEqual(servedToolHits(await servedToolsList(), patterns), [], "after restoration the served tools/list is clean again");
});

// Test (A-9-OUTILLE, checkpoint-1 C-1/C-3) -- the four honesty carriers AS SERVED: one real tools/call per served
// branch (createHarnessHandler), in the DELIVERED state (empty liq registry, under_calib, BYO, the committed USDe key).
// Each served content text IS its carrier (honestyText / cascadeHonestyText / attestHonestyText /
// calibrateHonestyText, followed by the verdict summary the registry appends for gate/calibrate), and every served
// honesty text (content + the output `label`) is vocab-clean AND never says "interval" (C-1: the wire vocabulary is
// kept out of the honesty prose, precedent u4b_liq_class_text_says_upper_bound_never_interval). Mutants:
// `stable-run-uncalibrated-interval` (C-1) and `demonstrative-label-accuracy` (a served text born OUTSIDE
// apps/harness/src, invisible to the static CLI) => red here.
// CM-2b (ADR-CM B-5): btc-dir-15m is retired, so its carrier is no longer served: the call is a tool error with the
// stable code, and the gate reaches five distinct honesty branches.
// killer: apps/harness/src/tools/gate.ts:966 CONST "\"task_class_retired\"" -> "\"task_class_unknown\""
test("harness_served_honesty_carriers_pass_vocab", async () => {
  const config = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(config.banned), ...compilePatterns(config.scan.harness.banned)];
  const AT = "2026-09-04T00:00:00Z";
  const P: Obj = { remainingBudget: 1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 5, intent: 0, tool: "demo_tool", clockOpen: true };
  const pred = (task_class: string, yhat: string | number, predictor_id: string, produced_at: string = AT): Obj => ({ schema_version: SCHEMA_VERSION, task_class, yhat, predictor_id, produced_at });
  const TEN = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const BYO = "byo:demo-class";
  const LIMITS: Obj = { venues: ["venue:a"], assets: [{ asset: "btc", cap: "100" }] };
  const JUDGE: Obj = { prediction: pred(BYO, 1, "caller:model"), params: { ...P, tauInterval: 2, calibration: { scores: TEN, mode: "interval" } }, order: { kind: "OPEN", target: "venue:a", asset: "btc", amount: "100" }, limits: LIMITS };
  const answers = (status: number | null, out: string): KernelRunner => () => ({ status, stdout: new TextEncoder().encode(out) });
  const allows = answers(0, "allow\n");
  const CALLS: { label: string; tool: string; args: Obj; carrier: string; kernel?: KernelRunner }[] = [
    { label: "gate cascade class", tool: "gate", args: { prediction: pred(TASK_CASCADE, 100, CASCADE_PREDICTOR_ID), params: P }, carrier: honestyText(TASK_CASCADE, CASCADE_PREDICTOR_ID, false) },
    { label: "gate stable-run committed key", tool: "gate", args: { prediction: pred(TASK_STABLE_RUN, 0.0001, USDE_STABLE_RUN_PREDICTOR_ID), params: { ...P, nMin: 50 } }, carrier: honestyText(TASK_STABLE_RUN, USDE_STABLE_RUN_PREDICTOR_ID, false) },
    { label: "gate stable-run other population", tool: "gate", args: { prediction: pred(TASK_STABLE_RUN, 0.0001, "other:population"), params: P }, carrier: honestyText(TASK_STABLE_RUN, "other:population", false) },
    { label: "gate liq s0", tool: "gate", args: { prediction: pred(TASK_LIQ_ELIGIBLE, 5000, "ukemi:any"), params: { ...P, alpha: LIQ_ALPHA, nMin: LIQ_NMIN } }, carrier: honestyText(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s0`, false) },
    { label: "gate byo interval", tool: "gate", args: { prediction: pred(BYO, 1, "caller:model"), params: { ...P, calibration: { scores: TEN, mode: "interval" } } }, carrier: honestyText(BYO, "caller:model", true) },
    { label: "gate byo set", tool: "gate", args: { prediction: pred(BYO, "a", "caller:model"), params: { ...P, intent: "a", calibration: { scores: TEN, mode: "set", candidates: [{ label: "a", score: 0.1 }, { label: "b", score: 0.9 }] } } }, carrier: honestyText(BYO, "caller:model", true) },
    { label: "cascade", tool: "cascade", args: { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: AT }, carrier: cascadeHonestyText() },
    { label: "attest", tool: "attest", args: {}, carrier: attestHonestyText() },
    { label: "calibrate", tool: "calibrate", args: { scores: TEN, alpha: 0.1, nMin: 5 }, carrier: calibrateHonestyText() },
    { label: "calibrate under_calib", tool: "calibrate", args: { scores: [0.1, 0.2], alpha: 0.1, nMin: 5 }, carrier: calibrateHonestyText() },
    // judge: the label of a verdict of the kernel (an allow, or a deny with one of its reasons), and the label of no verdict
    // (no kernel ran, the kernel refused the request, or its answer was not a verdict). Pinned as constants, not through
    // judgeHonestyText, so that a judgeHonestyText that ignores the verdict reds here.
    { label: "judge, no kernel", tool: "judge", args: JUDGE, carrier: JUDGE_NO_VERDICT_LABEL },
    { label: "judge, a kernel that refuses the request", tool: "judge", args: JUDGE, carrier: JUDGE_NO_VERDICT_LABEL, kernel: answers(3, "") },
    { label: "judge, an answer that is no verdict", tool: "judge", args: JUDGE, carrier: JUDGE_NO_VERDICT_LABEL, kernel: answers(null, "allow\n") },
    { label: "judge, a kernel that allows", tool: "judge", args: JUDGE, carrier: JUDGE_LABEL, kernel: allows },
    { label: "judge, a kernel that denies", tool: "judge", args: JUDGE, carrier: JUDGE_LABEL, kernel: answers(0, "deny venue\n") },
    { label: "judge, an EXIT the kernel allows", tool: "judge", args: { ...JUDGE, order: { kind: "EXIT", target: "venue:a", asset: "eth", amount: "1" } }, carrier: JUDGE_LABEL, kernel: allows },
    // An EXIT under an envelope the gate refuses (a produced_at long after the clock): the kernel judges it with no gate decision.
    { label: "judge, an EXIT under an envelope the gate refuses", tool: "judge", args: { ...JUDGE, prediction: pred(BYO, 1, "caller:model", "2999-01-01T00:00:00Z"), order: { kind: "EXIT", target: "venue:a", asset: "eth", amount: "1" } }, carrier: JUDGE_EXIT_LABEL, kernel: allows },
  ];
  // Non-vacuity: every served tool is exercised, the five gate honesty branches are five DISTINCT served texts, and so are the
  // three judge branches.
  assert.deepEqual([...new Set(CALLS.map((c) => c.tool))].sort(), [...REGISTERED_TOOL_NAMES].sort(), "every served tool is called");
  assert.equal(new Set(CALLS.filter((c) => c.tool === "gate").map((c) => c.carrier)).size, 5, "the gate calls reach five distinct honesty branches");
  assert.equal(new Set(CALLS.filter((c) => c.tool === "judge").map((c) => c.carrier)).size, 3, "the judge calls reach its three honesty branches");
  assert.doesNotMatch(JUDGE_NO_VERDICT_LABEL, /\bjudged\b/, "the label of no verdict never says the kernel judged the order");
  const retired = await mcpCall("tools/call", { name: "gate", arguments: { prediction: pred(TASK_BTC_DIR, "up", "internal:momentum-4c"), params: { ...P, intent: "up" } } });
  assert.equal(retired["isError"], true, "btc-dir-15m is a served tool error (retired)");
  assert.deepEqual(retired["_meta"], { "monarkgate.tech/error_code": "task_class_retired" }, "with the retired code");
  for (const c of CALLS) {
    const r = await mcpCall("tools/call", { name: c.tool, arguments: c.args }, c.kernel);
    assert.notEqual(r["isError"], true, `${c.label}: served without a tool error (${JSON.stringify(r["content"])})`);
    const content = r["content"];
    assert.ok(Array.isArray(content) && content.length === 1, `${c.label}: one served content item`);
    const first: unknown = (content as unknown[])[0];
    const text = isObj(first) ? first["text"] : undefined;
    assert.ok(typeof text === "string", `${c.label}: the served content is a text`);
    // liage (A-10): the served text IS its carrier, plus the verdict summary the registry appends (gate/calibrate).
    assert.ok(text === c.carrier || text.startsWith(`${c.carrier} verdict `), `${c.label}: served text === carrier (+ summary)`);
    const sc = r["structuredContent"];
    const label = isObj(sc) ? sc["label"] : undefined;
    for (const honest of typeof label === "string" ? [text, label] : [text]) {
      assert.deepEqual(scanText(honest, patterns), [], `${c.label}: the served honesty text is vocab-clean`);
      assert.doesNotMatch(honest, /\binterval\b/i, `${c.label}: the served honesty text never says 'interval' (C-1)`);
    }
  }
});
