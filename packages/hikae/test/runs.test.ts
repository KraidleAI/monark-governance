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
// killer: packages/hikae/src/runs.ts:111 CONST "empty: true" -> "empty: false"
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
// killer: packages/hikae/src/runs.ts:109 ROR "ones > best.ones" -> "ones < best.ones"
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

// Served arrays re-typed from apps/harness/src/calibration.ts (same order): liq s0 (trunk 66ff241 l.215-237, n 170, pinned
// digest e7e67366...) and USDe (main 8968695 l.77-155, n 613, pinned digest c9793b28...); checked below by calibDigest (C5).
const LIQ_S0: readonly number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1300, 1473, 4611, 13095, 14116, 25411, 78310, 81471, 227602, 275562, 412656, 498122, 543541, 626379, 902102, 1311940, 2541308, 3256830, 3268155, 3560986, 4338176, 2090575766, 126184298996,
];
const USDE: readonly number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.3611625e-7, 0.000002605055375,
  0.000002741171625, 0, 0, 6.316458333333334e-9, 4.723758333333333e-8, 5.3554041666666665e-8, 0, 0, 1.6539625e-8, 1.6539625e-8, 0, 0, 0, 0, 0, 0, 0, 3.737279166666667e-8, 3.737279166666667e-8, 0, 0, 0, 4.76025e-9, 4.76025e-9, 0,
  6.422416666666667e-9, 6.422416666666667e-9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7.494679166666666e-8, 7.494679166666666e-8, 0, 0, 0, 0, 0,
  0, 0, 4.645958333333334e-9, 7.067429166666666e-8, 7.204420833333333e-8, 3.276041666666667e-9, 0, 0, 0.000128453830875, 0.000128453830875, 0, 0.0000054689728750000005, 0.0000054689728750000005, 0, 0, 0, 1.8275416666666665e-9, 0.000008797185083333334, 0.000008799012625, 0.000340093727625, 0.00012923128666666667, 0.00020462151983333333, 0.000006240921125, 0, 0.000018571449833333335,
  0.000018571449833333335, 0, 0.00003633680870833334, 0.00003633504529166667, 1.7634166666666666e-9, 0.00004945443833333333, 0.00000550185966666667, 0.000167181801625, 0.00014214866920833332, 0.000060128976791666667, 0.000095674418625, 0.00008722686212499999, 0.0002008302741666667, 0.0001854743116666667, 0.00008950278491666665, 0.00003597956183333333, 0.00007254426720833333, 5.362499999917738e-11, 0.000009087309958333334, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 8.662083333333333e-10, 8.662083333333333e-10, 0, 0, 0.0000016364741250000002, 0.0000016364741250000002, 3.1341666666666664e-10, 3.1341666666666664e-10, 0, 0, 1.3167083333333332e-9, 1.3167083333333332e-9, 4.2658333333333333e-10, 1.3504916666666667e-8, 1.39315e-8, 0, 2.0636666666666665e-9, 2.0636666666666665e-9, 0.0000053562109166666665, 0.0000053562109166666665, 0,
  0, 0, 0, 2.2485e-9, 3.412870833333333e-8, 3.6377208333333335e-8, 0, 5.816979583333333e-7, 8.975051666666669e-7, 0.0000012099457916666668, 1.5133008333333335e-7, 1.1376516666666666e-7, 4.1620833333333335e-9, 0.000005328532833333334, 0.000005328532833333334, 0.00004872369333333334, 0.00004872369333333334, 0.000027463403916666665, 0.000025258461, 0.00000219328675, 1.1424875e-8, 0.0000014654506666666666, 2.3021749999999988e-7, 0.0000012331529583333334, 0.000002179361708333333,
  9.901264583333332e-7, 0.0002870628725, 0.000029970808958333344, 0.00005974121820833334, 0.000036029338208333345, 0.0000056834080833333535, 0.00011543856100000001, 0.000012722788291666675, 0.00020055588341666666, 0.0001515488218333333, 0.000163754153125, 0.000012373806166666666, 0.000012373806166666666, 0, 0.0000030706339583333333, 0.000003187809125, 0.000006217448166666667, 4.099491666666667e-8, 6.041354166666667e-8, 0.00022439393104166667, 0.00005595735049999998, 0.00002463607716666665, 0.00008682235370833334, 0.00011676078966666666, 0.00011094434941666666,
  0.00017469158958333334, 0.000154999399125, 0.000006786759416666666, 0.000017098522208333333, 0.00000262045, 0.000003924990791666666, 0.00000597069, 5.45557375e-7, 0.000007364147083333333, 0.00013399466083333333, 0.000006909630333333338, 0.00011962059362500001, 0.000030033571916666662, 0.000004805507750000003, 0.00019304921779166663, 0.000017828092416666692, 0.000010190453208333366, 0.00015627030200000006, 0.00004889575404166667, 0.00007418548249999999, 0.00007848064804166666, 0.00019112023670833335, 0.000007227639833333292, 0.00007873965341666667, 0.00021371364545833333,
  0.0000012461032083333333, 0.0000015098611666666667, 3.708433333333333e-8, 0, 0.000055273274500000005, 0.000039875652875, 0.00004664035583333334, 0.00015541863987499999, 0.00015501056004166666, 0.00004600343091666666, 0.00017546756137499999, 0.00007217168754166666, 0.00006396377504166667, 0.000015116000666666662, 0.00006304687716666666, 0.0001176099945, 0.00017063498370833332, 0.00015410351658333332, 0.000016826703541666668, 0.00009801528991666666, 0.00005231288591666667, 0.00011746979787499999, 0.000032601043458333335, 5.646532083333335e-7, 8.219877083333334e-7,
  0.000015499077375, 0.00029458241979166664, 0.00028945972425, 0.0002899851615, 0.00024361162641666666, 0.00006841485766666666, 0.000025302283708333335, 0.000013881664125000002, 0.000011329623374999999, 0.00036059304075, 0.0003606594035833333, 2.4633375e-8, 6.8384999999999995e-9, 6.8384999999999995e-9, 0, 0, 0, 4.481437083333333e-7, 4.481437083333333e-7, 2.4465e-8, 0.000013174358083333333, 0.000013198823083333333, 0, 0, 0.000016129473208333335,
  0.000016129473208333335, 0, 5.122854166666667e-8, 3.6957041666666666e-8, 1.2076500000000002e-8, 2.195e-9, 0, 7.294504166666666e-8, 0.0000013359671666666667, 0.0000010281425833333332, 0.0000010332748333333333, 0.0000014140444583333334, 9.604889166666668e-7, 8.899920416666668e-7, 7.0496875e-8, 0.0000037316165, 0.0000037316165, 0, 3.734083333333334e-9, 3.734083333333334e-9, 5.861375e-9, 5.861375e-9, 0, 2.1861250000000002e-9, 2.1861250000000002e-9,
  0.000007541973791666666, 0.0000069571489166666664, 5.084330416666667e-7, 0.000002048882208333333, 0.000002041632458333333, 8.364158333333334e-8, 0, 5.7043541666666665e-8, 7.46845833333333e-9, 1.4599416666666669e-8, 3.350295833333333e-7, 3.7000525e-7, 0.000002174200083333333, 2.7314937499999983e-7, 0.000002874225458333333, 0.000004691328125, 0.000002255307958333333, 0.000009525304750000001, 0.000007802882375000002, 0.000003991255333333333, 0.0000053605891666666664, 0.00000542944925, 1.0472083333333333e-9, 2.6101666666666666e-9, 0.00000803006075,
  0.000003996891833333333, 0.000022724047666666663, 0.00001856040720833333, 0.0000045482684166666665, 0.00007827642020833333, 0.00002804381458333333, 0.000061709743, 0.00006222248020833333, 0.000003109151458333336, 0.00005191717308333333, 0.000118167653875, 0.00008764229341666668, 0.00004722142470833335, 0.00009144014408333334, 0.00001972958929166666, 0.000051387377375000004, 0.00006900967908333334, 0.00004762752666666667, 0.00008252537791666666, 0.000159157174125, 7.561568333333334e-7, 0.000002052720041666667, 0.000024598879625, 0.000026544895791666666, 1.426215e-7,
  0.000018513684333333335, 0.000018513827833333334, 0.000029714768791666664, 0.0002178929369166667, 8.387582083333248e-7, 0.00023724612770833337, 0.000009522819791666666, 0, 0.000016759489458333334, 0.000014959563458333333, 0.000001799926, 0.000008163317416666666, 0.000008163317416666666, 0, 4.570041666666667e-9, 6.503575000000001e-8, 0.0000016877758749999998, 0.000364132978125, 0.00032091496133333336, 0.000018886919041666668, 0.000025943705291666665, 1.44774125e-7, 7.0833125e-8, 6.259620833333334e-8, 0.000010675450125,
  0.000248699844375, 0.00015137805562499997, 0.00004794271366666664, 0.00015593845724999999, 0.00013119228083333334, 0.00007474919183333333, 0.00003626221766666667, 0.000029979830958333326, 0.00017109924883333336, 0.00022126965579166667, 0.00028355644600000003, 0.00006515115970833334, 0.00006341821195833334, 0.000044587513666666675, 0.00003210016254166667, 3.0505391666666666e-7, 0.00013403354587500002, 0.00005032028450000001, 0.00018515161899999996, 7.688076666666774e-7, 0.00026088282154166666, 0.000008864948875, 1.0369162499999998e-7, 0.000029590534458333336, 0.000029612292125000002,
  8.800783333333333e-8, 1.0706116666666668e-7, 7.09154166666667e-8, 1.4981287500000007e-7, 0.00031816682, 0.000301297504375, 0.000015457650583333335, 0.000031338349375, 0.00018517034454166667, 0.00018475647058333335, 0.0000013909992916666668, 0.00010113666158333334, 0.00007753718283333334, 0.0000047921138333333345, 0.0003753793238333333, 0.000004952441999999999, 5.078636250000001e-7, 0.000039943159625, 0.0000017170569583333312, 0.00004802882508333333, 0.00006441105220833332, 0.000144683099375, 0.00020234453824999996, 0.000058285948791666695, 0.0000380415209583333,
  0.000024592724791666637, 0.00020324558062500002, 0.00010398679366666665, 0.00017449429758333335, 0.00007126298150000003, 0.00018097332937500003, 0.00019430428895833338, 0.0003245079280833334, 0.00005759141379166666, 0.0000026921317499999994, 0.000004438182708333337, 0.00019176354629166665, 0.000035203671041666686, 0.00009832581508333334, 0.0001205031665, 0.00012953489862499998, 0.0000782648465, 0.00014619807162499998, 0.000052185745999999997, 0.00010700848495833334, 0.00010703552970833334, 4.446675e-8, 0, 0.000008311577791666666, 0.000008311577791666666,
  5.346558333333333e-8, 5.349245833333333e-8, 0.00006299938820833333, 0.00006150248491666666, 0.0000014964711250000002, 4.3216666666666667e-10, 1.2177404166666668e-7, 1.2177404166666668e-7, 1.8933658333333334e-7, 2.7809875000000005e-8, 2.1714645833333335e-7, 2.4079166666666665e-10, 0.00000990031225, 0.000009686942708333334, 5.29355875e-7, 7.028540416666667e-7, 2.2066962500000002e-7, 1.6765258333333335e-7, 5.305491666666666e-8, 3.302109166666667e-7, 0.000007749898041666667, 0.000007942874166666667, 4.45995e-8, 9.375049999999999e-8, 1.0139875e-8,
  5.943198750000001e-7, 0.0000042943876666666665, 0.000004707334208333333, 0.0000033177274166666665, 0.0000034773363333333334, 0.00013806567266666666, 0.00013789431475, 9.307987500000003e-8, 0.000004055972833333333, 0.0000038930836666666665, 5.8644375e-7, 8.075446666666666e-7, 5.200304166666665e-8, 4.9816e-8, 0.0000040175936666666666, 0.00002008082858333333, 0.000020017425375, 0.000002016864, 0.00041253532387499996, 0.0000030899674583333333, 1.6100529166666665e-7, 2.6600549999999997e-7, 2.9287074999999997e-7, 0.000017566425291666668, 0.000009881877541666668,
  0.0000020459612499999994, 0.000009470572458333333, 3.9407658333333334e-7, 4.732191666666667e-8, 5.122968333333334e-7, 4.806329583333334e-7, 3.1247e-8, 0.000004179253583333333, 0.0000042269923749999995, 3.9127291666666665e-8, 0.0000018896277916666666, 0.0000018895889166666665, 6.17768125e-7, 6.901540416666665e-7, 0.0000010989994999999999, 2.4808883333333335e-7, 7.007175e-8, 5.061465416666667e-7, 1.155708333333339e-9, 7.188958333333384e-9, 0.00000179221325, 0.0000019984341250000002, 7.219979166666671e-8, 6.510891666666667e-8, 1.943485416666667e-7,
  1.422350416666667e-7, 5.0028375e-7, 6.801635416666667e-7, 6.041442500000001e-7, 0.00000381493325, 0.000004291506125, 1.80166625e-7, 0.00000412807525, 0.0000027285622916666667, 0.00002440776620833333, 0.000025759200333333332, 0.000010228132833333333, 0.0000027816487083333336, 0.000006272337958333334, 0.0000018123015, 0.000013702457208333334, 0.000016475430625, 1.3357249999999996e-7, 3.7878529166666664e-7, 4.58770375e-7, 8.624241666666674e-8, 0.0000022007095833333334, 0.0000024791449166666666, 1.6884733333333335e-7, 2.2403912499999994e-7,
  4.1425237500000003e-7, 0.0000015471894999999998, 7.388154166666671e-7, 0.000001095871541666667, 0.0000017480919166666665, 3.108008333333332e-8, 1.94819125e-7, 2.398192083333334e-7, 6.642370833333329e-8, 2.0454291666666707e-8, 0.000002441825833333334, 0.000002315688666666667, 1.7006629166666663e-7, 5.27205e-8, 8.266312500000001e-8, 6.948991666666669e-8, 1.1817141666666671e-7, 0.0000014676726666666667, 0.000001242960625, 7.093620833333333e-8, 1.02085e-7, 4.0612500000000325e-9, 0.000003901978333333333, 0.0000036554607499999993, 8.435729166666669e-7,
  0.000028483569166666663, 0.00002293197658333333, 0.000006828908, 0.00009775781379166666, 0.00009740130470833335, 0.000002195179083333333, 0.0000010531656249999996, 0.0000021678371666666668, 5.938196666666666e-7, 0.0000028906441666666664, 0.0000035537783749999998, 5.154214583333334e-7, 5.543449583333334e-7,
];

/** The counting median of v3 (the ceil(n/2)-th smallest value), computed here to show where the balanced threshold departs from it. */
const countingMedian = (xs: readonly number[]): number | undefined =>
  xs.find((v) => xs.filter((s) => s <= v).length >= Math.ceil(xs.length / 2) && xs.filter((s) => s < v).length < Math.ceil(xs.length / 2));

// The G2 cases of ADR D6 at n 299 as oracle cases, and the two served arrays.
// killer: packages/hikae/src/runs.ts:107 SDL "if (ones === 0) continue;" -> ""
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
  // The package entry re-exports this module (consumers import it from there); the v3 median exceedance is gone from both.
  assert.deepEqual([hikae.runsCount, hikae.runsLowerTailLeq, hikae.balancedExceedance], [runsCount, runsLowerTailLeq, runsModule.balancedExceedance]);
  assert.equal("medianExceedance" in hikae, false);
  assert.equal("medianExceedance" in runsModule, false);
  assert.throws(() => runsCount([0, 2] as unknown as Bits), RangeError);
  assert.throws(() => runsLowerTailLeq([1, 0.5] as unknown as Bits, "0.05"), RangeError);
  assert.throws(() => balanced([1, Number.NaN]), RangeError);
});
