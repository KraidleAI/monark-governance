// MONARK Koyomi: the input cuts (G0 KOYOMI-A DK-1, DK-5; plan A1 §2, lot A1-b-i). The window passed to Bell's collection for one slot,
// half-open [fromUtcMs, toUtcMs): a trade at toUtcMs never enters. Night of D: the `after` window of D, 16:00 to 20:00 ET, or 13:00 to
// 17:00 ET on a half-day; it closes at 20:00 ET whatever the signing time (DK-4). Weekend: the trades of the `weekend` session, from
// Saturday 00:00 ET, cut strictly before Sunday 17:00 ET (DK-5, a cut Bell's code does not have); Friday 20:00 to 24:00 ET (overnight
// session of the weekend regime) stays out. Every ET instant goes through the calendar's New York clock, daylight time applied on the
// day itself (the switch of Sunday 2027-03-14 puts 17:00 at 21:00 UTC). Pure: the calendar is an argument (C-A1-13), no clock is read.
import { addDays, checkIso, dowOf, inRange, isNyseDay, type NyCalendar } from "./slots.ts";

/** A half-open window of UTC instants, in milliseconds. */
export interface CutWindow { readonly fromUtcMs: number; readonly toUtcMs: number }

const partsOf = (dateISO: string): [number, number, number] => {
  const [y, mo, d] = checkIso(dateISO).split("-").map(Number);
  return [y ?? 0, mo ?? 0, d ?? 0];
};

/** The night window of D: the `after` session of a NYSE day of the calendar. A date outside the calendar or not a NYSE day has none. */
export function nightCut(dISO: string, cal: NyCalendar): CutWindow {
  const [y, mo, d] = partsOf(dISO);
  if (!inRange(cal, dISO)) throw new RangeError(`${dISO} is outside the calendar (${cal.range.fromISO} to ${cal.range.toISO}): calendar_unknown`);
  if (!isNyseDay(cal, dISO)) throw new RangeError(`${dISO} is not a trading day: it has no after window`);
  const half = cal.halfDays.has(dISO);
  return { fromUtcMs: cal.etToUtcMs(y, mo, d, half ? 13 : 16, 0, 0), toUtcMs: cal.etToUtcMs(y, mo, d, half ? 17 : 20, 0, 0) };
}

/** True when an instant falls in the window: closed on the left, open on the right. */
export function inCut(w: CutWindow, utcMs: number): boolean {
  return utcMs >= w.fromUtcMs &&
    utcMs < w.toUtcMs;
}

/** The weekend window of a Sunday: Saturday 00:00 ET to Sunday 17:00 ET. Read on the clock only, never on the calendar's range or
 *  closures: whether the Sunday carries a forecast is the slot's label (slots.ts), not the cut's. */
export function sundayCut(sundayISO: string, cal: NyCalendar): CutWindow {
  checkIso(sundayISO);
  if (dowOf(sundayISO) !== 0) throw new RangeError(`${sundayISO} is not a Sunday: it has no weekend cut`);
  const [sy, smo, sd] = partsOf(addDays(sundayISO, -1));
  return { fromUtcMs: cal.etToUtcMs(sy, smo, sd, 0, 0, 0), toUtcMs: sundayEnd(sundayISO, cal) };
}

/** Sunday 17:00 ET as a UTC instant, on the New York clock of that very Sunday. */
function sundayEnd(sundayISO: string, cal: NyCalendar): number {
  const [y, mo, d] = partsOf(sundayISO);
  return cal.etToUtcMs(y, mo, d, 17, 0, 0);
}
