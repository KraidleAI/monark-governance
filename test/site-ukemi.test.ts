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
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  SERVED_STATE_LEAD,
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
} from "../apps/site/lib/ukemi-copy.ts";
import {
  LIQ_UPPER_BOUND_SENTENCE as GATE_LIQ_UPPER_BOUND_SENTENCE,
  LIQ_H3_SENTENCE as GATE_LIQ_H3_SENTENCE,
  LIQ_CONDITIONAL_SENTENCE as GATE_LIQ_CONDITIONAL_SENTENCE,
  LIQ_EMPTY_REGISTRY_SENTENCE as GATE_LIQ_EMPTY_REGISTRY_SENTENCE,
} from "../apps/harness/src/tools/gate.ts";
import { assertUkemiBody, scanNumericTokens } from "../scripts/assert-fleet-html.mjs";
import { scanText, scanSource, renderedTexts } from "../apps/site/test/honesty-lint.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");
const UKEMI_PAGE_REL = "apps/site/components/ukemi/ukemi-page.tsx";
const UKEMI_ROUTE_REL = "apps/site/app/ukemi/page.tsx";
const UKEMI_ICON_REL = "apps/site/public/icons/ukemi.svg";
const NO_EXEMPT = new Set<string>();
const EXPECTED = { emptyRegistrySentence: LIQ_EMPTY_REGISTRY_SENTENCE, conditionalSentence: LIQ_CONDITIONAL_SENTENCE };

// A green <main> fixture composed from the REAL ukemi-copy exports, mirroring the page structure (advisor 2):
// class/style carry digits (stripped by the scan), every rendered TEXT node is digit-free.
function greenMain(): string {
  const li = (items: readonly string[]): string =>
    items.map((t) => `<li><span aria-hidden="true">+</span><span>${t}</span></li>`).join("");
  const steps = METHOD_STEPS.map((s) => `<div><div>${s.name}</div><div>${s.title}</div><p>${s.detail}</p></div>`).join("");
  const limits = LIMITS.map((l) => `<div><h3>${l.title}</h3><p>${l.detail}</p></div>`).join("");
  return (
    `<main class="mx-auto max-w-[1200px] px-6 py-16">` +
    `<div>Ukemi</div><span>built</span>` +
    `<h1>${HERO_TITLE}</h1><p>${HERO_DEK}</p>` +
    `<div>${WHAT_LABEL}</div><ul>${li(IS_LIST)}</ul><ul>${li(IS_NOT_LIST)}</ul>` +
    `<div>${SERVED_LABEL}</div><p>${SERVED_STATE_LEAD}</p><p>${LIQ_EMPTY_REGISTRY_SENTENCE}</p>` +
    `<div aria-hidden="true"><span style="left:22%;width:44%">${BAR_UPPER_LABEL}</span>` +
    `<span style="left:22%">${BAR_YHAT_LABEL}</span><span>${BAR_FLOOR_LABEL}</span></div>` +
    `<p>${REGION_NOTE}</p><p>${CONDITIONAL_LEAD}</p><p>${LIQ_CONDITIONAL_SENTENCE}</p>` +
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
    ["LIQ_EMPTY_REGISTRY_SENTENCE", LIQ_EMPTY_REGISTRY_SENTENCE], ["LIQ_CONDITIONAL_SENTENCE", LIQ_CONDITIONAL_SENTENCE],
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
  redBody((h) => h.replace(LIQ_EMPTY_REGISTRY_SENTENCE, "no calibration"), /empty-registry sentence is absent/, "empty-registry sentence removed reds");
  redBody((h) => h.replace(LIQ_CONDITIONAL_SENTENCE, "the bound holds only if it holds"), /conditional sentence is absent/, "conditional sentence removed reds");
  redBody((h) => h.replace(REGION_NOTE, REGION_NOTE + " cascade"), /cascade/, "cascade reds (line/wiring rendered)");
  redBody((h) => h.replace(REGION_NOTE, REGION_NOTE + " Bell"), /Bell/, "Bell reds");
  redBody((h) => h.replace(REGION_NOTE, REGION_NOTE + " Aave"), /Aave/, "Aave reds");
  assert.throws(() => assertUkemiBody({ html: "<section>no main here</section>", expected: EXPECTED }), /no <main>/, "no <main> fails-closed");
  assert.throws(() => assertUkemiBody({ html: "<main>   </main>", expected: EXPECTED }), /empty\/blank/, "empty <main> fails-closed");
  assert.throws(() => assertUkemiBody({ html: greenMain(), expected: { emptyRegistrySentence: "", conditionalSentence: LIQ_CONDITIONAL_SENTENCE } }), /vacuity/, "a blank expected sentence fails-closed");

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
  // The Ukemi register row's line ("Liquidation-cascade survival.") and wiring.note carry "cascade"
  // (fleet.ts:155-166); rendering them reds assertUkemiBody \bcascade\b=0 and CANNOT be fixed by editing the
  // frozen fleet.ts. So the component reads status ONLY. Mutant: add a .line / .wiring access => this reds.
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
