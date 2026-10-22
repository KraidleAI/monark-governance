// MONARK Koyomi: the input cuts (G0 KOYOMI-A DK-1, DK-5; tests 5 and 6). Night: the `after` window of D, [16:00, 20:00) ET, or
// [13:00, 17:00) ET on a half-day. Weekend: the `weekend` session's trades from Saturday 00:00 ET, cut strictly before Sunday 17:00 ET,
// New York daylight time applied. The calendar is an argument (C-A1-13: no module of the lot imports Bell); these tests build it from
// Bell's committed closures, half-days and clock (relational, C-A1-13 as widened on 2026-10-22: tests 3 to 6), under a LITERAL range,
// never Bell's own: extending Bell's calendar (its 2027 lot) leaves these tests green. Every expected instant is a literal Date.UTC,
// never the converter under test (plan A1 §7, "same code in the oracle and the engine"). Namespace imports: a missing symbol fails an
// assertion.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../bell/src/sessions.ts";
import * as K from "../src/cut.ts";
import type { NyCalendar } from "../src/slots.ts";

/** The fixture's range, literal: the covered years of Bell's calendar when this lot was written, held here so a later extension of
 *  Bell's range changes nothing in these tests. */
const FIXTURE_RANGE = { fromISO: "2025-01-01", toISO: "2026-12-31" } as const;
/** Bell's committed closures, half-days and New York clock under the literal range, with `extraHalfDays` as fixture half-days. */
const bellCalendar = (extraHalfDays: readonly string[] = []): NyCalendar => ({
  fullClosures: S.FULL_CLOSURES, halfDays: new Set([...S.HALF_DAYS, ...extraHalfDays]), range: FIXTURE_RANGE,
  etToUtcMs: S.etWallClockToUtcMs, sipSwitchSundayET: S.SIP_ETH_FROM_ET,
});

// killer: apps/koyomi/src/cut.ts:29 ROR "utcMs < w.toUtcMs" -> "utcMs <= w.toUtcMs"
test("koyomi_cut_after_window_bounds", () => {
  assert.equal(typeof K.nightCut, "function", "cut.ts exports nightCut");
  assert.equal(typeof K.inCut, "function", "cut.ts exports inCut");
  const cal = bellCalendar();
  // Monday 2026-12-07, winter time (ET = UTC-5): the after window is [21:00, 01:00) UTC.
  const w = K.nightCut("2026-12-07", cal);
  assert.deepEqual(w, { fromUtcMs: Date.UTC(2026, 11, 7, 21, 0, 0), toUtcMs: Date.UTC(2026, 11, 8, 1, 0, 0) });
  assert.equal(K.inCut(w, Date.UTC(2026, 11, 8, 0, 59, 59, 999)), true, "a trade at 19:59:59.999 ET enters");
  assert.equal(K.inCut(w, Date.UTC(2026, 11, 8, 1, 0, 0, 0)), false, "a trade at 20:00:00.000 ET does not: the window is open on the right");
  assert.equal(K.inCut(w, Date.UTC(2026, 11, 7, 21, 0, 0, 0)), true, "16:00:00.000 ET opens the window");
  assert.equal(K.inCut(w, Date.UTC(2026, 11, 7, 20, 59, 59, 999)), false, "15:59:59.999 ET is regular session");
  // Tuesday 2026-07-07, daylight time (ET = UTC-4): [20:00, 00:00) UTC.
  assert.deepEqual(K.nightCut("2026-07-07", cal), { fromUtcMs: Date.UTC(2026, 6, 7, 20, 0, 0), toUtcMs: Date.UTC(2026, 6, 8, 0, 0, 0) });
  // A half-day on a fixture calendar (Tuesday 2026-12-08 declared a half-day): [13:00, 17:00) ET = [18:00, 22:00) UTC.
  const half = K.nightCut("2026-12-08", bellCalendar(["2026-12-08"]));
  assert.deepEqual(half, { fromUtcMs: Date.UTC(2026, 11, 8, 18, 0, 0), toUtcMs: Date.UTC(2026, 11, 8, 22, 0, 0) });
  assert.equal(K.inCut(half, Date.UTC(2026, 11, 8, 21, 59, 59, 999)), true, "16:59:59.999 ET enters on a half-day");
  assert.equal(K.inCut(half, Date.UTC(2026, 11, 8, 22, 0, 0, 0)), false, "17:00:00.000 ET closes a half-day's window");
  assert.equal(K.inCut(half, Date.UTC(2026, 11, 8, 17, 59, 59, 999)), false, "12:59:59.999 ET is regular session on a half-day");
  // The same date on Bell's own calendar is a full day: the fixture alone made it short.
  assert.equal(K.nightCut("2026-12-08", cal).toUtcMs, Date.UTC(2026, 11, 9, 1, 0, 0));
  // No window is invented: a full closure, a weekend day, a date outside the calendar, a malformed date.
  assert.throws(() => K.nightCut("2026-12-25", cal), /not a trading day/);
  assert.throws(() => K.nightCut("2026-12-12", cal), /not a trading day/);
  assert.throws(() => K.nightCut("2027-01-04", cal), /outside the calendar/);
  assert.throws(() => K.nightCut("2026-12-7", cal), /not a YYYY-MM-DD date/);
});

// killer: apps/koyomi/src/cut.ts:44 CONST "cal.etToUtcMs(y, mo, d, 17, 0, 0)" -> "Date.UTC(y, mo - 1, d, 22, 0, 0)"
test("koyomi_cut_sunday_17h_new_york_dst", () => {
  assert.equal(typeof K.sundayCut, "function", "cut.ts exports sundayCut");
  // killer: apps/koyomi/src/cut.ts:35 CONST "checkIso(sundayISO);" -> "checkIso(sundayISO); if (!inRange(cal, sundayISO)) throw new RangeError(\"outside\");"
  // The fixture's literal range ends 2026-12-31 and both 2027 Sundays lie past it: the Sunday cut never consults the range.
  const cal = bellCalendar();
  assert.equal(cal.range.toISO < "2027-03-07", true, "the Sundays below are outside the fixture's range");
  for (const sunday of ["2027-03-07", "2027-03-14"]) assert.doesNotThrow(() => K.sundayCut(sunday, cal), `${sunday}: a Sunday past the range keeps its cut`);
  // Sunday 2027-03-07, winter time: Saturday 00:00 ET (UTC-5) = 05:00 UTC, Sunday 17:00 ET (UTC-5) = 22:00 UTC.
  const winter = K.sundayCut("2027-03-07", cal);
  assert.deepEqual(winter, { fromUtcMs: Date.UTC(2027, 2, 6, 5, 0, 0), toUtcMs: Date.UTC(2027, 2, 7, 22, 0, 0) });
  // Sunday 2027-03-14, the switch to daylight time at 02:00: Saturday 00:00 ET (UTC-5) = 05:00 UTC, Sunday 17:00 ET (UTC-4) = 21:00 UTC.
  const spring = K.sundayCut("2027-03-14", cal);
  assert.deepEqual(spring, { fromUtcMs: Date.UTC(2027, 2, 13, 5, 0, 0), toUtcMs: Date.UTC(2027, 2, 14, 21, 0, 0) });
  assert.equal(K.inCut(spring, Date.UTC(2027, 2, 14, 20, 59, 59, 999)), true, "16:59:59.999 ET (UTC-4) enters");
  assert.equal(K.inCut(spring, Date.UTC(2027, 2, 14, 21, 0, 0, 0)), false, "17:00:00.000 ET (UTC-4) is cut, an hour before 17:00 ET (UTC-5) would be");
  assert.equal(K.inCut(spring, Date.UTC(2027, 2, 13, 4, 59, 59, 999)), false, "Friday 23:59:59.999 ET (overnight-weekday, weekend regime) does not enter");
  assert.equal(K.inCut(spring, Date.UTC(2027, 2, 13, 5, 0, 0, 0)), true, "Saturday 00:00:00.000 ET opens the weekend session");
  // Sunday 2026-11-01, the switch back to winter time: Saturday 00:00 ET (UTC-4) = 04:00 UTC, Sunday 17:00 ET (UTC-5) = 22:00 UTC.
  assert.deepEqual(K.sundayCut("2026-11-01", cal), { fromUtcMs: Date.UTC(2026, 9, 31, 4, 0, 0), toUtcMs: Date.UTC(2026, 10, 1, 22, 0, 0) });
  // Only a Sunday has a weekend cut.
  assert.throws(() => K.sundayCut("2027-03-13", cal), /not a Sunday/);
  assert.throws(() => K.sundayCut("2027-3-14", cal), /not a YYYY-MM-DD date/);
});
