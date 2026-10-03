// scripts/assert-fleet-html.mjs — O-2 for lot CI-site (ADR-M003 D9 octies): after `next build`, assert the
// RENDERED /fleet HTML body carries the "How each built agent is served" header and each built agent's
// wiring.note. It asserts on the BODY (script payloads stripped, HTML entities decoded), never the raw file:
// the inline RSC payload carries the apostrophe LITERALLY, so a naive includes() on the raw bytes would pass
// on a broken body whose note survives only in the payload (measured, G0 finding 8 — a false GREEN). Fail-closed
// if fleet.html is absent (exit 1, never a skip). Node 24, built-ins only.
//
// EXTENDED (lot SITE-RELEASE-1 sub-lot B, voie i): the SAME main() ALSO asserts the rendered /ukemi <main>
// body via assertUkemiBody() — closed list of figures, no other number + served-state/conditional-clause presence +
// interval/cascade/Bell/Aave absence. renderedBody()/assertFleetBody() are SHARED and UNCHANGED; the g3-site
// `run:` line is unchanged (checkpoint-1 C-4). See the /ukemi extension block below.
// EXTENDED (ADR-BELL-OTS-PRB T-B9, T-3b): the same main() asserts the Bell timestamp state of the latest published record on the
// built pages (its one sentence, no other state's; the publications table row by row). See the Bell block below.
// EXTENDED (Dōjō hold snapshot): the same main() asserts /dojo against the committed record: before any served snapshot, no page and
// no link on /token; after it, the closed list of figures of the record's state, its sentences and pill. See the /dojo block below.
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
// allowed identifier or an ISO date. NO exempt list here (outside its closed list of figures, read from the committed
// files, the /ukemi <main> is digit-free WITHOUT the 01-04 exemption — a STRICTER contract than honesty-lint's).
// site_ukemi_body_scan_and_carrier proves the parity.
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

/** The two parts of mainCorpus kept apart for the closed list of /ukemi (same captures): the TEXT NODES (every tag
 *  stripped, whitespace collapsed) and the visible attribute values. A figure counts in the text only; an attribute
 *  value only ever joins the remainder that must carry no number. */
function mainTextAndAttrs(mainHtml) {
  const s = String(mainHtml);
  const attrs = [];
  const re = /\b(?:alt|title|aria-label)\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(s)) !== null) attrs.push(m[1] ?? "");
  return { text: s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), attrs };
}

/** An ASCII letter or digit: an occurrence of a figure is bounded when neither neighbour is one (an end counts as none). */
const ASCII_ALNUM = /[0-9A-Za-z]/;
/** Start index of EVERY bounded occurrence of `value` in `text` (indexOf resumed one past each start, never the first
 *  alone). No regular expression is built from the value. */
function boundedOccurrences(text, value) {
  const out = [];
  for (let i = text.indexOf(value); i !== -1; i = text.indexOf(value, i + 1)) {
    if (!ASCII_ALNUM.test(text.charAt(i - 1)) && !ASCII_ALNUM.test(text.charAt(i + value.length))) out.push(i);
  }
  return out;
}

/** Assert the rendered /ukemi <main> body carries no number outside its closed list of figures, the served honest
 *  state + the whole conditional sentence + the named clause, and NONE of interval/cascade/Bell/Aave. Pure, built-ins
 *  only; THROWS on any failure (fail-closed). Vacuity-guarded like assertFleetBody. `expected` = the synced served state
 *  (`registryState`, "empty" | "committed", from apps/site/data/ukemi-served.json), the DIGIT-FREE sentences from
 *  lib/ukemi-copy.ts and the closed list of figures read from the committed files (ukemiExpected):
 *  { registryState, emptyRegistrySentence, committedStateSentence, conditionalSentence, status, figures }.
 *  The presence rule is BOUND TO THAT STATE: its sentence rides, the other state's never. */
export function assertUkemiBody({ html, expected }) {
  if (typeof html !== "string") throw new Error("assert-ukemi: html must be a string");
  if (expected === null || typeof expected !== "object") throw new Error("assert-ukemi: expected must be an object (vacuity guard)");
  const { registryState, emptyRegistrySentence, committedStateSentence, conditionalSentence, status, figures } = expected;
  if (registryState !== "empty" && registryState !== "committed")
    throw new Error(`assert-ukemi: expected.registryState must be "empty" or "committed" (the synced served state), got ${JSON.stringify(registryState)} (fail-closed)`);
  for (const [k, v] of [["emptyRegistrySentence", emptyRegistrySentence], ["committedStateSentence", committedStateSentence], ["conditionalSentence", conditionalSentence], ["status", status]]) {
    if (typeof v !== "string" || v.trim().length === 0)
      throw new Error(`assert-ukemi: expected.${k} is empty/not-a-string (vacuity guard)`);
  }
  // (1) the closed list: none in an empty served state; in a committed one, a non-empty list of non-blank values and
  // sources (a value need not carry a digit: each is matched as a whole string).
  if (!Array.isArray(figures)) throw new Error("assert-ukemi: expected.figures must be an array (vacuity guard)");
  if (registryState === "empty" && figures.length > 0) throw new Error("assert-ukemi: an empty served state carries no figure (expected.figures must be empty)");
  const blank = (s) => typeof s !== "string" || s.trim().length === 0;
  if (registryState === "committed" && (figures.length === 0 || figures.some((f) => f === null || typeof f !== "object" || blank(f.value) || blank(f.source))))
    throw new Error("assert-ukemi: expected.figures of a committed served state is empty or holds a blank value or source (vacuity guard)");

  const body = renderedBody(html); // SHARED, UNCHANGED (fail-closed on an unclosed <script>)
  const mainHtml = extractMain(body); // fail-closed if <main> absent/blank (isolates page body from layout, M-24)
  const corpus = mainCorpus(mainHtml);
  if (corpus.length === 0) throw new Error("assert-ukemi: <main> corpus empty after stripping (fail-closed)");
  const parts = mainTextAndAttrs(mainHtml);
  if ((parts.text + " " + parts.attrs.join(" ")).replace(/\s+/g, " ").trim() !== corpus)
    throw new Error("assert-ukemi: the text nodes and attribute values do not recompose the <main> corpus (fail-closed)");

  // (2) presence (byte-identical), bound to the synced served state: that state's sentence rides and the other state's
  // does not (a page that ignores the state reds on one of the two states); then the whole conditional sentence, the clause.
  const [stateSentence, other, otherSentence] = registryState === "empty"
    ? [emptyRegistrySentence, "committed", committedStateSentence]
    : [committedStateSentence, "empty", emptyRegistrySentence];
  if (!corpus.includes(stateSentence))
    throw new Error(`assert-ukemi: the ${registryState}-state sentence of the synced served state is absent from the /ukemi <main>: ${JSON.stringify(stateSentence)}`);
  if (corpus.includes(otherSentence))
    throw new Error(`assert-ukemi: the ${other}-state sentence is rendered while the synced served state is ${registryState}: ${JSON.stringify(otherSentence)}`);
  if (!corpus.includes(conditionalSentence))
    throw new Error(`assert-ukemi: the served conditional sentence is absent from the /ukemi <main>: ${JSON.stringify(conditionalSentence)}`);
  if (!corpus.includes(UKEMI_CONDITIONAL_CLAUSE))
    throw new Error(`assert-ukemi: the clause ${JSON.stringify(UKEMI_CONDITIONAL_CLAUSE)} is absent from the /ukemi <main>`);

  // (2b) each figure exactly once, as a bounded occurrence of the TEXT NODES (never an attribute), longest value first,
  // each searched in the text already reduced by the longer ones, so a short value inside a longer one counts once.
  let rest = parts.text;
  const ordered = figures.map((f, i) => ({ f, i })).sort((a, b) => b.f.value.length - a.f.value.length || a.i - b.i);
  for (const { f } of ordered) {
    const hits = boundedOccurrences(rest, f.value);
    if (hits.length !== 1)
      throw new Error(`assert-ukemi: the figure ${JSON.stringify(f.value)} (${f.source}) occurs ${String(hits.length)} time(s) as a bounded occurrence in the text of the /ukemi <main> (expected exactly once)`);
    rest = rest.slice(0, hits[0]) + " " + rest.slice(hits[0] + f.value.length);
  }
  // (2c) no other number: the reduced text and the visible attribute values carry no numeric token. Two forms the scan
  // cannot read are refused first (fail-closed). An angle bracket written as an entity is decoded BEFORE the tags are
  // stripped, so the strip swallows the text after it: a number inside "&lt;...&gt;", or after a "&lt;", is never
  // scanned. A number written with non-ASCII digits (full-width, superscript) escapes \d. The /ukemi <main> has neither.
  if (/&(?:lt|gt|#0*6[02]|#x0*3[ce]);/i.test(extractMain(stripHiddenSurfaces(String(html)))))
    throw new Error("assert-ukemi: an angle bracket written as an entity in the /ukemi <main> would hide the text after it from the numeric scan (fail-closed)");
  if (/(?![0-9])\p{N}/u.test(corpus))
    throw new Error("assert-ukemi: a number written with non-ASCII digits in the /ukemi <main> escapes the numeric scan (fail-closed)");
  const nums = scanNumericTokens(rest + " " + parts.attrs.join(" "));
  if (nums.length)
    throw new Error(`assert-ukemi: ${nums.length} numeric token(s) rendered in the /ukemi <main> outside the closed list of figures: ${JSON.stringify(nums)}`);

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

  const figureTokens = figures.reduce((n, f) => n + scanNumericTokens(f.value).length, 0);
  return { mainChars: mainHtml.length, corpusChars: corpus.length, numericTokens: nums.length, figures: figures.length, figureTokens, status, registryState };
}

/** The closed list of figures /ukemi may render for the served state, computed apart from the page's figures module:
 *  n from the course report, the bound margin from the served integer (the course loader's exact 8-decimal rendering),
 *  the digest and the day from the served-state file; none while the registry is empty. Throws on a committed state
 *  without a served verdict, a served stratum absent from the report or below its floor, or calibration points or a
 *  bound margin on which the two files disagree. */
function ukemiFigures(served, course, decimal8Of) {
  if (served.registry_state === "empty") return [];
  const fail = (msg) => {
    throw new Error(`assert-ukemi: ${msg}; the figures of /ukemi cannot be read (fail-closed)`);
  };
  const v = served.liq_verdict;
  if (v === null) fail("the committed served state carries no served verdict (a v1 file)");
  const x = course.strata.find((s) => s.stratum === v.stratum);
  if (x === undefined || !x.meets_floor) fail(`the served stratum ${String(v.stratum)} is absent from the course report or below its floor`);
  if (x.n !== v.calibration_points) fail("the served calibration points are not the course report's count");
  if (v.bound_margin_base === null || v.bound_margin_base !== x.bound_margin_base) fail("the served bound margin is not the course report's");
  return [
    { value: String(x.n), source: `ukemi-course.json h3.strata[${String(v.stratum)}].fresh.n` },
    { value: decimal8Of(v.bound_margin_base), source: "ukemi-served.json liq_verdict.bound_margin_base, in 8 decimals" },
    { value: v.calibration_digest, source: "ukemi-served.json liq_verdict.calibration_digest" },
    { value: served.read_at.slice(0, 10), source: "ukemi-served.json read_at, its day" },
  ];
}

/** What main() asserts on the built /ukemi page, read from the site's own modules (never typed here): the synced served
 *  state through the page's own fail-closed loader (lib/ukemi-served-load.ts) on `dataRoot`, the state sentences and the
 *  conditional sentence (lib/ukemi-copy.ts), the pill status (lib/fleet.ts), and the closed list of figures from the
 *  served-state file and the course report (lib/ukemi-course-load.ts), both through their fail-closed loaders. Throws
 *  fail-closed. */
export async function ukemiExpected(dataRoot = REPO_ROOT) {
  const lib = (f) => pathToFileURL(join(REPO_ROOT, "apps", "site", "lib", f)).href;
  const { LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_COMMITTED_STATE_NOTE, LIQ_CONDITIONAL_SENTENCE } = await import(lib("ukemi-copy.ts"));
  const { loadUkemiServed } = await import(lib("ukemi-served-load.ts"));
  const { loadUkemiCourse, decimal8Of } = await import(lib("ukemi-course-load.ts"));
  const { FLEET_AGENTS } = await import(lib("fleet.ts"));
  const ukemiAgent = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  if (!ukemiAgent) throw new Error("assert-ukemi: 'Ukemi' absent from FLEET_AGENTS (lib/fleet.ts); cannot derive the /ukemi pill status (fail-closed)");
  const served = loadUkemiServed(dataRoot);
  return {
    registryState: served.registry_state, emptyRegistrySentence: LIQ_EMPTY_REGISTRY_SENTENCE,
    committedStateSentence: LIQ_COMMITTED_STATE_NOTE, conditionalSentence: LIQ_CONDITIONAL_SENTENCE, status: ukemiAgent.status,
    figures: ukemiFigures(served, loadUkemiCourse(dataRoot), decimal8Of),
  };
}

/* ─────────── Bell: the timestamp state of the latest published record (ADR-BELL-OTS-PRB T-B9, T-3b) ───────────
 * The pages that state it render the ONE sentence of the state computed from the committed data, and no primer of another state; the
 * verification page describes the three states and states none; /bell/anchors renders each publication row with the status read from its
 * proof, and the highest line whose proof records a block. main() computes the state as the pages do: the loaders and the pure reader of
 * apps/site/lib are self-contained and imported by file URL (no alias). The functions below are pure (test/bell-publication-state.test.ts). */
export const BELL_STATE_PAGES_REL = ["bell", "bell/method", "docs/bell", "docs/use-cases"].map((p) => `apps/site/.next/server/app/${p}.html`);
export const BELL_VERIFY_REL = "apps/site/.next/server/app/docs/verify.html";
export const BELL_ANCHORS_REL = "apps/site/.next/server/app/bell/anchors.html";
/** A fragment each state's sentence carries and no other state's does. */
export const BELL_STATE_PRIMERS = { none: "not timestamp-anchored", pending: "the proof is pending: it records calendars", anchored: "the proof file records Bitcoin block" };
/** The two D8 clauses every anchored sentence carries ("before" and the node clause), written here, not imported (C-G2-3). */
export const BELL_ANCHORED_CLAUSES = ["existed before that block", "not checked against a node here"];

/** Assert a rendered <main> carries the sentence of `state` and no primer of another state; with `state` null (a page that states no
 *  state), no primer at all and not the retired "in preparation". Throws on failure (vacuity-guarded). */
export function assertBellAnchorBody({ html, state, sentence }) {
  if (state !== null && !(typeof sentence === "string" && sentence.includes(BELL_STATE_PRIMERS[state] ?? "\u0000"))) throw new Error("assert-bell: the expected sentence does not carry its state's primer (vacuity guard)");
  const corpus = mainCorpus(extractMain(renderedBody(html)));
  if (state !== null && !corpus.includes(sentence)) throw new Error(`assert-bell: the ${state} sentence is absent from the rendered <main>: ${JSON.stringify(sentence)}`);
  if (state === "anchored") for (const c of BELL_ANCHORED_CLAUSES) if (!sentence.includes(c)) throw new Error(`assert-bell: the anchored sentence lacks "${c}" (D8)`);
  const stray = Object.entries(BELL_STATE_PRIMERS).filter(([s, p]) => s !== state && corpus.includes(p)).map(([s]) => s);
  if (state === null && corpus.includes("in preparation")) stray.push("in preparation");
  if (stray.length > 0) throw new Error(`assert-bell: the rendered <main> states another state than ${String(state)}: ${stray.join(", ")}`);
  return { state, corpusChars: corpus.length };
}

/** The status label and detail the anchors tables render for a row, recomputed here from the proof's status (not imported). */
export function bellStatusText(status) {
  if (status === null) return { label: "not timestamped", detail: "no proof file for this line" };
  const c = status.pendingCalendars.length, b = status.bitcoinHeights.length, cal = `${String(c)} ${c === 1 ? "calendar record" : "calendar records"}`;
  return b > 0
    ? { label: "bitcoin attestation", detail: `earliest block ${String(status.bitcoinHeights[0])} · ${String(b)} ${b === 1 ? "block record" : "block records"} · ${cal} pending` }
    : { label: "pending", detail: `${cal}, no block yet` };
}

/** The counts line of the publications section, recomputed here from each row's status (null: no proof), never from the view's totals. */
export function bellCountsText(statuses) {
  const n = (k, one, many) => `${String(k)} ${k === 1 ? one : many}`, proofs = statuses.filter((s) => s !== null);
  return `${n(statuses.length, "line", "lines")} in the register · ${n(proofs.length, "proof file", "proof files")} · ${String(proofs.filter((s) => s.bitcoinHeights.length > 0).length)} with a Bitcoin block record · ${String(statuses.length - proofs.length)} without proof`;
}

/** Assert the rendered /bell/anchors carries, in the table row holding each manifest digest (title attribute), that row's status label and
 *  detail, and the latest-anchored line. `rows`: [{ manifest_sha256, label, detail }]. Throws on failure (vacuity-guarded). */
export function assertBellPublicationsTable({ html, rows, latest, counts }) {
  if (!Array.isArray(rows) || rows.length === 0 || typeof latest !== "string" || latest.length === 0 || typeof counts !== "string" || counts.length === 0) throw new Error("assert-bell: no publication row or no latest line to check (vacuity guard)");
  const main = extractMain(renderedBody(html));
  for (const r of rows) {
    const tr = main.split(/<tr\b/i).find((seg) => seg.includes(`title="${r.manifest_sha256}"`));
    if (tr === undefined) throw new Error(`assert-bell: no table row carries the manifest digest ${r.manifest_sha256}`);
    const want = `${r.label} ${r.detail}`; // the label and, right after it, its detail (one status cell)
    if (!mainCorpus(tr).includes(want)) throw new Error(`assert-bell: the row of ${r.manifest_sha256} does not render ${JSON.stringify(want)}`);
  }
  if (!mainCorpus(main).includes(latest)) throw new Error(`assert-bell: the latest-anchored line is absent: ${JSON.stringify(latest)}`);
  if (!mainCorpus(main).includes(counts)) throw new Error(`assert-bell: the register's counts are absent: ${JSON.stringify(counts)}`);
  return { rows: rows.length };
}

/* ─────────── /dojo: the hold snapshot, rendered only once a snapshot is served ───────────
 * Before any served snapshot there is no committed record (apps/site/data/dojo-served.json with its manifest entry, read by the
 * page's own fail-closed loader): main() then asserts that /dojo is no page (no artefact, or the not-found document Next writes with
 * status 404) and that /token renders no link to it. Once a record is committed, it asserts the built <main> of /dojo against
 * dojoExpected(): the closed list of figures of the record's state, composed HERE from the record (never through the page's figures
 * module), each as often as the list carries it; no other number (the names SHA-256 and Ed25519 aside, and no date or identifier
 * exemption: a day of the history is a number outside the list); the sentences of that state from lib/dojo-copy.ts and none of the
 * other states'; the tier names of the closed list; no forbidden word; the pill "Dōjō <status>" of lib/dojo-register.ts. */
export const DOJO_HTML_REL = "apps/site/.next/server/app/dojo.html";
export const DOJO_META_REL = "apps/site/.next/server/app/dojo.meta";
export const TOKEN_HTML_REL = "apps/site/.next/server/app/token.html";
/** The two names whose digits the texts of /dojo carry. */
export const DOJO_NAMED_IDS = ["SHA-256", "Ed25519"];
/** The tier names, a closed list in this order, held here apart from the page's constant. */
export const DOJO_TIER_NAMES = ["Egg", "Caterpillar", "Chrysalis", "Monarch", "Migration"];
/** Words /dojo never renders (whole words, any case): the refusals of its closed lexicon, "thirty" and "independent"; and, until they are
 *  done, the claims put after the first publication: a Bitcoin timestamp, a check of the beacon's BLS signature (last line of the list). */
export const DOJO_FORBIDDEN = [
  /\bagents?\b/i, /\brewards?\b/i, /\bearn(?:s|ing|ings)?\b/i, /\bairdrops?\b/i, /\byields?\b/i, /\beligible\b|\beligibility\b/i, /\brights?\b/i,
  /\bentitle(?:s|d|ment)?\b/i, /\bsoon\b/i, /\bcoming\b/i, /\blive\b/i, /\bguarantee[sd]?\b/i, /\bverified\b/i, /\bproven\b/i,
  /\bcertified\b/i, /\btrustless\b/i, /\btamper[- ]?proof\b/i, /\bat a point in time\b/i, /\breal[- ]?time\b/i, /\brank(?:s|ed|ing|ings)?\b/i,
  /\bleaderboards?\b/i, /\btop holders\b/i, /(?<!\bhold )\bscores?\b/i, /\binferences?\b/i, /\bbudgets?\b/i, /\bNFTs?\b/i, /\bdollars?\b/i,
  /\bUSD\b/i, /\$/, /\bbuy(?:s|ing)?\b/i, /\bsell(?:s|ing)?\b/i, /\bthirty\b/i, /\bindependent(?:ly)?\b/i,
  /bitcoin/i, /time[- ]?stamp/i, /(?<![a-z0-9_])bls(?![a-z0-9_])/i,
];

/** Assert the built /dojo <main> against `expected` (dojoExpected): the figures of its closed list exactly, no other number, the
 *  sentences of its state and none of the others', the tier names, no forbidden word, no {name} left unfilled, the register's status on the pill. Pure,
 *  built-ins only; throws on any failure (vacuity-guarded, fail-closed). */
export function assertDojoBody({ html, expected }) {
  const blank = (s) => typeof s !== "string" || s.trim().length === 0;
  if (typeof html !== "string" || expected === null || typeof expected !== "object") throw new Error("assert-dojo: html must be a string and expected an object (vacuity guard)");
  const { state, figures, sentences, absentSentences, tierNames, status } = expected;
  if (!["E1", "E2", "EA"].includes(state)) throw new Error(`assert-dojo: no /dojo page is asserted in state ${JSON.stringify(state)} (fail-closed)`);
  if (!Array.isArray(figures) || figures.length === 0 || figures.some((f) => f === null || typeof f !== "object" || blank(f.value) || blank(f.source)))
    throw new Error("assert-dojo: expected.figures is empty or holds a blank value or source (vacuity guard)");
  if (![sentences, absentSentences].every((l) => Array.isArray(l) && l.length > 0 && !l.some(blank)) || blank(status))
    throw new Error("assert-dojo: expected.sentences, expected.absentSentences or expected.status is empty (vacuity guard)");
  if (!Array.isArray(tierNames) || tierNames.join("|") !== DOJO_TIER_NAMES.join("|"))
    throw new Error(`assert-dojo: the tier names are not the closed list, in its order: ${JSON.stringify(tierNames)}`);
  const body = renderedBody(html), mainHtml = extractMain(body), open = /<main\b[^>]*>/i.exec(body)?.[0] ?? "";
  const corpus = mainCorpus(open + mainHtml), parts = mainTextAndAttrs(open + mainHtml);
  // (1) the sentences of the state, whole; none of another state's (its longest fixed part).
  for (const s of sentences) if (!corpus.includes(s)) throw new Error(`assert-dojo: a sentence of state ${state} is absent from the /dojo <main>: ${JSON.stringify(s)}`);
  for (const s of absentSentences) if (corpus.includes(s)) throw new Error(`assert-dojo: a sentence of another state is rendered in state ${state}: ${JSON.stringify(s)}`);
  // (2) each tier name exactly as often as those sentences carry it (a name rendered elsewhere, or dropped, reds).
  for (const n of tierNames) {
    const want = sentences.join("\n").split(n).length - 1, got = corpus.split(n).length - 1;
    if (got !== want) throw new Error(`assert-dojo: the tier name ${n} occurs ${String(got)} time(s) in the /dojo <main> (expected ${String(want)})`);
  }
  // (3) each figure value exactly as often as the closed list carries it, as a bounded occurrence of the text nodes (never an
  // attribute), longest first, in the text reduced by the two names (a count of 256 beside SHA-256) and by the longer values.
  const unnamed = (t) => DOJO_NAMED_IDS.reduce((x, id) => x.split(id).join(" "), t);
  let rest = unnamed(parts.text);
  const sourcesOf = new Map();
  for (const f of figures) sourcesOf.set(f.value, [...(sourcesOf.get(f.value) ?? []), f.source]);
  for (const [value, sources] of [...sourcesOf].sort((a, b) => b[0].length - a[0].length)) {
    const hits = boundedOccurrences(rest, value);
    if (hits.length !== sources.length)
      throw new Error(`assert-dojo: the figure ${JSON.stringify(value)} (${sources.join(", ")}) occurs ${String(hits.length)} time(s) as a bounded occurrence in the text of the /dojo <main> (expected ${String(sources.length)})`);
    for (const i of hits.reverse()) rest = rest.slice(0, i) + " " + rest.slice(i + value.length);
  }
  // (4) no other number, in the reduced text or a visible attribute (the <main> tag's own included); the two forms the scan cannot read are refused first.
  if (/&(?:lt|gt|#0*6[02]|#x0*3[ce]);/i.test(extractMain(stripHiddenSurfaces(html))))
    throw new Error("assert-dojo: an angle bracket written as an entity in the /dojo <main> would hide the text after it from the numeric scan (fail-closed)");
  if (/(?![0-9])\p{N}/u.test(corpus)) throw new Error("assert-dojo: a number written with non-ASCII digits in the /dojo <main> escapes the numeric scan (fail-closed)");
  const stray = `${rest} ${unnamed(parts.attrs.join(" "))}`.match(/\d+(?:[.,]\d+)*/g) ?? [];
  if (stray.length > 0) throw new Error(`assert-dojo: ${String(stray.length)} numeric token(s) rendered in the /dojo <main> outside the closed list of figures: ${JSON.stringify(stray)}`);
  // (5) no forbidden word, no {name} of the closed list left unfilled; (6) the pill: the program's name, then the register's status.
  const word = DOJO_FORBIDDEN.find((re) => re.test(corpus));
  if (word !== undefined) throw new Error(`assert-dojo: a forbidden word is rendered in the /dojo <main>: ${String(word)}`);
  if (/[{][a-z_]+[}]/.test(corpus)) throw new Error("assert-dojo: a {name} of the closed list is rendered unfilled in the /dojo <main> (fail-closed)");
  if (!corpus.includes(`Dōjō ${status}`)) throw new Error(`assert-dojo: the /dojo pill does not carry the register's status (expected "Dōjō ${status}")`);
  return { state, figures: figures.length, corpusChars: corpus.length, status };
}

/** Before any served snapshot: /dojo is no page (no artefact, or the not-found document Next writes with status 404, without a
 *  <main>) and /token renders no link to it. Pure; throws on failure. */
export function assertDojoAbsent({ dojoHtml, dojoMeta, tokenHtml }) {
  if (typeof tokenHtml !== "string" || tokenHtml.trim().length === 0) throw new Error("assert-dojo: the built /token page is empty (vacuity guard)");
  if (dojoHtml !== null || dojoMeta !== null) {
    let status;
    try { status = JSON.parse(String(dojoMeta)).status; } catch { status = undefined; }
    if (status !== 404) throw new Error(`assert-dojo: a /dojo page was rendered before any served snapshot (status ${String(status)}, not 404)`);
    if (/<main\b/i.test(renderedBody(dojoHtml ?? ""))) throw new Error("assert-dojo: the not-found /dojo document carries a <main> before any served snapshot");
  }
  if (/href\s*=\s*["']?(?:https?:)?(?:\/\/[^/"'\s>]*)?\/dojo(?=["'\s/?#>]|$)/i.test(renderedBody(tokenHtml))) throw new Error("assert-dojo: /token links to /dojo before any served snapshot");
  return { page: dojoHtml === null && dojoMeta === null ? "absent" : "the not-found document (status 404)" };
}

/** What main() asserts on /dojo, read from the site's own modules and the committed record (never typed here): the record under
 *  `dataRoot` through the page's fail-closed loader ({ state: "E0" } without one); its figures composed here, apart from the page's
 *  figures module; the sentences of its state (the others' by their longest fixed part) and the tier names from lib/dojo-copy.ts;
 *  the status from the register constant of lib/dojo-register.ts, read apart from the function the page calls. */
export async function dojoExpected(dataRoot = REPO_ROOT) {
  const lib = (f) => import(pathToFileURL(join(REPO_ROOT, "apps", "site", "lib", f)).href);
  const [{ loadDojoServed }, copy, { DOJO_REGISTER }] = await Promise.all([lib("dojo-served-load.ts"), lib("dojo-copy.ts"), lib("dojo-register.ts")]);
  const data = loadDojoServed(dataRoot);
  if (data === null) return { state: "E0" };
  const h = data.head, T = copy.DOJO_TEXT, counted = h.status === "counted", versioned = h.price_version !== null;
  const e2 = counted && versioned, holders = h.holders_count === 1 ? T.holder : T.holders; // one holder: the singular sentence
  const tokens = (raw) => {
    const p = raw.padStart(h.decimals + 1, "0"), c = p.length - h.decimals, whole = p.slice(0, c).replace(/^0+(?=\d)/, "");
    return h.decimals === 0 ? whole : `${whole}.${p.slice(c)}`;
  };
  const f = !counted ? { day: h.day, ...(versioned ? { threshold_unit_token_days: tokens(h.threshold_unit) } : {}) } : { day: h.day, reads_done: String(h.reads_done), k_reads: String(h.k_reads), slot_min: String(h.slot_min), slot_max: String(h.slot_max),
    lines_count: String(h.lines_count), root: h.root, score_total: tokens(h.score_total), validated_total: tokens(h.validated_total),
    ...(versioned ? { threshold_unit_token_days: tokens(h.threshold_unit), holders_count: String(h.holders_count), dust_threshold_tokens: tokens(h.dust_threshold) } : {}) };
  // The anchor's figures, read here from the anchor in force: validation window (method, every state), Migration window (tier sentence, E2).
  const A = data.timeline.anchor, anchor = { validation_days: String(A.validation_days), ...(e2 ? { migration_days: String(A.tier_windows[4]) } : {}) };
  const all = { ...f, ...anchor };
  const shown = [T.lead, counted ? T.counted : T.abstained, versioned ? T.tiers : T.noVersion, T.method, T.retro, T.exclusion, T.bounds, T.check, T.tree, T.beacon,
    T.rereadFirst, ...(counted ? [T.totals, T.table] : []), ...(e2 ? [holders, T.tier] : []), T.foldCounted, T.foldCheck];
  const fill = (s) => s.replace(/\{([a-z_]+)\}/g, (_, k) => {
    if (!Object.hasOwn(all, k)) throw new Error(`assert-dojo: {${k}} names no figure of the record's state (fail-closed)`);
    return all[k];
  });
  const fixed = (s) => s.split(/\{[a-z_]+\}/).map((x) => x.trim()).sort((a, b) => b.length - a.length)[0];
  const figures = [...Object.entries(f).map(([k, value]) => ({ value, source: `dojo-served.json head, figure ${k}` })),
    ...Object.entries(anchor).map(([k, value]) => ({ value, source: `dojo-served.json timeline.anchor, figure ${k}` }))];
  return { state: !counted ? "EA" : versioned ? "E2" : "E1", figures,
    sentences: [copy.DOJO_TITLE, ...shown.map(fill)], absentSentences: Object.values(T).filter((s) => !shown.includes(s) && !(e2 && (s === T.holder || s === T.holders))).map(fixed),
    tierNames: [...copy.DOJO_TIER_NAMES], status: DOJO_REGISTER.pieces.find((p) => p.key === "hold-snapshot")?.status };
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
  // The pill status from the REAL fleet register (the SAME single source the page reads, C-1) and the synced served
  // state from the page's own loader: ukemiExpected() (fail-closed if Ukemi is absent or the served-state file fails).
  try {
    const r = assertUkemiBody({ html: readFileSync(ukemiAbs, "utf8"), expected: await ukemiExpected() });
    console.log(`assert-fleet-html OK — /ukemi <main>: ${String(r.figures)} figure(s) of the closed list, ${String(r.numericTokens)} numeric token outside it; ${r.registryState}-state sentence (synced served state) + conditional clause present, pill carries registry status ${JSON.stringify(r.status)}, no interval/cascade/Bell/Aave (${r.corpusChars} corpus chars, ${String(r.figureTokens)} numeric token(s) carried by the figures).`);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }

  // --- Bell: the timestamp state of the latest published record (T-3b), computed as the pages compute it ---
  const lib = (f) => import(pathToFileURL(join(REPO_ROOT, "apps", "site", "lib", f)).href);
  const [{ loadBellServed }, { loadPublicationAnchors }, reader] = await Promise.all([lib("bell-served-load.ts"), lib("bell-publications-load.ts"), lib("bell-anchors.ts")]);
  const built = (rel) => {
    const abs = join(REPO_ROOT, ...rel.split("/"));
    if (!existsSync(abs)) throw new Error(`assert-fleet-html: FAIL-CLOSED — ${rel} not found. Run \`${SITE_BUILD_RUN}\` first (never a skip).`);
    return readFileSync(abs, "utf8");
  };
  try {
    const served = loadBellServed(REPO_ROOT);
    const pubs = loadPublicationAnchors(join(REPO_ROOT, "apps", "site", "public", "bell", "anchors"), served, reader);
    const state = reader.publicationAnchorState(served.head, served.lines, pubs.bound), sentence = reader.publicationAnchorSentence(state);
    for (const rel of BELL_STATE_PAGES_REL) assertBellAnchorBody({ html: built(rel), state: state.state, sentence });
    assertBellAnchorBody({ html: built(BELL_VERIFY_REL), state: null, sentence: null });
    const rows = pubs.rows.map((x) => ({ manifest_sha256: x.manifest_sha256, ...bellStatusText(x.status) }));
    assertBellPublicationsTable({ html: built(BELL_ANCHORS_REL), rows, latest: reader.latestAnchoredLine(state.latestAnchoredSeq), counts: bellCountsText(pubs.rows.map((x) => x.status)) });
    console.log(`assert-fleet-html OK — Bell timestamp state ${JSON.stringify(state.state)}: its sentence on ${String(BELL_STATE_PAGES_REL.length)} pages and no other state's, none stated on /docs/verify, ${String(rows.length)} publication row(s) with the status read from the proof, the latest-anchored line as computed.`);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }

  // --- /dojo: before any served snapshot, no page and no link on /token; after it, the built <main> against the committed record ---
  const maybe = (rel) => (existsSync(join(REPO_ROOT, ...rel.split("/"))) ? readFileSync(join(REPO_ROOT, ...rel.split("/")), "utf8") : null);
  try {
    const expected = await dojoExpected(), tokenHtml = built(TOKEN_HTML_REL);
    if (expected.state === "E0") {
      const r = assertDojoAbsent({ dojoHtml: maybe(DOJO_HTML_REL), dojoMeta: maybe(DOJO_META_REL), tokenHtml });
      console.log(`assert-fleet-html OK — /dojo: no served snapshot; /dojo is ${r.page} and /token renders no link to it.`);
    } else {
      const r = assertDojoBody({ html: built(DOJO_HTML_REL), expected }), meta = maybe(DOJO_META_REL), tokenMain = extractMain(renderedBody(tokenHtml));
      if (meta !== null && JSON.parse(meta).status === 404) throw new Error("assert-dojo: /dojo was built as the not-found page although a snapshot is served");
      if (!/href="\/dojo"/.test(tokenMain) || !mainCorpus(tokenMain).includes(expected.sentences[0])) throw new Error("assert-dojo: /token does not link to /dojo under its title although a snapshot is served");
      console.log(`assert-fleet-html OK — /dojo ${r.state}: ${String(r.figures)} figure(s) of the closed list, each as often as listed, no other number; the sentences of the state, the tier names, no forbidden word, pill ${JSON.stringify(r.status)}; /token links to it.`);
    }
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }
}

// Run-guard (mirrors scripts/grep-forbidden.mjs, scripts/export-public.mjs): the CLI runs only when invoked
// directly (node scripts/assert-fleet-html.mjs), NEVER on import — so the test imports the pure function
// without touching fleet.ts or the filesystem.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
