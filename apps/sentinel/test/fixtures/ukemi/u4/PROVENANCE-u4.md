# PROVENANCE — Ukemi lot U-4a: book B₀, realized oracle path D_e, conformity scores (ADR-U4 / ADR-M020 D1 (b))

Traceable origin of the sha-pinned data series under this directory (ADR-M003 D9 sexies: declared + hashed
same-dir, one file per line, LF-normalized). English by ADR-M003 D0.5. Scanned by `gate:vocab` (scope `sentinel`)
and the language gate (scope `sentinel`). Raw provider bytes live OUT OF REPO (CGU decision 2026-09-19); the
committed series below are decoded public on-chain data recomputed by the pure reducer (C-3), env-independent.

| file | sha256 (LF) |
|---|---|
| `U4-book-23545087.json` | `743e9499f81055bec7ab4f6b9cb5fb27347b94cf85b40eb93fc63cebb9f1ec87` |
| `U4-oracle-path-e2.jsonl` | `970357153ff60e305c8c6818439358db0140dc72d2eb538d5efbdf944b15daed` |
| `U4-scores-e2.jsonl` | `e80386c6cd0ba200699fdb011370ae86b109b4711a9ab9f5f2ff35a0d52fda97` |

## 1. What it is
Event e2 = Aave v3 core liquidations, WETH collateral, 2025-10-10/11. Reference book B₀ = 23545087 (cluster
`weth`), realized oracle path D_e = the AnswerUpdated series of the WETH/USD SVR feed aggregator over [B₀, B_last].
- `U4-book-23545087.json` (5 957 519 bytes, **16 096 accounts** — the full at-risk population at B₀): a REDUCED
  projection of the raw book keeping only the fields the A-4 reducer reads (per account: `address, user_config,
  emode, balances` filtered to the WETH aToken + all variable-debt tokens, `total_collateral_base,
  total_debt_base, current_liquidation_threshold_bps, hf_onchain, eligible_static`) + all 39 reserves (`asset,
  atoken, variable_debt_token, decimals, liquidation_threshold_bps, price_base_8dec`). **LOSSY**: non-WETH
  collateral balances are pruned (the raw book itemizes only the WETH aToken plus every variable-debt token).
  **KEPT at 16 096 (D-10)**: the cell {ŷ>0 under D_e} ∪ {189 liquidated} = 797 DERIVES from this population; a
  "cell-only" fixture would make `eligible_under_De=770` / `eligible_static_b0=64` tautological (pinning
  membership instead of deriving it in CI). The authoritative `book_digest = 695d862f…` is proven by the
  cache-replay (G2 §4), not by the reduced fixture (a lossy reference copy).
- `U4-oracle-path-e2.jsonl` (141 lines = 1 meta + 140 `AnswerUpdated`): D_e. The meta carries `p_min`, `p_max`,
  the decoded e-mode category liquidation thresholds (`emode_lt`), `aggregator_at_b0/at_b_last`, `phase_change`,
  `monotone_blocks`, `usdt_prices`. Each update line: `block, log_index, price, round_id, updated_at`.
- `U4-scores-e2.jsonl` (798 lines = 1 meta + 797 score rows): the A-4 output. The meta carries `n=797`, `p=791`,
  `qhat`, `calib_digest=668ab214…`, `census`. Each row: `address, y, yhat, score, in_book, eligible_de,
  liquidated`. Read by NO test (a published artifact); pinned only here.

## 2. Acquisition (raw provider bytes OUT OF REPO, sha-pinned)
Recorded 2026-09-20 by the hardened Ukemi recorder + census scripts with `--prereg-sha
9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb` (the LF sha256 of `docs/PLAN-u4-prereg.md`,
pre-registered and committed BEFORE any network call, order proof `meta.prereg_sha`). Quorum-2 by method (two
distinct `providerOf` operators concordant, else abstain); keyless pool + an archive endpoint from env
`CHAINSTACK_ETH_URL` (logged as the label `archive-env`, NEVER a URL or key); `mevblocker.io` excluded (D-5).
Raw-producing commands (out-of-repo): holder probe `node scripts/census/u4-probe.mjs …`; filter + book course
`node apps/sentinel/src/ukemi/record.ts --cluster weth --block 23545087 --exclude-operator mevblocker.io --resume
…/U4-inputs.jsonl --prereg-sha 9209cdab… --out …/U4-book-23545087.raw.json`; oracle path `node
scripts/census/u4-oracle-path.mjs --prereg-sha 9209cdab… --max-calls 8000 --raws-dir …`. Out-of-repo raws under
`F:\PRODUITS\etude-2026-09-20\u4-raws\` (leak-control grep `https?://|chainstack|p2pify|api-key` = 0 on every one):

| raw (out of repo) | sha256 | recorded_at_utc |
|---|---|---|
| `U4-book-23545087.raw.json` (course book B₀) | `8f620f6c83638814f5cff7bb5d3379989995bbf525da9fe1d32ab68a07304b5c` | 2026-09-20T20:45:02Z |
| `U4-inputs.jsonl` (resume/replay cache, 138 711 lines) | `09968df1dce3d14e991e63017673518aa64e4defbedb1bbac0861c2be9aff42d` | 2026-09-20T08:03:59Z (probe start; appended through the course) |
| `U4-oracle-path-e2.raw.json` (course D_e) | `7b87f6d35a742ebb12a2dd084709c5bc73429aff2ef55eaf4b6e0cad0e58144e` | 2026-09-20T21:13:47Z |
| `U4-oracle-inputs.jsonl` (D_e replay cache) | `eca2d3a2f96e3c0c6993669ba5404971f3053ddd6b942dfcb294cd69016008a5` | 2026-09-20T21:13:47Z |
| `U4-filter-23545087.json` (filter pass, n_at_risk_config) | `0839590496720e0272af56f61ade3d2a23a25d4214a36b77d857660747cc1cba` | 2026-09-20T14:45:05Z |
| `U4-probe.json` (holder enumeration probe) | `15526c2a019cc1e41719f13c52bab2dc44708265652e72e603fde37daf407ce6` | 2026-09-20T08:03:59Z |

## 3. Recipes a third party needs
- **Regenerate the three committed fixtures** from the raws, offline, deterministic (verified byte-exact against the
  LF shas above, 2026-09-20T23:06Z UTC): `node scripts/census/u4-reduce.mjs` (default `--raws-dir
  F:/PRODUITS/etude-2026-09-20/u4-raws`, default `--out` = this directory). It reads `U4-book-23545087.raw.json` +
  `U4-oracle-path-e2.raw.json` + `../u3/U3-realized.jsonl`, applies the pure reducer `scripts/census/u4-scores.mjs`
  (`computeScores`), and decodes the e-mode thresholds from the oracle raw's `emode_raw` via `abi.ts`
  `decodeEModeCategoryData`. Never hand-edit values; any drift re-pins the table.
- **Score** `score_i = |Y_i − ŷ_i|` (base 8-dec, no clipping). `Y_i` = Σ (`repayment_base + deficit_base`) of the
  e2 `U3-realized.jsonl` lines of user i. `ŷ_i` = `total_debt_base` if HF(D_e) < 1e18 else 0; HF(D_e) recomputes
  the WETH collateral + WETH debt legs at `p_min = min AnswerUpdated over [B₀,B_last]`, other assets at p0.
- **Series sha**: LF-normalized (`readFileSync(utf8).replace(/\r\n/g,"\n")` then sha256), matching the root test
  `series_pinned_are_declared_and_hashed`.

## 4. Integrity
`.gitattributes` normalizes to `eol=lf`; the root test `series_pinned_are_declared_and_hashed` LF-normalizes before
hashing and requires the table in the header (filename AND its exact LF sha256 on the same line). The CI test
`u4_calibrates_from_u3_realized_labels` fails if `U4-book-23545087.json` + `U4-oracle-path-e2.jsonl` +
`U3-realized.jsonl`, run through `computeScores`, do not reproduce `n=797` and `calib_digest=668ab214…`.
Regenerate, never hand-edit values: any drift re-pins the table.
