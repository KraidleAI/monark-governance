// scripts/test-count-check.d.mts: the type surface of scripts/test-count-check.mjs (TEST-COUNT-FLOOR-1), for test/test-count-check.test.ts; not exported.
import type { Run } from "./test-count-floor.mjs";
export const REMOVALS: string;
export function recordProblems(run: Run, record: Record<string, number>, names?: Record<string, string[]>): string[];
/** names: the base's names record (null or absent: judged by counts), the head's, and the pull request's own number in CI. */
export function dropProblems(baseRecord: Record<string, number>, record: Record<string, number>, baseList: unknown[], list: unknown[],
  names?: { base?: Record<string, string[]> | null; head?: Record<string, string[]>; pr?: string }): string[];
