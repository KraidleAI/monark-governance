/**
 * HIKAE binomial core (worksite 2 of the conformal alignment, lot L2-1; ADR draft 0004 v3, D3 and D4).
 *
 * Exact one-sided binomial arithmetic for the per-calibration statement of a Mondrian cell:
 *   - decimal strings (alpha, test_delta) are parsed to integer ratios, with the refusals of D4;
 *   - P(Bin(n, a) <= k) <= delta is decided in big integers, never in floating point;
 *   - k* = the largest k >= 0 with P(Bin(n, alpha) <= k) <= delta (or -1 when none exists);
 *   - n0 = the smallest n at which zero misses meet the rule, (1 - alpha)^n <= delta;
 *   - U(n, k*, delta) = the one-sided Clopper-Pearson upper bound, on a 1e-7 grid, rounded up;
 *   - four-decimal rounding up of a ratio, and the halving test_delta spend of D5.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */

/** A non-negative rational num/den with den > 0 (reduced when built by this module). */
export type Ratio = { readonly num: bigint; readonly den: bigint };

const GRID = 10_000_000n; // 1e-7 grid of the published bound (7 decimals)
const MAX_ATTEMPT = 4; // calib_attempt cap (D5)

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

function reduce(num: bigint, den: bigint): Ratio {
  const g = gcd(num, den);
  return g === 0n ? { num, den } : { num: num / g, den: den / g };
}

/**
 * Parses a plain decimal string "0.d...d" strictly inside (0, 1) to a reduced integer ratio.
 * Refused: an empty string, a sign, an exponent, a second point, a missing leading "0.", zero, 1 or more.
 * "0.10" and "0.1" give the same ratio.
 */
export function parseUnitDecimal(dec: string): Ratio {
  if (!dec.startsWith("0.")) throw new RangeError(`not a plain decimal in (0, 1): "${dec}"`);
  const digits = dec.slice(2);
  if (digits.length === 0 || [...digits].some((c) => c < "0" || c > "9")) throw new RangeError(`not a plain decimal in (0, 1): "${dec}"`);
  const num = BigInt(digits);
  if (num === 0n) throw new RangeError(`not in (0, 1): "${dec}"`);
  return reduce(num, 10n ** BigInt(digits.length));
}

/** Parses alpha: a plain decimal in (0, 1) with at most four decimals once trailing zeros are dropped. */
export function parseAlpha(dec: string): Ratio {
  const r = parseUnitDecimal(dec);
  if (10000n % r.den !== 0n) throw new RangeError(`alpha has more than four decimals: "${dec}"`);
  return r;
}

/** Parses test_delta: a plain decimal in (0, 1) strictly below 0.25 (hypothesis of the rank ordering, D3). */
export function parseTestDelta(dec: string): Ratio {
  const r = parseUnitDecimal(dec);
  if (4n * r.num >= r.den) throw new RangeError(`test_delta must be below 0.25: "${dec}"`);
  return r;
}

function assertCount(name: string, v: number): void {
  if (!Number.isSafeInteger(v) || v < 0) throw new RangeError(`${name} must be a non-negative integer, got ${String(v)}`);
}

/**
 * Exact comparator: true iff P(Bin(n, a) <= k) <= delta, with a = a.num / a.den in [0, 1] and delta >= 0.
 * Computed as delta.den x sum_{i <= k} C(n, i) a.num^i (a.den - a.num)^(n - i) <= delta.num x a.den^n.
 * k < 0 gives an empty sum (0); k >= n gives 1.
 */
export function binomCdfLeq(n: number, k: number, a: Ratio, delta: Ratio): boolean {
  assertCount("n", n);
  if (!Number.isSafeInteger(k)) throw new RangeError(`k must be an integer, got ${String(k)}`);
  if (a.den <= 0n || a.num < 0n || a.num > a.den) throw new RangeError("a must be a ratio in [0, 1]");
  if (delta.den <= 0n || delta.num < 0n) throw new RangeError("delta must be a non-negative ratio");
  const top = Math.min(k, n);
  const q = a.den - a.num;
  const bn = BigInt(n);
  let sum = 0n; // sum_{i <= top} C(n, i) a.num^i q^(top - i), by Horner in q
  let coef = 1n; // C(n, i)
  let pow = 1n; // a.num^i
  for (let i = 0; i <= top; i++) {
    sum = sum * q + coef * pow;
    coef = (coef * (bn - BigInt(i))) / BigInt(i + 1);
    pow *= a.num;
  }
  const total = top < 0 ? 0n : sum * q ** BigInt(n - top);
  return delta.den * total <= delta.num * a.den ** bn;
}

/**
 * k*: the largest k >= 0 with P(Bin(n, alpha) <= k) <= test_delta, or -1 when (1 - alpha)^n > test_delta.
 * Audit P3 E-9 (ADR-CM CM-3a): one linear pass over the exact terms (largestCdfIndexLeq, end of this file)
 * instead of one exact CDF per k (8.7 s at n 4368, alpha 0.45, test_delta 0.05); same decision as binomCdfLeq.
 * The lines below this function keep their numbers (killers of earlier lots are anchored on them).
 */
export function riskControlMaxExceedances(n: number, alphaDec: string, deltaDec: string): number {
  assertCount("n", n);
  return largestCdfIndexLeq(n, parseAlpha(alphaDec), parseTestDelta(deltaDec));
}

/** n0: the smallest n with (1 - alpha)^n <= test_delta (zero misses meet the rule at n0, not at n0 - 1). */
export function zeroErrorFloor(alphaDec: string, deltaDec: string): number {
  const a = parseAlpha(alphaDec);
  const d = parseTestDelta(deltaDec);
  let lo = 0; // (1 - alpha)^0 = 1 > test_delta: never meets
  let hi = 1;
  while (!binomCdfLeq(hi, 0, a, d)) [lo, hi] = [hi, hi * 2];
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (binomCdfLeq(mid, 0, a, d)) hi = mid;
    else lo = mid;
  }
  return hi;
}

function fixed(m: bigint, scale: bigint, places: number): string {
  const whole = m / scale;
  return `${String(whole)}.${String(m % scale).padStart(places, "0")}`;
}

/**
 * U(n, kStar, test_delta): the one-sided Clopper-Pearson upper bound, the a at which P(Bin(n, a) <= kStar) = test_delta,
 * rounded up to the 1e-7 grid (the smallest grid point where the tail is at most test_delta), as a fixed 7-decimal string.
 * Bisection on the exact comparator; the tail is non-increasing in a.
 */
export function missUpperBound(n: number, kStar: number, deltaDec: string): string {
  assertCount("n", n);
  assertCount("kStar", kStar);
  if (kStar >= n) throw new RangeError(`kStar must be below n, got ${String(kStar)} for n = ${String(n)}`);
  const d = parseTestDelta(deltaDec);
  let lo = 0n; // at a = 0 the tail is 1 > test_delta
  let hi = GRID; // at a = 1 the tail is 0 (kStar < n)
  while (hi - lo > 1n) {
    const mid = (lo + hi) / 2n;
    if (binomCdfLeq(n, kStar, { num: mid, den: GRID }, d)) hi = mid;
    else lo = mid;
  }
  return fixed(hi, GRID, 7);
}

/** A ratio in [0, 1] rounded up at four decimals, as "0.dddd" (or "1.0000"). */
export function ceilDecimal4(r: Ratio): string {
  if (r.den <= 0n || r.num < 0n || r.num > r.den) throw new RangeError("ratio must be in [0, 1]");
  const m = (r.num * 10000n + r.den - 1n) / r.den;
  return fixed(m, 10000n, 4);
}

/** test_delta spend (D5): base / 2^(attempt - 1) for calib_attempt 1 to 4, as an exact decimal string without trailing zeros. */
export function spendDelta(baseDec: string, attempt: number): string {
  if (!Number.isSafeInteger(attempt) || attempt < 1 || attempt > MAX_ATTEMPT) throw new RangeError(`calib_attempt must be 1 to ${String(MAX_ATTEMPT)}, got ${String(attempt)}`);
  parseTestDelta(baseDec);
  const digits = baseDec.slice(2);
  const j = attempt - 1;
  const num = BigInt(digits) * 5n ** BigInt(j); // base / 2^j = digits x 5^j / 10^(places + j)
  const text = String(num).padStart(digits.length + j, "0");
  let end = text.length;
  while (end > 1 && text[end - 1] === "0") end--;
  return `0.${text.slice(0, end)}`;
}

/**
 * E-9: the largest k in -1..n-1 with P(Bin(n, a) <= k) <= delta (delta < 1, 0 < a < 1), in one pass over the exact
 * terms t_i = C(n, i) a.num^i q^(n - i), q = a.den - a.num, with t_(i+1) = t_i (n - i) a.num / ((i + 1) q) (an exact
 * integer division); the running sum is compared with delta x a.den^n at each i: the decision of binomCdfLeq(n, i, a, delta).
 */
function largestCdfIndexLeq(n: number, a: Ratio, delta: Ratio): number {
  const q = a.den - a.num;
  const bound = delta.num * a.den ** BigInt(n);
  let term = q ** BigInt(n);
  let cum = 0n;
  for (let i = 0; i <= n; i++) {
    cum += term;
    if (delta.den * cum > bound) return i - 1;
    term = (term * BigInt(n - i) * a.num) / (BigInt(i + 1) * q);
  }
  return n; // unreachable for delta < 1: at i = n the sum is a.den^n
}
