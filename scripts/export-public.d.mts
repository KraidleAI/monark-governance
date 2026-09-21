// scripts/export-public.d.mts — type surface for the pure, run-guarded functions/constants that
// scripts/export-public.mjs exports, so the root type-checked test (test/harness-export.test.ts, Lot H4)
// can import `collectFiles` WITHOUT executing the CLI and stay free of the ratcheted no-unsafe rules
// (same precedent as scripts/grep-forbidden.d.mts). Runtime implementation = export-public.mjs; Node
// ignores this file. Governance-only: this .d.mts is NOT whitelisted for the public export.
export interface CollectedFile {
  abs: string;
  rel: string;
}
export interface CollectResult {
  kept: CollectedFile[];
  structuralViolations: string[];
  frenchMd: string[];
  excludedTests: string[];
  excludedData: string[];
  dormantAppTests: string[];
  missingRequired: string[];
}
export interface PathHit {
  line: number;
  col: number;
  snippet: string;
}
export interface PathViolation extends PathHit {
  rel: string;
}

/** The four per-package subpaths (src, test, package.json, README.md). */
export const PACKAGE_SUBPATHS: string[];
/** apps/* exported package-style (ADR-M005 D10/Q-A): currently ["apps/harness"]. */
export const APP_PACKAGE_DIRS: string[];
/** Whole-dir whitelist entries walked recursively (schemas, fixtures, enforcement, apps/site). */
export const WHITELIST_DIRS: string[];
/** Fixed single-file whitelist entries (README.md, LICENSE, SECURITY.md, ci.yml, scripts, out/*, …).
 *  Added for the CRA-B root test product_boundary_matches_export_list (Lot CRA-B, L-4). */
export const WHITELIST_FILES: string[];

/** Resolve the whitelist to concrete files under `root`; classify structural violations & French .md.
 *  Pure (no exit): LICENSE / missing fixed entries land in `missingRequired`, they do NOT abort here. */
export function collectFiles(root: string): CollectResult;

/** The governance workflow path (".github/workflows/ci.yml"). */
export const CI_WORKFLOW_PATH: string;
/** Derive the PUBLIC storefront workflow from the governance `raw` ci.yml (D7 bis R1): add a push trigger,
 *  remove the r25 lot-size job, drop the governance-only comment; every retained job body stays byte-identical
 *  (asserted by test 42(f') / export_public_derived_jobs_are_byte_identical). Fail-closed on a missing block. */
export function derivePublicWorkflow(raw: string): string;

/** Committed config file names (fail-closed loaders below). */
export const EXCLUDE_TESTS_FILE: string;
export const EXCLUDE_DATA_FILE: string;
/** The governance-only test files excluded from the export (scripts/export-exclude-tests.json). */
export function loadExcludedTests(root: string): string[];
/** The orphan `upcoming` data files excluded from the export (scripts/export-exclude-data.json, D7 septies). */
export function loadExcludedData(root: string): string[];

/** Reader-local Windows absolute path detector (D7 septies (iii); PLI G2 C-G2-3: also a bare drive root at
 *  end of line / before whitespace; checkpoint-2 C-4: also the escaped doubled-backslash form of a JSON/JS
 *  string literal). */
export const WINDOWS_ABS_PATH_RE: RegExp;
/** Read `abs` as UTF-8 text, or null if binary (a NUL byte, or invalid UTF-8). The path guard scans TEXT
 *  by CONTENT, not an extension allowlist (PLI G2 C-G2-1). */
export function readTextOrNull(abs: string): string | null;
/** All Windows-absolute-path hits in `text` (1-based line/col + matched snippet). */
export function windowsAbsPathHits(text: string): PathHit[];
/** Windows-absolute-path violations across a resolved (kept) file list. */
export function windowsPathViolations(kept: CollectedFile[]): PathViolation[];
