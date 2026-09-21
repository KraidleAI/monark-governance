# PROVENANCE — Ukemi lot U-3 realized labels Y_{i,e} (ADR-U3 / ADR-M020 D1 (b))

Traceable origin of the sha-pinned data series under this directory (ADR-M003 D9 sexies: declared + hashed
same-dir, one file per line). English by ADR-M003 D0.5. Scanned by `gate:vocab` (scope `sentinel`) and the
language gate (scope `sentinel`). Raw provider bytes live OUT OF REPO (CGU decision 2026-09-19); these files
are decoded public on-chain data recomputed (C-3).

| file | sha256 (LF) |
|---|---|
| `U3-realized.jsonl` | `b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923` |
| `U3-sources.jsonl` | `bb6e3207b3e9d4f6b7649beeafd2de6122e44fe9d44e75a01917205413c35fe7` |
| `U3-deficit.jsonl` | `748c7a81da31acf28f79786e10311e6bd23d42ca8e9eb4794cc7c6f31c976af5` |
| `U3-inputs.jsonl` | `c88f31eb3c3271eaf770a9351d334cb88ec77d9acae6ba37a49f79f258aafd97` |

## 1. What it is
Realized liquidation labels for the three observed Aave v3 core events, one row per position
`(user, debtAsset, collateralAsset)` aggregated over its 24h block-anchored window, decomposed into
`repayment_base` / `seized_base` / `deficit_base` (base currency, 8 decimals, `BASE_CURRENCY_UNIT()` read
on-chain = `100000000`) plus native sums, oracle source per asset at both window bounds, and named residuals.
- `U3-realized.jsonl` (198 rows): the labels Y_{i,e}. Fields: `user, event_id, debt_asset, collateral_asset,
  repayment_base, seized_base, deficit_base, repayment_native, seized_native, deficit_native, n_calls,
  first_block, last_block, oracle_source_debt, oracle_source_collateral, residual[], txs[]`.
- `U3-sources.jsonl` (36 rows): oracle source + `description()` per (event, asset) at `at_first_minus1` and `at_last`.
- `U3-deficit.jsonl` (28 rows): `DeficitCreated` in each post-v3.3 window, classified `in_event` /
  `bad_debt_other_reserve` / `window_other` (e2 crash carried bad debt on other collaterals too).
- `U3-inputs.jsonl` (5165 rows): the REDUCED replay input — meta, decoded `LiquidationCall` records, prices per
  `(asset, block)` and `(asset, block-1)`, reserve data, sources at both bounds, underlying `Transfer` records
  (C-7 cross-check), `DeficitCreated`, partial-liquidation remaining debt. The 4 CI tests replay it offline
  through the PURE reducer of `scripts/census/u3-realized.mjs`; no network in CI.

## 2. Acquisition
Recorded 2026-09-20 by `scripts/census/u3-realized.mjs` (off-CI, resumable) with `--prereg-sha
835805ccc9941a101e760f4ca570f8bdb5ab30d5280e1897c473df7c788877d3` (the LF sha of `docs/PLAN-u3-prereg.md`,
pre-registered BEFORE any network call, C-10) and `--rawlogs` verified against `A-rawlogs.jsonl`
`d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996`.
- **Quorum-2 by method** (ADR-U1 D3): every value is the byte-identical result of TWO DISTINCT operators
  (`providerOf`), else `no_quorum` (row abstained). Providers (registrable domains only, never a URL or key):
  an archive endpoint from env `CHAINSTACK_ETH_URL` (logged as a boolean, never printed) plus the keyless pool
  of `apps/sentinel/src/rpc.ts` (`drpc.org`, `mevblocker.io`, `blastapi.io`). `eth_getStorageAt` (EIP-1967 slot)
  resolves the Pool implementation at `B_first` (C-6); `eth_getLogs` (chunked <=2000 blocks) sources
  `DeficitCreated`; `eth_getTransactionReceipt` cross-checks underlying ERC-20 Transfers.
- **Raw bytes OUT OF REPO**: `<U3_RAWS_DIR>/u3-reads.jsonl` (its location is recorded in the private lot PLI, never in an exported file; concordant reads, domains
  only, no URL/key), sha256 `0afaf605679c05b1efb476bf78fe4b614619589f5dd045a8b45d73b26344e154`.
- **Reproducibility**: two independent full runs (a cached run and a from-scratch clean run, 1961 vs 2152 RPC
  calls) produced the four series BYTE-IDENTICALLY (the shas above). The three OUTPUT series
  (`U3-realized`/`U3-sources`/`U3-deficit`) a third party re-derives from `U3-inputs.jsonl` via the reducer are env-independent; re-deriving `U3-inputs.jsonl` itself from the raws reproduces every line EXCEPT `meta.providers` (env-dependent: the archive-env leg is present only when `CHAINSTACK_ETH_URL` is set).

## 3. Recipes a third party needs
- `repayment_base` = `Σ floor(debtToCover × getAssetPrice(debtAsset)@block / 10^decimals(debtAsset))` (BigInt floor);
  `seized_base` likewise on `liquidatedCollateralAmount` and the collateral (protocol fee excluded, C-7). Native
  sums are the raw `Σ debtToCover` / `Σ liquidatedCollateralAmount`.
- Window: `B_first` = first cluster `LiquidationCall`; `B_last = firstBlockAtOrAfter(ts(B_first)+86400) - 1`
  (`apps/sentinel/src/windows.ts`, block ts in quorum-2). Cluster e2 = WETH collateral, block in
  `[23545088, 23557060]` (M-2b sha-pinned).
- Series sha: LF-normalized (`readFileSync(utf8).replace(/\r\n/g,"\n")` then sha256), matching the root test
  `series_pinned_are_declared_and_hashed`.

## 4. Integrity
`.gitattributes` normalizes to `eol=lf`; the root test `series_pinned_are_declared_and_hashed` LF-normalizes
before hashing and requires the table above. Regenerate, never hand-edit values: re-run `u3-realized.mjs` at the
pinned prereg sha; any drift re-pins the table. The 4 CI tests (`test/u3-realized.test.ts`) fail if
the committed series is not the reducer output of the committed `U3-inputs.jsonl`.
