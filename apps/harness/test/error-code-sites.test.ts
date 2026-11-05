/**
 * Harness - every refusal site pins its code, and stale comments are gone. No behaviour is at stake: the only
 * lines red at the base are the stale comments of gate.ts (the liq registry said to be empty) and of calibration.ts,
 * attestation-binding.ts and schema-projection.ts (made false by the retirement of btc-dir-15m).
 * The code pins (14 refusal sites of gate.ts that no test pinned; the default code of UkemiPredictToolError went with
 * its tool, archived at step 7 of ROADMAP.md)
 * and the three paths (a short fraction of produced_at, offset minutes, a non-tool error on MCP) are folded into
 * that one F2P test: a separate test body would be green at the base and refused by red-proof as self-confirming.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Prediction } from "@monark/contracts";
import { runGate, toolErrorCode, type HarnessParams } from "../src/tools/gate.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";
import { createHarnessHandler } from "../src/server.ts";

const P: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: "A", tool: "perps_order_preview", clockOpen: true };
const pr = (taskClass: string, yhat: string | number, at = "2026-09-04T00:00:00Z"): Prediction => ({ schema_version: SCHEMA_VERSION, task_class: taskClass, yhat, predictor_id: "caller:model", produced_at: at });
const SC = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];
const SET = (candidates: { label: string; score: number }[]): HarnessParams => ({ ...P, nMin: 5, calibration: { scores: SC, mode: "set", candidates } });

/** The code and message of a refusal (a decision fails the assertion). */
function refusal(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    return `${String(toolErrorCode(e))} :: ${e instanceof Error ? e.message : String(e)}`;
  }
  return assert.fail("expected a refusal, the call decided");
}

// killer: apps/harness/src/tools/gate.ts:360 CONST "\"param_invalid\");" -> "\"byo_calibration_invalid\");"
test("every_refusal_site_pins_its_code_and_the_stale_registry_comment_is_gone", async () => {
  // The liq honesty comment of gate.ts no longer says the registry is empty (s0 is committed).
  const src = readFileSync(new URL("../src/tools/gate.ts", import.meta.url), "utf8");
  assert.ok(!src.includes("In U-4b-2a the registry is empty"), "stale liq registry comment");
  // Comments made false by the retirement of btc-dir-15m.
  const stale: [string, string][] = [["calibration.ts", "lives in the tool description"], ["attestation-binding.ts", "TOTAL over the FOUR served"], ["schema-projection.ts", "(btc-dir / cascade) remain valid"]];
  for (const [f, t] of stale) assert.ok(!readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8").includes(t), `stale btc-dir comment: ${f}`);
  // One call per site (the gate.ts lines at f3b330cf -> 2abe801), code and message prefix pinned.
  const sites: [string, () => unknown, string][] = [
    ["303 requireFinite", () => runGate(pr("x", 1), { ...P, tau: Infinity }), "param_invalid :: invalid param 'tau': expected a finite number"],
    ["318 alpha", () => runGate(pr("x", 1), { ...P, alpha: 1.5 }), "param_invalid :: invalid param 'alpha'"],
    ["321 tauInterval", () => runGate(pr("x", 1), { ...P, tauInterval: -1 }), "param_invalid :: invalid param 'tauInterval'"],
    ["322 bFloor", () => runGate(pr("x", 1), { ...P, bFloor: -1 }), "param_invalid :: invalid param 'bFloor'"],
    ["324 tool", () => runGate(pr("x", 1), { ...P, tool: "" }), "param_invalid :: invalid param 'tool'"],
    ["327 clockOpen", () => runGate(pr("x", 1), { ...P, clockOpen: "yes" as unknown as boolean }), "param_invalid :: invalid param 'clockOpen'"],
    ["357 mode", () => runGate(pr("byo-x", 1), { ...P, calibration: { scores: SC, mode: "range" as "set" } }), "byo_calibration_invalid :: invalid calibration.mode"],
    ["363 scores cap", () => runGate(pr("byo-x", 1), { ...P, calibration: { scores: new Array<number>(100001).fill(0.5), mode: "interval" } }), "byo_calibration_invalid :: invalid calibration.scores: 100001 scores exceeds the cap"],
    ["371 score finite", () => runGate(pr("byo-x", 1), { ...P, calibration: { scores: [0.1, Number.NaN], mode: "interval" } }), "byo_calibration_invalid :: invalid calibration.scores[1]: expected a finite number"],
    ["389 candidates cap", () => runGate(pr("byo-x", "A"), SET(Array.from({ length: 100001 }, (_, i) => ({ label: `L${String(i)}`, score: 0.5 })))), "byo_calibration_invalid :: invalid calibration.candidates: 100001 exceeds"],
    ["395 label printable", () => runGate(pr("byo-x", "A"), SET([{ label: "A", score: 0.5 }, { label: "", score: 0.6 }])), "byo_calibration_invalid :: invalid calibration.candidates[1].label: expected"],
    ["398 label pipe", () => runGate(pr("byo-x", "A"), SET([{ label: "A|B", score: 0.5 }])), "byo_calibration_invalid :: invalid calibration.candidates[0].label: must not contain"],
    ["401 duplicate label", () => runGate(pr("byo-x", "A"), SET([{ label: "A", score: 0.5 }, { label: "A", score: 0.6 }])), "byo_calibration_invalid :: invalid calibration.candidates[1].label: duplicate"],
    ["886 cascade yhat", () => runGate(pr("cascade-liquidable-24h", "x"), P), "yhat_type_mismatch :: task_class 'cascade-liquidable-24h' expects a number yhat"],
  ];
  for (const [site, fn, want] of sites) assert.ok(refusal(fn).startsWith(want), `${site}: ${refusal(fn)}`);
  // Paths (a, b): a short fraction counts 500 ms; offset minutes count (tolerance 300 s after nowMs).
  const usde = (at: string): Prediction => ({ ...pr("stable-run-velocity-24h", 1e-4, at), predictor_id: USDE_STABLE_RUN_PREDICTOR_ID });
  const U: HarnessParams = { ...P, intent: 1e-4 };
  const at = (s: string, now: string): string => {
    try {
      return runGate(usde(s), U, undefined, { nowMs: Date.parse(now) }).action;
    } catch (e) {
      return String(toolErrorCode(e));
    }
  };
  assert.equal(at("2026-10-03T12:05:00.5Z", "2026-10-03T12:00:00.400Z"), "produced_at_future", ".5 is 500 ms");
  assert.equal(at("2026-10-03T12:05:00.3Z", "2026-10-03T12:00:00.400Z"), "commit");
  assert.equal(at("2026-10-03T17:34:59+05:30", "2026-10-03T12:00:00Z"), "commit", "+05:30 minutes count");
  assert.equal(at("2026-10-03T06:35:01-05:30", "2026-10-03T12:00:00Z"), "produced_at_future", "-05:30 minutes count");
  assert.equal(at("2026-09-05T05:29:60+05:30", "2026-10-03T12:00:00Z"), "commit", "leap second at 23:59:60Z through +05:30");
  // Path (c): a non-tool error thrown by a tool stays on the SDK path on MCP: isError, its text, no _meta.
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool !== undefined);
  const orig = gateTool.run;
  (gateTool as { run: unknown }).run = () => {
    throw new Error("boom");
  };
  try {
    const args = { prediction: usde("2026-09-04T00:00:00Z"), params: U };
    const res = await createHarnessHandler().fetch(new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: args } }),
    }));
    const raw = await res.text();
    const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
    const reply = JSON.parse(data === undefined ? raw : data.slice(5).trim()) as { result: Record<string, unknown> };
    assert.equal(reply.result.isError, true);
    assert.equal("_meta" in reply.result, false, "no _meta on a non-tool error");
    assert.ok(JSON.stringify(reply.result.content).includes("boom"));
  } finally {
    (gateTool as { run: unknown }).run = orig;
  }
});
