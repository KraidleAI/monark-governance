// MONARK Bell -- fact (iii): pool volume vs the prior month's average daily share volume (ADR-B0 D2 iii, ADR-T1aii
// C-6/C-7; definition re-aligned on SEC order 34-106402 II.F by lot BELL-ADV-1, 2026-09-23).
//
// NUMERATOR (first-hand): the token volume of ONE session group (session, regime, sessionDateET -- sessions.ts), recomputed
// from the pool fills DEDUPED by signature upstream (rpc.ts; Jupiter is an aggregator, so its hops appear once per pool),
// converted to shares with the shares-per-token multiplier IN EFFECT AT EACH FILL: S = sum |baseDelta| / 10^baseDec * m(t)
// (the same sum as the share denominator of gap.ts sessionGapRebase).
// DENOMINATOR: the average daily SHARE volume of the underlying over the CALENDAR MONTH BEFORE the month of the session's
// ET trading day. II.F (p.24 l.897-906) sets the limits against "the average daily share volume during the prior month";
// note 69 (p.25 l.959-963) starts the next trade date when trades must be reported to the SIP, which is the anchoring rule
// of classifySession (an off-hours instant belongs to the last trading day). The bars are Massive (ex-Polygon)
// range/1/day, adjusted=false ("as reported"), dated by the ET date of `t` (start of the aggregate window: midnight ET
// in the Massive docs example) -- [2nd]: that their `v` equals the SIP consolidated volume is NOT established (I-G2-5).
// UNIT (I-G2-3): vol_ratio = S / ADV = the session's share volume as a fraction of ONE average trading day of the ADV
// month. It is the ADDITIVE component of the II.F quotient, not the quotient itself: summing the vol_ratio of the sessions
// sharing one sessionDateET gives that day's volume over the prior month's ADV; averaging those daily sums over a
// month's trading days gives the average-daily (ADV over ADV) form.
// FAIL-CLOSED (I-G2-1): bars that do not cover EXACTLY the NYSE trading days of the ADV month (committed calendar) =>
// `no_adv`; a multiplier not established at a fill => `no_multiplier`. Never a partial average, never a default "1".
// C-6 (conservative ESC-1 c): only the RATIO is published; the ADV is NEVER carried (digest close-guard).
import type { SwapFill } from "./rpc.ts";
import { GAP_PRECISION } from "./gap.ts";
import { CALENDAR_RANGE, classifySession, etParts, isTradingDay } from "./sessions.ts";

const abs = (x: bigint): bigint => (x < 0n ? -x : x);
const pad2 = (n: number): string => String(n).padStart(2, "0");

/** Token volume of a session in base units = sum of |baseDelta| over the deduped fills. Exact (bigint). */
export function poolVolumeBase(fills: readonly SwapFill[]): bigint {
  let v = 0n;
  for (const f of fills) v += abs(f.baseDelta);
  return v;
}

/** One dated daily bar of the underlying: `dateET` = ET calendar date of the bar's window start, `v` = its volume. */
export interface AdvDailyBar { readonly dateET: string; readonly v: number }
/** The ADV period of a session: a calendar month (month 1..12). */
export interface AdvPeriod { readonly year: number; readonly month: number }

/** The ADV period of a session = the calendar month BEFORE the month of its ET trading day `sessionDateET`
 *  (YYYY-MM-DD, the anchor classifySession computes). January rolls to December of the previous year. */
export function advPeriodOf(sessionDateET: string): AdvPeriod {
  const y = Number(sessionDateET.slice(0, 4)), m = Number(sessionDateET.slice(5, 7));
  return m === 1 ? { year: y - 1, month: 12 } : { year: y, month: m - 1 };
}

/** The distinct ADV periods of a set of fills (via their session day), sorted. The live reader requests one month each. */
export function advPeriodsForFills(fills: readonly SwapFill[]): AdvPeriod[] {
  const keys = new Set<string>();
  for (const f of fills) {
    const p = advPeriodOf(classifySession(f.blockTimeUtcMs).sessionDateET);
    keys.add(`${String(p.year)}-${pad2(p.month)}`);
  }
  return [...keys].sort().map((k) => ({ year: Number(k.slice(0, 4)), month: Number(k.slice(5, 7)) }));
}

/** First and last calendar day (YYYY-MM-DD) of a period. */
export function periodBounds(p: AdvPeriod): { readonly first: string; readonly last: string } {
  const days = new Date(Date.UTC(p.year, p.month, 0)).getUTCDate(); // day 0 of the next month = last day of this one
  const ym = `${String(p.year).padStart(4, "0")}-${pad2(p.month)}`;
  return { first: `${ym}-01`, last: `${ym}-${pad2(days)}` };
}

/** The NYSE trading days of a period per the committed calendar (sessions.ts), or null when the month is not wholly
 *  inside CALENDAR_RANGE (unknown => the caller abstains no_adv; future dates are never guessed). */
export function tradingDaysOf(p: AdvPeriod): string[] | null {
  const { first, last } = periodBounds(p);
  if (first < CALENDAR_RANGE.fromISO || last > CALENDAR_RANGE.toISO) return null;
  const out: string[] = [];
  const n = Number(last.slice(8, 10));
  for (let d = 1; d <= n; d++) { const iso = `${first.slice(0, 8)}${pad2(d)}`; if (isTradingDay(iso)) out.push(iso); }
  return out;
}

/** ET calendar date of a daily bar from its `t` (Unix ms, start of the aggregate window). DST via Intl (sessions.ts). */
export function barDateET(tMs: number): string {
  const e = etParts(tMs);
  return `${String(e.y).padStart(4, "0")}-${pad2(e.mo)}-${pad2(e.d)}`;
}

/** The Massive range/1/day request for ONE ADV period: the exact month, UNADJUSTED ("as reported"), ascending. */
export function advRangePath(underlying: string, p: AdvPeriod): string {
  const { first, last } = periodBounds(p);
  return `/v2/aggs/ticker/${underlying}/range/1/day/${first}/${last}?adjusted=false&sort=asc&limit=50`;
}

/** The ADV of a period, or the no_adv abstention. `nBars` = bars dated inside the period; `nTradingDays` = the
 *  calendar's count (null outside CALENDAR_RANGE). */
export type PeriodAdv =
  | { readonly adv: number; readonly nBars: number; readonly nTradingDays: number }
  | { readonly abstain: "no_adv"; readonly nBars: number; readonly nTradingDays: number | null };

/** ADV of a period = sum(v) / n over the bars dated inside it, ONLY when those bars cover EXACTLY the period's trading
 *  days (one bar per day, no extra date, no duplicate, every v finite and > 0). Anything else => no_adv (fail-closed:
 *  never an average over a subset, never a fabricated denominator). Summed in date order (deterministic). */
export function periodAdv(bars: readonly AdvDailyBar[], p: AdvPeriod): PeriodAdv {
  const { first, last } = periodBounds(p);
  const inPeriod = bars.filter((b) => b.dateET >= first && b.dateET <= last).sort((a, b) => a.dateET.localeCompare(b.dateET));
  const nBars = inPeriod.length;
  const days = tradingDaysOf(p);
  if (days === null) return { abstain: "no_adv", nBars, nTradingDays: null };
  const dates = new Set(inPeriod.map((b) => b.dateET));
  const exact = nBars > 0 && nBars === days.length && dates.size === nBars && days.every((d) => dates.has(d));
  const positive = inPeriod.every((b) => Number.isFinite(b.v) && b.v > 0);
  if (!exact || !positive) return { abstain: "no_adv", nBars, nTradingDays: days.length };
  let s = 0;
  for (const b of inPeriod) s += b.v;
  return { adv: s / nBars, nBars, nTradingDays: days.length };
}

/** Share volume of a session: sum |baseDelta| / 10^baseDec * m(t) per fill. null when the multiplier at ANY fill is not
 *  established (null, non-finite or <= 0) => the caller abstains no_multiplier. `multiplierUnit` = some m != 1. */
export function sessionShareVolume(fills: readonly SwapFill[], baseDec: number, mAt: (blockTimeMs: number) => number | null):
  { readonly shares: number; readonly multiplierUnit: boolean } | null {
  let shares = 0, unit = false;
  for (const f of fills) {
    const m = mAt(f.blockTimeUtcMs);
    if (m === null || !Number.isFinite(m) || !(m > 0)) return null;
    shares += (Number(abs(f.baseDelta)) / Math.pow(10, baseDec)) * m;
    if (m !== 1) unit = true;
  }
  return { shares, multiplierUnit: unit };
}

/** vol_ratio = shares / adv as a fixed-precision decimal. `adv` MUST be > 0 (a missing denominator is the caller's
 *  no_adv abstention, never a fabricated ratio). Deterministic (bit-identical replay). */
export function volumeRatio(shares: number, adv: number, precision = GAP_PRECISION): string {
  if (!(adv > 0)) throw new Error("bell volumeRatio: adv must be > 0 (prior-month denominator)");
  return (shares / adv).toFixed(precision);
}

/** The formula carried on every published volume entry (ASCII; the definition a reader recomputes). */
export const VOL_RATIO_FORMULA = "vol_ratio = S / A; S = sum over this session's pool fills (session, regime, session_date_et; "
  + "first and last fill in window) of abs(baseDelta) / 10^baseDec * m, m = shares-per-token multiplier in effect at the fill; "
  + "A = sum(v) / n_bars over the unadjusted daily bars of the underlying dated in adv_period = the calendar month before "
  + "session_date_et, one bar per NYSE trading day (n_bars = n_trading_days, else no_adv); "
  + "unit = fraction of one average trading day of adv_period";

/** Names the ADV source in the provenance (calque close_source): a name, never a value. */
export const ADV_SOURCE = "massive-aggs-range-1-day-unadjusted";
