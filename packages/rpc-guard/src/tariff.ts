// MONARK rpc-guard - Helius credit tariff, a CLOSED table, the sole home of the credit unit (C-7/C-14). The unit
// of the ledger is the REQUEST per (operator, method); credits are DERIVED = requests * tariff(method). Pinned by
// the orchestrator's on-site read of helius.dev/pricing (FAITS-tarification-helius-2026-09-21.md, decision 55):
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
