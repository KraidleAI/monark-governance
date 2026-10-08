// scripts/test-count-check.d.mts: the type surface of scripts/test-count-check.mjs (TEST-COUNT-FLOOR-1), for test/test-count-check.test.ts; not exported.
import type { Run } from "./test-count-floor.mjs";
export const REMOVALS: string;
export function recordProblems(run: Run, record: Record<string, number>): string[];
export function dropProblems(baseRecord: Record<string, number>, record: Record<string, number>, baseList: unknown[], list: unknown[]): string[];
