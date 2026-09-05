/**
 * HIKAE — constructeurs de région (ADR-M002 D9 / C4 ; propriétaire tranché : le Lot H).
 *
 * L'invariant M5 (`lo <= hi`) et la règle « borné ou abstention » (jamais ±inf sur le
 * fil, miroir du refus Hikae de `+inf`) vivent ICI, dans un seul constructeur — PAS
 * dans `@monark/contracts` (gelé, D2), PAS dupliqué dans `ukemi` (D13). À l'intégration
 * Phase 2, HIKAE conformera la `Prediction` numérique d'UKEMI en région `interval` via
 * `buildIntervalRegion`.
 */
import type { PredictionRegion } from "@monark/contracts";

/** Variante `set` de la région gelée (classification : btc-dir, pm-yesno). */
export type SetRegion = Extract<PredictionRegion, { kind: "set" }>;
/** Variante `interval` de la région gelée (régression : cascade-VaR UKEMI, Phase 2). */
export type IntervalRegion = Extract<PredictionRegion, { kind: "interval" }>;

/**
 * Schéma de labels du beachhead `btc-dir-15m` (D8 : `{up, down}` ; l'égalité
 * `close == open` est `non_evaluable`, jamais un 3e label `flat`).
 */
export const BTC_DIR_LABEL_SCHEMA = "up|down";

/** Les deux labels du beachhead direction (ordre stable pour la sérialisation). */
export const BTC_DIR_LABELS = ["up", "down"] as const;
export type BtcDirLabel = (typeof BTC_DIR_LABELS)[number];

/**
 * Résultat de `buildIntervalRegion` (D9) : une région bornée valide, OU une abstention
 * (une borne non finie ne peut PAS être portée sur le fil — on n'émet jamais ±inf).
 * `under_calib` est le littéral gelé retenu (miroir du refus Hikae de `+inf`, D9).
 */
export type IntervalRegionResult =
  | { abstain: false; region: IntervalRegion }
  | { abstain: true; reason: "under_calib" };

/**
 * Constructeur UNIQUE d'une région `interval` (D9 / C4, invariant M5).
 *
 * Ordre voulu (déclaré) : la **finitude est testée d'abord** — une borne non finie
 * (`±Infinity`/`NaN`) ⇒ abstention `under_calib` (on n'émet jamais ±inf) ; puis, bornes
 * finies avec `lo > hi` ⇒ throw explicite (violation de l'invariant M5). Ce choix
 * d'ordre traite `(+Infinity, 5)` comme « non borné ⇒ abstention », pas comme `lo > hi`.
 */
export function buildIntervalRegion(lo: number, hi: number): IntervalRegionResult {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { abstain: true, reason: "under_calib" };
  }
  if (lo > hi) {
    throw new Error(
      `buildIntervalRegion: lo (${lo}) > hi (${hi}) — invariant M5 (lo <= hi) violé (ADR-M002 D9/C4).`,
    );
  }
  return { abstain: false, region: { kind: "interval", lo, hi } };
}

/**
 * Constructeur d'une région `set` (classification), avec le schéma de labels porté.
 * Copie défensive de `labels` (le contrat gelé attend un `string[]` propre).
 */
export function buildSetRegion(
  labels: readonly string[],
  labelSchema: string = BTC_DIR_LABEL_SCHEMA,
): SetRegion {
  return { kind: "set", labels: [...labels], label_schema: labelSchema };
}
