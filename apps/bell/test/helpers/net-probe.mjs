// net-probe.mjs — C-V-5 TEST HELPER: exercise net.connect / http.request / https.request / fetch against a
// DETERMINISTICALLY CLOSED loopback port and print ONE JSON line with each client's error message. Run with the
// no-network shim (`node --import no-network.mjs net-probe.mjs`): all four report "SHIM:" (blocked at
// net.Socket.prototype.connect / the fetch belt, BEFORE any real connect). Run WITHOUT the shim (witness): the
// net-level clients report ECONNREFUSED — a real, LOCAL, immediately-refused connect to a closed loopback port (no
// egress). This proves the shim (not the closed port) produces SHIM:, and that the `net`-level patch is load-bearing.
// NEVER shipped in src — lives under apps/bell/test/helpers only.
import net from "node:net";
import http from "node:http";
import https from "node:https";
import { createServer } from "node:http";

// A CLOSED loopback port, free by construction: bind :0, read the port, close, then reuse it (nothing listens).
const port = await new Promise((resolve) => {
  const s = createServer();
  s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => { resolve(p); }); });
});
const host = "127.0.0.1";

const msg = (e) => String((e && e.message) ? e.message : e);
const guard = (p) => Promise.race([p, new Promise((r) => setTimeout(() => { r("timeout"); }, 8000))]);

const tryNet = () => new Promise((resolve) => {
  try {
    const sock = net.connect(port, host);
    sock.on("error", (e) => { resolve(msg(e)); });
    sock.on("connect", () => { sock.destroy(); resolve("connected"); });
  } catch (e) { resolve(msg(e)); }
});
const tryReq = (mod) => new Promise((resolve) => {
  try {
    // Closed loopback port => TCP connect fails (ECONNREFUSED) BEFORE any TLS handshake, so no TLS options are
    // needed (and none disabled): there is no certificate to verify, no MITM surface.
    const req = mod.request({ host, port, method: "GET", path: "/" }, (res) => { res.resume(); resolve("connected"); });
    req.on("error", (e) => { resolve(msg(e)); });
    req.end();
  } catch (e) { resolve(msg(e)); }
});
const tryFetch = async () => {
  try { await fetch(`http://${host}:${String(port)}/`); return "connected"; } catch (e) { return msg(e); }
};

const result = {
  net: await guard(tryNet()),
  http: await guard(tryReq(http)),
  https: await guard(tryReq(https)),
  fetch: await guard(tryFetch()),
};
process.stdout.write(JSON.stringify(result) + "\n");
process.exit(0);
