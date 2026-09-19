// scripts/lang-gate.d.mts — type surface for the pure, run-guarded routing helpers that
// scripts/lang-gate.mjs exports, so the root type-checked test (test/lang-gate-routing.test.ts,
// checkpoint-2 V-1) can import `classifyScope`/`SCOPES` WITHOUT executing the CLI and stay free of the
// ratcheted no-unsafe rules (same precedent as scripts/export-public.d.mts / scripts/grep-forbidden.d.mts).
// Runtime implementation = lang-gate.mjs (byte-untouched: those two symbols are already exported there);
// Node ignores this declaration file. Governance-only: this .d.mts is NOT whitelisted for the public
// export — no exported .ts imports lang-gate.mjs (measured 2026-09-19).

/** The closed list of gate scope names (root, contracts, schemas, …, site, harness, skills, sentinel, bell). */
export const SCOPES: readonly string[];

/** Map a repo-relative path (POSIX or Windows separators) to its gate scope name. Pure, no I/O. */
export function classifyScope(rel: string): string;

// Added for the CRA-B root test notification_procedure_declares_clocks (Lot CRA-B, C-4): the real
// language oracle over docs/PROCEDURE-notification-CRA.md (lang-gate CLI skips docs/, so the test runs
// the gate's own scanner directly). Runtime impl already exports both symbols from lang-gate.mjs.
/** One French-language hit: 1-based line/column, the matched word, and its kind (diacritic|fr-word|fr-id). */
export interface LangHit { line: number; col: number; word: string; kind: string; }
/** Compiled exemptions from <dir>/scripts/lang-exempt.json: masking regexes + whole-file path matchers. */
export interface Exemptions { maskers: RegExp[]; pathMatchers: RegExp[]; raw: unknown; }
/** Compile the exemption maskers + path matchers from <dir>/scripts/lang-exempt.json. */
export function loadExempt(dir: string): Exemptions;
/** Scan a file for non-exempt French hits (exempt-aware). Pure read; no process exit. */
export function scanFile(abs: string, maskers: RegExp[]): LangHit[];
