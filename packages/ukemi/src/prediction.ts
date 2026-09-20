/**
 * UKEMI — emission of a NUMERIC `Prediction` (ADR-M002 D1: UKEMI emits a
 * `Prediction{yhat:number, predictor_id}` ONLY; NO `interval` region — the region
 * is a conformalizer's job, owned by HIKAE, at Phase 2 integration).
 *
 * Frozen contract consumed (never reimplemented): `@monark/contracts`. Serialized by
 * `serializePrediction` (closed-check + recursive guard against forbidden keys). No timestamp
 * is READ here: `producedAt` is an INJECTED parameter (hash stability, D7).
 */
import type { Prediction } from "@monark/contracts";
import { serializePrediction } from "@monark/contracts";

const SCHEMA_VERSION = "1.0.0";

/**
 * Prediction identity carried BY THE CALLER (D1): the package no longer hard-codes a `predictor_id`
 * or a `task_class` — the caller (e.g. the harness, at U-2b/U-4) owns those strings, so `@monark/ukemi`
 * ships no `internal:*` predictor and no served class.
 */
export interface PredictionMeta {
  readonly predictorId: string;
  readonly taskClass: string;
}

/**
 * Emits a point prediction (the estimated liquidable amount, target A) as `yhat:number`.
 * It is a point that HIKAE will conformalize into an `interval` region in Phase 2 — UKEMI does
 * NOT emit a region or a guarantee. `predictorId`/`taskClass` are supplied by the caller (`meta`).
 */
export function emitPrediction(yhat: number, producedAt: string, meta: PredictionMeta): Prediction {
  return {
    schema_version: SCHEMA_VERSION,
    task_class: meta.taskClass,
    yhat,
    predictor_id: meta.predictorId,
    produced_at: producedAt,
  };
}

/** Canonical serialization (frozen contract) — throws on an unknown/forbidden key at any depth. */
export function serialize(p: Prediction): string {
  return serializePrediction(p);
}
