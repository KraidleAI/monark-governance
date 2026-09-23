// UKEMI-CONC-1 (ADR-U4b amendment 2026-09-23) - the per-account read PLANS the recorder prefetches through the bounded
// window (pool.ts) when --concurrency n > 1, into a MEMOIZING reader (the --resume cache, or an in-RAM memo). The
// consumers then run UNCHANGED and SEQUENTIALLY over cache HITs - enumerateAndCountAtRisk (record.ts) and recordBook
// (book.ts, NOT touched: PIN 034fbff9 intact) - so holders_digest, n_at_risk_config, counts, book, book_digest and the
// hf_findings order are byte-identical to n=1 BY CONSTRUCTION: the aggregation stays the consumer's own, in holder
// order. A plan that drifted from its consumer is fail-SAFE (the consumer reads the missing key itself, sequentially)
// and is guarded by test (0 network read during recordBook after the prefetch). Pure over the reader (no fs/env/clock).
import { SEL, TRANSFER_TOPIC0, wordAddr, wordAt, decAddress, decUint, decodeAddressArray, decodeReserveData, decodeUserConfig, transferRecipients, type ReserveData } from "./abi.ts";
import { POOL, POOL_ADDRESSES_PROVIDER, ORACLE, type Cluster } from "./clusters.ts";
import { AbiMismatchError } from "./book.ts";
import { ConcordantRevertError, type UkemiReader } from "./rpc2.ts";
import { holdersDigestOf } from "./resume.ts";
import { runBounded, PoolStoppedError, type PoolReport, type PoolSignal } from "./pool.ts";

/** Live progress (structurally record.ts FilterProgress): holders, holders done, config-passing (cluster collateral ON
 *  and debt) seen - cumulative on arrival, so a stop still reports what was seen (diag n_at_risk_seen). */
export interface PassProgress { holders: number; config_read: number; n_at_risk_config: number; }
/** `every` (the heartbeat period in holders done) is REQUIRED: the one default lives in the CLI parse (--heartbeat-every,
 *  record.ts), never a second copy here (C-G2-1b: a hidden default silently ignored the flag at n > 1). */
export interface PrefetchOpts { fromBlock?: number | undefined; concurrency: number; progress?: PassProgress | undefined; onTick?: (() => void) | undefined; every: number; report?: PoolReport | undefined; }
interface Head { reservesList: string[]; clusterIdx: number[]; holders: string[]; reserve: (i: number, signal: PoolSignal) => Promise<ReserveData>; }

const NEVER: PoolSignal = { stopped: false };

/** The enumeration each consumer performs first, in its order (record.ts:66-81; book.ts:70-117 when `full`): oracle
 *  drift check, [blockAt], reserve list, per cluster collateral its reserve reads + aToken drift check + Transfer logs
 *  -> sorted holders. Sequential. `reserve(i)` = book.ts getReserve (:77-96): ONE chain per reserve index, single-flight
 *  across the window's tasks; description() tolerates ONLY a ConcordantRevertError (book.ts records "" and, a revert
 *  being uncached, re-reads it: the one declared network read left to recordBook). */
async function head(cluster: Cluster, block: number, reader: UkemiReader, fromBlock: number | undefined, full: boolean): Promise<Head> {
  const oracle = decAddress(wordAt(await reader.ethCall(POOL_ADDRESSES_PROVIDER, SEL.getPriceOracle, block), 0));
  if (oracle.toLowerCase() !== ORACLE.toLowerCase()) throw new AbiMismatchError(`oracle drift @${String(block)}: ${oracle} != ${ORACLE.toLowerCase()}`);
  if (full) await reader.blockAt(block);
  const reservesList = decodeAddressArray(await reader.ethCall(POOL, SEL.getReservesList, block));
  const memo = new Map<number, Promise<ReserveData>>();
  const reserve = (i: number, signal: PoolSignal): Promise<ReserveData> => {
    const hit = memo.get(i);
    if (hit !== undefined) return hit;
    const p = (async (): Promise<ReserveData> => {
      const rd = (to: string, data: string): Promise<string> => { if (signal.stopped) throw new PoolStoppedError(); return reader.ethCall(to, data, block); };
      const asset = reservesList[i];
      if (asset === undefined) throw new AbiMismatchError(`reserve index ${String(i)} out of range`);
      const r = decodeReserveData(await rd(POOL, SEL.getReserveData + wordAddr(asset)));
      if (!full) return r;
      const source = decAddress(wordAt(await rd(oracle, SEL.getSourceOfAsset + wordAddr(asset)), 0));
      try { await rd(source, SEL.description); } catch (e) { if (!(e instanceof ConcordantRevertError)) throw e; }
      await rd(oracle, SEL.getAssetPrice + wordAddr(asset));
      return r;
    })();
    memo.set(i, p);
    return p;
  };
  const clusterIdx: number[] = [];
  const holderSet = new Set<string>();
  for (const c of cluster.collaterals) {
    const i = reservesList.indexOf(c.asset.toLowerCase());
    if (i < 0) throw new AbiMismatchError(`cluster collateral ${c.asset} not in getReservesList @${String(block)}`);
    clusterIdx.push(i);
    const r = await reserve(i, NEVER);
    if (r.aToken.toLowerCase() !== c.aToken.toLowerCase()) throw new AbiMismatchError(`aToken drift @${String(block)}: ${r.aToken} != pinned ${c.aToken.toLowerCase()}`);
    const from = fromBlock !== undefined ? Math.max(c.reserveInitBlock, fromBlock) : c.reserveInitBlock;
    for (const h of transferRecipients(await reader.getLogsRange(c.aToken, [TRANSFER_TOPIC0], from, block))) holderSet.add(h);
  }
  return { reservesList, clusterIdx, holders: holdersDigestOf(holderSet).holders, reserve };
}

/** Cumulative progress + heartbeat, in the order of the sequential filter loop (record.ts:87-96): count, tick, then
 *  the config-passing tally. `every` = the heartbeat period in holders done (the --heartbeat-every value). */
function tick(p: PassProgress | undefined, passing: boolean, onTick: (() => void) | undefined, every: number): void {
  if (p === undefined) return;
  p.config_read += 1;
  if (onTick !== undefined && p.config_read % every === 0) onTick();
  if (passing) p.n_at_risk_config += 1;
}

/** Temps 1 (--filter-only, n > 1): every holder's getUserConfiguration (record.ts:85) through the window. */
export async function prefetchFilterReads(cluster: Cluster, block: number, reader: UkemiReader, opts: PrefetchOpts): Promise<void> {
  const { reservesList, clusterIdx, holders } = await head(cluster, block, reader, opts.fromBlock, false);
  if (opts.progress) opts.progress.holders = holders.length;
  await runBounded(holders, opts.concurrency, async (h) => {
    const { collateral, borrow } = decodeUserConfig(decUint(await reader.ethCall(POOL, SEL.getUserConfiguration + wordAddr(h), block)), reservesList.length);
    tick(opts.progress, clusterIdx.some((i) => collateral.includes(i)) && borrow.length > 0, opts.onTick, opts.every);
  }, opts.report);
}

/** Temps 2 (full course, n > 1): recordBook's per-holder read plan (book.ts:124-143), one task per holder. A task
 *  stops at its next read once the window is stopped (no read launched after a stop). */
export async function prefetchBookReads(cluster: Cluster, block: number, reader: UkemiReader, opts: PrefetchOpts): Promise<void> {
  const { reservesList, clusterIdx, holders, reserve } = await head(cluster, block, reader, opts.fromBlock, true);
  if (opts.progress) opts.progress.holders = holders.length;
  await runBounded(holders, opts.concurrency, async (h, _i, signal) => {
    const rd = (to: string, data: string): Promise<string> => { if (signal.stopped) throw new PoolStoppedError(); return reader.ethCall(to, data, block); };
    const { collateral, borrow } = decodeUserConfig(decUint(await rd(POOL, SEL.getUserConfiguration + wordAddr(h))), reservesList.length);
    const passing = clusterIdx.some((i) => collateral.includes(i)) && borrow.length > 0;
    tick(opts.progress, passing, opts.onTick, opts.every);
    if (!passing) return;
    let total = 0n;
    for (let k = 0; k < cluster.collaterals.length; k++) {
      const i = clusterIdx[k], c = cluster.collaterals[k];
      if (i === undefined || c === undefined || !collateral.includes(i)) continue;
      total += decUint(await rd(c.aToken, SEL.balanceOf + wordAddr(h)));
    }
    if (total === 0n) return; // book.ts:136 (excluded_zero_balance): NO account read - else an over-read (a paid call more than n=1)
    await rd(POOL, SEL.getUserAccountData + wordAddr(h));
    await rd(POOL, SEL.getUserEMode + wordAddr(h));
    for (const bi of borrow) await rd((await reserve(bi, signal)).variableDebtToken, SEL.balanceOf + wordAddr(h));
  }, opts.report);
}
