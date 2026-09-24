# Lecture — Tibshirani, Barber, Candès, Ramdas (NeurIPS 2019, arXiv:1904.06019) [lu] ; Barber, Candès, Ramdas, Tibshirani (Ann. Stat. 2023, arXiv:2202.13415v5) [lu §1-5, 7 ; survol §6, annexes]
Lecteur Sonnet 5, 2026-09-19.

## 2019 — covariate shift
- Cadre p.3 : même Y|X, poids w(x) = dP̃_X/dP_X. Définition 1 (p.12) échangeabilité pondérée ; Lemme 2 (p.12) : tirages indépendants non i.d. Z_i ~ P_i ≪ P_1 sont weighted-exchangeable avec w_i = dP_i/dP_1 (général).
- **Théorème 2 (p.13)** : sous échangeabilité pondérée, bande à quantile pondéré ⇒ P(Y_{n+1} ∈ C_n) ≥ 1−α. Pas de borne supérieure générale (Rem. 5).
- Poids estimés : aucun théorème ; empirique seulement (airfoil, 91,0 % pour cible 90 %, p.8).
- Transposabilité événement e vs e′ : permis par la généralité du Lemme 2 / Thm 2 si le rapport inter-événements est connu ; §4 esquisse Z→X→Y (régime) ; **extrapolation** pour un petit nombre de groupes discrets, poids estimés sans borne, laissé au « future work » (p.14).

## 2023 — beyond exchangeability
- **Théorème 2 (p.15)** : poids fixes w_i ∈ [0,1] non data-dependent, normalisés w̃_i ; P(Y_{n+1} ∈ C_n) ≥ 1 − α − Σ w̃_i · d_TV(R(Z), R(Z^i)) ; forme lâche sur les données brutes : gap ≤ Σ w̃_i · d_TV(Z, Z^i) — **c'est la forme citée par MONARK** (`STABLE_RUN_COMMITTED_CORE`). Valable split et non-symétrique (swap aléatoire, éq. 16-18).
- **Théorème 3 (p.16)** : borne supérieure < 1 − α + w̃_{n+1} + Σ w̃_i d_TV.
- Nuance sur la citation MONARK : « 1−α seulement si d_TV = 0 » porte sur la **borne garantie**, pas sur la couverture réalisée (p.17). Pas de contradiction.
- Poids : décroissance géométrique recommandée sous dérive (p.17-18) ; **borne non estimable** en pratique, connaissance qualitative seulement ; choix optimal ouvert ; poids data-dépendants ⇒ d_TV conditionnelle, unification laissée au futur (§4.5).
- Chiffres (§5) : simulations cible 90 % : CP non pondéré 0,835 (changepoints) / 0,838 (drift) vs NexCP ≈ 0,88-0,91 ; ELEC2 : CP 0,852, NexCP 0,890-0,908 ; élections 2020 : CP 0,743, NexCP 0,820-0,840.
- **Blocs / événements : not_found** — Z^i échange un seul point ; données groupées renvoyées à Mondrian (Vovk 2005) et à **Dunn et al. 2022** (« two-layer hierarchical models »), écartés comme « very different ideas » (p.10).
- Limites : borne additive (multiplicative seulement en annexe C, Huber) ; pas de méthode pour savoir a priori si le gap est petit (p.18) ; autorégressifs non traités (p.14).

## Pour ADR-M020
- Affirmable : couverture intra-événement à poids unitaires = instance non pondérée du Thm 2 (2023), exactement ; score non-symétrique admis.
- Avec prudence : le gap inter-événements se **rapporte** dans le vocabulaire 2023 (somme pondérée de d_TV) ; le mécanisme de poids par événement = Lemme 2 (2019) si le rapport est connu.
- **Extrapolation non prouvée** : leave-one-event-out = swap de bloc, absent des deux papiers → (a) dérivation propre par couplage maximal (§6), ou (b) **procurement formé : Dunn, Wasserman, Ramdas et al. 2022, « Distribution-free prediction sets for two-layer hierarchical models » (JASA / arXiv:2010.06001)** — identité à confirmer par le chercheur.
- not_found : garantie sous poids estimés ; définition nommée de d_TV ; estimation de la borne.
