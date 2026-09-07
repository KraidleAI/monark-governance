/**
 * UKEMI — Eisenberg & Noe clearing core (ADR-M002 D9; [lu-archive K4]
 * liquidations/lecture/K4-systemique-clearing.md:21-63,160), EXTENDED to the default costs
 * (α, β) of Rogers & Veraart (ADR-M003 D6.3; [lu] `P-K4-1-rogers2013.md`, Eq. (1) p.884 Q1,
 * GA Def. 3.6 Q2, Thm 3.7 "≤ n rounds" Q2). DETERMINISTIC, recomputable by anyone from
 * `(L, e, α, β)` — the same recomputability requirement as Shōgen.
 *
 * Clearing map (P-K4-1 Eq. (1), Q1) on the lattice [0, p̄]:
 *   Φ(p)_i = p̄_i                         if  p̄_i ≤ e_i + Σ_j p_j Π_ji   (solvent: pays the nominal)
 *          = α·e_i + β·(Σ_j p_j Π_ji)     otherwise                      (default: partial recovery)
 *   - `p̄_i = Σ_j L_ij` (total nominal obligations of node i); `Π_ij = L_ij / p̄_i`.
 *   - **α ∈ (0,1]** = fraction recovered of EXTERNAL assets in liquidation; **β ∈ (0,1]** = of
 *     INTERBANK assets (P-K4-1 Q1, Def. 2.5). **α=β=1 ⇒ E&N** (Eq. 6 p.886, Q1):
 *     Φ(p)_i = p̄_i ∧ (e_i + Σ_j p_j Π_ji) — the Phase 1 map, reproduced BIT-FOR-BIT (test 36).
 *   - existence of `L*` (largest) and `L_*` (smallest) for all 0<α,β≤1: Thm 3.1 (P-K4-1 Q2).
 *   - **uniqueness NOT guaranteed once α<1 or β<1**: Ex. 3.3 (P-K4-1 Q2) — `clearing()` reports the
 *     two vectors and `unique=false` outside equality; NEVER claim uniqueness outside α=β=1.
 *   - `L*` via GA (fictitious default ≤ n rounds, Thm 3.7, P-K4-1 Q2).
 *   - `L_*` via iterates of Φ from 0 — recorded CAVEAT: Φ is "continuous from above" always,
 *     "not continuous from below except α=β=1" (P-K4-1 Q2) ⇒ for α,β<1 iterating from 0
 *     yields a low fixed point, with no theoretical guarantee of reaching L_* without restarts.
 *
 * `(α, β)` are EXOGENOUS SCALARS (Def. 2.5): outside α=β=1 (E&N) and outside the negative control
 * Ex. 3.3 (source values), every value used is DECLARED, unfounded — no shipped default
 * fixes one (formed pending item ADR-M003 §4: "(α,β) grounded by an empirical source").
 *
 * UKEMI = MONARK engine building-block, NOT a product (G7 UKEMI §5-6). No guarantee, no `p_correct`,
 * no yield. The DeFi endogenous channel (liquidation price) is NOT MODELED (P-K4-1 Q5, D6.4).
 */

export interface FinancialSystem {
  /** Nominal liabilities matrix: `L[i][j]` = what i owes j. Square, ≥ 0, zero diagonal. */
  readonly L: readonly (readonly number[])[];
  /** External assets (liquidation value) per node, at the clearing date. */
  readonly e: readonly number[];
}

export interface ClearingResult {
  /** Largest clearing vector `L*` (fictitious default / GA). */
  readonly pPlus: number[];
  /** Smallest vector `L_*` (iterates from 0; caveat "not continuous from below" if α,β<1). */
  readonly pMinus: number[];
  /** `‖L*−L_*‖_1 ≤ tol` ⇒ uniqueness (K4:47-48 under regularity e>0; NEVER claimed outside α=β=1). */
  readonly unique: boolean;
  /** Number of fictitious-default rounds (≤ n). */
  readonly rounds: number;
  readonly tol: number;
  /** Default costs used (provenance; 1 = E&N). */
  readonly alpha: number;
  readonly beta: number;
}

function pbarOf(L: FinancialSystem["L"]): number[] {
  return L.map((row) => row.reduce((a, b) => a + b, 0));
}

/** `Π[i][j] = L[i][j] / p̄_i` (0 if p̄_i = 0). */
function piOf(L: FinancialSystem["L"], pbar: readonly number[]): number[][] {
  return L.map((row, i) => {
    const pi = pbar[i] ?? 0;
    return row.map((lij) => (pi > 0 ? lij / pi : 0));
  });
}

/** Interbank assets received by i under payments `p`: `Σ_j Π[j][i] p_j` (R&V branch only). */
function interbankIn(i: number, p: readonly number[], Pi: readonly (readonly number[])[]): number {
  let v = 0;
  for (let j = 0; j < p.length; j++) v += (Pi[j]?.[i] ?? 0) * (p[j] ?? 0);
  return v;
}

/**
 * Value of a node i under payments `p`: `e_i + Σ_j Π[j][i] p_j` (external + interbank received).
 * LEFT fold from `e_i` — accumulation ORDER identical to Phase 1 (E&N byte-exactness, test 36).
 */
function nodeValue(i: number, p: readonly number[], e: readonly number[], Pi: readonly (readonly number[])[]): number {
  let v = e[i] ?? 0;
  for (let j = 0; j < p.length; j++) v += (Pi[j]?.[i] ?? 0) * (p[j] ?? 0);
  return v;
}

/** Gaussian elimination with partial pivoting: solves A x = b (A square). */
function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i] ?? 0]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r;
    const tmp = M[col]!;
    M[col] = M[piv]!;
    M[piv] = tmp;
    const d = M[col]![col]!;
    if (Math.abs(d) < 1e-15) continue; // singular: leaves the row; the component returns 0 (smallest solution). Only happens on a non-regular block D, where p⁺≠p⁻ anyway (uniqueness reported `false`).
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r]![col]! / d;
      for (let c = col; c <= n; c++) M[r]![c]! -= f * M[col]![c]!;
    }
  }
  return M.map((row, i) => (Math.abs(M[i]![i]!) < 1e-15 ? 0 : row[n]! / M[i]![i]!));
}

/**
 * Fictitious default / GA (K4:51-58; P-K4-1 Def. 3.6, Thm 3.7, Q2): `p⁰ = p̄`; each round, the
 * DEFAULTING nodes (value < p̄, insolvency at fundamentals, UNCHANGED by α,β) pay the
 * recovery `x_i = α e_i + β·(Σ_j p_j Π_ji)` — linear system `(I − β Π_DDᵀ) x_D = α e_D +
 * β Π_{Dc D}ᵀ p̄_Dc` on the defaulting block D — the others pay p̄. The default set GROWS
 * by at least one per round ⇒ **≤ n rounds**. Returns `L*`.
 *
 * **α=β=1 (E&N) reproduces Phase 1 BIT-FOR-BIT**: `1·x = x` in IEEE-754 and the RHS accumulation
 * order is unchanged, so `A`, `b` and thus `L*` are bit-for-bit identical to the original
 * implementation (test 36; named mutant "β ignored" ⇒ test 37 red, mutant "interbank removed"
 * ⇒ test 36 red).
 */
export function fictitiousDefault(
  sys: FinancialSystem,
  alpha = 1,
  beta = 1,
): { p: number[]; rounds: number } {
  const n = sys.e.length;
  const pbar = pbarOf(sys.L);
  const Pi = piOf(sys.L, pbar);
  const inDefault = new Array<boolean>(n).fill(false);
  let p = [...pbar];
  let rounds = 0;

  for (let iter = 0; iter <= n; iter++) {
    // Solves the recovery payments of the defaulting nodes (block D).
    const D: number[] = [];
    for (let i = 0; i < n; i++) if (inDefault[i]) D.push(i);
    if (D.length > 0) {
      const A: number[][] = D.map((i, ri) =>
        D.map((j, rj) => (ri === rj ? 1 : 0) - beta * (Pi[j]?.[i] ?? 0)),
      );
      const b: number[] = D.map((i) => {
        let rhs = alpha * (sys.e[i] ?? 0);
        for (let j = 0; j < n; j++) if (!inDefault[j]) rhs += beta * (Pi[j]?.[i] ?? 0) * (pbar[j] ?? 0);
        return rhs;
      });
      const pD = solveLinear(A, b);
      p = [...pbar];
      D.forEach((i, k) => (p[i] = Math.max(0, Math.min(pbar[i] ?? 0, pD[k] ?? 0))));
    }
    // New defaulters: a node not yet in default whose (fundamental) value < p̄.
    let grew = false;
    for (let i = 0; i < n; i++) {
      if (inDefault[i]) continue;
      if (nodeValue(i, p, sys.e, Pi) < (pbar[i] ?? 0) - 1e-12) {
        inDefault[i] = true;
        grew = true;
      }
    }
    if (!grew) break;
    rounds++;
  }
  return { p, rounds };
}

/**
 * Iterates of Φ from 0: `L_*` (smallest fixed point). Monotone increasing Picard.
 * CAVEAT (P-K4-1 Q2): Φ is "not continuous from below" if α,β<1 — iterating from 0
 * converges to a low fixed point, with no guarantee of reaching L_* without restarts; for α=β=1
 * (E&N, Φ continuous) it does reach the smallest.
 */
export function clearingFromBelow(
  sys: FinancialSystem,
  alpha = 1,
  beta = 1,
  tol = 1e-10,
  maxIter = 100000,
): number[] {
  const n = sys.e.length;
  let p = new Array<number>(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    const next = phi(sys, p, alpha, beta);
    let delta = 0;
    for (let i = 0; i < n; i++) delta += Math.abs((next[i] ?? 0) - (p[i] ?? 0));
    p = next;
    if (delta < tol) break;
  }
  return p;
}

/** Full clearing: `L*` (fictitious default / GA), `L_*` (from 0), uniqueness. */
export function clearing(sys: FinancialSystem, alpha = 1, beta = 1, tol = 1e-8): ClearingResult {
  const { p: pPlus, rounds } = fictitiousDefault(sys, alpha, beta);
  const pMinus = clearingFromBelow(sys, alpha, beta);
  let l1 = 0;
  for (let i = 0; i < pPlus.length; i++) l1 += Math.abs((pPlus[i] ?? 0) - (pMinus[i] ?? 0));
  return { pPlus, pMinus, unique: l1 < tol, rounds, tol, alpha, beta };
}

/**
 * Explicit `Φ(p)` (P-K4-1 Eq. (1), Q1). To check `Φ(p*) = p*`.
 * **α=β=1: E&N path preserved bit-for-bit** (`Math.min(p̄_i, value_i)`, literal Phase 1 map).
 */
export function phi(sys: FinancialSystem, p: readonly number[], alpha = 1, beta = 1): number[] {
  const pbar = pbarOf(sys.L);
  const Pi = piOf(sys.L, pbar);
  const enPath = alpha === 1 && beta === 1; // Eisenberg & Noe: reproduces Phase 1 bit-for-bit
  return p.map((_, i) => {
    const pb = pbar[i] ?? 0;
    const value = nodeValue(i, p, sys.e, Pi); // e_i + interbank, Phase 1 accumulation order
    if (enPath) return Math.min(pb, value); // literal E&N map (byte-exact)
    if (value >= pb) return pb; // solvent: pays the nominal
    return alpha * (sys.e[i] ?? 0) + beta * interbankIn(i, p, Pi); // default: α·external + β·interbank
  });
}

export { pbarOf, piOf };
