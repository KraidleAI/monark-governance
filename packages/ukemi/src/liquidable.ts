/**
 * UKEMI — target A: "liquidable amount under a price shock of x %" (ADR-M002 D9;
 * [lu-archive] SYNTHESE-LIQUIDATIONS §1 link 1 / §2(b); Perez, Werner, Xu, Livshits,
 * *Liquidations: DeFi on a Knife-edge*, arXiv 2009.13235v6, **Eq. 3 p.7**).
 *
 * Eq. 3 criterion (verbatim in form): a position is liquidable when
 *   (collateral × oracle-price φ × threshold K) / (borrowing × oracle-price) < 1.
 * Under a shock to the COLLATERAL price of fraction `shock` (a drop), the collateral value
 * becomes `collateralQty × collateralPrice × (1 − shock)`, and the position tips when
 *   collateralQty × collateralPrice × (1 − shock) × K < debt.
 *
 * **Horizon = 24 h — a product decision (d), 2026-09-04.** It is the horizon of the paid object
 * (VaR 99 %/24 h, SYNTHESE §3.1); the `x %` shock over 24 h is a **DECLARED fixture parameter,
 * NOT a 24 h dynamics model** (the dynamics is NOT FOUND in the corpus, §4.7). The "99 %" is
 * **not** produced here — it is a HIKAE Phase 2 coverage target, never a `p_correct`. No
 * guarantee; UKEMI = MONARK engine building-block (D9).
 */

export interface Position {
  readonly id: string;
  /** Collateral quantity (units of the asset). */
  readonly collateralQty: number;
  /** Current oracle price of the collateral (before shock). */
  readonly collateralPrice: number;
  /** Liquidation threshold `K` ∈ (0,1] (e.g. 0,8 = max LTV ⇒ liquidable if value·K < debt). */
  readonly liqThreshold: number;
  /** Borrowing (debt) denominated in the reference asset. */
  readonly debt: number;
}

/** Is a position liquidable after a `shock` drop (fraction ∈ [0,1]) in the collateral price? */
export function isLiquidable(pos: Position, shock: number): boolean {
  const collateralValue = pos.collateralQty * pos.collateralPrice * (1 - shock);
  return collateralValue * pos.liqThreshold < pos.debt;
}

export interface LiquidableResult {
  /** Applied shock (fraction, over 24 h — declared parameter). */
  readonly shock: number;
  readonly horizon: "24h";
  /** Total debt of the positions that became liquidable under the shock. */
  readonly liquidableDebt: number;
  /** Identifiers of the liquidable positions (recomputable). */
  readonly liquidableIds: string[];
}

/**
 * Liquidable amount = sum of the debts of the positions that tip under the shock (target A).
 * Deterministic, recomputable by hand. Example (see test): collateralQty=1, price=100,
 * K=0,8, debt=70 ⇒ tipping threshold at `100·(1−shock)·0,8 < 70` ⇔ `1−shock < 0,875` ⇔
 * `shock > 0,125` (12,5 %). At shock=0,20: `100·0,8·0,8=64 < 70` ⇒ liquidable.
 */
export function liquidableAmount(positions: readonly Position[], shock: number): LiquidableResult {
  const hit = positions.filter((p) => isLiquidable(p, shock));
  return {
    shock,
    horizon: "24h",
    liquidableDebt: hit.reduce((a, p) => a + p.debt, 0),
    liquidableIds: hit.map((p) => p.id),
  };
}
