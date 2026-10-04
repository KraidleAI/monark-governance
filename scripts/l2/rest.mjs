// scripts/l2/rest.mjs -- lot P1-b1 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md, sections 3 points 4 and 9 to 14, 4.3, 8.2; lot
// plan docs/G0-lot-l2-p1-b1.md): the REST side of the L2 recorder, three reads of the spot place: the depth snapshot (limit 5000,
// weight 250), exchangeInfo of one symbol (weight 20) and the place time (weight 1). Node 24, zero dependencies. Discipline of
// scripts/record-binance-klines.mjs: one hard-coded origin whose host is checked against a closed list before each request; redirects
// refused (any 3xx stops); no header set; no retry, ever; a 30 s timeout; every answer logged to requests.jsonl; the body is read under
// a bound of 8 MiB (SERIES-BODY-BOUND-1) and kept as received before it is parsed: a 200 under rest/<SYMBOL>/, any other status under
// rest/errors/ (SERIES-ERROR-BODY-1). 429 and 418 suspend every request until Retry-After (seconds; a 429 without one: 60 s); a 418
// without one, a Retry-After above 3 days and a 451 (refused region) stop every later request of this client. exchangeInfo gives the price scale (rank of the last non-zero
// decimal of PRICE_FILTER tickSize) and the rateLimits table; the place time gives the clock offset in microseconds, logged to
// journal.jsonl (condition (2) of RECHERCHES: serverTime a safe integer, else no offset, named). TLS peer (SERIES-TLS-PEER-LOG-1): the
// fingerprint of the place certificate is read from the socket that the diagnostics channel undici:client:connected publishes while
// a request runs (Node's undici, plan L-1); neither connectParams nor any address of the socket is read; the
// requests of a client are chained, and a window that sees more than one connection names it and logs no fingerprint. A stop carries
// an error code or name, never an error message (no address).
// Test seam: createRest(io) takes fetch, the wall clock in microseconds and the output directory from its caller.
import { createHash } from "node:crypto";
import { subscribe, unsubscribe } from "node:diagnostics_channel";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const ORIGIN = "https://api.binance.com"; // REST spot, docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md l.18
export const HOSTS = ["api.binance.com"];
export const KINDS = Object.freeze({ depth: { path: "/api/v3/depth", weight: 250 }, exchangeInfo: { path: "/api/v3/exchangeInfo", weight: 20 },
  time: { path: "/api/v3/time", weight: 1 } }); // plan section 3 point 9
export const DEPTH_LIMIT = 5000;
export const TIMEOUT_MS = 30_000;
export const BODY_MAX = 8 * 1024 * 1024;
export const RETRY_AFTER_DEFAULT_S = 60; // a 429 without a readable Retry-After (D24-2); a 418 without one stops (G2 of b1)
export const RETRY_AFTER_MAX_S = 3 * 86_400; // above it: a named stop, never a silent wait
export const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]; // closed list, plan section 3 point 1
export const STOPS = ["bad_symbol", "host_refused", "network_error", "disk_error", "body_too_large", "redirect_refused", "rate_limited",
  "ip_banned", "ip_banned_no_retry_after", "retry_after_too_long", "restricted_location", "http_status", "suspended", "stopped",
  "body_not_json", "exchange_info_shape"];
const CONNECTED = "undici:client:connected";
const LF = String.fromCharCode(10);
const DECIMAL = /^[0-9]+([.][0-9]+)?$/;

/** A named stop: `code` is one of STOPS, `detail` what was seen (URL, status, Retry-After), never an address. */
export class RestStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "RestStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new RestStop(code, detail); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
/** The hour of a request in file names, to the microsecond: AAAAMMJJTHHMMSSmmmuuuZ (the connection ids of plan section 7, plus us). */
const stamp = (us) => `${new Date(Math.floor(us / 1000)).toISOString().replace(/[-:.]/g, "").slice(0, -1)}${String(us % 1000).padStart(3, "0")}Z`;

/** host_refused unless `url` is https on a host of the closed list (checked before every request). */
export function guardUrl(url) {
  let u;
  try { u = new URL(url); } catch { stop("host_refused", { url }); }
  if (u.protocol !== "https:" || !HOSTS.includes(u.host)) stop("host_refused", { url });
  return url;
}

/** The URL of one read: `symbol` is one of SYMBOLS for depth and exchangeInfo, null for the place time, else bad_symbol (checked
 *  before the URL is built: no path or query can be injected). */
export function urlOf(kind, symbol) {
  if (!Object.hasOwn(KINDS, kind) || (kind === "time" ? symbol !== null : !SYMBOLS.includes(symbol))) stop("bad_symbol", { kind, symbol });
  const query = kind === "depth" ? `?symbol=${symbol}&limit=${String(DEPTH_LIMIT)}` : kind === "exchangeInfo" ? `?symbol=${symbol}` : "";
  return `${ORIGIN}${KINDS[kind].path}${query}`;
}

/** The bytes of a body under BODY_MAX (over: the bound passed, the rest never read); `seen.n` counts what was read, for a failed read. */
async function boundedBody(res, seen) {
  const chunks = [];
  for await (const chunk of res.body ?? []) {
    seen.n += chunk.length;
    if (seen.n > BODY_MAX) return { over: true, bytes: seen.n };
    chunks.push(chunk);
  }
  return { over: false, body: Buffer.concat(chunks, seen.n) };
}

/** The code or name of a failure, never its message (a message can carry an address and a port). */
const errorName = (e) => String(e?.cause?.code ?? e?.code ?? e?.name ?? "unknown");

/** The REST client of one recorder: io = { fetch, nowUs, out }. request(kind, symbol) resolves to { body, kept, sentUs, receivedUs } on
 *  a 200; the requests of one client are chained (one at a time), so the TLS window of a request holds only its own connection. */
export function createRest(io) {
  const state = { suspendedUntilUs: 0, stopped: false, peer: null, events: 0, window: false };
  const onConnected = (msg) => {
    const socket = msg?.socket;
    if (!state.window || typeof socket?.getPeerCertificate !== "function") return;
    state.events += 1;
    const cert = socket.getPeerCertificate();
    state.peer = typeof cert?.fingerprint256 === "string" ? cert.fingerprint256 : null;
  };
  subscribe(CONNECTED, onConnected);
  const disk = (fn) => { try { return fn(); } catch (e) { return stop("disk_error", { error: errorName(e) }); } };
  const keep = (dir, name, body) => disk(() => {
    mkdirSync(join(io.out, dir), { recursive: true });
    writeFileSync(join(io.out, dir, name), body, { flag: "wx" });
    return `${dir}/${name}`;
  });
  const halt = (code, detail) => { state.stopped = true; stop(code, detail); };
  async function once(kind, symbol) {
    if (state.stopped) stop("stopped", { kind, symbol });
    const url = guardUrl(urlOf(kind, symbol)), sentUs = io.nowUs();
    if (sentUs < state.suspendedUntilUs) stop("suspended", { kind, symbol, until_us: state.suspendedUntilUs });
    let res, got, failed = null;
    const seen = { n: 0 };
    Object.assign(state, { peer: null, events: 0, window: true });
    try {
      res = await io.fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      stop("network_error", { url, error: errorName(e) });
    } finally {
      state.window = false;
    }
    try { got = await boundedBody(res, seen); } catch (e) { failed = errorName(e); got = { over: true, bytes: seen.n }; }
    const receivedUs = io.nowUs(), header = (name) => res.headers.get(name), status = res.status;
    const name = `${symbol ?? "ALL"}-${kind}-${stamp(sentUs)}${status === 200 ? "" : `-${String(status)}`}.json`;
    const kept = got.over ? null : status === 200 ? keep(join("rest", symbol ?? "ALL"), name, got.body) : keep(join("rest", "errors"), name, got.body);
    const line = { kind, symbol, url, weight: KINDS[kind].weight, status, sent_us: sentUs, received_us: receivedUs,
      bytes: got.over ? got.bytes : got.body.length, sha256: got.over ? null : sha256(got.body), kept,
      tls_peer_sha256: state.events > 1 ? null : state.peer, tls_peer_note: state.events > 1 ? "several_connections" : null,
      headers: { date: header("date"), "x-mbx-used-weight-1m": header("x-mbx-used-weight-1m"), "retry-after": header("retry-after") } };
    disk(() => { appendFileSync(join(io.out, "requests.jsonl"), JSON.stringify(line) + LF); });
    if (failed !== null) stop("network_error", { url, status, error: failed, bytes_read: seen.n });
    if (got.over) stop("body_too_large", { url, status, bytes_read: got.bytes, max: BODY_MAX });
    if (status === 429 || status === 418) {
      const ra = header("retry-after"), readable = /^[0-9]+$/.test(ra ?? ""), s = readable ? Number(ra) : RETRY_AFTER_DEFAULT_S;
      if (status === 418 && !readable) halt("ip_banned_no_retry_after", { url, status });
      if (s > RETRY_AFTER_MAX_S) halt("retry_after_too_long", { url, status, retry_after: ra });
      state.suspendedUntilUs = receivedUs + s * 1_000_000;
      stop(status === 429 ? "rate_limited" : "ip_banned", { url, status, retry_after: ra, until_us: state.suspendedUntilUs });
    }
    if (status === 451) halt("restricted_location", { url, status });
    if (status >= 300 && status < 400) stop("redirect_refused", { url, status });
    if (status !== 200) stop("http_status", { url, status });
    return { body: got.body, kept, sentUs, receivedUs };
  }
  let chain = Promise.resolve();
  const request = (kind, symbol) => {
    const run = chain.then(() => once(kind, symbol));
    chain = run.catch(() => undefined);
    return run;
  };
  const close = () => { unsubscribe(CONNECTED, onConnected); };
  return { request, close, get stopped() { return state.stopped; }, get suspendedUntilUs() { return state.suspendedUntilUs; } };
}

const json = (body, code) => { try { return JSON.parse(body.toString("utf8")); } catch { return stop(code, { bytes: body.length }); } };

/** exchangeInfo of one symbol: tickSize of PRICE_FILTER (decimal string, kept), its scale s (rank of the last non-zero decimal), the
 *  rateLimits table as received and the REQUEST_WEIGHT limit per minute; any other shape stops (exchange_info_shape). */
export function exchangeInfoFacts(body) {
  const doc = json(body, "body_not_json");
  const filters = doc?.symbols?.length === 1 ? doc.symbols[0].filters : undefined;
  const tick = Array.isArray(filters) ? filters.find((f) => f?.filterType === "PRICE_FILTER")?.tickSize : undefined;
  if (typeof tick !== "string" || !DECIMAL.test(tick) || !/[1-9]/.test(tick)) stop("exchange_info_shape", { field: "PRICE_FILTER.tickSize" });
  const decimals = tick.split(".")[1] ?? "", scale = decimals.replace(/0+$/, "").length;
  const limits = doc.rateLimits;
  const weight = Array.isArray(limits) ? limits.find((r) => r?.rateLimitType === "REQUEST_WEIGHT" && r.interval === "MINUTE" && r.intervalNum === 1)
    : undefined;
  if (!Number.isSafeInteger(weight?.limit)) stop("exchange_info_shape", { field: "rateLimits.REQUEST_WEIGHT" });
  return { tickSize: tick, scale, rateLimits: limits, requestWeightPerMinute: weight.limit };
}

/** The clock offset from a place time read: serverTime (ms) x 1000 minus the midpoint of the local send and receive times (us), floored;
 *  null, named, when serverTime is not a safe integer (condition (2) of RECHERCHES). One line in journal.jsonl either way. */
export function logTimeOffset(out, body, sentUs, receivedUs) {
  const serverTime = json(body, "body_not_json")?.serverTime;
  const safe = Number.isSafeInteger(serverTime);
  const entry = { event: "clock_offset", sent_us: sentUs, received_us: receivedUs, server_time_ms: safe ? serverTime : null,
    offset_us: safe ? serverTime * 1000 - Math.floor((sentUs + receivedUs) / 2) : null, reason: safe ? null : "server_time_not_safe_integer" };
  appendFileSync(join(out, "journal.jsonl"), JSON.stringify(entry) + LF);
  return entry;
}
