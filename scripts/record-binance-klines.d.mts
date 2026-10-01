// scripts/record-binance-klines.d.mts -- type surface of scripts/record-binance-klines.mjs for the type-checked root test
// (test/record-binance-klines.test.ts), which imports the recorder without running it (run-guard) and without any network (its fetch
// is injected). Runtime implementation = record-binance-klines.mjs; Node ignores this file. Neither file is in the export whitelist
// (scripts/export-public.mjs): the recorder and its series stay out of the public tree (condition C-5, series not redistributable).
export const ENDPOINT: string;
export const HOSTS: readonly string[];
export const SYMBOLS: readonly string[];
export const INTERVAL: string;
export const STEP_MS: number;
export const LIMIT: number;
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
  env?: Record<string, string | undefined>;
  execArgv?: readonly string[];
  print?: (line: string, toStderr: boolean) => void;
}

/** The parsed command line: times in ms since the epoch, paths resolved. */
export interface RecorderArgs {
  symbol: string;
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
  symbol: string;
  interval: string;
  start: string;
  end_exclusive: string;
  expected: number;
  rows: number;
  missing: number;
  duplicates_removed: number;
  pages: number;
  first_open_time: string | null;
  last_open_time: string | null;
  csv: string;
  csv_sha256: string;
  script_sha256: string;
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
export function parseTime(text: string): number;
export function parseArgs(argv: readonly string[]): RecorderArgs;
export function expectedCount(start: number, end: number): number;
export function guardEnv(env: Record<string, string | undefined>, execArgv: readonly string[]): void;
export function guardOut(out: string): void;
export function run(argv: readonly string[], io?: RecorderIo): Promise<SeriesManifest>;
export function main(argv: readonly string[], io?: RecorderIo): Promise<number>;
