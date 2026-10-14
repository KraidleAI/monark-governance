# G0 — TEST-COUNT-NAMES-1: the test count gate holds the names of the tests; each test gone from a file is declared by its name, and each declaration names its pull request

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), the author instance of TEST-COUNT-NAMES-1, distinct from the authors and
  reviewers of #250 and #256. 2026-10-08, the clock read by `date -u`: 20:51 UTC at the start, the trunk read at 20:52 and 21:38 UTC,
  the measures from 21:02 to 21:36 UTC, this note from 21:40 UTC.
- **Demand**: MONARK `cd7cccc` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-256-fusion.md`), C-1 of the
  checkpoint-2 of #256, formed in ETAT (`docs/ETAT.md:1201-1204`): the gate counts numbers, not names; a test renamed, or emptied, in
  the same file passes, and the reason of a removal line is held only not empty. The construction it names: the record carries the
  names, or a digest of them, per file. The finding is note n-1 of RECHERCHES' review of #256 (recherches `ef02eaf`,
  `coordination/pieces/2026-10-08-g2-256-tcf-gate/G2-256-tcf-gate.json`), written in §12 of PR-2's note
  (`docs/G0-lot-test-count-floor-1b.md:251-253`) and named a blind spot by PR-1's (`docs/G0-lot-test-count-floor-1.md:361`).
- **Carrier, estimate and trigger**: RECHERCHES took the item (recherches `eec97be`) with an estimate that this note measures: a digest
  of the names beside each count, about 150 lines in all (about 90 of code, 60 of tests), built after the KATA killers change and at
  the latest on 2026-10-10.
- **The design it changes**: PR-1's note (`docs/G0-lot-test-count-floor-1.md`: the reporter, `write`, the record, the list) and PR-2's
  (`docs/G0-lot-test-count-floor-1b.md`: the gate as built). PR-1's note set names aside (`docs/G0-lot-test-count-floor-1.md:801`):
  « The names of the tests instead of their number: each rename of a test would become a removal line. » This note keeps that cost,
  prices it (§6), and gives a rename a line of its own.
- **Base**: trunk `lot/etude-suite` = `52ddf000` ("Docs: the evening of 8 October, merges up to 256, …"; explicit refspec, `ls-remote`
  at 20:52 and 21:38 UTC), whose gate is #256's merge `92d01d67`. **The `file:line` addresses below hold at `52ddf000`.**
- **Zone of the change** (planned; amended for MONARK's answers): in place, `scripts/test-counts-reporter.mjs`,
  `scripts/test-count-floor.mjs`, `scripts/test-count-check.mjs` and their three `.d.mts` files, `test/test-count-floor.test.ts`,
  `test/test-count-check.test.ts`, and `test/test-counts.json` (by `write`); new, `test/test-names.json` (by `write`) and this note. With
  Q-1 (b), MONARK's three files, each written in this change and reread by MONARK word for word at the merge: the `STAT=` line of
  `.github/workflows/ci.yml`, test 38 of `test/ci-gates.test.ts`, and one dated line under D9 of `docs/adr/ADR-M003-phase2-integration.md`.
  Unchanged: `package.json`, `scripts/export-public.mjs`, the oracle, `VIBEGATES_PR_LIMIT`, and `test/test-count-removals.json` (`[]`).
- **MONARK's answers** (recherches `e6ebb72`, `coordination/messages/2026-10-09-MONARK-vers-RECHERCHES-levee-pause.md`), which bind the
  build and amend this note in place:
  - **Q-1 = (b)**: both records leave the R-25 count, on five conditions: (1) two exact paths, no glob, `test/test-counts.json` and
    `test/test-names.json`; (2) `test/test-count-removals.json` stays counted, its reasons being written by hand; (3) the pin of test 38 of
    `test/ci-gates.test.ts` holds exactly these two exclusions and reddens if a third appears or one is missing; (4) the names record has
    one name per line; (5) `VIBEGATES_PR_LIMIT` does not change. MONARK's reason: like the series of D9 sexies, these are data files that
    nothing writes by hand, and the gate holds them more strongly than a digest, since each must equal the run and be in its written form.
  - **Q-2 = yes**: REPORTER-REALPATH-1 is folded in, with T8. **Q-3 = yes**: the reason `#<n>: ` then three words or more, and in CI the
    pull request's own number.
  - **Q-4**: after KATA-KILLERS-ASSERT-1, at the latest on 2026-10-10. That date was missed: the session reached its weekly usage limit on
    2026-10-09 and stayed idle until 2026-10-14. The build runs on 2026-10-14, beside KATA-KILLERS-ASSERT-1 on disjoint files (the zone rule
    of MONARK `6005b0f`; this change's files are declared in recherches `coordination/ZONES.md`), on the trunk head that MONARK announced
    in `f3153f3`, `5ebd9267`, merged into this branch first.
  - Test 38 is the test's label (`ci_gates_blocking_no_continue_on_error — blocking and pinned workflow (test 38)`,
    `test/ci-gates.test.ts:116` at `5ebd9267`), the first test of the file; MONARK's message took the number from this note.
- **Series bytes**: none opened. The suites read the repository's fixtures as the CI does; only test names and counts are reported.
- **Measurement host**: Linux, 4 cores, Node v24.21.0, npm 11.19.0. Each full suite ran under the shared host lock, and every run under
  `offline.mjs --no-egress`: 0 refused attempts in every log.
- **This run is the design note alone.** No test or code is committed. A throwaway prototype (a detached worktree, never pushed)
  measured the price and played the design (§11).

## 0. In short

- **The hole, at the trunk** (§1): on a git fixture shaped like the gate's own test T5, a test renamed, a test deleted with an empty
  test of another name added, and a test whose body is emptied each pass the gate as the CI launches it (exit 0, the record unchanged).
  A removal line whose reason is the hint's own `"..."`, or names another pull request, passes too.
- **The names, measured** (§2): 2 968 tests in 290 files. A test's full name is the names of the tests and suites that hold it, then
  its own, joined by `" > "`. No full name repeats in its file, and the names are the same, byte for byte, in two runs.
- **The construction** (§3): the reporter writes each file's names; `write` writes them to a **second record, `test/test-names.json`,
  one name per line** (Q-1 (b); planned at one line per file before MONARK's answer), beside `test/test-counts.json`, which keeps its form. The gate holds the run to it (P2, P3). **Once the base
  carries it, the gate holds each name gone from a file since the base to exactly one line**: `{file, removed, reason}`,
  `{file, renamed, to, reason}` (where `to` is a name the file gained), or, for a whole file gone, today's `{file, from, to: 0, reason}`.
  A base without the names record (this change's own base) is judged by counts, as today.
- **The reason** (§3.5): `#<pull request>: ` followed by at least three words; in CI, the number must be the pull request's own
  (`GITHUB_REF`). The hint's placeholder cannot pass.
- **Tests** (§4): T1, T2, T4 and T5 change in place, T7 and T8 are new (Q-2: yes), and test 38 of `test/ci-gates.test.ts` pins the
  two exclusions (Q-1 (b)). Each is red at the trunk by an assertion, and no
  test imports an export the trunk lacks.
- **Size** (§5): with Q-1 (b), chosen by MONARK, **about 210 lines in CI form**, the two records out of the count. As planned before
  the answer: **about 500 lines in CI form**, 292 of them the new record. The prototype measures 414 for the code and the record,
  and the tests are estimated at about 85. That is under 547, with a thin margin. **It is about 210 if the two records leave the R-25
  count** (Q-1). Against the estimate of about 150 given when the item was taken, the code and the tests come to about 205, and the
  record is the rest.
- **Each later pull request** (§6): a file whose names change has its line rewritten by `write`; a rename or a removal adds one line
  to the list. Over the last 60 merges of the trunk, one pull request lost a title (a rename) and 46 added some.
- **Questions** (§10): Q-1 the size (one change; the two records out of the R-25 count; or two changes), Q-2 REPORTER-REALPATH-1
  folded in, Q-3 the reason bound to the pull request's own number, Q-4 the trigger.

## 1. Base and need: the hole, proved at the trunk

The proof (`tools/base-proof.mjs`, outside the repository) builds a throwaway git repository shaped like T5
(`test/test-count-check.test.ts:52-108`). The base commits two files of real tests (3 and 2 tests), the record that `write` writes from
a real `node --test` run through the trunk's reporter (by its `file:` URL, with `spec` beside it, as `test:main` loads them), and `[]`.
Each case commits its change above the base, as in the merge commit the CI checks out, runs the suite and `write` again, then
launches the trunk's gate as the job does (`GITHUB_BASE_REF=trunk`, every other base variable removed). Under `offline.mjs --no-egress`,
with 0 refused:

| Case | Change in `test/a.test.mjs` | The record | Gate |
|---|---|---|---|
| R | "refuses a negative amount" renamed "refuses an amount below zero", body unchanged | unchanged | **exit 0** |
| E | "keeps the order of the lines" deleted; `test("keeps the order of the lines, kept", () => {})` added | unchanged | **exit 0** |
| B | the body of "adds two numbers" emptied, its name kept | unchanged | **exit 0** |
| D0 | "keeps the order of the lines" deleted, no line | 3 → 2 | exit 1: `wants one line {"file":"test/a.test.mjs","from":3,"to":2,"reason":"..."}` (the fixture is live) |
| D1 | the same deletion, its line with the hint's reason `"..."` | 3 → 2 | **exit 0** |
| D2 | the same, reason `#999: removed by another pull request` | 3 → 2 | **exit 0** |
| D3 | the same, reason `" "` | 3 → 2 | exit 1: `is not a line {file, from, to, reason} with from > to >= 0 and a reason` |

Cases R, E, B, D1 and D2 are the hole. The gate compares counts (`scripts/test-count-check.mjs:17-20`) and wants only a reason that is
not empty (`scripts/test-count-check.mjs:23`). The log is `logs/base-proof.log`, sha256
`1715648a30085f5328be7b3a81736f88b0fff264164bdc3499affc728d41e4e8`.

**The current code does not do it** (MONARK's rule of `eea4990`): neither the reporter (`scripts/test-counts-reporter.mjs:15-16`:
counts and summaries only) nor `write` (`scripts/test-count-floor.mjs:36`) nor the gate reads a name. Code must change.

## 2. What the names are (measured at the trunk)

- **The events** (a probe of Node 24.21.0, outside the repository): each `test:pass` and `test:fail` carries the test's own name and
  its `nesting`. The names of its parents come from the `test:start` events at lower nesting. Those arrive in the order the tests are
  defined, as the passes do, even under `concurrency: true` (a slow subtest declared before a fast one is reported first). A `describe`
  reports as kind `suite`: its name enters the path, but it is not a test. Two tests with one name are two events. `skip` and `todo`
  tests carry their names. A file that ends before it reports is one test named by its path, which P1 refuses. A leaf name may itself
  hold `" > "`.
- **The suite, run twice** (`test:main` with a third, probing reporter, launched through `sh -c` as npm does; 21:02-21:07 and
  21:11-21:16 UTC): 2 968 tests, 2 946 pass, 0 failures, 22 skipped, exit 0. The trunk's gate is green on the run
  (`--base origin/lot/etude-suite`: 290 files, 2 968 tests, 0 drop), and the probe agrees with the counts reporter in all 290 files.
- **The full names**: 2 956 tests at nesting 0, 12 at nesting 1, none deeper, and no `describe` in the globs. **No full name repeats
  in its file.** 500 names hold a character outside ASCII (dashes, arrows); none holds U+2028, U+2029 or a control character. Two
  top-level names hold `" > "` in their prose. Lengths: median 52, mean 79, longest 698.
- **Stability**: the probe's output is the same file in both runs (sha256 `4fa34831…`), and so are the two runs of the counts reporter
  (`87ff9ee0…`). Statically, a single title is built at run time (`test/mission-lint.test.ts:215`), from a constant list (l.205-209);
  no other `test(`, `it(` or `t.test(` call in the globs takes a variable title. Titles that name a platform name it in literal prose,
  and the platform skips sit on leaves, which keep their names.
- **Address literals**: the address gate's own `literals`, run over the 2 968 names, finds 2, both in `EXEMPT`
  (`scripts/address-literals.mjs:17-25`), and none outside it.

## 3. Construction

### 3.1 The reporter (`scripts/test-counts-reporter.mjs`, in place)

A new map keeps, per file, the names of the tests started at each depth: each `test:start` cuts the file's list at its `nesting` and
appends its name. Each test's event (l.15) adds to its file's names that list cut at its own nesting, followed by its name, all joined
by `" > "`. The output (l.18) writes `{ tests, summary, names }` per file: `tests` is the number of names, and the names are sorted in
UTF-16 order, as the files are. The four header lines are rewritten in plain English with no internal name, since the file is exported
(`scripts/export-public.mjs:77`; note n-3 of the review of #250). l.15 and l.16 keep, on the same lines, the texts that T1's three
killers name, so those killers stay anchored. The mirror's CI writes a larger run file, which nothing reads there.

### 3.2 `write` and the names record (`scripts/test-count-floor.mjs`, in place)

- `NAMES = "test/test-names.json"` joins `RUN` and `RECORD` (l.10). `readRun` (l.13-17) also wants, per file, `names`: strings, as many
  as `tests`. A run without names (from an older reporter) is unreadable: exit 4.
- `write` writes `test/test-counts.json` as today and, from the same run, `test/test-names.json` in its written form, `namesText`: one
  name per line (Q-1 (b); planned at one file per line before MONARK's answer), the files sorted and each file's names sorted, and U+2028 and U+2029 escaped as `\u2028` and `\u2029`. JSON leaves
  those two characters raw, JavaScript ends a line at them, and R-25 refuses a file that holds one
  (`scripts/lot-size-integration.mjs:228`). `test/test-counts.json` keeps its form and its lines, so P2, P4, their killers, MONARK's
  comparisons and the fallback tool read it as they do now.
- **Why a second file**: putting the names, or a digest, on the lines of `test/test-counts.json` rewrites each of its 290 lines once,
  about 580 lines in CI form, above 547 on its own. A second file adds 292 lines and changes none.
- **Why one line per file** (the plan under (a); MONARK chose (b), where the record leaves the count and holds one name per line): one name per line makes 3 550 lines (266 267 bytes), above the CI bound of 1 205 on its own. One line per
  file makes 292 lines (256 783 bytes; the longest line is 21 367 bytes, and 27 lines pass 2 000 bytes). R-25 admits long lines in a
  `.json` file that parses (`scripts/lot-size-integration.mjs:229`, l.235-238).
- **Why names, not a digest** (the item was taken with a digest in mind, `eec97be`): a digest per file is also 292 lines (17 287
  bytes), but it cannot give the base's names, so the red line could not say which test went. The names are public, and the record is
  internal (root `test/`, never exported).

### 3.3 The gate (`scripts/test-count-check.mjs`)

- **P2 on names** (`recordProblems`, l.17-20, gains the names record): in each file, the run's names equal the record's, as multisets.
  Otherwise: `::error::<f>: run and test/test-names.json differ: run only [...], recorded only [...]`, with the exact names on each side.
- **P3 on names**: `test/test-names.json` is the text `namesText` writes from it. Otherwise:
  `::error::test/test-names.json: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`.
- **P4 by names, once the base carries `test/test-names.json`** (`dropProblems`, l.27-38, gains `{ base, head, pr }`). In each file,
  the base's names that the head lacks are **gone**, and the names the head adds are **gained**, both counted as multisets (a repeated
  name counts each time). Each gone name takes exactly one line added since the base, and a line that matches nothing gone is refused.
  P4 by names replaces P4 by counts, since a drop in a count implies as many names gone.
- **A base without names**: the base's names record is read like the record and the list, at the merge base (l.50-52). Absent, it is
  `null`, and P4 judges counts, as today. Present but malformed, it is exit 4.
- **The hint** names the exact line to add: `{"file":"<f>","removed":"<name>","reason":"#<pull request>: ..."}`. When the file lost one
  name and gained one, it offers `{"file":"<f>","renamed":"<name>","to":"<gained>","reason":"…"}` instead, and it lists the names the
  file gained. For a file entirely gone, it offers the file's single line `{"file":"<f>","from":<n>,"to":0,"reason":"…"}` (the
  prototype offers one removal line per name there; both forms are accepted). In CI the hint writes the pull request's number.

### 3.4 The lines of the list (`test/test-count-removals.json`, the same file)

| Line | Declares | The gate checks |
|---|---|---|
| `{file, removed, reason}` | the test `removed` of `file` is gone | `removed` is a name gone from `file` |
| `{file, renamed, to, reason}` | the test `renamed` of `file` is now `to` | `renamed` is gone from `file`; `to` is a name `file` gained; each gained name is the `to` of one line at most |
| `{file, from, to: 0, reason}` | the whole `file` is gone (today's shape) | `file` is not in the head's names record, and `from` is its number of names at the base |

- **A rename has a line of its own.** Two alternatives were weighed: a removal line with the new name in its reason (Q-6's rule for
  files, `docs/G0-lot-test-count-floor-1.md:206-210`), or a separate rename list. A line of its own lets the gate check `to` against the
  head, so a rename cannot hide a deletion. It also keeps renames apart from removals in the register, and it is one file to read. A
  test moved to another file takes a removal line in its old file, and its new name enters the record (Q-6's rule for files, kept for
  tests).
- **The list only grows**, as today: the base's lines stay, once each, as the same text (l.28-30), whatever their shape or reason.
  Count-shaped lines that a pull request merged before this change adds stay valid as base lines.
- **What names do not see**: a test whose body is emptied while its name is kept (case B), and a test replaced by an empty one but
  declared as a rename (case E, with the line the hint offers). The gate holds names, not bodies: the review reads the diff and the
  reason, and the killer campaign holds the bodies.

### 3.5 The reason

Today the reason is held only not empty (l.23). The proposal, for each **added** line, whatever its shape and whatever the base:

- it starts with the number of a pull request, `#<n>: `, then says why in **three words or more** (separated by whitespace). This
  refuses `"..."`, the hint's own placeholder (`#<pull request>: ...`), `#270: removed`, and `removed on purpose`;
- **in CI** (`GITHUB_REF` = `refs/pull/<n>/merge`), `<n>` must be the pull request's own, so a line naming another pull request is
  refused. That closes the second case of n-1. Outside CI (the oracle, which removes every `GITHUB_*` variable, or a local run), only the
  form is held.

The gate cannot tell a true reason from a false one: the form makes the line traceable, and the review reads its truth. The trade-offs
are Q-3. The pull request must exist before its line is written, so its first push may be red; the CI's hint then carries the number.
A line for a test removed by a direct commit to the trunk has no pull request of its own: the oracle holds only the form, and the rule
of Q-12 of PR-1's note stands.

### 3.6 Exits and error lines

The exit codes do not change.

- **`write`**: 0, with `test/test-counts.json and test/test-names.json: N files, M tests`; 1, P1 as today; 2, the usage; 4, the run
  unreadable, which now includes a run without names (`not a run of the reporter, { "<file>": { tests, summary, names } }`).
- **The gate**:
  - 0, with `test counts: N files, M tests, equal to test/test-counts.json and test/test-names.json; D drop(s) from the base <sha>, each
    name gone with its line in test/test-count-removals.json` (or `judged by counts (no names at the base)`).
  - 2 (the usage) and 3 (no base), as today.
  - 4, an input unreadable, which now includes `test/test-names.json not readable: …` at the head (absent, or not
    `{ "<file>": [names] }`) and at the base (present but malformed).
  - 1, one `::error::` line per problem. P1, P2 by counts and P3 of the record are as today, and P2 and P3 on names are in §3.3. With
    names at the base, the lines below can also appear. With no names at the base, the count lines are as today, except that the hint's
    reason becomes `#<pull request>: ...`.

```
<f>: the test "<name>" is gone since the base: wants one line {"file":"<f>","removed":"<name>","reason":"#<pull request>: ..."} in test/test-count-removals.json[; tests <f> gained: [...]]
test/test-count-removals.json: <line> names no test gone from <f> since the base
test/test-count-removals.json: <line>: "<to>" is no test that <f> gained since the base
test/test-count-removals.json: <line> names no file gone since the base, at its count
test/test-count-removals.json: <line> is not a line {file, from, to, reason} with from > to >= 0 (to 0: a file gone), {file, removed, reason} or {file, renamed, to, reason}, and a reason "#<pull request>: <why, in three words or more>"[ naming #<n>]
test/test-count-removals.json: K line(s) of the base changed or removed; the list only grows
```

### 3.7 Backward compatibility and the first write

- The trunk's record has no names, and no base carries `test/test-names.json` before this change. The change's own CI therefore
  judges P4 by counts against the trunk (no drop is expected), and P2 and P3 on both records of its own tree.
- **The first write**: on the change's tree merged with the trunk of the moment, `npm run test:main && node
  scripts/test-count-floor.mjs write` writes `test/test-names.json` once, for every file of the run (292 lines at `52ddf000`). It also
  rewrites the count lines of the files that the change's own tests change. If the trunk moves before the merge: a plain merge, then
  `write` again on the merge (as #250 and #256 did).
- **This change's own CI must be green in the new form**: `g3-test-count` runs the change's gate on the merge, with the new reporter,
  against the trunk. On the prototype at `52ddf000` (§11), `write` gives 290 files and 2 968 tests, `test/test-counts.json` is
  unchanged, and the gate is green, judged by counts.
- After the merge, every base carries names, so every later pull request is judged by names.

## 4. Tests red first, and killers

Two rules of red-proof shape the tests (`scripts/red-proof.mjs:185-187`): a test counts as red at the base only through an assertion
failure, and an import that fails on a module present at the base is refused. So **no test imports an export the trunk lacks**
(`NAMES`, `namesText`). The tests reach the new code through the exports the trunk has (`readRun`, `recordProblems`, `dropProblems`,
the reporter), through the command lines, and through literal paths. Each existing test whose body changes gains an assertion of the new
behaviour, so that it is red at the trunk by an assertion. On the prototype, the code alone reddens exactly T1, T2, T4, T5 and
`every_killer_line_is_readable`: those are the tests that T changes in place.

| Test | What it asserts | Red at the trunk because |
|---|---|---|
| T1 `test_counts_reporter_counts_each_test_of_each_file` (`test/test-count-floor.test.ts:22`, in place) | The reporter on events: each file's names, sorted; a parent's and a suite's names before a test's, joined by `" > "`; a suite is not a name; a repeated name is kept twice; skipped and todo tests are named. `readRun` refuses a file without names, or one whose number of names differs from its tests | the trunk's reporter writes no names, and its `readRun` accepts a run without them (the `deepEqual` and the `throws`) |
| T2 `test_count_floor_refuses_a_file_whose_process_ended_before_it_reported` (`test/test-count-floor.test.ts:40`, in place) | A real nested run whose file holds a parent and a subtest names `parent > child`. On a sound run, `write` writes `test/test-names.json` as the literal text expected, with a name holding U+2028 escaped | the trunk's `write` writes no names file (asserted by `existsSync` before any read) |
| T4 `test_count_check_holds_the_run_to_the_record_and_each_drop_to_its_line` (`test/test-count-check.test.ts:20`, in place) | The reason: `removed on purpose`, `#<pull request>: ...` and `#12: removed` are refused; under `pr` 12, `#13: …` is refused and `#12: …` accepted. Its other cases use reasons of that form | the trunk accepts any reason that is not empty |
| T5 `test_count_check_names_its_base_or_refuses` (`test/test-count-check.test.ts:52`, in place) | The command line on its fixture, now with runs that carry names and a base that commits both records: a rename above the base gives exit 1 and the exact rename line; with that line, 0; with `GITHUB_REF=refs/pull/7/merge`, the hint names `#7`; the names record out of its form, 1; the head without it, 4; a base without it is judged by counts | the trunk's gate exits 0 on the rename |
| T7 `test_count_check_holds_each_name_gone_to_its_line` (`test/test-count-check.test.ts`, new) | P2 and P4 by names, on objects: the exact names on each side; a rename (the hint), then its line; a subtest renamed; a test replaced by an empty one; a removal line; a count line refused once the base has names; a file gone (each name wanted, then its single `{from, to: 0}` line); a `to` the file did not gain; two lines for one name; one of two equal names gone, with one line; a line for a file with nothing gone | the trunk's `recordProblems` and `dropProblems` ignore the new argument and refuse the new shapes as malformed |
| T8 `test_counts_reporter_keys_a_linked_file_by_its_real_path` (`test/test-count-floor.test.ts`, new; Q-2: yes) | A real nested run of a test file reached through a directory link (`symlinkSync(…, "junction")`: a junction under Windows, a symbolic link elsewhere) gives one key, with its two tests, its summary and its names | the trunk's reporter writes two keys (measured, §7) |

T3 and T6 do not change. **Killers** (planned; their lines are fixed at the T commit): one above each test, the others in the bodies.

```
T1  // killer: scripts/test-counts-reporter.mjs:<l> CONST ".slice(0, data.nesting), data.name].join(\" > \")" -> ".slice(0, 0), data.name].join(\" > \")"
    // killer: scripts/test-counts-reporter.mjs:<l> CONST "else if (type === \"test:start\")" -> "else if (false)"
    // killer: scripts/test-counts-reporter.mjs:<l> CONST "names: c.names.sort()" -> "names: c.names"
    // killer: scripts/test-count-floor.mjs:15 CONST " && c.names.length === c.tests" -> ""
T2  // killer: scripts/test-count-floor.mjs:<l> CONST "writeFileSync(NAMES, " -> "void ("
    // killer: scripts/test-count-floor.mjs:<l> CONST ".replace(/[\\u2028\\u2029]/g," -> ".replace(/(?!)/g,"
T4  // killer: scripts/test-count-check.mjs:<l> CONST ".trim().split(/\\s+/).length >= 3" -> ".trim().split(/\\s+/).length >= 1"
    // killer: scripts/test-count-check.mjs:<l> CONST "pr ?? \"[1-9]\\\\d*\"" -> "\"[1-9]\\\\d*\""
T5  // killer: scripts/test-count-check.mjs:<l> CONST "baseNames = atBase(" -> "baseNames = null && atBase("
    // killer: scripts/test-count-check.mjs:<l> CONST "if (ntext !== namesText(names)) " -> "if (false) "
    // killer: scripts/test-count-check.mjs:<l> CONST "process.env.GITHUB_REF ?? \"\"" -> "\"\""
T7  // killer: scripts/test-count-check.mjs:<l> CONST "gone.splice(i, 1); " -> ""
    // killer: scripts/test-count-check.mjs:<l> CONST "r.renamed !== undefined && j < 0" -> "false"
    // killer: scripts/test-count-check.mjs:<l> CONST "head[f] === undefined && " -> ""
    // killer: scripts/test-count-check.mjs:<l> CONST "left.splice(i, 1); return false;" -> "return false;"
    // killer: scripts/test-count-check.mjs:<l> CONST "names === undefined ? [] :" -> "true ? [] :"
T8  // killer: scripts/test-counts-reporter.mjs:10 CONST "relative(real(process.cwd()), real(file))" -> "relative(process.cwd(), file)"
```

- **Anchors**: the prototype writes the new code where it reads best, and so moves 26 of the 28 killers of
  `test/test-count-check.test.ts` off their lines. Over the 39 killers of the two files, `verifie-ancres.mjs` reads 11 ANCRE, 2 DERIVE
  and 26 PERDU: 52 lines of churn. The build therefore writes the new code after the module's present functions and edits the killed
  lines in place. Then only the killers whose text changes by design are rewritten: the reason's (l.23), possibly the four-key rule's
  (l.22), and P2's call in the gate (l.56).
- **Fixtures**: no two paths equal once case is folded; the atelier's casefold wrapper runs T2, T5, T7 and T8 before the merge request.

## 5. Size (R-25, CI form) and the test count

The measure uses the pathspec of the size job (`.github/workflows/ci.yml:100`, `docs/**/*.md` excluded) on the prototype committed
above `52ddf000` (never pushed): **6 files, 379 insertions, 35 deletions, 414 lines**. `lot-size-integration.mjs pin` refuses no path
(§11).

| File | How | Lines |
|---|---|---|
| `test/test-names.json` (new) | measured: `write` on the trunk's run, 290 files | 292 |
| `scripts/test-count-check.mjs` | measured on the prototype (+52 −12); a few lines fewer in place | 64 |
| `scripts/test-count-floor.mjs` | measured (+19 −11), header rewritten | 30 |
| `scripts/test-counts-reporter.mjs` | measured (+9 −7) | 16 |
| the two `.d.mts` files | measured (+3 −2 and +4 −3) | 12 |
| `test/test-count-check.test.ts` | estimated: T4 and T5 in place, T7 new, three killers rewritten | ≈ 60 |
| `test/test-count-floor.test.ts` | estimated: T1 and T2 in place | ≈ 25 |
| `test/test-counts.json` | `test/test-count-check.test.ts` 3 → 4 | 2 |
| **Total** | 414 measured, ≈ 87 estimated | **≈ 500** |
| with Q-2 (REPORTER-REALPATH-1) | the reporter +3 −1, T8 ≈ 12, `test/test-count-floor.test.ts` 3 → 4 | ≈ +18 |

- The bound is 547 per change (1 205 in CI), so **the margin is thin**, about 45 lines; PR-2 grew 43 lines over its plan (208 → 251).
- The estimate given when the item was taken (`eec97be`: about 150, of which about 90 of code and 60 of tests) is below the code and
  the tests measured and estimated here (≈ 205: 122 and ≈ 85). The record's 292 lines were not in it: a digest beside each count was
  planned there, which on the counts record's own lines would cost about 580 (§3.2).
- **MONARK chose (b)** (`e6ebb72`). **With Q-1 (b)**, where the two records leave the R-25 count, the change is about 210 lines, and the names record can hold one name
  per line (3 550 lines, not counted), which a reviewer reads line by line.
- **The test count**: +1 test (+2 with Q-2), `test/test-count-check.test.ts` going from 3 to 4. The record of every file is written
  once, in `test/test-names.json`; `test/test-counts.json` changes on that one line only; `test/test-count-removals.json` stays `[]`,
  since no test is removed or renamed (T1, T2, T4 and T5 keep their names).

## 6. The effect on each later pull request

- A pull request whose tests gain, lose or change names runs `npm run test:main && node scripts/test-count-floor.mjs write`, as today
  when a count changes, and commits the lines both records rewrite. That is one line per file whose names change in
  `test/test-names.json` (2 lines in the size count), on top of the 2 lines of its count in `test/test-counts.json`. A file's line
  holds all its names, so the diff shows the whole line; the gate's red line and the list's line name the exact tests.
- **A rename**, which passes today with no line, now costs its line in the list (1 line, kept forever, since the list only grows) and
  its file's line in the names record (2 lines): 3 lines in all. A removal is declared by name instead of by count and also rewrites the
  names line: 5 lines instead of 3.
- **How often**: over the last 60 first-parent merges of the trunk (a static read of the diffs of the suite's test files,
  `logs/history-titles.log`), 46 added titles (245 in all) and **one lost a title**: #225 (`3d7c979e`), in
  `test/surfaces-1-1-0.test.ts`, which renamed "the 15 checks" to "the 18 checks", a title carrying a number that moved with the code.
  A title like that asks for a rename line each time its number changes.
- **The pull requests open at the merge**: as at #256's merge, each one's next run (its merge with the new trunk) runs the new gate. One
  that changed tests merges the trunk and runs `write` again; its CI names the files.
- **MONARK's direct commits** (Q-12 of PR-1's note): one that renames or removes a test writes both records and its lines. The oracle's
  gate holds them by names, with the reason in its form (§3.5).

## 7. Windows, and REPORTER-REALPATH-1

- **The names under Windows** are the same as long as no title depends on the platform. At the trunk no title is built from a platform
  value (§2), and every platform skip sits on a leaf, which keeps its name. Under Q-11 of PR-1's note, a skip on a parent or a
  `describe` would hide its tests' names under Windows, just as it hides their count. MONARK's Windows replay at the G7 runs the gate on
  the merge, so P2 by names under Windows is the parity check. The names record is written with LF, and `.gitattributes` keeps it so.
- **The keys (REPORTER-REALPATH-1)**: this is an open item of RECHERCHES, accepted by MONARK in `c11a755` (`docs/ETAT.md:908`). A test
  file reached through a junction or a symbolic link is reported under two keys: its tests at its real path, and its summary at the
  launcher's path (PR-1's note, `docs/G0-lot-test-count-floor-1.md:621-624`). `write` and the gate refuse such a run by P1, closed by
  default. The item's trigger, "after PR-2", is reached.
- **Measured again under Linux at `52ddf000`** (`logs/probe-realpath.log`): through a directory link, the trunk's reporter writes
  `lnk/a.test.mjs` with 0 tests and its summary, and `real/a.test.mjs` with 2 tests and no summary. With the cwd and the file both passed
  through `realpathSync` (two new lines, and the key of l.10 changed in place), there is one key, `real/a.test.mjs`, with 2 tests and its
  summary. The names follow the tests' events, whose file is the real path, so one key holds both.
- **Q-2**: fold REPORTER-REALPATH-1 in here (≈ +18 lines, T8), since this change rewrites the same reporter, or leave it to a change of
  its own.
- **To replay under Windows**: T8 (a junction needs no privilege), T2's nested run, the reporter's names under `cmd.exe`, and the gate on
  the merge.

## 8. Risks

- **The job's runtime**: the reporter pushes one string per test and sorts each file's names once; the gate reads a 257 KB file and
  compares at most 91 names per file (`test/l2-loop.test.ts`). That is milliseconds, against a `test:main` of about 5 minutes. No step or
  job is added.
- **Nested tests**: a test's path relies on `test:start` arriving in definition order, before the test's own event. This was measured on
  Node 24.21.0, concurrency included, and Node documents both orders. A runner that changed them would change the paths, not the counts:
  P2 by names would turn red on every run, never green by mistake. Two paths that join to the same text (a leaf name holding `" > "`)
  count as one name twice, and a change between them goes unseen.
- **Windows** (§7): a title built from a platform value, a path or a clock would make P2 red under Windows, or at every run. There is
  none at the trunk, and the gate names it the first time.
- **A pull request that only renames**: it was green without touching the records; now it is red until it runs `write` and adds its
  lines. A naming campaign of k tests costs k lines in the list, kept forever. Titles that carry a number that moves with the code
  (#225) force a rename each time.
- **The margin under 547** (§5): see Q-1.
- **A rename declared to hide a replacement**: the gate accepts a rename to any name the file gained, so a test replaced by an empty one
  and declared as a rename passes by names (case E). The reason and the review decide, and the campaign holds the bodies.
- **TEST-COUNT-SKIP-EXPORT-1** (a test turned skipped, and test 42 under `test:export`; carried by RECHERCHES; its trigger, the merge of
  PR-2, is reached): names do not see a skip. That item touches the same reporter and gate, so the two are built one after the other.

## 9. Constructions set aside

- **The names, or a digest, on the lines of `test/test-counts.json`**: every line is rewritten once, about 580 lines (§3.2).
- **A digest per file**: the red line could not name the tests gone, and it is 292 lines anyway.
- **One name per line while staying in the R-25 count**: 3 550 lines, above the CI bound on its own.
- **A rename as a removal line whose reason names the new test** (Q-6's rule for files): the new name goes unchecked, and renames mix
  with removals in the register.
- **A separate rename list**: a fourth file for the same reading.
- **Count lines kept beside name lines** (a drop declared twice): P4 by names already implies the counts.
- **Each test's body or source text in the record** (to see case B): the record would change with every edit of a test; the killer
  campaign holds bodies.

## 10. Questions for MONARK

- **Q-1, the size.** Three options:
  - (a) one change, with the names record at one line per file: about 500 lines, a thin margin under 547;
  - (b) the two records leave the R-25 count, as reproducible generated artefacts that the gate holds byte for byte. That takes a dated
    line of ADR-M003 D9, the `STAT=` line of `.github/workflows/ci.yml:100`, and the pins of test 38 in `test/ci-gates.test.ts`, all
    MONARK's files. This change is then about 210 lines, with the names one per line, and no later pull request pays record lines;
  - (c) two changes, the names record (about 370 lines) then the gate (about 130), with a window in which a rename passes unseen, as
    between #250 and #256.
  - **Proposed**: (b) if MONARK takes the exclusion, else (a). Split as (c) only if the size at the freeze passes 547.
  - **MONARK: (b)** (`e6ebb72`), on the five conditions given at the head of this note; the three files are written in this change.
- **Q-2, REPORTER-REALPATH-1** folded into this change (≈ +18 lines, T8). **Proposed: yes.** MONARK: yes, with T8 (`e6ebb72`).
- **Q-3, the reason**: the form `#<n>: ` with three words, and in CI the pull request's own number. **Proposed: both.** The alternative
  is the form alone, which leaves n-1's case of a line naming another pull request to the review. MONARK: yes, both (`e6ebb72`).
- **Q-4, the trigger**. **Proposed**: the one given when the item was taken (`eec97be`), kept: after the KATA killers change, and at
  the latest on 2026-10-10. The T commit also needs MONARK's answers to Q-1 to Q-3. TEST-COUNT-SKIP-EXPORT-1 follows this change.
  MONARK: yes, at the latest on 2026-10-10 (`e6ebb72`); that date was missed (the head of this note says why), and the build runs on
  2026-10-14.

## 11. Evidence (scratchpad folder `test-count-names-author/`, kept)

Every file's sha256 is in `SHA256SUMS.txt` (54 lines, sha256 `09f7934d3f6bd1056c37bd9d45b931083308cefa93f464446f549a87421438cf`).
Every egress log is empty: 0 refused attempts.

| Evidence | What it holds | sha256 (prefix) |
|---|---|---|
| `logs/base-proof.log` (`tools/base-proof.mjs`) | §1, seven cases at the trunk's gate | `1715648a` (`a2f62f4d`) |
| `logs/full-run-1.log`, `logs/full-run-2.log` | `test:main` twice at `52ddf000`, with the names probe (`tools/names-probe.mjs`, `1f8179ef`) | `a4bef165`, `82a26596` |
| `logs/names-run-1.json`, `logs/names-run-2.json` | the names of both runs, byte-identical | `4fa34831` |
| `logs/gate-trunk.log` | the trunk's gate on run 1: green, 290 files, 2 968 tests | `62ea6b3c` |
| `logs/analyze-run-1.log`, `logs/stability.log` | §2 and §3.2: names, duplicates, layouts; 0 files differ between runs | `f374ceb6`, `ad577f86` |
| `logs/names-address-scan.log` | the address gate's `literals` over the names | `1fb4e41f` |
| `logs/template-titles.log`, `logs/history-titles.log` | titles built at run time; the 60 merges | `5b45dd96`, `40227651` |
| `logs/proto-proof.log` (`tools/proto-proof.mjs`) | the prototype's gate on a fixture: 22 cases (the error lines of §3.6) | `c35ef87b` (`f9e5308b`) |
| `logs/proto-run.log`, `logs/proto-write-gate.log` | the prototype's `test:main` (2 968 tests; 5 red, the tests T changes) and `write`; its gate green against the trunk | `97c04e24`, `7841821b` |
| `proto/test/test-names.json` | the names record that `write` wrote: 292 lines, 256 783 bytes | `ea974111` |
| `logs/proto-r25.log`, `logs/proto-anchors.log` | `pin` refuses no path; 414 lines in CI form; 26 anchors moved | `63cd968b`, `e78ef629` |
| `logs/proto-address-scan.log`, `logs/proto-gates.log`, `logs/proto-export.log` | the address scan (0 hits), `gate:vocab`, `lang:gate` and `export:check` (exit 0), and the names record internal, all on the prototype | `c7cc8842`, `aa163689`, `55c809c3` |
| `logs/probe-realpath.log` | §7, a linked test file through both reporters | `ff0de3d9` |

The prototype is the detached worktree `proto/` at a local commit above `52ddf000`, never pushed. It is not this change's code: it
gave the price in CI form and played the design.

## 13. As built (2026-10-14)

By the build's author instance (RECHERCHES, `claude-opus-5-5`, effort high), a fresh instance distinct from this note's author, from
04:2x UTC. Every run below was offline (`offline.mjs --no-egress`, 0 refused attempts in every log), each full suite and each mutant
under the shared host lock.

### 13.1 Commits

| Commit | What |
|---|---|
| `edbd2e83` | Merge of the trunk head announced by MONARK (`5ebd9267`) into this branch (`3a585411`), no conflict |
| `a6feb87d` | This note amended in place for MONARK's answers (`e6ebb72`), docs only |
| `3f940361` | T: T1, T2, T4, T5 in place, T7 and T8 new, the pin (4quinquies) of test 38; red at the merge |
| `895af680` | C: the reporter, `write`, the gate, the three `.d.mts` files, the `STAT=` line, the dated line under ADR-M003 D9 |
| `9682e6d3` | The records: `npm run test:main` then `write`, 290 files, 2 974 tests |

### 13.2 Departures from the plan

- **The names record holds one name per line** (Q-1 (b)): `namesText` is `JSON.stringify(<files sorted, names sorted>, null, 1)`, then
  U+2028 and U+2029 escaped. 3 556 lines.
- **Killed lines edited in place.** The new code sits after each module's functions (function declarations, hoisted: `minus`, `because`,
  `lineOk`, `namesDiffer`, `nameProblems` in the gate, `namesText` in `write`), and no line above a killed line was added or removed.
  Over the 55 killers of the two test files, the anchor checker at `--ref 5ebd9267` reads 53 ANCRE, **2 DERIVE** and 0 PERDU. The two
  drifts are lines edited in place by design, each killer's text still once on its line: `scripts/test-counts-reporter.mjs:15` (the
  event that counts a test now also records its name; killer of T1's head) and `scripts/test-count-check.mjs:56` (P2 and P4 take the
  names; killer `"...runProblems(run), "` of T5).
- **Killers rewritten by design**: `"...recordProblems(run, record), "` becomes `"...recordProblems(run, record, names), "` (l.56). The
  killer `" && r.reason.trim() !== \"\""` of l.23 is removed: `because()` (l.70) subsumes it, so its mutant became equivalent. Two
  killers on l.70 replace it (three words; this pull request's number).
- **`isLine` (l.22-23) is unchanged**, the shape of a count line; the new `lineOk` holds the three shapes and the reason. The reason test
  of `isLine` stays, redundant with `because()`.
- **The count-mode hint keeps `"reason":"..."`** (l.34 unchanged, its four killers anchored). The names-mode hint carries
  `#<pull request>: ...`, or `#<n>: ...` in CI. Count mode now judges only a base without the names record, which after this change
  is this change alone.
- **A file gone**: the hint offers its one line `{file, from, to: 0}` (§3.3), with the base count; one removal line per name is also
  accepted. A `{from, to: 0}` line counts only while none of the file's names was taken by another line.
- **`readRun`**: the names check sits on the throw line, l.15, so l.14 and its killer stay; the killer planned at `:14` is at `:15`.
- **The reporter**: `test:start` is the new branch at l.17, the sort at l.19. Its key, l.10, is the real path from the real cwd when
  the file resolves; an event whose file does not exist (T1's events) keeps the path as given.
- **The tests**: T4 opens with the reason (its first check, red at the merge); T5 opens with the head without `test/test-names.json`
  (exit 4), and its gate helper also removes `GITHUB_REF`. T1, T2 and T8 compare the reporter's raw output first. Test 38 is red at the
  merge at its exact list (a), the first check of the part it pins; its earlier checks hold other parts of the workflow.
- **Test 38**: two tokens in its exact CODE list, the pin (4quinquies) (the exclusions under `test/` are exactly the two paths, in that
  order, with no glob magic), a line of its header, and a killer above it on `.github/workflows/ci.yml:100`.
- **The ADR line** is a dated paragraph, `**Décision MONARK du 2026-10-09 sous D9 (...)**`, not an `**Addendum D9 <suffix>` title: the
  suffixes stop at octodecies until the list grows (item ADR-M003-SUFFIX-LIST-1), and `adr_m003_d9_suffixes_are_unique` refuses any other.
- **Size**: 377 lines in CI form, against about 210 planned under (b). The three test files come to 168 inserted and 49 deleted lines
  (about 85 planned; 129 of them in the gate's test file, where T5 and T7 grew), the code and the `STAT=` line to 111 and 49 (122 on the
  prototype).

### 13.3 Measures and proofs

| Proof | Result | Evidence (scratchpad `test-count-names-build/`) | sha256 (prefix) |
|---|---|---|---|
| The changed tests at the T commit (the merge's code) | 7 red, each by `ERR_ASSERTION` | `logs/t-at-merge.tap` | `0d8a83f6` |
| `red-proof --base edbd2e83 --gel 9682e6d3` | 7 judged, 7 F2P, ok | `red-proof/RED-PROOF.json` | `6a0240d1` |
| Killer campaign, trunk `scripts/mutants/run.mjs --killers` | baseline green; 73 killers, 73 killed by an assertion | `killers/RESULTS.json`, `logs/killers.log` | `25c7422a`, `c2fe9846` |
| `npm run test:main` | 2 974 tests, 2 952 pass, 0 fail, 22 skipped | `logs/main-1.log` | `571db00b` |
| `write`, then the gate `--base origin/lot/etude-suite` (`1347c3e7`) | 290 files, 2 974 tests; green, judged by counts (no names at `5ebd9267`), 0 drop; the same in the oracle form | `logs/gate-trunk.log` | `63d77e65` |
| The base cases at the merge's gate (the G0's tool) | R, E, B, D1, D2 exit 0; D0, D3 exit 1 (§1, unchanged) | `logs/base-proof-at-merge.log` | `3db8d766` |
| The base cases at the built gate, CI form (pull request 7) | 15 of 15 as planned: R, E, D0, D1, D1n, D2, D2n, D3, F red with the lines of §3.6; R+, D+, F+, N green; B green (names do not see bodies, §3.4); FIRST green, judged by counts | `logs/names-proof.log` (`tools/names-proof.mjs`) | `8250e038` (`e773acd4`) |
| Anchors, `verifie-ancres.mjs --ref 5ebd9267`, whole tree | at `9682e6d3`, 1 808 killers: 1 805 ANCRE, the 2 DERIVE above, 1 PERDU, the plan line of §4 at `:14`; with this section (`:15`), 1 806 ANCRE, 2 DERIVE, 0 PERDU | `logs/anchors.log`, `logs/anchors-2.log` | `cfbad7d4`, `a73c576d` |
| `tsc --noEmit`, eslint on the touched tests, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check`, winlint, `git diff --check` | each exit 0 (eslint ignores `scripts/` by its config) | `logs/gates.log` | `2b2e73c7` |
| Case-fold run of both test files (`casefold-git`, `CASEFOLD_FAIL=1`), and T8's fixture names | 8 pass; 3 `git add` judged, 18 names, 0 collision | `logs/casefold.log`, `logs/casefold-run.log` | `45952fc0`, `374185f7` |
| The names record | 3 556 lines, no raw U+2028 or U+2029, no CR, longest line 707 bytes; 2 address literals, both in `EXEMPT` | `logs/names-scan.log` | `d2b22e1f` |
| Size, CI form against the trunk (`tools/size.sh`), `pin` first | `pin` refuses no path. New `STAT=` line: 10 files, 279 + 98 = **377**. The trunk's line: 12 files, 3 837 + 100 = 3 937 (the names record 3 556, the counts 4) | `logs/size.log` | `801ae604` |
| R1 scan of each commit before its push | 0 match | | |

### 13.4 Not verified

- Windows: T8's junction, T2's nested run and the names under `cmd.exe`, the gate on the merge (P2 by names is the parity check);
  MONARK's replay at the merge.
- The CI of this branch: no pull request is open; a fresh review comes first.
- The gate's CI form under `offline.mjs`, which removes every `GITHUB_*` name: replayed in the oracle form under it, and in the CI form
  outside it (the gate runs git only).

## 14. G2 fold (2026-10-14)

By the fold's author instance (RECHERCHES, `claude-opus-5-5`, effort high), a fresh instance distinct from this note's author, the
build's and the review's. The review: recherches `44c8fd6`, `coordination/pieces/2026-10-14-g2-test-count-names/G2-test-count-names.json`,
verdict CORRECTIONS, one major and five minors, at `619ddb24`. Every run below was offline (`offline.mjs --no-egress`, 0 refused attempts
in every log), each full suite and each mutation run under the shared host lock. The `file:line` addresses of this section hold at the
fold's head.

### 14.1 Commits

| Commit | What |
|---|---|
| `7cc917c9` | Merge of the trunk `971eda88` (#238, which adds the test `kata_clause_follows_the_committed_pins`), no conflict |
| `d2dc8dc8` | Tests first: T5, T7 and test 38 gain the review's cases, with a killer for each of the review's five lines; red at the merge |
| `7a14eab8` | The gate (m-1, m-4), test 38's normalisation (m-2), the ADR (l.211 restored, l.215 in MONARK's words) |
| `ec514259` | The records: `npm run test:main` then `write` on the fold (the names record gains #238's test) |
| `eff8d510` | Two more killers, on the fold's own lines (the base agreement, the own-key copy); comments only |
| `a895c1b7` | Two new cases typed for `tsc` and `lint:ratchet` (no assertion changes) |
| `0fc715cc` | Merge of the trunk `6779955e` (#262, a new test file), which moved during the fold; no conflict |
| `d2b5f6f5` | The records again: `npm run test:main` then `write` on that merge |
| this commit | This section |

### 14.2 Each finding and its fold

| Finding | Fold | Where |
|---|---|---|
| **M-1** the error_origin clause of D9 septdecies rewritten | l.211 restored to its bytes before the build (below the table). The ADR's diff against the trunk is now 2 insertions and 0 deletions: a blank line and the dated line | `docs/adr/ADR-M003-phase2-integration.md:211`, `:215` |
| **m-1** a base whose two records disagree | Once the base carries the names record, the gate reads it against the base's counts record: the same files, and in each as many names as its count. Otherwise exit 4, `::error::test/test-names.json at the base <sha> not readable: it disagrees with test/test-counts.json there: <file>: …`, naming the first file that differs. T5 holds the review's two cases: BASEINCONS (the names record lacks `b.test.ts`, removed with no line) and BASEINCONS2 (one name fewer than the count, the test deleted with no line); both exit 0 at the merge, exit 4 here | `scripts/test-count-check.mjs:53` (the call), `:118-122` (`agrees`); `test/test-count-check.test.ts` T5 |
| **m-2** the pin missed short magic and `./` | Before the filter, each token loses its magic, long (`:(…)`) or short (`:!`, `:^`, `:/`, an optional `:`), then any leading `./` or `/`. Test 38 asserts that a third exclusion spelled `:!test/…`, `:(exclude)./test/…` or `:^./test/…` is seen; the first two are the review's. The review's paired edits (ci.yml and the exact list (a) edited together) replayed: see 14.4 | `test/ci-gates.test.ts:270`, `:277-279` |
| **m-3** five guarantees held by no test | A case and a killer each, killed by an assertion (14.3). X4's false green was first run on a fixture at the merge: with X4, a base whose names record holds a null entry and a test deleted with no line gives exit 0; the gate as built gives exit 4 | T5 and T7; `logs/x4-proof.log` |
| **m-4** a line for the file `constructor` threw | The records are read by their own keys only: the gate's reads copy each record into an object without a prototype (`own`), and `nameProblems` does the same with what it is given. A line for `constructor` or `__proto__` now takes `… names no test gone from constructor since the base`, as an `::error::` line in the gate | `scripts/test-count-check.mjs:49`, `:54`, `:93`, `:112-114`; T5, T7 |
| **m-5** the dated line not in MONARK's words | l.215 now quotes MONARK's Q-1 of `e6ebb72` word for word: his decision (« Les deux relevés sortent du compte R-25 ; le registre des retraits y reste »), his reason after « Pourquoi : », and his five conditions after « Les conditions : ». The words that differ, and why: the bold of his labels is dropped and his list items run on in one paragraph, since an ADR line is one paragraph, so his numbers `1.` to `5.` become `(1)` to `(5)`; the decision's first word takes a lower case after the line's opening colon; in (4), « comme ta note le prévoit pour (b) » becomes « comme la note `docs/G0-lot-test-count-names-1.md` le prévoit pour (b) », since an ADR names the note, not its author. Condition (3) has no added parenthesis. The line's opening (its date, its source), its last sentence (the two pathspecs added) and its `error_origin` are the former line's | `docs/adr/ADR-M003-phase2-integration.md:215` |

M-1, the restore: l.211 of the ADR has the same sha256 (`3fcc2e3e…`) at `5ebd9267`, the build's base, and at the trunk `6779955e`, as here.

### 14.3 New killers

| Killer (in `test/test-count-check.test.ts`) | Holds | Verdict |
|---|---|---|
| `scripts/test-count-check.mjs:94` CONST `", ...lines.map((r) => r.file)"` -> `""` (X1, l.220) | a line for a file in neither names record is refused | K59 tue (T7, and T5's `constructor` case) |
| `scripts/test-count-check.mjs:98` CONST `" && base[f]?.length === r.from"` -> `""` (X2, l.224) | a file-gone line counts at the base's count only | K60 tue (T7) |
| `scripts/test-count-check.mjs:103` CONST `" && gone.length === whole"` -> `""` (X3, l.228) | the hint for a file gone and partly declared wants each name left; the mutant changes the hint only, and T7 pins it whole | K61 tue (T7) |
| `scripts/test-count-check.mjs:53` CONST `"atBase(NAMES, null, lists,"` -> `"atBase(NAMES, null, () => true,"` (X4, l.146) | a malformed names record at the base: exit 4 and its line | K49 tue (T5) |
| `scripts/test-count-check.mjs:54` CONST `"shaped(JSON.parse(ntext), lists,"` -> `"shaped(JSON.parse(ntext), () => true,"` (X5, l.132) | a malformed names record at the head: exit 4 and its line | K48 tue (T5) |
| `scripts/test-count-check.mjs:53` CONST `"if (baseNames !== null) read("` -> `"if (false) read("` (m-1, l.149) | the base's two records held to each other | K50 tue (T5) |
| `scripts/test-count-check.mjs:93` CONST `"base = own(baseNames), head = own(headNames)"` -> `"base = baseNames, head = headNames"` (m-4, l.230) | the names records read by their own keys | K62 tue (T7) |

The line numbers at `619ddb24` that the review named (l.53, l.54, l.94, l.98, l.103) are the same here: every edit of the gate is in
place or after its last function. The own-key copy at the gate's reads (l.49, l.54) has no killer: on the paths the tests reach, the
copy in `nameProblems` (l.93) already holds it, and the count mode refuses a line for `constructor` with or without it, so its mutant
cannot be killed; it is kept so that no inherited name reaches the gate's other lookups.

### 14.4 Measures and proofs

| Proof | Result | Evidence (scratchpad `test-count-names-fold/`) | sha256 (prefix) |
|---|---|---|---|
| X4's false green, before any code change | on a fixture at the merge `7cc917c9`: the gate exit 4; with X4, exit 0 (a test deleted, no line, the base's names record holding a null entry) | `logs/x4-proof.log` (`tools/x4-proof.mjs`) | `162215cd` (`197f6d8e`) |
| The changed tests at `d2dc8dc8` (the merge's code) | test 38, T5 and T7 red, each by `ERR_ASSERTION`; every other test of the three files green | `logs/t-at-merge.tap` | `0478782e` |
| Each new case on its own at the merge (a probe that makes each assertion soft) | red: the `constructor` line (T5, a TypeError's stack in place of the line), BASEINCONS and BASEINCONS2 (both exit 0, the drop unseen), the `constructor` and `__proto__` lines (T7, a throw); green, as they pin what the merge already does: X1 to X5; the old filter of test 38 misses each of the three spellings | `logs/soft-at-merge.log`, `logs/t38-old-filter.log` | `e59efeba`, `5322a719` |
| The four test files at the fold's code (`a895c1b7`) | 53 tests, 53 pass | `logs/t-at-head.tap` | `f8fa4cb7` |
| `red-proof --base 7cc917c9 --gel a895c1b7` | T5 and T7 F2P (red at the base by `ERR_ASSERTION`, green at the gel); test 38 refused, green at the base (the tool calls it self-confirming), so the tool exits 1. That is by construction: m-2's fold is test 38's own filter, no production line changes, so the base run, which takes the gel's test file, is green. Test 38's red-first is the TAP at `d2dc8dc8` above | `logs/red-proof-final.log`, `red-proof-final/RED-PROOF.json` | `5839d23a`, `9ed7fe2f` |
| The review's paired edits of test 38 (ci.yml l.100 and the exact list (a) edited together; its tool, copied) | THIRD, MISS, SHORT and DOTSLASH red by test 38, GLOB by test 38 and `series_pinned_are_declared_and_hashed`, TOPGLOB by the latter; each by `ERR_ASSERTION`, both files restored | `logs/t38-pair-files.log` | `f869e719` |
| Killer campaign, the trunk's `scripts/mutants/run.mjs --killers`, base `971eda88` | at `eff8d510`: baseline green, 80 killers of the three test files, 80 « tue » | `logs/killers.log`, `killers/RESULTS.json` | `94f08e03`, `3d56222d` |
| The same at `a895c1b7` (the fold's code, typed) | baseline green (335 tests of the target files), 80 killers, 80 « tue », each by an assertion; the seven new ones are K48 to K50 and K59 to K62 above | `logs/killers-final.log`, `killers-final/RESULTS.json` | `82d61763`, `20253e66` |
| `npm run test:main`, on the merge of `971eda88` | 2 975 tests, 2 953 pass, 0 fail, 22 skipped | `logs/main-1.log` | `67221ef3` |
| `write` | 290 files, 2 975 tests; the names record gains `kata_clause_follows_the_committed_pins` (+1 line), the counts record unchanged by the write | `logs/write-1.log` | `83233e1d` |
| `npm run test:main`, on the merge of `6779955e` | 2 983 tests, 2 961 pass, 0 fail, 22 skipped | `logs/main-2.log` | `f8a5acce` |
| `write` | 291 files, 2 983 tests; the names record gains the eight tests of `test/pin-bell-legal.test.ts` (+10 lines), the counts record unchanged by the write | `logs/write-2.log` | `60c3b3b4` |
| The gate against `origin/lot/etude-suite` (`6779955e`), in the `--base`, oracle and CI forms; and judged by names against `619ddb24` | green: 291 files, 2 983 tests, 0 drop, judged by counts (no names at the trunk); by names against `619ddb24`, green (its two records agree, so the new base check passes on a real base) | `logs/gate-trunk-2.log` | `75737664` |
| The names record | 3 567 lines, no raw U+2028 or U+2029, no CR, longest line 707 bytes; 2 address literals, both in `EXEMPT` | `logs/gate-trunk-2.log` (`tools/names-scan.mjs`, the build's) | `75737664` |
| Anchors, `verifie-ancres.mjs --ref 6779955e` (the trunk head), whole tree | 1 824 killers: 1 822 ANCRE, 2 DERIVE (the two of 13.2, `scripts/test-count-check.mjs:56` and `scripts/test-counts-reporter.mjs:15`), 0 PERDU | `logs/anchors-final.log` | `25675986` |
| `tsc --noEmit`, eslint on the touched files, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check`, winlint, `git diff --check` | each exit 0 (`lint:ratchet` 69/69; eslint ignores `scripts/` by its config) | `logs/gates-final.log` | `a117b554` |
| Case-fold run of `test/test-count-check.test.ts` (`casefold-git`, `CASEFOLD_FAIL=1`) | pass; every `git add` of the fixtures: 0 case-only collision | `logs/casefold.log`, `logs/casefold-run.log` | `7d19f50e`, `086e861c` |
| Size, CI form against the trunk (`tools/size.sh`, the build's), `pin` first | `pin` refuses no path. The `STAT=` line of this branch: 10 files, 342 + 99 = **441**, under 547 and the CI bound 1 205 (`VIBEGATES_PR_LIMIT` unchanged). The trunk's line: 12 files, 3 911 + 101 = 4 012. The fold adds 64 lines to the build's 377, all in the tests and the gate | `logs/size-final.log` | `32893ff7` |
| R1 scan of what the push carries (`r1scan.mjs`), before the push | 0 match | `logs/r1scan.log` | |

### 14.5 Left to MONARK

- The comment of the job `g3-test-count`, `.github/workflows/ci.yml:307-312`, still describes the counts record only (the review's
  note on the note at the head). The zone allows the `STAT=` line only, so its wording is MONARK's, if he wishes.

### 14.6 Not verified

- Windows: T8's junction, T2's nested run and the names under `cmd.exe`, a case-only rename on NTFS, and the gate on the merge (P2 by
  names is the parity check); MONARK's replay at the merge.
- The CI of this branch: no pull request is open; a targeted review of the fold comes first.
- The gate's CI form under `offline.mjs`, which removes every `GITHUB_*` name: run outside it (the gate runs git only), in the oracle
  and `--base` forms under it.
- The killer campaign ran at `a895c1b7`, before the second merge of the trunk; that merge adds `scripts/pin-bell-legal.mjs` and its test
  only (and the trunk's own line for it in `test/test-counts.json`); the gate, its tests and their killed lines are the same bytes.
- red-proof cannot judge test 38's fold (above); its red-first is the TAP at `d2dc8dc8`.

## 12. Changelog

- **2026-10-08, this note** (RECHERCHES, `claude-opus-5-5` max, from 21:40 UTC): the G0 of TEST-COUNT-NAMES-1 at the trunk `52ddf000`.
  It contains the hole proved at the trunk, the names measured, the design, the tests and killers planned, the size measured on a
  prototype, and four questions for MONARK.
- **2026-10-14, amended for MONARK's answers** (RECHERCHES, the build's author instance, `claude-opus-5-5` effort high): the answers of
  `e6ebb72` to Q-1 to Q-4 written in place (the zone, the construction, the tests, the size and §10); docs only. The build follows on the
  merge of the trunk head `5ebd9267`.
- **2026-10-14, as built** (the same instance): §13, the commits, the departures from the plan, the measures and what is not verified;
  the planned killer of `readRun` moved from `:14` to `:15` in §4.
- **2026-10-14, G2 fold** (RECHERCHES, the fold's author instance, `claude-opus-5-5` effort high): §14, each finding of the review
  (recherches `44c8fd6`) and its fold, the new killers, the measures, and what is left to MONARK.
