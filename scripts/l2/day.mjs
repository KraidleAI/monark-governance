// scripts/l2/day.mjs -- the day and its seal (lot P1-c1 of part P1, 2026-10-04): ADR-L2-CAPTURE-1 D-17, section 2.3 points 8 and 10
// ("Jour et scellé"), Q-9 and Q-10 closed, conditions (1) and (2) of RECHERCHES on Q-5; plan docs/G0-partie-l2-p1.md section 7, section
// 3 point 19, D24-5; lot plan docs/G0-lot-l2-p1-c1.md. Node 24, zero dependencies. sealDay() derives one day of one symbol from the raw
// alone (Q-P1-8: the replay's code, called by c5 on its schedule and by c6 for --from-raw): it reads, by the shared reader of P1-a2, the
// segments of the symbol's spot connections and of /market whose hour lies in [day start - 1 h, day end + grace], and the journal. Day
// of a frame: the UTC day of its place time E, read in microseconds on spot connections because their URL sets timeUnit=MICROSECOND
// (P1-a3), never from its magnitude; a time of the place that is not a safe integer stops the symbol's derived files, named, and writes
// nothing (the raw is never touched). @bookTicker carries no time (FAITS-L2-ACCESS-2 (d)): the day of the diff of the same connection
// whose [U;u] holds its u, else its reception day, marked recv_day (Q-9). /market: FAITS-L2-ACCESS-3 (e) is not established
// (FAITS-L2-ACCESS-3-E-1), E is neither read nor converted: reception day, marked recv_day (Q-C1-1). A frame received more than GRACE_US
// after the end of its day is late: it goes to the index of its reception day, marked with its own. missing.json: the holes of the
// symbol's link and of /market (from a close that leaves the link without an open connection to its next open) and the named events
// of MISSING_EVENTS in the day, from journal.jsonl. The seal waits for the end of the day plus the grace and for each segment read to
// be closed (closed(cid, seg), from c5); it writes index.jsonl, missing.json, manifest.json, then SHA256SUMS last (sha256sum -c format,
// every file of the day folder and each segment referenced, by relative path); a sealed day is never rewritten. The agent never
// commits (R-20).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
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
export const STOPS = Object.freeze(["bad_symbol", "bad_day", "place_time_unsafe", "day_sealed"]);
const LF = String.fromCharCode(10), MODULES = ["book", "day", "links", "rest", "segments"];

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
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = (text) => { try { return JSON.parse(text); } catch { return null; } };

/** The UTC day, YYYY-MM-DD, of a time in microseconds. */
export const dayOf = (us) => new Date(Math.floor(us / DAY_US) * 86_400_000).toISOString().slice(0, 10);

/** The lines of journal.jsonl of the symbol's link and of /market (ALL), in file order; none without a journal. */
function journalOf(out, symbol) {
  const file = join(out, "journal.jsonl");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split(LF).map(json).filter((l) => l !== null && (l.symbol === symbol || l.symbol === "ALL"));
}

/** The holes of each link (symbol, ALL) that cut [start, end), and its named events in the day (MISSING_EVENTS), as written. */
function missingOf(lines, start, end) {
  const live = new Map(), holes = [], gaps = new Map();
  for (const l of lines) {
    const open = live.get(l.symbol) ?? new Set();
    live.set(l.symbol, open);
    if (l.event === "open") {
      open.add(l.cid);
      const hole = gaps.get(l.symbol);
      if (hole !== undefined) { hole.to_us = l.host_us; gaps.delete(l.symbol); }
    } else if (l.event === "close" && open.delete(l.cid) && open.size === 0) {
      const hole = { link: l.symbol, cid: l.cid, cause: l.cause ?? null, from_us: l.host_us, to_us: null };
      holes.push(hole);
      gaps.set(l.symbol, hole);
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

/** Each frame of the segments read, with its day number (dn, days since 1970-01-01 UTC) and mark: the rules of the header. */
function framesOf(out, symbol, segs, marks) {
  const lower = symbol.toLowerCase(), frames = [], diffs = new Map(); // cid -> its diffs [U, u, dn]
  for (const [cid, seg] of segs) {
    const spot = cid.startsWith("spot-");
    for (const f of readSegment(out, cid, seg, marks.get(`${cid}/${seg}`) ?? null)) {
      const doc = json(f.bytes.toString("utf8")), data = doc?.data ?? doc, stream = typeof doc?.stream === "string" ? doc.stream : null;
      const at = { stream, cid, seg, rank: f.rank, recv: f.recv_us, dn: Math.floor(f.recv_us / DAY_US), mark: "recv_day" };
      if (!spot) {
        if (stream === null || !stream.endsWith("@forceOrder") || stream === `${lower}@forceOrder`) frames.push(at);
        continue;
      }
      if (stream === `${lower}@bookTicker`) { frames.push({ ...at, u: data?.u }); continue; }
      const us = data?.E; // the place time, in microseconds (timeUnit=MICROSECOND on the URL), never read from its magnitude
      if (!Number.isSafeInteger(us)) stop("place_time_unsafe", { symbol, cid, seg, rank: f.rank }); // condition (2)
      Object.assign(at, { dn: Math.floor(us / DAY_US), mark: null });
      if (stream === `${lower}@depth@100ms` && Number.isSafeInteger(data.U) && Number.isSafeInteger(data.u)) {
        if (!diffs.has(cid)) diffs.set(cid, []);
        diffs.get(cid).push([data.U, data.u, at.dn]);
      }
      frames.push(at);
    }
  }
  for (const list of diffs.values()) list.sort((x, y) => x[1] - y[1]);
  for (const f of frames.filter((x) => Number.isSafeInteger(x.u))) { // Q-9: the diff of the same connection whose closed [U;u] holds u
    const list = diffs.get(f.cid) ?? [];
    let lo = 0, hi = list.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (list[mid][1] < f.u) lo = mid + 1; else hi = mid; }
    if (lo < list.length && list[lo][0] <= f.u) Object.assign(f, { dn: list[lo][2], mark: null }); // else reception day, marked
  }
  return frames;
}

/** Seal one day of one symbol (header); { sealed: false, wait } while it must wait, else { sealed: true, dir, frames }. */
export function sealDay({ out, symbol, day, nowUs, closed, config = {} }) {
  if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { symbol });
  const start = Date.parse(`${day}T00:00:00Z`) * 1000, end = start + DAY_US, dir = join(out, "days", symbol, day);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(day) || !Number.isSafeInteger(start) || dayOf(start) !== day) stop("bad_day", { day });
  if (existsSync(join(dir, "SHA256SUMS"))) stop("day_sealed", { symbol, day });
  if (!(nowUs > end + GRACE_US)) return { sealed: false, wait: "grace" };
  const segs = segmentsOf(out, symbol, segmentOf(start - PERIOD_US), segmentOf(end + GRACE_US));
  const open = segs.filter(([cid, seg]) => !closed(cid, seg)).map(([cid, seg]) => `${cid}/${seg}`);
  if (open.length > 0) return { sealed: false, wait: "segments", open };
  const lines = journalOf(out, symbol);
  const marks = new Map(lines.filter((l) => l.event === "tail_marked").map((l) => [`${l.cid}/${l.seg}`, l]));
  const index = [], counts = { streams: {}, late: 0, recv_day: 0 };
  for (const f of framesOf(out, symbol, segs, marks)) {
    const late = f.mark === null && f.recv > (f.dn + 1) * DAY_US + GRACE_US; // D24-5: at the end plus the grace, still in its day
    if ((late ? Math.floor(f.recv / DAY_US) : f.dn) * DAY_US !== start) continue; // a late frame goes to its reception day
    const line = { stream: f.stream, cid: f.cid, seg: f.seg, rank: f.rank, ...(late ? { mark: "late", of: dayOf(f.dn * DAY_US) } : f.mark ? { mark: f.mark } : {}) };
    index.push(line);
    counts.streams[String(f.stream)] = (counts.streams[String(f.stream)] ?? 0) + 1;
    if (late) counts.late += 1; else if (f.mark !== null) counts.recv_day += 1;
  }
  index.sort((a, b) => (String(a.stream) < String(b.stream) ? -1 : String(a.stream) > String(b.stream) ? 1 : 0)); // stable: read order kept
  const script_sha256 = Object.fromEntries(MODULES.map((m) => [`scripts/l2/${m}.mjs`, sha(readFileSync(new URL(`./${m}.mjs`, import.meta.url)))]));
  const manifest = { schema: SCHEMA, symbol, day, redistributable: false, time_unit: TIME_UNITS, grace_us: GRACE_US, period_us: PERIOD_US,
    sampling: SAMPLING, keys: KEYS, node: process.version, undici: process.versions.undici ?? null, script_sha256, config, counts };
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.jsonl"), index.map((l) => JSON.stringify(l) + LF).join(""));
  writeFileSync(join(dir, "missing.json"), JSON.stringify(missingOf(lines, start, end)) + LF);
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest) + LF);
  const used = [...new Set(index.map((l) => `${l.cid}/${l.seg}`))];
  const paths = [...readdirSync(dir).filter((n) => n !== "SHA256SUMS"),
    ...used.flatMap((s) => [".frames", ".index.jsonl"].map((x) => `../../../conn/${s}${x}`))].sort();
  writeFileSync(join(dir, "SHA256SUMS"), paths.map((p) => `${sha(readFileSync(join(dir, p)))}  ${p}${LF}`).join(""), { flag: "wx" });
  return { sealed: true, dir, frames: index.length };
}
