import { test } from "node:test";
import assert from "node:assert/strict";
import { splitQuantile, indicatorScores, conformalSet } from "../src/index.ts";

// Test 1 (ADR-M002 D11).
test("under_calib_abstains", () => {
  const scores = [0, 0, 1, 0, 0, 1, 0, 0, 0, 1]; // n=10
  const r = splitQuantile(scores, 0.1, 50);
  assert.ok("reason" in r && r.reason === "under_calib", "n<n_min ⇒ under_calib, no q̂");
  // p > n also triggers the fail-closed even when n >= n_min does not hold here:
  const r2 = splitQuantile([0], 0.1, 1); // n=1, p=ceil(2*0.9)=2 > 1
  assert.ok("reason" in r2 && r2.reason === "under_calib", "p>n ⇒ under_calib");
});

// Test 8 — the exact formula p = ceil((n+1)(1-alpha)), oracle on fixed vectors.
// killer: packages/hikae/src/l1-split.ts:40 ROR "p > n" -> "p >= n"
test("quantile_formula_n_plus_1", () => {
  // n=50, alpha=0.10 ⇒ p = ceil(51*0.9) = ceil(45.9) = 46; 46th smallest score.
  // 47 zeros + 3 ones: positions 1..47 = 0, so 46th = 0.
  const scores = Array.from({ length: 50 }, (_, i) => (i < 47 ? 0 : 1));
  const r = splitQuantile(scores, 0.1, 50);
  assert.ok(!("reason" in r), "50>=50 and p<=n");
  assert.equal(r.qhat, 0, "46th smallest of [0x47,1x3] = 0");
  // Same p=46, but 44 zeros + 6 ones: positions 45..50 = 1, so 46th = 1.
  const scoresB = Array.from({ length: 50 }, (_, i) => (i < 44 ? 0 : 1));
  const rB = splitQuantile(scoresB, 0.1, 50);
  assert.ok(!("reason" in rB), "p=46 <= n=50");
  assert.equal(rB.qhat, 1, "46th smallest of [0x44,1x6] = 1");
  // n=50, alpha=0.02 ⇒ p = ceil(51*0.98) = ceil(49.98) = 50; 50 zeros ⇒ 50th = 0.
  const scores2 = Array.from({ length: 50 }, () => 0);
  const r2 = splitQuantile(scores2, 0.02, 50);
  assert.ok(!("reason" in r2), "p=50 <= n=50");
  assert.equal(r2.qhat, 0, "50th smallest of [0x50] = 0");
  // n=50, alpha=0.02, p=50, 49 zeros + 1 one ⇒ 50th smallest = 1.
  const scores3 = Array.from({ length: 50 }, (_, i) => (i < 49 ? 0 : 1));
  const r3 = splitQuantile(scores3, 0.02, 50);
  assert.ok(!("reason" in r3), "p=50 <= n=50");
  assert.equal(r3.qhat, 1, "50th smallest of [0x49,1] = 1");
});

// Test 5 — empty set not allowed. At score 0/1, q̂∈{0,1} ⇒ C never empty
// (ŷ always has score 0 ≤ q̂). GUARD, vacuous at score 0/1 (labelled, ADR-M002 D11).
// An empty set (any score family) abstains with intent_not_in_region on the BYO set path (ADR-M005 D5 K-4(d) amendment, D8).
test("empty_set_not_allow", () => {
  const scores = indicatorScores("up", ["up", "down"]); // up→0, down→1
  // q̂=0 ⇒ {up}; q̂=1 ⇒ {up,down}; never empty.
  assert.deepEqual(conformalSet(scores, 0), ["up"]);
  assert.deepEqual(conformalSet(scores, 1), ["up", "down"]);
  assert.ok(conformalSet(scores, 0).length >= 1, "the set always contains ŷ (score 0)");
  // A negative q̂ (never produced by splitQuantile on 0/1 scores) would give empty —
  // the gate refuses an empty set via |C|=0 ≤ tau but intent∉C ⇒ ABSTAIN (covered by l3).
  assert.deepEqual(conformalSet(scores, -1), [], "synthetic bound: below every score ⇒ empty");
});

// B-12 (ADR-CM; spec section 7; plan r3 section 7, four killers): the served split rank reads String(alpha) as an exact
// rational, any number of decimals and an exponent: (50; 0.12345) -> 45, never under_calib; (24; 0.44) -> 14 and
// (9; 0.70) -> 3 where the float rank gives 15 and 4; (10; 1e-7) -> 11 > n, so under_calib and no throw; the spec
// vectors (9; 0.3) -> 7, (19; 0.15) -> 17, USDe (613; 0.1) -> 553 and liq (170; 0.01) -> 170 unchanged.
// killer: packages/hikae/src/l1-split.ts:233 CONST "return Number(top >= 0n ? (top + den - 1n) / den : -(-top / den));" -> "return Math.ceil((n + 1) * (1 - alpha));"
test("split_rank_shortest_four_killers", async () => {
  const m = (await import("../src/index.ts")) as unknown as Record<string, (...a: unknown[]) => unknown>;
  const rank = (n: number, a: number): unknown => m.splitRankShortest?.(n, a);
  const vectors = [[50, 0.12345, 45], [24, 0.44, 14], [9, 0.7, 3], [10, 1e-7, 11], [9, 0.3, 7], [19, 0.15, 17], [613, 0.1, 553], [170, 0.01, 170]] as const;
  for (const [n, a, p] of vectors) assert.equal(rank(n, a), p, `(${String(n)}; ${String(a)})`);
  const ranked = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
  assert.deepEqual(m.splitQuantileShortest?.(ranked(50), 0.12345, 50), { qhat: 45 }, "0.12345 is read whole, never under_calib");
  assert.deepEqual(m.splitQuantileShortest?.(ranked(24), 0.44, 1), { qhat: 14 });
  assert.deepEqual(m.splitQuantileShortest?.(ranked(10), 1e-7, 1), { reason: "under_calib" }, "p = 11 > n: under_calib, not a refusal");
  assert.deepEqual(m.splitQuantileShortest?.(ranked(10), 0.1, 11), { reason: "under_calib" }, "n < nMin");
});

// G2 N-3 of lot CM-3c-4b: the exact rank reads every decimal of String(alpha), so a reader that truncates to four
// decimals is killed: (50; 0.01961) -> ceil(51 * 0.98039) = 50, where 0.0196 gives ceil(51 * 0.9804) = 51 > n, under_calib.
// killer: packages/hikae/src/l1-split.ts:228 CONST "const frac = m[3] ?? \"\";" -> "const frac = (m[3] ?? \"\").slice(0, 4);"
test("split_rank_shortest_reads_past_four_decimals", async () => {
  const m = (await import("../src/index.ts")) as unknown as Record<string, (...a: unknown[]) => unknown>;
  assert.equal(m.splitRankShortest?.(50, 0.01961), 50, "(50; 0.01961) -> 50");
  assert.equal(m.splitRankShortest?.(50, 0.0196), 51, "control: (50; 0.0196) -> 51 > n");
  const ranked = Array.from({ length: 50 }, (_, i) => i + 1);
  assert.deepEqual(m.splitQuantileShortest?.(ranked, 0.01961, 50), { qhat: 50 }, "0.01961 is read whole, never under_calib");
});
