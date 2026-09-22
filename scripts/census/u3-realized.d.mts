// scripts/census/u3-realized.d.mts — type surface for the PURE reducer that scripts/census/u3-realized.mjs
// exports (behind a run-guard). It lets the type-checked test (test/u3-realized.test.ts)
// import reduceU3/canonicalJsonl/sumRepaymentNative WITHOUT executing the live pull or pulling the network,
// staying free of the ratcheted no-unsafe rules. Runtime implementation = u3-realized.mjs; Node ignores this
// file. Governance-only (not whitelisted for the public export; record-usde-calib.d.mts precedent).

/** One realized-label row Y_{i,e}: a position (user, debt, collateral) aggregated over its in-window calls. */
export interface RealizedRow {
  event_id: string;
  user: string;
  debt_asset: string;
  collateral_asset: string;
  n_calls: number;
  first_block: number;
  last_block: number;
  repayment_native: string;
  seized_native: string;
  repayment_base: string | null;
  seized_base: string | null;
  deficit_base: string;
  deficit_native: string;
  oracle_source_debt: string | null;
  oracle_source_collateral: string | null;
  residual: string[];
  txs: string[];
}

/** One oracle-source row: (event, asset) at a window bound (at_first_minus1 / at_last). */
export interface SourceRow {
  event_id: string;
  asset: string;
  borne: string;
  source: string;
  description: string;
}

/** One DeficitCreated row classified against the WETH cluster positions. */
export interface DeficitRow {
  event_id: string;
  block: number;
  tx: string;
  user: string;
  debt_asset: string;
  amount: string;
  kind: string;
}

export interface ReducedSeries {
  realized: RealizedRow[];
  sources: SourceRow[];
  deficit: DeficitRow[];
}

/** Pure reduction (no I/O, no network): decoded U3-inputs records -> the three canonical series. */
export function reduceU3(records: readonly unknown[]): ReducedSeries;

/** LiquidationCall topic0 (keccak of the event signature, self-tested at :57). Imported by the U-4b-1b-0 equality
 *  test to prove liquidation-logs.mjs re-derives the SAME topic as this frozen labeler (decision 128 Q-D). */
export const LIQ_TOPIC: string;

/** Canonical JSONL of a row array: each row key-sorted, no whitespace, one per line, trailing newline iff non-empty. */
export function canonicalJsonl(rows: readonly unknown[]): string;

/** Σ repayment_native per `${event_id}|${debt_asset}` over the realized rows (the U3-H3 pipeline identity).
 *  Only the three summed fields are required by the reduction. */
export function sumRepaymentNative(
  realized: readonly { event_id: string; debt_asset: string; repayment_native: string }[],
): Map<string, bigint>;
