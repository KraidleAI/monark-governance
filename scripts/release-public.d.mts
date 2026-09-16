// scripts/release-public.d.mts — type surface for the pure guard functions that
// scripts/release-public.mjs exports (behind a run-guard). It lets the root type-checked test
// (test/release-public.test.ts) import isSemverTag/checkReleaseText/branchGuard WITHOUT executing the CLI,
// staying free of the ratcheted no-unsafe rules. Runtime implementation = release-public.mjs; Node ignores
// this file. Neither the .mjs nor this .d.mts is whitelisted, so neither is ever exported (governance-only).
export interface ReleaseTextResult {
  ok: boolean;
  hits: unknown[];
}
export interface BranchGuardResult {
  ok: boolean;
  reason: string;
}

/** True iff `tag` is a v0.MINOR.PATCH tag (0.x only; MAJOR>=1 refused). Pure. */
export function isSemverTag(tag: string): boolean;

/** Run the in-memory text through BOTH the French language gate and the GLOBAL vocab gate;
 *  empty/whitespace -> ok:false. Reads only committed config; no writes, no network, no process.exit. */
export function checkReleaseText(text: string): ReleaseTextResult;

/** ok iff headRef === 'main' && porcelain === '' (no origin/main variant, ADR-M010 B-2). Pure. */
export function branchGuard(headRef: string, porcelain: string): BranchGuardResult;
