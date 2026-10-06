// apps/dojo/scripts/dojo-verify.d.mts -- type surface of dojo-verify.mjs (TS7016 sidecar, precedent dojo-chain.d.mts) so the
// type-checked tests import the runtime module. Runtime = dojo-verify.mjs.
import type { Break, Trust } from "../../bell/scripts/bell-chain.mjs";

/** The closed list of ADR-DOJO-SNAPSHOT-1 D-10 (l.252), 45 codes, in its order. */
export const DOJO_VERIFY_REFUSALS: readonly string[];
/** The 18 closed keys of a success report, in canonical order (ADR-DOJO-PR-1B-4 D-3). */
export const DOJO_VERIFY_REPORT_KEYS: readonly string[];
export class DojoVerifyError extends Error {
  code: string;
  seq: number | null;
  day: string | null;
  detail: string;
  constructor(code: string, seq: number | null, day: string | null, detail: string);
}
export interface VerifyBounds { readonly MAX_BODY_BYTES: number; readonly MAX_LINE_BYTES: number; readonly TIMEOUT_MS: number;
  readonly MAX_FILES: number; readonly MAX_TOTAL_BYTES: number }
export const VERIFY_BOUNDS: VerifyBounds;
export interface Source { get(rel: string): Promise<Buffer> }
export function dirSource(root: string, bounds?: VerifyBounds): Source;
/** A day YYYY-MM-DD of the calendar: the one rule of the day, read by the CLI for --day (ADR-DOJO-PR-1B-5 PLI-1). */
export const dayOk: (s: unknown) => boolean;
/** dojo-keyring-v1 -> the trust set of the walker and the validity windows [valid_from_seq, valid_to_seq]; null when malformed. */
export function dojoTrustOf(keyring: unknown): { trust: Trust; windows: Map<string, [number, number]> } | null;
/** readJson of dojo-chain.mjs, re-exported for the CLI: JSON.parse of a served text within the depth bound, else null. */
export function readJson(text: string): unknown;
export function checkInclusion(line: string, index: number, count: number, path: readonly string[], root: string): void;
export interface Inclusion { address: string; index: number; count: number; line: string; proof: string[] }
/** The snapshot of --day (D-2): its line and its recomputed root. */
export interface Target { seq: number; day: string; lines_sha256: string; lines_count: number; recomputed_root: string }
/** A success's detail is null from verifyDojoServed; the CLI writes there the TLS variables of --url (D-3, T-9 amended). */
export type DojoVerifyReport = { ok: true; reason: null; seq: number; day: string | null; detail: string | null;
  status: "consistent_with_supplied_keyring" | "self_consistent_only"; trust_root: "supplied_keyring" | "served_keyring";
  active_key_id: string | null; voided_lines: number[]; breaks: Break[]; snapshots: number;
  head: { seq: number; lines_sha256: string; lines_count: number; recomputed_root: string } | null;
  history: { history_sha256: string; history_lines_count: number; recomputed_root: string } | null;
  inclusion: Inclusion | null; target: Target | null; timeline_sha256: string; beacon_bls_verified: false; scope: string }
  | { ok: false; reason: string; seq: number | null; day: string | null; detail: string };
export function verifyDojoServed(opts: { source: Source; keyring?: unknown; address?: string | null; day?: string | null;
  bounds?: VerifyBounds }): Promise<DojoVerifyReport>;
