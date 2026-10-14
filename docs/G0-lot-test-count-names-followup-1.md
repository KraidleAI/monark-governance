# G0 — TEST-COUNT-NAMES-FOLLOWUP-1: a file gone covers only the names that reappear; test 38's line cases take every blank

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), the author instance of this follow-up, distinct from the authors and
  reviewers of #270. 2026-10-14.
- **Base**: trunk `lot/etude-suite` = `08ae8022` (the merge of #270; read with `ls-remote`, fetched with an explicit refspec). **The
  `file:line` addresses of §1 hold at `08ae8022`; those of §2 to §4 hold at this branch's head.**
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

## 7. Changelog

- 2026-10-14: built (this note).
