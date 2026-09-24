// Type declarations for scripts/census/u4b/liquidation-logs.mjs (U-4b-1b-0, decision 128 Q-D — the common
// LiquidationCall discovery logic). Governance surface for the type-checked test u4b-liquidation-logs.test.ts.
// Runtime = the .mjs; Node ignores this file (skipLibCheck: true).

/** A raw log as returned by the rpc2 pool / eth_getLogs (hex block/logIndex, 0x topics, 0x data). */
export interface RawLog {
  blockNumber: string;
  logIndex: string;
  transactionHash: string;
  topics: readonly string[];
  data: string;
}

/** A decoded LiquidationCall record — the A-rawlog shape the frozen labeler consumes (u3-realized.mjs:439/:505). */
export interface LiquidationRecord {
  block: number;
  logIndex: number;
  tx: string;
  collateral: string;
  debt: string;
  user: string;
  debtToCover: string;
  liquidatedCollateralAmount: string;
  liquidator: string;
  receiveAToken: boolean;
}

/** One greedy WETH cluster (episode candidate) per the §DISC / U-3 D2 window rule. */
export interface WethCluster {
  b_first: number;
  b_last: number;
  b0: number;
  n_members: number;
  n_distinct_liquidated: number;
  members: LiquidationRecord[];
}

export const LIQ_TOPIC: string;
export const WETH: string;
export function decodeLiquidationCall(log: RawLog): LiquidationRecord;
export function decodeAndSort(logs: readonly RawLog[]): LiquidationRecord[];
export function clusterWethLiquidations(
  records: readonly LiquidationRecord[],
  tsOf: (block: number) => number | Promise<number>,
  opts?: { wethAsset?: string; hiSpan?: number },
): Promise<WethCluster[]>;
export function canon(obj: unknown): string;
export function sha256Hex(s: string): string;
