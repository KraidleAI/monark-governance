// test/l2-fake-place.test.ts -- lot P1-a1 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md, sections 5 and 8.2): the self-test of
// test/l2-fake-place.ts against the WebSocket client and the fetch embedded in this Node (undici), on the loopback only, never against
// the recorder (FM-3.3). The eight cases of section 8.2 keep as assertions the facts that the plan measured on the prototype (L-3). The
// global fetch and WebSocket of this file are tripwires (trap()): every client goes through an injected factory. Each test names, on
// the line above it, the mutation of test/l2-fake-place.ts that reddens it (killer form of scripts/red-proof.mjs). Synthetic data only.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { OP, startPlace, trap, viaFetch, viaWebSocket, type Peer, type Place } from "./l2-fake-place.ts";

trap();
const WS = "wss://stream.place.example", REST = "https://api.place.example"; // synthetic origins, allowed by the tests below
const PATH = "/stream?streams=a@depth@100ms/a@bookTicker";
const places: Place[] = [];
after(async () => { for (const p of places) await p.stop(); });
const wait = (ms: number): Promise<void> => new Promise((ok) => { setTimeout(ok, ms); });
const until = async (cond: () => boolean): Promise<void> => {
  for (let i = 0; i < 300 && !cond(); i++) await wait(10);
  assert.ok(cond(), "condition not met in 3 s");
};
const opened = (ws: WebSocket): Promise<void> =>
  new Promise<void>((ok, ko) => { ws.onopen = (): void => { ok(); }; ws.onerror = (): void => { ko(new Error("no open")); }; });
/** A place whose connections run `script`, a client on it through the factory, and the messages that client receives as bytes (UTF-8
 *  of a text; the bytes of a binary message, so that a BOM served in a binary frame would reach `got`). */
async function session(script: (peer: Peer) => void): Promise<{ place: Place; ws: WebSocket; got: Buffer[]; codes: number[] }> {
  const place = await startPlace(script);
  places.push(place);
  const ws = viaWebSocket(place, [WS])(`${WS}${PATH}`), got: Buffer[] = [], codes: number[] = [];
  ws.binaryType = "arraybuffer";
  ws.onmessage = (e: MessageEvent): void => {
    const d: unknown = e.data;
    got.push(typeof d === "string" ? Buffer.from(d, "utf8") : Buffer.from(d as ArrayBuffer));
  };
  ws.onclose = (e: CloseEvent): void => { codes.push(e.code); };
  await opened(ws);
  return { place, ws, got, codes };
}

// killer: test/l2-fake-place.ts:31 ROR "n < 126" -> "n <= 126"
test("fake_place_handshake_and_three_length_forms_byte_identical", async () => {
  const wide = String.fromCodePoint(0xe9, 0x20ac, 0x1f600); // two, three and four bytes in UTF-8
  const texts = [0, 125, 126, 65_535, 65_536, 200_000].map((n) => "a".repeat(n)).concat([`{"u":7,"s":"${wide}"}`]);
  const s = await session((peer) => { for (const t of texts) peer.send(OP.text, t); });
  await until(() => s.got.length === texts.length);
  assert.deepEqual(s.got.map((b) => b.toString("hex")), texts.map((t) => Buffer.from(t, "utf8").toString("hex")));
  assert.deepEqual([s.place.host, s.place.port > 10_080, s.place.peers[0]?.path, s.ws.extensions], ["127.0.0.1", true, PATH, ""]);
  assert.match(s.place.peers[0]?.offered ?? "", /permessage-deflate/);
  s.ws.close();
});

// killer: test/l2-fake-place.ts:32 CONST "(fin ? 0x80 : 0)" -> "0x80"
test("fake_place_fragments_reach_the_client_as_one_message", async () => {
  const s = await session((peer) => { peer.send(OP.text, "{\"a\":", false); peer.send(OP.cont, "1", false); peer.send(OP.cont, "}", true); });
  await until(() => s.got.length === 1);
  assert.equal(s.got[0]?.toString("utf8"), "{\"a\":1}");
  s.ws.close();
});

// killer: test/l2-fake-place.ts:52 CONST "masked; i++" -> "false; i++"
test("fake_place_ping_gets_a_masked_pong_with_the_same_payload_and_nothing_else", async () => {
  const s = await session((peer) => { peer.send(OP.ping, "p-1"); peer.send(OP.ping, ""); });
  const peer = s.place.peers[0];
  await until(() => (peer?.got.length ?? 0) === 2);
  assert.deepEqual(peer?.got.map((f) => [f.op, f.masked, f.payload.toString("utf8")]), [[OP.pong, true, "p-1"], [OP.pong, true, ""]]);
  s.ws.close();
  await until(() => s.codes.length === 1);
  assert.deepEqual(peer?.got.map((f) => f.op), [OP.pong, OP.pong, OP.close]);
});

// killer: test/l2-fake-place.ts:92 CONST "writeUInt16BE(code)" -> "writeUInt16BE(1000)"
test("fake_place_server_close_is_answered_and_seen_with_its_code", async () => {
  const s = await session((peer) => { peer.close(1001); });
  await until(() => s.codes.length === 1);
  assert.deepEqual(s.codes, [1001]);
  assert.deepEqual(s.place.peers[0]?.got.map((f) => [f.op, f.masked, f.payload.readUInt16BE(0)]), [[OP.close, true, 1001]]);
});

// killer: test/l2-fake-place.ts:93 CONST "muted = true" -> "muted = false"
test("fake_place_mute_answers_nothing_and_a_cut_ends_the_client", async () => {
  const s = await session((peer) => { peer.mute(); });
  const peer = s.place.peers[0];
  s.ws.close(1000);
  await wait(200);
  assert.deepEqual([s.codes, peer?.got.map((f) => f.op)], [[], [OP.close]]);
  peer?.cut();
  await until(() => s.codes.length === 1);
  assert.deepEqual(s.codes, [1006]);
});

// killer: test/l2-fake-place.ts:18 CONST "text: 1" -> "text: 2"
test("fake_place_a_leading_bom_does_not_reach_the_client", async () => {
  const bom = Buffer.from([0xef, 0xbb, 0xbf]), body = Buffer.from("{\"u\":1}", "utf8");
  const s = await session((peer) => { peer.send(OP.text, Buffer.concat([bom, body])); });
  await until(() => s.got.length === 1);
  assert.equal(s.got[0]?.toString("hex"), body.toString("hex"));
  s.ws.close();
});

// killer: test/l2-fake-place.ts:80 CONST "writeHead(r.status" -> "writeHead(200"
test("fake_place_rest_answers_its_script_through_fetch", async () => {
  const place = await startPlace(() => undefined, (path) => (path.startsWith("/api/v3/time")
    ? { status: 200, headers: { "x-mbx-used-weight-1m": "1" }, body: "{\"serverTime\":1}" } : { status: 429, headers: { "retry-after": "2" } }));
  places.push(place);
  const f = viaFetch(place, [REST]), ok = await f(`${REST}/api/v3/time`), no = await f(`${REST}/api/v3/depth?symbol=A&limit=5000`);
  assert.deepEqual([ok.status, ok.headers.get("x-mbx-used-weight-1m"), await ok.text()], [200, "1", "{\"serverTime\":1}"]);
  assert.deepEqual([no.status, no.headers.get("retry-after")], [429, "2"]);
  assert.deepEqual(place.calls, ["/api/v3/time", "/api/v3/depth?symbol=A&limit=5000"]);
});

// killer: test/l2-fake-place.ts:124 CONST "allowed.includes(u.origin)" -> "true"
test("fake_place_factories_refuse_other_origins", async () => {
  const place = await startPlace(() => undefined, () => ({ status: 200, body: "{}" }));
  places.push(place);
  const f = viaFetch(place, [REST]), w = viaWebSocket(place, [WS]);
  assert.equal((await f(`${REST}/api/v3/time?x=1`)).status, 200);
  const ws = w(`${WS}/market/stream?streams=a@forceOrder`);
  await opened(ws);
  ws.close();
  for (const url of [`${REST}.other.example/x`, "http://api.place.example/x", `${REST}:8443/x`, `${WS}/x`, "not a url"]) {
    await assert.rejects(f(url), /^Error: refused /, url);
  }
  for (const url of [`${WS}.other.example/x`, "ws://stream.place.example/x", `${WS}:9443/x`, `${REST}/x`, "not a url"]) {
    assert.throws(() => w(url), /^Error: refused /, url);
  }
  assert.deepEqual([place.calls, place.peers.map((p) => p.path)], [["/api/v3/time?x=1"], ["/market/stream?streams=a@forceOrder"]]);
  await assert.rejects(fetch(`http://${place.origin}/`), /tripwire/);
  assert.throws(() => new WebSocket(`ws://${place.origin}/`), /tripwire/);
});
