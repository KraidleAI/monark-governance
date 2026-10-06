// test/site-ukemi.test.ts — root non-LLM oracle for the /ukemi page (lot SITE-RELEASE-1 sub-lot B, G0 §18/B).
// Runs at the REPO ROOT under `node --test` (mirrors test/narabi-live.test.ts / test/site-build-fleet.test.ts).
// It imports the PURE served text (lib/ukemi-copy.ts) AND the single source of truth (apps/harness/src/tools/
// gate.ts) and asserts byte-identity; it drives the pure assertUkemiBody() on SYNTHETIC fixtures composed from
// the REAL ukemi-copy exports (the real ukemi.html is asserted by g3-site, CA-11); it proves scanner parity
// with honesty-lint; and it reads the component/route/icon SOURCE (never imports the .tsx — React/Next) to
// prove the carriers, C-6 status-only, and the local favicon. Each imposed test has a named mutant (D-1),
// replayed red by F:\tmp\siteB\mutants.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import ts from "typescript";
import {
  LIQ_UPPER_BOUND_SENTENCE,
  LIQ_H3_SENTENCE,
  LIQ_CONDITIONAL_SENTENCE,
  LIQ_EMPTY_REGISTRY_SENTENCE,
  HERO_TITLE,
  HERO_DEK,
  WHAT_LABEL,
  IS_LIST,
  IS_NOT_LIST,
  SERVED_LABEL,
  SERVED_STATE_LEAD, SERVED_COMMITTED_LEAD, LIQ_COMMITTED_STATE_NOTE,
  FIGURES_LEAD, FIGURE_POINTS_LABEL, FIGURE_MARGIN_LABEL, BOUND_UNIT, FIGURE_MARGIN_NOTE, FIGURE_DIGEST_LABEL, DIGEST_NOTE,
  REGION_NOTE,
  CONDITIONAL_LEAD,
  COVERAGE_NOTE,
  BAR_UPPER_LABEL,
  BAR_YHAT_LABEL,
  BAR_FLOOR_LABEL,
  STATES_NOTE,
  METHOD_LABEL,
  METHOD_STEPS,
  LIMITS_LABEL,
  LIMITS,
  COURSE_POINTER_LEAD,
  COURSE_POINTER_LINK,
  COURSE_POINTER_TAIL,
  UKEMI_COURSE_ROUTE,
} from "../apps/site/lib/ukemi-copy.ts";
import * as UKEMI_COPY from "../apps/site/lib/ukemi-copy.ts";
import { CASCADE_UNCALIBRATED_SENTENCE, LIQ_TASK_CLASS } from "../apps/site/lib/ukemi-panel-copy.ts";
import * as UKEMI_PANEL_COPY from "../apps/site/lib/ukemi-panel-copy.ts";
import { loadUkemiCourse, UKEMI_COURSE_REL, type UkemiCourse } from "../apps/site/lib/ukemi-course-load.ts";
import { loadUkemiServed, UKEMI_SERVED_REL, type UkemiServed } from "../apps/site/lib/ukemi-served-load.ts";
import { buildCourseView, type CourseView } from "../apps/site/lib/ukemi-course-view.ts";
import { servedFiguresOf } from "../apps/site/lib/ukemi-served-figures.ts";
import {
  LIQ_UPPER_BOUND_SENTENCE as GATE_LIQ_UPPER_BOUND_SENTENCE,
  LIQ_H3_SENTENCE as GATE_LIQ_H3_SENTENCE,
  LIQ_CONDITIONAL_SENTENCE as GATE_LIQ_CONDITIONAL_SENTENCE,
  LIQ_EMPTY_REGISTRY_SENTENCE as GATE_LIQ_EMPTY_REGISTRY_SENTENCE,
  LIQ_REQUIREMENTS_SENTENCE as GATE_LIQ_REQUIREMENTS_SENTENCE,
  CASCADE_UNCALIBRATED_SENTENCE as GATE_CASCADE_UNCALIBRATED_SENTENCE,
  TASK_LIQ_ELIGIBLE,
  LIQ_ALPHA,
  LIQ_NMIN,
  runGate,
  type HarnessParams,
} from "../apps/harness/src/tools/gate.ts";
import { ATTESTATION_BINDING } from "../apps/harness/src/attestation-binding.ts";
import { hasCommittedCalibrationForClass, lookupCommittedCalibration, UKEMI_LIQ_PREDICTOR_BASE } from "../apps/harness/src/calibration.ts";
import { scoresSha256 } from "../packages/contracts/src/index.ts";
import { STRATA_CUTS_SERVED, strateOf } from "../apps/harness/src/ukemi-strata.ts";
import { assertUkemiBody, scanNumericTokens, ukemiExpected, renderedBody, extractMain, mainCorpus, type UkemiExpected } from "../scripts/assert-fleet-html.mjs";
import { scanText, scanSource, renderedTexts, loadExemptFile, exemptValues } from "../apps/site/test/honesty-lint.ts";
import { FLEET_AGENTS } from "../apps/site/lib/fleet.ts";
import { insideFor } from "../apps/site/lib/fleet-presentation.ts";
import { startLoopback } from "./helpers/loopback.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");
const UKEMI_PAGE_REL = "apps/site/components/ukemi/ukemi-page.tsx";
const UKEMI_ROUTE_REL = "apps/site/app/ukemi/page.tsx";
const UKEMI_ICON_REL = "apps/site/public/icons/ukemi.svg";
const NO_EXEMPT = new Set<string>();
// A-8 / C-1: read the pill status from the REAL fleet register (single source), never a hard-coded stub.
const UKEMI_STATUS: string = (() => {
  const a = FLEET_AGENTS.find((x) => x.name === "Ukemi");
  if (a === undefined) throw new Error("site-ukemi.test: 'Ukemi' absent from FLEET_AGENTS (lib/fleet.ts)");
  return a.status;
})();
const EXPECTED: UkemiExpected = { registryState: "empty", emptyRegistrySentence: LIQ_EMPTY_REGISTRY_SENTENCE, committedStateSentence: LIQ_COMMITTED_STATE_NOTE, conditionalSentence: LIQ_CONDITIONAL_SENTENCE, status: UKEMI_STATUS, figures: [] };

/** The figures block of the committed branch as the page renders it, from the closed list's values in its order (n, bound
 *  margin, digest, day); "" when no value is given. */
function figuresBlock(values: readonly string[]): string {
  if (values.length === 0) return "";
  const [n = "", margin = "", digest = "", day = ""] = values;
  return `<p>${FIGURES_LEAD} <span class="font-mono">${day}</span>:</p><ul><li><span class="font-mono">${n}</span> ${FIGURE_POINTS_LABEL}</li>` +
    `<li>${FIGURE_MARGIN_LABEL} <span class="font-mono">${margin}</span> ${BOUND_UNIT}; ${FIGURE_MARGIN_NOTE}</li>` +
    `<li>${FIGURE_DIGEST_LABEL} <span class="c-mono break-all">${digest}</span></li></ul><p>${DIGEST_NOTE}</p>`;
}

// A green <main> fixture composed from the REAL ukemi-copy exports, mirroring the page structure (advisor 2):
// class/style carry digits (stripped by the scan); in the committed state the figures `values` follow the note.
function greenMain(state: "empty" | "committed" = "empty", values: readonly string[] = []): string {
  const li = (items: readonly string[]): string =>
    items.map((t) => `<li><span aria-hidden="true">+</span><span>${t}</span></li>`).join("");
  const steps = METHOD_STEPS.map((s) => `<div><div>${s.name}</div><div>${s.title}</div><p>${s.detail}</p></div>`).join("");
  const limits = LIMITS.map((l) => `<div><h3>${l.title}</h3><p>${l.detail}</p></div>`).join("");
  return (
    `<main class="mx-auto max-w-[1200px] px-6 py-16">` +
    `<div>Ukemi</div><span>${UKEMI_STATUS}</span>` +
    `<h1>${HERO_TITLE}</h1><p>${HERO_DEK}</p>` +
    `<div>${WHAT_LABEL}</div><ul>${li(IS_LIST)}</ul><ul>${li(IS_NOT_LIST)}</ul>` +
    `<div>${SERVED_LABEL}</div>` + (state === "empty" ? `<p>${SERVED_STATE_LEAD}</p><p>${LIQ_EMPTY_REGISTRY_SENTENCE}</p>` : `<p>${SERVED_COMMITTED_LEAD}</p><p>${LIQ_COMMITTED_STATE_NOTE}</p>` + figuresBlock(values)) +
    `<div aria-hidden="true"><span style="left:22%;width:44%">${BAR_UPPER_LABEL}</span>` +
    `<span style="left:22%">${BAR_YHAT_LABEL}</span><span>${BAR_FLOOR_LABEL}</span></div>` +
    `<p>${REGION_NOTE}</p><p>${CONDITIONAL_LEAD}</p><p>${LIQ_CONDITIONAL_SENTENCE}</p>` +
    `<p>${COURSE_POINTER_LEAD} <a href="${UKEMI_COURSE_ROUTE}">${COURSE_POINTER_LINK}</a>${COURSE_POINTER_TAIL}</p>` +
    `<p>${STATES_NOTE}</p><p>${COVERAGE_NOTE}</p>` +
    `<div>${METHOD_LABEL}</div>${steps}` +
    `<div>${LIMITS_LABEL}</div>${limits}` +
    `</main>`
  );
}

/** Names rendered as a JSX child {IDENT} in a TSX source (comment-proof; renderedLiterals ignores identifiers,
 *  so this is how the {CONST} carrier is proven — advisor 3). */
function jsxChildIdentifiers(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isJsxExpression(node) && node.expression && ts.isIdentifier(node.expression)) {
      const p = node.parent;
      if (p !== undefined && (ts.isJsxElement(p) || ts.isJsxFragment(p))) names.add(node.expression.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return names;
}

/** Named imports pulled from a module whose specifier contains `moduleSubstr` (comment-proof). */
function importedFrom(sf: ts.SourceFile, moduleSubstr: string): Set<string> {
  const names = new Set<string>();
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text.includes(moduleSubstr)) {
      const nb = st.importClause?.namedBindings;
      if (nb !== undefined && ts.isNamedImports(nb)) for (const el of nb.elements) names.add(el.name.text);
    }
  }
  return names;
}

const parseTsx = (rel: string, src: string): ts.SourceFile =>
  ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

test("site_ukemi_copy_equals_served_liq_text — the 4 served constants are byte-identical to gate.ts; closed set of 4, LIQ_REQUIREMENTS omitted (C-2)", () => {
  // Import BOTH modules; each of the FOUR is byte-identical to the single source of truth (gate.ts). Mutant:
  // one character changed in any ukemi-copy constant => the matching equality reds.
  assert.equal(LIQ_UPPER_BOUND_SENTENCE, GATE_LIQ_UPPER_BOUND_SENTENCE, "LIQ_UPPER_BOUND_SENTENCE must equal gate.ts byte-for-byte");
  assert.equal(LIQ_H3_SENTENCE, GATE_LIQ_H3_SENTENCE, "LIQ_H3_SENTENCE must equal gate.ts byte-for-byte");
  assert.equal(LIQ_CONDITIONAL_SENTENCE, GATE_LIQ_CONDITIONAL_SENTENCE, "LIQ_CONDITIONAL_SENTENCE must equal gate.ts byte-for-byte");
  assert.equal(LIQ_EMPTY_REGISTRY_SENTENCE, GATE_LIQ_EMPTY_REGISTRY_SENTENCE, "LIQ_EMPTY_REGISTRY_SENTENCE must equal gate.ts byte-for-byte");

  // CLOSED set of 4 (C-2): LIQ_REQUIREMENTS_SENTENCE ("alpha = 0.01, nMin = 100" — digits) is deliberately
  // OMITTED from ukemi-copy.ts (Q-5a: temps 1 is digit-free). Checked on EXPORTED definitions (AST, comment-
  // proof), not on the raw text. The gate.ts module still serves it.
  const copySf = ts.createSourceFile("ukemi-copy.ts", read("apps/site/lib/ukemi-copy.ts"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const exported = new Set<string>();
  for (const st of copySf.statements) {
    if (ts.isVariableStatement(st) && (st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false)) {
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) exported.add(d.name.text);
    }
  }
  assert.ok(!exported.has("LIQ_REQUIREMENTS_SENTENCE"), "LIQ_REQUIREMENTS_SENTENCE must not be EXPORTED by ukemi-copy.ts (closed set of 4; it carries digits)");
  for (const n of ["LIQ_UPPER_BOUND_SENTENCE", "LIQ_H3_SENTENCE", "LIQ_CONDITIONAL_SENTENCE", "LIQ_EMPTY_REGISTRY_SENTENCE"]) {
    assert.ok(exported.has(n), `${n} must be EXPORTED by ukemi-copy.ts (the carried closed set of 4)`);
  }
});

test("site_ukemi_served_text_never_interval — A-9: the word 'interval' rides in NO served constant and in NO rendered body", () => {
  // A-9 (recurrence U-4b-2a C-2): the injection is replayed on EACH served constant AND on the composed output,
  // not on a nominal one only. Here: every one of the four served constants is interval-free.
  const served: Array<[string, string]> = [
    ["LIQ_UPPER_BOUND_SENTENCE", LIQ_UPPER_BOUND_SENTENCE],
    ["LIQ_H3_SENTENCE", LIQ_H3_SENTENCE],
    ["LIQ_CONDITIONAL_SENTENCE", LIQ_CONDITIONAL_SENTENCE],
    ["LIQ_EMPTY_REGISTRY_SENTENCE", LIQ_EMPTY_REGISTRY_SENTENCE],
  ];
  for (const [name, text] of served) {
    assert.ok(!text.toLowerCase().includes("interval"), `${name} must never contain "interval" (mutant: inject it => reds)`);
  }
  // Composed output (the rendered <main>): interval-free green passes; interval injected into a RENDERED
  // constant is caught by assertUkemiBody (the served path, not a nominal constant).
  assert.doesNotThrow(() => assertUkemiBody({ html: greenMain(), expected: EXPECTED }), "the composed /ukemi body is interval-free");
  assert.throws(
    () => assertUkemiBody({ html: greenMain().replace(LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE + " over an interval"), expected: EXPECTED }),
    /interval/,
    "interval injected into the rendered served state must red the body",
  );
});

test("site_ukemi_body_scan_and_carrier — assertUkemiBody fixtures + scanner parity + digit-free prose + carriers (C-1)", () => {
  // (a) DIGIT-FREE rendered prose: every export that renders as text scans clean under honesty-lint scanText
  // (the M-13 hole: test 44 is blind to these .ts initialisers rendered via {CONST}). Closed EXCLUSION: the
  // two digit-bearing served constants (upper-bound carries "0", H-3 carries "3") are NOT rendered.
  const renderedProse: Array<[string, string]> = [
    ["HERO_TITLE", HERO_TITLE], ["HERO_DEK", HERO_DEK], ["WHAT_LABEL", WHAT_LABEL], ["SERVED_LABEL", SERVED_LABEL],
    ["SERVED_STATE_LEAD", SERVED_STATE_LEAD], ["REGION_NOTE", REGION_NOTE], ["CONDITIONAL_LEAD", CONDITIONAL_LEAD],
    ["COVERAGE_NOTE", COVERAGE_NOTE], ["BAR_UPPER_LABEL", BAR_UPPER_LABEL], ["BAR_YHAT_LABEL", BAR_YHAT_LABEL],
    ["BAR_FLOOR_LABEL", BAR_FLOOR_LABEL], ["STATES_NOTE", STATES_NOTE], ["METHOD_LABEL", METHOD_LABEL],
    ["LIMITS_LABEL", LIMITS_LABEL],
    ["COURSE_POINTER_LEAD", COURSE_POINTER_LEAD], ["COURSE_POINTER_LINK", COURSE_POINTER_LINK], ["COURSE_POINTER_TAIL", COURSE_POINTER_TAIL],
    ["LIQ_EMPTY_REGISTRY_SENTENCE", LIQ_EMPTY_REGISTRY_SENTENCE], ["LIQ_CONDITIONAL_SENTENCE", LIQ_CONDITIONAL_SENTENCE], ["SERVED_COMMITTED_LEAD", SERVED_COMMITTED_LEAD], ["LIQ_COMMITTED_STATE_NOTE", LIQ_COMMITTED_STATE_NOTE],
    ["FIGURES_LEAD", FIGURES_LEAD], ["FIGURE_POINTS_LABEL", FIGURE_POINTS_LABEL], ["FIGURE_MARGIN_LABEL", FIGURE_MARGIN_LABEL], ["BOUND_UNIT", BOUND_UNIT],
    ["FIGURE_MARGIN_NOTE", FIGURE_MARGIN_NOTE], ["FIGURE_DIGEST_LABEL", FIGURE_DIGEST_LABEL], ["DIGEST_NOTE", DIGEST_NOTE],
  ];
  IS_LIST.forEach((t, i) => renderedProse.push([`IS_LIST_${i}`, t]));
  IS_NOT_LIST.forEach((t, i) => renderedProse.push([`IS_NOT_LIST_${i}`, t]));
  METHOD_STEPS.forEach((s, i) => { renderedProse.push([`METHOD_STEPS_${i}_name`, s.name]); renderedProse.push([`METHOD_STEPS_${i}_title`, s.title]); renderedProse.push([`METHOD_STEPS_${i}_detail`, s.detail]); });
  LIMITS.forEach((l, i) => { renderedProse.push([`LIMITS_${i}_title`, l.title]); renderedProse.push([`LIMITS_${i}_detail`, l.detail]); });
  for (const [name, text] of renderedProse) {
    assert.deepEqual(scanText(text, NO_EXEMPT), [], `${name} must be digit-free (rendered prose; mutant: a digit here reds)`);
  }
  // the closed exclusion is real: the two UN-rendered served constants DO carry a digit (why they cannot ride).
  assert.ok(scanText(LIQ_UPPER_BOUND_SENTENCE, NO_EXEMPT).length > 0, "LIQ_UPPER_BOUND_SENTENCE carries a digit ('0') — excluded from the rendered body");
  assert.ok(scanText(LIQ_H3_SENTENCE, NO_EXEMPT).length > 0, "LIQ_H3_SENTENCE carries a digit ('H-3') — excluded from the rendered body");

  // (b) assertUkemiBody on SYNTHETIC fixtures (green from real exports; each failure mode throws).
  assert.doesNotThrow(() => assertUkemiBody({ html: greenMain(), expected: EXPECTED }), "green composed <main> passes");
  const redBody = (mutate: (h: string) => string, re: RegExp, label: string): void =>
    assert.throws(() => assertUkemiBody({ html: mutate(greenMain()), expected: EXPECTED }), re, label);
  redBody((h) => h.replace("</main>", "<p>185 of 189</p></main>"), /numeric token/, "a rendered digit reds (scan disabled mutant target)");
  redBody((h) => h.replace(LIQ_EMPTY_REGISTRY_SENTENCE, "no calibration"), /empty-state sentence of the synced served state is absent/, "empty-registry sentence removed reds");
  redBody((h) => h.replace(LIQ_CONDITIONAL_SENTENCE, "the bound holds only if it holds"), /conditional sentence is absent/, "conditional sentence removed reds");
  redBody((h) => h.replace(REGION_NOTE, REGION_NOTE + " cascade"), /cascade/, "cascade reds (line/wiring rendered)");
  redBody((h) => h.replace(REGION_NOTE, REGION_NOTE + " Bell"), /Bell/, "Bell reds");
  redBody((h) => h.replace(REGION_NOTE, REGION_NOTE + " Aave"), /Aave/, "Aave reds");
  assert.throws(() => assertUkemiBody({ html: "<section>no main here</section>", expected: EXPECTED }), /no <main>/, "no <main> fails-closed");
  assert.throws(() => assertUkemiBody({ html: "<main>   </main>", expected: EXPECTED }), /empty\/blank/, "empty <main> fails-closed");
  assert.throws(() => assertUkemiBody({ html: greenMain(), expected: { ...EXPECTED, emptyRegistrySentence: "" } }), /vacuity/, "a blank expected sentence fails-closed");
  assert.throws(() => assertUkemiBody({ html: greenMain(), expected: { ...EXPECTED, status: "" } }), /vacuity/, "a blank expected.status fails-closed (C-1)");
  // C-1 / CA-11 — the built pill must carry the REAL registry status ("Ukemi <status>"). A flipped/altered
  // pill value reds; an absent pill reds. This is the unit-level defense that kills mutant X5 (the harness
  // also replays X5 on the build -> assert path). The source-only .status check cannot catch a value flip.
  redBody((h) => h.replace(`>${UKEMI_STATUS}</span>`, ">flipped-status</span>"), /pill does not carry/, "a flipped pill value reds (X5)");
  redBody((h) => h.replace(`<div>Ukemi</div><span>${UKEMI_STATUS}</span>`, ""), /pill does not carry/, "an absent pill reds (C-1)");

  // (c) SCANNER PARITY: the .mjs scan equals honesty-lint scanText(_, empty) byte-for-byte (idiom "the root
  // test asserts the identity", narabi-live.ts:31-32). Mutant: drift a regex in the .mjs => a fixture diverges.
  const parityFixtures = [
    "no digits here", "185 of 189", "alpha 0.01", "2026-09-22 ADR-M012 R-25 CA-9 D14 HIP-3",
    "q1 and q_t", "1,234.56 units", "H-3 exchangeability", HERO_DEK, LIQ_UPPER_BOUND_SENTENCE, LIQ_H3_SENTENCE,
  ];
  for (const s of parityFixtures) {
    assert.deepEqual(scanNumericTokens(s), scanText(s, NO_EXEMPT), `scanner parity on ${JSON.stringify(s.slice(0, 28))}`);
  }

  // (d)+(e) CARRIERS (AST, comment-proof): the two digit-free served constants render as {IDENT} children and
  // are imported; the two digit-bearing ones are NEITHER rendered NOR imported (negative carrier, advisor 1).
  const comp = read(UKEMI_PAGE_REL);
  const sf = parseTsx(UKEMI_PAGE_REL, comp);
  const rendered = jsxChildIdentifiers(sf);
  const imported = importedFrom(sf, "ukemi-copy");
  // CA-11 branchement: the pill renders {status} from the register (wired to fleet.ts), never a hard-coded
  // literal that would coincidentally match the artefact. Mutant M12 ({status} -> a literal) reds here.
  assert.ok(rendered.has("status"), "the pill must render {status} from the fleet register (not a hard-coded literal — CA-11)");
  assert.ok(rendered.has("LIQ_EMPTY_REGISTRY_SENTENCE"), "positive carrier: {LIQ_EMPTY_REGISTRY_SENTENCE} renders as a JSX child");
  assert.ok(rendered.has("LIQ_CONDITIONAL_SENTENCE"), "positive carrier: {LIQ_CONDITIONAL_SENTENCE} renders as a JSX child");
  assert.ok(!rendered.has("LIQ_UPPER_BOUND_SENTENCE"), "negative carrier: LIQ_UPPER_BOUND_SENTENCE (carries '0') must NOT render");
  assert.ok(!rendered.has("LIQ_H3_SENTENCE"), "negative carrier: LIQ_H3_SENTENCE (carries 'H-3') must NOT render");
  assert.ok(imported.has("LIQ_EMPTY_REGISTRY_SENTENCE") && imported.has("LIQ_CONDITIONAL_SENTENCE"), "the two rendered served constants are imported");
  assert.ok(!imported.has("LIQ_UPPER_BOUND_SENTENCE") && !imported.has("LIQ_H3_SENTENCE"), "the two digit-bearing served constants are NOT imported (negative carrier)");

  // (f) the component's OWN JSX-text literals are digit-free and carry no forbidden word (mutant: a literal
  // "Bell"/digit typed as JSX text reds). renderedTexts sees JSX text/child-literal/visible attrs (not {IDENT}).
  for (const rt of renderedTexts(sf)) {
    assert.deepEqual(scanText(rt.text, NO_EXEMPT), [], `component JSX literal must be digit-free: ${JSON.stringify(rt.text.slice(0, 40))}`);
    assert.ok(!/\bBell\b/i.test(rt.text), `no "Bell" in a component JSX literal: ${JSON.stringify(rt.text)}`);
    assert.ok(!/\bcascade\b/i.test(rt.text), `no "cascade" in a component JSX literal: ${JSON.stringify(rt.text)}`);
    assert.ok(!/\bAave\b/i.test(rt.text), `no "Aave" in a component JSX literal: ${JSON.stringify(rt.text)}`);
    assert.ok(!/interval/i.test(rt.text), `no "interval" in a component JSX literal: ${JSON.stringify(rt.text)}`);
  }

  // (g) both the component and the route render NO numeric literal in any JSX/visible-attr/metadata position
  // (honesty-lint's own scanner; mutant: a hard-coded number in metadata title / JSX text reds).
  assert.deepEqual(scanSource(comp, "tsx", NO_EXEMPT), [], "ukemi-page.tsx renders no numeric literal");
  assert.deepEqual(scanSource(read(UKEMI_ROUTE_REL), "tsx", NO_EXEMPT), [], "ukemi/page.tsx metadata is digit-free");
});

test("site_ukemi_reads_status_only — /ukemi reads ONLY status from the register, never line/wiring (C-6)", () => {
  // The Ukemi register row's wiring.note carries "cascade" (lib/fleet.ts); rendering it reds assertUkemiBody
  // \bcascade\b=0. The /ukemi body keeps its own copy (lib/ukemi-copy.ts), so the component reads status ONLY.
  // Mutant: add a .line / .wiring access => this reds.
  const comp = read(UKEMI_PAGE_REL);
  assert.ok(/\.status\b/.test(comp), "the component reads .status from the register (the built pill, C-6/D-51)");
  assert.ok(!/\.line\b/.test(comp), 'the component must NOT read .line (carries "cascade" — C-6)');
  assert.ok(!/\.wiring\b/.test(comp), 'the component must NOT read .wiring (carries "cascade" — C-6)');
});

test("site_ukemi_icon_local_no_remote_url — favicon is a STATIC public SVG (not a /ukemi/ route icon), adaptive, 0 URL (C-9, §6.5; ruling D-2)", () => {
  // The favicon is a STATIC asset apps/site/public/icons/ukemi.svg (served at /icons/ukemi.svg), NOT a
  // file-based app/ukemi/icon.svg — a route icon under /ukemi/ could be SHADOWED by a Caddy handle_path
  // /ukemi/* (as /narabi/* does). Ruling on sub-lot A deviation D-2 (CHANTIERS SITE-RELEASE-1-A).
  // (i) the SVG carries no remote-load construct. Mutant M7: add url(http://x.invalid/f.woff2) => reds.
  // (A bare `http` grep would false-red on xmlns="http://www.w3.org/2000/svg" — check the load constructs.)
  const svg = read(UKEMI_ICON_REL);
  for (const re of [/url\(/i, /@import/i, /href\s*=/i, /src\s*=/i, /<image\b/i, /<use\b/i, /<script\b/i]) {
    assert.ok(!re.test(svg), `ukemi.svg must carry no remote-load construct (${String(re)})`);
  }
  assert.ok(/prefers-color-scheme/.test(svg), "ukemi.svg is adaptive (@media prefers-color-scheme)");

  // (ii) the /ukemi page declares the icon at the STATIC /icons/ path via metadata.icons, and NEVER under a
  // /ukemi/ route path. Mutant M11 ("icon declared under /ukemi/", url -> /ukemi/icon.svg) reds BOTH asserts.
  const route = read(UKEMI_ROUTE_REL);
  assert.ok(route.includes('"/icons/ukemi.svg"'), "the /ukemi page must declare its icon at the static /icons/ukemi.svg (metadata.icons)");
  assert.ok(!/["'`]\/ukemi\/icon/.test(route), "the icon must NOT be declared under /ukemi/ (Caddy handle_path shadow risk — ruling D-2)");
});

/* ─────────────────────────── /ukemi/course + served state (lot site-5j ukemi) ───────────────────────────
 * The course page renders ONLY words composed by lib/ukemi-course-view.ts from two committed, hashed files: the course
 * report copy (apps/site/data/ukemi-course.json) and the served state of the class (apps/site/data/ukemi-served.json).
 * These tests pin every mapping to a named JSON path of those files, replay the loaders' fail-closed mutants on
 * temporary copies, bind the served state to the harness registry, and forbid provider / operator names on the Ukemi
 * surface (the literals live HERE, in a non-exported root test, never in an exported vocabulary file). */

type Json = Record<string, unknown>;
const obj = (v: unknown, where: string): Json => {
  assert.ok(v !== null && typeof v === "object" && !Array.isArray(v), `${where} must be an object`);
  return v as Json;
};
const list = (v: unknown, where: string): unknown[] => {
  assert.ok(Array.isArray(v), `${where} must be an array`);
  return v as unknown[];
};
const rawCourse = (): Json => obj(JSON.parse(read(UKEMI_COURSE_REL)) as unknown, "course file");
/** The committed served file, without pending_since (the base of every variant a test writes; v1 refuses the key). */
const rawServed = (): Json => Object.fromEntries(Object.entries(obj(JSON.parse(read(UKEMI_SERVED_REL)) as unknown, "served file")).filter(([k]) => k !== "pending_since"));
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
/** Independent re-implementation of the course tool's canonical JSON (keys sorted, no whitespace). */
function canon(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  const o = v as Json;
  return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
}
/** 8-decimal rendering by BigInt (independent of the loader's string routine). */
function dec8(intString: string): string {
  const v = BigInt(intString);
  return `${(v / 100000000n).toString()}.${(v % 100000000n).toString().padStart(8, "0")}`;
}
/** A temporary repo root holding a copy of the site manifest and the Ukemi data files (the pending snapshot too while the
 *  tree carries one), rewritable per mutant; drop removes a file and its manifest entry. */
function tmpRoot(): { root: string; write: (rel: string, value: Json) => void; drop: (rel: string) => void; cleanup: () => void } {
  const root = mkdtempSync(join(tmpdir(), "ukemi-course-"));
  mkdirSync(join(root, "apps", "site", "data"), { recursive: true });
  const manifestRel = "apps/site/data/manifest.sha256.json";
  const manifest = obj(JSON.parse(read(manifestRel)) as unknown, "manifest");
  const files = obj(manifest.files, "manifest.files");
  const write = (rel: string, value: Json): void => {
    const text = JSON.stringify(value, null, 2) + "\n";
    writeFileSync(join(root, ...rel.split("/")), text);
    files[rel] = sha256(text);
    writeFileSync(join(root, ...manifestRel.split("/")), JSON.stringify(manifest, null, 2) + "\n");
  };
  write(UKEMI_COURSE_REL, rawCourse());
  write(UKEMI_SERVED_REL, obj(JSON.parse(read(UKEMI_SERVED_REL)) as unknown, "served file"));
  if (existsSync(join(ROOT, PENDING_REL))) write(PENDING_REL, obj(JSON.parse(read(PENDING_REL)) as unknown, "pending file"));
  const drop = (rel: string): void => {
    rmSync(join(root, ...rel.split("/")), { force: true });
    delete files[rel];
    writeFileSync(join(root, ...manifestRel.split("/")), JSON.stringify(manifest, null, 2) + "\n");
  };
  return { root, write, drop, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

/* UKEMI-PENDING-SNAPSHOT-1 (G0 section 11): an in-process fact of the class is pinned against the pending snapshot while one
 * exists, else the served file; the pages keep the served one. The new functions are read by import() (red by assertion). */
const PENDING_REL = "apps/site/data/ukemi-pending.json";
type Loader = typeof import("../apps/site/lib/ukemi-served-load.ts");
type Sync = typeof import("../scripts/sync-ukemi-served.mjs");
type Pinned = ReturnType<Loader["loadUkemiInProcess"]>;
async function pendingLoader(): Promise<Loader> {
  const m = await import("../apps/site/lib/ukemi-served-load.ts");
  assert.equal(typeof (m as Partial<Loader>).loadUkemiInProcess, "function", "the loader reads a pending snapshot (UKEMI-PENDING-SNAPSHOT-1)");
  return m;
}
async function pendingSync(): Promise<Sync> {
  const m = await import("../scripts/sync-ukemi-served.mjs");
  assert.equal(typeof (m as Partial<Sync>).inProcessUkemiPending, "function", "the sync has a --pending mode (UKEMI-PENDING-SNAPSHOT-1)");
  return m;
}
/** The target of the in-process pins under `root`: its pending snapshot while one exists, else its served one. */
const pinTarget = async (root: string): Promise<Pinned> => (await pendingLoader()).loadUkemiInProcess(root);
/** A verdict without the served-only body digest (the pending snapshot's eight keys). */
const bareVerdict = (v: unknown): Json => Object.fromEntries(Object.entries(obj(v, "liq_verdict")).filter(([k]) => k !== "body_sha256"));
/** The pending snapshot a served file implies: its shared fields, the verdict without body_sha256, written a day after C2. */
const pendingOf = (served: Json): Json => ({
  $comment: "staged", schema: "monark-site-ukemi-pending-v1", written_at: "2026-10-05T12:00:00.000Z", served_class: served.served_class, registry_state: served.registry_state,
  liq_clause: served.liq_clause, cascade_uncalibrated_sentence_served: served.cascade_uncalibrated_sentence_served, liq_verdict: bareVerdict(served.liq_verdict),
});
/** The facts of this tree's harness: the committed pending snapshot while one exists, else the ones the served file implies. */
const currentPending = (): Json => (existsSync(join(ROOT, PENDING_REL)) ? obj(JSON.parse(read(PENDING_REL)) as unknown, "pending file") : pendingOf(rawServed()));
/** A served file carrying pending_since: the day C2 marks it (a --pending of C', a day later, keeps it). */
const marked = (served: Json): Json => ({ ...served, pending_since: "2026-10-04" });
/** A served file equal to this tree on every shared field (body digests and read_at of the committed one). */
const treeServed = (): Json => {
  const s = rawServed(), p = currentPending();
  return { ...s, liq_clause: p.liq_clause, registry_state: p.registry_state, cascade_uncalibrated_sentence_served: p.cascade_uncalibrated_sentence_served, liq_verdict: { ...obj(p.liq_verdict, "pending liq_verdict"), body_sha256: obj(s.liq_verdict, "liq_verdict").body_sha256 } };
};
/** Another tree's facts on a snapshot: another clause (well formed) and another calibration digest. */
const otherClause = (x: Json): Json => ({ ...x, liq_clause: `${String(x.liq_clause)}; a clause of another tree` });
const otherDigest = (x: Json): Json => ({ ...x, liq_verdict: { ...obj(x.liq_verdict, "liq_verdict"), calibration_digest: sha256(`another tree ${String(x.liq_clause)}`) } });
/** The served file of an older tree, marked: another clause and another digest. */
const olderServed = (): Json => marked(otherDigest(otherClause(treeServed())));
/** Run `fn` on a temporary root with the given served file and pending snapshot (none: null; listed unless told), removed after. */
async function withStage(served: Json, pending: Json | null, fn: (root: string) => unknown, listed = true): Promise<void> {
  const t = tmpRoot();
  try {
    t.drop(PENDING_REL);
    t.write(UKEMI_SERVED_REL, served);
    if (pending !== null && listed) t.write(PENDING_REL, pending);
    else if (pending !== null) writeFileSync(join(t.root, ...PENDING_REL.split("/")), JSON.stringify(pending, null, 2) + "\n");
    await fn(t.root);
  } finally {
    t.cleanup();
  }
}
/** l.1175 (1) and l.1488: the target's calibration digest is the scores_sha256 of its committed stratum (contract 1.1.0). */
function digestPin(v: Pinned["liq_verdict"]): void {
  assert.ok(v !== null, "the target carries a verdict");
  const k = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(v.stratum)}`);
  assert.equal(v.calibration_digest, scoresSha256(k?.scores ?? []), "the synced digest is the scores_sha256 of its committed stratum (the pending one, while it exists)");
}
/** l.1633: two in-process answers on the target's stratum carry its calibration digest. */
function gatePin(v: Pinned["liq_verdict"]): void {
  const cut = STRATA_CUTS_SERVED[0];
  assert.ok(v !== null && cut !== undefined, "a dated served verdict and the first served cut");
  const digests = [1, cut - 1].map((yhat) => {
    assert.equal(strateOf(yhat), v.stratum, "the probe falls in the stratum of the served verdict");
    return runGate({ schema_version: "1.1.0", task_class: TASK_LIQ_ELIGIBLE, yhat, predictor_id: "ukemi:site-copy-check", produced_at: "2026-09-24T00:00:00Z" }, LIQ_TEST_PARAMS).verdict.scores_sha256;
  });
  assert.deepEqual(digests, [v.calibration_digest, v.calibration_digest], `the page says: ${DIGEST_NOTE}`);
}
/** Test 4: what --pending writes today equals the target on every shared field (the verdict's eight keys). */
async function syncPin(s: Pinned): Promise<void> {
  const { UKEMI_PENDING_SHARED } = await pendingLoader();
  const shared = (x: Json): Json => Object.fromEntries(UKEMI_PENDING_SHARED.map((k) => [k, k === "liq_verdict" ? bareVerdict(x[k]) : x[k]]));
  const written = await (await pendingSync()).inProcessUkemiPending("2026-10-05T12:00:00.000Z");
  assert.deepEqual(shared(written as unknown as Json), shared(s as unknown as Json), "--pending writes the in-process facts: the target's, on every shared field");
}
/** The five in-process places, on the target of `root` (syncPin compares the in-process clause, class and cascade flag). */
async function pinsHold(root: string): Promise<void> {
  const s = await pinTarget(root);
  assert.equal(s.registry_state, hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE) ? "committed" : "empty", "the target's state is the harness registry's");
  digestPin(s.liq_verdict);
  gatePin(s.liq_verdict);
  await syncPin(s);
}
/** Every string a view carries, flattened. */
function viewStrings(v: CourseView): string[] {
  const out: string[] = [v.eyebrow, v.served_lead, v.served_clause, v.served_note, v.unit_note, v.multi_call, v.reconciliation,
    v.liquidated_amounts, v.oracle, v.oracle_anchor, v.population, v.zero_rule, v.labels, v.clause, v.report_digest,
    v.report_digest_note, v.digests_note, ...v.reading];
  if (v.oracle_bias !== null) out.push(v.oracle_bias);
  for (const r of v.rows) out.push(r.label, r.range, r.points, r.bound, r.comparison, r.outcome, r.liquidated);
  for (const d of v.digests) out.push(d.label, d.value);
  out.push(v.zero_rule_accounts_lead, v.verification_summary, v.verification_lead, v.verification_gloss);
  for (const a of v.zero_rule_accounts) out.push(a.address, a.href);
  for (const p of v.verification) out.push(p.label, p.value);
  return out;
}
/** Every numeric token carried by a JSON value: number leaves, and the numeric tokens inside string leaves. */
function numericTokensOf(v: unknown, acc: Set<string>): Set<string> {
  if (typeof v === "number") acc.add(String(v));
  else if (typeof v === "string") for (const tok of v.match(/\d+(?:[.,]\d+)*/g) ?? []) acc.add(tok);
  else if (Array.isArray(v)) for (const x of v) numericTokensOf(x, acc);
  else if (v !== null && typeof v === "object") for (const x of Object.values(v as Json)) numericTokensOf(x, acc);
  return acc;
}

test("site_ukemi_course_loader_maps_named_fields — every loaded value equals its JSON path in the hashed report copy", () => {
  const raw = rawCourse();
  const body = obj(raw.body, "body");
  const c = loadUkemiCourse(ROOT);
  // Digest: recomputed here with an independent canonical JSON (the recipe the page states in words).
  assert.equal(c.body_digest, raw.body_digest);
  assert.equal(sha256(canon(body)), c.body_digest, "body_digest must be the sha256 of the canonical JSON of body");
  assert.equal(c.event_id, body.event_id);
  const h3 = obj(body.h3, "h3");
  const h2 = list(obj(body.h2, "h2").strata, "h2.strata");
  const strata = list(h3.strata, "h3.strata");
  assert.equal(c.strata.length, strata.length);
  strata.forEach((s, i) => {
    const o = obj(s, "stratum"), fresh = obj(o.fresh, "fresh"), e2 = obj(o.e2, "e2");
    const x = c.strata[i];
    assert.ok(x !== undefined);
    assert.equal(x.n, fresh.n, `stratum ${String(i)} n = h3.strata[i].fresh.n`);
    assert.equal(x.meets_floor, o.served, "meets_floor = the report flag h3.strata[i].served (committable, NOT a served state)");
    assert.equal(x.n_min, obj(h2[i], "h2 row").n_min, "n_min = h2.strata[i].n_min");
    assert.equal(x.outcome, o.verdict);
    assert.equal(x.trials, e2.n, "trials = h3.strata[i].e2.n");
    assert.equal(x.quantile_rank, fresh.p, "quantile_rank = h3.strata[i].fresh.p");
    if (o.served === true) {
      assert.equal(x.covered, e2.k_covered);
      assert.equal(x.at_zero, e2.atoms_at_zero, "at_zero = h3.strata[i].e2.atoms_at_zero");
      assert.equal(x.level, o.level);
      assert.equal(x.bound_is_largest_score, fresh.qhat_is_max);
      assert.equal(x.bound_margin, dec8(String(fresh.qhat)), "bound_margin = h3.strata[i].fresh.qhat in 8-decimal form"); assert.equal(x.bound_margin_base, fresh.qhat, "bound_margin_base = h3.strata[i].fresh.qhat (exact integer string)");
      assert.equal(x.cross_episode_bound, o.barber_thm2_bound);
    } else {
      assert.equal(x.covered, null);
      assert.equal(x.bound_margin, null); assert.equal(x.bound_margin_base, null, "no base margin below the floor");
    }
  });
  const pooled = obj(h3.pooled, "pooled"), pe = obj(pooled.e2, "pooled e2"), pf = obj(pooled.fresh, "pooled fresh");
  assert.deepEqual([c.pooled.n, c.pooled.covered, c.pooled.trials, c.pooled.at_zero, c.pooled.outcome, c.pooled.level],
    [pf.n, pe.k_covered, pe.n, pe.atoms_at_zero, pooled.verdict, pooled.level]);
  assert.equal(c.pooled.bound_margin, dec8(String(pf.qhat)));
  assert.deepEqual(c.committable, h3.served_strata, "committable = h3.served_strata");
  const h6 = obj(body.h6, "h6"), sb = obj(h6.served_blocks, "h6 sampled");
  assert.equal(c.h6.lag_bound, h6.max_lag_bound, "lag_bound = h6.max_lag_bound (the pre-registered bound)");
  assert.equal(c.h6.sampled.max_lag, sb.max_lag, "sampled.max_lag = h6.served_blocks.max_lag (the MEASURED lag)");
  assert.equal(c.h6.sampled.n, sb.n, "sampled.n = h6.served_blocks.n (the values checked)");
  assert.equal(c.h6.series.n_updates, obj(h6.series, "series").n_updates, "series.n_updates = h6.series.n_updates (the series length)");
  assert.equal(c.h6.anchor.price, dec8(String(obj(h6.anchor, "anchor").price)));
  assert.equal(c.h6.sample_note_present, typeof h6.sample_note === "string");
  const clause = obj(body.clause_359, "clause");
  assert.deepEqual([c.clause_359.no_non_on_committable, c.clause_359.unresolved, c.clause_359.condition_satisfied],
    [clause.h3_no_NON_on_served_strata, clause.labels_no_quorum_unresolved, clause.condition_satisfied]);
  const h4 = obj(body.h4, "h4"), hp = obj(h4.pooled, "h4 pooled");
  assert.deepEqual([c.h4.liquidated_amounts.sum, c.h4.liquidated_amounts.after_first_call, c.h4.liquidated_amounts.deficit_apart],
    [dec8(String(hp.sum_y)), dec8(String(hp.sum_after_first)), dec8(String(hp.sum_deficit_apart))]);
  const q0 = obj(body.q0_rule_failures, "q0");
  assert.deepEqual(c.zero_rule.missed_amounts, list(q0.without_crossing, "q0 misses").map((m) => dec8(String(obj(m, "miss").y))));
  // Provenance: digests only, NO path anywhere in the exported copy (a path would name a file absent from the mirror).
  const prov = obj(raw.provenance, "provenance");
  assert.deepEqual(Object.keys(prov).sort(), ["event_id", "inputs", "node", "tool"], "provenance carries digests only");
  assert.deepEqual(Object.keys(obj(prov.tool, "tool")), ["sha256_lf"], "the tool entry carries its digest only (no rel path)");
  const inputs = obj(prov.inputs, "inputs");
  for (const [name, entry] of Object.entries(inputs)) assert.deepEqual(Object.keys(obj(entry, name)), ["sha256_lf"], `input ${name} carries its digest only`);
  assert.equal(c.digests.tool, obj(prov.tool, "tool").sha256_lf);
  assert.equal(c.digests.prereg, obj(inputs.prereg, "prereg").sha256_lf);
  const walk = (v: unknown, path: string): void => {
    if (v !== null && typeof v === "object") {
      for (const [k, x] of Object.entries(v as Json)) {
        assert.notEqual(k, "rel", `a path key rides at ${path}.${k}`);
        walk(x, `${path}.${k}`);
      }
    }
  };
  walk(raw, "file");
  // The a-priori stratum cuts shown are the SERVED cuts of the gate (base-currency integers, 8 decimals).
  assert.deepEqual(c.strata_cuts.map((s) => Number(s.replace(".", ""))), [...STRATA_CUTS_SERVED], "display.strata_cuts = STRATA_CUTS_SERVED in 8-decimal form");
});

test("site_ukemi_course_loader_fails_closed — manifest, digest, outcome, amount, floor-flag and shape mutants red the loader", () => {
  const t = tmpRoot();
  try {
    assert.doesNotThrow(() => loadUkemiCourse(t.root), "the unmodified copy loads");
    const mutate = (f: (file: Json) => void, rehashBody: boolean): void => {
      const file = rawCourse();
      f(file);
      if (rehashBody) file.body_digest = sha256(canon(file.body));
      t.write(UKEMI_COURSE_REL, file);
    };
    const firstStratum = (f: Json, i: number): Json => obj(list(obj(obj(f.body, "body").h3, "h3").strata, "strata")[i], `stratum ${String(i)}`);
    // (a) manifest mismatch: one byte changed after hashing.
    t.write(UKEMI_COURSE_REL, rawCourse());
    writeFileSync(join(t.root, ...UKEMI_COURSE_REL.split("/")), JSON.stringify(rawCourse(), null, 2) + "\n ");
    assert.throws(() => loadUkemiCourse(t.root), /sha256 mismatch/, "a byte changed after hashing reds (manifest)");
    // (b) body edited, digest NOT recomputed: the canonical-body check reds.
    mutate((f) => { obj(obj(f.body, "body").h5, "h5").population_mono_weth = 1; }, false);
    assert.throws(() => loadUkemiCourse(t.root), /canonical body/, "an edited body reds (body_digest recomputed at load)");
    // (c) an outcome outside the pre-registered vocabulary.
    mutate((f) => { firstStratum(f, 0).verdict = "MAYBE"; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /pre-registered outcome/, "an unknown outcome reds");
    // (d) a display amount that does not render its source integer.
    mutate((f) => { obj(f.display, "display").pooled_qhat = "1261.84298997"; }, false);
    assert.throws(() => loadUkemiCourse(t.root), /does not render its source amount/, "a tampered display amount reds");
    // (e) the report flag flipped against n / n_min (a stratum below the floor marked committable).
    mutate((f) => { firstStratum(f, 3).served = true; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /floor flags/, "a floor flag that disagrees with n and n_min reds");
    // (f) an extra top-level key (e.g. a path re-added beside the digests).
    mutate((f) => { f.rel = "scripts/x.mjs"; }, false);
    assert.throws(() => loadUkemiCourse(t.root), /must carry exactly/, "an extra top-level key reds");
    // (g) the cross-episode statement changed: the page must never render an unknown claim.
    mutate((f) => { obj(obj(obj(f.body, "body").h3, "h3").pooled, "pooled").barber_thm2_bound = "estimated"; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /not_estimated/, "an estimated cross-episode bound is not rendered silently");
    // The report must agree with itself by the course tool's rules; each edit below is re-hashed (body_digest and
    // manifest consistent), so only these checks catch it at build time.
    const h6Of = (f: Json): Json => obj(obj(f.body, "body").h6, "h6");
    // (h) J2: the measured lag lowered without its histogram.
    mutate((f) => { obj(h6Of(f).served_blocks, "served_blocks").max_lag = 1; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /max_lag is not the largest lag/, "J2: a lag edited without its histogram reds");
    // (i) J3: a committable stratum's outcome flipped without its p-value.
    mutate((f) => { firstStratum(f, 0).verdict = "NON"; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /disagrees with its p-value/, "J3: an outcome edited without its p-value reds");
    // (j) J3': outcome AND p-value flipped together, lists untouched: a NON on a committable stratum must be listed.
    mutate((f) => { const s0 = firstStratum(f, 0); s0.verdict = "NON"; s0.p_value = { num: "1", den: "1000", dec12: "0.001000000000" }; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /non_on_served_strata/, "J3': an unlisted NON on a committable stratum reds");
    // (k) the condition flipped against its two inputs.
    mutate((f) => { obj(obj(f.body, "body").clause_359, "clause_359").condition_satisfied = false; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /condition disagrees with its two inputs/, "a condition flipped against its inputs reds");
    // (l) an H-4 outcome flipped against its count at the threshold.
    mutate((f) => { obj(obj(obj(f.body, "body").h4, "h4").all_liquidated, "all_liquidated").verdict = "OUI"; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /count at the threshold/, "an H-4 outcome edited without its count reds");
    // (m) the H-6 outcome flipped against its violations.
    mutate((f) => { h6Of(f).verdict = "NON"; }, true);
    assert.throws(() => loadUkemiCourse(t.root), /h6 outcome disagrees/, "an H-6 outcome edited without its violations reds");
  } finally {
    t.cleanup();
  }
});

test("site_ukemi_course_view_words_bound_to_files — committable never reads served; zeros, measured lag, bias, clause and served state ride from the files", () => {
  const c = loadUkemiCourse(ROOT);
  const s = loadUkemiServed(ROOT);
  const v = buildCourseView(c, s);
  const body = obj(rawCourse().body, "body");
  const h6 = obj(body.h6, "h6"), sb = obj(h6.served_blocks, "h6 sampled");
  // (1) The report flag never reads as a served state: no row carries the word "served".
  for (const r of v.rows) assert.ok(!/\bserved\b/i.test(r.label + r.outcome), `row ${r.key} must not say served: ${r.label}`);
  const first = v.rows[0];
  assert.ok(first !== undefined && first.label.includes("meets the floor"), "a committable stratum reads 'meets the floor'");
  // (2) The zero-scored trials ride next to every ratio.
  const s0 = obj(list(obj(body.h3, "h3").strata, "strata")[0], "s0"), e2 = obj(s0.e2, "e2");
  assert.equal(first.comparison, `${String(e2.k_covered)} / ${String(e2.n)} (${String(e2.atoms_at_zero)} scored zero)`);
  // (3) The MEASURED lag and the pre-registered bound are both named, over the values actually checked.
  assert.ok(v.oracle.includes(`Measured maximum lag ${String(sb.max_lag)} update`), "the measured lag = h6.served_blocks.max_lag");
  assert.ok(v.oracle.includes(`pre-registered bound ${String(h6.max_lag_bound)} update`), "the bound = h6.max_lag_bound");
  assert.ok(v.oracle.startsWith(`Oracle values the protocol read at the liquidation call blocks and at the block before each: ${String(sb.n)} values`), "the sample = h6.served_blocks.n (call blocks and the block before each)");
  // (4) The declared sampling bias rides iff the report declares it, without its internal reference.
  assert.equal(v.oracle_bias !== null, typeof h6.sample_note === "string");
  assert.ok(v.oracle_bias === null || !/ADR|\d/.test(v.oracle_bias), "the bias sentence carries no internal reference");
  // (5) No cross-episode coverage bound is estimated: stated with the outcomes.
  assert.ok(v.reading.some((l) => l.includes("estimates no coverage bound across episodes")));
  assert.ok(v.reading.some((l) => l.includes("largest calibration score observed")), "the stratum bound margin is named the largest score (fresh.p = fresh.n)");
  // (6) The clause is bound to its fields (mutant: flip the no-NON flag => the words change) and says it changes nothing served.
  assert.ok(v.clause.includes("(true)") && v.clause.includes("changes nothing that is served"));
  const flipped: UkemiCourse = structuredClone(c);
  flipped.clause_359.no_non_on_committable = false;
  flipped.clause_359.condition_satisfied = false;
  const vf = buildCourseView(flipped, s);
  assert.notEqual(vf.clause, v.clause, "flipping h3_no_NON_on_served_strata changes the rendered clause");
  assert.ok(vf.clause.includes("(false)") && vf.clause.includes("not satisfied"));
  // (7) The served state is the synced served clause, verbatim; its note follows the registry state.
  assert.equal(v.served_clause, s.liq_clause);
  const committedServed: UkemiServed = { ...s, registry_state: "committed" };
  assert.equal(v.served_note.includes("no stratum below is served"), s.registry_state === "empty");
  assert.ok(!buildCourseView(c, committedServed).served_note.includes("no stratum below is served"), "a committed registry drops the not-served note");
  // (8) Inverse of the digit-free gate, over the leaves the page READS: every numeric token the view renders is carried
  // by a body leaf (never body.summary, never the internal reference of h6.sample_note), a display leaf, a provenance
  // digest, body_digest, or a served leaf (never $comment). Set membership only closes the set; the golden test below
  // pins each number to its JSON path and its position.
  const course = rawCourse();
  const readBody: Json = { ...obj(course.body, "body") };
  delete readBody.summary;
  const readH6: Json = { ...obj(readBody.h6, "body.h6") };
  delete readH6.sample_note;
  readBody.h6 = readH6;
  const readServed: Json = { ...rawServed() };
  delete readServed.$comment;
  const allowed = new Set<string>();
  for (const leafSet of [readBody, course.display, course.provenance, course.body_digest, readServed]) numericTokensOf(leafSet, allowed);
  const summaryOnly = [...numericTokensOf(obj(course.body, "body").summary, new Set<string>())].filter((tok) => !allowed.has(tok));
  assert.ok(summaryOnly.length > 0, "control: the summary carries numbers outside the allowed leaves (it is excluded, not merely unused)");
  const exempt = exemptValues(loadExemptFile(ROOT));
  for (const text of viewStrings(v)) {
    for (const tok of scanText(text, exempt)) assert.ok(allowed.has(tok), `rendered numeric token ${tok} is carried by no field of the two files: ${JSON.stringify(text.slice(0, 60))}`);
  }
  // (9) The only account addresses rendered are the report's zero-rule accounts (body.q0_rule_failures.without_crossing,
  // public on-chain accounts, shown with their explorer page by decision of the owner); never another address, never the
  // report's summary lines (French quote, internal references). Mutant: render an address that is not a zero-rule
  // account (or drop the explorer link) => red.
  const summary = list(body.summary, "summary").map(String);
  const zeroRuleAccounts = list(obj(body.q0_rule_failures, "q0").without_crossing, "without_crossing").map((m) => String(obj(m, "miss").address));
  assert.deepEqual(v.zero_rule_accounts.map((a) => a.address), zeroRuleAccounts, "the rendered accounts are exactly the zero-rule accounts, in report order");
  for (const a of v.zero_rule_accounts) assert.equal(a.href, `https://etherscan.io/address/${a.address}`, "each account links to its explorer page");
  for (const text of viewStrings(v)) {
    for (const addr of text.match(/0x[0-9a-f]{40}/gi) ?? []) assert.ok(zeroRuleAccounts.includes(addr), `an address outside the zero-rule accounts is rendered: ${addr}`);
    for (const line of summary) assert.ok(!text.includes(line), "no report summary line is rendered");
    assert.ok(!/licencie|\bADR\b|prereg line|decision \d/i.test(text), `no French or internal reference: ${text.slice(0, 60)}`);
  }
  // (10) The p-values ride only in the folded verification block, each with the exact gloss (decision of the owner).
  assert.equal(v.verification_gloss, "exchangeability test p-value (beta-binomial), not a probability of being right");
  const page = read("apps/site/app/ukemi/course/page.tsx");
  assert.match(page, /<details[^>]*>\s*<summary[^>]*>\s*\{v\.verification_summary\}\s*<\/summary>/, "the verification block is a folded <details>");
  assert.match(page, /\{p\.value\}<\/span> · \{v\.verification_gloss\}/, "each p-value renders beside the gloss");
  const pvalues = v.verification.map((p) => p.value);
  for (const text of viewStrings(v).filter((t) => !pvalues.includes(t))) {
    for (const pv of pvalues) assert.ok(!text.includes(pv), `a p-value rides outside the verification block: ${text.slice(0, 60)}`);
  }
});

test("site_ukemi_course_view_types_no_digit — the view module and the course page type no number (every number is a loaded field)", () => {
  const viewRel = "apps/site/lib/ukemi-course-view.ts";
  const sf = ts.createSourceFile(viewRel, read(viewRel), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const literals: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) return; // module specifiers are not rendered
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) literals.push(node.text);
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) literals.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  assert.ok(literals.length > 20, "the view module's literals were collected (false green)");
  // The site's CLOSED exempt list (test 44) is the only escape: it lets the algorithm name SHA-256 ride, nothing else.
  const exempt = exemptValues(loadExemptFile(ROOT));
  for (const lit of literals) assert.deepEqual(scanText(lit, exempt), [], `a typed digit in the view module: ${JSON.stringify(lit)}`);
  assert.ok(scanText("share at most 5/100", NO_EXEMPT).length > 0, "detector control: a typed digit is flagged");
  const pageRel = "apps/site/app/ukemi/course/page.tsx";
  assert.deepEqual(scanSource(read(pageRel), "tsx", NO_EXEMPT), [], "the course page renders no numeric literal");
  const page = parseTsx(pageRel, read(pageRel));
  assert.ok(jsxChildIdentifiers(page).has("LIQ_H3_SENTENCE"), "the H-3 caveat renders as {LIQ_H3_SENTENCE} (byte-identical to the gate module)");
  const typed = renderedTexts(page).map((r) => r.text).join(" ").replace("what is served", "");
  assert.ok(!/\bserved\b/.test(typed), "the page types no other 'served' claim");
});

// killer: scripts/sync-ukemi-served.mjs:234 CONST "return marked;" -> "return JSON.stringify({ ...JSON.parse(text), pending_since: day }, null, 2) + \"\\n\";"
test("site_ukemi_served_state_bound_to_harness_registry — synced served state = repository registry; clause = gate module text; loader fails closed", async () => {
  const s = await pinTarget(ROOT);
  const committed = hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE);
  // The site renders the served state of the synced file (/ukemi, /, /fleet, /ukemi/course), so the synced state must be
  // the harness registry's: at a registry change this reds until the site is switched and re-synced (UKEMI-SITE-SWITCH-1).
  // While a pending snapshot exists (time (i) of a block to T0), the in-process facts are pinned against it instead.
  assert.equal(s.registry_state, committed ? "committed" : "empty", "the synced served state must equal the harness registry state");
  assert.equal(servedCarrierOf(s.registry_state), committed ? "LIQ_COMMITTED_STATE_NOTE" : "LIQ_EMPTY_REGISTRY_SENTENCE", "the /ukemi served sentence follows the harness registry state: switch it and re-sync");
  const expected = committed
    ? `the served region is ${GATE_LIQ_UPPER_BOUND_SENTENCE}; ${GATE_LIQ_REQUIREMENTS_SENTENCE}; ${GATE_LIQ_H3_SENTENCE}; ${GATE_LIQ_CONDITIONAL_SENTENCE}`
    : `${GATE_LIQ_EMPTY_REGISTRY_SENTENCE}; ${GATE_LIQ_REQUIREMENTS_SENTENCE}; ${GATE_LIQ_CONDITIONAL_SENTENCE}`;
  assert.equal(s.liq_clause, expected, "the synced clause is the gate module's clause for that state, verbatim");
  assert.equal(s.served_class, TASK_LIQ_ELIGIBLE);
  assert.equal(s.cascade_uncalibrated_sentence_served, true, "the served cascade text carries the sentence the fleet panel renders");
  // --pending marks the served file with pending_since alone: no other byte touched, kept on a second run, same projection.
  const sync = await pendingSync();
  const text = read(UKEMI_SERVED_REL).replace(/^ {2}"pending_since": "[^"]+",\r?\n/m, ""), markedText = sync.markPendingSince(text, "2026-10-04");
  assert.equal(markedText.replace('  "pending_since": "2026-10-04",\n', ""), text, "pending_since is inserted after read_at, no other byte of the served file touched");
  assert.equal(sync.markPendingSince(markedText, "2026-12-01"), markedText, "a second --pending keeps the first pending_since");
  assert.throws(() => sync.markPendingSince(text.replace(/^ {2}"read_at": .*\n/m, ""), "2026-10-04"), /read_at/, "a served file without its read_at line is refused");
  await withStage(obj(JSON.parse(markedText) as unknown, "marked file"), currentPending(), (r) => { assert.deepEqual(loadUkemiServed(r), loadUkemiServed(ROOT), "pending_since is admitted and never rendered: the same served projection"); });
  const t = tmpRoot();
  try {
    assert.doesNotThrow(() => loadUkemiServed(t.root));
    t.write(UKEMI_SERVED_REL, { ...rawServed(), registry_state: "served" });
    assert.throws(() => loadUkemiServed(t.root), /registry_state/, "an unknown registry state reds");
    t.write(UKEMI_SERVED_REL, { ...rawServed(), registry_state: s.registry_state === "empty" ? "committed" : "empty" });
    assert.throws(() => loadUkemiServed(t.root), new RegExp(`does not open with the ${s.registry_state === "empty" ? "committed" : "empty"} clause`), "a state that disagrees with its clause reds");
    t.write(UKEMI_SERVED_REL, { ...rawServed(), extra: 1 });
    assert.throws(() => loadUkemiServed(t.root), /must carry exactly/, "an extra key reds");
    t.write(UKEMI_SERVED_REL, rawServed());
    writeFileSync(join(t.root, ...UKEMI_SERVED_REL.split("/")), JSON.stringify(rawServed(), null, 2) + "\n ");
    assert.throws(() => loadUkemiServed(t.root), /sha256 mismatch/, "a byte changed after hashing reds");
  } finally {
    t.cleanup();
  }
});

test("site_ukemi_prose_abstains_under_calib — no /ukemi sentence pairs under_calib with a deferral (served: abstain, reason under_calib)", () => {
  const prose: string[] = [HERO_TITLE, HERO_DEK, REGION_NOTE, COVERAGE_NOTE, STATES_NOTE, SERVED_STATE_LEAD, SERVED_COMMITTED_LEAD, LIQ_COMMITTED_STATE_NOTE, COURSE_POINTER_LEAD, COURSE_POINTER_TAIL, ...IS_LIST, ...IS_NOT_LIST,
    FIGURES_LEAD, FIGURE_POINTS_LABEL, FIGURE_MARGIN_LABEL, BOUND_UNIT, FIGURE_MARGIN_NOTE, FIGURE_DIGEST_LABEL, DIGEST_NOTE];
  for (const st of METHOD_STEPS) prose.push(st.title, st.detail);
  for (const l of LIMITS) prose.push(l.title, l.detail);
  const pairs = (text: string): string[] => text.split(/(?<=[.;])\s+/).filter((x) => /under_calib/.test(x) && /\bdefer/i.test(x));
  for (const text of prose) assert.deepEqual(pairs(text), [], `under_calib is an abstention, never a deferral: ${JSON.stringify(text.slice(0, 80))}`);
  assert.equal(pairs("It defers, marked under_calib, when there are too few points.").length, 1, "detector control: the former sentence reds");
  assert.ok(/abstain/i.test(STATES_NOTE) && /under_calib/.test(STATES_NOTE), "the states note names the abstention with under_calib");
  // No unfulfilled promise and no unserved capability left bare.
  for (const text of [HERO_TITLE, HERO_DEK, ...IS_LIST]) {
    assert.ok(!/\battested\b/i.test(text), `'attested' before the book witness is served: ${text.slice(0, 60)}`);
    assert.ok(!/anyone can recompute/i.test(text), `unfulfilled promise: ${text.slice(0, 60)}`);
  }
  assert.ok(/once a stratum is committed/.test(HERO_TITLE) && /once a stratum is committed/.test(HERO_DEK), "the capability is stated conditionally on the commit");
  assert.ok(read(UKEMI_ROUTE_REL).includes("once a stratum is committed"), "the /ukemi metadata description states the bound conditionally on the commit");
});

test("site_ukemi_panel_served_text — panel copy byte-identical to the gate module; no interval; register line read, not typed", () => {
  assert.equal(CASCADE_UNCALIBRATED_SENTENCE, GATE_CASCADE_UNCALIBRATED_SENTENCE, "the panel's cascade sentence equals the gate module's, byte for byte");
  assert.equal(LIQ_TASK_CLASS, TASK_LIQ_ELIGIBLE, "the panel's class id equals the gate module's");
  const rel = "apps/site/components/ukemi-panel.tsx";
  const sf = parseTsx(rel, read(rel));
  const children = jsxChildIdentifiers(sf);
  for (const id of ["CASCADE_UNCALIBRATED_SENTENCE", "LIQ_TASK_CLASS", "UKEMI_LINE"]) assert.ok(children.has(id), `the panel renders {${id}}`);
  const texts = renderedTexts(sf).map((r) => r.text);
  for (const text of [...texts, CASCADE_UNCALIBRATED_SENTENCE]) assert.ok(!/interval/i.test(text), `A-9 on the panel: no 'interval' in ${JSON.stringify(text.slice(0, 60))}`);
  const ukemi = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  assert.ok(ukemi !== undefined);
  assert.ok(!texts.some((x) => x.includes(ukemi.line)), "the register line is read from lib/fleet.ts, never retyped in the panel");
  assert.ok(!texts.some((x) => /to be announced/i.test(x)), "the published course is not announced as upcoming");
  assert.ok(read(rel).includes("href={UKEMI_COURSE_ROUTE}"), "the Living proof block links the course page");
  // No calibration adjective and no roadmap promise in a built block (the class is under_calib by construction; the
  // served convention of the gate module excludes the marketing "calibrated" adjective and "V1").
  for (const text of [...texts, CASCADE_UNCALIBRATED_SENTENCE, LIQ_TASK_CLASS]) {
    assert.ok(!/\bcalibrated\b/i.test(text), `no 'calibrated' adjective in the panel: ${JSON.stringify(text.slice(0, 60))}`);
    assert.ok(!/first version|to be replaced|\bV1\b/i.test(text), `no roadmap promise in the panel: ${JSON.stringify(text.slice(0, 60))}`);
  }
  // The served sentence ends "on this class": the JSX text right before it names the class it applies to.
  const before = jsxTextBefore(sf, "CASCADE_UNCALIBRATED_SENTENCE");
  assert.ok(/\bclass,\s*$/.test(before), `the served cascade sentence is preceded by its class: ${JSON.stringify(before.slice(-60))}`);
  // The shared "What's inside" points may ride in the panel only if none contradicts the served cascade sentence (A-9
  // "interval", or a gate that conforms the cascade): every insideFor("<key>") the panel calls is checked, so the block
  // cannot return before its shared point is corrected.
  const insideKeys: string[] = [];
  const visitCalls = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "insideFor") {
      const a = node.arguments[0];
      assert.ok(a !== undefined && ts.isStringLiteral(a), "insideFor is called with a literal key");
      insideKeys.push(a.text);
    }
    ts.forEachChild(node, visitCalls);
  };
  visitCalls(sf);
  const contradicting = (points: readonly string[]): string[] => points.filter((p) => /interval/i.test(p) || /conformed by the gate/i.test(p));
  for (const key of insideKeys) assert.deepEqual(contradicting(insideFor(key).points), [], `insideFor("${key}") contradicts the served cascade sentence`);
  assert.equal(contradicting(["A conformal interval for the cascade, conformed by the gate", "Network clearing fixed point"]).length, 1, "detector control");
  // Branchement: every prop the panel declares is passed by a page (an optional prop no page passes is an unwired piece).
  const props = destructuredProps(sf, "UkemiPanel");
  assert.ok(props.length > 0, "the panel's props were read (false green)");
  const passed = new Set<string>();
  const walkApp = (dir: string): void => {
    for (const name of readdirSync(join(ROOT, ...dir.split("/")))) {
      const child = `${dir}/${name}`;
      if (statSync(join(ROOT, ...child.split("/"))).isDirectory()) walkApp(child);
      else if (child.endsWith(".tsx")) for (const attr of jsxAttributesOf(parseTsx(child, read(child)), "UkemiPanel")) passed.add(attr);
    }
  };
  walkApp("apps/site/app");
  for (const p of props) assert.ok(passed.has(p), `the panel declares '${p}' but no page passes it (unwired piece)`);
});

test("site_ukemi_no_provider_or_operator_name — the Ukemi data files and sources name no data provider or RPC operator", () => {
  // Literals confined to this NON-exported root test (an exported vocabulary file would publish them).
  const FORMS = [/databento/i, /\bmassive\b/i, /polygon\.io/i, /helius/i, /chainstack/i, /tenderly/i, /drpc/i, /mevblocker/i, /nodies/i,
    /pocket\.network/i, /blastapi/i, /publicnode/i, /llamarpc/i, /blxrbdn/i, /1rpc/i, /alchemy/i, /infura/i, /quicknode/i, /\bankr\b/i];
  const files: string[] = [UKEMI_COURSE_REL, UKEMI_SERVED_REL, "apps/site/components/ukemi-panel.tsx", "apps/site/components/ukemi/ukemi-page.tsx"];
  for (const name of readdirSync(join(ROOT, "apps", "site", "lib"))) if (/^ukemi-.*\.ts$/.test(name)) files.push(`apps/site/lib/${name}`);
  const walk = (rel: string): void => {
    for (const name of readdirSync(join(ROOT, ...rel.split("/")))) {
      const child = `${rel}/${name}`;
      if (statSync(join(ROOT, ...child.split("/"))).isDirectory()) walk(child);
      else files.push(child);
    }
  };
  walk("apps/site/app/ukemi");
  assert.ok(files.length >= 9, "the Ukemi surface files were collected (false green)");
  const hits: string[] = [];
  for (const rel of files) for (const re of FORMS) if (re.test(read(rel))) hits.push(`${rel}: ${String(re)}`);
  assert.deepEqual(hits, [], `a provider / operator name on the Ukemi surface:\n${hits.join("\n")}`);
  assert.ok(FORMS.some((re) => re.test("--operators drpc.org,mevblocker.io")), "detector control");
});

/* ─────────────────────────── review round 2 of lot site-5j ukemi: golden view, recorded digest, vocabulary ───────────
 * Each test below is killed by named mutants replayed on an isolated copy of the tree (never in place), with the sha256
 * of every mutated file before and after (the runner and its log are archived with the lot report). */

/** The JSX text immediately before the {ident} child that renders `ident` (empty when none). Comment-proof (AST). */
function jsxTextBefore(sf: ts.SourceFile, ident: string): string {
  let out: string | undefined;
  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const kids = node.children;
      kids.forEach((k, i) => {
        if (ts.isJsxExpression(k) && k.expression !== undefined && ts.isIdentifier(k.expression) && k.expression.text === ident) {
          const prev = i > 0 ? kids[i - 1] : undefined;
          out = prev !== undefined && ts.isJsxText(prev) ? prev.text : "";
        }
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  assert.ok(out !== undefined, `{${ident}} is rendered as a JSX child`);
  return out;
}

/** The names a function component destructures from its first parameter ({ a, b }: Props). */
function destructuredProps(sf: ts.SourceFile, fn: string): string[] {
  const names: string[] = [];
  for (const st of sf.statements) {
    if (!ts.isFunctionDeclaration(st) || st.name?.text !== fn) continue;
    const first = st.parameters[0];
    if (first !== undefined && ts.isObjectBindingPattern(first.name)) {
      for (const el of first.name.elements) if (ts.isIdentifier(el.name)) names.push(el.name.text);
    }
  }
  return names;
}

/** The attribute names passed to every <tag .../> or <tag ...> of a TSX source. */
function jsxAttributesOf(sf: ts.SourceFile, tag: string): string[] {
  const names: string[] = [];
  const visit = (node: ts.Node): void => {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(sf) === tag) {
      for (const a of node.attributes.properties) if (ts.isJsxAttribute(a)) names.push(a.name.getText(sf));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return names;
}

/** The string a metadata initialiser renders: string literals joined by `+` (comment-proof). */
function literalText(node: ts.Expression): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isParenthesizedExpression(node)) return literalText(node.expression);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) return literalText(node.left) + literalText(node.right);
  throw new Error(`not a literal string expression: ${node.kind}`);
}

/** The title and description of the exported Next `metadata` object of a route (renderedTexts does not see them). */
function metadataTexts(rel: string): string[] {
  const sf = parseTsx(rel, read(rel));
  const out: string[] = [];
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name) || d.name.text !== "metadata" || d.initializer === undefined || !ts.isObjectLiteralExpression(d.initializer)) continue;
      for (const p of d.initializer.properties) {
        if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && (p.name.text === "title" || p.name.text === "description")) out.push(literalText(p.initializer));
      }
    }
  }
  assert.equal(out.length, 2, `${rel}: the metadata title and description were read (false green)`);
  return out;
}

/** Every string a module's exports carry (strings, arrays and objects of strings), for a whole-module scan. */
function exportedStrings(mod: Record<string, unknown>): string[] {
  const out: string[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) for (const x of v as unknown[]) walk(x);
    else if (v !== null && typeof v === "object") for (const x of Object.values(v as Json)) walk(x);
  };
  for (const v of Object.values(mod)) walk(v);
  return out;
}

const PANEL_REL = "apps/site/components/ukemi-panel.tsx";
const COURSE_PAGE_REL = "apps/site/app/ukemi/course/page.tsx";

/** GOLDEN of the course view: every string rebuilt from NAMED JSON PATHS of the two committed files, without the loaders
 *  or the view module (8 decimals by BigInt, outcome words, stratum ranges from the harness's served cuts, all re-derived
 *  here). A number read from the wrong path, two numbers exchanged, a row fed from the wrong H-4 population, or a drift
 *  of a pinned wording (the design episode, accounts rather than positions for H-4) reds the deepEqual. */
function goldenCourseView(raw: Json, served: Json): CourseView {
  const body = obj(raw.body, "body");
  const display = obj(raw.display, "display");
  const prov = obj(raw.provenance, "provenance");
  const inputs = obj(prov.inputs, "provenance.inputs");
  const h3 = obj(body.h3, "body.h3");
  const h3s = list(h3.strata, "body.h3.strata");
  const h2s = list(obj(body.h2, "body.h2").strata, "body.h2.strata");
  const h4 = obj(body.h4, "body.h4");
  const h4s = list(h4.strata, "body.h4.strata");
  const h6 = obj(body.h6, "body.h6");
  const h5 = obj(body.h5, "body.h5");
  const q0 = obj(body.q0_rule_failures, "body.q0_rule_failures");
  const labels = obj(body.labels, "body.labels");
  const clause = obj(body.clause_359, "body.clause_359");
  const I = (v: unknown, where: string): string => {
    assert.ok(typeof v === "number" && Number.isInteger(v), `${where} must be an integer`);
    return String(v);
  };
  const S = (v: unknown, where: string): string => {
    assert.ok(typeof v === "string", `${where} must be a string`);
    return v;
  };
  const D8 = (v: unknown, where: string): string => dec8(S(v, where));
  const count = (v: unknown, one: string, many: string, where: string): string => {
    const t = I(v, where);
    return `${t} ${t === "1" ? one : many}`;
  };
  const words = (o: unknown, lvl: string | null, floor: string | null): string => {
    if (o === "OUI") return lvl === null ? "yes" : `yes (level ${lvl})`;
    if (o === "NON") return lvl === null ? "no" : `no (level ${lvl})`;
    if (o === "UNDER_CALIB") return floor === null ? "under_calib" : `under_calib (n below the floor of ${floor})`;
    assert.equal(o, "NON_TESTABLE_E2", "a pre-registered outcome");
    return "not testable (too few comparison trials)";
  };
  const cuts = [...STRATA_CUTS_SERVED].map((x) => dec8(String(x)));
  const rangeOf = (k: number): string => {
    const lo = k > 0 ? cuts[k - 1] : undefined;
    const hi = cuts[k];
    if (lo === undefined) return hi === undefined ? "all" : `below ${hi}`;
    return hi === undefined ? `at least ${lo}` : `at least ${lo}, below ${hi}`;
  };

  const rows = h3s.map((x, k) => {
    const s = obj(x, `body.h3.strata[${String(k)}]`), fresh = obj(s.fresh, "fresh"), e2 = obj(s.e2, "e2");
    const floor = I(obj(h2s[k], `body.h2.strata[${String(k)}]`).n_min, "body.h2.strata[k].n_min");
    const h4row = obj(h4s[k], `body.h4.strata[${String(k)}]`);
    const meets = s.served === true;
    const tested = meets && s.verdict !== "NON_TESTABLE_E2";
    return {
      key: `stratum-${I(s.strate, "strate")}`,
      label: `stratum ${I(s.strate, "strate")}${meets ? " · meets the floor" : ""}`,
      range: rangeOf(k),
      points: `${I(fresh.n, "fresh.n")} (floor ${floor})`,
      bound: meets ? D8(fresh.qhat, "fresh.qhat") : "none (below the floor)",
      comparison: meets
        ? `${I(e2.k_covered, "e2.k_covered")} / ${I(e2.n, "e2.n")} (${I(e2.atoms_at_zero, "e2.atoms_at_zero")} scored zero)`
        : `not tested (below the floor); ${count(e2.n, "trial", "trials", "e2.n")} available`,
      outcome: words(s.verdict, tested ? S(s.level, "level") : null, s.verdict === "UNDER_CALIB" ? floor : null),
      liquidated: `${I(h4row.liquidated, "body.h4.strata[k].liquidated")} · ${I(h4row.multi_call, "body.h4.strata[k].multi_call")}`,
    };
  });
  const pooled = obj(h3.pooled, "body.h3.pooled"), pf = obj(pooled.fresh, "pooled.fresh"), pe = obj(pooled.e2, "pooled.e2");
  const classA = obj(h4.class_a_liquidated, "body.h4.class_a_liquidated"), all = obj(h4.all_liquidated, "body.h4.all_liquidated");
  rows.push({
    key: "pooled",
    label: "pooled class A",
    range: "all",
    points: I(pf.n, "pooled.fresh.n"),
    bound: D8(pf.qhat, "pooled.fresh.qhat"),
    comparison: `${I(pe.k_covered, "pooled.e2.k_covered")} / ${I(pe.n, "pooled.e2.n")} (${I(pe.atoms_at_zero, "pooled.e2.atoms_at_zero")} scored zero)`,
    outcome: `${words(pooled.verdict, S(pooled.level, "pooled.level"), null)}, reported outside the condition`,
    liquidated: `${I(classA.n, "body.h4.class_a_liquidated.n")} · ${I(classA.multi_call, "body.h4.class_a_liquidated.multi_call")}`,
  });

  assert.equal(pooled.barber_thm2_bound, "not_estimated");
  const reading: string[] = [
    "What a yes means: the pre-registered exchangeability test with the design episode (the recorded episode the score was " +
      "designed on, never served) did not reject at its stated level. It is not a coverage claim, and the report estimates " +
      "no coverage bound across episodes.",
    "A comparison trial scored exactly zero (the realized amount did not exceed the prediction) counts as covered whatever the " +
      "bound; the number of such trials is shown next to each ratio.",
  ];
  // COURSE-SERVED-FACTS-1: the served-state file may carry the dated served verdict (schema v2, liq_verdict).
  const lv = served.liq_verdict !== undefined && served.liq_verdict !== null ? obj(served.liq_verdict, "liq_verdict") : null;
  for (const x of h3s) {
    const s = obj(x, "stratum"), fresh = obj(s.fresh, "fresh");
    if (s.served !== true || fresh.qhat === null) continue;
    const k = I(s.strate, "strate"), margin = D8(fresh.qhat, "fresh.qhat"), rank = I(fresh.p, "fresh.p"), n = I(fresh.n, "fresh.n");
    if (served.registry_state === "committed" && lv !== null && lv.verdict_reason === "covered" && lv.stratum === s.strate && lv.calibration_points === fresh.n &&
      lv.bound_margin_base === fresh.qhat && fresh.qhat_is_max === true && fresh.p === fresh.n) {
      reading.push(
        `Stratum ${k} is committed and served: the served verdict read at ${S(served.read_at, "read_at")} carries ${I(lv.calibration_points, "liq_verdict.calibration_points")} calibration points, fewer than the ${I(lv.interior_rank_min_n, "liq_verdict.interior_rank_min_n")} an interior quantile rank needs at the served level, so the quantile rank equals the number of calibration points (${rank} of ${n}) and the served bound margin, ${margin}, is the largest calibration score observed, reported as is. The served upper bound for a prediction in this stratum is the prediction plus this margin; served scores digest ${S(lv.calibration_digest, "liq_verdict.calibration_digest")}.`,
      );
      continue;
    }
    const tail = "If the stratum is committed as reported, the upper bound for a prediction in it is the prediction plus this margin.";
    reading.push(
      fresh.qhat_is_max === true && fresh.p === fresh.n
        ? `Stratum ${k}: the quantile rank equals the number of calibration points (${rank} of ${n}), so its bound margin, ${margin}, is the largest calibration score observed. ${tail}`
        : `Stratum ${k}: bound margin ${margin} (quantile rank ${rank} of ${n}). ${tail}`,
    );
  }
  reading.push(
    `Pooled class A: bound margin ${D8(pf.qhat, "pooled.fresh.qhat")} (quantile rank ${I(pf.p, "pooled.fresh.p")} of ${I(pf.n, "pooled.fresh.n")}${pf.qhat_is_max === true ? ", the largest calibration score" : ""}).`,
  );

  const rc = obj(h4.reconciliation, "body.h4.reconciliation"), hp = obj(h4.pooled, "body.h4.pooled");
  const sb = obj(h6.served_blocks, "body.h6.served_blocks"), pc = obj(h6.price_at_call_block, "body.h6.price_at_call_block");
  const series = obj(h6.series, "body.h6.series"), anc = obj(h6.anchor, "body.h6.anchor");
  const misses = list(q0.without_crossing, "body.q0_rule_failures.without_crossing").map((m, i) => D8(obj(m, `miss ${String(i)}`).y, "miss.y"));
  const committable = list(h3.served_strata, "body.h3.served_strata").map((k) => I(k, "served_strata entry"));
  const lastCommittable = committable[committable.length - 1];
  const committableWords =
    lastCommittable === undefined ? "none" : committable.length === 1 ? `stratum ${lastCommittable}` : `strata ${committable.slice(0, -1).join(", ")} and ${lastCommittable}`;
  const dg = (name: string): string => S(obj(inputs[name], `provenance.inputs.${name}`).sha256_lf, `provenance.inputs.${name}.sha256_lf`);
  const accounts = list(q0.without_crossing, "body.q0_rule_failures.without_crossing").map((m, i) => S(obj(m, `miss ${String(i)}`).address, "miss.address"));
  const verification = h3s
    .map((x) => obj(x, "stratum"))
    .filter((s) => s.served === true && s.verdict !== "NON_TESTABLE_E2")
    .map((s) => ({ label: `stratum ${I(s.strate, "strate")} (level ${S(s.level, "level")})`, value: S(obj(s.p_value, "p_value").dec12, "p_value.dec12") }));
  verification.push({ label: `pooled class A (level ${S(pooled.level, "pooled.level")})`, value: S(obj(pooled.p_value, "pooled.p_value").dec12, "pooled.p_value.dec12") });

  return {
    eyebrow: `calibration course · ${S(body.event_id, "body.event_id")} · hypothesis report of its offline steps`,
    served_lead: `Served state of the class ${S(served.served_class, "served_class")}, as copied from the served gate description (${S(served.host, "host")}${S(served.path, "path")}) at ${S(served.read_at, "read_at")} and hashed in the site manifest; the live description may have changed since:`,
    served_clause: S(served.liq_clause, "liq_clause"),
    served_note:
      served.registry_state === "committed"
        ? "A calibration of this class is committed; the served clause above states the bound it carries. The report below is the offline course, not the served registry."
        : `No calibration of this class is committed, so no stratum below is served. A stratum that meets the floor can be committed; committing it is a separate, recorded step. Meeting the floor in this report: ${committableWords}.`,
    unit_note: `Amounts are ${S(display.unit, "display.unit")}; a stratum is a range of the predicted liquidable amount.`,
    rows,
    reading,
    multi_call: `Accounts liquidated by more than one call, against the pre-registered threshold of a share at most ${S(h4.threshold, "body.h4.threshold")}: liquidated class-A accounts ${I(classA.multi_call, "class_a.multi_call")} of ${I(classA.n, "class_a.n")} → ${words(classA.verdict, null, null)}; all liquidated accounts ${I(all.multi_call, "all.multi_call")} of ${I(all.n, "all.n")} → ${words(all.verdict, null, null)}.`,
    reconciliation: `Positions (account, debt asset, collateral asset) reconciled exactly: ${I(rc.positions_reconciled, "positions_reconciled")} (${I(rc.positions_abstained, "positions_abstained")} abstained); liquidation calls in the window: ${I(rc.calls_in_window, "calls_in_window")}, outside it: ${I(rc.calls_not_in_window, "calls_not_in_window")}; accounts abstained: ${I(h4.accounts_abstained, "accounts_abstained")}.`,
    liquidated_amounts: `Liquidated amount in class A: ${D8(hp.sum_y, "h4.pooled.sum_y")}; of it, after the first call: ${D8(hp.sum_after_first, "h4.pooled.sum_after_first")}; deficit reported apart: ${D8(hp.sum_deficit_apart, "h4.pooled.sum_deficit_apart")}.`,
    oracle: `Oracle values the protocol read at the liquidation call blocks and at the block before each: ${I(sb.n, "served_blocks.n")} values, ${I(sb.in_events, "served_blocks.in_events")} in the on-chain update series of ${count(series.n_updates, "update", "updates", "series.n_updates")}, ${I(sb.equal_to_p0, "served_blocks.equal_to_p0")} equal to the anchor, ${I(sb.outside, "served_blocks.outside")} outside. Measured maximum lag ${sb.max_lag === null ? "undefined" : count(sb.max_lag, "update", "updates", "served_blocks.max_lag")} (pre-registered bound ${count(h6.max_lag_bound, "update", "updates", "h6.max_lag_bound")}; ${I(sb.lag_over_bound, "served_blocks.lag_over_bound")} over it) → ${words(h6.verdict, null, null)}. At the call blocks themselves: ${I(pc.n, "price_at_call_block.n")} values, ${I(pc.in_events, "price_at_call_block.in_events")} in the series, maximum lag ${pc.max_lag === null ? "undefined" : I(pc.max_lag, "price_at_call_block.max_lag")}. Update blocks monotone: ${series.monotone_blocks === true ? "yes" : "no"}; phase change: ${series.phase_change === true ? "yes" : "no"}.`,
    oracle_anchor: `Anchor: block ${I(anc.block, "anchor.block")}, price ${D8(anc.price, "anchor.price")}, taken from ${anc.source === "answer_updated_pre_b0" ? "the last oracle update before the reference block" : "the book's collateral price at the reference block (fallback)"}${h6.min_served === null ? "" : `; lowest value read ${D8(h6.min_served, "h6.min_served")}`}.`,
    oracle_bias: typeof h6.sample_note === "string" && h6.sample_note.length > 0 ? "Declared bias: these values are sampled at and just before liquidation blocks only." : null,
    population: `Population: ${count(h5.population_mono_weth, "mono-collateral WETH account", "mono-collateral WETH accounts", "h5.population_mono_weth")} (${h5.meets_k_h5 === true ? "meets" : "below"} the floor of ${I(h5.k_h5, "h5.k_h5")}); class A calibration points: ${I(h5.class_a_n, "h5.class_a_n")}.`,
    zero_rule: `Zero predictions of the frozen rule: ${count(q0.crossed_yhat_zero, "account", "accounts", "q0.crossed_yhat_zero")} crossed the threshold on the path with a zero prediction; ${count(q0.yhat_zero_liquidated, "account", "accounts", "q0.yhat_zero_liquidated")} with a zero prediction liquidated (${String(misses.length)} that never crossed on the path${misses.length === 0 ? "" : `, amount ${misses.join(", ")}`}; ${String(list(q0.crossed_yhat_zero_liquidated, "q0.crossed_yhat_zero_liquidated").length)} that crossed).`,
    zero_rule_accounts: accounts.map((a) => ({ address: a, href: `https://etherscan.io/address/${a}` })),
    zero_rule_accounts_lead: `The ${accounts.length === 1 ? "account" : "accounts"} liquidated with a zero prediction that never crossed on the path, on Ethereum mainnet:`,
    verification_summary: "verification",
    verification_lead: "The p-value of the pre-registered exchangeability test with the design episode, for each tested row, as the report prints it:",
    verification_gloss: "exchangeability test p-value (beta-binomial), not a probability of being right",
    verification,
    labels: `Realized labels: ${count(labels.label_lines, "label line", "label lines", "labels.label_lines")}; unresolved: ${I(labels.labels_no_quorum_unresolved, "labels_no_quorum_unresolved")}; no-quorum residuals: ${I(labels.residual_no_quorum, "residual_no_quorum")}; deficits without a price on an asset other than USDT: ${I(labels.deficit_base_no_price_non_usdt, "deficit_base_no_price_non_usdt")}; lines of another episode: ${I(labels.other_event_lines, "other_event_lines")}.`,
    clause: `Pre-registered condition for the next step: no stratum that meets the floor failed the exchangeability test (${clause.h3_no_NON_on_served_strata === true ? "true" : "false"}); unresolved labels: ${I(clause.labels_no_quorum_unresolved, "clause.labels_no_quorum_unresolved")}; condition ${clause.condition_satisfied === true ? "satisfied" : "not satisfied"}. The pooled class A outcome (${words(clause.h3_pooled_verdict_outside_condition, null, null)}) is reported outside this condition. The condition changes nothing that is served.`,
    report_digest: S(raw.body_digest, "body_digest"),
    report_digest_note:
      "SHA-256 of the canonical JSON of the report body (object keys sorted, no whitespace). Anyone can recompute it from the " +
      "published copy of the report, apps/site/data/ukemi-course.json in the public repository.",
    digests: [
      { label: "course tool", value: S(obj(prov.tool, "provenance.tool").sha256_lf, "provenance.tool.sha256_lf") },
      { label: "pre-registration", value: dg("prereg") },
      { label: "fresh calibration scores", value: dg("scores") },
      { label: "realized-label inputs", value: dg("u3_inputs") },
      { label: "realized labels", value: dg("u3_realized") },
      { label: "realized oracle path", value: dg("oracle_path") },
      { label: "design-episode comparison scores", value: dg("e2_comparison") },
    ],
    digests_note:
      "The course tool, the pre-registration and these input files are not in the public repository; their SHA-256 digests are " +
      "published so that a copy can be checked against them.",
  };
}

test("site_ukemi_course_view_golden — every string of /ukemi/course equals the string rebuilt from named JSON paths, in place", () => {
  const c = loadUkemiCourse(ROOT), s = loadUkemiServed(ROOT);
  const v = buildCourseView(c, s);
  assert.deepEqual(v, goldenCourseView(rawCourse(), rawServed()), "the view equals the golden rebuilt from JSON paths (empty registry)");
  assert.deepEqual(
    buildCourseView(c, { ...s, registry_state: "committed" }),
    goldenCourseView(rawCourse(), { ...rawServed(), registry_state: "committed" }),
    "the view equals the golden (committed registry)",
  );
  // The comparison episode is the design episode, which is LATER than the course episode: never "earlier".
  const pageSf = parseTsx(COURSE_PAGE_REL, read(COURSE_PAGE_REL));
  const pageTexts = [...renderedTexts(pageSf).map((r) => r.text), ...metadataTexts(COURSE_PAGE_REL)];
  for (const text of [...viewStrings(v), ...pageTexts]) assert.ok(!/\bearlier\b/i.test(text), `no 'earlier' episode: ${JSON.stringify(text.slice(0, 80))}`);
  assert.ok(pageTexts.some((t) => t.includes("the design episode")), "the course page names the design episode");
  // H-4 counts accounts; a position is (account, debt asset, collateral asset), a different count.
  assert.ok(/\baccounts\b/.test(v.multi_call) && !/\bpositions\b/i.test(v.multi_call), "H-4 multi-call counts accounts");
  assert.ok(v.reconciliation.startsWith("Positions (account, debt asset, collateral asset)"), "a position is named with its three parts");
  // The unit's decimal count is the report's own: its summary lines (inside the digest-bound body, never rendered)
  // declare the amounts "(base N-dec)"; display.decimals and the displayed unit label carry that same N.
  const course = rawCourse();
  const declared = new Set<string>();
  for (const line of list(obj(course.body, "body").summary, "body.summary")) {
    for (const m of String(line).matchAll(/\(base (\d+)-dec\)/g)) if (m[1] !== undefined) declared.add(m[1]);
  }
  const display = obj(course.display, "display");
  assert.deepEqual([...declared], [String(display.decimals)], "display.decimals is the base decimal count the report declares");
  assert.ok(typeof display.unit === "string" && display.unit.includes(`(${String(display.decimals)} decimals)`), "the unit label carries the declared decimal count");
});

/** The production record of the course (tracked in the source repository, omitted from the public export): the digest of
 *  the report body as it was computed when the report was produced. Exactly one `body_digest <64 hex>` is recorded. */
const PRODUCTION_RECORD_REL = "docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md";
function recordedBodyDigest(): string {
  const found = new Set<string>();
  for (const m of read(PRODUCTION_RECORD_REL).matchAll(/body_digest\s+([0-9a-f]{64})\b/g)) if (m[1] !== undefined) found.add(m[1]);
  assert.equal(found.size, 1, `${PRODUCTION_RECORD_REL} must record exactly one body digest`);
  const [d] = [...found];
  assert.ok(d !== undefined);
  return d;
}

test("site_ukemi_course_digest_bound_to_production_record — body_digest is the digest recorded when the report was produced", () => {
  const recorded = recordedBodyDigest();
  assert.equal(rawCourse().body_digest, recorded, "the site copy's body_digest is the recorded one (read from the record, never retyped)");
  assert.equal(loadUkemiCourse(ROOT).body_digest, recorded);
  // Why this binding is needed: a CONSISTENT edit (the measured lag lowered AND its histogram moved; body and manifest
  // re-hashed) passes every check of the loader. Only the recorded digest catches it.
  const t = tmpRoot();
  try {
    const file = rawCourse();
    const sb = obj(obj(obj(file.body, "body").h6, "h6").served_blocks, "served_blocks");
    const hist = obj(sb.lag_histogram, "lag_histogram");
    const one = hist["1"], two = hist["2"];
    assert.ok(typeof one === "number" && typeof two === "number", "the histogram carries lags 1 and 2");
    hist["1"] = one + two;
    delete hist["2"];
    sb.max_lag = 1;
    file.body_digest = sha256(canon(file.body));
    t.write(UKEMI_COURSE_REL, file);
    const mutated = loadUkemiCourse(t.root);
    assert.equal(mutated.h6.sampled.max_lag, 1, "the loader accepts a consistent edit (by design: it checks agreement, not truth)");
    assert.notEqual(mutated.body_digest, recorded, "the recorded digest reds on it");
  } finally {
    t.cleanup();
  }
});

/** Every text of the Ukemi surface: the two copy modules' exports, the course view (both registry states), the served
 *  clause, the JSX texts of the panel, the /ukemi body and both routes, and both routes' metadata. */
function ukemiSurfaceTexts(): string[] {
  const c = loadUkemiCourse(ROOT), s = loadUkemiServed(ROOT);
  const texts: string[] = [
    ...exportedStrings({ ...UKEMI_COPY }),
    ...exportedStrings({ ...UKEMI_PANEL_COPY }),
    ...viewStrings(buildCourseView(c, s)),
    ...viewStrings(buildCourseView(c, { ...s, registry_state: "committed" })),
    s.liq_clause,
    ...metadataTexts(UKEMI_ROUTE_REL),
    ...metadataTexts(COURSE_PAGE_REL),
  ];
  for (const rel of [PANEL_REL, UKEMI_PAGE_REL, UKEMI_ROUTE_REL, COURSE_PAGE_REL]) texts.push(...renderedTexts(parseTsx(rel, read(rel))).map((r) => r.text));
  return texts;
}
/** Negated forms that may carry the word: "never a probability", "not a probability", "no probability". */
const NEGATED_PROBABILITY = /\b(?:never|not|no)\s+(?:an?\s+)?probabilit(?:y|ies)\b/gi;
const SURFACE_BANNED: ReadonlyArray<readonly [string, RegExp]> = [
  ["verified", /\bverified\b/i],
  ["guarantee", /\bguarantee(?:d|s)?\b/i],
  ["partner", /\bpartners?(?:hip)?\b/i],
  ["autonomous", /\bautonomous\b/i],
  ["token", /\btokens?\b/i],
  ["probability, not negated", /\bprobabilit(?:y|ies)\b/i],
];
function surfaceVocabularyHits(texts: readonly string[]): string[] {
  const hits: string[] = [];
  for (const raw of texts) {
    const text = raw.replace(NEGATED_PROBABILITY, " ");
    for (const [name, re] of SURFACE_BANNED) if (re.test(text)) hits.push(`${name}: ${JSON.stringify(raw.slice(0, 80))}`);
  }
  return hits;
}

test("site_ukemi_surface_vocabulary — no verified / guarantee / partner / autonomous / token on the Ukemi surface; probability only negated", () => {
  const texts = ukemiSurfaceTexts();
  assert.ok(texts.length > 60, `the Ukemi surface texts were collected (false green): ${String(texts.length)}`);
  assert.deepEqual(surfaceVocabularyHits(texts), [], "a banned form on the Ukemi surface");
  // detector controls: each banned form reds once; the negated probability and "tokenized" pass.
  assert.equal(surfaceVocabularyHits(["a verified bound", "no guarantee", "our partners", "an autonomous agent", "the token", "a probability of being right"]).length, 6);
  assert.deepEqual(surfaceVocabularyHits(["Never a probability of being right.", "not a probability that a bound is right", "tokenized equities"]), []);
});

/** Harness params accepted by the served liquidation-eligible-coverage class (alpha and nMin are server-imposed). */
const LIQ_TEST_PARAMS: HarnessParams = {
  remainingBudget: 0.1,
  bFloor: 0,
  tau: 1,
  tauInterval: 1,
  alpha: LIQ_ALPHA,
  nMin: LIQ_NMIN,
  intent: 1,
  tool: "perps_order_preview",
  clockOpen: true,
};

test("site_ukemi_prose_claims_conditional — 'calibrated' and 'coverage holds' only conditional or negated; no residuals promised", () => {
  // The served facts the copy relies on: the class's verdict carries an empty residual list, and no attestation subject
  // is bound to the class, so none can be filed into it. If either changes, this reds and the copy is revisited with it.
  const d = runGate(
    { schema_version: "1.1.0", task_class: TASK_LIQ_ELIGIBLE, yhat: 1, predictor_id: "ukemi:site-copy-check", produced_at: "2026-09-24T00:00:00Z" },
    LIQ_TEST_PARAMS,
  );
  assert.deepEqual(d.verdict.residual, [], "the served liquidation-eligible-coverage verdict carries no residual");
  assert.deepEqual(ATTESTATION_BINDING.get(TASK_LIQ_ELIGIBLE), [], "no attestation subject is bound to the class");
  const served = new Set<string>([LIQ_UPPER_BOUND_SENTENCE, LIQ_H3_SENTENCE, LIQ_CONDITIONAL_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE]);
  const prose = [...exportedStrings({ ...UKEMI_COPY }).filter((t) => !served.has(t)), ...metadataTexts(UKEMI_ROUTE_REL)];
  const panel = [...renderedTexts(parseTsx(PANEL_REL, read(PANEL_REL))).map((r) => r.text), ...exportedStrings({ ...UKEMI_PANEL_COPY })];
  const RULES: ReadonlyArray<readonly [RegExp, RegExp]> = [
    [/\bcalibrated\b/i, /\bnot a calibrated\b|\bfor a calibrated\b|\bonce a stratum is committed\b/i],
    [/\bcoverage holds\b/i, /\bonce a stratum is committed\b/i],
  ];
  const unconditional = (texts: readonly string[]): string[] => {
    const out: string[] = [];
    for (const t of texts) for (const cl of t.split(/(?<=[.;])\s+/)) for (const [claim, cond] of RULES) if (claim.test(cl) && !cond.test(cl)) out.push(cl);
    return out;
  };
  assert.deepEqual(unconditional(prose), [], "an unconditional calibration or coverage claim on /ukemi");
  for (const t of [...prose, ...panel]) assert.ok(!/\bresiduals?\b/i.test(t), `a residual promised with the bound: ${JSON.stringify(t.slice(0, 90))}`);
  // detector controls: the two former sentences red.
  assert.equal(unconditional(["Not a claim about a new event: the measure is calibrated on one episode; exchangeability is named.",
    "Coverage holds per stratum, under exchangeability with the calibration episode."]).length, 2);
});

// COURSE-SERVED-FACTS-1 (ADR-U4b-2b D5, checkpoint-1 C-5 option (a) of the orchestrator): /ukemi/course states the H-2bis
// status of the committed stratum IN THE PRESENT (n, the bound margin as the largest calibration score, the interior-rank
// threshold, the served C5 digest) ONLY from the dated served verdict of the served-state file, and only when that verdict
// agrees with the report; otherwise the conditional sentence stays (fail-closed). Tested on BOTH states: the committed file
// of today (empty registry served, schema v1, no verdict) and the committed state as the sync would write it after the
// switch window, derived by the sync's OWN pure functions from IN-PROCESS answers of this tree's harness (no network, no
// typed value). Mutants: n_calib served != report n, q-hat served != report q-hat, another stratum => no served status;
// under_calib under a committed state, covered under an empty one, a foreign digest => refused (loader or sync).
// Folded from the G2 of U-4b-2b (2026-09-24): M-1, the served verdict rides on the body the deploy CA attests (ADR-U4b-2b D5
// point 1): the CA runs here as deployed against this tree's in-process harness and its gate_liq_call digest is the digest
// of the answer the sync reads for its body (one object with the CA's); the sync refuses a deploy check that did not
// record that answer green; once the committed file carries a verdict (W step 5), its body digest must be the committed
// CA's gate_liq_call digest. M-3, the tie case (rank below n, largest-score flag true) states no served status. M-5, a
// served n_calib + 1 or q-hat + 1 is refused by the sync.
// killer: scripts/sync-ukemi-served.mjs:225 CONST "verdictFactsOf(await call(GATE_PATH, GATE_LIQ_BODY), facts.registry_state)" -> "JSON.parse(await call(GATE_PATH, GATE_LIQ_BODY)).structuredContent.verdict"
test("site_ukemi_course_served_stratum_status_bound_to_served_verdict — the present-tense status of the committed stratum rides only on an agreeing dated served verdict", async () => {
  const { handleJsonMirror } = await import("../apps/harness/src/http.ts");
  const { startServer } = await import("../apps/harness/src/server.ts");
  const { execFile } = await import("node:child_process");
  const sync = await import("../scripts/sync-ukemi-served.mjs");
  const { USDE_STABLE_RUN_SCORES_SHA256_PINNED } = await import("../apps/harness/src/calibration.ts");
  interface CaRecord { checks: Array<{ name: string; ok: boolean; sha256: string | null }> }
  const liqShaOf = (ca: CaRecord): string | null | undefined => ca.checks.find((k) => k.name === "gate_liq_call")?.sha256;
  const c = loadUkemiCourse(ROOT);
  const x0 = c.strata.find((x) => x.meets_floor && x.bound_margin !== null);
  assert.ok(x0 !== undefined && x0.bound_margin !== null, "the report has a stratum that meets the floor (non-vacuous)");
  const SERVED = "is committed and served";
  const conditional = (v: CourseView): boolean => v.reading.some((l) => l.startsWith(`Stratum ${String(x0.stratum)}: `) && l.includes("If the stratum is committed as reported"));
  // (1) TODAY'S committed served-state file: the served status rides exactly on a dated covered verdict (after the switch
  //     re-sync, W step 5), the conditional sentence exactly without one (empty registry served, schema v1, no verdict).
  const today = loadUkemiServed(ROOT);
  const vToday = buildCourseView(c, today);
  const servedToday = today.registry_state === "committed" && today.liq_verdict?.verdict_reason === "covered";
  assert.equal(vToday.reading.some((l) => l.includes(SERVED)), servedToday, "the served status rides exactly on a dated covered verdict");
  assert.equal(conditional(vToday), !servedToday, "the conditional sentence of the committable stratum stays exactly without one");
  if (today.liq_verdict !== null) {
    // M-1: once the synced file carries a verdict (W step 5), its /gate body is the body the COMMITTED deploy CA recorded
    // for gate_liq_call (vacant while the committed file is v1).
    const committedCa = JSON.parse(read("docs/deploy-CA-harness.json")) as CaRecord;
    assert.equal(today.liq_verdict.body_sha256, liqShaOf(committedCa), "the synced verdict's /gate body is the body the committed deploy CA recorded (gate_liq_call)");
  }
  const pin = await pinTarget(ROOT);
  // After the switch window the synced verdict must be the registry's committed stratum (the sha256 of its scores): an in-process
  // fact, pinned against the pending snapshot while one exists.
  if (pin.liq_verdict !== null && pin.liq_verdict.verdict_reason === "covered") digestPin(pin.liq_verdict);
  // (2) The COMMITTED state as the sync writes it: its pure functions over this tree's in-process answers.
  const openapi = await (await handleJsonMirror(new Request("http://api.monarkgate.tech/openapi.json"))).text();
  const gateText = await (await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sync.GATE_LIQ_BODY),
  }))).text();
  // M-1: the deploy CA, run as deployed (child process) against THIS tree's harness on 127.0.0.1 (no network, TLS skipped),
  // records for gate_liq_call the sha256 of the very answer the sync reads for its body: bound now, not only at W.
  const server = await startLoopback((port) => startServer(port));
  let caText = "";
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const base = `http://127.0.0.1:${String(addr.port)}`;
    const ran = await new Promise<{ code: number | null; stdout: string }>((resolve) => {
      execFile(process.execPath, [join(ROOT, "scripts", "verify-harness.mjs"), "--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"], { encoding: "utf8", timeout: 60000 }, (error, stdout) => {
        resolve({ code: error === null ? 0 : typeof error.code === "number" ? error.code : null, stdout });
      });
    });
    assert.equal(ran.code, 0, "the deploy CA is green on this tree's in-process harness");
    caText = ran.stdout;
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
  assert.equal(liqShaOf(JSON.parse(caText) as CaRecord), sha256(gateText), "the CA's gate_liq_call digest is the digest of the /gate answer to the sync's body");
  const facts = sync.servedFacts(openapi);
  assert.equal(facts.registry_state, "committed", "this tree serves the committed clause");
  const verdict = sync.servedVerdictFacts(gateText, facts.registry_state, caText);
  assert.equal(verdict.body_sha256, sha256(gateText), "the recorded body digest is the digest of the answer the verdict was read from");
  assert.deepEqual((await sync.inProcessUkemiPending(today.read_at)).liq_verdict, bareVerdict(verdict), "--pending reads the verdict of the same body through the same checks, without the deploy check");
  const v2: Json = {
    $comment: sync.COMMENT, schema: sync.SCHEMA, host: sync.API_HOST, path: sync.OPENAPI_PATH, read_at: today.read_at, served_class: TASK_LIQ_ELIGIBLE,
    registry_state: facts.registry_state, liq_clause: facts.liq_clause, cascade_uncalibrated_sentence_served: facts.cascade_uncalibrated_sentence_served,
    body_sha256: sha256(openapi), liq_verdict: { ...verdict },
  };
  const t = tmpRoot();
  try {
    t.write(UKEMI_SERVED_REL, v2);
    const committed = loadUkemiServed(t.root);
    assert.deepEqual(committed.liq_verdict, verdict, "the loader maps the synced verdict field by field");
    const v = buildCourseView(c, committed);
    assert.deepEqual(v, goldenCourseView(rawCourse(), v2), "the view equals the golden rebuilt from JSON paths (committed, v2)");
    const line = v.reading.find((l) => l.includes(SERVED));
    assert.ok(line !== undefined, "the committed stratum's served status is stated in the present");
    for (const piece of [String(verdict.calibration_points), String(verdict.interior_rank_min_n), x0.bound_margin, verdict.calibration_digest, today.read_at]) {
      assert.ok(line.includes(piece), `the served status carries ${piece}`);
    }
    assert.ok(verdict.calibration_points < verdict.interior_rank_min_n && x0.quantile_rank === x0.n, "the status is H-2bis: n below the interior-rank threshold, rank = n");
    assert.ok(!conditional(v), "the conditional sentence of that stratum is replaced");
    // M-3 (D5 point 2, the rank condition on its own): the tie case -- the report's quantile rank below n while its bound
    // margin is still the largest score (ties at the top), the served verdict agreeing on n and q-hat -- states NO served
    // status; the conditional sentence stays.
    const tie: UkemiCourse = { ...c, strata: c.strata.map((x) => (x.stratum === x0.stratum ? { ...x, quantile_rank: x.n - 1 } : x)) };
    const tied = tie.strata.find((x) => x.stratum === x0.stratum);
    assert.ok(tied !== undefined && tied.bound_is_largest_score === true && tied.quantile_rank === tied.n - 1, "the tie case keeps the largest-score flag with the rank below n");
    const vTie = buildCourseView(tie, committed);
    assert.ok(!vTie.reading.some((l) => l.includes(SERVED)) && conditional(vTie), "a quantile rank below n => no served status, the conditional sentence stays");
    assert.ok(!vTie.reading.some((l) => l.includes("quantile rank equals the number")), "UKEMI-VIEW-TIE-WORDING-1: a rank below n never reads as equal to n");
    // (3) Mutants of the served verdict: each => no served status, the conditional sentence back (fail-closed).
    const q = verdict.bound_margin_base;
    assert.ok(q !== null, "the committed probe carries a q-hat");
    const mutants: ReadonlyArray<readonly [string, Json]> = [
      ["n_calib served differs from the report n", { ...verdict, calibration_points: verdict.calibration_points + 1 }],
      ["q-hat served differs from the report q-hat", { ...verdict, bound_margin_base: String(BigInt(q) + 1n) }],
      ["the verdict is about another stratum", { ...verdict, stratum: verdict.stratum + 1 }],
    ];
    for (const [why, lv] of mutants) {
      t.write(UKEMI_SERVED_REL, { ...v2, liq_verdict: lv });
      const vm = buildCourseView(c, loadUkemiServed(t.root));
      assert.ok(!vm.reading.some((l) => l.includes(SERVED)) && conditional(vm), `${why} => no served status`);
    }
    // (4) The loader's closed, coherent shape (fail-closed).
    t.write(UKEMI_SERVED_REL, { ...v2, liq_verdict: { ...verdict, verdict_reason: "under_calib", bound_margin_base: null, calibration_points: 0 } });
    assert.throws(() => loadUkemiServed(t.root), /committed registry answers covered/, "under_calib under a committed state reds");
    t.write(UKEMI_SERVED_REL, { ...v2, liq_verdict: { ...verdict, interior_rank_min_n: verdict.interior_rank_min_n - 1 } });
    assert.throws(() => loadUkemiServed(t.root), /interior_rank_min_n/, "an interior-rank threshold that is not the rule's reds");
    t.write(UKEMI_SERVED_REL, { ...v2, liq_verdict: { ...verdict, extra: 1 } });
    assert.throws(() => loadUkemiServed(t.root), /liq_verdict must carry exactly/, "an extra verdict key reds");
    // An empty-registry v1 record, built here (the committed file is empty before the switch re-sync, committed after).
    const emptyV1: Json = { ...rawServed(), schema: "monark-site-ukemi-served-v1", registry_state: "empty", liq_clause: `${GATE_LIQ_EMPTY_REGISTRY_SENTENCE}; ${GATE_LIQ_REQUIREMENTS_SENTENCE}; ${GATE_LIQ_CONDITIONAL_SENTENCE}` };
    delete emptyV1.liq_verdict;
    t.write(UKEMI_SERVED_REL, { ...emptyV1, schema: sync.SCHEMA, liq_verdict: { ...verdict } });
    assert.throws(() => loadUkemiServed(t.root), /empty registry answers under_calib/, "a covered verdict next to an empty registry reds");
    const v1WithVerdict: Json = { ...emptyV1, liq_verdict: { ...verdict } };
    t.write(UKEMI_SERVED_REL, v1WithVerdict);
    assert.throws(() => loadUkemiServed(t.root), /must carry exactly/, "a v1 file cannot carry a verdict");
  } finally {
    t.cleanup();
  }
  // (5) The sync refuses a served verdict that is not this tree's committed stratum (foreign digest), and a verdict that
  //     contradicts the served state.
  const foreign = JSON.parse(gateText) as { structuredContent: { verdict: { scores_sha256: string } } };
  foreign.structuredContent.verdict.scores_sha256 = USDE_STABLE_RUN_SCORES_SHA256_PINNED;
  assert.throws(() => sync.servedVerdictFacts(JSON.stringify(foreign), "committed", caText), /not this tree's committed stratum/, "a foreign digest is refused");
  assert.throws(() => sync.servedVerdictFacts(gateText, "empty", caText), /empty served registry must answer under_calib/, "a covered verdict under an empty description is refused");
  // M-5: each agreement alone -- a served n_calib + 1, then a served q-hat + 1 (still a positive safe integer) -- is refused.
  const bumped = (f: (v: { n_calib: number; qhat: number }) => void): string => {
    const j = JSON.parse(gateText) as { structuredContent: { verdict: { n_calib: number; qhat: number } } };
    f(j.structuredContent.verdict);
    return JSON.stringify(j);
  };
  assert.throws(() => sync.servedVerdictFacts(bumped((v) => { v.n_calib += 1; }), "committed", caText), /not this tree's committed stratum/, "a served n_calib + 1 is refused");
  assert.throws(() => sync.servedVerdictFacts(bumped((v) => { v.qhat += 1; }), "committed", caText), /not this tree's committed stratum/, "a served q-hat + 1 is refused");
  // M-1: an answer the committed deploy check did not record, a check red on gate_liq_call, a check without it: refused.
  const caWith = (f: (k: { ok: boolean; sha256: string | null }) => void): string => {
    const j = JSON.parse(caText) as CaRecord;
    for (const k of j.checks) if (k.name === "gate_liq_call") f(k);
    return JSON.stringify(j);
  };
  const UNRECORDED = /deploy check recorded, green, for gate_liq_call/;
  assert.throws(() => sync.servedVerdictFacts(gateText, "committed", caWith((k) => { k.sha256 = sha256(openapi); })), UNRECORDED, "an answer the deploy check did not record is refused");
  assert.throws(() => sync.servedVerdictFacts(gateText, "committed", caWith((k) => { k.ok = false; })), UNRECORDED, "a deploy check red on gate_liq_call is refused");
  assert.throws(() => sync.servedVerdictFacts(gateText, "committed", JSON.stringify({ checks: [] })), UNRECORDED, "a deploy check without gate_liq_call is refused");
  assert.equal(sync.interiorRankMinN(LIQ_ALPHA), verdict.interior_rank_min_n, "the threshold is the sync's rule at the class alpha");
  // (6) The sync's manifest write path (W step 5): the committed manifest is in the canonical form the writer requires, the
  //     entry of the served-state file is rewritten and NO other line moves; a non-canonical manifest is refused.
  const manifestText = read("apps/site/data/manifest.sha256.json");
  const before = manifestText.split("\n"), after = sync.setManifestEntry(manifestText, sync.OUT_REL, sha256(openapi)).split("\n");
  assert.equal(after.length, before.length, "the manifest keeps its line count");
  const changed = after.filter((l, i) => l !== before[i]);
  assert.equal(changed.length, 1, "exactly one manifest line changes");
  assert.ok(changed[0] !== undefined && changed[0].trim().startsWith(`"${sync.OUT_REL}": "${sha256(openapi)}"`), "the changed line is the served-state entry with the new digest");
  assert.throws(() => sync.setManifestEntry(manifestText.replace(/\n {2}"/g, "\n    \""), sync.OUT_REL, sha256(openapi)), /canonical/, "a non-canonical manifest is refused");
});

// ── UKEMI-SITE-SWITCH-1 (ADR-U4b-2b D5 points 1, 2, 4, 5 and the recommendation of its l.219) ─────────────────────────
/** JSX child identifiers {IDENT} under a node, in source order (comment-proof). */
function jsxIdsUnder(root: ts.Node): string[] {
  const out: string[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isJsxExpression(n) && n.expression && ts.isIdentifier(n.expression) && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent))) out.push(n.expression.text);
    ts.forEachChild(n, visit);
  };
  visit(root);
  return out;
}
/** The served-state sentence /ukemi renders for a synced state (AST of the page): the page must hold ONE conditional
 *  `….registry_state === "empty" ? (…) : (…)` whose branches render one state sentence each, and no state sentence
 *  outside it; otherwise "unbound" (a page that ignores the synced state). Hoisted: the trap above calls it. */
function servedCarrierOf(state: "empty" | "committed"): string {
  const sf = parseTsx(UKEMI_PAGE_REL, read(UKEMI_PAGE_REL));
  const ids = new Set(["LIQ_EMPTY_REGISTRY_SENTENCE", "LIQ_COMMITTED_STATE_NOTE"]);
  const branches: string[][] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isConditionalExpression(n) && ts.isBinaryExpression(n.condition) && n.condition.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
      n.condition.left.getText(sf).endsWith(".registry_state") && ts.isStringLiteral(n.condition.right) && n.condition.right.text === "empty") {
      branches.push(jsxIdsUnder(n.whenTrue).filter((x) => ids.has(x)), jsxIdsUnder(n.whenFalse).filter((x) => ids.has(x)));
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  const all = jsxIdsUnder(sf).filter((x) => ids.has(x));
  if (branches.length !== 2 || all.length !== 2 || branches.some((b) => b.length !== 1)) return `unbound ${JSON.stringify({ branches, all })}`;
  return (state === "empty" ? branches[0] : branches[1])?.[0] ?? "unbound";
}
/** The body text of the root test named `name` in `rel` (AST), comments blanked (a commented-out trap counts as
 *  removed), "" if absent. */
function testBodyOf(rel: string, name: string): string {
  return testBodyOfSource(rel, read(rel), name);
}
function testBodyOfSource(rel: string, src: string, name: string): string {
  const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let body = "";
  const visit = (n: ts.Node): void => {
    const [title, fn] = ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "test" ? n.arguments : [];
    if (title !== undefined && fn !== undefined && ts.isStringLiteralLike(title) && (title.text === name || title.text.startsWith(`${name} `))) body = withoutComments(sf, fn);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return body;
}
/** The source text of `node` with every comment blanked: the comment ranges at each token's full start and end. */
function withoutComments(sf: ts.SourceFile, node: ts.Node): string {
  const text = sf.getFullText(), start = node.getStart(sf);
  const chars = text.slice(start, node.end).split("");
  const walk = (n: ts.Node): void => {
    for (const r of [...(ts.getLeadingCommentRanges(text, n.pos) ?? []), ...(ts.getTrailingCommentRanges(text, n.end) ?? [])])
      for (let i = Math.max(r.pos, start); i < Math.min(r.end, node.end); i++) chars[i - start] = " ";
    for (const c of n.getChildren(sf)) walk(c);
  };
  walk(node);
  return chars.join("");
}
const LIQ_CLAUSE_OF = {
  empty: `${GATE_LIQ_EMPTY_REGISTRY_SENTENCE}; ${GATE_LIQ_REQUIREMENTS_SENTENCE}; ${GATE_LIQ_CONDITIONAL_SENTENCE}`,
  committed: `the served region is ${GATE_LIQ_UPPER_BOUND_SENTENCE}; ${GATE_LIQ_REQUIREMENTS_SENTENCE}; ${GATE_LIQ_H3_SENTENCE}; ${GATE_LIQ_CONDITIONAL_SENTENCE}`,
} as const;

test("site_ukemi_served_state_carriers_follow_the_dated_served_state — /ukemi and its build check render the synced served state, read after the committed deploy check; the switch traps stay", async () => {
  // (1) One state conditional on the page: empty => the served sentence verbatim, committed => its digit-free restatement.
  assert.equal(servedCarrierOf("empty"), "LIQ_EMPTY_REGISTRY_SENTENCE", "the empty branch renders the served empty-registry sentence");
  assert.equal(servedCarrierOf("committed"), "LIQ_COMMITTED_STATE_NOTE", "the committed branch renders the restatement (its figures follow it)");
  assert.match(read(UKEMI_PAGE_REL), /const served = loadUkemiServed\(join\(process\.cwd\(\), "\.\.", "\.\."\)\);/, "the page reads the synced served-state file through its loader");
  // (2) The build check binds the same state: a state's body passes under it, reds under the other; both sentences red.
  const committedExpected = await ukemiExpected();
  assert.equal(committedExpected.registryState, "committed", "the synced served state is committed: the committed expectations are the real ones");
  const committedValues = committedExpected.figures.map((f) => f.value);
  assert.doesNotThrow(() => assertUkemiBody({ html: greenMain("committed", committedValues), expected: committedExpected }), "a committed body passes under the committed state");
  assert.throws(() => assertUkemiBody({ html: greenMain("committed", committedValues), expected: EXPECTED }), /empty-state sentence of the synced served state is absent/, "a committed body reds under the empty state");
  assert.throws(() => assertUkemiBody({ html: greenMain("empty"), expected: committedExpected }), /committed-state sentence of the synced served state is absent/, "an empty body reds under the committed state");
  assert.throws(() => assertUkemiBody({ html: greenMain("empty").replace("</main>", `<p>${LIQ_COMMITTED_STATE_NOTE}</p></main>`), expected: EXPECTED }), /committed-state sentence is rendered while the synced served state is empty/, "the other state's sentence reds");
  assert.throws(() => assertUkemiBody({ html: greenMain(), expected: { ...EXPECTED, registryState: "served" as unknown as "empty" } }), /registryState/, "an unknown state fails closed");
  // (3) main() reads the state of the served-state file through the page's loader: today's file, then each state (the
  //     committed v2 file, an empty v1 file); a committed file without its served verdict (v1) is refused.
  assert.equal(committedExpected.registryState, loadUkemiServed(ROOT).registry_state, "main() asserts the state of the committed served-state file");
  const t = tmpRoot();
  try {
    const base: Json = { ...rawServed(), schema: "monark-site-ukemi-served-v1" };
    delete base.liq_verdict;
    const files: Array<[string, Json]> = [["committed", rawServed()], ["empty", { ...base, registry_state: "empty", liq_clause: LIQ_CLAUSE_OF.empty }]];
    for (const [st, file] of files) {
      t.write(UKEMI_SERVED_REL, file);
      assert.equal((await ukemiExpected(t.root)).registryState, st, `main() follows a ${st} served-state file`);
    }
    t.write(UKEMI_SERVED_REL, { ...base, registry_state: "committed", liq_clause: LIQ_CLAUSE_OF.committed });
    await assert.rejects(ukemiExpected(t.root), /no served verdict/, "a committed v1 file (no served verdict) is refused");
  } finally {
    t.cleanup();
  }
  // (4) Dated (ADR-U4b-2b l.219): the rendered state was read from the /openapi.json the committed deploy check attests, and
  //     not before that check (a redeploy checked but not re-synced reds here).
  const ca = JSON.parse(read("docs/deploy-CA-harness.json")) as { checked_at: string; checks: Array<{ name: string; sha256: string | null }> };
  const served = loadUkemiServed(ROOT);
  const dated = (v: { read_at: string; body_sha256: string }): boolean =>
    v.body_sha256 === ca.checks.find((k) => k.name === "openapi")?.sha256 && Date.parse(v.read_at) >= Date.parse(ca.checked_at);
  assert.ok(dated(served), `the synced served state (read ${served.read_at}) comes from the document the deploy check (${ca.checked_at}) attests, read after it`);
  assert.ok(!dated({ ...served, read_at: new Date(Date.parse(ca.checked_at) - 1).toISOString() }), "detector control: a state read before the deploy check reds");
  // (5) The switch traps are re-framed, never removed (D5 point 4): each still compares the repository's harness with the
  //     synced or deploy-checked served state.
  const TRAPS: ReadonlyArray<readonly [string, string, string]> = [
    ["test/site-ukemi.test.ts", "site_ukemi_served_state_bound_to_harness_registry", 'assert.equal(s.registry_state, committed ? "committed" : "empty"'],
    ["test/harness-served.test.ts", "harness_served_data_matches_in_process_harness", 'sha(JSON.stringify(buildOpenApi())), "the served openapi body is the in-process document'],
    ["test/harness-served.test.ts", "harness_served_data_matches_in_process_harness", "assert.ok(GATE_TOOL_DESCRIPTION.includes(p), `class clause not served"],
    ["test/narabi-live.test.ts", "narabi_gate_facts_read_from_committed_sources", "assert.equal(sha256(openapi), servedOpenapi.sha256"],
    ["test/narabi-live.test.ts", "narabi_gate_facts_read_from_committed_sources", "assert.equal(NARABI_SERVED.gate.openapi_sha256, servedOpenapi.sha256"],
    ["test/site-build-fleet.test.ts", "registry_notes_track_served_descriptions", 'assert.equal(syncedEmpty && /=== "empty"'],
    ["test/site-build-fleet.test.ts", "registry_notes_track_served_descriptions", "assert.equal(servedLiq, syncedEmpty,"],
    ["test/site-build-fleet.test.ts", "registry_notes_track_served_descriptions", "const servedLiq = GATE_TOOL_DESCRIPTION.includes(SITE_LIQ_SENTENCE);"],
  ];
  for (const [rel, name, needle] of TRAPS) assert.ok(testBodyOf(rel, name).includes(needle), `a switch trap was removed instead of re-framed: ${rel} ${name}: ${needle}`);
  const probe = ['test("probe_trap - x", () => {', '  // assert.equal(a, b, "gone");', "  assert.ok(c); // kept", "});"].join("\n");
  assert.ok(!testBodyOfSource("probe.ts", probe, "probe_trap").includes("assert.equal(a, b"), "detector control: a commented-out trap counts as removed");
  assert.ok(testBodyOfSource("probe.ts", probe, "probe_trap").includes("assert.ok(c);"), "detector control: a live assertion is kept");
});

test("site_ukemi_count_wording_says_what_the_wire_serves — an uncommitted stratum is served counting no calibration point; the measured counts are on the course page (ADR-U4b-2b D5 point 5)", () => {
  const yhat = STRATA_CUTS_SERVED[0];
  assert.ok(yhat !== undefined && lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(strateOf(yhat))}`) === undefined, "the probe's stratum is not committed (non-vacuous)");
  const d = runGate({ schema_version: "1.1.0", task_class: TASK_LIQ_ELIGIBLE, yhat, predictor_id: "ukemi:site-copy-check", produced_at: "2026-09-24T00:00:00Z" }, LIQ_TEST_PARAMS);
  assert.equal(d.verdict.reason, "under_calib", "the uncommitted stratum abstains");
  assert.equal(d.verdict.n_calib, 0, "the served answer on an uncommitted stratum counts no calibration point");
  const calibrate = METHOD_STEPS.find((st) => st.name === "calibrate")?.detail ?? "";
  for (const [name, text] of [["COVERAGE_NOTE", COVERAGE_NOTE], ["STATES_NOTE", STATES_NOTE], ["the calibrate step", calibrate]] as const) {
    assert.ok(text.includes("counts no calibration point") && text.includes("course page"), `${name} says the wire counts no calibration point and where the measured counts are`);
    assert.ok(!/the count is published|with the count\b/.test(text), `${name} carries a former count wording`);
  }
});

/* ─────────── /ukemi, committed state: the note and the figures of the committed stratum, under a closed list ───────────
 * The note says "conformal"; n, the bound margin, the calibration digest and the day are read from the two committed,
 * hashed files, never typed; the build check holds them as a closed list of exact strings, each rendered exactly once in
 * the text, and no other number. Every altered value below is derived from the loaded files (no amount is typed). */

test("site_ukemi_committed_note_says_conformal_upper_bound — the committed-state note is the ruled text, word for word; the unit label is the report's", () => {
  // The artefact check compares the built page with this constant itself: only this pin sees "conformal" go.
  assert.equal(LIQ_COMMITTED_STATE_NOTE, "where a stratum's calibration is committed, the gate serves a conformal upper bound on the liquidable amount; on every other stratum it abstains (under_calib)");
  assert.ok(!/\benough\b/i.test(LIQ_COMMITTED_STATE_NOTE), "no 'enough points' reserve in the note");
  assert.deepEqual(scanText(LIQ_COMMITTED_STATE_NOTE, NO_EXEMPT), [], "the note carries no digit");
  assert.ok(loadUkemiCourse(ROOT).unit.startsWith(BOUND_UNIT + " ("), "BOUND_UNIT is the report's unit label up to its decimal count (not rendered)");
});

// killer: apps/site/lib/ukemi-served-load.ts:211 CONST "loadUkemiPending(rootDir) ?? loadUkemiServed(rootDir)" -> "loadUkemiServed(rootDir)"
test("site_ukemi_served_figures_read_from_the_two_files — the figures of the committed stratum are fields of the two files, read, never copied; a disagreement throws", async () => {
  const c = loadUkemiCourse(ROOT), s = loadUkemiServed(ROOT), v = s.liq_verdict;
  assert.ok(s.registry_state === "committed" && v !== null && v.bound_margin_base !== null, "a committed served state with its covered verdict (non-vacuous)");
  const base = v.bound_margin_base, k = v.stratum;
  const fresh = obj(obj(list(obj(obj(rawCourse().body, "body").h3, "h3").strata, "h3.strata")[k], "h3 stratum k").fresh, "fresh");
  // (1) The real files: each figure is its field; the margin also rebuilt by BigInt (dec8, independent of the loader).
  assert.deepEqual(servedFiguresOf(s, c), {
    points: String(v.calibration_points), boundMargin: dec8(base), readDate: s.read_at.slice(0, 10), digest: v.calibration_digest,
  });
  digestPin((await pinTarget(ROOT)).liq_verdict);
  // While a pending snapshot exists, the figure stays the served one and the in-process pin follows the pending one.
  await withStage(olderServed(), currentPending(), async (r) => {
    const older = loadUkemiServed(r);
    assert.equal(servedFiguresOf(older, c)?.digest, older.liq_verdict?.calibration_digest, "the page renders the served digest while a pending snapshot exists");
    await assert.doesNotReject(async () => { digestPin((await pinTarget(r)).liq_verdict); }, "the in-process pin follows the pending snapshot, the served one being older");
  });
  assert.equal(String(v.calibration_points), String(fresh.n), "the served count is the report's count of the stratum");
  assert.equal(dec8(base), list(obj(rawCourse().display, "display").strata_qhat, "strata_qhat")[k], "the margin is display.strata_qhat of the stratum");
  // (2) In-memory objects, each change derived from the loaded ones.
  const figuresOf = (sv: UkemiServed, cv: UkemiCourse = c) => (): unknown => servedFiguresOf(sv, cv);
  const withV = (lv: Partial<NonNullable<UkemiServed["liq_verdict"]>>): UkemiServed => ({ ...s, liq_verdict: { ...v, ...lv } });
  const shifted = String(BigInt(base) + 1n), below = c.strata.find((x) => !x.meets_floor);
  assert.ok(below !== undefined, "the report has a stratum below its floor");
  assert.throws(figuresOf(withV({ calibration_points: v.calibration_points + 1 })), /calibration points/, "a served n + 1 throws");
  assert.throws(figuresOf(withV({ bound_margin_base: shifted })), /bound margin/, "a served margin + 1 throws");
  assert.throws(figuresOf(withV({ stratum: below.stratum })), /floor/, "a verdict moved to a stratum below its floor throws");
  assert.throws(figuresOf({ ...s, liq_verdict: null }), /no served verdict/, "a committed state without its verdict throws");
  assert.equal(servedFiguresOf({ ...s, registry_state: "empty" }, c), null, "an empty registry has no figure");
  assert.equal(servedFiguresOf(s, { ...c, pooled: { ...c.pooled, bound_margin: dec8(shifted) } })?.boundMargin, dec8(base), "a pooled margin apart from the stratum's never replaces it");
  const agreed = { ...c, strata: c.strata.map((x) => (x.stratum === k ? { ...x, n: x.n + 1, bound_margin: dec8(shifted), bound_margin_base: shifted } : x)) };
  const moved = servedFiguresOf(withV({ calibration_points: v.calibration_points + 1, bound_margin_base: shifted }), agreed);
  assert.deepEqual([moved?.points, moved?.boundMargin], [String(v.calibration_points + 1), dec8(shifted)], "the figures follow the two files when they agree");
  const other = sha256(v.calibration_digest);
  assert.equal(servedFiguresOf(withV({ calibration_digest: other }), c)?.digest, other, "another digest is rendered as read");
  // (3) No string literal of the module carries a digit; (4) its imports are types only.
  const rel = "apps/site/lib/ukemi-served-figures.ts";
  const literals: string[] = [], typeOnly: boolean[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) typeOnly.push(node.importClause?.isTypeOnly === true);
    else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) literals.push(node.text);
    else ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(rel, read(rel), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
  assert.ok(literals.length > 5 && typeOnly.length > 0, "the module's literals and imports were read (false green)");
  for (const lit of literals) assert.deepEqual(scanText(lit, NO_EXEMPT), [], `a typed digit in the figures module: ${JSON.stringify(lit)}`);
  assert.ok(typeOnly.every(Boolean), "the figures module imports types only");
});

test("site_ukemi_figures_render_only_in_the_committed_branch — the four figures are JSX children of the committed branch, once each, and read nowhere else", () => {
  const sf = parseTsx(UKEMI_PAGE_REL, read(UKEMI_PAGE_REL));
  const reads = (root: ts.Node, childrenOnly: boolean): string[] => {
    const out: string[] = [];
    const visit = (n: ts.Node): void => {
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "figures") {
        const p = n.parent;
        if (!childrenOnly || (ts.isJsxExpression(p) && (ts.isJsxElement(p.parent) || ts.isJsxFragment(p.parent)))) out.push(n.name.text);
      }
      ts.forEachChild(n, visit);
    };
    visit(root);
    return out.sort();
  };
  const committed: ts.Node[] = [];
  const find = (n: ts.Node): void => {
    if (ts.isConditionalExpression(n) && ts.isBinaryExpression(n.condition) && n.condition.left.getText(sf).endsWith(".registry_state") &&
      ts.isStringLiteral(n.condition.right) && n.condition.right.text === "empty") committed.push(n.whenFalse);
    ts.forEachChild(n, find);
  };
  find(sf);
  const branch = committed[0], four = ["boundMargin", "digest", "points", "readDate"];
  assert.ok(branch !== undefined && committed.length === 1, "one served-state conditional on the page");
  // Children of the committed branch, once each; and no other read of a figure in the file: an attribute (title, alt,
  // aria-label), the empty branch or a second rendering would add a read, or take a child away.
  assert.deepEqual(reads(branch, true), four, "each figure is a JSX child of the committed branch, once");
  assert.deepEqual(reads(sf, false), four, "no figure is read anywhere else on the page");
  for (const [name, mod] of [["servedFiguresOf", "ukemi-served-figures"], ["loadUkemiCourse", "ukemi-course-load"]] as const) assert.ok(importedFrom(sf, mod).has(name), `the page imports ${name}`);
});

test("site_ukemi_body_numbers_closed_list — the /ukemi body carries each figure of the closed list exactly once, in its text, and no other number", async () => {
  const exp = await ukemiExpected();
  const values = exp.figures.map((f) => f.value);
  const [n = "", margin = "", digest = "", day = ""] = values;
  assert.ok(exp.registryState === "committed" && values.length === 4 && [n, margin, digest, day].every((x) => x.length > 0), "the closed list of the committed stratum: n, margin, digest, day");
  const check = (html: string, expected: UkemiExpected = exp): ReturnType<typeof assertUkemiBody> => assertUkemiBody({ html, expected });
  const red = (html: string, re: RegExp, why: string, expected: UkemiExpected = exp): void => {
    assert.throws(() => check(html, expected), re, why);
  };
  const green = greenMain("committed", values), sorted = (a: readonly string[]): string[] => [...a].sort();
  const tokens = values.flatMap((x) => scanNumericTokens(x)), r = check(green);
  assert.deepEqual([r.figures, r.numericTokens, r.figureTokens], [values.length, 0, tokens.length]);
  assert.deepEqual(sorted(scanNumericTokens(mainCorpus(extractMain(renderedBody(green))))), sorted(tokens), "nothing more, nothing less: the corpus tokens are the figures' tokens (multiset)");
  // A short value that is also a bounded part of a longer one (n set to the year of the day, then to the integer part of
  // the margin) counts once, longest value first; present twice outside the longer one, it reds.
  for (const short of [day.slice(0, 4), margin.split(".")[0] ?? ""]) {
    const vals = [short, margin, digest, day], expShort: UkemiExpected = { ...exp, figures: exp.figures.map((f, i) => (i === 0 ? { ...f, value: short } : f)) };
    assert.doesNotThrow(() => check(greenMain("committed", vals), expShort), "a short value inside a longer one counts once");
    red(greenMain("committed", vals).replace("</main>", `<p>${short}</p></main>`), /occurs 2 time/, "a short value twice outside the longer one reds", expShort);
  }
  red(green.replace("</main>", `<p>${scanNumericTokens(digest)[0] ?? ""}</p></main>`), /numeric token/, "an extra token the digest already carries reds (a set comparison passes it)");
  red(green.replace("</main>", "<p>185 of 189</p></main>"), /numeric token/, "a typed count reds");
  // Forms the scan cannot read red, fail-closed: a number inside angle brackets written as entities, a number after an
  // encoded angle bracket, the same digits in full width (each derived from the first digest token, nothing typed).
  const tok = scanNumericTokens(digest)[0] ?? "";
  red(green.replace("</main>", `<p>&lt;${tok}&gt;</p></main>`), /angle bracket written as an entity/, "a number inside encoded angle brackets reds");
  red(green.replace("</main>", `<p>n &lt; ${tok} points</p></main>`), /angle bracket written as an entity/, "a number after an encoded angle bracket reds");
  red(green.replace("</main>", `<p>${[...tok].map((ch) => String.fromCodePoint(0xff10 + Number(ch))).join("")}</p></main>`), /non-ASCII digits/, "a number in full-width digits reds");
  // Bounded occurrences only (C-2 i): the digest glued to one more hex letter is another string, not the figure.
  red(greenMain("committed", [n, margin, "f" + digest, day]), /occurs 0 time/, "a figure glued to a letter reds (bounded occurrences only)");
  values.forEach((x, i) => {
    const without = greenMain("committed", values.map((y, j) => (j === i ? "" : y)));
    red(without, /occurs 0 time/, `figure ${String(i)} absent reds`);
    red(green.replace("</main>", `<p>${x}</p></main>`), /occurs 2 time/, `figure ${String(i)} rendered twice reds`);
    red(without.replace("</main>", `<span title="${x}"></span></main>`), /occurs 0 time/, `figure ${String(i)} only in a title reds (an attribute is not text)`);
    if (scanNumericTokens(x).length > 0) red(green.replace("</main>", `<span title="${x}"></span></main>`), /numeric token/, `figure ${String(i)} also in a title reds`);
  });
  const SWAP: Record<string, string> = { a: "b", b: "a", c: "d", d: "c", e: "f", f: "e" };
  const swapped = digest.replace(/[a-f]/g, (ch) => SWAP[ch] ?? ch);
  assert.ok(swapped !== digest && sorted(scanNumericTokens(swapped)).join() === sorted(scanNumericTokens(digest)).join(), "letters swapped: same tokens, another string");
  const altered = [["a digest cut in half", [n, margin, digest.slice(0, digest.length / 2), day]], ["a digest with letters swapped", [n, margin, swapped, day]], ["n + 1", [String(Number(n) + 1), margin, digest, day]]] as const;
  for (const [why, vals] of altered) red(greenMain("committed", vals), /occurs 0 time/, `${why} reds`);
  red(greenMain("empty").replace("</main>", `<p>${n}</p></main>`), /numeric token/, "a figure in an empty served state reds", EXPECTED);
  red(green, /vacuity guard/, "an empty closed list in a committed state reds", { ...exp, figures: [] });
  red(green, /vacuity guard/, "a blank value reds", { ...exp, figures: exp.figures.map((f, i) => (i === 0 ? { ...f, value: " " } : f)) });
  red(greenMain(), /carries no figure/, "a closed list in an empty served state reds", { ...EXPECTED, figures: exp.figures });
});

test("site_ukemi_expected_figures_follow_the_committed_files — the build check's closed list is read from the two committed files by their loaders; a disagreement or a committed v1 file throws", async () => {
  const raw = rawServed(), lv = obj(raw.liq_verdict, "liq_verdict"), k = lv.stratum, base = lv.bound_margin_base;
  assert.ok(typeof k === "number" && typeof base === "string" && typeof lv.calibration_points === "number" && typeof raw.read_at === "string", "a committed v2 file");
  const fresh = obj(obj(list(obj(obj(rawCourse().body, "body").h3, "h3").strata, "h3.strata")[k], "h3 stratum k").fresh, "fresh");
  // n from the report; the margin rebuilt by BigInt from the served integer (dec8, not the loaders' routine); the digest
  // and the day from the served file.
  assert.deepEqual((await ukemiExpected()).figures.map((f) => f.value), [String(fresh.n), dec8(base), lv.calibration_digest, raw.read_at.slice(0, 10)]);
  const t = tmpRoot();
  try {
    const v1: Json = { ...raw, schema: "monark-site-ukemi-served-v1" };
    delete v1.liq_verdict;
    const refused: Array<[string, Json]> = [
      ["a served n + 1", { ...raw, liq_verdict: { ...lv, calibration_points: lv.calibration_points + 1 } }],
      ["a served margin + 1", { ...raw, liq_verdict: { ...lv, bound_margin_base: String(BigInt(base) + 1n) } }],
      ["a committed v1 file (no verdict)", { ...v1, registry_state: "committed", liq_clause: LIQ_CLAUSE_OF.committed }],
    ];
    for (const [why, file] of refused) {
      t.write(UKEMI_SERVED_REL, file);
      await assert.rejects(ukemiExpected(t.root), /cannot be read/, `${why} is refused`);
    }
    t.write(UKEMI_SERVED_REL, { ...v1, registry_state: "empty", liq_clause: LIQ_CLAUSE_OF.empty });
    assert.deepEqual((await ukemiExpected(t.root)).figures, [], "an empty served state has no figure");
  } finally {
    t.cleanup();
  }
});

test("site_ukemi_build_check_derives_figures_apart — the build check reads the two files through their loaders, never through the page's figures module", () => {
  const src = read("scripts/assert-fleet-html.mjs");
  for (const f of ["ukemi-course-load.ts", "ukemi-served-load.ts"]) assert.ok(src.includes(`await import(lib("${f}"))`), `the build check imports ${f} by file URL`);
  assert.ok(!src.includes("ukemi-served-figures"), "the build check never names the page's figures module (an error common to both would stay green)");
});

// killer: apps/site/lib/ukemi-served-load.ts:203 ROR "pendingSince > o.written_at" -> "pendingSince < o.written_at"
test("site_ukemi_digest_note_says_what_the_gate_returns — two answers on the committed stratum carry one calibration digest, the served one", async () => {
  gatePin((await pinTarget(ROOT)).liq_verdict);
  // The digest of the in-process answers is the pending one while it exists (here a --pending of C', a day after C2).
  await withStage(olderServed(), currentPending(), async (r) => {
    await assert.doesNotReject(async () => { gatePin((await pinTarget(r)).liq_verdict); }, "the in-process answers carry the pending digest, the served one being older");
    assert.throws(() => { gatePin(loadUkemiServed(r).liq_verdict); }, { code: "ERR_ASSERTION" }, "control: they do not carry the older served one");
  });
});

/* ─────────── UKEMI-PENDING-SNAPSHOT-1: the pending snapshot of the served state (G0 section 11) ─────────── */

// killer: apps/site/lib/ukemi-served-load.ts:196 SDL "if (pendingSince === undefined) fail(\"a pending snapshot exists but the served file carries no pending_since (fail-closed)\");" -> ""
test("ukemi_pending_snapshot_is_fail_closed — a pending snapshot loads only beside a served file marked pending_since, listed, closed and coherent", async () => {
  const { loadUkemiPending, loadUkemiInProcess } = await pendingLoader();
  const served = treeServed(), pending = currentPending(), lv = obj(pending.liq_verdict, "pending liq_verdict");
  const v1: Json = { ...rawServed(), schema: "monark-site-ukemi-served-v1" };
  delete v1.liq_verdict;
  const cases: Array<[Json, Json | null, boolean, RegExp, string]> = [
    [served, pending, true, /carries no pending_since/, "a pending snapshot beside a served file without pending_since reds"],
    [marked(served), null, true, /no pending snapshot exists/, "pending_since without a pending snapshot reds"],
    [{ ...served, pending_since: "9999-12-31" }, pending, true, /later than the day/, "a pending_since later than the day the pending snapshot was written reds"],
    [{ ...served, pending_since: "2026-1-4" }, pending, true, /must be a UTC day/, "a pending_since that is not a UTC day reds, though not later"],
    [marked(served), { ...pending, written_at: "2026-10-05" }, true, /written_at must be an ISO UTC instant/, "a written_at that is not an ISO instant reds"],
    [marked(v1), pending, true, /must carry exactly/, "pending_since is admitted in schema v2 only"],
    [marked(served), pending, false, /not listed/, "an unlisted pending snapshot reds"],
    [marked(served), { ...pending, schema: "monark-site-ukemi-served-v2" }, true, /schema is not monark-site-ukemi-pending-v1/, "a pending snapshot under the served schema reds"],
    [marked(served), { ...pending, liq_clause: "a clause of no state" }, true, /does not open with/, "a pending clause that opens with no state's sentence reds"],
    [marked(served), { ...pending, liq_verdict: { ...lv, interior_rank_min_n: Number(lv.interior_rank_min_n) - 1 } }, true, /interior_rank_min_n/, "a pending interior-rank threshold that is not the rule's reds"],
    // Q-UPS-C1, C2, C3: no fact read on the server, no body digest, no field name of the wire.
    ...["host", "path", "read_at", "body_sha256", "openapi_sha256", "scores_sha256"].map((k): [Json, Json, boolean, RegExp, string] =>
      [marked(served), { ...pending, [k]: served[k] ?? "0".repeat(64) }, true, /pending file must carry exactly/, `the pending snapshot refuses ${k}`]),
    ...["body_sha256", "scores_sha256"].map((k): [Json, Json, boolean, RegExp, string] =>
      [marked(served), { ...pending, liq_verdict: { ...lv, [k]: "0".repeat(64) } }, true, /liq_verdict must carry exactly/, `the pending verdict refuses ${k}`]),
  ];
  for (const [file, p, listed, re, why] of cases) {
    await withStage(file, p, (r) => {
      assert.throws(() => loadUkemiPending(r), re, why);
      assert.throws(() => loadUkemiInProcess(r), re, `${why} (the in-process target)`);
    }, listed);
  }
  const fields = Object.fromEntries(Object.entries(pending).filter(([k]) => k !== "$comment" && k !== "schema"));
  for (const s of [marked(served), { ...served, pending_since: String(pending.written_at).slice(0, 10) }]) { // pending_since on the day written_at names loads (C2)
    await withStage(s, pending, (r) => { assert.deepEqual(loadUkemiPending(r), fields, "control: the staged pending snapshot loads, field by field"); });
  }
});

// killer: apps/site/lib/ukemi-served-load.ts:192 CONST "!existsSync(join(rootDir, UKEMI_PENDING_REL))" -> "true"
test("ukemi_in_process_pins_follow_the_pending_snapshot — the five in-process places compare this tree with the pending snapshot while it exists, else with the served one", async () => {
  await pendingLoader();
  const tree = currentPending();
  const cases: Array<[Json, Json | null, boolean, string]> = [
    [olderServed(), tree, false, "a pending snapshot equal to the tree passes, the served one being older (clause and digest)"],
    [olderServed(), otherDigest(tree), true, "a pending digest that is not the tree's reds"],
    [olderServed(), otherClause(tree), true, "a pending clause that is not the tree's reds"],
    [marked(treeServed()), otherDigest(tree), true, "a pending snapshot that differs from the tree reds, even beside a served one equal to it"],
    [treeServed(), null, false, "control: without a pending snapshot, a served file equal to the tree passes (the base behaviour)"],
    [otherDigest(otherClause(treeServed())), null, true, "control: without a pending snapshot, an older served file reds (the pins bite)"],
  ];
  for (const [file, p, red, why] of cases) {
    await withStage(file, p, (r) => (red ? assert.rejects(pinsHold(r), { code: "ERR_ASSERTION" }, why) : assert.doesNotReject(pinsHold(r), why)));
  }
  await pinsHold(ROOT);
});

// killer: apps/site/lib/ukemi-served-load.ts:180 CONST "servedFile(rootDir).out" -> "{ ...servedFile(rootDir).out, ...loadUkemiPending(rootDir) }"
test("ukemi_pages_keep_the_served_snapshot_while_pending — the pages and their figures read the served file alone; a pending snapshot changes only the in-process pins", async () => {
  const { loadUkemiPending } = await pendingLoader();
  const pages = loadUkemiServed(ROOT), c = loadUkemiCourse(ROOT), next = otherDigest(otherClause(currentPending()));
  await withStage(marked(rawServed()), next, (r) => {
    const got = loadUkemiServed(r);
    assert.deepEqual([got.liq_clause, got.liq_verdict?.calibration_digest], [pages.liq_clause, pages.liq_verdict?.calibration_digest], "the pages keep the served clause and digest while a pending snapshot exists");
    assert.deepEqual(got, pages, "the pages read the committed served projection");
    assert.equal(servedFiguresOf(got, c)?.digest, pages.liq_verdict?.calibration_digest, "the rendered digest figure is the served one");
    assert.deepEqual([loadUkemiPending(r)?.liq_clause, loadUkemiPending(r)?.liq_verdict.calibration_digest], [next.liq_clause, obj(next.liq_verdict, "next").calibration_digest], "control: the staged pending snapshot carries the other clause and digest");
  });
});

// killer: scripts/sync-ukemi-served.mjs:216 CONST "UKEMI_PENDING_SHARED.filter" -> "Object.keys(pending).filter"
test("ukemi_pending_sync_writes_in_process_facts — --pending writes the in-process facts; the promotion compares the fixed shared fields; the manifest edits change one line", async () => {
  const sync = await pendingSync();
  const { UKEMI_PENDING_SHARED } = await pendingLoader();
  // (1) What --pending writes today is the target, on every shared field (the committed pending snapshot, else the served file).
  const written = (await sync.inProcessUkemiPending("2026-10-05T12:00:00.000Z")) as unknown as Json;
  assert.deepEqual(Object.keys(written), ["$comment", "schema", "written_at", ...UKEMI_PENDING_SHARED], "the pending snapshot carries its closed keys, in order");
  assert.deepEqual(Object.keys(obj(written.liq_verdict, "written verdict")), Object.keys(obj(rawServed().liq_verdict, "liq_verdict")).filter((k) => k !== "body_sha256"), "the pending verdict carries the eight served keys, in order");
  await syncPin(await pinTarget(ROOT));
  await withStage(olderServed(), currentPending(), (r) => assert.doesNotReject(async () => { await syncPin(await pinTarget(r)); }, "--pending equals the pending snapshot, the served one being older"));
  // (2) Promotion at T0: a served file equal to the pending one on every shared field (its verdict without body_sha256) promotes.
  const pending = currentPending(), next = treeServed();
  const diff = (p: Json): string[] => sync.ukemiPendingDiff(next, p);
  assert.deepEqual(diff(pending), [], "a served file equal to the pending snapshot is promoted");
  assert.deepEqual(diff(otherDigest(pending)), ["liq_verdict"], "another digest is named");
  assert.deepEqual(diff(otherClause(pending)), ["liq_clause"], "another clause is named");
  assert.deepEqual(diff(Object.fromEntries(Object.entries(pending).filter(([k]) => k !== "liq_clause" && k !== "cascade_uncalibrated_sentence_served"))), ["liq_clause", "cascade_uncalibrated_sentence_served"], "a pending snapshot missing shared fields cannot promote");
  assert.deepEqual(diff({ ...pending, liq_verdict: { ...obj(pending.liq_verdict, "liq_verdict"), body_sha256: "0".repeat(64) } }), ["liq_verdict"], "a pending verdict carrying a body digest cannot promote");
  assert.deepEqual(diff({ ...pending, read_at: next.read_at }), ["read_at"], "a pending snapshot carrying a key it may not carry cannot promote");
  assert.deepEqual(diff({ ...pending, schema: "monark-site-ukemi-served-v2" }), ["schema"], "a pending snapshot under another schema cannot promote");
  // (3) The manifest: --pending sets the pending entry right after the last Ukemi entry; the promotion removes it, one line.
  const manifest = read("apps/site/data/manifest.sha256.json").replace(/^ {4}"apps\/site\/data\/ukemi-pending\.json": "[0-9a-f]{64}",?\r?\n/m, "");
  const withPending = sync.setManifestEntry(manifest, PENDING_REL, "0".repeat(64));
  assert.equal(sync.removeManifestEntry(withPending, PENDING_REL), manifest, "setting then removing the pending entry gives the manifest back, byte for byte");
  const lines = (x: string): string[] => x.split("\n");
  assert.equal(lines(withPending).filter((l) => !lines(manifest).includes(l)).length, 1, "the pending entry is one line");
  assert.throws(() => sync.removeManifestEntry(manifest, PENDING_REL), /no entry.*interrupted.*remove apps\/site\/data\/ukemi-pending\.json/, "removing an absent entry is refused, naming the interrupted promotion");
  assert.throws(() => sync.removeManifestEntry(withPending.replace(/\n {2}/, "\n "), PENDING_REL), /canonical/, "a manifest not in its canonical form is refused");
  // (4) The served verdict keeps its bytes: verdictFactsOf, then the deploy check's body digest, last.
  const { handleJsonMirror } = await import("../apps/harness/src/http.ts");
  const gateText = await (await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sync.GATE_LIQ_BODY) }))).text();
  const state = sync.servedFacts(await (await handleJsonMirror(new Request("http://api.monarkgate.tech/openapi.json"))).text()).registry_state;
  const ca = JSON.stringify({ checks: [{ name: "gate_liq_call", ok: true, sha256: sha256(gateText) }] });
  assert.equal(JSON.stringify(sync.servedVerdictFacts(gateText, state, ca)), JSON.stringify({ ...sync.verdictFactsOf(gateText, state), body_sha256: sha256(gateText) }), "the served verdict is verdictFactsOf and the body digest, same keys, same order");
  // (5) The site's files and loader never spell a field name of the wire (Q-UPS-C3).
  for (const rel of ["apps/site/lib/ukemi-served-load.ts", ...readdirSync(join(ROOT, "apps/site/data")).filter((f) => f.startsWith("ukemi-")).map((f) => `apps/site/data/${f}`)]) {
    assert.ok(!/calib_digest|scores_sha256/.test(read(rel)), `${rel} spells no field name of the wire`);
  }
});

// killer: scripts/sync-ukemi-served.mjs:239 CONST "existsSync(join(root, HARNESS_PENDING_REL))" -> "false"
test("ukemi_promotion_waits_for_the_harness_promotion — the ukemi promotion is refused while the harness pending snapshot exists (T0 order: deploy check, harness sync, ukemi sync)", async () => {
  const sync = await pendingSync();
  const t = tmpRoot();
  try {
    assert.equal(sync.promotionBlocked(t.root), null, "control: no harness pending snapshot, the ukemi promotion may run");
    writeFileSync(join(t.root, "apps", "site", "data", "harness-pending.json"), "{}\n");
    assert.match(String(sync.promotionBlocked(t.root)), /harness-pending\.json/, "the ukemi promotion waits while the harness pending snapshot exists");
  } finally {
    t.cleanup();
  }
  const src = read("scripts/sync-ukemi-served.mjs"), at = src.indexOf("async function main() {"), main = src.slice(at, src.indexOf("\n}\n", at));
  const before = (a: string, b: string): boolean => main.includes(a) && main.indexOf(a) < main.indexOf(b); // killers by hand (G2 m-1): SDL "fail(blocked);", ROR "drift.length > 0" -> "< 0"
  assert.ok(at > 0 && before("const blocked = promotionBlocked(ROOT);", "if (blocked !== null) fail(blocked);") && before("if (blocked !== null) fail(blocked);", "readBody(") && before("if (drift.length > 0) throw", "applyWrites(ROOT, "), "the default sync refuses out of order before any read, and a drift before any write (the writes go through applyWrites)");
});
