// test/l2-book.test.ts -- lot P1-b2 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md sections 4 and 8.2; lot plan
// docs/G0-lot-l2-p1-b2.md): the chain procedure (h) of the order book against the loopback fake place of P1-a1: diffs served on a
// P1-a3 link and read back from its raw segment by the reader of P1-a2 (case S1), or fed as the text messages of a connection named by
// its <cid>, snapshots served by its REST to the client of P1-b1, an injected clock and sleep. The module is loaded by a dynamic import that each test asserts, so the base, which has no
// scripts/l2/book.mjs, reddens by assertion. Each test names, on the line above it, the mutation of scripts/l2/book.mjs that reddens it.
// Synthetic data only.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OP, startPlace, trap, viaFetch, viaWebSocket, type Peer, type Place, type Reply } from "./l2-fake-place.ts";
import * as Links from "../scripts/l2/links.mjs";
import * as Rest from "../scripts/l2/rest.mjs";
import { cidOf, readSegment, segmentOf } from "../scripts/l2/segments.mjs";
import type * as BookM from "../scripts/l2/book.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-book.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-BOOK-KEEP-CAUSE-1)
const places: Place[] = [], outs: string[] = []; before(() => { trap(); }); // fails: 6 named reds, not a silent file
const tmp = (): string => { const d = mkdtempSync(join(tmpdir(), "l2-book-")); outs.push(d); return d; };
after(async () => { for (const p of places) await p.stop(); for (const d of outs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const T0 = 1_760_000_000_000_000; // a synthetic wall clock in microseconds
type L = [string, string];
const BIDS: L[] = [["0.10", "1.0"], ["0.09", "2.0"]], ASKS: L[] = [["0.20", "3.0"]];
const [A, B, C, D] = [0, 1, 2, 3].map((k) => cidOf("spot", "BTCUSDT", T0 + k * 1000)) as [string, string, string, string]; // P1-a3 <cid>s
const bad = JSON.stringify({ stream: "btcusdt@depth@100ms", data: { U: 99, u: 98, b: [], a: [] } }); // U > u: not a diff read

async function load(): Promise<typeof BookM> {
  const m = await import("../scripts/l2/book.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/book.mjs is absent");
}
const snap = (lid: number, bids: L[] = BIDS, asks: L[] = ASKS): Reply => ({ status: 200, body: JSON.stringify({ lastUpdateId: lid, bids, asks }) });
const diff = (U: number, u: number, b: L[] = [], a: L[] = []): string =>
  JSON.stringify({ stream: "btcusdt@depth@100ms", data: { e: "depthUpdate", E: 1, s: "BTCUSDT", U, u, b, a } });

/** A BTCUSDT book on a fresh place whose REST serves `snaps` in order (or each answer of a function), then 451 (a stop: a mutant never
 *  loops); sleep advances the clock, then waits for `hold.wait`; `at` = clock at each call; each answer takes 1 us (two snapshots never
 *  share a file name: rest.mjs writes with "wx"). */
async function rig(snaps: Reply[] | (() => Reply), onPeer: (peer: Peer) => void = () => undefined): Promise<{ book: BookM.Book; place: Place;
  out: string; rest: Rest.RestClient; clock: { us: number }; hold: { wait: Promise<void> }; sleeps: number[]; at: number[]; journal: () => BookM.ChainEntry[] }> {
  const M = await load();
  const queue = typeof snaps === "function" ? [] : [...snaps], at: number[] = [], clock = { us: T0 }, sleeps: number[] = [], hold = { wait: Promise.resolve() };
  const place = await startPlace(onPeer, () => { at.push(clock.us); clock.us += 1; return typeof snaps === "function" ? snaps() : queue.shift() ?? { status: 451 }; });
  places.push(place);
  const out = tmp(), nowUs = (): number => clock.us;
  const rest = Rest.createRest({ fetch: viaFetch(place, [Rest.ORIGIN]), nowUs, out });
  const sleep = (ms: number): Promise<void> => { sleeps.push(ms); clock.us += ms * 1000; return hold.wait; };
  const book = M.createBook({ symbol: "BTCUSDT", rest, wallUs: nowUs, monoNs: () => BigInt(clock.us) * 1000n, sleep, out });
  const file = join(out, "journal.jsonl"); // shared with the link of case S1 (P1-a3)
  const journal = (): BookM.ChainEntry[] => (existsSync(file) ? readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l) as BookM.ChainEntry) : []);
  return { book, place, out, rest, clock, hold, sleeps, at, journal };
}
/** Feed `events` ([U, u, bids?, asks?]) on connection `cid` then wait for the sync. */
async function run(book: BookM.Book, events: [number, number, L[]?, L[]?][], cid = A): Promise<void> {
  for (const [U, u, b, a] of events) book.feed(diff(U, u, b, a), cid);
  await book.idle();
}
const reasons = (j: BookM.ChainEntry[]): string[] => j.map((e) => `${e.event}${typeof e.reason === "string" ? `:${e.reason}` : ""}`);
const tick = (): Promise<void> => new Promise((ok) => { setTimeout(ok, 5); });

// killer: scripts/l2/book.mjs:93 CONST "s.buf[0].U" -> "s.buf[s.buf.length - 1].U"
test("l2_h_steps_table", async () => {
  // S1: the diffs served on a P1-a3 link (spotUrl, its <cid>), read back from its raw segment by the P1-a2 reader and fed in order;
  // another stream of the combined connection is not read; the client sends nothing but the PONG of the place's PING, then its CLOSE.
  const s1 = await rig([snap(10)], (peer: Peer) => {
    peer.send(OP.text, JSON.stringify({ stream: "btcusdt@bookTicker", data: { u: 9, s: "BTCUSDT", b: "0.10", B: "1", a: "0.20", A: "1" } }));
    for (const t of [diff(9, 11, [["0.10", "4.0"]]), diff(12, 12)]) peer.send(OP.text, t);
    peer.send(OP.ping, "p");
    peer.send(OP.close, Buffer.from([3, 232]));
  });
  assert.equal(s1.book.stream, "btcusdt@depth@100ms");
  assert.ok(new URL(Links.spotUrl("BTCUSDT")).searchParams.get("streams")?.split("/").includes(s1.book.stream), "S1: a stream of its link");
  const link = Links.openLink({ symbol: "BTCUSDT", url: Links.spotUrl("BTCUSDT"), out: s1.out }, { webSocket: viaWebSocket(s1.place,
    Links.ORIGINS), wallUs: () => s1.clock.us, monoNs: () => 0n, setTimer: () => null, clearTimer: () => undefined, gate: Links.openingGate() });
  for (let i = 0; i < 1000 && !s1.journal().some((e) => String(e.event) === "close"); i++) await new Promise((ok) => { setTimeout(ok, 10); });
  await link.stop();
  const open = s1.journal().find((e) => String(e.event) === "open"), cid = String(open?.cid);
  const fed = [...readSegment(s1.out, cid, segmentOf(Number(open?.host_us)))].map((f) => s1.book.feed(f.bytes.toString("utf8"), cid));
  await s1.book.idle();
  assert.deepEqual([fed, open?.time_unit, s1.place.peers[0]?.path.includes(s1.book.stream)], [[false, true, true], "MICROSECOND", true], "S1");
  assert.deepEqual(s1.place.peers[0]?.got.map((f) => [f.op, f.op === OP.pong ? f.payload.toString() : ""]), [[OP.pong, "p"], [OP.close, ""]], "S1");
  assert.deepEqual([s1.book.id, s1.book.levels()?.bids[0], s1.journal().at(-1)?.cid], [12, ["0.10", "4.0"], cid], "S1: the link's cid");

  // S2, S3: no snapshot before the first event; three events buffered before the answer, none applied before S6.
  const s2 = await rig([snap(6)]);
  await new Promise((ok) => { setTimeout(ok, 20); });
  assert.deepEqual([s2.place.calls.length, s2.book.state], [0, "syncing"], "S2: no snapshot before an event");
  for (const [U, u] of [[5, 6], [7, 8], [9, 10]] as const) s2.book.feed(diff(U, u, [["0.10", String(u)]]), A);
  assert.deepEqual([s2.book.id, s2.book.counts.applied, s2.book.levels()], [null, 0, null], "S2: nothing applied before S6");
  await s2.book.idle();
  assert.deepEqual(s2.place.calls, ["/api/v3/depth?symbol=BTCUSDT&limit=5000"], "S3");
  const req = JSON.parse(readFileSync(join(s2.out, "requests.jsonl"), "utf8").trim()) as Rest.RequestLine;
  assert.deepEqual([req.kind, req.weight, req.status, /^rest\/BTCUSDT\/[^/\\]+$/.test(String(req.kept))], ["depth", 250, 200, true],
    "S3: logged by the REST client, its body kept under a posix path (P1-b1)");
  assert.deepEqual([s2.book.id, s2.book.counts], [10, { applied: 2, ignored: 0, dropped: 1, trimmed: 0 }], "S2");

  // S4 and S5: [case, lastUpdateIds served, buffered events, snapshots asked, final id, dropped, vain reasons].
  const cases: [string, number[], [number, number][], number, number, number, string[]][] = [
    ["S4-sous", [9, 12], [[10, 12], [13, 14]], 2, 14, 1, ["snapshot_before_buffer"]],
    ["S4-egal", [10], [[10, 11], [12, 13]], 1, 13, 0, []],
    ["S5-u-egal", [10], [[8, 10], [11, 12]], 1, 12, 1, []],
    ["S5-u-plus-1", [10], [[8, 11]], 1, 11, 0, []],
    ["S5-U-egal", [10], [[10, 12], [13, 15]], 1, 15, 0, []],
    ["S5-U-dedans", [10], [[9, 12]], 1, 12, 0, []],
    ["S5-U-plus-1", [10], [[5, 8], [11, 12]], 1, 12, 1, []],
    ["S5-U-plus-2", [10, 12], [[5, 8], [12, 13]], 2, 13, 1, ["first_event_after_snapshot"]],
    ["S5-vide", [10], [[5, 8]], 1, 10, 1, []],
  ];
  for (const [name, lids, events, asked, id, dropped, vain] of cases) {
    const r = await rig(lids.map((l) => snap(l)));
    await run(r.book, events);
    assert.deepEqual([r.place.calls.length, r.book.id, r.book.counts.dropped], [asked, id, dropped], name);
    assert.deepEqual(r.journal().filter((e) => e.event === "sync_try_vain").map((e) => e.reason), vain, name);
    assert.deepEqual(r.sleeps, vain.map(() => 1000), `${name}: 1 s between two tries`);
    if (name === "S5-U-plus-2") assert.equal(r.journal().find((e) => e.event === "chain_synced")?.dropped, 0, "u <= lastUpdateId trimmed at the vain try");
    if (name === "S5-vide") { // S6: the book is the snapshot; the next event is the first remaining one, checked alike (Q-P1-7)
      assert.deepEqual(r.book.levels(), { lastUpdateId: 10, bids: BIDS, asks: ASKS }, "S6");
      await run(r.book, [[11, 11]]);
      assert.deepEqual([r.book.id, r.place.calls.length], [11, 1], "S5-vide: U = lastUpdateId + 1 accepted, no new snapshot");
    }
  }

  // S7: the buffer in its order of reception, then the stream.
  const s7 = await rig([snap(10)]);
  await run(s7.book, [[5, 8, [["0.10", "9.0"]]], [9, 11, [["0.10", "3.0"]]], [12, 12, [["0.10", "4.0"]]]]);
  s7.book.feed(diff(13, 13, [], [["0.20", "5.0"]]), A);
  assert.deepEqual(s7.book.levels(), { lastUpdateId: 13, bids: [["0.10", "4.0"], ["0.09", "2.0"]], asks: [["0.20", "5.0"]] }, "S7");
  // S7 with a hole inside the buffer: a named gap mid-replay, the events after it kept, a new sync at once (no pause: tries reset).
  const s7h = await rig([snap(10), snap(13)]);
  await run(s7h.book, [[5, 8], [11, 11], [13, 13], [14, 14]]);
  assert.deepEqual([reasons(s7h.journal()), s7h.book.id, s7h.sleeps], [["chain_synced", "chain_gap:gap", "chain_synced"], 14, []], "S7, hole");

  // A1 to A3 on a book set at id 10.
  const a = await rig([snap(10), snap(14)]);
  await run(a.book, [[5, 8]]);
  a.book.feed(diff(8, 9, [["0.10", "7.0"]]), A);
  assert.deepEqual([a.book.id, a.book.counts.ignored, a.book.levels()?.bids[0]], [10, 1, ["0.10", "1.0"]], "A1-u-sous: ignored");
  a.book.feed(diff(9, 10, [["0.10", "1.0"]]), A);
  assert.deepEqual([a.book.id, a.book.counts.applied, a.book.counts.ignored], [10, 1, 1], "A1-u-egal: applied without effect");
  a.book.feed(diff(11, 11, [["0.10", "0.5"], ["0.09", "0.00000000"], ["0.08", "6.0"]], [["0.20", "0"], ["0.30", "1.5"]]), A);
  assert.deepEqual(a.book.levels(), { lastUpdateId: 11, bids: [["0.10", "0.5"], ["0.08", "6.0"]], asks: [["0.30", "1.5"]] },
    "A1-U-plus-1 applied; A2-pose (set, never added), A2-zero (removed), A2-neuf (inserted); A3: id = u");
  a.book.feed(diff(12, 12), A);
  assert.equal(a.book.id, 12, "A3: U = u + 1 passes");
  a.book.feed(diff(14, 14), A);
  assert.deepEqual([a.book.id, a.book.levels()], [null, null], "A1-U-plus-2: the book is dropped");
  await a.book.idle();
  const gap = a.journal().find((e) => e.event === "chain_gap");
  assert.deepEqual([gap?.reason, gap?.expected_U, gap?.U, gap?.u], ["gap", 13, 14, 14], "A1-U-plus-2: named");
  assert.deepEqual([a.place.calls.length, a.book.id, a.book.levels()?.bids], [2, 14, BIDS], "A1-U-plus-2: a new sync");
  // Shapes: a diff that is not read is a named rupture.
  a.book.feed(JSON.stringify({ stream: "btcusdt@depth@100ms", data: { U: 15, u: 15.5, b: [], a: [] } }), A);
  assert.deepEqual([a.book.id, a.journal().at(-1)?.reason], [null, "event_shape"]);
});

// killer: scripts/l2/book.mjs:22 CONST "SNAPSHOTS_PER_RESYNC = 3" -> "SNAPSHOTS_PER_RESYNC = 4"
test("l2_chain_gap_named_then_resync", async () => {
  const { book, sleeps, at, journal, clock } = await rig([snap(10), snap(9), snap(9), snap(9), snap(12), { status: 429,
    headers: { "retry-after": "7" } }, snap(15), { status: 451 }]);
  await run(book, [[5, 8]]);
  clock.us += 60_000_000; // a minute later: the first snapshot has left the cap's window
  // A gap, then three snapshots older than the buffer: three named vain tries 1 s apart, a named 60 s suspension and no snapshot
  // before its end, then a successful resync.
  await run(book, [[12, 13, [["0.11", "1.0"]]]]);
  const j = journal(), gaps = (xs: number[]): number[] => xs.slice(1).map((x, i) => x - (xs[i] ?? 0));
  assert.deepEqual(reasons(j), ["chain_synced", "chain_gap:gap", "sync_try_vain:snapshot_before_buffer", "sync_try_vain:snapshot_before_buffer",
    "sync_try_vain:snapshot_before_buffer", "sync_suspended", "chain_synced"]);
  assert.equal(j[5]?.cause, "tries");
  assert.deepEqual(j.filter((e) => e.event === "sync_try_vain").map((e) => e.try), [1, 2, 3]);
  assert.deepEqual(gaps(at.slice(1)), [1_000_001, 1_000_001, 60_000_001], "1 s pauses, then the 60 s suspension");
  assert.deepEqual(sleeps, [1000, 1000, 60_000]);
  assert.deepEqual([j[5]?.until_us, at[4]], [(j[5]?.host_us ?? 0) + 60_000_000, j[5]?.until_us], "no snapshot before its end");
  assert.deepEqual([book.id, book.levels()?.bids[0]], [13, ["0.11", "1.0"]], "resumed");
  // A 429 with Retry-After: a named vain try, and no snapshot before the REST suspension ends (1 s pause, then 6 s more).
  await run(book, [[15, 15]]);
  assert.deepEqual([gaps(at.slice(5)), sleeps.slice(3)], [[7_000_001], [1000, 6000]]);
  assert.deepEqual([reasons(journal()).slice(7), book.id], [["chain_gap:gap", "sync_try_vain:rate_limited", "chain_synced"], 15]);
  // A 451 stops the book and every later request.
  clock.us += 60_000_000;
  await run(book, [[17, 17]]);
  assert.deepEqual([book.state, book.id, journal().at(-1)?.event, journal().at(-1)?.code], ["stopped", null, "chain_stopped", "restricted_location"]);
  assert.equal(book.feed(diff(18, 18), A), false);
  await book.idle();
  assert.equal(at.length, 8, "nothing asked after a 451");
});

// killer: scripts/l2/book.mjs:156 ROR "ev.u > s.id" -> "ev.u >= s.id"
test("l2_overlap_switch_no_gap", async () => {
  // Old connection A, new connection B opened for the overlap (24 h bound or serverShutdown): B's diffs are buffered; at the switch,
  // those with u <= id are dropped and the first remaining one continues the chain (U = id + 1, Q-P1-7): no gap, no new snapshot.
  const { book, at, journal } = await rig([snap(10), snap(20), snap(22)]);
  for (const [U, u] of [[5, 8], [9, 12]] as const) book.feed(diff(U, u), A);
  await book.idle();
  book.feed(diff(13, 14, [["0.10", "2.5"]]), A);
  for (const [U, u, q] of [[13, 14, "2.5"], [15, 15, "3.5"], [16, 16, "4.5"]] as const) assert.equal(book.feed(diff(U, u, [["0.10", q]]), B), true);
  assert.equal(book.id, 14, "B is buffered, not applied");
  assert.equal(book.feed(JSON.stringify({ e: "serverShutdown", E: 1 }), A), false, "serverShutdown is not a diff");
  book.switchTo(B);
  assert.equal(book.feed(diff(15, 16, [["0.10", "9.9"]]), A), false, "A is retired from the book");
  book.feed(diff(17, 17), B);
  assert.deepEqual([book.id, book.levels()?.bids[0], at.length], [17, ["0.10", "4.5"], 1], "one suite in the book; u = id + 1 kept");
  const sw = journal().find((e) => e.event === "chain_switched");
  assert.deepEqual([sw?.from, sw?.to, sw?.dropped, sw?.remaining], [A, B, 1, 2]);
  assert.ok(!journal().some((e) => e.event === "chain_gap"), "no gap");
  // A switch whose kept events leave a hole is a named gap; the events after it are kept for the new sync (S4, S5 on snapshot 20).
  for (const [U, u] of [[18, 18], [20, 20], [21, 21]] as const) book.feed(diff(U, u), C);
  book.switchTo(C);
  await book.idle();
  assert.deepEqual([reasons(journal()).filter((r) => r.startsWith("chain_gap")), journal().find((e) => e.event === "chain_gap")?.U, book.id, at.length],
    [["chain_gap:gap"], 20, 21, 2]);
  // A malformed diff of the new connection is named at the switch, then a new sync.
  book.feed(diff(22, 22), D);
  book.feed(bad, D);
  book.switchTo(D);
  await book.idle();
  assert.deepEqual([reasons(journal()).slice(-3), book.id], [["chain_switched", "chain_gap:event_shape", "chain_synced"], 22]);

  // Switches while the book syncs: the new connection's buffer replaces the old one, a snapshot in flight meets it (S4).
  const w = await rig([snap(10), snap(30)]);
  w.book.feed(diff(5, 8), A);
  w.book.feed(diff(30, 31), B);
  w.book.switchTo(B);
  await w.book.idle();
  assert.deepEqual([reasons(w.journal()).slice(1, 2), w.book.id], [["sync_try_vain:snapshot_before_buffer"], 31], "the buffer is B's alone");
  // To an empty buffer, or closed, while a snapshot is in flight: nothing set, nothing thrown.
  const e = await rig([snap(10)]), c = await rig([snap(10)]);
  e.book.feed(diff(5, 8), A);
  e.book.switchTo(B);
  c.book.feed(diff(5, 8), A);
  c.book.close();
  assert.deepEqual(await Promise.all([e, c].map((r) => r.book.idle().then(() => r.book.state, String))), ["syncing", "syncing"]);
  assert.equal(c.book.feed(diff(9, 9), A), false, "closed");
  // A book dropped without a buffer (a malformed diff) syncs again on a switch to a connection that has one; a malformed diff of it
  // while the book syncs is named at the switch.
  const z = await rig([snap(10), snap(12), snap(14)]);
  await run(z.book, [[5, 8]]);
  z.book.feed(bad, A);
  z.book.feed(diff(11, 12), B);
  z.book.switchTo(B);
  await z.book.idle();
  assert.equal(z.book.id, 12, "a sync started by the switch");
  z.book.feed(bad, B);
  for (const t of [diff(13, 14), bad]) z.book.feed(t, C);
  z.book.switchTo(C);
  await z.book.idle();
  assert.deepEqual([reasons(z.journal()).slice(-3), z.book.id], [["chain_switched", "chain_gap:event_shape", "chain_synced"], 14]);
});

// killer: scripts/l2/book.mjs:112 ROR "takes.length >= SNAPSHOTS_PER_RESYNC" -> "takes.length > SNAPSHOTS_PER_RESYNC"
test("l2_snapshot_cap_three_per_minute", async () => {
  // G2 probe (B-1): a hole every third event during 10 s of place time, each snapshot served at the last u fed, so each sync succeeds
  // and the next hole breaks it. Successes count too: never more than 3 snapshots of the symbol in a sliding 60 s, the wait named.
  let last = 100;
  const r = await rig(() => snap(last));
  for (let k = 0; k < 100; k++) {
    last += k % 3 === 2 ? 2 : 1;
    await run(r.book, [[last, last]]);
    r.clock.us += 100_000;
  }
  assert.ok(r.at.length > 3 && r.at.every((t, i) => i < 3 || t - (r.at[i - 3] ?? 0) >= 60_000_000), `3 per 60 s: ${String(r.at.length)}`);
  const w = r.journal().find((e) => e.event === "sync_suspended");
  assert.deepEqual([w?.cause, w?.until_us], ["window", (r.at[0] ?? 0) + 60_000_000]);
});

// killer: scripts/l2/book.mjs:25 CONST "BUFFER_MAX = 1_200" -> "BUFFER_MAX = 1_300"
test("l2_buffers_bounded_oldest_dropped", async () => {
  // A 429 of 2 h (B-2): 1 300 diffs buffered for the sync and 1 299 for a newer connection during the wait; each buffer keeps its
  // newest 1 200, the overflow named once per buffer; S4 re-checks against the new first event (U = 101: snapshot 50 is too old).
  const r = await rig([{ status: 429, headers: { "retry-after": "7200" } }, snap(50), snap(500)]);
  let release = (): void => undefined;
  r.hold.wait = new Promise((ok) => { release = ok; });
  r.book.feed(diff(1, 1), A);
  for (let i = 0; i < 200 && r.sleeps.length === 0; i++) await tick();
  for (let k = 2; k <= 1300; k++) { r.book.feed(diff(k, k), A); r.book.feed(diff(k, k), B); }
  release();
  await r.book.idle();
  const j = r.journal(), trims = j.filter((e) => e.event === "buffer_trimmed");
  assert.deepEqual(trims.map((e) => [e.buffer, e.bound]), [["sync", 1200], [B, 1200]]);
  assert.deepEqual([reasons(j).filter((x) => x.startsWith("sync_try_vain")), r.book.id, r.book.counts.trimmed],
    [["sync_try_vain:rate_limited", "sync_try_vain:snapshot_before_buffer"], 1300, 199]);
  r.book.switchTo(B);
  assert.deepEqual([r.journal().at(-1)?.dropped, r.book.id], [1200, 1300], "B's 1 200 newest, all at or below the id");
});

// killer: scripts/l2/book.mjs:54 CONST "!PLAIN.test(v)" -> "false"
test("l2_book_guards_named", async () => {
  const M = await load(), out = tmp(), file = join(out, "journal.jsonl");
  assert.throws(() => M.createBook({ symbol: "XRPUSDT" } as BookM.BookIo), { code: "bad_symbol" });
  // The journal of a link takes no address (P1-a3 PLAIN); a <cid> that is not one of P1-a3 is refused; a codeless stop is named.
  let calls = 0;
  const rest = { stopped: false, suspendedUntilUs: 0, request: (): Promise<never> => {
    calls += 1;
    rest.stopped = calls === 2;
    return Promise.reject(calls === 1 ? Object.assign(new Error("e"), { code: "via 192.0.2.1:9443" }) : new Error("e"));
  } };
  const g = M.createBook({ symbol: "BTCUSDT", rest, wallUs: () => T0, monoNs: () => 0n, sleep: () => Promise.resolve(), out });
  assert.deepEqual([g.feed(diff(1, 1), "192.0.2.1:9443"), g.switchTo("192.0.2.1:9443"), existsSync(file)], [false, false, false]);
  g.feed(diff(1, 1), A);
  await g.idle();
  const lines = readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l) as BookM.ChainEntry);
  assert.deepEqual(lines.map((e) => [e.event, "reason" in e ? e.reason : e.code]), [["sync_try_vain", null], ["chain_stopped", "snapshot_error"]]);
  // Shapes: U > u, a price or a quantity that is not a decimal, snapshot bids that are not levels.
  const r = await rig([{ status: 200, body: JSON.stringify({ lastUpdateId: 10, bids: "x", asks: [] }) }, ...[1, 2, 3, 4].map(() => snap(10))]);
  await run(r.book, [[5, 8]]);
  for (const t of [bad, diff(11, 11, [["1e3", "1"]]), diff(11, 11, [], [["0.20", "abc"]])]) { r.book.feed(t, A); await run(r.book, [[9, 10]]); }
  assert.deepEqual(reasons(r.journal()).filter((x) => /^(chain_gap|sync_try)/.test(x)), ["sync_try_vain:snapshot_shape",
    "chain_gap:event_shape", "chain_gap:event_shape", "chain_gap:event_shape"]);
  // switchTo the connection followed is refused; the book goes on.
  assert.deepEqual([r.book.switchTo(A), r.book.feed(diff(11, 11), A), r.book.id], [false, true, 11]);
  // A stop of the shared REST client (another symbol's 451) stops a synced book at its next diff.
  await r.rest.request("depth", "ETHUSDT").catch(() => null);
  assert.deepEqual([r.book.feed(diff(12, 12), A), r.book.state, r.journal().at(-1)?.event, r.journal().at(-1)?.code],
    [false, "stopped", "chain_stopped", "rest_stopped"]);
});
