/**
 * Root test for the served-harness facts the storefront renders (surface "harness", decision 159). The data file
 * apps/site/data/harness-served.json is written by scripts/sync-harness-served.mjs from the SERVED bodies (each hashing
 * to the sha256 the committed deploy check recorded); this OFFLINE test pins it three ways: the manifest hash and a pin;
 * equality with the IN-PROCESS harness (the served openapi body is JSON.stringify(buildOpenApi()), same sha256); and
 * agreement with the committed deploy check docs/deploy-CA-harness.json. It also pins the closed shape (no market value,
 * no data-source name, no internal reference — in the data file AND in the loader projections of the two traces), the
 * fail-closed loaders (snapshot mutants, and trace mutants: an undeclared or a forbidden key in a recorded payload a page
 * renders, a recording that does not say it was bound to the loopback address), the projections of the two traces
 * recorded over the MCP transport of an in-process server, and that /integrators and /console render these values by
 * property access, never as typed literals (a DERIVED value list, with the named mutants C1/C2 of the 2026-09-24
 * review). The provider-name literals below live in a repo-root test/ file, which is never exported (same confinement
 * as test/bell-served.test.ts). Non-LLM oracle, run by `npm test`.
 * DECLARED COUPLING (source <-> served): the in-process check binds the snapshot to the harness SOURCE too, so a change to
 * a tool description, the registry or the version reds here until, in the same lot: redeploy, re-run
 * scripts/verify-harness.mjs (--out docs/deploy-CA-harness.json), re-run scripts/sync-harness-served.mjs (it sets the
 * manifest), then node scripts/repin-served.mjs (T0-TOOLING-1: it rewrites PINNED below from the committed files).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  loadHarnessServed, loadByoTrace, loadH5Trace, stripRefs, HARNESS_SERVED_REL, BYO_TRACE_REL, H5_TRACE_REL,
} from "../apps/site/lib/harness-served-load.ts";
import { BUDGET_NOTE } from "../apps/site/lib/sim.ts";
import { buildOpenApi, API_SERVER_URL } from "../apps/harness/src/openapi.ts";
import { HARNESS_VERSION } from "../apps/harness/src/version.ts";
import { ALLOWED_TOOL_NAMES, HARNESS_TOOLS } from "../apps/harness/src/tools/registry.ts";
import { CALIBRATE_LABEL } from "../apps/harness/src/tools/calibrate.ts";
import { GATE_TOOL_DESCRIPTION } from "../apps/harness/src/tools/gate.ts";
import { runAttest } from "../apps/harness/src/tools/attest.ts";
import { compilePatterns, scanText } from "../scripts/grep-forbidden.mjs";
import type { VocabRule } from "../scripts/grep-forbidden.mjs";
import ts from "typescript";
import { pinsOf, repinText, PIN_TEST_REL, PINNED_FILES } from "../scripts/repin-served.mjs";
import * as harnessSync from "../scripts/sync-harness-served.mjs";
import * as ukemiSync from "../scripts/sync-ukemi-served.mjs";
import { promotionBlocked, removeManifestEntry, setManifestEntry } from "../scripts/sync-ukemi-served.mjs";
import { TOOL_ERROR_400_SCHEMA, TOOL_ERROR_500_SCHEMA, TOOL_OUTPUT_SCHEMA } from "../apps/harness/src/schema-projection.ts";
import { renderedTexts } from "../apps/site/test/honesty-lint.ts";

const ROOT = join(import.meta.dirname, "..");
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const PAGES = ["apps/site/app/integrators/page.tsx", "apps/site/app/console/page.tsx"];
const sha = (s: string | Buffer): string => createHash("sha256").update(s).digest("hex");
const shaLf = (rel: string): string => sha(Buffer.from(readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n"), "utf8"));
const read = (rel: string): string => readFileSync(join(ROOT, rel), "utf8");

// Pins: the snapshot as read on the served harness on 2026-10-04T07:44:40Z (step 4 deploy) by scripts/sync-harness-served.mjs, with
// the pending_since line of lot CM-3c-3c (was 77d7b914...); the pending snapshot written in process by its --pending; and the two
// traces re-recorded in contract 1.1.0 (the SAME pins as test/byo-demo-probe.test.ts and test/h5-e2e-probe.test.ts).
// TYPED BY DESIGN (T0-TOOLING-1): the syncs write the manifest themselves, so a changed byte of these files must show as a test
// diff. Written by node scripts/repin-served.mjs only (the pending line goes with its file at the T0 promotion).
const PINNED: Record<string, string> = {
  "apps/site/data/harness-served.json": "f47ed82f98bdcdb0738cf466442d2b78e841c34b21b23d0038f626584ba75c47",
  "fixtures/byo-demo-trace.json": "5c9b03e62bd88703a1ecfe381cf8288cab62aee9d096b03b2302338d49883dfc",
  "fixtures/h5-e2e-trace.json": "57d38c1907bfea4d7cb746186f9bada86bd210358c0a7902a61392957567fc19",
};

interface Schema { required?: string[]; properties?: Record<string, Schema>; type?: string | string[]; description?: string; maxItems?: number; items?: Schema; additionalProperties?: unknown }
interface OpenApiDoc {
  openapi: string;
  info: { title: string; version: string; description: string };
  paths: Record<string, { post: { requestBody: { content: Record<string, { schema: Schema }> }; responses: Record<string, { description: string; content?: Record<string, { schema: Schema }> }> } }>;
}

/** Every string and number leaf of a value, in walk order. */
function leaves(v: unknown, strings: string[], numbers: number[]): void {
  if (typeof v === "string") strings.push(v);
  else if (typeof v === "number") numbers.push(v);
  else if (v !== null && typeof v === "object") Object.values(v as Record<string, unknown>).forEach((x) => { leaves(x, strings, numbers); });
}

// SERVED-PENDING-1 (decisions of MONARK, recherches 0058bfe): no pending snapshot is committed before the block that changes
// a served surface; the tests below stage one in a temporary root, derived from the committed served snapshot.
type Rec = Record<string, unknown>;
const PENDING_REL = "apps/site/data/harness-pending.json";
/** The committed served snapshot, without pending_since. */
const servedJson = (): Rec => Object.fromEntries(Object.entries(JSON.parse(read(HARNESS_SERVED_REL)) as Rec).filter(([k]) => k !== "pending_since"));
/** The pending snapshot the served one implies: its shared fields, written_at and the /openapi.json sha256 (no fact read on the server). */
function pendingOf(served: Rec): Rec {
  const shared = Object.entries(served).filter(([k]) => !["read_at", "mcp", "registry", "deploy_check", "bodies_sha256", "pending_since"].includes(k));
  return { ...Object.fromEntries(shared), schema: "monark-site-harness-pending-v1", written_at: "2026-10-04T12:00:00.000Z", openapi_sha256: (served.bodies_sha256 as Rec)["/openapi.json"] };
}
/** The shapes of the in-process harness: the committed pending snapshot while one exists, else the ones the served snapshot implies. */
const currentPending = (): Rec => (existsSync(join(ROOT, PENDING_REL)) ? (JSON.parse(read(PENDING_REL)) as Rec) : pendingOf(servedJson()));
/** A temporary root with the served snapshot (without pending_since unless given), the manifest, the two traces and
 *  schemas/; each listed file is written and re-hashed into the staged manifest, each unlisted one written only. */
function stage(given: Record<string, Rec>, unlisted: Record<string, Rec> = {}): string {
  const listed = { [HARNESS_SERVED_REL]: servedJson(), ...given };
  const tmp = mkdtempSync(join(tmpdir(), "harness-pending-"));
  for (const dir of ["apps/site/data", "fixtures", "schemas"]) mkdirSync(join(tmp, dir), { recursive: true });
  for (const f of readdirSync(join(ROOT, "schemas"))) copyFileSync(join(ROOT, "schemas", f), join(tmp, "schemas", f));
  for (const rel of [HARNESS_SERVED_REL, BYO_TRACE_REL, H5_TRACE_REL]) copyFileSync(join(ROOT, rel), join(tmp, rel));
  const manifest = JSON.parse(read(MANIFEST_REL)) as { files: Record<string, string> };
  for (const [rel, v] of Object.entries({ ...listed, ...unlisted })) {
    const text = JSON.stringify(v, null, 2) + "\n";
    writeFileSync(join(tmp, rel), text);
    if (rel in listed) manifest.files[rel] = sha(Buffer.from(text, "utf8"));
    else delete manifest.files[rel];
  }
  writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify(manifest));
  return tmp;
}
const unstage = (tmp: string): void => { rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); };

// killer: scripts/repin-served.mjs:16 CONST ", \"fixtures/h5-e2e-trace.json\"" -> ""
test("harness_served_data_is_listed_and_hash_pinned", () => {
  const manifest = JSON.parse(read(MANIFEST_REL)) as { files: Record<string, string> };
  for (const [rel, pin] of Object.entries(PINNED)) {
    assert.equal(manifest.files[rel], shaLf(rel), `manifest entry of ${rel} must equal its CRLF->LF sha256`);
    assert.equal(shaLf(rel), pin, `${rel} changed: re-run its writer (scripts/sync-harness-served.mjs or the recorder) AND node scripts/repin-served.mjs`);
  }
  assert.deepEqual(Object.keys(PINNED), Object.keys(pinsOf(ROOT)), "PINNED lists each pinned file present, the pending snapshot while it exists: run node scripts/repin-served.mjs");
});

// T0-TOOLING-1 (review B-2): the re-pin tool rewrites the PINNED lines and nothing else: on this file it is a no-op; a dropped
// pending snapshot drops its one line; a new sha moves its one line; a missing or doubled block is refused.
// killer: scripts/repin-served.mjs:28 CONST "lf.indexOf(OPEN, at + 1) >= 0 || " -> ""
test("repin_served_rewrites_exactly_the_pins", () => {
  const read0 = read(PIN_TEST_REL), pins = pinsOf(ROOT);
  assert.equal(repinText(read0, pins), read0, "the committed pins are what the tool computes");
  const full = Object.fromEntries(PINNED_FILES.map((rel) => [rel, pins[rel] ?? "0".repeat(64)]));
  const promoted = Object.fromEntries(Object.entries(full).filter(([rel]) => rel !== PENDING_REL));
  const text = repinText(read0, full), lines = text.split("\n"), without = repinText(text, promoted).split("\n");
  assert.deepEqual(lines.filter((l) => !l.startsWith(`  ${JSON.stringify(PENDING_REL)}: `)), without, "a promoted tree drops the pending line, no other byte");
  assert.equal(without.length, lines.length - 1, "non-vacuous: one line went");
  const moved = repinText(text, { ...full, [HARNESS_SERVED_REL]: "1".repeat(64) }).split("\n");
  assert.deepEqual(moved.flatMap((l, i) => (l === lines[i] ? [] : [l])), [`  ${JSON.stringify(HARNESS_SERVED_REL)}: "${"1".repeat(64)}",`], "a new sha changes its own line only");
  assert.throws(() => repinText(text.replace("const PINNED: Record", "const PINS: Record"), pins), /exactly one PINNED block/, "no block: refused");
  assert.throws(() => repinText(`${text}\nconst PINNED: Record<string, string> = {\n};\n`, pins), /exactly one PINNED block/, "two blocks: refused");
});

// killer: apps/site/lib/harness-served-load.ts:192 CONST "!existsSync(join(root, HARNESS_PENDING_REL))" -> "true"
test("harness_served_data_matches_in_process_harness", async () => {
  const { loadHarnessPending } = await import("../apps/site/lib/harness-served-load.ts");
  // The in-process harness equals the pending snapshot when one exists (time (i) to (ii) of a block), else the served one.
  const check = (root: string): void => {
    const pending = loadHarnessPending(root), s = pending ?? loadHarnessServed(root);
    const doc = buildOpenApi() as unknown as OpenApiDoc;
    assert.equal(pending?.openapi_sha256 ?? loadHarnessServed(root).bodies_sha256["/openapi.json"], sha(JSON.stringify(buildOpenApi())), "the served openapi body is the in-process document, byte for byte (the pending snapshot's, when one exists)");
    assert.equal(s.version, HARNESS_VERSION);
    assert.equal(s.version, doc.info.version);
    assert.equal(s.api.url, API_SERVER_URL);
    assert.equal(s.api.openapi_version, doc.openapi);
    assert.equal(s.api.title, doc.info.title);
    assert.deepEqual(s.tools.map((t) => t.name), [...ALLOWED_TOOL_NAMES].sort());
    for (const t of s.tools) {
      if (t.name === "attest") assert.equal(t.note, runAttest().label, "the attest note is the served label");
      else assert.ok((HARNESS_TOOLS.find((h) => h.name === t.name)?.description ?? "").includes(t.note), `${t.name}: note must be a served clause`);
    }
    const post = (p: string) => doc.paths[p]?.post;
    const body = (p: string): Schema => post(p)?.requestBody.content["application/json"]?.schema ?? {};
    const keySets = (sch: Schema) => ({ required: sch.required ?? [], optional: Object.keys(sch.properties ?? {}).filter((k) => !(sch.required ?? []).includes(k)) });
    const gate = body("/gate");
    const params = gate.properties?.params ?? {};
    assert.deepEqual(s.gate_request.required, gate.required);
    assert.deepEqual(s.gate_request.optional, Object.keys(gate.properties ?? {}).filter((k) => !(gate.required ?? []).includes(k)));
    assert.deepEqual(s.gate_request.params, Object.entries(params.properties ?? {}).map(([name, p]) => ({
      name, type: Array.isArray(p.type) ? p.type.join(" | ") : p.type, required: (params.required ?? []).includes(name), text: stripRefs(p.description ?? ""),
    })));
    const byo = Object.entries(params.properties ?? {}).filter(([name, p]) => !(params.required ?? []).includes(name) && p.type === "object");
    assert.equal(byo.length, 1, "exactly one optional object param (the BYO calibration)");
    assert.deepEqual(s.gate_request.byo_calibration, { param: byo[0]?.[0], ...keySets(byo[0]?.[1] ?? {}) });
    const calResult = post("/calibrate")?.responses["200"]?.content?.["application/json"]?.schema.properties?.structuredContent ?? {};
    assert.deepEqual(s.calibrate_contract, { request: keySets(body("/calibrate")), result: keySets(calResult) });
    assert.ok(body("/calibrate").additionalProperties === false && calResult.additionalProperties === false, "the /calibrate request and result are closed");
    assert.deepEqual(s.response_required, post("/gate")?.responses["200"]?.content?.["application/json"]?.schema.required);
    const cal = params.properties?.calibration?.properties ?? {};
    assert.deepEqual(s.bounds, {
      calibrate_scores: body("/calibrate").properties?.scores?.maxItems, gate_scores: cal.scores?.maxItems,
      gate_candidates: cal.candidates?.maxItems, cascade_nodes: body("/cascade").properties?.L?.maxItems,
    });
    const r = post("/gate")?.responses ?? {};
    assert.equal(s.refusal.invalid_text, stripRefs(r["400"]?.description ?? ""));
    assert.equal(s.refusal.origin_text, stripRefs(r["403"]?.description ?? ""));
    assert.equal(s.honesty.calibrate_label, CALIBRATE_LABEL);
    assert.ok(doc.info.description.includes(s.honesty.never_calls));
    for (const p of s.honesty.attested) assert.ok(GATE_TOOL_DESCRIPTION.includes(p), `attested clause not served: ${p}`);
    assert.ok(s.honesty.attested.some((p) => p.startsWith("BYO classes")), "the attested clauses carry the served BYO restriction");
    for (const p of [s.byo_clause, ...s.classes.flatMap((c) => c.clauses)]) assert.ok(GATE_TOOL_DESCRIPTION.includes(p), `class clause not served: ${p}`);
    assert.ok(s.classes.find((c) => c.state === "committed")?.clauses.some((p) => p.includes("calm-window")), "the committed stable-run row keeps its served scope qualifier");
    const price = runAttest().price;
    assert.deepEqual(s.attest, { label: runAttest().label, hypotheses: price.residual, channel: price.transport, verifier_rev: price.verifier_revision, observed_instant: price.observed_at.instant });
  };
  // Staged (killers of plan r3 §8.5, SERVED-PENDING-1): a pending snapshot equal to the harness passes while the served
  // one is older; a harness that differs from both snapshots reds, and so does one that differs from the pending one alone.
  const served = servedJson(), pending = currentPending();
  const off = (snap: Rec, text: string): Rec => ({ ...snap, refusal: { ...(snap.refusal as Rec), invalid_text: text } });
  const older = off({ ...served, pending_since: "2026-10-04" }, "an older served refusal");
  for (const [files, red, why] of [
    [{ [HARNESS_SERVED_REL]: older, [PENDING_REL]: pending }, false, "a pending snapshot equal to the harness passes, the served one being older"],
    [{ [HARNESS_SERVED_REL]: older, [PENDING_REL]: off(pending, "a refusal the harness does not serve") }, true, "a harness that differs from both snapshots reds"],
    [{ [HARNESS_SERVED_REL]: { ...served, pending_since: "2026-10-04" }, [PENDING_REL]: off(pending, "a refusal the harness does not serve") }, true, "a harness that differs from the pending snapshot reds, even equal to the served one"],
  ] as const) {
    const t = stage(files);
    try {
      if (red) assert.throws(() => { check(t); }, { code: "ERR_ASSERTION" }, why);
      else assert.doesNotThrow(() => { check(t); }, why);
    } finally {
      unstage(t);
    }
  }
  check(ROOT);
});

test("harness_served_data_matches_deploy_ca", () => {
  const s = loadHarnessServed(ROOT);
  const ca = JSON.parse(read("docs/deploy-CA-harness.json")) as { url: string; mcp_url: string; checked_at: string; checks: { name: string; ok: boolean; sha256: string }[]; tls: { host: string; valid_to: string } };
  assert.equal(s.api.url, ca.url);
  assert.equal(s.mcp.url, `${ca.mcp_url}/mcp`);
  assert.deepEqual(s.deploy_check, { checked_at: ca.checked_at, count: ca.checks.length, ok_count: ca.checks.filter((c) => c.ok).length, tls_host: ca.tls.host, tls_valid_to: ca.tls.valid_to });
  const caSha = Object.fromEntries(ca.checks.map((c) => [c.name, c.sha256]));
  const BODY_TO_CHECK: Record<string, string> = {
    "/health": "health", "/openapi.json": "openapi", "tools/list": "mcp_tools_list", "/gate": "gate_call",
    "/gate liquidation-eligible-coverage": "gate_liq_call", "/calibrate": "calibrate_call", "/attest": "attest_call", "/cascade": "cascade_call",
  };
  assert.deepEqual(Object.keys(s.bodies_sha256).sort(), Object.keys(BODY_TO_CHECK).sort());
  for (const [k, name] of Object.entries(BODY_TO_CHECK)) assert.equal(s.bodies_sha256[k], caSha[name], `${k}: body read by the sync = body checked by the deploy CA (${name})`);
});

test("harness_served_data_carries_no_provider_name_nor_market_value", () => {
  const data = JSON.parse(read(HARNESS_SERVED_REL)) as { bounds: Record<string, number>; deploy_check: { count: number; ok_count: number }; attest: { observed_instant: number } };
  const strings: string[] = [], numbers: number[] = [];
  leaves(data, strings, numbers);
  assert.deepEqual(numbers, [...Object.values(data.bounds), data.attest.observed_instant, data.deploy_check.count, data.deploy_check.ok_count], "the only numbers are the served bounds, the observation instant and the deploy-check counts");
  const FORBIDDEN = [/binance/i, /coinbase/i, /databento/i, /\bmassive\b/i, /polygon/i, /helius/i, /chainstack/i, /tenderly/i, /drpc/i, /blastapi/i, /nodies/i, /cloudfront/i, /btcusdt/i, /\bKraidle\b/, /\bADR-/, /\b[CKU]-\d/, /\bD\d+\b/, /\bP1\b/, /\bverified\b/i, /guarantee/i, /partner/i, /autonomous/i, /attestateur|octets|verite/i];
  // The same scan over what the pages receive from the two traces (the loader projections, rendered in part verbatim).
  const projected: string[] = [];
  leaves([loadByoTrace(ROOT), loadH5Trace(ROOT)], projected, []);
  assert.ok(projected.length >= 20, "non-vacuity: the trace projections carry strings");
  for (const [where, list] of [["harness-served.json", strings], ["a trace projection", projected]] as const) {
    for (const str of list) for (const re of FORBIDDEN) assert.ok(!re.test(str), `${where} carries ${String(re)}: ${str.slice(0, 80)}`);
  }
  const positives = ["projection of a witness (Binance BTCUSDT)", "Origin (K-9)", "https://rpc.blastapi.io", "https://lb.nodies.app"];
  for (const p of positives) assert.ok(FORBIDDEN.some((re) => re.test(p)), `positive control: the scan is load-bearing on ${p}`);
  const vocab = JSON.parse(read("vocab-banned.json")) as { scan: { site: { banned: VocabRule[]; exemptPhrases: string[] } } };
  const hits = [...strings, ...projected].flatMap((str) => scanText(str, compilePatterns(vocab.scan.site.banned), vocab.scan.site.exemptPhrases));
  assert.deepEqual(hits, [], "a rendered served or recorded string carries site-banned vocabulary");
});

test("harness_served_loader_is_fail_closed", () => {
  const tmp = mkdtempSync(join(tmpdir(), "harness-served-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const good = read(HARNESS_SERVED_REL);
    const manifest = JSON.parse(read(MANIFEST_REL)) as { files: Record<string, string> };
    const put = (text: string, listed: boolean): void => {
      writeFileSync(join(tmp, HARNESS_SERVED_REL), text);
      const files = { ...manifest.files };
      if (listed) files[HARNESS_SERVED_REL] = sha(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"));
      else delete files[HARNESS_SERVED_REL];
      writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify({ algorithm: "sha256", files }));
    };
    put(good, true);
    assert.equal(loadHarnessServed(tmp).version, HARNESS_VERSION, "control: an intact copy loads");
    writeFileSync(join(tmp, HARNESS_SERVED_REL), good.replace(/"ok_count": (\d+)/, (_m, n: string) => `"ok_count": ${String(Number(n) - 1)}`));
    assert.throws(() => loadHarnessServed(tmp), /sha256 mismatch/, "a tampered file with the old manifest hash throws");
    put(good, false);
    assert.throws(() => loadHarnessServed(tmp), /not listed/, "an unlisted file throws");
    type Snap = Record<string, unknown> & { deploy_check: Record<string, unknown>; registry: Record<string, unknown>; gate_request: Record<string, unknown> & { byo_calibration: Record<string, unknown> } };
    const d = JSON.parse(good) as Snap;
    put(JSON.stringify({ ...d, price: 1 }), true);
    assert.throws(() => loadHarnessServed(tmp), /exactly/, "an extra (market) field throws even when hashed");
    put(JSON.stringify({ ...d, deploy_check: { ...d.deploy_check, ok_count: 11 } }), true);
    assert.throws(() => loadHarnessServed(tmp), /not green/, "a deploy check that is not green throws even when hashed");
    put(JSON.stringify({ ...d, registry: { ...d.registry, version: "9.9.9" } }), true);
    assert.throws(() => loadHarnessServed(tmp), /registry version/, "a registry version that differs from the served one throws");
    put(JSON.stringify({ ...d, deploy_check: { ...d.deploy_check, tls_host: "example.org" } }), true);
    assert.throws(() => loadHarnessServed(tmp), /TLS host/, "a TLS block probed on another host throws");
    put(JSON.stringify({ ...d, gate_request: { ...d.gate_request, byo_calibration: { ...d.gate_request.byo_calibration, param: "tool" } } }), true);
    assert.throws(() => loadHarnessServed(tmp), /BYO calibration is not an optional object param/, "a BYO calibration that is not the optional object param throws");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// killer: apps/site/lib/harness-served-load.ts:335 SDL "noForbiddenKey(d, banned, `${where} result`);" -> ""
test("harness_trace_loaders_are_fail_closed", () => {
  // The traces are staged with the snapshot, the manifest and schemas/; each mutant is RE-HASHED into the staged
  // manifest, so only the loader's own checks (shape, forbidden keys, loopback) stand between it and a page.
  const tmp = mkdtempSync(join(tmpdir(), "harness-traces-"));
  try {
    for (const dir of ["apps/site/data", "fixtures", "schemas"]) mkdirSync(join(tmp, dir), { recursive: true });
    for (const f of readdirSync(join(ROOT, "schemas"))) copyFileSync(join(ROOT, "schemas", f), join(tmp, "schemas", f));
    const restore = (): void => {
      for (const rel of [HARNESS_SERVED_REL, MANIFEST_REL, BYO_TRACE_REL, H5_TRACE_REL, PENDING_REL]) if (existsSync(join(ROOT, rel))) copyFileSync(join(ROOT, rel), join(tmp, rel));
    };
    restore();
    const manifest = JSON.parse(read(MANIFEST_REL)) as { algorithm: string; files: Record<string, string> };
    type Rec = Record<string, unknown>;
    type TraceStep = { label?: string; request?: { params?: { arguments?: Rec } }; response?: { structuredContent?: Rec } };
    type Trace = { transport: Rec; steps: TraceStep[] };
    const fresh = (rel: string): Trace => JSON.parse(read(rel)) as Trace;
    const rehash = (rel: string, t: Trace): void => {
      const text = JSON.stringify(t, null, 2) + "\n";
      writeFileSync(join(tmp, rel), text);
      writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify({ ...manifest, files: { ...manifest.files, [rel]: sha(Buffer.from(text, "utf8")) } }));
    };
    const stepOf = (t: Trace, label: string): TraceStep => {
      const s = t.steps.find((x) => x.label === label);
      assert.ok(s !== undefined, `the trace carries a ${label} step`);
      return s;
    };
    assert.deepEqual(loadByoTrace(tmp), loadByoTrace(ROOT), "control: the staged BYO trace loads");
    assert.deepEqual(loadH5Trace(tmp), loadH5Trace(ROOT), "control: the staged end-to-end trace loads");
    rehash(H5_TRACE_REL, fresh(H5_TRACE_REL));
    assert.deepEqual(loadH5Trace(tmp), loadH5Trace(ROOT), "control: a re-serialized, re-hashed trace still loads (the mutants below differ only by their mutation)");

    // T1 — the review's mutant: an undeclared key and a forbidden key in the rendered committed-gate request (the committed
    // USDe key since CM-2b; btc-dir-15m is retired).
    restore();
    let t = fresh(H5_TRACE_REL);
    Object.assign(stepOf(t, "committed-gate").request?.params?.arguments?.prediction as Rec, { confidence: 0.99, not_in_schema: true });
    rehash(H5_TRACE_REL, t);
    assert.throws(() => loadH5Trace(tmp), /committed-gate request prediction does not match its schema/, "T1: a request key outside the frozen Prediction throws");
    // T2 — a forbidden key where no shape check reaches: nested in the rendered committed result (verdict.region).
    restore();
    t = fresh(H5_TRACE_REL);
    ((stepOf(t, "committed-gate").response?.structuredContent?.verdict as Rec).region as Rec).confidence = 0.99;
    rehash(H5_TRACE_REL, t);
    assert.throws(() => loadH5Trace(tmp), /forbidden key \(confidence\)/, "T2: a forbidden key at any depth of a rendered result throws");
    // T3 — an undeclared param in the rendered BYO gate request.
    restore();
    let b = fresh(BYO_TRACE_REL);
    (stepOf(b, "gate-byo").request?.params?.arguments?.params as Rec).extra = 1;
    rehash(BYO_TRACE_REL, b);
    assert.throws(() => loadByoTrace(tmp), /BYO gate request params does not match its schema/, "T3: a param the served /gate does not declare throws");
    // T4 — an undeclared key in the rendered calibrate result.
    restore();
    b = fresh(BYO_TRACE_REL);
    (stepOf(b, "calibrate").response?.structuredContent as Rec).extra = 1;
    rehash(BYO_TRACE_REL, b);
    assert.throws(() => loadByoTrace(tmp), /calibrate result does not match its schema/, "T4: a key the served /calibrate result does not declare throws");
    // T5 — a forbidden key nested in the rendered BYO calibration request (inside a declared key's array item).
    restore();
    b = fresh(BYO_TRACE_REL);
    (stepOf(b, "calibrate").request?.params?.arguments as Rec).scores = [{ trust: 1 }];
    rehash(BYO_TRACE_REL, b);
    assert.throws(() => loadByoTrace(tmp), /forbidden key \(trust\)/, "T5: a forbidden key inside a rendered request throws");
    // T6 — a recording that does not say it was bound to the loopback address.
    restore();
    b = fresh(BYO_TRACE_REL);
    b.transport.bind = "203.0.113.7, a public address";
    rehash(BYO_TRACE_REL, b);
    assert.throws(() => loadByoTrace(tmp), /loopback/, "T6: a trace not recorded on the loopback address throws");
    // T7 — the same checks while a pending snapshot exists (SERVED-PENDING-1): a forbidden key in a rendered result throws.
    restore();
    const pending = currentPending(), since = { ...servedJson(), pending_since: "2026-10-04" };
    for (const [rel, v] of [[PENDING_REL, pending], [HARNESS_SERVED_REL, since]] as const) writeFileSync(join(tmp, rel), JSON.stringify(v));
    Object.assign(manifest.files, Object.fromEntries([PENDING_REL, HARNESS_SERVED_REL].map((rel) => [rel, sha(readFileSync(join(tmp, rel)))])));
    t = fresh(H5_TRACE_REL);
    ((stepOf(t, "committed-gate").response?.structuredContent?.verdict as Rec).region as Rec).confidence = 0.99;
    rehash(H5_TRACE_REL, t);
    assert.throws(() => loadH5Trace(tmp), /forbidden key \(confidence\)/, "T7: a forbidden key still throws while a pending snapshot exists");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// CM-2b surfaces: the recorded gate decisions are the cascade abstention and the committed USDe key; step 7 (the
// retired class carrying the attested witness) is a tool error, not a decision, so no page renders it as one.
// killer: apps/site/lib/harness-served-load.ts:329 CONST "|| sc === undefined" -> "|| false"
test("byo_trace_rendered_equals_trace", () => {
  type TraceStep = { label?: string; op?: string; tool?: string; request?: { params?: { arguments?: unknown } }; response?: { structuredContent?: Record<string, unknown> } };
  const steps = (rel: string): TraceStep[] => (JSON.parse(read(rel)) as { steps: TraceStep[] }).steps;
  const byo = loadByoTrace(ROOT), s = loadHarnessServed(ROOT);
  const cal = steps(BYO_TRACE_REL).find((x) => x.label === "calibrate"), gate = steps(BYO_TRACE_REL).find((x) => x.label === "gate-byo");
  assert.deepEqual(byo.calibrate.request, cal?.request?.params?.arguments);
  const { label, ...calRest } = cal?.response?.structuredContent ?? {};
  assert.deepEqual(byo.calibrate.result, calRest);
  assert.equal(byo.calibrate.label, label);
  assert.equal(label, s.honesty.calibrate_label, "the recorded calibrate label is the served one");
  assert.deepEqual(byo.gate.request, gate?.request?.params?.arguments);
  assert.deepEqual(byo.gate.result, gate?.response?.structuredContent);
  assert.equal(byo.scores_sha256.calibrate, byo.scores_sha256.verdict, "the recorded loop closes");
  assert.deepEqual(Object.keys(byo).sort(), ["accept", "bind", "calibrate", "decision", "gate", "scores_sha256"], "closed projection");
  const h5 = loadH5Trace(ROOT);
  assert.equal(byo.bind, "127.0.0.1", "the BYO loop was recorded on the loopback address (an in-process server)");
  assert.equal(h5.bind, "127.0.0.1", "the end-to-end trace was recorded on the loopback address (an in-process server)");
  assert.ok(!/worker_model|generated_by|claude-|previously/.test(JSON.stringify([byo, h5])), "no generator metadata nor step note reaches a page");
  assert.deepEqual(h5.decisions.map((x) => x.step), ["cascade-gate", "committed-gate"], "the recorded gate decisions (step 7 is the retired-class refusal)");
  const expected = steps(H5_TRACE_REL).filter((x) => x.tool === "gate" && x.response?.structuredContent !== undefined).map((x) => {
    const sc = x.response?.structuredContent;
    return `${x.label ?? ""}:${String(sc?.action)}:${String(sc?.reason)}:${String((sc?.verdict as { task_class?: unknown } | undefined)?.task_class)}`;
  });
  assert.deepEqual(h5.decisions.map((x) => `${x.step}:${x.action}:${x.reason}:${x.task_class}`), expected);
  for (const d of h5.decisions) assert.ok(s.classes.some((c) => c.class_id === d.task_class), `${d.step}: its class is served, so /console renders its served clause`);
  assert.ok(!s.classes.some((c) => c.class_id === byo.decision.task_class), "the BYO decision's class is the caller's own, so /console renders the served BYO clause");
  const page = read(PAGES[0] ?? "");
  for (const call of ["loadByoTrace(root)", "loadH5Trace(root)", "JSON.stringify(byo.calibrate.request, null, 2)", "JSON.stringify(byo.gate.request, null, 2)", "JSON.stringify(byo.gate.result, null, 2)", "JSON.stringify(btcDir.request, null, 2)", "JSON.stringify(btcDir.result, null, 2)"]) {
    assert.ok(page.includes(call), `/integrators must render the recorded trace through ${call}`);
  }
});

// Contract 1.1.0 (lot CM-3c-3c, G0 of the block section 3.4): the BYO loop closes on the scores_sha256, the alpha and the
// q-hat of the calibrate result and of the gate verdict; each one changed alone in a staged trace (re-hashed) throws.
// killer: apps/site/lib/harness-served-load.ts:312 CONST " && cal.sc.qhat === verdict.qhat" -> ""
test("byo_loop_closes_on_scores_sha256_alpha_and_qhat", () => {
  type Step = { label?: string; response?: { structuredContent?: Rec } };
  const pending = { [HARNESS_SERVED_REL]: { ...servedJson(), pending_since: "2026-10-04" }, [PENDING_REL]: currentPending() };
  const mutated = (f: (calibrate: Rec) => void): Rec => {
    const t = JSON.parse(read(BYO_TRACE_REL)) as Rec & { steps: Step[] };
    f(t.steps.find((x) => x.label === "calibrate")?.response?.structuredContent ?? {});
    return t;
  };
  const cases: Array<[string, (c: Rec) => void]> = [
    ["scores_sha256", (c) => { c.scores_sha256 = "0".repeat(64); }],
    ["alpha", (c) => { c.alpha = 0.2; }],
    ["qhat", (c) => { c.qhat = 2; }],
  ];
  const control = stage({ ...pending, [BYO_TRACE_REL]: mutated(() => undefined) });
  try {
    assert.deepEqual(loadByoTrace(control).scores_sha256, loadByoTrace(ROOT).scores_sha256, "control: the staged, re-hashed loop closes");
  } finally {
    unstage(control);
  }
  for (const [what, f] of cases) {
    const t = stage({ ...pending, [BYO_TRACE_REL]: mutated(f) });
    try {
      assert.throws(() => loadByoTrace(t), /the recorded loop does not close/, `a calibrate ${what} that differs from the verdict's throws`);
    } finally {
      unstage(t);
    }
  }
});

// killer: apps/site/lib/harness-served-load.ts:196 SDL "if (pendingSince === undefined) fail(\"a pending snapshot exists but the served snapshot carries no pending_since (fail-closed)\");" -> ""
test("harness_pending_snapshot_is_fail_closed", async () => {
  const { loadHarnessPending } = await import("../apps/site/lib/harness-served-load.ts");
  const served = servedJson(), pending = currentPending(), marked = { ...served, pending_since: "2026-10-04" };
  const cases: [Record<string, Rec>, Record<string, Rec>, RegExp, string][] = [
    [{ [PENDING_REL]: pending }, {}, /carries no pending_since/, "killer: a pending snapshot without pending_since on the served one reds"],
    [{ [HARNESS_SERVED_REL]: marked }, {}, /no pending snapshot exists/, "pending_since without a pending snapshot reds"],
    [{ [HARNESS_SERVED_REL]: { ...served, pending_since: "9999-12-31" }, [PENDING_REL]: pending }, {}, /later than the day/, "a pending_since later than the pending snapshot reds"],
    [{ [HARNESS_SERVED_REL]: marked }, { [PENDING_REL]: pending }, /not listed/, "an unlisted pending snapshot reds"],
    [{ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: { ...pending, schema: "monark-site-harness-served-v1" } }, {}, /schema is not monark-site-harness-pending-v1/, "a pending snapshot under the served schema reds"],
    // Q-SP1-3 (b): the pending snapshot carries no fact read on the server.
    ...["read_at", "registry", "deploy_check", "bodies_sha256"].map((k): [Record<string, Rec>, Record<string, Rec>, RegExp, string] =>
      [{ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: { ...pending, [k]: served[k] } }, {}, /pending file must carry exactly/, `the pending snapshot refuses ${k}`]),
  ];
  for (const [listed, unlisted, re, why] of cases) {
    const t = stage(listed, unlisted);
    try {
      assert.throws(() => loadByoTrace(t), re, `${why} (BYO loop)`);
      assert.throws(() => loadH5Trace(t), re, `${why} (end-to-end trace)`);
    } finally {
      unstage(t);
    }
  }
  const t = stage({ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: pending });
  try {
    assert.deepEqual(loadHarnessServed(t), loadHarnessServed(ROOT), "pending_since is admitted and never rendered: the pages read the same served projection");
    assert.equal(loadHarnessPending(t)?.openapi_sha256, pending.openapi_sha256, "control: the staged pending snapshot loads");
    assert.deepEqual([loadByoTrace(t), loadH5Trace(t)], [loadByoTrace(ROOT), loadH5Trace(ROOT)], "control: the traces follow a pending snapshot equal to the served shapes");
  } finally {
    unstage(t);
  }
});

/** Two staged next harnesses that differ from the served one: the /calibrate result requires one more key (pending), the
 *  /gate params require one more param (nextGate); marked = the served snapshot carrying pending_since. */
function nextShapes(): { served: Rec; marked: Rec; pending: Rec; nextGate: Rec } {
  const served = servedJson(), base = currentPending();
  const cal = base.calibrate_contract as { request: Rec; result: { required: string[]; optional: string[] } }; // the in-process contract
  const g = served.gate_request as { params: Rec[] };
  return {
    served, marked: { ...served, pending_since: "2026-10-04" },
    pending: { ...base, calibrate_contract: { ...cal, result: { ...cal.result, required: [...cal.result.required, "n_scores"] } } },
    nextGate: { ...base, gate_request: { ...g, params: [...g.params, { name: "lane", type: "string", required: true, text: "a param the next harness requires" }] } },
  };
}

// killer: apps/site/lib/harness-served-load.ts:293 CONST "loadHarnessPending(root) ?? loadHarnessServed(root)" -> "loadHarnessServed(root)"
test("trace_loaders_follow_the_pending_snapshot_only", () => {
  // Q-SP1-2: while a pending snapshot exists, a recorded payload follows IT alone (a trace still on the served shapes is a
  // trace not re-recorded). The pending /calibrate result requires one more key; the re-recorded loop carries it.
  const { marked, pending, nextGate } = nextShapes();
  const rerecorded = JSON.parse(read(BYO_TRACE_REL)) as { steps: { label?: string; response?: { structuredContent?: Rec } }[] };
  const sc = rerecorded.steps.find((x) => x.label === "calibrate")?.response?.structuredContent;
  assert.ok(sc !== undefined, "the BYO loop carries a calibrate result");
  sc.n_scores = 10;
  const cases: [Record<string, Rec>, (root: string) => unknown, RegExp | null, string][] = [
    [{ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: pending }, loadByoTrace, /calibrate (?:request|result) does not match its schema/, "killer: a BYO loop whose calibrate follows the served snapshot and not the pending one reds"],
    [{ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: pending, [BYO_TRACE_REL]: rerecorded }, loadByoTrace, null, "a BYO loop re-recorded on the pending shapes loads"],
    [{ [BYO_TRACE_REL]: rerecorded }, loadByoTrace, /calibrate (?:request|result) does not match its schema/, "the re-recorded loop reds without the pending snapshot (it follows neither the served one nor a pending one)"],
    [{ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: nextGate }, loadH5Trace, /request params does not match its schema/, "an end-to-end gate request that follows the served /gate and not the pending one reds"],
  ];
  for (const [listed, loader, re, why] of cases) {
    const t = stage(listed);
    try {
      if (re === null) assert.deepEqual(loadByoTrace(t).calibrate.result.n_scores, 10, why);
      else assert.throws(() => loader(t), re, why);
    } finally {
      unstage(t);
    }
  }
});

// killer: apps/site/lib/harness-served-load.ts:183 CONST "servedFile(root).out" -> "{ ...servedFile(root).out, ...loadHarnessPending(root) }"
test("harness_pages_keep_the_served_snapshot_while_pending", () => {
  // Q-SP1-2 (MONARK took the opposite of the letter of plan r3 §8.5; G2 B1): the pages read the served snapshot alone. A
  // pending snapshot whose /gate request AND /calibrate contract differ from the served ones changes the traces, never them.
  const { marked, pending, nextGate } = nextShapes(), next: Rec = { ...pending, gate_request: nextGate.gate_request }, pages = loadHarnessServed(ROOT);
  assert.notDeepEqual([next.gate_request, next.calibrate_contract], [pages.gate_request, pages.calibrate_contract], "staging: the pending /gate request and /calibrate contract differ from the served ones");
  const t = stage({ [HARNESS_SERVED_REL]: marked, [PENDING_REL]: next });
  try {
    let got: ReturnType<typeof loadHarnessServed> | undefined;
    assert.doesNotThrow(() => { got = loadHarnessServed(t); }, "pending_since is admitted on the served snapshot");
    assert.deepEqual([got?.gate_request, got?.calibrate_contract], [pages.gate_request, pages.calibrate_contract], "killer: the pages keep the served /gate request and /calibrate contract while a pending snapshot exists");
    assert.deepEqual(got, pages, "the pages read the same served projection");
    assert.throws(() => loadH5Trace(t), /request params does not match its schema/, "control: the traces follow the staged pending snapshot");
  } finally {
    unstage(t);
  }
});

// killer: scripts/sync-harness-served.mjs:265 ROR "=== pending.openapi_sha256" -> "!== pending.openapi_sha256"
test("harness_pending_sync_writes_in_process_shapes", async () => {
  // Typed by scripts/sync-harness-served.d.mts (Q-SP1-7, three declarations in C2).
  const sync = await import("../scripts/sync-harness-served.mjs");
  assert.equal(typeof sync.inProcessPending, "function", "the sync has a --pending mode (SERVED-PENDING-1)");
  const served = servedJson(), pending = await sync.inProcessPending("2026-10-04T12:00:00.000Z"), now = currentPending();
  assert.deepEqual({ ...pending, $comment: now.$comment, written_at: now.written_at }, now, "--pending writes the in-process shapes (the committed pending snapshot, else the served shapes)");
  // Promotion at time (ii): the default sync writes only a served snapshot equal to the pending one, naming each drift.
  const next = { ...served, ...pending, bodies_sha256: { ...(served.bodies_sha256 as Rec), "/openapi.json": pending.openapi_sha256 } };
  assert.deepEqual(sync.pendingDiff(next, pending), [], "a served snapshot equal to the pending one is promoted");
  assert.deepEqual(sync.pendingDiff(next, { ...pending, byo_clause: "another clause", openapi_sha256: "0".repeat(64) }), ["byo_clause", "openapi_sha256"], "a served snapshot that differs from the pending one is refused");
  const text = read(HARNESS_SERVED_REL).replace(/^ {2}"pending_since": "[^"]+",\r?\n/m, ""), marked = sync.markPendingSince(text, "2026-10-04");
  assert.equal(marked.replace('  "pending_since": "2026-10-04",\n', ""), text, "pending_since is inserted, no other byte of the served file touched");
  assert.equal(sync.markPendingSince(marked, "2026-12-01"), marked, "a second --pending keeps the first pending_since");
  const t = stage({ [HARNESS_SERVED_REL]: JSON.parse(marked) as Rec, [PENDING_REL]: pending });
  try {
    assert.deepEqual(loadByoTrace(t), loadByoTrace(ROOT), "the loader reads what --pending writes");
  } finally {
    unstage(t);
  }
});

// killer: scripts/sync-harness-served.mjs:264 CONST "SHAPES.filter" -> "Object.keys(pending).filter"
test("harness_pending_promotion_compares_the_fixed_fields", async () => {
  // G2 m1: promotion compares the loader's fixed shared-field list (SHAPES), never the pending file's own keys, so a
  // hand-edited pending snapshot missing a field, carrying a foreign key or under another schema cannot promote.
  const sync = await import("../scripts/sync-harness-served.mjs");
  assert.equal(typeof sync.pendingDiff, "function", "the sync compares a promotion with the pending snapshot (SERVED-PENDING-1)");
  const diff = sync.pendingDiff;
  const served = servedJson(), pending = pendingOf(served), next = { ...served, gate_request: nextShapes().nextGate.gate_request };
  const truncated = Object.fromEntries(Object.entries(pending).filter(([k]) => k !== "gate_request" && k !== "calibrate_contract"));
  assert.deepEqual(diff(served, pending), [], "control: a served snapshot equal to the pending one is promoted");
  assert.deepEqual(diff(next, truncated), ["gate_request", "calibrate_contract"], "killer: a pending snapshot missing gate_request and calibrate_contract cannot promote a served snapshot whose /gate request changed");
  assert.deepEqual(diff(served, { ...pending, read_at: served.read_at }), ["read_at"], "a pending snapshot carrying a key it may not carry cannot promote");
  assert.deepEqual(diff(served, { ...pending, schema: "monark-site-harness-served-v1" }), ["schema"], "a pending snapshot under another schema cannot promote");
});

/**
 * Every value /integrators and /console could render from the three loaders, as the text a hand would type: the string
 * leaves that are not bare identifiers, the numbers of four or more characters, and the forms the pages derive (date
 * prefix, digest and revision prefixes, the check count, the observation instant). DECLARED BOUNDARY, measured
 * 2026-09-24: bare-identifier values (one word of letters and underscores — contract, envelope and tool names, enum
 * words, class states, the registry status) are outside this substring guard, because the pages name those words in
 * prose and in code (24 of them occur as words in the /integrators source, 6 in /console); the next test holds them as
 * RENDERED words against a closed list. Numbers under four characters are outside both (they collide with class names
 * such as text-[13px]); they reach a page only through a read object. T0-TOOLING-1: the pending snapshot's values count too
 * (what the pages render once it is promoted, so T0 needs no edit here), and a snake_case field name whose last segment
 * is letters then digits (scores_sha256, a 1.1.0 contract key the /calibrate contract lists) is a bare identifier.
 */
const BARE = /^[A-Za-z_]+(?:_[a-z]+\d+)?$/;
/** The served snapshot, the two traces and, while one exists, the pending snapshot. */
const loaded = (): unknown[] => [loadHarnessServed(ROOT), loadByoTrace(ROOT), loadH5Trace(ROOT), ...(existsSync(join(ROOT, PENDING_REL)) ? [JSON.parse(read(PENDING_REL)) as unknown] : [])];
function renderableValues(): string[] {
  const s = loadHarnessServed(ROOT), byo = loadByoTrace(ROOT);
  const strings: string[] = [], numbers: number[] = [];
  leaves(loaded(), strings, numbers);
  const derived = [
    s.registry.published_at.slice(0, 10), s.read_at.slice(0, 10), s.deploy_check.checked_at.slice(0, 10), s.attest.verifier_rev.slice(0, 12),
    byo.scores_sha256.calibrate.slice(0, 12), byo.scores_sha256.verdict.slice(0, 12), `${String(s.deploy_check.ok_count)}/${String(s.deploy_check.count)}`,
    new Date(s.attest.observed_instant * 1000).toISOString(),
  ];
  const values = [...strings.filter((x) => !BARE.test(x)), ...numbers.map(String).filter((x) => x.length >= 4), ...derived];
  return [...new Set(values)];
}
const typedIn = (text: string, values: readonly string[]): string[] => values.filter((v) => text.includes(v));

test("harness_pages_render_served_values_never_typed", () => {
  const s = loadHarnessServed(ROOT);
  const values = renderableValues();
  assert.ok(values.length >= 60, `non-vacuity: the derived value list has ${String(values.length)} entries`);
  for (const must of [s.api.surface, s.api.title, s.refusal.invalid_text, s.deploy_check.tls_valid_to, s.deploy_check.tls_host, s.registry.published_at.slice(0, 10), s.attest.verifier_rev.slice(0, 12), `${String(s.deploy_check.ok_count)}/${String(s.deploy_check.count)}`, ...s.attest.hypotheses]) {
    assert.ok(values.includes(must), `the derived list carries ${must}`);
  }
  for (const rel of PAGES) {
    const text = read(rel);
    assert.match(text, /loadHarnessServed\(root\)/, `${rel} must read the served facts through loadHarnessServed`);
    assert.deepEqual(typedIn(text, values), [], `${rel} types a served or recorded value by hand`);
    assert.ok(!text.includes("clawhub install"), `${rel} carries the unattested install command`);
  }
  // Named mutants of the 2026-09-24 review, replayed on the page text (the guard must catch each typed value).
  const page = read(PAGES[0] ?? "");
  const c1Typed = [s.refusal.invalid_text, s.api.surface, ...s.attest.hypotheses, s.api.title];
  const c1 = page.replace("</main>", `${c1Typed.map((v) => `<p>${v}</p>`).join("")}</main>`);
  assert.ok(c1 !== page, "C1 applies");
  for (const v of c1Typed) assert.ok(typedIn(c1, values).includes(v), `C1 (served text typed into the JSX): ${v} is caught`);
  const c2Typed = [s.registry.published_at.slice(0, 10), s.deploy_check.tls_valid_to, s.attest.verifier_rev.slice(0, 12), `${String(s.deploy_check.ok_count)}/${String(s.deploy_check.count)}`];
  const c2 = page.replace("const STATE_LABEL", `const TYPED = { a: "${c2Typed.join('", b: "')}" };\nconst STATE_LABEL`);
  assert.ok(c2 !== page, "C2 applies");
  for (const v of c2Typed) assert.ok(typedIn(c2, values).includes(v), `C2 (digit-bearing value typed in an object literal): ${v} is caught`);
  const integrators = page;
  assert.match(integrators, /<StatusBadge status=\{gate\.status\} \/>/, "the /integrators status pill is the register's word");
  assert.ok(!/>\s*Built\s*</.test(integrators), "no literal Built pill on /integrators");
  const skill = read("skills/monark/INTEGRATION.md");
  const { server_name: alias, url, remote_type: kind } = s.mcp;
  assert.ok(skill.includes(`hermes mcp add ${alias} --url ${url}\n`) && skill.includes(`openclaw mcp add ${alias} --url ${url} --transport ${kind}\n`), "the composed MCP commands equal the published skill's");
  assert.ok(integrators.includes("hermes mcp add ${mcp.server_name} --url ${mcp.url}\\nopenclaw mcp add ${mcp.server_name} --url ${mcp.url} --transport ${mcp.remote_type}"), "the page composes the commands from the snapshot");
  const clause = "public and unauthenticated, with no availability commitment";
  assert.ok(skill.replace(/\s+/g, " ").includes(clause) && integrators.replace(/\s+/g, " ").includes(clause), "the availability clause is the published skill's");
});

/** The bare-identifier values of the three loaders (one word of letters and underscores). */
function identifierValues(): string[] {
  const strings: string[] = [];
  leaves(loaded(), strings, []);
  return [...new Set(strings.filter((x) => BARE.test(x)))];
}
/** The rendered text of a page (JSX text, JSX child literals, visible attributes — the honesty lint's own reading). */
const renderedOf = (rel: string, text: string): string =>
  renderedTexts(ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)).map((t) => t.text).join("\n");
const WORD_CHAR = /[A-Za-z0-9_]/;
const asWord = (text: string, w: string): boolean => {
  for (let i = text.indexOf(w); i !== -1; i = text.indexOf(w, i + 1)) {
    if (!WORD_CHAR.test(text[i - 1] ?? " ") && !WORD_CHAR.test(text[i + w.length] ?? " ")) return true;
  }
  return false;
};
// CLOSED and non-inert (measured 2026-09-24): the bare-identifier values the two pages carry as RENDERED words, and why
// each is prose rather than a typed value. Any other bare-identifier value found as a rendered word reds; an entry that
// no longer occurs reds too. Object-literal and code positions stay outside this tier (renderedTexts does not read them).
const PROSE_WORDS: ReadonlyMap<string, string> = new Map([
  ["attested", "the optional /gate key, named in a <code> element"],
  ["calibrate", "the operation, named in prose (the calibrate one)"],
  ["calibration", "an English noun (your calibration, per gate calibration)"],
  ["candidates", "an English noun (candidates in set mode)"],
  ["cascade", "an English noun (nodes per cascade)"],
  ["committed", "an English adjective (committed fixture class, committed witness, committed fixtures)"],
  ["content", "the envelope key, named in a <code> element"],
  ["gate", "an English noun (the gate)"],
  ["label", "an English noun (its label field)"],
  ["mode", "an English noun (set mode)"],
  ["params", "the /gate key, the prefix of each rendered param row"],
  ["prediction", "the /gate key, named in a <code> element"],
  ["reason", "an English noun (the reason is one of)"],
  ["scores", "an English noun (nonconformity scores)"],
  ["scores_sha256", "the 1.1.0 digest key, named in a <code> element"],
  ["structuredContent", "the envelope key, named in a <code> element"],
  ["tool", "an English noun (call the gate as a tool)"],
]);

test("harness_pages_render_identifier_values_only_as_declared_prose", () => {
  const idents = identifierValues();
  assert.ok(idents.length >= 30, `non-vacuity: ${String(idents.length)} bare-identifier values`);
  const found = new Set<string>();
  for (const rel of PAGES) {
    const rendered = renderedOf(rel, read(rel));
    assert.ok(rendered.length > 200, `non-vacuity: ${rel} has rendered text`);
    for (const w of idents) if (asWord(rendered, w)) found.add(w);
  }
  assert.deepEqual([...found].filter((w) => !PROSE_WORDS.has(w)).sort(), [], "a bare-identifier served or recorded value is typed as a rendered word");
  for (const [w, why] of PROSE_WORDS) assert.ok(found.has(w), `dead PROSE_WORDS entry ${w} (${why}): delete it`);
  // Named mutant C3: the registry status and a recorded reason code typed into the JSX of /integrators are caught.
  const s = loadHarnessServed(ROOT), byo = loadByoTrace(ROOT);
  const page = read(PAGES[0] ?? "");
  const c3 = page.replace("</main>", `<p>status ${s.registry.status}</p><p>${byo.decision.reason}</p></main>`);
  assert.ok(c3 !== page, "C3 applies");
  const c3Rendered = renderedOf(PAGES[0] ?? "", c3);
  for (const w of [s.registry.status, byo.decision.reason]) {
    assert.ok(!PROSE_WORDS.has(w) && asWord(c3Rendered, w), `C3 (bare-identifier value typed into the JSX): ${w} is caught`);
  }
});

test("harness_served_budget_note_carries_the_served_clause", () => {
  const s = loadHarnessServed(ROOT);
  assert.ok(BUDGET_NOTE.includes(s.honesty.bt_clause), "the sim's budget note carries the served B_t clause verbatim");
  assert.ok(!/\bcount\b/.test(BUDGET_NOTE), "B_t is a capacity (the served param text), never called a count");
  for (const rel of ["apps/site/components/gate-sim/index.tsx", "apps/site/components/gate-sim/board.tsx"]) {
    assert.match(read(rel), /\{BUDGET_NOTE\}/, `${rel} must render the budget note`);
  }
});

// Byte pin of the 1.1.0 bodies (lot CM-3c-3c): since lot 3c-3b2 the served replay and the USDe band are held by a
// version-independent projection, so no byte of a 1.1.0 decision body was pinned outside openapi_sha256. These are the
// sha256 of the bodies the in-process harness answers to the deploy check's own requests, under the served snapshot's keys:
// the bodies the pending snapshot announces, which the deploy check records at T0.
const PENDING_BODIES_SHA256: Record<string, string> = {
  "/openapi.json": "61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0",
  "/gate": "701e9b068944aca7a9c49bb5415fa2af21006b4ba696c916108c4d326445a08c",
  "/gate liquidation-eligible-coverage": "e2bfb18be056b2ed6f0d1cdae681d9b9e38ede054c79509898243d327a105fe7",
  "/calibrate": "f169e9f6e333374a9d47a2010674ca789aba45bd126ef8764df2f0fb86a2cb90",
};
/** The pinned bodies against the committed snapshots of `root` (T0-TOOLING-1, review B-2: derived, no re-pin at T0): while a
 *  pending snapshot exists, its /openapi.json sha256 and served bodies that change at T0; once promoted, the served snapshot
 *  records these very bytes. */
function bodiesAgree(root: string, got: Record<string, string>): void {
  const pendingFile = join(root, PENDING_REL), served = loadHarnessServed(root).bodies_sha256;
  if (existsSync(pendingFile)) {
    assert.equal(got["/openapi.json"], (JSON.parse(readFileSync(pendingFile, "utf8")) as Rec).openapi_sha256, "the openapi pin is the pending snapshot's");
    for (const k of Object.keys(got)) assert.ok(k in served && served[k] !== got[k], `${k}: a body the served snapshot records, whose bytes change at T0`);
  } else {
    for (const k of Object.keys(got)) assert.equal(served[k], got[k], `${k}: the promoted served snapshot records the pinned bytes`);
  }
}
// killer: apps/harness/src/tools/gate.ts:769 CONST "scores_sha256=${digest}`" -> "scores_sha256=${digest} `"
test("pending_bodies_are_pinned_byte_for_byte", async () => {
  const { handleJsonMirror } = await import("../apps/harness/src/http.ts");
  const { GATE_LIQ_BODY } = await import("../scripts/sync-ukemi-served.mjs");
  const { GATE_BODY } = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as { GATE_BODY: unknown };
  const call = async (path: string, body?: unknown): Promise<string> => sha(await (await handleJsonMirror(new Request(`${API_SERVER_URL}${path}`, body === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }))).text());
  const got: Record<string, string> = {
    "/openapi.json": await call("/openapi.json"), "/gate": await call("/gate", GATE_BODY), "/gate liquidation-eligible-coverage": await call("/gate", GATE_LIQ_BODY),
    "/calibrate": await call("/calibrate", { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 }),
  };
  assert.deepEqual(got, PENDING_BODIES_SHA256, "the in-process 1.1.0 bodies are the pinned bytes");
  bodiesAgree(ROOT, got);
  // Both states of a tree, staged: the promoted one (no pending snapshot, the served one recording the pinned bodies) passes;
  // a promoted one whose served snapshot records another body reds, and so does a pending snapshot announcing another document.
  const promoted = (bodies: Record<string, string>): Rec => ({ ...servedJson(), bodies_sha256: { ...(servedJson().bodies_sha256 as Rec), ...bodies } });
  for (const [files, red, why] of [
    [{ [HARNESS_SERVED_REL]: promoted(got) }, false, "a promoted tree recording the pinned bodies passes"],
    [{ [HARNESS_SERVED_REL]: promoted({ ...got, "/gate": "0".repeat(64) }) }, true, "a promoted tree recording another /gate body reds"],
    [{ [HARNESS_SERVED_REL]: { ...servedJson(), pending_since: "2026-10-04" }, [PENDING_REL]: { ...currentPending(), openapi_sha256: "0".repeat(64) } }, true, "a pending snapshot announcing another document reds"],
  ] as const) {
    const t = stage(files);
    try {
      if (red) assert.throws(() => { bodiesAgree(t, got); }, { code: "ERR_ASSERTION" }, why);
      else assert.doesNotThrow(() => { bodiesAgree(t, got); }, why);
    } finally {
      unstage(t);
    }
  }
});

const tmpSha = (root: string, rel: string): string => sha(Buffer.from(readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n"), "utf8"));
/** A staged root whose manifest is the committed one with each staged file's entry set by the syncs' own writer (canonical). */
function stageCanonical(given: Record<string, Rec>): string {
  const t = stage(given);
  writeFileSync(join(t, MANIFEST_REL), [HARNESS_SERVED_REL, ...Object.keys(given)].reduce((m, rel) => setManifestEntry(m, rel, tmpSha(t, rel)), read(MANIFEST_REL)));
  return t;
}
const canonicalIn = (root: string): boolean => { const text = readFileSync(join(root, MANIFEST_REL), "utf8"); return `${JSON.stringify(JSON.parse(text), null, 2)}\n` === text; };

// T0-TOOLING-1 (review B-4): the promotion writes the manifest itself, in its canonical form: the served entry set to the
// written file, the pending entry and file removed; the ukemi promotion then accepts that manifest. A served state that
// drifts from the pending snapshot writes nothing. No network: the sync's write step runs on a staged root.
// killer: scripts/sync-ukemi-served.mjs:349 CONST "return removeManifestEntry(next, pendingRel);" -> "return next;"
test("harness_sync_promotion_rewrites_the_manifest", () => {
  const writeServed = (harnessSync as Record<string, unknown>)["writeServed"] as typeof harnessSync.writeServed | undefined;
  assert.equal(typeof writeServed, "function", "scripts/sync-harness-served.mjs exports writeServed");
  if (writeServed === undefined) return;
  const pending = currentPending(), servedNow = servedJson();
  const shared = Object.fromEntries(Object.entries(pending).filter(([k]) => !["$comment", "schema", "written_at", "openapi_sha256"].includes(k)));
  const next: Rec = { ...servedNow, ...shared, read_at: "2026-10-06T12:00:00.000Z", bodies_sha256: { ...(servedNow.bodies_sha256 as Rec), "/openapi.json": pending.openapi_sha256 } };
  const staged = { [HARNESS_SERVED_REL]: { ...servedNow, pending_since: "2026-10-04" }, [PENDING_REL]: pending };
  const t = stageCanonical(staged), ukemiPending = "apps/site/data/ukemi-pending.json";
  try {
    // The T0 order: the ukemi pending entry is still listed when the harness promotes (kept when the tree carries it).
    const listed = (JSON.parse(read(MANIFEST_REL)) as { files: Record<string, string> }).files[ukemiPending] ?? "0".repeat(64);
    writeFileSync(join(t, MANIFEST_REL), setManifestEntry(readFileSync(join(t, MANIFEST_REL), "utf8"), ukemiPending, listed));
    const before = readFileSync(join(t, MANIFEST_REL), "utf8");
    assert.throws(() => writeServed(t, { ...next, byo_clause: "another clause" }, null), /differs from the pending snapshot on \{byo_clause\}/, "a drift is refused");
    assert.ok(readFileSync(join(t, MANIFEST_REL), "utf8") === before && existsSync(join(t, PENDING_REL)), "the refusal writes nothing");
    assert.deepEqual(writeServed(t, next, null), { sha: tmpSha(t, HARNESS_SERVED_REL), promoted: true });
    const files = (JSON.parse(readFileSync(join(t, MANIFEST_REL), "utf8")) as { files: Record<string, string> }).files;
    assert.ok(canonicalIn(t), "the manifest stays canonical");
    assert.ok(!existsSync(join(t, PENDING_REL)) && !(PENDING_REL in files), "the pending file and its entry are gone");
    assert.equal(files[HARNESS_SERVED_REL], tmpSha(t, HARNESS_SERVED_REL), "the served entry is the written file's CRLF->LF sha256");
    assert.equal(loadHarnessServed(t).read_at, "2026-10-06T12:00:00.000Z", "the site loader accepts the promoted snapshot");
    assert.equal(promotionBlocked(t), null, "the ukemi promotion is no longer blocked");
    // The ukemi promotion's own manifest steps (its served entry set, its pending entry removed) accept this manifest.
    const ukemi = removeManifestEntry(setManifestEntry(readFileSync(join(t, MANIFEST_REL), "utf8"), "apps/site/data/ukemi-served.json", "0".repeat(64)), ukemiPending);
    assert.ok(ukemi.includes(`"apps/site/data/ukemi-served.json": "${"0".repeat(64)}"`) && !ukemi.includes("ukemi-pending.json\": "), "the ukemi writer accepts the manifest");
  } finally {
    unstage(t);
  }
});

// G2 N-4 of T0-TOOLING-1: the promotion is crash-safe and resumable. A failure injected at each write (the served file, the
// manifest, the removal of the pending file) throws naming what was written and what was not; the same call rerun, with no
// hand edit, completes the promotion. A pending file without its entry beside a served file that still carries pending_since
// is not an interrupted promotion: refused.
// killer: scripts/sync-ukemi-served.mjs:351 CONST "!/\"pending_since\"/.test(disk) && " -> "true || "
test("harness_sync_promotion_resumes_after_an_injected_failure", () => {
  const sync = harnessSync as Record<string, unknown>, ukemiIo = (ukemiSync as Record<string, unknown>)["IO"] as { write: (a: string, t: string) => void; remove: (a: string) => void } | undefined;
  assert.ok(ukemiIo !== undefined && typeof sync["writeServed"] === "function", "the syncs expose their file operations");
  if (ukemiIo === undefined) return;
  const writeServed = sync["writeServed"] as typeof harnessSync.writeServed, real = { ...ukemiIo };
  const pending = currentPending(), servedNow = servedJson();
  const shared = Object.fromEntries(Object.entries(pending).filter(([k]) => !["$comment", "schema", "written_at", "openapi_sha256"].includes(k)));
  const next: Rec = { ...servedNow, ...shared, read_at: "2026-10-06T12:00:00.000Z", bodies_sha256: { ...(servedNow.bodies_sha256 as Rec), "/openapi.json": pending.openapi_sha256 } };
  const ukemiPending = "apps/site/data/ukemi-pending.json", listed = (JSON.parse(read(MANIFEST_REL)) as { files: Record<string, string> }).files[ukemiPending] ?? "0".repeat(64);
  const boom = (): never => { throw new Error("injected"); };
  for (const [point, inject, written] of [
    ["the served file", (): void => { ukemiIo.write = (a, t) => { if (a.endsWith("harness-served.json")) boom(); real.write(a, t); }; }, "written: nothing; not done: apps/site/data/harness-served.json, apps/site/data/manifest.sha256.json, the removal of apps/site/data/harness-pending.json"],
    ["the manifest", (): void => { ukemiIo.write = (a, t) => { if (a.endsWith("manifest.sha256.json")) boom(); real.write(a, t); }; }, "written: apps/site/data/harness-served.json; not done: apps/site/data/manifest.sha256.json, the removal of"],
    ["the removal", (): void => { ukemiIo.remove = boom; }, "written: apps/site/data/harness-served.json, apps/site/data/manifest.sha256.json; not done: the removal of apps/site/data/harness-pending.json"],
  ] as const) {
    const t = stageCanonical({ [HARNESS_SERVED_REL]: { ...servedNow, pending_since: "2026-10-04" }, [PENDING_REL]: pending });
    try {
      writeFileSync(join(t, MANIFEST_REL), setManifestEntry(readFileSync(join(t, MANIFEST_REL), "utf8"), ukemiPending, listed));
      inject();
      assert.throws(() => writeServed(t, next, null), (e: Error) => e.message.startsWith("injected; ") && e.message.includes(written) && e.message.endsWith("rerun the same command, it resumes"), `${point}: the failure names what was written`);
      Object.assign(ukemiIo, real);
      assert.deepEqual(writeServed(t, next, null), { sha: tmpSha(t, HARNESS_SERVED_REL), promoted: true }, `${point}: the rerun completes the promotion`);
      const files = (JSON.parse(readFileSync(join(t, MANIFEST_REL), "utf8")) as { files: Record<string, string> }).files;
      assert.ok(!existsSync(join(t, PENDING_REL)) && !(PENDING_REL in files) && files[HARNESS_SERVED_REL] === tmpSha(t, HARNESS_SERVED_REL), `${point}: promoted`);
      assert.equal(loadHarnessServed(t).read_at, "2026-10-06T12:00:00.000Z", `${point}: the site loader accepts the result`);
      assert.deepEqual(readdirSync(join(t, "apps/site/data")).filter((f) => f.endsWith(".tmp")), [], `${point}: no temp file left`);
    } finally {
      Object.assign(ukemiIo, real);
      unstage(t);
    }
  }
  const t = stageCanonical({ [HARNESS_SERVED_REL]: { ...servedNow, pending_since: "2026-10-04" }, [PENDING_REL]: pending });
  try {
    writeFileSync(join(t, MANIFEST_REL), removeManifestEntry(setManifestEntry(readFileSync(join(t, MANIFEST_REL), "utf8"), ukemiPending, listed), PENDING_REL));
    assert.throws(() => writeServed(t, next, null), /has no entry in the manifest/, "a pending file without its entry beside an unpromoted served file is refused");
  } finally {
    unstage(t);
  }
});

// Delta G2 of T0-TOOLING-1 (D-4): a pending file without its entry beside a served file that carries no pending_since but
// does not match its own entry (a hand edit, not an interrupted promotion) is refused, nothing written; the same tree with
// the entry matching the served file is taken as interrupted after its manifest write and completes.
// killer: scripts/sync-ukemi-served.mjs:351 CONST "files[servedRel] === sha256(Buffer.from(lf(disk), \"utf8\"))" -> "true"
test("harness_sync_promotion_refuses_a_hand_edited_served_file", () => {
  const writeServed = (harnessSync as Record<string, unknown>)["writeServed"] as typeof harnessSync.writeServed;
  const pending = currentPending(), servedNow = servedJson();
  const shared = Object.fromEntries(Object.entries(pending).filter(([k]) => !["$comment", "schema", "written_at", "openapi_sha256"].includes(k)));
  const next: Rec = { ...servedNow, ...shared, read_at: "2026-10-06T12:00:00.000Z", bodies_sha256: { ...(servedNow.bodies_sha256 as Rec), "/openapi.json": pending.openapi_sha256 } };
  for (const [entry, refused] of [["0".repeat(64), true], [null, false]] as const) {
    const t = stageCanonical({ [HARNESS_SERVED_REL]: servedNow, [PENDING_REL]: pending });
    try {
      const own = tmpSha(t, HARNESS_SERVED_REL);
      writeFileSync(join(t, MANIFEST_REL), setManifestEntry(removeManifestEntry(setManifestEntry(readFileSync(join(t, MANIFEST_REL), "utf8"), "apps/site/data/ukemi-pending.json", "0".repeat(64)), PENDING_REL), HARNESS_SERVED_REL, entry ?? own));
      const before = readFileSync(join(t, MANIFEST_REL), "utf8");
      if (refused) {
        assert.throws(() => writeServed(t, next, null), /has no entry in the manifest/, "a hand-edited served file is not an interrupted promotion");
        assert.ok(readFileSync(join(t, MANIFEST_REL), "utf8") === before && existsSync(join(t, PENDING_REL)), "nothing written");
      } else {
        assert.doesNotThrow(() => writeServed(t, next, null), "an interruption after the manifest write completes");
        assert.ok(!existsSync(join(t, PENDING_REL)), "the pending file goes");
      }
    } finally {
      unstage(t);
    }
  }
});

// T0-TOOLING-1 (review B-4): --pending sets both manifest entries itself (the pending file's, and the served file's with its
// new pending_since line), and the site loaders accept the result.
// killer: scripts/sync-harness-served.mjs:296 CONST ", OUT_REL, lfSha(marked))" -> ", OUT_REL, lfSha(text))"
test("harness_sync_pending_sets_both_manifest_entries", async () => {
  const writePending = (harnessSync as Record<string, unknown>)["writeHarnessPending"] as typeof harnessSync.writeHarnessPending | undefined;
  assert.equal(typeof writePending, "function", "scripts/sync-harness-served.mjs exports writeHarnessPending");
  if (writePending === undefined) return;
  const { loadHarnessPending } = await import("../apps/site/lib/harness-served-load.ts");
  const t = stageCanonical({});
  try {
    const got = await writePending(t, "2026-10-06T12:00:00.000Z");
    const files = (JSON.parse(readFileSync(join(t, MANIFEST_REL), "utf8")) as { files: Record<string, string> }).files;
    assert.ok(canonicalIn(t), "the manifest stays canonical");
    assert.deepEqual([files[PENDING_REL], files[HARNESS_SERVED_REL]], [tmpSha(t, PENDING_REL), tmpSha(t, HARNESS_SERVED_REL)], "both entries are set");
    assert.equal(got, files[PENDING_REL]);
    assert.equal(loadHarnessPending(t)?.written_at, "2026-10-06T12:00:00.000Z", "the site loader accepts the pending snapshot");
  } finally {
    unstage(t);
  }
});

// m-h of the T0 review: the three projected schemas the served /openapi.json carries, pinned in process the way the G7 of
// SURFACES-1-1-0 measured them (sha256 of JSON.stringify of the exported constant).
// killer: apps/harness/src/schema-projection.ts:186 CONST "[\"type\", \"additionalProperties\"]" -> "[\"type\"]"
test("served_error_and_output_schemas_are_pinned_byte_for_byte", () => {
  assert.deepEqual([TOOL_ERROR_400_SCHEMA, TOOL_ERROR_500_SCHEMA, TOOL_OUTPUT_SCHEMA].map((v) => sha(JSON.stringify(v))), [
    "75dc6b17ff40690149dcc75fc4865fef0604e891f554617d4ffe86d774a30408",
    "072a23ce1be1e2a287a003710485d1e579ef5040f9d2387fac8b98ffd96b2ae0",
    "3b7c685ee012756c911b5311b83c43dbd3d6a2bbeb76c5174dfccab461609e03",
  ], "the 400 body, the 500 body and TOOL_OUTPUT_SCHEMA");
});

// UKEMI-SITE-SWITCH-1 (ADR-U4b-2b D5 point 3): the sync's liquidation-eligible-coverage row and call check follow the SERVED
// registry state (the served /gate description carries exactly one of the two clauses), and the call is judged on
// verdict.reason: under the deploy check's body the top-level reason is L3's action reason (defer on a covered bound too
// wide for the body's tauInterval), so a sync reading it would refuse the switched harness. Replayed on this tree's
// in-process answer (this tree commits the class, U-4b-2b). Mutant: read structuredContent.reason again => red.
test("harness_served_sync_liq_row_follows_the_served_state", async () => {
  const sync = await import("../scripts/sync-harness-served.mjs");
  const gate = await import("../apps/harness/src/tools/gate.ts");
  const { hasCommittedCalibrationForClass } = await import("../apps/harness/src/calibration.ts");
  const { handleJsonMirror } = await import("../apps/harness/src/http.ts");
  const { GATE_LIQ_BODY } = await import("../scripts/sync-ukemi-served.mjs");
  assert.equal(sync.liqStateOf(gate.describeGate(false)), "none");
  assert.equal(sync.liqStateOf(gate.describeGate(true)), "committed");
  assert.equal(sync.liqStateOf(GATE_TOOL_DESCRIPTION), hasCommittedCalibrationForClass(gate.TASK_LIQ_ELIGIBLE) ? "committed" : "none", "the served description states this tree's registry");
  assert.throws(() => sync.liqStateOf("no liquidation clause"), /neither/);
  assert.throws(() => sync.liqStateOf(`${gate.describeGate(false)} ${gate.describeGate(true)}`), /both/);
  for (const [state, registryHasLiq] of [["none", false], ["committed", true]] as const) {
    const d = gate.describeGate(registryHasLiq);
    const rows = sync.classesFor(state);
    assert.deepEqual(rows.map((c) => c.class_id).sort(), [...d.matchAll(/For '([a-z0-9-]+)'/g)].map((m) => m[1]).sort(), `${state}: the closed class table is the served class list`);
    for (const c of rows) for (const p of c.clauses) assert.ok(d.includes(p), `${state}: class ${c.class_id} clause not served: ${p}`);
  }
  const answer = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(GATE_LIQ_BODY) }));
  const liq = JSON.parse(await answer.text()) as { structuredContent: { reason: string; verdict: { reason: string } } };
  assert.equal(liq.structuredContent.verdict.reason, "covered", "this tree serves the committed stratum to the deploy check's body");
  assert.notEqual(liq.structuredContent.reason, liq.structuredContent.verdict.reason, "non-vacuous: the top-level reason is not the verdict reason");
  assert.equal(sync.liqCallAgrees("committed", liq), true, "the switched answer agrees with the committed state (verdict.reason)");
  assert.equal(sync.liqCallAgrees("none", liq), false, "the switched answer never passes for the empty-registry abstention");
  const empty = { structuredContent: { reason: "under_calib", verdict: { reason: "under_calib", n_calib: 0 } }, content: [{ type: "text", text: gate.LIQ_EMPTY_REGISTRY_SENTENCE }] };
  assert.equal(sync.liqCallAgrees("none", empty), true, "the empty-registry abstention agrees with the empty state");
  assert.equal(sync.liqCallAgrees("committed", empty), false, "the empty-registry abstention never passes for the committed state");
});
