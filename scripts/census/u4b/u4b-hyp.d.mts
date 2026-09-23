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
export const H4_THRESHOLD: Readonly<{ num: bigint; den: bigint }>;
export const H5_K: number;
export const H6_MAX_LAG: number;
export const H2BIS_INTERIOR_N: number;
export const VERDICTS: readonly string[];
export const REFERENCE_REL: string;
export const REFERENCE_SHA256_LF: string;
export const PREREG_REL: string;
export const PREREG_SHA256_LF: string;
export const FORBIDDEN_FLAGS: readonly string[];
export const SUMMARY_TEMPLATES: Readonly<Record<string, string>>;

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

export interface MedianJson { median: RatJson; lower_middle: RatJson; upper_middle: RatJson }
export interface H4Summary {
  liquidated: number; multi_call: number; multi_call_fraction: RatJson | null;
  sum_y: string; sum_after_first: string; sum_deficit_apart: string;
  share_sum: RatJson | null; share_median: MedianJson | null;
  multi_call_subset: { n: number; share_sum: RatJson | null; share_median: MedianJson | null };
}
export interface H4Result {
  threshold: string;
  class_a_liquidated: { n: number; multi_call: number; fraction: RatJson | null; verdict: "OUI" | "NON" | null };
  all_liquidated: { n: number; multi_call: number; fraction: RatJson | null; verdict: "OUI" | "NON" | null };
  reconciliation: { positions_reconciled: number; positions_abstained: number; calls_in_window: number; calls_not_in_window: number };
  accounts_abstained: number;
  pooled: H4Summary;
  strata: Array<H4Summary & { strate: number }>;
}
export function computeH4(inputs: ReadonlyArray<Record<string, unknown>>, realized: ReadonlyArray<Record<string, unknown>>, fresh: ParsedScores, eventId: string): H4Result;

export interface H6Classes {
  n: number; in_events: number; equal_to_p0: number; outside: number;
  lag_histogram: Record<string, number>; matched_on_anchor: number; max_lag: number | null;
  lag_over_bound: number; lag_undefined: number;
  violations: Array<{ block: number; value: string; lag: number | null }>;
}
export interface H6Result {
  verdict: "OUI" | "NON";
  max_lag_bound: number;
  anchor: { block: number; price: string; source: string; book_fallback_d_n_path: boolean };
  series: { n_updates: number; monotone_blocks: boolean; phase_change: boolean };
  served_price_lines: number;
  served_null_values: number;
  served_blocks: H6Classes;
  price_at_call_block: H6Classes;
  bracket_condition_all_served_in_events_or_p0: boolean;
  min_served: string | null;
  min_events: string | null;
  sample_note: string;
}
export function computeH6(inputs: ReadonlyArray<Record<string, unknown>>, oracleLines: ReadonlyArray<Record<string, unknown>>, eventId: string): H6Result;

export interface LabelsResult { label_lines: number; labels_no_quorum_unresolved: number; residual_no_quorum: number; deficit_base_no_price_non_usdt: number; other_event_lines: number }
export function computeLabels(realized: ReadonlyArray<Record<string, unknown>>, eventId: string): LabelsResult;

export interface CensusHyps {
  h2: { strata: Array<{ strate: number; n: number; n_min: number; under_calib: boolean }> };
  h2bis: { strata: Array<{ strate: number; n: number; p: number | null; qhat: string | null; interior: boolean; n_ge_199: boolean; qhat_is_stratum_max: boolean }> };
  q0_rule_failures: { crossed_yhat_zero: number; yhat_zero_liquidated: number; without_crossing: Array<{ address: string; y: string }>; crossed_yhat_zero_liquidated: Array<{ address: string; y: string; pstar: string }> };
  h5: { population_mono_weth: number; k_h5: number; meets_k_h5: boolean; class_a_n: number };
  h7: { pstar_is_anchor: number };
}
export function computeCensusHyps(fresh: ParsedScores): CensusHyps;

export interface Clause359 { h3_no_NON_on_served_strata: boolean; labels_no_quorum_unresolved: number; condition_satisfied: boolean; h3_pooled_verdict_outside_condition: H3Verdict }
export function clause359(h3: H3Result, labels: LabelsResult): Clause359;

export interface ReportBody extends Partial<CensusHyps> {
  event_id: string;
  h3?: H3Result;
  h4?: H4Result;
  h6?: H6Result;
  labels?: LabelsResult;
  clause_359?: Clause359;
  summary: string[];
}
export function buildSummary(body: Omit<ReportBody, "summary"> & { summary?: string[] }, c11: string): string[];
export function canon(v: unknown): string;
export function bodyDigest(body: unknown): string;

export interface ReportDoc {
  schema: string;
  kind: "h3" | "h4" | "h6" | "report";
  provenance: { tool: { rel: string; sha256_lf: string }; node: string; inputs: Record<string, { sha256_lf: string; bytes?: number; rel?: string }>; event_id: string };
  body: ReportBody;
  body_digest: string;
}
export function parseArgs(argv: readonly string[]): { cmd: "h3" | "h4" | "h6" | "report"; opts: Record<string, string> };
export function toolSha256Lf(): string;
export function runCli(argv: readonly string[]): { out: string; kind: string; body_digest: string };
