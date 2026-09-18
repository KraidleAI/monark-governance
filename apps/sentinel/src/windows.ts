// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// UTC-day windows anchored on blocks, EXTRACTED from scripts/usde-full-pull.mjs so the pull and the
// sentinel slice windows with ONE implementation (ADR-M012 D1, C-6): the pull re-imports `daysUTC` and
// `firstBlockAtOrAfter`, giving byte-identical blocks/bounds. The block->timestamp reader is INJECTED
// (`tsOf`), so the same code runs against live RPC (run.ts), the archival pull, or an offline fixture
// oracle in CI (test `sentinel_windows_identical_to_pull`) — no network in the module itself (C-5).
//
// A window for day D is [fromBlock, toBlock]: fromBlock = firstBlockAtOrAfter(midnight(D)), toBlock =
// firstBlockAtOrAfter(midnight(D+1)) - 1. Consecutive days therefore chain with no gap/overlap
// (toBlock(D) + 1 === fromBlock(D+1)), which is the pull's measured invariant over the 701 windows.

/** Async block->timestamp reader (Unix seconds). Sync or Promise-returning; the search awaits it. */
export type TsOf = (block: number) => number | Promise<number>;

/** Bounds of one UTC-day window. */
export interface WindowBounds {
  readonly fromBlock: number;
  readonly toBlock: number;
}

/** Unix-seconds midnight (UTC) of an ISO `YYYY-MM-DD` day. */
export function midnightOf(day: string): number {
  return Math.floor(new Date(day + "T00:00:00Z").getTime() / 1000);
}

/**
 * The [fromTs, toTs, day] triples for every UTC day in [startIso, endExclIso) — the pull's `daysUTC`,
 * ported to TypeScript-strict (`d.getTime()` not `d / 1000`, identical value). `toTs` of day D equals
 * `fromTs` of day D+1 (the midnight both windows share), which is why the bounds chain.
 */
export function daysUTC(startIso: string, endExclIso: string): Array<[number, number, string]> {
  const out: Array<[number, number, string]> = [];
  let d = new Date(startIso + "T00:00:00Z");
  const end = new Date(endExclIso + "T00:00:00Z");
  while (d < end) {
    const n = new Date(d.getTime() + 86_400_000);
    out.push([Math.floor(d.getTime() / 1000), Math.floor(n.getTime() / 1000), d.toISOString().slice(0, 10)]);
    d = n;
  }
  return out;
}

/**
 * First block whose timestamp is >= `targetTs`, by binary search over [lo, hi] using the injected
 * `tsOf`. Returns `hi` if no block in range reaches `targetTs` (the caller must have bounded `hi` by a
 * FINALIZED block known to be at/after the target — run.ts gates finality by timestamp so this never
 * silently truncates a window; ADR-M012 D1). Same algorithm the pull uses, so results are identical.
 */
export async function firstBlockAtOrAfter(targetTs: number, lo: number, hi: number, tsOf: TsOf): Promise<number> {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const ts = await tsOf(mid);
    if (ts < targetTs) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Bounds of the UTC day `day`, searching within [lo, hi]. `fromBlock` = firstBlockAtOrAfter(midnight(D));
 * `toBlock` = firstBlockAtOrAfter(midnight(D+1)) - 1. The second search starts at `fromBlock` (the
 * boundary can only rise), matching the pull's marching cache without carrying its mutable state.
 */
export async function windowBounds(day: string, lo: number, hi: number, tsOf: TsOf): Promise<WindowBounds> {
  const fromTs = midnightOf(day);
  const toTs = fromTs + 86_400;
  const fromBlock = await firstBlockAtOrAfter(fromTs, lo, hi, tsOf);
  const nextBoundary = await firstBlockAtOrAfter(toTs, fromBlock, hi, tsOf);
  return { fromBlock, toBlock: nextBoundary - 1 };
}
