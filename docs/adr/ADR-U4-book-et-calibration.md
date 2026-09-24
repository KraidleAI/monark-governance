# ADR-U4 — Book Aave v3 à B₀, chemin d'oracle réalisé D_e, calibration réelle de l'événement e2 (U-4a-i, A-1..A-4)

- **Statut** : **proposé (G0 → G1 → revue G2 PASS-AVEC-CORRECTIONS C-G2-1..7 pliées ; checkpoint-2 ACCEPTE-AVEC-CORRECTIONS C-V-1..7 pliées ; G2-delta (contrôle live D-12) FAITE ; checkpoint-2 bis FAIT (ACCEPTE-AVEC-CORRECTIONS docs seules) ; G7 à venir)** — lot
  U-4a du programme ADR-M020 (D1 (b)), sous-lot **U-4a-i = A-1..A-4** (A-5/A-6/A-7 = U-4a-ii, ABSENTS ici). Rattachement :
  ADR-M020 D1 (b)/D4 ligne U-4, ADR-U3 (étiquettes Y), ADR-U2 (treillis), ADR-M018 (règle de branchement, tuyaux),
  ADR-M011/M014 (non-dégénérescence, pré-enregistrement), checkpoint-1 U-4 (C-1..C-13).
- **Dates** : décision 2026-09-20 · rédaction worker `claude-opus-4-8[1m]` (R-1, effort max) · verdict/commit :
  orchestrateur `claude-fable-5-1` (R-20). **Aucun commit, aucun workflow par le worker.**
- **Gate** : G0 → G1 (recorder durci + courses + réduction + tests) → **G2 fraîche** (offline, rejeu depuis bruts,
  9 mutants) → checkpoint-2 (advisor-defi + validateur) → **G2-delta (contrôle live D-12) → checkpoint-2 bis** →
  G7 (orchestrateur).
- **Éléments produits (U-4a-i)** : `apps/sentinel/src/ukemi/{record.ts, rpc2.ts, resume.ts, abi.ts}` (A-1, durcissement
  budget/reprise/exclusion + sélecteurs D_e) ; `scripts/census/{u4-probe,u4-oracle-path,u4-scores,u4-reduce,u4-redraw}.mjs`
  (+ `u4-scores.d.mts`, `u4-redraw.d.mts` ; `u4-reduce` = driver A-3 ; `u4-redraw` = contrôle live G2-delta, checkpoint-2 C-V-3) ;
  `apps/sentinel/test/{ukemi-record,ukemi-u4a,ukemi-u4-scores,ukemi-u4-governance}.test.ts` (`ukemi-u4-governance` = test prereg
  isolé, checkpoint-2 C-V-1) ; fixtures réduites
  `apps/sentinel/test/fixtures/ukemi/u4/{U4-book-23545087.json, U4-oracle-path-e2.jsonl, U4-scores-e2.jsonl}` +
  `PROVENANCE-u4.md` ; `docs/PLAN-u4-prereg.md` (pré-enregistré, committé seul avant la course, LF sha
  `9209cdab…`). **Non touchés** : `book.ts` (PIN `034fbff9` intact), `schemas/**`, `packages/contracts/**`,
  `gate.ts`, `registry.ts`, `calibration.ts`, `fleet.ts`, `apps/site` (A-5/A-6/A-7 = U-4a-ii).

## Contexte (mesuré)
1. La classe M016 `liquidation-realized-given-oracle-path-24h` (ADR-M020 D1 (b)) exige, pour l'événement e2
   (liquidations Aave v3 core, collatéral WETH, 2025-10-10/11), une prédiction ŷ **par compte** confrontée à
   l'étiquette réelle Y_{i,e2} (ADR-U3) le long du chemin d'oracle réalisé D_e.
2. Book de référence **B₀ = 23545087** (= B_first − 1, cluster `weth`) : 69 481 détenteurs aWETH énumérés, **16 096
   à-risque** (collatéral WETH ∧ dette), `book_digest = 695d862f…` (rejoué offline depuis le cache, 0 réseau).
3. D_e = série `AnswerUpdated` de l'agrégateur `0x7c7fdfca…` (résolu via `aggregator()` du proxy SVR
   `0x5424384b…`, identique à B₀ et B_last ⇒ pas de changement de phase) sur [B₀, B_last] : **140 updates**,
   `p_min = 345670460000` (~$3 456,70).

## Décision
**D1 — Cellule et étiquette (checkpoint-1 C-1).** Unité = **compte**. Y_compte = Σ (`repayment_base + deficit_base`)
des lignes e2 de `U3-realized.jsonl` du `user` ; Y = 0 pour un éligible sous D_e non liquidé. Cellule e2 =
{comptes du book B₀ avec ŷ > 0 sous D_e} ∪ {189 comptes liquidés} = **n = 797** (recouvrement 162). Résidus
nommés et comptés (voir « Résultats »). **C-12 / checkpoint-2 C-V-2** : la ligne e2 à `deficit_base_no_price` (user
`0x15391e…`, USDT, non prisée en U-3) est **complétée** par `getAssetPrice(USDT)@23550406` (= 100567000, `usdt_prices`
du chemin D_e) ⇒ Y = 277 615 428 066 + 445 329 889 526 = **722 945 317 592** ; le réducteur **échoue en dur** si ce
prix manque (jamais un Y silencieusement amputé). ŷ = 0 pour ce compte (non éligible sous D_e) ⇒ score = Y < q̂ ⇒
**n / p / q̂ inchangés**, seul `calib_digest` re-pin (668ab214… → **267cd991…**).

**D2 — ŷ et HF(D_e) (checkpoint-1 C-3).** ŷ_compte = `total_debt_base` au book B₀ **si** HF(D_e) < 1e18, sinon 0.
HF(D_e) est le HF on-chain autoritaire (`hf_onchain`) mis à l'échelle pour les jambes WETH (collatéral aWETH ET
dette vWETH) au prix `p_min`, les autres actifs figés à p0 (**limitation déclarée**) :
`HF_min = hf0 · (riskAdjMin / riskAdj0) · (totalDebt0 / totalDebtMin)`, `riskAdj = percentMul(collateral, LT)`.
LT_WETH = LT de la réserve si emode = 0, sinon le LT de la catégorie e-mode du compte (`getEModeCategoryData`).
Identité de contrôle : à p_min = p0, `HF_min == hf0` EXACTEMENT. **Le book n'itémise qu'un aToken (aWETH) + tous
les vDebt** ; repricer le collatéral non-WETH est impossible hors ligne (résidu déclaré, D5).

**D3 — Score et calibration (checkpoint-1 C-2).** Score = **|Y − ŷ|** en base-monnaie 8 déc., **sans clipage**, tri
canonique par adresse, `calib_digest`. α = 0,01 ; **nMin = 100** ; `p = ⌈(n+1)·0,99⌉` ; q̂ = p-ième plus petit
score. **nMin (checkpoint-1 C-11)** : le code exige n ≥ 99 (`⌈100·0,99⌉ = 99`, mesuré en double) ; la lecture
Dunn 2022 Thm 11 (`n₁ > 1/α − 1`, inégalité STRICTE) [lu] (`docs/biblio/ukemi-modeL/L-lecture-dunn2022-hierarchical.md`)
motive un **choix conservateur nMin = 100** par paramètre de classe.

**D4 — Ordre pré-enregistré (checkpoint-1 C-5).** `docs/PLAN-u4-prereg.md` committé SEUL avant tout appel réseau ;
`--prereg-sha` fail-closed, écrit dans `meta.prereg_sha`. Toute déviation est déclarée D-n dans le PLI, jamais
absorbée. Budget 300 000 appels fail-closed (`--max-calls`), reprise `--resume` (cache hors dépôt), quorum-2 par
méthode, discipline secret (opérateur d'archive `CHAINSTACK_ETH_URL` = label `archive-env`, jamais imprimé).

## Tuyaux (ADR-M018 D3 / règle de branchement)
| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État | Test qui prouve la composition |
|---|---|---|---|---|
| book B₀ | recorder RPC quorum-2 → `U4-book-23545087.raw.json` (hors dépôt) → réducteur → `U4-book-23545087.json` | A-4 (réducteur, test) ; **A-6 `fromRealizedBook`** (U-4a-ii, ABSENT) | fixture in-repo sha-pinné (`PROVENANCE-u4.md`) + brut hors dépôt | `u4_calibrates_from_u3_realized_labels` |
| D_e (chemin oracle réalisé) | `u4-oracle-path.mjs` (getLogs `AnswerUpdated`) → `U4-oracle-path-e2.raw.json` (hors dépôt) → réducteur → `U4-oracle-path-e2.jsonl` | A-4 (réducteur, test) | fixture in-repo sha-pinné + brut hors dépôt | `u4_oracle_path_monotone_and_matches_u3_prices` |
| réduction A-4 → scores | (`book`, `D_e`, `U3-realized`) → `u4-scores.mjs` `computeScores` → `U4-scores-e2.jsonl` + `calib_digest` | **entrée `UKEMI_REALIZED_E2` de `calibration.ts` → gate** — **REQUALIFIÉ (checkpoint-2 bis / décision 91)** : e2 = **jeu de conception, JAMAIS servi** ; consommateur servi **renvoyé au G0 de U-4b** (U-4a-ii = A-5..A-7 renvoyé ; recommandation validateur = absorber ; confirmation investisseur due au G0 U-4b) | **`upcoming`** (jamais `built` ; consommateur = **test seul**) | `u4_calibrates_from_u3_realized_labels` (`calib_digest = 267cd991…` pinné) |

**Branchement (CA-11)** : **rien de nouveau `built`**. `calib_digest` est consommé **uniquement** par son propre
test ⇒ **`upcoming`** ; son consommateur servi (`calibration.ts` → gate) est **renvoyé au G0 de U-4b** (checkpoint-2
bis / décision 91 : **e2 = jeu de conception, jamais servi** ; U-4a-ii = A-5..A-7 renvoyé, recommandation validateur =
absorber, confirmation investisseur due au G0 U-4b). `book` et
`D_e` sont consommés uniquement par les tests A-4. `gate.ts`, `registry.ts`, `calibration.ts`, `fleet.ts`,
`adapter-book.ts` = **intacts** (diff vide vérifié). Un tuyau annoncé et absent = item formé avec déclencheur.
**Miroir public (checkpoint-2 C-V-1)** : la **recette de calibration n'est PAS rejouable depuis le miroir public** à
ce stade — `scripts/census/u4-*.mjs` (réducteur, driver, re-tirage) ne sont pas whitelistés (Ukemi `upcoming`), et
`ukemi-u4-scores.test.ts` (importe le réducteur) + `ukemi-u4-governance.test.ts` (lit le prereg exclu) sont exclus de
l'export (`scripts/export-exclude-tests.json`, ADR-M004 D7 sexies). **Item formé** « rejouabilité publique de la
calibration U-4 » — déclencheur : G0 U-7 / publication Ukemi ; propriétaire : orchestrateur.

## Résultats mesurés — H1..H7 (rapportés tels quels, trois NON)
| H | énoncé | verdict | chiffre |
|---|---|---|---|
| U4-H1 | détenteurs aWETH `balanceOf>0` ≤ 20 000 | **INDÉTERMINABLE (bornée)** | borne [16 096, 69 481] ; 20 000 dedans ; lever = ~106 770 appels (hors budget) — item formé |
| U4-H2 | 189 liquidés ⊂ à-risque book B₀ | **NON** | 185/189 (4 `liquidated_not_in_book`, positions post-B₀) |
| U4-H3 | ŷ>0 pour ≥90 % des liquidés | **NON** | 162/189 = **85,7 %** |
| U4-H4 | ≥50 `AnswerUpdated` | **OUI** | 140 |
| U4-H5 | ≥1 éligible non liquidé | **OUI** | 608 |
| U4-H6 | dernier update ≤ b == getAssetPrice@b (107 blocs) | **NON** | forme pré-enregistrée **69/107** (union ≤b/<b 77 ; <b seul 64) — voir « Oracle D_e » |
| U4-H7 | n = \|cellule\| ≥ 100 | **OUI** | 797 |

Census : eligible_static_b0 **64**, eligible_under_De **770**, liquidated 189, `liquidated_not_in_book` **4**,
`liquidated_not_eligible_under_De` **23** (dont 20/23 avec **collatéral non-WETH NON ITÉMISÉ dans le book**, tenu à
p0 — limitation D2), `eligible_not_liquidated` **608**, emode≠0 in-cell **42** (dont **12 non-cat-1** {2:7, 11:3,
19:1, 23:1} — résiduel D5), `emode_lt_overstate_clamps` **0** (ne capte QUE riskAdjMin<0 ; ne certifie PAS le LT
e-mode du bras WETH). Un NON est un **résultat mesuré, pas un défaut**.

## Oracle D_e — H6 (69/107) et p_min (C-G2-3 / C-G2-4, D-9 corrigé)
- **Résultat pré-enregistré épinglé** : forme C-4 « dernier `AnswerUpdated` ≤ b == getAssetPrice@b » = **NON 69/107**
  (union 77 ; <b seul 64), assertion `ukemi-u4-scores.test.ts`. **Le prereg n'est pas réécrit.**
- **Diagnostic POST-HOC** (n'est PAS le critère pré-enregistré, ne **valide pas** H6, borne seulement l'usage de
  p_min) : 106/107 valeurs servies ∈ série `AnswerUpdated` (le 1 = p0 pré-fenêtre @23545088).
- **p_min défendu par ENCADREMENT** : min(events) ≤ min(servi, tous blocs) ≤ min(servi, blocs échantillonnés) =
  min(events) = 345670460000 ; l'égalité suffit pour **p_min**, pas pour un D_e résolu par bloc. **CONDITION de
  l'encadrement (checkpoint-2 C-V-5)** : la borne médiane ne tient QUE si **toute valeur servie ∈ events ∪ {p0}** —
  mesuré sur **179 blocs échantillonnés (price + price_prev), biaisés vers les liquidations** : 177 ∈ events, 2 = p0 ;
  hors de cette condition une valeur servie pourrait tomber sous min(events). **Biais déclaré** : les 107 blocs sont
  des blocs de liquidation (69/107 n'est pas un taux de fraîcheur général).
- **Mécanisme = NON EXPLIQUÉ, à procurer.** L'explication « backrun / logIndex intra-bloc » est **contredite par les
  données** (0 update multiple intra-bloc parmi les 38 échecs). Contraintes mesurées : la valeur servie **retarde de
  1 à 3 events** (26 / 6 / 5) ; le plus ancien update non servi a **0 à 5 blocs** d'âge ; sur 179 blocs échantillonnés
  (price + price_prev) **177** valeurs ∈ série d'events, **2** = p0 ; sur **26** blocs à `AnswerUpdated` dans le bloc
  même, **13 ne sont pas reflétés en fin de bloc**. Indice [lu] `R-web-capo…` §6.1/§6.4 (adresse secondaire
  `eth-usd-svr`, repli « après un délai configurable »). **Ancre pré-B₀** immatérielle pour p_min ⇒ item formé
  (déclencheur G0 U-4b), pas de course réseau.

## Région q̂ (C-G2-2 — EN CHIFFRES ; jamais « score maximal »)
`q̂ = 364550606513851` (~$3,65 M) = **791ᵉ plus petit score** (p = 791 **< n = 797**) ⇒ 790 scores < q̂, 1 = q̂,
**6 strictement au-dessus** ; couverture |Y−ŷ| ≤ q̂ = **791/797 = 99,25 %** (≥ 99 %, α = 0,01). Les 6 échappées :
5 sont Y = 0, **1 est une vraie liquidation** (`0x984292…`, score 368763614218023), **toutes ŷ ≥ 1 M$**. **790/797**
comptes ont ŷ ≤ q̂ ⇒ la région ŷ ± q̂ **couvre 0** ⇒ calibration **statistiquement valide mais quasi-non-informative**
pour la question binaire. **q̂ IDENTIQUE sur la classe {ŷ > 0}** (n = 770, p = 764) ⇒ la revendication porte sur cette
classe, observable avant l'événement. Validité **marginale** intacte (Barber 2023 Thm 2 à poids unitaires [lu],
`docs/biblio/ukemi-modeL/L-lecture-tibshirani2019-barber2023.md` ; Vovk 2012 Prop. 1/2 [lu]) ; couverture
conditionnelle au jeu ~ Beta(791, 7), écart-type ≈ 0,3 point [lu]. **Échangeabilité** : K = 1 épisode ⇒ **aucune
revendication sur un nouvel événement** (à α = 0,01 il faudrait K > 99) ; l'écart entre événements se **nomme**
(Σ w̃·d_TV, Barber 2023), il ne s'estime pas. **Jamais « probabilité de liquidation ».**

## Constat exploratoire POST HOC (advisor-defi — ne touche NI au pin NI au prereg)
Rejoué hors ligne par le worker (`F:/tmp/u4a/pli/measure3.mjs`, formule HF du réducteur, agrégat ETH-échelle
identifié par le prix on-chain du book) ; **niveau : exploratoire, non publiable comme calibration**. L'affirmation
G2 §3 « tenir le non-WETH à p0 ne fabrique pas les 608 » est **fausse pour la jambe DETTE** : sur les éligibles-non-
liquidés mono-collatéral WETH, **132 portent une dette LST (wstETH/rETH/cbETH/weETH/…) tenue à p0** et **123 perdent
l'éligibilité** si cette dette suit p_min/p0 ; **aucun des vrais positifs mono n'est perdu** ⇒ ≈ 20 % des 608 sont un
**artefact de modèle** (boucle WETH contre LST). Réserve : ratio LST/ETH supposé constant ; « éligible non liquidé »
≠ « faux ». **Écart avec l'avis signalé** (tolérance de classification mono-collatéral aWethColl0≈total_collateral_base
±100) : le worker mesure 132 / 123 / **0 sur 100** vrais positifs mono (avis : 132 / 123 / 0 sur 97) ; 474 éligibles-
non-liquidés mono (avis 475) ; 9 505 mono-collatéral total (PLI 9 482). Les trois chiffres **load-bearing** (132, 123,
0) sont reproduits à l'identique ; les comptes de classification diffèrent de ≤ 0,24 % (arrondi, réserve déclarée par
l'avis). Signal exploratoire — taux de liquidation des éligibles par tranche de ŷ : < 100 $ 1 % (302) ; 100 $–2 k$
26 % (77) ; 2 k$–100 k$ 32 % (257) ; 100 k$–1 M$ 41 % (99) ; ≥ 1 M$ 46 % (35).

## Modes d'échec MAST (checklist de risque résiduel — checkpoint-1 C-13)
| Mode | Menace | Contre-mesure (mesurée) |
|---|---|---|
| Fixture auto-enregistrée | le test rejoue ce que le script a écrit | G2 fraîche : `book_digest`/`calib_digest`/H1–H7 recalculés indépendamment (== rapportés) ; mutants source TUEURS (Y, D_e, LT_W, décodeur e-mode, signe int256, portée événement, appartenance, cache ; + checkpoint-2 : complétion Y, fail-closed USDT, fail-closed LT e-mode, graine du re-tirage) ; fixtures reproduites byte-exact depuis les bruts par le driver committé ; **contrôle indépendant LIVE (prereg §4) : FAIT PAR G2-delta** via `scripts/census/u4-redraw.mjs` (re-tirage ≥ 3 comptes + ≥ 3 `AnswerUpdated` par graine `book_digest`, `--max-calls ≤ 60` fail-closed, opérateurs excludables — sans `publicnode`/`mevblocker`) — **FAIT** : 13 appels, `all_match`, brut `c01f75ce…`, 2026-09-21T01:56:48Z, cache `09968df1…` **inchangé** ; déviation **D-12** du PLI (`error_origin` G2 + orchestrateur) |
| Sélection sur l'issue | 27 comptes entrent dans la cellule car Y > 0 | échangeabilité déclarée ; **q̂ identique sur {ŷ>0} seul** (observable a priori) ; K = 1, aucune revendication hors e2 |
| Vérification incorrecte | mutant non discriminant ; critère basculé après données | mutants changent une éligibilité RÉELLE (770→64, 770→59) ; NON 69/107 **épinglé** (pas seulement en commentaire) ; diagnostic post-hoc étiqueté comme tel |
| Fuite de secret | URL/clé d'archive dans un log/brut | `scrubUrls` ; leg archive = label `archive-env` ; `no-secret-in-repo` vert ; motif `https?://\|chainstack\|p2pify\|api-key` = 0 sur les bruts ET le dépôt |
| Perte d'information | book/labels partiels présentés complets | `no_quorum` ⇒ abstention ; résidus nommés et comptés ; H1 borné, non deviné |
| Terminaison prématurée | lot présenté clos sans chemin servi | statut **`upcoming`** ; A-5/A-6/A-7 absents et déclarés ; registre `fleet.ts` inchangé ; G7 au seul orchestrateur |

## Entrées pour le pré-enregistrement de U-4b (items formés — déclencheur : G0 U-4b ; propriétaire : orchestrateur)
Reprises de l'avis advisor-defi (b), à pré-enregistrer AVANT la course U-4b :
1. **Épisode FRAIS** pour la calibration (e2 = conception du score seulement = split conforme).
2. Cellule **{ŷ > 0}** ; liquidés non éligibles = **taux de miss déclaré hors score**.
3. ŷ à **close factor au premier franchissement** le long de D_e + règle petite-position ; **constantes lues [lu]
   AVANT la course**.
4. **Repricing des deux jambes ETH-échelle** (collatéral WETH, dette WETH/LST) ; option A (recorder étendu à tous les
   aTokens) ou **option B** (classe restreinte aux 9 482 mono-collatéral WETH, définie avant la course) — décidée
   avant la course.
5. **Deux classes Mondrian** (« éligible → liquidé » stratifiée par taille, **en couverture, jamais en probabilité** ;
   « sachant liquidé, Y contre close factor × dette ») ; strates et α pré-enregistrés avec **n ≥ 99 par strate**
   (tranche ≥ 1 M$, n = 35 ⇒ `under_calib`).
6. **H6 reformulée sur la série servie** (appartenance + borne de retard).
7. **Ancre pré-B₀** incluse (D_e reconstruit sur la série servie).

## G0 de U-4b — contenu exigé (checkpoint-2 bis) + items d'outil (déclencheur : G0 U-4b ; propriétaire : orchestrateur)
Le validateur (checkpoint-2 bis) exige que le **G0 de U-4b** contienne : **prereg frais committé seul** ; les **7 entrées
ci-dessus** ; **OPTION B** (classe mono-collatéral WETH — décision investisseur 91) ; **PR-U4-1 et PR-U4-3 au niveau
[lu] AVANT la course**, **PR-U4-4 résolu AVANT le G0** ; **budget RU Chainstack lu au dashboard + plafond d'appels
fail-closed** ; **tuyaux jusqu'au chemin servi avec test d'intégration depuis l'artefact réel** ; **table MAST + découpe
R-25 pré-déclarée** ; **contrôle live indépendant planifié DANS la mission G2 dès le départ** ; et les **items d'outil**
ci-dessous.

Items d'outil (à faire en U-4b, **PAS dans ce lot** — les toucher rouvrirait α et changerait `ukemi_sha`) :
- **`onRpcError`** : `scripts/census/u4-redraw.mjs:88` construit `makeDefaultCall()` **sans** puits d'erreur ni retry
  (contrairement à `u4-oracle-path.mjs:60`) ⇒ une cause d'échec d'opérateur (ex. drpc benché au contrôle live D-12)
  n'est pas enregistrée ; ajouter un sink d'erreurs par-opérateur au rapport de re-tirage. Déclencheur : ré-usage du
  re-tirage (U-4b).
- **`meta.model` en ARGUMENT ou variable d'environnement OBLIGATOIRE, fail-closed (C-VB-5 / RÉSERVE CA-8)** : le champ
  `model` des bruts est aujourd'hui un **littéral source** (`u4-redraw.mjs:111`, `record.ts:319,353,382`,
  `u4-probe.mjs:121,128`, `u4-oracle-path.mjs:125,140`, tous `"claude-opus-4-8[1m]"` codés en dur) ⇒ **non probant** de
  quel modèle a tourné ; le rendre un argument/variable **fail-closed** (échec si absent) dans `record.ts` et les scripts
  census. **S'ajoute à l'item `onRpcError`.** Déclencheur : G0 U-4b.
- **Durcissement append EBUSY** (`record.ts` l.324) : réessai borné sur `EBUSY`/`EPERM` transitoire (cause D-7 retirée ;
  item conservé). Déclencheur : récurrence d'un verrou tiers OU U-4b.
- **12 comptes e-mode non-cat-1** ({2:7, 11:3, 19:1, 23:1}) : lire le bitmap collatéral de la catégorie (1 champ v3.2
  off-tool) pour confirmer WETH ∈ catégorie, OU les marquer `non_evaluable`. Déclencheur : G0 U-4b ou ratification D-9.

**ESCALADE-INVESTISSEUR (checkpoint-2) — RÉPONDUE (décision investisseur 91, 2026-09-21)** :
la question (« la calibration e2 est valide, mais sa région couvre 0 pour **790 comptes sur 797** : servir U-4b calibré
sur e2 **tel quel** (G0 P-6), ou le **re-périmétrer** selon l'avis advisor-defi — **épisode frais** (~**280 k appels**),
**ŷ à close factor**, **classe mono-collatéral**, **Mondrian** ? ») est **TRANCHÉE** : décision investisseur 91 du
2026-09-21, verbatim « **refais la mesure avec chainstack ukemi** » ⇒ **re-périmétrage sur épisode frais**, Chainstack,
ŷ à close factor, classe mono-collatéral WETH, deux classes Mondrian, **e2 = jeu de conception seulement**. **Supersède
P-6 du G0 U-4** ; déclencheur : G7 de U-4a (`F:\Monark\docs\CHANTIERS.md:273`).

## Procurement (investisseur — items formés, jamais un dû nu)
| Id | Document / lecture | Identité | Usage | Niveau aujourd'hui |
|---|---|---|---|---|
| PR-U4-1 | Code vérifié de l'agrégateur `0x7c7fdfca…` | route Blockscout keyless ([abs] `MESURES-M2b` §4.6) | expliquer le retard servi vs events (D-9) | [abs] |
| PR-U4-2 | Test discriminant à **3 `eth_call`** sur un des 13 blocs | `latestAnswer()` agrégateur, `latestAnswer()` proxy, `getAssetPrice` | mécanisme du proxy (getter dépendant du lecteur ?) | à exécuter en U-4b |
| PR-U4-3 | `LiquidationLogic.sol` de l'implémentation Pool **déployée à B_first** (impl `0x97287a4f35e583d924f78ad88db8afce1379189a`, EIP-1967, U3 census C-6, `U3-inputs.jsonl`) | 5 constantes : `DEFAULT_LIQUIDATION_CLOSE_FACTOR`, `MAX_LIQUIDATION_CLOSE_FACTOR`, `CLOSE_FACTOR_HF_THRESHOLD`, `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD`, `MIN_LEFTOVER_BASE` | forme exacte de ŷ (close factor) ; « cassure ~2 k$ » à confirmer | [abs] |
| PR-U4-4 | CQR (conformalized quantile regression) ; Angelopoulos–Bates ; scores studentisés | **ITEM DE RECHERCHE (checkpoint-2 C-V-6)** : absents du corpus `R-biblio-ukemi-modeL.md` (grep Romano/CQR/Angelopoulos/quantile/studentiz = 0, vérifié) ⇒ un **chercheur Sonnet 5** résout les identités bibliographiques complètes (DOI/arXiv/pages) **AVANT le G0 de U-4b** ; propriétaire orchestrateur ; tentatives consignées — non devinées | couverture **conditionnelle** de U-4b | [abs] |
| PR-U1-1 | Perez et al., *Liquidations: DeFi on a Knife-edge* (FC 2021) | arXiv:2009.13235 ; Eq. 3 non paginée | éligible statique = HF on-chain [lu] | [abs] (Eq. 3) |

## Alternatives rejetées
- **Réécrire le prereg** après avoir vu 69/107 : refusé — le NON est épinglé tel quel (P5, zéro contournement).
- **Cellule « liquidés seuls »** (fixture réduite à la cellule) : refusé — rendrait `eligible_under_De`/
  `eligible_static_b0` tautologiques ; on garde les 16 096 comptes (D-10, book dérive la cellule).
- **Repricer le collatéral non-WETH** hors ligne : impossible (book n'itémise que aWETH) ⇒ résidu déclaré, correction
  = U-4b (recorder étendu OU classe mono-collatéral).
- **« Feed validé »** comme conclusion : refusé — p_min tient par **encadrement**, le mécanisme reste **non expliqué**.

## Conséquences
- **Positives** : première calibration réelle par compte d'un événement observé, sha-pinnée, rejouable sans réseau ;
  book B₀ et D_e reproduits byte-exact ; H1–H7 mesurées et rapportées telles quelles (trois NON) ; q̂ en chiffres,
  couverture marginale honnête, région quasi-non-informative dite.
- **Négatives (assumées)** : K = 1 épisode ⇒ aucune généralisation ; région conditionnelle non couverte (échappées
  ≥ 1 M$) ; ŷ = dette totale (pas encore close factor) ; collatéral non-WETH et 12 comptes e-mode non-cat-1 =
  résidus déclarés ; mécanisme du feed non expliqué. **Toutes** portées en entrées de pré-enregistrement U-4b.
- **Branchement** : sortie **`upcoming`** jusqu'à ce que U-4b la consomme par un chemin servi couvert par un test
  d'intégration ; rien de nouveau `built` ; `fleet.ts` inchangé.
