# G7 — lot T-1a-ii-b3a (Bell: Token-2022 ScaledUiAmount rebase — trajectory, authority scan, 3-state gate, residuals, g_t per share)

- **Verdict**: **ACCEPTED** — orchestrator `claude-fable-5-1` (effort high), 2026-09-20.
- **Branch**: `lot/t-1a-ii-b3a`, base `3315ea7`, freeze `1925736`, G2 `c5c01bf`, fold -b3a-4 `c4b3dc2`, checkpoint-2 `(committed)`, fold C-V `0994934`.
- **Roles (R-1)**: G0 + checkpoint-1 `claude-fable-5-1` (C-1..C-12); workers (-b3a-1..-b3a-4) `claude-opus-4-8[1m]` effort max; fresh G2 `claude-opus-4-8[1m]`; checkpoint-2 `validateur-humain` `claude-fable-5-1` (accepted with corrections C-V-1..C-V-4); lecteur SPL Token-2022 `claude-sonnet-5`. No worker commit (R-20).

## Oracles, re-run by the orchestrator on `0994934`
| Check | Result |
|---|---|
| `npm run ci` (single run, log `F:/tmp/orch/ci-b3a-g7.log`) | **433 / 433, 0 fail**, exit 0 |
| `lint`, `lint:ratchet` (69/69), `lang:gate`, `export:check`, `gate:vocab` (171 files) | all exit 0 |
| R-25, exact `ci.yml` `STAT=` pathspec, `3315ea7..HEAD` | 15 files, +1 137 −54 = **1 191 ≤ 1 205** (`PROVENANCE-rebase-course.md` counted: `series/**/*.md` not excluded — known R-25 gap, CI-site item) |
| `git merge-tree --write-tree lot/etude-suite HEAD` | clean |
| `PINNED_BELL_SHA` | `126abfaed17630808942a0dafc0ff6f1f9acf375d8f7adc6487d8c1e9e2c06d3` (proved by subtraction of the 2 authority residual keys → `eaed7ea4…`) |
| Series (4) + PROVENANCE | sha256 LF identical working tree = HEAD = PROVENANCE = off-repo sources |
| Mutants | G2 9 killed (M1, M5, M6, M8, M9, M11, M12, M-r1, M-r2); -b3a-4 old-concat CPI killed; checkpoint-2 5 killed (M6, M12, CPI, M-r1, M8) |
| Secrets | 0 (only FAKE_UUID/URLs in negative tests); `HELIUS_API_KEY` never printed |

## Corrections closed
- C-1..C-12 (checkpoint-1): folded in -b3a-1..-b3a-3 (G2 confirmed; C-2 partial → C-G2-1).
- C-G2-1 (CPI order, `instructionIndex` per C-2) + C-G2-2 (runner pin item): folded in `c4b3dc2`.
- C-V-1..C-V-3 (checkpoint-2): folded in `0994934` — gate→g_t pipe restated as "flag consumed; producer ABSENT; composition not replayed" with a formed item; C-3 fail-open on the served path declared with a formed item; PLI pins refreshed.
- C-V-4: decision 60 (hybrid authority scan) — **investor ratification OPEN**; series carry `method: "hybrid-authority-scan (pending R-26 ratification)"`; `error_origin: orchestrator` if reversed.

## error_origin (journal)
- C-G2-1 (CPI order dropped `innerInstructions.index`): **rédacteur -b3a L-2** (worker), caught by fresh G2.
- C-V-2 (C-3 anchor claimed in `collect.ts` comment but only a presence read): **rédacteur -b3a** (wiring L-3/C-10), caught by checkpoint-2 harness.
- C-V-1 (checkpoint-1 accepted "flag consumed + source-regex test" as wiring): **checkpoint-1 orchestrator** — CA-11 amendment proposed to the investor: a "wired" pipe = a test that executes the composition from the input artefact, never an assertion on source text.
- Decision 55 refuted by measurement → decision 60: orchestrator (already journaled).

## Wiring (CA-11)
Nothing declared built; Bell stays `upcoming` (absent from `fleet.ts`, README, site, skills). Formed items with triggers: producer + non-LLM integration test for gate→g_t (G0 -b1-bis before any founding g_t); C-3 anchor in `buildSolanaSymbol` + `scanMethod` carried; `gate.residuals → state.json`; runner off-repo sha-pin; SetAuthority scan (`set_authority_unscanned`).

## Relayed outside the verdict
Decision 47 held (no founding g_t in this lot). SPYx enters `trajectory_known` in-window through an effTs at 2025-10-31T23:55Z (real case caught by C-1).

## Next
Merge `--no-ff`; G0 -b3b (or -b1-bis per CHANTIERS sequencing); investor ratifications 60, 61 and the CA-11 amendment.
