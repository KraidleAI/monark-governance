// MONARK Koyomi: the slots (G0 KOYOMI-A DK-8, DK-5; tests 3 and 4). The expected rows are the hand-written table of another instance
// (`lecteur` claude-sonnet-5-5, 2026-10-22, without this code; MONARK recount equal), copied value for value from
// table-A1-b-i-creneaux.json (sha256 51c9d892221c...): 61 nights [rank, D, D', label], 16 Sundays [D, label]. MONARK's ruling: the rank
// counts the `night` lines only, a `holiday` night has none (null); a closed Monday is not a night. The calendar is Bell's committed one
// (relational) with the 2027 full closures read on the NYSE page (FAITS-etiquette-calendrier-2026-10-14 §E4: 2027-01-01, 01-18,
// 02-15, 03-26) and a range ending 2027-03-31; the slots module imports nothing from Bell (C-A1-13). Namespace imports.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../bell/src/sessions.ts";
import * as K from "../src/slots.ts";

const E4_2027_CLOSURES = ["2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26"];
/** Bell's calendar plus the §E4 closures of 2027, covered up to `toISO`. */
const calendarTo = (toISO: string): K.NyCalendar => ({
  fullClosures: new Set([...S.FULL_CLOSURES, ...E4_2027_CLOSURES]), halfDays: S.HALF_DAYS,
  range: { fromISO: S.CALENDAR_RANGE.fromISO, toISO }, etToUtcMs: S.etWallClockToUtcMs, sipSwitchSundayET: S.SIP_ETH_FROM_ET,
});
const CAL = calendarTo("2027-03-31");

const NIGHTS: readonly (readonly [number | null, string, string, string])[] = [
  [1, "2026-12-07", "2026-12-08", "night"], [2, "2026-12-08", "2026-12-09", "night"], [3, "2026-12-09", "2026-12-10", "night"], [4, "2026-12-10", "2026-12-11", "night"],
  [5, "2026-12-14", "2026-12-15", "night"], [6, "2026-12-15", "2026-12-16", "night"], [7, "2026-12-16", "2026-12-17", "night"], [8, "2026-12-17", "2026-12-18", "night"],
  [9, "2026-12-21", "2026-12-22", "night"], [10, "2026-12-22", "2026-12-23", "night"], [11, "2026-12-23", "2026-12-24", "night"], [null, "2026-12-24", "2026-12-28", "holiday"],
  [12, "2026-12-28", "2026-12-29", "night"], [13, "2026-12-29", "2026-12-30", "night"], [14, "2026-12-30", "2026-12-31", "night"], [null, "2026-12-31", "2027-01-04", "holiday"],
  [15, "2027-01-04", "2027-01-05", "night"], [16, "2027-01-05", "2027-01-06", "night"], [17, "2027-01-06", "2027-01-07", "night"], [18, "2027-01-07", "2027-01-08", "night"],
  [19, "2027-01-11", "2027-01-12", "night"], [20, "2027-01-12", "2027-01-13", "night"], [21, "2027-01-13", "2027-01-14", "night"], [22, "2027-01-14", "2027-01-15", "night"],
  [23, "2027-01-19", "2027-01-20", "night"], [24, "2027-01-20", "2027-01-21", "night"], [25, "2027-01-21", "2027-01-22", "night"], [26, "2027-01-25", "2027-01-26", "night"],
  [27, "2027-01-26", "2027-01-27", "night"], [28, "2027-01-27", "2027-01-28", "night"], [29, "2027-01-28", "2027-01-29", "night"], [30, "2027-02-01", "2027-02-02", "night"],
  [31, "2027-02-02", "2027-02-03", "night"], [32, "2027-02-03", "2027-02-04", "night"], [33, "2027-02-04", "2027-02-05", "night"], [34, "2027-02-08", "2027-02-09", "night"],
  [35, "2027-02-09", "2027-02-10", "night"], [36, "2027-02-10", "2027-02-11", "night"], [37, "2027-02-11", "2027-02-12", "night"], [38, "2027-02-16", "2027-02-17", "night"],
  [39, "2027-02-17", "2027-02-18", "night"], [40, "2027-02-18", "2027-02-19", "night"], [41, "2027-02-22", "2027-02-23", "night"], [42, "2027-02-23", "2027-02-24", "night"],
  [43, "2027-02-24", "2027-02-25", "night"], [44, "2027-02-25", "2027-02-26", "night"], [45, "2027-03-01", "2027-03-02", "night"], [46, "2027-03-02", "2027-03-03", "night"],
  [47, "2027-03-03", "2027-03-04", "night"], [48, "2027-03-04", "2027-03-05", "night"], [49, "2027-03-08", "2027-03-09", "night"], [50, "2027-03-09", "2027-03-10", "night"],
  [51, "2027-03-10", "2027-03-11", "night"], [52, "2027-03-11", "2027-03-12", "night"], [53, "2027-03-15", "2027-03-16", "night"], [54, "2027-03-16", "2027-03-17", "night"],
  [55, "2027-03-17", "2027-03-18", "night"], [56, "2027-03-18", "2027-03-19", "night"], [57, "2027-03-22", "2027-03-23", "night"], [58, "2027-03-23", "2027-03-24", "night"],
  [59, "2027-03-24", "2027-03-25", "night"],
];
const SUNDAYS: readonly (readonly [string, string])[] = [
  ["2026-12-06", "straddle"], ["2026-12-13", "ordinary"], ["2026-12-20", "ordinary"], ["2026-12-27", "holiday"],
  ["2027-01-03", "holiday"], ["2027-01-10", "ordinary"], ["2027-01-17", "holiday"], ["2027-01-24", "ordinary"],
  ["2027-01-31", "ordinary"], ["2027-02-07", "ordinary"], ["2027-02-14", "holiday"], ["2027-02-21", "ordinary"],
  ["2027-02-28", "ordinary"], ["2027-03-07", "ordinary"], ["2027-03-14", "ordinary"], ["2027-03-21", "ordinary"],
];

// killer: apps/koyomi/src/slots.ts:64 CONST "dow > 4" -> "dow > 5"
test("koyomi_slots_night_monday_to_thursday_next_trading", () => {
  assert.equal(typeof K.nightSlots, "function", "slots.ts exports nightSlots");
  const nights = K.nightSlots("2026-12-07", "2027-03-24", CAL);
  assert.deepEqual(nights.map((n) => [n.rank, n.d, n.dNext, n.label]), NIGHTS.map((r) => [...r]), "the hand-written table, row for row");
  // The G0's landmarks (test 3): 9th night 12-21, 29th 01-28, 59th 03-24; the nights of 12-24 and 12-31 are `holiday`.
  const byRank = (r: number): string | undefined => nights.find((n) => n.rank === r)?.d;
  assert.deepEqual([byRank(9), byRank(29), byRank(59)], ["2026-12-21", "2027-01-28", "2027-03-24"]);
  assert.deepEqual(nights.filter((n) => n.label === "holiday").map((n) => n.d), ["2026-12-24", "2026-12-31"]);
  // killer: apps/koyomi/src/slots.ts:70 CONST "dNext === next ? \"night\"" -> "true ? \"night\""
  // The Thursday before a closed Friday is never counted, and a closed Monday is no night at all (D has no close).
  assert.equal(nights.find((n) => n.d === "2026-12-24")?.rank, null);
  assert.equal(nights.some((n) => n.d === "2027-01-18" || n.d === "2027-02-15"), false);
  assert.equal(nights.some((n) => [5, 6, 0].includes(new Date(n.d + "T12:00:00Z").getUTCDay())), false, "no Friday, Saturday or Sunday");
  // The day before Thanksgiving 2026 (Wednesday 11-25) is a `holiday` night; the half-day of 11-27 is a Friday, no night.
  assert.deepEqual(K.nightSlots("2026-11-23", "2026-11-27", CAL).map((n) => [n.rank, n.d, n.dNext, n.label]),
    [[1, "2026-11-23", "2026-11-24", "night"], [2, "2026-11-24", "2026-11-25", "night"], [null, "2026-11-25", "2026-11-27", "holiday"]]);
  // Outside the covered range, line by line `calendar_unknown`, never a guessed night: with a calendar ending 2026-12-31, the 31st
  // (its next day unknown) and every Monday-to-Thursday of January carry no rank.
  const short = K.nightSlots("2026-12-28", "2027-01-07", calendarTo("2026-12-31")).map((n) => [n.rank, n.d, n.dNext, n.label]);
  assert.deepEqual(short, [[1, "2026-12-28", "2026-12-29", "night"], [2, "2026-12-29", "2026-12-30", "night"], [3, "2026-12-30", "2026-12-31", "night"],
    [null, "2026-12-31", null, "calendar_unknown"], [null, "2027-01-04", null, "calendar_unknown"], [null, "2027-01-05", null, "calendar_unknown"],
    [null, "2027-01-06", null, "calendar_unknown"], [null, "2027-01-07", null, "calendar_unknown"]]);
  assert.throws(() => K.nightSlots("2026-12-7", "2027-03-24", CAL), /not a YYYY-MM-DD date/);
  assert.throws(() => K.nightSlots("2026-02-30", "2027-03-24", CAL), /not a YYYY-MM-DD date/);
});

// killer: apps/koyomi/src/slots.ts:87 CONST "straddles(cal, dPrev, dNext) ? \"straddle\"" -> "false ? \"straddle\""
test("koyomi_slots_sunday_holiday_and_straddle", () => {
  assert.equal(typeof K.sundaySlots, "function", "slots.ts exports sundaySlots");
  const sundays = K.sundaySlots("2026-12-06", "2027-03-24", CAL);
  assert.deepEqual(sundays.map((s) => [s.d, s.label]), SUNDAYS.map((r) => [...r]), "the hand-written table, row for row");
  // The straddle closure (Friday 12-04 under one SIP regime, Monday 12-07 under the other) is never counted; holidays neither.
  const sw = sundays.find((s) => s.d === "2026-12-06");
  assert.deepEqual(sw && [sw.rank, sw.dPrev, sw.dNext], [null, "2026-12-04", "2026-12-07"]);
  assert.deepEqual(sundays.filter((s) => s.rank === null).map((s) => s.d), ["2026-12-06", "2026-12-27", "2027-01-03", "2027-01-17", "2027-02-14"]);
  // Landmarks of the checkpoint-1 of the G0 (CP1-G0-KOYOMI l.32): 4th weekend 2027-01-24, 9th 2027-03-07.
  assert.deepEqual([4, 9].map((r) => sundays.find((s) => s.rank === r)?.d), ["2027-01-24", "2027-03-07"]);
  // A holiday Sunday names its closure: Friday 2027-01-01 closed (D = Thursday 12-31), Monday 01-18 closed (D' = Tuesday 01-19).
  assert.deepEqual(sundays.filter((s) => s.d === "2027-01-03" || s.d === "2027-01-17").map((s) => [s.dPrev, s.dNext]),
    [["2026-12-31", "2027-01-04"], ["2027-01-15", "2027-01-19"]]);
  // The weekend before the switch is ordinary: the straddle is the switch Sunday's closure alone.
  assert.equal(K.sundaySlots("2026-11-29", "2026-11-29", CAL)[0]?.label, "ordinary");
  // Outside the covered range: `calendar_unknown`, no rank (the calendar ends 2026-12-31, so D' of 2027-01-03 is unknown).
  assert.deepEqual(K.sundaySlots("2026-12-20", "2027-01-10", calendarTo("2026-12-31")).map((s) => [s.rank, s.d, s.label]),
    [[1, "2026-12-20", "ordinary"], [null, "2026-12-27", "holiday"], [null, "2027-01-03", "calendar_unknown"], [null, "2027-01-10", "calendar_unknown"]]);
  // A Sunday inside the calendar whose D' is not: still `calendar_unknown` (the calendar ends on that very Sunday).
  assert.deepEqual(K.sundaySlots("2026-12-20", "2026-12-20", calendarTo("2026-12-20")).map((s) => [s.rank, s.dPrev, s.dNext, s.label]),
    [[null, "2026-12-18", null, "calendar_unknown"]]);
  // killer: apps/koyomi/src/slots.ts:70 CONST "straddles(cal, d, dNext) ? \"straddle\"" -> "false ? \"straddle\""
  // Fixture calendar, switch Sunday moved to 2027-01-03 (behind the closed Friday 01-01): the closure from Thursday 12-31 to Monday
  // 01-04 holds it, so both its night and its Sunday are `straddle`, ahead of `holiday`; the other closures keep their labels.
  const moved: K.NyCalendar = { ...CAL, sipSwitchSundayET: "2027-01-03" };
  assert.deepEqual(K.nightSlots("2026-12-28", "2027-01-04", moved).map((n) => [n.rank, n.d, n.label]),
    [[1, "2026-12-28", "night"], [2, "2026-12-29", "night"], [3, "2026-12-30", "night"], [null, "2026-12-31", "straddle"], [4, "2027-01-04", "night"]]);
  assert.deepEqual(K.sundaySlots("2026-12-27", "2027-01-10", moved).map((s) => [s.rank, s.d, s.label]),
    [[null, "2026-12-27", "holiday"], [null, "2027-01-03", "straddle"], [1, "2027-01-10", "ordinary"]]);
});
