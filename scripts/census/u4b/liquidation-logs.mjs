// scripts/census/u4b/liquidation-logs.mjs
// ============================================================================================
// U-4b-1b-0 (decision 128 Q-D) — the COMMON LiquidationCall discovery logic, extracted so u4b-discover.mjs does NOT
// duplicate the labeler. PURE (no network, no I/O, no env): the topic0, the log decode, the WETH clustering by the
// U-3 D2 window rule, and a deterministic canonical serialization. The keyless getLogs round-trip lives in
// u4b-discover.mjs THROUGH @monark/rpc-guard (budgeted, decision 128 Q-D / ADR-U4b D5) — never here.
//
// The FROZEN labeler scripts/census/u3-realized.mjs (sha 755b3a38…) keeps its OWN copy of this logic: LIQ_TOPIC:52,
// the A-rawlog record shape it consumes at :439/:505, and the window rule at :445 (firstBlockAtOrAfter(ts+86400)-1).
// The equality of the two logics is PROVEN (same fixture => same output) by apps/sentinel/test/u4b-liquidation-logs.
// test.ts. Decode anchor: scripts/census/aave-liquidations.mjs:204-208 — cited, NOT imported (its module scope reads
// a fixture file). The labeler is NOT imported either: u3-realized.mjs:273 reads CHAINSTACK_ETH_URL at MODULE SCOPE,
// and a keyless-only discovery must never transitively load a paid key into memory (A-7 / CARTO-T1-1).
// ============================================================================================
import { createHash } from "node:crypto";
import { keccak256, decAddress, decUint, wordAt } from "../../../apps/sentinel/src/ukemi/abi.ts";
import { firstBlockAtOrAfter } from "../../../apps/sentinel/src/windows.ts";

/** LiquidationCall(collateralAsset, debtAsset, user, debtToCover, liquidatedCollateralAmount, liquidator,
 *  receiveAToken): 3 indexed (topics[1..3]) + 4 in data. topic0 SELF-TESTED to the census-A value (identical to the
 *  frozen labeler u3-realized.mjs:52/:57) — a keccak drift or a wrong signature fails closed at import. */
export const LIQ_TOPIC = keccak256("LiquidationCall(address,address,address,uint256,uint256,address,bool)");
if (LIQ_TOPIC !== "0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286") {
  throw new Error("liquidation-logs: LIQ_TOPIC self-test failed (!= census A / u3-realized.mjs:57)");
}

/** WETH (lowercased), pinned identical to the frozen labeler u3-realized.mjs ASSET.WETH (:64). */
export const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

/** Decode one raw LiquidationCall log (rpc2 LogEntry: hex blockNumber/logIndex, topics[], data) into the A-rawlog
 *  record shape the FROZEN labeler consumes (u3-realized.mjs:439/:505; aave-liquidations.mjs:408). Fail-closed on a
 *  wrong topic0 or a short topic set. Amounts are decimal STRINGS (BigInt-safe); receiveAToken is a bool. */
export function decodeLiquidationCall(log) {
  const topics = log.topics;
  if (!Array.isArray(topics) || topics.length < 4) throw new Error("liquidation-logs: a LiquidationCall log needs topic0 + 3 indexed topics");
  if (String(topics[0]).toLowerCase() !== LIQ_TOPIC) throw new Error(`liquidation-logs: topic0 ${String(topics[0]).slice(0, 12)} != LIQ_TOPIC (self-test / wrong event)`);
  const data = String(log.data).replace(/^0x/, "");
  return {
    block: parseInt(log.blockNumber, 16),
    logIndex: parseInt(log.logIndex, 16),
    tx: String(log.transactionHash).toLowerCase(),
    collateral: decAddress(topics[1]).toLowerCase(),
    debt: decAddress(topics[2]).toLowerCase(),
    user: decAddress(topics[3]).toLowerCase(),
    debtToCover: decUint("0x" + wordAt(data, 0)).toString(),
    liquidatedCollateralAmount: decUint("0x" + wordAt(data, 1)).toString(),
    liquidator: decAddress(wordAt(data, 2)).toLowerCase(),
    receiveAToken: decUint("0x" + wordAt(data, 3)) !== 0n,
  };
}

/** Decode a raw LiquidationCall log set into A-rawlog records, then SORT canonically by (block, logIndex). The sort
 *  is the SINGLE source of order (a getLogs range-split concatenation is not intrinsically ordered) — determinism. */
export function decodeAndSort(logs) {
  return logs.map(decodeLiquidationCall).sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
}

/** Greedy WETH clustering, VERBATIM the §DISC / U-3 D2 rule (frozen labeler u3-realized.mjs:439-447): over the
 *  WETH-collateral records in (block, logIndex) order, each unassigned record opens a cluster [B_first, B_last] with
 *  B_last = firstBlockAtOrAfter(ts(B_first)+86400, ...) - 1 (windows.ts — the SAME function the labeler uses at :445);
 *  members = the WETH records in that window; B0 = B_first - 1 (the recorder --block, §DISC:52). `tsOf` is the injected
 *  block->timestamp reader (the guarded pool in u4b-discover; a fixture map in the test). `hiSpan` bounds the binary
 *  search (labeler uses B_first+60000). n_distinct_liquidated feeds the caller's N_min eligibility (§DISC:46). */
export async function clusterWethLiquidations(records, tsOf, opts = {}) {
  const wethAsset = (opts.wethAsset ?? WETH).toLowerCase();
  const hiSpan = opts.hiSpan ?? 60000;
  const weth = records.filter((r) => r.collateral.toLowerCase() === wethAsset).sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
  const keyOf = (m) => m.block + "|" + m.logIndex + "|" + m.tx;
  const assigned = new Set();
  const clusters = [];
  for (const r of weth) {
    if (assigned.has(keyOf(r))) continue;
    const bFirst = r.block;
    const bLast = (await firstBlockAtOrAfter((await tsOf(bFirst)) + 86400, bFirst, bFirst + hiSpan, tsOf)) - 1;
    const members = weth.filter((m) => m.block >= bFirst && m.block <= bLast);
    for (const m of members) assigned.add(keyOf(m));
    clusters.push({ b_first: bFirst, b_last: bLast, b0: bFirst - 1, n_members: members.length, n_distinct_liquidated: new Set(members.map((m) => m.user.toLowerCase())).size, members });
  }
  return clusters;
}

/** Canonical JSON (keys sorted recursively, arrays in order, no whitespace) — the discovery brut is serialized with
 *  this so its sha256 is reproducible from (from, to, logs). Calque of the labeler's canon (u3-realized.mjs:87-92). */
export function canon(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canon).join(",") + "]";
  return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + canon(obj[k])).join(",") + "}";
}

/** sha256 (hex) of a UTF-8 string — the brut digest of the deterministic discovery output. */
export function sha256Hex(s) {
  return createHash("sha256").update(String(s), "utf8").digest("hex");
}
