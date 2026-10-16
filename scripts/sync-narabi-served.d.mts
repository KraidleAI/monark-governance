// scripts/sync-narabi-served.d.mts - type surface of what scripts/sync-narabi-served.mjs exports (behind its run-guard), so the
// type-checked root test test/sync-check-mode.test.ts can write and check the record under a temporary root WITHOUT a network
// read. Runtime implementation = sync-narabi-served.mjs; Node ignores this file. Governance-only, NOT whitelisted for export.
export const API_HOST: string;
export const OPENAPI_PATH: string;
export const OUT_REL: string;
export type Get = (url: string, init?: RequestInit) => Promise<Response>;
export interface NarabiFacts {
  gate: { class_id: string; key: string; openapi_sha256: string };
  sentinel_timer: { on_calendar_utc: string[]; randomized_delay_s: number };
  probe: { deadline_utc: string; shots_utc: string[] };
}
/** Every `OnCalendar=*-*-* HH:MM:00 UTC` line of a unit, in order. */
export function onCalendarSlots(unitText: string): string[];
/** The Narabi class and its key read from a served gate description; null unless exactly one. */
export function narabiGateIdentity(description: string): { class_id: string; key: string } | null;
/** The facts the sources under `root` say now (the served document through `get`); exits 1 on any check. */
export function readNarabiFacts(opts: { root: string; get?: Get }): Promise<NarabiFacts>;
/** Does the committed record (or null) say the facts the sources say now, read_at aside? */
export function sameNarabiFacts(old: Record<string, unknown> | null, facts: NarabiFacts): boolean;
/** --check under `root`: exits 1 on a difference (or a stale manifest entry), returns on a match. Writes nothing. */
export function checkNarabiServed(opts: { root: string; get?: Get }): Promise<void>;
/** The manifest entry of the committed record set again when it differs; true when it wrote. */
export function repairNarabiEntry(root: string): boolean;
/** The manifest text with the record's entry set to its sha256, or null when the entry is right. */
export function narabiEntryFix(root: string): string | null;
/** Write the record of `facts` under `root` and set its manifest entry; returns the record's sha256. */
export function writeNarabiServed(root: string, facts: NarabiFacts, readAt: string): string;
