// scripts/assert-fleet-html.d.mts — type surface for scripts/assert-fleet-html.mjs so
// test/site-build-fleet.test.ts can import the pure function + constants under the root nodenext tsc WITHOUT
// executing the CLI (same precedent as scripts/sbom.d.mts / scripts/export-public.d.mts). Runtime impl = the
// .mjs; Node ignores this file. Governance-only: NOT whitelisted for the public export — the g3-site job runs
// `node scripts/assert-fleet-html.mjs` directly, and no exported .ts imports this module, so the exported
// tsc never needs the declaration (unlike scripts/grep-forbidden.d.mts, which apps/harness imports).

/** The exact command CI job g3-site runs to build the storefront; asserted == the g3-site build `run:` line. */
export const SITE_BUILD_RUN: string;
/** The digit-free header rendered above the served-notes list on /fleet. */
export const FLEET_HEADER: string;
/** The built artefact O-2 reads, relative to the repo root (fresh `next build` output). */
export const FLEET_HTML_REL: string;
/** The repo root resolved from this module's location. */
export const REPO_ROOT: string;

/** Decode the HTML entities React emits (numeric decimal/hex + the named set), `&amp;` last. */
export function decodeEntities(s: string): string;
/** Strip `<script>`/`<noscript>`/`<template>` blocks (attributes + case tolerated) and `<!-- -->` markers,
 *  then decode entities: the rendered body. Throws (fail-closed) on an unclosed `<script>`. */
export function renderedBody(html: string): string;
/** Assert the rendered /fleet body carries the header and each note >= 1; throws on failure (vacuity-guarded). */
export function assertFleetBody(args: {
  html: string;
  expectedHeader: string;
  expectedNotes: readonly string[];
}): { header: string; notes: number; bodyChars: number };

/* ── /ukemi extension (lot SITE-RELEASE-1 sub-lot B, voie i) — governance-only, NOT whitelisted ── */
/** The built /ukemi artefact, relative to the repo root (fresh `next build` output). */
export const UKEMI_HTML_REL: string;
/** The conditional-coverage clause that MUST ride in the served /ukemi text ("which the gate does not check"). */
export const UKEMI_CONDITIONAL_CLAUSE: string;
/** Offending numeric tokens in a plain rendered-text string; parity with honesty-lint.ts scanText(_, new Set()). */
export function scanNumericTokens(text: string): string[];
/** Inner HTML of the first <main>...</main>; throws (fail-closed) if absent or blank. */
export function extractMain(body: string): string;
/** The /ukemi <main> scan corpus: stripped text nodes + captured alt/title/aria-label values. */
export function mainCorpus(mainHtml: string): string;
/** Assert the rendered /ukemi <main> is digit-free and carries the served state + conditional clause, with no
 *  interval/cascade/Bell/Aave; throws on failure (vacuity-guarded). */
export function assertUkemiBody(args: {
  html: string;
  expected: { emptyRegistrySentence: string; conditionalSentence: string };
}): { mainChars: number; corpusChars: number; numericTokens: number };
