# G0 - lot conformal-oracle-tests (worksite 1 of the RECHERCHES alignment: literature oracle tests on the existing conformal code, no behaviour change), DRAFT, no code

- **Resolved model (R-1)**: recorded in the session log, not in repository files (session rule); fresh context. Planner-worker for session RECHERCHES; does not commit (R-20), launches no workflow, edits nothing in the workshop clone.
- **Mandate**: founder decision 296 (2026-09-30, workshop CHANTIERS l.2164) authorizes RECHERCHES to align MONARK conformal inference with the literature; MONARK reply `coordination/messages/2026-09-30-MONARK-vers-RECHERCHES-reponse-alignement-conformal.md` (73 l., sha256 `f4dedcdf7b8553c5bc4c07d3af280dba8df4b011f33634a47435de8ce88a726e`): order 1 -> 4 -> 2 -> 3 -> 5; worksite 1 = "oracle tests derived from the literature, on the existing code", **agreed without ADR**; rule ADR-METHODE-2 D2: a test green at base is admitted only as a **pin** (category "epingle": named killer killed, `<before>` text present at base), counted apart (`pins`), never F2P; exchangeable simulations: seed committed in the test, byte guard green.
- **Deliverable**: this G0 (plan, tests and mutants announced, R-25 estimated). Status: DRAFT, proposed; awaits checkpoint-1 by MONARK's validator (section 11). Not committed anywhere.
- **Proposed lot**: branch `lot/conformal-oracle-tests` in `KraidleAI/monark-governance`, created from the workshop `main`.
- **Base**: workshop `main` @ `b052e9407ef5130e0edb2bcf122d662b7a53662d` ("Merge pull request #90 from KraidleAI/lot/etude-suite"). Every `file:line` below is anchored on this sha, never on the public mirror `8ca8a23`. Orchestrator trunk read at `lot/etude-suite` @ `8d5dc0c462309ec17d226c163969a01f8dc19859` (method documents and tools only). Measured: none of the production or test files this lot touches or reads differs between `b052e94` and `8d5dc0c` for `packages/hikae/**` and `apps/harness/src/tools/gate.ts`; `apps/harness/src/calibration.ts` DOES differ (trunk adds liq calibration rows, +93/-.. lines): the lot reads only `BTC_DIR_CALIB` and `USDE_STABLE_RUN_CALIB` from it (see risk R-3).
- **Hours** (`date -u`): 14:56:46Z (hashes of the inputs), 14:57:48Z (start of writing).

## 1. Read (sha256 recomputed; workshop blobs by `git show <sha>:<path>`)

| Input | Rev | Lines | sha256 | Reading |
|---|---|---|---|---|
| `docs/methode/REGLES-MISSION.md` | `8d5dc0c` | 18 | `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335` | whole |
| `docs/methode/CHECKLIST-G7.md` | `8d5dc0c` | 14 | `6eee480f6f04cce25c10e44ee86cba3d23c08659fd20198496d3bdac3698b644` | whole |
| `docs/adr/ADR-METHODE-2.md` | `8d5dc0c` | 198 | `b7e1e30f6abc8d6ef96674b061b2e91d70283eec113fe0302429ff3d53394c2b` | table D1-D15 (D2 l.22 read closely, pin category), lot lines M-4b l.62, outline |
| `scripts/red-proof.mjs` | `8d5dc0c` | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | l.1-250 (killer convention l.18-23, verdicts l.161-173) |
| `scripts/oracle/r25.mjs` | `8d5dc0c` | 28 | `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` | whole |
| `scripts/lang-gate.mjs` | `8d5dc0c` | 339 | `45e4420f5a2db472f598ba6d9cf6733cbc17fdf32ff2d882f2b179a71f73abf1` | l.1-150 (FR_WORDS, scopes, SKIP_DIRS) |
| `scripts/lang-exempt.json` | `8d5dc0c` | 62 | `2df5cd475d26f405cf989e8cb1917bef3fa936c862b8ec5c4cd329f8a69efaad` | l.1-60 |
| `docs/G0-lot-dojo-pr1b5.md`, `docs/G0-lot-dojo-pr1b4.md`, `docs/G0-lot-lang-gate-ci.md` | `8d5dc0c` | 72, 62, 148 | `ecfa0d3b...ecce4`, `c8145acf...e85`, `9ee74ee8...d1a` | whole (structure copied), l.1-120 |
| `packages/hikae/src/l1-split.ts` | `b052e94` | 72 | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | whole |
| `packages/hikae/src/l3-gate.ts` | `b052e94` | 157 | `c23a4030bf5f8ce5dde6799dc360c32cfa954329d4c01bd6d1b7f61ca49d18ff` | whole |
| `packages/hikae/src/interval-conformer.ts` | `b052e94` | 106 | `cb6ed928c7268d9e7c78d0a5a8fbc7a8754d1645f50a7c3000ca099c1bc8b6d1` | whole |
| `packages/hikae/src/region.ts` | `b052e94` | 89 | `71a8a0ad06455950e3a2cb116207c72e0b5c6ce96df5a326ff269c0734d20a5a` | l.1-89 |
| `packages/hikae/src/verdict.ts`, `src/index.ts`, `src/s2/run.ts` (S2_DEFAULT l.51-55), `src/s2/instrument.ts` (mulberry32 l.37-46, generateLabeledSeries l.80-98) | `b052e94` | 90, - | `7f2a5fe3...763b801` (verdict) | whole / extracts |
| `packages/hikae/test/l1.test.ts` | `b052e94` | 48 | `198b71398ef0885092f6ce96e580231eca8a9ffed4d234d988c4153383751e86` | whole |
| `packages/hikae/test/l3.test.ts` | `b052e94` | 103 | `8b09c1581d7e36d014e91213e967e4f36295ef30961ce25f2e504e5035b3f897` | whole |
| `packages/hikae/test/interval-conformer.test.ts` | `b052e94` | 116 | `4f8d577abf4976c98b6a11c1cc4ff57c121dc4a17a589795356a15d0f0c8438b` | whole |
| `packages/hikae/test/interval-gate.test.ts`, `l2.test.ts`, `interval-nondegenerate.test.ts`, `region-predictor.test.ts`, `contracts-integration.test.ts`, `s2.test.ts`, `tracker.test.ts` | `b052e94` | 71, 79, 185, 72, 72, 95, 238 | `3cc18590...6ed` (interval-gate), `80190c1a...7ab` (l2) | test names all; bodies of interval-gate l.38-71, l2 l.66-79, interval-nondegenerate l.81-117 |
| `apps/harness/src/tools/gate.ts` | `b052e94` | 811 | `4cc340e29c3f9224917efa2a75fd63cec684e49c1a3acf7f5b7d07cf42fffb9a` | l.440-620, l.700-740, exports |
| `apps/harness/src/calibration.ts` | `b052e94` | 230 | `e80f12b1db202834eee999a6263b51dc13775a69863eda46973cf7314ddd7860` | l.1-150 |
| `apps/harness/test/gate.test.ts` | `b052e94` | 842 | `2da6198ea566f95830ff0b791602643405f49ee691650860c2550f87c1409038` | l.1-137, all test names |
| `apps/harness/test/calibrate.test.ts` | `b052e94` | 257 | `a57eab6ef7ee43410510c2689c518a669240d9f1c042158423d639a9acea4418` | l.40-68, all test names |
| `apps/harness/test/usde-calibration.test.ts` | `b052e94` | 90 | `0c5ac94d2690693ca3359da0231b8ceac88df6cfbdf8af9a8f94738de7494b78` | l.60-90, all test names |
| `package.json`, `vocab-banned.json`, `scripts/grep-forbidden.mjs`, `scripts/export-exclude-tests.json`, `tsconfig.json`, `test/ci-gates.test.ts` l.890-1000 | `b052e94` | 33, 177, 282, 20 | `00fe0f41...eeebe`, `830ee907...9904`, `fe0566b8...bafff`, `0b648e14...e56` | scripts and scan scopes |
| `recherches/etat-de-l-art/INFERENCE-CONFORME-vs-MONARK.md` | local | 457 | `dec9e3fe2f6f950a1a4104cbecdc158488296b8ed7b92651bf87961a726daee8` | sections 0, 1, 2.1-2.4, 3(e), 5 |
| `recherches/biblio/lot3/01-inference-conforme-et-calibration.md` | local | - | `50a64d93f578766be3b8edbdc996c2bb72a5a83691f2177c65c781530fb0628d` | l.282-288 (textbook: Thm 3.2, Thm 3.11, Prop. 3.12, Thm 4.1, Algorithm 3.6) |
| `recherches/biblio/lot2/01-inference-conforme-et-calibration-1.md` | local | - | `540f02a2b797ebf3ef7c54960ae9788e8722f107456d0f4225dc9f96727c3107` | l.1288 (Lei et al. 2018, Thm 2.1, 2.2) |

## 2. Measurements (all "calcul": recomputed here in a scratch directory from the blobs at `b052e94`, never by running workshop code in the workshop clone)

- **M-1, split rank in floating point.** `l1-split.ts:37` computes `p = Math.ceil((n + 1) * (1 - alpha))` in float64. Against the exact rational rank `ceil((n+1)(100-k)/100)` (integer arithmetic) on the grid n = 1..400, alpha = k/100, k = 1..99 (39 600 cells): **231 cells differ, always by +1** (the code rank is one above the exact rank), **0 cell below**, **0 spurious `under_calib`** (exact p <= n but code p = n + 1). Examples: (n = 149, alpha = 0.18): exact 123, code 124; (n = 49, alpha = 0.42): exact 29, code 30; (n = 9, alpha = 0.70): exact 3, code 4. On n = 1..2000 and the same alphas: 1 159 cells, all +1, 0 spurious `under_calib`. **0 mismatch** for alpha in {0.01, 0.02, 0.05, 0.10, 0.20, 0.25, 0.50} on n <= 400. Effect: conservative (larger qhat, coverage >= 1 - alpha kept), but the rank is not literally Algorithm 3.6 on those cells, and the upper bound 1 - alpha + 1/(n+1) (textbook Thm 3.11, Prop. 3.12) can be exceeded by one step there. This lot does NOT change it (no behaviour change); it is reported as a new signal (Q-2).
- **M-2, btc-dir fixture.** `BTC_DIR_CALIB` (`calibration.ts:22-26`, S2a draw seed 101, n = 300, accuracy 0.96, nCalib 150, `s2/run.ts:55`): regenerated from `mulberry32` + `generateLabeledSeries` (re-typed from `instrument.ts:37-46`, `:80-98`): **n = 150, 6 ones, 144 zeros**. Hence qhat = 0 iff ceil(151 (1 - alpha)) <= 144 iff **alpha >= 7/151 = 0.046357...**; measured: alpha = 0.0463 -> p = 145 -> qhat = 1; alpha = 0.0464 -> p = 144 -> qhat = 0. `under_calib` iff alpha < 1/151 = 0.006622...: alpha = 0.0066 -> p = 151 > 150; alpha = 0.0067 -> p = 150 -> qhat = max = 1.
- **M-3, USDe fixture.** `USDE_STABLE_RUN_CALIB` (`calibration.ts:77-155`), parsed from the blob: **n = 613, 129 zeros, 458 distinct values** (same as the state of the art, section 2.2). qhat = 0 iff ceil(614 (1 - alpha)) <= 129 iff **alpha >= 485/614 = 0.78990...**; measured: alpha = 0.789 -> p = 130 -> qhat = 5.362499999917738e-11 (smallest positive score); alpha = 0.79 -> p = 129 -> qhat = 0 (then NDG-1, `region.ts:71`, gives `under_calib`). `under_calib` by rank iff alpha < 1/614: alpha = 0.0016 -> p = 614 > 613; alpha = 0.0017 -> p = 613 -> qhat = max = 4.1253532387499996e-4. At alpha = 0.10: p = 553, qhat = 1.3119228083333334e-4 (already pinned by `usde_pre_registered_stats_reproduce`).
- **M-4, COMMIT threshold of the 0/1 score (tau = 1).** qhat = 0 iff the number of calibration errors k <= n - ceil((n+1)(1 - alpha)). At alpha = 0.10: n = 50 -> 4 (46 zeros of 50 needed); n = 100 -> 9; n = 150 -> 14; n = 200 -> 19; n = 300 -> 29 (271 zeros of 300); n = 500 -> 49. Matches the "current split" column of the state of the art table 3(e) (<= 9, <= 19, <= 49). Exact binomial P(qhat = 0) = P(Bin(n, eps) <= threshold): n = 50: 0.4312, 0.2680, 0.1121 for eps = 0.10, 0.12, 0.15; n = 200: 0.4655, 0.1638, 0.0149. Matches section 2.1 of the state of the art (0.431, 0.268, 0.112; 0.466, 0.164, 0.015).
- **M-5, Monte Carlo prototype (scratch copy of `splitQuantile`, seed 20260930, R = 20 000).** Continuous exchangeable scores (uniform draws): (n = 19, alpha = 0.1): exact coverage p/(n+1) = 18/20 = 0.90, measured 0.90085; (n = 24, alpha = 0.1): 23/25 = 0.92, measured 0.9181. Hoeffding radius at delta = 1e-6 two-sided: t = sqrt(ln(2/1e-6) / (2 R)) = 0.01905. Rank mutants: p - 1 gives 0.8514 and 0.8791, p + 1 gives 0.95165 and 0.96035: all outside the band, for this seed; any seed separates them with probability >= 1 - 1e-6 because the shift 1/(n+1) (0.05, 0.04) exceeds 2t = 0.0381. Run time about 70 ms per configuration.
- **M-6, gates on test files.** `lang:gate` scans `packages/hikae/test/**` (scope `hikae`) and `apps/harness/test/**` (scope `harness`), and flags the whole words of `FR_WORDS` (`lang-gate.mjs:62-95`) even inside snake_case (underscore is not a letter: `interval_lo_le_hi` needed an exemption). `gate:vocab` scans only `src/` of packages and `apps/harness/src` (`grep-forbidden.mjs:134-171`): test files are not scanned. Both test directories ARE exported to the public mirror (`export-public.mjs:34`, `:39`; only `s2.test.ts` and `gate-liq-artifact.test.ts` are excluded by `export-exclude-tests.json`): the new files are public, hence English only, ASCII only.
- **M-7, tools.** `scripts/red-proof.mjs`, `scripts/oracle/r25.mjs`, `scripts/mutants/run.mjs` exist on the trunk `8d5dc0c`, NOT on `main` `b052e94`. `red-proof.mjs` at `8d5dc0c` carries no pin category (0 occurrence of `pins`; RED-PROOF-PIN-1 of lot M-4b is not merged): a test green at base reads `refused: green at base: a self-confirming test` (`red-proof.mjs:170`). See Q-1.

## 3. Inventory: what the existing suites already cover, what the literature asks for

| Property (literature oracle) | Covered today by | Gap |
|---|---|---|
| Rank p = ceil((n+1)(1-alpha)), qhat = p-th smallest (textbook Algorithm 3.6, Thm 3.2; Lei et al. 2018 Thm 2.2) | `l1.test.ts:16` `quantile_formula_n_plus_1` (4 hand cases, n = 50); `calibrate.test.ts:53` (n = 9, alpha = 0.2); `interval-conformer.test.ts:55` (n = 99, alpha = 0.01; n = 300) | no grid; 3 of the 4 asserts of `quantile_formula_n_plus_1` sit under `if (!("reason" in r))` and are skipped if the result is `under_calib` (a `p > n` -> `p >= n` mutant survives that test at n = 50, alpha = 0.02); the float excess of M-1 is untested |
| `under_calib` iff n < nMin or p > n, i.e. alpha < 1/(n+1) (textbook Thm 3.2: C = Y there; MONARK abstains) | `l1.test.ts:6` `under_calib_abstains` (n < nMin; one p > n case at n = 1) | the boundary alpha = 1/(n+1) is never probed on both sides |
| Fail-closed outside (0,1) at L1 (alpha = 0, 1, > 1, NaN) | none at L1 (harness `validateHarnessParams` only, `gate.test.ts:125`) | the `q === undefined` guard (`l1-split.ts:41`) is never exercised |
| Ties and order invariance (score symmetry, textbook Thm 3.2 hypothesis) | 0/1 vectors only; shuffled distinct scores in `calibrate.test.ts:53` | no tie with non-binary values; no permutation invariance |
| Marginal coverage >= 1 - alpha (Thm 3.2) and <= 1 - alpha + 1/(n+1) for distinct scores (Thm 3.11, Prop. 3.12; Lei et al. 2018 Thm 2.2) | `interval-conformer.test.ts:55` (b): mean coverage >= 1 - alpha - 0.005 over 100 seeds, interval path only | no upper bound; tolerance 0.005 not derived from a bound; nothing on the set path |
| 0/1 score: qhat in {0,1}, COMMIT iff errors <= n - p (section 2.1, table 3(e)) | `quantile_formula_n_plus_1` (n = 50), `empty_set_not_allow` | thresholds at n = 100, 200, 300, 500 and the binomial P(COMMIT) never tested |
| Constant width 2 qhat (Papadopoulos et al. 2002; section 2.2) | `interval_conformer_coverage` (a): one yhat | independence of the width from yhat not asserted |
| L3 closed predicate and reason order (ADR-M002 D5, `l3-gate.ts:14-19`) | single conditions: `l3.test.ts` (intent, timeout, set_too_large, clock_expired), `l2.test.ts:72` (budget), `interval-gate.test.ts:42`, `interval-nondegenerate.test.ts:81` | overlapping conditions (e.g. budget_exhausted AND set too large) never enumerated; budget equality B_t = B_floor never probed |
| btc-dir fixture switch alpha >= 7/151 (M-2) | none (`gate.test.ts` uses alpha = 0.1 only) | whole |
| USDe atom at 0 (129/613) and ties (M-3; section 2.2) | `usde-calibration.test.ts:69` (alpha = 0.10 stats), `gate.test.ts:576` (NDG-1 on a hand-built case) | the qhat = 0 switch on the real fixture never tested |

## 4. Scope

- **In**: twelve new tests in three new test files; tests only; pure (no clock read, no network, no file read in the new files, no environment variable), deterministic (committed seeds), English, ASCII only.
- **Changed production lines: 0.** **Changed existing test lines: 0.** No served text, no pinned text, no frozen contract, no schema touched.
- **Files (closed list; the PR diff must equal it)**:
  1. `packages/hikae/test/oracle-l1-split.test.ts` (new): O-1 to O-6.
  2. `packages/hikae/test/oracle-l3-interval.test.ts` (new): O-7 to O-10.
  3. `apps/harness/test/oracle-fixtures.test.ts` (new): O-11, O-12.
- Overlap with the MONARK in-flight list (reply section 1): none. Forbidden zones untouched: `schemas/**`, `packages/contracts/**`, `apps/site/**`, `scripts/export-public.mjs`, `vocab-banned.json`, registers.
- The three files are picked up by the existing `npm test` globs (`packages/*/test/*.test.ts`, `apps/harness/test/*.test.ts`, `package.json:16`) and by `tsconfig.json` `include`; no configuration change.

## 5. Tests (all expected GREEN at base: category pin, never F2P; killer in the closed format of `red-proof.mjs:19-20`, on the line right above each `test(`)

Oracle sources: [TB] = Angelopoulos, Barber & Bates, Theoretical Foundations of Conformal Prediction (arXiv:2411.11824v5), fiche `biblio/lot3/01-inference-conforme-et-calibration.md:282`; [LEI] = Lei, G'Sell, Rinaldo, Tibshirani & Wasserman 2018, fiche `biblio/lot2/01-inference-conforme-et-calibration-1.md:1288`; [SOA] = `etat-de-l-art/INFERENCE-CONFORME-vs-MONARK.md` (section cited); [D5] = ADR-M002 D5 as declared in `l3-gate.ts:4-19`.

| # | Test name | File | Oracle | Category | Killer (base `b052e94`) |
|---|---|---|---|---|---|
| O-1 | `oracle_split_rank_matches_exact_rational_rank` | 1 | Exact integer rank ceil((n+1)(100-k)/100) [TB Alg. 3.6, Thm 3.2]. Black box: scores 1..n give qhat = p. Grid n = 1..200, k = 1..99: `under_calib` iff exact p > n; else code p in {exact, exact + 1} (envelope, M-1); equality on alpha in {0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5}. | pin | `// killer: packages/hikae/src/l1-split.ts:37 CONST "(n + 1)" -> "(n + 0)"` |
| O-2 | `oracle_split_under_calib_iff_alpha_below_one_over_n_plus_1` | 1 | p > n iff alpha < 1/(n+1) [TB Thm 3.2; SOA 2.4]. n in {9, 19, 49, 99, 150, 613}: alpha = 0.999/(n+1) -> `under_calib`; alpha = 1.001/(n+1) -> qhat = max score; n = 0 with nMin = 0 -> `under_calib`. Asserts unconditional (no `if`). | pin | `// killer: packages/hikae/src/l1-split.ts:38 ROR "p > n" -> "p >= n"` |
| O-3 | `oracle_split_fail_closed_on_alpha_outside_open_unit_interval` | 1 | Fail-closed rule (`l1-split.ts:25-28`, never a clamped value): alpha in {0, -0.1, 1, 1.5, NaN} -> `under_calib`, never a `qhat` key. | pin | `// killer: packages/hikae/src/l1-split.ts:41 SDL "q === undefined" -> ""` |
| O-4 | `oracle_split_ties_and_input_order` | 1 | qhat = p-th order statistic, ties counted with multiplicity; qhat is a symmetric function of the scores [TB Thm 3.2 hypothesis]. Hand vectors with ties (e.g. n = 9, alpha = 0.2, values {0, 1, 1, 1, 2, 2, 5, 5, 7} -> p = 8 -> 5); 20 seeded permutations give the same qhat. | pin | `// killer: packages/hikae/src/l1-split.ts:39 CONST "a - b" -> "b - a"` |
| O-5 | `oracle_indicator_commit_threshold_matches_binomial_table` | 1 | 0/1 score: largest error count with qhat = 0 found by scan equals n - ceil((n+1)(1-alpha)) = 4, 9, 19, 29, 49 for n = 50, 100, 200, 300, 500 at alpha = 0.1 [SOA 3(e) table, 2.1]; `conformalSet` size 1 at qhat = 0, 2 at qhat = 1; exact binomial P(qhat = 0) (log recurrence in the test) equals 0.431, 0.268, 0.112 (n = 50) and 0.466, 0.164, 0.015 (n = 200) to 1e-3 [SOA 2.1, M-4]. | pin | `// killer: packages/hikae/src/l1-split.ts:37 CONST "(1 - alpha)" -> "(1.01 - alpha)"` |
| O-6 | `oracle_split_marginal_coverage_seeded_exchangeable` | 1 | [TB Thm 3.2, Thm 3.11, Prop. 3.12; LEI Thm 2.2]: for a.s. distinct exchangeable scores, P(covered) = p/(n+1) exactly, inside [1 - alpha, 1 - alpha + 1/(n+1)]. Uniform draws from a local mulberry32 (8 lines, seed 20260930 committed, first draw pinned by value), (n, alpha) in {(19, 0.1), (24, 0.1)}, R = 20 000: assert the hand values 18/20 and 23/25 lie in the bound, and abs(K/R - p/(n+1)) <= t = sqrt(ln(2e6)/(2R)) (Hoeffding, delta = 1e-6, M-5). | pin | `// killer: packages/hikae/src/l1-split.ts:40 CONST "p - 1" -> "p - 2"` |
| O-7 | `oracle_l3_set_path_reason_order_exhaustive` | 2 | [D5] reason = first true of: not evaluable, timed out, nCalib < nMin, verdict `under_calib`, intent not in C, B_t < B_floor, then size (clock open: defer `set_too_large`, else abstain `clock_expired`), else commit `covered`. All 2^7 = 128 combinations of the seven flags, oracle written in the test as an ordered list; includes budget_exhausted before set_too_large and the D6(b) case (verdict `under_calib` at nCalib >= nMin). | pin | `// killer: packages/hikae/src/l3-gate.ts:88 COR "||" -> "&&"` |
| O-8 | `oracle_l3_interval_path_reason_order_exhaustive` | 2 | [D5, interval path, `l3-gate.ts:119-139`]: common guards, then lo >= hi -> `under_calib`, then B_t < B_floor, then width > tauInterval (clock), then intent. All combinations, plus B_t = B_floor (commits: D5 reads B_t >= B_floor). | pin | `// killer: packages/hikae/src/l3-gate.ts:126 ROR "<" -> "<="` |
| O-9 | `oracle_interval_width_is_two_qhat_for_every_yhat` | 2 | Split interval has constant width 2 qhat, independent of the test point [SOA 2.2, Papadopoulos et al. 2002; LEI]: one calibration (hand residuals 1..19, alpha = 0.1 -> p = 18 -> qhat = 18), yhat in {-1e3, 0, 0.5, 1234.5}: lo = yhat - 18, hi = yhat + 18 exactly. | pin | `// killer: packages/hikae/src/interval-conformer.ts:88 CONST "params.yhat + qhat" -> "params.yhat + 2 * qhat"` |
| O-10 | `oracle_interval_marginal_coverage_seeded_exchangeable` | 2 | Same oracle as O-6 through `conformInterval` (absolute residual score): pairs yhat = 0, y = u - 0.5 with u uniform (seed 20260931 committed), n = 19, alpha = 0.1, R = 20 000: abs(K/R - 0.90) <= t. A signed-residual mutant gives about 0.80. | pin | `// killer: packages/hikae/src/interval-conformer.ts:56 CONST "Math.abs(c.y - c.yhat)" -> "(c.y - c.yhat)"` |
| O-11 | `oracle_btc_dir_fixture_commit_switch_at_alpha_7_over_151` | 3 | Exact computation on the committed fixture (M-2): n = 150 and 6 ones asserted; `runGate` on btc-dir with tau = 1: alpha = 0.0464 -> verdict `covered`, `abstain` false, action commit; alpha = 0.0463 -> verdict `set_too_large`, action defer; alpha = 0.0066 -> `under_calib`; alpha = 0.0067 -> qhat = 1 (max). | pin | `// killer: apps/harness/src/tools/gate.ts:488 ROR "labels.length > params.tau" -> "labels.length >= params.tau"` |
| O-12 | `oracle_usde_fixture_zero_atom_ties` | 3 | Exact computation on the committed fixture (M-3; SOA 2.2: atom at 0, ties, only the lower bound holds [LEI]): n = 613, 129 zeros, 458 distinct asserted; `runGate` on the USDe key: alpha = 0.79 -> qhat 0 -> abstain `under_calib` (NDG-1); alpha = 0.789 -> `covered`, region [yhat - q, yhat + q] with q = 5.362499999917738e-11; alpha = 0.0016 -> `under_calib`; alpha = 0.0017 -> q = max. | pin | `// killer: packages/hikae/src/region.ts:71 ROR "lo === hi" -> "lo > hi"` |

- Each `<before>` text occurs exactly once on its cited line at `b052e94` (checked by `grep` on the blobs); each killer targets production code outside `test/` (rule `red-proof.mjs:21-22`). Killers are re-anchored at the freeze if `main` moves (risk R-2).
- Expected counts: **F2P 0, new-module 0, pins 12**; test count of the full suite = reference + 12.
- Seeds and pinned values live in the test files; no fixture file is added (R-25 then counts every line; no `fixtures/**` exclusion needed).

## 6. R-25 estimate

- Ascending estimate: file 1 about 210 lines (6 tests, a local PRNG, a binomial helper, the grid); file 2 about 170 (4 tests, input builders, two enumeration oracles); file 3 about 100 (2 tests, imports). **Total about 480 insertions, 0 deletion**, under the G0 ascending bound 547 (CHECKLIST-G7 item 4); measured bound 1 150 (STOP), CI gate 1 205 (`ci.yml:49`). The pathspec of `ci.yml:79` counts `packages/*/test/**` and `apps/harness/test/**` in full.
- Cut-over rule, written before coding: if `r25()` measured at the G1 freeze exceeds 547, file 3 (O-11, O-12) leaves for a sibling lot `lot/conformal-oracle-tests-b`; the tests are never compacted to fit (REGLES-MISSION, line dated 13:0x, C-V-6).

## 7. Out of scope (explicit)

- Any production change, including the float rank of M-1 (signal for MONARK, Q-2), the `covered` reason on an empty BYO set (P3: reserved to worksite 4 or a note, Q-5), and the conditional assertions of `quantile_formula_n_plus_1` (Q-3).
- Worksites 2 to 5: binomial test before COMMIT (LTT/RCPS), server-imposed alpha/nMin/tau, graded LAC score, Mondrian strata, e-values.
- Coverage claims on dependent series (BTC, USDe): the simulations are exchangeable by construction; no test states anything about real series (SOA section 5, items 3 and 7).
- The tracker, L2 monitor and sentinel (`tracker.test.ts` already carries Thm 8.7-style oracles).
- The liq class (`liquidation-eligible-coverage`): its calibration differs between `main` and the trunk; left to the U-4b lots.
- Public mirror, served texts, tool descriptions, README.

## 8. Risks

- **R-1, language gate.** The new files are scanned by `lang:gate` and exported. Mitigation: ASCII only (no accent, no Greek letter, no math symbol: write `alpha`, `qhat`, `<=`); no word of `FR_WORDS`, even as a snake_case part (traps measured: `le`, `la`, `les`, `un`, `une`, `des`, `par`, `sur`, `sous`, `pour`, `est`, `pas`, `tout`, `ces`, `aux`, `ont`, `tel`, `exemple`, `valeur`, `champ`); author names without diacritics (`Candes`, `Wuthrich`); no banned honesty word even though tests are not vocab-scanned (`guarantee`, `confidence`, `accuracy`, `predicts`, `verified`). G1 runs `npm run lang:gate` before freezing.
- **R-2, line anchors.** Killers cite lines at `b052e94`. The Dojo lots do not touch these files (MONARK reply section 1), but the trunk may merge into `main` before the G7; the lot rebases on `main` before review and re-anchors every killer, then re-runs `grep` of each `<before>`.
- **R-3, calibration.ts drift.** The trunk version of `apps/harness/src/calibration.ts` differs from `main` (liq rows). O-11 and O-12 read only the two arrays and their counts; a change of `BTC_DIR_CALIB` or `USDE_STABLE_RUN_CALIB` is already fail-closed by their pinned digests (`calibration.ts:29-40`, `:158-170`, `usde-calibration.test.ts`).
- **R-4, Monte Carlo flakiness.** None at run time: the seed is committed, the result is a fixed number. The Hoeffding band documents that the seed was not chosen: any seed passes with probability >= 1 - 1e-6 and the killers are separated by more than 2t. Run time about 0.2 s for O-6 and O-10 together.
- **R-5, byte guard.** No TAB, LF only, no control byte, and no backslash in the three files (no regex escape, no escape sequence in strings, no escaped quote in killer lines: every `<before>` above is quote-free).
- **R-6, lint and typecheck.** `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` apply to tests (`tsconfig.json` includes `packages/*/test/**`, `apps/harness/test/**`); no `any`, no non-null assertion, no `eslint-disable`; the files stay off the lint ratchet.
- **R-7, pin proof tooling.** `red-proof.mjs` at the trunk has no pin category (M-7): its run on this lot will exit 1 with twelve `refused: green at base`. The pin admission then rests on the declared pin list plus the mutant campaign (`scripts/mutants/run.mjs --killers`). See Q-1.
- **R-8, host.** The RECHERCHES container runs Node v22.22.2; the workshop requires Node >= 24 (`package.json` engines; type stripping without flag). RECHERCHES installs Node 24 before any run and cites `node --version` with its outputs.

## 9. How RECHERCHES runs the suites (remote host, no access to `F:/`)

RECHERCHES cannot take the host lock of `scripts/oracle/run.mjs` (TEMP and lock under `F:/tmp`). It replays the suites and gates on its own clone of the lot branch, Node 24, after `npm ci` in that clone only, and cites each command, exit code, `date -u`, and the sha256 of each captured output:

1. `npm run gate:vocab`
2. `npm run typecheck`
3. `npm test` (full suite; count = reference + 12; the three new files also run alone by `node --test <file>`)
4. `npm run lint` and `npm run lint:ratchet`
5. `npm run lang:gate` (global, exit 0)
6. `npm run export:check`
7. R-25: `node <trunk checkout>/scripts/oracle/r25.mjs` logic, i.e. `git diff --shortstat b052e94...HEAD` with the pathspec of `ci.yml:79`
8. Pin proof: `node <trunk checkout>/scripts/red-proof.mjs --base <main sha> --gel <lot clone>` (expected: twelve `green at base`, cited as the pin evidence), then each killer applied alone on a scratch copy, the target test red, file restored and checked by sha256 (or `scripts/mutants/run.mjs --killers` if MONARK prefers it run remotely)
9. Byte guard on the three files: 0 TAB, 0 CR, 0 control byte, 0 backslash, UTF-8 = ASCII, final LF.

The workshop oracle record is produced by MONARK at checkpoint-2 and G7 (reply section 3).

## 10. PR content (for a review under one hour, reply section 3)

Title `worksite-1: conformal-oracle-tests`; "No ADR: tests only, no behaviour change (MONARK reply 2026-09-30, worksite 1)"; file list = section 4; measured R-25; per test its killer and category (all pins); no served text changed; section "Review Focus": input classes = grid of (n, alpha), boundary alpha = 1/(n+1), out-of-range alpha, ties, continuous exchangeable draws, 0/1 scores, all L3 flag combinations, the two committed fixtures; byte guard green; base sha of `main`; line references on that sha.

## 11. Checkpoint-1 request to MONARK's validator

Please approve, or return with corrections, before any code: (a) the closed file list (section 4); (b) the twelve tests, their oracles and their pin category (section 5); (c) the twelve killers and their anchoring on `b052e94`; (d) the R-25 estimate and the pre-declared cut (section 6); (e) the remote replay protocol (section 9) and the questions below. After approval: G1 (implementation) and G2 (review) by RECHERCHES in two separate fresh-context instances, the G2 reviewer never being the implementer; checkpoint-2 and G7 by MONARK.

## 12. Questions (closed; recommendation first)

- **Q-1 (MONARK, method)**: with RED-PROOF-PIN-1 unmerged, is a lot made only of pins proven by (i) the red-proof output showing twelve `green at base`, (ii) a declared pin list (precedent: PR-1b-5a, "5 pins declared", CHANTIERS l.2153) and (iii) the killers killed by `scripts/mutants/run.mjs --killers`? Recommended: yes, the campaign run by MONARK at checkpoint-2.
- **Q-2 (MONARK)**: M-1 float rank excess (231/39 600 cells, always +1, conservative) filed as a new signal P10 for a later behaviour lot (exact integer or rational rank). O-1 is written as the envelope {exact, exact + 1} so such a fix stays green. Recommended: file P10; do not pin the current value.
- **Q-3 (MONARK)**: tighten the conditional asserts of `quantile_formula_n_plus_1` (`l1.test.ts:16-37`) in this lot (+about 6 lines, judged as a pin) or leave it (O-2 covers the p = n boundary)? Recommended: leave it, keep "changed existing test lines: 0".
- **Q-4 (MONARK)**: base = `main` `b052e94` with the tools taken from the trunk `8d5dc0c`, rebase on `main` before review. Confirm.
- **Q-5 (MONARK)**: P3 (reason `covered` on an empty BYO set) stays out of this lot (a pin would freeze a flagged behaviour) and goes with worksite 4. Confirm.
- **Q-6 (MONARK)**: where does this G0 live in the workshop: committed by MONARK as `docs/G0-lot-conformal-oracle-tests.md` (excluded from R-25 by `docs/**/*.md`), or kept in the RECHERCHES notebook and cited by sha256?
- No question to the founder.

## 13. Alternatives rejected

- One single test file: rejected, the harness fixtures import `apps/harness/src` and belong under `apps/harness/test`; splitting by layer keeps each file under about 210 lines and lets section 6 cut on a file boundary.
- Seeds drawn at run time or `Math.random`: rejected (non-deterministic; rule "seed committed in the test").
- Reusing `mulberry32` from `packages/hikae/src/s2/instrument.ts`: rejected, a change of the S2 instrument would then move these oracles; a local 8-line copy with its first draw pinned keeps them independent.
- Asserting the exact code rank on the M-1 cells: rejected, it would pin a conservative deviation from Algorithm 3.6 and redden a future fix.
- Tolerance from a CLT band: rejected, Hoeffding is a finite-sample bound on the binomial tail (SOA 1.1 G: prefer exact or finite-sample bounds).

## 14. Conduct

- Workshop clone read only: `git fetch` of `lot/etude-suite`, `git show`, `git ls-tree`, `git log`, `git diff --stat`, `git grep`; no write, no commit, no `npm install` there. Computations (M-1 to M-5) by standalone Node scripts in the session scratch directory, on values re-typed or parsed from the blobs; no workshop code executed. No network other than the git fetch. One file written: this G0.

## 15. Declared deviations

- E-1: the workshop G0 journals are in French; this one is in English (founder decision 2026-09-30, everything that can reach the public repository is English).
- E-2: no ADR file accompanies this G0 (worksite 1 agreed without ADR); the plan sections that a G0 journal usually delegates to its ADR are inline here (precedent: `docs/G0-lot-lang-gate-ci.md`).
- E-3: sha256 of files over 100 lines listed in section 1 are shortened to their first and last characters in two rows; the full values are recomputable by `git show <rev>:<path> | sha256sum`.

## 16. Handover

- Deliverable: `recherches/decisions/0001-G0-lot-conformal-oracle-tests.md`; sha256 given outside the file (final answer). Byte guard checked after writing: 0 TAB, 0 CR, 0 backslash, final LF.

## 17. Approval MONARK 2026-09-30

- Source: RECHERCHES notebook, `coordination/messages/2026-09-30-MONARK-vers-RECHERCHES-reponse-checkpoint-1-chantier-1.md` (commit `93dffc8`). Sections 1 to 16 above are the approved bytes (sha256 `afeb367b7dcdead263632abfe9c8e1d7b1fcbd217d8b0ebef5626ca9558c6ddd`); this section is appended.
- Verdict: plan approved with three corrections.
- C-1 (O-1, tighter envelope): the +1 rank excess is admitted only on cells where (n+1)(100-k) is divisible by 100; everywhere else the code rank equals the exact rational rank. Recomputed by RECHERCHES: n = 1..2000, k = 1..99: 1 159 deviations, 0 outside divisible cells.
- C-2 (O-7, O-8, oracle source): the ordered reason list is written from the declared text of ADR-M002 D5, as quoted in the header of `packages/hikae/src/l3-gate.ts` l.4-19, with that reference as a comment in the test; never read back from the chain of `if` in the code.
- C-3 (R-25 unit, non blocking): 480 is a measured count; the measured limit is 1 150 (CHECKLIST-G7 item 4). The cut at 547 measured lines is stricter and is kept.
- Q-1: yes. Pin proof = (i) `red-proof.mjs` refuses exactly the declared tests as `green at base` and nothing else; (ii) the declared list in the PR; (iii) `scripts/mutants/run.mjs --killers` run by RECHERCHES at G1 on its own host, `RESULTS.json` cited by sha256, each killer killed by an assertion. MONARK replays it once at merge.
- Q-2: P10 recorded (float rank excess), fixed in a later behaviour lot. O-1 stays green after that fix.
- Q-3: fix it in this lot. The three conditional asserts of `quantile_formula_n_plus_1` (`packages/hikae/test/l1.test.ts` l.16-37) become unconditional: one more pin (P-13), same killer as O-2. The closed file list gains `packages/hikae/test/l1.test.ts`, and "changed existing test lines: 0" no longer holds for that file only.
- Q-4: confirmed. Base `main` `b052e94`, tools from the trunk, rebase on `main` before the merge check. The PR targets `main`.
- Q-5: confirmed. P3 stays out, with worksite 4.
- Q-6: this file, first commit of the lot branch.
- Process for test-only lots: MONARK approves the plan directly; RECHERCHES implements and reviews; MONARK runs one check at merge (full suite, `--killers`, oracle on the merged tree).
