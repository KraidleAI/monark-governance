# G0 — KATA-KILLERS-ASSERT-1: the eleven zone KATA killer lines of the sweep, each named test made to judge its mutation by an assertion

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), 2026-10-08, from 19:36 UTC (the lot lock; `date -u` read at 19:54, 20:21
  and before the commit). A short G0, before any test or code: nothing below is built. The fixes were measured on throwaway copies,
  never committed (section 2).
- **Build**: RECHERCHES (`claude-opus-5-5`, effort high), resumed 2026-10-14 on the branch head `00e5f5aa` (the merge of this note with
  W2-GUARD-MISSES-TAIL-1's head `45f8195e`), after a first build run that stopped on 2026-10-09 after that merge. This note is amended in
  place for MONARK's decisions `e6ebb72` and `f3153f3` (recherches, `coordination/messages/2026-10-09-MONARK-vers-RECHERCHES-levee-pause.md`
  and `coordination/messages/2026-10-13-MONARK-vers-RECHERCHES-fusions-261-237.md`): the campaign on the trunk's tool and its verdict
  rule (section 1), the narrowed `refuse` (section 3), K19 in a later change (section 8). Section 9 records what was built.
- **Name**: KATA-KILLERS-ASSERT-1, proposed here: MONARK's message names no lot.
- **Demand**: MONARK `169cbc3` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-colonne-kata.md`, read in full).
  It copies byte for byte the eleven zone KATA entries of PAROXYSME's killer sweep (paroxysme `596d35f`,
  `coordination/pieces/2026-10-08-balayage-tueurs/SURVIVANTS.md`, sha256 `5dfea14f…`; that repository is not readable from here, the
  copy is the source). For each line: a killer that its named test kills by an assertion, or a test that really judges the targeted
  mutation; a line in a pile resolves to its own test; red-proof judges; the campaign runs on PAROXYSME's corrected mutation tool if its
  pull request is merged by then.
- **Build base**: `f7108f66`, the merge of the trunk head that MONARK announced, `5ebd9267` (#261, W2-GUARD-MISSES-TAIL-1, merged at
  `1992b1ed`, then #237 at `5ebd9267`; MONARK `f3153f3`), into the branch head `00e5f5aa`; its tree is `5ebd9267`'s plus this note.
  Every build measure (section 9) runs there. The trunk then merged #238 at `971eda88` (`apps/harness/src/tools/gate.ts`, a test added
  to `apps/harness/test/gate-kata-served.test.ts`, `test/spec-1-1-0-release.test.ts`, `test/test-counts.json`), so the trunk was
  merged into the branch at the review's fold and the proofs replayed on that merge (section 9, « G2 fold »).
- **G0 base**: trunk `lot/etude-suite` = `52ddf000` (`ls-remote` at 20:21 UTC, explicit refspec), documents only on top of `92d01d67`, the
  merge of #256, where every measure below ran (`git diff --quiet 92d01d67 52ddf000 -- . ':(exclude,glob)docs/**'` holds). The sweep
  ran at `b44c3890`; `git diff --quiet b44c3890 92d01d67 -- apps packages test/recompute-report.test.ts scripts/mutants
  scripts/red-proof.mjs` holds, so no file the eleven lines, their tests or the two tools read has changed since. Branch
  `recherches/kata-killers-assert-1`, this note alone at the G0.
- **Zone**: KATA, the files declared for this change in recherches `coordination/ZONES.md` (MONARK's zone rule, `6005b0f`). Planned: `apps/harness/test/gate-cell.test.ts`, `apps/harness/test/policy-guard.test.ts`,
  `apps/harness/test/policy-projection.test.ts`, `apps/harness/test/policy-wave2.test.ts`, `test/recompute-report.test.ts` and this
  note. No production file, no test support file, no killer line, no test added, removed or renamed.
- **Rules held**: Node 24.21.0; every run under `offline.mjs --no-egress`, 0 refused attempts each; the mutation runs and the type and
  lint checks take the shared host lock of this session (root `<scratchpad>/F:/tmp`); no data series is read; nothing of R1.

red-proof: test-only

The line above declares the lot test-only, for `node scripts/red-proof.mjs --base <the base of the build> --gel <its head> --test-only`.
The killers it judges, one per named test, as they read at the base and at W2-GUARD-MISSES-TAIL-1's head (section 4: none moves); the
twelfth, last, is the killer of the false kill that the narrowed `refuse` uncovers and this change fixes (section 3):

```
apps/harness/src/policy-marginal.ts:44 CONST "qhat: split.qhat," -> "qhat: split.qhat * 2,"
apps/harness/src/policy-guard.ts:74 CONST "r.misses ?? -1" -> "r.k_obs ?? -1"
apps/harness/src/policy-guard.ts:84 CONST "calib === \"region\"" -> "calib === \"silence\""
apps/harness/src/policy-retire.ts:53 CONST "adr:decisions\\/[0-9A-Za-z]" -> "adr:[\\w./-]"
apps/harness/src/policy-projection.ts:83 CONST "\"n/a\"" -> "\"n/b\""
apps/harness/src/policy-guard.ts:83 CONST "\"tail sequence constant (fails closed)\"" -> "\"auxiliary sequence constant (fails closed)\""
apps/harness/src/policy-wave2.ts:36 ROR "<= r.n - rank" -> "< r.n - rank"
apps/harness/src/policy-guard.ts:85 CONST "[\"bridge\", \"test\", \"fwd\"]" -> "[\"test\", \"bridge\", \"fwd\"]"
apps/harness/src/policy-guard.ts:56 CONST "spendDelta(KATA_BASE_DELTA, at)" -> "spendDelta(KATA_BASE_DELTA, 1)"
apps/harness/src/policy-guard.ts:85 CONST "[\"bridge\", \"test\", \"fwd\"]" -> "[\"bridge\", \"fwd\", \"test\"]"
apps/harness/src/policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "v === true"
apps/harness/src/policy-guard.ts:67 SDL "is([t, r.bridge ?? t, r.fwd ?? t, r.retire ?? t].every(" -> ""
```

## 1. The eleven lines at the base

**Method.** The trunk's tool, `scripts/mutants/run.mjs --killers --only <ids>`, with `--base 357ef25f`, the root commit: every test file
then counts as changed and the tool numbers the killer lines as the sweep did (files sorted, then line, `scripts/mutants/run.mjs` l.9):
K116 to K276 come out with the sweep's numbers; the recompute line is K1360 at `92d01d67` (K1348 at `b44c3890`: twelve killer lines were
added before it since). The trunk's `--killers` mode can target single lines this way, so no mutation was fired by hand. The tool applies
each mutation alone in its own clone, runs the named test alone (`--test-name-pattern`), and when that does not kill, runs the target
files whole (the replay); it reads tue only when an entry fails by an assertion, TAP `code: 'ERR_ASSERTION'` (the classify of
`scripts/red-proof.mjs` l.107-115). Campaign A ran the nine lines on the guard, the retire grammar and the report reader, B the lines
K116 and K235; both baselines are green (93 tests in 8 files; 611 in 53).

| Line | Killer line | Named test | Mutation | At the base | Where the named test turns red | Replay |
|---|---|---|---|---|---|---|
| K116 | `apps/harness/test/gate-cell.test.ts` l.67 | `served_values_equal_the_admitted_row` (l.68) | `apps/harness/src/policy-marginal.ts` l.44, qhat doubled | survit | nowhere: its entry is ok | tue, 20 red |
| K212 | `apps/harness/test/policy-guard.test.ts` l.93 | `guard_direction_qhat_and_misses` (l.94) | `apps/harness/src/policy-guard.ts` l.74, misses read from k_obs | non conclu | `check` (l.32) from l.95 | tue, 13 red |
| K214 | `apps/harness/test/policy-guard.test.ts` l.111 | `guard_test_veto_conditional` (l.112) | `apps/harness/src/policy-guard.ts` l.84, the veto fires on silence, not region | non conclu | `check` (l.32) from l.113 | tue, 13 red |
| K223 | `apps/harness/test/policy-guard.test.ts` l.206 | `guard_adr_cause_under_decisions_only` (l.207) | `apps/harness/src/policy-retire.ts` l.53, the adr cause grammar | non conclu | `check` (l.32) from l.208 | tue, 8 red |
| K235 | `apps/harness/test/policy-projection.test.ts` l.79 | `projection_under_calib_row` (l.80) | `apps/harness/src/policy-projection.ts` l.83, "n/a" no longer null | non conclu | the closed row check (`apps/harness/src/policy-projection.ts` l.121) from l.83 | tue, 12 red |
| K264 | `apps/harness/test/policy-wave2.test.ts` l.116 | `w2_guard_refuses_region_with_empty_or_low_tail` (l.117) | `apps/harness/src/policy-guard.ts` l.83, the empty-tail reason | non conclu | `check` (l.31) from l.121 | tue, 3 red |
| K265 | `apps/harness/test/policy-wave2.test.ts` l.126 | `w2_guard_tail_m_and_support` (l.127) | `apps/harness/src/policy-wave2.ts` l.36, tail_m bound strict | non conclu | `check` (l.31) from l.128 | tue, 9 red |
| K267 | `apps/harness/test/policy-wave2.test.ts` l.141 | `w2_guard_bridge_and_fwd_vetoes` (l.142) | `apps/harness/src/policy-guard.ts` l.85, test named before bridge | non conclu | `check` (l.31) from l.146 | non conclu |
| K268 | `apps/harness/test/policy-wave2.test.ts` l.156 | `w2_guard_spend_and_causes` (l.157) | `apps/harness/src/policy-guard.ts` l.56, attempt 1 spend everywhere | non conclu | `check` (l.31) from l.158 | tue, 12 red |
| K276 | `apps/harness/test/policy-wave2.test.ts` l.243 | `w2_guard_veto_order_test_before_fwd` (l.244) | `apps/harness/src/policy-guard.ts` l.85, fwd named before test | non conclu | `check` (l.31) from l.246 | non conclu |
| K1348 | `test/recompute-report.test.ts` l.172 | `recompute_report_reader_binds_nothing_the_gate_binds` (l.173) | `apps/harness/src/policy-verifiers.ts` l.156, false refused | non conclu | `readRecomputeReport` inside the argument of `assert.deepEqual`, l.178 | non conclu |

- Every non conclu line is red with `failureType: 'testCodeFailure'` and `code: 'ERR_TEST_FAILURE'`, the checker's own refusal: "MONARK
  import guard: …" for the eight guard lines, "MONARK policy check: projection of kata:tsmom-v1@binance/BTCUSDT/4h/up-b1.runs_miss is not
  one of pass | reject | empty." for K235, "MONARK recompute report: report.cells[0].decisions_equal is off the form." for K1348. The
  frames are the sweep's, line for line. The replays of K267, K276 and K1348 kill nothing by an assertion either: no target file of
  those three mutations judges them today, so this lot closes them.
- None of the eleven lies in a pile: each sits right above its test's declaration, and the lot adds no killer line.
- **The build's tool and verdict rule** (MONARK `e6ebb72`): #259 is not merged, so the build's campaign runs on the trunk's tool,
  `scripts/mutants/run.mjs`. The rule: a named test that ran and stays green gives « survit »; a named test that was skipped gives « non
  conclu »; a kill counts only by an assertion (TAP `code: 'ERR_ASSERTION'`), never by an uncaught exception (`ERR_TEST_FAILURE`). At the
  build base the trunk carries killer lines added since the sweep before these files, so the tool's ids differ: K116 stays K116, K212 is
  K214, K214 is K216, K223 is K225, K235 is K238, K264 is K267, K265 is K268, K267 is K270, K268 is K271, K276 is K279, and K1360 (K1348
  in the sweep) is K1364 (`--base 357ef25f`, section 9).
- **How PAROXYSME's corrected tool would read them** (#259, head `9c03bb64`, read and not run; its review runs elsewhere). Its rule
  (`scripts/mutants/run.mjs` l.32-42 at `9c03bb64`) reads the named test's own entry: tue only when that entry fails by an assertion,
  survit when it is ok whatever else is red, non conclu otherwise. Each first run here holds that entry and no other, so the ten read
  non conclu and K116 survit, as on the trunk; its promotion of a lost first run does not apply (none is lost). After the fix, each named test
  fails by an assertion under its mutation (red-proof's pins, section 2), which both tools read as tue. #259 is not merged at the build: its campaign uses the trunk's tool, and the record
  says so (`tool_tree`, `tool_sha256`).

## 2. The fix for each line

**Constraints held.** No production file changes, no test is added, removed or renamed, no killer line changes. Each named test passes
and fails exactly when it did, on every outcome; only a failure that came from a thrown refusal now comes from an assertion. K116 is the
exception MONARK asks for: its test gains an independent value.

**Form (a), `assert.throws` with the exact refusal text, fits none of the eleven.** In each of the ten, the call that throws is one the
test means to pass: the guard admits the row, the projection returns a row, the reader reads (the frames of section 1). Wrapping it in
`assert.throws` would turn the test red on the unmutated code.

**Form (b), the admission judged by `assert.deepEqual`, for the ten.**

- The eight guard lines: each bare `check(row)` in the bodies of the eight named tests becomes `assert.deepEqual(verdict(row), [status,
  reason])`, with `verdict` the helper W2-GUARD-MISSES-TAIL-1 adds to both files: the status and reason of a row the guard admits, the
  guard's message otherwise. The expected pair is the one the row carries: the test's own literal for a row it builds (`w2(c, ["silence",
  why])` gives `["silence", why]`), the fixture row's fields for a row it finds (`[dirMisses.status, dirMisses.status_reason]`). Thirteen
  sites, every bare `check` of these eight tests, not only the one each mutation reaches first, so that the named test's verdict is an
  assertion whichever admission a mutation breaks: `apps/harness/test/policy-guard.test.ts` l.95, l.113, l.117, l.208 and
  `apps/harness/test/policy-wave2.test.ts` l.121, l.123, l.128, l.144, l.145, l.146, l.150, l.158, l.246.
- K235: the call of `apps/harness/test/policy-projection.test.ts` l.83 goes through a helper of that file that returns the row, or fails
  the test by `assert.fail` with the message of the closed row check (prefix "MONARK policy check: "); l.84-86 are unchanged.
- K1348: `test/recompute-report.test.ts` l.178 compares, by the `assert.deepEqual` already there, the report read, or the reader's
  message (prefix "MONARK recompute report: "), to the expected report; the function sits in the test body, as the nesting test of the
  same file holds its own `verdict` (l.213).
- The two helpers of this lot rethrow every error that is not their checker's refusal, so that a crash under a mutation stays
  inconclusive and never reads as a kill by an assertion (section 6 on W2-GUARD's `verdict`).

**Form (c), an independent expected value, for K116.** The served qhat is compared with the split quantile of the committed scores,
recomputed without `marginalRow`: `splitQuantileExact` of `@monark/hikae`, the function `marginalRow` calls
(`apps/harness/src/policy-marginal.ts` l.38), on `lookupCommittedCalibration(class, key).scores`, at the call's alpha and nMin (0.1 and 50
for USDe, 0.01 and 100 for liq s0). At the base both agree: USDe 0.00013119228083333334 (n 613), liq s0 126184298996 (n 170), each equal to
the served value and not zero, so a doubling shows. The assertion of `apps/harness/test/gate-cell.test.ts` l.71 stays (the served values
equal the admitted row); the new one is a second `assert.deepEqual` in the same loop, with two imports (`splitQuantileExact`,
`lookupCommittedCalibration`). MONARK's other form, a pinned literal, is not taken: the recomputed value keeps the test true through a
recalibration of the committed scores, whose bytes other tests already pin (`usde_band_full_bytes_are_pinned_at_1_1_0`,
`kata_served_tables_digests`, in K116's replay).

**Measured on a throwaway copy of `92d01d67`** with these changes (the patch `logs/proto.diff`; a stand-in `verdict` after the last test
of each guard file, as W2-GUARD places its own) and a copy of this note's declaration: `red-proof --test-only --base 92d01d67` reads OK,
11 judged, 11 pinned (green at the base and at the gel, its declared killer fired at the gel red by an assertion), 50 unchanged, no
refusal; `tsc --noEmit` exits 0; eslint on the five files exits 0. The assertion that turns each test red under its mutation, with the
line of the copy:

| Line | Red under its mutation, by | Message (start) |
|---|---|---|
| K116 | the new `assert.deepEqual` of the served qhat (l.74 of the copy) | actual 0.0002623845616666667, expected 0.00013119228083333334 (USDe) |
| K212 | `assert.deepEqual(verdict(dirMisses), …)`, l.95 | the guard's message "… has a qhat or k_obs that does not follow from (misses, k_star)." against the row's pair |
| K214 | `assert.deepEqual(verdict(vetoed), …)`, l.113 | "… has vetoes.test, vetoes.bridge or vetoes.fwd off the conditional TEST, bridge or FWD-2 veto." |
| K223 | `assert.deepEqual(verdict(retired("adr:decisions/0007-retire.md", …)), …)`, l.208 | "… has a retire cause outside live:<k> and adr:decisions/<file>.md …" |
| K235 | `assert.fail` of the helper, reached from l.83 | "MONARK policy check: projection of …runs_miss is not one of pass \| reject \| empty." |
| K264 | `assert.deepEqual(verdict(w2(c, ["silence", why])), ["silence", why])`, l.121 | "… not 'silence' and 'auxiliary sequence constant (fails closed)'." against `['silence', 'tail sequence constant (fails closed)']` |
| K265 | `assert.deepEqual(verdict(w2({ tail_m: 37 })), ["region", ""])`, l.128 | "… has tail_m above n - r (r 703)." |
| K267 | the third admission of l.146 | "… has status 'vetoed' and reason 'vetoed: bridge', not 'vetoed' and 'vetoed: test'." |
| K268 | `assert.deepEqual(verdict(w2()), ["region", ""])`, l.158 | "… breaks the pinned constants of the A-1 spend …" |
| K276 | `assert.deepEqual(verdict(both), ["vetoed", "vetoed: test"])`, l.246 | "… has status 'vetoed' and reason 'vetoed: test', not 'vetoed' and 'vetoed: fwd'." |
| K1348 | the `assert.deepEqual` of the cases (l.179 of the copy) | case `cells.0.decisions_equal = false reads`: the reader's message against the expected report |

Each pin is `code: 'ERR_ASSERTION'`. The same changes on a throwaway copy of W2-GUARD's head `9aba7b95`, with its own `verdict` and no
stand-in (the patch `logs/proto-w2.diff`), give `red-proof --test-only --base 9aba7b95`: OK, 11 judged, 11 pinned, 52 unchanged.

## 3. The shared helper `check`

The eight guard refusals all leave the tests through `check` (`apps/harness/test/policy-guard.test.ts` l.32,
`apps/harness/test/policy-wave2.test.ts` l.31). Changing it is not the right single fix:

1. Red-proof judges a test only by a changed line in its body (`scripts/red-proof.mjs` l.7-9, `judgedOf` l.134): a change at l.32 or l.31
   judges no test, so red-proof would judge none of the eight lines, where MONARK asks red-proof to judge. W2-GUARD's note says the same
   of its builder lines (`3b16c38d`, `docs/G0-lot-w2-guard-misses-tail-1.md` l.175-177).
2. `refuse` calls `check` (l.33 and l.32 of the two files). A `check` that asserts would hand each refusal an AssertionError wrapping the
   guard's message, so the 55 and 36 refusal call sites of the two files would match their patterns against another error, unless `refuse`
   is pointed at the guard itself: a change to what 91 refusal assertions read, beyond the eleven. W2-GUARD's new refusals match the
   whole message from `^Error: MONARK import guard: ` (its section 4), which such an AssertionError would not.
3. W2-GUARD brings `verdict` for admissions in both files (`9aba7b95`: `apps/harness/test/policy-guard.test.ts` l.261,
   `apps/harness/test/policy-wave2.test.ts` l.251); a second admission helper would duplicate it.

So `check` keeps its bytes, and the admissions of the eight named tests change.

**`refuse` narrowed** (MONARK `e6ebb72`, the answer to Q-A: before the thirteen new `verdict` sites, with the proof of the guard fold).
`refuse` (`apps/harness/test/policy-guard.test.ts` l.33, `apps/harness/test/policy-wave2.test.ts` l.32) was `assert.throws(() =>
check(r), re)`: a crash inside the guard under a mutation (a `TypeError`) fails the regex match, so `assert.throws` raised an
AssertionError and the tool read the crash as a kill. It becomes a `try` around `check`: a refusal is matched against `re` with
`assert.match(String(e), re)`, the string `assert.throws` matched; an admitted row fails by `assert.fail`; any other error is thrown again
unchanged, so it ends the test as `ERR_TEST_FAILURE`, « non conclu », never « tue ». The form with a validation function in
`assert.throws` is not taken: a function that returns false makes `assert.throws` raise an AssertionError, the flaw itself. The helper stays
on its one line, so no line of either file moves.

The refusals it accepts are the two that `guardKataRow` emits by design: the guard's own (`MONARK import guard: `,
`apps/harness/src/policy-guard.ts` l.20) and the closed row check that the guard runs as its first clause (`MONARK policy check: `,
`apps/harness/src/policy-guard.ts` l.39, `packages/contracts/src/policy-table.ts` l.26). The guard's prefix alone is too narrow, measured
(section 9): two call sites expect the closed row check's refusal, `apps/harness/test/policy-guard.test.ts` l.105 (the declared redundancy of
block A) and `apps/harness/test/policy-wave2.test.ts` l.164 (`calib_attempt` 5), and both turn red unmutated by `ERR_TEST_FAILURE` under
that form. Neither is a crash, and both keep their outcome with the two prefixes. `verdict` (l.261 and l.251) is already narrowed to the
guard's prefix on the trunk (#261).

The narrowing is measured, not assumed: the build runs the trunk tool on every killer of the two files before and after it and lists each
verdict that moves (section 9). A killer that read « tue » only because its mutation crashed the guard inside `refuse` becomes « non conclu »:
a false kill this change uncovers, whose test is fixed here to kill by an assertion.

Measured at the build (section 9), one killer moves that way: K222 (`apps/harness/test/policy-guard.test.ts` l.188,
`apps/harness/src/policy-guard.ts` l.67 SDL, test `guard_names_k_test_above_n_test`). With the clause gone, the guard computes the bound of a
test block whose k_test is above its n_test (`apps/harness/src/policy-guard.ts` l.68), and `missUpperBound` throws "kStar must be below n",
an error of the bound's precondition, not a refusal, which the old `refuse` read as a mismatch of its pattern. The fix, in place on l.191
(no line moves): the first refusal also tries a test block with n_test 0, which has no bound to compute (`uTest`, l.33, returns null), so
under the mutation that row is admitted and `refuse` fails by an assertion; the case with n_test above 0 stays. Its test is judged by
red-proof with the eleven, and its killer is declared above.

**What `check` serves.** The 36 killer lines of the two files, by the way their named test reaches `check` (the tool's ids, the same as
the sweep's; ids and lines in `logs/C.kids.txt`; a star marks the eight lines of this lot):

| Their named test reaches `check` | `apps/harness/test/policy-guard.test.ts` | `apps/harness/test/policy-wave2.test.ts` |
|---|---|---|
| by an admission in its body | K211, K212\*, K213, K214\*, K215, K216, K217, K223\*, K225, K226 | K262, K263, K264\*, K265\*, K267\*, K268\*, K271, K273, K274, K276\*, K277 |
| through `refuse` only | K219, K220, K221, K222, K224 | K266, K275 |
| not at all | K209, K210, K218 | K260, K261, K269, K270, K272 |

Campaign C ran all 36 at `92d01d67` with the same tool and base: the baseline is green (587 tests), 28 of the 36 are tue, and the other
8 are exactly the eight lines of this lot, non conclu through `check` with the first runs and replays of campaign A. So every killer
that reaches `check` only through `refuse`, every one that does not reach it, and the thirteen others with an admission in their body
kill by an assertion today. K277 is the killer W2-GUARD retires with its old test; its three new tests use `verdict` and `refuse`.

A change to `check` would re-classify only a test whose first failure under its killer is a refusal leaving through `check`. At the base
those are exactly the eight; every other killer of the two files kills by an assertion, through `refuse` or another `assert`, and a
`check` that asserts cannot turn an assertion failure into anything else, so they would stay tue. With the chosen fix no other test
changes; the bare `check` calls of the other tests stay, and a later finding on one of them takes the same form.

## 4. The order with W2-GUARD-MISSES-TAIL-1

W2-GUARD's note (`3b16c38d`, `docs/G0-lot-w2-guard-misses-tail-1.md`, read in full; the branch first seen on the remote at 20:02 UTC) and
its head at 20:21 UTC (`9aba7b95`, the tests `f8abf303` then the code):

- no line of `apps/harness/src/policy-guard.ts` or `apps/harness/src/policy-wave2.ts` moves: each clause is a second statement on l.76
  and l.36, and the comment of `wave2Admission` is rewritten on its four lines (its section 2, l.64-99); the head's hunks are those lines;
- no line of `apps/harness/test/policy-wave2.test.ts` above l.250 moves (l.43 and l.45 are rewritten in place), and
  `apps/harness/test/policy-guard.test.ts` only grows after l.258 (its section 5, l.179-200); at `9aba7b95` the eight killer lines of
  this lot in the two files are byte for byte those of the base, at the same lines;
- it adds `verdict` and three tests that use it, with no bare `check` (its section 4, l.134-178), and fixes and moves none of the eleven
  (its section 6, l.202-210).

Hence:

- **Order.** This lot follows W2-GUARD's merge, built on the trunk that carries it, or on W2-GUARD's head if MONARK wants the two pull
  requests stacked. Red-proof's test-only mode needs that base: with W2-GUARD's code inside the range, its production change refuses the
  mode.
- **Anchors.** No killer line to re-anchor: W2-GUARD moves none, and K265's `<= r.n - rank` stays once on l.36 beside clause 1, as its
  section 5 says. The build rereads the eleven killer lines at its base (the anchor checker and `every_killer_line_is_readable`) and
  replays section 1 there.
- **No duplicate.** This lot adds no test and touches neither W2-GUARD's three tests, nor its builder lines, nor the test its first test
  replaces (`w2_guard_names_a_constant_tail_before_a_rejection`, whose killer retires and is not one of the eleven). It reuses W2-GUARD's
  `verdict` in the eight named tests; if the merged form has none in a file, the lot adds the stand-in there, after the last test.
- **K264 after W2-GUARD.** The rewritten builder gives case 1 of `apps/harness/test/policy-wave2.test.ts` l.118 misses 0; under K264's
  mutation the test still turns red at l.121 (W2-GUARD's section 6), by an assertion with this fix: the dry run on `9aba7b95` pins it.

## 5. Size and test count

- **R-25** (CI form, the pathspec of `.github/workflows/ci.yml` l.100, documents out): 41 changed lines on the five files with W2-GUARD's
  `verdict` (the patch on `9aba7b95`: 24 added, 17 removed): `apps/harness/test/gate-cell.test.ts` 7,
  `apps/harness/test/policy-guard.test.ts` 8, `apps/harness/test/policy-projection.test.ts` 5, `apps/harness/test/policy-wave2.test.ts`
  18, `test/recompute-report.test.ts` 3. With the two stand-ins, 45 (the patch on `92d01d67`). Bound 547.
- **Test count** (TEST-COUNT-FLOOR-1): no test is added, removed or renamed; K116's test gains an assertion in its own body. So
  `test/test-counts.json` does not change: at the base gate-cell 8 (l.55), policy-guard 18 (l.69), policy-projection 10 (l.71),
  policy-wave2 18 (l.75), recompute-report 7 (l.249); W2-GUARD writes 19 and 19 for its two files. The build runs `npm run test:main` on
  its merged tree and the gate `g3-test-count` holds it to the record; nothing is written, and any count that moves is a finding.

## 6. The build, the risks, and what the review should check

**The build**: one commit of the five test files, on the base of section 4, then the measures:

- `node scripts/red-proof.mjs --base <base> --gel <head> --test-only`: OK, 11 judged, 11 pinned, nothing refused;
- `node scripts/mutants/run.mjs --killers` on the five changed files, `--base` the build's base: every killer line of the five files
  (61 at `92d01d67`, 63 with W2-GUARD's) tue by an assertion; none survives, none is inconclusive, no anchor is lost;
- `tsc --noEmit`, eslint on the five files, `gate:vocab`, `lang:gate`, `lint:ratchet`, `export:check`, winlint; the five files and
  `test/killer-lines.test.ts`; `npm run test:main` with the count gate on the merged tree.

**Risks, and the review's checks:**

- **W2-GUARD's merged form** may differ from its head of 20:21 UTC (its review is still ahead): a line that moves, a `verdict` of another
  shape. The build reads it, adapts the thirteen sites and replays section 1. The review checks the thirteen sites against the merged
  `verdict`.
- **Resolved at the merge of #261**: its `verdict` is narrowed to the guard's prefix (`apps/harness/test/policy-wave2.test.ts` l.251,
  `apps/harness/test/policy-guard.test.ts` l.261 at `5ebd9267`). Before that: **W2-GUARD's `verdict` returned the message of any error** (`9aba7b95`, `apps/harness/test/policy-wave2.test.ts` l.251), not only the
  guard's refusal: a crash under a mutation would then read as a kill by an assertion. The eleven kills measured here are the checkers'
  own refusals (section 2). The review of W2-GUARD may narrow it to the prefix "MONARK import guard: " (the stand-in does, and the two
  helpers of this lot do for their checkers); if it does not, the review of this lot weighs whether this lot narrows it, one line per
  file, outside every test body, with no outcome changed.
- **K116 recomputes with the function `marginalRow` calls.** A mutation inside `splitQuantileExact` moves both sides; this lot targets
  l.44 of `apps/harness/src/policy-marginal.ts` only, and the pinned bytes of K116's replay judge the quantile itself. The review checks
  that the new assertion reads no value built by `marginalRow`.
- **Each named test keeps its outcome**: the review reruns the eleven unmutated (green), checks each pin TAP (`ERR_ASSERTION` at the
  sites of section 2), and that no other test of the five files is judged (only the eleven bodies change).
- **The corrected tool** (#259) holds a green baseline to `test/test-counts.json` (its MUTANTS-BASELINE-UNREPORTED-1): a stale record makes
  the baseline inconclusive, so the build's base must carry W2-GUARD's written record.
- **Environment**: the shared `node_modules` of this container lags the lock file on sharp (0.35.4 for 0.35.5) and source-map-js (1.2.1
  for 1.2.2); no baseline here was red.
- **Windows**: these tests write no path, so case folding plays no part; MONARK's replay at the merge runs the five files and
  `every_killer_line_is_readable`.

## 7. Evidence

Kept under the author's scratchpad (`kata-killers-author/`), Node 24.21.0, each run offline with 0 refused attempts:

| File | sha256 |
|---|---|
| campaign A: `runs/A/RESULTS.json`, `RESULTS.txt`, `logs/A.no-egress.log` (99 processes covered) | `509a9eba…`, `963339bd…`, `af360029…` |
| campaign A, first runs: `runs/A/tap/K212.tap`, K214, K223, K264, K265, K267, K268, K276, K1360 | `3a435d0c…`, `e970e83a…`, `966adb57…`, `2ea75a83…`, `66a8f5a1…`, `d0f83a3d…`, `6ed9d39d…`, `2571d2f1…`, `59ca23e7…` |
| campaign B: `runs/B/RESULTS.json`, `RESULTS.txt`, `tap/K116.tap`, `tap/K235.tap`, `logs/B.no-egress.log` (595 processes) | `b23336a5…`, `cabbef08…`, `d586b5f8…`, `73b97953…`, `1444d409…` |
| campaign C: `runs/C/RESULTS.json`, `RESULTS.txt`, `logs/C.no-egress.log` (340 processes), `logs/C.kids.txt` | `8be1c977…`, `3be77c31…`, `e493f684…`, `5d0797d2…` |
| K116 values: `tools/k116-values.mjs`, `logs/k116-values.log` | `682f285d…`, `7d4b8a02…` |
| assertion probe: `probe/dnt.test.mjs`, `logs/probe-dnt.tap` | `107d166b…`, `d093f5f7…` |
| copy of `92d01d67`: `logs/proto.diff`, `tools/proto-edits.mjs`, `logs/proto-G0-declaration.md` (both copies), `runs/rp-proto2/RED-PROOF.json`, `logs/proto-tsc.log`, `logs/proto-eslint.log` | `5f1e5268…`, `6f4df415…`, `879896f4…`, `8f86cbcb…`, `83f140b1…`, `70c9fbaa…` |
| copy of `9aba7b95`: `logs/proto-w2.diff`, `tools/proto-edits-w2.mjs`, `runs/rp-w2/RED-PROOF.json` | `303c9908…`, `d3986185…`, `521645a6…` |
| checks of W2-GUARD's branch on the remote: `logs/w2guard-checks.log` | `5dd877c5…` |
| `gate:vocab` and `lang:gate` on the tree with this note: `logs/gate-vocab.log`, `logs/lang-gate.log` | `da4cbdc3…`, `25294dfc…` |

## 8. K19, in a small change after #238

MONARK's `e6ebb72` (C-1 of the review of #237) and `f3153f3`: K19 (`apps/harness/src/kata-path.ts:118`), the declared killer of T-4
`committed_tables_reach_the_gate_through_the_seam`, turns T-4 red by the exception of the trip wire, not by an assertion: a declared
limit needs an item. T-4 is on the trunk with #237, but it lives in `apps/harness/test/gate-kata-served.test.ts`, a file #238 changed
while it was open, and the zone rule forbids a second open change on a file of an open pull request. So K19 is not built here. #238
merged at `971eda88` (the trunk is merged into this branch, section 9, « G2 fold »), and K19 is now built in its own change, on
`recherches/kata-k19` (zone row KATA-K19 of recherches `coordination/ZONES.md`), with its red-proof. The planned construction: T-4 judges by an assertion the rows that `servedPolicyTables`
serves, before the trip wire; or K19 is replaced by a killer that T-4 kills by an assertion.

## 9. As built

Built 2026-10-14 by RECHERCHES (`claude-opus-5-5`, effort high), Node 24.21.0; every run below under `offline.mjs --no-egress`, 0 refused
attempts each; the campaigns, red-proof, `tsc`, eslint and `npm run test:main` took the shared host lock.

**Commits** on `recherches/kata-killers-assert-1`: `f7108f66` « Merge the trunk » (parents `00e5f5aa` and `5ebd9267`); `2f79606f` and
`98198516`, this note (documents only); `67d56512`, the five test files (27 lines added, 20 removed); then this section. No pull request
is opened: a fresh review comes first.

**The campaigns** (the trunk's `scripts/mutants/run.mjs --killers --only`, `--base 357ef25f`, the 63 killer lines of the five files, among
them the 19 of `apps/harness/test/policy-guard.test.ts` and the 19 of `apps/harness/test/policy-wave2.test.ts`; `tool_sha256` `13b2b11f…`,
`tool_dirty` null):

| Run | Head | Baseline | tue | survit | non conclu |
|---|---|---|---|---|---|
| before | `f7108f66`, the build base | green | 52 | K116 | K214, K216, K225, K238, K267, K268, K270, K271, K279, K1364 |
| narrowed `refuse`, without the fix of K222 (a local commit, never pushed) | `567faab8` | green | 62 | none | K222 |
| after | `67d56512` | green | 63 | none | none |

Every verdict that moves: the eleven lines of this change, from survit (K116) or non conclu (the ten) to tue; and K222, from tue to non
conclu under the narrowed `refuse` alone, back to tue by an assertion with its fix (section 3). No other killer of the two guard files
moves: their other 29 read tue in all three runs. Each baseline is green in the same 81 target files; its entry count varies between runs
(731, 734, 709) in `test/ci-gates.test.ts` and `test/spec-1-1-0-release.test.ts`, two files this change does not touch. The review
measured the cause: the trunk tool runs `node --test` with `--test-force-exit` (`scripts/mutants/run.mjs` l.209) but without the
stdout-blocking preload that `npm run test:main` loads (`test/helpers/blocking-stdout.cjs`, `package.json` l.17), so a child can exit with
the end of a file's TAP output still queued: those entries are lost and the run still exits 0. #259 adds the preload to the tool.

| Line (sweep id) | Id at the build base | Killer line at `67d56512` | Before | After |
|---|---|---|---|---|
| K116 | K116 | `apps/harness/test/gate-cell.test.ts` l.68 | survit | tue |
| K212 | K214 | `apps/harness/test/policy-guard.test.ts` l.93 | non conclu | tue |
| K214 | K216 | `apps/harness/test/policy-guard.test.ts` l.111 | non conclu | tue |
| K223 | K225 | `apps/harness/test/policy-guard.test.ts` l.206 | non conclu | tue |
| K235 | K238 | `apps/harness/test/policy-projection.test.ts` l.79 | non conclu | tue |
| K264 | K267 | `apps/harness/test/policy-wave2.test.ts` l.116 | non conclu | tue |
| K265 | K268 | `apps/harness/test/policy-wave2.test.ts` l.126 | non conclu | tue |
| K267 | K270 | `apps/harness/test/policy-wave2.test.ts` l.141 | non conclu | tue |
| K268 | K271 | `apps/harness/test/policy-wave2.test.ts` l.156 | non conclu | tue |
| K276 | K279 | `apps/harness/test/policy-wave2.test.ts` l.243 | non conclu | tue |
| K1360 | K1364 | `test/recompute-report.test.ts` l.172 | non conclu | tue |
| (none) | K222 | `apps/harness/test/policy-guard.test.ts` l.188 | tue | tue (non conclu in between) |

**Red-proof**: `node scripts/red-proof.mjs --base f7108f66 --gel 67d56512 --test-only`: OK, 12 judged, 12 pinned (green at the base and
at the gel, the declared killer fired at the gel red by an assertion, `assert-fail`), 51 unchanged, 0 killers drawn, no refusal.

**The crash proof** (the forced crash of the guard fold, `apps/harness/src/policy-guard.ts` l.100 with `rc.scores_sha256` read as
`rc.x.scores_sha256`, on a throwaway copy, never committed; the two guard files run whole): unmutated, 38 of 38 green before and after.
Under the crash, before the narrowing, 23 red: 21 by `ERR_TEST_FAILURE` and 2 by `ERR_ASSERTION` (`guard_recompute_and_verifiers` and
`guard_requires_verifier_pins_as_identities`, whose first failing call is a `refuse`); at `67d56512`, the same 23 red, all by
`ERR_TEST_FAILURE`. The guard's prefix alone in `refuse`, unmutated: 36 of 38 green, red by `ERR_TEST_FAILURE` exactly at the two sites of
section 3.

**The suite and the count**: `npm run test:main` at `67d56512`: 2972 tests, 2950 pass, 0 fail, 22 skipped (Windows-only cases and absent
artifacts). `node scripts/test-count-check.mjs --base origin/lot/etude-suite`: 290 files and 2972 tests, equal to `test/test-counts.json`, 0
drops from the base `5ebd9267`; nothing written, no test added, removed or renamed.

**Checks**: `npx tsc --noEmit` 0; eslint on the five files 0; `lint:ratchet` 69/69, `gate:vocab`, `lang:gate`, `export:check` and winlint
(6 files) OK; `git diff --check` clean; r1scan 0 on each commit before its push. The anchor checker (`verifie-ancres.mjs <tree> --ref
5ebd9267`): 1790 killer lines, 1790 anchored, 0 drifted, 0 lost. The five files with `test/killer-lines.test.ts`: 64 of 64 green.

**Size** (R-25 in the CI form, the pathspec of `.github/workflows/ci.yml` l.100, against `origin/lot/etude-suite`): 5 files, 27 lines
added, 20 removed, 47 in all (`apps/harness/test/gate-cell.test.ts` 7, `apps/harness/test/policy-guard.test.ts` 12,
`apps/harness/test/policy-projection.test.ts` 5, `apps/harness/test/policy-wave2.test.ts` 20, `test/recompute-report.test.ts` 3); the bound
read at `.github/workflows/ci.yml` l.56 is 1205.

**Drift, declared**: no killer line changes text or target, and none is added or removed. Two files move lines: the import of
`splitQuantileExact` and the two new lines of K116's test move the eight killer lines of `apps/harness/test/gate-cell.test.ts` (l.33, 48,
60, 67 to l.34, 49, 61, 68; l.77, 91, 114, 131 to l.80, 94, 117, 134), and the `reads` function in K1364's test moves the last three of
`test/recompute-report.test.ts` (l.183, 200, 210 to l.184, 201, 211). `refuse` stays on its line in both guard files, the projection helper
`admitted` follows the last test of its file, and the fix of K222 rewrites l.191 in place. The plan of section 2 is otherwise built as
written: the thirteen sites, the closed row check helper of K235, the reader's function of K1364, and K116 against `splitQuantileExact`.

**Departures from the plan**: `refuse` accepts the closed row check's refusal beside the guard's (section 3, measured); K222's test is
fixed in this change and its killer declared, so red-proof judges twelve tests, not eleven. The tests commit was made twice locally before
its push (`567faab8`, then `5688478b` with the fix of K222), each replaced by a soft reset before any push; only `67d56512` was pushed.

**Not verified here**: the Windows replay of the five files and of `every_killer_line_is_readable` (MONARK's, at the merge); #259's tool
(not merged, not run), whose preload should end the loss of entries named above; until it merges, a baseline count of the trunk tool
is not read as a test count.

**Evidence**, under the author's scratchpad (`kata-killers-build2/`):

| File | sha256 |
|---|---|
| campaign before: `runs/before/RESULTS.json`, `RESULTS.txt`, `logs/before.no-egress.log` | `d877fc55…`, `6579b9bd…`, `7ba20c25…` |
| campaign at `567faab8`: `runs/after/RESULTS.json`, `RESULTS.txt`, `tap/K222.tap`, `logs/after.no-egress.log` | `777259a9…`, `7868e89f…`, `a1543cdb…`, `ec1a02e3…` |
| campaign after: `runs/after2/RESULTS.json`, `RESULTS.txt`, `tap/K222.tap`, `logs/after2.no-egress.log` | `0dd6f9da…`, `69b020b6…`, `49a93776…`, `e4bba8f5…` |
| red-proof: `runs/redproof3/RED-PROOF.json`, `logs/redproof3.log` | `55eb5ed0…`, `6d1ae607…` |
| crash proof: `logs/x1.diff`, `logs/x1-before.codes`, `logs/x1-final.codes`, `logs/final-unmutated.codes`, `logs/strict-unmutated.codes` | `b9c0ee57…`, `ebde02c4…`, `0fa0b3b9…`, `7a8a349c…`, `66695d8b…` |
| suite and count: `logs/testmain.log`, `logs/countcheck.log` | `a13271bd…`, `6f3b43a3…` |
| checks: `logs/anchors-final.log`, `logs/size-final.log`, `logs/tsc2.log`, `logs/eslint2.log`, `logs/five2.tap` | `f7e805b3…`, `12958729…`, `a9ba2989…`, `8cc1ff9d…`, `e885afcd…` |
| the edits: `logs/tests-final.diff`, `tools/build-edits.mjs`, `tools/k222-fix.mjs`, `tools/x1.mjs` | `92190e92…`, `1add57ce…`, `6420ad22…`, `85d5faa9…` |

**G2 fold.** A fresh G2 (recherches `2518e8d`, `coordination/pieces/2026-10-14-g2-kata-killers/G2-kata-killers.json`, sha256
`979c2b62…`; `claude-opus-5-5`, effort high) re-measured every claim above at `c2a22042` and returned ACCEPTE with two minor findings,
neither on the tests, both folded in this note, in place: m-1, the baseline entry counts that section 9 left unexplained, now carry the
cause it measured (the trunk tool's `--test-force-exit` without the stdout-blocking preload, #259); m-2, the build base line of the
header and section 8 no longer say that the later trunk commits change documents only, since #238 merged at `971eda88`. The trunk
`971eda88` is merged into the branch at `15e826ed` « Merge the trunk » (parents `c2a22042` and `971eda88`, no conflict, its tree the one
of the G2's throwaway merge `1998de55`). Before the push the trunk moved to `6779955e` (#262: `scripts/pin-bell-legal.mjs`, its test
`test/pin-bell-legal.test.ts` and its record line), so it is merged again at `40fcf748` « Merge the trunk » (parents `15e826ed` and
`6779955e`, no conflict), with the replay of the second table; this note's fold follows, documents only. The proofs on `15e826ed`,
Node 24.21.0, each under `offline.mjs --no-egress` with 0 refused attempts, the suite, the campaign, red-proof and the type and lint checks under the shared host
lock (author's scratchpad `kata-killers-fold/`, hashed in `logs/SHA256SUMS-merge.txt`):

| Proof on `15e826ed` | Result | Evidence (sha256) |
|---|---|---|
| `npm run test:main` | 2973 tests, 2951 pass, 0 fail, 22 skipped | `logs/testmain.log` (`b5b634c5…`) |
| `node scripts/test-count-floor.mjs write` | `test/test-counts.json` unchanged: 290 files, 2973 tests (#238's test included) | `logs/floor.log` (`e2e3bea6…`) |
| `node scripts/test-count-check.mjs --base origin/lot/etude-suite` | equal to the record, 0 drops from `971eda88` | `logs/countcheck.log` (`5d83ec78…`) |
| the trunk tool, `--killers --only` the 63 killer lines of the five files, `--base 357ef25f` | baseline green, tue 63 of 63, each by `ERR_ASSERTION`; the twelve judged (K116, K215, K217, K223, K226, K239, K268, K269, K271, K272, K280, K1365 on this tree) each red in its named test alone | `runs/camp-merge/RESULTS.json` (`8db26173…`), `logs/twelve-codes.txt` (`a5fbcf1b…`) |
| `node scripts/red-proof.mjs --test-only --base 971eda88 --gel 15e826ed` | OK, 12 judged, 12 pinned (each `ERR_ASSERTION`), 51 unchanged, 0 drawn, no refusal | `runs/redproof/RED-PROOF.json` (`5b20986a…`), `logs/redproof.log` (`e8fcb573…`) |
| anchors, `verifie-ancres.mjs <tree> --ref 971eda88` | 1791 killer lines, 1791 anchored, 0 drifted, 0 lost | `logs/anchors.log` (`d031874d…`) |
| the five files with `test/killer-lines.test.ts` | 64 of 64 green | `logs/five.tap` (`0da56814…`) |
| `npx tsc --noEmit`; eslint on the five files; `lint:ratchet`; `gate:vocab`; `lang:gate`; `export:check`; winlint `--base 971eda88` | 0; 0; 69/69; OK; OK; OK; 6 files, no hazard | `logs/g-*.log` |
| size, the CI form against `origin/lot/etude-suite` | 5 files, 27 added, 20 removed, 47; bound 1205 | `logs/size.log` (`0fb93b3a…`) |

| Replay on `40fcf748` (trunk `6779955e`) | Result | Evidence (sha256) |
|---|---|---|
| `npm run test:main` | 2981 tests, 2959 pass, 0 fail, 22 skipped | `logs/m2-testmain.log` (`9421c98c…`) |
| `node scripts/test-count-floor.mjs write` | `test/test-counts.json` unchanged: 291 files, 2981 tests (#262's tests included) | `logs/m2-floor.log` (`8e7ff4fa…`) |
| `node scripts/test-count-check.mjs --base origin/lot/etude-suite` | equal to the record, 0 drops from `6779955e` | `logs/m2-countcheck.log` (`5142e0a6…`) |
| the five files with `test/killer-lines.test.ts` | 64 of 64 green | `logs/m2-five.tap` (`cbee3725…`) |
| `node scripts/red-proof.mjs --test-only --base 6779955e --gel 40fcf748` | OK, 12 judged, 12 pinned (each `ERR_ASSERTION`), 51 unchanged, 0 drawn | `runs/redproof2/RED-PROOF.json` (`f50f7c1c…`) |
| anchors, `--ref 6779955e` | 1799 killer lines, 1799 anchored, 0 drifted, 0 lost | `logs/m2-anchors.log` (`cae4238a…`) |
| `npx tsc --noEmit` | 0 | `logs/m2-tsc.log` (`55522eec…`) |
| the trunk tool on the 63 killer lines of the five files (the recompute ids now K1370 to K1376) | baseline green, tue 63 of 63, each by `ERR_ASSERTION`; the twelve judged each red in its named test alone | `runs/camp-merge2/RESULTS.json` (`8d3e9ad4…`), `logs/m2-twelve-codes.txt` (`43ccd981…`) |

The two campaign baselines read 735 and 705 entries over the same target files, the variation that m-1 explains; `npm run test:main`
gives the same per-file counts as the record on both merges.
