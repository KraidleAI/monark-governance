// MONARK Koyomi: the slots (G0 KOYOMI-A DK-8, DK-5; plan A1 §2, lot A1-b-i). A night is the evening of a NYSE day from Monday to
// Thursday; it carries a forecast when the next calendar day is a NYSE day, else a `holiday` line. A weekend slot is every Sunday,
// between the last NYSE day before it (D) and the next one (D'). A closure whose D and D' lie on both sides of the SIP switch Sunday
// is `straddle`. A date the calendar does not cover is `calendar_unknown`, line by line: no slot is ever guessed. The rank counts the
// forecast slots only (MONARK's ruling on the hand-written table, 2026-10-22). Pure: the calendar is an argument, built by the caller
// from Bell's committed one (C-A1-13: this module imports nothing from Bell; dowOf and addDays are restated on ISO dates here).
import type { AbstainCode } from "./abstain.ts";

/** What the slots and the cuts read of the New York calendar: full closures, half-days, the covered range (inclusive), the New York
 *  wall clock (ET date and time to a UTC instant, daylight time applied) and the SIP switch Sunday. */
export interface NyCalendar {
  readonly fullClosures: ReadonlySet<string>;
  readonly halfDays: ReadonlySet<string>;
  readonly range: { readonly fromISO: string; readonly toISO: string };
  readonly etToUtcMs: (y: number, mo: number, d: number, h: number, mi: number, s: number) => number;
  readonly sipSwitchSundayET: string;
}
export type NightLabel = "night" | Extract<AbstainCode, "holiday" | "straddle" | "calendar_unknown">;
export type SundayLabel = "ordinary" | Extract<AbstainCode, "holiday" | "straddle" | "calendar_unknown">;
/** One night: D the evening's date, D' the next NYSE day (null when unknown), rank among the forecast nights (null otherwise). */
export interface NightSlot { readonly rank: number | null; readonly d: string; readonly dNext: string | null; readonly label: NightLabel }
/** One Sunday: dPrev = D, the last NYSE day before it; dNext = D'; both null when unknown. */
export interface SundaySlot { readonly rank: number | null; readonly d: string; readonly dPrev: string | null; readonly dNext: string | null; readonly label: SundayLabel }

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const dayMs = 86_400_000;
const isoOf = (t: number): string => new Date(t).toISOString().slice(0, 10);
/** Refuses anything but a real calendar date written YYYY-MM-DD. */
export function checkIso(dateISO: string): string {
  if (!ISO_RE.test(dateISO) || isoOf(Date.parse(dateISO + "T12:00:00Z")) !== dateISO) throw new RangeError(`not a YYYY-MM-DD date: ${JSON.stringify(dateISO)}`);
  return dateISO;
}
/** Day of the week of an ISO date, 0 = Sunday .. 6 = Saturday. */
export const dowOf = (dateISO: string): number => new Date(dateISO + "T12:00:00Z").getUTCDay();
export const addDays = (dateISO: string, n: number): string => isoOf(Date.parse(dateISO + "T12:00:00Z") + n * dayMs);
export const inRange = (cal: NyCalendar, dateISO: string): boolean => dateISO >= cal.range.fromISO && dateISO <= cal.range.toISO;
/** A NYSE day = a weekday that is not a full closure; half-days are NYSE days. Callers check the range first. */
export const isNyseDay = (cal: NyCalendar, dateISO: string): boolean => dowOf(dateISO) >= 1 && dowOf(dateISO) <= 5 && !cal.fullClosures.has(dateISO);

/** The nearest NYSE day strictly after (step 1) or before (step -1) a date, or null when the walk leaves the calendar. */
function walk(cal: NyCalendar, dateISO: string, step: 1 | -1): string | null {
  for (let day = addDays(dateISO, step), k = 0; k < 14; day = addDays(day, step), k++) {
    if (!inRange(cal, day)) return null;
    if (isNyseDay(cal, day)) return day;
  }
  return null;
}
/** True when the closure from D to D' holds the SIP switch Sunday: the close under one regime, the open under the other. */
const straddles = (cal: NyCalendar, d: string, dNext: string): boolean => d < cal.sipSwitchSundayET && cal.sipSwitchSundayET < dNext;
/** Every date of [fromISO, toISO], in order. */
function datesOf(fromISO: string, toISO: string): string[] {
  const out: string[] = [];
  for (let day = checkIso(fromISO); day <= checkIso(toISO); day = addDays(day, 1)) out.push(day);
  return out;
}

/** The nights of [fromISO, toISO]: one line per Monday-to-Thursday NYSE day, and one `calendar_unknown` line per Monday-to-Thursday
 *  date outside the calendar. A Friday is never a night (its gap is the weekend's), a closed Monday is not a night (D has no close). */
export function nightSlots(fromISO: string, toISO: string, cal: NyCalendar): NightSlot[] {
  const out: NightSlot[] = [];
  let rank = 0;
  for (const d of datesOf(fromISO, toISO)) {
    const dow = dowOf(d);
    if (dow < 1 || dow > 4) continue;
    if (!inRange(cal, d)) { out.push({ rank: null, d, dNext: null, label: "calendar_unknown" }); continue; }
    if (!isNyseDay(cal, d)) continue;
    const next = addDays(d, 1);
    const dNext = walk(cal, d, 1);
    if (dNext === null) { out.push({ rank: null, d, dNext: null, label: "calendar_unknown" }); continue; }
    const label: NightLabel = straddles(cal, d, dNext) ? "straddle" : dNext === next ? "night" : "holiday";
    out.push({ rank: label === "night" ? ++rank : null, d, dNext, label });
  }
  return out;
}

/** The Sundays of [fromISO, toISO]: `calendar_unknown` when D or D' is outside the calendar, else `straddle` when the closure holds
 *  the SIP switch Sunday, else `holiday` when a full closure lies between D and D' (D is not the Friday or D' not the Monday). */
export function sundaySlots(fromISO: string, toISO: string, cal: NyCalendar): SundaySlot[] {
  const out: SundaySlot[] = [];
  let rank = 0;
  for (const d of datesOf(fromISO, toISO)) {
    if (dowOf(d) !== 0) continue;
    const dPrev = inRange(cal, d) ? walk(cal, d, -1) : null;
    const dNext = inRange(cal, d) ? walk(cal, d, 1) : null;
    if (dPrev === null || dNext === null) { out.push({ rank: null, d, dPrev, dNext, label: "calendar_unknown" }); continue; }
    const ordinary = dPrev === addDays(d, -2) && dNext === addDays(d, 1);
    const label: SundayLabel = straddles(cal, dPrev, dNext) ? "straddle" : ordinary ? "ordinary" : "holiday";
    out.push({ rank: label === "ordinary" ? ++rank : null, d, dPrev, dNext, label });
  }
  return out;
}
