/**
 * UKEMI — cascade-cluster lattice T (annex): the fixed-point operator of NOTE-treillis
 * (docs/biblio/ukemi-modeL/NOTE-treillis-points-fixes-2026-09-19.md, §0-§4) made executable
 * and falsifiable. ADR-U2 / ADR-M020 D1 (a): an ANNEX limit case, NOT a product and NOT a
 * market fact — D2 forbids asserting "Lambda = 0" as a market claim; here Lambda = 0 is only the
 * lattice's degenerate case (T constant = the static eligible amount, Perez Eq. 3).
 *
 * NOTE Def. 1: N positions on a COMMON collateral. Position i tips (is eligible, Perez Eq. 3)
 * when the collateral price P falls below its critical price pCrit_i = B_i/(C_i*K_i):
 *   S(Q) = { i : P(Q) < pCrit_i }   (STRICT: at P = pCrit_i, HF = 1, i is NOT eligible)
 *   T(Q) = sum_{i in S(Q)} B_i.
 * The endogenous price under a liquidated amount Q is P(Q) = P0*(1 - D)*decay(Lambda, Q):
 *   - "linear"      P(Q) = P0*(1 - D)*(1 - Lambda*Q)         — MONARK's own first-order form (declared).
 *   - "exponential" P(Q) = P0*(1 - D)*exp(-Lambda*Q)         — Cifuentes-Ferrucci-Shin 2005 / Bank of
 *     England WP 264, Eq. 5 p. 15 [lu]: p = exp(-alpha*s), with s = AGGREGATE SALES (asset units).
 *     Here the argument is Q = liquidated debt (base currency): "alpha = Lambda" is a first-order
 *     match at Q = 0 (dP/dQ|0 = -P0*(1-D)*Lambda for both forms) — a MONARK choice, declared in ADR-U2.
 *     CPMM (x*y = k) is a distinct reserve-dependent inverse demand: DERIVED in ADR-U2, NOT
 *     implemented here (formed item, ADR-U2) — only "linear" | "exponential" exist.
 *
 * T is computed from (pCrit_i, B_i) ONLY; it never calls isLiquidable/liquidableAmount (the Lambda = 0
 * cross-check against liquidableAmount would be circular otherwise). Lemma 1: T is non-decreasing on
 * [0, sumB] (P decreasing in Q for Lambda >= 0). Tarski (Theorem 1) => the fixed points form a complete
 * lattice with a smallest Q_* and a greatest Q^*. Theorem 2: staircase Picard from 0 reaches Q_* and
 * from sumB reaches Q^*, both in <= N+1 iterations, NO restart (finite range). UKEMI = MONARK engine
 * building-block, not a product; no guarantee, no score.
 */
import type { Position } from "./liquidable.ts";

/** Inverse-demand family. Only these two forms exist in U-2a (CPMM: ADR-U2 formed item, not here). */
export type DemandKind = "linear" | "exponential";

/** A cascade-cluster position, NOTE Def. 1: critical price and debt. */
export interface LatticePosition {
  /** Critical price pCrit_i = B_i/(C_i*K_i): position i tips when P(Q) < pCrit_i (strict). */
  readonly pCrit: number;
  /** Debt B_i >= 0 liquidated when position i tips. */
  readonly debt: number;
}

/** The lattice state: positions plus the endogenous-price parameters P0, D (drop), Lambda, and form. */
export interface LatticeState {
  readonly positions: readonly LatticePosition[];
  /** Reference price P0. */
  readonly p0: number;
  /** Static shock D in [0,1): P(Q) = P0*(1 - drop)*decay(Lambda, Q). */
  readonly drop: number;
  /** Price-impact Lambda >= 0. */
  readonly lambda: number;
  readonly demand: DemandKind;
}

/** A fixed point and the number of Picard iterations that reached it (Theorem 2: <= N+1). */
export interface FixedPoint {
  readonly value: number;
  readonly iterations: number;
}

/** Out-of-domain (NOTE §3 Fact 1). `name` = "lattice_domain" so callers can match it by name. */
export class LatticeDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "lattice_domain";
  }
}

/** sum of debts B_i (the top of the lattice, [0, sumB]). */
export function totalDebt(positions: readonly LatticePosition[]): number {
  return positions.reduce((acc, p) => acc + p.debt, 0);
}

/**
 * Domain guard (fail-closed). Lambda >= 0 is Lemma 1's hypothesis (T non-decreasing). For the linear
 * form, Lambda*sumB < 1 is the price-positivity domain (NOTE §3 Fact 1: P(sumB) = P0*(1-D)*(1-Lambda*sumB) > 0);
 * the exponential form is positive everywhere so it needs only Lambda >= 0. Out of domain => LatticeDomainError.
 */
export function assertLatticeDomain(state: LatticeState): void {
  if (!(state.lambda >= 0)) {
    throw new LatticeDomainError(`lambda must be >= 0 (Lemma 1); got ${String(state.lambda)}`);
  }
  if (state.demand === "linear") {
    const product = state.lambda * totalDebt(state.positions);
    if (!(product < 1)) {
      throw new LatticeDomainError(`linear demand requires lambda*sumB < 1 (price positivity); got ${String(product)}`);
    }
  }
}

/** Endogenous price P(Q) = P0*(1 - drop)*decay(Lambda, Q). */
export function priceAt(state: LatticeState, Q: number): number {
  const c = state.p0 * (1 - state.drop);
  return state.demand === "linear" ? c * (1 - state.lambda * Q) : c * Math.exp(-state.lambda * Q);
}

/**
 * Cascade operator T(Q) = sum of B_i over { i : P(Q) < pCrit_i } (NOTE §0, STRICT inequality).
 * Computed from (pCrit_i, B_i) only — never calls isLiquidable/liquidableAmount (anti-tautology).
 */
export function applyT(state: LatticeState, Q: number): number {
  assertLatticeDomain(state);
  const price = priceAt(state, Q);
  let total = 0;
  for (const pos of state.positions) {
    if (price < pos.pCrit) total += pos.debt;
  }
  return total;
}

function picard(state: LatticeState, start: number, label: string): FixedPoint {
  const bound = state.positions.length + 1; // Theorem 2: <= N+1 iterations, no restart.
  let Q = start;
  for (let iterations = 1; iterations <= bound; iterations++) {
    const next = applyT(state, Q);
    if (next === Q) return { value: Q, iterations };
    Q = next;
  }
  // A monotone T in-domain always converges within N+1; failing that is a broken invariant, not a value.
  throw new LatticeDomainError(`${label} did not converge within N+1=${String(bound)} iterations (monotonicity broken?)`);
}

/** Staircase Picard from 0 -> smallest fixed point Q_* (Theorem 2; Prop. 2: the mechanical cascade). */
export function smallestFixedPoint(state: LatticeState): FixedPoint {
  assertLatticeDomain(state);
  return picard(state, 0, "smallestFixedPoint");
}

/** Staircase Picard from sumB -> greatest fixed point Q^* (Theorem 2 dual; Prop. 3: the self-fulfilling run). */
export function greatestFixedPoint(state: LatticeState): FixedPoint {
  assertLatticeDomain(state);
  return picard(state, totalDebt(state.positions), "greatestFixedPoint");
}

/**
 * Proposition 4 ("no dormant activation"), a PROVEN sufficient (not necessary) uniqueness condition:
 * for every position j NOT in S(Q_*), pCrit_j <= P_min = P(sumB). TRUE => Q^* = Q_* (uniqueness).
 * "2*Lambda*sumB < 1" (the AFM (iii) analogue) is NOT sufficient (NOTE §3 counterexample C).
 */
export function noDormantActivation(state: LatticeState): boolean {
  assertLatticeDomain(state);
  const qStar = smallestFixedPoint(state).value;
  const priceStar = priceAt(state, qStar);
  const priceMin = priceAt(state, totalDebt(state.positions));
  for (const pos of state.positions) {
    const inStar = priceStar < pos.pCrit; // j in S(Q_*)
    if (!inStar && !(pos.pCrit <= priceMin)) return false;
  }
  return true;
}

/**
 * Bridge from the static `Position` model (collateralQty, collateralPrice, liqThreshold, debt) to a
 * lattice position, with P0 = 1 (multiplier convention): pCrit = debt/(collateralQty*collateralPrice*liqThreshold),
 * so P(Q) = (1 - drop)*decay < pCrit is the Perez Eq. 3 criterion. The denominator uses the SAME operand
 * grouping as `isLiquidable`'s collateralQty*collateralPrice*...*liqThreshold; on the knife-edge fixture the tipping
 * set matches isLiquidable at s=0.125/0.6 (measured) and pCrit are exact doubles (asserted) (ADR-U2, C-4). Does NOT call isLiquidable (anti-tautology, C-6).
 */
export function positionToCritical(pos: Position): LatticePosition {
  return { pCrit: pos.debt / (pos.collateralQty * pos.collateralPrice * pos.liqThreshold), debt: pos.debt };
}
