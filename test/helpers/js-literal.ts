// test/helpers/js-literal.ts -- KILLER-TEST-HELPERS-SUPPORT-1 (2026-10-07): jsLiteral of test/dojo-render.test.ts, moved here so that
// the killer of its test can fire. A killer mutates production code or a support module the test file imports, never a *.test.ts.

/** A JavaScript string literal of `s`, each UTF-16 unit written as a \u escape: the module source holds no quote, backslash, angle
 *  bracket or line terminator of `s` (CodeQL alert 44: the literal is built closed, not sanitized after the fact). */
export const jsLiteral = (s: string): string => `"${s.split("").map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join("")}"`;
