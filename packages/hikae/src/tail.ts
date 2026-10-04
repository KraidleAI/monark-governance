/**
 * W2-E engine: the tail indicator and the exact adjacency upper tail of ADR 0006 v8.1 D2 (wave 2, Design 1), from the scores, from
 * the bits, or from the counts alone (addendum 8 §1: the import guard recomputes the tails from a row's counts).
 *
 * Written by MONARK under the zone exception of Q-F3 (addendum 8, P0 line `ec202d00` of KraidleAI/monark-precommitments); the
 * W2-E tests and killers stay with RECHERCHES. Counts entry: piece `coordination/pieces/2026-10-04-tail-ts-entree-comptes/` of
 * the recherches repository (SPEC-tail-ts.md sha256 af5f5b19…, vectors.json sha256 4c7b8fb2…).
 *
 * Pure: no clock, no file, no floating point in a decision. Exact integers (bigint); a tail is never reduced, so a guard that
 * compares a row's strings to these byte for byte refuses a reduced tail. `runs.ts` is unchanged.
 */
import { parseUnitDecimal } from "./binomial.ts";
import type { Ratio } from "./binomial.ts";

/** One exceedance indicator: 1 iff the score is strictly above tau. */
export type TailBit = 0 | 1;

/** Codes of the named refusals of the counts entry (closed list). */
export type TailCountsErrorCode =
  | "level-not-unit-decimal"
  | "tail-frac-not-unit-decimal"
  | "count-not-integer"
  | "n-zero"
  | "m-above-n"
  | "a-outside-support";

/** The one error class of the counts entry. Extends RangeError, as the engine's other refusals. */
export class TailCountsError extends RangeError {
  readonly code: TailCountsErrorCode;
  constructor(code: TailCountsErrorCode, message: string) {
    super(message);
    this.name = "TailCountsError";
    this.code = code;
  }
}

/** Result of the counts entry: `empty` iff m = 0 (D2), otherwise the unreduced tail and its decision. */
export type AdjacencyCountsTail =
  | { readonly empty: true }
  | {
      readonly empty: false;
      /** Arrangements of m ones among n with A >= a, as a decimal string of an integer, unreduced. */
      readonly num: string;
      /** All arrangements, C(n, m), as a decimal string of an integer >= 1. */
      readonly den: string;
      /** num / den <= level: the check rejects (comparator of runs.ts:77). */
      readonly reject: boolean;
    };

/** Result of the tail indicator: the rank r, tau (the r-th smallest score), the bits b_t = 1{s_t > tau} and m their sum. */
export interface TailExceedance {
  readonly empty: boolean;
  readonly r: number;
  readonly tau: number;
  readonly m: number;
  readonly bits: readonly TailBit[];
}

/** Result of the adjacency upper tail on bits: `empty` iff m = 0; otherwise A, m and the exact tail P(A >= a_obs | n, m). */
export type AdjacencyTail =
  | { readonly empty: true; readonly a: number; readonly ones: number }
  | {
      readonly empty: false;
      readonly a: number;
      readonly ones: number;
      readonly tailNum: bigint;
      readonly tailDen: bigint;
      readonly reject: boolean;
    };

function unitOr(dec: string, code: TailCountsErrorCode): Ratio {
  try {
    return parseUnitDecimal(dec);
  } catch {
    throw new TailCountsError(code, `not a plain decimal in (0, 1): "${dec}"`);
  }
}

function count(name: string, x: number): bigint {
  if (!Number.isSafeInteger(x) || x < 0) throw new TailCountsError("count-not-integer", `${name} is not a safe integer >= 0: ${String(x)}`);
  return BigInt(x);
}

/** C(n, k) in exact integers, 0 outside 0..n; each partial product is itself a binomial, so every division is exact. */
function choose(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let c = 1n;
  for (let i = 0; i < kk; i++) c = (c * BigInt(n - i)) / BigInt(i + 1);
  return c;
}

/**
 * r = ceil(n x tail_frac) = (n x num + den - 1) div den, exact (D2). The one writing of this rank, shared by tailExceedance.
 * Its refusals are TailCountsError, a RangeError subclass: a guard that maps a RangeError to under_calib (D2) tests
 * `instanceof TailCountsError` first (G2 of #135, m-3).
 */
export function tailRank(n: number, tailFracDec: string): number {
  const frac = unitOr(tailFracDec, "tail-frac-not-unit-decimal");
  const nn = count("n", n);
  if (nn === 0n) throw new TailCountsError("n-zero", "n = 0");
  return Number((nn * frac.num + frac.den - 1n) / frac.den);
}

/**
 * Exact upper tail P(A >= a | n, m) of the adjacency statistic A = m - J (D2, exact null), from counts only:
 * num = sum over j = 1..m - a of C(m - 1, j - 1) C(n - m + 1, j), den = C(n, m), never reduced.
 * Checks, the first failing one throws: level; n, m, a safe integers >= 0 (in this order); n >= 1; m <= n; the support of A
 * (m = 0 needs a = 0; m >= 1 needs max(0, 2m - n - 1) <= a <= m - 1). m = 0 gives `empty`.
 * Cost: O(m) bigint products of numbers up to C(n, m); the caller bounds n before calling on imported counts (G2 of #135, m-2).
 */
export function adjacencyTailFromCounts(n: number, m: number, a: number, levelDec: string): AdjacencyCountsTail {
  const level = unitOr(levelDec, "level-not-unit-decimal");
  count("n", n);
  count("m", m);
  count("a", a);
  if (n === 0) throw new TailCountsError("n-zero", "n = 0");
  if (m > n) throw new TailCountsError("m-above-n", `m = ${String(m)} > n = ${String(n)}`);
  if (m === 0) {
    if (a !== 0) throw new TailCountsError("a-outside-support", `a = ${String(a)} with m = 0`);
    return { empty: true };
  }
  const low = Math.max(0, 2 * m - n - 1);
  if (a < low || a > m - 1) throw new TailCountsError("a-outside-support", `a = ${String(a)} outside ${String(low)}..${String(m - 1)}`);
  let num = 0n;
  let cA = 1n; // C(m - 1, j - 1)
  let cB = BigInt(n - m + 1); // C(n - m + 1, j)
  for (let j = 1; j <= m - a; j++) {
    if (j > 1) {
      cA = (cA * BigInt(m - j + 1)) / BigInt(j - 1);
      cB = (cB * BigInt(n - m + 2 - j)) / BigInt(j);
    }
    num += cA * cB;
  }
  const den = choose(n, m);
  return { empty: false, num: String(num), den: String(den), reject: num * level.den <= level.num * den };
}

/**
 * The tail indicator of D2: r = tailRank(n, tail_frac), tau = the r-th smallest score (comparator of l1-split.ts), b_t = 1 iff
 * s_t > tau (strict), m = the sum. Throws a RangeError on n = 0 or on any NaN or non-finite score (the policy guard maps it to
 * under_calib). `empty` iff m = 0.
 */
export function tailExceedance(scores: readonly number[], tailFracDec: string): TailExceedance {
  if (scores.length === 0) throw new RangeError("tailExceedance: no score");
  if (scores.some((s) => !Number.isFinite(s))) throw new RangeError("tailExceedance: a score is NaN or not finite");
  const r = tailRank(scores.length, tailFracDec);
  const sorted = [...scores].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
  const tau = sorted[r - 1];
  if (tau === undefined) throw new RangeError(`tailExceedance: rank ${String(r)} outside 1..${String(scores.length)}`);
  const bits = scores.map((s): TailBit => (s > tau ? 1 : 0));
  const m = bits.reduce<number>((acc, b) => acc + b, 0);
  return { empty: m === 0, r, tau, m, bits };
}

/**
 * The adjacency upper tail on bits: counts n, m and A = #{t : b_t = b_(t+1) = 1}, then the one arithmetic of the counts entry.
 * No bit (n = 0) throws n-zero and the level is checked before `empty`: stricter than D2 read literally, never reached since D2
 * runs only at n >= n0 (G2 of #135, m-1).
 */
export function adjacencyUpperTail(bits: readonly TailBit[], levelDec: string): AdjacencyTail {
  let ones = 0;
  let a = 0;
  for (let t = 0; t < bits.length; t++) {
    const b = bits[t];
    if (b !== 0 && b !== 1) throw new RangeError(`adjacencyUpperTail: bit ${String(t)} is not 0 or 1`);
    ones += b;
    if (b === 1 && bits[t + 1] === 1) a += 1;
  }
  const out = adjacencyTailFromCounts(bits.length, ones, a, levelDec);
  if (out.empty) return { empty: true, a, ones };
  return { empty: false, a, ones, tailNum: BigInt(out.num), tailDen: BigInt(out.den), reject: out.reject };
}
