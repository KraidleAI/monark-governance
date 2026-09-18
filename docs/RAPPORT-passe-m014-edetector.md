# Rapport de passe — MONARK — Passe M014 : e-détecteur de dérive (Shin–Ramdas–Rinaldo) pré-enregistré

- **Période** : 2026-09-18 (une passe, sans arrêt, go investisseur « full puissance une passe sans arrêt jusqu'au livrable final »)
- **Objectif (G0)** : ADR-M014 — figer AVANT toute donnée post-calibration un e-détecteur de dérive à borne d'ARL non asymptotique sans i.i.d.
  (SRR Thm 2.4), comme instrument étiqueté hors état, évidence citée jamais déclencheur ; lot VPS-zéro ; publication différée à ADR-M012 (l).

## 1. Réalisé
- **Procurement PR-M012-h lue intégralement** (chercheur `claude-sonnet-5`) : Lorden 1971 (12 p., rendu-image, scan sans OCR déclaré), SRR
  2022 v4 (50 p.), Vovk 2012 (16 p.) ; fiches + README `docs/biblio/M012-h/` ; ADR-M012 (h) clos. Deux consultations advisors (ingénierie,
  DeFi) : « maintenant pour le pré-enregistrement, T ≥ 7 pour la publication ».
- **M014-a `9d67302`** (docs-only, ancre) : ADR-M014 (classe p0 = 0,30, (q_L, q_U) = (0,40 ; 0,90), alpha_arl = 10⁻³, e-SR/e-CUSUM, K = 12,
  cumulant centré, ancre `line_hash 09beb656…` à T = 0), PLAN-M014, rectificatifs README/fiche SRR. Checkpoint-1 : ACCEPTE-AVEC-CORRECTIONS
  C-1..C-12 foldées (C-1 bloquante : B(λ) centré − λp₀).
- **M014-b `3846be5`** (worker `claude-opus-4-8[1m]`) : `apps/sentinel/src/edetector.ts` (pur), section `edetector` dans `instrument.ts`,
  garde `--out` hors `public/`, 10 tests. G2 fraîche (`claude-opus-4-8[1m]`, `docs/G2-lot-m014b.md`) : approuvé avec C-a/C-b ; checkpoint-2 :
  ACCEPTE-AVEC-CORRECTIONS C-i..C-v, toutes appliquées (G2 tracé, G1 rectifié, test 10 section publiée, snapshot `state.json` après, nits ici).
- **Chiffres, tous recalculés par trois instances indépendantes** (worker, G2 en domaine linéaire, validateur) : identité pont 9,544601 ;
  design check p0 = 0,30 : max log e-SR 4,383361, max log e-CUSUM 3,227631, aucun franchissement de log 1000 ; classe disqualifiée p0 = 0,125 :
  franchissement à la paire calme 279 = 2024-10-11 ; E_{p0}[L] = 1 à 2e-16 ; Monte-Carlo H·alpha_arl ≤ 0,3 tenu à 13–18 σ ; balayage 4c 160
  essais 0 basculement ; Golden J0 `line_hash` reproduit.
- **VPS-zéro prouvé** : 6 sources de la sentinelle sur le VPS identiques avant/après (`instrument.ts` = `ed828df1…` = HEAD pré-lot) ;
  `state.json` publié identique (`7abd7ab4…`) ; aucune action sortante (une lecture GET de la timeline publique, test 9).

## 2. Gates
| Gate | État | Preuve |
|---|---|---|
| G0 | ☑ | ADR-M014 + PLAN-M014, checkpoint-1 avant code |
| G1 | ☑ | `docs/G1-lot-m014b.md` (mutants M1–M6, W1–W3, oracle brut) ; journal de provenance |
| G2 | ☑ | `docs/G2-lot-m014b.md`, relecteur identifié, contexte frais |
| G3 | ☑ | `npm run ci` 283/283, lint 0, lang-gate 0, `git diff --check` |
| G4 | ☑ | lint-ratchet 69/69 ; 0 duplication (le pont réutilise `pageCusumMax`) ; churn 0 |
| G5 | ☑ | §3 |
| G6 | ☑ | aucune dépendance nouvelle (R-8) ; aucun secret ; vocabulaire vérifié |
| G7 | ☑ | §5 |

## 3. Clôture zéro dette
### 3.a Procurement
Aucune nouvelle. PR-M012-h close (§1).
### 3.b Items formés (déclencheur → action)
- **(l) ADR-M012** : `startAfterDay` déclaré, appliqué par le rejeu `--timeline` ; publication `instrument.json` + phrase D3 à T ≥ 7 sous go ;
  `preregistration_commit` en 40 hex à la publication ; `design_check.crossed` à qualifier `crossed_sr` (ou publier `crossed_cu`) — ce qui rend
  aussi le mutant W1 discriminant (à p0 = 0,30 les deux sont nuls, no-op mesuré) ; consigner l'ordre des commits M014-a → M014-b au push.
- **Nits G2 (code figé ce lot)** : `bridgeMonoLambda` doit passer par la garde λ > 0 ; `makeGrid(lo, hi, 1)` contrôle `hi > lo` ; séquence
  vide → `-Infinity`. Déclencheur : premier lot touchant `edetector.ts` (au plus tard (l)).
- **Items ADR-M014** : (a) borne de délai Alg. 3 sur demande ; (c) taux `non_evaluable` par régime avec (l) ; (d) union des déclencheurs et
  (d′) doctrine du défaut — décision investisseur.
- **Règle process (investisseur 2026-09-18)** : toute procurement formée est signalée avant la production du code dépendant (consignée memstack ;
  amendement du corpus doc 03 §3 à la main du mainteneur).
### 3.c Dette délibérée par ADR
| ADR | Principal | Propriétaire | Échéance |
|---|---|---|---|
| ADR-M014 D3 | borne ARL seule ; délai ≈ 394 paires calmes pour 0,30 → 0,40 dit en clair | orchestrateur | revue à (l) puis à chaque segment |

## 4. Métriques G4
| Métrique | Passe N−1 (Narabi + ACI) | Passe N | Tendance |
|---|---|---|---|
| Duplication nouvelle | 0 | 0 | stable |
| Churn < 2 sem. | 1 lot reverté | 0 | amélioration |
| Ratio refactoring/ajout | faible | ajout pur (module + tests), 0 refactor | à suivre |

## 5. Verdict final (G7)
**Passe close.** L'e-détecteur est pré-enregistré et ancré avant tout tirage post-calibration, implémenté, vérifié par trois instances
indépendantes et un oracle non-LLM, sans un octet changé en production. **`error_origin`** : orchestrateur/planificateur — C-1 (cumulant non
centré transcrit fiche → ADR → plan), C-a/C-b (plan approuvé au checkpoint-1 avec un test à marge nulle et un scalaire publié non épinglé),
marge sans `/H` (`43349a9`), passation G2 non tracée (C-i/C-ii), « MX2 » cité sans définition ; G2 — épingle fonction acceptée pour une
exigence section (C-iii) ; worker — aucun défaut. Prochaine étape : push M014-a puis M014-b à la réouverture de la fenêtre (avant tout
tirage (l)), puis (l) à T ≥ 7.
