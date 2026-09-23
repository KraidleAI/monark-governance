// UKEMI-CONC-1 (ADR-U4b amendment 2026-09-23) - the recorder's `--concurrency <n>` window. Offline oracles (no network):
// the pool bounds its window and keeps INPUT order; its first error stops dispatch and it DRAINS before rethrowing;
// --concurrency is optional (default 1) and fail-closed pre-flight; the politeness gate spaces ISSUES per operator under
// concurrent reads (and the pre-lot getLogsVia Promise.all split burst) and the caller retry re-enters it; n=8 is
// byte-identical to n=1 (filter pass and full book, PIN reproduced); the book prefetch leaves recordBook ZERO network
// reads; --resume under concurrency is one complete line per MISS and replays at 0 fetch; the resume reader is
// single-flight; a budget stop under concurrency drains before the finally's unlock (every ledger stays chained). The
// runRecorder oracles drive the REAL guard with ONLY globalThis.fetch stubbed, serving JSON-RPC bodies of the real shape
// (A-8) whose values are the recorded fixture bytes (weth-book.fixture.json), re-keyed onto more holders.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runRecorder, type RecorderDeps } from "../src/ukemi/record.ts";
import { runBounded, parseConcurrency, PoolStoppedError, type PoolReport } from "../src/ukemi/pool.ts";
import { prefetchBookReads } from "../src/ukemi/prefetch.ts";
import { makeResumeReader, type CacheLine } from "../src/ukemi/resume.ts";
import { makeUkemiPool, BudgetExceededError, type UkemiReader, type LogEntry } from "../src/ukemi/rpc2.ts";
import { recordBook } from "../src/ukemi/book.ts";
import { CLUSTER_WETH } from "../src/ukemi/clusters.ts";
import { TRANSFER_TOPIC0, topicAddr, wordAddr, transferRecipients } from "../src/ukemi/abi.ts";
import { verifyCycleLedger, type CycleLedgerEntry } from "@monark/rpc-guard";
import type { RpcCall } from "../src/rpc.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const DEPS: RecorderDeps = { env: {}, now: () => 1_700_000_000_000 }; // keyless operators only: no endpoint key exists here
const PIN = "034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921";
interface Fx { block: number; block_hash: string; block_ts: number; enumeration_logs: LogEntry[]; calls: Record<string, string>; }
const FX = JSON.parse(readFileSync(join(HERE, "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as Fx;
interface Data { calls: Record<string, string>; logs: LogEntry[]; }
const ZW = "0x" + "0".repeat(64);
const ATOKEN = CLUSTER_WETH.collaterals[0]!.aToken.toLowerCase();
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** A larger real-form set: the 4 recorded holders + n clones; clone i re-keys holder (i mod 4)'s recorded per-account
 *  responses (values byte-identical, only the holder word of the calldata changes) onto a fresh address, and every 5th
 *  clone gets a ZERO aToken balance (book.ts excluded_zero_balance). One synthetic Transfer log per clone. */
function synth(n: number): Data {
  const calls = { ...FX.calls }, logs = [...FX.enumeration_logs], tpl = [...new Set(transferRecipients(FX.enumeration_logs))];
  for (let i = 0; i < n; i++) {
    const h = "0x" + (0xc0c0 + i).toString(16).padStart(40, "0"), t = tpl[i % tpl.length]!;
    for (const [k, v] of Object.entries(FX.calls)) if (k.includes(wordAddr(t))) calls[k.replace(wordAddr(t), wordAddr(h))] = i % 5 === 4 && k.startsWith(ATOKEN + "|") ? ZW : v;
    logs.push({ ...FX.enumeration_logs[0]!, logIndex: "0x" + (0x1000 + i).toString(16), topics: [TRANSFER_TOPIC0, ZW, topicAddr(h)] });
  }
  return { calls, logs };
}
const FXD: Data = { calls: FX.calls, logs: FX.enumeration_logs };
const json = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const parseReq = (init?: RequestInit): { method: string; params: unknown[] } => JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
function serve(d: Data, init?: RequestInit): Response {
  const req = parseReq(init);
  if (req.method === "eth_getBlockByNumber") return json({ jsonrpc: "2.0", id: 1, result: { hash: FX.block_hash, number: "0x" + FX.block.toString(16), timestamp: "0x" + FX.block_ts.toString(16) } });
  if (req.method === "eth_getLogs") return json({ jsonrpc: "2.0", id: 1, result: d.logs });
  const p = (req.params as ReadonlyArray<{ to: string; data: string }>)[0]!;
  const v = d.calls[`${p.to.toLowerCase()}|${p.data.toLowerCase()}`];
  return json(v === undefined ? { jsonrpc: "2.0", id: 1, error: { code: -32000, message: "fixture miss" } } : { jsonrpc: "2.0", id: 1, result: v });
}
async function withFetch(stub: (input: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}
/** A generic (non-U-4b) guarded run over 2 keyless operators (--no-prereg-binding, as ukemi-guard-record.test.ts). */
const argv = (dir: string, interval = "0", maxCalls = "500000"): string[] => ["--ledger-dir", dir, "--cycle", "cyc", "--floor", "0", "--max-ru", "1000000", "--max-calls", maxCalls, "--method-caps", "eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000", "--operators", "drpc.org,mevblocker.io", "--min-interval-ms", interval, "--backoff-ms", "0", "--no-prereg-binding", "--cluster", "weth", "--block", String(FX.block)];
interface Prov { calls: number; calls_by_operator: Record<string, number>; calls_by_method: Record<string, number>; rpc_errors: unknown[]; concurrency: number; holders_digest: string; holders?: number; n_at_risk_config?: number; excluded?: unknown; projection_remaining_calls?: number; book_digest?: string; counts?: Record<string, number>; hf_findings?: unknown[]; timeline?: unknown; }
interface Out { provenance: Prov; book?: unknown; }
/** One guarded run; the default stub yields a microtask before answering and records the max fetches IN FLIGHT (the
 *  window actually used on the served path: 1 at n=1). */
async function record(d: Data, extra: string[], stub?: (input: string | URL, init?: RequestInit) => Promise<Response>): Promise<{ o: Out; max: number }> {
  const dir = mkdtempSync(join(tmpdir(), "uconc-")), out = join(dir, "out.json");
  let now = 0, max = 0;
  const counting = async (_i: string | URL, init?: RequestInit): Promise<Response> => { now++; max = Math.max(max, now); await Promise.resolve(); now--; return serve(d, init); };
  try {
    await withFetch(stub ?? counting, async () => { assert.equal(await runRecorder([...argv(dir), ...extra, "--out", out], DEPS), 0, `run ${extra.join(" ")} succeeds`); });
    return { o: JSON.parse(readFileSync(out, "utf8")) as Out, max };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// (iii) + order - n workers on one cursor: never more than n in flight AND the window is used; results by INPUT index.
// Mutants "window unbounded" (n workers -> one per item) and "aggregation in arrival order" red here.
test("ukemi_conc_pool_bounds_in_flight_and_keeps_input_order", async () => {
  for (const n of [1, 4]) {
    let now = 0, max = 0;
    const out = await runBounded(Array.from({ length: 40 }, (_, i) => i), n, async (x) => { now++; max = Math.max(max, now); await sleep((x * 7919) % 13); now--; return x * 10; });
    assert.equal(max, n, `n=${String(n)}: at most n tasks in flight, and the window is used`);
    assert.deepEqual(out, Array.from({ length: 40 }, (_, i) => i * 10), `n=${String(n)}: results by input index, never arrival order (jittered delays)`);
  }
  await assert.rejects(() => runBounded([1], 0, () => Promise.resolve(1)), /the window must be an integer >= 1/);
});

// (e)/(v) at the pool - the FIRST error stops dispatch (no item started after it), in-flight tasks are DRAINED before the
// rethrow, later faults are reported (a PoolStoppedError is not). Mutants "stop ignored" and "no drain" red here.
test("ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow", async () => {
  const started: number[] = [], settled: number[] = [];
  const report: PoolReport = { suppressed: [] };
  let settledAtReject = -1;
  const p = runBounded(Array.from({ length: 30 }, (_, i) => i), 4, async (i, _k, signal) => {
    started.push(i);
    await sleep(i === 5 ? 1 : 40);
    settled.push(i);
    if (i === 5) throw new BudgetExceededError("ukemi-conc: budget");
    if (i === 6) throw new Error("a later fault");
    if (signal.stopped) throw new PoolStoppedError();
    return i;
  }, report);
  await assert.rejects(p.catch((e: unknown) => { settledAtReject = settled.length; throw e; }), BudgetExceededError, "the first error (the budget stop) is rethrown");
  assert.deepEqual([...started].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7], "no item dispatched after the stop (items 4..7 were in flight)");
  assert.equal(settledAtReject, started.length, "every in-flight task settled BEFORE the rethrow (drain)");
  assert.deepEqual(report.suppressed, [{ name: "Error", message: "a later fault" }], "a later fault is reported; PoolStoppedError is not");
});

// (vi) + default - --concurrency absent => 1; 0 / negative / non-integer / exponent / empty / missing => refused, and
// runRecorder refuses it PRE-FLIGHT (0 fetch, no ledger opened). Mutants "default != 1" and "0 accepted" red here.
test("ukemi_conc_concurrency_is_optional_default_1_and_fail_closed", async () => {
  assert.equal(parseConcurrency(["--cluster", "weth"]), 1, "absent => 1 (the sequential recorder)");
  assert.equal(parseConcurrency(["--concurrency", "8"]), 8);
  for (const bad of [["--concurrency", "0"], ["--concurrency", "-1"], ["--concurrency", "2.5"], ["--concurrency", "abc"], ["--concurrency", "1e3"], ["--concurrency", ""], ["--concurrency"]]) {
    assert.throws(() => parseConcurrency(bad), /--concurrency must be an integer >= 1/, `refused: ${bad.join(" ")}`);
  }
  const dir = mkdtempSync(join(tmpdir(), "uconc-"));
  let fetches = 0;
  try {
    await withFetch(() => { fetches++; return Promise.resolve(json({})); }, async () => {
      await assert.rejects(() => runRecorder([...argv(dir), "--concurrency", "0"], DEPS), /--concurrency must be an integer >= 1/);
    });
    assert.equal(fetches, 0, "refused pre-flight: 0 fetch");
    assert.deepEqual(readdirSync(dir), [], "refused pre-flight: no cycle dir / ledger / lock opened");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// (ii) + (a) - 8 concurrent reads over 2 operators, then a getLogs range split (Promise.all, the pre-lot n=1 burst): per
// operator every ISSUE is >= minIntervalMs after the previous one (clock read inside the injected call). Mutant
// "politeness bypassed" (the pre-lot stamp-after-wait, no queue) => concurrent callers pass together => red.
test("ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency", async () => {
  const IV = 25, at = new Map<string, number[]>();
  const call: RpcCall = (u, method, params) => {
    at.set(u, [...(at.get(u) ?? []), performance.now()]); // the gate's own monotonic clock
    if (method !== "eth_getLogs") return Promise.resolve("0x" + "11".repeat(32));
    const r = (params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
    return parseInt(r.toBlock, 16) - parseInt(r.fromBlock, 16) >= 100 ? Promise.reject(new Error("query returned more than 10000 results")) : Promise.resolve([]);
  };
  const eps = ["https://a.example", "https://b.example"];
  const pool = makeUkemiPool({ call, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: IV });
  await Promise.all(Array.from({ length: 8 }, (_, i) => pool.ethCall("0x" + "ab".repeat(20), "0x" + i.toString(16).padStart(8, "0"), 100)));
  await pool.getLogsRange("0x" + "cd".repeat(20), [null], 1, 400); // 400 blocks, cap 100 => split x2 then x4 (7 calls per operator)
  for (const u of eps) {
    const ts = at.get(u) ?? [], gaps = ts.slice(1).map((t, k) => t - ts[k]!);
    assert.equal(ts.length, 15, `${u}: 8 eth_call + 7 getLogs issues`);
    assert.ok(gaps.every((g) => g >= IV), `${u}: every issue >= ${String(IV)} ms after the previous one (gaps ${JSON.stringify(gaps)})`);
  }
  // C-G2-3 (G2 UKEMI-CONC-1) (1) DISTINCT operators are NOT serialized (U-4a C-5: the gate keys by operator, never one global
  // queue): some issue to one operator lands within IV/2 of an issue to the other. Mutant G2M3b (gate keyed globally) red.
  const all = [...at.values()].flat().sort((x, y) => x - y), gmin = Math.min(...all.slice(1).map((t, k) => t - all[k]!));
  assert.ok(gmin < IV / 2, `distinct operators proceed in parallel: global min gap ${gmin.toFixed(2)} ms < ${String(IV / 2)} ms`);
  // (2) a slow operator (U-4a D-4) waits slowIntervalMs THROUGH makePoliteGate: the gate the pool builds from its options, AND
  // the shared gate record.ts builds from --slow-operator on the served path. Mutant G2M19 (the gate ignores the slow set) red
  // on both; mutant "record.ts builds its gate without the slow set" red on the served one.
  const SLOW = 3 * IV, sa = new Map<string, number[]>();
  const slowPool = makeUkemiPool({ call: (u) => { sa.set(u, [...(sa.get(u) ?? []), performance.now()]); return Promise.resolve("0x" + "33".repeat(32)); }, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: IV, slowOperators: ["b.example"], slowIntervalMs: SLOW });
  await Promise.all(Array.from({ length: 4 }, (_, i) => slowPool.ethCall("0x" + "ab".repeat(20), "0x" + i.toString(16).padStart(8, "0"), 100)));
  const sb = sa.get("https://b.example") ?? [], sg = sb.slice(1).map((t, k) => t - sb[k]!);
  assert.ok(sb.length === 4 && sg.every((g) => g >= SLOW), `slowOperators: b.example issues >= ${String(SLOW)} ms apart (gaps ${JSON.stringify(sg)})`);
  const IV2 = 10, SLOW2 = 40, hosts = new Map<string, number[]>(), dir = mkdtempSync(join(tmpdir(), "uconc-"));
  try {
    await withFetch((input, init) => { const h = new URL(String(input)).host; hosts.set(h, [...(hosts.get(h) ?? []), performance.now()]); return Promise.resolve(serve(FXD, init)); }, async () => {
      assert.equal(await runRecorder([...argv(dir, String(IV2)), "--filter-only", "--from-block", String(FX.block - 100), "--concurrency", "4", "--slow-operator", "mevblocker.io", "--slow-interval-ms", String(SLOW2), "--out", join(dir, "s.json")], DEPS), 0, "the filter pass completes");
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
  const mv = hosts.get("rpc.mevblocker.io") ?? [], mg = mv.slice(1).map((t, k) => t - mv[k]!);
  assert.ok(mv.length >= 5 && mg.every((g) => g >= SLOW2), `--slow-operator mevblocker.io on the served path: ${String(mv.length)} issues >= ${String(SLOW2)} ms apart (gaps ${JSON.stringify(mg)})`);
});

// ORACLE-HANG-1 regression - under a FROZEN Date (the guard-scripts-u4 preload freezes it) the gate still spaces issues on
// the monotonic clock and never stalls: gaps >= interval AND < 8 x interval. Mutant "wall clock" (Date.now in the gate)
// => the re-check sees a clock that never advances => it burns its 10-sleep bound on every issue (gap >= 10 x) => red.
test("ukemi_conc_polite_gate_uses_the_monotonic_clock_under_a_frozen_date", async () => {
  const IV = 20, a: number[] = [], realNow = Date.now.bind(Date);
  Date.now = () => 1_700_000_000_000; // frozen, as the guard-scripts-u4 preload does
  try {
    const pool = makeUkemiPool({ call: (u) => { if (u === "https://a.example") a.push(performance.now()); return Promise.resolve("0x" + "22".repeat(32)); }, ethCallProviders: ["https://a.example", "https://b.example"], getLogsProviders: ["https://a.example"], minIntervalMs: IV });
    await Promise.all(Array.from({ length: 4 }, (_, i) => pool.ethCall("0x" + "ef".repeat(20), "0x" + i.toString(16).padStart(8, "0"), 100)));
  } finally { Date.now = realNow; }
  const gaps = a.slice(1).map((t, k) => t - a[k]!);
  assert.ok(gaps.length === 3 && gaps.every((g) => g >= IV && g < 8 * IV), `issues to one operator spaced by the monotonic clock under a frozen Date (gaps ${JSON.stringify(gaps)})`);
});

// (a) retries - every FIRST attempt of each request gets a transient 503, its retry (backoff 0) must still wait its turn
// at the SAME gate: per operator host, every fetch >= minIntervalMs after the previous one. Mutant "retry bypasses the
// gate" (record.ts: attempt > 0 calls client.call directly) => the retry lands ~1 ms after its failed attempt => red.
test("ukemi_conc_retry_attempt_re_enters_the_gate", async () => {
  const IV = 40, at = new Map<string, number[]>(), seen = new Set<string>(); // 40 > a coarse win32 setTimeout(0) (~16 ms measured)
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    const host = new URL(String(input)).host, key = `${host}|${typeof init?.body === "string" ? init.body : ""}`;
    at.set(host, [...(at.get(host) ?? []), performance.now()]);
    if (!seen.has(key)) { seen.add(key); return Promise.resolve(new Response("busy", { status: 503 })); }
    return Promise.resolve(serve(FXD, init));
  };
  const dir = mkdtempSync(join(tmpdir(), "uconc-"));
  try {
    await withFetch(stub, async () => {
      assert.equal(await runRecorder([...argv(dir, String(IV)), "--filter-only", "--from-block", String(FX.block - 100), "--concurrency", "4", "--retries", "1", "--out", join(dir, "f.json")], DEPS), 0, "every read retried once, the run completes");
    });
    assert.equal(at.size, 2, "both operators were drawn");
    for (const [host, ts] of at) {
      const gaps = ts.slice(1).map((t, k) => t - ts[k]!);
      assert.ok(ts.length >= 16 && gaps.every((g) => g >= IV), `${host}: ${String(ts.length)} fetches, every one >= ${String(IV)} ms after the previous (gaps ${JSON.stringify(gaps)})`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// (i) + (iii) served - n=8 vs n=1 over the SAME recorded bytes: the filter pass and the full book are byte-identical on
// every digest-bearing field (book, book_digest, holders_digest, counts, hf_findings in order, timeline; holders,
// n_at_risk_config, excluded) AND on the per-operator/per-method call totals (no over-read, no double MISS, memo wired);
// only provenance.concurrency differs; the window is USED on the served path (1 < max in flight <= 8; exactly 1 at n=1).
// The real fixture reproduces the PIN at n=8. The set covers all 4 holder kinds (D-2).
test("ukemi_conc_n8_filter_and_book_are_byte_identical_to_n1", async () => {
  const D = synth(48);
  const calls = (p: Prov): unknown => ({ calls: p.calls, calls_by_operator: p.calls_by_operator, calls_by_method: p.calls_by_method, rpc_errors: p.rpc_errors });
  const f1 = await record(D, ["--filter-only"]), f8 = await record(D, ["--filter-only", "--concurrency", "8"]);
  const pf = (o: Out): unknown => ({ holders: o.provenance.holders, holders_digest: o.provenance.holders_digest, n_at_risk_config: o.provenance.n_at_risk_config, excluded: o.provenance.excluded, projection_remaining_calls: o.provenance.projection_remaining_calls, ...(calls(o.provenance) as object) });
  assert.deepEqual(pf(f8.o), pf(f1.o), "filter pass: n=8 == n=1 (holders, digest, n_at_risk_config, excluded, call totals)");
  assert.deepEqual([f1.o.provenance.concurrency, f8.o.provenance.concurrency, f1.o.provenance.holders], [1, 8, 52], "provenance records the window; 52 holders");
  const b1 = await record(D, []), b8 = await record(D, ["--concurrency", "8"]);
  const pb = (o: Out): unknown => ({ book: o.book, book_digest: o.provenance.book_digest, holders_digest: o.provenance.holders_digest, counts: o.provenance.counts, hf_findings: o.provenance.hf_findings, timeline: o.provenance.timeline, ...(calls(o.provenance) as object) });
  assert.deepEqual(pb(b8.o), pb(b1.o), "full book: n=8 == n=1 (book, book_digest, holders_digest, counts, hf_findings order, timeline, call totals)");
  assert.deepEqual([f1.max, b1.max], [1, 1], "n=1: one fetch in flight at a time (the sequential recorder)");
  assert.ok(f8.max > 1 && f8.max <= 8 && b8.max > 1 && b8.max <= 8, `n=8: the window is used and bounded on the served path (filter ${String(f8.max)}, book ${String(b8.max)})`);
  const c = b1.o.provenance.counts ?? {};
  assert.ok((c.at_risk ?? 0) > 0 && (c.excluded_zero_balance ?? 0) > 0 && (c.excluded_no_debt ?? 0) > 0 && (c.excluded_collateral_off ?? 0) > 0, `the set exercises every kind ${JSON.stringify(c)}`);
  assert.equal((await record(FXD, ["--concurrency", "8"])).o.provenance.book_digest, PIN, "the recorded fixture reproduces the PIN at n=8");
});

// Drift guard of the book prefetch (D-1) + (iii) at the base: after prefetchBookReads at n=8 through an in-RAM memo,
// recordBook makes ZERO base reads, and the prefetch read EXACTLY recordBook's own plan (no under-read, no over-read);
// the base never saw more than 8 reads in flight. Mutants "debt stage removed" / "zero-balance filter removed" red here.
test("ukemi_conc_book_prefetch_leaves_recordbook_zero_network_reads", async () => {
  const D = synth(48);
  const counting = (): { r: UkemiReader; keys: string[]; f: { now: number; max: number } } => {
    const keys: string[] = [], f = { now: 0, max: 0 };
    const r: UkemiReader = {
      async ethCall(to, data) {
        const k = `${to.toLowerCase()}|${data.toLowerCase()}`;
        keys.push(k); f.now++; f.max = Math.max(f.max, f.now); await sleep(1); f.now--;
        const v = D.calls[k]; if (v === undefined) throw new Error("fixture miss"); return v;
      },
      getLogsRange: () => Promise.resolve(D.logs),
      blockAt: () => Promise.resolve({ hash: FX.block_hash, ts: FX.block_ts }),
      finalized: () => Promise.resolve({ block: FX.block, ts: FX.block_ts }),
    };
    return { r, keys, f };
  };
  const alone = counting();
  const ref = await recordBook(CLUSTER_WETH, FX.block, alone.r);
  const base = counting(), memo = makeResumeReader(base.r, [], () => undefined);
  const prog = { holders: 0, config_read: 0, n_at_risk_config: 0 }, ticks: Array<[number, number]> = [];
  await prefetchBookReads(CLUSTER_WETH, FX.block, memo, { concurrency: 8, progress: prog, every: 10, onTick: () => { ticks.push([prog.config_read, prog.n_at_risk_config]); } });
  const n = base.keys.length;
  await recordBook(CLUSTER_WETH, FX.block, memo);
  assert.equal(base.keys.length, n, "recordBook after the n=8 prefetch makes ZERO base (network) reads");
  assert.deepEqual([...base.keys].sort(), [...alone.keys].sort(), "the prefetch read EXACTLY recordBook's plan");
  assert.ok(base.f.max > 1 && base.f.max <= 8, `bounded at the base: max in flight ${String(base.f.max)} in (1, 8]`);
  // (f) the heartbeat stays coherent: one tick per `every` holders done, cumulative tallies, final config-passing count =
  // recordBook's at_risk + excluded_zero_balance (the drift-guarded identity of the filter pass, ukemi-u4a.test.ts).
  assert.deepEqual(ticks.map((t) => t[0]), [10, 20, 30, 40, 50], "a tick every 10 holders done (cumulative)");
  assert.ok(ticks.every(([c, a], k) => a <= c && (k === 0 || a >= ticks[k - 1]![1])), `config-passing seen is cumulative and <= holders done ${JSON.stringify(ticks)}`);
  assert.deepEqual([prog.holders, prog.config_read, prog.n_at_risk_config], [52, 52, ref.counts.at_risk + ref.counts.excluded_zero_balance], "final progress = the book's config-passing count");
});

// (iv) + (d) - a full book at n=8 with --resume: every line parses (never an interleaved line), exactly one ethCall line
// per distinct read (== the distinct eth_call requests fetched), and a second run replays at 0 fetch with the same
// book_digest. Mutant "appends not serialized" (a line written in two deferred halves) red here.
test("ukemi_conc_resume_under_concurrency_one_line_per_miss_and_replays", async () => {
  const D = synth(48), dir = mkdtempSync(join(tmpdir(), "uconc-")), resume = join(dir, "inputs.jsonl");
  const fetched = new Set<string>();
  let fetches = 0;
  const stub = (_i: string | URL, init?: RequestInit): Promise<Response> => {
    fetches++;
    const req = parseReq(init);
    if (req.method === "eth_call") { const p = (req.params as ReadonlyArray<{ to: string; data: string }>)[0]!; fetched.add(`${p.to.toLowerCase()}|${p.data.toLowerCase()}`); }
    return Promise.resolve(serve(D, init));
  };
  try {
    const first = (await record(D, ["--concurrency", "8", "--resume", resume], stub)).o;
    const lines = readFileSync(resume, "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as CacheLine);
    const keys = lines.flatMap((l) => (l.kind === "ethCall" ? [`${l.to.toLowerCase()}|${l.data.toLowerCase()}`] : []));
    assert.equal(new Set(keys).size, keys.length, "no key appended twice (one line per MISS)");
    assert.deepEqual([...keys].sort(), [...fetched].sort(), "exactly one ethCall line per distinct read fetched");
    fetches = 0;
    const again = (await record(D, ["--concurrency", "8", "--resume", resume], stub)).o;
    assert.equal(fetches, 0, "the replay is all cache hits: 0 fetch");
    assert.equal(again.provenance.book_digest, first.provenance.book_digest, "the replay yields the same book_digest");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// (d) single-flight - two concurrent MISSes of one key (hex case-insensitive): ONE base read, ONE appended line; a
// rejected read appends nothing, is not cached, and the next caller retries the base. Mutant "join removed" red here.
test("ukemi_conc_resume_reader_is_single_flight_per_key", async () => {
  let calls = 0, fail = false;
  const base: UkemiReader = {
    async ethCall() { calls++; await sleep(5); if (fail) throw new Error("transient"); return "0x2a"; },
    getLogsRange: () => Promise.resolve([]), blockAt: () => Promise.resolve({ hash: ZW, ts: 1 }), finalized: () => Promise.resolve({ block: 1, ts: 1 }),
  };
  const appended: CacheLine[] = [];
  const r = makeResumeReader(base, [], (l) => { appended.push(l); });
  assert.deepEqual(await Promise.all([r.ethCall("0xAA", "0xDD", 1), r.ethCall("0xaa", "0xdd", 1)]), ["0x2a", "0x2a"]);
  assert.deepEqual([calls, appended.length], [1, 1], "two concurrent MISSes of one key => ONE base read, ONE appended line");
  fail = true; calls = 0;
  const rs = await Promise.allSettled([r.ethCall("0xBB", "0xEE", 1), r.ethCall("0xbb", "0xee", 1)]);
  assert.deepEqual([rs.map((x) => x.status), calls, appended.length], [["rejected", "rejected"], 1, 1], "joined rejection: one base read, nothing appended");
  fail = false;
  assert.equal(await r.ethCall("0xBB", "0xEE", 1), "0x2a");
  assert.equal(calls, 2, "a rejected read is not cached: the next caller retries the base");
});

// (v) + (e) - a budget stop (--max-calls: 10 pre-loop calls + 3) under n=8 with a real gate (20 ms, so in-flight reads are
// parked in timers when the stop fires): exit 2 + diag; after a wait, EVERY operator ledger replays (verifyCycleLedger),
// `unlocked` is its LAST line (no attempted/refused after it), no lock left; and at most ONE refused attempt per
// in-flight read (<= n: no read launched after the stop). Mutants "no drain" (a late line chains on the stale head
// after the finally's unlock) and "stop ignored" (every remaining holder attempts => ~40 refused) red here.
test("ukemi_conc_budget_stop_drains_before_unlock_and_ledgers_stay_chained", async () => {
  const D = synth(40), IV = 20, dir = mkdtempSync(join(tmpdir(), "uconc-")), out = join(dir, "f.json");
  try {
    let code = -1;
    await withFetch((_i, init) => Promise.resolve(serve(D, init)), async () => {
      code = await runRecorder([...argv(dir, String(IV), "13"), "--filter-only", "--from-block", String(FX.block - 100), "--concurrency", "8", "--out", out], DEPS);
    });
    assert.equal(code, 2, "a budget stop returns exit 2");
    const diag = JSON.parse(readFileSync(out + ".diag.json", "utf8")) as { error: { name: string }; pool?: { concurrency: number } };
    assert.deepEqual([diag.error.name, diag.pool?.concurrency], ["BudgetExceededError", 8], "the diag names the budget stop and the window");
    await sleep(IV * 20); // an undrained in-flight read (<= 7 queued x IV) would issue (and ledger) in this window, after the unlock
    let refused = 0;
    for (const op of ["drpc.org", "mevblocker.io"]) {
      const entries = readFileSync(join(dir, "cyc", `${op}.jsonl`), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as CycleLedgerEntry);
      assert.doesNotThrow(() => { verifyCycleLedger(entries); }, `${op}: the chain replays (no line on a stale head)`);
      const u = entries.findIndex((e) => e.outcome === "unlocked");
      assert.ok(u >= 0 && u === entries.length - 1, `${op}: unlocked is the LAST line (no attempted/refused after it)`);
      assert.ok(!existsSync(join(dir, "cyc", `${op}.lock`)), `${op}: no lock left`);
      refused += entries.filter((e) => e.outcome === "refused").length;
    }
    assert.ok(refused >= 1 && refused <= 8, `at most one refused attempt per in-flight read (no read launched after the stop): ${String(refused)}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// C-G2-2 (G2 UKEMI-CONC-1) - a NON-budget stop on the BOOK path: a quorum disagreement on one holder's first read (clone 24,
// mid-list: holders sort the clones first), n=8, a real gate (20 ms: reads queue at the gates when the stop fires). The run
// rejects and its diag names the disagreement and the window; after a wait, EVERY operator ledger replays, `unlocked` is its
// LAST line, no lock left; and every fetch issued after the stop belongs to a read already IN FLIGHT (a book task stops at its
// NEXT read): at most n-1 distinct requests, at most 2 fetches each (quorum-2). Mutant G2M8 (the per-read stop check removed
// from the book task: in-flight tasks unroll their WHOLE plan after the stop) red here; G2M1 (no drain) too.
test("ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained", async () => {
  const D = synth(48), IV = 20, N = 8, dir = mkdtempSync(join(tmpdir(), "uconc-")), out = join(dir, "b.json");
  const hw = wordAddr("0x" + (0xc0c0 + 24).toString(16).padStart(40, "0"));
  const log: string[] = [];
  let poisoned = 0, stopAt = -1;
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    const req = parseReq(init), p = req.method === "eth_call" ? (req.params as ReadonlyArray<{ to: string; data: string }>)[0] : undefined;
    log.push(p === undefined ? req.method : `${p.to.toLowerCase()}|${p.data.toLowerCase()}`);
    if (p === undefined || !p.data.toLowerCase().includes(hw)) return Promise.resolve(serve(D, init));
    poisoned++;
    if (poisoned === 2) stopAt = log.length; // both legs of the poisoned read are answered: the disagreement (the stop) follows
    return Promise.resolve(new URL(String(input)).host.includes("mevblocker") ? json({ jsonrpc: "2.0", id: 1, result: "0x" + "ab".repeat(32) }) : serve(D, init));
  };
  try {
    await withFetch(stub, async () => {
      await assert.rejects(() => runRecorder([...argv(dir, String(IV)), "--from-block", String(FX.block - 100), "--concurrency", String(N), "--out", out], DEPS), /disagree/, "the disagreement stops the course (fatal, non-budget)");
    });
    const diag = JSON.parse(readFileSync(out + ".diag.json", "utf8")) as { error: { name: string }; pool?: { concurrency: number } };
    assert.deepEqual([diag.error.name, diag.pool?.concurrency], ["QuorumDisagreementError", N], "the diag names the disagreement and the window");
    await sleep(IV * 20); // an undrained in-flight read would issue (and ledger) in this window, after the unlock
    for (const op of ["drpc.org", "mevblocker.io"]) {
      const entries = readFileSync(join(dir, "cyc", `${op}.jsonl`), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as CycleLedgerEntry);
      assert.doesNotThrow(() => { verifyCycleLedger(entries); }, `${op}: the chain replays (no line on a stale head)`);
      const u = entries.findIndex((e) => e.outcome === "unlocked");
      assert.ok(u >= 0 && u === entries.length - 1, `${op}: unlocked is the LAST line (no attempted/refused after it)`);
      assert.ok(!existsSync(join(dir, "cyc", `${op}.lock`)), `${op}: no lock left`);
    }
    const after = log.slice(stopAt), distinct = new Set(after).size;
    assert.ok(stopAt > 0 && poisoned === 2 && after.length >= 1, `the stop fell mid-course with reads in flight (stop at fetch ${String(stopAt)}, ${String(after.length)} fetch(es) after it)`);
    assert.ok(distinct <= N - 1 && after.length <= 2 * (N - 1), `no read launched after the stop: ${String(distinct)} distinct request(s), ${String(after.length)} fetch(es) after it (<= ${String(N - 1)}, <= ${String(2 * (N - 1))})`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// C-V-1 + C-V-2 (cp-2 UKEMI-CONC-1; closes R-C-1 and R-C-2) + C-G2-1b - --heartbeat-every paces BOTH prefetch heartbeats on
// the served path. --filter-only --concurrency 4 --heartbeat-every 5 over synth(48) (52 holders): exactly 10 stderr lines
// `..prefetch pass=filter` (5/52 .. 50/52, concurrency=4, t=<ISO of deps.now> as the HEARTBEAT-1 line), ALL before the
// unchanged replay pass, whose counters restart at zero: its `..filter` lines are exactly those of the n=1 run at the same
// period (5/52 first). A full book at --concurrency 4: exactly 10 `..prefetch pass=book` lines (5/52 first). stderr is
// TEE-captured (a swallowing redirect eats node:test's deferred TAP flushes, measured in ukemi-guard-record.test.ts
// capturedSplit). Mutants "filter wiring removed", "book wiring removed", "period mis-passed" (filter, book), "config_read
// reset removed", "config-passing reset removed", "filter prefetch ignores every", "t= dropped", "t= on the wall clock" red here.
test("ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero", async () => {
  const D = synth(48), TICKS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((k) => `${String(k)}/52`), T_ISO = new Date(DEPS.now()).toISOString();
  // groups: 1 pass, 2 holders done, 3 holders, 4 config-passing seen, 5 concurrency, 6 t=<ISO>
  const PRE = /^ {2}\.\.prefetch pass=(filter|book) holders_done=(\d+)\/(\d+) n_at_risk_config=(\d+) rate=[0-9.]+\/s concurrency=(\d+) calls=\{[^}]*\} errors=\{[^}]*\} t=(\S+)$/;
  // groups: 1 config_read, 2 holders, 3 config-passing (a prefix: the replay line carries more fields after it)
  const FIL = /^ {2}\.\.filter config_read=(\d+)\/(\d+) n_at_risk_config=(\d+) /;
  type Wr = { write: unknown };
  const stderrOf = async (every: string, extra: string[]): Promise<string[]> => {
    let err = "";
    const se = process.stderr.write.bind(process.stderr);
    (process.stderr as unknown as Wr).write = (s: string | Uint8Array, ...a: unknown[]): boolean => { err += String(s); return (se as unknown as (...x: unknown[]) => boolean)(s, ...a); };
    try { await record(D, ["--heartbeat-every", every, ...extra]); } finally { (process.stderr as unknown as Wr).write = se; }
    return err.split(/\r?\n/);
  };
  const pre = (ls: string[], pass: string): RegExpExecArray[] => ls.map((l) => PRE.exec(l)).filter((m): m is RegExpExecArray => m !== null && m[1] === pass);
  const fil = (ls: string[]): RegExpExecArray[] => ls.map((l) => FIL.exec(l)).filter((m): m is RegExpExecArray => m !== null);
  const kinds = (ls: string[]): string => ls.map((l) => (PRE.test(l) ? "p" : FIL.test(l) ? "f" : "")).join("");
  const done = (ms: RegExpExecArray[], a: number, b: number): string[] => ms.map((m) => `${m[a] ?? ""}/${m[b] ?? ""}`);
  const f4 = await stderrOf("5", ["--filter-only", "--concurrency", "4"]), f1 = await stderrOf("5", ["--filter-only"]);
  assert.deepEqual(done(pre(f4, "filter"), 2, 3), TICKS, "filter prefetch at --heartbeat-every 5: exactly 10 lines, 5/52 first");
  assert.ok(pre(f4, "filter").every((m) => m[5] === "4" && Number(m[4]) <= Number(m[2]) && m[6] === T_ISO), "each prefetch line: concurrency=4, config-passing seen <= holders done, t=<ISO of deps.now>");
  assert.equal(kinds(f4), "p".repeat(10) + "f".repeat(10), "every prefetch line precedes the replay pass");
  assert.deepEqual(done(fil(f4), 1, 2), TICKS, "the replay pass restarts at zero: 5/52 first");
  assert.deepEqual(fil(f4).map((m) => [m[1], m[3]]), fil(f1).map((m) => [m[1], m[3]]), "the replay pass prints EXACTLY the n=1 heartbeat (config_read AND config-passing restarted)");
  assert.equal(kinds(f1), "f".repeat(10), "n=1: no prefetch line, 10 filter lines (the comparison above is not vacuous)");
  // R-C-2 on BOTH counters: at --heartbeat-every 1 the replay's first tick fires BEFORE its first holder's tally (the filter
  // core counts, ticks, then tallies), so a counter left un-reset shows at once (config_read 53/52, or a stale config-passing).
  const e1 = fil(await stderrOf("1", ["--filter-only", "--concurrency", "4"]));
  assert.deepEqual([e1.length, e1[0]?.[1], e1[0]?.[3]], [52, "1", "0"], "every 1: the replay's first line is config_read=1/52 n_at_risk_config=0 (both counters reset)");
  const b4 = await stderrOf("5", ["--concurrency", "4"]);
  assert.deepEqual(done(pre(b4, "book"), 2, 3), TICKS, "book prefetch at --heartbeat-every 5: exactly 10 lines, 5/52 first");
  assert.ok(pre(b4, "book").every((m) => m[5] === "4" && m[6] === T_ISO), "each book prefetch line: concurrency=4, t=<ISO of deps.now>");
  assert.equal(kinds(b4), "p".repeat(10), "the full book: the 10 book prefetch lines only (recordBook has no heartbeat)");
});
