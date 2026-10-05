// scripts/l2/canon.d.mts -- type surface of scripts/l2/canon.mjs for the type-checked root test test/l2-canon.test.ts (lot P1-c3 of
// ADR-L2-CAPTURE-1). Runtime implementation = canon.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder and its data stay out of the public tree.
import type { DeriveContext, Derived } from "./day.mjs";
import type { Applied, ReplayBook } from "./derive.mjs";

/** The keys of D-20 by stream (Q-P1-9): (U,u), u, t; none for forceOrder, ordered by its bytes alone. */
export const CANON_KEYS: Readonly<Record<string, readonly string[]>>;
/** Bytes of one run of equal keys held at most (64 MiB), else DayStop canon_bound. */
export const RUN_BOUND: number;
/** Groups and unmatched diffs listed at the manifest at most; each one is counted. */
export const NAMED_BOUND: number;

/** The diffs of the day whose best level changed, as [U, u] pairs (the first 2 n numbers of events). */
export interface BestChanges { events: Float64Array; n: number; unjudged: number }
export function bestTap(spec: { scale: number; start: number; end: number }): { tap: (ev: Applied, book: ReplayBook) => void; result: () => BestChanges };

/** One stream of manifest key canon: frames of the day's index, entries by exact bytes, forms re-serialized, both digests. */
export interface CanonStream {
  frames: number; entries: number; forms: number; keyless: number; foreign: number; same_key: number; same_fields: number;
  jumps?: { count: number; max: number | null };
  raw_sha256: string; fields_sha256: string;
}
/** A group named, never merged: [cid, seg, rank] of each payload. */
export interface Named { stream: string; why: "same_key" | "same_fields"; key: number[] | null; at: [string, string, number][] }

/** The hook of sealDay (manifest keys canon and crosscheck); `best` from bestTap().result(), null: crosscheck (ii) absent, no_replay. */
export function canonDay(ctx: DeriveContext & { best?: BestChanges | null; bound?: number | undefined }): Derived;
