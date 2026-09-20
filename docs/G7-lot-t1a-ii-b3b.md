# G7 — lot T-1a-ii-b3b (Bell: Databento EQUS.SUMMARY cash close, Massive cross-check as residuals, earliest_publish_utc, halt delta on the on-chain leg, 2026 calendar cross-check)

- **Verdict**: **ACCEPTED** — orchestrator `claude-fable-5-1` (effort high), 2026-09-20.
- **Branch**: `lot/t-1a-ii-b3b`, base `2da0bf5`, freeze `e0de31d`, G2 `9d6dacf`, fold -b3b-2 `5da9734`, checkpoint-2 `1209e7c`, fold -b3b-3 `2154db6`, checkpoint-2 bis + docs `aa90ea9`.
- **Roles (R-1)**: G0 draft + folds `claude-opus-4-8[1m]`; checkpoint-1 `validateur-humain` `claude-fable-5-1` (C-1..C-11, escalation Q3(ii)); lecteur PR-B-DBN `claude-sonnet-5`; G1 worker + folds `claude-opus-4-8[1m]` effort max; fresh G2 `claude-opus-4-8[1m]`; checkpoint-2 and checkpoint-2 bis `validateur-humain` `claude-fable-5-1`. No worker commit (R-20).

## Oracles, re-run by the orchestrator on `aa90ea9`
| Check | Result |
|---|---|
| `npm run ci` (single run, log `F:/tmp/orch/ci-b3b-g7.log`) | **464 / 464, 0 fail**, exit 0 |
| `lint`, `lint:ratchet` (69/69), `lang:gate`, `export:check`, `gate:vocab` | all exit 0 |
| R-25, exact `ci.yml` `STAT=` pathspec, `2da0bf5..HEAD` | 12 files, +690 −81 = **771 ≤ 1 205** (`halts-tsla-synth.csv` counted, `series/**` untouched) |
| `git merge-tree --write-tree lot/etude-suite HEAD` | clean |
| `PINNED_BELL_SHA` | `0cfbed20fc7ab4391b687d870452211cdce02c3cc19ab1cc8f0425a3c24743d7`, proved by subtraction (`earliest_publish_utc` + 2 `cash_cross_*` keys → `126abfae…`, the -b3a pin) |
| Mutants | G1 9, G2 +2 own (M1..M10 after renumbering), -b3b-3 +4 (MV5b, MV6, MV8, MV9): **14 / 14 killed**; G2 probe (`close.ts:161`) and checkpoint-2 survivors all killed; checkpoint-2 bis replayed MV6, MV9 |
| ESC-1 c | anti-close diff vs the 20 raw closes (scaled 1e-9, decimal `.`, decimal `,`): **0 matches** in `apps/bell`, fixtures, lot docs, `test/`; `assertNoClose` unchanged; `cash_*` keys outside `CLOSE_KEY` |
| Databento | `metadata.get_cost` = 0.000031292439 $ for 4 underlyings × 5 days; ≈ 28 $/GB (decimal) / 30 $/GiB — corroborates decision 53; endpoint `hist.databento.com/v0` confirmed live (HTTP 200); 5 raws sha-pinned off-repo |

## Corrections closed
- C-1..C-11 (checkpoint-1): folded in the G0 (`2da0bf5`) and G1 (`e0de31d`).
- C-G2-1 (Massive-unavailable branch untested): folded `5da9734`.
- C-V-1 **blocking** (a real TSLA 2026-09-18 close and a second real close committed under a "synthetic" label): folded `2154db6` — replaced by declared synthetic 123.45 on a synthetic day; script proves 0/20 matches. C-V-1 bis (pre-existing literals since T-1a) cleaned in the same fold.
- C-V-2 / C-V-3 (three untested branches, O-1, O-2 disposition): folded `2154db6`.
- C-V-4 (docs): `aa90ea9` — CHANTIERS §E: -b3c item, Q3(ii) ratification line, PR-B-DBN #8 + C-6 trigger, prose-close masking rule; I-1 (three closes in prose, pre-existing) and I-2 (checkpoint-2 inversion) masked by token.
- C-V-5: authorship of -b3b-2/-b3b-3 recorded in the PLI.

## error_origin (journal)
- C-V-1: **shared validateur-humain / worker** — the checkpoint-1 prescribed the real close as the C-5 killer value (taken from `bell.test.ts` accepted at checkpoint-2 T-1a); the worker copied a byte-faithful raw record. Caught by checkpoint-2 (diff vs raws, CA-9). Amendment proposed by the validator (to ratify): every Bell checkpoint-2 diffs close-like literals against the sha-pinned raws, in `.` and `,` forms and in registers; docs mask by token, never by a value.
- C-G2-1, C-V-2, C-V-3: generator (worker).
- Decision 53 $/GB: corroborated (28–30), the service page "0.40 $/GB" discarded — no error.

## Wiring (CA-11, hardened)
`bell_close_databento_replays_synthetic_fixture` drives `runMain(argv, deps)` offline and asserts on the produced `state.json` / `provenance.json`; no source regex added. Halt delta composition executed from the real CSV + real fills (`collect()`), plus `BELL_HALTS_CSV` in the `runMain` composition (O-1). Nothing declared built; Bell stays `upcoming` (served consumer = T-1b). MWCB = ABSENT, PR-B-8 blocking release.

## Open (formed, not debt)
Investor ratification: Q3(ii) option (a) interim; decisions 60, 61; CA-11 amendment (composition test) and the anti-close amendment. PR-B-8 (MWCB, blocking release), PR-B-CAL (2025 calendar), PR-B-DBN #8 (EQUS.SUMMARY licence page before T-1b), -b3c triggers.

## Next
Merge `--no-ff`; next Bell lot = **-b1-bis** (decision 47: pool discovery 2025 + founding registry + rebase-aware course; first items = trajectory producer + C-3 anchor in `buildSolanaSymbol`).
