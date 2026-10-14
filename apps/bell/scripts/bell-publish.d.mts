// apps/bell/scripts/bell-publish.d.mts -- type surface of bell-publish.mjs (TS7016 sidecar, precedent bell-report.d.mts) so the
// type-checked oracle imports the runtime module without executing its CLI (run-guarded). Runtime = bell-publish.mjs.
import type { KeyObject } from "node:crypto";
import type { Bounds } from "./bell-validate.mjs";

export type { RefusalCode, Bounds, Shape } from "./bell-validate.mjs";
export { REFUSAL_CODES, BellPublishError, BOUNDS, WHITELIST, NOT_SERVED, KEY_SHAPES } from "./bell-validate.mjs";
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
