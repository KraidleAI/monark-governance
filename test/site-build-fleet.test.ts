/**
 * Root oracles for lot CI-site (L-2 / C-1 / C-4 / C-6) — the `next build` (job g3-site) wiring.
 *
 * O-2 asserts the RENDERED /fleet HTML body carries the served-notes header and each built agent's note. The
 * pure function scripts/assert-fleet-html.mjs is exercised here on a SYNTHETIC fixture (a body + a fake inline
 * <script> payload) — never the real 61 KB fleet.html, never a file under fixtures/ (which would need a same-dir
 * PROVENANCE). In job g3-site the SAME function runs on the freshly built apps/site/.next artefact (CA-11).
 *
 * The build itself is branched LOCALLY, not "in CI": ci.yml triggers on pull_request only and the local
 * --no-ff merges open no PR (C-1). The proof is the run-line constant asserted == the g3-site build `run:`
 * line (idiom ci_publishes_sbom, cra-b.test.ts): G2 and checkpoint-2 EXTRACT that line and replay it with a
 * TSX type error injected => next build reds (the site TSX is typechecked only by the build, G0 finding 2/12).
 *
 * Named mutants (replayed red on an in-memory copy, sha256 restored — docs/PLI-lot-ci-site.md):
 *   M-O2d note only in the <script> payload (absent from the body) => red — kills the raw-includes false-green.
 *   M-O2c body carries &#x27; without a payload => green AFTER decoding, red without (decode is load-bearing).
 *   M-O2a rendered note removed => red; header removed => red; M-O2b vacuity (empty list/blank note/empty body).
 *   M-C1-runline the build `run:` line drifts from SITE_BUILD_RUN => the run-line test reds.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assertFleetBody, renderedBody, decodeEntities, SITE_BUILD_RUN, FLEET_HEADER } from "../scripts/assert-fleet-html.mjs";
import { derivePublicWorkflow, collectFiles, CI_WORKFLOW_PATH } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

// Source notes as lib/fleet.ts holds them (LITERAL apostrophe); the rendered body carries them ENTITY-encoded.
const NOTE_A_SRC = "served through the gate: its attested testimony's residual is carried into the verdict";
const NOTE_A_ENC = "served through the gate: its attested testimony&#x27;s residual is carried into the verdict";
const NOTE_B = "a daily published timeline parsed byte-exact by the site";

// A realistic rendered body: React wraps interpolated text in <!-- --> markers, the note apostrophe is an
// entity in the body, and an inline RSC <script> payload holds the notes with LITERAL apostrophes.
const bodyOf = (notesInBody: string[]): string =>
  `<main><section><div class="mono"><!-- -->${FLEET_HEADER}</div><ul>` +
  notesInBody.map((n) => `<li><span>Agent</span> &mdash; <!-- -->${n}<!-- --></li>`).join("") +
  `</ul></section></main>`;
const payloadOf = (notes: string[]): string => `<script>self.__next_f.push([1,${JSON.stringify(notes)}])</script>`;

test("fleet_html_assertion_is_sound — O-2 asserts the rendered /fleet body, script payload stripped + entities decoded (L-2/C-4)", () => {
  const expectedNotes = [NOTE_A_SRC, NOTE_B];

  // GREEN: header + both notes in the body (note A entity-encoded), plus a payload carrying the literal notes.
  const green = bodyOf([NOTE_A_ENC, NOTE_B]) + payloadOf([NOTE_A_SRC, NOTE_B]);
  assert.doesNotThrow(() => assertFleetBody({ html: green, expectedHeader: FLEET_HEADER, expectedNotes }));

  // M-O2d: note A ONLY in the <script> payload (LITERAL apostrophe), absent from the body => red. This is the
  // raw-includes false-green (G0 finding 8): a naive includes() on the raw bytes would match the payload.
  const mO2d = bodyOf([NOTE_B]) + payloadOf([NOTE_A_SRC, NOTE_B]);
  assert.ok(mO2d.includes(NOTE_A_SRC), "fixture check: the raw bytes DO contain the note (in the payload)");
  assert.throws(() => assertFleetBody({ html: mO2d, expectedHeader: FLEET_HEADER, expectedNotes }), /absent from the rendered/, "M-O2d: note only in the payload must red");

  // M-O2c: body carries &#x27; and NO payload => GREEN after decoding; the decode is load-bearing (the raw
  // body does NOT contain the literal note, only the decoded body does).
  const mO2c = bodyOf([NOTE_A_ENC, NOTE_B]);
  assert.ok(!mO2c.includes(NOTE_A_SRC), "fixture check: the raw body has the ENTITY form, not the literal note");
  assert.ok(renderedBody(mO2c).includes(NOTE_A_SRC), "M-O2c: the decoded body must contain the literal note");
  assert.doesNotThrow(() => assertFleetBody({ html: mO2c, expectedHeader: FLEET_HEADER, expectedNotes }), "M-O2c: green after decoding");

  // M-O2a: the note render is gone from the body (and no payload) => red.
  assert.throws(() => assertFleetBody({ html: bodyOf([NOTE_B]), expectedHeader: FLEET_HEADER, expectedNotes }), /absent from the rendered/, "M-O2a: removed note render must red");

  // header removed => red.
  const noHeader = `<main><ul><li>${NOTE_A_ENC}</li><li>${NOTE_B}</li></ul></main>`;
  assert.throws(() => assertFleetBody({ html: noHeader, expectedHeader: FLEET_HEADER, expectedNotes }), /header absent/, "removed header must red");

  // M-O2b: vacuity guards — empty expected list, a blank note, and an empty rendered body all red.
  assert.throws(() => assertFleetBody({ html: green, expectedHeader: FLEET_HEADER, expectedNotes: [] }), /vacuity/, "M-O2b: empty expected list must red");
  assert.throws(() => assertFleetBody({ html: green, expectedHeader: FLEET_HEADER, expectedNotes: ["   "] }), /vacuity/, "M-O2b: a blank note must red");
  assert.throws(() => assertFleetBody({ html: payloadOf([NOTE_A_SRC]), expectedHeader: FLEET_HEADER, expectedNotes }), /body empty/, "M-O2b: a body that is empty after stripping must red");

  // decodeEntities: &amp; is decoded LAST so &amp;#x27; does not double-decode into an apostrophe.
  assert.equal(decodeEntities("a&amp;#x27;b"), "a&#x27;b", "decode order: &amp;#x27; must NOT become an apostrophe");
  assert.equal(decodeEntities("x&#x27;y &lt;z&gt; &quot;q&quot; &#39;w"), "x'y <z> \"q\" 'w", "named + numeric entity decode");
});

test("fleet_page_renders_the_served_header — the /fleet page still renders the O-2 header constant (tripwire)", () => {
  // The header lives in TWO places (page.tsx render + assert-fleet-html.mjs FLEET_HEADER). This is not the
  // "expected list" (which is derived from fleet.ts, never duplicated), so it is licit — but a drift between
  // the render and the constant would make O-2 assert a header the page no longer emits. Pin them together.
  assert.ok(read("apps/site/app/fleet/page.tsx").includes(FLEET_HEADER), `apps/site/app/fleet/page.tsx must render the O-2 header ${JSON.stringify(FLEET_HEADER)}`);
});

test("g3_site_build_run_line_is_pinned — the g3-site build `run:` line == SITE_BUILD_RUN (C-1, idiom ci_publishes_sbom)", () => {
  const LINES = read(".github/workflows/ci.yml").split(/\r?\n/);
  const idx = LINES.findIndex((l) => /^  g3-site\s*:/.test(l));
  assert.notEqual(idx, -1, "job 'g3-site' missing from the workflow");
  const block: string[] = [];
  for (let i = idx + 1; i < LINES.length; i++) {
    const l = LINES[i]!;
    if (/^  \S/.test(l) || /^\S/.test(l)) break; // next 2-space job key or a column-0 key
    block.push(l.replace(/#.*$/, "")); // strip end-of-line comments
  }
  // The build `run:` line: its VALUE (comment stripped, trimmed) EQUALS the constant — not `includes`, so G2
  // extracts exactly this line and replays it. Mutant M-C1-runline: change the ci.yml build line => no match.
  const buildRun = block.find((l) => {
    const m = /^\s*run:\s*(.+?)\s*$/.exec(l);
    return m !== null && m[1] === SITE_BUILD_RUN;
  });
  assert.ok(buildRun, `g3-site must carry a build step \`run: ${SITE_BUILD_RUN}\` (C-1; mutant M-C1-runline reds here)`);
  // The O-2 step runs the pure-function CLI on the fresh artefact, in the SAME job (C-5 asserts the order).
  assert.ok(block.some((l) => /^\s*run:\s*node scripts\/assert-fleet-html\.mjs\s*$/.test(l)), "g3-site must run `node scripts/assert-fleet-html.mjs` (O-2 step)");
});

test("derived_workflow_run_paths_are_exported — every scripts/enforcement path a DERIVED run: cites is in collectFiles().kept (C-6)", () => {
  const derived = derivePublicWorkflow(read(CI_WORKFLOW_PATH));
  const cited = new Set<string>();
  for (const l of derived.split(/\r?\n/)) {
    if (!/^\s*run:/.test(l)) continue;
    for (const m of l.matchAll(/(?:scripts|enforcement)\/[\w./-]+\.(?:mjs|cjs|js|sh)\b/g)) cited.add(m[0]);
  }
  // Non-vacuity: the derived workflow cites at least the g1 enforcement script and the g3-site O-2 script.
  assert.ok(cited.has("enforcement/lint-model-pinning.sh"), "sanity: derived g1 must cite enforcement/lint-model-pinning.sh");
  assert.ok(cited.has("scripts/assert-fleet-html.mjs"), "sanity: derived g3-site must cite scripts/assert-fleet-html.mjs");
  const kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel));
  const notExported = [...cited].filter((p) => !kept.has(p));
  assert.deepEqual(notExported, [], `a DERIVED run: cites a path absent from the public export (mutant: drop it from WHITELIST_FILES): ${notExported.join(", ")}`);
});
