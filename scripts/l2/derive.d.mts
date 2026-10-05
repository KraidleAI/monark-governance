// scripts/l2/derive.d.mts -- type surface of scripts/l2/derive.mjs for the type-checked root test test/l2-derive.test.ts (lot P1-c2 of
// ADR-L2-CAPTURE-1). Runtime implementation = derive.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder and its data stay out of the public tree.
import type { DeriveContext, Derived } from "./day.mjs";

export const MINUTE_US: number;
export const WINDOW_BP: bigint;
/** Bytes of minutes.jsonl held at a seal at most (G2 B-1), else DayStop minutes_bound. */
export const MINUTES_BOUND: number;

/** A decimal string as an integer at `scale`; a non-zero digit past it throws DayStop off_scale. */
export function atScale(text: string, scale: number): bigint;

/** One line of minutes.jsonl: t in microseconds of place time; levels within +-100 bp as received, best first; absent when named. */
export interface MinuteLine {
  t: number;
  u?: number;
  bids?: [string, string][];
  asks?: [string, string][];
  n?: [number, number];
  dist_bp?: [number | null, number | null];
  absent?: "chain_open" | "side_empty" | "no_later_event";
}

/** One chain hole of missing.json (m-5 of c1), in place time; to null while the chain did not resume. */
export interface ChainHole { from_place_us: number; to_place_us: number | null }

/** The parity at anchor-close.json (manifest key parity), or why it is absent. */
export type Parity = { u: number; since: number; bids: number; asks: number } | { absent: "anchor_missing" | "anchor_shape" | "chain_open" }
  | { absent: "synced_on_anchor"; u: number };

/** A diff as the replay applies it, and its book after it (prices at the day's scale; levels as received). */
export interface Applied { E: number; U: number; u: number; b: [string, string][]; a: [string, string][] }
export interface ReplayBook { id: number; since: number; bids: Map<bigint, [string, string]>; asks: Map<bigint, [string, string]> }

/** The hook of sealDay for one day of one symbol at price scale `scale` (an integer from 0 to 18, else DayStop bad_scale), minutes.jsonl
 *  at most `bound` bytes (MINUTES_BOUND by default); `tap` sees each applied diff and the book after it (P1-c3). */
export function deriveDay(ctx: Omit<DeriveContext, "index"> & { scale: number; bound?: number | undefined; tap?: ((ev: Applied, book: ReplayBook) => void) | null }): Derived;
