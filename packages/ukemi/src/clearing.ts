/**
 * UKEMI — noyau de clearing Eisenberg & Noe (ADR-M002 D9 ; [lu-archive K4]
 * liquidations/lecture/K4-systemique-clearing.md:21-63,160), ÉTENDU aux coûts de défaut
 * (α, β) de Rogers & Veraart (ADR-M003 D6.3 ; [lu] `P-K4-1-rogers2013.md`, éq. (1) p.884 Q1,
 * GA Def. 3.6 Q2, Thm 3.7 « ≤ n tours » Q2). DÉTERMINISTE, recalculable par quiconque depuis
 * `(L, e, α, β)` — même exigence de recalculabilité que Shōgen.
 *
 * Carte de compensation (P-K4-1 éq. (1), Q1) sur le treillis [0, p̄] :
 *   Φ(p)_i = p̄_i                         si  p̄_i ≤ e_i + Σ_j p_j Π_ji   (solvable : paie le nominal)
 *          = α·e_i + β·(Σ_j p_j Π_ji)     sinon                          (défaut : recouvrement partiel)
 *   - `p̄_i = Σ_j L_ij` (obligations nominales totales du nœud i) ; `Π_ij = L_ij / p̄_i`.
 *   - **α ∈ (0,1]** = fraction récupérée des actifs EXTERNES en liquidation ; **β ∈ (0,1]** = des
 *     actifs INTERBANCAIRES (P-K4-1 Q1, Def. 2.5). **α=β=1 ⇒ E&N** (éq. 6 p.886, Q1) :
 *     Φ(p)_i = p̄_i ∧ (e_i + Σ_j p_j Π_ji) — la carte Phase 1, reproduite AU BIT PRÈS (test 36).
 *   - existence de `L*` (plus grand) et `L_*` (plus petit) pour tout 0<α,β≤1 : Thm 3.1 (P-K4-1 Q2).
 *   - **unicité NON garantie dès α<1 ou β<1** : Ex. 3.3 (P-K4-1 Q2) — `clearing()` rapporte les
 *     deux vecteurs et `unique=false` hors égalité ; ne JAMAIS prétendre l'unicité hors α=β=1.
 *   - `L*` par GA (fictitious default ≤ n tours, Thm 3.7, P-K4-1 Q2).
 *   - `L_*` par itérés de Φ depuis 0 — RÉSERVE consignée : Φ « continuous from above » toujours,
 *     « not continuous from below sauf α=β=1 » (P-K4-1 Q2) ⇒ pour α,β<1 l'itération depuis 0
 *     donne un point fixe bas, sans garantie théorique d'atteindre L_* sans redémarrages.
 *
 * `(α, β)` sont des SCALAIRES EXOGÈNES (Def. 2.5) : hors α=β=1 (E&N) et hors le contrôle négatif
 * Ex. 3.3 (valeurs de la source), toute valeur employée est DÉCLARÉE, non fondée — aucun défaut
 * produit n'en fixe une (pendant formé ADR-M003 §4 : « (α,β) fondés par source empirique »).
 *
 * UKEMI = brique-moteur MONARK, PAS un produit (G7 UKEMI §5-6). Aucune garantie, aucun `p_correct`,
 * aucun rendement. Le canal endogène DeFi (prix de liquidation) est NON MODÉLISÉ (P-K4-1 Q5, D6.4).
 */

export interface FinancialSystem {
  /** Matrice des passifs nominaux : `L[i][j]` = ce que i doit à j. Carrée, ≥ 0, diagonale nulle. */
  readonly L: readonly (readonly number[])[];
  /** Actifs externes (valeur de liquidation) par nœud, à la date de compensation. */
  readonly e: readonly number[];
}

export interface ClearingResult {
  /** Plus grand vecteur de compensation `L*` (fictitious default / GA). */
  readonly pPlus: number[];
  /** Plus petit vecteur `L_*` (itérés depuis 0 ; réserve « pas continue par le bas » si α,β<1). */
  readonly pMinus: number[];
  /** `‖L*−L_*‖_1 ≤ tol` ⇒ unicité (K4:47-48 sous régularité e>0 ; JAMAIS revendiquée hors α=β=1). */
  readonly unique: boolean;
  /** Nombre de tours du fictitious default (≤ n). */
  readonly rounds: number;
  readonly tol: number;
  /** Coûts de défaut employés (provenance ; 1 = E&N). */
  readonly alpha: number;
  readonly beta: number;
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

/** Actifs interbancaires reçus par i sous des paiements `p` : `Σ_j Π[j][i] p_j` (branche R&V seule). */
function interbankIn(i: number, p: readonly number[], Pi: readonly (readonly number[])[]): number {
  let v = 0;
  for (let j = 0; j < p.length; j++) v += (Pi[j]?.[i] ?? 0) * (p[j] ?? 0);
  return v;
}

/**
 * Valeur d'un nœud i sous des paiements `p` : `e_i + Σ_j Π[j][i] p_j` (externe + interbancaire reçu).
 * Repli à GAUCHE depuis `e_i` — ORDRE d'accumulation identique à la Phase 1 (byte-exactness E&N, test 36).
 */
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
 * Fictitious default / GA (K4:51-58 ; P-K4-1 Def. 3.6, Thm 3.7, Q2) : `p⁰ = p̄` ; à chaque tour, les
 * nœuds DÉFAILLANTS (valeur < p̄, insolvabilité aux fondamentaux, INCHANGÉE par α,β) paient le
 * recouvrement `x_i = α e_i + β·(Σ_j p_j Π_ji)` — système linéaire `(I − β Π_DDᵀ) x_D = α e_D +
 * β Π_{Dc D}ᵀ p̄_Dc` sur le bloc défaillant D — les autres paient p̄. L'ensemble de défaut CROÎT
 * d'au moins un par tour ⇒ **≤ n tours**. Renvoie `L*`.
 *
 * **α=β=1 (E&N) reproduit AU BIT PRÈS la Phase 1** : `1·x = x` en IEEE-754 et l'ordre d'accumulation
 * du RHS est inchangé, donc `A`, `b` et donc `L*` sont identiques bit-à-bit à l'implémentation
 * d'origine (test 36 ; mutant nommé « β ignoré » ⇒ test 37 rouge, mutant « interbancaire retiré »
 * ⇒ test 36 rouge).
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
    // Résout les paiements de recouvrement des nœuds défaillants (bloc D).
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
    // Nouveaux défaillants : nœud non encore en défaut dont la valeur (fondamentale) < p̄.
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
 * Itérés de Φ depuis 0 : `L_*` (plus petit point fixe). Picard monotone croissant.
 * RÉSERVE (P-K4-1 Q2) : Φ n'est « pas continue par le bas » si α,β<1 — l'itération depuis 0
 * converge vers un point fixe bas, sans garantie d'atteindre L_* sans redémarrages ; pour α=β=1
 * (E&N, Φ continue) elle atteint bien le plus petit.
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

/** Compensation complète : `L*` (fictitious default / GA), `L_*` (depuis 0), unicité. */
export function clearing(sys: FinancialSystem, alpha = 1, beta = 1, tol = 1e-8): ClearingResult {
  const { p: pPlus, rounds } = fictitiousDefault(sys, alpha, beta);
  const pMinus = clearingFromBelow(sys, alpha, beta);
  let l1 = 0;
  for (let i = 0; i < pPlus.length; i++) l1 += Math.abs((pPlus[i] ?? 0) - (pMinus[i] ?? 0));
  return { pPlus, pMinus, unique: l1 < tol, rounds, tol, alpha, beta };
}

/**
 * `Φ(p)` explicite (P-K4-1 éq. (1), Q1). Pour vérifier `Φ(p*) = p*`.
 * **α=β=1 : chemin E&N préservé au bit près** (`Math.min(p̄_i, valeur_i)`, carte Phase 1 littérale).
 */
export function phi(sys: FinancialSystem, p: readonly number[], alpha = 1, beta = 1): number[] {
  const pbar = pbarOf(sys.L);
  const Pi = piOf(sys.L, pbar);
  const enPath = alpha === 1 && beta === 1; // Eisenberg & Noe : reproduit bit-à-bit la Phase 1
  return p.map((_, i) => {
    const pb = pbar[i] ?? 0;
    const value = nodeValue(i, p, sys.e, Pi); // e_i + interbancaire, ordre d'accumulation Phase 1
    if (enPath) return Math.min(pb, value); // carte E&N littérale (byte-exact)
    if (value >= pb) return pb; // solvable : paie le nominal
    return alpha * (sys.e[i] ?? 0) + beta * interbankIn(i, p, Pi); // défaut : α·externe + β·interbancaire
  });
}

export { pbarOf, piOf };
