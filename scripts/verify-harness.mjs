#!/usr/bin/env node
// scripts/verify-harness.mjs — post-deploy verification + Conformity Attestation (CA) for the MONARK
// harness (ADR-M005 D10/D12, PLAN §H4). Run by the orchestrator from its machine against the live
// endpoint (RUNBOOK step 6). ZERO dependency: node:http + node:https + node:crypto + node:tls + node:fs.
//
//   node scripts/verify-harness.mjs [--api https://api.monarkgate.tech] [--mcp https://mcp.monarkgate.tech]
//                                   [--api-host api.monarkgate.tech] [--out FILE]
//
// The api-surface checks connect to `--api` but send `Host: <--api-host>` (default = the --api hostname),
// so the JSON mirror is reachable against a local `http://127.0.0.1:3001` target too (fetch cannot set the
// Host header, so a local fetch would carry `Host: 127.0.0.1` and miss the `api.` mirror route). It checks
// the endpoint — /health, /openapi.json (the live twin of test 43), a present-and-invalid Origin -> 403 on
// BOTH hosts, MCP tools/list returns the three tools, a REAL gate/cascade/attest call, and — for an https
// `--api` ONLY — the TLS certificate (issuer, expiry); an http `--api` (plain/local) SKIPS the TLS check.
// Then writes the CA
//   { url, mcp_url, checked_at, checks:[{ name, ok, status, sha256 }], tls:{ issuer, valid_to, authorized } | { skipped } }
// to stdout (and --out FILE), and exits non-zero on any failure. The per-check sha256 pins the exact
// response bytes observed at attestation time.
import { createHash } from "node:crypto";
import { connect as tlsConnect } from "node:tls";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_API = "https://api.monarkgate.tech";
const DEFAULT_MCP = "https://mcp.monarkgate.tech";
const TOOLS = ["gate", "cascade", "attest"];

// Same fixture shapes the harness tests use (a real, non-abstain btc-dir decision; a 2-node cascade).
const GATE_BODY = {
  prediction: { schema_version: "1.0.0", task_class: "btc-dir-15m", yhat: "up", predictor_id: "internal:momentum-4c", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: "up", tool: "perps_order_preview", clockOpen: true },
};
const CASCADE_BODY = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" };

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const jsonInit = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

function parseArgs(argv) {
  const a = { api: DEFAULT_API, mcp: DEFAULT_MCP, apiHost: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--api") a.api = argv[++i];
    else if (argv[i] === "--mcp") a.mcp = argv[++i];
    else if (argv[i] === "--api-host") a.apiHost = argv[++i];
    else if (argv[i] === "--out") a.out = argv[++i];
  }
  return a;
}

/** Run one HTTP check; `validate(res, text) -> { ok, detail }`. Records status + sha256 of the body. */
async function httpCheck(name, url, init, validate) {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    const { ok, detail } = validate(res, text);
    return { name, ok, status: res.status, sha256: sha256(text), detail };
  } catch (error) {
    return { name, ok: false, status: 0, sha256: null, detail: String(error && error.message ? error.message : error) };
  }
}

/**
 * One HTTP(S) request over node:http/node:https (picked by the URL scheme) that can present an EXPLICIT
 * `Host` header (`fetch` forbids setting Host). Resolves `{ status, text }`, or `{ error }` on a socket
 * failure — never throws. This is the RUNBOOK-independent twin of the tests' `wiredPost`
 * (apps/harness/test/http.test.ts): it lets an api-surface check connect to a LOCAL address while still
 * carrying the public `api.` Host the mirror routes on.
 */
function wiredRequest(url, { method = "GET", headers = {}, body, hostHeader } = {}) {
  return new Promise((done) => {
    const u = new URL(url);
    const isHttps = u.protocol === "https:";
    const send = isHttps ? httpsRequest : httpRequest;
    const h = { ...headers };
    if (hostHeader !== undefined && hostHeader !== null) h.host = hostHeader;
    if (body !== undefined) h["content-length"] = Buffer.byteLength(body);
    const options = {
      hostname: u.hostname,
      port: u.port ? Number(u.port) : (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers: h,
      timeout: 10000,
    };
    if (isHttps) options.servername = u.hostname; // SNI = the connect host (matches the real cert's name)
    const req = send(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { raw += c; });
      res.on("end", () => { done({ status: res.statusCode ?? 0, text: raw }); });
    });
    req.on("error", (error) => { done({ error: String(error && error.message ? error.message : error) }); });
    req.on("timeout", () => { req.destroy(); done({ error: "wired timeout" }); });
    if (body !== undefined) req.write(body);
    req.end();
  });
}

/** Like `httpCheck` but wired via node:http(s) with an explicit `Host` header (routes api.->mirror even
 *  against a local address). Same `{ name, ok, status, sha256, detail }` record shape. */
async function wiredCheck(name, url, init, hostHeader, validate) {
  const r = await wiredRequest(url, { ...init, hostHeader });
  if (r.error !== undefined) return { name, ok: false, status: 0, sha256: null, detail: r.error };
  const { ok, detail } = validate({ status: r.status }, r.text);
  return { name, ok, status: r.status, sha256: sha256(r.text), detail };
}

/** Open a TLS connection and read the peer certificate (a real handshake, not just "fetch didn't throw"). */
function tlsCheck(host) {
  return new Promise((done) => {
    const socket = tlsConnect({ host, port: 443, servername: host, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      const result = {
        host,
        authorized: socket.authorized === true,
        issuer: cert && cert.issuer ? (cert.issuer.O ?? cert.issuer.CN ?? null) : null,
        subject: cert && cert.subject ? (cert.subject.CN ?? null) : null,
        valid_to: cert ? (cert.valid_to ?? null) : null,
      };
      socket.end();
      done(result);
    });
    socket.on("error", (error) => { done({ host, authorized: false, error: String(error && error.message ? error.message : error) }); });
    socket.on("timeout", () => { socket.destroy(); done({ host, authorized: false, error: "tls timeout" }); });
  });
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { api, mcp } = args;
  const apiUrl = new URL(api);
  const apiHostHeader = args.apiHost ?? apiUrl.hostname; // Host header for the api-surface checks (api.->mirror)
  const checks = [];

  checks.push(await wiredCheck("health", `${api}/health`, { method: "GET" }, apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const ops = j && Array.isArray(j.operations) ? j.operations : [];
    return { ok: res.status === 200 && TOOLS.every((n) => ops.includes(n)), detail: `operations=${ops.join(",")}` };
  }));

  checks.push(await wiredCheck("openapi", `${api}/openapi.json`, { method: "GET" }, apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const paths = j && j.paths ? Object.keys(j.paths) : [];
    return { ok: res.status === 200 && ["/gate", "/cascade", "/attest"].every((p) => paths.includes(p)), detail: `paths=${paths.join(",")}` };
  }));

  // api surface: WIRED so the evil-Origin POST actually reaches the api. mirror (Host set explicitly).
  checks.push(await wiredCheck("origin_403_api", `${api}/gate`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example.com" },
    body: "{}",
  }, apiHostHeader, (res) => ({ ok: res.status === 403, detail: `status=${res.status}` })));
  // mcp surface: fetch is correct (Host = the mcp hostname in prod; a local 127.0.0.1 target routes to MCP).
  checks.push(await httpCheck("origin_403_mcp", `${mcp}/gate`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example.com" },
    body: "{}",
  }, (res) => ({ ok: res.status === 403, detail: `status=${res.status}` })));

  checks.push(await httpCheck("mcp_tools_list", mcp, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  }, (res, text) => ({ ok: res.status === 200 && TOOLS.every((n) => text.includes(`"${n}"`)), detail: `status=${res.status}` })));

  checks.push(await wiredCheck("gate_call", `${api}/gate`, jsonInit(GATE_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const action = j && j.structuredContent ? j.structuredContent.action : null;
    return { ok: res.status === 200 && ["commit", "defer", "abstain"].includes(action), detail: `action=${action}` };
  }));

  checks.push(await wiredCheck("cascade_call", `${api}/cascade`, jsonInit(CASCADE_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j ? j.structuredContent : null;
    const ok = res.status === 200 && sc !== null && typeof sc.yhat === "number" && sc.task_class === "cascade-liquidable-24h";
    return { ok, detail: sc ? `yhat=${String(sc.yhat)}` : "no body" };
  }));

  checks.push(await wiredCheck("attest_call", `${api}/attest`, jsonInit({}), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const label = j && j.structuredContent && typeof j.structuredContent.label === "string" ? j.structuredContent.label : "";
    return { ok: res.status === 200 && label.includes("demonstrative"), detail: label.slice(0, 60) };
  }));

  // TLS only makes sense for an https target; an http `--api` (plain/local) SKIPS it (never a false fail).
  const tls = apiUrl.protocol === "https:"
    ? await tlsCheck(apiUrl.hostname)
    : { host: apiUrl.hostname, skipped: true, reason: "api scheme is http: — TLS check skipped (plain/local target)" };

  const attestation = { url: api, mcp_url: mcp, checked_at: new Date().toISOString(), checks, tls };
  const out = JSON.stringify(attestation, null, 2);
  console.log(out);
  if (args.out) {
    writeFileSync(args.out, out + "\n");
    console.error(`CA written to ${args.out}`);
  }

  const failed = checks.filter((c) => !c.ok).map((c) => c.name);
  if (apiUrl.protocol === "https:" && tls.authorized !== true) failed.push("tls");
  if (failed.length) {
    console.error(`VERIFY FAILED: ${failed.join(", ")}`);
    process.exit(1);
  }
  console.error(tls.skipped === true ? "VERIFY OK — all checks passed (TLS skipped: http api target)." : "VERIFY OK — all checks passed.");
}

// Run-guard: execute only when invoked directly (like the other scripts), never on import.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(`verify-harness crashed: ${String(error && error.message ? error.message : error)}`);
    process.exit(1);
  });
}
