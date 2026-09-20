// MONARK Bell — declared registry of tokens and pools (ADR-B0 D2, item T-1a / C-7).
//
// Every address here is (a) sourced from a NAMED public API (url + fetch date + sha256 of the exact
// response body I read — an AUDIT snapshot; those bodies carry time-varying fields, so the sha pins
// "what I read on 2026-09-19", it is NOT a reproducible identity), AND (b) CONFIRMED FIRST-HAND ON-CHAIN
// by a reproducible call whose result does not drift (getAccountInfo owner / eth_call symbol+decimals).
// The on-chain check is the load-bearing [lu, first-hand]; the API snapshot is provenance/audit.
//
// This file carries NO secret. The base58 mints below look key-shaped by construction (xStocks use an
// "Xs" vanity prefix) — the secret scan (bell test `bell_no_secret_in_repo`) matches CONTEXT
// (Authorization / api-key= / *_API_KEY=), never 32-byte base58 shape, so this registry stays green.

export type Chain = "solana" | "ethereum";
export type TokenStandard = "token-2022" | "erc-20";

export interface Provenance {
  readonly api: string; // source API URL (query trimmed to the endpoint + the mint/pool id)
  readonly fetchedAt: string; // ISO date the snapshot was taken
  readonly snapshotSha256: string; // sha256 (first 12 hex) of the exact response body read — audit only
  readonly onchain: string; // reproducible first-hand verification performed + its result
}

export interface TokenRef {
  readonly symbol: string;
  readonly chain: Chain;
  readonly address: string; // mint (Solana) / contract (Ethereum)
  readonly decimals: number;
  readonly standard: TokenStandard;
  readonly source: Provenance;
}

export interface PoolRef {
  readonly label: string;
  readonly dex: string;
  readonly chain: Chain;
  readonly poolId: string;
  readonly programId?: string; // Solana AMM program (identifies the pool family)
  readonly baseSymbol: string; // the tokenized security
  readonly quoteSymbol: string; // the numeraire (USDC / WETH)
  // Solana: the two vault (reserve) token accounts. VWAP is recomputed from the SIGNED delta of these
  // exact accounts per transaction (ADR-B0 D2 i) — declaring them by address makes the extraction
  // deterministic and AMM-family-agnostic (no per-program layout decoding, Jupiter hops excluded).
  readonly vaultBase?: string;
  readonly vaultQuote?: string;
  // Per-pool registry fields (C-13, ADR-T1aii-D1-bis). baseIndex names WHICH leg is the tokenized security:
  // Solana vault extraction is order-independent (signed vault deltas), so baseIndex=0 means "vaultBase is the
  // base leg" (a declared invariant, checked by the registry test); the EVM decoders (-b2a) use it to fix
  // token0/1. baseDec/quoteDec are the two decimals (a wrong value scales VWAP by 10^delta — the vwap oracle
  // reddens). underlying is the reference security ticker. chainId is the numeric EVM chainId, or "solana".
  // censusSha pins the census-v3.csv the row was reconciled against. foundingPool records (MEASURED, spike
  // 2026-09-20) whether THIS pool existed in the 2025-07..10 founding window — the four below are 2026 CLMM
  // pools (false); the founding-window pools are a discovery item escalated in docs/PLI-lot-t1a-ii-b1.md.
  readonly baseIndex?: 0 | 1;
  readonly baseDec?: number;
  readonly quoteDec?: number;
  readonly underlying?: string;
  readonly chainId?: number | "solana";
  readonly censusSha?: string;
  readonly foundingPool?: boolean;
  readonly source: Provenance;
}

/** sha256 of the census-v3.csv (2026-09-19) this registry's Solana rows were reconciled against (C-13). */
export const CENSUS_V3_SHA256 = "25db700eb527651042c141e5f8a0e779b76db3e7b45608e77171628f862509c6";

/** Canonical numeraires (quote legs). Confirmed on-chain: standard USDC mint / contract. */
export const USDC_SOLANA = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_ETHEREUM = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

/** L-2 (C-5): committed programId -> dex map. Each entry's programId is READ on-chain (owner-of-owner) with a named
 *  source; an id OFF this map is labelled `unknown-program` with the id lu — NEVER a dex from memory. Raydium CLMM is
 *  the only family committed so far (the four `POOLS` rows, on-chain owner-of-owner). Adding a row is an ADR line. */
export const DEX_BY_PROGRAM_ID: Readonly<Record<string, string>> = {
  CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK: "raydium-clmm", // Raydium CLMM program (pools.ts rows, on-chain)
};
/** L-2 (C-6): committed CLOSED list of USD-stable quote mints (on-chain provenance). USDC only today; USDT/other =
 *  an ADR line with a getAccountInfo-confirmed mint + source. A quote mint OFF this list => `quote_class` "non-usd"
 *  (excluded from the -ii course, ADR-B0 D6 — a VWAP in SOL vs a USD close would need a third-party rate). */
export const USD_STABLE_MINTS: readonly string[] = [USDC_SOLANA];
/** L-1 (C-3): the PRE-REGISTERED founding-vault retention threshold (PLI). A vault whose share of the sampled tx is
 *  >= this fraction is retained as a founding pool; present but below => candidate_below_threshold (published). */
export const FOUNDING_DISCOVERY_THRESHOLD = 0.05;

const JUP = (q: string) => `https://lite-api.jup.ag/tokens/v2/search?query=${q}`;
const D = "2026-09-19";

/** xStocks (Backed Finance) on Solana — Token-2022, 8 decimals. All 4 confirmed on-chain: getAccountInfo owner
 *  == Token-2022 program, decimals == 8 (impostor `...pump` / miscased tickers excluded by the check). */
export const XSTOCKS: readonly TokenRef[] = [
  { symbol: "TSLAx", chain: "solana", address: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", decimals: 8, standard: "token-2022",
    source: { api: JUP("TSLAx"), fetchedAt: D, snapshotSha256: "8b5cda01719c", onchain: "getAccountInfo.owner==Token-2022, decimals=8" } },
  { symbol: "SPYx", chain: "solana", address: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W", decimals: 8, standard: "token-2022",
    source: { api: JUP("xStock"), fetchedAt: D, snapshotSha256: "6affa4e6efaa", onchain: "getAccountInfo.owner==Token-2022, decimals=8" } },
  { symbol: "NVDAx", chain: "solana", address: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", decimals: 8, standard: "token-2022",
    source: { api: JUP("NVDAx"), fetchedAt: D, snapshotSha256: "c6bd6df7aebe", onchain: "getAccountInfo.owner==Token-2022, decimals=8" } },
  { symbol: "AAPLx", chain: "solana", address: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", decimals: 8, standard: "token-2022",
    source: { api: JUP("AAPLx"), fetchedAt: D, snapshotSha256: "cb54a56dc928", onchain: "getAccountInfo.owner==Token-2022, decimals=8" } },
];

/** Ondo Global Markets ("Ondo Stocks") on Ethereum — ERC-20, 18 decimals. Launched 2025-09-03 (The
 *  Block / CoinDesk / PRNewswire, [lu]). TSLAon confirmed: eth_call symbol()="TSLAon", decimals()=18.
 *  The authoritative address API is api.gm.ondo.finance/v1/assets/all/addresses — AUTH-GATED (403),
 *  a procurement item (PR-B-ONDO); addresses below resolved via GeckoTerminal + on-chain confirmation. */
export const ONDO: readonly TokenRef[] = [
  { symbol: "TSLAon", chain: "ethereum", address: "0xf6b1117ec07684d3958cad8beb1b302bfd21103f", decimals: 18, standard: "erc-20",
    source: { api: "https://api.geckoterminal.com/api/v2/networks/eth/pools/0x31227b50...da?include=base_token", fetchedAt: D, snapshotSha256: "85079eacf625", onchain: "eth_call symbol()=TSLAon, decimals()=18" } },
];

export const POOLS: readonly PoolRef[] = [
  { label: "TSLAx/USDC (Raydium CLMM)", dex: "raydium-clmm", chain: "solana",
    poolId: "8aDaBQkTrS6HVMjyc6EZebgdiaXhLYGriDWKWWp1NpFF", programId: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
    baseSymbol: "TSLAx", quoteSymbol: "USDC",
    vaultBase: "CYfaMvz6ft1YahGnetsGP3E8GWkURdJcDSzfihGrH8Qo", vaultQuote: "8JyAULXLSRjxAmzE2MfrgeHhTg8J1DRMqas1gaRn85ot",
    baseIndex: 0, baseDec: 8, quoteDec: 6, underlying: "TSLA", chainId: "solana", censusSha: CENSUS_V3_SHA256, foundingPool: false,
    source: { api: "https://api-v3.raydium.io/pools/key/ids?ids=8aDaBQ...", fetchedAt: D, snapshotSha256: "4d936b6458ac", onchain: "getTokenAccountsByOwner(poolId) returns vaultBase+vaultQuote [C-15, 2026-09-20]; poolId first on-chain tx 2026-02-11 (measured) => foundingPool=false" } },
  { label: "SPYx/USDC (Raydium CLMM)", dex: "raydium-clmm", chain: "solana",
    poolId: "6truu3rZuiB9rKQg4VYC3Dt3QwV7DgwGqXrYUcrvnDDE", programId: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", baseSymbol: "SPYx", quoteSymbol: "USDC",
    vaultBase: "CiQuPAfYp5v82vijk6u7wqFnaZqtGdJfUUSjDKAtT9ML", vaultQuote: "3EmW8zJDHrfgwpQJAt1oD6nxgQZLUwrCRSKk8Gr3iKRF",
    baseIndex: 0, baseDec: 8, quoteDec: 6, underlying: "SPY", chainId: "solana", censusSha: CENSUS_V3_SHA256, foundingPool: false,
    source: { api: "https://api-v3.raydium.io/pools/key/ids?ids=6truu3...", fetchedAt: D, snapshotSha256: "486295e2c9e2", onchain: "getTokenAccountsByOwner(poolId) returns vaultBase+vaultQuote [C-15, 2026-09-20]; poolId first on-chain tx 2026-01-15 (measured) => foundingPool=false" } },
  { label: "NVDAx/USDC (Raydium CLMM)", dex: "raydium-clmm", chain: "solana",
    poolId: "49iMatQtoyabsYAQc8GafVq6aeBFVDxSRH44oiatyyw6", programId: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", baseSymbol: "NVDAx", quoteSymbol: "USDC",
    vaultBase: "DyKsypuzQvhi37K8UvjCMBC43h4HtW4r6jhWoqHyrSSe", vaultQuote: "4JEtq7NraU9U5URcCKSv6sWRRgDSuSnUjYDqpSJSWohY",
    baseIndex: 0, baseDec: 8, quoteDec: 6, underlying: "NVDA", chainId: "solana", censusSha: CENSUS_V3_SHA256, foundingPool: false,
    source: { api: "https://api-v3.raydium.io/pools/key/ids?ids=49iMat...", fetchedAt: D, snapshotSha256: "c9b6b778e7aa", onchain: "getTokenAccountsByOwner(poolId) returns vaultBase+vaultQuote [C-15, 2026-09-20]; poolId first on-chain tx 2025-07-02, only 8 in-window txs (measured) => foundingPool=false (near-dormant in window)" } },
  { label: "AAPLx/USDC (Raydium CLMM)", dex: "raydium-clmm", chain: "solana",
    poolId: "ApniVWuZbZoruTAJdyJcLBA4AVw4DKGdV5fHxo6qrAZT", programId: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", baseSymbol: "AAPLx", quoteSymbol: "USDC",
    vaultBase: "69u6oEwRayMozqCWF9Vny6qiYN5f18pZVUtboaDJkXuj", vaultQuote: "3zBLzabogNNQ4s2zcuioXncdbTPED4jPx1x2J3Jn8Ezt",
    baseIndex: 0, baseDec: 8, quoteDec: 6, underlying: "AAPL", chainId: "solana", censusSha: CENSUS_V3_SHA256, foundingPool: false,
    source: { api: "https://api-v3.raydium.io/pools/key/ids?ids=ApniVW...", fetchedAt: D, snapshotSha256: "f3440b6f6d92", onchain: "getTokenAccountsByOwner(poolId) returns vaultBase+vaultQuote [C-15, 2026-09-20]; poolId first on-chain tx 2026-09-11 (measured) => foundingPool=false" } },
  // Ondo TSLAon pools (Ethereum). Uniswap-family pools hold reserves in the pool contract itself; the
  // Ethereum swap/VWAP leg reads Swap events (T-1a-ii / parity), so no Solana-style vault pair here.
  { label: "TSLAon/USDC 1% (Uniswap v3)", dex: "uniswap-v3", chain: "ethereum",
    poolId: "0x31227b50eccdc9c589826aa2d9e7c5619b1895da", baseSymbol: "TSLAon", quoteSymbol: "USDC", underlying: "TSLA",
    source: { api: "https://api.geckoterminal.com/api/v2/search/pools?query=TSLAon&network=eth", fetchedAt: D, snapshotSha256: "4755c1bc0105", onchain: "pool base_token==TSLAon, quote==USDC(0xa0b8..eb48)" } },
];

/** L-2 founding registry (decision 47): the 2025 founding pools DISCOVERED on-chain — `founding_pool` DISTINCT from
 *  the `pairAddress` census (`POOLS`, which are 2026 CLMM pools). A found vault carries its vaults/quote/dex/
 *  quote_class; a mint with no vault >= threshold => `founding_pool: null` DECLARED (no course in -ii), never a
 *  guessed pool. MEASURED (lot -b1-bis-i network run, 2026-09-20, worker claude-opus-4-8[1m]): the four entries are
 *  the top-tally founding vaults discovered on-chain (`--discover`, 3 sample points, N=5 pages/point, threshold 0.05);
 *  each equals its `series/founding/discovery-<MINT>.json` measure field-by-field
 *  (`bell_founding_registry_equals_discovery_measure`, C-4), so the test proves the registry == the measure. The
 *  SPYx/NVDAx pools sit under programId `whirLbMii...` (off the committed `DEX_BY_PROGRAM_ID`) => `dex:
 *  "unknown-program"` with the id READ on-chain (never a dex from memory, C-5); TSLAx/AAPLx under `CAMMCzo5...` =>
 *  `raydium-clmm`. Multi-pool per mint (several vaults >= threshold) is a formed item (G0 C-9 i, course -ii). */
/** C-5 erratum + C-G2-1: the vault authority's owner kind, RECORDED in the served artifact (never null — a bare
 *  null conflated "executable program" with "quorum failed"): `program` (owner-of-owner read, non-System — its
 *  `executable` is the separate confirmed flag), `system-owned-pda-or-wallet` (System Program), or `unread` (a
 *  quorum-2 miss on the authority or the program account). With `executable`, this closes the `dex:"unknown-program"`
 *  ambiguity (executable-off-map vs non-executable vs System-owned) WITHOUT a network re-read. */
export type AuthorityKind = "program" | "system-owned-pda-or-wallet" | "unread";
export interface FoundingPoolRef {
  readonly foundingPoolId: string; readonly vaultBase: string; readonly vaultQuote: string;
  readonly quoteMint: string; readonly quoteDec: number; readonly programId: string; readonly dex: string;
  readonly quote_class: "usd" | "non-usd";
  readonly executable: boolean; readonly authority_kind: AuthorityKind; // C-G2-1: read by confirmVault, now RECORDED
}
export interface FoundingEntry {
  readonly baseSymbol: string;
  readonly underlying: string;
  readonly founding_pool: FoundingPoolRef | null;
}
export const FOUNDING_POOLS: readonly FoundingEntry[] = [
  { baseSymbol: "TSLAx", underlying: "TSLA", founding_pool: {
    foundingPoolId: "HHQUnUbmWLrYzkscDY1C3deEFbGtiGBGoHjpANogmvum", vaultBase: "D2JXvYgyqo2CktPN4aNfdmHn8mK2vrF9essKdH8M4wn7", vaultQuote: "3h7wgb4hzxjM2F7fmLgwuzZxzuztUvUMdThnrmy9bTdF",
    quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", quoteDec: 6, programId: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", dex: "raydium-clmm", quote_class: "usd", executable: true, authority_kind: "program" } },
  { baseSymbol: "SPYx", underlying: "SPY", founding_pool: {
    foundingPoolId: "Fae5dWVntUt6zbWu2voXxioDpMii7SqQwtsxBmoVCsHR", vaultBase: "EfmaMxuPJaU914gV9N8Z2sDTp249AtEASTLDZdhRsN37", vaultQuote: "5NbsTM8qKWA65oRjZpMARnnxpeR4rGiGdG9vPdCD3sem",
    quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", quoteDec: 6, programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", dex: "unknown-program", quote_class: "usd", executable: true, authority_kind: "program" } },
  { baseSymbol: "NVDAx", underlying: "NVDA", founding_pool: {
    foundingPoolId: "6R4r93V5fcMzc13CL2enEepDSYcr4Qx3ptZBDwudTXCo", vaultBase: "FaHQ9Ny2U2RkcdapsKVr9pvnt4Mg7n92NdKnvyRzuibH", vaultQuote: "5TSHEwRAgHLTYkchrUNiKUL2RvuZgdh3vExbMptWrHoX",
    quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", quoteDec: 6, programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", dex: "unknown-program", quote_class: "usd", executable: true, authority_kind: "program" } },
  { baseSymbol: "AAPLx", underlying: "AAPL", founding_pool: {
    foundingPoolId: "CKwJZwm7oj3nu4653N1EpDrqXbXAYXoPFiPeEnLouF8y", vaultBase: "3DRUhhz5q1wsXZxYYpujPP4Fq5hYNfEGggSq93d99Tn7", vaultQuote: "yMw7pT6pqeSNDUvHkv7626eeGEHC7PrRhXa6mAAuiuw",
    quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", quoteDec: 6, programId: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", dex: "raydium-clmm", quote_class: "usd", executable: true, authority_kind: "program" } },
];
