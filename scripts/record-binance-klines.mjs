#!/usr/bin/env node
// scripts/record-binance-klines.mjs -- recorder of Binance spot 15-minute klines for the strategy library of RECHERCHES (lot
// SERIES-BINANCE, 2026-10-01). Node 24, zero dependencies. Condition C-5 (docs/marche/FAITS-conditions-series-2026-10-01.md): the
// terms were read before any request; one public raw endpoint, no key, no account, no cost; the series are NOT redistributable and
// never enter a repository (an output directory under any git tree is refused); RECHERCHES reviews this recorder before its first call.
//   record: node scripts/record-binance-klines.mjs --symbol BTCUSDT --interval 15m --start 2024-10-01T00:00Z --end 2026-10-01T00:00Z --out <dir>
//   replay: the same flags plus --from-raw <recorded dir>: rebuilds the CSV, missing.json and the manifest from <recorded dir>/raw/ alone,
//           offline, along the same cursor chain (the CSV and missing.json come out byte-identical).
// Network discipline: one hard-coded endpoint whose host is checked against a closed list before each request; redirects refused (any
// 3xx stops); proxies refused (NODE_USE_ENV_PROXY, --use-env-proxy in execArgv or NODE_OPTIONS); NODE_TLS_REJECT_UNAUTHORIZED=0 refused;
// no header is set (so no authentication header); at least 500 ms between two requests; at most 100 requests; no retry, ever.
// Pagination: startTime = cursor, endTime = end - 1 ms, limit = 1000; next cursor = last openTime + 15 min; the loop ends when the
// cursor reaches the end or a page is empty (the rest of the grid is then declared missing).
// Named stops (RecorderStop.code, closed list STOPS) write nothing to the normalized outputs; raw/ and requests.jsonl keep what was
// received. Outputs in --out: raw/<symbol>-<startTime>.json (bytes as received), requests.jsonl, <symbol>-15m.csv (fixed header,
// decimal strings as received, ascending, identical duplicates removed), missing.json (every absent grid slot, never filled),
// manifest.json, SHA256SUMS (sha256sum -c format). Exit 0 written, 1 named stop, 2 usage.
// Test seam: run(argv, io) and main(argv, io) take fetch, sleep, clock, env, execArgv and print from their caller; neither the command
// line nor the environment can set them; the default fetch is read at each request. The agent never commits (R-20).
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ENDPOINT = "https://api.binance.com/api/v3/klines";
export const HOSTS = ["api.binance.com"];
export const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]; // closed list; SOLUSDT: amendment of 2026-10-01
export const INTERVAL = "15m";
export const STEP_MS = 900_000;
export const LIMIT = 1000;
export const PAUSE_MS = 500;
export const MAX_PAGES = 100;
export const TIMEOUT_MS = 30_000;
export const CSV_COLUMNS = ["open_time_utc", "open_time_ms", "open", "high", "low", "close", "volume", "close_time_ms", "quote_volume",
  "trades", "taker_buy_base_volume", "taker_buy_quote_volume"];
export const STOPS = ["usage", "bad_symbol", "bad_interval", "bad_time", "end_in_future", "proxy_refused", "tls_unverified", "out_not_empty",
  "out_in_git_tree", "host_refused", "network_error", "rate_limited", "ip_banned", "restricted_location", "server_error", "redirect_refused",
  "http_status", "body_not_json", "body_not_klines", "row_shape", "off_grid", "close_time", "out_of_range", "duplicate_conflict",
  "cursor_not_advancing", "too_many_pages", "raw_page_missing", "raw_page_unused"];
const LF = String.fromCharCode(10);
const DECIMAL = /^[0-9]+([.][0-9]+)?$/;
const TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(:00)?Z$/;
const FLAGS = ["--symbol", "--interval", "--start", "--end", "--out", "--from-raw"];
const REQUIRED = ["symbol", "interval", "start", "end", "out"];
const PROXY_FLAG = "--use-env-proxy";
const SCRIPT = fileURLToPath(import.meta.url);

/** A named stop: `code` is one of STOPS, `detail` what was seen (URL, status, Retry-After, open time). */
export class RecorderStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "RecorderStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new RecorderStop(code, detail); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
/** ISO 8601 UTC to the second, the form of --start and --end: 2024-10-01T00:00:00Z. */
export const isoOf = (ms) => new Date(ms).toISOString().replace(".000Z", "Z");

/** --start or --end: YYYY-MM-DDTHH:MMZ or YYYY-MM-DDTHH:MM:00Z, a real date (round trip), on the 15-minute grid. */
export function parseTime(text) {
  const ms = TIME.test(text) ? Date.parse(text) : Number.NaN;
  if (!Number.isFinite(ms) || isoOf(ms).slice(0, 16) !== text.slice(0, 16)) stop("bad_time", { value: text, why: "not a whole UTC minute" });
  if (ms % STEP_MS !== 0) stop("bad_time", { value: text, why: "not on the 15-minute grid" });
  return ms;
}

/** The closed command line: each flag once and with a value; --from-raw selects the offline replay. */
export function parseArgs(argv) {
  const a = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!FLAGS.includes(flag) || value === undefined || value.startsWith("--") || a.has(flag.slice(2))) stop("usage", { flag });
    a.set(flag.slice(2), value);
  }
  const absent = REQUIRED.filter((k) => !a.has(k));
  if (absent.length > 0) stop("usage", { absent });
  const symbol = a.get("symbol"), interval = a.get("interval");
  if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { value: symbol, allowed: SYMBOLS });
  if (interval !== INTERVAL) stop("bad_interval", { value: interval, allowed: [INTERVAL] });
  const start = parseTime(a.get("start")), end = parseTime(a.get("end"));
  if (end <= start) stop("bad_time", { why: "--end must come after --start" });
  return { symbol, start, end, out: resolve(a.get("out")), fromRaw: a.has("from-raw") ? resolve(a.get("from-raw")) : null };
}

/** Grid slots in [start, end), both on the grid: 70 080 from 2024-10-01 to 2026-10-01 (730 days x 96). */
export const expectedCount = (start, end) => (end - start) / STEP_MS;

/** No proxy (FAITS F-5: NODE_USE_ENV_PROXY or --use-env-proxy route fetch through HTTP(S)_PROXY) and no disabled TLS check (F-1). */
export function guardEnv(env, execArgv) {
  const flags = [...execArgv, ...(env.NODE_OPTIONS ?? "").split(" ")];
  const proxied = (env.NODE_USE_ENV_PROXY ?? "") !== "" || flags.some((f) => f === PROXY_FLAG || f.startsWith(`${PROXY_FLAG}=`));
  if (proxied) stop("proxy_refused", { NODE_USE_ENV_PROXY: env.NODE_USE_ENV_PROXY ?? null, NODE_OPTIONS: env.NODE_OPTIONS ?? null, execArgv });
  if (env.NODE_TLS_REJECT_UNAUTHORIZED === "0") stop("tls_unverified", { NODE_TLS_REJECT_UNAUTHORIZED: "0" });
}

/** --out: absent or an empty directory, with no ancestor (as given, then as resolved on disk) holding .git, directory or file. */
export function guardOut(out) {
  if (existsSync(out) && (!statSync(out).isDirectory() || readdirSync(out).length > 0)) stop("out_not_empty", { out });
  let near = out;
  while (!existsSync(near) && dirname(near) !== near) near = dirname(near); // ends at a root, even an absent drive
  for (const top of new Set([out, existsSync(near) ? realpathSync.native(near) : near])) {
    for (let dir = top; ; dir = dirname(dir)) {
      if (existsSync(join(dir, ".git"))) stop("out_in_git_tree", { out, git: join(dir, ".git") });
      if (dirname(dir) === dir) break;
    }
  }
}

/** One request: every answer is logged; a 200 body is kept in raw/ before it is read; any other status stops, without retry. */
async function livePage(ctx, cursor) {
  const url = `${ENDPOINT}?symbol=${ctx.symbol}&interval=${INTERVAL}&startTime=${cursor}&endTime=${ctx.end - 1}&limit=${LIMIT}`;
  const u = new URL(url);
  if (u.protocol !== "https:" || !HOSTS.includes(u.host)) stop("host_refused", { url });
  const at = new Date(ctx.now()).toISOString();
  let res, body;
  try {
    res = await ctx.fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
    body = Buffer.from(await res.arrayBuffer());
  } catch (e) {
    stop("network_error", { url, message: String(e?.cause?.message ?? e?.message ?? e) });
  }
  const header = (name) => res.headers.get(name);
  const status = res.status, retryAfter = header("retry-after");
  const line = { url, status, at, bytes: body.length, sha256: sha256(body),
    headers: { date: header("date"), "x-mbx-used-weight-1m": header("x-mbx-used-weight-1m"), "retry-after": retryAfter } };
  appendFileSync(join(ctx.out, "requests.jsonl"), JSON.stringify(line) + LF);
  if (status === 429 || status === 418) stop(status === 429 ? "rate_limited" : "ip_banned", { url, status, retry_after: retryAfter });
  if (status === 451) stop("restricted_location", { url, status });
  if (status >= 500) stop("server_error", { url, status });
  if (status >= 300 && status < 400) stop("redirect_refused", { url, status, location: header("location") });
  if (status !== 200) stop("http_status", { url, status });
  writeFileSync(join(ctx.out, "raw", `${ctx.symbol}-${cursor}.json`), body);
  return body;
}

/** The replay reads the page that the same cursor fetched, raw/<symbol>-<cursor>.json, and nothing else. */
function rawPage(ctx, cursor) {
  const name = `${ctx.symbol}-${cursor}.json`, path = join(ctx.fromRaw, "raw", name);
  if (!existsSync(path)) stop("raw_page_missing", { page: path });
  ctx.used.add(name);
  return readFileSync(path);
}

/** H-1 (journal, section 5): 12 fields; [0] [6] [8] integers; [1]-[5] [7] [9] [10] decimal strings; [11] a string. Then grid, close, range. */
function checkRow(k, ctx) {
  const shaped = Array.isArray(k) && k.length === 12 && [0, 6, 8].every((i) => Number.isSafeInteger(k[i]) && k[i] >= 0)
    && [1, 2, 3, 4, 5, 7, 9, 10].every((i) => typeof k[i] === "string" && DECIMAL.test(k[i])) && typeof k[11] === "string";
  if (!shaped) stop("row_shape", { row: k });
  if (k[0] % STEP_MS !== 0) stop("off_grid", { open_time_ms: k[0] });
  if (k[6] !== k[0] + STEP_MS - 1) stop("close_time", { open_time_ms: k[0], close_time_ms: k[6] });
  if (k[0] < ctx.start || k[0] >= ctx.end) stop("out_of_range", { open_time_ms: k[0] });
}

/** The cursor loop that the recording and the replay share: same pages, same order, same checks. */
async function collect(ctx, page) {
  const rows = new Map();
  let cursor = ctx.start, pages = 0, duplicates = 0;
  while (cursor < ctx.end) {
    if (pages === MAX_PAGES) stop("too_many_pages", { pages, cursor });
    if (pages > 0 && ctx.live) await ctx.sleep(PAUSE_MS);
    const body = await page(ctx, cursor);
    pages += 1;
    let list;
    try { list = JSON.parse(body.toString("utf8")); } catch { stop("body_not_json", { cursor, bytes: body.length }); }
    if (!Array.isArray(list)) stop("body_not_klines", { cursor });
    for (const k of list) {
      checkRow(k, ctx);
      const kept = rows.get(k[0]);
      if (kept === undefined) rows.set(k[0], k);
      else if (JSON.stringify(kept) === JSON.stringify(k)) duplicates += 1;
      else stop("duplicate_conflict", { open_time_ms: k[0], kept, received: k });
    }
    if (list.length === 0) break;
    const next = list[list.length - 1][0] + STEP_MS;
    if (next <= cursor) stop("cursor_not_advancing", { cursor, next });
    cursor = next;
  }
  return { rows, pages, duplicates };
}

/** Ascending rows to CSV lines (fields [1]-[10] as received); every grid slot of [start, end) without a row is missing. */
function normalize(ctx, rows) {
  const times = [...rows.keys()].sort((a, b) => a - b);
  const lines = times.map((t) => rows.get(t)).map((k) => [isoOf(k[0]), String(k[0]), k[1], k[2], k[3], k[4], k[5], String(k[6]), k[7],
    String(k[8]), k[9], k[10]].join(","));
  const missing = [];
  for (let t = ctx.start; t < ctx.end; t += STEP_MS) if (!rows.has(t)) missing.push({ open_time_ms: t, open_time_utc: isoOf(t) });
  return { csv: [CSV_COLUMNS.join(","), ...lines].join(LF) + LF, times, missing };
}

/** The normalized outputs, written once every check has passed; SHA256SUMS covers every file of --out. */
function writeOutputs(ctx, got, norm, startedAt) {
  const csvName = `${ctx.symbol}-${INTERVAL}.csv`, first = norm.times[0], last = norm.times.at(-1);
  const missingDoc = { symbol: ctx.symbol, interval: INTERVAL, start: isoOf(ctx.start), end_exclusive: isoOf(ctx.end),
    count: norm.missing.length, missing: norm.missing };
  const manifest = { schema: "monark.series.binance.v1", mode: ctx.live ? "record" : "replay", platform: "binance", endpoint: ENDPOINT,
    symbol: ctx.symbol, interval: INTERVAL, start: isoOf(ctx.start), end_exclusive: isoOf(ctx.end), expected: expectedCount(ctx.start, ctx.end),
    rows: norm.times.length, missing: norm.missing.length, duplicates_removed: got.duplicates, pages: got.pages,
    first_open_time: first === undefined ? null : isoOf(first), last_open_time: last === undefined ? null : isoOf(last),
    csv: csvName, csv_sha256: sha256(norm.csv), script_sha256: sha256(readFileSync(SCRIPT)), node: process.version,
    from_raw: ctx.fromRaw, started_at: startedAt, finished_at: new Date(ctx.now()).toISOString(),
    redistributable: false, terms: "docs/marche/FAITS-conditions-series-2026-10-01.md" };
  writeFileSync(join(ctx.out, csvName), norm.csv);
  writeFileSync(join(ctx.out, "missing.json"), JSON.stringify(missingDoc, null, 2) + LF);
  writeFileSync(join(ctx.out, "manifest.json"), JSON.stringify(manifest, null, 2) + LF);
  const logs = ctx.live ? ["requests.jsonl", ...readdirSync(join(ctx.out, "raw")).map((n) => `raw/${n}`)] : [];
  const names = [csvName, "missing.json", "manifest.json", ...logs].sort();
  writeFileSync(join(ctx.out, "SHA256SUMS"), names.map((n) => `${sha256(readFileSync(join(ctx.out, n)))}  ${n}`).join(LF) + LF);
  return manifest;
}

/** One recording (or, with --from-raw, one replay) into --out: resolves to the manifest, rejects with a RecorderStop. */
export async function run(argv, io = {}) {
  const now = io.now ?? Date.now;
  const args = parseArgs(argv);
  if (args.end > now()) stop("end_in_future", { end: isoOf(args.end), now: new Date(now()).toISOString() });
  const live = args.fromRaw === null;
  if (live) guardEnv(io.env ?? process.env, io.execArgv ?? process.execArgv);
  guardOut(args.out);
  const ctx = { ...args, live, now, used: new Set(), fetch: io.fetch ?? ((url, init) => globalThis.fetch(url, init)),
    sleep: io.sleep ?? ((ms) => new Promise((done) => { setTimeout(done, ms); })) };
  const startedAt = new Date(now()).toISOString();
  mkdirSync(live ? join(args.out, "raw") : args.out, { recursive: true });
  const got = await collect(ctx, live ? livePage : rawPage);
  if (!live) {
    const unused = readdirSync(join(args.fromRaw, "raw")).filter((n) => !ctx.used.has(n)).sort();
    if (unused.length > 0) stop("raw_page_unused", { files: unused });
  }
  return writeOutputs(ctx, got, normalize(ctx, got.rows), startedAt);
}

/** The command line: one JSON line on stdout when the outputs are written (exit 0), one on stderr on a stop (1; usage 2). */
export async function main(argv, io = {}) {
  const print = io.print ?? ((line, toStderr) => { (toStderr ? process.stderr : process.stdout).write(line + LF); });
  try {
    const m = await run(argv, io);
    print(JSON.stringify({ ok: true, mode: m.mode, symbol: m.symbol, rows: m.rows, missing: m.missing, csv_sha256: m.csv_sha256 }), false);
    return 0;
  } catch (e) {
    if (!(e instanceof RecorderStop)) throw e;
    print(JSON.stringify({ ok: false, stop: e.code, detail: e.detail }), true);
    return e.code === "usage" ? 2 : 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(SCRIPT)) process.exitCode = await main(process.argv.slice(2));
