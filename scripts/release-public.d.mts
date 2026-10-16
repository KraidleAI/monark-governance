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

/** Re-exported from public-text-deny.mjs: the French language gate and the GLOBAL + site/skills/bell vocab bans;
 *  empty/whitespace -> ok:false. Reads only committed config; no writes, no network, no process.exit. */
export function checkReleaseText(text: string): ReleaseTextResult;

/** ok iff headRef === 'main' && porcelain === '' (no origin/main variant, ADR-M010 B-2). Pure. */
export function branchGuard(headRef: string, porcelain: string): BranchGuardResult;

/** ok iff `blockers` (pendingSendBlockers of export-public.mjs on the kept set) is empty; the reason names each blocker.
 *  Pure (RELEASE-PREFLIGHT-SEND-GUARD-1). */
export function sendGuard(blockers: readonly string[]): BranchGuardResult;

/** The local gates [name, command], in order, export:check last (ADR-PUBLIC-CADENCE-1 D1.4); frozen, pinned by the tests. */
export const LOCAL_GATES: ReadonlyArray<readonly [string, string]>;

/** SYNC-CHECK-MODE-1: the site capture tools whose --check the preflight runs (export-public.mjs's closed list). */
export const CAPTURE_CHECKS: readonly string[];
/** One capture check: the tool, its exit (null: no exit reached), its stderr; the default runner adds the child's arguments. */
export interface CaptureCheckRun { tool: string; exit: number | null; stderr: string; args?: string[] }
export type RunCheck = (opts: { root: string; tool: string }) => CaptureCheckRun;
/** `node scripts/<tool> --check` as a child under `root`, output captured. */
export function defaultRunCheck(opts: { root: string; tool: string }): CaptureCheckRun & { args: string[] };
/** The problems of the five capture checks run through `runCheck`; never aborts. */
export function capturePreflight(opts: { root: string; runCheck?: RunCheck }): string[];
/** RELEASE ABORTED (exit 1) on any problem of capturePreflight; returns otherwise. */
export function captureGate(opts: { root: string; runCheck?: RunCheck }): void;
