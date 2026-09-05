import { test } from "node:test";
import assert from "node:assert/strict";
import { clearing, fictitiousDefault, phi } from "../src/index.ts";
import { loadSystem, sys, l1 } from "./fixtures.ts";

/**
 * Tests 36-37 (ADR-M003 D11) — coûts de défaut (α,β) de Rogers & Veraart dans `fictitiousDefault`
 * / `clearing`. [lu] `P-K4-1-rogers2013.md` (éq. (1) p.884 Q1 ; GA Def. 3.6 / Thm 3.7 Q2 ; Ex. 3.3 Q2).
 * On cite la LECTURE, jamais le papier de mémoire.
 */

const ring = loadSystem("regular-ring-4.json");
const chain = loadSystem("chain-3.json");
const fanin = loadSystem("fan-in-5.json");
const app2 = loadSystem("app2-two-node.json");
const ex33 = loadSystem("ex33-two-bank.json");

// Test 36 — α=β=1 reproduit E&N AU BIT PRÈS. Les attendus sont les VALEURS ACTUELLES codées en dur
// (Phase 1, test 18/19/20), PAS une nouvelle exécution : le harnais casse si la généralisation (α,β)
// dérive d'un seul bit sur le chemin E&N. Mutant nommé : « interbancaire retiré » du RHS de défaut
// ⇒ chaîne/fan-in changent ⇒ ce test rouge.
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
    assert.equal(r.rounds, c.rounds, `${c.label}: rounds inchangés`);
    // Le défaut (α=β=1) doit être byte-identique à la valeur par défaut de la signature.
    assert.deepEqual(fictitiousDefault(c.s).p, c.p, `${c.label}: défauts α=β=1 implicites = explicites`);
  }
  // Non-unicité E&N (App. 2) reconduite sous la nouvelle signature.
  const zero = clearing(sys(app2, "zero"), 1, 1);
  assert.deepEqual(zero.pPlus, [1, 1]);
  assert.deepEqual(zero.pMinus, [0, 0]);
  assert.equal(zero.unique, false);
  const eps = clearing(sys(app2, "eps"), 1, 1);
  assert.deepEqual(eps.pPlus, [1, 1]);
  assert.equal(eps.unique, true);
  // Provenance (α,β) portée par le résultat.
  assert.equal(eps.alpha, 1);
  assert.equal(eps.beta, 1);
});

// Test 37 — contrôle négatif de NON-UNICITÉ, Ex. 3.3 (P-K4-1 Q2) : e=(1,1), α=β=½, L̄=(2.2,2.2).
//
// ÉCART D'ORACLE ASSUMÉ ET DÉMONTRÉ (R-21) : l'ADR-M003 D6.3, la fiche de mission et P-K4-1 Q2
// écrivent le plus grand vecteur « (2,2.2) ». C'est une COQUILLE pour (2.2,2.2) : (2,2.2) n'est un
// point fixe de Φ sous AUCUN α (assertions `notDeepEqual` ci-dessous), et (1,1) plus petit force
// π₁₂=π₂₁=1 donc le plus grand = (2.2,2.2). Ce test asserte les valeurs MATHÉMATIQUEMENT correctes
// et vérifiées par calcul (scratchpad rv-check.mjs, cf. docs/G1-lot-K.md — consultation formée).
// Mutant nommé : « β ignoré » (β→1 dans le RHS/A de défaut) ⇒ le recouvrement interbancaire n'est
// plus escompté ⇒ L_* ≠ (1,1) ⇒ ce test rouge.
test("clearing_rv_ex33_two_vectors", () => {
  const s = sys(ex33, "ex33");

  // α=β=½ : deux vecteurs de compensation distincts ⇒ unicité perdue.
  const half = clearing(s, 0.5, 0.5);
  assert.deepEqual(half.pPlus, [2.2, 2.2], "L* (GA) = (2.2,2.2)");
  assert.ok(l1(half.pMinus, [1, 1]) < 1e-6, `L_* (depuis 0) = (1,1) — obtenu ${JSON.stringify(half.pMinus)}`);
  assert.equal(half.unique, false, "α=β=½ ⇒ NON unique (Ex. 3.3)");
  // Les deux sont bien des points fixes de Φ (éq. 1, α=β=½).
  assert.ok(l1(phi(s, half.pPlus, 0.5, 0.5), half.pPlus) < 1e-9, "Φ(L*) = L*");
  assert.ok(l1(phi(s, half.pMinus, 0.5, 0.5), half.pMinus) < 1e-9, "Φ(L_*) = L_*");

  // DISPROUVE l'oracle littéral (2,2.2) : ce n'est un point fixe sous aucun α (Φ([2,2.2]) = [2.2,2.2]).
  assert.notDeepEqual(phi(s, [2, 2.2], 0.5, 0.5), [2, 2.2], "(2,2.2) n'est PAS clearing à α=β=½");
  assert.notDeepEqual(phi(s, [2, 2.2], 1, 1), [2, 2.2], "(2,2.2) n'est PAS clearing à α=β=1");

  // α=β=1 (E&N) : compensation UNIQUE = (2.2,2.2) (« then only (2.2,2.2) is a clearing vector »).
  const en = clearing(s, 1, 1);
  assert.deepEqual(en.pPlus, [2.2, 2.2], "E&N : unique = (2.2,2.2)");
  assert.equal(en.unique, true, "α=β=1 ⇒ unique");
});
