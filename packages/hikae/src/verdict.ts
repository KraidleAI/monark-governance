/**
 * HIKAE — `CoverageVerdict` assembly (ADR-M002 D5; frozen Phase 0 contract, ADR-M001).
 *
 * `calib_digest = calibDigest(scores)` — recalculability BY REFERENCE (ADR-M001 C5),
 * cross-language deterministic. Serialized by `serializeVerdict` (closed-check + recursive
 * guard against forbidden keys). No timestamp read here: `produced_at` is INJECTED
 * (hash stability).
 *
 * `abstain` semantics (DECLARED): `abstain = 1{|C| > tau}` in the gate sense (Grok doc 11
 * §4 step 3) — a DEFER carries a verdict `{ abstain: true }`, which makes the
 * "abstention (tau=1)" column of the S2 journal recalculable without trusting HIKAE. `verdict.reason`
 * reflects the coverage LEVEL (`covered` / `set_too_large` / `under_calib`); the GATE reason
 * (timeout / budget / clock) lives on `GateDecision.reason` (the sole gate-level truth).
 *
 * Under-calibration (D5): EMPTY `set` region (labels `[]`), `abstain=true`, `qhat=null`
 * (the contract requires the `qhat` key present; `null` under `exactOptionalPropertyTypes`).
 */
import type { CoverageVerdict, CoverageReason, Method, PredictionRegion } from "@monark/contracts";
import { calibDigest, serializeVerdict } from "@monark/contracts";
import { buildSetRegion, BTC_DIR_LABEL_SCHEMA } from "./region.ts";

export interface VerdictParams {
  taskClass: string;
  method: Method;
  alpha: number;
  /** CALIBRATION scores (n_calib = their count); basis of calib_digest. */
  scores: readonly number[];
  region: PredictionRegion;
  qhat: number | null;
  abstain: boolean;
  reason: CoverageReason;
  residual: readonly string[];
  producedAt: string;
  schemaVersion: string;
  /** Include `scores` on the wire (optional payload); off by default (recomputed via calib_digest). */
  includeScores?: boolean;
}

/** Assembles a frozen `CoverageVerdict` (n_calib = scores.length; calib_digest recalculable). */
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
 * Under-calibration verdict (D5): EMPTY `set` region, `abstain=true`, `qhat=null`,
 * `reason=under_calib`. The digest is still computed over the AVAILABLE scores (by reference).
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

/** Canonical serialization (frozen contract): closed-check + recursive guard against forbidden keys. */
export function serialize(verdict: CoverageVerdict): string {
  return serializeVerdict(verdict);
}
