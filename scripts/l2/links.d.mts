// scripts/l2/links.d.mts -- type surface of scripts/l2/links.mjs for the type-checked root test (test/l2-links.test.ts), which opens
// links on the loopback fake place with injected clocks and timers. Runtime implementation = links.mjs; Node ignores this file. Neither
// file is in the export whitelist (scripts/export-public.mjs): the recorder and its data stay out of the public tree.
import type { SegmentFile } from "./segments.mjs";

export const SPOT_ORIGIN: string;
export const ORIGINS: readonly string[];
export const SYMBOLS: readonly string[];
export const STREAMS: readonly string[];
export const TIME_UNIT: string;
export const PING_MS: number;
export const WATCHDOG_K: number;
export const RETRY_FIRST_MS: number;
export const RETRY_CAP_MS: number;
export const OPENS_MAX: number;
export const OPENS_WINDOW_MS: number;
export const STOPS: readonly string[];

/** A named stop, thrown before anything is opened or written: `code` is one of STOPS (bad_symbol, host_refused). */
export class LinkStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

/** The opening gate of the process: take(now), now in ms of a monotonic clock, is 0 for an opening admitted, else the wait in ms. */
export interface Gate {
  take(now: number): number;
}

/** What a link takes from its caller (the test seam): methods, so that the timers of Node fit setTimer and clearTimer. */
export interface LinkIo {
  webSocket(url: string): WebSocket;
  wallUs(): number;
  monoNs(): bigint;
  setTimer(fn: () => void, ms: number): unknown;
  clearTimer(handle: unknown): void;
  gate: Gate;
  open?: (path: string) => Promise<SegmentFile>;
}

/** symbol: one of SYMBOLS, named in each <cid>; url: the URL opened, spotUrl(symbol) for a spot link; out: the output directory. */
export interface LinkSpec {
  symbol: string;
  url: string;
  out: string;
}

/** A link: stop() closes its connection, named "stopped", cancels its timers and resolves once each of its writers is closed (never,
 *  while a stalled disk keeps a writer from writing its queue). */
export interface Link {
  stop(): Promise<void>;
}

export function spotUrl(symbol: string): string;
export function openingGate(): Gate;
export function openLink(spec: LinkSpec, io: LinkIo): Link;
