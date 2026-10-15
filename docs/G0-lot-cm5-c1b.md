# G0 — CM5-c1b: the core of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `6cdbebbc` (the loader, CM5-c1a,
  merged by #290).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, v6): row c1b
  (section 5), the counts (section 3: unit, quarter, `n_test`, `k_test`, drops, instants out of the cell, the venue instance of rule 8),
  the pose of `kata_lib`'s globals and the declared rewrite (section 5.2 (E) and (G)), tests L-T1 to L-T4 and L-T16b (section 5.3).
- **No series byte read.** Every run is on synthetic data: the series of `fixtures/kata-quarter/` (c1a), variants of them made by the
  tests, and a made-up registry. The wave 1 registry of the trunk (`apps/harness/data/kata/registry/wave1.json`, sha256 prefix
  `811fcd57`, measured with `sha256sum` at `6cdbebbc`) is the one `count` is built for; no test reads it.

## 1. What this lot delivers (code that runs)

- `tools/kata-quarter/quarter_core.py` (new, no `__main__`), the core of the count, with the frozen tool's functions imported, never
  copied, and `tools/kata-recalc/` untouched:
  - `registry_rows` (l.22-42): the registry read under io_guard's role `registry`, refused before parsing unless its sha256 is the pin
    given; the rows of status `region` (the counted rows of wave 1, plan section 3.1: two at the trunk), each matched to its cell by
    `recalc_p2.cells_of` (kind range or path, kata, side); a row refused by name unless it is a band or path cell at attempt 1 with its
    `W`, a factor table whose `kata_lib.seq_sha256` is its `factorTableSha256`, and a numeric `qhat`. A direction row is refused (none is
    counted in wave 1 or 2, plan section 3.4).
  - `lookback` (l.45-47): the longest input window of the rows counted, `W` bars of h (404 hours for the 4h EWMA band).
  - `venue_halts` (l.50-68): the venue instance of rule 8 (S22, plan section 3.4): the halts [E, R) of every read, grouped by their
    missing candles (the declared slots in [E, R)) and their resumption (the first grid slot at or after R); a group seen on every symbol
    read is one interval, E the earliest, R the latest, applied to each symbol; any other halt stays its symbol's. It runs after the
    loading of all symbols and before any drop is posed.
  - `count_row` (l.71-88): the declared rewrite of the out/drop/in classification and of the score for the block Q (plan 5.2 (G):
    `recalc_p2.decisions_for` codes its three blocks, l.158-176, and `point` is a closure of `calibrate_cell`, l.272-288). For each grid
    instant t: the kata on `kata_lib.window_at`, `recalc_p2.sigma_hat` with the row's factor table; **out** (`out_input`) when sigma_hat
    is not computable (an incomplete input window); **drop** (`drops.label`) when the label of the row's class (`r` for range, `D` or `U`
    for path, from `kata_lib.labels_at`) is not formed, or when its window [t, t + h) meets a halt (rule 8 (a)); else **in** (`n_test`),
    a **miss** (`k_test`) when the score, one binary64 division as `calibrate_cell` writes it, is strictly above `qhat`.
  - `count` (l.91-109): the pose of plan 5.2 (E), in a `try` restored in `finally`: `REC_START` = S_k minus the longest window, at the
    00:00Z before it; `REC_END` = E_k; `BLOCKS` = `{"Q": (S_k, E_k)}`. Under it the grid is `kata_lib.decision_times("Q", h)` (S_k ≤ t ≤
    E_k − h, plan section 3.2), and the bars are built and read under that one pose.
- `tools/kata-quarter/quarter_counts.py`: the subcommand `count` (l.74-90, parsed at l.102-107) and the closed list `FLAGS` (l.27,
  empty: no option, so no call, traffic or served history enters a count, addendum 9 point 2). Usage:
  `python -E -S -s -B -P quarter_counts.py count <registry> <registry sha256> <sealed series dir> <live series dir> <quarter k>
  <symbol folder>:<sealed sha256 | pinned, quarter 1 only>:<live sha256> ...`. Each folder is read twice and merged by `quarter_load`
  (c1a) with the lookback of the rows; a counted row whose folder is not named, a folder named twice, or `pinned` after quarter 1 is a
  named refusal. `month` still answers `not in this lot`.
- `tools/kata-quarter/FILES`: the line `quarter_core.py`.

**What `count` prints**, on stdout: the model line, a comment line, **one canonical JSON line** (sorted keys, no spaces, by
`json.dumps`), the input lines of io_guard (role, base name, sha256, bytes of the registry, each series and each `missing.json`), and
`VERDICT: GREEN`. The JSON holds: `quarter` {k, start, end}; `registry_sha256`; `series` per folder {sealed and live pins, declared
gaps}; `pose` {rec_start, rec_end, lookback_hours}; `grid` per horizon {instants, first, last}; `halts` (each interval applied, its
`start_ms`, `end_ms` and folders); and per counted row `task_class`, `key`, `calib_attempt`, `alpha`, `horizon`, `n_test`, `k_test`,
`drops_label`, `out_input`. No price, no instant of a miss, no digest of the misses.

**What it does not print yet**: `u_test` and the firing, the evidence file `kata-quarter-counts-v1` and its writer `report.canonical`,
the identity block, the completeness variant, the first and last served instants, the served history (lot c2); the identity of the tool
at its commit and the `tool-tree` role (c1d); the fdlibm pass (c1c); wave 2 rows (c3).

**The halts today.** The loader of c1a stops on any irregular close time (`recalc_p2.load_series`), so it yields no halt, and `count`
on a real series poses none: rule 8 and 8 bis in the loader (the truncated candle, E and R) are the pre-declared CM5-c1a-2. The venue
pass and the rule 8 (a) drop are in place and read each read's `halts`; the test L-T16b gives them through a stand-in of that loader
in a copy of the two trees (below).

## 2. Tests and their killers

`test/kata-quarter.test.ts` (ten tests: the five of c1a, five new), run from the temporary git repository of
`test/helpers/kata-quarter-repo.ts`. The new tests run `count` on the registry `fixtures/kata-quarter/registry/wave1-syn.json` (three
region rows of the made-up symbol `syn`: `syn-range-1h`, `syn-range-4h`, `syn-mae-down-1h`, kata `ewma-vol-hw-v1`; one silence and one
vetoed row not counted) and on series that the tests make from the c1a fixture: its three LIVE gaps filled with made-up candles (a
quarter with no gap), shifted by a quarter for Q_2, or with candles removed and declared in `missing.json`. The first assertion of each
new test is the existence of `quarter_core.py` (red at the base by assertion).

| Test (plan) | What it holds | Killer |
|---|---|---|
| `quarter_grid` (L-T1), l.231 | no gap: Q_1 2208 instants at 1h and 552 at 4h, Q_2 2160 and 540, all in `n_test`, no drop, none out; first S_k, last E_k − h | `quarter_core.py:97 CONST "{\"Q\": (s_k, e_k)}" -> "{\"Q\": (s_k, e_k + K.H_MS[\"4h\"])}"` (the grid is `decision_times` read under the pose, so the plan's `"E_k - h"` lives in the pose) |
| `counts_ignore_traffic` (L-T2), l.246 | `--calls` refused by name, exit 2 | `quarter_counts.py:27 CONST "FLAGS = [" -> "FLAGS = [\"--calls\", "` |
| `drop_on_missing_candle` (L-T3), l.258 | (i) the candle at E_1 − 15 min: `n_test` − 1, `drops.label` + 1, `out_input` + 0 on the three rows; (ii) a candle inside a bar: path + 1 drop, range + 0; (iii) a candle closing a 1h bar: range and path + 1 drop; `out_input` + W′ = 101 each time (the bar fully inside Q) | `quarter_core.py:83 CONST "lab is None" -> "False"` |
| `miss_is_strict` (L-T4), l.276 | `syn-range-1h` with `qhat` 0, on a series where one instant has two equal closes (score 0): the same misses as with `qhat` 5e-324, fewer than `n_test` | `quarter_core.py:87 CONST "> qhat" -> ">= qhat"` |
| `venue_instance_one_interval` (L-T16b), l.294 | two symbols (`syn`, `alt`), the same five candles removed (12:45 to 13:45Z), halts [12:00:00, 14:00) and [11:58:59.001, 14:00): one instance [11:58:59.001, 14:00) on both; each `range-1h` row drops t = 11:00 (only by the earlier E) and 12:00, 102 instants out | `quarter_core.py:64 CONST "min(es)" -> "es[0]"` |

The halts of L-T16b come from a stand-in of the loader of rule 8: the test copies the two trees of the helper's repository into a
temporary folder, appends to the copy's `quarter_load.py` a `read_series` that adds the halts to the LIVE read, and launches the copy's
entry (the form of c1a's homonym test). Production code is not changed by it; when c1a-2 merges, its loader replaces the stand-in.

The c1a killers that the edits moved: `quarter_counts.py:13` (was 14), `:100` (was 77), `:54` (was 50); `FILES:3` (was 2) and `FILES:4`
(was 3), `quarter_core.py` taking line 2; in `test/verifier-tool-ci.test.ts`, `scripts/verifier-tool-ci.mjs:142` (was 131) and `:174`
(was 162).

**Red-before recipe** (logs kept): each killer applied alone to the worktree, the test file run under TAP, the file restored from the
bytes read before (sha256 checked). Measured: the 16 killers of `test/kata-quarter.test.ts` and the 6 of the three driver tests of
`test/verifier-tool-ci.test.ts`, each red on its test, each restored.

## 3. The carried items of the c1a review, closed

- **KQ-TEST-COUNT-FLOOR-1** (the file's tests outside the count floor): `scripts/verifier-tool-ci.mjs:128-130` pins `QUARTER_TESTS`,
  the names of the file's tests; `quarterTestProblems` (l.138-145) wants the summary counts of that list and each name passed once
  (`ok N - <name>`), so a test removed from the file, or added to it alone, reds the job. `verifier_tool_driver_pins_the_second_tree_test_names`
  (`test/verifier-tool-ci.test.ts:221`, in `test:main`) holds `QUARTER_TESTS` equal to the tests the file declares, in order, and a run
  that lost one test while another passed twice refused; killer `verifier-tool-ci.mjs:144`.
- **KQ-SECOND-TREE-REFUSAL-TEST-1**: the presence map of `main()` is the pure `presenceOf` (l.133), used at l.159; the same test holds
  the second tree without its test file refused by `accountProblems` and admitted with it; killer `verifier-tool-ci.mjs:133 CONST
  "present[QUARTER] === true && !quarterTest" -> "false"` (the probe of the review).
- **KQ-WINDOWS-REPLAY-1**: the hand replay of `node --test test/kata-quarter.test.ts` under Windows is MONARK's, at the merge: the local
  oracle lists the driver as CI only and `test:main` excludes the file, so no gate runs it there. Its red at `6cdbebbc` (MONARK, recherches
  `3ff9442`: `two_reads_merged_under_check` red under Windows CPython 3.14.5, Python's stdout ending its lines with CR LF) is fixed:
  `linesOf` (`scripts/verifier-tool-ci.mjs:121`, a split on `/\r?\n/`) reads the interpreter probe (l.151) and, through
  `test/helpers/kata-quarter-repo.ts:16` and l.53, every stdout and stderr of the tool that a test reads (joined with LF, so the
  multiline `$` of the tests' matches holds too); `kata_quarter_output_read_by_lines_cr_lf_or_lf` (`test/verifier-tool-ci.test.ts:238`)
  feeds it `"a\r\nb\r\n"` and reds on Linux under its killer `verifier-tool-ci.mjs:121`. MONARK replays it under Windows after the merge.

## 4. Measures

- R-25: 419 changed lines (371 insertions, 48 deletions; bound 547; the plan's estimate ~350, ~455 at +30 %), by `r25()` of
  `scripts/oracle/r25.mjs` against `6cdbebbc`; the registry fixture (`.json`) and this note are outside the count.
- `test/kata-quarter.test.ts`: 10 tests, 10 pass, under a CPython 3.14.8 build (as the job runs it, the driver's judge
  `quarterTestProblems` empty on its TAP) and under the host's CPython 3.11; run offline, no egress, 0 refused connections; the helper's
  `git add` judged by the case-fold wrapper, 0 collisions.
- `test:main`: 3153 tests in 307 files, 3130 passed, 23 skipped (the trunk's skips), 0 failures, run offline (0 refused connections)
  under the host lock; the two new tests of `test/verifier-tool-ci.test.ts` are its only change. `test/test-counts.json` and
  `test/test-names.json` by `node scripts/test-count-floor.mjs write`; `node scripts/test-count-check.mjs --base 6cdbebbc` green, 0 drops.
- Gates: `tsc --noEmit`, eslint on the touched `.ts` files, `gate:vocab`, `lang:gate`, `export:check`, `lint:ratchet`: green. Killer
  anchors at `6cdbebbc`: all anchored.

## 5. Not in this lot

- **L-T0a** (`kata_lib` blob unchanged and globals restored) and **L-T14** (`labels_fn_pinned`): the plan's table puts them in c1b, the
  zone row and the brief of this lot name L-T1 to L-T4 and L-T16b only; the restoration they hold is in code (`quarter_core.py:95-107`).
- `u_test`, the firing, the evidence file and the served history (c2); the fdlibm pass and the oracle acts L-O0 to L-O2 (c1c); the
  identity at the commit (c1d); rule 8 in the loader (c1a-2); wave 2 rows (c3).
