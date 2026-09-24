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
 *
 * Registry surface (lot site-5j-registry, below the O-2 block): source-level and pure-function oracles that the register
 * pages (/, /fleet, /roadmap, /products, /writing, the footer) read every status, count, name and served fact from the
 * register, schemas/, the served descriptions or committed hashed data — never typed. Each test names its mutant.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { assertFleetBody, renderedBody, decodeEntities, SITE_BUILD_RUN, FLEET_HEADER } from "../scripts/assert-fleet-html.mjs";
import { derivePublicWorkflow, collectFiles, CI_WORKFLOW_PATH } from "../scripts/export-public.mjs";
import ts from "typescript";
import { renderedTexts } from "../apps/site/test/honesty-lint.ts";
import { compilePatterns, scanText } from "../scripts/grep-forbidden.mjs";
import { parseTimeline, lagStatus, addDays } from "../apps/site/lib/narabi-live.ts";
import { loadNarabiServed } from "../apps/site/lib/narabi-served-load.ts";
import { loadNarabiCapture } from "../apps/site/lib/narabi-capture-load.ts";
import { loadHarnessServed } from "../apps/site/lib/harness-served-load.ts";
import { BT_SERVED_RULE, BUDGET_NOTE } from "../apps/site/lib/sim.ts";
import {
  FLEET_AGENTS,
  PRODUCTS,
  SHARED_GATE,
  countWord,
  capitalized,
  listNames,
  builtAgents,
  upcomingAgents,
  builtProducts,
  upcomingProducts,
  productStatusSentence,
  registerNames,
} from "../apps/site/lib/fleet.ts";
import { INSIDE, insideFor } from "../apps/site/lib/fleet-presentation.ts";
import { listFrozenContracts, frozenContractsSummary, UNSERVED_CONTRACT_FILES } from "../apps/site/app/roadmap/frozen-contracts.ts";
import { loadBellServed } from "../apps/site/lib/bell-served-load.ts";
import { GATE_TOOL_DESCRIPTION } from "../apps/harness/src/tools/gate.ts";
import { CASCADE_TOOL_DESCRIPTION } from "../apps/harness/src/tools/cascade.ts";
import { ATTEST_TOOL_DESCRIPTION } from "../apps/harness/src/tools/attest.ts";
import { HARNESS_TOOLS } from "../apps/harness/src/tools/registry.ts";
import { LIQ_EMPTY_REGISTRY_SENTENCE as SITE_LIQ_SENTENCE } from "../apps/site/lib/ukemi-copy.ts";

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

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Registry surface (lot site-5j-registry; storefront regime of decision 159: no G2, technical controls mandatory). Every
// value these pages show is read from the register (apps/site/lib/fleet.ts), from schemas/, from a module pinned
// byte-identical to a served description, or from committed, hashed served data — never typed. These oracles are
// SOURCE-level (the TSX is parsed with the honesty-lint walker, never regex-on-comments where a render is required) and
// pure-function level (the register helpers). The rendered-HTML half (products/roadmap/home artefacts and the client
// chunk bytes) belongs to scripts/assert-fleet-html.mjs; its extension is a formed request of this lot, not claimed here.
// Finding ids (R03..R50) refer to the audit of 2026-09-24 handed to the lot.

/** Rendered texts (JSX text, JSX child literal, visible attribute) of one apps/site source, via the honesty-lint walker. */
const renderedOf = (rel: string): string[] => {
  const src = read(rel);
  const kind = rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, kind);
  return renderedTexts(sf).map((rt) => rt.text);
};

/** Literal parts of `export const metadata = { …, description }`: a string, or a template's head and tails (its
 *  interpolations are code, not text). Returns [] when the page exports no metadata description. */
const metadataDescriptionLiterals = (rel: string): string[] => {
  const sf = ts.createSourceFile(rel, read(rel), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: string[] = [];
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!(stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== "metadata" || decl.initializer === undefined) continue;
      if (!ts.isObjectLiteralExpression(decl.initializer)) continue;
      for (const prop of decl.initializer.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name) || prop.name.text !== "description") continue;
        const init = prop.initializer;
        if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) out.push(init.text);
        else if (ts.isTemplateExpression(init)) out.push(init.head.text, ...init.templateSpans.map((span) => span.literal.text));
      }
    }
  }
  return out;
};

const REGISTER_PAGES = [
  "apps/site/app/page.tsx",
  "apps/site/app/fleet/page.tsx",
  "apps/site/app/roadmap/page.tsx",
  "apps/site/app/products/page.tsx",
];

// Data-source name forms (VOCAB-PROVIDERS-SITE-1). These LITERALS live ONLY in this repo-root test/ file, which is never
// exported — the confinement of decision 69 / C-9 (test/no-cash-provider-name.test.ts): vocab-banned.json is exported,
// so a rule there would publish the very name it bans. Scanned over every EXPORTED apps/site file by
// site_names_no_data_source; asserted absent from vocab-banned.json by the vocab test below.
const DATA_SOURCE_FORMS: { re: RegExp; why: string }[] = [
  { re: /databento/i, why: "close-source brand (any form, substring)" },
  { re: /\bmassive\b/i, why: "cash cross-check brand (whole word; conservative over-match on the adjective)" },
  // Case-SENSITIVE on purpose: the lower-case SVG element <polygon> and the CSS clip-path function polygon() are markup,
  // not a name (measured: Base UI ships clip-path polygon() in the /fleet and /products chunks); the capitalised word is
  // the brand — and a chain of the same name, which also reds on the storefront (declared limit).
  { re: /\bPolygon\b/, why: "cash cross-check former brand (capitalised whole word; a chain of the same name also reds on the storefront)" },
  { re: /polygon\.io/i, why: "cash cross-check API domain" },
  { re: /\b(?:POLYGON|DATABENTO)_API_KEY\b/, why: "data-source env-key name" },
];

// Binary exports carry no prose (fonts, images, OpenTimestamps proofs).
const BINARY_EXPORT = /\.(?:png|jpg|jpeg|gif|ico|webp|woff2?|ttf|otf|ots)$/i;

/** Decode `\xNN` / `\uNNNN` escapes, then blank every other backslash-letter escape (`\b`, `\s`, `\w`…), before a name
 *  scan: a regex source written `\bmassive\b` glues a letter to the name and evades a word-boundary scan (mutant V of the
 *  review of 2026-09-24, measured), and `d\x61tabento` spells the name without its letters. */
const neutralizeEscapes = (s: string): string =>
  s
    .replace(/\\x([0-9a-f]{2})/gi, (_m, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\u([0-9a-f]{4})/gi, (_m, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\[a-z]/gi, " ");

/** Every string of a parsed JSON value, keys included, depth-first. */
const jsonStrings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) jsonStrings(x, out);
  else if (v !== null && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      out.push(k);
      jsonStrings(x, out);
    }
  }
  return out;
};

// Data-source STEMS for the exported gate file (vocab-banned.json): matched as SUBSTRINGS, never behind a word boundary
// (a boundary form is what an escaped rule evades). No legitimate rule, reason or comment of that file needs them.
const DATA_SOURCE_STEMS: readonly RegExp[] = [/massive/i, /databento/i, /polygon/i];
// What a rule BANNING a data-source name would match, however the rule is spelled (escapes, character classes).
const DATA_SOURCE_MENTIONS: readonly string[] = ["Massive", "Databento", "Polygon", "polygon.io", "POLYGON_API_KEY", "DATABENTO_API_KEY"];

/** Data-source leaks in the TEXT of the exported gate file: its raw bytes and every parsed string (escapes neutralized)
 *  scanned for the stems, and every rule of every scope, compiled as the gate compiles it, tried on the mentions (a rule
 *  that reddens a mention publishes that name, whatever its spelling). Empty = clean. */
const gateFileDataSourceLeaks = (raw: string): string[] => {
  const hits: string[] = [];
  for (const stem of DATA_SOURCE_STEMS) if (stem.test(raw)) hits.push(`raw text carries ${String(stem)}`);
  const parsed = JSON.parse(raw) as { banned?: { re: string; why: string }[]; scan?: Record<string, { banned?: { re: string; why: string }[] }> };
  for (const s of jsonStrings(parsed)) {
    const n = neutralizeEscapes(s);
    for (const stem of DATA_SOURCE_STEMS) if (stem.test(n)) hits.push(`string ${JSON.stringify(s)} carries ${String(stem)}`);
  }
  const rules = [...(parsed.banned ?? []), ...Object.values(parsed.scan ?? {}).flatMap((scope) => scope.banned ?? [])];
  const patterns = compilePatterns(rules);
  for (const mention of DATA_SOURCE_MENTIONS) {
    if (scanText(`read from ${mention} today`, patterns, []).length > 0) hits.push(`a rule reddens the data-source mention ${mention}`);
  }
  return hits;
};

/** One PanelBlock of a panel source, by title: its declared status and its inner source, whitespace-collapsed. */
const panelBlock = (src: string, title: string): { status: string; inner: string } => {
  const m = new RegExp(`<PanelBlock title="${title}" status="(built|upcoming)">`).exec(src);
  assert.ok(m, `no PanelBlock titled "${title}"`);
  const start = m.index + m[0].length;
  const end = src.indexOf("</PanelBlock>", start);
  assert.ok(end > start, `PanelBlock "${title}" is not closed`);
  return { status: m[1] ?? "", inner: src.slice(start, end).replace(/\s+/g, " ") };
};

/** The property-key set of every object node of a JSON Schema (each `properties` map), depth-first. */
const propertyKeySets = (v: unknown, out: string[][] = []): string[][] => {
  if (Array.isArray(v)) for (const x of v) propertyKeySets(x, out);
  else if (v !== null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const props = o.properties;
    if (props !== null && typeof props === "object" && !Array.isArray(props)) out.push(Object.keys(props));
    for (const x of Object.values(o)) propertyKeySets(x, out);
  }
  return out;
};

/** The registered tools (and direction) whose input or output schema holds an object node carrying EVERY key of
 *  `required` — i.e. a projection of the frozen contract whose required list that is. */
const toolsCarrying = (required: readonly string[], tools: readonly { name: string; inputSchemaJson: unknown; outputSchemaJson: unknown }[]): string[] =>
  tools.flatMap((t) =>
    (
      [
        ["in", t.inputSchemaJson],
        ["out", t.outputSchemaJson],
      ] as const
    )
      .filter(([, schema]) => propertyKeySets(schema).some((keys) => required.every((k) => keys.includes(k))))
      .map(([dir]) => `${t.name}.${dir}`),
  );

test("registry_count_words_are_derived — agent, product and layer counts render through countWord over the register, never typed (R18, R20)", () => {
  // The helpers: exact words, fail-closed outside the list, English list prose.
  assert.equal(countWord(0), "zero");
  assert.equal(countWord(4), "four");
  assert.equal(countWord(12), "twelve");
  assert.throws(() => countWord(13), /no count word/, "a count past the word list must throw, never fall back to a digit");
  assert.throws(() => countWord(-1), /no count word/);
  assert.throws(() => countWord(1.5), /no count word/);
  assert.equal(capitalized("four"), "Four");
  assert.equal(listNames(["A"]), "A");
  assert.equal(listNames(["A", "B"]), "A and B");
  assert.equal(listNames(["A", "B", "C"]), "A, B and C");
  assert.throws(() => listNames([]), /at least one name/);
  // The register partitions: built + upcoming = the arrays (a status outside the pair would break the sum).
  assert.equal(builtAgents().length + upcomingAgents().length, FLEET_AGENTS.length);
  assert.equal(builtProducts().length + upcomingProducts().length, PRODUCTS.length);
  assert.deepEqual(builtAgents().map((a) => a.name), FLEET_AGENTS.filter((a) => a.status === "built").map((a) => a.name));

  // No count WORD typed in front of a counted noun, in the rendered text or the static metadata of the register pages.
  // Mutants: restore the h1 "A company of agents. Four built, seven on the roadmap." on /fleet, "The three engines" on
  // /fleet, "four tools" or "the first four schemas" on /roadmap, "one of three words" on / => red. A tool count may come
  // back only DERIVED (the served tool list, once a committed, hashed copy of it is read by the page).
  const TYPED_COUNT =
    /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:built|on the roadmap|named|agents|more named|frozen contracts|layers|engines|tools|schemas|words|upcoming products|artefacts)\b/i;
  for (const rel of REGISTER_PAGES) {
    const texts = [...renderedOf(rel), ...metadataDescriptionLiterals(rel)];
    const hits = texts.filter((t) => TYPED_COUNT.test(t.replace(/\s+/g, " ")));
    assert.deepEqual(hits, [], `${rel} types a count word instead of countWord(<register>.length): ${JSON.stringify(hits)}`);
    assert.match(read(rel), /\bcountWord\(/, `${rel} must spell its counts through countWord (lib/fleet.ts)`);
  }
  // The gate's answer words are counted from the frozen enum the page already loads (schemas/gate-decision.schema.json).
  assert.match(read("apps/site/app/page.tsx"), /one of\{" "\}\s*\{countWord\(actions\.length\)\} words/);
  // /fleet and /roadmap name the SAME engines: the /fleet review sentence matches /roadmap's phase one (no typed count).
  const ENGINES = "Hikae and Ukemi engines";
  for (const rel of ["apps/site/app/fleet/page.tsx", "apps/site/app/roadmap/page.tsx"]) {
    assert.ok(
      renderedOf(rel).some((t) => t.replace(/\s+/g, " ").includes(ENGINES)),
      `${rel} must name the engines as /roadmap's phase one does ("${ENGINES}")`,
    );
  }
  // The fleet and roadmap metadata descriptions are templates over the register, not typed sentences.
  for (const rel of ["apps/site/app/fleet/page.tsx", "apps/site/app/roadmap/page.tsx", "apps/site/app/products/page.tsx"]) {
    assert.match(read(rel), /description: `[^`]*\$\{/, `${rel}: the metadata description must interpolate its derived count/sentence`);
  }
});

test("products_page_routes_built_products_to_the_server_card — only upcoming products reach UpcomingPanel; a built product renders server-side with its served note and decided-later placeholders (R04, R06, R07, R08, R09, R19)", () => {
  const PAGE = "apps/site/app/products/page.tsx";
  const CARD = "apps/site/app/products/built-product-card.tsx";
  const page = read(PAGE);
  const card = read(CARD);

  // (a) Routing: upcoming products (no served wiring) to the client UpcomingPanel, built ones to the server card.
  assert.match(page, /const upcoming = upcomingProducts\(\);/);
  assert.match(page, /upcoming\.map\(\(p\) => \(\s*<UpcomingPanel key=\{p\.key\} product=\{p\} \/>/);
  assert.match(page, /const built = builtProducts\(\);/);
  assert.match(page, /built\.map\(\(p\) => \(\s*<BuiltProductCard /);
  assert.equal((page.match(/<UpcomingPanel\b/g) ?? []).length, 1, "UpcomingPanel is rendered from ONE place: the upcoming list");
  assert.doesNotMatch(page, /PRODUCTS\.map\(/, "the page must not hand every product (built ones included) to a client panel");

  // (b) The built card is a SERVER component (its product prop is never serialized) rendering the register fields.
  assert.doesNotMatch(card, /^\s*["']use client["']/m, "built-product-card.tsx must stay a server component");
  assert.match(card, /\{capitalized\(product\.served\.note\)\}/, "the card renders the digit-free served note (ADR-EC E6)");
  assert.match(card, /\{product\.fn\}/);
  assert.match(card, /\{product\.name\}/);
  assert.match(card, /<StatusBadge status=\{product\.status\}/);

  // (c) No "to be announced" on a built product; its named placeholders carry the decided-later state, never the
  // "upcoming" default of RegisterText next to a "built" pill (R06/R07). Mutant: render <RegisterText text={product.segment} /> => red.
  assert.ok(!renderedOf(CARD).some((t) => /to be announced/i.test(t)), "a built product never says 'to be announced'");
  assert.doesNotMatch(card, /<RegisterText\b/, "the card never uses RegisterText (its placeholder state defaults to upcoming)");
  assert.match(card, /const UNDECIDED: PlaceholderState = "to be decided";/);
  assert.match(card, /<Placeholder name=\{name\} state=\{UNDECIDED\} \/>/);

  // (d) What UpcomingPanel asserts of EVERY product it receives ("the same gate", "a wiring of fleet agents") holds for
  // every product the page sends it: each upcoming product is cleared by the shared gate.
  for (const p of upcomingProducts()) {
    assert.equal(p.wiring.gate, SHARED_GATE, `upcoming product ${p.name} must be cleared by the shared gate (UpcomingPanel says so)`);
  }

  // (e) The status sentence is derived from the register, and both the lede and the metadata use it.
  const sentence = productStatusSentence();
  for (const p of builtProducts()) assert.ok(sentence.includes(p.name), `the status sentence must name the built product ${p.name}`);
  // The sentence says no more than its predicate (every upcoming product's gate is the shared gate); it never claims
  // that each upcoming product wires a fleet agent besides the gate (three of them name none). Mutant: restore the tail
  // ": a wiring of fleet agents on the same gate" => red.
  assert.match(sentence, /every other application is upcoming, each cleared by the shared gate\.$/);
  assert.doesNotMatch(sentence, /wiring of fleet agents/);
  assert.match(page, /const PRODUCT_STATUS_SENTENCE = productStatusSentence\(\);/);
  assert.match(page, /description: `[^`]*\$\{PRODUCT_STATUS_SENTENCE\}`/);
  assert.ok(renderedOf(PAGE).some((t) => t.includes("sensors and the gate stay behind it.")), "lede carrier present (false-green guard)");
  assert.ok(!renderedOf(PAGE).some((t) => t.includes("MONARK Bell is built")), "the product status must not be typed in the lede");

  // (f) guard (2) shape on these two surfaces: no hard-coded status attribute.
  const hardCoded = /status\s*=\s*\{?\s*["'](?:built|upcoming)["']/;
  assert.doesNotMatch(page, hardCoded);
  assert.doesNotMatch(card, hardCoded);
});

test("register_pages_read_served_bell_facts_never_typed — / and /products read the LATEST signed record (head) through loadBellServed; the home no-close clause is conditioned on the head's sessions, never typed (R09, R10, R16; BELL-SERVED-HEAD-1, BELL-NOCLOSE-CLAUSE-1)", () => {
  const served = loadBellServed(ROOT);
  const literals = [
    served.first_record.published_at,
    served.first_record.line_hash,
    served.first_record.key_id,
    served.head.published_at,
    served.head.line_hash,
    served.bodies_sha256.timeline,
    served.bodies_sha256.state,
    served.bodies_sha256.pubkey,
  ];
  for (const rel of ["apps/site/app/page.tsx", "apps/site/app/products/page.tsx"]) {
    const text = read(rel);
    assert.match(text, /loadBellServed\(/, `${rel} must read the served facts through loadBellServed`);
    for (const lit of literals) assert.ok(!text.includes(lit), `${rel} types a served value by hand: ${lit}`);
    // The latest publication, never the first record (at seq 2 the first record would be stale). Mutant: read
    // first_record again => red.
    assert.doesNotMatch(text, /\bfirst_record\b|\bfirst_run\b/, `${rel} reads the first record instead of the latest publication`);
  }
  const home = read("apps/site/app/page.tsx");
  assert.match(home, /\{bellServed\.head\.published_at\}/, "the home Bell card renders the latest signed record's publication instant");
  const products = read("apps/site/app/products/page.tsx");
  assert.match(products, /const record = loadBellServed\(bellServedRepoRoot\(\)\)\.head;/);
  assert.match(products, /\$\{record\.published_at\}/, "the /products Bell card renders the latest signed record's publication instant");
  assert.doesNotMatch(products, /\.runs\b|\.sessions\b/, "/products reads nothing of the served run layout");
  // The no-close clause of the home sensors card is said exactly while no session of the latest publication carries a
  // gap (a gap needs a closing price): conditioned on the head's own sessions, never typed unconditionally. Mutants:
  // drop the condition, or condition it on the first record => red.
  assert.match(home, /const noGapYet = bellServed\.head\.runs\.every\(\(r\) => r\.sessions\.every\(\(s\) => s\.gT === null\)\);/);
  assert.match(home, /\{noGapYet \? <>, whose gap needs a closing price that its latest publication does not carry<\/> : null\}/);
  assert.equal((home.match(/whose gap needs a closing price/g) ?? []).length, 1, "the clause is written once, inside the condition");
  assert.ok(!renderedOf("apps/site/app/page.tsx").some((t) => /closing price that its first record/i.test(t)), "no first-record wording");
  // Today's served head: the value the condition reads (the clause is rendered iff it is true).
  const noGap = served.head.runs.every((r) => r.sessions.every((s) => s.gT === null));
  assert.equal(typeof noGap, "boolean");
});

test("home_cards_read_the_register_and_the_served_text — Bell card = register fn + served note, Ukemi card = register line + the served gate sentence, no arrow into Ukemi (R12, R23, R28)", () => {
  const HOME = "apps/site/app/page.tsx";
  const home = read(HOME);
  const texts = renderedOf(HOME);
  assert.match(home, /<p className="c-muted">\{bell\.fn\}<\/p>/, "the Bell card renders the register function, not a typed copy");
  assert.match(home, /\{capitalized\(bell\.served\.note\)\}/, "the Bell card renders the register's served note");
  // The Ukemi card: the register's tagline, then the served class it is gated on (committed, hashed served record), then
  // the served gate's own sentence while the served registry is empty (byte-identical, lib/ukemi-copy.ts). Mutants: type
  // the tagline or the class, or say the sentence unconditionally => red.
  assert.match(home, /<p className="c-muted">\{ukemiAgent\.line\}<\/p>/, "the Ukemi card's tagline is the register line");
  assert.match(home, /served class · \{ukemiServed\.served_class\}/, "the served class is read from the committed served record");
  assert.match(
    home,
    /\{ukemiServed\.registry_state === "empty" \? \(\s*<p className="c-muted c-small">On the served gate today: \{LIQ_EMPTY_REGISTRY_SENTENCE\}\.<\/p>\s*\) : null\}/,
    "the served gate's own sentence rides while the served registry is empty",
  );
  const ukemi = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  assert.equal(ukemi?.line, "Liquidation coverage, gated.", "the register tagline of Ukemi (decision of the owner, 2026-09-24)");
  // The contract tags of the pipeline are the frozen schemas' own titles, never typed. Mutant: type <span>AttestedFlow</span>.
  for (const title of ["AttestedPrice", "AttestedFlow", "CoverageVerdict", "GateDecision", "Prediction"]) {
    assert.doesNotMatch(home, new RegExp(`>${title}<`), `the home page types the contract name ${title}`);
  }
  assert.match(home, /loadContract\(root, "attested-flow\.schema\.json", "Narabi"\)\.title/);
  // The acts card names the register's first built act, never a typed name or a typed class.
  assert.match(home, /const firstAct = builtAgents\(\)\.find\(\(a\) => a\.role === "act"\);/);
  for (const stale of [
    "conformal region with its named residuals, per stratum",
    "while U.S. markets are",
    "Five frozen contracts",
    "off-hours record",
    "Liquidation-cascade survival",
    "ships and runs daily",
  ]) {
    assert.ok(!texts.some((t) => t.includes(stale)), `stale home copy is back: ${JSON.stringify(stale)}`);
  }
  assert.ok(!texts.some((t) => /→\s*Ukemi\b/.test(t)), "no arrow into Ukemi: the served pipe is cascade → gate, Ukemi upstream (ADR-W1 D4)");
  assert.ok(
    texts.some((t) => t.includes("built and served piece by piece and composed on the gate path")),
    "the home page carries the accepted ADR-W1 D4 wording",
  );
  const bell = PRODUCTS.find((p) => p.key === "bell");
  assert.ok(bell, "MONARK Bell is in the register");
  assert.match(bell.fn, /\bin particular while U\.S\. markets are closed\b/, "the register function covers the whole trading day, off-hours in particular (R12)");
});

test("frozen_contracts_count_is_derived — / and /roadmap spell the schemas/ count; the unserved contract is named from its schema and no served harness module loads it (R21, R22)", () => {
  const onDisk = readdirSync(join(ROOT, "schemas")).filter((n) => n.endsWith(".schema.json")).sort();
  const listed = listFrozenContracts(ROOT);
  assert.deepEqual(listed.map((c) => c.file), onDisk, "the listing is exactly schemas/*.schema.json");
  const manifest = JSON.parse(read("test/contracts-frozen.manifest.json")) as Record<string, string>;
  const frozen = Object.keys(manifest)
    .filter((k) => /^schemas\/[^/]+\.schema\.json$/.test(k))
    .map((k) => k.slice("schemas/".length))
    .sort();
  assert.deepEqual(onDisk, frozen, "every schema file is byte-frozen by test/contracts-frozen.manifest.json, and only those");
  for (const c of listed) {
    const schema = JSON.parse(read(`schemas/${c.file}`)) as { title?: string };
    assert.equal(c.title, schema.title, `${c.file}: the listed title is the schema's own`);
  }

  const summary = frozenContractsSummary(ROOT);
  assert.equal(summary.count, onDisk.length);
  // The unserved contract exists and NO served harness path names or carries it. Two tripwires, each fail-closed:
  //   (1) by NAME in apps/harness/src: its schema file name, its kebab stem, or its schema TITLE as a substring — the
  //       title also catches the adapters and the type that carry it (fromAttestedBook, toAttestedBook,
  //       serializeAttestedBook, `import type { AttestedBook }`), since a harness tool could serve the contract through
  //       the monark package without ever naming the file. Mutant: a harness tool that imports fromAttestedBook => red.
  //   (2) by SHAPE in the registered tool schemas (the served tools/list and OpenAPI projections): no input or output
  //       schema holds an object node carrying every required key of the contract. The same detector FINDS every served
  //       contract (positive control below), so a projection of the unserved one cannot pass unseen. Mutant: a tool whose
  //       input carries the contract's properties => red.
  // DECLARED OVER-MATCH (fail-closed-safe): a mention in a comment reds too; such a red asks for a review of the qualifier,
  // never a silent pass. DECLARED LIMITS: a contract served OUTSIDE apps/harness (a published file, like Narabi's) is not
  // seen here; neither is a harness path that hides both the names and a full projection (an alias re-export carrying a
  // subset of the keys) — such a path does not serve the frozen contract as frozen.
  const harnessSrc = readdirSync(join(ROOT, "apps", "harness", "src"), { recursive: true })
    .map(String)
    .filter((n) => n.endsWith(".ts"))
    .map((n) => readFileSync(join(ROOT, "apps", "harness", "src", n), "utf8"))
    .join("\n");
  assert.ok(harnessSrc.includes("loadFrozen("), "the harness projection is scanned (false-green guard)");
  assert.ok(HARNESS_TOOLS.length > 0, "the registered tools are scanned (false-green guard)");
  const requiredOf = (file: string): string[] => (JSON.parse(read(`schemas/${file}`)) as { required?: string[] }).required ?? [];
  // Positive control on the REAL projections: every contract the harness serves is found by the shape detector.
  for (const served of ["prediction.schema.json", "attested-price.schema.json", "coverage-verdict.schema.json", "gate-decision.schema.json"]) {
    assert.ok(onDisk.includes(served), `${served} is a frozen schema (control fixture)`);
    assert.ok(toolsCarrying(requiredOf(served), HARNESS_TOOLS).length > 0, `the shape detector must find the served contract ${served} (detector is load-bearing)`);
  }
  for (const file of UNSERVED_CONTRACT_FILES) {
    assert.ok(onDisk.includes(file), `declared unserved ${file} is not a frozen schema`);
    const title = listed.find((c) => c.file === file)?.title ?? "";
    const stem = file.replace(/\.schema\.json$/, "");
    assert.ok(title.length > 0 && stem.length > 0, `${file}: title and stem are read (false-green guard)`);
    for (const name of [file, stem, title]) {
      assert.ok(!harnessSrc.includes(name), `the served harness names ${name}: the contract may be served — drop ${file} from UNSERVED_CONTRACT_FILES after review`);
    }
    const carriers = toolsCarrying(requiredOf(file), HARNESS_TOOLS);
    assert.deepEqual(carriers, [], `a registered tool schema carries every required key of ${file} (${carriers.join(", ")}): drop it from UNSERVED_CONTRACT_FILES after review`);
    // Mutant (in memory): a tool whose input carries the contract's properties is found.
    const bookProps = (JSON.parse(read(`schemas/${file}`)) as { properties?: Record<string, unknown> }).properties ?? {};
    const mutantTool = { name: "mutant", inputSchemaJson: { type: "object", properties: { book: { type: "object", properties: bookProps } } }, outputSchemaJson: {} };
    assert.deepEqual(toolsCarrying(requiredOf(file), [mutantTool]), ["mutant.in"], "the shape tripwire must red on a projection of the unserved contract");
  }
  assert.deepEqual(
    summary.unservedTitles,
    UNSERVED_CONTRACT_FILES.map((f) => listed.find((c) => c.file === f)?.title),
    "the unserved titles are read from their schema files",
  );

  for (const rel of ["apps/site/app/page.tsx", "apps/site/app/roadmap/page.tsx"]) {
    const text = read(rel);
    assert.match(text, /frozenContractsSummary\(/, `${rel} must read the frozen-contract summary`);
    assert.match(text, /countWord\(contracts\.count\)/, `${rel} must spell the count through countWord`);
    const hits = renderedOf(rel).filter((t) => /\bfrozen contracts\b/i.test(t) && /\b(?:four|five|six|seven|eight)\b/i.test(t));
    assert.deepEqual(hits, [], `${rel} types the frozen-contract count: ${JSON.stringify(hits)}`);
    assert.ok(!renderedOf(rel).some((t) => /\bthe sixth\b/i.test(t)), `${rel} types an ordinal for the unserved contract`);
  }
});

test("roadmap_built_list_renders_served_notes_and_links_panels_on_fleet — {a.wiring.note} rendered; panel links go to /fleet#panels, where /fleet renders a panel for every built agent (R03, R40)", () => {
  const ROADMAP = "apps/site/app/roadmap/page.tsx";
  const roadmap = read(ROADMAP);
  assert.match(roadmap, /\{a\.wiring\.note\}/, "/roadmap must RENDER each built agent's served note (ADR-EC E6)");
  assert.doesNotMatch(roadmap, /["']\/#fleet["']/, "no link to the home strip labelled as a panel (the panels live on /fleet)");
  assert.ok(!renderedOf(ROADMAP).some((t) => /home page/i.test(t)), "/roadmap must not send panels to the home page");
  assert.match(roadmap, /href=\{PANELS_HREF\}/);
  const agentPagesSrc = read("apps/site/app/fleet/agent-pages.ts");
  assert.match(agentPagesSrc, /export const PANELS_HREF = "\/fleet#panels";/);
  // The link labels shared by /fleet and /roadmap never say "live" used bare (the Terms' "Words we do not use": not a
  // real-time promise; say "published"). Mutant: restore "see it live →" => red.
  const labels = [...agentPagesSrc.matchAll(/label: "([^"]*)"/g)].map((m) => m[1] ?? "");
  assert.ok(labels.length >= 3, "the agent-page labels are read (false-green guard)");
  assert.deepEqual(labels.filter((l) => /\blive\b/i.test(l)), [], "an agent-page label says 'live' bare");
  assert.ok(labels.includes("see the published timeline →"), "Narabi's surface is named as published, on a schedule");

  const fleet = read("apps/site/app/fleet/page.tsx");
  assert.match(fleet, /<section className="c-section" id="panels"/, "/fleet carries the #panels section the links target");
  for (const a of builtAgents()) {
    const component = a.name.normalize("NFD").replace(/[̀-ͯ]/g, "") + "Panel";
    assert.match(fleet, new RegExp(`<${component}\\b`), `/fleet renders no panel for the built agent ${a.name} (the roadmap link would point to nothing)`);
  }
});

test("registry_notes_track_served_descriptions — the register notes, the served-state lines of / and /fleet and the Hikae and Shōgen panels restate the served tool descriptions, in both directions (R26, R27, R30, R31)", () => {
  const hikae = builtAgents().find((a) => a.name === "Hikae");
  const ukemi = builtAgents().find((a) => a.name === "Ukemi");
  assert.ok(hikae && ukemi, "Hikae and Ukemi are built register agents");
  const flat = (rel: string): string => renderedOf(rel).join(" ").replace(/\s+/g, " ");

  // Hikae: the demonstration class runs on a committed synthetic calibration — said on the site iff the served gate says
  // it, in the register note AND in the panel (Honest limits). Mutant: drop the clause from the served description (or
  // from the panel) => red.
  const FIXTURE = "a plumbing fixture, not a measured predictor";
  assert.equal(
    hikae.wiring.note.includes(FIXTURE),
    GATE_TOOL_DESCRIPTION.includes(FIXTURE),
    "Hikae's note must carry the synthetic-fixture clause exactly while the served gate description carries it",
  );
  assert.ok(GATE_TOOL_DESCRIPTION.includes(FIXTURE), "today the served gate declares its demonstration calibration synthetic");
  const hikaePanel = flat("apps/site/components/hikae-panel.tsx");
  assert.equal(hikaePanel.includes(FIXTURE), GATE_TOOL_DESCRIPTION.includes(FIXTURE), "the Hikae panel carries the fixture clause exactly while the served gate does");
  assert.equal(
    hikaePanel.includes("declared synthetic"),
    GATE_TOOL_DESCRIPTION.includes("declared synthetic"),
    "the Hikae panel says 'declared synthetic' exactly while the served gate does",
  );

  // Ukemi: the cascade tool is transitional — the EXACT digit-free clause is said iff the served cascade description
  // declares the tool replaced, and no successor is named while none is served. Mutants: "a transitional tool to be
  // replaced by a served producer…" (the round-one wording) or the clause dropped while served => red.
  const UKEMI_CLAUSE = "through the cascade tool, a transitional tool, to be replaced;";
  const servedTransitional = /\bThis cascade tool is v0, replaced at\b/.test(CASCADE_TOOL_DESCRIPTION);
  assert.equal(ukemi.wiring.note.includes(UKEMI_CLAUSE), servedTransitional, "Ukemi's note carries the exact transitional clause exactly while the served cascade tool is declared replaced");
  assert.equal(/\btransitional\b/.test(ukemi.wiring.note), servedTransitional, "no other 'transitional' wording rides in Ukemi's note");
  assert.doesNotMatch(ukemi.wiring.note, /\bproducer\b|\bsuccessor\b|\breplaced by\b/i, "no successor is named on the site while the served text names none");
  assert.ok(servedTransitional, "today the served cascade description declares the tool replaced at a later step");

  // Ukemi's served state on / and /fleet: "On the served gate today: <sentence>" is rendered exactly while the served
  // gate description carries that sentence (the site copy is byte-identical to the harness constant, lib/ukemi-copy.ts).
  // Mutant: the served description stops carrying it (a liquidation calibration is committed) => red until both pages
  // change.
  const servedLiq = GATE_TOOL_DESCRIPTION.includes(SITE_LIQ_SENTENCE);
  const home = read("apps/site/app/page.tsx");
  const fleet = read("apps/site/app/fleet/page.tsx");
  assert.equal(/On the served gate today: \{LIQ_EMPTY_REGISTRY_SENTENCE\}\./.test(home), servedLiq, "/ renders the served liquidation sentence exactly while the served gate carries it");
  assert.equal(
    /Ukemi: LIQ_EMPTY_REGISTRY_SENTENCE,/.test(fleet) && /On the served gate today: \{servedState\}\./.test(fleet),
    servedLiq,
    "/fleet renders the served liquidation sentence exactly while the served gate carries it",
  );
  assert.ok(servedLiq, "today the served gate description carries the empty-registry sentence");

  // Shōgen's panel (Honest limits): one committed, self-notarized witness — said iff the served attest description says it.
  const shogenPanel = flat("apps/site/components/shogen-panel.tsx");
  assert.equal(shogenPanel.includes("self-notarized"), ATTEST_TOOL_DESCRIPTION.includes("self-notarized"), "the Shōgen panel says 'self-notarized' exactly while the served attest tool does");
  assert.equal(
    shogenPanel.includes("one committed witness"),
    /\ba committed Shōgen-verified witness\b/.test(ATTEST_TOOL_DESCRIPTION),
    "the Shōgen panel says 'one committed witness' exactly while the served attest tool projects a committed witness",
  );
});

test("built_panels_keep_served_facts_in_built_blocks — a served fact sits in a built block; 'Living proof' stays upcoming and says only what is not shown yet (H8 of the review of 2026-09-24)", () => {
  for (const rel of ["apps/site/components/shogen-panel.tsx", "apps/site/components/hikae-panel.tsx"]) {
    const src = read(rel);
    const living = panelBlock(src, "Living proof");
    assert.equal(living.status, "upcoming", `${rel}: Living proof stays upcoming`);
    assert.doesNotMatch(living.inner, /\b(?:served|already|committed)\b/i, `${rel}: an upcoming block must not state a served fact (mutant: move the served sentence back)`);
    const limits = panelBlock(src, "Honest limits");
    assert.equal(limits.status, "built", `${rel}: Honest limits is a built block`);
  }
  assert.ok(panelBlock(read("apps/site/components/hikae-panel.tsx"), "Honest limits").inner.includes("a plumbing fixture, not a measured predictor"));
  assert.ok(panelBlock(read("apps/site/components/shogen-panel.tsx"), "Honest limits").inner.includes("self-notarized"));
});

test("shogen_panel_restates_the_served_attest_limit — 'the verifier is not executed at call time' said while served, the venue never named; no committed sample left 'to be announced' (R31, R32, R34)", () => {
  const CLAUSE = "the verifier is not executed at call time";
  const SHOGEN = "apps/site/components/shogen-panel.tsx";
  const HIKAE = "apps/site/components/hikae-panel.tsx";
  const shogenText = renderedOf(SHOGEN).join(" ").replace(/\s+/g, " ").toLowerCase();
  assert.equal(
    shogenText.includes(CLAUSE),
    ATTEST_TOOL_DESCRIPTION.toLowerCase().includes(CLAUSE),
    "the Shōgen panel restates the served attest limit exactly while the served description carries it",
  );
  assert.ok(shogenText.includes(CLAUSE), "today the served attest tool does not execute the verifier at call time");
  // The served description names a venue; the storefront restates it without the venue (vocab gate + this carrier check).
  assert.ok(/binance/i.test(ATTEST_TOOL_DESCRIPTION), "fixture check: the served text names the venue this panel must not");
  assert.ok(!/binance|btcusdt/i.test(read(SHOGEN)), "the Shōgen panel names no venue");
  for (const rel of [SHOGEN, HIKAE]) {
    assert.ok(!renderedOf(rel).some((t) => /to be announced/i.test(t)), `${rel}: a committed sample the served tool already projects is not 'to be announced'`);
  }
});

test("built_panel_status_is_handed_from_the_register — the Shōgen and Hikae cards take status from /fleet, which reads the register; the client panels never import it (R37, R04)", () => {
  for (const rel of ["apps/site/components/shogen-panel.tsx", "apps/site/components/hikae-panel.tsx"]) {
    const text = read(rel);
    const ac = text.indexOf("<AgentCard");
    assert.ok(ac >= 0, `${rel} renders an AgentCard (false-green guard)`);
    const fromStatus = text.slice(text.indexOf("status", ac));
    assert.match(fromStatus, /^status=\{status\}/, `${rel}: the AgentCard status must be the handed-in prop, never a literal`);
    assert.doesNotMatch(text, /from ["']@\/lib\/fleet["']/, `${rel}: a client panel must not import the register (its served wiring would ride in the client bundle)`);
  }
  const fleet = read("apps/site/app/fleet/page.tsx");
  assert.match(fleet, /<ShogenPanel contract=\{attestedContract\} status=\{statusOf\("Shōgen"\)\} \/>/);
  assert.match(fleet, /<HikaePanel contract=\{coverageContract\} status=\{statusOf\("Hikae"\)\} \/>/);
  assert.match(fleet, /function statusOf\(name: string\)[^{]*\{\s*const a = FLEET_AGENTS\.find\(/, "statusOf reads the register");
});

test("ukemi_inside_points_never_say_interval — Ukemi's 'What's inside' and the products that inherit its engine say region; the abstention is stated (R29)", () => {
  const ukemi = insideFor("ukemi");
  const inheriting = Object.entries(INSIDE).filter(([, b]) => b.points.some((p) => p.includes("Ukemi")));
  assert.ok(inheriting.length >= 1, "at least one product inherits Ukemi's engine (false-green guard)");
  for (const [key, block] of [["ukemi", ukemi] as const, ...inheriting]) {
    for (const point of block.points) assert.doesNotMatch(point, /interval/i, `INSIDE.${key}: "${point}" (A-9: never an interval for Ukemi)`);
  }
  assert.ok(ukemi.points.some((p) => p.includes("until then it abstains by construction")), "Ukemi's point states the served abstention");
});

test("vocab_site_scope_bans_operator_and_venue_names — operator and venue names and an arrow into Ukemi redden in apps/site; data-source names stay OUT of the exported gate file; declared limits asserted (VOCAB-PROVIDERS-SITE-1, R23, R34, R50)", () => {
  const raw = read("vocab-banned.json");
  const cfg = JSON.parse(raw) as {
    banned: { re: string; why: string }[];
    scan: { site: { banned: { re: string; why: string }[]; exemptPhrases: string[] } };
  };
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.site.banned)];
  const phrases = cfg.scan.site.exemptPhrases;
  const red = (s: string): boolean => scanText(s, patterns, phrases).length > 0;
  for (const name of ["helius", "Helius", "chainstack", "Chainstack", "tenderly", "binance", "Binance"]) {
    assert.ok(red(`read through ${name} today`), `'${name}' must redden the site vocab gate`);
  }
  // The exported gate file names NO data source (decision 69, C-9: listing one would publish it); those names are policed
  // by site_names_no_data_source below, whose literals live in this non-exported file. HARDENED oracle
  // (gateFileDataSourceLeaks): the raw bytes and every parsed string are scanned for the stems as SUBSTRINGS, escapes
  // neutralized, and every rule of every scope is compiled as the gate compiles it and tried on data-source mentions —
  // so the natural rule form `\bmassive\b` (written "\\bmassive\\b" in the JSON), which evaded the round-one boundary
  // scan (mutant V, measured), reds, and so do an escaped spelling, a unicode-escaped comment and a character class.
  assert.deepEqual(gateFileDataSourceLeaks(raw), [], "vocab-banned.json (exported) must not carry a data-source name (C-9)");
  const mutate = (edit: (c: { scan: { site: { banned: { re: string; why: string }[] } } }) => void): string => {
    const c = JSON.parse(raw) as { scan: { site: { banned: { re: string; why: string }[] } } };
    edit(c);
    return JSON.stringify(c, null, 2);
  };
  const mutants: [string, string][] = [
    ["V: a regex-escaped whole-word rule", mutate((c) => c.scan.site.banned.push({ re: "\\bmassive\\b", why: "MUTANT" }))],
    ["V2: a hex-escaped spelling", mutate((c) => c.scan.site.banned.push({ re: "d\\x61tabento", why: "MUTANT" }))],
    ["V3: a character class", mutate((c) => c.scan.site.banned.push({ re: "[P]olygon", why: "MUTANT" }))],
    ["V4: a unicode-escaped comment", raw.replace(/^\{/, () => '{\n  "$comment_mutant": "\\u004dassive",')],
  ];
  for (const [label, text] of mutants) {
    assert.notDeepEqual(gateFileDataSourceLeaks(text), [], `mutant ${label} must red the exported-gate-file oracle`);
  }
  // Word boundaries keep longer words green.
  for (const green of ["untenderly", "chainstacks of paper", "heliusm"]) {
    assert.ok(!red(green), `'${green}' must stay green (word boundary)`);
  }
  // Declared limit (case-insensitive gate): the English adverb reddens too — asserted, not hidden.
  assert.ok(red("held tenderly"), "declared limit: the adverb 'tenderly' reddens");
  // R23: an arrow INTO Ukemi reddens; the real pipe and outbound arrows stay green.
  assert.ok(red("First vertical: Shōgen → Hikae → Ukemi."), "the arrow chain into Ukemi must redden (ADR-W1 D4)");
  assert.ok(red("the gate →Ukemi"), "an unspaced arrow into Ukemi must redden");
  for (const green of ["feeds the gate (cascade → gate), not execute", "Ukemi → the gate", "/ukemi →"]) {
    assert.ok(!red(green), `'${green}' must stay green`);
  }
  // Steady state: every rendered apps/site surface is clean under the full site scope (mirror of npm run gate:vocab).
  const SKIP = new Set(["node_modules", ".next", ".turbo", "test", "data", "dist"]);
  const hits: string[] = [];
  const walk = (abs: string, rel: string): void => {
    for (const name of readdirSync(abs)) {
      if (SKIP.has(name)) continue;
      const a = join(abs, name);
      const r = `${rel}/${name}`;
      if (statSync(a).isDirectory()) walk(a, r);
      else if (/\.(?:ts|tsx|mdx)$/.test(name) && scanText(readFileSync(a, "utf8"), patterns, phrases).length > 0) hits.push(r);
    }
  };
  walk(join(ROOT, "apps", "site"), "apps/site");
  assert.deepEqual(hits, [], `apps/site surfaces redden the site vocab scope: ${hits.join(", ")}`);
});

test("site_names_no_data_source — no data-source name form in ANY exported apps/site file, rendered surface or committed data; the literals stay in this non-exported file (VOCAB-PROVIDERS-SITE-1, R13, R50; decision 69 / C-9)", () => {
  const kept = collectFiles(ROOT).kept;
  // The literals below must never be exported (else they would publish the names they ban).
  assert.ok(!kept.some((f) => f.rel.startsWith("test/")), "no repo-root test/ file may be exported");
  const siteFiles = kept.filter((f) => f.rel.startsWith("apps/site/") && !BINARY_EXPORT.test(f.rel));
  assert.ok(siteFiles.length >= 50, `implausibly few exported apps/site text files (${String(siteFiles.length)}) — false green?`);
  // Each file is scanned as written AND with its escapes neutralized: a regex source `\bmassive\b` or an escaped spelling
  // in site code would otherwise glue a letter to the name and pass a word-boundary form (mutant V, measured).
  const hits: string[] = [];
  for (const f of siteFiles) {
    const raw = readFileSync(f.abs, "utf8");
    const views = [raw, neutralizeEscapes(raw)];
    for (const form of DATA_SOURCE_FORMS) if (views.some((v) => form.re.test(v))) hits.push(`${f.rel} [${form.why}]`);
  }
  assert.deepEqual(hits, [], `a data-source name form on an exported apps/site file:\n${hits.join("\n")}`);
  // Positive control for the escape path: a regex source in site code evades the raw scan, not the neutralized one.
  const esc = String.fromCharCode(92);
  const escapedSource = `const re = /${esc}bmassive${esc}b/;`;
  const wholeWord = DATA_SOURCE_FORMS.find((form) => form.re.source.includes("massive"));
  assert.ok(wholeWord, "the whole-word form is defined (false-green guard)");
  assert.ok(!wholeWord.re.test(escapedSource), "fixture check: the raw text of an escaped rule evades the whole-word form");
  assert.ok(wholeWord.re.test(neutralizeEscapes(escapedSource)), "the neutralized view must catch the escaped rule (mutant V)");
  // Positive controls: each form, alone, reds (the scan is load-bearing per form). Mutant: a card that says where the
  // close is read ("read from Databento") => red above.
  const samples = [
    "the close is read from Databento",
    "cross-checked against Massive",
    "the Polygon feed",
    "provider: 'polygon.io'",
    "no DATABENTO_API_KEY set",
  ];
  DATA_SOURCE_FORMS.forEach((form, i) => {
    assert.ok(form.re.test(samples[i] ?? ""), `positive control ${String(i)} must match ${String(form.re)}`);
  });
  // Negative controls: longer words and lower-case markup stay green.
  for (const green of ["a polygonal mark", "a large redemption window", "clipPath: \"polygon(0 0, 100% 0)\"", "<polygon points=\"0,0 1,1\" />"]) {
    assert.ok(!DATA_SOURCE_FORMS.some((form) => form.re.test(green)), `'${green}' must stay green`);
  }
});

test("footer_and_writing_status_words — the footer repeats no status word; /writing keeps its page status as a text pill, never StatusBadge (R44, R46; G1-lot-fsite-8 §5)", () => {
  const footer = renderedOf("apps/site/components/site-footer.tsx");
  assert.ok(footer.some((t) => t.includes("Console")), "the console link is still rendered (false-green guard)");
  assert.ok(!footer.some((t) => /\b(?:upcoming|built)\b/i.test(t)), "the footer carries no status word (a page carries its own)");
  // A page is not a fleet agent: its status is a TEXT pill ("First note: Upcoming", like /console's "Upcoming"), never the
  // typed AgentStatus badge (docs/G1-lot-fsite-8.md §5, spirit of C-7). Mutant: render <StatusBadge status="upcoming" />
  // on /writing => red.
  const writing = read("apps/site/app/writing/page.tsx");
  assert.doesNotMatch(writing, /\bStatusBadge\b/, "/writing must not use the fleet-agent StatusBadge for a page status");
  assert.ok(renderedOf("apps/site/app/writing/page.tsx").some((t) => t.includes("First note: Upcoming")), "/writing carries its text pill");
});

test("fleet_page_reads_products_and_served_state — the products sentence is derived; Ukemi's card carries the served gate sentence; Narabi's the served-timeline freshness line (R08, R27, R38)", () => {
  const FLEET = "apps/site/app/fleet/page.tsx";
  const fleet = read(FLEET);
  const texts = renderedOf(FLEET);
  assert.ok(!texts.some((t) => /Products are wirings of these agents/.test(t)), "stale: Bell is not a wiring of fleet agents");
  assert.ok(!texts.some((t) => t.includes("MONARK Bell is listed there")), "the built product is named from the register");
  assert.match(fleet, /const productsBuilt = builtProducts\(\)\.map\(\(p\) => p\.name\);/);
  assert.match(fleet, /const upcomingOnSharedGate = productsUpcoming\.every\(\(p\) => p\.wiring\.gate === SHARED_GATE\);/);
  assert.match(fleet, /\{productsUpcoming\.length > 0 && upcomingOnSharedGate \?/);
  // The sentence says what its predicate backs ("each cleared by the shared gate"), not that each upcoming product wires
  // fleet agents (three of them name none besides the gate). Mutant: restore "each a wiring of fleet agents" => red.
  assert.ok(texts.some((t) => t.includes("upcoming applications are each cleared by the shared gate.")), "the upcoming-applications sentence is rendered");
  assert.ok(!texts.some((t) => /wiring of fleet agents/.test(t)), "/fleet does not claim each upcoming product wires fleet agents");
  // "live" used bare reads as a real-time promise (the Terms' "Words we do not use"); the page's own copy never uses it,
  // even as a verb. Mutant: "Products live on /products" => red.
  assert.ok(!texts.some((t) => /\blive\b/i.test(t)), "/fleet's own copy says 'live' bare");
  assert.match(fleet, /Ukemi: LIQ_EMPTY_REGISTRY_SENTENCE,/);
  assert.match(fleet, /On the served gate today: \{servedState\}\./);
  assert.match(fleet, /const servedState = ukemiServed\.registry_state === "empty" \? SERVED_STATE\[a\.name\] : undefined;/);
  assert.match(fleet, /<NarabiFreshness schedule=\{narabiFreshness\.schedule\} capture=\{narabiFreshness\.capture\} \/>/);
  // The engines are described as /roadmap describes them, and nothing says how the work was reviewed.
  assert.ok(texts.some((t) => t.includes("Hikae and Ukemi engines complete; interface frozen.")), "/fleet uses /roadmap's engine sentence");
  assert.ok(!texts.some((t) => /independent review|ships and runs daily/i.test(t)), "/fleet keeps no retired engine or liveness wording");
});

test("narabi_freshness_island_judges_lateness_against_the_served_schedule_and_declares_the_capture — / and /fleet read the published files, judge a late window as /narabi does, and show the committed capture declared as such (R38, R39; NARABI-LAG-REGISTRY-1, NARABI-ISLAND-CAPTURE-1)", () => {
  const island = read("apps/site/app/fleet/narabi-freshness.tsx");
  const props = read("apps/site/app/fleet/narabi-freshness-props.ts");
  assert.match(island, /^"use client";/);
  assert.match(island, /sameOriginText\(STATE_PATH\)/);
  assert.match(island, /sameOriginText\(TIMELINE_PATH\)/);
  // Lateness is judged by the /narabi page's own functions (lagView, liveWord) against the schedule handed in.
  assert.match(island, /const \{ lag \} = lagView\(data, schedule\);/);
  assert.match(island, /liveWord\(data, lag\)/);
  // The client island imports react and lib/narabi-live only (values and types); the capture reaches it as three facts,
  // never as its body, and no endpoint list ever does. Mutant: import the capture loader here => red.
  const imports = [...island.matchAll(/^import[\s\S]*?from "([^"]+)";/gm)].map((m) => m[1] ?? "");
  assert.deepEqual([...new Set(imports)].sort(), ["@/lib/narabi-live", "react"], "the island imports react and lib/narabi-live only");
  // The CODE of the island (comments stripped: its header names the server loaders it does not import).
  const islandCode = island.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(islandCode, /narabi-snapshot|NARABI_SNAPSHOT|narabi-capture-load|loadNarabiCapture|narabi-served-load|loadNarabiServed/);
  assert.doesNotMatch(islandCode, /\bendpoints\b|endpointsUnion|timelineJsonl|stateJson/, "the island never reads the operator host list nor a stored body");
  // No typed hour: the schedule is the committed served record read server-side (the same facts /narabi judges against).
  assert.doesNotMatch(islandCode, /\b\d{1,2}:\d{2}\b/, "no typed hour in the island");
  assert.doesNotMatch(props, /^\s*["']use client["']/m, "the props are built server-side");
  assert.match(props, /const served = loadNarabiServed\(rootDir\);/);
  assert.match(props, /on_calendar_utc: served\.sentinel_timer\.on_calendar_utc,/);
  assert.match(props, /deadline_utc: served\.probe\.deadline_utc,/);
  assert.match(props, /const snap = loadNarabiCapture\(rootDir\);/);
  // Declared capture: its facts render with its date; on a capture the lateness is unknown (never attributed).
  const rendered = renderedOf("apps/site/app/fleet/narabi-freshness.tsx").join(" ").replace(/\s+/g, " ");
  assert.ok(rendered.includes("committed capture of"), "the capture is declared as such");
  assert.ok(rendered.includes("whether a window is late is unknown"), "on a capture the lateness is unknown");
  // Mutant "02:00": the judgement follows the served deadline. On the committed capture's last window, at 03:00 UTC of the
  // day its next window is due, the served deadline says "not late" and a typed 02:00 deadline would say "late".
  const served = loadNarabiServed(ROOT);
  const lines = parseTimeline(loadNarabiCapture(ROOT).timelineJsonl);
  const last = lines[lines.length - 1];
  assert.ok(last !== undefined, "the capture carries at least one window (false-green guard)");
  const at = new Date(`${addDays(last.day, 2)}T03:00:00Z`);
  const sched = { on_calendar_utc: served.sentinel_timer.on_calendar_utc, randomized_delay_s: served.sentinel_timer.randomized_delay_s, deadline_utc: served.probe.deadline_utc };
  assert.ok(served.probe.deadline_utc > "03:00", "premise: the served deadline is after 03:00 UTC");
  assert.equal(lagStatus(lines, at, sched).late, 0, "on the served deadline the window is not late yet");
  assert.ok(lagStatus(lines, at, { ...sched, deadline_utc: "02:00" }).late > 0, "mutant 02:00: a typed early deadline would call it late");
  // Both register pages mount the island with the server-built props.
  for (const rel of ["apps/site/app/page.tsx", "apps/site/app/fleet/page.tsx"]) {
    const src = read(rel);
    assert.match(src, /<NarabiFreshness schedule=\{narabiFreshness\.schedule\} capture=\{narabiFreshness\.capture\} \/>/, `${rel} mounts the island with its props`);
    assert.match(src, /narabiFreshnessProps\(root\)/, `${rel} builds the props server-side`);
  }
});

test("built_narabi_and_ukemi_panels_follow_h8_and_take_status_from_the_register — a served fact sits only in a built block; the Narabi card status is handed in (UKEMI-PANEL-LIVING-PROOF-1, R37)", () => {
  // Ukemi: its living proof (a record read as it happens) is upcoming and says only what is not published yet; the
  // published course report is stated in a built block. Mutant: move "Already published: … course" back => red.
  const ukemiPanel = read("apps/site/components/ukemi-panel.tsx");
  const ukemiLiving = panelBlock(ukemiPanel, "Living proof");
  assert.equal(ukemiLiving.status, "upcoming");
  assert.doesNotMatch(ukemiLiving.inner, /\b(?:served|already|committed|published)\b/i, "the upcoming Living proof block states no served fact");
  const ukemiBuilt = panelBlock(ukemiPanel, "How it is built");
  assert.equal(ukemiBuilt.status, "built");
  assert.ok(ukemiBuilt.inner.includes("Published: the offline calibration course"), "the published course sits in a built block");
  assert.match(ukemiPanel, /<WhatInside block=\{insideFor\("ukemi"\)\} \/>/, "the shared What's inside block is rendered (SHARED-UKEMI-COPY-1)");
  // Narabi: its living proof IS served (the published daily timeline), so the block is built and links to it.
  const narabiPanel = read("apps/site/components/narabi-panel.tsx");
  const narabiLiving = panelBlock(narabiPanel, "Living proof");
  assert.equal(narabiLiving.status, "built", "the Narabi living proof is served, so its block is built");
  assert.ok(narabiLiving.inner.includes("href={NARABI_ROUTE}"), "it points to the published timeline");
  assert.doesNotMatch(narabiLiving.inner, /\blive\b/i, "no bare 'live' (the Terms' words we do not use)");
  // R37: the Narabi card takes its status from /fleet, which reads the register; the client panel never imports it.
  const ac = narabiPanel.indexOf("<AgentCard");
  assert.match(narabiPanel.slice(narabiPanel.indexOf("status", ac)), /^status=\{status\}/, "the AgentCard status is the handed-in prop");
  assert.doesNotMatch(narabiPanel, /from ["']@\/lib\/fleet["']/);
  assert.match(read("apps/site/app/fleet/page.tsx"), /<NarabiPanel contract=\{attestedFlowContract\} status=\{statusOf\("Narabi"\)\} \/>/);
  // The products that inherit Ukemi's engine no longer say "conformed by the gate" (the served cascade sentence says the
  // gate abstains on it); the Ukemi panel comment says why the shared block renders.
  for (const key of ["firebreak", "softlanding"]) {
    for (const p of insideFor(key).points) assert.doesNotMatch(p, /conformed by the gate|interval/i, `INSIDE.${key}: ${p}`);
  }
});

test("board_statuses_and_counts_read_the_register — no typed status, count, application sentence or B_t claim on the home board (R18, R19, R36, R45)", () => {
  const board = read("apps/site/components/gate-sim/board.tsx");
  assert.doesNotMatch(board, /status\s*=\s*\{?\s*["'](?:built|upcoming)["']/, "no typed StatusBadge status on the board");
  assert.doesNotMatch(board, /\?\?\s*["']built["']/, "no typed status fallback");
  assert.doesNotMatch(board, /\beleven agents\b/i);
  assert.match(board, /One engine, \{countWord\(NODES\.length\)\} agents, one plug per client\./);
  assert.match(board, /\{productStatusSentence\(\)\}/, "the aside's closing line is the register's status sentence");
  assert.match(board, /const asideStatus: FleetStatus \| undefined = finger\?\.status \?\? visage\?\.status;/);
  assert.match(board, /<div style=\{teaser\}>\{GENKAN_NODE\.line\}<\/div>/, "the Genkan teaser is the register line");
  assert.match(board, /and \{BT_SERVED_RULE\}\. Never a probability of being right\./, "the board states the served B_t rule");
  assert.doesNotMatch(board, /spent only on|every other product/i);
});

test("register_bell_fn_and_narabi_note_say_what_is_served — Bell's function ends on a signed, hash-chained record, never an anchored digest; Narabi's note says what the capture keeps, never byte-exact (FLEET-ANCHORED-DIGEST-1, NARABI-NOTE-BYTE-EXACT-1)", () => {
  const bell = builtProducts().find((p) => p.key === "bell");
  assert.ok(bell !== undefined && bell.fn.endsWith("a named abstention when it cannot, a signed, hash-chained record."), "Bell's function names the signed, chained record");
  const strings = [
    ...PRODUCTS.flatMap((p) => [p.fn, p.segment, p.connects, p.wiring.sensor, p.wiring.gate, p.wiring.act]),
    ...FLEET_AGENTS.map((a) => a.line),
    ...builtAgents().map((a) => a.wiring.note),
    ...builtProducts().map((p) => p.served.note),
  ];
  for (const s of strings) {
    assert.doesNotMatch(s, /anchored digest/i, `the register says "anchored digest": ${s}`);
    assert.doesNotMatch(s, /byte-exact/i, `the register says "byte-exact": ${s}`);
  }
  assert.ok(read("apps/site/app/bell/page.tsx").includes("not timestamp-anchored"), "/bell says signed and chained, not timestamp-anchored");
  const narabi = builtAgents().find((a) => a.name === "Narabi");
  assert.ok(narabi?.wiring.note.includes("its committed capture keeps each line's endpoint count only"), "Narabi's note says what the capture keeps");
  // The served Bell files the host serves are all named in the (unrendered) wiring.
  for (const path of ["timeline.jsonl", "state.json", "provenance.json", "bell/pubkey.json"]) {
    assert.ok(bell.served.served_by.includes(path), `served_by names ${path}`);
  }
});

test("roadmap_harness_layer_reads_the_served_tools — the tool count and names come from the served tool list, the maturity from the gate's register status, no typed Built and no skill-hub handle (HARNESS-SERVED-SYNC-1)", () => {
  const ROADMAP = "apps/site/app/roadmap/page.tsx";
  const roadmap = read(ROADMAP);
  assert.match(roadmap, /const harness = loadHarnessServed\(rootDir\);/);
  assert.match(roadmap, /\{countWord\(toolNames\.length\)\} tools \(\{listNames\(toolNames\)\}\)/);
  assert.doesNotMatch(roadmap, /maturity: <>Built<\/>/, "no typed Built maturity (mutant: restore it => red)");
  assert.equal((roadmap.match(/maturity: <>\{gateMaturity\}<\/>/g) ?? []).length, 2, "the backbone and the harness read the gate's register status");
  assert.ok(loadHarnessServed(ROOT).tools.length > 0, "the served tool list is read (false-green guard)");
  assert.ok(!renderedOf(ROADMAP).some((t) => /clawhub/i.test(t)), "no skill-hub handle on /roadmap");
});

test("registry_notes_say_non_llm_once_per_page — 'non-LLM' at most once on /, /products, /roadmap and /fleet: the agent notes never carry it (decision of the owner, 2026-09-24)", () => {
  const count = (s: string): number => (s.match(/non-LLM/gi) ?? []).length;
  for (const a of builtAgents()) assert.equal(count(a.wiring.note), 0, `${a.name}'s note repeats "non-LLM"`);
  const agentNotes = builtAgents().reduce((n, a) => n + count(a.wiring.note), 0);
  const productNotes = builtProducts().reduce((n, p) => n + count(p.served.note), 0);
  const literals = (rel: string): number => renderedOf(rel).reduce((n, t) => n + count(t), 0);
  // Per page: the page's own rendered literals plus the register notes it renders (the home and /products render the
  // built application's served note; /roadmap and /fleet render every built agent's note).
  const perPage: [string, number][] = [
    ["/", literals("apps/site/app/page.tsx") + productNotes],
    ["/products", literals("apps/site/app/products/page.tsx") + literals("apps/site/app/products/built-product-card.tsx") + productNotes],
    ["/roadmap", literals("apps/site/app/roadmap/page.tsx") + agentNotes],
    ["/fleet", literals("apps/site/app/fleet/page.tsx") + agentNotes],
  ];
  for (const [page, n] of perPage) assert.ok(n <= 1, `${page} says "non-LLM" ${String(n)} times`);
  assert.ok(perPage.some(([, n]) => n === 1), "the phrase still rides once where it belongs (false-green guard)");
});

test("owner_decisions_of_2026_09_24_retired_wording_stays_out — B_t caller-carried, no guarantee title, the engine reachable, no skill-hub handle, Bell segment and connections decided, engines complete, register tagline (decisions of the owner, 2026-09-24)", () => {
  const kept = collectFiles(ROOT).kept.filter((f) => f.rel.startsWith("apps/site/") && !BINARY_EXPORT.test(f.rel));
  assert.ok(kept.length >= 50, "the exported apps/site files are scanned (false-green guard)");
  const RETIRED: { re: RegExp; sample: string }[] = [
    { re: /MONARK carries B_t/i, sample: "MONARK carries B_t, the fleet's authorization capacity." },
    { re: /\beach commit spends it\b/i, sample: "Each commit spends it; defer and abstain do not." },
    { re: /\bcommit spends it\b/i, sample: "Commit spends it." },
    { re: /spent only (?:on|by) commit/i, sample: "B_t is spent only on commit" },
    { re: /\bB_t is spent\b/i, sample: "B_t is spent. No bar is lowered." },
    { re: /counter of commits/i, sample: "the counter of commits remaining" },
    { re: /What is guaranteed/i, sample: "What is guaranteed" },
    { re: /The fleet, reachable by your agent/i, sample: "The fleet, reachable by your agent." },
    { re: /The same fleet made reachable/i, sample: "The same fleet made reachable by other agents" },
    { re: /clawhub/i, sample: "Search ClawHub for monark" },
    { re: /<<bell_(?:segment|connects)>>/, sample: "<<bell_segment>>" },
    { re: /closed under independent review/i, sample: "engines, closed under independent review" },
    { re: /Liquidation-cascade survival/i, sample: "Liquidation-cascade survival." },
  ];
  for (const r of RETIRED) assert.ok(r.re.test(r.sample), `positive control: ${String(r.re)}`);
  const hits: string[] = [];
  for (const f of kept) {
    const raw = readFileSync(f.abs, "utf8");
    for (const r of RETIRED) if (r.re.test(raw)) hits.push(`${f.rel} [${String(r.re)}]`);
  }
  assert.deepEqual(hits, [], `retired wording is back:\n${hits.join("\n")}`);
  // The served B_t rule: carries the served clause verbatim, and the simulation note keeps its own served sentence.
  assert.ok(BT_SERVED_RULE.startsWith(loadHarnessServed(ROOT).honesty.bt_clause), "the B_t rule opens on the served clause");
  assert.ok(BT_SERVED_RULE.endsWith("the gate returns it unchanged"));
  assert.ok(BUDGET_NOTE.includes("the gate returns it unchanged"));
  for (const rel of ["apps/site/app/page.tsx", "apps/site/app/token/page.tsx", "apps/site/app/how/page.tsx"]) {
    assert.match(read(rel), /\{BT_SERVED_RULE\}/, `${rel} states the served B_t rule`);
  }
  // /how names what the gate commits to; the storefront bans "guarantee" in every form (site vocab scope, no exemption).
  assert.ok(renderedOf("apps/site/app/how/page.tsx").some((t) => t.includes("What the gate commits to")));
  const cfg = JSON.parse(read("vocab-banned.json")) as { scan: { site: { banned: { re: string }[]; exemptPhrases: string[] } } };
  const sitePatterns = compilePatterns(cfg.scan.site.banned as { re: string; why: string }[]);
  for (const s of ["no guarantee attached", "What is guaranteed", "guarantees"]) {
    assert.ok(scanText(s, sitePatterns, cfg.scan.site.exemptPhrases).length > 0, `the site scope reddens "${s}"`);
  }
  assert.ok(!cfg.scan.site.exemptPhrases.some((p) => /guarante/i.test(p)), "no exemption phrase carries the word");
  // The storefront says "applications" (the on-chain applications the engine powers), never "product", in every rendered
  // literal of its pages and components (dialog contents included, which the static HTML does not show). The route keeps
  // its /products path (item APPS-ROUTE-1). Mutant: "sell one another's products" back on /roadmap => red.
  const tsxOf = (dir: string): string[] =>
    readdirSync(join(ROOT, dir), { recursive: true }).map(String).filter((n) => n.endsWith(".tsx")).map((n) => `${dir}/${n.replace(/\\/g, "/")}`);
  const productHits: string[] = [];
  for (const rel of [...tsxOf("apps/site/app"), ...tsxOf("apps/site/components")]) {
    for (const t of renderedOf(rel)) if (/\bproducts?\b/i.test(t)) productHits.push(`${rel}: ${t.slice(0, 80)}`);
  }
  assert.deepEqual(productHits, [], `a rendered literal says "product":\n${productHits.join("\n")}`);
  for (const rel of ["apps/site/components/site-header.tsx", "apps/site/components/site-footer.tsx"]) {
    assert.match(read(rel), /\{ href: "\/products", label: "Applications" \}/, `${rel}: the nav names the applications page`);
  }
  // /integrators and /roadmap: the engine is reachable (the fleet keeps its per-piece status on /fleet).
  assert.ok(renderedOf("apps/site/app/integrators/page.tsx").some((t) => t.includes("The engine, reachable by your agent.")));
  assert.ok(renderedOf("apps/site/app/roadmap/page.tsx").some((t) => t.includes("The same engine made reachable by other agents over HTTP or MCP.")));
  // Bell's segment and connections are register values; the connections name register agents (a renamed agent fails the
  // build). Mutant: registerNames(["Hikae", "Shogun"]) => throws.
  const bell = PRODUCTS.find((p) => p.key === "bell");
  assert.equal(bell?.segment, "tokenized equities, off-hours");
  assert.equal(bell?.connects, registerNames(["Hikae", "Shōgen"]));
  assert.equal(bell?.connects, "Hikae and Shōgen");
  assert.throws(() => registerNames(["Hikae", "Shogun"]), /not an agent of the fleet register/);
});

// KITCHEN-PUBLIC-1 — the internal work vocabulary never rides on the public storefront. A CLOSED list of forms, scanned
// over EVERY exported apps/site text file (sources with their comments, committed data with its $comment, public assets),
// as written and with escapes neutralized; the literals live in this non-exported file (listing them in the exported gate
// file would publish them). The closed exemptions are exact spans, each tied to a formed item with its trigger; an
// exemption whose span is gone reds (no stale exemption). DECLARED LIMITS: the bare word "ADR" in a method sentence is
// not a form here (item KITCHEN-ADR-WORD-1, owner's ruling): it is held to a closed count per file, so a new occurrence
// reds; "worker" and "checkpoint" redden as plain English words too (none on the storefront when added).
const KITCHEN_FORMS: readonly { re: RegExp; why: string }[] = [
  { re: /\bsub-?agents?\b/i, why: "sub-agent" },
  { re: /\borchestrat(?:or|ors|ion|ed|ing)\b/i, why: "orchestrator" },
  { re: /\bworkers?\b/i, why: "worker" },
  { re: /\bcheckpoint(?:s|-\d+)?\b/i, why: "checkpoint" },
  { re: /\bG[0-7]\b/, why: "gate G0..G7" },
  { re: /\b[Ll]ots? [A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+/, why: "lot <NAME>" },
  { re: /\bdecisions? (?:n°\s*)?\d+/i, why: "decision <n>" },
  { re: /\bADR-[A-Z0-9]/, why: "ADR identifier" },
  { re: /vibe-?cod/i, why: "vibecoding" },
  { re: /\bG2 review\b/i, why: "G2 review" },
];
const KITCHEN_EXEMPT: readonly { rel: string; span: string; item: string }[] = [
  {
    rel: "apps/site/data/ukemi-course.json",
    span: "applied by the orchestrator, decision 137",
    item: "KITCHEN-UKEMI-COURSE-1 with VIT-UKEMI-EOA-1: body.summary[22] is bound to body_digest (never rendered); it changes only with a re-issued report copy",
  },
  {
    rel: "apps/site/data/ukemi-course.json",
    span: "(ADR-U4:106-107 bias, declared)",
    item: "KITCHEN-UKEMI-COURSE-1: body.h6.sample_note is bound to body_digest (the page renders its own bias sentence instead)",
  },
  {
    rel: "apps/site/lib/harness-served-load.ts",
    span: "(?:ADR-M\\d+\\s+)?",
    item: "HARNESS-DESC-KITCHEN-1: the stripper of internal reference tokens the served harness text still carries; it goes when the served text stops carrying them",
  },
];
const KITCHEN_BARE_ADR: Readonly<Record<string, number>> = {
  "apps/site/components/narabi/narabi-live.tsx": 1,
  "apps/site/lib/narabi-copy.ts": 2,
  "apps/site/lib/narabi-live.ts": 4,
};
const kitchenHits = (rel: string, text: string): string[] => {
  let masked = text;
  for (const e of KITCHEN_EXEMPT) if (e.rel === rel) masked = masked.split(e.span).join(" ".repeat(e.span.length));
  const hits: string[] = [];
  for (const view of [masked, neutralizeEscapes(masked)]) {
    for (const form of KITCHEN_FORMS) {
      const m = form.re.exec(view);
      if (m !== null) hits.push(`${rel} [${form.why}: ${JSON.stringify(m[0])}]`);
    }
  }
  return [...new Set(hits)];
};

test("site_names_no_kitchen — no internal work vocabulary in ANY exported apps/site file, rendered surface, comment or committed data (KITCHEN-PUBLIC-1)", () => {
  const kept = collectFiles(ROOT).kept.filter((f) => f.rel.startsWith("apps/site/") && !BINARY_EXPORT.test(f.rel));
  assert.ok(kept.length >= 50, `implausibly few exported apps/site text files (${String(kept.length)}) — false green?`);
  const hits: string[] = [];
  const bareAdr: Record<string, number> = {};
  for (const f of kept) {
    const raw = readFileSync(f.abs, "utf8");
    hits.push(...kitchenHits(f.rel, raw));
    const n = (raw.match(/\bADR\b(?!-)/g) ?? []).length;
    if (n > 0) bareAdr[f.rel] = n;
  }
  assert.deepEqual(hits, [], `internal work vocabulary on the public storefront:\n${hits.join("\n")}`);
  // Every exemption is still needed (its span is present in its file), else it is stale.
  for (const e of KITCHEN_EXEMPT) assert.ok(read(e.rel).includes(e.span), `stale kitchen exemption (${e.item}): ${e.span}`);
  // The bare word "ADR" stays where the owner's ruling will decide it (item KITCHEN-ADR-WORD-1), and nowhere else.
  assert.deepEqual(bareAdr, KITCHEN_BARE_ADR, "a bare 'ADR' appeared or disappeared: update KITCHEN_BARE_ADR with the ruling");
  // Positive controls: each form, alone, reds.
  const samples = ["three sub-agents", "the orchestrator ruling", "a worker lot", "checkpoint-2", "gate G7", "lot SITE-LEGAL-1", "decision 69", "ADR-M004 D15", "vibecoded", "the G2 review"];
  KITCHEN_FORMS.forEach((form, i) => assert.ok(form.re.test(samples[i] ?? ""), `positive control ${String(i)}: ${String(form.re)}`));
  // Negative controls: the served harness sentence and ordinary English stay green (no `validat` form, no bare `lot`).
  for (const green of [
    "MONARK does not see, store, or verify the caller's data or model, and does not validate that the supplied numbers are nonconformity scores",
    "a lot more-or-less stable",
    "decisions made by the gate",
    "the gate's decision",
    "G20 summit",
    "Lot size",
  ]) {
    assert.deepEqual(kitchenHits("fixture", green), [], `'${green}' must stay green`);
  }
  // Named mutant: "not three sub-agents" back in the /roadmap lede => red (in memory; replayed on the file in the G1).
  const ROADMAP = "apps/site/app/roadmap/page.tsx";
  const mutant = read(ROADMAP).replace("MONARK is one engine and the on-chain applications it powers.", "MONARK is not one product and not three sub-agents.");
  assert.notEqual(mutant, read(ROADMAP), "premise: the mutant applies");
  assert.notDeepEqual(kitchenHits(ROADMAP, mutant), [], "mutant sub-agents on /roadmap must red");
});
