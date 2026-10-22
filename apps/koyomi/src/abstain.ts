// MONARK Koyomi: the closed list of abstention codes (G0 KOYOMI-A DK-8; lot A1-b-i, test 9). Every slot gets one signed line, a
// forecast or an abstention named here, whatever happens. No code depends on the state of a trading session: a slot that falls in a
// closure is named by the calendar (`holiday`, `straddle`, `calendar_unknown`), never by a live market status. Five codes are Bell's,
// passed through as its collection returns them (`no_fill_in_window`, `no_close_ref`, `cash_cross_mismatch`, `rebase_unverified`,
// `corporate_action_in_window`); `under_calib` and `region_degenerate` come from the conformal interval (n_c below its floor or a rank
// above n_c; a zero radius); `input_late` is an input not computed before the signing deadline. Adding a code is a dated line of the
// ADR and a red test, never a silent edit. This module imports nothing.

/** The eleven codes of DK-8, in its order. */
export const ABSTAIN_CODES = Object.freeze([
  "under_calib",
  "region_degenerate",
  "no_fill_in_window",
  "no_close_ref",
  "cash_cross_mismatch",
  "rebase_unverified",
  "corporate_action_in_window",
  "holiday",
  "straddle",
  "calendar_unknown",
  "input_late",
] as const);
export type AbstainCode = (typeof ABSTAIN_CODES)[number];

const CODES: ReadonlySet<string> = new Set<string>(ABSTAIN_CODES);
/** True for a code of the closed list only (exact string; no inherited key, no other type). */
export function isAbstainCode(x: unknown): x is AbstainCode {
  return typeof x === "string" && CODES.has(x);
}
/** The code itself, or a throw naming the stranger. */
export function assertAbstainCode(x: unknown): AbstainCode {
  if (!isAbstainCode(x)) throw new TypeError(`not a Koyomi abstention code: ${JSON.stringify(x) ?? String(x)}`);
  return x;
}
