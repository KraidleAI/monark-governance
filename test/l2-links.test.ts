// test/l2-links.test.ts -- lot L2-P1-a3 (2026-10-04): the spot links of scripts/l2/links.mjs (ADR-L2-CAPTURE-1 D-19 and D-21, section
// 2.3; plan docs/G0-partie-l2-p1.md section 3 points 1 to 5 and 8, D24-1, D24-4, section 8.2) against the loopback fake place of lot
// P1-a1, never the network: the global fetch and WebSocket of this file are tripwires (trap()) and every connection goes through
// viaWebSocket(). Timers and both host clocks are injected, a fake clock that the test moves; segments and the journal are written under
// the OS temp directory (outside any git tree, removed after the file) and read back with the shared reader of lot P1-a2. Each test
// names, on the line above it, the production mutation that reddens it (scripts/red-proof.mjs convention); every outcome is compared by
// assert, a named stop read as its code. Synthetic data only.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LinkStop, openingGate, openLink, spotUrl } from "../scripts/l2/links.mjs";
import type { Gate, Link, LinkIo } from "../scripts/l2/links.mjs";
import { readSegment, segmentOf } from "../scripts/l2/segments.mjs";
import type { SegmentFile } from "../scripts/l2/segments.mjs";
import { OP, startPlace, trap, viaWebSocket, type Peer, type Place } from "./l2-fake-place.ts";

trap();
const ROOT = mkdtempSync(join(tmpdir(), "l2-links-")), places: Place[] = [];
after(async () => {
  for (const p of places) await p.stop();
  rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 });
});
const LF = String.fromCharCode(10), ORIGIN = "wss://stream.binance.com:9443"; // Q-P1-3, written here, never imported
const pathOf = (s: string): string => `/stream?streams=${s}@depth@100ms/${s}@bookTicker/${s}@trade&timeUnit=MICROSECOND`; // points 2, 3
const T0 = Date.UTC(2026, 9, 4, 2) * 1000; // 2026-10-04T02:00:00Z in microseconds, a synthetic hour: the fake clock starts there
type Line = Record<string, unknown>;
interface Clock { now: number; set: (fn: () => void, ms: number) => number; clear: (h: unknown) => void; advance: (ms: number) => void }
interface Rig { place: Place; out: string; clock: Clock; gate: Gate; io: LinkIo; asked: string[]; lines: () => Line[]; link: (symbol: string) => Link }
let made = 0;

/** Timers and host clocks under the test's hand: advance(ms) runs, in time order, each timer due by then, at its own instant. */
function fakeClock(): Clock {
  const due = new Map<number, [number, () => void]>();
  let id = 0;
  const clock: Clock = {
    now: 0,
    set: (fn, ms) => { due.set(++id, [clock.now + ms, fn]); return id; },
    clear: (h) => { due.delete(h as number); },
    advance: (ms) => {
      const end = clock.now + ms;
      for (;;) {
        const next = [...due].filter(([, [at]]) => at <= end).sort((a, b) => a[1][0] - b[1][0] || a[0] - b[0])[0];
        if (next === undefined) break;
        due.delete(next[0]);
        clock.now = next[1][0];
        next[1][1]();
      }
      clock.now = end;
    },
  };
  return clock;
}

/** A fake place running `script` on each connection, a fresh --out, a fake clock, a gate, and the io of links on them; `asked` lists
 *  each call of the factory as it happens, before any byte moves. */
async function rig(script: (peer: Peer) => void, opener?: (path: string) => Promise<SegmentFile>): Promise<Rig> {
  const place = await startPlace(script), out = join(ROOT, `out-${String(++made)}`), clock = fakeClock(), gate = openingGate();
  const factory = viaWebSocket(place, [ORIGIN]), asked: string[] = [];
  places.push(place);
  const io: LinkIo = { webSocket: (url) => { asked.push(url); return factory(url); }, wallUs: () => T0 + clock.now * 1000,
    monoNs: () => BigInt(clock.now) * 1_000_000n, setTimer: clock.set, clearTimer: clock.clear, gate, ...(opener === undefined ? {} : { open: opener }) };
  const file = join(out, "journal.jsonl");
  const lines = (): Line[] => (existsSync(file) ? readFileSync(file, "utf8").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Line) : []);
  return { place, out, clock, gate, io, asked, lines, link: (symbol) => openLink({ symbol, url: spotUrl(symbol), out }, io) };
}
const events = (r: Rig): unknown[] => r.lines().map((l) => l.event);
const wait = (ms: number): Promise<void> => new Promise((ok) => { setTimeout(ok, ms); });
/** The loopback runs in real time: the condition, polled 1 000 times every 10 ms (about 15 s under the timer granularity of Windows),
 *  else an assertion failure (never a throw nor a hang). */
async function until(cond: () => boolean, what: string): Promise<void> {
  for (let i = 0; i < 1000 && !cond(); i++) await wait(10);
  assert.ok(cond(), what);
}
/** "none", or the code of a named stop: always a string, so that a mutant reddens by assertion (G1 of P1-a2, C-2). */
function attempt(f: () => unknown): string {
  try {
    f();
    return "none";
  } catch (e) {
    return e instanceof LinkStop ? e.code : `not a stop: ${e instanceof Error ? e.message : "unknown"}`;
  }
}
const framesOf = (r: Rig, cid: unknown): string[] => [...readSegment(r.out, String(cid), segmentOf(T0))].map((f) => f.bytes.toString("utf8"));

// killer: scripts/l2/links.mjs:92 CONST "!PLAIN.test(v)" -> "false"
test("l2_capture_raw_as_served", async () => {
  const wide = String.fromCodePoint(0xe9, 0x20ac, 0x1f600); // two, three and four bytes in UTF-8
  const texts = [JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", t: 1 } }), "", `{"s":"${wide}"}`, "x".repeat(70_000)];
  const r = await rig((peer) => {
    if (r.place.peers.length > 1) { peer.send(2, Buffer.from([0, 255])); return; } // the second connection serves a binary message
    for (const t of texts) peer.send(OP.text, t);
    peer.send(OP.ping, "p-1");
    peer.send(OP.close, Buffer.concat([Buffer.from([3, 232]), Buffer.from(`${r.place.host}:${String(r.place.port)}`)])); // 1000, an address
  });
  const link = r.link("BTCUSDT");
  await until(() => events(r).length === 4, "the first connection: open, ping, close, retry");
  r.clock.advance(1_000);
  await until(() => events(r).length === 7, "the second one: open, close, retry");
  const [first, second] = r.place.peers;
  await until(() => first?.got.length === 2 && second?.got.length === 1, "the frames of the client");
  await link.stop();
  const js = r.lines(), cid = js[0]?.cid;
  assert.deepEqual(js.map((l) => [l.event, l.cid === cid, l.cause ?? l.delay_ms ?? null]), [["open", true, null], ["ping", true, null],
    ["close", true, "closed"], ["retry", true, 1_000], ["open", false, null], ["close", false, "binary_message"], ["retry", false, 2_000]]);
  assert.deepEqual([js[0]?.streams, js[0]?.time_unit, js[0]?.extensions, js[1]?.bytes, js[2]?.code, js[2]?.reason, js[2]?.clean],
    ["btcusdt@depth@100ms/btcusdt@bookTicker/btcusdt@trade", "MICROSECOND", "", 3, 1000, null, true], "streams, extensions, ping, close");
  const raw = readFileSync(join(r.out, "conn", String(cid), `${segmentOf(T0)}.frames`));
  assert.deepEqual([framesOf(r, cid), raw.equals(Buffer.from(texts.map((t) => t + LF).join(""), "utf8")), existsSync(join(r.out, "conn", String(js[4]?.cid)))],
    [texts, true, false], "the raw: the bytes served, each then LF; the binary message never written");
  assert.deepEqual([first, second].map((p) => p?.got.map((f) => [f.op, f.masked, f.op === OP.close ? f.payload.readUInt16BE(0) : f.payload.toString()])),
    [[[OP.pong, true, "p-1"], [OP.close, true, 1000]], [[OP.close, true, 1000]]], "the client sent a PONG and a CLOSE, nothing else");
  assert.deepEqual(r.place.peers.map((p) => p.path), [pathOf("btcusdt"), pathOf("btcusdt")]);
  const leaks = js.flatMap((l) => Object.values(l)).filter((v) => typeof v === "string" && (v.includes(r.place.host) || v.includes(`:${String(r.place.port)}`)));
  assert.deepEqual([leaks, readFileSync(join(r.out, "journal.jsonl"), "utf8").includes(r.place.host)], [[], false], "no address in the journal");
});

// killer: scripts/l2/links.mjs:33 CONST "WATCHDOG_K = 3" -> "WATCHDOG_K = 4"
test("l2_half_open_watchdog_named", async () => {
  const r = await rig((peer) => { if (r.place.peers.length > 1) peer.mute(); }); // the second connection: mute from its opening on
  const link = r.link("ETHUSDT"), shape = (l: Line): unknown[] => [l.event, l.cause ?? l.delay_ms ?? null, (Number(l.host_us) - T0) / 1000];
  await until(() => events(r).includes("open"), "the first connection open at t = 0");
  const first = r.place.peers[0], frames = join(r.out, "conn", String(r.lines()[0]?.cid), `${segmentOf(T0)}.frames`);
  r.clock.advance(30_000);
  first?.send(OP.ping, "w");
  await until(() => events(r).includes("ping"), "a ping at 30 s");
  r.clock.advance(40_000);
  assert.deepEqual(events(r), ["open", "ping"], "70 s: the ping put the deadline back");
  first?.send(OP.text, "{}");
  await until(() => existsSync(frames) && readFileSync(frames).length === 3, "a frame at 70 s, written");
  first?.mute();
  r.clock.advance(59_999);
  assert.deepEqual(events(r), ["open", "ping"], "the frame put it back too: nothing at k x 20 s - 1 ms");
  r.clock.advance(1);
  assert.deepEqual(events(r).slice(2, 3), ["close"], "a named close at k x 20 s");
  await until(() => first?.got.some((f) => f.op === OP.close) === true, "the client sent its CLOSE, unanswered by the mute place");
  await until(() => events(r).includes("retry"), "its writer closed, a reopening");
  r.clock.advance(1_000);
  await until(() => events(r).length === 5, "the second connection open, then neither a message nor a ping");
  r.clock.advance(60_000);
  await until(() => events(r).length === 7, "closed at k x 20 s from its attempt");
  await link.stop();
  assert.deepEqual(r.lines().map(shape), [["open", null, 0], ["ping", null, 30_000], ["close", "watchdog", 130_000], ["retry", 1_000, 130_000],
    ["open", null, 131_000], ["close", "watchdog", 191_000], ["retry", 2_000, 191_000]], "each hole named by its close, then the next opening");
  assert.deepEqual([framesOf(r, r.lines()[0]?.cid), r.place.peers.length], [["{}"], 2]);
});

// killer: scripts/l2/links.mjs:123 CONST "end(c, s.code);" -> ""
test("l2_backpressure_named_stop", async () => {
  const MIB = 1_048_576, BOUND = 8_388_608; // D24-4, written here, never imported
  let release = (): void => undefined;
  const held = new Promise<void>((ok) => { release = ok; });
  const slow = async (path: string): Promise<SegmentFile> => { // every write waits for release(): a stalled disk
    const h = await open(path, "ax");
    return { appendFile: async (data) => { await held; await h.appendFile(data); }, close: () => h.close() };
  };
  const r = await rig((peer) => { if (r.place.peers.length === 1) for (let i = 0; i < 9; i++) peer.send(OP.text, String(i).repeat(MIB)); }, slow);
  const link = r.link("BNBUSDT");
  await until(() => events(r).includes("close"), "the ninth MiB overflows the queue");
  const [opened, stop, closed] = r.lines();
  assert.deepEqual([stop, closed?.cause], [{ host_us: T0, mono_ns: "0", symbol: "BNBUSDT", cid: opened?.cid, event: "writer_stop",
    cause: "queue_overflow", bound: BOUND, queued: BOUND, length: MIB, recv_us: T0 }, "queue_overflow"], "named, the hole from the refused frame on");
  await until(() => r.place.peers[0]?.got.some((f) => f.op === OP.close) === true, "its CLOSE reached the place");
  assert.deepEqual(events(r), ["open", "writer_stop", "close"], "no reopening while the stalled disk holds the queue");
  release();
  await until(() => events(r).includes("retry"), "the queue written, then a reopening");
  await link.stop();
  assert.deepEqual(framesOf(r, opened?.cid).map((t) => [t.length, t[0]]), [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [MIB, String(i)]),
    "the eight MiB accepted before the overflow are written, the ninth never");
});

// killer: scripts/l2/links.mjs:122 SDL "{ cause: s.code, ...s.detail }" -> ""
test("l2_writer_stop_named_after_close", async () => {
  let release = (): void => undefined, writes = 0;
  const held = new Promise<void>((ok) => { release = ok; });
  const failing = async (path: string): Promise<SegmentFile> => { // the third write, the frame of rank 1, fails once the place has closed
    const h = await open(path, "ax");
    return { appendFile: async (data) => { await held; if (++writes === 3) throw new Error("simulated write failure"); await h.appendFile(data); },
      close: () => h.close() };
  };
  const r = await rig((peer) => { peer.send(OP.text, "f0"); peer.send(OP.text, "f1"); peer.close(1000); }, failing);
  const link = r.link("SOLUSDT");
  await until(() => events(r).includes("close"), "the place closed the connection, its writer still holding two frames");
  release();
  await until(() => events(r).includes("retry"), "the writer stopped on its flush, then a reopening");
  await link.stop();
  const js = r.lines();
  assert.deepEqual(js.map((l) => [l.event, l.cause ?? l.delay_ms ?? null]), [["open", null], ["close", "closed"], ["writer_stop", "write_failed"], ["retry", 1_000]]);
  assert.deepEqual([js[2]?.unwritten, js[2]?.recv_us, js[2]?.message, framesOf(r, js[0]?.cid)], [1, T0, "simulated write failure", ["f0"]],
    "the frame never written is named, though its connection had closed");
});

// killer: scripts/l2/links.mjs:36 CONST "OPENS_MAX = 30" -> "OPENS_MAX = 31"
test("l2_reconnect_attempts_bounded", async () => {
  const r = await rig((peer) => { peer.cut(); }); // each connection cut at once: an unplanned reopening each time
  assert.deepEqual(Array.from({ length: 29 }, () => r.gate.take(0)), Array.from({ length: 29 }, () => 0), "29 openings of other links at t = 0");
  const link = r.link("SOLUSDT"); // the 30th opening within these 5 minutes
  await until(() => events(r).includes("retry"), "the cut connection closed, a reopening in 1 s");
  r.clock.advance(1_000);
  assert.deepEqual([r.lines().at(-1)?.event, r.lines().at(-1)?.wait_ms, r.asked.length], ["defer", 299_000, 1], "a 31st opening in 5 minutes waits, named");
  r.clock.advance(298_999);
  assert.equal(r.asked.length, 1, "no opening before the oldest one leaves the window");
  r.clock.advance(1);
  assert.equal(r.asked.length, 2, "the opening once a slot is free");
  assert.deepEqual(Array.from({ length: 30 }, () => r.gate.take(300_000)).filter((w) => w > 0), [300_000], "the window slid: 29 more, then a wait");
  await until(() => events(r).filter((e) => e === "retry").length === 2, "the second connection cut, a reopening scheduled");
  await link.stop();
  r.clock.advance(60_000);
  assert.equal(r.asked.length, 2, "a stopped link opens nothing more: its timer cancelled");
});

// killer: scripts/l2/links.mjs:62 CONST "h.startsWith(`${o}/`)" -> "true"
test("l2_host_refused", async () => {
  const r = await rig(() => undefined), q = pathOf("btcusdt");
  const urls = [`wss://data-stream.binance.vision${q}`, `wss://stream.binance.com:443${q}`, `wss://stream.binance.com${q}`, `ws://stream.binance.com:9443${q}`,
    `wss://stream.binance.com:9443.other.example${q}`, `wss://u@stream.binance.com:9443${q}`, `wss://stream.binance.com:9444${q}`, "not a url"];
  assert.deepEqual(urls.map((url) => attempt(() => openLink({ symbol: "BTCUSDT", url, out: r.out }, r.io))), urls.map(() => "host_refused"));
  assert.deepEqual([attempt(() => openLink({ symbol: "XRPUSDT", url: `${ORIGIN}${q}`, out: r.out }, r.io)), r.asked, existsSync(r.out)],
    ["bad_symbol", [], false], "refused before the factory is called, nothing written");
  const link = openLink({ symbol: "BTCUSDT", url: `${ORIGIN}${q}`, out: r.out }, r.io);
  await until(() => r.place.peers.length === 1, "the admitted origin opens on the place");
  assert.deepEqual([r.asked, r.place.peers[0]?.path], [[`${ORIGIN}${q}`], q]);
  await link.stop();
  assert.deepEqual([events(r).includes("retry"), r.lines().at(-1)?.cause], [false, "stopped"], "a stopped link schedules no reopening");
});

// killer: scripts/l2/links.mjs:35 CONST "RETRY_CAP_MS = 60_000" -> "RETRY_CAP_MS = 120_000"
test("l2_reconnect_delay_capped", async () => {
  const want = [1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 60_000, 60_000];
  const r = await rig((peer) => { // eight connections cut at once, then a ninth that delivers a message before its close
    if (r.place.peers.length <= want.length) { peer.cut(); return; }
    peer.send(OP.text, "{}");
    peer.close(1000);
  });
  const delays = (): unknown[] => r.lines().filter((l) => l.event === "retry").map((l) => l.delay_ms);
  const link = r.link("ETHUSDT");
  for (const [i, ms] of want.entries()) {
    await until(() => delays().length > i, `reopening ${String(i + 1)} scheduled`);
    assert.equal(delays()[i], ms, `reopening ${String(i + 1)}: doubled from 1 s, capped at 60 s`);
    r.clock.advance(ms);
  }
  await until(() => delays().length > want.length, "the ninth connection delivered a message, then closed");
  assert.deepEqual([delays()[want.length], r.asked.length], [1_000, want.length + 1], "back to 1 s after a connection that delivered one");
  await link.stop();
});

// killer: scripts/l2/links.mjs:56 CONST "&timeUnit=${TIME_UNIT}" -> ""
test("l2_combined_url_time_unit", () => {
  assert.deepEqual(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"].map((s) => spotUrl(s)), ["btcusdt", "ethusdt", "bnbusdt", "solusdt"].map((s) => ORIGIN + pathOf(s)));
  assert.deepEqual(["XRPUSDT", "btcusdt", ""].map((s) => attempt(() => spotUrl(s))), ["bad_symbol", "bad_symbol", "bad_symbol"], "a closed list of symbols");
});
