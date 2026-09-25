// apps/site/lib/ukemi-course-load.ts — the Ukemi calibration course, read fail-closed from the committed, hashed copy
// of the course's hypothesis report (apps/site/data/ukemi-course.json, written by the source repository's course sync
// tool from the report of the course's offline steps). The page renders the facts of the report as reported:
// pre-registered outcomes (OUI / NON / UNDER_CALIB / NON_TESTABLE_E2), counts, fractions and digests. Never a
// probability of being right: an outcome is a test result at a stated level, nothing more.
//
// FAIL-CLOSED, in this order: the file must be listed in apps/site/data/manifest.sha256.json with the sha256 of its
// CRLF->LF bytes; body_digest must equal the sha256 of the canonical JSON of body (object keys sorted, no whitespace;
// the recipe the course tool uses), recomputed here; every field the page reads must have its type; every amount of
// the display block must be the exact 8-decimal rendering of the base-currency integer it stands for in body; and the
// outcomes the page renders must agree with the report's own inputs, by the course tool's rules (an H-3 outcome with
// its p-value at its level, an H-4 outcome with its count at the threshold, the H-6 counts with their lag histogram,
// the condition with its two inputs). So a drifted copy, an edited body, an amount that does not match its source, or
// an outcome edited and re-hashed without its inputs reds `next build`. (A consistent edit of inputs and outcomes
// together is caught by the root test, which binds body_digest to the digest recorded when the report was produced.)
//
// Self-contained (node built-ins only, no alias and no value import): shared by the page, the view module and the
// root test program. The report's own flag `served` means "meets the floor (n >= nMin), committable"; it is exposed
// as `meets_floor`, never as a served state (the served state of the class is read from the served gate, see
// lib/ukemi-served-load.ts).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
export const UKEMI_COURSE_REL = "apps/site/data/ukemi-course.json";

/** A pre-registered outcome of the report (the tool's own vocabulary). */
export type CourseOutcome = "OUI" | "NON" | "UNDER_CALIB" | "NON_TESTABLE_E2";

export interface UkemiStratum {
  stratum: number;
  /** Fresh calibration points of the stratum. */
  n: number;
  /** The report flag `served` (n >= its floor): the stratum can be committed. NOT a served state. */
  meets_floor: boolean;
  /** The floor (nMin) the stratum's count is compared with. */
  n_min: number;
  outcome: CourseOutcome;
  level: string | null;
  /** Rank of the conformal quantile among the n calibration scores (the report's fresh.p). */
  quantile_rank: number;
  /** True when that rank is n: the bound margin is the largest calibration score. Null below the floor. */
  bound_is_largest_score: boolean | null;
  /** The bound margin (fresh.qhat) as an exact decimal string of the display block; null below the floor. */
  bound_margin: string | null;
  /** The same margin as the exact base-currency integer string of the report (fresh.qhat); null below the floor. It is
   *  compared with the served verdict's bound margin (a string comparison, no amount typed). */
  bound_margin_base: string | null;
  /** Trials on the design episode (e2.n), always reported. */
  trials: number;
  /** Covered trials (e2.k_covered) and, among them, trials scored exactly zero; null below the floor. */
  covered: number | null;
  at_zero: number | null;
  ties_at_bound: number | null;
  /** The report's statement on a coverage bound across episodes; null below the floor. */
  cross_episode_bound: "not_estimated" | null;
  /** The p-value of the exchangeability test as the report prints it (p_value.dec12, bound to its exact ratio); null
   *  below the floor or when the stratum is not testable. */
  p_value: string | null;
  /** Liquidation counts of the stratum (multi-call hypothesis). */
  liquidated: number;
  multi_call: number;
}

export interface UkemiPooled {
  n: number;
  quantile_rank: number;
  bound_is_largest_score: boolean;
  bound_margin: string;
  trials: number;
  covered: number;
  at_zero: number;
  ties_at_bound: number;
  outcome: CourseOutcome;
  level: string;
  cross_episode_bound: "not_estimated";
  /** The p-value of the pooled exchangeability test as the report prints it (p_value.dec12, bound to its exact ratio). */
  p_value: string;
}

export interface UkemiCourse {
  event_id: string;
  body_digest: string;
  /** Digest of the course tool and of the pre-registration and inputs (none of which is in the public export). */
  digests: { tool: string; prereg: string; scores: string; u3_inputs: string; u3_realized: string; oracle_path: string; e2_comparison: string };
  /** Unit label of every amount, and the a-priori stratum cuts on the predicted amount, as exact decimal strings. */
  unit: string;
  strata_cuts: string[];
  strata: UkemiStratum[];
  pooled: UkemiPooled;
  /** Strata the report lists as meeting the floor (h3.served_strata). */
  committable: number[];
  h4: {
    threshold: string;
    class_a: { n: number; multi_call: number; outcome: CourseOutcome };
    all: { n: number; multi_call: number; outcome: CourseOutcome };
    reconciliation: { positions_reconciled: number; positions_abstained: number; calls_in_window: number; calls_not_in_window: number };
    accounts_abstained: number;
    liquidated_amounts: { sum: string; after_first_call: string; deficit_apart: string };
  };
  h6: {
    outcome: CourseOutcome;
    lag_bound: number;
    series: { n_updates: number; monotone_blocks: boolean; phase_change: boolean };
    sampled: { n: number; in_series: number; equal_to_anchor: number; outside: number; max_lag: number | null; lag_over_bound: number; lag_undefined: number; violations: number };
    at_call_block: { n: number; in_series: number; max_lag: number | null };
    /** Where the anchor price comes from, in digit-free words: the last oracle update before the reference block, or the
     *  book's collateral price at the reference block (the report's fallback path). */
    anchor: { block: number; price: string; source: "last_update_before_reference" | "book_price_fallback" };
    min_served: string | null;
    sample_note_present: boolean;
  };
  h5: { population: number; k: number; meets: boolean; class_a_n: number };
  /** accounts: the addresses of the accounts liquidated with a zero prediction that never crossed on the path, in report
   *  order (body.q0_rule_failures.without_crossing[].address; public on-chain accounts, lower-case hex). */
  zero_rule: { crossed_at_zero: number; liquidated_at_zero: number; without_crossing: number; crossed_and_liquidated: number; missed_amounts: string[]; accounts: string[] };
  labels: { label_lines: number; unresolved: number; residual_no_quorum: number; deficit_no_price_non_usdt: number; other_event_lines: number };
  clause_359: { no_non_on_committable: boolean; unresolved: number; condition_satisfied: boolean; pooled_outcome_outside: CourseOutcome };
}

const HEX64 = /^[0-9a-f]{64}$/;
const OUTCOME = /^(OUI|NON|UNDER_CALIB|NON_TESTABLE_E2)$/;
const LEVEL = /^[0-9]+\/[0-9]+$/;
const INT = /^(0|[1-9][0-9]*)$/;
const DEC8 = /^(0|[1-9][0-9]*)\.[0-9]{8}$/;
const DISPLAY_KEYS = [
  "unit", "decimals", "strata_cuts", "strata_qhat", "pooled_qhat", "liquidated_class_a", "anchor_price", "min_served", "min_events",
  "zero_rule_missed_amounts",
];
const FILE_KEYS = ["$comment", "schema", "kind", "provenance", "body", "body_digest", "display"];

function fail(msg: string): never {
  throw new Error(`ukemi course: ${msg}`);
}
function int(v: unknown, where: string): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0) fail(`${where} must be a non-negative integer`);
  return v;
}
function bool(v: unknown, where: string): boolean {
  if (typeof v !== "boolean") fail(`${where} must be a boolean`);
  return v;
}
function str(v: unknown, where: string): string {
  if (typeof v !== "string" || v.length === 0) fail(`${where} must be a non-empty string`);
  return v;
}
function outcome(v: unknown, where: string): CourseOutcome {
  if (typeof v !== "string" || !OUTCOME.test(v)) fail(`${where} is not a pre-registered outcome`);
  return v as CourseOutcome;
}
function level(v: unknown, where: string): string {
  if (typeof v !== "string" || !LEVEL.test(v)) fail(`${where} must be a num/den level`);
  return v;
}
function hex(v: unknown, where: string): string {
  if (typeof v !== "string" || !HEX64.test(v)) fail(`${where} must be 64 lowercase hex`);
  return v;
}
function rec(v: unknown, where: string): Record<string, unknown> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(`${where} must be an object`);
  return v as Record<string, unknown>;
}
function arr(v: unknown, where: string): unknown[] {
  if (!Array.isArray(v)) fail(`${where} must be an array`);
  return v;
}
function at(a: unknown[], i: number, where: string): unknown {
  if (i < 0 || i >= a.length) fail(`${where}[${String(i)}] is missing`);
  return a[i];
}

/** A non-negative rational {num, den} of the report (decimal integer strings, den > 0). */
function ratio(v: unknown, where: string): { num: bigint; den: bigint } {
  const o = rec(v, where);
  if (typeof o.num !== "string" || !INT.test(o.num) || typeof o.den !== "string" || !INT.test(o.den) || o.den === "0") fail(`${where} must be a non-negative ratio of integer strings`);
  return { num: BigInt(o.num), den: BigInt(o.den) };
}
/** "num/den" (already checked by LEVEL) as BigInts. */
function levelParts(v: string): { num: bigint; den: bigint } {
  const [num, den] = v.split("/");
  if (num === undefined || den === undefined || den === "0") fail(`level ${v} is not num/den`);
  return { num: BigInt(num), den: BigInt(den) };
}
const DEC12 = /^([0-9]+)\.([0-9]{12})$/;
const ADDRESS = /^0x[0-9a-f]{40}$/;
/** The report's printed p-value (p_value.dec12), bound to its exact ratio: the twelve-decimal string must be the ratio
 *  truncated or rounded up at the twelfth decimal (a tampered decimal reds). */
function pValueShown(v: unknown, where: string): string {
  const exact = ratio(v, where);
  const shown = rec(v, where).dec12;
  const m = typeof shown === "string" ? DEC12.exec(shown) : null;
  if (m === null || typeof shown !== "string") fail(`${where}.dec12 must be a twelve-decimal string`);
  const digits = BigInt(`${m[1] ?? ""}${m[2] ?? ""}`);
  const scaled = exact.num * 10n ** 12n;
  const floor = scaled / exact.den;
  const inexact = scaled % exact.den !== 0n;
  if (!(digits === floor || (inexact && digits === floor + 1n))) fail(`${where}.dec12 ${shown} is not its ratio at twelve decimals`);
  return shown;
}
/** A public account address of the report, lower-case hex (fail-closed on any other shape). */
function address(v: unknown, where: string): string {
  if (typeof v !== "string" || !ADDRESS.test(v)) fail(`${where} must be a lower-case 0x address`);
  return v;
}
/** The H-3 rule of the course tool (a lower-tail test): NON iff the p-value is at or below the level, exactly. */
function h3OutcomeAgrees(cell: Record<string, unknown>, out: CourseOutcome, lvl: string, where: string): void {
  if (out !== "OUI" && out !== "NON") fail(`${where}: a tested cell must have outcome OUI or NON`);
  const pv = ratio(cell.p_value, `${where} p_value`), l = levelParts(lvl);
  if ((pv.num * l.den <= l.num * pv.den) !== (out === "NON")) fail(`${where}: the outcome disagrees with its p-value at its level`);
}
/** The H-6 counts of a block of oracle values agree with their lag histogram (the course tool's classification). */
function lagBlockAgrees(b: Record<string, unknown>, bound: number, where: string): void {
  const hist = rec(b.lag_histogram, `${where} lag_histogram`);
  let total = 0, over = 0, maxLag: number | null = null;
  for (const [k, v] of Object.entries(hist)) {
    if (!INT.test(k)) fail(`${where} lag_histogram key ${k} is not a lag`);
    const lag = Number(k), count = int(v, `${where} lag_histogram[${k}]`);
    total += count;
    if (lag > bound) over += count;
    if (count > 0 && (maxLag === null || lag > maxLag)) maxLag = lag;
  }
  const n = int(b.n, `${where} n`);
  if (int(b.in_events, `${where} in_events`) + int(b.equal_to_p0, `${where} equal_to_p0`) + int(b.outside, `${where} outside`) !== n) fail(`${where}: in_events + equal_to_p0 + outside must equal n`);
  if (total + int(b.lag_undefined, `${where} lag_undefined`) !== n) fail(`${where}: the lag histogram and lag_undefined must count n values`);
  if ((b.max_lag === null ? null : int(b.max_lag, `${where} max_lag`)) !== maxLag) fail(`${where}: max_lag is not the largest lag of its histogram`);
  if (int(b.lag_over_bound, `${where} lag_over_bound`) !== over) fail(`${where}: lag_over_bound is not the count of lags above the bound`);
}

/** Canonical JSON (object keys sorted, no whitespace), the recipe of the course tool's body digest. */
export function canonicalJson(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canonicalJson).join(",") + "]";
  const o = v as Record<string, unknown>;
  return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(o[k])).join(",") + "}";
}

/** Exact 8-decimal rendering of a non-negative integer string ("126184298996" -> "1261.84298996"). String-only. */
export function decimal8Of(intString: string): string {
  if (!INT.test(intString)) fail(`amount ${intString} is not a non-negative integer string`);
  const padded = intString.padStart(9, "0");
  const whole = padded.slice(0, -8).replace(/^0+(?=[0-9])/, "");
  return `${whole}.${padded.slice(-8)}`;
}
/** The display value `shown` must be the exact rendering of the body integer `source`. */
function amount(shown: unknown, source: unknown, where: string): string {
  if (typeof shown !== "string" || !DEC8.test(shown)) fail(`display ${where} must be an 8-decimal string`);
  if (typeof source !== "string" || decimal8Of(source) !== shown) fail(`display ${where} does not render its source amount`);
  return shown;
}

export function loadUkemiCourse(rootDir: string): UkemiCourse {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[UKEMI_COURSE_REL];
  if (typeof expected !== "string") fail(`${UKEMI_COURSE_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, UKEMI_COURSE_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${UKEMI_COURSE_REL} (manifest ${expected}, actual ${actual})`);

  const file = rec(JSON.parse(raw), "file");
  if (Object.keys(file).sort().join(",") !== [...FILE_KEYS].sort().join(",")) fail(`the file must carry exactly {${FILE_KEYS.join(", ")}}`);
  if (typeof file.$comment !== "string") fail("$comment must be a string");
  if (file.schema !== "ukemi-u4b-hyp/1" || file.kind !== "report") fail("not a ukemi-u4b-hyp/1 report");
  const body = rec(file.body, "body");
  const bodyDigest = hex(file.body_digest, "body_digest");
  const recomputed = createHash("sha256").update(canonicalJson(body), "utf8").digest("hex");
  if (recomputed !== bodyDigest) fail(`body_digest ${bodyDigest} is not the sha256 of the canonical body (${recomputed})`);

  const prov = rec(file.provenance, "provenance");
  const inputs = rec(prov.inputs, "provenance.inputs");
  const inputDigest = (name: string): string => hex(rec(inputs[name], `provenance.inputs.${name}`).sha256_lf, `provenance.inputs.${name}.sha256_lf`);
  const eventId = str(body.event_id, "body.event_id");
  if (prov.event_id !== eventId) fail("provenance.event_id differs from body.event_id");

  const display = rec(file.display, "display");
  if (Object.keys(display).sort().join(",") !== [...DISPLAY_KEYS].sort().join(",")) fail(`display must carry exactly {${DISPLAY_KEYS.join(", ")}}`);
  if (display.decimals !== 8) fail("display.decimals must be 8");
  const unit = str(display.unit, "display.unit");
  const cuts = arr(display.strata_cuts, "display.strata_cuts").map((c, i) => {
    if (typeof c !== "string" || !DEC8.test(c)) fail(`display.strata_cuts[${String(i)}] must be an 8-decimal string`);
    return c;
  });

  const h2s = arr(rec(body.h2, "h2").strata, "h2.strata");
  const h3 = rec(body.h3, "h3");
  const h3s = arr(h3.strata, "h3.strata");
  if (h3s.length !== cuts.length + 1) fail("h3.strata must list one row per a-priori stratum (cuts + 1)");
  const h4 = rec(body.h4, "h4");
  const h4s = arr(h4.strata, "h4.strata");
  const qhats = arr(display.strata_qhat, "display.strata_qhat");
  if (qhats.length !== h3s.length) fail("display.strata_qhat must list one entry per stratum");

  const strata: UkemiStratum[] = h3s.map((s, i) => {
    const o = rec(s, `h3.strata[${String(i)}]`);
    const fresh = rec(o.fresh, "h3 fresh"), e2 = rec(o.e2, "h3 e2");
    const stratum = int(o.strate, "h3 strate");
    if (stratum !== i) fail(`h3.strata[${String(i)}] is stratum ${String(stratum)}`);
    const h2 = rec(at(h2s, i, "h2.strata"), "h2 row");
    if (h2.strate !== i || h2.n !== fresh.n) fail(`h2.strata[${String(i)}] does not match h3`);
    const h4row = rec(at(h4s, i, "h4.strata"), "h4 row");
    if (h4row.strate !== i) fail(`h4.strata[${String(i)}] is not stratum ${String(i)}`);
    const meets = bool(o.served, "h3 served flag");
    const n = int(fresh.n, "h3 fresh.n"), nMin = int(h2.n_min, "h2 n_min");
    if (meets !== n >= nMin || bool(h2.under_calib, "h2 under_calib") === meets) fail(`stratum ${String(i)}: the floor flags disagree with n and n_min`);
    const shown = at(qhats, i, "display.strata_qhat");
    const out = outcome(o.verdict, "h3 outcome");
    if (!meets && out !== "UNDER_CALIB") fail(`stratum ${String(i)}: a stratum below the floor must be UNDER_CALIB`);
    if (meets && out !== "NON_TESTABLE_E2") h3OutcomeAgrees(o, out, level(o.level, "h3 level"), `h3 stratum ${String(i)}`);
    return {
      stratum, n, meets_floor: meets, n_min: nMin, outcome: out,
      level: meets && out !== "NON_TESTABLE_E2" ? level(o.level, "h3 level") : null,
      quantile_rank: int(fresh.p, "h3 fresh.p"),
      bound_is_largest_score: meets ? bool(fresh.qhat_is_max, "h3 fresh largest-score flag") : null,
      bound_margin: meets ? amount(shown, fresh.qhat, `strata_qhat[${String(i)}]`) : shown === null && fresh.qhat === null ? null : fail(`display.strata_qhat[${String(i)}] must be null below the floor`),
      bound_margin_base: meets ? (typeof fresh.qhat === "string" && INT.test(fresh.qhat) ? fresh.qhat : fail(`h3 fresh.qhat of stratum ${String(i)} must be an integer string`)) : null,
      trials: int(e2.n, "h3 e2.n"),
      covered: meets ? int(e2.k_covered, "h3 e2.k_covered") : null,
      at_zero: meets ? int(e2.atoms_at_zero, "h3 e2.atoms_at_zero") : null,
      ties_at_bound: meets ? int(e2.ties_at_qhat, "h3 e2 ties") : null,
      cross_episode_bound: meets && out !== "NON_TESTABLE_E2" ? (o.barber_thm2_bound === "not_estimated" ? "not_estimated" : fail("h3 cross-episode bound must be not_estimated")) : null,
      p_value: meets && out !== "NON_TESTABLE_E2" ? pValueShown(o.p_value, `h3 stratum ${String(i)} p_value`) : null,
      liquidated: int(h4row.liquidated, "h4 liquidated"),
      multi_call: int(h4row.multi_call, "h4 multi_call"),
    };
  });

  const p = rec(h3.pooled, "h3.pooled"), pf = rec(p.fresh, "pooled fresh"), pe = rec(p.e2, "pooled e2");
  if (p.barber_thm2_bound !== "not_estimated") fail("pooled cross-episode bound must be not_estimated");
  const pooled: UkemiPooled = {
    n: int(pf.n, "pooled n"), quantile_rank: int(pf.p, "pooled fresh.p"), bound_is_largest_score: bool(pf.qhat_is_max, "pooled largest-score flag"),
    bound_margin: amount(display.pooled_qhat, pf.qhat, "pooled_qhat"),
    trials: int(pe.n, "pooled trials"), covered: int(pe.k_covered, "pooled covered"), at_zero: int(pe.atoms_at_zero, "pooled at zero"),
    ties_at_bound: int(pe.ties_at_qhat, "pooled ties"), outcome: outcome(p.verdict, "pooled outcome"), level: level(p.level, "pooled level"),
    cross_episode_bound: "not_estimated",
    p_value: pValueShown(p.p_value, "h3 pooled p_value"),
  };
  h3OutcomeAgrees(p, pooled.outcome, pooled.level, "h3 pooled");
  const committable = arr(h3.served_strata, "h3.served_strata").map((k) => int(k, "h3.served_strata entry"));
  if (committable.join(",") !== strata.filter((s) => s.meets_floor).map((s) => s.stratum).join(",")) fail("h3.served_strata does not list the strata that meet the floor");
  // The condition's first input, by the tool's recipe: the strata that meet the floor with a NON outcome are exactly
  // h3.non_on_served_strata, and the no-NON flag is "that list is empty".
  const nonOnCommittable = strata.filter((s) => s.meets_floor && s.outcome === "NON").map((s) => s.stratum);
  const nonListed = arr(h3.non_on_served_strata, "h3.non_on_served_strata").map((k) => int(k, "h3.non_on_served_strata entry"));
  if (nonListed.join(",") !== nonOnCommittable.join(",")) fail("h3.non_on_served_strata does not list the strata that meet the floor with a NON outcome");
  const noNon = nonOnCommittable.length === 0;
  if (bool(h3.h3_no_NON_on_served_strata, "h3 no-NON flag") !== noNon) fail("the h3 no-NON flag disagrees with the strata outcomes");

  const h4a = rec(h4.class_a_liquidated, "h4.class_a"), h4b = rec(h4.all_liquidated, "h4.all");
  const rc = rec(h4.reconciliation, "h4.reconciliation");
  const hp = rec(h4.pooled, "h4.pooled"), liqShown = rec(display.liquidated_class_a, "display.liquidated_class_a");
  const h6 = rec(body.h6, "h6"), h6s = rec(h6.series, "h6.series"), sb = rec(h6.served_blocks, "h6 sampled values"), pc = rec(h6.price_at_call_block, "h6 call-block values");
  const anc = rec(h6.anchor, "h6.anchor");
  if (anc.source !== "answer_updated_pre_b0" && anc.source !== "book_weth_price_base_8dec") fail("h6.anchor.source is not a known source");
  const nullableLag = (v: unknown, where: string): number | null => (v === null ? null : int(v, where));
  const h5 = rec(body.h5, "h5");
  const q0 = rec(body.q0_rule_failures, "q0_rule_failures");
  const missedRows = arr(q0.without_crossing, "q0 without_crossing").map((m) => rec(m, "q0 miss"));
  const missed = missedRows.map((m) => m.y);
  const missedAccounts = missedRows.map((m, i) => address(m.address, `q0 without_crossing[${String(i)}].address`));
  const missedShown = arr(display.zero_rule_missed_amounts, "display.zero_rule_missed_amounts");
  if (missedShown.length !== missed.length) fail("display.zero_rule_missed_amounts must list one amount per miss");
  const labels = rec(body.labels, "labels");
  const c = rec(body.clause_359, "clause_359");
  if (typeof h4.threshold !== "string" || !LEVEL.test(h4.threshold)) fail("h4.threshold must be a num/den level");
  // H-4 outcomes by the tool's rule: NON iff the multi-call share exceeds the threshold, compared exactly.
  const th = levelParts(h4.threshold);
  const h4Outcome = (multi: number, n: number): CourseOutcome => (BigInt(multi) * th.den > th.num * BigInt(n) ? "NON" : "OUI");
  const h4Checked = (row: Record<string, unknown>, where: string): { n: number; multi_call: number; outcome: CourseOutcome } => {
    const n = int(row.n, `${where}.n`), multi = int(row.multi_call, `${where}.multi_call`), out = outcome(row.verdict, `${where} outcome`);
    if (n === 0 || multi > n || out !== h4Outcome(multi, n)) fail(`${where}: the outcome disagrees with its count at the threshold`);
    return { n, multi_call: multi, outcome: out };
  };
  // H-6 counts against their histograms, and the outcome: OUI iff no value is a violation (outside the series and the
  // anchor, a lag without a match, or a lag above the bound).
  const lagBound = int(h6.max_lag_bound, "h6 lag bound");
  lagBlockAgrees(sb, lagBound, "h6 sampled values");
  lagBlockAgrees(pc, lagBound, "h6 call-block values");
  const violations = arr(sb.violations, "h6 violations").length;
  const h6Out = outcome(h6.verdict, "h6 outcome");
  if (h6Out !== (violations === 0 ? "OUI" : "NON")) fail("the h6 outcome disagrees with its violations");
  if (violations === 0 && (int(sb.outside, "h6 sampled outside") > 0 || int(sb.lag_undefined, "h6 lag_undefined") > 0 || int(sb.lag_over_bound, "h6 lag_over_bound") > 0)) fail("h6 lists no violation but counts one");
  // The condition, by the tool's recipe: its no-NON flag is h3's, its unresolved count is the labels', it is satisfied
  // iff both hold, and the pooled outcome it reports outside the condition is the pooled outcome.
  const clauseNoNon = bool(c.h3_no_NON_on_served_strata, "clause no-NON flag");
  const clauseUnresolved = int(c.labels_no_quorum_unresolved, "clause unresolved");
  const clauseSatisfied = bool(c.condition_satisfied, "clause condition_satisfied");
  const clausePooled = outcome(c.h3_pooled_verdict_outside_condition, "clause pooled outcome");
  if (clauseNoNon !== noNon) fail("the clause no-NON flag disagrees with the strata outcomes");
  if (clauseUnresolved !== int(labels.labels_no_quorum_unresolved, "labels unresolved")) fail("the clause unresolved count differs from the labels");
  if (clauseSatisfied !== (clauseNoNon && clauseUnresolved === 0)) fail("the clause condition disagrees with its two inputs");
  if (clausePooled !== pooled.outcome) fail("the clause pooled outcome differs from the pooled outcome");
  const minServed = h6.min_served === null ? (display.min_served === null ? null : fail("display.min_served must be null")) : amount(display.min_served, h6.min_served, "min_served");
  if (h6.min_events === null) {
    if (display.min_events !== null) fail("display.min_events must be null");
  } else {
    amount(display.min_events, h6.min_events, "min_events");
  }

  return {
    event_id: eventId,
    body_digest: bodyDigest,
    digests: {
      tool: hex(rec(prov.tool, "provenance tool").sha256_lf, "provenance tool sha256_lf"),
      prereg: inputDigest("prereg"), scores: inputDigest("scores"), u3_inputs: inputDigest("u3_inputs"),
      u3_realized: inputDigest("u3_realized"), oracle_path: inputDigest("oracle_path"), e2_comparison: inputDigest("e2_comparison"),
    },
    unit,
    strata_cuts: cuts,
    strata,
    pooled,
    committable,
    h4: {
      threshold: h4.threshold,
      class_a: h4Checked(h4a, "h4.class_a"),
      all: h4Checked(h4b, "h4.all"),
      reconciliation: {
        positions_reconciled: int(rc.positions_reconciled, "h4 positions_reconciled"), positions_abstained: int(rc.positions_abstained, "h4 positions_abstained"),
        calls_in_window: int(rc.calls_in_window, "h4 calls_in_window"), calls_not_in_window: int(rc.calls_not_in_window, "h4 calls_not_in_window"),
      },
      accounts_abstained: int(h4.accounts_abstained, "h4 accounts_abstained"),
      liquidated_amounts: {
        sum: amount(liqShown.sum_y, hp.sum_y, "liquidated_class_a.sum_y"),
        after_first_call: amount(liqShown.sum_after_first, hp.sum_after_first, "liquidated_class_a.sum_after_first"),
        deficit_apart: amount(liqShown.sum_deficit_apart, hp.sum_deficit_apart, "liquidated_class_a.sum_deficit_apart"),
      },
    },
    h6: {
      outcome: h6Out,
      lag_bound: lagBound,
      series: { n_updates: int(h6s.n_updates, "h6 n_updates"), monotone_blocks: bool(h6s.monotone_blocks, "h6 monotone_blocks"), phase_change: bool(h6s.phase_change, "h6 phase_change") },
      sampled: {
        n: int(sb.n, "h6 sampled n"), in_series: int(sb.in_events, "h6 sampled in_events"), equal_to_anchor: int(sb.equal_to_p0, "h6 sampled equal_to_p0"),
        outside: int(sb.outside, "h6 sampled outside"), max_lag: nullableLag(sb.max_lag, "h6 sampled max_lag"), lag_over_bound: int(sb.lag_over_bound, "h6 lag_over_bound"),
        lag_undefined: int(sb.lag_undefined, "h6 lag_undefined"), violations: arr(sb.violations, "h6 violations").length,
      },
      at_call_block: { n: int(pc.n, "h6 call-block n"), in_series: int(pc.in_events, "h6 call-block in_events"), max_lag: nullableLag(pc.max_lag, "h6 call-block max_lag") },
      anchor: {
        block: int(anc.block, "h6 anchor block"), price: amount(display.anchor_price, anc.price, "anchor_price"),
        source: anc.source === "answer_updated_pre_b0" ? "last_update_before_reference" : "book_price_fallback",
      },
      min_served: minServed,
      sample_note_present: typeof h6.sample_note === "string" && h6.sample_note.length > 0,
    },
    h5: { population: int(h5.population_mono_weth, "h5 population"), k: int(h5.k_h5, "h5 floor"), meets: bool(h5.meets_k_h5, "h5 meets"), class_a_n: int(h5.class_a_n, "h5 class_a_n") },
    zero_rule: {
      crossed_at_zero: int(q0.crossed_yhat_zero, "q0 crossed at zero"),
      liquidated_at_zero: int(q0.yhat_zero_liquidated, "q0 liquidated at zero"),
      without_crossing: missed.length,
      crossed_and_liquidated: arr(q0.crossed_yhat_zero_liquidated, "q0 crossed and liquidated").length,
      missed_amounts: missed.map((y, i) => amount(at(missedShown, i, "display.zero_rule_missed_amounts"), y, `zero_rule_missed_amounts[${String(i)}]`)),
      accounts: missedAccounts,
    },
    labels: {
      label_lines: int(labels.label_lines, "labels.label_lines"), unresolved: int(labels.labels_no_quorum_unresolved, "labels unresolved"),
      residual_no_quorum: int(labels.residual_no_quorum, "labels residual_no_quorum"),
      deficit_no_price_non_usdt: int(labels.deficit_base_no_price_non_usdt, "labels deficit without price"), other_event_lines: int(labels.other_event_lines, "labels other_event_lines"),
    },
    clause_359: { no_non_on_committable: clauseNoNon, unresolved: clauseUnresolved, condition_satisfied: clauseSatisfied, pooled_outcome_outside: clausePooled },
  };
}
