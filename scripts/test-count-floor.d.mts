// scripts/test-count-floor.d.mts: the type surface of scripts/test-count-floor.mjs (TEST-COUNT-FLOOR-1), for test/test-count-floor.test.ts
// and the gate of the second pull request; Node ignores this file. Governance-only: not exported (no exported file imports the module).
/** A run as scripts/test-counts-reporter.mjs writes it: per test file, its tests reported, whether its process sent a summary of its own, their names, and, above 0, how many of them another process ran too. */
export type Run = Record<string, { tests: number; summary: boolean; names: string[]; foreign?: number }>;
export const RUN: string, RECORD: string, NAMES: string;
export function readRun(text: string): Run;
export function runProblems(run: Run): string[];
export function recordText(record: Record<string, number>): string;
export function namesText(names: Record<string, string[]>): string;
