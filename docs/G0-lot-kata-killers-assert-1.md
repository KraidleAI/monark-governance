# G0 — KATA-KILLERS-ASSERT-1: the eleven zone KATA killer lines of the sweep, each named test made to judge its mutation by an assertion

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), 2026-10-08, from 19:36 UTC (the lot lock; `date -u` read at 19:54, 20:21
  and before the commit). A short G0, before any test or code: nothing below is built. The fixes were measured on throwaway copies,
  never committed (section 2).
- **Name**: KATA-KILLERS-ASSERT-1, proposed here: MONARK's message names no lot.
- **Demand**: MONARK `169cbc3` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-colonne-kata.md`, read in full).
  It copies byte for byte the eleven zone KATA entries of PAROXYSME's killer sweep (paroxysme `596d35f`,
  `coordination/pieces/2026-10-08-balayage-tueurs/SURVIVANTS.md`, sha256 `5dfea14f…`; that repository is not readable from here, the
  copy is the source). For each line: a killer that its named test kills by an assertion, or a test that really judges the targeted
  mutation; a line in a pile resolves to its own test; red-proof judges; the campaign runs on PAROXYSME's corrected mutation tool if its
  pull request is merged by then.
- **Base**: trunk `lot/etude-suite` = `52ddf000` (`ls-remote` at 20:21 UTC, explicit refspec), documents only on top of `92d01d67`, the
  merge of #256, where every measure below ran (`git diff --quiet 92d01d67 52ddf000 -- . ':(exclude,glob)docs/**'` holds). The sweep
  ran at `b44c3890`; `git diff --quiet b44c3890 92d01d67 -- apps packages test/recompute-report.test.ts scripts/mutants
  scripts/red-proof.mjs` holds, so no file the eleven lines, their tests or the two tools read has changed since. Branch
  `recherches/kata-killers-assert-1`, this note alone.
- **Zone**: KATA. Planned: `apps/harness/test/gate-cell.test.ts`, `apps/harness/test/policy-guard.test.ts`,
  `apps/harness/test/policy-projection.test.ts`, `apps/harness/test/policy-wave2.test.ts`, `test/recompute-report.test.ts` and this
  note. No production file, no test support file, no killer line, no test added, removed or renamed.
- **Rules held**: Node 24.21.0; every run under `offline.mjs --no-egress`, 0 refused attempts each; the mutation runs and the type and
  lint checks take the shared host lock of this session (root `<scratchpad>/F:/tmp`); no data series is read; nothing of R1.

red-proof: test-only

The line above declares the lot test-only, for `node scripts/red-proof.mjs --base <the base of the build> --gel <its head> --test-only`.
The killers it judges, one per named test, as they read at the base and at W2-GUARD-MISSES-TAIL-1's head (section 4: none moves):

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
- **How PAROXYSME's corrected tool would read them** (#259, head `9c03bb64`, read and not run; its review runs elsewhere). Its rule
  (`scripts/mutants/run.mjs` l.32-42 at `9c03bb64`) reads the named test's own entry: tue only when that entry fails by an assertion,
  survit when it is ok whatever else is red, non conclu otherwise. Each first run here holds that entry and no other, so the ten read
  non conclu and K116 survit, as on the trunk; its promotion of a lost first run does not apply (none is lost). After the fix, each named test
  fails by an assertion under its mutation (red-proof's pins, section 2), which both tools read as tue. The campaign of the build uses #259's tool if it is merged by then, else the trunk's, and the record
  says which (`tool_tree`, `tool_sha256`).

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

So `check` and `refuse` keep their bytes, and only the admissions of the eight named tests change.

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
- **W2-GUARD's `verdict` returns the message of any error** (`9aba7b95`, `apps/harness/test/policy-wave2.test.ts` l.251), not only the
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
