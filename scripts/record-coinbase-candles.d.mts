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
}

/** manifest.json of one recording or replay. */
export interface SeriesManifest {
  schema: string;
  mode: "record" | "replay";
  platform: string;
  endpoint: string;
  product: string;
  granularity: string;
  granularity_s: number;
  start: string;
  end_exclusive: string;
  expected: number;
  rows: number;
  missing: number;
  duplicates_removed: number;
  discarded_before_start: number;
  margin_at_start: number;
  margin_at_end: number;
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
export function windowCount(start: number, end: number, granularity?: string): number;
export function guardEnv(env: Record<string, string | undefined>, execArgv: readonly string[]): void;
export function guardOut(out: string): void;
export function checkHost(url: string): void;
export function run(argv: readonly string[], io?: RecorderIo): Promise<SeriesManifest>;
export function main(argv: readonly string[], io?: RecorderIo): Promise<number>;
