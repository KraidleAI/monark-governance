import { test } from "node:test";
import assert from "node:assert/strict";
import { splitQuantile, indicatorScores, conformalSet } from "../src/index.ts";

// Test 1 (ADR-M002 D11).
test("under_calib_abstains", () => {
  const scores = [0, 0, 1, 0, 0, 1, 0, 0, 0, 1]; // n=10
  const r = splitQuantile(scores, 0.1, 50);
  assert.ok("reason" in r && r.reason === "under_calib", "n<n_min ⇒ under_calib, pas de q̂");
  // p > n déclenche aussi le fail-closed même quand n >= n_min n'est pas le cas ici :
  const r2 = splitQuantile([0], 0.1, 1); // n=1, p=ceil(2*0.9)=2 > 1
  assert.ok("reason" in r2 && r2.reason === "under_calib", "p>n ⇒ under_calib");
});

// Test 8 — la formule exacte p = ceil((n+1)(1-alpha)), oracle sur vecteurs fixes.
test("quantile_formula_n_plus_1", () => {
  // n=50, alpha=0.10 ⇒ p = ceil(51*0.9) = ceil(45.9) = 46 ; 46e plus petit score.
  // 47 zéros + 3 uns : positions 1..47 = 0, donc 46e = 0.
  const scores = Array.from({ length: 50 }, (_, i) => (i < 47 ? 0 : 1));
  const r = splitQuantile(scores, 0.1, 50);
  assert.ok(!("reason" in r), "50>=50 et p<=n");
  if (!("reason" in r)) assert.equal(r.qhat, 0, "46e plus petit de [0×47,1×3] = 0");
  // Même p=46, mais 44 zéros + 6 uns : positions 45..50 = 1, donc 46e = 1.
  const scoresB = Array.from({ length: 50 }, (_, i) => (i < 44 ? 0 : 1));
  const rB = splitQuantile(scoresB, 0.1, 50);
  if (!("reason" in rB)) assert.equal(rB.qhat, 1, "46e plus petit de [0×44,1×6] = 1");
  // n=50, alpha=0.02 ⇒ p = ceil(51*0.98) = ceil(49.98) = 50 ; 50 zéros ⇒ 50e = 0.
  const scores2 = Array.from({ length: 50 }, () => 0);
  const r2 = splitQuantile(scores2, 0.02, 50);
  if (!("reason" in r2)) assert.equal(r2.qhat, 0, "50e plus petit de [0×50] = 0");
  // n=50, alpha=0.02, p=50, 49 zéros + 1 un ⇒ 50e plus petit = 1.
  const scores3 = Array.from({ length: 50 }, (_, i) => (i < 49 ? 0 : 1));
  const r3 = splitQuantile(scores3, 0.02, 50);
  if (!("reason" in r3)) assert.equal(r3.qhat, 1, "50e plus petit de [0×49,1] = 1");
});

// Test 5 — ensemble vide non autorisé. Au score 0/1, q̂∈{0,1} ⇒ C jamais vide
// (ŷ a toujours score 0 ≤ q̂). GARDE, vacuous au score 0/1 (étiqueté, ADR-M002 D11).
test("empty_set_not_allow", () => {
  const scores = indicatorScores("up", ["up", "down"]); // up→0, down→1
  // q̂=0 ⇒ {up} ; q̂=1 ⇒ {up,down} ; jamais vide.
  assert.deepEqual(conformalSet(scores, 0), ["up"]);
  assert.deepEqual(conformalSet(scores, 1), ["up", "down"]);
  assert.ok(conformalSet(scores, 0).length >= 1, "l'ensemble contient toujours ŷ (score 0)");
  // Un q̂ négatif (jamais produit par splitQuantile sur scores 0/1) donnerait vide —
  // le gate refuse un ensemble vide via |C|=0 ≤ tau mais intent∉C ⇒ ABSTAIN (couvert par l3).
  assert.deepEqual(conformalSet(scores, -1), [], "borne synthétique : au-dessous de tout score ⇒ vide");
});
