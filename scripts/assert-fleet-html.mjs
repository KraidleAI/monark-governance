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

/** Isolate the RENDERED text body: strip every `<script>`, `<noscript>` and `<template>` block (attributes
 *  tolerated, case-insensitive) and React's `<!-- -->` comment markers, then decode entities. The inline RSC
 *  `<script>` payload carries the notes with LITERAL apostrophes (the false-green source), and a note living
 *  only inside a hidden `<noscript>`/`<template>` is likewise NOT rendered. Fail-closed on an UNCLOSED
 *  `<script>` (no matching `</script>`): its payload would otherwise leak into the body. */
export function renderedBody(html) {
  // Strip balanced <script> blocks FIRST (attributes + case tolerated via [^>]* and the gi flag), then the
  // other hidden surfaces, then <!-- --> markers: a `<!--` inside a payload cannot then pair with a `-->` in
  // the body and eat rendered text. (Next escapes `<` as an entity in inline scripts, so there is no bug on
  // today's artefact - measured - but this order is the robust one.)
  const noScript = String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  // Fail-closed: a `<script` opening that survived the balanced strip has no `</script>`, so its inline
  // payload (notes with LITERAL apostrophes) would leak into the body and a broken build could pass on the
  // payload alone (a false GREEN, G0 finding 8). Throw rather than let it through.
  if (/<script\b/i.test(noScript))
    throw new Error("assert-fleet-html: an unclosed <script> tag survived stripping (no matching </script>) - fail-closed");
  const noHidden = noScript
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");
  const noComments = noHidden.replace(/<!--[\s\S]*?-->/g, "");
  return decodeEntities(noComments);
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
