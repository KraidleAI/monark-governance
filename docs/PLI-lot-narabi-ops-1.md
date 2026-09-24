# PLI — lot NARABI-OPS-1 (G1 worker report)

- **Model resolved (R-1)**: `claude-opus-4-8[1m]` (Opus 4.8, 1M context), effort max. Prefix `claude-opus-4-8`
  as pinned (maintainer 2026-08-14). Worker never commits, never triggers a workflow (R-20).
- **Base** `eac7eea`; **branch** `lot/narabi-ops-1`; **worktree** `F:\Monark-wt-narabiops`. Date 2026-09-20.
- **Scope delivered**: L-1, L-2, L-3, L-4, L-6 (docs). **L-5 (external probe) DEFERRED to pli NARABI-OPS-1b**
  by C-11 (R-25 target) — formed item below, full spec in ADR §Deferral of L-5. Nothing committed.

## Touched set + sha256 (LF-normalized)

| File | Status | sha256 (LF) | R-25 |
|---|---|---|---|
| `apps/sentinel/src/run.ts` | edit (L-1, C-4) | `f01e4e1900775f21b2ae664027095fb6044c78b6ff83d98766eefb69a62baa18` | counted |
| `apps/sentinel/src/rpc.ts` | edit (L-3, C-1, C-4) | `b9a476bfe18c85009e222745424ed999e86dedec596cda5dfae6a1bb5530b697` | counted |
| `deploy/monark-sentinel.timer` | edit (L-2, C-2) | `d84a08b5dbdfe7d371052546567a187bd672a7af9d2251269608e01d48c9833e` | counted |
| `deploy/monark-sentinel.service` | edit (L-2, C-5) | `9e83a033d04289002c1a95361d8711498803dae279059aa4a4942b5c6839e4eb` | counted |
| `apps/sentinel/test/sentinel-retry.test.ts` | new (L-4, C-6, C-1, C-4, L-3) | `35051da5a01de760701cf9061060a4d669839feea595b0cd1dc464139bea8bd8` | counted |
| `test/ci-gates.test.ts` | edit (L-2 tests) | `aa5eebc351774df339a26c9d63cbf669dc5e2f7c46fe5ce6d1da691d52c3f97f` | counted |
| `test/no-secret-in-repo.test.ts` | edit (C-5 comment) | `f2ade09e5c2b97afafdb7c3fab4510674f680ce8074169c6196d6e92717e9d1d` | counted |
| `apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl` | new (C-7 fixture) | `51716581a3a597162bda431c5d57c1a86f0ee2faef1dfaaef643cc3be1aad951` | excluded (series) |
| `apps/sentinel/test/fixtures/PROVENANCE-narabi-timeline-2026-09-19.md` | new (C-7) | `0a1408ced33106bcda240e27227b075788ba1c5ff316247d58550865ca70e0c3` | counted (.md under fixtures, not docs/) |
| `docs/adr/ADR-NARABI-OPS-1.md` | new (L-6, C-9/C-10) | `d7d0fb21b200b0de2afacd5d59ca679d43162375ba040fe22853f85f307f1d54` | excluded (docs/**/*.md) |
| `docs/RUNBOOK-sentinel.md` | edit (L-6, C-2/C-5/C-9) | `a81f1ed2d3bad290c9d1b3877eb97c0a4ac14487daa50cd149ec7f8377febe41` | excluded (docs/**/*.md) |
| `docs/PLI-lot-narabi-ops-1.md` | new (this file) | (self) | excluded (docs/**/*.md) |

`fleet.ts`, `apps/site/lib/narabi-snapshot.ts`, `apps/site/lib/narabi-live.ts`, `providerOf`, `vocab-banned.json`
are UNCHANGED (CA-11; C-3 byte-identical `providerOf`). The fixture's LF sha is pinned in its same-dir
PROVENANCE (root test `series_pinned_are_declared_and_hashed` green).

## Mutants (7, each single-line, each reds a NAMED test with its exact message, restored sha-exact)

Harness: `F:/tmp/nops/mutants.mjs` — for each mutant: assert the find-string is unique, apply, run
`node --test --test-name-pattern <pat> <file>`, assert exit != 0 AND stdout contains the expected assertion
message, restore from a byte-exact backup, assert the restored sha256(LF) equals the pre-mutant sha.

| # | Mutation (single line) | File | Reds test | Asserted message | red | sha-exact restore |
|---|---|---|---|---|---|---|
| M1 | `exitCode = stopped!==null ? 1:0` → `? 0:0` | run.ts | `sentinel_retry_replays_incident` | `no_quorum => exit 1` | ✔ | ✔ |
| M2 | `HTTP … ${redactEndpoint(url)}` → `${url}` | rpc.ts | `sentinel_never_prints_endpoint_url` | `the error carries no key path` | ✔ | ✔ |
| M3 | `publishedEndpoints`: `redactEndpoint(extra)` → `extra` | rpc.ts | `sentinel_never_prints_endpoint_url` | `the Chainstack endpoint is published redacted` | ✔ | ✔ |
| M4 | four `OnCalendar=` → one | monark-sentinel.timer | `sentinel_timer_has_retry_slots` | `exactly four OnCalendar= slots` | ✔ | ✔ |
| M5 | delete `EnvironmentFile=-/etc/monark/sentinel.env` | monark-sentinel.service | `sentinel_service_reads_env_file` | `EnvironmentFile=-/etc/monark/sentinel.env present` | ✔ | ✔ |
| M6 | `chainstack: hasChainstack()` → `chainstack: false` | run.ts | `sentinel_chainstack_run_publishes_redacted_and_flags` | `end JSON flags chainstack (C-4)` | ✔ | ✔ |
| M7 | `if (lines>0)` → `if (lines>0 && stopped===null)` | run.ts | `sentinel_retry_replays_incident` | `one line was appended (2026-09-18) despite the later stop` | ✔ | ✔ |

Pre-mutant sha256(LF) verified equal to the delivered files above after all restores (run.ts / rpc.ts / timer /
service). No mutant left in the tree.

## R-25 (C-11)

Measured against `eac7eea` under the exact `ci.yml:65` pathspec (untracked new files included via
`git add -N`, then `git reset` — no commit). **Core (delivered) = ~423 changed lines** (milestone at mid-G1 was
424 before the lint clean-up removed one line). Under the 500 target; well under the 1205 ceiling.

**C-11 consequence, stated (not cut alone):** the probe L-5 (`scripts/probe-narabi.mjs` ~90 +
`scripts/probe-narabi.d.mts` + `deploy/monark-probe.{service,timer}` + `test/probe-narabi.test.ts`, ~200 lines)
would push the lot to ~620, over the 500 target ⇒ **L-5 becomes pli NARABI-OPS-1b**. Deferred here, formed
below. This is a formed item with a named trigger, not a dropped deliverable (branchement / Dettes rule).

## Oracles (all green at G1; re-run by the orchestrator adversarially, R-21)

- `npm run gate:vocab` — OK, 171 files, 0 forbidden claim (§F obligatory).
- `npm run typecheck` — OK (tsc --noEmit, repo-wide).
- `npm run lint` — OK (eslint, 0 errors).
- `npm run lint:ratchet` — 69/69 (no new deferred-typing debt).
- `npm run lang:gate` — OK, 0 non-exempt French in every gated scope (incl. `sentinel`).
- `npm run export:check` — OK, 0 forbidden path, 0 non-exempt French (the exported `apps/sentinel/test/**` —
  new test + fixture + PROVENANCE — passes).
- Targeted: `apps/sentinel/test/*.test.ts test/ci-gates.test.ts test/no-secret-in-repo.test.ts` — all pass
  (incl. `series_pinned_are_declared_and_hashed`, `no_secret_in_repo`, `fleet_register_built_set_is_frozen`,
  the 4 new sentinel-retry tests, and the 2 new ci-gates tests).
- `npm run ci` — **OK: 427 tests, 0 fail** (base 421 + 6 new), ~34 s, measured 2026-09-20 06:53 UTC after
  confirming no other worktree's node was mid-`npm run ci` (only openalex-mcp / claude-mem MCP servers were
  running). Runs gate:vocab + typecheck + the full test suite. The 6 new tests: `sentinel_retry_replays_incident_and_exit_codes`,
  `sentinel_never_prints_endpoint_url`, `sentinel_chainstack_run_publishes_redacted_and_flags`,
  `sentinel_quorum_accepts_chainstack_as_distinct_operator`, `sentinel_timer_has_retry_slots`,
  `sentinel_service_reads_env_file`.

## Evidence highlights (reproducible)

- L-4 reproduction is REAL: one `curl` of `https://monarkgate.tech/narabi/timeline.jsonl` (C-7) captured the
  3 lines; the 2026-09-19 line's published `line_hash` is
  `f73c700642b394c46ede6c930cff3186f516a9447190a16a57010bb10ad55b2c`; the subprocess replay on the real `main`
  reproduces it byte-for-byte (`endpoints`/`node_version`/`sentinel_sha` are outside `hashedFields`).
- C-1: with a fake keyed endpoint in the env, the served line lists the 9th endpoint as `https://rpc.example.test`
  (origin only) and the secret path never appears in stdout, the written line, or an error message.

## Formed item — L-5 (pli NARABI-OPS-1b)

Deferred by C-11 (R-25). Full spec is in `docs/adr/ADR-NARABI-OPS-1.md` §Deferral of L-5 (built-ins only,
duplicated 31-field `hashedFields` order, `--file`/`--now` injection, root `test/probe-narabi.test.ts` +
`scripts/probe-narabi.d.mts` sidecar, Bell VPS `probe` user, `ReadWritePaths=/var/lib/monark-probe`,
`OnCalendar` ≥ 10:30 UTC, exit 1 on `lag_days>0`, tests `probe_line_hash_equals_sentinel_lineHashOf` +
`probe_narabi_detects_lag` incl. the tamper mutant). Open sub-item for 1b: whether `monark-probe.*` join
`vocab-banned.json` `scan.sentinel.files` or stay a formed item.

## Items relayed to the investor (non-blocking, unchanged from checkpoint-1)

- The probe's alert CHANNEL (mail / Discord webhook / `/status` page) — the `upcoming → built` trigger for the
  `probe → alerte` pipe.
- The Chainstack secret placement (orchestrator via ssh stdin + sha256 both sides, RUNBOOK) OR the investor
  posting `/etc/monark/sentinel.env` themselves — the runbook accepts either identically.
