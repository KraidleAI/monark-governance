/**
 * UKEMI — noyau de clearing Eisenberg & Noe (ADR-M002 D9 ; [lu-archive K4]
 * liquidations/lecture/K4-systemique-clearing.md:21-63,160). DÉTERMINISTE, recalculable
 * par quiconque depuis `(L, e)` — même exigence de recalculabilité que Shōgen.
 *
 * `p* = point fixe de Φ(p) = (Πᵀ p + e) ∧ p̄` sur le treillis [0, p̄] (K4:160).
 *   - `p̄_i = Σ_j L_ij` (obligations nominales totales du nœud i).
 *   - `Π_ij = L_ij / p̄_i` (proportions ; ligne i somme à 1 si p̄_i>0, sinon 0).
 *   - existence : Thm 1 (Tarski) — inconditionnelle (K4:39-40).
 *   - unicité : Thm 2, suffisant `e>0` partout (K4:47-48).
 *   - `p⁺` (plus grand point fixe) par **fictitious default ≤ n tours** (K4:51-58).
 *   - `p⁻` (plus petit) par itérés de Φ depuis 0 (K4:58).
 *
 * UKEMI Phase 1 = brique-moteur MONARK, PAS un produit (G7 UKEMI §5-6). Aucune garantie,
 * aucun `p_correct`, aucun rendement. Le canal endogène DeFi est NON TROUVÉ (hors périmètre).
 */

export interface FinancialSystem {
  /** Matrice des passifs nominaux : `L[i][j]` = ce que i doit à j. Carrée, ≥ 0, diagonale nulle. */
  readonly L: readonly (readonly number[])[];
  /** Actifs externes (valeur de liquidation) par nœud, à la date de compensation. */
  readonly e: readonly number[];
}

export interface ClearingResult {
  /** Plus grand vecteur de compensation `p⁺` (fictitious default). */
  readonly pPlus: number[];
  /** Plus petit vecteur `p⁻` (itérés depuis 0). */
  readonly pMinus: number[];
  /** `‖p⁺ − p⁻‖_1 < tol` ⇒ unicité (K4:47-48 : garantie sous régularité, e>0 suffisant). */
  readonly unique: boolean;
  /** Nombre de tours du fictitious default (≤ n). */
  readonly rounds: number;
  readonly tol: number;
}

function pbarOf(L: FinancialSystem["L"]): number[] {
  return L.map((row) => row.reduce((a, b) => a + b, 0));
}

/** `Π[i][j] = L[i][j] / p̄_i` (0 si p̄_i = 0). */
function piOf(L: FinancialSystem["L"], pbar: readonly number[]): number[][] {
  return L.map((row, i) => {
    const pi = pbar[i] ?? 0;
    return row.map((lij) => (pi > 0 ? lij / pi : 0));
  });
}

/** Valeur d'un nœud i sous des paiements `p` : `e_i + Σ_j Π[j][i] p_j` (entrées reçues). */
function nodeValue(i: number, p: readonly number[], e: readonly number[], Pi: readonly (readonly number[])[]): number {
  let v = e[i] ?? 0;
  for (let j = 0; j < p.length; j++) v += (Pi[j]?.[i] ?? 0) * (p[j] ?? 0);
  return v;
}

/** Élimination de Gauss avec pivot partiel : résout A x = b (A carrée). */
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
    if (Math.abs(d) < 1e-15) continue; // singulier : laisse la ligne ; la composante renvoie 0 (plus petite solution). N'arrive que sur un bloc D non régulier, où p⁺≠p⁻ de toute façon (unicité rapportée `false`).
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r]![col]! / d;
      for (let c = col; c <= n; c++) M[r]![c]! -= f * M[col]![c]!;
    }
  }
  return M.map((row, i) => (Math.abs(M[i]![i]!) < 1e-15 ? 0 : row[n]! / M[i]![i]!));
}

/**
 * Fictitious default (K4:51-58) : `p⁰ = p̄` ; à chaque tour, les nœuds défaillants (valeur <
 * p̄) paient exactement ce qu'ils reçoivent (système linéaire sur le bloc défaillant), les
 * autres paient p̄ ; on ajoute les nouveaux défaillants. L'ensemble de défaut CROÎT d'au moins
 * un à chaque tour ⇒ **≤ n tours**. Renvoie `p⁺`.
 */
export function fictitiousDefault(sys: FinancialSystem): { p: number[]; rounds: number } {
  const n = sys.e.length;
  const pbar = pbarOf(sys.L);
  const Pi = piOf(sys.L, pbar);
  const inDefault = new Array<boolean>(n).fill(false);
  let p = [...pbar];
  let rounds = 0;

  for (let iter = 0; iter <= n; iter++) {
    // Résout les paiements des nœuds défaillants : (I − Π_DDᵀ) p_D = e_D + Π_{Dc D}ᵀ p̄_Dc.
    const D: number[] = [];
    for (let i = 0; i < n; i++) if (inDefault[i]) D.push(i);
    if (D.length > 0) {
      const A: number[][] = D.map((i, ri) =>
        D.map((j, rj) => (ri === rj ? 1 : 0) - (Pi[j]?.[i] ?? 0)),
      );
      const b: number[] = D.map((i) => {
        let rhs = sys.e[i] ?? 0;
        for (let j = 0; j < n; j++) if (!inDefault[j]) rhs += (Pi[j]?.[i] ?? 0) * (pbar[j] ?? 0);
        return rhs;
      });
      const pD = solveLinear(A, b);
      p = [...pbar];
      D.forEach((i, k) => (p[i] = Math.max(0, Math.min(pbar[i] ?? 0, pD[k] ?? 0))));
    }
    // Nouveaux défaillants : nœud non encore en défaut dont la valeur < p̄.
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

/** Itérés de Φ depuis 0 : `p⁻` (plus petit point fixe). Picard monotone croissant. */
export function clearingFromBelow(sys: FinancialSystem, tol = 1e-10, maxIter = 100000): number[] {
  const pbar = pbarOf(sys.L);
  const Pi = piOf(sys.L, pbar);
  const n = sys.e.length;
  let p = new Array<number>(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    const next = p.map((_, i) => Math.min(pbar[i] ?? 0, nodeValue(i, p, sys.e, Pi)));
    let delta = 0;
    for (let i = 0; i < n; i++) delta += Math.abs((next[i] ?? 0) - (p[i] ?? 0));
    p = next;
    if (delta < tol) break;
  }
  return p;
}

/** Compensation complète : `p⁺` (fictitious default), `p⁻` (depuis 0), unicité. */
export function clearing(sys: FinancialSystem, tol = 1e-8): ClearingResult {
  const { p: pPlus, rounds } = fictitiousDefault(sys);
  const pMinus = clearingFromBelow(sys);
  let l1 = 0;
  for (let i = 0; i < pPlus.length; i++) l1 += Math.abs((pPlus[i] ?? 0) - (pMinus[i] ?? 0));
  return { pPlus, pMinus, unique: l1 < tol, rounds, tol };
}

/** `Φ(p)` explicite (pour vérifier `Φ(p*) = p*`). */
export function phi(sys: FinancialSystem, p: readonly number[]): number[] {
  const pbar = pbarOf(sys.L);
  const Pi = piOf(sys.L, pbar);
  return p.map((_, i) => Math.min(pbar[i] ?? 0, nodeValue(i, p, sys.e, Pi)));
}

export { pbarOf, piOf };
