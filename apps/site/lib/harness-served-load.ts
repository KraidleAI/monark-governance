// apps/site/lib/harness-served-load.ts — build-time loaders of the committed facts about the SERVED harness (server
// side; storefront surface "harness"). Three committed files, each read ONLY after its sha256 (CRLF->LF, UTF-8) equals
// the value apps/site/data/manifest.sha256.json carries for it (same tamper check as lib/bell-served-load.ts):
//   - apps/site/data/harness-served.json, written from the served bodies by the source repository's sync tool (not part
//     of this export);
//   - fixtures/byo-demo-trace.json, the bring-your-own loop recorded over the MCP transport of an in-process server;
//   - fixtures/h5-e2e-trace.json, the end-to-end decisions recorded over the MCP transport of an in-process server.
// FAIL-CLOSED: an unlisted file, a hash mismatch, an extra or missing key or a malformed value throws, so `next build`
// reds rather than render an unchecked record. Each loader returns a CLOSED projection: the pages never receive a
// trace's generator metadata, its notes, or a content text in full. Every recorded payload a page renders is checked
// key by key (required ⊆ keys ⊆ properties) before it is returned: a gate request's envelope, params and optional BYO
// calibration against the served /gate request (the snapshot above) and its prediction against
// schemas/prediction.schema.json; a gate result against schemas/gate-decision.schema.json and its verdict against
// schemas/coverage-verdict.schema.json; a calibrate request and result against the served /calibrate schemas (the
// snapshot). Every returned object is then scanned, at every depth, for the keys of schemas/forbidden-keys.json, and
// each trace must say it was bound to the loopback address (an in-process server, never the public endpoint).
// Frozen contract field names are never written as quoted literals here (guard frozen_contract_fields_stay_dynamic).
// Self-contained (node built-ins only, no alias import): shared by the pages and by the source repository's tests and
// sync tool (which imports stripRefs), neither of which is part of this export.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const HARNESS_SERVED_REL = "apps/site/data/harness-served.json";
export const BYO_TRACE_REL = "fixtures/byo-demo-trace.json";
export const H5_TRACE_REL = "fixtures/h5-e2e-trace.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
export function harnessRepoRoot(): string {
  return join(process.cwd(), "..", "..");
}

/** The one declared text rule of the sync: internal reference tokens in parentheses are removed. */
const REF = String.raw`(?:ADR-M\d+\s+)?[DK]-?\d+(?:\/D\d+)*`;
export function stripRefs(t: string): string {
  return t.replace(new RegExp(String.raw`\s*\((?:${REF})\)`, "g"), "").replace(new RegExp(String.raw`(?:,\s*|\s+—\s+)${REF}(?=\))`, "g"), "");
}

type Obj = Record<string, unknown>;
const fail = (why: string): never => {
  throw new Error(`harness served: ${why}`);
};
const HEX64 = /^[0-9a-f]{64}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3,6})?Z$/;
const TEXT = /^[^\n]{1,600}$/;
const KEY = /^[a-zA-Z_]+$/;
const HOSTNAME = /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;

function readListed(root: string, rel: string): string {
  const manifest = JSON.parse(readFileSync(join(root, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[rel];
  if (typeof expected !== "string") fail(`${rel} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(root, rel), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${rel} (manifest ${String(expected)}, actual ${actual})`);
  return raw;
}
function obj(v: unknown, keys: readonly string[], where: string): Obj {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(`${where} must be an object`);
  const o = v as Obj;
  const got = Object.keys(o).sort().join(",");
  if (got !== [...keys].sort().join(",")) fail(`${where} must carry exactly {${keys.join(", ")}}, got {${got}}`);
  return o;
}
function str(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) fail(`${where} is malformed`);
  return v as string;
}
function strs(v: unknown, re: RegExp, where: string, mayBeEmpty = false): string[] {
  if (!Array.isArray(v) || (v.length < 1 && !mayBeEmpty)) fail(`${where} must be a${mayBeEmpty ? "n" : " non-empty"} array`);
  return (v as unknown[]).map((x, i) => str(x, re, `${where}[${String(i)}]`));
}
function int(v: unknown, where: string): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1) fail(`${where} must be a positive integer`);
  return v as number;
}

/** The key sets of a closed object schema, as the snapshot carries them: required keys, then the other declared keys. */
export interface KeySets { required: string[]; optional: string[] }
function keySets(v: unknown, where: string): KeySets {
  const o = obj(v, ["required", "optional"], where);
  return { required: strs(o.required, KEY, `${where}.required`), optional: strs(o.optional, KEY, `${where}.optional`, true) };
}

export interface HarnessServed {
  read_at: string;
  version: string;
  api: { url: string; openapi_path: string; health_path: string; surface: string; openapi_version: string; title: string };
  mcp: { url: string; remote_type: string; server_name: string };
  tools: { name: string; note: string }[];
  gate_request: {
    required: string[];
    optional: string[];
    closed: boolean;
    params: { name: string; type: string; required: boolean; text: string }[];
    byo_calibration: KeySets & { param: string };
  };
  calibrate_contract: { request: KeySets; result: KeySets };
  response_required: string[];
  bounds: { calibrate_scores: number; gate_scores: number; gate_candidates: number; cascade_nodes: number };
  refusal: { invalid_status: string; invalid_text: string; origin_status: string; origin_text: string };
  honesty: { calibrate_label: string; bt_clause: string; never_calls: string; attested: string[] };
  classes: { class_id: string; state: string; clauses: string[] }[];
  byo_clause: string;
  attest: { label: string; hypotheses: string[]; channel: string; verifier_rev: string; observed_instant: number };
  registry: { name: string; version: string; status: string; published_at: string; repository_url: string };
  deploy_check: { checked_at: string; count: number; ok_count: number; tls_host: string; tls_valid_to: string };
  bodies_sha256: Record<string, string>;
}

export function loadHarnessServed(root: string): HarnessServed {
  const d = obj(JSON.parse(readListed(root, HARNESS_SERVED_REL)), ["$comment", "schema", "read_at", "version", "api", "mcp", "tools", "gate_request", "calibrate_contract", "response_required", "bounds", "refusal", "honesty", "classes", "byo_clause", "attest", "registry", "deploy_check", "bodies_sha256"], "file");
  if (d.schema !== "monark-site-harness-served-v1") fail("schema is not monark-site-harness-served-v1");
  const SEMVER = /^\d+\.\d+\.\d+$/, NAME = /^[a-z]+$/, HOST = /^https:\/\/[a-z0-9.-]+\.[a-z]+$/;
  const a = obj(d.api, ["url", "openapi_path", "health_path", "surface", "openapi_version", "title"], "api");
  const m = obj(d.mcp, ["url", "remote_type", "server_name"], "mcp");
  const g = obj(d.gate_request, ["required", "optional", "closed", "params", "byo_calibration"], "gate_request");
  const bc = obj(g.byo_calibration, ["param", "required", "optional"], "gate_request.byo_calibration");
  const cc = obj(d.calibrate_contract, ["request", "result"], "calibrate_contract");
  const b = obj(d.bounds, ["calibrate_scores", "gate_scores", "gate_candidates", "cascade_nodes"], "bounds");
  const r = obj(d.refusal, ["invalid_status", "invalid_text", "origin_status", "origin_text"], "refusal");
  const h = obj(d.honesty, ["calibrate_label", "bt_clause", "never_calls", "attested"], "honesty");
  const t = obj(d.attest, ["label", "hypotheses", "channel", "verifier_rev", "observed_instant"], "attest");
  const reg = obj(d.registry, ["name", "version", "status", "published_at", "repository_url"], "registry");
  const dc = obj(d.deploy_check, ["checked_at", "count", "ok_count", "tls_host", "tls_valid_to"], "deploy_check");
  if (!Array.isArray(d.tools) || !Array.isArray(g.params) || !Array.isArray(d.classes)) fail("tools, params and classes must be arrays");
  const out: HarnessServed = {
    read_at: str(d.read_at, ISO_UTC, "read_at"),
    version: str(d.version, SEMVER, "version"),
    api: { url: str(a.url, HOST, "api.url"), openapi_path: str(a.openapi_path, /^\/[a-z.]+$/, "api.openapi_path"), health_path: str(a.health_path, /^\/[a-z]+$/, "api.health_path"), surface: str(a.surface, /^[a-z-]+$/, "api.surface"), openapi_version: str(a.openapi_version, SEMVER, "api.openapi_version"), title: str(a.title, TEXT, "api.title") },
    mcp: { url: str(m.url, /^https:\/\/[a-z0-9.-]+\/mcp$/, "mcp.url"), remote_type: str(m.remote_type, /^[a-z-]+$/, "mcp.remote_type"), server_name: str(m.server_name, NAME, "mcp.server_name") },
    tools: (d.tools as unknown[]).map((x, i) => { const o = obj(x, ["name", "note"], `tools[${String(i)}]`); return { name: str(o.name, NAME, "tool name"), note: str(o.note, TEXT, "tool note") }; }),
    gate_request: {
      required: strs(g.required, KEY, "gate_request.required"), optional: strs(g.optional, KEY, "gate_request.optional", true), closed: g.closed === true,
      params: (g.params as unknown[]).map((x, i) => { const o = obj(x, ["name", "type", "required", "text"], `params[${String(i)}]`); return { name: str(o.name, KEY, "param name"), type: str(o.type, /^[a-z |]+$/, "param type"), required: o.required === true, text: str(o.text, TEXT, "param text") }; }),
      byo_calibration: { param: str(bc.param, KEY, "byo_calibration.param"), ...keySets({ required: bc.required, optional: bc.optional }, "byo_calibration") },
    },
    calibrate_contract: { request: keySets(cc.request, "calibrate_contract.request"), result: keySets(cc.result, "calibrate_contract.result") },
    response_required: strs(d.response_required, KEY, "response_required"),
    bounds: { calibrate_scores: int(b.calibrate_scores, "bounds"), gate_scores: int(b.gate_scores, "bounds"), gate_candidates: int(b.gate_candidates, "bounds"), cascade_nodes: int(b.cascade_nodes, "bounds") },
    refusal: { invalid_status: str(r.invalid_status, /^4\d\d$/, "refusal status"), invalid_text: str(r.invalid_text, TEXT, "refusal text"), origin_status: str(r.origin_status, /^4\d\d$/, "refusal status"), origin_text: str(r.origin_text, TEXT, "refusal text") },
    honesty: { calibrate_label: str(h.calibrate_label, TEXT, "calibrate_label"), bt_clause: str(h.bt_clause, TEXT, "bt_clause"), never_calls: str(h.never_calls, TEXT, "never_calls"), attested: strs(h.attested, TEXT, "attested") },
    classes: (d.classes as unknown[]).map((x, i) => { const o = obj(x, ["class_id", "state", "clauses"], `classes[${String(i)}]`); return { class_id: str(o.class_id, /^[a-z0-9-]+$/, "class_id"), state: str(o.state, /^(?:synthetic|none|committed)$/, "class state"), clauses: strs(o.clauses, TEXT, "class clauses") }; }),
    byo_clause: str(d.byo_clause, TEXT, "byo_clause"),
    attest: { label: str(t.label, TEXT, "attest label"), hypotheses: strs(t.hypotheses, /^A\([a-z-]+\)$/, "attest hypotheses"), channel: str(t.channel, /^[a-z0-9./-]+$/, "attest channel"), verifier_rev: str(t.verifier_rev, /^[0-9a-f]{40}$/, "verifier_rev"), observed_instant: int(t.observed_instant, "observed_instant") },
    registry: { name: str(reg.name, /^[a-z.]+\/[a-z]+$/, "registry name"), version: str(reg.version, SEMVER, "registry version"), status: str(reg.status, /^active$/, "registry status"), published_at: str(reg.published_at, ISO_UTC, "published_at"), repository_url: str(reg.repository_url, /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, "repository_url") },
    deploy_check: { checked_at: str(dc.checked_at, ISO_UTC, "checked_at"), count: int(dc.count, "count"), ok_count: int(dc.ok_count, "ok_count"), tls_host: str(dc.tls_host, HOSTNAME, "tls_host"), tls_valid_to: str(dc.tls_valid_to, TEXT, "tls_valid_to") },
    bodies_sha256: Object.fromEntries(Object.entries(d.bodies_sha256 !== null && typeof d.bodies_sha256 === "object" ? (d.bodies_sha256 as Obj) : fail("bodies_sha256 must be an object")).map(([k, v]) => [k, str(v, HEX64, `bodies_sha256 ${k}`)])),
  };
  const names = out.tools.map((x) => x.name);
  if (names.join(",") !== [...new Set(names)].sort().join(",")) fail("tool names must be unique and sorted");
  if (out.registry.version !== out.version) fail("the registry version must equal the served version");
  if (out.deploy_check.ok_count !== out.deploy_check.count) fail("the deploy check is not green on every control (fail-closed)");
  if (![new URL(out.api.url).host, new URL(out.mcp.url).host].includes(out.deploy_check.tls_host)) fail("the TLS host of the deploy check is neither the api host nor the MCP host");
  if (new Set(out.classes.map((c) => c.class_id)).size !== out.classes.length) fail("class ids must be unique");
  const byoParam = out.gate_request.params.find((p) => p.name === out.gate_request.byo_calibration.param);
  if (byoParam === undefined || byoParam.required || byoParam.type !== "object") fail("the BYO calibration is not an optional object param of the served /gate request");
  return out;
}

/** Keys of a schema: its required list and its declared properties (required ⊆ properties). */
interface Keys { required: string[]; properties: string[] }
/** Keys of a frozen schema, read from schemas/. */
function schemaKeys(root: string, file: string): Keys {
  const s = JSON.parse(readFileSync(join(root, "schemas", file), "utf8")) as { required?: string[]; properties?: Obj };
  return { required: s.required ?? [], properties: Object.keys(s.properties ?? {}) };
}
/** Keys of a served closed schema, as the snapshot carries them. */
function declared(k: KeySets): Keys {
  return { required: k.required, properties: [...k.required, ...k.optional] };
}
/** required ⊆ keys ⊆ properties, or throw (fail-closed). */
function shaped(v: unknown, keys: Keys, where: string): Obj {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(`${where} must be an object`);
  const got = Object.keys(v as Obj);
  const missing = keys.required.filter((k) => !got.includes(k)), extra = got.filter((k) => !keys.properties.includes(k));
  if (missing.length > 0 || extra.length > 0) fail(`${where} does not match its schema (missing {${missing.join(", ")}}, undeclared {${extra.join(", ")}})`);
  return v as Obj;
}
/** The fleet's forbidden keys (schemas/forbidden-keys.json), refused at ANY depth of an object a page renders. */
function forbiddenKeys(root: string): ReadonlySet<string> {
  const f = JSON.parse(readFileSync(join(root, "schemas", "forbidden-keys.json"), "utf8")) as { forbidden_keys?: unknown };
  return new Set(strs(f.forbidden_keys, KEY, "the forbidden-keys list"));
}
function noForbiddenKey(v: unknown, banned: ReadonlySet<string>, where: string): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => {
      noForbiddenKey(x, banned, `${where}[${String(i)}]`);
    });
  } else if (v !== null && typeof v === "object") {
    for (const [k, x] of Object.entries(v as Obj)) {
      if (banned.has(k)) fail(`${where} carries a forbidden key (${k}) — fail-closed`);
      noForbiddenKey(x, banned, `${where}.${k}`);
    }
  }
}
/** Where the trace says it was recorded: bound to the loopback address, i.e. an in-process server (never the endpoint). */
function loopback(t: Obj): string {
  const bind = (t.transport as { bind?: unknown } | undefined)?.bind;
  const m = typeof bind === "string" ? /^(127\.0\.0\.1),\s/.exec(bind) : null;
  return m?.[1] ?? fail("the trace does not say it was recorded on the loopback address (fail-closed)");
}

interface Step { label?: unknown; op?: unknown; tool?: unknown; request?: { params?: { arguments?: unknown } }; response?: { structuredContent?: unknown } }
function traceSteps(raw: string, schema: string): { t: Obj; steps: Step[] } {
  const t = JSON.parse(raw) as Obj;
  if (t.schema !== schema || !Array.isArray(t.steps)) fail(`trace is not a ${schema}`);
  return { t, steps: t.steps as Step[] };
}
function step(steps: Step[], label: string): { s: Step; args: Obj; sc: Obj } {
  const s = steps.find((x) => x.label === label);
  const args = s?.request?.params?.arguments, sc = s?.response?.structuredContent;
  if (args === null || typeof args !== "object" || sc === null || typeof sc !== "object") fail(`trace step ${label} lacks its arguments or structuredContent`);
  return { s: s as Step, args: args as Obj, sc: sc as Obj };
}
/** A recorded gate request, checked against the served /gate request (envelope, params, BYO calibration) and the
 *  frozen Prediction. */
function gateRequest(args: unknown, served: HarnessServed, prediction: Keys, where: string): Obj {
  const g = served.gate_request;
  const req = shaped(args, { required: g.required, properties: [...g.required, ...g.optional] }, `${where} request`);
  shaped(req.prediction, prediction, `${where} request prediction`);
  const params = shaped(req.params, { required: g.params.filter((p) => p.required).map((p) => p.name), properties: g.params.map((p) => p.name) }, `${where} request params`);
  const byo = params[g.byo_calibration.param];
  if (byo !== undefined) shaped(byo, declared(g.byo_calibration), `${where} request BYO calibration`);
  return req;
}

/** One recorded gate decision of a trace, projected to what the console renders (op, tool, action, reason, class). */
export interface RecordedDecision { step: string; op: string; tool: string; action: string; reason: string; task_class: string }
function recorded(s: Step, d: Obj): RecordedDecision {
  const v = d.verdict as { task_class?: unknown };
  return {
    step: str(s.label, /^[a-z-]+$/, "step label"), op: str(s.op, /^[a-z/]+$/, "step op"), tool: str(s.tool, /^[a-z]+$/, "step tool"),
    action: str(d.action, /^[a-z]+$/, "decision action word"), reason: str(d.reason, /^[a-z_]+$/, "decision reason code"),
    task_class: str(v.task_class, /^[ -~]{1,80}$/, "verdict class"),
  };
}

/** The recorded bring-your-own loop: the two requests as sent, the two structured results, the audit tie. */
export interface ByoLoop {
  accept: string;
  bind: string;
  calibrate: { request: Obj; result: Obj; label: string };
  gate: { request: Obj; result: Obj };
  decision: RecordedDecision;
  set_digest: string;
  calib_digest: string;
}
export function loadByoTrace(root: string): ByoLoop {
  const served = loadHarnessServed(root);
  const { t, steps } = traceSteps(readListed(root, BYO_TRACE_REL), "monark-byo-demo-trace/1");
  const cal = step(steps, "calibrate"), gate = step(steps, "gate-byo");
  shaped(cal.args, declared(served.calibrate_contract.request), "calibrate request");
  shaped(cal.sc, declared(served.calibrate_contract.result), "calibrate result");
  const request = gateRequest(gate.args, served, schemaKeys(root, "prediction.schema.json"), "BYO gate");
  if ((request.params as Obj)[served.gate_request.byo_calibration.param] === undefined) fail("the recorded BYO gate call carries no caller calibration (fail-closed)");
  const decision = shaped(gate.sc, schemaKeys(root, "gate-decision.schema.json"), "gate result");
  const verdict = shaped(decision.verdict, schemaKeys(root, "coverage-verdict.schema.json"), "gate verdict");
  const { label, ...calResult } = cal.sc;
  const transport = t.transport as { accept_required?: unknown } | undefined;
  const out: ByoLoop = {
    accept: str(transport?.accept_required, TEXT, "transport.accept_required"),
    bind: loopback(t),
    calibrate: { request: cal.args, result: calResult, label: str(label, TEXT, "calibrate label") },
    gate: { request: gate.args, result: decision },
    decision: recorded(gate.s, decision),
    set_digest: str(cal.sc.set_digest, HEX64, "set_digest"),
    calib_digest: str(verdict.calib_digest, HEX64, "verdict digest"),
  };
  if (out.set_digest !== out.calib_digest) fail("the recorded loop does not close (calib_digest != set_digest)");
  noForbiddenKey(out, forbiddenKeys(root), "the recorded BYO loop");
  return out;
}

/** The recorded end-to-end decisions, and the one recorded gate call /integrators shows (btc-dir-gate). */
export interface H5Trace { decisions: RecordedDecision[]; btcDir: { request: Obj; result: Obj }; bind: string }
export function loadH5Trace(root: string): H5Trace {
  const served = loadHarnessServed(root);
  const { t, steps } = traceSteps(readListed(root, H5_TRACE_REL), "monark-h5-e2e-trace/1");
  const gd = schemaKeys(root, "gate-decision.schema.json"), cv = schemaKeys(root, "coverage-verdict.schema.json"), pr = schemaKeys(root, "prediction.schema.json");
  const banned = forbiddenKeys(root);
  const decisions: RecordedDecision[] = [];
  for (const s of steps) {
    const sc = s.response?.structuredContent;
    if (s.tool !== "gate" || sc === undefined) continue;
    const where = `gate step ${String(s.label)}`;
    const request = gateRequest(s.request?.params?.arguments, served, pr, where);
    const d = shaped(sc, gd, `${where} result`);
    shaped(d.verdict, cv, `${where} verdict`);
    noForbiddenKey(request, banned, `${where} request`);
    noForbiddenKey(d, banned, `${where} result`);
    decisions.push(recorded(s, d));
  }
  if (decisions.length < 1) fail("the end-to-end trace carries no gate decision");
  const btc = step(steps, "btc-dir-gate");
  if (btc.s.tool !== "gate") fail("the recorded btc-dir-gate step is not a gate call");
  return { decisions, btcDir: { request: btc.args, result: btc.sc }, bind: loopback(t) };
}
