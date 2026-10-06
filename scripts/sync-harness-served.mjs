// scripts/sync-harness-served.mjs — write apps/site/data/harness-served.json from what the MONARK harness SERVES
// (storefront surface "harness", decision 159). Node 24: built-ins plus the harness sources it checks the served
// text against (type-stripped .ts). SOURCE-REPO tool (not exported, like scripts/sync-bell-served.mjs); run by the
// orchestrator BEFORE a storefront build:  node scripts/sync-harness-served.mjs
//
// Reads (https only, checked on each URL before its fetch; a redirect is refused; 200 only; each body read through a
// stream capped at MAX_BYTES, a declared content-length above the cap refused before reading): GET api /health and
// /openapi.json; POST mcp initialize and tools/list; POST api /gate, /calibrate, /attest, /cascade with the SAME bodies
// as the deploy check (scripts/verify-harness.mjs); GET the public MCP registry entry (one read; the registry documents
// an unauthenticated read-only API, to be read "on a regular but infrequent basis"). Then FAIL-CLOSED, before any write:
//  - each body hashes to the sha256 the committed deploy check docs/deploy-CA-harness.json recorded for it (the
//    served bytes did not drift since that check), and that check is green on every control with an authorized TLS;
//  - one version everywhere: openapi info.version = MCP serverInfo.version = the registry's isLatest version;
//  - one tool set everywhere: /health operations = openapi paths = MCP tools/list names;
//  - every closed clause below (phrases checked against the harness sources) is served EXACTLY; the served class set
//    equals the closed class list; nothing is paraphrased — a missing phrase stops the sync.
// Writes ONLY: URLs and paths, the version, tool names with one closed note each, the /gate request envelope (keys,
// params with type and description, internal reference tokens removed by one declared rule, the keys of the optional
// BYO calibration object), the /calibrate request and result key sets, the response envelope keys, the served maxItems
// bounds, the refusal texts, the closed honesty clauses, the class table, the attest label / hypotheses / channel /
// verifier revision / observation instant (never its subject, bytes or attestor), the registry entry, the deploy check
// summary (with the host its TLS block probed) and the sha256 of each body read. LF, two-space JSON; it then sets the
// file's CRLF->LF sha256 in apps/site/data/manifest.sha256.json (canonical form; the ukemi sync's own writer, imported).
// PENDING SNAPSHOT (SERVED-PENDING-1, decisions of MONARK, recherches 0058bfe):
//  - node scripts/sync-harness-served.mjs --pending, at time (i) of a block that changes a served surface, reads NOTHING
//    over the network: it runs the same closed checks on the bodies the IN-PROCESS harness answers to the same requests,
//    writes apps/site/data/harness-pending.json (schema monark-site-harness-pending-v1: the shared fields, written_at and
//    the sha256 of the in-process /openapi.json; no read_at, mcp, registry, deploy check nor served body sha256), and
//    inserts pending_since (UTC day; kept if already set) after read_at in the served file, no other byte touched, and
//    sets both manifest entries;
//  - the default run, at time (ii) once the harness is deployed and checked, PROMOTES: while a pending snapshot exists it
//    refuses to write unless the new served snapshot equals it on every shared field and the /openapi.json sha256, then
//    writes the served file (no pending_since), sets its manifest entry, removes the pending entry, then the pending file.
// Every check and the manifest text are computed before the first write. Then: node scripts/repin-served.mjs.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { CALIBRATE_LABEL } from "../apps/harness/src/tools/calibrate.ts";
import {
  TASK_CASCADE, TASK_STABLE_RUN, TASK_LIQ_ELIGIBLE, CASCADE_UNCALIBRATED_SENTENCE, STABLE_RUN_COMMITTED_CORE,
  STABLE_RUN_UNCALIBRATED_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_REQUIREMENTS_SENTENCE, GATE_TOOL_DESCRIPTION,
  LIQ_UPPER_BOUND_SENTENCE, LIQ_H3_SENTENCE, LIQ_CONDITIONAL_SENTENCE, LIQ_COMMITTED_SENTENCE,
} from "../apps/harness/src/tools/gate.ts";
import { DEMONSTRATIVE_LABEL } from "../packages/monark/src/adapter-shogen.ts";
// The one declared text rule (internal reference tokens in parentheses removed), shared with the site loader and its test.
import { SHAPES, stripRefs } from "../apps/site/lib/harness-served-load.ts";
// The deploy check's request bodies, imported (never a copy), so they cannot drift before deployment (G2 of CM-2b surfaces, M2):
// each served response hashes to the sha256 the committed check recorded.
import { GATE_BODY, GATE_LIQ_BODY, CALIBRATE_BODY, CASCADE_BODY } from "./verify-harness.mjs";
import { setManifestEntry, removeManifestEntry, MANIFEST_REL } from "./sync-ukemi-served.mjs";
import { handleJsonMirror } from "../apps/harness/src/http.ts";
import { HARNESS_TOOLS } from "../apps/harness/src/tools/registry.ts";
import { API_SERVER_URL } from "../apps/harness/src/openapi.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_REL = "apps/site/data/harness-served.json";
export const PENDING_REL = "apps/site/data/harness-pending.json";
export const CA_REL = "docs/deploy-CA-harness.json";
const REGISTRY = "https://registry.modelcontextprotocol.io/v0/servers?search=tech.monarkgate";
const MAX_BYTES = 1024 * 1024;
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const lfSha = (text) => sha256(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"));
const fail = (why) => { console.error(`sync-harness-served: FAIL-CLOSED — ${why}; nothing written.`); process.exit(1); };
const need = (ok, why) => { if (!ok) fail(why); };
const sameSet = (a, b) => a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");

// CLOSED clause list — exact served phrases, never a paraphrase. Each class row names the phrases that must be served;
// the stable-run row keeps the scope qualifier of the committed calibration (calm-window redemption flow).
const STABLE_ONE = "a committed stable-run velocity calibration for the USDe synthetic-dollar-whitelisted-redeem population";
const STABLE_CALM = "over calm-window redemption flow";
const STABLE_NONSTATIONARY = "the calibration is measured non-stationary across half-years";
const STABLE_NO_COVERAGE = "no coverage is measured";
for (const p of [STABLE_ONE, STABLE_CALM, STABLE_NONSTATIONARY, STABLE_NO_COVERAGE]) need(STABLE_RUN_COMMITTED_CORE.includes(p), `closed clause absent from the harness source: ${p}`);
const BASE_CLASSES = [
  { class_id: TASK_CASCADE, state: "none", clauses: [CASCADE_UNCALIBRATED_SENTENCE] },
  { class_id: TASK_STABLE_RUN, state: "committed", clauses: [STABLE_ONE, STABLE_CALM, STABLE_NONSTATIONARY, STABLE_NO_COVERAGE, `for any other population, ${STABLE_RUN_UNCALIBRATED_SENTENCE}`] },
];
// The liquidation-eligible-coverage row FOLLOWS the SERVED registry state (switch window of the class): the served /gate
// description carries exactly one of the two clauses the gate module composes (describeGate), and the row lists the closed
// phrases of that state. The served liq answer must agree with the same state, judged on verdict.reason (the top-level
// reason is L3's action reason: defer / interval_too_wide on a covered bound under the deploy check's body).
const LIQ_EMPTY_CLAUSE = `${LIQ_EMPTY_REGISTRY_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;
const LIQ_COMMITTED_CLAUSE = `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;
const LIQ_ROWS = {
  none: { class_id: TASK_LIQ_ELIGIBLE, state: "none", clauses: [LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_REQUIREMENTS_SENTENCE] },
  committed: { class_id: TASK_LIQ_ELIGIBLE, state: "committed", clauses: [LIQ_UPPER_BOUND_SENTENCE, LIQ_REQUIREMENTS_SENTENCE, LIQ_H3_SENTENCE, LIQ_CONDITIONAL_SENTENCE] },
};
/** The served liq registry state from the served /gate description (pure): exactly one clause must be served. */
export function liqStateOf(gateDescription) {
  const empty = gateDescription.includes(LIQ_EMPTY_CLAUSE), committed = gateDescription.includes(LIQ_COMMITTED_CLAUSE);
  if (empty === committed) throw new Error(`the served /gate description carries ${empty ? "both" : "neither"} liquidation-eligible-coverage clause(s)`);
  return committed ? "committed" : "none";
}
/** The closed class table for a served liq state (pure). */
export const classesFor = (liqState) => [...BASE_CLASSES, LIQ_ROWS[liqState]];
/** Does the served liq answer agree with the served state (pure)? verdict.reason and the content text, never the top-level reason. */
export function liqCallAgrees(liqState, liqCall) {
  const v = liqCall?.structuredContent?.verdict;
  const text = typeof liqCall?.content?.[0]?.text === "string" ? liqCall.content[0].text : "";
  if (liqState === "none") return v?.reason === "under_calib" && v?.n_calib === 0 && text.includes(LIQ_EMPTY_REGISTRY_SENTENCE);
  const r = v?.region;
  return v?.reason === "covered" && r?.kind === "interval" && r.lo === 0 && typeof v.qhat === "number" && v.qhat > 0 &&
    text.includes(LIQ_COMMITTED_SENTENCE) && !text.includes(LIQ_EMPTY_REGISTRY_SENTENCE);
}
const BYO_CLAUSE = "the gate conformalizes against THOSE caller-supplied scores (BYO)";
const NEVER_CALLS = "The gate only emits a decision; it never calls the named tool.";
const BT_CLAUSE = "B_t is caller-carried";
// The `attested` clauses: who carries the attestation, that no verifier runs, that a BYO call does not take one, and that no served class takes one (C-2).
const ATTESTED = ["the attestation is carried by the caller", "the verifier is not executed here", "BYO classes do not accept `attested`", "No served class has a committed attestation subject (the retired 'btc-dir-15m' held the only one), so any `attested` is refused."];
for (const p of [...ATTESTED, BYO_CLAUSE, NEVER_CALLS]) need(GATE_TOOL_DESCRIPTION.includes(p), `closed clause absent from the harness source: ${p}`);
const TOOL_NOTES = { cascade: "This cascade tool is v0", gate: NEVER_CALLS, calibrate: CALIBRATE_LABEL.split(". ")[0] };
const INTERNAL = /\bADR-|\b[CDKU]-\d|\bD\d+\b|\bP1\b|\bKraidle\b|binance|coinbase|databento|massive|polygon|helius|chainstack|tenderly|drpc|blastapi|nodies|cloudfront|\bverified\b|guarantee|partner|autonomous/i;

async function read(url, init = {}) {
  need(new URL(url).protocol === "https:", `${url} is not an https URL (https only)`);
  const res = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(30_000) });
  need(res.status === 200, `${init.method ?? "GET"} ${url} answered ${String(res.status)} (200 only, no redirect followed)`);
  const declared = Number(res.headers.get("content-length") ?? "0");
  need(!(declared > MAX_BYTES), `${url} declares a body of ${String(declared)} bytes (cap ${String(MAX_BYTES)})`);
  const chunks = [];
  let size = 0;
  for await (const chunk of res.body ?? []) {
    size += chunk.byteLength;
    need(size <= MAX_BYTES, `${url} body exceeds the cap of ${String(MAX_BYTES)} bytes`);
    chunks.push(chunk);
  }
  const text = new TextDecoder("utf-8").decode(Buffer.concat(chunks)); // same decoding as Response.text()
  need(text.length > 0, `${url} body is empty`);
  return text;
}
const post = (url, body, accept = "application/json") => read(url, { method: "POST", headers: { "content-type": "application/json", accept }, body: JSON.stringify(body) });
const sse = (text) => { const line = text.split(/\r?\n/).find((l) => l.startsWith("data:")); return JSON.parse(line ? line.slice(5).trim() : text); };
/** The key sets of a CLOSED object schema: required, and the declared properties that are not required. */
const keySets = (s, what) => {
  need(s?.additionalProperties === false && s.properties !== undefined, `${what} is not a closed object schema`);
  const required = s.required ?? [];
  return { required, optional: Object.keys(s.properties).filter((k) => !required.includes(k)) };
};

async function main() {
  const ca = JSON.parse(readFileSync(join(ROOT, CA_REL), "utf8"));
  const caSha = Object.fromEntries(ca.checks.map((c) => [c.name, c.sha256]));
  need(ca.checks.length > 0 && ca.checks.every((c) => c.ok === true) && ca.tls?.authorized === true && ca.tls_mcp?.authorized === true, `${CA_REL} is not green on every control with an authorized TLS on both hosts`);
  const api = ca.url, mcpHost = ca.mcp_url;
  need([new URL(api).host, new URL(mcpHost).host].includes(ca.tls.host), `${CA_REL} tls.host is neither the api host nor the MCP host`);
  const bodies = {};
  const got = async (key, caName, p) => { const t = await p; need(sha256(t) === caSha[caName], `${key} drifted from the deploy check (${caName}); re-run scripts/verify-harness.mjs first`); bodies[key] = sha256(t); return t; };

  const health = JSON.parse(await got("/health", "health", read(`${api}/health`)));
  const openapi = JSON.parse(await got("/openapi.json", "openapi", read(`${api}/openapi.json`)));
  const registry = JSON.parse(await read(REGISTRY, { headers: { accept: "application/json" } }));
  const latest = (registry.servers ?? []).filter((s) => s._meta?.["io.modelcontextprotocol.registry/official"]?.isLatest === true);
  need(latest.length === 1, "the registry lists no single isLatest entry");
  const entry = latest[0].server, meta = latest[0]._meta["io.modelcontextprotocol.registry/official"];
  const remote = entry.remotes?.[0];
  need(remote !== undefined && remote.url === `${mcpHost}/mcp`, "the registry remote is not the deploy check's MCP host /mcp");
  const MCP_ACCEPT = "application/json, text/event-stream";
  const init = sse(await read(remote.url, { method: "POST", headers: { "content-type": "application/json", accept: MCP_ACCEPT }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "monark-site-sync", version: "0.0.0" } } }) }));
  const list = sse(await got("tools/list", "mcp_tools_list", post(remote.url, { jsonrpc: "2.0", id: 1, method: "tools/list" }, MCP_ACCEPT))).result.tools;
  const gateCall = JSON.parse(await got("/gate", "gate_call", post(`${api}/gate`, GATE_BODY)));
  const liqCall = JSON.parse(await got("/gate liquidation-eligible-coverage", "gate_liq_call", post(`${api}/gate`, GATE_LIQ_BODY)));
  const calCall = JSON.parse(await got("/calibrate", "calibrate_call", post(`${api}/calibrate`, CALIBRATE_BODY)));
  const attCall = JSON.parse(await got("/attest", "attest_call", post(`${api}/attest`, {})));
  const casCall = JSON.parse(await got("/cascade", "cascade_call", post(`${api}/cascade`, CASCADE_BODY)));
  const { version, api: apiFacts, ...shapes } = shapesFrom({ health, openapi, list, gateCall, liqCall, calCall, attCall, casCall });
  need(version === init.result.serverInfo.version && version === entry.version, `version mismatch: openapi ${version}, serverInfo ${init.result.serverInfo.version}, registry ${entry.version}`);
  need(apiFacts.url === api, "openapi servers[0].url is not the deploy check URL");
  const out = {
    $comment:
      "Committed, hashed facts about the SERVED MONARK harness, rendered by /integrators and /console through apps/site/lib/harness-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json. Written by the source repository's sync tool (not part of this export) from the served bodies (api /health, /openapi.json, /gate, /calibrate, /attest, /cascade; mcp initialize and tools/list; the MCP registry entry), each body hashing to the sha256 the committed deploy check recorded. Text is copied as served, as closed clauses only; the one rule applied: internal reference tokens in parentheses are removed. No market value, no data-source name.",
    schema: "monark-site-harness-served-v1",
    read_at: new Date().toISOString(),
    version,
    api: apiFacts,
    mcp: { url: remote.url, remote_type: remote.type, server_name: init.result.serverInfo.name },
    ...shapes,
    registry: { name: entry.name, version: entry.version, status: meta.status, published_at: meta.publishedAt, repository_url: entry.repository.url },
    deploy_check: { checked_at: ca.checked_at, count: ca.checks.length, ok_count: ca.checks.filter((c) => c.ok).length, tls_host: ca.tls.host, tls_valid_to: ca.tls.valid_to },
    bodies_sha256: bodies,
  };
  let done;
  try { done = writeServed(ROOT, out, entry.repository.url); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
  console.log(`sync-harness-served OK — ${OUT_REL} written (version ${version}, ${String(out.tools.length)} tools); manifest entry set to ${done.sha}${done.promoted ? `; the pending snapshot is promoted, ${PENDING_REL} and its manifest entry removed` : ""}. Then: node scripts/repin-served.mjs`);
}

/** Write the served snapshot `out` under `root`, PROMOTING a pending snapshot when one exists: the pending comparison, the
 *  leak scan and the manifest text first, then the served file, the manifest (its entry set, the pending entry removed) and
 *  the removal of the pending file (the ukemi sync's order). Throws, writing nothing. */
export function writeServed(root, out, exempt) {
  const promoted = existsSync(join(root, PENDING_REL));
  if (promoted) {
    const drift = pendingDiff(out, JSON.parse(readFileSync(join(root, PENDING_REL), "utf8")));
    if (drift.length > 0) throw new Error(`the served harness differs from the pending snapshot on {${drift.join(", ")}}; nothing promoted`);
  }
  const text = snapshotText(out, exempt), sha = lfSha(text);
  let manifest = setManifestEntry(readFileSync(join(root, MANIFEST_REL), "utf8"), OUT_REL, sha);
  if (promoted) manifest = removeManifestEntry(manifest, PENDING_REL);
  writeFileSync(join(root, OUT_REL), text);
  writeFileSync(join(root, MANIFEST_REL), manifest);
  if (promoted) rmSync(join(root, PENDING_REL));
  return { sha, promoted };
}

/** The fields both snapshots carry, from the bodies answered (served or in process); every check is fail-closed. */
export function shapesFrom({ health, openapi, list, gateCall, liqCall, calCall, attCall, casCall }) {
  const version = openapi.info.version;
  need(typeof openapi.servers?.[0]?.url === "string" && health.status === "ok", "openapi carries no servers[0].url, or /health is not ok");
  const tools = list.map((t) => t.name);
  need(sameSet(tools, health.operations) && sameSet(tools, Object.keys(openapi.paths).map((p) => p.slice(1))), "the tool set differs between /health, openapi paths and tools/list");
  const desc = Object.fromEntries(list.map((t) => [t.name, t.description]));
  const gateOp = openapi.paths["/gate"].post;
  need(gateOp.description === desc.gate, "the /gate openapi description differs from the MCP tools/list description");
  let liqState = "none";
  try { liqState = liqStateOf(desc.gate); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
  const CLASSES = classesFor(liqState);
  const served = [...desc.gate.matchAll(/For '([a-z0-9-]+)'/g)].map((m) => m[1]);
  need(sameSet(served, CLASSES.map((c) => c.class_id)), `served classes {${served.join(", ")}} differ from the closed class list`);
  for (const c of CLASSES) for (const p of c.clauses) need(desc.gate.includes(p), `class ${c.class_id}: clause not served: ${p}`);
  for (const p of [BYO_CLAUSE, NEVER_CALLS, ...ATTESTED]) need(desc.gate.includes(p), `gate description lacks: ${p}`);
  need(openapi.info.description.includes(NEVER_CALLS), "openapi info.description lacks the never-calls sentence");
  need(desc.calibrate === CALIBRATE_LABEL && calCall.structuredContent.label === CALIBRATE_LABEL && calCall.content[0].text.startsWith(CALIBRATE_LABEL), "the calibrate label differs across its three carriers");
  need(desc.cascade.includes(TOOL_NOTES.cascade) && casCall.content[0].text.includes(TOOL_NOTES.cascade) && casCall.content[0].text.includes(CASCADE_UNCALIBRATED_SENTENCE), "the cascade v0 clause is not served");
  need(gateCall.content[0].text.includes(BT_CLAUSE) && gateCall.structuredContent.remaining_budget === GATE_BODY.params.remainingBudget, "the gate does not serve the caller-carried B_t clause and echo");
  need(liqCallAgrees(liqState, liqCall), `the liquidation-eligible-coverage call does not agree with the served ${liqState} registry (verdict.reason and content text)`);
  const att = attCall.structuredContent;
  need(att.label === DEMONSTRATIVE_LABEL && Array.isArray(att.price.residual) && att.price.residual.length > 0, "attest label or residual list not served as expected");

  const bodySchema = (p) => openapi.paths[p].post.requestBody.content["application/json"].schema;
  const resultSchema = (p) => openapi.paths[p].post.responses["200"].content["application/json"].schema.properties.structuredContent;
  const req = bodySchema("/gate");
  const params = req.properties.params;
  const typeOf = (s) => (Array.isArray(s.type) ? s.type.join(" | ") : s.type);
  const envelope = (op) => op.post.responses["200"].content["application/json"].schema.required;
  need(Object.values(openapi.paths).every((op) => sameSet(envelope(op), envelope(openapi.paths["/gate"]))), "the response envelope differs between operations");
  const cal = bodySchema("/calibrate").properties.scores.maxItems;
  const casc = bodySchema("/cascade").properties;
  need(casc.L.maxItems === casc.e.maxItems && casc.L.items.maxItems === casc.L.maxItems, "the cascade node bounds are not in lockstep");
  const r = gateOp.responses;
  need(sameSet(Object.keys(r), ["200", "400", "403", "413", "500"]), "the /gate responses are not exactly 200, 400, 403, 413 and 500");
  const byoParam = Object.entries(params.properties).filter(([name, s]) => !params.required.includes(name) && s.type === "object");
  need(byoParam.length === 1, "the /gate params do not carry exactly one optional object (the BYO calibration)");
  return {
    version,
    api: { url: openapi.servers[0].url, openapi_path: "/openapi.json", health_path: "/health", surface: health.surface, openapi_version: openapi.openapi, title: openapi.info.title },
    tools: [...tools].sort().map((name) => ({ name, note: name === "attest" ? att.label : TOOL_NOTES[name] })),
    gate_request: {
      required: req.required, optional: Object.keys(req.properties).filter((k) => !req.required.includes(k)), closed: req.additionalProperties === false,
      params: Object.entries(params.properties).map(([name, s]) => ({ name, type: typeOf(s), required: params.required.includes(name), text: stripRefs(s.description) })),
      byo_calibration: { param: byoParam[0][0], ...keySets(byoParam[0][1], "the /gate BYO calibration") },
    },
    calibrate_contract: { request: keySets(bodySchema("/calibrate"), "the /calibrate request"), result: keySets(resultSchema("/calibrate"), "the /calibrate result") },
    response_required: envelope(openapi.paths["/gate"]),
    bounds: { calibrate_scores: cal, gate_scores: params.properties.calibration.properties.scores.maxItems, gate_candidates: params.properties.calibration.properties.candidates.maxItems, cascade_nodes: casc.L.maxItems },
    refusal: { invalid_status: "400", invalid_text: stripRefs(r["400"].description), origin_status: "403", origin_text: stripRefs(r["403"].description) },
    honesty: { calibrate_label: CALIBRATE_LABEL, bt_clause: BT_CLAUSE, never_calls: NEVER_CALLS, attested: ATTESTED },
    classes: CLASSES,
    byo_clause: BYO_CLAUSE,
    attest: { label: att.label, hypotheses: att.price.residual, channel: att.price.transport, verifier_rev: att.price.verifier_revision, observed_instant: att.price.observed_at.instant },
  };
}

/** The shared fields (the loader's fixed SHAPES list, and the /openapi.json sha256) on which a new served snapshot differs from the pending one, plus any key or schema a pending snapshot may not carry (pure). */
export function pendingDiff(served, pending) {
  const known = ["$comment", "schema", "written_at", ...SHAPES, "openapi_sha256"], unknown = Object.keys(pending).filter((k) => !known.includes(k));
  const drift = [...(pending.schema === "monark-site-harness-pending-v1" ? [] : ["schema"]), ...SHAPES.filter((k) => JSON.stringify(served[k]) !== JSON.stringify(pending[k])), ...unknown];
  return served.bodies_sha256?.["/openapi.json"] === pending.openapi_sha256 ? drift : [...drift, "openapi_sha256"];
}

/** The snapshot --pending writes: the shapes the IN-PROCESS harness answers to the deploy check's own requests. */
export async function inProcessPending(writtenAt) {
  const call = async (path, body) => (await handleJsonMirror(new Request(`${API_SERVER_URL}${path}`, body === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }))).text();
  const openapiText = await call("/openapi.json");
  const [health, gateCall, liqCall, calCall, attCall, casCall] = (await Promise.all([call("/health"), call("/gate", GATE_BODY), call("/gate", GATE_LIQ_BODY), call("/calibrate", CALIBRATE_BODY), call("/attest", {}), call("/cascade", CASCADE_BODY)])).map((t) => JSON.parse(t));
  const list = HARNESS_TOOLS.map((t) => ({ name: t.name, description: t.description }));
  return {
    $comment: "The shapes the NEXT harness serves, written in process by the source repository's sync tool (--pending) before it is deployed: no fact read on the server. While this file exists, the served snapshot carries pending_since and the recorded traces follow this file; the deployed harness's sync promotes it.",
    schema: "monark-site-harness-pending-v1",
    written_at: writtenAt,
    ...shapesFrom({ health, openapi: JSON.parse(openapiText), list, gateCall, liqCall, calCall, attCall, casCall }),
    openapi_sha256: sha256(openapiText),
  };
}

/** The served file's text with pending_since (a UTC day) after read_at, no other byte touched; kept when already set (pure). */
export function markPendingSince(text, day) {
  if (/^ {2}"pending_since": /m.test(text)) return text;
  const marked = text.replace(/^( {2}"read_at": "[^"]+",)(\r?\n)/m, `$1$2  "pending_since": "${day}",$2`);
  if (marked === text) throw new Error("the served file carries no read_at line");
  return marked;
}

/** --pending under `root`: the in-process snapshot, pending_since on the served file and both manifest entries, all
 *  computed before the first write (throws, writing nothing). Returns the pending file's manifest sha256. */
export async function writeHarnessPending(root, writtenAt) {
  const text = snapshotText(await inProcessPending(writtenAt), null);
  const marked = markPendingSince(readFileSync(join(root, OUT_REL), "utf8"), writtenAt.slice(0, 10));
  const manifest = setManifestEntry(setManifestEntry(readFileSync(join(root, MANIFEST_REL), "utf8"), PENDING_REL, lfSha(text)), OUT_REL, lfSha(marked));
  writeFileSync(join(root, PENDING_REL), text);
  writeFileSync(join(root, OUT_REL), marked);
  writeFileSync(join(root, MANIFEST_REL), manifest);
  return lfSha(text);
}

async function pendingMain() {
  let sha;
  try { sha = await writeHarnessPending(ROOT, new Date().toISOString()); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
  console.log(`sync-harness-served OK — ${PENDING_REL} written in process (a new written_at on every --pending), pending_since set in ${OUT_REL}; manifest entries set (${PENDING_REL} ${sha}). Then: node scripts/repin-served.mjs`);
}

/** One snapshot's text after the leak scan (throws on a leak), in the two-space, 120-column format. */
function snapshotText(out, exempt) {
  const strings = [];
  const walk = (v) => { if (typeof v === "string") strings.push(v); else if (v !== null && typeof v === "object") Object.values(v).forEach(walk); };
  walk({ ...out, $comment: "" });
  const leak = strings.filter((s) => INTERNAL.test(s) && s !== exempt);
  if (leak.length > 0) throw new Error(`an internal reference, data-source name or banned word would be written: ${JSON.stringify(leak)}`);
  // Two-space JSON; a value that fits a 120-column line stays on one line (fewer lines to review, same data).
  const fmt = (v, ind, lead = 0) => {
    const one = JSON.stringify(v, null, 1).replace(/\n\s*/g, " ");
    if (v === null || typeof v !== "object" || ind.length + lead + one.length <= 120) return one;
    const next = ind + "  ", arr = Array.isArray(v);
    const items = arr ? v.map((x) => next + fmt(x, next)) : Object.entries(v).map(([k, x]) => `${next}${JSON.stringify(k)}: ${fmt(x, next, k.length + 4)}`);
    return `${arr ? "[" : "{"}\n${items.join(",\n")}\n${ind}${arr ? "]" : "}"}`;
  };
  return fmt(out, "") + "\n";
}

// Run-guard: execute only when invoked directly, never on import.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) await (process.argv.includes("--pending") ? pendingMain() : main());
