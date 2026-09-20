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
  dormantAppTests: string[];
  missingRequired: string[];
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
