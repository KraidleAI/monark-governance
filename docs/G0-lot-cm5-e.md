# G0 — CM5-e: the monthly reading, the subcommand `month` of `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-16. Base: trunk `lot/etude-suite` at `0c05e1eb` (#313, the reader of
  the wave 2 core registry, CM5-c3).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, cited `plan l.N`):
  section 3.5 point 6 (l.487-490), the row of the monthly reading in section 4 (l.500) and in section 4.1 (l.530), what waits on
  Q-CM5-9 (section 4.2, l.561-575), the row e of section 5 (l.598), the tests of section 5.3 (l.894-902 the existence assertion, L-T11a
  l.919, L-T11b l.920), the vocabulary rule (l.95-102).
- **The rule read**: ADR 0006 v8.1 D6 (recherches `decisions/0006-ADR-draft-wave2.md` l.191, sha256 `fe48c03a…`): « A **monthly
  reading, report-only**, applies the same binomial rank. Over a 30-day month (n 720 / 180) it flags at k >= 13 / >= 5 … Weak, and
  stated as such. » Addendum 9 point 7 (`decisions/0006-ADR-addendum-9-live-k-quarter-counts.md` l.14, sha256 `8ae73cdb…`): « The
  monthly reading (D6, l.191) applies the same rank to a UTC month, as a report only. It never produces a `retire`, never enters a
  retire list, and never names a cause. »
- **No series byte read, no real registry read.** Every test runs on the synthetic fixtures of `fixtures/kata-quarter/` (no fixture
  file is added: the months are cut from the LIVE fixture of Q_1 by the test). The run on recorded months is MONARK's, and it is
  blocked (section 7).

## 1. What this lot delivers

- `tools/kata-quarter/quarter_month.py` (new, no `__main__`; listed in `tools/kata-quarter/FILES`, 135 lines):
  - `bounds` (l.35-44): the month `YYYY-MM` (ASCII digits, months 01 to 12), from 2026-10, the month of S_1; its start S_m, its end E_m
    (exclusive), the range of the read before it, and its quarter k. A month before 2026-10 is refused by name.
  - `outside_retire` (l.47-50): the output folder, as given (`os.path.abspath`) and resolved (`os.path.realpath`, so through a link or
    a junction), holds no path segment named `retire` in any case (`casefold`); else a named refusal, before any input is read (L-T11a).
  - `closed` (l.53-60): the month's read accounts for every slot up to E_m (a candle present or a slot declared missing); else the month
    is open, a named refusal before the merge. It is the check of `quarter_evidence.closed` with the month's words.
  - `parse` (l.63-73): the two forms of `count`, the quarter k replaced by the month; no option (`--…` refused by name, as `count`'s
    closed `FLAGS`); any other form prints `USAGE` (l.30-32), exit 2.
  - `month` (l.76-124): the reading itself (section 3); `main` (l.127-135): every refusal on the line `REFUSED: …`, exit 2, never a trace.
- `tools/kata-quarter/quarter_counts.py`, three lines changed in place, none moved (so no killer line of the earlier lots moves): l.10
  (the header names `month`), l.32 (the constant of the old refusal, « not in this lot: the month counts arrive with lot e », becomes
  `import quarter_month as M`), l.136-138 (`month` goes to `M.main(args, identity_line)` and exits with its code). The usage of `count`,
  `check` and `vectors` is unchanged; `month` prints its own.
- `tools/kata-quarter/FILES`: the line `quarter_month.py`.

```
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py month <registry> <sha256> [<core registry> <sha256>] <served history> <sha256> <series dir before> <month series dir> <YYYY-MM> <out dir> <folder>:<sha256 before | pinned, 2026-10 only>:<month sha256> ...
```

## 2. What it reads and writes

**Reads**, each under its role of the frozen tool's `io_guard`, each pinned by its sha256 before parsing (the readers of `count`,
imported, never copied): the wave 1 registry (`registry`, `quarter_core.registry_rows`); the core registry when given (`registry`,
`quarter_wave2.counted`, section 4); the served history `kata-served-history-v1` (`served-history`, `quarter_load.served_history`), read
whole as `count` reads it; and for each symbol folder two series reads (`series`, with `missing.json` and `manifest.json` under
`recorder`): **the read before the month**, the month before it under its range (for 2026-10, the sealed series of wave 1 under its
recording range, `quarter_load.sealed_range(1)`, and its pin may be `pinned`, as for quarter 1), and **the month's record** under
[S_m, E_m), merged by `quarter_load.merge` (every grid slot from S_m minus the longest window to E_m present or declared; rules 8 and
8 bis on both reads). The longest window is 404 hours, under 28 days, so the month before always holds it. The roles declared are
those of `count`, `tool-tree` among them: the tool holds both of its trees to the commit before any input (`quarter_identity`).

**Rows**: those of the count of the month's quarter (section 4), kept when the served history serves their class at an instant of the
month (`quarter_load.served_in` on [S_m, E_m)); none served is a named refusal (« nothing to read »), and nothing is written.

**Counts and rank**: `quarter_core.count(reads, rows, (S_m, E_m), venue)`, the count's own code on the month: the pose of kata_lib's
globals for the block [S_m, E_m), its grid (one instant every h from S_m to E_m − h), out / drop / covered / miss, the venue instances
of the halts, the two passes of the log (fdlibm_log decides, math.log listed). On each row's counts, the rank of the quarter:
`u_test` by `quarter_oracle.u_test` (binom_exact's bound under 0.05, `"1"` when every point misses, null with no point) and the
binomial rule `quarter_evidence.fires` at the row's alpha under 0.05, written under the key `flags` (D6's word), never `fires`.

**Writes** `<out dir>/month-<YYYY-MM>.json` by `quarter_evidence.write` (report.canonical of the frozen tool: one ASCII line, sorted
keys, no double; a `.part` renamed, so whole or not at all), named by its sha256 on the line `report month-<YYYY-MM>.json sha256 …`.
Its place on the host is `apps/harness/data/kata/month/month-<YYYY-MM>.json` (plan l.489), written only by the run; no file under
`apps` is added here. The stdout is that of `count` in form: the JSON line of the counts, the lines `decision differs`, their number,
the line `report`, the line `identity`, the inputs noted, `VERDICT: GREEN`.

## 3. The format `kata-month-counts-v1`

Closed: `MONTH_KEYS` (l.27) and `ROW_KEYS` (l.28-29), and the key `core_registry_sha256` iff a core registry was read.

| Key | Value |
|---|---|
| `format` | `"kata-month-counts-v1"`, distinct from `kata-quarter-counts-v1`: a reader of the quarter's evidence refuses it by its format name (L-T11b, lot d) |
| `month` | `{name, start, end, quarter}`: `YYYY-MM`, S_m and E_m (`YYYY-MM-DDTHH:MM:SSZ`), the quarter k that holds it; there is no top-level `quarter` key, which a writer of a `live:<k>` entry would read |
| `registry_sha256`, `core_registry_sha256`, `served_history_sha256` | the pins of the inputs read |
| `series` | by symbol folder: `before_sha256` and `month_sha256` (the pins of the two reads), `gaps` (declared slots of the merged range), `present` and `expected` (candles of the month's read, slots of the month) and `complete` (`1000 present >= 999 expected`) |
| `halts`, `grid`, `pose` | as in the quarter's evidence: the venue instances applied, the grid of each horizon (`instants`, `first`, `last`), kata_lib's pose |
| `log` | the census of the log in counts (`decides`, `inputs`, `inputs_differing`, `decisions_differing`) |
| `rows` | each row served in the month: `task_class`, `key`, `calib_attempt`, `alpha`, `horizon`, `n_test`, `k_test`, `drops_label`, `out_input`, `u_test`, `flags`, `served_from`, `served_to` (its service in the month, [from, to)), `served_tables` |
| `identity` | the commit and the digests of both trees, the line `identity` |

**Never in it**: a key `cause`, `entries` or `fires`, the word of a retire list, a price, an instant of a miss, the months of the
misses. A row that flags is a row of a report: no writer of a retire list reads a `flags` (the writer of RETIRE-LIST-WRITER-1 writes an
entry `live:<k>` from a row of `kata-quarter-counts-v1` whose `fires` is true, plan section 3.5 point 3). The quarter's prudent
variant (CM5-COMPLETENESS-1) is not computed: it guards a retire, which a month never makes; the completeness counts are kept.

## 4. The month bounds, and the wave 2 core rows

**Bounds.** A month is [S_m, E_m), 00:00Z of its first day to 00:00Z of the next month's; its instants are those of the h grid from
S_m to E_m − h. Every month lies in one quarter (quarters are three whole months from 2026-10-01): 2026-10 to 2026-12 in Q_1, 2027-01
to 2027-03 in Q_2. A month at the start of a quarter reads before it the last month of the previous quarter (2027-01 after 2026-12),
so its windows cross E_1; 2026-10, the first, reads the sealed series of wave 1. 2026-09 and earlier are refused by name.

**The core rows of wave 2.** The month reading takes the optional core registry exactly as `count` does (`quarter_wave2.counted`, the
reader of c3: attempt 2, the row's own `qhat`, the child rule), and judges the child rule on **the start of the month's quarter** S_k,
not on S_m (l.90). Why: the monthly reading of D6 is the reading of the rows that wave 2 serves before the first full quarter (D6
l.191: « From serving … to the close of LIVE-1 … there is no full quarter »), so the core rows must be in it; and its rows are those
of its quarter's count, restricted to the month, so a month never reports on a row that its quarter will not count. With CALIB-2
ending on 2023-10-01 every month from 2026-10 counts the core rows; the test poses the end of the core data at 2026-11-01 in a
repository of its own and shows that Q_1 and 2026-11 then both count none (a month rule on S_m would count them in 2026-11).

## 5. `count` and `check` unchanged

Shown as in lot c3: the same runs from the base tool (`0c05e1eb`) and from the head tool, each from a temporary repository of its own two
trees, offline, stdout compared with each tool's identity masked (the line `identity`, the lines `input tool-tree`, and the lines
`evidence` and `report`, which name files that carry the identity block), and each file written compared without its identity block
(and, for the act, without its `tool-tree` inputs). **7 of 7 equal**: `check` (18 lines), `count` under a history of three deployments
(15 lines; evidence without identity sha256 `91abbd78…`), the same with the core registry (16 lines; `40715f45…`), `check
original_values_byte_equal` (its report `497a3ccf…`), a refusal of `count`, the usage, and `vectors` (`7ab8f570…`, the file of the
fixture). The 34 earlier tests of the file pass; the test of the entry now asks `month` with no argument for its own usage, where it
asked for the old refusal (`tools/kata-quarter/quarter_counts.py` l.32 at `0c05e1eb`).

## 6. Tests (the section that ends `test/kata-quarter.test.ts` at this change, from l.1329; each red at the base by its first assertion, `existsSync(quarter_month.py)`)

| Test (plan) | What it holds | Its killers (the comment lines above the declaration; the plan's is the last) |
|---|---|---|
| `month_writer_never_names_a_cause` (L-T11a, l.1375) | 2026-11 with a row that flags (qhat 0): one canonical ASCII line named by its sha256, the closed keys of the report and of each row, no key of a cause, of entries or of a fire, no word of a retire list or of a cause in its values, no double, the public vocabulary gate clean, the identity block the line identity, the served history noted under its role; an output folder under `retire`, `Retire`, `RETIRE` or a link to a folder `retire`: refused by name, exit 2, nothing written | five, l.1370-1374: the plan's (the format named `kata-quarter-counts-v1`), a key added to the rows, the refusal without `casefold`, without `realpath`, dropped |
| `month_counts_equal_quarter_restricted_to_the_month` (l.1444) | with the core registry: 2026-10, 2026-11 and 2026-12 give each row of Q_1 (attempt 1 and 2) the `n` and `k` of its month in the quarter's count, and sum to its drops, its instants out and its grid; `u_test` is binom_exact's bound run apart in a Python of its own; `flags` is k >= k*(n) of the guard's vetoFires as `veto-vectors.json` holds it, rows that flag and a row with misses that does not among them; core data ending at 2026-11-01: no core row in Q_1 nor in 2026-11 | five, l.1439-1443: `u_test` on k = 0, `flags` at alpha 0.5, the core registry dropped, the child rule on S_m, the span of the count cut by an hour |
| `month_bounds_first_and_last_instants` (l.1492) | 2026-10 (after the sealed series), 2026-11, 2026-12 (to E_1 − h) and 2027-01 (quarter 2, after 2026-12): bounds, quarter, grid (744 or 720 at 1h, a quarter of it at 4h), pose and read before; 2026-09 refused by name; under a history from 2026-11-10: 2026-10 refused by name (no row served), 2026-11 served from 2026-11-10 11:00Z on every instant | five, l.1487-1491: the end a day early, the quarter of a month shifted, a month before S_1 admitted, the served rows not filtered, the service judged past the month's end |
| `month_refuses_by_name` (l.1531) | exit 2, the refusal's text, no report: `2026-13`, `2026-1`, `--calls`, a record that stops at 2026-11-20, `pinned` after 2026-10, a folder named twice, a folder outside the venue, an output in the month's folder | seven, l.1524-1530 |

Each killer, applied alone to the working tree and its test run alone (offline under the atelier's no-egress wrapper, CPython 3.14.8),
the file restored and its sha256 checked after each run: **22 of 22 killed by assertion**, and the three killers of the entry test
(unchanged lines) still kill it. One killer first written (`flags` at alpha 0.001) survived: the attempt 1 rows of the fixture have
at most 2 misses in a month, which do not flag at 0.001 either, and the attempt 2 rows flag at both; it was replaced by alpha 0.5,
which turns those flags off, and an assertion that rows flag and that a row with misses does not was added. Each test is red at the
base by its first assertion (shown with `quarter_month.py` set aside: four `ERR_ASSERTION` « tools/kata-quarter/quarter_month.py
absent »). `scripts/verifier-tool-ci.mjs` names the four tests at the end of `QUARTER_TESTS`, and `test/verifier-tool-ci.test.ts`
their number, 38; the four names are written on the last line of the list, so that no line of the driver moves and the killers of
`test/verifier-tool-ci.test.ts` keep their anchors (every killer line of the tree holds its text once on its line: 2414 checked). The
file runs in 194 s here (189 s at the base, offline, CPython 3.14.8), under the driver's bound of 300 s.

**2026-10-16, fold of the review's round 1** (five test gaps, `tools/kata-quarter/` unchanged; no test and no test name added): `month_writer_never_names_a_cause` refuses a link `x/retire` to a folder `store`, as given; `month_counts_equal_quarter_restricted_to_the_month` asserts, for 2026-11 with the core registry, `core_registry_sha256` and the counts of `syn` (2880 expected, 2879 present, 1 gap, complete), the same month with two more slots declared missing not complete (2877 present), and rows at the rule's edge (k*(88) = 4, k*(619) = 12 by binom_exact: `syn-range-4h` at k 4 flags and at k 3 does not, `syn-range-1h` at k 11 does not); `month_bounds_first_and_last_instants` reads 2026-10 after a sealed series with a candle of 2026-08-31 under a service ending 2026-10-20 11:00Z, then refuses 2026-11 (nothing served); `month_refuses_by_name` refuses `2026-111` and stops `pinned` at 2026-10 at `quarter_load.sealed_pin`; twelve killer lines, first in the four blocks (l.1369, l.1433-1438, l.1485-1486, l.1521-1523), each red alone, the 25 earlier still red; the file runs in 208 s (38 of 38, offline).

## 7. Left to MONARK and to later lots

- **The run on recorded months** (plan l.561-575): there is no recorded month until Q-CM5-9 receives its go (the monthly recording,
  CM5-b, is blocked); until then the code exists and the run does not, and condition 2 of Q-W2-26 has no monthly reading before
  2027-01-01 (CM5-MONTHLY-GAP-1). MONARK runs it on the host, after each month recorded, into `apps/harness/data/kata/month/`.
- **Lot d**: its reader of the quarter's evidence refuses a `kata-month-counts-v1` by its format name (L-T11b, plan l.920); the format
  here gives it that name, and no key of the evidence that a writer of a retire list reads as a fire.
- **MONARK**: the Windows replay of the test file (the junction of the link case, the casefold of `Retire`).
