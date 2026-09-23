// apps/bell/scripts/bell-chain.d.mts -- type surface of bell-chain.mjs (TS7016 sidecar, precedent bell-report.d.mts) so the
// type-checked oracle imports the runtime module without executing a CLI. Runtime = bell-chain.mjs.
import type { KeyObject } from "node:crypto";

export const GENESIS: string;
export const CLOSE_KEY: RegExp;
/** Canonical JSON, byte-equal to apps/bell/src/digest.ts canonical (throws on a non-finite number). */
export function canonical(v: unknown): string;
export function closeLikePath(v: unknown, path?: string): string | null;
export function assertNoCloseLike(v: unknown, path?: string): void;
export function sha256Hex(x: string | Uint8Array): string;
export function lineHash(line: unknown): string;
export type RechainResult = { ok: true } | { ok: false; index: number; reason: "not_an_object" | "prev_line_hash_mismatch" };
export function rechainRunTimeline(lines: readonly unknown[]): RechainResult;
export function signingBytes(line: Readonly<Record<string, unknown>>): Buffer;
export function signLine(line: Readonly<Record<string, unknown>>, privateKey: KeyObject): string;
export function verifyLine(line: unknown, publicKey: KeyObject): boolean;
export function keyIdOf(publicKey: KeyObject): string;
export interface KeyringKey {
  key_id: string;
  jwk: { kty: "OKP"; crv: "Ed25519"; x: string };
  valid_from_seq: number;
  status: string;
}
export interface Keyring {
  schema: "bell-keyring-v1";
  keys: KeyringKey[];
}
export function keyringOf(publicKey: KeyObject, validFromSeq: number): Keyring;
export function publicKeyOfJwk(jwk: { readonly x: string }): KeyObject;
