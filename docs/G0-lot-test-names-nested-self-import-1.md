# G0 — TEST-NAMES-NESTED-SELF-IMPORT-1: a test file that imports itself from a test body is refused

- **Author**: RECHERCHES, the author instance of this item, distinct from the authors and reviewers of the test-names follow-up
  (#275). Launched as `claude-opus-5-5` at effort high; served as `claude-fable-5-1`, the name the runtime banner gives. 2026-10-14.
- **Base**: trunk `lot/etude-suite` = `0cae9706` (read with `ls-remote`, fetched with an explicit refspec). **The `file:line`
  addresses of this note hold at `08f0aee2`, the head of this branch before this note (tests first `3d37a622`, the fix
  `5c7fd436`, the records `98a00868`, one killer line re-formed `08f0aee2`).**
- **Demand**: the fifth review of the test-names follow-up found a form of a file running twice that the repeat rule of that
  follow-up does not see. The follow-up's note names the form it closed and the one it foresaw
  (`docs/G0-lot-test-count-names-followup-1.md`, section 10, "A nested test run and a file that runs twice in its own process";
  its not-verified list, at the end of the section, foresees names that differ between two instances). The form found needs no
  computed name: a self-import placed inside a test body, or a suite body, nests the second instance's tests, so no full name
  repeats and nothing is foreign.
- **Zone**: `scripts/test-counts-reporter.mjs`, `scripts/test-count-floor.mjs`, their `.d.mts` (the run's type gains `sites`),
  `test/test-count-floor.test.ts`, this note, and the two records `test/test-counts.json` and `test/test-names.json` by `write`.

## 1. The gap, measured at the trunk

A test file can load a second instance of itself with a query string: `await import("./b.test.ts?again")`, guarded by
`import.meta.url.includes("?")` so that the second instance loads no third. At the top level of the module, the second instance
declares its tests beside the first's, each full name twice, and the repeat rule of the follow-up refuses the file
(`scripts/test-count-floor.mjs:24`, the count by `twice`, `:53-55`).

Placed inside a test body, `test("x", async () => { if (!import.meta.url.includes("?")) await import("./b.test.ts?again"); })`,
the same line runs while `x` runs. Node's runner nests whatever is declared then under `x`: the second instance's tests are
`x > rejects an empty input`, `x > formats a date` and `x > x`. No full name repeats. The events come from the file's own process,
before its summary, so none is foreign either (`scripts/test-counts-reporter.mjs:21`). The suite form, `describe("x", async () => {
<the same line> })`, does the same with `x` as a suite.

The harm is the one the follow-up closed for the top-level form: a file deleted elsewhere, with one file-gone line only, has its
names covered by the names this file gained, and the check exits 0 while a test left the suite
(`scripts/test-count-check.mjs:107` and `:110`, the pool and a gone file's names taken back from it). Without a removal, the line
alone takes the file from 2 to 6 recorded tests with no refusal.

Measured here at `0cae9706`, with the reviewer's reproduction script (`tools/nest-repro.mjs`, sha256 `d2811fac`; each case a fresh
git repository holding the three count scripts and the trunk's test:main line limited to `test/*.test.ts`; the wants are those of a
gate that closes the case, written before the runs):

| Case | At the trunk's scripts | Want |
|---|---|---|
| NEST-SELF-TEST (a self-import in the body of a test `x`; a file `a` with `x > rejects an empty input` deleted with a file-gone line) | `write` 0, check 0: open | 1, 1 |
| NEST-SELF-DESCRIBE (the same in the body of a suite `x`; `a` holds a suite `x`) | 0, 0: open | 1, 1 |
| NEST-SELF-INFLATE (the line alone, no removal; 2 tests become 6) | 0, 0: open | 1, 1 |
| NEST-SELF-TEST-CONTROL (the same head, `x`'s body empty) | 0, 1: closed | 0, 1 |
| NEST-OTHER-TEST (another file imports `b` inside a test: foreign) | 1, 1: closed | 1, 1 |
| SELF-FRAGMENT (a fragment instead of a query, at top level: the names repeat) | 1, 1: closed | 1, 1 |
| WORKER-SELF (the file runs itself in a worker, inside a test) | 1, 1: closed | 1, 1 |

`logs/nest-repro-trunk.out`, sha256 `1e0a19ab`: 3 cases open, 4 closed, the same three the review found at its head.

## 2. The rule

What a prefix cannot hide is the declaration site. Node 24.21.0 sets `line` and `column` on each `test:pass` and `test:fail`
event, to the place where the test was declared: the column of the callee, so `t.test(` at column 34 of line 4 gives `4:34`, and a
`test(` at column 1 gives `4:1`. A second module instance of the file declares its tests at the same sites, one depth down. An
honest subtest named as its parent sits at another column; two honest tests of one name sit on other lines. A probe of this item
(`logs/probe-loc.out`, sha256 `9ee21595`) shows both: the second instance's `rejects` at `2:1` at nesting 0 and 1, and a subtest
`x` under `x` at `4:34` and `4:1`.

- **The reporter** (`scripts/test-counts-reporter.mjs`) keeps, per test, where it was declared, the nesting depth it was
  reported at, and its own name: `site` (`:16`) gives `[ "<line>:<column>", depth, name ]`, or `null` for the site when the runner
  gives none; the loop keeps it for each test it counts (`:24`, the same condition as the count at `:21`, named `counted` at `:15`);
  the run gains `sites`, after the written fields, in the order reported (`:26`). The run of a file now reads
  `{ tests, summary, names, foreign?, sites }`.
- **The record check** (`scripts/test-count-floor.mjs`) refuses a file in which one site, under one name, is reported at two
  nesting depths: `depths` (`:62-70`), hoisted as `twice` is. The message names the count:
  `test/b.test.ts: 3 of its declaration site(s) reported at two nesting depths under one name: the file runs twice in its own
  process, the second time inside a test or a suite (it imports itself, e.g. with a query string, from a test body)`.
  - One problem per file, the first that applies (`:20`): no report of its own, then foreign, then a repeated full name
    (`block`, `:21-25`, the follow-up's rules unchanged), then a site at two depths. A top-level self-import keeps the repeat
    message: its sites are the same, at one depth.
  - A test whose site is `null` is at no depth (`:67`): a runner that sets no `line` cannot fire the rule, and the fallback of the
    follow-up applies there as before.
  - A run without `sites` (an older reporter's) has none to read (`:64`); `sites` of another shape than one `[site, depth, name]`
    per test are refused as not a run of the reporter (`:63`, `:65`). `readRun` is unchanged (`:13-17`): the gate's own tests
    build runs without sites.
- Every line that a killer pins in the two scripts keeps its text and its number (`scripts/test-counts-reporter.mjs:13`, `:20-23`,
  `:25`; `scripts/test-count-floor.mjs:14-16`, `:22-24`, `:29`, `:35`, `:37`, `:39`, `:48`, `:54`): the `of` helper of the reporter
  folds into one line to make room for `counted` and `site`, the site is kept on the loop's closing line, and `runProblems` moves
  above `block` as a one-line wrapper.

Over the full test:main at the trunk, with the reviewer's probe reporter beside the repository's, the rule fires on 0 of 305 files
(the trunk has grown from the 301 files the review measured; `logs/site-probe-suite-trunk.json`, sha256 `575ff079`; so does the
looser rule, one site under two full names). On the open cases, the probe fires on the file's declarations: 3 sites in
NEST-SELF-TEST (`rejects an empty input` at `2:1`, `formats a date` at `3:1`, `x` at `4:1`, each at the depths 0 and 1), 2 in
NEST-SELF-DESCRIBE (a suite is not a test), and 0 in the control. The three outputs are byte-identical to the review's
(`logs/probe-NEST-SELF-TEST.json` `02aae1dd`, `logs/probe-NEST-SELF-DESCRIBE.json` `d969be28`,
`logs/probe-NEST-SELF-TEST-CONTROL.json` `5a5a0681`).

## 3. Tests first, and killers

In `test/test-count-floor.test.ts`, two tests, and the earlier cases carry the sites:

- T12 (`:225`) works on events that carry `line`, `column` and `nesting`. In `x.test.ts`, a test `n` at `3:1` is reported at
  nesting 0, then again at nesting 1 under `holder`: the run keeps `[["3:1", 0, "n"], ["3:1", 1, "n"], ["5:1", 0, "holder"]]`,
  and P1 names the file with one site. In `y.test.ts`, a subtest `x` under `x` at `4:34` and `4:1`, and a test `m` without a site at
  two depths: nothing. Six shapes of `sites` other than one entry per test are named; a run without `sites` and a `null` site read
  as nothing; a file with `foreign`, then one with a repeated name, each keeps its own message.
- T13 (`:253`) is a real run in a fresh temporary directory: `b.test.mjs` imports itself from the body of its test `x`,
  `d.test.mjs` from the body of its suite `y`, and `e.test.mjs` is the control with a subtest named as its parent. The run exits 0;
  `b` has 6 tests under names that repeat none, nothing foreign, and the same three sites at the depths 0 and 1; `d` has `one` at
  `2:1` twice; `e`'s sites differ. P1 names `b` (3 sites) and `d` (1), not `e`; `write` exits 1 and writes nothing. The names
  written stay distinct once case is folded.
- T1, T2, T8, T9, T10 and T11 expect `sites` in their runs: `null` on events that name no site; `1:1` for the test the runner
  reports under a file's name when its process ends at load; the column of a subtest's call.
- Killer lines: `:215-224` for T12 (the reporter's site, depth and `sites` field; the wrapper, the older-run exit, the two shape
  checks, the `null` site, the set of depths and the threshold) and `:250-252` for T13 (the column in the site, the `sites` field
  of a new file entry, the refusal). The trunk's guard reads every killer line (`test/killer-lines.test.ts`, green). The killer on
  the `sites` field first emptied it: the reporter then could not run, the test went red by a `TypeError` and not by an assertion,
  and the mutation tool held it inconclusive. It now prefills one entry (`:251`), and T13 fails by assertion.

Red before, green after. The repository's proof tool (`scripts/red-proof.mjs`, base `0cae9706`, gel the worktree) judges 8 tests,
each F2P: red at the base by `ERR_ASSERTION`, green at the fix; T3 unchanged (`red-proof/RED-PROOF.json`, sha256 `e576ac6e`;
`base.tap` holds the eight `not ok`). The reviewer's reproduction script, unchanged, on the fixed scripts: 0 cases open, the
three open ones refused by `write` and by the check with the site message, the control and the four closed ones as before
(`logs/nest-repro-fix.out`, sha256 `572858e1`).

## 4. Measures

Each run offline, with 0 refused attempts in every log. Evidence is kept in the scratchpad folder `nested-self/`.

| Measure | Result | Log, sha256 prefix |
|---|---|---|
| the review's reproduction at the trunk's scripts, then at the fix | 3 open, then 0 open | `logs/nest-repro-trunk.out`, `1e0a19ab`; `logs/nest-repro-fix.out`, `572858e1` |
| Node's `line:column` on a nested self-import and on a subtest named as its parent | the same site one depth down; another column | `logs/probe-loc.out`, `9ee21595` |
| the probe reporter over test:main at `0cae9706` (host lock) | 305 files, 0 with a site at two depths, 0 with a site under two full names | `logs/site-probe-suite-trunk.json`, `575ff079`; `logs/site-probe-suite-trunk.log`, `4fcafc22` |
| the probe on the three cases | 3 sites, 2 sites, 0; byte-identical to the review's | `logs/probe-NEST-SELF-TEST.json`, `02aae1dd`; `-DESCRIBE`, `d969be28`; `-CONTROL`, `5a5a0681` |
| the test file at the fix | 9 of 9 green | `logs/green-fix.tap`, `4c7ea005` |
| red-proof, base `0cae9706` | 8 judged, 8 F2P, 1 unchanged, ok | `red-proof/RED-PROOF.json`, `e576ac6e`; `logs/red-proof.log`, `5d64ad17` |
| `npm run test:main` at the fix (host lock) | 3123 tests, 3101 pass, 0 fail, 22 skipped; in the run, 305 files, 0 without a summary, 0 `foreign`, each test with a site, 0 `null` sites | `logs/test-main-fix.log`, `30f9aaac`; `logs/run-fix-stats.log`, `7d142182` |
| `write`, then `git status` | 305 files, 3123 tests; the two records gain T12 and T13 only (`test/test-count-floor.test.ts`, 7 to 9) | `logs/write-fix.log`, `34a2f799` |
| the count check against `0cae9706` | exit 0, `test counts: 305 files, 3123 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base 0cae9706285a, each name gone with its line in test/test-count-removals.json` | `logs/count-check.log`, `92085f96` |
| killer campaign (`scripts/mutants/run.mjs --killers`, base `0cae9706`, `--file test/test-count-floor.test.ts`; the file's 45 killer lines) | 44 of 45 killed, each strict, its named test; K44 (the `sites` field, its first form) inconclusive: a `TypeError`, no assertion; baseline `BASELINE l.0 - vert (0 rouge(s), 372 vert(s), 40350 ms) restaure OK ; unmutated` | `killers/RESULTS.json`, `dd73cc9c`; `logs/killers.log`, `e772bad3` |
| the same on K44 alone, re-formed (`--only K44`) | killed, strict, by its named test T13: 45 of 45 in all | `killers-k44/RESULTS.json`, `b1c15077`; `logs/killers-k44.log`, `ec1d91e1` |
| the test file and the trunk's killer-line guard after the re-form; anchors again | 10 of 10 green; 2077 anchored, 0 drifted, 0 lost | `logs/green-fix2.tap`, `ef8e4264`; `logs/anchors2.log`, `47258611` |
| anchors, `verifie-ancres.mjs` on the whole tree, `--ref 0cae9706`; the trunk's killer-line guard | 2077 killers, 2077 anchored, 0 drifted, 0 lost; green | `logs/anchors.log`, `47258611`; `logs/killer-lines.tap`, `bf0a3f7b` |
| tsc, eslint on the test file, gate:vocab, lang:gate, lint:ratchet, export:check, winlint, `git diff --check`, on the tree with this note in place | each exit 0 | `logs/gates.log`, `b4df34f7` |
| size in CI form (the job's pin, then its `STAT=` line in bash, base `0cae9706`) | 5 files, 124 insertions, 43 deletions: W = 167, under 1,205 | `logs/size-ci.log`, `cc6c6a28` |
| r1scan on what the push carries | run on the push, after this note is committed: its log is named in the report | `logs/r1scan.log` |
| the test file with the case-folding git wrapper first in PATH; T13's fixture tree | 9 pass, 0 fail; 0 case-only collision | `logs/casefold-run.tap`, `8e65306c`; `logs/casefold-t13.log`, `0a111806` |

## 5. Not verified

- Windows. T13 runs two self-imports on NTFS; its three file names and the names of its tests stay distinct once case is folded,
  which the wrapper and the tree check hold on Linux only.
- The CI run: no pull request is opened by this item.
- Node versions other than 24.21.0. The version that first sets `line` and `column` on test events was not looked up offline. On a
  runner that sets none, every site is `null` and the rule cannot fire; the follow-up's rules apply there as before.
- A file whose second instance is loaded by another file inside a test body is foreign, as the review measured (NEST-OTHER-TEST);
  a second instance loaded from a module that declares no test, inside a test, was not tried.
- A test declared through a helper, so that two tests of one name share one site at one depth, is not refused (the review's
  HELPER-TABLE-TOP-AND-T, HELPER-TABLE-TWO-SUITES, LOOP-ONE-SITE); two of its full names would repeat only if they share the holders.
- Two honest files are refused by the rule, with its message, though neither imports itself (the review's HELPER-TABLE-TWO-DEPTHS
  and RECURSIVE-SUBTEST): a data-table helper called once at the top level and once inside a suite declares one site, one name, at
  the depths 0 and 1; a test that declares a subtest of itself at one site, recursively, reports that site at the depths 1, 2, 3.
  No real file of the suite does either (305 at the base, 306 with the trunk merged). The message names both forms beside the
  self-import; the fix for such a file is to declare each test once (a loop at one site and one depth, or two suites each with
  their own site, are not refused).
- Two deliberate self-imports from a test body pass the rule (the review's RENAMED-SECOND and BRANCHED-SECOND): a second instance
  whose leaf names are computed from its own URL (3 tests become 6), and one that declares other tests from a branch on its URL
  (other sites; 3 become 5). The item's origin foresaw the computed names (`docs/G0-lot-test-count-names-followup-1.md`, section 10, not-verified list); a site
  rule reads the events, not the source, so it cannot see such a branch. The module hook of the next bullet is the answer to both.
- The sturdier option the review named, a module hook preloaded in each test process that refuses a test file loaded under a
  query or a fragment or from another test file, lies outside this zone (it changes test:main in `package.json`).

## 6. Changelog

- 2026-10-14: built (this note).
- 2026-10-14: after the first review: the message of the depth rule names the helper form beside the self-import and says
  `more than one nesting depth`; section 5 names the two honest files the rule refuses and the two self-import forms it passes.
- 2026-10-14: after the second review: the message also names the recursive subtest; section 5 carries the measures of the two
  forms that pass.
