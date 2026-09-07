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
test("quantile_formula_n_plus_1", () => {
  // n=50, alpha=0.10 ⇒ p = ceil(51*0.9) = ceil(45.9) = 46; 46th smallest score.
  // 47 zeros + 3 ones: positions 1..47 = 0, so 46th = 0.
  const scores = Array.from({ length: 50 }, (_, i) => (i < 47 ? 0 : 1));
  const r = splitQuantile(scores, 0.1, 50);
  assert.ok(!("reason" in r), "50>=50 and p<=n");
  if (!("reason" in r)) assert.equal(r.qhat, 0, "46th smallest of [0×47,1×3] = 0");
  // Same p=46, but 44 zeros + 6 ones: positions 45..50 = 1, so 46th = 1.
  const scoresB = Array.from({ length: 50 }, (_, i) => (i < 44 ? 0 : 1));
  const rB = splitQuantile(scoresB, 0.1, 50);
  if (!("reason" in rB)) assert.equal(rB.qhat, 1, "46th smallest of [0×44,1×6] = 1");
  // n=50, alpha=0.02 ⇒ p = ceil(51*0.98) = ceil(49.98) = 50; 50 zeros ⇒ 50th = 0.
  const scores2 = Array.from({ length: 50 }, () => 0);
  const r2 = splitQuantile(scores2, 0.02, 50);
  if (!("reason" in r2)) assert.equal(r2.qhat, 0, "50th smallest of [0×50] = 0");
  // n=50, alpha=0.02, p=50, 49 zeros + 1 one ⇒ 50th smallest = 1.
  const scores3 = Array.from({ length: 50 }, (_, i) => (i < 49 ? 0 : 1));
  const r3 = splitQuantile(scores3, 0.02, 50);
  if (!("reason" in r3)) assert.equal(r3.qhat, 1, "50th smallest of [0×49,1] = 1");
});

// Test 5 — empty set not allowed. At score 0/1, q̂∈{0,1} ⇒ C never empty
// (ŷ always has score 0 ≤ q̂). GUARD, vacuous at score 0/1 (labelled, ADR-M002 D11).
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
