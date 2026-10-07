/**
 * The module specifiers that a source text names, in double or single quotes: an import, a side-effect import, a re-export,
 * an import over several lines, import(). A computed specifier (import(name)) is not read. The import checks of
 * policy-committed.test.ts read them all; the served-graph walk of kata-path.test.ts (servedModules) follows the relative ones.
 */
export const importSpecifiers = (text: string): string[] => [...text.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g)].map((m) => m[1] as string);
