// scripts/red-proof.d.mts -- type surface of scripts/red-proof.mjs (F2P proof, ADR-METHODE-2 D2, lot M-4): the root test imports its pure
// helpers and reads RED-PROOF.json typed, free of the ratcheted no-unsafe rules (sbom.d.mts precedent). Node ignores this file.
export type Status = "pass" | "skip" | "assert-fail" | "import-fail" | "other-fail" | "missing" | "inconclusive";
export interface TapEntry { ok: boolean; name: string; skip: boolean; lines: string[] }
export interface Killer { file: string; line: number; op: string; before: string; after: string }
export interface ProofRow {
  name: string; file: string; line: number; base: Status; gel: Status; module: string | null; killer: Killer | null; killerProblem: string | null;
  verdict: "F2P" | "new-module" | "refused" | "inconclusive"; reason: string;
}
export interface DrawnKiller {
  name: string; file: string; killer: Killer; status: Status; outcome: "killed" | "stillborn" | "invalid" | "inconclusive";
  sha256_before: string; sha256_after: string; tap: { path: string; sha256: string };
}
export interface RedProof {
  schema: "red-proof-v1"; at: string; node: string; repo: string; base: string; gel: { ref: string; mode: "worktree" | "commit"; head: string; digest: string };
  files: { tests: string[]; support: string[]; added: string[]; skipped: string[] }; tests: ProofRow[]; unchanged: number;
  draw: { seed: number; requested: number; population: number; drawn: DrawnKiller[] } | null; tap: Record<"base" | "gel", { path: string; sha256: string }>; drawn: number; ok: boolean;
}
export function parseTap(tap: string): TapEntry[];
export function classify(entry: TapEntry | undefined): Status;
export function drawKillers<T>(population: readonly T[], n: number, seed: number): T[];
