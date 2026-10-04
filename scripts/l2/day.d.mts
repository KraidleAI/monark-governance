// scripts/l2/day.d.mts -- type surface of scripts/l2/day.mjs for the type-checked root test test/l2-day.test.ts (lot P1-c1 of
// ADR-L2-CAPTURE-1). Runtime implementation = day.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder and its data stay out of the public tree.
export const DAY_US: number;
export const GRACE_US: number;
export const SCHEMA: string;
export const TIME_UNITS: Readonly<{ spot: "us"; market: null }>;
export const SAMPLING: Readonly<{ stream: string; per_symbol_ms: number; kept: string }>;
export const KEYS: Readonly<Record<string, string>>;
export const MISSING_EVENTS: readonly string[];
export const STOPS: readonly string[];

/** A named stop: `code` is one of STOPS (bad_symbol, bad_day, place_time_unsafe, day_sealed). */
export class DayStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

/** One line of days/<SYMBOL>/<YYYY-MM-DD>/index.jsonl: the frame's stream (null when none is read), its segment and rank; mark
 *  recv_day = indexed by its reception day (Q-9 fallback, /market); late = received past its day plus the grace, `of` its day. */
export interface DayLine {
  stream: string | null;
  cid: string;
  seg: string;
  rank: number;
  mark?: "recv_day" | "late";
  of?: string;
}

/** What a seal takes from its caller (the test seam): out, the symbol, the UTC day, the host's wall clock in microseconds, whether a
 *  segment is closed (from the writers of c5), and the configuration written to the manifest as given. */
export interface SealSpec {
  out: string;
  symbol: string;
  day: string;
  nowUs: number;
  closed: (cid: string, seg: string) => boolean;
  config?: Record<string, unknown>;
}

export type SealResult =
  | { sealed: false; wait: "grace" }
  | { sealed: false; wait: "segments"; open: string[] }
  | { sealed: true; dir: string; frames: number };

export function dayOf(us: number): string;
export function sealDay(spec: SealSpec): SealResult;
