![MONARK — it abstains so DeFi can act.](out/banner.jpg)

# MONARK: the engine, HIKAE and Genkan

This repository builds the engine that will host a real trading strategy. Two pieces do the work:

- **HIKAE** receives a signal and decides whether it is permitted to act on it: `COMMIT`, `DEFER` or `ABSTAIN`, under a
  controlled coverage. It knows how to stay silent, and it never returns a probability of being right.
- **Genkan** checks each order with a kernel written in Lean 4 before it leaves: a TRANSFER or an APPROVE never passes; an
  EXIT passes on a listed venue; any other order needs a COMMIT from HIKAE, a listed asset and an amount within its cap.
  These rules are theorems of the kernel.

```text
strategy ──signal──▶ HIKAE ──COMMIT / DEFER / ABSTAIN──▶ Genkan ──checked order──▶ venue
```

Nothing in this repository places a real order. Where the project stands: [`ROADMAP.md`](ROADMAP.md). The working rules:
[`CLAUDE.md`](CLAUDE.md).

## HIKAE

HIKAE turns a prediction and its calibration scores into a coverage verdict, then into a decision. Its guarantee is the
one its code declares: marginal coverage 1 − α, in finite sample, under exchangeability within the class; on the online level
of a class, which the caller opts into, a bound on the misses instead, with no assumption on the scores.

```text
calibration scores ──▶ L1: q̂ ──▶ region ──▶ CoverageVerdict ──┐
                                                               ├──▶ L3: gate() ──▶ GateDecision
                                         B_t, B_floor, τ, … ───┘
```

| Layer | Module | Role | Declared by its code |
|---|---|---|---|
| L1 | `src/l1-split.ts` | split conformal, per class | marginal coverage, in finite sample, under exchangeability within the class; no coverage conditional on the input; `under_calib` when the calibration is too small |
| Online level | `src/aci.ts` | the level of a class, replayed from the caller's evidence | over the T outcomes that moved the level, \|k/T − α\| stays below a bound, with no assumption on the scores; the coverage of L1 does not carry over to this region |
| L2 | `src/l2-monitor.ts` | statistics on the labels that have arrived | a monitor: no guarantee claimed |
| L3 | `src/l3-gate.ts` | a closed policy, from verdict to `GateDecision` | the error rate among `commit` decisions is **not** bounded by α |

File-level detail is in [`packages/hikae/README.md`](packages/hikae/README.md). This section gives the method.

### Calibration

Calibration turns past errors into a threshold, and the threshold into a region.

**Scores.** A nonconformity score says how far a realized outcome fell from the prediction made for it. On the interval
path it is the absolute residual `|y − ŷ|` (`conformInterval`). On the set path it is the 0/1 indicator, 0 for the
predicted label and 1 for any other (`indicatorScore`), or the caller's own score for each candidate label.

**Rank.** With `n` scores and a target miscoverage `α`:

```text
p = ⌈(n + 1)(1 − α)⌉        q̂ = the p-th smallest score
```

`p` is computed in exact integers from the exact rational of `String(alpha)` (`splitRankShortest`), so no float rounding
moves it. The `+ 1` is the finite-sample correction. Too few scores give no threshold: `n < nMin` or `p > n` returns
`under_calib` and no `q̂`, never a clamped value. `p > n` happens exactly when `n < 1/α − 1`:

| `n` | `α` | `p` | Result |
|---|---|---|---|
| 99 | 0.1 | 90 | the 90th smallest score |
| 9 | 0.1 | 9 | the largest score |
| 8 | 0.1 | 9 | `under_calib` |
| 19 | 0.05 | 19 | the largest score |
| 18 | 0.05 | 19 | `under_calib` |
| 99 | 0.01 | 99 | the largest score |
| 98 | 0.01 | 99 | `under_calib` |

**Region.**

- Interval: `[lo, hi] = scoreTestBand(ŷ, q̂)`, the extreme doubles `x` with `fl(x − ŷ) ≤ q̂` and `fl(ŷ − x) ≤ q̂`. That is
  `[ŷ − q̂, ŷ + q̂]`, read by the score test itself in floating point. `lo = hi` gives `region_degenerate`.
- Set: `C(x) = { y : s(x, y) ≤ q̂ }` (`conformalSet`). With the indicator score `q̂` is 0 or 1: `q̂ = 0` gives the singleton
  `{ŷ}`, and `q̂ = 1` gives every label, so a class that misses too often gets a set that the threshold `τ` refuses.

**What it means.** For a future point exchangeable with the scores of its class, the region contains the realized outcome
with probability at least 1 − α, over the draw of the scores and of the point together. This is a property of the region,
not of the signal: it holds on average over inputs and not for a given input, and it is never a probability that the signal
is right. Data that are not exchangeable void it; the `calibrate` tool's own label says "non-exchangeable data (e.g.
distribution-shifted or time-ordered) voids it". What holds on the online level is in part 3 of [Adaptation](#adaptation).

**Where the scores come from.** A strategy brings its own: `params.calibration` is
`{ scores, mode: "interval" | "set", candidates?, aci? }`, at most 10000 scores (`CALIBRATE_MAX_N`). The server recomputes `q̂` on
each call and stores nothing. The verdict carries `scores_sha256`, and the `calibrate` tool returns `qhat`, `n`, `alpha`,
`scores_sha256` and `reason` on the same scores, so without `aci` the two tools audit each other. MONARK does not see, store or verify the
caller's data or model, and does not check that the numbers are nonconformity scores of any model. The classes the server
holds a calibration for are in [`apps/harness/README.md`](apps/harness/README.md), and the risk-controlling rule
`riskControlQuantile` of its policy tables in [`packages/hikae/README.md`](packages/hikae/README.md); neither is the caller's
path.

### The decision

`gate()` reads the verdict, the budget `B_t` and the caller's thresholds, and answers with one of three words: `commit`
permits the action, `defer` waits, `abstain` refuses. The policy is closed and runs in this order.

First, on any region:

| Condition | Decision | Reason |
|---|---|---|
| the prediction cannot be evaluated | abstain | `non_evaluable` |
| upstream timeout | abstain | `upstream_timeout` |
| a numeric field is not finite | abstain | `non_evaluable` |
| `nCalib < nMin`, no region, or a verdict reason that carries no region | abstain | the verdict's reason, else `under_calib` |

Then, on a set region:

| Condition | Decision | Reason |
|---|---|---|
| the intent is outside `C` | abstain | `intent_not_in_region` |
| `B_t < B_floor` | abstain | `budget_exhausted` |
| the set holds more than `τ` labels | defer while the clock is open, else abstain | `set_too_large`, `clock_expired` |
| otherwise | commit | `covered` |

Or on an interval region:

| Condition | Decision | Reason |
|---|---|---|
| `lo ≥ hi` | abstain | `region_degenerate` |
| `B_t < B_floor` | abstain | `budget_exhausted` |
| the width is above `tauInterval` | defer while the clock is open, else abstain | `interval_too_wide`, `clock_expired` |
| the intent is outside `[lo, hi]` | abstain | `intent_not_in_region` |
| otherwise | commit | `covered` |

`tauInterval` is declared by the caller. `commit` has no clock condition. Profit and loss do not enter the policy. The gate
only returns a decision: it calls no tool (`GATED_TOOLS` names them, and nothing invokes them).

### Adaptation

When the data move, four mechanisms can react. Three of them act on a served decision.

| Mechanism | What moves | Acts on a served decision |
|---|---|---|
| Recalibration by the caller | `q̂`, so the width of the region | yes, when the caller sends fresh scores |
| Online tracking (`params.suivi`) | the budget `B_t`, downward only | yes, when the caller carries the evidence |
| The online level of a class (`params.calibration.aci`) | the level `A`, so the rank of `q̂` | yes, when the caller carries the evidence |
| Online thresholds (`imocpStep`, M1, the tracker) | a statistic `r_t` | no: `apps/harness/src` calls none of them |

#### 1. Recalibration by the caller

The server keeps nothing, so `q̂` is recomputed on every call from the scores the call carries. A caller that sends its
latest realized scores gets a region whose width follows its recent errors: larger errors give a wider region, hence more
`defer` and `abstain`; smaller errors give a narrower one. This is a mechanism and not a guarantee: the finite-sample
statement above needs exchangeability, and a rolling window of time-ordered scores does not provide it.

#### 2. Online tracking

The budget `B_t` is carried by the caller (`params.remainingBudget`), and depleting it is the caller's job. L2 offers one
way to compute it, `remainingBudget(arrived, α) = α − (1/t°) Σ E` over the `t°` labels that have arrived, α when none has;
`arrivedErrors` keeps the label of window `i` only when `i + delay ≤ t` and `i < t`, so a decision never reads its own
label. The harness does not run these functions.

With `params.suivi`, the caller also carries a cell's evidence (`policy`, `evaluations`, `outcomes`, `open`). The server
replays it from the start on every call (`suiviReplay`) and keeps nothing. The evidence is the caller's word: no signature
is read. The gate then reads:

```text
B_t = min(params.remainingBudget, replayed budget)
```

So the tracking moves a decision toward `abstain` (`budget_exhausted`), and never toward `commit`.

**Labels.** There is one label per reference evaluation on the policy's grid, and none outside the population. `E` is the
miss for a resolved window and 1 for an unresolved one. The first evaluation whose outcome has not arrived stops the entry.

**Betting factors.** On a label `x` in {0, 1} and a target miss rate `a`:

```text
below:  f(x) = 1 + λ(a − x),   λ in (0, 1/(1 − a))     earns when misses are rarer than a
above:  f(x) = 1 + λ(x − a),   λ in (0, 1/a)           earns when misses are more frequent than a
```

The capital of a fixed mixture after `t` labels, `k` of them misses, is `Σ_j w_j f_j(1)^k f_j(0)^(t−k)`. It is computed from
the counts alone, in exact rationals over `bigint`.

**Two tests.**

- K (`bets_k`, side below, every label since the start) licenses the cell once, at the first label with `K·δ_adm ≥ 1`. The
  licensing label does not enter W.
- W (`bets_w`, side above, the labels of the open segment after its opening) closes the segment at the first label with
  `W·δ_exh ≥ 1`. A closure is absorbing for the policy version.

**Detector.** Beside them runs a change detector with weighted restarts, on the bets `bets_sr` at `m` (the policy holds `m`
equal to `a`), in fixed point at 2⁻⁶⁴ rounded down:

```text
S_j ← (S_j + w_t) g_j,   w_t = 1/(t(t + 1)),   g_j = 1 + λ_j(x/m − 1),   λ_j in (0, 1)
```

Its alarm is set at the first rank at which the mixture of the `S_j` reaches `1/α_arl`, and is never cleared. It closes an
open segment (W closes first on a tie), and a segment opened after it closes at its opening. A Shiryaev–Roberts reading
`R_j ← (1 + R_j) g_j` runs beside it and never acts.

**Budget.**

```text
replayed budget = ⌊10⁹ (1 − δ_exh·W)⌋ / 10⁹    in an open segment
replayed budget = −1                           with no licence, or after a closure
```

It is the room left before W reaches its level. Since `B_floor ≥ 0`, a budget of −1 never passes the budget check.

**Bounds.** At most 500 evaluations and 500 outcomes (`SUIVI_MAX_N`), 8 bets a mixture (`SUIVI_MAX_BETS`), 20 characters per
rational text (`SUIVI_MAX_TEXT`), and evaluations × L at most 3600 bits (`SUIVI_MAX_WORK_BITS`), where L is
`suiviDenBits(policy)`.

**What is tested.** `packages/hikae/test/suivi-mc.test.ts` runs K and W by Monte Carlo against the first-crossing
probabilities of an exact dynamic program. The tracking computes a licence and a closure. It is not a coverage statement.

#### 3. The online level of a class: Adaptive Conformal Inference

With `params.calibration.aci`, a call serves the level form of Adaptive Conformal Inference (ACI). Without it, the split path
does not change by a byte. The server replays the caller's evidence on every call (`aciReplay`, `src/aci.ts`) and keeps nothing.

*What ACI does.* Gibbs and Candès move the level. With `err_t = 1` when `Y_t` falls outside the region and 0 otherwise:

```text
α_{t+1} = α_t + γ(α − err_t)        Ĉ_t(α_t) = { y : S_t(X_t, y) ≤ Q̂_t(1 − α_t) }
```

A miss lowers `α_t` by γ(1 − α), which widens the next region; a covered point raises it by γα. For any data sequence, the
long-run miss frequency obeys:

```text
| (1/T) Σ err_t − α | ≤ (max{α₁, 1 − α₁} + γ) / (Tγ)
```

*What the code runs.* The level starts at `α` and moves when an outcome arrives; the region is L1's rank over the last `W`
scores, at the level instead of `α`:

```text
A₁ = α        A ← A + γ(α − err)        no floor, no ceiling
p = ⌈(n + 1)(1 − A)⌉                    n the scores of the window, at most W
```

The level is an exact rational (`aciLevel`: `A = α + γ(Tα − k)`, from the shortest writing of `α` and `γ`) and the rank an exact
integer, so neither drifts. Each state of the replay serves this:

| State | Region | Decision |
|---|---|---|
| the window has no region at `α` yet (`n < nMin`, or `p > n` at `α`) | none | abstain, `under_calib`; the signals of this stretch move nothing, so the first region is exactly L1's |
| `A` below `1/(n + 1)`, so `p > n` | the whole line, so none on the wire | abstain, `under_calib`; the outcome counts as covered |
| `A` at 1 or above, so `p < 1` | the empty region, so none on the wire | abstain, `region_degenerate`; the outcome counts as a miss |
| otherwise | `q̂`, the `p`-th smallest score of the window | L3 reads it as on the split path, interval or set |

The verdict carries `method: "hac-cp"`. Its `n_calib` and `scores_sha256` describe the window, and its `alpha` stays the target.
The closed decision has no field for the level, so the text of `gate` and of `judge` carries it (`aci level= gamma= window= T=
misses= no_region= max_delay= bound= region=`).

*The evidence.* `calibration.scores` then holds every score that has arrived, in arrival order, not a window; `aci.gamma` is the
step, in (0, 1), fixed for the class; `aci.window` is `W`; and `aci.decided_after` says, for each score, how many had arrived
when its signal was decided. An outcome is judged on the threshold its own signal got, however late it arrives. The signals the
gate refused need their outcomes too: the way back runs on them. Evidence that holds only the signals taken can reopen only on the
outcomes of signals taken before the closure and still in flight; once those have arrived, it stays closed.

*The bound, with delays.* Outcomes of open positions arrive late, and the update above assumes they do not. With `T` the
outcomes that moved the level, `k` their misses and `D` the largest delay among them, counted in arrivals:

```text
| k/T − α | < max{α + (D + 1)γ(1 − α), 1 − α + (D + 1)γα} / (γT)
```

This form is derived in the header of `src/aci.ts`, not taken from a paper; at `D = 0` it implies the bound above. It holds for
any sequence of scores, and above 1 it says nothing: at `α = 0.1` and `γ = 0.05` it is 2.0112 at `T = 9`, 0.0604 at `T = 300`,
and 0.0697 at `T = 300` with `D = 20`. It counts every replayed signal decided once a region at `α` existed, taken or not, and
none decided before. It says nothing of one window, nor of the signals taken alone, and the server cannot check that the evidence
holds every outcome. The coverage of L1 does not apply to this region: as the decision's reason, `covered` says only that the
intent lies in the region, within the width and the budget; as the verdict's, only that the level gave a region.

*The step.* A miss costs the level `γ(1 − α)` and a cover gives back `γα`, so one miss takes `(1 − α)/α` covers to recover, at any
`γ`, and the level cannot react before the outcomes arrive. At `α = 0.1`, `γ = 0.05` and `W = 100`, fifteen misses in flight take
the level to −0.575, and the gate abstains until 117 more outcomes have arrived: while the region is the whole line, every outcome
counts as covered, whatever its score, so the region can reopen on a shift that has not ended, and what then stands before a commit
is `tauInterval`, or `tau` in set mode. So the step is chosen with the delay: at `γ/(D + 1)`, `D + 1` misses in flight move the level
by what one moves it with no delay, and the bound is that of `D + 1` separate levels of step `γ` with no delay, each holding
`T/(D + 1)` of the outcomes.

*What has a level.* One level per evidence carried. A class of a strategy has its own; another source of signals, an agent for
one, has its own class and so its own level; an asset has none by itself, and enters through the unit of its score, which the
caller chooses.

*What stays apart.* `params.suivi` can only lower `B_t`, and the server reads its misses as carried. The caller should judge them
on a split region over a window long enough not to follow the drift, not on this region: why, and what was measured, is in
[`apps/harness/README.md`](apps/harness/README.md). `calibrate` does not serve the level, and the step is not aggregated.

#### 4. The online thresholds

*Moving the threshold instead.* The same feedback can act on the threshold directly. Angelopoulos, Barber and Bates study
`q_{t+1} = q_t + η_t(1{Y_t ∉ C_t(X_t)} − α)`. Eq. 10 of Wang, Zecchin and Simeone (IM-OCP) is its mirror form, with
intermittent feedback. HIKAE's code holds this threshold form, which is eq. 10 with the identity mirror map and every label
observed:

```text
imocpStep(r, α, E, η) = r − η(α − E)        a miss raises r by η(1 − α), a covered point lowers it by ηα
```

| Code | Step | Bound its code carries |
|---|---|---|
| `imocpStep`, `src/l2-monitor.ts` | as above | none: "MONITOR, NO GUARANTEE CLAIMED" |
| `m1Step`, `m1Bound`, `src/suivi/m1.ts` | constant `η`, `E = 1{s > r}`, `r` stays in `[−ηα, 1 + η(1 − α)]` | `\|k_T/T − α\| ≤ (1 + η)/(ηT)` |
| `trackerStep`, `src/tracker.ts` | `η` after `t` steps is `c(t + 1 + t₀)^(−1/2−ε)`, no clamp of `q` | `\|(1/T) Σ E_t − α\| ≤ (B + η₁)/(Tη_T)`, Theorem 1 of Angelopoulos, Barber and Bates |

*What is served.* The header of `src/l2-monitor.ts` says it: "The region comes from the split `q̂` (L1) or, when the caller
carries its evidence, from the online level of the class (aci.ts), never from `r_t`". These functions are exported and tested, and
nothing served calls them: `apps/harness/src` does not use them, and `suiviReplay` does not run M1 (its policy carries `eta_m1`,
checked for its form and otherwise unused). The region the gate tests is always read at L1's rank, at `α` or at the level of part
3, from the calibration scores of the call or of a committed class, never from an online threshold. So the bounds of this table
are cited here, not claimed for what is served. A region served from an online threshold, `C_t = { y : s ≤ r_t }`, is a different
claim: it is not implemented and has not been measured.

## Genkan

A kernel written in Lean 4 (toolchain `leanprover/lean4:v4.32.1`) that reads one request on stdin and writes one answer on
stdout. Mode 1 judges an order under a context and answers `allow` or `deny <reason>`. Mode 2 decodes a `GNK1` order. Mode 3
computes a SHA-256. A malformed request or an input over 1 MiB exits with code 3.

**The rules of the judge, in order.** The context carries HIKAE's action, the listed venues, the listed assets and their
caps.

| Order | Answer | When |
|---|---|---|
| 1 | deny `bad-ctx` | the context does not decode |
| 2 | deny `bad-order` | the order does not decode |
| 3 | deny `kind` | the order is not a SWAP, an EXIT or an OPEN: a TRANSFER or an APPROVE is always denied |
| 4 | deny `venue` | the target is not a listed venue |
| 5 | allow | an EXIT on a listed venue, whatever the action, the asset and the amount |
| 6 | deny `not-commit` | the action is not commit |
| 7 | deny `asset` | the asset is not listed |
| 8 | deny `over-cap` | the amount passes the asset's cap (an amount equal to the cap passes) |
| 9 | deny `asset-out` | a SWAP's output asset is not listed |
| 10 | deny `min-out` | a SWAP's `minOut` is 0 |
| 11 | allow | otherwise |

**What is proved.** `Genkan/Theorems.lean` holds 30 theorems, among them:

| Theorem | Statement |
|---|---|
| `judge_transfer`, `judge_approve` | a TRANSFER or an APPROVE is denied, whatever the context |
| `judge_allow_kind` | an allowed order is a SWAP, an EXIT or an OPEN |
| `judge_allow_venue` | an allowed order targets a listed venue |
| `judge_exit` | an EXIT on a listed venue is allowed |
| `judge_allow_commit`, `judge_not_commit` | an allowed order other than an EXIT follows the action commit |
| `judge_allow_one_cap` | an allowed order other than an EXIT stays within its asset's cap |
| `judge_allow_swap_listed` | an allowed SWAP has a listed output asset and `minOut` above 0 |
| `respond_allow_safe` | the kernel's `allow`, whatever the input, in one statement: the input is a mode 1 request that decodes, and the order meets the kind, venue, action, cap and SWAP rules above |

**How it is checked.** CI audits the sources, builds the kernel, replays each module with `leanchecker`, and holds the axiom
record of `main` and of each theorem to `propext`, `Classical.choice` and `Quot.sound`. The judge runs against 82 cases
(`kernel/vectors/judge.json`). As measured on 2026-11-04 (`ROADMAP.md`), of the 55 mutants of `Genkan/Judge.lean`, 49 are killed
by a case, 6 do not compile, and none survives (`apps/genkan/test/mutants.kernel.test.ts`).

**What it does not guarantee.**

- The action is the caller's word: the context carries it as one byte. The harness's `judge` takes it from the decision it
  computes on the same call.
- The lists and the caps are the caller's. The kernel knows no balance, position, price or venue rule.
- An EXIT on a listed venue always passes, so that HIKAE's silence never traps a position. Whoever executes it must make it
  reduce or close a position and nothing else (reduce-only at the venue).
- A cap holds one order, not a total.
- `minOut` above 0 is not a slippage guard.

The formats and the full list are in [`apps/genkan/README.md`](apps/genkan/README.md).

## The harness

`apps/harness` is the served engine: a stateless MCP server with a plain-JSON mirror of the same tools. The caller carries
the budget, the scores, the level's evidence and the tracking evidence. `node apps/harness/src/server.ts` listens on 127.0.0.1:3001.

| Tool | Answer |
|---|---|
| `gate` | HIKAE's `GateDecision` on a signal |
| `calibrate` | the split-conformal quantile of the caller's scores |
| `judge` | the gate's decision, then the kernel's verdict on an order under that decision |

`judge` runs the built kernel through `runKernel` (`apps/harness/src/kernel.ts`): no shell, an empty environment, stdin only,
a 10 s timeout, at most 4 at once. It fails closed: an allow needs exit 0 and exactly the line `allow`. No kernel run
(`unavailable`), a request the kernel refuses (`refused`, exit 3), or any other answer, a run past its timeout included
(`unreadable`), denies the order, an EXIT included. An allowed EXIT is marked `reduce_only`. An EXIT whose envelope the gate
refuses is judged under abstain, with `decision: null` and the refusal in `gate_error`; an envelope the input schema refuses
stays a 400 for every order.

The paper executor `apps/harness/src/paper.ts`, which is not served, fills OPEN and EXIT orders on paper. It gives the kernel
the rest of each asset's total as its cap, and writes a deterministic journal that `replayPaperJournal` checks line by line.

A strategy plugs in from its own process: an adapter there builds the `Prediction`, carries `params.calibration` and, for
tracking, `params.suivi`, and calls `gate` or `judge`. The interface is in [`STRATEGIE.md`](STRATEGIE.md).

## Repository

| Path | Role |
|---|---|
| `packages/hikae` | the conformal gate: L1, L2, L3, the online level and the online tracking |
| `packages/contracts`, `schemas/` | the contracts `AttestedPrice`, `Prediction`, `CoverageVerdict`, `GateDecision`; the JSON schemas are authoritative, and the package is their TypeScript binding |
| `apps/harness` | the served engine |
| `apps/genkan` | the order gate and its Lean 4 kernel |
| `fixtures/`, `tools/kata-recalc/` | the data the engine reads, and the Python checkers of its policy tables |

## Install and test

Node 24 or later.

```bash
npm ci
npm run ci          # vocabulary gate + strict typecheck + tests
npm run lint        # then: npm run lint:ratchet
```

The Lean kernel needs the pinned toolchain under `ELAN_HOME`. `lake.mjs` creates nothing: its temp folder (`GENKAN_TMP`, else
on Windows `F:\tmp\genkan`, else `genkan` under `RUNNER_TEMP` or the system temp folder) must exist before the build.

```bash
node apps/genkan/scripts/audit.mjs --source-only
ELAN_HOME=/path/to/elan node apps/genkan/scripts/lake.mjs build
ELAN_HOME=/path/to/elan npm run test:genkan
```

CI (`.github/workflows/ci.yml`) runs the tests, the lint and the dependency audit, builds and replays the Lean kernel, and runs
the harness's `judge` on it (`apps/harness/test/judge.kernel.test.ts`).

## Sources

Read on arXiv on 2026-11-05. The equations above are quoted from these papers, or from the code's headers where the code cites
them.

- Gibbs, Candès, *Adaptive Conformal Inference Under Distribution Shift*: [arXiv:2106.00170](https://arxiv.org/abs/2106.00170).
- Angelopoulos, Barber, Bates, *Online conformal prediction with decaying step sizes*:
  [arXiv:2402.01139](https://arxiv.org/abs/2402.01139).
- Wang, Zecchin, Simeone, *Mirror Online Conformal Prediction with Intermittent Feedback*:
  [arXiv:2503.10345](https://arxiv.org/abs/2503.10345).
- Barber, Candès, Ramdas, Tibshirani, *Predictive inference with the jackknife+*, the source `src/l1-split.ts` names for the
  `(n + 1)` correction: [arXiv:1905.02928](https://arxiv.org/abs/1905.02928). Its identity was checked on the abstract page; the
  note the code cites was not re-read.

## License

Apache 2.0 ([`LICENSE`](LICENSE)).
