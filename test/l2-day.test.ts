// test/l2-day.test.ts -- lot L2-P1-c1 (2026-10-04): the day and its seal, scripts/l2/day.mjs (ADR-L2-CAPTURE-1 D-17, section 2.3
// point 10, TL-4 part l2_bookticker_day_rule, conditions (1) and (2) of RECHERCHES on Q-5; plan docs/G0-partie-l2-p1.md sections 3 and
// 7, D24-5; lot plan docs/G0-lot-l2-p1-c1.md). Segments are written by the writer of P1-a2 (openWriter) with an injected wall clock,
// journals by hand, under the OS temp directory (made in before(), removed after): no network, no place, synthetic frames whose numbers
// mean nothing of a market. The module is loaded by a dynamic import that each test asserts, so the base, which has no
// scripts/l2/day.mjs, reddens by assertion. Each test names, on the line above it, the mutation of scripts/l2/day.mjs that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cidOf, openWriter } from "../scripts/l2/segments.mjs";
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
const at = (cid: string, seg: string, rank: number, stream: string, mark: Line = {}): Line => ({ stream, cid, seg, rank, ...mark });
const [DEPTH, TRADE, TICKER] = ["btcusdt@depth@100ms", "btcusdt@trade", "btcusdt@bookTicker"];

// killer: scripts/l2/day.mjs:130 CONST "segmentOf(start - PERIOD_US)" -> "segmentOf(start)"
test("l2_day_index_by_event_time", async () => {
  const out = fresh();
  const a = await conn(out, "spot", "BTCUSDT", [[START - 30 * 60 * S, depth(1, 2, START + 5)], [START - 20 * 60 * S, trade(START - 1, 7)],
    [END - HOUR, trade(END - 1, 8)], [END + S, depth(3, 4, END)], [END + 2 * S, trade(END - 2, 9)]]);
  await conn(out, "spot", "ETHUSDT", [[START + HOUR, depth(1, 2, START + HOUR, "ethusdt")]]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 3 });
  assert.deepEqual(index(out), [at(a, "20261003T23", 0, DEPTH), at(a, "20261004T23", 0, TRADE), at(a, "20261005T00", 1, TRADE)]);
  assert.deepEqual(await seal(out, "BTCUSDT", "2026-10-03"), { sealed: true, dir: dir(out, "BTCUSDT", "2026-10-03"), frames: 1 });
  assert.deepEqual(index(out, "BTCUSDT", "2026-10-03"), [at(a, "20261003T23", 1, TRADE)]);
  assert.deepEqual(await seal(out, "BTCUSDT", D1, END + DAY + GRACE + 1), { sealed: true, dir: dir(out, "BTCUSDT", D1), frames: 1 });
  assert.deepEqual(index(out, "BTCUSDT", D1), [at(a, "20261005T00", 0, DEPTH)]);
});

// killer: scripts/l2/day.mjs:118 ROR "list[lo][0] <= f.u" -> "list[lo][0] < f.u"
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

// killer: scripts/l2/day.mjs:137 ROR "f.recv > (f.dn + 1) * DAY_US + GRACE_US" -> "f.recv >= (f.dn + 1) * DAY_US + GRACE_US"
test("l2_day_late_frame_marked", async () => {
  const out = fresh();
  const a = await conn(out, "spot", "BTCUSDT", [[END + GRACE, depth(1, 1, START + HOUR)], [END + GRACE + 1, depth(2, 2, START + 2 * HOUR)]]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 1 });
  assert.deepEqual(index(out), [at(a, "20261005T00", 0, DEPTH)]);
  assert.deepEqual(await seal(out, "BTCUSDT", D1, END + DAY + GRACE + 1), { sealed: true, dir: dir(out, "BTCUSDT", D1), frames: 1 });
  assert.deepEqual(index(out, "BTCUSDT", D1), [at(a, "20261005T00", 1, DEPTH, { mark: "late", of: D })]);
  assert.deepEqual((JSON.parse(read(out, "BTCUSDT", D1, "manifest.json")) as Line).counts, { streams: { [DEPTH]: 1 }, late: 1, recv_day: 0 });
});

// killer: scripts/l2/day.mjs:129 ROR "!(nowUs > end + GRACE_US)" -> "!(nowUs >= end + GRACE_US)"
test("l2_day_seal_waits_grace_and_segments", async () => {
  const out = fresh();
  const a = await conn(out, "spot", "BTCUSDT", [[START + HOUR, depth(1, 1, START + HOUR)]]);
  const m = await conn(out, "market", "ALL", [[START + 2 * HOUR, liq("btcusdt", 1)], [START + 2 * HOUR + 1, liq("ethusdt", 2)]]);
  assert.deepEqual(await seal(out, "BTCUSDT", D, END + GRACE), { sealed: false, wait: "grace" });
  assert.deepEqual(await seal(out, "BTCUSDT", D, END + GRACE + 1, (cid) => cid !== m), { sealed: false, wait: "segments", open: [`${m}/20261004T02`] });
  assert.equal(existsSync(join(out, "days")), false);
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 2 });
  const sums = read(out, "BTCUSDT", D, "SHA256SUMS");
  const rows = sums.split(LF).filter((l) => l !== "").map((l) => /^([0-9a-f]{64}) {2}(\S+)$/.exec(l)!);
  const segs = [a, a, m, m].map((c, k) => `../../../conn/${c}/${c === a ? "20261004T01" : "20261004T02"}${k % 2 === 0 ? ".frames" : ".index.jsonl"}`);
  assert.deepEqual(rows.map((r) => r[2]), [...segs, "index.jsonl", "manifest.json", "missing.json"].sort());
  for (const r of rows) assert.equal(r[1], sha(readFileSync(join(dir(out, "BTCUSDT", D), r[2]!))), r[2]);
  assert.deepEqual(await seal(out, "ETHUSDT"), { sealed: true, dir: dir(out, "ETHUSDT", D), frames: 1 });
  assert.match(read(out, "ETHUSDT", D, "SHA256SUMS"), new RegExp(`  ../../../conn/${m}/20261004T02.frames${LF}`));
  assert.equal(await seal(out), "day_sealed");
  assert.equal(read(out, "BTCUSDT", D, "SHA256SUMS"), sums);
});

// killer: scripts/l2/day.mjs:67 CONST "open.size === 0" -> "open.size >= 0"
test("l2_day_missing_from_journal_and_chain", async () => {
  const out = fresh(), h = (k: number): number => START + k * (HOUR / 2), tail = { seg: "20261004T01", ranks: 1, causes: ["truncated_line"] };
  const j = (us: number, symbol: string, cid: string | null, event: string, f: Line = {}): Line => ({ host_us: us, mono_ns: "1", symbol, cid, event, ...f });
  const lines = [j(h(-6), "BTCUSDT", "z", "open"), j(h(-4), "BTCUSDT", "z", "close", { cause: "watchdog" }), j(h(-2), "BTCUSDT", "a", "open"),
    j(h(-2), "ALL", "m", "open"), j(h(-1), "BTCUSDT", "a", "chain_gap", { reason: "gap" }), j(h(1), "BTCUSDT", "b", "open"),
    j(h(1) + 1, "BTCUSDT", "a", "close", { cause: "renewed" }), j(h(2), "BTCUSDT", "b", "ping", { bytes: 1 }),
    j(h(2), "BTCUSDT", "b", "close", { cause: "watchdog" }), j(h(2) + 1, "BTCUSDT", null, "retry", { delay_ms: 1000 }),
    j(h(2) + S, "BTCUSDT", "c", "open"), j(h(3), "BTCUSDT", "c", "chain_gap", { reason: "gap", U: 9 }),
    j(h(3) + 1, "BTCUSDT", "c", "sync_try_vain", { reason: "snapshot_before_buffer", try: 1 }), j(h(3), "ETHUSDT", "e", "chain_gap"),
    j(h(4), "ALL", "m", "close", { cause: "closed" }), j(h(5), "BTCUSDT", "q", "tail_marked", tail), j(END, "BTCUSDT", "c", "chain_gap")];
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "journal.jsonl"), lines.map((l) => JSON.stringify(l) + LF).join(""));
  assert.deepEqual(await seal(out), { sealed: true, dir: dir(out, "BTCUSDT", D), frames: 0 });
  assert.deepEqual(JSON.parse(read(out, "BTCUSDT", D, "missing.json")), {
    holes: [{ link: "BTCUSDT", cid: "b", cause: "watchdog", from_us: h(2), to_us: h(2) + S }, { link: "ALL", cid: "m", cause: "closed", from_us: h(4), to_us: null }],
    events: [lines[11], lines[12], lines[15]] });
});

// killer: scripts/l2/day.mjs:103 CONST "const us = data?.E;" -> "const us = data?.E < 1e14 ? data?.E * 1000 : data?.E;"
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
    counts: { streams: { "btcusdt@forceOrder": 1, [DEPTH]: 1 }, late: 1, recv_day: 1 } });
});

// killer: scripts/l2/day.mjs:104 SDL "if (!Number.isSafeInteger(us)) stop(\"place_time_unsafe\"" -> ""
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
