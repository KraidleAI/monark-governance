/**
 * HIKAE tracking: the label of a reference evaluation, and the labels entered in the order of the evaluations.
 *
 *   - labelOf: no label out of the population (member false); in it, E = miss for a resolved window and E = 1 for an unresolved one;
 *     refuses a pair of different seqs, member without pre_member, a miss outside {0, 1} and a miss on an unresolved window;
 *   - enterInOrder consumes the pending evaluations in order while their outcomes have arrived, and stops at the first one without its
 *     outcome: that one and the rest stay pending, their arrived outcomes held, sorted by seq. It refuses seqs that do not grow strictly
 *     past the last consumed one, two neighbours whose step gap is not their seq gap times grid_ms (one evaluation per horizon), two
 *     outcomes of one seq, the outcome of an evaluation already consumed, and an outcome of no pending evaluation.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import type { SuiviPolicy } from "./policy.ts";

export interface RefEvaluation {
  readonly seq: number;
  readonly t_step_ms: number;
  readonly yhat_ref: string;
  readonly produced_at_ref: string;
  readonly pre_member: boolean;
}

export interface Outcome {
  readonly seq: number;
  readonly resolved: boolean;
  readonly member: boolean;
  readonly miss: 0 | 1;
}

export interface Label {
  readonly seq: number;
  readonly E: 0 | 1;
}

export function labelOf(ev: RefEvaluation, outcome: Outcome): { E: 0 | 1 } | null {
  if (ev.seq !== outcome.seq) throw new RangeError("labelOf: the evaluation and the outcome have different seqs");
  if (outcome.member && !ev.pre_member) throw new RangeError("labelOf: member without pre_member");
  if (outcome.miss !== 0 && outcome.miss !== 1) throw new RangeError(`labelOf: miss ${String(outcome.miss)} is neither 0 nor 1`);
  if (outcome.miss === 1 && !outcome.resolved) throw new RangeError("labelOf: a miss on an unresolved window");
  if (!outcome.member) return null;
  return { E: outcome.resolved ? outcome.miss : 1 };
}

export function enterInOrder(pending: readonly RefEvaluation[], arrived: readonly Outcome[], policy: SuiviPolicy,
  last: { readonly seq: number; readonly t_step_ms: number } | null): {
  entered: Label[]; pending: RefEvaluation[]; held: Outcome[]; outcomes_through_seq: number | null } {
  let prev = last;
  const seqs = new Set<number>();
  for (const ev of pending) {
    if (prev !== null) {
      if (ev.seq <= prev.seq) throw new RangeError(`enterInOrder: seq ${String(ev.seq)} does not grow past ${String(prev.seq)}`);
      // One evaluation per horizon: disjoint windows on the grid.
      if (ev.t_step_ms - prev.t_step_ms !== (ev.seq - prev.seq) * policy.grid_ms) {
        throw new RangeError(`enterInOrder: the step gap before seq ${String(ev.seq)} is not its seq gap times grid_ms`);
      }
    }
    seqs.add(ev.seq);
    prev = ev;
  }
  const bySeq = new Map<number, Outcome>();
  for (const o of arrived) {
    if (bySeq.has(o.seq)) throw new RangeError(`enterInOrder: two outcomes of seq ${String(o.seq)}`);
    // Checked before the lookup in pending, which starts above last.seq.
    if (last !== null && o.seq <= last.seq) {
      throw new RangeError(`enterInOrder: the outcome of seq ${String(o.seq)} is of a consumed evaluation`);
    }
    if (!seqs.has(o.seq)) throw new RangeError(`enterInOrder: the outcome of seq ${String(o.seq)} is of no pending evaluation`);
    bySeq.set(o.seq, o);
  }
  const entered: Label[] = [];
  let through: number | null = null, stop = pending.length;
  for (const [i, ev] of pending.entries()) {
    const o = bySeq.get(ev.seq);
    if (o === undefined) {
      stop = i;
      break;
    }
    const label = labelOf(ev, o);
    if (label !== null) entered.push({ seq: ev.seq, E: label.E });
    through = ev.seq;
  }
  const rest = pending.slice(stop).map((ev) => ({ ...ev }));
  const held = rest.flatMap((ev) => {
    const o = bySeq.get(ev.seq);
    return o === undefined ? [] : [{ ...o }];
  });
  return { entered, pending: rest, held, outcomes_through_seq: through };
}
