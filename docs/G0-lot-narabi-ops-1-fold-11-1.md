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
- **Base**: trunk `lot/etude-suite` = `8a1aabef` (explicit refspec, `ls-remote` at 10:48 UTC), branch `recherches/narabi-fold-11-1`.
  The plan read `20fffe9f`; the two merges in between (#233, #236) change `apps/harness/` and two notes only. The thirteen files
  this change and its guard rest on (the seven of the zone, `run.ts`, `timeline.ts`, `flow.ts`, `docs/adr/ADR-NARABI-OPS-1.md`,
  `docs/adr/ADR-U4b-calibration-episode-frais.md`, `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md`) are the same bytes at both,
  so the plan's addresses hold. Lines below are at the base, except those marked "at C".
- **Zone** (Q-2): `apps/sentinel/src/rpc.ts`, `apps/sentinel/src/keyless-transport.ts`, `apps/sentinel/test/sentinel-retry.test.ts`,
  `apps/sentinel/test/sentinel-chainstack-guard.test.ts`, `apps/sentinel/test/pool-rpc-1a.test.ts`,
  `test/rpc-guard-fetch-only-inside-client.test.ts`, `deploy/monark-sentinel.service` (comment lines only), this note and the
  Linux trace under `docs/traces/narabi-ops-1-fold-11-1/`. Unchanged: `apps/sentinel/src/run.ts`, `timeline.ts`, `flow.ts`, and
  `docs/RUNBOOK-sentinel.md` (#243 touches it; the maintainer merges #243 first).
- **Rules held**: no real RPC endpoint or provider is called; no key is read or written (every run is under `env -u` of the
  key-like names, and the environment carries no paid-key name); no host address is written; no data series byte is read. Node 24.21.0.

red-proof: test-only

The line above declares the range from the base to T1 (the binding tests) test-only, for
`node scripts/red-proof.mjs --base 8a1aabef --gel <T1> --test-only`. T2 and C change production code: they are proved in F2P mode
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
     l.206-207 ("residual-118 paid leg"), outside the list, true no more once `rpc.ts` carries no key and no `fetch(`.
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
| G2D-6a | 349 | the degraded list shifted by one | survives | killed by the six degraded runs |
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

Planned, and measured on the plan's never-committed prototype (`20fffe9f`, the same bytes):

- At T (T1 and T2 on the base code): two tests red by assertion, `sentinel_src_clean_and_allowlist_load_bearing` and
  `fetch_only_inside_client`, on the dead code of `rpc.ts` that the allowlist no longer covers: l.50 [key-bare], l.54 [key] and
  [key-bare], l.125 [net]. Every other test of the touched files green.
- `node scripts/red-proof.mjs --base 8a1aabef --gel <T1> --test-only`: 10 judged, 10 pinned, 10 killers killed.
- `node scripts/red-proof.mjs --base <T1> --gel <head> --draw 1 --seed 20261008`: `sentinel_src_clean_and_allowlist_load_bearing`
  F2P, its killer killed.
- `node scripts/mutants/run.mjs --killers` on the changed test files; the G2-delta table above.
- The Linux SIGTERM trace: `apps/sentinel/test/sentinel-chainstack-guard.test.ts` under TAP, all green, the four SIGTERM tests
  among them; then V6, the line `process.on("SIGTERM", onSigterm);` emptied (the existing killer `run.ts:342 SDL`), the four
  SIGTERM tests red, `run.ts` restored and its sha256 checked. Native on this Linux host (no docker daemon), with the header of
  `docs/CONSIGNE-STANDARD-G1.md:52`.
- The anchors of the killer lines, `every_killer_line_is_readable`, the full `npm run test:main`, `tsc --noEmit`, eslint on the
  touched code, `gate:vocab`, `lang:gate`, `lint:ratchet`, `export:check`, winlint and `git diff --check`.

## Size

R-25 in CI form (the pathspec of `.github/workflows/ci.yml:100`): the prototype measured 7 files, 86 insertions and 102 deletions,
**188**, the two texts of Q-1 included; the trace adds its extract lines. This note (`docs/**/*.md`) does not count. Bound 547.
