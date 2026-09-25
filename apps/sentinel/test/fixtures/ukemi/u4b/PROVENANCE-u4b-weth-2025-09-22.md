# PROVENANCE - Ukemi lot U-4b-2b: the FRESH episode weth-2025-09-22 (reduced book, oracle path, scores, realized labels)

Traceable origin of the four sha-pinned data series of the fresh calibration episode under this directory (ADR-M003 D9
sexies: declared and hashed same-dir, one file per line, LF-normalized; ADR-U4b-2b D7). English by ADR-M003 D0.5. These
files and this declaration are EXCLUDED from the public mirror (scripts/export-exclude-data.json, decision 111: the
fresh episode's data returns to the mirror only through item EXPORT-U4B-111-1, decided by the orchestrator at the
switch window). The e2 DESIGN set of the same directory is declared in PROVENANCE-u4b.md and is never served.

Nothing below copies a price, the oracle anchor, an oracle value or a liquidated amount: only sha256 digests, counts,
identifiers and commands. The data files themselves carry public on-chain state (decision 110 exemption).

| file | sha256 (LF) | bytes | lines |
|---|---|---|---|
| `U4b-book-23414968.json` | `4b601785681cb8f6cdbbcc3a99f1cb19424e0a568c703cb9625628526e058341` | 7199778 | 1 |
| `U4b-oracle-path-weth-2025-09-22.jsonl` | `cc7f5cd9b7b93a319044514a1d150a805393e69c575314ff21b1cb9c6ddb0971` | 5868 | 44 |
| `U4b-scores-weth-2025-09-22.jsonl` | `fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4` | 47826 | 253 |
| `U3-realized-weth-2025-09-22.jsonl` | `e2d6c0e48f3503aed4e48d5041d6178ca28b8dc6db36c19ba534ccd4c5611837` | 50254 | 73 |

Every file is LF only (0 CR byte) and byte-identical to its course artifact (section 2).

## 1. What it is
Episode `weth-2025-09-22`: Aave v3 core liquidations with WETH collateral, discovered by the pre-registered P-EPI rule
(docs/PLAN-u4b-prereg.md), reference book B0 = block 23414968 (chain 1, cluster `weth`).
- `U4b-book-23414968.json`: the reduced book written by the frozen reducer `scripts/census/u4b/u4b-reduce.mjs`
  (15452 accounts, 39 reserves, schema `ukemi-book/1`), same dumb projection as the e2 book (PROVENANCE-u4b.md section 1).
- `U4b-oracle-path-weth-2025-09-22.jsonl`: 1 anchor line (`source: answer_updated_pre_b0`, the real oracle update
  before B0 captured by the course prober), 1 meta line (e-mode category params, aggregator, `n_updates`) and 42
  update lines of the realized oracle path.
- `U4b-scores-weth-2025-09-22.jsonl`: the frozen scorer output (`computeScoresU4b`, `scripts/census/u4b/u4b-scores.mjs`)
  as the reducer serializes it: 1 meta line, 205 class-A rows (`score_a`), 47 class-B rows (`score_b`). Class-A cell key
  `ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/weth-2025-09-22/A`; strata (n, p): s0 (170, 170), s1 (21, 22),
  s2 (10, 11), s3 (4, 5).
- `U3-realized-weth-2025-09-22.jsonl`: the 73 realized-label lines of the episode written by the course labeler
  (`scripts/census/u3-realized.mjs`), copied from its output `U3-realized.jsonl` and renamed with the episode tag so it
  cannot be confused with the e2 labels under `../u3/`. The scorer reads it (Y per account); without it the committed
  scores could not be recomposed in the repository (ADR-U4b-2b N-6).

## 2. Acquisition (course artifacts OUT OF REPO, sha-pinned)
Copied byte for byte on 2026-09-24 from the course directory of the orchestrator's machine:

| course artifact (out of repo) | sha256 |
|---|---|
| `F:/course-ukemi/reduce/U4b-book-23414968.json` | `4b601785681cb8f6cdbbcc3a99f1cb19424e0a568c703cb9625628526e058341` |
| `F:/course-ukemi/reduce/U4b-oracle-path-weth-2025-09-22.jsonl` | `cc7f5cd9b7b93a319044514a1d150a805393e69c575314ff21b1cb9c6ddb0971` |
| `F:/course-ukemi/reduce/U4b-scores-weth-2025-09-22.jsonl` | `fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4` |
| `F:/course-ukemi/label/out/U3-realized.jsonl` | `e2d6c0e48f3503aed4e48d5041d6178ca28b8dc6db36c19ba534ccd4c5611837` |

Raw inputs of the offline steps (out of repo, not copied): course book raw `U4-book-23414968.raw.json` sha256
`89f2eaeb9feaac5a01c22f1b0070590fe50d1f2d69a9388b85e52a0bb85a71cf` (recorder T2), oracle raw
`U4-oracle-path-weth-2025-09-22.raw.json` sha256 `99882cf70633f21aeccb492bfad9b4a2520e74699be921dcad630b7a20db89a3`
(prober pass 4), label inputs `U3-inputs.jsonl` sha256 `fc4440fe0fd3c95084b606d9b2a30f2156985ab4aaf9278ec14482a7c36aee1a`.
Course record: `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md` line 30 (recorder T2), line 31 (labeler),
line 38 (prober pass 4), line 39 (step 6 tool freeze) and line 40 (Sidecar 6, offline steps 6a-6d: the three reduced
digests above, the registry and the hypothesis report).

## 3. Recipes (offline, deterministic; step 6 of `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md`)
Execution tree of step 6: `F:/Monark-wt-ukemie2` at `b9964eedb32b17ad777df68f1c39dbf71d9b72de` (HEAD_E2; the frozen
scorer `u4b-scores.mjs` LF sha256 `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0`, reducer
`a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0`, generator `record-u4b-calib.mjs`
`5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3`). Paid-endpoint variables are removed from the
environment (`env -u ...`, RUNBOOK ENV-8); none of these steps opens a socket.
- 6a reducer: `node scripts/census/u4b/u4b-reduce.mjs --book-raw <record>/U4-book-23414968.raw.json --oracle-raw
  <prober>/U4-oracle-path-weth-2025-09-22.raw.json --labels <label>/U3-realized.jsonl --event-id weth-2025-09-22
  --episode-tag weth-2025-09-22 --out <reduce>` writes the book, oracle-path and scores files.
- 6b scorer: `node scripts/census/u4b/u4b-scores.mjs <reduce>/U4b-book-23414968.json
  <reduce>/U4b-oracle-path-weth-2025-09-22.jsonl <label>/U3-realized.jsonl` prints the cell summaries (equal to 6a).
- 6c generator: `node scripts/record-u4b-calib.mjs --scores <reduce>/U4b-scores-weth-2025-09-22.jsonl --scale 1` prints
  the class-A registry: 1 of 4 strata committable (s0: n 170, p 170, C5 calib_digest
  `e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334`); s1, s2, s3 under_calib (n below nMin 100).
- 6d report (out of repo): `hyp-report-weth-2025-09-22.json` sha256
  `555b77df6168166004f48d095af96eb27fb6f27f0a8d6ea2d80674674f250be5`, body_digest
  `8ad53d1a83601045599f1117d69f1675a36112b856074a7902217d3f71e1d44f` (its hashed copy is `apps/site/data/ukemi-course.json`).

## 4. What the repository replays (no network)
- `u4b_fresh_scores_recompute_from_committed_inputs` (apps/sentinel/test/ukemi-u4b-fresh.test.ts): the frozen scorer over
  the committed book, oracle path and labels, serialized as the reducer does, equals the scores file byte for byte.
- `u4b_registry_recomputes_from_fresh_scores_jsonl` (same file): the frozen generator over the scores file gives the
  per-stratum n, p, under_calib and C5 digests above, and the cell-A key equals the served `UKEMI_LIQ_PREDICTOR_BASE`.
- `u4b_committed_registry_equals_generator_output` (apps/harness/test/calibration-liq.test.ts): the served registry
  (`apps/harness/src/calibration.ts`, written by `scripts/emit-u4b-calibration.mjs`) equals the generator output.
- `u4b_gate_serves_region_from_real_artifact` (apps/harness/test/gate-liq-artifact.test.ts): every class-A row of the
  scores file through the served gate (the tool registry and the HTTP mirror).

## 5. Regenerate
Never hand-edit. Re-run 6a-6c in the execution tree above from the raws, then copy the four files here and re-pin this
table; any drift in a byte changes a digest and reddens `series_pinned_are_declared_and_hashed` and the recompute test.
