# G0 — CM5-c1a: the loader of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `8014e5e7`, then
  `006effba` merged in (no file of this lot in common but the two test count records).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, v6), its rows
  c1a (section 5), the loader contract (section 5.2 (D) and (F)) and its tests (section 5.3); the entry contract CM5-G0-ENTRY-CONTRACT-1
  (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-cm5-entry-contract.md`), folded here, in code, with no new plan.
- **No series byte read.** The tool runs on a synthetic fixture only; the pins of the real sealed series stay in `recalc_p2.SYMBOLS`.

## 1. What this lot delivers (code that runs)

`tools/kata-quarter/` is the second tree of the closed list of `tools/kata-recalc/io_guard.py` (`TREES`). Three files:

- `quarter_counts.py`, the one entry script. Its first lines are the prologue of the frozen tool's own entry scripts, in the two-tree form:
  `import os, sys`, then `io_guard.py` of the frozen tool run **by its path** (never found by name), the frozen tool's folder appended
  **last** to `sys.path`, then `import io_guard` before any other module. io_guard then checks the launch form (`python -E -S -s -B -P`),
  the closed list `FILES` of its own folder and the list file `FILES` of this folder, refuses a homonym of the two trees, and installs its
  audit hook before any input is read. The entry then appends its own folder (so `quarter_load` is found by name, read under the second
  tree's list), and `identity()` holds, as `if`s with exit 2 (never an `assert`), that the `io_guard` module of `sys.modules` is the one
  at `tools/kata-recalc/io_guard.py`, that every module loaded under a name of the frozen tool's list, or from its folder, is that file,
  and that no module of this folder bears one of those names. Subcommands: `check` (this lot), `count` and `month` (they print
  `not in this lot` and exit 2). Every argument is parsed under the top-level catch (ASCII digits only): a bad one is the usage, a
  refusal or an exception nothing names one line, its type and message, no trace, exit 2. `pinned` is admitted for quarter 1 only.
- `quarter_load.py`, the loader (no `__main__`). Two reads of one symbol by `recalc_p2.load_series`, imported from the frozen tool,
  never copied (each read hashes the bytes and refuses them before parsing unless the sha256 is the pin it is given): read 1, the sealed
  series under its original range (quarter 1: `kata_lib.REC_START` to `REC_END`, which ends at S_1, and the pin of `recalc_p2.SYMBOLS`
  through `sealed_pin`; a later quarter: the previous quarter under its range and the posted pin); read 2, the LIVE series under
  [S_k, E_k) and the pin posted at its sealing. Both pins come to `check` as arguments and are printed. The two ranges meet at S_k by
  construction, and `load_series` refuses any candle outside the range it reads under (`tools/kata-recalc/recalc_p2.py` l.111-112, « off
  grid, out of range or not ascending »): that is what keeps the two reads apart, and the merge has no check of its own for it. The
  controlled merge: every grid slot from S_k minus the lookback (the longest input window of the rows counted, an argument of `check`,
  404 hours for the 4h EWMA band) to E_k is present in the merged candles or listed in the `missing.json` of the read that owns it. An
  **undeclared gap is a named refusal**; a declared gap stays a gap (the count decides its drop later). `missing.json` is held to its
  form: a whole count, whole `open_time_ms` values (never a bool, a float or a string), each written again by its `open_time_utc`; a
  slot listed missing and present in the series, listed off the grid or outside its read's range, is refused.
- `FILES`, the list file of the second tree, in the form io_guard reads: ASCII, one name per line ended by LF, sorted, each once, the
  list file named in it.

`check` prints the quarter, the two reads (range, pin, rows), the merged range (its seam, slots, present, gaps), each declared gap, the
inputs io_guard noted, and `VERDICT: GREEN`. Usage: `python -E -S -s -B -P quarter_counts.py check <sealed series dir> <live series dir>
<symbol folder> <quarter k> <sealed sha256 | pinned, quarter 1 only> <live sha256> <lookback hours>`.

## 2. The three contract points, folded

1. The list file `FILES` lives beside the `quarter_*.py` modules and is the one file of the folder that is not `quarter_*.py`; the test
   `kata_quarter_names_disjoint_from_kata_recalc` admits it and holds every other file to `quarter_*.py`, with no stem of the frozen tool.
2. io_guard's own refusals end the launch with exit 4: a name of the folder outside the list, a listed name without its file, and a
   homonym of the two trees (measured here, in the same test: `report.py` posed and listed in a copy of the two trees, exit 4, the stem
   named). The later lot of the tool's identity (CM5-c1d) keeps that code for its refusals; nothing here contradicts it.
3. The prologue above follows the entry contract: the frozen tool's folder at the end of `sys.path`, `io_guard.py` launched by its path,
   `import io_guard` the first import after `os` and `sys` (held by `kata_quarter_entry_script_imports_the_input_guard_first`).

## 3. Tests and their killers (`test/kata-quarter.test.ts`, five tests)

Every launch of the tool in a test runs from the temporary git repository of `test/helpers/kata-quarter-repo.ts`: one per test file
under `os.tmpdir()`, a copy of `tools/kata-recalc/` and `tools/kata-quarter/` taken from the working tree (regular files only), one
commit, the launch under the `FORM` of `io_guard.py` (read as text, as the CI driver reads it), with none of the caller's `GIT_*`
variables, by the interpreter that `KATA_QUARTER_PYTHON` names (the job's pinned CPython, set by the driver), else the `python` of PATH
(else `python3`) for a run by hand. The fixture `fixtures/kata-quarter/` holds made-up 15-minute candles of a made-up
symbol `syn` (an LCG, no real series): the sealed folder, the 1616 candles of the 404 hours before S_1; the live folder, the 8829
candles of quarter 1 with three slots declared missing (S_1 itself, the seam; 2026-11-15T12:00Z; 2026-12-24T23:45Z). Each data file is
declared and hashed in a `PROVENANCE-*.md` of its folder (the root test `series_pinned_are_declared_and_hashed` re-verifies it); the
fixture is excluded from the R-25 count.

| Test | What it holds | Killers (lines of production code or of the list file) |
|---|---|---|
| `kata_quarter_entry_script_imports_the_input_guard_first` | the one `__main__` of the folder; the prologue, then `import io_guard`; no subcommand gives the usage and exit 2; `count` and `month` answer `not in this lot`, exit 2; a quarter written `²` gives the usage, no trace; `pinned` for quarter 2 is refused by name | `quarter_counts.py:14 CONST "import io_guard" -> "import kata_lib"`; `quarter_counts.py:77 CONST "a.isascii() and " -> ""`; `quarter_counts.py:50 CONST "pin1 == \"pinned\" and k != 1" -> "False"` |
| `two_reads_merged_under_check` (L-T18) | `check` on the fixture: the two reads under their pins, the merged range from S_1 minus 404 h to E_1 (10448 slots, 10445 present), the three declared gaps listed, `VERDICT: GREEN`; refused by name: the gap at S_1 undeclared, the candle at S_1 present and declared missing, the candle at S_1 in the sealed read too (an instant in both reads, refused by the range of read 1), and a `missing.json` with a float, a string, a bool count or a wrong `open_time_utc` | `quarter_load.py:108 CONST "if undeclared:" -> "if False:"`; `quarter_load.py:67 CONST "= start, end" -> "= start, end + K.STEP_MS"`; `quarter_load.py:75` (the whole-number test, and the `open_time_utc` test); `quarter_load.py:78 CONST "bad or not whole(count)" -> "bad"` |
| `series_pinned_before_parse` (L-T5) | a sealed read and a LIVE read under another pin: exit 2, the refusal of D-3 before parsing, both digests named | `tools/kata-recalc/recalc_p2.py:89 CONST "got != pinned" -> "False"` (the check is the frozen tool's own) |
| `kata_quarter_files_are_regular_100644` (L-T21) | every index entry under the folder a merged regular file 100644; `FILES` in its form, equal to the names of the index and of the working tree; the launch from the copy admitted | `FILES:2 CONST "quarter_counts.py" -> "quarter_count.py"` |
| `kata_quarter_names_disjoint_from_kata_recalc` (L-T22) | no stem of the folder (or of the list) is a stem of the frozen tool; every file `quarter_*.py` but `FILES`; a posed, listed homonym refused by io_guard, exit 4 | `FILES:3 CONST "quarter_load.py" -> "report.py"` |

**Red-before recipe** (run at the freeze, logs kept): for each killer, the line is changed as written, the test file runs, the named test
is red, the file is restored from the bytes read before (sha256 checked). Measured: each of the eleven killers of this file reds its
test; the import killer reds tests 1 to 4, the two list killers all five (io_guard refuses every launch on a list out of its form). At
the trunk the first assertion of each test is the existence of a file this lot adds (red by assertion, as red-proof wants).

## 4. The CI driver, counts and measures

- **The job of the test file** (plan section 5.4, C15, way (ii), the plan's default): `test/kata-quarter.test.ts` is excluded by name from
  `test:main` (its root glob `test/!(kata-quarter).test.ts`; `npm test` still runs it) and run in the internal job `g3-verifier-tool`:
  `scripts/verifier-tool-ci.mjs` runs `node --test --test-reporter=tap test/kata-quarter.test.ts` after the six runs of the frozen tool,
  with `KATA_QUARTER_PYTHON` set to the interpreter it probed (the pinned CPython 3.14.8 of `setup-python`), and requires exit 0 and a
  summary of exactly the tests the file declares, each passed (`quarterTestProblems`); a second tree on disk without that file is refused
  by `accountProblems` again. The job's Python setup and its bound are unchanged; no other job sets up or runs a Python.
- R-25: 537 changed lines (524 insertions, 13 deletions; bound 547), after the fold (446 before it).
- Python: the CI pins CPython 3.14.8; this container runs CPython 3.11.15, under which io_guard's form check, both list checks and the
  hook admit the tool. The test file was run here under 3.11.15 and, through the driver, under a CPython 3.14.8 build (5 tests, 5 pass).
- Tests: 3151 in 307 files in `test:main` (3128 passed, 23 skipped, the trunk's skips; 0 failures), run offline (no egress, 0
  refused connections) under the host lock; `test/kata-quarter.test.ts` (5 tests) runs in `g3-verifier-tool`. `test/test-counts.json`
  and `test/test-names.json` by `node scripts/test-count-floor.mjs write`; `node scripts/test-count-check.mjs --base 006effba` green, 0
  drops (the base never held the file).

## 5. Not in this lot

- **Rule 8 and 8 bis** (truncated candles: the close-time window of the sealed blocks, the `irregular_close` and `zero_trade` lists
  computed and compared to the manifest, fixture C) and the test `truncated_candle_rule8`: left to the pre-declared **CM5-c1a-2**, as the
  plan allows when the count of this lot would exceed 420 with it (it is at 446 without). `recalc_p2.load_series` still stops on any
  irregular close time; the loader's header says so.
- The identity of the tool at its commit (the `tool-tree` role, `git_tree`, the refusal in the run when the folder differs from the
  commit's blobs) and the tests of the launch form: **CM5-c1d**. The subcommands `count` and `month`: CM5-c1b, CM5-c2 and CM5-e.

## 6. Fold of the review round 1

| Finding | What changed |
|---|---|
| m-1, a lax parse of `missing.json` | `tools/kata-quarter/quarter_load.py:72-81`: `whole()` (l.26-28, `type(v) is int`), every `open_time_ms` and the count whole, each `open_time_utc` equal to `iso(open_time_ms)`, a named refusal otherwise; four variants in `two_reads_merged_under_check` |
| m-2, no duplicate case, unreachable merge checks | the seam and both-reads checks of `merge()` dropped (`merge()`, `quarter_load.py:93-97`, no dead code): the range of `load_series` keeps the reads apart (`recalc_p2.py` l.111-112, said in the header and in section 1); the instant in both reads added to the test, refused by name |
| m-3, an argument refusal with a trace | `tools/kata-quarter/quarter_counts.py:76-89`: arguments parsed inside the try, `a.isascii() and a.isdigit()`; the case `²` in the entry test |
| m-4, a driver refusal that could not fire | `secondTreeProblems`, `quarterSteps` and `QUARTER_FIXTURE` removed from `scripts/verifier-tool-ci.mjs`; `quarterTestProblems` and `declaredTests` (l.126-133) judge the run of the test file, and `accountProblems` again refuses a second tree without its run (l.147); `verifier_tool_driver_runs_the_second_tree_test_file` in `test/verifier-tool-ci.test.ts`, red when the judge is made constant |
| m-5, the job of the test file not chosen | way (ii), section 4: `package.json:17`; `test/ci-gates.test.ts` (a) and `test/test-count-floor.test.ts:107` read the one exclusion of the root glob; the helper takes `KATA_QUARTER_PYTHON` (`test/helpers/kata-quarter-repo.ts:45`); the assertion « no other job sets up or runs a Python » of `test/verifier-tool-ci.test.ts` holds as written |
| nit-6, L-T5 moved without a decision | `series_pinned_before_parse` added: L-T5 is in this lot |
| nit-7, `pinned` for any quarter | `quarter_counts.py:50-52`: refused by name for quarter 2 and later; one case |
