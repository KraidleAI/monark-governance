/**
 * HIKAE betting library: the closing detector with weighted restarts, S <- (S + w_t) g, in fixed point at 2^-64 rounded down.
 *
 *   - t >= 1 is the rank of the step; the restart weight w_t = 1/(t (t + 1)) is rounded down first, w~_t = floor(2^64 / (t (t + 1)));
 *   - then s'_j = floor((s_j + w~_t) g_j), g_j = 1 + lambda_j (x/m - 1): one truncation per component and per step, so the fixed value
 *     never exceeds the exact one; the initial state is all 0n (S_0 = 0);
 *   - weightedValue(s, mix) = sum_j w_j s_j / 2^64, exact.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import type { Mixture } from "./mixture.ts";
import { item } from "./mixture.ts";
import type { Q } from "./rational.ts";
import { checkState, fixedValue, increments, UNIT } from "./sr.ts";

export function weightedStep(s: readonly bigint[], mix: Mixture, m: Q, x: 0 | 1, t: number): bigint[] {
  if (!Number.isSafeInteger(t) || t < 1) throw new RangeError(`weightedStep: rank ${String(t)} is not a safe integer >= 1`);
  const g = increments(mix, m, x, "weightedStep");
  checkState(s, mix, "weightedStep");
  const restart = UNIT / (BigInt(t) * BigInt(t + 1));
  return s.map((v, j) => {
    const gj = item(g, j);
    return ((v + restart) * gj.n) / gj.d;
  });
}

export function weightedValue(s: readonly bigint[], mix: Mixture): Q {
  return fixedValue(s, mix, "weightedValue");
}
