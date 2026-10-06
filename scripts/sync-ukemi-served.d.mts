// scripts/sync-ukemi-served.d.mts - type surface of the pure functions scripts/sync-ukemi-served.mjs exports (behind a
// run-guard), so the type-checked root test test/site-ukemi.test.ts can derive the served facts from IN-PROCESS bodies
// exactly as the sync does, WITHOUT running the network CLI. Runtime implementation = sync-ukemi-served.mjs; Node ignores
// this file. Governance-only (record-u4b-calib.d.mts precedent), NOT whitelisted for public export.
export const API_HOST: string;
export const OPENAPI_PATH: string;
export const GATE_PATH: string;
export const OUT_REL: string;
export const MANIFEST_REL: string;
export const SCHEMA: string;
export const COMMENT: string;
export const PENDING_REL: string;
export const PENDING_SCHEMA: string;
export const PENDING_COMMENT: string;
/** The deploy check's own liq request body: the same object as scripts/verify-harness.mjs GATE_LIQ_BODY (imported and
 *  re-exported by the sync, never copied). */
export const GATE_LIQ_BODY: {
  prediction: { schema_version: string; task_class: string; yhat: number; predictor_id: string; produced_at: string };
  params: { remainingBudget: number; bFloor: number; tau: number; tauInterval: number; alpha: number; nMin: number; intent: number; tool: string; clockOpen: boolean };
};
export const LIQ_CLAUSES: Readonly<{ empty: string; committed: string }>;
export interface ServedFacts { registry_state: "empty" | "committed"; liq_clause: string; cascade_uncalibrated_sentence_served: boolean }
export interface VerdictFacts {
  path: string; stratum: number; verdict_reason: "covered" | "under_calib"; served_alpha: number; calibration_points: number;
  bound_margin_base: string | null; calibration_digest: string; interior_rank_min_n: number;
}
export interface ServedVerdictFacts extends VerdictFacts { body_sha256: string }
/** The pending snapshot --pending writes (schema monark-site-ukemi-pending-v1). */
export interface UkemiPendingFile extends ServedFacts {
  $comment: string; schema: string; written_at: string; served_class: string; liq_verdict: VerdictFacts;
}
/** Derive the served facts from the OpenAPI body (pure). Throws on any check. */
export function servedFacts(openapiText: string): ServedFacts;
/** Smallest n whose conformal rank ceil((n+1)(1-alpha)) is below n; alpha must be 1/k. */
export function interiorRankMinN(alpha: number): number;
/** Derive the verdict facts from a /gate answer, checked against the state and this tree's registry (no deploy check). */
export function verdictFactsOf(gateText: string, registryState: string): VerdictFacts;
/** Derive the served verdict facts from the /gate answer, checked against the state, this tree's registry and the deploy
 *  check record (`caText`, docs/deploy-CA-harness.json: its gate_liq_call record must be green and carry the sha256 of `gateText`). */
export function servedVerdictFacts(gateText: string, registryState: string, caText: string): ServedVerdictFacts;
/** Set `rel` -> `sha` in the manifest text, refusing if the JSON round-trip would change any other byte. */
export function setManifestEntry(manifestText: string, rel: string, sha: string): string;
/** Remove `rel` from the manifest text: exactly one line goes; an absent entry or a non-canonical manifest is refused. */
export function removeManifestEntry(manifestText: string, rel: string): string;
/** The shared fields on which a new served file differs from the pending snapshot, plus a schema or a key it may not carry. */
export function ukemiPendingDiff(served: Record<string, unknown>, pending: Record<string, unknown>): string[];
/** The pending snapshot of the in-process harness's answers to the sync's two requests (no network). */
export function inProcessUkemiPending(writtenAt: string): Promise<UkemiPendingFile>;
/** T0-TOOLING-1: --pending under `root` (pending file, pending_since, both manifest entries); returns the pending entry. */
export function writeUkemiPending(root: string, writtenAt: string): Promise<string>;
/** The served file's text with pending_since after read_at, no other byte touched; kept when already set. */
export function markPendingSince(text: string, day: string): string;
/** Why the ukemi promotion may not run yet under `root` (the harness pending snapshot still exists), or null. */
export function promotionBlocked(root: string): string | null;
