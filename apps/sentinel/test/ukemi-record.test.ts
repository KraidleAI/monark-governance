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
import { makeDefaultCall, parseUkemiArgs, isMainModule, backoffDelay, runRecorder, type RpcErrorRecord, type RecorderDeps } from "../src/ukemi/record.ts";
import { makeUkemiPool, RpcError, dedupLogs, type LogEntry } from "../src/ukemi/rpc2.ts";
import { QuorumDisagreementError } from "../src/rpc.ts";
import { reduceConcordance } from "../src/ukemi/concordance.ts";
import { SEL } from "../src/ukemi/abi.ts";
import { ORACLE } from "../src/ukemi/clusters.ts";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

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
  const a = parseUkemiArgs(["--cluster", "susde-usde", "--block", "23600000", "--from-block", "23598000", "--min-interval-ms", "350", "--retries", "3", "--backoff-ms", "250", "--backoff-cap-ms", "4000", "--out", "/tmp/x.json", "--max-calls", "300000", "--resume", "/tmp/u4a/U4-inputs.jsonl", "--prereg-sha", "9209cdab", "--filter-only", "--slow-operator", "drpc.org", "--slow-operator", "p2pify.com", "--slow-interval-ms", "250", "--exclude-operator", "mevblocker.io", "--concordance-out", "/tmp/conc.jsonl"]);
  assert.deepEqual(a, { cluster: "susde-usde", block: 23600000, fromBlock: 23598000, minIntervalMs: 350, retries: 3, backoffMs: 250, backoffCapMs: 4000, out: "/tmp/x.json", maxCalls: 300000, resume: "/tmp/u4a/U4-inputs.jsonl", preregSha: "9209cdab", filterOnly: true, slowOperators: ["drpc.org", "p2pify.com"], slowIntervalMs: 250, excludeOperators: ["mevblocker.io"], concordanceOut: "/tmp/conc.jsonl" });
  const d = parseUkemiArgs([]);
  assert.deepEqual(d, { cluster: "weth", block: undefined, fromBlock: undefined, minIntervalMs: 200, retries: 2, backoffMs: 500, backoffCapMs: 8000, out: undefined, maxCalls: undefined, resume: undefined, preregSha: undefined, filterOnly: false, slowOperators: [], slowIntervalMs: 200, excludeOperators: [], concordanceOut: undefined });
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
// hole. Mutant (remove dedupLogs) ⇒ block 10's logs are served twice over ⇒ red (V-1(f)).
test("ukemi_record_getlogsrange_dedups_chunk_boundary", async () => {
  // C-1 hardening: each block carries TWO logs at distinct logIndex sharing one txHash, so the dedup key must be the
  // full (block, logIndex, txHash) tuple — a blockNumber-only key (mutant G2-1) would drop the second of each block.
  const log = (n: number, idx: number): LogEntry => ({ blockNumber: "0x" + n.toString(16), logIndex: "0x" + idx.toString(16), transactionHash: "0x" + n.toString(16).padStart(64, "0"), topics: ["0xt"], data: "0x" });
  await withFetch((_a, req) => {
    const p = (req.params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
    const from = parseInt(p.fromBlock, 16); const to = parseInt(p.toBlock, 16);
    const out: LogEntry[] = [];
    for (let b = from; b <= to + 1; b++) { out.push(log(b, 0)); out.push(log(b, 1)); } // inclusive off-by-one, 2 logs/block
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: out });
  }, async () => {
    const call = makeDefaultCall({ retries: 0, backoffMs: 0 });
    const eps = ["https://a.example", "https://b.example"];
    const pool = makeUkemiPool({ call, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: 0, chunk: 10 });
    const logs = await pool.getLogsRange("0xabc", ["0xt"], 0, 19);
    const keys = logs.map((l) => parseInt(l.blockNumber, 16) + "|" + parseInt(l.logIndex, 16) + "|" + l.transactionHash.toLowerCase());
    assert.equal(new Set(keys).size, keys.length, "no (blockNumber,logIndex,txHash) duplicate survives the chunk cut");
    // Each in-range block keeps BOTH its logIndex across the cut (coverage + no block-only key collapse — kills G2-1).
    for (let b = 0; b <= 19; b++) assert.equal(logs.filter((l) => parseInt(l.blockNumber, 16) === b).length, 2, `block ${String(b)}: both logIndex survive (no hole, no blockNumber-only collapse)`);
  });
});

// (C-1, hardens V-1(f)) dedupLogs keys on the FULL (blockNumber, logIndex, txHash) tuple, never blockNumber alone. A
// single block routinely carries >= 2 Transfer logs at DISTINCT logIndex (often one txHash), so both must survive; a
// blockNumber-only key (mutant G2-1) would silently drop the second — real on-chain data loss the coarser oracle
// missed. A byte-identical (block, logIndex, txHash) triple is a genuine chunk-overlap duplicate ⇒ collapses to one.
test("ukemi_record_deduplogs_keys_on_full_log_tuple", () => {
  const mk = (block: number, logIndex: number, tx: string): LogEntry =>
    ({ blockNumber: "0x" + block.toString(16), logIndex: "0x" + logIndex.toString(16), transactionHash: tx, topics: ["0xt"], data: "0x" });
  const twoInOneBlock = dedupLogs([mk(100, 0, "0xaa"), mk(100, 1, "0xaa")]); // same block+txHash, distinct logIndex
  assert.equal(twoInOneBlock.length, 2, "same block, distinct logIndex (shared txHash) ⇒ both logs survive (a blockNumber-only key would drop one)");
  assert.deepEqual(twoInOneBlock.map((l) => parseInt(l.logIndex, 16)), [0, 1], "both logIndex kept, first-seen order preserved");
  const repeated = dedupLogs([mk(100, 0, "0xaa"), mk(100, 0, "0xaa")]); // byte-identical triple ⇒ a real duplicate
  assert.equal(repeated.length, 1, "same (block, logIndex, txHash) repeated ⇒ collapses to exactly one");
});

// (O-1, hardens V-1(c)) The backoff cap is WIRED at the retry call-site, not just a tested pure function: a low cap
// must shrink the REAL waits paid between attempts. Timing discriminator, no fake clock. With retries:3, backoffMs:100
// the three inter-attempt waits are 100+200+400=700ms uncapped, but clamp to 1+1+1ms at backoffCapMs:1. A call-site
// that ignored the cap (mutant G2-2 ⇒ backoffMs*2**attempt) would pay ~700ms even when capped. Threshold 200ms (not
// the ~50ms sketch): measured capped wall on Windows is ~45-69ms (15.6ms timer granularity x 3 sleeps), uncapped
// ~715ms; 200ms sits ~3.5x under the 600ms floor and reds the ~700ms mutant while immune to CI timer jitter (G2:139
// itself proposed a robust sub-100ms bound; the mission asks for wide CI margins). Exercises the 5xx call-site; the
// network-fault call-site has its OWN killer below (ukemi_record_backoff_cap_is_wired_at_network_fault_call_site, V-E).
test("ukemi_record_backoff_cap_is_wired_at_call_site", { timeout: 10_000 }, async () => {
  const RETRIES = 3; // 503 for attempts 0..RETRIES then a 200 on the 5th call — a bounded loop throws on the 4th 503
  // (measurement unchanged: 4 attempts = 3 waits); an unbounded R2 regression RESOLVES ⇒ assert.rejects reds in ms.
  const measure = async (backoffCapMs: number): Promise<number> => {
    const t0 = performance.now();
    await withFetch((attempt, req) => (attempt <= RETRIES ? jsonResp({ error: "down" }, 503) : jsonResp({ jsonrpc: "2.0", id: req.id, result: "0x2a" })), async () => {
      const call = makeDefaultCall({ retries: RETRIES, backoffMs: 100, backoffCapMs });
      await assert.rejects(() => call("https://one.example", "eth_call", [{ to: "0x0", data: "0x0" }]), /HTTP 503/);
    });
    return performance.now() - t0;
  };
  const capped = await measure(1);
  const uncapped = await measure(1_000_000);
  assert.ok(capped < 200, `backoffCapMs:1 bounds the real inter-attempt waits at the call-site (measured ${capped.toFixed(1)}ms; a cap-ignoring call-site would pay ~700ms)`);
  assert.ok(uncapped >= 600, `control: with the cap not binding, the three real waits are ~700ms (measured ${uncapped.toFixed(1)}ms) — the timing discriminator is live`);
});

// (V-E, hardens O-1) The SAME cap must bind at the OTHER retry call-site — the network/timeout (transport) fault path,
// where fetch itself throws (no Response). Symmetric timing discriminator: with retries:3, backoffMs:100 the three
// inter-attempt waits are 100+200+400=700ms uncapped but clamp to ~1ms each at backoffCapMs:1. A call-site that ignored
// the cap on THIS path only (mutant "V-E cap ignored at network-fault call-site ONLY": sleep(backoffMs*2**attempt) at
// the transport catch, record.ts:67) would still pay ~700ms when capped ⇒ red, while backoff_cap_is_wired (the 5xx
// site) stays green. §F belt: the stub throws for attempts 0..RETRIES then a 200 on the 5th call, so an unbounded
// regression on this path RESOLVES fast instead of hanging; { timeout: 10_000 } on top.
test("ukemi_record_backoff_cap_is_wired_at_network_fault_call_site", { timeout: 10_000 }, async () => {
  const RETRIES = 3;
  const measure = async (backoffCapMs: number): Promise<number> => {
    const t0 = performance.now();
    await withFetch((attempt, req) => {
      if (attempt <= RETRIES) throw new TypeError("network down"); // transport fault ⇒ fetch throws ⇒ the catch-path sleeps
      return jsonResp({ jsonrpc: "2.0", id: req.id, result: "0x2a" }); // 5th call: only an unbounded loop reaches it
    }, async () => {
      const call = makeDefaultCall({ retries: RETRIES, backoffMs: 100, backoffCapMs });
      await assert.rejects(() => call("https://one.example", "eth_call", [{ to: "0x0", data: "0x0" }]), /network down/);
    });
    return performance.now() - t0;
  };
  const capped = await measure(1);
  const uncapped = await measure(1_000_000);
  assert.ok(capped < 200, `backoffCapMs:1 bounds the real inter-attempt waits at the network-fault call-site (measured ${capped.toFixed(1)}ms; a cap-ignoring transport path would pay ~700ms)`);
  assert.ok(uncapped >= 600, `control: with the cap not binding, the three real transport-retry waits are ~700ms (measured ${uncapped.toFixed(1)}ms)`);
});

// L-4 — the concordance counter wired end-to-end (ADR-POOL-RPC-1): runRecorder(--concordance-out) drives the
// quorum-2 pool through a stubbed fetch. drpc benches on a -32601 (not a revert) so POCKET enters the pair;
// getPriceOracle CONCORDS and getReservesList DISCORDS (abstains) — the hook records BOTH before the throw, the
// finally flushes ONE compact jsonl line per pair, and reduceConcordance folds it to counters. M-7c (flag parsed
// but the sink NOT passed to makeUkemiPool) ⇒ empty aggregate ⇒ empty file ⇒ reducer [] ⇒ this reds. No URL written.
test("ukemi_record_concordance_chain — args → runRecorder → jsonl → reduceConcordance yields a pocket pair with a concordant AND a discordant read, no URL in the file (L-4; M-7c)", async () => {
  const B = 23545087;
  const ORACLE_WORD = "0x" + "0".repeat(24) + ORACLE.slice(2).toLowerCase(); // a 32-byte word decoding to ORACLE
  const out = join(tmpdir(), `pool1a-conc-${String(process.pid)}-${String(Date.now())}.jsonl`);
  await withFetch((_a, req, url) => {
    if (url.includes("drpc")) return jsonResp({ jsonrpc: "2.0", id: req.id, error: { code: -32601, message: "method not found" } }); // benched (not a revert) ⇒ pocket enters the pair
    if (req.method === "eth_getBlockByNumber") return jsonResp({ jsonrpc: "2.0", id: req.id, result: { hash: "0x" + "11".repeat(32), number: "0x" + B.toString(16), timestamp: "0x66000000" } });
    if (req.method === "eth_call") {
      const data = (req.params as ReadonlyArray<{ data: string }>)[0]!.data.toLowerCase();
      if (data === SEL.getPriceOracle) return jsonResp({ jsonrpc: "2.0", id: req.id, result: ORACLE_WORD });                                        // concordant across mevblocker + nodies
      if (data === SEL.getReservesList) return jsonResp({ jsonrpc: "2.0", id: req.id, result: url.includes("mevblocker") ? "0x1234" : "0x5678" }); // DISCORDANT ⇒ abstains
    }
    return jsonResp({ jsonrpc: "2.0", id: req.id, result: "0x1" });
  }, async () => {
    const deps: RecorderDeps = { env: {}, now: () => 1_700_000_000_000 };
    const argv = ["--cluster", "weth", "--block", String(B), "--max-calls", "50", "--filter-only", "--retries", "0", "--backoff-ms", "0", "--min-interval-ms", "0", "--concordance-out", out];
    await assert.rejects(() => runRecorder(argv, deps), QuorumDisagreementError, "the discordant getReservesList abstains the run (fail-closed) — the hook recorded it first");
  });
  const raw = readFileSync(out, "utf8");
  rmSync(out, { force: true });
  assert.ok(!/https?:\/\//.test(raw) && !raw.toLowerCase().includes("http"), "the concordance file carries NO URL (operators only, C-1)");
  assert.ok(!raw.includes("nodies"), "the nodies gateway is collapsed to 'pocket' in the pair (C-2), never named in the file");
  const tally = reduceConcordance(raw);
  assert.equal(tally.length, 1, "exactly one operator PAIR was observed (M-7c: an unwired sink ⇒ empty file ⇒ [] ⇒ this reds)");
  const t = tally[0]!;
  assert.equal(t.pair, "mevblocker.io|pocket", "the pair is mevblocker.io ↔ pocket (drpc benched on -32601 ⇒ pocket entered)");
  assert.equal(t.concordant, 1, "getPriceOracle concorded (recorded)");
  assert.equal(t.discordant, 1, "getReservesList discorded (recorded BEFORE the abstention throw)");
  assert.equal(t.rate, 0.5, "rate = concordant/(concordant+discordant) = 1/2");
});

// C-2 — record.ts's fail-closed distinct() guard counts by OPERATOR (the plan names this guard explicitly): excluding
// drpc + mevblocker leaves {nodies, pocket} = ONE operator, so the recorder REFUSES before any network read. M-4d
// (distinct by providerOf) would count 2 domains, pass the guard, and reach finalized ⇒ a DIFFERENT message ⇒ this reds.
test("ukemi_record_distinct_guard_by_operator — --exclude drpc+mevblocker leaves {nodies,pocket}=1 operator ⇒ fail-closed at the guard (C-2 record.ts; M-4d)", async () => {
  await withFetch((_a, req) => jsonResp({ jsonrpc: "2.0", id: req.id, result: { hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x1" } }), async () => {
    const deps: RecorderDeps = { env: {}, now: () => 1_700_000_000_000 };
    await assert.rejects(
      () => runRecorder(["--cluster", "weth", "--max-calls", "10", "--exclude-operator", "drpc.org", "--exclude-operator", "mevblocker.io"], deps),
      /eth_call quorum-2 needs >= 2 distinct operators/,
      "the operator-distinct guard fails closed before any read (M-4d: providerOf would count 2 and reach finalized with a different message)",
    );
  });
});
