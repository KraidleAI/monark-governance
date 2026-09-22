import { test } from "node:test";
import assert from "node:assert/strict";
import { heliusCredits, HELIUS_TARIFF_VERSION, chainstackRu, CHAINSTACK_TARIFF_VERSION } from "../src/index.ts";
import { CHAINSTACK_AGE_SENSITIVE_EVM, CHAINSTACK_ARCHIVABLE_SOLANA, CHAINSTACK_ONE_RU_EVM, CHAINSTACK_ONE_RU_SOLANA } from "../src/tariff.ts";

test("unknown_method_fail_closed", () => {
  // the [lu] closed table (FAITS-tarification-helius-2026-09-21 + rebase-crosscheck.ts:55-56):
  assert.equal(heliusCredits("getTransactionsForAddress"), 10, "archival gTfA - the incident's method");
  assert.equal(heliusCredits("getProgramAccounts"), 10);
  assert.equal(heliusCredits("getAssetsByOwner"), 10, "a DAS call");
  assert.equal(heliusCredits("getTransaction"), 1);
  assert.equal(heliusCredits("getSignaturesForAddress"), 1);
  // a method ABSENT from the closed table is REFUSED (throws), never priced 0 or a silent worst-case (ruling Q2).
  assert.throws(() => heliusCredits("getMagicUndocumentedArchival"), /absent from the closed tariff/);
  assert.equal(typeof HELIUS_TARIFF_VERSION, "string");
});

test("chainstack_tariff_is_conservative_and_closed", () => {
  // The [lu] FAITS closed lists (FAITS-tarification-chainstack-2026-09-21.md), re-listed here WORD FOR WORD so a drift
  // on either side reds. Everything on these lists is priced 2 RU (conservative: the guard cannot read the tip offline).
  const FAITS_AGE_SENSITIVE_EVM_20 = [ // FAITS pt 4 (exactly 20)
    "eth_call", "eth_createAccessList", "eth_estimateGas", "eth_feeHistory", "eth_getAccount",
    "eth_getBalance", "eth_getBlockByNumber", "eth_getBlockReceipts", "eth_getBlockTransactionCountByHash",
    "eth_getBlockTransactionCountByNumber", "eth_getCode", "eth_getLogs", "eth_getProof", "eth_getStorageAt",
    "eth_getTransactionByBlockNumberAndIndex", "eth_getTransactionCount", "eth_getUncleCountByBlockHash",
    "eth_getUncleCountByBlockNumber", "eth_newFilter", "eth_simulateV1",
  ];
  const FAITS_ARCHIVABLE_SOLANA_8 = [ // FAITS pt 7 (exactly 8)
    "getTransaction", "getBlock", "getBlockTime", "getBlocks", "getBlocksWithLimit",
    "getSignaturesForAddress", "getFirstAvailableBlock", "getSignatureStatuses",
  ];
  // (1) the CODE sets equal the FAITS lists, word for word (set membership + exact size).
  assert.equal(CHAINSTACK_AGE_SENSITIVE_EVM.size, 20);
  assert.equal(CHAINSTACK_ARCHIVABLE_SOLANA.size, 8);
  assert.deepEqual([...CHAINSTACK_AGE_SENSITIVE_EVM].sort(), [...FAITS_AGE_SENSITIVE_EVM_20].sort());
  assert.deepEqual([...CHAINSTACK_ARCHIVABLE_SOLANA].sort(), [...FAITS_ARCHIVABLE_SOLANA_8].sort());
  // (2) every 2-RU method prices 2 (mutant "eth_getLogs at 1 RU" reds here; the 20-list includes eth_getLogs).
  for (const m of FAITS_AGE_SENSITIVE_EVM_20) assert.equal(chainstackRu(m), 2, `${m} is age-sensitive => 2 RU`);
  for (const m of FAITS_ARCHIVABLE_SOLANA_8) assert.equal(chainstackRu(m), 2, `${m} is Solana-archivable => 2 RU`);
  // (3) FAITS pt 6: debug_* / trace_* / arbtrace_* by prefix + eth_callMany are always 2 RU.
  for (const m of ["debug_traceCall", "trace_block", "arbtrace_call", "eth_callMany"]) assert.equal(chainstackRu(m), 2, `${m} => 2 RU`);
  // (4) the 1-RU set is DISJOINT from the two 2-RU sets (FAITS pt 4 tail: not age-sensitive => 1 RU) and prices 1.
  for (const m of CHAINSTACK_ONE_RU_EVM) {
    assert.ok(!CHAINSTACK_AGE_SENSITIVE_EVM.has(m) && !CHAINSTACK_ARCHIVABLE_SOLANA.has(m), `${m} must be absent from the 2-RU lists`);
    assert.equal(chainstackRu(m), 1, `${m} is a known non-age-sensitive EVM method => 1 RU`);
  }
  // (5) a method on NO closed list is REFUSED (throws), never defaulted to 1 (mutant "unknown tolerated" reds here).
  assert.throws(() => chainstackRu("eth_totallyBogusUndocumented"), /absent from the closed RU tariff/);
  assert.throws(() => chainstackRu("getSomeUndocumentedSolana"), /absent from the closed RU tariff/);
  assert.equal(typeof CHAINSTACK_TARIFF_VERSION, "string");
});

test("chainstack_solana_getaccountinfo_is_one_ru", () => {
  // D-5 (FAITS pt 7 "any other Solana method = 1 RU"): getAccountInfo (the Bell universe -iii-a1 method) is 1 RU on
  // Chainstack Solana - it THREW `unknown_method` before 1b, so Bell could not route it through Chainstack at all.
  assert.equal(chainstackRu("getAccountInfo"), 1, "getAccountInfo on Chainstack Solana = 1 RU (FAITS pt 7 tail)");
  assert.ok(CHAINSTACK_ONE_RU_SOLANA.has("getAccountInfo"), "getAccountInfo is on the ENUMERATED 1-RU Solana set");
  // the enumerated 1-RU Solana set is DISJOINT from both 2-RU sets (never double-priced; the guard cannot read the
  // tip offline, so any archivable method stays 2 RU - conservative).
  for (const m of CHAINSTACK_ONE_RU_SOLANA) {
    assert.ok(!CHAINSTACK_ARCHIVABLE_SOLANA.has(m) && !CHAINSTACK_AGE_SENSITIVE_EVM.has(m), `${m} must be absent from the 2-RU lists`);
    assert.equal(chainstackRu(m), 1, `${m} is a known non-archivable Solana method => 1 RU`);
  }
  // NOT a blanket default: an UNLISTED Solana method still fail-closes (mutant "getAccountInfo tariffed by default"
  // = a catch-all `return 1` reds here - an unknown method would then price 1 instead of throwing, the HELIUS-1 class).
  assert.throws(() => chainstackRu("getVoteAccountsUndocumented"), /absent from the closed RU tariff/, "an unlisted Solana method fail-closes, never a silent 1 RU default");
});
