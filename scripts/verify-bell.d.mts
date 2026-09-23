// scripts/verify-bell.d.mts -- type surface of scripts/verify-bell.mjs (TS7016 sidecar, precedent scripts/grep-forbidden.d.mts) so
// the type-checked root tests import the CA without executing its CLI (run-guard). Runtime = verify-bell.mjs; Node ignores this file.
export const CHECK_NAMES: readonly string[];
export const BELL_TREE_PATHS: readonly string[];
export const UNIT_NAME: string;
export const UNIT_INSTALLED: string;
export const CADDY_DEDICATED: string;
export const BELL_ROOT_REDIRECT: string;
export const PRIVATE_SHAPES: readonly RegExp[];
export interface TlsObservation { host: string; authorized?: boolean; skipped?: boolean; reason?: string; issuer?: string | null; valid_to?: string | null; error?: string }
export interface CaCheck { name: string; ok: boolean; detail: string }
export interface Ca {
  schema: "bell-deploy-ca-v1";
  url: string;
  g7: string;
  checked_at: string;
  keyring_sha256: string;
  bell_verify_sha256: string | null;
  checks: CaCheck[];
  tls: TlsObservation;
  content_types: Record<string, string | null>;
}
export interface CaDeps {
  tlsProbe?: (host: string, port: number) => Promise<TlsObservation>;
  gitBlob?: (repo: string, rev: string, path: string) => Buffer;
}
export type CaResult = { code: 0 | 1; ca: Ca; out: string | null } | { code: 2; ca: null; usage: string };
export function runCa(argv: readonly string[], deps?: CaDeps): Promise<CaResult>;
export function gitBlob(repo: string, rev: string, path: string): Buffer;
export function parseDigests(text: string): Map<string, string> | null;
export function parseSystemctlCat(text: string): { headers: { index: number; path: string }[]; fragment: string };
