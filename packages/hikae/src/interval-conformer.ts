/**
 * HIKAE — conformeur `interval` de RÉGRESSION (ADR-M003 D6.1 ; propriétaire = Lot H, D9/C4).
 *
 * Split conformal à résidu absolu, pour la `Prediction` NUMÉRIQUE d'UKEMI (montant liquidable,
 * classe `ukemi-liquidable-24h`) : à partir de paires de calibration `(ŷ_i, y_i)`,
 *   - score `s_i = |y_i − ŷ_i|` (résidu absolu) ;
 *   - `q̂` = ⌈(n+1)(1−α)⌉-ième plus petit score — RÉUTILISE `splitQuantile` (L1, l1-split.ts),
 *     la SEULE implémentation du quantile conforme, JAMAIS réécrite ici (fail-closed partagé) ;
 *   - région `C(ŷ) = [ŷ − q̂, ŷ + q̂]` pour la prédiction `ŷ` du point de test, via
 *     `buildIntervalRegion` (invariant M5 `lo ≤ hi` — trivialement vrai car `q̂ ≥ 0`).
 *
 * Garantie DÉCLARÉE (héritée de L1) : couverture marginale, échantillon-fini, SOUS échangeabilité
 * dans la classe. PAS de couverture conditionnelle, JAMAIS `p_correct`. Le jugement de LARGEUR
 * (`(hi−lo) ≤ τ_interval` ⇒ COMMIT, sinon DEFER) appartient à L3 (l3-gate.ts), pas au conformeur :
 * ce module ne produit que la région et le verdict `covered`.
 *
 * Sous-calibration (`n < nMin` ou `⌈(n+1)(1−α)⌉ > n`) : fail-closed via `underCalibVerdict` — le
 * MÊME littéral gelé que L1 (région `set` vide, `abstain=true`, `qhat=null`, `reason=under_calib`) ;
 * on n'invente ni raison ni région, on ne clampe jamais un `q̂` en silence.
 */
import type { CoverageVerdict } from "@monark/contracts";
import { splitQuantile } from "./l1-split.ts";
import { buildIntervalRegion } from "./region.ts";
import { buildVerdict, underCalibVerdict } from "./verdict.ts";

/** Une paire de calibration : prédiction `ŷ_i` et réalisation `y_i` (montants, nombres finis). */
export interface CalibPair {
  readonly yhat: number;
  readonly y: number;
}

export interface IntervalConformalParams {
  readonly calib: readonly CalibPair[];
  /** Prédiction `ŷ` du POINT DE TEST à conformer (centre de la région). */
  readonly yhat: number;
  readonly alpha: number;
  readonly nMin: number;
  readonly taskClass: string;
  readonly residual: readonly string[];
  readonly producedAt: string;
  readonly schemaVersion: string;
  /** Porter les scores sur le fil (payload optionnel) ; par défaut non (recalcul par calib_digest). */
  readonly includeScores?: boolean;
}

export interface IntervalConformalResult {
  readonly verdict: CoverageVerdict;
  readonly qhat: number | null;
  readonly region: { readonly lo: number; readonly hi: number } | null;
}

/** Scores de résidu absolu `s_i = |y_i − ŷ_i|` (ADR-M003 D6.1), dans l'ordre des paires. */
export function absoluteResidualScores(calib: readonly CalibPair[]): number[] {
  return calib.map((c) => Math.abs(c.y - c.yhat));
}

function underCalib(params: IntervalConformalParams): IntervalConformalResult {
  return {
    verdict: underCalibVerdict({
      taskClass: params.taskClass,
      method: "split",
      alpha: params.alpha,
      scores: absoluteResidualScores(params.calib),
      residual: params.residual,
      producedAt: params.producedAt,
      schemaVersion: params.schemaVersion,
    }),
    qhat: null,
    region: null,
  };
}

/**
 * Conforme la prédiction numérique `ŷ` en région `interval` (ou abstention sous-calibrée).
 * Déterministe ; aucun horodatage lu (`producedAt` injecté, stabilité des hashes).
 */
export function conformInterval(params: IntervalConformalParams): IntervalConformalResult {
  const scores = absoluteResidualScores(params.calib);
  const split = splitQuantile(scores, params.alpha, params.nMin); // q̂ = ⌈(n+1)(1−α)⌉-ième trié (L1)
  if ("reason" in split) return underCalib(params); // fail-closed : sous-calibration

  const qhat = split.qhat;
  const ir = buildIntervalRegion(params.yhat - qhat, params.yhat + qhat); // q̂ ≥ 0 ⇒ lo ≤ hi (M5)
  if (ir.abstain) return underCalib(params); // borne non finie (ŷ ±inf/NaN) — jamais atteint si ŷ fini

  const verdict = buildVerdict({
    taskClass: params.taskClass,
    method: "split",
    alpha: params.alpha,
    scores,
    region: ir.region,
    qhat,
    abstain: false,
    reason: "covered",
    residual: params.residual,
    producedAt: params.producedAt,
    schemaVersion: params.schemaVersion,
    ...(params.includeScores ? { includeScores: true } : {}),
  });
  return { verdict, qhat, region: { lo: ir.region.lo, hi: ir.region.hi } };
}
