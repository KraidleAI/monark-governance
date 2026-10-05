// test/l2-derive.test.ts -- lot L2-P1-c2 (2026-10-05): the book of a day replayed from the raw, its minutes and its parity,
// scripts/l2/derive.mjs through the derive hook of sealDay (ADR-L2-CAPTURE-1 D-9, D-10, TL-3, TL-5; plan docs/G0-partie-l2-p1.md
// section 3 points 20 and 21; lot plan docs/G0-lot-l2-p1-c2.md). Segments are written by the writer of P1-a2 (openWriter) with an
// injected wall clock, anchors and kept snapshots by hand, under the OS temp directory (made in before(), removed after): no network, no
// place, synthetic frames whose numbers mean nothing of a market. The module is loaded by a dynamic import that each test asserts, so the
// base, which has no scripts/l2/derive.mjs, reddens by assertion. Each test names, on the line above it, the mutation that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBook } from "../scripts/l2/book.mjs";
import { DayStop, sealDay } from "../scripts/l2/day.mjs";
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
/** The seal of D with the derive hook at `scale`, or the code of its named stop. */
async function seal(out: string, scale = 2): Promise<unknown> {
  const M = await load();
  try {
    return sealDay({ out, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, derive: (ctx) => M.deriveDay({ ...ctx, scale }) });
  } catch (e) { return e instanceof DayStop ? e.code : String(e); }
}
const read = (out: string, name: string): string => readFileSync(join(dayDir(out), name), "utf8");
const minutes = (out: string): Line[] => read(out, "minutes.jsonl").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Line);
const manifest = (out: string): Line => JSON.parse(read(out, "manifest.json")) as Line;
const holes = (out: string): unknown => (JSON.parse(read(out, "missing.json")) as Line).chain_holes;
const ok = (got: unknown, out: string, n: number): void => assert.deepEqual(got, { sealed: true, dir: dayDir(out), frames: n });

// killer: scripts/l2/derive.mjs:57 ROR "WINDOW_BP * dev(p) <= b + a" -> "WINDOW_BP * dev(p) < b + a"
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

// killer: scripts/l2/derive.mjs:75 ROR "t <= E" -> "t < E"
test("l2_minute_place_time_strict", async () => {
  const out = fresh(); // b = 100.00, a = 101.00; deepest anchor levels 99.50 (99.50 bp) and 101.37 (86.56 bp): floored
  anchor(out, "anchor-open.json", snap(100, [["100.00", "1"], ["99.50", "1"]], [["101.00", "1"], ["101.37", "1"]]));
  await conn(out, [diff(101, 101, START - S), diff(102, 102, START + MIN, [["100.00", "7"]]), diff(103, 103, START + MIN + 1)]);
  ok(await seal(out), out, 2);
  const m = minutes(out), line = { u: 101, bids: [["100.00", "1"], ["99.50", "1"]], asks: [["101.00", "1"], ["101.37", "1"]], n: [2, 2], dist_bp: [99, 86] };
  assert.deepEqual(m.slice(0, 3), [{ t: START, ...line }, { t: START + MIN, ...line }, { t: START + 2 * MIN, absent: "no_later_event" }]);
  assert.equal(m.length, 1440); // an event of place time t is not in minute t; no chained event after: no stale book
  assert.deepEqual(manifest(out).replay, { scale: 2, start: "anchor", syncs: [100], minutes: { present: 2, absent: 1438 } });
  assert.deepEqual(manifest(out).parity, { absent: "anchor_missing" });
  assert.deepEqual(holes(out), []);
});

/** A day whose last event (102..104) straddles the lastUpdateId 103 of `close`, the anchor-close of D; the parity of the manifest. */
async function parity(close: string): Promise<unknown> {
  const out = fresh();
  anchor(out, "anchor-open.json", snap(100, [["10.00", "1"], ["9.00", "1"], ["7.00", "1"]], [["11.00", "1"], ["12.00", "1"]]));
  anchor(out, "anchor-close.json", close);
  await conn(out, [diff(101, 101, START + HOUR, [["9.50", "2.00"]]), diff(102, 104, END - 30 * S, [["10.00", "3"]], [["13.00", "1"]])]);
  ok(await seal(out), out, 2);
  return manifest(out).parity;
}

// killer: scripts/l2/derive.mjs:80 ROR "!== norm(" -> "=== norm("
test("l2_daily_parity_counts", async () => {
  const asks: Lv[] = [["11.00", "1"], ["12.00", "1"]]; // the anchor at 103, carried to 104 by the event that straddles it: 0 difference
  assert.deepEqual(await parity(snap(103, [["10.00", "3"], ["9.50", "2"], ["9.00", "1"], ["7.00", "1"]], asks)), { u: 104, since: 100, bids: 0, asks: 0 });
  // an altered anchor: 9.00 and 8.00 differ, 9.50 "2.0" equals "2", 7.00 lies outside its bid range [8.00; 10.00]; 12.00 differs
  const altered = snap(103, [["10.00", "3"], ["9.50", "2.0"], ["9.00", "4"], ["8.00", "1"]], [["11.00", "1"], ["12.00", "5"]]);
  assert.deepEqual(await parity(altered), { u: 104, since: 100, bids: 2, asks: 1 });
  assert.deepEqual(await parity(snap(50, [["10.00", "1"]], asks)), { absent: "chain_open" }); // the book never stood at 50
  const open = snap(100, [["10.00", "1"], ["9.00", "1"], ["7.00", "1"]], asks); // the book stood at 100: carried by 101 (U = 100 + 1)
  assert.deepEqual(await parity(open), { u: 101, since: 100, bids: 0, asks: 0 });
  assert.deepEqual(await parity("{"), { absent: "anchor_shape" });
});

const AMORCE = [diff(95, 99, START - 25 * MIN), diff(100, 100, START - 20 * MIN), diff(101, 102, START - 10 * MIN, [["100.00", "2"]]),
  diff(103, 103, START + MIN, [], [["100.50", "0"], ["100.40", "3"]]), diff(104, 104, START + 2 * MIN, [["99.90", "1"]]), diff(105, 105, START + 3 * MIN)];
const OPEN = snap(100, [["100.00", "1"]], [["100.50", "1"]]);

// killer: scripts/l2/derive.mjs:94 ROR "snaps[k].lid < ev.U - 1" -> "snaps[k].lid < ev.U"
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
  assert.deepEqual([manifest(out).replay, holes(out)], [{ scale: 2, start: "anchor", syncs: [100], minutes: { present: 4, absent: 1436 } }, []]);
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

// killer: scripts/l2/derive.mjs:76 CONST "Math.max(from, start)" -> "from"
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
