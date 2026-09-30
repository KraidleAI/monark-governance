/**
 * HIKAE - dependence diagnostic for per-calibration rows (worksite 2 of the conformal alignment, lot L2-1r;
 * ADR draft 0004 v3 D6, KraidleAI/recherches decisions/0004).
 *
 * Exact one-sided Wald-Wolfowitz runs test on a time-ordered 0/1 sequence: R = the number of runs, and
 * P(R <= r_obs | the counts of ones and zeros) under the uniform law of the arrangements (i.i.d. or
 * exchangeable points), computed in big integers. A small tail reads as positive serial dependence of the
 * indicator. It is a test against that one alternative: passing it never establishes exchangeability.
 * Pure: no clock, no file, no floating point in a decision.
 */

/** A 0/1 sequence in time order. */
export type Bits = readonly (0 | 1)[];

/** Result of the runs test: `empty` when the sequence has no ones or no zeros (no law to test). */
export type RunsTail =
  | { readonly empty: true; readonly runs: number; readonly ones: number; readonly zeros: number }
  | {
      readonly empty: false;
      readonly runs: number;
      readonly ones: number;
      readonly zeros: number;
      /** Arrangements of the same counts with at most `runs` runs. */
      readonly tailNum: bigint;
      /** All arrangements of the same counts, C(ones + zeros, ones). */
      readonly tailDen: bigint;
      /** tailNum / tailDen <= level: the sequence is rejected (fails the diagnostic). */
      readonly reject: boolean;
    };

function checkBits(bits: Bits): void {
  for (const b of bits) if (b !== 0 && b !== 1) throw new RangeError("runs: every element must be 0 or 1");
}

/** Number of runs (maximal blocks of equal values); 0 for the empty sequence. */
export function runsCount(bits: Bits): number {
  checkBits(bits);
  let runs = bits.length === 0 ? 0 : 1;
  for (let i = 1; i < bits.length; i++) if (bits[i] !== bits[i - 1]) runs++;
  return runs;
}

/** Private minimal parse of a plain decimal in (0, 1), such as 0.05, to an integer ratio (to be merged with L2-1). */
function parseLevel(levelDec: string): { num: bigint; den: bigint } {
  if (!/^0[.][0-9]+$/.test(levelDec)) throw new RangeError("runs: level must be a plain decimal in (0, 1)");
  const digits = levelDec.slice(2);
  const num = BigInt(digits);
  if (num === 0n) throw new RangeError("runs: level must be a plain decimal in (0, 1)");
  return { num, den: 10n ** BigInt(digits.length) };
}

/** Row m of Pascal's triangle: C(m, 0) .. C(m, m). */
function binomRow(m: number): bigint[] {
  const row = [1n];
  let c = 1n;
  for (let j = 0; j < m; j++) {
    c = (c * BigInt(m - j)) / BigInt(j + 1);
    row.push(c);
  }
  return row;
}

/** Row entry, 0 outside 0..m. */
const at = (row: readonly bigint[], j: number): bigint => row[j] ?? 0n;

/**
 * Exact lower tail P(R <= r_obs | counts) and the decision tail <= levelDec. Arrangements with r runs:
 * r = 2k: 2 C(n1 - 1, k - 1) C(n0 - 1, k - 1); r = 2k + 1: C(n1 - 1, k) C(n0 - 1, k - 1) + C(n1 - 1, k - 1) C(n0 - 1, k).
 */
export function runsLowerTailLeq(bits: Bits, levelDec: string): RunsTail {
  const level = parseLevel(levelDec);
  const runs = runsCount(bits);
  const ones = bits.filter((b) => b === 1).length;
  const zeros = bits.length - ones;
  if (ones === 0 || zeros === 0) return { empty: true, runs, ones, zeros };
  const a = binomRow(ones - 1);
  const b = binomRow(zeros - 1);
  let tailNum = 0n;
  for (let r = 2; r <= runs; r++) {
    const k = Math.floor(r / 2);
    tailNum += r % 2 === 0 ? 2n * at(a, k - 1) * at(b, k - 1) : at(a, k) * at(b, k - 1) + at(a, k - 1) * at(b, k);
  }
  const tailDen = at(binomRow(ones + zeros), ones);
  return { empty: false, runs, ones, zeros, tailNum, tailDen, reject: tailNum * level.den <= level.num * tailDen };
}

/** Median exceedance 1{s > m}, m = the ceil(n/2)-th smallest score; ties at m count as 0. */
export function medianExceedance(scores: readonly number[]): (0 | 1)[] {
  if (scores.some((s) => Number.isNaN(s))) throw new RangeError("runs: a score is NaN");
  const sorted = [...scores].sort((x, y) => x - y);
  const m = sorted[Math.ceil(scores.length / 2) - 1];
  if (m === undefined) return [];
  return scores.map((s): 0 | 1 => (s > m ? 1 : 0));
}
