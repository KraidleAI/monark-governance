// MONARK Bell, the collection planner: which trading-day unit is due at an instant. Pure: no clock, no I/O, no environment.
// A unit U(D) runs from 04:00 ET (the pre-open) of the trading day D to 04:00 ET of D', the next trading day; every session
// key classifySession gives inside it is anchored on D, and none crosses its bounds. U(D) is due once its end plus the indexing
// margin has passed AND the publication gate of each of its sessions (earliestPublishUtc of its reference-close day) has passed.
// The planner returns at most UNITS_PER_TICK units, from the first not yet deposited, and refuses calendar_exhausted when D', or
// the ADV month of D's sessions, leaves the committed calendar. It imports and copies nothing of the calendar.
import { CALENDAR_RANGE, PRE_OPEN, earliestPublishUtc, etWallClockToUtcMs, isTradingDay, nextTradingDay, refCloseDateOf, type SessionLabel } from "./sessions.ts";
import { advPeriodOf, tradingDaysOf } from "./volume.ts";

/** A trading-day unit: [startMs, endMs) = [04:00 ET of d, 04:00 ET of dNext). */
export interface Unit { readonly d: string; readonly dNext: string; readonly startMs: number; readonly endMs: number }
/** The planner's view of state/progress.json: the seed (first unit) and the last unit deposited, if any. */
export interface PlanProgress { readonly seedET: string; readonly lastDepositedET: string | null }
export type PlanResult =
  | { readonly kind: "units"; readonly units: readonly Unit[] } // 1 to UNITS_PER_TICK due units, in order
  | { readonly kind: "nothing_due"; readonly unit: Unit } // the next unit, not due yet
  | { readonly kind: "calendar_exhausted"; readonly d: string }; // the next unit needs a day the calendar does not hold
/** At most one unit per tick: bounds the catch-up after an outage. */
export const UNITS_PER_TICK = 1;
/** Every session label of a unit is anchored on D; refCloseDateOf maps each to D or to the trading day before D. */
const UNIT_SESSIONS: readonly SessionLabel[] = ["pre", "regular", "after", "overnight-weekday", "weekend", "holiday"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function preOpenUtc(dateISO: string): number {
  const [y, mo, d] = dateISO.split("-").map(Number);
  return etWallClockToUtcMs(y ?? 0, mo ?? 1, d ?? 1, Math.floor(PRE_OPEN / 60), PRE_OPEN % 60, 0);
}

/** U(D), for a trading day D of the committed calendar; a RangeError otherwise. */
export function unitOf(d: string): Unit {
  if (!DATE.test(d) || !isTradingDay(d)) throw new RangeError(`plan: ${d} is not a trading day`);
  const dNext = nextTradingDay(d);
  return { d, dNext, startMs: preOpenUtc(d), endMs: preOpenUtc(dNext) };
}

/** The instant U(D) becomes due: max(end + margin, the latest publication gate of its sessions). */
export function dueInstant(u: Unit, marginMin: number): number {
  const ready = u.endMs + marginMin * 60_000;
  const gate = Math.max(...UNIT_SESSIONS.map((s) => earliestPublishUtc(refCloseDateOf(s, u.d))));
  return Math.max(ready, gate);
}

/** True when U(d) cannot be planned on the committed calendar: d or D' outside it, or the ADV month of d's sessions outside it. */
function calendarExhausted(d: string): boolean {
  if (d < CALENDAR_RANGE.fromISO || d > CALENDAR_RANGE.toISO) return true;
  if (nextTradingDay(d) > CALENDAR_RANGE.toISO) return true; // D' leaves the calendar
  return tradingDaysOf(advPeriodOf(d)) === null;
}

/** The units due at nowMs after `progress`, at most UNITS_PER_TICK; else nothing_due or calendar_exhausted. */
export function planUnit(nowMs: number, progress: PlanProgress, marginMin: number): PlanResult {
  if (!Number.isInteger(marginMin) || marginMin < 0) throw new RangeError("plan: the margin is a non-negative integer of minutes");
  const units: Unit[] = [];
  let d = progress.lastDepositedET === null ? progress.seedET : nextTradingDay(progress.lastDepositedET);
  while (units.length < UNITS_PER_TICK) {
    if (calendarExhausted(d)) {
      if (units.length === 0) return { kind: "calendar_exhausted", d };
      break;
    }
    const u = unitOf(d);
    if (nowMs < dueInstant(u, marginMin)) {
      if (units.length === 0) return { kind: "nothing_due", unit: u };
      break;
    }
    units.push(u);
    d = u.dNext;
  }
  return { kind: "units", units };
}
