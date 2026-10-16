/**
 * Root test of the --check mode of the site capture tools (SYNC-CHECK-MODE-1): each --check builds what its sync would write
 * from the sources it reads now and exits 1 when the committed capture no longer says it, read_at and pending_since aside.
 * No network: the two network syncs read through their `get` seam, served here by the IN-PROCESS harness (handleJsonMirror for
 * the api host, createHarnessHandler for the MCP host, SSE envelope included); the one source the repository does not carry,
 * the public MCP registry entry, is BUILT here with the fields the harness sync reads (HARNESS-CAPTURE-MCP-SOURCE-1), and the
 * deploy check record is WRITTEN here, one green record per body the sync binds, as scripts/verify-harness.mjs would record
 * them (the real record comes from the network only). Each committed capture of a test is written by the tool's own code
 * (writeServed, servedText of buildUkemiServed, writeSiteCourse, captureRecord, writeNarabiServed), never by hand. The syncs
 * fail closed by process.exit, so the network ones run in a PILOT process whose status and stderr are read (model:
 * test/release-public-flow.test.ts). Each test loads what it judges inside its body: a missing export reds by assertion.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { HARNESS_VERSION } from "../apps/harness/src/version.ts";

const ROOT = join(import.meta.dirname, "..");
const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const MCP_HOST = "https://mcp.monarkgate.tech";
const EMPTY_MANIFEST = `${JSON.stringify({ algorithm: "sha256", files: {} }, null, 2)}\n`;
type Pilot = { status: number | null; out: string; err: string };
type Step = { do: "write" | "check"; variant: "A" | "B" } | { do: "mark" } | { do: "replace"; rel: string; from: string; to: string };

/** The public MCP registry answer the harness sync reads once (REGISTRY of scripts/sync-harness-served.mjs): BUILT, with the
 *  fields the sync reads (one isLatest entry, its remote, version, name, status, publication instant, repository URL). */
const REGISTRY_ANSWER = {
  servers: [{
    server: { name: "tech.monarkgate/harness", version: HARNESS_VERSION, remotes: [{ type: "streamable-http", url: `${MCP_HOST}/mcp` }], repository: { url: "https://example.org/monark" } },
    _meta: { "io.modelcontextprotocol.registry/official": { isLatest: true, status: "active", publishedAt: "2026-10-16T00:00:00Z" } },
  }],
};

// The pilot: the in-process sources (variant B: one key more in the /health body of the harness, or in the OpenAPI body of
// Ukemi), the deploy check record written from them, then the steps. Each answer is memoised per request, so the record and
// the sync hash the same bytes.
const PILOT = `import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
const P = JSON.parse(process.env.SYNC_CHECK_PILOT);
const at = (rel) => new URL(rel, P.repo).href;
const { handleJsonMirror } = await import(at("apps/harness/src/http.ts"));
const { createHarnessHandler } = await import(at("apps/harness/src/server.ts"));
const { API_SERVER_URL } = await import(at("apps/harness/src/openapi.ts"));
const { GATE_BODY, GATE_LIQ_BODY, CALIBRATE_BODY, CASCADE_BODY } = await import(at("scripts/verify-harness.mjs"));
const tool = await import(at(P.module));
const sha = (t) => createHash("sha256").update(t).digest("hex");
const MCP_ACCEPT = "application/json, text/event-stream", memo = new Map();
async function serve(url, init, variant) {
  const u = new URL(url), req = () => new Request(url, { method: init.method ?? "GET", headers: init.headers, body: init.body });
  if (url === P.registryUrl) return JSON.stringify(P.registry);
  if (u.origin === P.mcpHost) return (await createHarnessHandler().fetch(req())).text();
  if (u.origin !== API_SERVER_URL) return null;
  const text = await (await handleJsonMirror(req())).text();
  if (variant === "B" && P.bPath === u.pathname) return JSON.stringify({ ...JSON.parse(text), variant_b: true });
  return text;
}
const getFor = (variant) => async (url, init = {}) => {
  const key = [variant, init.method ?? "GET", url, init.body ?? ""].join(" ");
  if (!memo.has(key)) memo.set(key, await serve(url, init, variant));
  const t = memo.get(key);
  return t === null ? new Response("not found", { status: 404 }) : new Response(t, { status: 200 });
};
async function caFor(variant) {
  const get = getFor(variant), body = async (url, init) => (await get(url, init)).text();
  const post = (path, b) => body(API_SERVER_URL + path, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(b) });
  const bodies = {
    health: await body(API_SERVER_URL + "/health"), openapi: await body(API_SERVER_URL + "/openapi.json"),
    mcp_tools_list: await body(P.mcpHost + "/mcp", { method: "POST", headers: { "content-type": "application/json", accept: MCP_ACCEPT }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) }),
    gate_call: await post("/gate", GATE_BODY), gate_liq_call: await post("/gate", GATE_LIQ_BODY), calibrate_call: await post("/calibrate", CALIBRATE_BODY),
    attest_call: await post("/attest", {}), cascade_call: await post("/cascade", CASCADE_BODY),
  };
  const text = JSON.stringify({ url: API_SERVER_URL, mcp_url: P.mcpHost, checked_at: "2026-10-16T00:00:00.000Z",
    checks: Object.entries(bodies).map(([name, t]) => ({ name, ok: true, sha256: sha(t) })),
    tls: { authorized: true, host: new URL(API_SERVER_URL).host, valid_to: "Jan  1 00:00:00 2027 GMT" }, tls_mcp: { authorized: true, host: new URL(P.mcpHost).host } }, null, 2) + "\\n";
  mkdirSync(join(P.root, "docs"), { recursive: true });
  writeFileSync(join(P.root, "docs", "deploy-CA-harness.json"), text);
  return text;
}
const served = join(P.root, tool.OUT_REL);
for (const s of P.steps) {
  if (s.do === "write") {
    const ca = await caFor(s.variant), get = getFor(s.variant);
    if (P.kind === "harness") { const { out, exempt } = await tool.buildHarnessServed({ get, ca }); tool.writeServed(P.root, out, exempt); }
    else if (P.kind === "ukemi") { mkdirSync(dirname(served), { recursive: true }); writeFileSync(served, tool.servedText(await tool.buildUkemiServed({ root: P.root, get, ca }))); }
    else tool.writeNarabiServed(P.root, await tool.readNarabiFacts({ root: P.root, get }), new Date().toISOString());
    console.log("pilot: written");
    await new Promise((r) => setTimeout(r, 5)); // the next build reads at another millisecond: its read_at differs
  } else if (s.do === "mark") {
    writeFileSync(served, tool.markPendingSince(readFileSync(served, "utf8"), "2026-10-16"));
    console.log("pilot: marked");
  } else if (s.do === "replace") {
    const f = join(P.root, s.rel), text = readFileSync(f, "utf8");
    if (!text.includes(s.from)) throw new Error("pilot: nothing to replace in " + s.rel);
    writeFileSync(f, text.replace(s.from, s.to));
  } else {
    const ca = await caFor(s.variant), get = getFor(s.variant);
    if (P.kind === "harness") await tool.checkHarnessServed({ root: P.root, get, ca });
    else if (P.kind === "ukemi") await tool.checkUkemiServed({ root: P.root, get, ca });
    else await tool.checkNarabiServed({ root: P.root, get });
    console.log("pilot: checked");
  }
}
`;

/** A temporary root with the site manifest (canonical, empty) and, for Narabi, the two timer units; removed after `body`. */
async function withRoot(body: (root: string, pilot: (kind: string, module: string, bPath: string | null, steps: Step[]) => Pilot) => void | Promise<void>, units = false): Promise<void> {
  const tmp = mkdtempSync(join(tmpdir(), "sync-check-")), root = join(tmp, "root"), file = join(tmp, "pilot.mjs");
  try {
    mkdirSync(join(root, "apps", "site", "data"), { recursive: true });
    writeFileSync(join(root, "apps", "site", "data", "manifest.sha256.json"), EMPTY_MANIFEST);
    if (units) for (const u of ["monark-sentinel.timer", "monark-probe.timer"]) { mkdirSync(join(root, "deploy"), { recursive: true }); copyFileSync(join(ROOT, "deploy", u), join(root, "deploy", u)); }
    writeFileSync(file, PILOT);
    const pilot = (kind: string, module: string, bPath: string | null, steps: Step[]): Pilot => {
      const env: NodeJS.ProcessEnv = {};
      for (const [k, v] of Object.entries(process.env)) if (!k.startsWith("NODE_TEST_")) env[k] = v;
      env.SYNC_CHECK_PILOT = JSON.stringify({ repo: pathToFileURL(`${ROOT}/`).href, module, kind, root, bPath, steps, mcpHost: MCP_HOST, registry: REGISTRY_ANSWER, registryUrl: "https://registry.modelcontextprotocol.io/v0/servers?search=tech.monarkgate" });
      const r = spawnSync(process.execPath, [file], { cwd: tmp, env, encoding: "utf8", timeout: 120_000 });
      return { status: r.status, out: r.stdout, err: r.stderr };
    };
    await body(root, pilot);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const HARNESS = "scripts/sync-harness-served.mjs", UKEMI = "scripts/sync-ukemi-served.mjs";

// killer: scripts/sync-harness-served.mjs:207 SDL "    process.exit(1);" -> ""
test("sync_served_check_mode_exits_1_on_stale_capture_harness", async () => {
  const sync: Partial<typeof import("../scripts/sync-harness-served.mjs")> = await import("../scripts/sync-harness-served.mjs");
  assert.equal(typeof sync.checkHarnessServed, "function", "scripts/sync-harness-served.mjs exports its --check");
  assert.equal(typeof sync.buildHarnessServed, "function", "scripts/sync-harness-served.mjs exports the build its write and its --check share");
  await withRoot((root, pilot) => {
    const same = pilot("harness", HARNESS, "/health", [{ do: "write", variant: "A" }, { do: "check", variant: "A" }]);
    assert.equal(same.status, 0, `A checked against A:\n${same.err.slice(-1200)}`);
    assert.ok(same.out.includes("pilot: written") && same.out.includes("sync-harness-served --check OK"), "the capture was written by the sync, then checked");
    const stale = pilot("harness", HARNESS, "/health", [{ do: "write", variant: "A" }, { do: "check", variant: "B" }]);
    assert.ok(stale.out.includes("pilot: written"), `the capture of A was written:\n${stale.err.slice(-1200)}`);
    assert.equal(stale.status, 1, `a capture of A checked against B exits 1:\n${stale.err.slice(-1200)}`);
    assert.match(stale.err, /sync-harness-served --check: apps\/site\/data\/harness-served\.json no longer says what the harness serves now, on \{bodies_sha256\}/, "the 1 comes from the --check, on the one field B moves");
    assert.ok(!stale.err.includes("drifted from the deploy check") && !stale.err.includes("the tool set differs"), "not from the deploy check binding (B has its own record) nor from the tool set");
    assert.ok(!stale.out.includes("pilot: checked"), "nothing runs after the refusal");
    const ca = JSON.parse(readFileSync(join(root, "docs", "deploy-CA-harness.json"), "utf8")) as { checks: { name: string; ok: boolean }[] };
    assert.deepEqual(ca.checks.map((c) => c.name).sort(), ["attest_call", "calibrate_call", "cascade_call", "gate_call", "gate_liq_call", "health", "mcp_tools_list", "openapi"], "the written record binds the eight bodies the sync reads (BODY_TO_CHECK of test/harness-served.test.ts)");
  });
});

// killer: scripts/sync-ukemi-served.mjs:359 SDL "    process.exit(1);" -> ""
test("sync_served_check_mode_exits_1_on_stale_capture_ukemi", async () => {
  const sync: Partial<typeof import("../scripts/sync-ukemi-served.mjs")> = await import("../scripts/sync-ukemi-served.mjs");
  assert.equal(typeof sync.checkUkemiServed, "function", "scripts/sync-ukemi-served.mjs exports its --check");
  assert.equal(typeof sync.buildUkemiServed, "function", "scripts/sync-ukemi-served.mjs exports the build its --check uses");
  await withRoot((_root, pilot) => {
    const same = pilot("ukemi", UKEMI, "/openapi.json", [{ do: "write", variant: "A" }, { do: "check", variant: "A" }]);
    assert.equal(same.status, 0, `A checked against A:\n${same.err.slice(-1200)}`);
    assert.ok(same.out.includes("pilot: written") && same.out.includes("sync-ukemi-served --check OK"), "the capture was written by the sync, then checked");
    const stale = pilot("ukemi", UKEMI, "/openapi.json", [{ do: "write", variant: "A" }, { do: "check", variant: "B" }]);
    assert.ok(stale.out.includes("pilot: written"), `the capture of A was written:\n${stale.err.slice(-1200)}`);
    assert.equal(stale.status, 1, `a capture of A checked against B exits 1:\n${stale.err.slice(-1200)}`);
    assert.match(stale.err, /sync-ukemi-served --check: apps\/site\/data\/ukemi-served\.json no longer says what the harness serves now, on \{body_sha256\}/, "the 1 comes from the --check, on the OpenAPI digest");
    assert.ok(!stale.err.includes("is not the one the deploy check recorded"), "not from servedVerdictFacts: the /gate body and its record are unchanged");
  });
});

// killer: scripts/sync-ukemi-course.mjs:157 CONST "entry !== sha256(lf(text))" -> "false"
test("sync_served_check_mode_exits_1_on_stale_capture_ukemi_course", async () => {
  const course: Partial<typeof import("../scripts/sync-ukemi-course.mjs")> = await import("../scripts/sync-ukemi-course.mjs");
  assert.equal(typeof course.courseCheckProblems, "function", "scripts/sync-ukemi-course.mjs exports its --check");
  assert.equal(typeof course.writeSiteCourse, "function", "scripts/sync-ukemi-course.mjs exports its write");
  const { courseCheckProblems, writeSiteCourse, setManifestEntry, OUT_REL, MANIFEST_REL } = course as typeof import("../scripts/sync-ukemi-course.mjs");
  // The report: the committed site copy keeps the report's body, digest and provenance digests (the sync drops paths only).
  const copy = JSON.parse(readFileSync(join(ROOT, OUT_REL), "utf8")) as Record<string, unknown>;
  const report = { schema: copy.schema, kind: copy.kind, provenance: copy.provenance, body: copy.body, body_digest: copy.body_digest };
  await withRoot((root) => {
    const toolRel = "scripts/census/u4b/u4b-hyp.mjs";
    mkdirSync(dirname(join(root, toolRel)), { recursive: true });
    copyFileSync(join(ROOT, toolRel), join(root, toolRel));
    writeSiteCourse(root, report);
    assert.deepEqual([courseCheckProblems(root), courseCheckProblems(root, report)], [[], []], "the file the sync wrote passes, with and without its report");
    const manifest = readFileSync(join(root, MANIFEST_REL), "utf8");
    writeFileSync(join(root, MANIFEST_REL), setManifestEntry(manifest, OUT_REL, "0".repeat(64)));
    assert.deepEqual(courseCheckProblems(root), [`the manifest entry of ${OUT_REL} is not the sha256 of the committed file`], "a wrong manifest entry is refused");
    writeFileSync(join(root, MANIFEST_REL), manifest);
    const changed = { ...report, provenance: { ...(report.provenance as Record<string, unknown>), node: "v0.0.0-another-run" } };
    assert.deepEqual(courseCheckProblems(root, changed), [`${OUT_REL} is not what the report composes now`], "with --report, a report that composes another file is refused");
    assert.deepEqual(courseCheckProblems(root), [], "without a report, the manifest alone is checked");
  });
});

// killer: scripts/sync-ukemi-served.mjs:340 CONST "\"read_at\", \"pending_since\"" -> "\"pending_since\""
test("sync_served_check_mode_ignores_read_at_only", async () => {
  const harness: Partial<typeof import("../scripts/sync-harness-served.mjs")> = await import("../scripts/sync-harness-served.mjs");
  const ukemi: Partial<typeof import("../scripts/sync-ukemi-served.mjs")> = await import("../scripts/sync-ukemi-served.mjs");
  assert.ok(typeof harness.checkHarnessServed === "function" && typeof ukemi.checkUkemiServed === "function" && typeof ukemi.snapshotDrift === "function", "both network syncs export their --check");
  for (const [kind, module, bPath, name] of [["harness", HARNESS, "/health", "sync-harness-served"], ["ukemi", UKEMI, "/openapi.json", "sync-ukemi-served"]] as const) {
    await withRoot((_root, pilot) => {
      const later = pilot(kind, module, bPath, [{ do: "write", variant: "A" }, { do: "check", variant: "A" }]);
      assert.equal(later.status, 0, `${kind}: the same sources read later (another read_at) pass:\n${later.err.slice(-1200)}`);
      assert.ok(later.out.includes(`${name} --check OK`) && !later.err.includes("pending_since"), `${kind}: checked, nothing to note`);
      const marked = pilot(kind, module, bPath, [{ do: "write", variant: "A" }, { do: "mark" }, { do: "check", variant: "A" }]);
      assert.equal(marked.status, 0, `${kind}: a capture marked pending_since by the sync's own --pending marker passes:\n${marked.err.slice(-1200)}`);
      assert.ok(marked.out.includes("pilot: marked") && marked.err.includes(`${name} --check: note: apps/site/data/${kind}-served.json carries pending_since 2026-10-16`), `${kind}: the pending mark is named on stderr`);
    });
  }
  const drift = (ukemi as typeof import("../scripts/sync-ukemi-served.mjs")).snapshotDrift;
  const text = (o: Record<string, unknown>): string => `${JSON.stringify(o, null, 2)}\n`;
  const built = { schema: "s", read_at: "2026-10-16T00:00:00.000Z", fact: 1 };
  assert.deepEqual(drift(text({ ...built, read_at: "2026-09-01T00:00:00.000Z" }), built, text), { drift: [], pendingSince: null }, "read_at alone differs: no drift");
  assert.deepEqual(drift(text({ ...built, fact: 2 }), built, text).drift, ["fact"], "control: a fact differs");
  assert.deepEqual(drift(text({ schema: "s", fact: 1 }), built, text).drift, ["read_at"], "set aside, never optional: a committed snapshot without read_at is a drift");
});

// killer: scripts/sync-narabi-capture.mjs:96 CONST " || reprojected !== old.timeline_jsonl" -> ""
test("sync_narabi_capture_check_refuses_diverged_prefix", async () => {
  const cap: Partial<typeof import("../scripts/sync-narabi-capture.mjs")> = await import("../scripts/sync-narabi-capture.mjs");
  assert.ok(typeof cap.checkCommitted === "function" && typeof cap.captureRecord === "function", "scripts/sync-narabi-capture.mjs exports checkCommitted and the capture it writes");
  const { checkCommitted, captureRecord, projectTimeline } = cap as typeof import("../scripts/sync-narabi-capture.mjs");
  const served = timeline(), lines = served.split("\n").filter(Boolean), last = JSON.parse(lines.at(-1) ?? "{}") as Line;
  const old = captureRecord(SEED, stateOf(last), served, "2026-09-19");
  assert.equal(old.timeline_jsonl, projectTimeline(served), "the stored timeline is the projection of the fixture lines");
  assert.deepEqual(checkCommitted(old, stateOf(last), served), [], "control: the capture of what is served passes");
  const second = JSON.parse(lines[1] ?? "{}") as Record<string, unknown>;
  assert.notEqual(second.utterance_hash, "0".repeat(64), "premise: the change below is a change");
  const diverged = [lines[0], JSON.stringify({ ...second, utterance_hash: "0".repeat(64) }), ...lines.slice(2)].join("\n") + "\n";
  const problems = checkCommitted(old, stateOf(last), diverged);
  assert.ok(problems.includes("the stored timeline is not, byte for byte, the projection of the first lines served now"), `a diverged line of the prefix is refused by the projection check: ${JSON.stringify(problems)}`);
});

// killer: scripts/sync-narabi-capture.mjs:106 CONST "servedT - storedT > CAPTURE_LAG_BOUND_T" -> "false"
test("sync_narabi_capture_check_refuses_capture_older_than_bound", async () => {
  const cap: Partial<typeof import("../scripts/sync-narabi-capture.mjs")> = await import("../scripts/sync-narabi-capture.mjs");
  assert.ok(typeof cap.checkCommitted === "function" && Number.isSafeInteger(cap.CAPTURE_LAG_BOUND_T), "scripts/sync-narabi-capture.mjs exports checkCommitted and its lag bound");
  const { checkCommitted, captureRecord, CAPTURE_LAG_BOUND_T: bound } = cap as typeof import("../scripts/sync-narabi-capture.mjs");
  const served = timeline(), lines = served.split("\n").filter(Boolean), parsed = lines.map((l) => JSON.parse(l) as Line), last = parsed.at(-1) as Line;
  const capturedAt = (t: number): { old: ReturnType<typeof captureRecord>; storedT: number } => {
    const k = parsed.findIndex((l) => l.T === t) + 1;
    assert.ok(k > 0, `premise: the fixture has a line at T=${String(t)}`);
    return { old: captureRecord(SEED, stateOf(parsed[k - 1] as Line), `${lines.slice(0, k).join("\n")}\n`, "2026-09-18"), storedT: t };
  };
  const behind = capturedAt(last.T - bound - 1), atBound = capturedAt(last.T - bound);
  const late = checkCommitted(behind.old, stateOf(last), served);
  assert.deepEqual(late, [`the capture (T=${String(behind.storedT)}) is ${String(bound + 1)} step(s) behind what is served now (T=${String(last.T)}), more than the bound of ${String(bound)}: re-capture before any send`], "served T = stored T + bound + 1: refused, by the bound alone (a faithful prefix)");
  assert.deepEqual(checkCommitted(atBound.old, stateOf(last), served), [], "served T = stored T + bound: accepted");
});

// killer: scripts/sync-narabi-served.mjs:108 CONST "return old !== null && " -> "return true || "
test("sync_narabi_served_check_exits_1_on_changed_fact", async () => {
  const sync: Partial<typeof import("../scripts/sync-narabi-served.mjs")> = await import("../scripts/sync-narabi-served.mjs");
  assert.ok(typeof sync.checkNarabiServed === "function" && typeof sync.readNarabiFacts === "function" && typeof sync.sameNarabiFacts === "function", "scripts/sync-narabi-served.mjs exports its --check, its reads and its judgment");
  await withRoot((_root, pilot) => {
    const same = pilot("narabi", "scripts/sync-narabi-served.mjs", null, [{ do: "write", variant: "A" }, { do: "check", variant: "A" }]);
    assert.equal(same.status, 0, `control: the record the sync wrote passes:\n${same.err.slice(-1200)}`);
    assert.ok(same.out.includes("pilot: written") && same.out.includes("sync-narabi-served --check OK"), "written, then checked");
    const moved = pilot("narabi", "scripts/sync-narabi-served.mjs", null, [{ do: "write", variant: "A" }, { do: "replace", rel: "deploy/monark-sentinel.timer", from: "RandomizedDelaySec=1800", to: "RandomizedDelaySec=1799" }, { do: "check", variant: "A" }]);
    assert.equal(moved.status, 1, `a timer fact changed after the write exits 1:\n${moved.err.slice(-1200)}`);
    assert.match(moved.err, /sync-narabi-served --check: apps\/site\/data\/narabi-served\.json no longer says what the sources say now/, "named as a changed fact, not as a manifest entry");
  }, true);
});

type Line = { T: number; digest_T: unknown; q_after: unknown };
/** The fixture timeline (a byte prefix of the served one, test/narabi-live.test.ts), LF. */
const timeline = (): string => readFileSync(join(ROOT, "apps", "sentinel", "test", "fixtures", "narabi-timeline-2026-09-19.jsonl"), "utf8").replace(/\r\n/g, "\n");
/** The served state.json fields checkCommitted reads, at a line: the tracker's T (and the digest and q it carries). */
const stateOf = (l: Line): string => JSON.stringify({ digest: l.digest_T, tracker: { t: l.T, q: l.q_after } });
/** The previous capture a first capture names (none served before it). */
const SEED = { captured_at: "2026-09-17", served: { timeline_sha256: sha(""), timeline_chars: 0 } };
