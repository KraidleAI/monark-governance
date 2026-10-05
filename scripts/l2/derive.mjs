// scripts/l2/derive.mjs -- the book of one day replayed from the raw, its minutes and its parity (lot P1-c2 of part P1, 2026-10-05):
// ADR-L2-CAPTURE-1 D-9, D-10, D-11, section 2.3 points 5, 7 and 9, TL-3, TL-5; plan docs/G0-partie-l2-p1.md section 3 points 20 and 21;
// lot plan docs/G0-lot-l2-p1-c2.md. Node 24, zero dependencies. deriveDay() is the hook that sealDay (P1-c1) calls before it writes
// anything (m-9 of c1), from the raw alone (Q-P1-8). Snapshots: anchor-open.json of the day folder, and the depth snapshots that P1-b1
// kept under rest/<SYMBOL>/, requested in [day start - 1 h, day end) and, with an anchor, after it; in lastUpdateId order. Diffs: the
// <symbol>@depth@100ms frames of the symbol's spot segments that the seal reads, in read order. The chain rule of P1-b2, transcribed
// synchronous as sealDay is: without a book, snapshots below U - 1 of the event at hand are passed (S4, chain reading Q-P1-7; not
// strict against the first buffered event as in b2, FAITS-L2-ACCESS-2 (h): a snapshot at U - 1 is taken here where b2 makes a vain
// try, the chain being continuous; a divergence declared, G2 m-4), an event with u <= lastUpdateId is dropped (S5), else the book is
// set to the snapshot (S6) and the event applied (S7); with one, u < id is ignored, U > id + 1 or an unreadable diff is a rupture, the
// book dropped; quantities set as received, zero removes (A2); id = u (A3). The diffs of
// the day before after the anchor (the amorce) are so replayed in place; every segment with a diff frame read is referenced (G2 m-5).
// Kept snapshots are parsed once for their lastUpdateId, read again when the book is set (G2 m-9); read again with another one, or unreadable, snapshot_reload (P1-c5). Prices are integers at the day's
// scale (BigInt; a non-zero digit past it: off_scale, nothing written). Minute t, 00:00 to 23:59: the book after the events of place
// time strictly before t, written at the first chained event at or after t: levels within +-100 bp (100 |2p - b - a| <= b + a), their
// count, the distance of the deepest level of the snapshot synced on, floored; else absent, named. Chain holes (m-5 of c1) go to
// missing.json in place time, cut to the day (a sync at 00:00:00 leaves a hole of zero length: minute 00:00 is absent). Parity at
// anchor-close.json: book and anchor brought to the same u by the first event reaching its lastUpdateId, differences counted per side in
// the anchor's price range; a book set on that anchor itself: synced_on_anchor. minutes.jsonl is built by chunks, at most `bound` bytes
// (minutes_bound, G2 B-1). The agent never commits (R-20).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { STREAM_SUFFIX } from "./book.mjs";
import { DayStop } from "./day.mjs";
import { PERIOD_US, readSegment } from "./segments.mjs";

export const MINUTE_US = 60_000_000;
export const WINDOW_BP = 100n; // section 3 point 20
export const MINUTES_BOUND = 134_217_728; // G2 B-1: bytes of minutes.jsonl held at a seal (128 MiB), revised in M-1 (L2-MINUTES-SIZE-1)
const DECIMAL = /^[0-9]+([.][0-9]+)?$/, ZERO = /^0+([.]0+)?$/, LF = String.fromCharCode(10), CHUNK = 65_536;
const REST = /^([A-Z0-9]+)-depth-([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{3})([0-9]{3})Z[.]json$/; // rest.mjs stamp
const json = (text) => { try { return JSON.parse(text); } catch { return null; } };
const isLevels = (x) => Array.isArray(x) && x.every((l) => Array.isArray(l) && l.length === 2 && DECIMAL.test(l[0]) && DECIMAL.test(l[1]));
const snapOf = (text) => { const d = json(text); return Number.isSafeInteger(d?.lastUpdateId) && isLevels(d.bids) && isLevels(d.asks) ? { lid: d.lastUpdateId, bids: d.bids, asks: d.asks } : null; };
const eventOf = (d) => (Number.isSafeInteger(d?.U) && Number.isSafeInteger(d?.u) && d.U <= d.u && isLevels(d.b) && isLevels(d.a) ? d : null);
const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
const range = (m) => [...m.keys()].reduce((r, p) => (r === null ? [p, p] : [p < r[0] ? p : r[0], p > r[1] ? p : r[1]]), null);
const norm = (q) => (q.includes(".") ? q.replace(/0+$/, "").replace(/[.]$/, "") : q); // a quantity, trailing decimal zeros aside

/** A decimal string as an integer at `scale`; a non-zero digit past it stops the derived files of the symbol (off_scale). */
export function atScale(text, scale) {
  const [int, frac = ""] = text.split(".");
  if (/[1-9]/.test(frac.slice(scale))) throw new DayStop("off_scale", { text, scale });
  return BigInt(int + frac.slice(0, scale).padEnd(scale, "0"));
}

/** The depth snapshots kept by P1-b1 for `symbol`, requested in [from, to), each with its path relative to the day folder. */
function restSnapshots(out, symbol, from, to) {
  const d = join(out, "rest", symbol);
  return (existsSync(d) ? readdirSync(d).sort() : []).flatMap((name) => {
    const m = REST.exec(name), us = m?.[1] === symbol ? Date.parse(`${m[2]}-${m[3]}-${m[4]}T${m[5]}:${m[6]}:${m[7]}.${m[8]}Z`) * 1000 + Number(m[9]) : NaN;
    const s = us >= from && us < to ? snapOf(readFileSync(join(d, name), "utf8")) : null, load = () => snapOf(readFileSync(join(d, name), "utf8"));
    return s === null ? [] : [{ lid: s.lid, load, ref: `../../../rest/${symbol}/${name}` }];
  });
}

/** One line of minutes.jsonl for minute t of `book` (null: a rupture is open). */
function minuteOf(t, book) {
  if (book === null) return { t, absent: "chain_open" };
  const b = range(book.bids)?.[1], a = range(book.asks)?.[0];
  if (b === undefined || a === undefined) return { t, u: book.id, absent: "side_empty" };
  const dev = (p) => (2n * p - b - a < 0n ? b + a - 2n * p : 2n * p - b - a);
  const near = (m, sign) => [...m].filter(([p]) => WINDOW_BP * dev(p) <= b + a).sort(([x], [y]) => sign * cmp(x, y)).map(([, l]) => l);
  const bp = (p) => (p === null ? null : Number((10000n * dev(p)) / (b + a))); // floored, never overstated
  const bids = near(book.bids, -1), asks = near(book.asks, 1);
  return { t, u: book.id, bids, asks, n: [bids.length, asks.length], dist_bp: [bp(book.floor[0]), bp(book.floor[1])] };
}

/** The hook of sealDay (header): files, manifest and missing.json keys, references. */
export function deriveDay({ out, symbol, day, start, end, segs, marks, dir, scale, bound = MINUTES_BOUND, tap = null }) {
  if (!Number.isSafeInteger(scale) || scale < 0 || scale > 18) throw new DayStop("bad_scale", { symbol, day, scale });
  const anchor = (name) => (existsSync(join(dir, name)) ? snapOf(readFileSync(join(dir, name), "utf8")) ?? "anchor_shape" : "anchor_missing");
  const open = anchor("anchor-open.json"), close = anchor("anchor-close.json"), anchored = typeof open !== "string";
  const snaps = [...(anchored ? [{ lid: open.lid, load: () => open, ref: null }] : []), ...restSnapshots(out, symbol, start - PERIOD_US, end).filter((s) => !anchored || s.lid > open.lid)]
    .sort((x, y) => x.lid - y.lid);
  const side = (levels, m = new Map()) => { for (const l of levels) { const p = atScale(l[0], scale); if (ZERO.test(l[1])) m.delete(p); else m.set(p, l); } return m; };
  const stream = `${symbol.toLowerCase()}${STREAM_SUFFIX}`, chunks = [], holes = [], syncs = [], refs = new Set();
  let book = null, k = 0, t = start, lastE = start, from = start, n = 0, size = 0, text = "", absent = 0, cross = 0, how = null;
  let parity = typeof close === "string" ? { absent: close } : null;
  const push = (line) => { // by chunks, never one string (G2 B-1): past `bound` bytes, a named stop, before anything is written
    const row = JSON.stringify(line) + LF; [n, size, text, absent] = [n + 1, size + row.length, text + row, absent + (line.absent === undefined ? 0 : 1)];
    if (size > bound) throw new DayStop("minutes_bound", { symbol, day, bound }); if (text.length >= CHUNK) { chunks.push(text); text = ""; } };
  const emit = (E) => { for (; t < end && t <= E; t += MINUTE_US) push(minuteOf(t, book)); }; // minute t: events of place time < t
  const hole = (to) => { if ((to === null || to >= start) && from < end) holes.push({ from_place_us: Math.max(from, start), to_place_us: to === null ? null : Math.min(to, end) }); };
  const parityOf = (ev) => { // anchor and book both at ev.u: the anchor carried by the one event that reaches its lastUpdateId
    const ported = { bids: side(ev.b, side(close.bids)), asks: side(ev.a, side(close.asks)) }, r = { bids: range(side(close.bids)), asks: range(side(close.asks)) };
    const count = (s) => (r[s] === null ? 0 : [...new Set([...book[s].keys(), ...ported[s].keys()])].filter((p) => p >= r[s][0] && p <= r[s][1]
      && norm(book[s].get(p)?.[1] ?? "0") !== norm(ported[s].get(p)?.[1] ?? "0")).length);
    return { u: ev.u, since: book.since, bids: count("bids"), asks: count("asks") };
  };
  for (const [cid, seg] of segs) {
    if (!cid.startsWith(`spot-${symbol}-`)) continue;
    let hit = false;
    for (const f of readSegment(out, cid, seg, marks.get(`${cid}/${seg}`) ?? null)) {
      const doc = json(f.bytes.toString("utf8"));
      if (doc?.stream !== stream) continue;
      hit = true; // G2 m-5: an unreadable, ignored or dropped diff changes the replay too
      const E = doc.data?.E, ev = eventOf(doc.data); // E: a safe integer, or sealDay stopped before (place_time_unsafe)
      if (book !== null && ev !== null && ev.u < book.id) continue; // A1: ignored (the duplicates of an overlap)
      if (book !== null && (ev === null || ev.U > book.id + 1)) [book, from, cross] = [null, lastE, cross + (E < lastE ? 1 : 0)]; // A1: a rupture; cross: read after a later frame, from another connection (Q-C2-9)
      emit(E);
      if (book === null && ev !== null) {
        while (k < snaps.length && snaps[k].lid < ev.U - 1) k += 1; // S4, chain reading: U = lastUpdateId + 1 continues
        const s = snaps[k];
        if (s === undefined || s.lid >= ev.u) continue; // none yet; or S5, the event is not after the snapshot
        const full = s.load(); if (full?.lid !== s.lid) throw new DayStop("snapshot_reload", { symbol, day, ref: s.ref, lid: s.lid }); const bids = side(full.bids), asks = side(full.asks); // L2-SNAPSHOT-RELOAD-1
        book = { id: s.lid, since: s.lid, bids, asks, floor: [range(bids)?.[0] ?? null, range(asks)?.[1] ?? null] }; // S6
        [k, how] = [k + 1, how ?? (s.ref === null ? "anchor" : "snapshot")];
        hole(E);
        syncs.push(s.lid);
        if (s.ref !== null) refs.add(s.ref);
      }
      if (book === null) continue;
      side(ev.b, book.bids);
      side(ev.a, book.asks);
      [book.id, lastE] = [ev.u, E]; tap?.(ev, book); // A2, A3; tap: each applied diff, for the crosscheck (ii) of P1-c3
      if (parity === null && ev.u >= close.lid) parity = ev.U > close.lid + 1 ? { absent: "chain_open" } : book.since === close.lid ? { absent: "synced_on_anchor", u: ev.u } : parityOf(ev);
    }
    if (hit) for (const x of [".frames", ".index.jsonl"]) refs.add(`../../../conn/${cid}/${seg}${x}`);
  }
  for (; t < end; t += MINUTE_US) push({ t, absent: book === null ? "chain_open" : "no_later_event" });
  if (book === null) hole(null);
  return { files: [["minutes.jsonl", [...chunks, text]]], modules: ["derive"], missing: { chain_holes: holes }, refs: [...refs].sort(),
    manifest: { replay: { scale, start: how, syncs, cross_conn_ruptures: cross, minutes: { present: n - absent, absent } }, parity: parity ?? { absent: "chain_open" } } };
}
