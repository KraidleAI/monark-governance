# @monark/ukemi — brique-moteur de cascade de liquidation (Phase 1)

UKEMI (受け身, « savoir tomber ») est une **brique-moteur MONARK, pas un produit** (décision
investisseur (c) ; G7 UKEMI §5-6 ; ADR-M002 D9). Il produit, de façon **déterministe et
recalculable par quiconque**, un montant liquidable sous choc, émis comme `Prediction` numérique
que HIKAE conformera en Phase 2. **Aucune garantie, aucun rendement, aucun `p_correct`.**
Code le nôtre.

## Les deux briques

| Brique | Rôle | Garantie **déclarée honnêtement** |
|---|---|---|
| **Clearing** `clearing` | point fixe `p* = Φ(p*)`, `Φ(p) = (Πᵀp + e) ∧ p̄` (Eisenberg & Noe 2001, [lu] `eisenberg2001.txt` ; [lu-archive] K4) ; `p⁺` par fictitious default ≤ n tours, `p⁻` par itérés depuis 0 ; unicité rapportée par `‖p⁺−p⁻‖₁ < tol` | existence (Thm 1, Tarski) ; unicité **si** régulier, `e>0` suffisant (Thm 2) — **testée par un contrôle négatif** (App. 2 : `e=0` ⇒ non unique). `unique` est évalué à `tol=1e-8` alors que Picard s'arrête à `1e-10` : déclaré, pas un théorème — sur les fixtures régulières `p⁺=p⁻` exactement. |
| **Cible A** `liquidableAmount` | « montant liquidable sous un choc de `x %` » par l'Eq. 3 de *Knife-edge* (arXiv 2009.13235v6 p.7) : bascule si `qty·price·(1−shock)·K < debt` | **Horizon 24 h = décision investisseur (d)**. Le choc est un **paramètre déclaré, PAS un modèle de dynamique 24 h** (dynamique NON TROUVÉE dans le corpus). Le « 99 % » n'est pas produit ici — cible de couverture HIKAE Phase 2. **Conséquence (i) de D9** : UKEMI et HIKAE **ne partagent plus la fenêtre** — la cible A devient, à l'intégration Phase 2, une **2e classe de tâche HIKAE** à horizon 24 h et `alpha = 0.01` (viser 99 %), **distincte de `btc-dir-15m`**. **Cible/horizon = « déclaré, non fondé »** (réserve C13d) : aucun acheteur n'a encore nommé une exigence de couverture (G7 UKEMI, NON TROUVÉ) ; le niveau 99 % est une cible HIKAE Phase 2, pas une sortie UKEMI Phase 1. |

## Écart source ↔ implémentation, consigné (test 21 `nonexpansive_in_e`)

Le Lemme 5 d'Eisenberg & Noe (p.244-245) énonce que `e ↦ p*(e)` est « concave, increasing, and
**nonexpansive** » (norme 1). Notre implémentation :

- **confirme** la non-expansivité de l'**opérateur** `Φ` en `p`, à `e` fixé (Thm 1 : « column sums
  of Πᵀ all equal 1 ⇒ ‖Πᵀ‖ = 1 ») ;
- **confirme** que `e ↦ p*` est **croissante et concave** (confirmation partielle de la source) ;
- **réfute par calcul**, sur deux systèmes **réguliers, `e ≫ 0`** (dans le domaine énoncé), la
  non-expansivité de `e ↦ p*` : chaîne 1→2→3 ⇒ `‖Δp*‖₁ = 2‖Δe‖₁` **exactement** ; fan-in de 3
  feuilles sur un hub ⇒ `‖Δp*‖∞ = 3‖Δe‖∞` **exactement**. Ni L1 ni L∞.

Mécanisme (indépendant de l'OCR) : sur l'ensemble de défaut `D`, `Δp*_D = (I − Πᵀ_DD)⁻¹ Δe_D` —
le système que `fictitiousDefault` résout — et cette inverse a une norme d'opérateur > 1 dès qu'un
défaut en entraîne un autre. L'étape d'induction de la preuve (`fₙ(e)=F(fₙ₋₁(e),e)`, `F`
1-Lipschitz jointement) ne livre pas la constante 1 sous la norme de somme : elle donne
`‖fₙ(e)−fₙ(e′)‖₁ ≤ n‖e−e′‖₁`.

**Ce qu'on n'écrit pas** : « Lemme 5 faux ». L'extraction deux-colonnes est illisible sur la formule ;
l'énoncé exact (norme, domaine) sur la **page rendue** est une **question de lecture formée**
(lecteur Sonnet, doc 03 §6 — exception page rendue), pendant ADR-M002 §4 en passe orchestrateur,
avec la correction de la formulation de D9/D11 qui citait l'inférence L1 comme cible du test.
L'`error_origin` est assigné au G7, pas ici.

**Pourquoi c'est une force, pas un défaut** : l'amplification d'un choc local par le réseau de
paiements est un phénomène **connu et cité dans le corpus** ([lu-archive] Detering, Meyer-Brandis,
Panagiotou, Ritter, *An integrated model for fire sales and default contagion*, Math. Fin. Econ.
2020, `detering2020.txt` l.53, 108, 951, 958). Mesurer cette amplification est exactement ce
pourquoi UKEMI existe.

## Pas de trading, pas de garantie (ADR-M002 D0)

UKEMI ne trade pas, ne recommande pas, n'appelle aucun ordre. Le trading est un produit **futur,
KAIZEN**. Le canal endogène DeFi (fire sales) est **hors périmètre Phase 1** (NON TROUVÉ).

## Tests

`npm run ci` (racine) : gate vocab + `tsc --strict` + `node:test`. Les 6 tests nommés d'ADR-M002 D11
(Lot U, 18-23) : `clearing_fixed_point`, `fictitious_default_le_n_rounds`,
`uniqueness_when_e_positive` (+ contrôle négatif App. 2), `nonexpansive_in_e` (ci-dessus),
`liquidable_amount_eq3`, `prediction_numeric_emitted`. Fixtures = **JSON pur** dans
`test/fixtures/`, chaque note donne l'oracle recalculable à la main. Contrat `Prediction` gelé
consommé via `@monark/contracts` — jamais réimplémenté (`contracts_frozen`).
