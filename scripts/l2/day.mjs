// scripts/l2/day.mjs -- the day and its seal (lot P1-c1 of part P1, 2026-10-04): ADR-L2-CAPTURE-1 D-17, section 2.3 points 8 and 10
// ("day and seal"), Q-9 and Q-10 closed, conditions (1) and (2) of RECHERCHES on Q-5; plan docs/G0-partie-l2-p1.md section 7, section
// 3 point 19, D24-5; lot plan docs/G0-lot-l2-p1-c1.md. Node 24, zero dependencies. sealDay() derives one day of one symbol from the raw
// alone (Q-P1-8: the replay's code, called by c5 on its schedule and by c6 for --from-raw): it reads, by the shared reader of P1-a2, the
// segments of the symbol's spot connections and of /market whose hour lies in [day start - 1 h, day end + grace], and the journal. Day
// of a frame: the UTC day of its place time E, read in microseconds on spot connections because their URL sets timeUnit=MICROSECOND
// (P1-a3), never from its magnitude; a time of the place that is not a safe integer stops the symbol's derived files, named, and writes
// nothing (the raw is never touched). @bookTicker carries no time (FAITS-L2-ACCESS-2 (d)): the day of the diff of the same connection
// whose [U;u] holds its u, else its reception day, marked recv_day (Q-9). /market: FAITS-L2-ACCESS-3 (e) is not established
// (FAITS-L2-ACCESS-3-E-1), E is neither read nor converted: reception day, marked recv_day (Q-C1-1). A frame received more than GRACE_US
// after the end of its day, or whose segment lies after its day's window (a host clock stepped back on a live connection), is late: it
// goes to the index of its segment's day, marked with its own. A frame whose segment lies before the window of its day (E more than 1 h
// after its reception) is early: the same, mirrored (G2 B-3, R-1 of the second G2). missing.json: the holes of the symbol's
// link and of /market (from a close that leaves the link without an open connection, or a start of c5 that finds connections never
// closed, Q-C1-10; from the last frame received to the first of the next connection, ADR "watchdog", else the journal's times; from_src, to_src) and the
// named events of MISSING_EVENTS in the day, from journal.jsonl. The seal waits for the end of the day plus the grace and for each
// segment read to be closed (closed(cid, seg), from c5); a frame is held as three int32 in a bucket of its stream, at most `bound` of
// them (index_bound); it writes index.jsonl by chunks, missing.json, manifest.json, each synced, then SHA256SUMS last (sha256sum -c
// format, every file of the day folder, a closed list, and each segment used, by relative path, hashed by chunks; written whole beside
// the folder, then linked in); a sealed day is never rewritten. A derive hook (P1-c2, m-9) adds its files (by chunks), new manifest and missing.json keys, references and modules first. The agent never commits (R-20).
import { createHash } from "node:crypto";
import { closeSync, existsSync, fstatSync, fsyncSync, linkSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, unlinkSync, writeSync } from "node:fs";
import { join, posix } from "node:path";
import { SYMBOLS } from "./links.mjs";
import { PERIOD_US, readSegment, segmentOf } from "./segments.mjs";

export const DAY_US = 86_400_000_000;
export const GRACE_US = 120_000_000; // D24-5: provisional grace (Q-10), fixed on M-6
export const SCHEMA = "monark.l2.binance.v1"; // section 3 point 19
export const TIME_UNITS = Object.freeze({ spot: "us", market: null }); // condition (1), by source; market: FAITS-L2-ACCESS-3-E-1 open
export const SAMPLING = Object.freeze({ stream: "forceOrder", per_symbol_ms: 1000, kept: "largest" }); // FAITS-L2-ACCESS-1 l.49-51
export const KEYS = Object.freeze({ "depth@100ms": "U,u", bookTicker: "u", trade: "t", forceOrder: "bytes", order: "key,bytes" }); // Q-P1-9
export const MISSING_EVENTS = Object.freeze(["writer_stop", "overlap_break", "chain_gap", "sync_try_vain", "sync_suspended",
  "chain_stopped", "buffer_trimmed", "tail_marked"]);
export const STOPS = Object.freeze(["bad_symbol", "bad_day", "place_time_unsafe", "day_sealed", "index_bound", "stray_file", "off_scale", "bad_scale", "minutes_bound", "canon_bound", "canon_reread", "snapshot_reload"]); // off_scale to minutes_bound: P1-c2; canon_*: P1-c3; snapshot_reload: P1-c5
export const INDEX_BOUND = 4_194_304; // G2 B-2: frames held at a seal (12 bytes each in the index, 32 for a pending bookTicker); R-2 of the
// second G2: halved from 8 388 608, so a day of 99.9 % bookTicker at the bound stays under MemoryMax=512M of D24-4 (measures in the G7)
export const DAY_FILES = Object.freeze(["index.jsonl", "missing.json", "manifest.json", "anchor-open.json", "anchor-close.json", "minutes.jsonl"]);
const LF = String.fromCharCode(10), MODULES = ["book", "day", "links", "rest", "segments"], CHUNK = 65_536, MARKS = [null, "recv_day", "late", "early"];

/** A named stop: `code` is one of STOPS, `detail` what was seen. */
export class DayStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "DayStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new DayStop(code, detail); };
const json = (text) => { try { return JSON.parse(text); } catch { return null; } };
const column = (T) => ({ a: new T(4096), n: 0 }); // a growable typed column
const put = (c, ...v) => { if (c.n + v.length > c.a.length) { const a = new c.a.constructor(c.a.length * 2); a.set(c.a); c.a = a; } for (const x of v) c.a[c.n++] = x; };
/** The sha256 of a file read by chunks, never whole. */
function shaOf(path) {
  const fd = openSync(path, "r"), hash = createHash("sha256"), chunk = Buffer.alloc(CHUNK);
  try { for (let n = readSync(fd, chunk); n > 0; n = readSync(fd, chunk)) hash.update(chunk.subarray(0, n)); } finally { closeSync(fd); }
  return hash.digest("hex");
}

/** The UTC day, YYYY-MM-DD, of a time in microseconds. */
export const dayOf = (us) => new Date(Math.floor(us / DAY_US) * 86_400_000).toISOString().slice(0, 10);

/** The lines of journal.jsonl of the symbol's link and of /market (ALL), in file order; none without a journal. */
function journalOf(out, symbol) {
  const file = join(out, "journal.jsonl");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split(LF).map(json).filter((l) => l !== null && (l.symbol === symbol || l.symbol === "ALL"));
}

/** recv_us of the first (or last) frame that a connection holds on disk, read in the head (or tail) of its segments' index; null if none. */
function edgeOf(out, cid, last) {
  const d = join(out, "conn", String(cid)), names = /^[a-z]+-[A-Z0-9]+-[0-9T]+Z$/.test(String(cid)) && existsSync(d)
    ? readdirSync(d).filter((n) => n.endsWith(".index.jsonl")).sort() : [];
  for (const name of last ? names.reverse() : names) {
    const fd = openSync(join(d, name), "r"), size = fstatSync(fd).size, buf = Buffer.alloc(Math.min(size, CHUNK));
    try { readSync(fd, buf, 0, buf.length, last ? size - buf.length : 0); } finally { closeSync(fd); }
    const us = buf.toString("utf8").split(LF).map(json).filter((e) => Number.isSafeInteger(e?.recv_us)).map((e) => e.recv_us);
    if (us.length > 0) return last ? us[us.length - 1] : us[0];
  }
  return null;
}

/** The holes of each link (symbol, ALL) that cut [start, end), and its named events in the day (MISSING_EVENTS), as written. */
function missingOf(out, lines, start, end) {
  const live = new Map(), holes = [], gaps = new Map(), seen = new Map();
  const gap = (link, cid, cause, from_us, from_src) => { const hole = { link, cid, cause, from_us, from_src, to_us: null, to_src: null }; holes.push(hole); gaps.set(link, hole); }; // Q-G2-4: *_src "frame" | "journal"
  for (const l of lines) {
    if (l.event === "start") { // Q-C1-10: a launch of c5; a connection open before it died with the process, never closed
      for (const [link, open] of live) {
        if (open.size === 0) continue;
        const last = [...open].map((c) => edgeOf(out, c, true)).filter((us) => us !== null);
        gap(link, null, "process_restart", last.length > 0 ? Math.max(...last) : seen.get(link), last.length > 0 ? "frame" : "journal");
        open.clear();
      }
      continue;
    }
    const open = live.get(l.symbol) ?? new Set();
    live.set(l.symbol, open);
    seen.set(l.symbol, l.host_us);
    if (l.event === "open") {
      open.add(l.cid);
      const hole = gaps.get(l.symbol);
      if (hole !== undefined) { const us = edgeOf(out, l.cid, false); [hole.to_us, hole.to_src] = [us ?? l.host_us, us === null ? "journal" : "frame"]; gaps.delete(l.symbol); }
    } else if (l.event === "close" && open.delete(l.cid) && open.size === 0) {
      const us = edgeOf(out, l.cid, true); gap(l.symbol, l.cid, l.cause ?? null, us ?? l.host_us, us === null ? "journal" : "frame");
    }
  }
  return { holes: holes.filter((h) => h.from_us < end && (h.to_us === null || h.to_us > start)),
    events: lines.filter((l) => MISSING_EVENTS.includes(l.event) && l.host_us >= start && l.host_us < end) };
}

/** The segments read for the day: [cid, seg] of the symbol's spot connections and of /market, their hour in the window, sorted. */
function segmentsOf(out, symbol, from, to) {
  const conn = join(out, "conn"), found = [];
  for (const cid of existsSync(conn) ? readdirSync(conn).sort() : []) {
    if (!cid.startsWith(`spot-${symbol}-`) && !cid.startsWith("market-ALL-")) continue;
    for (const name of readdirSync(join(conn, cid)).sort()) {
      const seg = name.endsWith(".frames") ? name.slice(0, -7) : null;
      if (seg !== null && seg >= from && seg <= to) found.push([cid, seg]);
    }
  }
  return found;
}

/** The index of day number `dn0`, bucketed by stream (stream -> int32 triples: segment number in segs, rank, kind + 4 x the frame's day
 *  number), from each frame of the segments read by the rules of the header, its counts and the segments used; past `bound`, a stop. */
function indexOf(out, symbol, segs, marks, dn0, bound) {
  const lower = symbol.toLowerCase(), buckets = new Map(), used = new Set(), counts = { streams: {}, late: 0, early: 0, recv_day: 0 };
  let held = 0, cid = null, diffs = null, tickers = null; // per connection: its diffs [U, u, dn], its bookTickers [s, rank, recv, u]
  const hold = (n) => { if (held + n > bound) stop("index_bound", { symbol, bound }); };
  const hours = segs.map(([, g]) => Date.parse(`${g.slice(0, 4)}-${g.slice(4, 6)}-${g.slice(6, 8)}T${g.slice(9)}:00:00Z`) * 1000); // segment starts
  const place = (stream, s, rank, recv, dn, kind) => { // kind 0: by its place time, 1: recv_day
    const end = (dn + 1) * DAY_US + GRACE_US; // D24-5: at the end plus the grace, still in its day; a segment past it is not read for it
    const k = (kind === 0 && recv > end) || hours[s] > end ? 2 : hours[s] < dn * DAY_US - PERIOD_US ? 3 : kind; // late; early: before the window
    if ((k >= 2 ? Math.floor(hours[s] / DAY_US) : dn) !== dn0) return; // late and early go to their segment's day (G2 bis R-1), read for it only
    hold(1);
    held += 1;
    const key = String(stream);
    if (!buckets.has(key)) buckets.set(key, { stream, col: column(Int32Array) });
    put(buckets.get(key).col, s, rank, k >= 2 ? k + 4 * dn : k);
    used.add(s);
    counts.streams[key] = (counts.streams[key] ?? 0) + 1;
    if (k > 0) counts[MARKS[k]] += 1;
  };
  const flush = () => { // Q-9: the diff of the same connection whose closed [U;u] holds u (diffs in u order on one connection)
    for (let i = 0; tickers !== null && i < tickers.n; i += 4) {
      const u = tickers.a[i + 3], n = diffs.n / 3;
      let lo = 0, hi = n;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (diffs.a[mid * 3 + 1] < u) lo = mid + 1; else hi = mid; }
      const hit = lo < n && diffs.a[lo * 3] <= u, recv = tickers.a[i + 2]; // else reception day, marked
      place(`${lower}@bookTicker`, tickers.a[i], tickers.a[i + 1], recv, hit ? diffs.a[lo * 3 + 2] : Math.floor(recv / DAY_US), hit ? 0 : 1);
    }
  };
  for (let s = 0; s < segs.length; s += 1) {
    const [c, seg] = segs[s], spot = c.startsWith("spot-");
    if (c !== cid) { flush(); [cid, diffs, tickers] = [c, column(Float64Array), column(Float64Array)]; }
    for (const f of readSegment(out, c, seg, marks.get(`${c}/${seg}`) ?? null)) {
      const doc = json(f.bytes.toString("utf8")), data = doc?.data ?? doc, stream = typeof doc?.stream === "string" ? doc.stream : null;
      if (!spot) {
        if (stream === null || !stream.endsWith("@forceOrder") || stream === `${lower}@forceOrder`) place(stream, s, f.rank, f.recv_us, Math.floor(f.recv_us / DAY_US), 1);
        continue;
      }
      if (stream === `${lower}@bookTicker`) { hold(tickers.n / 4 + 1); put(tickers, s, f.rank, f.recv_us, Number.isSafeInteger(data?.u) ? data.u : NaN); continue; }
      const us = data?.E; // the place time, in microseconds (timeUnit=MICROSECOND on the URL), never read from its magnitude
      if (!Number.isSafeInteger(us)) stop("place_time_unsafe", { symbol, cid: c, seg, rank: f.rank }); // condition (2)
      const dn = Math.floor(us / DAY_US);
      if (stream === `${lower}@depth@100ms` && Number.isSafeInteger(data.U) && Number.isSafeInteger(data.u)) put(diffs, data.U, data.u, dn);
      place(stream, s, f.rank, f.recv_us, dn, 0);
    }
  }
  flush();
  return { buckets, used, counts };
}

/** Seal one day of one symbol (header); { sealed: false, wait } while it must wait, else { sealed: true, dir, frames }. */
export function sealDay({ out, symbol, day, nowUs, closed, config = {}, bound = INDEX_BOUND, derive = null }) {
  if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { symbol });
  const start = Date.parse(`${day}T00:00:00Z`) * 1000, end = start + DAY_US, dir = join(out, "days", symbol, day);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(day) || !Number.isSafeInteger(start) || dayOf(start) !== day) stop("bad_day", { day });
  if (existsSync(join(dir, "SHA256SUMS"))) stop("day_sealed", { symbol, day });
  if (!(nowUs > end + GRACE_US)) return { sealed: false, wait: "grace" };
  const segs = segmentsOf(out, symbol, segmentOf(start - PERIOD_US), segmentOf(end + GRACE_US));
  const open = segs.filter(([cid, seg]) => !closed(cid, seg)).map(([cid, seg]) => `${cid}/${seg}`);
  if (open.length > 0) return { sealed: false, wait: "segments", open };
  const stray = existsSync(dir) ? readdirSync(dir).filter((n) => !DAY_FILES.includes(n)) : []; // G2 m-7: a residue is never sealed
  if (stray.length > 0) stop("stray_file", { symbol, day, names: stray });
  const lines = journalOf(out, symbol);
  const marks = new Map(lines.filter((l) => l.event === "tail_marked").map((l) => [`${l.cid}/${l.seg}`, l]));
  const { buckets, used, counts } = indexOf(out, symbol, segs, marks, start / DAY_US, bound), dv = derive === null ? {} : derive({ out, symbol, day, start, end, segs, marks, dir, index: buckets });
  const script_sha256 = Object.fromEntries([...MODULES, ...(dv.modules ?? [])].map((m) => [posix.join("scripts/l2", `${m}.mjs`), shaOf(new URL(`./${m}.mjs`, import.meta.url))]));
  const manifest = { schema: SCHEMA, symbol, day, redistributable: false, time_unit: TIME_UNITS, grace_us: GRACE_US, period_us: PERIOD_US,
    sampling: SAMPLING, keys: KEYS, node: process.version, undici: process.versions.undici ?? null, script_sha256, config, counts }, missing = missingOf(out, lines, start, end), BASE = DAY_FILES.slice(0, 5);
  const names = (dv.files ?? []).map(([n]) => n), keys = [[dv.manifest, manifest], [dv.missing, missing]].flatMap(([x, y]) => Object.keys(x ?? {}).filter((k) => Object.hasOwn(y, k))); if (names.some((n) => !DAY_FILES.includes(n) || BASE.includes(n)) || keys.length > 0 || new Set(names).size < names.length) stop("stray_file", { symbol, day, names, keys }); mkdirSync(dir, { recursive: true }); // G2 m-7: derived names, each once (n-2), no key overwritten
  const write = (name, body, flag = "w") => { const fd = openSync(join(dir, name), flag); try { body(fd); fsyncSync(fd); } finally { closeSync(fd); } };
  const sync = () => { const fd = openSync(dir, process.platform === "win32" ? "r+" : "r"); try { fsyncSync(fd); } finally { closeSync(fd); } }; // win32: "r" fails EPERM, "r+" ok (ledger.ts)
  write("index.jsonl", (fd) => { // by stream, then in read order; by chunks, never one string
    for (const key of [...buckets.keys()].sort()) {
      const { stream, col: { a, n } } = buckets.get(key);
      let text = "";
      for (let i = 0; i < n; i += 3) {
        const k = a[i + 2] & 3, of = k >= 2 ? { of: dayOf(((a[i + 2] - k) / 4) * DAY_US) } : {};
        text += JSON.stringify({ stream, cid: segs[a[i]][0], seg: segs[a[i]][1], rank: a[i + 1], ...(k > 0 ? { mark: MARKS[k], ...of } : {}) }) + LF;
        if (text.length >= CHUNK) { writeSync(fd, text); text = ""; }
      }
      writeSync(fd, text);
    }
  });
  write("missing.json", (fd) => writeSync(fd, JSON.stringify({ ...missing, ...dv.missing }) + LF));
  write("manifest.json", (fd) => writeSync(fd, JSON.stringify({ ...manifest, ...dv.manifest }) + LF)); for (const [name, text] of dv.files ?? []) write(name, (fd) => { for (const c of [].concat(text)) writeSync(fd, c); }); // by chunks (G2 B-1)
  sync();
  const paths = [...new Set([...readdirSync(dir).filter((n) => n !== "SHA256SUMS"),
    ...[...used].sort((x, y) => x - y).flatMap((s) => [".frames", ".index.jsonl"].map((x) => `../../../conn/${segs[s][0]}/${segs[s][1]}${x}`)), ...(dv.refs ?? [])])].sort();
  const tmp = `../.${day}.SHA256SUMS.tmp`; // G2 bis m-4: out of the folder, written whole, then linked (EEXIST, as wx): never empty when sealed
  write(tmp, (fd) => writeSync(fd, paths.map((p) => `${shaOf(join(dir, p))}  ${p}${LF}`).join("")));
  linkSync(join(dir, tmp), join(dir, "SHA256SUMS"));
  unlinkSync(join(dir, tmp));
  sync();
  return { sealed: true, dir, frames: Object.values(counts.streams).reduce((x, y) => x + y, 0) };
}
