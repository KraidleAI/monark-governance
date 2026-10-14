# G0 — TEST-COUNT-NAMES-FOLLOWUP-1: a file gone covers only the names that reappear; test 38's line cases take every blank

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), the author instance of this follow-up, distinct from the authors and
  reviewers of #270. 2026-10-14.
- **Base**: trunk `lot/etude-suite` = `08ae8022` (the merge of #270; read with `ls-remote`, fetched with an explicit refspec). **The
  `file:line` addresses of §1 hold at `08ae8022`; those of §2 to §4 hold at `f6d9a698`, the head the review read; those
  of §7 hold at `cb19b4ce`, the head the second review read; those of §8 hold at this branch's head.**
- **Demand**: two items left after #270. O-2 of the review of its fold 4 (recherches,
  `coordination/pieces/2026-10-14-g2d2-test-count-names/G2-test-count-names-fold4.json`): three single-character widenings of the
  split of test 38 (U+1680, U+202F, U+0085) survive its line cases. And a reading of a bypass hunter: a test file renamed that loses a
  test seems to pass with one line `{file: <old>, from: N, to: 0, reason}`, without naming the dropped test.
- **Zone**: `scripts/test-count-check.mjs`, `test/test-count-check.test.ts`, test 38's separator cases in `test/ci-gates.test.ts`,
  this note. `scripts/test-count-check.d.mts`, `test/test-counts.json` and `test/test-names.json` are unchanged (no exported shape
  changes, no test is added: `write` leaves both records as they are, §4).

## 1. The gap, proved at the trunk

At `08ae8022`, `nameProblems` takes a file-gone line and empties the file's whole list of names gone
(`scripts/test-count-check.mjs:98`): `if (head[f] === undefined && base[f]?.length === r.from && gone.length === r.from) gone.length = 0;`.
Nothing asks where those names went.

A fixture shaped like T5 of `test/test-count-check.test.ts` (a git repository, both records and the list at the base, the check run by
its command line with `--base`): the base's names record holds `old.test.ts` with three tests `one`, `two`, `three`; at the head
`old.test.ts` is gone and `new.test.ts` holds `one` and `two`; the list adds one line
`{"file":"old.test.ts","from":3,"to":0,"reason":"#7: the file was renamed to new"}`.

| Case | Trunk's check |
|---|---|
| the file-gone line only | **exit 0**, `… 1 drop(s) from the base …, each name gone with its line …` |
| the file-gone line and `{"file":"old.test.ts","removed":"three",…}` | exit 1, the `removed` line `names no test gone from old.test.ts since the base` |
| no line | exit 1, wants the file-gone line only |

So the test `three` leaves the suite under a line that declares a rename, and the honest declaration (the rename and the dropped test)
is refused. Log: `logs/gap-probe-trunk.log` (sha256 `f08dbc58…`).

## 2. The rule

For a file gone from the head, each of its base names must either **reappear** or have its own line (`removed`, as for any file). A
name reappears when some file of the head **gained** it since the base (the same full name; the head's names minus the base's, as
multisets), and no `renamed` line already took that gained name; each gained name covers one name gone, once. The file-gone line
`{file, from: <base count>, to: 0, reason}` declares the move and covers the names that reappear; a name that reappears nowhere is
not covered by it.

Built in `nameProblems` (`scripts/test-count-check.mjs:94-116`) as two passes: the first reads each file's lines as before (a
file-gone line is now accepted once per file, at the base count, whatever other lines took, `scripts/test-count-check.mjs:100`); then
the pool of gained names left after the renames (`scripts/test-count-check.mjs:107`) is matched against each gone file's names
(`scripts/test-count-check.mjs:110`). Messages, exit codes and the order of the messages per file are those of the trunk; the hints:

- a file gone without a file-gone line, some of its names back: the file-gone line (the trunk's message), then one `removed` line per
  name that is back nowhere;
- a file gone whose names are back nowhere (a file deleted): one `removed` line per name. At the trunk the file-gone line alone passed
  here; it no longer covers those names, so the hint no longer offers it.

Why gained, not any name of any file of the head: a name that another file already held at the base covers nothing (`{a: [m], b: [m]}` →
`{b: [m]}` loses a test); and a gained name that a `renamed` line took is that file's rename, not the moved test.

Out of scope, unchanged: a test moved between two files that both stay (it still takes its `removed` line in the file it left).

## 3. Test 38: every blank

The line cases of test 38 named eight blanks. They are now built (`test/ci-gates.test.ts:344`) from every character JavaScript's
`\s` matches, plus U+0085, minus space and tab (24 characters), as O-2 suggested; one assertion (`test/ci-gates.test.ts:345`) checks
that the list holds the eleven blanks the reviews named, so an emptied list reds. The parser is unchanged.

## 4. Tests red first, and killers

- **Check, T7** (`test_count_check_holds_each_name_gone_to_its_line`): ten new cases (`test/test-count-check.test.ts:241-264`),
  three of them controls, and the two assertions changed for a file deleted (`:212` and `:217`, three cases). Judged one by one
  against the trunk's check: 10 of 13 red, the three controls green (`logs/cases-probe-trunk.log`, sha256 `f5ad3f62…`); 13 of 13 green after
  (`logs/cases-probe-fix.log`, `8194121e…`). The test file at the trunk's check: T7 red by `ERR_ASSERTION`
  (`logs/red-tcc-trunk-check.tap`, `627feba5…`); green after (`logs/green-tcc.tap`, `3f3f1b44…`). The fixture of §1 after the fix:
  the file-gone line only, exit 1 asking for `{"file":"old.test.ts","removed":"three",…}`; with that line, exit 0
  (`logs/gap-probe-fix.log`, `dc9f03a1…`).
- **Killers**: six new `// killer:` lines for the new clause (`test/test-count-check.test.ts:243-248`), among them the trunk's own rule
  back (`", gone = minus(all, back)" -> ", gone = moved ? [] : minus(all, back)"`) and any name of the head's files in place of the names gained;
  six earlier ones re-anchored to the moved lines, and the one on the trunk's `gone.length === whole` replaced by
  `"if (back.length > 0" -> "if (all.length > 0"`. Campaign (`scripts/mutants/run.mjs --killers`, base the trunk, the two changed
  test files): 69 of 69 killed by an assertion, the six new ones among them (`killers/RESULTS.json`, sha256 `7962a2af…`;
  `logs/killers.log`, `638692d0…`).
- **Test 38** (a killer line may not point at a `*.test.ts`, so its mutants are by hand: the review's `pin-mutants.mjs`, its rows kept,
  plus three for the computed list). On the trunk's test file the widenings by U+1680, U+202F and U+0085 survive (green), as O-2 found
  (`logs/pin-mutants-trunk-testfile.log`, `458984a4…`); on this branch's they are red by `ERR_ASSERTION`, as are the emptied list and
  the list without U+0085 (`logs/pin-mutants-new.log`, `a19652ae…`). The other survivors are the seven the review listed (assertions
  removed, and the space-and-tab control dropped), unchanged.

## 5. Measures

All at the head of the code commits (the note aside), Node v24.21.0, each run offline (`offline.mjs --no-egress`, 0 refused
attempts in every log); evidence in the scratchpad folder `names-followup-1-r1/`, kept.

| Measure | Result | Log, sha256 prefix |
|---|---|---|
| `npm run test:main` (under the host lock) | 3013 tests, 2991 pass, 0 fail, 22 skipped | `logs/test-main.log`, `158e398d` |
| `node scripts/test-count-floor.mjs write`, then `git status` | 298 files, 3013 tests; both records unchanged | `logs/write.log`, `f26e4538` |
| the count check against `origin/lot/etude-suite` | exit 0, `test counts: 298 files, 3013 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base 08ae80223649, each name gone with its line in test/test-count-removals.json` | `logs/count-check.log`, `580c20c6` |
| anchors, `verifie-ancres.mjs` on the whole tree, `--ref 08ae8022` | 1863 killers, 1863 anchored, 0 drifted, 0 lost | `logs/anchors.log`, `bfb1b28b` |
| tsc, eslint (the three changed code and test files), lint:ratchet, gate:vocab, lang:gate, export:check, winlint, `git diff --check` | each exit 0 | `logs/gates.log`, `49bdc5ee`; against the merge base, `logs/gates-mergebase.log`, `00af8ff9` |
| size in CI form (the job's pin, then the head's `STAT=` line in bash) | 3 files, 57 insertions, 20 deletions: W = 77, under 1,205 | `logs/size-ci.log`, `199a8821` |
| the two changed test files with the case-folding git wrapper first in PATH | 48 pass, 0 fail; 0 case-only collision | `logs/casefold-run.tap`, `dbc34bcd`; `logs/casefold.log`, `d1461fdc` |

The trunk moved during the work, to `8400a223` (#271, Bell timer files and both test records); this branch does not merge it, and
none of its files is in this change's zone but the two records, which this change does not touch.

## 6. Not verified

- Windows: not run here; the change adds no path a test writes.
- The CI run of this branch: no pull request is opened.
- The bypass hunter's other readings, if any, beyond the one in the demand.
- The killer campaign's baseline reports 346 tests for the two files' targets; the gap between the TAP the tool reads and the tests
  that run is the item already handed over (MUTANTS-BASELINE-UNREPORTED-1, O-3 of the same review), not this change.
- A test moved between two files that both stay is still declared by a `removed` line (§2); whether it should take a move line of its
  own is not decided here.

## 7. The review's corrections

The review of `f6d9a698` returned three minor points (recherches,
`coordination/pieces/2026-10-14-g2-names-followup-1-r1/G2-names-followup-1.json`, m-1 to m-3); each is folded here, with a case
red before and green after. **The `file:line` addresses of this section hold at `cb19b4ce`.** First the trunk's head
`8400a223` (#271) was merged (a merge commit, no conflict); the main suite on that merge, then `write`, left both records as
the trunk wrote them (300 files, 3032 tests; `logs/test-main-merge.log`, `logs/write-merge.log`).

- **A names-record key `""` (m-3).** P2 on names dropped the key `""` on both sides, so an entry `"": [...]` of
  `test/test-names.json` was never held to the run, and its names joined the names gained: a hand edit of the record could
  cover a test dropped from a gone file. Now only the run's key `""` is left out (those tests are P1's): a names-record key
  `""` is compared with the run like any file (`scripts/test-count-check.mjs:83`). One assertion in T7
  (`test/test-count-check.test.ts:189`) with its killer line (`:188`). The review's fixture by the command line: exit 0 before,
  exit 1 after with `: run and test/test-names.json differ: run only [], recorded only ["drops it"]`; the same without the key
  and the honest declaration are judged as before (`logs/cli-probe.log`).
- **The file-gone hint's count (m-1).** The hint was right but no test pinned its count on the branch where another line took
  a name. One T7 case (`test/test-count-check.test.ts:258`: a file renamed, one test dropped and declared, no file-gone line;
  the hint wants the file-gone line at the base count) and its killer line (`:252`, `from: base[f].length` to
  `from: all.length`). That mutant survived the test file of the reviewed head and is red now.
- **Test 38's comment (m-2).** The comment claimed more than the test does: a split widened by one of the four line
  terminators (U+000A, U+000D, U+2028, U+2029) stays green, because `R25_DIFF_RE`'s `(.+)` refuses a line holding one before
  the split runs. The comment now says so (`test/ci-gates.test.ts:342-344`), and one assertion holds that refusal
  (`test/ci-gates.test.ts:347`): with `(.+)` widened to cross a line terminator, test 38 was green at the reviewed head and is red
  now. The widenings by the other 20 blanks stay red.

The two nits are not folded: the pool of gained names (N-1) is the rule §2 writes, and the review judged its proposed fix
would refuse an honest merge of a file into an existing one; the widenings by characters outside `\s` (N-2) are the class
the review of fold 4 already judged.

Red before, green after (`tools/red-green.mjs`, `logs/red-green.log`): 11 rows, each as wanted. Hand mutants of the new
clause: 0 of 8 survive, the hint count among them (`logs/hand-mutants.log`). Test 38's split widened by each blank: the four
line terminators green, the 22 others red (`logs/split-mutants.log`). The pin's own mutants: the same verdicts as before
(`logs/pin-mutants-new.log`).

Measures at the head of the code commits, each run offline (0 refused attempts in every log); evidence in the scratchpad
folder `names-followup-1-r2/`, kept:

| Measure | Result | Log, sha256 prefix |
|---|---|---|
| `npm run test:main` (under the host lock) | 3032 tests, 3010 pass, 0 fail, 22 skipped | `logs/test-main.log`, `c42096d4` |
| `node scripts/test-count-floor.mjs write`, then `git status` | 300 files, 3032 tests; both records unchanged | `logs/write.log`, `467cde86` |
| the count check against `origin/lot/etude-suite` | exit 0, `test counts: 300 files, 3032 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base 8400a2231334, each name gone with its line in test/test-count-removals.json` | `logs/count-check.log`, `bfddc84e` |
| killer campaign (`scripts/mutants/run.mjs --killers`, base `8400a223`) | 71 of 71 killed, the two new ones among them | `killers/RESULTS.json`, `422f59ae`; `logs/killers.log`, `4e567a2f` |
| anchors, `verifie-ancres.mjs` on the whole tree, `--ref 8400a223` | 1884 killers, 1884 anchored, 0 drifted, 0 lost | `logs/anchors.log`, `7687cfbb` |
| tsc, eslint (the three changed code and test files), lint:ratchet, gate:vocab, lang:gate, export:check, winlint, `git diff --check` | each exit 0 | `logs/gates.log`, `37c8c676` |
| size in CI form (the job's pin, then the head's `STAT=` line in bash, base `8400a223`) | 3 files, 67 insertions, 22 deletions: W = 89, under 1,205 | `logs/size-ci.log`, `11246b86` |
| the two changed test files with the case-folding git wrapper first in PATH | 48 pass, 0 fail; 0 case-only collision | `logs/casefold-run.tap`, `64546251`; `logs/casefold.log`, `30e7cc2f` |

A first build of the test commit wrote U+2028 and U+2029 as raw characters in the new assertion of test 38; the main suite
caught it (two repository tests refuse a line separator in a tracked text file: `logs/test-main-e8af7c08-literal-separator.log`,
`431ec0b3`). The commit was rebuilt, before any push, with the escapes `\u2028` and `\u2029`.

Not verified here: Windows (the change adds no path a test writes); the CI run (no pull request is opened); whether a test
moved between two files that both stay should take a move line of its own (§2).

## 8. The second review's corrections, and the trunk's mutation tool

The second review read `cb19b4ce` (recherches, `coordination/pieces/2026-10-14-g2-names-followup-1-r2/G2-names-followup-1.json`,
after its reconcile) and returned two minor points, m-1 and m-2, each with a checked fix; both are folded here, tests first.
**The `file:line` addresses of this section hold at `294d5bb3` and at this branch's head.** First the trunk's head `370a6397`
(#259: the mutation tool judges each declared mutation by its own named test) was merged: a merge commit, `cc04cdbc`, no
conflict. The main suite on that merge, then `write`, left both records as the trunk wrote them (300 files, 3046 tests).

- **A key without names on one side of the records (m-2).** P2 on names compared a key that only the run or only the names
  record holds as two empty lists, and passed: `{"ghost": []}` in the names record, or a file of 0 tests that the run and the
  counts record hold but the names record lacks. Once such a change is merged, the next change's check reads two records that
  disagree at its base and stops (exit 4), the change that repairs them included. Now the key is named:
  `ghost: in test/test-names.json, not in the run`, or `z: in the run, not in test/test-names.json`
  (`scripts/test-count-check.mjs:84-85`, two lines changed in place so that no line below moves; the comment at `:81`). One
  assertion in T7 (`test/test-count-check.test.ts:193-194`) with its killer line (`:192`). The gap predates this branch (the
  trunk has it too); it is folded here because the fix sits in the clause §7 changed.
- **An honest merge into a file still there, pinned (m-1).** The rule of §2, that a file-gone line covers each of its names that
  a file of the head gained, held for a file that was already there at the base, but no test said so: the pool of gained names
  narrowed to the files new at the head survived the unit file. One T7 case (`test/test-count-check.test.ts:271`: a file merged
  whole into a file still there, with its file-gone line, no problem) and its killer line (`:252`, the pool of
  `scripts/test-count-check.mjs:107` taken from the files new at the head only). No code changes for it.
- **A killer the trunk's tool could not count.** The campaign below, first run on the fold before this move, judged one killer of the trunk's
  own lines *non conclu*: `scripts/test-count-check.mjs:34` with `"mine.length === 1 && "` removed. Its named test turned red,
  but by a `TypeError` thrown at an earlier assertion (a drop without a line reads `mine[0]`), before the assertion written for
  it. That assertion (two lines for one drop) and its killer line now come first among the drops
  (`test/test-count-check.test.ts:26-28`), so the mutant fails by that assertion. The test file's lines 1 to 187 and the
  script's line 34 are the trunk's bytes, so a campaign at the trunk should judge it the same way; that was not run.

Red before, green after (`tools/red-green.mjs`, `logs/red-green.log`): eight runs of the unit file, each verdict written before
its run, each as wanted. m-2's assertion is red on the code before its fix, by `ERR_ASSERTION`, and green after; m-1's case is
green on the code before (the rule already held); the old test file is green on the fixed code; each new killer's mutant is
green on the old test file and red by `ERR_ASSERTION` on the new one.

**The mutation tool's baseline, reread.** Earlier campaigns on this branch, with the tool before #259, read a baseline of 346
tests, and the review of #270 read 345 of 372 for `test/ci-gates.test.ts`. With the trunk's tool (`scripts/mutants/run.mjs`,
sha256 `bab1dac3`, the bytes of `370a6397`), the killer campaign of the changed test files (`--killers`, base `370a6397`)
prints one baseline line for all of its target files:
`BASELINE l.0 - vert (0 rouge(s), 364 vert(s), 48058 ms) restaure OK ; unmutated`.
Its 364 are the top-level entries; the TAP's own tally is 372 tests, 372 pass (eight of them subtests, in two files). The
tool's counting reporter, read per target file against `test/test-counts.json`: 37 target files, each with its own summary,
372 tests reported of 372 recorded, no file off its count and none outside the record; among them `test/ci-gates.test.ts`
44 of 44 and `test/test-count-check.test.ts` 4 of 4 (`logs/baseline-per-file.log`). Every test is now reported, so the
baseline's note is empty. Why the older tool read fewer was not measured again here.

Measures, each run offline (0 refused attempts in every log); evidence in the scratchpad folder `names-followup-1-r3/`, kept:

| Measure | Result | Log, sha256 prefix |
|---|---|---|
| `npm run test:main` on the merge `cc04cdbc` (under the host lock) | 3046 tests, 3024 pass, 0 fail, 22 skipped | `logs/test-main-merge.log`, `76c9b558` |
| `node scripts/test-count-floor.mjs write` on the merge, then `git status` | 300 files, 3046 tests; both records unchanged | `logs/write-merge.log`, `8d90c259` |
| red before, green after (unit file, eight runs) | 8 of 8 as wanted | `logs/red-green.log`, `31ff52e9` |
| killer campaign at `d6a89beb` | 72 of 73 killed, the one above *non conclu* | `killers-d6a89beb/RESULTS.json`, `4de8e9c6` |
| killer campaign at `294d5bb3` (`scripts/mutants/run.mjs --killers`, base `370a6397`) | 73 of 73 killed, each by its named test's assertion; the two new killers among them | `killers/RESULTS.json`, `f80c09b5`; `logs/killers2.log`, `b066bf49` |
| the baseline per target file | 37 files, 372 of 372 tests reported, each file at its count | `logs/baseline-per-file.log`, `9c15ac0e` |
| `npm run test:main` at `294d5bb3` (under the host lock) | 3046 tests, 3024 pass, 0 fail, 22 skipped | `logs/test-main-final.log`, `c5a11a9c` |
| `write`, then `git status` | 300 files, 3046 tests; both records unchanged | `logs/write.log`, `a153cea0` |
| the count check against `origin/lot/etude-suite` | exit 0, `test counts: 300 files, 3046 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base 370a639704bd, each name gone with its line in test/test-count-removals.json` | `logs/count-check.log`, `f06fda8b` |
| anchors, `verifie-ancres.mjs` on the whole tree, `--ref 370a6397` | 1906 killers, 1906 anchored, 0 drifted, 0 lost | `logs/anchors.log`, `90665257` |
| tsc, eslint (the three changed code and test files), lint:ratchet, gate:vocab, lang:gate, export:check, winlint, `git diff --check` | each exit 0 | `logs/gates.log`, `ce4d9667` |
| size in CI form (the job's pin, then the head's `STAT=` line in bash, base `370a6397`) | 3 files, 77 insertions, 26 deletions: W = 103, under 1,205 | `logs/size-ci.log`, `a218628e` |
| the two changed test files with the case-folding git wrapper first in PATH | 48 pass, 0 fail; 0 case-only collision | `logs/casefold-run.tap`, `ea599cb8`; `logs/casefold.log`, `f7f4402c` |

The review's nits stay nits: the pool of gained names (N-1) is the rule §2 writes, now pinned by m-1's case; a test file
replaced by a symbolic link (RN-1) is refused by R-25 before any count; a success line that does not name the covered names
(RN-2) hides nothing the check lets through; a hint whose two names differ only in Unicode normalization (RN-3) fails closed.

Not verified here: Windows (the change adds no path a test writes); the CI run (no pull request is opened); the trunk's own
campaign on `test/test-count-check.test.ts` (the *non conclu* above is inferred there from the same bytes); why the tool before
#259 read fewer tests in its baseline; whether a test moved between two files that both stay should take a move line of its
own (§2).

## 9. Changelog

- 2026-10-14: built (this note).
- 2026-10-14: the review's three minor points folded, after a merge of the trunk (§7).
- 2026-10-14: the trunk `370a6397` merged; the second review's two minor points folded, a trunk killer put first so that the
  new mutation tool counts it, and the tool's baseline reread (§8).
