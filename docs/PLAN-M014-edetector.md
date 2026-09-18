# PLAN — Lot M014 « e-détecteur de dérive » (ADR-M014) — G0 AgileGates, plan AVANT code

> Rattachement : ADR-M014 (pré-enregistrement ancré, commit G0 précède le code) ; ADR-M012 D6/(l) ; corpus doc 02/03/06. Régime : cycle
> complet (plan → checkpoint-1 validateur → worker → G2 fraîche → oracle → checkpoint-2 → G7). Deux PR sous R-25 : **M014-a** (docs,
> ce plan + ADR + corrections README M012-h) ; **M014-b** (code + tests). **Lot VPS-zéro** (ADR-M014 D5). Fenêtre de push fermée : tout
> reste local jusqu'à la réouverture par l'investisseur ; M014-a est le premier commit poussé alors.

> **Checkpoint-1 validateur (2026-09-18) : ACCEPTE-AVEC-CORRECTIONS C-1..C-12 — toutes foldées ci-dessous.** Recompute indépendant conforme
> (0,30 au 2025-04-30 ; 9,544601 ; 4,3834 ; KL 0,0226 ; ancre `09beb656…` à 10:48 UTC). C-1 bloquante : B(λ) centré. `error_origin` C-1 =
> orchestrateur (fiche → ADR → plan sans relecture de la ligne source SRR l. 1558).

## 0. Décisions investisseur (verbatim, non re-litigées)
- « go, full puissance une passe sans arret jusqu au livrable final, consultation advisor quand ça bloque » (2026-09-18).
- Le e-détecteur n'est pas le seul critère (question posée, non tranchée ⇒ chemin 1 : évidence citée, jamais déclencheur, ADR-M014 D2 ;
  aucune doctrine de « défaut » à sa lecture, C-5 → item (d′)).
- **M014-a contient (C-12)** : ADR-M014, ce plan, rectificatifs `docs/biblio/M012-h/README.md` (Thm 2.4 s'applique / Vovk Prop. 2a-2b) et
  `fiche-shin-ramdas-rinaldo-2022.md` (identité LR + **B centré − λp₀**, C-1 ; date 2024-10-11 pour la grille D1, C-2).

## 1. Sprint backlog (M014-b, worker Opus 4.8, contexte localisé)
Fichiers autorisés : `apps/sentinel/src/edetector.ts` (nouveau, **pur**), `apps/sentinel/src/instrument.ts` (ajout d'une section
`edetector`, garde `--out`), `apps/sentinel/test/sentinel.test.ts` (tests ajoutés + re-pin explicite), `docs/G1-lot-m014b.md`.
**Interdits** : `run.ts`, `timeline.ts`, `flow.ts`, `windows.ts`, `rpc.ts`, `deploy/`, `state.json` (shape 4 clés), `schemas/`, tout `apps/site`.

### 1.1 `edetector.ts` (pur, sans I/O)
- `export const EDET = { p0: 0.30, qL: 0.40, qU: 0.90, alphaArl: 1e-3, K: 12, startAfterDay: "2025-10-15" } as const` — constantes = ADR-M014 D1
  (recalculées ou lues, jamais collées ailleurs).
- `lambdaStar(q, p0)` = log(q(1−p0)/(p0(1−q))) ; `cumulant(lambda, p0)` = **log(1 − p0 + p0·e^λ) − λ·p0** (centré, SRR l. 1558, C-1 ; E_{p0}[L] = 1 exactement) ; `baseIncrement(x, lambda, p0)` =
  exp(λ(x − p0) − B(λ)) (SRR éq. (65) p. 24).
- Grille : K = 12 valeurs de λ **géométriquement** espacées entre λ*(qL) et λ*(qU), poids uniformes 1/K (Prop. 2.3 : mélange fixe = e-détecteur).
- `eCusumStep(prev, x)` : M_n = L_n · max(M_{n−1}, 1) par composante (Déf. 2.11 éq. (14) p. 9) ; `eSrStep(prev, x)` : M_n = L_n · (M_{n−1} + 1)
  (Déf. 2.12 p. 10). Le mélange = moyenne pondérée des K composantes. Calcul en **log** (log-sum-exp) pour éviter l'overflow.
- `runEDetector(sequence: readonly Miscover[])` → `{ n, misses, logM_sr: number[], logM_cu: number[], max_logM_sr, max_logM_cu, threshold:
  log(1/alphaArl), crossed_sr: index|null, crossed_cu: index|null }` ; `sequence` = misses des paires calmes à partir du départ D1.
- `bridgeMonoLambda(sequence, p0, p1)` : e-CUSUM à **une seule** composante λ*(p1) ; sert au test d'identité avec `pageCusumMax`.

### 1.2 `instrument.ts`
- Section `edetector` ajoutée à `Instrument` (jamais dans `state.json`) : constantes, ancre (`preregistered_at: "2026-09-18"`, `anchor_line_hash`
  D1), `design_check` (rejeu sur les 616 calmes commises : `max_logM_sr`, `max_logM_cu`, `crossed: null`, `label: "design check, no bound"`),
  et `disqualified_class` (p0 = 0,125 : premier franchissement de log 1000, date attendue 2024-10-11 avec la grille D1, C-2) — publié comme fait (D6).
- La section CUSUM + permutation existante devient `preJ0_cusum` **sans changement de valeurs** (label seulement ; re-pin explicite).
- **Garde `--out`** : refus si le chemin résolu est sous un répertoire nommé `public` (item ADR-M012 (l)/C-3) — testée.
- Aucune lecture de la timeline live (`--timeline` reste hors lot, rattaché à (l)).

### 1.3 Tests (oracle, `node --test`, déterministes)
1. **Identité pont** : `bridgeMonoLambda(calmMiss, 0.125, 0.25).max_logM_cu` == `pageCusumMax(calmMiss, 0.125, 0.25)` à 1e-9 (9,5446) —
   identité des **maxima** (Page S_n = max(0, log M^CU_n)). Si faux : transcription de (65) ou (14) fautive (B non centré donne 2,81) — bloque.
2. **Constantes = ADR** : `EDET` relu contre `docs/adr/ADR-M014-edetector-preregistration.md` (regex sur le tableau D1), jamais collé.
3. **Design check épinglé** : sur la fixture `7c33027a…`, `max_logM_sr` à p0 = 0,30 = 4,383 (±0,01), `crossed_sr === null` ; à p0 = 0,125 avec
   la **grille D1** le premier franchissement de log 1000 tombe sur la paire calme d'indice 279, jour de fenêtre de clôture **2024-10-11**
   (convention d'étiquetage déclarée ; recalculé, jamais collé) — C-2. **Amendement G2 (C-b, error_origin = plan)** : tout scalaire publié
   par la section est épinglé — `max_logM_cu` à p0 = 0,30 (recalculé en domaine linéaire, attendu 3,22763 ± 1e-6) et `crossed_cu` (null à
   0,30) ; le mutant « mélange e-CUSUM écrasé à K > 1 » doit rougir.
4. **Validité (C-3)** : (a) exact, déterministe : E_{p0}[L^(λ)] = 1 à 1e-12 pour les 12 λ de la grille ; (b) Monte-Carlo seedé (mulberry32),
   2000 suites i.i.d. Bernoulli(p), p ∈ {0,10 ; 0,30}, horizons H ∈ {100, 300} (H·alphaArl < 1) : fréquence de franchissement de
   log(1/alphaArl) ≤ H·alphaArl + 3σ (mesuré 0,188 ≤ 0,3 à H = 300, p = 0,30) ; (c) à p = 0,30, moyenne empirique de M_SR,n ≤ n
   (e-SR = somme d'e-processus ; pas « surmartingale »). Vérifie la validité, pas le délai.
   **Amendement G2 (C-a, error_origin = plan/checkpoint-1)** : à p = p0 l'égalité E[M_SR,H] = H est de bord et le test bascule selon la
   graine (mesuré : 3 dépassements sur 31 bases). Correctif : (c) devient deux assertions séparées — (c1) **validité** à p = p0 : moyenne
   terminale ≤ H·(1 + marge tail-honnête), marge = 3·(écart-type empirique de M_SR,H)/√N_sim, avec un plafond déclaré ; (c2) **témoin
   non-surmartingale** à p = p0 : moyenne terminale > 1. Critère d'acceptation : 0 basculement sur ≥ 30 bases de graine aux deux H
   (script de balayage rejoué au checkpoint-2).
5. **Grille** : K = 12, λ strictement croissants, géométriques (ratio constant à 1e-12), poids sommant à 1, tous λ > 0.
6. **Mutants (documentés dans G1, chacun rougit)** : **`− λp0` omis dans B(λ)** (rougit 1, 3, 4a) ; `>=`→`>` sur le seuil ; poids non normalisés ;
   λ ≤ 0 accepté ; K ≠ 12 ; `max(M,1)` → `M` dans e-CUSUM.
7. **Isolation** : `state.json` 4 clés (existant) ; `run.ts` n'importe ni `instrument` ni `edetector` (assertions statiques sur le source).
   **Aucun `git` dans l'oracle** (C-4) : le diff nul sur les 5 fichiers interdits est vérifié hors bande par le G2 et au checkpoint-2.
8. **Garde `--out`** : `main` refuse `.../public/x.json` (test via `parseArgs`/fonction extraite, sans écrire).
9. **Golden J0** : `step(initState(), faits J0 publiés)` reproduit `line_hash 09beb656…` — épingle l'engine contre ce lot (les faits J0 :
   `from_block 25993482`, `to_block 26000650`, burns/mints/supply de la timeline publiée, copiés dans le test avec leur source).

### 1.4 Vocabulaire et honnêteté
- Doctrine vérifiée par le G2 (C-6 : le scope `sentinel` de `vocab-banned.json` ne porte pas ces mots ; aucune extension du fichier dans ce lot) :
  « guarantee » nu interdit → « bound », « control » ; « probability » interdit sauf « never a probability » ; « typically » interdit ;
  `alpha_arl` nommé, jamais « α » nu dans le JSON ; `preregistration_commit: <sha M014-a>` dans la section (C-7).
- Aucune citation publique : le lot ne touche ni README, ni site, ni skill (D3 n'est publiée qu'à (l) sous go).

## 2. Critères d'acceptation (checkpoint-2)
- Oracle complet vert (`npm run ci`, lint 0, lang-gate 0) ; les 9 tests ci-dessus présents et non vacants (mutants rejoués par le G2).
- R-25 : M014-a et M014-b < 1205 chacun ; `error_origin` assigné au G7.
- VPS-zéro prouvé : `sentinel_sha` sur le VPS identique avant/après (lecture seule), `curl state.json` identique.
- Arbre gelé avant checkpoint-2 (défaut mesuré deux fois dans la passe précédente).

## 3. Risques MAST (revue de sprint)
- Dérive de spécification (le worker « améliore » la classe ou touche `timeline.ts`) → fichiers interdits + test 7.
- Vérification par le même contexte → G2 = instance fraîche, oracle non-LLM (tests 1, 3, 4).
- Pré-enregistrement a posteriori → commit M014-a précède M014-b par son hash ; ancre D1.
- **Artefact mouvant pendant une vérification** (mesuré au checkpoint-1 : README/fiche modifiés pendant la revue) → les artefacts d'un
  checkpoint sont gelés et listés par sha dans la demande, avant invocation (C-11).

## 4. Séquence
1. Checkpoint-1 validateur sur ce plan + ADR-M014 (avant tout code). 2. Commit M014-a (docs). 3. Worker M014-b (mission localisée).
4. G2 fraîche (worker Opus 4.8, contexte neuf) + oracle + mutants. 5. Corrections. 6. Checkpoint-2 validateur (re-exécute l'oracle).
7. G7 + journal + memstack. 8. Push à la réouverture (M014-a puis M014-b), miroir public en plain sync.
