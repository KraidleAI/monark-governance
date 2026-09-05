/**
 * HIKAE L1 — split conformal par classe de tâche (ADR-M002 D3, garantie type (i)).
 *
 * Garantie DÉCLARÉE : marginale, échantillon-fini, SOUS échangeabilité à l'intérieur de
 * la classe κ ; PAS de couverture conditionnelle à x ; JAMAIS `p_correct`.
 * Sources [lu] (nos archives) : correction `(n+1)` — Barber, Candès, Ramdas, Tibshirani,
 * *Predictive inference with the jackknife+*, AoS 2021, note 1 p.4 (hikae/lecture/
 * L6-jackknife-lei.md:103 ; R2-cp-distfree.md:218) ; validité split-CP marginale — Barber
 * et al. 2020, Thm 2.1 p.5 (R2-cp-distfree.md:40,85) ; partition/strates — Thm 4.1 p.11.
 * Score SANS logits — Su et al. *API Is Enough* (VERDICT-TASKCLASS-GROK §1).
 *
 * Beachhead : score INDICATIF `s(x,ŷ)=0, s(x,autre)=1` (k=1). À ce score `q̂ ∈ {0,1}` :
 * `q̂=0 ⇒ C={ŷ}` (singleton), `q̂=1 ⇒ C={up,down}`. La richesse CP ne se manifeste pas
 * sur un binaire — c'est le silence calibré, pas un défaut (GROK-DECORTICATION §2).
 */

/** Score indicatif k=1 (D3) : 0 si `y === yhat`, 1 sinon. */
export function indicatorScore(yhat: string, y: string): 0 | 1 {
  return y === yhat ? 0 : 1;
}

/** Résultat L1 : soit le quantile conforme, soit fail-closed sous-calibration. */
export type SplitResult = { qhat: number } | { reason: "under_calib" };

/**
 * Quantile split conformal (D3) : `p = ceil((n+1)(1-alpha))`, `q̂` = p-ème plus petit
 * score. FAIL-CLOSED (jamais un `+inf` clampé en silence) : `n < nMin` OU `p > n`
 * ⇒ `under_calib` (pas de `q̂` produit).
 */
export function splitQuantile(
  scores: readonly number[],
  alpha: number,
  nMin: number,
): SplitResult {
  const n = scores.length;
  if (n < nMin) return { reason: "under_calib" };
  const p = Math.ceil((n + 1) * (1 - alpha));
  if (p > n) return { reason: "under_calib" };
  const sorted = [...scores].sort((a, b) => a - b);
  const q = sorted[p - 1];
  if (q === undefined) return { reason: "under_calib" }; // garde noUncheckedIndexedAccess
  return { qhat: q };
}

/**
 * Ensemble conforme `C(x) = { y : s(x,y) <= qhat }` (D3). `scoresByLabel` porte le score
 * indicatif de CHAQUE label candidat pour ce x ; l'ordre d'itération de la Map est
 * préservé (déterminisme de sérialisation).
 */
export function conformalSet(
  scoresByLabel: ReadonlyMap<string, number>,
  qhat: number,
): string[] {
  const out: string[] = [];
  for (const [label, s] of scoresByLabel) {
    if (s <= qhat) out.push(label);
  }
  return out;
}

/**
 * Scores indicatifs pour un x donné : `s(x,ŷ)=0`, `s(x,autre)=1` sur l'espace `labels`,
 * en préservant l'ordre de `labels` (Map ordonnée).
 */
export function indicatorScores(
  yhat: string,
  labels: readonly string[],
): Map<string, number> {
  const m = new Map<string, number>();
  for (const y of labels) m.set(y, indicatorScore(yhat, y));
  return m;
}
