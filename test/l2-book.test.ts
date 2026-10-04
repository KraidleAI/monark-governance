// test/l2-book.test.ts -- lot P1-b2 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md sections 4 and 8.2; lot plan
// docs/G0-lot-l2-p1-b2.md): the chain procedure (h) of the order book against the loopback fake place of P1-a1: diffs served on a
// P1-a3 link and read back from its raw segment by the reader of P1-a2 (case S1), or fed as the text messages of a connection named by
// its <cid>, snapshots served by its REST to the client of P1-b1, an injected clock and sleep. The module is loaded by a dynamic import that each test asserts, so the base, which has no
// scripts/l2/book.mjs, reddens by assertion. Each test names, on the line above it, the mutation of scripts/l2/book.mjs that reddens it.
// Synthetic data only.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OP, startPlace, trap, viaFetch, viaWebSocket, type Peer, type Place, type Reply } from "./l2-fake-place.ts";
import * as Links from "../scripts/l2/links.mjs";
import * as Rest from "../scripts/l2/rest.mjs";
import { readSegment, segmentOf } from "../scripts/l2/segments.mjs";
import type * as BookM from "../scripts/l2/book.mjs";

trap();
const places: Place[] = [];
after(async () => { for (const p of places) await p.stop(); });
const T0 = 1_760_000_000_000_000; // a synthetic wall clock in microseconds
type L = [string, string];
const BIDS: L[] = [["0.10", "1.0"], ["0.09", "2.0"]], ASKS: L[] = [["0.20", "3.0"]];

async function load(): Promise<typeof BookM> {
  const m = await import("../scripts/l2/book.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/book.mjs is absent");
}
const snap = (lid: number, bids: L[] = BIDS, asks: L[] = ASKS): Reply => ({ status: 200, body: JSON.stringify({ lastUpdateId: lid, bids, asks }) });
const diff = (U: number, u: number, b: L[] = [], a: L[] = []): string =>
  JSON.stringify({ stream: "btcusdt@depth@100ms", data: { e: "depthUpdate", E: 1, s: "BTCUSDT", U, u, b, a } });

/** A BTCUSDT book on a fresh place whose REST serves `snaps` in order, then 451 (a stop: a mutant never loops); sleep advances the clock;
 *  `at` = clock at each call; each answer takes 1 us (two snapshots never share a file name: rest.mjs writes with "wx"). */
async function rig(snaps: Reply[], onPeer: (peer: Peer) => void = () => undefined): Promise<{ book: BookM.Book; place: Place; out: string;
  clock: { us: number }; sleeps: number[]; at: number[]; journal: () => BookM.ChainEntry[] }> {
  const B = await load();
  const queue = [...snaps], at: number[] = [], clock = { us: T0 }, sleeps: number[] = [];
  const place = await startPlace(onPeer, () => { at.push(clock.us); clock.us += 1; return queue.shift() ?? { status: 451 }; });
  places.push(place);
  const out = mkdtempSync(join(tmpdir(), "l2-book-")), nowUs = (): number => clock.us;
  const rest = Rest.createRest({ fetch: viaFetch(place, [Rest.ORIGIN]), nowUs, out });
  const sleep = (ms: number): Promise<void> => { sleeps.push(ms); clock.us += ms * 1000; return Promise.resolve(); };
  const book = B.createBook({ symbol: "BTCUSDT", rest, wallUs: nowUs, monoNs: () => BigInt(clock.us) * 1000n, sleep, out });
  const file = join(out, "journal.jsonl"); // shared with the link of case S1 (P1-a3)
  const journal = (): BookM.ChainEntry[] => (existsSync(file) ? readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l) as BookM.ChainEntry) : []);
  return { book, place, out, clock, sleeps, at, journal };
}
/** Feed `events` ([U, u, bids?, asks?]) on connection `cid` then wait for the sync. */
async function run(book: BookM.Book, events: [number, number, L[]?, L[]?][], cid = "A"): Promise<void> {
  for (const [U, u, b, a] of events) book.feed(diff(U, u, b, a), cid);
  await book.idle();
}
const reasons = (j: BookM.ChainEntry[]): string[] => j.map((e) => `${e.event}${typeof e.reason === "string" ? `:${e.reason}` : ""}`);

// killer: scripts/l2/book.mjs:77 CONST "s.buf[0].U" -> "s.buf[s.buf.length - 1].U"
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
  for (const [U, u] of [[5, 6], [7, 8], [9, 10]] as const) s2.book.feed(diff(U, u, [["0.10", String(u)]]), "A");
  assert.deepEqual([s2.book.id, s2.book.counts.applied, s2.book.levels()], [null, 0, null], "S2: nothing applied before S6");
  await s2.book.idle();
  assert.deepEqual(s2.place.calls, ["/api/v3/depth?symbol=BTCUSDT&limit=5000"], "S3");
  const req = JSON.parse(readFileSync(join(s2.out, "requests.jsonl"), "utf8").trim()) as Rest.RequestLine;
  assert.deepEqual([req.kind, req.weight, req.status, /^rest\/BTCUSDT\/[^/\\]+$/.test(String(req.kept))], ["depth", 250, 200, true],
    "S3: logged by the REST client, its body kept under a posix path (P1-b1)");
  assert.deepEqual([s2.book.id, s2.book.counts], [10, { applied: 2, ignored: 0, dropped: 1 }], "S2");

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
    if (name === "S5-vide") { // S6: the book is the snapshot; the next event is the first remaining one, checked alike (Q-P1-7)
      assert.deepEqual(r.book.levels(), { lastUpdateId: 10, bids: BIDS, asks: ASKS }, "S6");
      await run(r.book, [[11, 11]]);
      assert.deepEqual([r.book.id, r.place.calls.length], [11, 1], "S5-vide: U = lastUpdateId + 1 accepted, no new snapshot");
    }
  }

  // S7: the buffer in its order of reception, then the stream.
  const s7 = await rig([snap(10)]);
  await run(s7.book, [[5, 8, [["0.10", "9.0"]]], [9, 11, [["0.10", "3.0"]]], [12, 12, [["0.10", "4.0"]]]]);
  s7.book.feed(diff(13, 13, [], [["0.20", "5.0"]]), "A");
  assert.deepEqual(s7.book.levels(), { lastUpdateId: 13, bids: [["0.10", "4.0"], ["0.09", "2.0"]], asks: [["0.20", "5.0"]] }, "S7");

  // A1 to A3 on a book set at id 10.
  const a = await rig([snap(10), snap(14)]);
  await run(a.book, [[5, 8]]);
  a.book.feed(diff(8, 9, [["0.10", "7.0"]]), "A");
  assert.deepEqual([a.book.id, a.book.counts.ignored, a.book.levels()?.bids[0]], [10, 1, ["0.10", "1.0"]], "A1-u-sous: ignored");
  a.book.feed(diff(9, 10, [["0.10", "1.0"]]), "A");
  assert.deepEqual([a.book.id, a.book.counts.applied, a.book.counts.ignored], [10, 1, 1], "A1-u-egal: applied without effect");
  a.book.feed(diff(11, 11, [["0.10", "0.5"], ["0.09", "0.00000000"], ["0.08", "6.0"]], [["0.20", "0"], ["0.30", "1.5"]]), "A");
  assert.deepEqual(a.book.levels(), { lastUpdateId: 11, bids: [["0.10", "0.5"], ["0.08", "6.0"]], asks: [["0.30", "1.5"]] },
    "A1-U-plus-1 applied; A2-pose (set, never added), A2-zero (removed), A2-neuf (inserted); A3: id = u");
  a.book.feed(diff(12, 12), "A");
  assert.equal(a.book.id, 12, "A3: U = u + 1 passes");
  a.book.feed(diff(14, 14), "A");
  assert.deepEqual([a.book.id, a.book.levels()], [null, null], "A1-U-plus-2: the book is dropped");
  await a.book.idle();
  const gap = a.journal().find((e) => e.event === "chain_gap");
  assert.deepEqual([gap?.reason, gap?.expected_U, gap?.U, gap?.u], ["gap", 13, 14, 14], "A1-U-plus-2: named");
  assert.deepEqual([a.place.calls.length, a.book.id, a.book.levels()?.bids], [2, 14, BIDS], "A1-U-plus-2: a new sync");
  // Shapes: a diff that is not read is a named rupture.
  a.book.feed(JSON.stringify({ stream: "btcusdt@depth@100ms", data: { U: 15, u: 15.5, b: [], a: [] } }), "A");
  assert.deepEqual([a.book.id, a.journal().at(-1)?.reason], [null, "event_shape"]);
});

// killer: scripts/l2/book.mjs:20 CONST "SNAPSHOTS_PER_RESYNC = 3" -> "SNAPSHOTS_PER_RESYNC = 4"
test("l2_chain_gap_named_then_resync", async () => {
  const { book, sleeps, at, journal } = await rig([snap(10), snap(9), snap(9), snap(9), snap(12), { status: 429,
    headers: { "retry-after": "7" } }, snap(15), { status: 451 }]);
  await run(book, [[5, 8]]);
  // A gap, then three snapshots older than the buffer: three named vain tries 1 s apart, a named 60 s suspension and no snapshot
  // before its end, then a successful resync.
  await run(book, [[12, 13, [["0.11", "1.0"]]]]);
  const j = journal(), gaps = (xs: number[]): number[] => xs.slice(1).map((x, i) => x - (xs[i] ?? 0));
  assert.deepEqual(reasons(j), ["chain_synced", "chain_gap:gap", "sync_try_vain:snapshot_before_buffer", "sync_try_vain:snapshot_before_buffer",
    "sync_try_vain:snapshot_before_buffer", "sync_suspended", "chain_synced"]);
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
  await run(book, [[17, 17]]);
  assert.deepEqual([book.state, book.id, journal().at(-1)?.event, journal().at(-1)?.code], ["stopped", null, "chain_stopped", "restricted_location"]);
  assert.equal(book.feed(diff(18, 18), "A"), false);
  await book.idle();
  assert.equal(at.length, 8, "nothing asked after a 451");
});

// killer: scripts/l2/book.mjs:138 ROR "ev.u > s.id" -> "ev.u >= s.id"
test("l2_overlap_switch_no_gap", async () => {
  // Old connection A, new connection B opened for the overlap (24 h bound or serverShutdown): B's diffs are buffered; at the switch,
  // those with u <= id are dropped and the first remaining one continues the chain (U = id + 1, Q-P1-7): no gap, no new snapshot.
  const { book, at, journal } = await rig([snap(10), snap(20)]);
  for (const [U, u] of [[5, 8], [9, 12]] as const) book.feed(diff(U, u), "A");
  await book.idle();
  book.feed(diff(13, 14, [["0.10", "2.5"]]), "A");
  for (const [U, u, q] of [[13, 14, "2.5"], [15, 16, "3.5"]] as const) assert.equal(book.feed(diff(U, u, [["0.10", q]]), "B"), true);
  assert.equal(book.id, 14, "B is buffered, not applied");
  assert.equal(book.feed(JSON.stringify({ e: "serverShutdown", E: 1 }), "A"), false, "serverShutdown is not a diff");
  book.switchTo("B");
  assert.equal(book.feed(diff(15, 16, [["0.10", "9.9"]]), "A"), false, "A is retired from the book");
  book.feed(diff(17, 17), "B");
  assert.deepEqual([book.id, book.levels()?.bids[0], at.length], [17, ["0.10", "3.5"], 1], "one suite in the book");
  const sw = journal().find((e) => e.event === "chain_switched");
  assert.deepEqual([sw?.from, sw?.to, sw?.dropped, sw?.remaining], ["A", "B", 1, 1]);
  assert.ok(!journal().some((e) => e.event === "chain_gap"), "no gap");
  // A switch whose first remaining event leaves a hole (U = id + 2) is a named gap, then a new sync from C's buffer.
  book.feed(diff(19, 20), "C");
  book.switchTo("C");
  await book.idle();
  assert.deepEqual([journal().find((e) => e.event === "chain_gap")?.U, book.id, at.length], [19, 20, 2]);
});
