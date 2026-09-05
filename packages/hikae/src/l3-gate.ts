/**
 * HIKAE L3 — politique d'engagement différé 控え (ADR-M002 D5, prédicat FERMÉ).
 *
 *   ABSTAIN  si parse non_evaluable | timeout | n<n_min | intent∉C | B_t<B_floor
 *            | (|C|>tau ET horloge close)          ← DEFER converti ⇒ clock_expired
 *   DEFER    si |C|>tau ET horloge ouverte
 *   COMMIT   si intent∈C, |C|<=tau, B_t>=B_floor
 *
 * Lecture d'horloge RETENUE (déclarée) : l'horloge ne conditionne QUE le DEFER — un DEFER
 * impossible (horloge close) devient ABSTAIN `clock_expired` ; COMMIT n'a AUCUNE condition
 * d'horloge (D5 littéral : « COMMIT si intent∈C, |C|<=tau, B>=B_floor »). C'est la seule
 * lecture où les trois lignes du prédicat tiennent simultanément. DEFER attend, ABSTAIN
 * refuse ; le PnL n'entre pas dans π.
 *
 * Ordre de priorité des raisons (déclaré, overlap déterministe) :
 *   non_evaluable → upstream_timeout → under_calib → intent_not_in_region →
 *   budget_exhausted → [ |C|>tau ? (horloge ? DEFER:set_too_large : ABSTAIN:clock_expired)
 *                       : COMMIT:covered ].
 *
 * D0 (pas de trading dans MONARK ; produit futur = KAIZEN) : les outils gated
 * `perps_order_preview` / `perps_order_execute` sont NOMMÉS ici mais JAMAIS appelés.
 * Une région `interval` en entrée est un travail de conformeur = Phase 2 (D9) : on LÈVE
 * explicitement, on n'invente aucune raison.
 */
import type { CoverageVerdict, GateDecision, GateAction, CoverageReason } from "@monark/contracts";
import { intentInRegion } from "@monark/contracts";

/** Outils de marché gated (D0) — NOMMÉS, jamais invoqués par MONARK (ni réel ni paper). */
export const GATED_TOOLS = ["perps_order_preview", "perps_order_execute"] as const;
export type GatedTool = (typeof GATED_TOOLS)[number];

/** Entrées de la politique L3 (déjà calculées par L1/L2 ; tout horodatage est injecté en amont). */
export interface GateInput {
  intent: string | number | null;
  verdict: CoverageVerdict;
  /** B_t (statistique L2) — capacité d'autorisation restante, jamais un rendement. */
  remainingBudget: number;
  bFloor: number;
  tau: number;
  nCalib: number;
  nMin: number;
  /** L'horloge de couverture (fenêtre de décision) est-elle encore ouverte ? */
  clockOpen: boolean;
  /** L'amont (prédicteur) a-t-il timeout ? ⇒ upstream_timeout, fail-closed. */
  timedOut: boolean;
  /** Le parse de ŷ est-il évaluable ? `false` ⇒ non_evaluable, fail-closed. */
  evaluable: boolean;
  /** L'outil gated visé (NOMMÉ, jamais appelé — D0). */
  tool: GatedTool | string;
  schemaVersion: string;
}

interface Verdictum {
  action: GateAction;
  allow: boolean;
  reason: CoverageReason;
}

function decide(input: GateInput): Verdictum {
  const region = input.verdict.region;
  // Région `interval` = conformeur de régression (UKEMI) ⇒ Phase 2. Throw explicite (D9).
  if (region.kind === "interval") {
    throw new Error(
      "l3-gate: région `interval` non gérée en Phase 1 — le conformeur d'intervalle est Phase 2 (ADR-M002 D9).",
    );
  }
  const setSize = region.labels.length;

  if (!input.evaluable) return { action: "abstain", allow: false, reason: "non_evaluable" };
  if (input.timedOut) return { action: "abstain", allow: false, reason: "upstream_timeout" };
  if (input.nCalib < input.nMin) return { action: "abstain", allow: false, reason: "under_calib" };
  if (!intentInRegion(input.intent, region)) {
    return { action: "abstain", allow: false, reason: "intent_not_in_region" };
  }
  if (input.remainingBudget < input.bFloor) {
    return { action: "abstain", allow: false, reason: "budget_exhausted" };
  }
  if (setSize > input.tau) {
    // |C| > tau : DEFER si l'horloge est ouverte, sinon le DEFER se convertit en ABSTAIN.
    if (input.clockOpen) return { action: "defer", allow: false, reason: "set_too_large" };
    return { action: "abstain", allow: false, reason: "clock_expired" };
  }
  // intent∈C, |C|<=tau, B_t>=B_floor ⇒ COMMIT.
  return { action: "commit", allow: true, reason: "covered" };
}

/**
 * Politique L3 → `GateDecision` (contrat gelé). Le gate NE FAIT QU'ÉMETTRE une décision ;
 * il n'appelle JAMAIS `input.tool` (D0 : pas de trading dans MONARK).
 */
export function gate(input: GateInput): GateDecision {
  const { action, allow, reason } = decide(input);
  return {
    schema_version: input.schemaVersion,
    action,
    allow,
    tool: input.tool,
    intent: input.intent,
    verdict: input.verdict,
    remaining_budget: input.remainingBudget,
    reason,
  };
}
