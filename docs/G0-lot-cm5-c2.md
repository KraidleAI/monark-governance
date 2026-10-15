# G0 — CM5-c2a: the evidence of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `eab95879` (the two logs of
  the count and the oracle acts, CM5-c1c, merged by #301).
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
  (`io_guard.output`, l.87) before any input; it reads each symbol twice as `quarter_load.load_quarter` does, with the LIVE read held
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
pin of the served history read (plan l.434), the first and last instants of service of each row (plan l.465-466), the completeness
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
| The keys of a series | `sealed_sha256` and `quarter_sha256`: the vocabulary gate refuses the word of the second read's folder name (`vocabularyHits` gives rule a on it), which the evidence, versioned in the public repository, must pass | plan l.272-275 |
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
