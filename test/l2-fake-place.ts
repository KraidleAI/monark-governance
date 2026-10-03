// test/l2-fake-place.ts -- lot P1-a1 of ADR-L2-CAPTURE-1 (D-22, Q-23; plan docs/G0-partie-l2-p1.md, section 5), started from the
// prototype that the plan measured (L-3, Q-P1-1): a loopback imitation of the place for the L2 recorder tests, with no dependency.
// One node:http server bound to 127.0.0.1 on a port drawn above 10080, never port 0. The WebSocket opening handshake runs on its
// "upgrade" event (101 with Upgrade, Connection and Sec-WebSocket-Accept, no extension answered: D24-9); server frames go out unmasked
// in the three length forms; client frames are unmasked and kept in order with their mask bit; PING, PONG, CLOSE with its code,
// fragmentation; mute (silence without a close: a dead link) and cut (no CLOSE frame). REST answers each request from the caller's
// script, by path. Factories: the injected fetch and WebSocket factory rewrite to the loopback only the origins that the caller allows
// and refuse any other URL; trap() turns the global fetch and WebSocket of a test file into tripwires, so no test reaches the network.
// The place serves the frames that each test builds and knows neither the recorder nor the chain rule (FM-3.3). Out of its scope: TLS,
// permessage-deflate, frames of the real place (D-25). "undici l.N" is line N of the client source embedded in Node v24.15.0
// (undici 7.24.4, sha256 d6332aa1ca04f71f...), as in the plan's L-1. Synthetic data only.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { Duplex } from "node:stream";

export const OP = { cont: 0, text: 1, close: 8, ping: 9, pong: 10 } as const; // the opcodes this place writes and reads
const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"; // the client hashes its key with it (undici l.14069, l.14497)
const CRLF = String.fromCharCode(13, 10);
const REAL = { fetch: globalThis.fetch, WebSocket: globalThis.WebSocket }; // read when this module loads, before a test file traps them
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;
export interface Frame { op: number; fin: boolean; masked: boolean; payload: Buffer }
export interface Reply { status: number; headers?: Record<string, string>; body?: string | Buffer }
export interface Peer { path: string; offered: string | null; got: Frame[]; open: boolean;
  send: (op: number, payload: Buffer | string, fin?: boolean) => void; close: (code?: number) => void; mute: () => void; cut: () => void }
export interface Place { origin: string; host: string; port: number; peers: Peer[]; calls: string[]; stop: () => Promise<void> }

/** One server frame, never masked (undici l.14760): its length in 7 bits, or 126 then 16 bits, or 127 then 64 bits (undici l.14792-14798). */
export function frame(op: number, payload: Buffer | string, fin = true): Buffer {
  const body = Buffer.from(payload), n = body.length, extra = n < 126 ? 0 : n < 65_536 ? 2 : 8, head = Buffer.alloc(2 + extra);
  head[0] = (fin ? 0x80 : 0) | op;
  head[1] = extra === 0 ? n : extra === 2 ? 126 : 127;
  if (extra === 2) head.writeUInt16BE(n, 2);
  if (extra === 8) head.writeBigUInt64BE(BigInt(n), 2);
  return Buffer.concat([head, body]);
}

/** The complete frames at the head of `buf`, unmasked, and the bytes left for the next chunk. */
export function parse(buf: Buffer): { frames: Frame[]; rest: Buffer } {
  const frames: Frame[] = [];
  let at = 0;
  for (;;) {
    if (buf.length < at + 2) break;
    const b0 = buf.readUInt8(at), b1 = buf.readUInt8(at + 1), masked = (b1 & 0x80) !== 0, m = masked ? 4 : 0;
    let n = b1 & 0x7f, off = at + 2;
    if (n === 126 && buf.length >= off + 2) { n = buf.readUInt16BE(off); off += 2; }
    else if (n === 127 && buf.length >= off + 8) { n = Number(buf.readBigUInt64BE(off)); off += 8; }
    else if (n >= 126) break;
    if (buf.length < off + m + n) break;
    const payload = Buffer.from(buf.subarray(off + m, off + m + n));
    for (let i = 0; i < n && masked; i++) payload.writeUInt8(payload.readUInt8(i) ^ buf.readUInt8(off + (i % 4)), i);
    frames.push({ op: b0 & 0x0f, fin: (b0 & 0x80) !== 0, masked, payload });
    at = off + m + n;
  }
  return { frames, rest: buf.subarray(at) };
}

/** A loopback port that fetch accepts: copied from test/record-binance-klines.test.ts l.69-80, whose comment (l.65-68) gives the measures
 *  (the Fetch port check of this runtime blocks ports at or below 10080; this host hands port 0 out in phases below 10081). */
async function listen(server: Server): Promise<number> {
  for (let i = 0; i < 50; i++) {
    const port = 10_081 + Math.floor(Math.random() * 55_000);
    const bound = await new Promise<boolean>((done) => {
      const ok = (): void => { server.off("error", ko); done(true); };
      const ko = (): void => { server.off("listening", ok); done(false); };
      server.once("error", ko).once("listening", ok).listen(port, "127.0.0.1");
    });
    if (bound) return port;
  }
  return assert.fail("no free loopback port above 10080 in 50 tries");
}

/** The fake place: `onPeer` scripts each WebSocket connection (any path), `rest` answers each HTTP request from its path and query. */
export async function startPlace(onPeer: (peer: Peer) => void, rest: (path: string) => Reply = () => ({ status: 404 })): Promise<Place> {
  const peers: Peer[] = [], calls: string[] = [], sockets = new Set<Duplex>();
  const server = createServer((req, res) => {
    const path = req.url ?? "/", r = rest(path);
    calls.push(path);
    res.writeHead(r.status, { "content-type": "application/json", ...r.headers }).end(r.body ?? "");
  });
  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const key = req.headers["sec-websocket-key"];
    if (typeof key !== "string") { socket.destroy(); return; }
    sockets.add(socket);
    const accept = createHash("sha1").update(key + GUID).digest("base64");
    socket.write(["HTTP/1.1 101 Switching Protocols", "Upgrade: websocket", "Connection: Upgrade", `Sec-WebSocket-Accept: ${accept}`, "", ""]
      .join(CRLF));
    let pending: Buffer = Buffer.from(head), muted = false, closing = false;
    const peer: Peer = { path: req.url ?? "/", offered: req.headers["sec-websocket-extensions"] ?? null, got: [], open: true,
      send: (op, payload, fin = true) => { if (!muted && peer.open) socket.write(frame(op, payload, fin)); },
      close: (code = 1000) => { const b = Buffer.alloc(2); b.writeUInt16BE(code); peer.send(OP.close, b); closing = true; },
      mute: () => { muted = true; },
      cut: () => { peer.open = false; socket.destroy(); } };
    socket.on("data", (chunk: Buffer) => {
      const p = parse(Buffer.concat([pending, chunk]));
      pending = p.rest;
      for (const f of p.frames) {
        peer.got.push(f);
        if (f.op !== OP.close || muted) continue;
        if (closing) socket.end(); else socket.end(frame(OP.close, f.payload.subarray(0, 2)));
        peer.open = false;
      }
    });
    socket.on("error", () => { peer.open = false; });
    socket.on("close", () => { peer.open = false; sockets.delete(socket); });
    peers.push(peer);
    onPeer(peer);
  });
  await listen(server);
  const at = server.address() as AddressInfo;
  const stop = (): Promise<void> => new Promise<void>((done) => {
    for (const s of sockets) s.destroy();
    server.closeAllConnections();
    server.close(() => { done(); });
  });
  return { origin: `${at.address}:${String(at.port)}`, host: at.address, port: at.port, peers, calls, stop };
}

/** The loopback URL that serves `url` when its origin is exactly one of `allowed` (same path and query), else null: never a prefix match. */
function local(place: Place, allowed: readonly string[], url: string, scheme: "http" | "ws"): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  return allowed.includes(u.origin) ? `${scheme}://${place.origin}${u.pathname}${u.search}` : null;
}

/** The injected fetch: a URL of an allowed origin is sent to the place, `init` untouched; any other URL is refused, never sent. */
export function viaFetch(place: Place, allowed: readonly string[]): FetchLike {
  return (url, init) => {
    const to = local(place, allowed, url, "http");
    return to === null ? Promise.reject(new Error(`refused ${url}`)) : REAL.fetch(to, init);
  };
}

/** The injected WebSocket factory: a URL of an allowed origin opens on the place; any other URL is refused (thrown), never opened. */
export function viaWebSocket(place: Place, allowed: readonly string[]): (url: string) => WebSocket {
  return (url) => {
    const to = local(place, allowed, url, "ws");
    if (to === null) throw new Error(`refused ${url}`);
    return new REAL.WebSocket(to);
  };
}

/** The tripwires of a test file: its global fetch and WebSocket refuse every call, so a client reaches only the place, through a factory. */
export function trap(): void {
  globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: the global fetch is never called"));
  globalThis.WebSocket = new Proxy(REAL.WebSocket, { construct: (): never => { throw new Error("tripwire: the global WebSocket is never built"); } });
}
