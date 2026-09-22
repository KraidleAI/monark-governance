// Type declarations for scripts/census/u4b/u4b-select-episode.mjs (U-4b-1b-2 — the AVAL episode selector). Governance
// surface for the type-checked test u4b-select-episode.test.ts. Runtime = the .mjs; Node ignores this file (skipLibCheck).

import type { LiquidationRecord, WethCluster } from "./liquidation-logs.d.mts";

export const SCHEMA: string;
export const DEFAULT_N_MIN: number;
export const DEFAULT_E2_WINDOW: number[];
export const EIP1967_IMPL_SLOT: string;
export const IMPL_V350: string;

export class SelectError extends Error {}

/** One episode candidate (a WETH cluster) with its §DISC:42-46 eligibility verdict. */
export interface Candidate {
  b_first: number;
  b_last: number;
  b0: number;
  n_members: number;
  n_distinct: number;
  addr_min: string;
  eligible: boolean;
  reasons: string[];
}

export interface SelectionCensus {
  clusters: WethCluster[];
  candidates: Candidate[];
  eligible: Candidate[];
  winner: Candidate | null;
  nExcludedE2: number;
  residualOutsideWindow: number;
  windowTruncated: number;
  kept: LiquidationRecord[];
  tsOf: (block: number) => number;
}

export interface DiscoverBrut {
  schema: string;
  records: LiquidationRecord[];
  block_ts: Record<string, number>;
  to_block: number;
  [k: string]: unknown;
}

export interface Deps {
  env: Record<string, string | undefined>;
  now: () => number;
}

export function compareCandidates(a: Candidate, b: Candidate): number;
export function buildARawlogs(records: readonly LiquidationRecord[]): string;
export function reduceSelection(args: { brut: DiscoverBrut; nMin: number; e2Window: number[]; bHi: number; blockTsExtra?: Record<string, number> }): Promise<SelectionCensus>;
export function buildSelection(args: { census: SelectionCensus; preregSha: string; discoverSha: string; e2Window: number[]; nMin: number; bHi: number }): { payload: Record<string, unknown>; aRawlogs: string; rawlogsSha: string; episodeId: string; events: Array<Record<string, unknown>>; eventsBody: string };
export function selectionSha(payload: Record<string, unknown>): string;
export function runSelect(argv: readonly string[], deps?: Deps): Promise<{ out: string; rawOut: string; eventsOut: string; episodeId: string; selectionSha: string; file: Record<string, unknown> }>;
export function runCheckVersion(argv: readonly string[], deps: Deps): Promise<{ versionOk: boolean; impl: string; block: number }>;
/** The `--fill-ts` durable sidecar (C-2 / D-BORNE-1): `phase` "partial" is a resumable checkpoint (rewritten every 50
 *  new ts and on a graceful STOP), "complete" is the only phase runSelect --block-ts-extra accepts; `phase` is MANDATORY
 *  (C-V-6: runSelect refuses an absent phase by name - no phase-less sidecar exists). Each write is tmp + rename. The
 *  --fill-ts RESUME reuses the DATA of any self-sha-valid, same-discover_sha sidecar whatever its phase (rewritten on the
 *  next flush). `block_ts_extra_sha256` is over `block_ts_extra` only (not `phase`), keeping the C-2 sha chain
 *  byte-stable across a phase flip (R-BORNE-1: a hand-flip partial->complete is caught by the offline "no ts" refusal). */
export interface BlockTsExtraSidecar {
  schema: string;
  phase: "partial" | "complete";
  discover_sha: string;
  n_extra: number;
  block_ts_extra: Record<string, number>;
  block_ts_extra_sha256: string;
}
export function runFillTs(argv: readonly string[], deps: Deps): Promise<{ out: string; nExtra: number; sha: string; phase: "complete" }>;
export function run(argv: readonly string[], deps: Deps): Promise<unknown>;
