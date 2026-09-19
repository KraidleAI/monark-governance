# Lecture — Dunn, Wasserman, Ramdas (2022), « Distribution-Free Prediction Sets for Two-Layer Hierarchical Models », JASA, DOI 10.1080/01621459.2022.2060112 = arXiv:1809.07441v4, 61 p. [lu §1-7 ; annexes A/B survol]
Lecteur Sonnet 5, 2026-09-19. Code : github.com/RobinMDunn/ConformalTwoLayer.

## Modèle (p.1-2)
P₁…P_k ~ Θ iid ; D_j iid ~ P_j ; **« the values of n_j are fixed prior to data collection »** — hypothèse violée pour Ukemi (n_k = positions liquidées, endogène à l'événement) → limite d'applicabilité à tracer. Tâche 1 = nouveau groupe ; Tâche 2 = nouvelle observation d'un groupe observé.

## Théorèmes (garanties toutes marginales sur Θ ; aucune conditionnelle au groupe)
| # | Méthode / tâche | Garantie | Non trivial si | p. |
|---|---|---|---|---|
| 3 | Double conformal (n_j égaux), T1 | ≥ 1−α exact | k ≥ 4/α−1 et n₁ ≥ 4/α−1 | 9 |
| 4/7/8 | Pooling CDF, T1 | → 1−α quand k → ∞ ; **aucune garantie à k fini** ; sous-couvre k ≤ 35-50 | — | 10, 17-18 |
| 5 | Subsample once, T1 | ≥ 1−α exact | k ≥ 2/α−1 | 11 |
| 6 | Repeated subsample, T1 | ≥ 1−2α exact (≈ 1−α empirique) | k > 2/α−1 | 11 |
| 9/10 | Subsample once/repeated, T1 supervisé | ≥ 1−α / ≥ 1−2α | k > 1/α−1 | 19 |
| 11 | Isolate single group, **T2** | ≥ 1−α exact | **n₁ > 1/α−1**, indépendant de K | 23 |
| 12 | James–Stein shrinkage, T2 | ≥ 1−α exact | n₁ > 1/α−1 et k ≥ 2 | 24 |
Sous le seuil, les méthodes 0/2/3 restent **valides** mais rendent un ensemble **dégénéré (ℝ)**.

## Pour MONARK (calcul direct des seuils ; le papier ne simule jamais k < 5 : not_found)
- **Nouvel événement** (T1) : K = 3 → non trivial seulement si α ≥ 0,5 (non-sup) / α > 0,25 (sup) ; K = 6 → α ≥ 0,286 / > 0,143 ; K = 20 → 90 % tout juste atteint en non-sup (20 ≥ 19), confortable en sup ; double conformal hors de portée (k ≥ 39). À α = 0,01 : k ≥ 199 (non-sup) / > 99 (sup).
- **Événement déjà observé** (T2) : seuil ne dépend que de n₁ (> 9 positions pour 90 %, > 99 pour 99 %) — utilisable même à K = 3 ; shrinkage dès k ≥ 2.
- Données réelles (k = 18, sommeil, Table 1 p.28, cible 0,90) : CDF pooling 0,87 ; subsample once 0,94 ; repeated 0,95.
- n_j inégaux : pooling et subsamplings tolérants ; double conformal exige l'égalité.

## Limites / ouverts (p.29-30)
Efficacité asymptotique ouverte ; T2 supervisée empruntant la force inter-groupes = problème ouvert. Mondrian : une mention (Related Work), aucun lien technique (not_found). Barber 2021a (jackknife+) justifie le repeated subsampling ; Gupta–Kuchibhotla–Ramdas 2020 = origine.

## Conséquence ADR-M020
La phrase d'honnêteté de la classe (b) : « sur un nouvel événement, aucun ensemble non trivial n'est garanti avec K < 1/α − 1 événements (Dunn 2022 Thm 5/9) ; le gate abstient ; la couverture énoncée vaut pour une position d'un événement observé de n > 1/α − 1 positions (Thm 11 ≡ Vovk), sous l'hypothèse n_j fixé a priori, ici violée et déclarée ».
