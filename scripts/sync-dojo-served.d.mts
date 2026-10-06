// scripts/sync-dojo-served.d.mts -- type surface of scripts/sync-dojo-served.mjs (TS7016 sidecar, precedent sync-ukemi-served.d.mts), so
// the type-checked root test test/dojo-served.test.ts runs the sync on in-process bodies and a temporary root, WITHOUT the network
// CLI. Runtime = sync-dojo-served.mjs; Node ignores this file. Governance-only: neither file is whitelisted for the public export.
import type { DojoServedData } from "../apps/site/lib/dojo-served-load.ts";
export const OUT_REL: string;
export const MANIFEST_REL: string;
export const KEYRING_REL: string;
export const CA_REL: string;
/** DOJO-CA-FORMAT-1 (ADR-DOJO-PR-3 D-2): the schema, the closed keys, the twelve controls in order, the served bodies it hashes. */
export const CA_SCHEMA: string;
export const CA_KEYS: readonly string[];
export const CA_CHECKS: readonly string[];
export const CA_BODY_PATHS: Readonly<{ timeline: string; pubkey: string }>;
/** The clause the manifest's $comment carries once for the record, inserted before MANIFEST_ANCHOR. */
export const MANIFEST_CLAUSE: string;
export const MANIFEST_ANCHOR: string;
/** The label forms no record carries: the Dojo's operator labels, the site's vendor forms and its word gate (scope "site"). */
export const LABEL_FORMS: readonly RegExp[];
/** A record as the sync builds it or as the site loads it: its head, history and served bodies are what a deploy check binds. */
export type DojoRecord = DojoServedData | Readonly<Record<string, unknown>>;
/** Throws unless the deploy check has the closed form of DOJO-CA-FORMAT-1, is green, was captured on the record's head, history and
 *  served bodies and, when `g7` is not null, for that G7 (M-P7, M-P9). */
export function bindDojoCa(ca: unknown, record: DojoRecord, g7: string | null): void;
/** The label forms (as strings) found in any string of `value`, object keys included; [] when none. */
export function operatorLabelsIn(value: unknown): string[];
/** The canonical site manifest with the record's entry set and its $comment naming the record once; throws when malformed. */
export function setManifestEntry(text: string, sha: string): string;
/** The committed leg's refusals ([] when coherent): a record bound to its committed check, or a coherent absence (M-P20). */
export function committedRefusals(leg: { record: DojoRecord | null; present: boolean; listed: boolean; status: string; ca: unknown }): string[];
/** One sync under `root` (committed keyring, deploy check and manifest read there; record and manifest written there), the served
 *  bodies through `get`; rejects before any write when a check does not hold. */
export function runSync(opts: { root: string; g7: string; get: (rel: string) => Promise<Uint8Array>; readAt: string }):
  Promise<{ record: Record<string, unknown>; sha: string }>;
/** The CLI's GET of `rel` on the Dojo host: https only, no redirect followed, 200 only, the body streamed and cut at the reader's
 *  bound; rejects otherwise. `fetchImpl` defaults to the global fetch (the test passes a simulated one). */
export function httpsGet(rel: string, fetchImpl?: (url: string, init: RequestInit) => Promise<Response>): Promise<Buffer>;
