/**
 * UKEMI — cible A : « montant liquidable sous un choc de prix de x % » (ADR-M002 D9 ;
 * [lu-archive] SYNTHESE-LIQUIDATIONS §1 maillon 1 / §2(b) ; Perez, Werner, Xu, Livshits,
 * *Liquidations: DeFi on a Knife-edge*, arXiv 2009.13235v6, **Eq. 3 p.7**).
 *
 * Critère Eq. 3 (verbatim de forme) : une position est liquidable quand
 *   (collatéral × prix-oracle φ × seuil K) / (emprunt × prix-oracle) < 1.
 * Sur un choc du prix du COLLATÉRAL de fraction `shock` (baisse), la valeur du collatéral
 * devient `collateralQty × collateralPrice × (1 − shock)`, et la position bascule quand
 *   collateralQty × collateralPrice × (1 − shock) × K < debt.
 *
 * **Horizon = 24 h — DÉCISION INVESTISSEUR (d), 2026-09-04.** C'est l'horizon de l'objet payé
 * (VaR 99 %/24 h, SYNTHESE §3.1) ; le choc `x %` sur 24 h est un **paramètre de fixture
 * DÉCLARÉ, PAS un modèle de dynamique 24 h** (la dynamique est NON TROUVÉE dans le corpus,
 * §4.7). Le « 99 % » n'est **pas** produit ici — c'est une cible de couverture HIKAE Phase 2,
 * jamais un `p_correct`. Aucune garantie ; UKEMI = brique-moteur MONARK (D9).
 */

export interface Position {
  readonly id: string;
  /** Quantité de collatéral (unités de l'actif). */
  readonly collateralQty: number;
  /** Prix-oracle courant du collatéral (avant choc). */
  readonly collateralPrice: number;
  /** Seuil de liquidation `K` ∈ (0,1] (ex. 0,8 = LTV max ⇒ liquidable si valeur·K < dette). */
  readonly liqThreshold: number;
  /** Emprunt (dette) libellé dans l'actif de référence. */
  readonly debt: number;
}

/** Une position est-elle liquidable après une baisse `shock` (fraction ∈ [0,1]) du prix collatéral ? */
export function isLiquidable(pos: Position, shock: number): boolean {
  const collateralValue = pos.collateralQty * pos.collateralPrice * (1 - shock);
  return collateralValue * pos.liqThreshold < pos.debt;
}

export interface LiquidableResult {
  /** Choc appliqué (fraction, sur 24 h — paramètre déclaré). */
  readonly shock: number;
  readonly horizon: "24h";
  /** Dette totale des positions devenues liquidables sous le choc. */
  readonly liquidableDebt: number;
  /** Identifiants des positions liquidables (recalculable). */
  readonly liquidableIds: string[];
}

/**
 * Montant liquidable = somme des dettes des positions qui basculent sous le choc (cible A).
 * Déterministe, recalculable à la main. Exemple (voir test) : collateralQty=1, price=100,
 * K=0,8, debt=70 ⇒ seuil de bascule à `100·(1−shock)·0,8 < 70` ⇔ `1−shock < 0,875` ⇔
 * `shock > 0,125` (12,5 %). À shock=0,20 : `100·0,8·0,8=64 < 70` ⇒ liquidable.
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
