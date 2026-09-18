# G1 — Journal de génération, lot M014-b (e-détecteur de dérive)

> Rattachement : ADR-M014 (pré-enregistrement ancré) ; PLAN-M014-edetector.md §1 ; corpus doc 02 (G1) / doc 03.
> Modèle épinglé worker : **`claude-opus-4-8[1m]`, effort max** (préfixe `claude-opus-4-8` vérifié, R-1). Opus 5 banni.
> Date de génération : 2026-09-18. Réviseur G2 : instance fraîche `claude-opus-4-8[1m]` (contexte frais, relecteur ≠ générateur) — rapport `docs/G2-lot-m014b.md`.
> Branche `lot/m014-edetector`, base HEAD = chaîne d'amendements PLAN de l'orchestrateur (`43349a9` C-a/C-b →
> `abde49e` marge/H + winsorisation) au-dessus de `9d67302` (= M014-a, l'ancre de pré-enregistrement ;
> `preregistration_commit` du code = `9d67302`, byte-figé). Lot **VPS-zéro** : aucune action sortante hormis UNE
> lecture GET de la timeline publiée (test 9, ci-dessous). Le worker ne committe pas (R-20).

## 1. Fichiers du lot (sha256)

| Fichier | État | sha256 |
|---|---|---|
| `apps/sentinel/src/edetector.ts` | nouveau (pur, sans I/O) | `9cea5ada8fd7c2c94934ff6d16c38bad715cbe12e84fe39fc60d2e4dc6ae6454` |
| `apps/sentinel/src/instrument.ts` | modifié (section `edetector`, garde `--out`, re-label pré-J0) | `5418b0fb860f9839bed992120f8ab9fd749fb282d4bd7f29bf01993f18783452` |
| `apps/sentinel/test/sentinel.test.ts` | modifié (tests 1–10 + re-pin 12f ; **corrections G2 C-a/C-b + checkpoint-2 C-iii**) | `1d726b61da2a7f13ecbd991ed120d6f4f136ebbd46b647c3f0100dce42bef989` |
| `docs/G1-lot-m014b.md` | ce journal (exclu de R-25) | (auto) |

Fichiers INTERDITS non touchés (vérifié par `git status --short` = 2 `M` + 2 `??` = ces 4 fichiers, aucun autre) : `run.ts`, `timeline.ts`,
`flow.ts`, `windows.ts`, `rpc.ts`, `deploy/`, `schemas/`, `apps/site`, `state.json` (forme 4 clés, test 12e/12f inchangés),
`vocab-banned.json`.

## 2. Constantes (ADR-M014 D1, jamais collées)

`EDET = { p0: 0.30, qL: 0.40, qU: 0.90, alphaArl: 1e-3, K: 12, startAfterDay: "2025-10-15" }`. Le **test 2**
(`sentinel_edetector_constants_match_adr`) relit ces six valeurs par regex sur le tableau D1 de l'ADR (commas
françaises → point ; exposant `10⁻³` mappé depuis les caractères Unicode superscript U+207B/U+00B3 vers `"1e-3"`)
et les compare à `EDET`. Aucune valeur n'est écrite en dur dans le test. (Garde `existsSync` : l'ADR est de la
gouvernance, absente de l'export public — le contrôle de provenance tourne dans le dépôt source, là où l'oracle de
mission tourne ; le test 42 export-public reste vert.)

## 3. Cumulant CENTRÉ et identité pont (test 1, 4a)

`B(λ) = log(1 − p0 + p0·e^λ) − λ·p0` (SRR l. 1558, C-1) ⇒ `logL(x,λ,p0) = λ(x − p0) − B(λ) = λ·x − log(1 − p0 + p0·e^λ)`.
- **Test 4a** (`sentinel_edetector_baseline_is_unit_mean`) : `E_{p0}[L^(λ)] = 1` pour les 12 λ de la grille,
  **max |E[L] − 1| = 2.22e-16** (< 1e-12). Le centrage donne la moyenne unité exactement.
- **Test 1** (`sentinel_edetector_bridge_equals_page_cusum`) : `bridgeMonoLambda(calmMiss, 0.125, 0.25).max_logM_cu`
  = **9.544601061384807** == `pageCusumMax(calmMiss, 0.125, 0.25)` = **9.544601061384807** (diff 0, tol 1e-9). À λ*(p1)
  l'incrément de base EST le rapport de vraisemblance Bernoulli (SRR p. 25), donc le max e-CUSUM = le CUSUM de Page.
  **B non centré donnerait 2.8103** — mesuré au mutant M1 ci-dessous (bloque).

## 4. Design check (test 3, recalculé depuis la fixture `7c33027a…`, jamais collé)

Fold du `step` réel sur les 616 paires calmes commises (`calmMiss.length = 616`, `misses = 63`, `eStatic.length = 694`),
avec le jour de fenêtre de clôture de chaque paire aligné 1:1 (croissance de `state.calmMiss`, `timeline.ts` intouché).

| Classe | Grille D1 | max log M_SR | franchissement log(1/α)=6.907755 |
|---|---|---|---|
| **p0 = 0.30** (borne) | [λ*(0.40), λ*(0.90)] géom. K=12 | **4.383361** (spec 4.383 ± 0.01) | **aucun** (`crossed_sr === null`) ; label « design check, no bound » |
| **p0 = 0.125** (disqualifiée) | [λ*(0.40), λ*(0.90)] géom. K=12 | 10.7742 | **indice 279**, jour de clôture **2024-10-11** (voisins : 278→2024-10-10, 280→2024-10-12) |

Ces deux résultats sont RECALCULÉS par le test 3 ; ils **concordent exactement** avec l'ADR-M014 D6/C-2 (4,383 ;
indice 279 ; 2024-10-11). `threshold_log = log(1/alphaArl) = 6.907755278982137`. Aucune divergence à rapporter.

**Amendement G2 (C-b, error_origin = plan)** : tout scalaire publié est épinglé. `max_logM_cu` à p0=0.30 est
**recalculé en domaine linéaire** par le test comme oracle indépendant (mélange e-CUSUM linéaire, max = **25.219843**,
< 1e6 donc pas d'overflow) : `log(25.219843) = 3.2276310958993952` == `d30.max_logM_cu` (diff 0) et est épinglé au
littéral **3.2276310958993952 ± 1e-9** ; `d30.crossed_cu === null`. Nouveau mutant **MX1 « mélange e-CUSUM écrasé
à K > 1 »** (`mix_cu = logSumExp(mix_cu, logW[j]+cu[j])` → `mix_cu = cu[j]`) : rougit `design_check` (le pont K=1
du test 1 n'est pas affecté, d'où l'utilité du nouvel épingle) — §7.

## 5. Validité Monte-Carlo (test 4b, 4c ; mulberry32 seedé ; < 10 s)

- **4b** (`sentinel_edetector_montecarlo_arl_bound`, 2.33 s) : 2000 suites i.i.d. Bernoulli(p), p ∈ {0.10, 0.30},
  H ∈ {100, 300}, seed `0x9e3779b9 ^ (round(p·100)<<8) ^ H`. Fréquence de franchissement de log(1/α) **≤ H·alphaArl + 3σ**.
  Mesuré (représentatif) : p=0.30, H=300 → freq **0.171 ≤ 0.325** ; p=0.30, H=100 → 0.051 ≤ 0.115 ; p=0.10 → 0.000.
  Borne P(N ≤ H) ≤ H·alpha_arl (Ville, [abs], ADR D3). Vert.
- **4c** (`sentinel_edetector_sr_sum_not_supermartingale`, 1.21 s) — **amendement G2 C-a (error_origin = plan)**.
  À p = p0 = 0.30, `E[M_SR,H] = H` est une égalité de bord et le mélange est à queue lourde (une suite dominante
  pousse la moyenne brute jusqu'à ~50·H) : un « mean ≤ H » dur bascule selon la graine (G2 mesure 3/31). Correctif :
  **winsorisation** de chaque terminale à un plafond **déclaré** `M_CAP = 1000·H` (= exp(seuil)·H, lié à la classe) ;
  `min(M, M_CAP)` est borné donc sa moyenne concentre, `E[min(M,M_CAP)] ≤ E[M] = H`. Trois assertions : (c1) validité
  `mean_w ≤ H·(1 + marge)`, marge = 3·sd_w/(√N·H) (demi-largeur d'IC 3σ) ; **plafond analytique déclaré**
  `marge ≤ 3·M_CAP/(2·√N·H)` (car sd_w ≤ M_CAP/2) — non-vacuité par construction ; (c2) témoin `mean_w > 1` (c'est
  (c2) qui distingue d'une surmartingale bornée par 1, (c1) est le plafond de croissance linéaire). Graine committée
  `12345+H` : mean_w = 73.78 (H=100, marge 0.7219) et 84.19 (H=300, marge 0.1149), c1/c2/plafond verts.

## 6. Golden J0 (test 9)

Faits J0 lus **UNE fois** (curl GET, 2026-09-18) sur `https://monarkgate.tech/narabi/timeline.jsonl` — l'unique ligne
publiée : `from_block 25993482`, `to_block 26000650`, `burns 7248378739600000000000000`,
`mints 17695946655200000000000000`, `supply_close 4740020686554655133523503861`, `day 2026-09-17`. Le témoin C1
`s_open = supply_close + burns − mints = 4729573118639055133523503861` **concorde octet-pour-octet** avec le `s_open`
publié. `step(initState(), faits J0)` reproduit `line_hash = 09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82`
(pair_status `non_evaluable`, T 0, prev_line_hash `GENESIS`, `digest_T 48d40651eb2e69c3…` = ancre ADR). Le `line_hash`
exclut la provenance (`timeline.ts` `hashedFields`) et l'instant dérive du jour (`flow.ts:59`) : toute `prov` reproduit
l'ancre. Aucune autre lecture réseau du lot.

## 7. Mutants (test 6 — chacun rejoué à la main, rougit, restauré CLEAN)

Sauvegarde `edetector.ts` → mutation par `sed` → exécution du test rougissant → restauration → `diff` = CLEAN. Oracle brut :

Suite COMPLÈTE rejouée sous chaque mutant ; les tests rougissants sont **mesurés** (pas raisonnés) :

| # | Mutant appliqué (sed) | Tests qui rougissent (mesurés, suite complète) |
|---|---|---|
| M1 | `B(λ)` perd `− lambda*p0` (non centré) | `bridge_equals_page_cusum`, `design_check`, `baseline_is_unit_mean` (= 1, 3, 4a — conforme PLAN test 6) |
| M2 | crossing `>=` → `>` (**sed GLOBAL** `s/>= threshold/> threshold/g`) | `mutant_guards` **seul** — prouve un site de franchissement unique (`firstCrossing`) ; `design_check` ne bouge pas (l'indice 279 n'est pas au bord) |
| M3 | poids `fill(1/K)` → `fill(1)` (non normalisés) | `design_check`, `grid_shape`, `montecarlo_arl_bound`, `sr_sum_not_supermartingale` (3, 5, 4b, 4c) |
| M4 | `makeGrid` perd la garde λ > 0 | `mutant_guards` (6) |
| M5 | `EDET.K` 12 → 11 | `constants_match_adr`, `design_check`, `grid_shape` (2, 3, 5) |
| M6 | e-CUSUM `max(M,1)` → `M` | `bridge_equals_page_cusum`, `design_check` (1, 3) |
| **MX1** | mélange e-CUSUM écrasé : `mix_cu = logSumExp(…)` → `mix_cu = cu[j]` | `design_check` (le pin `max_logM_cu` C-b ; K=1/test 1 non affecté) |

Assertions brutes clés : M1 → `bridge max_logM_cu 2.8103300742025197 == pageCusumMax 9.544601061384807` ;
M2 → `firstCrossing uses >= (a value == threshold crosses)` ; M3 → `weights sum to 1 (got 12)` ;
M4 → `Missing expected exception. expected: /lambda must be > 0/, operator: 'throws'` ; M5 → `K = 12 lambda` ;
M6 → `bridge max_logM_cu -Infinity == pageCusumMax 9.544601061384807`. Après chaque mutant : restauration `diff` = CLEAN.
Après campagne : `edetector.ts` identique à la sauvegarde ; `git status --short` = 2 `M` + 2 `??`.

**Mutants de câblage `buildEDetector` (instrument.ts) contre le test 10 `sentinel_edetector_published_section`
(checkpoint-2 C-iii ; `.bak` + sha, restaurés ; `instrument.ts` re-vérifié `5418b0fb…`)** :
- **W2** `first_crossing_day: calmPairDays[idx]` → `[idx + 1]` : **rougit** (`AssertionError: first_crossing_day = calmPairDays[index]` — idx+1 donne 2024-10-12).
- **W3** `design_check.p0: EDET.p0` → `DISQUALIFIED_P0` : **rougit** (`AssertionError: design_check.p0 = 0.30 (not the disqualified 0.125)`).
- **W1** `crossed: design.crossed_sr` → `design.crossed_cu` : **NE rougit PAS — finding remonté au checkpoint-2**
  (error_origin = sélection de mutant). Motif mesuré : à p0 = 0.30 le design check ne franchit rien, donc
  `design.crossed_sr === design.crossed_cu === null` ; l'échange est un **no-op comportemental** (le champ publié
  `crossed` est `null` dans les deux cas). Le champ reste épinglé (`e.design_check.crossed === run.crossed_sr === null`) :
  tout mutant rendant `crossed` non-nul rougirait ; la distinction SR/CU est intestable à ce p0 (aucune n'y franchit).
  La section ne publie pas `crossed_cu` et `edetector.ts`/`instrument.ts` sont byte-figés — impossible de rendre W1
  détectable sans changement de spec (adjudication orchestrateur).

## 8. Déviations divulguées (R-21 — écrit pour être vérifié)

1. **Test 4c winsorisé (amendement G2 C-a, error_origin = plan).** Voir §5. À p = p0 la moyenne brute de M_SR,H est
   à queue lourde et instable (une graine donne une moyenne à 49.88·H) ; un « mean ≤ H » dur bascule (G2 : 3/31). La
   winsorisation à `M_CAP = 1000·H` brise le couplage : `min(M,M_CAP)` est borné, sa moyenne concentre et le plafond
   de la marge est analytique. **Balayage de graines** (script de session `sweep4c_wins.mjs`, scratchpad, **pas dans
   le dépôt** ; rejoué au checkpoint-2) sur **deux familles** de bases — famille A `1000 + 7919·b` (celle qui contient
   la géante 49.88·H) et famille B `101 + 6271·b`, b = 0..39, aux deux H → **160 essais, 0 basculement de c1, c2 et du
   plafond** ; la géante brute 49.88·H se winsorise à **1.211·H**, marge brute max 1.664. **Note de formule (résolue)** : je
   retenais la formule du message orchestrateur — marge = 3·sd/(√N·H), **sans dimension** — plutôt que le
   « 3·sd/√N » du PLAN 43349a9 (omettait le `/H`, dimensionnellement incohérent avec `H·(1+marge)`) ; **signalé, pas
   choisi en silence**. L'orchestrateur a **corrigé le PLAN au commit `abde49e`** (marge normalisée par H + winsorisation) :
   le plan concorde désormais avec cette implémentation.
2. **Clé `cusum` conservée, section re-étiquetée pré-J0.** Le test existant 12f épingle `inst.cusum.*` et
   `inst.cusum_all_evaluable.*` ; les clés sont **gardées** (aucune valeur numérique changée : 616, 63, 0.125, 0.25,
   9.5446, exceed 0, p ≤ 1/1001, 694, all > calm), seul le champ `label` porte désormais « pre-J0 CUSUM (retrospective
   permutation diagnostic…, ADR-M014 D4) ». Le test 12f est **re-pinné explicitement** sur les deux nouveaux labels.
3. **`test 2` `t.skip` (pas `return` muet)** : l'ADR de gouvernance est absent de l'export public ; dans le dépôt
   source le test relit six valeurs, dans l'export il **skip** (visible au résumé `skipped 1`), jamais un vert muet.
4. **`runEDetector(sequence, p0, grid, alphaArl?)`** au lieu du `runEDetector(sequence)` du PLAN §1.1 : la classe
   disqualifiée p0 = 0.125 exige une seconde exécution à un autre p0/grille ; la paramétrisation est nécessaire, la
   validité (Prop. 2.3) en est indépendante. Le résultat expose bien `logM_sr`/`logM_cu`/`max_logM_*`/`threshold`/
   `crossed_*` (conforme PLAN §1.1) ; **un unique prédicat de franchissement** (`firstCrossing`, `>=`) sert les deux
   statistiques — prouvé par le mutant M2 global (§7).
5. **`startAfterDay` (2025-10-15) est déclaré et publié, mais appliqué par AUCUN filtre dans ce lot** : le départ de
   segment (M₀ = 0 à la première paire calme postérieure au 2025-10-15) appartient au rejeu `--timeline` de l'item (l)
   d'ADR-M012, hors périmètre M014-b (D5). Le design check tourne sur les 616 paires committées, sans borne (label).
6. **Nits G2 optionnels considérés, DIFFÉRÉS** (`bridgeMonoLambda` passant par la garde λ > 0 ; `makeGrid(lo,hi,1)`
   vérifiant hi > lo avant le retour K = 1) : aucun appelant actuel ne les viole (`bridgeMonoLambda` n'est appelé
   qu'avec p1 = 0.25 > p0 = 0.125, λ* > 0) et les faire modifierait `edetector.ts`, ce qui **contredirait l'exigence
   de byte-identité `9cea5ada…` de ce tour de correction** (instruction orchestrateur). Décision documentée, pas une
   dette : **item formé, porté au rapport de passe G7** (micro-lot séparé si un futur appelant le justifie).
7. **Test 10 (C-iii) : câblage W1 non détectable.** Voir §7 — la section ne publie que le franchissement e-SR (`crossed`),
   nul à p0 = 0.30 comme le franchissement e-CUSUM ; l'échange SR↔CU y est un no-op. **Item formé, remonté au checkpoint-2 /
   porté au rapport de passe G7** pour adjudication (publier `crossed_cu`, ou un design check à un p0 franchissant — hors byte-identité).

Correction G2 : seul `sentinel.test.ts` a changé (C-a test 4c, C-b test 3 + MX1) ; `edetector.ts` (`9cea5ada…`) et
`instrument.ts` (`5418b0fb…`) restent **byte-identiques** (vérifié). error_origin des deux items = **plan**, pas worker.
Aucune dette ouverte à la clôture de ce lot : tout point du PLAN §1 (amendé) est livré et vérifié par un oracle non-LLM.

## 9. Oracle (tous verts, 2026-09-18)

```
npm run ci        -> tests 283 / pass 283 / fail 0 ; exit 0   (gate:vocab + typecheck + tests, dont test 42 export-public)
npm run lint      -> exit 0 (eslint . : 0 problème)
npm run lint:ratchet -> 69/69 (plafond committé, exit 0)
node scripts/lang-gate.mjs --scope root -> 0 non-exempt French hit(s) ; exit 0
git diff --check  -> propre (exit 0)
node --test apps/sentinel/test/sentinel.test.ts -> tests 34 / pass 34 / fail 0
   (montecarlo_arl_bound 2.34 s ; sr_sum_not_supermartingale 1.21 s — sous 10 s)
```

## 10. R-25 (taille du lot ; docs G1/G2 exclus)

`git diff --numstat` : `instrument.ts` +126/−12 ; `sentinel.test.ts` +277/−4 ; `edetector.ts` +138 (nouveau, insertions).
**ins = 541, del = 16, ins+del = 557 < 1205.** `error_origin` (M014-b + corrections C-a/C-b) : assigné au G7 par l'orchestrateur.
