// scripts/mutants/run.d.mts -- type surface of scripts/mutants/run.mjs for the root test test/mutants-run.test.ts (precedent:
// scripts/mission/lint.d.mts): the record monark.mutants.v1 read typed, free of the ratcheted no-unsafe rules. Node ignores this file.
export interface RunResult { files: string[]; status: string; strict: boolean; fails: string[]; oks: number; exit: number | null; signal: string | null; ms: number; tap_sha256: string | null }
export interface MutantRow {
  id: string; origin: "table" | "killer"; file: string | null; line: number; op: string; why: string; test: string | null; targets: string[]; status: string; strict: boolean;
  fails: string[]; oks: number; exit: number | null; ms: number; tap_sha256: string | null; sha_before: string | null; sha_after: string | null; replay: RunResult | null; note: string | null;
}
export interface MutantsRecord {
  schema: "monark.mutants.v1"; repo: string; base: string; gel: string; dirty: string | null; tool_sha256: string; tool_tree: string; table: { path: string; sha256: string } | null; killers: boolean;
  only: string[] | null; test_globs: string[]; clone: string; timeout_ms: number; min_free_mb: number; lock_root: string; start: string; end: string; sha0: Record<string, string>;
  baseline: RunResult | null; results: MutantRow[]; counts: Record<string, number>; exit: number;
}
/** The test files of testGlobs under repoRoot whose import closure (static forms, import() of a literal) holds file: the direct importers, then the others. */
export function targetsOf(repoRoot: string, file: string, testGlobs: readonly string[]): { direct: string[]; transitive: string[] };
