/**
 * The module loads that a source text names, read on its syntax tree by the TypeScript compiler and never on its text, so that prose,
 * comments and regular expressions do not count (lot 1f of VERIFIERS-LIST-F5A-1; docs/G0-lot-verifiers-list-1f.md sections 10, 11;
 * IMPORT-SPECIFIERS-AST-1, docs/G0-lot-import-specifiers-ast-1.md; MONARK's decisions of 2026-10-07).
 * Shared by the import checks of the verifier list test and of the served-graph walk, and by those of the committed tables when they adopt it.
 * - importSpecifiers: the literal specifiers of the one tree that forbiddenLoads walks too, in source order: the module specifier of each
 *   import and export declaration (a side-effect import, a type import, a declaration over several lines, a re-export, export * from and
 *   export * as ns from), the module reference of import x = require(), and the argument of an import() or a require() call or of an import
 *   type when it is a string literal or a template without substitution; either quote; a comment anywhere is skipped, and a regular
 *   expression is one literal, whatever quote or backtick it holds. Until IMPORT-SPECIFIERS-AST-1 this was the list of
 *   ts.preProcessFile(text, true, true), a token scanner: it missed export * as ns from and any import that a regular expression holding a
 *   quote or a backtick hid (review of a1's adoption, 2026-10-07, finding M-1: forms G1 to G8), and it listed the argument of
 *   x.require("...") and the dependencies of an AMD define([...]), which the tree does not.
 * - forbiddenLoads: the loads that no specifier shows, found by a walk of the syntax tree, one line each: an import() whose argument is
 *   not such a literal; the names require, getBuiltinModule, createRequire, eval and Function (the decided list), constructor (the
 *   Function of any function, through its prototype), dlopen (a native module) and binding (process.binding, an internal module of Node
 *   with no import, as getBuiltinModule), as an identifier anywhere, a property name included, or as a constant string (literals and
 *   templates without a variable, joined by +, in parentheses), such as a computed key.
 * Not named: new Worker(url) of node:worker_threads, vm.runInThisContext(code) of node:vm, a child of node:child_process started with
 * --import, and registerHooks() and register() of node:module, each of which runs a module or code it is handed, or redirects later loads.
 * A scanned module reaches them by an import, which the specifier list that its test asserts shows (node:module, node:worker_threads,
 * node:vm and node:child_process are not in it), by a load that forbiddenLoads names, or by a name built at run time (the limit below; a
 * key built at run time on process does not compile without a cast). The served-graph walk asserts no specifier list, only forbiddenLoads:
 * a served module that imports one of them passes it, and no item names that limit yet. This header once said "closed only by the specifier
 * list": false under the token scanner, which missed an import of node:vm between two regular expressions holding a backtick (added to
 * policy-verifiers.ts, it passed the check: the same review). A module that needs one of them needs a rule aimed at it.
 * Limit, item IMPORT-AST-RUNTIME-NAME-1: a name built at run time from anything but literals (a variable, a join, a character code) is not
 * read; reading it would mean running the code. Refusing the form instead was measured on the scanned tree (review of 2026-10-07): a
 * computed key that is not a constant, on process, globalThis, global, Reflect, module, require, this, eval or Function, finds no false
 * positive but is defeated by an alias (const p = process); any computed member access whose key is not a literal finds 52 false
 * positives. The item stays open (noted by MONARK for docs/ETAT.md).
 */
import ts from "typescript";

/** The one parse of a module text that both readers walk: TypeScript, the latest target, parent links set. */
const treeOf = (text: string): ts.SourceFile => ts.createSourceFile("module.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
/** The node that carries the specifier of an import or export declaration, of import x = require(), of an import() or a require() call,
 *  or of an import type; undefined for any other node. */
function specifierNode(n: ts.Node): ts.Node | undefined {
  if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return n.moduleSpecifier;
  if (ts.isImportEqualsDeclaration(n) && ts.isExternalModuleReference(n.moduleReference)) return n.moduleReference.expression;
  if (ts.isCallExpression(n) && (n.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(n.expression) && n.expression.text === "require"))) return n.arguments[0];
  return ts.isImportTypeNode(n) && ts.isLiteralTypeNode(n.argument) ? n.argument.literal : undefined;
}

export function importSpecifiers(text: string): string[] {
  const found: string[] = [];
  const visit = (n: ts.Node): void => {
    const s = specifierNode(n);
    if (s !== undefined && ts.isStringLiteralLike(s)) found.push(s.text);
    ts.forEachChild(n, visit);
  };
  visit(treeOf(text));
  return found;
}

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
  const src = treeOf(text), found: string[] = [];
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
