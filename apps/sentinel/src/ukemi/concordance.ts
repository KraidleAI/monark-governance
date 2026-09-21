// UKEMI (ADR-POOL-RPC-1 L-4) — pure, non-LLM reducer for the quorum-2 concordance counter. The recorder's
// `onQuorum` hook (rpc2.ts) aggregates, per DISTINCT OPERATOR PAIR (operatorOf labels — C-1/C-2, never a URL),
// how often the two operators AGREED (concordant) vs DISAGREED (discordant) on a value read, and flushes ONE
// compact jsonl line per pair (N-3: O(pairs), not ~140k appends). This reducer folds those lines — from one run
// or several — into a per-pair tally with a concordance rate. PURE: no IO, no clock. The chain test drives it on
// a string (args → runRecorder → jsonl → reduceConcordance → counters). It reads ONLY {pair, concordant,
// discordant}; any other field (e.g. `at`) is ignored, and it never emits a URL (its input carries none).

/** One line of the concordance jsonl the recorder flushes: a sorted operator pair and its two tallies. */
export interface ConcordanceLine { readonly pair: string; readonly concordant: number; readonly discordant: number; }

/** A folded per-pair tally with its concordance rate (concordant / total; 0 when the pair had no observation). */
export interface ConcordanceTally { readonly pair: string; readonly concordant: number; readonly discordant: number; readonly rate: number; }

/** Fold the concordance jsonl (one or more lines per pair) into ONE tally per pair, sorted by pair. Pure. A blank
 *  line is skipped; a line missing a numeric tally contributes 0 for that field (fail-soft on a partial flush,
 *  never throwing). `rate` = concordant / (concordant + discordant), or 0 when the pair has no observation. */
export function reduceConcordance(jsonl: string): ConcordanceTally[] {
  const agg = new Map<string, { concordant: number; discordant: number }>();
  for (const raw of jsonl.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    const o = JSON.parse(line) as Partial<ConcordanceLine>;
    if (typeof o.pair !== "string") continue;
    const cur = agg.get(o.pair) ?? { concordant: 0, discordant: 0 };
    cur.concordant += typeof o.concordant === "number" ? o.concordant : 0;
    cur.discordant += typeof o.discordant === "number" ? o.discordant : 0;
    agg.set(o.pair, cur);
  }
  return [...agg.entries()]
    .map(([pair, t]) => ({ pair, concordant: t.concordant, discordant: t.discordant, rate: t.concordant + t.discordant > 0 ? t.concordant / (t.concordant + t.discordant) : 0 }))
    .sort((a, z) => (a.pair < z.pair ? -1 : a.pair > z.pair ? 1 : 0));
}
