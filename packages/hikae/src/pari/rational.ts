/**
 * HIKAE betting library: exact rationals over bigint.
 *
 * A Q is n/d with d > 0 and gcd(n, d) = 1, zero written 0/1; every function of the library returns its Q in that form:
 *   - q(n, d) reduces and carries the sign on the numerator;
 *   - qString writes "n" when d = 1 and "n/d" otherwise; qParse reads back only the texts that qString writes;
 *   - add, sub, mul and pow are exact; cmp is the sign of x - y;
 *   - floorScaled(x, scale) = floor(x * scale), rounded toward minus infinity, never toward zero.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */

/** An exact rational n/d: d > 0, n and d coprime, zero as 0/1. */
export type Q = { readonly n: bigint; readonly d: bigint };

/** The greatest common divisor of |a| and |b| (0 when both are 0). */
export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

/** The least common multiple of two positive integers. */
export function lcm(a: bigint, b: bigint): bigint {
  return (a / gcd(a, b)) * b;
}

/** Refuses a value that is not a rational with bigint fields and a positive denominator. */
export function checkQ(x: Q, what: string): void {
  if (typeof x.n !== "bigint" || typeof x.d !== "bigint" || x.d <= 0n) throw new RangeError(`${what}: not a rational with d > 0`);
}

/** True when 0 < x < 1, bounds excluded (x with a positive denominator). */
export function inOpenUnit(x: Q): boolean {
  return x.n > 0n && x.n < x.d;
}

/** n/d reduced, the sign on the numerator; refuses d = 0. */
export function q(n: bigint, d: bigint = 1n): Q {
  if (typeof n !== "bigint" || typeof d !== "bigint") throw new RangeError("q: numerator and denominator must be bigints");
  if (d === 0n) throw new RangeError("q: zero denominator");
  const g = gcd(n, d);
  const sign = d < 0n ? -1n : 1n;
  return { n: (sign * n) / g, d: (sign * d) / g };
}

export function qString(x: Q): string {
  checkQ(x, "qString");
  return x.d === 1n ? String(x.n) : `${String(x.n)}/${String(x.d)}`;
}

const INTEGER_TEXT = /^(0|-?[1-9][0-9]*)$/;
const FRACTION_TEXT = /^(-?[1-9][0-9]*)\/([1-9][0-9]*)$/;

/** Reads "0", "-?[1-9][0-9]*" or a reduced "n/d" with d >= 2; refuses any other text. */
export function qParse(text: string): Q {
  if (typeof text !== "string") throw new RangeError("qParse: not a text");
  if (INTEGER_TEXT.test(text)) return { n: BigInt(text), d: 1n };
  const m = FRACTION_TEXT.exec(text);
  const nText = m?.[1], dText = m?.[2];
  if (nText === undefined || dText === undefined) throw new RangeError(`qParse: ${JSON.stringify(text)} is not a rational text`);
  const n = BigInt(nText), d = BigInt(dText);
  if (d < 2n || gcd(n, d) !== 1n) throw new RangeError(`qParse: ${JSON.stringify(text)} is not reduced`);
  return { n, d };
}

export function add(x: Q, y: Q): Q {
  checkQ(x, "add");
  checkQ(y, "add");
  return q(x.n * y.d + y.n * x.d, x.d * y.d);
}

export function sub(x: Q, y: Q): Q {
  checkQ(x, "sub");
  checkQ(y, "sub");
  return q(x.n * y.d - y.n * x.d, x.d * y.d);
}

export function mul(x: Q, y: Q): Q {
  checkQ(x, "mul");
  checkQ(y, "mul");
  return q(x.n * y.n, x.d * y.d);
}

/** x^k for a safe integer k >= 0; x^0 = 1, x = 0 included. */
export function pow(x: Q, k: number): Q {
  checkQ(x, "pow");
  if (!Number.isSafeInteger(k) || k < 0) throw new RangeError(`pow: exponent ${String(k)} is not a safe integer >= 0`);
  const e = BigInt(k);
  return q(x.n ** e, x.d ** e);
}

/** The sign of x - y. */
export function cmp(x: Q, y: Q): -1 | 0 | 1 {
  checkQ(x, "cmp");
  checkQ(y, "cmp");
  const left = x.n * y.d, right = y.n * x.d;
  return left < right ? -1 : left > right ? 1 : 0;
}

/** floor(x * scale), rounded toward minus infinity; refuses scale < 1. */
export function floorScaled(x: Q, scale: bigint): bigint {
  checkQ(x, "floorScaled");
  if (typeof scale !== "bigint" || scale < 1n) throw new RangeError("floorScaled: scale must be a bigint >= 1");
  const product = x.n * scale;
  const truncated = product / x.d;
  return product % x.d !== 0n && product < 0n ? truncated - 1n : truncated;
}
