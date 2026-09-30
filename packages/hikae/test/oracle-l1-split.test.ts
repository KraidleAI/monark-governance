/**
 * HIKAE L1 - literature oracle tests for split conformal (worksite 1 of the conformal alignment).
 * Every expected value is computed in this file from the textbook, never read back from l1-split.ts:
 *   [TB] Angelopoulos, Barber and Bates, Theoretical Foundations of Conformal Prediction (arXiv:2411.11824),
 *        Algorithm 3.6, Thm 3.2, Thm 3.11, Prop. 3.12;
 *   [LEI] Lei, G'Sell, Rinaldo, Tibshirani and Wasserman 2018, Thm 2.2.
 * All tests are pins (green at base), each with one named killer. Pure: no clock, no file, seeds committed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitQuantile, indicatorScores, conformalSet } from "../src/index.ts";

/** Local seeded PRNG (mulberry32 copy, kept apart from the S2 instrument; first draw pinned below). */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Exact split rank ceil((n+1)(100-k)/100) in integer arithmetic (alpha = k/100). */
const exactRank = (n: number, k: number): number => Math.floor(((n + 1) * (100 - k) + 99) / 100);

/** Scores 1..n: the p-th smallest score is p, so qhat reads back the rank used by the code. */
const ranks = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

// [TB Alg. 3.6, Thm 3.2] Grid n = 1..200, alpha = k/100, k = 1..99. under_calib iff exact rank > n; the
// code rank equals the exact rank, except on cells where (n+1)(100-k) is divisible by 100, where the
// float product may round up by one step (conservative, signal P10): there the rank is exact or exact + 1.
// Equality holds on every cell for alpha in {0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5} (M-1, G0 section 5).
// killer: packages/hikae/src/l1-split.ts:37 CONST "(n + 1)" -> "(n + 0)"
test("oracle_split_rank_matches_exact_rational_rank", () => {
  for (let n = 1; n <= 200; n++) {
    const scores = ranks(n);
    for (let k = 1; k <= 99; k++) {
      const exact = exactRank(n, k);
      const r = splitQuantile(scores, k / 100, 1);
      const cell = `n=${n}, alpha=${k}/100, exact rank ${exact}`;
      if (exact > n) {
        assert.deepEqual(r, { reason: "under_calib" }, `${cell}: rank above n`);
        continue;
      }
      assert.ok("qhat" in r, `${cell}: a qhat is produced`);
      const strict = [1, 2, 5, 10, 20, 25, 50].includes(k);
      if (!strict && ((n + 1) * (100 - k)) % 100 === 0) {
        assert.ok(r.qhat === exact || r.qhat === exact + 1, `${cell}: divisible cell, code rank ${r.qhat}`);
      } else {
        assert.equal(r.qhat, exact, `${cell}: code rank`);
      }
    }
  }
});

// [TB Thm 3.2; SOA 2.4] p > n iff alpha < 1/(n+1): probed on both sides of the boundary, asserts unconditional.
// killer: packages/hikae/src/l1-split.ts:38 ROR "p > n" -> "p >= n"
test("oracle_split_under_calib_iff_alpha_below_one_over_n_plus_1", () => {
  for (const n of [9, 19, 49, 99, 150, 613]) {
    const scores = ranks(n);
    const below = splitQuantile(scores, 0.999 / (n + 1), 1);
    assert.deepEqual(below, { reason: "under_calib" }, `n=${n}: alpha just below 1/(n+1)`);
    const above = splitQuantile(scores, 1.001 / (n + 1), 1);
    assert.deepEqual(above, { qhat: n }, `n=${n}: alpha just above 1/(n+1) gives the largest score`);
  }
  assert.deepEqual(splitQuantile([], 0.5, 0), { reason: "under_calib" }, "n=0 with nMin=0: rank 1 > 0");
});

// Fail-closed rule (l1-split.ts header): alpha outside (0,1) never yields a clamped qhat.
// killer: packages/hikae/src/l1-split.ts:41 SDL "q === undefined" -> ""
test("oracle_split_fail_closed_on_alpha_outside_open_unit_interval", () => {
  const scores = ranks(20);
  for (const alpha of [0, -0.1, 1, 1.5, Number.NaN]) {
    const r = splitQuantile(scores, alpha, 1);
    assert.deepEqual(r, { reason: "under_calib" }, `alpha=${alpha}: under_calib`);
    assert.equal("qhat" in r, false, `alpha=${alpha}: no qhat key`);
  }
});

// [TB Thm 3.2 hypothesis] qhat is the p-th order statistic with ties counted with multiplicity, and a
// symmetric function of the scores: 20 seeded permutations give the same qhat.
// killer: packages/hikae/src/l1-split.ts:39 CONST "a - b" -> "b - a"
test("oracle_split_ties_and_input_order", () => {
  const cases = [
    { scores: [0, 1, 1, 1, 2, 2, 5, 5, 7], alpha: 0.25, qhat: 5 }, // n=9: p = ceil(7.5) = 8, 8th = 5
    { scores: [4, 4, 0, 0, 9, 9, 9, 1, 1, 4], alpha: 0.3, qhat: 9 }, // n=10: p = ceil(7.7) = 8, 8th = 9
    { scores: [3, 3, 3, 3, 3, 3, 3, 3, 3], alpha: 0.25, qhat: 3 }, // all tied
  ];
  const draw = prng(20260930);
  for (const c of cases) {
    assert.deepEqual(splitQuantile(c.scores, c.alpha, 1), { qhat: c.qhat }, `hand vector ${c.scores.join(",")}`);
    for (let rep = 0; rep < 20; rep++) {
      const perm = [...c.scores];
      for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(draw() * (i + 1));
        const tmp = perm[i] as number;
        perm[i] = perm[j] as number;
        perm[j] = tmp;
      }
      assert.deepEqual(splitQuantile(perm, c.alpha, 1), { qhat: c.qhat }, `permutation ${perm.join(",")}`);
    }
  }
});

/** P(Bin(n, eps) <= t), exact, by the log recurrence of the binomial mass. */
function binomialCdf(n: number, eps: number, t: number): number {
  let logMass = n * Math.log(1 - eps);
  let total = Math.exp(logMass);
  for (let j = 0; j < t; j++) {
    logMass += Math.log(n - j) - Math.log(j + 1) + Math.log(eps) - Math.log(1 - eps);
    total += Math.exp(logMass);
  }
  return total;
}

// [SOA 3(e) table, 2.1] 0/1 score at alpha = 0.1: the largest error count with qhat = 0, found by scan,
// equals n - ceil((n+1)(1-alpha)); the set is a singleton at qhat = 0 and both labels at qhat = 1; the
// exact binomial P(qhat = 0) matches the state of the art table to 1e-3.
// killer: packages/hikae/src/l1-split.ts:37 CONST "(1 - alpha)" -> "(1.01 - alpha)"
test("oracle_indicator_commit_threshold_matches_binomial_table", () => {
  const rows: { n: number; threshold: number; table: { eps: number; prob: number }[] }[] = [
    { n: 50, threshold: 4, table: [{ eps: 0.1, prob: 0.431 }, { eps: 0.12, prob: 0.268 }, { eps: 0.15, prob: 0.112 }] },
    { n: 100, threshold: 9, table: [] },
    { n: 200, threshold: 19, table: [{ eps: 0.1, prob: 0.466 }, { eps: 0.12, prob: 0.164 }, { eps: 0.15, prob: 0.015 }] },
    { n: 300, threshold: 29, table: [] },
    { n: 500, threshold: 49, table: [] },
  ];
  const labels = indicatorScores("up", ["up", "down"]);
  for (const row of rows) {
    assert.equal(row.n - exactRank(row.n, 10), row.threshold, `n=${row.n}: n - ceil((n+1)(0.9))`);
    let largest = -1;
    for (let errors = 0; errors <= row.n; errors++) {
      const scores = Array.from({ length: row.n }, (_, i) => (i < row.n - errors ? 0 : 1));
      const r = splitQuantile(scores, 0.1, 1);
      assert.ok("qhat" in r && (r.qhat === 0 || r.qhat === 1), `n=${row.n}, errors=${errors}: qhat in {0,1}`);
      assert.equal(conformalSet(labels, r.qhat).length, r.qhat + 1, "set size 1 at qhat 0, 2 at qhat 1");
      if (r.qhat === 0) largest = errors;
    }
    assert.equal(largest, row.threshold, `n=${row.n}: commit threshold`);
    for (const cell of row.table) {
      const prob = binomialCdf(row.n, cell.eps, largest);
      assert.ok(Math.abs(prob - cell.prob) <= 1e-3, `n=${row.n}, eps=${cell.eps}: P(qhat=0) ${prob}`);
    }
  }
});

// [TB Thm 3.2, Thm 3.11, Prop. 3.12; LEI Thm 2.2] For a.s. distinct exchangeable scores, P(covered) =
// p/(n+1) exactly, inside [1 - alpha, 1 - alpha + 1/(n+1)]. Uniform draws, seed 20260930, R = 20000:
// abs(K/R - p/(n+1)) <= t = sqrt(ln(2e6)/(2R)) (Hoeffding, delta = 1e-6). A one-rank shift moves the
// coverage by 1/(n+1) >= 0.04 > 2t, so the seed was not chosen.
// killer: packages/hikae/src/l1-split.ts:40 CONST "p - 1" -> "p - 2"
test("oracle_split_marginal_coverage_seeded_exchangeable", () => {
  assert.equal(prng(20260930)(), 0.7129707557614893, "first draw of seed 20260930 pinned");
  const R = 20000;
  const t = Math.sqrt(Math.log(2e6) / (2 * R));
  const draw = prng(20260930);
  for (const c of [{ n: 19, alpha: 0.1, p: 18 }, { n: 24, alpha: 0.1, p: 23 }]) {
    const exact = c.p / (c.n + 1);
    assert.ok(exact >= 1 - c.alpha && exact <= 1 - c.alpha + 1 / (c.n + 1), `n=${c.n}: p/(n+1) inside the bound`);
    let covered = 0;
    for (let rep = 0; rep < R; rep++) {
      const calib = Array.from({ length: c.n }, () => draw());
      const r = splitQuantile(calib, c.alpha, 1);
      assert.ok("qhat" in r, `n=${c.n}: qhat produced`);
      if (draw() <= r.qhat) covered++;
    }
    const rate = covered / R;
    assert.ok(Math.abs(rate - exact) <= t, `n=${c.n}: coverage ${rate} vs ${exact}, radius ${t}`);
  }
});
