/**
 * Root oracles for the documentation section of the storefront (/docs) and for MONARK Building (/roadmap). Non-LLM, source
 * level: the page sources are parsed with the TypeScript compiler (the honesty-lint walker for rendered text), the pure data
 * modules and the committed bibliography are imported or read, and every rule is checked on them. What they pin:
 *
 *   (1) every docs page renders at least one schema, and every schema component draws an <svg> (through Diagram);
 *   (2) statuses come from the fleet register: no hard-coded status attribute, no status value typed as a literal into a
 *       status prop, no typed "X is built" sentence, and the piece words agree with the register in both directions;
 *   (3) examples come from committed data: a JSON block prints an object read from data (no literal inside its value), no
 *       JSON-looking literal and no hex digest is typed in a docs source;
 *   (4) the docs data modules and the bibliography pass the site's rules (digits, dashes, vocabulary, the word "product");
 *   (5) the piece pages, the piece words and the navigation match the register, both ways;
 *   (6) the bibliography loader fails closed, and every work a page cites exists in it;
 *   (7) the reason glosses track the frozen enum both ways;
 *   (8) the language gate scans the docs route (a directory named docs under apps/site is a route, not a governance folder);
 *   (9) the honesty lint scans the docs files and finds no rendered numeric literal in them;
 *  (10) MONARK Building keeps its derived facts and its alias.
 * Each block names its mutant; the mutants are replayed in memory here (a real file is never edited by the test).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import ts from "typescript";
import { renderedTexts, scanText as scanNumericText, loadExemptFile, exemptValues, scanAppsSite } from "../apps/site/test/honesty-lint.ts";
import { compilePatterns, scanText as scanVocab } from "../scripts/grep-forbidden.mjs";
import { skipDir, collectTextFiles } from "../scripts/lang-gate.mjs";
import { FLEET_AGENTS, PRODUCTS } from "../apps/site/lib/fleet.ts";
import { DOCS_SECTIONS, DOCS_PIECES_ROOT, pieceSlug } from "../apps/site/lib/docs-nav.ts";
import { PIECE_DOCS, ROLE_WORDS } from "../apps/site/lib/docs-pieces.ts";
import { REASON_DOCS, POLICY_STEPS, CHAMBERS, ACTION_GLOSSES } from "../apps/site/lib/docs-gate.ts";
import { loadDocsReferences, DOCS_REFERENCES_REL, DOCS_QUOTE_MAX_WORDS } from "../apps/site/lib/docs-references-load.ts";
import { siteVocabulary } from "../apps/site/lib/docs-vocab.ts";
import { loadGateEnums } from "../apps/site/lib/gate-enums.ts";
import { SHOGEN_SERVED_SCOPE } from "../apps/site/lib/shogen-copy.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");
const posix = (p: string): string => p.replace(/\\/g, "/");

/** Every file under an apps/site directory with one of the extensions, as repo-relative POSIX paths. */
function filesUnder(rel: string, exts: readonly string[]): string[] {
  const base = join(ROOT, ...rel.split("/"));
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      if (statSync(abs).isDirectory()) walk(abs);
      else if (exts.some((e) => name.endsWith(e))) out.push(posix(relative(ROOT, abs)));
    }
  };
  walk(base);
  return out.sort();
}

const DOCS_PAGES = filesUnder("apps/site/app/docs", ["page.tsx"]);
const DOCS_TSX = [...filesUnder("apps/site/app/docs", [".tsx"]), ...filesUnder("apps/site/components/docs", [".tsx"])];
const DOCS_LIBS = ["apps/site/lib/docs-nav.ts", "apps/site/lib/docs-pieces.ts", "apps/site/lib/docs-gate.ts", "apps/site/lib/shogen-copy.ts"];
const SCHEMA_FILES = filesUnder("apps/site/components/docs/schemas", [".tsx"]);
const ROADMAP = "apps/site/app/roadmap/page.tsx";

const sourceFile = (rel: string, text?: string): ts.SourceFile =>
  ts.createSourceFile(rel, text ?? read(rel), ts.ScriptTarget.Latest, true, rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

/** Rendered texts of a TSX source (the honesty-lint walker: JSX text, JSX child literals, visible attributes). */
const renderedOf = (rel: string, text?: string): string[] => renderedTexts(sourceFile(rel, text)).map((t) => t.text);

/** Every string literal and every static part of a template literal in a source, with the name of the JSX attribute it
 *  sits in when it sits in one. */
function literalsOf(sf: ts.SourceFile): { text: string; attr: string | null }[] {
  const out: { text: string; attr: string | null }[] = [];
  const attrOf = (node: ts.Node): string | null => {
    // The direct owner first: an object property whose value the literal is (a class-name property such as a tone).
    if (node.parent !== undefined && ts.isPropertyAssignment(node.parent) && node.parent.initializer === node) {
      const owner = node.parent.name.getText(sf);
      if (/^(?:tone|maturityTone|className)$/.test(owner)) return "className";
    }
    let n: ts.Node | undefined = node.parent;
    while (n !== undefined) {
      if (ts.isJsxAttribute(n)) return n.name.getText(sf);
      if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return "import";
      n = n.parent;
    }
    return null;
  };
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) out.push({ text: node.text, attr: attrOf(node) });
    else if (ts.isTemplateExpression(node)) {
      out.push({ text: node.head.text, attr: attrOf(node) });
      for (const span of node.templateSpans) out.push({ text: span.literal.text, attr: attrOf(node) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/** The JSX tag names a source renders. */
function jsxTags(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) out.push(node.tagName.getText(sf));
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/** Named imports of a source from a module specifier that starts with `prefix`. */
function importsFrom(sf: ts.SourceFile, prefix: string): string[] {
  const out: string[] = [];
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    if (!st.moduleSpecifier.text.startsWith(prefix)) continue;
    const named = st.importClause?.namedBindings;
    if (named !== undefined && ts.isNamedImports(named)) for (const el of named.elements) out.push(el.name.text);
  }
  return out;
}

// ── (1) every page renders a schema; every schema draws an svg ──────────────────────────────────────────────────────
test("docs_pages_render_a_schema — every /docs page renders at least one schema, and every schema component draws an svg", () => {
  assert.ok(DOCS_PAGES.length >= 20, `implausibly few docs pages (${String(DOCS_PAGES.length)}): false green?`);
  const pieceDocPage = sourceFile("apps/site/components/docs/piece-doc-page.tsx");
  const pieceRendersPlate = importsFrom(pieceDocPage, "./schemas/").some((n) => jsxTags(pieceDocPage).includes(n));
  assert.ok(pieceRendersPlate, "the shared piece page renders a schema imported from components/docs/schemas");
  const rendersSchema = (rel: string, text?: string): boolean => {
    const sf = sourceFile(rel, text);
    const tags = jsxTags(sf);
    const schemas = importsFrom(sf, "@/components/docs/schemas/");
    return schemas.some((n) => tags.includes(n)) || (tags.includes("PieceDocPage") && pieceRendersPlate);
  };
  const without = DOCS_PAGES.filter((rel) => !rendersSchema(rel));
  assert.deepEqual(without, [], `docs pages that render no schema: ${without.join(", ")}`);
  // Every exported component of a schema module draws through Diagram (which renders the <svg>), and Diagram renders <svg.
  const kit = read("apps/site/components/docs/svg-kit.tsx");
  assert.match(kit, /export function Diagram[\s\S]*?<svg className="d-svg"/, "Diagram renders the svg element");
  for (const rel of SCHEMA_FILES) {
    const sf = sourceFile(rel);
    for (const st of sf.statements) {
      if (!ts.isFunctionDeclaration(st) || st.name === undefined) continue;
      const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      if (!exported) continue;
      const body = st.getText(sf);
      assert.match(body, /<Diagram\b/, `${rel}: the exported schema ${st.name.text} draws no Diagram (no svg)`);
    }
  }
  // Mutant: the schema removed from the gate page (its figures replaced by a paragraph) reds.
  const gateRel = "apps/site/app/docs/gate/page.tsx";
  const mutant = read(gateRel).replace(/<(DecisionPathSchema|PolicySchema|QuantileSchema|StrandsSchema)\b[^>]*\/>/g, "<p>removed</p>");
  assert.notEqual(mutant, read(gateRel), "premise: the mutant applies");
  assert.equal(rendersSchema(gateRel, mutant), false, "mutant: a docs page without its schema must red");
});

// ── (2) statuses come from the register ─────────────────────────────────────────────────────────────────────────────
const NAMES = [...FLEET_AGENTS.map((a) => a.name), ...PRODUCTS.map((p) => p.name)];
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TYPED_STATUS = new RegExp(`(?:${NAMES.map(escapeRe).join("|")})\\b[^.;:]{0,40}?\\b(?:is|are|stays|remains|becomes|was)\\s+(?:now\\s+)?(?:built|upcoming|served|delivered|live|shipped)\\b`, "i");
const HARD_STATUS_ATTR = /status\s*=\s*\{?\s*["'](?:built|upcoming)["']/;

/** A status prop given a literal value (`status="built"`, `status={"upcoming"}`) anywhere in a TSX source. */
function literalStatusProps(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJsxAttribute(node) && node.name.getText(sf) === "status" && node.initializer !== undefined) {
      const init = node.initializer;
      if (ts.isStringLiteral(init)) out.push(init.text);
      else if (ts.isJsxExpression(init) && init.expression !== undefined && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression))) out.push(init.expression.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

test("docs_statuses_come_from_the_register — no hard-coded status, no typed status sentence, piece words agree with the register", () => {
  const files = [...DOCS_TSX, ROADMAP];
  for (const rel of files) {
    const text = read(rel);
    assert.ok(!HARD_STATUS_ATTR.test(text), `${rel}: a hard-coded status attribute`);
    assert.deepEqual(literalStatusProps(sourceFile(rel)), [], `${rel}: a status prop given a literal value`);
    const typed = renderedOf(rel).filter((t) => TYPED_STATUS.test(t.replace(/\s+/g, " ")));
    assert.deepEqual(typed, [], `${rel}: a status typed next to a register name`);
    const typedLiterals = literalsOf(sourceFile(rel)).filter((l) => TYPED_STATUS.test(l.text));
    assert.deepEqual(typedLiterals.map((l) => l.text), [], `${rel}: a status typed in a string literal`);
  }
  for (const rel of DOCS_LIBS) {
    const typedLiterals = literalsOf(sourceFile(rel)).filter((l) => TYPED_STATUS.test(l.text));
    assert.deepEqual(typedLiterals.map((l) => l.text), [], `${rel}: a status typed in the docs data`);
  }
  // The piece words follow the register: an upcoming piece opens on "Named, not delivered.", a built one never says it.
  for (const a of FLEET_AGENTS) {
    const doc = PIECE_DOCS[pieceSlug(a.name)];
    assert.ok(doc !== undefined, `no docs words for ${a.name}`);
    const named = /Named, not delivered/.test(doc.summary);
    if (a.status === "upcoming") assert.ok(doc.summary.startsWith("Named, not delivered."), `${a.name} is upcoming in the register: its summary must open on "Named, not delivered."`);
    else assert.ok(!named && !/Named, not delivered/.test(doc.notClaim), `${a.name} is built in the register: its words must not say named, not delivered`);
  }
  // The detectors are load-bearing (mutants in memory).
  const bellRel = "apps/site/app/docs/bell/page.tsx";
  const typedMutant = read(bellRel).replace("<DocSection id=\"why\" title=\"Why off hours\">", "<DocSection id=\"why\" title=\"Why off hours\"><p>MONARK Bell is built and served.</p>");
  assert.notEqual(typedMutant, read(bellRel), "premise: the typed-status mutant applies");
  assert.ok(renderedOf(bellRel, typedMutant).some((t) => TYPED_STATUS.test(t)), "mutant: a typed status sentence must red");
  const attrMutant = read(bellRel).replace("<StatusPill status={bell.status} />", "<StatusPill status=\"built\" />");
  assert.notEqual(attrMutant, read(bellRel), "premise: the literal-status mutant applies");
  assert.ok(HARD_STATUS_ATTR.test(attrMutant) && literalStatusProps(sourceFile(bellRel, attrMutant)).length > 0, "mutant: a literal status prop must red");
  const exprMutant = read(bellRel).replace("<StatusPill status={bell.status} />", "<StatusPill status={\"upcoming\"} />");
  assert.ok(literalStatusProps(sourceFile(bellRel, exprMutant)).length > 0, "mutant: a JSX-wrapped literal status must red");
  assert.ok(!TYPED_STATUS.test("Ukemi measures the difference between eligible and liquidated."), "control: plain prose about a piece stays green");
});

// ── (3) examples come from committed data ───────────────────────────────────────────────────────────────────────────
/** Literal leaves inside the value of every <JsonBlock value={...}>: a typed example. */
function jsonBlockLiterals(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const leaves = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node)) {
      leaves(node.initializer);
      return;
    }
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) out.push(node.getText(sf));
    else if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.NullKeyword) out.push(node.getText(sf));
    else if (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node) || ts.isParenthesizedExpression(node) || ts.isSpreadElement(node) || ts.isSpreadAssignment(node)) ts.forEachChild(node, leaves);
  };
  const visit = (node: ts.Node): void => {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(sf) === "JsonBlock") {
      for (const attr of node.attributes.properties) {
        if (ts.isJsxAttribute(attr) && attr.name.getText(sf) === "value" && attr.initializer !== undefined && ts.isJsxExpression(attr.initializer) && attr.initializer.expression !== undefined) {
          leaves(attr.initializer.expression);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}
const JSON_LOOKING = /\{\s*"|"\s*:\s*["\d[{]|\[\s*\{/;
const HEX_DIGEST = /\b[0-9a-f]{16,}\b/;

test("docs_examples_come_from_committed_data — JSON blocks print read objects; no typed JSON and no typed digest in a docs source", () => {
  let blocks = 0;
  for (const rel of DOCS_TSX) {
    const sf = sourceFile(rel);
    blocks += jsxTags(sf).filter((t) => t === "JsonBlock").length;
    assert.deepEqual(jsonBlockLiterals(sf), [], `${rel}: a JsonBlock value carries a typed literal`);
    const jsonish = renderedOf(rel).filter((t) => JSON_LOOKING.test(t));
    assert.deepEqual(jsonish, [], `${rel}: a JSON-looking literal in rendered text`);
    const hex = literalsOf(sf).filter((l) => HEX_DIGEST.test(l.text));
    assert.deepEqual(hex.map((l) => l.text), [], `${rel}: a typed hex digest`);
  }
  assert.ok(blocks >= 8, `the docs render their examples through JsonBlock (${String(blocks)} found): false green?`);
  // Mutants in memory: a typed example object, a typed JSON string, a typed digest.
  const rel = "apps/site/app/docs/integrators/page.tsx";
  const m1 = read(rel).replace("<JsonBlock value={h5.btcDir.result}", "<JsonBlock value={{ action: \"commit\", seq: 2 }}");
  assert.notEqual(m1, read(rel), "premise: the typed-object mutant applies");
  assert.ok(jsonBlockLiterals(sourceFile(rel, m1)).length > 0, "mutant: a typed example object must red");
  const m2 = read(rel).replace("<DocSection id=\"setup\" title=\"Add it in one line\">", "<DocSection id=\"setup\" title=\"Add it in one line\"><pre>{'{\"action\": \"commit\"}'}</pre>");
  assert.ok(renderedOf(rel, m2).some((t) => JSON_LOOKING.test(t)), "mutant: a typed JSON string must red");
  const m3 = read(rel).replace("const { api, mcp, refusal, bounds } = served;", "const { api, mcp, refusal, bounds } = served;\n  const typed = \"ef3b06f2ff93951e200a6559b42ab66d\";");
  assert.notEqual(m3, read(rel), "premise: the typed-digest mutant applies");
  assert.ok(literalsOf(sourceFile(rel, m3)).some((l) => HEX_DIGEST.test(l.text)), "mutant: a typed digest must red");
});

// ── (4) the docs data and the bibliography pass the site's rules ────────────────────────────────────────────────────
interface VocabConfig {
  banned: { re: string; why: string }[];
  scan: { site: { banned: { re: string; why: string }[]; exemptPhrases: string[] } };
}
const DASH = /[–—]/;
/** A long dash as a character or as an HTML entity (the text of a JSX node keeps an entity as it was written). */
const DASH_ANY = /[–—]|&(?:mdash|ndash);|&#(?:8212|8211|x2014|x2013);/i;
const PRODUCT_WORD = /\bproducts?\b/i;

/** Every string of a parsed JSON value. */
const jsonStrings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) jsonStrings(x, out);
  else if (v !== null && typeof v === "object") for (const x of Object.values(v)) jsonStrings(x, out);
  return out;
};

test("docs_data_is_clean — the docs data modules and the bibliography: no digit hole, no long dash, no banned word, no 'product'", () => {
  const cfg = JSON.parse(read("vocab-banned.json")) as VocabConfig;
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.site.banned)];
  const phrases = cfg.scan.site.exemptPhrases;
  const exempt = exemptValues(loadExemptFile(ROOT));
  const check = (where: string, s: string, digits: boolean): string[] => {
    const why: string[] = [];
    if (digits && scanNumericText(s, exempt).length > 0) why.push("digit");
    if (DASH.test(s)) why.push("long dash");
    if (scanVocab(s, patterns, phrases).length > 0) why.push("banned word");
    if (PRODUCT_WORD.test(s)) why.push("product");
    return why.map((w) => `${where}: ${w}: ${JSON.stringify(s.slice(0, 80))}`);
  };
  const hits: string[] = [];
  // The pure data modules: every string, digits included (none is a number).
  for (const [slug, d] of Object.entries(PIECE_DOCS)) {
    for (const s of [d.tagline, d.summary, d.notClaim, d.entry.title, ...d.entry.lines, d.mechanism.title, ...d.mechanism.lines, d.output.title, ...d.output.lines, ...d.more.map((m) => m.label)]) {
      hits.push(...check(`docs-pieces ${slug}`, s, true));
    }
  }
  for (const s of [...ACTION_GLOSSES, ...Object.values(REASON_DOCS).map((r) => r.gloss), ...CHAMBERS.flatMap((c) => [c.title, c.blurb]), ...POLICY_STEPS.map((p) => p.question), ...Object.values(ROLE_WORDS)]) {
    hits.push(...check("docs-gate", s, true));
  }
  for (const s of DOCS_SECTIONS.flatMap((x) => [x.label, x.blurb])) hits.push(...check("docs-nav", s, true));
  // The string literals of the docs sources that are not geometry or markup, digits included.
  for (const rel of [...DOCS_TSX, ...DOCS_LIBS, ROADMAP]) {
    for (const l of literalsOf(sourceFile(rel))) {
      if (l.attr !== null && MARKUP.has(l.attr)) continue;
      if (/^(?:var\(--|(?:https?|doi|arXiv):|\/|#|\.\/|@\/|[a-z0-9-]+\.schema\.json$|[a-z0-9-]+$)/.test(l.text)) continue; // CSS vars, URLs, paths, anchors, file names, single tokens
      hits.push(...check(rel, l.text, true));
    }
  }
  // The rendered texts of the docs sources and of MONARK Building (JSX text, JSX child literals, visible attributes): no long
  // dash, typed as a character or as an entity.
  for (const rel of [...DOCS_TSX, ROADMAP]) {
    for (const t of renderedOf(rel)) if (DASH_ANY.test(t)) hits.push(`${rel}: long dash in rendered text: ${JSON.stringify(t.slice(0, 80))}`);
  }
  // The bibliography: no digit rule (a year, a volume or an identifier is a datum of the entry), every other rule.
  for (const s of jsonStrings(JSON.parse(read(DOCS_REFERENCES_REL)) as unknown)) hits.push(...check(DOCS_REFERENCES_REL, s, false));
  assert.deepEqual(hits, [], `docs data breaks a site rule:\n${hits.join("\n")}`);
  // Load-bearing: each rule reds on its sample.
  assert.ok(check("x", "stays built for 3 weeks", true).some((h) => h.includes("digit")), "control: a digit reds");
  assert.ok(check("x", "a region — never a score", true).some((h) => h.includes("long dash")), "control: a long dash reds");
  assert.ok(check("x", "high confidence signals", true).some((h) => h.includes("banned word")), "control: a banned word reds");
  assert.ok(check("x", "our products", true).some((h) => h.includes("product")), "control: the word product reds");
  assert.deepEqual(check("x", "no confidence field, anywhere", true), [], "control: the exempt phrase stays green");
  const gateRel = "apps/site/app/docs/gate/page.tsx";
  const entityDash = read(gateRel).replace("Before the policy runs, the adapter", "Before the policy runs &mdash; the adapter");
  assert.notEqual(entityDash, read(gateRel), "premise: the entity-dash mutant applies");
  assert.ok(renderedOf(gateRel, entityDash).some((t) => DASH_ANY.test(t)), "control: a long dash typed as an entity in JSX text reds");
});

// ── (5) the pieces and the navigation match the register ────────────────────────────────────────────────────────────
test("docs_pieces_and_navigation_match_the_register — folders, words and links, both ways", () => {
  const slugs = FLEET_AGENTS.map((a) => pieceSlug(a.name)).sort();
  const piecesDir = join(ROOT, "apps", "site", "app", "docs", "pieces");
  const folders = readdirSync(piecesDir).filter((n) => statSync(join(piecesDir, n)).isDirectory()).sort();
  assert.deepEqual(folders, slugs, "one piece page folder per register agent, and no other");
  for (const f of folders) {
    const page = read(`apps/site/app/docs/pieces/${f}/page.tsx`);
    assert.match(page, new RegExp(`<PieceDocPage slug="${f}" />`), `pieces/${f}: renders the shared piece page for its own slug`);
  }
  assert.deepEqual(Object.keys(PIECE_DOCS).sort(), slugs, "the piece words are keyed by the register's slugs, both ways");
  for (const a of FLEET_AGENTS) assert.ok(ROLE_WORDS[a.role] !== undefined, `a role word for ${a.role}`);
  const refs = loadDocsReferences(ROOT);
  const ids = new Set(refs.references.map((r) => r.id));
  for (const [slug, d] of Object.entries(PIECE_DOCS)) {
    for (const r of d.refs) assert.ok(ids.has(r), `docs-pieces ${slug} cites the unknown work ${r}`);
    for (const c of d.contracts) assert.ok(existsSync(join(ROOT, "schemas", c)), `docs-pieces ${slug} names the absent schema ${c}`);
  }
  // Every section of the navigation has its page, and every docs page is a section or a piece.
  for (const s of DOCS_SECTIONS) {
    const rel = s.href === "/docs" ? "apps/site/app/docs/page.tsx" : `apps/site/app${s.href}/page.tsx`;
    assert.ok(existsSync(join(ROOT, ...rel.split("/"))), `the section ${s.href} has no page`);
  }
  const sectionPages = new Set(DOCS_SECTIONS.map((s) => (s.href === "/docs" ? "apps/site/app/docs/page.tsx" : `apps/site/app${s.href}/page.tsx`)));
  for (const rel of DOCS_PAGES) {
    assert.ok(sectionPages.has(rel) || rel.startsWith(`apps/site/app${DOCS_PIECES_ROOT}/`), `a docs page outside the navigation: ${rel}`);
  }
  // Header and footer link the documentation, and name /roadmap by its page title.
  for (const rel of ["apps/site/components/site-header.tsx", "apps/site/components/site-footer.tsx"]) {
    const src = read(rel);
    assert.match(src, /\{ href: "\/docs", label: "Docs" \}/, `${rel}: links the documentation`);
    assert.match(src, /\{ href: "\/roadmap", label: "Building" \}/, `${rel}: names the /roadmap page MONARK Building`);
  }
  assert.match(read("apps/site/app/docs/layout.tsx"), /<DocsNav\b/, "the docs layout renders the sidebar");
});

// ── (6) the bibliography fails closed; every cited work exists ───────────────────────────────────────────────────────
test("docs_references_fail_closed_and_every_cited_work_exists", () => {
  const refs = loadDocsReferences(ROOT);
  assert.ok(refs.references.length >= 20, "the bibliography is loaded (false-green guard)");
  const ids = new Set(refs.references.map((r) => r.id));
  const resultIds = new Set(refs.results.map((r) => r.id));
  // Every id a docs source cites, statically: <Cite refId="…" />, resultById(refs, "…"), refIds={[…]}.
  const cited: string[] = [];
  const results: string[] = [];
  const quoted: string[] = [];
  for (const rel of DOCS_TSX) {
    const src = read(rel);
    for (const m of src.matchAll(/refId="([a-z0-9-]+)"/g)) cited.push(m[1] ?? "");
    for (const m of src.matchAll(/resultById\([a-zA-Z]+(?:\(\))?, "([a-z0-9-]+)"\)/g)) results.push(m[1] ?? "");
    for (const m of src.matchAll(/refIds=\{\[([^\]]*)\]\}/g)) for (const q of (m[1] ?? "").matchAll(/"([a-z0-9-]+)"/g)) cited.push(q[1] ?? "");
    for (const m of src.matchAll(/quoteById\([a-zA-Z]+(?:\(\))?, "([a-z0-9-]+)"\)/g)) quoted.push(m[1] ?? "");
  }
  assert.ok(cited.length >= 20 && results.length >= 5, "the citations are collected (false-green guard)");
  assert.deepEqual(cited.filter((c) => !ids.has(c)), [], "a page cites a work absent from the bibliography");
  assert.deepEqual(results.filter((r) => !resultIds.has(r)), [], "a page quotes a result absent from the bibliography");
  const quoteIds = new Set(refs.quotes.map((q) => q.id));
  assert.ok(quoted.length >= 1, "the verbatim quotes a page prints are collected (false-green guard)");
  assert.deepEqual(quoted.filter((q) => !quoteIds.has(q)), [], "a page prints a quote absent from the bibliography");
  // Fail-closed in a temporary root.
  const tmp = mkdtempSync(join(tmpdir(), "docs-refs-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const good = read(DOCS_REFERENCES_REL);
    const sha = (s: string): string => createHash("sha256").update(s.replace(/\r\n/g, "\n"), "utf8").digest("hex");
    const put = (body: string, listed: boolean): void => {
      writeFileSync(join(tmp, ...DOCS_REFERENCES_REL.split("/")), body);
      const files: Record<string, string> = listed ? { [DOCS_REFERENCES_REL]: sha(body) } : {};
      writeFileSync(join(tmp, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files }));
    };
    put(good, true);
    assert.equal(loadDocsReferences(tmp).references.length, refs.references.length, "control: an intact copy loads");
    writeFileSync(join(tmp, ...DOCS_REFERENCES_REL.split("/")), good.replace("read in full", "read in fuller"));
    assert.throws(() => loadDocsReferences(tmp), /sha256 mismatch/, "a tampered file throws");
    put(good, false);
    assert.throws(() => loadDocsReferences(tmp), /not listed/, "an unlisted file throws");
    const d = JSON.parse(good) as { references: Record<string, unknown>[]; results: Record<string, unknown>[] };
    const first = d.references[0] ?? {};
    put(JSON.stringify({ ...d, references: [{ ...first, price: 1 }, ...d.references.slice(1)] }), true);
    assert.throws(() => loadDocsReferences(tmp), /exactly/, "an extra key throws");
    put(JSON.stringify({ ...d, references: [{ ...first, level: "skimmed" }, ...d.references.slice(1)] }), true);
    assert.throws(() => loadDocsReferences(tmp), /level/, "a level outside the closed list throws");
    put(JSON.stringify({ ...d, references: [{ ...first, title: "A — title" }, ...d.references.slice(1)] }), true);
    assert.throws(() => loadDocsReferences(tmp), /title/, "a non-ASCII title throws");
    const r0 = d.results[0] ?? {};
    put(JSON.stringify({ ...d, results: [{ ...r0, ref: "nobody" }, ...d.results.slice(1)] }), true);
    assert.throws(() => loadDocsReferences(tmp), /names no listed work/, "a result pointing at no work throws");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ── (7) the reason glosses track the frozen enum ────────────────────────────────────────────────────────────────────
test("docs_reason_glosses_track_the_frozen_enum — both ways, with a valid answer and stage for each", () => {
  const { actions, reasons } = loadGateEnums(ROOT);
  assert.deepEqual(Object.keys(REASON_DOCS).sort(), [...reasons].sort(), "one gloss per frozen reason code, and no other");
  const stages = new Set(CHAMBERS.map((c) => c.key));
  for (const [code, d] of Object.entries(REASON_DOCS)) {
    assert.ok(Number.isInteger(d.tone) && d.tone >= 0 && d.tone < actions.length, `${code}: its answer indexes the frozen action enum`);
    assert.ok(stages.has(d.chamber), `${code}: its stage is one of the drawn stages`);
  }
  assert.equal(ACTION_GLOSSES.length, actions.length, "one gloss per frozen answer");
  for (const st of POLICY_STEPS) for (const c of st.onNo) assert.ok(reasons.includes(c), `the policy names the unknown code ${c}`);
});

// ── (8) the language gate scans the docs route ───────────────────────────────────────────────────────────────────────
test("lang_gate_scans_the_docs_route — a docs directory under apps/site is walked; the governance docs directories are not", () => {
  assert.equal(skipDir("docs", ""), true, "the repo-root docs/ stays skipped");
  assert.equal(skipDir("docs", "packages/hikae"), true, "a package's docs/ stays skipped");
  assert.equal(skipDir("docs", "apps/site/app"), false, "the /docs route is walked");
  assert.equal(skipDir("node_modules", "apps/site/app/docs"), true, "node_modules stays skipped everywhere");
  const tmp = mkdtempSync(join(tmpdir(), "lang-docs-"));
  try {
    for (const d of ["docs", join("packages", "p", "docs"), join("apps", "site", "app", "docs")]) mkdirSync(join(tmp, d), { recursive: true });
    writeFileSync(join(tmp, "docs", "a.md"), "note\n");
    writeFileSync(join(tmp, "packages", "p", "docs", "b.md"), "note\n");
    writeFileSync(join(tmp, "apps", "site", "app", "docs", "page.tsx"), "export const x = 1;\n");
    const rels = collectTextFiles(tmp).map((f) => f.rel).sort();
    assert.deepEqual(rels, ["apps/site/app/docs/page.tsx"], "only the storefront route is collected");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  // Non-vacuity on the real tree: the docs route files are in the walk.
  const real = collectTextFiles(ROOT).map((f) => f.rel);
  assert.ok(real.filter((r) => r.startsWith("apps/site/app/docs/")).length >= DOCS_PAGES.length, "the docs route files are walked by the language gate");
});

// ── (9) the honesty lint scans the docs files ────────────────────────────────────────────────────────────────────────
test("docs_pass_the_honesty_lint — the docs files are scanned and carry no rendered numeric literal", () => {
  const { violations, filesScanned } = scanAppsSite(ROOT, exemptValues(loadExemptFile(ROOT)));
  assert.ok(filesScanned >= DOCS_TSX.length, "the whole apps/site is scanned, the docs files with it");
  const docs = violations.filter((v) => v.file.includes("/docs/") || v.file.endsWith("/docs-pieces.ts") || v.file.endsWith("/docs-gate.ts") || v.file.endsWith("/docs-nav.ts"));
  assert.deepEqual(docs, [], `a rendered numeric literal in the docs: ${JSON.stringify(docs)}`);
  // The site's vocabulary predicate used at build (lib/docs-vocab.ts) agrees with the gate on its samples.
  const clean = siteVocabulary(ROOT);
  assert.equal(clean("We deliver high confidence signals."), false, "a banned word fails the build-time filter");
  assert.equal(clean("MONARK keeps no confidence field, anywhere."), true, "the exempt phrase passes it");
});

// ── (10) MONARK Building ────────────────────────────────────────────────────────────────────────────────────────────
test("building_page_derives_now_and_keeps_its_alias — /roadmap is MONARK Building; now is read from data; next is dated; /building redirects", () => {
  const src = read(ROADMAP);
  assert.match(src, /title: "MONARK Building"/, "the page title");
  const texts = renderedOf(ROADMAP);
  for (const h of ["What is being built, now and next.", "Now", "Next", "Longer term"]) {
    assert.ok(texts.some((t) => t.trim() === h || t.includes(h)), `the page renders "${h}"`);
  }
  assert.match(src, /<TrajectorySchema\b/, "the trajectory schema is rendered");
  // The now items are derived from the served data (their numbers are interpolated, never typed).
  for (const load of ["loadBellServed(", "loadUkemiServed(", "loadNarabiCapture("]) assert.ok(src.includes(load), `the now column reads ${load}`);
  assert.match(src, /const INTENTIONS_STATED = "\d{4}-\d{2}-\d{2}";/, "the intentions carry the date they were stated");
  assert.ok(!/\b(?:will ship|by (?:Q\d|January|February|March|April|May|June|July|August|September|October|November|December))\b/i.test(src), "no promised date");
  assert.ok(!texts.some((t) => DASH_ANY.test(t)), "no long dash in the page's rendered literals");
  const cfg = read("apps/site/next.config.mjs");
  assert.match(cfg, /\{ source: "\/building", destination: "\/roadmap", permanent: false \}/, "the /building alias redirects to /roadmap");
});


// ── (11) G2 SITE-DOCS-1 additions: statuses in flags, conditionals and the colon form; the policy order; the components walk ──
// C-G2-7 (a): a flow step whose source is a register name takes its "today" from that entry's status, never a typed boolean.
test("docs_today_flags_of_register_steps_are_derived — a flow step named after a register entry is solid only if that entry is built", () => {
  const bad: string[] = [];
  for (const rel of DOCS_TSX) {
    const sf = sourceFile(rel);
    const visit = (n: ts.Node): void => {
      if (ts.isObjectLiteralExpression(n)) {
        const prop = (k: string): ts.PropertyAssignment | undefined =>
          n.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText(sf) === k);
        const today = prop("today");
        const source = prop("source");
        if (today !== undefined && source !== undefined && ts.isPropertyAccessExpression(source.initializer) && source.initializer.name.text === "name") {
          const owner = source.initializer.expression.getText(sf);
          const want = `${owner}.status === "built"`;
          if (today.initializer.getText(sf).replace(/\s+/g, " ") !== want) bad.push(`${rel}: today of ${owner} is ${today.initializer.getText(sf)}`);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  assert.deepEqual(bad, [], "a register step whose today flag is typed");
});

// C-G2-7 (b): no status literal anywhere inside a status prop (a conditional or a template evades literalStatusProps).
test("docs_status_props_carry_no_status_literal — a status prop is the register value, never an expression holding a status word", () => {
  const bad: string[] = [];
  for (const rel of [...DOCS_TSX, ROADMAP]) {
    const sf = sourceFile(rel);
    const visit = (n: ts.Node): void => {
      if (ts.isJsxAttribute(n) && n.name.getText(sf) === "status" && n.initializer !== undefined) {
        const scan = (m: ts.Node): void => {
          if ((ts.isStringLiteral(m) || ts.isNoSubstitutionTemplateLiteral(m)) && /^(?:built|upcoming)$/.test(m.text)) bad.push(`${rel}: ${n.getText(sf)}`);
          ts.forEachChild(m, scan);
        };
        scan(n.initializer);
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  assert.deepEqual(bad, [], "a status word inside a status prop");
});

// C-G2-7 (c): the colon form of the Today lists ("Koyomi: built") typed in rendered text reds like the verb form.
const TYPED_STATUS_COLON = new RegExp(`(?:${NAMES.map(escapeRe).join("|")})\\s*:\\s*(?:built|upcoming)\\b`, "i");
test("docs_no_colon_form_status_typed — 'Name: built' is never typed next to a register name", () => {
  const bad: string[] = [];
  for (const rel of [...DOCS_TSX, ROADMAP]) for (const t of renderedOf(rel)) if (TYPED_STATUS_COLON.test(t.replace(/\s+/g, " "))) bad.push(`${rel}: ${t.slice(0, 80)}`);
  assert.deepEqual(bad, [], "a status typed in the colon form");
  assert.ok(TYPED_STATUS_COLON.test("Koyomi: built"), "control: the colon form reds");
});

// C-G2-1 pin: the drawn order is the order the code declares for a set region, and the page says the interval order apart.
test("docs_policy_steps_follow_the_set_path_of_the_code — the schema's order is decide()'s set path; the page names the interval order", () => {
  const src = read("packages/hikae/src/l3-gate.ts");
  const body = src.slice(src.indexOf("function decide("), src.indexOf("function decideInterval("));
  const setPath = body.slice(body.indexOf("`set` path"));
  assert.ok(setPath.length > 0, "the set path of decide() is found (false-green guard)");
  const order = [...setPath.matchAll(/reason: "([a-z_]+)"/g)].map((m) => m[1] ?? "");
  const drawn = POLICY_STEPS.flatMap((p) => p.onNo).filter((c) => order.includes(c));
  const codeOrder = order.filter((c, i) => order.indexOf(c) === i && drawn.includes(c));
  assert.deepEqual(drawn.filter((c, i) => drawn.indexOf(c) === i), codeOrder, "the schema's order equals the code's set-path order");
  assert.match(read("apps/site/app/docs/gate/page.tsx"), /for an interval the code declares another order/, "the page says the interval order apart");
});

// C-G2-8: the language gate walks the docs components too.
test("lang_gate_walks_the_docs_components — apps/site/components/docs is walked, every component in it", () => {
  assert.equal(skipDir("docs", "apps/site/components"), false, "the /docs components are walked");
  const real = collectTextFiles(ROOT).map((f) => f.rel);
  const comps = filesUnder("apps/site/components/docs", [".tsx"]);
  assert.ok(comps.length > 0 && comps.every((c) => real.includes(c)), "every docs component is in the language gate's walk");
});

// ── (12) Pli of the review: the investor's visual validation of 2026-09-24, the D8 forms, the cited platform names ────────
// V-1: what of Shōgen is served, one sentence, byte for byte, on its three surfaces.
const SHOGEN_SCOPE_TEXT =
  "What is built and served is the attest tool: one committed witness, its bytes, its hash and its named residual hypotheses. The full Shōgen sensor, which produces continuous testimonies across sources, is under test and is not served yet.";
const honestLimitsParagraphs = (panelSource: string): string[] => {
  const block = /<PanelBlock title="Honest limits" status="built">([\s\S]*?)<\/PanelBlock>/.exec(panelSource)?.[1] ?? "";
  return [...block.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => (m[1] ?? "").trim());
};
// killer: apps/site/lib/fleet.ts:137 CONST "its join is dormant" -> "its join is served"
test("shogen_served_scope_is_said_on_three_surfaces — one sentence, byte for byte, on MONARK Building, the Shōgen docs page and the Shōgen panel", () => {
  assert.equal(SHOGEN_SERVED_SCOPE, SHOGEN_SCOPE_TEXT, "the sentence is the investor's, byte for byte");
  // C-2 (checkpoint-2): the sentence's state words are not read from the register, so the test couples them to it:
  // Shōgen must be "built" and served by the attest tool; if the register entry changes, this test reds and the
  // sentence is revisited (item SHOGEN-SCOPE-SENTENCE-1, closed by this coupling).
  const shogen = FLEET_AGENTS.find((a) => a.name === "Shōgen");
  assert.ok(shogen !== undefined && shogen.status === "built", "the register says Shōgen is built, as the sentence does");
  assert.match(shogen.wiring.served_by, /^MCP attest/, "the register says the served piece is the attest tool, as the sentence does");
  // Revisited at CM-2b surfaces: the attest tool is still the served piece (the sentence holds); its join into the gate is
  // dormant since the attested class was retired, and the register says so.
  assert.equal(shogen.wiring.served_by, "MCP attest (the attested envelope key of the gate stays declared; its join is dormant since the subject class was retired)", "any change to the served wiring revisits the sentence (its second half says the full sensor is not served)");
  const importsScope = (rel: string): boolean => importsFrom(sourceFile(rel), "@/lib/shogen-copy").includes("SHOGEN_SERVED_SCOPE");
  // (a) MONARK Building: the fleet layer carries it as its note, rendered right after the list of built pieces.
  const roadmap = read(ROADMAP);
  assert.ok(importsScope(ROADMAP), "/roadmap imports the sentence");
  assert.match(roadmap, /id: "fleet",[\s\S]*?note: <>\{SHOGEN_SERVED_SCOPE\}<\/>,[\s\S]*?id: "harness"/, "the fleet layer carries the sentence as its note");
  assert.match(roadmap, /\{l\.detail\}<\/div>\s*\{l\.note !== undefined \? <p[^>]*>\{l\.note\}<\/p> : null\}/, "the layer rows render the note right after the list of built pieces");
  // (b) The Shōgen docs page: at the head of what is served today, on that page only.
  const piece = "apps/site/components/docs/piece-doc-page.tsx";
  assert.ok(importsScope(piece), "the piece page imports the sentence");
  assert.match(read(piece), /\{a\.status === "built" \? \(\s*<>\s*\{slug === "shogen" \? <p>\{SHOGEN_SERVED_SCOPE\}<\/p> : null\}/, "the sentence heads what is served today, on the Shōgen page");
  // (c) The Shōgen panel on the fleet page: the second paragraph of "Honest limits".
  const panel = "apps/site/components/shogen-panel.tsx";
  assert.ok(importsScope(panel), "the Shōgen panel imports the sentence");
  assert.equal(honestLimitsParagraphs(read(panel))[1], "{SHOGEN_SERVED_SCOPE}", "the sentence is the second paragraph of Honest limits");
  // Mutant in memory: the sentence dropped from the panel reds.
  const mutant = read(panel).replace("<p className=\"mt-2\">{SHOGEN_SERVED_SCOPE}</p>", "");
  assert.notEqual(mutant, read(panel), "premise: the mutant applies");
  assert.notEqual(honestLimitsParagraphs(mutant)[1], "{SHOGEN_SERVED_SCOPE}", "mutant: the panel without the sentence must red");
});

// V-3: the eleven pieces are "smart pieces" in the three sentences the investor named; "company" is said nowhere on the fleet
// page or on MONARK Building (the wider rename of "agent" is a separate change).
test("fleet_and_building_say_smart_pieces_not_company — the three renamed sentences, with derived counts", () => {
  const FLEET = "apps/site/app/fleet/page.tsx";
  const fleet = read(FLEET);
  assert.match(
    fleet,
    /\{capitalized\(countWord\(built\.length \+ upcoming\.length\)\)\} smart pieces\. \{capitalized\(countWord\(built\.length\)\)\} built,\{" "\}\s*\{countWord\(upcoming\.length\)\} on the roadmap\./,
    "the fleet page title says the smart pieces, every count derived",
  );
  const roadmapTexts = renderedOf(ROADMAP).map((t) => t.trim());
  for (const name of ["The smart pieces", "An engine that improves itself"]) assert.ok(roadmapTexts.includes(name), `MONARK Building names the layer "${name}"`);
  for (const rel of [FLEET, ROADMAP]) {
    assert.deepEqual(renderedOf(rel).filter((t) => /\bcompany\b/i.test(t)), [], `${rel}: "company" is not said`);
  }
});

// The trajectory of MONARK Building is fluid: no minimum width, no horizontal scroll bar around it (investor, 2026-09-24).
test("building_trajectory_is_fluid — the schema scales to its container and its section has no horizontal scroll", () => {
  assert.match(read("apps/site/components/docs/schemas/building.tsx"), /<Diagram w=\{980\} h=\{h\} min=\{0\} /, "the trajectory draws with no minimum width");
  assert.match(read("apps/site/components/docs/svg-kit.tsx"), /style=\{\{ minWidth: min, maxWidth: "100%", width: "100%"/, "a drawing never exceeds its container");
  const section = /<section className="([^"]*)">\s*<TrajectorySchema/.exec(read(ROADMAP));
  assert.ok(section !== null, "the trajectory section is found (false-green guard)");
  assert.doesNotMatch(section[1] ?? "", /overflow-x/, "no horizontal scroll bar around the trajectory");
});

// V-4: the gap the full Shōgen fills, with the passage of the first Chainlink whitepaper, verbatim, short and cited.
test("shogen_gap_quotes_and_cites_the_chainlink_whitepaper — the passage, verbatim and short, from the listed work, on the Shōgen page", () => {
  const refs = loadDocsReferences(ROOT);
  const work = refs.references.find((r) => r.id === "chainlink-2017");
  assert.ok(work !== undefined, "the bibliography lists the whitepaper");
  assert.equal(work.authors, "Steve Ellis, Ari Juels and Sergey Nazarov");
  assert.equal(work.year, 2017);
  assert.equal(work.title, "ChainLink: A Decentralized Oracle Network");
  assert.equal(work.identifier, "https://research.chain.link/whitepaper-v1.pdf");
  const quote = refs.quotes.find((q) => q.id === "source-independence");
  assert.ok(quote !== undefined && quote.ref === "chainlink-2017", "the quoted passage is the whitepaper's");
  assert.equal(quote.text, "mapping and reporting the independence of data sources in an easily digestible way", "the passage, verbatim");
  assert.equal(quote.locator, "Section 4.1, page 11");
  assert.ok(quote.text.split(/\s+/).length <= DOCS_QUOTE_MAX_WORDS, "at most twenty-five words");
  const piece = read("apps/site/components/docs/piece-doc-page.tsx");
  assert.match(piece, /quoteById\(refs, "source-independence"\)/, "the page reads the passage from the bibliography");
  assert.match(piece, /&ldquo;\{quote\.text\}\s*&rdquo;/, "the passage is printed between quotation marks");
  assert.match(piece, /<Cite refId="chainlink-2017" \/>/, "the page cites the whitepaper where it quotes it");
  assert.match(piece, /\{slug === "shogen" \? <ShogenGap name=\{a\.name\} \/> : null\}/, "the gap section is on the Shōgen page");
  assert.match(piece, /years later, we know of no such map being published:/, "decision 208: the absence is stated as what we know");
  assert.doesNotMatch(piece, /no such map is published/, "decision 208: never the universal form");
  assert.match(piece, /and we know of none that reports the overlap next to its answer\./, "decision 211 (option A): the second half is also stated as what we know");
  assert.doesNotMatch(piece, /the overlap is not reported/, "decision 211: never the unsourced universal on the overlap");
  assert.ok(PIECE_DOCS.shogen?.refs.includes("chainlink-2017"), "the Shōgen page lists the whitepaper in its sources");
  // Fail-closed: a passage longer than the bound throws at load (temporary root).
  const tmp = mkdtempSync(join(tmpdir(), "docs-quote-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const d = JSON.parse(read(DOCS_REFERENCES_REL)) as { quotes: { id: string; ref: string; locator: string; text: string }[] };
    const first = d.quotes[0];
    assert.ok(first !== undefined, "premise: a quote to lengthen");
    const long = JSON.stringify({ ...d, quotes: [{ ...first, text: `${first.text} ${"and so on ".repeat(DOCS_QUOTE_MAX_WORDS)}`.trim() }] });
    writeFileSync(join(tmp, ...DOCS_REFERENCES_REL.split("/")), long);
    const sha = createHash("sha256").update(long.replace(/\r\n/g, "\n"), "utf8").digest("hex");
    writeFileSync(join(tmp, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files: { [DOCS_REFERENCES_REL]: sha } }));
    assert.throws(() => loadDocsReferences(tmp), /longer than/, "a passage over the bound throws");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// The OTS D8 forms (docs/adr/ADR-BELL-OTS-ANCHOR-1.md, "formes interdites"): "proves" or "proof that" about a fact, "at a
// point in time", "tamper-proof", "trustless", "anchored at publication", "verified by Bitcoin". Scanned over the rendered
// text of the docs and of MONARK Building, the docs data and the bibliography. Kills the review's mutant MX-09.
const D8 = /\bproves?\b|\bproof that\b|tamper-?proof|\btrustless\b|at a point in time|verified by bitcoin|anchored at publication/i;
// Decision 204 (investor, 2026-09-24, "on laisse proves"): the attestation-origin sentence keeps its verb. D8 is about
// anchoring claims (a timestamp "proves" a fact); an attestation proving WHAT WAS SAID, never that it is true, is the
// founding line of Shōgen (docs/02-vision.md of the Shōgen repository) and is allowed in exactly these two forms, pinned here.
const D8_ALLOWED = [/^An attestation proves what a source said, never that the source is right\.$/m, /^An attested testimony proves what was said, that its bytes hash as recorded, and that the attestor signed it\.$/m];
// C-1 (checkpoint-2): the panel that carries the second allowed form is scanned too, so the entry is not inert.
const SHOGEN_PANEL = "apps/site/components/shogen-panel.tsx";
const stripAllowed = (s: string) => D8_ALLOWED.reduce((acc, re) => acc.replace(re, ""), s);
/** The rendered text of one JSX paragraph, whitespace collapsed, one entry per sentence so the anchored forms match. */
// String-literal attributes that carry geometry or markup, never public text (shared by the vocabulary and D8 scans; G2B, R-3).
const MARKUP = new Set(["className", "d", "transform", "viewBox", "fill", "stroke", "fontFamily", "href", "key", "xmlns", "textAnchor", "fontStyle", "role", "strokeDasharray", "style", "id", "import", "refId", "slug", "aria-labelledby"]);
const sentencesOf = (s: string): string[] => s.replace(/\s+/g, " ").split(/(?<=\.)\s+/).map((x) => x.trim());
// Ruling 214 (ADR-BELL-OTS-PRB T-B10): the guard covers the three Bell pages, the two anchors tables and the sentences of lib/bell-anchors.ts.
const BELL_TSX = ["apps/site/app/bell/page.tsx", "apps/site/app/bell/method/page.tsx", "apps/site/app/bell/anchors/page.tsx", "apps/site/components/bell/anchors-table.tsx", "apps/site/components/bell/publication-anchors-table.tsx"];

// C-G2-1 (G2 PR-B): ONE scan, used by the assertion and by its controls; a control run outside the scan proves the regex, not the
// scope (a mutant that dropped BELL_TSX from the scanned lists survived it). `override` replaces one scanned file's text.
const D8_TSX = [...DOCS_TSX, ROADMAP, ...BELL_TSX], D8_LIBS = [...DOCS_LIBS, "apps/site/lib/bell-anchors.ts"];
function d8Hits(override: { rel: string; text: string } | null = null): string[] {
  const hits: string[] = [], text = (rel: string): string | undefined => (override?.rel === rel ? override.text : undefined);
  for (const rel of D8_TSX) for (const t of renderedOf(rel, text(rel))) for (const sent of sentencesOf(t)) if (D8.test(stripAllowed(sent))) hits.push(`${rel}: ${t.slice(0, 90)}`);
  // G2B: string literals rendered by property access (a TOC label, a constant) are public text too; markup is not.
  for (const rel of D8_TSX) for (const l of literalsOf(sourceFile(rel, text(rel)))) if (l.attr === null || !MARKUP.has(l.attr)) for (const sent of sentencesOf(l.text)) if (D8.test(stripAllowed(sent))) hits.push(`${rel}: literal: ${sent.slice(0, 90)}`);
  for (const rel of D8_LIBS) for (const l of literalsOf(sourceFile(rel, text(rel)))) if (D8.test(stripAllowed(l.text))) hits.push(`${rel}: ${l.text.slice(0, 90)}`);
  return hits;
}

test("docs_carry_no_ots_d8_forbidden_form — no 'proves', 'proof that', 'at a point in time' and the rest in the docs and MONARK Building", () => {
  const hits = d8Hits();
  const bellMutant = read("apps/site/app/bell/page.tsx").replace("The signature shows who published the record and that it is intact;", "The signature proves who published the record and when;");
  assert.ok(d8Hits({ rel: "apps/site/app/bell/page.tsx", text: bellMutant }).some((h) => h.startsWith("apps/site/app/bell/page.tsx: ")), "control: the retired /bell sentence reds through the same scan (the Bell pages are scanned)");
  const libMutant = read("apps/site/lib/bell-anchors.ts").replace("it is signed and chained, not timestamp-anchored", "the anchor proves it existed");
  assert.ok(d8Hits({ rel: "apps/site/lib/bell-anchors.ts", text: libMutant }).some((h) => h.startsWith("apps/site/lib/bell-anchors.ts: ")), "control: a 'proves' in the state sentences reds through the same scan (bell-anchors.ts is scanned)");
  let panelScanned = 0;
  for (const t of renderedOf(SHOGEN_PANEL)) for (const sent of sentencesOf(t)) { panelScanned += 1; if (D8.test(stripAllowed(sent))) hits.push(`${SHOGEN_PANEL}: ${sent.slice(0, 90)}`); }
  assert.ok(panelScanned >= 8, `control: the panel's rendered sentences are scanned (${String(panelScanned)})`);
  for (const s of [SHOGEN_SERVED_SCOPE, ...jsonStrings(JSON.parse(read(DOCS_REFERENCES_REL)) as unknown)]) if (D8.test(s)) hits.push(`data: ${s.slice(0, 90)}`);
  assert.deepEqual(hits, [], `an OTS D8 forbidden form:\n${hits.join("\n")}`);
  assert.ok(D8.test("The anchor proves the record existed at a point in time."), "control: the review's mutant reds");
  assert.ok(!D8.test("download the manifest and its proof from the anchors register"), "control: the noun proof, for the file, stays green");
  assert.ok(!D8.test(stripAllowed("An attestation proves what a source said, never that the source is right.")), "control: the allowed attestation-origin sentence stays green");
  assert.ok(D8.test(stripAllowed("An attestation proves what a source said, never that the source is wrong.")), "control: a variant of the allowed sentence reds (anchored)");
  assert.ok(D8.test(stripAllowed("Not so: An attestation proves what a source said, never that the source is right.")), "control: the allowed form inside a longer sentence reds (the anchors are load-bearing)");
  assert.ok(sentencesOf("An attestation proves what a source said, never that the source is right. The anchor proves the record existed.").some((x) => D8.test(stripAllowed(x))), "control: any other proves still reds");
  assert.ok(renderedOf(SHOGEN_PANEL).some((t) => /An attested testimony proves what was said/.test(t)), "control: the panel is scanned and carries the second allowed form");
});

// ADR-BELL-OTS-PRB option (a) (erratum D-B7): the three /docs pages that spoke of the latest record's anchoring derive its state as /bell
// does, from the bound publication rows, and /docs/bell and /docs/use-cases render /bell's own sentence (the built pages are asserted by
// scripts/assert-fleet-html.mjs, T-3b); /docs/verify describes the three states, word for word, and its last gesture is solid only when anchored.
test("docs_state_the_bell_timestamp_as_bell_does — /docs/bell and /docs/use-cases render /bell's sentence; /docs/verify is tri-state", () => {
  for (const rel of ["apps/site/app/docs/bell/page.tsx", "apps/site/app/docs/use-cases/page.tsx", "apps/site/app/docs/verify/page.tsx"]) {
    assert.match(read(rel), /publicationAnchorState\((\w+)\.head, \1\.lines, loadPublications\(\1\.lines\)\.bound\)/, `${rel}: the state from the bound publication rows`);
    assert.doesNotMatch(read(rel), /listedDigests|timestamp-anchored yet|in preparation/, `${rel}: no retired derivation or wording`);
  }
  assert.match(read("apps/site/app/docs/bell/page.tsx"), /<dt>the latest record&rsquo;s timestamp anchor<\/dt>\s*<dd>\{publicationAnchorSentence\(anchorState\)\}<\/dd>/, "/docs/bell: the record named, /bell's sentence");
  const uses = read("apps/site/app/docs/use-cases/page.tsx"), verify = read("apps/site/app/docs/verify/page.tsx").replace(/\s+/g, " ");
  assert.match(uses, /The latest record&rsquo;s timestamp status: \{publicationAnchorSentence\(anchorState\)\}\./, "/docs/use-cases: /bell's sentence");
  assert.ok(verify.includes("The published records are signed and chained. Their timestamp anchoring is read from the publication register: none, pending while the proof carries calendar attestations only, anchored once it carries a Bitcoin block; this gesture applies to an anchored line."), "/docs/verify: the tri-state text of the erratum");
  for (const [rel, text] of [["use-cases", uses], ["verify", verify]] as const) assert.match(text, /today: anchorState\.state === "anchored", source: "publication register"/, `/docs/${rel}: the timestamp step is solid only when anchored`);
});

// C-G2-11 decided: MakerDAO and Compound are banned on the storefront, with one exception, the verbatim cited figures of
// /docs/research; the build-time filter of that page alone passes the waiver the two rules carry.
test("docs_research_alone_waives_the_cited_platform_names — MakerDAO and Compound stay banned everywhere but the verbatim cited figures of /docs/research", () => {
  const cfg = JSON.parse(read("vocab-banned.json")) as { scan: { site: { banned: { re: string; why: string }[] } } };
  const TAG = "the verbatim Qin et al. figures of /docs/research";
  const tagged = cfg.scan.site.banned.filter((r) => r.why.includes(TAG)).map((r) => r.re).sort();
  assert.deepEqual(tagged, ["\\bCompound\\b", "\\bMakerDAO\\b"], "exactly the two platform rules carry the page's tag");
  const strict = siteVocabulary(ROOT);
  const research = siteVocabulary(ROOT, TAG);
  for (const name of ["MakerDAO", "Compound"]) {
    assert.equal(strict(`liquidatable on ${name}`), false, `${name} is banned without the waiver`);
    assert.equal(research(`liquidatable on ${name}`), true, `${name} passes under the page's waiver`);
  }
  assert.equal(research("liquidated on Aave"), false, "the waiver lifts no other rule");
  assert.throws(() => siteVocabulary(ROOT, "a tag no rule carries"), /no site rule carries the waiver/, "a stale waiver throws");
  const sources = [...new Set([...filesUnder("apps/site/app", [".ts", ".tsx"]), ...filesUnder("apps/site/components", [".ts", ".tsx"]), ...filesUnder("apps/site/lib", [".ts"])])];
  const passing = sources.filter((rel) => /siteVocabulary\(\s*[\w.()]+\s*,/.test(read(rel)));
  assert.deepEqual(passing, ["apps/site/app/docs/research/page.tsx"], "only /docs/research passes a waiver");
  assert.match(read("apps/site/app/docs/research/page.tsx"), new RegExp(`const CITED_FIGURES_WAIVER = "${escapeRe(TAG)}";`), "the page's tag is the rules' tag");
  const researchSrc = read("apps/site/app/docs/research/page.tsx");
  assert.equal((researchSrc.match(/siteVocabulary\(/g) ?? []).length, 1, "one vocabulary filter on the page");
  assert.match(researchSrc, /siteVocabulary\(root, CITED_FIGURES_WAIVER\);/, "the page passes its constant, unchanged: a wider argument would widen the exception without an ADR line");
  const figureReaders = sources.filter((rel) => /\bloadCommitted\(\s*[\w.()]+\s*\)/.test(read(rel)));
  assert.deepEqual(figureReaders, ["apps/site/app/docs/research/page.tsx"], "only /docs/research reads the committed figures, the one page the waiver covers");
});

// CM-2b surfaces (G2 of the lot, M5): Shōgen stays built; its integration tests are the served attest integration test
// (probe_harness_records_real_decision, provisional until MONARK names its choice) and the two unit tests of the dormant
// join into the gate.
// killer: apps/site/lib/fleet.ts:142 CONST "\"gate_attested_discordant_is_tool_error\"" -> "\"gate_attested_discordant\""
test("shogen_integration_tests_are_the_served_attest_and_the_join_units", () => {
  const shogen = FLEET_AGENTS.find((a) => a.name === "Shōgen");
  assert.ok(shogen !== undefined && shogen.status === "built", "Shōgen stays built");
  assert.deepEqual(
    [...shogen.wiring.integration_test].sort(),
    ["gate_attested_discordant_is_tool_error", "gate_attested_is_frozen_attested_price", "probe_harness_records_real_decision"],
    "the served attest integration test and the two join unit tests",
  );
});
