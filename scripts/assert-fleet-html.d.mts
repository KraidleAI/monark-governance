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
/** Strip `<script>`/`<noscript>`/`<template>` blocks (attributes + case tolerated) and comments (closed where a browser
 *  closes them, `<!-->` and `--!>` included) in one document-order pass, then decode entities: the rendered body.
 *  Throws (fail-closed) on an unclosed hidden block or comment, on a comment span holding a hidden-surface or raw-text
 *  opener, on a raw-text element (style, title, textarea...) left unclosed or holding a hidden-surface opener (in a
 *  template, a template closer too), on <template> nesting deeper than 256 levels, and on a `<script` or `<!--` left in
 *  the output. */
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
/** A figure of the closed list /ukemi may render: its exact string and where the check read it. */
export interface UkemiFigure {
  value: string;
  source: string;
}
/** The expectations of the built /ukemi page: the synced served state, the sentences it binds and its closed list of figures. */
export interface UkemiExpected {
  registryState: "empty" | "committed";
  emptyRegistrySentence: string;
  committedStateSentence: string;
  conditionalSentence: string;
  status: string;
  /** Empty while the registry is empty; else n, the bound margin, the digest and the day, read from the committed files. */
  figures: ReadonlyArray<UkemiFigure>;
}
/** Assert the rendered /ukemi <main> carries each figure of the closed list exactly once (bounded, in the text nodes) and
 *  no other number, the sentence of the synced served state (and never the other state's), the conditional clause and
 *  the registry-status pill ("Ukemi <status>"), with no interval/cascade/Bell/Aave; throws on failure (vacuity-guarded).
 *  `expected.status` is the real FLEET_AGENTS Ukemi status (C-1, kills mutant X5). */
export function assertUkemiBody(args: {
  html: string;
  expected: UkemiExpected;
}): { mainChars: number; corpusChars: number; numericTokens: number; figures: number; figureTokens: number; status: string; registryState: "empty" | "committed" };
/** What main() asserts on the built /ukemi page: the served state of the served-state file under `dataRoot` (default the
 *  repo root) through the page's own loader, the sentences of lib/ukemi-copy.ts, the pill status of lib/fleet.ts, and the
 *  closed list of figures from the served-state file and the course report through their loaders. */
export function ukemiExpected(dataRoot?: string): Promise<UkemiExpected>;

/* ── Bell: the timestamp state of the latest published record (T-3b) ── */
/** The built pages that state it, the verification page (states none), the anchors page (the publications table). */
export const BELL_STATE_PAGES_REL: string[];
export const BELL_VERIFY_REL: string;
export const BELL_ANCHORS_REL: string;
/** A fragment each state's sentence carries and no other state's does. */
export const BELL_STATE_PRIMERS: { none: string; pending: string; anchored: string };
/** The two D8 clauses an anchored sentence must carry, as literals of the script. */
export const BELL_ANCHORED_CLAUSES: string[];
/** The counts line of the publications section, recomputed from each row's status (null: no proof). */
export function bellCountsText(statuses: ReadonlyArray<{ bitcoinHeights: number[]; pendingCalendars: string[] } | null>): string;
/** Assert the rendered <main> carries the sentence of `state` and no other state's primer (state null: none at all); throws on failure. */
export function assertBellAnchorBody(args: { html: string; state: "none" | "pending" | "anchored" | null; sentence: string | null }): { state: string | null; corpusChars: number };
/** The status label and detail the anchors tables render for a row, recomputed from the proof's status. */
export function bellStatusText(status: { bitcoinHeights: number[]; pendingCalendars: string[] } | null): { label: string; detail: string };
/** Assert each publication row renders its status label and detail beside its manifest digest, and the latest-anchored line; throws. */
export function assertBellPublicationsTable(args: { html: string; rows: ReadonlyArray<{ manifest_sha256: string; label: string; detail: string }>; latest: string; counts: string }): { rows: number };

/* ── /dojo: the hold snapshot, rendered only once a snapshot is served ── */
/** The built /dojo artefact and its metadata, and the built /token artefact, relative to the repo root. */
export const DOJO_HTML_REL: string;
export const DOJO_META_REL: string;
export const TOKEN_HTML_REL: string;
/** The two names whose digits the texts of /dojo carry: SHA-256 and Ed25519. */
export const DOJO_NAMED_IDS: readonly string[];
/** The tier names, the closed list in its order, held apart from the page's constant. */
export const DOJO_TIER_NAMES: readonly string[];
/** Words /dojo never renders (whole words, any case). */
export const DOJO_FORBIDDEN: readonly RegExp[];
/** A figure of the closed list /dojo renders: its exact string and where the check read it. */
export interface DojoFigure { value: string; source: string }
/** What main() asserts on /dojo for the state of the committed record ("E0": no record, so no page). */
export type DojoExpected =
  | { state: "E0" }
  | { state: "E1" | "E2" | "EA"; figures: ReadonlyArray<DojoFigure>; sentences: string[]; absentSentences: string[]; tierNames: string[]; status: string };
/** Assert the built /dojo <main> against `expected`; throws on failure (vacuity-guarded, fail-closed). */
export function assertDojoBody(args: { html: string; expected: Exclude<DojoExpected, { state: "E0" }> }): { state: string; figures: number; corpusChars: number; status: string };
/** Before any served snapshot: no /dojo page (none, or the not-found document with status 404) and no link to it on /token; throws. */
export function assertDojoAbsent(args: { dojoHtml: string | null; dojoMeta: string | null; tokenHtml: string }): { page: string };
/** The expectations of /dojo from the committed record under `dataRoot` (default the repo root); throws fail-closed. */
export function dojoExpected(dataRoot?: string): Promise<DojoExpected>;
