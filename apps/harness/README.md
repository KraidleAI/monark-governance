# @monark/harness

The served engine of MONARK: a **stateless MCP server** with a **plain-JSON mirror** of the same tools. It exposes three
tools:

- `gate`: HIKAE's decision (COMMIT, DEFER or ABSTAIN) on a signal, under a coverage that the caller's calibration controls
  (`@monark/hikae`, closed `GateDecision` of `@monark/contracts`);
- `calibrate`: the split-conformal quantile of the caller's own nonconformity scores;
- `judge`: the gate's decision, then the verdict of Genkan's Lean kernel (`apps/genkan`) on an order under that decision.

It also holds the **paper executor** (`src/paper.ts`), which is not served. The harness keeps nothing between calls: the
caller carries the budget `B_t`, the scores and the tracking evidence, and the server reads no clock of its own (the entry
points inject the current instant). It places no order and never calls the tool a request names. Where the project stands
and what comes next is in the root `ROADMAP.md`; this file describes the code.

HIKAE never returns a probability of being right. Its guarantee is the one the code declares: marginal coverage, in a finite
sample, under exchangeability within the class; on the online level of a class (`params.calibration.aci`, below), a bound on
the misses over the replayed outcomes instead. `npm run gate:vocab` scans `src/` for words that would claim more.

## Run and test

```bash
npm ci                                                       # from the repository root
node apps/harness/src/server.ts                              # listens on 127.0.0.1:3001 (Node 24)
npm run ci                                                   # vocabulary, strict typecheck, tests (no Lean kernel)
npm run lint                                                 # eslint, then npm run lint:ratchet
ELAN_HOME=F:/elan node apps/genkan/scripts/lake.mjs build genkan-kernel   # build the kernel that `judge` runs
ELAN_HOME=F:/elan npm run test:genkan                        # the Genkan tests, and the harness tests that run the built kernel
```

`apps/genkan/scripts/lake.mjs` builds in a temp folder that must exist: `GENKAN_TMP` when it is set; else, on Windows, the folder
`tmp\genkan` of drive F:; else `<RUNNER_TEMP, or the system temp folder>/genkan`.

`node apps/harness/src/server.ts` starts the listener only when the file is run directly; importing a module of `src/` has no
side effect. `startServer(port, host, clock, kernel)` returns the `http.Server`; its defaults are `127.0.0.1`, port `3001`,
`Date.now` and the built kernel (`runKernel`, `src/kernel.ts`). `createHarnessHandler(clock, kernel)` builds the MCP handler
and `handleJsonMirror(request, clock, kernel)` the mirror's; with no kernel runner, `judge` denies every order
`unavailable`.

## The `gate` tool

**Input** is an envelope `{ prediction, params, attested? }`, closed (`additionalProperties: false`) at the boundary:

- `prediction`: the frozen `Prediction` (`schemas/prediction.schema.json`, projected from the file by
  `src/schema-projection.ts`).
- `params`: the gate parameters, declared by the server and never in `schemas/` (next section).
- `attested`: optional, a caller-carried frozen `AttestedPrice`. Its `subject` must be one the served class declares
  (`src/attestation-binding.ts`, exact string membership); the gate runs no verifier on it. No served class has a committed
  attestation subject (the retired `btc-dir-15m` held the only one), so any `attested` is refused: a tool error
  (`attested_inconsistent`; on `btc-dir-15m`, `task_class_retired`). The seam that files `attested.residual` into
  `verdict.residual` therefore never runs on a served path.

**Dispatch** is on `prediction.task_class` (`runGate`, `src/tools/gate.ts`), unless `params.calibration` is present, which
opens the BYO path whatever the class:

| `task_class` | Path | Calibration | Result |
|---|---|---|---|
| `btc-dir-15m` | retired | none served (the synthetic one stays in `src/calibration.ts` for the fixtures and tests) | tool error `task_class_retired`; the name stays reserved against BYO |
| `cascade-liquidable-24h` | `conformInterval` | none | `abstain` / `under_calib`, the expected result |
| `stable-run-velocity-24h` | `splitQuantile`, then the interval of the score test | one **measured** population, keyed on `(task_class, predictor_id)` | the committed key: `alpha = 0.1` and `nMin = 50` are imposed (else `policy_alpha_mismatch` or `policy_nmin_mismatch`) and the decision is real; any other key: `abstain` / `under_calib` with the caller's `alpha` and `nMin` |
| `liquidation-eligible-coverage` | `splitQuantile` over the committed stratum, then the upper bound `[0, yhat + q̂]` (wire kind `interval`) | **measured**, per stratum of `yhat`; the server derives the stratum, and the client `predictor_id` is ignored | `yhat` must be a non-negative safe integer (`liq_yhat_domain`); `alpha = 0.01` and `nMin = 100` are imposed; the committed stratum gives an upper bound; every other stratum, `abstain` / `under_calib` |
| the 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` | policy table of the class (`src/kata-path.ts`) | no row served (`COMMITTED_TABLES` is empty in `src/policy-committed-pins.ts`) | after the request checks below: `abstain` / `under_calib`, or `non_evaluable` for a lean of exactly 0 on a `dir` class |
| any other class **with** `params.calibration` | BYO: `splitQuantile` over the caller's scores, or their online level with `calibration.aci` | the caller's | a real decision on the caller's model |
| any other class without it | none | none | tool error `task_class_unknown` |

A wrong-typed `yhat` is a tool error (`yhat_type_mismatch`); a right-typed but non-finite or non-directional one is a
decision (`abstain` / `non_evaluable`).

**Kata request checks**, in the order of `assertKataRequest`: `produced_at` on the class horizon grid (`produced_at_off_grid`)
and at most 300 s before the server clock (`produced_at_stale`); a numeric `yhat`; a `features_digest`
(`features_digest_required`); a key `kata:<kataId>@<venue>/<SYMBOL>/<h>` that matches the class (`kata_key_invalid`); the `yhat`
domain (a lean in [-1, 1] on `dir`, a finite scale above 0 otherwise: `kata_yhat_domain`); `alpha` equal to the class's
(0.45 on `dir`, 0.01 on the others) and `nMin` equal to its `n_min`, `zeroErrorFloor(alpha, 0.05)` (`src/policy-classes.ts`); `tau <= 1` on `dir` (`policy_tau_cap`). The gate does
not recompute `yhat` and does not check the bars behind `features_digest`.

**BYO** (`params.calibration`): `{ scores: number[], mode: "interval" | "set", candidates?: { label, score }[], aci?: { gamma, window, decided_after } }`.

- `interval` mode needs every score `>= 0` and a numeric `yhat`; the region is `[yhat - q̂, yhat + q̂]`.
- `set` mode needs a non-empty `candidates` list whose labels are unique printable ASCII without `|` (the `label_schema`
  separator, which the server derives from the candidates), a string `yhat` that is a label, and `tau` at most the number of
  candidates minus 1 (`byo_set_tau_cap`).
- At most `CALIBRATE_MAX_N` (10 000) scores and candidates; any breach is `byo_calibration_invalid` or `byo_yhat_type`.
- A `calibration` on a committed class (`btc-dir-15m`, `cascade-liquidable-24h`, `liquidation-eligible-coverage`, the
  committed USDe key) is `byo_overrides_committed`. A name that only imitates a committed one, compared without ASCII case or
  with a blank at an edge, is refused too (`byo_lookalike_committed`, `byo_edge_blank`); a name in the reserved kata pattern
  `^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$` or a key starting `kata:`, `byo_reserved_kata`; and one that
  reduces to a committed or kata name once ASCII confusables are folded, `byo_lookalike_confusable`. Look-alikes outside those
  folds (non-ASCII homoglyphs, for one) pass.
- Without `aci`, the verdict's `scores_sha256`, `alpha` and `qhat` equal those of `calibrate` on the same scores: the two tools
  audit each other.

**Output** is the frozen `GateDecision` (`schemas/gate-decision.schema.json`, the tool's output schema), asserted closed and
free of forbidden keys before it leaves. The prose that states what the calibration is and is not rides in the result's
`content` text, followed by a one-line summary of the decision for clients that read `content` only; the closed decision
carries neither.

### `params`

Caller-carried; the server checks each one and a failure is a tool error `param_invalid`, never a silent gate.

| Field | Meaning | Check |
|---|---|---|
| `remainingBudget` | `B_t`, the remaining authorization capacity; depleting it is the caller's | finite |
| `bFloor` | the `B_floor` threshold | finite, `>= 0` |
| `tau` | set-size threshold of the `set` path (`\|C\| <= tau` commits) | finite, `>= 0` |
| `tauInterval` | width threshold of the `interval` path | finite, `>= 0` |
| `alpha` | target miscoverage | finite, in (0, 1) |
| `nMin` | minimum calibration count | integer, `>= 1` |
| `intent` | the intent tested for containment in the region | string, number or null |
| `tool` | the named gated tool, echoed in `GateDecision.tool` and never invoked | non-empty string |
| `clockOpen` | whether the coverage window is still open (the caller owns the window) | boolean |
| `calibration` | optional BYO calibration, above | closed object |
| `suivi` | optional tracking evidence, below | closed object, bounded |

In `prediction`: `schema_version` must be `1.1.0` (`schema_version_unsupported` otherwise); `produced_at` is a strict RFC 3339
date-time at most 300 s after the server clock (`produced_at_invalid`, `produced_at_future`) and is the instant reused in the
verdict.

The server fixes the rest of `GateInput`: `schemaVersion` (`1.1.0`), `timedOut` (`false`: a pure server invents no upstream
timeout), `evaluable` (derived from `yhat`), `nCalib` (the committed key's or stratum's size, for BYO the scores its verdict
read, 0 otherwise) and `requestSha256` (the canonical sha256 of the envelope as received; one not writable canonically is
`param_invalid`).

## The online level of a class (`params.calibration.aci`)

An opt-in on the BYO path: a call without `aci` stays on the split path, byte for byte. The caller carries the class's
evidence and the server replays it on every call (`aciReplay` of `@monark/hikae`, pure; nothing is stored).

- `calibration.scores` then holds **every arrived score, in arrival order**, not a window (at most `CALIBRATE_MAX_N`);
- `aci.gamma`: the step of the level, in (0, 1), fixed for the class;
- `aci.window`: W, how many of the last scores the region reads;
- `aci.decided_after`: for each score, how many scores had arrived when its signal was decided, an integer of [0, i].

The level starts at `alpha` and moves when an outcome arrives; the outcome counts as a miss when its score exceeds the
threshold its signal got, delay included. What each state of the replay serves:

| The replay | `verdict.method` | Decision |
|---|---|---|
| the window has no region at `alpha` yet | `hac-cp` | `abstain` / `under_calib`; the signals of this stretch move nothing, so the first region is the split one, exactly |
| the level is below 1/(n+1): the whole line, no finite region | `hac-cp` | `abstain` / `under_calib` |
| the level is at 1 or above: the empty region | `hac-cp` | `abstain` / `region_degenerate` |
| otherwise: `qhat` at the rank of the level | `hac-cp` | L3 reads the region as on the split path (interval or set mode) |

As the decision's reason, `covered` says only that the intent lies in the region, within the width and the budget; as the verdict's,
only that the level gave a region. Neither states a coverage.

`verdict.alpha` stays the target, not the level. `verdict.n_calib` and `verdict.scores_sha256` describe the window the
verdict read, and `nMin` reads it too; `requestSha256` binds the whole evidence. The closed decision has no field for the level,
so the `content` text of `gate` and of `judge` carries it after its honesty label (`ACI_LABEL`):
`aci level=<exact decimal> gamma= window= T= misses= no_region= max_delay= bound=<rounded up, or none> region=<warmup|whole|empty|quantile>`.

**What is bounded.** Over the T outcomes that moved the level, |misses/T − `alpha`| stays below
max{α + (D+1)γ(1−α), 1−α + (D+1)γα}/(γT), D the largest delay, with no assumption on the scores (derived in
`packages/hikae/src/aci.ts`). It counts every replayed signal decided once a region at `alpha` existed, taken or not, and none
decided before (`decided_after` 0 is always before); a step that got the whole line counts as covered and one that got the empty
region as a miss. It says nothing of one window or of the signals taken alone. The coverage of the split path under exchangeability
does not apply to this region.

**The step and the delay.** A miss costs the level γ(1−α) and a cover gives back γα, so one miss takes (1−α)/α covers to recover,
at any γ, and the level cannot react before the outcomes arrive. At α = 0.1, γ = 0.05 and W = 100, fifteen misses in flight take the
level to −0.575, and the gate abstains until 117 more outcomes have arrived: while the region is the whole line, every outcome counts
as covered, whatever its score, so the region can reopen on a shift that has not ended, and what then stands before a commit is
`tauInterval`, or `tau` in set mode. So the step is chosen with the delay: at γ/(D+1), D+1 misses in flight move the level by what one
moves it with no delay, and the bound is that of D+1 separate levels of step γ with no delay, each holding T/(D+1) of the outcomes. The
way back runs on the outcomes of the signals the gate refused: evidence that holds only the signals taken can reopen only on the
outcomes of signals taken before the closure and still in flight; once those have arrived, it stays closed.

**Refusals**: outside the schema (an unknown key, a `gamma` outside (0, 1), a `window` below 1, a `decided_after[i]` below 0), at the
input boundary; in the code, `byo_calibration_invalid` with a message that starts `invalid calibration.aci: ` (a count of
`decided_after` other than the number of scores, a `decided_after[i]` above i, a `window` past the safe integers). A direct caller of `runGate` meets the rules on `gamma`, `window` and
`decided_after` there too, in the same code; only the schema refuses an unknown key inside `aci`, and `requestSha256` still binds it. The
other checks of the BYO path come first, with their own codes.

**What it does not do:**

- the server cannot check that the evidence holds every outcome, nor that its order and its counts are the real ones;
- `suivi`, below, stays apart: it can only lower `B_t`, and the server reads `outcomes[].miss` as carried. A caller who feeds it
  should judge those misses on a split region of the class, over a window long enough not to follow the drift, not on this one: on a
  region that moves with its own misses, k − Tα = (α − A_{T+1})/γ, so the excess of misses stays under α/γ + (D+1)(1−α), and the rate
  is pulled back to `alpha` over a T of the order of 1/γ. Whether the alarm fires, and when, depends on γ, the delay and the detector:
  measured on 2026-11-06 on a simulated ×100 shift of the scores (100 seeds, the policy of `test/gate-aci.test.ts`), with no delay the
  static region closed 100 of 100 and the level's region 58 of 100 at γ = 0.002 and 0 of 100 at γ = 0.05; with each outcome 20 arrivals
  late, the level's region closed 100 of 100 and 78 of 100. With no shift, it closed 0 of 30 in each of those runs;
- `calibrate` does not serve the level; the step is fixed, with no aggregation of steps; the level is one per class, and the
  caller chooses what a class is.

**The replay's cost**, measured on 2026-11-06 on the development machine at 10 000 scores, 7 runs each, the slowest run: 8.4 ms at
W = 10 000, 16.4 ms with long decimal scores at W = 5000, 10.9 ms with descending scores at W = 5000, 16.9 ms with γ = 1e-300 and
scores in pseudo-random order at W = 100. `CALIBRATE_MAX_N` is its only bound.

## Online tracking (`params.suivi`)

The caller carries the cell's tracking evidence, and the server replays it from the start on every call (`suiviReplay` of
`@monark/hikae`, pure; nothing is stored):

- `policy`: the closed `hikae-suivi-policy-v1` settings of the cell (22 keys, checked by `assertSuiviPolicy`). Its `task_class`
  must be the request's and its `cell_key` the verdict's `cell_key`. On the BYO path (`params.calibration`) the verdict names
  no cell (`cell_key` null): the cell is the request's class and key, so the policy's `cell_key` is the request's
  `predictor_id`. The verdict is unchanged, and the tracking lowers the caller's budget as on a served cell.
- `evaluations`: the cell's reference evaluations from the start, on the policy's grid (`grid_ms`).
- `outcomes`: their arrived outcomes, `{ seq, resolved, member, miss }`.
- `open`: whether the segment was open (licensed) at the start.

The replay enters the labels in order. For each label it steps K and W (`o4Step`), then the detector (`detStep`), then closes an
open segment on an alarm (W closes first on a tie). The replayed budget is `floor(10^9 (1 - delta_exh * W)) / 10^9` on an open
segment, and `-1` otherwise (no licence yet, or closed: a closed segment stays closed). The gate reads
`B_t = min(params.remainingBudget, replayed budget)`. The tracking only lowers the caller's budget: it moves a decision toward
`abstain` (`budget_exhausted`), never toward `commit`. A call without `suivi` is unchanged. `judge` reads the same `params`, so
it takes `suivi` too.

**The replay's cost.** At t labels a capital of K or W is a fraction of about t·L bits, where L is the bit size of the least
common denominator of its mixture's betting factors (`suiviDenBits` of `@monark/hikae`; L = 7 for the USDe cell). The replay
never reduces these fractions: it compares their integers with the level and takes the budget's floor on them (`capitalCrosses`
and `capitalBudget` of the betting library), so n labels cost about n products of n·L bits per bet, and no gcd. The gate refuses
an evidence whose evaluations times L passes `SUIVI_MAX_WORK_BITS` (3600 bits), before any replay. Measured on 2026-11-04 on the
development machine, with in brackets the time when each label still reduced its fractions: at 500 labels, the USDe cell 0.12 s
(0.55 s; 0.7 s in an earlier run), and 8 bets a mixture at L = 7 with nine-digit weights and detector 0.3 s (0.73 s): the weights
set a constant scale and the detector runs in fixed point, so neither is counted in L. Without the work bound, L = 82 at 200
labels took 0.16 s (8.1 s; 7.7 s in an earlier run), and rationals of nine digits at 500 labels (n·L = 30 000 bits) 0.84 s
(77.5 s; 75 s in an earlier run). A text of thousands of digits would still cost far more: hence also the 20 characters of a
rational text, checked before any parse. Measured the same day at 500 labels, with 8 bets on K, W and the detector and
nine-digit weights: 0.58 s at n·L = 20 000 bits, 0.65 s at 23 500 and 0.81 s at 30 000. The bound is 3600 bits because no
policy served today needs more (the USDe cell takes 3500 bits at 500 labels).

**Bounds** (`SUIVI_MAX_N`, `SUIVI_MAX_BETS`, `SUIVI_MAX_TEXT`, `SUIVI_MAX_WORK_BITS` in `src/tools/gate.ts`): at most 500
evaluations and 500 outcomes; at most 8 bets a mixture; at most 20 characters a rational text; and n·L at most 3600 bits.

**Refusals:**

- outside the schema (an unknown key, a `miss` other than 0 or 1, more than 500 evaluations or outcomes, more than 8 bets a
  mixture, a rational text of more than 20 characters): refused at the input boundary (`input_invalid`, 400 at the mirror);
- a policy of another class or cell, a BYO call (its verdict names no cell), a malformed policy, an evaluation off the grid, an
  outcome of no evaluation, a replay past its work bound: a tool error `param_invalid`, whose message starts with
  `invalid param 'suivi': ` and names the cause. A direct caller of `runGate` meets the same bounds: they are checked again in
  the code.

**What it does not do:**

- the policy's `keyring` is checked for shape, but no signature of an evaluation or an outcome is read;
- no tracking policy is committed server-side: the caller carries it;
- the SR reading (`sr_reading_threshold`) and the M1 module are not served;
- "no licence yet" and "closed" both answer `budget_exhausted`; the frozen `GateDecision` has no reason of its own for either;
- the replay is synchronous: a call at the work bound holds the server for up to about 0.3 s.

## Committed calibrations

All are data in `src/calibration.ts`, each pinned by the sha256 of its scores (`scoresSha256`) and checked when the module
loads: a drift throws at import, so nothing is served from a calibration that changed unnoticed.

- `btc-dir-15m` is **synthetic**: indicator scores derived from the HIKAE S2a draw (`generateLabeledSeries` over
  `S2_DEFAULT.s2a`, seed and size read there). The class is retired; the calibration is kept only for the fixtures and tests.
- `stable-run-velocity-24h` is **measured** for one population, the USDe redemption flow over calm 24 h windows: 613
  nonconformity scores, keyed on `narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3`. The served
  text says that no coverage is measured, since the calibration is non-stationary across half-years and exchangeability is
  not assumed.
- `liquidation-eligible-coverage` is **measured** on one recorded episode (Aave v3 core, WETH collateral): one-sided
  exceedance scores `max(Y - yhat, 0)`, grouped in four strata of `yhat` cut at 2000e8, 100 k$ and 1 M$ in base 8-decimal
  (`src/ukemi-strata.ts`). Only stratum 0 reaches `nMin = 100` and is committed (n = 170; since n < 199 its q̂ is the stratum
  maximum, reported as is). The bound holds only if `yhat` came from the frozen close-factor rule on a mono-collateral WETH
  account at the first crossing, which the gate does not check. A q̂ of 0 abstains rather than serve `[0, yhat]`.

The cascade class has no calibration. The text served with a decision follows the resolved cell: the committed sentence only on
the committed USDe key and stratum 0, the "none committed" one on every other population or stratum.

## The `calibrate` tool

**Input** `{ scores, alpha, nMin }`: the caller's nonconformity scores (each finite, at most `CALIBRATE_MAX_N` = 10 000), the
miscoverage `alpha` in the open interval (0, 1) and the minimum count `nMin` (an integer `>= 1`); anything else is a tool error
(`calibrate_input_invalid`). **Output** `{ qhat, n, alpha, method, scores_sha256, label, reason }`: `qhat` is the split-conformal
quantile, the ceil((n+1)(1-alpha))-th smallest score (`splitQuantileShortest` of `@monark/hikae`); `n < nMin`, or a rank above
`n`, gives `qhat: null` and `reason: "under_calib"`, never a clamped value. `scores_sha256` is `scoresSha256` of the scores in
the order sent, the same digest the gate's BYO verdict carries. The `label`, also the tool description and the `content` text,
states that the coverage holds only for points exchangeable with the scores, and that MONARK neither sees nor checks the
caller's data or model. The server stores nothing and commits no calibration: the caller carries the scores to `gate`
(`params.calibration`).

## The `judge` tool (Genkan's kernel)

`judge` links the gate to Genkan, the order gate (`apps/genkan`). **Input**: the gate's envelope `{ prediction, params, attested? }`,
plus:

- `order`: `{ kind, target, asset, amount, assetOut?, minOut? }`, the fields of a GNK1 order. `kind` is one of `TRANSFER`,
  `APPROVE`, `SWAP`, `EXIT`, `OPEN`; a name is 1 to 128 characters of `0-9`, `a-z`, `:`, `.`, `_`, `/`, `@`, `-`; an integer is a
  decimal string, below 2^128; `assetOut` and `minOut` are a SWAP's, and only a SWAP's.
- `limits`: `{ venues, assets: [{ asset, cap }] }`: at most 255 of each, no name twice.

The tool runs the gate on the envelope (`runGate`: the same rules and the same refusals as `gate`), builds the kernel's context
from **that decision's action** and the caller's limits, and hands the mode 1 request to the kernel runner. It reads the answer
with `readVerdict` (`apps/genkan/src/frame.ts`), fail-closed: an allow only for exit 0 and exactly the line `allow`.

The gate runs first. An envelope it refuses (a `produced_at` in the future, say) is a tool error for every order but an EXIT. An
EXIT is judged even then, under the action `abstain`, since the kernel judges an EXIT whatever the action: `decision` is then
`null` and `gate_error` holds the gate's code and message. An envelope the input schema refuses is a 400 `input_invalid` for
every order, an EXIT included. A field outside the formats of the frames (a decimal above 2^128, a name outside the alphabet) is
a tool error `param_invalid`, and no kernel runs.

**Output** `{ decision, gate_error, kernel_verdict, kernel_reason, reduce_only, kernel_request_sha256 }`:

- `decision`: the gate's `GateDecision`, or `null` with the refusal in `gate_error` (an EXIT only);
- `kernel_verdict`: `allow` or `deny`;
- `kernel_reason`: `null` for an allow; else the kernel's reason (`kind`, `venue`, `not-commit`, `asset`, `over-cap`,
  `asset-out`, `min-out`, `bad-ctx`, `bad-order`), or `refused` (exit 3), `unreadable` (any other answer, a run killed past its
  timeout or its cap included), or `unavailable` (no kernel ran: no runner, or a binary no process can be made of);
- `reduce_only`: true for an allowed EXIT only;
- `kernel_request_sha256`: the sha256 of the request bytes.

The `content` text says whether the kernel judged the order or (`refused`, `unreadable`, `unavailable`) gave no verdict on it.

**Launching the kernel.** `src/kernel.ts` runs the binary that `lake build genkan-kernel` writes in
`apps/genkan/kernel/.lake/build/bin`, with `spawn`, by its path: no shell, no argument, an empty environment, the request on
stdin, stderr not read. The run is asynchronous: the server answers other calls while a kernel runs (about 30 ms measured on
Windows). Past 10 s from its start (`KERNEL_TIMEOUT_MS`), or past 64 bytes of stdout (`KERNEL_STDOUT_MAX`), the run is cut: the
process is killed (SIGKILL if it is still there 1 s later), and the run answers at once with status `null`, read as
`unreadable`. These are the answers of the synchronous runner it replaced (`spawnSync`), but one, stricter: a kernel that exits
0 and leaves its stdout open past the timeout (a descendant holding it) had status 0 then, and has status `null` now.
`kernelRunner(binary, timeoutMs)` makes a runner of any binary, and a binary no process can be made of gives no run (`null`, a
deny `unavailable`). This is the only module of the served code that starts a process.

`limitedKernel(runner, max)` lets at most `max` runs go at once. The served runner is the built kernel under the limit of
`KERNEL_MAX_CONCURRENT` = 4: measured on a Ryzen 9 3900X (24 threads, Windows), a run takes about 30 ms alone and about the same
four at once, 37 ms eight at once. A call past the limit waits its turn in a FIFO, first come first served, and is never
refused; the FIFO has no bound of its own (it holds the calls the server has taken in): no bound for now (the founder's decision of
2026-11-04), to be set at deployment, once the machine and the proxy's limits are known. The timeout counts from the kernel's
start, not from the wait, so a call that waited can take longer than 10 s.

`startServer` hands the tools that runner; `createHarnessHandler` and `handleJsonMirror` hand them the one they are given.

**What an allow does not say.** The kernel knows no balance, position, price or venue rule; a cap holds one order, not a total; a
`minOut` above 0 is not a slippage bound; and an EXIT on a listed venue passes whatever the gate decided, so whoever executes it
must make it reduce-only. The tool places no order.

## The paper executor

`src/paper.ts` runs the chain end to end on paper: a signal goes through `judge` as the HTTP mirror serves it, in process (the
input schema, HIKAE's gate, Genkan's kernel, the output schema), and out as an order filled on paper. It is not served: no tool,
no route, and the server stays stateless. It opens no socket and no file, reads no clock and places no order on any venue.

- **State** (`PaperExecutor`): the size open on each venue and asset; the amount engaged on each asset (the OPEN amounts filled
  since the journal began; an EXIT does not lower it); the order ids already submitted; the last instant.
- **Totals.** The config (`readPaperConfig`) is `{ venues, totals: [{ asset, total }] }`. The executor hands the kernel, as each
  asset's cap, the rest of that asset's total, so the cap holds all the orders of a journal together, the kernel unchanged. The
  totals are the caller's.
- **A step**, in this order: an order id already submitted is refused (`duplicate_id`), then an instant before the last
  (`time_backwards`), then any kind but OPEN and EXIT (`kind_not_paper`), all before the gate. Then `judge` runs; a refusal of
  the engine (its input schema, a tool error of the gate or of the frames) is journaled with its code. An allowed OPEN fills its
  amount; an allowed EXIT, which `judge` marks `reduce_only`, fills at most the size open on its venue and asset; a deny fills
  nothing. Every journaled step takes its id, whatever its outcome.
- **Stops.** An allow that breaks the kernel's rules as the executor reads them (an OPEN without commit or above the rest of its
  total, an EXIT that is not `reduce_only`), or an engine answer that is neither a verdict nor a refusal, stops the executor
  (`PaperHalt`); it journals nothing more. A submission that is not one (`PaperInputError`) is refused and journals nothing.
- **Clock.** Each submission carries its instant (`at_ms`), which is the gate's clock.
- **Journal.** One line per step, written canonically (`canonicalJson`) and chained to the line before it by its sha256; line 1
  is the header (`monark-paper-journal-v1` and the config). `journal()` returns the text, `head()` the sha256 of the last line,
  `state()` the positions and the engaged amounts.
- **Replay.** `replayPaperJournal(text, kernel)` recomputes each step from its submission on the gate and the kernel, and refuses
  the first line whose bytes differ (`PaperReplayError` names the line and the field). It holds each line to the engine and to
  the line before it, not to an end: a journal cut after a line, or rewritten whole and consistently, still replays. Keep the
  head apart to hold a journal to that.

It fills no SWAP, reads no price and places no order on any venue.

## Transport, origin and the JSON mirror

One listener on `127.0.0.1:3001` (`HOST`, `PORT` in `src/server.ts`) serves two surfaces, routed by the request URL's host name:
a host starting `api.` goes to the JSON mirror, any other (`mcp.`, or a direct `127.0.0.1` call) to MCP.

- **MCP**: Streamable HTTP through `createMcpHandler` (`@modelcontextprotocol/server`, v2), a fresh `McpServer` per request, so
  no session and no stored budget. Keep-alive 15 s. The server is named `monark` and advertises `HARNESS_VERSION`
  (`src/version.ts`). A tool error comes back as an MCP error result whose text is the message and whose `_meta` carries the
  stable code under `monarkgate.tech/error_code`.
- **Origin guard**, on both surfaces and before the body is read: a present Origin that is not `monarkgate.tech` or one of its
  sub-domains, or that does not parse, is a `403`; an absent Origin is accepted (non-browser clients send none).
- **Body cap**: a body over 512 KiB (`MAX_REQUEST_BODY_BYTES`) is a `413`, read as a stream and never buffered past the cap.
- **Refusal cap**, on both surfaces: a body that fails the input schema is refused with at most 100 validator errors
  (`MAX_INPUT_ERRORS`, `src/schema-projection.ts`), followed by how many more were omitted. The mirror carries that text as the
  one entry of `issues`, MCP as its error text.
- **Mirror** (`src/http.ts`), derived from the same `HARNESS_TOOLS` registry as the MCP tools, so the two cannot drift:
  - `POST /gate`, `POST /calibrate`, `POST /judge`: a JSON body in, `{ structuredContent, content }` out, the same fields as the
    MCP result. A body that is not JSON is a `400` `json_invalid`; one that fails the input schema, a `400` `input_invalid`; a
    tool refusal, a `400` `tool_error` with its `code`; an output that fails the output schema, a `500` `output_invalid`, never
    served.
  - `GET /openapi.json`: the OpenAPI 3.1 document, derived from the projected schemas (`src/openapi.ts`), never hand-written.
  - `GET /health` (and `/`): liveness and the operation list. A `GET` on an operation is a `405` with `Allow: POST`; an unknown
    path, a `404`.

The repository holds no deployment files: where the listener sits behind a reverse proxy is outside this package.

## Tests

`npm test` (root) runs the harness tests except those whose file name ends `.kernel.test.ts`, which need the Lean toolchain;
`npm run test:genkan` runs those and Genkan's. The kernel tests skip when `ELAN_HOME` is unset and `CI` is not set.

| Area | Files in `test/` |
|---|---|
| `gate`: classes, params, refusals | `gate.test.ts`, `gate-cell.test.ts`, `gate-cm2b.test.ts`, `gate-empty-set.test.ts`, `gate-liq.test.ts`, `gate-produced-at.test.ts`, `gate-request-sha256.test.ts`, `gate-kata-served.test.ts`, `served-replay-cm3.test.ts` |
| BYO guards | `gate-byo-tau-cap.test.ts`, `gate-byo-lookalike.test.ts`, `gate-byo-confusable.test.ts`, `gate-byo-kata-wide.test.ts` |
| tracking | `gate-suivi.test.ts` |
| `calibrate` and the committed calibrations | `calibrate.test.ts`, `calibration-scores-pins.test.ts`, `usde-calibration.test.ts`, `ukemi-strata.test.ts`, `oracle-fixtures.test.ts` |
| policy tables and kata path | `kata-path.test.ts`, `policy-*.test.ts` |
| `judge` and the kernel runner | `judge.test.ts` (a scripted kernel), `kernel-runner.test.ts` (the asynchronous runner and its limit), `judge.kernel.test.ts` (the built kernel, through the served server) |
| paper executor | `paper.test.ts` (a scripted kernel), `paper.kernel.test.ts` (the built kernel, in a temp copy of the kernel tree) |
| surfaces and schemas | `server.test.ts`, `http.test.ts`, `registry.test.ts`, `openapi.test.ts`, `schema.test.ts`, `error-code.test.ts`, `error-code-sites.test.ts` |

`served-replay-cm3.test.ts` pins the served verdicts: a fixed set of `runGate` calls (the USDe committed key and another key, liquidation
strata 0 to 3, BYO `interval` and `set` including negative and infinite scores, the cascade class; budgets, `tau`, `tauInterval`
and the clock varied) is projected to action, reason, allow, region, `qhat`, `n_calib` and `alpha` (a refusal to its code), and the
hash of the projection is compared with a constant. It also checks that a NaN field never COMMITs.

`registry.test.ts` also scans the tools' served text for the vocabulary `gate:vocab` bans, and checks that `src/tools/` does no
I/O.

## Source map

| File | What it holds |
|---|---|
| `src/server.ts` | the listener, host routing, the Origin guard, the body cap |
| `src/http.ts`, `src/openapi.ts` | the JSON mirror and the derived OpenAPI document |
| `src/tools/registry.ts` | the closed tool list (`gate`, `calibrate`, `judge`) and its MCP registration |
| `src/tools/gate.ts`, `calibrate.ts`, `judge.ts` | the three tools: pure, no I/O, no clock |
| `src/kernel.ts` | the kernel runner |
| `src/paper.ts` | the paper executor and its journal |
| `src/schema-projection.ts` | the input and output schemas, projected from `schemas/` and the non-frozen params |
| `src/calibration.ts`, `ukemi-strata.ts`, `class-policy.ts` | the committed calibrations, the strata, the imposed `alpha` and `nMin` |
| `src/kata-path.ts`, `policy-*.ts` | the kata classes, their policy tables and their committed pins |
| `src/attestation-binding.ts` | the subjects each class declares for `attested` |
| `src/version.ts` | `HARNESS_VERSION`, the version the MCP handshake and the OpenAPI document advertise |
| `data/kata/tables/` | the folder of committed kata table files that `src/policy-committed.ts` reads at load, each checked against its pin; the folder is absent today, so no kata row is served |
| `data/kata/registry/wave1.json` | a registry of calibration cells (per class and key), plus its provenance note. `readRegistry` (`src/policy-projection.ts`) reads such bytes for the import guard and the retire lists (`src/policy-guard.ts`, `src/policy-retire.ts`); no served path reads the file, and the tests use a synthetic registry of the same shape (`test/helpers/synthetic-registry.ts`) |
| `data/verifiers.json` | the pinned list of verifiers (`monark-verifiers-v1`: entries `{commit, identity, repository, tree, tree_sha256}` and revocations), checked against `VERIFIERS_SHA256` and read lazily by `pinnedVerifiers()` (`src/policy-verifiers.ts`); no served path reads it |
