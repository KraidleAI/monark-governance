// scripts/l2/seal.d.mts -- type surface of scripts/l2/seal.mjs for the type-checked root test test/l2-loop.test.ts (lot P1-c5 of
// ADR-L2-CAPTURE-1). Runtime implementation = seal.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder and its data stay out of the public tree.
import type { DeriveContext, Derived, SealResult, SealSpec } from "./day.mjs";

/** Bytes of minutes.jsonl, and twice the bytes of a run of equal keys of canonDay, at a seal at most (L2-MINUTES-SIZE-1, provisional). */
export interface SealBounds { minutes: number; canon: number }
export const SEAL_BOUNDS: Readonly<SealBounds>;
/** The command, relative to scripts/l2, hashed into script_sha256 as scripts/record-binance-l2.mjs. */
export const COMMAND: string;

/** Parts merged in their order; a key of two manifests, or of two missing.json, throws DayStop stray_file. */
export function mergeDerived(symbol: string, day: string, parts: Derived[]): Required<Derived>;
/** bestTap, then deriveDay with its tap, then canonDay with its result, at one scale; this module and the command hashed. */
export function hookOf(scale: number, bounds?: SealBounds): (ctx: DeriveContext) => Derived;
export function sealOf(spec: Omit<SealSpec, "derive"> & { scale: number; bounds?: SealBounds }): SealResult;
