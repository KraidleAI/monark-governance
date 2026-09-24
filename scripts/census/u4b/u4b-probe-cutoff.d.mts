// Type declarations for scripts/census/u4b/u4b-probe-cutoff.mjs (lot U-4b-1b-4, R-G: probe (d) via CutoffTimeSet logs).
// Governance surface for the type-checked test u4b-probe-cutoff.test.ts. Runtime = the .mjs; Node ignores this file.

export interface Deps { env: Record<string, string | undefined>; now: () => number }

export interface CutoffEvent { block: number; log_index: number; tx_hash: string; cutoff_time: number }

export const SCHEMA: string;
export const FEED_PROXY: string;
export const EXPECTED_AGGREGATOR: string;
export const AGGREGATOR_CREATION_BLOCK: number;
export const E2_B0: number;
export const DEPLOY_VALUE: number;
export const CUTOFF_TIME_SET_TOPIC0: string;
export const RULE: string;
export const EXIT_STOP: number;

export class ProbeError extends Error {}

/** Decode real-form CutoffTimeSet logs (topic0 self-test, data = one 32-byte uint32 word), sorted by (block, logIndex). */
export function decodeCutoffEvents(logs: ReadonlyArray<{ blockNumber: string; logIndex: string; transactionHash: string; topics: readonly string[]; data: string }>): CutoffEvent[];

/** The cutoffTime in force at block B = that of the LAST event at a block <= B, or null. */
export function cutoffAt(events: readonly CutoffEvent[], B: number): number | null;

/** The pre-registered rule: GO iff both values exist and are equal. */
export function decide(cFresh: number | null, cE2: number | null): "GO" | "STOP";

/** The probe (status 0 = GO, 3 = STOP; throws on an argument refusal). */
export function runProbe(argv: readonly string[], deps: Deps): Promise<{ status: number; verdict: "GO" | "STOP"; outPath: string }>;
