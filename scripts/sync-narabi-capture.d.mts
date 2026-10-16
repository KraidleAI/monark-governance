// scripts/sync-narabi-capture.d.mts - type surface of what scripts/sync-narabi-capture.mjs exports (behind its run-guard), so
// the type-checked root test test/sync-check-mode.test.ts can judge a capture WITHOUT a network read. Runtime implementation =
// sync-narabi-capture.mjs; Node ignores this file. Governance-only, NOT whitelisted for export.
export const BASE: string;
export const OUT_REL: string;
export const COMMENT: string;
/** The capture's lag bound in tracker steps T: --check refuses a stored T more than this many steps behind the served T. */
export const CAPTURE_LAG_BOUND_T: number;
/** A served line with its endpoint URL list replaced by its count; JSON of the stored line. */
export function projectServedLine(line: Record<string, unknown>): string;
/** The stored timeline: every served line projected, one per line, LF-terminated. */
export function projectTimeline(servedText: string): string;
/** GET one served file under BASE (https, no redirect, 200 only, bounded); exits 1 on a refusal. */
export function servedGet(name: string, get?: (url: string, init?: RequestInit) => Promise<Response>): Promise<string>;
export interface NarabiCapture {
  $comment: string; schema: string; source: string; captured_at: string; state_json: string; state_sha256: string;
  timeline_jsonl: string; timeline_sha256: string; served: { timeline_sha256: string; timeline_chars: number };
  previous_capture: { captured_at: string; served_timeline_sha256: string; served_timeline_chars: number };
}
/** The capture the sync writes (pure); throws if a URL survives the projection. */
export function captureRecord(prev: { captured_at: string; served: { timeline_sha256: string; timeline_chars: number } }, stateJson: string, servedTimeline: string, capturedAt: string): NarabiCapture;
/** --check (pure): the problems of the committed capture against what is served now (prefix, served bytes, state, lag bound). */
export function checkCommitted(old: NarabiCapture, stateJson: string, servedTimeline: string): string[];
