// scripts/mission/lint.d.mts - type surface of scripts/mission/lint.mjs for the root test test/mission-lint.test.ts
// (precedent: scripts/lang-gate.d.mts). Node ignores this file; governance-only, not exported.

/** One hit: the rule code, the 1-based line of the mission, a short extract. */
export interface LintHit { code: string; line: number; extract: string; }
/** The verdict, the count per code, the hits by line, the full sha of the pinned base (null if none), the cited short shas. */
export interface LintResult { verdict: "vert" | "rouge"; counts: Record<string, number>; hits: LintHit[]; base: string | null; shas: string[]; }
/** The closed rule codes, in report order. */
export const CODES: readonly string[];
/** The allowed tiers (decision 267). */
export const TIERS: readonly string[];
/** Lint a mission text against a worktree on disk or, with rev, the git tree of that commit. */
export function lintMission(o: { text: string; missionPath: string; repo: string; rev?: string | null }): LintResult;
/** One line per hit (`code mission:line extract`), the count per code, the verdict. */
export function formatReport(r: LintResult, missionPath: string): string;
