// MONARK Bell — domain -> OPERATOR map (ADR-T1aii-D1-bis C-9). A quorum of "two distinct providers" is only
// meaningful if the two are run by two INDEPENDENT operators. `providerOf` (sentinel/src/rpc.ts) returns the
// last two DNS labels, which is NOT the operator: Chainstack serves the SAME account under two hosts
// (`*.core.chainstack.com` -> `chainstack.com` AND the legacy `nd-*.p2pify.com` -> `p2pify.com`), and BNB's
// public seeds live on both `binance.org` and `bnbchain.org`. Counting those as two would fake a quorum.
//
// `operatorOf` collapses the known aliases to one operator id; an unmapped domain is its own operator (the
// safe default — a genuinely new provider is treated as distinct, and the map is extended by an ADR line, not
// guessed). This is the load-bearing distinctness key for `quorum2` and for `providers_distinct` in the
// journal; `providerOf` stays the LOGGING form (a bare host, never a key). Committed carte (C-9).
import { providerOf } from "../../sentinel/src/rpc.ts";

/** Known domain (providerOf output) -> operator id. Frozen; adding a row is an ADR line (C-9). */
export const OPERATOR_OF_DOMAIN: Readonly<Record<string, string>> = {
  "helius-rpc.com": "helius", // Helius (Solana, first provider, api-key in query)
  "chainstack.com": "chainstack", // Chainstack Growth (5-chain archive, hex key in path)
  "p2pify.com": "chainstack", // Chainstack legacy node host — SAME operator as chainstack.com
  "solana.com": "solana-foundation", // api.mainnet-beta.solana.com (Solana Foundation public RPC)
  "publicnode.com": "publicnode", // Allnodes publicnode (retired from the archival quorum, C-1)
  "pocket.network": "pocket", // Pocket Network keyless gateway (witness, not archive)
  "binance.org": "binance", // bsc-dataseed*.binance.org (BNB public seeds)
  "bnbchain.org": "binance", // bsc-dataseed*.bnbchain.org — SAME operator as binance.org
  "llamarpc.com": "llama", // llamarpc keyless (EVM)
  "drpc.org": "drpc", // dRPC keyless / Growth (EVM + Solana)
  "alchemy.com": "alchemy", // Alchemy (EVM + Robinhood Chain, archive)
  "ankr.com": "ankr", // Ankr multi-chain
};

/** The independent-operator id behind a URL (or a test-double bare name). Unmapped domain -> itself. */
export function operatorOf(url: string): string {
  const domain = providerOf(url);
  return OPERATOR_OF_DOMAIN[domain] ?? domain;
}
