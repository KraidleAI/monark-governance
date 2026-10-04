// test/l2-continuity.test.ts -- lot L2-P1-a4 (2026-10-04): continuity and /market of scripts/l2/links.mjs (ADR-L2-CAPTURE-1 D-8, D-21,
// TL-6 raw part, TL-7a link; plan docs/G0-partie-l2-p1.md section 3 points 3 to 7 and section 8.2; lot plan docs/G0-lot-l2-p1-a4.md):
// planned reconnection in overlap, serverShutdown read after the writer has the frame, the /market link and its futures watchdog. Never
// the network: the global fetch and WebSocket are tripwires (trap()); connections go to the loopback fake place of P1-a1 or are sockets
// the test drives by hand, their pings published on the channel the link reads (undici:websocket:ping). Timers and both host clocks are
// injected (a fake clock the test moves); output under the OS temp directory, made in before(), removed after. links.mjs is imported as
// a namespace, so that at the base (without the exports of this lot) each test reddens by assertion, never at load. Each test names, on
// the line above it, the production mutation that reddens it (scripts/red-proof.mjs convention). Synthetic data only.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { channel } from "node:diagnostics_channel";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as L from "../scripts/l2/links.mjs";
import type { Link, LinkIo, LinkSpec } from "../scripts/l2/links.mjs";
import { readSegment, segmentOf } from "../scripts/l2/segments.mjs";
import { OP, startPlace, trap, viaWebSocket, type Place } from "./l2-fake-place.ts";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-continuity.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-LINKS-FILE-CRASH-1)
let ROOT = ""; const places: Place[] = []; before(() => { trap(); ROOT = mkdtempSync(join(tmpdir(), "l2-continuity-")); });
after(async () => {
  for (const p of places) await p.stop();
  if (ROOT !== "") rmSync(ROOT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});
const LF = String.fromCharCode(10), SPOT = "wss://stream.binance.com:9443", MARKET = "wss://fstream.binance.com"; // written here, never imported
const MARKET_PATH = "/market/stream?streams=btcusdt@forceOrder/ethusdt@forceOrder/bnbusdt@forceOrder/solusdt@forceOrder"; // FAITS-L2-ACCESS-3 (b)
const T0 = Date.UTC(2026, 9, 4, 2) * 1000, H23 = 82_800_000, MIN5 = 300_000; // a synthetic start, in microseconds; section 3 point 6
type Line = Record<string, unknown>;
type Fake = { onopen: () => void; onmessage: (e: { data: unknown }) => void; onclose: (e: object) => void; close: () => void; extensions: string };
const PING = channel("undici:websocket:ping");
let made = 0;

/** Timers and host clocks under the test's hand (as test/l2-links.test.ts): advance(ms) runs each timer due by then, at its instant. */
function fakeClock(): { now: number; set: (fn: () => void, ms: number) => number; clear: (h: unknown) => void; advance: (ms: number) => void; pending: () => number } {
  const due = new Map<number, [number, () => void]>();
  let id = 0;
  const clock = { now: 0, set: (fn: () => void, ms: number) => { due.set(++id, [clock.now + ms, fn]); return id; }, pending: () => due.size,
    clear: (h: unknown) => { due.delete(h as number); },
    advance: (ms: number) => {
      const end = clock.now + ms;
      for (;;) {
        const next = [...due].filter(([, [at]]) => at <= end).sort((a, b) => a[1][0] - b[1][0] || a[0] - b[0])[0];
        if (next === undefined) break;
        due.delete(next[0]);
        clock.now = next[1][0];
        next[1][1]();
      }
      clock.now = end;
    } };
  return clock;
}

/** A fresh --out, a fake clock, the io of links on them; `place` given: its factory, else sockets driven by hand, listed in `socks`. */
function rig(place?: Place): { out: string; clock: ReturnType<typeof fakeClock>; io: LinkIo; socks: Fake[]; lines: () => Line[]; open: (s: Omit<LinkSpec, "out">) => Link } {
  const out = join(ROOT, `out-${String(++made)}`), clock = fakeClock(), socks: Fake[] = [], gate = L.openingGate();
  const hand = (): WebSocket => { const s = { close: () => undefined, extensions: "" } as Fake; socks.push(s); return s as unknown as WebSocket; };
  const io: LinkIo = { webSocket: place === undefined ? hand : viaWebSocket(place, [SPOT, MARKET]), wallUs: () => T0 + clock.now * 1000,
    monoNs: () => BigInt(clock.now) * 1_000_000n, setTimer: clock.set, clearTimer: clock.clear, gate };
  const file = join(out, "journal.jsonl");
  const lines = (): Line[] => (existsSync(file) ? readFileSync(file, "utf8").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Line) : []);
  return { out, clock, io, socks, lines, open: (s) => L.openLink({ ...s, out }, io) };
}
type Rig = ReturnType<typeof rig>;
/** The journal without its pings: [event, cid rank among the cids seen, cause or to, ms since the start]. */
function shape(r: Rig): unknown[][] {
  const cids: unknown[] = [];
  return r.lines().filter((l) => l.event !== "ping").map((l) => {
    if (!cids.includes(l.cid)) cids.push(l.cid);
    const to = l.to === undefined ? undefined : cids.indexOf(l.to);
    return [l.event, cids.indexOf(l.cid), l.cause ?? to ?? null, (Number(l.host_us) - T0) / 1000];
  });
}
/** The place's pings, every 50 s, on each socket driven by hand, until the fake clock reads `to`. */
function live(r: Rig, to: number): void {
  while (r.clock.now < to) {
    for (const s of r.socks) PING.publish({ payload: Buffer.from("k"), websocket: s });
    r.clock.advance(Math.min(50_000, to - r.clock.now));
  }
}
const wait = (ms: number): Promise<void> => new Promise((ok) => { setTimeout(ok, ms); });
async function until(cond: () => boolean, what: string): Promise<void> {
  for (let i = 0; i < 1000 && !cond(); i++) await wait(10);
  assert.ok(cond(), what);
}
const framesOf = (r: Rig, cid: unknown, ms: number): string[] =>
  [...readSegment(r.out, String(cid), segmentOf(T0 + ms * 1000))].map((f) => f.bytes.toString("utf8"));
const attempt = (f: () => unknown): string => {
  try { f(); return "none"; } catch (e) { return e instanceof L.LinkStop ? e.code : "not a stop"; }
};

// killer: scripts/l2/links.mjs:45 CONST "OVERLAP_MS = 60_000" -> "OVERLAP_MS = 59_999"
test("l2_overlap_planned_raw", async () => {
  const r = rig(), link = r.open({ symbol: "BNBUSDT", url: L.spotUrl("BNBUSDT") }), at = H23 + 2 * MIN5; // rank 2: 23 h 10 min
  r.socks[0]?.onopen();
  r.socks[0]?.onmessage({ data: "a0" });
  live(r, at - 1);
  assert.deepEqual([r.socks.length, shape(r)], [1, [["open", 0, null, 0]]], "one connection until 23 h 10 min - 1 ms");
  live(r, at);
  assert.deepEqual([r.socks.length, shape(r).at(-1)], [2, ["renew", 0, "age", at]], "at 23 h 10 min, a planned renewal: a new connection");
  r.socks[1]?.onopen();
  r.socks[0]?.onmessage({ data: "a1" });
  r.socks[1]?.onmessage({ data: "b0" });
  const cidB = r.lines().filter((l) => l.event === "open")[1]?.cid;
  assert.equal(link.switched("spot-BNBUSDT-20261004T000000000Z"), false, "another cid: nothing changes");
  live(r, at + 10_000);
  assert.equal(link.switched(String(cidB)), true, "the book switched to the new connection, 10 s into the overlap");
  live(r, at + 59_999);
  assert.deepEqual(shape(r).map((l) => l[0]), ["open", "renew", "open"], "switched, the old one still open 60 s - 1 ms into the overlap");
  live(r, at + 60_000);
  assert.deepEqual(shape(r), [["open", 0, null, 0], ["renew", 0, "age", at], ["open", 1, null, at], ["close", 0, "renewed", at + 60_000]],
    "the new one opened before the old one closed: no instant without an open connection");
  assert.equal(link.switched(String(cidB)), false, "no overlap left");
  await wait(50);
  live(r, at + 200_000);
  await link.stop();
  assert.deepEqual([r.socks.length, shape(r).filter((l) => l[0] === "retry")], [2, []], "the old one is never reopened");
  const [a, b] = r.lines().filter((l) => l.event === "open").map((l) => l.cid);
  assert.deepEqual([framesOf(r, a, 0), framesOf(r, a, at), framesOf(r, b, at)], [["a0"], ["a1"], ["b0"]], "both runs in the raw");
});

// killer: scripts/l2/links.mjs:44 CONST "RENEW_STAGGER_MS = 300_000" -> "RENEW_STAGGER_MS = 240_000"
test("l2_renewal_age_staggered_by_rank", async () => {
  assert.equal(typeof L.marketUrl, "function", "the /market URL exists");
  const r = rig(), links = L.SYMBOLS.map((symbol) => r.open({ symbol, url: L.spotUrl(symbol) }));
  links.push(r.open({ symbol: "ALL", url: L.marketUrl(), kind: "market" }));
  live(r, H23 + 4 * MIN5 + 1);
  for (const link of links) await link.stop();
  assert.equal(r.clock.pending(), 0, "stopped links leave no timer: watchdog, age, overlap, reopening");
  assert.deepEqual(r.lines().filter((l) => l.event === "renew").map((l) => [l.symbol, l.cause, (Number(l.host_us) - T0) / 1000]),
    [["BTCUSDT", "age", H23], ["ETHUSDT", "age", H23 + MIN5], ["BNBUSDT", "age", H23 + 2 * MIN5], ["SOLUSDT", "age", H23 + 3 * MIN5],
      ["ALL", "age", H23 + 4 * MIN5]], "23 h of age plus 5 min x rank, /market last: at most 23 h 20 min, 40 min before the 24 h bound");
});

// killer: scripts/l2/links.mjs:176 SDL "if (isShutdown(e.data)) renew(c, \"server_shutdown\");" -> ""
test("l2_server_shutdown_renews_at_once", async () => {
  const r = rig(), link = r.open({ symbol: "SOLUSDT", url: L.spotUrl("SOLUSDT") }), at = 1_000;
  const decoy = '{"stream":"solusdt@trade","data":{"e":"trade","x":"serverShutdown"}}', down = '{"stream":"!serverShutdown","data":{"e":"serverShutdown","E":7}}';
  r.socks[0]?.onopen();
  live(r, at);
  r.socks[0]?.onmessage({ data: decoy });
  assert.equal(r.socks.length, 1, "the word in another payload renews nothing");
  r.socks[0]?.onmessage({ data: down });
  assert.deepEqual([r.socks.length, shape(r).at(-1)], [2, ["renew", 0, "server_shutdown", at]], "serverShutdown: a new connection at once");
  r.socks[1]?.onopen();
  live(r, at + 120_000);
  r.socks[1]?.onmessage({ data: '{"e":"serverShutdown","E":8}' }); // the raw form, on the new connection, during the overlap
  assert.deepEqual([r.socks.length, shape(r).slice(2)], [2, [["open", 1, null, at], ["renew_deferred", 1, "server_shutdown", at + 120_000]]],
    "never switched: the old one stays open past 60 s, no failover; a second renewal waits for the end of the overlap, named");
  r.socks[0]?.onclose({ code: 1006, reason: "", wasClean: false }); // until the place cuts it
  const cut = at + 120_000;
  assert.deepEqual([r.socks.length, shape(r).slice(4)], [3, [["close", 0, "closed", cut], ["overlap_break", 0, 1, cut], ["renew", 1, "server_shutdown", cut]]],
    "then a named break, and the renewal that waited");
  await wait(50);
  live(r, at + 240_000);
  assert.equal(r.socks.length, 3, "the old one is never reopened");
  r.socks[2]?.onopen(); // an overlap begins
  await link.stop();
  assert.equal(r.clock.pending(), 0, "stopped within an overlap: no timer left");
  assert.deepEqual(shape(r).slice(-2), [["close", 2, "stopped", at + 240_000], ["close", 1, "stopped", at + 240_000]],
    "stopped within an overlap: both closes named stopped, no overlap_break");
  assert.deepEqual(framesOf(r, r.lines()[0]?.cid, 0), [decoy, down], "read after the writer has it: the frame is in the raw");
});

// killer: scripts/l2/links.mjs:42 CONST "FUTURES_PING_MS = 180_000" -> "FUTURES_PING_MS = 120_000"
test("l2_market_link_futures_watchdog", async () => {
  assert.equal(typeof L.marketUrl, "function", "the /market URL exists");
  assert.equal(L.marketUrl(), MARKET + MARKET_PATH, "the four @forceOrder, no timeUnit (FAITS-L2-ACCESS-3 (e) not established)");
  const place = await startPlace((peer) => { peer.send(OP.text, '{"stream":"btcusdt@forceOrder","data":{}}'); peer.mute(); });
  places.push(place);
  const r = rig(place), link = r.open({ symbol: "ALL", url: L.marketUrl(), kind: "market" });
  await until(() => r.lines().length === 1 && place.peers.length === 1, "open on the place");
  const cid = r.lines()[0]?.cid, frames = join(r.out, "conn", String(cid), `${segmentOf(T0)}.frames`);
  await until(() => existsSync(frames) && readFileSync(frames).length > 0, "the liquidation in the raw");
  r.clock.advance(539_999);
  assert.deepEqual(shape(r), [["open", 0, null, 0]], "silent 540 s - 1 ms: open");
  r.clock.advance(1);
  assert.deepEqual(shape(r), [["open", 0, null, 0], ["close", 0, "watchdog", 540_000]], "k x 180 s: a named close");
  await link.stop();
  assert.deepEqual([place.peers[0]?.path, r.lines()[0]?.time_unit, String(cid).startsWith("market-ALL-"), framesOf(r, cid, 0)],
    [MARKET_PATH, null, true, ['{"stream":"btcusdt@forceOrder","data":{}}']]);
  const no = (spec: Omit<LinkSpec, "out">): string => attempt(() => r.open(spec));
  assert.deepEqual([no({ symbol: "ALL", url: L.spotUrl("BTCUSDT"), kind: "market" }), no({ symbol: "BTCUSDT", url: L.marketUrl() }),
    no({ symbol: "ALL", url: `${MARKET}/stream?streams=btcusdt@forceOrder`, kind: "market" }), no({ symbol: "BTCUSDT", url: L.marketUrl(), kind: "market" }),
    no({ symbol: "ALL", url: L.marketUrl(), kind: "futures" as "market" })], ["host_refused", "host_refused", "host_refused", "bad_symbol", "bad_kind"]);
});

// killer: scripts/l2/links.mjs:118 CONST "switchedTo === cur.cid" -> "switchedTo !== null"
test("l2_stale_switch_bound_to_its_connection", async () => {
  assert.equal(typeof L.marketUrl, "function", "the links of P1-a4 exist");
  const r = rig(), link = r.open({ symbol: "BTCUSDT", url: L.spotUrl("BTCUSDT") }), at = H23; // rank 0: 23 h
  r.socks[0]?.onopen();
  live(r, at);
  r.socks[1]?.onopen(); // new connection #1
  const one = String(r.lines().filter((l) => l.event === "open")[1]?.cid);
  assert.equal(link.switched(one), true, "the book switched to #1");
  live(r, at + 10_000);
  r.socks[1]?.onclose({ code: 1006, reason: "", wasClean: false }); // #1 dies during the overlap
  assert.equal(link.switched(one), false, "#1 is dead: nothing to switch to");
  await wait(50);
  live(r, at + 11_000);
  assert.equal(r.socks.length, 3, "a new connection #2 after 1 s; the old one is never reopened");
  r.socks[2]?.onopen();
  const two = String(r.lines().filter((l) => l.event === "open")[2]?.cid);
  live(r, at + 71_000);
  assert.deepEqual(shape(r).filter((l) => l[0] === "close"), [["close", 1, "closed", at + 10_000]],
    "#2 open 60 s, the switch to #1 is stale: the old one stays open");
  assert.equal(link.switched(two), true, "the book switched to #2");
  assert.deepEqual(shape(r).at(-1), ["close", 0, "renewed", at + 71_000], "switched(#2): the old one closes");
  await link.stop();
  assert.equal(r.clock.pending(), 0, "no timer left");
});

// killer: scripts/l2/links.mjs:118 CONST "kind === \"market\" ||" -> "false ||"
test("l2_market_overlap_needs_no_switch", async () => {
  assert.equal(typeof L.marketUrl, "function", "the /market URL exists");
  const r = rig(), link = r.open({ symbol: "ALL", url: L.marketUrl(), kind: "market" }), at = H23 + 4 * MIN5; // rank 4: 23 h 20 min
  r.socks[0]?.onopen();
  live(r, at);
  assert.deepEqual([r.socks.length, shape(r).at(-1)], [2, ["renew", 0, "age", at]], "a planned renewal of /market");
  r.socks[1]?.onopen();
  live(r, at + 59_999);
  assert.deepEqual(shape(r).map((l) => l[0]), ["open", "renew", "open"], "60 s - 1 ms into the overlap: the old one still open");
  live(r, at + 60_000);
  assert.deepEqual(shape(r).slice(2), [["open", 1, null, at], ["close", 0, "renewed", at + 60_000]],
    "60 s: the old one closes, renewed, switched() never called (/market feeds no book)");
  await link.stop();
});

// killer: scripts/l2/links.mjs:107 CONST "kind === \"market\" && u.searchParams.has(\"timeUnit\")" -> "false"
test("l2_market_url_closed", async () => {
  assert.equal(typeof L.marketUrl, "function", "the /market URL exists");
  const r = rig(), tail = MARKET_PATH.slice("/market".length), no = (url: string): string => attempt(() => r.open({ symbol: "ALL", url, kind: "market" }));
  assert.deepEqual([no(`${MARKET}/marketx${tail}`), no(`${MARKET}/market?streams=btcusdt@forceOrder`), no(`${L.marketUrl()}&timeUnit=MICROSECOND`),
    no(`${MARKET}/market/..%2fpublic${tail}`), no(`${MARKET}/market/..%5Cpublic${tail}`), no(`${MARKET}/market/%2e%2e/public${tail}`)],
  ["host_refused", "host_refused", "host_refused", "host_refused", "host_refused", "host_refused"], "refused: route, timeUnit (e), encoded segments");
  assert.equal(r.socks.length, 0, "refused before the factory");
  const asked: string[] = [], io: LinkIo = { ...r.io, webSocket: (url: string) => { asked.push(url); return r.io.webSocket(url); } };
  const link = L.openLink({ symbol: "ALL", url: `wss://FSTREAM.binance.com:443${MARKET_PATH}`, out: r.out, kind: "market" }, io);
  assert.deepEqual(asked, [MARKET + MARKET_PATH], "the factory opens the URL checked, not the string given");
  await link.stop();
});
