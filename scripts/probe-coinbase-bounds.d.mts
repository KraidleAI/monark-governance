// scripts/probe-coinbase-bounds.d.mts -- type surface of scripts/probe-coinbase-bounds.mjs for the type-checked root test
// (test/probe-coinbase-bounds.test.ts), which runs the probe in-process with an injected fetch, never the network. Runtime
// implementation = probe-coinbase-bounds.mjs; Node ignores this file. Neither file is in the export whitelist (scripts/export-public.mjs).
import type { RecorderIo } from "./record-coinbase-candles.mjs";

export const SCHEMA: string;
export const PRODUCTS: readonly string[];
export const STOPS: readonly string[];

/** One request of the probe: its URL, its status and the open times served (ISO 8601, in the order received), null for a status other than 200. */
export interface ProbeRequest {
  name: string;
  url: string;
  status: number;
  times: string[] | null;
}

/** The conclusion: the format read, the inclusion of start and end by the aligned request, the readings of the table that match. */
export interface ProbeConclusion {
  format_accepted: boolean;
  start_included: boolean | null;
  end_included: boolean | null;
  readings: string[];
}

/** probe.json: times, statuses, digests and the conclusion; never a price nor a volume. */
export interface ProbeResult {
  schema: string;
  product: string;
  granularity_s: number;
  week: [string, string];
  requests: ProbeRequest[];
  conclusion: ProbeConclusion;
  probe_sha256: string;
  recorder_sha256: string;
  node: string;
  started_at: string;
  finished_at: string;
  redistributable: boolean;
  terms: string;
}

export function parseArgs(argv: readonly string[]): { product: string; out: string };
export function run(argv: readonly string[], io?: RecorderIo): Promise<ProbeResult>;
export function main(argv: readonly string[], io?: RecorderIo): Promise<number>;
