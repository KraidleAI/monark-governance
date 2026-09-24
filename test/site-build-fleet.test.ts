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
import ts from "typescript";
import { renderedTexts } from "../apps/site/test/honesty-lint.ts";

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

test("rendered_body_strips_hidden_surfaces_and_fails_closed — attributed/uppercase <script>, <noscript>/<template>, decimal entity, unclosed <script> (O-2/O-3)", () => {
  const expectedNotes = [NOTE_A_SRC, NOTE_B];
  const scriptAttrOf = (notes: string[]): string => `<script type="application/json" nonce="r4nd0m">${JSON.stringify(notes)}</script>`;
  const scriptUpperOf = (notes: string[]): string => `<SCRIPT TYPE="application/json">${JSON.stringify(notes)}</SCRIPT>`;

  // (O-3 / N3) attributed <script type=...>: the payload note must be stripped by the `[^>]*` in the regex; a
  // NAKED `<script>` regex would miss it and the note would false-green from the payload. Body lacks NOTE_A.
  const attributed = bodyOf([NOTE_B]) + scriptAttrOf([NOTE_A_SRC, NOTE_B]);
  assert.ok(attributed.includes(NOTE_A_SRC), "fixture: the raw bytes carry the note (in an attributed <script>)");
  assert.throws(() => assertFleetBody({ html: attributed, expectedHeader: FLEET_HEADER, expectedNotes }), /absent from the rendered/, "attributed <script type=...> payload must be stripped (mutant: drop `[^>]*` => this note false-greens)");

  // (case-insensitivity) uppercase <SCRIPT ...>: the `gi` flag must strip it; without `i` the payload note false-greens.
  const upper = bodyOf([NOTE_B]) + scriptUpperOf([NOTE_A_SRC, NOTE_B]);
  assert.throws(() => assertFleetBody({ html: upper, expectedHeader: FLEET_HEADER, expectedNotes }), /absent from the rendered/, "uppercase <SCRIPT> payload must be stripped (mutant: drop the `i` flag => this note false-greens)");

  // (O-2) a note logged ONLY inside a hidden <noscript>/<template> is NOT rendered — strip both. Mutant:
  // remove either strip => the note survives => false-green (which this assert.throws catches).
  const inNoscript = bodyOf([NOTE_B]) + `<noscript>${NOTE_A_SRC}</noscript>`;
  assert.ok(inNoscript.includes(NOTE_A_SRC), "fixture: the raw bytes carry the note (in <noscript>)");
  assert.throws(() => assertFleetBody({ html: inNoscript, expectedHeader: FLEET_HEADER, expectedNotes }), /absent from the rendered/, "a note only in <noscript> must red (mutant: drop the noscript strip)");
  const inTemplate = bodyOf([NOTE_B]) + `<template>${NOTE_A_SRC}</template>`;
  assert.throws(() => assertFleetBody({ html: inTemplate, expectedHeader: FLEET_HEADER, expectedNotes }), /absent from the rendered/, "a note only in <template> must red (mutant: drop the template strip)");

  // (O-3 / N2) decimal entity: `&#8212;` (em dash) is decoded ONLY by the decimal branch `/&#(\d+);/` — unlike
  // `&#39;`, which the named apostrophe rule also catches (why N2 survived the old fixtures). Load-bearing:
  // drop the decimal branch and the decoded note no longer matches.
  const NOTE_DEC_SRC = "served by a decimal—entity note";
  const NOTE_DEC_ENC = "served by a decimal&#8212;entity note";
  assert.ok(!NOTE_DEC_ENC.includes(NOTE_DEC_SRC), "fixture: the raw body carries the DECIMAL entity, not the literal char");
  assert.ok(renderedBody(bodyOf([NOTE_DEC_ENC])).includes(NOTE_DEC_SRC), "the decimal-entity branch must decode &#8212; (mutant: drop /&#(\\d+);/ => reds here)");
  assert.doesNotThrow(() => assertFleetBody({ html: bodyOf([NOTE_DEC_ENC]), expectedHeader: FLEET_HEADER, expectedNotes: [NOTE_DEC_SRC] }), "green after decimal decode");

  // (O-2 fail-closed) an UNCLOSED <script> (no </script>) whose payload carries a note absent from the body
  // must THROW — never let the payload leak in. Mutant: remove the fail-closed throw => the note survives the
  // (non-matching) balanced strip => false-green, which this assert.throws then catches.
  const unclosed = bodyOf([NOTE_B]) + `<script>self.__next_f.push([1,${JSON.stringify([NOTE_A_SRC])}])`;
  assert.ok(unclosed.includes(NOTE_A_SRC), "fixture: the raw bytes carry the note (in an unclosed <script>)");
  assert.throws(() => assertFleetBody({ html: unclosed, expectedHeader: FLEET_HEADER, expectedNotes }), /unclosed <script>/, "an unclosed <script> must fail-closed (mutant: remove the throw => the payload note false-greens)");
  assert.throws(() => renderedBody("<main>body</main><script>oops no close"), /unclosed <script>/, "renderedBody itself fails-closed on an unclosed <script>");

  // steady state: balanced attributed + uppercase scripts, a template and a noscript that hide NO expected
  // note keep the well-formed body GREEN (the strips are not over-eager; balanced scripts do not trip the
  // fail-closed).
  const clean =
    bodyOf([NOTE_A_ENC, NOTE_B]) + scriptAttrOf([NOTE_A_SRC]) + scriptUpperOf([NOTE_B]) +
    "<template><li>ignored</li></template><noscript>enable javascript</noscript>";
  assert.doesNotThrow(() => assertFleetBody({ html: clean, expectedHeader: FLEET_HEADER, expectedNotes }), "balanced hidden surfaces that hide no expected note stay green");
});

test("fleet_page_renders_the_served_header — the /fleet page RENDERS the O-2 header constant, not just a comment (tripwire, O-1 hardened)", () => {
  // The header lives in TWO places (page.tsx render + assert-fleet-html.mjs FLEET_HEADER). This is not the
  // "expected list" (which is derived from fleet.ts, never duplicated), so it is licit — but a drift between
  // the render and the constant would make O-2 assert a header the page no longer emits. Pin them together.
  // O-1 (G2 N4): a plain `.includes()` on the source was satisfiable by the JSX COMMENT that names the header
  // (page.tsx:125), so deleting the RENDERED header while keeping the comment left this green. Harden it the
  // way the vocab exemption guard was (an AST walker, not a substring match): parse the TSX and require the
  // header in a RENDERED text position (renderedTexts = JSX text / child expression / visible attribute) — a
  // JSX comment is not one. Mutant: delete the rendered header <div> (keep the :125 comment) => this reds.
  const src = read("apps/site/app/fleet/page.tsx");
  const sf = ts.createSourceFile("fleet/page.tsx", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const rendered = renderedTexts(sf).map((rt) => rt.text);
  assert.ok(
    rendered.some((t) => t.includes(FLEET_HEADER)),
    `apps/site/app/fleet/page.tsx must RENDER the O-2 header ${JSON.stringify(FLEET_HEADER)} in a JSX position (a comment naming it does not count — O-1)`,
  );
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

// Lot CODEQL-ALERTS-1 (ADR-CODEQL-ALERTS-1 D3; CodeQL #27 js/bad-tag-filter, #28/#29 js/incomplete-multi-character-
// sanitization): renderedBody removes hidden blocks and comments with a one-pass scanner, never a regex filter. The five
// outcomes the ADR fixes, fail-closed on EVERY unclosed surface, generic tags kept. Named mutants (G1): closer without
// whitespace tolerance => (i) reds; `<script` output guard removed => (v) reds; `<!--` output guard removed => (iii)
// reds; no throw on an unclosed block => (iv) reds. G2 fold (B-1, M-1): a template ends at its own `</template>`, not at
// one inside a nested script/noscript (raw text) or a nested template (T1-T3, Rd); a closer name has a boundary (GM4).
test("rendered_body_scanner_outcomes - the five ADR outcomes, fail-closed on unclosed surfaces, generic tags kept (ADR-CODEQL-ALERTS-1 D3)", () => {
  // (i) `</script >` closes the block (the form the regex missed, CodeQL #27); any ASCII whitespace, any case, attributes.
  assert.equal(renderedBody("<script>a</script >b"), "b", "(i) a closer padded by a space ends the block");
  assert.equal(renderedBody("<SCRIPT data-x=1>a</Script\t\n>b"), "b", "(i) any ASCII whitespace and case, attributes tolerated");
  // (GM4) the closer's name has a boundary too: `</scriptx>` closes nothing, the later `</script>` does.
  assert.equal(renderedBody("<script>a</scriptx>b</script>c"), "c", "(GM4) `</scriptx>` is not a closer of <script>");
  // (T1, T2, T3, Rd) template content is markup (WHATWG 13.2.6.4.16): a nested script/noscript is raw text, so a
  // `</template>` inside it closes nothing; an unclosed nested block still throws, naming itself; templates nest.
  assert.equal(renderedBody('<template><script>var s="</template>";</script>HIDDEN</template>VISIBLE'), "VISIBLE", "(T1) a </template> inside a nested <script> closes nothing");
  assert.equal(renderedBody("<template><noscript></template>HIDDEN</noscript></template>VISIBLE"), "VISIBLE", "(T2) a </template> inside a nested <noscript> closes nothing");
  assert.throws(() => renderedBody("<main>ok</main><template><script></template>HIDDEN"), /unclosed <script> block/, "(T3) an unclosed <script> nested in a <template> throws (ADR D3 (iv))");
  assert.equal(renderedBody("<template><template></template>HIDDEN</template>VISIBLE"), "VISIBLE", "(Rd) a nested template closes its own </template> first");
  // (G2-delta M-1) the template closer keeps D3's grammar on its own call path (templateEnd -> closerAt): any case, any
  // ASCII whitespace before `>`, a name boundary; a comment in template content is consumed whole, so a `</template>`
  // inside it closes nothing (Tc).
  assert.equal(renderedBody("<TeMpLaTe><ScRiPt></TEMPLATE></sCrIpT>HA</TeMpLaTe>VA"), "VA", "(Tcase) the template closer is ASCII case-insensitive");
  assert.equal(renderedBody("<template>HA</template \t\n\f\r>VA"), "VA", "(Tws) any ASCII whitespace may pad the template closer");
  assert.equal(renderedBody("<template>HA</templatex>HB</template>VA"), "VA", "(Tx) `</templatex>` is not a template closer");
  assert.equal(renderedBody("<template><!-- </template> -->HA</template>VA"), "VA", "(Tc) a </template> inside a comment in a template closes nothing");
  // (ii) `<scr` is no opener; the complete block after it goes; the leftover text stays as is.
  assert.equal(renderedBody("<scr<script>ipt>P</script>"), "<scr", "(ii) the scanner looks for an opener from the current position");
  // (iii) a comment opener rebuilt from leftovers is caught on the OUTPUT (C-V2-2b).
  assert.throws(() => renderedBody("<!-<!---->-"), /<!-- comment opener survived stripping/, "(iii) a residual <!-- throws");
  // (iv) an unclosed hidden block or comment throws in the scanner (its payload would be counted as rendered text).
  assert.throws(() => renderedBody("<script>"), /unclosed <script> block/, "(iv) an unclosed <script> throws");
  for (const name of ["noscript", "template"]) {
    assert.throws(() => renderedBody(`<main>body</main><${name}>hidden note`), new RegExp(`unclosed <${name}> block`), `(iv) an unclosed <${name}> throws (the regex left its text in the body)`);
  }
  assert.throws(() => renderedBody("<main>body</main><!-- open"), /unclosed <!-- comment/, "(iv) an unclosed comment throws");
  // (v) a <script> rebuilt from leftovers is caught by the `<script` guard on the OUTPUT (C-V2-2a), never silenced.
  assert.throws(() => renderedBody("<scr<script></script>ipt>"), /<script> tag survived stripping/, "(v) the output guard throws");
  // Generic tags are KEPT (extractMain / mainCorpus read them): only hidden surfaces and comments go.
  assert.equal(
    renderedBody('<main class="m"><p title="t">x<!-- -->y</p><scripts>z</scripts></main>'),
    '<main class="m"><p title="t">xy</p><scripts>z</scripts></main>',
    "generic tags (a non-hidden <scripts> included) are kept verbatim",
  );
});

// Lot CODEQL-ALERTS-1, G2-delta fold (B-2, L-1, M-2). A comment ends where a browser ends it (WHATWG 13.2.5.43, .44,
// .50-.52): at once for `<!-->` and `<!--->`, else at the first `-->` or `--!>`. The `-->`-only grammar ran on past that
// end, swallowed the opener of a LATER hidden surface, and the rest of its payload was counted (U1-U7, Lb1-Lb6). A `<!--`
// in raw text or in an attribute value is no comment to a browser and the scanner cannot tell, so a comment span holding
// a hidden-surface opener throws, naming it. Template nesting is bounded (a named throw, never a call-stack overflow).
test("rendered_body_comment_forms_and_template_depth - browser comment closes, ambiguous comment spans fail closed, bounded nesting (G2-delta B-2, L-1, M-2)", () => {
  // Abrupt closes (13.2.5.43/.44) and `--!>` (13.2.5.52) end the comment where a browser does.
  assert.equal(renderedBody("<!-->VA"), "VA", "(Rb1) `<!-->` closes at once");
  assert.equal(renderedBody("<!--->VA"), "VA", "(Rb2) `<!--->` closes at once");
  assert.equal(renderedBody("<!-- HA --!>VA"), "VA", "(Rb3) `--!>` closes the comment");
  assert.equal(renderedBody("<!-->VA<!-- -->"), "VA", "(Rb4) `<!-->` never pairs with a later `-->`");
  assert.throws(() => renderedBody("<!--!>HA"), /unclosed <!-- comment/, "(Rb5) `<!--!>` closes nothing: only a `>` right after `<!--` does (13.2.5.43)");
  // ... so a comment closed at once never swallows the opener of a later hidden surface (B-2 in a template, L-1 at top level).
  assert.equal(renderedBody("<template><!--></template><script>--></template>HA</script>VA"), "VA", "(U1) `<!-->` in a template");
  assert.equal(renderedBody("<template><!---></template><script>--></template>HA</script>VA"), "VA", "(U2) `<!--->` in a template");
  assert.equal(renderedBody("<template><!-- x --!></template><script>--></template>HA</script>VA"), "VA", "(U3) `--!>` in a template");
  assert.equal(renderedBody("<template><!--></template><noscript>--></template>HA</noscript>VA"), "VA", "(U7) same, via a <noscript>");
  assert.equal(
    renderedBody('<main><h2>How each built agent is served</h2></main><template><!--></template><script>self.__next_f.push([1,"-->"])</template>note only in payload</script>'),
    "<main><h2>How each built agent is served</h2></main>",
    "(U6) a note living only in the inline payload is never counted (G0 finding 8 shape)",
  );
  assert.equal(renderedBody("<!--><noscript>-->HA</noscript>VA"), "VA", "(Lb5) top level, <noscript>");
  assert.equal(renderedBody("<!--><template>-->HA</template>VA"), "VA", "(Lb6) top level, <template>");
  assert.equal(renderedBody("<template><!--></template>VA--></template>VB"), "VA--></template>VB", "(Rb4t) the template ends at its first closer");
  // ... and a <script> left without a closer throws again (ADR D3 (iv)).
  assert.throws(() => renderedBody("<template><!--></template><script>--></template>HA"), /unclosed <script> block/, "(U1b) unclosed <script> after a template");
  assert.throws(() => renderedBody("<!--><script>-->HA"), /unclosed <script> block/, "(Lb1) unclosed <script> after `<!-->`");
  assert.throws(() => renderedBody("<!-- x --!><script>-->HA"), /unclosed <script> block/, "(Lb2) unclosed <script> after `--!>`");
  // A comment span holding a hidden-surface opener: a real comment hides the opener, a `<!--` in raw text (style,
  // title..., M-24) or in an attribute value leaves it live. The scanner cannot tell: it throws, naming the opener.
  assert.throws(() => renderedBody("<style><!--</style><script>-->HA"), /comment spans a <script> opener/, "(Lb3) `<!--` in a <style>");
  assert.throws(() => renderedBody('<p title="<!--"></p><script>-->HA'), /comment spans a <script> opener/, "(Lb4) `<!--` in an attribute value");
  assert.throws(() => renderedBody("<template><style><!--</style></template><script>--></template>HA</script>VA"), /comment spans a <script> opener/, "(U4) `<!--` in a <style> in a template");
  assert.throws(() => renderedBody('<template><p title="<!--"></p></template><script>--></template>HA</script>VA'), /comment spans a <script> opener/, "(U5) `<!--` in an attribute value in a template");
  assert.throws(() => renderedBody("<!--<script>-->VA"), /comment spans a <script> opener/, "(Ca1) opener right after `<!--`");
  assert.throws(() => renderedBody("<!-- <noscript> -->VA"), /comment spans a <noscript> opener/, "(Ca2) a <noscript> opener");
  assert.throws(() => renderedBody("<!-- <b> <template> -->VA"), /comment spans a <template> opener/, "(Ca3) an opener after a generic tag");
  // Template nesting is bounded: 256 levels are followed, 257 throw a named error (never a RangeError of the call stack).
  const nested = (n: number): string => "<template>".repeat(n) + "</template>".repeat(n) + "VDEEP";
  assert.equal(renderedBody(nested(256)), "VDEEP", "(D256) 256 nested templates are followed");
  assert.throws(() => renderedBody(nested(257)), /<template> nested deeper than 256 levels/, "(D257) deeper nesting throws, named");
});

// Lot CODEQL-ALERTS-1, pli 3 (L-2, investor decision 187). Raw-text elements (style, title, textarea, xmp, iframe,
// noembed, noframes, plaintext: WHATWG 13.2.6.4.4, 13.2.6.4.7) hold TEXT to a browser; the scanner does not remove them
// and reads their content as markup. Where that reading changes what it takes for hidden, it throws, named: a
// hidden-surface opener in the content (live to the scanner, it swallowed a real surface that follows: the two-pass
// regex order threw on `<style><noscript></style><script></noscript>...`, the single pass counted the payload), a
// template closer in the content of an element in a template, an element never closed, and a comment span holding a
// raw-text opener (the ambiguity rule).
test("rendered_body_raw_text_elements - a raw-text element holding a hidden-surface opener, a template closer (in a template) or left unclosed, and a comment spanning a raw-text opener, fail closed (pli 3, L-2)", () => {
  // Clause 1: a hidden-surface opener in the content.
  assert.throws(() => renderedBody("<style><noscript></style><script></noscript>HA"), /a <style> element holds a <noscript> opener/, "(L2) the noscript read in the style swallowed the script opener");
  assert.throws(() => renderedBody("<style><noscript></style><script></noscript>HA</script>VB"), /a <style> element holds a <noscript> opener/, "(L2c) same, the script closed later");
  for (const name of ["title", "textarea", "xmp", "iframe", "noembed", "noframes"]) {
    assert.throws(() => renderedBody(`<${name}><noscript></${name}><script></noscript>HA`), new RegExp(`a <${name}> element holds a <noscript> opener`), `(L2-${name}) every raw-text element`);
  }
  assert.throws(() => renderedBody("<STYLE type=x><NoScript></Style ><script></noscript>HA</script>VB"), /a <style> element holds a <noscript> opener/, "(L2case) any case, attributes, a padded closer");
  assert.throws(() => renderedBody("<style>a<b>b<noscript></style><script></noscript>HA"), /a <style> element holds a <noscript> opener/, "(L2nf) the opener need not be the first tag");
  assert.throws(() => renderedBody("<style><template></style><script></template>HA"), /a <style> element holds a <template> opener/, "(L2tpl) a template opener");
  assert.throws(() => renderedBody("<style><script></style><noscript></script>HA</noscript>VB"), /a <style> element holds a <script> opener/, "(L2scr) a script opener");
  assert.throws(() => renderedBody("<template><style><noscript></style><script></noscript>HA</script></template>VA"), /a <style> element holds a <noscript> opener/, "(L2t) inside a template too");
  // Clause 2: in template content, a template closer in the content (R-h).
  assert.throws(() => renderedBody("<template><style></template></style>HA</template>VA"), /a <style> element in a <template> holds a <\/template>/, "(Rh1)");
  assert.throws(() => renderedBody("<template><title></template></title>HA</template>VA"), /a <title> element in a <template> holds a <\/template>/, "(Rh3)");
  assert.throws(() => renderedBody("<template><textarea></template></textarea>HA</template>VA"), /a <textarea> element in a <template> holds a <\/template>/, "(Rh2)");
  // Clause 3: an element never closed (plaintext never is, 13.2.6.4.7).
  assert.throws(() => renderedBody("<main>body</main><style>note"), /an unclosed <style> element/, "(Ru1) its text would run to the end of the input");
  assert.throws(() => renderedBody("<template><style></template><!-->HA-->"), /an unclosed <style> element/, "(Rh1acc) no longer hidden behind a comment");
  assert.throws(() => renderedBody("<plaintext></plaintext><script>x</script>VA"), /an unclosed <plaintext> element/, "(Pt) plaintext never ends");
  // A comment span holding a raw-text opener: if the <!-- is text or an attribute value, the element is live.
  assert.throws(() => renderedBody("<style><!--</style><style>--><noscript></style><script></noscript>HA</script>VB"), /a <!-- comment spans a <style> opener/, "(Byp1) a <!-- in raw text");
  assert.throws(() => renderedBody('<p title="<!--"></p><style>--><noscript></style><script></noscript>HA</script>VB'), /a <!-- comment spans a <style> opener/, "(Byp2) a <!-- in an attribute value");
  assert.throws(() => renderedBody('<template><p title="<!--"></p><style>--></template>HA</style></template>VA'), /a <!-- comment spans a <style> opener/, "(Byp3) in a template");
  assert.throws(() => renderedBody("<!-- <style> -->VA"), /a <!-- comment spans a <style> opener/, "(Ca4) a real comment holding one throws too: the scanner cannot tell");
  // Exact cases kept: raw-text elements are copied verbatim, like every generic tag.
  assert.equal(renderedBody("<style>body{color:red}</style>VA"), "<style>body{color:red}</style>VA", "(Ex1)");
  assert.equal(renderedBody("<title>T</title>VA<textarea>x</textarea>VB"), "<title>T</title>VA<textarea>x</textarea>VB", "(Ex2)");
  assert.equal(renderedBody("<style>a<b>c</style>VA"), "<style>a<b>c</style>VA", "(Ex3) a generic tag in the content");
  assert.equal(renderedBody("<template><style>x</style>HA</template>VA"), "VA", "(Ex4) a closed style in a template");
  assert.equal(renderedBody("<style><!-- a --></style>VA"), "<style></style>VA", "(Ex6) a comment inside, removed as before");
  assert.equal(renderedBody('<main><style>.x{}</style><p>VA</p></main><script>self.__next_f.push([1,"HA"])</script>'), "<main><style>.x{}</style><p>VA</p></main>", "(Ex7) the page shape");
  assert.equal(renderedBody("<style>x</style><noscript>HA</noscript>VA<template>HB</template>VB"), "<style>x</style>VAVB", "(Ex8)");
  assert.equal(renderedBody("<styles>VA</styles><noscript>HA</noscript>VB"), "<styles>VA</styles>VB", "(Bnd) `<styles>` is no raw-text element");
  assert.equal(renderedBody("<style></template></style>VA"), "<style></template></style>VA", "(Rtop) a template closer at top level closes nothing");
  assert.equal(renderedBody("<style><title></style><script>x</script>VA"), "<style><title></style>VA", "(Nest) a raw-text opener in the content is text");
  assert.equal(renderedBody("<template><style><title></style>HA</template>VA"), "VA", "(NestT) likewise in a template");
  assert.equal(renderedBody("<style>a</style ><script>x</script>VA"), "<style>a</style >VA", "(Cls) a padded closer ends the element");
  assert.equal(renderedBody("<template><style></template x></style>HA</template>VA"), "VA", "(Rax) `</template x>` is no D3 closer (R-a)");
});
