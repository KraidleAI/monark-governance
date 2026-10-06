// scripts/spec-publish.d.mts -- type surface of scripts/spec-publish.mjs (lot SPEC-PUBLISH-PIPELINE-1) for what the root test imports, free of
// the ratcheted no-unsafe rules (red-proof.d.mts precedent). Node ignores this file.
export type Root = "governance" | "recherches" | "previous";
export type Kind = "text" | "json" | "schema" | "policy-table";
export interface Entry { out: string; root: Root; path: string; kind: Kind; sha256: string; note?: string }
export interface Inputs { format: "spec-inputs-v1"; releases: Record<string, { previous_commit: string | null; entries: Entry[]; note?: string }> }
export interface Problem { code: string; detail: string }
type Roots = Partial<Record<Root, string>>;
export const REPO_ROOT: string;
export const WITHHELD: readonly { length: number; sha256: string }[];
export class SpecPublishError extends Error { code: string; problems: Problem[]; constructor(code: string, message: string, problems?: Problem[]) }
export function validDate(s: unknown): boolean;
export function parseInputs(raw: unknown): Inputs;
export function loadInputs(file?: string): Inputs;
export function canonicalJson(v: unknown): string;
export function vocabularyHits(text: string, withheld?: readonly { length: number; sha256: string }[]): { rule: string; line: number; word: string }[];
export function contentProblems(out: string, kind: Kind, bytes: Buffer, release?: string, carried?: boolean): Problem[];
export const VERSION_DIR: RegExp;
export function versionDir(name: string): boolean;
export function tablesIn(v: unknown, path?: string): { table: unknown; path: string }[];
export const SHORT_N: number;
export function tableRowProblems(table: unknown, fixture?: boolean): Problem[];
export function manifestText(files: readonly { path: string; bytes: Buffer }[]): string;
export function plan(o: { inputs: Inputs; release: string; date: string; roots: Roots }): { files: { path: string; bytes: Buffer }[]; problems: Problem[] };
export function listTree(dir: string, rel?: string): string[];
export function compareTrees(produced: string, published: string): { equal: string[]; differ: string[]; missing: string[]; extra: string[] };
export function produce(o: { inputs: Inputs; release: string; date: string; roots: Roots; out: string }): { files: { path: string; sha256: string; bytes: number }[]; manifest_sha256: string };
