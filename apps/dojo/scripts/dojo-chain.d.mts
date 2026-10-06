// apps/dojo/scripts/dojo-chain.d.mts -- type surface of dojo-chain.mjs (TS7016 sidecar, precedent dojo-core.d.mts) so the
// type-checked tests import the runtime module. Runtime = dojo-chain.mjs.
import type { Break, Trust } from "../../bell/scripts/bell-chain.mjs";

export const DOJO_TIMELINE_SCHEMA: "dojo-timeline-v1";
/** Codes of ADR-DOJO-SNAPSHOT-1 D-10 (l.252 since the eighth pli, rotation_key_not_in_keyring included: Bell's walk emits it). */
export type DojoWalkReason = "timeline_malformed" | "chain_broken" | "rotation_key_not_in_keyring" | "key_not_in_keyring"
  | "signature_invalid" | "key_not_active" | "rotation_malformed" | "revocation_malformed" | "anchor_missing" | "day_not_increasing"
  | "seed_revealed_early" | "seed_chain_broken" | "price_version_mismatch" | "version_not_in_force";
export const DOJO_WALK_REASONS: readonly DojoWalkReason[];
export type DojoWalkResult = { ok: true; active: string | null; head: Record<string, unknown> | null; voided: number[]; breaks: Break[] }
  | { ok: false; seq: number; reason: DojoWalkReason; detail?: "read_rule" };
export function walkDojoTimeline(lines: readonly unknown[], trust: Trust): DojoWalkResult;
/** The deepest nesting of objects and arrays a served JSON text may carry (16). */
export const DOJO_MAX_DEPTH: number;
/** The deepest nesting of objects and arrays in a JSON text, in one pass over its characters, without parse or recursion. */
export function jsonDepth(text: string): number;
/** JSON.parse of a served text within DOJO_MAX_DEPTH, else null. */
export function readJson(text: string): unknown;
