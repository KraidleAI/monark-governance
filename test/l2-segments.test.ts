// test/l2-segments.test.ts -- lot L2-P1-a2 (2026-10-03): the raw segments of scripts/l2/segments.mjs (ADR-L2-CAPTURE-1 D-7 and D-21;
// plan docs/G0-partie-l2-p1.md sections 3 and 7, D24-3, D24-4), written and read in-process under the OS temp directory (outside any
// git tree, removed after the file) with injected wall and monotonic clocks: no network, no place, synthetic messages. A stop between a
// frame and its index line is simulated by an injected file opener. Each test names, on the line above it, the production mutation that
// reddens it (scripts/red-proof.mjs convention); every outcome is compared by assert, a named stop read as its code, never thrown.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, truncateSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkTail, cidOf, INDEX_KEYS, openWriter, QUEUE_BOUND, readSegment, SegmentStop, segmentOf } from "../scripts/l2/segments.mjs";
import type { SegmentFile, Tail, Writer, WriterIo } from "../scripts/l2/segments.mjs";

interface Rig { out: string; cid: string; w: Writer; stops: SegmentStop[]; at: (us: number, mono?: bigint) => void }

const ROOT = mkdtempSync(join(tmpdir(), "l2-segments-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
const LF = String.fromCharCode(10), HOUR_US = 3_600_000_000, BOUND = 8_388_608; // D24-3 and D24-4, written here, never imported
const H21 = Date.UTC(2026, 9, 3, 21) * 1000; // 2026-10-03T21:00:00Z in microseconds, a synthetic hour
const KEYS = ["rank", "offset", "length", "recv_us", "mono_ns"]; // plan section 3 point 18, written here, never imported
const PLACE_TIMES = ["E", "T", "serverTime"]; // times of the place (plan section 6): none may name a key of the index
let made = 0;

/** A writer under a fresh --out: wall clock set by `at` (monotonic: the same instant in ns unless given), every stop kept. */
function rig(io: Partial<WriterIo> = {}): Rig {
  const out = join(ROOT, `out-${String(++made)}`), cid = cidOf("spot", "BTCUSDT", H21), stops: SegmentStop[] = [], now = { us: H21, mono: 1n };
  const w = openWriter(out, cid, { wallUs: () => now.us, monoNs: () => now.mono, onStop: (s) => { stops.push(s); }, ...io });
  return { out, cid, w, stops, at: (us, mono = BigInt(us) * 1000n) => { now.us = us; now.mono = mono; } };
}
const paths = (r: Rig, seg: string): [string, string] =>
  [join(r.out, "conn", r.cid, `${seg}.frames`), join(r.out, "conn", r.cid, `${seg}.index.jsonl`)];
// Readers of the files are total: an absent file reads no bytes, so a missing output fails an assertion, never an ENOENT.
const bytesOf = (path: string): Buffer => (existsSync(path) ? readFileSync(path) : Buffer.alloc(0));
/** The frames file of a segment split on LF (messages without an LF of their own). */
const framesOf = (r: Rig, seg: string): string[] => bytesOf(paths(r, seg)[0]).toString("utf8").split(LF).slice(0, -1);
const linesIn = (r: Rig, seg: string): Record<string, unknown>[] => bytesOf(paths(r, seg)[1]).toString("utf8").split(LF)
  .filter((l) => l !== "").map((l) => JSON.parse(l) as Record<string, unknown>);
/** The value, or the code of the named stop: a mutant that throws anything else reddens by assertion, never by a crash. */
function attempt<T>(f: () => T): T | string {
  try {
    return f();
  } catch (e) {
    return e instanceof SegmentStop ? e.code : `not a stop: ${e instanceof Error ? e.message : "unknown"}`;
  }
}
const read = (r: Rig, seg: string, mark: Tail | null = null): string[] | string =>
  attempt(() => [...readSegment(r.out, r.cid, seg, mark)].map((f) => f.bytes.toString("utf8")));
const tailOf = (r: Rig, seg: string): Tail | null | string => attempt(() => checkTail(r.out, r.cid, seg));

// killer: scripts/l2/segments.mjs:83 CONST "[[cur.frames, item.bytes], [cur.index, line + NL]]" -> "[[cur.index, line + NL], [cur.frames, item.bytes]]"
test("l2_segment_index_after_frame", async () => {
  const seen: number[] = []; // bytes of the frames file on disk when each index line is about to be written
  const watched = async (path: string): Promise<SegmentFile> => {
    const h = await open(path, "ax"), frames = path.replace(/index[.]jsonl$/, "frames");
    return {
      appendFile: async (data) => {
        if (path !== frames) seen.push(statSync(frames).size);
        await h.appendFile(data);
      },
      close: () => h.close(),
    };
  };
  const r = rig({ open: watched }), seg = segmentOf(H21);
  const texts = [JSON.stringify({ a: 1 }), "", `x${LF}y`, String.fromCodePoint(0xe9, 0x20ac, 0x1f600)]; // JSON, empty, an inner LF, 9 bytes
  for (const [i, t] of texts.entries()) { r.at(H21 + i); assert.equal(r.w.push(t), true); }
  await r.w.close();
  const sizes = texts.map((t) => Buffer.byteLength(t)), ends = sizes.map((_, i) => sizes.slice(0, i + 1).reduce((a, n) => a + n + 1, 0));
  assert.equal(bytesOf(paths(r, seg)[0]).toString("utf8"), texts.map((t) => t + LF).join(""), "each message as delivered, then LF");
  assert.deepEqual(linesIn(r, seg).map((e) => [e.rank, e.offset, e.length]), sizes.map((n, i) => [i, (ends[i] ?? 0) - n - 1, n]));
  assert.deepEqual(seen, ends, "each index line is written once its frame and LF lie in the frames file");
  assert.deepEqual([read(r, seg), r.w.closed, r.stops], [texts, [seg], []], "the shared reader gives each message back by its offset");
});

// killer: scripts/l2/segments.mjs:79 ROR "item.us < cur.end" -> "item.us <= cur.end"
test("l2_segment_cut_on_clock", async () => {
  const r = rig(), [t21, t22, t23, t00] = ["20261003T21", "20261003T22", "20261003T23", "20261004T00"];
  r.at(H21); r.w.push("a");
  r.at(H21 + HOUR_US - 1); r.w.push("b"); // the last microsecond of 21 h stays in its segment
  r.at(H21 + HOUR_US); r.w.push("c"); // the first microsecond of 22 h opens the next one
  r.at(H21 + 2 * HOUR_US - 1); r.w.cut();
  await r.w.idle();
  assert.deepEqual(r.w.closed, [t21], "a cut one microsecond before the hour closes nothing");
  r.at(H21 + 2 * HOUR_US); r.w.cut();
  await r.w.idle();
  assert.deepEqual(r.w.closed, [t21, t22], "the cut at the hour closes the open segment, no frame needed");
  r.at(H21 + 2 * HOUR_US - 5); r.w.push("e"); // the wall clock stepped back: a closed segment is never reopened
  r.at(H21 + 3 * HOUR_US + 5); r.w.push("d");
  await r.w.close();
  assert.deepEqual([framesOf(r, t21), framesOf(r, t22), framesOf(r, t23), framesOf(r, t00), linesIn(r, t23)[0]?.recv_us],
    [["a", "b"], ["c"], ["e"], ["d"], H21 + 2 * HOUR_US - 5], "each frame in the segment of its hour, a stepped-back one in the next");
  assert.deepEqual([r.w.closed, r.w.push("late"), r.stops.map((s) => s.code)], [[t21, t22, t23, t00], false, ["writer_closed"]]);
});

// killer: scripts/l2/segments.mjs:23 CONST "3_600_000_000" -> "3_600_000"
test("l2_segment_period_one_hour", async () => {
  const r = rig(), q = HOUR_US / 4;
  for (const [i, us] of [0, q, 2 * q, 3 * q, HOUR_US - 1, HOUR_US, HOUR_US + q].entries()) { r.at(H21 + us); r.w.push(`m${String(i)}`); }
  await r.w.close();
  assert.deepEqual([framesOf(r, "20261003T21"), framesOf(r, "20261003T22"), r.w.closed, r.stops],
    [["m0", "m1", "m2", "m3", "m4"], ["m5", "m6"], ["20261003T21", "20261003T22"], []], "one segment holds one whole UTC hour, 3 600 s");
  assert.deepEqual([segmentOf(H21 - 1), segmentOf(H21 + 3 * HOUR_US), cidOf("market", "ALL", H21 + 1_234_567)],
    ["20261003T20", "20261004T00", "market-ALL-20261003T210001234Z"], "the names of plan section 7");
  const opened = attempt(() => { openWriter(ROOT, "../x", { wallUs: () => H21, monoNs: () => 1n }); return "opened"; }); // a string: no writer object
  assert.equal(opened, "bad_cid", "a cid out of its shape"); // in a TAP diff (an async function there turns the failure into ERR_TEST_FAILURE)
});

// killer: scripts/l2/segments.mjs:110 ROR "queued + size > QUEUE_BOUND" -> "queued + size >= QUEUE_BOUND"
test("l2_segment_queue_bound", async () => {
  const r = rig(), seg = segmentOf(H21), big = "x".repeat(BOUND - 2), e = String.fromCodePoint(0xe9); // e: one character, 2 bytes
  const got = [r.w.push(big), r.w.push(e), r.w.queued, r.w.push("y")]; // in one turn: nothing written yet
  assert.deepEqual([QUEUE_BOUND, got], [BOUND, [true, true, BOUND, false]], "the queue holds 8 388 608 bytes of frames, not one more");
  assert.deepEqual(r.stops.map((s) => [s.code, s.detail]),
    [["queue_overflow", { cid: r.cid, bound: BOUND, queued: BOUND, length: 1, recv_us: H21 }]], "the overflow is named");
  await r.w.idle();
  assert.deepEqual([r.w.queued, r.w.push("z"), r.stops.length], [0, false, 1], "the queue written, a small frame is still refused: no silent gap");
  await r.w.close();
  const want = Buffer.from(big + LF + e + LF), file = bytesOf(paths(r, seg)[0]);
  assert.deepEqual([file.equals(want), linesIn(r, seg).map((l) => [l.offset, l.length]), r.w.queued, r.w.peak, r.w.closed],
    [true, [[0, BOUND - 2], [BOUND - 1, 2]], 0, BOUND, [seg]], "the frames accepted before the overflow are written, the refused never");
});

/** f0 to f3 written through an opener under which the process stops at the index line of rank 2 once `land` of its bytes are on disk
 *  (null: it never stops). */
async function stopping(land: number | null): Promise<Rig> {
  let lines = 0;
  const r = rig({
    open: async (path) => {
      const h = await open(path, "ax"), index = path.endsWith(".index.jsonl");
      return {
        appendFile: async (data) => {
          if (land !== null && index && ++lines === 3) {
            await h.appendFile(Buffer.from(data).subarray(0, land));
            throw new Error("simulated stop");
          }
          await h.appendFile(data);
        },
        close: () => h.close(),
      };
    },
  });
  for (const t of ["f0", "f1", "f2", "f3"]) r.w.push(t);
  await r.w.close();
  return r;
}

// killer: scripts/l2/segments.mjs:204 SDL "tail !== null && mark === null" -> ""
test("l2_write_tail_marked", async () => {
  const seg = segmentOf(H21), none = await stopping(0), half = await stopping(10), whole = await stopping(null);
  const line = `{"rank":0,"offset":0,"length":2,"recv_us":${String(H21)},"mono_ns":"1"}`.length + 1; // the size of every index line here
  assert.deepEqual([tailOf(whole, seg), read(whole, seg), whole.w.closed, whole.stops], [null, ["f0", "f1", "f2", "f3"], [seg], []]);
  assert.deepEqual([none, half].map((r) => [framesOf(r, seg), r.w.closed, r.stops.map((s) => [s.code, s.detail.seg, s.detail.unwritten])]),
    [0, 1].map(() => [["f0", "f1", "f2"], [], [["write_failed", seg, 2]]]), "the frame of rank 2 lies on disk, its line not; named");
  truncateSync(paths(whole, seg)[0], 7); // a power loss kept every index line and 7 bytes of frames
  const kept = { cid: whole.cid, seg, ranks: 2, frames_kept: 6, index_kept: 2 * line };
  const beyond: Tail = { ...kept, frames_size: 7, index_size: 4 * line, causes: ["line_beyond_file"] };
  const tails: [Rig, Tail][] = [[none, { ...kept, frames_size: 9, index_size: 2 * line, causes: ["frame_without_line"] }],
    [half, { ...kept, frames_size: 9, index_size: 2 * line + 10, causes: ["truncated_line", "frame_without_line"] }], [whole, beyond]];
  for (const [r, tail] of tails) {
    assert.deepEqual([tailOf(r, seg), read(r, seg), read(r, seg, tail), read(r, seg, { ...tail, frames_size: tail.frames_size + 1 })],
      [tail, "tail_unmarked", ["f0", "f1"], "tail_mark_mismatch"], `${tail.causes.join(" + ")}: read past under its own mark only`);
  }
  // a line that the writer never writes, inside the index, is no tail: refused, marked or not (another rank; a length past the file with
  // more lines after it; keys out of order; one byte more; mono_ns as a number; recv_us as a float); then a frame not followed by its LF
  const [fp, ip] = paths(whole, seg), text = bytesOf(ip).toString("utf8");
  const was = `{"rank":1,"offset":3,"length":2,"recv_us":${String(H21)},"mono_ns":"1"}`; // the line of rank 1
  const edits: [string, string][] = [[`"rank":1`, `"rank":5`], [`"length":2`, `"length":9`], [`"rank":1,"offset":3`, `"offset":3,"rank":1`],
    [`,"offset"`, `, "offset"`], [`"mono_ns":"1"`, `"mono_ns":1`], [`${String(H21)},`, `${String(H21)}.5,`]];
  for (const [from, to] of edits) {
    writeFileSync(ip, text.replace(was, was.replace(from, to)));
    assert.deepEqual([tailOf(whole, seg), read(whole, seg, beyond)], ["segment_inconsistent", "segment_inconsistent"], to);
  }
  writeFileSync(ip, text);
  writeFileSync(fp, `f0 f1${LF}f`);
  assert.deepEqual([tailOf(whole, seg), read(whole, "20261003T05")], ["segment_inconsistent", "segment_missing"]);
  const bad = rig({ // the segment of 21 h fails to close when a frame of 22 h arrives: after a failure nothing is written, in no segment
    open: async (path) => {
      const h = await open(path, "ax");
      return {
        appendFile: (data) => h.appendFile(data),
        close: async () => { await h.close(); if (path.endsWith(".frames")) throw new Error("simulated close failure"); },
      };
    },
  });
  bad.w.push("g0");
  bad.at(H21 + HOUR_US);
  bad.w.push("g1");
  await bad.w.idle(); // the failure first, then close(): the loop must not start again
  await bad.w.close();
  assert.deepEqual([framesOf(bad, seg), existsSync(paths(bad, "20261003T22")[0]), bad.w.closed, bad.stops.map((s) => [s.code, s.detail.unwritten])],
    [["g0"], false, [], [["write_failed", 1]]], "a failed segment is never listed closed; the frame after it stays unwritten, named");
});

// killer: scripts/l2/segments.mjs:82 CONST "recv_us: item.us" -> "recv_us: item.us / 1000"
test("l2_index_recv_us_integer_named_apart", async () => {
  const r = rig(), seg = segmentOf(H21), w1 = H21 + 123_456_789, w2 = w1 + 1, m1 = 2n ** 60n + 1n, m2 = m1 + 2n; // past 2^53 ns
  r.at(w1, m1); r.w.push(JSON.stringify({ E: 1, T: 2 })); // the times of the place stay inside the frame, as received
  r.at(w2, m2); r.w.push("b");
  await r.w.close();
  const lines = linesIn(r, seg);
  assert.deepEqual([lines.map((e) => Object.keys(e)), [...INDEX_KEYS]], [[KEYS, KEYS], KEYS], "keys: rank, offset, length, recv_us, mono_ns");
  assert.deepEqual(lines.map((e) => [e.recv_us, Number.isSafeInteger(e.recv_us), e.mono_ns]), [[w1, true, String(m1)], [w2, true, String(m2)]],
    "recv_us: the injected wall clock in microseconds, a safe integer; mono_ns: a decimal string, exact past 2^53");
  assert.deepEqual(lines.flatMap((e) => Object.keys(e).filter((k) => PLACE_TIMES.includes(k))), [], "no key named after a time of the place");
  const f = rig({ wallUs: () => w1 / 1000 }); // milliseconds and a fraction: refused, named, nothing written
  assert.deepEqual([f.w.push("c"), f.stops.map((s) => s.code), existsSync(join(f.out, "conn"))], [false, ["clock_invalid"], false]);
});
