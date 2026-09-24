// scripts/assert-fleet-html.mjs — O-2 for lot CI-site (ADR-M003 D9 octies): after `next build`, assert the
// RENDERED /fleet HTML body carries the "How each built agent is served" header and each built agent's
// wiring.note. It asserts on the BODY (script payloads stripped, HTML entities decoded), never the raw file:
// the inline RSC payload carries the apostrophe LITERALLY, so a naive includes() on the raw bytes would pass
// on a broken body whose note survives only in the payload (measured, G0 finding 8 — a false GREEN). Fail-closed
// if fleet.html is absent (exit 1, never a skip). Node 24, built-ins only.
//
// EXTENDED (lot SITE-RELEASE-1 sub-lot B, voie i): the SAME main() ALSO asserts the rendered /ukemi <main>
// body via assertUkemiBody() — digit-free numeric-hole scan + served-state/conditional-clause presence +
// interval/cascade/Bell/Aave absence. renderedBody()/assertFleetBody() are SHARED and UNCHANGED; the g3-site
// `run:` line is unchanged (checkpoint-1 C-4). See the /ukemi extension block below.
//
// The pure function assertFleetBody() is import-free (built-ins only) — what test/site-build-fleet.test.ts
// drives on a synthetic fixture. main() DYNAMICALLY imports apps/site/lib/fleet.ts (the SINGLE SOURCE of the
// built set — the expected notes are NEVER duplicated here) to derive the expected notes, then reads the
// freshly built artefact. The .d.mts twin gives the root nodenext tsc the type surface (governance-only,
// NOT whitelisted for the public export: no exported .ts imports this module).
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(SCRIPT_DIR, "..");

/** The exact command CI job g3-site runs to build the storefront; the single source of truth for the build
 *  step (idiom ci_publishes_sbom / scripts/sbom.mjs SBOM_COMMAND). test/site-build-fleet.test.ts asserts the
 *  g3-site build `run:` line EQUALS this; G2 and checkpoint-2 EXTRACT that line from ci.yml and replay it
 *  (with a TSX type error injected into apps/site => next build reds — the branching proof, G0 finding 12). */
export const SITE_BUILD_RUN = "npm run build -w @monark/site";

/** The digit-free header rendered above the served-notes list on /fleet (apps/site/app/fleet/page.tsx). */
export const FLEET_HEADER = "How each built agent is served";

/** The built artefact O-2 reads, relative to the repo root — the FRESH output of `next build`, never a stale
 *  .next left on disk (a disk .next drifts from source; G0 finding 6). */
export const FLEET_HTML_REL = "apps/site/.next/server/app/fleet.html";

/** Decode the HTML entities React emits in the rendered body. `&amp;` is decoded LAST so `&amp;#x27;` does not
 *  double-decode into an apostrophe. Numeric decimal/hex forms are generic; the named set covers React output. */
export function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** The hidden surfaces a browser never renders. Raw-text elements are not removed (D3, M-24): rawTextEnd checks them. */
const HIDDEN_BLOCKS = ["script", "noscript", "template"];
/** HTML's ASCII whitespace: it ends a tag name, and may pad an end tag before its `>` (`</script >`). */
const HTML_SPACE = "\t\n\f\r ";
/** ASCII-only lower-casing: HTML tag names are ASCII case-insensitive (String#toLowerCase is Unicode-aware). */
const asciiLower = (s) => s.replace(/[A-Z]/g, (c) => c.toLowerCase());

/** Elements whose content a browser reads as TEXT up to their own end tag, never as markup (WHATWG 13.2.6.4.4 "in
 *  head": title as RCDATA, noframes and style as raw text; 13.2.6.4.7 "in body": textarea as RCDATA, xmp, iframe and
 *  noembed as raw text, plaintext up to the end of the input; tokenizer states 13.2.5.2, 13.2.5.3, 13.2.5.5). They are
 *  not removed (D3, M-24): the scanner reads their content as markup, and rawTextEnd checks where that reading is wrong. */
const RAW_TEXT_ELEMENTS = ["style", "title", "textarea", "xmp", "iframe", "noembed", "noframes", "plaintext"];

/** The name, among `names`, of the element whose opener starts at `lt` (`<name` + whitespace, `/` or `>`, ASCII
 *  case-insensitive), else undefined. */
function openerAt(html, lt, names) {
  return names.find((n) => {
    const next = html.charAt(lt + 1 + n.length);
    return next !== "" && (HTML_SPACE + "/>").includes(next) && asciiLower(html.slice(lt + 1, lt + 1 + n.length)) === n;
  });
}

/** The hidden-block name whose opener starts at `lt`, else undefined. */
function hiddenOpenerAt(html, lt) {
  return openerAt(html, lt, HIDDEN_BLOCKS);
}

/** The raw-text element name whose opener starts at `lt`, else undefined. */
function rawTextOpenerAt(html, lt) {
  return openerAt(html, lt, RAW_TEXT_ELEMENTS);
}

/** Index just past a `</name` + optional whitespace + `>` closer that starts AT `c` (ASCII case-insensitive), else -1. */
function closerAt(html, name, c) {
  if (!html.startsWith("</", c) || asciiLower(html.slice(c + 2, c + 2 + name.length)) !== name) return -1;
  let k = c + 2 + name.length;
  while (k < html.length && HTML_SPACE.includes(html.charAt(k))) k++;
  return html.charAt(k) === ">" ? k + 1 : -1;
}

/** Index just past the first closer of `name` at or after `from`, else -1: the end of a script or noscript. Exact for
 *  noscript (raw text, WHATWG 13.2.5.14 RAWTEXT end tag name state) and for plain script data (13.2.5.17); the escaped
 *  and double-escaped script data states (13.2.5.18-13.2.5.31) are not modelled (residual R-e). */
function closerEnd(html, name, from) {
  for (let c = html.indexOf("</", from); c !== -1; c = html.indexOf("</", c + 2)) {
    const end = closerAt(html, name, c);
    if (end !== -1) return end;
  }
  return -1;
}

/** Index just past the closer (`</name` + optional whitespace + `>`, the D3 grammar) of the raw-text element whose opener
 *  `<name` starts at `lt`, once its content is checked. A browser reads that content as text; the scanner reads it as
 *  markup, which changes what it takes for hidden in three forms, each a named throw (pli 3, L-2, investor decision 187):
 *  the element is never closed (plaintext never is, 13.2.6.4.7; its text would run to the end of the input, whatever
 *  the scanner reads there); its content holds a hidden-surface opener (live to the scanner, that surface could run past
 *  the element's end and swallow a real one that follows: the single pass counted the payload of
 *  `<style><noscript></style><script></noscript>...`, where the two-pass regex order threw); in template content, its
 *  content holds a template closer (the scanner would end the template there). A raw-text opener inside that content is
 *  text as well: the caller skips it, up to the returned index, so each content is checked once. */
function rawTextEnd(html, lt, name, inTemplate) {
  const gt = html.indexOf(">", lt + 1 + name.length);
  const end = gt === -1 || name === "plaintext" ? -1 : closerEnd(html, name, gt + 1);
  if (end === -1) throw new Error(`assert-fleet-html: an unclosed <${name}> element (its text runs to the end of the input) - fail-closed`);
  for (let q = html.indexOf("<", gt + 1); q !== -1 && q < end; q = html.indexOf("<", q + 1)) {
    const hidden = hiddenOpenerAt(html, q);
    if (hidden !== undefined) throw new Error(`assert-fleet-html: a <${name}> element holds a <${hidden}> opener (text to a browser, live markup to this scanner) - fail-closed`);
    if (inTemplate && closerAt(html, "template", q) !== -1) throw new Error(`assert-fleet-html: a <${name}> element in a <template> holds a </template> (text to a browser, the template end to this scanner) - fail-closed`);
  }
  return end;
}

/** Index just past the comment that opens at `lt` (`<!--`), where a browser ends it (WHATWG 13.2.5.43-13.2.5.52): at once
 *  for `<!-->` and `<!--->` (abrupt closing, 13.2.5.43/13.2.5.44), else just past the first `--` followed by `>` or `!>`
 *  (`-->`, 13.2.5.51; `--!>`, 13.2.5.52); the `<!--`-inside-a-comment states (13.2.5.46-13.2.5.49) never move that end.
 *  Unclosed: throws. A `<!--` in raw text (style, title, textarea..., M-24) or in an attribute value is no comment to a
 *  browser, and the scanner cannot tell: when the span holds the opener of a hidden surface, one reading hides that
 *  surface and the other runs it, so what follows the span cannot be classified - throw, naming the opener (G2-delta B-2
 *  in a template, L-1 at top level: the span ran on into a later surface and the rest of its payload was counted). So
 *  does the opener of a raw-text element (pli 3, L-2): live, its content is text to a browser, yet the scanner, resuming
 *  after the span, would read the rest of it as markup, unchecked by rawTextEnd. */
function commentEnd(html, lt) {
  if (html.charAt(lt + 4) === ">") return lt + 5;
  if (html.startsWith("->", lt + 4)) return lt + 6;
  let close = html.indexOf("--", lt + 4);
  while (close !== -1 && html.charAt(close + 2) !== ">" && !html.startsWith("!>", close + 2)) close = html.indexOf("--", close + 1);
  if (close === -1) throw new Error("assert-fleet-html: an unclosed <!-- comment (no matching --> or --!>) - fail-closed");
  for (let p = html.indexOf("<", lt + 4); p !== -1 && p < close; p = html.indexOf("<", p + 1)) {
    const name = hiddenOpenerAt(html, p) ?? rawTextOpenerAt(html, p);
    if (name !== undefined) throw new Error(`assert-fleet-html: a <!-- comment spans a <${name}> opener (a <!-- in raw text or an attribute value would leave it live) - fail-closed`);
  }
  return html.charAt(close + 2) === ">" ? close + 3 : close + 4;
}

/** Deepest <template> nesting the scanner follows (G2-delta M-2): templateEnd and surfaceEnd recurse once per level, and
 *  without a bound the recursion reached the call-stack limit at 9 629 levels on Node v24.15.0 (a RangeError, fail-closed
 *  by accident only). 256 sits far below that limit and far above any page (the built site carries no <template>);
 *  deeper nesting throws, named. */
const MAX_TEMPLATE_DEPTH = 256;

/** Index just past the `</template>` that closes a template whose content starts at `from`, else -1. Its nesting level
 *  is `depth` (1 at top level). Template content is MARKUP, not raw text (WHATWG 13.2.6.4.16 "in
 *  template": script and template via the "in head" rules, noscript via "in body", i.e. raw text): a `</template>`
 *  inside a nested script, noscript or comment closes nothing, and a nested template ends at its own closer. So every
 *  nested surface is consumed WHOLE by surfaceEnd (recursively; it throws if unclosed) before a `</template>` is taken
 *  (G2 B-1: taking the first one wherever it sat was a false green). Each raw-text element met in the content is
 *  checked (rawTextEnd, template closer included) before its content is read like the rest. */
function templateEnd(html, from, depth) {
  if (depth > MAX_TEMPLATE_DEPTH) throw new Error(`assert-fleet-html: <template> nested deeper than ${MAX_TEMPLATE_DEPTH} levels - fail-closed`);
  let rawSeen = -1; // just past the last raw-text element checked: a raw-text opener before it is its text
  let lt = html.indexOf("<", from);
  while (lt !== -1) {
    const inner = surfaceEnd(html, lt, depth);
    if (inner !== undefined) {
      lt = html.indexOf("<", inner);
      continue;
    }
    const end = closerAt(html, "template", lt);
    if (end !== -1) return end;
    const raw = lt < rawSeen ? undefined : rawTextOpenerAt(html, lt);
    if (raw !== undefined) rawSeen = rawTextEnd(html, lt, raw, true);
    lt = html.indexOf("<", lt + 1);
  }
  return -1;
}

/** The hidden surface that opens at `lt`: undefined if none, else the index just past its end; `depth` counts the
 *  templates around `lt` (0 at top level). A comment ends where a browser ends it (commentEnd); a script or noscript at
 *  its first closer; a template at its own closer (templateEnd). Opener: `<name` (ASCII case-insensitive) + whitespace,
 *  `/` or `>`, attributes up to the next `>`; closer: `</name` + optional whitespace + `>`. Fail-closed: an unclosed
 *  surface throws, naming the innermost unclosed one (its payload would count as rendered text). */
function surfaceEnd(html, lt, depth) {
  if (html.startsWith("<!--", lt)) return commentEnd(html, lt);
  const name = hiddenOpenerAt(html, lt);
  if (name === undefined) return undefined;
  const gt = html.indexOf(">", lt + 1 + name.length);
  const end = gt === -1 ? -1 : name === "template" ? templateEnd(html, gt + 1, depth + 1) : closerEnd(html, name, gt + 1);
  if (end === -1) throw new Error(`assert-fleet-html: an unclosed <${name}> block (no matching </${name}>) - fail-closed`);
  return end;
}

/** ONE left-to-right pass in document order, the order a browser tokenizes in (ADR-CODEQL-ALERTS-1 D3: replaces the
 *  regex filters CodeQL flagged, #27-#29). Each COMPLETE hidden surface (surfaceEnd) is removed WHOLE, so a `<!--`
 *  inside a payload never pairs with a `-->` in the body; every other byte, generic tags included, is copied verbatim
 *  (extractMain / mainCorpus read the tags). The pass never re-scans its output, so a surface rebuilt from leftovers
 *  (`<scr<script></script>ipt>`) stays there for renderedBody's guards. Each raw-text element met on the way is
 *  checked (rawTextEnd) before its content is read like the rest. */
function stripHiddenSurfaces(html) {
  let out = "";
  let copied = 0;
  let rawSeen = -1; // just past the last raw-text element checked: a raw-text opener before it is its text
  let lt = html.indexOf("<");
  while (lt !== -1) {
    const end = surfaceEnd(html, lt, 0);
    if (end === undefined) {
      const raw = lt < rawSeen ? undefined : rawTextOpenerAt(html, lt);
      if (raw !== undefined) rawSeen = rawTextEnd(html, lt, raw, false);
      lt = html.indexOf("<", lt + 1); // not a hidden surface: this `<` is copied with the text around it
    } else {
      out += html.slice(copied, lt);
      copied = end;
      lt = html.indexOf("<", end);
    }
  }
  return out + html.slice(copied);
}

/** Isolate the RENDERED text body: remove every `<script>`, `<noscript>` and `<template>` block (attributes
 *  tolerated, case-insensitive) and React's `<!-- -->` comment markers (stripHiddenSurfaces), then decode
 *  entities. The inline RSC `<script>` payload carries the notes with LITERAL apostrophes (the false-green source),
 *  and a note living only inside a hidden `<noscript>`/`<template>` is likewise NOT rendered. Fail-closed on an
 *  UNCLOSED hidden block or comment, on a comment span holding a hidden-surface or raw-text opener, on a raw-text element
 *  left unclosed or holding a hidden-surface opener (in a template, a template closer too), on <template> nesting past
 *  MAX_TEMPLATE_DEPTH, and on a `<script` or `<!--` left in the output: a payload would otherwise leak into the body. */
export function renderedBody(html) {
  const noScript = stripHiddenSurfaces(String(html));
  // Fail-closed: a `<script` opening left in the output (no opener to the scanner, or rebuilt from leftovers such as
  // `<scr<script></script>ipt>`) could carry an inline payload (notes with LITERAL apostrophes) into the body, and a
  // broken build could pass on the payload alone (a false GREEN, G0 finding 8). Throw rather than let it through.
  if (/<script\b/i.test(noScript))
    throw new Error("assert-fleet-html: an unclosed <script> tag survived stripping (no matching </script>) - fail-closed");
  // Fail-closed, symmetric (ADR-CODEQL-ALERTS-1 C-V2-2b): a `<!--` left in the output (rebuilt from leftovers such
  // as `<!-<!---->-`) is markup this text check cannot classify; throw rather than count what it may hide.
  if (noScript.includes("<!--")) throw new Error("assert-fleet-html: a <!-- comment opener survived stripping - fail-closed");
  return decodeEntities(noScript);
}

/** Assert the rendered /fleet HTML body carries `expectedHeader` and each of `expectedNotes` at least once.
 *  Pure, built-ins only; THROWS on any failure (fail-closed). Vacuity-guarded: an empty expected list, an
 *  empty/blank note, or an empty rendered body all throw — a hollow build must never pass by absence of an
 *  assertion (a regex-on-source guard would stay green there; that is why O-2 reads the artefact). */
export function assertFleetBody({ html, expectedHeader, expectedNotes }) {
  if (typeof html !== "string") throw new Error("assert-fleet-html: html must be a string");
  if (typeof expectedHeader !== "string" || expectedHeader.trim().length === 0)
    throw new Error("assert-fleet-html: expectedHeader is empty (vacuity guard)");
  if (!Array.isArray(expectedNotes) || expectedNotes.length === 0)
    throw new Error("assert-fleet-html: expectedNotes is empty — no built agent note to check (vacuity guard)");
  for (const n of expectedNotes)
    if (typeof n !== "string" || n.trim().length === 0)
      throw new Error("assert-fleet-html: a built agent's note is empty/blank (vacuity guard)");

  const body = renderedBody(html);
  if (body.trim().length === 0) throw new Error("assert-fleet-html: rendered body empty after stripping scripts/comments (fail-closed)");

  if (!body.includes(decodeEntities(expectedHeader)))
    throw new Error(`assert-fleet-html: header absent from the rendered /fleet body: ${JSON.stringify(expectedHeader)}`);

  const missing = expectedNotes.filter((n) => !body.includes(decodeEntities(n)));
  if (missing.length)
    throw new Error(
      `assert-fleet-html: ${missing.length} served note(s) absent from the rendered /fleet body:\n` +
        missing.map((m) => `  - ${m}`).join("\n"),
    );
  return { header: decodeEntities(expectedHeader), notes: expectedNotes.length, bodyChars: body.length };
}

/* ─────────────────────────── /ukemi extension (lot SITE-RELEASE-1 sub-lot B, voie i, G0 §18/B) ───────────
 * The SAME next build renders ukemi.html and main() (below) reads it in the SAME run — the g3-site `run:` line
 * (`node scripts/assert-fleet-html.mjs`) is UNCHANGED (checkpoint-1 C-4). assertUkemiBody() is pure/built-ins
 * only, driven on synthetic fixtures by test/site-ukemi.test.ts and on the REAL artefact by g3-site. The
 * expected sentences are imported from apps/site/lib/ukemi-copy.ts (NEVER gate.ts — the byte-identity of the
 * served text to gate.ts is proven by the ROOT test site_ukemi_copy_equals_served_liq_text). renderedBody()
 * and assertFleetBody() above are SHARED and UNCHANGED (disjointness: site-build-fleet.test.ts ∉ this lot). */

/** The built /ukemi artefact, relative to the repo root — the FRESH `next build` output, never a stale .next. */
export const UKEMI_HTML_REL = "apps/site/.next/server/app/ukemi.html";

/** The conditional-coverage clause that MUST ride in the served /ukemi text (ADR-U4b D1; the tail of
 *  LIQ_CONDITIONAL_SENTENCE). Its absence is an over-revendication (checkpoint-1 C-1, gate.ts:153-155). */
export const UKEMI_CONDITIONAL_CLAUSE = "which the gate does not check";

// Numeric-hole scan — PARITY with apps/site/test/honesty-lint.ts (regexes :50-52, algorithm scanText :74-89).
// The three regexes are RECOPIED INLINE (C-1): a rendered numeric token is a violation UNLESS it belongs to an
// allowed identifier or an ISO date. NO exempt list here (the /ukemi <main> is digit-free WITHOUT the 01-04
// exemption — a STRICTER contract than honesty-lint's). site_ukemi_body_scan_and_carrier proves the parity.
const NUMERIC_TOKEN = /\d+(?:[.,]\d+)*/g;
const ALLOWED_ID = /\b(?:ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+)\b/g;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/g;

/** Char ranges [start,end) covered by an allowed identifier or an ISO date (parity: honesty-lint coveredRanges). */
function coveredRanges(text) {
  const ranges = [];
  for (const re of [ALLOWED_ID, ISO_DATE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0] !== undefined) ranges.push([m.index, m.index + m[0].length]);
    }
  }
  return ranges;
}

/** Offending numeric tokens in a plain rendered-text string. PURE, built-ins only. Byte-for-byte the output of
 *  honesty-lint.ts scanText(text, new Set()) — the scanner parity site_ukemi_body_scan_and_carrier asserts. */
export function scanNumericTokens(text) {
  const s = String(text);
  const ranges = coveredRanges(s);
  const out = [];
  NUMERIC_TOKEN.lastIndex = 0;
  let m;
  while ((m = NUMERIC_TOKEN.exec(s)) !== null) {
    const tok = m[0];
    if (tok === undefined) continue;
    const start = m.index;
    const end = start + tok.length;
    if (ranges.some(([a, b]) => start >= a && end <= b)) continue;
    out.push(tok);
  }
  return out;
}

/** Extract the inner HTML of the first <main>...</main>. Fail-closed (throws) if absent or blank: the /ukemi
 *  body lives in ONE <main> (the page component), ISOLATED from the shared layout <head>/SiteHeader/SiteFooter
 *  and the next/font CSS (font-weight numbers) that renderedBody does NOT strip and that are ∉ this lot (M-24).
 *  A build that dropped the <main> must never pass by absence of an assertion. */
export function extractMain(body) {
  const m = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(String(body));
  if (m === null) throw new Error("assert-ukemi: no <main>...</main> in the rendered /ukemi body (fail-closed)");
  const inner = m[1] ?? "";
  if (inner.trim().length === 0) throw new Error("assert-ukemi: the <main> subtree is empty/blank (vacuity guard, fail-closed)");
  return inner;
}

/** The scan corpus of a <main> subtree: the rendered TEXT NODES (after stripping EVERY tag) PLUS the values of
 *  the visible attributes alt/title/aria-label (captured BEFORE stripping) — the SAME corpus the numeric scan
 *  and the presence/absence checks run on, so class/style/data-* numbers (in tags) never leak in. */
export function mainCorpus(mainHtml) {
  const s = String(mainHtml);
  const attrs = [];
  const re = /\b(?:alt|title|aria-label)\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(s)) !== null) attrs.push(m[1] ?? "");
  const text = s.replace(/<[^>]+>/g, " ");
  return (text + " " + attrs.join(" ")).replace(/\s+/g, " ").trim();
}

/** Assert the rendered /ukemi <main> body is DIGIT-FREE and carries the served honest state + the whole
 *  conditional sentence + the named clause, and NONE of interval/cascade/Bell/Aave. Pure, built-ins only;
 *  THROWS on any failure (fail-closed). Vacuity-guarded like assertFleetBody. `expected` = the two DIGIT-FREE
 *  served sentences from lib/ukemi-copy.ts: { emptyRegistrySentence, conditionalSentence }. */
export function assertUkemiBody({ html, expected }) {
  if (typeof html !== "string") throw new Error("assert-ukemi: html must be a string");
  if (expected === null || typeof expected !== "object") throw new Error("assert-ukemi: expected must be an object (vacuity guard)");
  const { emptyRegistrySentence, conditionalSentence, status } = expected;
  for (const [k, v] of [["emptyRegistrySentence", emptyRegistrySentence], ["conditionalSentence", conditionalSentence], ["status", status]]) {
    if (typeof v !== "string" || v.trim().length === 0)
      throw new Error(`assert-ukemi: expected.${k} is empty/not-a-string (vacuity guard)`);
  }

  const body = renderedBody(html); // SHARED, UNCHANGED (fail-closed on an unclosed <script>)
  const mainHtml = extractMain(body); // fail-closed if <main> absent/blank (isolates page body from layout, M-24)
  const corpus = mainCorpus(mainHtml);
  if (corpus.length === 0) throw new Error("assert-ukemi: <main> corpus empty after stripping (fail-closed)");

  // (1) numeric-hole scan (C-1): 0 numeric tokens in the rendered <main> text + visible attrs.
  const nums = scanNumericTokens(corpus);
  if (nums.length)
    throw new Error(`assert-ukemi: ${nums.length} numeric token(s) rendered in the /ukemi <main> (expected 0, digit-free): ${JSON.stringify(nums)}`);

  // (2) presence (byte-identical): the served empty-registry state, the whole conditional sentence, the clause.
  if (!corpus.includes(emptyRegistrySentence))
    throw new Error(`assert-ukemi: the served empty-registry sentence is absent from the /ukemi <main>: ${JSON.stringify(emptyRegistrySentence)}`);
  if (!corpus.includes(conditionalSentence))
    throw new Error(`assert-ukemi: the served conditional sentence is absent from the /ukemi <main>: ${JSON.stringify(conditionalSentence)}`);
  if (!corpus.includes(UKEMI_CONDITIONAL_CLAUSE))
    throw new Error(`assert-ukemi: the clause ${JSON.stringify(UKEMI_CONDITIONAL_CLAUSE)} is absent from the /ukemi <main>`);

  // (3) absence: interval (substring, A-9) + cascade/Bell/Aave (word-bounded) — over-revendication / wrong surface.
  if (corpus.toLowerCase().includes("interval"))
    throw new Error('assert-ukemi: "interval" rendered in the /ukemi <main> (the served region is an upper bound, never an interval — A-9)');
  for (const [word, re] of [["cascade", /\bcascade\b/i], ["Bell", /\bBell\b/i], ["Aave", /\bAave\b/i]]) {
    if (re.test(corpus)) throw new Error(`assert-ukemi: "${word}" rendered in the /ukemi <main> (forbidden on this surface)`);
  }

  // (5) PILL carries the REAL fleet-register status (C-1, CA-11 hardened): the hero eyebrow "Ukemi" and the
  // status pill render as ADJACENT siblings, so the <main> corpus carries "Ukemi <status>". A pill that STILL
  // reads `.status` but FLIPS the value (mutant X5: `status === "built" ? "upcoming" : status`) reddens HERE
  // on the ARTEFACT path — the source-only `.status` check (site_ukemi_reads_status_only) cannot catch a flip.
  // `status` is derived by main() from the real FLEET_AGENTS (single source). (A pill HARD-CODED to a literal
  // — not wired to `.status` — coincidentally matches the corpus here; it is caught at SOURCE by the
  // `rendered.has("status")` carrier in site_ukemi_body_scan_and_carrier.)
  const pillCarrier = "Ukemi " + status;
  if (!corpus.includes(pillCarrier))
    throw new Error(`assert-ukemi: the /ukemi <main> pill does not carry the registry status (expected carrier ${JSON.stringify(pillCarrier)}) — a flipped pill value (mutant X5)`);

  return { mainChars: mainHtml.length, corpusChars: corpus.length, numericTokens: nums.length, status };
}

async function main() {
  // --- /fleet (O-2, UNCHANGED) ---
  const fleetAbs = join(REPO_ROOT, ...FLEET_HTML_REL.split("/"));
  if (!existsSync(fleetAbs)) {
    console.error(`assert-fleet-html: FAIL-CLOSED — ${FLEET_HTML_REL} not found. Run \`${SITE_BUILD_RUN}\` first (O-2 asserts on the fresh artefact, never a skip).`);
    process.exit(1);
  }
  const fleetUrl = pathToFileURL(join(REPO_ROOT, "apps", "site", "lib", "fleet.ts")).href;
  const { FLEET_AGENTS } = await import(fleetUrl);
  const expectedNotes = FLEET_AGENTS.filter((a) => a.status === "built").map((a) => a.wiring.note);
  try {
    const r = assertFleetBody({ html: readFileSync(fleetAbs, "utf8"), expectedHeader: FLEET_HEADER, expectedNotes });
    console.log(`assert-fleet-html OK — header + ${r.notes} served note(s) present in the rendered /fleet body (${r.bodyChars} body chars).`);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }

  // --- /ukemi (voie i: same next build artefact, same main(), same `run:` line) ---
  const ukemiAbs = join(REPO_ROOT, ...UKEMI_HTML_REL.split("/"));
  if (!existsSync(ukemiAbs)) {
    console.error(`assert-fleet-html: FAIL-CLOSED — ${UKEMI_HTML_REL} not found. Run \`${SITE_BUILD_RUN}\` first (asserts on the fresh /ukemi artefact, never a skip).`);
    process.exit(1);
  }
  const ukemiUrl = pathToFileURL(join(REPO_ROOT, "apps", "site", "lib", "ukemi-copy.ts")).href;
  const { LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_CONDITIONAL_SENTENCE } = await import(ukemiUrl);
  // Derive the pill status from the REAL fleet register (FLEET_AGENTS already imported above) — the SAME
  // single source the page reads (C-1). Fail-closed if Ukemi is absent (a broken registry must not pass).
  const ukemiAgent = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  if (!ukemiAgent) {
    console.error("assert-fleet-html: FAIL-CLOSED — 'Ukemi' absent from FLEET_AGENTS (lib/fleet.ts); cannot derive the /ukemi pill status.");
    process.exit(1);
  }
  try {
    const r = assertUkemiBody({
      html: readFileSync(ukemiAbs, "utf8"),
      expected: { emptyRegistrySentence: LIQ_EMPTY_REGISTRY_SENTENCE, conditionalSentence: LIQ_CONDITIONAL_SENTENCE, status: ukemiAgent.status },
    });
    console.log(`assert-fleet-html OK — /ukemi <main> digit-free (${r.numericTokens} numeric tokens), served state + conditional clause present, pill carries registry status ${JSON.stringify(r.status)}, no interval/cascade/Bell/Aave (${r.corpusChars} corpus chars).`);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }
}

// Run-guard (mirrors scripts/grep-forbidden.mjs, scripts/export-public.mjs): the CLI runs only when invoked
// directly (node scripts/assert-fleet-html.mjs), NEVER on import — so the test imports the pure function
// without touching fleet.ts or the filesystem.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
