// test/l2-derive.test.ts -- lot L2-P1-c2 (2026-10-05): the book of a day replayed from the raw, its minutes and its parity,
// scripts/l2/derive.mjs through the derive hook of sealDay (ADR-L2-CAPTURE-1 D-9, D-10, TL-3, TL-5; plan docs/G0-partie-l2-p1.md
// section 3 points 20 and 21; lot plan docs/G0-lot-l2-p1-c2.md). Segments are written by the writer of P1-a2 (openWriter) with an
// injected wall clock, anchors and kept snapshots by hand, under the OS temp directory (made in before(), removed after): no network, no
// place, synthetic frames whose numbers mean nothing of a market. The module is loaded by a dynamic import that each test asserts, so the
// base, which has no scripts/l2/derive.mjs, reddens by assertion. Each test names, on the line above it, the mutation that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBook } from "../scripts/l2/book.mjs";
import { DayStop, sealDay, type Derived } from "../scripts/l2/day.mjs";
import { cidOf, openWriter } from "../scripts/l2/segments.mjs";
import type * as DeriveM from "../scripts/l2/derive.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-derive.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-LINKS-FILE-CRASH-1)
let ROOT = "", made = 0;
before(() => { ROOT = mkdtempSync(join(tmpdir(), "l2-derive-")); });
after(() => { if (ROOT !== "") rmSync(ROOT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const LF = String.fromCharCode(10), D = "2026-10-04", S = 1_000_000, MIN = 60 * S, HOUR = 60 * MIN, START = Date.UTC(2026, 9, 4) * 1000;
const END = START + 24 * HOUR;
type Lv = [string, string];
type Line = Record<string, unknown>;

async function load(): Promise<typeof DeriveM> {
  const m = await import("../scripts/l2/derive.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/derive.mjs is absent");
}
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
/** A spot connection of BTCUSDT under `out`, its frames [recv_us, text] written by the writer of P1-a2; its <cid>. */
async function conn(out: string, frames: [number, string][]): Promise<string> {
  const cid = cidOf("spot", "BTCUSDT", frames[0]![0]);
  let now = frames[0]![0];
  const w = openWriter(out, cid, { wallUs: () => now, monoNs: () => BigInt(now) * 1000n });
  for (const [us, text] of frames) { now = us; assert.equal(w.push(text), true); }
  await w.close();
  return cid;
}
/** A diff received at its place time E. */
const diff = (U: number, u: number, E: number, b: Lv[] = [], a: Lv[] = []): [number, string] =>
  [E, JSON.stringify({ stream: "btcusdt@depth@100ms", data: { e: "depthUpdate", E, s: "BTCUSDT", U, u, b, a } })];
const snap = (lastUpdateId: number, bids: Lv[], asks: Lv[]): string => JSON.stringify({ lastUpdateId, bids, asks });
const dayDir = (out: string): string => join(out, "days", "BTCUSDT", D);
const anchor = (out: string, name: string, body: string): void => { mkdirSync(dayDir(out), { recursive: true }); writeFileSync(join(dayDir(out), name), body); };
/** A depth snapshot kept by P1-b1, requested at `us` (its file name, as rest.mjs stamps it). */
function kept(out: string, us: number, body: string): string {
  const name = `BTCUSDT-depth-${new Date(Math.floor(us / 1000)).toISOString().replace(/[-:.]/g, "").slice(0, -1)}${String(us % 1000).padStart(3, "0")}Z.json`;
  mkdirSync(join(out, "rest", "BTCUSDT"), { recursive: true });
  writeFileSync(join(out, "rest", "BTCUSDT", name), body);
  return name;
}
/** The seal of D with the derive hook at `scale` (minutes.jsonl at most `bound` bytes), or the code of its named stop. */
async function seal(out: string, scale = 2, bound?: number): Promise<unknown> {
  const M = await load();
  try {
    return sealDay({ out, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, derive: (ctx) => M.deriveDay({ ...ctx, scale, bound }) });
  } catch (e) { return e instanceof DayStop ? e.code : String(e); }
}
const read = (out: string, name: string): string => readFileSync(join(dayDir(out), name), "utf8");
const minutes = (out: string): Line[] => read(out, "minutes.jsonl").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Line);
const manifest = (out: string): Line => JSON.parse(read(out, "manifest.json")) as Line;
const holes = (out: string): unknown => (JSON.parse(read(out, "missing.json")) as Line).chain_holes;
const ok = (got: unknown, out: string, n: number): void => assert.deepEqual(got, { sealed: true, dir: dayDir(out), frames: n });

// killer: scripts/l2/derive.mjs:63 ROR "WINDOW_BP * dev(p) <= b + a" -> "WINDOW_BP * dev(p) < b + a"
test("l2_minute_window_exact", async () => {
  const out = fresh(); // b = 100.00, a = 102.00: 100 |2p - b - a| <= b + a holds from 99.99 to 102.01, inclusive
  anchor(out, "anchor-open.json", snap(100, [["100.00", "1"], ["99.99000000", "2"], ["99.98", "3"]], [["102.00", "1"], ["102.01", "2"], ["102.02", "3"]]));
  await conn(out, [diff(101, 101, START - 30 * S), diff(102, 102, START + 30 * S, [["100.00", "5"]]), diff(103, 103, START + 90 * S),
    diff(105, 105, START + 150 * S)]);
  ok(await seal(out), out, 3);
  const m = minutes(out), asks = [["102.00", "1"], ["102.01", "2"]], n = [2, 2], dist_bp = [100, 100];
  assert.equal(m.length, 1440);
  assert.deepEqual(m.slice(0, 3), [{ t: START, u: 101, bids: [["100.00", "1"], ["99.99000000", "2"]], asks, n, dist_bp },
    { t: START + MIN, u: 102, bids: [["100.00", "5"], ["99.99000000", "2"]], asks, n, dist_bp }, { t: START + 2 * MIN, absent: "chain_open" }]);
  assert.ok(m.slice(2).every((l) => l.absent === "chain_open")); // a rupture stays open: every later minute is absent, named
  assert.deepEqual(holes(out), [{ from_place_us: START + 90 * S, to_place_us: null }]);
  const off = fresh(); // a price past the day's scale stops the symbol's derived files, nothing written
  anchor(off, "anchor-open.json", snap(100, [["100.00", "1"]], [["102.00", "1"]]));
  await conn(off, [diff(101, 101, START + S, [["100.001", "1"]])]);
  assert.equal(await seal(off), "off_scale");
  assert.equal(existsSync(join(dayDir(off), "index.jsonl")) || existsSync(join(dayDir(off), "minutes.jsonl")), false);
  assert.equal(await seal(off, 19), "bad_scale");
});

// killer: scripts/l2/derive.mjs:83 ROR "t <= E" -> "t < E"
test("l2_minute_place_time_strict", async () => {
  const out = fresh(); // b = 100.00, a = 101.00; deepest anchor levels 99.50 (99.50 bp) and 101.37 (86.56 bp): floored
  anchor(out, "anchor-open.json", snap(100, [["100.00", "1"], ["99.50", "1"]], [["101.00", "1"], ["101.37", "1"]]));
  await conn(out, [diff(101, 101, START - S), diff(102, 102, START + MIN, [["100.00", "7"]]), diff(103, 103, START + MIN + 1)]);
  ok(await seal(out), out, 2);
  const m = minutes(out), line = { u: 101, bids: [["100.00", "1"], ["99.50", "1"]], asks: [["101.00", "1"], ["101.37", "1"]], n: [2, 2], dist_bp: [99, 86] };
  assert.deepEqual(m.slice(0, 3), [{ t: START, ...line }, { t: START + MIN, ...line }, { t: START + 2 * MIN, absent: "no_later_event" }]);
  assert.equal(m.length, 1440); // an event of place time t is not in minute t; no chained event after: no stale book
  assert.deepEqual(manifest(out).replay, { scale: 2, start: "anchor", syncs: [100], cross_conn_ruptures: 0, minutes: { present: 2, absent: 1438 } });
  assert.deepEqual(manifest(out).parity, { absent: "anchor_missing" });
  assert.deepEqual(holes(out), []);
});

/** A day whose last event (102..u) straddles the lastUpdateId 103 of `close`, the anchor-close of D; the parity of the manifest. */
async function parity(close: string, u = 104): Promise<unknown> {
  const out = fresh();
  anchor(out, "anchor-open.json", snap(100, [["10.00", "1"], ["9.00", "1"], ["7.00", "1"]], [["11.00", "1"], ["12.00", "1"]]));
  anchor(out, "anchor-close.json", close);
  await conn(out, [diff(101, 101, START + HOUR, [["9.50", "2.00"]]), diff(102, u, END - 30 * S, [["10.00", "3"]], [["13.00", "1"]])]);
  ok(await seal(out), out, 2);
  return manifest(out).parity;
}

// killer: scripts/l2/derive.mjs:88 ROR "!== norm(" -> "=== norm("
test("l2_daily_parity_counts", async () => {
  const asks: Lv[] = [["11.00", "1"], ["12.00", "1"]]; // the anchor at 103, carried to 104 by the event that straddles it: 0 difference
  assert.deepEqual(await parity(snap(103, [["10.00", "3"], ["9.50", "2"], ["9.00", "1"], ["7.00", "1"]], asks)), { u: 104, since: 100, bids: 0, asks: 0 });
  // an altered anchor: 9.00 and 8.00 differ, 9.50 "2.0" equals "2", 7.00 lies outside its bid range [8.00; 10.00]; 12.00 differs
  const altered = snap(103, [["10.00", "3"], ["9.50", "2.0"], ["9.00", "4"], ["8.00", "1"]], [["11.00", "1"], ["12.00", "5"]]);
  assert.deepEqual(await parity(altered), { u: 104, since: 100, bids: 2, asks: 1 });
  assert.deepEqual(await parity(snap(50, [["10.00", "1"]], asks)), { absent: "chain_open" }); // the book never stood at 50
  const open = snap(100, [["10.00", "1"], ["9.00", "1"], ["7.00", "1"]], asks); // the book set on that very anchor: trivial, named (G2 m-8)
  assert.deepEqual(await parity(open), { absent: "synced_on_anchor", u: 101 });
  assert.deepEqual(await parity("{"), { absent: "anchor_shape" });
});

const AMORCE = [diff(95, 99, START - 25 * MIN), diff(100, 100, START - 20 * MIN), diff(101, 102, START - 10 * MIN, [["100.00", "2"]]),
  diff(103, 103, START + MIN, [], [["100.50", "0"], ["100.40", "3"]]), diff(104, 104, START + 2 * MIN, [["99.90", "1"]]), diff(105, 105, START + 3 * MIN)];
const OPEN = snap(100, [["100.00", "1"]], [["100.50", "1"]]);

// killer: scripts/l2/derive.mjs:103 ROR "snaps[k].lid < ev.U - 1" -> "snaps[k].lid < ev.U"
test("l2_day_replay_from_anchor_and_amorce", async () => {
  const out = fresh(); // the anchor of the day before's last minute, then its later diffs (the amorce): U = lastUpdateId + 1 continues
  anchor(out, "anchor-open.json", OPEN);
  kept(out, START - 40 * MIN, snap(96, [["90.00", "1"]], [["100.50", "1"]])); // before the anchor: never a candidate
  const cid = await conn(out, AMORCE);
  ok(await seal(out), out, 3);
  const m = minutes(out), first = { u: 102, bids: [["100.00", "2"]], asks: [["100.50", "1"]], n: [1, 1], dist_bp: [24, 24] };
  assert.deepEqual(m.slice(0, 2), [{ t: START, ...first }, { t: START + MIN, ...first }]);
  mkdirSync(join(out, "b2"));
  const book = createBook({ symbol: "BTCUSDT", out: join(out, "b2"), wallUs: () => START, monoNs: () => 0n, sleep: () => Promise.resolve(),
    rest: { request: () => Promise.resolve({ body: Buffer.from(OPEN), kept: "", sentUs: 0, receivedUs: 0 }), stopped: false, suspendedUntilUs: 0 } });
  for (const [, text] of AMORCE.slice(0, 5)) book.feed(text, cid);
  await book.idle();
  assert.deepEqual({ lastUpdateId: m[3]!.u, bids: m[3]!.bids, asks: m[3]!.asks }, book.levels()); // the book of P1-b2, same frames
  assert.deepEqual([manifest(out).replay, holes(out)], [{ scale: 2, start: "anchor", syncs: [100], cross_conn_ruptures: 0, minutes: { present: 4, absent: 1436 } }, []]);
  const bare = fresh(); // no anchor: the replay starts on a snapshot kept in the last hour of the day before, referenced
  kept(bare, START - 2 * HOUR, snap(99, [["90.00", "1"]], [["100.50", "1"]])); // out of the window: never read
  const name = kept(bare, START - 30 * MIN, OPEN), c2 = await conn(bare, AMORCE);
  ok(await seal(bare), bare, 3);
  assert.deepEqual(minutes(bare), m);
  assert.equal((manifest(bare).replay as Line).start, "snapshot");
  const sums = read(bare, "SHA256SUMS").split(LF).map((l) => l.slice(66));
  assert.equal(new Set(sums).size, sums.length); // a segment of the day referenced by the replay too is listed once
  for (const p of [`../../../rest/BTCUSDT/${name}`, `../../../conn/${c2}/20261003T23.frames`, "minutes.jsonl"]) assert.ok(sums.includes(p), p);
  assert.ok(Object.keys(manifest(bare).script_sha256 as Line).includes("scripts/l2/derive.mjs"));
  const stray = (): unknown => sealDay({ out: fresh(), symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, derive: () => ({ files: [["x.tmp", ""]] }) });
  assert.throws(stray, (e: DayStop) => e.code === "stray_file"); // a derived file outside DAY_FILES is never sealed
});

// killer: scripts/l2/derive.mjs:84 CONST "Math.max(from, start)" -> "from"
test("l2_day_chain_holes_across_midnight", async () => {
  const out = fresh(); // m-5 of c1: a rupture of the amorce at 23:58, the chain resumed at 00:10 on a kept snapshot: a hole from 00:00
  anchor(out, "anchor-open.json", snap(100, [["100.00", "1"]], [["100.50", "1"]]));
  kept(out, START + 5 * MIN, snap(109, [["100.00", "1"]], [["100.50", "1"]]));
  const bad: [number, string] = [START + 20 * MIN, JSON.stringify({ stream: "btcusdt@depth@100ms", data: { E: START + 20 * MIN, U: 111, u: 111, b: "x", a: [] } })];
  await conn(out, [diff(101, 101, START - 2 * MIN), diff(105, 105, START - MIN), diff(110, 110, START + 10 * MIN), bad, diff(111, 111, START + 30 * MIN),
    diff(120, 120, START + HOUR)]); // an unreadable diff is a rupture too: 111 does not resume the chain
  ok(await seal(out), out, 4);
  assert.deepEqual((manifest(out).replay as Line).syncs, [100, 109]);
  assert.equal((manifest(out).replay as Line).start, "anchor");
  assert.deepEqual(JSON.parse(read(out, "missing.json")), { holes: [], events: [], chain_holes: [{ from_place_us: START, to_place_us: START + 10 * MIN },
    { from_place_us: START + 10 * MIN, to_place_us: null }] });
  const first = fresh(); // the first start: no anchor, no snapshot before 03:00: a hole from 00:00 to the first sync
  kept(first, START + 3 * HOUR - S, snap(200, [["100.00", "1"]], [["100.50", "1"]]));
  await conn(first, [diff(200, 200, START + 3 * HOUR), diff(201, 201, START + 3 * HOUR + S), diff(202, 202, END + 10 * S), diff(210, 210, END + 20 * S)]);
  ok(await seal(first), first, 2); // a rupture after the end of the day is not one of its holes; no minute past 23:59
  assert.deepEqual(holes(first), [{ from_place_us: START, to_place_us: START + 3 * HOUR + S }]);
  const present = minutes(first).filter((l) => l.absent === undefined);
  assert.deepEqual([minutes(first).length, present.length, present[0]!.t], [1440, 24 * 60 - 181, START + 181 * MIN]);
});

/** The day of l2_minute_place_time_strict sealed with minutes.jsonl at most `bound` bytes: its folder and the seal. */
async function strict(bound?: number): Promise<[string, unknown]> {
  const out = fresh();
  anchor(out, "anchor-open.json", snap(100, [["100.00", "1"], ["99.50", "1"]], [["101.00", "1"], ["101.37", "1"]]));
  await conn(out, [diff(101, 101, START - S), diff(102, 102, START + MIN, [["100.00", "7"]]), diff(103, 103, START + MIN + 1)]);
  return [out, await seal(out, 2, bound)];
}

// killer: scripts/l2/derive.mjs:82 ROR "size > bound" -> "size >= bound"
test("l2_minutes_bound_named", async () => {
  const [whole] = await strict(), size = statSync(join(dayDir(whole), "minutes.jsonl")).size, [at, sealed] = await strict(size);
  ok(sealed, at, 2); // G2 B-1: a bound equal to the file's size seals, written by chunks (more than one of 65 536 bytes)
  assert.ok(size > 65_536);
  assert.equal(read(at, "minutes.jsonl"), read(whole, "minutes.jsonl"));
  assert.ok(read(at, "SHA256SUMS").includes(`${createHash("sha256").update(read(at, "minutes.jsonl")).digest("hex")}  minutes.jsonl${LF}`));
  const [past, stopped] = await strict(size - 1);
  assert.equal(stopped, "minutes_bound"); // one byte less: a named stop, nothing written
  assert.equal(existsSync(join(dayDir(past), "index.jsonl")) || existsSync(join(dayDir(past), "minutes.jsonl")), false);
});

// killer: scripts/l2/derive.mjs:103 CONST "ev.U - 1" -> "ev.U - 2"
test("l2_replay_passes_stale_snapshots", async () => {
  const out = fresh(); // G2 m-1: no anchor; kept 90, then 99 = U - 2 of the first event 101..102: both stale (S4), the book never set
  kept(out, START - 30 * MIN, snap(90, [["100.00", "1"]], [["100.50", "1"]]));
  kept(out, START - 20 * MIN, snap(99, [["100.00", "1"]], [["100.50", "1"]]));
  await conn(out, [diff(101, 102, START + MIN), diff(103, 103, START + 2 * MIN), diff(104, 104, START + 3 * MIN)]);
  ok(await seal(out), out, 3);
  assert.deepEqual([manifest(out).replay, holes(out)], [{ scale: 2, start: null, syncs: [], cross_conn_ruptures: 0, minutes: { present: 0, absent: 1440 } },
    [{ from_place_us: START, to_place_us: null }]]);
  assert.ok(minutes(out).every((l) => l.absent === "chain_open"));
});

// killer: scripts/l2/derive.mjs:117 CONST "close.lid + 1" -> "close.lid + 2"
test("l2_parity_port_bounds", async () => {
  const out = fresh(); // G2 m-2: anchor-close 103; a rupture at 20:00 resumed on a kept 104, then 105..106: the book never stood at 103
  anchor(out, "anchor-open.json", OPEN);
  anchor(out, "anchor-close.json", snap(103, [["100.00", "1"]], [["100.50", "1"]]));
  kept(out, START + 19 * HOUR, snap(104, [["100.00", "2"]], [["100.50", "1"]]));
  await conn(out, [diff(101, 101, START + HOUR), diff(103, 103, START + 20 * HOUR), diff(105, 106, START + 21 * HOUR)]);
  ok(await seal(out), out, 3);
  assert.deepEqual(manifest(out).parity, { absent: "chain_open" });
  const asks: Lv[] = [["11.00", "1"], ["12.00", "1"], ["13.00", "1"]]; // the last event 102..103 ends at L = 103 exactly
  assert.deepEqual(await parity(snap(103, [["10.00", "3"], ["9.50", "2"], ["9.00", "1"], ["7.00", "1"]], asks), 103), { u: 103, since: 100, bids: 0, asks: 0 });
  assert.deepEqual(await parity(snap(200, [["10.00", "1"]], asks)), { absent: "chain_open" }); // L = 200 never reached before the end
});

// killer: scripts/l2/derive.mjs:61 COR "b === undefined || a === undefined" -> "b === undefined && a === undefined"
test("l2_minute_side_empty", async () => {
  const out = fresh(); // G2 m-3, TL-3: an empty side, named
  anchor(out, "anchor-open.json", snap(100, [["100.00", "1"]], []));
  await conn(out, [diff(101, 101, START - 30 * S), diff(102, 102, START + 30 * S)]);
  ok(await seal(out), out, 1);
  assert.deepEqual(minutes(out)[0], { t: START, u: 101, absent: "side_empty" });
});

/** The book replayed (minute 00:00) and that of createBook (P1-b2), fed the same `frames` of the day before after OPEN; the REST fake
 *  serves OPEN, then `later` (kept by b1 too), then stops; a chained event u + 1 at 00:00:01. */
async function both(frames: [number, string][], later: string[], u: number): Promise<[unknown, unknown]> {
  const out = fresh(), bodies = [OPEN, ...later];
  anchor(out, "anchor-open.json", OPEN);
  later.forEach((body, i) => kept(out, START - (10 - i) * MIN, body));
  const rest = { stopped: false, suspendedUntilUs: 0, request: (): Promise<{ body: Buffer; kept: string; sentUs: number; receivedUs: number }> => {
    const body = bodies.shift();
    rest.stopped = body === undefined;
    return body === undefined ? Promise.reject(new Error("stopped")) : Promise.resolve({ body: Buffer.from(body), kept: "", sentUs: 0, receivedUs: 0 });
  } };
  mkdirSync(join(out, "b2"));
  const book = createBook({ symbol: "BTCUSDT", out: join(out, "b2"), wallUs: () => START, monoNs: () => 0n, sleep: () => Promise.resolve(), rest });
  const cid = await conn(out, [...frames, diff(u + 1, u + 1, START + S)]);
  for (const [, text] of frames) book.feed(text, cid);
  await book.idle();
  ok(await seal(out), out, 1);
  const m = minutes(out)[0]!;
  return [m.absent === undefined ? { lastUpdateId: m.u, bids: m.bids, asks: m.asks } : null, book.levels()];
}

// killer: scripts/l2/derive.mjs:100 CONST "book.id + 1" -> "book.id + 2"
test("l2_replay_cross_guard_table", async () => {
  const at = (m: number, U: number, u: number, b: Lv[] = [], a: Lv[] = []): [number, string] => diff(U, u, START - m * MIN, b, a);
  const head = [at(9, 100, 100), at(8, 101, 102, [["100.00", "2"]])], later = [snap(105, [["100.00", "3"], ["99.80", "1"]], [["100.50", "1"]])];
  const rows: [string, [number, string][], string[], number][] = [ // G2 m-4: each row, same frames to the replay and to createBook
    ["rupture, resumed past a dropped event", [...head, at(7, 104, 104, [["99.90", "1"]]), at(6, 106, 106, [], [["100.60", "1"]])], later, 106],
    ["duplicate u = id", [...head, at(7, 102, 102, [["100.00", "2"]]), at(6, 103, 103, [], [["100.40", "1"]])], [], 103],
    ["event straddling a resume", [...head, at(7, 104, 106, [["99.90", "1"]])], later, 106]];
  for (const [name, frames, snaps, u] of rows) {
    const [replayed, b2] = await both(frames, snaps, u);
    assert.notEqual(replayed, null, name);
    assert.deepEqual(replayed, b2, name);
  }
  const p1 = await both([head[1]!], [], 102); // P1: a snapshot at U - 1 of the first event read; b2's S4 is strict: a vain try, declared
  assert.deepEqual(p1, [{ lastUpdateId: 102, bids: [["100.00", "2"]], asks: [["100.50", "1"]] }, null]);
});

// killer: scripts/l2/derive.mjs:97 SDL "hit = true;" -> ""
test("l2_refs_every_diff_read", async () => {
  const out = fresh(); // G2 m-5, P4: connection B, read after A, holds one unreadable diff of 23:55: nothing applied, yet a rupture
  anchor(out, "anchor-open.json", OPEN);
  await conn(out, [diff(101, 101, START - 10 * MIN), diff(102, 102, START + MIN), diff(103, 103, START + 2 * HOUR)]);
  const b = await conn(out, [[START - 5 * MIN, JSON.stringify({ stream: "btcusdt@depth@100ms", data: { E: START - 5 * MIN, U: 104, u: 104, b: "x", a: [] } })]]);
  ok(await seal(out), out, 2);
  assert.ok(read(out, "SHA256SUMS").split(LF).map((l) => l.slice(66)).includes(`../../../conn/${b}/20261003T23.frames`));
  assert.deepEqual([(manifest(out).replay as Line).cross_conn_ruptures, holes(out)], [1, [{ from_place_us: START + 2 * HOUR, to_place_us: null }]]); // Q-C2-9
});

// killer: scripts/l2/derive.mjs:99 ROR "ev.u < book.id" -> "ev.u <= book.id"
test("l2_chain_duplicate_is_chained", async () => {
  const out = fresh(); // A1 strict: a diff with u = id is applied (nothing changes) and carries its minutes (G2 m-5: not an equivalent)
  anchor(out, "anchor-open.json", OPEN);
  await conn(out, [diff(101, 101, START - MIN), diff(101, 101, START + 2 * MIN)]);
  ok(await seal(out), out, 1);
  assert.deepEqual((manifest(out).replay as Line).minutes, { present: 3, absent: 1437 });
});

// killer: scripts/l2/derive.mjs:84 CONST "Math.min(to, end)" -> "to"
test("l2_chain_hole_cut_to_day", async () => {
  const out = fresh(); // G2 m-6, P2: a rupture at 01:00 closed at J+1 00:00:01 on a snapshot kept at 23:59:59: the hole ends at 24:00
  anchor(out, "anchor-open.json", OPEN);
  kept(out, END - S, snap(109, [["100.00", "1"]], [["100.50", "1"]]));
  await conn(out, [diff(101, 101, START + HOUR), diff(103, 103, START + HOUR + S), diff(110, 110, END + S)]);
  ok(await seal(out), out, 2);
  assert.deepEqual(holes(out), [{ from_place_us: START, to_place_us: START + HOUR }, { from_place_us: START + HOUR, to_place_us: END }]);
  const zero = fresh(); // P6: a sync on an event of 00:00:00 sharp: a hole of zero length, minute 00:00 absent (rule kept, G7)
  kept(zero, START - 30 * MIN, OPEN);
  await conn(zero, [diff(101, 101, START), diff(102, 102, START + 90 * S)]);
  ok(await seal(zero), zero, 2);
  assert.deepEqual([holes(zero), minutes(zero).slice(0, 2).map((l) => l.absent)], [[{ from_place_us: START, to_place_us: START }], ["chain_open", undefined]]);
});

// killer: scripts/l2/day.mjs:194 COR "!DAY_FILES.includes(n) || BASE.includes(n)" -> "!DAY_FILES.includes(n)"
test("l2_derive_hook_contract", () => {
  const hook = (dv: Derived) => (): unknown => sealDay({ out: fresh(), symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, derive: () => dv });
  const forged: Derived[] = [{ files: [["anchor-open.json", "{}"]] }, { files: [["manifest.json", "{}"]] }, { manifest: { schema: "forged" } }, { missing: { holes: [] } }];
  for (const dv of forged) assert.throws(hook(dv), (e: DayStop) => e.code === "stray_file", JSON.stringify(dv)); // G2 m-7, P5: derived names only, no key overwritten
});

// killer: scripts/l2/derive.mjs:117 ROR "book.since === close.lid" -> "book.since !== close.lid"
test("l2_parity_synced_on_anchor", async () => {
  const out = fresh(), close = snap(103, [["100.00", "2"]], [["100.50", "1"]]); // G2 m-8, P7: a rupture at 23:59:20, resumed on anchor-close itself
  anchor(out, "anchor-open.json", OPEN);
  anchor(out, "anchor-close.json", close);
  kept(out, END - 30 * S, close); // kept by b1, the same bytes
  await conn(out, [diff(101, 101, START + HOUR), diff(103, 103, END - 40 * S), diff(104, 104, END - 10 * S)]);
  ok(await seal(out), out, 3);
  assert.deepEqual(manifest(out).parity, { absent: "synced_on_anchor", u: 104 }); // a trivial parity, named: not a day of 0 difference
});

// killer: scripts/l2/derive.mjs:71 ROR "scale < 0" -> "scale < -1"
test("l2_derive_bounds_closed", async () => {
  assert.equal(await seal(fresh(), -1), "bad_scale"); // G2 m-10: the low end of the scale
  const win = fresh(); // the snapshot window [start - 1 h, end): kept at start - 1 h sharp, read; kept at the end, not
  kept(win, START - HOUR, OPEN);
  kept(win, END, snap(105, [["100.00", "1"]], [["100.50", "1"]]));
  await conn(win, [diff(101, 101, START + MIN), diff(106, 107, START + 2 * MIN)]);
  ok(await seal(win), win, 2);
  assert.deepEqual((manifest(win).replay as Line).syncs, [100]);
  const ten = snap(103, [["10.00", "3"], ["9.50", "2"], ["9.00", "10"], ["7.00", "1"]], [["11.00", "1"], ["12.00", "1"]]); // "10" is not "1"
  assert.deepEqual(await parity(ten), { u: 104, since: 100, bids: 1, asks: 0 });
  const rev = fresh(); // a diff whose U > u is unreadable: a rupture
  anchor(rev, "anchor-open.json", OPEN);
  await conn(rev, [diff(101, 101, START + MIN), diff(102, 101, START + 2 * MIN), diff(102, 102, START + 3 * MIN)]);
  ok(await seal(rev), rev, 3);
  assert.deepEqual(holes(rev), [{ from_place_us: START, to_place_us: START + MIN }, { from_place_us: START + MIN, to_place_us: null }]);
});
