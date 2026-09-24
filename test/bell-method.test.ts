/**
 * Root test for the /bell/method page (lot SITE-CHARTE-C; decision 146): the collector DEFINITIONS the page restates
 * (apps/site/lib/bell-method.ts) equal the collector source (apps/bell/src) — the session bounds are replayed through
 * the collector's own classifySession() at the minute they claim, the calendar sets and the decimals are compared for
 * equality, and the residual list covers the collector's closed list (codes of a lot not merged at this base may
 * appear as upcoming). Non-LLM oracle, run by `npm test`. Mutants (named, measured in the lot report): write "04:30"
 * as the pre-open bound => reds; drop a residual code from the page list => reds.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BELL_SESSION_BOUNDS_ET,
  BELL_CALENDAR,
  BELL_DECIMALS,
  BELL_RESIDUALS_SESSIONS,
  BELL_RESIDUALS_HALTS_RESERVES,
  BELL_RESIDUALS_UPCOMING,
} from "../apps/site/lib/bell-method.ts";
import { classifySession, etWallClockToUtcMs, FULL_CLOSURES, HALF_DAYS, CALENDAR_RANGE } from "../apps/bell/src/sessions.ts";
import { GAP_PRECISION } from "../apps/bell/src/gap.ts";
import { RESIDUAL_CODES } from "../apps/bell/src/residuals.ts";

test("bell_method_facts_match_collector — /bell/method definitions equal apps/bell/src (bounds, calendar, decimals, residuals)", () => {
  // Bounds: replay each claimed minute through the collector's classifier, on a normal day and on a half-day.
  const at = (dateISO: string, hhmm: string): string => {
    const [y, mo, d] = dateISO.split("-").map(Number);
    const [h, mi] = hhmm.split(":").map(Number);
    return classifySession(etWallClockToUtcMs(y ?? 0, mo ?? 0, d ?? 0, h ?? 0, mi ?? 0, 0)).session;
  };
  const minus = (hhmm: string): string => {
    const [h, mi] = hhmm.split(":").map(Number);
    const t = (h ?? 0) * 60 + (mi ?? 0) - 1;
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };
  const b = BELL_SESSION_BOUNDS_ET;
  const normal = "2026-09-22"; // a Tuesday, full trading day in the committed calendar
  const half = "2026-11-27"; // a half-day in the committed calendar
  assert.ok(!FULL_CLOSURES.has(normal) && !HALF_DAYS.has(normal) && HALF_DAYS.has(half), "fixture days must be a normal day and a half-day");
  const flips: Array<[string, string, string, string]> = [
    [normal, b.preOpen, "overnight-weekday", "pre"],
    [normal, b.regularOpen, "pre", "regular"],
    [normal, b.regularClose, "regular", "after"],
    [normal, b.afterClose, "after", "overnight-weekday"],
    [half, b.regularCloseHalfDay, "regular", "after"],
    [half, b.afterCloseHalfDay, "after", "overnight-weekday"],
  ];
  for (const [day, bound, before, after] of flips) {
    assert.equal(at(day, minus(bound)), before, `${day} one minute before ${bound} ET must be ${before}`);
    assert.equal(at(day, bound), after, `${day} at ${bound} ET must be ${after}`);
  }
  // Calendar: identical range and sets.
  assert.equal(BELL_CALENDAR.from, CALENDAR_RANGE.fromISO);
  assert.equal(BELL_CALENDAR.to, CALENDAR_RANGE.toISO);
  assert.deepEqual([...BELL_CALENDAR.fullClosures].sort(), [...FULL_CLOSURES].sort(), "full closures must equal sessions.ts FULL_CLOSURES");
  assert.deepEqual([...BELL_CALENDAR.halfDays].sort(), [...HALF_DAYS].sort(), "half-days must equal sessions.ts HALF_DAYS");
  // Decimals.
  assert.equal(BELL_DECIMALS, GAP_PRECISION, "decimals must equal gap.ts GAP_PRECISION");
  // Residuals: every served code listed on the page is in the collector's closed list, and every code of the
  // closed list is on the page (as served or, for a lot not merged at this base, as upcoming).
  const listed = [...BELL_RESIDUALS_SESSIONS, ...BELL_RESIDUALS_HALTS_RESERVES].map((r) => r.code);
  const upcoming = BELL_RESIDUALS_UPCOMING.map((r) => r.code);
  const closed = new Set<string>(RESIDUAL_CODES);
  for (const c of listed) assert.ok(closed.has(c), `page lists '${c}' as a residual but the collector's closed list does not carry it`);
  assert.equal(new Set(listed).size, listed.length, "no residual code listed twice");
  for (const c of closed) assert.ok(listed.includes(c) || upcoming.includes(c), `collector residual '${c}' is missing from /bell/method`);
});
