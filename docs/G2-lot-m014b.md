# G2 — Lot M014-b « e-détecteur de dérive » (revue 100 %, relecteur ≠ générateur)

- **Date** : 2026-09-18 · **Relecteur** : instance séparée, contexte frais, modèle résolu **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8`,
  effort max ; R-1 déclaré) · **Générateur** : autre instance `claude-opus-4-8[1m]` (G1-lot-m014b) · **Orchestrateur** : `claude-fable-5-1`.
- **Base** : branche `lot/m014-edetector`, HEAD `9d67302` (M014-a, docs-only) + arbre non committé. Aucun fichier modifié par le relecteur, aucun
  commit (R-20) ; mutants rejoués par copie `.bak` + sha256 (jamais `git checkout` : le lot est non suivi).
- **Artefacts revus (sha256)** : `apps/sentinel/src/edetector.ts` `9cea5ada8fd7c2c94934ff6d16c38bad715cbe12e84fe39fc60d2e4dc6ae6454` ;
  `apps/sentinel/src/instrument.ts` `5418b0fb860f9839bed992120f8ab9fd749fb282d4bd7f29bf01993f18783452` ;
  `apps/sentinel/test/sentinel.test.ts` `201fe787e2eaa65a55f0d469e33d2c0238096f6ffe21902b41577402593a5118` (version revue, avant C-a/C-b) ;
  `docs/G1-lot-m014b.md` `4bdc6fc9be0c57409e487c092daec4370ab614f2c48026a22b0db1d7dc038af6`.
- **Checklist** : `templates/checklist-revue-G2.md` du corpus, revue 3 étapes AgileCoder intégrée.

## Verdict : APPROUVÉ AVEC CORRECTIONS (C-a, C-b) — toutes deux `error_origin = plan/checkpoint-1`
Code algorithmiquement correct : chaque nombre reproduit indépendamment (domaine linéaire, sans importer `edetector.ts`), 6/6 mutants du plan
attrapés comme journalisés, oracle vert, isolation D5, vocabulaire, R-25, provenance conformes ; 5 déviations G1 honnêtes. Les corrections ne
touchent que `sentinel.test.ts`.

- **C-a** — test 4c fragile à la graine : à p = p0 = 0,30, E[M_SR,H] = H exactement (marge nulle) ; mesuré 3 dépassements sur 31 bases de graine
  (H = 100 → 102,51 à base 12372 ; H = 300 → 322,64 à 12350 et 383,61 à 12367). Origine : PLAN §1.3 test 4(c) approuvé au checkpoint-1.
  Critère du correctif : 0 basculement sur ≥ 30 bases aux deux H.
- **C-b** — `design_check.max_logM_cu` publié mais épinglé par aucun test : le mutant MX1 (mélange e-CUSUM écrasé à K > 1) survit vert.
  Correctif : épingler 3,2276310958993952 (recalculé en domaine linéaire) et `crossed_cu`, puis rejouer MX1.
- Nits non bloquants : `bridgeMonoLambda` contourne la garde λ > 0 (p1 < p0 non exercé) ; `makeGrid(lo, hi, 1)` retourne avant le contrôle
  `hi > lo` ; `design_check.crossed` = `crossed_sr` sous nom non qualifié ; séquence vide → `-Infinity`.

## Recomputes indépendants (attendu / obtenu)
| Quantité | Attendu | Obtenu | OK |
|---|---|---|---|
| calmMiss / misses | 616 / 63 | 616 / 63 | ✓ |
| Page CUSUM (0,125 ; 0,25) | 9,5446 | 9,544601061384807 | ✓ |
| e-CUSUM mono-λ* max | = Page à 1e-9 | 9,544601061384803 (Δ 3,6e-15) | ✓ |
| B non centré (prédiction M1) | ~2,81 | 2,8103300742025197 | ✓ |
| λ* LR x = 1 / x = 0 | 0,6931472 / −0,1541507 | 0,6931471805599454 / −0,15415067982725836 | ✓ |
| e-SR max p0 = 0,30 | 4,383 ± 0,01 | 4,38336126728203 ; crossed null | ✓ |
| e-CUSUM max p0 = 0,30 | (non épinglé → C-b) | 3,2276310958993952 | ✓ |
| E_p0[L] − 1 (12 λ) | < 1e-12 | 4,44e-16 | ✓ |
| Disq. p0 = 0,125 : 1er franchissement | indice 279, 2024-10-11 | 279, 2024-10-11 (voisins 10-10 / 10-12) | ✓ |
| Disq. max_logM_sr | 10,7742 | 10,774170077497665 | ✓ |
| Seuil log(1/alpha_arl) | 6,907755278982137 | 6,907755278982137 | ✓ |
| MC 4b marges | H·α < 1 | 0,171 vs 0,325 ; 0,051 vs 0,115 (13 à 18 σ) | ✓ |
| Golden J0 line_hash | 09beb656…da82 | reproduit par `step(initState(), J0)` | ✓ |

## Mutants (suite complète rejouée)
| # | Mutation | Test(s) rougissant | pass/fail |
|---|---|---|---|
| M1 | B(λ) sans − λp0 | bridge (1), design_check (3), baseline_unit_mean (4a) | 30/3 |
| M2 | `>=` → `>` (global) | mutant_guards (6) seul → prédicat unique prouvé | 32/1 |
| M3 | poids fill(1/K) → fill(1) | design_check, grid_shape, montecarlo, sr_sum | 29/4 |
| M4 | garde λ > 0 retirée | mutant_guards | 32/1 |
| M5 | K 12 → 11 | constants_match_adr, grid_shape | 31/2 |
| M6 | e-CUSUM max(M,1) → M | bridge | 32/1 |
| MX1 (relecteur) | mélange e-CUSUM écrasé (K > 1) | **aucun — survit** → C-b | 33/0 |
| MX1-contrôle | mélange e-SR écrasé | design_check, sr_sum | 31/2 |
| MX2 (relecteur) | garde `--out` : `===` → `.includes` | out_guard (8) | 32/1 |
Restauration après chaque mutant vérifiée par sha (`9cea5ada…`, `5418b0fb…`).

## Déviations G1 (§8 + §6) — adjudication
| Déviation | Verdict |
|---|---|
| 4c lu au horizon H | rationale acceptée ; fragilité à la graine non divulguée → C-a |
| clés `cusum` conservées, label pré-J0 | acceptée (PLAN §1.2 : label seulement, re-pin explicite) |
| test 2 `t.skip` hors gouvernance | acceptée (skipped 0 en dépôt) |
| signature `runEDetector(seq, p0, grid, alphaArl?)` | acceptée (classe disqualifiée ; un seul prédicat `firstCrossing`, prouvé par M2 global) |
| `startAfterDay` non appliqué | acceptée : appartient à ADR-M012 (l), reste formé |
| une lecture GET de la timeline publique (test 9) | acceptée : lecture du site public, faits auto-vérifiants par le hash ; pas une action sortante D5 |

## AgileCoder 3 étapes
1. Base : chaque export documenté, imports résolus, aucune implémentation vide. 2. Sprint backlog : rien hors PLAN §1 ; `foldSeriesWithDays`
in-scope ; diff nul sur les fichiers interdits. 3. Acceptation : recomputes + mutants ; seuls C-a et C-b défaillants.

## Oracle brut
`npm run ci` 282/282, 0 skipped ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `lang-gate --scope root` 0 ; `git diff --check` propre ;
`sentinel.test.ts` 33/33 (MC 2,35 s ; sr_sum 1,17 s). Isolation : `git status --porcelain` = 4 chemins ; `run.ts` n'importe ni instrument ni
edetector ; `stateSummary` 4 clés ; `buildInstrument` 2 appelants (main + test). Vocab : 0 guarantee/probability/typically ; `alpha_arl` nommé ;
`preregistration_commit = "9d67302"`. R-13 aucun TODO ; R-8 aucun manifeste touché. **R-25 : 476 + 16 = 492 < 1205**.

## Suite (orchestrateur)
C-a/C-b appliquées par le worker (test `e72db91e…`, balayage 160 essais 0 basculement, MX1 rougit) ; checkpoint-2 rendu ACCEPTE-AVEC-CORRECTIONS
(C-i ce document ; C-ii en-tête G1 ; C-iii test section-level ; C-iv snapshot state après ; C-v nits → rapport de passe).
