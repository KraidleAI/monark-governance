// scripts/l2/derive.d.mts -- type surface of scripts/l2/derive.mjs for the type-checked root test test/l2-derive.test.ts (lot P1-c2 of
// ADR-L2-CAPTURE-1). Runtime implementation = derive.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder and its data stay out of the public tree.
import type { DeriveContext, Derived } from "./day.mjs";

export const MINUTE_US: number;
export const WINDOW_BP: bigint;

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
export type Parity = { u: number; since: number; bids: number; asks: number } | { absent: "anchor_missing" | "anchor_shape" | "chain_open" };

/** The hook of sealDay for one day of one symbol at price scale `scale` (an integer from 0 to 18, else DayStop bad_scale). */
export function deriveDay(ctx: DeriveContext & { scale: number }): Derived;
