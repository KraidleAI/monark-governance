# PROVENANCE — Bell -b1 spike (Helius + Chainstack, founding-window depth/cost, ADR-T1aii-D1-bis C-3/C-5/O-6)

Committed **measures only** (depth, costs, error shapes, first-tx dates, rebase state, vault-discovery method,
sha of the out-of-repo raws). This directory is under the R-25 series-excluded root
`apps/bell/test/fixtures/series/` (D9 sexies); each data file below is declared + hashed same-dir (root test
`series_pinned_are_declared_and_hashed`, LF-normalized). Worker Opus 4.8, 2026-09-20.

## ToS review (pasted per orchestrator decision, 2026-09-19)
ToS review (2026-09-19; read by a Sonnet 5 reader agent (`claude-sonnet-5`), orchestrator decision option (c), see ADR-T1aii C-13): Helius Terms of Service (last updated 2026-04-24, https://www.helius.dev/terms) and
Chainstack SaaS Terms of Service (last updated June 2026, https://chainstack.com/tos/) do not explicitly
address ownership, redistribution, or public-repository publication of RPC response data or statistics derived
from it. Both contain general non-redistribution / no-derivative-works clauses aimed at the paid Service/API
access itself (Helius §7(v),(viii); Chainstack §4.2(i)), not explicitly at archived response snapshots or
downstream statistics. Neither provider imposes a caching/storage restriction on client-held responses or an
attribution requirement applicable to fixtures. Underlying blockchain data is public on-chain data, not
provider-authored content. Raw responses are therefore kept out of the repository (SHA-pinned here); only
reduced series recomputed from public on-chain facts are committed. Residual risk: non-zero, unquantified;
good-faith reading pending provider confirmation or legal sign-off.

## Method (first-hand, reproducible)
- Endpoints read from User-scope env into the PowerShell process (`BELL_SOLANA_RPC` composed in memory); no URL
  or key ever printed, logged, or written. Journals/labels use `providerOf`/`operatorOf` only (bare hosts).
- Quorum operators: `helius` (`helius-rpc.com`) and `chainstack` (`chainstack.com`, archive from block 0).
- Founding window: 2025-07-01T00:00:00Z .. 2025-10-31T23:59:59Z.
- Helius `getTransactionsForAddress` params shape (Helius docs [lu], api-reference/rpc/http/gettransactionsforaddress):
  `[addressString, { transactionDetails: "signatures"|"full", sortOrder, limit, paginationToken, filters: { blockTime: { gte, lte } } }]`,
  response `{ data, paginationToken }`. Server-side blockTime filter => direct window enumeration.
- Generators (out-of-repo, SHA-pinned, archived at `F:\PRODUITS\etude-2026-09-19\bell-b1-spike\scripts\`):
  `spike.mjs` `0f546c3f0a88b250848dc287b3cb64fc686f8f2c3b4fff40a3aa3f680e5fa35c`;
  `spike-pools.mjs` `061e30e8c23311fa85442adf284d2de54ad9ccc1d5aec5ef095ba7063672d514`;
  `probe2.mjs` `af030131fcd14ea1f808390c3c8d51f05142f24cfda8697841f85b8919c4682d`;
  `probe3.mjs` `f0951954ae24ef5fdbfcd927c4d46b87706551990c77d8fbc12859c0271da0ca`;
  `probe4.mjs` `efe38ecfe9f43d5102e9f50426827a2ad0206a62474334a67f4b399726fca842`.

## Committed data-file pins (plain sha256 of the file bytes, LF-normalized — D9 sexies a)

| file | sha256 (LF) |
|---|---|
| `spike-measures.json` | `1e733a6996ffdb0ed2b9a5a9b971a420850b4c5e1c61cb293565997792ef78d0` |
| `spike-findings.json` | `c016418747de3a10166997fe52aae375fc1b4a754827906b573f2d4a4fe45224` |
| `spike-poc-discovery.json` | `4dc927bb9d7ea71f9b825701a4dc933b6f8b64c559048488f529653ccbac696c` |

## Out-of-repo raw responses (NOT committed — C-4; archived `F:\PRODUITS\etude-2026-09-19\bell-b1-spike\raws\`)

Note: `saveRaw` reuses file names across runs, so the archive holds the FINAL run's raws only (with the correct
gTfA params — the earlier malformed-params run, `-32602`, left no committed artifact). The two raws are VALID
EMPTY results (not error objects), which IS the finding — the census pool had no early-July-2025 activity.

| raw file | sha256 | exact content (verbatim) |
|---|---|---|
| `depth-probe-tslax-gtfa.json` | `fdd89433f8a4162ab731c52fa0e6c9b386cb7809864e58a6fdccd44d83eed3d0` | `{"data":[],"paginationToken":null}` — valid EMPTY gTfA result (0 TSLAx-census-pool txs, blockTime gte 2025-07-01 lte 2025-07-08) |
| `gtfa-full-page-sample.json` | `801678683817240be82c5ffd3b3e089c83fb1af53f2e69496a017a13092fe7ed` | `{"count":0,"sample":[]}` — the full-page sample over the window returned 0 rows (same finding) |
| `depth-probe-body-helius.json` / `-chainstack.json` | not produced | no in-window sig existed on the census pool to fetch/quorum a body |

## Findings (first-hand, in `spike-findings.json` / `spike-measures.json`)
1. **Depth (providers)**: Chainstack `getFirstAvailableBlock` = 0 (full archive). Massive/Polygon TSLA
   `range/1/day/2025-07-01` HTTP 200, close present (value NOT recorded, ESC-1 c). Founding-window depth OK.
2. **PIVOT — census-v3 Solana pools postdate the founding window**: first on-chain tx per census pool —
   TSLAx `8aDaBQ…` 2026-02-11, SPYx `6truu3…` 2026-01-15, AAPLx `ApniVW…` 2026-09-11, NVDAx `49iMat…`
   2025-07-02 (only 8 base-vault txs in the whole window). In-window base-vault tx count: 0/0/0/8. The census
   `pairAddress` are 2026 CLMM pools (DexScreener sorts by current liquidity), NOT the founding-era pools.
3. **The mints traded heavily in-window**: first tx 2025-06-10/11; 8000+ in-window txs per mint (capped at 8
   pages). So 2025 founding trading happened on OTHER (now-drained) pools, discoverable on-chain (PoC below).
4. **Founding-pool discovery PoC (TSLAx, ~7 Helius calls)**: gTfA `full` on the mint (window) → tally accounts
   holding TSLAx → founding vault `CY9Xzc1z…` with 5000+ in-window txs (5 pages capped — a FLOOR, exact unknown).
   Discovery feasible (~10-20 calls/mint). **C-G2-6**: these PoC values are NOT sha-backed in-repo (the raw was
   overwritten by saveRaw name reuse, l.44); recorded in `spike-poc-discovery.json` with `raw_sha256: null` and a
   formed re-measure item (trigger: go -b1-bis — save the raw under a unique name, pin its sha, report the exact
   uncapped count and the full vault address). Prose-only until then.
5. **PIVOT — rebase**: scaledUiAmountConfig — TSLAx multiplier 1 (never scaled); SPYx 1.0039, NVDAx 1.0009,
   AAPLx 1.0027, each with a `newMultiplier` whose effTs is ALREADY ELAPSED at the 2026-09-20 read (SPYx effTs
   1781755200=2026-06-18Z, AAPLx 1786149000=2026-08-08Z, NVDAx 1789000200=2026-09-10Z — a PAST-dated value, NOT
   "future/pending"; C-G2-2). Whether it supersedes `multiplier` once elapsed is the ScaledUiAmount rule [abs
   offline] (C-G2-3, PR-B-SPL-TOKEN2022). Update authority SHARED (`S7vYFF…`) across
   all four, 3000+ in-window signatures (capped). Multiplier is MUTABLE => the historical value at the window's
   begin bound is unreadable by `getAccountInfo` => C-6 gate is `rebase_unverified` at -b1; the SetMultiplier
   trajectory reconstruction is -b3.
6. **C-15 vault discovery (validated generic method)**: `getTokenAccountsByOwner(poolId, {programId: SPL|Token-2022})`
   returns the pool's vaults; base+quote vaults present for all four census pools. No per-DEX decoder needed.

## Consequence
The -b1 founding Cong-Table-4 replication is blocked on the census-pool population (0 in-window data) AND on the
mutable multiplier (unverifiable historical bound). No C-5 projection is computable on the census population
("0 in-window data, not computable"). Escalation (three costed options) is in `docs/PLI-lot-t1a-ii-b1.md`
(the formal consultation section). No founding course was launched (budget preserved: ~90 Helius calls for the spike).
