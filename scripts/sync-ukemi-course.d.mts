// scripts/sync-ukemi-course.d.mts - type surface of what scripts/sync-ukemi-course.mjs exports (behind its run-guard), so the
// type-checked root test test/sync-check-mode.test.ts can write and check a course file under a temporary root WITHOUT running
// the CLI. Runtime implementation = sync-ukemi-course.mjs; Node ignores this file. Governance-only, NOT whitelisted for export.
export const OUT_REL: string;
export const MANIFEST_REL: string;
export const AMOUNT_UNIT: string;
export const AMOUNT_DECIMALS: number;
/** Exact decimal string of a non-negative base-currency integer with AMOUNT_DECIMALS decimals. */
export function decimal8(intString: string | bigint): string;
/** The site file of a course report (pure); throws on any check. */
export function buildSiteCourse(report: unknown, toolSha256Lf: string): Record<string, unknown>;
/** Set `rel` -> `sha` in the manifest text, refusing if the JSON round-trip would change any other byte. */
export function setManifestEntry(manifestText: string, rel: string, sha: string): string;
/** Write the site file of `report` under `root` and set its manifest entry; throws, writing nothing, on any check. */
export function writeSiteCourse(root: string, report: unknown): { site: Record<string, unknown>; sha: string };
/** --check under `root`: the manifest entry is the file's sha256 and, with a report, the file is what it composes now. */
export function courseCheckProblems(root: string, report?: unknown): string[];
