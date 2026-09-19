// UKEMI (ADR-U1 D1/D2/D6) — the recorder: enumerate at-risk holders of a cluster's aToken(s), read the
// liquidation book per account at an archive block B in quorum-2, recompute the health-factor cross-check,
// mark static eligibility (Perez Eq. 3 via the authoritative on-chain HF < 1e18), and emit a CANONICAL JSON
// digest plus a hash-chained timeline line. Pure over an injected `UkemiReader`, so the offline fixture replay
// and the live record path (record.ts) produce a byte-identical digest. Provenance (endpoints, timing,
// ukemi_sha, the HF findings) lives OUTSIDE the digest (ADR-U1 D2). No look-ahead: every read carries B.
import { createHash } from "node:crypto";
import { SEL, TRANSFER_TOPIC0, wordAddr, wordAt, decAddress, decUint, decString, decodeAddressArray, decodeReserveData, decodeUserAccountData, decodeUserConfig, transferRecipients, type ReserveData, type UserAccountData } from "./abi.ts";
import { crossCheckHealthFactor, eligibleStatic, type HfCheck } from "./wadray.ts";
import { POOL, POOL_ADDRESSES_PROVIDER, ORACLE, CHAIN_ID, type Cluster } from "./clusters.ts";
import { ConcordantRevertError, type UkemiReader } from "./rpc2.ts";
import { canonicalStringify, type Canon } from "@monark/monark";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

/** A reserve @B has drifted from what the recorder must decode (aToken re-pointed, struct too short, cluster
 *  collateral delisted): fail-closed, never a repli onto stale params (ADR-U1 D1). */
export class AbiMismatchError extends Error {}

/** The SINGLE canonical serialization and the `Canon` value type now live in @monark/monark (ADR-U1b D8, C-1):
 *  imported above (no second definition of "canonical") and re-exported here for ukemi.test.ts / record.ts. */
export { canonicalStringify };
export type { Canon };
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** HF cross-check finding for one account (provenance; outside the digest — depends on our WadRayMath). */
export interface HfFinding { address: string; kind: HfCheck["kind"]; hf_onchain: string; hf_recompute: string | null; hf_delta: string | null; emode: string | null; }
function toFinding(address: string, c: HfCheck): HfFinding {
  return c.kind === "checked"
    ? { address, kind: c.kind, hf_onchain: c.hf_onchain.toString(), hf_recompute: c.hf_recompute.toString(), hf_delta: c.hf_delta.toString(), emode: null }
    : { address, kind: c.kind, hf_onchain: c.hf_onchain.toString(), hf_recompute: null, hf_delta: null, emode: c.emode.toString() };
}

/** The append-only timeline line (ADR-U1 D6 / Narabi motif). `line_hash` covers facts+digests only. */
export interface UkemiTimelineLine {
  cluster: string; block: string; block_hash: string; from_block: string; to_block: string;
  holders_digest: string; distinct_recipients: string; book_digest: string;
  attestation_ref: string | null; pair_status: "recorded" | "no_quorum" | "abi_mismatch" | "unfinalized_block";
  prev_line_hash: string; line_hash: string;
}
/** Hashed projection (facts+digests+prev), fixed order — the anti-tamper witness (mutant 5). */
export function lineHashedFields(l: UkemiTimelineLine): unknown[] {
  return [l.cluster, l.block, l.block_hash, l.from_block, l.to_block, l.holders_digest, l.distinct_recipients, l.book_digest, l.attestation_ref, l.pair_status, l.prev_line_hash];
}
export const ukemiLineHash = (l: UkemiTimelineLine): string => createHash("sha256").update(JSON.stringify(lineHashedFields(l))).digest("hex");

export interface RecordResult {
  book: Canon;
  book_digest: string;
  holders_digest: string;
  counts: { holders: number; at_risk: number; eligible: number; excluded_collateral_off: number; excluded_no_debt: number; excluded_zero_balance: number };
  hf_findings: HfFinding[];
  timeline: UkemiTimelineLine;
}

interface CachedReserve { rd: ReserveData; source: string; description: string; price: bigint; }
interface AtRisk { address: string; config: bigint; emode: bigint; balances: Array<{ token: string; amount: bigint }>; uad: UserAccountData; eligible: boolean; }

/** Options for a bounded record (hardening 2026-09-19). `fromBlock` raises the enumeration FLOOR: Transfer logs
 *  are read from max(reserveInitBlock, fromBlock) instead of the full history — the committed successor to the
 *  G1 §5b wrapper's forced from-block, so a keyless live run can bound its window. Omitted ⇒ full history from
 *  reserveInitBlock (the fixture-replay path; the pinned digest 034fbff9… is unchanged). */
export interface RecordOpts { fromBlock?: number | undefined; }

/** Record the liquidation book of `cluster` at archive `block` through `reader` (quorum-2). Pure over the reader:
 *  the same recorded responses always yield the same `book_digest`. `prevLineHash` chains the timeline (GENESIS
 *  for the first line). `opts.fromBlock` bounds the enumeration window (a real subset run, a different digest). */
export async function recordBook(cluster: Cluster, block: number, reader: UkemiReader, prevLineHash = "GENESIS", opts: RecordOpts = {}): Promise<RecordResult> {
  // Oracle resolved live (never hard-coded), cross-checked against the pinned AaveOracle.
  const oracle = decAddress(wordAt(await reader.ethCall(POOL_ADDRESSES_PROVIDER, SEL.getPriceOracle, block), 0));
  if (oracle.toLowerCase() !== ORACLE.toLowerCase()) throw new AbiMismatchError(`oracle drift @${block}: ${oracle} != ${ORACLE.toLowerCase()}`);
  const { hash: blockHash } = await reader.blockAt(block);
  const reservesList = decodeAddressArray(await reader.ethCall(POOL, SEL.getReservesList, block));
  const idxOf = (asset: string): number => reservesList.indexOf(asset.toLowerCase());

  const rcache = new Map<number, CachedReserve>();
  const getReserve = async (i: number): Promise<CachedReserve> => {
    const hit = rcache.get(i); if (hit) return hit;
    const asset = reservesList[i]; if (asset === undefined) throw new AbiMismatchError(`reserve index ${i} out of range`);
    const rd = decodeReserveData(await reader.ethCall(POOL, SEL.getReserveData + wordAddr(asset), block));
    const source = decAddress(wordAt(await reader.ethCall(oracle, SEL.getSourceOfAsset + wordAddr(asset), block), 0));
    // Some oracle sources expose NO `description()` (e.g. GHO's fixed-price oracle reverts on it): a CONCORDANT
    // revert (>= 2 distinct providers returning the same revert) is a real on-chain fact recorded as "" — the
    // source ADDRESS is the digest-bearing datum, the description a human-readable label (ADR-U1 D1/D3 amendment
    // 2026-09-19, V-1). ONLY a ConcordantRevertError is tolerated here: a provider DISAGREEMENT
    // (QuorumDisagreementError), a no-quorum (NoQuorumError), or any other error abstains the whole book.
    let description = "";
    try {
      description = decString(await reader.ethCall(source, SEL.description, block));
    } catch (e) {
      if (!(e instanceof ConcordantRevertError)) throw e;
      description = "";
    }
    const price = decUint(await reader.ethCall(oracle, SEL.getAssetPrice + wordAddr(asset), block));
    const v: CachedReserve = { rd, source, description, price }; rcache.set(i, v); return v;
  };

  // 1) Enumerate aToken holders via Transfer logs, per cluster collateral (from its ReserveInitialized block).
  const legs: Canon[] = [];
  const clusterIdx: number[] = [];
  const holderSet = new Set<string>();
  let minFrom = block;
  for (const c of cluster.collaterals) {
    const i = idxOf(c.asset); if (i < 0) throw new AbiMismatchError(`cluster collateral ${c.asset} not in getReservesList @${block}`);
    clusterIdx.push(i);
    const { rd } = await getReserve(i);
    if (rd.aToken.toLowerCase() !== c.aToken.toLowerCase()) throw new AbiMismatchError(`aToken drift @${block}: ${rd.aToken} != pinned ${c.aToken.toLowerCase()}`);
    // Enumeration floor: full history from reserveInitBlock unless a bounded window is requested (never below it).
    const fromBlock = opts.fromBlock !== undefined ? Math.max(c.reserveInitBlock, opts.fromBlock) : c.reserveInitBlock;
    const logs = await reader.getLogsRange(c.aToken, [TRANSFER_TOPIC0], fromBlock, block);
    for (const r of transferRecipients(logs)) holderSet.add(r);
    minFrom = Math.min(minFrom, fromBlock);
    legs.push({ atoken: c.aToken.toLowerCase(), asset: c.asset.toLowerCase(), reserve_init_block: String(c.reserveInitBlock) });
  }
  holderSet.delete(ZERO_ADDR);
  const holders = [...holderSet].sort();
  const holders_digest = sha256(holders.join("\n"));

  // 2) Filter (getUserConfiguration first, bounds cost — ADR-U1 D4) + read at-risk accounts.
  let excCollOff = 0, excNoDebt = 0, excZero = 0;
  const usedReserves = new Set<number>();
  const atrisk: AtRisk[] = [];
  const hf_findings: HfFinding[] = [];
  for (const h of holders) {
    const config = decUint(await reader.ethCall(POOL, SEL.getUserConfiguration + wordAddr(h), block));
    const { collateral, borrow } = decodeUserConfig(config, reservesList.length);
    if (!clusterIdx.some((i) => collateral.includes(i))) { excCollOff++; continue; }
    if (borrow.length === 0) { excNoDebt++; continue; }
    let atokenTotal = 0n; const balances: Array<{ token: string; amount: bigint }> = [];
    for (let k = 0; k < cluster.collaterals.length; k++) {
      const i = clusterIdx[k]; const c = cluster.collaterals[k];
      if (i === undefined || c === undefined || !collateral.includes(i)) continue;
      const bal = decUint(await reader.ethCall(c.aToken, SEL.balanceOf + wordAddr(h), block));
      if (bal > 0n) { atokenTotal += bal; balances.push({ token: c.aToken.toLowerCase(), amount: bal }); usedReserves.add(i); }
    }
    if (atokenTotal === 0n) { excZero++; continue; }
    const uad = decodeUserAccountData(await reader.ethCall(POOL, SEL.getUserAccountData + wordAddr(h), block));
    const emode = decUint(await reader.ethCall(POOL, SEL.getUserEMode + wordAddr(h), block));
    for (const bi of borrow) {
      const { rd } = await getReserve(bi);
      const bal = decUint(await reader.ethCall(rd.variableDebtToken, SEL.balanceOf + wordAddr(h), block));
      if (bal > 0n) { balances.push({ token: rd.variableDebtToken.toLowerCase(), amount: bal }); usedReserves.add(bi); }
    }
    balances.sort((a, b) => (a.token < b.token ? -1 : a.token > b.token ? 1 : 0));
    hf_findings.push(toFinding(h, crossCheckHealthFactor(uad, emode)));
    atrisk.push({ address: h, config, emode, balances, uad, eligible: eligibleStatic(uad.healthFactor) });
  }
  atrisk.sort((a, b) => (a.address < b.address ? -1 : 1));

  // 3) Reserve params + oracle price/source for every reserve used by an at-risk account (sorted by asset).
  const reserveCanon: Canon[] = [];
  for (const i of [...usedReserves].sort((a, b) => a - b)) {
    const asset = reservesList[i]; if (asset === undefined) continue;
    const { rd, source, description, price } = await getReserve(i);
    reserveCanon.push({
      asset, atoken: rd.aToken, variable_debt_token: rd.variableDebtToken, decimals: rd.decimals.toString(),
      ltv_bps: rd.ltvBps.toString(), liquidation_threshold_bps: rd.liquidationThresholdBps.toString(),
      liquidation_bonus_bps: rd.liquidationBonusBps.toString(), reserve_emode_category: rd.emodeCategory.toString(),
      oracle_source: source, oracle_description: description, price_base_8dec: price.toString(),
    });
  }
  reserveCanon.sort((a, b) => (canonAsset(a) < canonAsset(b) ? -1 : canonAsset(a) > canonAsset(b) ? 1 : 0));

  // 4) Eligible aggregate (Perez Eq. 3): count + summed debt/collateral in base currency (8-dec).
  let eligCount = 0; let eligDebt = 0n; let eligColl = 0n;
  const accountsCanon: Canon[] = atrisk.map((a) => {
    if (a.eligible) { eligCount++; eligDebt += a.uad.totalDebtBase; eligColl += a.uad.totalCollateralBase; }
    return {
      address: a.address, user_config: a.config.toString(), emode: a.emode.toString(),
      balances: a.balances.map((b) => ({ token: b.token, amount: b.amount.toString() })),
      total_collateral_base: a.uad.totalCollateralBase.toString(), total_debt_base: a.uad.totalDebtBase.toString(),
      current_liquidation_threshold_bps: a.uad.currentLiquidationThresholdBps.toString(), ltv_bps: a.uad.ltvBps.toString(),
      hf_onchain: a.uad.healthFactor.toString(), eligible_static: a.eligible,
    };
  });

  const book: Canon = {
    schema: "ukemi-book/1", chain_id: CHAIN_ID, cluster: cluster.id, pool: POOL.toLowerCase(), oracle: oracle,
    block: String(block), block_hash: blockHash,
    enumeration: { legs: legs, transfer_topic0: TRANSFER_TOPIC0, from_block: String(minFrom), to_block: String(block), distinct_holders: String(holders.length), holders_digest },
    reserves: reserveCanon, accounts: accountsCanon,
    excluded: { collateral_off: String(excCollOff), no_debt: String(excNoDebt), zero_balance: String(excZero) },
    eligible_aggregate: { count: String(eligCount), total_debt_base: eligDebt.toString(), total_collateral_base: eligColl.toString() },
  };
  const book_digest = sha256(canonicalStringify(book));

  const bare: UkemiTimelineLine = {
    cluster: cluster.id, block: String(block), block_hash: blockHash, from_block: String(minFrom), to_block: String(block),
    holders_digest, distinct_recipients: String(holders.length), book_digest, attestation_ref: null, pair_status: "recorded",
    prev_line_hash: prevLineHash, line_hash: "",
  };
  bare.line_hash = ukemiLineHash(bare);

  return {
    book, book_digest, holders_digest,
    counts: { holders: holders.length, at_risk: atrisk.length, eligible: eligCount, excluded_collateral_off: excCollOff, excluded_no_debt: excNoDebt, excluded_zero_balance: excZero },
    hf_findings, timeline: bare,
  };
}

function canonAsset(r: Canon): string { return typeof r === "object" && !Array.isArray(r) && typeof r.asset === "string" ? r.asset : ""; }
