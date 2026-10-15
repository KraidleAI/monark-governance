# G0 — CM5-c1c: the two logs of the count and the oracle acts of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `ebabd0f9` (the identity of
  the tool, CM5-c1d, merged by #297).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`): row c1c
  (section 5, l.592), the fdlibm pass (section 5.2 (H), l.857-864), L-O0 (l.879-882), the oracle acts and their rule of equality
  (section 5.3, l.939-958), the label drops of L-O1 (l.421), CM5-FDLIBM-MEASURE-1 (l.1256-1258) and R-2 (l.1285-1286), one module
  per lot (l.648, `quarter_oracle`), `run_tool` and the two invocations of L-O0 (l.674, l.817-818), the roles of `check` (l.821).
  There is no separate short G0: this note fixes the choices the plan leaves open, each with the plan line it rests on. Lines of the
  plan are cited `plan l.N`; lines of the code are those of this branch.
- **No series byte read.** Every run here is on the synthetic fixture of `fixtures/kata-quarter/` or on series the tests make. The
  runs of the acts on the host's real series are MONARK's (plan l.592). No new fixture file: the tests write their series and
  registries under `os.tmpdir()`.

## 1. What this lot delivers (code that runs)

- `tools/kata-quarter/quarter_core.py`: `count(reads, rows, span, venue)` (l.131-163) computes every row twice under
  `report.setting` of the frozen tool, imported and never copied (plan l.857-858): `"ln"`, the port `fdlibm_log` memoized, then
  `"base"`, `math.log` as kata_lib runs it. The counts are those of `"ln"` (plan l.858-860, written in advance: the log of V8 under
  which the registry was made and the band is served). Each decision of `"base"` that differs is returned (`differ`), with the
  census of the log in `log`: the inputs of the port, those on which `math.log` differs, the largest distance in ulps, the
  decisions that differ, counted as `report.run_passes` counts them (report.py l.312-314). Nothing stops on a difference (plan
  l.860-862). After each pass kata_lib's globals are held to those taken under the pose, `math` included (L-T0a, plan l.871-875),
  and after the pose to those before it. `count_row` (l.89-106) now returns the decision at each instant (`out`, `drop`,
  `covered`, `miss`) and `tally` (l.109-117) counts them, with `test.months`; `posed` (l.120-128) is the pose of the three globals,
  used by `count` and by L-O0. `registry_rows(path, pin, every)` (l.27-48): `every` takes each band or path row with a qhat, whatever
  its status (the acts).
- `tools/kata-quarter/quarter_counts.py`: `count` prints, after its JSON line, `decision differs <class> <key> <t>: fdlibm_log <d>,
  math.log <d>` for each decision that differs, then `math.log decisions that differ from the fdlibm_log pass, which decides: <n>`;
  `check <act> …` goes to `quarter_oracle.act` (l.119-120); the form of c1a, `check <sealed> <live> …`, is unchanged.
- `tools/kata-quarter/quarter_oracle.py` (new, no `__main__`; plan l.648): the four acts (§2), each writing `<out>/<act>.json`.
- `tools/kata-quarter/FILES`: the line `quarter_oracle.py`.

## 2. The command shape of the acts

```
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check original_values_byte_equal <sealed dir> <out> - - <folder>:<sha256|pinned> ...
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check original_values_byte_equal <sealed dir> <out> <first report> <its sha256> <folder>:<sha256|pinned> ...
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check equals_registry_on_test_block <wave1.json> <sha256> <sealed dir> <out> <folder>:<sha256|pinned> ...
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check pseudo_quarter_2026_07_09 <wave1.json> <sha256> <sealed dir> <out> <folder>:<sha256|pinned> ...
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check fdlibm_measure <wave1.json> <sha256> <sealed dir> <out> <folder>:<sha256|pinned> ...
```

`pinned` is the pin of `recalc_p2.SYMBOLS` (the sealed series of wave 1); `<out>` is absent or an empty folder (`io_guard.output`).
Each act prints the line `identity`, one `DIFFERENCE …` line per difference, `report <act>.json sha256 <sha256>`, its input lines and
`VERDICT: GREEN` (exit 0) or `VERDICT: RED (<n> difference(s), not explained)` (exit 1); a refusal is one `REFUSED:` line, exit 2.

## 3. The choices the plan leaves open, fixed here

| Choice | Fixed as | Rests on |
|---|---|---|
| Where the two passes live | in `quarter_core.count`, the one count of `count` and of the acts, so every count of the tool is computed under both logs | plan l.858 (« chaque relevé est calculé deux fois »), ZONES row c1c |
| The order of the passes | `"ln"` first, then `"base"`: a `math` left replaced by the first pass is refused before the second runs on it | plan l.871-875 (L-T0a, `math` under `report.setting` only) |
| How a differing decision is printed | one line per instant, the class, the key, the instant and both decisions, then their number; in the reports of the acts, the same list (`math_log_decisions`) | plan l.860-861, l.1286 (« imprimée avec son nombre ») |
| The report | canonical JSON of `report.canonical`, ASCII, no final line feed, no path, no time: `format` `kata-quarter-oracle-v1`, `act`, `identity` (the three values of the line `identity`), `inputs` (role, name, sha256, bytes), `rule`, `result`, `differences`, `equal`; named by its sha256 on the line `report` | plan l.939 (« rapport épinglé par sha256, sur le modèle de `compare_p2.py` et `report.py` »), report.py l.8-9 |
| The rule of equality | every field compared is a decision (integers, a decimal string, a boolean, a map of them): strict equality of their canonical writings, so `true` never equals `1`; any difference is not explained, since the deciding pass is already that of the generator's log | plan l.958, report.py l.9-13 |
| L-O0, which invocation is which | the first reassigns nothing: it reads each series by `recalc_p2.load_series` as the frozen tool does and computes under kata_lib's globals as they are; the second poses the three globals at their original values through `posed`, the pose of the count, reads the first report under `oracle-output`, refused before parsing unless its sha256 is the pin given, and compares | plan l.817-818, l.879-882 |
| L-O0, the outputs compared | for each symbol and horizon on the TEST block: `build_bars`, `decision_times`, `window_at` for each W of kata_lib (each window by its first bar and length, the bars being compared whole), `labels_at`; each named by the sha256 of its `repr` (a double's `repr` gives back its bits), so equal digests are equal bytes | plan l.880 |
| L-O1, UTest and vetoed | written as `recalc_p2.calibrate_cell` writes them (l.367-373): `binom_exact.miss_upper_bound` under `DELTA`, `"1"` when every point misses, null with no point; `vetoed` from the calibration status and `binom_upper_tail_leq`; computed here to be compared, never written into an evidence file (that is c2's) | plan l.941-943, l.594 (c2) |
| L-O1, the pose | the count on the block `TEST` of kata_lib, the sealed series alone as the merged read of each symbol | plan l.941 (« pose aux bornes du TEST ») |
| L-O2 | the count on [2026-07-01, 2026-10-01) against the sums of `n` and `k` of the months 2026-07, 2026-08 and 2026-09 of `test.months` | plan l.946-947 |
| The measure | `fdlibm_measure` counts on the TEST block of the sealed series and reports the census of the log and each decision that differs; the acts on the registry report the same census | plan l.863-864, l.1256-1258 |

## 4. Departures from the plan, argued

- **L-O1 compares the band and path rows, not the 280 cells** (plan l.941-942 writes « pour les 280 cases »). The tool counts no
  direction cell: `registry_rows` refuses one (`cell["kind"] == "dir"`, quarter_core.py l.41) and kata-quarter has no direction
  kata or threshold. The act compares every band and path row of the registry that has a qhat, whatever its status (the 40 band cells
  of wave 1, plan l.947); a cell under calibration (no qhat) has no kTest to compare.
- **The report is written also when it differs**, exit 1, as `compare_p2.py` writes its output (compare_p2.py l.12-14), and not only
  when it is equal as `report.py` does (report.py l.9): the plan names both models (l.939), and the list of differences is what
  MONARK's run must keep.
- **`check` of c1a declares the five roles of plan l.821** (`series`, `recorder`, `registry`, `oracle-output`, `tool-tree`); before,
  it declared three. Its reads are unchanged.
- **The measure counts the inputs of this tool's path** (the scale kata of the band and path rows and their labels), not the whole
  recomputation of the 280 cells whose figure « 444 of 327 983 » report.py l.14-15 cites: it is the frequency on the path the count
  takes, which is what R-2 asks of it (plan l.1285-1287).
- **The count's JSON line gains `log`, and each row `months`**: the format of the evidence is closed by c2 (plan l.594), not here.

## 5. Tests (test/kata-quarter.test.ts; each turned red by the killer it names, applied alone)

| Test | Killer |
|---|---|
| `fdlibm_log_pass_decides` (new): on the fixture the two logs decide alike; in a repository of its own whose `fdlibm_log.log` is moved by 1 (a stand-in, since the two logs decide alike on synthetic series), every input differs and the counts are those of `math.log` moved by each printed decision | `quarter_core.py:155` the passes swapped (the `math.log` pass decides); `quarter_core.py:160` the census made constant |
| `original_values_byte_equal` (new): two invocations, equal; the first report under another pin refused by name | `quarter_core.py:125` the pose of `REC_START` moved by one hour (the killer of plan l.881-882) |
| `equals_registry_on_test_block` (new): on a made series (hourly closes 100 and 101 in turn) the count gives the registry's fields worked out from it; a kTest changed is named; `fdlibm_measure` reports the same census | `quarter_oracle.py:108` drops.test held to `out_input`; `quarter_oracle.py:133` the measure judged |
| `pseudo_quarter_2026_07_09` (new): equal; a count of 2026-08 changed is named; one of 2026-06 is not read | `quarter_oracle.py:39` the pseudo quarter from 2026-06-01 |
| `kata_lib_blob_unchanged_and_globals_restored` (one case added): `math` left replaced after the pass under `fdlibm_log` is refused after that pass | `quarter_core.py:150` the check after each pass removed |
| `kata_quarter_tree_refused_unless_at_its_commit` (two cases added; items KQ-TOOLTREE-MODE-TEST-1, KQ-IDENTITY-NO-COMMIT-CASE-1): `binom_check.py` committed 100755 by `git update-index --chmod=+x`, refused with `['binom_check.py']`; a repository with no commit, refused by the name of that refusal | `quarter_identity.py:48` (mutant G6 of the G2 of #297); `quarter_identity.py:46` (mutant G5) |

The other tests of the file are unchanged but for the line numbers of thirteen killers (`quarter_core.py` gained four imports, and the
entry one) and the shared helper, which now exports its `git`. In `test/verifier-tool-ci.test.ts`,
`verifier_tool_driver_owes_each_run_of_each_check` now holds the three arguments of the run of `binom_check.py` in its D-2 mode, so
its declared killer (`scripts/verifier-tool-ci.mjs:53`, `join(w, "hikae.txt")` emptied) turns it red (item
VERIFIER-TOOL-CI-HIKAE-KILLER-1); QUARTER_TESTS names the four new tests and their number is 21.

## 6. What this lot does not do

- It runs no act on a real series: MONARK runs them on the host and keeps their reports (plan l.592), with the killers the plan
  measures at the freeze on that run (plan l.881-882, l.944-945).
- It writes no u_test, firing or evidence file into the count (c2), and no `month` (lot e).
