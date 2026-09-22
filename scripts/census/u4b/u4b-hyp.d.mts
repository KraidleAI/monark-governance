// Type declarations for scripts/census/u4b/u4b-hyp.mjs (lot U-4b-STATS-1: offline H-3 / H-4 / H-6 tools and the
// report feeding prereg :359). Governance surface for the type-checked test apps/sentinel/test/u4b-hyp.test.ts.
// Runtime = the .mjs; Node ignores this file.

export const ROOT: string;
export const SCHEMA: string;
export const TOOL_REL: string;
export const H3_LEVEL: Readonly<{ num: bigint; den: bigint }>;
export const CALIB_ALPHA: Readonly<{ num: bigint; den: bigint }>;
export const NMIN: number;
export const E2_MIN_N: number;
export const VERDICTS: readonly string[];
export const REFERENCE_REL: string;
export const REFERENCE_SHA256_LF: string;
export const PREREG_REL: string;
export const PREREG_SHA256_LF: string;

export class HypError extends Error {}

export interface Rat { num: bigint; den: bigint }
export interface RatJson { num: string; den: string; dec12: string }
export type H3Verdict = "OUI" | "NON" | "UNDER_CALIB" | "NON_TESTABLE_E2";

export function rat(num: bigint | number, den: bigint | number): Rat;
export function ratToDecimal(r: Rat, digits?: number): string;
export function bbDistribution(trials: number, a: number, b: number): { pmfNum: bigint[]; den: bigint };
export function bbLowerTail(trials: number, a: number, b: number, k: number): Rat;
export function rejectsAtLevel(pValue: Rat, level?: Readonly<{ num: bigint; den: bigint }>): boolean;
export function pOfN(n: number): number;

export function sha256LfOfText(text: string): string;
export function parseJsonl(text: string): Array<Record<string, unknown>>;
export function loadReferenceLines(path?: string): { lines: Array<Record<string, unknown>>; sha256_lf: string };
export function extractC11Sentence(preregText: string): string;
export function loadC11Sentence(path?: string): string;

export interface ScoreRow { address: string; y: bigint; yhat: bigint; score: bigint; liquidated: boolean; strate: number; pstar: string | null }
export interface MetaStratum { strate: number; n: number; p: number | null; qhat: string | null; calib_digest?: string; max_score?: string }
export interface MetaCellA { predictor_id: string; alpha: number; n_min: number; n: number; p: number | null; qhat: string | null; strata: MetaStratum[]; [k: string]: unknown }
export interface ParsedScores { meta: Record<string, unknown> & { cell_a: MetaCellA; census?: Record<string, number | string> }; cellA: MetaCellA; rows: ScoreRow[]; eventId: string }
export function parseScores(lines: ReadonlyArray<Record<string, unknown>>, eventId: string | null, role: string): ParsedScores;

export interface H3Cell {
  cell: string;
  strate?: number;
  verdict: H3Verdict;
  served: boolean;
  fresh: { n: number; p: number | null; qhat: string | null; qhat_is_max?: boolean };
  e2: { n: number; k_covered?: number; atoms_at_zero?: number; ties_at_qhat?: number };
  null_law?: { family: string; trials: number; a: number; b: number };
  p_value?: RatJson | null;
  level?: string;
  expected_covered?: RatJson;
  coverage_observed?: RatJson | null;
  coverage_nominal?: RatJson;
  coverage_expected_h0?: RatJson;
  shortfall_vs_expected?: RatJson;
  coverage_gap_vs_nominal?: RatJson;
  barber_thm2_bound?: string;
}
export interface H3Result {
  strata: Array<H3Cell & { strate: number }>;
  pooled: H3Cell;
  served_strata: number[];
  non_on_served_strata: number[];
  h3_no_NON_on_served_strata: boolean;
}
export function h3Cell(label: string, fresh: { n: number; p: number | null; qhat: string | null }, freshScores: readonly bigint[], e2Scores: readonly bigint[]): H3Cell;
export function computeH3(fresh: ParsedScores, reference: ParsedScores): H3Result;
