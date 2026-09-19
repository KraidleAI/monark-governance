// UKEMI (ADR-U1 D3/D4/D9 hardening 2026-09-19 + checkpoint-2 V-1 2026-09-19) — oracles for the record.ts / rpc2.ts
// recorder hardening: a BOUNDED transient retry (HTTP 429/5xx and network/timeout, never infinite); a typed
// JSON-RPC error is the node's deterministic answer and is NEVER retried; a range-too-large HTTP 400 body is
// surfaced so getLogsVia splits the range; a structured, secret-free per-provider error log; and the CLI parser.
// V-1 additions: (a) the extracted cross-platform run-guard isMainModule; (b) a retry-bound oracle that reds FAST
// (never hangs) under an unbounded-loop mutant; (c) the capped backoff delay; (d) a non-JSON 200 guard; (e) a
// drpc free-plan 400 benches without splitting; (f) getLogsRange dedups a chunk-cut boundary. globalThis.fetch is
// stubbed (fully typed, restored in a finally). No network here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeDefaultCall, parseUkemiArgs, isMainModule, backoffDelay, type RpcErrorRecord } from "../src/ukemi/record.ts";
import { makeUkemiPool, RpcError, type LogEntry } from "../src/ukemi/rpc2.ts";
import { fileURLToPath } from "node:url";

const jsonResp = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** Install a typed fetch stub for the duration of `body`, always restoring the original. `handler` receives the
 *  0-based attempt index, the parsed JSON-RPC request, and the URL, and returns the Response to serve. */
async function withFetch(handler: (attempt: number, req: { id: number; method: string; params: unknown[] }, url: string) => Response, body: () => Promise<void>): Promise<void> {
  const original = globalThis.fetch;
  let attempt = -1;
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    attempt++;
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { id: number; method: string; params: unknown[] };
    return Promise.resolve(handler(attempt, req, String(input)));
  };
  globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = original; }
}

// A transient 429 then 503 then 200 ⇒ the bounded retry recovers within one call (total attempts = retries + 1).
test("ukemi_record_retries_transient_http", async () => {
  await withFetch((attempt, req) => {
    if (attempt === 0) return jsonResp({ error: "rate" }, 429);
    if (attempt === 1) return jsonResp({ error: "busy" }, 503);
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: "0x2a" });
  }, async () => {
    const call = makeDefaultCall({ retries: 2, backoffMs: 0 });
    const v = await call("https://one.example", "eth_call", [{ to: "0x0", data: "0x0" }]);
    assert.equal(v, "0x2a", "a transient 429/5xx is retried and recovers within the retry budget");
  });
});

// The retry is BOUNDED (V-1(b), AM-1): the stub serves 503 for attempts 0..retries (the 3 a bounded loop reaches)
// and a VALID 200 only on the 4th attempt. A bounded loop throws on the 3rd 503 and never reaches the success, so
// it rejects and count===3. An UNBOUNDED loop (mutant R2) keeps going, reaches the 4th attempt, RESOLVES "0x2a",
// and BOTH assertions fail FAST — the promise settles, the process exits, nothing hangs. (The old stub served 503
// forever, so R2 pended the event loop for minutes; --test-timeout alone reports a fail without terminating it.)
test("ukemi_record_retry_is_bounded", async () => {
  const RETRIES = 2;
  let count = 0;
  await withFetch((attempt, req) => {
    count++;
    if (attempt <= RETRIES) return jsonResp({ error: "down" }, 503); // attempts 0,1,2 — every attempt a bounded loop makes
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: "0x2a" });   // attempt 3 (the 4th) — only an unbounded loop gets here
  }, async () => {
    const call = makeDefaultCall({ retries: RETRIES, backoffMs: 0 });
    await assert.rejects(() => call("https://one.example", "eth_call", [{ to: "0x0", data: "0x0" }]), /HTTP 503/, "a bounded loop rejects on the 3rd 503, never reaching the 4th-attempt success");
  });
  assert.equal(count, 3, "retries=2 ⇒ exactly 3 attempts, then fail (bounded, never infinite)");
});

// A JSON-RPC {error:{code}} is the node's deterministic answer: NEVER retried (a revert cannot become a success).
test("ukemi_record_does_not_retry_rpc_error", async () => {
  let count = 0;
  await withFetch((_a, req) => { count++; return jsonResp({ jsonrpc: "2.0", id: req.id, error: { code: 3, message: "execution reverted" } }); }, async () => {
    const call = makeDefaultCall({ retries: 5, backoffMs: 0 });
    await assert.rejects(() => call("https://one.example", "eth_call", [{ to: "0x0", data: "0x0" }]), (e: unknown) => e instanceof RpcError && e.code === 3);
  });
  assert.equal(count, 1, "a typed JSON-RPC error is classified, not retried (exactly one attempt)");
});

// A range-too-large HTTP 400 body is surfaced in the thrown message so getLogsVia splits the range recursively.
test("ukemi_record_get_logs_splits_on_http400_range", async () => {
  const log = (n: number): LogEntry => ({ blockNumber: "0x" + n.toString(16), logIndex: "0x0", transactionHash: "0x" + n.toString(16).padStart(64, "0"), topics: ["0xtopic"], data: "0x" });
  await withFetch((_a, req) => {
    const p = (req.params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
    const from = parseInt(p.fromBlock, 16); const to = parseInt(p.toBlock, 16);
    if (to - from > 5000) return jsonResp({ error: "block range too large" }, 400); // provider caps ranges > 5000 blocks
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: [log(from)] });
  }, async () => {
    const call = makeDefaultCall({ retries: 0, backoffMs: 0 });
    const eps = ["https://one.example", "https://two.example"];
    const pool = makeUkemiPool({ call, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: 0 });
    // getLogsVia sees "HTTP 400 …: {"error":"block range too large"}" (isResultLimit matches "block range"/"too large") and splits.
    const logs = await pool.getLogsRange("0xabc", ["0xtopic"], 1_000_000, 1_020_000);
    assert.ok(logs.length > 0, "the wide range was split on the HTTP 400 range signal and served in pieces");
  });
});

// The structured per-provider error log is secret-free (registrable domain, not the URL) and carries code/message.
test("ukemi_record_logs_structured_errors", async () => {
  const records: RpcErrorRecord[] = [];
  await withFetch((_a, req) => jsonResp({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: "header not found" } }), async () => {
    const call = makeDefaultCall({ retries: 0, onRpcError: (r) => records.push(r) });
    await assert.rejects(() => call("https://eth.mevblocker.io/some/path?k=secret", "eth_call", [{ to: "0x0", data: "0x0" }]), RpcError);
  });
  assert.equal(records.length, 1, "one JSON-RPC error was logged");
  const rec = records[0]!;
  assert.equal(rec.provider, "mevblocker.io", "the log records the REGISTRABLE DOMAIN, not the full URL (no key leaked)");
  assert.equal(rec.method, "eth_call");
  assert.equal(rec.code, -32000);
  assert.equal(rec.message, "header not found");
});

// The CLI exposes the enumeration floor, politeness, the bounded retry budget and the backoff cap (V-1(c)).
test("ukemi_record_parses_cli_args", () => {
  const a = parseUkemiArgs(["--cluster", "susde-usde", "--block", "23600000", "--from-block", "23598000", "--min-interval-ms", "350", "--retries", "3", "--backoff-ms", "250", "--backoff-cap-ms", "4000", "--out", "F:/tmp/x.json"]);
  assert.deepEqual(a, { cluster: "susde-usde", block: 23600000, fromBlock: 23598000, minIntervalMs: 350, retries: 3, backoffMs: 250, backoffCapMs: 4000, out: "F:/tmp/x.json" });
  const d = parseUkemiArgs([]);
  assert.deepEqual(d, { cluster: "weth", block: undefined, fromBlock: undefined, minIntervalMs: 200, retries: 2, backoffMs: 500, backoffCapMs: 8000, out: undefined });
  assert.throws(() => parseUkemiArgs(["--block", "abc"]), /non-negative integer/, "a non-numeric flag fails closed");
  assert.throws(() => parseUkemiArgs(["--retries", "-1"]), /non-negative integer/, "a negative flag fails closed");
  assert.throws(() => parseUkemiArgs(["--backoff-cap-ms", "-5"]), /non-negative integer/, "the backoff cap fails closed too");
});

// (a) The run-guard, extracted and testable. A sibling path containing a SPACE: the canonical file URL
// percent-encodes it (%20), and pathToFileURL round-trips a real space back to that URL on ALL platforms, so
// isMainModule is true. The pre-e8bcfe4 string form ("file://" + path, backslashes → slashes) never
// percent-encodes the space, so it does NOT equal the URL — this test reds against the old form under CI Linux
// AND Windows (V-1(a); cross-check probes/o1-crossplatform.mjs).
test("ukemi_record_is_main_module_cross_platform", () => {
  const u = new URL("./a b/record.ts", import.meta.url); // .href carries %20 for the space
  const p = fileURLToPath(u);                            // a real space in the resolved path
  assert.equal(isMainModule(p, u.href), true, "pathToFileURL round-trips a spaced path to the %20 URL on every platform");
  const oldForm = "file://" + p.split(String.fromCharCode(92)).join("/"); // == argv1.replace(/\\/g,"/") of the old guard
  assert.notEqual(oldForm, u.href, "the old string-concat guard never percent-encodes the space — cross-platform wrong");
  assert.equal(isMainModule(undefined, u.href), false, "undefined argv1 (no script arg) is never the main module");
});

// (c) Backoff is exponential but upper-bounded: min(backoffMs * 2**attempt, capMs). Without the cap a large
// attempt count explodes; the ceiling holds and no wait ever exceeds it (V-1(c)).
test("ukemi_record_backoff_delay_is_capped", () => {
  assert.equal(backoffDelay(0, 500, 8000), 500, "attempt 0 ⇒ the base delay");
  assert.equal(backoffDelay(3, 500, 8000), 4000, "attempt 3 ⇒ 500*8, still under the cap");
  assert.equal(backoffDelay(4, 500, 8000), 8000, "attempt 4 ⇒ 500*16=8000, at the cap");
  assert.equal(backoffDelay(20, 500, 8000), 8000, "a large attempt is clamped to the cap, never unbounded");
  for (let a = 0; a <= 30; a++) assert.ok(backoffDelay(a, 500, 8000) <= 8000, "no single wait ever exceeds the cap");
});

// (d) A 200 whose body is not JSON (e.g. an HTML error page from a mis-routed host) is logged as a structured
// http:200 journal entry and thrown as a NON-retryable transport error — never retried; the body snippet stays in
// the journal only, and the thrown message carries no body (so it cannot trip range-splitting downstream) (V-1(d)).
test("ukemi_record_guards_non_json_200", async () => {
  const records: RpcErrorRecord[] = [];
  let count = 0;
  await withFetch(() => { count++; return new Response("<!doctype html><h1>not json</h1>", { status: 200, headers: { "content-type": "text/html" } }); }, async () => {
    const call = makeDefaultCall({ retries: 3, backoffMs: 0, onRpcError: (r) => records.push(r) });
    await assert.rejects(() => call("https://eth.drpc.org/x?k=secret", "eth_getLogs", [{}]), /HTTP 200 non-JSON drpc\.org/, "a non-JSON 200 throws a non-retryable transport error naming only the provider");
  });
  assert.equal(count, 1, "a non-JSON 200 is a mis-route, not a transient — never retried (exactly one attempt)");
  assert.equal(records.length, 1, "one structured journal entry was logged");
  const rec = records[0]!;
  assert.equal(rec.provider, "drpc.org", "the journal records the registrable domain, never the URL (no key leaked)");
  assert.equal(rec.http, 200);
  assert.match(rec.message, /^non-JSON body: /, "the body snippet lives in the journal entry only");
});

// (e) A drpc free-plan 400 ("ranges over 10000 blocks are not supported on free plan") matches isResultLimit via
// "10000"/"ranges over", so the raw path would split it to the floor — but the block is the PLAN, not the range
// (measured 31/31 on a 9990-block chunk, D9). getLogsVia must bench drpc on the FIRST 400 and never split; two
// healthy providers carry the quorum. Mutant (remove the isPlanLimited clause) ⇒ drpc is split many times ⇒ red.
test("ukemi_record_free_plan_benches_without_split", async () => {
  const FREE_PLAN = { id: 1, jsonrpc: "2.0", error: { message: "ranges over 10000 blocks are not supported on free plan", code: 35 } };
  const log = (n: number): LogEntry => ({ blockNumber: "0x" + n.toString(16), logIndex: "0x0", transactionHash: "0x" + n.toString(16).padStart(64, "0"), topics: ["0xtopic"], data: "0x" });
  let drpcCalls = 0;
  await withFetch((_a, req, url) => {
    if (url.includes("drpc")) { drpcCalls++; return jsonResp(FREE_PLAN, 400); }
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: [log(1_000_000)] });
  }, async () => {
    const call = makeDefaultCall({ retries: 0, backoffMs: 0 });
    const eps = ["https://eth.drpc.org", "https://b.example", "https://c.example"];
    const pool = makeUkemiPool({ call, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: 0 });
    const logs = await pool.getLogsRange("0xabc", ["0xtopic"], 1_000_000, 1_000_099); // a single chunk (< 9990 blocks)
    assert.ok(logs.length > 0, "the two healthy providers form the quorum");
  });
  assert.equal(drpcCalls, 1, "drpc's free-plan 400 benches it on the first call — no range-splitting to the floor");
});

// (f) Coverage and dedup across a chunk cut. A provider with an inclusive off-by-one on toBlock serves logs in
// [from, to+1]; with chunk=10 over [0,19] the log at block 10 (chunk2.from = chunk1.to+1) is served on BOTH sides
// of the cut. Both providers share the drift so the quorum concords (a one-sided drift is a QuorumDisagreementError,
// caught earlier). getLogsRange must return each (blockNumber,logIndex,txHash) once and cover [from,to] with no
// hole. Mutant (remove dedupLogs) ⇒ block 10 appears twice ⇒ red (V-1(f)).
test("ukemi_record_getlogsrange_dedups_chunk_boundary", async () => {
  const log = (n: number): LogEntry => ({ blockNumber: "0x" + n.toString(16), logIndex: "0x0", transactionHash: "0x" + n.toString(16).padStart(64, "0"), topics: ["0xt"], data: "0x" });
  await withFetch((_a, req) => {
    const p = (req.params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
    const from = parseInt(p.fromBlock, 16); const to = parseInt(p.toBlock, 16);
    const out: LogEntry[] = [];
    for (let b = from; b <= to + 1; b++) out.push(log(b)); // inclusive off-by-one: serves [from, to+1]
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: out });
  }, async () => {
    const call = makeDefaultCall({ retries: 0, backoffMs: 0 });
    const eps = ["https://a.example", "https://b.example"];
    const pool = makeUkemiPool({ call, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: 0, chunk: 10 });
    const logs = await pool.getLogsRange("0xabc", ["0xt"], 0, 19);
    const keys = logs.map((l) => parseInt(l.blockNumber, 16) + "|" + parseInt(l.logIndex, 16) + "|" + l.transactionHash.toLowerCase());
    assert.equal(new Set(keys).size, keys.length, "no (blockNumber,logIndex,txHash) duplicate survives the chunk cut");
    const blocks = new Set(logs.map((l) => parseInt(l.blockNumber, 16)));
    for (let b = 0; b <= 19; b++) assert.ok(blocks.has(b), `coverage: block ${String(b)} is present (no hole across the cut)`);
  });
});
