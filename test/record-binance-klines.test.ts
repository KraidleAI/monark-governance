// test/record-binance-klines.test.ts -- lot SERIES-BINANCE (2026-10-01): the Binance kline recorder scripts/record-binance-klines.mjs,
// run in-process against a loopback server that imitates GET /api/v3/klines (H-2 of the G1 journal: startTime <= openTime <= endTime,
// ascending, at most limit rows), through an injected fetch that only rewrites https://api.binance.com to that server and refuses any
// other URL. The global fetch is a tripwire for the whole file, and the child processes only start a copy of the recorder with no argument
// (a usage stop) or import it, behind a dead loopback proxy that the recorder refuses anyway: no test reaches the network, even under a
// mutant. Each test names, on the line above it, the production mutation that reddens it (scripts/red-proof.mjs convention); every
// outcome is compared by assert. Outputs live under the OS temp directory, outside any git tree, removed after the file.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CSV_COLUMNS, expectedCount, LIMIT, main, MAX_PAGES, parseArgs, parseTime, PAUSE_MS, RecorderStop, run, STOPS, SYMBOLS }
  from "../scripts/record-binance-klines.mjs";
import type { RecorderIo, SeriesManifest, SeriesManifestRead, SeriesManifestV1 } from "../scripts/record-binance-klines.mjs";
import * as recorder from "../scripts/record-binance-klines.mjs"; // INTERVALS read as a property: the base, without it, still loads

type Row = [number, string, string, string, string, string, number, string, number, string, string, string];
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
interface Reply { status: number; headers?: Record<string, string>; body?: string; cut?: boolean }
interface Endpoint { base: string; urls: string[]; headers: IncomingHttpHeaders[]; close: () => Promise<void> }
interface Calls { urls: string[]; inits: RequestInit[] }
interface Recording { code: string; out: string; calls: Calls; sleeps: number[]; served: string[]; headers: IncomingHttpHeaders[] }
interface Plan { script?: ReadonlyMap<number, Reply>; perPage?: number; symbol?: string; interval?: string; io?: RecorderIo; out?: string }
interface Logged { url: string; status: number; bytes: number; sha256: string; headers: Record<string, string | null> }
interface MissingDoc { symbol: string; interval: string; start: string; end_exclusive: string; count: number;
  missing: { open_time_ms: number; open_time_utc: string }[] }

const realFetch = globalThis.fetch;
globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
const ORIGIN = "https://api.binance.com", LF = String.fromCharCode(10), T0 = Date.UTC(2025, 0, 1);
const STEP_MS = 900_000, HOUR_MS = 3_600_000, FOUR_HOURS_MS = 14_400_000; // the closed list's durations, written here, never imported
const ROOT = mkdtempSync(join(tmpdir(), "binance-klines-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
const RECORDER = fileURLToPath(new URL("../scripts/record-binance-klines.mjs", import.meta.url)); // copied under ROOT, never run in place
let made = 0;
/** A path that does not exist yet, under the temp root. */
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
const at = (i: number): number => T0 + i * STEP_MS;
const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const row = (t: number, close = "1.50000000", step = STEP_MS): Row =>
  [t, "1.00000000", "2.00000000", "0.50000000", close, "10.00000000", t + step - 1, "15.00000000", 7, "4.00000000", "6.00000000", "0"];
const series = (n: number, skip: readonly number[] = []): Row[] =>
  Array.from({ length: n }, (_, i) => i).filter((i) => !skip.includes(i)).map((i) => row(at(i)));
const page = (ix: readonly number[]): Reply => ({ status: 200, body: JSON.stringify(ix.map((i) => row(at(i)))) });
// Readers of the outputs are total: an absent file reads "", null, {} or no bytes, so a missing output fails an assertion, never an ENOENT.
const text = (out: string, name: string): string => (existsSync(join(out, name)) ? readFileSync(join(out, name), "utf8") : "");
const bytes = (path: string): Buffer => (existsSync(path) ? readFileSync(path) : Buffer.alloc(0));
const jsonOf = (out: string, name: string): unknown => (existsSync(join(out, name)) ? JSON.parse(text(out, name)) as unknown : null);
const manifestOf = (out: string): SeriesManifest => (jsonOf(out, "manifest.json") ?? {}) as SeriesManifest;
const rawNames = (out: string): string[] => (existsSync(join(out, "raw")) ? readdirSync(join(out, "raw")).sort() : []);
/** requests.jsonl, one entry per answer; none when the file is absent (an assertion then names the run's code, never an ENOENT). */
const logOf = (out: string): Logged[] => (existsSync(join(out, "requests.jsonl"))
  ? text(out, "requests.jsonl").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Logged) : []);
/** Files of --out beyond the provenance logs (raw/, requests.jsonl): none after a named stop. */
const normalized = (out: string): string[] => (existsSync(out) ? readdirSync(out).filter((n) => n !== "raw" && n !== "requests.jsonl") : []);
const rawCount = (out: string): number => (existsSync(join(out, "raw")) ? readdirSync(join(out, "raw")).length : 0);
const offline = (calls: Calls): FetchLike => (url, init) => { calls.urls.push(url); calls.inits.push(init); return Promise.reject(new Error("offline")); };

/** A loopback port that fetch accepts. The Fetch port check of this runtime blocks 82 ports, all at or below 10080 (Node 24.15.0, undici
 *  7.24.4, read in its own source; G1 journal of SERIES-BINANCE, section 8). This host hands port 0 out in sequence from 1024 up, through
 *  phases below 10081 that outlast any retry (measured: 300 binds in a row, 3914 to 4213; G1 journal of SERIES-INTERVALS). So a random
 *  port above 10080 is asked for, and another one on any listen error (in use, or excluded by the OS). */
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

/** The loopback endpoint: request n gets `script` n when given (status, headers and body, or a cut connection), else the rows that its
 *  query selects, as H-2 says the real endpoint does. Each request URL and its headers are kept, in order. */
async function endpoint(rows: readonly Row[], script: ReadonlyMap<number, Reply> = new Map(), perPage = LIMIT): Promise<Endpoint> {
  const urls: string[] = [], headers: IncomingHttpHeaders[] = [];
  const server = createServer((req, res) => {
    const n = urls.length, url = req.url ?? "/", fixed = script.get(n);
    urls.push(url);
    headers.push(req.headers);
    if (fixed?.cut === true) { req.socket.destroy(); return; }
    if (fixed !== undefined) { res.writeHead(fixed.status, fixed.headers ?? {}).end(fixed.body ?? ""); return; }
    const q = new URL(url, "http://127.0.0.1").searchParams, from = Number(q.get("startTime")), to = Number(q.get("endTime"));
    const rowsOut = rows.filter((r) => r[0] >= from && r[0] <= to).slice(0, Math.min(Number(q.get("limit")), perPage));
    res.writeHead(200, { "content-type": "application/json", "x-mbx-used-weight-1m": String(2 * (n + 1)) }).end(JSON.stringify(rowsOut));
  });
  const port = await listen(server);
  const close = (): Promise<void> => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => { done(); }); });
  return { base: `http://127.0.0.1:${String(port)}`, urls, headers, close };
}

/** The injected fetch: the recorder's URL rewritten from https://api.binance.com to the loopback server, `init` untouched (so the
 *  redirect mode acts on a real fetch); any other URL is refused, never sent. */
function via(ep: Endpoint, calls: Calls): FetchLike {
  return (url, init) => {
    calls.urls.push(url);
    calls.inits.push(init);
    if (!url.startsWith(`${ORIGIN}/api/v3/klines?`)) return Promise.reject(new Error(`refused ${url}`));
    return realFetch(`${ep.base}${url.slice(ORIGIN.length)}`, init);
  };
}

/** "ok", or the code of the RecorderStop: a mutant that throws anything else reddens by assertion, not by a crash. */
async function outcome(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return "ok";
  } catch (e) {
    return e instanceof RecorderStop ? e.code : `not a stop: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

/** One in-process recording over [start, end) against the loopback endpoint: clean environment, no flag, pauses recorded. */
async function record(rows: readonly Row[], start: number, end: number, plan: Plan = {}): Promise<Recording> {
  const ep = await endpoint(rows, plan.script, plan.perPage), calls: Calls = { urls: [], inits: [] }, sleeps: number[] = [];
  const out = plan.out ?? fresh(), symbol = plan.symbol ?? "BTCUSDT";
  const sleep = (ms: number): Promise<void> => { sleeps.push(ms); return Promise.resolve(); };
  const io: RecorderIo = { fetch: via(ep, calls), sleep, env: {}, execArgv: [], ...plan.io };
  try {
    const code = await outcome(run(["--symbol", symbol, "--interval", plan.interval ?? "15m", "--start", iso(start), "--end", iso(end), "--out", out], io));
    return { code, out, calls, sleeps, served: ep.urls, headers: ep.headers };
  } finally {
    await ep.close();
  }
}

// killer: scripts/record-binance-klines.mjs:157 CONST "${ctx.end - 1}" -> "${ctx.end}"
test("binance_klines_pages_a_full_page_then_a_partial_one", async () => {
  const n = LIMIT + 7, r = await record(series(n), at(0), at(n));
  assert.equal(r.code, "ok");
  const q = (s: number): string =>
    `${ORIGIN}/api/v3/klines?symbol=BTCUSDT&interval=15m&startTime=${String(s)}&endTime=${String(at(n) - 1)}&limit=1000`;
  assert.deepEqual(r.calls.urls, [q(at(0)), q(at(LIMIT))], "cursor = last openTime + 15 min, endTime = end - 1 ms, limit 1000, one host");
  assert.deepEqual([r.sleeps, PAUSE_MS >= 500], [[PAUSE_MS], true], "one pause of at least 500 ms between two requests, none before");
  assert.deepEqual(r.calls.inits.map((i) => [i.redirect, i.headers, i.method]), [["manual", undefined, undefined], ["manual", undefined, undefined]]);
  assert.deepEqual(r.headers.map((h) => [h.authorization, h["x-mbx-apikey"], h.cookie]), [[undefined, undefined, undefined],
    [undefined, undefined, undefined]], "no authentication header reaches the endpoint");
  const m = manifestOf(r.out), csv = text(r.out, "BTCUSDT-15m.csv").split(LF);
  assert.deepEqual([m.mode, m.platform, m.symbol, m.expected, m.rows, m.missing, m.pages, m.duplicates_removed, m.redistributable],
    ["record", "binance", "BTCUSDT", n, n, 0, 2, 0, false]);
  assert.deepEqual([m.first_open_time, m.last_open_time, m.start, m.end_exclusive], [iso(at(0)), iso(at(n - 1)), iso(at(0)), iso(at(n))]);
  assert.deepEqual([csv[0], csv[1], csv.length, csv.at(-1)], [CSV_COLUMNS.join(","), `${iso(at(0))},${String(at(0))},1.00000000,2.00000000,`
    + `0.50000000,1.50000000,10.00000000,${String(at(1) - 1)},15.00000000,7,4.00000000,6.00000000`, n + 2, ""]);
  const raws = rawNames(r.out);
  assert.deepEqual(raws, [`BTCUSDT-${String(at(0))}.json`, `BTCUSDT-${String(at(LIMIT))}.json`]);
  assert.deepEqual(logOf(r.out).map((l) => [l.url, l.status, l.bytes, l.sha256, l.headers["x-mbx-used-weight-1m"]]), raws.map((f, i) => {
    const b = bytes(join(r.out, "raw", f));
    return [r.calls.urls[i], 200, b.length, sha(b), String(2 * (i + 1))];
  }), "requests.jsonl: URL, status, bytes and sha256 of each raw page, weight header");
  const sums = text(r.out, "SHA256SUMS").split(LF).filter((l) => l !== "").map((l): [string, string, string] => [l.slice(0, 64), l.slice(64, 66), l.slice(66)]);
  assert.deepEqual(sums.map((s) => s[2]), ["BTCUSDT-15m.csv", "manifest.json", "missing.json", ...raws.map((f) => `raw/${f}`), "requests.jsonl"]);
  for (const [h, gap, name] of sums) assert.deepEqual([gap, h], ["  ", sha(bytes(join(r.out, name)))], `SHA256SUMS line of ${name}`);
  assert.equal(m.csv_sha256, sha(text(r.out, "BTCUSDT-15m.csv")));
});

// killer: scripts/record-binance-klines.mjs:240 COR "!rows.has(t)" -> "rows.has(t)"
test("binance_klines_removes_an_identical_duplicate_and_declares_gaps", async () => {
  // page 1 skips at(4); page 2 repeats at(5) byte for byte (an overlap); page 3 is the endpoint's; page 4 is empty (a tail gap)
  const r = await record(series(10, [4]), at(0), at(12), { script: new Map([[0, page([0, 1, 2, 3, 5])], [1, page([5, 6, 7])]]) });
  assert.equal(r.code, "ok");
  assert.deepEqual(r.calls.urls.map((u) => new URL(u).searchParams.get("startTime")), [at(0), at(6), at(8), at(10)].map(String));
  const m = manifestOf(r.out), csv = text(r.out, "BTCUSDT-15m.csv").split(LF).slice(1, -1);
  assert.deepEqual([m.expected, m.rows, m.missing, m.duplicates_removed, m.pages], [12, 9, 3, 1, 4]);
  assert.deepEqual(csv.map((l) => Number(l.split(",")[1])), [0, 1, 2, 3, 5, 6, 7, 8, 9].map(at), "ascending, the duplicate once");
  const declared: MissingDoc = { symbol: "BTCUSDT", interval: "15m", start: iso(at(0)), end_exclusive: iso(at(12)), count: 3,
    missing: [4, 10, 11].map((i) => ({ open_time_ms: at(i), open_time_utc: iso(at(i)) })) };
  assert.deepEqual(jsonOf(r.out, "missing.json"), declared, "every absent grid slot declared, none filled");
});

// killer: scripts/record-binance-klines.mjs:223 ROR "JSON.stringify(kept) === JSON.stringify(k)" -> "JSON.stringify(kept) !== JSON.stringify(k)"
test("binance_klines_refuses_a_conflicting_duplicate", async () => {
  const conflict = { status: 200, body: JSON.stringify([row(at(2), "9.99000000"), row(at(3))]) };
  const r = await record(series(4), at(0), at(4), { script: new Map([[0, page([0, 1, 2])], [1, conflict]]) });
  assert.deepEqual([r.code, r.served.length, rawCount(r.out), logOf(r.out).length, normalized(r.out)], ["duplicate_conflict", 2, 2, 2, []]);
});

// killer: scripts/record-binance-klines.mjs:163 CONST "manual" -> "follow"
test("binance_klines_stops_on_http_refusals", async () => {
  const cases: [Reply, string, string | null][] = [
    [{ status: 429, headers: { "retry-after": "30" } }, "rate_limited", "30"],
    [{ status: 418, headers: { "retry-after": "120" } }, "ip_banned", "120"],
    [{ status: 451, body: JSON.stringify({ code: 0, msg: "Service unavailable from a restricted location" }) }, "restricted_location", null],
    [{ status: 500 }, "server_error", null],
    [{ status: 503 }, "server_error", null],
    [{ status: 302, headers: { location: "/elsewhere" } }, "redirect_refused", null],
    [{ status: 404 }, "http_status", null],
    [{ status: 400, body: JSON.stringify({ code: -1121, msg: "Invalid symbol." }) }, "http_status", null],
  ];
  for (const [reply, code, retryAfter] of cases) {
    const r = await record(series(4), at(0), at(4), { script: new Map([[0, reply]]) }), log = logOf(r.out);
    assert.deepEqual([r.code, r.served.length, log.length, log[0]?.status, log[0]?.headers["retry-after"], rawCount(r.out), normalized(r.out)],
      [code, 1, 1, reply.status, retryAfter, 0, []], `status ${String(reply.status)}: one request, logged, never retried, nothing normalized`);
    assert.ok(STOPS.includes(code), code);
  }
  const cut = await record(series(4), at(0), at(4), { script: new Map([[0, { status: 0, cut: true }]]) });
  assert.deepEqual([cut.code, cut.served.length, existsSync(join(cut.out, "requests.jsonl")), normalized(cut.out)], ["network_error", 1, false, []]);
});

// killer: scripts/record-binance-klines.mjs:204 SDL "k[6] < k[0] || k[6] > k[0] + ctx.step - 1" -> ""
test("binance_klines_stops_on_bad_bodies_and_candles", async () => {
  const json = (v: unknown): Reply => ({ status: 200, body: JSON.stringify(v) });
  const base = row(at(1)), off = at(1) + 60_000, late = row(at(2)), early = row(at(1)), numeric: unknown[] = [...base];
  const tradesText: unknown[] = [...base], negative: unknown[] = [...base], exponent: unknown[] = [...base], lastNumber: unknown[] = [...base];
  const before = row(at(1)), atOpen = row(at(2));
  late[6] = at(3);
  early[6] = at(2) - 2;
  before[6] = at(1) - 1;
  atOpen[6] = at(2); // closed at its open, the shortest truncation (BTCUSDT 2017-09-06 16:00Z, 1h and 4h, rebuilt by the G1)
  numeric[4] = 1.5;
  tradesText[8] = "7";
  negative[8] = -1;
  exponent[5] = "1e-8";
  lastNumber[11] = 0;
  const cases: [ReadonlyMap<number, Reply>, string, number][] = [
    [new Map([[0, { status: 200, body: "<html>blocked</html>" }]]), "body_not_json", 1],
    [new Map([[0, json({ code: -1121, msg: "Invalid symbol." })]]), "body_not_klines", 1],
    [new Map([[0, json([base.slice(0, 11)])]]), "row_shape", 1],
    [new Map([[0, json([numeric])]]), "row_shape", 1],
    [new Map([[0, json([tradesText])]]), "row_shape", 1],
    [new Map([[0, json([[...base, "0"]])]]), "row_shape", 1],
    [new Map([[0, json([negative])]]), "row_shape", 1],
    [new Map([[0, json([exponent])]]), "row_shape", 1],
    [new Map([[0, json([lastNumber])]]), "row_shape", 1],
    [new Map([[0, json([[off, ...base.slice(1, 6), off + STEP_MS - 1, ...base.slice(7)]])]]), "off_grid", 1],
    [new Map([[0, json([row(at(-1))])]]), "out_of_range", 1],
    [new Map([[0, json([row(at(4))])]]), "out_of_range", 1],
    [new Map([[0, json([late])]]), "close_out_of_slot", 1], [new Map([[0, json([before])]]), "close_out_of_slot", 1],
    [new Map([[0, page([0, 1])], [1, page([0, 1])]]), "cursor_not_advancing", 2],
  ];
  for (const [script, code, pages] of cases) {
    const r = await record(series(4), at(0), at(4), { script });
    assert.deepEqual([r.code, r.served.length, rawCount(r.out), normalized(r.out)], [code, pages, pages, []], `${code}: raw kept, nothing normalized`);
    assert.ok(STOPS.includes(code), code);
  }
  // a close 1 ms after its slot (late) or 1 ms before its open (before) stops the grid (D-3 of the corrections); a close in its slot
  // short of open + 15 min - 1 ms, by 1 ms (early) or down to the open itself (atOpen), stops nothing: kept and listed as received
  const kept = await record(series(4), at(0), at(4), { script: new Map([[0, json([row(at(0)), early, atOpen, row(at(3))])]]) });
  assert.deepEqual([kept.code, manifestOf(kept.out).rows, manifestOf(kept.out).irregular_close], ["ok", 4,
    [{ open_time_ms: at(1), close_time_ms: at(2) - 2 }, { open_time_ms: at(2), close_time_ms: at(2) }]]);
});

// killer: scripts/record-binance-klines.mjs:212 ROR "pages === MAX_PAGES" -> "pages > MAX_PAGES"
test("binance_klines_stops_after_one_hundred_pages", async () => {
  const r = await record(series(150), at(0), at(150), { perPage: 1 });
  assert.deepEqual([r.code, MAX_PAGES, r.served.length, r.sleeps.length, rawCount(r.out), normalized(r.out)], ["too_many_pages", 100, 100, 99, 100, []]);
});

// killer: scripts/record-binance-klines.mjs:123 SDL "if (existsSync(join(dir, " -> ""
test("binance_klines_refuses_an_unusable_output_directory", async () => {
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
  assert.deepEqual([ok.code, ok.calls.urls.length], ["ok", 1], "an empty directory outside any git tree is used");
  assert.equal(manifestOf(empty).rows, 4);
});

// killer: scripts/record-binance-klines.mjs:112 CONST "if (names.length > 0 || execArgv.length > 0)" -> "if (false)"
test("binance_klines_refuses_a_proxy_or_an_unverified_tls", async () => {
  const proxy = "http://127.0.0.1:9";
  const cases: [RecorderIo, string][] = [
    [{ env: { NODE_USE_ENV_PROXY: "1" } }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy"] }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy=true"] }, "proxy_refused"],
    [{ env: { NODE_OPTIONS: "--max-old-space-size=64 --use-env-proxy" } }, "proxy_refused"],
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "0" } }, "tls_unverified"],
    // D-4 of the corrections, refused closed and never parsed (G2 of COINBASE-USDT-RECORDER-1, F-2: a quoted NODE_OPTIONS and a config
    // file both passed a parsing guard and routed fetch through a proxy): any NODE_OPTIONS, any node flag, any *_PROXY in any case
    [{ env: { NODE_OPTIONS: "\"--use-env-proxy\"" } }, "proxy_refused"], [{ env: { NODE_OPTIONS: "" } }, "proxy_refused"],
    [{ env: { NODE_OPTIONS: "--max-old-space-size=64" } }, "proxy_refused"], [{ env: { node_options: "--use-env-proxy" } }, "proxy_refused"],
    [{ execArgv: ["--experimental-config-file=node.config.json"] }, "proxy_refused"], [{ execArgv: ["--no-warnings"] }, "proxy_refused"],
    [{ env: { HTTPS_PROXY: proxy } }, "proxy_refused"], [{ env: { https_proxy: proxy } }, "proxy_refused"],
    [{ env: { HTTP_PROXY: proxy } }, "proxy_refused"], [{ env: { all_proxy: proxy } }, "proxy_refused"],
    [{ env: { NO_PROXY: "*" } }, "proxy_refused"], [{ env: { NODE_USE_ENV_PROXY: "" } }, "proxy_refused"],
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "1", PATH: "/usr/bin", PROXY: proxy, HTTPS_PROXY_NOTE: "x" } }, "ok"], // no name ends in _PROXY
  ];
  for (const [io, code] of cases) {
    const r = await record(series(4), at(0), at(4), { io });
    assert.deepEqual([r.code, r.calls.urls.length, existsSync(r.out)], [code, code === "ok" ? 1 : 0, code === "ok"], JSON.stringify(io));
  }
  // the stop names the variables and counts the flags, never a value: a proxy URL may carry a password
  const lines: string[] = [], calls: Calls = { urls: [], inits: [] }, out = fresh();
  const env = { HTTPS_PROXY: "http://user:secret@127.0.0.1:9", NODE_OPTIONS: "--use-env-proxy", PATH: "/usr/bin" };
  const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", out];
  const code = await main(argv, { fetch: offline(calls), env, execArgv: ["--no-warnings"], print: (l) => { lines.push(l); } }).catch(() => -1);
  assert.deepEqual([code, lines, calls.urls.length, existsSync(out)], [1, [JSON.stringify({ ok: false, stop: "proxy_refused",
    detail: { variables: ["HTTPS_PROXY", "NODE_OPTIONS"], execArgv_length: 1 } })], 0, false]);
});

// killer: scripts/record-binance-klines.mjs:237 CONST "k[1], k[2]" -> "Number(k[1]), k[2]"
test("binance_klines_keeps_decimal_strings_byte_for_byte", async () => {
  const long = "123456789012345678901234567890.123456789012345678901234567890";
  const odd: Row = [at(0), "0.00000001000", long, "00012.50", "1.10000000", "5", at(1) - 1, "0", 2, "0.000000000000000000000001", "1.0", "0"];
  const body = JSON.stringify([odd]), r = await record([odd], at(0), at(1), { script: new Map([[0, { status: 200, body }]]) });
  assert.equal(r.code, "ok");
  assert.equal(text(r.out, "BTCUSDT-15m.csv").split(LF)[1], [iso(at(0)), String(at(0)), "0.00000001000", long, "00012.50", "1.10000000", "5",
    String(at(1) - 1), "0", "2", "0.000000000000000000000001", "1.0"].join(","), "decimal strings as received, never a float");
  assert.deepEqual(bytes(join(r.out, "raw", `BTCUSDT-${String(at(0))}.json`)), Buffer.from(body), "raw/ holds the bytes as received");
});

// killer: scripts/record-binance-klines.mjs:187 SDL "ctx.used.add(name);" -> ""
test("binance_klines_replays_raw_to_the_same_bytes", async () => {
  const r = await record(series(10, [4]), at(0), at(12), { script: new Map([[0, page([0, 1, 2, 3, 5])], [1, page([5, 6, 7])]]) });
  assert.equal(r.code, "ok");
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], out = fresh(), less = fresh(), more = fresh();
  // the exit code, or -1 when main throws: every outcome is compared by assert; the replay never requests, so no environment guard
  const replay = (from: string, to: string): Promise<number> => main(["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)),
    "--end", iso(at(12)), "--out", to, "--from-raw", from], { fetch: offline(calls), env: { NODE_USE_ENV_PROXY: "1" }, print: (l) => {
    lines.push(l);
  } }).catch(() => -1);
  assert.equal(await replay(r.out, out), 0);
  const m = manifestOf(out), first = manifestOf(r.out);
  assert.deepEqual([text(out, "BTCUSDT-15m.csv"), text(out, "missing.json")], [text(r.out, "BTCUSDT-15m.csv"), text(r.out, "missing.json")]);
  assert.deepEqual([m.mode, m.from_raw, m.csv_sha256, m.rows, m.missing, m.duplicates_removed, m.pages, calls.urls.length, readdirSync(out).sort()],
    ["replay", resolve(r.out), first.csv_sha256, 9, 3, 1, 4, 0, ["BTCUSDT-15m.csv", "SHA256SUMS", "manifest.json", "missing.json"]]);
  const pages = rawNames(r.out);
  for (const [dir, keep] of [[less, pages.slice(1)], [more, pages]] as const) {
    mkdirSync(join(dir, "raw"), { recursive: true });
    for (const f of keep) writeFileSync(join(dir, "raw", f), bytes(join(r.out, "raw", f)));
  }
  writeFileSync(join(more, "raw", "BTCUSDT-0.json"), "[]");
  assert.deepEqual([await replay(less, fresh()), await replay(more, fresh()), calls.urls.length], [1, 1, 0]);
  assert.deepEqual(lines.map((l) => (JSON.parse(l) as { ok: boolean; stop?: string }).stop ?? "written"),
    ["written", "raw_page_missing", "raw_page_unused"], "one JSON line per run: written, then the two named stops of the replay");
});

// killer: scripts/record-binance-klines.mjs:102 CONST "(end - start) / INTERVALS[interval]" -> "(end - start) / INTERVALS[interval] + 1"
test("binance_klines_expects_70080_candles_on_the_founder_range", async () => {
  const start = parseTime("2024-10-01T00:00:00Z"), end = parseTime("2026-10-01T00:00:00Z");
  assert.deepEqual([expectedCount(start, end), (end - start) / 86_400_000, SYMBOLS], [70_080, 730, ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]]);
  for (const symbol of SYMBOLS) {
    const a = parseArgs(["--symbol", symbol, "--interval", "15m", "--start", "2024-10-01T00:00Z", "--end", "2026-10-01T00:00:00Z", "--out", "x"]);
    assert.deepEqual([a.symbol, expectedCount(a.start, a.end)], [symbol, 70_080], `${symbol}: same endpoint, same range, 70 080 expected`);
  }
  const rows = Array.from({ length: 70_080 }, (_, i) => row(start + i * STEP_MS));
  const r = await record(rows, start, end, { symbol: "SOLUSDT", io: { now: () => end } }); // an end equal to now is a closed candle
  assert.equal(r.code, "ok");
  const m = manifestOf(r.out);
  assert.deepEqual([m.symbol, m.expected, m.rows, m.missing, m.pages, r.sleeps.length], ["SOLUSDT", 70_080, 70_080, 0, 71, 70]);
  assert.deepEqual([m.first_open_time, m.last_open_time, text(r.out, "SOLUSDT-15m.csv").split(LF).length], ["2024-10-01T00:00:00Z",
    "2026-09-30T23:45:00Z", 70_082]);
});

// killer: scripts/record-binance-klines.mjs:95 SDL "!Object.hasOwn(INTERVALS, interval)" -> ""
test("binance_klines_refuses_bad_arguments", async () => {
  const base = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", "2025-01-01T00:00Z", "--end", "2025-01-01T01:00Z"];
  const swap = (flag: string, value: string): string[] => base.map((v, i) => (base[i - 1] === flag ? value : v));
  const cases: [string[], string][] = [
    [swap("--symbol", "XRPUSDT"), "bad_symbol"], [swap("--symbol", "btcusdt"), "bad_symbol"], [swap("--interval", "4h"), "bad_time"],
    [swap("--interval", "30m"), "bad_interval"], [swap("--interval", "1d"), "bad_interval"], [swap("--interval", ""), "bad_interval"],
    [swap("--interval", "constructor"), "bad_interval"], // a key of the prototype of INTERVALS is not in the closed list
    [swap("--start", "2025-01-01T00:00:30Z"), "bad_time"], [swap("--start", "2025-01-01T00:05Z"), "bad_time"],
    [swap("--start", "2024-12-31T24:00Z"), "bad_time"], [swap("--end", "2025-02-30T00:00Z"), "bad_time"], // parsed leniently: round trip
    [swap("--start", "2025-01-01 00:00Z"), "bad_time"], [[...base, "--from-raw", "--x"], "usage"],
    [swap("--end", "2025-01-01T00:00Z"), "bad_time"], [swap("--end", "2099-01-01T00:00Z"), "end_in_future"],
    [[...base, "--limit", "5"], "usage"], [[...base, "--symbol", "ETHUSDT"], "usage"],
  ];
  for (const [argv, code] of cases) {
    const out = fresh(), calls: Calls = { urls: [], inits: [] };
    const got = await outcome(run([...argv, "--out", out], { fetch: offline(calls), env: {}, execArgv: [] }));
    assert.deepEqual([got, calls.urls.length, existsSync(out)], [code, 0, false], argv.join(" "));
  }
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], print = (l: string): void => { lines.push(l); };
  const noOut = await outcome(run(base, { fetch: offline(calls) })), noValue = await outcome(run([...base, "--out"], { fetch: offline(calls) }));
  assert.deepEqual([noOut, noValue], ["usage", "usage"], "--out absent, then without a value");
  assert.deepEqual([await main([...swap("--symbol", "XRPUSDT"), "--out", fresh()], { fetch: offline(calls), print }), await main(base, { print })], [1, 2]);
  assert.deepEqual([lines.map((l) => (JSON.parse(l) as { stop?: string }).stop), calls.urls.length], [["bad_symbol", "usage"], 0]);
  assert.deepEqual([recorder.INTERVALS, Object.isFrozen(recorder.INTERVALS)], [{ "15m": 900_000, "1h": 3_600_000, "4h": 14_400_000 }, true],
    "the closed list: each name with its duration in ms, frozen");
});

const FOUNDER = [Date.UTC(2024, 9, 1), Date.UTC(2026, 9, 1)] as const; // 2024-10-01 to 2026-10-01 excluded: 730 days
const ALLOWED = ["15m", "1h", "4h"]; // the closed list as a bad_interval stop names it
/** The URL of one request of the recorder. */
const klinesUrl = (symbol: string, interval: string, from: number, end: number): string =>
  `${ORIGIN}/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${String(from)}&endTime=${String(end - 1)}&limit=1000`;
/** One answer whose single candle is k. */
const served = (k: Row): ReadonlyMap<number, Reply> => new Map([[0, { status: 200, body: JSON.stringify([k]) }]]);

/** The line that main prints on stderr for a named stop. */
const stopLine = (stop: string, detail: Record<string, unknown>): string => JSON.stringify({ ok: false, stop, detail });
/** parseTime at its default interval: the time in ms, or the code of its stop. */
const timeOf = (text: string): number | string => {
  try { return parseTime(text); } catch (e) { return e instanceof RecorderStop ? e.code : "not a stop"; }
};

/** What main prints for BTCUSDT on 2025-01-01 from `from` to `to` (HH:MM UTC), fresh --out, offline fetch; and its request count. */
async function printed(interval: string, from: string, to: string): Promise<[string, number]> {
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], day = (hm: string): string => `2025-01-01T${hm}Z`;
  const argv = ["--symbol", "BTCUSDT", "--interval", interval, "--start", day(from), "--end", day(to), "--out", fresh()];
  await main(argv, { fetch: offline(calls), env: {}, execArgv: [], print: (l) => { lines.push(l); } }).catch(() => -1);
  return [lines.join(LF), calls.urls.length];
}

/** Every candle of the founder range at one interval, served by the loopback endpoint; the open times read back from the CSV. */
async function founderRun(symbol: string, interval: string, step: number): Promise<{ r: Recording; m: SeriesManifest; opens: number[] }> {
  const [start, end] = FOUNDER, rows = Array.from({ length: (end - start) / step }, (_, i) => row(start + i * step, "1.50000000", step));
  const r = await record(rows, start, end, { symbol, interval, io: { now: () => end } });
  const opens = text(r.out, `${symbol}-${interval}.csv`).split(LF).slice(1, -1).map((l) => Number(l.split(",")[1]));
  return { r, m: manifestOf(r.out), opens };
}

/** A replay of `from` under `interval` over the founder range into a fresh --out: its code and that --out (offline fetch). */
async function replayed(from: string, symbol: string, interval: string): Promise<[string, string]> {
  const [start, end] = FOUNDER, out = fresh(), calls: Calls = { urls: [], inits: [] };
  const argv = ["--symbol", symbol, "--interval", interval, "--start", iso(start), "--end", iso(end), "--out", out, "--from-raw", from];
  return [await outcome(run(argv, { fetch: offline(calls), now: () => end })), out];
}

// killer: scripts/record-binance-klines.mjs:227 CONST "+ ctx.step" -> "+ 900_000"
test("binance_klines_records_17520_hourly_candles_aligned_on_the_hour", async () => {
  const [start, end] = FOUNDER, { r, m, opens } = await founderRun("ETHUSDT", "1h", HOUR_MS);
  assert.equal(r.code, "ok");
  assert.deepEqual([m.interval, m.csv, m.expected, m.rows, m.missing, m.pages, r.sleeps.length, expectedCount(start, end, "1h")],
    ["1h", "ETHUSDT-1h.csv", 17_520, 17_520, 0, 18, 17, 17_520]);
  assert.deepEqual([m.first_open_time, m.last_open_time, opens.length, opens.every((t, i) => t === start + i * HOUR_MS)],
    ["2024-10-01T00:00:00Z", "2026-09-30T23:00:00Z", 17_520, true], "every open on the hour, ascending, none skipped");
  assert.deepEqual(r.calls.urls.slice(0, 2), [start, start + LIMIT * HOUR_MS].map((s) => klinesUrl("ETHUSDT", "1h", s, end)));
  assert.deepEqual(jsonOf(r.out, "missing.json"), { symbol: "ETHUSDT", interval: "1h", start: iso(start), end_exclusive: iso(end), count: 0,
    missing: [] });
  // off the hour: a candle served at 00:15 stops, one with a 15-minute close is kept and listed; --start or --end off the hour and names
  // outside the closed list are refused before any request, with the exact line that main prints (the 15-minute grid keeps its words)
  const quarter = await record([], T0, T0 + 4 * HOUR_MS, { interval: "1h", script: served(row(T0 + STEP_MS, "1.50000000", HOUR_MS)) });
  const short = await record([], T0, T0 + 4 * HOUR_MS, { interval: "1h", script: served(row(T0)) });
  assert.deepEqual([quarter.code, short.code, manifestOf(short.out).irregular_close, timeOf("2025-01-01T00:15Z")],
    ["off_grid", "ok", [{ open_time_ms: T0, close_time_ms: T0 + STEP_MS - 1 }], T0 + STEP_MS], "parseTime: 15m by default");
  assert.deepEqual([await printed("1h", "00:15", "02:00"), await printed("1h", "00:00", "00:45"), await printed("15m", "00:05", "02:00"),
    await printed("1H", "00:00", "02:00"), await printed("60m", "00:00", "02:00")], [
    [stopLine("bad_time", { value: "2025-01-01T00:15Z", why: "not on the 60-minute grid" }), 0],
    [stopLine("bad_time", { value: "2025-01-01T00:45Z", why: "not on the 60-minute grid" }), 0],
    [stopLine("bad_time", { value: "2025-01-01T00:05Z", why: "not on the 15-minute grid" }), 0],
    [stopLine("bad_interval", { value: "1H", allowed: ALLOWED }), 0], [stopLine("bad_interval", { value: "60m", allowed: ALLOWED }), 0]]);
  // raw/ names no interval, the manifest of the recording does: the replay under 1h gives the same CSV bytes; under 15m or 4h it is
  // refused before anything is written (interval_mismatch, D-2 of the corrections)
  const [same, sameOut] = await replayed(r.out, "ETHUSDT", "1h"), [as15m, out15m] = await replayed(r.out, "ETHUSDT", "15m");
  const [as4h, out4h] = await replayed(r.out, "ETHUSDT", "4h");
  assert.deepEqual([same, text(sameOut, "ETHUSDT-1h.csv") === text(r.out, "ETHUSDT-1h.csv"), as15m, as4h, existsSync(out15m), existsSync(out4h)],
    ["ok", true, "interval_mismatch", "interval_mismatch", false, false]);
});

// killer: scripts/record-binance-klines.mjs:202 CONST "k[0] % ctx.step" -> "k[0] % 900_000"
test("binance_klines_records_4380_four_hour_candles_aligned_on_the_utc_day", async () => {
  const [start, end] = FOUNDER, { r, m, opens } = await founderRun("BNBUSDT", "4h", FOUR_HOURS_MS);
  assert.equal(r.code, "ok");
  assert.deepEqual([m.interval, m.csv, m.expected, m.rows, m.missing, m.pages, r.sleeps.length, expectedCount(start, end, "4h")],
    ["4h", "BNBUSDT-4h.csv", 4_380, 4_380, 0, 5, 4, 4_380]);
  assert.deepEqual([m.first_open_time, m.last_open_time, opens.length, opens.every((t, i) => t === start + i * FOUR_HOURS_MS)],
    ["2024-10-01T00:00:00Z", "2026-09-30T20:00:00Z", 4_380, true], "opens at 00, 04, 08, 12, 16 and 20 UTC, ascending, none skipped");
  assert.deepEqual(r.calls.urls.slice(0, 2), [start, start + LIMIT * FOUR_HOURS_MS].map((s) => klinesUrl("BNBUSDT", "4h", s, end)));
  // a gap declared on the 4-hour grid; a candle served at 01:00 stops, one with a 1-hour close is kept and listed; --start or --end off
  // the grid; other names
  const slot = (i: number): number => T0 + i * FOUR_HOURS_MS;
  const gap = await record([0, 1, 3, 4, 5].map((i) => row(slot(i), "1.50000000", FOUR_HOURS_MS)), slot(0), slot(6), { interval: "4h" });
  const late = await record([], slot(0), slot(2), { interval: "4h", script: served(row(T0 + HOUR_MS, "1.50000000", FOUR_HOURS_MS)) });
  const short = await record([], slot(0), slot(2), { interval: "4h", script: served(row(T0, "1.50000000", HOUR_MS)) });
  assert.deepEqual([gap.code, (jsonOf(gap.out, "missing.json") as MissingDoc | null)?.missing, late.code, short.code,
    manifestOf(short.out).irregular_close], ["ok", [{ open_time_ms: slot(2), open_time_utc: "2025-01-01T08:00:00Z" }], "off_grid", "ok",
    [{ open_time_ms: T0, close_time_ms: T0 + HOUR_MS - 1 }]]);
  assert.deepEqual([await printed("4h", "02:00", "08:00"), await printed("4h", "00:00", "06:00"), await printed("4H", "00:00", "08:00"),
    await printed("240m", "00:00", "08:00")], [[stopLine("bad_time", { value: "2025-01-01T02:00Z", why: "not on the 240-minute grid" }), 0],
    [stopLine("bad_time", { value: "2025-01-01T06:00Z", why: "not on the 240-minute grid" }), 0],
    [stopLine("bad_interval", { value: "4H", allowed: ALLOWED }), 0], [stopLine("bad_interval", { value: "240m", allowed: ALLOWED }), 0]]);
});

const CUT_MS = 581_646; // the halt of 2023-03-24 closed the 12:30Z candle 9 min 41.646 s after its open (rule 8 of RECHERCHES ADR 0006)
/** That halt on the 15-minute grid from T0: trades at slots 0 and 1, 0 trades from slot 2 on, slot 6 cut at CUT_MS (0 trades), slots 7
 *  to 11 absent, trades again from slot 12 to 15; `patch` edits a candle after that, by slot. */
const halt = (patch: (k: Row, i: number) => void = () => undefined): Row[] => [0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 15].map((i) => {
  const k = row(at(i));
  if (i >= 2 && i <= 6) k[8] = 0;
  if (i === 6) k[6] = at(6) + CUT_MS;
  patch(k, i);
  return k;
});

// killer: scripts/record-binance-klines.mjs:249 ROR "k[6] !== k[0] + ctx.step - 1" -> "k[6] === k[0] + ctx.step - 1"
test("binance_klines_keeps_a_truncated_candle_as_received_and_lists_it", async () => {
  const r = await record(halt((k, i) => { if (i === 13) k[6] = at(13) + 60_000; }), at(0), at(16)); // slot 13 cut after 1 min, 7 trades
  assert.equal(r.code, "ok");
  const m = manifestOf(r.out), csv = text(r.out, "BTCUSDT-15m.csv").split(LF);
  assert.deepEqual([m.expected, m.rows, m.missing, m.irregular_close, m.zero_trade], [16, 11, 5, [{ open_time_ms: at(6), close_time_ms: at(6) + CUT_MS },
    { open_time_ms: at(13), close_time_ms: at(13) + 60_000 }], [2, 3, 4, 5, 6].map(at)],
    "kept and counted as rows, listed ascending with the closes as received; the cut slot 13 trades, so it is no zero_trade candle");
  assert.equal(csv[7], [iso(at(6)), String(at(6)), "1.00000000", "2.00000000", "0.50000000", "1.50000000", "10.00000000",
    String(at(6) + CUT_MS), "15.00000000", "0", "4.00000000", "6.00000000"].join(","), "the CSV line as received, never repaired");
  assert.deepEqual((jsonOf(r.out, "missing.json") as MissingDoc | null)?.missing.map((x) => x.open_time_ms), [7, 8, 9, 10, 11].map(at),
    "completeness reads missing.json alone: the cut candle is present, the five after it are absent");
});

// killer: scripts/record-binance-klines.mjs:250 ROR "k[8] === 0" -> "k[8] !== 0"
test("binance_klines_lists_the_zero_trade_candles_through_the_truncated_one", async () => {
  const r = await record(halt((k, i) => { if (i === 14) k[8] = 0; }), at(0), at(16)); // slot 14: 0 trades, a regular close, alone
  assert.equal(r.code, "ok");
  const trades = text(r.out, "BTCUSDT-15m.csv").split(LF).slice(1, -1).map((l) => l.split(",")[9]);
  assert.deepEqual([manifestOf(r.out).zero_trade, trades], [[2, 3, 4, 5, 6, 14].map(at), ["7", "7", "0", "0", "0", "0", "0", "7", "7", "0", "7"]],
    "every candle with 0 trades, ascending: the run from slot 2 through the cut slot 6 (rule 8 bis), then slot 14; slots 1 and 12 trade");
});

// killer: scripts/record-binance-klines.mjs:250 COR "k[8] === 0" -> "k[8] === 0 || k[6] !== k[0] + ctx.step - 1"
test("binance_klines_ends_the_zero_trade_run_at_a_truncated_candle_with_trades", async () => {
  // rule 8 bis (RECHERCHES ADR 0006, addendum 4, section 5): a truncated candle with trades closes the zero_trade run, so E is its close
  // + 1 ms downstream; it is listed in irregular_close and never in zero_trade (D-1 of the corrections, G2 F-1: mutant M1 survived)
  const r = await record(halt((k, i) => { if (i === 6) k[8] = 3; }), at(0), at(16)); // the cut slot 6 trades
  assert.equal(r.code, "ok");
  const m = manifestOf(r.out), trades = text(r.out, "BTCUSDT-15m.csv").split(LF).slice(1, -1).map((l) => l.split(",")[9]);
  assert.deepEqual([m.zero_trade, m.irregular_close, trades[6]], [[2, 3, 4, 5].map(at), [{ open_time_ms: at(6), close_time_ms: at(6) + CUT_MS }],
    "3"], "the run is slots 2 to 5; the cut slot 6 ends it: listed with its close as received, its trades as received, not a zero_trade candle");
});

// killer: scripts/record-binance-klines.mjs:203 SDL "k[0] < ctx.start || k[0] >= ctx.end" -> ""
test("binance_klines_keeps_every_grid_stop_behind_an_irregular_close", async () => {
  const json = (v: unknown): Reply => ({ status: 200, body: JSON.stringify(v) }), cut = row(at(1)), other = row(at(1)), next = row(at(2));
  cut[6] = at(1) + CUT_MS;
  other[6] = at(1) + CUT_MS + 1; // the same open time with another close: a conflicting duplicate
  const off = at(2) + 60_000, offGrid = [off, ...next.slice(1, 6), off + STEP_MS - 1, ...next.slice(7)];
  const hourly = row(at(2), "1.50000000", HOUR_MS); // a 1-hour close on the 15-minute grid: after its slot (D-3 of the corrections)
  const cases: [ReadonlyMap<number, Reply>, string, number][] = [
    [new Map([[0, json([row(at(0)), cut, offGrid])]]), "off_grid", 1],
    [new Map([[0, json([row(at(0)), cut, row(at(4))])]]), "out_of_range", 1],
    [new Map([[0, json([row(at(0)), cut, hourly])]]), "close_out_of_slot", 1],
    [new Map([[0, json([cut, next.slice(0, 11)])]]), "row_shape", 1],
    [new Map([[0, json([row(at(0)), cut])], [1, json([other, next])]]), "duplicate_conflict", 2],
    [new Map([[0, json([row(at(0)), cut])], [1, json([row(at(0)), cut])]]), "cursor_not_advancing", 2],
  ];
  for (const [script, code, pages] of cases) {
    const r = await record(series(4), at(0), at(4), { script });
    assert.deepEqual([r.code, r.served.length, rawCount(r.out), normalized(r.out)], [code, pages, pages, []],
      `${code} after a cut candle: raw kept, nothing normalized`);
  }
  assert.deepEqual([...cases.map((c) => c[1]), "interval_mismatch", "close_time"].map((c) => STOPS.includes(c)),
    [true, true, true, true, true, true, true, false], "the closed list keeps the grid stops, names the replay's, no longer close_time");
});

// killer: scripts/record-binance-klines.mjs:267 CONST "zero_trade: lists.zeroTrade" -> "zero_trade: []"
test("binance_klines_replays_cut_and_zero_trade_candles_to_the_same_bytes", async () => {
  const r = await record(halt(), at(0), at(16), { perPage: 4 }), clean = await record(series(4), at(0), at(4));
  assert.deepEqual([r.code, clean.code], ["ok", "ok"]);
  const calls: Calls = { urls: [], inits: [] };
  const replay = async (from: string, end: number): Promise<[number, string]> => {
    const out = fresh(), argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(end), "--out", out, "--from-raw", from];
    return [await main(argv, { fetch: offline(calls), print: () => undefined }).catch(() => -1), out];
  };
  const [[code, out], [cleanCode, cleanOut]] = [await replay(r.out, at(16)), await replay(clean.out, at(4))];
  const files = (dir: string): Buffer[] => ["BTCUSDT-15m.csv", "missing.json"].map((n) => bytes(join(dir, n)));
  const lists = (dir: string): unknown[] => [manifestOf(dir).irregular_close, manifestOf(dir).zero_trade];
  assert.deepEqual([code, cleanCode, calls.urls.length, manifestOf(out).mode, manifestOf(out).pages], [0, 0, 0, "replay", 3]);
  assert.deepEqual([files(out), files(cleanOut)], [files(r.out), files(clean.out)], "CSV and missing.json byte for byte, along 3 pages");
  const halted = [[{ open_time_ms: at(6), close_time_ms: at(6) + CUT_MS }], [2, 3, 4, 5, 6].map(at)];
  assert.deepEqual([lists(r.out), lists(out), lists(clean.out), lists(cleanOut)], [halted, halted, [[], []], [[], []]],
    "the same lists in the recording and in its replay; present and empty when nothing is irregular");
});

// killer: scripts/record-binance-klines.mjs:138 SDL "named !== args.interval" -> ""
test("binance_klines_refuses_a_replay_under_another_interval", async () => {
  // D-2 of the corrections (G2 F-2): the 1h page of the G2 probe, one candle at T0 closing at T0 + 1 h - 1 ms, replayed under 15m with
  // --end cut at T0 + 15 min wrote 1 row and exited 0. Recorded, its manifest names 1h: interval_mismatch. As raw/ alone (the probe's
  // copy) nothing names an interval and T0 lies on the 15-minute grid: its close after the 15-minute slot stops it (close_out_of_slot).
  const hourly = await record([], T0, T0 + HOUR_MS, { interval: "1h", script: served(row(T0, "1.50000000", HOUR_MS)) });
  const quarters = await record(series(8), at(0), at(8)); // 15-minute candles, the first on the hour
  const rawOnly = (from: string): string => { // raw/ copied alone: no manifest, no requests.jsonl
    const dir = fresh();
    mkdirSync(join(dir, "raw"), { recursive: true });
    for (const f of rawNames(from)) writeFileSync(join(dir, "raw", f), bytes(join(from, "raw", f)));
    return dir;
  };
  const unreadable = rawOnly(quarters.out), calls: Calls = { urls: [], inits: [] };
  writeFileSync(join(unreadable, "manifest.json"), "{");
  const replay = async (from: string, interval: string, start: number, end: number): Promise<[string, boolean]> => {
    const out = fresh(), argv = ["--symbol", "BTCUSDT", "--interval", interval, "--start", iso(start), "--end", iso(end), "--out", out, "--from-raw", from];
    return [await outcome(run(argv, { fetch: offline(calls) })), existsSync(out)];
  };
  assert.deepEqual([hourly.code, quarters.code], ["ok", "ok"]);
  assert.deepEqual([await replay(hourly.out, "15m", T0, T0 + STEP_MS), await replay(rawOnly(hourly.out), "15m", T0, T0 + STEP_MS),
    await replay(quarters.out, "1h", at(0), at(8)), await replay(rawOnly(quarters.out), "1h", at(0), at(8)),
    await replay(unreadable, "15m", at(0), at(8)), await replay(hourly.out, "1h", T0, T0 + HOUR_MS), calls.urls.length],
  [["interval_mismatch", false], ["close_out_of_slot", false], ["interval_mismatch", false], ["interval_mismatch", false],
    ["interval_mismatch", false], ["ok", true], 0], "refused before anything is written, never a request; under its own interval, written");
});

// killer: scripts/record-binance-klines.mjs:58 CONST "|NODE_USE_SYSTEM_CA|" -> "|"
test("binance_klines_refuses_a_trust_anchor_taken_from_the_environment", async () => {
  // D-1 of the second round (G2C-1): NODE_USE_SYSTEM_CA was measured set to 1 on this host, whose system store holds two interception
  // roots; it and the other variables that add or swap a TLS trust anchor are refused by NAME, whatever the value, in any case, before
  // any request; the stop keeps its code and names the variables, never a value
  const anchors = ["NODE_USE_SYSTEM_CA", "NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE", "SSL_CERT_DIR", "OPENSSL_CONF"];
  const cases: [Record<string, string>, string[]][] = [...anchors.map((n): [Record<string, string>, string[]] => [{ [n]: "1", PATH: "/usr/bin" }, [n]]),
    [{ node_use_system_ca: "" }, ["node_use_system_ca"]], [{ Node_Extra_Ca_Certs: "x" }, ["Node_Extra_Ca_Certs"]],
    [{ SSL_CERT_DIR: "/etc/ssl/certs", OPENSSL_CONF: "C:/secret/openssl.cnf", HTTPS_PROXY: "http://user:secret@127.0.0.1:9" },
      ["HTTPS_PROXY", "OPENSSL_CONF", "SSL_CERT_DIR"]],
    // D-2 of the third round (G2RR2-5): any name that starts with OPENSSL_, in any case; the four named in node.exe passed the second round
    [{ OPENSSL_CONF_INCLUDE: "1", OPENSSL_MODULES: "1", OPENSSL_ENGINES: "1", OPENSSL_ia32cap: "1", OPENSSL_CONFIG: "y", openssl_trace: "1" },
      ["OPENSSL_CONFIG", "OPENSSL_CONF_INCLUDE", "OPENSSL_ENGINES", "OPENSSL_MODULES", "OPENSSL_ia32cap", "openssl_trace"]]];
  for (const [env, variables] of cases) {
    const lines: string[] = [], calls: Calls = { urls: [], inits: [] }, out = fresh();
    const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", out];
    const code = await main(argv, { fetch: offline(calls), env, execArgv: [], print: (l) => { lines.push(l); } }).catch(() => -1);
    assert.deepEqual([code, lines, calls.urls.length, existsSync(out)], [1, [stopLine("proxy_refused", { variables, execArgv_length: 0 })], 0,
      false], JSON.stringify(env));
  }
  // a name that only contains one of them, or OPENSSL_ past its start, sets no anchor: the recording runs (OPENSSL_CONFIG: refused above)
  // and so does OPENSSL with no underscore (BINANCE-OPENSSL-PREFIX-PIN-1: mutant E2 of the fusion campaign refused it, no case saw it)
  const near = await record(series(4), at(0), at(4), { io: { env: { NODE_USE_SYSTEM_CA_NOTE: "1", MY_SSL_CERT_FILE: "x", MY_OPENSSL_CONF: "y",
    OPENSSL: "z" } } });
  assert.equal(near.code, "ok");
});

// killer: scripts/record-binance-klines.mjs:248 CONST "times.map((t) => rows.get(t))" -> "[...rows.values()]"
test("binance_klines_lists_ascending_from_a_page_out_of_order", async () => {
  // D-2 of the second round (G2C-3, mutant X11 survived): H-2 says the endpoint answers in ascending order and checkRow does not require
  // it; both lists follow the open times (D-1 of the corrections), never the order of a page
  const candle = (i: number, trades: number, cut: boolean): Row => {
    const k = row(at(i));
    k[8] = trades;
    if (cut) k[6] = at(i) + CUT_MS;
    return k;
  };
  const body = JSON.stringify([candle(2, 0, true), candle(0, 0, false), candle(1, 7, true), candle(3, 7, false)]); // ends at(3): one page
  const r = await record([], at(0), at(4), { script: new Map([[0, { status: 200, body }]]) }), m = manifestOf(r.out);
  assert.deepEqual([r.code, m.rows, m.irregular_close, m.zero_trade], ["ok", 4, [{ open_time_ms: at(1), close_time_ms: at(1) + CUT_MS },
    { open_time_ms: at(2), close_time_ms: at(2) + CUT_MS }], [0, 2].map(at)], "ascending, whatever the order of the page");
});

// killer: scripts/record-binance-klines.mjs:190 CONST "pages.get(name) !== got" -> "false"
test("binance_klines_refuses_a_replay_of_an_altered_raw_page", async () => {
  // D-3 of the second round (G2C-4): a stopped recording keeps neither manifest nor SHA256SUMS, only requests.jsonl, which logged the
  // sha256 of each page as received; a sealed one also lists raw/ in SHA256SUMS. A replay reads each page against both, each file when
  // present, and refuses an altered page, or one that a present file does not attest (raw_page_altered), before anything is written
  const rec = await record(series(8), at(0), at(8), { perPage: 4 }), names = rawNames(rec.out), csv = text(rec.out, "BTCUSDT-15m.csv");
  const one = `raw/${names[0] ?? ""}`, two = `raw/${names[1] ?? ""}`, calls: Calls = { urls: [], inits: [] };
  /** A source made of these files of the recording, then edited. */
  const source = (files: readonly string[], edit: (dir: string) => void = () => undefined): string => {
    const dir = fresh();
    mkdirSync(join(dir, "raw"), { recursive: true });
    for (const f of files) writeFileSync(join(dir, f), bytes(join(rec.out, f)));
    edit(dir);
    return dir;
  };
  const rewrite = (dir: string, file: string, change: (body: string) => string): void => {
    writeFileSync(join(dir, file), change(readFileSync(join(dir, file), "utf8")));
  };
  const lines = (keep: (line: string) => boolean) => (body: string): string => body.split(LF).filter(keep).join(LF);
  const alter = (dir: string): void => { rewrite(dir, two, (b) => b.replace("1.50000000", "1.50000001")); }; // still klines on the grid
  const unlogged = (dir: string): void => { rewrite(dir, "requests.jsonl", lines((l) => !l.includes(`startTime=${String(at(0))}&`))); };
  const unsummed = (dir: string): void => { rewrite(dir, "SHA256SUMS", lines((l) => !l.endsWith(one))); };
  const unreadable = (dir: string): void => { writeFileSync(join(dir, "requests.jsonl"), `{${LF}`); };
  const twice = (dir: string): void => { // page two logged twice, first with another digest: two digests attest nothing
    rewrite(dir, "requests.jsonl", (b) => JSON.stringify({ ...logOf(rec.out)[1], sha256: "0".repeat(64) }) + LF + b);
  };
  const sealedV1 = (dir: string): void => { // a manifest of the recorder 48aa58b3: neither list, never computed (D-4 of the second round)
    const m: SeriesManifestV1 = { ...manifestOf(rec.out), schema: "monark.series.binance.v1" }; // its schema too (lot BINANCE-V2-1)
    delete m.irregular_close;
    delete m.zero_trade;
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(m, null, 2) + LF);
  };
  const argvOf = (from: string, out: string): string[] =>
    ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(8)), "--out", out, "--from-raw", from];
  const replay = async (from: string): Promise<[string, boolean, string]> => {
    const out = fresh();
    return [await outcome(run(argvOf(from, out), { fetch: offline(calls) })), existsSync(out), text(out, "BTCUSDT-15m.csv")];
  };
  const whole = [one, two, "requests.jsonl", "SHA256SUMS", "manifest.json", "BTCUSDT-15m.csv", "missing.json"], log = [one, two, "requests.jsonl"];
  const sums = [one, two, "SHA256SUMS"], refused: [string, boolean, string] = ["raw_page_altered", false, ""];
  assert.deepEqual([rec.code, await replay(source(whole)), await replay(source(log, sealedV1))], ["ok", ["ok", true, csv], ["ok", true, csv]],
    "the whole recording, and its pages with their log beside a manifest without the two lists: every page attested, the same CSV");
  assert.deepEqual([await replay(source(whole, alter)), await replay(source(log, alter)), await replay(source(sums, alter)),
    await replay(source(log, unlogged)), await replay(source(sums, unsummed)), await replay(source(log, unreadable)),
    await replay(source(log, twice)), calls.urls.length], [refused, refused, refused, refused, refused, refused, refused, 0],
  "altered, or not attested by a present file: refused, nothing written");
  // the stop names the page and both digests: of the bytes read, and the one requests.jsonl logged for that page
  const printed: string[] = [], from = source(log, alter);
  await main(argvOf(from, fresh()), { fetch: offline(calls), print: (l) => { printed.push(l); } }).catch(() => -1);
  assert.deepEqual(printed, [stopLine("raw_page_altered", { page: join(resolve(from), two), sha256: sha(bytes(join(from, two))),
    attested_by: "requests.jsonl", attested: logOf(rec.out)[1]?.sha256 ?? null })]);
  // D-1 of the third round (G2RR2-1: mutants R1, R2, R3, R5 and R6 survived): each present file attests the page on its own. The page
  // altered and its digest re-hashed in ONE file: refused by the other file; a page logged twice: refused, the true digest first too; a
  // folder sealed from a replay (form A of G2RR2-2: the replay's CSV, manifest.json, missing.json and SHA256SUMS beside raw/ and
  // requests.jsonl): its SHA256SUMS has no raw/ line and attests no page, refused (closed reading, Q-CORR2-1)
  const recorded = sha(bytes(join(rec.out, two))), rep = fresh();
  const rehashed = (file: string) => (dir: string): void => { alter(dir); rewrite(dir, file, (b) => b.replace(recorded, sha(bytes(join(dir, two))))); };
  const trueFirst = (dir: string): void => { // page two logged twice, the true digest first
    rewrite(dir, "requests.jsonl", (b) => b + JSON.stringify({ ...logOf(rec.out)[1], sha256: "0".repeat(64) }) + LF);
  };
  const formA = (dir: string): void => { // the four files of a replay of the whole recording, beside raw/ and requests.jsonl
    for (const f of ["BTCUSDT-15m.csv", "SHA256SUMS", "manifest.json", "missing.json"]) writeFileSync(join(dir, f), bytes(join(rep, f)));
  };
  /** A replay of `from`: its code, the file that refused, the digest that file attests, and whether --out was made. */
  const refusal = async (from: string): Promise<[string, unknown, unknown, boolean]> => {
    const out = fresh();
    try {
      await run(argvOf(from, out), { fetch: offline(calls) });
      return ["ok", null, null, existsSync(out)];
    } catch (e) {
      return e instanceof RecorderStop ? [e.code, e.detail.attested_by, e.detail.attested, existsSync(out)] : ["not a stop", null, null, existsSync(out)];
    }
  };
  assert.equal(await outcome(run(argvOf(source(whole), rep), { fetch: offline(calls) })), "ok", "the replay whose four files make form A");
  assert.deepEqual([await refusal(source(whole, rehashed("requests.jsonl"))), await refusal(source(whole, rehashed("SHA256SUMS"))),
    await refusal(source(log, trueFirst)), await refusal(source(log, formA)), calls.urls.length],
  [["raw_page_altered", "SHA256SUMS", recorded, false], ["raw_page_altered", "requests.jsonl", recorded, false],
    ["raw_page_altered", "requests.jsonl", null, false], ["raw_page_altered", "SHA256SUMS", null, false], 0],
  "each present file attests the page on its own; two digests attest nothing, the true one first too; a replay's SHA256SUMS attests no page");
  // the manifest this recorder writes names monark.series.binance.v2 (lot BINANCE-V2-1, D-1) and carries both lists (D-4 of the second
  // round: required there, optional in SeriesManifestV1)
  const own = manifestOf(rec.out);
  assert.deepEqual([own.schema, own.irregular_close.length, own.zero_trade.length, own.rows], ["monark.series.binance.v2", 0, 0, 8]);
});

// killer: scripts/record-binance-klines.mjs:316 CONST "realpathSync(argv1) === realpathSync(SCRIPT)" -> "resolve(argv1) === resolve(SCRIPT)"
test("binance_klines_runs_its_command_line_through_a_junction", () => {
  // D-5 of the second round (F-4 of the G2 of the history detector, same pattern): through a directory junction node runs the module at
  // its real path while argv[1] keeps the junction, so a guard on resolved paths ran nothing and exited 0 in silence. A copy of the
  // recorder behind a junction, both under ROOT, run with no argument: a usage stop, its one line on stderr, exit 2. Imported by a node
  // whose argv[1] names no file (the guard cannot resolve it): nothing runs
  const dir = fresh(), link = fresh(), copy = join(dir, "record-binance-klines.mjs");
  mkdirSync(dir);
  copyFileSync(RECORDER, copy);
  symlinkSync(dir, link, "junction");
  const env: Record<string, string | undefined> = { ...process.env, HTTPS_PROXY: "http://127.0.0.1:9", NODE_USE_ENV_PROXY: "1" };
  delete env.NODE_TEST_CONTEXT; // the child is no test runner
  const child = (args: string[]): [number | null, string, string] => {
    const r = spawnSync(process.execPath, args, { env, encoding: "utf8", timeout: 60_000 });
    return [r.status, r.stdout, r.stderr];
  };
  assert.deepEqual([child([join(link, "record-binance-klines.mjs")]), child(["--input-type=module", "-e",
    `await import(${JSON.stringify(pathToFileURL(copy).href)});`, "no-such-file"])], [[2, "", stopLine("usage", { absent: ["symbol", "interval",
    "start", "end", "out"] }) + LF], [0, "", ""]], "through the junction, the usage stop; imported, nothing");
});

// killer: scripts/record-binance-klines.mjs:259 CONST "monark.series.binance.v2" -> "monark.series.binance.v1"
test("binance_klines_writes_v2_and_replays_a_sealed_v1_unrefused", async () => {
  // Q-U5 of RECHERCHES (2026-10-03), lot BINANCE-V2-1, D-1: one identifier, one meaning. Every manifest this recorder writes, recording
  // or replay, names monark.series.binance.v2 with both lists; a folder sealed under v1 (recorder 48aa58b3: schema v1, neither list,
  // never computed) is read without refusal and replays to the same CSV and missing.json bytes under v2, its lists computed from raw/,
  // the sealed folder left as it is
  const V1 = "monark.series.binance.v1", V2 = "monark.series.binance.v2", calls: Calls = { urls: [], inits: [] };
  const rec = await record(halt(), at(0), at(16), { perPage: 4 }), sealed = fresh();
  mkdirSync(join(sealed, "raw"), { recursive: true });
  for (const f of [...rawNames(rec.out).map((n) => `raw/${n}`), "requests.jsonl", "SHA256SUMS", "BTCUSDT-15m.csv", "missing.json"]) {
    writeFileSync(join(sealed, f), bytes(join(rec.out, f)));
  }
  const v1: SeriesManifestV1 = { ...manifestOf(rec.out), schema: V1 };
  delete v1.irregular_close;
  delete v1.zero_trade;
  writeFileSync(join(sealed, "manifest.json"), JSON.stringify(v1, null, 2) + LF);
  const before = bytes(join(sealed, "manifest.json")), sums = text(sealed, "SHA256SUMS");
  writeFileSync(join(sealed, "SHA256SUMS"), sums.replace(sha(bytes(join(rec.out, "manifest.json"))), sha(before)));
  const lines = text(sealed, "SHA256SUMS").split(LF).filter((l) => l !== "");
  assert.deepEqual(lines.map((l) => sha(bytes(join(sealed, l.slice(66))))), lines.map((l) => l.slice(0, 64)), "sealed: every SHA256SUMS line holds");
  const replay = async (from: string): Promise<[string, string]> => {
    const out = fresh(), argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(16)), "--out", out, "--from-raw", from];
    return [await outcome(run(argv, { fetch: offline(calls) })), out];
  };
  const [[fromV1, outV1], [fromV2, outV2]] = [await replay(sealed), await replay(rec.out)];
  /** What a reader of manifest.json finds: its schema, its mode, and whether each list is present. */
  const shape = (dir: string): unknown[] => {
    const m = jsonOf(dir, "manifest.json") as SeriesManifestRead | null;
    return [m?.schema, m?.mode, m !== null && "irregular_close" in m, m !== null && "zero_trade" in m];
  };
  assert.deepEqual([rec.code, fromV1, fromV2, calls.urls.length], ["ok", "ok", "ok", 0]);
  assert.deepEqual([shape(rec.out), shape(sealed), shape(outV1), shape(outV2)], [[V2, "record", true, true], [V1, "record", false, false],
    [V2, "replay", true, true], [V2, "replay", true, true]], "written: v2 with both lists, recording and replay alike; read: a v1 unrefused");
  const files = (dir: string): Buffer[] => ["BTCUSDT-15m.csv", "missing.json"].map((n) => bytes(join(dir, n)));
  const lists = (dir: string): unknown[] => [manifestOf(dir).irregular_close, manifestOf(dir).zero_trade];
  assert.deepEqual([files(outV1), files(outV2), lists(outV1), lists(outV2), bytes(join(sealed, "manifest.json"))],
    [files(rec.out), files(rec.out), lists(rec.out), lists(rec.out), before], "same bytes and lists from a v1 or a v2 source; the v1 untouched");
});

// killer: scripts/record-binance-klines.mjs:149 CONST ".filter((e) => e.status === 200)" -> ""
test("binance_klines_refuses_a_page_planted_at_the_cursor_of_a_non_200_answer", async () => {
  // BINANCE-REPLAY-NON200-ATTEST-1 (G2-CTV2-2; mutant R4 of the fusion campaign survived): requests.jsonl logs every answer with the
  // sha256 of its body, and only a 200 attests a page. A recording stopped by a 500 whose body is [] (empty klines, were it read): as
  // written, its stopped cursor has no page; a raw/ page planted there with those very bytes is refused, nothing written, never a request
  const rec = await record(series(8), at(0), at(8), { perPage: 4, script: new Map([[1, { status: 500, body: "[]" }]]) });
  const calls: Calls = { urls: [], inits: [] }, out = fresh();
  const argvOf = (to: string): string[] => ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(8)), "--out", to,
    "--from-raw", rec.out];
  const asWritten = await outcome(run(argvOf(fresh()), { fetch: offline(calls) }));
  writeFileSync(join(rec.out, "raw", `BTCUSDT-${String(at(4))}.json`), "[]"); // the bytes that requests.jsonl logged for the 500
  const planted = await run(argvOf(out), { fetch: offline(calls) }).then(() => ["ok"], (e: unknown) =>
    (e instanceof RecorderStop ? [e.code, e.detail.attested_by, e.detail.attested] : ["not a stop"]));
  assert.deepEqual([rec.code, logOf(rec.out).map((l) => [l.status, l.sha256 === sha("[]")]), asWritten, planted, existsSync(out), calls.urls.length],
    ["server_error", [[200, false], [500, true]], "raw_page_missing", ["raw_page_altered", "requests.jsonl", null], false, 0]);
});

/** Lot BINANCE-V2-1, D-1 (G2-CTV2-1: the type surface was right but nothing pinned it): the typecheck gate (tsc --noEmit) reads these
 *  types and Node erases them, so nothing here runs. Accepts<T, U> compiles iff U is assignable to T; the line under each @ts-expect-error
 *  must fail to compile, else tsc reports the directive unused. Each line reddens under a mutant of that surface (T1 to T4 of the G2). */
type Accepts<T, U extends T> = U;
export type ManifestTypeChecks = [
  // @ts-expect-error a written manifest never names v1 (T1, T2)
  Accepts<SeriesManifest["schema"], "monark.series.binance.v1">,
  // @ts-expect-error nor v3: one literal, not any string (T1)
  Accepts<SeriesManifest["schema"], "monark.series.binance.v3">,
  // @ts-expect-error a v1, even with both lists, is not what run resolves to (T1, T2)
  Accepts<Awaited<ReturnType<typeof run>>, Required<SeriesManifestV1>>,
  // @ts-expect-error unnarrowed, a read manifest may lack a list (T4)
  Accepts<Pick<SeriesManifest, "zero_trade">, SeriesManifestRead>,
  // @ts-expect-error a v1 never names v2 (T3)
  Accepts<SeriesManifestV1["schema"], "monark.series.binance.v2">,
  Accepts<SeriesManifestRead, SeriesManifestV1>, // a sealed v1 is a read manifest (T4)
];
