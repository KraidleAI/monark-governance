# G0 — CM5-c1a-2: the real halts of the loader of the quarter counts tool (rules 8 and 8 bis)

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `1479a670` (after the merge
  of c2b).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, v6): the row of
  the truncated candle in the table of section 3.4 (l.389) and the paragraph « Pourquoi la règle 8 pour LIVE (Q-CM5-6) » (l.392-406),
  the loader (l.414-419), the row c1a and its pre-declared split (l.590), L-T16 (l.925), Q-CM5-6 (l.1062-1067). Rule texts: rule 8 of
  ADR 0006 addendum 1 (recherches, `decisions/0006-ADR-addendum-1-power-table-precisions.md` l.86-102, here S22) and its two
  clarifications, addendum 4 section 5 (`decisions/0006-ADR-addendum-4-historical-EE-7.md` l.47-50, here S23).
- **Carried items folded**: CM5-C1A-2-REAL-HALTS-1 (this lot's object) and KQ-SERVED-FORMS-TEST-1 (section 4).
- **No series byte read.** Every series of the tests is made by the test, under its temporary folder, from the synthetic fixture.

## 1. What changes

Until now the loader read each series through `recalc_p2.load_series`, which stops on any close time other than open + 15 min − 1 ms
(`tools/kata-recalc/recalc_p2.py` l.109-110, « open or close time »). On a real LIVE series with one truncated candle, `count` refused
instead of counting, and the venue pass and drop (a) of c1b never saw a real halt.

- `tools/kata-quarter/quarter_load.py`:
  - `read_candles`, the tool's own reader of a series. It replaces the close time test of `load_series` (plan l.414: « remplace
    l.104 ») and keeps every other check, with the frozen tool's own forms and refusals imported (`recalc_p2.CSV_HEADER`, `RE_INT`,
    `RE_DEC`, `iso`, `Stop`; public names only): the bytes refused before parsing unless their sha256 is the pin (D-3), LF endings, the
    header, twelve fields, integer and decimal fields, the open time written by `open_time_utc`, on the grid, inside the read's range,
    ascending. It admits a close in [open, open + 15 min − 1 ms] (plan l.414); a close out of its slot is refused by name, as the
    recorder stops one (`close_out_of_slot`, `scripts/record-binance-klines.mjs` l.25-28). It gives the candles as `load_series` gives
    them (the same tuples: the oracle act L-O0 compares them), its stats, and the two lists it computes from the CSV (plan l.414-415):
    `irregular_close` (each candle whose close is not open + 15 min − 1 ms, with that close) and `zero_trade` (the open of each candle
    with 0 trades, a truncated one included).
  - `halts`, rules 8 and 8 bis on candles, declared slots and those lists: the interval [E, R) of each truncation above one minute.
  - `read_series` reads through `read_candles` (no pose of kata_lib's globals any more: the range is an argument), compares the lists
    with the folder's `manifest.json` when there is one, and returns the read's lists and halts; `merge` returns the halts of both reads
    taken together, and the union of their declared slots.
- `tools/kata-quarter/quarter_core.py`: `venue_halts` reads the halts of the merged read (one line; the venue pass of c1b unchanged).
- `test/kata-quarter.test.ts`: the test `truncated_candle_rule8` (L-T16); four cases in `served_history_reader_refuses_gap`
  (KQ-SERVED-FORMS-TEST-1); the stand-in of `venue_instance_one_interval` (L-T16b) moved from `read_series` to `merge`; the killers
  of the loader's lines at their new addresses.
- `scripts/verifier-tool-ci.mjs` (`QUARTER_TESTS`, the new name last) and `test/verifier-tool-ci.test.ts` (the count, 30).
- Fold of the first review (no new test, cases only; the trunk at `73380fff` merged first, on its own): `manifest` holds
  `manifest.json` to its form, as `missing.json` is held (`quarter_load.py` l.276-282: not a JSON text, not a JSON object, or a key
  written twice, each refused by name; `unique`, l.200-203, takes the name of the file it reads); the cases of section 5 that hold the
  reader's own checks, the halts across the seam, the two half-open bounds of drop (a) and the lists of fixture A.

## 2. The choices the plan leaves open

| # | Choice | Rests on |
|---|---|---|
| 1 | **The tool's own reader**, not a call of `load_series`: the frozen function stays as it is (CM-5 never changes `kata-recalc`); the reader changes its close time test alone and imports every form it shares with it. Its refusals keep the frozen tool's words, but for the close: « open time, or a close time out of its slot » (so a test tells the two readers apart). | plan l.414 (« remplace l.104 », « admet une clôture dans [open, open + 15 min − 1 ms] »), l.842 (« qui remplace aussi l.104 »); the pins of `recalc_p2.SYMBOLS` still imported (l.843) |
| 2 | **The threshold**: a candle whose close is at least open + 15 min − 1 ms − 60 000 ms is an ordinary candle: no halt, no drop, nothing printed. One minute exactly is ordinary. | plan l.389; S22 l.88 (« close_time >= open + interval - 1 ms - 60 000 ms ») |
| 3 | **E (8 bis)**: a truncated candle with 0 trades: the open of the first candle of the contiguous run of 0-trade candles that ends at it, the run read on present candles of consecutive grid slots (a missing slot ends it); with trades: its close + 1 ms. | plan l.389; S22 l.89; S23 l.49 |
| 4 | **R**: the first grid slot after the truncated candle that is not declared missing, that is the end of the run of `missing.json` slots that follows it, else the next candle (its slot + 15 min). No FAITS list exists for LIVE: R is read on `missing.json` and the next candle only. | plan l.389, l.398-399 (adaptation (i)); S22 l.93; S23 l.50 |
| 5 | **Where the halts are taken**: on the two reads together (`merge`), so a halt at the seam S_k takes its run of 0-trade candles from read 1 and its resumption from read 2. Each read also carries its own halts (`read_series`): the oracle acts count on the sealed read alone, as their merged read (`quarter_oracle.counted`). The venue pass of c1b reads the merged read's halts (S22 l.95-97 unchanged: same missing candles, same resumption, E the earliest, R the latest). | plan l.389 (« R = fin de la suite `missing.json` qui suit ») and l.409-412 (the pass after the loading, before any drop) |
| 6 | **The halts kept on the merged read**: those that end after S_k (R > S_k). A halt that ends before S_k meets no label window [t, t + h) of a decision t ≥ S_k (drop (a)), and the input windows that hold its truncated candle stay evaluable (S22 l.102): it changes no count, and the evidence prints only the intervals applied to Q_k. | S22 l.100-102; plan l.434-435 (`halts`, the intervals applied) |
| 7 | **The lists against the manifest**: `manifest.json` of the series folder, read under the role `recorder` when the folder holds one; each list it carries (both for a `monark.series.binance.v2`, which always has them, either one for a v1 that carries it) must be the computed list, compared by its JSON text (so a `true` is not a 1); a difference is refused by name, the lists named. The manifest itself is held to its form: a JSON object with no key written twice, else refused by name. A v1 without lists, or no manifest, has nothing to compare (« Absent: never computed », `scripts/record-binance-klines.d.mts` l.73 and l.75). | plan l.415-416 (« les compare aux listes du manifeste v2 quand elles existent (une v1 n'en a pas) ») |
| 8 | **The fixtures of L-T16 are made by the test** under its temporary folder, from the fixture's LIVE series with its gaps filled (as c1b, c2a and c2b do): nothing is committed under `fixtures/kata-quarter/rule8/`, and R-25 counts no data file. | plan l.925 (three fixtures, not files); the zone row (`fixtures/kata-quarter/rule8/` « s'il faut les verser ») |
| 9 | **The EE-8 status is not computed**: [E, R) is printed, the count does not depend on it (drops (a) are the same). | plan l.398-399 (adaptation (ii)), l.401-403 (CM5-HALT-EPOCH-CLASS-1) |
| 10 | **L-T16b keeps its stand-in**, now on `merge`: it tests the venue pass with E and R a few seconds apart and an R off the grid, which no real series gives (R is always on the grid). L-T16 runs the venue pass on real halts of one symbol. | `docs/G0-lot-cm5-c1b.md` section 3 (the stand-in) and section 5 |
| 11 | **One halt per truncation**: each truncation above one minute gives its own [E, R), and two of them close together are not merged. Two truncations in a row print two nested intervals with the same E ([E, t2) and [E, t2 + 15 min)); the drops (a) are their union, so the counts are those of the larger one, and the classification of a LIVE halt (CM5-HALT-EPOCH-CLASS-1) sees one interval per truncation. | S22 l.88 (« Above one minute, the truncation opens a **halt interval [E, R)** »), l.98 (« The interval is an EE-8 instance … »); plan l.389 (« Au-delà : intervalle d'arrêt [E, R) ») |
| 12 | **Each read's own halts are internal**: the halts that `read_series` gives each read (l.90) are those of that read alone. At the seam they differ from the merged ones (read 2 alone gives [S_k, S_k + 15 min) where the merge takes E in read 1). `merge` does not read them: it computes the halts of both reads taken together (l.111-113). Only the oracle acts use them, since they count on the sealed read alone as their merged read (`quarter_oracle.py` l.98). `count` on Q_k and its evidence carry the merged halts only, after the venue pass. | plan l.434-435 (the evidence carries « les intervalles [E, R) appliqués »); choice 5 |

## 3. The evidence's `halts`

The key and its form are unchanged (lot c2, `docs/G0-lot-cm5-c2.md` l.62): one object per interval applied after the venue pass,
`start_ms` = E, `end_ms` = R (integers, ms since the epoch: E can lie off the second, close + 1 ms), and `symbols`, the folders it
is applied to. [E, R) is half-open: a decision t is dropped by (a) when t < R and E < t + h. This lot fills it from real data; before
it, only the stand-in of L-T16b did. The same object is on the JSON line that `count` prints.

## 4. The two items folded

- **CM5-C1A-2-REAL-HALTS-1**: its red case (a LIVE series with one truncated candle, refused today) is fixture B of L-T16, counted
  here with its [E, R) and its drops.
- **KQ-SERVED-FORMS-TEST-1**: four cases added to `served_history_reader_refuses_gap`, each refused by the form check of the reader:
  a `release_dir` off the writer's prefix with a real day (`contract-9.9.9-tables-2026-09-01`), a `task_class` in capitals, a
  `policy_table_sha256` in capitals, a `release_dir` of the year 0099. The four mutants of the review (N-form-rd, N-form-tc,
  N-form-hex, N-day-100) each turn it red.

## 5. Tests and killers

`test/kata-quarter.test.ts` (30 tests; the series of each case written under the test's temporary folder):

| Test | What it holds | Killers (`tools/kata-quarter/`) |
|---|---|---|
| `truncated_candle_rule8` (L-T16), l.971, new | on Q_1 with no gap and, on 2026-11-10, four 0-trade candles from 11:30 and the candle at 12:30 truncated: **A**, 30 s, and one minute exactly, at 0 trades with the five candles from 12:45 missing: no halt, the counts of the regular candle, its lists (the truncated candle in `irregular_close`, as the recorder lists it) held to a v2 manifest; **B**, 10 min at 0 trades, same missing candles: halt [11:30, 14:00), and against the regular candle one more drop at 1h (t = 11:00) for range and path, two at 4h for range (t = 08:00 and 12:00, a range label reads two closes only); **C**, 10 min with trades, no candle missing: halt [12:35:00.000, 12:45), one more drop at t = 12:00 for each row; the lists computed held to a `manifest.json` (a v2 with the computed lists and a v1 with none counted; a v2 without the truncated candle in `zero_trade`, a v2 with no `zero_trade`, a v1 that carries an empty `irregular_close`: refused by name); inside the original range (a truncation in the sealed series at 2026-09-20T12:30Z): counted, no halt printed (it ends before S_1), and `recalc_p2.load_series`, called on that read by a stand-in, stops with « open or close time »; the two half-open bounds (fold): 10 min with trades at 12:45, [12:50, 13:00), t = 13:00 counted at 1h, and a 0-trade run from 12:00 to a 0-trade truncation at 12:30, [12:00, 12:45), t = 11:00 counted at 1h and t = 08:00 at 4h, each with one more drop at t = 12:00 for each row against its own regular candle; the manifest held to its form (fold): not a JSON text, a JSON array, a key written twice, each refused by name; across the seam S_1 (fold): a 0-trade truncation at S_1 in the LIVE series after two 0-trade candles at the end of the sealed one, [S_1 − 30 min, S_1 + 15 min), E in read 1; a truncation with trades at S_1 − 30 min in the sealed series, S_1 − 15 min declared missing there and S_1 in the LIVE series, [S_1 − 25 min, S_1 + 15 min), R in read 2 | the plan's `quarter_load.py:258 CONST "60_000" -> "0"`; `:258 ROR "close >= t" -> "close > t"`; `:261` (the run of 0-trade candles); `:264` (the run of declared slots); `:260` (E with trades); `:285` twice and `:286` (the manifest); `:113` (the halts that end before S_k); `quarter_core.py:102` (drop (a)); fold: `:243` (a truncation of at most one minute listed), `quarter_core.py:102` twice (`t < x` and `e < t + h` closed), `:278`, `:279` and `:281` (the manifest's form), `:111` three times (the zero, irregular and declared sets of read 1 at the seam) |
| `served_history_reader_refuses_gap`, l.828, changed | four cases more (KQ-SERVED-FORMS-TEST-1, section 4), each refused by the form check | `quarter_load.py:188` twice (the forms of `release_dir` and `task_class`), `:189` (64 hexadecimals), `:195` (the year from 100); the review's N-form-rd, N-form-tc, N-form-hex and N-day-100 |
| `venue_instance_one_interval` (L-T16b), l.351, changed | its stand-in now sets the halts of `merge`, which the venue pass reads | `quarter_core.py:82 CONST "min(es)" -> "es[0]"` (unchanged) |
| `series_pinned_before_parse` (L-T5), l.167, changed | the pin check is the loader's reader's (the frozen tool's words) | `quarter_load.py:215 CONST "digest != pin" -> "False"` (the plan's form, l.914) |
| `two_reads_merged_under_check` (L-T18), l.94, changed | the range check is the reader's; the reader's own checks (fold), each refused by name on the LIVE series changed at one line: CR LF, no final LF, another header, 13 fields, a signed integer, a decimal with an exponent, an `open_time_utc` that does not write the open time, a close 1 ms after its slot, a close 1 ms before its open, an open time off the grid, repeated, or going back | `quarter_load.py:236 CONST "not (start <= ot < end)" -> "not (start <= ot <= end)"`; the other killers moved with their lines; fold: `:218` (line endings), `:221` (header), `:227` (`len(f) != 12` -> `< 12`), `:229` and `:231` (integer and decimal fields), `:234` three times (`open_time_utc`, the close after its slot, the close before its open), `:236` three times (the grid, the order dropped, `ot <= prev` -> `ot < prev`) |

**Red-before recipe** (logs kept under the author's scratchpad): each killer of the five tests above applied alone at its file:line,
only its test run under TAP, offline, the file restored and its sha256 checked: 39 of 39 killed, all restored; the review's four mutants
of KQ-SERVED-FORMS-TEST-1, by the review's own applier: 4 of 4 killed. At the trunk, `truncated_candle_rule8` is red by assertion
(fixture A refused, « open or close time », exit 2).

## 6. Estimate (R-25: lot bound 547, the plan's rule of an estimate under 547 at +30 %, plan l.580)

Code ~80 changed lines (the reader ~40, `halts` ~15, the manifest ~12, `read_series` and `merge` ~10, `venue_halts` 2, headers);
tests ~110 (L-T16 ~50, the four cases ~6, the stand-in ~4, the killers moved with the lines ~40, ins + del); the driver and its
test ~4; the count records ~4. About **200**, **260** at +30 %: under 547, no split.

**Measured** (R-25 in CI form, `scripts/oracle/r25.mjs` against `1479a670`): **246** changed lines (204 insertions, 42 deletions),
under the lot bound 547; content 0. The count records are unchanged (`test/kata-quarter.test.ts` is outside `test:main`, and no test of
`test:main` was added): the write tool on a fresh offline run gives 314 files and 3233 tests, and the count check against `1479a670`
is green, 0 drops.

## 6 bis. Runs

- `test/kata-quarter.test.ts` under CPython 3.14.8 (the driver's interpreter, `KATA_QUARTER_PYTHON`), offline, no `node_modules`:
  30 tests, 30 pass; the driver's judge (`quarterTestProblems`, the 30 names of `QUARTER_TESTS`) finds nothing. The same under the
  case-folding git wrapper: 0 case-only collisions; the folders that the new test writes without git: 0.
- `test:main` offline: 3233 tests, 3210 pass, 23 skipped (the trunk's), 0 failures. `lint:ratchet` 69/69; `tsc --noEmit` and eslint
  on the touched `.ts` files, `gate:vocab`, `lang:gate`, `export:check`: green; the killers of the touched test files: 126, each anchored on its line.

## 7. Not in this lot

- The EE-8 classification of a LIVE halt (CM5-HALT-EPOCH-CLASS-1) and the dated text that applies rule 8 to LIVE reads
  (CM5-RULE8-APPLY-1): texts of RECHERCHES, outside the code.
- L-T16b on real halts of several symbols: its stand-in stays (section 2, row 10).
