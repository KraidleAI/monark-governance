/**
 * HIKAE betting library: the threshold test of a capital or of a fixed-point reading.
 *
 * crosses(value, delta) is value * delta >= 1, decided on integers (value.n * delta.n >= value.d * delta.d, both denominators
 * positive), never in floating point; delta lies in (0, 1), bounds excluded, so the threshold 1/delta is above 1.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { checkQ, inOpenUnit, type Q } from "./rational.ts";

/** Refuses delta outside (0, 1), bounds excluded. */
export function checkDelta(delta: Q, what: string): void {
  checkQ(delta, `${what} delta`);
  if (!inOpenUnit(delta)) throw new RangeError(`${what}: delta outside (0, 1)`);
}

export function crosses(value: Q, delta: Q): boolean {
  checkQ(value, "crosses value");
  checkDelta(delta, "crosses");
  return value.n * delta.n >= value.d * delta.d;
}
