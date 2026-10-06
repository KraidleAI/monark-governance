/**
 * HIKAE — `CoverageVerdict` assembly (ADR-M002 D5; frozen Phase 0 contract, ADR-M001).
 *
 * `scores_sha256 = scoresSha256(scores)` over the scores IN THE ORDER GIVEN (contract 1.1.0; never sorted here); the
 * five cell fields come from the caller in one `cell` parameter, copied as given. Serialized by `serializeVerdict` (closed-check + recursive
 * guard against forbidden keys). No timestamp read here: `produced_at` is INJECTED
 * (hash stability).
 *
 * `abstain` semantics (DECLARED): `abstain = 1{|C| > tau or |C| = 0}` in the gate sense (Grok doc 11
 * §4 step 3) — a DEFER carries a verdict `{ abstain: true }`, which makes the
 * "abstention (tau=1)" column of the S2 journal recalculable without trusting HIKAE. `verdict.reason`
 * reflects the coverage LEVEL (`covered` / `set_too_large` / `under_calib`, and `intent_not_in_region` for an
 * empty set on the BYO set path, ADR-M005 D5 K-4(d) amendment 2026-09-30, D8); the GATE reason
 * (timeout / budget / clock) lives on `GateDecision.reason` (the sole gate-level truth).
 *
 * No region (contract 1.1.0, `noRegionVerdict`): `region: null`, `qhat: null`, `abstain=true`; under-calibration is one.
 */
import type { CoverageVerdict, CoverageReason, Method, PredictionRegion, QhatUnit } from "@monark/contracts";
import { scoresSha256, serializeVerdict } from "@monark/contracts";

/** The five cell fields of a 1.1.0 verdict (spec section 5), resolved by the caller (table lookup, or BYO). */
export interface VerdictCell { qhatUnit: QhatUnit; scale: number | null; cellKey: string | null; policyRowSha256: string | null; policyTableSha256: string | null }

export interface VerdictParams {
  taskClass: string;
  method: Method;
  alpha: number;
  /** CALIBRATION scores in their declared order (n_calib = their count); basis of scores_sha256. */
  scores: readonly number[];
  region: PredictionRegion | null;
  qhat: number | null;
  abstain: boolean;
  reason: CoverageReason;
  residual: readonly string[];
  producedAt: string;
  schemaVersion: string;
  cell: VerdictCell;
  /** Include `scores` on the wire (optional payload); off by default (identified by scores_sha256). */
  includeScores?: boolean;
}

/** Assembles a frozen `CoverageVerdict` (n_calib = scores.length; scores_sha256 over the declared order). */
export function buildVerdict(params: VerdictParams): CoverageVerdict {
  return {
    schema_version: params.schemaVersion,
    task_class: params.taskClass,
    method: params.method,
    alpha: params.alpha,
    n_calib: params.scores.length,
    region: params.region,
    qhat: params.qhat,
    qhat_unit: params.cell.qhatUnit,
    scale: params.cell.scale,
    abstain: params.abstain,
    reason: params.reason,
    residual: [...params.residual],
    scores_sha256: scoresSha256(params.scores),
    cell_key: params.cell.cellKey,
    policy_row_sha256: params.cell.policyRowSha256,
    policy_table_sha256: params.cell.policyTableSha256,
    produced_at: params.producedAt,
    ...(params.includeScores ? { scores: [...params.scores] } : {}),
  };
}

/** Parameters of a verdict without region: those of `buildVerdict` less region, qhat, abstain and reason. */
export type NoRegionParams = Omit<VerdictParams, "region" | "qhat" | "abstain" | "reason">;

/** Verdict without region (spec sections 5, 6): `region: null`, `qhat: null`, `abstain=true`, `reason`; digest over the AVAILABLE scores. */
export function noRegionVerdict(reason: CoverageReason, params: NoRegionParams): CoverageVerdict {
  return buildVerdict({ ...params, region: null, qhat: null, abstain: true, reason });
}

/** Under-calibration verdict (D5): `noRegionVerdict("under_calib", …)`. */
export function underCalibVerdict(params: NoRegionParams): CoverageVerdict {
  return noRegionVerdict("under_calib", params);
}

/** Canonical serialization (frozen contract): closed-check + recursive guard against forbidden keys. */
export function serialize(verdict: CoverageVerdict): string {
  return serializeVerdict(verdict);
}
