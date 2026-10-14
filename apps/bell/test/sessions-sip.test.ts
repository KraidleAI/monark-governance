// MONARK Bell: the dated SIP trading day (two regimes, one switch date) and the publication gate moved into sessions.ts.
// Bell's own session anchor, reference close and publication gate do not move across the switch; only the pure, dated
// sipTradeDateOf says which SIP trading day an instant belongs to. Namespace imports: a symbol absent from the module reads
// undefined and fails an assertion, never the module link.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as S from "../src/sessions.ts";
import * as C from "../src/close.ts";

const SRC = new URL("../src/sessions.ts", import.meta.url);
/** An ET wall-clock instant, to the millisecond (DST through the committed converter). */
const et = (y: number, mo: number, d: number, h: number, mi: number, s = 0, ms = 0): number => S.etWallClockToUtcMs(y, mo, d, h, mi, s) + ms;
/** The SIP trading day of an instant; first asserts the function is exported (red by assertion where it is not). */
function sip(utcMs: number, plan: "cta" | "utp"): string | null {
  assert.equal(typeof S.sipTradeDateOf, "function", "sessions.ts exports sipTradeDateOf");
  return S.sipTradeDateOf(utcMs, plan);
}

// killer: apps/bell/src/sessions.ts:193 CONST "dayStartET: \"03:58\"" -> "dayStartET: \"04:00\""
test("bell_sessions_sip_trade_date_before_the_switch", () => {
  // Current UTP day of a trading day D: 03:58 ET opens it, 20:00 ET closes it (Tuesday 2026-10-13, daylight time).
  assert.equal(sip(et(2026, 10, 13, 3, 58), "utp"), "2026-10-13", "03:58 ET opens the UTP day");
  assert.equal(sip(et(2026, 10, 13, 3, 59, 59), "utp"), "2026-10-13");
  assert.equal(sip(et(2026, 10, 13, 3, 57, 59, 999), "utp"), null, "03:57 ET has no SIP date");
  assert.equal(sip(et(2026, 10, 13, 2, 0), "utp"), null, "02:00 ET has no SIP date");
  assert.equal(sip(et(2026, 10, 13, 12, 0), "utp"), "2026-10-13");
  assert.equal(sip(et(2026, 10, 13, 19, 59, 59, 999), "utp"), "2026-10-13");
  assert.equal(sip(et(2026, 10, 13, 20, 0), "utp"), null, "20:00 ET closes the UTP day");
  assert.equal(sip(et(2026, 10, 13, 22, 0), "utp"), null, "no night session before the switch");
  // Weekend and full closure: no session. Winter time (2026-01-16, a Friday) holds the same bounds.
  assert.equal(sip(et(2026, 10, 17, 10, 0), "utp"), null, "Saturday");
  assert.equal(sip(et(2026, 11, 26, 10, 0), "utp"), null, "Thanksgiving 2026");
  assert.equal(sip(et(2026, 1, 16, 3, 58), "utp"), "2026-01-16");
  assert.equal(sip(et(2026, 1, 16, 3, 57), "utp"), null);
  // The CTA plan before the switch: its table is not read, so the answer is "unread", never a guessed date.
  assert.equal(sip(et(2026, 10, 13, 12, 0), "cta"), "unread");
  assert.equal(sip(et(2026, 10, 13, 22, 0), "cta"), "unread");
  // Outside the committed calendar: "unread" for both plans.
  assert.equal(sip(et(2024, 12, 31, 12, 0), "utp"), "unread");
  assert.equal(sip(et(2027, 1, 4, 12, 0), "utp"), "unread");
});

// killer: apps/bell/src/sessions.ts:212 SDL "if (rule.previousEvening && minute >= end && minute < start) return null;" -> ""
test("bell_sessions_sip_trade_date_after_the_switch", () => {
  // Monday 22:00 ET belongs to Tuesday for both plans.
  assert.equal(sip(et(2026, 12, 7, 22, 0), "utp"), "2026-12-08");
  assert.equal(sip(et(2026, 12, 7, 22, 0), "cta"), "2026-12-08");
  // 20:30 ET: the next day for CTA; no session for UTP (maintenance).
  assert.equal(sip(et(2026, 12, 8, 20, 30), "cta"), "2026-12-09");
  assert.equal(sip(et(2026, 12, 8, 20, 30), "utp"), null);
  // Regular hours keep their own day; 19:59 ET still belongs to the day for both plans.
  assert.equal(sip(et(2026, 12, 8, 10, 0), "utp"), "2026-12-08");
  assert.equal(sip(et(2026, 12, 8, 19, 59), "cta"), "2026-12-08");
  // Friday 21:00 ET: no date (no session opens toward a Saturday); Sunday 21:30 ET belongs to Monday.
  assert.equal(sip(et(2026, 12, 11, 21, 0), "utp"), null);
  assert.equal(sip(et(2026, 12, 11, 21, 0), "cta"), null);
  assert.equal(sip(et(2026, 12, 13, 21, 30), "utp"), "2026-12-14");
  assert.equal(sip(et(2026, 12, 13, 21, 30), "cta"), "2026-12-14");
  // Full closures: no session opens the evening before Christmas; the session resumes the evening of the 27th.
  assert.equal(sip(et(2026, 12, 24, 21, 0), "utp"), null);
  assert.equal(sip(et(2026, 12, 24, 21, 0), "cta"), null);
  assert.equal(sip(et(2026, 12, 27, 21, 30), "utp"), "2026-12-28");
  assert.equal(sip(et(2026, 12, 27, 21, 30), "cta"), "2026-12-28");
  // Depends on LSP-7b (the revised UTP table): 20:54 ET has no UTP date, 20:57 ET belongs to the next day.
  assert.equal(sip(et(2026, 12, 8, 20, 54), "utp"), null);
  assert.equal(sip(et(2026, 12, 8, 20, 57), "utp"), "2026-12-09");
  // A next day past the committed calendar is "unread", not a guess.
  assert.equal(sip(et(2026, 12, 31, 21, 30), "cta"), "unread");
});

// killer: apps/bell/src/sessions.ts:179 CONST "\"2026-12-06\"" -> "\"2026-12-07\""
test("bell_sessions_sip_switch_is_one_dated_constant", () => {
  // Sunday 2026-12-06 21:30 ET belongs to Monday 2026-12-07; Thursday 2026-12-03 21:30 ET to no date (old regime).
  assert.equal(sip(et(2026, 12, 6, 21, 30), "utp"), "2026-12-07");
  assert.equal(sip(et(2026, 12, 6, 21, 30), "cta"), "2026-12-07");
  assert.equal(sip(et(2026, 12, 6, 20, 30), "cta"), "2026-12-07", "the CTA trade date of the first new day opens at 20:00 ET");
  assert.equal(sip(et(2026, 12, 3, 21, 30), "utp"), null);
  assert.equal(sip(et(2026, 12, 3, 21, 30), "cta"), "unread");
  assert.equal(sip(et(2026, 12, 5, 23, 0), "utp"), null, "Saturday night still belongs to the old regime");
  // One switch: a closed table of two regimes, the second keyed by the single dated constant, status announced until LSP-7b.
  assert.equal(S.SIP_ETH_FROM_ET, "2026-12-06");
  assert.equal(S.SIP_ETH_STATUS, "announced");
  assert.equal(S.SIP_DAY_REGIMES.length, 2);
  assert.deepEqual(S.SIP_DAY_REGIMES.map((r) => r.fromET), [null, S.SIP_ETH_FROM_ET]);
  assert.deepEqual(S.SIP_DAY_REGIMES.map((r) => r.status), [null, S.SIP_ETH_STATUS]);
  assert.ok(Object.isFrozen(S.SIP_DAY_REGIMES) && S.SIP_DAY_REGIMES.every((r) => Object.isFrozen(r)), "the table is closed");
  // No second switch date in the source: the only 2026-12-0x literal of sessions.ts is the constant.
  assert.deepEqual(readFileSync(SRC, "utf8").match(/"2026-12-0\d"/g), ['"2026-12-06"']);
});

// killer: apps/bell/src/sessions.ts:142 CONST "sessionDateET: dateISO }" -> "sessionDateET: nextTradingDay(dateISO) }"
test("bell_sessions_anchor_and_ref_close_unchanged_across_the_sip_switch", () => {
  // The same weekly shapes, one week apart, on both sides of the switch: Bell's anchor and reference close do not move.
  for (const [monDay, sunDay, friDay] of [["2026-11-30", "2026-11-29", "2026-11-27"], ["2026-12-07", "2026-12-06", "2026-12-04"]] as const) {
    const [y, mo, d] = monDay.split("-").map(Number) as [number, number, number];
    const night = S.classifySession(et(y, mo, d, 22, 0));
    assert.deepEqual(night, { session: "overnight-weekday", regime: "overnight-weekday", sessionDateET: monDay }, `Monday night anchors on ${monDay}`);
    assert.equal(S.refCloseDateOf(night.session, night.sessionDateET), monDay);
    const [sy, smo, sd] = sunDay.split("-").map(Number) as [number, number, number];
    const sunday = S.classifySession(et(sy, smo, sd, 21, 30));
    assert.deepEqual(sunday, { session: "weekend", regime: "weekend", sessionDateET: friDay }, `Sunday night anchors on Friday ${friDay}`);
    assert.equal(S.refCloseDateOf(sunday.session, sunday.sessionDateET), friDay);
    const morning = S.classifySession(et(y, mo, d, 2, 0));
    assert.equal(morning.sessionDateET, friDay, "Monday 02:00 ET stays in Friday's gap");
    const reg = S.classifySession(et(y, mo, d, 10, 0));
    assert.equal(S.refCloseDateOf(reg.session, reg.sessionDateET), friDay, "the regular session's reference close is the prior trading day");
  }
  // The divergence is declared, not applied: after the switch the SIP day of Monday 22:00 ET is Tuesday, Bell's anchor stays Monday.
  assert.equal(sip(et(2026, 12, 7, 22, 0), "utp"), "2026-12-08");
  assert.equal(sip(et(2026, 12, 6, 21, 30), "utp"), "2026-12-07");
});

// killer: apps/bell/src/sessions.ts:183 CONST "\"20:55\"" -> "\"21:00\""
test("bell_sessions_utp_day_start_is_pinned_at_2055", () => {
  // Depends on LSP-7b: the UTP day of D' starts at 20:55 ET the evening before (read), five minutes before trading opens at 21:00 ET.
  assert.equal(S.UTP_ETH_DAY_START_ET, "20:55");
  assert.equal(sip(et(2026, 12, 7, 20, 54, 59, 999), "utp"), null, "Monday 20:54:59.999 ET has no UTP date");
  assert.equal(sip(et(2026, 12, 7, 20, 55, 0, 0), "utp"), "2026-12-08", "Monday 20:55:00.000 ET is Tuesday's UTP day");
  assert.equal(sip(et(2026, 12, 7, 20, 57), "utp"), "2026-12-08");
  assert.deepEqual(S.SIP_DAY_REGIMES.map((r) => r.utp.dayStartET), ["03:58", S.UTP_ETH_DAY_START_ET]);
});

// killer: apps/bell/src/close.ts:79 CONST "export { earliestPublishUtc } from \"./sessions.ts\";" -> "import { etWallClockToUtcMs as W } from \"./sessions.ts\"; export const earliestPublishUtc = (r: string): number => { const [y, mo, d] = r.split(\"-\").map(Number); return W(y ?? 0, mo ?? 1, d ?? 1, 16, 0, 0) + 86_400_000; };"
test("bell_close_reexports_the_moved_gate", () => {
  assert.equal(typeof S.earliestPublishUtc, "function", "sessions.ts holds the publication gate");
  assert.equal(C.earliestPublishUtc, S.earliestPublishUtc, "close.ts re-exports the same function, never a copy");
  assert.equal(S.earliestPublishUtc("2026-09-18"), Date.UTC(2026, 8, 19, 20, 0, 0), "16:00 ET of the reference-close day plus 24 h");
});
