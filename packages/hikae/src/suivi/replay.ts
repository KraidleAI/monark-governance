/**
 * HIKAE tracking: the replay of a cell's evidence, from its start, into the budget the gate reads.
 *
 *   - the labels are entered in order by enterInOrder from the reference evaluations and their arrived outcomes, from the start
 *     (no consumed evaluation before them); an evaluation whose outcome has not arrived stops the entry, the rest stay pending;
 *   - label by label: the O4 step first, then the detector step, then the closure of an open segment by the alarm. The order is
 *     forced: o4.ts refuses a closure by the alarm with W at 1/delta_exh, so on a label at which W closes and the alarm rings, the
 *     closure is W's. The alarm is sticky, so a segment that opens after it is closed at its opening;
 *   - the budget is budgetNano read as a number: floor(10^9 (1 - delta_exh W)) / 10^9 in an open segment, -1 with no licence and
 *     after a closure, never 0.
 * The evidence is the caller's: no signature is read (the policy's keyring is checked for its shape only), and nothing is stored.
 * The cost: at t labels a capital of K or W is a fraction of about t L bits, L the bits of the common denominator of its mixture's
 * factors (suiviDenBits), and each label reduces such fractions, so the replay of n labels costs about n (n L)^2; a served caller
 * bounds n L (apps/harness).
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { betFactor, q, qParse, type BetSide } from "../pari/index.ts";
import { alarm, detInit, detStep } from "./detector.ts";
import { enterInOrder, type Outcome, type RefEvaluation } from "./label.ts";
import { budgetNano, o4CloseOnAlarm, o4Init, o4Step } from "./o4.ts";
import { assertSuiviPolicy, mixtureOf, type BetsText, type SuiviPolicy } from "./policy.ts";

export interface SuiviEvidence {
  readonly policy: SuiviPolicy;
  /** The cell's reference evaluations from its start, in seq order, one per horizon on the policy's grid. */
  readonly evaluations: readonly RefEvaluation[];
  /** Their arrived outcomes, in any order. */
  readonly outcomes: readonly Outcome[];
  /** The starting state of the cell's segment: open, or waiting for the licence of the test K. */
  readonly open: boolean;
}

export interface SuiviReplay {
  /** The labels entered: the consumed evaluations in the population. */
  readonly labels: number;
  /** The seq of the last consumed evaluation, null when none is. */
  readonly outcomes_through_seq: number | null;
  readonly segment: "no_license" | "open" | "closed";
  readonly closed_by: "w_exhausted" | "alarm" | null;
  readonly alarm: boolean;
  /** budgetNano: >= 0 in an open segment, -1 elsewhere. */
  readonly budget_nano: bigint;
  /** budget_nano / 10^9 in an open segment, -1 elsewhere. */
  readonly budget: number;
}

export function suiviReplay(e: SuiviEvidence): SuiviReplay {
  assertSuiviPolicy(e.policy);
  if (typeof e.open !== "boolean") throw new RangeError("suiviReplay: open is not a boolean");
  if (!Array.isArray(e.evaluations) || !Array.isArray(e.outcomes)) throw new RangeError("suiviReplay: evaluations or outcomes is not a list");
  const { entered, outcomes_through_seq } = enterInOrder(e.evaluations, e.outcomes, e.policy, null);
  let o4 = o4Init(e.policy, e.open), det = detInit(e.policy);
  for (const label of entered) {
    o4 = o4Step(o4, label, e.policy);
    det = detStep(det, label, e.policy);
    if (o4.segment.kind === "open" && alarm(det, e.policy)) o4 = o4CloseOnAlarm(o4, e.policy);
  }
  const nano = budgetNano(o4, e.policy);
  return { labels: entered.length, outcomes_through_seq, segment: o4.segment.kind,
    closed_by: o4.segment.kind === "closed" ? o4.segment.closed_by : null, alarm: det.alarm_at !== null, budget_nano: nano,
    budget: nano < 0n ? -1 : Number(nano) / 1e9 };
}

/** L of the cost above: the bits of the least common denominator of the factors at x = 0 and x = 1 of every bet, for K (bets_k,
 *  below) and W (bets_w, above), the larger of the two. The detector is not counted: it runs in fixed point. Checks the policy. */
export function suiviDenBits(policy: SuiviPolicy): number {
  assertSuiviPolicy(policy);
  const a = qParse(policy.a);
  const bits = (bets: BetsText, side: BetSide): number => {
    let den = 1n;
    // lcm(den, d) = den (d / gcd(den, d)), and q(den, d) reduces by that gcd: its denominator is d / gcd(den, d).
    for (const lambda of mixtureOf(bets).lambdas) for (const x of [0, 1] as const) den *= q(den, betFactor(side, lambda, a, x).d).d;
    return den.toString(2).length;
  };
  return Math.max(bits(policy.bets_k, "below"), bits(policy.bets_w, "above"));
}
