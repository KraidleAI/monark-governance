/**
 * Harness — the `judge` tool with a fake kernel (step 5 of ROADMAP.md): what it hands the kernel, how it reads the answer, what it
 * refuses before any kernel runs, and how both surfaces serve it. The real kernel runs in judge.kernel.test.ts (test:genkan).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Prediction } from "@monark/contracts";
import { encodeContext, encodeJudgeRequest, encodeOrder, type OrderFields } from "@monark/genkan/frame";
import { judgeHonestyText, judgeVerdictSummary, runJudge, JUDGE_TOOL_NAME, type JudgeInput, type JudgeOrder, type KernelAnswer, type KernelRunner } from "../src/tools/judge.ts";
import { runGate, toolErrorCode, SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";
import { KERNEL_BINARY, kernelRunner } from "../src/kernel.ts";

type Obj = Record<string, unknown>;
const NOW = Date.parse("2026-09-04T00:01:00Z");
const PRED: Prediction = { schema_version: SCHEMA_VERSION, task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: "2026-09-04T00:00:00Z" };
/** A BYO envelope that commits (measured: covered); its twins defer (tauInterval 1, interval_too_wide) and abstain (nMin 50). */
const COMMIT: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } };
const DEFER: HarnessParams = { ...COMMIT, tauInterval: 1 };
const ABSTAIN: HarnessParams = { ...COMMIT, nMin: 50 };
const LIMITS = { venues: ["venue:a", "vault"], assets: [{ asset: "btc", cap: "100" }, { asset: "usdc", cap: "5000" }] } as const;
const OPEN: JudgeOrder = { kind: "OPEN", target: "venue:a", asset: "btc", amount: "100" };
const MAX_U128 = "340282366920938463463374607431768211455";
const input = (over: Partial<JudgeInput> = {}): JudgeInput => ({ prediction: PRED, params: COMMIT, order: OPEN, limits: LIMITS, ...over });
/** An EXIT on a listed venue, and an envelope the gate refuses: a produced_at long after NOW (produced_at_future). */
const EXIT: JudgeOrder = { kind: "EXIT", target: "vault", asset: "btc", amount: "7" };
const FUTURE: Prediction = { ...PRED, produced_at: "2999-01-01T00:00:00Z" };
/** An order of every kind but EXIT, each within the frames. */
const OTHER_KINDS: readonly JudgeOrder[] = [
  { kind: "TRANSFER", target: "vault", asset: "btc", amount: "7" },
  { kind: "APPROVE", target: "vault", asset: "btc", amount: "7" },
  { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "1", assetOut: "btc", minOut: "1" },
  { kind: "OPEN", target: "venue:a", asset: "btc", amount: "1" },
];
/** COMMIT's params with no calibration: a class that is not one of the gate's is then task_class_unknown. */
const NO_CALIBRATION: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true };

/** A fake kernel: it records each request and answers `answer`. */
function fake(answer: KernelAnswer): { readonly runner: KernelRunner; readonly requests: Uint8Array[] } {
  const requests: Uint8Array[] = [];
  return { runner: (r) => { requests.push(r); return Promise.resolve(answer); }, requests };
}
const line = (text: string, status: number | null = 0): KernelAnswer => ({ status, stdout: new TextEncoder().encode(text) });
const sha256 = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
/** The request the frames build for an order under an action and the limits, independently of the tool. */
function expected(action: "commit" | "defer" | "abstain", order: OrderFields): Uint8Array {
  const ctx = encodeContext({ action, venues: LIMITS.venues, assets: LIMITS.assets.map((a) => ({ asset: a.asset, cap: BigInt(a.cap) })) });
  return encodeJudgeRequest(ctx, encodeOrder(order));
}

// The kernel is handed the gate's own action, never the caller's word, and the caller's limits as they are; the decision served is
// runGate's on the same envelope. The context's action byte is the 14th of the request ("GNKQ", mode, the ctx length, "GNKC").
test("judge_hands_the_kernel_the_gate_action_and_the_caller_limits", async () => {
  for (const [params, action, code] of [[COMMIT, "commit", 1], [DEFER, "defer", 2], [ABSTAIN, "abstain", 3]] as const) {
    const decision = runGate(PRED, params, undefined, { nowMs: NOW });
    assert.equal(decision.action, action, `the envelope gives ${action}`);
    const k = fake(line("allow\n"));
    const out = await runJudge(input({ params }), { nowMs: NOW, kernel: k.runner });
    assert.deepEqual(out.decision, decision, `${action}: the decision is runGate's`);
    const want = expected(action, { kind: "OPEN", target: "venue:a", asset: "btc", amount: 100n });
    assert.equal(k.requests.length, 1, `${action}: one kernel run`);
    assert.deepEqual([...(k.requests[0] ?? [])], [...want], `${action}: the request is the frames' bytes`);
    assert.equal(k.requests[0]?.[13], code, `${action}: the context's action byte`);
    assert.equal(out.kernel_request_sha256, sha256(want), `${action}: the sha256 of the request`);
  }
  const swap: JudgeOrder = { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "5000", assetOut: "btc", minOut: "1" };
  const k = fake(line("allow\n"));
  await runJudge(input({ order: swap }), { nowMs: NOW, kernel: k.runner });
  assert.deepEqual([...(k.requests[0] ?? [])], [...expected("commit", { kind: "SWAP", target: "venue:a", asset: "usdc", amount: 5000n, assetOut: "btc", minOut: 1n })], "a SWAP's assetOut and minOut are in the request");
});

// An allow only for exit 0 and exactly the line "allow": every other answer is a deny, with the kernel's reason when its line is one,
// refused for exit 3 with nothing written, unreadable otherwise, and unavailable when no kernel ran.
test("judge_reads_the_kernel_answer_fail_closed", async () => {
  const cases: [string, KernelAnswer | undefined, "allow" | "deny", string | null][] = [
    ["allow", line("allow\n"), "allow", null],
    ["deny over-cap", line("deny over-cap\n"), "deny", "over-cap"],
    ["deny not-commit", line("deny not-commit\n"), "deny", "not-commit"],
    ["deny kind", line("deny kind\n"), "deny", "kind"],
    ["allow without its newline", line("allow"), "deny", "unreadable"],
    ["allow twice ended", line("allow\n\n"), "deny", "unreadable"],
    ["Allow", line("Allow\n"), "deny", "unreadable"],
    ["a reason the kernel has not", line("deny nope\n"), "deny", "unreadable"],
    ["allow with exit 1", line("allow\n", 1), "deny", "unreadable"],
    ["allow after a signal", line("allow\n", null), "deny", "unreadable"],
    ["exit 3, nothing written", line("", 3), "deny", "refused"],
    ["exit 3 with a line", line("allow\n", 3), "deny", "unreadable"],
    ["no binary", null, "deny", "unavailable"],
    ["no runner", undefined, "deny", "unavailable"],
  ];
  for (const [name, answer, verdict, reason] of cases) {
    const out = await runJudge(input(), answer === undefined ? { nowMs: NOW } : { nowMs: NOW, kernel: fake(answer).runner });
    assert.deepEqual([out.kernel_verdict, out.kernel_reason, out.reduce_only], [verdict, reason, false], name);
  }
});

// reduce_only is true for an allowed EXIT only: the kernel lets an EXIT pass on a listed venue whatever the action.
test("judge_marks_reduce_only_an_allowed_exit_alone", async () => {
  const exit: JudgeOrder = { kind: "EXIT", target: "vault", asset: "eth", amount: MAX_U128 };
  const swap: JudgeOrder = { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "1", assetOut: "btc", minOut: "1" };
  const cases: [string, JudgeInput, KernelAnswer, boolean][] = [
    ["an allowed EXIT under abstain", input({ params: ABSTAIN, order: exit }), line("allow\n"), true],
    ["an allowed EXIT under commit", input({ order: exit }), line("allow\n"), true],
    ["a denied EXIT", input({ order: exit }), line("deny venue\n"), false],
    ["an EXIT with no binary", input({ order: exit }), null, false],
    ["an allowed OPEN", input(), line("allow\n"), false],
    ["an allowed SWAP", input({ order: swap }), line("allow\n"), false],
  ];
  for (const [name, i, answer, reduceOnly] of cases) assert.equal((await runJudge(i, { nowMs: NOW, kernel: fake(answer).runner })).reduce_only, reduceOnly, name);
});

// A field outside the frames, and every refusal of the gate for an order other than an EXIT (these are OPEN orders), is a tool
// error before any kernel runs: param_invalid for the frames (the frozen tool-error contract has no code of its own for judge),
// the gate's own code for the gate.
test("judge_refuses_before_the_kernel_runs", async () => {
  const cases: [string, JudgeInput, string, RegExp][] = [
    ["an amount of 2^128", input({ order: { ...OPEN, amount: "340282366920938463463374607431768211456" } }), "param_invalid", /^invalid order: amount must be within 0 to 2\^128 - 1/],
    ["an amount with a leading 0", input({ order: { ...OPEN, amount: "0100" } }), "param_invalid", /^invalid order\.amount: expected the decimal string/],
    ["a negative amount", input({ order: { ...OPEN, amount: "-1" } }), "param_invalid", /^invalid order\.amount/],
    ["a cap in exponent form", input({ limits: { venues: ["venue:a"], assets: [{ asset: "btc", cap: "1e3" }] } }), "param_invalid", /^invalid limits\.assets\[0\]\.cap/],
    ["a SWAP with no minOut", input({ order: { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "1", assetOut: "btc" } }), "param_invalid", /^invalid order: a SWAP carries its assetOut and its minOut$/],
    ["an OPEN with an assetOut", input({ order: { ...OPEN, assetOut: "btc" } }), "param_invalid", /^invalid order: a OPEN carries neither assetOut nor minOut$/],
    ["an asset listed twice", input({ limits: { venues: ["venue:a"], assets: [{ asset: "btc", cap: "1" }, { asset: "btc", cap: "100" }] } }), "param_invalid", /^invalid limits: assets name "btc" twice$/],
    ["an upper-case venue", input({ limits: { venues: ["Venue"], assets: [] } }), "param_invalid", /^invalid limits: venue must be 1 to 128 characters/],
    ["a target of 129 characters", input({ order: { ...OPEN, target: "a".repeat(129) } }), "param_invalid", /^invalid order: target must be 1 to 128 characters/],
    ["a gate param", input({ params: { ...COMMIT, alpha: 1.5 } }), "param_invalid", /^invalid param 'alpha'/],
    ["a produced_at in the future", input({ prediction: { ...PRED, produced_at: "2026-09-05T00:00:00Z" } }), "produced_at_future", /is in the future/],
    ["an unknown class", input({ prediction: { ...PRED, task_class: "nope-class" }, params: NO_CALIBRATION }), "task_class_unknown", /^unknown task_class 'nope-class'/],
    ["an EXIT whose order is outside the frames", input({ prediction: FUTURE, order: { ...EXIT, amount: "0100" } }), "param_invalid", /^invalid order\.amount/],
  ];
  for (const [name, i, code, message] of cases) {
    const k = fake(line("allow\n"));
    let thrown: unknown;
    try {
      await runJudge(i, { nowMs: NOW, kernel: k.runner });
    } catch (e) {
      thrown = e;
    }
    assert.ok(thrown instanceof Error && thrown.name === "HarnessToolError", `${name}: a HarnessToolError (${String(thrown)})`);
    assert.equal(toolErrorCode(thrown), code, `${name}: its code`);
    assert.match(thrown.message, message, `${name}: its message`);
    assert.equal(k.requests.length, 0, `${name}: no kernel ran`);
  }
});

// An EXIT is judged whatever the gate decides, so a refusal of the gate does not stop it (the founder's decision of 2026-11-04): the
// kernel judges it under the action abstain, `decision` is null, and `gate_error` carries the gate's code and message. An OPEN under
// the same envelope is the gate's tool error, and no kernel runs.
test("judge_judges_an_exit_the_gate_refuses", async () => {
  const cases: [string, Partial<JudgeInput>, string][] = [
    ["a produced_at in the future", { prediction: FUTURE }, "produced_at_future"],
    ["an unknown class", { prediction: { ...PRED, task_class: "nope-class" }, params: NO_CALIBRATION }, "task_class_unknown"],
    ["a gate param", { params: { ...COMMIT, alpha: 1.5 } }, "param_invalid"],
  ];
  for (const [name, over, code] of cases) {
    const i = input({ ...over, order: EXIT });
    let gateError: unknown;
    try {
      runGate(i.prediction, i.params, undefined, { nowMs: NOW });
    } catch (e) {
      gateError = e;
    }
    assert.ok(gateError instanceof Error && toolErrorCode(gateError) === code, `${name}: the gate refuses the envelope with ${code}`);
    const k = fake(line("allow\n"));
    const out = await runJudge(i, { nowMs: NOW, kernel: k.runner });
    assert.equal(out.decision, null, `${name}: no gate decision`);
    assert.deepEqual(out.gate_error, { code, message: gateError.message }, `${name}: the gate's refusal, as it is`);
    const want = expected("abstain", { kind: "EXIT", target: "vault", asset: "btc", amount: 7n });
    assert.equal(k.requests.length, 1, `${name}: one kernel run`);
    assert.deepEqual([...(k.requests[0] ?? [])], [...want], `${name}: the request is the frames' bytes under abstain`);
    assert.equal(k.requests[0]?.[13], 3, `${name}: the context's action byte is abstain's`);
    assert.deepEqual([out.kernel_verdict, out.kernel_reason, out.reduce_only, out.kernel_request_sha256], ["allow", null, true, sha256(want)], `${name}: the kernel's allow, reduce_only`);
    assert.ok(judgeVerdictSummary(out).startsWith(`verdict kernel=allow reason=none reduce_only=true action=none gate_error=${code} kernel_request_sha256=`), `${name}: the summary names the gate's refusal`);
    const denied = await runJudge(i, { nowMs: NOW, kernel: fake(line("deny venue\n")).runner });
    assert.deepEqual([denied.kernel_verdict, denied.kernel_reason, denied.reduce_only], ["deny", "venue", false], `${name}: the kernel's deny`);
    for (const other of OTHER_KINDS) {
      const k2 = fake(line("allow\n"));
      await assert.rejects(() => runJudge(input({ ...over, order: other }), { nowMs: NOW, kernel: k2.runner }), (e: unknown) => toolErrorCode(e) === code, `${name}: a ${other.kind} is the gate's tool error`);
      assert.equal(k2.requests.length, 0, `${name}: and no kernel ran for the ${other.kind}`);
    }
  }
  assert.deepEqual(OTHER_KINDS.map((o) => o.kind).sort(), ["APPROVE", "OPEN", "SWAP", "TRANSFER"], "every kind but EXIT is checked");
  assert.ok(judgeHonestyText(await runJudge(input({ prediction: FUTURE, order: EXIT }), { nowMs: NOW, kernel: fake(line("allow\n")).runner })).startsWith("The gate refused this call's envelope"), "the text says the gate refused the envelope");
});

const API = "http://api.monarkgate.tech/judge";
const post = (body: unknown, kernel?: KernelRunner): Promise<Response> =>
  handleJsonMirror(new Request(API, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }), () => NOW, kernel);

/** One MCP tools/call through the stateless handler, its JSON-RPC result. */
async function mcpJudge(args: unknown, kernel?: KernelRunner): Promise<Obj> {
  const res = await createHarnessHandler(() => NOW, kernel).fetch(new Request("http://mcp.monarkgate.tech/", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: JUDGE_TOOL_NAME, arguments: args } }),
  }));
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  const reply = JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: Obj };
  assert.ok(reply.result !== undefined, `a result: ${raw}`);
  return reply.result;
}

// Both surfaces serve the same output and the same text: the mirror validates it against the published output schema before it
// answers (a 200 says it passed); with no kernel handed, a deny unavailable; a schema refusal is invalid_input, a frame refusal
// a tool error param_invalid.
test("judge_is_served_by_the_mirror_and_by_mcp", async () => {
  const body = input();
  const allows = fake(line("allow\n")).runner;
  const direct = await runJudge(body, { nowMs: NOW, kernel: allows });
  const text = `${judgeHonestyText(direct)} ${judgeVerdictSummary(direct)}`;
  const res = await post(body, allows);
  assert.equal(res.status, 200, "the mirror serves judge");
  const json = (await res.json()) as Obj;
  assert.deepEqual(json["structuredContent"], direct, "the mirror's output is runJudge's");
  assert.deepEqual(json["content"], [{ type: "text", text }], "the mirror's text is the label and the summary");
  const tool = HARNESS_TOOLS.find((t) => t.name === JUDGE_TOOL_NAME);
  assert.ok(tool !== undefined, "judge is registered");
  assert.equal((await tool.outputStandardSchema["~standard"].validate(direct)).issues, undefined, "the output validates the output schema");
  const mcp = await mcpJudge(body, allows);
  assert.notEqual(mcp["isError"], true, "MCP serves judge");
  assert.deepEqual(mcp["structuredContent"], direct, "the MCP output is runJudge's");
  assert.deepEqual(mcp["content"], [{ type: "text", text }], "the MCP text is the mirror's");

  const none = (await (await post(body)).json()) as { structuredContent: Obj };
  assert.deepEqual([none.structuredContent["kernel_verdict"], none.structuredContent["kernel_reason"]], ["deny", "unavailable"], "no kernel handed to the mirror: unavailable");
  const noneMcp = await mcpJudge(body);
  assert.deepEqual([(noneMcp["structuredContent"] as Obj)["kernel_verdict"], (noneMcp["structuredContent"] as Obj)["kernel_reason"]], ["deny", "unavailable"], "no kernel handed to MCP: unavailable");

  // An EXIT under an envelope the gate refuses is served on both surfaces (a 200, no tool error); an OPEN under it is the gate's
  // tool error on both.
  const exitBody = { ...body, prediction: FUTURE, order: EXIT };
  const exitDirect = await runJudge(exitBody, { nowMs: NOW, kernel: allows });
  const exitText = `${judgeHonestyText(exitDirect)} ${judgeVerdictSummary(exitDirect)}`;
  const exitRes = await post(exitBody, allows);
  assert.equal(exitRes.status, 200, "the mirror serves an EXIT the gate refused");
  const exitJson = (await exitRes.json()) as Obj;
  assert.deepEqual(exitJson["structuredContent"], exitDirect, "its output is runJudge's");
  assert.deepEqual(exitJson["content"], [{ type: "text", text: exitText }], "its text is the label and the summary");
  const exitMcp = await mcpJudge(exitBody, allows);
  assert.notEqual(exitMcp["isError"], true, "MCP serves it");
  assert.deepEqual([exitMcp["structuredContent"], exitMcp["content"]], [exitDirect, [{ type: "text", text: exitText }]], "MCP serves the same output and text");
  const openRes = await post({ ...body, prediction: FUTURE }, allows);
  assert.equal(openRes.status, 400, "an OPEN under the same envelope is a 400");
  const openJson = (await openRes.json()) as Obj;
  assert.deepEqual([openJson["error"], openJson["code"]], ["tool_error", "produced_at_future"], "the gate's tool error");
  const openMcp = await mcpJudge({ ...body, prediction: FUTURE }, allows);
  assert.deepEqual([openMcp["isError"], openMcp["_meta"]], [true, { "monarkgate.tech/error_code": "produced_at_future" }], "and on MCP");

  const typed = await post({ ...body, order: { ...OPEN, amount: 100 } }, allows);
  assert.equal(typed.status, 400, "a number amount is refused at the schema");
  assert.deepEqual(((await typed.json()) as Obj)["code"], "input_invalid");
  const extra = await post({ ...body, limits: { ...LIMITS, rogue: true } }, allows);
  assert.equal(extra.status, 400, "the limits are closed");
  const unlisted = await post({ ...body, order: { ...OPEN, kind: "BURN" } }, allows);
  assert.equal(unlisted.status, 400, "a kind outside GNK1 is refused at the schema");
  const swap = await post({ ...body, order: { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "1", assetOut: "btc" } }, allows);
  assert.equal(swap.status, 400, "a SWAP with no minOut is a 400");
  assert.deepEqual([(await swap.json() as Obj)["error"]], ["tool_error"]);
  const swapMcp = await mcpJudge({ ...body, order: { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "1", assetOut: "btc" } }, allows);
  assert.deepEqual([swapMcp["isError"], swapMcp["_meta"]], [true, { "monarkgate.tech/error_code": "param_invalid" }], "and an MCP tool error param_invalid");
});

// The published output schema ties the verdict's fields, as runJudge does: an allow has no reason; a deny has one and is never
// reduce_only; and there is a gate decision or a gate error, never both and never neither. The mirror validates each output
// against it before it answers.
test("judge_output_schema_ties_the_verdict_fields", async () => {
  const tool = HARNESS_TOOLS.find((t) => t.name === JUDGE_TOOL_NAME);
  assert.ok(tool !== undefined, "judge is registered");
  const valid = async (o: unknown): Promise<boolean> => (await tool.outputStandardSchema["~standard"].validate(o)).issues === undefined;
  const allowed = await runJudge(input(), { nowMs: NOW, kernel: fake(line("allow\n")).runner });
  const exit = await runJudge(input({ params: ABSTAIN, order: { kind: "EXIT", target: "vault", asset: "btc", amount: "1" } }), { nowMs: NOW, kernel: fake(line("allow\n")).runner });
  const denied = await runJudge(input(), { nowMs: NOW, kernel: fake(line("deny venue\n")).runner });
  const none = await runJudge(input(), { nowMs: NOW });
  const refused = await runJudge(input({ prediction: FUTURE, order: EXIT }), { nowMs: NOW, kernel: fake(line("allow\n")).runner });
  const refusedDenied = await runJudge(input({ prediction: FUTURE, order: EXIT }), { nowMs: NOW, kernel: fake(line("deny venue\n")).runner });
  for (const [name, o] of [["an allow", allowed], ["an allowed EXIT, reduce_only", exit], ["a deny of the kernel", denied], ["a deny unavailable", none], ["an EXIT the gate refused", refused], ["an EXIT the gate refused, denied", refusedDenied]] as const) {
    assert.equal(await valid(o), true, `${name} validates`);
  }
  assert.equal(exit.reduce_only, true, "the EXIT case is reduce_only");
  assert.deepEqual([refused.decision, refused.gate_error?.code], [null, "produced_at_future"], "the refused case has no decision and a gate error");
  for (const [name, o] of [
    ["a deny with no reason", { ...allowed, kernel_verdict: "deny" }],
    ["an allow with a reason", { ...allowed, kernel_reason: "venue" }],
    ["a deny marked reduce_only", { ...denied, reduce_only: true }],
    ["neither a decision nor a gate error", { ...refused, gate_error: null }],
    ["both a decision and a gate error", { ...allowed, gate_error: refused.gate_error }],
    ["a gate error with a code outside the contract", { ...refused, gate_error: { code: "nope", message: "x" } }],
    // With no gate decision the order is an EXIT, so an allow is reduce_only.
    ["an allow with no gate decision, not reduce_only", { ...refused, reduce_only: false }],
  ] as const) {
    assert.equal(await valid(o), false, `${name} does not validate`);
  }
});

// A binary that no process can be made of (absent, a directory, a file that is not a program) is no run, so a deny
// `unavailable`: no kernel ran. Measured on Windows: ENOENT for the first two, UNKNOWN for the third, each with pid 0.
test("kernel_runner_runs_the_built_binary_and_no_binary_it_cannot_start", async () => {
  const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  assert.equal(KERNEL_BINARY, join(repo, "apps", "genkan", "kernel", ".lake", "build", "bin", process.platform === "win32" ? "genkan-kernel.exe" : "genkan-kernel"));
  const dir = mkdtempSync(join(tmpdir(), "harness-judge-runner-"));
  try {
    const absent = join(dir, "absent-genkan-kernel");
    const notAProgram = join(dir, process.platform === "win32" ? "not-a-kernel.exe" : "not-a-kernel");
    writeFileSync(notAProgram, "not a program\n");
    for (const [name, binary] of [["an absent binary", absent], ["a directory", dir], ["a file that is not a program", notAProgram]] as const) {
      assert.equal(await kernelRunner(binary)(new Uint8Array([1])), null, `${name} is no run`);
      const out = await runJudge(input(), { nowMs: NOW, kernel: kernelRunner(binary) });
      assert.deepEqual([out.kernel_verdict, out.kernel_reason], ["deny", "unavailable"], `${name}: a deny unavailable`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A run that starts and then fails is an answer, never an allow: the fake kernel is Node itself, which, with no argument, runs the
// script it reads on stdin, so each case's script is the request the runner writes. A run killed past its timeout, or past
// KERNEL_STDOUT_MAX bytes of stdout, has status null although its stdout begins with the allow line (asserted): only the status
// keeps it a deny, so a runner that read a null status as 0 reds here.
test("kernel_runner_reads_a_run_that_fails_as_no_allow", async () => {
  const NL = "\\n";
  const script = (s: string, timeoutMs?: number): KernelRunner => () => kernelRunner(process.execPath, timeoutMs)(new TextEncoder().encode(s));
  const CASES: [string, KernelRunner, "allow" | "deny", string | null, number | null | undefined][] = [
    ["the allow line and exit 0", script(`process.stdout.write("allow${NL}")`), "allow", null, 0],
    ["a deny line and exit 0", script(`process.stdout.write("deny venue${NL}")`), "deny", "venue", 0],
    ["the allow line, then no exit before the timeout", script(`process.stdout.write("allow${NL}"); setInterval(() => {}, 1000)`, 1500), "deny", "unreadable", null],
    ["the allow line, then stdout past its cap", script(`process.stdout.write("allow${NL}" + "x".repeat(200))`), "deny", "unreadable", null],
    ["the allow line and exit 1", script(`process.stdout.write("allow${NL}"); process.exitCode = 1`), "deny", "unreadable", 1],
    ["the allow line, then a kill by signal", script(`process.stdout.write("allow${NL}", () => process.kill(process.pid, "SIGKILL"))`), "deny", "unreadable", undefined],
    ["exit 3 and nothing written", script(`process.exit(3)`), "deny", "refused", 3],
  ];
  for (const [name, runner, verdict, reason, status] of CASES) {
    const answer = await runner(new Uint8Array(0));
    assert.ok(answer !== null, `${name}: the run started`);
    if (status !== undefined) assert.equal(answer.status, status, `${name}: its exit status`);
    if (reason === "unreadable") assert.ok(new TextDecoder().decode(answer.stdout).startsWith("allow\n"), `${name}: its stdout begins with the allow line`);
    const out = await runJudge(input(), { nowMs: NOW, kernel: runner });
    assert.deepEqual([out.kernel_verdict, out.kernel_reason, out.reduce_only], [verdict, reason, false], `${name}: the verdict read`);
  }
});
