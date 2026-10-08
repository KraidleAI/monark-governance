// scripts/mutants/run.d.mts -- type surface of scripts/mutants/run.mjs for the root test test/mutants-run.test.ts (precedent:
// scripts/mission/lint.d.mts): the record monark.mutants.v1 read typed, free of the ratcheted no-unsafe rules. Node ignores this file.
export interface RunResult { files: string[]; status: string; strict: boolean; fails: string[]; oks: number; exit: number | null; signal: string | null; ms: number; tap_sha256: string | null;
  memory_wait_ms?: number; lock_wait_ms?: number; typecheck?: true; outside?: number; timed_out?: boolean; note?: string | null; lost?: boolean; named_kill?: boolean } // waits: a baseline (D-3, D-5);
  // typecheck, outside: a tsc run (D-2); timed_out: a node run past --timeout-ms, never replayed (MUTANTS-TOOL-2 corr, D-5, Q-C4); note: an exit code that contradicts the entries, or no entry (MUTANTS-RUN-EXIT-CODE-1);
  // lost: a node run out non-zero without a failing entry, its child alive; named_kill: a replay of a row that names its test, that test's own entry red by assertion (MUTANTS-REPLAY-PROMOTE-1)
export interface Edit { line: number; before: string; after: string }
export interface MutantRow { // targets: the graph's test files plus the --targets files, no duplicate (Q-G2-3)
  id: string; origin: "table" | "killer"; file: string | null; line: number; op: string; why: string; test: string | null; targets: string[]; status: string; strict: boolean;
  fails: string[]; oks: number; exit: number | null; ms: number; tap_sha256: string | null; sha_before: string | null; sha_after: string | null; replay: RunResult | null; note: string | null;
  edits: Edit[]; typecheck: boolean; memory_wait_ms: number | null; lock_wait_ms: number | null; // lot MUTANTS-TOOL-2: D-1, D-2, D-3, D-5
}
export interface MutantsRecord {
  schema: "monark.mutants.v1"; repo: string; base: string; gel: string; dirty: string | null; tool_sha256: string; tool_tree: string; tool_dirty: string | null;
  table: { path: string; sha256: string } | null; killers: boolean;
  only: string[] | null; test_globs: string[]; clone: string; timeout_ms: number; min_free_mb: number; lock_root: string; start: string; end: string; sha0: Record<string, string>;
  baseline: RunResult | null; results: MutantRow[]; counts: Record<string, number>; exit: number;
  wait_ms: number; poll_ms: number; baseline_typecheck: RunResult | null; stop: { reason: "memoire" | "verrou"; at: string; waited_ms: number; not_run: string[] } | null;
  test_preload: string[]; // the -r, --require and --import of the tree's test script, given to each node --test child (MUTANTS-BASELINE-UNREPORTED-1)
}
/** The test files of testGlobs under repoRoot whose import closure (static forms, import() of a literal) holds file: the direct importers, then the others. */
export function targetsOf(repoRoot: string, file: string, testGlobs: readonly string[]): { direct: string[]; transitive: string[] };
