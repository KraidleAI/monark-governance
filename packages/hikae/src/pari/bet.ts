/**
 * HIKAE betting library: the betting factor on a variable x in {0, 1}.
 *
 *   - side "below" (the licence test K): 1 + lambda (a - x), lambda in (0, 1/(1 - a));
 *   - side "above" (the closure test W): 1 + lambda (x - a), lambda in (0, 1/a);
 *   - a in (0, 1); every bound is excluded, so each factor is positive and the two values at x = 0 and x = 1 straddle 1.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { add, checkQ, inOpenUnit, mul, q, sub, type Q } from "./rational.ts";

/** The side of a bet: "below" wins when x falls under a, "above" when x rises over it. */
export type BetSide = "below" | "above";

/** Refuses a side other than "below" or "above". */
export function checkSide(side: BetSide): void {
  if (side !== "below" && side !== "above") throw new RangeError(`betFactor: side ${String(side)} is neither below nor above`);
}

/** Refuses a label other than 0 or 1. */
export function checkBit(x: 0 | 1, what: string): void {
  if (x !== 0 && x !== 1) throw new RangeError(`${what}: label ${String(x)} is neither 0 nor 1`);
}

/** Refuses a outside (0, 1) and lambda outside the open interval of its side. */
export function checkBet(side: BetSide, lambda: Q, a: Q): void {
  checkSide(side);
  checkQ(lambda, "betFactor lambda");
  checkQ(a, "betFactor a");
  if (!inOpenUnit(a)) throw new RangeError("betFactor: a outside (0, 1)");
  // below: lambda (1 - a) < 1; above: lambda a < 1; on integers, both denominators positive.
  const span = side === "below" ? a.d - a.n : a.n;
  if (lambda.n <= 0n || lambda.n * span >= lambda.d * a.d) throw new RangeError(`betFactor: lambda outside the open interval of ${side}`);
}

export function betFactor(side: BetSide, lambda: Q, a: Q, x: 0 | 1): Q {
  checkBet(side, lambda, a);
  checkBit(x, "betFactor");
  const label = q(BigInt(x));
  return add(q(1n), mul(lambda, side === "below" ? sub(a, label) : sub(label, a)));
}
