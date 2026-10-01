/**
 * HIKAE runs diagnostic - oracle tests (worksite 2, lots L2-1r and L2-1r2; ADR draft 0004 v3.1 D6, KraidleAI/recherches decisions/0004).
 * Every expected value is computed in this file, never read back from runs.ts:
 *   - enumeration of every 0/1 sequence of length 1 to 16 (runs counted from the bit transitions of an integer);
 *   - [G0] M-20: exact one-sided thresholds at level 0.05 (largest r with P(R <= r | counts) <= 0.05);
 *   - [SE] Swed and Eisenhart 1943, Table I (lower critical values of the runs test at 0.025, as commonly
 *     reproduced; recomputed by the planner with exact rationals before being pinned here);
 *   - the balanced threshold as a counting definition (the achievable count of ones closest to n/2, ties toward
 *     more ones, then the distinct value that yields it), exhaustive on small multisets; the G2 cases of D6.
 * Each test names one killer. Pure: no clock, no file, seeds committed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calibDigest } from "@monark/contracts";
import { runsCount, runsLowerTailLeq } from "../src/runs.ts";
import type { Balanced, Bits, RunsTail } from "../src/runs.ts";
import * as runsModule from "../src/runs.ts";
import * as hikae from "../src/index.ts";
import { LIQ_S0, USDE } from "./served-scores.ts";

/** Bits of x, lowest bit first. */
const bitsOf = (x: number, len: number): (0 | 1)[] => Array.from({ length: len }, (_, i): 0 | 1 => ((x >> i) & 1 ? 1 : 0));

const popcount = (x: number): number => {
  let c = 0;
  for (let v = x; v > 0; v >>= 1) c += v & 1;
  return c;
};

/** A sequence with the given counts and exactly r runs; the more frequent symbol opens (it may need the extra run). */
function withRuns(ones: number, zeros: number, r: number): (0 | 1)[] {
  const first: 0 | 1 = zeros >= ones ? 0 : 1;
  const counts = { first: first === 0 ? zeros : ones, second: first === 0 ? ones : zeros };
  const blocks = { first: Math.ceil(r / 2), second: Math.floor(r / 2) };
  assert.ok(blocks.first <= counts.first && blocks.second <= counts.second && blocks.second >= 1, "helper: runs out of reach");
  const out: (0 | 1)[] = [];
  for (let i = 0; i < r; i++) {
    const isFirst = i % 2 === 0;
    const sym: 0 | 1 = isFirst ? first : first === 0 ? 1 : 0;
    const idx = Math.floor(i / 2);
    const nb = isFirst ? blocks.first : blocks.second;
    const total = isFirst ? counts.first : counts.second;
    const size = idx === nb - 1 ? total - (nb - 1) : 1;
    for (let j = 0; j < size; j++) out.push(sym);
  }
  return out;
}

const tailOf = (r: RunsTail): { num: bigint; den: bigint } => {
  assert.equal(r.empty, false);
  if (r.empty) throw new Error("unreachable");
  return { num: r.tailNum, den: r.tailDen };
};

/** A sequence passes only with a computed tail above the level; `empty` is never a pass here (ADR D6: the guard of L2-3 accepts an empty miss sequence at k_obs = 0 and fails closed on an empty auxiliary one). */
const passes = (r: RunsTail): boolean => r.empty === false && r.reject === false;

// Enumeration oracle (every arrangement of length 1 to 16), plus [G0] M-20 and [SE] thresholds, plus monotonicity.
// killer: packages/hikae/src/runs.ts:72 ROR "r <= runs" -> "r < runs"
test("runs_lower_tail_exact_against_enumeration", () => {
  for (let len = 1; len <= 16; len++) {
    const hist = Array.from({ length: len + 1 }, () => new Array<number>(len + 2).fill(0));
    const rep = Array.from({ length: len + 1 }, () => new Array<number>(len + 2).fill(-1));
    const inner = (1 << (len - 1)) - 1;
    for (let x = 0; x < 1 << len; x++) {
      const ones = popcount(x);
      const runs = 1 + popcount((x ^ (x >> 1)) & inner);
      const row = hist[ones];
      const rrow = rep[ones];
      if (row === undefined || rrow === undefined) throw new Error("hist");
      row[runs] = (row[runs] ?? 0) + 1;
      if (rrow[runs] === -1) rrow[runs] = x;
    }
    for (let ones = 1; ones < len; ones++) {
      const row = hist[ones] ?? [];
      const total = row.reduce((s, v) => s + v, 0);
      let cum = 0;
      for (let r = 1; r <= len; r++) {
        cum += row[r] ?? 0;
        const x = rep[ones]?.[r] ?? -1;
        if (x === -1) continue;
        const bits = bitsOf(x, len);
        assert.equal(runsCount(bits), r);
        const res = runsLowerTailLeq(bits, "0.05");
        assert.deepEqual(tailOf(res), { num: BigInt(cum), den: BigInt(total) }, `len ${len} ones ${ones} r ${r}`);
        assert.equal(res.empty === false && res.reject, 100 * cum <= 5 * total);
      }
    }
  }
  // [G0] M-20 at level 0.05: n, ones, threshold (rejected at the threshold, kept one run above).
  const m20: [number, number, number][] = [[299, 21, 35], [613, 48, 82], [1000, 84, 146], [299, 149, 135], [613, 306, 286]];
  // [SE] Table I at 0.025: ones, zeros, lower critical value.
  const se: [number, number, number][] = [[5, 5, 2], [10, 10, 6], [12, 12, 7], [15, 15, 10], [20, 20, 14], [2, 20, 2], [5, 10, 3], [8, 12, 6]];
  const cases = [...m20.map(([n, o, t]) => [o, n - o, t, "0.05"] as const), ...se.map(([o, z, t]) => [o, z, t, "0.025"] as const)];
  for (const [o, z, t, level] of cases) {
    assert.equal(passes(runsLowerTailLeq(withRuns(o, z, t), level)), false, `${o}/${z} at ${t}`);
    assert.equal(passes(runsLowerTailLeq(withRuns(o, z, t + 1), level)), true, `${o}/${z} at ${t + 1}`);
  }
  // Monotone in the observed runs; the tail reaches 1 at the largest reachable count (613 points, 306 ones).
  let prev = { num: 0n, den: 1n };
  for (let r = 2; r <= 613; r++) {
    const cur = tailOf(runsLowerTailLeq(withRuns(306, 307, r), "0.05"));
    assert.ok(cur.num * prev.den >= prev.num * cur.den, `monotone at ${r}`);
    prev = cur;
  }
  assert.equal(prev.num, prev.den);
});

/** The function under test, read from the module at call time, so that a base without it fails on an assertion, not on a load. */
const balanced = (values: readonly number[]): Balanced => {
  assert.equal(typeof runsModule.balancedExceedance, "function", "runs.ts exports balancedExceedance");
  return runsModule.balancedExceedance(values);
};

/** Counting oracle of ADR D6: the achievable counts of ones (> 0), the one closest to n/2 (ties toward more ones), then its value. */
function balancedOracle(xs: readonly number[]): { threshold: number; ones: number } | undefined {
  const distinct = xs.filter((v, i) => xs.indexOf(v) === i);
  const above = (t: number): number => xs.filter((v) => v > t).length;
  const counts = distinct.map(above).filter((c) => c > 0);
  if (counts.length === 0) return undefined;
  const dist = (c: number): number => Math.abs(2 * c - xs.length);
  const closest = Math.min(...counts.map(dist));
  const ones = Math.max(...counts.filter((c) => dist(c) === closest));
  const threshold = distinct.find((t) => above(t) === ones);
  if (threshold === undefined) throw new Error("oracle");
  return { threshold, ones };
}

/** Seeded LCG (committed seed) and a Fisher-Yates shuffle driven by it. */
function lcg(seed0: number): () => number {
  let seed = seed0;
  return () => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return seed >>> 16;
  };
}
function shuffled<T>(xs: readonly T[], next: () => number): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) throw new Error("shuffle");
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/** The result agrees with the counting oracle (`empty` iff the oracle finds no count) and its bits are 1{v > threshold} position by position. */
function assertBalanced(xs: readonly number[], label: string): { threshold: number; ones: number } | undefined {
  const want = balancedOracle(xs);
  const got = balanced(xs);
  if (want === undefined) {
    assert.deepEqual(got, { empty: true }, label);
    return undefined;
  }
  assert.equal(got.empty, false, label);
  if (got.empty) throw new Error("unreachable");
  assert.equal(got.threshold, want.threshold, label);
  assert.deepEqual(got.bits, xs.map((v) => (v > want.threshold ? 1 : 0)), label);
  assert.equal(got.bits.filter((b) => b === 1).length, want.ones, label);
  return want;
}

// Empty sequences (no ones or no zeros) are reported as empty, with no tail and no decision; the module never reads them as a pass.
// killer: packages/hikae/src/runs.ts:104 CONST "empty: true" -> "empty: false"
test("runs_empty_and_fail_closed", () => {
  const empties: Bits[] = [[], [0], [1], [0, 0, 0, 0], [1, 1, 1], new Array<0 | 1>(170).fill(0)];
  for (const bits of empties) {
    const res = runsLowerTailLeq(bits, "0.05");
    assert.equal(res.empty, true);
    assert.equal("reject" in res, false);
    assert.equal(passes(res), false);
    assert.equal(res.runs, bits.length === 0 ? 0 : 1);
  }
  // Balanced indicator of a constant sequence (all tied, any n >= 1) or of no value: `empty`, no threshold, no bits, never a pass.
  for (const values of [[], [2], [7, 7, 7, 7], [-0, 0, 0], new Array<number>(299).fill(0), new Array<number>(170).fill(1)]) {
    assert.deepEqual(balanced(values), { empty: true }, `${values.length} values`);
  }
  // Two alternating symbols are the most runs possible: a pass at any level below 1.
  assert.equal(passes(runsLowerTailLeq([0, 1, 0, 1, 0, 1], "0.99")), true);
});

// Balanced threshold (ADR D6, [AC2] R-1): against the counting oracle, a function of the multiset, empty iff constant.
// killer: packages/hikae/src/runs.ts:102 ROR "ones > best.ones" -> "ones < best.ones"
test("runs_balanced_threshold_multiset", () => {
  // Hand cases: n even; n odd with two counts equally close to n/2 (ties toward more ones); a top half tied (a median indicator is empty there).
  assert.deepEqual(balanced([3, 1, 2, 4]), { empty: false, threshold: 2, bits: [1, 0, 0, 1] });
  assert.deepEqual(balanced([5, 1, 3]), { empty: false, threshold: 1, bits: [1, 0, 1] });
  assert.deepEqual(balanced([2, 2, 2, 1, 3]), { empty: false, threshold: 1, bits: [1, 1, 1, 0, 1] });
  assert.deepEqual(balanced([0, 5, 5, 5]), { empty: false, threshold: 0, bits: [0, 1, 1, 1] });
  assert.deepEqual(balanced([Infinity, 0, -Infinity]), { empty: false, threshold: -Infinity, bits: [1, 1, 0] });
  // Every multiset of size 1 to 9 over three atoms (219 multisets), in a seeded order: empty iff constant, oracle agreement.
  const next = lcg(20260930);
  let multisets = 0;
  for (let k = 1; k <= 9; k++) {
    for (let a = 0; a <= k; a++) {
      for (let b = 0; a + b <= k; b++) {
        const c = k - a - b;
        const xs = shuffled([...new Array<number>(a).fill(-1.5), ...new Array<number>(b).fill(0), ...new Array<number>(c).fill(7)], next);
        const atoms = [a, b, c].filter((m) => m > 0).length;
        const res = balanced(xs);
        assert.equal(res.empty, atoms === 1, `${a}/${b}/${c}`);
        assertBalanced(xs, `${a}/${b}/${c}`);
        multisets++;
      }
    }
  }
  assert.equal(multisets, 219);
  // Seeded grid with heavy ties (values 0 to 4) and with near-distinct values, lengths 1 to 40: oracle agreement, and the same
  // threshold and the same bit per value on seeded permutations of the same values (a function of the multiset only).
  for (let len = 1; len <= 40; len++) {
    for (let rep = 0; rep < 25; rep++) {
      const xs = Array.from({ length: len }, () => (rep % 2 === 0 ? next() % 5 : (next() % 997) / 64));
      const want = assertBalanced(xs, xs.join(","));
      for (let p = 0; p < 3; p++) {
        const perm = shuffled(xs, next);
        assert.deepEqual(assertBalanced(perm, perm.join(",")), want);
      }
    }
  }
  // On a 0/1 sequence (every one of length 2 to 12) the indicator is the sequence itself, threshold 0, unless it is constant.
  for (let len = 2; len <= 12; len++) {
    for (let x = 0; x < 1 << len; x++) {
      const bits = bitsOf(x, len);
      const res = balanced(bits);
      const constant = x === 0 || x === (1 << len) - 1;
      assert.deepEqual(res, constant ? { empty: true } : { empty: false, threshold: 0, bits }, `${len} ${x}`);
    }
  }
  // A NaN is refused wherever it sits; infinities are values like any other.
  for (const bad of [[Number.NaN], [0, Number.NaN, 1], [1, 2, Number.NaN]]) assert.throws(() => balanced(bad), RangeError);
});

/** The counting median of v3 (the ceil(n/2)-th smallest value), computed here to show where the balanced threshold departs from it. */
const countingMedian = (xs: readonly number[]): number | undefined =>
  xs.find((v) => xs.filter((s) => s <= v).length >= Math.ceil(xs.length / 2) && xs.filter((s) => s < v).length < Math.ceil(xs.length / 2));

// The G2 cases of ADR D6 at n 299 as oracle cases, and the two served arrays.
// killer: packages/hikae/src/runs.ts:100 SDL "if (ones === 0) continue;" -> ""
test("runs_balanced_threshold_g2_cases", () => {
  const n = 299;
  const next = lcg(299);
  // Case 1: a 0/1 row with zero errors: the all-zero sequence has no threshold that leaves a one: `empty` (the guard of L2-3 refuses
  // it on check 2 and reports it on check 1); the all-one sequence likewise.
  assert.deepEqual(balanced(new Array<number>(n).fill(0)), { empty: true });
  assert.deepEqual(balanced(new Array<number>(n).fill(1)), { empty: true });
  // Case 2: a 0/1 sequence with 21 ones at seeded positions: the indicator is the sequence itself (threshold 0), 21 ones, computable.
  const seq = shuffled([...new Array<number>(21).fill(1), ...new Array<number>(n - 21).fill(0)], next);
  assert.deepEqual(balanced(seq), { empty: false, threshold: 0, bits: seq });
  const tail2 = runsLowerTailLeq(seq.map((v): 0 | 1 => (v === 1 ? 1 : 0)), "0.05");
  assert.equal(tail2.empty, false);
  assert.equal(tail2.ones, 21);
  // Case 3: 149 distinct values below a cap and 150 at the cap: the counting median is the cap (no value above it), the balanced
  // threshold is the cap's next lower distinct value, 150 ones, computable.
  const capped = shuffled([...Array.from({ length: 149 }, (_, i) => (i + 1) / 8), ...new Array<number>(150).fill(1000)], next);
  assert.equal(countingMedian(capped), 1000);
  const r3 = balanced(capped);
  assert.equal(r3.empty, false);
  if (r3.empty) throw new Error("unreachable");
  assert.equal(r3.threshold, 149 / 8);
  assert.deepEqual(r3.bits, capped.map((v) => (v === 1000 ? 1 : 0)));
  assert.equal(runsLowerTailLeq(r3.bits, "0.05").empty, false);
  assert.deepEqual(assertBalanced(capped, "case 3"), { threshold: 149 / 8, ones: 150 });
  // liq s0: 147 zeros of 170; threshold 0, 23 ones, equal to the counting median.
  assert.equal(calibDigest(LIQ_S0), "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334");
  assert.equal(LIQ_S0.length, 170);
  assert.deepEqual(assertBalanced(LIQ_S0, "liq s0"), { threshold: 0, ones: 23 });
  assert.equal(countingMedian(LIQ_S0), 0);
  // USDe: n 613 is odd, so 306 and 307 ones are equally close to n/2; the tie goes to more ones: threshold = the 306th smallest
  // value 1.242960625e-6, 307 ones, one below the counting median 1.2461032083333333e-6, which leaves 306 ones.
  assert.equal(calibDigest(USDE), "c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c");
  assert.equal(USDE.length, 613);
  assert.deepEqual(assertBalanced(USDE, "usde"), { threshold: 0.000001242960625, ones: 307 });
  assert.equal(countingMedian(USDE), 0.0000012461032083333333);
  assert.equal(USDE.filter((v) => v > 0.0000012461032083333333).length, 306);
  const usde = balanced(USDE);
  assert.equal(usde.empty === false && usde.bits.length, 613);
});

// Refusals: the level is a plain decimal in (0, 1); bits are 0 or 1; values are not NaN. The median exceedance of v3 is removed.
// killer: packages/hikae/src/binomial.ts:42 SDL "if (num === 0n)" -> ""
test("runs_refuses_bad_inputs", () => {
  for (const bad of ["0", "0.0", "0.000", "1", "1.0", "", "0.", ".05", "5e-2", "0.05 ", "-0.05", "0.1.0", "NaN"]) {
    assert.throws(() => runsLowerTailLeq([0, 1], bad), RangeError, JSON.stringify(bad));
  }
  const bits = withRuns(10, 10, 7);
  const a = runsLowerTailLeq(bits, "0.05");
  const b = runsLowerTailLeq(bits, "0.050");
  assert.deepEqual(a, b);
  // [SE] n1 = n2 = 10: P(R <= 7) = 4735/92378 = 0.05126 (exact, recomputed): kept at 0.0512, rejected at 0.0513.
  assert.equal(passes(runsLowerTailLeq(bits, "0.0512")), true);
  assert.equal(passes(runsLowerTailLeq(bits, "0.0513")), false);
  // A tail equal to the level is rejected (ADR D6: a tail at most runs_level fails): ones 1, zeros 3, 2 runs, tail 2/4.
  assert.deepEqual(runsLowerTailLeq([1, 0, 0, 0], "0.5"), { empty: false, runs: 2, ones: 1, zeros: 3, tailNum: 2n, tailDen: 4n, reject: true });
  assert.equal(passes(runsLowerTailLeq([1, 0, 0, 0], "0.4999")), true);
  // The package entry re-exports this module (consumers import it from there); the v3 median exceedance is gone from both.
  assert.deepEqual([hikae.runsCount, hikae.runsLowerTailLeq, hikae.balancedExceedance], [runsCount, runsLowerTailLeq, runsModule.balancedExceedance]);
  assert.equal("medianExceedance" in hikae, false);
  assert.equal("medianExceedance" in runsModule, false);
  assert.throws(() => runsCount([0, 2] as unknown as Bits), RangeError);
  assert.throws(() => runsLowerTailLeq([1, 0.5] as unknown as Bits, "0.05"), RangeError);
  assert.throws(() => balanced([1, Number.NaN]), RangeError);
});
