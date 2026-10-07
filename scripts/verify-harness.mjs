#!/usr/bin/env node
// scripts/verify-harness.mjs — post-deploy verification + Conformity Attestation (CA) for the MONARK
// harness (ADR-M005 D10/D12, PLAN §H4). Run by the orchestrator from its machine against the live
// endpoint (RUNBOOK step 6). ZERO dependency: node:http + node:https + node:crypto + node:tls + node:fs.
//
//   node scripts/verify-harness.mjs [--api https://api.monarkgate.tech] [--mcp https://mcp.monarkgate.tech]
//                                   [--api-host api.monarkgate.tech] [--out FILE] [--kata-wait-max S]
//
// The api-surface checks connect to `--api` but send `Host: <--api-host>` (default = the --api hostname),
// so the JSON mirror is reachable against a local `http://127.0.0.1:3001` target too (fetch cannot set the
// Host header, so a local fetch would carry `Host: 127.0.0.1` and miss the `api.` mirror route). It checks
// the endpoint — /health, /openapi.json (the live twin of test 43), a present-and-invalid Origin -> 403 on
// BOTH hosts, MCP tools/list returns the four tools, a REAL gate/cascade/attest/calibrate call, a gate BYO
// call (C2: verdict.scores_sha256 === the calibrate scores_sha256 + action commit, proving the loop), and — for
// an https `--api` ONLY — the TLS certificate (issuer, expiry); an http `--api` (plain/local) SKIPS the TLS check.
// U-4b-2b (ADR-U4b-2b D4; switched from the HARNESS-DESC-1 empty-registry checks): the liquidation-eligible-coverage class
// on the COMMITTED registry -- a gate call in the committed stratum s0 (200, verdict.reason covered, the upper bound
// [0, yhat + qhat], the committed n_calib and scores_sha256, the committed class text in `content`), a gate call in an
// UNcommitted stratum (200, abstain, verdict.reason under_calib, n_calib 0), and the served tools/list description of
// `gate` (the committed clause entire, the empty-registry sentence absent). 18 checks (CM-2b adds gate_retired_call and gate_future_call; E-2a adds the kata path and version checks, specified after main()).
// Then writes the CA
//   { url, mcp_url, checked_at, checks:[{ name, ok, status, sha256 }], tls:{ issuer, valid_to, authorized } | { skipped } }
// to stdout, and exits non-zero on any failure. --out FILE is written (temp file, then rename) ONLY when every check passed
// AND every host contacted (api and mcp) passed a real, authorized TLS handshake (T0-TOOLING-1 and its G2): a red run
// writes FILE.failed, a green run on an http target (TLS not checked) writes FILE.local; neither touches FILE, the last
// green record. Every request and handshake is bounded by --timeout MS (default 10000); a timeout is a failed check. An
// unknown, repeated or empty option, an --api or --mcp that is not an http(s) URL and a timeout above 2^31-1 ms are
// refused by name (exit 2) before any request. The per-check sha256 pins the bytes.
import { createHash } from "node:crypto";
import { connect as tlsConnect } from "node:tls";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_API = "https://api.monarkgate.tech";
const DEFAULT_MCP = "https://mcp.monarkgate.tech";
// The TERMINAL tool set (ADR-M007, set 3→4): checks assert SET EQUALITY against this, not a subset — a
// dropped OR a stray tool reddens (B-2, motif registry.test.ts:55).
const TOOLS = ["gate", "cascade", "attest", "calibrate"];

// The ONE prediction.schema_version of the CA bodies (MONARK e9cd32b Q-UP-2): == SCHEMA_VERSION of apps/harness/src/tools/gate.ts,
// parity asserted by test/verify-harness-liq.test.ts (zero dependency); block C moves both, each in one line.
export const CA_SCHEMA_VERSION = "1.1.0";
// Same fixture shapes the harness tests use (a real, non-abstain decision on the committed USDe key, alpha 0.1 and nMin 50
// imposed since CM-2b, btc-dir-15m being retired; a 2-node cascade;
// a calibrate call whose n=10 >= nMin and p=⌈11·0.9⌉=10 <= n yields a numeric q̂). Exported: scripts/sync-harness-served.mjs
// POSTs this very object, never a copy (G2 of CM-2b surfaces, M2).
export const GATE_BODY = {
  prediction: { schema_version: CA_SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0.0001, tool: "perps_order_preview", clockOpen: true },
};
export const CASCADE_BODY = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" };
// CM-2b (ADR-CM B-5): the retired class answers a named 400 with its stable code (CM-2a, B-3).
const GATE_RETIRED_BODY = {
  prediction: { schema_version: CA_SCHEMA_VERSION, task_class: "btc-dir-15m", yhat: "up", predictor_id: "internal:momentum-4c", produced_at: "2026-09-04T00:00:00Z" },
  params: { ...GATE_BODY.params, intent: "up" },
};
// CM-2a (ADR-CM B-4, MONARK C-8): a produced_at far in the future answers 400 produced_at_future at the entry point.
const GATE_FUTURE_BODY = { prediction: { ...GATE_BODY.prediction, produced_at: "2099-01-01T00:00:00Z" }, params: GATE_BODY.params };
export const CALIBRATE_BODY = { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 };
// Lot C2 BYO loop: a /gate call that REUSES CALIBRATE_BODY.scores as caller-supplied calibration (interval
// mode, a caller-owned task_class). Hand-rolled n=10, α=0.1 ⇒ p=⌈11·0.9⌉=10 ⇒ q̂=10th smallest=1.0; ŷ=0 ⇒
// region [−1,1], width 2 ≤ tauInterval 2, intent 0 ∈ [−1,1] ⇒ COMMIT (written in). The check asserts the
// LIVE decision's verdict.scores_sha256 === the LIVE calibrate scores_sha256 — proving the BYO boucle end-to-end.
const GATE_BYO_BODY = {
  prediction: { schema_version: CA_SCHEMA_VERSION, task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true, calibration: { scores: CALIBRATE_BODY.scores, mode: "interval" } },
};

// The liquidation-eligible-coverage class on the SERVED registry (HARNESS-DESC-1 checkpoint-1 C-5; switched at U-4b-2b,
// ADR-U4b-2b D4). yhat = a non-negative safe integer (base 8-dec liquidable amount); alpha/nMin = the SERVER-imposed
// 0.01/100 (any other value is a named 400). The body of the committed call is UNCHANGED since HARNESS-DESC-1 (its
// yhat lies in the committed stratum s0, below the first served cut); the second call puts yhat ON the first served cut,
// so the server derives stratum s1, which the registry does not hold. No amount of the calibration is typed here:
// q-hat is read from the served verdict. GATE_LIQ_BODY is exported with GATE_BODY and CA_SCHEMA_VERSION (the run-guard
// below keeps the CLI from running on import): scripts/sync-ukemi-served.mjs POSTs this very object, never a copy, so the served verdict it
// records is the answer this check hashes as gate_liq_call (ADR-U4b-2b D5 point 1; G2 of U-4b-2b, M-1).
export const GATE_LIQ_BODY = {
  prediction: { schema_version: CA_SCHEMA_VERSION, task_class: "liquidation-eligible-coverage", yhat: 5000, predictor_id: "ca:verify-harness", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.01, nMin: 100, intent: 1, tool: "perps_order_preview", clockOpen: true },
};
// == apps/harness/src/ukemi-strata.ts STRATA_CUTS_SERVED[0] (the first served cut: strateOf(cut) = 1).
const LIQ_S1_CUT = 200000000000;
const GATE_LIQ_UNCOMMITTED_BODY = {
  prediction: { ...GATE_LIQ_BODY.prediction, yhat: LIQ_S1_CUT },
  params: GATE_LIQ_BODY.params,
};
// BYTE-IDENTICAL to the served constants (this script stays zero-dependency; test/verify-harness-liq.test.ts
// verify_harness_liq_literals_equal_served_constants asserts each equality): the five liq sentences of
// apps/harness/src/tools/gate.ts, the scores_sha256 pin and size of stratum s0 of apps/harness/src/calibration.ts.
const LIQ_UPPER_BOUND_SENTENCE = "a conformal upper bound on the liquidable amount for the calibrated class; the lower edge is 0 by construction, not a calibrated bound; abstains (under_calib) outside it";
const LIQ_REQUIREMENTS_SENTENCE = "this class requires alpha = 0.01, nMin = 100";
const LIQ_H3_SENTENCE = "calibrated on one recorded episode; no coverage is claimed on any other event; the H-3 exchangeability check is a report, a YES licenses nothing more";
const LIQ_CONDITIONAL_SENTENCE = "the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH account at the first crossing, which the gate does not check";
const LIQ_EMPTY_REGISTRY_SENTENCE = "no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction";
const LIQ_S0_SCORES_SHA256 = "a927722276941a4f8f677bab3625b8ee3128ecf84d2d078da0a316b42a6ee3c8";
const LIQ_S0_N_CALIB = 170;
// The committed clause of the served gate description (describeGate(true), gate.ts) and the committed class text of
// `content` (LIQ_COMMITTED_SENTENCE, gate.ts), composed from the literals above exactly as the gate module composes them.
const LIQ_COMMITTED_CLAUSE = `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;
const LIQ_COMMITTED_SENTENCE = `${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
/** Set equality (order-independent): the two arrays carry EXACTLY the same members (B-2, no subset). */
const sameSet = (a, b) => a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");
/** Extract the tool names from an MCP `tools/list` response (SSE-framed or plain JSON). */
const mcpToolNames = (text) => {
  const j = parseJson(text);
  if (j && Array.isArray(j.result?.tools)) return j.result.tools.map((t) => t && t.name).filter((n) => typeof n === "string");
  // SSE-framed: pull the `data:` line and parse its JSON-RPC envelope.
  const dataLine = text.split(/\r?\n/).find((l) => l.startsWith("data:"));
  if (dataLine) {
    const env = parseJson(dataLine.slice("data:".length).trim());
    if (env && Array.isArray(env.result?.tools)) return env.result.tools.map((t) => t && t.name).filter((n) => typeof n === "string");
  }
  return null;
};
/** The served description of tool `name` in an MCP `tools/list` response (SSE-framed or plain JSON), else null. */
const mcpToolDescription = (text, name) => {
  const dataLine = text.split(/\r?\n/).find((l) => l.startsWith("data:"));
  const env = parseJson(dataLine ? dataLine.slice("data:".length).trim() : text);
  const tool = env && Array.isArray(env.result?.tools) ? env.result.tools.find((t) => t && t.name === name) : undefined;
  return tool && typeof tool.description === "string" ? tool.description : null;
};
const jsonInit = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

const OPTIONS = { "--api": "api", "--mcp": "mcp", "--api-host": "apiHost", "--out": "out", "--timeout": "timeout", "--kata-wait-max": "kataWaitMax" };
/** The CLI options; an unknown, repeated or empty option, an option without its value or a timeout that is not a positive
 *  integer of milliseconds throws, naming it (a typo never runs unseen). */
export function parseArgs(argv) {
  const a = { api: DEFAULT_API, mcp: DEFAULT_MCP, apiHost: null, out: null, timeout: 10000, kataWaitMax: null }, seen = new Set();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!Object.hasOwn(OPTIONS, flag)) throw new Error(`unknown option ${JSON.stringify(flag)} (known: ${Object.keys(OPTIONS).join(", ")})`);
    if (seen.has(flag)) throw new Error(`option ${flag} given twice`);
    if (value === undefined || value.startsWith("--") || value.trim() === "") throw new Error(`option ${flag} needs a value`);
    seen.add(flag);
    if (["--api", "--mcp"].includes(flag) && !/^https?:$/.test(URL.canParse(value) ? new URL(value).protocol : "")) throw new Error(`option ${flag} needs an http(s) URL`);
    a[OPTIONS[flag]] = value;
  }
  a.timeout = Number(a.timeout);
  if (!Number.isSafeInteger(a.timeout) || a.timeout <= 0 || a.timeout > 2147483647) throw new Error("option --timeout needs a positive integer of milliseconds, at most 2147483647");
  return kataOptions(a);
}
let TIMEOUT_MS = 10000; // set from --timeout by main(): every fetch, wired request and TLS handshake is bounded by it

/** The record a run writes beside stdout: "green" (--out) only when no check failed and every contacted host passed an
 *  authorized TLS handshake; "local" when green with a host whose TLS was not checked (http); "failed" otherwise (pure). */
export function recordKind(failed, tlsBlocks) {
  if (failed.length > 0) return "failed";
  return tlsBlocks.every((t) => t.authorized === true) ? "green" : "local";
}
/** Write `text` to `path` through `<path>.tmp` and a rename (bounded retry on a win32 EPERM/EBUSY): never a torn record. */
export function writeAtomic(path, text) {
  try { writeFileSync(`${path}.tmp`, text); } catch (error) { rmSync(`${path}.tmp`, { force: true }); throw error; } // no temp left (G2 delta D-5)
  for (let i = 0; ; i++) {
    try {
      renameSync(`${path}.tmp`, path);
      return;
    } catch (error) {
      if (i >= 5 || !["EPERM", "EBUSY"].includes(error?.code)) { rmSync(`${path}.tmp`, { force: true }); throw error; }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}

/** Run one HTTP check; `validate(res, text) -> { ok, detail }`. Records status + sha256 of the body. */
async function httpCheck(name, url, init, validate) {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
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
      timeout: TIMEOUT_MS,
    };
    if (isHttps) options.servername = u.hostname; // SNI = the connect host (matches the real cert's name)
    const req = send(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { raw += c; });
      res.on("end", () => { done({ status: res.statusCode ?? 0, text: raw, headers: res.headers }); });
    });
    req.on("error", (error) => { done({ error: String(error && error.message ? error.message : error) }); });
    const total = setTimeout(() => { req.destroy(); done({ error: "wired timeout" }); }, TIMEOUT_MS); // bounds the whole exchange
    req.on("close", () => { clearTimeout(total); });
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
function tlsCheck(host, port) {
  return new Promise((done) => {
    const total = setTimeout(() => { socket.destroy(); done({ host, authorized: false, error: "tls timeout" }); }, TIMEOUT_MS);
    const socket = tlsConnect({ host, port, servername: host, timeout: TIMEOUT_MS }, () => {
      clearTimeout(total);
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
    socket.on("error", (error) => { clearTimeout(total); done({ host, authorized: false, error: String(error && error.message ? error.message : error) }); });
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
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`verify-harness: ${error.message}; nothing checked, nothing written.`);
    process.exitCode = 2;
    return;
  }
  const { api, mcp } = args;
  TIMEOUT_MS = args.timeout;
  const apiUrl = new URL(api), mcpUrl = new URL(mcp);
  const apiHostHeader = args.apiHost ?? apiUrl.hostname; // Host header for the api-surface checks (api.->mirror)
  const checks = [];

  checks.push(await wiredCheck("health", `${api}/health`, { method: "GET" }, apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const ops = j && Array.isArray(j.operations) ? j.operations : [];
    return { ok: res.status === 200 && sameSet(ops, TOOLS), detail: `operations=${ops.join(",")}` };
  }));

  checks.push(await wiredCheck("openapi", `${api}/openapi.json`, { method: "GET" }, apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const paths = j && j.paths ? Object.keys(j.paths) : [];
    return { ok: res.status === 200 && sameSet(paths, TOOLS.map((t) => `/${t}`)), detail: `paths=${paths.join(",")}` };
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
  }, (res, text) => {
    const names = mcpToolNames(text);
    return { ok: res.status === 200 && names !== null && sameSet(names, TOOLS), detail: names ? `tools=${names.join(",")}` : `status=${res.status}` };
  }));

  checks.push(await wiredCheck("gate_call", `${api}/gate`, jsonInit(GATE_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const action = j && j.structuredContent ? j.structuredContent.action : null;
    return { ok: res.status === 200 && ["commit", "defer", "abstain"].includes(action), detail: `action=${action}` };
  }));

  // CM-2b / CM-2a: a 400 carries its stable `code`: the retired class, and a produced_at in 2099.
  for (const [name, body, code] of [["gate_retired_call", GATE_RETIRED_BODY, "task_class_retired"], ["gate_future_call", GATE_FUTURE_BODY, "produced_at_future"]]) {
    checks.push(await wiredCheck(name, `${api}/gate`, jsonInit(body), apiHostHeader, (res, text) => {
      const j = parseJson(text);
      const got = j && typeof j.code === "string" ? j.code : null;
      return { ok: res.status === 400 && j !== null && j.error === "tool_error" && got === code, detail: `status=${res.status} code=${String(got)}` };
    }));
  }

  // U-4b-2b (ADR-U4b-2b D4): the liq class is SERVED through the gate on the COMMITTED registry. A yhat of the committed
  // stratum s0 answers 200 with verdict.reason covered and the conformal UPPER BOUND [0, yhat + qhat] (qhat read from the
  // verdict, > 0), the committed n_calib and scores_sha256, and the committed class text in `content` (never the empty-registry
  // sentence). The coverage lives in verdict.reason: under this body (tauInterval 1, clock open) the L3 top-level answer is
  // defer / interval_too_wide, recorded in the detail next to it (checkpoint-1 C-10), never required to be covered.
  checks.push(await wiredCheck("gate_liq_call", `${api}/gate`, jsonInit(GATE_LIQ_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j && j.structuredContent ? j.structuredContent : null;
    const v = sc && sc.verdict ? sc.verdict : null;
    const r = v && v.region ? v.region : null;
    const vreason = v ? v.reason : null;
    const bound = r !== null && r.kind === "interval" && r.lo === 0 && typeof v.qhat === "number" && v.qhat > 0 && r.hi === GATE_LIQ_BODY.prediction.yhat + v.qhat;
    const nOk = v !== null && v.n_calib === LIQ_S0_N_CALIB;
    const digestOk = v !== null && v.scores_sha256 === LIQ_S0_SCORES_SHA256;
    const first = j && Array.isArray(j.content) ? j.content[0] : null;
    const t = first && typeof first.text === "string" ? first.text : "";
    const said = t.includes(LIQ_COMMITTED_SENTENCE) && !t.includes(LIQ_EMPTY_REGISTRY_SENTENCE);
    return {
      ok: res.status === 200 && vreason === "covered" && bound && nOk && digestOk && said,
      detail: `status=${res.status} action=${String(sc ? sc.action : null)} reason=${String(sc ? sc.reason : null)} verdict_reason=${String(vreason)} upper_bound=${String(bound)} n_calib=${String(v ? v.n_calib : null)} digest_s0=${String(digestOk)} committed_text=${String(t.includes(LIQ_COMMITTED_SENTENCE))} empty_text=${String(t.includes(LIQ_EMPTY_REGISTRY_SENTENCE))}`,
    };
  }));

  // ... and a yhat of an UNcommitted stratum (s1: yhat on the first served cut) abstains under_calib with n_calib 0: the
  // registry serves the committed stratum only, never a bound it does not hold (checkpoint-1 C-4).
  checks.push(await wiredCheck("gate_liq_uncommitted_call", `${api}/gate`, jsonInit(GATE_LIQ_UNCOMMITTED_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j && j.structuredContent ? j.structuredContent : null;
    const v = sc && sc.verdict ? sc.verdict : null;
    const action = sc ? sc.action : null;
    const vreason = v ? v.reason : null;
    const n = v ? v.n_calib : null;
    return {
      ok: res.status === 200 && vreason === "under_calib" && n === 0 && action === "abstain",
      detail: `status=${res.status} action=${String(action)} reason=${String(sc ? sc.reason : null)} verdict_reason=${String(vreason)} n_calib=${String(n)}`,
    };
  }));

  // ... and the served tools/list description of `gate` carries the COMMITTED clause entire (upper bound, requirements,
  // H-3, conditional rule: R-1b-2 closed, the upper bound is now required) and NOT the empty-registry sentence.
  checks.push(await httpCheck("mcp_gate_description_liq", mcp, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  }, (res, text) => {
    const d = mcpToolDescription(text, "gate");
    const hasClause = d !== null && d.includes(LIQ_COMMITTED_CLAUSE);
    const hasEmpty = d !== null && d.includes(LIQ_EMPTY_REGISTRY_SENTENCE);
    return { ok: res.status === 200 && hasClause && !hasEmpty, detail: `status=${res.status} committed_clause=${String(hasClause)} empty_registry_sentence=${String(hasEmpty)}` };
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

  // calibrate (Lot C1): a REAL BYO call returns a numeric q̂ AND carries the exchangeability label —
  // NOT "demonstrative" (calibrate computes; it is not a replayed witness like attest, ADR-M007 D5).
  // Capture the LIVE scores_sha256 so the C2 gate_byo_call check below can prove the loop closes.
  let calibrateScoresSha256 = null;
  checks.push(await wiredCheck("calibrate_call", `${api}/calibrate`, jsonInit(CALIBRATE_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j ? j.structuredContent : null;
    const label = sc && typeof sc.label === "string" ? sc.label : "";
    if (sc && typeof sc.scores_sha256 === "string") calibrateScoresSha256 = sc.scores_sha256;
    const ok = res.status === 200 && sc !== null && typeof sc.qhat === "number"
      && label.includes("exchangeable") && !label.includes("demonstrative");
    return { ok, detail: sc ? `qhat=${String(sc.qhat)}` : "no body" };
  }));

  // gate BYO (Lot C2): the BOUCLE. A /gate call reusing CALIBRATE_BODY.scores must return 200 + a COMMIT
  // AND its verdict.scores_sha256 must equal the calibrate call's scores_sha256 (same scores, same order) —
  // proving the caller can calibrate and then gate a covered decision on ITS OWN model, live.
  checks.push(await wiredCheck("gate_byo_call", `${api}/gate`, jsonInit(GATE_BYO_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j ? j.structuredContent : null;
    const digest = sc && sc.verdict ? sc.verdict.scores_sha256 : null;
    const action = sc ? sc.action : null;
    const ok = res.status === 200 && action === "commit"
      && typeof digest === "string" && digest === calibrateScoresSha256;
    return { ok, detail: `action=${String(action)} scores_sha256=${String(digest)} calibrate_scores_sha256=${String(calibrateScoresSha256)}` };
  }));
  checks.push(...(await kataAndVersionChecks(api, apiHostHeader, args.kataWaitMax))); // the kata path and version checks, last (after main())
  // TLS on EVERY host contacted (review m-f): an https host gets a real handshake on its own port; an http host (plain or
  // local) is not checked, so the run is never a green record (recordKind: "local").
  const tlsOf = (u, role) => (u.protocol === "https:"
    ? tlsCheck(u.hostname, u.port ? Number(u.port) : 443)
    : Promise.resolve({ host: u.hostname, skipped: true, reason: `${role} scheme is http: — TLS check skipped (plain/local target)` }));
  const tls = await tlsOf(apiUrl, "api"), tlsMcp = await tlsOf(mcpUrl, "mcp");

  const attestation = { url: api, mcp_url: mcp, checked_at: new Date().toISOString(), checks, tls, tls_mcp: tlsMcp };
  const out = JSON.stringify(attestation, null, 2);
  console.log(out);
  const failed = checks.filter((c) => !c.ok).map((c) => c.name);
  for (const [name, t] of [["tls", tls], ["tls_mcp", tlsMcp]]) if (t.skipped !== true && t.authorized !== true) failed.push(name);
  const kind = recordKind(failed, [tls, tlsMcp]);
  if (args.out && kind === "green") {
    writeAtomic(args.out, out + "\n");
    for (const stale of ["failed", "local"]) rmSync(`${args.out}.${stale}`, { force: true });
    console.error(`CA written to ${args.out}`);
  } else if (args.out) {
    writeAtomic(`${args.out}.${kind}`, out + "\n");
    console.error(`CA NOT written to ${args.out} (it keeps the last green record: ${kind === "local" ? "a host was not TLS-checked" : "a check failed"}); this record is in ${args.out}.${kind}`);
  }
  if (failed.length) {
    console.error(`VERIFY FAILED: ${failed.join(", ")}`);
    // O-1b-G2-1 (G2 HARNESS-DESC-1-1b, measured): under win32, process.exit() after fetch always ends on the libuv
    // assertion (3221226505), so the code was not discriminating; setting exitCode and returning exits 1 cleanly.
    process.exitCode = 1;
    return;
  }
  console.error(kind === "local" ? "VERIFY OK — all checks passed (TLS skipped: http target; not a deploy record)." : "VERIFY OK — all checks passed.");
}

// ---- Kata path and version checks (lot E-2a, the CA trio; R4 section (iii), the partner's choices). Written after main(), before
// the run-guard, so that no line above moves (killers pin them). The specification of the three checks (1 968 bytes, sha256
// 7e05ee5d8d7b7cd8a056acd2dab20e2efc8c98e72724ca96559e1ca5868a2bae; verbatim in docs/RUNBOOK-harness.md):
//
// Kata path and version checks. The deployment check, which runs the reader-side verifier against the served host, plays three
// more checks after every other check: first (3), which does not depend on the clock, then (1) and (2), which do.
//
// (1) gate_kata_call: one well-formed call on btc-range-1h, with predictor_id kata:ca-probe@ca-probe/BTCUSDT/1h, a key whose kata
// and venue are reserved for this check, so that no table can hold a row under it; features_digest the sha256 of the empty JSON
// array; yhat 0.01; alpha 0.01 and nMin 299; and a produced_at on the 1h grid that is at most 240 s before or after the clock of
// the run. If the run's clock is farther than 240 s from every grid instant, checks (1) and (2) fail with the detail
// kata_window_not_reached, unless the run was started with --kata-wait-max <s> and the wait to the next grid instant is at most s
// seconds: the run then waits, and reports the wait. If the Date header of the host's health answer is more than 60 s from the
// run's clock, checks (1) and (2) fail with the detail kata_clock_skew. Check (1) passes when the host answers HTTP 200 with
// action abstain, verdict.reason under_calib, verdict.n_calib 0, no region, verdict.cell_key kata:ca-probe@ca-probe/BTCUSDT/1h/b0
// and verdict.policy_row_sha256 null.
//
// (2) gate_kata_policy_table: the verdict of check (1) carries a policy_table_sha256 equal to the value written in the check. That
// value is the sha256 of the btc-range-1h table file of the latest published directory that holds that file, as the input list and
// the MANIFEST.sha256 of the release that published it record it; a release that changes that table changes the written value with
// it.
//
// (3) gate_version_1_0_0_call: the call of the existing gate check, with schema_version 1.0.0, answers HTTP 400 with error
// tool_error and code schema_version_unsupported.
//
// The import guard and the loader refuse any row whose kata or venue is ca-probe, so check (1) does not change when kata rows are
// served.
//
// The loader half of the reservation belongs to the kata loader of E-2a (a later lot); the import guard holds it already
// (kataKeyReserved, apps/harness/src/policy-guard.ts).

/** The one refused version of gate_version_1_0_0_call (contract 1.1.0 refuses 1.0.0 before produced_at is read). */
export const CA_REFUSED_SCHEMA_VERSION = "1.0.0";
/** The probe key of gate_kata_call: kata and venue ca-probe are reserved for this check, so no table can hold a row under it. */
export const KATA_PROBE_KEY = "kata:ca-probe@ca-probe/BTCUSDT/1h";
const KATA_PROBE_CELL = `${KATA_PROBE_KEY}/b0`;
const KATA_GRID_MS = 3600000; // the 1h grid of btc-range-1h
const KATA_WINDOW_MS = 240000; // the server takes 300 s on either side of produced_at; 60 s of it are kept for clock skew
const KATA_SKEW_MAX_MS = 60000;
const KATA_WAIT_MAX_S = 3600;
const TEST_CLOCK_ENV = "VERIFY_HARNESS_TEST_CLOCK_MS";
const LOOPBACK_HOSTS = ["127.0.0.1", "localhost", "[::1]"];
// The expected policy_table_sha256 of btc-range-1h, WRITTEN here (never read from the served build this check checks): the
// sha256 of contract-1.1.0/policy/btc-range-1h.json as the latest release that publishes that file (contract-1.1.0) records it
// in scripts/spec-publish-inputs.json and in its MANIFEST.sha256. A release that changes that table changes this value with it
// (test verify_harness_ca_pins_policy_table_sha256).
export const KATA_POLICY_TABLE_SHA256 = "1296c3336a96e23098f13acaf849f35c8c35970bd33d37d47f18fd26a50f955f";
// Derived from GATE_BODY.prediction (it writes no version): the probe key of btc-range-1h, features_digest the sha256 of the
// empty JSON array, yhat 0.01, and the class's imposed alpha 0.01 and nMin 299. produced_at is set at run time, on the grid.
export const GATE_KATA_BODY = {
  prediction: { ...GATE_BODY.prediction, task_class: "btc-range-1h", yhat: 0.01, predictor_id: KATA_PROBE_KEY, features_digest: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945" },
  params: { ...GATE_BODY.params, alpha: 0.01, nMin: 299, intent: 0 },
};
export const GATE_V100_BODY = { prediction: { ...GATE_BODY.prediction, schema_version: CA_REFUSED_SCHEMA_VERSION }, params: GATE_BODY.params };

/** parseArgs, last step: --kata-wait-max is an integer of seconds from 0 to 3600 (else null), and the test clock is an integer
 *  of epoch milliseconds that only a loopback target takes (it never reaches a deploy target); each refusal is named. */
function kataOptions(a, env = process.env) {
  if (a.kataWaitMax !== null) {
    if (!/^\d{1,4}$/.test(a.kataWaitMax) || Number(a.kataWaitMax) > KATA_WAIT_MAX_S) throw new Error(`option --kata-wait-max needs an integer of seconds from 0 to ${String(KATA_WAIT_MAX_S)}`);
    a.kataWaitMax = Number(a.kataWaitMax);
  }
  const raw = env[TEST_CLOCK_ENV];
  if (raw !== undefined && !/^\d{1,15}$/.test(raw)) throw new Error(`${TEST_CLOCK_ENV} needs an integer of epoch milliseconds`);
  if (raw !== undefined && ![a.api, a.mcp].every((u) => LOOPBACK_HOSTS.includes(new URL(u).hostname))) throw new Error(`${TEST_CLOCK_ENV} is for tests: refused unless --api and --mcp are loopback hosts`);
  return a;
}

/** The run clock: the machine clock and a real wait; under the test clock, that instant running with real time, and a wait
 *  that moves the clock without sleeping. */
function runClock(env = process.env) {
  const raw = env[TEST_CLOCK_ENV];
  if (raw === undefined) return { now: () => Date.now(), wait: (ms) => new Promise((done) => { setTimeout(done, ms); }) };
  const t0 = performance.now();
  let moved = 0;
  return { now: () => Number(raw) + Math.round(performance.now() - t0) + moved, wait: async (ms) => { moved += ms; } };
}

/** Where `nowMs` stands on the 1h grid (pure): within KATA_WINDOW_MS of a grid instant, that instant and no wait; else the next
 *  grid instant and the wait to it, that instant only when the wait is at most `waitMaxS` seconds. */
export function kataWindow(nowMs, waitMaxS) {
  const near = Math.round(nowMs / KATA_GRID_MS) * KATA_GRID_MS;
  if (Math.abs(nowMs - near) <= KATA_WINDOW_MS) return { at: near, waitMs: 0 };
  const next = Math.ceil(nowMs / KATA_GRID_MS) * KATA_GRID_MS, waitMs = next - nowMs;
  return { at: waitMaxS !== null && waitMs <= waitMaxS * 1000 ? next : null, waitMs };
}

/** A check that reads a value captured by an earlier check (no request): ok iff it equals `expected`. */
function capturedCheck(name, value, expected) {
  return { name, ok: value === expected, status: value === null ? 0 : 200, sha256: value === null ? null : sha256(value), detail: `policy_table_sha256=${String(value)} expected=${expected}` };
}

/** The three checks, in their order: (3) gate_version_1_0_0_call, then (1) gate_kata_call and (2) gate_kata_policy_table. */
async function kataAndVersionChecks(api, hostHeader, waitMaxS, clock = runClock()) {
  const out = [await wiredCheck("gate_version_1_0_0_call", `${api}/gate`, jsonInit(GATE_V100_BODY), hostHeader, (res, text) => {
    const j = parseJson(text);
    const got = j && typeof j.code === "string" ? j.code : null;
    return { ok: res.status === 400 && j !== null && j.error === "tool_error" && got === "schema_version_unsupported", detail: `status=${res.status} code=${String(got)}` };
  })];
  const failBoth = (detail) => [...out, ...["gate_kata_call", "gate_kata_policy_table"].map((name) => ({ name, ok: false, status: 0, sha256: null, detail }))];
  const w = kataWindow(clock.now(), waitMaxS), grid = (ms) => new Date(ms).toISOString().replace(".000Z", "Z");
  if (w.at === null) return failBoth(`kata_window_not_reached: the run clock is more than ${String(KATA_WINDOW_MS / 1000)} s from every grid instant; the next is ${grid(clock.now() + w.waitMs)}, in ${String(Math.round(w.waitMs / 1000))} s (--kata-wait-max ${String(waitMaxS)})`);
  const waited = Math.round(w.waitMs / 1000);
  if (w.waitMs > 0) {
    console.error(`verify-harness: waiting ${String(waited)} s for the grid instant ${grid(w.at)} (--kata-wait-max ${String(waitMaxS)})`);
    await clock.wait(w.waitMs);
  }
  const health = await wiredRequest(`${api}/health`, { method: "GET", hostHeader });
  const date = health.headers && typeof health.headers.date === "string" ? Date.parse(health.headers.date) : NaN;
  const skew = Math.abs(date - clock.now());
  if (!(skew <= KATA_SKEW_MAX_MS)) return failBoth(`kata_clock_skew: the Date header of /health (${String(health.headers?.date ?? health.error)}) is not within ${String(KATA_SKEW_MAX_MS / 1000)} s of the run clock (${grid(clock.now())})`);
  let verdict = null;
  out.push(await wiredCheck("gate_kata_call", `${api}/gate`, jsonInit({ prediction: { ...GATE_KATA_BODY.prediction, produced_at: grid(w.at) }, params: GATE_KATA_BODY.params }), hostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j && j.structuredContent ? j.structuredContent : null;
    const v = sc && sc.verdict ? sc.verdict : null;
    if (v !== null) verdict = v;
    const ok = res.status === 200 && v !== null && sc.action === "abstain" && v.reason === "under_calib" && v.n_calib === 0 && v.region === null && v.cell_key === KATA_PROBE_CELL && v.policy_row_sha256 === null;
    return { ok, detail: `status=${res.status} action=${String(sc ? sc.action : null)} verdict_reason=${String(v ? v.reason : null)} n_calib=${String(v ? v.n_calib : null)} region=${JSON.stringify(v ? v.region : null)} cell_key=${String(v ? v.cell_key : null)} policy_row_sha256=${String(v ? v.policy_row_sha256 : null)} produced_at=${grid(w.at)} waited_s=${String(waited)}` };
  }));
  out.push(capturedCheck("gate_kata_policy_table", verdict !== null && typeof verdict.policy_table_sha256 === "string" ? verdict.policy_table_sha256 : null, KATA_POLICY_TABLE_SHA256));
  return out;
}

// Run-guard: execute only when invoked directly (like the other scripts), never on import.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(`verify-harness crashed: ${String(error && error.message ? error.message : error)}`);
    process.exitCode = 1; // O-1b-G2-1: no process.exit() after fetch (win32 libuv assertion)
  });
}
