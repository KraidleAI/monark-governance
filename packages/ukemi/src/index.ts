/**
 * UKEMI (受け身) — MONARK liquidation-cascade risk engine building-block (Phase 1).
 *
 * NOT a standalone product (G7 UKEMI 2026-09-03 §5-6; ADR-M002 D9): a deterministic
 * Eisenberg-Noe clearing core + a "liquidable amount under shock" target (24 h horizon,
 * investor decision (d)), emitted as a numeric `Prediction` that HIKAE will conformalize in
 * Phase 2. No guarantee, no yield, no `p_correct`. Our own code.
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
