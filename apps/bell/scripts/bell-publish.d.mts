// apps/bell/scripts/bell-publish.d.mts -- type surface of bell-publish.mjs (TS7016 sidecar, precedent bell-report.d.mts) so the
// type-checked oracle imports the runtime module without executing its CLI (run-guarded). Runtime = bell-publish.mjs.
import type { KeyObject } from "node:crypto";

export type RefusalCode = "inbox_not_exactly_one_bundle" | "too_many_runs" | "input_too_large" | "schema_mismatch" | "unknown_field"
  | "bell_sha_mismatch" | "close_like_field" | "session_not_yet_publishable" | "run_timeline_broken" | "provenance_binding_mismatch"
  | "url_or_key_shaped_string" | "duplicate_run" | "public_state_too_large" | "line_too_large" | "existing_timeline_corrupt"
  | "signing_key_missing" | "signing_key_not_in_keyring" | "no_timeline" | "key_already_in_keyring" | "revocation_invalid" | "key_file_exists";
export const REFUSAL_CODES: readonly RefusalCode[];
export class BellPublishError extends Error {
  readonly code: RefusalCode;
  readonly detail: string;
  constructor(code: RefusalCode, detail: string);
}
export interface Bounds {
  MAX_RUNS: number;
  MAX_INPUT_FILE_BYTES: number;
  MAX_PUBLIC_STATE_BYTES: number;
  MAX_LINE_BYTES: number;
}
export const BOUNDS: Readonly<Bounds>;
/** "scalar" | "scalar[]" | "<object name>" | ["<object name>"] */
export type Shape = string | readonly [string];
export const WHITELIST: Readonly<Record<string, Readonly<Record<string, Shape>>>>;
export const NOT_SERVED: Readonly<Record<string, Readonly<Record<string, Shape>>>>;
export const KEY_SHAPES: readonly RegExp[];
export interface DurableFs {
  openSync: (path: string, flags: "w" | "a") => number;
  writeSync: (fd: number, data: string) => void;
  fsyncSync: (fd: number) => void;
  closeSync: (fd: number) => void;
  renameSync: (from: string, to: string) => void;
  fsyncDir: (dir: string) => void;
}
export const DURABLE_FS: DurableFs;
export interface PublishResult {
  status: "published" | "nothing_to_publish";
  seq: number;
  published_at: string;
  state_sha256: string;
  provenance_sha256: string;
  line_hash: string;
}
export function publishToDir(opts: {
  inboxDir: string;
  stateDir: string;
  privateKey: KeyObject;
  clock: () => number;
  bounds?: Partial<Bounds>;
  fs?: DurableFs;
}): PublishResult;
/** S-6 (ADR D9): the summary of a key line (rotation: key_id = the new key; revocation: the signing key). */
export interface KeyLineResult { status: "rotated" | "revoked"; seq: number; published_at: string; key_id: string; line_hash: string }
export function rotateKey(opts: { stateDir: string; oldKey?: KeyObject | null; newKey: KeyObject; clock: () => number; fs?: DurableFs }): KeyLineResult;
export function revokeKey(opts: { stateDir: string; key: KeyObject; revokedKeyId: string; revokedFromSeq: number; clock: () => number; fs?: DurableFs }): KeyLineResult;
/** Public part only: {key_id, jwk}; the PKCS#8 PEM goes to `path` (0600, never overwritten). */
export function generateKey(path: string, fs?: DurableFs): { key_id: string; jwk: { kty: "OKP"; crv: "Ed25519"; x: string } };
/** The CLI body: returns the exit code (0 or 1). */
export function runCli(argv: readonly string[]): number;
