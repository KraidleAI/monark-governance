// test/loopback.test.ts -- lot LOOPBACK-PORTS-1 (2026-10-03): the shared helper test/helpers/loopback.ts. Its servers listen on
// 127.0.0.1 only and its one fetch goes to such a server: no test reaches the network. A port that a server of the same test holds
// stands for a port in use; a draw is injected where a test needs a port it knows. The line above each test names the change of the
// helper that reddens it (the helper is test code: no killer of scripts/red-proof.mjs can target it).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import { connect, createServer, type Server } from "node:net";
import { closedPort, drawPort, listen, LOWEST, startLoopback, TRIES } from "./helpers/loopback.ts";

const close = (server: Server): Promise<void> => new Promise<void>((done) => { server.close(() => { done(); }); });
/** A draw that answers `first` for its first `n` calls, then a random port; `calls` counts the calls. */
const scripted = (first: number, n: number): { draw: () => number; calls: () => number } => {
  let k = 0;
  return { draw: () => (++k <= n ? first : drawPort()), calls: () => k };
};

// reddened by: LOWEST at 10080 or below, or a span past 65080
test("loopback_draw_stays_in_10081_to_65080", () => {
  assert.equal(LOWEST, 10_081, "one above 10080, the highest port that fetch refuses");
  assert.deepEqual([drawPort(() => 0), drawPort(() => 1 - 2 ** -53)], [10_081, 65_080], "the lowest and the highest draw");
  for (let i = 0; i < 1000; i++) { const p = drawPort(); assert.ok(Number.isInteger(p) && p >= 10_081 && p <= 65_080, String(p)); }
});

// reddened by: a host other than 127.0.0.1, or a port returned that is not the one bound
test("loopback_listen_binds_127_0_0_1_above_10080_and_fetch_reaches_it", async () => {
  const server = createHttpServer((_req, res) => { res.end("pong"); });
  const port = await listen(server);
  try {
    assert.ok(port > 10_080, String(port));
    assert.deepEqual(server.address(), { address: "127.0.0.1", family: "IPv4", port });
    const res = await fetch(`http://127.0.0.1:${String(port)}/`);
    assert.deepEqual([res.status, await res.text()], [200, "pong"], "fetch reaches the port");
  } finally { server.closeAllConnections(); await close(server); }
});

// reddened by: no new draw after a listen error (the port in use kept, or the loop left at once)
test("loopback_listen_draws_again_on_a_listen_error", async () => {
  const busy = createServer(), server = createServer(), taken = await listen(busy), s = scripted(taken, 3);
  try {
    const port = await listen(server, s.draw);
    assert.notEqual(port, taken, "a port in use is never returned");
    assert.ok(s.calls() >= 4, `three draws refused, then one free: ${String(s.calls())} draws`);
    assert.deepEqual(server.address(), { address: "127.0.0.1", family: "IPv4", port });
  } finally { await close(server); await close(busy); }
});

// reddened by: an unbounded loop (the test then expires), or a bound other than TRIES
test("loopback_listen_fails_by_name_after_50_tries", async () => {
  const busy = createServer(), server = createServer(), taken = await listen(busy), s = scripted(taken, Infinity);
  try {
    await assert.rejects(listen(server, s.draw), { message: "no free loopback port above 10080 in 50 tries" });
    assert.deepEqual([s.calls(), TRIES, server.listening], [50, 50, false], "50 draws, all refused, nothing listens");
  } finally { await close(busy); }
});

// reddened by: the server of a refused try returned, or one server kept across tries when `start` builds one
test("loopback_start_takes_a_fresh_server_per_try", async () => {
  const busy = createServer(), taken = await listen(busy), s = scripted(taken, 1), built: Server[] = [];
  const server = await startLoopback((port) => { const b = createServer().listen(port, "127.0.0.1"); built.push(b); return b; }, s.draw);
  try {
    assert.deepEqual([built.length >= 2, built[0]?.listening, built.at(-1) === server, server.listening], [true, false, true, true]);
    assert.notEqual((server.address() as { port: number }).port, taken, "a port in use is never kept");
  } finally { await close(server); await close(busy); }
});

// reddened by: the port left open, or a port at or below 10080. A self-connect (localPort === port on 127.0.0.1, TCP simultaneous
// open) also proves that nothing listens: a listener holds the port's bind bucket, which the kernel skips when it picks a source port.
// Measured on Linux (HARNESS-LOOPBACK-PORTS-1, G0 and G2): 16 self-connects in 1 002 000 replays of this body, all on even ports of
// the ephemeral range 32768-60999 (connect keeps the parity of the range's low end); 0 in 841 513 connects to an odd port.
test("loopback_closed_port_refuses_a_connection", async () => {
  const port = await closedPort();
  assert.ok(port > 10_080, String(port));
  const code = await new Promise<string>((done) => {
    const socket = connect(port, "127.0.0.1");
    socket.once("connect", () => { const self = socket.localPort === port && socket.localAddress === "127.0.0.1"; socket.destroy(); done(self ? "self-connect" : "connected"); });
    socket.once("error", (e: NodeJS.ErrnoException) => { done(e.code ?? e.message); });
  });
  assert.ok(code === "ECONNREFUSED" || code === "self-connect", `nothing listens on a closed port: ${code}`);
});

// reddened by: a server returned that listens on another port than the drawn one (a `start` that ignores its port, as M17 of the
// G2), or that server left open. The factory binds port + 1 (LOOPBACK-CLOSEDPORT-RACE-1): no closed port that another process can take.
test("loopback_start_refuses_a_server_off_the_drawn_port", async () => {
  const built: Server[] = [], off = /^the server listens on port (\d+), not on the drawn port (\d+)$/;
  const e: unknown = await startLoopback((port) => { const b = createServer().listen(port + 1, "127.0.0.1"); built.push(b); return b; }).then(() => null, (x: unknown) => x);
  const m = off.exec(e instanceof Error ? e.message : String(e)), open = built.some((b) => b.listening);
  for (const b of built) b.close();
  assert.deepEqual([Number(m?.[1]) - Number(m?.[2]), open], [1, false], "refused at the try that listens, one above the drawn port, and closed");
});

// reddened by: a listener of a try left on the server, after it listens (M06 of the G2) or after a refused try (M08), or kept by on()
test("loopback_listen_leaves_no_listener_behind", async () => {
  const busy = createServer(), server = createServer(), refused = createServer(), taken = await listen(busy);
  const counts = (s: Server): number[] => [s.listenerCount("error"), s.listenerCount("listening")];
  try {
    await listen(server, scripted(taken, 1).draw);
    await assert.rejects(listen(refused, scripted(taken, Infinity).draw), { message: "no free loopback port above 10080 in 50 tries" });
    assert.deepEqual([counts(server), counts(refused)], [[0, 0], [0, 0]], "no listener left after a listen, nor after the named failure");
  } finally { await close(server); await close(busy); }
});

// reddened by: the port of a closed server drawn again (the retired set removed, or no port retired at close). A port retired at its
// bind instead reddens loopback_start_takes_a_fresh_server_per_try (its busy port, still open, would never be tried).
test("loopback_listen_never_draws_the_port_of_a_closed_server_again", async () => {
  // lot COINBASE-LOOPBACK-FLAKE-1: fetch keeps an idle keep-alive socket of a closed server in its pool; a new server on the same port
  // would get the next request sent on that dead socket (ECONNRESET). The draw offers the old port first: another one is taken, and
  // fetch reaches the new server.
  const old = createHttpServer((_req, res) => { res.end("old"); }), port = await listen(old);
  const first = await fetch(`http://127.0.0.1:${String(port)}/`);
  assert.deepEqual([first.status, await first.text()], [200, "old"], "a keep-alive socket of the old server in the pool");
  old.closeAllConnections();
  await close(old);
  const fresh = createHttpServer((_req, res) => { res.end("fresh"); }), s = scripted(port, 1), next = await listen(fresh, s.draw);
  try {
    assert.notEqual(next, port, "the port of the closed server is not drawn again");
    assert.ok(s.calls() >= 2, `the old port offered first, then another one: ${String(s.calls())} draws`);
    const res = await fetch(`http://127.0.0.1:${String(next)}/`);
    assert.deepEqual([res.status, await res.text()], [200, "fresh"], "fetch reaches the new server");
  } finally { fresh.closeAllConnections(); await close(fresh); }
});
