/**
 * HIKAE tracking: the closing detector with weighted restarts and the published change reading, computed from the labels alone.
 *
 *   - both run on the bets of bets_sr at m, in fixed point at 2^-64 rounded down by the betting library: the detector
 *     S <- (S + w_t) g with w_t = 1/(t (t + 1)), and the reading R <- (1 + R) g; their components are kept as canonical decimal texts;
 *   - the alarm is sticky: set at the first rank at which the detector reaches 1/alpha_arl, never cleared, while the detector and the
 *     reading keep running;
 *   - srReading compares the reading with its threshold at each call, without memory; it is published and never acts on the alarm;
 *   - detInit, detStep, alarm and srReading refuse a policy that assertSuiviPolicy refuses and a malformed state, its form first, then
 *     against the policy (the detector at 1/alpha_arl without an alarm); detStep then refuses a label E outside {0, 1} and a label seq
 *     that is not a safe integer >= 0 past last_seq.
 * Every decision is taken on exact rationals. Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { crosses, qParse, srStep, srValue, weightedStep, weightedValue, type Mixture, type Q } from "../pari/index.ts";
import type { Label } from "./label.ts";
import { assertSuiviPolicy, mixtureOf, srReadingDelta, type SuiviPolicy } from "./policy.ts";

export interface DetState {
  readonly t: number;
  readonly s: readonly string[];
  readonly r: readonly string[];
  readonly last_seq: number | null;
  readonly alarm_at: number | null;
  readonly alarm_seq: number | null;
}

/** The mixture of bets_sr, m and alpha_arl of an accepted policy. */
interface Bets {
  readonly mix: Mixture;
  readonly m: Q;
  readonly arl: Q;
}

const nat = (v: unknown): boolean => Number.isSafeInteger(v) && (v as number) >= 0;
const natOrNull = (v: unknown): boolean => v === null || nat(v);
/** The canonical decimal text of an integer >= 0; BigInt alone also reads "01", "0x10", " 1" and "". */
const COMPONENT = /^(0|[1-9][0-9]*)$/;

function betsOf(policy: SuiviPolicy): Bets {
  assertSuiviPolicy(policy);
  return { mix: mixtureOf(policy.bets_sr), m: qParse(policy.m), arl: qParse(policy.alpha_arl) };
}

/** Refuses a malformed state, its form first, then against the policy; returns its components as bigint. */
function checkState(d: DetState, x: Bets, what: string): { readonly S: bigint[]; readonly R: bigint[] } {
  const bad = (rule: string): never => {
    throw new RangeError(`${what}: malformed state, ${rule}`);
  };
  const { t, s, r, last_seq, alarm_at, alarm_seq } = d;
  if (!nat(t) || !natOrNull(last_seq) || !natOrNull(alarm_at) || !natOrNull(alarm_seq)) {
    bad("t is not a safe integer >= 0, or last_seq, alarm_at or alarm_seq is neither null nor a safe integer >= 0");
  }
  if (![...s, ...r].every((c) => COMPONENT.test(c))) bad("a component is not the canonical text of an integer >= 0");
  if ((last_seq === null) !== (t === 0)) bad("last_seq is null exactly when t is 0");
  if (t === 0 && ![...s, ...r].every((c) => c === "0")) bad("a component is not 0 at t 0");
  // The seqs grow strictly from 0 or more: t labels need a last seq of t - 1 or more.
  if (last_seq !== null && t > last_seq + 1) bad("t above last_seq + 1");
  if ((alarm_at === null) !== (alarm_seq === null)) bad("alarm_at is null exactly when alarm_seq is null");
  if (alarm_at !== null && (alarm_at < 1 || alarm_at > t)) bad("alarm_at outside [1, t]");
  if (alarm_at !== null && alarm_seq !== null) {
    const last = last_seq ?? -1;
    if (alarm_at === t && alarm_seq !== last) bad("alarm at rank t with alarm_seq not last_seq");
    // The t - alarm_at labels after the alarm each take a seq past the one before.
    if (alarm_seq + (t - alarm_at) > last) bad("alarm_seq too late for the labels after it");
    // The alarm_at - 1 labels before the alarm each take a seq of 0 or more below the one after.
    if (alarm_seq < alarm_at - 1) bad("alarm_seq too early for the labels before it");
  }
  const S = s.map((c) => BigInt(c)), R = r.map((c) => BigInt(c));
  // weightedValue and srValue refuse a state whose length is not that of bets_sr.
  const value = weightedValue(S, x.mix);
  srValue(R, x.mix);
  // The step that reaches 1/alpha_arl sets the alarm.
  if (alarm_at === null && crosses(value, x.arl)) bad("the detector at 1/alpha_arl without an alarm");
  return { S, R };
}

export function detInit(policy: SuiviPolicy): DetState {
  assertSuiviPolicy(policy);
  const zeros = (): string[] => policy.bets_sr.lambdas.map(() => "0");
  return { t: 0, s: zeros(), r: zeros(), last_seq: null, alarm_at: null, alarm_seq: null };
}

export function detStep(d: DetState, label: Label, policy: SuiviPolicy): DetState {
  const x = betsOf(policy), { S, R } = checkState(d, x, "detStep");
  if (label.E !== 0 && label.E !== 1) throw new RangeError(`detStep: label E ${String(label.E)} is neither 0 nor 1`);
  if (!nat(label.seq) || (d.last_seq !== null && label.seq <= d.last_seq)) {
    throw new RangeError(`detStep: label seq ${String(label.seq)} is not a safe integer >= 0 past last_seq`);
  }
  const t = d.t + 1;
  const r = srStep(R, x.mix, x.m, label.E);
  // The restart weight of rank t enters at every step, alarm set or not.
  const s = weightedStep(S, x.mix, x.m, label.E, t);
  const rings = d.alarm_at === null && crosses(weightedValue(s, x.mix), x.arl);
  return { t, s: s.map((v) => String(v)), r: r.map((v) => String(v)), last_seq: label.seq, alarm_at: rings ? t : d.alarm_at,
    alarm_seq: rings ? label.seq : d.alarm_seq };
}

export function alarm(d: DetState, policy: SuiviPolicy): boolean {
  checkState(d, betsOf(policy), "alarm");
  return d.alarm_at !== null;
}

export function srReading(d: DetState, policy: SuiviPolicy): { readonly value: Q; readonly above: boolean } {
  const x = betsOf(policy), { R } = checkState(d, x, "srReading");
  const value = srValue(R, x.mix);
  return { value, above: crosses(value, srReadingDelta(policy)) };
}
