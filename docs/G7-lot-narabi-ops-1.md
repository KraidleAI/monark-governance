# G7 — lot NARABI-OPS-1 (sentinel: exit on lag, 4 timer slots, Chainstack 3rd operator, redacted endpoints)

- **Verdict**: **ACCEPTED** — orchestrator `claude-fable-5-1` (effort high), 2026-09-20.
- **Branch**: `lot/narabi-ops-1`, base `eac7eea`, delivery `ef1cd42`, G2 `9bf7c2d`, checkpoint-2 `cb43266`, fold C-V `7480f49`.
- **Roles (R-1)**: G0 orchestrator `claude-fable-5-1`; checkpoint-1 `claude-fable-5-1` (C-1..C-11); worker `claude-opus-4-8[1m]` (effort max); fresh G2 `claude-opus-4-8[1m]`; checkpoint-2 `validateur-humain` `claude-fable-5-1` (accepted with corrections C-V-1..C-V-5); fold C-V `claude-opus-4-8[1m]`. No worker commit (R-20).

## Oracles, re-run by the orchestrator on `7480f49`
| Check | Result |
|---|---|
| `npm run ci` (single run, log `F:/tmp/orch/ci-nops-g7.log`) | **427 / 427, 0 fail**, exit 0 |
| `lint`, `lint:ratchet` (69/69), `lang:gate`, `export:check`, `gate:vocab` (171 files) | all exit 0 |
| `sentinel-retry.test.ts` re-run alone | 4/4 (case (e) `--dry-run` present) |
| R-25, exact `ci.yml` `STAT=` pathspec, `eac7eea..HEAD` | 8 files, +411 −26 = **437 ≤ 500** |
| `git merge-tree --write-tree lot/etude-suite HEAD` | clean |
| Mutants | G2: 7/7 killed; checkpoint-2: M1, M2, M3, M4, M7 killed, MD survived → C-V-2 test added, MD **killed** (fold report, `0 !== 1` at `sentinel-retry.test.ts:189`) |
| Secrets | `CHAINSTACK_ETH_URL` never read or printed in-repo; `no-secret` test green; published `endpoints` are origins only |

## Corrections closed
- C-1..C-11 (checkpoint-1): folded in `ef1cd42` (G2 confirmed).
- OBS-1..OBS-5 (G2) and C-V-1..C-V-4 (checkpoint-2): folded in `7480f49` — RUNBOOK §6 "Redeploy on a LIVE timer", `--dry-run` exit case (e), operator descriptor, ADR trigger wording "built (code + test non-LLM); wired at deploy".
- C-V-5: JOURNAL-PROVENANCE entry (this G7) — `error_origin: none`.

## Wiring (CA-11)
Nothing new declared built. `timer → run → timeline` and `env → pool` are code + non-LLM test today; **"wired at deploy" is proven only by the first-run JOURNAL entry** (`chainstack: true`, `exit_code: 0`, one entry per each of the 4 slots), per RUNBOOK §6. External probe + mail alert = pli 1b (decision 58), `upcoming`.

## Relayed outside the verdict (pli 1b)
(i) If the real Chainstack host is `*.p2pify.com`, `providerOf` yields `p2pify.com` (quorum holds) but ADR D3 says `chainstack.com` — confirm at deploy without printing the variable. (ii) `sentinel-retry.test.ts` leaks `mkdtempSync` dirs under `F:/tmp` — add `after()` + `rmSync`.

## Next
Merge `--no-ff` on `lot/etude-suite`; deploy per RUNBOOK §6 (orchestrator, SSH, secret via stdin, sha256 both sides); JOURNAL first-run entries; then G0 pli 1b (SMTP relay + recipient from the investor).
