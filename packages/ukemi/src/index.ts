/**
 * UKEMI (受け身) — MONARK liquidation book primitives (Phase 1): a deterministic Eisenberg-Noe
 * clearing core, the static eligible ("liquidable") amount under a shock (Perez Eq. 3, 24 h horizon,
 * a product decision (d)), and the cascade-cluster lattice (annex, ADR-U2). Emitted as a numeric
 * `Prediction` that HIKAE conformalizes in Phase 2. NOT a standalone product (G7 UKEMI 2026-09-03
 * §5-6; ADR-M002 D9). No guarantee, no yield, no `p_correct`. Our own code.
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

export {
  applyT,
  priceAt,
  smallestFixedPoint,
  greatestFixedPoint,
  noDormantActivation,
  totalDebt,
  positionToCritical,
  assertLatticeDomain,
  LatticeDomainError,
} from "./lattice.ts";
export type { LatticePosition, LatticeState, FixedPoint, DemandKind } from "./lattice.ts";

export { emitPrediction, serialize } from "./prediction.ts";
export type { PredictionMeta } from "./prediction.ts";
