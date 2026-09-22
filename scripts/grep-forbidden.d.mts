// scripts/grep-forbidden.d.mts — type surface for the pure vocab-scan functions that
// scripts/grep-forbidden.mjs exports (behind a run-guard). It lets the root type-checked test
// (test/ci-gates.test.ts) import compilePatterns/scanText WITHOUT executing the CLI, staying free of
// the ratcheted no-unsafe rules. Runtime implementation = grep-forbidden.mjs; Node ignores this file.
export interface VocabRule {
  re: string;
  why: string;
}
export interface CompiledRule {
  re: RegExp;
  why: string;
}
export interface VocabHit {
  line: number;
  why: string;
  text: string;
  /** The matched span (A-9-OUTILLE: the CLI names file:line:word). */
  word: string;
}

/** Compile {re, why} rule strings into {re: RegExp('i'), why}. */
export function compilePatterns(banned: VocabRule[] | undefined): CompiledRule[];

/** Scan text line-by-line for `patterns` after masking the closed `exemptPhrases`. Pure. */
export function scanText(
  text: string,
  patterns: CompiledRule[],
  exemptPhrases?: string[],
): VocabHit[];

/** One resolved scan target: a file, the compiled patterns to apply, and its closed exempt phrases. */
export interface VocabTarget {
  f: string;
  patterns: CompiledRule[];
  exemptPhrases: string[];
}

/** Resolve every scan target under `root` from the parsed vocab config. Walks the tree (readdir/stat),
 *  reads no file contents. `cliArgs` add GLOBAL-only targets. Used by the CLI and the load-bearing tests. */
export function collectTargets(root: string, config: unknown, cliArgs: readonly string[]): VocabTarget[];
