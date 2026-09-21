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
export const MAX_TIMEOUT_MS: number;
export const MAX_MAX_BYTES: number;
export const MAX_RETRIES: number;
export const START_MARGIN_MS: number;
export const CHAINSTACK_PROVIDERS: readonly string[];
// State cross-check bounds (sub-lot -1b-ii-b): the 2nd GET of /narabi/state.json.
export const STATE_MAX_BYTES: number;
export const STATE_TIMEOUT_MS: number;
export const STATE_RETRIES: number;

/** narabi.json reason (`null` = healthy). -1b-ii-b adds the two state cross-check reasons. */
export type ProbeReason =
  | "lag" | "chain_broken" | "unreachable" | "too_large" | "insecure_url" | "probe_error"
  | "state_mismatch" | "state_unreachable" | null;

/** narabi.json shape: schema 1 DETECTION + the -1b-ii-b `state_checked` cross-check flag (the `schema` bump
 *  to 2 that this field joins is added by -1b-ii-a). */
export interface NarabiState {
  schema: number;
  checked_at: string;
  last_day: string | null;
  lag_days: number | null;
  chain_ok: boolean;
  reachable: boolean;
  chainstack_present: boolean;
  provider: string | null;
  state_checked: boolean;
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
/** The state.json URL derived from the timeline URL by basename replacement (-1b-ii-b, C-B-12). */
export function deriveStateUrl(timelineUrl: string): string;

export type TransportDecision = { ok: true } | { ok: false; reason: "insecure_url" };
export function urlTransportAllowed(url: string): TransportDecision;

export interface FetchOpts { timeoutMs?: number; maxBytes?: number; retries?: number }
export type FetchResult = { ok: true; text: string } | { ok: false; reason: "unreachable" | "too_large" | "insecure_url" };
export function fetchTimeline(url: string, opts?: FetchOpts): Promise<FetchResult>;

export interface TransportBounds { timeoutMs: number; maxBytes: number; retries: number }
export function transportBounds(env?: Record<string, string | undefined>): TransportBounds;

/** The state cross-check input to evaluate (-1b-ii-b). undefined = not requested (state_checked stays false);
 *  { ok:false } = 2nd GET failed or no comparable digest (-> state_unreachable); { ok:true, digest } = compare. */
export type StateCheck = { ok: true; digest: string } | { ok: false };
export interface EvaluateInput { text: string | null; nowIso: string; reachable: boolean; fetchReason?: string; stateCheck?: StateCheck | undefined }
export function evaluate(input: EvaluateInput): NarabiState;

export interface ProbeOpts {
  file?: string; now?: string; url?: string; out?: string; stateFile?: string;
  timeoutMs?: number; maxBytes?: number; retries?: number;
}
export function probe(opts?: ProbeOpts): Promise<{ state: NarabiState; exitCode: number }>;
