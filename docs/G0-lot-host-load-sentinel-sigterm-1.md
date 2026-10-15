# HOST-LOAD-SENTINEL-SIGTERM-1: the three sentinel reds of 2026-10-06 were a borrowed node_modules, not the load

RECHERCHES, 2026-10-15. Base `1beef99e` (lot/etude-suite, read by `ls-remote` before the branch and again before the push). Item formed
after T0 (2026-10-06) from three local reds of the full suite on the RECHERCHES host, carried since as HOST-LOAD-SENTINEL-SIGTERM-1.
Branch `recherches/host-load-sentinel-sigterm-1`. Zone: `coordination/ZONES.md`, row HOST-LOAD-SENTINEL-SIGTERM-1 (the two sentinel
test files, this note, the two count records by `write`; no sentinel source, nothing under `packages/rpc-guard`).

Author: RECHERCHES. The build instance was launched as `claude-opus-5-5` at effort `high`; the host served it as `claude-fable-5-1` (its
runtime banner), so the model that wrote this change is `claude-fable-5-1` at effort `high`. Clock read at 01:59 UTC at the lock.

## The item

On 2026-10-06, `npm run test:main` on the RECHERCHES host (a clean extract of `ec0e023d`, the base of the day) failed three tests of
`apps/sentinel/test/` while the same files passed alone: two of the three `sentinel_sigterm_*` tests of
`sentinel-chainstack-guard.test.ts` and `ukemi_guard_record_skipped_the_platter_flush_nonvacuous` of `ukemi-guard-record.test.ts`. The
host ran several suites and campaigns at once, so the reds were filed as a load effect, to be looked at by the next change under
`apps/sentinel/`. No log of that day was kept.

## Measures before the design (the trunk code at `1beef99e`, this host, Node 24.21.0, every run offline with 0 refused attempts)

Each run is one test file alone with the flags of `test:main` (`package.json` l.17) and a TAP reporter; the tables name every tap's
sha256.

- Alone, 10 runs per file: `sentinel-chainstack-guard` 10/10 green (17 tests, 3.7-3.8 s), `ukemi-guard-record` 10/10 green (31 tests,
  12.3-13.4 s) (`runs/plain/results.tsv`, sha256 `67200a52`).
- Under load, four busy loops (`node -e 'for(;;){}'`, one per core) for the whole series and two concurrent copies of each file per run,
  10 runs per file: 40/40 green, 0 fail; the durations double (8.0 s and 23.6 s mean) and nothing else changes
  (`runs/load/results.tsv`, `e26c5710`). The earlier change on these tests had measured 80/80 under 8 loops
  (`docs/G7-lot-sentinel-sigterm-startup-window-1.md` l.43).
- Under a borrowed mount, 3 runs per file: a second worktree at `1beef99e` whose `node_modules` is one symlink to another tree's
  `node_modules`, so that `node_modules/@monark/rpc-guard` (a relative link, `../../packages/rpc-guard`) resolves into the OTHER
  tree's `packages/` while the tests import `packages/rpc-guard/...` of their own tree by file path. 3/3 red on each file, and the
  reds are exactly the three tests of the item: `not ok 15` and `not ok 16` of the guard file (the two window tests, 20.2 s each,
  `the preload reached the window point (acquired) and sent SIGTERM. stdout="" stderr=""`), `not ok 31` of the ukemi file
  (`the recorder's ledger appends went through the counting no-op flush`) (`runs/split/results.tsv` `f14f8b52`; first taps
  `a1a1fde5`, `690d993c`).

## The gap

Node keys a module by the real path of the file it resolves. `run.ts` loads the guard by its package specifier
(`apps/sentinel/src/run.ts` l.295 `openGuardedClient`, then `packages/rpc-guard/src/guarded.ts` l.46 `acquireLock`, then
`packages/rpc-guard/src/lock.ts` l.20 `DURABLE_FS.openSync(lockPath, "wx")`), that is through `node_modules/@monark/rpc-guard`.
The two proofs that went red reach the same seam by a file path of the test's tree:

- `sentinel-chainstack-guard.test.ts` l.403 (at the base): the SIGTERM window preload imports `DURABLE_FS` from
  `packages/rpc-guard/src/ledger.ts` under the test's `REPO` and wraps `openSync` / `closeSync` to send SIGTERM to its own process at
  the lock's exclusive open or close. With a borrowed `node_modules` that is another module instance than the one `run.ts` uses: no
  open is seen, no mark, no SIGTERM; the child blocks on its stubbed `fetch` to the keyless 20 s deadline and ends with nothing on
  stdout or stderr, and the assertion on the mark reds after ~20 s. A direct run of `run.ts` with that preload shows it: in the own
  tree, the mark, exit 1 in 0.30 s and one `unlocked` line; under the borrowed mount, no output, exit 0 after 20.3 s, and the
  `chainstack.lock` left in place (the `finally` of `main` is never reached once the stubbed `fetch` never settles and the loop
  drains: a property of the hang stub, not of the served `fetch`, which honours the abort).
- `packages/rpc-guard/test/no-fsync.ts` l.10 imports `DURABLE_FS` from `../src/ledger.ts` and replaces `fsyncSync` by a counter; the
  recorder reached through `@monark/rpc-guard` (`ukemi-guard-record.test.ts` l.25) uses the other instance, so its appends do the real
  fsync (28-34 s for the file instead of 12-13 s) and the counter read by the last test stays 0.

Why these three and not the other two subprocess SIGTERM tests of the file (`sentinel_run_releases_chainstack_lock_on_sigterm`,
`sentinel_sigterm_without_leg_exits_1_and_creates_no_ledger`): the four share the spawn path and the same 50 s safety bound, so a load
effect would hit them alike; the reds select exactly the two that depend on the identity of `ledger.ts`, plus the one other
identity-dependent test of the sentinel suite. A review of 2026-10-04 had met the same three reds at three heads with a `node_modules`
linked en bloc, and 46/46 once `@monark/*` pointed into the worktree. Not a timing assumption, not a race, not a defect of the
sentinel: no timeout is widened and no source changes.

## Decision applied (the two test files at cc7b5653; one test added at the head of each, every other line the base's moved down)

- `sentinel-chainstack-guard.test.ts` l.70-74 `sentinel_guard_resolves_inside_this_tree` and `ukemi-guard-record.test.ts` l.42-46
  `ukemi_guard_record_guard_resolves_inside_this_tree`: the real path of `import.meta.resolve("@monark/rpc-guard")` equals the real
  path of this tree's `packages/rpc-guard/src/index.ts`; the failure names both paths and the consequence (`the guard's ledger module
  would be another tree's: the SIGTERM window hooks and the fsync counter wrap the wrong instance`). Under a borrowed mount each file
  now reds at its first test, in milliseconds, with the cause named, before the two 20 s reds and the 0-counter red that follow;
  on a sane mount the test passes and nothing else of the files changes (`realpathSync` is added to one import line in each).
- Why not resolve the preload and the counter through the package instead: the three tests would then pass while wrapping, and
  testing, another tree's copy of `rpc-guard`: a green that proves nothing about the tree under test. The precondition keeps the
  proof honest and leaves `packages/rpc-guard/test/no-fsync.ts` untouched (out of zone).
- No killer line is added: the property held is the mount of the tree, not a line of a source that a mutant could change; the ten
  killers of the guard file pin `apps/sentinel/src/run.ts` lines and stay at their anchors (the anchors run below).

## Proofs (all offline, 0 refused; the suite under the shared host lock)

- Green, each file alone in the own tree: guard 18/18 (`runs/p2-green/sentinel-chainstack-guard.tap`, `02f86dd0`), ukemi 32/32
  (`71fe4d74`). Red, each file alone under the borrowed mount with the new tests: guard `not ok 1` by ERR_ASSERTION with the message
  above, then the two window reds (15 pass, 3 fail; `runs/p2-red/sentinel-chainstack-guard.tap`, `c126b418`); ukemi `not ok 1` then
  the counter red (30 pass, 2 fail; `65862ecd`).
- `npm run test:main` (hostlock-run, offline: 0 refused): 3138 tests, 3115 pass, 0 fail, 23 skipped, exit 0, 283 s under the lock;
  the two new tests pass in the suite (`runs/suite/suite1.stdout`, sha256 `e9ea8b04`).
- `node scripts/test-count-floor.mjs write` (`runs/write.out`, `af5b470b`): `test/test-counts.json` 17 -> 18 for
  `apps/sentinel/test/sentinel-chainstack-guard.test.ts` and 31 -> 32 for `apps/sentinel/test/ukemi-guard-record.test.ts`, the two
  names added to `test/test-names.json`. The count check, `node scripts/test-count-check.mjs --base 1beef99e`, exit 0, its whole line
  (`runs/check.out`, `ad90ca55`): `test counts: 307 files, 3138 tests, equal to test/test-counts.json and test/test-names.json; 0
  drop(s) from the base 1beef99ea86f, each name gone with its line in test/test-count-removals.json`.
- Anchors, whole tree, `verifie-ancres.mjs --ref 1beef99e` after the change: `tueurs 2097 ; ANCRE 2097 ; DERIVE 0 ; PERDU 0`
  (`runs/anchors1.out`, `02cb8cdb`); `test/killer-lines.test.ts` green (`runs/killer-lines.tap`, `1ecccffa`).
- Gates (`runs/gates.out`, `0d8f9359`): `tsc --noEmit` 0; eslint on the two test files 0; `lint:ratchet` 69/69; `gate:vocab` 0;
  `lang:gate` 0; `export:check` 0; `git diff --check 1beef99e HEAD` 0; no non-ASCII character in an added test line; winlint
  `--base 1beef99e`: 4 file(s), no Windows hazard (`runs/winlint.out`, `48ee4e28`).
- r1scan (`bin/r1scan.mjs --repo <worktree> --base 1beef99e --head HEAD`) on the first commit: `r1scan: 0 match(es)`
  (`runs/r1scan1.out`, `bea62e56`); run again on the branch's full head before the push (the report names its result).
- cites.mjs on this note before its commit (`runs/cites-note.out`): the report names its result.

## Not verified

- The logs of the 2026-10-06 suite do not exist, so the cause is established on this host's reproduction and the 2026-10-04 review,
  not on the original run; which two of the three `sentinel_sigterm_*` tests that run saw red is not recorded (the reproduction and
  the mechanism select the two window tests). The statement of that day that the three passed alone fits the mount only if the
  single-file runs were made in another tree.
- A load-only red was not reproduced here (0 of 40 under 1.5x oversubscription plus two copies); the item's load hypothesis is not
  confirmed by any run.
- Windows: the suite is not replayed on win32 here (MONARK replays at merge). The two new tests write no file and spawn nothing;
  `realpathSync` on both sides folds a junction the same way.

## Changelog

- `apps/sentinel/test/sentinel-chainstack-guard.test.ts`: one import name (l.12), one test at the head (l.64-74).
- `apps/sentinel/test/ukemi-guard-record.test.ts`: one import name (l.16), one test at the head (l.37-46).
- `test/test-counts.json`, `test/test-names.json`: by `write` (two counts +1, two names).
- This note.
