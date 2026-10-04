// scripts/record-coinbase-candles.d.mts -- type surface of scripts/record-coinbase-candles.mjs for the type-checked root test
// (test/record-coinbase-candles.test.ts), which imports the recorder without running it (run-guard) and without any network (its fetch
// is injected). Runtime implementation = record-coinbase-candles.mjs; Node ignores this file. Neither file is in the export whitelist
// (scripts/export-public.mjs): the recorder and its series stay out of the public tree (the series are not redistributable).
export const ORIGIN: string;
export const HOSTS: readonly string[];
export const PRODUCTS: readonly string[];
export const GRANULARITIES: Readonly<Record<"15m", number>>;
export const WINDOW: number;
export const PAUSE_MS: number;
export const MAX_PAGES: number;
export const TIMEOUT_MS: number;
/** Bytes of one body at most (SERIES-BODY-BOUND-1): one byte more stops the run (body_too_large). */
export const BODY_MAX: number;
export const CSV_COLUMNS: readonly string[];
export const STOPS: readonly string[];

/** What a run takes from its caller instead of the process: the test seam, never a command-line flag nor a variable. */
export interface RecorderIo {
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  timeoutMs?: number;
  env?: Record<string, string | undefined>;
  execArgv?: readonly string[];
  print?: (line: string, toStderr: boolean) => void;
}

/** The parsed command line: times in ms since the epoch, the grid step in ms, paths resolved. */
export interface RecorderArgs {
  product: string;
  granularity: string;
  step: number;
  start: number;
  end: number;
  out: string;
  fromRaw: string | null;
  /** 1, or 2 for the second reading of a window: its cores shifted by half a core (ADR 0006 addendum 7 R1), from 149 slots before start
   *  to 149 slots after end (lot COINBASE-PASS-EDGES-1). */
  pass: number;
}

/** The slots that a pass 2 read outside [start, end) (lot COINBASE-PASS-EDGES-1): never written to the CSV nor to missing.json. */
export interface WitnessSlots {
  count: number;
  /** Open times (ISO 8601) of the first and of the last witness; null both when count is 0. */
  first: string | null;
  last: string | null;
}

/** manifest.json of one recording or replay. */
export interface SeriesManifest {
  /** "monark.series.coinbase.v2" since addendum 7: pass and empty_pages added, a new identifier for a new meaning (RECHERCHES Q-U5). */
  schema: string;
  mode: "record" | "replay";
  platform: string;
  endpoint: string;
  product: string;
  granularity: string;
  granularity_s: number;
  start: string;
  end_exclusive: string;
  pass: number;
  expected: number;
  rows: number;
  missing: number;
  /** Always 0 in a written manifest: an empty page stops the run (empty_page), but one of witnesses alone (empty_witness_pages). */
  empty_pages: number;
  duplicates_removed: number;
  discarded_before_start: number;
  margin_at_start: number;
  margin_at_end: number;
  /** Pass 2 alone; absent from a manifest of pass 1. */
  witness_slots?: WitnessSlots;
  /** Pass 2 alone: the empty pages whose core starts after end_exclusive, witnesses alone (rule of RECHERCHES, lot COINBASE-PASS-EDGES-1). */
  empty_witness_pages?: number;
  pages: number;
  first_open_time: string | null;
  last_open_time: string | null;
  csv: string;
  csv_sha256: string;
  missing_sha256: string;
  recorder_sha256: string;
  node: string;
  from_raw: string | null;
  started_at: string;
  finished_at: string;
  redistributable: boolean;
  terms: string;
}

/** A named stop: `code` is one of STOPS. */
export class RecorderStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

export function isoOf(ms: number): string;
export function parseTime(text: string, granularity?: string): number;
export function parseArgs(argv: readonly string[]): RecorderArgs;
export function expectedCount(start: number, end: number, granularity?: string): number;
export function windowCount(start: number, end: number, granularity?: string, pass?: number): number;
/** The first end (ms) of a core of pass 2 that is also the end of a core of pass 1, or null: end - start of 149 slots modulo 298 alone. */
export function sharedEnd(start: number, end: number, step: number): number | null;
export function guardEnv(env: Record<string, string | undefined>, execArgv: readonly string[]): void;
export function guardOut(out: string): void;
export function checkHost(url: string): void;
/** The bytes of a body read as a stream, or null once they pass BODY_MAX. */
export function readBody(res: Response): Promise<Buffer | null>;
export function run(argv: readonly string[], io?: RecorderIo): Promise<SeriesManifest>;
export function main(argv: readonly string[], io?: RecorderIo): Promise<number>;
