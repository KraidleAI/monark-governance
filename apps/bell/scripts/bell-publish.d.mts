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
/** The key_rotation line of the rotation in two steps (PLAN-P5 C5-4): the draft's fields and sig_new; the cosign adds sig. */
export interface RotationLine {
  schema: "bell-timeline-v1"; seq: number; kind: "key_rotation"; published_at: string; prev_line_hash: string; key_id: string;
  new_key: { kty: "OKP"; crv: "Ed25519"; x: string }; new_key_id: string; sig_new: string; sig?: string;
}
/** --rotate-draft: the line on the head of the state, signed sig_new by the new key; writes nothing. */
export function rotateDraft(opts: { stateDir: string; newKey: KeyObject; clock: () => number }): RotationLine;
/** --rotate-cosign: the drafted line checked against the head and sig_new, then signed sig by the old (active) key; writes nothing. */
export function rotateCosign(opts: { stateDir: string; oldKey: KeyObject; line: unknown }): RotationLine & { sig: string };
/** --rotate-commit: the cosigned line checked (head, sig_new, sig), then committed; no key. */
export function rotateCommit(opts: { stateDir: string; line: unknown; fs?: DurableFs }): KeyLineResult;
/** The record publish.lock holds (PLAN-P5 C5-6). */
export interface LockHolder { pid: number; boot_id: string | null; taken_at: string }
/** The verdict on a holder, pure: another boot or a pid that no longer runs is dead; no record is unreadable. */
export function holderVerdict(o: LockHolder | null, boot: string | null, isRunning: (pid: number) => boolean): "owner unreadable" | "not running: --unlock releases it" | "running";
/** --unlock: frees a dead holder and returns its record; a live or unreadable one is refused lock_held; no lock: not_locked. */
export function unlockState(stateDir: string, fs?: DurableFs): { status: "not_locked" } | ({ status: "unlocked" } & LockHolder);
/** Public part only: {key_id, jwk}; the PKCS#8 PEM goes to `path` (0600, never overwritten). */
export function generateKey(path: string, fs?: DurableFs): { key_id: string; jwk: { kty: "OKP"; crv: "Ed25519"; x: string } };
/** N, the bundles one --handoff call publishes at most (8). */
export const HANDOFF_N: number;
/** One entry of <status>/published.jsonl. */
export interface PublishedEntry { bundle: string; manifest_sha256: string; seq: number; published_at: string }
/** One entry of <status>/refused.jsonl. */
export interface RefusedEntry { bundle: string; manifest_sha256: string; code: string; refused_at: string }
/** The pure choice of one --handoff call: the bundles in order, and the D (YYYY-MM-DD) that stopped the list, or null. */
export function chooseHandoff(opts: {
  names: readonly string[];
  manifests: Readonly<Record<string, string>>;
  published: readonly Pick<PublishedEntry, "bundle">[];
  refused: readonly Pick<RefusedEntry, "bundle" | "manifest_sha256">[];
  start: string;
  n: number;
}): { bundles: { bundle: string; manifest_sha256: string }[]; awaiting: string | null };
/** --handoff-start <D>: the start mark, posted once. */
export function postStartMark(opts: {
  from: string;
  handoffDir: string;
  statusDir: string;
  clock: () => number;
  clockSynced?: () => boolean;
  fs?: DurableFs;
}): { status: "start_mark_posted"; from_unit: string; posted_at: string };
export interface HandoffResult {
  status: "published" | "nothing_to_publish" | "awaiting_unit";
  published: { bundle: string; seq: number; healed?: true }[];
  awaiting_unit?: string;
}
/** --handoff: publishes up to `n` (HANDOFF_N) due bundles of the handoff directory; `privateKey` may be a loader, called after the probe. */
export function publishHandoff(opts: {
  handoffDir: string;
  stateDir: string;
  statusDir: string;
  privateKey: KeyObject | (() => KeyObject);
  clock: () => number;
  clockSynced?: () => boolean;
  bounds?: Partial<Bounds>;
  fs?: DurableFs;
  n?: number;
  exit?: (code: number) => void;
}): HandoffResult;
/** The CLI body: returns the exit code (0 or 1; 64 on a usage error of the --handoff forms). */
export function runCli(argv: readonly string[], deps?: { clockSynced?: () => boolean; clock?: () => number }): number;
