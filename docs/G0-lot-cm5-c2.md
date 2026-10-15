# G0 — CM5-c2 (parts c2a and c2b): the evidence of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `eab95879` (the two logs of
  the count and the oracle acts, CM5-c1c, merged by #301); the head of c2a merges the trunk at `7fa17af5`, the trunk its measures
  were taken against. Part c2b (section 9) starts from the trunk at `bfedb002`, the merge of c2a (#305).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, v6 and its
  dated amendments A-1 to A-5, l.1584-1607): row c2 (section 5, l.594), the evidence and its identity block (section 3.5, l.424-490),
  the decision on completeness (Q-CM5-5, l.1059-1061), CM5-COMPLETENESS-1 (l.1241-1248), tests L-T7, L-T8, L-T9, L-T13 and L-T17
  (section 5.3, l.915-927), the served history (section 4.1, l.526 and l.533-551). There is no separate short G0: this note fixes the
  choices the plan leaves open, each with the plan line it rests on. Lines of the plan are cited `plan l.N`.
- **No series byte read.** Every run is on the synthetic fixture of `fixtures/kata-quarter/` and on series the tests make under
  `os.tmpdir()`. No new fixture file.

## 0. The scope: c2 split into c2a (this lot) and c2b

The plan sizes c2 at ~390 changed lines (code ~205, tests ~185), 507 at +30 %, and pre-declares a split if the short G0 passes 420
(plan l.594; 547/1.3 = 420.77, plan l.601). Its pre-declared move (the L-T7 generator to c1c) is gone: c1c is merged. The estimate,
counted as R-25 counts (insertions plus deletions; `docs/**/*.md` and `fixtures/**/*.json` excluded), before any code:

| Part | What | Code | Tests | Total |
|---|---|---|---|---|
| c2a | `u_test` and the fire (plan l.594, l.361); the canonical writer `report.canonical` (plan l.429-432); the closed format `kata-quarter-counts-v1` and its separate identity block (plan l.436, l.462-463); no double, no price, no instant of a miss (plan l.467-471); the named refusals, the open quarter among them (L-T8); `count` writes the evidence; L-T8, L-T9, L-T17; the carried item KQ-ACT-REPORT-FIELDS-TEST-1 | `quarter_evidence.py` ~75; `quarter_counts.py` ~18; `FILES` 1 | ~130 (four tests, the count helper given an output folder, killer lines moved, the carried item); driver list and count ~4 | **~228** (+30 %: 296) |
| c2b | the reader of `kata-served-history-v1` by class under the role `served-history` and its refusals (L-T13; plan l.533-551); the first and last instants of service of each row (plan l.465-466); completeness in counts and the prudent variant (Q-CM5-5, CM5-COMPLETENESS-1, plan l.1059-1061, l.1241-1248); the L-T7 vectors, their generator and the `export` of `uTest` (plan l.915) | ~126 | ~155 (L-T13 ~60, the variant ~20, the TS cross test ~40 and its regeneration ~15, the provenance note of the vectors ~20) | **~281** (+30 %: 365) |
| c2 whole | | ~220 | ~289 | **~509** (+30 %: 662) |

c2 whole passes 420 at its estimate itself, and 547 at +30 %. **This lot builds c2a only**; c2b is the next lot of the same zone row
(ZONES, row CM5-c2, which declares both parts). The cut follows the dependencies: c2a needs nothing that is not on the trunk; c2b needs
the served history (its writer is on the trunk, `scripts/served-history.mjs`; its role is in io_guard, `ROLES`), and adds to the format
the keys that come from it (§2).

## 1. What this lot delivers (code that runs)

- `tools/kata-quarter/quarter_evidence.py` (new, no `__main__`; plan l.648, one module per lot): `closed(read, e_k)` (l.28-35), the
  refusal of an open quarter; `fires(n, k, alpha)` (l.38-40); `evidence(res, ident)` (l.43-50), the closed evidence from the counts of
  `quarter_core.count` and the identity of the run; `write(out, k, ev)` (l.53-60), `report.canonical` of the frozen tool into
  `<out dir>/quarter-<k>.json`, its name and sha256 returned.
- `tools/kata-quarter/quarter_counts.py`: `count` takes an output folder after `<quarter k>` and declares it to io_guard
  (`io_guard.output`, l.87) before any input of the series, the records and the registry (the identity reads the blobs of the tool's
  trees first, under `tool-tree`); it reads each symbol twice as `quarter_load.load_quarter` does, with the LIVE read held
  closed before the merge (l.96-99); it writes the evidence (l.102) and prints `evidence quarter-<k>.json sha256 <sha256>` before the
  line `identity`. Its JSON line, its lines `decision differs` and its other lines are unchanged.
- `tools/kata-quarter/FILES`: the line `quarter_evidence.py`.

```
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py count <registry> <sha256> <sealed dir> <live dir> <quarter k> <out dir> <folder>:<sha256|pinned>:<sha256> ...
```

`<out dir>` is absent or an empty folder (`io_guard.output`); the evidence is `<out dir>/quarter-<k>.json`, which MONARK's run versions
as `apps/harness/data/kata/quarter/quarter-<k>.json` (plan l.427-428, Q-CM5-7 l.1068). Its `evidence_sha256` is the sha256 of that file
(plan l.472).

## 2. The format `kata-quarter-counts-v1` of this lot

One line, canonical (`report.canonical`: sorted keys, no space, no line feed; plan l.428-431), ASCII, closed:

| Key | Holds | Rests on |
|---|---|---|
| `format` | `"kata-quarter-counts-v1"` | plan l.428 |
| `quarter` | `k`, `start` (S_k), `end` (E_k) | plan l.433 |
| `registry_sha256` | the pin under which the registry was read | plan l.433 |
| `series` | for each symbol folder: `sealed_sha256`, `quarter_sha256` (the pins of its two reads, the sealed series and the record of the quarter) and `gaps` (the declared gaps of the merged range, a count) | plan l.433-434 |
| `halts` | the intervals [E, R) applied (rule 8), venue instances included: `start_ms`, `end_ms`, `symbols` | plan l.435 |
| `grid`, `pose` | the grid of each horizon (`instants`, `first`, `last`) and the pose of kata_lib's globals (`rec_start`, `rec_end`, `lookback_hours`) | the count of c1b, unchanged |
| `log` | the census of the two logs in counts: `decides`, `inputs`, `inputs_differing`, `decisions_differing` | plan l.860-861 (c1c) |
| `rows` | for each counted row, fired or not: `task_class`, `key`, `calib_attempt`, `alpha`, `horizon`, `n_test`, `k_test`, `u_test`, `fires`, `drops_label`, `out_input` | plan l.464-465 |
| `identity` | apart: `commit`, `kata_recalc_tree_sha256`, `kata_quarter_manifest_sha256`, those of the line `identity` | plan l.436-463, A-1 |

`u_test` is `binom_exact.miss_upper_bound(n, k, "0.05")`, `"1"` when k = n, null when n = 0: the function `quarter_oracle.u_test`
(quarter_oracle.py l.102-104), written as `recalc_p2.calibrate_cell` writes UTest (recalc_p2.py l.367-372) and held to the registry by
the oracle act (plan l.594, l.361). `fires` is `binom_exact.binom_upper_tail_leq(n, k, alpha, "0.05")`, the veto of
`calibrate_cell` (recalc_p2.py l.373) for a region row. Integers, ASCII strings, booleans and null only (plan l.469-471): any other
value stops the run in `report.canonical` (report.py l.84-101). No price, no instant of a miss, no month of the misses (plan l.467).

**What c2b adds to it** (no evidence is versioned before c2b, the first `live:1` being possible after 2027-01-01, plan l.476-477): the
pin of the served history read (plan l.434), the first and last instants of service of each row (plan l.465-466) and the tables of the history lines of that service (§9), the completeness
`present` and `expected` by symbol and the prudent variant of each row (plan l.465, l.1059-1061, l.1241-1248). The name of the format
stays `kata-quarter-counts-v1`: it is closed at the freeze of c2b, the last lot that writes it.

## 3. The choices the plan leaves open, fixed here

| Choice | Fixed as | Rests on |
|---|---|---|
| Where the evidence is written | a positional `<out dir>` of `count`, declared to io_guard before any input, as the oracle acts take theirs; the file name `quarter-<k>.json` | plan l.427-428; io_guard.py `output` (l.398-407) |
| The writer | `report.canonical`, imported (`report as R`), never `kata_lib.js_json_compact` (insertion order) | plan l.429-432 |
| `u_test` | the one function of the tool that already writes it, `quarter_oracle.u_test`, imported: the function the act on the TEST block holds to the registry (`equals_registry_on_test_block`) | plan l.594, l.361; docs/G0-lot-cm5-c1c.md §3 |
| The open quarter (L-T8) | the end of the last slot that the LIVE read accounts for (a candle present, or a slot its `missing.json` declares) before E_k: refused by name, before the merge, no evidence written. A record whose last slots are declared missing is closed | plan l.916 |
| The census of the log | its four counts; `max_ulps`, a distance of two doubles that may pass 2^53 - 1 (the writer refuses such an integer), stays on the JSON line of `count` | plan l.469-471 |
| The keys of a series | `sealed_sha256` and `quarter_sha256`: they name the two reads by their role (the sealed series, the record of the quarter), not by the word of the second read's folder name, which the vocabulary gate refuses standing alone (`vocabularyHits` gives rule a on it; inside a key with an underscore it finds nothing) | plan l.272-275 |
| The rows | the region rows of the registry, in its order (quarter_core.py l.27-48); their months are not written (a month of the misses is a part of their sequence) | plan l.464, l.467 |

## 4. Departures from the plan, argued

- **`drops_label`, not `drops.label`** (plan l.465): the count of c1b names it so on its line, and a key with a dot would be read as a
  path by the readers of the format; the value is the same.
- **L-T17 is named `canonical_writer_equals_canonical_json`** (plan l.927 writes `…canonicalJson`): the driver reads the names of the
  file's tests as `[a-z0-9_]+` (test/verifier-tool-ci.test.ts, `QUARTER_TESTS names the tests of the file`); a capital letter would not
  be read. It runs in `test/kata-quarter.test.ts` with the other tests of the tool, not in a file of its own: it reads the evidence that
  the tool writes, which needs Python, and the job that runs Python runs that file (`scripts/verifier-tool-ci.mjs`, `QUARTER_TEST`).
- **L-T8 holds the LIVE read, not "the series read"** (plan l.916): the sealed read ends at S_k by its range (quarter_load.py
  l.48-50), so only the second read can stop before E_k.
- **A test of its own for `u_test` and the fire** (`u_test_and_fires_of_each_row`): the plan puts them under L-T7, the cross test of
  the TS guard, which is c2b's. Here the values are those of `binom_exact` worked out apart from the tool, on a made series whose misses
  are known.

## 5. Tests (test/kata-quarter.test.ts; each turned red by the killer it names, applied alone)

| Test | Killer |
|---|---|
| `refuses_open_quarter` (new, L-T8): a LIVE series cut at 2026-12-01 is refused by name, exit 2, no evidence written; the same quarter with its last slot declared missing is counted | `quarter_evidence.py:32` the check made true (the merge's undeclared gap then refuses, under another name) |
| `quarter_evidence_closed_canonical` (new, L-T9): the evidence of the fixture is one printable ASCII line, named by its sha256 on the line `evidence`; its keys, each row's and each series' are the closed lists; the identity block is the line `identity`; integers, strings, booleans and null only; no key of a month, a miss, a price or an instant; `vocabularyHits` finds nothing; the evidence of another commit (a stand-in of a comment) is the same but for its identity | `quarter_evidence.py:23` a key `miss_times` added to the closed list; `:25` the months added to a row's |
| `canonical_writer_equals_canonical_json` (new, L-T17): the bytes of the evidence are `canonicalJson` of its values | `quarter_evidence.py:55` written by `kata_lib.js_json_compact` |
| `u_test_and_fires_of_each_row` (new): on hourly closes 100 and 101 in turn, `u_test` is `0.3502186` for 736 misses of 2208 and `0.0013559` for none (worked out apart from the tool by `binom_exact.miss_upper_bound`), `"1"` when every point misses, null with no point; `fires` true for 736 misses of 2208 and for a row whose every point misses, false for none and for no point; the evidence with a null and booleans is `canonicalJson` of its values | `quarter_evidence.py:40` the fire at alpha 0.45; `:46` u_test with no miss |
| `fdlibm_log_pass_decides` (changed, carried item): the list `math_log_decisions` of `fdlibm_measure` holds each changed decision once, by row and instant, each in the form of the lines `decision differs` | `quarter_oracle.py:140` the first decision repeated (mutant N34 of the G2 r2 of c1c) |
| `equals_registry_on_test_block` (changed, carried item): `result.rows` names each row compared by its task class **and its key**, and `result.population` is its text | `quarter_oracle.py:139` the key emptied (N31); `:139` the population removed (N33) |

Every test that runs `count` now gives it an output folder (the helper `count` of the file, and `run` of `count_refuses_by_name`);
the killers on `quarter_counts.py` moved with its lines (nine of them). In `test/verifier-tool-ci.test.ts`, the number of the file's
tests is 25 (QUARTER_TESTS in `scripts/verifier-tool-ci.mjs` names the four new tests, on its last line).

## 6. The carried item KQ-ACT-REPORT-FIELDS-TEST-1

Closed by the two changed tests above: N34, N31 and N33 (scratchpad of the G2 r2 of c1c, `mutants.json`), each applied alone at
`quarter_oracle.py` l.139-140, unchanged by this lot, turn their test red. For N34 the item proposed to compare the list with the lines
`decision differs` of `count` under the same port; the act counts the TEST block and `count` a quarter, so no run gives both on one span:
the test holds instead that each decision is listed once, in the order of the rows and instants in which the count makes them.

## 7. What this lot does not do (c2b)

- The reader of `kata-served-history-v1` by class under the role `served-history`, its named refusals (L-T13), the pin of the history
  in the evidence and the first and last instants of service of each row (plan l.433-434, l.465-466, l.533-551).
- Completeness by symbol in counts and the prudent variant (`n_test` + d, `k_test` + d) with its fire (plan l.1059-1061,
  l.1241-1248).
- The L-T7 vectors (`fixtures/kata-quarter/veto-vectors.json`, 8 278 pairs), their generator, their cross test against `vetoFires` and
  `uTest` of `apps/harness/src/policy-guard.ts`, and the `export` of `uTest` (plan l.915).
- No act on a real series: MONARK runs `count` on the host after LIVE-k-RECORD (plan l.498).

## 8. Measures (offline, Node 24.21.0, CPython 3.14.8)

- `test/kata-quarter.test.ts`: 25 tests, 25 pass, under the pinned CPython 3.14.8 (`KATA_QUARTER_PYTHON`), no network; the driver's
  judge of that run (`quarterTestProblems`, QUARTER_TESTS of 25 names) is empty; the same run under a git that refuses names equal once
  case is folded: 25 pass, no collision.
- Each killer of the file (62 lines, those on `tools/kata-recalc/` and `package.json` aside, and the three of the pinned names in
  `test/verifier-tool-ci.test.ts`) applied alone turns the test that names it red; each file restored to its sha256.
- `npm run test:main`: 3226 tests, 0 fail, 23 skipped; the count records unchanged (312 files, 3226 tests), the count check against
  the trunk clean.
- R-25: 221 changed lines (192 insertions, 29 deletions; bound 547) against the trunk; the estimate of c2a was ~228.
- `node scripts/lint-ratchet.mjs`: 69/69, at its ceiling.

## 9. Part c2b: the served history, completeness, the prudent variant and the L-T7 vectors

Base: the trunk `lot/etude-suite` at `bfedb002` (the merge of c2a, #305). Same zone row (ZONES, CM5-c2, part c2b declared at 19:22 UTC).

**Estimate, before code** (R-25 counting; the vectors JSON excluded by `ci.yml` l.100, `docs/**/*.md` too): code ~120 (the reader of
the history ~50, the evidence's new keys, the variant, the generator and the atomic write ~40, `count` and `vectors` ~30, `export` 2);
tests ~200 (L-T13 ~45, completeness and the variant ~25, the regeneration ~15, the atomic write ~15, the TS cross test ~35, the carried
items ~20, the count helper given a history and the killers moved with their lines ~40, the driver's list and count ~2, the provenance
of the vectors ~10): **~320**, 416 at +30 %, under 547. Measured at the end (section 10).

**The command** gains the served history and its pin after the registry's, and a subcommand `vectors`:

```
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py count <registry> <registry sha256> <served history> <served history sha256> <sealed dir> <live dir> <quarter k> <out dir> <folder>:<sha256|pinned>:<sha256> ...
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py vectors <out dir>
```

| Choice | Fixed as | Rests on |
|---|---|---|
| The reader of the history | `quarter_load.served_history`: the file read whole under the role `served-history` (`io_guard.read`, noted as an input), refused before parsing unless its sha256 is the pin given, then `json.loads` of the whole text (never line by line), a key written twice in one object refused by name (`object_pairs_hook`); a non-empty array of lines with exactly the nine closed fields, all strings of the writer's form (`checkLine` of `scripts/served-history.mjs`: `format` `kata-served-history-v1`, `release_dir` `contract-1.1.0-tables-` and a real day, `task_class` lower-case words joined by `-`, `merge_commit` 40 hex, the three digests 64 hex, ASCII digits only), `t_e` and `t_f` real UTC seconds, `t_e <= t_f`; and the bytes equal to the writer's canonical text of the parsed lines, the rule `render` applies to an existing file: `[` and a line feed, the elements written by `report.canonical` of the frozen tool (imported, never copied), sorted by (`t_e`, `task_class`), one per line, joined by `,` and a line feed, then a line feed, `]` and a line feed. One check refuses by name a deployment split around another, lines out of that order and a pretty-printed array | plan l.526, l.551, l.819-823, l.922 |
| A deployment | a `release_dir`, in the order of the file: its lines share `merge_commit`, `t_e`, `t_f` and `ca_record_sha256` and name each class once; the deployments go up in `t_e` and in `t_f` (else refused by name) | plan l.540-551 |
| The gap (L-T13) | the deployments that hold a class follow each other in the file: a class held before and after a deployment that has no line for it is refused by name, which holds the plan's D_{i-1}, D_{i+1} case and a longer absence alike; a class absent before its first deployment is no gap; a class absent from the last deployments and never back is served up to the t_f of the first one without it | plan l.536, l.542-546 |
| The service of a class | [t_f(D), t_f of the next deployment of the file) for each D that holds it, open after the last | plan l.533-535, l.542-544 |
| The rows counted | the region rows of the registry whose class is served at an instant of Q_k; the others are not counted, and a quarter with none is refused by name. The venue stays the symbols of every row of the registry | plan l.334, l.533 |
| The instants of service | `served_from` and `served_to` of each row: the span [from, to) of its service within Q_k, UTC seconds | plan l.465-466, R-5 l.1291-1292 |
| The tables of a row's service | `served_tables` of each row: the `policy_table_sha256` of each history line of its class whose span of service meets Q_k, in the order of the file (one per such line) | plan l.533-535; the departure below |
| The pin of the history | `served_history_sha256`, the pin it was read under | plan l.434 |
| Completeness | by symbol, in counts: `present` (the candles of the LIVE read in Q_k), `expected` (the slots of Q_k) and `complete`, the integer test `1000 present >= 999 expected` | plan l.470-471, l.1059-1061 |
| The prudent variant | `prudent` of each row: `n_test` + d, `k_test` + d, d its drops and its instants out, and its fire by the same `fires`, or `"out_of_domain"` above `LIVE_N_MAX` of its horizon (2208 at 1h, 552 at 4h, policy-wave2.ts l.16). A count never passes it (its grid is at most the longest quarter): a test lowers the cap in a stand-in to reach it | plan l.1241-1248 |
| The L-T7 vectors | written by the tool, `vectors <out dir>` (`quarter_evidence.vectors`, no new module): one canonical line, format `kata-veto-vectors-v1`, alpha `0.01`, level `0.05`, by horizon `[n, k, u_test, fires]` for n from 1 to `LIVE_N_MAX` and k = k* - 1, k*, k* + 1 within 0 <= k <= n, k* the least k that fires: 8278 pairs. `u_test` by `quarter_oracle.u_test` (`miss_upper_bound`, `"1"` when k = n), the fire by `quarter_evidence.fires` (`binom_upper_tail_leq`), the very functions of the evidence | plan l.915 |
| The writing | `write(out, name, value)`: `<name>.part` then `os.rename` (io_guard admits the rename of a file the run wrote); the evidence and the vectors alike | KQ-EVIDENCE-ATOMIC-WRITE-1 |
| The output folder | judged before any input (`place`): its parent a folder, itself no link (nor a junction, which `os.path.islink` does not see on Windows), under no input folder | KQ-C2A-NITS-1, nit-5 |

**Departures, argued.** L-T7 has two halves in two files: the regeneration (`veto_vectors_written_again`) needs the pinned Python and
runs in `test/kata-quarter.test.ts`; the cross test (`u_test_and_fire_cross_equal`, the plan's name) is TS only and runs in
`test/kata-quarter-vectors.test.ts`, in test:main. The comment of `FLAGS` no longer says that no served history enters a count: it
enters as a positional input, never an option, and moves no count, only which rows are counted and their span (plan l.819-820).

**The table of a counted row is recorded, not checked (plan l.533-535): a departure.** The plan counts a row when a history line of its
class has a span of service that meets Q_k *and* the table of that line (`policy_table_sha256`) carries the counted row. The second
condition cannot be checked in this lot: no role of the tool reads a served table (`count` declares `series`, `recorder`, `registry`,
`served-history` and `tool-tree`), and the rows of the registry carry no table digest to compare with. So the evidence records what
the check needs: `served_tables`, for each counted row, the `policy_table_sha256` of each history line of its service in Q_k (a closed
key of the row, held by `served_history_reader_refuses_gap`). The lot that composes the served table with the evidence (CM5-d, plan
l.553-559) checks that each of those tables carries its row; until then a row is counted on the service of its class alone.

**Tests** (`test/kata-quarter.test.ts` unless named; each red by the killer it names, applied alone):

| Test | Killers |
|---|---|
| `served_history_reader_refuses_gap` (L-T13): a history of three deployments written by `render` of `scripts/served-history.mjs` (the writer); each row's span and `served_tables`, read in the evidence; a class served after Q_1 not counted; a gap, a pair twice, a deployment whose lines differ, a list of classes, an unknown key, another pin, a key twice in one object, a deployment split around another, lines not sorted, a pretty-printed array, a `release_dir` off the writer's form or of no real day, a `merge_commit` off its form, two deployments of one `t_e`, a `t_f` before the previous deployment's, `t_e` after `t_f`, another format, a number in a field, a second written otherwise (`2026-9-1T10:00:00Z`) refused by name; a history of a class foreign to the registry refused (no served row); the input noted under `served-history` | `quarter_load.py` the gap, the closed fields, the class a string, the pair twice, the pin, the end of a span, the repeated key, the canonical text, the forms, the format, the strings, `t_e <= t_f`, the second's round trip, the order of the deployments, the tables of a span; `quarter_counts.py` the filter of the rows, the refusal of a quarter with no served row |
| `completeness_and_prudent_variant`: 8 candles absent of 8832 complete, 9 not; each row's prudent pair and its fire equal to `vetoFires` of the guard; `out_of_domain` above the cap | `quarter_evidence.py` 999 made 998; d without the instants out; the cap made true |
| `veto_vectors_written_again`: the file again byte for byte, named by the pin of its provenance; at n 2208, k 30 does not fire, k 31 fires | `quarter_evidence.py` the grid of k; the level of `fires` made 0.5 (R2) |
| `evidence_written_whole_or_not_at_all`: one file after a run; under `ulimit -f 1` (Linux) exit 2 and no `quarter-1.json` | `quarter_evidence.py` the `.part` name made the evidence's |
| `u_test_and_fire_cross_equal` (`test/kata-quarter-vectors.test.ts`): `typeof G.uTest` is a function, then `vetoFires` and `uTest` equal the 8278 vectors | `policy-guard.ts:29` the plan's killer; `:33` the "1" of k = n removed |
| `quarter_evidence_closed_canonical` (changed): the pins of the registry and of the history, each the sha256 of the file the test gives, and of both reads, the gaps and the completeness of the fixture, `halts`, `grid`, `pose` and `log` equal to the JSON line's (`max_ulps` apart), the closed keys of `log`; the frozen tool's tree equal between two commits | R3, R4, R5, R6, R8; `quarter_counts.py` the history's pin made the registry's |
| `count_refuses_by_name` (changed): an output whose parent is absent, an output in the LIVE folder, an output that is a link | `quarter_evidence.py` each part of `place` |

**The carried items.** KQ-EVIDENCE-PROVENANCE-VALUES-TEST-1: R3, R4, R5, R6 and R8 red in `quarter_evidence_closed_canonical` (R5
through `grid`: the fixture has no halt). KQ-FIRE-THRESHOLD-TEST-1: (2208, 30) and (2208, 31) held under the pinned CPython by the
regeneration, and R2 red there. KQ-EVIDENCE-ATOMIC-WRITE-1: the `ulimit -f 1` case reproduced first (exit 2, a `quarter-1.json` of 512
bytes that does not parse), then written as `.part` and renamed. KQ-C2A-NITS-1: nit-2, nit-4 and nit-6 folded in this note, nit-3
and nit-5 in the code and tests above; nit-1 kept: `report.canonical` and a sorted compact `json.dumps` write the same bytes on every
value that reaches the evidence or the vectors (integers within 2^53, ASCII strings, booleans, null), and the writer refuses the rest
before any byte is written; R9 stays green, the plan's killer (`js_json_compact`) is red.

## 10. Measures of part c2b (offline, Node 24.21.0, CPython 3.14.8)

- `test/kata-quarter.test.ts`: 29 tests, 29 pass, under the pinned CPython 3.14.8 (`KATA_QUARTER_PYTHON`), no network, under a git that
  refuses names equal once case is folded (no collision); 100 s on this host, the regeneration of the vectors 47 s of it; the driver's
  judge of that run (`quarterTestProblems`, QUARTER_TESTS of 29 names) is empty.
- `test/kata-quarter-vectors.test.ts`: 1 test, 72 s on this host (8278 pairs of exact arithmetic in TS).
- Killers: each killer of both files on `tools/kata-quarter/` and `policy-guard.ts`, and the carried mutants R2 to R8, applied alone:
  82 of 83 turn their test red, each file restored to its sha256; the one green is R9 (nit-1, kept). **The plan's L-T7 killer**
  (`policy-guard.ts:29`, the level of `vetoFires` made 0.025) **dies**: `u_test_and_fire_cross_equal` red.
- `npm run test:main`: 3227 tests, 3202 pass, 23 skipped, 2 fail: the two tests of `apps/dojo/test/dojo-history-provisional.test.ts`
  that need free disk space above their threshold (`refused disk_space`, `apps/dojo/src/history-collect.ts` l.185) on a host left
  with about 750 MB; no file of this part is theirs. The count records written from that run (313 files, 3227 tests), the count check
  against the trunk clean.
- `node scripts/lint-ratchet.mjs`: 69/69. tsc and eslint on the touched files: clean. Anchors: 101 killers, 101 anchored.
- After the first review (the history read as the writer writes it, the table of each counted row recorded, the refusals of §9 each
  held by a case): `test/kata-quarter.test.ts` 29 tests, 29 pass, with no `node_modules` (the condition of the CI job that runs it),
  105 s on this host; the driver's judge of that run empty. The killers of the three changed tests and the review's mutants, 53, each
  applied alone: each turns its test red, each file restored to its sha256. Anchors: 89 killers in this file, 89 anchored.
