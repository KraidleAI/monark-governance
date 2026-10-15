# G0 — CM5-c1b: the core of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `6cdbebbc` (the loader, CM5-c1a,
  merged by #290), the trunk merged in since (section 4). Folded after its review round 1 (#294, recherches `5d88288`; section 6).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, v6): row c1b
  (section 5), the counts (section 3: unit, quarter, `n_test`, `k_test`, drops, instants out of the cell, the venue instance of rule 8),
  the pose of `kata_lib`'s globals and the declared rewrite (section 5.2 (E) and (G)), tests L-T0a, L-T1 to L-T4, L-T14 and L-T16b
  (section 5.3).
- **No series byte read.** Every run is on synthetic data: the series of `fixtures/kata-quarter/` (c1a), series made by the tests, and a
  made-up registry. The wave 1 registry of the trunk (`apps/harness/data/kata/registry/wave1.json`, sha256 prefix `811fcd57`, measured
  with `sha256sum` at `6cdbebbc`) is the one `count` is built for; no test reads it.

## 1. What this lot delivers (code that runs)

- `tools/kata-quarter/quarter_core.py` (new, no `__main__`), the core of the count, with the frozen tool's functions imported, never
  copied, and `tools/kata-recalc/` untouched:
  - `registry_rows` (l.23-44): the registry read under io_guard's role `registry`, refused before parsing unless its sha256 is the pin
    given; the rows of status `region` (the counted rows of wave 1, plan section 3.1: two at the trunk), each matched to its cell by
    `recalc_p2.cells_of`; a row refused by name unless it is a band or path cell at attempt 1 with its `W`, a factor table whose
    `kata_lib.seq_sha256` is its `factorTableSha256`, and a numeric `qhat` (a direction row: none is counted in wave 1 or 2, plan 3.4).
    It also returns **the venue's symbol folders**: those of every row of the registry, whatever its status (wave 1: the four symbols).
  - `kata_lib_state` (l.47-56): kata_lib's globals as L-T0a reads them (plan 5.2, C14 (a)): a container copied (dict, list, tuple,
    nested), a number, string or None as it is, a module or a function by its id and type.
  - `lookback` (l.59-61): the longest input window of the rows counted, `W` bars of h (404 hours for the 4h EWMA band).
  - `venue_halts` (l.64-82): the venue instance of rule 8 (S22 l.95-97, plan section 3.4): the halts [E, R) of every read, grouped by
    their missing candles (the declared slots in [E, R)) and their resumption (the first grid slot at or after R); a group seen on
    **every symbol of the venue** is one interval, E the earliest, R the latest, applied to each symbol; any other halt stays its
    symbol's. It runs after the loading of all symbols and before any drop is posed.
  - `count_row` (l.85-102): the declared rewrite of the out/drop/in classification and of the score for the block Q (plan 5.2 (G):
    `recalc_p2.decisions_for` codes its three blocks, l.158-176, and `point` is a closure of `calibrate_cell`, l.272-288). For each grid
    instant t: the kata on `kata_lib.window_at`, `recalc_p2.sigma_hat` with the row's factor table; **out** (`out_input`) when sigma_hat
    is not computable (an incomplete input window); **drop** (`drops.label`) when the label of the row's class (`r` for range, `D` or `U`
    for path, from `kata_lib.labels_at`) is not formed, or when its window [t, t + h) meets a halt (rule 8 (a)); else **in** (`n_test`),
    a **miss** (`k_test`) when the score, one binary64 division as `calibrate_cell` writes it, is strictly above `qhat`.
  - `count` (l.105-125): the pose of plan 5.2 (E), in a `try` restored in `finally`: `REC_START` = S_k minus the longest window, at the
    00:00Z before it; `REC_END` = E_k; `BLOCKS` = `{"Q": (S_k, E_k)}`. Under it the grid is `kata_lib.decision_times("Q", h)` (S_k ≤ t ≤
    E_k − h, plan section 3.2), and the bars are built and read under that one pose. After the `finally`, kata_lib's state must equal
    its state before the count, or the run is refused by name (l.122-123): the pose not restored, or a global changed in place.
- `tools/kata-quarter/quarter_counts.py`: the subcommand `count` (l.74-91, parsed at l.103-108) and the closed list `FLAGS` (l.27,
  empty: no option, so no call, traffic or served history enters a count, addendum 9 point 2). Usage:
  `python -E -S -s -B -P quarter_counts.py count <registry> <registry sha256> <sealed series dir> <live series dir> <quarter k>
  <symbol folder>:<sealed sha256 | pinned, quarter 1 only>:<live sha256> ...`. The folders named must be **the venue's symbol folders**
  (l.80-82), each read twice and merged by `quarter_load` (c1a) with the lookback of the rows; a folder named twice, `pinned` after
  quarter 1, or a set of folders other than the venue's is a named refusal. `month` still answers `not in this lot`.
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

**The venue's symbols** (finding m-3). The plan forms the instance « après le chargement des quatre symboles et avant toute pose de
drop » (G0-CM-5-PLAN-1.md l.409-410), from S22 l.95 « a halt seen on every recorded symbol ». Of the two ways the review left open, the
text supports reading them all: count takes the venue's symbols from the registry (the folders of all its rows: for wave 1 the four of
`recalc_p2.SYMBOLS`; for the two-symbol fixture of L-T16b, its two) and refuses a run that does not name exactly them, so a wave 1 count
loads btc, eth, bnb and sol although only btc and bnb hold region rows.

## 2. Tests and their killers

`test/kata-quarter.test.ts` (fourteen tests: the five of c1a, nine of this lot), run from the temporary git repository of
`test/helpers/kata-quarter-repo.ts`. The tests run `count` on the registry `fixtures/kata-quarter/registry/wave1-syn.json` (three region
rows of the made-up symbol `syn`: `syn-range-1h`, `syn-range-4h`, `syn-mae-down-1h`, kata `ewma-vol-hw-v1`; one silence and one vetoed
row not counted) or on a variant the test writes, and on series that the tests make: the c1a fixture with its three LIVE gaps filled
(a quarter with no gap), shifted by a quarter for Q_2, or with candles removed and declared in `missing.json`; or a series made so that
every score is known. The first assertion of each test is the existence of `quarter_core.py` (red at the base by assertion).

| Test (plan) | What it holds | Killers |
|---|---|---|
| `quarter_grid` (L-T1), l.231 | no gap: Q_1 2208 instants at 1h and 552 at 4h, Q_2 2160 and 540, all in `n_test`, no drop, none out; first S_k, last E_k − h | `quarter_core.py:111 CONST "{\"Q\": (s_k, e_k)}" -> "{\"Q\": (s_k, e_k + K.H_MS[\"4h\"])}"` (the grid is `decision_times` read under the pose, so the plan's `"E_k - h"` lives in the pose) |
| `counts_ignore_traffic` (L-T2), l.246 | `--calls` refused by name, exit 2 | `quarter_counts.py:27 CONST "FLAGS = [" -> "FLAGS = [\"--calls\", "` |
| `drop_on_missing_candle` (L-T3), l.258 | (i) the candle at E_1 − 15 min: `n_test` − 1, `drops.label` + 1, `out_input` + 0 on the three rows; (ii) a candle inside a bar: path + 1 drop, range + 0; (iii) a candle closing a 1h bar: range and path + 1 drop; `out_input` + W′ = 101 each time (the bar fully inside Q) | `quarter_core.py:97 CONST "lab is None" -> "False"` |
| `miss_is_strict` (L-T4), l.276 | `syn-range-1h` with `qhat` 0, on a series where one instant has two equal closes (score 0): the same misses as with `qhat` 5e-324, fewer than `n_test` | `quarter_core.py:101 CONST "> qhat" -> ">= qhat"` |
| `venue_instance_one_interval` (L-T16b), l.303 | two symbols; day 1: the same five candles removed, halts [12:00:00, 14:00) and [11:58:59.001, 13:59:30) (E and R apart, one resumption): one instance [11:58:59.001, 14:00) posed on both; day 2: the same resumption, other missing candles: two halts of their own; with a third symbol of the venue that saw neither, no instance at all | `quarter_core.py:78 CONST "min(es)" -> "es[0]"` |
| `k_test_exact_on_a_made_series` (m-1), l.329 | hourly closes 100 and 101 in turn, lows 99.8, highs 101.1, `qhat` 0.9: `k_test` of range-1h (where the factor is 1, score 1/f) and of mae-down-1h (after a close at 101, factor 1 or 1.25, score 1.2/f) worked out by the test; range-4h all out | `quarter_core.py:101` (the range score's `abs`), `:96` (down and up swapped), `:91` (another factor table) |
| `count_refuses_by_name` (m-4), l.353 | exit 2 and the refusal: a registry under another pin, a row at attempt 2, a folder named twice, the venue's folders not all named | `quarter_core.py:29`, `:37`; `quarter_counts.py:78`, `:80` |
| `kata_lib_blob_unchanged_and_globals_restored` (L-T0a), l.374 | `kata_lib.py` in the index is the blob `d4a6373a` of sha256 `60a2adf3`; a count exits 0 with the globals restored; a count during which `KATA_FUNCS` gains a key in place is refused by name | `quarter_core.py:121 CONST "K.REC_START, K.REC_END, K.BLOCKS = saved" -> "saved = saved"` |
| `labels_fn_pinned` (L-T14), l.389 | `kata_lib.py` l.353-374 is `labels_at`, sha256 `b5ca57f7`; `count_row` labels by `K.labels_at` | `quarter_core.py:95 CONST "K.labels_at" -> "local_labels"` |

The halts of L-T16b, and the in-place change of L-T0a, come from a stand-in: the test copies the two trees of the helper's repository
into a temporary folder, appends code to the copy's `quarter_load.py` (a `read_series` that adds the halts to the LIVE read; a
`build_bars` that adds a key to `KATA_FUNCS`), and launches the copy's entry (the form of c1a's homonym test). Production code is not
changed by it; when c1a-2 merges, its loader replaces the halts stand-in.

`test/verifier-tool-ci.test.ts` (in `test:main`): `verifier_tool_driver_runs_the_second_tree_test_file` (l.192, c1a's, its judge now
by names), `verifier_tool_driver_pins_the_second_tree_test_names` (l.221) and `kata_quarter_output_read_by_lines_cr_lf_or_lf` (l.242),
section 3.

**Red-before recipe** (logs kept): each killer applied alone to the worktree, the test file run under TAP, the file restored from the
bytes read before (sha256 checked). Measured: the 25 killers of `test/kata-quarter.test.ts` and the 7 of the three driver tests, each red
on its test, each restored; and the review's 18 mutants M1 to M18 (M7 and M12 on the lines that replaced theirs), each red.

## 3. The carried items of the c1a review, closed

- **KQ-TEST-COUNT-FLOOR-1** (the file's tests outside the count floor): `scripts/verifier-tool-ci.mjs:128-131` pins `QUARTER_TESTS`,
  the names of the file's tests; `quarterTestProblems` (l.139-146) wants the summary counts of that list and each name passed once
  (`ok N - <name>`), so a test removed from the file, or added to it alone, reds the job. `verifier_tool_driver_pins_the_second_tree_test_names`
  holds `QUARTER_TESTS` equal to the tests the file declares, in order, and a run that lost one test while another passed twice refused;
  killer `verifier-tool-ci.mjs:145`. A test removed **with** its name (nit-7): the same test writes the number of names, 14 (l.227), so
  that removal changes a line of `test:main`'s own test file, as a removal line does for the floor of `test:main`.
- **KQ-SECOND-TREE-REFUSAL-TEST-1**: the presence map of `main()` is the pure `presenceOf` (l.134); the same test holds the second tree
  without its test file refused by `accountProblems` and admitted with it (killer `verifier-tool-ci.mjs:134`), and main's call
  `presenceOf(present, quarter)` (l.160) with `quarter` set from the test file's existence (finding m-5, killer `:160`).
- **KQ-WINDOWS-REPLAY-1**: the hand replay of `node --test test/kata-quarter.test.ts` under Windows is MONARK's, at the merge: the local
  oracle lists the driver as CI only and `test:main` excludes the file, so no gate runs it there. Its red at `6cdbebbc` (MONARK, recherches
  `3ff9442`: `two_reads_merged_under_check` red under Windows CPython 3.14.5, Python's stdout ending its lines with CR LF) is fixed:
  `linesOf` (`scripts/verifier-tool-ci.mjs:121`, a split on `/\r?\n/`) reads the interpreter probe (l.152) and, through
  `test/helpers/kata-quarter-repo.ts:16` and l.53, every stdout and stderr of the tool that a test reads (joined with LF, so the
  multiline `$` of the tests' matches holds too); `kata_quarter_output_read_by_lines_cr_lf_or_lf` feeds it `"a\r\nb\r\n"` and reds on
  Linux under its killer `verifier-tool-ci.mjs:121`. MONARK replays it under Windows after the merge.

## 4. Measures

MEASURES

## 5. Not in this lot, and what is carried

- **CM5-c1a-2, halts from real data** (carried, nit-8): the c1a loader stops on any irregular close time, so on a real series with a
  truncated candle `count` is refused (`recalc_p2.py:109-110`, « open or close time », exit 2) instead of counting; the venue pass and
  rule 8 (a) are reached only through the stand-in of L-T16b. Red case: a LIVE series holding one truncated candle (fixture B or C of
  L-T16), refused today; counted, with its [E, R) and drops, once CM5-c1a-2 merges. With it, L-T16b's case of R off the grid on real
  data (the review's nit-6 proposal) moves to that loader's fixtures.
- `u_test`, the firing, the evidence file and the served history (c2); the fdlibm pass and the oracle acts L-O0 to L-O2 (c1c, which
  counts twice in one process: L-T0a's guard holds it); the identity at the commit (c1d); wave 2 rows (c3).

## 6. Fold of the review round 1 (recherches `5d88288`)

| Finding | What changed | Test, killer |
|---|---|---|
| m-1, no exact `k_test` | `k_test_exact_on_a_made_series` | the review's M3, M9 and M10 red (killers `quarter_core.py:101`, `:96`, `:91`) |
| m-2, L-T0a part 2 and L-T14 | `kata_lib_state` and the refusal after the `finally` (`quarter_core.py:47-56`, `:122-123`); the two tests | M1 red (killer `:121`), `:95` |
| m-3, the venue over argv | `registry_rows` returns the venue's folders; `venue_halts(reads, venue)`; the entry refuses other folders (`quarter_counts.py:80-82`) | L-T16b's third symbol; probe P-venue: the same intervals with two or three folders named, one instance only when the four see the halt; M7 on its new line red |
| m-4, count's refusals | `count_refuses_by_name` | M4, M13, M17, and M12 on its new line, red |
| m-5, main's call of `presenceOf` | an assertion in `verifier_tool_driver_pins_the_second_tree_test_names` | M11 red (killer `verifier-tool-ci.mjs:160`) |
| nit-6, one R and one missing set | L-T16b: R a resumption apart from its grid slot on one symbol, and a second pair of halts with other missing candles | M2, M14, M15 red |
| nit-7, a test removed with its name | the number of names written in the driver test (section 3) | reading |
| nit-8, what is carried | section 5 | none |
