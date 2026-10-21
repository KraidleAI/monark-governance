// scripts/probe-bell.d.mts -- type surface of scripts/probe-bell.mjs (the Bell probe, PLAN-P4 lot 4a; lot 4b: its OpenTimestamps step, the
// served-state checks, PROBE_FS) and of what it re-exports from scripts/probe-bell-ots.mjs, for the tests that import the probe (RENDU-4a
// section 7.2: the surface is checked against the code by tsc). Node ignores this file; eslint ignores **/*.d.mts. Declares the exported
// surface only.

export const SCHEMA: number;
export const DEFAULT_KEYRING: string;
export const DEFAULT_SMTP_PASS_FILE: string;
export const SMTP_PASS_MAX_BYTES: number;
export const BELL_PROBE_TREE_ROOT: string;
export const BELL_PROBE_TREE_PATHS: readonly string[];
export const FRESHNESS_MARGIN_MIN: number;
export const CALENDAR_FREE_BOUND_H: number;
export const SITE_STATUS_LAG_MIN: number;
export const GET_TIMEOUT_MS: number;
export const MAX_LINE_BYTES: number;
export const SITE_STATUS_MAX_BYTES: number;
export const BELL_PROBE_MAX_NEW_PUBLICATIONS: number;
export const BELL_PROBE_WORST_RUN_MS: number;
export const BELL_PROBE_ALERTS: readonly string[];
export const BELL_PROBE_KEYS: readonly string[];

/** The trust set of a bell-keyring-v1: key_id -> its public x and its revocation marker. */
export type BellProbeTrust = Map<string, { x: string; revoked_from_seq?: number }>;
export type BellProbeWalk = { ok: true; active: string | null; head: Record<string, unknown> | null; voided: number[]; breaks: unknown[] } | { ok: false; seq: number; reason: string };
export function canonicalOf(v: unknown): string;
export function lineHashOf(line: unknown): string;
export function trustOf(keyring: unknown): BellProbeTrust | null;
export function walkLines(lines: readonly unknown[], trust: BellProbeTrust, from?: number): BellProbeWalk;
export function unitEndOf(d: string): number;
export function dueInstantOf(d: string): number;
export function deadlineOf(d: string): number;
export function freshnessOf(nowMs: number, lastEnd: number | null): { due_unit: string | null; due_by_utc: string | null; stale: boolean; bound: boolean };

/** A fetch as the probe calls it (the origins: GET, no redirect followed; the calendars: GET or POST with headers and a body). */
export type BellProbeFetch = (url: string, init?: { method?: string; redirect?: string; headers?: Record<string, string>; body?: Uint8Array; signal?: AbortSignal }) => Promise<Response>;
export interface BellProbeGot { ok: boolean; reason?: string; status: number | null; body?: Buffer }
export type BellProbeGet = (url: string, maxBytes?: number) => Promise<BellProbeGot>;
export function httpTransport(fetchFn: BellProbeFetch): BellProbeGet;
export function compareOrigins(publicOrigin: string, legacyOrigin: string, transport: BellProbeGet): Promise<{ verdict: string; alert: string | null }>;
export function readSmtpPass(path: string): string | null;
export function composeBellMail(a: { from: string; to: string; kind: string; report: BellProbeReport }): string;
export function parseArgs(argv: readonly string[]): { state: string; keyring?: string; smtpPassFile?: string };

/** The file gestures of the probe's atomic write, mutable on purpose (the test seam of BELL-PROBE-ATOMIC-FAULT-1). */
export const PROBE_FS: {
  open: (tmp: string) => number; write: (fd: number, data: string | Uint8Array) => void; fsync: (fd: number) => void; close: (fd: number) => void;
  rename: (a: string, b: string) => void; remove: (p: string) => void; fsyncDir: (dir: string) => void;
};

/** The OpenTimestamps step's counts in bell.json, and the last seq it asked an upgrade for (the next run resumes after it). */
export interface BellProbeOts { lines_stamped: number; lines_unstamped: number; proofs_pending: number; proofs_complete: number; upgrade_after_seq: number }
/** bell.json (schema 1): exactly the keys of BELL_PROBE_KEYS, in that order. */
export interface BellProbeReport {
  schema: number; checked_at: string; status: "healthy" | "unhealthy"; alerts: string[]; served_lines: number | null; kept_lines: number | null;
  new_lines: number | null; head_seq: number | null; head_line_hash: string | null; last_window_end_utc: string | null; due_unit: string | null;
  due_by_utc: string | null; legacy_origin: string | null; site_status: string | null; site_status_since: string | null; alerted: boolean;
  alert_error: string | null; last_alert_day: string | null; ots: BellProbeOts | null;
}
export type BellProbeSmtp = (a: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;
export function runProbe(argv: readonly string[], deps: { clock: () => number; fetch: BellProbeFetch; smtp: BellProbeSmtp }):
  Promise<{ exitCode: number; report: BellProbeReport | null; usage?: string }>;

// ---- re-exported from scripts/probe-bell-ots.mjs ----
export const OTS_AGGREGATORS: readonly string[];
export const OTS_M: number;
export const OTS_MAX_STAMPS: number;
export const OTS_MAX_UPGRADES: number;
export const OTS_TIMEOUT_MS: number;
export const OTS_UNSTAMPED_ALERT_H: number;
export const OTS_PENDING_STALE_H: number;
/** An attestation (its 8-byte tag in hex, its payload; the URI of a pending one, the height of a block one) and a timestamp tree node. */
export interface OtsAttestation { tag: string; payload: Buffer; uri: string | null; height: number | null }
export interface OtsNode { msg: Buffer; atts: OtsAttestation[]; ops: Array<{ tag: number; arg: Buffer | null; node: OtsNode }> }
export function readProof(buf: Uint8Array): OtsNode;
export function writeProof(root: OtsNode): Buffer;
export function isComplete(root: OtsNode): boolean;
export function whitelisted(uri: string): boolean;
export function manifestOf(kept: Buffer, n: number, line: Record<string, unknown>): { text: string; line_hash: string; prefix_sha256: string };
