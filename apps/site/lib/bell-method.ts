// apps/site/lib/bell-method.ts — the method facts rendered on /bell/method (lot SITE-CHARTE-C, decision 146).
//
// These are DEFINITIONS of the collector (session bounds, the committed calendar, the decimal convention, the
// closed list of residual codes), not measurements. The storefront cannot import the collector (apps/bell is not
// in the public export), so they are restated here AND pinned to the collector source by the root test
// test/bell-method.test.ts `bell_method_facts_match_collector`: the bounds are replayed through the collector's own
// classifySession() at the minute they claim, the calendar sets and the decimals are compared for equality, and
// the residual list must cover the collector's closed list exactly (codes marked upcoming may lag a lot that is
// not merged). A drift in either place reds that test — never a silent divergence between the page and the code.
// Pure data: no React/Next import, self-contained (shared by the page and the root test program).

/** Eastern-Time session bounds (wall clock, daylight saving applied per date by the collector). */
export const BELL_SESSION_BOUNDS_ET = {
  preOpen: "04:00",
  regularOpen: "09:30",
  regularClose: "16:00",
  regularCloseHalfDay: "13:00",
  afterClose: "20:00",
  afterCloseHalfDay: "17:00",
} as const;

/** The committed exchange calendar (collector sessions.ts): outside the range, classification is unknown. */
export const BELL_CALENDAR = {
  from: "2025-01-01",
  to: "2026-12-31",
  fullClosures: [
    "2025-01-01", "2025-01-09", "2025-01-20", "2025-02-17", "2025-04-18", "2025-05-26",
    "2025-06-19", "2025-07-04", "2025-09-01", "2025-11-27", "2025-12-25",
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19",
    "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  ],
  halfDays: ["2025-07-03", "2025-11-28", "2025-12-24", "2026-11-27", "2026-12-24"],
} as const;

/** Decimal places carried for the VWAP and the gap (collector gap.ts GAP_PRECISION). */
export const BELL_DECIMALS = 10;

export interface BellResidual {
  code: string;
  gloss: string;
}

/** The collector's closed list of residual codes, grouped as the page shows them. */
export const BELL_RESIDUALS_SESSIONS: readonly BellResidual[] = [
  { code: "no_fill_in_window", gloss: "no fill in the session window, or between a halt and its resume; nothing is computed for that window" },
  { code: "no_close_ref", gloss: "the reference close is missing or not positive for a filled session; no gap is fabricated" },
  { code: "cash_cross_mismatch", gloss: "the two close sources disagree on the scaled integer for a reference day; the session abstains, never an average" },
  { code: "cash_cross_unavailable", gloss: "the cross-read of the close could not run for a reference day; distinct from a mismatch" },
  { code: "no_quorum", gloss: "fewer than two distinct operators answered a read" },
  { code: "quorum_sampled", gloss: "transaction bodies were compared on a deterministic sample, not the full set; the sampled share is stated" },
  { code: "multiplier_unit", gloss: "the token unit and the share unit differ by a multiplier other than one" },
  { code: "rebase_unverified", gloss: "the multiplier was not established constant or known across the pool window; the session abstains" },
  { code: "authority_scan_mono_operator", gloss: "the multiplier history was reconstructed through one operator's enumeration; an omission that would change the final state is caught, one that would not is not" },
  { code: "set_authority_unscanned", gloss: "the mint's authority-change history is not scanned; a self-cancelling change is the residual gap" },
];

export const BELL_RESIDUALS_HALTS_RESERVES: readonly BellResidual[] = [
  { code: "resume_time_missing", gloss: "the halt row carries no resume time; the halt window has no upper bound" },
  { code: "resume_date_gt_halt_date", gloss: "the resume date is later than the halt date; declared, and the window is still computed" },
  { code: "reason_unknown", gloss: "the halt reason does not map to a canonical reason family" },
  { code: "block_ts_vs_submission", gloss: "a standing residue on every halt delta: block time is the observed proxy for submission time, always declared" },
  { code: "por_unavailable", gloss: "no first-hand proof-of-reserves source is named for a token" },
  { code: "por_stale", gloss: "the reserves value is older than the staleness bound" },
  { code: "no_wrapper", gloss: "no wrapper or bridge contract is named for a token" },
];

/** Codes added by lot BELL-ADV-1 (in review at the date of this page): shown as upcoming until served. */
export const BELL_RESIDUALS_UPCOMING: readonly BellResidual[] = [
  { code: "no_adv", gloss: "no consolidated daily volume for the denominator period; no ratio is published" },
  { code: "no_multiplier", gloss: "no shares-per-token multiplier readable for the window; no ratio is published" },
];
