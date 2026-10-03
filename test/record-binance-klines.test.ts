// test/record-binance-klines.test.ts -- lot SERIES-BINANCE (2026-10-01): the Binance kline recorder scripts/record-binance-klines.mjs,
// run in-process against a loopback server that imitates GET /api/v3/klines (H-2 of the G1 journal: startTime <= openTime <= endTime,
// ascending, at most limit rows), through an injected fetch that only rewrites https://api.binance.com to that server and refuses any
// other URL. The global fetch is a tripwire for the whole file and no child process ever runs the recorder: no test reaches the network,
// even under a mutant. Each test names, on the line above it, the production mutation that reddens it (scripts/red-proof.mjs convention);
// every outcome is compared by assert. Outputs live under the OS temp directory, outside any git tree, removed after the file.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { CSV_COLUMNS, expectedCount, LIMIT, main, MAX_PAGES, parseArgs, parseTime, PAUSE_MS, RecorderStop, run, STEP_MS, STOPS, SYMBOLS }
  from "../scripts/record-binance-klines.mjs";
import type { RecorderIo, SeriesManifest } from "../scripts/record-binance-klines.mjs";

type Row = [number, string, string, string, string, string, number, string, number, string, string, string];
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
interface Reply { status: number; headers?: Record<string, string>; body?: string; cut?: boolean }
interface Endpoint { base: string; urls: string[]; headers: IncomingHttpHeaders[]; close: () => Promise<void> }
interface Calls { urls: string[]; inits: RequestInit[] }
interface Recording { code: string; out: string; calls: Calls; sleeps: number[]; served: string[]; headers: IncomingHttpHeaders[] }
interface Plan { script?: ReadonlyMap<number, Reply>; perPage?: number; symbol?: string; io?: RecorderIo; out?: string }
interface Logged { url: string; status: number; bytes: number; sha256: string; headers: Record<string, string | null> }
interface MissingDoc { symbol: string; interval: string; start: string; end_exclusive: string; count: number;
  missing: { open_time_ms: number; open_time_utc: string }[] }

const realFetch = globalThis.fetch;
globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
const ORIGIN = "https://api.binance.com", LF = String.fromCharCode(10), T0 = Date.UTC(2025, 0, 1);
const ROOT = mkdtempSync(join(tmpdir(), "binance-klines-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
/** A path that does not exist yet, under the temp root. */
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
const at = (i: number): number => T0 + i * STEP_MS;
const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const row = (t: number, close = "1.50000000"): Row =>
  [t, "1.00000000", "2.00000000", "0.50000000", close, "10.00000000", t + STEP_MS - 1, "15.00000000", 7, "4.00000000", "6.00000000", "0"];
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
 *  7.24.4, read in its own source; G1 journal, section 8): the OS may hand one to port 0 (measured: 1719, 2049, 3659, 6566, 6665, 6667,
 *  each a "bad port" network error before any byte). Such a port is given back and another one taken. */
async function listen(server: Server): Promise<number> {
  for (let i = 0; i < 50; i++) {
    await new Promise<void>((done) => { server.listen(0, "127.0.0.1", () => { done(); }); });
    const a = server.address(), port = a !== null && typeof a === "object" ? a.port : 0;
    if (port > 10_080) return port;
    await new Promise<void>((done) => { server.close(() => { done(); }); });
  }
  return assert.fail("no loopback port above 10080 in 50 tries");
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
    const code = await outcome(run(["--symbol", symbol, "--interval", "15m", "--start", iso(start), "--end", iso(end), "--out", out], io));
    return { code, out, calls, sleeps, served: ep.urls, headers: ep.headers };
  } finally {
    await ep.close();
  }
}

// killer: scripts/record-binance-klines.mjs:114 CONST "${ctx.end - 1}" -> "${ctx.end}"
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

// killer: scripts/record-binance-klines.mjs:190 COR "!rows.has(t)" -> "rows.has(t)"
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

// killer: scripts/record-binance-klines.mjs:173 ROR "JSON.stringify(kept) === JSON.stringify(k)" -> "JSON.stringify(kept) !== JSON.stringify(k)"
test("binance_klines_refuses_a_conflicting_duplicate", async () => {
  const conflict = { status: 200, body: JSON.stringify([row(at(2), "9.99000000"), row(at(3))]) };
  const r = await record(series(4), at(0), at(4), { script: new Map([[0, page([0, 1, 2])], [1, conflict]]) });
  assert.deepEqual([r.code, r.served.length, rawCount(r.out), logOf(r.out).length, normalized(r.out)], ["duplicate_conflict", 2, 2, 2, []]);
});

// killer: scripts/record-binance-klines.mjs:120 CONST "manual" -> "follow"
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

// killer: scripts/record-binance-klines.mjs:152 SDL "k[0] % STEP_MS !== 0" -> ""
test("binance_klines_stops_on_bad_bodies_and_candles", async () => {
  const json = (v: unknown): Reply => ({ status: 200, body: JSON.stringify(v) });
  const base = row(at(1)), off = at(1) + 60_000, late = row(at(1)), early = row(at(1)), numeric: unknown[] = [...base];
  const tradesText: unknown[] = [...base], negative: unknown[] = [...base], exponent: unknown[] = [...base], lastNumber: unknown[] = [...base];
  late[6] = at(2);
  early[6] = at(2) - 2;
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
    [new Map([[0, json([early])]]), "close_time", 1],
    [new Map([[0, json([[off, ...base.slice(1, 6), off + STEP_MS - 1, ...base.slice(7)]])]]), "off_grid", 1],
    [new Map([[0, json([late])]]), "close_time", 1],
    [new Map([[0, json([row(at(-1))])]]), "out_of_range", 1],
    [new Map([[0, json([row(at(4))])]]), "out_of_range", 1],
    [new Map([[0, page([0, 1])], [1, page([0, 1])]]), "cursor_not_advancing", 2],
  ];
  for (const [script, code, pages] of cases) {
    const r = await record(series(4), at(0), at(4), { script });
    assert.deepEqual([r.code, r.served.length, rawCount(r.out), normalized(r.out)], [code, pages, pages, []], `${code}: raw kept, nothing normalized`);
    assert.ok(STOPS.includes(code), code);
  }
});

// killer: scripts/record-binance-klines.mjs:162 ROR "pages === MAX_PAGES" -> "pages > MAX_PAGES"
test("binance_klines_stops_after_one_hundred_pages", async () => {
  const r = await record(series(150), at(0), at(150), { perPage: 1 });
  assert.deepEqual([r.code, MAX_PAGES, r.served.length, r.sleeps.length, rawCount(r.out), normalized(r.out)], ["too_many_pages", 100, 100, 99, 100, []]);
});

// killer: scripts/record-binance-klines.mjs:106 SDL "if (existsSync(join(dir, " -> ""
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

// killer: scripts/record-binance-klines.mjs:95 CONST "if (proxied)" -> "if (false)"
test("binance_klines_refuses_a_proxy_or_an_unverified_tls", async () => {
  const cases: [RecorderIo, string][] = [
    [{ env: { NODE_USE_ENV_PROXY: "1" } }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy"] }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy=true"] }, "proxy_refused"],
    [{ env: { NODE_OPTIONS: "--max-old-space-size=64 --use-env-proxy" } }, "proxy_refused"],
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "0" } }, "tls_unverified"],
    [{ env: { HTTPS_PROXY: "http://127.0.0.1:9", NODE_TLS_REJECT_UNAUTHORIZED: "1", NODE_OPTIONS: "--max-old-space-size=64" } }, "ok"],
  ];
  for (const [io, code] of cases) {
    const r = await record(series(4), at(0), at(4), { io });
    assert.deepEqual([r.code, r.calls.urls.length, existsSync(r.out)], [code, code === "ok" ? 1 : 0, code === "ok"], JSON.stringify(io));
  }
});

// killer: scripts/record-binance-klines.mjs:187 CONST "k[1], k[2]" -> "Number(k[1]), k[2]"
test("binance_klines_keeps_decimal_strings_byte_for_byte", async () => {
  const long = "123456789012345678901234567890.123456789012345678901234567890";
  const odd: Row = [at(0), "0.00000001000", long, "00012.50", "1.10000000", "5", at(1) - 1, "0", 2, "0.000000000000000000000001", "1.0", "0"];
  const body = JSON.stringify([odd]), r = await record([odd], at(0), at(1), { script: new Map([[0, { status: 200, body }]]) });
  assert.equal(r.code, "ok");
  assert.equal(text(r.out, "BTCUSDT-15m.csv").split(LF)[1], [iso(at(0)), String(at(0)), "0.00000001000", long, "00012.50", "1.10000000", "5",
    String(at(1) - 1), "0", "2", "0.000000000000000000000001", "1.0"].join(","), "decimal strings as received, never a float");
  assert.deepEqual(bytes(join(r.out, "raw", `BTCUSDT-${String(at(0))}.json`)), Buffer.from(body), "raw/ holds the bytes as received");
});

// killer: scripts/record-binance-klines.mjs:143 SDL "ctx.used.add(name);" -> ""
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

// killer: scripts/record-binance-klines.mjs:89 CONST "(end - start) / STEP_MS" -> "(end - start) / STEP_MS + 1"
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

// killer: scripts/record-binance-klines.mjs:81 SDL "!SYMBOLS.includes(symbol)" -> ""
test("binance_klines_refuses_bad_arguments", async () => {
  const base = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", "2025-01-01T00:00Z", "--end", "2025-01-01T01:00Z"];
  const swap = (flag: string, value: string): string[] => base.map((v, i) => (base[i - 1] === flag ? value : v));
  const cases: [string[], string][] = [
    [swap("--symbol", "XRPUSDT"), "bad_symbol"], [swap("--symbol", "btcusdt"), "bad_symbol"], [swap("--interval", "1h"), "bad_interval"],
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
});
