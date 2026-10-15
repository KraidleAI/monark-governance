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

## 2. The choices the plan leaves open

| # | Choice | Rests on |
|---|---|---|
| 1 | **The tool's own reader**, not a call of `load_series`: the frozen function stays as it is (CM-5 never changes `kata-recalc`); the reader changes its close time test alone and imports every form it shares with it. Its refusals keep the frozen tool's words, but for the close: « open time, or a close time out of its slot » (so a test tells the two readers apart). | plan l.414 (« remplace l.104 », « admet une clôture dans [open, open + 15 min − 1 ms] »), l.842 (« qui remplace aussi l.104 »); the pins of `recalc_p2.SYMBOLS` still imported (l.843) |
| 2 | **The threshold**: a candle whose close is at least open + 15 min − 1 ms − 60 000 ms is an ordinary candle: no halt, no drop, nothing printed. One minute exactly is ordinary. | plan l.389; S22 l.88 (« close_time >= open + interval - 1 ms - 60 000 ms ») |
| 3 | **E (8 bis)**: a truncated candle with 0 trades: the open of the first candle of the contiguous run of 0-trade candles that ends at it, the run read on present candles of consecutive grid slots (a missing slot ends it); with trades: its close + 1 ms. | plan l.389; S22 l.89; S23 l.49 |
| 4 | **R**: the first grid slot after the truncated candle that is not declared missing, that is the end of the run of `missing.json` slots that follows it, else the next candle (its slot + 15 min). No FAITS list exists for LIVE: R is read on `missing.json` and the next candle only. | plan l.389, l.398-399 (adaptation (i)); S22 l.93; S23 l.50 |
| 5 | **Where the halts are taken**: on the two reads together (`merge`), so a halt at the seam S_k takes its run of 0-trade candles from read 1 and its resumption from read 2. Each read also carries its own halts (`read_series`): the oracle acts count on the sealed read alone, as their merged read (`quarter_oracle.counted`). The venue pass of c1b reads the merged read's halts (S22 l.95-97 unchanged: same missing candles, same resumption, E the earliest, R the latest). | plan l.389 (« R = fin de la suite `missing.json` qui suit ») and l.409-412 (the pass after the loading, before any drop) |
| 6 | **The halts kept on the merged read**: those that end after S_k (R > S_k). A halt that ends before S_k meets no label window [t, t + h) of a decision t ≥ S_k (drop (a)), and the input windows that hold its truncated candle stay evaluable (S22 l.102): it changes no count, and the evidence prints only the intervals applied to Q_k. | S22 l.100-102; plan l.434-435 (`halts`, the intervals applied) |
| 7 | **The lists against the manifest**: `manifest.json` of the series folder, read under the role `recorder` when the folder holds one; each list it carries (both for a `monark.series.binance.v2`, which always has them, either one for a v1 that carries it) must be the computed list, compared by its JSON text (so a `true` is not a 1); a difference is refused by name, the lists named. A v1 without lists, or no manifest, has nothing to compare (« Absent: never computed », `scripts/record-binance-klines.d.mts` l.73 and l.75). | plan l.415-416 (« les compare aux listes du manifeste v2 quand elles existent (une v1 n'en a pas) ») |
| 8 | **The fixtures of L-T16 are made by the test** under its temporary folder, from the fixture's LIVE series with its gaps filled (as c1b, c2a and c2b do): nothing is committed under `fixtures/kata-quarter/rule8/`, and R-25 counts no data file. | plan l.925 (three fixtures, not files); the zone row (`fixtures/kata-quarter/rule8/` « s'il faut les verser ») |
| 9 | **The EE-8 status is not computed**: [E, R) is printed, the count does not depend on it (drops (a) are the same). | plan l.398-399 (adaptation (ii)), l.401-403 (CM5-HALT-EPOCH-CLASS-1) |
| 10 | **L-T16b keeps its stand-in**, now on `merge`: it tests the venue pass with E and R a few seconds apart and an R off the grid, which no real series gives (R is always on the grid). L-T16 runs the venue pass on real halts of one symbol. | `docs/G0-lot-cm5-c1b.md` section 3 (the stand-in) and section 5 |

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

| Test | What it holds | Killers |
|---|---|---|
| `truncated_candle_rule8` (L-T16) | filled at the freeze | the plan's: `quarter_load.py:<threshold> CONST "60_000" -> "0"` |

## 6. Estimate (R-25: lot bound 547, the plan's rule of an estimate under 547 at +30 %, plan l.580)

Code ~80 changed lines (the reader ~40, `halts` ~15, the manifest ~12, `read_series` and `merge` ~10, `venue_halts` 2, headers);
tests ~110 (L-T16 ~50, the four cases ~6, the stand-in ~4, the killers moved with the lines ~40, ins + del); the driver and its
test ~4; the count records ~4. About **200**, **260** at +30 %: under 547, no split.

## 7. Not in this lot

- The EE-8 classification of a LIVE halt (CM5-HALT-EPOCH-CLASS-1) and the dated text that applies rule 8 to LIVE reads
  (CM5-RULE8-APPLY-1): texts of RECHERCHES, outside the code.
- L-T16b on real halts of several symbols: its stand-in stays (section 2, row 10).
