// scripts/sync-harness-served.d.mts - type surface of the pure functions scripts/sync-harness-served.mjs exports (behind
// its run-guard), so the type-checked root test test/harness-served.test.ts can replay the sync's
// liquidation-eligible-coverage row and call check (UKEMI-SITE-SWITCH-1) WITHOUT running the network CLI. Runtime
// implementation = sync-harness-served.mjs; Node ignores this file. Governance-only (sync-ukemi-served.d.mts precedent),
// NOT whitelisted for public export.
export const OUT_REL: string;
/** The two liquidation-eligible-coverage states the served /gate description can carry. */
export type LiqState = "none" | "committed";
export interface ClassRow { class_id: string; state: string; clauses: string[] }
/** The served liq registry state read from the served /gate description; throws unless exactly one liq clause is served. */
export function liqStateOf(gateDescription: string): LiqState;
/** The closed class table for a served liq state. */
export function classesFor(liqState: LiqState): ClassRow[];
/** Does the served liq answer agree with the served state? Judged on verdict.reason and the content text, never on the
 *  top-level reason (L3's action reason). */
export function liqCallAgrees(liqState: LiqState, liqCall: unknown): boolean;
/** SERVED-PENDING-1 (Q-SP1-7): the pending snapshot --pending writes, from the in-process harness. */
export function inProcessPending(writtenAt: string): Promise<Record<string, unknown>>;
/** The shared fields (and any key or schema a pending snapshot may not carry) on which a served snapshot differs from the pending one. */
export function pendingDiff(served: Record<string, unknown>, pending: Record<string, unknown>): string[];
/** The served file's text with pending_since after read_at, no other byte touched; kept when already set. */
export function markPendingSince(text: string, day: string): string;
/** T0-TOOLING-1: write the served snapshot under `root`, promoting a pending one (manifest entry set, pending entry and file
 *  removed); throws, writing nothing, on a drift from the pending snapshot, a leak or a non-canonical manifest. */
export function writeServed(root: string, out: Record<string, unknown>, exempt: string | null): { sha: string; promoted: boolean };
/** T0-TOOLING-1: --pending under `root` (pending file, pending_since, both manifest entries); returns the pending entry. */
export function writeHarnessPending(root: string, writtenAt: string): Promise<string>;
/** The committed deploy check record the sync binds every body to. */
export const CA_REL: string;
/** The pending snapshot the default run promotes. */
export const PENDING_REL: string;
