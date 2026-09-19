// UKEMI (ADR-U1 D3/D4/D9 hardening 2026-09-19) — oracles for the record.ts recorder hardening: a BOUNDED transient
// retry (HTTP 429/5xx and network/timeout, never infinite); a typed JSON-RPC error is the node's deterministic
// answer and is NEVER retried; a range-too-large HTTP 400 body is surfaced so getLogsVia splits the range; a
// structured, secret-free per-provider error log; and the CLI parser. globalThis.fetch is stubbed (fully typed,
// restored in a finally). No network here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeDefaultCall, parseUkemiArgs, type RpcErrorRecord } from "../src/ukemi/record.ts";
import { makeUkemiPool, RpcError, type LogEntry } from "../src/ukemi/rpc2.ts";

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

// The retry is BOUNDED: a persistent 503 throws after exactly retries + 1 attempts (never infinite).
test("ukemi_record_retry_is_bounded", async () => {
  let count = 0;
  await withFetch(() => { count++; return jsonResp({ error: "down" }, 503); }, async () => {
    const call = makeDefaultCall({ retries: 2, backoffMs: 0 });
    await assert.rejects(() => call("https://one.example", "eth_call", [{ to: "0x0", data: "0x0" }]), /HTTP 503/);
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

// The CLI exposes the enumeration floor, politeness and the bounded retry budget (committed successor to the wrapper).
test("ukemi_record_parses_cli_args", () => {
  const a = parseUkemiArgs(["--cluster", "susde-usde", "--block", "23600000", "--from-block", "23598000", "--min-interval-ms", "350", "--retries", "3", "--backoff-ms", "250", "--out", "F:/tmp/x.json"]);
  assert.deepEqual(a, { cluster: "susde-usde", block: 23600000, fromBlock: 23598000, minIntervalMs: 350, retries: 3, backoffMs: 250, out: "F:/tmp/x.json" });
  const d = parseUkemiArgs([]);
  assert.deepEqual(d, { cluster: "weth", block: undefined, fromBlock: undefined, minIntervalMs: 200, retries: 2, backoffMs: 500, out: undefined });
  assert.throws(() => parseUkemiArgs(["--block", "abc"]), /non-negative integer/, "a non-numeric flag fails closed");
  assert.throws(() => parseUkemiArgs(["--retries", "-1"]), /non-negative integer/, "a negative flag fails closed");
});
