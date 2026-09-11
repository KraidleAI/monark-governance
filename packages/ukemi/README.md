# @monark/ukemi — liquidation-cascade engine building-block (Phase 1)

UKEMI (受け身, "knowing how to fall") is a **MONARK engine building-block, not a product** (a maintainer
decision (c); G7 UKEMI §5-6; ADR-M002 D9). It produces, in a **deterministic and
recomputable-by-anyone** way, a liquidable amount under shock, emitted as a numeric `Prediction`
that HIKAE will conformalize in Phase 2. **No guarantee, no yield, no `p_correct`.**
Our own code.

## The two building-blocks

| Building-block | Role | Guarantee **honestly declared** |
|---|---|---|
| **Clearing** `clearing` | fixed point `p* = Φ(p*)`, `Φ(p) = (Πᵀp + e) ∧ p̄` (Eisenberg & Noe 2001, [lu] `eisenberg2001.txt`; [lu-archive] K4); `p⁺` via fictitious default ≤ n rounds, `p⁻` via iterates from 0; uniqueness reported by `‖p⁺−p⁻‖₁ < tol` | existence (Thm 1, Tarski); uniqueness **if** regular, `e>0` sufficient (Thm 2) — **tested by a negative control** (App. 2: `e=0` ⇒ not unique). `unique` is evaluated at `tol=1e-8` while Picard stops at `1e-10`: declared, not a theorem — on the regular fixtures `p⁺=p⁻` exactly. |
| **Target A** `liquidableAmount` | "liquidable amount under a shock of `x %`" via Eq. 3 of *Knife-edge* (arXiv 2009.13235v6 p.7): tips if `qty·price·(1−shock)·K < debt` | **24 h horizon = a product decision (d)**. The shock is a **declared parameter, NOT a 24 h dynamics model** (dynamics NOT FOUND in the corpus). The "99 %" is not produced here — HIKAE Phase 2 coverage target. **Consequence (i) of D9**: UKEMI and HIKAE **no longer share the window** — target A becomes, at Phase 2 integration, a **2nd HIKAE task class** at a 24 h horizon and `alpha = 0.01` (aiming for 99 %), **distinct from `btc-dir-15m`**. **Target/horizon = "declared, unfounded"** (caveat C13d): no buyer has yet named a coverage requirement (G7 UKEMI, NOT FOUND); the 99 % level is a HIKAE Phase 2 target, not a UKEMI Phase 1 output. |

## Source ↔ implementation discrepancy, recorded (test 21 `nonexpansive_in_e`)

Eisenberg & Noe's Lemma 5 (p.244-245) states that `e ↦ p*(e)` is "concave, increasing, and
**nonexpansive**" (norm 1). Our implementation:

- **confirms** the nonexpansiveness of the **operator** `Φ` in `p`, at fixed `e` (Thm 1: "column sums
  of Πᵀ all equal 1 ⇒ ‖Πᵀ‖ = 1");
- **confirms** that `e ↦ p*` is **increasing and concave** (partial confirmation of the source);
- **refutes by computation**, on two **regular** systems, `e ≫ 0` (in the stated domain), the
  nonexpansiveness of `e ↦ p*`: chain 1→2→3 ⇒ `‖Δp*‖₁ = 2‖Δe‖₁` **exactly**; fan-in of 3
  leaves on a hub ⇒ `‖Δp*‖∞ = 3‖Δe‖∞` **exactly**. Neither L1 nor L∞.

Mechanism (independent of OCR): on the default set `D`, `Δp*_D = (I − Πᵀ_DD)⁻¹ Δe_D` —
the system that `fictitiousDefault` solves — and this inverse has an operator norm > 1 as soon as one
default induces another. The induction step of the proof (`fₙ(e)=F(fₙ₋₁(e),e)`, `F`
jointly 1-Lipschitz) does not yield the constant 1 under the sum norm: it gives
`‖fₙ(e)−fₙ(e′)‖₁ ≤ n‖e−e′‖₁`.

**What we do not write**: "Lemma 5 false". The two-column extraction is illegible on the formula;
the exact statement (norm, domain) on the **rendered page** is a **formed reading question**
(Sonnet reader, doc 03 §6 — rendered-page exception), pending ADR-M002 §4 in an orchestrator pass,
along with the correction of the D9/D11 wording that cited the L1 inference as the test's target.
The `error_origin` is assigned to G7, not here.

**Why this is a strength, not a flaw**: the amplification of a local shock by the payment
network is a **known phenomenon, cited in the corpus** ([lu-archive] Detering, Meyer-Brandis,
Panagiotou, Ritter, *An integrated model for fire sales and default contagion*, Math. Fin. Econ.
2020, `detering2020.txt` l.53, 108, 951, 958). Measuring this amplification is exactly what
UKEMI exists for.

## Phase 2 — Rogers & Veraart default costs `(α, β)` (ADR-M003 D6.3)

Source [lu]: `P-K4-1-rogers2013.md` (Rogers & Veraart, *Failure and Rescue in an Interbank Network*,
Management Science 2013) — Eq. (1) p.884 (Q1), GA (Def. 3.6) / Thm 3.7 "≤ n rounds" (Q2), Ex. 3.3
(Q2). **We cite the reading, never the paper from memory.**

`fictitiousDefault(sys, α, β)` and `clearing(sys, α, β)` generalize E&N with **default costs**:
a defaulting node no longer distributes all its value but a recovery `α·e_i + β·(interbank
received)`, where **α ∈ (0,1]** = fraction recovered of external assets, **β ∈ (0,1]** = of
interbank assets in liquidation (P-K4-1 Q1, Def. 2.5).

- **`α = β = 1` ⇒ E&N unchanged, BIT-FOR-BIT**: `1·x = x` in IEEE-754 and the accumulation order is
  preserved ⇒ all Phase 1 fixtures/tests are reproduced without a one-bit drift (test 36,
  `clearing_alpha_beta_regression_en`, compared against the **current expected values**, not against a
  re-run).
- **Uniqueness LOST once `α < 1` or `β < 1`** (Ex. 3.3, P-K4-1 Q2): `clearing` reports the **largest**
  `L*` (GA) **and** the **smallest** `L_*` (iterates from 0), with `unique = (‖L*−L_*‖₁ ≤ tol)`.
  We **never** claim uniqueness outside `α = β = 1`. **Recorded caveat**: Φ is "continuous from
  above" always, "not from below" if `α,β < 1` (P-K4-1 Q2) — iterating from 0 yields a low fixed
  point with no theoretical guarantee of reaching `L_*` without restarts.
- **Negative control = Ex. 3.3** (test 37, `clearing_rv_ex33_two_vectors`): 2 banks, `e=(1,1)`,
  `α=β=½`, `L̄=(2.2,2.2)` ⇒ two clearing vectors, **`L*=(2.2,2.2)` and `L_*=(1,1)`**,
  `unique=false`; with `α=β=1`, **unique clearing = (2.2,2.2)**. NB: the value "(2,2.2)"
  cited by the source (Q2) and the ADR is a **typo** for (2.2,2.2) — demonstrated in the test
  (`(2,2.2)` is a fixed point under **no** α) and recorded as a formed consultation
  an internal record.
- **`(α, β)` are exogenous** (Def. 2.5): outside `α=β=1` (E&N) and outside the Ex. 3.3 values, every
  value used is **declared, UNFOUNDED** — formed pending (ADR-M003 §4: "(α,β) grounded by an
  empirical source"). No shipped default fixes one.

**`interval` conformer + class `ukemi-liquidable-24h` (HIKAE side)**: UKEMI's numeric `Prediction`
is conformalized by HIKAE (`@monark/hikae` `conformInterval`) into a region `[ŷ−q̂, ŷ+q̂]`,
`q̂ = ⌈(n+1)(1−α)⌉`-th residual `|y−ŷ|` (α=0.01). The calibration class `ukemi-liquidable-24h`
is **synthetic, seeded, declared** (`harness_version = fixtures-synth`): **no source of realized
24 h liquidated-debt labels** exists (ADR-M003 pre-verif 3) — coverage holds only on
these pairs; "real data" is not claimed (pending §4). The gate-width threshold
`τ_interval` is likewise **declared, unfounded** (D6.1).

## No trading, no guarantee (ADR-M002 D0)

UKEMI does not trade, does not recommend, calls no order. Trading is a **future product,
KAIZEN**. The DeFi endogenous channel (fire sales) is **out of Phase 1 scope** (NOT FOUND).

## Tests

`npm run ci` (root): vocab gate + `tsc --strict` + `node:test`. The 6 named tests of ADR-M002 D11
(18-23): `clearing_fixed_point`, `fictitious_default_le_n_rounds`,
`uniqueness_when_e_positive` (+ negative control App. 2), `nonexpansive_in_e` (above),
`liquidable_amount_eq3`, `prediction_numeric_emitted`. Phase 2 (ADR-M003 D11) adds tests
**36** `clearing_alpha_beta_regression_en` (E&N byte-exact) and **37** `clearing_rv_ex33_two_vectors`
(Ex. 3.3, uniqueness lost); the `interval` conformer and gate tests **34**/**35** live on the
`@monark/hikae` side. Fixtures = **pure JSON** in `test/fixtures/`, each note gives the
recomputable-by-hand oracle. Frozen `Prediction` contract consumed via `@monark/contracts` — never
reimplemented (`contracts_frozen`).
