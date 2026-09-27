// MONARK Dojo -- PR-2-2 (ADR-DOJO-PR-2 D-1 l.110; mere D-5 l.203-206): the closed table of the Solana methods the collector SENDS,
// their per-course caps, the chain operator labels of the guard (labels only: the guard resolves each to its host, and none is ever
// written under publish/; the beacon relays are injected until item DRAND-RELAY-GET-1), and the constants the collector pins instead of reading them (the beacon's /info is never read by the
// collector: orchestrator's verdict, ADR dated line 08:28Z, point (4)). PR-2b-3 completes the method table with its own list.
/** The two methods a collector course sends (mere D-5 l.205; ADR D-1 l.110). */
export const DOJO_SOLANA_METHODS: readonly string[] = ["getAccountInfo", "getProgramAccounts"];
/** Per-course attempt caps on the paid operator (ADR D-6 l.173: two tries per call; one gPA and four getAccountInfo per reading,
 *  the mint included) => 2 x 10 + 8 x 1 = 28 credits <= --max-credits 40, and 5 pieces x 2 operators x 2 tries = 20 <= --max-calls 24. */
export const DOJO_METHOD_CAPS: Readonly<Record<string, number>> = { getProgramAccounts: 2, getAccountInfo: 8 };
/** Tries per call (ADR D-6 l.173: two tries per call); backoff without Retry-After, the 400 ms step of apps/bell/src/quorum.ts:159. */
export const TRIES = 2;
export const BACKOFF_MS = 400;
/** At most one call per second to the public host (ADR D-2 l.130; probe-12.mjs:48). */
export const PUBLIC_HOST_GAP_MS = 1000;
/** The chain operators of a reading, in the order a and b (ADR D-1 dated line C-V-2: constants, outside argv). */
export const CHAIN_OPERATORS = ["helius", "solana-foundation"] as const;
/** Environment keys of the cycle (ADR D-1 dated line C-V-2: EnvironmentFile; calque CHAINSTACK_CYCLE_ID / CHAINSTACK_CYCLE_FLOOR of
 *  deploy/monark-sentinel.service:28-31). PROVISIONAL G1 names: ADR dated line 08:28Z point (5) fixes them at the G1 of PR-3b-1. */
export const ENV_CYCLE_ID = "HELIUS_CYCLE_ID";
export const ENV_CYCLE_FLOOR = "HELIUS_CYCLE_FLOOR";
/** Token-2022 program (ADR D-2 l.125) and the mint's decimals (ADR section 1.3 l.54, measured: 6). */
export const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export const DECIMALS = 6;
/** The anchor's read_rule, pinned (ADR D-5 l.155): quicknet as read on two relays (docs/dojo/FAITS-drand-relays-terms-2026-09-27.md,
 *  trunk l.26: hash, public_key, genesis_time 1692803367, period 3, schemeID), O = 900 (D-5 l.153), tolerance 600 (D-1 l.112),
 *  SOL/USD freshness 165 s (D-3 l.135, decision 248). */
export const READ_RULE = { beacon_chain_hash: "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971",
  beacon_public_key: "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a",
  beacon_scheme: "bls-unchained-g1-rfc9380", beacon_genesis_time: 1692803367, beacon_period: 3, read_offset_s: 900, read_tolerance_s: 600, sol_usd_max_age_s: 165 } as const;
