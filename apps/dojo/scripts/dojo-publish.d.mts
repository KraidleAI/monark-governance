// apps/dojo/scripts/dojo-publish.d.mts -- type surface of dojo-publish.mjs (TS7016 sidecar, precedent dojo-seed.d.mts) so the
// type-checked tests import the publisher without executing its CLI. Runtime = dojo-publish.mjs.
import type { KeyObject } from "node:crypto";

/** The publisher's closed list of refusals (outside the verifier's 45 codes). */
export const DOJO_PUBLISH_REFUSALS: readonly string[];
export class DojoPublishError extends Error {
  code: string;
  detail: string;
  constructor(code: string, detail: string);
}
export const BOUNDS: { readonly MAX_LINE_BYTES: number };
/** The closed keys of an anchor request (the anchor line's own fields, read_rule included). */
export const ANCHOR_KEYS: readonly string[];
export interface DurableFs {
  openSync(p: string, flags: string): number;
  writeSync(fd: number, data: string): void;
  fsyncSync(fd: number): void;
  closeSync(fd: number): void;
  renameSync(a: string, b: string): void;
  fsyncDir(dir: string): void;
}
export const DURABLE_FS: DurableFs;
export interface LineResult { status: string; seq: number; published_at: string; key_id: string; line_hash: string }
/** --inbox: nothing_to_publish (the next day is not over, or not closed) or the published day (its snapshot, and its price_version if any). */
export type DayResult = { status: "nothing_to_publish"; day: string }
  | (LineResult & { status: "published"; day: string; lines_sha256: string; lines_count: number; price_version: number | null });
export function publishDay(o: { inboxDir: string; stateDir: string; key: KeyObject; clock: () => number; fs?: DurableFs }): DayResult;
export function publishAnchor(o: { stateDir: string; key: KeyObject; request: unknown; clock: () => number; fs?: DurableFs }): LineResult;
export function rotateKey(o: { stateDir: string; oldKey?: KeyObject | null; newKey: KeyObject; clock: () => number; fs?: DurableFs }): LineResult;
export function revokeKey(o: { stateDir: string; key: KeyObject; revokedKeyId: string; revokedFromSeq: number; clock: () => number;
  fs?: DurableFs }): LineResult;
export function generateKey(path: string, fs?: DurableFs): { key_id: string; public_key: { kty: "OKP"; crv: "Ed25519"; x: string } };
export function runCli(argv: readonly string[]): number;
