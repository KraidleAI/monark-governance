// scripts/l2/links.mjs -- the links of the L2 recorder (lots P1-a3 and P1-a4, 2026-10-04): ADR-L2-CAPTURE-1 D-8, D-19, D-21, section 2.3;
// plan docs/G0-partie-l2-p1.md section 3 points 1 to 8, D24-1, D24-4; decisions Q-P1-3 and Q-P1-5; lot plan docs/G0-lot-l2-p1-a4.md. Node
// 24, zero dependencies. "undici l.N" is line N of the client source embedded in Node v24.15.0 (undici 7.24.4, sha256 d6332aa1ca04f71f...),
// as in the plan's L-1. A link is the run of connections of one kind: spot, one symbol on the combined URL of spotUrl() (three streams,
// place times in microseconds), or market, the four @forceOrder of marketUrl() (no timeUnit: FAITS-L2-ACCESS-3 (e) not established).
// openLink() refuses, before the factory is called and before anything is written, a URL off the origin and route of its kind, a "%" in its
// path, a timeUnit on /market (host_refused), and opens the URL checked; each text message, as the embedded client delivers it and unread,
// goes to the segment writer of its connection (scripts/l2/segments.mjs, one <cid> each); the client alone writes the PONGs (undici
// l.14979-14984), the link sends nothing but a CLOSE (D-19). Journal <out>/journal.jsonl, one line per event as it happens: host_us and
// mono_ns (host clocks), symbol, cid, event (open, ping, close, writer_stop, retry, defer, renew, renew_deferred, overlap_break), its
// fields; a string that PLAIN refuses is written null: no address (IPv4, IPv6, host:port); no socket address is read, the open channel
// (undici l.15394) never subscribed. Pings are read on undici:websocket:ping, which names their client (undici l.15156). Watchdog (D24-1):
// no message nor ping for WATCHDOG_K ping intervals of the kind closes the connection, named. A writer stop (queue_overflow past 8 MiB,
// write_failed, clock_invalid) is journaled as writer_stop and closes a live connection, named. After a close of the connection followed,
// once its writer is closed, a new one after 1, 2, 4... s, capped at RETRY_CAP_MS, back to 1 s after one that delivered text; the process
// gate admits OPENS_MAX openings per OPENS_WINDOW_MS, sliding, and defers the others, named. Planned renewal (points 6, 7; D-8): at
// RENEW_AGE_MS + rank x RENEW_STAGGER_MS of age, or at once on serverShutdown (read after the writer has the frame), a new connection
// opens; the old one closes (renewed) once the new one has been open OVERLAP_MS and the book has switched to it (switched(cid) of that
// <cid>, from c5; /market feeds no book), else stays open until the place cuts it, then a named overlap_break: no failover, never reopened.
// One overlap at a time, a renewal asked during one waits (renew_deferred) for its end. Test seam: factory, clocks, timers, gate, file
// opener and onText (each message's hook, P1-c5-bis-a) come from the caller, never from the command line nor the environment. cut() and closed() serve the loop. The agent never commits (R-20).
import { subscribe } from "node:diagnostics_channel";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { cidOf, openWriter } from "./segments.mjs";

export const SPOT_ORIGIN = "wss://stream.binance.com:9443"; // Q-P1-3: the general base, its port written (FAITS-L2-ACCESS-3 (a))
export const ORIGINS = Object.freeze([SPOT_ORIGIN, "wss://fstream.binance.com"]); // closed list, one per line of FAITS (point 4; (b) for a4)
export const SYMBOLS = Object.freeze(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]); // closed list (point 1)
export const STREAMS = Object.freeze(["depth@100ms", "bookTicker", "trade"]); // in this order, the symbol in lower case (point 2)
export const TIME_UNIT = "MICROSECOND"; // point 3: a URL parameter of the spot streams (FAITS-L2-ACCESS-2 (c))
export const PING_MS = 20_000; // point 5: the place pings a spot connection every 20 s (FAITS-L2-ACCESS-1 l.17)
export const WATCHDOG_K = 3; // D24-1: k ping intervals without a message nor a ping, 60 s in spot
export const RETRY_FIRST_MS = 1_000; // point 8: unplanned reopenings after 1, 2, 4... s,
export const RETRY_CAP_MS = 60_000; // capped at 60 s,
export const OPENS_MAX = 30; // and at most 30 openings per 5 sliding minutes for the process, a tenth of the limit read
export const OPENS_WINDOW_MS = 300_000; // (FAITS-L2-ACCESS-1 l.19-20)
export const STOPS = Object.freeze(["bad_kind", "bad_symbol", "host_refused"]); // named stops, thrown before anything is opened or written
const LF = String.fromCharCode(10), PLAIN = /^[-A-Za-z0-9_@/;=, ]*$/; // no dot, no colon: neither an IPv4, an IPv6 nor a host:port
export const MARKET_ORIGIN = ORIGINS[1]; // the futures base, its routes /public, /market, /private (FAITS-L2-ACCESS-3 (b))
export const MARKET_STREAM = "forceOrder"; // the liquidations of the four perpetuals, on /market (FAITS-L2-ACCESS-2 l.62-67)
export const FUTURES_PING_MS = 180_000; // point 5: the place pings a futures connection every 3 minutes (FAITS-L2-ACCESS-1 l.47)
export const RENEW_AGE_MS = 82_800_000; // point 6: a planned renewal at 23 h of age,
export const RENEW_STAGGER_MS = 300_000; // plus 5 min x rank (symbols in list order, then /market): at most 23 h 20 min, before 24 h
export const OVERLAP_MS = 60_000; // point 7: both connections open 60 s at least (three spot pings) before the old one closes
const KINDS = Object.freeze({ spot: { ping: PING_MS, route: `${SPOT_ORIGIN}/` }, market: { ping: FUTURES_PING_MS, route: `${MARKET_ORIGIN}/market/` } });
const SHUTDOWN = "serverShutdown";

/** A named stop: `code` is one of STOPS, `detail` what was refused. */
export class LinkStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "LinkStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new LinkStop(code, detail); };

/** The combined URL of the three spot streams of a symbol, the place times in microseconds (FAITS-L2-ACCESS-2 (c), FAITS-L2-ACCESS-3 (a)). */
export function spotUrl(symbol) {
  if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { symbol });
  const s = symbol.toLowerCase();
  return `${SPOT_ORIGIN}/stream?streams=${STREAMS.map((n) => `${s}@${n}`).join("/")}&timeUnit=${TIME_UNIT}`;
}

/** The combined URL of the @forceOrder streams of the four symbols on /market (FAITS-L2-ACCESS-3 (b)), names in lower case as in spot;
 *  no timeUnit: (e) is not established (plan section 3 point 3), the times of /market stay in the unit the place sends. */
export function marketUrl() {
  return `${MARKET_ORIGIN}/market/stream?streams=${SYMBOLS.map((s) => `${s.toLowerCase()}@${MARKET_STREAM}`).join("/")}`;
}

/** The parsed URL iff its normalized form begins with the route of its kind and its path holds no "%" (an encoded slash, backslash or
 *  dot is never a segment the parser sees), else null: another scheme, host, port or route, or a user part, is refused. */
const admitted = (url, route) => {
  try { const u = new URL(url); return u.href.startsWith(route) && !u.pathname.includes("%") ? u : null; } catch { return null; }
};
/** True iff a text message is the serverShutdown event, combined or raw (FAITS-L2-ACCESS-3 (c)); the word alone is not enough. */
const isShutdown = (text) => {
  if (!text.includes(SHUTDOWN)) return false;
  try { const m = JSON.parse(text); return (m?.data ?? m)?.e === SHUTDOWN; } catch { return false; }
};

/** The opening gate of the process (point 8): take(now), now in ms of a monotonic clock, records an opening and returns 0, or, with
 *  OPENS_MAX openings in the last OPENS_WINDOW_MS, records none and returns the wait until the oldest one leaves the window. */
export function openingGate() {
  const at = [];
  return {
    take(now) {
      while (at.length > 0 && now - at[0] >= OPENS_WINDOW_MS) at.shift();
      if (at.length >= OPENS_MAX) return at[0] + OPENS_WINDOW_MS - now;
      at.push(now);
      return 0;
    },
  };
}

const PINGS = new WeakMap(); // client -> the ping handler of its connection: the channel publishes the pings of every client
subscribe("undici:websocket:ping", ({ payload, websocket }) => { PINGS.get(websocket)?.(payload); });

/** A link (header): spec { symbol, url, out, kind }, io { webSocket, wallUs, monoNs, setTimer, clearTimer, gate, open }; stop() ends it,
 *  switched(cid) says that the book follows the new connection <cid> of an overlap. */
export function openLink({ symbol, url, out, kind = "spot" }, io) {
  if (!Object.hasOwn(KINDS, kind)) stop("bad_kind", { kind });
  if (kind === "spot" ? !SYMBOLS.includes(symbol) : symbol !== "ALL") stop("bad_symbol", { symbol });
  const u = admitted(url, KINDS[kind].route), href = u?.href; // the factory opens the URL checked here, never the string given
  if (u === null || (kind === "market" && u.searchParams.has("timeUnit"))) stop("host_refused", { url }); // (e): no timeUnit on /market
  mkdirSync(out, { recursive: true });
  const journal = join(out, "journal.jsonl"), query = u.searchParams, closing = new Set(), live = new Map(); // live: <cid> -> its writer until closed
  const streams = query.get("streams"), timeUnit = query.get("timeUnit"), ping = KINDS[kind].ping;
  const age = RENEW_AGE_MS + (kind === "spot" ? SYMBOLS.indexOf(symbol) : SYMBOLS.length) * RENEW_STAGGER_MS;
  let cur = null, old = null, switchedTo = null, timer = null, failures = 0, stopped = false;
  const note = (cid, event, fields = {}) => {
    const line = { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol, cid, event, ...fields };
    appendFileSync(journal, JSON.stringify(line, (_, v) => (typeof v === "string" && !PLAIN.test(v) ? null : v)) + LF);
  };
  const arm = (c) => { io.clearTimer(c.dog); c.dog = io.setTimer(() => { end(c, "watchdog"); }, WATCHDOG_K * ping); };
  const moved = () => kind === "market" || (cur !== null && switchedTo === cur.cid); // /market feeds no book: nothing to wait for
  const retire = () => { if (old !== null && cur?.lapped === true && moved()) end(old, "renewed"); };
  function renew(c, cause) { // a planned renewal of the connection followed: a new one opens, the old one stays until retire()
    if (!c.live || c !== cur || stopped) return;
    if (old !== null) { // one overlap at a time: this one waits for the end of the current one, named once
      if (c.due === undefined) note(c.cid, "renew_deferred", { cause });
      c.due ??= cause;
      return;
    }
    note(c.cid, "renew", { cause }); // its age timer stays: renew() of a connection no longer followed does nothing
    [old, cur, switchedTo, c.due] = [c, null, null, undefined]; // the switch is bound to the new connection's <cid>
    connect();
  }
  function end(c, cause, detail = {}) { // once per connection: the named close, its writer closed, then a new connection if followed
    if (!c.live) return;
    c.live = false;
    for (const t of [c.dog, c.age, c.lap]) io.clearTimer(t);
    PINGS.delete(c.ws);
    if (cause !== "closed") c.ws.close(1000); // the link's own close: one CLOSE frame, its answer never awaited (a dead link has none)
    note(c.cid, "close", { cause, ...detail });
    if (c === old) { // no failover: the old one is never reopened; closed before the switch, a named break
      old = null;
      if (!moved() && !stopped) note(c.cid, "overlap_break", { to: cur?.lapped === undefined ? null : cur.cid });
      if (cur?.due !== undefined) renew(cur, cur.due);
    }
    const followed = c === cur;
    if (followed) failures = c.got ? 1 : failures + 1; // one connection followed at a time: nothing else changes it before the reopening
    const done = c.w.close().then(() => { // no new connection while this writer still holds frames (a stalled disk waits here)
      closing.delete(done); live.delete(c.cid);
      if (stopped || !followed) return;
      const delay = Math.min(RETRY_FIRST_MS * 2 ** (failures - 1), RETRY_CAP_MS);
      note(c.cid, "retry", { delay_ms: delay });
      timer = io.setTimer(connect, delay);
    });
    closing.add(done);
  }
  function connect() {
    timer = null;
    const wait = io.gate.take(Number(io.monoNs() / 1_000_000n));
    if (wait > 0) {
      note(null, "defer", { wait_ms: wait });
      timer = io.setTimer(connect, wait);
      return;
    }
    const cid = cidOf(kind, symbol, io.wallUs()), c = { cid, ws: null, w: null, got: false, live: true, dog: null, age: null, lap: null };
    const onStop = (s) => { // the first stop of the writer (segments l.52-55), named even once its connection is closed
      note(cid, "writer_stop", { cause: s.code, ...s.detail });
      end(c, s.code); // a live connection closes on it, named
    };
    live.set(cid, c.w = openWriter(out, cid, { wallUs: io.wallUs, monoNs: io.monoNs, open: io.open, onStop }));
    c.ws = io.webSocket(href);
    c.ws.binaryType = "arraybuffer";
    c.ws.onopen = () => {
      if (!c.live) return;
      note(cid, "open", { streams, time_unit: timeUnit, extensions: c.ws.extensions });
      c.lapped = false; // open: an overlap counts from here
      if (old !== null) c.lap = io.setTimer(() => { c.lapped = true; retire(); }, OVERLAP_MS);
    };
    c.ws.onmessage = (e) => {
      if (!c.live) return;
      arm(c);
      if (typeof e.data !== "string") return end(c, "binary_message"); // a text frame is all the place sends (D-7): never written
      c.got = true;
      c.w.push(e.data); fed(io, note, e.data, c); // the message as the client delivers it, unread (D-7, Q-P1-5); then the loop's hook (Q-A4-3)
      if (isShutdown(e.data)) renew(c, "server_shutdown"); // read after the writer has it
    };
    c.ws.onclose = (e) => { end(c, "closed", { code: e.code, reason: e.reason, clean: e.wasClean }); };
    PINGS.set(c.ws, (payload) => { if (c.live) { arm(c); note(cid, "ping", { bytes: payload.length }); } });
    arm(c);
    c.age = io.setTimer(() => { renew(c, "age"); }, age);
    cur = c;
  }
  connect();
  return {
    switched(cid) {
      if (stopped || old === null || cur?.lapped === undefined || !cur.live || cid !== cur.cid) return false;
      switchedTo = cid; // bound to this connection: if it dies, a later new one waits for its own switch
      retire();
      return true;
    },
    async stop() {
      stopped = true;
      io.clearTimer(timer);
      for (const c of [cur, old]) if (c !== null) end(c, "stopped");
      await Promise.all(closing);
    },
    cut() { for (const w of live.values()) w.cut(); }, // P1-c5-bis-a: the loop cuts each writer on the hour (D24-3)
    closed: (cid, seg) => !live.has(cid) || live.get(cid).closed.includes(seg), // Q-C1-5: a segment no writer of this link holds open
  };
}

/** The loop's hook fed one message of connection c (Q-A4-3): a throw is caught, named hook_failed, never left to the socket's dispatch (an uncaughtException ends the recorder: m-4 of
 *  the G2 of c5-bis-a), the next one fed; one line at the 1st, 10th, 100th... throw of c, its count (r-4 of its G2 delta), its name read in a try, 64 characters at most (n-10). */
function fed(io, note, text, c) {
  try { io.onText?.(text, c.cid); } catch (x) { c.hooks = (c.hooks ?? 0) + 1; if (/^10*$/.test(String(c.hooks))) try { note(c.cid, "hook_failed", { error: nameOf(x), count: c.hooks }); } catch { /* m-6 of the G2 of c5-bis-c: a failed journal never leaves onmessage */ } }
}
const nameOf = (x) => { try { return typeof x?.name === "string" ? x.name.slice(0, 64) : null; } catch { return null; } };
