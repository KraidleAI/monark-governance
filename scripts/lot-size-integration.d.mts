// scripts/lot-size-integration.d.mts -- type surface of scripts/lot-size-integration.mjs (lot R25-INTEGRATION-RULE-1) for the root
// test, free of the ratcheted no-unsafe rules (red-proof.d.mts precedent). Node ignores this file.
export interface PrId { number: number; head_ref: string; head_repo: string; base_ref: string; base_repo: string; head_sha: string }
export interface Merged { number: number; base_ref: string; merged_at: string | null; merge_commit_sha: string; head_sha: string; r25: string | null }
export interface Proof { schema: string; repo: string; pr: PrId; base_sha: string | null; head_sha: string; complete: boolean; merged: Merged[] }
export type Mode = "unproven" | "written" | "gate-files" | "integration" | "error";
export const REPO: string;
export const SCHEMA: string;
export const R25_DIFF_RE: RegExp;
export const BINARY_ASSETS: string[];
export const ATTRIBUTES: string;
export function specsOf(ciText: string): string[][];
export const ASSET_MAGIC: Record<string, string[]>;
export function refusals(cwd: string, base: string, specs: string[][]): string[];
export const LINE_MAX: number;
export const LONG_LINE_PATHS: Record<string, string>;
export const PNG_CHUNKS: string[], PNG_SIZES: Record<string, number | (number | null)[]>, PNG_REPEAT: string[], PNG_INFLATE_MAX: number, JPEG_SEGMENTS: number[], TTF_TABLES: string[], OTS_CALENDARS: string[], OTS_OPERAND_MAX: number;
export const ASSET_STRUCTURE: Record<string, (b: Buffer) => string | null>;
export function effective(a: { cwd: string; ciText: string; base: string; proof: unknown; written: number[] }): { mode: Mode; code: number; content: number; detail: string[] };
export function buildProof(a: { api: (path: string, deadline: number) => Promise<unknown>; cwd: string; pr: unknown; base?: string; deadline?: number }): Promise<Proof>;
