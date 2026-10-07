/**
 * The module loads that a source text names (lot 1f of VERIFIERS-LIST-F5A-1; docs/G0-lot-verifiers-list-1f.md section 10). Shared by the
 * import checks of the verifier list test, and by those of the committed tables and the served-graph walk when they adopt it.
 * - importSpecifiers: the specifiers that ts.preProcessFile(text, true, true) lists, in source order.
 * - forbiddenLoads: the check of lot 1f's second fold, moved here as it was: an import( or require( call, or getBuiltinModule, on the
 *   text, doc comment lines stripped.
 */
import ts from "typescript";

export const importSpecifiers = (text: string): string[] => ts.preProcessFile(text, true, true).importedFiles.map((f) => f.fileName);

export function forbiddenLoads(text: string): string[] {
  const code = text.replace(/^ \*.*$/gm, "").replace(/^\/\*\*.*$/gm, "");
  return [/\bimport\s*\(/, /\brequire\s*\(/, /getBuiltinModule/].filter((r) => r.test(code)).map(String);
}
