// apps/bell/scripts/bell-verify.d.mts -- type surface of bell-verify.mjs (TS7016 sidecar, precedent bell-report.d.mts) so the
// type-checked oracle imports the runtime module without executing its CLI (run-guarded). Runtime = bell-verify.mjs.
import type { Break } from "./bell-chain.mjs";

export type VerifyRefusal = "insecure_url" | "redirect_refused" | "http_status" | "unreachable" | "too_large" | "not_json" | "keyring_invalid"
  | "served_key_not_in_keyring" | "timeline_malformed" | "chain_broken" | "rotation_key_not_in_keyring" | "key_not_in_keyring" | "signature_invalid"
  | "key_not_active" | "rotation_malformed" | "revocation_malformed" | "no_publication" | "head_signed_by_revoked_key" | "state_not_bound_by_head"
  | "immutable_mismatch" | "envelope_mismatch" | "bell_sha_mismatch";
export const VERIFY_REFUSALS: readonly VerifyRefusal[];
export class BellVerifyError extends Error {
  readonly code: VerifyRefusal;
  readonly detail: string;
  constructor(code: VerifyRefusal, detail: string);
}
export interface VerifyBounds { MAX_BODY_BYTES: number; MAX_LINE_BYTES: number; TIMEOUT_MS: number }
export const VERIFY_BOUNDS: Readonly<VerifyBounds>;
export function urlAllowed(u: string): boolean;
export interface Source { get(rel: string): Promise<Buffer> }
export function dirSource(root: string, bounds?: VerifyBounds): Source;
export function urlSource(base: string, bounds?: VerifyBounds): Source;
export interface VerifyReport {
  status: "consistent_with_supplied_keyring" | "self_consistent_only";
  trust_root: "supplied_keyring" | "served_keyring";
  lines: number;
  head_seq: number;
  publications: number;
  active_key_id: string;
  voided_lines: number[];
  breaks: Break[];
  scope: string;
}
export function verifyServed(opts: { source: Source; keyring?: unknown; bounds?: VerifyBounds }): Promise<VerifyReport>;
/** The CLI body: resolves to the exit code (0 or 1). */
export function runVerifyCli(argv: readonly string[]): Promise<number>;
