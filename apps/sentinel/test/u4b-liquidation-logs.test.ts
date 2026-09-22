// U-4b-1b-0 (decision 128 Q-D) — EQUALITY of the extracted common LiquidationCall logic (liquidation-logs.mjs) with
// the FROZEN labeler's own copy (scripts/census/u3-realized.mjs, sha 755b3a38…), proven by "same fixture => same
// output": (1) the topic0 is byte-identical to the labeler's LIQ_TOPIC; (2) a decoded record is the EXACT A-rawlog
// shape the frozen reduceU3 CONSUMES (:505) — fed through the frozen reducer it yields the recomputed native sums;
// (3) the WETH clustering equals the labeler's window rule B_last = firstBlockAtOrAfter(ts(B_first)+86400)-1 (the SAME
// windows.ts function the labeler uses at :445). The labeler keeps its frozen copy; this test kills any drift. NO
// network (both run under env -u; the labeler's live pull is run-guarded and never entered here).
import { test } from "node:test";
import assert from "node:assert/strict";
import { LIQ_TOPIC as LIQ_LABELER, reduceU3 } from "../../../scripts/census/u3-realized.mjs";
import { LIQ_TOPIC, WETH, decodeLiquidationCall, clusterWethLiquidations } from "../../../scripts/census/u4b/liquidation-logs.mjs";
import { firstBlockAtOrAfter } from "../src/windows.ts";
import { wordAddr, topicAddr } from "../src/ukemi/abi.ts";

const DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC
const USER = "0x1111111111111111111111111111111111111111";
const LIQUIDATOR = "0x2222222222222222222222222222222222222222";
const word = (n: bigint): string => n.toString(16).padStart(64, "0");

// (1) topic0 identical to the frozen labeler AND to the pinned census-A value (a keccak/signature drift reds).
test("u4b_liqlogs_topic_equals_frozen_labeler", () => {
  assert.equal(LIQ_TOPIC, LIQ_LABELER, "liquidation-logs LIQ_TOPIC == the frozen labeler's LIQ_TOPIC (u3-realized.mjs:52)");
  assert.equal(LIQ_TOPIC, "0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286", "== the pinned census-A LiquidationCall topic0");
});

// (2) the decode produces the EXACT A-rawlog shape the FROZEN reduceU3 consumes: build a kind:"call" record from the
// decoded output exactly as u3-realized.mjs:505 does, feed the frozen reducer, and get the recomputed native sums. A
// wrong field name in the decode would make repayment_native/seized_native undefined here (mutant kill by construction).
test("u4b_liqlogs_decode_matches_the_frozen_reducer_consumed_shape", () => {
  const debtToCover = 123_456_789_000n, liqColl = 987_654_321n;
  const raw = {
    blockNumber: "0x" + (23_600_000).toString(16), logIndex: "0x2", transactionHash: "0x" + "ab".repeat(32),
    topics: [LIQ_TOPIC, topicAddr(WETH), topicAddr(DEBT), topicAddr(USER)],
    data: "0x" + word(debtToCover) + word(liqColl) + wordAddr(LIQUIDATOR) + word(1n),
  };
  const dec = decodeLiquidationCall(raw);
  assert.deepEqual(
    { collateral: dec.collateral, debt: dec.debt, user: dec.user, liquidator: dec.liquidator, debtToCover: dec.debtToCover, liquidatedCollateralAmount: dec.liquidatedCollateralAmount, receiveAToken: dec.receiveAToken },
    { collateral: WETH, debt: DEBT, user: USER, liquidator: LIQUIDATOR, debtToCover: String(debtToCover), liquidatedCollateralAmount: String(liqColl), receiveAToken: true },
    "decode: topics[1..3] => collateral/debt/user; data words => debtToCover/liquidatedCollateralAmount/liquidator/receiveAToken",
  );
  // The A-rawlog `kind:"call"` record, built EXACTLY as the frozen labeler does at u3-realized.mjs:505.
  const call = { kind: "call", event_id: "weth-test", block: dec.block, log_index: dec.logIndex, tx: dec.tx, collateral: dec.collateral, debt: dec.debt, user: dec.user, liquidator: dec.liquidator, debt_to_cover: dec.debtToCover, liquidated_collateral: dec.liquidatedCollateralAmount, receive_atoken: dec.receiveAToken, in_window: true };
  const meta = { kind: "meta", events: [{ id: "weth-test", collateral: WETH, pre_v33: false }] };
  const { realized } = reduceU3([meta, call]);
  assert.equal(realized.length, 1, "the frozen reduceU3 aggregates the decoded call into one realized position");
  assert.equal(realized[0]!.repayment_native, String(debtToCover), "reduceU3 read debt_to_cover from the decoded shape => repayment_native == debtToCover");
  assert.equal(realized[0]!.seized_native, String(liqColl), "reduceU3 read liquidated_collateral => seized_native == liquidatedCollateralAmount");
  assert.deepEqual({ user: realized[0]!.user, debt: realized[0]!.debt_asset, coll: realized[0]!.collateral_asset }, { user: USER, debt: DEBT, coll: WETH }, "the decoded topics flowed through the frozen reducer unchanged");
});

// (3) the WETH clustering equals the labeler's window rule (SAME windows.firstBlockAtOrAfter). ts linear (block*12):
// target ts(B)+86400 => boundary at B+7200 => B_last = B+7199. Non-WETH excluded; the out-of-window log opens cluster 2.
test("u4b_liqlogs_cluster_matches_the_frozen_labeler_window_rule", async () => {
  const B = 23_600_000;
  const OTHER = "0x9d39a5de30e57443bff2a8307a4256c8797a3497"; // sUSDe (non-WETH collateral => excluded)
  const rec = (block: number, logIndex: number, collateral: string, user: string) =>
    ({ block, logIndex, tx: "0x" + String(block) + String(logIndex), collateral, debt: DEBT, user, liquidator: LIQUIDATOR, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false });
  const records = [rec(B, 0, WETH, USER), rec(B + 10, 1, WETH, LIQUIDATOR), rec(B + 7000, 0, WETH, USER), rec(B + 7300, 0, WETH, LIQUIDATOR), rec(B + 5, 0, OTHER, USER)];
  const tsOf = (block: number): number => block * 12;
  const clusters = await clusterWethLiquidations(records, tsOf);
  const bLastRef = (await firstBlockAtOrAfter(tsOf(B) + 86400, B, B + 60000, (b) => tsOf(b))) - 1;
  assert.equal(clusters[0]!.b_first, B, "B_first = the first WETH log's block");
  assert.equal(clusters[0]!.b_last, bLastRef, "B_last == firstBlockAtOrAfter(ts(B_first)+86400)-1 (the SAME windows.ts rule the frozen labeler uses at :445)");
  assert.equal(clusters[0]!.b0, B - 1, "B0 = B_first - 1 (the recorder --block, §DISC:52)");
  assert.equal(clusters[0]!.n_members, 3, "the 3 WETH logs in [B_first,B_last] cluster; the OTHER-collateral log is EXCLUDED, B+7300 is out of window");
  assert.equal(clusters[0]!.n_distinct_liquidated, 2, "two distinct liquidated accounts in the window (USER twice, LIQUIDATOR once)");
  assert.equal(clusters.length, 2, "the B+7300 WETH log (outside the 24h window) opens a SECOND cluster (greedy, §DISC)");
});
