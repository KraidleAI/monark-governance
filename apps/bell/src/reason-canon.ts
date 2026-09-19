// MONARK Bell — closed canonical map of NYSE halt `Reason` graphies (ADR-B0 D2 ii).
//
// MEASURED FIRST-HAND (nyse-trade-halts-historical-2026-09-19.csv, 73 431 data rows, proper RFC4180
// parse): 18 DISTINCT `Reason` strings. Any string NOT in this closed set → REASON_UNKNOWN (never
// bucketed into a family in silence — mutant `bell_reason_graphie_break` reddens on a silent bucket).
// The map is over the EXACT bytes of each graphie (case- and spelling-sensitive) — normalization by
// lowercasing would erase the very distinctions the ADR requires us to preserve and count.
//
// Measured tally (this map, applied to the CSV, reproduces ADR-B0 D2 ii exactly):
//   LULD_PAUSE            61 747  ("LULD pause" 56 042 + "LULD Pause" 5 705)
//   NEWS_PENDING          10 210  ("News pending" 9 259 + "News Pending" 951)
//   CORPORATE_ACTION         555
//   MERGER_EFFECTIVE         320
//   REGULATORY_CONCERN       235
//   NEWS_RELEASED            233
//   NEWS_DISSEMINATION       106  ("News dissemination" 93 + "News Dissemination" 13)
//   NEW_SECURITY_OFFERING     11
//   INTRADAY_IIV_NA            5  (2 graphies)
//   ETF_COMPONENT_NA           9  (5 graphies)
//   ── Σ = 73 431 (all rows carry a known graphie; REASON_UNKNOWN count = 0 on this CSV)
// NOTE vs ADR-B0 D2 ii text: it says "ETF-component ×6 graphies"; the measured tree carries ×5 ETF
// graphies (Σ graphies still 18). The closed set below is the MEASURED truth (doc 03: measure wins).

export type ReasonFamily =
  | "LULD_PAUSE"
  | "NEWS_PENDING"
  | "NEWS_RELEASED"
  | "NEWS_DISSEMINATION"
  | "CORPORATE_ACTION"
  | "MERGER_EFFECTIVE"
  | "REGULATORY_CONCERN"
  | "NEW_SECURITY_OFFERING"
  | "INTRADAY_IIV_NA"
  | "ETF_COMPONENT_NA"
  | "REASON_UNKNOWN";

/** The closed carte: EXACT graphie bytes → family. Frozen; adding a graphie is an ADR line. */
export const REASON_CANON: ReadonlyMap<string, ReasonFamily> = new Map([
  ["LULD pause", "LULD_PAUSE"],
  ["LULD Pause", "LULD_PAUSE"],
  ["News pending", "NEWS_PENDING"],
  ["News Pending", "NEWS_PENDING"],
  ["News Released", "NEWS_RELEASED"],
  ["News dissemination", "NEWS_DISSEMINATION"],
  ["News Dissemination", "NEWS_DISSEMINATION"],
  ["Corporate Action", "CORPORATE_ACTION"],
  ["Merger Effective", "MERGER_EFFECTIVE"],
  ["Regulatory Concern", "REGULATORY_CONCERN"],
  ["New Security Offering", "NEW_SECURITY_OFFERING"],
  ["Intraday Ind Val NA", "INTRADAY_IIV_NA"],
  ["Intraday Indicative Value Not Available", "INTRADAY_IIV_NA"],
  ["ETF Component Prices Not Available", "ETF_COMPONENT_NA"],
  ["ETF IIV / ETF Component Prices Not Available", "ETF_COMPONENT_NA"],
  ["ETF Component Prices", "ETF_COMPONENT_NA"],
  ["ETF Component Prc NA", "ETF_COMPONENT_NA"],
  ["ETF Component Price", "ETF_COMPONENT_NA"],
]);

/** Map a raw `Reason` cell to its family; anything off the closed carte → REASON_UNKNOWN (never silent). */
export function canonReason(raw: string): ReasonFamily {
  return REASON_CANON.get(raw) ?? "REASON_UNKNOWN";
}

/** Tally families over a list of raw `Reason` cells. Deterministic key order (families, then unknown). */
export function tallyReasons(raws: readonly string[]): Record<ReasonFamily, number> {
  const out = {
    LULD_PAUSE: 0, NEWS_PENDING: 0, NEWS_RELEASED: 0, NEWS_DISSEMINATION: 0, CORPORATE_ACTION: 0,
    MERGER_EFFECTIVE: 0, REGULATORY_CONCERN: 0, NEW_SECURITY_OFFERING: 0, INTRADAY_IIV_NA: 0,
    ETF_COMPONENT_NA: 0, REASON_UNKNOWN: 0,
  };
  for (const r of raws) out[canonReason(r)] += 1;
  return out;
}
