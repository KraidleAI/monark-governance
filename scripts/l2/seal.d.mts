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

/** The cap of the heap of the child that seals for the loop, in MiB (P1-c5-bis-a, measured in its lot plan). */
export const SEAL_HEAP_MB: number;
/** What sealApart takes: sealOf's spec but its function, `open` the "cid/seg" held open by the loop's writers. */
export type ApartSpec = Omit<SealSpec, "derive" | "closed"> & { scale: number; bounds?: SealBounds; open?: string[] };
export type ApartResult = SealResult | { sealed: false; failed: { code: number | null; signal: string | null; stop: string | null; detail: unknown } };
/** The deadline of one seal apart, in ms (B-1 of the G2 of c5-bis-a). */
export const SEAL_TIMEOUT_MS: number;
/** sealOf in a child process (node --max-old-space-size=<heapMb> scripts/l2/seal-child.mjs) spawned with `env` alone (none by default),
 *  written through spec.out (adopt's `at`) opened once and passed as the child's fd 3, never a path; past timeoutMs or on `signal`, the
 *  child killed and failed.stop seal_timeout or seal_aborted; root_refused, spec_refused, spawn_failed named; never rejects. */
export function sealApart(spec: ApartSpec, io?: { env?: Record<string, string>; heapMb?: number; timeoutMs?: number; signal?: AbortSignal }): Promise<ApartResult>;
