# G0 — TEST-COUNT-FLOOR-1: the tests each file reports, held to a committed record; each drop from the base, against a declared removal line; in two pull requests

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max). The plan v2: 2026-10-08, the clock read by `date -u`, 07:11 UTC at its first
  read of the trunk, measures from 07:21 to 08:56 UTC. This note, the plan's English copy for the first pull request (PR-1), from
  09:07 UTC on the same day.
- **Demand**: MONARK `1c58876` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-247-haiku-organisation.md` §3,
  l.24-31): "a gate that compares, file by file, the number of tests run with that of the base, and refuses an undeclared drop (with
  the list of the removals meant). The G0 is yours, with the exact price." Carrier: RECHERCHES. Source: note 2 of the delta G2 of #246
  (`coordination/pieces/2026-10-07-g2-recherches/G2-246-delta.json`, commit `c0d63f6`, l.89): "Only a comparison of the number of tests
  with the base would see it: the CI shows it, nothing bounds it." Trigger, moved by `380b4b6` Q-7: **"before the G7 of the part that
  follows a1"** (§10).
- **Plan**: recherches `2ad8514` (`coordination/pieces/2026-10-08-G0-test-count-floor/G0-TEST-COUNT-FLOOR-1.md`, 927 lines), v2: the
  fold of the G2 of v1 (`coordination/pieces/2026-10-07-g2-recherches/G2-test-count-floor-G0.json`, commit `ea78c4d`, verdict
  CORRECTIONS: M-1, m-1 to m-7, notes 1 to 7) and of MONARK's nine decisions `380b4b6`
  (`coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-tcf-decisions.md`). v1: `ac282ef`. What changed from v1, finding by
  finding: §16.
- **Decisions**: MONARK `380b4b6` (Q-1 to Q-9), `729de62` (Q-10 to Q-13, `…-MONARK-vers-RECHERCHES-tcf-q10-q13.md`) and `34879a7`
  (`…-MONARK-vers-RECHERCHES-tcf-pas-de-delta.md`: no delta G2 of the plan, the G2 of PR-1 also reads the fold of M-1, its two modules
  and the red-proof refusal reproduced; PR-1 starts now, from `52d1e0b7`). All folded as decided (§15).
- **Base**: trunk `lot/etude-suite` = `52d1e0b7` (explicit refspec, `ls-remote` at 09:07 UTC: "Merge #248 …"), branch
  `recherches/test-count-floor-1-record`. The plan read `1ae166c6` and `565c7065`; from `565c7065` to `52d1e0b7`, only
  `test/mutants-run.test.ts` and one note under `docs/` changed (#248). **The code files this note cites are the same blobs at
  `565c7065` and `52d1e0b7`** (`package.json` `66066226`, `.github/workflows/ci.yml` `d9eb9736`, `scripts/oracle/run.mjs` `074c47aa`,
  `scripts/export-public.mjs` `02cde677`, `test/ci-gates.test.ts` `292114e2`, `test/export-public.test.ts` `90d71e96`,
  `test/oracle-run.test.ts` `ef91c990`, `scripts/red-proof.mjs` `9933788f`, `scripts/mutants/run.mjs` `b321e4a9`, `.gitignore`
  `dba1bfed`, `docs/PRODUCT-BOUNDARY.md` `0c8bb89c`, ADR-M004 `b01514b3`, `test/test-force-exit-report.test.ts` `c8daab69`,
  `scripts/lot-size-integration.mjs` `b794b866`, `test/cra-b.test.ts` `ad4878bd`, `packages/rpc-guard/test/durable.test.ts`
  `371111dc`): **the `file:line` addresses below hold at `52d1e0b7`**; those of ETAT are read at `565c7065`.
- **Zone of PR-1** (`380b4b6` Q-2): new, `scripts/test-counts-reporter.mjs` and its `.d.mts`, `scripts/test-count-floor.mjs` and its
  `.d.mts`, `test/test-count-floor.test.ts`, the record `test/test-counts.json` (written by `write`, never by hand) and this note; in
  place, `package.json:17`, `scripts/export-public.mjs:77`, the pin (a) of `test/ci-gates.test.ts`, `.gitignore` and one row of
  `docs/PRODUCT-BOUNDARY.md`. No job, no gate. MONARK writes the D7 terdecies addendum of ADR-M004 and the lines of ETAT himself, in a
  trunk commit of documents only, which this branch merges (`34879a7`).
- **Series bytes**: none opened; no CSV, no page, no `requests.jsonl`, `missing.json` or manifest. Searches in the repository read code
  files and named documents only. The suites read the repository's fixtures as the CI does; only their counts are reported here.
- **Measurement host** (the plan's measures): Linux, 4 cores, Node v24.21.0, npm 11.19.0, the repository's TypeScript 6.0.3. A host
  shared with other agents (load 3.4 to 17.1 during the measures, `uptime`; the shared host lock, held in turn by the suites and
  campaigns of other instances, delayed both killer campaigns): each duration is given with its load.

## 0. In short

- **PR-1, the record (455 lines in CI form at the prototype, 461 as built: +1 line for a1's new test file, +1 for #243's, +4 for the
  test file, 88 lines against 84)**: the reporter in `test:main`, its export, `node scripts/test-count-floor.mjs write` (which refuses
  any file without a summary of its own), the record `test/test-counts.json` written by `write`, three tests. No job.
- **PR-2, the gate (208 lines, plus one per new file of the window: a1 adds one)**: `scripts/test-count-check.mjs`, a new module that
  imports PR-1's without touching it, the removal list, the job `g3-test-count`, the job's export, `run.mjs:137` (`ORACLE_BASE`) and
  `:163` (the `tests` field), three tests and two tests of the oracle. It starts from a trunk that carries PR-1.
- **Each green and provable alone** (prototype): red-proof OK for each; every killer killed (28/28, 51/51); the whole suite of PR-2
  green, that of PR-1 too apart from a clock test of the trunk, green alone.
- **The PR-1 test that the D7 terdecies addendum cites**: `test_main_loads_the_counts_reporter_and_the_export_ships_it`.
- **The fallback of a1, played now on its heads**: 285 files equal, 1 new (`policy-committed.test.ts`, 7 tests), 0 red, each file with
  its own summary (§10.3).
- **Questions**: Q-10 (open `test/oracle-run.test.ts`), Q-11 (the Windows skips), Q-12 (MONARK's direct commits), Q-13 (the window):
  decided by MONARK `729de62` (§15).

## 1. What the gate must see (measured)

### 1.1 How `node --test` counts (Node 24.21.0, throwaway probes outside any repository)

The runner counts one test for each `test:pass` or `test:fail` event of kind `test` (`data.details.type`), at any depth: subtests
count, `describe` blocks do not, skipped and `todo` tests count. Each file that reports also sends its own `test:summary` (`data.file`
set), whose count equals that of the events. **A file whose process ends before it reports sends none: the runner reports it as a
single test, under its name, green if the process exits with 0.** The `data.file` of a test is the place of its `test()` call.

| Case probed | What the runner reports | Exit | What sees it |
|---|---|---|---|
| 11 tests (2 skipped, 1 `todo`, 2 in a `describe`, a parent and its 2 subtests) | 11 tests; a summary of its own | 0 | (sound) |
| an imported module calls `process.exit(0)` at load; 3 tests declared | 1 test under the file's name; no summary of its own | 0 | the missing summary; the count, 3 → 1 |
| the same module, imported by a file of one test | 1 test under the file's name; no summary of its own | 0 | **the missing summary only** (1 → 1) |
| `process.exit(0)` in the 2nd of 3 tests (v1) | 1 test under the file's name (the 1st lost too); no summary | 0 | the missing summary |
| a top-level `await` after the 1st of 3 tests, under `--test-force-exit` (v1) | 1 test; a summary of its own, 1 | 0 | the count against the base only |
| **a skipped `describe`** (`{ skip: true }`, 3 tests; `describe.skip`, 2 tests) and one visible test | 1 test: **none of the 5 is reported** | 0 | the count (5 fewer) |
| **a skipped parent** (`{ skip: true }`) that holds 2 subtests; the same without the skip | 1 test; 3 tests | 0 | the count (2 fewer) |
| `t.skip()` in a parent, then a subtest | 2 tests: the subtest runs | 0 | (the count keeps the subtest) |
| **a file that declares no test** (its only `test()` under a false condition) | 1 test under the file's name; no summary of its own | 0 | **the same shape as a stop at load** (§2.5, m-3) |
| a file whose only test falls under `--test-skip-pattern` | its own summary (`tests: 0`), then 1 entry under its name | 0 | counted 1, own summary: stable |
| **a test declared by a helper module** (1 test in the file, 2 by the module) | 1 under the file (its own summary, which says 3); 2 **under the module's path**, without a summary | 0 | P1 names the module (§2.5, m-3) |
| `--test-skip-pattern="\(test 42\)"` (`test:main`) | the test left out, not counted | 0 | (the record is that of `test:main`) |
| `--test-name-pattern` (`test:export`) | the other tests left out | 0 | outside the record (§3) |
| options after the globs (`npm run test:main -- --test-reporter=…`) | ignored: the default reporter stays | | (a reporter only enters through the script) |
| two reporters and one destination fewer | `ERR_INVALID_ARG_VALUE` | | (§2.2) |
| the reporter passed by its `file:` URL | loaded; its paths relative to the runner's folder | 0 | (the nested test and the fallback, §10.3) |

Measured: the file without a test and the file stopped at load send **the same events** (one `test:pass` entry under the file's name,
of kind `test`, `nesting` 0, no `test:summary` of that file): no field of the stream separates them. The default reporter of Node
24.21.0 is `spec`, on a pipe too: `--test-reporter=spec --test-reporter-destination=stdout`, set beside a second reporter, keeps byte
for byte the output that the CI and MONARK read (v1, replayed by the G2).

### 1.2 At the trunk, file by file

| Tree | Files | Tests | Duration (load) | Compared with |
|---|---|---|---|---|
| `43f46d9f` (v1) | 285 | 2 932 (2 910 pass, 22 skipped) | 298.7 s (1.0 → 7.4) | CI of #247 (run 37724391022): `ℹ tests 2932` |
| `5e976a1a` (G2) | 285 | 2 935 (2 913 pass, 22 skipped) | 1 034 s (11 → 24) | CI of #246 (run 37729701618): `ℹ tests 2935` |
| `1ae166c6` + PR-1 (prototype `018ae05d`, v2) | 286 | 2 938 (2 915 pass, 1 failure, 22 skipped) | 428.6 s (8.2 → 8.7) | the trunk's 2 935 + the 3 tests of PR-1 |
| `565c7065`, by the fallback (§10.3, v2) | 285 | 2 935 (2 913 pass, 0 failure, 22 skipped) | 460.8 s (3.5 → 12.1) | the run file is **byte for byte that of the G2** at `5e976a1a` (sha256 `5bbd2c7d…`); against PR-1's run: 285 files equal, 1 new |

- **Each file sent its own summary**, at every run: the own-summary rule (P1) refuses nothing at the trunk. PR-1 changes the count of
  no file of the trunk (the fallback measures it: 285 equal). **31 files have a single test** (in v1, in the G2 and at each run of v2):
  a stop at load does not change their count; only P1 sees them.
- Since `43f46d9f`, two counts changed, by #246: `apps/harness/test/kata-path.test.ts` 18 → 20, `test/verifiers-list.test.ts` 11 → 12
  (note 1 of the G2); the record is written at the trunk of the moment, by `write` (§2.3).
- The failure of the prototype's run is `l2_record_loop_schedules` (`test/l2-loop.test.ts`), a clock test outside this change, under load
  8; rerun alone: 91 of 91 pass. A failure is a test: the count does not change (§3). MONARK files it under the open item
  L2-HARNESS-FIXED-UNTIL-1 as a measured case (`40ef50b`).
- Windows: at `43f46d9f`, **2 932 tests under Windows, 41 of them skipped** (G7 of #247, ETAT l.425-426 at `565c7065`), **2 932 under
  Linux, 22 skipped**: 19 more skips under Windows, and the total does not change: none hid a test, the shape of a skip set on a leaf
  (§9). Equal totals, not file by file: the file-by-file comparison under Windows comes with PR-1 (§9, note 5 of the G2).

### 1.3 The class, on the real suite (v1 measure, not replayed)

The v1 prototype's mutant: `process.exit(0);` added at the end of line 15 of `apps/harness/src/kata-path.ts` (after its import of
`./tools/gate.ts`), at `43f46d9f`. **`test:main` exits with 0: 2 532 tests, 0 failures**; without the mutant, 2 938: **406 tests
erased, without one red**. The gate exits with 1 and 96 problems: 50 files without a summary of their own (4 of them files of a single
test, which only P1 names) and 46 count drops. The same mutant on a line of its own reddens only one test,
`every_killer_line_is_readable`, through the shift of the anchors. The loss of reports without the repository's preloads (19 files
without a summary of their own out of 24) is seen by P1 too.

## 2. Construction

Three new pieces and a job, in two pull requests (§6): a reporter that `test:main` loads beside `spec`, and a committed record,
`test/test-counts.json`, written by `node scripts/test-count-floor.mjs write` (**PR-1, the record**); a committed list of the removals
meant, `test/test-count-removals.json`, and a gate, `scripts/test-count-check.mjs`, launched by an internal job, `g3-test-count`, after a
run of `test:main` (**PR-2, the gate**). **The base's number is the number in the base's record**: after PR-2 the gate holds each tree
equal to its record, to the unit, at each pull request (CI) and at each G2 and G7 (oracle); the base's record is therefore the base's
run.

### 2.1 The reporter: `scripts/test-counts-reporter.mjs` (PR-1, new, 19 lines, exported)

```js
// TEST-COUNT-FLOOR-1 (docs/G0-lot-test-count-floor-1.md): a node --test reporter that test:main loads beside spec. For each test file it
// writes the tests the file's process reported (test:pass and test:fail of kind "test", at any depth, skipped and todo ones included)
// and whether that process sent a summary of its own. A process that ends before it reports (an exit or an exec, at load or inside a
// test) sends none: the launcher reports the file by its name as one test. scripts/test-count-floor.mjs reads the file it writes.
import { relative, sep } from "node:path";

export default async function* testCounts(source) {
  const files = new Map();
  const of = (file) => {
    const f = file === undefined ? "" : relative(process.cwd(), file).split(sep).join("/");
    if (!files.has(f)) files.set(f, { tests: 0, summary: false });
    return files.get(f);
  };
  for await (const { type, data } of source) {
    if ((type === "test:pass" || type === "test:fail") && data.details?.type === "test") of(data.file).tests++;
    else if (type === "test:summary" && data.file !== undefined) of(data.file).summary = true;
  }
  yield `${JSON.stringify(Object.fromEntries([...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))), null, 1)}\n`;
}
```

**As built, the four comment lines are rewritten in plain English, with no internal name or path** (the review of PR-1, G2 `033dca28`,
note n-3): the D7 terdecies addendum says the exported reporter carries no internal name, the form `test/helpers/blocking-stdout.cjs`
took under D7 undecies. The code lines are those above, byte for byte, and no line moves: the killers of l.15 and l.16 stay anchored.
MONARK may still prefer his reading of the addendum (no secret and no private name), under which the header above was admissible.

Plus `scripts/test-counts-reporter.d.mts` (3 lines; it admits an iterable, which the test passes), so that the test imports it. It
lives under `scripts/`, not under `test/helpers/`: three tests want `test/helpers/blocking-stdout.cjs` to be the only exported file of
the root `test/` (`test/bell-anchors.test.ts:167`, `test/no-cash-provider-name.test.ts:44`, `test/site-build-fleet.test.ts:813`,
reddened by the first form of the v1 prototype), and the D7 undecies addendum of ADR-M004 says so too. The count stays that of the
events (the choice of m-3, §2.5): one source of count, and a file without a summary of its own stays visible as it is.

### 2.2 `test:main` loads it, beside `spec` (PR-1, `package.json:17`, in place)

`test:main` gains, right after `--test-skip-pattern="\(test 42\)"` and before the globs:

```
--test-reporter=spec --test-reporter-destination=stdout --test-reporter=./scripts/test-counts-reporter.mjs --test-reporter-destination=test-counts.out.json
```

- **`test:main` alone, not `scripts.test`.** `launcher_delivers_every_byte_before_force_exit` (`test/test-force-exit-report.test.ts:90-113`)
  relaunches the launcher of `scripts.test`, adding `--test-reporter=spec` without a destination: with two reporters in `scripts.test`,
  Node refuses the line (`ERR_INVALID_ARG_VALUE`); and that test, launched from the root, would write the file there during the run
  that surrounds it. No test launches `test:main`; test 42 launches `npm run ci`, so `scripts.test`, in the export; `red-proof.mjs` and
  `mutants/run.mjs` have their own `node --test` lines. `test_scripts_carry_the_report_preload` (l.46-54) stays true: `test:main` keeps
  its launcher and its preload, once.
- **The pin (a) follows, in place**: `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` (`test/ci-gates.test.ts:1878`) wants
  `test:main` = `scripts.test` plus the skip flag; it becomes "plus the skip flag and the two reporters" (a constant `TEST_COUNTS` on
  the line of `TEST42_PATTERN`, l.1856; the text of l.1884-1885; the comment of l.1850-1851). Nothing below moves.
  `ci_jobs_have_timeout_and_test_flags_locked` (l.1813-1846) stays true as is.
- The file `test-counts.out.json` is written at the root of the run's folder; it is created empty at the start of the run and written
  at its end (measured by the G2): a cut run leaves an unreadable file, which the gate refuses (exit 4). `.gitignore` names it; an
  ignored entry does not dirty the oracle's tree (`git ls-files --others --exclude-standard`, `run.mjs:56`).
- The options hold no inner space, no `$`, `%`, `"` or backquote: the line passes as is through `sh` and through `cmd.exe`.

### 2.3 The record: `test/test-counts.json` (PR-1, new, 288 lines)

A JSON object, one file per line, sorted, the number of tests of `test:main`: `"apps/harness/test/kata-path.test.ts": 20,`. At the
trunk: 285 files; with PR-1, 286 (288 lines); with PR-2, 287. It is written by `npm run test:main && node scripts/test-count-floor.mjs
write`, never by hand: `write` refuses a run in which a file sent no summary of its own (P1), so an erasure of the class of note 2
cannot enter the record. Its written form is checked (P3) from PR-1 on (by T2 on the committed record); its numbers, by P2, from PR-2 on.

**Exact, not a floor.** A floor that is only ever moved down lets this through: one pull request adds 5 tests to a file without
touching the record, a later one erases 5; the run equals the floor, nothing reddens. The record therefore follows each change of a
count: each pull request that adds, removes or moves a test rewrites the lines of its files (two lines of the size count per file whose
count changes, one for a new file), mechanically, by `write`. The line of ETAT that formed the item (l.411-415 at `565c7065`: "number
of tests per file ≥ that of the base") was corrected in place by MONARK at `20fffe9f` (ETAT l.414-415): an exact record (§11, note 7).

**If the trunk moves before the merge, the record is rewritten on the merged tree**: the branch merges the trunk (a plain merge, no
rebase), runs `npm run test:main && node scripts/test-count-floor.mjs write` on that merge and commits the lines it rewrites, so that
the record a merge brings to the trunk is the run of the merged tree, never the run of an older trunk (the review of PR-1, G2
`033dca28`, finding m-1). Nothing in PR-1 would see a stale record: T2 holds its written form only, and P2 comes with PR-2.

### 2.4 The removal list: `test/test-count-removals.json` (PR-2, new, 1 line: `[]`)

One line per drop meant: `{"file": "…", "from": 3, "to": 2, "reason": "…"}`, `to` < `from`, `to` at 0 for a file removed or renamed,
a reason that is not empty. **`{file, from, to, reason}` is enough** (`380b4b6` Q-6): the gate holds only the reason not empty; naming
the lot, the item or the pull request is a usage, which the G2 reads. **A rename is written as a removal of the old file (`to: 0`), and
the new file enters the record**; no recognition of git's renames (Q-6). The list only grows: a line of the base changed or removed is
a refusal. It stays at the trunk as the register of the tests removed.

### 2.5 The two modules: `write` (PR-1) and the gate (PR-2)

**PR-1, `scripts/test-count-floor.mjs`** (new, 38 lines; `.d.mts`, 8 lines): `readRun` (the run as the reporter writes it, any other
shape refused), `runProblems` (P1), `recordText` (P3, the written form), and the command line `write`. **PR-2,
`scripts/test-count-check.mjs`** (new, 56 lines; `.d.mts`, 5 lines): it imports `RUN`, `RECORD`, `readRun`, `runProblems` and
`recordText` from PR-1's module, **which it does not touch**, and adds `recordProblems` (P2), `dropProblems` (P4), the base (§2.6) and the
command line that the job launches: `node scripts/test-count-check.mjs [--base <rev>]`. Each problem is one `::error::` line:

| Rule (PR) | Refuses | Message (start) |
|---|---|---|
| **P1, the summary of its own** (PR-1; judged by `write`, then by the gate) | a file without a summary of its own, whatever its count; a test reported without a file | `<f>: no report of its own (N test(s) under its name): its process ended before it reported, it declares no test, or it is a module that declared tests for a test file (declare each test in its *.test.ts)`; `N test(s) reported without a file` |
| **P2, the run equals the record** (PR-2) | a different count (a rise as well as a drop); a file of the run absent from the record; a file of the record absent from the run | `<f>: N test(s) run, M in test/test-counts.json`; `<f>: N test(s) run, not in …`; `<f>: in … (M), not in the run` |
| **P3, the written form** (PR-1; judged by T2 on the committed record, then by the gate) | the record is not the text that `write` writes, or a number is not an integer ≥ 0 | `test/test-counts.json: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)` |
| **P4, each drop has its line** (PR-2) | a drop from the base's record (a file gone counts 0) without exactly one line added since the base, at its numbers; an added line that names no drop; a malformed line; a line of the base changed or removed | `<f>: 3 test(s) at the base, 2 here: wants one line {"file":"<f>","from":3,"to":2,"reason":"..."} in test/test-count-removals.json`; `… names no drop since the base`; `… is not a line {file, from, to, reason} with from > to >= 0 and a reason`; `K line(s) of the base changed or removed; the list only grows` |

**The choice of m-3: P1 refuses the two shapes that are not a stop, and its message names them.** (a) A file that declares no test and
a file stopped at load send the same events (§1.1): no field separates them, and admitting one would reopen the class; a file of the
globs without a test has no reason to be, and the remedy (give it a test, or remove it, with a removal line) is short. (b) A test
declared by a helper module is counted under the module's path (`data.file` is the place of the call): counting it under the file by
its own summary (`data.counts.tests`, 3 in the probe) would leave the module's entry, without a summary, to a special case of P1, that
is two sources of count for no case at the trunk, where the only module outside `*.test.ts` that imports `node:test`,
`test/helpers/keep-cause.ts`, declares only hooks (G2). The rule is therefore **each test is declared in its `*.test.ts`**; P1 holds
it, and T2 holds both its shapes on a real nested run (§4).

**Exits, distinct (m-4).** `write`: 0 written; 1 P1 refuses (nothing is written); 2 the usage; 4 the run file unreadable. The gate: 0
green; 1 at least one problem; 2 the usage; **3 no base**; **4 an unreadable input** (the run, the record, the list, the merge base, or a
file of the base that `git show` returns unreadable). Closed by default: without a run file, exit 4, red. A rise asks for nothing but
the record up to date (P2). The gate's module writes the hint line by `JSON.stringify`: no text `"from"` followed by a quote in
`scripts/*.mjs`, which a specifier check reads (`packages/rpc-guard/test/durable.test.ts:282-289`, the v1 finding taken over).

### 2.6 The base (m-1: three bases, one rule)

`--base <rev>`; else `origin/$GITHUB_BASE_REF` (the CI, `pull_request` only: `ci.yml:18-19`); else `$ORACLE_BASE` (MONARK's local
oracle, §2.9); else a refusal, **exit 3** (`no base: pass --base <rev>, or run where GITHUB_BASE_REF (the CI) or ORACLE_BASE (the local
oracle) names it`). The gate reads the record and the list at the merge base of `HEAD` and of that revision, like the size gate
(`origin/<base>...HEAD`, `ci.yml:100`): in CI, `HEAD` is the pull request's merge, and the base is the target's tip. **A record absent
at the base counts as `{}`, a list absent as `[]`** (`git ls-tree` tells the absence; a file present but unreadable is exit 4):

| Base | What the base carries | What P4 judges | When |
|---|---|---|---|
| (i) | neither record nor list | no drop (the base's record counts as `{}`); an added line names no drop: refused | a base from before PR-1 (`--base` only: no pull request runs the gate before PR-2) |
| (ii) | PR-1's record, no list | **each drop since PR-1's record**, each against a line added by PR-2 | **the base of PR-2 itself** |
| (iii) | the record and the list | each drop since the base, against a line added since the base | any pull request after PR-2 |

**The window between PR-1 and PR-2 (m-1).** Between the merge of PR-1 and that of PR-2, the record is held in its form only (T2): no
other pull request writes it (a rewrite would absorb a drop that PR-2's P4 must see). PR-2 rewrites the record by `write` on its own
run, then launches `node scripts/test-count-check.mjs --base origin/lot/etude-suite`: the gate names each file whose count is lower
than in PR-1's record, with the exact line it expects (`wants one line {…}`). PR-2 carries **one removal line for each drop made since
PR-1's record, a1 included**, its reason naming the pull request that made it ("#233: …", "#236: …", or PR-2 itself); these lines and
the lines of the rewritten record enter PR-2's price (§6.3).

### 2.7 The job `g3-test-count` (PR-2, added after `ci.yml:296`, 24 lines)

```yaml

  g3-test-count:
    # TEST-COUNT-FLOOR-1 (docs/G0-lot-test-count-floor-1.md): the tests that each test file reports in a run of test:main, held against
    # the committed record test/test-counts.json, and each drop from the base's record against a line that the pull request adds to
    # test/test-count-removals.json; a file whose process sent no report of its own is refused. test:main writes the counts by its
    # reporter (scripts/test-counts-reporter.mjs); the local oracle runs that line once for both jobs. Internal job (the root test/
    # is never exported): derivePublicWorkflow drops it (INTERNAL_JOBS). Bound: the suite of g3-verification, whose bound is 20 by the
    # same rule (measured job wall-time x3, capped <= 20).
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0 # the base's record and removal lines are read at the merge base of HEAD and origin/$GITHUB_BASE_REF
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: "24"
          cache: npm
      - name: Install (lockfile must be present and consistent)
        run: npm ci
      - name: The main suite, whose reporter writes the tests of each file (test:main, as in g3-verification)
        run: npm run test:main
      - name: Tests of each file against the record, each drop from the base against its removal line (TEST-COUNT-FLOOR-1)
        run: node scripts/test-count-check.mjs
```

- **Why a job of its own, which reruns the suite**: g3-verification is copied byte for byte into the public workflow (test 42(f'),
  `export-public.mjs:443`); a comparison step there would redden on the mirror, which has neither the root `test/` nor the record. A job
  does not see another's files without an artefact and a `needs:` (§12).
- **`fetch-depth: 0`**: the merge base, its record and its list; and the suite, whose `bell_served_collector_revision_is_a_collector_commit`
  reads the history (`ci.yml:175-177`).
- **20 minutes, decided** (`380b4b6` Q-3), like g3-verification for the same suite (`ci.yml:169-171`). Neither `if:` nor
  `continue-on-error` (`ci.yml:3-4`), no permissions block, actions at SHAs already pinned. If `test:main` reddens, the next step does
  not run: the job is red, and g3-verification is too.

### 2.8 The public export

- **PR-1**, `scripts/export-public.mjs:77`, in place: `"scripts/assert-fleet-html.mjs", "scripts/test-counts-reporter.mjs", // the
  reporter that test:main loads (TEST-COUNT-FLOOR-1, ADR-M004 D7 terdecies)`. The mirror launches `test:main` in g3-verification, which
  it keeps: without the file, its CI does not start. Written on the existing l.77: none of the nine killers anchored lower in that file
  (l.78, 121, 146, 277, 447, 450 ×2, 513, 517) moves. `docs/PRODUCT-BOUNDARY.md` gains its row (required by
  `product_boundary_matches_export_list`, `test/cra-b.test.ts:50`). **The export's guard is a test of PR-1**:
  `test_main_loads_the_counts_reporter_and_the_export_ships_it` (§4, T3), which the D7 terdecies addendum of ADR-M004 cites (§11).
- **PR-2**, in place: `INTERNAL_JOBS` (l.450) gains `"g3-test-count"`; its comment (l.438-439) and the text of `DERIVED_HEADER` (l.449;
  the declaration is l.448, note 6 of the G2) name it. `test/export-public.test.ts` (l.426-429 and l.435): the closed list of test
  42(f') gains the job, its killer is added, and the killer `", \"g3-export\"]" -> "]"`, whose text would no longer be on l.450,
  becomes `"\"g3-export\", " -> ""`. The job, last of the file and internal, is removed up to the end: the derived workflow stays the
  same byte for byte (G2, and the prototype's suite).
- What stays internal: the two modules and their `.d.mts`, the record, the list, the two test files.

### 2.9 MONARK's local oracle (Q-4 (a) and Q-9, decided, in PR-2: m-6)

- **Derivation** (replayed in v1 and in the G2 on the very lines of `run.mjs:25-33` and l.120-134): at the trunk, ten gates, two of them
  locked, `test:main` and `test:export`; with PR-2's job, an eleventh, locked, `node scripts/test-count-check.mjs`, after `test:main`
  and `test:export`; `npm run test:main` once only (`new Set`, l.129); the gates run one after the other in the clone (`cwd: clone`,
  l.142): the gate reads the file that `test:main` has just written there; `test:export` does not touch it. With PR-1 alone, no gate
  more: `test:main` writes the file, which nothing judges yet.
- **`ORACLE_BASE`, l.137, in place, in PR-2** (`380b4b6` Q-4 (a)): `ORACLE_BASE: base, ` added to `genv`, right before
  `npm_config_offline: "true", `, whose killer (`test/oracle-run.test.ts:133`, SDL) keeps its text, once on the line. The oracle removes
  every `GITHUB_*` (`DENY`, l.40): without that line, and with no variable set by the host, the gate would exit 3 there. `base` is checked
  at l.54 and already present in the clone (r25 reads it, l.143). Nothing moves: neither the 28 killers of `test/oracle-run.test.ts`, nor
  the lines of `run.mjs` that `scripts/journal/index.mjs`, `scripts/mutants/run.mjs`, `scripts/red-proof.mjs` and
  `test/mutants-run.test.ts` cite. Test: one assertion in `oracle_gates_see_no_foreign_credential` (the name `ORACLE_BASE` reaches the
  fixture's two gates) and its killer `scripts/oracle/run.mjs:137 CONST "ORACLE_BASE: base, " -> ""` (+2 lines). PR-2 needs it itself:
  its G2 and its G7 under the oracle run its gate. **An oracle from before PR-2 already passes to the gates an `ORACLE_BASE` set in its
  environment**: the name is not in `DENY` (l.40, l.47) and `childEnv` (l.174) copies it (measured: the trunk's oracle `565c7065` on a
  fixture, the gate reads the sha set, and nothing without it). If the G2 or the G7 of PR-2 runs the trunk's oracle,
  `ORACLE_BASE=<the base>` in the environment, the same as `--base`, is enough; PR-2's oracle sets it itself, above any value of the
  host.
- **The `tests` field, l.162-163, in place, in PR-2** (`380b4b6` Q-9): since CI-G3-DURATION-1 (`6776f1fb`), the oracle reads its
  summary only from a gate named `test`, absent from the real tree: the field is `null`. l.163 becomes `const suite = ran.find((g) =>
  /^test(:main)?$/.test(g.name)), txt = suite === undefined ? "" : readFileSync(suite.log, "utf8");` (the pattern once on the line, so
  that a killer can hold it; l.162, its comment, names `test:main`). New test: `oracle_reads_the_tests_of_test_main`
  (`test/oracle-run.test.ts`), a fixture whose only suite gate is `npm run test:main`, which wants `tests` = `{ total: 3, pass: 3, fail:
  0, skip: 0 }` (red at the base by assertion, `null`), its killer `scripts/oracle/run.mjs:163 CONST "/^test(:main)?$/" -> "/^test$/"`
  (+10 lines). `test/oracle-run.test.ts` was not among the files that `380b4b6` Q-2 opens: question Q-10, which MONARK answered yes
  (`729de62`), on condition that l.137 and l.162-163 of `run.mjs` change in place without moving an anchor.

### 2.10 What does not change

`scripts.test` and `npm test`, `test:export` and test 42, the line of g3-verification (`ci.yml:185`, pin (d)), the other jobs,
`scripts/red-proof.mjs` and `scripts/mutants/run.mjs` (their own `node --test` lines), the preload and the exit guard of
TEST-FORCE-EXIT-REPORT-LOSS-1, the tests that pin `blocking-stdout.cjs`. PR-2 changes no line of PR-1: neither the reporter, nor
`scripts/test-count-floor.mjs`, nor `test/test-count-floor.test.ts`, nor `package.json`.

## 3. False positives and blind spots

| Case | Effect | Treatment |
|---|---|---|
| a leaf test made skipped (`skip`, `t.skip()`), `todo` | counted as a test | a leaf test made skipped does not lower the count: **item TEST-COUNT-SKIP-EXPORT-1** (`380b4b6` Q-8; carrier RECHERCHES; trigger: the merge of PR-2; price at its G0; MONARK's line in ETAT, l.543-544 at `565c7065`) |
| a parent that holds subtests, or a `describe`, made skipped (m-2) | its tests are not reported (measured, §1.1): the count drops | P2 and P4 see it: a removal line, or the skip set on the leaves. Specific to a platform: §9 |
| counts that depend on the platform | P2 would redden under Windows | no declaration depends on the platform at the trunk (static search of v1 and of the G2: no `describe` nor `suite` in the globs; the four subtests under a condition skip under a parent that always runs; the six of `bell-anchors` skip at run time and stay declared); equal totals under Windows (2 932 = 2 932, §1.2); reading of Q-5: §9 |
| a file of the globs that declares no test (m-3) | one entry under its name, without a summary of its own | P1 refuses it, and its message names it (§2.5); none at the trunk |
| a test declared by a helper module (m-3) | counted under the module's path, without a summary of its own | P1 names the module; rule: each test is declared in its `*.test.ts` (§2.5); none at the trunk |
| a file whose only test falls under `--test-skip-pattern` | counted 1 (the entry under its name), own summary | stable; none at the trunk (`export-public.test.ts` keeps 3 tests outside test 42) |
| tests added and removed in the same pull request, in the same file | count unchanged | **named blind spot**: the gate sees numbers, not names; the diff of the test file shows it to the G2 (§12) |
| file renamed | the old path drops to 0, the new one enters the record | a removal line `to: 0`, `reason: "renamed to …"` (Q-6) |
| file removed, or taken out of the globs (`package.json`) | drop to 0 | a removal line; a glob that loses a folder reddens all its files |
| new file, new test | rise | the record up to date (P2), nothing else |
| a drop made between the merge of PR-1 and that of PR-2 (m-1) | invisible until PR-2 | PR-2 declares it by a removal line, its reason naming the pull request (§2.6) |
| a direct commit to the trunk that changes a count (note 3 of the G2) | no CI: the record becomes false; the next pull request reddens P2 on a file it does not touch | rule: a direct commit that changes a count rewrites its lines by `write` and declares its drops (§13, Q-12) |
| residual loss of reports | P1 or P2 | a true red: the run did not tell everything |
| a flaky failure of a test | counted (a failure is a test) | does not touch the gate; the job reruns the suite, so it is exposed to the same flaky tests as g3-verification (§13) |
| two pull requests that change the count of the same file | conflict on its line of the record | resolved by arithmetic (ours + theirs − base) or by `write` after `test:main` on the merge; P2 checks it at the G7 |
| a local merge by MONARK on a trunk that has moved | the merged record may differ from the run | P2 under the oracle, at the G7, on the merged tree; P4 against `ORACLE_BASE` |
| a top-level `await` after a test (question 2 of the G0 of TEST-FORCE-EXIT-REPORT-LOSS-1, l.129) | drop | P2 and P4 see it |
| test 42, under `test:export` | outside the record (`test:main` leaves it out) | `export-public.test.ts` is in the record by its 3 other tests (a stop at load of that file reddens P1); test 42 itself: **item TEST-COUNT-SKIP-EXPORT-1** (Q-8) |

## 4. Tests red first: six new tests, each in one pull request only

Each pull request has its new test file, committed before its code (the T of the pull request); no test holds a part of the other
pull request (M-1):

| PR | Test (file:line in the prototype) | What it holds | At the base of its PR |
|---|---|---|---|
| PR-1 | T1 `test_counts_reporter_counts_each_test_of_each_file` (`test/test-count-floor.test.ts:21`) | the reporter on events: each test at any depth, a `describe` is not a test, the own summary noted, the global summary without a file ignored, a test without a file filed under `""`; `readRun` refuses any other shape | module absent (new-module) |
| PR-1 | T2 `test_count_floor_refuses_a_file_whose_process_ended_before_it_reported` (`:35`) | a real nested `node --test` (the reporter by its `file:` URL, `NODE_TEST_CONTEXT` removed) on five fixtures: a sound (2); b and c import a module that exits with 0 at load (3 tests declared, and 1); d declares no test; e declares a test and has one declared by a module (m-3). Exit 0. The run: `{a: 2 ✓, b: 1 ✗, c: 1 ✗, d: 1 ✗, declare.mjs: 1 ✗, e: 1 ✓}`; P1 names b, c, d and the module, in the message's text; `write` refuses (exit 1, nothing written, the `::error::` line of b); on a sound run, `write` writes the record in its form; without a run file, exit 4; without a command, 2; **the committed record is in its written form** (P3) | module absent (new-module) |
| PR-1 | T3 **`test_main_loads_the_counts_reporter_and_the_export_ships_it`** (`:77`) | `test:main` carries the four options, before its globs; each reporter that `test:main` loads (`--test-reporter=./…`) is in `collectFiles(ROOT).kept`: the mirror, whose CI launches `test:main`, has it; `.gitignore` names the run file. **The export's guard, which the D7 terdecies addendum cites** | module absent (new-module) |
| PR-2 | T4 `test_count_check_holds_the_run_to_the_record_and_each_drop_to_its_line` (`test/test-count-check.test.ts:17`) | P2 on objects: equal; a rise, a file outside the record, a file outside the run; the test without a file left to P1. P4: no drop; a drop and a file gone (0); each drop with its line; other numbers; two lines for one drop; a line of the base does not declare a new drop; a line for a file that grew; a line of the base removed; an empty reason; `to` > `from` | module absent (new-module) |
| PR-2 | T5 `test_count_check_names_its_base_or_refuses` (`:44`) | the gate on the command line on a git fixture repository whose base carries a record and no list (the base (ii) of PR-2); **each child gets the environment without `GITHUB_BASE_REF` or `ORACLE_BASE`, then the one variable of its case** (m-4): without a base, **exit 3 and the text `no base:`**; the drop against `ORACLE_BASE`, 1, P4's message; `--base` without a value, 2; a base without a record (i), 0; the added line: `GITHUB_BASE_REF` passes before `ORACLE_BASE` (0), `--base` before `GITHUB_BASE_REF` (1); a record outside its form, 1; without a run file, **exit 4** | module absent (new-module) |
| PR-2 | T6 `test_count_job_runs_test_main_then_the_check` (`:77`) | the job: its three `run:` lines in order (`npm ci`, `npm run test:main`, `node scripts/test-count-check.mjs`), the whole history, a bound > 0 and ≤ 20, no condition | module absent (new-module) |

Existing tests changed, each in one pull request only, red at their base by assertion: **PR-1**
`ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` (the pin (a)); **PR-2** `export_public_derived_jobs_are_byte_identical`
(the closed list of test 42(f')), `oracle_gates_see_no_foreign_credential` (one assertion: the name `ORACLE_BASE` reaches both gates)
and a new test in an existing file, `oracle_reads_the_tests_of_test_main` (`test/oracle-run.test.ts:170`, Q-9).

**Red proof, pull request by pull request, measured on the prototype** (`scripts/red-proof.mjs` of the trunk, blob `9933788f`):

| PR | Command | Judged | Killers fired | Duration | `RED-PROOF.json` |
|---|---|---|---|---|---|
| PR-1 | `--base 1ae166c6 --gel ff604716 --draw 4 --seed 20261008` | **OK, 4**: 1 F2P by assertion (the pin (a)), 3 new-module (`scripts/test-counts-reporter.mjs`); 43 unchanged | 4 killed (`export-public.mjs:77`, `test-count-floor.mjs:22`, `test-counts-reporter.mjs:15`, `ci.yml:205`) | 20 s | `54e5825d…` |
| PR-2 | `--base ff604716 --gel 4858f3b7 --draw 6 --seed 20261008` | **OK, 6**: 3 F2P by assertion (closed list, `ORACLE_BASE`, `tests` field), 3 new-module (`scripts/test-count-check.mjs`, added by PR-2; PR-1's module, present at this base, is imported without a refusal); 19 unchanged | 6 killed (`ci.yml:320`, `test-count-check.mjs:19` and `:41`, `run.mjs:163` and `:47`, `export-public.mjs:450`) | 107 s | `fd3da6ec…` |

Durations of the new tests in the suite (PR-2's run, load 6.6 → 4.8): T2 664 ms, T5 1 063 ms, `oracle_reads_the_tests_of_test_main`
1 246 ms, T3 34 ms, the others under 4 ms.

## 5. Killers

Lines of the prototype, fixed at the freeze of each pull request. A `// killer:` line above each declaration (the killer that
red-proof draws), the others in the body (the campaign). In the tables, `\|` is Markdown's escaped bar: the killer's text, in the test,
carries `||`.

**PR-1 (11 new)**, in `test/test-count-floor.test.ts`:

| Line guarded | Killer | Killed by |
|---|---|---|
| only tests count | `scripts/test-counts-reporter.mjs:15 CONST "data.details?.type === \"test\"" -> "true"` | T1 |
| the own summary noted | `scripts/test-counts-reporter.mjs:16 CONST "of(data.file).summary = true" -> "of(data.file).summary = false"` | T1 |
| the global summary is not a file | `scripts/test-counts-reporter.mjs:16 CONST "data.file !== undefined" -> "true"` | T1 |
| the run's shape | `scripts/test-count-floor.mjs:14 CONST "Number.isInteger(c?.tests) && " -> ""` | T1 |
| P1 | `scripts/test-count-floor.mjs:22 CONST "c.summary ? [] :" -> "true ? [] :"` | T2 |
| P1, the test without a file | `scripts/test-count-floor.mjs:21 CONST "if (f === \"\") return" -> "if (false) return"` | T2 |
| `write` refuses P1 | `scripts/test-count-floor.mjs:35 CONST "if (problems.length > 0) stop(1," -> "if (false) stop(1,"` | T2 |
| P3, the written form | `scripts/test-count-floor.mjs:27 CONST "null, 1)" -> "null, 2)"` | T2 |
| without a run, 4 | `scripts/test-count-floor.mjs:33 CONST "stop(4," -> "stop(0,"` | T2 |
| the reporter exported | `scripts/export-public.mjs:77 CONST ", \"scripts/test-counts-reporter.mjs\"" -> ""` | T3 |
| `test:main` writes the counts | `package.json:17 CONST " --test-reporter=./scripts/test-counts-reporter.mjs --test-reporter-destination=test-counts.out.json" -> ""` | T3 (and the pin (a)) |

**PR-2 (20 new, 1 rewritten)**, in `test/test-count-check.test.ts` (17), `test/export-public.test.ts` (1 new, 1 rewritten) and
`test/oracle-run.test.ts` (2):

| Line guarded | Killer | Killed by |
|---|---|---|
| P2, the exact count | `scripts/test-count-check.mjs:19 CONST "record[f] !== c.tests" -> "record[f] > c.tests"` | T4 |
| P2, the file taken out of the run | `scripts/test-count-check.mjs:20 CONST ".filter((f) => run[f] === undefined)" -> ".filter(() => false)"` | T4 |
| P4, a line of the base counts once | `scripts/test-count-check.mjs:26 CONST "if (i >= 0) left.splice(i, 1); else " -> ""` | T4 |
| P4, the list only grows | `scripts/test-count-check.mjs:27 CONST "if (left.length > 0)" -> "if (false)"` | T4 |
| P4, `to` < `from` | `scripts/test-count-check.mjs:28 CONST " && r.to < r.from" -> ""` | T4 |
| P4, a reason | `scripts/test-count-check.mjs:28 CONST " && r.reason.trim() !== \"\"" -> ""` | T4 |
| P4, what a drop is | `scripts/test-count-check.mjs:31 ROR "to < from" -> "to <= from"` | T4 |
| P4, one line only | `scripts/test-count-check.mjs:31 CONST "mine.length === 1 && " -> ""` | T4 |
| P4, the line's numbers | `scripts/test-count-check.mjs:31 CONST " && mine[0].to === to" -> ""` | T4 |
| P4, the line without a drop | `scripts/test-count-check.mjs:33 CONST "!((baseRecord[r.file] ?? 0) > (record[r.file] ?? 0))" -> "false"` | T4 |
| the oracle's base | `scripts/test-count-check.mjs:41 CONST ": process.env.ORACLE_BASE)" -> ": undefined)"` | T5 |
| `--base` first | `scripts/test-count-check.mjs:41 CONST "argv[1] ?? " -> ""` | T5 |
| without a base, 3 | `scripts/test-count-check.mjs:42 CONST "if (!named) stop(3," -> "if (false) stop(3,"` | T5 |
| a file absent at the base | `scripts/test-count-check.mjs:46 CONST "=== \"\" ? none :" -> "=== \"x\" ? none :"` | T5 |
| P3 in the gate | `scripts/test-count-check.mjs:51 CONST "text === recordText(record)" -> "true"` | T5 |
| the job launches the gate | `.github/workflows/ci.yml:320 CONST "node scripts/test-count-check.mjs" -> "node scripts/test-count-floor.mjs write"` | T6 |
| the job reads the history | `.github/workflows/ci.yml:310 CONST "fetch-depth: 0" -> "fetch-depth: 1"` | T6 |
| the job removed from the public workflow | `scripts/export-public.mjs:450 CONST ", \"g3-test-count\"]" -> "]"` | `export_public_derived_jobs_are_byte_identical` |
| (rewritten, the old `", \"g3-export\"]" -> "]"`) | `scripts/export-public.mjs:450 CONST "\"g3-export\", " -> ""` | the same |
| Q-4 (a): the base passed to the gates | `scripts/oracle/run.mjs:137 CONST "ORACLE_BASE: base, " -> ""` | `oracle_gates_see_no_foreign_credential` |
| Q-9: the `tests` field of `test:main` | `scripts/oracle/run.mjs:163 CONST "/^test(:main)?$/" -> "/^test$/"` | `oracle_reads_the_tests_of_test_main` |

**Campaigns** (`node scripts/mutants/run.mjs --killers`, from the scratchpad: the shared host lock, a FIFO queue):

- **PR-1** (`--base 1ae166c6`, head `018ae05d`, before the lint rework of T1, which touches no killer): **28 killers of the test files
  changed (11 new, the 17 of `test/ci-gates.test.ts`), 28 killed by assertion, no survivor, no inconclusive, no anchor lost**; 5 min
  4 s, including the wait for the lock held by another G2's suite (`RESULTS.json` `5cf9b162…`).
- **PR-2** (`--base 018ae05d`, head `1aae6b0b`: the content of PR-2 byte for byte, before the report of that rework): **51 killers of
  the test files changed (20 new, 1 rewritten, and the 30 others of `test/export-public.test.ts` and `test/oracle-run.test.ts`), 51
  killed by assertion, no survivor, no inconclusive, no anchor lost**, including the two new ones of the oracle (`run.mjs:137`,
  `run.mjs:163`) and the two killers of the lines rewritten in place; 55 min 45 s, from 08:00 to 08:56 UTC, mostly waiting for the host
  lock, held by the suites of other instances (`RESULTS.json` `6b277f1f…`).
- `verifie-ancres.mjs`: PR-1, 28 killers of the files touched, 28 ANCRE; PR-2, 51 killers of the files touched (17 + 4 + 30), 49
  ANCRE, 2 DERIVE, 0 PERDU; PR-2's whole tree, 1 721 killers, 1 719 ANCRE, 2 DERIVE, 0 PERDU. The two DERIVE are the lines rewritten in
  place: `export-public.mjs:450` (the killer `"\"g3-verifier-tool\", "` of `test/export-public.test.ts:429`) and `run.mjs:137` (the SDL
  killer of `test/oracle-run.test.ts:133`): same line, same text, once; the re-anchoring the tool proposes is the line itself. All stay
  killed (PR-2's campaign).
- The reporter's line that writes paths with `/` (`.split(sep).join("/")`, l.10) changes nothing under POSIX: no Linux killer holds it;
  it acts under Windows only, at MONARK's replay (§9).

## 6. The two pull requests: content, proofs, size (M-1)

### 6.1 The layout, and why

- **PR-2's code lives in a module that PR-2 adds**, `scripts/test-count-check.mjs`, which imports what it needs from PR-1's module
  without touching it; its tests live in a file that PR-2 adds. The form of v1 (one module for `write` and `check`) is refused by
  red-proof: a PR-2 test that imports a new export of a module present at its base comes out `import-fail` on that module, and red-proof
  refuses "import red on <module>, which exists at base" (`scripts/red-proof.mjs:187`). **Replayed** with the trunk's red-proof on a
  fixture repository (§14): base → A (a module and its test): `new-module`, OK; A → B, a function added to A's module and a test that
  imports it statically: **REFUSED, "import red on scripts/floor.mjs, which exists at base"**; the same through an `import()` in the
  test: REFUSED, "red at base without an assertion failure (other-fail)"; A → B', the code in a new module that imports A's, its test in
  a new file: `new-module`, killer killed, **OK**.
- **Each test in one pull request only** (§4), each killer with its test (§5).
- **PR-1's killers stay anchored after PR-2**: PR-2 changes no line of `scripts/test-counts-reporter.mjs`, `scripts/test-count-floor.mjs`,
  `test/test-count-floor.test.ts` or `package.json`; in `scripts/export-public.mjs`, where PR-1 anchors l.77, PR-2 writes only in place
  and lower (l.438-439, l.449, l.450); in `ci.yml`, where the pin (a) keeps its killer of l.205, PR-2 adds the job after l.296.
  Measured: the 28 killers of PR-1 are ANCRE at PR-2's head.
- **The PR-1 test that guards the export**: **`test_main_loads_the_counts_reporter_and_the_export_ships_it`**
  (`test/test-count-floor.test.ts`), killer `scripts/export-public.mjs:77 CONST ", \"scripts/test-counts-reporter.mjs\"" -> ""`. It is
  the test that the D7 terdecies addendum of ADR-M004 names (§11), and not the job's, which enters with PR-2.
- **Each pull request green and provable alone**: PR-1 without a job or a gate (no rule judges the record yet but its form); PR-2 from
  a trunk that carries PR-1 (§10). Measured on the prototype: the whole suite of each (§8), red-proof OK for each (§4), each campaign
  (§5).

### 6.2 PR-1, the record: 455 lines in CI form

Measure: `node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base origin/lot/etude-suite`, then `git diff
--shortstat origin/lot/etude-suite...HEAD` on the pathspec of the `STAT=` line of the size job (`ci.yml:100`, read in the tree;
`docs/**/*.md` excluded), base `1ae166c6` (the same code as `565c7065`), head `ff604716`. Bounds: **547 per lot** (ETAT l.2018 at
`565c7065`), 1 205 in CI (`ci.yml:56`).

| File | Change | Lines (ins + del) |
|---|---|---|
| `test/test-counts.json` (new) | the record: 286 files, one per line, written by `write` | 288 |
| `test/test-count-floor.test.ts` (new) | T1, T2, T3; 11 killers | 84 |
| `scripts/test-count-floor.mjs` (new) | `readRun`, P1, P3, `write` | 38 |
| `scripts/test-count-floor.d.mts` (new) | its types | 8 |
| `scripts/test-counts-reporter.mjs` (new) | the reporter | 19 |
| `scripts/test-counts-reporter.d.mts` (new) | its types | 3 |
| `test/ci-gates.test.ts` | the pin (a), l.1850-1851, l.1856, l.1884-1885, in place | 8 (+4 −4) |
| `.gitignore` | the run file | 3 |
| `package.json` | `test:main`, l.17, in place | 2 (+1 −1) |
| `scripts/export-public.mjs` | l.77, in place | 2 (+1 −1) |
| **Total, CI form** | **10 files, 449 insertions, 6 deletions** | **455**, margin 92 |

Outside the count: `docs/PRODUCT-BOUNDARY.md` (+1), the lot's G0 in `docs/`. The record is written at the trunk of the moment, at the T
of PR-1: its number of lines is that of the trunk's test files plus two (288 with 286 files); a new test file merged before PR-1
lengthens it by one line.

### 6.3 PR-2, the gate: 208 lines in CI form, plus the lines of the window

The same measure, base `ff604716` (PR-1 at the trunk), head `4858f3b7`:

| File | Change | Lines (ins + del) |
|---|---|---|
| `test/test-count-check.test.ts` (new) | T4, T5, T6; 17 killers | 86 |
| `scripts/test-count-check.mjs` (new) | P2, P4, the base, the command line | 56 |
| `scripts/test-count-check.d.mts` (new) | its types | 5 |
| `.github/workflows/ci.yml` | the job, after l.296 | 24 |
| `test/oracle-run.test.ts` | the assertion of `ORACLE_BASE` and its killer (+2); `oracle_reads_the_tests_of_test_main` and its killer (+10) | 12 |
| `scripts/export-public.mjs` | l.438-439, l.449, l.450, in place | 8 (+4 −4) |
| `test/export-public.test.ts` | l.426-429 and l.435: the closed list, a new killer, a rewritten one | 7 (+4 −3) |
| `scripts/oracle/run.mjs` | l.137 (Q-4 (a)), l.162-163 (Q-9), in place | 6 (+3 −3) |
| `test/test-counts.json` | rewritten by `write`: PR-2's new file (+1), `test/oracle-run.test.ts` 17 → 18 (+1 −1) | 3 |
| `test/test-count-removals.json` (new) | `[]` | 1 |
| **Total, CI form** | **10 files, 197 insertions, 11 deletions** | **208**, margin 339 |

**Plus the lines of the window** (m-1, §2.6): for each pull request merged between PR-1 and PR-2, two lines of the record per file whose
count changed, one per new file, and one removal line per drop. For a1 (#233 and #236), measured by the fallback (§10.3): **one line**,
`apps/harness/test/policy-committed.test.ts`, new, 7 tests; no other count changes and no drop, so no removal line: **PR-2 = 209** if
a1 is merged in the window. If it is merged before PR-1, PR-1's record carries that line (**456**), and PR-2 stays at 208.

### 6.4 The record between the two

PR-1 writes the record that nothing judges yet in its numbers; PR-2 rewrites it on its base and declares each drop since it. The window
is short: PR-2 is built as soon as PR-1 is merged (§10). A pull request that would rewrite the record in the window is a finding of its
G2 (§13).

## 7. Time cost

- **PR-1**: no job. The reporter in `test:main` (g3-verification, the oracle, the mirror): about 0.09 ms per test in the worst case
  measured in v1 (24 files of 400 empty tests), so under one second over 2 938 tests; the prototype's run (428.6 s under load 8) cannot
  be told apart. T2 adds 0.7 s to the suite.
- **PR-2, CI**: one more job, of the duration of g3-verification minus `gate:vocab` and `typecheck`: `test:main` 275.9 s on the runner
  (run 37724391022), `npm ci` 10 s, checkout and setup-node about 10 s, the gate 85 ms (measured on the prototype, two timed runs, 81
  and 87 ms); about 5 min, in parallel: **a run's duration stays that of its longest job, g3-verification (5 min 13 s in run
  37724391022)**. The runner time of a run goes from 11 min 50 s (the sum of the eight jobs of run 37724391022) to about 16 min 50 s
  (+42 %); the repository is public: these minutes are not billed, the cost is in slots of simultaneous jobs (G2).
- **MONARK's oracle**: with PR-2, one more gate, about 85 ms; no extra suite run (§2.9). T5 and `oracle_reads_the_tests_of_test_main`
  add 2.3 s to the suite.
- **Each pull request after PR-2**: `npm run test:main && node scripts/test-count-floor.mjs write` when a count changes (the suite is
  run there already), one removal line per drop meant (`node scripts/test-count-check.mjs --base origin/lot/etude-suite` writes each);
  in the size count, two lines per file whose count changes, one per new file.

## 8. Gates and proofs at the freeze, per pull request

For each pull request, Node 24.21.0: the whole `npm run test:main`; `npx tsc --noEmit`; `eslint` of the `.ts` touched; `npm run -s
gate:vocab`, `lang:gate`, `lint:ratchet` (69/69), `export:check`; winlint on the files touched; `verifie-ancres.mjs --touched <base>
<head>` and `every_killer_line_is_readable`; `git diff --check`; red-proof `--base <base of the PR> --gel <head> --draw <n> --seed <s>`;
`scripts/mutants/run.mjs --killers` on the test files changed; the size count in CI form (§6); the pull request's CI green at its head.
In addition, for PR-2: `node scripts/test-count-check.mjs --base origin/lot/etude-suite` green after `write`; **T5 run once with
`GITHUB_BASE_REF=lot/etude-suite` and `ORACLE_BASE=<a sha>` set in the parent's environment, as the CI and the oracle will launch it**
(m-4); `g3-test-count` green at the head.

On the prototype:

| Proof | PR-1 (`ff604716`) | PR-2 (`4858f3b7`) |
|---|---|---|
| the whole `test:main` | 2 938 tests, 2 915 pass, 1 failure (`l2_record_loop_schedules`, clock, outside this change; alone: 91/91), 22 skipped, 428.6 s, load 8.2 → 8.7 (at `018ae05d`); its test files touched, 67/67 (at `018ae05d`), then T1 to T3, 3/3, after the rework (`ff604716`) | **2 942 tests, 2 920 pass, 0 failure, 22 skipped, exit 0**, 350.6 s, load 6.6 → 4.8 (at `1aae6b0b`, the content of PR-2 byte for byte) |
| the gate | (none) | red before `write` (2 problems, P2: `test/oracle-run.test.ts: 18 test(s) run, 17 in …`, `test/test-count-check.test.ts: 3 test(s) run, not in …`), then **green** after `write`: `--base` PR-1, and `ORACLE_BASE`; without a base, exit 3 |
| T5 under `GITHUB_BASE_REF=lot/etude-suite ORACLE_BASE=1ae166c6` | | **6/6 pass** (the two new files); the same throwaway copy of the file with the purge removed: T5 red, the case "without a base" reads `4 ::error::the merge base of HEAD and origin/lot/etude-suite not readable` instead of 3: the trap of m-4, which the single exit 2 of v1 would have left green |
| `tsc`; `eslint` of the `.ts` touched | 0; 0 (after the rework: `@typescript-eslint/require-await` on a generator without `await` in T1, replaced by an array) | 0; 0 |
| `gate:vocab`; `lang:gate`; `lint:ratchet`; `export:check` | OK (349 files); OK; 69/69; OK | OK; OK; 69/69; OK |
| winlint; `git diff --check` | 11 files, no Windows hazard; clean | 10 files, no Windows hazard; clean |
| red-proof; campaign; anchors | OK (§4); 28/28 (§5); 28 ANCRE | OK (§4); 51/51 (§5); 49 ANCRE, 2 DERIVE in place |

## 9. What MONARK replays under Windows (reading of Q-5, m-2)

**Q-5, decided** (`380b4b6`): MONARK replays the gate under Windows at the merge; the count that is authoritative is the CI's; under
Windows, only the Windows-specific skips already declared explain a gap; any other gap is red and is investigated before the merge.

**Reading, skip by skip (m-2)**:

- The record is the CI's run (Linux): it is what P2 holds, under Windows too.
- **A Windows-specific skip set on a leaf test** (the test's `skip` option, or `t.skip()` in its body) **keeps the count**: the leaf is
  reported skipped, counted. It is the shape of every skip at the trunk: 41 skipped under Windows against 22 under Linux at `43f46d9f`,
  for 2 932 tests on both sides (§1.2). P2 stays green.
- **A Windows-specific skip set on a parent that holds subtests, or on a `describe`, hides these tests under Windows alone** (measured,
  §1.1): P2 reddens that file under Windows, at the G7, and only there. It is the "explained gap" of Q-5: MONARK reads it as explained if
  the gap equals the number of tests that this declared skip hides; any other gap stays red. **There is none at the trunk** (no
  `describe` nor `suite` in the globs; the four subtests under a condition, `bell-served-e2e:55`, `dojo-collect-sigterm:61`,
  `probe-dojo-live:438` and `:444`, skip under a parent that always runs; G2).
- **The rule, without code** (Q-11, decided by `729de62`): a platform skip is set on each test it would hide, never on a parent that
  holds subtests nor on a `describe`; the G2 of a pull request that adds a platform skip checks it. No item now: a skip on a parent or a
  `describe` does not pass in silence, since the gate reddens under Windows at MONARK's G7. A pull request that could not keep the rule
  then opens the item of variant (b) of v1: the record would carry, for that file alone, a Windows value (about 3 lines in the gate).

**The replays, in order**:

- **At the G7 of PR-1** (note 5 of the G2): `test:main` already carries the reporter; MONARK's Windows replay writes
  `test-counts.out.json` in its clone. Comparing it with the committed record gives the Windows parity file by file, count **and** own
  summary, before PR-2 makes it blocking, without an extra run. The gate does not exist yet at PR-1: the comparison is that of the
  fallback (§10.3), `node tcf-fallback.mjs compare test/test-counts.json test-counts.out.json`, the committed record standing for the
  base (each file there counts as reported); a gap is read as above.
- **At the G7 of PR-2**: the oracle, on the merge, runs the gate after `test:main`, with `ORACLE_BASE`: P1 to P4 under Windows. A P2 red
  there is read as above.
- P3 under Windows: `.gitattributes` (`* text=auto eol=lf`) checks the record out in LF everywhere, and `write` writes LF: the written
  form is the same. The run's keys there are paths with `/` (l.10 of the reporter), like those of the record written under Linux.
- To replay too, under Windows only: the reporter's line that only acts there (l.10, the `\` into `/`), the loading of
  `--test-reporter=./scripts/test-counts-reporter.mjs` under `cmd.exe`, and the two new test files (the git fixture repository with
  `core.autocrlf=false`, the nested `node --test` by the reporter's `file:` URL).
- **Run the replay from a path with no junction or symbolic link** (the clone and `TEMP`): a test file reached through one is reported
  under two keys, its tests at its real path and its summary at the launcher's (`process.cwd()` keeps a junction under Windows), and
  `write` refuses that run by P1, closed by default (G2 `033dca28` of PR-1, note n-2, measured under Linux with a symbolic link).
  Planned for PR-2, from that note: realpath both the cwd and the file in the reporter (a change to a PR-1 file, against §2.10).

## 10. Trigger, sequence, and a1 (m-7, m-5)

### 10.1 The trigger

**"Before the G7 of the part that follows a1"** (`380b4b6` Q-7; ETAT l.539-545 at `565c7065`). MONARK's order (ETAT l.317) is:
IMPORT-SPECIFIERS-AST-1, a1 (#233, #236), #237, #238. The part that follows a1 is therefore a2: #237 ("Committed kata tables: serve them
through the gate, behind a tripwire on the pins", head `4da02ad0`, set on #236) and #238 ("… the gate description follows the pins",
head `af45d630`, set on #237). **Both pull requests of this lot are merged before the G7 of #237**, so that the oracle of that G7 runs
the gate on the merge of a2, which serves the tables through the gate: the walk of the imports, the very place of the class. a1 does not
wait for this lot: it passes with the fallback (§10.3).

### 10.2 The sequence

1. The plan v2. No delta G2 of it (`34879a7`): the G2 of PR-1 also reads the fold of M-1, the two modules and the red-proof refusal
   reproduced (§6.1).
2. **MONARK, at the trunk** (`380b4b6` Q-2, `729de62`, `34879a7`): the D7 terdecies addendum of ADR-M004 (the reporter exported, its
   reason, its test: **`test_main_loads_the_counts_reporter_and_the_export_ships_it`**, of PR-1, and its killer), a dated D9 line under
   ADR-M003 for #249, and the lines of ETAT (TEST-COUNT-FLOOR-1 in two pull requests and its trigger; TEST-COUNT-SKIP-EXPORT-1; the line
   that formed the item, l.411-415, corrected in place by MONARK at `20fffe9f`, ETAT l.414-415), in a trunk commit of documents only.
   PR-1 does not wait for it (`34879a7`): the branch merges the trunk once MONARK gives that commit's sha, and the commit is on the
   trunk before PR-1's code is merged.
3. **PR-1** on `recherches/test-count-floor-1-record`, from `52d1e0b7`: this note; then T (`test/test-count-floor.test.ts` and the pin
   (a), red at the base); then C (the rest; the record written by `write` on C's run, at the trunk of the moment); T and C pushed
   together, so that the CI never runs the red tests alone; proofs (§8); the pull request, as a draft; its CI green; its G2; the merge
   request; MONARK's G7 (the oracle: no extra gate; the Windows replay and its comparison, §9); the merge.
4. **PR-2** on a branch of its own, **from a trunk that carries PR-1**, never before (the size count counts `origin/<base>...HEAD`,
   `ci.yml:100`: a PR-2 opened on a trunk without PR-1 would also count PR-1's lines: about 661, above 547): T (`test/test-count-check.test.ts`,
   the closed list of test 42(f'), the assertion of `ORACLE_BASE`, `oracle_reads_the_tests_of_test_main`), then C; the record rewritten by
   `write`; `node scripts/test-count-check.mjs --base origin/lot/etude-suite` names each drop since PR-1's record: one removal line per
   drop, its reason naming the pull request (§2.6); proofs; the pull request; its CI green, **`g3-test-count` included: the pull request
   judges itself**; its G2; the merge request; the G7 (the oracle with `ORACLE_BASE`: PR-2's sets it, the trunk's passes it on if
   MONARK sets it, §2.9; the Windows replay of the gate, Q-5); the merge, **before the G7 of #237**.
5. **At the merge of PR-2**: the G0 of TEST-COUNT-SKIP-EXPORT-1 (its trigger, Q-8); each open pull request sees its next run (its merge
   with the new trunk) run `g3-test-count`: it merges the trunk, launches `npm run test:main && node scripts/test-count-floor.mjs write`,
   commits its lines and its removal lines (note 4 of the G2); and MONARK's G7 of every pull request merged after PR-2 runs the gate.

**The three places of a1**:

| a1 merged | The record | a1's drops | The comparison |
|---|---|---|---|
| **before PR-1** | PR-1's record, written at the trunk that carries a1, takes a1's counts as they are (one more line: PR-1 = 456) | judged by a1's G2 and by MONARK, through the fallback | the fallback (§10.3), at a1's G2 and at MONARK's Windows replay |
| **between PR-1 and PR-2** | a1 does not write the record (the window, §2.6); PR-2 rewrites its lines (one: PR-2 = 209) | **one removal line in PR-2 for each drop of a1**, reason "#233: …" or "#236: …" (measured: none) | at a1's G7, the two `test-counts.out.json` that `test:main` already writes (trunk and a1's merge), by `compare` (§10.3) |
| **after PR-2** | a1 merges the trunk, launches `test:main` and `write`, commits its lines (one, at its size price) | its removal lines, in a1 | the gate itself: a1's CI (`g3-test-count`) and the oracle of its G7 |

### 10.3 The fallback of a1, exact (m-5; `380b4b6` Q-7; `7c50851` §2)

**What it compares**: file by file, **the count and the own summary**; a file without a summary of its own on the head is red
whatever its count (a comparison of the counts alone lets through a stop at load in a module that only files of one test load: 31 files
of a single test at the trunk, and 4 of the 50 files erased by the v1 mutant). A drop is red until a1's G2 names it (and, if a1 is
merged between PR-1 and PR-2, until its removal line in PR-2).

**The two tools**, in a folder `T` outside any tracked repository: `T/tcf-reporter.mjs`, **the reporter of §2.1 byte for byte** (sha256
`73cdea27…`), and `T/tcf-fallback.mjs` (32 lines, sha256 `5497affd…`):

```js
// tcf-fallback.mjs (TEST-COUNT-FLOOR-1, the fallback of Q-7): per-file test counts of a tree whose test:main has no reporter yet.
//   node tcf-fallback.mjs run <tree> <out.json>       test:main of <tree>, as package.json writes it, plus spec and tcf-reporter.mjs
//   node tcf-fallback.mjs compare <base.json> <head.json>   per file: the count AND the report of its own; exit 1 on any red line
//   (a base or head may be a record test/test-counts.json, { "<file>": tests }: each file then counts as reported)
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const [cmd, a, b] = process.argv.slice(2), flag = '--test-skip-pattern="\\(test 42\\)"';
if (cmd === "run" && a && b) {
  const script = JSON.parse(readFileSync(join(a, "package.json"), "utf8")).scripts?.["test:main"] ?? "";
  if (script.split(flag).length !== 2 || script.includes("--test-reporter=")) { console.error("test:main must hold its skip flag once and no reporter (with the reporter, npm run test:main writes test-counts.out.json itself)"); process.exit(2); }
  const reporter = pathToFileURL(join(import.meta.dirname, "tcf-reporter.mjs")).href;
  const line = script.replace(flag, `${flag} --test-reporter=spec --test-reporter-destination=stdout "--test-reporter=${reporter}" "--test-reporter-destination=${resolve(b)}"`);
  process.exit(spawnSync(line, { cwd: a, shell: true, stdio: "inherit" }).status ?? 1);
} else if (cmd === "compare" && a && b) {
  const read = (f) => Object.fromEntries(Object.entries(JSON.parse(readFileSync(f, "utf8"))).map(([k, c]) => [k, typeof c === "number" ? { tests: c, summary: true } : c])); // a record: each file reported
  const [x, y] = [a, b].map(read), out = { red: 0, up: 0, new: 0, same: 0 };
  for (const f of [...new Set([...Object.keys(x), ...Object.keys(y)])].sort()) {
    const p = x[f], q = y[f], say = (v, t) => { out[v]++; console.log(`${v.padEnd(4)} ${f || "(no file)"}: ${t}`); };
    if (p !== undefined && !p.summary) say("red", `no report of its own at the base (${p.tests} test(s) under its name)`);
    if (q !== undefined && !q.summary) say("red", `no report of its own on the head (${q.tests} test(s) under its name)`);
    else if (p === undefined) say("new", `${q.tests} test(s), a file new on the head`);
    else if (q === undefined) say("red", `${p.tests} test(s) at the base, not in the head's run`);
    else if (q.tests < p.tests) say("red", `${p.tests} -> ${q.tests}: a drop, each test removed on purpose must be named`);
    else if (q.tests > p.tests) say("up", `${p.tests} -> ${q.tests}`);
    else out.same++;
  }
  const n = (o) => Object.values(o).reduce((s, c) => s + c.tests, 0);
  console.log(`base ${Object.keys(x).length} files ${n(x)} tests; head ${Object.keys(y).length} files ${n(y)} tests; ${out.same} same, ${out.up} up, ${out.new} new, ${out.red} red`);
  process.exit(out.red > 0 ? 1 : 0);
} else { console.error("usage: node tcf-fallback.mjs run <tree> <out.json> | compare <base.json> <head.json>"); process.exit(2); }
```

`run` launches the line of `test:main` that `package.json` carries, as is, plus `spec` to stdout and the reporter by its `file:` URL,
the destination outside the tree, through npm's shell (`sh -c` under Linux, `cmd.exe` under Windows); it refuses a tree whose
`test:main` already carries a reporter (after PR-1, `npm run test:main` writes `test-counts.out.json` itself: those are the files to
compare).

**The commands, to play now on a1's heads** (Linux; `S` the session's scratchpad, `T` the folder of the two tools):

```sh
export PATH=/opt/nvm/versions/node/v24.21.0/bin:$PATH
G=/home/user/monark-governance; W="$S/tcf-a1"
# 1. the trunk and a1, by explicit refspecs (#236 carries #233)
git -C "$G" fetch origin +refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite \
  +refs/pull/233/head:refs/remotes/pr/233 +refs/pull/236/head:refs/remotes/pr/236
# 2. two detached worktrees: the base (the trunk), and a1's merge into the base
git -C "$G" worktree add --detach "$W/base" origin/lot/etude-suite
git -C "$G" worktree add --detach "$W/a1" origin/lot/etude-suite
git -C "$W/a1" -c user.name=fallback -c user.email=fallback@localhost merge --no-ff --no-edit pr/236
# 3. the dependencies; the mode npm sets on rpc-guard.mjs put back; each tree clean (no line)
for t in base a1; do (cd "$W/$t" && npm ci && chmod 644 packages/rpc-guard/bin/rpc-guard.mjs && git status --porcelain); done
# 4. the two runs, one after the other (preferably under the shared host lock)
node "$T/tcf-fallback.mjs" run "$W/base" "$W/counts-base.json"
node "$T/tcf-fallback.mjs" run "$W/a1" "$W/counts-a1.json"
# 5. the comparison: each red line is named in a1's G2; exit 1 if one is left
node "$T/tcf-fallback.mjs" compare "$W/counts-base.json" "$W/counts-a1.json"
# 6. the cleanup (erratum 31): the worktrees, then the folder
git -C "$G" worktree remove --force "$W/base"; git -C "$G" worktree remove --force "$W/a1"; git -C "$G" worktree prune; rm -rf "${W:?}"
```

Under Windows (MONARK, at a1's merge, "which I redo myself"): the same two tools and the same `run` and `compare` commands (Node 24;
`run` goes through `cmd.exe` like npm; a folder `T` without a space, the reporter's URL then holding no `%`). **If PR-1 is at the trunk
before a1's G7**, both `npm run test:main` write `test-counts.out.json` themselves: the comparison is
`node "$T/tcf-fallback.mjs" compare <base>/test-counts.out.json <a1>/test-counts.out.json`.

**Played here, on those heads** (the trunk `565c7065`, the merge of #236 `8980121b` into `565c7065`, under the shared host lock, one
after the other; tools at the sha256 above):

| Tree | Files | Tests | Own summary | Duration (load) | Run file |
|---|---|---|---|---|---|
| the trunk `565c7065` | 285 | 2 935 (2 913 pass, 0 failure, 22 skipped) | each | 460.8 s (3.5 → 12.1) | `5bbd2c7d…` (byte for byte the G2's at `5e976a1a`) |
| a1's merge (#236 into `565c7065`) | 286 | 2 942 (2 920 pass, 0 failure, 22 skipped) | each | 614.0 s (12.1 → 7.6) | `7a345333…` |

`compare`: **285 files equal, 0 rise, 1 new (`apps/harness/test/policy-committed.test.ts`, 7 tests), 0 red, exit 0**; no file without a
summary of its own on either side; the 31 files of a single test stay so. Both trees stayed clean. It is the result of a1's G2
(`bb9483c`, `G2-a1-adopt-246.json`: "only policy-committed.test.ts changes (absent, 5, 7), no file loses a test", at the trunk
`391ca7c0`), now with each file's own summary. MONARK's Windows replay remains, by the same tools. #236 has since moved to `ab8ea8d9`
(08:41 UTC), one document alone: the code and the tests compared are its own.

## 11. MONARK's files that the lot touches

| File | PR | What changes | Opening |
|---|---|---|---|
| `package.json` | PR-1 | `test:main` (l.17) gains the reporter's four options, in place | open (`380b4b6` Q-2) |
| `test/ci-gates.test.ts` | PR-1 | the pin (a) (l.1884-1885), its constant (l.1856) and its comment (l.1850-1851), in place | open (Q-2) |
| `scripts/export-public.mjs` | PR-1, PR-2 | PR-1: `WHITELIST_FILES` (l.77, in place); PR-2: `INTERNAL_JOBS` (l.450), its comment (l.438-439), the text of `DERIVED_HEADER` (l.449), in place | open (Q-2) |
| `docs/PRODUCT-BOUNDARY.md` | PR-1 | one row, `scripts/test-counts-reporter.mjs` | open (Q-2) |
| `.gitignore` | PR-1 | `/test-counts.out.json` and its comment | open (Q-2) |
| `.github/workflows/ci.yml` | PR-2 | the job `g3-test-count`, added after l.296 (no existing line moves) | open (Q-2) |
| `test/export-public.test.ts` | PR-2 | the closed list of test 42(f') (l.435), its comment (l.426), a new killer, a rewritten killer (l.427-429) | open (Q-2) |
| `scripts/oracle/run.mjs` | PR-2 | l.137 (`ORACLE_BASE`, Q-4 (a)) and l.162-163 (the `tests` field, Q-9), in place | decided in the second pull request (Q-4, Q-9) |
| **`test/oracle-run.test.ts`** | PR-2 | an assertion and its killer in `oracle_gates_see_no_foreign_credential` (+2); `oracle_reads_the_tests_of_test_main` and its killer (+10) | **open by Q-10** (`729de62`: l.137 and l.162-163 of `run.mjs` in place, no anchor moved; m-6) |
| `docs/adr/ADR-M004-infrastructure-plateforme.md` | — | **D7 terdecies addendum**: the reporter exported (`scripts/test-counts-reporter.mjs`), its reason (the mirror launches `test:main`, which loads it), **its test: `test_main_loads_the_counts_reporter_and_the_export_ships_it`** (`test/test-count-floor.test.ts`, PR-1) | MONARK, at the trunk (Q-2, `34879a7`) |
| `docs/ETAT.md` | — | MONARK's lines: the lot in two pull requests and its trigger (the decisions' line is at `565c7065`, l.539-545); the line that formed the item (l.411-415, "≥ that of the base"), corrected in place by MONARK at `20fffe9f` (ETAT l.414-415): the gate holds an exact record (§2.3, note 7 of the G2) | MONARK |

New files, RECHERCHES's: PR-1: `scripts/test-counts-reporter.mjs` and its `.d.mts`, `scripts/test-count-floor.mjs` and its `.d.mts`,
`test/test-count-floor.test.ts`, `test/test-counts.json`, `docs/G0-lot-test-count-floor-1.md` (this note, which the code's headers
cite); PR-2: `scripts/test-count-check.mjs` and its `.d.mts`, `test/test-count-check.test.ts`, `test/test-count-removals.json`.

## 12. Constructions set aside

- **PR-2's code in PR-1's module** (the form of v1, one module for `write` and `check`): red-proof refuses its tests ("import red on
  <module>, which exists at base"); replayed on a fixture (§6.1).
- **PR-2's tests in PR-1's test file**, its code in a new module: red-proof accepts it (the G2's fixture B'), but PR-2 would then
  rewrite the header of a PR-1 file and mix the tests of the two pull requests; each pull request has its file.
- **Holding, from PR-1 on, that the record's keys are the files of the globs** (note 5 of the G2, a static reading like
  `expandTestGlob` of `ci-gates`, l.1864-1876): the set of files would no longer drift between PR-1 and PR-2, at the price of a record
  line for each test file merged in the window (a1 adds one); Q-7 does not ask for it, and PR-2 judges the window (§2.6).
- **Each file's count taken from its own summary** (`data.counts.tests`, m-3): right for a test declared by a module, but two sources
  of count and a special case of P1 for no case at the trunk (§2.5).
- **One value per platform in the record** (Q-5 (b) of v1): kept as a variant, not built (§9, Q-11).
- **Running the base's suite in the CI** (no record): about 360 lines, each run's duration almost doubled, the gate outside the oracle
  (v1, `380b4b6` Q-1: set aside).
- **P1 alone** (the own summary, without a record or a base): about 165 lines; it closes the class of note 2, files of a single test
  included, but neither the tests never registered, nor a file removed, nor a test deleted (v1, Q-1: set aside).
- **A floor per file**: the hole of §2.3. **A global floor**: set aside in the G0 of TEST-FORCE-EXIT-REPORT-LOSS-1 (l.48).
- **The counts of g3-verification passed to the job by an artefact and `needs:`**: an upload step in a job copied to the mirror, a new
  action to pin, and a job conditioned by another, against the invariant of `ci.yml:3-4`.
- **The names of the tests instead of their number**: each rename of a test would become a removal line.
- **A static count of the `test(` of the source**: it sees neither the loops, nor the subtests, nor what the run really does.
- **The reporter in `scripts.test`**; **the reporter under `test/helpers/`**; **the record under `docs/**/*.md`** (outside the size
  count by its path alone): no (§2.1, §2.2, v1).

## 13. Risks

- **The window between PR-1 and PR-2**: the record is held there in its form only; a pull request that rewrote it in the window would
  hide a drop from PR-2's P4. Remedy: PR-2 follows PR-1 without delay (§10.2); the G2 of a pull request of the window checks that it does
  not touch `test/test-counts.json` (Q-13, agreed by `729de62`: no other pull request writes the record in the window, and MONARK merges
  PR-2 as soon as it is ready).
- **Direct commits to the trunk** (note 3 of the G2): they have no CI; such a commit that changes a count without rewriting the record
  leaves it false, and the next pull request reddens P2 on a file it does not touch, or must write another's removal line. The rule: a
  direct commit that changes a count rewrites its lines by `write` and declares its drops, in the same commit; a usage rule, written in
  the rules (CLAUDE.md, DOCTRINE; `eea4990`), by MONARK (Q-12, decided by `729de62`: he writes it in his workshop at the merge of PR-1;
  after PR-2, his full oracle on a direct commit runs the gate, and the rule is then held by the machine).
- **The pull requests open at PR-2's merge** (note 4 of the G2): each must merge the trunk and write its lines; their next run tells
  them so, file by file.
- **The upkeep of the record**: each pull request that changes a count rewrites it; an omission is a red named to the file, whose remedy
  is a command. The real risk is the agent that rewrites without reading: `write` refuses P1, and a drop wants its line, written by
  hand, with a reason, visible to the G2.
- **Conflicts on the record** between parallel pull requests that touch the same test file: resolved by arithmetic or by `write`,
  checked by P2 at the G7.
- **Flaky tests**: PR-2's job reruns the suite, which is therefore exposed twice per run to the same flaky tests (the run of PR-1's
  prototype met `l2_record_loop_schedules` under load 8); a flaky test reddens one more job, which is rerun.
- **The platform**: a Windows skip on a parent or a `describe` would redden P2 at the G7 (§9, Q-11).
- **The trigger**: both pull requests pass before the G7 of #237; PR-2 opens only after PR-1's merge: two G2 and two G7 on that path.

## 14. Probes, fixture and prototype of the plan v2

All under the session's scratchpad, outside any tracked repository, under a prefix of the plan's author (`tcfv2/`), removed at the end
of v2 (erratum 31: the worktrees by `git worktree remove` then `git worktree prune`, the folders by `rm -rf "${X:?}"`).

- **The rule of `eea4990`**, checked at `565c7065`: no reporter in `package.json` nor in `ci.yml`, no file names `test-counts`; the
  oracle reads a summary only from a gate named `test` (`run.mjs:163`), absent; `scripts/journal/index.mjs` only copies `tests_total`
  (l.156). Code must change, and the current code does not do what the lot wants.
- **`node --test` probes** (§1.1): eleven throwaway files (sound; `describe` skipped by option and by `describe.skip`; a parent skipped
  and the same without the skip; `t.skip()` then a subtest; no test; the only test under the pattern; a test declared by a module; a
  stop at load under a file of three tests and of one test), the reporter of §2.1 and a reporter that writes each event; the reporter
  loaded by its `file:` URL.
- **red-proof fixture** (§6.1): a throwaway git repository, the trunk's `scripts/red-proof.mjs` (blob `9933788f`): base → A (OK,
  `RED-PROOF.json` `a00418a1…`); A → B static (REFUSED, `a1d84659…`); A → B by `import()` (REFUSED, `458d0bd5…`); A → B' (OK,
  `6fb87c0a…`); in both OK cases, the killer drawn (`--draw 1 --seed 7`) killed.
- **Prototype**: `git clone --no-local` of `monark-governance`, push disabled, local branches at `1ae166c6`, never pushed: PR-1
  `66b69e9b` (T), `cf86a027` (C, an empty record), `018ae05d` (C2, the record written by `write`), `ff604716` (the lint rework of T1);
  PR-2, first `ba061a33` (T), `6f1a40af` (C), `1aae6b0b` (C2, the record rewritten), then the same content set on `ff604716`:
  `ddda7336` (T), `0164cfa5` (C), **`4858f3b7`** (C2). Files at the heads: `scripts/test-counts-reporter.mjs` `73cdea27…` (19 lines),
  `scripts/test-count-floor.mjs` `ee0135f6…` (38), `scripts/test-count-check.mjs` `b9b2302b…` (56), `test/test-count-floor.test.ts`
  `ba92bd0f…` (84), `test/test-count-check.test.ts` `e331c690…` (86), `test/test-counts.json` at PR-1 `ddfd2585…` (288), at PR-2
  `92189635…` (289).
- **Runs**: the whole `test:main` at PR-1 (`018ae05d`, 428.6 s) and at PR-2 (`1aae6b0b`, 350.6 s); the run files `3155f78d…` and
  `9ece0ee9…`; the gate before and after `write`; T5 under the variables of the CI and of the oracle, and without its purge (§8).
- **Oracle probe** (§2.9): the trunk's `scripts/oracle/run.mjs` at `565c7065` on a fixture repository whose only gate, `npm test`, writes
  `ORACLE_BASE`: `base=none` without the variable, `base=<sha>` with it; exit 0 both times; `ORACLE_ROOT` apart, the host lock never
  touched.
- **Measures**: the size count in CI form for each pull request (§6); red-proof for each (§4); both killer campaigns (§5);
  `verifie-ancres.mjs` (§5); winlint and the gates (§8).
- **a1's fallback** (§10.3): two detached worktrees of `monark-governance` (the trunk `565c7065`; the merge of `pr/236` into `565c7065`),
  `npm ci` each, the mode of `packages/rpc-guard/bin/rpc-guard.mjs` put back to 644, trees clean; both runs under the shared host lock,
  one after the other; the comparison.
- **Not done**: a whole oracle run on the prototype (its derivation is replayed in v1 and in the G2; its fixture test holds
  `ORACLE_BASE` and the `tests` field); the GitHub CI on the prototype (never pushed); test 42 (`test:export`) on the two pull requests;
  Windows: nothing here ran there.

The prototype is not this pull request's code: it gave the exact price of each pull request in CI form, and it proved, pull request by
pull request, the red tests, the killers and the whole suite. PR-1's own measures, at its head, are in its description.

## 15. MONARK's decisions, folded

**From `380b4b6`**:

- **Q-1: (A), in two pull requests**, without a waiver: PR-1 **455** lines, PR-2 **208** plus the lines of the window (§6); each under
  547. Estimated: about 410 and 220 (`380b4b6`), 430 and 240 (G2). PR-1 measures 25 more than the G2: the fixtures of m-3 in T2, the
  cases of T1, two `.d.mts`. PR-2, 32 fewer: the G2's estimate added to v1's 220 a dozen lines for Q-9, five lines of a1 and its removal
  lines; measured, Q-4 (a) and Q-9 make 18 lines, the gate and its tests fewer than v1's estimate, and the lines of the window are counted
  apart (§6.3).
- **Q-2: the files of the list open**; the D7 terdecies addendum and the lines of ETAT by MONARK; the addendum cites
  `test_main_loads_the_counts_reporter_and_the_export_ships_it` (§11). Its timing: §10.2 (`34879a7`).
- **Q-3: 20 minutes** (§2.7).
- **Q-4: (a)**, `ORACLE_BASE` at `run.mjs:137`, in place, no anchor moved, in PR-2, with its test and its killer (§2.9).
- **Q-5: the CI's count is authoritative**; Windows replay of the gate at the merge; reading skip by skip in §9.
- **Q-6: `{file, from, to, reason}`**; a rename, a removal plus an entry (§2.4).
- **Q-7: a1 does not wait**, with the exact fallback of §10.3; trigger: before the G7 of the part that follows a1, #237 (§10).
- **Q-8: the item TEST-COUNT-SKIP-EXPORT-1** (§3).
- **Q-9: `run.mjs:163` in place, in PR-2**, with its test and its killer (§2.9).

**From `729de62`** (the four questions the plan v2 left):

- **Q-10: yes**, `test/oracle-run.test.ts` is open to PR-2 (+12 lines), on condition that l.137 and l.162-163 of `run.mjs` change in
  place, without moving an anchor; MONARK rereads those lines at the merge (§2.9, §11).
- **Q-11: the rule of the skips set on the leaves**, without code; no item now; a pull request that cannot keep the rule then opens the
  item of variant (b) (§9).
- **Q-12: yes**; MONARK writes the rule in his workshop at the merge of PR-1; after PR-2, his full oracle on a direct commit runs the
  gate (§13).
- **Q-13: agreed**; in the window, no other pull request writes `test/test-counts.json`, MONARK merges PR-2 as soon as it is ready, and
  PR-2 carries one removal line for each drop of the pull requests merged in the window (§2.6, §13).

**From `34879a7`**: no delta G2 of the plan; the G2 of PR-1 also reads the fold of M-1 (the two modules, and the red-proof refusal
reproduced); PR-1 starts now, from `52d1e0b7`; MONARK's trunk commit holds documents only, and the branch merges the trunk when he gives
its sha (§10.2).

## 16. Changelog

- **2026-10-08, v1** (`ac282ef`, 06:03 UTC): the G0, a prototype in one pull request, 622 lines in CI form, nine questions.
- **2026-10-08, v2** (`2ad8514`, RECHERCHES, `claude-opus-5-5` max, a fresh instance; measures from 07:21 to 08:56 UTC): the fold of
  the G2 `ea78c4d` (CORRECTIONS) and of the nine decisions of `380b4b6`, on a new prototype of the two pull requests at the trunk
  `1ae166c6` (code equal to `565c7065`):
  - **M-1**: §6 new, "The two pull requests": PR-2's code in a module that PR-2 adds (`scripts/test-count-check.mjs`, which imports PR-1's
    module without touching it); six new tests, three per pull request, each in one only (§4); PR-1's killers anchored after PR-2 (no line
    of PR-1 changed; PR-2 writes in place, lower, or after l.296 of `ci.yml`; 28 ANCRE measured at PR-2's head); the PR-1 test that
    guards the export, for the D7 terdecies addendum: `test_main_loads_the_counts_reporter_and_the_export_ships_it`; red-proof's refusal
    and the corrected layout replayed on a fixture; each pull request green and provable alone (suite, red-proof OK, campaign). Measured
    prices: **PR-1 455, PR-2 208** (plus the lines of the window), instead of 622 in one pull request.
  - **m-1**: §2.6, the three bases (a record absent counts as `{}`, a list absent as `[]`); the base of PR-2 is (ii); PR-2 carries a
    removal line for each drop since PR-1's record, a1 included, its reason naming the pull request; no other pull request writes the
    record in the window; these lines counted in PR-2's price (§6.3).
  - **m-2**: §1.1, the skipped `describe` and the skipped parent measured; §3, the line "skipped test" split (a leaf: the item; a parent
    or a `describe`: P2 and P4 see it); §9, the reading of Q-5 skip by skip, and the rule of the skips on the leaves (Q-11).
  - **m-3**: the choice written (§2.5): P1 refuses a file that declares no test and a test declared by a module, its message names them;
    reasons measured (the same events as a stop at load; `data.file` at the call instead of the file); T2 holds both shapes.
  - **m-4**: distinct exits (the gate: 2 the usage, 3 no base, 4 an unreadable input; `write`: 1, 2, 4); T5 purges `GITHUB_BASE_REF` and
    `ORACLE_BASE` from each child and holds the text `no base:`; run under those two variables (green) and without its purge (red: 4
    instead of 3), §8.
  - **m-5**: §10.3, the exact fallback: the two tools (the reporter of §2.1 byte for byte, `tcf-fallback.mjs` in full), the commands,
    the count **and** the own summary compared; played here on a1's heads.
  - **m-6**: `run.mjs:137` and `:162-163` in PR-2, in place; the assertion of `ORACLE_BASE` and its killer; the test
    `oracle_reads_the_tests_of_test_main` and its killer on a unique text of l.163; +18 lines counted (§6.3); `test/oracle-run.test.ts`
    asked of MONARK (Q-10); the oracle from before PR-2 passes on an `ORACLE_BASE` set by the host (measured, §2.9).
  - **m-7**: §10 and §13 rewritten: MONARK's commit (addendum, ETAT) before the T of PR-1; PR-2 from a trunk that carries PR-1; the
    trigger "before the G7 of the part that follows a1" (#237); a1 before, between or after the two pull requests.
  - **Notes of the G2**: 1 (the trunk and its two changed counts, §1.2); 2 (2 932 = 2 932 under Windows, §1.2, §9); 3 (the direct
    commits, §3, §13, Q-12); 4 (the pull requests open at PR-2's merge, §10.2, §13); 5 (the Windows comparison from PR-1's G7 on, §9;
    the static key of the record, set aside, §12); 6 (`DERIVED_HEADER`, l.449, §2.8); 7 (the ETAT line that says "≥", §2.3, §11).
  - **Decisions**: Q-1 to Q-9 folded (§15); new questions Q-10 to Q-13.
  - **Unchanged since v1**: the reporter's code of §2.1 (only its 4th comment line rewritten), the options of `test:main`, the exact
    record, the rule of the list, the job (its last line apart: `node scripts/test-count-check.mjs`), the export, the oracle's
    derivation, the constructions set aside in v1.
- **2026-10-08, this note** (RECHERCHES, `claude-opus-5-5` max, the author of PR-1, from 09:07 UTC): the plan v2 in English, as the
  design note of the change, on the trunk `52d1e0b7`; Q-10 to Q-13 written as decided by `729de62` (§9, §11, §13, §15); the sequence of
  `34879a7` (no delta G2 of the plan; PR-1 from `52d1e0b7`; MONARK's documents-only trunk commit merged into the branch) in §10.2 and
  §15; MONARK's filing of `l2_record_loop_schedules` under L2-HARNESS-FIXED-UNTIL-1 (`40ef50b`) in §1.2. PR-1's branch is
  `recherches/test-count-floor-1-record`. The design is the plan's, unchanged.
- **2026-10-08, the fold of PR-1's review** (RECHERCHES, `claude-opus-5-5` max, a fresh instance, from 11:10 UTC; G2 `033dca28`,
  CORRECTIONS, no M finding): **m-1**, the trunk moved during the review to `c5030fd9` (#249: one more test in
  `test/verifier-tool-ci.test.ts`), then to `d9cb6ef3` (#243: a new test file, `test/no-host-address.test.ts`, 13 tests); the branch
  merges `d9cb6ef3` (`05644724`, a plain merge), and the record is written once, as MONARK asked (`6ea4513`), by `write` on that merge,
  from a full run of `test:main` (288 files, 2 960 tests, each file with a summary of its own): one line new, one count from 6 to 7, no
  drop; the rule in §2.3. **m-2**: the ETAT line corrected in place by MONARK at `20fffe9f` (§2.3, §10.2, §11); PR-1's size, 455 at the
  prototype and 461 as built (§0). **n-1**: about 661 (§10.2). **n-2**: the Windows replay from a path with no junction or symbolic
  link, and the realpath planned for PR-2 (§9). **n-3**: the reporter's four comment lines in plain English, no line moved (§2.1).
  Apart from those four comment lines, no line of code changes.
