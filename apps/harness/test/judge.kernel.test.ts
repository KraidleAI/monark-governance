/**
 * Harness — the `judge` tool on Genkan's real kernel (step 5 of ROADMAP.md): the served path end to end. The file builds the kernel
 * in place with `lake.mjs build genkan-kernel` (the binary that startServer runs by default, apps/genkan/kernel/.lake/build/bin, as
 * CI's Lean job builds it before it runs test:genkan), starts the server on a loopback port with its defaults, and posts orders to
 * POST /judge on the api. host and to the MCP tool on the mcp. host: each answer is the kernel's line for that order under the
 * gate's own action (under abstain for an EXIT whose envelope the gate refuses), written by hand from the rules of
 * apps/genkan/README.md. It runs in test:genkan only (the file name ends
 * .kernel.test.ts, which `npm test` leaves out). With ELAN_HOME unset or blank and CI unset or false, every test is skipped; with CI
 * set, a missing ELAN_HOME or a home without the pinned lake fails. The temp dir of the wrapper is GENKAN_TMP, a fresh dir.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { request as httpRequest, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { startServer } from "../src/server.ts";
import { KERNEL_BINARY } from "../src/kernel.ts";
import { judgeRequest, type JudgeLimits, type JudgeOrder } from "../src/tools/judge.ts";
import { runGate, SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";
import { startLoopback } from "./helpers/loopback.ts";

const LAKE = fileURLToPath(new URL("../../genkan/scripts/lake.mjs", import.meta.url));
const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const LAKE_EXE = process.platform === "win32" ? "lake.exe" : "lake";
const envValue = (name: string): string | undefined => {
  const v = process.env[name];
  return v === undefined || v.trim() === "" ? undefined : v;
};
const ELAN_HOME = envValue("ELAN_HOME");
const CI_VALUE = envValue("CI");
const ON_CI = CI_VALUE !== undefined && CI_VALUE.trim().toLowerCase() !== "false";
const SKIP: string | false = ELAN_HOME === undefined && !ON_CI ? "ELAN_HOME is unset and CI is not set: this test needs the pinned Lean 4.32.1 toolchain under ELAN_HOME" : false;

const TMP = mkdtempSync(join(tmpdir(), "harness-judge-kernel-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

/** Builds the kernel in place with the pinned lake; the binary startServer runs by default must then exist. */
function buildInPlace(): void {
  assert.ok(ELAN_HOME !== undefined, `CI is set (CI=${String(CI_VALUE)}) and ELAN_HOME is not: this test needs ELAN_HOME, the home of the pinned toolchain`);
  const lake = join(ELAN_HOME, "toolchains", TOOLCHAIN, "bin", LAKE_EXE);
  assert.ok(existsSync(lake), `ELAN_HOME=${ELAN_HOME} holds no pinned lake at ${lake}`);
  const b = spawnSync(process.execPath, [LAKE, "build", "genkan-kernel"], { env: { ...process.env, ELAN_HOME, GENKAN_TMP: TMP }, encoding: "utf8", stdio: "pipe", timeout: 240_000 });
  assert.equal(b.status, 0, `the kernel builds in place\nstatus=${String(b.status)} error=${b.error?.message ?? "none"}\n${b.stdout}\n${b.stderr}`);
  assert.ok(existsSync(KERNEL_BINARY), `the build writes ${KERNEL_BINARY}`);
}

function wiredPost(port: number, host: string, path: string, body: string): Promise<{ status: number; raw: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { hostname: "127.0.0.1", port, path, method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), accept: "application/json, text/event-stream", host } },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (c: string) => { raw += c; });
        res.on("end", () => { resolve({ status: res.statusCode ?? 0, raw }); });
      },
    );
    req.on("error", reject);
    req.end(body);
  });
}

const PRED = { schema_version: SCHEMA_VERSION, task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: "2026-09-04T00:00:00Z" };
const COMMIT: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } };
const DEFER: HarnessParams = { ...COMMIT, tauInterval: 1 };
const ABSTAIN: HarnessParams = { ...COMMIT, nMin: 50 };
const LIMITS: JudgeLimits = { venues: ["venue:a", "vault"], assets: [{ asset: "btc", cap: "100" }, { asset: "usdc", cap: "5000" }] };
const MAX_U128 = "340282366920938463463374607431768211455";
const SWAP: JudgeOrder = { kind: "SWAP", target: "venue:a", asset: "usdc", amount: "5000", assetOut: "btc", minOut: "1" };
/** [name, params, order, kernel_verdict, kernel_reason, reduce_only]: the kernel's line for each order, from the rules. */
const CASES: [string, HarnessParams, JudgeOrder, "allow" | "deny", string | null, boolean][] = [
  ["an OPEN at its cap under commit", COMMIT, { kind: "OPEN", target: "venue:a", asset: "btc", amount: "100" }, "allow", null, false],
  ["an OPEN over its cap", COMMIT, { kind: "OPEN", target: "venue:a", asset: "btc", amount: "101" }, "deny", "over-cap", false],
  ["an OPEN under defer", DEFER, { kind: "OPEN", target: "venue:a", asset: "btc", amount: "1" }, "deny", "not-commit", false],
  ["an OPEN under abstain", ABSTAIN, { kind: "OPEN", target: "venue:a", asset: "btc", amount: "1" }, "deny", "not-commit", false],
  ["an EXIT under abstain, any asset and amount", ABSTAIN, { kind: "EXIT", target: "vault", asset: "eth", amount: MAX_U128 }, "allow", null, true],
  ["an EXIT on an unlisted venue", ABSTAIN, { kind: "EXIT", target: "venue:b", asset: "btc", amount: "1" }, "deny", "venue", false],
  ["a TRANSFER", COMMIT, { kind: "TRANSFER", target: "venue:a", asset: "btc", amount: "1" }, "deny", "kind", false],
  ["an APPROVE", COMMIT, { kind: "APPROVE", target: "venue:a", asset: "btc", amount: "1" }, "deny", "kind", false],
  ["an OPEN on an unlisted venue", COMMIT, { kind: "OPEN", target: "venue:b", asset: "btc", amount: "1" }, "deny", "venue", false],
  ["an OPEN of an unlisted asset", COMMIT, { kind: "OPEN", target: "venue:a", asset: "eth", amount: "1" }, "deny", "asset", false],
  ["a SWAP within its cap", COMMIT, SWAP, "allow", null, false],
  ["a SWAP to an unlisted asset", COMMIT, { ...SWAP, assetOut: "sol" }, "deny", "asset-out", false],
  ["a SWAP with minOut 0", COMMIT, { ...SWAP, minOut: "0" }, "deny", "min-out", false],
];

test("judge_runs_the_built_kernel_through_the_served_server", { skip: SKIP, timeout: 280_000 }, async () => {
  buildInPlace();
  const server: Server = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    for (const [name, params, order, verdict, reason, reduceOnly] of CASES) {
      const res = await wiredPost(addr.port, "api.monarkgate.tech", "/judge", JSON.stringify({ prediction: PRED, params, order, limits: LIMITS }));
      assert.equal(res.status, 200, `${name}: served\n${res.raw}`);
      const out = (JSON.parse(res.raw) as { structuredContent: Record<string, unknown> }).structuredContent;
      assert.deepEqual([out["kernel_verdict"], out["kernel_reason"], out["reduce_only"]], [verdict, reason, reduceOnly], `${name}: the kernel's verdict`);
      const action = runGate(PRED, params).action;
      assert.equal((out["decision"] as { action: string }).action, action, `${name}: the gate's action`);
      assert.equal(out["kernel_request_sha256"], createHash("sha256").update(judgeRequest(action, order, LIMITS)).digest("hex"), `${name}: the request handed to the kernel`);
    }
    // All the cases at once, twice over (26 calls, past the limit of KERNEL_MAX_CONCURRENT kernels at once): the calls past the
    // limit wait their turn, and each gets its own kernel's verdict, as one at a time.
    const burst = await Promise.all([...CASES, ...CASES].map(([, params, order]) => wiredPost(addr.port, "api.monarkgate.tech", "/judge", JSON.stringify({ prediction: PRED, params, order, limits: LIMITS }))));
    burst.forEach((res, i) => {
      const c = CASES[i % CASES.length];
      assert.ok(c !== undefined);
      const [name, , , verdict, reason, reduceOnly] = c;
      assert.equal(res.status, 200, `${name}, at once: served\n${res.raw}`);
      const out = (JSON.parse(res.raw) as { structuredContent: Record<string, unknown> }).structuredContent;
      assert.deepEqual([out["kernel_verdict"], out["kernel_reason"], out["reduce_only"]], [verdict, reason, reduceOnly], `${name}, at once: the kernel's verdict`);
    });
    // An EXIT under an envelope the gate refuses (a produced_at long after the server clock) is judged by the kernel with no gate
    // decision, under abstain; an OPEN under it is the gate's tool error, and no kernel runs.
    const future = { ...PRED, produced_at: "2999-01-01T00:00:00Z" };
    for (const [name, order, verdict, reason, reduceOnly] of [
      ["an EXIT on a listed venue", { kind: "EXIT", target: "vault", asset: "btc", amount: "7" }, "allow", null, true],
      ["an EXIT on an unlisted venue", { kind: "EXIT", target: "venue:b", asset: "btc", amount: "7" }, "deny", "venue", false],
    ] as const) {
      const res = await wiredPost(addr.port, "api.monarkgate.tech", "/judge", JSON.stringify({ prediction: future, params: COMMIT, order, limits: LIMITS }));
      assert.equal(res.status, 200, `${name}, the gate refusing: served\n${res.raw}`);
      const out = (JSON.parse(res.raw) as { structuredContent: Record<string, unknown> }).structuredContent;
      assert.deepEqual([out["decision"], (out["gate_error"] as { code: string } | null)?.code], [null, "produced_at_future"], `${name}: no gate decision, the gate's refusal`);
      assert.deepEqual([out["kernel_verdict"], out["kernel_reason"], out["reduce_only"]], [verdict, reason, reduceOnly], `${name}: the kernel's verdict`);
      assert.equal(out["kernel_request_sha256"], createHash("sha256").update(judgeRequest("abstain", order, LIMITS)).digest("hex"), `${name}: the request under abstain`);
    }
    const open = await wiredPost(addr.port, "api.monarkgate.tech", "/judge", JSON.stringify({ prediction: future, params: COMMIT, order: { kind: "OPEN", target: "venue:a", asset: "btc", amount: "1" }, limits: LIMITS }));
    assert.equal(open.status, 400, `an OPEN, the gate refusing: a 400\n${open.raw}`);
    assert.deepEqual([(JSON.parse(open.raw) as { error: string; code: string }).error, (JSON.parse(open.raw) as { code: string }).code], ["tool_error", "produced_at_future"], "the gate's tool error");
    const rpc = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "judge", arguments: { prediction: PRED, params: ABSTAIN, order: { kind: "EXIT", target: "vault", asset: "btc", amount: "7" }, limits: LIMITS } } });
    const mcp = await wiredPost(addr.port, "mcp.monarkgate.tech", "/", rpc);
    assert.equal(mcp.status, 200, `MCP serves judge\n${mcp.raw}`);
    const data = mcp.raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
    const result = (JSON.parse(data === undefined ? mcp.raw : data.slice("data:".length).trim()) as { result: { structuredContent: Record<string, unknown> } }).result.structuredContent;
    assert.deepEqual([result["kernel_verdict"], result["kernel_reason"], result["reduce_only"]], ["allow", null, true], "MCP: an EXIT under abstain is allowed, reduce-only");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});
