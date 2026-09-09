// apps/site/test/honesty-lint.ts — detector behind root test 44 (test/site-honesty.test.ts;
// ADR-M004 D11: a hard-coded 1.07 in a page must red).
//
// SCOPE (stated so the exclusion list means something). A numeric literal is a VIOLATION only in a
// RENDERED-TEXT position:
//   (1) a JSX text node ................................... <p>1.07</p>
//   (2) a string/number/template literal that is a JSX CHILD expression ... <p>{1.07}</p> / <p>{"1.07"}</p>
//   (3) a string/number/template literal that is the value of a VISIBLE attribute
//       (alt, title, aria-label, placeholder, label, value, content) ....... <img alt="1.07 B" />
//   (4) MDX prose (outside code fences/spans). A {...} expression is scanned when it renders a literal
//       (string/number/template/nested-JSX) — parity with a TSX {...} child (PLAN F-2 §6c).
//   (5) an exported Next `metadata` object's title/description (rendered into <title>/<meta>) (§6b).
// EVERYTHING ELSE is ignored: className, style, key, SVG attrs (viewBox, grid-cols-*, gap-*, w-*),
// import/require specifiers, cn()/other call arguments, object-literal properties, variable initialisers.
// So a figure rendered dynamically ({figure.value}) is a property access, NOT a literal, and is never
// flagged — that is exactly how "hors figures-sourced.json" is honoured (ADR-M004 D11). A literal IS
// flagged even when its value coincides with a figure value (the 1.07 mutant); the ONLY escape is the
// committed closed list apps/site/test/honesty-lint.exempt.json, which the test forbids from carrying a
// figure value.
//
// WITHIN a rendered text, digits are allowed only when they belong to an identifier (ADR-M\d+, R-\d+,
// CA-\d+, D\d+, HIP-\d+) or an ISO date (\d{4}-\d{2}-\d{2}), or when the exact token is in the exempt list.
//
// apps/** are linted with type-checked rules OFF (eslint.config.mjs), so `as` casts are used here; the
// file carries NO `any` (no-explicit-any stays on) and is type-checked by the root program (imported by
// the root test). Zero dependency beyond the already-pinned `typescript`.
import ts from "typescript";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

export interface Violation {
  file: string;
  line: number;
  token: string;
  text: string;
}
export interface ExemptEntry {
  value: string;
  reason: string;
  context?: string;
}
export interface ExemptFile {
  entries: ExemptEntry[];
}

export type SourceKind = "tsx" | "ts" | "mdx";

const VISIBLE_ATTRS = new Set(["alt", "title", "aria-label", "placeholder", "label", "value", "content"]);
const VISIBLE_META_KEYS = new Set(["title", "description"]);
const ALLOWED_ID = /\b(?:ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+)\b/g;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/g;
const NUMERIC_TOKEN = /\d+(?:[.,]\d+)*/g;
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo"]); // skipped at ANY depth
// C4 (PLAN F-2 §6a): scan ALL of apps/site. `test/` + `data/` are excluded at the apps/site TOP LEVEL
// only (test/ hosts this detector + fixtures; data/ is committed hashed data — neither renders). A
// nested dir named test/ or data/ (e.g. components/data/) IS still scanned.
const SKIP_TOP = new Set(["test", "data"]);

/** Char ranges [start,end) covered by an allowed identifier or an ISO date in `text`. */
function coveredRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const re of [ALLOWED_ID, ISO_DATE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const g = m[0]; // string | undefined under noUncheckedIndexedAccess
      if (g !== undefined) ranges.push([m.index, m.index + g.length]);
    }
  }
  return ranges;
}

/** Offending numeric tokens in a plain rendered-text string (identifier/ISO/exempt-aware). */
export function scanText(text: string, exemptValues: Set<string>): string[] {
  const ranges = coveredRanges(text);
  const out: string[] = [];
  NUMERIC_TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUMERIC_TOKEN.exec(text)) !== null) {
    const tok = m[0]; // string | undefined under noUncheckedIndexedAccess
    if (tok === undefined) continue;
    const start = m.index;
    const end = start + tok.length;
    if (ranges.some(([a, b]) => start >= a && end <= b)) continue;
    if (exemptValues.has(tok)) continue;
    out.push(tok);
  }
  return out;
}

// Binary operators whose RESULT is composed of (arithmetic / string concat) or selected from
// (short-circuit) their operands' rendered value. Comparison / equality / bitwise are ABSENT on purpose:
// they render a boolean or a non-operand number, so the common idiom {items.length > 0 && <X/>} must not
// flag the 0. (TypeScript has no LogicalExpression node — &&/||/?? are BinaryExpression here.)
const RENDER_BINARY_OPS = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.PlusToken,
  ts.SyntaxKind.MinusToken,
  ts.SyntaxKind.AsteriskToken,
  ts.SyntaxKind.SlashToken,
  ts.SyntaxKind.PercentToken,
  ts.SyntaxKind.AsteriskAsteriskToken,
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.QuestionQuestionToken,
]);

/**
 * Literal text fragment(s) an expression contributes to a RENDERED position (a JSX child, or a visible
 * whitelisted attribute). Spec = PLAN F-1 item 6: a string passed as visible content (broader than a
 * direct literal). A value passed through ?:, &&/||/??, string concat / arithmetic, or a template is
 * still rendered text. So we descend into
 *   - ConditionalExpression: whenTrue + whenFalse (the condition itself is never rendered);
 *   - BinaryExpression: left + right, but ONLY for RENDER_BINARY_OPS (see above);
 *   - TemplateExpression: the static quasis AND each ${...} expression;
 *   - ParenthesizedExpression: the inner expression.
 * A leaf string / number / no-substitution template contributes its text. Everything dynamic --
 * identifiers, property/element access (figures.X.value, items.length), calls, JSX elements -- contributes
 * NOTHING: that is the intended injection path for honestly-loaded figures. Nested JSX is left to the main
 * walker (it visits JSX children itself), so a literal is counted exactly once.
 */
function renderedLiterals(node: ts.Node): string[] {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isNumericLiteral(node)) {
    return [node.text];
  }
  if (ts.isParenthesizedExpression(node)) return renderedLiterals(node.expression);
  if (ts.isConditionalExpression(node)) {
    return [...renderedLiterals(node.whenTrue), ...renderedLiterals(node.whenFalse)];
  }
  if (ts.isBinaryExpression(node)) {
    if (!RENDER_BINARY_OPS.has(node.operatorToken.kind)) return [];
    return [...renderedLiterals(node.left), ...renderedLiterals(node.right)];
  }
  if (ts.isTemplateExpression(node)) {
    const out: string[] = [node.head.text];
    for (const span of node.templateSpans) {
      out.push(...renderedLiterals(span.expression)); // ${...} may itself carry a literal
      out.push(span.literal.text); // the static tail after it
    }
    return out;
  }
  return []; // dynamic reads / JSX elements / anything else: not a rendered literal
}

function isJsxChild(node: ts.JsxExpression): boolean {
  const p = node.parent;
  return p !== undefined && (ts.isJsxElement(p) || ts.isJsxFragment(p));
}

interface RenderedText {
  text: string;
  line: number;
}

/** Every rendered-text string (with 1-based line) in a tsx/ts source. Exported so a root test can
 *  prove a copy string sits in a genuinely RENDERED position (JSX text / child expr / visible attr),
 *  not merely on a non-comment line (F-2b R-E: the vocab-exemption carrier check). */
export function renderedTexts(sf: ts.SourceFile): RenderedText[] {
  const texts: RenderedText[] = [];
  const lineOf = (node: ts.Node): number => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      texts.push({ text: node.text, line: lineOf(node) });
    } else if (ts.isJsxExpression(node) && isJsxChild(node) && node.expression) {
      const line = lineOf(node);
      for (const t of renderedLiterals(node.expression)) texts.push({ text: t, line });
    } else if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(sf);
      if (VISIBLE_ATTRS.has(name)) {
        if (ts.isStringLiteral(node.initializer)) {
          texts.push({ text: node.initializer.text, line: lineOf(node) });
        } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const line = lineOf(node);
          for (const t of renderedLiterals(node.initializer.expression)) texts.push({ text: t, line });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return texts;
}

/** Rendered literals from string-valued title/description keys inside a metadata object (recursive). */
function collectMetaLiterals(node: ts.Node, keys: Set<string>): string[] {
  const out: string[] = [];
  if (!ts.isObjectLiteralExpression(node)) return out;
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name =
      ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : undefined;
    if (name !== undefined && keys.has(name)) out.push(...renderedLiterals(prop.initializer));
    if (ts.isObjectLiteralExpression(prop.initializer)) out.push(...collectMetaLiterals(prop.initializer, keys));
  }
  return out;
}

/**
 * Rendered-text strings from an exported Next `metadata` object (PLAN F-2 §6b): `title`/`description`
 * are rendered into <title>/<meta name="description">, so a hard-coded number there is as visible as
 * JSX text. Only `export const metadata = {...}` is scanned; nested objects (openGraph/twitter) are
 * descended for their title/description.
 */
function metadataTexts(sf: ts.SourceFile): RenderedText[] {
  const texts: RenderedText[] = [];
  const lineOf = (node: ts.Node): number => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const visit = (node: ts.Node): void => {
    if (ts.isVariableStatement(node)) {
      const isExport = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      if (isExport) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name) && decl.name.text === "metadata" && decl.initializer !== undefined) {
            const line = lineOf(decl.initializer);
            for (const t of collectMetaLiterals(decl.initializer, VISIBLE_META_KEYS)) texts.push({ text: t, line });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return texts;
}

/** Every rendered-text string in a tsx/ts source: JSX rendered positions + the metadata export. */
function allRenderedTexts(sf: ts.SourceFile): RenderedText[] {
  return [...renderedTexts(sf), ...metadataTexts(sf)];
}

/**
 * Rendered literals an MDX `{...}` expression contributes, for PARITY with a TSX `{...}` JSX child
 * (PLAN F-2 §6c): parse the inner text as a TSX expression, keep string/number/template/conditional/
 * concat literals AND a nested JSX element's own text; a dynamic read ({figures.x.value}, {count})
 * contributes nothing. A `{...}` that fails to parse contributes nothing (fail-open to green, never a
 * false red). Only flat (non-nested) braces are matched by the caller's regex. A backtick template
 * literal INSIDE braces ({`x ${n}`}) is consumed by the inline-code strip that runs first (accepted
 * limit; the string / number / nested-JSX mutant target is unaffected).
 */
function mdxExprLiterals(inner: string): string[] {
  const sf = ts.createSourceFile("expr.tsx", "(" + inner + "\n)", ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const stmt = sf.statements[0];
  if (stmt === undefined || !ts.isExpressionStatement(stmt)) return [];
  const expr = ts.isParenthesizedExpression(stmt.expression) ? stmt.expression.expression : stmt.expression;
  const out = [...renderedLiterals(expr)];
  for (const rt of renderedTexts(sf)) out.push(rt.text);
  return out;
}

/** Strip code fences/spans; keep a {...} expression only when it renders a literal (TSX parity, §6c). */
function mdxProse(source: string): string {
  let s = source.replace(/```[\s\S]*?```/g, " "); // fenced code
  s = s.replace(/`[^`]*`/g, " "); // inline code
  s = s.replace(/\{([^{}]*)\}/g, (_m: string, inner: string) => {
    const lits = mdxExprLiterals(inner);
    return lits.length > 0 ? " " + lits.join(" ") + " " : " ";
  });
  return s;
}

function scriptKindFor(kind: "tsx" | "ts"): ts.ScriptKind {
  return kind === "tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

/** Offending numeric tokens in a source string. For unit tests and per-file scanning. */
export function scanSource(source: string, kind: SourceKind, exemptValues: Set<string>): string[] {
  if (kind === "mdx") return scanText(mdxProse(source), exemptValues);
  const sf = ts.createSourceFile("in." + kind, source, ts.ScriptTarget.Latest, true, scriptKindFor(kind));
  const out: string[] = [];
  for (const rt of allRenderedTexts(sf)) out.push(...scanText(rt.text, exemptValues));
  return out;
}

function scanFileText(rel: string, source: string, kind: SourceKind, exemptValues: Set<string>): Violation[] {
  const out: Violation[] = [];
  if (kind === "mdx") {
    for (const token of scanText(mdxProse(source), exemptValues)) {
      out.push({ file: rel, line: 0, token, text: "(mdx prose)" });
    }
    return out;
  }
  const sf = ts.createSourceFile(rel, source, ts.ScriptTarget.Latest, true, scriptKindFor(kind));
  for (const rt of allRenderedTexts(sf)) {
    for (const token of scanText(rt.text, exemptValues)) {
      out.push({ file: rel, line: rt.line, token, text: rt.text.trim().slice(0, 60) });
    }
  }
  return out;
}

function kindForExt(ext: string): SourceKind | null {
  if (ext === ".tsx") return "tsx";
  if (ext === ".ts") return "ts";
  if (ext === ".mdx") return "mdx";
  // .md is NOT a honesty surface. next.config.mjs `pageExtensions` = ts/tsx/mdx, so a .md is NEVER a
  // route (never rendered). Under the C4 whole-apps/site walk, .md files are provenance/docs
  // (COMPONENTS-PROVENANCE.md) that legitimately carry version numbers (4.21.0, 1.8.0, …); flagging
  // those as "rendered" literals is a false positive. Rendered content is .mdx (F-2b/c). The .md files
  // are still English-gated by scripts/lang-gate.mjs (--scope site).
  return null;
}

/**
 * Walk ALL of apps/site and scan every .tsx/.ts/.mdx file (C4, PLAN F-2 §6a). `.md` is NOT scanned:
 * it is absent from next.config.mjs pageExtensions and matched by no MDX loader, so it is never a
 * route or a rendered surface (F-2a D1 — a conscious reversal of F-1 G2 R1, whose routable-but-
 * unscanned hole is now closed structurally by pageExtensions, not by scanning .md). SKIP_DIRS
 * (node_modules/.next/.turbo) are skipped at any depth; `test/` and `data/` only at the top level
 * (SKIP_TOP); `*.d.ts` (generated, e.g. next-env.d.ts) is skipped. This closes the class the old
 * {app,content} whitelist left open — a rendered numeric literal in components/ or hooks/ now reds.
 */
export function scanAppsSite(
  rootDir: string,
  exemptValues: Set<string>,
): { violations: Violation[]; filesScanned: number } {
  const base = join(rootDir, "apps", "site");
  const violations: Violation[] = [];
  let filesScanned = 0;
  const walk = (absDir: string, relDir: string, atTop: boolean): void => {
    if (!existsSync(absDir)) return;
    for (const name of readdirSync(absDir)) {
      if (SKIP_DIRS.has(name)) continue;
      if (atTop && SKIP_TOP.has(name)) continue;
      const abs = join(absDir, name);
      const rel = relDir + "/" + name;
      if (statSync(abs).isDirectory()) {
        walk(abs, rel, false);
        continue;
      }
      if (name.endsWith(".d.ts")) continue;
      const kind = kindForExt(extname(name).toLowerCase());
      if (kind === null) continue;
      filesScanned += 1;
      violations.push(...scanFileText(rel, readFileSync(abs, "utf8"), kind, exemptValues));
    }
  };
  walk(base, "apps/site", true);
  return { violations, filesScanned };
}

/** Read + fail-closed-validate the closed exemption list. */
export function loadExemptFile(rootDir: string): ExemptFile {
  const abs = join(rootDir, "apps", "site", "test", "honesty-lint.exempt.json");
  const raw = JSON.parse(readFileSync(abs, "utf8")) as ExemptFile;
  if (!Array.isArray(raw.entries)) {
    throw new Error("honesty-lint.exempt.json: `entries` must be an array (fail-closed)");
  }
  return raw;
}

export function exemptValues(ex: ExemptFile): Set<string> {
  return new Set(ex.entries.map((e) => e.value));
}
