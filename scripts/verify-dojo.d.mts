// scripts/verify-dojo.d.mts -- type surface of scripts/verify-dojo.mjs (TS7016 sidecar, precedent scripts/verify-bell.d.mts), so that
// the type-checked root test test/verify-dojo.test.ts runs the CA in process, without its CLI. Runtime = verify-dojo.mjs; Node ignores
// this file. Governance-only: neither file is whitelisted for the public export.
/** PB-3 (1): the closed list of names the verifier child receives, taken by name from the CA's environment. */
export const DOJO_CA_CHILD_ENV: readonly string[];
/** PB-3 (2): the names c07 refuses in the CA's own environment (case ignored). */
export const DOJO_CA_TLS_FAMILY: RegExp;
/** The child's time bound T (DOJO-VERIFY-SCALE-1). */
export const DOJO_CA_TIMEOUT_MS: number;
/** c08: the paths that must answer non-200. */
export const DOJO_CA_PROBES: readonly string[];
/** c09: the four units of the host (repository paths). */
export const DOJO_CA_UNITS: readonly string[];
/** The capture files of --loaded-config, each hashed into inputs_sha256. */
export const DOJO_CA_CAPTURES: readonly string[];
export interface DojoCaCheck { name: string; pass: boolean; detail: string }
/** DOJO-CA-FORMAT-1 with DOJO-CA-BODY-KEYS-1: the nine closed keys. */
export interface DojoCa {
  schema: string;
  url: string | null;
  g7: string;
  checks: DojoCaCheck[];
  tls: { authorized: boolean };
  head: { seq: unknown; day: unknown; lines_sha256: string | null; lines_count: number | null; recomputed_root: string | null } | null;
  history: { history_sha256: string | null; history_lines_count: number | null; history_root: string | null } | null;
  bodies_sha256: Record<string, string | null>;
  inputs_sha256: Record<string, string | null>;
}
export interface DojoCaDeps {
  tlsProbe?: (host: string, port: number) => Promise<{ authorized?: boolean }>;
  env?: Readonly<Record<string, string | undefined>>;
  execArgv?: readonly string[];
}
export type DojoCaResult = { code: 0 | 1; ca: DojoCa; out: string | null } | { code: 2; ca: null; usage: string };
/** One CA run: argv as the CLI's; `deps` replaces the TLS observation, the environment and execArgv of the CA (tests only). */
export function runCa(argv: readonly string[], deps?: DojoCaDeps): Promise<DojoCaResult>;
