// MONARK Bell — session gap g_t (ADR-B0 D2 i). g_t = ln(P_token_VWAP / P_close_ref).
//
// ESC-1 (c) LOAD-BEARING: P_close_ref is READ (Polygon `prev`, non-adjusted) to compute g_t, but it is
// NEVER placed in any output object. Only `vwap` (a first-hand on-chain fact, publicly recomputable) and
// `g_t` are carried. A third party with its own close licence rejoins; the digest guard (digest.ts)
// reddens on any `close`/`ref_price` field. Publishing vwap+g_t DOES let one derive close — that is
// accepted by ESC-1 (c) (the close is a public fact); the licence protects the Polygon FLOW, verbatim.
//
// VWAP is an EXACT ratio of bigint sums (Σ|quote| / Σ|base|), formatted to fixed precision by integer
// arithmetic → bit-identical replay (mutant `bell_session_gap_identical_to_replay`). g_t uses ln on the
// formatted decimals; the same inputs give the same string (a shifted close ⇒ g_t ≠, mutant D5).
import type { SwapFill } from "./rpc.ts";

export const GAP_PRECISION = 10; // decimals carried for vwap and g_t (committed convention)

const abs = (x: bigint): bigint => (x < 0n ? -x : x);
const pow10 = (n: number): bigint => 10n ** BigInt(n);

/** Format a scaled bigint (value × 10^precision) as a fixed-precision decimal string. Deterministic. */
export function fixed(scaled: bigint, precision: number): string {
  const neg = scaled < 0n;
  const s = abs(scaled).toString().padStart(precision + 1, "0");
  const intPart = s.slice(0, s.length - precision);
  const frac = precision > 0 ? "." + s.slice(s.length - precision) : "";
  return (neg ? "-" : "") + intPart + frac;
}

/** Exact VWAP (quote units per 1 base unit, human decimals) as a fixed-precision decimal string.
 *  vwap = (Σ|quote| / 10^quoteDec) / (Σ|base| / 10^baseDec). Returns "0" if there is no base volume. */
export function vwapDecimal(fills: readonly SwapFill[], baseDec: number, quoteDec: number, precision = GAP_PRECISION): string {
  let totalBase = 0n, totalQuote = 0n;
  for (const f of fills) { totalBase += abs(f.baseDelta); totalQuote += abs(f.quoteDelta); }
  if (totalBase === 0n) return fixed(0n, precision);
  // vwapScaled = totalQuote * 10^baseDec * 10^precision / (totalBase * 10^quoteDec)   (rounded down)
  const num = totalQuote * pow10(baseDec) * pow10(precision);
  const den = totalBase * pow10(quoteDec);
  return fixed(num / den, precision);
}

export interface SessionGap {
  readonly vwap: string; // decimal string, first-hand on-chain (publishable)
  readonly gT: string; // ln(vwap/close) decimal string — the ONLY close-derived field carried
  readonly volumeBase: string; // Σ|baseDelta| in human decimals (token units traded)
  readonly n: number; // deduped fill count
}

/** Compute the session gap from deduped fills and a reference close (read, never stored). closeRef must
 *  be > 0; g_t is ln(vwap/closeRef). ex_date_effect / disloc handling is a caller-side abstention (D2 i). */
export function sessionGap(fills: readonly SwapFill[], closeRef: number, baseDec: number, quoteDec: number,
  precision = GAP_PRECISION): SessionGap {
  const vwap = vwapDecimal(fills, baseDec, quoteDec, precision);
  let totalBase = 0n;
  for (const f of fills) totalBase += abs(f.baseDelta);
  const volumeBase = fixed(totalBase * pow10(precision) / pow10(baseDec), precision);
  const vwapNum = Number(vwap);
  const gT = vwapNum > 0 && closeRef > 0 ? Math.log(vwapNum / closeRef).toFixed(precision) : (0).toFixed(precision);
  return { vwap, gT, volumeBase, n: fills.length };
}

/** Threshold exceedance of |g_t| in relative terms: g_t is a log-return, so |exp(g_t) − 1| is the signed
 *  relative gap; report counts at 1/2/5 % (ADR-B0 §5 measures). Pure, deterministic. */
export function exceeds(gT: string, pct: number): boolean {
  return Math.abs(Math.exp(Number(gT)) - 1) > pct / 100;
}
