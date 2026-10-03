// scripts/compare-coinbase-passes.d.mts -- type surface of scripts/compare-coinbase-passes.mjs for the type-checked root test
// (test/compare-coinbase-passes.test.ts). Runtime implementation = compare-coinbase-passes.mjs; Node ignores this file. Neither file is
// in the export whitelist (scripts/export-public.mjs): the comparison of the series stays out of the public tree.
export const SCHEMA: string;
export const SERIES_SCHEMA: string;
export const STOPS: readonly string[];

/** The digests of one pass: its SHA256SUMS (every byte of its folder) and its CSV. */
export interface PassDigests {
  sums_sha256: string;
  csv_sha256: string;
}

/** The closed output of a comparison that found no difference: the month, counts and digests, never a value of the series. */
export interface PassesResult {
  ok: true;
  schema: string;
  product: string;
  granularity: string;
  start: string;
  end_exclusive: string;
  slots: number;
  both: number;
  neither: number;
  pass_1: PassDigests;
  pass_2: PassDigests;
  compare_sha256: string;
}

export function parseArgs(argv: readonly string[]): string[];
export function run(argv: readonly string[]): PassesResult;
export function main(argv: readonly string[], io?: { print?: (line: string, toStderr: boolean) => void }): number;
