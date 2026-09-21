// scripts/record-u4b-calib.d.mts — type surface for the pure generator function that
// scripts/record-u4b-calib.mjs exports (behind a run-guard). It lets the type-checked test import
// buildRegistryEntries WITHOUT executing the recorder. Runtime implementation = record-u4b-calib.mjs; Node
// ignores this file. Governance-only (record-usde-calib.d.mts precedent), NOT whitelisted for public export.
export interface U4bRegistryEntry {
  strate: number; predictor_id: string; task_class: string; alpha: number; n_min: number;
  n: number; p: number | null; qhat: number | null; scale: string; calib_digest: string;
  under_calib: boolean; scores: number[];
}
/** PURE (C-9): class-A score rows → one CommittedCalibration entry per Mondrian stratum. Base-8dec bigint scores
 *  are scaled by `scale` (exact division required) and bounded by 2^53 (fail-closed); q̂ = ⌈(n+1)(1−α)⌉-th
 *  smallest; calib_digest = calibDigest (float64_be sorted, C5). under_calib for n < nMin. Class A only
 *  (decision 108). */
export function buildRegistryEntries(
  rowsA: ReadonlyArray<{ strate: number | string; score: string; [k: string]: unknown }>,
  opts?: { scale?: bigint; predictorBase?: string | undefined },
): U4bRegistryEntry[];
/** --scores path — REQUIRED, no e2 default (C-G2-1). Throws if absent. */
export function resolveScoresPath(argv: readonly string[]): string;
