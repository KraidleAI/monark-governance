// scripts/probe-dojo-live.d.mts -- type surface of scripts/probe-dojo-live.mjs (DOJO-LIVE-HEALTH-1, ADR-DOJO-PR-4 PL-3) for the root
// test test/probe-dojo-live.test.ts; Node ignores this file; eslint ignores **/*.d.mts. Declares the exported surface only.
import type { VerifyBounds } from "../apps/dojo/scripts/dojo-verify.mjs";
import type { AlertError } from "./probe-narabi.mjs";

export const SCHEMA: number;
export const DEFAULT_PROXY: string;
export const DEFAULT_HOST: string;
export const DEFAULT_OUT: string;
export const DEFAULT_VERIFIER: string;
export const DEFAULT_KEYRING: string;
export const DEFAULT_SMTP_PASS_FILE: string;
export const SMTP_PASS_MAX_BYTES: number;
export const DOJO_PROBE_TREE_ROOT: string;
export const DOJO_PROBE_TREE_PATHS: readonly string[];
export const DEADLINE_UTC: string;
export const DEADLINE_UTC_MINUTES: number;
export const REREAD_DELAY_MS: number;
export const VERIFIER_HEAP_MIB: number;
export const VERIFIER_TIMEOUT_MS: number;
export const VERIFIER_ENV: readonly string[];
export const EDGE_ADMITTED: readonly string[];
export const DOJO_LIVE_REASONS: readonly DojoLiveReason[];
export const DOJO_LIVE_KEYS: readonly string[];

/** The closed reasons of dojo-live.json, in their precedence; null = healthy. */
export type DojoLiveReason =
  | "probe_error" | "insecure_url" | "bad_port" | "secret_in_environment" | "unreachable" | "timeout" | "too_large" | "timeline_malformed"
  | "proxy_timeline_differs" | "proxy_lines_differs" | "proxy_not_no_store" | "edge_cache_status" | "verifier_timeout"
  | "verifier_refused" | "verifier_timeline_differs" | "lag";

/** dojo-live.json (schema 1): the probe writes exactly these keys, in DOJO_LIVE_KEYS order. */
export interface DojoLiveState {
  schema: number;
  checked_at: string;
  status: "healthy" | "unhealthy";
  reason: DojoLiveReason | null;
  side: "host" | "proxy" | null;
  reread: boolean;
  head_seq: number | null;
  head_day: string | null;
  expected_day: string;
  lag_days: number | null;
  timeline_sha256: string | null;
  lines_sha256: string | null;
  no_store: boolean | null;
  cf_cache_status_timeline: string | null;
  cf_cache_status_lines: string | null;
  verifier_exit: number | null;
  verifier_reason: string | null;
  alerted: boolean;
  alert_error: AlertError | null;
  last_alert_day: string | null;
}

/** Inputs of one run; the CLI sets the first seven (parseArgs), the tests the others (never the environment nor the argv). */
export interface DojoProbeOpts {
  proxy?: string; host?: string; keyring?: string; verifier?: string; out?: string; now?: string; smtpPassFile?: string;
  bounds?: VerifyBounds; verifierTimeoutMs?: number; sleep?: (ms: number) => Promise<void>; env?: Record<string, string | undefined>;
}

export function expectedDay(nowIso: string): string;
/** The SMTP password of the file at `path`, or null (absent, a link, too large, not one non-empty line, or open to group or others). */
export function readSmtpPass(path: string): string | null;
export function readPriorAlert(out: string): { alerted: boolean; last_alert_day: string | null };
export function composeDojoMail(input: { from: string; to: string; kind: "alert" | "reminder" | "recovery"; state: DojoLiveState }):
  { subject: string; message: string };
export function parseArgs(argv: readonly string[]): Partial<Record<"proxy" | "host" | "keyring" | "verifier" | "out" | "now" | "smtpPassFile", string>>;
export function probe(opts?: DojoProbeOpts): Promise<{ state: DojoLiveState; exitCode: number }>;
