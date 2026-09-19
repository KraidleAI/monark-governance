// MONARK Bell — canonical digest + provenance (ADR-B0 D2, D5). The digest is a deterministic,
// TIMESTAMP-FREE serialization (MAST "sha with timestamp" threat): bit-identical replay ⇒ identical
// `bell_sha`. Provenance (sources, providers, fetch times) lives SEPARATELY and is NOT hashed.
//
// NUMERIC-HOLE / CLOSE GUARD (ESC-1 c, D5): no output may carry the reference close verbatim. `assertNoClose`
// walks the object and reddens on any key ~ /close|ref[_]?price|p[_]?ref|reference|\bprev\b/i whose value
// is a number or a numeric string -- the added alternatives catch camelCase (`refPrice`, `pRef`) and the
// Polygon `prev` close leg (G2 fold C-3). `\bprev\b` (not bare `prev`) leaves the timeline chain key
// `prev_line_hash` (D2) un-reddened. Mutants `bell_close_field_reddens` + `bell_close_guard_catches_camelcase`
// redden on an injected close. (vwap/g_t stay green: their keys do not match; close is derivable from the
// public vwap+g_t, accepted by ESC-1 c.)
import { createHash } from "node:crypto";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** Deterministic canonical JSON: recursively sorted object keys, no incidental whitespace. */
export function canonical(v: Json): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") { if (!Number.isFinite(v)) throw new Error("non-finite number in digest"); return String(v); }
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  const keys = Object.keys(v).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonical(v[k] as Json)).join(",") + "}";
}

const CLOSE_KEY = /close|ref[_]?price|p[_]?ref|reference|\bprev\b/i;
const isNumericLike = (x: unknown): boolean =>
  typeof x === "number" || (typeof x === "string" && x.trim() !== "" && Number.isFinite(Number(x)));

/** Reddens (throws) if any key naming the reference close carries a numeric / numeric-string value. */
export function assertNoClose(v: unknown, path = "$"): void {
  if (Array.isArray(v)) { v.forEach((e, i) => { assertNoClose(e, `${path}[${String(i)}]`); }); return; }
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (CLOSE_KEY.test(k) && isNumericLike(val)) {
        throw new Error(`bell numeric-hole guard: forbidden close-like field '${k}' at ${path} (ESC-1 c)`);
      }
      assertNoClose(val, `${path}.${k}`);
    }
  }
}

/** sha256 (hex) of the canonical form. The digest is asserted close-free BEFORE it is hashed. */
export function bellSha(digest: Json): string {
  assertNoClose(digest);
  return createHash("sha256").update(canonical(digest)).digest("hex");
}

interface GapEntryBase {
  readonly symbol: string; readonly session: string; readonly regime: string | null;
  readonly vwap: string; readonly volumeBase: string; readonly n: number;
}
/** A gap entry WITH volume: carries g_t and the threshold-exceedance counts. */
export interface GapEntryFilled extends GapEntryBase {
  readonly gT: string;
  readonly exceed1: number; readonly exceed2: number; readonly exceed5: number;
}
/** A zero-volume gap entry: NO g_t (a fabricated g_t=0 is indistinguishable from a real zero gap -- C-4);
 *  it carries an explicit abstention instead. The digest accepts it; `abstain` is not a close-like key. */
export interface GapEntryAbstained extends GapEntryBase {
  readonly abstain: "no_fill_in_window";
}
export type GapEntry = GapEntryFilled | GapEntryAbstained;
/** Build the (timestamp-free) digest body. Entries are sorted for determinism; no close field exists. */
export function buildDigest(gaps: readonly GapEntry[], haltCensus: Json, extra: Record<string, Json> = {}): Json {
  const sorted = [...gaps].sort((a, b) =>
    a.symbol.localeCompare(b.symbol) || a.session.localeCompare(b.session) || String(a.regime).localeCompare(String(b.regime)));
  const digest: Json = { schema: "bell-digest-v1", gaps: sorted as unknown as Json, halt_census: haltCensus, ...extra };
  assertNoClose(digest);
  return digest;
}

export interface Provenance { readonly bellSha: string; readonly sources: Json; readonly providers: Json; readonly generatedAt: string }
/** Provenance envelope — carries what the digest may NOT (timestamps, providers), keyed to the bell_sha. */
export function provenance(digest: Json, sources: Json, providers: Json, generatedAt: string): Provenance {
  // The envelope is published too (T-1b, /bell/*.json): the close-guard applies to it as well (checkpoint-2 V-3).
  assertNoClose({ sources, providers });
  return { bellSha: bellSha(digest), sources, providers, generatedAt };
}
