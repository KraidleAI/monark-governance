/**
 * UKEMI (受け身) — brique-moteur MONARK de risque de cascade de liquidation (Phase 1).
 *
 * PAS un produit autonome (G7 UKEMI 2026-09-03 §5-6 ; ADR-M002 D9) : un noyau de clearing
 * Eisenberg-Noe déterministe + une cible « montant liquidable sous choc » (horizon 24 h,
 * décision investisseur (d)), émise comme `Prediction` numérique que HIKAE conformera en
 * Phase 2. Aucune garantie, aucun rendement, aucun `p_correct`. Code le nôtre.
 */
export {
  clearing,
  fictitiousDefault,
  clearingFromBelow,
  phi,
  pbarOf,
  piOf,
} from "./clearing.ts";
export type { FinancialSystem, ClearingResult } from "./clearing.ts";

export { isLiquidable, liquidableAmount } from "./liquidable.ts";
export type { Position, LiquidableResult } from "./liquidable.ts";

export { emitPrediction, serialize, UKEMI_PREDICTOR_ID } from "./prediction.ts";
