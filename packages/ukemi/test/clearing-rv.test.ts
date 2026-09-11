import { test } from "node:test";
import assert from "node:assert/strict";
import { clearing, fictitiousDefault, phi } from "../src/index.ts";
import { loadSystem, sys, l1 } from "./fixtures.ts";

/**
 * Tests 36-37 (ADR-M003 D11) — Rogers & Veraart default costs (α,β) in `fictitiousDefault`
 * / `clearing`. [lu] `P-K4-1-rogers2013.md` (Eq. (1) p.884 Q1; GA Def. 3.6 / Thm 3.7 Q2; Ex. 3.3 Q2).
 * We cite the READING, never the paper from memory.
 */

const ring = loadSystem("regular-ring-4.json");
const chain = loadSystem("chain-3.json");
const fanin = loadSystem("fan-in-5.json");
const app2 = loadSystem("app2-two-node.json");
const ex33 = loadSystem("ex33-two-bank.json");

// Test 36 — α=β=1 reproduces E&N BIT-FOR-BIT. The expected values are the CURRENT hard-coded VALUES
// (Phase 1, test 18/19/20), NOT a fresh run: the harness breaks if the (α,β) generalization
// drifts by a single bit on the E&N path. Named mutant: "interbank removed" from the default RHS
// ⇒ chain/fan-in change ⇒ this test red.
test("clearing_alpha_beta_regression_en", () => {
  const cases: { s: ReturnType<typeof sys>; p: number[]; rounds: number; label: string }[] = [
    { s: sys(ring, "base"), p: [10, 10, 10, 10], rounds: 0, label: "ring/base" },
    { s: sys(chain, "base"), p: [10, 10.5, 0], rounds: 2, label: "chain/base" },
    { s: sys(chain, "bumped"), p: [11, 11.5, 0], rounds: 2, label: "chain/bumped" },
    { s: sys(fanin, "base"), p: [2, 0.5, 0.5, 0.5, 0], rounds: 2, label: "fanin/base" },
    { s: sys(fanin, "bumped"), p: [5, 1.5, 1.5, 1.5, 0], rounds: 2, label: "fanin/bumped" },
  ];
  for (const c of cases) {
    const r = fictitiousDefault(c.s, 1, 1);
    assert.deepEqual(r.p, c.p, `${c.label}: fictitiousDefault(·,1,1).p byte-exact`);
    assert.equal(r.rounds, c.rounds, `${c.label}: rounds unchanged`);
    // The default (α=β=1) must be byte-identical to the signature's default value.
    assert.deepEqual(fictitiousDefault(c.s).p, c.p, `${c.label}: implicit α=β=1 defaults = explicit`);
  }
  // E&N non-uniqueness (App. 2) carried over under the new signature.
  const zero = clearing(sys(app2, "zero"), 1, 1);
  assert.deepEqual(zero.pPlus, [1, 1]);
  assert.deepEqual(zero.pMinus, [0, 0]);
  assert.equal(zero.unique, false);
  const eps = clearing(sys(app2, "eps"), 1, 1);
  assert.deepEqual(eps.pPlus, [1, 1]);
  assert.equal(eps.unique, true);
  // Provenance (α,β) carried by the result.
  assert.equal(eps.alpha, 1);
  assert.equal(eps.beta, 1);
});

// Test 37 — NON-UNIQUENESS negative control, Ex. 3.3 (P-K4-1 Q2): e=(1,1), α=β=½, L̄=(2.2,2.2).
//
// ORACLE DISCREPANCY ACKNOWLEDGED AND DEMONSTRATED: ADR-M003 D6.3, the mission brief and P-K4-1 Q2
// write the largest vector "(2,2.2)". It is a TYPO for (2.2,2.2): (2,2.2) is not a
// fixed point of Φ under ANY α (`notDeepEqual` assertions below), and (1,1) being the smaller forces
// π₁₂=π₂₁=1 so the largest = (2.2,2.2). This test asserts the MATHEMATICALLY correct values
// verified by computation (scratchpad rv-check.mjs, cf. docs/G1-lot-K.md — formed consultation).
// Named mutant: "β ignored" (β→1 in the default RHS/A) ⇒ the interbank recovery is
// no longer discounted ⇒ L_* ≠ (1,1) ⇒ this test red.
test("clearing_rv_ex33_two_vectors", () => {
  const s = sys(ex33, "ex33");

  // α=β=½: two distinct clearing vectors ⇒ uniqueness lost.
  const half = clearing(s, 0.5, 0.5);
  assert.deepEqual(half.pPlus, [2.2, 2.2], "L* (GA) = (2.2,2.2)");
  assert.ok(l1(half.pMinus, [1, 1]) < 1e-6, `L_* (from 0) = (1,1) — got ${JSON.stringify(half.pMinus)}`);
  assert.equal(half.unique, false, "α=β=½ ⇒ NOT unique (Ex. 3.3)");
  // Both are indeed fixed points of Φ (Eq. 1, α=β=½).
  assert.ok(l1(phi(s, half.pPlus, 0.5, 0.5), half.pPlus) < 1e-9, "Φ(L*) = L*");
  assert.ok(l1(phi(s, half.pMinus, 0.5, 0.5), half.pMinus) < 1e-9, "Φ(L_*) = L_*");

  // DISPROVES the literal oracle (2,2.2): it is not a fixed point under any α (Φ([2,2.2]) = [2.2,2.2]).
  assert.notDeepEqual(phi(s, [2, 2.2], 0.5, 0.5), [2, 2.2], "(2,2.2) is NOT clearing at α=β=½");
  assert.notDeepEqual(phi(s, [2, 2.2], 1, 1), [2, 2.2], "(2,2.2) is NOT clearing at α=β=1");

  // α=β=1 (E&N): UNIQUE clearing = (2.2,2.2) ("then only (2.2,2.2) is a clearing vector").
  const en = clearing(s, 1, 1);
  assert.deepEqual(en.pPlus, [2.2, 2.2], "E&N: unique = (2.2,2.2)");
  assert.equal(en.unique, true, "α=β=1 ⇒ unique");
});
