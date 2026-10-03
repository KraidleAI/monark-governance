// test/record-coinbase-candles.test.ts -- lot COINBASE-USDT-RECORDER-1 (2026-10-03, corrected after its two G2): the Coinbase candle
// recorder scripts/record-coinbase-candles.mjs, run in-process against a loopback server that imitates GET /products/USDT-USD/candles
// (start and end in ISO 8601 UTC; both bounds served, newest first, unless a test names another reading of the bounds: the seven of the
// G2 probe p-robust.mjs), through an injected fetch that only rewrites https://api.exchange.coinbase.com to that server and refuses any
// other URL (the 144 runs of the second G2 get their pages from a fetch that builds them in memory). The global fetch is a tripwire for
// the whole file; one child process runs a copy of the recorder through a directory link, with no argument, so it stops at usage before
// any request: no test reaches the network, even under a mutant. Each test names, on the line above it, the production mutation that
// reddens it (scripts/red-proof.mjs convention); every outcome is compared by assert. No name that the corrections added is imported
// (the 298-slot core, the new stops and fields are written here), so this file also runs against the recorders of the G1 and of the
// first corrections and reddens there by assertion. Outputs live under the OS temp directory, outside any git tree, removed after the
// file. Every candle value here is made up for the test.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkHost, CSV_COLUMNS, expectedCount, GRANULARITIES, HOSTS, main, MAX_PAGES, ORIGIN, PAUSE_MS, PRODUCTS, RecorderStop, run,
  STOPS, WINDOW, windowCount } from "../scripts/record-coinbase-candles.mjs";
import type { RecorderIo, SeriesManifest } from "../scripts/record-coinbase-candles.mjs";

/** A candle as served: time in seconds, then low, high, open, close and volume as the JSON text writes them. */
type Candle = readonly [number, string, string, string, string, string];
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
/** A reading of the start and end parameters: the candles that the endpoint serves for them (seconds), or null for a refusal (400). */
type Reading = (cs: readonly Candle[], start: number, end: number) => readonly Candle[] | null;
interface Reply { status: number; headers?: Record<string, string>; body?: string; cut?: boolean; silent?: "headers" | "body" }
interface Endpoint { base: string; urls: string[]; headers: IncomingHttpHeaders[]; served: number[]; close: () => Promise<void> }
interface Calls { urls: string[]; inits: RequestInit[] }
interface Recording {
  code: string; detail: string; out: string; calls: Calls; sleeps: number[]; served: string[]; headers: IncomingHttpHeaders[]; candles: number;
}
interface Plan { script?: ReadonlyMap<number, Reply>; io?: RecorderIo; out?: string; reading?: Reading }
interface Logged { url: string; status: number; bytes?: number; sha256?: string; file: string; headers: Record<string, string | null>; header_names: string[] }
interface Slot { open_time_ms: number; open_time_utc: string }
interface MissingDoc { product: string; granularity: string; start: string; end_exclusive: string; count: number; missing: Slot[] }

const realFetch = globalThis.fetch;
globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
const CANDLES = "https://api.exchange.coinbase.com/products/USDT-USD/candles", LF = String.fromCharCode(10), T0 = Date.UTC(2023, 0, 2);
const STEP_MS = 900_000; // the closed list's 900 s, the 300-point request and its core of 298 slots are written here, never imported
const HEADER = "open_time_utc,open_time_ms,low,high,open,close,volume", RECORDER = new URL("../scripts/record-coinbase-candles.mjs", import.meta.url);
const ROOT = mkdtempSync(join(tmpdir(), "coinbase-candles-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
/** A path that does not exist yet, under the temp root. */
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
const at = (i: number): number => T0 + i * STEP_MS;
const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const candle = (ms: number, close = "1.0001"): Candle => [ms / 1000, "0.9990", "1.0010", "1.0000", close, "125.5"];
const series = (n: number, skip: readonly number[] = []): Candle[] =>
  Array.from({ length: n }, (_, i) => i).filter((i) => !skip.includes(i)).map((i) => candle(at(i)));
/** The JSON text of a page, each number written as the candle carries it (never a float through JSON.stringify). */
const bodyOf = (cs: readonly Candle[]): string => `[${cs.map((c) => `[${c.join(",")}]`).join(",")}]`;
const page = (cs: readonly Candle[]): Reply => ({ status: 200, body: bodyOf(cs) });
const slot = (ms: number): Slot => ({ open_time_ms: ms, open_time_utc: iso(ms) });
const argvOf = (start: number, end: number, out: string): string[] =>
  ["--product", "USDT-USD", "--granularity", "15m", "--start", iso(start), "--end", iso(end), "--out", out];
/** Both bounds served: the default reading of the endpoint (E of the seven readings). */
const BOTH: Reading = (cs, start, end) => cs.filter((c) => c[0] >= start && c[0] <= end);
/** Start excluded, end served (F of the seven readings). */
const AFTER_START: Reading = (cs, start, end) => cs.filter((c) => c[0] > start && c[0] <= end);
// Readers of the outputs are total: an absent file reads "", null, {} or no bytes, so a missing output fails an assertion, never an ENOENT.
const text = (out: string, name: string): string => (existsSync(join(out, name)) ? readFileSync(join(out, name), "utf8") : "");
const bytes = (path: string): Buffer => (existsSync(path) ? readFileSync(path) : Buffer.alloc(0));
const jsonOf = (out: string, name: string): unknown => (existsSync(join(out, name)) ? JSON.parse(text(out, name)) as unknown : null);
const parsed = (s: string): Record<string, unknown> => (s === "" ? {} : JSON.parse(s) as Record<string, unknown>);
const manifestOf = (out: string): SeriesManifest => (jsonOf(out, "manifest.json") ?? {}) as SeriesManifest;
/** The files (never a folder) of a directory, sorted; none when it is absent. */
const filesIn = (dir: string): string[] =>
  (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name).sort() : []);
const rawNames = (out: string): string[] => filesIn(join(out, "raw"));
const rawCount = (out: string): number => rawNames(out).length;
const errorsOf = (out: string): string[] => filesIn(join(out, "raw", "errors"));
/** requests.jsonl, one entry per line; none when the file is absent (an assertion then names the run's code, never an ENOENT). */
const linesOf = (out: string): Logged[] => (existsSync(join(out, "requests.jsonl"))
  ? text(out, "requests.jsonl").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Logged) : []);
/** The complete lines of requests.jsonl, one per answer whose body arrived (its size and sha256 added to the line of its headers). */
const logOf = (out: string): Logged[] => linesOf(out).filter((l) => l.sha256 !== undefined);
/** Files of --out beyond the provenance logs (raw/, requests.jsonl): none after a named stop. */
const normalized = (out: string): string[] => (existsSync(out) ? readdirSync(out).filter((n) => n !== "raw" && n !== "requests.jsonl") : []);
/** The open times (ms) that the CSV of --out lists, in its order. */
const opensOf = (out: string): number[] => text(out, "USDT-USD-15m.csv").split(LF).slice(1, -1).map((l) => Number(l.split(",")[1]));
const offline = (calls: Calls): FetchLike => (url, init) => { calls.urls.push(url); calls.inits.push(init); return Promise.reject(new Error("offline")); };

/** A loopback port that fetch accepts: a random port above 10080 (the Fetch port check of this runtime blocks 82 ports, all at or below
 *  10080, and this host hands port 0 out in sequence from 1024 up: G1 journals of SERIES-BINANCE and SERIES-INTERVALS), another one on
 *  any listen error (in use, or excluded by the OS). */
async function listen(server: Server): Promise<number> {
  for (let i = 0; i < 50; i++) {
    const port = 10_081 + Math.floor(Math.random() * 55_000);
    const bound = await new Promise<boolean>((done) => {
      const ok = (): void => { server.off("error", ko); done(true); };
      const ko = (): void => { server.off("listening", ok); done(false); };
      server.once("error", ko).once("listening", ok).listen(port, "127.0.0.1");
    });
    if (bound) return port;
  }
  return assert.fail("no free loopback port above 10080 in 50 tries");
}

/** The loopback endpoint: request n gets `script` n when given (status, headers and body, a cut connection, or silence before the
 *  headers or inside the body), else what `reading` serves for its start and end, newest first (H-3), or a 400 when it refuses. Each
 *  request URL and its headers are kept, in order, with the count of candles that `reading` served. */
async function endpoint(candles: readonly Candle[], script: ReadonlyMap<number, Reply> = new Map(), reading: Reading = BOTH): Promise<Endpoint> {
  const urls: string[] = [], headers: IncomingHttpHeaders[] = [], served: number[] = [];
  const server = createServer((req, res) => {
    const n = urls.length, url = req.url ?? "/", fixed = script.get(n);
    urls.push(url);
    headers.push(req.headers);
    if (fixed?.cut === true) { req.socket.destroy(); return; }
    if (fixed?.silent === "headers") return; // nothing is ever answered: the connection stays open until close()
    if (fixed?.silent === "body") { res.writeHead(200, { "content-type": "application/json" }).write("["); return; }
    if (fixed !== undefined) { res.writeHead(fixed.status, fixed.headers ?? {}).end(fixed.body ?? ""); return; }
    const q = new URL(url, "http://127.0.0.1").searchParams, sec = (k: string): number => Date.parse(q.get(k) ?? "") / 1000;
    const got = reading(candles, sec("start"), sec("end"));
    if (got === null) { res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ message: "too many points" })); return; }
    served.push(got.length);
    res.writeHead(200, { "content-type": "application/json", "x-loopback-count": String(n + 1) }).end(bodyOf([...got].sort((a, b) => b[0] - a[0])));
  });
  const port = await listen(server);
  const close = (): Promise<void> => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => { done(); }); });
  return { base: `http://127.0.0.1:${String(port)}`, urls, headers, served, close };
}

/** The injected fetch: the recorder's URL rewritten from https://api.exchange.coinbase.com to the loopback server, `init` untouched (so
 *  the redirect mode and the delay act on a real fetch); any other URL is refused, never sent. */
function via(ep: Endpoint, calls: Calls): FetchLike {
  return (url, init) => {
    calls.urls.push(url);
    calls.inits.push(init);
    if (!url.startsWith(`${CANDLES}?`)) return Promise.reject(new Error(`refused ${url}`));
    return realFetch(`${ep.base}${url.slice("https://api.exchange.coinbase.com".length)}`, init);
  };
}

/** "ok", or the code of the RecorderStop, one of STOPS (RR2-3), and its detail as JSON: any other throw reddens by assertion, not by a crash. */
async function outcome(p: Promise<unknown>): Promise<[string, string]> {
  try {
    await p;
    return ["ok", ""];
  } catch (e) {
    if (e instanceof RecorderStop) assert.ok(STOPS.includes(e.code), `${e.code}: a code missing from STOPS`);
    return e instanceof RecorderStop ? [e.code, JSON.stringify(e.detail)] : [`not a stop: ${e instanceof Error ? e.message : "unknown"}`, ""];
  }
}

/** One in-process recording over [start, end) against the loopback endpoint: clean environment, no flag, pauses recorded. */
async function record(candles: readonly Candle[], start: number, end: number, plan: Plan = {}): Promise<Recording> {
  const ep = await endpoint(candles, plan.script, plan.reading), calls: Calls = { urls: [], inits: [] }, sleeps: number[] = [], out = plan.out ?? fresh();
  const sleep = (ms: number): Promise<void> => { sleeps.push(ms); return Promise.resolve(); };
  const io: RecorderIo = { fetch: via(ep, calls), sleep, env: {}, execArgv: [], ...plan.io };
  try {
    const [code, detail] = await outcome(run(argvOf(start, end, out), io));
    return { code, detail, out, calls, sleeps, served: ep.urls, headers: ep.headers, candles: ep.served.reduce((a, b) => a + b, 0) };
  } finally {
    await ep.close();
  }
}

// killer: scripts/record-coinbase-candles.mjs:215 CONST "CORE * ctx.step" -> "WINDOW * ctx.step"
test("coinbase_candles_requests_cores_of_298_slots_with_a_margin_slot_on_each_side", async () => {
  const n = 307, r = await record(series(n + 1), at(0), at(n));
  assert.equal(r.code, "ok");
  const q = (s: number, e: number): string => `${CANDLES}?granularity=900&start=${iso(s)}&end=${iso(e)}`;
  assert.deepEqual(r.calls.urls, [q(at(-1), at(298)), q(at(297), at(n))], "start = core start - 900 s, end = core end, the last bounded by --end");
  assert.deepEqual([r.sleeps, PAUSE_MS >= 250, WINDOW], [[PAUSE_MS], true, 300], "one pause of at least 250 ms between two requests, none before");
  assert.deepEqual(r.calls.inits.map((i) => [i.redirect, i.headers, i.method, i.signal instanceof AbortSignal]),
    [["manual", undefined, undefined, true], ["manual", undefined, undefined, true]], "no header, no redirect followed, a delay on each request");
  assert.deepEqual(r.headers.map((h) => [h.authorization, h.cookie, h["cb-access-key"]]), [[undefined, undefined, undefined],
    [undefined, undefined, undefined]], "no authentication header reaches the endpoint");
  const m = manifestOf(r.out), csv = text(r.out, "USDT-USD-15m.csv").split(LF);
  assert.deepEqual([m.schema, m.mode, m.platform, m.endpoint, m.product, m.granularity, m.granularity_s, m.redistributable, m.terms],
    ["monark.series.coinbase.v1", "record", "coinbase", CANDLES, "USDT-USD", "15m", 900, false,
      "docs/marche/FAITS-USDT-USD-HISTORY-1-conditions-2026-10-03.md"]);
  assert.deepEqual([m.expected, m.rows, m.missing, m.pages, m.duplicates_removed, m.discarded_before_start, m.margin_at_start, m.margin_at_end],
    [n, n, 0, 2, 0, 0, 1, 2], "the margin candles that both bounds serve are counted, never kept");
  assert.deepEqual([m.start, m.end_exclusive, m.first_open_time, m.last_open_time], [iso(at(0)), iso(at(n)), iso(at(0)), iso(at(n - 1))]);
  assert.deepEqual([csv[0], CSV_COLUMNS.join(","), csv[1], csv.length, csv.at(-1)], [HEADER, HEADER,
    `${iso(at(0))},${String(at(0))},0.9990,1.0010,1.0000,1.0001,125.5`, n + 2, ""]);
  const raws = rawNames(r.out);
  assert.deepEqual(raws, [`USDT-USD-${String(at(0))}.json`, `USDT-USD-${String(at(298))}.json`]);
  assert.deepEqual(logOf(r.out).map((l) => [l.url, l.status, l.bytes, l.sha256, l.file, l.headers["retry-after"], typeof l.headers.date,
    l.header_names.includes("x-loopback-count")]), raws.map((f, i) => {
    const b = bytes(join(r.out, "raw", f));
    return [r.calls.urls[i], 200, b.length, sha(b), `raw/${f}`, null, "string", true];
  }), "requests.jsonl: URL, status, bytes, sha256 and file of each raw page, date, the names of the headers received");
  assert.deepEqual(linesOf(r.out).map((l) => [l.url, l.status, l.file, l.sha256 === undefined]), raws.flatMap((f, i) => [true, false].map((head) =>
    [r.calls.urls[i], 200, `raw/${f}`, head])), "each answer: a line as its status and headers arrive, then that line with its body");
  const sums = text(r.out, "SHA256SUMS").split(LF).filter((l) => l !== "").map((l): [string, string, string] => [l.slice(0, 64), l.slice(64, 66), l.slice(66)]);
  assert.deepEqual(sums.map((s) => s[2]), ["USDT-USD-15m.csv", "manifest.json", "missing.json", ...raws.map((f) => `raw/${f}`), "requests.jsonl"]);
  for (const [h, gap, name] of sums) assert.deepEqual([gap, h], ["  ", sha(bytes(join(r.out, name)))], `SHA256SUMS line of ${name}`);
  assert.deepEqual([m.csv_sha256, m.missing_sha256, m.recorder_sha256], [sha(text(r.out, "USDT-USD-15m.csv")), sha(text(r.out, "missing.json")),
    sha(readFileSync(RECORDER))]);
});

// killer: scripts/record-coinbase-candles.mjs:230 ROR "ms < first" -> "ms <= first"
test("coinbase_candles_discards_candles_outside_their_core_and_declares_gaps", async () => {
  // page 1: a candle before start, the start margin, a gap at 4, an identical duplicate of 5; page 2: no trade at all (an empty page, not
  // the end of the run: its slots are missing); page 3: the endpoint's, start excluded, so that no page serves a slot of page 2
  const first = page([...series(298, [4]).reverse(), candle(at(5)), candle(at(-1)), candle(at(-2))]);
  const r = await record(series(611), at(0), at(610), { script: new Map([[0, first], [1, page([])]]), reading: AFTER_START });
  assert.equal(r.code, "ok");
  assert.deepEqual(r.calls.urls.map((u) => new URL(u).searchParams.get("start")), [at(-1), at(297), at(595)].map(iso), "the empty page ends nothing");
  const m = manifestOf(r.out), opens = opensOf(r.out), doc = jsonOf(r.out, "missing.json") as MissingDoc | null;
  assert.deepEqual([m.expected, m.rows, m.missing, m.duplicates_removed, m.discarded_before_start, m.margin_at_start, m.margin_at_end, m.pages,
    r.sleeps], [610, 311, 299, 1, 1, 1, 1, 3, [PAUSE_MS, PAUSE_MS]]);
  const outside = [at(-2), at(-1), at(4), at(298), at(610)].filter((t) => opens.includes(t));
  assert.deepEqual([opens.length, opens.every((t, i) => i === 0 || t > (opens[i - 1] ?? t)), outside], [311, true, []],
    "ascending, the duplicate once, nothing outside [start, end), no gap filled, not even by a margin candle");
  assert.deepEqual([doc?.product, doc?.granularity, doc?.start, doc?.end_exclusive, doc?.count, doc?.missing.slice(0, 2), doc?.missing.at(-1)],
    ["USDT-USD", "15m", iso(at(0)), iso(at(610)), 299, [slot(at(4)), slot(at(298))], slot(at(595))], "every absent grid slot declared, none filled");
});

// killer: scripts/record-coinbase-candles.mjs:239 SDL "if (orphans.length > 0)" -> ""
test("coinbase_candles_stops_on_a_slot_that_only_a_margin_serves", async () => {
  // page 1 serves slot 298 as its end margin, page 2 (core 298 to 595) serves nothing: two pages disagree on a slot, a named stop after
  // the last request, nothing normalized, never a gap (G2c-2 of the second G2: a margin candle never fills a gap)
  const first = page([candle(at(298)), ...series(298, [4]).reverse(), candle(at(5)), candle(at(-1)), candle(at(-2))]);
  const r = await record(series(611), at(0), at(610), { script: new Map([[0, first], [1, page([])]]), reading: AFTER_START });
  assert.deepEqual([r.code, parsed(r.detail), r.served.length, rawCount(r.out), normalized(r.out)],
    ["window_inconsistent", { slots: 1, first: iso(at(298)) }, 3, 3, []]);
});

// killer: scripts/record-coinbase-candles.mjs:226 ROR "prior !== line" -> "prior === line"
test("coinbase_candles_refuses_a_conflicting_duplicate_within_or_across_windows", async () => {
  const r = await record([], at(0), at(4), { script: new Map([[0, page([candle(at(2), "1.0002"), candle(at(1)), candle(at(2)), candle(at(0))])]]) });
  assert.deepEqual([r.code, r.served.length, rawCount(r.out), logOf(r.out).length, normalized(r.out)], ["duplicate_conflict", 1, 1, 1, []]);
  const fields = (close: string): string => [String(at(2) / 1000), "0.9990", "1.0010", "1.0000", close, "125.5"].join(",");
  assert.deepEqual(parsed(r.detail), { open_time_ms: at(2), kept_sha256: sha(fields("1.0002")), received_sha256: sha(fields("1.0001")) },
    "the detail names the time and the two digests, never a value");
  // across the cores [0, 298) and [298, 310): page 2 serves a slot of page 1 at its start margin (297) or before its start (100), or its
  // core meets the end margin of page 1 (298); with another close each stops, identical they are only counted
  const pages = (one: readonly Candle[], two: readonly Candle[]): Plan => ({ script: new Map([[0, page(one)], [1, page(two)]]) });
  const core1 = series(298), core2 = series(310).slice(298), odd = (i: number): Candle => candle(at(i), "1.0002");
  const cases: [Plan, string, unknown][] = [[pages(core1, [odd(297), ...core2]), "duplicate_conflict", at(297)],
    [pages(core1, [odd(100), ...core2]), "duplicate_conflict", at(100)], [pages([...core1, odd(298)], core2), "duplicate_conflict", at(298)],
    [pages([...core1, candle(at(298))], [candle(at(100)), candle(at(297)), ...core2]), "ok", [310, 1, 1, 1]]];
  for (const [plan, code, expected] of cases) {
    const x = await record([], at(0), at(310), plan), m = manifestOf(x.out);
    const got = code === "ok" ? [m.rows, m.discarded_before_start, m.margin_at_start, m.margin_at_end] : parsed(x.detail).open_time_ms;
    assert.deepEqual([x.code, got], [code, expected], `${code}: ${JSON.stringify(expected)}`);
  }
});

// killer: scripts/record-coinbase-candles.mjs:149 CONST "manual" -> "follow"
test("coinbase_candles_stops_on_http_refusals_without_retry", async () => {
  const cases: [Reply, string, string | null][] = [
    [{ status: 429, headers: { "retry-after": "1" } }, "rate_limited", "1"],
    [{ status: 500 }, "server_error", null],
    [{ status: 503 }, "server_error", null],
    [{ status: 300 }, "redirect_refused", null],
    [{ status: 302, headers: { location: "/elsewhere" } }, "redirect_refused", null],
    [{ status: 301, headers: { location: "/moved" } }, "redirect_refused", null], // relative: even a mutant that follows stays on loopback
    [{ status: 404, body: JSON.stringify({ message: "NotFound" }) }, "http_status", null],
    [{ status: 400, body: JSON.stringify({ message: "granularity too small for the requested time range" }) }, "http_status", null],
    [{ status: 403 }, "http_status", null],
  ];
  const kept = `USDT-USD-${String(at(0))}.json`;
  for (const [reply, code, retryAfter] of cases) {
    const r = await record(series(4), at(0), at(4), { script: new Map([[0, reply]]) }), log = logOf(r.out);
    assert.deepEqual([r.code, r.served.length, log.length, log[0]?.status, log[0]?.headers["retry-after"], rawCount(r.out), normalized(r.out)],
      [code, 1, 1, reply.status, retryAfter, 0, []], `status ${String(reply.status)}: one request, logged, never retried, nothing normalized`);
    const body = bytes(join(r.out, "raw", "errors", kept));
    assert.deepEqual([errorsOf(r.out), log[0]?.file, log[0]?.sha256, body.toString("utf8")], [[kept], `raw/errors/${kept}`, sha(body), reply.body ?? ""],
      `status ${String(reply.status)}: its body kept under raw/errors/, its sha256 in requests.jsonl`);
    assert.ok(STOPS.includes(code), code);
  }
  const late = await record(series(310), at(0), at(310), { script: new Map([[1, { status: 500 }]]) });
  assert.deepEqual([late.code, late.served.length, rawCount(late.out), errorsOf(late.out).length, logOf(late.out).length, normalized(late.out)],
    ["server_error", 2, 1, 1, 2, []]);
  const cut = await record(series(4), at(0), at(4), { script: new Map([[0, { status: 0, cut: true }]]) });
  assert.deepEqual([cut.code, cut.served.length, existsSync(join(cut.out, "requests.jsonl")), normalized(cut.out)], ["network_error", 1, false, []]);
});

// killer: scripts/record-coinbase-candles.mjs:206 SDL "ms % ctx.step !== 0" -> ""
test("coinbase_candles_stops_on_bad_bodies_and_candles", async () => {
  const body = (b: string): Reply => ({ status: 200, body: b }), t = String(at(1) / 1000), v = "1,2,3,4,5";
  const cases: [Reply, string][] = [
    [body("<html>blocked</html>"), "body_not_json"], [body(""), "body_not_json"], [body(JSON.stringify({ message: "NotFound" })), "body_not_candles"],
    [body("null"), "body_not_candles"], [body(`[[${t},1,2,3,4]]`), "row_shape"], [body(`[[${t},${v},6]]`), "row_shape"],
    [body(`[[${t},"1.0",2,3,4,5]]`), "row_shape"], [body(`[[${t},null,2,3,4,5]]`), "row_shape"], [body(`[[${t},[1],2,3,4,5]]`), "row_shape"],
    [body(`[${t}]`), "row_shape"], [body(`[[${t},-1.0,2,3,4,5]]`), "row_shape"], [body(`[[${t},1e-7,2,3,4,5]]`), "row_shape"],
    [body(`[[${t},1.5E+2,2,3,4,5]]`), "row_shape"], [body(`[[${t}.0,${v}]]`), "row_shape"], [body(`[[1672618.5e3,${v}]]`), "row_shape"],
    [body(`[[-${t},${v}]]`), "row_shape"], [body(`[[9007199254741,${v}]]`), "row_shape"], [body(`[[${String(at(1) / 1000 + 60)},${v}]]`), "off_grid"],
    [body(`[[${String(at(-1) / 1000 + 1)},${v}]]`), "off_grid"], [body(`[[${t},${v}],[${String(at(2) / 1000 + 1)},${v}]]`), "off_grid"],
    [body(`[[${t},${v}],[${String(at(5) / 1000)},${v}]]`), "out_of_window"], // after the requested end: a window not served as asked
  ];
  for (const [reply, code] of cases) {
    const r = await record([], at(0), at(4), { script: new Map([[0, reply]]) });
    assert.deepEqual([r.code, r.served.length, rawCount(r.out), normalized(r.out)], [code, 1, 1, []], `${reply.body ?? ""}: raw kept, nothing normalized`);
    assert.ok(STOPS.includes(code), code);
  }
  const second = await record([], at(0), at(4), { script: new Map([[0, body(`[[${t},${v}],[${t},${v},6]]`)]]) });
  assert.deepEqual([second.code, parsed(second.detail)], ["row_shape", { page: iso(at(0)), row: 1, why: "not 6 numbers" }]);
});

// killer: scripts/record-coinbase-candles.mjs:281 ROR "pages > MAX_PAGES" -> "pages >= MAX_PAGES"
test("coinbase_candles_refuses_more_than_one_hundred_windows_before_any_request", async () => {
  const start = Date.UTC(2022, 0, 1), cap = start + 100 * 298 * STEP_MS, over = await record([], start, cap + STEP_MS);
  assert.deepEqual([over.code, over.calls.urls.length, existsSync(over.out), MAX_PAGES, windowCount(start, cap + STEP_MS), windowCount(start, cap)],
    ["too_many_pages", 0, false, 100, 101, 100], "101 windows: refused before any request, nothing created");
  const full = await record([], start, cap), m = manifestOf(full.out);
  assert.deepEqual([full.code, full.served.length, full.sleeps.length, m.pages, m.rows, m.missing], ["ok", 100, 99, 100, 0, 29_800]);
});

// killer: scripts/record-coinbase-candles.mjs:127 SDL "if (existsSync(join(dir, " -> ""
test("coinbase_candles_refuses_an_unusable_output_directory", async () => {
  const full = fresh(), file = fresh(), repo = fresh(), worktree = fresh(), empty = fresh(), link = fresh();
  mkdirSync(full);
  writeFileSync(join(full, "keep.txt"), "kept");
  writeFileSync(file, "a file");
  mkdirSync(join(repo, ".git"), { recursive: true });
  mkdirSync(join(repo, "inner"));
  symlinkSync(join(repo, "inner"), link, "junction"); // a link out of the repository: only its resolved path holds .git
  mkdirSync(worktree);
  writeFileSync(join(worktree, ".git"), "gitdir: elsewhere");
  mkdirSync(empty);
  const cases: [string, string][] = [[full, "out_not_empty"], [file, "out_not_empty"], [join(repo, "deep", "out"), "out_in_git_tree"],
    [join(worktree, "out"), "out_in_git_tree"], [join(link, "out"), "out_in_git_tree"]];
  for (const [out, code] of cases) {
    const r = await record(series(4), at(0), at(4), { out });
    assert.deepEqual([r.code, r.calls.urls.length], [code, 0], `${code}: refused before any request`);
  }
  assert.deepEqual([existsSync(join(repo, "deep")), existsSync(join(worktree, "out")), existsSync(join(repo, "inner", "out")), readdirSync(full)],
    [false, false, false, ["keep.txt"]]);
  const ok = await record(series(4), at(0), at(4), { out: empty });
  assert.deepEqual([ok.code, ok.calls.urls.length, manifestOf(empty).rows], ["ok", 1, 4], "an empty directory outside any git tree is used");
});

// killer: scripts/record-coinbase-candles.mjs:60 CONST "|_PROXY$/i" -> "/i"
test("coinbase_candles_refuses_any_proxy_route_or_an_unverified_tls", async () => {
  const quoted = `${String.fromCharCode(34)}--use-env-proxy${String.fromCharCode(34)}`; // the form that node parses and the G1 guard missed (G2 F-2)
  const cases: [RecorderIo, string][] = [
    [{ env: { NODE_USE_ENV_PROXY: "1" } }, "proxy_refused"], [{ env: { NODE_USE_ENV_PROXY: "" } }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy"] }, "proxy_refused"], [{ execArgv: ["--experimental-config-file=node.config.json"] }, "proxy_refused"],
    [{ execArgv: ["--max-old-space-size=64"] }, "proxy_refused"], [{ env: { NODE_OPTIONS: quoted } }, "proxy_refused"],
    [{ env: { NODE_OPTIONS: "--max-old-space-size=64" } }, "proxy_refused"], [{ env: { NODE_OPTIONS: "" } }, "proxy_refused"],
    [{ env: { node_options: "--use-env-proxy" } }, "proxy_refused"], [{ env: { HTTPS_PROXY: "http://127.0.0.1:9" } }, "proxy_refused"],
    [{ env: { http_proxy: "http://127.0.0.1:9" } }, "proxy_refused"], [{ env: { All_Proxy: "socks5://127.0.0.1:9" } }, "proxy_refused"],
    [{ env: { NO_PROXY: "*" } }, "proxy_refused"], [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "0" } }, "tls_unverified"],
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "1", PROXY: "x", PATH: "F:/bin", NODE_PATH: "F:/lib" } }, "ok"],
  ];
  for (const [io, code] of cases) {
    const r = await record(series(4), at(0), at(4), { io });
    assert.deepEqual([r.code, r.calls.urls.length, existsSync(r.out)], [code, code === "ok" ? 1 : 0, code === "ok"], JSON.stringify(io));
  }
  const io: RecorderIo = { env: { https_proxy: "http://user:secret@127.0.0.1:9", NODE_OPTIONS: "--x" }, execArgv: ["--import=./x.mjs"] };
  const named = await record(series(4), at(0), at(4), { io });
  assert.deepEqual([named.code, parsed(named.detail), named.detail.includes("secret")], ["proxy_refused",
    { variables: ["NODE_OPTIONS", "https_proxy"], flags: ["--import"] }, false], "the detail names the variables and the flags, never a value");
});

// killer: scripts/record-coinbase-candles.mjs:61 CONST "NODE_USE_SYSTEM_CA|" -> ""
test("coinbase_candles_refuses_any_variable_that_widens_the_tls_trust", async () => {
  // NODE_USE_SYSTEM_CA=1 is set in the agent sessions of this host (G2c-1 of the second G2: 341 trusted roots instead of the 145 bundled
  // with node); each of the five names, in any case and with any value, even empty, stops before any request, its detail naming it
  const names = ["NODE_USE_SYSTEM_CA", "node_use_system_ca", "NODE_EXTRA_CA_CERTS", "Node_Extra_CA_Certs", "SSL_CERT_FILE", "ssl_cert_file",
    "SSL_CERT_DIR", "Ssl_Cert_Dir", "OPENSSL_CONF", "openssl_conf"];
  for (const name of names) {
    for (const value of ["1", "", "F:/certs/extra.pem"]) {
      const r = await record(series(4), at(0), at(4), { io: { env: { [name]: value } } });
      assert.deepEqual([r.code, parsed(r.detail), r.calls.urls.length, existsSync(r.out)], ["proxy_refused", { variables: [name], flags: [] }, 0, false],
        `${name}=${value}`);
    }
  }
  const io: RecorderIo = { env: { SSL_CERT_DIR: "F:/secret-dir", NODE_EXTRA_CA_CERTS: "F:/secret.pem", OPENSSL_CONF: "F:/secret.cnf",
    NODE_USE_SYSTEM_CA: "secret", SSL_CERT_FILE: "F:/secret.crt" } };
  const all = await record(series(4), at(0), at(4), { io });
  assert.deepEqual([all.code, parsed(all.detail), all.detail.includes("secret")], ["proxy_refused", { variables: ["NODE_EXTRA_CA_CERTS",
    "NODE_USE_SYSTEM_CA", "OPENSSL_CONF", "SSL_CERT_DIR", "SSL_CERT_FILE"], flags: [] }, false], "the five names, sorted, never a value");
});

// killer: scripts/record-coinbase-candles.mjs:61 CONST "|^OPENSSL_" -> ""
test("coinbase_candles_refuses_any_variable_whose_name_starts_with_openssl", async () => {
  // the four OpenSSL names that passed the name-by-name guard of the Binance recorder (its re-review rr2, G2RR2-5), and two other cases:
  // any name that starts with OPENSSL_, any value, stops before any request; a name that only contains it is not refused
  for (const name of ["OPENSSL_CONF_INCLUDE", "OPENSSL_ENGINES", "OPENSSL_MODULES", "OPENSSL_ia32cap", "openssl_modules", "OpenSSL_Engines"]) {
    const r = await record(series(4), at(0), at(4), { io: { env: { [name]: "" } } });
    assert.deepEqual([r.code, parsed(r.detail), r.calls.urls.length, existsSync(r.out)], ["proxy_refused", { variables: [name], flags: [] }, 0, false], name);
  }
  const near = await record(series(4), at(0), at(4), { io: { env: { MY_OPENSSL_CONF: "1" } } });
  assert.deepEqual([near.code, near.calls.urls.length], ["ok", 1], "MY_OPENSSL_CONF does not start with OPENSSL_: recorded");
});

// killer: scripts/record-coinbase-candles.mjs:246 CONST "...rows.get(t).slice(1)" -> "...rows.get(t).slice(1).map(Number)"
test("coinbase_candles_keeps_numbers_byte_for_byte", async () => {
  const long = "123456789012345678901234567890.123456789012345678901234567890", ws = String.fromCharCode(32, 9, 13, 10);
  const t = String(at(0) / 1000), u = String(at(1) / 1000);
  const body = `${ws}[${ws}[${t},0.99990000,${long},1,1.0001,0.000000000000000000000001]${ws},${ws}[${ws}${u}${ws},${ws}0${ws},0,0,0.0,0]${ws}]${ws}`;
  const r = await record([], at(0), at(2), { script: new Map([[0, { status: 200, body }]]) });
  assert.equal(r.code, "ok");
  assert.deepEqual(text(r.out, "USDT-USD-15m.csv").split(LF), [HEADER, [iso(at(0)), String(at(0)), "0.99990000", long, "1", "1.0001",
    "0.000000000000000000000001"].join(","), [iso(at(1)), String(at(1)), "0", "0", "0", "0.0", "0"].join(","), ""], "numbers as received, never a float");
  assert.deepEqual(bytes(join(r.out, "raw", `USDT-USD-${String(at(0))}.json`)), Buffer.from(body), "raw/ holds the bytes as received");
});

// killer: scripts/record-coinbase-candles.mjs:169 SDL "ctx.used.add(name);" -> ""
test("coinbase_candles_replays_raw_to_the_same_bytes", async () => {
  const first = page([candle(at(298)), ...series(298, [4]).reverse(), candle(at(5)), candle(at(-1))]);
  const r = await record(series(306), at(0), at(305), { script: new Map([[0, first]]) });
  assert.equal(r.code, "ok");
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], naps: number[] = [], out = fresh();
  // the exit code, or -1 when main throws: every outcome is compared by assert; the replay never requests, so no environment guard
  const replay = (from: string, to: string, start = at(0), end = at(305)): Promise<number> => main([...argvOf(start, end, to), "--from-raw", from],
    { fetch: offline(calls), env: { NODE_USE_ENV_PROXY: "1" }, print: (l) => { lines.push(l); }, sleep: (ms) => { naps.push(ms); return Promise.resolve(); } })
    .catch(() => -1);
  assert.equal(await replay(r.out, out), 0);
  const m = manifestOf(out), orig = manifestOf(r.out);
  assert.deepEqual([lines[0], naps], [JSON.stringify({ ok: true, mode: "replay", product: "USDT-USD", rows: 304, missing: 1, csv_sha256: orig.csv_sha256 }),
    []], "the success line of main; a replay never pauses");
  assert.deepEqual([text(out, "USDT-USD-15m.csv"), text(out, "missing.json")], [text(r.out, "USDT-USD-15m.csv"), text(r.out, "missing.json")]);
  assert.deepEqual([m.mode, m.from_raw, m.csv_sha256, m.missing_sha256, m.rows, m.missing, m.duplicates_removed, m.discarded_before_start,
    m.margin_at_start, m.margin_at_end, m.pages, calls.urls.length, readdirSync(out).sort()], ["replay", resolve(r.out), orig.csv_sha256,
    orig.missing_sha256, 304, 1, 1, 0, 2, 2, 2, 0, ["SHA256SUMS", "USDT-USD-15m.csv", "manifest.json", "missing.json"]]);
  // the intact pages over another range: a window without its page (start one slot later), then a page without its window (one window)
  assert.deepEqual([await replay(r.out, fresh(), at(1)), await replay(r.out, fresh(), at(0), at(298)), calls.urls.length], [1, 1, 0]);
  assert.deepEqual(lines.map((l) => (JSON.parse(l) as { ok: boolean; stop?: string }).stop ?? "written"),
    ["written", "raw_page_missing", "raw_page_unused"], "one JSON line per run: written, then the two named stops of the replay");
});

// killer: scripts/record-coinbase-candles.mjs:100 SDL "!Object.hasOwn(GRANULARITIES, granularity)" -> ""
test("coinbase_candles_refuses_bad_arguments", async () => {
  const base = ["--product", "USDT-USD", "--granularity", "15m", "--start", "2023-01-02T00:00Z", "--end", "2023-01-02T01:00Z"];
  const swap = (flag: string, value: string): string[] => base.map((v, i) => (base[i - 1] === flag ? value : v));
  const cases: [string[], string][] = [
    [swap("--product", "BTC-USD"), "bad_product"], [swap("--product", "usdt-usd"), "bad_product"], [swap("--product", "USDT-USDC"), "bad_product"],
    [swap("--granularity", "900"), "bad_granularity"], [swap("--granularity", "1h"), "bad_granularity"], [swap("--granularity", "15M"), "bad_granularity"],
    [swap("--granularity", ""), "bad_granularity"], [swap("--granularity", "constructor"), "bad_granularity"], // a prototype key is not in the list
    [swap("--start", "2023-01-02T00:00:30Z"), "bad_time"], [swap("--start", "2023-01-02T00:05Z"), "bad_time"],
    [swap("--start", "2023-01-01T24:00Z"), "bad_time"], [swap("--end", "2023-02-30T00:00Z"), "bad_time"], // parsed leniently: round trip
    [swap("--start", "2023-01-02 00:00Z"), "bad_time"], [swap("--end", "2023-01-02T00:00Z"), "bad_time"],
    [swap("--end", "2099-01-01T00:00Z"), "end_in_future"], [[...base, "--from-raw", "--x"], "usage"], [[...base, "--limit", "5"], "usage"],
    [[...base, "--product", "USDT-USD"], "usage"], [[...base, "--symbol", "BTCUSDT"], "usage"],
  ];
  for (const [argv, code] of cases) {
    const out = fresh(), calls: Calls = { urls: [], inits: [] };
    const [got] = await outcome(run([...argv, "--out", out], { fetch: offline(calls), env: {}, execArgv: [] }));
    assert.deepEqual([got, calls.urls.length, existsSync(out)], [code, 0, false], argv.join(" "));
  }
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], print = (l: string): void => { lines.push(l); };
  const [noOut] = await outcome(run(base, { fetch: offline(calls) })), [noValue] = await outcome(run([...base, "--out"], { fetch: offline(calls) }));
  assert.deepEqual([noOut, noValue], ["usage", "usage"], "--out absent, then without a value");
  const plain = fresh(), said: [string, boolean][] = [];
  writeFileSync(plain, "a file");
  const crash = await main([...base, "--out", join(plain, "x")], { fetch: offline(calls), env: {}, execArgv: [], print: (l, toStderr) => {
    said.push([l, toStderr]);
  } }).catch(() => -1);
  const line = JSON.parse(said[0]?.[0] ?? "{}") as { ok?: boolean; error?: string; message?: string; stop?: string };
  assert.deepEqual([crash, said.length, said[0]?.[1], line.ok, line.error, line.stop, line.message?.startsWith("ENOTDIR"), calls.urls.length],
    [3, 1, true, false, "Error", undefined, true, 0], "an unforeseen error (no directory under a file): exit 3, one JSON line on stderr, no stop");
  assert.deepEqual([await main([...swap("--start", "2023-01-02T00:05Z"), "--out", fresh()], { fetch: offline(calls), print }), await main(base, { print }),
    calls.urls.length], [1, 2, 0]);
  assert.deepEqual(lines, [JSON.stringify({ ok: false, stop: "bad_time", detail: { value: "2023-01-02T00:05Z", why: "not on the 15-minute grid" } }),
    JSON.stringify({ ok: false, stop: "usage", detail: { absent: ["out"] } })], "the exact line that main prints for each stop");
  assert.deepEqual([GRANULARITIES, Object.isFrozen(GRANULARITIES), PRODUCTS], [{ "15m": 900 }, true, ["USDT-USD"]], "the closed lists");
});

// killer: scripts/record-coinbase-candles.mjs:136 CONST "!HOSTS.includes(u.host)" -> "!HOSTS.includes(u.hostname)"
test("coinbase_candles_checks_the_host_before_each_request", () => {
  const codeOf = (url: string): string => {
    try { checkHost(url); return "ok"; } catch (e) { return e instanceof RecorderStop ? e.code : "not a stop"; }
  };
  const refused = ["http://api.exchange.coinbase.com/products/USDT-USD/candles", "https://api.exchange.coinbase.com:8443/products/USDT-USD/candles",
    "https://api.exchange.coinbase.com.example.org/products", "https://example.org/api.exchange.coinbase.com/products",
    "https://user:pw@api.exchange.coinbase.com/products", "https://user@api.exchange.coinbase.com/products", "https://:pw@api.exchange.coinbase.com/products",
    "api.exchange.coinbase.com/products", ""];
  assert.deepEqual([codeOf(`${CANDLES}?granularity=900&start=2023-01-02T00:00:00Z&end=2023-01-02T01:00:00Z`), ...refused.map(codeOf)],
    ["ok", ...refused.map(() => "host_refused")], "https, the one host, no port, no user: anything else is refused");
  assert.deepEqual([HOSTS, ORIGIN], [["api.exchange.coinbase.com"], "https://api.exchange.coinbase.com"]);
});

// killer: scripts/record-coinbase-candles.mjs:109 CONST "Math.ceil(" -> "Math.floor("
test("coinbase_candles_records_2880_candles_in_september_2022_and_plans_50_months", async () => {
  const start = Date.UTC(2022, 8, 1), end = Date.UTC(2022, 9, 1);
  const r = await record(Array.from({ length: 2880 }, (_, i) => candle(start + i * STEP_MS)), start, end, { io: { now: () => end } }); // end = now: closed
  const m = manifestOf(r.out), opens = opensOf(r.out);
  assert.deepEqual([r.code, m.expected, m.rows, m.missing, m.pages, r.sleeps.length, m.margin_at_start, m.margin_at_end, m.first_open_time,
    m.last_open_time], ["ok", 2880, 2880, 0, 10, 9, 9, 9, "2022-09-01T00:00:00Z", "2022-09-30T23:45:00Z"]);
  assert.deepEqual([opens.length, opens.every((t, i) => t === start + i * STEP_MS)], [2880, true], "every slot once, ascending");
  // the plan of the monthly runs (D-5): 50 months from 2022-08 (its last candle is the first reading of 2022-09-01) to 2026-09, one run
  // each, 10 windows a month; one run over the whole range is refused (491 windows)
  const months = Array.from({ length: 50 }, (_, i) => [Date.UTC(2022, 7 + i, 1), Date.UTC(2022, 8 + i, 1)] as const), from = Date.UTC(2022, 7, 1);
  assert.deepEqual([iso(months[0]?.[0] ?? 0), iso(months.at(-1)?.[1] ?? 0), months.map(([a, b]) => windowCount(a, b)).every((w) => w === 10),
    months.reduce((sum, [a, b]) => sum + windowCount(a, b), 0), expectedCount(from, Date.UTC(2026, 9, 1)), windowCount(from, Date.UTC(2026, 9, 1)),
    windowCount(Date.UTC(2023, 1, 1), Date.UTC(2023, 2, 1))], ["2022-08-01T00:00:00Z", "2026-10-01T00:00:00Z", true, 500, 146_112, 491, 10]);
});

// killer: scripts/record-coinbase-candles.mjs:143 CONST "isoOf(from - ctx.step)" -> "isoOf(from)"
test("coinbase_candles_declares_no_false_gap_under_seven_readings_of_the_bounds", async () => {
  // the seven readings of start and end of the G2 probe p-robust.mjs (the documentation reads neither bound: FAITS part 4) over three
  // windows, [0, 700); a complete series, and one with gaps every 7 slots, at the edges of the cores and margins, and in a block longer
  // than a window (B and C then serve candles before start): zero false gap and every candle accounted for, except D, a named stop
  const ids = Array.from({ length: 1500 }, (_, i) => i - 400), far = Array.from({ length: 300 }, (_, i) => candle(at(5000 + i)));
  const holed = ids.filter((i) => i % 7 !== 3 && (i < 300 || i >= 620) && ![-1, 0, 297, 298, 699, 700].includes(i));
  const truth = ids.filter((i) => i >= 0 && i < 700 && !holed.includes(i)).map(at);
  const readings: [string, Reading][] = [["A [start, end)", (cs, s, e) => cs.filter((c) => c[0] >= s && c[0] < e)],
    ["B the 300 latest at or before end", (cs, s, e) => cs.filter((c) => c[0] <= e).slice(-300)],
    ["C the 300 latest before end", (cs, s, e) => cs.filter((c) => c[0] < e).slice(-300)], ["D the window ignored", () => far], ["E [start, end]", BOTH],
    ["F (start, end]", (cs, s, e) => cs.filter((c) => c[0] > s && c[0] <= e)],
    ["G [start, end], over 300 points refused", (cs, s, e) => ((e - s) / 900 >= 300 ? null : BOTH(cs, s, e))]];
  const kinds: [string, number[], number[]][] = [["complete", ids, []], ["gapped", holed, truth]];
  for (const [name, reading] of readings) {
    for (const [kind, have, gaps] of kinds) {
      const r = await record(have.map((i) => candle(at(i))), at(0), at(700), { reading }), m = manifestOf(r.out);
      const missing = (jsonOf(r.out, "missing.json") as MissingDoc | null)?.missing.map((s) => s.open_time_ms) ?? [];
      const bilan = r.code === "ok" ? m.rows + m.duplicates_removed + m.discarded_before_start + m.margin_at_start + m.margin_at_end - r.candles : null;
      assert.deepEqual([r.code, missing, bilan], name.startsWith("D") ? ["out_of_window", [], null] : ["ok", gaps, 0], `${name}, ${kind} series`);
    }
  }
});

// killer: scripts/record-coinbase-candles.mjs:236 SDL "if (served > 0 && inside === 0)" -> ""
test("coinbase_candles_writes_no_false_gap_under_eighteen_readings_of_eight_series", async () => {
  // the 144 runs of the probe p-patched-g2c.mjs of the second G2 (G2c-2), September 2022: eight series (complete, the G2 gaps, gaps on
  // every edge of the cores and margins, random gaps at 30 % twice and at 70 %, a hole of 400 slots, one over a whole request) under
  // eighteen readings (the seven; start and end excluded; caps of 299 and 298; a past window; a candle past end; end ignored; windows
  // 2, 8 or 299 slots earlier, 1 later), each page built in memory: a run writes exactly its true gaps or ends in the named stop that
  // the G2 measured (o written, i window_inconsistent, n window_not_served, w out_of_window), never an exit 0 with a false gap
  const S = Date.UTC(2022, 8, 1), E = Date.UTC(2022, 9, 1), CORE_MS = 298 * STEP_MS, grid = Array.from({ length: 4081 }, (_, i) => S + (i - 800) * STEP_MS);
  let seed = 0;
  const rnd = (): number => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; // the probe's sequence, as written
  const drawn = (s: number, p: number): Set<number> => { seed = s; return new Set(grid.filter(() => rnd() < p)); };
  const span = (a: number, b: number): Set<number> => new Set(grid.filter((t) => t >= S + a * STEP_MS && t < S + b * STEP_MS));
  const edges = new Set<number>();
  for (let f = S; f < E; f += CORE_MS) for (const t of [f - STEP_MS, f, Math.min(f + CORE_MS, E) - STEP_MS, Math.min(f + CORE_MS, E)]) edges.add(t);
  const kinds: [string, Set<number>][] = [["complete", new Set()], ["g2like", new Set(grid.filter((t, i) => i % 7 === 3 || (i >= 1400 && i < 1450)
    || t === S || t === S + 300 * STEP_MS))], ["edges", edges], ["rnd30a", drawn(7, 0.3)], ["rnd30b", drawn(11, 0.3)], ["rnd70", drawn(13, 0.7)],
    ["hole400", span(1000, 1400)], ["hole_window", span(1150, 1550)]];
  type Serve = (x: number[], s: number, e: number) => number[] | null;
  const both = (x: number[], s: number, e: number): number[] => x.filter((t) => t >= s && t <= e);
  const shift = (k: number): Serve => (x, s, e) => both(x, s + k * STEP_MS, e + k * STEP_MS);
  const readings: [string, Serve][] = [["A", (x, s, e) => x.filter((t) => t >= s && t < e)], ["B", (x, s, e) => x.filter((t) => t <= e).slice(-300)],
    ["C", (x, s, e) => x.filter((t) => t < e).slice(-300)], ["D", () => Array.from({ length: 300 }, (_, i) => Date.UTC(2026, 8, 30) - i * STEP_MS)],
    ["E", both], ["F", (x, s, e) => x.filter((t) => t > s && t <= e)],
    ["G", (x, s, e) => (Math.floor((e - s) / STEP_MS) + 1 > 300 ? null : both(x, s, e))], ["H_open", (x, s, e) => x.filter((t) => t > s && t < e)],
    ["K_cap299_latest", (x, s, e) => both(x, s, e).slice(-299)], ["L_cap299_earliest", (x, s, e) => both(x, s, e).slice(0, 299)],
    ["M_cap298_latest", (x, s, e) => both(x, s, e).slice(-298)], ["N_past_window", (x) => x.filter((t) => t >= S - 700 * STEP_MS).slice(0, 300)],
    ["P_one_past_end", (x, s, e) => x.filter((t) => t >= s && t <= e + STEP_MS)], ["Q_end_ignored", (x, s) => x.filter((t) => t >= s).slice(0, 300)],
    ["S2_earlier_2", shift(-2)], ["S8_earlier_8", shift(-8)], ["S299_earlier_299", shift(-299)], ["T1_later_1", shift(1)]];
  const letter: Record<string, string> = { ok: "o", window_inconsistent: "i", window_not_served: "n", out_of_window: "w" };
  const table: string[] = [], wrong: string[] = [];
  for (const [rn, serve] of readings) {
    let row = "";
    for (const [kn, hole] of kinds) {
      const x = grid.filter((t) => !hole.has(t)), out = fresh();
      let served = 0;
      const pages = (url: string): Promise<Response> => {
        const q = new URL(url).searchParams, got = serve(x, Date.parse(q.get("start") ?? ""), Date.parse(q.get("end") ?? ""));
        served += got?.length ?? 0;
        const body = got === null ? "{}" : bodyOf([...got].sort((a, b) => b - a).map((t) => candle(t)));
        return Promise.resolve(new Response(body, { status: got === null ? 400 : 200 }));
      };
      const [code] = await outcome(run(argvOf(S, E, out), { fetch: pages, sleep: () => Promise.resolve(), env: {}, execArgv: [] }));
      row += letter[code] ?? "?";
      if (code !== "ok") continue;
      const m = manifestOf(out), declared = (jsonOf(out, "missing.json") as MissingDoc | null)?.missing.map((s) => s.open_time_ms) ?? [];
      const truth = [...hole].filter((t) => t >= S && t < E).sort((a, b) => a - b);
      const bilan = m.rows + m.duplicates_removed + m.discarded_before_start + m.margin_at_start + m.margin_at_end - served;
      if (declared.join() !== truth.join() || bilan !== 0) {
        wrong.push(`${rn} ${kn}: ${String(declared.length)} missing, ${String(truth.length)} true gaps, bilan ${String(bilan)}`);
      }
    }
    table.push(`${rn} ${row}`);
  }
  assert.deepEqual(wrong, [], "a run that writes declares exactly its true gaps, every candle accounted for");
  assert.deepEqual(table, ["A oooooooo", "B ooooooon", "C ooooooon", "D wwwwwwww", "E oooooooo", "F oooooooo", "G oooooooo", "H_open oooooooo",
    "K_cap299_latest oooooooo", "L_cap299_earliest oooooooo", "M_cap298_latest ioooooii", "N_past_window nnnnnwnn", "P_one_past_end wwwwwwww",
    "Q_end_ignored wwwwwwww", "S2_earlier_2 iioiiiii", "S8_earlier_8 iiiiiiii", "S299_earlier_299 nnnnnnnn", "T1_later_1 wwwwwwww"],
    "the stop of each run, series by series, is the one that the G2 measured");
});

/** Three requests over [0, 600) (cores [0, 298), [298, 596), [596, 600)), request n answered by the slots that `pages` n lists, newest
 *  first: the three boundary cases of the probe p-edges-rr2.mjs of the re-review rr2 (RR2-3: W06, W04, W01). */
const edges = (pages: readonly (readonly number[])[]): Promise<Recording> => record([], at(0), at(600),
  { script: new Map(pages.map((ids, n): [number, Reply] => [n, page(ids.map((i) => candle(at(i))).reverse())])) });
const range = (a: number, b: number): number[] => Array.from({ length: b - a }, (_, k) => a + k);

// killer: scripts/record-coinbase-candles.mjs:238 ROR "t >= ctx.start" -> "t > ctx.start"
test("coinbase_candles_stops_on_a_start_slot_that_only_a_later_page_serves", async () => {
  // page 1 serves its core but not the --start slot, page 2 serves that slot before its own start: served, kept by no core, a named stop,
  // never an exit 0 that declares a served slot missing
  const r = await edges([range(1, 299), [0, ...range(297, 597)], range(595, 601)]);
  assert.deepEqual([r.code, parsed(r.detail), r.served.length, normalized(r.out)], ["window_inconsistent", { slots: 1, first: iso(at(0)) }, 3, []]);
});

// killer: scripts/record-coinbase-candles.mjs:236 CONST "served > 0 &&" -> "served > 1 &&"
test("coinbase_candles_stops_on_a_page_of_one_candle_before_its_window", async () => {
  // page 2 serves one candle, slot 10, before its own start (page 1 served it): not its window, a named stop at that page
  const r = await edges([range(-1, 299), [10], range(595, 601)]);
  assert.deepEqual([r.code, parsed(r.detail), r.served.length, normalized(r.out)], ["window_not_served", { page: iso(at(298)), candles: 1 }, 2, []]);
});

// killer: scripts/record-coinbase-candles.mjs:223 ROR "ms >= first ? 1 : 0" -> "ms > first ? 1 : 0"
test("coinbase_candles_writes_a_page_that_serves_only_its_start_margin_and_older_candles", async () => {
  // page 2 serves its start margin (slot 297) and older candles, its core empty; page 1 serves no end margin, page 3 no start margin:
  // no page serves a slot of core 2, a true gap of 298 slots, written
  const r = await edges([range(-1, 298), range(100, 298), range(596, 601)]), m = manifestOf(r.out);
  const doc = jsonOf(r.out, "missing.json") as MissingDoc | null;
  assert.deepEqual([r.code, r.served.length, m.rows, m.missing, m.discarded_before_start, m.margin_at_start, m.margin_at_end, doc?.missing[0],
    doc?.missing.at(-1)], ["ok", 3, 302, 298, 197, 2, 1, slot(at(298)), slot(at(595))]);
});

/** One run against an endpoint that answers nothing (headers) or stalls inside the body (body): each request carries a delay (300 ms
 *  through the test seam, 30 s by default); the caller gives up after 5 s, so a recorder without a delay reddens a test, never hangs it. */
async function silentRun(silent: "headers" | "body"): Promise<{ code: string; detail: string; requests: number; ms: number; out: string }> {
  const ep = await endpoint([], new Map([[0, { status: 200, silent }]])), calls: Calls = { urls: [], inits: [] }, t0 = Date.now(), out = fresh();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<[string, string]>((done) => { timer = setTimeout(() => { done(["no stop within 5 s", ""]); }, 5000); });
  const io: RecorderIo = { fetch: via(ep, calls), sleep: () => Promise.resolve(), env: {}, execArgv: [], timeoutMs: 300 };
  try {
    const [code, detail] = await Promise.race([outcome(run(argvOf(at(0), at(4), out), io)), late]);
    return { code, detail, requests: ep.urls.length, ms: Date.now() - t0, out };
  } finally { // even when outcome() reddens (a code missing from STOPS): the endpoint and the timer never outlive the test
    clearTimeout(timer);
    await ep.close(); // a recorder still waiting is cut here; outcome() catches its rejection
  }
}

// killer: scripts/record-coinbase-candles.mjs:146 CONST "signal.aborted ?" -> "false ?"
test("coinbase_candles_stops_on_a_silent_endpoint", async () => {
  // no answer at all, then headers without the end of the body: the expiry of the delay is its own named stop (Q-C-5)
  for (const silent of ["headers", "body"] as const) {
    const r = await silentRun(silent);
    assert.deepEqual([r.code, parsed(r.detail).message, r.requests, r.ms < 4000], ["timeout", "The operation was aborted due to timeout", 1, true],
      `silent ${silent}`);
  }
});

// killer: scripts/record-coinbase-candles.mjs:153 SDL "log(line);" -> ""
test("coinbase_candles_logs_the_status_and_headers_of_an_answer_before_its_body", async () => {
  // an answer whose body stalls keeps its status and headers in requests.jsonl (Q-C-12), its body file never written; no answer at all
  // leaves no line
  const none = await silentRun("headers"), stalled = await silentRun("body");
  assert.deepEqual([none.code, linesOf(none.out)], ["timeout", []], "no answer, no line");
  const heads = linesOf(stalled.out).map((l) => [l.status, l.file, l.sha256, l.headers["retry-after"], l.header_names.includes("content-type")]);
  assert.deepEqual([stalled.code, heads, rawCount(stalled.out), normalized(stalled.out)],
    ["timeout", [[200, `raw/USDT-USD-${String(at(0))}.json`, undefined, null, true]], 0, []], "the line of the headers, no body line, no body file");
});

// killer: scripts/record-coinbase-candles.mjs:190 CONST "sha256(readFileSync(page)) !== hash" -> "false"
test("coinbase_candles_refuses_a_replay_of_altered_raw_pages", async () => {
  const r = await record(series(306), at(0), at(305)), page0 = join("raw", rawNames(r.out)[0] ?? "none");
  assert.equal(r.code, "ok");
  /** A copy of the recorded directory with one change. */
  const copy = (change: (dir: string) => void): string => { const dir = fresh(); cpSync(r.out, dir, { recursive: true }); change(dir); return dir; };
  const cases: [string, string][] = [
    [copy((d) => { writeFileSync(join(d, page0), text(d, page0).replace("1.0001", "1.0002")); }), "sha256 differs"],
    [copy((d) => { rmSync(join(d, "SHA256SUMS")); }), "no SHA256SUMS"],
    [copy((d) => { writeFileSync(join(d, "raw", "USDT-USD-0.json"), "[]"); }), "not listed in SHA256SUMS"],
    [copy((d) => { rmSync(join(d, page0)); }), "listed in SHA256SUMS, absent"],
    [copy((d) => { writeFileSync(join(d, "SHA256SUMS"), text(d, "SHA256SUMS").replace("  ", " ")); }), "malformed line"],
  ];
  for (const [dir, why] of cases) {
    const calls: Calls = { urls: [], inits: [] }, out = fresh(), lines: string[] = [];
    const code = await main([...argvOf(at(0), at(305), out), "--from-raw", dir], { fetch: offline(calls), print: (l) => { lines.push(l); } }).catch(() => -1);
    const said = JSON.parse(lines[0] ?? "{}") as { stop?: string; detail?: { why?: string } };
    assert.deepEqual([code, said.stop, said.detail?.why, existsSync(out), calls.urls.length], [1, "raw_page_altered", why, false, 0], why);
  }
});

// The five mutants of verifyRaw that survived the second G2 (G2c-3: M20, M21, M22, M24, M27), one test each, its killer that mutant.
let recorded: Promise<string> | undefined;
/** One recording over [0, 305), shared by the five tests below (written, else each of them reddens on this assertion). */
const recordedOnce = (): Promise<string> => (recorded ??= record(series(306), at(0), at(305)).then((r) => { assert.equal(r.code, "ok"); return r.out; }));
/** The replay of a copy of the recording changed by `change`: [exit code, stop, why, --out created, requests]. */
async function replayOf(change: (dir: string) => void): Promise<[number, string, string, boolean, number]> {
  const dir = fresh(), out = fresh(), calls: Calls = { urls: [], inits: [] }, lines: string[] = [];
  cpSync(await recordedOnce(), dir, { recursive: true });
  change(dir);
  const code = await main([...argvOf(at(0), at(305), out), "--from-raw", dir], { fetch: offline(calls), print: (l) => { lines.push(l); } }).catch(() => -1);
  const said = JSON.parse(lines[0] ?? "{}") as { stop?: string; detail?: { why?: string } };
  return [code, said.stop ?? "", said.detail?.why ?? "", existsSync(out), calls.urls.length];
}

// killer: scripts/record-coinbase-candles.mjs:176 COR " || !statSync(sums).isFile()" -> ""
test("coinbase_candles_refuses_a_replay_whose_sums_are_a_directory", async () => {
  const swap = (d: string): void => { rmSync(join(d, "SHA256SUMS")); mkdirSync(join(d, "SHA256SUMS")); };
  assert.deepEqual(await replayOf(swap), [1, "raw_page_altered", "no SHA256SUMS", false, 0], "a named stop, never an unforeseen error");
});

// killer: scripts/record-coinbase-candles.mjs:178 CONST "lines.pop() !==" -> "lines.pop(), false ||"
test("coinbase_candles_refuses_a_replay_whose_sums_lack_their_last_line_feed", async () => {
  // the last line (requests.jsonl, after every raw/ line) without its line feed: malformed, never a line dropped in silence
  const strip = (d: string): void => { writeFileSync(join(d, "SHA256SUMS"), text(d, "SHA256SUMS").slice(0, -1)); };
  assert.deepEqual(await replayOf(strip), [1, "raw_page_altered", "malformed line", false, 0]);
});

// killer: scripts/record-coinbase-candles.mjs:181 COR " || names.has(m[2])" -> ""
test("coinbase_candles_refuses_a_replay_whose_sums_list_a_page_twice", async () => {
  const twice = (d: string): void => {
    const sums = text(d, "SHA256SUMS");
    writeFileSync(join(d, "SHA256SUMS"), sums + (sums.split(LF).find((l) => l.includes("  raw/")) ?? "") + LF);
  };
  assert.deepEqual(await replayOf(twice), [1, "raw_page_altered", "malformed line", false, 0], "the same raw/ line twice, identical");
});

// killer: scripts/record-coinbase-candles.mjs:185 CONST "existsSync(raw) ? readdirSync(raw) : []" -> "readdirSync(raw)"
test("coinbase_candles_refuses_a_replay_without_its_raw_directory", async () => {
  const gone = (d: string): void => { rmSync(join(d, "raw"), { recursive: true }); };
  assert.deepEqual(await replayOf(gone), [1, "raw_page_altered", "listed in SHA256SUMS, absent", false, 0], "a named stop, never an unforeseen error");
});

// killer: scripts/record-coinbase-candles.mjs:190 COR "!statSync(page).isFile() || " -> ""
test("coinbase_candles_refuses_a_replay_whose_listed_page_is_a_directory", async () => {
  const swap = (d: string): void => { const p = join(d, "raw", rawNames(d)[0] ?? "none"); rmSync(p); mkdirSync(p); };
  assert.deepEqual(await replayOf(swap), [1, "raw_page_altered", "sha256 differs", false, 0], "a named stop, never an unforeseen error");
});

// killer: scripts/record-coinbase-candles.mjs:318 CONST "realpathSync(process.argv[1]) ===" -> "resolve(process.argv[1]) ==="
test("coinbase_candles_runs_its_command_line_when_launched_through_a_link", () => {
  // the main guard compares real paths (F-4 of the G2 of the EE-7 detector): a copy of the recorder under the temp root, a junction to
  // its directory, one child launched through it with no argument and a minimal environment: a usage stop (exit 2, its JSON line)
  // before any request; a guard by resolve() alone exits 0 there with nothing written
  const dir = fresh(), link = fresh();
  mkdirSync(dir);
  cpSync(fileURLToPath(RECORDER), join(dir, "record-coinbase-candles.mjs"));
  symlinkSync(dir, link, "junction");
  const r = spawnSync(process.execPath, [join(link, "record-coinbase-candles.mjs")], { encoding: "utf8", timeout: 30_000,
    env: { SYSTEMROOT: process.env.SYSTEMROOT }, stdio: ["ignore", "pipe", "pipe"] });
  assert.deepEqual([r.status, r.stdout, r.stderr], [2, "", JSON.stringify({ ok: false, stop: "usage", detail: { absent: ["product", "granularity",
    "start", "end", "out"] } }) + LF]);
});
