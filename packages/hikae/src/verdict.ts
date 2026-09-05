/**
 * HIKAE — assemblage du `CoverageVerdict` (ADR-M002 D5 ; contrat gelé Phase 0, ADR-M001).
 *
 * `calib_digest = calibDigest(scores)` — recalculabilité PAR RÉFÉRENCE (ADR-M001 C5),
 * déterministe cross-langage. Sérialisé par `serializeVerdict` (closed-check + garde
 * récursif de clés interdites). Aucun horodatage lu ici : `produced_at` est INJECTÉ
 * (stabilité des hashes).
 *
 * Sémantique d'`abstain` (DÉCLARÉE) : `abstain = 1{|C| > tau}` au sens du gate (Grok doc 11
 * §4 étape 3) — un DEFER porte un verdict `{ abstain: true }`, ce qui rend la colonne
 * « abstention (tau=1) » du journal S2 recalculable sans croire HIKAE. `verdict.reason`
 * reflète le NIVEAU couverture (`covered` / `set_too_large` / `under_calib`) ; la raison de
 * GATE (timeout / budget / clock) vit sur `GateDecision.reason` (seule vérité de gate).
 *
 * Sous-calibration (D5) : région `set` VIDE (labels `[]`), `abstain=true`, `qhat=null`
 * (le contrat requiert la clé `qhat` présente ; `null` sous `exactOptionalPropertyTypes`).
 */
import type { CoverageVerdict, CoverageReason, Method, PredictionRegion } from "@monark/contracts";
import { calibDigest, serializeVerdict } from "@monark/contracts";
import { buildSetRegion, BTC_DIR_LABEL_SCHEMA } from "./region.ts";

export interface VerdictParams {
  taskClass: string;
  method: Method;
  alpha: number;
  /** Scores de CALIBRATION (n_calib = leur nombre) ; base du calib_digest. */
  scores: readonly number[];
  region: PredictionRegion;
  qhat: number | null;
  abstain: boolean;
  reason: CoverageReason;
  residual: readonly string[];
  producedAt: string;
  schemaVersion: string;
  /** Inclure `scores` sur le fil (payload optionnel) ; par défaut non (recalcul par calib_digest). */
  includeScores?: boolean;
}

/** Assemble un `CoverageVerdict` gelé (n_calib = scores.length ; calib_digest recalculable). */
export function buildVerdict(params: VerdictParams): CoverageVerdict {
  return {
    schema_version: params.schemaVersion,
    task_class: params.taskClass,
    method: params.method,
    alpha: params.alpha,
    n_calib: params.scores.length,
    region: params.region,
    qhat: params.qhat,
    abstain: params.abstain,
    reason: params.reason,
    residual: [...params.residual],
    calib_digest: calibDigest(params.scores),
    produced_at: params.producedAt,
    ...(params.includeScores ? { scores: [...params.scores] } : {}),
  };
}

/**
 * Verdict de sous-calibration (D5) : région `set` VIDE, `abstain=true`, `qhat=null`,
 * `reason=under_calib`. Le digest reste calculé sur les scores DISPONIBLES (par référence).
 */
export function underCalibVerdict(params: {
  taskClass: string;
  method: Method;
  alpha: number;
  scores: readonly number[];
  residual: readonly string[];
  producedAt: string;
  schemaVersion: string;
  labelSchema?: string;
}): CoverageVerdict {
  return buildVerdict({
    taskClass: params.taskClass,
    method: params.method,
    alpha: params.alpha,
    scores: params.scores,
    region: buildSetRegion([], params.labelSchema ?? BTC_DIR_LABEL_SCHEMA),
    qhat: null,
    abstain: true,
    reason: "under_calib",
    residual: params.residual,
    producedAt: params.producedAt,
    schemaVersion: params.schemaVersion,
  });
}

/** Sérialisation canonique (contrat gelé) : closed-check + garde récursif de clés interdites. */
export function serialize(verdict: CoverageVerdict): string {
  return serializeVerdict(verdict);
}
