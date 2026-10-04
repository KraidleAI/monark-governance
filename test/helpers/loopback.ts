// test/helpers/loopback.ts -- lot LOOPBACK-PORTS-1 (2026-10-03): the loopback port of the test servers, shared. Why not port 0: this
// host hands port 0 out in ONE sequence, shared by every bind and every outbound connect, from 1024 up, through phases below 10081
// that outlast any retry; the Fetch port check of this runtime refuses 82 ports, the highest 10080 (Node 24.15.0, undici 7.24.4, read
// in its own source), before any connect. A server bound on one of them is never reached by fetch ("bad port"): the rare reds
// measured under load (G1 journals of SERIES-BINANCE, SERIES-INTERVALS and PROBE-NARABI-LOAD-1). So a port is drawn at random above
// 10080, and another one on any listen error (in use, or excluded by the OS), with a named failure after TRIES tries: the draw, the
// bound and the failure of the three copies this file replaces (test/record-binance-klines.test.ts, record-coinbase-candles,
// probe-narabi-state). Test: test/loopback.test.ts.
import assert from "node:assert/strict";
import { createServer, type Server } from "node:net";

/** The lowest port drawn: one above 10080, the highest port that the fetch of this runtime refuses. */
export const LOWEST = 10_081;
/** Listen tries before the named failure. */
export const TRIES = 50;
/** A port drawn at random in [10081, 65080]; `random` is Math.random unless a test passes its own. */
export const drawPort = (random: () => number = Math.random): number => LOWEST + Math.floor(random() * 55_000);

/** True on `listening`, false on `error`, whichever `server` emits first; the other listener is removed. Both come on a later tick
 *  than the listen call (net.Server.listen), so the listeners set right after that call see them. */
function settled(server: Server): Promise<boolean> {
  return new Promise<boolean>((done) => {
    const ok = (): void => { server.off("error", ko); done(true); };
    const ko = (): void => { server.off("listening", ok); done(false); };
    server.once("error", ko).once("listening", ok);
  });
}

/** Starts a server by `start(port)`, which calls listen, on drawn ports until one listens (another port on any listen error); the
 *  named failure after TRIES tries, or at once when the server listens on another port than the drawn one (a `start` that ignores
 *  its port: that server is closed first). Returns the listening server: a fresh one per try when `start` builds one, as startServer does. */
export async function startLoopback<S extends Server>(start: (port: number) => S, draw: () => number = drawPort): Promise<S> {
  for (let i = 0; i < TRIES; i++) {
    const port = draw(), server = start(port);
    if (!(await settled(server))) continue;
    const a = server.address(), bound = typeof a === "object" && a !== null ? a.port : a;
    if (bound === port) return server;
    server.close();
    return assert.fail(`the server listens on port ${String(bound)}, not on the drawn port ${String(port)}`);
  }
  return assert.fail(`no free loopback port above 10080 in ${String(TRIES)} tries`);
}

/** Listens `server` on 127.0.0.1 at a drawn port (another one on any listen error); returns the port. */
export async function listen(server: Server, draw: () => number = drawPort): Promise<number> {
  let port = 0;
  await startLoopback((p) => { port = p; return server.listen(p, "127.0.0.1"); }, draw);
  return port;
}

/** A loopback port above 10080 that nothing listens on: bound by `listen`, then closed. */
export async function closedPort(): Promise<number> {
  const server = createServer();
  const port = await listen(server);
  await new Promise<void>((done) => { server.close(() => { done(); }); });
  return port;
}
