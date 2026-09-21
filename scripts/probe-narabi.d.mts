// scripts/probe-narabi.d.mts — type surface for scripts/probe-narabi.mjs (ADR-NARABI-OPS-1 -1b-ii-a). Lets the
// root type-checked test (test/probe-narabi.test.ts) import the pure functions WITHOUT a TS7016, staying off
// the deferred-typing ratchet (eslint ignores **/*.mjs and **/*.d.mts; tsc reads this sidecar). Runtime
// implementation = probe-narabi.mjs; Node ignores this file. Declares only the exported surface (English).
import type { TimelineLine } from "../apps/sentinel/src/timeline.ts";

export const SCHEMA: number;
export const DEFAULT_URL: string;
export const DEFAULT_OUT: string;
export const DEADLINE_UTC: string;
export const DEADLINE_UTC_MINUTES: number;
export const DEFAULT_TIMEOUT_MS: number;
export const DEFAULT_MAX_BYTES: number;
export const DEFAULT_RETRIES: number;
export const MAX_TIMEOUT_MS: number;
export const MAX_MAX_BYTES: number;
export const MAX_RETRIES: number;
export const START_MARGIN_MS: number;
export const CHAINSTACK_PROVIDERS: readonly string[];

// ── -1b-ii-a (ALERT): SMTP conversation bounds ────────────────────────────────────────────────
/** Hard cap on the SINGLE global deadline for the WHOLE SMTP conversation (env SMTP_DEADLINE_MS clamps to this). */
export const MAX_SMTP_DEADLINE_MS: number;
export const DEFAULT_SMTP_DEADLINE_MS: number;
/** Total byte cap on all SMTP responses in one conversation (a misbehaving/drip server can never fill memory). */
export const SMTP_MAX_BYTES: number;

/** narabi.json reason (DETECTION sub-lot; -1b-ii-b adds state_mismatch/state_unreachable). `null` = healthy. */
export type ProbeReason =
  | "lag" | "chain_broken" | "unreachable" | "too_large" | "insecure_url" | "probe_error" | null;

/** The CLOSED set of alert-send outcomes recorded in narabi.json (-1b-ii-a, C-B-1). NEVER a raw server line. */
export type AlertError =
  | "smtp_unconfigured" | "smtp_unreachable" | "smtp_timeout"
  | "smtp_tls_failed" | "smtp_auth_failed" | "smtp_rejected";

/** narabi.json shape (schema 2, DETECTION + ALERT): the probe writes exactly this. */
export interface NarabiState {
  schema: number;
  checked_at: string;
  last_day: string | null;
  lag_days: number | null;
  chain_ok: boolean;
  reachable: boolean;
  chainstack_present: boolean;
  provider: string | null;
  status: "healthy" | "unhealthy";
  reason: ProbeReason;
  publish_latency: number | null;
  // -1b-ii-a alert state machine (schema 2):
  alerted: boolean;
  alert_error: AlertError | null;
  last_alert_day: string | null;
  state_checked: boolean; // always false in -a (the 2nd GET cross-check lands in -1b-ii-b)
}

export function providerOf(url: string): string;
export function chainstackPresent(endpoints: readonly string[] | undefined): boolean;
export function chainstackProviderOf(endpoints: readonly string[] | undefined): string | null;
export function hashedFieldsOf(l: TimelineLine): unknown[];
export function lineHashOf(l: TimelineLine): string;
export function addDaysUTC(day: string, n: number): string;
export function dayDiff(a: string, b: string): number;
export function expectedLastDay(nowIso: string): string;
export function publishLatencySec(nowIso: string): number;
export function parseTimeline(text: string): TimelineLine[];
export function checkChain(lines: readonly TimelineLine[]): { ok: boolean; at: number };
export function isLoopbackHost(hostname: string): boolean;

export type TransportDecision = { ok: true } | { ok: false; reason: "insecure_url" };
export function urlTransportAllowed(url: string): TransportDecision;

export interface FetchOpts { timeoutMs?: number; maxBytes?: number; retries?: number }
export type FetchResult = { ok: true; text: string } | { ok: false; reason: "unreachable" | "too_large" | "insecure_url" };
export function fetchTimeline(url: string, opts?: FetchOpts): Promise<FetchResult>;

export interface TransportBounds { timeoutMs: number; maxBytes: number; retries: number }
export function transportBounds(env?: Record<string, string | undefined>): TransportBounds;

export interface EvaluateInput { text: string | null; nowIso: string; reachable: boolean; fetchReason?: string }
export function evaluate(input: EvaluateInput): NarabiState;

// ── -1b-ii-a (ALERT): state read, content composition, SMTP transport ─────────────────────────
/** The persisted alert bit read back from narabi.json at `out`. Absent/corrupt/non-schema-2/inconsistent
 *  (alerted:true with last_alert_day:null) or schema-1 (deployed -1b-i) all bootstrap to alerted:false (C-B-5). */
export function readPriorState(out: string): { alerted: boolean; last_alert_day: string | null };

/** Whitelist a remote-carried field to printable ASCII, length-bounded — the CR/LF injection guard (C-B-3). */
export function sanitizeField(s: unknown): string;
/** RFC-5322-form validation of ALERT_TO/ALERT_FROM (else smtp_unconfigured, C-NB-8). */
export function isEmailish(s: unknown): boolean;

export interface MailFacts {
  from: string; to: string; nowIso: string;
  kind: "alert" | "reminder" | "recovery";
  status: string; reason: string | null; last_day: string | null; lag_days: number | null;
  chainstack_present: boolean; provider: string | null; checked_at: string;
}
/** Build the full RFC-822 message (deterministic Date under nowIso; constant Subject, C-7). Body carries the
 *  sanitized remote `last_day`; no secret, no key-bearing URL, no forbidden vocab (C-NB-8, fact 12). */
export function composeMail(facts: MailFacts): { subject: string; message: string };
/** DATA wire-encoding: CRLF line endings + dot-stuffing + the `.` terminator (C-B-4). Pure, exported for its test. */
export function encodeData(message: string): string;

export interface TlsConnectOptions { minVersion: string; rejectUnauthorized: boolean; servername?: string }
export function tlsConnectOptions(host: string): TlsConnectOptions;
export type SmtpTransportPlan =
  | { connector: "tls"; options: TlsConnectOptions }
  | { connector: "net" }
  | { connector: "refuse"; error: AlertError };
/** Route by host+mode: implicit TLS everywhere; plaintext on loopback ONLY; SMTP_TLS=none off-loopback = refuse
 *  WITHOUT a connection (same guard as http-loopback) (C-B-8). */
export function smtpTransportPlan(host: string, tlsMode: string): SmtpTransportPlan;
/** Map a connect-phase error to the closed AlertError set: network codes -> unreachable; else (SSL) -> tls_failed. */
export function classifyConnectError(err: unknown): AlertError;

export interface SendSmtpInput {
  host: string; port: number; tls: string; user: string; pass: string;
  from: string; to: string; message: string; deadlineMs: number; maxBytes?: number;
}
/** Run one bounded SMTP conversation over built-ins (implicit TLS 465, AUTH PLAIN/LOGIN negotiated from EHLO).
 *  Returns a CLOSED-set error, NEVER a server line or a secret (C-B-1/2/8). */
export function sendSmtp(input: SendSmtpInput): Promise<{ ok: true } | { ok: false; error: AlertError }>;

export interface ProbeOpts {
  file?: string; now?: string; url?: string; out?: string;
  timeoutMs?: number; maxBytes?: number; retries?: number;
}
export function probe(opts?: ProbeOpts): Promise<{ state: NarabiState; exitCode: number }>;
