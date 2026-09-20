// scripts/probe-narabi.d.mts — type surface for scripts/probe-narabi.mjs (ADR-NARABI-OPS-1 -1b-i). Lets the
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
export const CHAINSTACK_PROVIDERS: readonly string[];

/** narabi.json reason (DETECTION sub-lot). `null` = healthy. */
export type ProbeReason =
  | "lag" | "chain_broken" | "unreachable" | "too_large" | "insecure_url" | "probe_error" | null;

/** narabi.json shape (schema 1, DETECTION): the probe writes exactly this. */
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
export type FetchResult = { ok: true; text: string } | { ok: false; reason: "unreachable" | "too_large" };
export function fetchTimeline(url: string, opts?: FetchOpts): Promise<FetchResult>;

export interface EvaluateInput { text: string | null; nowIso: string; reachable: boolean; fetchReason?: string }
export function evaluate(input: EvaluateInput): NarabiState;

export interface ProbeOpts {
  file?: string; now?: string; url?: string; out?: string;
  timeoutMs?: number; maxBytes?: number; retries?: number;
}
export function probe(opts?: ProbeOpts): Promise<{ state: NarabiState; exitCode: number }>;
