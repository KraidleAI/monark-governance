// MONARK Bell, the blocking controls of a run before its deposit: a pure port of the controls C02, C03 to C05, C09, C12, C13 and C14 of
// apps/bell/ops/q6-controls.mjs (the operator's tool, unchanged), with C14 STRICT: a no_close_ref session is refused even while its reference
// close is not yet publishable (pending = 0, never the tool's tolerance). Plus the ADV regime control: a session whose ADV month holds a trade
// date of the extended SIP regime is refused while the ruling ADV-SIP-ETH-1 is not written or the switch is not confirmed. Pure: no clock (nowMs
// is an input), no I/O (the four files of the run and its ledger lines come parsed), no environment. Each refusal is named. It imports the
// calendar (sessions.ts), the ADV month (volume.ts), the digest (digest.ts) and the cash-leg labels (close.ts), and copies none of them.
// Out of the port: C02's window pinned to a course (here the window of the unit, passed in) and C13's lock files (the caller reads the ledger
// after the run has released it). C13's page bound is the --max-pages the caller gave runMain.
import { createHash } from "node:crypto";
import { ADV_BARS_LABEL, CASH_CLOSE_LABEL, CASH_CROSS_LABEL } from "./close.ts";
import { bellSha, canonical } from "./digest.ts";
import { classifySession, earliestPublishUtc, etWallClockToUtcMs, refCloseDateOf, sipTradeDateOf, type SessionLabel, type SipSwitchStatus } from "./sessions.ts";
import { advPeriodOf, tradingDaysOf } from "./volume.ts";

/** The ruling ADV-SIP-ETH-1 (which ADV definition holds across the SIP switch): null until it is written by a dated line. */
export const ADV_SIP_ETH_RULING: string | null = null;
export type ControlId = "C02" | "C03" | "C04" | "C05" | "C09" | "C12" | "C13" | "C14" | "ADV";
export const CHECK_REFUSALS = Object.freeze(["run_schema_unknown", "run_window_not_the_unit", "bell_sha_mismatch", "trajectory_not_anchored", "adv_month_not_covered",
  "quorum_or_fill_missing", "cash_leg_fault", "fault_label_not_bare", "timeline_chain_broken", "ledger_missing", "ledger_refused_attempt", "enumeration_at_page_cap",
  "session_join_unproven", "close_ref_missing", "stop_cash_cross_mismatch", "cash_cross_not_matched", "gate_not_bound", "adv_month_unread", "adv_regime_unruled"] as const);
export type CheckRefusalCode = (typeof CHECK_REFUSALS)[number];
export interface CheckRefusal { readonly control: ControlId; readonly code: CheckRefusalCode; readonly why: string }
/** The four files runMain writes, parsed: state.json, journal.json, provenance.json, and the lines of timeline.jsonl. */
export interface RunFiles { readonly state: unknown; readonly journal: unknown; readonly provenance: unknown; readonly timeline: readonly unknown[] }
export interface ChecksInput {
  readonly run: RunFiles;
  readonly window: { readonly from_utc_ms: number; readonly to_utc_ms: number }; // the window the caller gave runMain (the unit's)
  readonly ledger: { readonly lines: Readonly<Record<string, readonly unknown[]>>; readonly maxPages: number }; // per operator, its cycle ledger, parsed
  readonly nowMs: number;
  readonly sipStatus: SipSwitchStatus;
  readonly advRuling: string | null;
}
export interface ChecksVerdict { readonly ok: boolean; readonly refusals: readonly CheckRefusal[] }

type O = Record<string, unknown>;
type Canon = Parameters<typeof canonical>[0];
const obj = (x: unknown): O => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as O) : {});
const arr = (x: unknown): unknown[] => (Array.isArray(x) ? (x as unknown[]) : []);
const BARE = /^[a-z0-9][a-z0-9-]*$/, DATE = /^\d{4}-\d{2}-\d{2}$/, CASH: readonly unknown[] = [CASH_CLOSE_LABEL, CASH_CROSS_LABEL, ADV_BARS_LABEL];

/** gap -> session date: within one (symbol, session, regime) bucket the k-th gap is the k-th volume entry (q6-controls.mjs joinAnchors). */
function joinAnchors(digest: O): { pairs: Array<{ gap: O; anchor: string }> } | { why: string } {
  const bucket = (e: O): string => `${String(e.symbol)}|${String(e.session)}|${typeof e.regime === "string" ? e.regime : "null"}`;
  const vb = new Map<string, O[]>(), seen = new Map<string, number>(), pairs: Array<{ gap: O; anchor: string }> = [];
  for (const e of arr(digest.volume).map(obj)) vb.set(bucket(e), [...(vb.get(bucket(e)) ?? []), e]);
  for (const e of arr(digest.gaps).map(obj)) {
    const b = bucket(e), i = seen.get(b) ?? 0, ve = (vb.get(b) ?? [])[i];
    seen.set(b, i + 1);
    if (!ve || ve.n !== e.n || typeof ve.session_date_et !== "string") return { why: `gap ${b}#${String(i)} has no volume entry of the same n` };
    pairs.push({ gap: e, anchor: ve.session_date_et });
  }
  if ([...vb].some(([b, l]) => l.length !== (seen.get(b) ?? 0))) return { why: "gap and volume buckets differ in size" };
  return { pairs };
}

/** True when trading day d is a trade date of the extended SIP regime: the UTP day of d then opens the evening before (sipTradeDateOf). */
function extendedSipDay(d: string): boolean {
  const [y, mo, day] = d.split("-").map(Number);
  return sipTradeDateOf(etWallClockToUtcMs(y ?? 0, mo ?? 1, (day ?? 1) - 1, 21, 30, 0), "utp") !== null;
}

/** The verdict on one run: ok iff no control refuses. */
export function checkRun(input: ChecksInput): ChecksVerdict {
  const refusals: CheckRefusal[] = [];
  const refuse = (control: ControlId, code: CheckRefusalCode, why: string): void => { refusals.push({ control, code, why }); };
  const st = obj(input.run.state), digest = obj(st.digest), R = obj(st.residuals), w = obj(st.window);
  const r = (k: string): number => { const x = R[k]; return typeof x === "number" ? x : NaN; };
  // C02: schema, the unit's window, bell_sha recomputed equal to the state's and to the provenance's
  if (st.schema !== "bell-state-v1") refuse("C02", "run_schema_unknown", `schema=${String(st.schema)}`);
  if (w.from_utc_ms !== input.window.from_utc_ms || w.to_utc_ms !== input.window.to_utc_ms) refuse("C02", "run_window_not_the_unit", `state.window=${JSON.stringify(w)}`);
  let sha: string | null = null;
  try { sha = bellSha(st.digest as Canon); } catch (e) { refuse("C02", "bell_sha_mismatch", `bellSha threw: ${e instanceof Error ? e.message : String(e)}`); }
  if (sha !== null && (sha !== st.bell_sha || sha !== obj(input.run.provenance).bellSha)) refuse("C02", "bell_sha_mismatch", `recomputed ${sha}`);
  // C03 to C05: the abstentions that void a run
  if (r("no_multiplier") !== 0 || r("rebase_unverified") !== 0) refuse("C03", "trajectory_not_anchored", `no_multiplier=${String(r("no_multiplier"))} rebase_unverified=${String(r("rebase_unverified"))}`);
  if (r("no_adv") !== 0) refuse("C04", "adv_month_not_covered", `no_adv=${String(r("no_adv"))}`);
  if (r("no_quorum") !== 0 || r("no_fill_in_window") !== 0) refuse("C05", "quorum_or_fill_missing", `no_quorum=${String(r("no_quorum"))} no_fill_in_window=${String(r("no_fill_in_window"))}`);
  // C09: no cash-leg fault, no fault label the publisher refuses (another fault is a skipped fill: the tool's WARN, not a refusal)
  const faults = arr(obj(input.run.journal).faults).map(obj);
  const cash = faults.filter((f) => CASH.includes(f.provider)), hosts = faults.filter((f) => !BARE.test(String(f.provider)));
  if (cash.length) refuse("C09", "cash_leg_fault", JSON.stringify(cash));
  if (hosts.length) refuse("C09", "fault_label_not_bare", JSON.stringify(hosts));
  // C12: the timeline chain
  let prev = "0".repeat(64);
  for (const [i, line] of input.run.timeline.entries()) {
    if (obj(line).prev_line_hash !== prev) { refuse("C12", "timeline_chain_broken", `line ${String(i + 1)}`); break; }
    prev = createHash("sha256").update(canonical(line as Canon), "utf8").digest("hex");
  }
  // C13: this run's segment of each cycle ledger (after the last-but-one unlocked line): no refused attempt, enumeration under the page cap
  const ops = Object.entries(input.ledger.lines);
  if (ops.length === 0) refuse("C13", "ledger_missing", "no operator ledger");
  for (const [op, lines] of ops) {
    const ents = lines.map(obj);
    let end = -1, beg = -1;
    for (let i = ents.length - 1; i >= 0; i--) if (ents[i]?.outcome === "unlocked") { if (end < 0) end = i; else { beg = i; break; } }
    const seg = ents.slice(beg + 1, end < 0 ? ents.length : end), att = seg.filter((e) => e.outcome === "attempted");
    const refused = seg.filter((e) => e.outcome === "refused").length;
    const pages = att.reduce((n, e) => n + Object.keys(obj(e.by_op_method)).filter((k) => k.split("|")[1] === "getSignaturesForAddress").length, 0);
    if (refused > 0) refuse("C13", "ledger_refused_attempt", `${op}: ${String(refused)} refused`);
    if (pages >= input.ledger.maxPages) refuse("C13", "enumeration_at_page_cap", `${op}: getSignaturesForAddress=${String(pages)} >= ${String(input.ledger.maxPages)}`);
  }
  // C14 STRICT: every session carries gT bound to its gate and a matched cross; a no_close_ref is refused, pending or not
  const J = joinAnchors(digest);
  if ("why" in J) refuse("C14", "session_join_unproven", J.why);
  else for (const { gap, anchor } of J.pairs) {
    const ref = refCloseDateOf(gap.session as SessionLabel, anchor), epu = earliestPublishUtc(ref), at = `${String(gap.session)}|${anchor} (ref ${ref})`;
    if (gap.abstain === "cash_cross_mismatch") refuse("C14", "stop_cash_cross_mismatch", `${at}: investigate the cross`);
    else if (gap.abstain === "no_close_ref") refuse("C14", "close_ref_missing", `${at}: ${epu <= input.nowMs ? "publishable since" : "pending until"} ${String(epu)}`);
    else if (!("abstain" in gap)) {
      if (typeof gap.gT !== "string" || gap.earliest_publish_utc !== epu) refuse("C14", "gate_not_bound", `${at}: gT=${typeof gap.gT} earliest_publish_utc=${String(gap.earliest_publish_utc)} (expected ${String(epu)})`);
      else if (gap.cash_cross !== "matched") refuse("C14", "cash_cross_not_matched", `${at}: cash_cross=${String(gap.cash_cross)}`);
    }
  }
  if (r("cash_cross_mismatch") !== 0) refuse("C14", "stop_cash_cross_mismatch", `residual cash_cross_mismatch=${String(r("cash_cross_mismatch"))}`);
  if (r("cash_cross_unavailable") !== 0) refuse("C14", "cash_cross_not_matched", `residual cash_cross_unavailable=${String(r("cash_cross_unavailable"))}`);
  // ADV: the ADV month of each session of the run (its volume entries and the unit's own anchor) against the dated SIP day
  const ruled = input.advRuling !== null && input.sipStatus === "confirmed";
  const anchors = new Set(arr(digest.volume).map((v) => obj(v).session_date_et).filter((d): d is string => typeof d === "string" && DATE.test(d)));
  anchors.add(classifySession(input.window.from_utc_ms).sessionDateET);
  for (const d of [...anchors].sort()) {
    const days = tradingDaysOf(advPeriodOf(d));
    if (days === null) refuse("ADV", "adv_month_unread", `${d}: its ADV month leaves the committed calendar`);
    else if (!ruled && days.some(extendedSipDay)) refuse("ADV", "adv_regime_unruled", `${d}: its ADV month holds a trade date of the extended SIP regime; ADV-SIP-ETH-1 ${input.advRuling === null ? "not written" : "written"}, switch ${input.sipStatus}`);
  }
  return { ok: refusals.length === 0, refusals };
}
