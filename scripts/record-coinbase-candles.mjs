#!/usr/bin/env node
// scripts/record-coinbase-candles.mjs -- recorder of Coinbase Exchange candles (USDT-USD, 900 s), the USDT/USD reference of the EE-7
// detector of RECHERCHES (ADR 0006 addendum 4, section 3; lot COINBASE-USDT-RECORDER-1; addendum 7, lot COINBASE-ADD7-1). Node 24, zero deps,
// patterned on scripts/record-binance-klines.mjs. Terms and documentation read before any request:
// docs/marche/FAITS-USDT-USD-HISTORY-1-conditions-2026-10-03.md (parts 2 and 4); the series are NOT redistributable and never enter a
// repository (an output directory under any git tree is refused); RECHERCHES reviews this recorder before its first call.
//   record: node scripts/record-coinbase-candles.mjs --product USDT-USD --granularity 15m --start 2022-09-01T00:00Z
//           --end 2022-10-01T00:00Z --out <dir> [--pass 2]   (the second reading of a month, ADR 0006 addendum 7 R1)
//   replay: the same flags plus --from-raw <recorded dir>: once every raw/ page matches the SHA256SUMS of <recorded dir>, rebuilds the CSV,
//           missing.json and the manifest from its raw/ alone, offline, window by window (the CSV and missing.json come out byte-identical).
// Network discipline: one hard-coded endpoint whose URL passes checkHost (https, a host of the closed list, no port, no user) before each
// request; redirects refused (any 3xx stops); proxies refused: any variable NODE_OPTIONS, NODE_USE_ENV_PROXY or *_PROXY, any node flag;
// the TLS trust kept to the roots bundled with node: any variable NODE_USE_SYSTEM_CA, NODE_EXTRA_CA_CERTS, SSL_CERT_FILE, SSL_CERT_DIR or
// any OPENSSL_* refused; NODE_TLS_REJECT_UNAUTHORIZED=0 refused; no header is set (so no authentication header); a delay of 30 s per
// request, whose expiry stops (timeout); at least 250 ms between two requests; at most 100 requests per run, counted before the first
// one; no retry, ever; each body read as a stream, at most BODY_MAX bytes: one byte more stops (body_too_large), nothing of it written.
// Windows: [start, end) is cut into cores of 298 slots (--pass 2, lot COINBASE-PASS-EDGES-1: [start - 149 slots, end + 149 slots), so
// that each bound of its cores inside [start, end) falls in a core of pass 1, 149 slots after its start; the starts of the requests of
// the two passes never meet (298 k - 1 against 298 k - 150 slots after start), and a core of pass 2 ends where a core of pass 1 ends
// only when end - start is 149 slots modulo 298, at end: such a pass 2 stops before any request (bad_pass, G2-1 of the G2 of that lot;
// the comparison refuses that month too), so no request of pass 2 shares its start or its end with one of pass 1; a slot of its cores
// outside [start, end) is a witness, counted in the manifest, witness_slots, never written to the CSV nor to missing.json), one request
// each, in order, asking start = core start - 900 s and end = core end: at most 300 data points, never 301 (the documentation reads
// neither bound). A slot is missing when the answer for its core does not serve it; a candle before start is discarded and counted
// (documented), one at start or at end is a counted margin candle, one after end stops; a candle whose slot was already seen must be
// identical. A page that serves candles, none in its [start, end], stops (window_not_served); after the last request a slot of
// [start, end) that a page serves and no core keeps stops (window_inconsistent), then any empty page (empty_page, the pages listed: a
// question to RECHERCHES, addendum 7) but an empty page whose core starts after end, after a core whose request holds end strictly
// inside it: witnesses alone, counted (empty_witness_pages, pass 2; rule of RECHERCHES, 2026-10-03). A reading of the bounds other
// than the measured ones ends in a named stop, never a false gap.
// Candles [time, low, high, open, close, volume] are JSON numbers: JSON.parse reads the shape, the raw text gives the digits (never a
// float). Named stops (RecorderStop.code, closed list STOPS) write nothing to the normalized outputs; raw/ (a body other than 200 under
// raw/errors/) and requests.jsonl (a line with the status and headers of an answer as they arrive, then that line with the size and the
// sha256 of its body) keep what was received; a stop detail carries URLs, statuses, times, ranks, names and digests, never a price, a
// volume nor the value of a variable. Outputs in --out:
// raw/<product>-<window start ms>.json (bytes as received), requests.jsonl, <product>-<granularity>.csv (fixed header, values as
// received, ascending), missing.json (every absent grid slot, never filled), manifest.json, SHA256SUMS (sha256sum -c format).
// Exit 0 written, 1 named stop, 2 usage, 3 unforeseen error; one JSON line each.
// Test seam: run(argv, io) and main(argv, io) take fetch, sleep, now, timeoutMs, env, execArgv and print from their caller; neither the
// command line nor the environment can set them; the default fetch is read at each request. The agent never commits (R-20).
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ORIGIN = "https://api.exchange.coinbase.com";
export const HOSTS = ["api.exchange.coinbase.com"];
export const PRODUCTS = ["USDT-USD"]; // closed list
export const GRANULARITIES = Object.freeze({ "15m": 900 }); // closed list: name -> seconds, the value of the granularity parameter
const MINUTE_MS = 60_000; // a bad_time names the grid in minutes: "not on the 15-minute grid"
export const WINDOW = 300; // data points per request, the documented maximum
const CORE = WINDOW - 2, HALF = CORE / 2; // slots per request: a margin slot on each side keeps 299 or 300 points; HALF pads pass 2
export const PAUSE_MS = 250;
export const MAX_PAGES = 100;
export const TIMEOUT_MS = 30_000;
/** Bytes of one body, read as a stream (SERIES-BODY-BOUND-1): 300 candles of 15 min whose five values are the longest plain text of a
 *  float64 (24 characters) weigh 41 401 bytes, 52 202 indented by two spaces; 2 ** 16 is above both (G1 journal, COINBASE-PASS-EDGES-1). */
export const BODY_MAX = 65_536;
export const CSV_COLUMNS = ["open_time_utc", "open_time_ms", "low", "high", "open", "close", "volume"];
export const STOPS = ["usage", "bad_product", "bad_granularity", "bad_time", "end_in_future", "too_many_pages", "proxy_refused",
  "tls_unverified", "out_not_empty", "out_in_git_tree", "host_refused", "network_error", "timeout", "rate_limited", "server_error",
  "redirect_refused", "http_status", "body_not_json", "body_not_candles", "row_shape", "off_grid", "out_of_window", "duplicate_conflict",
  "raw_page_altered", "raw_page_missing", "raw_page_unused", "window_not_served", "window_inconsistent", "empty_page", "bad_pass",
  "body_too_large"];
const LF = String.fromCharCode(10);
const DECIMAL = /^[0-9]+([.][0-9]+)?$/; // a plain decimal: no sign, no exponent (JSON already refuses a leading zero)
const SECONDS = /^[0-9]+$/;
const NUMBER = /[-+.0-9eE]+/g; // in a body that JSON.parse read as lists of numbers, each run of these characters is one number
const TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(:00)?Z$/;
const SUM_LINE = /^([0-9a-f]{64}) {2}(.+)$/; // a SHA256SUMS line: the sha256, two spaces, a path relative to the recorded directory
const PROXY_NAME = /^(NODE_OPTIONS|NODE_USE_ENV_PROXY)$|_PROXY$/i; // NODE_OPTIONS, even quoted, or a config file flag routes fetch via a proxy
const TRUST_NAME = /^(NODE_USE_SYSTEM_CA|NODE_EXTRA_CA_CERTS|SSL_CERT_FILE|SSL_CERT_DIR)$|^OPENSSL_/i; // TLS roots added or replaced; OPENSSL_*: a family
const FLAGS = ["--product", "--granularity", "--start", "--end", "--out", "--from-raw", "--pass"];
const REQUIRED = ["product", "granularity", "start", "end", "out"];
const SCRIPT = fileURLToPath(import.meta.url);

/** A named stop: `code` is one of STOPS, `detail` what was seen (URL, status, Retry-After, times, ranks, digests; never a value). */
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
/** ISO 8601 UTC to the second, the form of --start, --end and of the start and end parameters: 2022-09-01T00:00:00Z. */
export const isoOf = (ms) => new Date(ms).toISOString().replace(".000Z", "Z");

/** --start or --end: YYYY-MM-DDTHH:MMZ or YYYY-MM-DDTHH:MM:00Z, a real date (round trip), on the grid of the granularity. */
export function parseTime(text, granularity = "15m") {
  const ms = TIME.test(text) ? Date.parse(text) : Number.NaN, step = GRANULARITIES[granularity] * 1000;
  if (!Number.isFinite(ms) || isoOf(ms).slice(0, 16) !== text.slice(0, 16)) stop("bad_time", { value: text, why: "not a whole UTC minute" });
  if (ms % step !== 0) stop("bad_time", { value: text, why: `not on the ${String(step / MINUTE_MS)}-minute grid` });
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
  const product = a.get("product"), granularity = a.get("granularity");
  if (!PRODUCTS.includes(product)) stop("bad_product", { value: product, allowed: PRODUCTS });
  if (!Object.hasOwn(GRANULARITIES, granularity)) stop("bad_granularity", { value: granularity, allowed: Object.keys(GRANULARITIES) });
  const step = GRANULARITIES[granularity] * 1000, start = parseTime(a.get("start"), granularity), end = parseTime(a.get("end"), granularity);
  if (end <= start) stop("bad_time", { why: "--end must come after --start" });
  const pass = a.has("pass") ? ["1", "2"].indexOf(a.get("pass")) + 1 : 1; // absent: the first reading of the window
  if (pass === 0) stop("bad_pass", { value: a.get("pass"), allowed: ["1", "2"] });
  return { product, granularity, step, start, end, out: resolve(a.get("out")), fromRaw: a.has("from-raw") ? resolve(a.get("from-raw")) : null, pass };
}

/** Grid slots in [start, end): 2 880 in a month of 30 days, 146 112 from 2022-08-01 to 2026-10-01 (the monthly plan of the corrections). */
export const expectedCount = (start, end, granularity = "15m") => (end - start) / (GRANULARITIES[granularity] * 1000);
/** Requests of one run, one per core: pass 1, 10 in any month (2 688 to 2 976 slots), 491 from 2022-08-01 to 2026-10-01; pass 2, 11. */
export const windowCount = (start, end, granularity = "15m", pass = 1) => cores(start, end, GRANULARITIES[granularity] * 1000, pass).length;

/** The windows [from, to) of one run, in order (recording, replay, windowCount and end_in_future): cores of CORE slots, the last one cut
 *  short, over [start, end) in pass 1 and over [start - HALF, end + HALF) slots in pass 2 (ADR 0006 addendum 7 R1, a second reading whose
 *  windows are shifted by half a core; lot COINBASE-PASS-EDGES-1, its first and last ones too: no start shared with pass 1, and an end
 *  shared only when end - start is HALF slots modulo CORE, a pass 2 that run refuses: sharedEnd). */
function cores(start, end, step, pass) {
  const out = [], pad = pass === 2 ? HALF * step : 0;
  for (let from = start - pad, to; from < end + pad; from = to) {
    to = Math.min(from + CORE * step, end + pad);
    out.push([from, to]);
  }
  return out;
}

/** The first end of a core of pass 2 that is also the end of a core of pass 1 over [start, end), or null (G2-1 of the G2 of lot
 *  COINBASE-PASS-EDGES-1): only when end - start is HALF slots modulo CORE, a core of pass 2 then ending at end, as the last core of pass
 *  1 does; run refuses such a pass 2 before any request and scripts/compare-coinbase-passes.mjs refuses such a month. */
export function sharedEnd(start, end, step) {
  const ends = new Set(cores(start, end, step, 1).map(([, to]) => to));
  return cores(start, end, step, 2).map(([, to]) => to).find((to) => ends.has(to)) ?? null;
}

/** No proxy route and no widened TLS trust: a variable named NODE_OPTIONS or NODE_USE_ENV_PROXY or ending in _PROXY, or one of the four
 *  names of TRUST_NAME or starting with OPENSSL_ (any case, any value, even empty), or any node flag is refused, its detail naming them,
 *  never a value (a proxy URL may carry a password); then no disabled TLS check. */
export function guardEnv(env, execArgv) {
  const names = Object.keys(env).filter((k) => PROXY_NAME.test(k) || TRUST_NAME.test(k)).sort();
  if (names.length > 0 || execArgv.length > 0) stop("proxy_refused", { variables: names, flags: execArgv.map((f) => f.split("=")[0]) });
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

/** Before each request: https, a host of the closed list with no port, no user nor password in the URL; else host_refused. */
export function checkHost(url) {
  const u = URL.canParse(url) ? new URL(url) : null;
  if (u === null || u.protocol !== "https:" || !HOSTS.includes(u.host) || u.username !== "" || u.password !== "") stop("host_refused", { url });
}

/** The body of an answer read as a stream: its bytes, or null as soon as they pass BODY_MAX (the stream then cancelled, nothing kept);
 *  an error of the stream rejects, for its caller to name (SERIES-BODY-BOUND-1; scripts/probe-coinbase-bounds.mjs reads its bodies so). */
export async function readBody(res) {
  const reader = res.body?.getReader(), chunks = [];
  let bytes = 0;
  for (let part = await reader?.read(); part !== undefined && !part.done; part = await reader.read()) {
    bytes += part.value.byteLength;
    if (bytes > BODY_MAX) { reader.cancel().catch(() => undefined); return null; }
    chunks.push(part.value);
  }
  return Buffer.concat(chunks);
}

/** One request per window: its status and headers are logged as they arrive, with the file that will keep its body (raw/ for a 200,
 *  raw/errors/ else), then that line again with the size and sha256 of the body, written before it is read; any status but 200 stops,
 *  no retry; an error once the delay has expired is a timeout, any other one a network_error; a body past BODY_MAX stops
 *  (body_too_large) with the first line alone, nothing of it written. */
async function livePage(ctx, from, to) {
  const url = `${ORIGIN}/products/${ctx.product}/candles?granularity=${String(ctx.step / 1000)}&start=${isoOf(from - ctx.step)}&end=${isoOf(to)}`;
  checkHost(url);
  const at = new Date(ctx.now()).toISOString(), name = `${ctx.product}-${String(from)}.json`, signal = AbortSignal.timeout(ctx.timeoutMs);
  const failed = (e) => stop(signal.aborted ? "timeout" : "network_error", { url, message: String(e?.cause?.message ?? e?.message ?? e) });
  const log = (entry) => { appendFileSync(join(ctx.out, "requests.jsonl"), JSON.stringify(entry) + LF); };
  let res, body;
  try { res = await ctx.fetch(url, { redirect: "manual", signal }); } catch (e) { failed(e); }
  const header = (h) => res.headers.get(h);
  const status = res.status, retryAfter = header("retry-after"), file = status === 200 ? `raw/${name}` : `raw/errors/${name}`;
  const line = { url, status, at, file, headers: { date: header("date"), "retry-after": retryAfter }, header_names: [...res.headers.keys()] };
  log(line);
  try { body = await readBody(res); } catch (e) { failed(e); }
  if (body === null) stop("body_too_large", { url, status, max_bytes: BODY_MAX });
  log({ ...line, bytes: body.length, sha256: sha256(body) });
  if (status !== 200) mkdirSync(join(ctx.out, "raw", "errors"), { recursive: true });
  writeFileSync(join(ctx.out, file), body);
  if (status === 429) stop("rate_limited", { url, status, retry_after: retryAfter });
  if (status >= 500) stop("server_error", { url, status });
  if (status >= 300 && status < 400) stop("redirect_refused", { url, status, location: header("location") });
  if (status !== 200) stop("http_status", { url, status });
  return body;
}

/** The replay reads the page that the same window fetched, raw/<product>-<window start>.json, and nothing else. */
function rawPage(ctx, from) {
  const name = `${ctx.product}-${String(from)}.json`, path = join(ctx.fromRaw, "raw", name);
  if (!existsSync(path)) stop("raw_page_missing", { page: path });
  ctx.used.add(name);
  return readFileSync(path);
}

/** Before any replay: the files of <recorded dir>/raw are exactly the raw/ lines of its SHA256SUMS, each at its sha256; else nothing runs. */
function verifyRaw(dir) {
  const sums = join(dir, "SHA256SUMS"), raw = join(dir, "raw"), listed = new Map(), names = new Set();
  if (!existsSync(sums) || !statSync(sums).isFile()) stop("raw_page_altered", { sums, why: "no SHA256SUMS" });
  const lines = readFileSync(sums, "utf8").split(LF);
  if (lines.pop() !== "") stop("raw_page_altered", { sums, line: lines.length + 1, why: "malformed line" });
  lines.forEach((l, i) => {
    const m = SUM_LINE.exec(l);
    if (m === null || names.has(m[2])) stop("raw_page_altered", { sums, line: i + 1, why: "malformed line" });
    names.add(m[2]);
    if (m[2].startsWith("raw/")) listed.set(m[2].slice(4), m[1]);
  });
  const present = existsSync(raw) ? readdirSync(raw) : [];
  for (const name of [...new Set([...listed.keys(), ...present])].sort()) {
    const page = join(raw, name), hash = listed.get(name);
    if (hash === undefined) stop("raw_page_altered", { page, why: "not listed in SHA256SUMS" });
    if (!present.includes(name)) stop("raw_page_altered", { page, why: "listed in SHA256SUMS, absent" });
    if (!statSync(page).isFile() || sha256(readFileSync(page)) !== hash) stop("raw_page_altered", { page, why: "sha256 differs" });
  }
}

/** One page: its shape read by JSON.parse, a list of [time, low, high, open, close, volume] numbers; its digits from the raw text. */
function candlesOf(ctx, body, from) {
  const text = body.toString("utf8"), page = isoOf(from);
  let list;
  try { list = JSON.parse(text); } catch { stop("body_not_json", { page, bytes: body.length }); }
  if (!Array.isArray(list)) stop("body_not_candles", { page });
  const numbers = text.match(NUMBER) ?? [];
  return list.map((k, row) => {
    if (!Array.isArray(k) || k.length !== 6 || !k.every((v) => typeof v === "number")) stop("row_shape", { page, row, why: "not 6 numbers" });
    const fields = numbers.slice(6 * row, 6 * row + 6), ms = Number(fields[0]) * 1000;
    if (!SECONDS.test(fields[0]) || !Number.isSafeInteger(ms)) stop("row_shape", { page, row, why: "time not in whole seconds" });
    if (!fields.slice(1).every((f) => DECIMAL.test(f))) stop("row_shape", { page, row, why: "a value not a plain decimal" });
    if (ms % ctx.step !== 0) stop("off_grid", { page, row, open_time_ms: ms });
    return { ms, fields, row };
  });
}

/** The window loop that the recording and the replay share: same windows, same order, same checks. Every candle is compared with the
 *  first one seen for its slot on any page (the end margin of a window comes before the core that keeps that slot). A page that serves
 *  candles, none in its [start, end], and a slot of [start, end) seen on a page yet kept by no core are named stops (G2c-2 of the G2);
 *  an empty page is counted and the run goes on to its last request, then stops empty_page (addendum 7, correction 3 of RECHERCHES).
 *  A slot of a core outside [start, end), in pass 2 alone, is a witness: kept apart, never a row (lot COINBASE-PASS-EDGES-1). An empty
 *  page whose core starts after end holds witnesses alone, and the core before it holds end strictly inside its request: counted, never
 *  a stop (rule of RECHERCHES, 2026-10-03). A core of pass 2 starts at end only when end - start is HALF slots modulo CORE, a pass 2 that
 *  run refuses before any request (sharedEnd): from = end never reaches this loop, where its empty page would stay a stop. */
async function collect(ctx, page) {
  const rows = new Map(), seen = new Map(), witnesses = new Set();
  const got = { pages: 0, duplicates: 0, before: 0, atStart: 0, atEnd: 0, empty: [], emptyWitness: 0 };
  for (const [from, to] of cores(ctx.start, ctx.end, ctx.step, ctx.pass)) {
    const first = from - ctx.step;
    if (got.pages > 0 && ctx.live) await ctx.sleep(PAUSE_MS);
    const body = await page(ctx, from, to);
    got.pages += 1;
    let served = 0, inside = 0;
    for (const { ms, fields, row } of candlesOf(ctx, body, from)) {
      served += 1; inside += ms >= first ? 1 : 0;
      if (ms > to) stop("out_of_window", { page: isoOf(from), row, open_time_ms: ms, end: isoOf(to) });
      const line = fields.join(","), prior = seen.get(ms);
      if (prior !== undefined && prior !== line) {
        stop("duplicate_conflict", { open_time_ms: ms, kept_sha256: sha256(prior), received_sha256: sha256(line) });
      }
      seen.set(ms, line);
      if (ms < first) got.before += 1;
      else if (ms === first) got.atStart += 1;
      else if (ms === to) got.atEnd += 1;
      else if (rows.has(ms) || witnesses.has(ms)) got.duplicates += 1;
      else if (ms < ctx.start || ms >= ctx.end) witnesses.add(ms);
      else rows.set(ms, fields);
    }
    if (served > 0 && inside === 0) stop("window_not_served", { page: isoOf(from), candles: served });
    if (served === 0 && from > ctx.end) got.emptyWitness += 1; // witnesses alone, end inside the request before: counted
    else if (served === 0) got.empty.push(isoOf(from));
  }
  const orphans = [...seen.keys()].filter((t) => t >= ctx.start && t < ctx.end && !rows.has(t));
  if (orphans.length > 0) stop("window_inconsistent", { slots: orphans.length, first: isoOf(Math.min(...orphans)) });
  if (got.empty.length > 0) stop("empty_page", { empty_pages: got.empty.length, pages: got.empty });
  return { rows, witnesses, ...got };
}

/** Ascending candles to CSV lines (the five values as received); every grid slot of [start, end) without a candle is missing. */
function normalize(ctx, rows) {
  const times = [...rows.keys()].sort((a, b) => a - b);
  const lines = times.map((t) => [isoOf(t), String(t), ...rows.get(t).slice(1)].join(","));
  const missing = [];
  for (let t = ctx.start; t < ctx.end; t += ctx.step) if (!rows.has(t)) missing.push({ open_time_ms: t, open_time_utc: isoOf(t) });
  return { csv: [CSV_COLUMNS.join(","), ...lines].join(LF) + LF, times, missing };
}

/** witness_slots of a pass 2 (lot COINBASE-PASS-EDGES-1): the count of its witnesses, the open times of the first and of the last (null
 *  for none); never a value. */
const witnessesOf = (w) => ({ count: w.size, first: w.size > 0 ? isoOf(Math.min(...w)) : null, last: w.size > 0 ? isoOf(Math.max(...w)) : null });

/** The normalized outputs, written once every check has passed; SHA256SUMS covers every file of --out. */
function writeOutputs(ctx, got, norm, startedAt) {
  const csvName = `${ctx.product}-${ctx.granularity}.csv`, first = norm.times[0], last = norm.times.at(-1);
  const missingText = JSON.stringify({ product: ctx.product, granularity: ctx.granularity, start: isoOf(ctx.start),
    end_exclusive: isoOf(ctx.end), count: norm.missing.length, missing: norm.missing }, null, 2) + LF;
  const manifest = { schema: "monark.series.coinbase.v2", mode: ctx.live ? "record" : "replay", platform: "coinbase",
    endpoint: `${ORIGIN}/products/${ctx.product}/candles`, product: ctx.product, granularity: ctx.granularity,
    granularity_s: ctx.step / 1000, start: isoOf(ctx.start), end_exclusive: isoOf(ctx.end), pass: ctx.pass,
    expected: expectedCount(ctx.start, ctx.end, ctx.granularity), rows: norm.times.length, missing: norm.missing.length, empty_pages: got.empty.length,
    duplicates_removed: got.duplicates, discarded_before_start: got.before, margin_at_start: got.atStart, margin_at_end: got.atEnd,
    ...(ctx.pass === 2 ? { witness_slots: witnessesOf(got.witnesses), empty_witness_pages: got.emptyWitness } : {}), // pass 1: base keys
    pages: got.pages, first_open_time: first === undefined ? null : isoOf(first), last_open_time: last === undefined ? null : isoOf(last),
    csv: csvName, csv_sha256: sha256(norm.csv), missing_sha256: sha256(missingText), recorder_sha256: sha256(readFileSync(SCRIPT)),
    node: process.version, from_raw: ctx.fromRaw, started_at: startedAt, finished_at: new Date(ctx.now()).toISOString(),
    redistributable: false, terms: "docs/marche/FAITS-USDT-USD-HISTORY-1-conditions-2026-10-03.md" };
  writeFileSync(join(ctx.out, csvName), norm.csv);
  writeFileSync(join(ctx.out, "missing.json"), missingText);
  writeFileSync(join(ctx.out, "manifest.json"), JSON.stringify(manifest, null, 2) + LF);
  const logs = ctx.live ? ["requests.jsonl", ...readdirSync(join(ctx.out, "raw")).map((n) => `raw/${n}`)] : [];
  const names = [csvName, "missing.json", "manifest.json", ...logs].sort();
  writeFileSync(join(ctx.out, "SHA256SUMS"), names.map((n) => `${sha256(readFileSync(join(ctx.out, n)))}  ${n}`).join(LF) + LF);
  return manifest;
}

/** One recording (or, with --from-raw, one replay) into --out: resolves to the manifest, rejects with a RecorderStop. */
export async function run(argv, io = {}) {
  const now = io.now ?? Date.now;
  const args = parseArgs(argv), windows = cores(args.start, args.end, args.step, args.pass);
  const shared = args.pass === 2 ? sharedEnd(args.start, args.end, args.step) : null; // G2-1: before any request, in both modes
  if (shared !== null) stop("bad_pass", { value: "2", allowed: ["1"], core_end: isoOf(shared) });
  const reach = windows.at(-1)[1]; // the end of the last window: --end, or 149 slots past it in pass 2 (its witnesses: past data alone)
  if (reach > now()) stop("end_in_future", { end: isoOf(reach), now: new Date(now()).toISOString() });
  const pages = windows.length;
  if (pages > MAX_PAGES) stop("too_many_pages", { pages, max: MAX_PAGES });
  const live = args.fromRaw === null;
  if (live) guardEnv(io.env ?? process.env, io.execArgv ?? process.execArgv);
  guardOut(args.out);
  if (!live) verifyRaw(args.fromRaw);
  const ctx = { ...args, live, now, used: new Set(), timeoutMs: io.timeoutMs ?? TIMEOUT_MS,
    fetch: io.fetch ?? ((url, init) => globalThis.fetch(url, init)), sleep: io.sleep ?? ((ms) => new Promise((done) => { setTimeout(done, ms); })) };
  const startedAt = new Date(now()).toISOString();
  mkdirSync(live ? join(args.out, "raw") : args.out, { recursive: true });
  const got = await collect(ctx, live ? livePage : rawPage);
  if (!live) {
    const unused = readdirSync(join(args.fromRaw, "raw")).filter((n) => !ctx.used.has(n)).sort();
    if (unused.length > 0) stop("raw_page_unused", { files: unused });
  }
  return writeOutputs(ctx, got, normalize(ctx, got.rows), startedAt);
}

/** The command line: one JSON line on stdout when the outputs are written (exit 0), one on stderr on a stop (1; usage 2) or on an
 *  unforeseen error (3, its name and message). */
export async function main(argv, io = {}) {
  const print = io.print ?? ((line, toStderr) => { (toStderr ? process.stderr : process.stdout).write(line + LF); });
  try {
    const m = await run(argv, io);
    print(JSON.stringify({ ok: true, mode: m.mode, product: m.product, rows: m.rows, missing: m.missing, csv_sha256: m.csv_sha256 }), false);
    return 0;
  } catch (e) {
    if (e instanceof RecorderStop) {
      print(JSON.stringify({ ok: false, stop: e.code, detail: e.detail }), true);
      return e.code === "usage" ? 2 : 1;
    }
    print(JSON.stringify({ ok: false, error: e instanceof Error ? e.name : typeof e, message: e instanceof Error ? e.message : String(e) }), true);
    return 3;
  }
}

// Main guard by real paths (F-4 of the G2 of the EE-7 detector, the same pattern): launched through a link, argv[1] is not the real path
// that import.meta.url carries; resolve() alone would make that launch exit 0 with nothing written.
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(SCRIPT)) {
  process.exitCode = await main(process.argv.slice(2));
}
