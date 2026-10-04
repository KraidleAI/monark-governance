#!/usr/bin/env node
// scripts/record-binance-klines.mjs -- recorder of Binance spot klines (15m, 1h or 4h) for the strategy library of RECHERCHES (lots
// SERIES-BINANCE and SERIES-INTERVALS, 2026-10-01). Node 24, zero dependencies. Condition C-5 (docs/marche/FAITS-conditions-series-2026-10-01.md): the
// terms were read before any request; one public raw endpoint, no key, no account, no cost; the series are NOT redistributable and
// never enter a repository (an output directory under any git tree is refused); RECHERCHES reviews this recorder before its first call.
//   record: node scripts/record-binance-klines.mjs --symbol BTCUSDT --interval 15m --start 2024-10-01T00:00Z --end 2026-10-01T00:00Z --out <dir>
//   replay: the same flags plus --from-raw <recorded dir>: rebuilds the CSV, missing.json and the manifest from <recorded dir>/raw/ alone,
//           offline, along the same cursor chain (the CSV and missing.json come out byte-identical).
// Network discipline: one hard-coded endpoint whose host is checked against a closed list before each request; redirects refused (any
// 3xx stops); NODE_TLS_REJECT_UNAUTHORIZED=0 refused; a recording admits the variables of a closed list alone (ADMITTED_ENV, names in any
// case, values never read: any other name stops, env_refused, a TLS trust anchor or an OPENSSL_* among them, proxy_refused for a proxy
// variable, a NODE_OPTIONS, a NODE_USE_ENV_PROXY or a *_PROXY) and no node flag in execArgv (proxy_refused); no header is set (so no
// authentication header); at least 500 ms between two requests; at most 100 requests; no retry, ever; each body is read in a stream, at
// most MAX_BODY_BYTES (body_too_large beyond); a 200 whose connection showed no certificate stops before its body is read (tls_unattested).
// Pagination: startTime = cursor, endTime = end - 1 ms, limit = 1000; next cursor = last openTime + one interval; the loop ends when the
// cursor reaches the end or a page is empty (the rest of the grid is then declared missing).
// Named stops (RecorderStop.code, closed list STOPS) write nothing to the normalized outputs; raw/ and requests.jsonl keep what was
// received. Outputs in --out: raw/<symbol>-<startTime>.json (bytes as received; a body other than 200 under raw/errors/), requests.jsonl
// (a line per answer as it arrives: its status, headers and the sha256 of the certificates of its connection; then that line again with
// the size, sha256 and file of its body, once read), <symbol>-<interval>.csv (fixed header, decimal strings as received, ascending,
// identical duplicates removed), missing.json (every absent grid slot, never filled), manifest.json, SHA256SUMS (sha256sum -c format).
// Exit 0 written, 1 named stop, 2 usage.
// Close times (lot RECORDER-CLOSE-TIME-1; rules 8 and 8 bis of RECHERCHES ADR 0006, addenda 1 and 4): a candle whose close lies in its
// slot but short of open + interval - 1 ms (a halt truncates it) is a grid candle, kept as received in the CSV and listed in manifest.json
// under irregular_close; a close after its slot or before its open stops the grid (close_out_of_slot); the candles with 0 trades are
// listed under zero_trade; completeness reads missing.json alone. Only the grid stops. A replay runs under the interval of its recording:
// a source with neither manifest.json nor requests.jsonl names none, and one with neither requests.jsonl nor SHA256SUMS attests no page:
// both are refused unread (source_unattested); the source manifest, when there is one, and each request its requests.jsonl logged name
// --interval, and every open read lies on its grid (else interval_mismatch); each page read has the sha256 that the source's requests.jsonl
// logged for its cursor (on the line that completes the answer) and that its raw/ line of SHA256SUMS holds, each file when present (else
// raw_page_altered); a replay writes nothing before every check has passed, and its manifest carries the sha256 of
// the source's requests.jsonl and SHA256SUMS as read (an anchor outside the source). Schema (lot BINANCE-V2-1, Q-U5 of RECHERCHES): every
// manifest written here, recording or replay, is monark.series.binance.v2 with both lists (empty = none); a replay reads its source
// manifest for the interval alone, its schema unread: a sealed v1 (recorders 48aa58b3 and 0a1ae564) has neither list = never computed, and stays v1.
// Test seam: run(argv, io) and main(argv, io) take fetch, sleep, clock, env, execArgv and print from their caller; neither the command
// line nor the environment can set them; the default fetch is read at each request. The agent never commits (R-20).
import { createHash } from "node:crypto";
import { subscribe, unsubscribe } from "node:diagnostics_channel";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ENDPOINT = "https://api.binance.com/api/v3/klines";
export const HOSTS = ["api.binance.com"];
export const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]; // closed list; SOLUSDT: amendment of 2026-10-01
export const INTERVALS = Object.freeze({ "15m": 900_000, "1h": 3_600_000, "4h": 14_400_000 }); // closed list: name -> duration in ms
const MINUTE_MS = 60_000; // a bad_time names the grid in minutes: "not on the 15-minute grid" (15m), "60-minute" (1h), "240-minute" (4h)
export const LIMIT = 1000;
export const PAUSE_MS = 500;
export const MAX_PAGES = 100;
export const TIMEOUT_MS = 30_000;
// D-5 of lot BINANCE-PRE153-1: 1 000 candles of the widest row recorded (186.39 bytes, 4h) take 186 394 bytes; 2^18, a 40 % margin (journal)
export const MAX_BODY_BYTES = 262_144;
export const CSV_COLUMNS = ["open_time_utc", "open_time_ms", "open", "high", "low", "close", "volume", "close_time_ms", "quote_volume",
  "trades", "taker_buy_base_volume", "taker_buy_quote_volume"];
// proxy_refused: a proxy variable (PROXY_ENV) or a node flag, each could reroute a request; env_refused: any other variable outside
// ADMITTED_ENV, which could alter one; both name the variables, never a value (BINANCE-PRE153-1 corrections, D-5)
export const STOPS = ["usage", "bad_symbol", "bad_interval", "bad_time", "end_in_future", "proxy_refused", "tls_unverified", "out_not_empty",
  "out_in_git_tree", "host_refused", "network_error", "rate_limited", "ip_banned", "restricted_location", "server_error", "redirect_refused",
  "http_status", "body_not_json", "body_not_klines", "row_shape", "off_grid", "out_of_range", "close_out_of_slot", "duplicate_conflict",
  "cursor_not_advancing", "too_many_pages", "raw_page_missing", "raw_page_unused", "interval_mismatch", "raw_page_altered",
  "source_unattested", "body_too_large", "env_refused", "tls_unattested"];
const LF = String.fromCharCode(10);
const DECIMAL = /^[0-9]+([.][0-9]+)?$/;
const TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(:00)?Z$/;
const FLAGS = ["--symbol", "--interval", "--start", "--end", "--out", "--from-raw"];
const REQUIRED = ["symbol", "interval", "start", "end", "out"];
// D-4 of lot BINANCE-PRE153-1 (SERIES-ENV-ALLOWLIST-1): the names a recording admits, values never read: the eleven that libuv hands any
// win32 child whatever block it is given (DOJO_CA_CHILD_ENV of scripts/verify-dojo.mjs, measured on Node v24.15.0) and MSYSTEM, which Git
// Bash adds under env -i (docs/RUNBOOK-dojo.md, measured again in the journal); none routes a request, preloads code or touches TLS trust
const ADMITTED_ENV = /^(HOMEDRIVE|HOMEPATH|LOGONSERVER|MSYSTEM|PATH|SYSTEMDRIVE|SYSTEMROOT|TEMP|USERDOMAIN|USERNAME|USERPROFILE|WINDIR)$/i;
// BINANCE-PRE153-1 corrections, D-5 (Q-BNPRE-3): the proxy variables, named as the Coinbase recorder names them (PROXY_NAME)
const PROXY_ENV = /^(NODE_OPTIONS|NODE_USE_ENV_PROXY)$|_PROXY$/i;
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

/** D-3 of lot BINANCE-PRE153-1 (SERIES-TLS-PEER-LOG-1; method of the G2 of RECORDER-CLOSE-TIME-1, PEERCERT.json): each connection of the
 *  default fetch, read once when undici publishes it. A full TLS handshake shows the sha256 of its leaf and issuer certificates (DER);
 *  later the socket shows none, nor does a resumed session (measured, journal M-1, M-2), which stands for the handshake whose ticket it
 *  resumed: the latest session its origin received, as undici's cache keeps it, one per origin's pool (resumed: true); no TLS, or no
 *  such ticket: null. A subscriber that throws would end the process: this one never throws, and a failure, a publication without a
 *  socket among them, writes nothing to PEERS, where its request then reads null (BINANCE-PRE153-1 corrections, D-3; G2-BNPRE-4). */
const PEERS = new WeakMap(), TICKETS = new Map();
const certificates = (socket) => {
  const c = socket.getPeerCertificate?.(true), issuer = c?.issuerCertificate?.raw;
  return c?.raw ? { leaf_sha256: sha256(c.raw), issuer_sha256: issuer ? sha256(issuer) : null, resumed: false } : null;
};
subscribe("undici:client:connected", (message) => {
  try {
    const { connectParams, socket } = message, origin = `${connectParams.protocol}//${connectParams.host}`, ticket = TICKETS.get(origin);
    const peer = certificates(socket) ?? (ticket && socket.isSessionReused?.() === true ? { ...ticket, resumed: true } : null);
    PEERS.set(socket, peer);
    socket.on("session", () => { TICKETS.set(origin, peer); });
  } catch { /* nothing written, nothing thrown */ }
});

/** --start or --end: YYYY-MM-DDTHH:MMZ or YYYY-MM-DDTHH:MM:00Z, a real date (round trip), on the grid of the interval (15m by default). */
export function parseTime(text, interval = "15m") {
  const ms = TIME.test(text) ? Date.parse(text) : Number.NaN, step = INTERVALS[interval];
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
  const symbol = a.get("symbol"), interval = a.get("interval");
  if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { value: symbol, allowed: SYMBOLS });
  if (!Object.hasOwn(INTERVALS, interval)) stop("bad_interval", { value: interval, allowed: Object.keys(INTERVALS) });
  const step = INTERVALS[interval], start = parseTime(a.get("start"), interval), end = parseTime(a.get("end"), interval);
  if (end <= start) stop("bad_time", { why: "--end must come after --start" });
  return { symbol, interval, step, start, end, out: resolve(a.get("out")), fromRaw: a.has("from-raw") ? resolve(a.get("from-raw")) : null };
}

/** Grid slots in [start, end), both on the grid of the interval: from 2024-10-01 to 2026-10-01, 70 080 (15m), 17 520 (1h), 4 380 (4h). */
export const expectedCount = (start, end, interval = "15m") => (end - start) / INTERVALS[interval];

/** No disabled TLS check first (F-1, tls_unverified). Then the environment of a recording is a closed list (D-4 of lot BINANCE-PRE153-1,
 *  SERIES-ENV-ALLOWLIST-1: a list of refused names never proves complete): any variable whose name is not in ADMITTED_ENV, whatever its
 *  value, case ignored, and any node flag in execArgv stop, and with them every name refused before: a proxy route (FAITS F-5), any
 *  NODE_OPTIONS (G2 of COINBASE-USDT-RECORDER-1, F-2), a TLS trust anchor (G2C-1: NODE_USE_SYSTEM_CA, measured set to 1 on this host,
 *  adds a store that holds two interception roots), any OPENSSL_* (G2RR2-5). The code (BINANCE-PRE153-1 corrections, D-5): proxy_refused
 *  when a proxy variable (PROXY_ENV) or a node flag is there, else env_refused; either stop names every variable outside the list and
 *  counts the flags, never a value (a proxy URL may carry a password). */
export function guardEnv(env, execArgv) {
  if (env.NODE_TLS_REJECT_UNAUTHORIZED === "0") stop("tls_unverified", { NODE_TLS_REJECT_UNAUTHORIZED: "0" });
  const names = Object.keys(env).filter((name) => !ADMITTED_ENV.test(name)).sort(), detail = { variables: names, execArgv_length: execArgv.length };
  if (execArgv.length > 0 || names.some((name) => PROXY_ENV.test(name))) stop("proxy_refused", detail);
  if (names.length > 0) stop("env_refused", detail);
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

/** A replay runs under the interval of its recording (G2 F-2, REPLAY-INTERVAL-BIND-1): a source with neither manifest.json nor
 *  requests.jsonl names none (D-1 (b) of lot BINANCE-PRE153-1), and one with neither requests.jsonl nor SHA256SUMS attests no page
 *  (BINANCE-PRE153-1 corrections, D-1; G2-BNPRE-1): both are refused before any of their files is read (source_unattested); the
 *  source manifest, when there is one, names --interval (an unreadable one names none), and so does each request that its requests.jsonl
 *  logged, when there is one (D-1 (a); an unreadable one names none), else interval_mismatch before anything is written; checkRow binds
 *  the opens to the grid. Returns what the source attests of its pages (D-3 of the second round, G2C-4), for rawPage: requests.jsonl and
 *  SHA256SUMS, each when present; an unreadable one attests no page, nor does a SHA256SUMS without raw/ lines, a replay's (closed
 *  reading: Q-CORR2-1, D-1 of the third round); and the sha256 of the very bytes read of each, null when absent (D-1 (d)). */
function guardReplay(args) {
  const path = join(args.fromRaw, "manifest.json"), at = (file) => join(args.fromRaw, file);
  if (!existsSync(at("requests.jsonl")) && (!existsSync(path) || !existsSync(at("SHA256SUMS")))) stop("source_unattested", { from_raw: args.fromRaw });
  let named = args.interval;
  try { if (existsSync(path)) named = JSON.parse(readFileSync(path, "utf8")).interval; } catch { named = undefined; }
  if (named !== args.interval) stop("interval_mismatch", { interval: args.interval, manifest_interval: named ?? null });
  const read = (file) => { try { return readFileSync(at(file)); } catch { return null; } }; // absent, or unreadable (a directory): null
  const log = read("requests.jsonl"), sums = read("SHA256SUMS");
  if (existsSync(at("requests.jsonl"))) {
    let asked;
    try { asked = [...new Set(entries(log.toString("utf8")).map((e) => new URL(e.url).searchParams.get("interval")))]; } catch { asked = []; }
    if (asked.length !== 1 || asked[0] !== args.interval) stop("interval_mismatch", { interval: args.interval, requests_intervals: asked });
  }
  const attest = [["requests.jsonl", log, logged], ["SHA256SUMS", sums, summed]].filter(([file]) => existsSync(at(file)))
    .map(([file, bytes, parse]) => { try { return [file, parse(bytes.toString("utf8"))]; } catch { return [file, new Map()]; } });
  return { attest, anchors: { requests: log === null ? null : sha256(log), sums: sums === null ? null : sha256(sums) } };
}

/** What a file of the source attests: page name -> sha256; a name given twice with two digests attests nothing (null). */
const attested = (pairs) => pairs.reduce((pages, [name, digest]) =>
  pages.set(name, pages.has(name) && pages.get(name) !== digest ? null : digest), new Map());

/** The lines of requests.jsonl, one JSON object each. */
const entries = (text) => text.split(LF).filter((l) => l !== "").map((l) => JSON.parse(l));

/** requests.jsonl: each page received (status 200), under the name the recorder gave it (symbol and startTime of the logged URL), read on
 *  the line that completes its answer, the one with a sha256 (an arrival line attests nothing: BINANCE-PRE153-1 corrections, D-4). */
const logged = (text) => attested(entries(text).filter((e) => e.status === 200 && Object.hasOwn(e, "sha256"))
  .map((e) => { const q = new URL(e.url).searchParams; return [`${q.get("symbol")}-${q.get("startTime")}.json`, e.sha256]; }));

/** SHA256SUMS (sha256sum -c format): each raw/ line. */
const summed = (text) => attested([...text.matchAll(/^([0-9a-f]{64}) {2}raw\/(.+)$/gm)].map((m) => [m[2], m[1]]));

/** One request (D-2, D-3 and D-5 of lot BINANCE-PRE153-1; BINANCE-PRE153-1 corrections, D-4 and D-6): every answer is logged as it
 *  arrives, before its body is read (as the Coinbase recorder), with its status, headers and the certificates of the connection that sent
 *  the request (tls: undici's sendHeaders binds the request to it by path, so that a fetch rewritten to the loopback, the test seam, binds
 *  too); a 200 whose connection showed none (tls: null) then stops, its body never read (tls_unattested); else the body is read in a stream
 *  up to MAX_BODY_BYTES and the line logged again with its size, sha256 and file (beyond the bound: the count read, nothing kept,
 *  body_too_large); a body cut leaves its arrival line alone (network_error); the body is kept before it is parsed, under raw/ for a 200
 *  and raw/errors/ else (SERIES-ERROR-BODY-1, as the Coinbase recorder); any status but 200 stops, without retry. */
async function livePage(ctx, cursor) {
  const url = `${ENDPOINT}?symbol=${ctx.symbol}&interval=${ctx.interval}&startTime=${cursor}&endTime=${ctx.end - 1}&limit=${LIMIT}`;
  const u = new URL(url), path = u.pathname + u.search;
  if (u.protocol !== "https:" || !HOSTS.includes(u.host)) stop("host_refused", { url });
  const at = new Date(ctx.now()).toISOString(), name = `${ctx.symbol}-${cursor}.json`;
  const failed = (e) => stop("network_error", { url, message: String(e?.cause?.message ?? e?.message ?? e) });
  const log = (entry) => { appendFileSync(join(ctx.out, "requests.jsonl"), JSON.stringify(entry) + LF); };
  let res, body, peer = null;
  const bind = ({ request, socket }) => { if (request.path === path) peer = PEERS.get(socket) ?? null; };
  subscribe("undici:client:sendHeaders", bind);
  try {
    res = await ctx.fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    failed(e);
  } finally {
    unsubscribe("undici:client:sendHeaders", bind);
  }
  const header = (h) => res.headers.get(h);
  const status = res.status, retryAfter = header("retry-after");
  const line = { url, status, at, tls: peer,
    headers: { date: header("date"), "x-mbx-used-weight-1m": header("x-mbx-used-weight-1m"), "retry-after": retryAfter } };
  log(line);
  if (status === 200 && peer === null) { res.body?.cancel().catch(() => undefined); stop("tls_unattested", { url, status }); }
  try { body = await bounded(res.body); } catch (e) { failed(e); }
  const file = body.bytes === null ? null : `raw/${status === 200 ? "" : "errors/"}${name}`;
  log({ ...line, bytes: body.size, sha256: body.bytes === null ? null : sha256(body.bytes), file });
  if (file === null) stop("body_too_large", { url, status, bytes: body.size, max_bytes: MAX_BODY_BYTES });
  if (status !== 200) mkdirSync(join(ctx.out, "raw", "errors"), { recursive: true });
  writeFileSync(join(ctx.out, file), body.bytes);
  if (status === 429 || status === 418) stop(status === 429 ? "rate_limited" : "ip_banned", { url, status, retry_after: retryAfter });
  if (status === 451) stop("restricted_location", { url, status });
  if (status >= 500) stop("server_error", { url, status });
  if (status >= 300 && status < 400) stop("redirect_refused", { url, status, location: header("location") });
  if (status !== 200) stop("http_status", { url, status });
  return body.bytes;
}

/** A body read in a stream (D-5, SERIES-BODY-BOUND-1): its size and bytes; once past MAX_BODY_BYTES, its size so far and no bytes (leaving
 *  the loop cancels the stream: nothing more is read). */
async function bounded(stream) {
  const chunks = [];
  let size = 0;
  for await (const chunk of stream ?? []) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) return { size, bytes: null };
    chunks.push(chunk);
  }
  return { size, bytes: Buffer.concat(chunks) };
}

/** The replay reads the page that the same cursor fetched, raw/<symbol>-<cursor>.json, and nothing else; each file of the source that
 *  attests its pages (guardReplay) holds the sha256 of these very bytes, else raw_page_altered (D-3 of the second round, G2C-4). */
function rawPage(ctx, cursor) {
  const name = `${ctx.symbol}-${cursor}.json`, path = join(ctx.fromRaw, "raw", name);
  if (!existsSync(path)) stop("raw_page_missing", { page: path });
  ctx.used.add(name);
  const body = readFileSync(path), got = sha256(body);
  for (const [file, pages] of ctx.attest) {
    if (pages.get(name) !== got) stop("raw_page_altered", { page: path, sha256: got, attested_by: file, attested: pages.get(name) ?? null });
  }
  return body;
}

/** H-1 (journal, section 5): 12 fields; [0] [6] [8] integers; [1]-[5] [7] [9] [10] decimal strings; [11] a string. Then grid, range and
 *  slot: an open off the grid stops a recording (off_grid) and names another interval in a replay (interval_mismatch); a close after its
 *  slot or before its open stops (close_out_of_slot); a close in its slot is never a stop (rule 8): listed() names the truncated ones. */
function checkRow(k, ctx) {
  const shaped = Array.isArray(k) && k.length === 12 && [0, 6, 8].every((i) => Number.isSafeInteger(k[i]) && k[i] >= 0)
    && [1, 2, 3, 4, 5, 7, 9, 10].every((i) => typeof k[i] === "string" && DECIMAL.test(k[i])) && typeof k[11] === "string";
  if (!shaped) stop("row_shape", { row: k });
  if (k[0] % ctx.step !== 0) stop(ctx.live ? "off_grid" : "interval_mismatch", { open_time_ms: k[0] });
  if (k[0] < ctx.start || k[0] >= ctx.end) stop("out_of_range", { open_time_ms: k[0] });
  if (k[6] < k[0] || k[6] > k[0] + ctx.step - 1) stop("close_out_of_slot", { open_time_ms: k[0], close_time_ms: k[6] });
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
    const next = list[list.length - 1][0] + ctx.step;
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
  for (let t = ctx.start; t < ctx.end; t += ctx.step) if (!rows.has(t)) missing.push({ open_time_ms: t, open_time_utc: isoOf(t) });
  return { csv: [CSV_COLUMNS.join(","), ...lines].join(LF) + LF, times, missing };
}

/** Rules 8 and 8 bis, read from the kept rows in ascending open time: irregular_close holds each candle whose close is not open + step
 *  - 1 ms (a truncation: checkRow stopped any close out of its slot), with its close as received (never repaired); zero_trade holds the
 *  open time of each candle with 0 trades, a truncated one included; a truncated candle with trades ends that run (rule 8 bis). */
function listed(ctx, rows, times) {
  const kept = times.map((t) => rows.get(t));
  return { irregular: kept.filter((k) => k[6] !== k[0] + ctx.step - 1).map((k) => ({ open_time_ms: k[0], close_time_ms: k[6] })),
    zeroTrade: kept.filter((k) => k[8] === 0).map((k) => k[0]) };
}

/** The normalized outputs, written once every check has passed; SHA256SUMS covers every file of --out. */
function writeOutputs(ctx, got, norm, startedAt) {
  const csvName = `${ctx.symbol}-${ctx.interval}.csv`, first = norm.times[0], last = norm.times.at(-1);
  const lists = listed(ctx, got.rows, norm.times);
  const missingDoc = { symbol: ctx.symbol, interval: ctx.interval, start: isoOf(ctx.start), end_exclusive: isoOf(ctx.end),
    count: norm.missing.length, missing: norm.missing };
  const manifest = { schema: "monark.series.binance.v2", mode: ctx.live ? "record" : "replay", platform: "binance", endpoint: ENDPOINT,
    symbol: ctx.symbol, interval: ctx.interval, start: isoOf(ctx.start), end_exclusive: isoOf(ctx.end),
    expected: expectedCount(ctx.start, ctx.end, ctx.interval),
    rows: norm.times.length, missing: norm.missing.length, duplicates_removed: got.duplicates, pages: got.pages,
    first_open_time: first === undefined ? null : isoOf(first), last_open_time: last === undefined ? null : isoOf(last),
    csv: csvName, csv_sha256: sha256(norm.csv), script_sha256: sha256(readFileSync(SCRIPT)), node: process.version,
    from_raw: ctx.fromRaw, from_raw_requests_sha256: ctx.anchors.requests, from_raw_sha256sums_sha256: ctx.anchors.sums,
    started_at: startedAt, finished_at: new Date(ctx.now()).toISOString(),
    redistributable: false, terms: "docs/marche/FAITS-conditions-series-2026-10-01.md",
    irregular_close: lists.irregular, zero_trade: lists.zeroTrade };
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
  const source = live ? { attest: [], anchors: { requests: null, sums: null } } : guardReplay(args);
  guardOut(args.out);
  const ctx = { ...args, live, now, used: new Set(), ...source, fetch: io.fetch ?? ((url, init) => globalThis.fetch(url, init)),
    sleep: io.sleep ?? ((ms) => new Promise((done) => { setTimeout(done, ms); })) };
  const startedAt = new Date(now()).toISOString();
  if (live) mkdirSync(join(args.out, "raw"), { recursive: true }); // a replay creates --out once every check has passed
  const got = await collect(ctx, live ? livePage : rawPage);
  if (!live) {
    const unused = readdirSync(join(args.fromRaw, "raw")).filter((n) => n !== "errors" && !ctx.used.has(n)).sort(); // raw/errors/: no page
    if (unused.length > 0) stop("raw_page_unused", { files: unused });
    mkdirSync(args.out, { recursive: true });
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

/** The command line runs when node starts this very file, through a junction or a link too: real paths compared (D-5 of the second round;
 *  F-4 of the G2 of the history detector: through a junction, resolved paths differ and nothing ran, exit 0); an import runs nothing,
 *  nor does a node whose argv[1] is absent or names no file (realpathSync throws). */
const started = (argv1) => { try { return realpathSync(argv1) === realpathSync(SCRIPT); } catch { return false; } };
if (started(process.argv[1])) process.exitCode = await main(process.argv.slice(2));
