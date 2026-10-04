// scripts/l2/links.mjs -- the spot links of the L2 recorder (lot P1-a3 of part P1, 2026-10-04): ADR-L2-CAPTURE-1 D-19 and D-21, section
// 2.3 (connection journal, connections, link watchdog, write queue); plan docs/G0-partie-l2-p1.md section 3 points 1 to 5 and 8, D24-1
// and D24-4; decisions Q-P1-3 and Q-P1-5 (plan, block of 2026-10-04 02:3x UTC). Node 24, zero dependencies. "undici l.N" is line N of
// the client source embedded in Node v24.15.0 (undici 7.24.4, sha256 d6332aa1ca04f71f...), as in the plan's L-1.
// A link is the run of connections of one symbol on the combined URL of spotUrl(): its three streams, the place times in microseconds
// (timeUnit). openLink() refuses, before the factory is ever called and before anything is written, a URL whose origin is not in
// ORIGINS (host_refused); it opens each connection through the injected WebSocket factory and hands each text message, as the embedded
// client delivers it and unread, to the segment writer of that connection (scripts/l2/segments.mjs, one <cid> per connection). The
// client alone writes the PONGs (undici l.14979-14984); the link sends nothing but a CLOSE (D-19).
// Journal <out>/journal.jsonl, one line per event, written as it happens: host_us and mono_ns (the host's clocks, never a time of the
// place), symbol, cid, event (open, ping, close, writer_stop, retry, defer), then its fields; each string of a line that PLAIN refuses
// is written null, so that no address (IPv4, IPv6, host:port) reaches it; the link reads no socket address and never subscribes to the
// open channel, which publishes one (undici l.15394). Pings are read on the undici:websocket:ping channel, which names their client
// (undici l.15156). Watchdog (D24-1): no message nor ping during WATCHDOG_K ping intervals, from the opening on, closes the connection,
// named. A stop of its writer (queue_overflow past the 8 MiB bound of D24-4, write_failed, clock_invalid) is journaled as writer_stop
// with its detail, even once the connection is closed, and closes a live connection, named, as a binary message does. After any close,
// once the writer of that connection is closed (its accepted queue written: a link never holds two queues, the memory of D24-4), the
// link opens a new connection after 1, 2, 4... s, capped at RETRY_CAP_MS, back to 1 s once a connection has delivered a text message;
// the gate of the process admits at most OPENS_MAX openings per OPENS_WINDOW_MS, sliding, and defers the others, named. Test seam: the
// factory, both clocks, the timers, the gate and the file opener come from the caller, never from the command line nor the
// environment. The agent never commits (R-20).
import { subscribe } from "node:diagnostics_channel";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { cidOf, openWriter } from "./segments.mjs";

export const SPOT_ORIGIN = "wss://stream.binance.com:9443"; // Q-P1-3: the general base, its port written (FAITS-L2-ACCESS-3 (a))
export const ORIGINS = Object.freeze([SPOT_ORIGIN]); // closed list, one entry per line of FAITS (section 3 point 4): a4 and b1 add theirs
export const SYMBOLS = Object.freeze(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]); // closed list (point 1)
export const STREAMS = Object.freeze(["depth@100ms", "bookTicker", "trade"]); // in this order, the symbol in lower case (point 2)
export const TIME_UNIT = "MICROSECOND"; // point 3: a URL parameter of the spot streams (FAITS-L2-ACCESS-2 (c))
export const PING_MS = 20_000; // point 5: the place pings a spot connection every 20 s (FAITS-L2-ACCESS-1 l.17)
export const WATCHDOG_K = 3; // D24-1: k ping intervals without a message nor a ping, 60 s in spot
export const RETRY_FIRST_MS = 1_000; // point 8: unplanned reopenings after 1, 2, 4... s,
export const RETRY_CAP_MS = 60_000; // capped at 60 s,
export const OPENS_MAX = 30; // and at most 30 openings per 5 sliding minutes for the process, a tenth of the limit read
export const OPENS_WINDOW_MS = 300_000; // (FAITS-L2-ACCESS-1 l.19-20)
export const STOPS = Object.freeze(["bad_symbol", "host_refused"]); // named stops, thrown before anything is opened or written
const LF = String.fromCharCode(10), PLAIN = /^[-A-Za-z0-9_@/;=, ]*$/; // no dot, no colon: neither an IPv4, an IPv6 nor a host:port

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

/** True iff the URL parses and its normalized form begins with an origin of ORIGINS then "/": another scheme, host or port, or a user
 *  part, is refused (the host is never matched by a prefix of its own). */
const admitted = (url) => {
  try { const h = new URL(url).href; return ORIGINS.some((o) => h.startsWith(`${o}/`)); } catch { return false; }
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

/** A link (header): spec { symbol, url, out }, io { webSocket, wallUs, monoNs, setTimer, clearTimer, gate, open }; stop() ends it. */
export function openLink({ symbol, url, out }, io) {
  if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { symbol });
  if (!admitted(url)) stop("host_refused", { url });
  mkdirSync(out, { recursive: true });
  const journal = join(out, "journal.jsonl"), query = new URL(url).searchParams, closing = new Set();
  const streams = query.get("streams"), timeUnit = query.get("timeUnit");
  let cur = null, timer = null, failures = 0, stopped = false;
  const note = (cid, event, fields = {}) => {
    const line = { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol, cid, event, ...fields };
    appendFileSync(journal, JSON.stringify(line, (_, v) => (typeof v === "string" && !PLAIN.test(v) ? null : v)) + LF);
  };
  const arm = (c) => { io.clearTimer(c.dog); c.dog = io.setTimer(() => { end(c, "watchdog"); }, WATCHDOG_K * PING_MS); };
  function end(c, cause, detail = {}) { // once per connection: the named close, its writer closed, then a new connection unless stopped
    if (!c.live) return;
    c.live = false;
    io.clearTimer(c.dog);
    PINGS.delete(c.ws);
    if (cause !== "closed") c.ws.close(1000); // the link's own close: one CLOSE frame, its answer never awaited (a dead link has none)
    note(c.cid, "close", { cause, ...detail });
    failures = c.got ? 1 : failures + 1; // one connection at a time: nothing else changes it before the reopening below
    const done = c.w.close().then(() => { // no new connection while this writer still holds frames (a stalled disk waits here)
      closing.delete(done);
      if (stopped) return;
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
    const cid = cidOf("spot", symbol, io.wallUs()), c = { cid, ws: null, w: null, got: false, live: true, dog: null };
    const onStop = (s) => { // the first stop of the writer (segments l.52-55), named even once its connection is closed
      note(cid, "writer_stop", { cause: s.code, ...s.detail });
      end(c, s.code); // a live connection closes on it, named
    };
    c.w = openWriter(out, cid, { wallUs: io.wallUs, monoNs: io.monoNs, open: io.open, onStop });
    c.ws = io.webSocket(url);
    c.ws.binaryType = "arraybuffer";
    c.ws.onopen = () => { if (c.live) note(cid, "open", { streams, time_unit: timeUnit, extensions: c.ws.extensions }); };
    c.ws.onmessage = (e) => {
      if (!c.live) return;
      arm(c);
      if (typeof e.data !== "string") return end(c, "binary_message"); // a text frame is all the place sends (D-7): never written
      c.got = true;
      c.w.push(e.data); // the message as the client delivers it, unread (D-7 as read by Q-P1-5)
    };
    c.ws.onclose = (e) => { end(c, "closed", { code: e.code, reason: e.reason, clean: e.wasClean }); };
    PINGS.set(c.ws, (payload) => { if (c.live) { arm(c); note(cid, "ping", { bytes: payload.length }); } });
    arm(c);
    cur = c;
  }
  connect();
  return {
    async stop() {
      stopped = true;
      io.clearTimer(timer);
      if (cur !== null) end(cur, "stopped");
      await Promise.all(closing);
    },
  };
}
