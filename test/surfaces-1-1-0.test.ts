/**
 * Lot SURFACES-1-1-0: the public texts and site surfaces outside the served harness speak contract 1.1.0 (release notes,
 * section 2 items 1 to 3 and section 4 point 10). Every expected value is READ from the served code or from a committed
 * recorded trace, never typed here: the version from @monark/contracts, the digests from fixtures/*-trace.json and the
 * harness's pins. One killer per test (closed form, ADR-METHODE-2 D2).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { SCHEMA_VERSION } from "../packages/contracts/src/index.ts";
import { USDE_STABLE_RUN_SCORES_SHA256_PINNED } from "../apps/harness/src/calibration.ts";
import { SCHEMA_VERSION as SIM_SCHEMA_VERSION } from "../apps/site/lib/sim.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (...parts: string[]): string => readFileSync(join(ROOT, ...parts), "utf8");
/** The 1.0.0 names of the scores digest (release notes, section 2 items 2 and 3). */
const OLD_DIGEST_NAMES = /\bcalib_digest\b|\bset_digest\b/;

type Json = Record<string, unknown>;
interface TraceStep { tool?: string; request: { params: { arguments: Json } }; response: { structuredContent: Json } }
/** The calibrate and gate steps of the committed BYO trace (what DEMO.md shows). */
function byoSteps(): { calibrate: TraceStep; gate: TraceStep } {
  const steps = (JSON.parse(read("fixtures", "byo-demo-trace.json")) as { steps: TraceStep[] }).steps;
  const calibrate = steps.find((s) => s.tool === "calibrate");
  const gate = steps.find((s) => s.tool === "gate");
  assert.ok(calibrate && gate, "the trace records a calibrate and a gate step");
  return { calibrate, gate };
}
/** Every key DEMO shows is a recorded key, with the recorded value (a string ending in "…" is a prefix of it). */
function shownIsRecorded(shown: unknown, recorded: unknown, at: string): void {
  if (typeof shown === "string" && shown.endsWith("…")) {
    assert.equal(typeof recorded, "string", `${at}: a truncated value stands for a recorded string`);
    assert.ok((recorded as string).startsWith(shown.slice(0, -1)), `${at}: ${shown} is not a prefix of the recorded ${String(recorded)}`);
    return;
  }
  if (shown !== null && typeof shown === "object" && !Array.isArray(shown)) {
    assert.ok(recorded !== null && typeof recorded === "object", `${at}: the recorded value is an object`);
    for (const [k, v] of Object.entries(shown)) {
      assert.ok(k in (recorded as Json), `${at}.${k} is not a field of the recorded answer`);
      shownIsRecorded(v, (recorded as Json)[k], `${at}.${k}`);
    }
    return;
  }
  assert.deepEqual(shown, recorded, `${at}: the shown value is the recorded one`);
}

// killer: skills/monark/SKILL.md:20 CONST "`scores_sha256`" -> "`calib_digest`"
test("srf_skill_audit_names_scores_sha256 — the skill closes the BYO audit on scores_sha256, alpha and qhat; no 1.0.0 digest name is left in the skill", () => {
  for (const f of ["SKILL.md", "DEMO.md", "INTEGRATION.md"]) {
    assert.doesNotMatch(read("skills", "monark", f), OLD_DIGEST_NAMES, `skills/monark/${f} names a 1.0.0 digest field`);
  }
  const skill = read("skills", "monark", "SKILL.md");
  assert.match(skill, /closes when the verdict's `scores_sha256`, `alpha` and `qhat` equal those of `calibrate`/, "SKILL.md states the 1.1.0 audit tie");
});

// killer: skills/monark/DEMO.md:45 CONST "1.1.0" -> "1.0.0"
test("srf_demo_json_blocks_are_the_recorded_byo_loop — DEMO.md's requests equal the recorded ones and its answers show recorded fields only", () => {
  const demo = read("skills", "monark", "DEMO.md");
  const blocks = [...demo.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => JSON.parse(m[1] ?? "") as unknown);
  assert.equal(blocks.length, 4, "DEMO.md shows four JSON blocks: calibrate request and answer, gate request and answer");
  const [calReq, calRes, gateReq, gateRes] = blocks;
  const { calibrate, gate } = byoSteps();
  assert.deepEqual(calReq, calibrate.request.params.arguments, "the calibrate request is the recorded one");
  assert.deepEqual(gateReq, gate.request.params.arguments, "the gate request is the recorded one (schema_version included)");
  shownIsRecorded(calRes, calibrate.response.structuredContent, "calibrate");
  shownIsRecorded(gateRes, gate.response.structuredContent, "gate");
  const sha = String(calibrate.response.structuredContent["scores_sha256"]);
  assert.equal(gate.response.structuredContent["verdict"] && (gate.response.structuredContent["verdict"] as Json)["scores_sha256"], sha, "premise: the recorded loop closes");
  const audit = demo.split("\n").find((l) => l.startsWith("verdict.scores_sha256 === calibrate.scores_sha256"));
  assert.ok(audit !== undefined, "DEMO.md writes the 1.1.0 audit tie");
  assert.ok(audit.includes(`${sha.slice(0, 8)}… === ${sha.slice(0, 8)}…`), "the audit line cites the recorded digest");
});

// killer: apps/site/lib/sim.ts:25 CONST "1.1.0" -> "1.0.0"
test("srf_site_sim_echoes_the_served_schema_version — the illustrative decision JSON carries the version the gate speaks", () => {
  assert.equal(SIM_SCHEMA_VERSION, SCHEMA_VERSION, "apps/site/lib/sim.ts SCHEMA_VERSION = the contract version");
});

// killer: apps/harness/README.md:73 CONST "must be `1.1.0`" -> "must be `1.0.0`"
test("srf_harness_readme_states_the_served_contract — version, digest name, no-region and band-edge wording of 1.1.0", () => {
  const readme = read("apps", "harness", "README.md");
  assert.ok(readme.includes(`must be \`${SCHEMA_VERSION}\``), "the prediction's schema_version is the served one");
  assert.ok(readme.includes(`fixed \`"${SCHEMA_VERSION}"\``), "the server-fixed schemaVersion is the served one");
  assert.doesNotMatch(readme, /\bcalib_digest\b|\bcalibDigest\b|\bset_digest\b/, "no 1.0.0 digest name");
  assert.doesNotMatch(readme, /nearest double|empty region/, "no 1.0.0 band-edge or empty-region wording (release notes 2.6, 2.8)");
  assert.match(readme, /`verdict\.scores_sha256`/, "the BYO audit names scores_sha256");
});

// killer: fixtures/PROVENANCE-byo-demo.md:38 CONST "3e12ae9e" -> "4081f718"
test("srf_provenance_texts_name_the_recorded_scores_sha256 — the BYO and H5 provenance name the digests their traces record", () => {
  const { calibrate } = byoSteps();
  const byo = read("fixtures", "PROVENANCE-byo-demo.md");
  assert.doesNotMatch(byo, OLD_DIGEST_NAMES, "PROVENANCE-byo-demo.md names a 1.0.0 digest field");
  assert.ok(byo.includes(`\`${String(calibrate.response.structuredContent["scores_sha256"]).slice(0, 8)}…\``), "the BYO provenance cites the recorded scores_sha256");
  const h5 = read("fixtures", "PROVENANCE-h5-e2e-trace.md");
  assert.doesNotMatch(h5, OLD_DIGEST_NAMES, "PROVENANCE-h5-e2e-trace.md names a 1.0.0 digest field");
  assert.ok(read("fixtures", "h5-e2e-trace.json").includes(USDE_STABLE_RUN_SCORES_SHA256_PINNED), "premise: the H5 trace records the USDe pin");
  assert.ok(h5.includes(`\`${USDE_STABLE_RUN_SCORES_SHA256_PINNED.slice(0, 8)}…\``), "the H5 provenance cites the USDe scores_sha256");
});

// killer: README.md:328 CONST "scores_sha256" -> "calib_digest"
test("srf_repo_docs_name_scores_sha256 — the README layout and the harness runbook name the 1.1.0 digest", () => {
  assert.doesNotMatch(read("README.md"), OLD_DIGEST_NAMES, "README.md names a 1.0.0 digest");
  assert.match(read("README.md"), /packages\/contracts {2}TS binding: .*scores_sha256/, "the layout names the contract digest");
  const runbook = read("docs", "RUNBOOK-harness.md");
  assert.doesNotMatch(runbook, OLD_DIGEST_NAMES, "docs/RUNBOOK-harness.md names a 1.0.0 digest");
  assert.ok(runbook.includes("`verdict.scores_sha256` equals the\nlive `calibrate` `scores_sha256`"), "gate_byo_call is described as scripts/verify-harness.mjs checks it");
});

// killer: apps/site/app/how/page.tsx:77 CONST "the scores digest it came from" -> "the calibration digest it came from"
test("srf_site_says_scores_digest — no site source says 'calibration digest' (the 1.0.0 name); the Ukemi label is the scores digest", async () => {
  const site = join(ROOT, "apps", "site");
  const files = (readdirSync(site, { recursive: true }) as string[])
    .filter((f) => /\.(ts|tsx)$/.test(f) && !f.split(sep).some((p) => p === "node_modules" || p === ".next" || p === "data"))
    .map((f) => join(site, f));
  assert.ok(files.length > 50, "the site sources are scanned (false-green guard)");
  const hits = files.filter((f) => /calibration digest/i.test(readFileSync(f, "utf8"))).map((f) => relative(ROOT, f));
  assert.deepEqual(hits, [], "a site source says 'calibration digest'");
  const copy = await import("../apps/site/lib/ukemi-copy.ts");
  assert.equal(copy.FIGURE_DIGEST_LABEL, "scores digest");
  assert.match(copy.DIGEST_NOTE, /^The scores digest identifies the calibration points/, "the note names the scores digest");
});

// killer: docs/RUNBOOK-vitrine.md:35 CONST "au pré-vol" -> "après les portes locales complètes"
test("srf_runbook_vitrine_refusal_falls_at_preflight — the runbook says where release-public refuses since the preflight guard", () => {
  const runbook = read("docs", "RUNBOOK-vitrine.md");
  assert.ok(!runbook.includes("ne tombe qu après les portes locales"), "the stale 'after the local gates' sentence is gone");
  assert.ok(runbook.includes("refus tombe au pré-vol, avant toute porte locale"), "the refusal falls at the preflight");
  assert.match(read("scripts", "release-public.mjs"), /const plan = preflight\(opts\);[\s\S]*for \(const \[name, cmd\] of gates\)/, "premise: the preflight runs before the local gates");
});
