/**
 * UKEMI — émission d'une `Prediction` NUMÉRIQUE (ADR-M002 D1 : le Lot U émet une
 * `Prediction{yhat:number, predictor_id}` SEULEMENT ; AUCUNE région `interval` — la région
 * est un travail de conformeur, propriété du Lot H, à l'intégration Phase 2).
 *
 * Contrat gelé consommé (jamais réimplémenté) : `@monark/contracts`. Sérialisé par
 * `serializePrediction` (closed-check + garde récursif de clés interdites). Aucun horodatage
 * n'est LU ici : `producedAt` est un paramètre INJECTÉ (stabilité des hashes, D7).
 */
import type { Prediction } from "@monark/contracts";
import { serializePrediction } from "@monark/contracts";

export const UKEMI_PREDICTOR_ID = "internal:ukemi-cascade-v0";
const SCHEMA_VERSION = "1.0.0";
const TASK_CLASS = "cascade-liquidable-24h";

/**
 * Émet une prédiction ponctuelle (le montant liquidable estimé, cible A) comme `yhat:number`.
 * C'est un point que HIKAE conformera en région `interval` en Phase 2 — UKEMI n'émet PAS
 * de région ni de garantie.
 */
export function emitPrediction(yhat: number, producedAt: string): Prediction {
  return {
    schema_version: SCHEMA_VERSION,
    task_class: TASK_CLASS,
    yhat,
    predictor_id: UKEMI_PREDICTOR_ID,
    produced_at: producedAt,
  };
}

/** Sérialisation canonique (contrat gelé) — lève sur clé inconnue/interdite à tout rang. */
export function serialize(p: Prediction): string {
  return serializePrediction(p);
}
