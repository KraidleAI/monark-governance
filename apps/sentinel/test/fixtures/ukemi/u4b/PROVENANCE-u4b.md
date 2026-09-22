# PROVENANCE — Ukemi lot U-4b-1a: reduced book B₀, oracle path D_e with pre-B₀ anchor, close-factor scores (ADR-U4b)

Traceable origin of the sha-pinned data series under this directory (ADR-M003 D9 sexies: declared + hashed
same-dir, one file per line, LF-normalized). English by ADR-M003 D0.5. Scanned by `gate:vocab` (scope `sentinel`)
and the language gate (scope `sentinel`). Raw provider bytes live OUT OF REPO (CGU decision 2026-09-19); the
committed series below are decoded public on-chain data recomputed by the pure reducer, env-independent. These
fixtures are the U-4b-1a DESIGN set (event e2) — the score FORM is designed here and FROZEN by sha before any
fresh data exists (C-12); e2 is NEVER served (the served region is calibrated on a fresh episode in -1b/-2).

| file | sha256 (LF) |
|---|---|
| `U4b-book-23545087.json` | `baf717b7710bdb7b1abe5b4ea0b714e26b774a6e5fcf9a6f16881986451e6ac7` |
| `U4b-oracle-path-e2.jsonl` | `5e6448dc473367582c75fa5385eec7659cae1d073be9585137e7d4cc442d873b` |
| `U4b-scores-e2.jsonl` | `301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad` |

## 1. What it is
Event e2 = Aave v3 core liquidations, WETH collateral, 2025-10-10/11. Reference book B₀ = 23545087 (cluster
`weth`), realized oracle path D_e = the AnswerUpdated series of the WETH/USD SVR feed aggregator over [B₀, B_last].
- `U4b-book-23545087.json` (7 501 755 bytes, **16 096 accounts** — the full at-risk population at B₀): a REDUCED
  DUMB projection of the raw book keeping every account with the fields the U-4b reducer reads (per account:
  `address, user_config, emode, balances` filtered to the WETH aToken + ALL variable-debt tokens with balance > 0,
  `total_collateral_base, total_debt_base, current_liquidation_threshold_bps, hf_onchain, eligible_static`) + all
  39 reserves (`asset, atoken, variable_debt_token, decimals, liquidation_threshold_bps, liquidation_bonus_bps,
  reserve_emode_category, price_base_8dec`). The multi-reserve close factor (C-7) needs EVERY debt balance, so
  unlike the U-4a book this keeps all variable-debt tokens (not only the WETH one). `liquidation_bonus_bps` and
  `reserve_emode_category` are ADDED (C-14 / LST). **LOSSY**: non-WETH collateral balances are pruned (the raw
  book itemizes only the WETH aToken plus every variable-debt token) — the mono-collateral test therefore uses the
  aggregate residue `total_collateral_base − aWETH·p0/1e18` (§3). ALL 16 096 accounts are KEPT so the cell derives
  in CI (it is not pinned membership). The authoritative `book_digest = 695d862f…` is proven by the U-4a
  cache-replay, not by this lossy reference copy.
- `U4b-oracle-path-e2.jsonl` (142 lines = 1 pre-B₀ ANCHOR + 1 meta + 140 `AnswerUpdated`): D_e. The ANCHOR line
  (`kind:"anchor"`) carries the pre-B₀ price used as the start of the first-crossing traversal (C-8 entry 7) — in
  -1a this is the book WETH price @B₀ (`source:"book_weth_price_base_8dec"`; the raw path has no pre-B₀ event), and
  in -1b it will be the real AnswerUpdated ≤ B₀. The meta carries `p_min`, `p_max`, the decoded e-mode category
  params (`emode_params:{cat:{lt,bonus}}` — LT AND bonus, whereas U-4a decoded only LT), `aggregator_at_b0/
  at_b_last`, `phase_change`, `monotone_blocks`, `usdt_prices`. Each update line: `block, log_index, price,
  round_id, updated_at`.
- `U4b-scores-e2.jsonl` (665 lines = 1 meta + 565 class-A rows + 99 class-B rows): the reducer output. The meta
  carries `cell_a` and `cell_b` summaries (`n, p, qhat, calib_digest, strata[]`) and the `census`. Class-A rows
  (`kind:"score_a"`) carry `address, y, yhat, score, liquidated, strate, m_bps, pstar`; class-B rows
  (`kind:"score_b"`) carry `address, y, yhat, score, liquidated, strate`. Read by the generator test
  `u4b_registry_recomputes_from_scores_jsonl` (class-A strata) and pinned here.

## 2. Acquisition (raw provider bytes OUT OF REPO, sha-pinned)
The raws are the SAME out-of-repo course artifacts as U-4a (recorded 2026-09-20 by the hardened Ukemi recorder;
quorum-2 by method; keyless pool + an archive endpoint from env, logged as the label `archive-env`, NEVER a URL or
key; `mevblocker.io` excluded). Out-of-repo raws under the private lot raw archive (`<U4_RAWS_DIR>`; its location
is recorded in the private lot PLI, never in an exported file):

| raw (out of repo) | sha256 |
|---|---|
| `U4-book-23545087.raw.json` (course book B₀) | `8f620f6c83638814f5cff7bb5d3379989995bbf525da9fe1d32ab68a07304b5c` |
| `U4-oracle-path-e2.raw.json` (course D_e) | `7b87f6d35a742ebb12a2dd084709c5bc73429aff2ef55eaf4b6e0cad0e58144e` |
| `U3-realized.jsonl` (in-repo LF label input) | `b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923` |

## 3. Recipes a third party needs
- **Regenerate the three committed fixtures** from the raws, offline, deterministic: `node
  scripts/census/u4b/u4b-reduce.mjs --book-raw <U4_RAWS_DIR>/U4-book-23545087.raw.json --oracle-raw
  <U4_RAWS_DIR>/U4-oracle-path-e2.raw.json --labels apps/sentinel/test/fixtures/ukemi/u3/U3-realized.jsonl
  --event-id e2-2025-10-10-weth --episode-tag e2` (every episode value is a MANDATORY argument — the code is
  episode-agnostic, C-12, so the SAME frozen bytes run on the fresh -1b episode; default `--out` = this directory).
  It applies the pure reducer `scripts/census/u4b/u4b-scores.mjs` (`computeScoresU4b`) and decodes the e-mode
  category params from the oracle raw's `emode_raw` via `abi.ts` `decodeEModeCategoryData`. q̂ is fail-closed:
  a stratum (or cell) with n < nMin=100 carries `qhat: null` (under_calib), never a clamped value. Never
  hand-edit; any drift re-pins the table.
- **ŷ (base 8-dec, no clipping)** = the maximum liquidatable in ONE call at the per-account FIRST CROSSING p*: the
  max over the account's debt reserves r_d of `min(CF_base(r_d), C_weth/m)`, where `CF_base = min(D_r, 0.5·D_tot)`
  under the three close-factor conditions (`C_weth ≥ 2000e8`, `D_r ≥ 2000e8`, `HF > 0.95e18` STRICT) else `D_r`,
  and m = the WETH collateral liquidation-bonus multiplier (reserve bonus if e-mode = 0, else the WETH e-mode
  category bonus from `emode_params`). `Y` = Σ (`repayment_base + deficit_base`) of the e2 `U3-realized.jsonl`
  lines of user i (a `deficit_base_no_price` residue is completed with `getAssetPrice(USDT)` from `usdt_prices`,
  fail-closed). `score = max(Y − ŷ, 0)` (one-sided exceedance, decision 126; see §5).
- **Method conventions (measured effects; to pre-register for -1b, never a silent tolerance)** — (C-V-1) `D_tot(p)
  = total_debt_base − vWETH@p0 + vWETH@p` (the authoritative on-chain aggregate, ADR-U1 C-2 precedent): the
  alternative `D_tot = Σ debt legs` convention shifts 140/565 ŷ by ±1–2 units, 1 p\* (one dust account), and the
  cell-A digest (mutant `dtot` RED). RAW finding recorded as-is (formed item « explain aggregate ≠ Σ legs », owner
  orchestrator, trigger before the -1b course — it touches the U-4a book zone `034fbff9`): `total_debt_base` > Σ
  floor(amt·price/unit) by +1..+5 units for 564/565 cell-A accounts (collateral is exact for all 9 452; debt is
  biased). Which convention is "true" is NOT decided here. (C-V-4) the 483 sub-$1 `non_evaluable_x` residues are
  NOT rounding: histogram 5 ≤ 5 units, 16 ∈ [6,100), 135 ∈ [101,1e4), 199 ∈ [1e4,1e6), 128 ∈ [1e6,1e8) ⇒ 478/483
  are genuine tiny non-WETH collaterals; strict X=0 (decision 91) stays the correct reading.
- **Series sha**: LF-normalized (`readFileSync(utf8).replace(/\r\n/g,"\n")` then sha256), matching the root test
  `series_pinned_are_declared_and_hashed`.

## 4. Integrity
`.gitattributes` normalizes to `eol=lf`; the root test `series_pinned_are_declared_and_hashed` LF-normalizes before
hashing and requires the table in the header (filename AND its exact LF sha256 on the same line). The CI test
`u4b_scores_on_e2` fails if `U4b-book-23545087.json` + `U4b-oracle-path-e2.jsonl` + `U3-realized.jsonl`, run through
`computeScoresU4b`, do not reproduce the pinned cell-A / cell-B digests and census. Regenerate, never hand-edit:
any drift re-pins the table.

## 5. Dated amendment 2026-09-22 (decision 126) — one-sided score re-gel (lot U-4b-SCORE-1)

Decision 126 (`docs/CHANTIERS.md`, orchestrator on investor delegation, adversarial audit of the advisor-defi
advice) changes the U-4b conformity score from the symmetric `|Y − ŷ|` to the ONE-SIDED exceedance
`max(Y − ŷ, 0)` (base 8-dec, clamped at 0). Licit BEFORE the -1b prereg is committed: the score FORM is fixed
before any fresh calibration data exists (e2 is the design set, C-12; Barber-Candes-Ramdas-Tibshirani 2023).

- `scripts/census/u4b/u4b-scores.mjs` re-gelled: LF sha256
  `9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf` -> `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0`
  (one line at `:245`, formerly `:244`, + its `:29-30` comment). `u4b-reduce.mjs` and `record-u4b-calib.mjs` are BYTE-IDENTICAL — bytes
  unchanged; only their OUTPUT moves.
- `U4b-scores-e2.jsonl` regenerated by the §3 recipe from the SAME sha-pinned raws (`8f620f6c…` / `7b87f6d3…`):
  LF sha256 `84f8aa13…` -> `301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad` (the §1 table line
  is updated to the new value). `U4b-book-23545087.json` and `U4b-oracle-path-e2.jsonl` are BYTE-IDENTICAL (they
  do not depend on the score).
- Only the `score` field (552 of 664 rows changed, 112 unchanged) and the cell/stratum digests move; the census,
  the address sets, and every `y`/`yhat`/`strate`/`liquidated`/`m_bps`/`pstar` field are IDENTICAL (structured diff
  in the G1 rendu). Cell digests: A `dc9ab572…` -> `2feb4ab0…`, B `89897a61…` -> `07bb8e3b…`.
- Per-stratum q̂ (one-sided, base 8-dec): strate 0 `23169870364` (231.70 $), strate 1 `3609978241254`
  (36 099.78 $, = max at p=n=148), strata 2/3 `under_calib` (n < nMin=100). The served region becomes the UPPER
  BOUND `[0, ŷ + q̂_k]`, never an interval (ADR-U4b amendment 2026-09-22; -1b prereg §Definitions + H-3).
