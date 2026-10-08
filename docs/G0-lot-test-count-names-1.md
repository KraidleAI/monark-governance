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
- **Zone of the change** (planned): in place, `scripts/test-counts-reporter.mjs`, `scripts/test-count-floor.mjs`,
  `scripts/test-count-check.mjs` and their two `.d.mts` files, `test/test-count-floor.test.ts`, `test/test-count-check.test.ts`, and
  `test/test-counts.json` (by `write`); new, `test/test-names.json` (by `write`) and this note. Unchanged: `package.json`,
  `.github/workflows/ci.yml`, `scripts/export-public.mjs`, the oracle, and `test/test-count-removals.json` (`[]`).
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
  one line per file**, beside `test/test-counts.json`, which keeps its form. The gate holds the run to it (P2, P3). **Once the base
  carries it, the gate holds each name gone from a file since the base to exactly one line**: `{file, removed, reason}`,
  `{file, renamed, to, reason}` (where `to` is a name the file gained), or, for a whole file gone, today's `{file, from, to: 0, reason}`.
  A base without the names record (this change's own base) is judged by counts, as today.
- **The reason** (§3.5): `#<pull request>: ` followed by at least three words; in CI, the number must be the pull request's own
  (`GITHUB_REF`). The hint's placeholder cannot pass.
- **Tests** (§4): T1, T2, T4 and T5 change in place and T7 is new (T8 too if Q-2). Each is red at the trunk by an assertion, and no
  test imports an export the trunk lacks.
- **Size** (§5): **about 500 lines in CI form**, 292 of them the new record. The prototype measures 414 for the code and the record,
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
  file per line, sorted, with the file's names sorted on that line, and U+2028 and U+2029 escaped as `\u2028` and `\u2029`. JSON leaves
  those two characters raw, JavaScript ends a line at them, and R-25 refuses a file that holds one
  (`scripts/lot-size-integration.mjs:228`). `test/test-counts.json` keeps its form and its lines, so P2, P4, their killers, MONARK's
  comparisons and the fallback tool read it as they do now.
- **Why a second file**: putting the names, or a digest, on the lines of `test/test-counts.json` rewrites each of its 290 lines once,
  about 580 lines in CI form, above 547 on its own. A second file adds 292 lines and changes none.
- **Why one line per file**: one name per line makes 3 550 lines (266 267 bytes), above the CI bound of 1 205 on its own. One line per
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
| T8 `test_counts_reporter_keys_a_linked_file_by_its_real_path` (`test/test-count-floor.test.ts`, new, only if Q-2) | A real nested run of a test file reached through a directory link (`symlinkSync(…, "junction")`: a junction under Windows, a symbolic link elsewhere) gives one key, with its two tests, its summary and its names | the trunk's reporter writes two keys (measured, §7) |

T3 and T6 do not change. **Killers** (planned; their lines are fixed at the T commit): one above each test, the others in the bodies.

```
T1  // killer: scripts/test-counts-reporter.mjs:<l> CONST ".slice(0, data.nesting), data.name].join(\" > \")" -> ".slice(0, 0), data.name].join(\" > \")"
    // killer: scripts/test-counts-reporter.mjs:<l> CONST "else if (type === \"test:start\")" -> "else if (false)"
    // killer: scripts/test-counts-reporter.mjs:<l> CONST "names: c.names.sort()" -> "names: c.names"
    // killer: scripts/test-count-floor.mjs:14 CONST " && c.names.length === c.tests" -> ""
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
- **With Q-1 (b)**, where the two records leave the R-25 count, the change is about 210 lines, and the names record can hold one name
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
- **Q-2, REPORTER-REALPATH-1** folded into this change (≈ +18 lines, T8). **Proposed: yes.**
- **Q-3, the reason**: the form `#<n>: ` with three words, and in CI the pull request's own number. **Proposed: both.** The alternative
  is the form alone, which leaves n-1's case of a line naming another pull request to the review.
- **Q-4, the trigger**. **Proposed**: the one given when the item was taken (`eec97be`), kept: after the KATA killers change, and at
  the latest on 2026-10-10. The T commit also needs MONARK's answers to Q-1 to Q-3. TEST-COUNT-SKIP-EXPORT-1 follows this change.

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

## 12. Changelog

- **2026-10-08, this note** (RECHERCHES, `claude-opus-5-5` max, from 21:40 UTC): the G0 of TEST-COUNT-NAMES-1 at the trunk `52ddf000`.
  It contains the hole proved at the trunk, the names measured, the design, the tests and killers planned, the size measured on a
  prototype, and four questions for MONARK.
