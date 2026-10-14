// MONARK rpc-guard: the billing cycle identifier, derived from the account's anchor instant (never posed by hand). Cycles start at
// the anchor and at the same wall-clock day and time of each following civil month, in the anchor's own UTC offset, the day clamped
// to the month's last day; the identifier is "<op>-<YYYY-MM-DD>" of the cycle's start in that offset.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as pub from "@monark/rpc-guard";
import { cycleOf, nextCycleBoundary } from "../src/cycle.ts";

const at = (iso: string): number => Date.parse(iso);

// killer: packages/rpc-guard/src/cycle.ts:29 CONST "Math.min(a.d, daysIn(y, m))" -> "a.d"
test("rpc_guard_cycle_of_derives_id_from_anchor_instant", () => {
  // Month ends: an anchor on the 31st starts February on its last day, then March and May on the 31st again, April on the 30th.
  const a31 = "2026-01-31T00:00:00Z";
  assert.equal(cycleOf(at("2026-01-31T00:00:00Z"), a31, "helius"), "helius-2026-01-31", "the anchor instant opens the first cycle");
  assert.equal(cycleOf(at("2026-02-27T23:59:59.999Z"), a31, "helius"), "helius-2026-01-31");
  assert.equal(cycleOf(at("2026-02-28T00:00:00Z"), a31, "helius"), "helius-2026-02-28", "February has 28 days in 2026");
  assert.equal(cycleOf(at("2026-03-30T12:00:00Z"), a31, "helius"), "helius-2026-02-28");
  assert.equal(cycleOf(at("2026-03-31T00:00:00Z"), a31, "helius"), "helius-2026-03-31", "the clamp never accumulates");
  assert.equal(cycleOf(at("2026-04-30T00:00:00Z"), a31, "helius"), "helius-2026-04-30");
  assert.equal(cycleOf(at("2026-05-31T00:00:00Z"), a31, "helius"), "helius-2026-05-31");
  // Days 29 and 30, leap and common Februaries.
  assert.equal(cycleOf(at("2026-02-28T00:00:00Z"), "2026-01-29T00:00:00Z", "chainstack"), "chainstack-2026-02-28");
  assert.equal(cycleOf(at("2026-03-29T00:00:00Z"), "2026-01-29T00:00:00Z", "chainstack"), "chainstack-2026-03-29");
  assert.equal(cycleOf(at("2028-02-29T00:00:00Z"), "2028-01-30T00:00:00Z", "chainstack"), "chainstack-2028-02-29", "2028 is a leap year");
  assert.equal(cycleOf(at("2028-02-28T23:59:59Z"), "2028-01-30T00:00:00Z", "chainstack"), "chainstack-2028-01-30");
  // Hour and offset: the anchor's own wall clock decides the bound and the date of the identifier.
  const aNy = "2026-09-19T14:30:00-04:00"; // 18:30Z
  assert.equal(cycleOf(at("2026-10-19T18:29:59.999Z"), aNy, "helius"), "helius-2026-09-19");
  assert.equal(cycleOf(at("2026-10-19T18:30:00Z"), aNy, "helius"), "helius-2026-10-19");
  const aLate = "2026-09-19T22:00:00-04:00"; // 2026-09-20T02:00Z: the identifier keeps the anchor's own date
  assert.equal(cycleOf(at("2026-09-20T02:00:00Z"), aLate, "helius"), "helius-2026-09-19");
  assert.equal(cycleOf(at("2026-10-20T01:59:59Z"), aLate, "helius"), "helius-2026-09-19");
  assert.equal(cycleOf(at("2026-10-20T02:00:00Z"), aLate, "helius"), "helius-2026-10-19");
  assert.equal(cycleOf(at("2026-10-19T23:30:00Z"), "2026-09-20T05:00:00+05:30", "helius"), "helius-2026-10-20", "a positive offset");
  // Year rollover and a long run of cycles.
  assert.equal(cycleOf(at("2027-01-20T00:00:00Z"), "2026-12-15T00:00:00Z", "helius"), "helius-2027-01-15");
  assert.equal(cycleOf(at("2029-06-01T00:00:00Z"), a31, "helius"), "helius-2029-05-31");
  // The next boundary is the start of the next cycle (the straddle refusal reads it).
  assert.equal(nextCycleBoundary(at("2026-02-10T00:00:00Z"), a31), at("2026-02-28T00:00:00Z"));
  assert.equal(nextCycleBoundary(at("2026-02-28T00:00:00Z"), a31), at("2026-03-31T00:00:00Z"));
  assert.equal(nextCycleBoundary(at("2026-10-01T00:00:00Z"), aNy), at("2026-10-19T18:30:00Z"));
  // Refusals by name: an anchor without its offset or out of range, an instant before the anchor, a malformed operator label.
  for (const bad of ["2026-09-19", "2026-09-19T00:00:00", "2026-02-30T00:00:00Z", "2026-13-01T00:00:00Z", "2026-09-19T24:00:00Z", "2026-09-19T00:00:00+5:00"]) {
    assert.throws(() => cycleOf(at("2026-10-01T00:00:00Z"), bad, "helius"), /cycle: anchor/, `anchor ${bad} refused`);
  }
  assert.throws(() => cycleOf(at("2026-01-30T23:59:59Z"), a31, "helius"), /cycle: the instant precedes the anchor/);
  assert.throws(() => cycleOf(Number.NaN, a31, "helius"), /cycle: the instant/);
  assert.throws(() => cycleOf(at("2026-02-01T00:00:00Z"), a31, "Helius X"), /cycle: operator label/);
  // The package exports the same functions (one writer of cycleOf: this file).
  assert.equal(pub.cycleOf, cycleOf);
  assert.equal(pub.nextCycleBoundary, nextCycleBoundary);
});

// killer: packages/rpc-guard/src/cycle.ts:20 CONST "offM > 59 || " -> ""
test("rpc_guard_cycle_anchor_offset_minutes_above_59_refused", () => {
  // CYCLE-ANCHOR-MINUTES-1: the minutes of a UTC offset run from 00 to 59. "+05:99" would read as +06:39, inside the 14 h bound, and
  // "+00:60" as +01:00: each is refused by name, by cycleOf and by nextCycleBoundary alike.
  for (const bad of ["2026-09-19T00:00:00+05:99", "2026-09-19T00:00:00-03:60", "2026-09-19T00:00:00+00:60"]) {
    assert.throws(() => cycleOf(at("2026-10-01T00:00:00Z"), bad, "helius"), /^RangeError: cycle: anchor out of range$/, `anchor ${bad} refused by name`);
    assert.throws(() => nextCycleBoundary(at("2026-10-01T00:00:00Z"), bad), /^RangeError: cycle: anchor out of range$/, `boundary of ${bad} refused`);
  }
  // The bounds stay where they were: 59 minutes are an offset, and 14 h is the largest one (a refusal read as a value, never thrown).
  const read = (f: () => unknown): unknown => { try { return f(); } catch (e) { return String(e); } };
  assert.equal(read(() => cycleOf(at("2026-10-01T00:00:00Z"), "2026-09-19T00:00:00+05:59", "helius")), "helius-2026-09-19");
  assert.equal(read(() => cycleOf(at("2026-10-01T00:00:00Z"), "2026-09-19T00:00:00-14:00", "helius")), "helius-2026-09-19");
  assert.equal(read(() => nextCycleBoundary(at("2026-10-01T00:00:00Z"), "2026-09-19T00:00:00-00:59")), at("2026-10-19T00:59:00Z"));
});
