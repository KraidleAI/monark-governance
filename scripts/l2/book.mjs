// scripts/l2/book.mjs -- lot P1-b2 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md, sections 2 D24-2, 3 point 7, 4 and 8.2; lot plan
// docs/G0-lot-l2-p1-b2.md): the order book of one symbol kept by the chain procedure (h) of the place (FAITS-L2-ACCESS-2 (h)). Node 24,
// zero dependencies. Sync, S1 to S7: the diff events of <symbol>@depth@100ms are buffered; after the first one, a depth snapshot is read
// through the REST client of P1-b1; a snapshot whose lastUpdateId is strictly below the U of the first buffered event is a vain try
// (S4); buffered events with u <= lastUpdateId are dropped (S5) and the first remaining one must continue the chain, U <= lastUpdateId
// + 1 (chain reading, Q-P1-7 decided at commit 90b294bd); the book is set to the snapshot (S6), then the buffer and the stream are applied
// (S7). Apply, A1 to A3: u < id is ignored; U > id + 1 is a named gap, the book is dropped and a new sync starts; each quantity is set as
// received (absolute, a decimal string never re-serialized), a zero one removes its level; id = u. Bounded resyncs (D24-2): 3 snapshots
// per resync, 1 s apart, then a named 60 s suspension; at most 3 snapshots of the symbol in any sliding 60 s, successes included, else a
// named wait (the weight of D24-2); a 429 or 418 of the REST client means no snapshot before its suspension ends; a stop of the REST
// client (451 and the others, another symbol's included) stops the book. Each buffer keeps its newest BUFFER_MAX events, the overflow
// named once per buffer (S4 re-checks the new first event). Switch (section 4.3, D-8): events of a newer connection are buffered, and
// at the switch those with u <= id are dropped and the rest must continue the chain under the same rule. A connection is named by the
// <cid> of its P1-a3 link (segments cidOf; another string is refused). Every named event is a line of the link's journal.jsonl (closed
// list EVENTS), with the head of P1-a3 (host_us, mono_ns, symbol, cid, event: the contract c1 reads, Q-3 of a3) and its PLAIN filter. Test seam: createBook(io) takes the symbol, the
// REST client, both host clocks of P1-a3, sleep and out.
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { LinkStop, SYMBOLS } from "./links.mjs";

export const STREAM_SUFFIX = "@depth@100ms"; // plan section 3 point 2
export const SNAPSHOTS_PER_RESYNC = 3; // D24-2: n
export const PAUSE_MS = 1_000; // D24-2: between two tries of one resync
export const SUSPEND_MS = 60_000; // D24-2: after n vain tries; also the sliding window of the snapshot cap
export const BUFFER_MAX = 1_200; // events per buffer: 120 s of 100 ms diffs (G0 point 12)
export const EVENTS = ["chain_synced", "sync_try_vain", "sync_suspended", "chain_gap", "chain_switched", "chain_stopped", "buffer_trimmed"];
const PLAIN = /^[-A-Za-z0-9_@/;=, ]*$/; // links.mjs:39, P1-a3's journal filter (not exported there): no dot, no colon
const CID = /^(spot|market)-[A-Z0-9]+-[0-9]{8}T[0-9]{9}Z$/; // segments.mjs:28, a <cid> of P1-a3 (not exported there)
const DECIMAL = /^[0-9]+([.][0-9]+)?$/;
const ZERO = /^0+([.]0+)?$/;
const LF = String.fromCharCode(10);

const isLevels = (x) => Array.isArray(x) && x.every((l) => Array.isArray(l) && l.length === 2 && DECIMAL.test(l[0]) && DECIMAL.test(l[1]));
const json = (text) => { try { return JSON.parse(text); } catch { return null; } };
/** A diff event { U, u, b, a }, or null when its shape is not the one read (FAITS-L2-ACCESS-1 l.21; level names: Q-B2-1). */
const eventOf = (d) => (Number.isSafeInteger(d?.U) && Number.isSafeInteger(d?.u) && d.U <= d.u && isLevels(d.b) && isLevels(d.a)
  ? { U: d.U, u: d.u, b: d.b, a: d.a } : null);
/** A depth snapshot { lastUpdateId, bids, asks }, or null. */
const snapshotOf = (body) => {
  const d = json(body.toString("utf8"));
  return Number.isSafeInteger(d?.lastUpdateId) && isLevels(d.bids) && isLevels(d.asks) ? d : null;
};
const setLevel = (side, [price, qty]) => { if (ZERO.test(qty)) side.delete(price); else side.set(price, qty); }; // A2

/** The book of one symbol: io = { symbol, rest, wallUs, monoNs, sleep, out }. */
export function createBook(io) {
  if (!SYMBOLS.includes(io.symbol)) throw new LinkStop("bad_symbol", { symbol: io.symbol }); // the symbols of a link (P1-a3)
  const stream = `${io.symbol.toLowerCase()}${STREAM_SUFFIX}`;
  const s = { id: null, bids: new Map(), asks: new Map(), buf: [], conn: null, next: null, retired: new Set(), sync: null,
    stopped: false, closed: false, trimmed: false, counts: { applied: 0, ignored: 0, dropped: 0, trimmed: 0 } };
  const takes = []; // host times of this symbol's snapshots, successes included (the cap of D24-2)
  const log = ({ event, ...fields }, cid = s.conn) => { // the head of a P1-a3 line, then the fields, through PLAIN
    const line = { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol: io.symbol, cid, event, ...fields };
    appendFileSync(join(io.out, "journal.jsonl"), JSON.stringify(line, (_, v) => (typeof v === "string" && !PLAIN.test(v) ? null : v)) + LF);
  };
  const startSync = () => { if (s.sync === null) s.sync = resync().finally(() => { s.sync = null; }); };
  function push(holder, ev) { // holder: s (sync buffer) or s.next; the oldest dropped past BUFFER_MAX, named once per buffer
    holder.buf.push(ev);
    if (holder.buf.length <= BUFFER_MAX) return;
    holder.buf.shift();
    s.counts.trimmed += 1;
    if (!holder.trimmed) log({ event: "buffer_trimmed", buffer: holder === s ? "sync" : holder.cid, bound: BUFFER_MAX });
    holder.trimmed = true;
  }
  const step = (ev) => { if (s.id === null) push(s, ev); else apply(ev); };
  function halt(code) { s.stopped = true; Object.assign(s, { id: null, buf: [] }); log({ event: "chain_stopped", code }); }
  function rupture(reason, ev, buf = ev === null ? [] : [ev]) {
    log({ event: "chain_gap", reason, expected_U: s.id === null ? null : s.id + 1, U: ev?.U ?? null, u: ev?.u ?? null });
    Object.assign(s, { id: null, bids: new Map(), asks: new Map(), buf, trimmed: false });
    if (buf.length > 0) startSync();
  }
  function apply(ev) {
    if (ev.u < s.id) { s.counts.ignored += 1; return; } // A1, strict
    if (ev.U > s.id + 1) { rupture("gap", ev); return; } // A1, strict: events are missing
    for (const level of ev.b) setLevel(s.bids, level);
    for (const level of ev.a) setLevel(s.asks, level);
    s.id = ev.u; // A3
    s.counts.applied += 1;
  }
  /** One try of a sync: null when the book is set, else the named reason of a vain try. */
  async function tryOnce() {
    let snap;
    try {
      snap = snapshotOf((await io.rest.request("depth", io.symbol)).body); // S3
    } catch (e) {
      const code = String(e?.code ?? "snapshot_error");
      if (io.rest.stopped) halt(code);
      return code;
    }
    if (s.buf.length === 0 || s.closed) return null; // switched to an empty buffer, or closed, while the snapshot was read
    if (snap === null) return "snapshot_shape";
    const lid = snap.lastUpdateId;
    if (lid < s.buf[0].U) return "snapshot_before_buffer"; // S4, strict, against the U of the FIRST buffered event (S2)
    const rest = s.buf.filter((ev) => ev.u > lid); // S5, wide: u <= lastUpdateId dropped, at a vain try too (a later lastUpdateId is larger)
    const dropped = s.buf.length - rest.length;
    s.counts.dropped += dropped;
    s.buf = rest;
    if (rest.length > 0 && rest[0].U > lid + 1) return "first_event_after_snapshot"; // S5, chain reading (Q-P1-7)
    Object.assign(s, { id: lid, bids: new Map(), asks: new Map(), buf: [], trimmed: false }); // S6
    for (const level of snap.bids) setLevel(s.bids, level);
    for (const level of snap.asks) setLevel(s.asks, level);
    log({ event: "chain_synced", last_update_id: lid, dropped, remaining: rest.length });
    for (const ev of rest) step(ev); // S7: the buffer in its order, then the stream (feed)
    return null;
  }
  async function resync() {
    let tries = 0;
    const live = () => s.id === null && s.buf.length > 0 && !s.stopped && !s.closed;
    while (live()) {
      const now = io.wallUs();
      while (takes.length > 0 && now - takes[0] >= SUSPEND_MS * 1000) takes.shift();
      if (tries === SNAPSHOTS_PER_RESYNC || takes.length >= SNAPSHOTS_PER_RESYNC) {
        const cause = tries === SNAPSHOTS_PER_RESYNC ? "tries" : "window", until = cause === "tries" ? now : takes[0];
        log({ event: "sync_suspended", cause, until_us: until + SUSPEND_MS * 1000 });
        await io.sleep(Math.ceil((until + SUSPEND_MS * 1000 - now) / 1000));
        if (cause === "tries") tries = 0;
        continue;
      }
      if (tries > 0) await io.sleep(PAUSE_MS);
      const wait = io.rest.suspendedUntilUs - io.wallUs(); // 429, 418: no snapshot before the REST suspension ends
      if (wait > 0) await io.sleep(Math.ceil(wait / 1000));
      if (!live()) return;
      tries += 1;
      takes.push(io.wallUs());
      const why = await tryOnce();
      if (why === null) tries = 0;
      else if (!s.stopped) log({ event: "sync_try_vain", reason: why, try: tries });
    }
  }
  /** One text message of connection `cid`: false when it is not a diff of this book's stream, or when its connection is retired. */
  function feed(text, cid) {
    if (!s.stopped && !s.closed && io.rest.stopped) halt("rest_stopped"); // the shared REST client stopped (another symbol's 451): at once
    if (s.stopped || s.closed || !CID.test(cid) || s.retired.has(cid)) return false;
    const doc = json(text);
    if (doc?.stream !== stream) return false; // S1: the other streams of the combined connection
    const ev = eventOf(doc.data);
    s.conn ??= cid;
    if (cid !== s.conn) { // a newer connection during the overlap: buffered until the switch
      if (s.next?.cid !== cid) s.next = { cid, buf: [], bad: false, trimmed: false };
      if (ev === null) s.next.bad = true; else push(s.next, ev);
      return true;
    }
    if (ev === null) rupture("event_shape", null);
    else if (s.id === null) { push(s, ev); startSync(); } // S2
    else apply(ev);
    return true;
  }
  /** Switch the book to connection `cid` (section 4.3): its buffered events with u <= id dropped, the rest applied under A1; false,
   *  nothing changed, for the connection followed, a string that is not a <cid>, or a stopped or closed book. */
  function switchTo(cid) {
    if (s.stopped || s.closed || !CID.test(cid) || cid === s.conn) return false;
    const next = s.next?.cid === cid ? s.next : { cid, buf: [], bad: false, trimmed: false };
    const from = s.conn;
    s.retired.add(from);
    Object.assign(s, { conn: cid, next: null });
    const kept = s.id === null ? next.buf : next.buf.filter((ev) => ev.u > s.id); // same wide bound as S5
    log({ event: "chain_switched", from, to: cid, dropped: next.buf.length - kept.length, remaining: kept.length });
    if (next.bad) rupture("event_shape", null, kept); // a malformed diff of the new connection, named, synced or not
    else if (s.id === null) { Object.assign(s, { buf: kept, trimmed: next.trimmed }); if (kept.length > 0) startSync(); } // replaces the old
    else for (const ev of kept) step(ev); // A1 on the first: U = id + 1 continues (Q-P1-7)
    return true;
  }
  const sorted = (side, sign) => [...side].sort((x, y) => sign * (Number(x[0]) - Number(y[0])));
  return {
    stream, feed, switchTo,
    idle: () => s.sync ?? Promise.resolve(),
    close: () => { s.closed = true; },
    get id() { return s.id; },
    get state() { return s.stopped ? "stopped" : s.id === null ? "syncing" : "synced"; },
    get counts() { return { ...s.counts }; },
    levels: () => (s.id === null ? null : { lastUpdateId: s.id, bids: sorted(s.bids, -1), asks: sorted(s.asks, 1) }),
  };
}
