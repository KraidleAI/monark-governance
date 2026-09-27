// apps/dojo/scripts/dojo-verify.d.mts -- type surface of dojo-verify.mjs (TS7016 sidecar, precedent dojo-chain.d.mts) so the
// type-checked tests import the runtime module. Runtime = dojo-verify.mjs.
import type { Trust } from "../../bell/scripts/bell-chain.mjs";

/** The closed list of ADR-DOJO-SNAPSHOT-1 D-10 (l.252), 45 codes, in its order. */
export const DOJO_VERIFY_REFUSALS: readonly string[];
export class DojoVerifyError extends Error {
  code: string;
  seq: number | null;
  day: string | null;
  detail: string;
  constructor(code: string, seq: number | null, day: string | null, detail: string);
}
export interface VerifyBounds { readonly MAX_BODY_BYTES: number; readonly MAX_LINE_BYTES: number }
export const VERIFY_BOUNDS: VerifyBounds;
export interface Source { get(rel: string): Promise<Buffer> }
export function dirSource(root: string, bounds?: VerifyBounds): Source;
/** dojo-keyring-v1 -> the trust set of the walker and the validity windows [valid_from_seq, valid_to_seq]; null when malformed. */
export function dojoTrustOf(keyring: unknown): { trust: Trust; windows: Map<string, [number, number]> } | null;
export function checkInclusion(line: string, index: number, count: number, path: readonly string[], root: string): void;
export interface Inclusion { address: string; index: number; count: number; line: string; proof: string[] }
export type DojoVerifyReport = { ok: true; reason: null; seq: number; day: string | null; detail: null;
  status: "consistent_with_supplied_keyring" | "self_consistent_only"; trust_root: "supplied_keyring" | "served_keyring";
  active_key_id: string | null; voided_lines: number[]; snapshots: number;
  head: { seq: number; lines_sha256: string; lines_count: number; recomputed_root: string } | null;
  history: { history_sha256: string; history_lines_count: number; recomputed_root: string } | null;
  inclusion: Inclusion | null; beacon_bls_verified: false; scope: string }
  | { ok: false; reason: string; seq: number | null; day: string | null; detail: string };
export function verifyDojoServed(opts: { source: Source; keyring?: unknown; address?: string | null; bounds?: VerifyBounds }): Promise<DojoVerifyReport>;
export function runVerifyCli(argv: readonly string[]): Promise<number>;
