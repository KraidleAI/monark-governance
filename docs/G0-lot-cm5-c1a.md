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
  `not in this lot` and exit 2). An exception nothing names is caught at the top: its type and message, no trace, exit 2.
- `quarter_load.py`, the loader (no `__main__`). Two reads of one symbol by `recalc_p2.load_series`, imported from the frozen tool,
  never copied (each read hashes the bytes and refuses them before parsing unless the sha256 is the pin it is given): read 1, the sealed
  series under its original range (quarter 1: `kata_lib.REC_START` to `REC_END`, which ends at S_1, and the pin of `recalc_p2.SYMBOLS`
  through `sealed_pin`; a later quarter: the previous quarter under its range and the posted pin); read 2, the LIVE series under
  [S_k, E_k) and the pin posted at its sealing. Both pins come to `check` as arguments and are printed. Then the controlled merge:
  read 1 ends exactly where read 2 starts (S_k); no instant is in both; every grid slot from S_k minus the lookback (the longest input
  window of the rows counted, an argument of `check`, 404 hours for the 4h EWMA band) to E_k is present in the merged candles or listed
  in the `missing.json` of the read that owns it. An **undeclared gap is a named refusal**; a declared gap stays a gap (the count
  decides its drop later); a slot listed missing and present in the series, listed off the grid or outside its read's range, is refused.
- `FILES`, the list file of the second tree, in the form io_guard reads: ASCII, one name per line ended by LF, sorted, each once, the
  list file named in it.

`check` prints the quarter, the two reads (range, pin, rows), the merged range (its seam, slots, present, gaps), each declared gap, the
inputs io_guard noted, and `VERDICT: GREEN`. Usage: `python -E -S -s -B -P quarter_counts.py check <sealed series dir> <live series dir>
<symbol folder> <quarter k> <sealed sha256 | pinned> <live sha256> <lookback hours>`.

## 2. The three contract points, folded

1. The list file `FILES` lives beside the `quarter_*.py` modules and is the one file of the folder that is not `quarter_*.py`; the test
   `kata_quarter_names_disjoint_from_kata_recalc` admits it and holds every other file to `quarter_*.py`, with no stem of the frozen tool.
2. io_guard's own refusals end the launch with exit 4: a name of the folder outside the list, a listed name without its file, and a
   homonym of the two trees (measured here, in the same test: `report.py` posed and listed in a copy of the two trees, exit 4, the stem
   named). The later lot of the tool's identity (CM5-c1d) keeps that code for its refusals; nothing here contradicts it.
3. The prologue above follows the entry contract: the frozen tool's folder at the end of `sys.path`, `io_guard.py` launched by its path,
   `import io_guard` the first import after `os` and `sys` (held by `kata_quarter_entry_script_imports_the_input_guard_first`).

## 3. Tests and their killers (`test/kata-quarter.test.ts`, four tests)

Every launch of the tool in a test runs from the temporary git repository of `test/helpers/kata-quarter-repo.ts`: one per test file
under `os.tmpdir()`, a copy of `tools/kata-recalc/` and `tools/kata-quarter/` taken from the working tree (regular files only), one
commit, the launch under the `FORM` of `io_guard.py` (read as text, as the CI driver reads it), with none of the caller's `GIT_*`
variables, by the `python` of PATH (else `python3`). The fixture `fixtures/kata-quarter/` holds made-up 15-minute candles of a made-up
symbol `syn` (an LCG, no real series): the sealed folder, the 1616 candles of the 404 hours before S_1; the live folder, the 8829
candles of quarter 1 with three slots declared missing (S_1 itself, the seam; 2026-11-15T12:00Z; 2026-12-24T23:45Z). Each data file is
declared and hashed in a `PROVENANCE-*.md` of its folder (the root test `series_pinned_are_declared_and_hashed` re-verifies it); the
fixture is excluded from the R-25 count.

| Test | What it holds | Killer (one line of production code or of the list file) |
|---|---|---|
| `kata_quarter_entry_script_imports_the_input_guard_first` | the one `__main__` of the folder; the prologue, then `import io_guard`; no subcommand gives the usage and exit 2; `count` and `month` answer `not in this lot`, exit 2 | `tools/kata-quarter/quarter_counts.py:20 CONST "import io_guard" -> "import kata_lib"` |
| `two_reads_merged_under_check` | `check` on the fixture: the two reads under their pins, the merged range from S_1 minus 404 h to E_1 (10448 slots, 10445 present), the three declared gaps listed, `VERDICT: GREEN`; the gap at S_1 left undeclared is refused by name; the candle at S_1 present and declared missing is refused by name | `tools/kata-quarter/quarter_load.py:108 CONST "if undeclared:" -> "if False:"` |
| `kata_quarter_files_are_regular_100644` | every index entry under the folder a merged regular file 100644; `FILES` in its form, equal to the names of the index and of the working tree; the launch from the copy admitted | `tools/kata-quarter/FILES:2 CONST "quarter_counts.py" -> "quarter_count.py"` |
| `kata_quarter_names_disjoint_from_kata_recalc` | no stem of the folder (or of the list) is a stem of the frozen tool; every file `quarter_*.py` but `FILES`; a posed, listed homonym refused by io_guard, exit 4 | `tools/kata-quarter/FILES:3 CONST "quarter_load.py" -> "report.py"` |

**Red-before recipe** (run at the freeze, logs kept): for each killer, the line is changed as written, `node --test
test/kata-quarter.test.ts` runs, the named test is red, the file is restored from the index (sha256 checked). Measured: killer 1 reds
tests 1, 2 and 3; killer 2 reds test 2 alone; killers 3 and 4 red all four (io_guard refuses every launch on a list out of its form).
At the trunk the first assertion of each test is the existence of the file this lot adds (red by assertion, as red-proof wants).

## 4. The CI driver, counts and measures

- `scripts/verifier-tool-ci.mjs` gains the run of `quarter_counts.py check` on the fixture for the second tree: a list of its own
  (`quarterSteps`, judged by `secondTreeProblems`), run by `main()` after the six runs of the frozen tool, whose list and line numbers
  the driver's tests pin (`test/verifier-tool-ci.test.ts`, outside this lot: they still hold, the second tree judged apart). The run is
  judged like the others: exit 0, one `VERDICT: GREEN`, no `FAIL` or `RED` line.
- R-25: 446 changed lines (442 insertions, 4 deletions; bound 547): the tool 213, the tests and the helper 189, the driver 21, the two
  provenance files 23. Above the 420 target of the plan, with rule 8 already left out (below).
- Python: the CI pins CPython 3.14.8; this container runs CPython 3.11.15, under which io_guard's form check, both list checks and the
  hook admit the tool (measured by the tests and by a run of `check`: exit 0). The CI driver refuses this container's interpreter (not a
  3.14) and the spec vectors are absent here, so its full run is CI's. The job that runs the main suite has no `setup-python`: the test
  file uses the runner's `python`; a red there names it.
- Tests: 4 added in 1 new file. With the trunk at `006effba` merged in: 3154 tests in 308 files, 3131 passed, 23 skipped (the skips
  of the trunk), 0 failures, run offline (no egress, 0 refused connections) under the host lock; `test/test-counts.json` and
  `test/test-names.json` by `node scripts/test-count-floor.mjs write`, and `node scripts/test-count-check.mjs --base 006effba` green.

## 5. Not in this lot

- **Rule 8 and 8 bis** (truncated candles: the close-time window of the sealed blocks, the `irregular_close` and `zero_trade` lists
  computed and compared to the manifest, fixture C) and the test `truncated_candle_rule8`: left to the pre-declared **CM5-c1a-2**, as the
  plan allows when the count of this lot would exceed 420 with it (it is at 446 without). `recalc_p2.load_series` still stops on any
  irregular close time; the loader's header says so.
- The test `series_pinned_before_parse`: the pin check is `load_series`'s own (D-3 of the frozen tool), exercised by `check` under its two
  pins; a test of its own goes with CM5-c1a-2.
- The identity of the tool at its commit (the `tool-tree` role, `git_tree`, the refusal in the run when the folder differs from the
  commit's blobs) and the tests of the launch form: **CM5-c1d**. The subcommands `count` and `month`: CM5-c1b, CM5-c2 and CM5-e.
