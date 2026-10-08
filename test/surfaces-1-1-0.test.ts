/**
 * Lot SURFACES-1-1-0: the public texts and site surfaces outside the served harness speak contract 1.1.0 (release notes,
 * section 2 items 1 to 3 and section 4 point 10). Every expected value is READ from the served code or from a committed
 * recorded trace, never typed here: the version from @monark/contracts, the digests from fixtures/*-trace.json and the
 * harness's pins. One killer per test (closed form, ADR-METHODE-2 D2).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";
import { SCHEMA_VERSION } from "../packages/contracts/src/index.ts";
import { USDE_STABLE_RUN_SCORES_SHA256_PINNED } from "../apps/harness/src/calibration.ts";
import { KATA_CLASS_RE } from "../apps/harness/src/tools/gate.ts";
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

// killer: README.md:330 CONST "scores_sha256" -> "calib_digest"
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

// killer: docs/RUNBOOK-vitrine.md:36 CONST "`preflight`" -> "`main`"
test("srf_runbook_vitrine_refusal_falls_at_preflight — the runbook says where release-public refuses since the preflight guard", () => {
  const lines = read("docs", "RUNBOOK-vitrine.md").split("\n");
  const at = lines.findIndex((l) => l.includes("#181 (RELEASE-PREFLIGHT-SEND-GUARD-1)"));
  assert.ok(at > 0, "the runbook carries the dated line of the preflight guard");
  assert.ok(lines[at]?.startsWith("- (2026-10-06, SURFACES-1-1-0) "), "the correction is a new dated line, below the entry it corrects");
  // The line is French (internal runbook): pinned by digest so that test/ quotes no French text (lang gate).
  assert.equal(createHash("sha256").update(lines[at] ?? "", "utf8").digest("hex"), "7793735ff9597570f1e1be7c2365dafd15d9be01efc047f84509fd148c368ed5", "the preflight sentence of the runbook, byte for byte");
  assert.match(read("scripts", "release-public.mjs"), /const plan = preflight\(opts\);[\s\S]*for \(const \[name, cmd\] of gates\)/, "premise: the preflight runs before the local gates");
});

// killer: skills/monark/SKILL.md:72 CONST "`byo_reserved_kata`" -> "`byo_overrides_committed`"
test("srf_skill_names_the_kata_classes_and_the_reserved_pattern — the skill says the kata classes are served and which BYO class names are refused", () => {
  const skill = read("skills", "monark", "SKILL.md");
  assert.ok(!skill.includes("Two other `task_class`es are served."), "the 1.0.0 list of served classes is gone");
  assert.ok(skill.includes("Two other `task_class`es are served with a committed calibration."), "the two calibrated classes are named as such");
  assert.ok(skill.includes("The 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` are also served, without calibration: the gate abstains on every well-formed call (`under_calib`, or `non_evaluable` for a lean of exactly 0 on a `dir` class)"), "the kata classes are served without calibration and the gate abstains");
  assert.doesNotMatch(skill.slice(skill.indexOf("The 32 kata classes")).split("\n")[0] ?? "", /\bregion\b|\bband\b/, "no region or band is promised on the kata classes");
  assert.ok(skill.includes(`\`${KATA_CLASS_RE.source}\` (compared without ASCII case): it is refused (\`byo_reserved_kata\`).`), "the reserved pattern is the served one, with its code");
});

// killer: apps/site/lib/ukemi-copy.ts:144 CONST "in the order the class's table" -> "sorted ascending, the class's table"
test("srf_ukemi_digest_note_is_the_1_1_0_note — the whole note, order clause included", async () => {
  const copy = await import("../apps/site/lib/ukemi-copy.ts");
  assert.equal(copy.DIGEST_NOTE, "The scores digest identifies the calibration points this bound is computed from, in the order the class's table lists them; the gate returns it with every answer on this stratum, so an answer can be matched to its calibration.");
});

// killer: CONTRIBUTING.md:25 CONST "`scores_sha256`, `alpha` and `qhat`" -> "calibration digest"
test("srf_contributing_closes_the_loop_on_scores_sha256 — the exported contributing guide states the 1.1.0 audit tie", () => {
  const text = read("CONTRIBUTING.md");
  assert.doesNotMatch(text, OLD_DIGEST_NAMES, "CONTRIBUTING.md names a 1.0.0 digest field");
  assert.doesNotMatch(text, /calibration digest/i, "CONTRIBUTING.md uses the 1.0.0 digest name");
  assert.ok(text.includes("a `scores_sha256` over exactly those scores, in the order sent."), "calibrate returns scores_sha256");
  assert.ok(text.includes("the verdict's `scores_sha256`, `alpha` and `qhat` equal\n   those the calibrate step returned"), "the loop closes on scores_sha256, alpha and qhat");
});

// killer: docs/RUNBOOK-harness.md:214 CONST "18 of 18 checks" -> "13 of 13 checks"
test("srf_runbook_harness_green_gate_quotes_the_script — the message and the count are those of scripts/verify-harness.mjs", () => {
  const script = read("scripts", "verify-harness.mjs");
  const named = [...script.matchAll(/(?:wiredCheck|httpCheck|capturedCheck)\("(\w+)"/g)].map((m) => m[1]);
  const looped = [...script.matchAll(/\["(gate_\w+_call)", GATE_\w+_BODY,/g)].map((m) => m[1]);
  const count = named.length + looped.length;
  assert.equal(new Set([...named, ...looped]).size, count, "premise: distinct check names");
  assert.equal(count, 18, "premise: the script runs 18 checks (E-2a adds the kata path and version checks)");
  assert.ok(script.includes('"VERIFY OK — all checks passed."'), "premise: the message the script prints");
  const runbook = read("docs", "RUNBOOK-harness.md");
  assert.ok(runbook.includes(`its stderr prints \`VERIFY OK — all checks passed\` (${String(count)} of ${String(count)} checks;`), `the runbook quotes the message and the ${String(count)} checks`);
});

// T0-TOOLING-1 (review M-3, section 2.3): the $comment the ukemi sync writes names the scores digest, the 1.1.0 name; the
// whole text is pinned by digest, so the 1.0.0 wording cannot come back unseen.
// killer: scripts/sync-ukemi-served.mjs:248 CONST "the scores digest," -> "the calibration digest,"
test("srf_ukemi_sync_comment_says_scores_digest — the written $comment is the 1.1.0 text, byte for byte", async () => {
  const { COMMENT } = await import("../scripts/sync-ukemi-served.mjs");
  assert.ok(COMMENT.includes("the bound margin as an exact base-currency integer string or null, the scores digest, the smallest"), "the comment names the scores digest");
  assert.doesNotMatch(COMMENT, /calibration digest/i, "the comment never says 'calibration digest'");
  assert.equal(createHash("sha256").update(COMMENT, "utf8").digest("hex"), "476c008d282ed625a4cdeef3e546af11726703d09b24555cd43390019cb3be85", "the comment, byte for byte");
});

// T0-TOOLING-1 (review m-a): section 6 of the harness runbook names every check scripts/verify-harness.mjs runs.
// killer: docs/RUNBOOK-harness.md:186 CONST "`origin_403_api`" -> "`origin_api`"
test("srf_runbook_harness_names_every_check — the 18 checks of the script, each by its name", () => {
  const script = read("scripts", "verify-harness.mjs");
  const names = [...script.matchAll(/(?:wiredCheck|httpCheck|capturedCheck)\("(\w+)"/g), ...script.matchAll(/\["(gate_\w+_call)", GATE_\w+_BODY,/g)].map((m) => m[1] ?? "");
  assert.equal(names.length, 18, "premise: the script runs 18 checks");
  const runbook = read("docs", "RUNBOOK-harness.md");
  assert.deepEqual(names.filter((n) => !runbook.includes(`\`${n}\``)), [], "a check the runbook does not name");
});

/** The lines of the T0 section, under its heading, that are neither empty nor a numbered act: a continuation line, a
 *  sub-bullet or a second dated line would carry a command the order test does not pin (delta G2 D-2). Only the section's
 *  FIRST line is exempt, and only as a dated line with no code span (delta2 G2 E-1). */
function strayT0Lines(text: string): string[] {
  const from = text.indexOf("\n## Ordre de T0"), next = text.indexOf("\n## ", from + 1);
  const [first = "", ...rest] = text.slice(from, next < 0 ? undefined : next).split("\n").slice(2).filter((l) => l.trim() !== "");
  return [...(/^Ligne dat\u00e9e /.test(first) && !first.includes("`") ? [] : [first]), ...rest.filter((l) => !/^\d+\. /.test(l))];
}

// T0-TOOLING-1 (review B-3, m-g; G2 N-5, N-6; delta G2 D-1, D-2, D-4 resumption): the T0 section of the storefront runbook names the nine acts in order, each
// with EXACTLY its code spans (a flag, a path or a target changed anywhere reds); the act 6 commit lists every file the acts
// write (each path read from its writer, the journal of act 2 included, so the release of act 9 sees a clean tree); the act 2
// command parses as the deploy check reads it; act 8 publishes the release contract-1.1.0, by its name, with both roots, and parses as
// spec-publish reads it; no line of the section but the acts carries text. French runbook: only code spans are read here.
// killer: docs/RUNBOOK-vitrine.md:47 CONST " docs/JOURNAL-PROVENANCE.md apps/site/data/harness-served.json" -> " apps/site/data/harness-served.json"
test("srf_runbook_vitrine_t0_order — deploy, green CA, harness, Narabi and ukemi syncs, re-pin, site, spec, release", async () => {
  const harness = await import("../scripts/sync-harness-served.mjs"), ukemi = await import("../scripts/sync-ukemi-served.mjs");
  const narabi = (await import(new URL("../scripts/sync-narabi-served.mjs", import.meta.url).href)) as { OUT_REL: string };
  const repin = await import("../scripts/repin-served.mjs").catch(() => null);
  assert.ok(repin !== null, "scripts/repin-served.mjs, act 6, exists");
  const { PIN_TEST_REL } = repin;
  const { parseArgs } = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as { parseArgs: (a: string[]) => { out: string | null } };
  const text = read("docs", "RUNBOOK-vitrine.md");
  const at = text.indexOf("\n## Ordre de T0");
  assert.ok(at > 0, "the runbook carries the T0 section");
  const steps = text.slice(at).split("\n").filter((l) => /^\d+\. /.test(l));
  assert.deepEqual(strayT0Lines(text), [], "every line of the section is a numbered act");
  for (const [act, extra] of [[3, "   relancer `node scripts/sync-harness-served.mjs --pending`"], [6, "   - `node scripts/sync-ukemi-served.mjs --pending`"]] as const) {
    const lines = text.split("\n"), head = lines.indexOf("## Ordre de T0 (contrat 1.1.0, lot T0-TOOLING-1)"), i = lines.findIndex((l, k) => k > head && l.startsWith(`${String(act)}. `));
    assert.notDeepEqual(strayT0Lines([...lines.slice(0, i + 1), extra, ...lines.slice(i + 1)].join("\n")), [], `a command line indented under act ${String(act)} reds`);
  }
  const all = text.split("\n"), dated = all.findIndex((l) => /^Ligne dat\u00e9e 2026-10-06 \(RECHERCHES, lot T0-TOOLING-1, ordre/.test(l)), four = all.findIndex((l, k) => k > dated && l.startsWith("4. "));
  const span = "`node scripts/sync-harness-served.mjs --pending`";
  assert.notDeepEqual(strayT0Lines([...all.slice(0, four), `Ligne dat\u00e9e 2026-10-07: ${span}.`, ...all.slice(four)].join("\n")), [], "a second dated line between two acts reds (delta2 E-1)");
  assert.notDeepEqual(strayT0Lines(all.map((l, k) => (k === dated ? `${l} ${span}` : l)).join("\n")), [], "a code span on the section's dated line reds (delta2 E-1)");
  const inputs = JSON.parse(read("scripts", "spec-publish-inputs.json")) as { releases: Record<string, { previous_commit: string | null }> };
  const release = "contract-1.1.0", prev = (inputs.releases[release]?.previous_commit ?? "").slice(0, 7);
  const spec = `node scripts/spec-publish.mjs --release ${release} --date <YYYY-MM-DD> --out <dir> --root recherches=<recherches> --root previous=<monark-kata-spec@${prev}>`;
  const specArgs = ((await import(new URL("../scripts/spec-publish.mjs", import.meta.url).href)) as { parseArgs: (a: string[]) => { release: string; roots: Record<string, string> } }).parseArgs(spec.split(" ").slice(2));
  assert.deepEqual([specArgs.release, Object.keys(specArgs.roots)], ["contract-1.1.0", ["recherches", "previous"]], "act 8 publishes contract 1.1.0 with both roots");
  const spans = steps.map((l) => [...l.matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? ""));
  const added = [harness.CA_REL, "docs/JOURNAL-PROVENANCE.md", harness.OUT_REL, harness.PENDING_REL, narabi.OUT_REL, ukemi.OUT_REL, ukemi.PENDING_REL, ukemi.MANIFEST_REL, PIN_TEST_REL];
  const ca = `node scripts/verify-harness.mjs --out ${harness.CA_REL} --kata-wait-max 3150`;
  assert.deepEqual(spans, [
    ["docs/RUNBOOK-harness.md", "git archive --format=tar.gz HEAD apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs | ssh -i ~/.ssh/monark_vps root@monarkgate.tech \"mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness\"", "cd /opt/monark-harness && npm ci && chown -R monark:monark . && systemctl restart monark-harness"],
    [ca, "VERIFY OK — all checks passed.", "api.", "mcp.", `${harness.CA_REL}.failed`, `sha256sum ${harness.CA_REL}`, "docs/JOURNAL-PROVENANCE.md", "checked_at"],
    ["node scripts/sync-harness-served.mjs", "harness-pending.json", "harness-served.json", "harness-pending.json", "node scripts/sync-harness-served.mjs"],
    ["node scripts/sync-narabi-served.mjs", "openapi"],
    ["node scripts/sync-ukemi-served.mjs", "harness-pending.json", "ukemi-pending.json", "node scripts/sync-ukemi-served.mjs"],
    ["node scripts/repin-served.mjs", "PINNED", PIN_TEST_REL, "harness-pending.json", "npm run ci", `git add ${added.join(" ")}`, "git commit"],
    ["main", "node scripts/export-public.mjs --out <scratch>/site-<sha>"],
    [spec, "<recherches>", "recherches", "1107e12", `<monark-kata-spec@${prev}>`, "monark-kata-spec", "<dir>", "MANIFEST.sha256", "66d31d82122587a9da8725f3e19b39b43f371de826c1e9f311ea6a1755d4eb16", "VERSION"],
    ["v0.9.0", "docs/public-notes/v0.9.0.md", "notes", "docs/public-notes/v0.9.0.commit.md", "message", "v0.8.0: …", "main", "node scripts/release-public.mjs --message docs/public-notes/v0.9.0.commit.md", "MONARK_PUBLIC_MIRROR",
      "--tag", "--notes", "v0.9.0", "gh release create v0.9.0 --repo KraidleAI/Monark --title v0.9.0 --notes-file docs/public-notes/v0.9.0.md --verify-tag", "docs/adr/ADR-PUBLIC-CADENCE-1.md"],
  ], "the nine acts, in order, each with exactly its code spans");
  steps.forEach((l, i) => { assert.ok(l.startsWith(`${String(i + 1)}. `), `act ${String(i + 1)} is numbered in order`); });
  assert.equal(parseArgs(ca.split(" ").slice(2)).out, harness.CA_REL, "act 2 writes the record the syncs read");
  for (const m of text.slice(at).matchAll(/node (scripts\/[\w-]+\.mjs)/g)) assert.ok(existsSync(join(ROOT, m[1] ?? "")), `${m[1] ?? ""} exists`);
});
