// apps/site/test/honesty-lint.ts — detector behind root test 44 (test/site-honesty.test.ts;
// ADR-M004 D11: a hard-coded 1.07 in a page must red).
//
// SCOPE (stated so the exclusion list means something). A numeric literal is a VIOLATION only in a
// RENDERED-TEXT position:
//   (1) a JSX text node ................................... <p>1.07</p>
//   (2) a string/number/template literal that is a JSX CHILD expression ... <p>{1.07}</p> / <p>{"1.07"}</p>
//   (3) a string/number/template literal that is the value of a VISIBLE attribute
//       (alt, title, aria-label, placeholder, label) ....... <img alt="1.07 B" />
//   (4) MDX prose (outside code fences/spans and outside {...} expressions).
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

const VISIBLE_ATTRS = new Set(["alt", "title", "aria-label", "placeholder", "label"]);
const ALLOWED_ID = /\b(?:ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+)\b/g;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/g;
const NUMERIC_TOKEN = /\d+(?:[.,]\d+)*/g;
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo"]);
const SCAN_ROOTS = ["app", "content"];

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

/** Every rendered-text string (with 1-based line) in a tsx/ts source. */
function renderedTexts(sf: ts.SourceFile): RenderedText[] {
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

/** Strip code fences/spans and {...} expressions, leaving MDX prose. */
function mdxProse(source: string): string {
  let s = source.replace(/```[\s\S]*?```/g, " "); // fenced code
  s = s.replace(/`[^`]*`/g, " "); // inline code
  s = s.replace(/\{[^{}]*\}/g, " "); // JSX/MDX expressions (dynamic, not literals)
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
  for (const rt of renderedTexts(sf)) out.push(...scanText(rt.text, exemptValues));
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
  for (const rt of renderedTexts(sf)) {
    for (const token of scanText(rt.text, exemptValues)) {
      out.push({ file: rel, line: rt.line, token, text: rt.text.trim().slice(0, 60) });
    }
  }
  return out;
}

function kindForExt(ext: string): SourceKind | null {
  if (ext === ".tsx") return "tsx";
  if (ext === ".ts") return "ts";
  // .md is treated AS .mdx (defensive, F-1 G2 R1): next.config.mjs drops "md" from pageExtensions so a
  // stray content .md is never a route, but should one land under app/ or content/ it is still scanned as
  // MDX prose here — the honesty lint never silently skips a rendered-text surface.
  if (ext === ".mdx" || ext === ".md") return "mdx";
  return null;
}

/** Walk apps/site/{app,content} and scan every .tsx/.ts/.mdx file. */
export function scanAppsSite(
  rootDir: string,
  exemptValues: Set<string>,
): { violations: Violation[]; filesScanned: number } {
  const base = join(rootDir, "apps", "site");
  const violations: Violation[] = [];
  let filesScanned = 0;
  const walk = (absDir: string, relDir: string): void => {
    if (!existsSync(absDir)) return;
    for (const name of readdirSync(absDir)) {
      if (SKIP_DIRS.has(name)) continue;
      const abs = join(absDir, name);
      const rel = relDir + "/" + name;
      if (statSync(abs).isDirectory()) {
        walk(abs, rel);
        continue;
      }
      const kind = kindForExt(extname(name).toLowerCase());
      if (kind === null) continue;
      filesScanned += 1;
      violations.push(...scanFileText(rel, readFileSync(abs, "utf8"), kind, exemptValues));
    }
  };
  for (const r of SCAN_ROOTS) walk(join(base, r), "apps/site/" + r);
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
