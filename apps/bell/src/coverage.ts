// MONARK Bell — C-5 founding-course coverage decision (ADR-T1aii-D1-bis, decision 45; G2 fold C-G2-5). PURE,
// no network, no LLM. The founding course covers the ENTIRE census population iff the SPIKE-measured projection
// fits EVERY resource budget at once; otherwise it covers the top 20 pools per chain and PUBLISHES the share of
// the census 24 h volume it covered (an honest constat cannot claim coverage it did not pay for). A projection
// that is NOT computable — the measured -b1 case, where the census pools carried 0 in-window activity so Σ over
// them is 0 pages and says nothing about the REAL founding pools — is a NAMED abstention, never a silent
// "assume it fits". This is a course-PLANNING function consumed at -b1-bis (the rebase-aware founding course,
// decision 47); it is deliberately NOT a runtime residual (residuals.ts is a CLOSED set checked for equality —
// a coverage decision is not a per-session reason a fact could not be produced).

/** The three thresholds of decision 45 (ADR-T1aii-D1-bis). Defaults are the committed values; injectable so a
 *  future re-tune is an ADR edit, never a magic number buried in the branch. */
export interface CoverageThresholds {
  readonly maxHeliusCredits: number; // decision 45: 5_000_000
  readonly maxChainstackRu: number; //  decision 45: 10_000_000
  readonly maxDays: number; //          decision 45: 7
}
export const COVERAGE_THRESHOLDS: CoverageThresholds = { maxHeliusCredits: 5_000_000, maxChainstackRu: 10_000_000, maxDays: 7 };

/** A spike-measured projection = Σ over the covered pools of (pages × per-resource per-page cost), in the three
 *  resources. `null` is the honest "not computable" input (census population had 0 in-window data). */
export interface CoverageProjection {
  readonly heliusCredits: number;
  readonly chainstackRu: number;
  readonly days: number;
}

export type CoverageDecision =
  | { readonly mode: "full-population"; readonly reason: string }
  | { readonly mode: "top20-per-chain"; readonly publishCoverageShare: true; readonly reason: string }
  | { readonly mode: "abstain"; readonly reason: "projection_not_computable" };

/** Decide the founding-course coverage (decision 45). null projection => NAMED abstention; fits ALL three
 *  budgets => full population; else top-20 per chain with the covered 24 h volume share published. */
export function coverageDecision(proj: CoverageProjection | null, t: CoverageThresholds = COVERAGE_THRESHOLDS): CoverageDecision {
  if (proj === null) return { mode: "abstain", reason: "projection_not_computable" };
  const fits = proj.heliusCredits <= t.maxHeliusCredits && proj.chainstackRu <= t.maxChainstackRu && proj.days <= t.maxDays;
  if (fits) {
    return { mode: "full-population",
      reason: `projection within all budgets (${String(proj.heliusCredits)}<=${String(t.maxHeliusCredits)} credits, ${String(proj.chainstackRu)}<=${String(t.maxChainstackRu)} RU, ${String(proj.days)}<=${String(t.maxDays)} d)` };
  }
  return { mode: "top20-per-chain", publishCoverageShare: true,
    reason: "projection exceeds at least one budget (credits/RU/days) — cover top 20 by 24 h volume per chain and publish the covered share" };
}

/** C-G2-5 measured FLOOR (a lower bound, NOT a ceiling). Even when `coverageDecision` returns not-computable on
 *  the census population (0 in-window data), a lower bound on the founding-course cost IS computable from the
 *  in-window MINT activity: each of the 4 xStock mints showed >= 8000 in-window signatures (spike-findings.json,
 *  `capped: true` — the TRUE count is unknown, so 8000 is a floor). The founding vaults discovered per mint
 *  (-b1-bis) each carry a comparable-or-larger in-window signature count. Returns the measured lower bound; the
 *  exact projection requires the UNCAPPED enumeration performed at -b1-bis discovery (never fabricated here). */
export function foundingCourseCostFloorSigs(perMintInWindowSigsFloor: number, mintCount: number): number {
  return perMintInWindowSigsFloor * mintCount;
}
