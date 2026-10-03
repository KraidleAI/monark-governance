/**
 * HIKAE risk-controlling quantile - oracle tests (worksite 2 of the conformal alignment, lot L2-2; tests P-1 to P-6 of the
 * worksite G0 section 7). [ADR] RECHERCHES decisions/0004 v3.1: D2 (the served value is the order statistic at rank n - k*,
 * with ties included; the published bound is U(n, k*, delta), never U(n, k_obs, delta)) and D3 (exact rational rule; the
 * served rank is never below the split rank for delta < 1/4).
 * Expected values never come from binomial.ts or l1-split.ts:
 *   - k* and every binomial tail by a test-side exact sum of terms (term ratio recurrence in big integers);
 *   - the split rank ceil((n + 1)(1 - alpha)) in integer arithmetic;
 *   - the worksite G0 section 2: M-5 (USDe), M-6 (liq s0), M-7 (grid), M-8 (0/1 thresholds), M-16 and M-17 (atoms, U at k*);
 *   - [TB] arXiv:2411.11824v5 Thm 4.1: with continuous scores the rank-p order statistic misses more than alpha with
 *     probability P(Bin(n, alpha) <= n - p), checked exactly and by a seeded simulation (local mulberry32).
 * riskControlQuantile is read from the module namespace (l1-split.ts exists at the base): the base run loads every file and
 * fails on an assertion. Each test names one killer. Pure: no clock, no file, seeds committed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calibDigest } from "@monark/contracts";
import * as l1 from "../src/l1-split.ts";
import type { RiskControlResult } from "../src/l1-split.ts";
import * as hikae from "../src/index.ts";
import { LIQ_S0, USDE } from "./served-scores.ts";

type Q = { readonly num: bigint; readonly den: bigint };
type Served = Exclude<RiskControlResult, { readonly reason: "under_calib" }>;

/** Test-side decimal reader, unreduced: "0.05" -> 5/100 (inputs are well formed). */
function dec(s: string): Q {
  const frac = s.split(".")[1] ?? "";
  return { num: BigInt(frac), den: 10n ** BigInt(frac.length) };
}

/**
 * riskControlQuantile through the namespace: at a base without it, an assertion fails (never an import). The function
 * never throws on these inputs (every refusal is `under_calib`): a throw is reported as an assertion failure, so that a
 * mutant reaching the internal RangeError is killed by assertion (scripts/mutants/run.mjs), not left inconclusive.
 */
function rcq(scores: readonly number[], alphaDec: string, deltaDec: string, nMin = 1): RiskControlResult {
  assert.equal(typeof l1.riskControlQuantile, "function", "l1-split.ts exports riskControlQuantile");
  try {
    return l1.riskControlQuantile(scores, alphaDec, deltaDec, nMin);
  } catch (e) {
    return assert.fail(`riskControlQuantile threw on n ${scores.length}, alpha ${alphaDec}, delta ${deltaDec}, nMin ${nMin}: ${String(e)}`);
  }
}

function served(r: RiskControlResult, cell: string): Served {
  if ("reason" in r) return assert.fail(`${cell}: under_calib`);
  return r;
}

const UNDER = { reason: "under_calib" };

/**
 * Test-side exact tail: the largest k in -1..n with P(Bin(n, a) <= k) <= delta (-1: none), with terms
 * t_i = C(n, i) a.num^i (a.den - a.num)^(n - i) and t_(i+1) = t_i (n - i) a.num / ((i + 1)(a.den - a.num)), exact.
 */
function kStarOracle(n: number, a: Q, d: Q): number {
  const q = a.den - a.num;
  const total = a.den ** BigInt(n);
  let term = q ** BigInt(n);
  let cum = 0n;
  let k = -1;
  for (let i = 0; i <= n; i++) {
    cum += term;
    if (cum * d.den > d.num * total) break;
    k = i;
    if (i < n) term = (term * BigInt(n - i) * a.num) / (BigInt(i + 1) * q);
  }
  return k;
}

/** Test-side P(Bin(n, a) <= k) as a ratio over a.den^n (same recurrence). */
function tailOracle(n: number, k: number, a: Q): Q {
  const q = a.den - a.num;
  let term = q ** BigInt(n);
  let cum = 0n;
  for (let i = 0; i <= Math.min(k, n); i++) {
    cum += term;
    if (i < n) term = (term * BigInt(n - i) * a.num) / (BigInt(i + 1) * q);
  }
  return { num: cum, den: a.den ** BigInt(n) };
}

const leq = (x: Q, y: Q): boolean => x.num * y.den <= y.num * x.den;

/** Split rank ceil((n + 1)(1 - alpha)), integer arithmetic. */
const splitRank = (n: number, a: Q): number => Number((BigInt(n + 1) * (a.den - a.num) + a.den - 1n) / a.den);

/** Ascending order statistic at a 1-based rank. */
function orderStat(xs: readonly number[], rank: number): number {
  const v = [...xs].sort((x, y) => x - y)[rank - 1];
  assert.ok(v !== undefined, `rank ${rank} of ${xs.length}`);
  return v;
}

/** Local mulberry32 (seeded, reproducible). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// [M-5] USDe (main calibration.ts l.77-155, n 613): split rank 553 (qhat 1.3119228083333334e-4, 60 scores above); at
// (0.10, 0.05) k* 48, rank 565, qhat 1.5501056004166666e-4, U 0.0985253; at (0.10, 0.10) k* 51, rank 562, U 0.0993457.
// [M-6] liq s0 (n 170 below n0 = 299 and 230 at alpha 0.01): under_calib at both deltas. Arrays checked by digest (C5).
// killer: packages/hikae/src/l1-split.ts:74 CONST "n - kStar" -> "n - kStar + 1"
test("risk_control_rank_usde_and_liq_values", () => {
  assert.equal(calibDigest(USDE), "c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c");
  assert.equal(USDE.length, 613);
  const alpha = dec("0.10");
  assert.equal(kStarOracle(613, alpha, dec("0.05")), 48);
  assert.equal(kStarOracle(613, alpha, dec("0.10")), 51);
  assert.equal(splitRank(613, alpha), 553);
  const at05 = served(rcq(USDE, "0.10", "0.05"), "usde 0.05");
  assert.deepEqual(at05, { qhat: 1.5501056004166666e-4, rank: 565, kStar: 48, kObs: 48, missBound: "0.0985253" });
  assert.equal(at05.qhat, orderStat(USDE, 613 - 48), "the served value is the order statistic at rank n - k*");
  const at10 = served(rcq(USDE, "0.10", "0.10"), "usde 0.10");
  assert.deepEqual(at10, { qhat: 1.515488218333333e-4, rank: 562, kStar: 51, kObs: 51, missBound: "0.0993457" });
  assert.equal(at10.qhat, orderStat(USDE, 613 - 51));
  // The split path is untouched: rank 553, 60 scores strictly above its value.
  assert.deepEqual(l1.splitQuantile(USDE, 0.1, 1), { qhat: 1.3119228083333334e-4 });
  assert.equal(orderStat(USDE, 553), 1.3119228083333334e-4);
  assert.equal(USDE.filter((s) => s > 1.3119228083333334e-4).length, 60);
  // The caller floor nMin keeps its meaning.
  assert.equal(served(rcq(USDE, "0.10", "0.05", 613), "nMin 613").rank, 565);
  assert.deepEqual(rcq(USDE, "0.10", "0.05", 614), UNDER);
  // liq s0: no k >= 0 meets the rule at alpha 0.01 (0.99^170 = 0.18113 > delta).
  assert.equal(calibDigest(LIQ_S0), "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334");
  assert.equal(LIQ_S0.length, 170);
  for (const d of ["0.05", "0.10"]) {
    assert.equal(kStarOracle(170, dec("0.01"), dec(d)), -1);
    assert.deepEqual(rcq(LIQ_S0, "0.01", d), UNDER, `liq s0 at ${d}`);
  }
  // The package entry re-exports it (L2-3 reads it from there).
  assert.equal(hikae.riskControlQuantile, l1.riskControlQuantile);
});

// [M-7] n 1..400, alpha in {0.01, 0.02, 0.05, 0.10, 0.20}, delta in {0.05, 0.10}: 4 000 cells. Each cell: under_calib iff
// the oracle k* is -1; else rank = n - k* (oracle) and rank >= ceil((n + 1)(1 - alpha)) (consistency check of the D3
// theorem), on distinct scores 1..n so that qhat = rank and kObs = k*.
// killer: packages/hikae/src/l1-split.ts:74 CONST "n - kStar" -> "n - kStar - 1"
test("risk_control_rank_never_below_split_rank_grid", () => {
  let cells = 0;
  let servedCells = 0;
  for (const alphaDec of ["0.01", "0.02", "0.05", "0.10", "0.20"]) {
    for (const deltaDec of ["0.05", "0.10"]) {
      const a = dec(alphaDec);
      const d = dec(deltaDec);
      for (let n = 1; n <= 400; n++) {
        cells++;
        const cell = `n=${n}, alpha=${alphaDec}, delta=${deltaDec}`;
        const k = kStarOracle(n, a, d);
        const scores = Array.from({ length: n }, (_, i) => n - i);
        const r = rcq(scores, alphaDec, deltaDec);
        if (k < 0) {
          assert.deepEqual(r, UNDER, cell);
          continue;
        }
        servedCells++;
        const s = served(r, cell);
        assert.deepEqual([s.rank, s.kStar, s.qhat, s.kObs], [n - k, k, n - k, k], cell);
        assert.ok(s.rank >= splitRank(n, a), `${cell}: rank ${s.rank} below the split rank ${splitRank(n, a)}`);
      }
    }
  }
  assert.equal(cells, 4000);
  assert.ok(servedCells > 3000, `served cells ${servedCells}`);
});

// [LTT] with one setting (|Lambda| = 1) on the 0/1 score at (0.10, 0.05), n 150, 299, 613 (k* 8, 21, 48, [M-8]): with k*
// errors the served value is 0 (the singleton, COMMIT reachable), kObs = k*; with k* + 1 errors it is 1 (the whole label
// space), kObs = 0. The error positions are seeded; the result depends on the count only.
// killer: packages/hikae/src/l1-split.ts:78 ROR "s > qhat" -> "s >= qhat"
test("risk_control_rank_indicator_singleton_iff_errors_at_most_kstar", () => {
  const rand = mulberry32(20260930);
  for (const [n, pinned] of [[150, 8], [299, 21], [613, 48]] as const) {
    const k = kStarOracle(n, dec("0.10"), dec("0.05"));
    assert.equal(k, pinned, `k* at n ${n}`);
    for (const errors of [0, k - 1, k, k + 1, k + 2]) {
      const scores: (0 | 1)[] = Array.from({ length: n }, (): 0 | 1 => 0);
      let placed = 0;
      while (placed < errors) {
        const i = Math.floor(rand() * n);
        if (scores[i] === 0) {
          scores[i] = 1;
          placed++;
        }
      }
      const s = served(rcq(scores, "0.10", "0.05"), `n ${n}, errors ${errors}`);
      const singleton: boolean = errors <= k;
      assert.deepEqual(s, { qhat: singleton ? 0 : 1, rank: n - k, kStar: k, kObs: singleton ? errors : 0, missBound: s.missBound }, `n ${n}, errors ${errors}`);
    }
  }
});

// [TB Thm 4.1] exact: at the served rank p, P(Bin(n, alpha) <= n - p) <= delta, and one rank lower it exceeds delta (the
// largest such rank), on n 1..160 at four (alpha, delta) cells. Seeded simulation: uniform scores (the miss rate of qhat is
// 1 - qhat), R = 20 000 draws at (59, 0.05) and (299, 0.01), delta 0.05, where the rank is n and P(miss > alpha) =
// (1 - alpha)^n = 0.0485 and 0.0495; the frequency lies within the Hoeffding band at 1e-6, sqrt(ln(2e6) / (2 R)).
// killer: packages/hikae/src/l1-split.ts:74 CONST "n - kStar" -> "Math.ceil((n + 1) * (1 - Number(alphaDec)))"
test("risk_control_rank_beta_law_exact_and_seeded", () => {
  for (const [alphaDec, deltaDec] of [["0.05", "0.05"], ["0.10", "0.05"], ["0.10", "0.10"], ["0.20", "0.20"]] as const) {
    const a = dec(alphaDec);
    const d = dec(deltaDec);
    for (let n = 1; n <= 160; n++) {
      const r = rcq(Array.from({ length: n }, (_, i) => i / n), alphaDec, deltaDec);
      if ("reason" in r) {
        assert.equal(leq(tailOracle(n, 0, a), d), false, `n ${n}: under_calib only when zero misses fail`);
        continue;
      }
      assert.equal(leq(tailOracle(n, n - r.rank, a), d), true, `n ${n}, alpha ${alphaDec}: tail at the served rank`);
      assert.equal(leq(tailOracle(n, n - r.rank + 1, a), d), false, `n ${n}, alpha ${alphaDec}: one rank lower`);
    }
  }
  const rand = mulberry32(20260930);
  assert.equal(rand(), 0.7129707557614893, "first draw pinned (recomputed outside Node)");
  const draws = 20000;
  const band = Math.sqrt(Math.log(2e6) / (2 * draws));
  for (const [n, alphaDec, exact] of [[59, "0.05", 0.0485], [299, "0.01", 0.0495]] as const) {
    const t = tailOracle(n, 0, dec(alphaDec));
    const p = Number((t.num * 1000000n) / t.den) / 1e6;
    assert.ok(Math.abs(p - exact) < 0.00006, `(1 - alpha)^n = ${p}`);
    let misses = 0;
    for (let j = 0; j < draws; j++) {
      const s = served(rcq(Array.from({ length: n }, () => rand()), alphaDec, "0.05"), `draw ${j}`);
      assert.equal(s.rank, n);
      if (1 - s.qhat > Number(alphaDec)) misses++;
    }
    const freq = misses / draws;
    assert.ok(Math.abs(freq - p) <= band, `n ${n}: frequency ${freq} against ${p} (band ${band})`);
  }
});

// Fail closed: n < nMin, n < n0 (at the exact floor: n0 - 1 refused, n0 served with k* 0), empty scores, a NaN score, a
// nMin that is not an integer, refused decimals and test_delta >= 0.25: exactly { reason: "under_calib" }, never a qhat key.
// killer: packages/hikae/src/l1-split.ts:72 SDL "if (n < zeroErrorFloor(alphaDec, deltaDec)) return under;" -> ""
test("risk_control_rank_fail_closed", () => {
  const scores = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
  const check = (r: RiskControlResult, cell: string): void => {
    assert.deepEqual(r, UNDER, cell);
    assert.equal("qhat" in r, false, cell);
  };
  // Floors n0 by the oracle: the smallest n with (1 - alpha)^n <= delta ([M-1]: 29, 22, 59, 299, 230).
  for (const [alphaDec, deltaDec, n0] of [["0.10", "0.05", 29], ["0.10", "0.10", 22], ["0.05", "0.05", 59], ["0.01", "0.05", 299], ["0.01", "0.10", 230]] as const) {
    const a = dec(alphaDec);
    const d = dec(deltaDec);
    assert.equal(kStarOracle(n0, a, d), 0);
    assert.equal(kStarOracle(n0 - 1, a, d), -1);
    check(rcq(scores(n0 - 1), alphaDec, deltaDec), `n0 - 1 at ${alphaDec}, ${deltaDec}`);
    check(rcq(scores(1), alphaDec, deltaDec), `n 1 at ${alphaDec}, ${deltaDec}`);
    assert.deepEqual(served(rcq(scores(n0), alphaDec, deltaDec), `n0 at ${alphaDec}`).rank, n0);
  }
  check(rcq([], "0.10", "0.05", 0), "empty scores");
  check(rcq(scores(100), "0.10", "0.05", 101), "n < nMin");
  check(rcq(scores(100), "0.10", "0.05", Number.NaN), "nMin NaN");
  check(rcq(scores(100), "0.10", "0.05", 1.5), "nMin not an integer");
  check(rcq([...scores(99), Number.NaN], "0.10", "0.05"), "a NaN score");
  for (const bad of ["0", "1", "0.0", "-0.1", "1e-1", "0.1.0", "", ".1", "0.00001", "NaN"]) check(rcq(scores(100), bad, "0.05"), `alpha ${JSON.stringify(bad)}`);
  for (const bad of ["0", "0.25", "0.3", "0.250", "1", "5e-2", ""]) check(rcq(scores(100), "0.10", bad), `delta ${JSON.stringify(bad)}`);
  // Just below the refused range, the rule serves.
  assert.equal(served(rcq(scores(100), "0.10", "0.2499"), "delta 0.2499").kStar, kStarOracle(100, dec("0.10"), dec("0.2499")));
});

// [AC] 1.3, [M-16], [M-17]: n 100, alpha 0.10, delta 0.05, k* 4, served rank 96. Scores with the served value on an atom
// (four copies at ranks 96 to 99, one value above): kObs 1 < k* 4, and missBound stays U(100, 4, 0.05) = 0.0891963 (the U
// of kObs would be lower; the atom does not lower the miss rate). The same row without ties gives the same missBound.
// killer: packages/hikae/src/l1-split.ts:79 CONST "missUpperBound(n, kStar" -> "missUpperBound(n, kObs"
test("risk_control_rank_bound_ignores_ties", () => {
  assert.equal(kStarOracle(100, dec("0.10"), dec("0.05")), 4);
  const atom = [...Array.from({ length: 95 }, (_, i) => i), 1000, 1000, 1000, 1000, 2000];
  const s = served(rcq(atom, "0.10", "0.05"), "atom");
  assert.deepEqual(s, { qhat: 1000, rank: 96, kStar: 4, kObs: 1, missBound: "0.0891963" });
  assert.equal(s.qhat, orderStat(atom, 96));
  const distinct = Array.from({ length: 100 }, (_, i) => i);
  assert.deepEqual(served(rcq(distinct, "0.10", "0.05"), "distinct"), { qhat: 95, rank: 96, kStar: 4, kObs: 4, missBound: "0.0891963" });
  // The same atom seen in another order gives the same result (a function of the multiset).
  assert.deepEqual(rcq([...atom].reverse(), "0.10", "0.05"), s);
  // An atom holding every point from the served rank up: kObs 0, bound unchanged.
  const top = [...Array.from({ length: 95 }, (_, i) => i), 1000, 1000, 1000, 1000, 1000];
  assert.deepEqual(served(rcq(top, "0.10", "0.05"), "top atom"), { qhat: 1000, rank: 96, kStar: 4, kObs: 0, missBound: "0.0891963" });
});
