// Type declarations for scripts/census/u4-redraw.mjs (U-4a C-V-3 independent live re-draw tool). Only the pure,
// unit-tested selectIndices() is a typed export; the live main() reuses record.ts/rpc2.ts/abi.ts primitives.
/** Deterministic k distinct indices in [0,n) drawn from a sha256 stream keyed by `seed` (a book_digest). Pure,
 *  reproducible, seed-derived (prereg §4 independence) — the re-draw is never hand-picked. */
export function selectIndices(seed: string, n: number, k: number): number[];
