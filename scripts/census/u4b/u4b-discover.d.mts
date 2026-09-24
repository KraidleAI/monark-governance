// Type declarations for scripts/census/u4b/u4b-discover.mjs (U-4b-1b-0, decision 128 Q-D). Governance surface for
// the type-checked test u4b-discover.test.ts. Runtime = the .mjs; Node ignores this file (skipLibCheck: true).

/** Injected dependencies: the process env (keyless => {} is enough) and a clock. Tests stub globalThis.fetch.
 *  `afterGetLogs` is an OPTIONAL test seam (C-V-3): a hook awaited right after the durable getlogs-only write; a test
 *  makes it throw to simulate a hard kill during the ts probes (proving the getlogs-only brut is already durable). */
export interface DiscoverDeps {
  env: Record<string, string | undefined>;
  now: () => number;
  afterGetLogs?: () => void | Promise<void>;
}

export interface DiscoverResult {
  out: string;
  brutSha: string;
  nLogs: number;
  nClusters: number | null;      // null when the consultative witness (clustering) failed (schema v2)
  clusterError: string | null;   // URL-scrubbed witness fault, or null on success (schema v2)
}

/** The keyless witness labels u4b-discover may use (union of the package keyless ETH pools). */
export const KEYLESS_LABELS: string[];

/** Fail-closed refusal of any non-keyless operator (paid chainstack/helius or unknown). Returns the list if OK. */
export function assertKeylessOperators(operators: readonly string[]): readonly string[];

/** Run the §DISC discovery through the guarded keyless pool. Returns the out path + the deterministic brut sha. */
export function runDiscover(argv: readonly string[], deps: DiscoverDeps): Promise<DiscoverResult>;
