/**
 * HIKAE binomial core - oracle tests (worksite 2 of the conformal alignment, lot L2-1; tests B-1 to B-7 of the worksite G0).
 * Expected values never come from binomial.ts: closed forms computed here in exact big-integer arithmetic
 * ((1 - a)^n, (1 - a)^n + n a (1 - a)^(n-1), 1 - delta^(1/n)), and the tables of the worksite G0 section 2
 * (M-1 to M-5, M-17 to M-19; exact rational computations by RECHERCHES, confirmed by advisor-conformal).
 * Sources: [ADR] RECHERCHES decisions/0004 v3, D3 and D4; [SOA] synthesis 3(e); Clopper and Pearson 1934 (definition).
 * Category: new-module (red by import at base). Pure: no clock, no file, no seed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  binomCdfLeq,
  ceilDecimal4,
  missUpperBound,
  parseAlpha,
  parseTestDelta,
  riskControlMaxExceedances,
  spendDelta,
  zeroErrorFloor,
} from "../src/binomial.ts";
import type { Ratio } from "../src/binomial.ts";

/** Test-side decimal reader, unreduced: "0.05" -> 5/100 (no refusal logic; inputs are well formed). */
function dec(s: string): Ratio {
  const frac = s.split(".")[1] ?? "";
  return { num: BigInt(frac), den: 10n ** BigInt(frac.length) };
}

/** A ratio strictly below r: (2 num - 1) / (2 den). */
const below = (r: Ratio): Ratio => ({ num: 2n * r.num - 1n, den: 2n * r.den });

/** Test-side exact check of the zero-miss rule: (1 - a)^n <= delta. */
function zeroMissMeets(n: number, a: Ratio, d: Ratio): boolean {
  return d.den * (a.den - a.num) ** BigInt(n) <= d.num * a.den ** BigInt(n);
}

const GRID = 10_000_000n;

/** "0.0985253" -> 985253n (grid units of 1e-7). */
function gridUnits(u: string): bigint {
  assert.equal(u.length, 9, `seven decimals: ${u}`);
  return BigInt(u.slice(0, 1)) * GRID + BigInt(u.slice(2));
}

// [closed forms] k = 0: (1 - a)^n; k = 1: (1 - a)^n + n a (1 - a)^(n-1), exact. At delta equal to the tail the
// comparator is true; just below it is false. [M-5] P(Bin(613, 0.10) <= 60) = 0.46419 (0.4642 in the ADR).
// killer: packages/hikae/src/binomial.ts:80 ROR "i <= top" -> "i < top"
test("binomial_cdf_exact_against_closed_forms", () => {
  for (const n of [1, 10, 170, 613]) {
    for (const s of ["0.01", "0.1", "0.5"]) {
      const a = dec(s);
      const q = a.den - a.num;
      const bn = BigInt(n);
      const p0: Ratio = { num: q ** bn, den: a.den ** bn };
      const p1: Ratio = { num: q ** bn + bn * a.num * q ** (bn - 1n), den: a.den ** bn };
      const cell = `n=${n}, a=${s}`;
      assert.equal(binomCdfLeq(n, 0, a, p0), true, `${cell}, k=0 at the tail`);
      assert.equal(binomCdfLeq(n, 0, a, below(p0)), false, `${cell}, k=0 below the tail`);
      assert.equal(binomCdfLeq(n, 1, a, p1), true, `${cell}, k=1 at the tail`);
      assert.equal(binomCdfLeq(n, 1, a, below(p1)), false, `${cell}, k=1 below the tail`);
    }
  }
  assert.equal(binomCdfLeq(613, 60, dec("0.10"), dec("0.464195")), true, "USDe split tail at most 0.464195");
  assert.equal(binomCdfLeq(613, 60, dec("0.10"), dec("0.464185")), false, "USDe split tail above 0.464185");
  assert.equal(binomCdfLeq(170, 0, dec("0.01"), dec("0.1812")), true, "liq s0 share 0.99^170 = 0.18113 at most 0.1812");
  assert.equal(binomCdfLeq(170, 0, dec("0.01"), dec("0.1811")), false, "liq s0 share above 0.1811");
  assert.equal(binomCdfLeq(5, -1, dec("0.1"), { num: 0n, den: 1n }), true, "k < 0: empty sum");
  assert.equal(binomCdfLeq(5, 5, dec("0.1"), dec("0.99")), false, "k >= n: the tail is 1");
  assert.equal(binomCdfLeq(5, 7, dec("0.1"), dec("0.99")), false, "k > n: the tail is 1");
  assert.equal(binomCdfLeq(5, 7, dec("0.1"), { num: 1n, den: 1n }), true, "k > n: the tail is 1, at most 1");
});

// [M-1] zero-error floors n0 = ceil(ln(delta) / ln(1 - alpha)); n0 meets the rule and n0 - 1 does not (checked here
// exactly). [M-19] spend floors at test_delta 0.025, 0.0125, 0.00625. Exact boundary: 0.5^3 = 0.125 gives n0 = 3.
// killer: packages/hikae/src/binomial.ts:86 ROR "<=" -> "<"
test("binomial_zero_error_floor_table", () => {
  const table: [string, string, number][] = [
    ["0.10", "0.10", 22], ["0.10", "0.05", 29], ["0.05", "0.10", 45], ["0.05", "0.05", 59],
    ["0.02", "0.10", 114], ["0.02", "0.05", 149], ["0.01", "0.10", 230], ["0.01", "0.05", 299],
    ["0.10", "0.025", 36], ["0.10", "0.0125", 42], ["0.10", "0.00625", 49],
    ["0.01", "0.025", 368], ["0.01", "0.0125", 437], ["0.01", "0.00625", 505],
    ["0.5", "0.125", 3],
  ];
  for (const [alpha, delta, n0] of table) {
    const cell = `alpha=${alpha}, delta=${delta}`;
    assert.equal(zeroErrorFloor(alpha, delta), n0, `${cell}: n0`);
    assert.equal(zeroMissMeets(n0, dec(alpha), dec(delta)), true, `${cell}: n0 meets the rule`);
    assert.equal(zeroMissMeets(n0 - 1, dec(alpha), dec(delta)), false, `${cell}: n0 - 1 does not`);
    assert.ok(riskControlMaxExceedances(n0, alpha, delta) >= 0, `${cell}: a k* exists at n0`);
    assert.equal(riskControlMaxExceedances(n0 - 1, alpha, delta), -1, `${cell}: no k* below n0`);
  }
});

// [M-4, SOA 3(e)] k*: (100, 0.10, 0.10) -> 5 (P 0.05758; k = 6: 0.11716); (200, 0.10, 0.05) -> 12 (0.03205; 13: 0.05656);
// (500, 0.10, 0.05) -> 38 (0.03934; 39: 0.05502); split thresholds 9, 19, 49 are larger. [M-5] USDe n 613: 48 at
// delta 0.05, 51 at 0.10. [M-6] liq s0 n 170 at alpha 0.01: none. [M-3] first n with k* >= 1 and k* >= 2 at alpha 0.01.
// killer: packages/hikae/src/binomial.ts:172 CONST "return i - 1" -> "return i"
test("binomial_kstar_matches_synthesis_table", () => {
  const table: [number, string, string, number, string, string, number][] = [
    [100, "0.10", "0.10", 5, "0.05758", "0.11716", 9],
    [200, "0.10", "0.05", 12, "0.03205", "0.05656", 19],
    [500, "0.10", "0.05", 38, "0.03934", "0.05502", 49],
  ];
  for (const [n, alpha, delta, kStar, pAt, pNext, split] of table) {
    const cell = `n=${n}, alpha=${alpha}, delta=${delta}`;
    assert.equal(riskControlMaxExceedances(n, alpha, delta), kStar, `${cell}: k*`);
    assert.ok(kStar < split, `${cell}: k* below the split threshold`);
    for (const [k, p] of [[kStar, pAt], [kStar + 1, pNext]] as const) {
      const r = dec(p);
      assert.equal(binomCdfLeq(n, k, dec(alpha), { num: 2n * r.num + 1n, den: 2n * r.den }), true, `${cell}, k=${k}: tail below ${p} + half unit`);
      assert.equal(binomCdfLeq(n, k, dec(alpha), { num: 2n * r.num - 1n, den: 2n * r.den }), false, `${cell}, k=${k}: tail above ${p} - half unit`);
    }
  }
  assert.equal(riskControlMaxExceedances(613, "0.10", "0.05"), 48, "USDe at (0.10, 0.05)");
  assert.equal(riskControlMaxExceedances(613, "0.10", "0.10"), 51, "USDe at (0.10, 0.10)");
  assert.equal(riskControlMaxExceedances(170, "0.01", "0.05"), -1, "liq s0 at (0.01, 0.05)");
  assert.equal(riskControlMaxExceedances(170, "0.01", "0.10"), -1, "liq s0 at (0.01, 0.10)");
  for (const [delta, n1, n2] of [["0.05", 473, 628], ["0.10", 388, 531]] as const) {
    assert.equal(riskControlMaxExceedances(n1 - 1, "0.01", delta), 0, `delta ${delta}: k* = 0 at ${n1 - 1}`);
    assert.equal(riskControlMaxExceedances(n1, "0.01", delta), 1, `delta ${delta}: k* = 1 from ${n1}`);
    assert.equal(riskControlMaxExceedances(n2 - 1, "0.01", delta), 1, `delta ${delta}: k* = 1 at ${n2 - 1}`);
    assert.equal(riskControlMaxExceedances(n2, "0.01", delta), 2, `delta ${delta}: k* = 2 from ${n2}`);
  }
});

// [M-2, M-17, M-5, M-6] U(n, k, delta) at 7 decimals rounded up; at k = 0 against 1 - delta^(1/n) (checked exactly on the
// grid here: the printed value meets the rule, one grid step below does not); the four-decimal value is at least the
// seven-decimal one and at most alpha.
// killer: packages/hikae/src/binomial.ts:137 CONST "fixed(hi" -> "fixed(lo"
test("binomial_upper_bound_at_kstar_rounded_up", () => {
  const table: [number, number, string, string][] = [
    [170, 0, "0.10", "0.0134534"], [170, 0, "0.05", "0.0174676"], [230, 0, "0.10", "0.0099613"],
    [299, 0, "0.05", "0.0099692"], [10, 0, "0.05", "0.2588656"], [30, 0, "0.10", "0.0738813"],
    [20, 1, "0.05", "0.2161062"], [100, 5, "0.05", "0.1022534"], [150, 6, "0.05", "0.0774180"],
    [613, 51, "0.10", "0.0993457"], [613, 60, "0.10", "0.1150684"], [613, 60, "0.05", "0.1199058"],
  ];
  for (const [n, k, delta, u] of table) {
    assert.equal(missUpperBound(n, k, delta), u, `U(${n}, ${k}, ${delta})`);
    if (k !== 0) continue;
    const m = gridUnits(u);
    const d = dec(delta);
    assert.equal(zeroMissMeets(n, { num: m, den: GRID }, d), true, `U(${n}, 0, ${delta}) meets the rule`);
    assert.equal(zeroMissMeets(n, { num: m - 1n, den: GRID }, d), false, `one grid step below U(${n}, 0, ${delta}) does not`);
    const closed = 1 - Math.pow(Number(delta), 1 / n);
    assert.ok(Number(u) >= closed - 1e-12 && Number(u) - closed < 1e-7 + 1e-12, `U(${n}, 0, ${delta}) vs closed form ${closed}`);
  }
  const atKstar: [number, string, string, string, string][] = [
    [100, "0.10", "0.05", "0.0891963", "0.0892"], [150, "0.10", "0.05", "0.0941715", "0.0942"],
    [299, "0.10", "0.05", "0.0995659", "0.0996"], [500, "0.10", "0.05", "0.0984283", "0.0985"],
    [613, "0.10", "0.05", "0.0985253", "0.0986"], [1000, "0.10", "0.05", "0.0998573", "0.0999"],
    [299, "0.01", "0.05", "0.0099692", "0.0100"], [473, "0.01", "0.05", "0.0099898", "0.0100"],
  ];
  for (const [n, alpha, delta, u, u4] of atKstar) {
    const kStar = riskControlMaxExceedances(n, alpha, delta);
    assert.equal(missUpperBound(n, kStar, delta), u, `U(${n}, k* ${kStar}, ${delta})`);
    const four = ceilDecimal4({ num: gridUnits(u), den: GRID });
    assert.equal(four, u4, `four decimals of ${u}`);
    assert.ok(Number(four) >= Number(u) && Number(four) <= Number(alpha), `${u4} between ${u} and alpha ${alpha}`);
  }
});

// [Clopper-Pearson definition] U strictly increasing in k, strictly decreasing in n and in delta (grid n <= 200);
// the tail P(Bin(n, a) <= k) is non-increasing in a: the comparator turns from false to true once along a grid of a.
// killer: packages/hikae/src/binomial.ts:134 CONST "hi = mid" -> "lo = mid"
test("binomial_upper_bound_monotone", () => {
  let prev = missUpperBound(1, 0, "0.05");
  for (let n = 2; n <= 200; n++) {
    const u = missUpperBound(n, 0, "0.05");
    assert.ok(gridUnits(u) < gridUnits(prev), `U(n, 0, 0.05) decreasing at n=${n}`);
    prev = u;
  }
  prev = missUpperBound(200, 0, "0.05");
  for (let k = 1; k <= 30; k++) {
    const u = missUpperBound(200, k, "0.05");
    assert.ok(gridUnits(u) > gridUnits(prev), `U(200, k, 0.05) increasing at k=${k}`);
    prev = u;
  }
  for (const [n, k] of [[50, 0], [50, 3], [200, 0], [200, 3]] as const) {
    const us = ["0.01", "0.05", "0.1", "0.2"].map((d) => gridUnits(missUpperBound(n, k, d)));
    for (let i = 1; i < us.length; i++) assert.ok((us[i] ?? 0n) < (us[i - 1] ?? 0n), `U(${n}, ${k}, delta) decreasing in delta`);
  }
  for (const n of [5, 50, 200]) {
    for (const k of [0, 1, Math.floor(n / 10)]) {
      let seen = false;
      for (let j = 1; j <= 99; j++) {
        const now = binomCdfLeq(n, k, { num: BigInt(j), den: 100n }, dec("0.05"));
        assert.ok(now || !seen, `n=${n}, k=${k}: tail non-increasing in a at a=${j}/100`);
        seen = seen || now;
      }
      assert.ok(seen, `n=${n}, k=${k}: the tail falls to 0.05 before a = 1`);
    }
  }
});

// [ADR D4] refused at parse: anything that is not a plain decimal in (0, 1), alpha with more than four decimals,
// test_delta at or above 0.25; "0.10" equals "0.1"; the public functions refuse the same strings.
// killer: packages/hikae/src/binomial.ts:56 ROR ">=" -> ">"
test("binomial_refuses_out_of_range_inputs", () => {
  for (const bad of ["0", "1", "-0.1", "NaN", "1e-1", "0.1.0", "", "1.5", "0.", ".5", "0.0", " 0.1", "0.1 ", "+0.1", "0x1", "0.1:", "0./1"]) {
    assert.throws(() => parseAlpha(bad), RangeError, `alpha "${bad}"`);
    assert.throws(() => parseTestDelta(bad), RangeError, `delta "${bad}"`);
  }
  assert.throws(() => parseAlpha("0.00001"), RangeError, "alpha with five decimals");
  assert.throws(() => parseAlpha("0.12345"), RangeError, "alpha with five decimals");
  assert.deepEqual(parseAlpha("0.0001"), { num: 1n, den: 10000n }, "alpha with four decimals");
  assert.deepEqual(parseAlpha("0.10"), parseAlpha("0.1"), "0.10 equals 0.1");
  assert.deepEqual(parseAlpha("0.1000000"), parseAlpha("0.1"), "trailing zeros do not count as decimals");
  for (const bad of ["0.25", "0.250", "0.3", "0.99"]) assert.throws(() => parseTestDelta(bad), RangeError, `delta "${bad}"`);
  assert.deepEqual(parseTestDelta("0.2499"), { num: 2499n, den: 10000n }, "delta 0.2499 accepted");
  assert.deepEqual(parseTestDelta("0.00625"), { num: 1n, den: 160n }, "delta 0.00625 accepted");
  assert.throws(() => riskControlMaxExceedances(100, "0.1", "0.25"), RangeError, "k* refuses delta 0.25");
  assert.throws(() => zeroErrorFloor("0.00001", "0.05"), RangeError, "n0 refuses five decimals");
  assert.throws(() => missUpperBound(100, 4, "1e-1"), RangeError, "U refuses exponent form");
  assert.throws(() => missUpperBound(10, 10, "0.05"), RangeError, "U refuses kStar = n");
  assert.throws(() => riskControlMaxExceedances(1.5, "0.1", "0.05"), RangeError, "non-integer n");
  assert.throws(() => binomCdfLeq(-1, 0, dec("0.1"), dec("0.05")), RangeError, "negative n");
  assert.throws(() => binomCdfLeq(10, 0.5, dec("0.1"), dec("0.05")), RangeError, "non-integer k");
  assert.throws(() => binomCdfLeq(10, 0, { num: 3n, den: 2n }, dec("0.05")), RangeError, "a above 1");
});

// [M-18] four-decimal rounding up of exact ratios: 61/614 -> 0.0994, 1/171 -> 0.0059, 49/614 -> 0.0799,
// 22/300 -> 0.0734, 85/1001 -> 0.0850, 99^170/100^170 -> 0.1812; an exact four-decimal value stays. [ADR D5, M-19]
// spend 0.05, 0.025, 0.0125, 0.00625 for calib_attempt 1 to 4; attempt 5 refused.
// killer: packages/hikae/src/binomial.ts:143 CONST "r.den - 1n" -> "0n"
test("binomial_ceil4_and_spend", () => {
  const table: [bigint, bigint, string][] = [
    [61n, 614n, "0.0994"], [1n, 171n, "0.0059"], [49n, 614n, "0.0799"], [22n, 300n, "0.0734"],
    [85n, 1001n, "0.0850"], [99n ** 170n, 100n ** 170n, "0.1812"], [994n, 10000n, "0.0994"],
    [0n, 1n, "0.0000"], [1n, 1n, "1.0000"],
  ];
  for (const [num, den, out] of table) assert.equal(ceilDecimal4({ num, den }), out, `${String(num).slice(0, 12)}/${String(den).slice(0, 12)}`);
  assert.throws(() => ceilDecimal4({ num: 2n, den: 1n }), RangeError, "ratio above 1");
  assert.deepEqual([1, 2, 3, 4].map((j) => spendDelta("0.05", j)), ["0.05", "0.025", "0.0125", "0.00625"]);
  assert.deepEqual([1, 2, 3, 4].map((j) => spendDelta("0.050", j)), ["0.05", "0.025", "0.0125", "0.00625"]);
  assert.deepEqual([1, 4].map((j) => spendDelta("0.1", j)), ["0.1", "0.0125"]);
  for (const j of [0, 5, 1.5, -1]) assert.throws(() => spendDelta("0.05", j), RangeError, `attempt ${j}`);
  assert.throws(() => spendDelta("0.25", 1), RangeError, "base 0.25 refused");
  for (let j = 1; j <= 4; j++) assert.equal(zeroErrorFloor("0.10", spendDelta("0.05", j)), [29, 36, 42, 49][j - 1], `spend floor at attempt ${j}`);
});
