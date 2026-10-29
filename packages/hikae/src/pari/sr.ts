/**
 * HIKAE betting library: the published change reading, R <- (1 + R) g, in fixed point at 2^-64 rounded down.
 *
 *   - srIncrement(lambda, m, x) = g = 1 + lambda (x/m - 1), lambda and m in (0, 1), x in {0, 1}: a positive factor of mean 1 when x has
 *     mean m;
 *   - srStep keeps, for each bet j, the value of R^j in units of 2^-64: r'_j = floor((2^64 + r_j) g_j), one truncation per component and
 *     per step, so the fixed value never exceeds the exact one; the initial state is all 0n (R_0 = 0);
 *   - srValue(r, mix) = sum_j w_j r_j / 2^64, exact.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { checkBit } from "./bet.ts";
import { checkMixture, integerWeights, item, type Mixture } from "./mixture.ts";
import { add, checkQ, inOpenUnit, mul, q, sub, type Q } from "./rational.ts";

/** One unit of the fixed point: 2^64. */
export const UNIT = 2n ** 64n;

/** Refuses a bet of the reading or of the detector outside (0, 1), bounds excluded. */
export function checkReadingBet(lambda: Q): void {
  checkQ(lambda, "srIncrement lambda");
  if (!inOpenUnit(lambda)) throw new RangeError("srIncrement: lambda outside (0, 1)");
}

export function srIncrement(lambda: Q, m: Q, x: 0 | 1): Q {
  checkReadingBet(lambda);
  checkQ(m, "srIncrement m");
  if (!inOpenUnit(m)) throw new RangeError("srIncrement: m outside (0, 1)");
  checkBit(x, "srIncrement");
  const ratio = q(BigInt(x) * m.d, m.n); // x/m
  return add(q(1n), mul(lambda, sub(ratio, q(1n))));
}

/** Refuses a state whose length is not that of the mixture or whose component is negative. */
export function checkState(state: readonly bigint[], mix: Mixture, what: string): void {
  if (!Array.isArray(state) || state.length !== mix.lambdas.length) throw new RangeError(`${what}: state length differs from the mixture`);
  for (const v of state) if (typeof v !== "bigint" || v < 0n) throw new RangeError(`${what}: a state component is not a bigint >= 0`);
}

/** The increments g_j of a validated mixture at (m, x), the mixture refused when a bet is outside (0, 1). */
export function increments(mix: Mixture, m: Q, x: 0 | 1, what: string): Q[] {
  checkMixture(mix, checkReadingBet, what);
  return mix.lambdas.map((lambda) => srIncrement(lambda, m, x));
}

export function srStep(r: readonly bigint[], mix: Mixture, m: Q, x: 0 | 1): bigint[] {
  const g = increments(mix, m, x, "srStep");
  checkState(r, mix, "srStep");
  return r.map((v, j) => {
    const gj = item(g, j);
    return ((UNIT + v) * gj.n) / gj.d;
  });
}

/** sum_j w_j s_j / 2^64, exact, for a validated state of a validated mixture. */
export function fixedValue(state: readonly bigint[], mix: Mixture, what: string): Q {
  checkMixture(mix, checkReadingBet, what);
  checkState(state, mix, what);
  const { omega, scale } = integerWeights(mix);
  let num = 0n;
  state.forEach((v, j) => {
    num += item(omega, j) * v;
  });
  return q(num, scale * UNIT);
}

export function srValue(r: readonly bigint[], mix: Mixture): Q {
  return fixedValue(r, mix, "srValue");
}
