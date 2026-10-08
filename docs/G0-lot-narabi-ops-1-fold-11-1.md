# G0 — NARABI-OPS-1-FOLD-11-1: the section 11-1 fold of ADR-NARABI-OPS-1 (item A.8-1), the dead code of rpc.ts deleted and its allowlist entry retracted, the verbatim binding of the endpoints moved onto the served path

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), 2026-10-08. The plan from 09:47 UTC, this change from 10:47 UTC
  (`date -u`).
- **Demand**: MONARK `5ba0698` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-pli-11-1.md`), read in full:
  item A.8-1 of ADR-NARABI-OPS-1 (`docs/adr/ADR-NARABI-OPS-1.md:257`). The second redeployment of the sentinel (RUNBOOK-sentinel
  6-bis) is allowed only after this fold (`docs/adr/ADR-NARABI-OPS-1.md:253`). An item of an accepted ADR: no new ADR.
- **Plan**: recherches `4a33afd` (`coordination/pieces/2026-10-08-G0-narabi-fold-11-1/G0-NARABI-OPS-1-FOLD-11-1.md`), of which
  this note is the English copy, with the decisions folded in.
- **Decisions**: MONARK `b76eaa4` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-pli-11-1-q.md`). Q-1: both
  stale texts outside the closed list are fixed, with their killer. Q-2: the seven files below are opened for this change; the unit
  gets comment lines only. Q-3: the document acts after the merge are the maintainer's (section "After the merge").
- **`eccdeb4` not read**: PAROXYSME's points (b), (c), (d) and the starting conditions come from MONARK's summary of it in
  `5ba0698`. That commit is in neither clone (`git cat-file -t eccdeb4` fails in both); each point is re-checked here at the base.
- **Base**: trunk `lot/etude-suite` = `c5030fd9` (the merge of #249), branch `recherches/narabi-fold-11-1`: the parent of this
  note's first commit. The plan read `20fffe9f`; the first version of this note named `8a1aabef` (`ls-remote` at 10:48 UTC), and
  the shared worktree was moved to `c5030fd9` at 10:57 UTC, before the first commit. The merges in between (#233, #236, #249)
  change `apps/harness/`, the verifier tool job of `.github/workflows/ci.yml`, `scripts/verifier-tool-ci.*`, its test and four
  notes. The thirteen files this change and its guard rest on (the seven of the zone, `run.ts`, `timeline.ts`, `flow.ts`,
  `docs/adr/ADR-NARABI-OPS-1.md`, `docs/adr/ADR-U4b-calibration-episode-frais.md`, `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md`)
  are the same bytes at all three, `rpc.ts` at sha256 `0e232519…` among them, and the R-25 block of `ci.yml` (l.54-140) is the
  same; so the plan's addresses hold. Lines below are at the base, except those marked "at C". #243 merged into the trunk after
  the base (`d9cb6ef3`): it changes no file of this change, and the change merges with it without conflict.
- **Zone** (Q-2): `apps/sentinel/src/rpc.ts`, `apps/sentinel/src/keyless-transport.ts`, `apps/sentinel/test/sentinel-retry.test.ts`,
  `apps/sentinel/test/sentinel-chainstack-guard.test.ts`, `apps/sentinel/test/pool-rpc-1a.test.ts`,
  `test/rpc-guard-fetch-only-inside-client.test.ts`, `deploy/monark-sentinel.service` (comment lines only), this note and the
  Linux trace under `docs/traces/narabi-ops-1-fold-11-1/`. Unchanged: `apps/sentinel/src/run.ts`, `timeline.ts`, `flow.ts`, and
  `docs/RUNBOOK-sentinel.md` (#243 touches it; the maintainer merges #243 first).
- **Rules held**: no real RPC endpoint or provider is called; no key is read or written (every run is under `env -u` of the
  key-like names, and the environment carries no paid-key name); no host address is written; no data series byte is read. Node 24.21.0.

red-proof: test-only

The line above declares the range from the base to T1 (the binding tests) test-only, for
`node scripts/red-proof.mjs --base c5030fd9 --gel <T1> --test-only`. T2 and C change production code: they are proved in F2P mode
from T1 (section "Verification").

## Starting conditions and the guard of A.8-1, at the base

- **The guard does not fire.** Its text: "Garde : si le prereg d'une calibration suivante re-gèle `rpc.ts` avant ce pli ⇒ STOP
  (re-gel ou report)." (`docs/adr/ADR-NARABI-OPS-1.md:257`). The prereg documents git tracks are those of U-3, U-4 and U-4b with
  their pieces, the M2b measure of 2026-09-19 and ADR-M014 (the same list at `20fffe9f` and `8a1aabef`): none is a calibration
  prereg later than U-4b-1b. The only later act on the D4 frozen set is the amendment dated 2026-10-05
  (`docs/adr/ADR-U4b-calibration-episode-frais.md:2513-2522`): it re-freezes `scripts/record-u4b-calib.mjs` alone. No code pins the
  sha of `rpc.ts` (`git grep -l 0e232519 8a1aabef -- ':!docs'`: no file).
- **Run U-4b-1b closed in the freeze sense**: yes. The offline step 5e (`docs/PLAN-u4b-prereg.md:310`), sidecar 6:
  `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:40`, steps 6a to 6d exit 0 on 2026-09-23, 9 of 9 sha recomputed.
  Observation O-1, for the maintainer's D4 amendment: that 9 of 9 is the one of 2026-09-23. Recomputed at the base (LF form, as
  `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:447-453`), 6 of 9 are equal, `rpc.ts` among them; `record-u4b-calib.mjs` is
  re-frozen and `calib-digest.ts` removed by the dated amendment above; `packages/hikae/src/l1-split.ts` changed in the engine
  changes (`4e726c45`, `24c6a274`, `a61a483e`) with no D4 line found. The guard reads `rpc.ts` only: no block.
- **Time 1 closed in the run sense**: the T1 recorder is done (`docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:28`,
  `docs/ETAT-REPRISE.md:154`). In the release-phase sense no closing line exists at the base; that closing is precondition P-2 of
  the redeployment (`docs/RUNBOOK-sentinel.md:336`), not a precondition of this fold.
- **The sha256 of `rpc.ts` is the D4 freeze value**: `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0`, the line
  of `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:188`.

## The points measured first

- **(b) Moving the binding touches neither `run.ts`, `timeline.ts` nor `flow.ts`.** The correction is test-only
  (`docs/G2-lot-narabi-ops-1d-delta.md:210`, and l.223 for the empty-string halves); the closed list says `run.ts` is not touched
  by the fold (`docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:411`). Measured: the three files keep their base sha256 at C.
  The K-1 freezes `3402af47`, `78b93789` and `cb476f8e` cannot be read (`git cat-file -t` fails in both clones; the GitHub API
  answers 422), and decision P-28 is not taken (deadline 2026-10-12, `docs/PAROXYSME-Narabi.md:317-319`). What K-1a would touch
  (`docs/adr/ADR-K1-attesteur-narabi.md:82-86`) shares no code file with this change: comment lines of the unit and neighbouring
  test files only, a rebase cost for K-1a if P-28 keeps it, not a block.
- **(c) No other open change on `apps/sentinel`.** The open pull requests at 10:48 UTC (#250, #249, #243, #238, #237; file names
  read by the API) touch nothing under `apps/sentinel/`, neither the unit nor the guard test. #243 touches
  `docs/RUNBOOK-sentinel.md`, which this change does not touch. ETAT holds trigger items only on the area:
  SENTINEL-GUARD-ARMING-1 (`docs/ETAT.md:1408`) follows the G7 of this fold; SENTINEL-DEPLOY-GUARD-1 is carried to PXC-05 part 1
  (`docs/ETAT.md:572`). One stale line: SENTINEL-SIGTERM-LOAD-1 still reads open (`docs/ETAT.md:1835-1838`); the maintainer
  closes it.
- Its fix, `9d6181e0`, is an ancestor of the base (`git merge-base --is-ancestor`).
- **(d) The closed list of C-V-4 names no text that the PXC-02 kernel rewrites.** The list (`docs/CHECKPOINT2-lot-narabi-ops-1d.md:62`,
  extended by F-a to F-q, `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:387-409`) is code and test comments, the unit, and ADR
  and RUNBOOK text; the register entries that cite PXC-02 name 65 files, none of this change's.

## Construction

Commits after this note: **T1**, the binding tests (green at the base); **T2**, the guard test (red until C); **C**, the code; then
the Linux trace and the measures of this note. T is two commits because red-proof judges one kind of test per run: a test
green at base is refused in F2P mode (`scripts/red-proof.mjs:188`), and `--test-only` refuses any production change
(`scripts/red-proof.mjs:223`).
T1, T2 and C are pushed together, so CI never runs T2 red alone.

1. **The dead code deleted, its entry retracted** (F-a to F-d; C and T2).
   - `apps/sentinel/src/rpc.ts`: l.50-79 (`chainstackUrl`, `poolEndpoints`, `publishedEndpoints`, `hasChainstack`, with their
     JSDoc) and l.121-134 (`defaultCall`) deleted; l.142-145: `call: RpcCall` required, the `= {}` default and `?? defaultCall`
     removed (with `call?:`, the type check would stay green in silence). Stale comments l.3 and l.80 rewritten. At C: 0 hit of
     the guard's NET, KEY or KEY_BARE patterns in the file.
   - `test/rpc-guard-fetch-only-inside-client.test.ts:109`: the `rpc.ts` entry of `SENTINEL_ALLOW` (opened l.108) removed; one entry
     is left, `keyless-transport.ts`. Self-armed: the per-entry non-vacuity (l.176-180) reddens an entry left without hits.
   - No other consumer of the deleted exports; every caller of `makeRpcPool` injects `call`, except
     `apps/sentinel/test/sentinel-retry.test.ts:229` (item 5). The caller added since the closed list, `test/narabi-live.test.ts:1072`,
     injects `call`.
2. **The closed list of C-V-4 texts co-edited** (F-e, F-m, F-n, F-o; T2, T1 and C).
   - The guard test: l.10-12, l.20, l.41 (the old test name `ukemi_src_clean_and_allowlist_load_bearing` becomes
     `sentinel_src_clean_and_allowlist_load_bearing`), l.72-78, l.105-107, l.175. Q-1: also l.113 ("a paid-key/fetch module") and
     l.206-207 ("residual-118 paid leg"), outside the list, true no more once `rpc.ts` carries no key and no `fetch(`. Under the
     same rule, two more texts the retraction makes false: l.171 ("the two allowlisted files are exempt"), in the body of the
     test T2 judges, and `apps/sentinel/src/keyless-transport.ts:7` ("the SECOND allowlisted fetch site"), on its own line.
   - `apps/sentinel/test/pool-rpc-1a.test.ts:4-5`: CA-6 re-pointed to the tests of the served path.
   - `apps/sentinel/src/keyless-transport.ts:14` and l.19-20, in the past tense, line for line so that l.28, a killer's target,
     does not move. With `rpc.ts`, this file changes `sentinel_sha` (M-11: outside `hashedFields`, `line_hash` unchanged).
   - `deploy/monark-sentinel.service`, comment lines only: l.6, l.23-24 (8 public endpoints and a ninth operator become 7 and an
     8th), l.30-31 (the cycle id or the origin absent or empty gives `unconfigured`), l.34-35 (the drift note removed).
3. **The verbatim binding of `endpoints` moved, never deleted** (C-G2D-1, F-g, F-k; T1). It leaves `publishedEndpoints`, dead code
   (`apps/sentinel/test/sentinel-retry.test.ts:217-220`), for the served artefact: the last line of `timeline.jsonl` written by the
   real `run.ts` in a subprocess.
   - `deepEqual(written.endpoints, [...PUBLIC_ENDPOINTS])` in the four degraded runs:
     `apps/sentinel/test/sentinel-chainstack-guard.test.ts:279`, `:296`, `:315`, and `apps/sentinel/test/sentinel-retry.test.ts:256`.
   - The `ok` run: `deepEqual(written.endpoints, [...PUBLIC_ENDPOINTS, ORIGIN])` in place of the length
     (`apps/sentinel/test/sentinel-chainstack-guard.test.ts:253`), with `ORIGIN` (l.33) a factitious, non-canonical host under
     `chainstack.com`, so a `run.ts` that publishes a hard-coded origin reddens. The `providerOf` assertion (l.254) stays.
   - The `publishedEndpoints` and `poolEndpoints` assertions (`apps/sentinel/test/sentinel-retry.test.ts:217-222`) leave only in
     the commit that puts the new binding in place.
   - Why before the redeployment: the site host already serves the code of -1d, guarded and without cycle keys
     (`docs/ETAT.md:1408-1413`), so the residual FM-3.2/3.3 of A.6 bears on the served path today. The reserve "Non bloquant pour
     la fusion (b)" (`docs/G2-lot-narabi-ops-1d-delta.md:216`) rested on a host that served the old `run.ts`.
   - The composition test (F-j, l.266-269) reads the served pool `[...PUBLIC_ENDPOINTS, CHAINSTACK_LABEL]`
     (`apps/sentinel/src/run.ts:346`), with 7 endpoints and 6 providers in its messages.
4. **The empty-string tests** (C-G2D-2, F-l; T1): two siblings of `sentinel_chainstack_origin_absent_is_unconfigured`,
   `sentinel_chainstack_origin_empty_is_unconfigured` and `sentinel_chainstack_cycle_empty_is_unconfigured`, through one helper
   placed after `apps/sentinel/test/sentinel-chainstack-guard.test.ts:318`. The key is `""`, the ledger parent exists. Expected:
   `unconfigured`, `chainstack:false`, exit 0, the 7 endpoints verbatim, and an empty ledger directory (no cycle folder, line or
   lock). `readdirSync` joins the import of l.12.
5. **`keylessCall` injected** (F-i; T1): `call: keylessCall` at `apps/sentinel/test/sentinel-retry.test.ts:229`, and the message
   "raw url in defaultCall" (l.235) names `keylessCall`. The test then binds the served keyless error path
   (`apps/sentinel/src/keyless-transport.ts:28`).
6. **The Linux SIGTERM trace and V6** (decision 136): section "Verification".
7. **The guard of A.8-1**, replayed at C: the prereg list and the head of the D4 amendments of ADR-U4b; a calibration prereg that
   re-froze `rpc.ts` meanwhile would stop the change.

## Killers (listed for `--test-only`)

The ten of T1, on the line above each judged test; their targets hold at the base and at C (`apps/sentinel/src/rpc.ts:36` is above the
deletions, `keyless-transport.ts` keeps its l.28):

```
apps/sentinel/src/keyless-transport.ts:28 CONST "${redactEndpoint(url)}" -> "${url}"
apps/sentinel/src/run.ts:349 CONST ": [...PUBLIC_ENDPOINTS];" -> ": [...PUBLIC_ENDPOINTS.slice(0, 1), ...PUBLIC_ENDPOINTS.slice(0, -1)];"
apps/sentinel/src/rpc.ts:36 CONST ".slice(-2)" -> ".slice(-1)"
apps/sentinel/src/run.ts:349 CONST "leg.origin!" -> "\"https://hardcoded.chainstack.com\""
apps/sentinel/src/run.ts:349 CONST ": [...PUBLIC_ENDPOINTS];" -> ": [...PUBLIC_ENDPOINTS].reverse();"
apps/sentinel/src/run.ts:349 CONST ": [...PUBLIC_ENDPOINTS];" -> ": [...PUBLIC_ENDPOINTS.slice(1), ...PUBLIC_ENDPOINTS.slice(0, 1)];"
apps/sentinel/src/run.ts:349 CONST ": [...PUBLIC_ENDPOINTS];" -> ": [...PUBLIC_ENDPOINTS.slice(0, 1), ...PUBLIC_ENDPOINTS.slice(0, -1)];"
apps/sentinel/src/run.ts:285 CONST "origin.length === 0" -> "false"
apps/sentinel/src/run.ts:285 CONST "cycleId.length === 0" -> "false"
scripts/census/u4-redraw.mjs:23 CONST "ukemi/rpc2.ts" -> "rpc.ts"
```

In order: `sentinel_never_prints_endpoint_url`, `sentinel_chainstack_url_alone_degrades_to_keyless`,
`sentinel_quorum_accepts_chainstack_as_distinct_operator`, the `ok` run, the `ledger_error`, floor and absent-origin runs, the two
empty-string tests, then `u4_scripts_clean_and_import_sources_closed` (Q-1). T2's killer, above
`sentinel_src_clean_and_allowlist_load_bearing` (a paid key read back into `rpc.ts`, which the test refuses once the entry is gone):

```
apps/sentinel/src/rpc.ts:17 CONST "const TOTAL_SUPPLY_SELECTOR" -> "void process.env.CHAINSTACK_ETH_URL; const TOTAL_SUPPLY_SELECTOR"
```

The four killers already there (`apps/sentinel/test/sentinel-chainstack-guard.test.ts:335`, `:409`, `:414`, `:419`) aim at
`run.ts` l.341-342, which do not move; no killer of the repository aims at `rpc.ts` or `keyless-transport.ts`.

## Mutants of the G2-delta

The five of `docs/G2-lot-narabi-ops-1d-delta.md:193-197`, on `apps/sentinel/src/run.ts`:

| Mutant | Line | Change | At the base | With this change |
|---|---|---|---|---|
| G2D-4 | 285 | `origin.length === 0` -> `false` | survives | killed by the empty-origin test |
| G2D-5 | 285 | `cycleId.length === 0` -> `false` | survives | killed by the empty-cycle test |
| G2D-6a | 349 | the degraded list shifted by one | survives | killed by seven tests: the five degraded runs of the guard file, the URL-alone run and the excluded-hosts test |
| G2D-6b | 349 | the opened list shifted by one | survives | killed by the `ok` run |
| G2D-7 | 349 | the posed origin replaced by the canonical host | survives | killed by the `ok` run |

Measured on the plan's prototype by hand; this change replays them with `scripts/mutants/run.mjs --table` (F-p).

## After the merge, by the maintainer (Q-3)

Not in this change; a documents commit on the trunk after the merge:

- the dated D4 amendment of ADR-U4b: BEFORE `0e232519…`, AFTER the sha256 of `rpc.ts` at C (section "Verification"); O-1 is
  judged there;
- the dated retraction of A.3 (`docs/adr/ADR-NARABI-OPS-1.md:217`) and A.6 (`docs/adr/ADR-NARABI-OPS-1.md:243`);
- the re-pointing of `docs/RUNBOOK-sentinel.md` l.187-313 (F-8), after #243;
- the JOURNAL entry with the named merge sha (P-1, `docs/RUNBOOK-sentinel.md:335`);
- the stale ETAT line (`docs/ETAT.md:1835-1838`).

Then the validator's re-checkpoint-2, the G7, and the redeployment (6-bis, P-1 to P-4): outside this change.

## Windows

The maintainer replays the full oracle at the merge. The SIGTERM tests are skipped there (`process.kill` is a hard kill), hence
the Linux trace; the other subprocess runs and `every_killer_line_is_readable` run there.

## Verification

Measured on this change, Node 24.21.0, Linux, every run under `env -u` of the key-like names (the plan's prototype at `20fffe9f`,
the same bytes, gave the same results). Commits: T1 `659d869b`, T2 `f8bdb433`, C `57d0ee5d`; the commit after C changes `docs/`
only.

- **At T1**: the four changed test files and `test/killer-lines.test.ts`, 40 of 40 green; `tsc --noEmit` 0.
- **At T (T1 and T2 on the base code)**: 38 of 40. Two tests red by assertion (`ERR_ASSERTION`),
  `sentinel_src_clean_and_allowlist_load_bearing` and `fetch_only_inside_client`, on the dead code of `rpc.ts` that the allowlist
  no longer covers: l.50 [key-bare], l.54 [key] and [key-bare], l.125 [net]. Every other test green, `every_killer_line_is_readable`
  among them.
- **At C**: all of `apps/sentinel/test/`, the guard test, `killer-lines`, `probe-narabi-state`, `bell-key-isolation`, `narabi-live`
  and `probe-narabi`: 405 tests, 402 green, 0 red, 3 win32 skips. `run.ts`, `timeline.ts` and `flow.ts` keep their base sha256
  (`b3b10703…`, `ac357e7d…`, `976bcb69…`).
- **The sha256 of `rpc.ts` at C** (the AFTER value of the D4 amendment):
  `0a5a8c3b8210d2a5b5e1e370b0f2df8c7c700eff38f18f10526ff53d4481d953` (239 lines to 195; 0 hit of NET, KEY or KEY_BARE).
- **Red-proof, test-only**: `node scripts/red-proof.mjs --base c5030fd9 --gel 659d869b --test-only`: OK, 10 judged, 10 pinned,
  each listed killer killed by assertion, 29 unchanged.
- **Red-proof, F2P**: `node scripts/red-proof.mjs --base 659d869b --gel 57d0ee5d --draw 1 --seed 20261008`: OK,
  `sentinel_src_clean_and_allowlist_load_bearing` F2P, its killer (`apps/sentinel/src/rpc.ts:17`) drawn and killed; 6 unchanged.
- **Killers**: `node scripts/mutants/run.mjs --killers` on the changed test files at C: 15 of 15 killed by assertion (the eleven of
  this change and the four already there), none survived, none inconclusive, no anchor lost. The anchor check of the killer lines
  of the changed files: 15 anchored, 0 drifted, 0 lost.
- **The G2-delta table** (section "Mutants of the G2-delta"), `node scripts/mutants/run.mjs --table <the five rows> --file
  apps/sentinel/src/run.ts` at C: 5 of 5 killed by assertion. G2D-4 by the empty-origin test, G2D-5 by the empty-cycle test, G2D-6a
  by seven tests: the five degraded runs of the guard file, the URL-alone run and the excluded-hosts test; G2D-6b and G2D-7 by the `ok` run. At the trunk they survive (the plan's measure at `20fffe9f`,
  where `run.ts` and the two subprocess test files are the same bytes).
- **The Linux SIGTERM trace and V6** (decision 136), at C, native (the docker client is installed, no daemon answers):
  `docs/traces/narabi-ops-1-fold-11-1/`. Run 1, the guard test file: 17 of 17 green, the four SIGTERM tests `ok 14` to `ok 17`.
  Run 2, V6, `apps/sentinel/src/run.ts:342` emptied: 13 of 17, the four SIGTERM tests red by assertion; `run.ts` restored to
  `b3b10703…`. Each extract carries the header of `docs/CONSIGNE-STANDARD-G1.md:52`.
- **The guard of A.8-1, replayed at C** against the trunk `c5030fd9`: the same prereg list, the last D4 amendment of ADR-U4b is
  still the one of 2026-10-05, no code pins the sha of `rpc.ts`. It does not fire.
- **The full suite**: `npm run test:main` at C, under the host lock: 2 946 tests, 2 924 pass, 0 fail, 22 skipped, exit 0, 286 s.
  The base has 2 944 by the per-file counts of the changed files: two tests added (the empty-string pair), none removed.
- **Gates at C**: `tsc --noEmit` 0; eslint on the six changed code and test files 0; `gate:vocab`, `lang:gate`, `lint:ratchet`
  (69/69), `export:check` and winlint (8 files) pass; `git diff --check` is clean.

## Size

R-25 in CI form (the pathspec of `.github/workflows/ci.yml:100`, from the base): at C, 7 files, 88 insertions and 104 deletions,
**192** (the plan's 188, plus the two texts of the Q-1 rule found during the change); with the two trace extracts (70 lines),
**262**. This note and the trace index (`docs/**/*.md`) do not count. Bound 547.

## Fold of the review

The review by a fresh instance (recherches `0b12c225`, `coordination/pieces/2026-10-07-g2-recherches/G2-252-narabi-fold-11-1.json`)
returned three minor findings and six notes, no major one. This round touches only comments, two test messages and this note: each
changed line is rewritten in place and this section is added at the end, so no line moves. No code line changes
(`apps/sentinel/src/rpc.ts` keeps its sha256 `0a5a8c3b…`), no test is added or removed, no killer line or killer target moves. The
changes:

- `apps/sentinel/test/pool-rpc-1a.test.ts:144` gave the address `apps/sentinel/src/rpc.ts:86`, which the deletion moved off the
  matcher (now `apps/sentinel/src/rpc.ts:57`); the comment names the function instead, `rpc.ts isResultLimit`, so the address
  cannot drift (m-1).
- l.35 of this note: the test-only command names the base of the change, `c5030fd9` (m-2).
- l.172 and l.220-221 of this note: G2D-6a is killed by seven tests, in the same words in both places, as measured at C and by the
  review at `04d10c94` (m-3).
- `apps/sentinel/test/sentinel-retry.test.ts:218`: the comment of `sentinel_never_prints_endpoint_url` points to l.251 and l.253,
  where its stdout and written-line checks now live; the test keeps its name (n-4).
- `test/rpc-guard-fetch-only-inside-client.test.ts` l.19, l.40, l.53, l.92, l.181, l.186 (a test message) and l.242: the bare-key
  scan covers all of `apps/sentinel/src` since -1d widened the sentinel root, so these texts name the sentinel scope (n-7).
- The same file, l.211: the closed-list message reads "(an import outside the closed list is forbidden)", as l.110 and l.206 say;
  no test asserts on that message (n-8).
- The pull request body says that the touched test files and the killer-line guard run 38 of 40 (n-6).
- Left for the maintainer: `apps/bell/src/quorum.ts:13` says that line 84 of the sentinel's pool module (`apps/sentinel/src/rpc.ts`,
  imported at `apps/bell/src/quorum.ts:15`) appends the url to the HTTP error; after the deletion no line of that module builds an
  HTTP error, and the served keyless transport appends the redacted host (`apps/sentinel/src/keyless-transport.ts:28`).
  `apps/bell/` is outside the files opened for this change (n-5).

Red-proof reads this round by its own rule: a changed line inside a test body judges that test, comment lines included. The F2P
form of the section "Verification" (`--base 659d869b --draw 1 --seed 20261008`), with the gel at this round's head, judges four
tests and prints REFUSED: `sentinel_src_clean_and_allowlist_load_bearing` is F2P and its killer, drawn, is killed, and three tests
are refused. The F2P proof of the code is the one at C and at `04d10c94`.

The three refused tests are those whose bodies hold a line of this round: `apps/sentinel/test/pool-rpc-1a.test.ts:144`,
`apps/sentinel/test/sentinel-retry.test.ts:218` and `test/rpc-guard-fetch-only-inside-client.test.ts:211`. They pass at T1 and at
the head; two are refused as self-confirming, the pool test for want of a killer line. Their assertions and the code they run are
unchanged.
