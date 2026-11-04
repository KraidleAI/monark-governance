/**
 * Harness — the asynchronous runner of Genkan's kernel (src/kernel.ts) and its limit of kernels at once. The fake kernel is Node
 * itself, which, with no argument, runs the script it reads on stdin, so each case's script is the request the runner writes. The
 * real kernel runs in judge.kernel.test.ts and paper.kernel.test.ts (test:genkan).
 *
 * What is held here: the runner answers each run as the synchronous run of the earlier runner did (spawnSync, its options kept here
 * as the reference); a kernel does not hold the event loop, so the server answers another call while one runs; the timeout kills
 * the process; a kernel that reads none of its stdin is an answer, not a crash; and the limit holds, the kernel in excess waiting
 * its turn, first come first served.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { request as httpRequest, type Server } from "node:http";
import { join } from "node:path";
import { readVerdict } from "@monark/genkan/frame";
import { kernelRunner, limitedKernel, KERNEL_MAX_CONCURRENT, KERNEL_STDOUT_MAX, KERNEL_TIMEOUT_MS } from "../src/kernel.ts";
import type { KernelAnswer, KernelRunner } from "../src/tools/judge.ts";
import { startServer } from "../src/server.ts";
import { SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";
import { startLoopback } from "./helpers/loopback.ts";

const NL = "\\n";
const encode = (s: string): Uint8Array => new TextEncoder().encode(s);
const decode = (b: Uint8Array): string => new TextDecoder().decode(b);

/** The runner before this lot: one spawnSync, its options as they were. The reference of the parity test. */
function syncReference(binary: string, request: Uint8Array, timeoutMs: number = KERNEL_TIMEOUT_MS): KernelAnswer {
  const run = spawnSync(binary, [], { input: request, env: {}, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "ignore"], timeout: timeoutMs, maxBuffer: KERNEL_STDOUT_MAX });
  if (run.error !== undefined && run.pid === 0) return null;
  return { status: run.status, stdout: new Uint8Array(run.stdout) };
}

/** A deferred: a promise and the function that settles it. */
function deferred<T>(): { readonly promise: Promise<T>; readonly resolve: (v: T) => void; readonly reject: (e: unknown) => void } {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// Each run the earlier runner made, the asynchronous one answers alike: the same exit status, the same verdict read, and the same
// stdout when the run ends by itself. A run past the timeout or past KERNEL_STDOUT_MAX bytes has status null in both (spawnSync's
// ETIMEDOUT and ENOBUFS), its stdout beginning with the allow line: only the status keeps it a deny. One run the two answer apart,
// held below (a_kernel_whose_stdout_outlives_it_is_cut_at_its_timeout): a kernel that exits 0 but leaves its stdout open past the
// timeout, which spawnSync answered status 0 (an allow, had it written the allow line) and the runner answers status null.
test("kernel_runner_answers_each_run_as_the_synchronous_runner_did", async () => {
  const CASES: [string, string, number | undefined][] = [
    ["the allow line and exit 0", `process.stdout.write("allow${NL}")`, undefined],
    ["a deny line and exit 0", `process.stdout.write("deny venue${NL}")`, undefined],
    ["exactly KERNEL_STDOUT_MAX bytes and exit 0", `process.stdout.write("allow${NL}" + "x".repeat(${String(KERNEL_STDOUT_MAX - 6)}))`, undefined],
    ["the allow line, then no exit before the timeout", `process.stdout.write("allow${NL}"); setInterval(() => {}, 1000)`, 3000],
    ["the allow line, then stdout past its cap", `process.stdout.write("allow${NL}" + "x".repeat(200))`, undefined],
    ["the allow line, then stdout far past its cap", `process.stdout.write("allow${NL}" + "x".repeat(200000))`, undefined],
    ["the allow line and exit 1", `process.stdout.write("allow${NL}"); process.exitCode = 1`, undefined],
    ["the allow line, then a kill by signal", `process.stdout.write("allow${NL}", () => process.kill(process.pid, "SIGKILL"))`, undefined],
    ["exit 3 and nothing written", `process.exit(3)`, undefined],
  ];
  for (const [name, script, timeoutMs] of CASES) {
    const before = syncReference(process.execPath, encode(script), timeoutMs);
    const now = await kernelRunner(process.execPath, timeoutMs)(encode(script));
    assert.ok(before !== null && now !== null, `${name}: both runs started`);
    assert.equal(now.status, before.status, `${name}: the same exit status`);
    assert.deepEqual(readVerdict(now.status, now.stdout), readVerdict(before.status, before.stdout), `${name}: the same verdict read`);
    if (before.status === null) {
      assert.ok(decode(now.stdout).startsWith("allow\n") && decode(before.stdout).startsWith("allow\n"), `${name}: both stdouts begin with the allow line`);
    } else {
      assert.deepEqual(now.stdout, before.stdout, `${name}: the same stdout`);
    }
  }
});

// The run is asynchronous: while a kernel runs, a timer of the server's process fires. Under spawnSync it could not.
test("a_kernel_run_does_not_hold_the_event_loop", async () => {
  let fired = false;
  const timer = setTimeout(() => { fired = true; }, 50);
  const answer = await kernelRunner(process.execPath)(encode(`setTimeout(() => process.stdout.write("allow${NL}"), 1000)`));
  clearTimeout(timer);
  assert.ok(fired, "a timer fired while the kernel ran");
  assert.deepEqual(answer === null ? null : readVerdict(answer.status, answer.stdout), { allow: true }, "and the kernel's answer is read");
});

// Past the timeout the runner kills the process: the run answers status null, its stdout the allow line, and the process is gone.
test("the_timeout_kills_the_kernel_and_answers_as_before", async () => {
  const script = `process.stdout.write("allow${NL}" + String(process.pid) + "${NL}"); setInterval(() => {}, 1000)`;
  const t0 = Date.now();
  const answer = await kernelRunner(process.execPath, 3000)(encode(script));
  const took = Date.now() - t0;
  assert.ok(answer !== null, "the run started");
  assert.equal(answer.status, null, "a killed run has status null");
  assert.deepEqual(readVerdict(answer.status, answer.stdout), readVerdict(null, encode("allow\n")), "read as unreadable, never as an allow");
  assert.ok(took >= 3000 && took < 3000 + 5000, `killed at its timeout (took ${String(took)} ms)`);
  const [first, pidText] = decode(answer.stdout).split("\n");
  assert.equal(first, "allow");
  const pid = Number(pidText);
  assert.ok(Number.isSafeInteger(pid) && pid > 0, `the kernel wrote its pid (${String(pidText)})`);
  let alive = true;
  for (let i = 0; i < 40 && alive; i++) {
    try {
      process.kill(pid, 0);
      await new Promise((r) => setTimeout(r, 50));
    } catch {
      alive = false;
    }
  }
  assert.equal(alive, false, "the process is gone");
});

// A kernel that writes the allow line and exits 0, but leaves a descendant that holds its stdout open past the timeout: the run is
// cut at its timeout, not when the pipe closes, and has status null, read as unreadable. Waiting for the pipe would hold the call
// (and its place under the limit) for as long as the descendant lives; reading its exit 0 would serve an allow on a timed-out run.
test("a_kernel_whose_stdout_outlives_it_is_cut_at_its_timeout", async () => {
  const exe = JSON.stringify(process.execPath);
  const script =
    `const { spawn } = require("node:child_process");` +
    `const d = spawn(${exe}, ["-e", "setTimeout(() => {}, 6000)"], { stdio: ["ignore", "inherit", "ignore"], detached: true, windowsHide: true });` +
    `d.unref(); process.stdout.write("allow${NL}");`;
  const t0 = Date.now();
  const answer = await kernelRunner(process.execPath, 2000)(encode(script));
  const took = Date.now() - t0;
  assert.ok(answer !== null, "the run started");
  assert.equal(answer.status, null, "a run cut at its timeout has status null, whatever its exit");
  assert.deepEqual(readVerdict(answer.status, answer.stdout), readVerdict(null, encode("allow\n")), "read as unreadable, never as an allow");
  assert.ok(took >= 2000 && took < 4500, `cut at its timeout, long before the descendant ends (took ${String(took)} ms)`);
});

// A kernel that exits without reading its stdin (here a program that reads none) makes the write of a long request fail (EPIPE):
// that is the run's own matter, an answer, never an error that stops the server.
test("a_kernel_that_reads_no_stdin_is_an_answer_not_a_crash", async () => {
  const binary = process.platform === "win32" ? join(process.env["SystemRoot"] ?? "C:\\Windows", "System32", "hostname.exe") : "/bin/true";
  const answer = await kernelRunner(binary)(new Uint8Array(4 * 1024 * 1024));
  assert.ok(answer !== null, "the run started");
  assert.equal(answer.status, 0, "and ended by itself");
  assert.equal(readVerdict(answer.status, answer.stdout).allow, false, "its answer is no allow");
});

// The limit: at most `max` runs at once; the run in excess waits, and starts when one ends, first come first served; a run that
// fails frees its place as one that answers does; each caller gets its own answer.
test("the_limit_holds_and_the_kernel_in_excess_waits", async () => {
  const calls: { readonly request: Uint8Array; readonly done: ReturnType<typeof deferred<KernelAnswer>> }[] = [];
  let running = 0;
  let most = 0;
  const parked: KernelRunner = async (request) => {
    running++;
    most = Math.max(most, running);
    const done = deferred<KernelAnswer>();
    calls.push({ request, done });
    try {
      return await done.promise;
    } finally {
      running--;
    }
  };
  const limited = limitedKernel(parked, 2);
  const tick = (): Promise<void> => new Promise((r) => setImmediate(r));
  const answers = Promise.allSettled([0, 1, 2, 3, 4].map((i) => limited(new Uint8Array([i]))));
  await tick();
  assert.deepEqual(calls.map((c) => c.request[0]), [0, 1], "two runs start; three wait");
  calls[1]?.done.resolve({ status: 0, stdout: encode("deny venue\n") });
  await tick();
  assert.deepEqual(calls.map((c) => c.request[0]), [0, 1, 2], "one ends: the first waiting starts");
  calls[0]?.done.reject(new Error("a run that fails"));
  await tick();
  assert.deepEqual(calls.map((c) => c.request[0]), [0, 1, 2, 3], "a run that fails frees its place too");
  calls[2]?.done.resolve({ status: 0, stdout: encode("allow2") });
  calls[3]?.done.resolve({ status: 0, stdout: encode("allow3") });
  await tick();
  assert.deepEqual(calls.map((c) => c.request[0]), [0, 1, 2, 3, 4], "the last waiting starts");
  calls[4]?.done.resolve(null);
  const settled = await answers;
  assert.equal(most, 2, "never more than two at once");
  assert.equal(running, 0, "none left running");
  assert.equal(settled[0]?.status, "rejected", "the failed run's caller gets its failure");
  assert.deepEqual(settled.slice(1).map((s) => (s.status === "fulfilled" ? (s.value === null ? null : decode(s.value.stdout)) : s.status)), ["deny venue\n", "allow2", "allow3", null], "each caller its own answer");
  assert.throws(() => limitedKernel(parked, 0), RangeError, "a limit is a positive integer");
  assert.throws(() => limitedKernel(parked, 1.5), RangeError, "a limit is a positive integer");
});

// The served limit, measured on a Ryzen 9 3900X (24 threads, Windows): the kernel answers in about 30 ms alone, and in about the
// same time four at once; at eight, the median run takes about 37 ms, at twelve 47 ms.
test("the_served_limit_is_four_kernels_at_once", () => {
  assert.equal(KERNEL_MAX_CONCURRENT, 4);
});

const PRED = { schema_version: SCHEMA_VERSION, task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: "2026-09-04T00:00:00Z" };
const COMMIT: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } };
const LIMITS = { venues: ["venue:a", "vault"], assets: [{ asset: "btc", cap: "100" }] };

function post(port: number, host: string, path: string, body: string): Promise<{ readonly status: number; readonly raw: string; readonly at: number }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { hostname: "127.0.0.1", port, path, method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), accept: "application/json, text/event-stream", host } },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (c: string) => { raw += c; });
        res.on("end", () => { resolve({ status: res.statusCode ?? 0, raw, at: performance.now() }); });
      },
    );
    req.on("error", reject);
    req.end(body);
  });
}

// While one judge call's kernel runs (a process that answers after 3 s), the server answers gate on both surfaces, then the judge
// call gets its kernel's verdict.
test("the_server_answers_another_call_while_a_kernel_runs", { timeout: 30_000 }, async () => {
  const started = deferred<undefined>();
  const slow: KernelRunner = (request) => {
    started.resolve(undefined);
    void request;
    return kernelRunner(process.execPath)(encode(`setTimeout(() => process.stdout.write("allow${NL}"), 3000)`));
  };
  const server: Server = await startLoopback((port) => startServer(port, undefined, undefined, slow));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const order = { kind: "OPEN", target: "venue:a", asset: "btc", amount: "1" };
    const judging = post(addr.port, "api.monarkgate.tech", "/judge", JSON.stringify({ prediction: PRED, params: COMMIT, order, limits: LIMITS }));
    await started.promise;
    const gate = await post(addr.port, "api.monarkgate.tech", "/gate", JSON.stringify({ prediction: PRED, params: COMMIT }));
    const rpc = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: { prediction: PRED, params: COMMIT } } });
    const mcp = await post(addr.port, "mcp.monarkgate.tech", "/", rpc);
    const judged = await judging;
    assert.equal(gate.status, 200, `the mirror answers gate\n${gate.raw}`);
    assert.equal(mcp.status, 200, `MCP answers gate\n${mcp.raw}`);
    assert.ok(gate.at < judged.at && mcp.at < judged.at, "both before the kernel's answer");
    assert.equal(judged.status, 200, `judge is served\n${judged.raw}`);
    const out = (JSON.parse(judged.raw) as { structuredContent: Record<string, unknown> }).structuredContent;
    assert.deepEqual([out["kernel_verdict"], out["kernel_reason"]], ["allow", null], "with its kernel's verdict");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});
