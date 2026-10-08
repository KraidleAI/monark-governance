# G0 — TEST-COUNT-FLOOR-1, PR-2: the gate that holds each run of the main suite to the committed record, and each drop from the base to a declared removal line

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), a fresh instance, the author of PR-2, distinct from the authors of the plan
  and of PR-1 and from their reviewers. 2026-10-08, the clock read by `date -u`: 13:17 UTC at the start, the trunk read at 13:18 UTC
  and again at 13:50 UTC; this note from 13:50 UTC.
- **Demand**: the plan v2 (recherches `2ad8514`, `coordination/pieces/2026-10-08-G0-test-count-floor/G0-TEST-COUNT-FLOOR-1.md`),
  everything it marks PR-2: §2.4 to §2.9, the tests T4 to T6 of §4, the killers of §5, the size of §6.3. MONARK `acd4c6c` (recherches,
  `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-250-fusion.md`): #250 (PR-1) merged at `3128869e`, its G7 green, the Windows
  parity of the record exact (288 of 288 files, 2 960 of 2 960 tests, each file with a summary of its own); PR-2 starts from `3128869e`
  on `recherches/test-count-floor-1b`, with the job after `ci.yml` l.304; the window is open.
- **The design of both pull requests**: `docs/G0-lot-test-count-floor-1.md`, PR-1's note, on the trunk (its §2.4 to §2.10 describe
  PR-2's pieces). This note is PR-2's as built: what it adds and where, at the trunk `3128869e`; its tests and killers; its proofs; its
  size; and where it departs from the plan (§9).
- **Decisions**: MONARK `380b4b6` (Q-3: 20 minutes; Q-4 (a): `ORACLE_BASE` at `scripts/oracle/run.mjs:137`, in place; Q-6:
  `{file, from, to, reason}`, a rename written as a removal plus an entry; Q-9: `scripts/oracle/run.mjs:163` in place, in PR-2); `729de62`
  (`…-MONARK-vers-RECHERCHES-tcf-q10-q13.md`; Q-10: `test/oracle-run.test.ts` open to PR-2, +12 lines, on condition that l.137 and
  l.162-163 of `scripts/oracle/run.mjs` change in place without moving an anchor; Q-13: in the window, no other pull request writes
  `test/test-counts.json`); `99864a9` (`…-MONARK-vers-RECHERCHES-fenetre.md`: the other pull requests of the window merge without
  touching the record; PR-2 takes their rises by `write`, and a drop takes its removal line in PR-2, its reason naming the pull request
  that made it); `c11a755` (`…-MONARK-vers-RECHERCHES-tronc-rouge.md`: #250 first; the realpath of the reporter, which PR-1's note §9
  planned for PR-2, is an item of its own, REPORTER-REALPATH-1, outside PR-2); `acd4c6c` (above).
- **Base**: trunk `lot/etude-suite` = `3128869e` ("Merge #250 …"; explicit refspec, `ls-remote` at 13:18 and 13:50 UTC). PR-1's record,
  `test/test-counts.json` at `3128869e` (blob `77db91b8`, 290 lines): 288 files, 2 960 tests, written by `write` on #250's merge with
  `d9cb6ef3` (`e0c808cd`); from `e0c808cd` to `3128869e` only files under `docs/` changed. **The `file:line` addresses below hold at
  `3128869e`**; those of the new lines, at PR-2's head.
- **Zone of PR-2**: new, `scripts/test-count-check.mjs` and its `.d.mts`, `test/test-count-check.test.ts`, `test/test-count-removals.json`
  and this note; in place, `.github/workflows/ci.yml` (the job, after l.304), `scripts/export-public.mjs` l.438-439, l.449 and l.450,
  `test/export-public.test.ts` l.426-428 and l.434, `scripts/oracle/run.mjs` l.137 and l.162-163, `test/oracle-run.test.ts` (+12
  lines), and `test/test-counts.json`, rewritten by `write`. **No line of PR-1 changes** (PR-1's note §2.10): neither the reporter, nor
  `scripts/test-count-floor.mjs`, nor `test/test-count-floor.test.ts`, nor `package.json`.
- **Series bytes**: none opened; no CSV, no page, no `requests.jsonl`, `missing.json` or manifest. The suites read the repository's
  fixtures as the CI does; only their counts are reported.
- **Measurement host**: Linux, 4 cores, Node v24.21.0, the repository's TypeScript 6.0.3; a host shared with other agents, the full
  suite runs and the killer campaign taken under the shared host lock (`scripts/oracle/lock.mjs`, FIFO).

## 0. In short

- **The gate**, `scripts/test-count-check.mjs` (new, 60 lines; `.d.mts`, 5 lines): it imports `RUN`, `RECORD`, `readRun`, `runProblems`
  and `recordText` from PR-1's module, which it does not touch, and adds P2 (the run equals the record, file by file) and P4 (each drop
  from the base's record against exactly one removal line added since the base), the base, and the command line
  `node scripts/test-count-check.mjs [--base <rev>]`.
- **The removal list**, `test/test-count-removals.json` (new, `[]`): one line `{file, from, to, reason}` per drop meant.
- **The job** `g3-test-count`, after `ci.yml` l.304 (24 lines): `npm ci`, `npm run test:main`, then the gate; internal, dropped from the
  public workflow (`INTERNAL_JOBS`).
- **The oracle**: `ORACLE_BASE: base` passed to the gates (`scripts/oracle/run.mjs:137`), and the `tests` field read from the suite's gate as the real
  tree names it, `test:main` (`scripts/oracle/run.mjs:162-163`).
- **The record** is rewritten by `write` on PR-2's own tree, merged with the trunk of the moment; one removal line per drop since
  PR-1's record, its reason naming the pull request that made it; a rise needs no line.
- **Tests**: three new (T4 to T6, `test/test-count-check.test.ts`), one new in an existing file (`oracle_reads_the_tests_of_test_main`),
  and two pins of the plan changed in place (the closed list of test 42(f'), and `ORACLE_BASE` in
  `oracle_gates_see_no_foreign_credential`).
- **Red proof**: the default mode, F2P and new-module (not test-only).
- **Size**: 251 lines in CI form, against 208 in the plan (§8), the lines of the window included; the bound is 547.

## 1. The gate: `scripts/test-count-check.mjs`

Each problem is one `::error::` line. P1 and P3 are PR-1's rules; the gate judges them again on its own inputs:

| Rule | Refuses | Message (start) |
|---|---|---|
| **P1**, a summary of its own (`runProblems`, `scripts/test-count-floor.mjs:20-23`) | a file of the run without a summary of its own; tests reported without a file | `<f>: no report of its own (N test(s) under its name): …`; `N test(s) reported without a file` |
| **P2**, the run equals the record (`recordProblems`, l.17-20) | a different count, a rise as well as a drop; a file of the run absent from the record; a file of the record absent from the run | `<f>: N test(s) run, M in test/test-counts.json`; `<f>: N test(s) run, not in …`; `<f>: in … (M), not in the run` |
| **P3**, the written form (l.55) | the record is not the text that `write` writes (`recordText`), or a count is not an integer ≥ 0 | `test/test-counts.json: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)` |
| **P4**, each drop has its line (`dropProblems`, l.27-38) | a drop from the base's record (a file gone counts 0) without exactly one line added since the base, at its numbers; an added line that names no drop; a line that is not `{file, from, to, reason}` with `from > to >= 0`, integers, a file and a reason not empty; a line of the base changed or removed | `<f>: 3 test(s) at the base, 2 here: wants one line {"file":"<f>","from":3,"to":2,"reason":"..."} in test/test-count-removals.json`; `… names no drop since the base`; `… is not a line {file, from, to, reason} …`; `K line(s) of the base changed or removed; the list only grows` |

- **The base** (l.45): `--base <rev>`; else `origin/$GITHUB_BASE_REF` (the CI: `ci.yml:18-19`, `pull_request` only); else `$ORACLE_BASE`
  (the local oracle, §4); else **exit 3** (`no base: …`). The base's record and list are read at the merge base of `HEAD` and that
  revision (l.50-52), as the size gate reads its range (`ci.yml:100`): in CI, `HEAD` is the pull request's merge and the base is the
  target's tip. A record absent at the base counts as `{}`, a list absent as `[]` (`git ls-tree` tells the absence, l.51); a file
  present but not a record or a list is exit 4. PR-2's own base is the case (ii) of PR-1's note §2.6: PR-1's record and no list, so P4
  judges each drop since PR-1's record.
- **The head's inputs** are the files of the working tree, as `write` writes them: the run (`test-counts.out.json`), the record and the
  list. **Exits**: 0 green; 1 a problem; 2 the usage; 3 no base; 4 an input unreadable (the run, the record, the list, the merge base,
  or a file of the base). Without a run file, exit 4: closed by default.
- **The list only grows**: each line of the base's list must stay in the head's, once, as the same JSON text (l.28-30); the other lines
  are the added ones. The hint line is written by `JSON.stringify` (l.34): no text `from` followed by a quote in `scripts/`, which the
  specifier scan of `packages/rpc-guard/test/durable.test.ts:282-289` reads (PR-1's note §2.5).
- The gate's main guard is `import.meta.main !== false` (l.42), as `scripts/test-count-floor.mjs:30`: the test imports the module and
  runs nothing.

## 2. The removal list: `test/test-count-removals.json`

`[]` at PR-2, plus one line per drop since PR-1's record if the window made one (§5). A line is `{"file": "…", "from": 3, "to": 2,
"reason": "…"}`: `to` at 0 for a file removed or renamed; the reason names the pull request (a usage that the review reads; the gate
holds only that it is not empty, Q-6). A rename is a removal of the old path (`to: 0`), and the new path enters the record. The list
stays at the trunk as the register of the tests removed.

## 3. The job `g3-test-count` and its export

- **Place**: after `ci.yml` l.304, the last line of `g3-verifier-tool`, the job the plan names (the plan's l.296, before #249 added
  the checkout of the spec vectors, `ci.yml:293-300`); the job is l.305-328 at PR-2's head (l.305 blank, its key l.306). No existing
  line moves. Its text is the plan's §2.7, byte for byte, 24 lines.
- **Steps**, at PR-2's head: checkout with `fetch-depth: 0` (`ci.yml:318`: the merge base, its record and list; and the suite, whose
  `bell_served_collector_revision_is_a_collector_commit` reads the history, `ci.yml:175-177`); setup-node 24 with the npm cache; `npm
  ci`; `npm run test:main` (`ci.yml:326`); then the gate, its own step (`ci.yml:328`). Bound 20 minutes (Q-3), as g3-verification for the
  same suite (`ci.yml:169-171`). Neither `if:` nor `continue-on-error` (`ci.yml:3-4`), no permissions block, actions at the SHAs
  already pinned. `ci_jobs_have_timeout_and_test_flags_locked` (`test/ci-gates.test.ts:1813`) still sees the suite run only as
  `test:main` and `test:export` (l.1839-1840): the job runs `npm run test:main`, no bare `node --test`.
- **Export**, in place: `INTERNAL_JOBS` (`scripts/export-public.mjs:450`) gains `"g3-test-count"`; its comment (l.438-439) and the
  text of `DERIVED_HEADER` (l.449) name it. The job is the last of the file and internal: `derivePublicWorkflow` removes it from its key
  to the end (l.464-474), after `g3-verifier-tool` took the blank line above it, so the retained job bodies stay byte for byte those of
  the source, and only the header's text changes in the derived workflow. `test/export-public.test.ts`: the closed list of test 42(f')
  (l.434) gains the job; the killer `", \"g3-export\"]" -> "]"` (l.427), whose text is no longer on l.450, becomes
  `"\"g3-export\", " -> ""`; a killer for the new entry joins them, right above the test.

## 4. The oracle (Q-4 (a), Q-9, Q-10)

- **`ORACLE_BASE: base, `** in `genv` (`scripts/oracle/run.mjs:137`), right before `npm_config_offline: "true", `, whose SDL killer
  (`test/oracle-run.test.ts:133`) keeps its text, once on the line. `base` is the verified `--base` (l.54), present in the clone (r25
  reads it, l.143). The oracle removes every `GITHUB_*` (`DENY`, l.40 and l.47), so without that line the gate would exit 3 there; the
  oracle now sets the name itself, over any value of the host (`childEnv`, l.174, copies the host's first). With PR-2's job, the oracle
  derives one more locked gate, `node scripts/test-count-check.mjs`, after `test:main` and `test:export`, and runs `npm run test:main`
  once (`new Set`, l.129), in the clone (l.142): the gate reads the run file that `test:main` has just written there.
- **The `tests` field** (l.162-163): the summary is read from the gate named `test` or `test:main`
  (`/^test(:main)?$/`, once on l.163), so the field is no longer `null` on the real tree, whose suite gate is `test:main`.
- **Tests** (Q-10, +12 lines): one assertion in `oracle_gates_see_no_foreign_credential` (the name `ORACLE_BASE` reaches both gates
  of the fixture) and its killer in the body; `oracle_reads_the_tests_of_test_main`, a fixture whose suite gate is `npm run
  test:main`, which wants `tests` = `{ total: 3, pass: 3, fail: 0, skip: 0 }` and that gate to see `ORACLE_BASE` = the oracle's base
  while the host sets another value; its killer `scripts/oracle/run.mjs:163 CONST "/^test(:main)?$/" -> "/^test$/"` right above it.
  The fixture's size bound is raised from 5 to 50 lines in that test only, since the size gate also counts the test's own edit of
  the fixture.

## 5. The window: the record rewritten on the merged tree, and the removal lines

- **The rule** (PR-1's note §2.3 and §2.6; MONARK `99864a9`): PR-2 rewrites `test/test-counts.json` by `npm run test:main && node
  scripts/test-count-floor.mjs write`, never by hand, on its own tree merged with the trunk of the moment. It carries one removal line
  for each drop since PR-1's record, its reason naming the pull request that made it. The drops are measured by comparing PR-1's record
  at `3128869e` with a fresh run at PR-2's head; then `node scripts/test-count-check.mjs --base origin/lot/etude-suite` names each drop
  with the exact line it expects. A rise needs no line.
- **If the trunk moves before the merge** (#252 may still merge in the window; it adds tests): a plain merge of the trunk ("Merge
  the trunk", no rebase), then `write` again on the merged tree, committed.
- **At `b44c3890`**: PR-2 adds `test/test-count-check.test.ts` (3 tests, a new line) and one test to `test/oracle-run.test.ts`
  (17 → 18). Two pull requests merged in the window, each with a rise and no drop: #255 (`d3a71049`, which replaces #251),
  `test/kata-recalc.test.ts` 6 → 7, and #257 (`b44c3890`), `test/workspace-bin-mode.test.ts`, new, 1 test. The branch merged the
  trunk at `b44c3890` and wrote the record on that merge: 290 files, 2 966 tests, no drop, so no removal line. The measure at the
  head, and the lines it gives, are in the pull request's description.

## 6. Tests red first, and killers

| Test | What it holds | At the trunk (red-proof) |
|---|---|---|
| T4 `test_count_check_holds_the_run_to_the_record_and_each_drop_to_its_line` | P2 on objects: equal; a rise, a file outside the record, a file outside the run; the tests without a file left to P1. P4: no drop (equal, higher, a new file); a drop and a file gone (0); each drop with its line; a line at other numbers (`from`, `to`); two lines for one drop; a line of the base declares no new drop; a line for a file that grew; a line of the base removed; an empty reason, `to` above `from`, `to` below 0, a line without a reason, a line with a fifth key | new-module |
| T5 `test_count_check_names_its_base_or_refuses` | the gate on the command line in a git fixture whose base carries a record and no list (the case (ii)), the change's record and list committed above the base, as in the merge commit that the CI checks out, so that `HEAD` is not the base; **each child gets the environment without `GITHUB_BASE_REF` or `ORACLE_BASE`, then the one variable of its case** (m-4 of the plan): without a base, exit 3 and `no base:`; the drop against `ORACLE_BASE`, read at the merge base, exit 1 and P4's message; `--base` without a value, 2; a base without a record (i), 0; with the line added, `GITHUB_BASE_REF` before `ORACLE_BASE` (0) and `--base` before `GITHUB_BASE_REF` (1); the line committed, a base that carries the record and the list (iii), 0; a run that differs from its record (P2 in the gate), 1; a record outside its written form, 1; P1 in the gate, 1; without a run file, 4 | new-module |
| T6 `test_count_job_runs_test_main_then_the_check` | the job: its three `run:` lines in order (`npm ci`, `npm run test:main`, `node scripts/test-count-check.mjs`), the whole history, a bound above 0 and at most 20, no condition | new-module |
| `export_public_derived_jobs_are_byte_identical` (in place) | the closed list of the dropped jobs gains `g3-test-count` | F2P: the trunk's workflow has no such job |
| `oracle_gates_see_no_foreign_credential` (in place) | the name `ORACLE_BASE` reaches both gates | F2P: the trunk's oracle does not pass it |
| `oracle_reads_the_tests_of_test_main` (new, existing file) | the `tests` field from `test:main`, and the base that gate sees | F2P: `null`, and the host's value |

The three new tests cannot load the module at the trunk: `test/test-count-check.test.ts` imports `scripts/test-count-check.mjs`,
which PR-2 adds, and PR-1's module, which the trunk has; red-proof reads that as new-module (`scripts/red-proof.mjs:186`), never as the
refusal of an import red on a module present at the base (l.187). This is why the plan put PR-2's code in a module of its own (PR-1's
note §6.1).

**Killers**: 28 in `test/test-count-check.test.ts` (one right above each test, the others in the bodies), the three of test 42(f') in
`test/export-public.test.ts` (one rewritten, one new, one kept), 2 new in `test/oracle-run.test.ts`. Those of the gate's module, by
its line at PR-2's head:

| Line | Killer | Test |
|---|---|---|
| l.18 | `"record[f] !== c.tests" -> "record[f] > c.tests"` (P2, the exact count); `"f !== \"\" && " -> ""` (the tests without a file are P1's) | T4 |
| l.19 | `".filter((f) => run[f] === undefined)" -> ".filter(() => false)"` (P2, a file gone from the run) | T4 |
| l.22 | `"Object.keys(r).sort().join() === \"file,from,reason,to\" && " -> ""` (exactly four keys) | T4 |
| l.23 | `" && r.reason.trim() !== \"\"" -> ""`; `" && r.to < r.from" -> ""`; `" && r.to >= 0" -> ""` (a line's shape) | T4 |
| l.29 | `"if (i >= 0) left.splice(i, 1); else " -> ""` (a line of the base counts once) | T4 |
| l.30 | `"if (left.length > 0)" -> "if (false)"` (the list only grows) | T4 |
| l.34 | ROR `"to < from" -> "to <= from"` (what a drop is); `"mine.length === 1 && " -> ""`; `" && mine[0].to === to" -> ""`; `"mine[0].from === from && " -> ""` (one line, at its numbers) | T4 |
| l.36 | `"!((baseRecord[r.file] ?? 0) > (record[r.file] ?? 0))" -> "false"` (a line names a drop) | T4 |
| l.44 | `"stop(2, \"usage" -> "stop(0, \"usage"` (the usage) | T5 |
| l.45 | `": process.env.ORACLE_BASE)" -> ": undefined)"`; `"process.env.GITHUB_BASE_REF ? " -> "false ? "`; `"argv[1] ?? " -> ""` (the base and its order) | T5 |
| l.46 | `"if (!named) stop(3," -> "if (false) stop(3,"` (no base, 3) | T5 |
| l.48 | `"return stop(4," -> "return stop(0,"` (an input unreadable, 4) | T5 |
| l.51 | `"=== \"\" ? none :" -> "=== \"x\" ? none :"` (a file absent at the base); `` "`${base}:${path}`" -> "`HEAD:${path}`" `` (the base's files read at the merge base, not at `HEAD`) | T5 |
| l.52 | `"baseList = atBase(REMOVALS, [], Array.isArray, \"a list [ ... ]\")" -> "baseList = []"` (the base's list read) | T5 |
| l.55 | `"text === recordText(record)" -> "true"` (P3 in the gate) | T5 |
| l.56 | `"...runProblems(run), " -> ""` (P1 in the gate); `"...recordProblems(run, record), " -> ""` (P2 in the gate) | T5 |

And `.github/workflows/ci.yml:328 CONST "node scripts/test-count-check.mjs" -> "node scripts/test-count-floor.mjs write"`,
`.github/workflows/ci.yml:318 CONST "fetch-depth: 0" -> "fetch-depth: 1"` (T6); `scripts/export-public.mjs:450` `", \"g3-test-count\"]"
-> "]"` (new) and `"\"g3-export\", " -> ""` (rewritten), with `"\"g3-verifier-tool\", " -> ""` kept;
`scripts/oracle/run.mjs:137 CONST "ORACLE_BASE: base, " -> ""` and `scripts/oracle/run.mjs:163 CONST "/^test(:main)?$/" -> "/^test$/"`.
Two killers of the trunk name a line that PR-2 rewrites in place, on the same line with their text still once on it:
`test/export-public.test.ts:428` (`export-public.mjs:450`) and `test/oracle-run.test.ts:133` (`scripts/oracle/run.mjs:137`); the anchor checker reads
them as moved in content, not in place (DERIVE), and both stay killed.

## 7. Proofs at the freeze

On PR-2's final head, Node 24.21.0, logs kept: the changed test files; `scripts/red-proof.mjs --base <trunk> --gel <head> --draw 6
--seed 20261008`, the default mode; `scripts/mutants/run.mjs --killers` on the changed test files, every killer killed by an assertion;
the anchor checker on the touched test files and the tree, and `every_killer_line_is_readable`; the whole `npm run test:main`; `node
scripts/test-count-check.mjs --base origin/lot/etude-suite`, red before `write` and green after; T5 once with `GITHUB_BASE_REF` and
`ORACLE_BASE` set in the parent's environment, as the CI and the oracle launch it; `npx tsc --noEmit`, eslint on the touched test files,
`gate:vocab`, `lang:gate`, `lint:ratchet`, `export:check`; the Windows hazards of the diff; `git diff --check`; the address gate
(`test/no-host-address.test.ts`); the size in CI form; and the pull request's CI, `g3-test-count` included: the pull request judges
itself.

## 8. Size: 251 lines in CI form

The measure of the size job (`ci.yml:100`, `docs/**/*.md` excluded) on `origin/lot/etude-suite...HEAD`, by file, at the base
`b44c3890`: `test/test-count-check.test.ts` 120; `scripts/test-count-check.mjs` 60; `.github/workflows/ci.yml` 24;
`test/oracle-run.test.ts` 12; `scripts/export-public.mjs` 8 (+4 −4); `test/export-public.test.ts` 7 (+4 −3); `scripts/oracle/run.mjs` 6
(+3 −3); `scripts/test-count-check.d.mts` 5; `test/test-counts.json` 8 (+5 −3: two new lines, two counts changed, a comma on the
former last line); `test/test-count-removals.json` 1. **251**, against 208 in the plan: 34 more in the test file (eleven more killers
than the plan's 17, three more cases in T5, a fifth malformed line in T4, and the cases written out), 4 more in the module, and 5 more
in the record, the lines of the two pull requests merged in the window (§5). If another pull request merges first, its lines join:
two lines of the record per file whose count changes, one per new file, and one removal line per drop. The bound is 547 per change
(1 205 in CI).

## 9. Departures from the plan

- **The job's place**: after `ci.yml` l.304 (the plan's l.296, which #249 moved by eight lines); its killers at l.318 and l.328 (the
  plan's l.310 and l.320). The job's text and price are the plan's.
- **The size** (§8) and **eleven more killers** (§6): P2's tests without a file left to P1; a line at another `from`; `to` ≥ 0; the
  usage exit 2; `GITHUB_BASE_REF` before `ORACLE_BASE`; P1 in the gate; the exit 4 of an unreadable input; and, from the review (§12),
  the base's files read at the merge base, P2 in the gate, exactly four keys in a line, and the base's list read.
- **`oracle_reads_the_tests_of_test_main`** also holds the value of `ORACLE_BASE` that the suite's gate sees, the oracle's base over a
  host's value: the plan's assertion in `oracle_gates_see_no_foreign_credential` holds the name only. Same 10 lines; the +12 lines of
  Q-10 hold.
- **The realpath of the reporter** (PR-1's note §9, last bullet: "Planned for PR-2") is not here: MONARK made it the item
  REPORTER-REALPATH-1 (`c11a755`), and PR-2 changes no line of PR-1.
- **This note** is a note of its own; PR-1's note stays as merged.

## 10. Windows (MONARK's replay at the merge, Q-5)

The gate under the oracle on the merge (P1 to P4, with `ORACLE_BASE`); T5's git fixture (`core.autocrlf=false`, LF written by
`recordText`, no two names equal once case is folded); the job's `run:` lines read with `\r?\n`. A Windows-specific skip set on a
parent or a `describe` reddens P2 under Windows only (PR-1's note §9, Q-11): none at the trunk.

## 11. Changelog

- **2026-10-08, this note** (RECHERCHES, `claude-opus-5-5` max, the author of PR-2, from 13:50 UTC): PR-2 as built on the trunk
  `3128869e`, from the plan v2 and PR-1's note; MONARK's decisions `380b4b6`, `729de62`, `99864a9`, `c11a755` and `acd4c6c` folded as
  decided; the departures in §9.
- **2026-10-08, the fold of the review** (`claude-opus-5-5` max, a fresh instance, from 16:16 UTC): §0, §5, §6, §8 and §9 rewritten
  in place for the new cases and for the record written on the merge with `b44c3890`; §12.

## 12. The fold of the review

The review of PR-2 at `95de758f` (recherches `ef02eaf2`: two minor findings and five notes, no major finding), folded on the branch
by plain commits:

- **The gate's command line in the shape of the CI** (`a081d2b1`): in T5, the change's record and list are committed above the base,
  as the merge commit that the CI checks out carries them, so that `HEAD` is not the base; and a case gives the gate a run that
  differs from its record. Reading the base's files at `HEAD` instead of the merge base (`scripts/test-count-check.mjs:51`), or
  leaving P2 out of the gate (l.56), passed the tests before, with a false green on a fixture shaped like the CI; each now fails T5.
- **Two more mutations held** (`6a5fa7e8`): a removal line with a fifth key is refused (T4, l.22); and the gate passes against a base
  that carries both the record and the list, the case (iii) of every pull request after this one (T5, l.52: the base's list read).
  No other mutation line moved.
- **The trunk moved during the review**: #255 and #257 merged; the branch merged the trunk at `b44c3890` (`f24dec80`) and wrote the
  record on that merge (`9dacd02b`, §5).
- **Notes for the maintainer**, with no change in this pull request:
  - The gate sees numbers, not names: a test renamed, or replaced by an empty test, in the same file keeps the count. It holds only
    that a removal line's reason is not empty, so a reason that names another pull request, or the hint's `"..."` kept as it is,
    passes. The review of each pull request reads the diff of its test files and the reasons of its removal lines.
  - A pull request whose base is another pull request's branch is judged in CI against that branch: if the branch predates the
    record, its record counts as `{}` and no drop is seen (P2 still holds the run to the record). #238, based on #237's branch, which
    has no record, is one. Its review can run `node scripts/test-count-check.mjs --base origin/lot/etude-suite`, or the parent can
    merge the trunk first; the oracle, whose base is the trunk, judges it right.
  - Once this pull request is merged, each open pull request whose run changes a count turns `g3-test-count` red on its next run,
    until it merges the trunk and writes its lines (#252: `apps/sentinel/test/sentinel-chainstack-guard.test.ts`, 15 → 17). Of two
    pull requests of the window, whichever merges second writes the record on its merge with the trunk.
  - `scripts/mutants/run.mjs` launches its test runs without the blocking-stdout preload that `test:main` loads
    (`scripts/mutants/run.mjs:209`): in the review's mutation run, `test/ci-gates.test.ts` reported 31 of its 44 tests. A lost report
    can only hide a failure, never make a kill; the tool is outside this change.
