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
/** Strip `<!-- -->` markers and `<script>...</script>` payloads, then decode entities: the rendered body. */
export function renderedBody(html: string): string;
/** Assert the rendered /fleet body carries the header and each note >= 1; throws on failure (vacuity-guarded). */
export function assertFleetBody(args: {
  html: string;
  expectedHeader: string;
  expectedNotes: readonly string[];
}): { header: string; notes: number; bodyChars: number };
