/**
 * HIKAE betting library: the public surface of packages/hikae/src/pari/.
 *
 * Re-exports, by name, the three types Q, BetSide and Mixture and the eighteen functions of the library: exact rationals, the betting
 * factor, the capital of a fixed mixture from the counts and its crossing table, the fixed-point change reading and closing detector,
 * and the integer threshold test. No other value leaves the folder.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
export type { BetSide } from "./bet.ts";
export type { Mixture } from "./mixture.ts";
export type { Q } from "./rational.ts";
export { betFactor } from "./bet.ts";
export { capitalOfCounts, crossingTable } from "./mixture.ts";
export { add, cmp, floorScaled, mul, pow, q, qParse, qString, sub } from "./rational.ts";
export { srIncrement, srStep, srValue } from "./sr.ts";
export { crosses } from "./threshold.ts";
export { weightedStep, weightedValue } from "./weighted.ts";
