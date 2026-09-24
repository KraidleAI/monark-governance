# Lecture — Cifuentes, Ferrucci, Shin (2005), « Liquidity risk and contagion », Bank of England Working Paper 264, ISSN 1368-5562, 31 p. [lu intégral + 9 pages rendues en image pour équations/charts]
Lecteur Sonnet 5, 2026-09-19. Procuré par l'investisseur (sha `06e9aa8b…`). Version longue avec simulations (§3-4, 8 charts) ; la JEEA 2005 courte est lue séparément.

## Équations
- π_ij = L_ij / x̄_i ; x = x̄ ∧ (w(p) + Πᵀx), w_i(p) = p·e_i + c_i (éq. 1-3, p.12-13) ; H croissante ⇒ Tarski ; **unicité à p fixé** (EN, Lemma 1, p.13 : connexité + une équité positive).
- Ratio de capital (éq. 4, p.14) et règle de vente forcée (p.15) : liquide d'abord, puis illiquide.
- **Demande inverse p = e^{−α·s}** (éq. 5, p.15), s = ventes agrégées ; conditions de régularité (éq. 6-7) ; Φ(p) = d⁻¹(s(p)) ; Prop. 2 : Φ(p) ≥ p ∀p ⇒ équilibre unique p = 1 ; Prop. 3 : Φ(p) < p quelque part ⇒ équilibre p < 1 atteint par étapes si choc assez grand. **Pas d'unicité prouvée du prix final** ; condition AFM absente (not_found) — ne pas l'attribuer à ce WP.

## Dynamique (§3.1, p.18-20)
Test r_k ≥ r → redimensionnement ou liquidation totale sous le seuil r·ΣL → ventes cumulées → nouveau p → reprix → itération jusqu'à stabilité globale. Pas de dimension temporelle (note 8) : tâtonnement fictif. Résultat : la perte finale peut excéder le choc dès que α > 0 (destruction endogène, contraste avec EN, p.23).

## Simulations
n = 10 banques homogènes ; bilan 70 (liquide+illiquide) / 30 interbancaire ; fonds propres 7, dépôts 63, passifs interbancaires 30 ; r = 7 % ; α tel que p tombe à 0,5 si tout l'illiquide est vendu ; choc « sudden death » avec LGD.
- Chart 2 (LGD 0) : α = 0 ⇒ zéro défaut partout ; plancher 0,8 ⇒ « Def = 10 » jusqu'à ~10 % de liquidité ; plancher 0,5 ⇒ jusqu'à ~29 % (~36 % à 8-9 liens) — lecture graphique.
- Chart 3-5 (LGD 30 %, α 0,5, capital 8 %) : 1 lien → 1 défaut ; 2-4 liens → 0 puis jusqu'à 9 défauts en rounds tardifs ; actifs cumulés vendus ~300-330 à l'itération 9 (3-4 liens) vs ~50-100 ; **≥ 5 contreparties ⇒ le canal-prix disparaît** (p.28).
- Chart 6 : non-monotonicité liens/risque (seuil ~30 % → ~45-50 % à 4-5 liens → ~30-35 % à 9).
- Chart 7-8 : r 7 % → seuil ~25-50 % ; r 10 % → ~5-30 % ; substitution liquidité ↔ capital ; « Liquidity requirements can be as effective as capital requirements » (abstract).

## Transposabilité DeFi
Citable : architecture bilan + ratio + vente forcée + demande inverse + point fixe Φ(p) ; résultats de mécanisme génériques (non-monotonicité, substitution, seuil de profondeur). **Extrapolé** : p = e^{−αs} ad hoc (un CPMM a une demande inverse dépendante des réserves) ; pas de bonus ni de liquidateur tiers ; pas d'oracle (p = prix de clearing) ; α fixe.

## Limites déclarées
Banques homogènes (p.21-22) ; pondération identique liquide/illiquide (n.10) ; pas de choix de portefeuille endogène (p.20) ; pas de temps réel (n.8) ; incitations ex ante non modélisées.

## Pour ADR-M020
- Fonde la forme « demande inverse exogène » et le point fixe en prix ; **ne fonde pas** une unicité du prix final ni la condition AFM.
- Le résultat « α = 0 ⇒ zéro contagion » est l'analogue exact de « Λ = 0 ⇒ point fixe = liquidable statique » (U-2).
- Le « ≥ 5 contreparties ⇒ canal-prix disparaît » n'est pas transposable sans réseau interbancaire (Aave = pas de créances croisées entre loopers) : à ne pas citer comme tel.
