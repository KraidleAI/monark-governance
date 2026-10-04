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
// BOTH hosts, MCP tools/list returns the four tools, a REAL gate/cascade/attest/calibrate call, a gate BYO
// call (C2: verdict.calib_digest === the calibrate set_digest + action commit, proving the loop), and — for
// an https `--api` ONLY — the TLS certificate (issuer, expiry); an http `--api` (plain/local) SKIPS the TLS check.
// U-4b-2b (ADR-U4b-2b D4; switched from the HARNESS-DESC-1 empty-registry checks): the liquidation-eligible-coverage class
// on the COMMITTED registry -- a gate call in the committed stratum s0 (200, verdict.reason covered, the upper bound
// [0, yhat + qhat], the committed n_calib and C5 digest, the committed class text in `content`), a gate call in an
// UNcommitted stratum (200, abstain, verdict.reason under_calib, n_calib 0), and the served tools/list description of
// `gate` (the committed clause entire, the empty-registry sentence absent). 15 checks (CM-2b adds gate_retired_call and gate_future_call).
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
// The TERMINAL tool set (ADR-M007, set 3→4): checks assert SET EQUALITY against this, not a subset — a
// dropped OR a stray tool reddens (B-2, motif registry.test.ts:55).
const TOOLS = ["gate", "cascade", "attest", "calibrate"];

// The ONE prediction.schema_version of the CA bodies (MONARK e9cd32b Q-UP-2): == SCHEMA_VERSION of apps/harness/src/tools/gate.ts,
// parity asserted by test/verify-harness-liq.test.ts (zero dependency); block C moves both, each in one line.
export const CA_SCHEMA_VERSION = "1.0.0";
// Same fixture shapes the harness tests use (a real, non-abstain decision on the committed USDe key, alpha 0.1 and nMin 50
// imposed since CM-2b, btc-dir-15m being retired; a 2-node cascade;
// a calibrate call whose n=10 >= nMin and p=⌈11·0.9⌉=10 <= n yields a numeric q̂). Exported: scripts/sync-harness-served.mjs
// POSTs this very object, never a copy (G2 of CM-2b surfaces, M2).
export const GATE_BODY = {
  prediction: { schema_version: CA_SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0.0001, tool: "perps_order_preview", clockOpen: true },
};
const CASCADE_BODY = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" };
// CM-2b (ADR-CM B-5): the retired class answers a named 400 with its stable code (CM-2a, B-3).
const GATE_RETIRED_BODY = {
  prediction: { schema_version: CA_SCHEMA_VERSION, task_class: "btc-dir-15m", yhat: "up", predictor_id: "internal:momentum-4c", produced_at: "2026-09-04T00:00:00Z" },
  params: { ...GATE_BODY.params, intent: "up" },
};
// CM-2a (ADR-CM B-4, MONARK C-8): a produced_at far in the future answers 400 produced_at_future at the entry point.
const GATE_FUTURE_BODY = { prediction: { ...GATE_BODY.prediction, produced_at: "2099-01-01T00:00:00Z" }, params: GATE_BODY.params };
const CALIBRATE_BODY = { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 };
// Lot C2 BYO loop: a /gate call that REUSES CALIBRATE_BODY.scores as caller-supplied calibration (interval
// mode, a caller-owned task_class). Hand-rolled n=10, α=0.1 ⇒ p=⌈11·0.9⌉=10 ⇒ q̂=10th smallest=1.0; ŷ=0 ⇒
// region [−1,1], width 2 ≤ tauInterval 2, intent 0 ∈ [−1,1] ⇒ COMMIT (written in). The check asserts the
// LIVE decision's verdict.calib_digest === the LIVE calibrate set_digest — proving the BYO boucle end-to-end.
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
// apps/harness/src/tools/gate.ts, the committed C5 digest and size of stratum s0 of apps/harness/src/calibration.ts.
const LIQ_UPPER_BOUND_SENTENCE = "a conformal upper bound on the liquidable amount for the calibrated class; the lower edge is 0 by construction, not a calibrated bound; abstains (under_calib) outside it";
const LIQ_REQUIREMENTS_SENTENCE = "this class requires alpha = 0.01, nMin = 100";
const LIQ_H3_SENTENCE = "calibrated on one recorded episode; no coverage is claimed on any other event; the H-3 exchangeability check is a report, a YES licenses nothing more";
const LIQ_CONDITIONAL_SENTENCE = "the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH account at the first crossing, which the gate does not check";
const LIQ_EMPTY_REGISTRY_SENTENCE = "no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction";
const LIQ_S0_CALIB_DIGEST = "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334";
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
  // verdict, > 0), the committed n_calib and C5 digest, and the committed class text in `content` (never the empty-registry
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
    const digestOk = v !== null && v.calib_digest === LIQ_S0_CALIB_DIGEST;
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
  // Capture the LIVE set_digest so the C2 gate_byo_call check below can prove the loop closes.
  let calibrateSetDigest = null;
  checks.push(await wiredCheck("calibrate_call", `${api}/calibrate`, jsonInit(CALIBRATE_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j ? j.structuredContent : null;
    const label = sc && typeof sc.label === "string" ? sc.label : "";
    if (sc && typeof sc.set_digest === "string") calibrateSetDigest = sc.set_digest;
    const ok = res.status === 200 && sc !== null && typeof sc.qhat === "number"
      && label.includes("exchangeable") && !label.includes("demonstrative");
    return { ok, detail: sc ? `qhat=${String(sc.qhat)}` : "no body" };
  }));

  // gate BYO (Lot C2): the BOUCLE. A /gate call reusing CALIBRATE_BODY.scores must return 200 + a COMMIT
  // AND its verdict.calib_digest must equal the calibrate call's set_digest (same scores ⇒ same digest) —
  // proving the caller can calibrate and then gate a covered decision on ITS OWN model, live.
  checks.push(await wiredCheck("gate_byo_call", `${api}/gate`, jsonInit(GATE_BYO_BODY), apiHostHeader, (res, text) => {
    const j = parseJson(text);
    const sc = j ? j.structuredContent : null;
    const digest = sc && sc.verdict ? sc.verdict.calib_digest : null;
    const action = sc ? sc.action : null;
    const ok = res.status === 200 && action === "commit"
      && typeof digest === "string" && digest === calibrateSetDigest;
    return { ok, detail: `action=${String(action)} calib_digest=${String(digest)} set_digest=${String(calibrateSetDigest)}` };
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
    // O-1b-G2-1 (G2 HARNESS-DESC-1-1b, measured): under win32, process.exit() after fetch always ends on the libuv
    // assertion (3221226505), so the code was not discriminating; setting exitCode and returning exits 1 cleanly.
    process.exitCode = 1;
    return;
  }
  console.error(tls.skipped === true ? "VERIFY OK — all checks passed (TLS skipped: http api target)." : "VERIFY OK — all checks passed.");
}

// Run-guard: execute only when invoked directly (like the other scripts), never on import.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(`verify-harness crashed: ${String(error && error.message ? error.message : error)}`);
    process.exitCode = 1; // O-1b-G2-1: no process.exit() after fetch (win32 libuv assertion)
  });
}
