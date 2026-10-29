/**
 * HIKAE betting library: a fixed mixture of bets, its capital from the counts, and the crossing table of a test.
 *
 *   - a Mixture holds bets lambda_j and weights w_j > 0 summing to exactly 1;
 *   - capitalOfCounts(mix, side, a, t, k) = sum_j w_j f1_j^k f0_j^(t - k), f1_j and f0_j the betting factors at x = 1 and x = 0:
 *     with fixed bets, the capital after t labels depends on the count k of ones alone;
 *   - crossingTable(mix, side, a, delta, tMax): for each t in [0, tMax], the frontier k at which capital * delta >= 1. Side "above"
 *     grows in k: the entry is the smallest crossing k of [0, t], or t + 1 when none crosses. Side "below" falls in k: the entry is the
 *     largest crossing k, or -1. The table is built from the exact rationals of the factors, scaled to integers over one common
 *     denominator, and compared on integers, never in floating point.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { betFactor, checkBet, checkSide, type BetSide } from "./bet.ts";
import { add, checkQ, lcm, q, type Q } from "./rational.ts";
import { checkDelta } from "./threshold.ts";

/** A fixed mixture: bets lambdas[j] with weights weights[j] > 0 summing to exactly 1. */
export interface Mixture {
  readonly lambdas: readonly Q[];
  readonly weights: readonly Q[];
}

/** The entry i of a list, or a RangeError when it is missing. */
export function item<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) throw new RangeError(`index ${String(i)} out of range`);
  return v;
}

/** Refuses empty lists or lists of different lengths, a weight <= 0, weights whose exact sum is not 1, and any bet that checkLambda
 *  refuses (the interval of the function that uses the mixture). */
export function checkMixture(mix: Mixture, checkLambda: (lambda: Q) => void, what: string): void {
  const { lambdas, weights } = mix;
  if (lambdas.length === 0 || lambdas.length !== weights.length) throw new RangeError(`${what}: mixture lists empty or of unequal lengths`);
  let total = q(0n);
  for (const w of weights) {
    checkQ(w, `${what} weight`);
    if (w.n <= 0n) throw new RangeError(`${what}: a weight is not positive`);
    total = add(total, w);
  }
  if (total.n !== 1n || total.d !== 1n) throw new RangeError(`${what}: the weights do not sum to 1`);
  for (const lambda of lambdas) checkLambda(lambda);
}

/** The weights over their least common denominator: w_j = omega[j] / scale. */
export function integerWeights(mix: Mixture): { readonly omega: bigint[]; readonly scale: bigint } {
  const scale = mix.weights.reduce((acc, w) => lcm(acc, w.d), 1n);
  return { omega: mix.weights.map((w) => w.n * (scale / w.d)), scale };
}

/** The two factors of each bet over one common denominator: f1_j = one[j] / den and f0_j = zero[j] / den. */
function integerFactors(mix: Mixture, side: BetSide, a: Q): { readonly one: bigint[]; readonly zero: bigint[]; readonly den: bigint } {
  const f1 = mix.lambdas.map((lambda) => betFactor(side, lambda, a, 1));
  const f0 = mix.lambdas.map((lambda) => betFactor(side, lambda, a, 0));
  const den = [...f1, ...f0].reduce((acc, f) => lcm(acc, f.d), 1n);
  const lift = (f: Q): bigint => f.n * (den / f.d);
  return { one: f1.map(lift), zero: f0.map(lift), den };
}

function checkTest(mix: Mixture, side: BetSide, a: Q, what: string): void {
  checkSide(side);
  checkMixture(mix, (lambda) => {
    checkBet(side, lambda, a);
  }, what);
}

export function capitalOfCounts(mix: Mixture, side: BetSide, a: Q, t: number, k: number): Q {
  checkTest(mix, side, a, "capitalOfCounts");
  if (!Number.isSafeInteger(t) || !Number.isSafeInteger(k) || k < 0 || k > t) {
    throw new RangeError(`capitalOfCounts: counts t ${String(t)} and k ${String(k)} outside 0 <= k <= t`);
  }
  const { omega, scale } = integerWeights(mix);
  const { one, zero, den } = integerFactors(mix, side, a);
  const ones = BigInt(k), zeros = BigInt(t - k);
  let num = 0n;
  omega.forEach((w, j) => {
    num += w * item(one, j) ** ones * item(zero, j) ** zeros;
  });
  return q(num, scale * den ** BigInt(t));
}

export function crossingTable(mix: Mixture, side: BetSide, a: Q, delta: Q, tMax: number): readonly number[] {
  checkTest(mix, side, a, "crossingTable");
  checkDelta(delta, "crossingTable");
  if (!Number.isSafeInteger(tMax) || tMax < 0) throw new RangeError(`crossingTable: tMax ${String(tMax)} is not a safe integer >= 0`);
  const { omega, scale } = integerWeights(mix);
  const { one, zero, den } = integerFactors(mix, side, a);
  // Count c of the winning label (ones for "above", zeros for "below"): with hi > 1 > lo per bet, the capital
  // sum_j omega_j hi_j^c lo_j^(t - c) / (scale den^t) grows in c, so the crossing c form an up-set [front, t].
  const hi = side === "above" ? one : zero, lo = side === "above" ? zero : one;
  let p: bigint[] = omega.map(() => 1n); // p[j] = hi_j^c lo_j^(t - c) at the tracked position (t, c), 0 <= c <= t
  let c = 0, front = 0, denPow = 1n;
  const table: number[] = [];
  for (let t = 0; t <= tMax; t++) {
    if (t > 0) {
      denPow *= den;
      // From (t - 1, c) with c = min(front, t - 1) to (t, front): front <= t always holds.
      const step = front > c ? hi : lo;
      p = p.map((v, j) => v * item(step, j));
      if (front > c) c += 1;
    }
    const bound = scale * delta.d * denPow;
    const crossing = (vals: readonly bigint[]): boolean => {
      let sum = 0n;
      vals.forEach((v, j) => {
        sum += item(omega, j) * v;
      });
      return sum * delta.n >= bound;
    };
    if (crossing(p)) {
      // Move down while the count below still crosses (the exponent of hi is c >= 1, so the division is exact).
      while (c > 0) {
        const down = p.map((v, j) => (v / item(hi, j)) * item(lo, j));
        if (!crossing(down)) break;
        p = down;
        c -= 1;
      }
      front = c;
    } else {
      // Move up until a count crosses (the exponent of lo is t - c >= 1, so the division is exact); none: t + 1.
      front = t + 1;
      while (c < t) {
        p = p.map((v, j) => (v / item(lo, j)) * item(hi, j));
        c += 1;
        if (crossing(p)) {
          front = c;
          break;
        }
      }
    }
    table.push(side === "above" ? front : t - front);
  }
  return table;
}
