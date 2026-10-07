/**
 * The module loads that a source text names, read on its syntax by the TypeScript compiler and never on its text, so that prose and
 * comments do not count (lot 1f of VERIFIERS-LIST-F5A-1; docs/G0-lot-verifiers-list-1f.md sections 10, 11; MONARK's decision of 2026-10-07).
 * Shared by the import checks of the verifier list test, and by those of the committed tables and the served-graph walk when they adopt it.
 * - importSpecifiers: the specifiers that ts.preProcessFile(text, true, true) lists, in source order: those of an import, a side-effect
 *   import, a type import, an import or an export over several lines, a re-export, export * from and import x = require(), and those of
 *   an import() or a require() whose argument is a string literal or a template without substitution; either quote; a comment between
 *   the keyword and the specifier is skipped.
 * - forbiddenLoads: the loads that no specifier shows, found by a walk of the syntax tree, one line each: an import() whose argument is
 *   not such a literal; the names require, getBuiltinModule, createRequire, eval and Function (the decided list), constructor (the
 *   Function of any function, through its prototype), dlopen (a native module) and binding (process.binding, an internal module of Node
 *   with no import, as getBuiltinModule), as an identifier anywhere, a property name included, or as a constant string (literals and
 *   templates without a variable, joined by +, in parentheses), such as a computed key.
 * Not named: new Worker(url) of node:worker_threads, vm.runInThisContext(code) of node:vm and a child of node:child_process started with
 * --import, each of which runs a module or code that it is handed. Today they stay closed only by the specifier list that the test of
 * each scanned module asserts (node:worker_threads, node:vm and node:child_process are not in it) and by the strict type check (a key
 * built at run time on process does not compile without a cast); a module that imports one of them for a reason needs a rule aimed at it.
 * Limit, item IMPORT-AST-RUNTIME-NAME-1: a name built at run time from anything but literals (a variable, a join, a character code) is not
 * read; reading it would mean running the code. Refusing the form instead was measured on the scanned tree (review of 2026-10-07): a
 * computed key that is not a constant, on process, globalThis, global, Reflect, module, require, this, eval or Function, finds no false
 * positive but is defeated by an alias (const p = process); any computed member access whose key is not a literal finds 52 false
 * positives. The item stays open (noted by MONARK for docs/ETAT.md).
 */
import ts from "typescript";

export const importSpecifiers = (text: string): string[] => ts.preProcessFile(text, true, true).importedFiles.map((f) => f.fileName);

const NAMES = new Set(["require", "getBuiltinModule", "createRequire", "eval", "Function", "constructor", "dlopen", "binding"]);
/** The value of a constant string: a literal, a template whose substitutions are constant, or a + of constants, in parentheses or not. */
function constant(n: ts.Node): string | undefined {
  if (ts.isStringLiteralLike(n)) return n.text;
  if (ts.isParenthesizedExpression(n)) return constant(n.expression);
  if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const a = constant(n.left), b = constant(n.right);
    return a === undefined || b === undefined ? undefined : a + b;
  }
  if (!ts.isTemplateExpression(n)) return undefined;
  let s: string | undefined = n.head.text;
  for (const span of n.templateSpans) {
    const v = constant(span.expression);
    s = s === undefined || v === undefined ? undefined : s + v + span.literal.text;
  }
  return s;
}

export function forbiddenLoads(text: string): string[] {
  const src = ts.createSourceFile("module.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS), found: string[] = [];
  const at = (n: ts.Node): string => `l.${String(src.getLineAndCharacterOfPosition(n.getStart(src)).line + 1)}`;
  const visit = (n: ts.Node, inConstant: boolean): void => {
    const value = constant(n);
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && !(n.arguments[0] !== undefined && ts.isStringLiteralLike(n.arguments[0]))) found.push(`${at(n)}: import() of a specifier that is not a literal`);
    else if (ts.isIdentifier(n) && NAMES.has(n.text)) found.push(`${at(n)}: ${n.text}`);
    else if (!inConstant && value !== undefined && NAMES.has(value)) found.push(`${at(n)}: ${JSON.stringify(value)}, a constant string`);
    ts.forEachChild(n, (c) => visit(c, value !== undefined));
  };
  visit(src, false);
  return found;
}
