# Rapport S2 — HIKAE (`fixtures-synth`)

> Harnais **jetable** (R-22). Fixtures **synthétiques par graine** (déclaré) — la sonde J0 sur Coinbase (décision investisseur (a)) est ultérieure. **Résultat négatif = résultat.** Aucun chiffre n'est présenté comme une probabilité de vérité (09). Généré par `scripts/s2-report.mjs` ; le test `s2_report_reproducible` exige l'égalité octet à octet avec ce fichier.

## 1. Paramètres
Communs : α = 0.1 · n_min = 50 · τ = 1 · route = fixtures synthétiques (aucun réseau) · harness_version = `fixtures-synth` · date de génération (injectée) = 2026-09-04.
S2a : graine = 101 · n = 300 · accuracy déclarée du tirage = 0.96 · n_calib = 150.
S2b : bougies seedées (graine = 202, n = 700, close_time₀ = 1756944000, prix₀ = 100000, pas max = 0.004, taux plat = 0.01) · n_calib par strate = 60 · n_calib poolé = 300. Prédicteurs RÉELLEMENT exécutés : `internal:momentum-4c` (695 `Prediction` émises, 4 fenêtres de chauffe, 0 sans direction) ; `internal:oracle-didactique` (687 émises, 8 sans direction).
M2 (mutant labels inversés) : graine = 42 · n = 120 · accuracy déclarée = 0.95 · n_calib = 60 · campagnes journalisées `M2-clean` / `M2-flip`.

## 2. Journal brut
Une ligne par point et par campagne (colonnes : campaign, index, close_time, hour_utc, stratum, predictor_id, yhat, y, role ∈ {calib, holdout, excluded}, score, set, covered, action) : [`docs/S2-journal-fixtures-synth.tsv`](S2-journal-fixtures-synth.tsv) — **2393 lignes**, sha256 = `160034090a179f4982daeeaf6719dce70cd8161b10b93c142b2b4ad570618651`. Tout chiffre ci-dessous se recalcule depuis ce journal sans croire HIKAE (D10).

## 3. S2a — plomberie (classe binaire synthétique déclarée)
n_calib = 150 · m = 150 · q̂ = 0 · couverture empirique (abstentions incluses) = 96.0 % · abstention (τ=1) = 0.0 % · non_evaluable = 0.
_D10 : n = 300 · étiquette = `fixtures-synth/S2a` · date = 2026-09-04 · journal sha256 = `160034090a179f49…`_

## 4. S2b — beachhead `btc-dir-15m` (bougies synthétiques, `internal:momentum-4c` exécuté)
| strate | n_calib | m | q̂ | couverture (abst. incl.) | abstention | couv. cond. à l'action* |
|---|---|---|---|---|---|---|
| asia | 60 | 185 | 1 | 100.0 % | 100.0 % | — |
| americas | 60 | 162 | 1 | 100.0 % | 100.0 % | — |
| **poolé** | 300 | 387 | 1 | 100.0 % | 100.0 % | — |

*\* couverture conditionnelle à l'action = chiffre de desk, **PAS la garantie CP** (H2.3).*
_D10 : n = 687 · étiquette = `fixtures-synth/S2b-pooled` · date = 2026-09-04 · journal sha256 = `160034090a179f49…`_

## 5. Mutants (contrôles négatifs semés)
| id | mutant | verdict |
|---|---|---|
| M1 | under_calib (n=10<50 ⇒ pas de q̂) | PASS ({"reason":"under_calib"}) |
| M2 | labels inversés (hold-out) ⇒ couverture casse | PASS (coverage clean=0.983 → flipped=0.017) |
| M3 | timeout ⇒ ABSTAIN upstream_timeout | PASS (abstain/upstream_timeout) |
| M4 | parse non-évaluable ⇒ ABSTAIN non_evaluable | PASS (abstain/non_evaluable) |
| M5 | p_correct injecté ⇒ serializeVerdict lève (voir test no_p_correct_field) | PASS (exercé sur le contrat gelé dans le test dédié) |

_D10 : n = 120 · étiquette = `fixtures-synth/M2-clean+M2-flip` · date = 2026-09-04 · journal sha256 = `160034090a179f49…`_

## 6. Décision (e) — deux blocs étiquetés
### 6a. Silence réel (`internal:momentum-4c`, exécuté)
Prédicteur momentum sur marche aléatoire ≈ pièce : n_calib = 300 · m = 387 · q̂ = 1 · couverture = 100.0 % · abstention = 100.0 % · commit = 0.0 %. Attendu : **silence calibré quasi total** (au score 0/1, q̂=0 exige ≤ n − ⌈(n+1)(1−α)⌉ erreurs de calibration : n=300, α=0.1 ⇒ ≤ 29). La démo ne montre pas de position — c'est le produit (le droit de n'avoir aucun avis).
_D10 : n = 687 · étiquette = `fixtures-synth/S2b-pooled` · date = 2026-09-04 · journal sha256 = `160034090a179f49…`_

### 6b. Démo de mécanisme (`internal:oracle-didactique` — **pas un produit**)
Oracle didactique (ŷ=y par construction) **exécuté sur la même série** : n_calib = 300 · m = 387 · q̂ = 0 · couverture = 100.0 % · abstention = 0.0 % · commit = 100.0 %. Il rend le chemin COMMIT visible ; il ne dit rien du marché.
_D10 : n = 687 · étiquette = `fixtures-synth/S2b-oracle` · date = 2026-09-04 · journal sha256 = `160034090a179f49…`_

Les 9 états de mécanisme ci-dessous sont produits par le vrai `gate()` sur des verdicts à **scores déclarés** (COMMIT : calibration 47/50 ⇒ q̂=0 ; DEFER : 25/50 ⇒ q̂=1) — **pas** par l'oracle (digest figé, test 14) :
| état | action | raison | budget restant |
|---|---|---|---|
| 01-commit-up | commit | covered | 0.1 |
| 02-commit-up-b | commit | covered | 0.08 |
| 03-commit-up-lowbudget | commit | covered | 0.02 |
| 04-defer | defer | set_too_large | 0.1 |
| 05-defer-b | defer | set_too_large | 0.06 |
| 06-abstain-intent | abstain | intent_not_in_region | 0.1 |
| 07-abstain-timeout | abstain | upstream_timeout | 0.1 |
| 08-abstain-budget | abstain | budget_exhausted | -0.02 |
| 09-under-calib | abstain | under_calib | 0.1 |

**Tête** (sur m = 387 hold-out, `internal:momentum-4c`) : couverture empirique = 100.0 % vs 1−α = 90.0 % · abstention (τ=1) = 100.0 % — trois chiffres, jamais fusionnés.
