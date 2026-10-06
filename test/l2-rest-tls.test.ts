// test/l2-rest-tls.test.ts -- lot P1-B1-BIS of ADR-L2-CAPTURE-1 (lot plan docs/G0-lot-l2-p1-b1-bis.md; B-2 of the G2 of part P1): the TLS
// peer of a REST request is taken from its own connection only. Two loopback TLS servers, each with its own self-signed certificate
// built here (a key generated on the fly, none committed; trusted by this process only, setDefaultCACertificates), on ports drawn by
// test/helpers/loopback.ts: "rest" answers the place time, "ws" answers a WebSocket upgrade. The global fetch and WebSocket are
// tripwires; the injected fetch sends only the place's URL, rewritten to the "rest" server. Synthetic data only.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { channel } from "node:diagnostics_channel";
import { createHash, generateKeyPairSync, sign, X509Certificate } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Duplex } from "node:stream";
import { connect, setDefaultCACertificates } from "node:tls";
import { listen } from "./helpers/loopback.ts";
import { trap } from "./l2-fake-place.ts";
import type * as Rest from "../scripts/l2/rest.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-rest-tls.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-KEEP-CAUSE-REST-1)
const REAL = { fetch: globalThis.fetch, WebSocket: globalThis.WebSocket }; // read before the trap below: a root before() runs at once
const outs: string[] = [], servers: Server[] = [], sockets = new Set<Duplex>(); before(() => { trap(); }); // after REAL (l. 21): a root before() runs at once; fails: 3 named reds
after(async () => {
  for (const s of sockets) s.destroy();
  for (const s of servers) { s.closeAllConnections(); await new Promise<void>((done) => { s.close(() => { done(); }); }); }
  for (const d of outs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

async function load(): Promise<typeof Rest> {
  const m = await import("../scripts/l2/rest.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/rest.mjs is absent");
}
const tick = (ms: number): Promise<void> => new Promise((done) => { setTimeout(done, ms); });

/** One DER element: tag, length (short form, or 0x81 / 0x82 long form), content. */
const der = (tag: number, ...parts: Buffer[]): Buffer => {
  const body = Buffer.concat(parts), n = body.length;
  return Buffer.concat([Buffer.from([tag, ...(n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255])]), body]);
};
const seq = (...parts: Buffer[]): Buffer => der(0x30, ...parts), hex = (h: string): Buffer => Buffer.from(h, "hex");
/** A self-signed X.509 v3 certificate on a fresh P-256 key: CN `cn`, subjectAltName DNS:localhost, basicConstraints CA, ecdsa-with-SHA256. */
function selfSigned(cn: string): { key: string; cert: string; fingerprint: string } {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const alg = seq(hex("06082a8648ce3d040302")), name = seq(der(0x31, seq(hex("0603550403"), der(0x0c, Buffer.from(cn)))));
  const ext = der(0xa3, seq(seq(hex("0603551d11"), der(0x04, seq(der(0x82, Buffer.from("localhost"))))), seq(hex("0603551d13"), der(0x04, seq(hex("0101ff"))))));
  const tbs = seq(hex("a003020102"), der(0x02, Buffer.from([1 + cn.length])), alg, name, seq(der(0x17, Buffer.from("250101000000Z")),
    der(0x17, Buffer.from("491231235959Z"))), name, publicKey.export({ type: "spki", format: "der" }), ext);
  const x = new X509Certificate(seq(tbs, alg, der(0x03, Buffer.from([0]), sign("sha256", tbs, privateKey))));
  return { key: String(privateKey.export({ type: "pkcs8", format: "pem" })), cert: x.toString(), fingerprint: x.fingerprint256 };
}

// B-2: a request on a pooled socket while a WebSocket handshake reaches another TLS server records no fingerprint (base: the
// WebSocket server's), named foreign_connection; a resumed TLS session of node:tls to the place, published on the channel as undici
// publishes its connections (undici's own session cache holds its sessions by WeakRef: whether it resumes is up to the collector), is
// named session_resumed (base: null with no note); the first, fresh connection gives the REST server's fingerprint.
// killer: scripts/l2/rest.mjs:103 CONST " || s.remotePort !== peer.port" -> ""
test("l2_tls_peer_only_from_own_connection", async () => {
  const R = await load(), rest = selfSigned("rest.test"), ws = selfSigned("ws.test");
  setDefaultCACertificates([rest.cert, ws.cert]);
  const seen: unknown[] = [];
  let hold: Promise<void> | null = null, upgraded = (): void => undefined, during = (): void => undefined;
  const rs = createServer(rest, (req, res) => {
    seen.push(req.socket);
    void (hold ?? Promise.resolve()).then(() => { res.end("{\"serverTime\":1}"); });
  });
  const wss = createServer(ws);
  wss.on("upgrade", (req, socket: Duplex) => {
    sockets.add(socket);
    const accept = createHash("sha1").update(`${String(req.headers["sec-websocket-key"])}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    upgraded();
  });
  servers.push(rs, wss);
  const restPort = await listen(rs), wsPort = await listen(wss), out = mkdtempSync(join(tmpdir(), "l2-rest-tls-"));
  outs.push(out);
  const fetch = (url: string, init: RequestInit): Promise<Response> => {
    if (!url.startsWith(`${R.ORIGIN}/`)) return Promise.reject(new Error(`refused ${url}`));
    during(); // inside the request's window
    return REAL.fetch(`https://localhost:${String(restPort)}${url.slice(R.ORIGIN.length)}`, init);
  };
  let t = 1_760_000_000_000_000;
  const c = R.createRest({ fetch, nowUs: () => (t += 1), out, peer: { servername: "localhost", port: restPort } });
  await c.request("time", null); // a fresh connection: the REST server's certificate
  await tick(50); // its socket back in the pool
  hold = new Promise<void>((done) => { upgraded = done; });
  let link: WebSocket | null = null;
  during = () => { link = new REAL.WebSocket(`wss://localhost:${String(wsPort)}/`); }; // its TLS connect falls inside the window
  await c.request("time", null);
  hold = null;
  (link as WebSocket | null)?.close();
  const first = connect({ host: "127.0.0.1", port: restPort, servername: "localhost" }); // dial the bound address: a runner resolving localhost to ::1 first loses the "session" event after its fallback
  sockets.add(first);
  const session = await new Promise<Buffer>((done, fail) => { first.once("session", done); setTimeout(() => { fail(new Error("no TLS session ticket within 10 s")); }, 10_000).unref(); });
  const resumed = connect({ host: "127.0.0.1", port: restPort, servername: "localhost", session });
  sockets.add(resumed);
  await new Promise((done, fail) => { resumed.once("secureConnect", done); setTimeout(() => { fail(new Error("no resumed TLS connect within 10 s")); }, 10_000).unref(); });
  assert.deepEqual([resumed.isSessionReused(), resumed.getPeerCertificate()], [true, {}], "a resumed session shows no certificate");
  await tick(50);
  during = () => { channel("undici:client:connected").publish({ socket: resumed }); };
  await c.request("time", null);
  assert.deepEqual([seen.length, seen[1] === seen[0], seen[2] === seen[0]], [3, true, true], "requests 2 and 3 on the pooled socket");
  const lines = readFileSync(join(out, "requests.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rest.RequestLine);
  assert.notEqual(rest.fingerprint, ws.fingerprint);
  assert.deepEqual(lines.map((l) => [l.tls_peer_sha256, l.tls_peer_note]), [[rest.fingerprint, null], [null, "foreign_connection"], [null, "session_resumed"]]);
  c.close();
});

// m-3: the closed lists cannot be widened by another module of the process; PEER is the host and port of ORIGIN.
// killer: scripts/l2/rest.mjs:27 CONST "Object.freeze([\"api.binance.com\"])" -> "([\"api.binance.com\"])"
test("l2_rest_closed_lists_frozen", async () => {
  const R = await load();
  assert.deepEqual([R.HOSTS, R.SYMBOLS, R.STOPS, R.TLS_NOTES, R.PEER].map((x) => Object.isFrozen(x) && x !== undefined), [true, true, true, true, true]);
  const o = new URL(R.ORIGIN);
  assert.deepEqual(R.PEER, { servername: o.hostname, port: 443 });
  assert.deepEqual(R.HOSTS, [o.host]);
  assert.deepEqual(R.TLS_NOTES, ["several_connections", "session_resumed", "no_certificate", "foreign_connection", "no_tls", "reused_socket"]);
});

// Q-2 of the G7 (m-3 of its G2): the io.peer seam is out of reach of the production call path. No module under scripts/ but rest
// itself names createRest together with a peer; the book takes a ready client (io.rest), never createRest's io; and a peer whose
// name is not localhost is a named stop, so a spread config cannot attribute a foreign certificate (stream.binance.com:9443).
// killer: scripts/l2/rest.mjs:97 CONST "io.peer?.servername === \"localhost\"" -> "true"
test("l2_rest_peer_seam_loopback_only", async () => {
  const R = await load(), root = new URL("../scripts/", import.meta.url), own = ["l2/rest.mjs", "l2/rest.d.mts"];
  const files = readdirSync(root, { recursive: true, encoding: "utf8" }).map((f) => f.replace(/\\/g, "/")).filter((f) => /\.[cm]?[jt]s$/.test(f));
  const src = (f: string): string => readFileSync(new URL(f, root), "utf8");
  assert.ok(files.includes("l2/book.mjs") && files.includes("l2/rest.mjs"), "the walk reaches scripts/l2");
  const callers = files.filter((f) => !own.includes(f) && /\bcreateRest\b/.test(src(f)));
  for (const f of callers) assert.ok(!/\bpeer\b/.test(src(f)), `${f} calls createRest and names a peer`);
  const book = src("l2/book.mjs");
  assert.deepEqual([/\bcreateRest\b/.test(book), /\bpeer\b/.test(book), book.includes("io.rest.request(")], [false, false, true], "the book takes a ready client");
  assert.ok(src("l2/book.d.mts").includes(`rest: Pick<RestClient, "request" | "stopped" | "suspendedUntilUs">;`), "the book's io holds a client, not createRest's io");
  const io = { fetch: (): Promise<Response> => Promise.reject(new Error("never")), nowUs: (): number => 1_760_000_000_000_000, out: "unused" };
  for (const peer of [{ servername: "stream.binance.com", port: 9443 }, { servername: "api.binance.com", port: 443 }, { servername: "127.0.0.1", port: 443 }]) {
    assert.throws(() => R.createRest({ ...io, peer }), (e: unknown) => e instanceof R.RestStop && e.code === "host_refused" && e.detail.peer === "not_loopback",
      peer.servername);
  }
  R.createRest({ ...io, peer: { servername: "localhost", port: 1 } }).close();
  R.createRest(io).close();
});
