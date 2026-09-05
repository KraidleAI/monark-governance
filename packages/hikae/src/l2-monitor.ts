/**
 * HIKAE L2 — MONITEUR de risque restant (mécanisme IM-OCP).
 *
 * *** MONITEUR, AUCUNE GARANTIE REVENDIQUÉE (ADR-M002 D4, branche b). ***
 * En Phase 1, `q̂` split (L1) définit SEUL C_t. `r_t` (IM-OCP) et `B_t` sont des
 * statistiques de monitoring qui pilotent π (L3) et le drapeau de drift ; `r_t` n'a
 * AUCUN consommateur d'ensemble, donc la garantie long-run type (ii) de Wang n'est
 * attachée à rien et n'est PAS revendiquée. La branche (a) (`C_t = {y : s <= r_t}`,
 * garantie (ii) portée par C_t) est NOMMÉE pour la Phase 2, par ADR après S2 réel.
 *
 * Source [lu] du mécanisme : Wang, Zecchin, Simeone, IEEE SPL 32 (2025) 2888-2892,
 * éq. 10 / Thm 1 (cité, non republié) — transporté sur la sous-suite des labels ARRIVÉS
 * (p = 1 sur cette sous-suite, pas « p_t = 0 avant w » : R5:151-158 exige p_min > 0).
 * Le terme d'horloge `w/T` (retard déterministe) est une COMPOSITION (H4) — notre choix
 * de conception, pas un théorème publié. Les tests 9-10 vérifient le MÉCANISME, pas une garantie.
 */

/** E_t = 1{Y_t not in C_t} — indicatrice de miscover (0 = couvert, 1 = miscover). */
export type Miscover = 0 | 1;

/**
 * Pas IM-OCP (cas euclidien de l'éq. 10, sur UN label arrivé) :
 *   `r_t = r_{t-1} - eta * (alpha - E)`.
 * Direction (test `imocp_update_direction`) : miscover (E=1) ⇒ r MONTE ; couvert (E=0)
 * ⇒ r BAISSE. C'est le mécanisme, jamais une garantie de couverture (branche b).
 */
export function imocpStep(r: number, alpha: number, E: Miscover, eta: number): number {
  return r - eta * (alpha - E);
}

/**
 * Sous-suite des E des labels ARRIVÉS à l'instant de décision de la fenêtre `t` (H4, D4).
 *
 * `errorTimeline[i]` = E de la i-ème fenêtre ÉVALUABLE (les points `non_evaluable` sont
 * exclus EN AMONT — ils n'entrent jamais dans `t°`). Un label de la fenêtre `i` est
 * *réglé* à `i + labelDelay` ET n'est utilisable que si ce n'est pas celui de la fenêtre
 * courante (`i < t` : le gate décide AVANT son propre label — c'est H4). Donc utilisable
 * ssi `i + labelDelay <= t` ET `i < t`. B_t ne lit JAMAIS un label en attente — ni `y_t`
 * lui-même, MÊME à `labelDelay = 0` (le « no-peek »).
 */
export function arrivedErrors(
  errorTimeline: readonly Miscover[],
  t: number,
  labelDelay: number,
): Miscover[] {
  const out: Miscover[] = [];
  for (let i = 0; i < errorTimeline.length; i++) {
    const settled = i + labelDelay <= t; // le label est réglé
    const notCurrent = i < t; // pas la fenêtre en cours de décision (no-peek H4)
    if (settled && notCurrent) {
      const e = errorTimeline[i];
      if (e !== undefined) out.push(e); // garde noUncheckedIndexedAccess
    }
  }
  return out;
}

/**
 * Budget restant `B_t = alpha - (1/t°) * sum_{labels arrivés} E_i`, où `t°` = nombre de
 * labels ARRIVÉS. `t° = 0` (aucun label arrivé) ⇒ `B_t = alpha` (rien de consommé).
 * Statistique suffisante pour L3 (prédicat d'autorisation H5) et le drapeau de drift —
 * JAMAIS un rendement (ADR-CERT-MONARK).
 */
export function remainingBudget(arrived: readonly Miscover[], alpha: number): number {
  const tDeg = arrived.length;
  if (tDeg === 0) return alpha;
  let sum = 0;
  for (const e of arrived) sum += e;
  return alpha - sum / tDeg;
}

/**
 * B_t directement depuis une timeline d'erreurs et l'instant de décision `t` (compose
 * `arrivedErrors` + `remainingBudget`) — le chemin garanti « no-peek » pour L3/S2.
 */
export function budgetAt(
  errorTimeline: readonly Miscover[],
  t: number,
  labelDelay: number,
  alpha: number,
): number {
  return remainingBudget(arrivedErrors(errorTimeline, t, labelDelay), alpha);
}
