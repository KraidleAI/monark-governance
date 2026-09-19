// MONARK Bell — NYSE session calendar + DST-correct ET↔UTC + session/regime classification (ADR-B0
// D2 i; item T-1a: session bounds + a committed holiday / half-day (13:00 ET close) calendar constant).
//
// SOURCED FIRST-HAND (2026-09-19):
//  · 2025 full closures — DERIVED from Polygon TSLA daily bars (adjusted=false, dates only, never close
//    values): the weekdays with NO bar. This is first-hand and reproducible, and it CAUGHT the special
//    2025-01-09 close (National Day of Mourning, President Carter) that a memorised list would miss.
//  · 2025 half-days — Polygon TSLA 1-minute bars: last bar 16:59 ET on 07-03 / 11-28 / 12-24 vs 19:59 ET
//    on a normal day (regular close 13:00 ET, post-market ends 17:00 ET). First-hand early-close signature.
//  · 2026 — nyse.com/markets/hours-calendars [lu] AND Polygon /v1/marketstatus/upcoming — the two agree
//    (Thanksgiving 11-26 closed, 11-27 early-close, 12-24 early-close, 12-25 closed).
// Extending a year = an ADR line + the same first-hand check. Unknown future dates must NOT be guessed.

const FULL_CLOSURES = new Set<string>([
  // 2025 (Polygon daily-bar absence; 11 days incl. 01-09 Carter mourning)
  "2025-01-01", "2025-01-09", "2025-01-20", "2025-02-17", "2025-04-18", "2025-05-26",
  "2025-06-19", "2025-07-04", "2025-09-01", "2025-11-27", "2025-12-25",
  // 2026 (NYSE page + Polygon upcoming; 10 days)
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19",
  "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
]);
const HALF_DAYS = new Set<string>([
  "2025-07-03", "2025-11-28", "2025-12-24", // 2025 (Polygon minute-bar early close)
  "2026-11-27", "2026-12-24", // 2026 (NYSE page + Polygon upcoming)
]);
// The committed calendar covers [2025-01-01, 2026-12-31]; outside it, classification is UNKNOWN.
export const CALENDAR_RANGE = { fromISO: "2025-01-01", toISO: "2026-12-31" } as const;

// ET session bounds, minutes since ET midnight. Half-days close regular at 13:00, post-market at 17:00.
const PRE_OPEN = 4 * 60, REG_OPEN = 9 * 60 + 30;
const REG_CLOSE_NORMAL = 16 * 60, REG_CLOSE_HALF = 13 * 60;
const AFTER_CLOSE_NORMAL = 20 * 60, AFTER_CLOSE_HALF = 17 * 60;

export type SessionLabel = "regular" | "pre" | "after" | "overnight-weekday" | "weekend" | "holiday";
export type Regime = "overnight-weekday" | "weekend" | "holiday"; // the off-hours gap regime (D3 predictor_id)
export interface SessionClass {
  readonly session: SessionLabel;
  readonly regime: Regime | null; // null for intraday sessions (pre/regular/after)
  readonly sessionDateET: string; // ET calendar date the session/gap is anchored on (YYYY-MM-DD)
}

const _dtf = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
});
interface EtParts { y: number; mo: number; d: number; h: number; mi: number; s: number }
/** Wall-clock ET parts of a UTC instant (DST handled by Intl — the ONLY correct source of the offset). */
export function etParts(utcMs: number): EtParts {
  const p: Record<string, string> = {};
  for (const part of _dtf.formatToParts(new Date(utcMs))) if (part.type !== "literal") p[part.type] = part.value;
  const hh = p.hour === "24" ? 0 : Number(p.hour); // Intl may render midnight as "24"
  return { y: Number(p.year), mo: Number(p.month), d: Number(p.day), h: hh, mi: Number(p.minute), s: Number(p.second) };
}
/** ET wall-clock (as printed in the CSV, no zone) → UTC ms, applying the DST offset for THAT date.
 *  Two-pass fixed point so instants near the spring/fall transition resolve to the correct offset. */
export function etWallClockToUtcMs(y: number, mo: number, d: number, h: number, mi: number, s: number): number {
  const naive = Date.UTC(y, mo - 1, d, h, mi, s);
  const offsetAt = (utc: number): number => {
    const e = etParts(utc);
    return (Date.UTC(e.y, e.mo - 1, e.d, e.h, e.mi, e.s) - utc) / 60000; // ET − UTC, minutes (−300 in winter / −240 under DST)
  };
  let utc = naive - offsetAt(naive) * 60000;
  const off2 = offsetAt(utc);
  if (Math.round((naive - utc) / 60000) !== off2) utc = naive - off2 * 60000;
  return utc;
}

const iso = (y: number, mo: number, d: number): string =>
  `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const dowOf = (dateISO: string): number => new Date(dateISO + "T12:00:00Z").getUTCDay(); // 0=Sun..6=Sat
const addDays = (dateISO: string, n: number): string => {
  const t = new Date(dateISO + "T12:00:00Z").getTime() + n * 86_400_000;
  const dt = new Date(t);
  return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
};
/** A trading day = a weekday that is not a full closure. Half-days ARE trading days (early close). */
export function isTradingDay(dateISO: string): boolean {
  const dow = dowOf(dateISO);
  return dow >= 1 && dow <= 5 && !FULL_CLOSURES.has(dateISO);
}

/** Regime of an off-hours gap that starts after `fromDateISO` (a trading day) and ends at the next
 *  trading day's pre-open: holiday if a full closure sits in the gap, weekend if Sat/Sun does, else
 *  overnight-weekday. Bounded walk (≤ a few days). */
function gapRegime(fromDateISO: string): Regime {
  let sawWeekend = false, sawHoliday = false;
  for (let k = 1; k <= 7; k++) {
    const day = addDays(fromDateISO, k);
    if (isTradingDay(day)) break;
    if (FULL_CLOSURES.has(day)) sawHoliday = true;
    else sawWeekend = true;
  }
  return sawHoliday ? "holiday" : sawWeekend ? "weekend" : "overnight-weekday";
}

/** Classify a UTC instant into {session, regime, anchor ET date} (ADR-B0 D2 i). Off-hours instants are
 *  attributed to the gap that BEGINS on the most recent trading day (anchor = that day). */
export function classifySession(utcMs: number): SessionClass {
  const e = etParts(utcMs);
  const dateISO = iso(e.y, e.mo, e.d);
  const minute = e.h * 60 + e.mi;
  if (FULL_CLOSURES.has(dateISO)) return { session: "holiday", regime: "holiday", sessionDateET: dateISO };
  const dow = dowOf(dateISO);
  if (dow === 0 || dow === 6) {
    // Weekend: anchor on the Friday that opened the gap (Sat→−1, Sun→−2).
    return { session: "weekend", regime: "weekend", sessionDateET: addDays(dateISO, dow === 6 ? -1 : -2) };
  }
  const half = HALF_DAYS.has(dateISO);
  const regClose = half ? REG_CLOSE_HALF : REG_CLOSE_NORMAL;
  const afterClose = half ? AFTER_CLOSE_HALF : AFTER_CLOSE_NORMAL;
  if (minute >= PRE_OPEN && minute < REG_OPEN) return { session: "pre", regime: null, sessionDateET: dateISO };
  if (minute >= REG_OPEN && minute < regClose) return { session: "regular", regime: null, sessionDateET: dateISO };
  if (minute >= regClose && minute < afterClose) return { session: "after", regime: null, sessionDateET: dateISO };
  if (minute >= afterClose) {
    // Late-night: the gap begins today.
    return { session: "overnight-weekday", regime: gapRegime(dateISO), sessionDateET: dateISO };
  }
  // Early-morning (minute < PRE_OPEN): the gap began on the previous trading day — anchor there.
  const prev = (() => { let p = addDays(dateISO, -1); for (let k = 0; k < 7 && !isTradingDay(p); k++) p = addDays(p, -1); return p; })();
  return { session: "overnight-weekday", regime: gapRegime(prev), sessionDateET: prev };
}
