// test/l2-canon.test.ts -- lot L2-P1-c3 (2026-10-05): the two canonical digests of each stream of a day, their keys, the trade id jumps
// and the crosschecks of @bookTicker with the diffs, scripts/l2/canon.mjs through the derive hook of sealDay (ADR-L2-CAPTURE-1 D-20 and
// its dated amendment, Q-P1-9; plan docs/G0-partie-l2-p1.md section 9; lot plan docs/G0-lot-l2-p1-c3.md). Segments are written by the
// writer of P1-a2 (openWriter) with an injected wall clock, the anchor by hand, under the OS temp directory (made in before(), removed
// after): no network, no place, synthetic frames whose numbers mean nothing of a market. The module is loaded by a dynamic import that
// each test asserts, so the base, which has no scripts/l2/canon.mjs, reddens by assertion. Each test names, on the line above it, the
// mutation that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DayStop, sealDay, STOPS, type DeriveContext, type Derived } from "../scripts/l2/day.mjs";
import { deriveDay, type Applied, type ReplayBook } from "../scripts/l2/derive.mjs";
import { cidOf, openWriter } from "../scripts/l2/segments.mjs";
import type * as CanonM from "../scripts/l2/canon.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-canon.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-LINKS-FILE-CRASH-1)
let ROOT = "", made = 0;
before(() => { ROOT = mkdtempSync(join(tmpdir(), "l2-canon-")); });
after(() => { if (ROOT !== "") rmSync(ROOT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const LF = String.fromCharCode(10), D = "2026-10-04", S = 1_000_000, MIN = 60 * S, START = Date.UTC(2026, 9, 4) * 1000, END = START + 1440 * MIN;
type Lv = [string, string];
type Line = Record<string, unknown>;

async function load(): Promise<typeof CanonM> {
  const m = await import("../scripts/l2/canon.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/canon.mjs is absent");
}
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
/** One connection under `out` (spot of BTCUSDT, or /market), its frames [recv_us, text] written by the writer of P1-a2; its <cid>. */
async function conn(out: string, frames: [number, string][], kind: "spot" | "market" = "spot"): Promise<string> {
  const cid = cidOf(kind, kind === "spot" ? "BTCUSDT" : "ALL", frames[0]![0]);
  let now = frames[0]![0];
  const w = openWriter(out, cid, { wallUs: () => now, monoNs: () => BigInt(now) * 1000n });
  for (const [us, text] of frames) { now = us; assert.equal(w.push(text), true); }
  await w.close();
  return cid;
}
const diff = (U: number, u: number, E: number, b: Lv[] = [], a: Lv[] = []): [number, string] =>
  [E, JSON.stringify({ stream: "btcusdt@depth@100ms", data: { e: "depthUpdate", E, s: "BTCUSDT", U, u, b, a } })];
const trade = (t: number, E: number, p = "100.00"): [number, string] =>
  [E, JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", E, s: "BTCUSDT", t, p, q: "1" } })];
const ticker = (u: number, us: number, b = "100.00"): [number, string] => [us, JSON.stringify({ stream: "btcusdt@bookTicker", data: { u, s: "BTCUSDT", b, B: "1", a: "101.00", A: "1" } })];
const liq = (E: number, q: string): string => JSON.stringify({ stream: "btcusdt@forceOrder", data: { e: "forceOrder", E, o: { s: "BTCUSDT", S: "SELL", q } } });
const snap = (lastUpdateId: number, bids: Lv[], asks: Lv[]): string => JSON.stringify({ lastUpdateId, bids, asks });
const dayDir = (out: string): string => join(out, "days", "BTCUSDT", D);
/** The seal of D with canonDay alone (or `hook`), or the code of its named stop. */
async function seal(out: string, hook?: (ctx: DeriveContext) => Derived): Promise<unknown> {
  const C = await load();
  try {
    return sealDay({ out, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, derive: hook ?? ((ctx) => C.canonDay(ctx)) });
  } catch (e) { return e instanceof DayStop ? e.code : String(e); }
}
const read = (out: string, name: string): string => readFileSync(join(dayDir(out), name), "utf8");
const manifest = (out: string): Line => JSON.parse(read(out, "manifest.json")) as Line;
const canon = (out: string): Record<string, Line> => manifest(out).canon as Record<string, Line>;
const sha = (texts: string[]): string => createHash("sha256").update(texts.map((t) => t + LF).join("")).digest("hex");
const byBytes = (texts: string[]): string[] => [...texts].sort((x, y) => Buffer.compare(Buffer.from(x), Buffer.from(y)));
const sortKeys = (x: unknown): unknown => (Array.isArray(x) ? x.map(sortKeys) : x !== null && typeof x === "object"
  ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sortKeys((x as Line)[k])])) : x);
const form = (text: string): string => JSON.stringify(sortKeys(JSON.parse(text)));
/** The trade frame of `t` with its keys in another order (what M-5 measures): same fields, other bytes. */
const swapped = (t: number, E: number): [number, string] => [E, `{"data":{"q":"1","p":"100.00","t":${String(t)},"s":"BTCUSDT","E":${String(E)},"e":"trade"},"stream":"btcusdt@trade"}`];

/** A day of every stream on two spot connections that overlap and one /market connection; trades t5 and t4 out of key order. */
async function host(out: string, t4: [number, string]): Promise<string[]> {
  const a = await conn(out, [diff(101, 101, START + S), trade(5, START + 2 * S), t4, ticker(101, START + 4 * S)]);
  const b = await conn(out, [[START + 2 * S + 500, t4[1]], [START + 5 * S, diff(101, 101, START + S)[1]]]); // the overlap: same bytes
  const m = await conn(out, [[START + 6 * S, liq(START + 6 * S, "1")]], "market");
  return [a, b, m];
}

// killer: scripts/l2/canon.mjs:92 CONST "cmp(st.k1[x], st.k1[y])" -> "cmp(st.k1[y], st.k1[x])"
test("l2_canonical_digests_two_per_stream", async () => {
  const one = fresh(), t4 = trade(4, START + 3 * S), conns = await host(one, t4);
  assert.deepEqual(await seal(one), { sealed: true, dir: dayDir(one), frames: 7 });
  const c = canon(one), t5 = trade(5, START + 2 * S)[1];
  assert.deepEqual(c.trade, { frames: 3, entries: 2, forms: 2, keyless: 0, foreign: 0, same_key: 0, same_fields: 0, jumps: { count: 0, max: null },
    raw_sha256: sha([t4[1], t5]), fields_sha256: sha([form(t4[1]), form(t5)]) }); // once by bytes, in key order: t4 then t5
  assert.deepEqual([c["depth@100ms"]!.frames, c["depth@100ms"]!.entries, c.bookTicker!.entries, c.forceOrder!.entries], [2, 1, 1, 1]);
  assert.equal(c.forceOrder!.raw_sha256, sha([liq(START + 6 * S, "1")]));
  assert.deepEqual(c.named, []);
  assert.deepEqual(readdirSync(dayDir(one)).sort(), ["SHA256SUMS", "index.jsonl", "manifest.json", "missing.json"]); // no file of its own
  assert.ok(Object.keys(manifest(one).script_sha256 as Line).includes("scripts/l2/canon.mjs"));
  for (const cid of conns) assert.match(read(one, "SHA256SUMS"), new RegExp(`conn/${cid}/20261004T00[.]frames`)); // every segment it reads
  const two = fresh(); // a second host: the same trades, t4's keys in another order; raw digests differ, field digests agree
  await host(two, swapped(4, START + 3 * S));
  assert.equal(await seal(two).then(() => canon(two).trade!.fields_sha256), c.trade.fields_sha256);
  assert.notEqual(canon(two).trade!.raw_sha256, c.trade.raw_sha256);
});

// killer: scripts/l2/canon.mjs:99 CONST "!e.b.equals(run[n - 1].b)" -> "false"
test("l2_canonical_same_key_named", async () => {
  const out = fresh(), x = trade(7, START + S, "100.00"), y = trade(7, START + 2 * S, "100.01"); // one t, two payloads: kept, named
  const a = await conn(out, [diff(101, 102, START + S), x, ticker(102, START + 3 * S, "100.00")]);
  const b = await conn(out, [y, ticker(102, START + 3 * S + 1, "100.01")]); // L2-BOOKTICKER-U-1: one u, two payloads
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 5 });
  const c = canon(out), seg = "20261004T00";
  assert.deepEqual([c.trade!.entries, c.trade!.same_key, c.trade!.raw_sha256, c.bookTicker!.entries, c.bookTicker!.same_key], [2, 1, sha(byBytes([x[1], y[1]])), 2, 1]);
  assert.deepEqual(c.named, [{ stream: "bookTicker", why: "same_key", key: [102], at: [[a, seg, 2], [b, seg, 1]] },
    { stream: "trade", why: "same_key", key: [7], at: [[a, seg, 1], [b, seg, 0]] }]); // never merged: both at the manifest
});

// killer: scripts/l2/canon.mjs:112 ROR "b - a > 1" -> "b - a > 2"
test("l2_forceorder_dedup_full_payload", async () => {
  const out = fresh(), one = liq(START + S, "1"), two = liq(START + 2 * S, "2"); // two liquidations, and one payload of one in other bytes
  const other = `{"data":{"o":{"q":"1","S":"SELL","s":"BTCUSDT"},"E":${String(START + S)},"e":"forceOrder"},"stream":"btcusdt@forceOrder"}`;
  const m1 = await conn(out, [[START + S, one], [START + 2 * S, two]], "market");
  const m2 = await conn(out, [[START + S + 1000, one], [START + S + 2000, other]], "market"); // a second connection: the same bytes, then other bytes
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 4 });
  const f = canon(out).forceOrder!, seg = "20261004T00";
  assert.deepEqual([f.frames, f.entries, f.forms, f.same_key, f.same_fields], [4, 3, 2, 0, 1]); // the key is the bytes: one entry each
  assert.equal(f.raw_sha256, sha(byBytes([one, two, other])));
  assert.deepEqual(canon(out).named, [{ stream: "forceOrder", why: "same_fields", key: null, at: byBytes([one, other]).map((t) => t === one ? [m1, seg, 0] : [m2, seg, 1]) }]);
});

// killer: scripts/l2/canon.mjs:116 ROR "k1 - prev > 1" -> "k1 - prev >= 1"
test("l2_trade_id_jump_counted_not_a_hole", async () => {
  const out = fresh(), ids = [1, 2, 3, 7, 8, 20]; // two jumps (3 to 7, 8 to 20), the largest 12; t3 again on a second connection
  const keyless = JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", E: START + 9 * S, s: "BTCUSDT" } }); // no t: first, counted
  await conn(out, [...ids.map((t, i) => trade(t, START + (i + 1) * S)), [START + 9 * S, keyless]]);
  await conn(out, [[START + 10 * S, trade(3, START + 3 * S)[1]]]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 8 });
  const t = canon(out).trade!;
  assert.deepEqual([t.entries, t.keyless, t.jumps], [7, 1, { count: 2, max: 12 }]);
  assert.deepEqual(JSON.parse(read(out, "missing.json")), { holes: [], events: [] }); // a jump of t is never a hole
});

/** sealDay's hook as c5 composes it: deriveDay of P1-c2 with the tap of bestTap, then canonDay with its result. */
const both = (C: typeof CanonM) => (ctx: DeriveContext): Derived => {
  const t = C.bestTap({ scale: 2, start: ctx.start, end: ctx.end }), a = deriveDay({ ...ctx, scale: 2, tap: t.tap }), b = C.canonDay({ ...ctx, best: t.result() });
  return { ...a, manifest: { ...a.manifest, ...b.manifest }, modules: [...a.modules ?? [], ...b.modules ?? []] };
};

// killer: scripts/l2/canon.mjs:120 ROR "k1 <= his[at]" -> "k1 < his[at]"
test("l2_bookticker_crosscheck_counts", async () => {
  const out = fresh(), C = await load(); // anchor 100: best bid 100.00, best ask 101.00
  mkdirSync(dayDir(out), { recursive: true });
  writeFileSync(join(dayDir(out), "anchor-open.json"), snap(100, [["100.00", "1"]], [["101.00", "1"]]));
  await conn(out, [diff(101, 101, START + S, [["100.00", "2"]]), diff(102, 103, START + 2 * S, [["99.00", "1"]]), // set (not judged); no change
    diff(104, 105, START + 3 * S, [], [["100.50", "1"]]), ticker(104, START + 3 * S + 1), // best ask 100.50: its ticker, at U
    diff(106, 106, START + 4 * S, [["100.00", "0"]]), // best bid gone, 99.00: no ticker in [106;106], (ii)
    diff(107, 108, START + 5 * S, [], [["100.50", "3"]]), ticker(108, START + 5 * S + 1), ticker(200, START + 6 * S)]); // 200: in no [U;u], (i)
  assert.deepEqual(await seal(out, both(C)), { sealed: true, dir: dayDir(out), frames: 8 });
  assert.deepEqual(manifest(out).crosscheck, { i: { tickers: 3, outside: 1 }, ii: { changes: 3, unmatched: 1, unjudged: 1, first: [[106, 106]] } });
  const none = fresh(); // canonDay without the replay: (ii) absent, named; no diffs: (i) absent, named
  await conn(none, [ticker(5, START + S)]);
  await seal(none);
  assert.deepEqual(manifest(none).crosscheck, { i: { absent: "no_diffs", tickers: 1 }, ii: { absent: "no_replay" } });
});

// killer: scripts/l2/canon.mjs:42 SDL "if (prev !== null && !m.has(prev)) return top(m, hi);" -> ""
test("l2_best_tap_net_change", async () => {
  const { tap, result } = (await load()).bestTap({ scale: 2, start: START, end: END });
  const book: ReplayBook = { id: 100, since: 100, bids: new Map([[10000n, ["100.00", "1"]], [9900n, ["99.00", "1"]]]), asks: new Map([[10100n, ["101.00", "1"]]]) };
  const ev = (U: number, E: number, b: Lv[] = [], a: Lv[] = []): Applied => {
    for (const [p, q] of b) if (q === "0") book.bids.delete(BigInt(p.replace(".", ""))); else book.bids.set(BigInt(p.replace(".", "")), [p, q]);
    for (const [p, q] of a) book.asks.set(BigInt(p.replace(".", "")), [p, q]);
    return { E, U, u: U, b, a };
  };
  const steps: [number, number, Lv[], Lv[]][] = [[101, START, [], []], [102, START + S, [["99.00", "2"]], []], [103, START + 2 * S, [["100.00", "0"]], []],
    [104, START + 3 * S, [["99.00", "3"]], []], [105, START + 4 * S, [], [["101.00", "1"]]], [106, END, [["99.50", "1"]], []]];
  for (const [U, E, b, a] of steps) tap(ev(U, E, b, a), book); // each applied, then tapped; 101: set; 105: same quantity; 106: J+1
  const r = result();
  assert.deepEqual([[...r.events.subarray(0, 2 * r.n)], r.unjudged], [[103, 103, 104, 104], 1]); // the best left (rescan), then its quantity
});

// killer: scripts/l2/canon.mjs:97 CONST "2 * held > bound" -> "held > bound"
test("l2_canon_run_bound_named", async () => {
  const C = await load(), one = liq(START + S, "1"), two = liq(START + 2 * S, "2"), held = 2 * (Buffer.byteLength(one) + Buffer.byteLength(two)); // G2 m-1: bytes and forms
  const day = async (bound: number): Promise<[string, unknown]> => {
    const out = fresh(); // forceOrder: one run of one key (its bytes), held whole to be ordered
    await conn(out, [[START + S, one], [START + 2 * S, two]], "market");
    return [out, await seal(out, (ctx) => C.canonDay({ ...ctx, bound }))];
  };
  const [at] = await day(held);
  assert.equal(canon(at).forceOrder!.entries, 2);
  const [past, code] = await day(held - 1);
  assert.deepEqual([code, STOPS.includes("canon_bound"), existsSync(join(dayDir(past), "index.jsonl"))], ["canon_bound", true, false]); // nothing written
});

// killer: scripts/l2/canon.mjs:75 ROR "(st.a[3 * p + 2] & 3) >= 2" -> "(st.a[3 * p + 2] & 3) > 2"
test("l2_canon_day_frames_only", async () => {
  const out = fresh(); // a trade of the day before, received past its day plus the grace: late, in D's index, not in D's sequence
  await conn(out, [[START + 3 * MIN, trade(9, START - 10 * S)[1]], trade(10, START + 4 * MIN)]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 2 });
  assert.ok(read(out, "index.jsonl").includes(`"mark":"late","of":"2026-10-03"`));
  const t = canon(out).trade!;
  assert.deepEqual([t.frames, t.entries, t.foreign, t.raw_sha256], [2, 1, 1, sha([trade(10, START + 4 * MIN)[1]])]);
});

// killer: scripts/l2/canon.mjs:118 CONST "Math.max(his[last], k2)" -> "k2"
test("l2_crosscheck_nested_interval", async () => {
  const out = fresh(); // G2 m-2: [100;110] on one connection, [101;104] nested on another; u 107 lies in their union
  await conn(out, [diff(100, 110, START + S), ticker(107, START + 3 * S)]);
  await conn(out, [[START + 2 * S, diff(101, 104, START + S)[1]]]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 3 });
  assert.deepEqual(manifest(out).crosscheck, { i: { tickers: 1, outside: 0 }, ii: { absent: "no_replay" } });
});

// killer: scripts/l2/canon.mjs:96 CONST "st.k2[perm[j]] === st.k2[perm[i]]" -> "true"
test("l2_canonical_diff_key_both_parts", async () => {
  const out = fresh(), x = diff(101, 103, START + S), y = diff(101, 101, START + S); // G2 m-3: one U, two u; read [101;103] first
  await conn(out, [x]);
  await conn(out, [[START + 2 * S, y[1]]]);
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 2 });
  const d = canon(out)["depth@100ms"]!;
  assert.deepEqual([d.entries, d.same_key, d.raw_sha256], [2, 0, sha([y[1], x[1]])]); // (U,u) order: [101;101], then [101;103]
});

// killer: scripts/l2/canon.mjs:107 CONST "cmp(p.f, q.f)" -> "0"
test("l2_forceorder_forms_sorted", async () => {
  const out = fresh(), one = liq(START + S, "1"), two = liq(START + 2 * S, "2"); // G2 m-4: by bytes other, three, one, two; forms 1, 2, 1, 2
  const other = `{"data":{"o":{"q":"1","S":"SELL","s":"BTCUSDT"},"E":${String(START + S)},"e":"forceOrder"},"stream":"btcusdt@forceOrder"}`;
  const three = `{"data":{"o":{"q":"2","S":"SELL","s":"BTCUSDT"},"E":${String(START + 2 * S)},"e":"forceOrder"},"stream":"btcusdt@forceOrder"}`;
  await conn(out, [[START + S, one], [START + 2 * S, two], [START + 3 * S, other], [START + 4 * S, three]], "market");
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 4 });
  const f = canon(out).forceOrder!;
  assert.deepEqual([f.entries, f.forms, f.same_fields, f.fields_sha256], [4, 2, 2, sha([form(one), form(two)].sort())]);
});

// killer: scripts/l2/canon.mjs:116 CONST "Math.max(max ?? 0, k1 - prev)" -> "k1 - prev"
test("l2_trade_id_largest_jump_first", async () => {
  const out = fresh(); // G2 m-5: the largest jump (3 to 15) comes before a smaller one (16 to 20)
  await conn(out, [1, 2, 3, 15, 16, 20].map((t, i) => trade(t, START + (i + 1) * S)));
  assert.deepEqual(await seal(out), { sealed: true, dir: dayDir(out), frames: 6 });
  assert.deepEqual(canon(out).trade!.jumps, { count: 2, max: 12 });
});

// killer: scripts/l2/canon.mjs:34 ROR "a[mid] <= x" -> "a[mid] < x"
test("l2_crosscheck_floor_low_edge", async () => {
  const out = fresh(), C = await load(), best = { events: Float64Array.from([106, 106]), n: 1, unjudged: 0 }; // G2 m-6: (ii) on [106;106]
  await conn(out, [diff(101, 103, START + S), diff(110, 112, START + 2 * S), ticker(105, START + 3 * S), ticker(110, START + 4 * S)]);
  assert.deepEqual(await seal(out, (ctx) => C.canonDay({ ...ctx, best })), { sealed: true, dir: dayDir(out), frames: 4 });
  assert.deepEqual(manifest(out).crosscheck, { i: { tickers: 2, outside: 1 }, ii: { changes: 1, unmatched: 1, unjudged: 0, first: [[106, 106]] } }); // u 110 at the low edge of [110;112]; 105 not in [106;106]
});

// killer: scripts/l2/canon.mjs:51 CONST "day ? 1 : 0" -> "1"
test("l2_best_tap_fresh_book_edges", async () => {
  const { tap, result } = (await load()).bestTap({ scale: 2, start: START, end: END }); // G2 m-7: a book set at J+1, then two ask levels
  const book: ReplayBook = { id: 100, since: 100, bids: new Map([[10000n, ["100.00", "1"]]]), asks: new Map([[10100n, ["101.00", "1"]], [10200n, ["102.00", "1"]]]) };
  tap({ E: END, U: 101, u: 101, b: [], a: [] }, book); // set, out of the day: not counted unjudged
  book.asks.set(10200n, ["102.00", "2"]);
  tap({ E: START + S, U: 102, u: 102, b: [], a: [["102.00", "2"]] }, book); // the second ask level: the best ask (101.00) is unchanged
  const r = result();
  assert.deepEqual([r.n, r.unjudged], [0, 0]);
});

// killer: scripts/l2/canon.mjs:103 ROR "named.length < NAMED_BOUND" -> "named.length <= NAMED_BOUND"
test("l2_canonical_named_bound", async () => {
  const out = fresh(), C = await load(), ids = Array.from({ length: 17 }, (_, i) => i + 1); // G2 m-7: 17 groups, 16 listed, all counted
  await conn(out, ids.map((t) => trade(t, START + t * S, "100.00")));
  await conn(out, ids.map((t) => trade(t, START + t * S + 1000, "100.01")));
  const best = { events: Float64Array.from(ids.flatMap((u) => [u, u])), n: 17, unjudged: 0 }; // 17 changes, no bookTicker: 16 listed
  assert.deepEqual(await seal(out, (ctx) => C.canonDay({ ...ctx, best })), { sealed: true, dir: dayDir(out), frames: 34 });
  const c = canon(out), ii = (manifest(out).crosscheck as Line).ii as Line;
  assert.deepEqual([c.trade!.same_key, (c.named as unknown as unknown[]).length, ii.unmatched, (ii.first as unknown[]).length], [17, 16, 17, 16]);
});

// killer: scripts/l2/canon.mjs:87 CONST "x.at !== x.n" -> "false"
test("l2_canon_index_all_read", async () => {
  const out = fresh(), C = await load(); // G2 n-2: an entry of the day's index that no segment holds (rank 9): named, nothing written
  await conn(out, [trade(1, START + S)]);
  const code = await seal(out, (ctx) => {
    const k = "btcusdt@trade", { stream, col } = ctx.index.get(k)!, a = Int32Array.from([...col.a.subarray(0, col.n), 0, 9, 0]);
    return C.canonDay({ ...ctx, index: new Map([...ctx.index, [k, { stream, col: { a, n: col.n + 3 } }]]) });
  });
  assert.deepEqual([code, STOPS.includes("canon_reread"), existsSync(join(dayDir(out), "index.jsonl"))], ["canon_reread", true, false]);
});
