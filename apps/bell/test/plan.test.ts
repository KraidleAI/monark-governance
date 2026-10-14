// MONARK Bell: the collection planner (apps/bell/src/plan.ts), pure. A unit U(D) runs from 04:00 ET of the trading day D to
// 04:00 ET of the next trading day D'; it is due once its end plus the margin AND every session's publication gate have
// passed; at most one unit per tick; calendar_exhausted when D' (or the ADV month of D) leaves the committed calendar.
import { test } from "node:test";
import assert from "node:assert/strict";
import { classifySession, etWallClockToUtcMs } from "../src/sessions.ts";
import { dueInstant, planUnit, unitOf, UNITS_PER_TICK, type PlanProgress, type PlanResult } from "../src/plan.ts";

const H = 3_600_000, MIN = 60_000, MARGIN = 30;
const ymd = (iso: string): [number, number, number] => iso.split("-").map(Number) as [number, number, number];
/** An ET wall-clock instant of an ISO date. */
const et = (iso: string, h: number, mi = 0, s = 0, ms = 0): number => { const [y, mo, d] = ymd(iso); return etWallClockToUtcMs(y, mo, d, h, mi, s) + ms; };
const after = (d: string): PlanProgress => ({ seedET: "2026-10-01", lastDepositedET: d });
const unitsOf = (r: PlanResult): string[] => (r.kind === "units" ? r.units.map((u) => u.d) : [r.kind]);
const keyOf = (t: number): string => { const c = classifySession(t); return `${c.session}|${String(c.regime)}|${c.sessionDateET}`; };

// killer: apps/bell/src/plan.ts:26 CONST "Math.floor(PRE_OPEN / 60), PRE_OPEN % 60" -> "0, 0"
test("bell_plan_unit_boundaries_are_trading_day_preopens", () => {
  const cases: ReadonlyArray<readonly [string, string, number]> = [
    ["2026-10-13", "2026-10-14", 24], // a weekday
    ["2026-10-16", "2026-10-19", 72], // a Friday
    ["2026-11-25", "2026-11-27", 48], // over Thanksgiving, into a half-day
    ["2026-07-02", "2026-07-06", 96], // over the observed Independence Day and the weekend
    // The four DST changes of 2025 and 2026 fall on a Sunday, inside a Friday unit: one hour shorter in March, one longer in November.
    ["2025-03-07", "2025-03-10", 71], ["2025-10-31", "2025-11-03", 73], ["2026-03-06", "2026-03-09", 71], ["2026-10-30", "2026-11-02", 73],
  ];
  for (const [d, dNext, hours] of cases) {
    const u = unitOf(d);
    assert.equal(u.d, d);
    assert.equal(u.dNext, dNext, `the next trading day of ${d}`);
    assert.equal(u.startMs, et(d, 4), `U(${d}) starts at 04:00 ET of ${d}`);
    assert.equal(u.endMs, et(dNext, 4), `U(${d}) ends at 04:00 ET of ${dNext}`);
    assert.equal((u.endMs - u.startMs) / H, hours, `U(${d}) lasts ${String(hours)} h`);
    assert.equal(unitOf(dNext).startMs, u.endMs, "units tile time with no gap");
  }
  // UTC of the pre-open: 08:00Z under daylight time, 09:00Z under standard time.
  assert.equal(unitOf("2026-10-13").startMs, Date.UTC(2026, 9, 13, 8, 0, 0));
  assert.equal(unitOf("2026-12-07").startMs, Date.UTC(2026, 11, 7, 9, 0, 0));
  for (const bad of ["2026-10-17", "2026-11-26", "2026-1-5"]) assert.throws(() => unitOf(bad), RangeError, `${bad} is not a trading day`);
});

// killer: apps/bell/src/sessions.ts:111 SDL "for (let k = 0; k < 10 && !isTradingDay(n); k++) n = addDays(n, 1);" -> ""
test("bell_plan_unit_never_splits_a_session_key", () => {
  // A weekday, a Friday (its overnight-weekday key in two pieces around the weekend), a day before a full closure, a half-day,
  // a Friday before a Monday closure: every key seen inside U(D) is anchored on D and seen nowhere outside it.
  for (const d of ["2026-10-13", "2026-10-16", "2026-11-25", "2026-11-27", "2026-12-24", "2026-09-04"]) {
    const u = unitOf(d), prev = { startMs: u.startMs - 4 * 24 * H, endMs: u.startMs }, next = { startMs: u.endMs, endMs: u.endMs + 4 * 24 * H };
    const inside = new Set<string>(), outside = new Set<string>();
    for (let t = u.startMs; t < u.endMs; t += 15 * MIN) inside.add(keyOf(t));
    inside.add(keyOf(u.endMs - 1));
    for (const w of [prev, next]) for (let t = w.startMs; t < w.endMs; t += 15 * MIN) outside.add(keyOf(t));
    for (const k of inside) {
      assert.ok(k.endsWith(`|${d}`), `${k} inside U(${d}) is anchored on ${d}`);
      assert.ok(!outside.has(k), `${k} is split across the bounds of U(${d})`);
    }
    assert.equal(classifySession(u.endMs).sessionDateET, u.dNext, "the end instant opens the next unit");
    assert.notEqual(classifySession(u.startMs - 1).sessionDateET, d, "the instant before the start belongs to the previous unit");
  }
  // Friday's overnight-weekday key: Friday 20:00 ET to midnight, then Monday midnight to 04:00 ET, the weekend between.
  const fri = unitOf("2026-10-16"), seq: string[] = [];
  for (let t = fri.startMs; t < fri.endMs; t += 30 * MIN) { const k = keyOf(t); if (seq[seq.length - 1] !== k) seq.push(k); }
  assert.deepEqual(seq, ["pre|null|2026-10-16", "regular|null|2026-10-16", "after|null|2026-10-16", "overnight-weekday|weekend|2026-10-16",
    "weekend|weekend|2026-10-16", "overnight-weekday|weekend|2026-10-16"]);
});

// killer: apps/bell/src/plan.ts:26 CONST "etWallClockToUtcMs(y ?? 0, mo ?? 1, d ?? 1," -> "5 * 3_600_000 + Date.UTC(y ?? 0, (mo ?? 1) - 1, d ?? 1,"
test("bell_plan_unit_due_instant_across_dst_and_half_days", () => {
  const cases: ReadonlyArray<readonly [string, number]> = [
    ["2026-03-05", Date.UTC(2026, 2, 6, 21, 0)], // Thursday, standard time: 16:00 ET (UTC-5) of Friday
    ["2026-03-06", Date.UTC(2026, 2, 9, 8, 30)], // Friday over the March change: 04:30 ET (UTC-4) of Monday
    ["2026-03-09", Date.UTC(2026, 2, 10, 20, 0)], // Monday, daylight time: 16:00 ET (UTC-4) of Tuesday
    ["2025-10-31", Date.UTC(2025, 10, 3, 9, 30)], // Friday over the November change: 04:30 ET (UTC-5) of Monday
    ["2026-10-16", Date.UTC(2026, 9, 19, 8, 30)], // Friday, daylight time: 04:30 ET (UTC-4) of Monday
    ["2026-11-25", Date.UTC(2026, 10, 27, 9, 30)], // over Thanksgiving: the end (04:30 ET (UTC-5) of the half-day) passes after the gate
    ["2026-11-27", Date.UTC(2026, 10, 30, 9, 30)], // the half-day itself, a Friday: 04:30 ET (UTC-5) of Monday
    ["2026-12-23", Date.UTC(2026, 11, 24, 21, 0)], // into the Christmas Eve half-day: the gate, 16:00 ET (UTC-5)
    ["2026-12-24", Date.UTC(2026, 11, 28, 9, 30)], // the half-day over Christmas and the weekend: 04:30 ET (UTC-5) of Monday
  ];
  for (const [d, due] of cases) assert.equal(dueInstant(unitOf(d), MARGIN), due, `the due instant of U(${d})`);
});

// killer: apps/bell/src/plan.ts:40 CONST "Math.max(ready, gate)" -> "gate"
test("bell_plan_unit_due_needs_end_plus_margin_and_every_gate", () => {
  // The Friday unit: its gate (Saturday 16:00 ET) passes long before its end (Monday 04:00 ET); the gate alone is not enough.
  const fri = after("2026-10-15");
  assert.equal(planUnit(et("2026-10-17", 16), fri, MARGIN).kind, "nothing_due", "Saturday 16:00 ET: gate passed, end not");
  assert.equal(planUnit(et("2026-10-19", 4, 29, 59, 999), fri, MARGIN).kind, "nothing_due", "end + 29 min 59 s");
  assert.deepEqual(unitsOf(planUnit(et("2026-10-19", 4, 30), fri, MARGIN)), ["2026-10-16"], "end + 30 min");
  // A weekday unit: its end plus the margin (04:30 ET of D') passes long before its gate (16:00 ET of D').
  const tue = after("2026-10-12");
  assert.equal(planUnit(et("2026-10-14", 4, 30), tue, MARGIN).kind, "nothing_due", "end + margin passed, gate not");
  assert.equal(planUnit(et("2026-10-14", 15, 59, 59, 999), tue, MARGIN).kind, "nothing_due");
  assert.deepEqual(unitsOf(planUnit(et("2026-10-14", 16), tue, MARGIN)), ["2026-10-13"], "16:00 ET of D'");
  // The margin is the caller's parameter (pinned at 30 min by the deployment constants), never a literal of the planner.
  assert.equal(planUnit(et("2026-10-19", 4, 31), fri, 31 + 1).kind, "nothing_due");
  assert.throws(() => planUnit(et("2026-10-19", 4, 30), fri, -1), RangeError);
  // The seed is the first unit when nothing is deposited yet.
  assert.deepEqual(unitsOf(planUnit(et("2026-10-19", 4, 30), { seedET: "2026-10-16", lastDepositedET: null }, MARGIN)), ["2026-10-16"]);
});

// killer: apps/bell/src/plan.ts:19 CONST "UNITS_PER_TICK = 1" -> "UNITS_PER_TICK = 2"
test("bell_plan_emits_at_most_one_unit_per_tick", () => {
  // Three units due (Tuesday, Wednesday, Thursday): one is returned, the first not yet deposited.
  const r = planUnit(et("2026-10-16", 17), after("2026-10-12"), MARGIN);
  assert.equal(UNITS_PER_TICK, 1);
  assert.deepEqual(unitsOf(r), ["2026-10-13"]);
  assert.equal(dueInstant(unitOf("2026-10-15"), MARGIN) <= et("2026-10-16", 17), true, "the third unit is due too");
});

// killer: apps/bell/src/plan.ts:46 SDL "if (nextTradingDay(d) > CALENDAR_RANGE.toISO) return true;" -> ""
test("bell_plan_refuses_calendar_exhausted_on_next_trading_day", () => {
  const late = Date.UTC(2027, 0, 20, 12, 0);
  // The unit of 2026-12-30 ends on 2026-12-31, inside the calendar; the unit of 2026-12-31 needs 2027-01-01, outside it.
  assert.deepEqual(unitsOf(planUnit(late, after("2026-12-29"), MARGIN)), ["2026-12-30"]);
  assert.deepEqual(planUnit(late, after("2026-12-30"), MARGIN), { kind: "calendar_exhausted", d: "2026-12-31" });
  // The ADV month of a January 2025 unit (December 2024) is outside the calendar too; February 2025 is inside.
  assert.deepEqual(planUnit(late, { seedET: "2025-01-02", lastDepositedET: null }, MARGIN), { kind: "calendar_exhausted", d: "2025-01-02" });
  assert.deepEqual(unitsOf(planUnit(late, { seedET: "2025-02-03", lastDepositedET: null }, MARGIN)), ["2025-02-03"]);
});

// killer: apps/bell/src/plan.ts:33 CONST "endMs: preOpenUtc(dNext) }" -> "endMs: preOpenUtc(dNext) - (dNext > \"2026-12-06\" ? 25_200_000 : 0) }"
test("bell_plan_unit_due_instant_is_unchanged_across_the_sip_switch", () => {
  // Units on both sides of 2026-12-06: due at 16:00 ET of D' (weekday) or 04:30 ET of D' (Friday), from 04:00 ET of D', never
  // from the SIP trading day (which opens the evening before from the switch on).
  const cases: ReadonlyArray<readonly [string, number]> = [
    ["2026-12-03", Date.UTC(2026, 11, 4, 21, 0)], ["2026-12-04", Date.UTC(2026, 11, 7, 9, 30)],
    ["2026-12-07", Date.UTC(2026, 11, 8, 21, 0)], ["2026-12-11", Date.UTC(2026, 11, 14, 9, 30)],
  ];
  for (const [d, due] of cases) {
    const u = unitOf(d);
    assert.equal(u.endMs, et(u.dNext, 4), `U(${d}) ends at 04:00 ET of ${u.dNext}`);
    assert.equal(dueInstant(u, MARGIN), due, `the due instant of U(${d})`);
    assert.ok([30 * MIN, 12 * H].includes(due - u.endMs), "the same two forms on both sides");
  }
});
