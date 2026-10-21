# G0 — CM5-c4b: the profile, the reader of the wave 2b registry and the act on its blocks, `tools/kata-quarter/quarter_2b.py`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-17. Base: trunk `lot/etude-suite` at `a0ae502b` (#321, the GARCH
  window counted in bars, CM5-c4a-2).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, cited `plan l.N`):
  the row c4 (l.596: c4b, the profile, the weekend, the DST table and the reader of the 2b registry, ~260, and the code of L-O4, ~30:
  ~290, 377 at +30 %), the act L-O4 (l.954-956, in English: the tool of c4, run on the blocks of the 2b registry, must give its counts by block; the exact
  fields fixed by the 2b format at P0-2 and written in the G0 of c4; the code in c4b, the run and the report MONARK's), the item
  CM5-2B-ESTIMATORS-1 (l.1180-1190: no optimizer; only evaluation code is reused).
- **The format**: the frozen `kata/registry/FORMAT-wave2b.md` of RECHERCHES (commit `23a7060`, 27 777 bytes, sha256 `b994d2b6…`), cited
  `F2b l.N`; it rests on `kata/registry/FORMAT-wave2.md` (cited `F2 l.N`) by its reference rule (F2b l.6). The rule: ADR 0006 v8.1 D4
  (recherches `decisions/0006-ADR-draft-wave2.md`, sha256 `fe48c03a…`, cited `ADR l.N`): the profile and its key (l.120), the freeze
  order (l.121-128), the DST table (l.129), « The frozen strings are the pinned object, and everything after them is exact » (l.136).
- **What c4a left** (`docs/G0-lot-cm5-c4a.md` at the base, cited `c4a l.N`): section 10 (l.161-169) and the questions Q8, Q9, Q10
  (l.184-188); the given factors f and weekend of the evaluation (l.41-46) and of `estimate` (l.117-126: « lot c4b replaces its given
  factors by the profile »). The register of carried items of RECHERCHES (`coordination/ITEMS-PORTES.md`) holds KQ-2B-INPUT-SHAPE-1 (l.43)
  and KQ-2B-ONCE-DOMAIN-1 (l.46).
- **No series byte read, no real registry read, no fit.** Every test runs on a series and a `wave3.json` made by the test itself, with
  made-up fits, profiles and counts (section 8).

## 1. What this lot delivers

- `tools/kata-quarter/quarter_2b.py`, appended after `estimate` (no line of c4a's code moves; its head comment and three lines of
  `estimate` change in place):
  - **the US DST table and the key of an instant** (section 3): `SWITCHES`, `DOMAIN`, `USDST`, `summer(t)`, `key(t, horizon)`;
  - **the profile** (section 3): `profile(p, horizon)`, the factor f of the key of an instant and the weekend multiplier of t, read
    from a `{values, weekend}` object as the registry writes it; `fdec`, the frozen decimal string of F2b l.51;
  - **the closed reader of `wave3.json`** (section 4): `wave3(path, pin)` (pin before parse, byte form, closed objects, `usDst`), `row(r)`
    (the reader checks of one row) and `wave3_rows(path, pin)` (the checks across rows), each refusal by name;
  - **the place of a 2b row in the count** (section 5): each row read is given to `quarter_core.count` with a cell that carries its
    sigma_hat (its estimator on its frozen fit, under its profile and `usDst`) and its lookback.
- `tools/kata-quarter/quarter_core.py`, four lines in place: `lookback` takes a row's own lookback when its cell carries one, and
  `count_row` takes a row's own sigma_hat when its cell carries one (a 2b row has no hour-of-week table); nothing else of the count
  changes, and a wave 1 or core row is counted as before.
- `tools/kata-quarter/quarter_oracle.py`: the act L-O4 `equals_wave2b_registry_on_its_blocks` (section 6), its name in `ACTS`, its
  usage, its branch in `act` and its code `on_wave2b` at the end of the file.
- `estimate` takes the profile in place of the given factors (section 7, Q9): input `kata-2b-estimate-input-v2`.
- `test/kata-quarter.test.ts`: three tests at its end and the four tests of c4a adapted to the input v2 (section 8);
  `scripts/verifier-tool-ci.mjs`: the three names in `QUARTER_TESTS`; `test/verifier-tool-ci.test.ts`: the count of the file's tests;
  `test/test-counts.json` and `test/test-names.json` unchanged: the file is outside `test:main`, and no test of `test:main` is added,
  removed or renamed.
- **No optimizer**: nothing here fits anything; every value read is a frozen string of the registry or of the input.

## 2. The rows of the 2b registry are not in the quarter count on Q_k

`count` (the subcommand on a quarter Q_k) takes no wave 2b registry in this lot. The guard of the trunk refuses every wave 2b row
(F2b l.161: a wave 2 row with a non-null `fit_sha256`, `policy-guard.ts:43`, and the other refusals named there), so no class table that
holds one can be served, and the served history, which the count follows, cannot name one; the revision that admits them is a
precondition of any import of `wave3.json` (F2b l.152) and is lot W2B-GUARD-ADMISSION-1. The evidence of a quarter would also need the
pin of a third registry, a key of `quarter_evidence.py`, outside this zone. What the count needs from this lot is in place: the rows
of `wave3_rows` are rows of `quarter_core.count`, with their sigma_hat and their lookback (section 5), so the entry of the third
registry into `count` is the reader's call and one key of the evidence (section 12).

## 3. The US DST table, the key of an instant and the profile (ADR l.120, l.123, l.128-129; F2b l.32-36, l.93-101, l.170)

- **The table**: the nine switches of F2b l.34 in their order, each `(at, summer)`; its domain `2022-03-13T07:00:00Z` ≤ t <
  `2027-03-14T07:00:00Z` (F2b l.36). `summer(t)`: on the domain, the `summer` of the last switch with `at` ≤ t, and true before the first
  one (« before the first switch it is in force »); outside the domain, `None`: no key, so no value of the profile is read there and
  the decision is not evaluable (F2b l.170). `USDST`, the object `{"switches": [{"at", "summer"}, …]}` that the reader holds
  `wave3.json`'s `usDst` to, byte for byte.
- **The key** of an instant t (F2b l.95-97): at 1h the US Eastern hour of day, (UTC hour of t − 4) mod 24 under summer time,
  (UTC hour − 5) mod 24 otherwise; at 4h, 6 × s + j, j the UTC 4-hour slot of t and s 1 under summer time. « The factor of a bar
  [s, s + h) is that of the instant s » (F2b l.95): the evaluation already reads the factor of a bar by its start (c4a l.42-44).
- **The profile** `{values, weekend}` (F2b l.95-98): 24 values at 1h and 12 at 4h, and two weekend multipliers, each an `fpos`, a
  frozen decimal string of a value above 0, written as JavaScript writes its double (`fdec`, F2b l.51: the string of the form of
  `quarter_2b.DECIMAL`, finite, and equal to `kata_lib.js_number` of its binary64). f(s) is the value of the key of s (`None` outside
  the domain); weekend(t) the first multiplier when t's UTC day is a Saturday or a Sunday, the second otherwise. sigma_hat is
  `(sigma × f(key of t)) × weekend(t)` (F2b l.99; c4a's `sigma_hat`, unchanged). Any other profile is refused by name.

## 4. The closed reader of `wave3.json` (F2b l.14-18, l.20-36, l.49-113, l.172-185)

Modelled on the core reader `quarter_wave2.py` of c3 (`docs/G0-lot-cm5-c3.md` section 1), which it imports and does not change:

- **`wave3(path, pin)`**: read under the role `registry`, refused before parsing unless its sha256 is the pin; decoded as UTF-8 and parsed
  with a key written twice refused (`quarter_load.unique`); held to its byte form (F2b l.16, F2 l.12-15: `kata_lib.js_json_pretty` of the
  document and one line feed, no U+2028 or U+2029); then **closed**: every object holds exactly the keys of its table, in the format's order
  (the top level its five keys, F2b l.30; a row the keys of F2b l.55-81; `profile`, `fit`, `usDst` and a switch theirs; `nonEvaluable` the
  four blocks; the objects of `calib` and of the veto blocks those of F2, read from `quarter_wave2.SHAPES`), `months` `YYYY-MM` ascending,
  `fit.strings` an object of scalars (its keys are held by `frozen`, their order by `row`); the arrays are `rows`, `switches`,
  `profile.values` and `profile.weekend` only. Then `usDst` equal to `USDST` in its canonical writing (keys and order included).
- **`row(r)`**, the checks of one row, each refusal naming the row (`wave 2b row <taskClass> <key>: not …`): its horizon and its estimator
  are the format's; its cell (the task class `<s>-range-<h>`, `<s>-mae-down-<h>` or `<s>-mae-up-<h>` of its symbol, which ends in `USDT`,
  the venue of `recalc_p2.VENUE`, `side` null, `bucket` `"b0"`, `thresholds` null) with its `key` and its `trialId` recomposed; `wavePart`
  `"2b"`, `calibAttempt` the integer 1 (not `true`), `alpha` `"0.01"`, `testDelta` the base of its horizon; `W` the window of its estimator
  (168 at 1h or 42 at 4h, the GARCH window recomputed from its frozen strings by c4a's `window`, 101); `fit.form` one of `FORMS` on
  `har-rv15-sp-v1` and null on the others; `fit.strings` the keys of its estimator in the format's order (F2b l.105), each an `fdec` (c4a's
  `frozen`, then `fdec`), a + b below 1 (c4a's `window`) and `seed` above 0; `profile` as section 3; `fitSha256` the sha256 of the canonical
  writing of `fit` (`report.canonical`, the writing of the contract 1.1.0, F2b l.67) and `profileSha256` that of the numbers of
  `profile.values` then `profile.weekend` (`kata_lib.seq_sha256`, as `factorTableSha256`, F2b l.65); and, as c3 holds them for a core row, a
  `qhat` iff calibrated, `status` and `vetoedBy` by the order of the three veto blocks, and the months of each block within it and summed to
  `nTest` and `kTest` (`quarter_wave2.months_ok`).
- **`wave3_rows(path, pin)`**, across rows: each cell (`taskClass`, `key`) once; the rows of one key with one `W`, `fit` and `fitSha256`;
  the rows of one symbol and horizon with one `profile` and `profileSha256`; one form on every `har-rv15-sp-v1` row (F2b l.180, l.182).

| Reader check (F2b) | Here | Why |
|---|---|---|
| l.177, the five keys; `usDst` byte for byte | **taken** | the profile key of every instant is read from that table |
| l.178, `trialId` recomposed; `wavePart`, `calibAttempt` 1, `alpha`, `testDelta` | **taken** | the cell, its alpha and its attempt are what the count and the act compare; `testDelta` names the row's design |
| l.178, the 72 rows of "Trials" point 1 in its order | left out | as c3 (its section 2): the count and the act key each row on its cell and count it alone; the number and the chain order are commitments of the writer, recomposed by a verifier of the trial registry, not inputs of a count (Q2) |
| l.179, `key` recomposed; `W` of its estimator, recomputed for GARCH | **taken** | W is the window of the count (section 5) |
| l.180, `fit.strings`, a + b, `seed`, `fit.form` | **taken** | the frozen fit is what the evaluation reads |
| l.181, `fitSha256`, `profileSha256` | **taken** | the digests bind the objects that the evaluation reads to the projected row (F2b l.150) |
| l.182, the same `W`, `fit` and `profile` by key and by symbol and horizon | **taken** | |
| l.183, 24 or 12 values and two multipliers, each an `fpos` | **taken** (`profile`) | |
| l.184, `trialRegistryHead` recomposed | left out | as c3: the chain is the writer's commitment; it needs the 72 rows in their order (left out above) and, when a trial intervened, the head of a dated addendum (F2b l.44), which the tool does not read |
| l.185, the five snapshot digests | left out | as c3: they need the posted digests of `PROVENANCE-wave3.md`, which the tool does not read; MONARK holds the file to them when it classifies it |
| l.176, the checks of F2 l.193-202: the months of the blocks and their sums | **taken** (`months_ok`) | the act compares `months`, `nTest` and `kTest` |
| l.176, F2 l.193-198, l.201-202: `auxSeq`, `tailFrac`, `tail`, the verdicts, `U` at `testDelta`, `kObs` ≤ `kStar`, `seriesSha256` | left out | as c3: calibration fields or posted digests, which the count does not read (the act computes its own `UTest` on each block) |

## 5. The place of a 2b row in the count (c4a l.165; F2b l.83-91)

Each row of `wave3_rows` is a row of `quarter_core.count`: `(row, cell, symbol folder)`, its cell `{kind, side, kata}` (`range`, or `path`
with its side, as `recalc_p2.cells_of` writes a core cell) and two keys more:

- `sigma`: the row's sigma_hat at t, c4a's `sigma_hat` on its frozen fit (`frozen`) under its profile (section 3): f the factor of the key,
  weekend(t), and the HAR form of `fit.form`. `count_row` calls it in place of `recalc_p2.sigma_hat` on the hour-of-week table; out,
  drop, covered and miss are classified as for any row (`quarter_core.py` l.97-105, unchanged). A decision at which sigma_hat is not
  evaluable (a bar or a candle absent, an instant or a bar outside the table's domain, a value not finite or not above 0) is out:
  `nonEvaluable` (F2b l.77: inputs first, then labels).
- `look`: its lookback in ms, the longest input window it reads: 673 candles (7 days and 15 minutes) for `har-rv15-sp-v1` in the candle
  form, its 168 or 42 bars in the per-bar form; W bars of h for `garch11-sf-sp-v1` (reading B, c4a section 14); 101 bars for
  `ewma-vol-sp-v1`. `lookback` takes it, so the pose of `kata_lib`'s `REC_START` is the 00:00Z at or before S_k minus the longest window,
  as for every row.
- **Each block read from `READS[block].start`** (`kata/w2c/blocks.ts:25-30`, as F2b l.89 states it): the act reads each symbol's series
  once, under `quarter_wave2.READS` as L-O3 does (a read under a block's range alone would refuse a `missing.json` that lists slots of
  another block, `quarter_load.py` l.82-84), and counts each veto block on its candles from `READS[block].start` (`quarter_2b.READS`:
  2025-09-01 for the bridge, 2023-09-01 for TEST-2, 2024-03-01 for FWD-2) to the block's end, the range of the writer's block guard
  (`BlockCandles`, `blocks.ts:55-60`). So a window that reached before the month of inputs would be out here as it is absent for the
  writer. Under the format's bounds none does: at the GARCH cap (720 bars at 1h, 180 at 4h, 30 days) the first decision of TEST-2 and of
  the bridge reads exactly the month before it, and that of FWD-2 lies inside 2024-03; the 673 candles of the HAR and the 101 bars of
  the EWMA are shorter. The test holds it: at the cap, no decision of TEST-2 or of the bridge is out, and with `READS["test"]` one day
  later the first decisions of TEST-2 are. Two values are equivalent here, said as they are: the lower bound of the cut (the pose by
  the lookback never reaches before it under these bounds), and the HAR's lookback of 673 candles (the candle form reads candles, not
  the bars that the pose builds; the GARCH's longer window sets the pose). Each is a mirror of the writer's range, observable only by a
  window longer than the month of inputs, or in the merge of a quarter's two reads (`count`, Q1).

## 6. The act L-O4 `equals_wave2b_registry_on_its_blocks` (plan l.954-956)

```
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check equals_wave2b_registry_on_its_blocks <wave3.json> <sha256> <sealed series dir> <out dir> <symbol folder>:<sha256> ...
```

**Reads**: `wave3.json` under its pin (the whole reader of section 4); for each symbol folder its sealed series under the pin given, read
alone under `quarter_wave2.READS`, each block on its candles from `READS[block].start` (section 5; no merge, rule 8 and 8 bis on that read,
as L-O3); the folders named are those of the rows with a `qhat`, no more and no fewer, or the act is refused by name before any series is
read (`quarter_oracle.py` l.195). **Counts**: each row with a `qhat`, whatever its status, on the bridge, TEST-2 and FWD-2
(`quarter_wave2.BLOCKS`, in that order), by `quarter_core.count` (fdlibm_log decides, math.log listed). **Compares**, under the rule of
`report.py` l.9-13 (strict equality of canonical writings), the fields of L-O3 and one more: `nTest`, `kTest`, `UTest`
(`quarter_oracle.u_test`, the veto level 0.05 at both horizons, F2b l.121), `months`, the label drops (`drops.<block>`), the decisions not
evaluable (`nonEvaluable.<block>`, F2b l.77) and `vetoed` (region, n ≥ 1 and the exact tail at the row's alpha under 0.05). **Outputs**:
`<out dir>/equals_wave2b_registry_on_its_blocks.json` (`kata-quarter-oracle-v1`, canonical, named by its sha256 on the line `report`), the
pin of the registry, the rows compared and each block's pose, grid, halts, census of the log and math.log decisions; each difference
`<taskClass> <key> <block>.<field>`; exit 0 when every field is equal, 1 otherwise. The run on the host series and its report are MONARK's.

Limits, for MONARK's run: (a) as L-O3, the historical exclusion instances are not an input (KQ-LO3-EXCLUSIONS-1 holds for this act too:
the item's input, once pinned, enters both acts); (b) an `under_calib` row (no `qhat`) is not compared; (c) the series form is the tool's,
one file per symbol; (d) CALIB-2 is not compared (Q4).

## 7. `estimate`: the input `kata-2b-estimate-input-v2` (Q9 of c4a; KQ-2B-INPUT-SHAPE-1)

`estimate` stays the reading by hand of the evaluation (c4a section 7), and takes the profile in place of the given factors: its input
is `{format, horizon, range, form, fits, profile, instants}` in this order, `profile` the `{values, weekend}` object of a registry row
(section 3) and `instants` an array of UTC instants on the grid, each once. f and weekend are those of the profile under the tool's
table; `form` and `fits` are unchanged. The shape is checked before any field is read, as in v1: an input that is not an object (a number,
an array of the key names) or whose range has another number of bounds than two is refused by the tool's own message. The two checks of
`quarter_2b.py` l.154-155 that no test reached at c4a's merge (`type(x) is dict`, `len(x["range"]) == 2`) are reached by three cases
with their mutation lines: **KQ-2B-INPUT-SHAPE-1 is closed** by this lot.

`test/kata-quarter.test.ts` l.1651 at the head (l.1638 at the trunk; `once()`) is not touched; KQ-2B-ONCE-DOMAIN-1 stays open.

## 8. Tests (each red at the base: the new names of `quarter_2b.py`, the act and the input v2 are absent there)

The registry of the tests is made by the test (`wave2bReg`, a builder of rows in the format's key order, `row2b`, written by
`JSON.stringify(registry, null, 1)` and a line feed, the format's byte form), seven rows of the made-up symbol `SYNUSDT` (folder `syn`); no
fixture file (a registry of the format's 72 rows would exceed the PR's content bound; nothing is read from a real registry). Its blocks are
worked out by the test (`decided`: out when a window holds the one absent candle, a drop when a label needs it, a miss on a weekday at the
profile's marked keys, from the test's own DST table; for the `mae-down` row at a `qhat` of 300, a miss there only where its down label is
the large one, so that its side decides); each `UTest` is `binom_exact.miss_upper_bound` under 0.05 of the frozen tool run apart from the
tool (as L-O3's test does), and each block fires at alpha 0.01, checked apart the same way.

| Test | What it holds |
|---|---|
| `us_dst_profile_keys_and_weekend` | `estimate` v2 around the summer switch of 2026-03-08 07:00Z, the end of the domain (2027-03-14 07:00Z) and its start (2022-03-13 07:00Z): the three values equal to the test's own computation (each bar deseasonalized by the profile value of its key, the weekend multiplier of t's UTC day, a Saturday among them), at 1h and at 4h; off the domain every value is `non_evaluable`, and at its start the HAR and the GARCH, whose windows hold bars before it |
| `wave2b_registry_reader_closed` | the act refuses by name, exit 2 and no report, 44 registries: under another pin, off its byte form, a key twice, a key more, its keys reversed, a top level without `usDst`, an array for a value, a switch moved; a row at another horizon, family, venue, key or trial id, of a symbol without `USDT`, with a side, a bucket `b1` or thresholds, off `wavePart`, `calibAttempt` (2, or `true`), `alpha` (`"0.02"`) or `testDelta`, with another W (the GARCH's from its strings where the cap would not bind), a form on the GARCH or another HAR form, a string not as JavaScript writes it, the GARCH strings in the order seed, b, a, omega, a seed of 0, a + b = 1, a key more in a fit, a digest of another object, a profile of 11 values or of 3 weekend multipliers, a qhat on an `under_calib` row or in a string, a calib status `vetoed`, a status off its blocks, a month outside its block; a cell twice, another fit on a row of a key, another profile on a row of a symbol and horizon, two HAR forms |
| `equals_wave2b_registry_on_its_blocks` | on a made series of the three veto blocks and their months of inputs, the act counts each row with a `qhat` (HAR in the candle form, GARCH at the cap of 180 bars, EWMA, at 4h; two silence rows, `mae-up` and `mae-down` of the EWMA, the second at a `qhat` of 300, whose misses fall on its down label only; an `under_calib` row not compared) and gives the registry's counts of each block, exit 0: the misses fall where the profile's key and the weekend say (the test's own key, from the table); at the cap no decision is out but those whose window holds the one absent candle; a field of each kind changed in the registry is named, exit 1; a symbol folder named more than the venue's is refused by name, exit 2, no report |

The four tests of c4a keep their names; their input is v2 (the profile in place of the factors, the weekend multiplier from the
instant's day), their computation reads the factor of each bar's key from the test's own table, and it writes `non_evaluable` for a
value that is not finite (f off the domain), as the tool does. The case « a factor of 0 or absent among the inputs » of
`garch_and_ewma_on_deseasonalized_inputs` becomes « a bar off the table's domain » in `us_dst_profile_keys_and_weekend`, and its mutation
line on `factor()` (`g > 0`) is withdrawn: a profile value of 0 is refused by name (Q7), so no factor of 0 reaches the evaluation, and that
check of `factor()` stays as the evaluation's own guard. `frozen_fit_strings_refused_by_name` gains the cases of the input v2: a profile
value of -1, of 0, or written `0.70`, or its two keys reversed; instants in an object or one twice; the input `5`, an array of its key
names, a range of three bounds (KQ-2B-INPUT-SHAPE-1).

## 9. Measures before the push (offline, Node 24.21.0, CPython 3.14.8, Linux)

- **The file**: `test/kata-quarter.test.ts` 45 of 45 in 182 s after the review's fold (171 s before it; bound 300 s; the trunk's 42 took
  193 s in a run of the same day on the same container), 0 refused; the three new tests take 1.4 s (`us_dst_profile_keys_and_weekend`),
  9.7 s (`wave2b_registry_reader_closed`, 44 launches) and 7.6 s (`equals_wave2b_registry_on_its_blocks`, three runs of the act on a series
  of 26 months: two counts and one refusal). `test/killer-lines.test.ts` 1 of 1; `test/verifier-tool-ci.test.ts` 10 of 10.
- **Red at the base**: the seven tests of the wave 2b evaluation (the three new ones and the four of c4a on the input v2), with the
  trunk's `quarter_2b.py`, `quarter_core.py` and `quarter_oracle.py`: 7 of 7 red by an assertion (the input v2 refused by the v1
  reader; the act unknown, its usage printed); the files restored by sha256.
- **Mutation lines**: 62 new (7 in `frozen_fit_strings_refused_by_name`, 7 in `us_dst_profile_keys_and_weekend`, 40 in
  `wave2b_registry_reader_closed`, 8 in `equals_wave2b_registry_on_its_blocks`), 2 withdrawn (`factor()`'s `g > 0`, section 8; the v1
  factors' form, gone with them), 6 renumbered (the lines of `quarter_oracle.py` after the new branch of `act`, l.152, l.168, l.179, l.180).
  At the first head of the code, each mutation line of the seven tests and of the three earlier tests whose code moved or changed
  (`equals_wave2_registry_on_its_blocks`, `equals_registry_on_test_block`, `k_test_exact_on_a_made_series`, the one inside it on
  `quarter_core.py` l.96 included) applied alone, with only its test run, offline: 91 mutation lines, each red by an assertion, each file
  restored by sha256, 0 refused. One line first written for the profile digest also disabled the fit digest (`and … or` precedence) and
  reddened on the fit's case: it was replaced by one that removes the profile digest only, red on its own case. The review's fold adds 12,
  one for each check that no case reached and one for the order of the frozen strings, which the reader now holds (`quarter_2b.py` l.223,
  l.224, l.291, three on l.292, l.294, l.295, l.298, l.301 and l.310, `quarter_oracle.py` l.195); then each mutation line of the three tests
  it touched (`frozen_fit_strings_refused_by_name`, `wave2b_registry_reader_closed`, `equals_wave2b_registry_on_its_blocks`) applied alone
  again, with only its test run, offline: 62 mutation lines, each red by an assertion, the 12 new each on its own case, each file restored
  by sha256, 0 refused.
- **Anchors** (the atelier's checker, the touched test files against the trunk): 306 mutation lines, 305 on the same line as at the
  trunk, 1 on a line changed in place (`quarter_core.py` l.96, `count_row`'s sigma_hat: its text still once on its line, red alone).
- **Other gates**: typecheck of the two touched test files; `eslint` on the test file; the six rules of the lint ratchet and
  `restrict-template-expressions` on it as errors (0); `lang:gate`; `gate:vocab`. Under the case-folding git wrapper, the seven tests
  7 of 7, every `git add` clean; the 152 names the tests wrote, 0 equal once case is folded, 0 that Windows refuses.

## 10. Size

R-25 in the CI form (`scripts/oracle/r25.mjs` against the trunk `373e6da3`). **The gap to the estimate**: the plan priced c4b at ~290 (plan
l.596: the profile, the weekend and the DST table ~80, the reader of the 2b registry ~80, their share of the tests of c4, and the code of
L-O4 ~30); made, 609 changed lines at the head of the code (528 insertions, 81 deletions; content 0), and 647 after the review's changes
(566 insertions, 81 deletions). Of the 609, 229 are the tool's code (`quarter_2b.py` 181, `quarter_oracle.py` 40, `quarter_core.py` 8), near
the ~190 the plan gives the code; 376 are `test/kata-quarter.test.ts` (321 insertions, 55 deletions), and 4 the pinned names and their
count. **Its cause** is mostly the tests: the format, frozen after the plan, fixed reader checks the plan did not price (a row of 33 keys,
each check refused by name), and the reader's checks have their cases (35 registries, 44 after the review); the test builds its own registry
and series (`row2b`, `wave2bReg`, `decided`, `series2b`), since no fixture file can hold the format's 72 rows; and the input v2 rewrites the
four tests of c4a. The estimate written before the code (~480, ~620 at +30 %) already passed the plan's lot bound of 547 at the high
estimate.

The parts could have been merged apart, in one order: the DST table, the profile and `estimate` v2 (with KQ-2B-INPUT-SHAPE-1) need neither
the reader nor the act and could have gone first; the reader needs the profile and the act needs the reader, so those two follow. The lot
was not split. **MONARK's decision** (`coordination/messages/2026-10-17-MONARK-vers-RECHERCHES-c4b-taille.md` of RECHERCHES, mailbox commit
`5a98f1f5`): no split. The rule is the plan's (plan l.578-580): 547 bounds the estimate at the G0, the measure is bounded by `r25()` at 1
150 and by the CI gate at 1 205; 609, and 647 after the review, are under both.

## 11. Questions (default in brackets; each default built here, reversible within this lot)

- **Q1** — The count of a quarter Q_k with 2b rows: in this lot, or when the guard admits them? [When the guard admits them (section 2):
  `count` unchanged here; the rows, their sigma_hat and their lookback are ready for it.]
- **Q2** — The 72 rows in the order of "Trials" and `trialRegistryHead`: held by the reader? [No, as c3 for the core (section 4).]
- **Q3** — `fdec` on the frozen strings of the registry: the string equal to JavaScript's writing of its double (F2b l.51), beyond the
  form of `DECIMAL` that c4a holds? [Yes, in the reader and in the profile of `estimate`; the fits of `estimate`'s input keep c4a's form.]
- **Q4** — L-O4 compares the three veto blocks, as L-O3, and not CALIB-2 (`calib.n`, `calib.kObs`, `drops.calib`, `nonEvaluable.calib`)?
  [The three veto blocks; CALIB-2 is the calibration, which L-O3 does not compare either.]
- **Q5** — The name of the act: `equals_wave2b_registry_on_its_blocks` (the registry of wave 2b, file `wave3.json`, whose number is a file
  name, F2b l.12)? [Yes.]
- **Q6** — `estimate`: v1 removed and v2 in its place, rather than both? [v2 only: the given factors had no source but the test.]
- **Q7** — A profile value or multiplier of 0 in `estimate`'s input: refused by name (it is not an `fpos`), where v1 made the values that
  read it `non_evaluable`? [Refused: the profile has the registry's form.]
- **Q8** — Each veto block counted on its candles from `READS[block].start` to its end, cut from one read of each series under
  `quarter_wave2.READS` (a read of a block alone refuses a `missing.json` that lists slots of another block)? [Yes (section 5).]

## 12. Left out, carried

- The entry of `wave3.json` into `count` and the evidence (Q1), at the revision of the guard that admits 2b rows (W2B-GUARD-ADMISSION-1):
  the reader's call and the key of its pin in `quarter_evidence.py`.
- KQ-2B-ONCE-DOMAIN-1 (not touched); KQ-LO3-EXCLUSIONS-1 (both acts).
- Carried from c4a to the freeze, unchanged: the HAR fit on the means per bar (c4a Q2), the GARCH fit with a + b below 1 and a zero mean
  (Q6, Q10); now also: the procedures write every frozen string as JavaScript writes its double (Q3), or the reader refuses the registry.
