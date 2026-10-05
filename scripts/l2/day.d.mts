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
export const INDEX_BOUND: number;
export const DAY_FILES: readonly string[];

/** A named stop: `code` is one of STOPS (bad_symbol, bad_day, place_time_unsafe, day_sealed, index_bound, stray_file; off_scale, bad_scale, minutes_bound of P1-c2; canon_bound, canon_reread of P1-c3; snapshot_reload of P1-c5). */
export class DayStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

/** One line of days/<SYMBOL>/<YYYY-MM-DD>/index.jsonl: the frame's stream (null when none is read), its segment and rank; mark
 *  recv_day = indexed by its reception day (Q-9 fallback, /market); late = received past its day plus the grace or its segment after its
 *  day's window, early = its segment before that window: both at their segment's day, `of` their day. */
export interface DayLine {
  stream: string | null;
  cid: string;
  seg: string;
  rank: number;
  mark?: "recv_day" | "late" | "early";
  of?: string;
}

/** One hole of missing.json (link: the symbol, or ALL; cid null at a restart of c5); each bound names its source (Q-G2-4): "frame" = recv_us
 *  of a frame on disk (ADR "watchdog"), "journal" = host_us of the journal's line; to_us and to_src null while no connection reopened. */
export interface DayHole { link: string; cid: string | null; cause: string | null; from_us: number; from_src: "frame" | "journal"; to_us: number | null; to_src: "frame" | "journal" | null }

/** What a seal takes from its caller (the test seam): out, the symbol, the UTC day, the host's wall clock in microseconds, whether a
 *  segment is closed (from the writers of c5), the configuration written to the manifest as given, the frames held at most (INDEX_BOUND). */
export interface SealSpec {
  out: string;
  symbol: string;
  day: string;
  nowUs: number;
  closed: (cid: string, seg: string) => boolean;
  config?: Record<string, unknown>;
  bound?: number;
  /** The derive hook (P1-c2, m-9 of c1), called after the day's index and before anything is written; null: none. */
  derive?: ((ctx: DeriveContext) => Derived) | null;
}

/** What the hook reads: the day's bounds in microseconds, the segments read ([cid, seg], sorted), the tail marks by "cid/seg", the day's
 *  index by stream (P1-c3): int32 triples, the segment's number in segs, the rank, the mark (0 none, 1 recv_day; 2 late, 3 early + 4 x day). */
export interface DeriveContext { out: string; symbol: string; day: string; start: number; end: number; segs: [string, string][]; marks: Map<string, unknown>; dir: string;
  index: Map<string, { stream: string | null; col: { a: Int32Array; n: number } }> }

/** What the hook adds before SHA256SUMS: files of DAY_FILES but the seal's and the anchors' [name, text or its chunks], new manifest and
 *  missing.json keys (else stray_file), paths listed relative to the day folder, modules hashed into script_sha256. */
export interface Derived { files?: [string, string | string[]][]; manifest?: Record<string, unknown>; missing?: Record<string, unknown>; refs?: string[]; modules?: string[] }

export type SealResult =
  | { sealed: false; wait: "grace" }
  | { sealed: false; wait: "segments"; open: string[] }
  | { sealed: true; dir: string; frames: number };

export function dayOf(us: number): string;
export function sealDay(spec: SealSpec): SealResult;
