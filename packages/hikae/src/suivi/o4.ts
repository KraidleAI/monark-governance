/**
 * HIKAE tracking: the O4 state of a cell, the licence by the test K, the closure of its segment by the test W or by an alarm, and
 * the budget of an open segment.
 *
 *   - K(i, j) = capitalOfCounts(bets_k, "below", a, i, j) counts every label since the start; it licenses once, at the first label
 *     at which K delta_adm >= 1. W(i, j) = capitalOfCounts(bets_w, "above", a, i, j) counts the labels of an open segment after its
 *     opening; it closes the segment at the first label at which W delta_exh >= 1. A closed segment is absorbing for the policy version;
 *   - budgetNano = floor(10^9 (1 - delta_exh W)) in an open segment, -1 elsewhere;
 *   - o4Step, o4CloseOnAlarm and budgetNano refuse a policy that assertSuiviPolicy refuses and a malformed state: its form first
 *     (counts, ranks and seqs, segment fields), then its capital (K under 1/delta_adm without licence, W against 1/delta_exh by segment).
 * Every decision is taken on exact rationals. Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { capitalOfCounts, crosses, floorScaled, mul, q, qParse, sub, type Q } from "../pari/index.ts";
import type { Label } from "./label.ts";
import { assertSuiviPolicy, mixtureOf, type SuiviPolicy } from "./policy.ts";

export type O4Segment =
  | { readonly kind: "no_license" }
  | { readonly kind: "open"; readonly opened_at: number; readonly opened_seq: number | null }
  | { readonly kind: "closed"; readonly opened_at: number; readonly opened_seq: number | null; readonly closed_at: number;
    readonly closed_seq: number; readonly closed_by: "w_exhausted" | "alarm" };

export interface O4State {
  readonly k_t: number;
  readonly k_k: number;
  readonly licensed_at: number | null;
  readonly w_t: number;
  readonly w_k: number;
  readonly last_seq: number | null;
  readonly segment: O4Segment;
}

/** The two capitals and the two deltas of an accepted policy. */
interface Tests {
  readonly K: (t: number, k: number) => Q;
  readonly W: (t: number, k: number) => Q;
  readonly deltaAdm: Q;
  readonly deltaExh: Q;
}

const nat = (v: unknown): boolean => Number.isSafeInteger(v) && (v as number) >= 0;
const natOrNull = (v: unknown): boolean => v === null || nat(v);

function testsOf(policy: SuiviPolicy): Tests {
  assertSuiviPolicy(policy);
  const a = qParse(policy.a), mixK = mixtureOf(policy.bets_k), mixW = mixtureOf(policy.bets_w);
  return { K: (t, k) => capitalOfCounts(mixK, "below", a, t, k), W: (t, k) => capitalOfCounts(mixW, "above", a, t, k),
    deltaAdm: qParse(policy.delta_adm), deltaExh: qParse(policy.delta_exh) };
}

/** Refuses a malformed state, form before capital, so that capitalOfCounts sees only safe integers >= 0. */
function checkState(s: O4State, x: Tests, what: string): void {
  const bad = (rule: string): never => {
    throw new RangeError(`${what}: malformed state, ${rule}`);
  };
  const { k_t, k_k, licensed_at, w_t, w_k, last_seq, segment: g } = s;
  if (!nat(k_t) || !nat(k_k) || !nat(w_t) || !nat(w_k)) bad("a count is not a safe integer >= 0");
  if (!natOrNull(last_seq) || !natOrNull(licensed_at)) bad("last_seq or licensed_at is neither null nor a safe integer >= 0");
  if (k_k > k_t) bad("k_k above k_t");
  if ((last_seq === null) !== (k_t === 0)) bad("last_seq is null exactly when k_t is 0");
  if (last_seq !== null && k_t > last_seq + 1) bad("k_t above last_seq + 1");
  if (licensed_at !== null && (licensed_at < 1 || licensed_at > k_t)) bad("licensed_at outside [1, k_t]");
  if (g.kind === "no_license") {
    if (licensed_at !== null) bad("no_license with a licence");
    if (w_t !== 0 || w_k !== 0) bad("no_license with W counts");
  } else {
    if (!nat(g.opened_at) || !natOrNull(g.opened_seq)) bad("opened_at or opened_seq is not a safe integer >= 0");
    if ((g.opened_seq === null) !== (g.opened_at === 0)) bad("opened_seq is null exactly when opened_at is 0");
    // A segment opened after the start is opened by the licence, at its rank.
    if (g.opened_at > 0 && licensed_at !== g.opened_at) bad("opened_at is not licensed_at");
    if (g.kind === "open") {
      if (w_t !== k_t - g.opened_at) bad("open with w_t not k_t - opened_at");
      if (g.opened_seq !== null && g.opened_seq > (last_seq ?? -1)) bad("opened_seq after last_seq");
    } else {
      if (!nat(g.closed_at) || !nat(g.closed_seq)) bad("closed_at or closed_seq is not a safe integer >= 0");
      if (g.closed_at > k_t) bad("closed_at above k_t");
      if (w_t !== g.closed_at - g.opened_at) bad("closed with w_t not closed_at - opened_at");
      if (g.closed_seq > (last_seq ?? -1)) bad("closed_seq after last_seq");
      if (g.opened_seq !== null && g.opened_seq > g.closed_seq) bad("opened_seq after closed_seq");
      if (g.closed_at === g.opened_at && g.closed_seq !== g.opened_seq) bad("closed at the opening rank with another seq");
      if (g.closed_by === "w_exhausted" && g.opened_seq !== null && g.opened_seq >= g.closed_seq) bad("closed by W at the opening seq");
    }
  }
  if (licensed_at === null && crosses(x.K(k_t, k_k), x.deltaAdm)) bad("K at 1/delta_adm without a licence");
  if (g.kind === "no_license") return;
  // W is evaluated in every segment; capitalOfCounts refuses w_k above w_t.
  const wCrossed = crosses(x.W(w_t, w_k), x.deltaExh);
  if (g.kind === "open" && wCrossed) bad("open with W at 1/delta_exh");
  if (g.kind === "closed" && g.closed_by === "w_exhausted" && !wCrossed) bad("closed by W under 1/delta_exh");
  if (g.kind === "closed" && g.closed_by === "alarm" && wCrossed) bad("closed by an alarm with W at 1/delta_exh");
}

export function o4Init(policy: SuiviPolicy, open: boolean): O4State {
  const segment: O4Segment = open ? { kind: "open", opened_at: 0, opened_seq: null } : { kind: "no_license" };
  return { k_t: 0, k_k: 0, licensed_at: null, w_t: 0, w_k: 0, last_seq: null, segment };
}

export function o4Step(s: O4State, label: Label, policy: SuiviPolicy): O4State {
  const x = testsOf(policy);
  checkState(s, x, "o4Step");
  if (label.E !== 0 && label.E !== 1) throw new RangeError(`o4Step: label E ${String(label.E)} is neither 0 nor 1`);
  if (!nat(label.seq) || (s.last_seq !== null && label.seq <= s.last_seq)) {
    throw new RangeError(`o4Step: label seq ${String(label.seq)} is not a safe integer >= 0 past last_seq`);
  }
  // K first, whatever the segment.
  const k_t = s.k_t + 1, k_k = s.k_k + label.E;
  const licenses = s.licensed_at === null && crosses(x.K(k_t, k_k), x.deltaAdm);
  const licensed_at = licenses ? k_t : s.licensed_at;
  let { w_t, w_k } = s, segment: O4Segment = { ...s.segment };
  if (s.segment.kind === "no_license") {
    // The licensing label does not enter W.
    if (licenses) segment = { kind: "open", opened_at: k_t, opened_seq: label.seq };
  } else if (s.segment.kind === "open") {
    w_t += 1;
    w_k += label.E;
    if (crosses(x.W(w_t, w_k), x.deltaExh)) {
      segment = { kind: "closed", opened_at: s.segment.opened_at, opened_seq: s.segment.opened_seq, closed_at: k_t, closed_seq: label.seq,
        closed_by: "w_exhausted" };
    }
  }
  return { k_t, k_k, licensed_at, w_t, w_k, last_seq: label.seq, segment };
}

export function o4CloseOnAlarm(s: O4State, policy: SuiviPolicy): O4State {
  checkState(s, testsOf(policy), "o4CloseOnAlarm");
  if (s.segment.kind !== "open") throw new RangeError("o4CloseOnAlarm: the segment is not open");
  if (s.last_seq === null) throw new RangeError("o4CloseOnAlarm: no label has entered");
  const { opened_at, opened_seq } = s.segment;
  return { ...s, segment: { kind: "closed", opened_at, opened_seq, closed_at: s.k_t, closed_seq: s.last_seq, closed_by: "alarm" } };
}

export function budgetNano(s: O4State, policy: SuiviPolicy): bigint {
  const x = testsOf(policy);
  checkState(s, x, "budgetNano");
  if (s.segment.kind !== "open") return -1n;
  return floorScaled(sub(q(1n), mul(x.deltaExh, x.W(s.w_t, s.w_k))), 10n ** 9n);
}
