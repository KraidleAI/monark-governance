// scripts/l2/segments.mjs -- raw segments of one L2 connection (lot P1-a2 of part P1, 2026-10-03): ADR-L2-CAPTURE-1 D-7 and D-21,
// plan docs/G0-partie-l2-p1.md section 7 (layout), section 3 point 18 (index line), D24-3 and D24-4. Node 24, zero dependencies.
// Layout: <out>/conn/<cid>/<seg>.frames holds each message as the WebSocket client delivers it, an LF after each, never read before it
// is written; <out>/conn/<cid>/<seg>.index.jsonl holds one line per frame, written AFTER the frame and its LF: rank (from 0 in the
// segment), offset and length (bytes of the frames file, LF excluded), recv_us (the host's wall clock at reception, in microseconds, a
// safe integer, named apart from every time of the place: condition (3) of RECHERCHES) and mono_ns (the host's monotonic clock at
// reception, in nanoseconds, a decimal string). <cid> = <spot|market>-<SYMBOL|ALL>-<host opening time, YYYYMMDDTHHMMSSmmmZ>; <seg> =
// YYYYMMDDTHH, the UTC hour of the host's wall clock whose frames the segment holds (D24-3: 3 600 s; cut on the clock, never on content).
// Writer: push() reads both clocks when a message arrives and queues its bytes; one loop writes the queue in reception order, one frame
// at a time. The queue holds at most QUEUE_BOUND bytes of frames per connection (D24-4): past it, the frame is refused and the writer
// accepts nothing more, a named stop given once to onStop, never a silent growth nor a silent gap. cut() closes the open segment once
// its hour is over; close() writes the queue, then closes. A segment file is created once (flag ax) and never reopened: a frame whose
// wall clock stepped back joins the open segment, or the next one after a cut, its recv_us written as read.
// Tail check (L2-WRITE-TAIL-1) at a resume, both ways: a frame that no complete line names, a truncated line, a line past the end of
// the frames file; the tail found is the mark that the caller writes down (missing.json: lot P1-c1); any other mismatch is no tail.
// Reader, shared with the replay (lot P1-c6): the frames of a segment in rank order, a tail excluded only under its own mark, an
// unmarked tail refused. Named stops: SegmentStop.code, one of STOPS. Test seam: the clocks, the file opener and onStop come from the
// caller, never from the command line nor the environment. The agent never commits (R-20).
import { closeSync, existsSync, fstatSync, openSync, readSync, statSync } from "node:fs";
import { mkdir, open as openFile } from "node:fs/promises";
import { join } from "node:path";

export const PERIOD_US = 3_600_000_000; // D24-3: one UTC hour, in microseconds (the unit of recv_us)
export const QUEUE_BOUND = 8_388_608; // D24-4: 8 MiB of frame bytes (UTF-8, LF excluded) received and not yet written, per connection
export const INDEX_KEYS = Object.freeze(["rank", "offset", "length", "recv_us", "mono_ns"]); // section 3 point 18, in this order
export const STOPS = Object.freeze(["bad_cid", "clock_invalid", "queue_overflow", "write_failed", "writer_closed", "segment_missing",
  "segment_inconsistent", "tail_unmarked", "tail_mark_mismatch"]);
const LF = 10, NL = String.fromCharCode(LF), CID = /^(spot|market)-[A-Z0-9]+-[0-9]{8}T[0-9]{9}Z$/;
const TAIL_KEYS = ["cid", "seg", "ranks", "frames_kept", "frames_size", "index_kept", "index_size", "causes"];

/** A named stop: `code` is one of STOPS, `detail` what was seen. */
export class SegmentStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "SegmentStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new SegmentStop(code, detail); };

/** <seg> of a time in microseconds: the UTC hour that holds it, YYYYMMDDTHH. */
export const segmentOf = (us) => new Date((us - (us % PERIOD_US)) / 1000).toISOString().slice(0, 13).replace(/-/g, "");
/** <cid> of a connection: its kind, its symbol (ALL for /market), the host's wall clock at its opening, to the millisecond. */
export const cidOf = (kind, symbol, openUs) => `${kind}-${symbol}-${new Date(Math.floor(openUs / 1000)).toISOString().replace(/[-:.]/g, "")}`;

/** The writer of one connection under <out>/conn/<cid>/ (header): push() and cut() are synchronous, the loop alone touches the files. */
export function openWriter(out, cid, io) {
  if (!CID.test(cid)) stop("bad_cid", { cid });
  const dir = join(out, "conn", cid), open = io.open ?? ((path) => openFile(path, "ax")), queue = [], closed = [];
  let queued = 0, peak = 0, cur = null, last = 0, busy = false, running = Promise.resolve(), closing = false, failed = false, stopped = null;
  const halt = (code, detail) => { // the first stop is kept and given once to onStop; a refused push returns false
    if (stopped === null) { stopped = new SegmentStop(code, { cid, ...detail }); io.onStop?.(stopped); }
    return false;
  };
  const clocks = () => { // both read when the message arrives; recv_us is never rounded, never a float
    const us = io.wallUs(), mono = io.monoNs();
    if (Number.isSafeInteger(us) && typeof mono === "bigint" && mono >= 0n) return { us, mono };
    halt("clock_invalid", { recv_us: String(us), mono_ns: String(mono) });
    return null;
  };
  async function begin(us) { // the segment of the hour of `us`, never one already closed; both files exist before any byte is written
    const start = Math.max(us - (us % PERIOD_US), last), seg = segmentOf(start);
    cur = { seg, end: start + PERIOD_US, rank: 0, offset: 0, frames: null, index: null };
    await mkdir(dir, { recursive: true });
    cur.frames = await open(join(dir, `${seg}.frames`));
    cur.index = await open(join(dir, `${seg}.index.jsonl`));
  }
  async function shut() {
    await Promise.all([cur.frames, cur.index].map(async (f) => { await f.sync?.(); await f.close(); })); // synced before closed (m-7 of c1)
    closed.push(cur.seg);
    last = cur.end;
    cur = null;
  }
  async function drain() {
    try {
      while (queue.length > 0 && !failed) {
        const item = queue[0];
        if (cur !== null && !(item.us < cur.end)) await shut(); // the open segment keeps what arrives before its end
        if (item.bytes !== undefined) {
          if (cur === null) await begin(item.us);
          const line = JSON.stringify({ rank: cur.rank, offset: cur.offset, length: item.size, recv_us: item.us, mono_ns: String(item.mono) });
          for (const [file, data] of [[cur.frames, item.bytes], [cur.index, line + NL]]) await file.appendFile(data); // frame, THEN line
          cur.rank += 1;
          cur.offset += item.bytes.length;
        }
        queue.shift();
        queued -= item.size;
      }
    } catch (e) { // the segment stays as it lies on disk (its tail is for the tail check); what is still queued is named, unwritten
      const c = cur, left = queue.filter((q) => q.bytes !== undefined);
      cur = null;
      failed = true;
      halt("write_failed", { seg: c?.seg ?? null, code: e?.code ?? null, message: String(e?.message ?? e), unwritten: left.length,
        recv_us: left[0]?.us ?? null });
      await Promise.allSettled([c?.frames?.close(), c?.index?.close()]);
    } finally {
      busy = false;
    }
  }
  const pump = () => { if (!busy) { busy = true; running = drain(); } };
  const idle = async () => { while (busy) await running; };
  return {
    push(text) {
      if (stopped !== null) return false;
      if (closing) return halt("writer_closed", {});
      const t = clocks();
      if (t === null) return false;
      const bytes = Buffer.from(text + NL, "utf8"), size = bytes.length - 1;
      if (queued + size > QUEUE_BOUND) return halt("queue_overflow", { bound: QUEUE_BOUND, queued, length: size, recv_us: t.us });
      queued += size;
      peak = Math.max(peak, queued);
      queue.push({ ...t, bytes, size });
      pump();
      return true;
    },
    cut() {
      const t = stopped === null && !closing ? clocks() : null;
      if (t !== null) { queue.push({ us: t.us, size: 0 }); pump(); }
    },
    idle,
    async close() {
      if (!closing) { closing = true; queue.push({ us: Infinity, size: 0 }); pump(); }
      await idle();
    },
    get queued() { return queued; },
    get peak() { return peak; },
    get closed() { return [...closed]; },
    get stopped() { return stopped; },
  };
}

/** The lines of a file read by chunks, never whole: [bytes, true] for each line that an LF ends, then [bytes, false] for a last one without. */
function* linesOf(path) {
  const fd = openSync(path, "r"), chunk = Buffer.alloc(65_536);
  let rest = Buffer.alloc(0);
  try {
    for (let n = readSync(fd, chunk); n > 0; n = readSync(fd, chunk)) {
      let data = Buffer.concat([rest, chunk.subarray(0, n)]);
      for (let at = data.indexOf(LF); at !== -1; at = data.indexOf(LF)) {
        yield [data.subarray(0, at), true];
        data = data.subarray(at + 1);
      }
      rest = data;
    }
  } finally {
    closeSync(fd);
  }
  if (rest.length > 0) yield [rest, false];
}

/** One index line as the writer writes it, else null: JSON with the keys of INDEX_KEYS in order, the same bytes once written back. */
function entryOf(line) {
  const text = line.toString("utf8");
  let e;
  try { e = JSON.parse(text); } catch { return null; }
  if (e === null || typeof e !== "object" || Object.keys(e).join() !== INDEX_KEYS.join() || JSON.stringify(e) !== text) return null;
  return Number.isSafeInteger(e.length) && e.length >= 0 && Number.isSafeInteger(e.recv_us) && typeof e.mono_ns === "string"
    && /^(0|[1-9][0-9]*)$/.test(e.mono_ns) ? e : null;
}

/** The walk that the tail check and the reader share: the longest run of complete index lines that each name the next rank, the next
 *  offset and a frame followed by its LF inside the frames file; then the tail, both ways, or null. Complete lines past the end of the
 *  frames file are a tail only as the last lines of the index, each one following the one before; any other mismatch stops. */
function* walk(out, cid, seg, withBytes) {
  const dir = join(out, "conn", cid), fp = join(dir, `${seg}.frames`), ip = join(dir, `${seg}.index.jsonl`);
  if (!existsSync(fp)) stop("segment_missing", { cid, seg });
  const fd = openSync(fp, "r"), size = fstatSync(fd).size;
  let ranks = 0, kept = 0, indexKept = 0, next = 0, past = 0, truncated = false; // past: complete lines that name bytes past the file
  try {
    for (const [line, whole] of existsSync(ip) ? linesOf(ip) : []) {
      if (!whole) { truncated = true; break; }
      const e = entryOf(line);
      if (e === null || e.rank !== ranks + past || e.offset !== next) {
        stop("segment_inconsistent", { cid, seg, rank: ranks + past, why: "index line" });
      }
      next = e.offset + e.length + 1;
      if (next > size) { past += 1; continue; } // past the end of the frames file: every later line must follow it there
      const bytes = Buffer.alloc(withBytes ? e.length + 1 : 1);
      readSync(fd, bytes, 0, bytes.length, withBytes ? e.offset : e.offset + e.length);
      if (bytes[bytes.length - 1] !== LF) stop("segment_inconsistent", { cid, seg, rank: ranks, why: "no LF after the frame" });
      if (withBytes) yield { ...e, bytes: bytes.subarray(0, e.length) };
      ranks += 1;
      kept = next;
      indexKept += line.length + 1;
    }
  } finally {
    closeSync(fd);
  }
  const causes = [[truncated, "truncated_line"], [past > 0, "line_beyond_file"], [past === 0 && size > kept, "frame_without_line"]]
    .filter(([on]) => on).map(([, cause]) => cause);
  return causes.length === 0 ? null
    : { cid, seg, ranks, frames_kept: kept, frames_size: size, index_kept: indexKept, index_size: existsSync(ip) ? statSync(ip).size : 0, causes };
}

/** The tail check of a resume (D-21, L2-WRITE-TAIL-1): null for a consistent segment, else its tail, the mark that the caller writes down. */
export const checkTail = (out, cid, seg) => walk(out, cid, seg, false).next().value;

const markOf = (t) => JSON.stringify(TAIL_KEYS.map((k) => t?.[k] ?? null));
/** The reader shared with the replay: each frame of the consistent run in rank order, its index entry and its bytes (LF excluded); a
 *  tail is read past only under its own mark (else tail_mark_mismatch) and refused unmarked (tail_unmarked). */
export function* readSegment(out, cid, seg, mark = null) {
  const tail = checkTail(out, cid, seg);
  if (tail !== null && mark === null) stop("tail_unmarked", { cid, seg, tail });
  if (mark !== null && markOf(mark) !== markOf(tail)) stop("tail_mark_mismatch", { cid, seg, tail, mark });
  yield* walk(out, cid, seg, true);
}
