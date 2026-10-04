// scripts/l2/rest.d.mts -- type surface of scripts/l2/rest.mjs for the type-checked test test/l2-rest.test.ts (lot P1-b1 of
// ADR-L2-CAPTURE-1). Runtime implementation = rest.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder stays out of the public tree.
export const ORIGIN: string;
export const HOSTS: readonly string[];
export const KINDS: Readonly<Record<RestKind, { readonly path: string; readonly weight: number }>>;
export const DEPTH_LIMIT: number;
export const TIMEOUT_MS: number;
export const BODY_MAX: number;
export const RETRY_AFTER_DEFAULT_S: number;
export const STOPS: readonly string[];

export type RestKind = "depth" | "exchangeInfo" | "time";

/** A named stop: `code` is one of STOPS. */
export class RestStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

/** What a client takes from its caller: the test seam, never a flag nor a variable. */
export interface RestIo {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  /** Wall clock of the host in microseconds, an integer. */
  nowUs: () => number;
  out: string;
}

/** A 200 answer: the body as received, its path under `out`, the local send and receive times in microseconds. */
export interface RestAnswer {
  body: Buffer;
  kept: string;
  sentUs: number;
  receivedUs: number;
}

export interface RestClient {
  request(kind: RestKind, symbol: string | null): Promise<RestAnswer>;
  close(): void;
  readonly stopped: boolean;
  readonly suspendedUntilUs: number;
}

/** One line of requests.jsonl. */
export interface RequestLine {
  kind: RestKind;
  symbol: string | null;
  url: string;
  weight: number;
  status: number;
  sent_us: number;
  received_us: number;
  bytes: number;
  sha256: string | null;
  kept: string | null;
  tls_peer_sha256: string | null;
  headers: { date: string | null; "x-mbx-used-weight-1m": string | null; "retry-after": string | null };
}

export interface ExchangeInfoFacts {
  tickSize: string;
  scale: number;
  rateLimits: unknown[];
  requestWeightPerMinute: number;
}

export interface ClockOffset {
  event: "clock_offset";
  sent_us: number;
  received_us: number;
  server_time_ms: number | null;
  offset_us: number | null;
  reason: "server_time_not_safe_integer" | null;
}

export function guardUrl(url: string): string;
export function urlOf(kind: RestKind, symbol: string | null): string;
export function createRest(io: RestIo): RestClient;
export function exchangeInfoFacts(body: Buffer): ExchangeInfoFacts;
export function logTimeOffset(out: string, body: Buffer, sentUs: number, receivedUs: number): ClockOffset;
