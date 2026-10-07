// test/helpers/markup-text.ts -- KILLER-TEST-HELPERS-SUPPORT-1 (2026-10-07): textOf of test/dojo-render.test.ts, moved here so that
// the killers of its tests can fire. A killer mutates production code or a support module the test file imports, never a *.test.ts.
import assert from "node:assert/strict";

/** The text of some markup React wrote: tags dropped, the five entities React writes decoded in one pass. React escapes < > & in text
 *  and attributes: a stray < or >, or a bare &, is markup it never writes, refused (CodeQL alert 41), never read. */
const ENTITIES: Readonly<Record<string, string>> = { "&#x27;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">", "&amp;": "&" };
export const textOf = (html: string): string => [...html.matchAll(/<[^<>]*>|[^<>]+|[<>]/g)].map(([t]) => t.startsWith("<") && t.endsWith(">") ? ""
  : /^[<>]$/.test(t) ? assert.fail(`textOf: a stray ${t} in ${JSON.stringify(html)}`)
  : t.replace(/&(?:#x27|quot|lt|gt|amp);|&/g, (e) => ENTITIES[e] ?? assert.fail(`textOf: a bare & in ${JSON.stringify(html)}`))).join("");
