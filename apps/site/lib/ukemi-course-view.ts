// apps/site/lib/ukemi-course-view.ts — the words of /ukemi/course, composed from the two committed, hashed files the
// page reads: the course report (lib/ukemi-course-load.ts) and the served state of the class (lib/ukemi-served-load.ts).
// PURE (no I/O, type-only imports): the page renders these strings by property access. The root test rebuilds every
// string of the view from named JSON paths of the two files (a golden built without this module or the loaders), so
// every number the page shows is pinned to its field, in its position.
//
// HONESTY: no string literal in this module carries a digit outside the site's closed exempt list (the root test scans
// them with the honesty lint's own scanner; only the algorithm name SHA-256 rides): every number is interpolated
// from a loaded field. The report's `served` flag reads "meets the floor" (committable), never "served"; the served
// state of the class comes only from the served gate description, and the served status of a committed stratum only
// from the dated served verdict of the served-state file: it is stated in the present iff that verdict is covered for
// this stratum AND its calibration points and bound margin are the report's AND the report's quantile rank is n (the
// largest score); otherwise the conditional sentence stays (fail-closed). A "yes" is a test outcome at a stated level; the
// zero-scored trials are counted next to each ratio; the report's own statement that no coverage bound across
// episodes is estimated rides with the outcomes. Never a probability of being right.
import type { CourseOutcome, UkemiCourse, UkemiStratum } from "./ukemi-course-load.ts";
import type { UkemiServed, UkemiServedVerdict } from "./ukemi-served-load.ts";

export interface CourseRow {
  key: string;
  label: string;
  range: string;
  points: string;
  /** The conformal bound margin (qhat) of the row, in clear; "none (below the floor)" when no margin is reported. */
  bound: string;
  comparison: string;
  outcome: string;
  liquidated: string;
}
export interface CourseDigest {
  label: string;
  value: string;
}
/** A public account of the report and its page on the block explorer. */
export interface CourseAccount {
  address: string;
  href: string;
}

/** The block explorer of the episode's chain (Ethereum mainnet, eip155:1: the chain of the Ukemi recorder's venue,
 *  apps/sentinel/src/ukemi/clusters.ts CHAIN_ID); an account's page is this prefix plus its address. */
export const ADDRESS_EXPLORER = "https://etherscan.io/address/";
/** The gloss every p-value of the verification block carries, word for word. */
export const PVALUE_GLOSS = "exchangeability test p-value (beta-binomial), not a probability of being right";
export interface CourseView {
  eyebrow: string;
  served_lead: string;
  served_clause: string;
  served_note: string;
  unit_note: string;
  rows: CourseRow[];
  reading: string[];
  multi_call: string;
  reconciliation: string;
  liquidated_amounts: string;
  oracle: string;
  oracle_anchor: string;
  oracle_bias: string | null;
  population: string;
  zero_rule: string;
  /** The accounts the zero-rule sentence counts as liquidated without crossing, each with its explorer page. */
  zero_rule_accounts: CourseAccount[];
  zero_rule_accounts_lead: string;
  /** The folded verification block: the exchangeability test's p-value of each tested row, each shown with the gloss. */
  verification_summary: string;
  verification_lead: string;
  verification_gloss: string;
  verification: CourseDigest[];
  labels: string;
  clause: string;
  report_digest: string;
  report_digest_note: string;
  digests: CourseDigest[];
  digests_note: string;
}

const yesNo = (b: boolean): string => (b ? "yes" : "no");
const plural = (n: number, one: string, many: string): string => `${String(n)} ${n === 1 ? one : many}`;

/** The words of a pre-registered outcome; `floor` is the stratum's nMin (named with an under_calib outcome). */
export function outcomeWords(o: CourseOutcome, lvl: string | null, floor: number | null): string {
  if (o === "OUI") return lvl === null ? "yes" : `yes (level ${lvl})`;
  if (o === "NON") return lvl === null ? "no" : `no (level ${lvl})`;
  if (o === "UNDER_CALIB") return floor === null ? "under_calib" : `under_calib (n below the floor of ${String(floor)})`;
  return "not testable (too few comparison trials)";
}

/** Half-open range [lower cut, upper cut) of a stratum on the predicted amount. */
function rangeOf(k: number, cuts: readonly string[]): string {
  const lo = k > 0 ? cuts[k - 1] : undefined;
  const hi = cuts[k];
  if (lo === undefined) return hi === undefined ? "all" : `below ${hi}`;
  return hi === undefined ? `at least ${lo}` : `at least ${lo}, below ${hi}`;
}

function strataList(ks: readonly number[]): string {
  const names = ks.map(String);
  const last = names[names.length - 1];
  if (last === undefined) return "none";
  return names.length === 1 ? `stratum ${last}` : `strata ${names.slice(0, -1).join(", ")} and ${last}`;
}

function stratumRow(s: UkemiStratum, cuts: readonly string[]): CourseRow {
  return {
    key: `stratum-${String(s.stratum)}`,
    label: `stratum ${String(s.stratum)}${s.meets_floor ? " · meets the floor" : ""}`,
    range: rangeOf(s.stratum, cuts),
    points: `${String(s.n)} (floor ${String(s.n_min)})`,
    bound: s.bound_margin ?? "none (below the floor)",
    comparison:
      s.covered !== null && s.at_zero !== null
        ? `${String(s.covered)} / ${String(s.trials)} (${String(s.at_zero)} scored zero)`
        : `not tested (below the floor); ${plural(s.trials, "trial", "trials")} available`,
    outcome: outcomeWords(s.outcome, s.level, s.outcome === "UNDER_CALIB" ? s.n_min : null),
    liquidated: `${String(s.liquidated)} · ${String(s.multi_call)}`,
  };
}

/** The served verdict iff it states, in the present, the pre-registered status of this committed stratum: the registry
 *  is committed, the verdict is covered for this very stratum, its calibration points and bound margin are the report's,
 *  and the report's quantile rank is n (the bound margin is the largest calibration score). Otherwise null. */
export function servedStatusOf(x: UkemiStratum, s: UkemiServed): UkemiServedVerdict | null {
  const v = s.liq_verdict;
  if (s.registry_state !== "committed" || v === null || v.verdict_reason !== "covered") return null;
  if (v.stratum !== x.stratum || v.calibration_points !== x.n || v.bound_margin_base === null || v.bound_margin_base !== x.bound_margin_base) return null;
  return x.bound_is_largest_score === true && x.quantile_rank === x.n ? v : null;
}

export function buildCourseView(c: UkemiCourse, s: UkemiServed): CourseView {
  const committedClass = s.registry_state === "committed";
  const rows = c.strata.map((x) => stratumRow(x, c.strata_cuts));
  rows.push({
    key: "pooled",
    label: "pooled class A",
    range: "all",
    points: String(c.pooled.n),
    bound: c.pooled.bound_margin,
    comparison: `${String(c.pooled.covered)} / ${String(c.pooled.trials)} (${String(c.pooled.at_zero)} scored zero)`,
    outcome: `${outcomeWords(c.pooled.outcome, c.pooled.level, null)}, reported outside the condition`,
    liquidated: `${String(c.h4.class_a.n)} · ${String(c.h4.class_a.multi_call)}`,
  });

  const reading: string[] = [
    "What a yes means: the pre-registered exchangeability test with the design episode (the recorded episode the score was " +
      "designed on, never served) did not reject at its stated level. It is not a coverage claim" +
      (c.pooled.cross_episode_bound === "not_estimated" ? ", and the report estimates no coverage bound across episodes." : "."),
    "A comparison trial scored exactly zero (the realized amount did not exceed the prediction) counts as covered whatever the " +
      "bound; the number of such trials is shown next to each ratio.",
  ];
  for (const x of c.strata) {
    if (!x.meets_floor || x.bound_margin === null) continue;
    const served = servedStatusOf(x, s);
    if (served !== null) {
      reading.push(
        `Stratum ${String(x.stratum)} is committed and served: the served verdict read at ${s.read_at} carries ${String(served.calibration_points)} calibration points, fewer than the ${String(served.interior_rank_min_n)} an interior quantile rank needs at the served level, so the quantile rank equals the number of calibration points (${String(x.quantile_rank)} of ${String(x.n)}) and the served bound margin, ${x.bound_margin}, is the largest calibration score observed, reported as is. The served upper bound for a prediction in this stratum is the prediction plus this margin; served scores digest ${served.calibration_digest}.`,
      );
      continue;
    }
    reading.push(
      x.bound_is_largest_score === true && x.quantile_rank === x.n
        ? `Stratum ${String(x.stratum)}: the quantile rank equals the number of calibration points (${String(x.quantile_rank)} of ${String(x.n)}), so its bound margin, ${x.bound_margin}, is the largest calibration score observed. If the stratum is committed as reported, the upper bound for a prediction in it is the prediction plus this margin.`
        : `Stratum ${String(x.stratum)}: bound margin ${x.bound_margin} (quantile rank ${String(x.quantile_rank)} of ${String(x.n)}). If the stratum is committed as reported, the upper bound for a prediction in it is the prediction plus this margin.`,
    );
  }
  reading.push(
    `Pooled class A: bound margin ${c.pooled.bound_margin} (quantile rank ${String(c.pooled.quantile_rank)} of ${String(c.pooled.n)}${c.pooled.bound_is_largest_score ? ", the largest calibration score" : ""}).`,
  );

  // The verification block: each tested row's p-value as the report prints it, labelled with the row and its level.
  const verification: CourseDigest[] = c.strata
    .filter((x) => x.p_value !== null && x.level !== null)
    .map((x) => ({ label: `stratum ${String(x.stratum)} (level ${x.level ?? ""})`, value: x.p_value ?? "" }));
  verification.push({ label: `pooled class A (level ${c.pooled.level})`, value: c.pooled.p_value });

  const sampled = c.h6.sampled;
  const lag = sampled.max_lag === null ? "undefined" : plural(sampled.max_lag, "update", "updates");
  const atCall = c.h6.at_call_block;
  const anchorSource =
    c.h6.anchor.source === "last_update_before_reference"
      ? "the last oracle update before the reference block"
      : "the book's collateral price at the reference block (fallback)";

  return {
    eyebrow: `calibration course · ${c.event_id} · hypothesis report of its offline steps`,
    served_lead: `Served state of the class ${s.served_class}, as copied from the served gate description (${s.host}${s.path}) at ${s.read_at} and hashed in the site manifest; the live description may have changed since:`,
    served_clause: s.liq_clause,
    served_note: committedClass
      ? "A calibration of this class is committed; the served clause above states the bound it carries. The report below is the offline course, not the served registry."
      : `No calibration of this class is committed, so no stratum below is served. A stratum that meets the floor can be committed; committing it is a separate, recorded step. Meeting the floor in this report: ${strataList(c.committable)}.`,
    unit_note: `Amounts are ${c.unit}; a stratum is a range of the predicted liquidable amount.`,
    rows,
    reading,
    multi_call: `Accounts liquidated by more than one call, against the pre-registered threshold of a share at most ${c.h4.threshold}: liquidated class-A accounts ${String(c.h4.class_a.multi_call)} of ${String(c.h4.class_a.n)} → ${outcomeWords(c.h4.class_a.outcome, null, null)}; all liquidated accounts ${String(c.h4.all.multi_call)} of ${String(c.h4.all.n)} → ${outcomeWords(c.h4.all.outcome, null, null)}.`,
    reconciliation: `Positions (account, debt asset, collateral asset) reconciled exactly: ${String(c.h4.reconciliation.positions_reconciled)} (${String(c.h4.reconciliation.positions_abstained)} abstained); liquidation calls in the window: ${String(c.h4.reconciliation.calls_in_window)}, outside it: ${String(c.h4.reconciliation.calls_not_in_window)}; accounts abstained: ${String(c.h4.accounts_abstained)}.`,
    liquidated_amounts: `Liquidated amount in class A: ${c.h4.liquidated_amounts.sum}; of it, after the first call: ${c.h4.liquidated_amounts.after_first_call}; deficit reported apart: ${c.h4.liquidated_amounts.deficit_apart}.`,
    oracle: `Oracle values the protocol read at the liquidation call blocks and at the block before each: ${String(sampled.n)} values, ${String(sampled.in_series)} in the on-chain update series of ${plural(c.h6.series.n_updates, "update", "updates")}, ${String(sampled.equal_to_anchor)} equal to the anchor, ${String(sampled.outside)} outside. Measured maximum lag ${lag} (pre-registered bound ${plural(c.h6.lag_bound, "update", "updates")}; ${String(sampled.lag_over_bound)} over it) → ${outcomeWords(c.h6.outcome, null, null)}. At the call blocks themselves: ${String(atCall.n)} values, ${String(atCall.in_series)} in the series, maximum lag ${atCall.max_lag === null ? "undefined" : String(atCall.max_lag)}. Update blocks monotone: ${yesNo(c.h6.series.monotone_blocks)}; phase change: ${yesNo(c.h6.series.phase_change)}.`,
    oracle_anchor: `Anchor: block ${String(c.h6.anchor.block)}, price ${c.h6.anchor.price}, taken from ${anchorSource}${c.h6.min_served === null ? "" : `; lowest value read ${c.h6.min_served}`}.`,
    oracle_bias: c.h6.sample_note_present ? "Declared bias: these values are sampled at and just before liquidation blocks only." : null,
    population: `Population: ${plural(c.h5.population, "mono-collateral WETH account", "mono-collateral WETH accounts")} (${c.h5.meets ? "meets" : "below"} the floor of ${String(c.h5.k)}); class A calibration points: ${String(c.h5.class_a_n)}.`,
    zero_rule: `Zero predictions of the frozen rule: ${plural(c.zero_rule.crossed_at_zero, "account", "accounts")} crossed the threshold on the path with a zero prediction; ${plural(c.zero_rule.liquidated_at_zero, "account", "accounts")} with a zero prediction liquidated (${String(c.zero_rule.without_crossing)} that never crossed on the path${c.zero_rule.missed_amounts.length === 0 ? "" : `, amount ${c.zero_rule.missed_amounts.join(", ")}`}; ${String(c.zero_rule.crossed_and_liquidated)} that crossed).`,
    zero_rule_accounts: c.zero_rule.accounts.map((a) => ({ address: a, href: `${ADDRESS_EXPLORER}${a}` })),
    zero_rule_accounts_lead: `The ${c.zero_rule.accounts.length === 1 ? "account" : "accounts"} liquidated with a zero prediction that never crossed on the path, on Ethereum mainnet:`,
    verification_summary: "verification",
    verification_lead: "The p-value of the pre-registered exchangeability test with the design episode, for each tested row, as the report prints it:",
    verification_gloss: PVALUE_GLOSS,
    verification,
    labels: `Realized labels: ${plural(c.labels.label_lines, "label line", "label lines")}; unresolved: ${String(c.labels.unresolved)}; no-quorum residuals: ${String(c.labels.residual_no_quorum)}; deficits without a price on an asset other than USDT: ${String(c.labels.deficit_no_price_non_usdt)}; lines of another episode: ${String(c.labels.other_event_lines)}.`,
    clause: `Pre-registered condition for the next step: no stratum that meets the floor failed the exchangeability test (${c.clause_359.no_non_on_committable ? "true" : "false"}); unresolved labels: ${String(c.clause_359.unresolved)}; condition ${c.clause_359.condition_satisfied ? "satisfied" : "not satisfied"}. The pooled class A outcome (${outcomeWords(c.clause_359.pooled_outcome_outside, null, null)}) is reported outside this condition. The condition changes nothing that is served.`,
    report_digest: c.body_digest,
    report_digest_note:
      "SHA-256 of the canonical JSON of the report body (object keys sorted, no whitespace). Anyone can recompute it from the " +
      "published copy of the report, apps/site/data/ukemi-course.json in the public repository.",
    digests: [
      { label: "course tool", value: c.digests.tool },
      { label: "pre-registration", value: c.digests.prereg },
      { label: "fresh calibration scores", value: c.digests.scores },
      { label: "realized-label inputs", value: c.digests.u3_inputs },
      { label: "realized labels", value: c.digests.u3_realized },
      { label: "realized oracle path", value: c.digests.oracle_path },
      { label: "design-episode comparison scores", value: c.digests.e2_comparison },
    ],
    digests_note:
      "The course tool, the pre-registration and these input files are not in the public repository; their SHA-256 digests are " +
      "published so that a copy can be checked against them.",
  };
}
