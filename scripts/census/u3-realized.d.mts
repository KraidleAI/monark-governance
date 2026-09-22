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

// ---------------------------------------------------------------------------------------------
// LOT U-4b-1b-1 (ruling QF-2): the LIVE section is parametrised. These symbols let a non-LLM test
// assert the defaults equal the pinned e2 values and replay a synthetic episode, all offline. The
// PURE reducer above is byte-identical to the pinned blob (condition (i-a): no 9th frozen sha).
// ---------------------------------------------------------------------------------------------

/** One pre-committed episode definition (prereg section 3) — the shape of a --events entry. */
export interface EventDef {
  id: string;
  collateral: string;
  clusterLo: number;
  clusterHi: number;
  preV33: boolean;
}

/** The pinned rawlogs sha256 (the --rawlogs-sha DEFAULT = the e2 value). */
export const RAWLOGS_SHA: string;
/** The pinned e2/e1/e3 episode definitions (the --events DEFAULT). */
export const EVENTS: readonly EventDef[];

/** Resolved labeler CLI arguments. Every default equals the pinned e2 value, so no argument is byte-identical. */
export interface LabelerArgs {
  rawlogs: string;
  rawlogsSha: string;
  events: readonly EventDef[];
  episodeTag: string | null;
  out: string | null;
  operators: string[] | null;
  archiveOperator: string | null;
  allowPaid: boolean;
  minIntervalMs: number;
  preregFile: string;
  preregSha: string;
  maxCalls: number;
  rawsDir: string;
  only: string[] | null;
  ledgerDir: string | null;
  cycle: string | null;
  floor: string | null;
  maxRu: string | null;
  methodCaps: string | null;
}

/** Parse the labeler CLI (reads a --events file when given; no network). */
export function parseArgs(argv: readonly string[]): LabelerArgs;

/** Run the live pull (network + disk). `env` is INJECTED — never read at module scope (the archive leg's key
 *  is read only inside @monark/rpc-guard). Returns the run summary. */
export function main(deps: { env: Record<string, string | undefined>; argv: readonly string[] }): Promise<unknown>;
