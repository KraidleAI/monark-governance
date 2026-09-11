import { test } from "node:test";
import assert from "node:assert/strict";
import { clearing, fictitiousDefault, phi } from "../src/index.ts";
import { loadSystem, sys, l1, linf } from "./fixtures.ts";

const ring = loadSystem("regular-ring-4.json");
const chain = loadSystem("chain-3.json");
const fanin = loadSystem("fan-in-5.json");
const app2 = loadSystem("app2-two-node.json");

// Test 18 (ADR-M002 D11) — p* is a fixed point of Φ (K4:160), on each fixture.
test("clearing_fixed_point", () => {
  for (const [f, key] of [[ring, "base"], [chain, "base"], [chain, "bumped"], [fanin, "base"], [fanin, "bumped"]] as const) {
    const s = sys(f, key);
    const r = clearing(s);
    assert.ok(l1(phi(s, r.pPlus), r.pPlus) < 1e-9, `${f.name}/${key}: Φ(p⁺)=p⁺`);
    assert.ok(l1(phi(s, r.pMinus), r.pMinus) < 1e-9, `${f.name}/${key}: Φ(p⁻)=p⁻`);
    // On the lattice [0, p̄] (K4:160): 0 ≤ p* ≤ p̄.
    const pbar = f.L.map((row) => row.reduce((a, b) => a + b, 0));
    r.pPlus.forEach((p, i) => assert.ok(p >= 0 && p <= (pbar[i] ?? 0) + 1e-12, `${f.name}: 0≤p*≤p̄`));
  }
  // Oracles by hand (see fixture notes).
  assert.deepEqual(clearing(sys(ring, "base")).pPlus, [10, 10, 10, 10]);
  assert.deepEqual(clearing(sys(chain, "base")).pPlus, [10, 10.5, 0]);
  assert.deepEqual(clearing(sys(fanin, "base")).pPlus, [2, 0.5, 0.5, 0.5, 0]);
});

// Test 19 — fictitious default terminates in ≤ n rounds (K4:51-58); the counter is not vacuous.
test("fictitious_default_le_n_rounds", () => {
  for (const [f, key] of [[ring, "base"], [chain, "base"], [fanin, "base"], [fanin, "bumped"]] as const) {
    const { rounds } = fictitiousDefault(sys(f, key));
    assert.ok(rounds <= f.L.length, `${f.name}: ${rounds} rounds ≤ n=${f.L.length}`);
  }
  assert.equal(fictitiousDefault(sys(ring, "base")).rounds, 0, "ring: no default ⇒ 0 rounds");
  assert.equal(fictitiousDefault(sys(chain, "base")).rounds, 2, "chain: 1 default, then 2 induced ⇒ 2 rounds (n=3)");
  assert.equal(fictitiousDefault(sys(fanin, "base")).rounds, 2, "fan-in: leaves, then hub ⇒ 2 rounds (n=5)");
});

// Test 20 — uniqueness when e>0 (Thm 2, K4:47-48) + negative control Appendix 2 (K4).
test("uniqueness_when_e_positive", () => {
  for (const [f, key] of [[ring, "base"], [chain, "base"], [chain, "bumped"], [fanin, "base"], [fanin, "bumped"]] as const) {
    const r = clearing(sys(f, key));
    assert.ok(r.unique, `${f.name}/${key}: e>0 ⇒ p⁺=p⁻`);
    assert.ok(l1(r.pPlus, r.pMinus) < r.tol);
  }
  // Negative control: App. 2, e=(0,0) ⇒ two distinct fixed points, NOT unique.
  const zero = clearing(sys(app2, "zero"));
  assert.deepEqual(zero.pPlus, [1, 1], "App.2 e=0 : p⁺=p̄");
  assert.deepEqual(zero.pMinus, [0, 0], "App.2 e=0 : p⁻=0");
  assert.equal(zero.unique, false, "App.2 e=0 : NOT unique — the test cannot pass vacuously");
  // A single component e>0 makes the system regular ⇒ unique.
  const eps = clearing(sys(app2, "eps"));
  assert.equal(eps.unique, true);
  assert.deepEqual(eps.pPlus, [1, 1]);
});

/**
 * Test 21 — "nonexpansive_in_e" (D11 name kept: it names the PROPERTY under examination).
 *
 * SOURCE ↔ IMPLEMENTATION DISCREPANCY, recorded and not smoothed over. Eisenberg & Noe 2001, Lemma 5
 * (Management Science 47(2), p.244-245, [lu] `_txt/eisenberg2001.txt:614-660`) states that
 * e ↦ p*(e) is "concave, increasing, and nonexpansive" (norm 1, defined p.238, l.198-206).
 * This test:
 *   (a) CONFIRMS the nonexpansiveness of the OPERATOR Φ in p, at fixed e — Thm 1, l.361-368
 *       ("column sums of Πᵀ all equal 1 ⇒ ‖Πᵀ‖=1"), norm L1;
 *   (b) CONFIRMS the two sub-statements of Lemma 5 that hold: e ↦ p* is increasing and
 *       concave (partial confirmation verified against the source);
 *   (c) REFUTES, by computation on two REGULAR systems, e ≫ 0 (in the domain ℝⁿ₊₊ stated
 *       l.620-640), the nonexpansiveness of e ↦ p*: chain ⇒ L1 ratio = 2 exactly; fan-in ⇒
 *       L∞ ratio = 3 exactly (and L1 = 2). Neither L1 nor L∞ are nonexpansive.
 * Mechanism (independent of OCR): on the default set D, Δp*_D = (I − Πᵀ_DD)⁻¹ Δe_D —
 * this is the system that `fictitiousDefault` solves — and (I − Πᵀ_DD)⁻¹ has an operator norm
 * > 1 as soon as one default induces another. The induction step of the proof (l.646-649,
 * fₙ(e)=F(fₙ₋₁(e),e) with F jointly 1-Lipschitz) does not yield the constant 1 under the sum
 * norm: it gives ‖fₙ(e)−fₙ(e′)‖₁ ≤ n‖e−e′‖₁. We do NOT write "Lemma 5 false": the exact statement
 * (norm, domain) on the rendered page is a FORMED READING QUESTION (pending ADR-M002 §4,
 * orchestrator pass), the two-column extraction being illegible on the formula. The amplification
 * of a local shock by the network is a KNOWN phenomenon and cited in the corpus ([lu-archive]
 * Detering, Meyer-Brandis, Panagiotou, Ritter 2020, Math. Fin. Econ., `_txt/detering2020.txt`
 * l.53, 108, 951, 958) — it is precisely what UKEMI exists to measure.
 */
test("nonexpansive_in_e", () => {
  // (a) Φ nonexpansive in p, L1, fixed e — fixed vectors then deterministic sweep (LCG).
  for (const f of [chain, fanin]) {
    const s = sys(f, "base");
    const pbar = f.L.map((row) => row.reduce((a, b) => a + b, 0));
    let seed = 42;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    for (let k = 0; k < 200; k++) {
      const p = pbar.map((b) => rnd() * b);
      const q = pbar.map((b) => rnd() * b);
      assert.ok(l1(phi(s, p), phi(s, q)) <= l1(p, q) + 1e-9, `${f.name}: ‖Φ(p)−Φ(q)‖₁ ≤ ‖p−q‖₁`);
    }
  }
  // (b) e ↦ p* increasing and concave (Lemma 5, confirmed sub-statements).
  const pLo = clearing(sys(chain, "base")).pPlus;
  const pHiMono = clearing(sys(chain, "mono_hi")).pPlus;
  pHiMono.forEach((v, i) => assert.ok(v >= (pLo[i] ?? 0) - 1e-12, "monotone : e′≥e ⇒ p*(e′)≥p*(e)"));
  assert.deepEqual(pHiMono, [10, 15.5, 0]);
  const cLo = clearing(sys(chain, "concave_lo")).pPlus; // [0.5, 1, 0]
  const cMid = clearing(sys(chain, "concave_mid")).pPlus; // [100, 100, 0] (kink p̄)
  const cHi = clearing(sys(chain, "concave_hi")).pPlus; // [100, 100, 0]
  assert.deepEqual(cLo, [0.5, 1, 0]);
  assert.deepEqual(cMid, [100, 100, 0]);
  assert.deepEqual(cHi, [100, 100, 0]);
  cMid.forEach((v, i) => assert.ok(v >= 0.5 * ((cLo[i] ?? 0) + (cHi[i] ?? 0)) - 1e-12, "concave : p*(mid) ≥ ½(p*(lo)+p*(hi))"));
  assert.ok((cMid[0] ?? 0) > 0.5 * ((cLo[0] ?? 0) + (cHi[0] ?? 0)), "STRICT concavity at the kink (non vacuous)");

  // (c) REFUTATION of the nonexpansiveness of e ↦ p*, regular systems, e ≫ 0. EXACT ratios.
  const cb = clearing(sys(chain, "base"));
  const cu = clearing(sys(chain, "bumped"));
  assert.ok(cb.unique && cu.unique, "chain: regular, unique");
  assert.deepEqual(cu.pPlus, [11, 11.5, 0]);
  assert.equal(l1(chain.e["bumped"]!, chain.e["base"]!), 1, "‖Δe‖₁ = 1");
  assert.equal(l1(cu.pPlus, cb.pPlus), 2, "‖Δp*‖₁ = 2 > ‖Δe‖₁ = 1 : L1 NOT nonexpansive (ratio 2)");
  assert.equal(linf(cu.pPlus, cb.pPlus), 1, "on the chain, L∞ still holds (in-degree ≤ 1) — artefact, not a property");

  const fb = clearing(sys(fanin, "base"));
  const fu = clearing(sys(fanin, "bumped"));
  assert.ok(fb.unique && fu.unique, "fan-in: regular, unique");
  assert.deepEqual(fu.pPlus, [5, 1.5, 1.5, 1.5, 0]);
  assert.equal(linf(fanin.e["bumped"]!, fanin.e["base"]!), 1, "‖Δe‖∞ = 1");
  assert.equal(linf(fu.pPlus, fb.pPlus), 3, "‖Δp*‖∞ = 3 > ‖Δe‖∞ = 1 : L∞ NOT nonexpansive (ratio 3)");
  assert.equal(l1(fu.pPlus, fb.pPlus), 6, "‖Δp*‖₁ = 6 = 2·‖Δe‖₁ : L1 NOT nonexpansive either");
});
