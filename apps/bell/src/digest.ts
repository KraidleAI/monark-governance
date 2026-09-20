// MONARK Bell — canonical digest + provenance (ADR-B0 D2, D5). The digest is a deterministic,
// TIMESTAMP-FREE serialization (MAST "sha with timestamp" threat): bit-identical replay ⇒ identical
// `bell_sha`. Provenance (sources, providers, fetch times) lives SEPARATELY and is NOT hashed.
//
// NUMERIC-HOLE / CLOSE GUARD (ESC-1 c, D5): no output may carry the reference close (or ADV) verbatim.
// `assertNoClose` walks the object and reddens on any key matching CLOSE_KEY whose value is a number/numeric
// string -- catching camelCase (`refPrice`, `pRef`), the Polygon `prev` close leg (G2 fold C-3), AND the
// consolidated ADV denominator of fact (iii) via `adv|share_volume|volume_ref` (bare) (T-1a-ii C-6).
// TWO negation exemptions, same motif: `\bprev\b` (not bare `prev`) leaves the timeline key `prev_line_hash`
// (D2) green; `(?<!no_)close` leaves the NEGATED residual code `no_close_ref` (a counter, not a leaked close)
// green. KNOWN HOLE (accepted, declared): a `no_close_*` numeric key would pass -- tolerated because residual
// codes are a CLOSED set (residuals.ts), not free-form output. Mutants `bell_close_field_reddens` +
// `bell_close_guard_catches_camelcase` + the T-1a-ii ratio killer redden on an injected close/ADV. (vwap/g_t
// stay green; close is derivable from public vwap+g_t under ESC-1 (c). ADV is derivable from vol_ratio +
// volumeBase -- the SAME derivation shape; only `vol_ratio` (no adv/share_volume/volume_ref substring) is
// published. This extension of ESC-1 (c) to ADV is a point for checkpoint-2, not a ruling this file asserts.)
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

const CLOSE_KEY = /(?<!no_)close|ref[_]?price|p[_]?ref|reference|\bprev\b|adv|share_volume|volume_ref/i;
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

/** -b3b (C-9): the per-session close cross-check marker. `matched` = Databento == Massive on the scaled integer;
 *  `unavailable` = the Massive cross could not run (a single-source publish, interim Q3(ii) (a)); `mismatch` = the
 *  two disagreed (the session abstains). A consumer filters "cross-checked" vs "single-source" from this field.
 *  Not a close-like key (dodges CLOSE_KEY: no `close`/`reference`/`p_ref`/`adv` substring). */
export type CashCross = "matched" | "unavailable" | "mismatch";
interface GapEntryBase {
  readonly symbol: string; readonly session: string; readonly regime: string | null;
  readonly vwap: string; readonly volumeBase: string; readonly n: number;
  readonly cash_cross?: CashCross; // -b3b C-9: present only when the reference close went through the cross-check
}
/** A gap entry WITH volume: carries g_t and the threshold-exceedance counts. `multiplierUsed` is present ONLY on
 *  a rebase-aware session (D1-quater C-7 — m applied per fill, VWAP_share = Σ|q|/Σ(|b|·m)); absent on the m=1
 *  path so the existing digests stay bit-identical. Not a close-like key (dodges CLOSE_KEY). */
export interface GapEntryFilled extends GapEntryBase {
  readonly gT: string;
  readonly exceed1: number; readonly exceed2: number; readonly exceed5: number;
  readonly multiplierUsed?: string;
  // -b3b (C-6): the publication-policy gate for THIS session's g_t = earliestPublishUtc(refCloseDate) = 16:00 ET of
  // the reference-close day + 24 h (conservative >= 13:00 + 24 h on a half-day). A T-1b export whitelist consumes it;
  // it is a policy field, not a market fact, and not a close-like key. Placed on the hashed digest entry (C-6 option a,
  // declared) so it is tamper-evident and joinable to its g_t; the pinned replay re-pins by subtraction of this field.
  readonly earliest_publish_utc?: number;
}
/** An abstained gap entry: NO g_t. Cases (T-1a-ii V-7, D1-bis C-6): a zero-volume session (a fabricated g_t=0
 *  would be indistinguishable from a real zero gap -- C-4) abstains `no_fill_in_window`; a session WITH volume
 *  but no reference close (closeRef missing / <= 0) abstains `no_close_ref`; a session on a pool-window whose
 *  scaled-UI multiplier was not verified constant abstains `rebase_unverified` (C-6). Each still carries its
 *  first-hand vwap, never a fabricated / silently rescaled gap. The digest accepts any; `abstain` is not a
 *  close-like key. */
export interface GapEntryAbstained extends GapEntryBase {
  readonly abstain: "no_fill_in_window" | "no_close_ref" | "rebase_unverified" | "cash_cross_mismatch";
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
