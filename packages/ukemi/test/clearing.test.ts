import { test } from "node:test";
import assert from "node:assert/strict";
import { clearing, fictitiousDefault, phi } from "../src/index.ts";
import { loadSystem, sys, l1, linf } from "./fixtures.ts";

const ring = loadSystem("regular-ring-4.json");
const chain = loadSystem("chain-3.json");
const fanin = loadSystem("fan-in-5.json");
const app2 = loadSystem("app2-two-node.json");

// Test 18 (ADR-M002 D11) — p* est un point fixe de Φ (K4:160), sur chaque fixture.
test("clearing_fixed_point", () => {
  for (const [f, key] of [[ring, "base"], [chain, "base"], [chain, "bumped"], [fanin, "base"], [fanin, "bumped"]] as const) {
    const s = sys(f, key);
    const r = clearing(s);
    assert.ok(l1(phi(s, r.pPlus), r.pPlus) < 1e-9, `${f.name}/${key}: Φ(p⁺)=p⁺`);
    assert.ok(l1(phi(s, r.pMinus), r.pMinus) < 1e-9, `${f.name}/${key}: Φ(p⁻)=p⁻`);
    // Sur le treillis [0, p̄] (K4:160) : 0 ≤ p* ≤ p̄.
    const pbar = f.L.map((row) => row.reduce((a, b) => a + b, 0));
    r.pPlus.forEach((p, i) => assert.ok(p >= 0 && p <= (pbar[i] ?? 0) + 1e-12, `${f.name}: 0≤p*≤p̄`));
  }
  // Oracles à la main (voir notes des fixtures).
  assert.deepEqual(clearing(sys(ring, "base")).pPlus, [10, 10, 10, 10]);
  assert.deepEqual(clearing(sys(chain, "base")).pPlus, [10, 10.5, 0]);
  assert.deepEqual(clearing(sys(fanin, "base")).pPlus, [2, 0.5, 0.5, 0.5, 0]);
});

// Test 19 — fictitious default termine en ≤ n tours (K4:51-58) ; le compteur n'est pas vacuous.
test("fictitious_default_le_n_rounds", () => {
  for (const [f, key] of [[ring, "base"], [chain, "base"], [fanin, "base"], [fanin, "bumped"]] as const) {
    const { rounds } = fictitiousDefault(sys(f, key));
    assert.ok(rounds <= f.L.length, `${f.name}: ${rounds} tours ≤ n=${f.L.length}`);
  }
  assert.equal(fictitiousDefault(sys(ring, "base")).rounds, 0, "anneau : aucun défaut ⇒ 0 tour");
  assert.equal(fictitiousDefault(sys(chain, "base")).rounds, 2, "chaîne : 1 défaut, puis 2 entraîné ⇒ 2 tours (n=3)");
  assert.equal(fictitiousDefault(sys(fanin, "base")).rounds, 2, "fan-in : feuilles, puis hub ⇒ 2 tours (n=5)");
});

// Test 20 — unicité quand e>0 (Thm 2, K4:47-48) + contrôle négatif Appendice 2 (K4).
test("uniqueness_when_e_positive", () => {
  for (const [f, key] of [[ring, "base"], [chain, "base"], [chain, "bumped"], [fanin, "base"], [fanin, "bumped"]] as const) {
    const r = clearing(sys(f, key));
    assert.ok(r.unique, `${f.name}/${key}: e>0 ⇒ p⁺=p⁻`);
    assert.ok(l1(r.pPlus, r.pMinus) < r.tol);
  }
  // Contrôle négatif : App. 2, e=(0,0) ⇒ deux points fixes distincts, PAS unique.
  const zero = clearing(sys(app2, "zero"));
  assert.deepEqual(zero.pPlus, [1, 1], "App.2 e=0 : p⁺=p̄");
  assert.deepEqual(zero.pMinus, [0, 0], "App.2 e=0 : p⁻=0");
  assert.equal(zero.unique, false, "App.2 e=0 : NON unique — le test ne peut pas passer par vacuité");
  // Une seule composante e>0 rend le système régulier ⇒ unique.
  const eps = clearing(sys(app2, "eps"));
  assert.equal(eps.unique, true);
  assert.deepEqual(eps.pPlus, [1, 1]);
});

/**
 * Test 21 — « nonexpansive_in_e » (nom D11 conservé : il nomme la PROPRIÉTÉ sous examen).
 *
 * ÉCART SOURCE ↔ IMPLÉMENTATION, consigné et non lissé (R-21). Eisenberg & Noe 2001, Lemme 5
 * (Management Science 47(2), p.244-245, [lu] `_txt/eisenberg2001.txt:614-660`) énonce que
 * e ↦ p*(e) est « concave, increasing, and nonexpansive » (norme 1, définie p.238, l.198-206).
 * Ce test :
 *   (a) CONFIRME la non-expansivité de l'OPÉRATEUR Φ en p, à e fixé — Thm 1, l.361-368
 *       (« column sums of Πᵀ all equal 1 ⇒ ‖Πᵀ‖=1 »), norme L1 ;
 *   (b) CONFIRME les deux sous-énoncés du Lemme 5 qui tiennent : e ↦ p* est croissante et
 *       concave (confirmation partielle vérifiée de la source) ;
 *   (c) RÉFUTE, par calcul sur deux systèmes RÉGULIERS, e ≫ 0 (dans le domaine ℝⁿ₊₊ énoncé
 *       l.620-640), la non-expansivité de e ↦ p* : chaîne ⇒ ratio L1 = 2 exactement ; fan-in ⇒
 *       ratio L∞ = 3 exactement (et L1 = 2). Ni L1 ni L∞ ne sont non-expansives.
 * Mécanisme (indépendant de l'OCR) : sur l'ensemble de défaut D, Δp*_D = (I − Πᵀ_DD)⁻¹ Δe_D —
 * c'est le système que `fictitiousDefault` résout — et (I − Πᵀ_DD)⁻¹ a une norme d'opérateur
 * > 1 dès qu'un défaut en entraîne un autre. L'étape d'induction de la preuve (l.646-649,
 * fₙ(e)=F(fₙ₋₁(e),e) avec F 1-Lipschitz jointement) ne livre pas la constante 1 sous la norme de
 * somme : elle donne ‖fₙ(e)−fₙ(e′)‖₁ ≤ n‖e−e′‖₁. On n'écrit PAS « Lemme 5 faux » : l'énoncé exact
 * (norme, domaine) sur la page rendue est une QUESTION DE LECTURE FORMÉE (pendant ADR-M002 §4,
 * passe orchestrateur), l'extraction deux-colonnes étant illisible sur la formule. L'amplification
 * d'un choc local par le réseau est un phénomène CONNU et cité dans le corpus ([lu-archive]
 * Detering, Meyer-Brandis, Panagiotou, Ritter 2020, Math. Fin. Econ., `_txt/detering2020.txt`
 * l.53, 108, 951, 958) — c'est précisément ce qu'UKEMI existe pour mesurer.
 */
test("nonexpansive_in_e", () => {
  // (a) Φ non-expansif en p, L1, e fixé — vecteurs fixes puis balayage déterministe (LCG).
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
  // (b) e ↦ p* croissante et concave (Lemme 5, sous-énoncés confirmés).
  const pLo = clearing(sys(chain, "base")).pPlus;
  const pHiMono = clearing(sys(chain, "mono_hi")).pPlus;
  pHiMono.forEach((v, i) => assert.ok(v >= (pLo[i] ?? 0) - 1e-12, "monotone : e′≥e ⇒ p*(e′)≥p*(e)"));
  assert.deepEqual(pHiMono, [10, 15.5, 0]);
  const cLo = clearing(sys(chain, "concave_lo")).pPlus; // [0.5, 1, 0]
  const cMid = clearing(sys(chain, "concave_mid")).pPlus; // [100, 100, 0] (coude p̄)
  const cHi = clearing(sys(chain, "concave_hi")).pPlus; // [100, 100, 0]
  assert.deepEqual(cLo, [0.5, 1, 0]);
  assert.deepEqual(cMid, [100, 100, 0]);
  assert.deepEqual(cHi, [100, 100, 0]);
  cMid.forEach((v, i) => assert.ok(v >= 0.5 * ((cLo[i] ?? 0) + (cHi[i] ?? 0)) - 1e-12, "concave : p*(mid) ≥ ½(p*(lo)+p*(hi))"));
  assert.ok((cMid[0] ?? 0) > 0.5 * ((cLo[0] ?? 0) + (cHi[0] ?? 0)), "concavité STRICTE au coude (non vacuous)");

  // (c) RÉFUTATION de la non-expansivité de e ↦ p*, systèmes réguliers, e ≫ 0. Ratios EXACTS.
  const cb = clearing(sys(chain, "base"));
  const cu = clearing(sys(chain, "bumped"));
  assert.ok(cb.unique && cu.unique, "chaîne : régulier, unique");
  assert.deepEqual(cu.pPlus, [11, 11.5, 0]);
  assert.equal(l1(chain.e["bumped"]!, chain.e["base"]!), 1, "‖Δe‖₁ = 1");
  assert.equal(l1(cu.pPlus, cb.pPlus), 2, "‖Δp*‖₁ = 2 > ‖Δe‖₁ = 1 : L1 NON non-expansive (ratio 2)");
  assert.equal(linf(cu.pPlus, cb.pPlus), 1, "sur la chaîne, L∞ tient encore (in-degré ≤ 1) — artefact, pas une propriété");

  const fb = clearing(sys(fanin, "base"));
  const fu = clearing(sys(fanin, "bumped"));
  assert.ok(fb.unique && fu.unique, "fan-in : régulier, unique");
  assert.deepEqual(fu.pPlus, [5, 1.5, 1.5, 1.5, 0]);
  assert.equal(linf(fanin.e["bumped"]!, fanin.e["base"]!), 1, "‖Δe‖∞ = 1");
  assert.equal(linf(fu.pPlus, fb.pPlus), 3, "‖Δp*‖∞ = 3 > ‖Δe‖∞ = 1 : L∞ NON non-expansive (ratio 3)");
  assert.equal(l1(fu.pPlus, fb.pPlus), 6, "‖Δp*‖₁ = 6 = 2·‖Δe‖₁ : L1 NON non-expansive aussi");
});
