/**
 * HIKAE runs diagnostic - oracle tests (worksite 2, lot L2-1r; ADR draft 0004 v3 D6, KraidleAI/recherches decisions/0004).
 * Every expected value is computed in this file, never read back from runs.ts:
 *   - enumeration of every 0/1 sequence of length 1 to 16 (runs counted from the bit transitions of an integer);
 *   - [G0] M-20: exact one-sided thresholds at level 0.05 (largest r with P(R <= r | counts) <= 0.05);
 *   - [SE] Swed and Eisenhart 1943, Table I (lower critical values of the runs test at 0.025, as commonly
 *     reproduced; recomputed by the planner with exact rationals before being pinned here);
 *   - the median as a counting definition (the value m with at least ceil(n/2) scores <= m and fewer below it).
 * New-module tests (red by import at base), each with one named killer. Pure: no clock, no file, seeds committed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { runsCount, runsLowerTailLeq, medianExceedance } from "../src/runs.ts";
import type { Bits, RunsTail } from "../src/runs.ts";
import * as hikae from "../src/index.ts";

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

/** A sequence passes only with a computed tail above the level; `empty` is never a pass here (ADR D6: the guard of L2-3 accepts an empty miss sequence at k_obs = 0 and fails closed on an empty median one). */
const passes = (r: RunsTail): boolean => r.empty === false && r.reject === false;

// Enumeration oracle (every arrangement of length 1 to 16), plus [G0] M-20 and [SE] thresholds, plus monotonicity.
// killer: packages/hikae/src/runs.ts:79 ROR "r <= runs" -> "r < runs"
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

// Empty sequences (no ones or no zeros) are reported as empty, with no tail and no decision; the module never reads them as a pass.
// killer: packages/hikae/src/runs.ts:75 CONST "empty: true, runs" -> "empty: false, runs"
test("runs_empty_and_fail_closed", () => {
  const empties: Bits[] = [[], [0], [1], [0, 0, 0, 0], [1, 1, 1], new Array<0 | 1>(170).fill(0)];
  for (const bits of empties) {
    const res = runsLowerTailLeq(bits, "0.05");
    assert.equal(res.empty, true);
    assert.equal("reject" in res, false);
    assert.equal(passes(res), false);
    assert.equal(res.runs, bits.length === 0 ? 0 : 1);
  }
  // Median indicator with no ones: every score at or below the median (all tied, or the top half tied at it).
  for (const scores of [[7, 7, 7, 7], [0, 5, 5, 5], [2]]) {
    const ind = medianExceedance(scores);
    assert.deepEqual(ind, scores.map(() => 0));
    assert.equal(passes(runsLowerTailLeq(ind, "0.05")), false);
  }
  // Two alternating symbols are the most runs possible: a pass at any level below 1.
  assert.equal(passes(runsLowerTailLeq([0, 1, 0, 1, 0, 1], "0.99")), true);
});

// Median exceedance against a counting definition of the ceil(n/2)-th smallest score; ties at the median count as 0.
// killer: packages/hikae/src/runs.ts:93 ROR "s > m" -> "s >= m"
test("runs_median_exceedance_with_ties", () => {
  const oracle = (xs: number[]): (0 | 1)[] => {
    const h = Math.ceil(xs.length / 2);
    const m = xs.find((v) => xs.filter((s) => s <= v).length >= h && xs.filter((s) => s < v).length < h);
    return xs.map((s): 0 | 1 => (m !== undefined && s > m ? 1 : 0));
  };
  assert.deepEqual(medianExceedance([3, 1, 2, 4]), [1, 0, 0, 1]);
  assert.deepEqual(medianExceedance([5, 1, 3]), [1, 0, 0]);
  assert.deepEqual(medianExceedance([2, 2, 2, 1, 3]), [0, 0, 0, 0, 1]);
  assert.deepEqual(medianExceedance([]), []);
  // 129 zeros then 100 distinct values: the median (115th smallest of 229) is 0, so the zeros count 0.
  const block = [...new Array<number>(129).fill(0), ...Array.from({ length: 100 }, (_, i) => (i + 1) / 1000)];
  const ind = medianExceedance(block);
  assert.deepEqual(ind, [...new Array<0 | 1>(129).fill(0), ...new Array<0 | 1>(100).fill(1)]);
  const res = runsLowerTailLeq(ind, "0.05");
  assert.equal(res.runs, 2);
  assert.equal(passes(res), false);
  // Seeded grid with heavy ties (values in 0..4), lengths 1 to 40.
  let seed = 20260930;
  const next = (): number => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return seed >>> 16;
  };
  for (let len = 1; len <= 40; len++) {
    for (let rep = 0; rep < 25; rep++) {
      const xs = Array.from({ length: len }, () => next() % 5);
      assert.deepEqual(medianExceedance(xs), oracle(xs), xs.join(","));
    }
  }
});

// Refusals: the level is a plain decimal in (0, 1); bits are 0 or 1; scores are numbers.
// killer: packages/hikae/src/runs.ts:48 SDL "if (num === 0n)" -> ""
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
  // The package entry re-exports this module (consumers import it from there).
  assert.deepEqual([hikae.runsCount, hikae.runsLowerTailLeq, hikae.medianExceedance], [runsCount, runsLowerTailLeq, medianExceedance]);
  assert.throws(() => runsCount([0, 2] as unknown as Bits), RangeError);
  assert.throws(() => runsLowerTailLeq([1, 0.5] as unknown as Bits, "0.05"), RangeError);
  assert.throws(() => medianExceedance([1, Number.NaN]), RangeError);
});
