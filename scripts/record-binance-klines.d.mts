// scripts/record-binance-klines.d.mts -- type surface of scripts/record-binance-klines.mjs for the type-checked root test
// (test/record-binance-klines.test.ts), which imports the recorder without running it (run-guard) and without any network (a fetch
// shaped as https.request is injected, or https.request itself is replaced by a spy that throws). Runtime implementation = record-binance-klines.mjs; Node ignores this file. Neither file is in the export whitelist
// (scripts/export-public.mjs): the recorder and its series stay out of the public tree (condition C-5, series not redistributable).
import type { ClientRequest } from "node:http";
import type { RequestOptions } from "node:https";

export const ENDPOINT: string;
export const HOSTS: readonly string[];
export const SYMBOLS: readonly string[];
export const INTERVALS: Readonly<Record<"15m" | "1h" | "4h", number>>;
export const LIMIT: number;
export const PAUSE_MS: number;
export const MAX_PAGES: number;
export const TIMEOUT_MS: number;
/** The largest body a request reads, in bytes, before body_too_large (lot BINANCE-PRE153-1, D-5). */
export const MAX_BODY_BYTES: number;
export const CSV_COLUMNS: readonly string[];
export const STOPS: readonly string[];

/** What a run takes from its caller instead of the process: the test seam, never a command-line flag nor a variable. */
export interface RecorderIo {
  /** Shaped as node:https request (lot BINANCE-PRE35-1): called with the URL and the recorder's options (its own agent, which keeps
   *  no TLS session, and a 30 s signal); the recorder ends the request. Default: https.request. */
  fetch?: (url: string, options: RequestOptions) => ClientRequest;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  env?: Record<string, string | undefined>;
  execArgv?: readonly string[];
  print?: (line: string, toStderr: boolean) => void;
}

/** The parsed command line: times in ms since the epoch, paths resolved. */
export interface RecorderArgs {
  symbol: string;
  interval: string;
  step: number;
  start: number;
  end: number;
  out: string;
  fromRaw: string | null;
}

/** A monark.series.binance.v1 manifest as a reader finds it in a sealed folder (D-4 of the second round, G2C-5): the manifests of the
 *  recorders 48aa58b3 and 0a1ae564 (sealed before lot RECORDER-CLOSE-TIME-1) have neither irregular_close nor zero_trade, which there means never
 *  computed. This recorder writes no v1 (lot BINANCE-V2-1, Q-U5 of RECHERCHES): it reads one as a replay's source, for its interval. */
export interface SeriesManifestV1 {
  schema: "monark.series.binance.v1";
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
  /** Absent: never computed; present: as SeriesManifest says. */
  irregular_close?: { open_time_ms: number; close_time_ms: number }[];
  /** Absent: never computed; present: as SeriesManifest says. */
  zero_trade?: number[];
}

/** manifest.json as this recorder writes it, recording or replay (lot BINANCE-V2-1, Q-U5 of RECHERCHES): monark.series.binance.v2, the
 *  fields of v1 and both lists always present, so that one identifier keeps one meaning. */
export interface SeriesManifest extends Omit<SeriesManifestV1, "schema"> {
  schema: "monark.series.binance.v2";
  /** A replay: the sha256 of its source's requests.jsonl and SHA256SUMS as read, null when absent; a recording: null (lot
   *  BINANCE-PRE153-1, D-1 (d): an anchor outside the source, sealed with the replay). */
  from_raw_requests_sha256: string | null;
  from_raw_sha256sums_sha256: string | null;
  /** Kept candles whose close is not open + interval - 1 ms, the close as received (rule 8 of RECHERCHES ADR 0006): ascending. A close
   *  out of its slot is a stop (close_out_of_slot), so each listed close lies in [open, open + interval - 1 ms): a truncation. */
  irregular_close: { open_time_ms: number; close_time_ms: number }[];
  /** Open times of the kept candles with 0 trades, a truncated one included (rule 8 bis): ascending. */
  zero_trade: number[];
}

/** A manifest as a reader finds it, sealed or as the source of a replay: v1 or v2, told apart by its schema (lot BINANCE-V2-1, D-1). */
export type SeriesManifestRead = SeriesManifestV1 | SeriesManifest;

/** A named stop: `code` is one of STOPS. */
export class RecorderStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

export function isoOf(ms: number): string;
export function parseTime(text: string, interval?: string): number;
export function parseArgs(argv: readonly string[]): RecorderArgs;
export function expectedCount(start: number, end: number, interval?: string): number;
export function guardEnv(env: Record<string, string | undefined>, execArgv: readonly string[]): void;
export function guardOut(out: string): void;
export function run(argv: readonly string[], io?: RecorderIo): Promise<SeriesManifest>;
export function main(argv: readonly string[], io?: RecorderIo): Promise<number>;
