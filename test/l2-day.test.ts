// test/l2-day.test.ts -- lot L2-P1-c1 (2026-10-04): the day and its seal, scripts/l2/day.mjs (ADR-L2-CAPTURE-1 D-17, section 2.3
// point 10, TL-4 part l2_bookticker_day_rule, conditions (1) and (2) of RECHERCHES on Q-5; plan docs/G0-partie-l2-p1.md sections 3 and
// 7, D24-5; lot plan docs/G0-lot-l2-p1-c1.md). Segments are written by the writer of P1-a2 (openWriter) with an injected wall clock,
// journals by hand, under the OS temp directory (made in before(), removed after): no network, no place, synthetic frames whose numbers
// mean nothing of a market. The module is loaded by a dynamic import that each test asserts, so the base, which has no
// scripts/l2/day.mjs, reddens by assertion. Each test names, on the line above it, the mutation of scripts/l2/day.mjs that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { checkTail, cidOf, openWriter } from "../scripts/l2/segments.mjs";
import type * as DayM from "../scripts/l2/day.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-day.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-LINKS-FILE-CRASH-1)
let ROOT = "", made = 0;
before(() => { ROOT = mkdtempSync(join(tmpdir(), "l2-day-")); });
after(() => { if (ROOT !== "") rmSync(ROOT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const LF = String.fromCharCode(10), D = "2026-10-04", D1 = "2026-10-05", DAY = 86_400_000_000, GRACE = 120_000_000; // D24-5, written here
const HOUR = 3_600_000_000, S = 1_000_000, START = Date.UTC(2026, 9, 4) * 1000, END = START + DAY; // microseconds
type Line = Record<string, unknown>;

async function load(): Promise<typeof DayM> {
  const m = await import("../scripts/l2/day.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/day.mjs is absent");
}
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
/** One connection under `out`, its frames [recv_us, text] written by the writer of P1-a2 (it cuts each hour); its <cid>. */
async function conn(out: string, kind: "spot" | "market", symbol: string, frames: [number, string][]): Promise<string> {
  const cid = cidOf(kind, symbol, frames[0]![0]);
  let now = frames[0]![0];
  const w = openWriter(out, cid, { wallUs: () => now, monoNs: () => BigInt(now) * 1000n });
  for (const [us, text] of frames) { now = us; assert.equal(w.push(text), true); }
  await w.close();
  return cid;
}
const depth = (U: number, u: number, E: unknown, s = "btcusdt"): string =>
  JSON.stringify({ stream: `${s}@depth@100ms`, data: { e: "depthUpdate", E, s: s.toUpperCase(), U, u, b: [], a: [] } });
const trade = (E: number, t: number): string => JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", E, t, T: E, m: true } });
const ticker = (u: number): string => JSON.stringify({ stream: "btcusdt@bookTicker", data: { u, s: "BTCUSDT", b: "1.0", B: "2.0", a: "3.0", A: "4.0" } });
const liq = (s: string, E: number): string => JSON.stringify({ stream: `${s}@forceOrder`, data: { e: "forceOrder", E, o: { s: s.toUpperCase(), T: E } } });
/** The seal's result, or the code of its named stop. */
async function seal(out: string, symbol = "BTCUSDT", day = D, nowUs = END + GRACE + 1, closed: (cid: string, seg: string) => boolean = () => true, config = {}): Promise<unknown> {
  const M = await load();
  try { return M.sealDay({ out, symbol, day, nowUs, closed, config }); } catch (e) { return e instanceof M.DayStop ? e.code : String(e); }
}
const dir = (out: string, symbol: string, day: string): string => join(out, "days", symbol, day);
const read = (out: string, symbol: string, day: string, name: string): string =>
  (existsSync(join(dir(out, symbol, day), name)) ? readFileSync(join(dir(out, symbol, day), name), "utf8") : "");
const index = (out: string, symbol = "BTCUSDT", day = D): Line[] =>
  read(out, symbol, day, "index.jsonl").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Line);
const sha = (b: Buffer): string => createHash("sha256").update(b).digest("hex");
const at = (cid: string, seg: string, rank: number, stream: string | null, mark: Line = {}): Line => ({ stream, cid, seg, rank, ...mark });
const [DEPTH, TRADE, TICKER] = ["btcusdt@depth@100ms", "btcusdt@trade", "btcusdt@bookTicker"];

// killer: scripts/l2/day.mjs:183 CONST "segmentOf(start - PERIOD_US)" -> "segmentOf(start)"
test("l2_day_index_by_event_time", async () => {
  const out = fresh();
  const a = await conn(out, "spot", "BTCUSDT", [[START - 30 * 60 * S, depth(1, 2, START + 5)], [START - 20 * 60 * S, trade(START - 1, 7)],
    [END - 5 * HOUR / 2, trade(END + 10 * 60 * S, 10)], [END - HOUR, trade(END - 1, 8)], [END + S, depth(3, 4, END)], [END + 2 * S, trade(END - 2, 9)]]);
  await conn(out, "spot", "ETHUSDT", [[START + HOUR, depth(1, 2, START + HOUR, "ethusdt")]]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 4 }); // E 1 h past its reception: early (G2 B-3)
  assert.deepEqual(index(out), [at(a, "20261003T23", 0, DEPTH), at(a, "20261004T21", 0, TRADE, { mark: "early", of: D1 }),
    at(a, "20261004T23", 0, TRADE), at(a, "20261005T00", 1, TRADE)]);
  assert.equal((JSON.parse(read(out, "BTCUSDT", D, "manifest.json")) as { counts: Line }).counts.early, 1);
  assert.deepEqual(await seal(out, "BTCUSDT", "2026-10-03"), { sealed: true, dir: dir(out, "BTCUSDT", "2026-10-03"), frames: 1 });
  assert.deepEqual(index(out, "BTCUSDT", "2026-10-03"), [at(a, "20261003T23", 1, TRADE)]);
  assert.deepEqual(await seal(out, "BTCUSDT", D1, END + DAY + GRACE + 1), { sealed: true, dir: dir(out, "BTCUSDT", D1), frames: 1 });
  assert.deepEqual(index(out, "BTCUSDT", D1), [at(a, "20261005T00", 0, DEPTH)]);
});

// killer: scripts/l2/day.mjs:151 ROR "diffs.a[lo * 3] <= u" -> "diffs.a[lo * 3] < u"
test("l2_bookticker_day_rule", async () => {
  const out = fresh(), recv = { mark: "recv_day" };
  const a = await conn(out, "spot", "BTCUSDT", [[START + HOUR, ticker(5)], [END - S, depth(10, 20, END - 2)], [END + S, ticker(10)],
    [END + 2 * S, ticker(20)], [END + 3 * S, depth(21, 30, END + 5)], [END + 4 * S, ticker(25)], [END + 5 * S, ticker(35)],
    [END + 6 * S, depth(40, 50, END + 6)]]);
  const b = await conn(out, "spot", "BTCUSDT", [[END + 7 * S, ticker(15)]]); // a connection without diffs: its reception day
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 4 });
  assert.deepEqual(index(out), [at(a, "20261004T01", 0, TICKER, recv), at(a, "20261005T00", 0, TICKER), at(a, "20261005T00", 1, TICKER),
    at(a, "20261004T23", 0, DEPTH)]);
  assert.deepEqual(await seal(out, "BTCUSDT", D1, END + DAY + GRACE + 1), { sealed: true, dir: dir(out, "BTCUSDT", D1), frames: 5 });
  assert.deepEqual(index(out, "BTCUSDT", D1), [at(a, "20261005T00", 3, TICKER), at(a, "20261005T00", 4, TICKER, recv),
    at(b, "20261005T00", 0, TICKER, recv), at(a, "20261005T00", 2, DEPTH), at(a, "20261005T00", 5, DEPTH)]);
});

// killer: scripts/l2/day.mjs:135 ROR "recv > end" -> "recv >= end"
test("l2_day_late_frame_marked", async () => {
  const out = fresh(), j = (us: number, cid: string | null, event: string): Line => ({ host_us: us, mono_ns: "1", symbol: cid === null ? "ALL" : "BTCUSDT", cid, event });
  const a = await conn(out, "spot", "BTCUSDT", [[END + GRACE, depth(1, 1, START + HOUR)], [END + GRACE + 1, depth(2, 2, START + 13 * HOUR)]]); // `of` after noon
  const b = await conn(out, "spot", "BTCUSDT", [[END + HOUR, trade(END + HOUR, 1)], [END - 10 * 60 * S, trade(END - 10 * 60 * S, 2)], // G2 bis R-1: the
    [END + 2 * HOUR, trade(END + 2 * HOUR, 3)]]); // clock stepped back 2 h on a live connection: a frame of J in segment J+1 01, read at J+1 only
  writeFileSync(join(out, "journal.jsonl"), [j(END, a, "open"), j(END + HOUR, b, "open"), j(END + 3 * HOUR, null, "start")].map((l) => JSON.stringify(l) + LF).join(""));
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 1 });
  assert.deepEqual(index(out), [at(a, "20261005T00", 0, DEPTH)]);
  assert.deepEqual(await seal(out, "BTCUSDT", D1, END + DAY + GRACE + 1), { sealed: true, dir: dir(out, "BTCUSDT", D1), frames: 4 });
  assert.deepEqual(index(out, "BTCUSDT", D1), [at(a, "20261005T00", 1, DEPTH, { mark: "late", of: D }), at(b, "20261005T01", 0, TRADE),
    at(b, "20261005T01", 1, TRADE, { mark: "late", of: D }), at(b, "20261005T02", 0, TRADE)]);
  assert.deepEqual((JSON.parse(read(out, "BTCUSDT", D1, "manifest.json")) as Line).counts, { streams: { [DEPTH]: 1, [TRADE]: 3 }, late: 2, early: 0, recv_day: 0 });
  assert.deepEqual((JSON.parse(read(out, "BTCUSDT", D1, "missing.json")) as Line).holes, [{ link: "BTCUSDT", cid: null, cause: "process_restart",
    from_us: END + 2 * HOUR, from_src: "frame", to_us: null, to_src: null }]); // G2 bis m-1: a and b dead at the start (D-8 overlap); b's last frame, in its last segment
});

// killer: scripts/l2/day.mjs:182 ROR "!(nowUs > end + GRACE_US)" -> "!(nowUs >= end + GRACE_US)"
test("l2_day_seal_waits_grace_and_segments", async () => {
  const out = fresh();
  const a = await conn(out, "spot", "BTCUSDT", [[START + HOUR, depth(1, 1, START + HOUR)], [START + 13 * HOUR, ticker(5)]]); // after noon
  const m = await conn(out, "market", "ALL", [[START + 13 * HOUR, liq("btcusdt", 1)], [START + 13 * HOUR + 1, liq("ethusdt", 2)],
    [START + 13 * HOUR + 2, JSON.stringify({ e: "serverShutdown", E: 3 })]]); // no stream: each symbol; received after noon (G2 bis m-3)
  await conn(out, "market", "ALL", [[START + 3 * HOUR, liq("ethusdt", 4)]]); // G2 bis m-2: read for BTCUSDT, unused, not in its SHA256SUMS
  assert.deepEqual(await seal(out, "BTCUSDT", D, END + GRACE), { sealed: false, wait: "grace" });
  assert.deepEqual(await seal(out, "BTCUSDT", D, END + GRACE + 1, (cid) => cid !== m), { sealed: false, wait: "segments", open: [`${m}/20261004T13`] });
  assert.equal(existsSync(join(out, "days")), false);
  for (const [symbol, day, code] of [["../x", D, "bad_symbol"], ["BTCUSDT", "2026-02-30", "bad_day"], ["BTCUSDT", "2026-2-03", "bad_day"]]) {
    assert.equal(await seal(out, symbol, day), code);
  }
  mkdirSync(dir(out, "BTCUSDT", D), { recursive: true });
  writeFileSync(join(dir(out, "BTCUSDT", D), "stray.tmp"), "");
  assert.equal(await seal(out), "stray_file"); // G2 m-7: a residue is never sealed
  rmSync(join(dir(out, "BTCUSDT", D), "stray.tmp"));
  writeFileSync(join(dir(out, "BTCUSDT", D), "anchor-close.json"), "{}" + LF); // Q-C1-7: an anchor of c5, sealed with the day
  const tmp = join(out, "days", "BTCUSDT", `.${D}.SHA256SUMS.tmp`);
  writeFileSync(tmp, "cut"); // G2 bis m-4: a cut before the link leaves the day unsealed; the next seal rewrites the whole file
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 4 });
  assert.equal(existsSync(tmp), false);
  assert.deepEqual(index(out), [at(a, "20261004T13", 0, TICKER, { mark: "recv_day" }), at(a, "20261004T01", 0, DEPTH),
    at(m, "20261004T13", 0, "btcusdt@forceOrder", { mark: "recv_day" }), at(m, "20261004T13", 2, null, { mark: "recv_day" })]);
  const sums = read(out, "BTCUSDT", D, "SHA256SUMS");
  const rows = sums.split(LF).filter((l) => l !== "").map((l) => /^([0-9a-f]{64}) {2}(\S+)$/.exec(l)!);
  const segs = [`${a}/20261004T01`, `${a}/20261004T13`, `${m}/20261004T13`].flatMap((g) => [".frames", ".index.jsonl"].map((x) => `../../../conn/${g}${x}`));
  assert.deepEqual(rows.map((r) => r[2]), [...segs, "anchor-close.json", "index.jsonl", "manifest.json", "missing.json"].sort());
  for (const r of rows) assert.equal(r[1], sha(readFileSync(join(dir(out, "BTCUSDT", D), r[2]!))), r[2]);
  assert.deepEqual(await seal(out, "ETHUSDT"), { sealed: true, dir: dir(out, "ETHUSDT", D), frames: 3 });
  assert.match(read(out, "ETHUSDT", D, "SHA256SUMS"), new RegExp(`  ../../../conn/${m}/20261004T13.frames${LF}`));
  assert.equal(await seal(out), "day_sealed");
  assert.equal(read(out, "BTCUSDT", D, "SHA256SUMS"), sums);
});

// killer: scripts/l2/day.mjs:105 CONST "open.size === 0" -> "open.size >= 0"
test("l2_day_missing_from_journal_and_chain", async () => {
  const out = fresh(), h = (k: number): number => START + k * (HOUR / 2);
  const q = await conn(out, "spot", "BTCUSDT", [[START + HOUR, depth(1, 1, START + HOUR)]]), qi = join(out, "conn", q, "20261004T01.index.jsonl");
  appendFileSync(qi, '{"rank":1,"off'); // a truncated line: the tail that c5 marks at its start (Q-C1-4), read under its mark
  const j = (us: number, symbol: string, cid: string | null, event: string, f: Line = {}): Line => ({ host_us: us, mono_ns: "1", symbol, cid, event, ...f });
  const lines = [j(h(-6), "BTCUSDT", "z", "open"), j(h(-4), "BTCUSDT", "z", "close", { cause: "watchdog" }), j(h(0), "BTCUSDT", "a", "open"),
    j(h(-2), "ALL", "m", "open"), j(h(-1), "BTCUSDT", "a", "chain_gap", { reason: "gap" }), j(h(1), "BTCUSDT", "b", "open"),
    j(h(1) + 1, "BTCUSDT", "a", "close", { cause: "renewed" }), j(h(2), "BTCUSDT", "b", "ping", { bytes: 1 }),
    j(h(2), "BTCUSDT", "b", "close", { cause: "watchdog" }), j(h(2) + 1, "BTCUSDT", null, "retry", { delay_ms: 1000 }),
    j(h(2) + S, "BTCUSDT", "c", "open"), j(h(3), "BTCUSDT", "c", "chain_gap", { reason: "gap", U: 9 }),
    j(h(3) + 1, "BTCUSDT", "c", "sync_try_vain", { reason: "snapshot_before_buffer", try: 1 }), j(h(3), "ETHUSDT", "e", "chain_gap"),
    j(h(4), "ALL", "m", "close", { cause: "closed" }), j(h(6), "ALL", null, "start"), j(h(6) + 1, "BTCUSDT", q, "tail_marked", { ...checkTail(out, q, "20261004T01")! }),
    j(h(6) + S, "BTCUSDT", "d", "open"), j(h(7), "BTCUSDT", "d", "close", { cause: "watchdog" }), j(h(8), "BTCUSDT", "f", "open"),
    j(END, "BTCUSDT", "f", "chain_gap"), j(START, "BTCUSDT", "y", "chain_gap"), j(END, "BTCUSDT", "f", "close", { cause: "watchdog" })];
  writeFileSync(join(out, "journal.jsonl"), lines.map((l) => JSON.stringify(l) + LF).join(""));
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 1 });
  assert.deepEqual(JSON.parse(read(out, "BTCUSDT", D, "missing.json")), { // c open at the start (Q-C1-10): a hole, and d's after it
    holes: [{ link: "BTCUSDT", cid: "b", cause: "watchdog", from_us: h(2), from_src: "journal", to_us: h(2) + S, to_src: "journal" },
      { link: "ALL", cid: "m", cause: "closed", from_us: h(4), from_src: "journal", to_us: null, to_src: null },
      { link: "BTCUSDT", cid: null, cause: "process_restart", from_us: h(3) + 1, from_src: "journal", to_us: h(6) + S, to_src: "journal" },
      { link: "BTCUSDT", cid: "d", cause: "watchdog", from_us: h(7), from_src: "journal", to_us: h(8), to_src: "journal" }],
    events: [lines[11], lines[12], lines[16], lines[21]] });
});

// killer: scripts/l2/day.mjs:106 CONST "edgeOf(out, l.cid, true) ?? l.host_us" -> "l.host_us"
test("l2_day_hole_bounds_from_frames", async () => {
  const out = fresh(), t = START + HOUR, j = (us: number, cid: string, event: string, f: Line = {}): Line => ({ host_us: us, mono_ns: "1", symbol: "BTCUSDT", cid, event, ...f });
  const x = await conn(out, "spot", "BTCUSDT", [[t, depth(1, 1, t)], [t + 10 * S, depth(2, 2, t)]]);
  const y = await conn(out, "spot", "BTCUSDT", [[t + 80 * S, depth(3, 3, t)], [t + 90 * S, depth(4, 4, t)]]);
  const lines = [j(t - S, x, "open"), j(t + 70 * S, x, "close", { cause: "watchdog" }), j(t + 75 * S, y, "open"), { ...j(t + HOUR, "", "start"), symbol: "ALL", cid: null },
    j(t + HOUR + S, "g", "open")]; // ADR "watchdog": from the last frame received to the first of the new connection
  writeFileSync(join(out, "journal.jsonl"), lines.map((l) => JSON.stringify(l) + LF).join(""));
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 4 });
  assert.deepEqual((JSON.parse(read(out, "BTCUSDT", D, "missing.json")) as Line).holes, [{ link: "BTCUSDT", cid: x, cause: "watchdog", from_us: t + 10 * S, from_src: "frame", to_us: t + 80 * S,
    to_src: "frame" }, { link: "BTCUSDT", cid: null, cause: "process_restart", from_us: t + 90 * S, from_src: "frame", to_us: t + HOUR + S, to_src: "journal" }]);
});

// killer: scripts/l2/day.mjs:165 CONST "const us = data?.E;" -> "const us = data?.E < 1e14 ? data?.E * 1000 : data?.E;"
test("l2_manifest_time_unit_per_source", async () => {
  const out = fresh(), ms = Date.UTC(2026, 9, 4, 1); // a time of a millisecond magnitude: read in microseconds all the same
  const a = await conn(out, "spot", "BTCUSDT", [[START + HOUR, depth(1, 1, ms)]]);
  const m = await conn(out, "market", "ALL", [[START + 2 * HOUR, liq("btcusdt", ms)]]);
  assert.deepEqual(await seal(out, "BTCUSDT", D, END + GRACE + 1, () => true, { probe: 1 }), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 2 });
  assert.deepEqual(index(out), [at(a, "20261004T01", 0, DEPTH, { mark: "late", of: "1970-01-21" }), at(m, "20261004T02", 0, "btcusdt@forceOrder", { mark: "recv_day" })]);
  const man = JSON.parse(read(out, "BTCUSDT", D, "manifest.json")) as Line, mods = ["book", "day", "links", "rest", "segments"];
  const shas = Object.fromEntries(mods.map((x) => [`scripts/l2/${x}.mjs`, sha(readFileSync(join(import.meta.dirname, "..", "scripts", "l2", `${x}.mjs`)))]));
  assert.deepEqual(man, { schema: "monark.l2.binance.v1", symbol: "BTCUSDT", day: D, redistributable: false, time_unit: { spot: "us", market: null },
    grace_us: GRACE, period_us: HOUR, sampling: { stream: "forceOrder", per_symbol_ms: 1000, kept: "largest" },
    keys: { "depth@100ms": "U,u", bookTicker: "u", trade: "t", forceOrder: "bytes", order: "key,bytes" }, node: process.version,
    undici: process.versions.undici, script_sha256: shas, config: { probe: 1 },
    counts: { streams: { "btcusdt@forceOrder": 1, [DEPTH]: 1 }, late: 1, early: 0, recv_day: 1 } });
});

// killer: scripts/l2/day.mjs:166 SDL "if (!Number.isSafeInteger(us)) stop(\"place_time_unsafe\"" -> ""
test("l2_place_time_unsafe_integer_named_stop", async () => {
  for (const E of ["1.5", "9007199254740993", "\"123\""]) {
    const out = fresh(), bad = `{"stream":"btcusdt@trade","data":{"e":"trade","E":${E},"t":1}}`;
    const a = await conn(out, "spot", "BTCUSDT", [[START + HOUR, depth(1, 1, START + HOUR)], [START + HOUR + 1, bad]]);
    await conn(out, "spot", "ETHUSDT", [[START + HOUR, depth(1, 1, START + HOUR, "ethusdt")]]);
    const raw = join(out, "conn", a, "20261004T01.frames"), before = readFileSync(raw);
    const M = await load();
    let got: unknown = null;
    try { M.sealDay({ out, symbol: "BTCUSDT", day: D, nowUs: END + GRACE + 1, closed: () => true }); } catch (e) { got = e; }
    assert.ok(got instanceof M.DayStop, E);
    assert.deepEqual([got.code, got.detail], ["place_time_unsafe", { symbol: "BTCUSDT", cid: a, seg: "20261004T01", rank: 1 }]);
    assert.equal(existsSync(dir(out, "BTCUSDT", D)), false);
    assert.deepEqual(readFileSync(raw), before);
    assert.deepEqual(await seal(out, "ETHUSDT"), { sealed: true, dir: dir(out, "ETHUSDT", D), frames: 1 });
  }
});

// killer: scripts/l2/day.mjs:131 ROR "held + n > bound" -> "held + n >= bound"
test("l2_day_index_bound_named_stop", async () => { // G2 B-2: past the bound, a named stop; below it, an index written and hashed by chunks
  const out = fresh(), n = 2000, frames: [number, string][] = [];
  for (let k = 0; k < n; k += 1) frames.push([START + HOUR + k * 1000, k % 2 === 0 ? depth(k, k, START + HOUR) : trade(START + HOUR, k)]);
  const a = await conn(out, "spot", "BTCUSDT", frames), M = await load(), spec = { out, symbol: "BTCUSDT", day: D, nowUs: END + GRACE + 1, closed: () => true };
  assert.equal(M.INDEX_BOUND, 4_194_304); // G2 bis R-2: a day of 99.9 % bookTicker at the bound stays under MemoryMax=512M (G7)
  const j = (us: number, cid: string, event: string, f: Line = {}): Line => ({ host_us: us, mono_ns: "1", symbol: "BTCUSDT", cid, event, ...f });
  writeFileSync(join(out, "journal.jsonl"), [j(START, a, "open"), j(START + 2 * HOUR, a, "close", { cause: "watchdog" }), j(START + 3 * HOUR, "g", "open")]
    .map((l) => JSON.stringify(l) + LF).join("")); // G2 bis m-1: an index of about 150 KiB, its last frame read in its tail
  assert.throws(() => M.sealDay({ ...spec, bound: n - 1 }), (e: unknown) => e instanceof M.DayStop && e.code === "index_bound");
  assert.equal(existsSync(dir(out, "BTCUSDT", D)), false);
  assert.deepEqual(M.sealDay({ ...spec, bound: n }), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: n });
  const ranks = [...Array(n).keys()];
  assert.deepEqual(index(out), [...ranks.filter((k) => k % 2 === 0).map((k) => at(a, "20261004T01", k, DEPTH)), ...ranks.filter((k) => k % 2 === 1).map((k) => at(a, "20261004T01", k, TRADE))]);
  for (const r of read(out, "BTCUSDT", D, "SHA256SUMS").split(LF).filter((l) => l !== "").map((l) => l.split("  "))) {
    assert.equal(r[0], sha(readFileSync(join(dir(out, "BTCUSDT", D), r[1]!))), r[1]);
  }
  assert.deepEqual((JSON.parse(read(out, "BTCUSDT", D, "missing.json")) as Line).holes, [{ link: "BTCUSDT", cid: a, cause: "watchdog",
    from_us: START + HOUR + (n - 1) * 1000, from_src: "frame", to_us: START + 3 * HOUR, to_src: "journal" }]);
  const o = fresh(); // G2 bis R-2: bookTickers pending on their connection (here for J+1) count in the bound
  await conn(o, "spot", "BTCUSDT", [[END + S, ticker(1)], [END + 2 * S, ticker(2)]]);
  assert.throws(() => M.sealDay({ ...spec, out: o, bound: 1 }), (e: unknown) => e instanceof M.DayStop && e.code === "index_bound");
});

// killer: scripts/l2/day.mjs:106 CONST "us === null ? \"journal\" : \"frame\"" -> "\"frame\""
test("l2_day_hole_bound_source_named", async () => { // Q-G2-4 (condition of MONARK): each bound of a hole names its source, frame or journal
  const out = fresh(), t = START + HOUR, j = (us: number, cid: string, event: string, f: Line = {}): Line => ({ host_us: us, mono_ns: "1", symbol: "BTCUSDT", cid, event, ...f });
  const x = await conn(out, "spot", "BTCUSDT", [[t, depth(1, 1, t)], [t + 10 * S, depth(2, 2, t)]]);
  const y = await conn(out, "spot", "BTCUSDT", [[t + 90 * S, depth(3, 3, t)], [t + 100 * S, depth(4, 4, t)]]);
  const z = await conn(out, "spot", "BTCUSDT", [[t + 3 * HOUR + 10 * S, depth(5, 5, t + 3 * HOUR)]]); // "g", "h" and "k": no frame on disk
  const all = (us: number): Line => ({ host_us: us, mono_ns: "1", symbol: "ALL", cid: null, event: "start" });
  const lines = [j(t - S, x, "open"), j(t + 70 * S, x, "close", { cause: "watchdog" }), j(t + 75 * S, "g", "open"), j(t + 80 * S, "g", "close", { cause: "watchdog" }),
    j(t + 85 * S, y, "open"), all(t + HOUR), j(t + HOUR + S, "h", "open"), j(t + 2 * HOUR, "k", "open"), all(t + 3 * HOUR), j(t + 3 * HOUR + S, z, "open")];
  writeFileSync(join(out, "journal.jsonl"), lines.map((l) => JSON.stringify(l) + LF).join(""));
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 5 });
  assert.deepEqual((JSON.parse(read(out, "BTCUSDT", D, "missing.json")) as Line).holes, [
    { link: "BTCUSDT", cid: x, cause: "watchdog", from_us: t + 10 * S, from_src: "frame", to_us: t + 75 * S, to_src: "journal" },
    { link: "BTCUSDT", cid: "g", cause: "watchdog", from_us: t + 80 * S, from_src: "journal", to_us: t + 90 * S, to_src: "frame" },
    { link: "BTCUSDT", cid: null, cause: "process_restart", from_us: t + 100 * S, from_src: "frame", to_us: t + HOUR + S, to_src: "journal" },
    { link: "BTCUSDT", cid: null, cause: "process_restart", from_us: t + 2 * HOUR, from_src: "journal", to_us: t + 3 * HOUR + 10 * S, to_src: "frame" }]);
});

// killer: scripts/l2/day.mjs:211 SDL "sync();" -> ""
test("l2_day_folder_fsync_per_platform", async () => { // the day folder is synced twice, opened "r" (POSIX) or "r+" (win32: "r" fails EPERM, measured)
  const M = await load(), fs = createRequire(import.meta.url)("node:fs") as typeof import("node:fs"), real = { open: fs.openSync, fsync: fs.fsyncSync };
  const host = process.platform, desc = Object.getOwnPropertyDescriptor(process, "platform")!;
  const run = async (platform: string): Promise<unknown[]> => { // the folder's opens, by flag, that were fsynced; "r+" on a POSIX host opened "r"
    const out = fresh(), d = dir(out, "BTCUSDT", D), fds = new Map<number, string>(), synced: string[] = [];
    await conn(out, "spot", "BTCUSDT", [[START + HOUR, depth(1, 1, START + HOUR)]]);
    fs.openSync = ((p: string, f: string, m?: number) => {
      const fd = real.open(p, p === d && f === "r+" && host !== "win32" ? "r" : f, m);
      if (p === d) fds.set(fd, f); else fds.delete(fd);
      return fd;
    }) as typeof fs.openSync;
    fs.fsyncSync = (fd: number) => { real.fsync(fd); const f = fds.get(fd); fds.delete(fd); if (f !== undefined) synced.push(f); };
    Object.defineProperty(process, "platform", { ...desc, value: platform });
    syncBuiltinESMExports();
    try { return [M.sealDay({ out, symbol: "BTCUSDT", day: D, nowUs: END + GRACE + 1, closed: () => true }), ...synced]; } finally {
      Object.defineProperty(process, "platform", desc);
      [fs.openSync, fs.fsyncSync] = [real.open, real.fsync];
      syncBuiltinESMExports();
    }
  };
  const sealed = (out: unknown[]): unknown => (out[0] as { sealed: boolean }).sealed;
  const flag = host === "win32" ? "r+" : "r", own = await run(host);
  assert.deepEqual([sealed(own), ...own.slice(1)], [true, flag, flag]); // the host's own path, unchanged on Linux
  if (host !== "win32") { const win = await run("win32"); assert.deepEqual([sealed(win), ...win.slice(1)], [true, "r+", "r+"]); }
});
