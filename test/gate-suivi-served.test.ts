/**
 * Step 6 of ROADMAP.md, end to end: the online tracking of HIKAE through the served harness. The server stands up in-process on a real
 * 127.0.0.1 listener (startServer); the MCP `tools/call` of gate over the streamable-HTTP transport and its HTTP mirror POST /gate carry
 * `params.suivi` (the USDe cell's policy, its reference evaluations and their arrived outcomes), and the decision the wire returns follows
 * the replay: no licence after 44 zeros (abstain, budget_exhausted, B_t -1), the licence at the 45th (commit, covered, B_t 0.99, the
 * budget at the opening, floor(10^9 (1 - 1/100)) / 10^9). Both surfaces agree. A refused evidence (another cell, or past the
 * replay's work bound) is a tool error with the code param_invalid; an evidence outside its schema is a 400 input_invalid at the
 * mirror. Expected values by hand:
 * packages/hikae/test/suivi-replay.test.ts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import type { Server as HttpServer } from "node:http";
import { startServer } from "../apps/harness/src/server.ts";
import { startLoopback } from "./helpers/loopback.ts";
import { GATE_PARAMS, HOST_API, USDE_PREDICTION, mcpToolsCall, mirrorCall } from "./h5-trace-builder.ts";

const W4 = ["1/4", "1/4", "1/4", "1/4"];
/** The sealed settings of the USDe cell (the fixture of packages/hikae/test/suivi-o4.test.ts), keyring empty. */
const FIX = { schema: "hikae-suivi-policy-v1", task_class: USDE_PREDICTION.task_class, cell_key: USDE_PREDICTION.predictor_id,
  population: "usde-consecutive-calm-pairs-v1", policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100",
  m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000", restart_weights: "1/(j(j+1))",
  bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 }, bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 },
  bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1, grid_ms: 86400000, l_ms: 37800000, thin_window: 90,
  thin_min: 30, keyring: [] } as const;
const T0 = 1_790_000_000_000;
/** n zeros: n reference evaluations on the grid and their resolved outcomes, all members, none a miss. */
function zeros(n: number): { evaluations: unknown[]; outcomes: unknown[] } {
  const seqs = Array.from({ length: n }, (_, i) => i);
  return {
    evaluations: seqs.map((seq) => ({ seq, t_step_ms: T0 + seq * FIX.grid_ms, yhat_ref: "0.0001", produced_at_ref: "2026-11-01T00:00:00Z", pre_member: true })),
    outcomes: seqs.map((seq) => ({ seq, resolved: true, member: true, miss: 0 })),
  };
}
const args = (suivi: unknown) => ({ prediction: USDE_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: 1, intent: 0.0001, suivi } });

/** A raw POST to the mirror (`api.` Host): its status and JSON body, whatever the status. */
function postApi(port: number, path: string, body: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const text = JSON.stringify(body);
    const req = httpRequest({ host: "127.0.0.1", port, path, method: "POST", headers: { host: HOST_API, "content-type": "application/json",
      accept: "application/json", "content-length": Buffer.byteLength(text) } }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode ?? 0, json: JSON.parse(data) as Record<string, unknown> });
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      });
    });
    req.on("error", reject);
    req.end(text);
  });
}

async function withServer(fn: (port: number) => Promise<void>): Promise<void> {
  const server: HttpServer = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    if (addr === null || typeof addr === "string") throw new Error("startServer did not yield an AddressInfo");
    await fn(addr.port);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
}

const decisionOf = (structured: Record<string, unknown>) => [structured["action"], structured["reason"], structured["remaining_budget"]];

test("served_gate_follows_the_replayed_tracking_on_both_surfaces", async () => {
  await withServer(async (port) => {
    const before = { policy: FIX, ...zeros(44), open: false }, at = { policy: FIX, ...zeros(45), open: false };
    const mcpBefore = await mcpToolsCall(port, 1, "gate", args(before));
    assert.deepEqual(decisionOf(mcpBefore.structuredContent), ["abstain", "budget_exhausted", -1], "44 zeros: no licence");
    const mcpAt = await mcpToolsCall(port, 2, "gate", args(at));
    assert.deepEqual(decisionOf(mcpAt.structuredContent), ["commit", "covered", 0.99], "the 45th zero licenses");
    const without = await mcpToolsCall(port, 3, "gate", { prediction: USDE_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: 1, intent: 0.0001 } });
    assert.deepEqual(decisionOf(without.structuredContent), ["commit", "covered", 1], "no evidence: the caller's budget");
    // The mirror serves the same decisions, byte for byte.
    assert.deepEqual((await mirrorCall(port, "/gate", args(before))).structuredContent, mcpBefore.structuredContent);
    assert.deepEqual((await mirrorCall(port, "/gate", args(at))).structuredContent, mcpAt.structuredContent);
  });
});

test("served_gate_refuses_a_bad_evidence_on_both_surfaces", async () => {
  await withServer(async (port) => {
    const otherCell = { policy: { ...FIX, cell_key: "kata:other" }, ...zeros(2), open: true };
    const mcp = await mcpToolsCall(port, 1, "gate", args(otherCell)) as unknown as { isError?: boolean; _meta?: Record<string, unknown> };
    assert.equal(mcp.isError, true, "a tool error over MCP");
    assert.equal(mcp._meta?.["monarkgate.tech/error_code"], "param_invalid");
    const http = await postApi(port, "/gate", args(otherCell));
    assert.deepEqual([http.status, http.json["code"]], [400, "param_invalid"]);
    assert.ok(String(http.json["message"]).startsWith("invalid param 'suivi': the policy's cell_key"), String(http.json["message"]));
    // Outside its schema: an extra key in the evidence, a miss that is not 0 or 1, more evaluations than the bound, a rational text
    // of more than 20 characters.
    for (const bad of [{ ...otherCell, extra: true }, { policy: FIX, evaluations: [], outcomes: [{ seq: 0, resolved: true, member: true, miss: 2 }], open: true },
      { policy: FIX, ...zeros(501), open: true }, { policy: { ...FIX, delta_exh: `1/${"9".repeat(19)}` }, ...zeros(2), open: true }]) {
      const r = await postApi(port, "/gate", args(bad));
      assert.deepEqual([r.status, r.json["code"]], [400, "input_invalid"]);
    }
    // Inside its schema but past the replay's work bound: W's bet 1/97 gives L = 9 bits, and 401 evaluations by 9 bits pass 3600.
    const heavy = { policy: { ...FIX, bets_k: { lambdas: ["1/2"], weights: ["1"] }, bets_w: { lambdas: ["1/97"], weights: ["1"] } },
      evaluations: zeros(401).evaluations, outcomes: zeros(2).outcomes, open: false };
    const work = await postApi(port, "/gate", args(heavy));
    assert.deepEqual([work.status, work.json["code"]], [400, "param_invalid"]);
    assert.ok(String(work.json["message"]).startsWith("invalid param 'suivi': the replay's work, 401 evaluations by 9 bits"), String(work.json["message"]));
  });
});
