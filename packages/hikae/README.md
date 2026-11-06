# @monark/hikae

HIKAE turns a prediction and its calibration scores into a coverage verdict (`CoverageVerdict`), then into a decision
(`GateDecision`): `commit`, `defer` or `abstain`. It never returns a probability of being right. Its guarantee is the one
its code declares: marginal coverage, in finite sample, under exchangeability within the class, and no coverage
conditional on the input. A caller who carries the online level of a class (`src/aci.ts`) gets another statement, and
not that one: a bound on the misses over the replayed outcomes, with no assumption on the scores.

The package is TypeScript, entered through `src/index.ts` (`@monark/hikae`). It takes its types and serializers from the
frozen contracts (`@monark/contracts`) and never redefines them. `src/` reads no clock, no file, no network and no
environment variable: every instant is passed in by the caller.

## The chain

```
calibration scores ──▶ L1: q̂ ──▶ region ──▶ CoverageVerdict ──┐
                                                               ├──▶ L3: gate() ──▶ GateDecision
                                         B_t, B_floor, τ, … ───┘
```

`gate` takes `B_t` as an input (`remainingBudget`): it computes neither q̂ nor `B_t`. L2 computes `B_t` from the arrived
labels; the harness takes it from its caller and, when the caller carries a cell's tracking, keeps the smaller of that
value and the budget that `suiviReplay` returns.

## What each layer declares

| Layer | Module | Declared by its code |
|---|---|---|
| L1 | `src/l1-split.ts` | marginal coverage, in finite sample, under exchangeability within the class; no coverage conditional on the input; fail-closed `under_calib` when the calibration is too small |
| Online level | `src/aci.ts` | over the T outcomes that moved the level, \|k/T − α\| stays below a bound, with no assumption on the scores; it counts every replayed signal, taken or not, and says nothing of one window or of the signals taken alone; the coverage of L1 does not carry over to this region |
| L2 | `src/l2-monitor.ts` | a monitor: no guarantee claimed; `B_t` is a statistic that L3 reads |
| L3 | `src/l3-gate.ts` | the decision follows a closed policy; the error rate among `commit` decisions is **not** bounded by α |

## L1: split conformal (`src/l1-split.ts`, `src/binomial.ts`)

- `splitQuantile(scores, alpha, nMin)`: q̂ is the p-th smallest score, p = ⌈(n+1)(1−α)⌉ computed in floating point.
  `n < nMin` or `p > n` gives `under_calib` and no q̂, never a clamped value.
- `splitRankExact` and `splitQuantileExact`: the same rank in integer arithmetic, α a decimal string of at most four
  decimals, the scores checked against a domain (`finite`, or `band`, which also refuses negative scores).
- `splitRankShortest` and `splitQuantileShortest`: the rank in integer arithmetic from the exact rational of
  `String(alpha)`. This is the quantile of the harness's `gate` and `calibrate` tools. They are made of three parts that
  `src/aci.ts` shares: `shortestRatio` (the exact rational of a number's shortest writing), `splitRankRational` (the rank
  at an exact level, which may lie outside 1 to n) and `scoreAtRank` (the p-th smallest score).
- `indicatorScore`, `indicatorScores` and `conformalSet`: the 0/1 score (0 for the predicted label, 1 for any other) and
  the set C(x) = { y : s(x, y) ≤ q̂ }, in the order of the labels given.
- `riskControlQuantile(scores, alpha, delta, nMin)`: k* is the largest k ≥ 0 with P(Bin(n, α) ≤ k) ≤ δ, decided in exact
  integers; the served value is the score at rank n − k*, and `missBound` is U(n, k*, δ). `riskControlRow` adds the score
  domain, the attempt (1 to 4) with δ halved at each attempt (`spendDelta`), and a silent row, which carries no bound.
- `src/binomial.ts`, the exact arithmetic behind them, in big integers: `parseUnitDecimal`, `parseAlpha` (at most four
  decimals) and `parseTestDelta` (below 0.25) read decimal strings; `binomCdfLeq` decides P(Bin(n, a) ≤ k) ≤ δ;
  `riskControlMaxExceedances` gives k* (−1 when none exists); `zeroErrorFloor` gives n0, the smallest n with
  (1−α)^n ≤ δ; `missUpperBound` gives the one-sided Clopper–Pearson upper bound on a 10⁻⁷ grid, rounded up;
  `ceilDecimal4` rounds a ratio up at four decimals. Every refusal throws a `RangeError`.

## The online level of a class (`src/aci.ts`)

`aciReplay(scores, alpha, nMin, { gamma, window, decided_after })` replays the level from the arrived scores, in arrival
order, and gives the region for the next signal. It keeps nothing. `decided_after[i]` is the number of scores that had
arrived when the signal of score i was decided, an integer of [0, i].

- **The level** starts at α and moves when an outcome arrives: A = A + γ(α − err), with no clamp (the update of Gibbs and
  Candès 2021). Its closed form is `aciLevel(T, k, α, γ)` = α + γ(Tα − k), in exact rationals, so it does not drift.
- **The miss**: err = 1 when the score exceeds the threshold its own signal got, read at `decided_after[i]` arrivals: the
  level and the window of that moment, delay included.
- **The region** is the L1 quantile of the last `window` scores at rank p = ⌈(n+1)(1−A)⌉, in integer arithmetic.

| `region.kind` | When | A signal that gets it |
|---|---|---|
| `warmup` | the window has no L1 region at α (`n < nMin`, or `p > n` at α) | moves nothing: its score only calibrates, so the first region is L1's exactly |
| `whole` | A below 1/(n+1), so `p > n` | gets the whole line, no finite region; err = 0 |
| `empty` | A at 1 or above, so `p < 1` | gets the empty region; err = 1 |
| `quantile` | otherwise | gets `qhat`, the p-th smallest score of the window |

**The bound.** T counts the steps that moved the level, k their misses, D the largest delay among them (`i − decided_after[i]`):
`aciBound(T, D, α, γ)` = max{α + (D+1)γ(1−α), 1−α + (D+1)γα}/(γT), and |k/T − α| stays strictly below it, whatever the
scores. The proof is in the module's header; the form with D is derived there, and at D = 0 it implies the bound of Gibbs
and Candès. Above 1 it says nothing. `aciLevelText` writes a level as its exact decimal, and `aciBoundText` rounds a bound
up at four decimals.

**What it does not say.** The bound counts every replayed signal, taken or not; a step that got the whole line counts as
covered and one that got the empty region as a miss (`noRegion` counts both). It says nothing of one window, nor of the
signals taken alone. Nothing here can check that the evidence holds every outcome. The coverage of L1 under exchangeability
does not carry over to this region.

The replay refuses, with a `RangeError`: an α or a γ outside (0, 1), an `nMin` or a `window` below 1, a count of
`decided_after` other than the number of scores, a `decided_after[i]` outside [0, i], a score that is not finite.
One arrival costs a binary search and a move in the window, and each decision one rank in big integers.

## Regions and verdicts

- `src/region.ts`: `buildIntervalRegion(lo, hi)` is the only constructor of an `interval` region. A non-finite bound gives
  an abstention `under_calib`, `lo > hi` throws, `lo = hi` gives an abstention `region_degenerate`: a valid region has
  `lo < hi`. `scoreTestBand(ŷ, q̂)` takes its edges from the score test, the extreme doubles x with fl(x − ŷ) ≤ q̂ and
  fl(ŷ − x) ≤ q̂ (bisection on the bit patterns). `buildSetRegion(labels, labelSchema)` builds a `set` region;
  `BTC_DIR_LABELS` and `BTC_DIR_LABEL_SCHEMA` (`up|down`) are the labels of the direction class, and
  `NUMERIC_LABEL_SCHEMA` is kept for the readers of contract 1.0.0 records.
- `src/verdict.ts`: `buildVerdict` assembles a `CoverageVerdict`: `n_calib` is the number of scores, `scores_sha256` is
  taken over the scores in the order given, `produced_at` is injected, and the five cell fields are copied from the
  caller. `noRegionVerdict(reason, …)` and `underCalibVerdict` give a verdict with `region` and `qhat` null and
  `abstain` true. `serialize` is the contracts' `serializeVerdict`.
- `src/interval-conformer.ts`: `conformInterval` scores the calibration pairs by their absolute residual |y − ŷ|, takes q̂
  by `splitQuantileShortest`, and the region by `scoreTestBand`; too small a calibration, or a degenerate region, gives a
  verdict without region. The width judgment belongs to L3.
- `src/scaled-band.ts`: `bandEdge(q̂, σ̂)` is h*, the largest double h ≥ 0 with fl(h / σ̂) ≤ q̂; `conformScaledBand`
  runs `riskControlRow` on the `band` domain and serves [0, h*], or `under_calib` (a silent row, q̂ = 0, no finite edge).

## L2: the monitor (`src/l2-monitor.ts`)

- `imocpStep(r, α, E, η)` = r − η(α − E): a miss raises r, a covered point lowers it.
- `arrivedErrors(timeline, t, delay)` keeps the label of window i only when i + delay ≤ t and i < t: a decision never
  reads its own window's label, even at delay 0.
- `remainingBudget(arrived, α)` = α − (1/t°) Σ E over the t° arrived labels, α when none has arrived; `budgetAt`
  composes the two.

`imocpStep` is also the step of the quantile tracker and of M1 below.

## L3: the gate (`src/l3-gate.ts`)

`gate(input: GateInput): GateDecision` applies a closed policy, in this order:

1. a prediction that cannot be evaluated: `abstain` `non_evaluable`; an upstream timeout: `abstain` `upstream_timeout`;
   a non-finite numeric field: `abstain` `non_evaluable`;
2. `nCalib < nMin`, no region, or a verdict reason that carries no region: `abstain` with the verdict's reason
   (`under_calib` otherwise);
3. on a `set` region: the intent outside C, `abstain` `intent_not_in_region`; `B_t < B_floor`, `abstain`
   `budget_exhausted`; |C| > τ, `defer` `set_too_large` while the clock is open, else `abstain` `clock_expired`; otherwise
   `commit` `covered`;
4. on an `interval` region: `lo ≥ hi`, `abstain` `region_degenerate`; then the budget as above; a width above
   `tauInterval`, `defer` `interval_too_wide` while the clock is open, else `abstain` `clock_expired`; the intent outside
   [lo, hi], `abstain` `intent_not_in_region`; otherwise `commit` `covered`.

The gate only returns a decision: it calls no tool. `GATED_TOOLS` names the two tools a decision is about,
`perps_order_preview` and `perps_order_execute`.

## Online tracking (`src/suivi/`, on the betting library `src/pari/`)

- `src/pari/`: exact rationals over `bigint` (`Q`; `q`, `qParse` and `qString`; `add`, `sub`, `mul`, `pow`, `cmp`,
  `floorScaled`); the betting factor `betFactor` on a label x ∈ {0, 1}, 1 + λ(a − x) on the side `below` and
  1 + λ(x − a) on the side `above`; the capital of a fixed mixture of bets from the counts alone (`capitalOfCounts`) and
  its crossing table (`crossingTable`); the Shiryaev–Roberts reading R ← (1 + R)g (`srStep`, `srValue`) and the detector
  with weighted restarts S ← (S + w_t)g, w_t = 1/(t(t+1)) (`weightedStep`, `weightedValue`), both in fixed point at 2⁻⁶⁴
  rounded down; and `crosses(value, δ)`, value·δ ≥ 1 decided on integers.
- `src/suivi/policy.ts`: the closed policy of a cell, `SuiviPolicy` (22 keys, schema `hikae-suivi-policy-v1`, its
  rationals written as texts); `assertSuiviPolicy` refuses any other object; `suiviPolicySha256` is its canonical sha256.
- `src/suivi/label.ts`: one label per reference evaluation (its miss for a resolved window, 1 for an unresolved one, none
  outside the population), entered in the order of the evaluations; the first evaluation whose outcome has not arrived
  stops the entry.
- `src/suivi/o4.ts`: the test K (bets `bets_k`, side `below`, every label since the start) licenses the cell once, at the
  first label with K·δ_adm ≥ 1; the test W (bets `bets_w`, side `above`, the labels since the opening) closes the segment
  at the first label with W·δ_exh ≥ 1, and an alarm closes it too. `budgetNano` is ⌊10⁹(1 − δ_exh·W)⌋ in an open
  segment, −1 elsewhere.
- `src/suivi/detector.ts`: the detector with weighted restarts and the change reading, on the bets `bets_sr`; the alarm is
  set at the first rank at which the detector reaches 1/α_arl and is never cleared; the reading is published and never
  acts.
- `src/suivi/m1.ts`: M1, one step r' = `imocpStep`(r, α, E, η) with E = 1{s > r} (an r outside its band is refused, and
  a step from the band never leaves it), and its bound `m1Bound(T, η)` = (1 + η)/(ηT) on |k_T/T − α|.
- `src/suivi/replay.ts`: `suiviReplay(evidence)` replays a cell's evidence from its start (the policy, the reference
  evaluations, their arrived outcomes, the starting state of the segment): label by label, the step of K and W, the step
  of the detector, then the closure by the alarm. It returns the segment, the labels consumed and `budget`
  (`budgetNano` / 10⁹ in an open segment, −1 without a licence and after a closure). It reads no signature (the policy's
  `keyring` is checked for its form only) and stores nothing. `suiviDenBits(policy)` is L, the bits of the common
  denominator of the betting factors of K and W: replaying n labels costs about n·(n·L)², and the harness bounds n·L
  before it replays.

`src/index.ts` exports `suiviReplay`, `suiviDenBits`, `assertSuiviPolicy`, `suiviPolicySha256` and their types; the rest
of `src/suivi/` and `src/pari/` stays inside the package.

## Diagnostics and digests

- `src/runs.ts`: the exact one-sided Wald–Wolfowitz runs test on a 0/1 sequence in time order (`runsCount`,
  `runsLowerTailLeq`, in big integers) and `balancedExceedance`, the threshold that makes the exceedance sequence as
  balanced as possible. It tests one alternative, positive serial dependence: passing it never establishes
  exchangeability.
- `src/tail.ts`: the tail indicator (`tailRank`, `tailExceedance`) and the exact upper tail of the adjacency statistic,
  from the bits (`adjacencyUpperTail`) or from the counts alone (`adjacencyTailFromCounts`, an unreduced fraction written
  as two decimal strings), with one error class, `TailCountsError`, and its closed list of codes.
- `src/canonical-row.ts`: `canonicalRow`, the one canonical JSON writing of a policy row (keys sorted by their UTF-8
  bytes, every number finite and written as JavaScript writes it), and `orderedCalibDigest`, the sha256 of the scores and
  of an auxiliary sequence, each in time order.
- `src/tracker.ts`: the quantile tracker q ← q + η(1{s > q} − α), with η = c(t + 1 + t₀)^(−1/2−ε) after t steps and no
  clamp of q (`trackerInit`, `trackerStepSize`, `trackerStep`, `clipScore`, `trackerReplay`), and `trackerDigest`, the
  sha256 of its parameters and of the scores in order. Nothing in this repository calls it outside its tests.

## Predictors and the S2 instrument

- `src/predictor.ts`: two internal predictors on 15-minute candles, `internal:momentum-4c` (ŷ = the sign of
  close[t] − close[t − 60]) and `internal:oracle-didactique` (ŷ = y by construction: it makes the `commit` path visible,
  it predicts nothing); `labelOf` is the sign of close − open, a tie being `non_evaluable`; `featureCloseAt` throws on a
  candle closed after t.
- `src/liquidable-24h.ts`: seeded synthetic calibration pairs of the class `ukemi-liquidable-24h` (n = 300, α = 0.01,
  nMin = 99) and the provenance line that names them synthetic.
- `src/s2/`: the S2 instrument, on seeded synthetic data only: the generators (`mulberry32`, `generateLabeledSeries`,
  `generateCandleSeries`), the split campaign (`runSplitCampaign`), the nine demonstration decisions of the real `gate`
  (`demoStates`: 3 `commit`, 2 `defer`, 4 `abstain`, one of them `under_calib`), the seeded mutants (`runMutants`), and
  `runS2`, which renders the report (`renderS2Report`). `node packages/hikae/scripts/s2-report.mjs` writes
  [`docs/S2-RAPPORT-fixtures-synth.md`](docs/S2-RAPPORT-fixtures-synth.md) and
  [`docs/S2-journal-fixtures-synth.tsv`](docs/S2-journal-fixtures-synth.tsv). On the instrument's random walk,
  `internal:momentum-4c` gets q̂ = 1 and abstains on every hold-out point; the didactic oracle commits on every one.

## What the harness imports

| Harness module | From `@monark/hikae` |
|---|---|
| `tools/gate.ts` | `splitQuantileShortest`, `conformalSet`, `buildSetRegion`, `scoreTestBand`, `buildVerdict`, `underCalibVerdict`, `noRegionVerdict`, `conformInterval`, `gate`, `suiviReplay`, `suiviDenBits`, `aciReplay`, `aciLevelText`, `aciBoundText` |
| `tools/calibrate.ts` | `splitQuantileShortest` |
| `calibration.ts` | `S2_DEFAULT`, `generateLabeledSeries`, `indicatorScore`, `HARNESS_VERSION` |
| `ukemi-strata.ts` | `buildIntervalRegion` |
| `kata-path.ts` | `bandEdge` |
| `policy-guard.ts` | `bandEdge`, `binomCdfLeq`, `ceilDecimal4`, `missUpperBound`, `parseAlpha`, `parseTestDelta`, `riskControlMaxExceedances`, `spendDelta`, `splitRankExact`, `zeroErrorFloor` |
| `policy-marginal.ts` | `ceilDecimal4`, `splitQuantileExact`, `splitRankExact` |
| `policy-projection.ts` | `ceilDecimal4`, `zeroErrorFloor` |
| `policy-classes.ts` | `zeroErrorFloor` |
| `policy-wave2.ts` | `adjacencyTailFromCounts`, `tailRank`, `TailCountsError` |

## Sources named in the code

The module headers name the literature their code follows; this README does not restate their results.

- `src/l1-split.ts`: the (n+1) correction of the split quantile, from Barber, Candès, Ramdas and Tibshirani, *Predictive
  inference with the jackknife+* (Annals of Statistics, 2021), and the marginal validity of split conformal, Barber et
  al. 2020, Thm 2.1.
- `src/aci.ts`: the update and the bound of Gibbs and Candès 2021 (arXiv:2106.00170); delays of a fixed length are treated by
  Hallberg Szabadváry 2024 (PMLR v230) and El Halabi and Brandt 2026 (arXiv:2609.07251); the bound with a delay of any length
  read from the evidence is derived in the module's header, not taken from these papers.
- `src/l2-monitor.ts`: the step of Wang, Zecchin and Simeone, IEEE Signal Processing Letters 32 (2025), eq. 10.
- `src/tracker.ts`: rule (4) and Theorem 1 of Angelopoulos, Barber and Bates 2024 (arXiv:2402.01139).
- `test/oracle-l1-split.test.ts` and `test/oracle-l3-interval.test.ts`: Angelopoulos, Barber and Bates, *Theoretical
  Foundations of Conformal Prediction* (arXiv:2411.11824); Lei, G'Sell, Rinaldo, Tibshirani and Wasserman 2018, Thm 2.2;
  Papadopoulos et al. 2002.
- `test/binomial.test.ts`: the definition of Clopper and Pearson 1934; `test/runs.test.ts`: Swed and Eisenhart 1943,
  Table I.

## Tests

`npm run ci` at the root runs the vocabulary gate, the strict typecheck and `packages/hikae/test/*.test.ts` with the
other tests. The oracle tests (`oracle-*`, `binomial`, `risk-control-quantile`, `runs`, `cm3a-engine`, `cm3b-engine`,
`pari`, `suivi-*`, `aci`) compute their expected values in the test file (closed forms in big integers, enumerations,
textbook formulas), never from the code under test.

- L1 and the exact arithmetic: `l1`, `oracle-l1-split`, `binomial`, `risk-control-quantile`, `cm3a-engine`.
- The online level: `aci` (values by hand, the definition written again the long way in exact rationals, the bound on
  every sequence tried, delays included).
- L2, L3, regions and the interval path: `l2`, `l3`, `oracle-l3-interval`, `interval-conformer`, `interval-gate`,
  `interval-nondegenerate`, `region-predictor`.
- The scaled band, the canonical row and the ordered digest: `cm3b-engine`.
- Diagnostics: `runs` (against every 0/1 sequence up to length 16), `tracker`.
- Online tracking: `pari`, `suivi-o4`, `suivi-detector`, `suivi-library` (the modules composed on the 613 calibration
  scores of the USDe cell, and M1), `suivi-mc` (Monte-Carlo runs of K and W), `suivi-replay`.
- Contracts: `contracts-integration` (no `p_correct` field, `scores_sha256` over the order given, the cell fields of
  `conformInterval`, verdicts without region, the S2 report labelling the coverage among `commit` decisions as not the
  conformal guarantee, and the vocabulary gate refusing a percent-correct claim).
- The S2 instrument: `s2`. The nine demonstration decisions keep their distribution and the sha256 pinned in
  `test/fixtures.manifest.json`; the committed report is regenerated byte for byte, and the committed journal has the
  sha256 of the regenerated one, which the report cites.

`test/served-scores.ts` holds served calibration arrays re-typed for the `runs` and `risk-control-quantile` tests, each
checked against its pinned digest.
