# G0 — CM5-c4a: the evaluation of the three wave 2b estimators on their frozen fits, `tools/kata-quarter/quarter_2b.py`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-16. Base: trunk `lot/etude-suite` at `ea59c512` (#314, the monthly
  reading, CM5-e).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, cited `plan l.N`):
  the size rule of section 5 (l.576-581: lot bound 547, each lot under it at +30 %), the row c4 (l.596: c4a, the three estimators,
  ~300), the item CM5-2B-ESTIMATORS-1 (l.1180-1190: no optimizer, neither least squares nor likelihood; only evaluation code may be
  reused), the reuse of `tools/kata-recalc` under io_guard (section 5.2, way (b): imported, never copied, never modified; the
  constraints of point 9 (a): only the native modules of `NATIVE`), the tests (section 5.3: one declared killer per CI test, each test
  red at the base on its first assertion, the existence of the module this lot adds).
- **The rule read**: ADR 0006 v8.1 D4, « Design 2 (wave 2b, pre-registered at P0-2) » (recherches `decisions/0006-ADR-draft-wave2.md`
  l.117-137, sha256 `fe48c03a33da7ab0…`, the plan's S3): the fit block (l.119), the profile (l.120), the freeze order (l.121-128), the
  three estimators (l.130-134), « **Fits are freezes**: decimal strings … The frozen strings are the pinned object, and everything after
  them is exact » (l.135-136). Addendum 10 (`decisions/0006-ADR-addendum-10-wave2b-order.md`) fixes the ids and their chain order only;
  no other addendum and no P0-2 file defines the estimators further (searched by their ids and by HAR, GARCH, NNLS, QML).
- **No series byte read, no real fit, no registry.** Every test runs on a series made by the test itself, with made-up fit strings.

## 1. What this lot delivers

- `tools/kata-quarter/quarter_2b.py` (new, no `__main__`; listed in `tools/kata-quarter/FILES`): pure functions that evaluate
  `har-rv15-sp-v1`, `garch11-sf-sp-v1` and `ewma-vol-sp-v1` at a decision instant t from frozen decimal strings and given inputs, the
  GARCH window rule, the refusals of malformed fit strings by name, and `estimate`, the subcommand of that name (section 7), the only way a test
  reaches the evaluation under io_guard.
- `tools/kata-quarter/quarter_counts.py`: three lines after l.153, the branch `estimate` of the block `__main__` with its import of
  `quarter_2b` (inside the branch, so that no line of the module's head moves), after every line that a killer of the earlier lots
  names, so none moves; and the header's l.10 names it, in place. The usage and every output of `check`, `count`, `vectors` and
  `month` are unchanged (measured, section 9).
- `test/kata-quarter.test.ts`: four tests at its end (section 8); `scripts/verifier-tool-ci.mjs`: their names in `QUARTER_TESTS`;
  `test/verifier-tool-ci.test.ts`: the count of the file's tests, 38 to 42. The first review's fold adds cases and mutation lines inside
  the same four tests, no test and no name (section 13).
- **No optimizer**: no least squares, no likelihood, no refit, no search over a parameter. Nothing here fits anything.

## 2. The evaluation API

Each function is pure: it reads only its arguments and returns a binary64 or `kata_lib.NE` (`"non_evaluable"`, the tool's word for an
input window that does not give a value), never a file, never a global but kata_lib's posed ones that `window_at` reads.

- **A series** is the tool's own: `candles`, the dict open time (ms) → (open, high, low, close, volume, takerBuyBase) that
  `quarter_load.read_series` returns, and `bars`, `kata_lib.build_bars(candles, h)` under the pose of kata_lib's globals
  (`quarter_core.posed`). t is an instant of the horizon grid; the windows end at t (`kata_lib.window_at`: the last bar is [t − h, t)).
- **The deseasonalizing factor is given, never computed here.** The profile f, its keys (US Eastern hour at 1h; UTC 4h slot and US
  summer time at 4h), the DST table and the weekend multiplier are lot c4b's. The evaluation takes `f`, a function of a bar's start
  (ms) that returns the factor of that bar's key: the key of a bar [s, s + h) is that of the decision instant s (ADR l.120). So
  `f(t)` is f(key of t), and `f(u)` for the bar u that holds a return is f(key of u). It also takes `weekend`, the multiplier of t,
  a number. A factor that is absent (`None`), not finite or not above 0 makes the value `NE`, as `recalc_p2.sigma_hat` does for a
  slot without a factor.
- `frozen(kata, fit, horizon)`: the frozen strings of a fit checked (section 6), each read into binary64, and for the GARCH its window
  by `window(exact, horizon)` on the same strings read as rationals (section 4); a fit is checked once, before any evaluation.
- `sigma_hat(kata, fz, t, horizon, candles, bars, f, weekend, form=None)`: step 4 of the freeze order (l.128), `(sigma × f(t)) ×
  weekend`, sigma being `har`, `garch` or `ewma` below on the frozen fit `fz`; `NE` unless every factor is a finite binary64 above 0
  and the result is finite and above 0 (`kata_lib.scale`).
- `har(fit, form, t, horizon, candles, bars, f)`, `garch(fit, w, t, horizon, bars, f)`, `ewma(t, horizon, bars)`: sigma_fit_t, or
  sigma_pre_t for the EWMA, before the profile of t.

## 3. `har-rv15-sp-v1` (ADR l.130, step 3 l.126)

sigma_fit_t² = b0 + b1 RV_bar + b2 RV_day + b3 RV_week, computed `((b0 + b1 × x_bar) + b2 × x_day) + b3 × x_week`, then its square root
when it is finite and above 0, else `NE`. The window is 672 candles, 7 days: 168 bars at 1h, 42 at 4h. Each bar's value is
deseasonalized first, x_j = RV_j / (f(j) × f(j)) (« HAR on RV_bar / f(key of bar)^2 »); x_bar is the last bar's, x_day the mean of
the last day's bars (24 at 1h, 6 at 4h) and x_week the mean of the window's bars, each mean an explicit loop from the oldest (Q2).

- **The candle form**: RV_j is the sum of the squared 15-minute log returns of the candles of bar j, each return ln(close / the close
  of the candle before), so the window reads 673 candles, the 672 of [t − 7 days, t) and the one before (Q1); any of them absent: `NE`.
- **The per-bar Rogers-Satchell form**: RV_j = ln(H/C) × ln(H/O) + ln(L/C) × ln(L/O) of the bar j of `kata_lib.build_bars` (Q4); any
  bar of the window absent: `NE`.
- **How the form is chosen**: never here, and never from data or an outcome. ADR l.130: « The candle form is used iff the dated
  [SPEC] candle-window version is merged before the wave 2b run, else the per-bar Rogers-Satchell form (a merge date, never an
  outcome). » The form is an argument named by the caller, from `FORMS` = (`candle`, `rogers-satchell`), with no default; any other
  value is refused by name (Q8). It will come with the frozen fit, which was fitted on that form's inputs (lot c4b reads it).

## 4. `garch11-sf-sp-v1` (ADR l.131-133, step 3 l.125)

- **The W rule, exact on the frozen strings**: p = a + b as rationals (`fractions.Fraction` of the strings, standard library, no native
  module: `fractions` loads no `decimal` under 3.14, measured); W the smallest integer from 1 with p^W ≤ 3/100, computed by exact
  products, capped at 720 bars at 1h and 180 at 4h (`CAP`). `window` returns W, whether the cap binds (the least such W is above the
  cap) and the residual seed weight p^W, the exact rational rounded once to binary64 (printed as JavaScript writes a double). The ADR's
  computed bounds hold: at 1h p = 0.99514 gives W = 720 unbound and p = 0.99515 binds; at 4h, 0.98070 and 0.98071 (test 1). p ≥ 1 has
  no such W: refused by name (Q6). The seed is a frozen string, so the evaluation itself needs no unconditional variance; the refusal is a
  guard, and the fit procedure fixed at P0-2 must keep a + b below 1 (section 10).
- **The seed**: « seeded with the SELECT-1 unconditional variance » (l.131). That variance is part of the frozen fit, the string
  `seed`; it is never computed here (it needs the SELECT-1 block and the profile), and never replaced by omega / (1 − a − b) (Q5).
- **The mean**: zero. The recursion reads r_u / f(u) with no mean subtracted; a frozen fit has exactly the keys `omega`, `a`, `b` and
  `seed`, so a fit with a mean is refused by its keys (Q10).
- **The recursion**: on the W one-bar log returns of the W + 1 bars that end at t (the window and the bar before it, whose close is the
  first return's base, as the 100 returns of the [K] D4 EWMA read 101 bars) (Q5), each deseasonalized e_u = r_u / f(u) (« GARCH on
  r_u / f(key of u) »): s² = seed, then for each u from the oldest s² = (omega + a × (e_u × e_u)) + b × s²; sigma_fit_t = √s², the
  variance of the bar [t, t + h). Any bar absent: `NE`.

## 5. `ewma-vol-sp-v1` (ADR l.134, step 1 l.122)

sigma_pre_t is the [K] D4 EWMA, lambda 0.94 on 100 one-bar returns, no factor: `kata_lib.KATA_FUNCS["ewma-vol-hw-v1"]` on
`window_at(bars, t, kata_lib.W["ewma-vol-hw-v1"], h)`, looked up at each call, imported and never copied, so the tool's passes of the
log apply to it as to the count. No fit: its frozen fit is the empty object. Then step 4 with the new profile: `(sigma_pre × f(t)) ×
weekend`, « a one-change contrast with `ewma-vol-hw-v1` ».

## 6. Numeric conventions and refusals

- **« everything after them is exact »** is read as: fixed to the bit. Each frozen string is read once into binary64 by correct
  rounding (`float`); every sum is an explicit loop from the oldest, as kata_lib's (never `sum()`, compensated since 3.12); the order of
  each operation is the one written above; values are compared by strict equality, never within a tolerance. The one computation that
  the ADR names exact, p = a + b and p^W against 0.03, is rational.
- **The log follows the tool's rule** (`docs/G0-lot-cm5-c1c.md`): each ln is `kata_lib.math.log`, read at the call, so under
  `report.setting("ln")` it is the port `fdlibm_log` of V8's log (which decides) and under `"base"` it is `math.log`; `estimate` runs
  both passes and lists every value that `math.log` changes. Square roots are `math.sqrt`, correctly rounded.
- **Refusals by name** (`Refused`, exit 2, never a trace): a kata that is not one of the three; a fit that is not an object with exactly
  its keys (`b0`, `b1`, `b2`, `b3`; `omega`, `a`, `b`, `seed`; none for the EWMA); a value that is not a string; a string out of the form of
  a non-negative JSON number, ASCII digits only (`0|[1-9][0-9]*`, a fraction, an exponent; Q7), so that no sign, space, underscore,
  non-ASCII digit, `inf` or `nan`, all of which `float` or `Fraction` would take, reaches the evaluation; a GARCH fit with a + b ≥ 1; a
  HAR form outside `FORMS`.

## 7. The entry `estimate`

`python -E -S -s -B -P tools/kata-quarter/quarter_counts.py estimate <series dir> <symbol folder>:<series sha256> <input.json> <its sha256>`

It declares `series`, `recorder`, `registry` and `tool-tree`, holds both trees to the commit (`quarter_identity`), reads the input
under `registry`, refused before parsing unless its sha256 is the pin, then the series by `quarter_load.read_series` under the input's
range and its pin. The input is closed (`INPUT`): `format` `kata-2b-estimate-input-v1`, `horizon`, `range` [start, end) in
`YYYY-MM-DDTHH:MM:SSZ`, `form`, `fits` (each of the three katas and its frozen fit), `factors` (bar start → the factor's decimal string)
and `instants` (each instant of the grid → its weekend multiplier's string), each string of the form of section 6; any other input,
or an instant off the grid, is refused by name. Its keys, in their order, and the type of its horizon are checked before any other
field is read, so an input without its range, or with a horizon that is not a string, is refused by the tool's name too, never by
an exception's. Every fit is checked before the series is read. It prints one JSON line (`horizon`,
`form`, `garch_window` {`W`, `capped`, `seed_weight`}, and `values`: for each instant and kata the value written as JavaScript writes a
double, or `non_evaluable`), a line `value differs …` for each value that the `math.log` pass changes and their count, the line
`identity`, the inputs noted and `VERDICT: GREEN`. It is a reading of the evaluation, never a count, never an
entry of a list; lot c4b replaces its given factors by the profile.

## 8. Tests (each red at the base on its first assertion, the existence of `quarter_2b.py`; its killers declared above it)

| Test | What it holds | Killers |
|---|---|---|
| `garch_window_exact_on_the_frozen_strings` | the ADR's bounds of the cap at 1h and 4h; p = 0.98 at 4h gives 174; p = 0.0003 + 0.0297 gives W = 1 (the binary64 sum, 0.030000000000000002, would give 2); a = 0.1 and b = 0.07320508075688773 give W = 3 by exact products (binary64 products would give 2); the residual seed weight; p ≥ 1 refused by name | the comparison with 3/100 made strict; the powers taken on binary64 products |
| `har_candle_and_rogers_satchell_forms` | on a made series, both forms, each at 1h and at 4h, equal to the test's own computation bit for bit; a candle absent in the window: `non_evaluable`; a form outside `FORMS` refused by name | the day's mean over one bar less; the form chosen by the horizon; 4 candles a bar at 4h |
| `garch_and_ewma_on_deseasonalized_inputs` | the GARCH and EWMA values equal to the test's own computation at 1h and at 4h (an 18-day series, 101 bars of 4h), with a factor that changes with each bar and a seed (0.0001) apart from omega / (1 − a − b) (0.00002); a factor of 0 or an absent factor among the inputs: HAR and GARCH `non_evaluable`, the EWMA a value; under the port of the log moved (as `fdlibm_log_pass_decides` moves it), the values are the port's and each value `math.log` changes is listed and counted | the return deseasonalized by f(t); the seed replaced by omega / (1 − a − b); the window on 1h bars at any horizon; a factor of 0 admitted; the values of the `math.log` pass printed |
| `frozen_fit_strings_refused_by_name` | a sign, an underscore, a non-ASCII digit, an infinite value (`1e400`), a leading zero (`00.3`), a number in place of a string, a key missing; an input under another pin, with a key more, its keys reversed, without its range, of another format, with a horizon in a list, a factor `-1`, an instant 15 minutes off its grid: each refused by name, exit 2, nothing printed before; the well-formed input admitted | the form's check dropped; a leading zero admitted; the pin not compared; the keys compared as sets; the horizon's type not checked; the format not compared; the factors' and instants' strings not checked; the grid not checked |

The verifier job's bound for this file is 300 s; the four tests make 33 light launches (and one more temporary repository, for the
moved port) and take about 10 s (section 13). A new test file would enter `test:main`, which excludes `test/kata-quarter.test.ts` by
name only (`package.json`, outside this lot's zone), and that job has no Python: the tests stay in the file.

## 9. Measures before the push (offline, Node 24.21.0, CPython 3.14.8, Linux)

- **Red at the base**: the four tests with the trunk's `FILES` and `quarter_counts.py` and no `quarter_2b.py`: 4 of 4 red on their
  first assertion (« tools/kata-quarter/quarter_2b.py absent »), the lot's files then restored by sha256.
- **Killers**: each of the four, applied alone with only its test run, turns it red by its assertion (W 2 for 1 at p = 0.03; a HAR value
  off in its last digits; a GARCH value that is no longer the test's; exit 0 for `+0.3`); each file restored by sha256. No survivor.
  The new line of `FILES` moves two names that two earlier killers name (`FILES:3` and `FILES:6` at the trunk): they now name l.4 and
  l.7, and each still turns its test red alone. Anchor check of the tree: every killer line holds its text once on its line.
- **The other subcommands unchanged**: the 38 earlier tests run twice, every launch recorded, once with the trunk's tool files and once
  with this lot's, each from its temporary repository: 217 launches compared in order (the one launch of
  `kata_quarter_files_are_regular_100644` that the second run did not make, its index check failing before the commit, set aside; at
  the commit the test passes), with the identity masked (the line `identity`, the lines `input tool-tree`, the sha256 of the lines
  `evidence` and `report`) and the random part of the temporary folders' names: **211 equal byte for byte**; the 6 others are the
  launches of `check original_values_byte_equal` that read or name the first invocation's report, which carries the identity block
  and the `tool-tree` inputs, one more blob in this lot (`quarter_2b.py`, 103 bytes more): only its sha256 and its size differ. They
  cover `check`, `count` (with and without the core registry), `vectors`, `month`, the oracle acts, the refusals and the usage.
- **The file**: 42 of 42 in 191 s, the four new tests 4.1 s of it (the trunk's 38 took 258 s in an earlier run on the same
  container: the figure moves with the machine's load more than with this lot). Under the case-folding git wrapper, 42 of 42, every `git add`
  clean (20 checks); the 25 paths the new tests write, 0 names equal once case is folded, 0 that Windows refuses.

## 10. Left to lot c4b

The seasonal profile (24 values by US Eastern hour at 1h, 12 by UTC 4h slot and US summer time at 4h), the weekend multiplier, the US
DST table (ADR l.129), the reader of the wave 2b registry (the frozen strings, their form and their pins, read from it), the place of
the 2b rows in the count (their lookback: 673 candles for HAR, W + 1 bars for GARCH, 101 for the EWMA), and the oracle act L-O4.

Carried to the freeze, which lot c4b reads with the fits (the procedures fixed at P0-2): the HAR fit must take RV_day and RV_week as
the means per bar that this evaluation takes (Q2), or b2 and b3 move by the number of bars (24 and 168 at 1h, 6 and 42 at 4h); the
GARCH fit must keep a + b below 1 (Q6) and fit a zero mean (Q10).

## 11. Questions (default in brackets; each default built here, reversible within this lot)

- **Q1** — « 15-minute squared log returns over 672 candles »: 672 returns, each from the close of the candle before, so 673 candles
  read, or 671 returns inside the 672? [672 returns from 673 candles, as « 100 one-bar returns » read 101 bars.]
- **Q2** — RV_day and RV_week: means per bar of the deseasonalized bar values (the units of RV_bar, the HAR form of Corsi), or sums?
  [means.]
- **Q3** — « HAR on RV_bar / f(key of bar)^2 »: each bar deseasonalized by its own key before the day's and the week's means? [yes.]
- **Q4** — the per-bar Rogers-Satchell form: one value per horizon bar from its open, high, low and close? [yes, the bars of
  `kata_lib.build_bars`.]
- **Q5** — the GARCH seed and window: the seed a frozen string of the fit (SELECT-1's unconditional variance, computed at the freeze),
  the first variance of the window, and W returns read from W + 1 bars? [yes.]
- **Q6** — a + b ≥ 1 (no W with p^W ≤ 0.03): refused by name? [refused; the fit procedure keeps a + b below 1.]
- **Q7** — the form of a frozen string: a non-negative JSON number (an exponent admitted, as JavaScript writes a small double)? [yes.]
- **Q8** — the HAR form: named by the caller from the fit record, with no default? [yes; c4b reads it with the fit.]
- **Q9** — `estimate`'s input format `kata-2b-estimate-input-v1` and its subcommand: kept as the reading by hand of the evaluation,
  or removed once c4b reaches it through the count? [kept; c4b decides.]
- **Q10** — the GARCH mean: « plain GARCH(1,1) by QML on the deseasonalized returns » (l.131) does not name it. Zero, the returns
  taken as they are, and a fit with a mean refused by its keys? [zero; c4b and the fit procedure read it.]

## 12. Size

R-25 in the CI form (docs and the two test lists excluded): estimated before the code at ~355 (~460 at +30 %, under 547); measured
at the head of the code by `scripts/oracle/r25.mjs`, 345 changed lines (340 insertions, 5 deletions), under the lot bound of 547;
after the fold of the first review, 400 (395 insertions, 5 deletions).

## 13. The fold of the first review (offline, Node 24.21.0, CPython 3.14.8, Linux)

- **What the tests did not hold**, though the code did: each HAR form at one horizon only, GARCH and EWMA at 1h only, a test seed equal
  to omega / (1 − a − b), W exact only at W = 1, both passes of the log equal on the tests' series, the input guard never reached, a
  factor of 0 or absent never given, the rule against a leading zero. Each is now a case of the four tests (section 8), with its
  mutation line above the test.
- **Code**: four lines of `quarter_2b.py` changed in place, none moved: the input's keys, in their order, and its horizon's type are
  checked first (l.154, then l.157 reads `h`), so an input without its range gave `REFUSED: KeyError: 'range'` and now the tool's
  refusal (section 7); the refusal of a + b ≥ 1 and its docstring (l.38, l.41) name the one reason, no W (section 4).
- **Mutation lines**: 18 above the four tests (14 new), each applied alone with only its test run: 18 red by an assertion, each file
  restored by sha256; the review's 28 candidate mutants of `quarter_2b.py` (13 of them green before): 28 red. The folded tests on the
  code before the fold: red on exactly the two changed refusals. Anchor check of the two touched test files against the trunk and
  against the head before the fold: 238 killer lines, each holding its text once on its line, the same line as at that head.
- **The file**: 42 of 42 in 201 s (bound 300 s), the four tests about 10 s of it; `test/verifier-tool-ci.test.ts` 10 of 10.
  Under the case-folding git wrapper, 42 of 42 in 554 s, every `git add` clean (21 checks); the 3263 names of the temporary folders
  of these runs, 0 equal once case is folded, 0 that Windows refuses.

## 14. Amendment of Q5, 2026-10-16: the GARCH window counts bars

- **The decision**: reading B of the window question raised by the review of the wave 2b format, decided in recherches commit
  `f5f0bf8`. W counts bars, as for every kata: ADR 0005 D4 l.55, « W counts bars, and a window of W bars holds W - 1 one-bar returns »;
  ADR 0006 D4 l.132, « capped at 720 bars at 1h and 180 at 4h », read to the letter, with no addendum. Q5's default (« W returns read
  from W + 1 bars ») is withdrawn; the seed stays a frozen string, the first variance of the window.
- **What changed** (`tools/kata-quarter/quarter_2b.py`, lines changed in place, none moved): `garch()` reads the W bars that end at t
  (`window_at(bars, t, w, h)`) and runs the recursion on their W − 1 one-bar log returns, u from 1 to W − 1, each deseasonalized by the
  factor of its own bar, from s² = seed; nothing else of the recursion changes. W = 1 reads the one bar [t − h, t) and has no return:
  s² = seed, sigma_fit_t = √seed (`NE` when that bar is absent). `window()` prints the residual seed weight p^(W−1), the weight of the
  seed after the W − 1 steps, the exact rational rounded once to binary64 (1 at W = 1, also when p = 0); ADR 0006 D4 l.133 names p^W,
  and the value printed is p^(W−1), said as it is: it differs from p^W by the factor 1/p. The output key stays `seed_weight` (no test and
  no format names another), and the second line of `estimate` now ends « seed_weight is p^(W-1) ». The statements of sections 4 (l.76,
  l.84) and 10 (l.165), and Q5 (l.181), on « the residual seed weight p^W », « the W one-bar log returns of the W + 1 bars » and « W + 1
  bars for GARCH », read p^(W−1) and W − 1 returns of W bars from this date.
- **What did not change**: W itself (the smallest integer from 1 with p^W ≤ 3/100, exact on the frozen strings as rationals, capped at
  `CAP`), the cap flag, the refusal of a + b ≥ 1, the input format, the HAR and the EWMA, the two passes of the log, every name of a test.
  At the cap, the W bars of a first decision are the 30 days of inputs before its block, so no decision is lost to the window.
- **Tests** (`test/kata-quarter.test.ts`, inside the same two tests): the test's own GARCH computation reads W bars and W − 1 returns;
  at the cap (720 at 1h, 180 at 4h, on a series of 31 days) a value from W bars and from W + 1 bars, each the test's own, and
  `non_evaluable` from W − 1; at W = 1 the root of the seed, `non_evaluable` without the bar [t − h, t); the seed weight p^(W−1), exact
  at p = 0.5 (0.03125 at W = 6), 1 at W = 1 and at p = 0. Five mutation lines more (the weight p^W, the weight at W = 1, the window of
  W + 1 bars, a return more, a return less).
- **The fold of its review** (2026-10-17; the test and this note, no line of the tool): the seed weight is compared as a string with the
  test's own exact p^(W−1), integer products rounded once to the nearest binary64, ties to even, on every row of the window test; at 1h,
  a = 0.5 with b = 0.49514 a binary64 power differs from it, and with b = 0.49515 so does p^W over p, each rounded apart. The series of the
  cap case opens three bars of both horizons (T0 + 100 h, 400 h, 700 h) 0.4% above the close before, so a bar's close over its own open
  is not the return between the closes of two bars; every other series is unchanged. Three mutation lines more (the weight as a binary64
  power, the weight rounded twice, a return within a bar).
