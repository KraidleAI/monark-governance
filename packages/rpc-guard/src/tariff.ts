// MONARK rpc-guard - Helius credit tariff, a CLOSED table, the sole home of the credit unit (C-7/C-14). The unit
// of the ledger is the REQUEST per (operator, method); credits are DERIVED = requests * tariff(method). Pinned by
// the orchestrator's on-site read of helius.dev/pricing (FAITS-tarification-helius-2026-09-21.md; decisions 112/C-14):
// "RPC calls are 1 credit with two exceptions: getProgramAccounts and archival calls are 10 credits. DAS calls
// are 10 credits." Cross-checked against apps/bell/src/rebase-crosscheck.ts:55-56 (CREDITS_PER_GTFA=10,
// CREDITS_PER_GET_TX=1). Version-stamped so the tariff is frozen in ONE place (ledger header `tariff_version`).
export const HELIUS_TARIFF_VERSION = "helius-2026-09-21";

/** The 10-credit methods: archival + getProgramAccounts + DAS (getAsset*). Everything else on the table = 1. A
 *  method ABSENT from the table is fail-closed (throws) - mis-pricing an archival/DAS method at 1 would be a
 *  fail-open of the HELIUS-1 class (ruling Q2). getTransactionsForAddress is the archival gTfA of the incident. */
const TEN_CREDIT = new Set<string>([
  "getTransactionsForAddress",
  "getProgramAccounts",
  "getAsset", "getAssetProof", "getAssetsByOwner", "getAssetsByGroup", "getAssetsByCreator",
  "getAssetsByAuthority", "searchAssets", "getSignaturesForAsset", "getTokenAccounts", "getNftEditions",
]);
const ONE_CREDIT = new Set<string>([
  "getSignaturesForAddress", "getTransaction", "getAccountInfo", "getMultipleAccounts",
  "getTokenAccountsByOwner", "getBalance", "getSlot", "getBlock", "getBlockHeight", "getLatestBlockhash",
  "sendTransaction", "getTokenSupply", "getTokenAccountBalance", "isBlockhashValid",
]);

/** Credits for one Helius request of `method`. Throws (fail-closed) when the method is not on the closed table -
 *  NEVER a default of 0 or a silent worst-case (T15, ruling Q2). */
export function heliusCredits(method: string): number {
  if (TEN_CREDIT.has(method)) return 10;
  if (ONE_CREDIT.has(method)) return 1;
  throw new Error(`rpc-guard: Helius method '${method}' is absent from the closed tariff table (fail-closed; ruling Q2)`);
}

// ---------------------------------------------------------------------------------------------------------------
// Chainstack Request-Unit (RU) tariff (GARDE-HELIUS-2, D1) - a CONSERVATIVE fail-closed calque of the Helius table.
// Pinned by the orchestrator's on-site read of docs.chainstack.com/docs/request-units
// (FAITS-tarification-chainstack-2026-09-21, orchestrator on-site read). The guard
// runs OFFLINE and cannot read the chain tip, so it cannot tell "full" (< 127 blocks behind, 1 RU) from "archive"
// (>= 127 behind, 2 RU) per request. So every method the FAITS marks age-sensitive-or-always-archive is priced
// 2 RU (the ceiling): the guard NEVER sub-counts. The over-count is absorbed by the ASYMMETRIC reconcile
// (Delta_dashboard <= ledger_run, decision 113) - it can never mask consumption outside the guard.
export const CHAINSTACK_TARIFF_VERSION = "chainstack-2026-09-21";

/** FAITS pt 4: the CLOSED list of EVM methods billed by block age ("less than 127 blocks behind the tip is full;
 *  127 or more behind is archive"). All 2 RU here (conservative). Exactly the 20 names on the page - the test
 *  re-lists them and asserts size === 20 (the word-for-word oracle). */
export const CHAINSTACK_AGE_SENSITIVE_EVM = new Set<string>([
  "eth_call", "eth_createAccessList", "eth_estimateGas", "eth_feeHistory", "eth_getAccount",
  "eth_getBalance", "eth_getBlockByNumber", "eth_getBlockReceipts", "eth_getBlockTransactionCountByHash",
  "eth_getBlockTransactionCountByNumber", "eth_getCode", "eth_getLogs", "eth_getProof", "eth_getStorageAt",
  "eth_getTransactionByBlockNumberAndIndex", "eth_getTransactionCount", "eth_getUncleCountByBlockHash",
  "eth_getUncleCountByBlockNumber", "eth_newFilter", "eth_simulateV1",
]);
/** FAITS pt 7: the CLOSED list of Solana methods to which archive applies (2 RU conservatively); the page marks
 *  getSignaturesForAddress + getFirstAvailableBlock ALWAYS archive, the rest by slot age - all 2 RU here. Size 8. */
export const CHAINSTACK_ARCHIVABLE_SOLANA = new Set<string>([
  "getTransaction", "getBlock", "getBlockTime", "getBlocks", "getBlocksWithLimit",
  "getSignaturesForAddress", "getFirstAvailableBlock", "getSignatureStatuses",
]);
/** FAITS pt 4 tail (any other EVM method = 1 RU): a CLOSED set of non-age-sensitive EVM methods MONARK could
 *  route through a Chainstack EVM endpoint, each DERIVED 1 RU because it is absent from the age-sensitive list. The
 *  recorder uses NO 1-RU method today (its three methods eth_call / eth_getLogs / eth_getBlockByNumber are all in
 *  the age-sensitive list => 2 RU); this set exists so a DRIFTED method fail-closes to `unknown_method` rather than
 *  silently defaulting to a price. The test asserts this set is DISJOINT from the two 2-RU sets. */
export const CHAINSTACK_ONE_RU_EVM = new Set<string>([
  "eth_blockNumber", "eth_chainId", "eth_getBlockByHash", "eth_getTransactionByHash",
  "eth_getTransactionReceipt", "eth_sendRawTransaction",
]);
/** GARDE-HELIUS-1b-0 (D-5, FAITS pt 7 "any other Solana method = 1 RU"): the CLOSED, ENUMERATED set of Solana
 *  methods a Bell course sends to a Chainstack Solana endpoint that are NOT on the archivable-Solana list, each
 *  DERIVED 1 RU. Bell sends `getAccountInfo` on Solana (universe -iii-a1); the RU tariff THREW `unknown_method` for
 *  it before 1b (a fail-closed refusal, but Bell cannot route it through Chainstack at all). This set is ENUMERATED,
 *  never a blanket default of 1 (which would sub-count a 2-RU archival method the tariff forgot - the HELIUS-1
 *  class). The test asserts it is DISJOINT from the two 2-RU Solana/EVM sets. */
export const CHAINSTACK_ONE_RU_SOLANA = new Set<string>([
  "getAccountInfo",
]);

/** RU for one Chainstack request of `method`. Prefix rule FIRST (FAITS pt 6: all debug_* / trace_* / arbtrace_*
 *  and eth_callMany are always 2 RU), then the closed sets. A method on NO closed list throws (fail-closed, calque
 *  Helius) - NEVER a default of 1 (which could sub-count a 2-RU archival method the tariff forgot). */
export function chainstackRu(method: string): number {
  if (/^(?:debug|trace|arbtrace)_/.test(method) || method === "eth_callMany") return 2; // FAITS pt 6 (prefix first)
  if (CHAINSTACK_AGE_SENSITIVE_EVM.has(method)) return 2; // FAITS pt 4
  if (CHAINSTACK_ARCHIVABLE_SOLANA.has(method)) return 2; // FAITS pt 7
  if (CHAINSTACK_ONE_RU_EVM.has(method)) return 1;        // FAITS pt 4 tail (not age-sensitive)
  if (CHAINSTACK_ONE_RU_SOLANA.has(method)) return 1;     // FAITS pt 7 tail (Solana, not archivable: getAccountInfo)
  throw new Error(`rpc-guard: Chainstack method '${method}' is absent from the closed RU tariff (fail-closed; calque Helius)`);
}

/** Keyless operators (the free ETH quorum providers + the Solana-Foundation witness) carry no paid tariff; their
 *  ledger lines are stamped with this fixed version so a provenance reader never reads a paid version on a 0-cost line. */
export const KEYLESS_TARIFF_VERSION = "keyless-0";

/** The tariff_version stamped on an operator's ledger line (GARDE-HELIUS-2): the RIGHT version per operator, so a
 *  chainstack.jsonl line never carries the Helius version (a provenance lie the reconcile would read). cli.ts opens
 *  ledgers by --op with no class in hand, so the mapping lives HERE as a pure op -> version function. */
export function tariffVersionOf(op: string): string {
  if (op === "helius") return HELIUS_TARIFF_VERSION;
  if (op === "chainstack") return CHAINSTACK_TARIFF_VERSION;
  return KEYLESS_TARIFF_VERSION;
}
