# PLAN-u4b-prereg — Pré-enregistrement U-4b-1b : calibration conforme sur épisode FRAIS (ŷ close factor v3.5.0 au premier franchissement, deux cellules Mondrian, gel du code de score AVANT les données)

> **Cible de commit** (par l'orchestrateur, SEUL — R-20) : `docs/PLAN-u4b-prereg.md`, committé **SEUL** (aucun code, exclu R-25) **avant tout appel réseau**.
> **Anti « post-hoc » — mécanisme RÉEL, procédural (pas un garde de code).** Au HEAD `0534551`, **aucun script ne lie la course à ce fichier** : le garde `--prereg-sha` du recorder (`apps/sentinel/src/ukemi/record.ts:239-241`) est **optionnel** (`if (args.preregSha !== undefined)`) et compare au blob de **`docs/PLAN-u4-prereg.md`** (le prereg U-4 du LIVRE), jamais à celui-ci. Le gel du code de score U-4b est donc tenu par une PROCÉDURE de l'orchestrateur, pas par un `throw` : (i) ce fichier committé SEUL ; (ii) **recompute des 9 sha (§2) depuis les blobs HEAD par l'orchestrateur AVANT `u4b-reduce`/`u4b-scores`** ; (iii) sha LF de ce fichier + `labeler-sha` (`755b3a38…`) + HEAD **écrits par l'orchestrateur dans la sonde go/no-go ET un fichier SIDECAR daté (liant sha_du_brut ↔ sha_de_ce_prereg ↔ labeler-sha ↔ HEAD), JAMAIS dans le brut de découverte lui-même** — le brut est écrit par `record.ts:400` et sa `provenance` ne porte que le `prereg_sha` U-4 (`:393` ; le `--resume` meta idem, `:331-333`) ⇒ y injecter des marqueurs U-4b serait une altération d'artefact post-hoc. Un garde de code liant la course à `PLAN-u4b-prereg.md` est **possible** (`record.ts` est hors gel) mais **non existant** aujourd'hui — question ouverte Q-A.
> **Provenance de la rédaction** : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22. Base LECTURE SEULE : `F:\Monark` `lot/etude-suite` HEAD `0534551b7c61542cc6e028d920d0aa620f8ad067` (`git rev-parse HEAD`, ce tour). Aucun réseau, aucun commit, aucun workflow. Mesures reproductibles : `MESURES.md`. Réviseur = orchestrateur (vérification adversariale R-21).
> **Rulings orchestrateur appliqués** (Q1–Q11) : voir l'**Annexe A (datée)**. Décisions investisseur appliquées : 91, 108, 110, 111, 113, 115, 118, **119, 121, 122, 123, 126** — voir Annexe A.
> **Périmètre (ruling Q1)** : 8 sections de fond **+** §DISC (P-EPI), définitions, H-0..H-7 chiffrées, sonde go/no-go — G0 §7 [C-12] (sinon le prereg ne fige pas la règle de sélection de l'épisode).
> **Note de gel D4 (régime B / AM-1)** : les sha du §2 sont **recomputés à l'identique au commit réel** depuis les blobs HEAD (`git show HEAD:… | tr -d '\r' | sha256sum`), jamais depuis `git status`. Toute divergence au commit = ÉCART = STOP.

---

## (1) Objet et régime (D4)

**Objet.** Figer AVANT tout appel : (i) la règle mécanique de découverte de l'épisode FRAIS (P-EPI, §DISC) ; (ii) toutes les définitions et choix de méthode à effet mesuré (liste fermée C-V-7, §3) ; (iii) la **convention d'étiquetage Y et son gel déféré** (ruling Q11, §Y) ; (iv) H-0..H-7 avec critères de NON ; (v) le protocole de budget/rapprochement Chainstack sous garde (A-4 + décision 121, §4-§Sonde) ; (vi) le **GEL par sha du code de score et de sa fermeture transitive** (§2) ; (vii) les **lignes de commande FIGÉES** de la course et du hors-ligne (§5). Objectif anti « sélection sur l'issue » : le code qui produira les scores frais (ŷ) ET la convention qui produira Y sont figés AVANT que la donnée fraîche existe ; ni le score-code ni le labeler ne peuvent être ajustés après avoir vu un q̂ flatteur.

**Régime (D4, régime B, ADR-C01 amendement cadence 2026-09-21).** Prereg committé SEUL ; preuve d'intégrité = **blobs HEAD** (AM-1). U-4b-0 (« consommer `@monark/rpc-guard` ») est **SUBSUMÉ par GARDE-HELIUS-2** (ADR-U4b D5) : le discover/calib consomme le recorder GARDÉ, aucun second compteur de budget. **État de livraison au HEAD `0534551` (mesuré, merges) : GARDE-HELIUS-2a `e98b54f`, 2b-i `8ba2cbc`, 2b-ii `5394dfe`, 2b-iii `985fed9` — TOUS FUSIONNÉS.** Le recorder GARDÉ (`record.ts`) est donc **final** ; ses arguments sont fixés sur le code fusionné (§5a), non « confirmés au commit ». Les scripts payants `u4-*` sont sous garde (2b-iii, via `scripts/census/u4-guard.mjs`) ; `u4-probe.mjs` a été **supprimé** au commit `d311809`. L'amendement ADR-U4b daté 2026-09-21 (C-7) est EN LIGNE : `rpc.ts` au gel D4, U-4b-0 subsumé en D5, contrainte d'ordre NARABI-OPS-1d, note « plafond par compte » (décision 121). L'amendement ADR-U4b daté 2026-09-22 (décision 126) est EN LIGNE : score unilatéral, re-gel du sha #1, région servie = borne haute.

**Préconditions dures du commit** (récap §7, chacune un item formé à déclencheur) : GARDE-HELIUS-2b-ii + 2b-iii fusionnés (**SATISFAIT**, `5394dfe` / `985fed9`) ; C-15 (Mondrian 2003 [lu]) satisfaite ; `PR-U4-3-bis` si l'impl de l'épisode découvert ≠ v3.5.0 (H-1) ; **paramétrage -1b du labeler et du prober D_e** (§5c, §DISC, condition (i-a) et Q-D).

---

## §DISC — Règle de sélection de l'épisode FRAIS, PRÉ-ENREGISTRÉE (G0 §2, [C-5]/[C-6])

Contrainte de fond (mesurée, `scripts/census/u3-realized.mjs:6-8` (commentaire des trois événements) et `:73-77` (`EVENTS`)) : le census A n'a observé que trois clusters (e1 sUSDe, **e2 WETH = CONCEPTION**, e3 sUSDe) ; seul e2 est WETH-collatéral (`clusterLo=23545088, clusterHi=23557060`, `:75`). U-4b **découvre** un nouveau cluster WETH (~280 k appels, décision 91). Règle fixée avant tout appel :

```
# Entrées : B_lo, B_hi_rule, e2_window=[23545088,23557060], N_min (=50, ruling E-I-2)
B_lo        = 22803459                      # bascule feed WETH → proxy SVR 0x5424384b… (PR-U4-1:41,45) : sémantique D_e == e2
B_hi        = finalized - 64                # RÈGLE : finalized lu à l'exécution, horodaté dans le brut de découverte
logs        = getLogs(Pool, [LIQ_TOPIC], B_lo, B_hi)      quorum-2   # LIQ_TOPIC = u3-realized.mjs:52 — COMPTÉ AU BUDGET [C-19]
logs        = { L in logs : block(L) not in e2_window }            # e2 exclu : conception, jamais servi

# clustering VERBATIM la règle U-3 D2 (ADR-U3:30-31) :
for each L in logs ordered by (block, logIndex):
    if collateralAsset(L) != WETH: continue
    if L not yet assigned to a cluster:
        B_first = block(L)
        B_last  = firstBlockAtOrAfter( ts(B_first) + 86400 ) - 1     # windows.ts ; bloc jamais horodaté
        cluster = { M in logs : collateralAsset(M)==WETH and B_first <= block(M) <= B_last }
        residual_outside_window += { M : block(M) not in [B_first,B_last] }   # nommé, compté

eligible(cluster) :=
      collateralAsset == WETH
  AND B_last <= B_hi                                                          # fenêtre 24h COMPLÈTE ; sinon window_truncated compté [C-5]
  AND count(distinct liquidated accounts in cluster) >= N_min                 # N_min = 50 (E-I-2)
  AND version_ok(impl(Pool @ B_first))
candidats = { cluster : eligible(cluster) }

episode = argmin over candidats of B_first          # (i) PREMIER éligible chronologiquement (E-I-1 ; moindre sélection-sur-la-taille)
# tie-break secondaire (B_first égal) : plus grand count(distinct liquidated), puis address min
episode_id = "weth-" + date(B_first)
B_first, B_last, B0 = B_first - 1                    # écrits dans episode-selection.json, DÉRIVÉS des bruts
                                                     # NB : B0 est le --block du recorder (§5a) ; B_lo (22803459) est la borne getLogs ci-dessus,
                                                     #      PAS le --from-block du recorder (§5a : plancher d'énumération Transfer aWETH).

version_ok(impl) :=  (impl == v3.5.0  0x97287a4f…)  OR  (impl_diff_LiquidationLogic_sol_lu_et_declare_NEUTRE(impl))
```
`episode-selection.json` reproductible depuis `(prereg_sha, brut de découverte)` (`u4b_episode_selection_is_deterministic`). Les 5 constantes close factor sont identiques v3.3.0→v3.7.0 (`PR-U4-3:159-160`) ; le risque porte sur la logique ⇒ **`PR-U4-3-bis` (lire l'impl effective au niveau [lu], déclarer le diff NEUTRE) est une PRÉCONDITION** de tout ŷ sur un épisode v3.6.0 (H-1). Toute relaxation post-H-0-NON (fenêtre, N_min) = **D-n déclarée au PLI**.

**Outil de la passe getLogs LiquidationCall : NON FIGÉ ICI (Q-D).** Aucun script nommé n'exécute cette passe au HEAD : `u4b-discover.mjs` (table Tuyaux de l'ADR) **n'existe pas** (`scripts/census/u4b/` = `u4b-reduce.mjs`, `u4b-scores.mjs` seuls) ; `u4-oracle-path.mjs` fait la série `AnswerUpdated` (D_e), pas les `LiquidationCall`. La RÈGLE ci-dessus est pré-enregistrée ; l'outil gardé qui l'exécute (et le paramétrage de `u4-oracle-path.mjs` pour le feed frais) est une **précondition à déclencheur « avant la course »** — Q-D.

---

## Définitions pré-enregistrées (ADR-U4b D1/D2/D3)

- **Unité** = compte **mono-collatéral WETH** à B₀ : `collat_non_WETH_base(p0)/total_collateral_base(p0) ≤ X`, **X = 0** (lecture stricte, décision 91). e-mode hors {0,1} ⇒ fail-closed. LST = catégorie e-mode 1 ∧ ≠ WETH (rsETH hors) ; dette LST tenue à p0 (`lst_debt_at_p0`). Ancre pré-B₀ = `AnswerUpdated ≤ B₀` réel.
- **ŷ** (ADR-U4b D2, règle v3.5.0 [lu] `PR-U4-3`, tag `6138e1fda…`) = **maximum liquidable en UN appel au PREMIER FRANCHISSEMENT p\*** : `ŷ = max_r min(CF(HF), C_r/m_r)` (multi-dettes = **max**, jamais Σ), `CF_base = min(D_r, 0,5·D_tot)` si `C_r ≥ 2000e8 ET D_r ≥ 2000e8 ET HF(p*) > 0,95e18` (strict) sinon `D_r` ; `CA = floor(C·1e4/bonus)` ; `MustNotLeaveDust` en **OU** ; `m` (bonus) lu de la **réserve** / de `emode_raw` (C-14), **non figé par le prereg** — valeurs mesurées sur e2 : 10 100 (e-mode) / 10 500. Convention **`D_tot(p*) = total_debt_base − vWETH@p0 + vWETH@p*`** (agrégat on-chain autoritaire, ADR-U1 C-2). Score/ŷ en **devise de base 8-dec**, convention floor partagée avec `toBase` de Y. (Code mesuré : `u4b-scores.mjs:89-90` réserve WETH requise ; `:113` throw `deficit_base_no_price` hors USDT.)
- **Score, α, nMin, Mondrian** (ADR-U4b D3, amendement 2026-09-22 décision 126) : `s = max(Y − ŷ, 0)` (**exceedance UNILATÉRALE**, base 8-dec, clipée à 0 ; ligne mesurée `u4b-scores.mjs:245` : `const score = Y > yhat ? Y - yhat : 0n;`), tri canonique ; `q̂` = p-ᵉ plus petit, `p = ⌈(n+1)(1−α)⌉`, **α = 0,01**, **nMin = 100** par strate (Dunn 2022 Thm 11 strict) ; strates de la classe A par taille de ŷ aux frontières **du code** (`STRATA_CUTS`, `u4b-scores.mjs:54`) : `< 2000e8`, `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$`. **Région servie = borne haute `[0, ŷ + q̂_k]`, jamais un intervalle** (décision 126 ; texte servi « upper bound » ; le champ de fil `region.kind` reste le littéral `"interval"` du contrat gelé `CoverageVerdict` — `packages/contracts/src/types.ts`, `schemas/coverage-verdict.schema.json` — la borne haute est une FORME, `lo = 0` par construction, pas un nouveau `kind`). En **couverture**, jamais en probabilité (vocabulaire gaté). Précondition C-15 (Mondrian 2003 [lu], κ fixée A PRIORI) satisfaite.
- **Classes** : **A** `liquidation-eligible-coverage` = {ŷ > 0 sous D_e} ∪ {liquidés} — **la seule SERVIE** (décision 108) ; **B** `liquidation-realized-given-liquidated` = liquidés — **calculée hors ligne, JAMAIS servie**. Le code gelé émet les DEUX cellules sur toute donnée (`u4b-scores.mjs:248-274`) ; -2 décide seul ce qui est servi. **E-I-3 close par la décision 108** (ruling Q8).

---

## §Y — Convention d'étiquetage Y, gel DÉFÉRÉ et règle d'abstention (ruling Q11 : option (ii) + gel déféré)

**Convention de Y = ADR-U3 D1/D2 (adoptée le 2026-09-20, ANTÉRIEURE à toute donnée -1b), VERBATIM `docs/adr/ADR-U3-realized-labels.md:22-33`** :
> **D1 — Étiquettes réelles.** Y_{i,e} est **mesurée on-chain**, par position `(user, debtAsset, collateralAsset)`, agrégée sur la fenêtre 24 h, décomposée : `repayment_base = Σ floor(debtToCover × getAssetPrice(debt)@bloc / 10^dec)` ; `seized_base = Σ floor(liquidatedCollateralAmount × getAssetPrice(coll)@bloc / 10^dec)` (frais protocole exclu) ; `deficit_base` = Σ `DeficitCreated(user, debtAsset, amount)` de la fenêtre joints par `(user, debtAsset)` (toute tx ; D-5). Montants base en `BASE_CURRENCY_UNIT()` (8 déc., **lu on-chain**, jamais codé). Sommes natives conservées. **Prix au bloc du log**, jamais un prix moyen (résidu `price_moved_in_block` si l'oracle a bougé dans le bloc).
> **D2 — Fenêtre ancrée bloc, jamais horodatée.** `B_first` = premier `LiquidationCall` du cluster (A-rawlogs, déterministe) ; `B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`apps/sentinel/src/windows.ts`, ts de bloc en quorum-2). Lignes de bloc > B_last comptées en résidu `outside_window` (e2 : 29). Le cluster e2 = collatéral WETH, bloc ∈ [23545088, 23557060] (M-2b, sha-pinné). *(clause e2 = jeu de conception ; l'épisode frais applique la même RÈGLE avec ses propres `B_first`/`B_last`.)*

**Règle d'agrégation servie** : `Y = Σ_user (repayment_base + deficit_base)` + complétion USDT — **déjà GELÉE** dans `u4b-scores.mjs:103-121` (sha `2f9a31f6…`, re-gel décision 126 ; logique d'agrégation inchangée). `toBase` de Y = **floorDiv** (mesuré blob HEAD, `u3-realized.mjs:101` `floorDiv`, `:103-104` `toBase = floorDiv(BigInt(amount)·BigInt(price), 10n**BigInt(dec))`).

**Gel DÉFÉRÉ à la sonde (le fichier ne peut être gelé entier : il est modifié en -1b — PRÉCONDITION, pas détail)** :
- **PRÉCONDITION -1b (mesurée).** `u3-realized.mjs` **ne peut pas étiqueter l'épisode frais tel quel** : `EVENTS` (`:73-77`), `RAWLOGS_SHA` (`:43`) et le chemin prereg (`:405-408`, garde contre `docs/PLAN-u3-prereg.md`) sont codés **e2/e1/e3 en dur**. Le **paramétrage -1b est CONFINÉ à la section LIVE** (`:269+` : `EVENTS`, `RAWLOGS_SHA`, chemin prereg deviennent des paramètres) ; le **réducteur PUR** (`canon`/`toBase`/`reduceU3`, `:81-267`) ne change pas. **Condition de bascule (i-a)** : si -1b devait toucher le réducteur pur, l'extraction du réducteur en fichier séparé + **un 9ᵉ sha gelé** (au sens du §2, en plus des 8 gelés + labeler) devient OBLIGATOIRE avant le prereg (le gel déféré ne protège que ce qui n'a pas besoin de changer).
- **`labeler-sha` (marqueur, PAS un flag du recorder)** = sha256 **LF** du blob HEAD de `scripts/census/u3-realized.mjs`, **= `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` aujourd'hui** (mesuré, §2). Écrit par l'**orchestrateur** dans la **sonde go/no-go ET un fichier SIDECAR daté (jamais dans le brut, que `record.ts` écrit — voir en-tête), AVANT le premier appel** ; G2 rejoue avec ce blob ; changement postérieur = **D-n**, labels re-dérivés = post-hoc non servables. *(La MISSION le liste comme argument du recorder ; `record.ts` (`parseUkemiArgs:130-174`) **n'a pas** de flag `--labeler-sha` — écart remonté en Q-B.)*
- **Invariant behavioural** : `u3_series_replay_bit_identical` vert avec `U3-realized.jsonl` sha **`b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923`** (pin `PROVENANCE-u3.md:10`, explicitement épinglé ici — ferme la co-édition fixture/PROVENANCE). Test `u4b_labels_replay` = le labeler paramétré reproduit e2 byte-identique depuis `U3-inputs.jsonl`.

**Règle d'abstention PRÉ-ENREGISTRÉE (VERBATIM avis advisor-defi §Q11 l.44, le point clé anti-« rustine labeler »)** :
> « ligne de label abstenue (`no_quorum`, `repayment_base: null`) ou `deficit_base_no_price` sur un actif ≠ USDT ⇒ **re-tirage sous budget jusqu'au quorum** ; sinon **STOP + D-n** ; **jamais d'exclusion silencieuse d'un compte liquidé de la cellule A** ; le code gelé jette, et c'est voulu. »
Les deux chemins fail-closed qui jettent (avis §Q11 l.23 ; **mesurés blob HEAD ce tour**) : `u3-realized.mjs:225` (`repayment_base: abstain ? null : repayBase.toString()`) et `u4b-scores.mjs:113` (`throw … deficit_base_no_price on non-USDT asset … (fail-closed)`). Compteur `labels_no_quorum` au census. **Portée** : la convention de Y est fixe pour la **vie de la calibration servie** (la région servie est jugée contre un Y futur étiqueté par la même convention), pas seulement jusqu'à la course (Barber-Candès-Ramdas-Tibshirani 2023 **[lu par advisor-defi sur texte local `_txt/`, avis §Q11 l.26]** : la fonction raw→Y fait partie de la fonction de non-conformité S, qui doit être pré-fixée et indépendante du jeu de calibration).

---

## H-0..H-7 — hypothèses avec critère de NON (rulings Q6 appliqués)

- **H-0 (existence)** : ≥ 1 cluster WETH éligible dans `[B_lo,B_hi] \ e2`. NON ⇒ arrêt `no_fresh_episode`, item formé (élargir fenêtre / abaisser N_min = décision investisseur), AUCUNE course.
- **H-1 (version)** : impl @B_first `== v3.5.0` OU diff [lu]-neutre. NON (diff non lu) ⇒ course EN PAUSE, `PR-U4-3-bis`.
- **H-2 (n/strate)** : n(strate) ≥ nMin ; NON ⇒ strate `under_calib` (comptée). q̂ null, jamais un max silencieusement clipé (`u4b-scores.mjs:63-71`, `qhatOf` fail-closed n < NMIN OU p > n).
- **H-2bis (q̂ INTÉRIEUR — condition d'épisode, décision 126, distincte de nMin)** : nMin=100 garantit la non-trivialité (Dunn 2022 : `n > 1/α − 1 = 99`), PAS un quantile intérieur. À α = 1 %, `p = ⌈(n+1)·0,99⌉ = n` tant que **n < 199** ⇒ q̂ = **max** de la strate (effet de n, indépendant du score). **Condition SERVIE pré-enregistrée** : `n ≥ 199` par strate servie pour un q̂ intérieur (à α = 5 % : `≥ 39`) ; sinon **q̂ = max, rapporté tel quel**. Sur e2, strate 1 (n=148 < 199) ⇒ q̂₁ = max = `3609978241254`.
- **Rapport obligatoire à côté de q̂₀ (décision 126, clause 3)** : (a) le compteur census `crossed_yhat_zero` (comptes ayant FRANCHI mais dont tout `D_r` floore à 0 ⇒ ŷ=0 ; `u4b-scores.mjs:224`) ; (b) l'ensemble **{ŷ=0 ∧ liquidés}** **avec leur Y**, **sous-divisé par `pstar`** — `pstar=null` (« liquidé sans franchissement » = no_crossing) et `pstar≠null` (franchi mais ŷ=0) — la strate 0 est gouvernée par ces échecs de règle, pas par l'erreur de close factor. Sur e2 [mesuré] : `crossed_yhat_zero` = **1** (franchi, NON liquidé, hors cellule) ; {ŷ=0 ∧ liquidés} = **3**, tous `pstar=null` (**3** sans franchissement / **0** franchi-ŷ0), Y = 32 772,78 $ / 231,70 $ / 106 668,92 $ ; ces ensembles sont **DISJOINTS** (donc **3, pas 3−1**) ; q̂₀ = 231,70 $ EST le 3ᵉ échec de règle (`n − p = 2` en exclut deux).
- **H-3 (échangeabilité INTER-épisodes) — TEST EXACT BÊTA-BINOMIAL 5 % (ruling Q6, remplace `k=2`)** : appliquer le q̂ FRAIS à la cellule e2 ; sous H0 d'échangeabilité, `#{scores e2 ≤ q̂_frais}` suivrait **exactement** une loi bêta-binomiale `(n_e2, p, n+1−p)` **si les scores étaient continus** ; sous le score **UNILATÉRAL** `max(Y − ŷ, 0)` (décision 126) ce n'est PLUS le cas — [mesuré, fixture régénérée] les scores e2 nuls par strate = 344/363, 120/148, 38/46, 7/8 (509/565 au total), soit **exactement 0** (atomes), donc `#{s ≤ q̂}` n'est pas bêta-binomial. **Critère de NON** = **test exact bêta-binomial UNILATÉRAL à niveau pré-enregistré 5 %, CONSERVATEUR sous ex æquo (atomes en 0 comptés couverts)** : le test « couverture trop basse » reste **valide mais conservateur** (perte de puissance, jamais anti-conservateur) ; appliqué **par strate SERVIE** (q̂ par strate) **ET sur la cellule A poolée** ; couverture définie `s ≤ q̂` (fermée, cohérente avec la région borne-haute). (Alternative pré-enregistrable : tie-break randomisé à graine pré-enregistrée, conformal « smoothed ».) NON sur une strate servie ⇒ **écart en chiffres** (Σ w̃·d_TV, Barber 2023 Thm 2) pour cette strate ; **aucune revendication sur un nouvel événement**. **`k=2` REJETÉ** : ce n'est pas un niveau (taux de faux-NON sous H0 mesuré = 3,6 % à n=150, 5,8 % à n=565, 6,3 % à n=300, 10,4 % à n=1000 ; dépend de n). **Strate e2 de comparaison < 50** (strates 2 : 46, 3 : 8) ⇒ **H-3 non testable, rapporté**. **Texte servi (C-11)** : « un OUI de H-3 ne licencie rien de plus » ; mutant de sur-revendication ⇒ ROUGE.
- **H-4 (multi-appels) — 5 % ratifié AVEC le chiffre e2 (ruling Q6)** : e2 = **11,1 % de la cellule A** (11/99 liquidés mono-WETH) / **12,7 % tous liquidés** (24/189) ont > 1 `LiquidationCall` ⇒ **NON attendu** sur l'épisode frais (déclaration de sous-prédiction acquise d'avance ; 5 % ne teste rien). Grandeur informative rapportée : **part de Y provenant des appels APRÈS le premier**, par strate (médiane et Σ).
- **H-5 (population) — DÉRIVÉ de nMin (ruling Q6)** : `k_H5 = nMin = 100` (Dunn 2022 Thm 11 strict, `n > 1/α − 1 = 99`). Population e2 mono-WETH ≈ 9 452 ⇒ facteur ~100. Condition **nécessaire, non suffisante** de H-2 (population ≥ 100 n'implique pas cellule A ≥ 100 par strate). Rapporté.
- **H-6 (série SERVIE)** : valeur d'oracle servie ∈ série `AnswerUpdated` + borne de retard 1–3 events ; NON ⇒ p_min re-défendu par encadrement.
- **H-7 (identité)** : à p\*=p0, `HF == hf0` EXACT ; mutant LT_W←0 ROUGE.

**Cadre (ruling Q6, à écrire tel quel)** : H-3, H-4, H-5 sont des **seuils de RAPPORT**, pas des paramètres de validité. **Rien de servi ne dépend de ces trois constantes** (H-3 OUI « ne licencie rien de plus », NON = rapport chiffré ; H-4 NON = déclaration ; H-5 = rapporté). Établis (paramètres de validité) : `α=0,01`, `nMin=100`, coupes `{2000e8, 100k$, 1M$}`, `X=0` (C-V-7), `N_min=50` (E-I-2), tie-break (i) (E-I-1).

---

## (2) Tableau des 8 sha GELÉS + labeler — recompute depuis les blobs HEAD, comparaison à l'ADR

Méthode (régime B) : `git -C F:/Monark show HEAD:<path> | tr -d '\r' | sha256sum` — HEAD `0534551`. Recomputé au commit réel (D4) ; **ÉCART = STOP**. Recompute complet + comparaison ligne à ligne dans `MESURES.md`.

| # | Fichier | sha256 LF recomputé (HEAD `0534551`) | Référence ADR | Verdict |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` (**re-gelé décision 126** ; était `9ad20666…f83feacf`) | **ADR-U4b amendement 2026-09-22 §3** `2f9a31f6…f51445c0` | **CONCORDANCE (re-gel)** |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | ADR-U4b D4 / amendement §3 | **CONCORDANCE** |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | ADR-U4b D4 / amendement §3 | **CONCORDANCE** |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | ADR-U4b D4/C-V-2 (`7bee76fc…`) | **CONCORDANCE (préfixe)** |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | ADR-U4b D4/C-V-2 (`3376eb08…`) | **CONCORDANCE (préfixe)** |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | ADR-U4b D4/C-V-2 (`9206df91…`) | **CONCORDANCE (préfixe)** |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | **ADR-U4b amendement 2026-09-21 §1 (complet)** `0e232519…c1c65ca0` | **CONCORDANCE** (ruling Q2) |
| 8 | `packages/contracts/src/calib-digest.ts` (`contracts_frozen`) | `3603265d0a1f1a4e3e1a1d57b4b568fcadf4f6861351c2ca49b38dc794c42380` | ADR-U4b amendement §3 (`3603265d…94c42380`) | **CONCORDANCE (déjà `contracts_frozen`)** |
| — | `scripts/census/u3-realized.mjs` (**labeler, gel déféré**) | `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` | `labeler-sha` attendu (ruling Q11) `755b3a38…` | **CONCORDANCE** |

**Bilan : les 8 sha gelés + le labeler concordent (ligne à ligne) avec les références ADR — sha #1 vs l'amendement daté 2026-09-22 §3, sha #7 vs l'amendement 2026-09-21 §1, les autres vs D4/C-V-2 et l'amendement §3. AUCUN ÉCART. PAS DE STOP.**

> **Note décision 126 (2026-09-22, lot U-4b-SCORE-1, fusion `6652ed0`)** : le sha #1 `u4b-scores.mjs` est **re-gelé** `9ad20666…` → `2f9a31f6…` (score unilatéral `max(Y − ŷ, 0)`) ; les 6 autres gelés + le labeler + `calib-digest.ts` restent **inchangés** (tableau AVANT/APRÈS : `ADR-U4b` amendement 2026-09-22 §3). Cette table est **recomputée au commit réel du prereg** (régime B, blobs HEAD) ; toute divergence = ÉCART = STOP. La seule édition de code du lot SCORE-1 : la ligne `u4b-scores.mjs:245` (avant l'insertion du commentaire : `:244`) + commentaire `:29-30`.

**Fermeture transitive (mesurée, `MESURES.md`)** : sur `apps/**/src` + `packages/**/src`, hors builtins `node:*` et `@monark/contracts` (= `calib-digest.ts`, `contracts_frozen`, gelé sha #8), le jeu gelé {u4b-scores, u4b-reduce, record-u4b-calib, wadray, abi→rpc, rpc, l1-split} est **fermé** : `abi.ts:7` importe `TRANSFER_TOPIC` de `../rpc.ts` (constante littérale `rpc.ts:15`) ; `wadray.ts`, `l1-split.ts`, `rpc.ts` sont des feuilles (`rpc.ts` n'importe que `node:crypto`). Le **labeler** `u3-realized.mjs` est gelé par sonde (marqueur `labeler-sha`), non par sha in-repo (modifié en -1b, section live).

---

## (3) Liste fermée C-V-7 (verbatim) + formulation CA (a) (ruling Q4) + agrégat ≠ Σ jambes CLOS (ruling Q5)

**C-V-7 — liste fermée, effet mesuré (VERBATIM `CHECKPOINT2-lot-u4b-1a.md` §C-V-7)** :
> « X=0 exact (6 611 exclus, dont 483 sub-$1, C-V-4) ; e-mode fail-closed hors {0,1} (33) ; LST = emcat 1 ∧ ≠ WETH, rsETH hors, dette LST tenue à p0 (105 comptes, Σ|Δŷ| ≈ $695) ; tie-break dust = premier dans l'ordre des balances (`dust_bounded` seul) ; scale 1 ; score en devise de base vs floor natif (C-G2-3 a) ; `CA` en division floor (C-G2-3 b, `PR-U4-3-ter` formé) ; **convention D_tot (C-V-1)** ; `>` strict sur 0,95e18 asserté par lecture, non discriminable sur e2 (0 compte à l'égalité). »

**Précision C-V-4** : « 483 résidus sub-$1 = rounding » est **faux** ; 478/483 sont de vrais collatéraux non-WETH minuscules (histogramme : 5 ≤ 5 u., 16 dans 6–100, 135 dans 101–1e4, 199 dans 1e4–1e6, 128 dans 1e6–1e8). X=0 (lecture stricte) confirmé.

**Convention D_tot (C-V-1) — deux mesures d'effet** : Σ jambes floor vs code ⇒ 140/565 ŷ (±1–2 u.), 1 p\* (`0x01a7bb45…`), digest (mutant ROUGE) ; variante « Σ ceil, WETH repricé » vs code ⇒ **0/565 ŷ, 0 p\*, q̂ identiques** ([mesuré] advisor-defi). La convention D2 gelée équivaut à la convention de principe sur e2.

**Formulation de l'écart CA à pré-enregistrer (ruling Q4 = (a) ; VERBATIM avis advisor-defi prereg §Q4)** :
> « ŷ est calculé en devise de base (8 déc.) avec la convention floor de `toBase` (ADR-U3 D1). Il n'est PAS le chemin natif du contrat v3.5.0 (floor natif → `percentDivCeil` → floor `toBase` ; lu [lu] PR-U4-3-ter). Écart **déclaré** (non prouvé formellement, vérifié sur e2) : |ŷ_base − toBase(ŷ_natif)| ≤ 1 quantum natif de l'actif de dette converti en base (`prix_dette / 10^dec_dette`, unités 8-déc) + 2 unités (percentMul demi-arrondi ±1, conversion floor ±1), sur toutes les branches (CA et close factor). Mesuré sur e2 (conception) : 3/565 comptes `ca_binding`, tous strate 0, Δ ∈ {−85 632, −106 302, +3 683} unités ; Δq̂ = 0 sur toutes strates, 0 strate changée, 0 p\* changé. Sur l'épisode frais, l'écart est **re-mesuré hors ligne après la course** (recette R2 de l'avis advisor-defi 2026-09-21, hors gel), **rapporté, sans effet sur les scores servis** ; Δq̂ ≠ 0 sur une strate servie ⇒ D-n déclarée au PLI, la calibration servie reste celle du code gelé. Libellé : "maximum liquidable en un appel, en devise de base, à un quantum natif près". »

**(b) « chemin natif complet »** = item formé **« calibration suivante », NON RÉTROACTIF à l'épisode -1b** (ruling Q4). Il n'existe pas de « (b) plus tard pour -1b » : (b) exige un re-gel de `u4b-scores` avant le prereg, sinon rescorer post-course est post-hoc. Gain mesuré de (b) : Δq̂ = 0.

**« agrégat ≠ Σ jambes » — item G7 formé : CLOS (ruling Q5)**. Expliqué par [mesuré + lu] : `total_debt_base == Σ_jambes ceil(montant·prix/unité)` pour 16 092/16 092 comptes (advisor-defi) ; `GenericLogic._getUserDebtInBaseCurrency = MathUtils.mulDivCeil` ⇒ dette au PLAFOND en base, changelog v3.5.0 tag-pinné « rounded up » pour la dette, « always round in favor of the protocol » (RAPPORT-lecteur PR-U4-3-ter Q5 [lu, WebFetch ; `MathUtils.mulDivCeil` elle-même NON LUE — preuve dure = identité 16 092/16 092]).

---

## (4) Protocole agrégat Chainstack A-4 (ADR-GARDE-HELIUS A-4) + décision 121 PAR COMPTE + créneaux exclus

**Mode et nœud** : `reconcile --mode aggregate-calibration` (`packages/rpc-guard/src/cli.ts:22-32`, `reconcile.ts:52`) ; **1ʳᵉ course Chainstack = ÉTALONNAGE** ; **nœud Global CONFIRMÉ** (console Statistics, A-1). Borne dure BLOQUE (exit ≠ 0 si `Δtotal_ru > Σ ledger_run`) ; écart souple **CONSIGNÉ** (`softDeviation`, exit 0) ⇒ pré-enregistre la bande de la 2ᵉ course. `AGGREGATE_ONLY_OPERATORS = {chainstack}` (`reconcile.ts:26-28`) ⇒ `reconcile` sur `chainstack` **fail-closed** sans `--mode aggregate|aggregate-calibration`.

**Décision 121 — plafond Chainstack PAR COMPTE (portée orchestrateur, CHANTIERS:602-603 ; verbatim investisseur : « A »)** : le cap 16 M RU (décision 115) est **par COMPTE, tous réseaux confondus** (`ethereum-mainnet` Ukemi + `solana-mainnet` Bell + autre). Conséquences portées ici : **un seul ledger** de cycle Chainstack, **une seule clé de cycle**, **floor = somme des réseaux** lu au tableau de bord ; le rapprochement **A-4 lit le total du compte ET la ligne `ethereum-mainnet`** (le job Narabi et une éventuelle sonde Bell comptent dans le même plafond) ; la ventilation par réseau est un **attribut du journal (`network`), jamais un second plafond**.

**Protocole A-4 (couche règles ; INSTANCES épinglées par sha au prereg)** :
- **(i)** fenêtre d'une **JOURNÉE entière** ;
- **(ii)** **double lecture de stabilité** de `after` APRÈS le délai de mise à jour (« Data updates every few hours », FAITS pt 10) — deux lectures identiques espacées ; **espacement = INSTANCE à remplir à la course** ;
- **(iii)** **aucune fenêtre before/after de rapprochement ne chevauche l'heure d'un créneau du job Narabi** (addendum C-4 verbatim) ;
- **(iv)** le résiduel Narabi soustrait = **MINORANT** (borne inférieure), lu au **journal du sentinel** (nombre d'appels Chainstack du jour, réseau `ethereum-mainnet`) — un résiduel surestimé cacherait un contournement.

**Instances portées par le prereg** : jour ; heures des deux lectures (ii) ; floor (`--floor`, lu au dashboard = somme des réseaux, décision 121) ; chiffre du résiduel Narabi ; **sha du journal du sentinel**.

**Créneaux exclus — CALCULÉS depuis les créneaux fournis** (donnée orchestrateur : Narabi 00:30 / 03:30 / 06:30 / 09:30 UTC, durée + 30 min ; **à RECONFIRMER au journal du sentinel à la course**, ruling Q9 — le worker n'a mesuré que « publiant 00:48 UTC » + « 4 créneaux/jour », addendum C-4). Fenêtres d'exclusion des **instants de lecture** before/after (UTC) : **00:30–01:00, 03:30–04:00, 06:30–07:00, 09:30–10:00**. Les deux lectures (ii) se placent hors de ces 4 fenêtres, après le délai de mise à jour. (00:48 mesuré ∈ [00:30–01:00], cohérent.)

**Corollaires** : overage DÉSACTIVÉ (A-5) ⇒ à quota atteint Chainstack ARRÊTE le service (dont Narabi), pas de facture ; le cap protège la disponibilité. Quota mensuel exact / prix d'overage : NON LU (procurement si une course approche 16 M RU).

---

## Sonde AVANT la course (go/no-go, G0 §6 + ruling Q11) — dont GO EN DEUX TEMPS `--filter-only`

**Go en deux temps du recorder (dérive `--max-calls`, mesuré `record.ts:344-377`)** :
- **Temps 1 — `--filter-only`** : énumère les holders aWETH puis lit `getUserConfiguration` (quorum-2, sans lecture par compte) ⇒ `n_at_risk_config` et `projection_remaining_calls = 9 × n_at_risk_config` (`record.ts:367`). **Le temps 1 porte les MÊMES 6 arguments requis** (`--ledger-dir --cycle --floor --max-ru --method-caps --max-calls`) + `--operators` : les throws `record.ts:224-247` sont AVANT la branche `filterOnly` (`:345`). Son `--max-calls` = énumération getLogs (sonde (a), ~1 412/opérateur) + `holders × 2` (config quorum-2) + marge déclarée. **MÊME `--resume` aux deux temps** (`record.ts:326-338,55-58`) : les lectures de config sont mises en cache ⇒ le temps 2 les rejoue à **0 budget**.
- **Temps 2 — course complète** : `--max-calls` = énumération (temps 1) + `9 × n_at_risk_config` + **marge déclarée** (instance de sonde, écrite dans le go/no-go) ; `--method-caps` fixés sur les trois méthodes du recorder (`eth_call`, `eth_getLogs`, `eth_getBlockByNumber`). Aucune valeur devinée : la RÈGLE est pré-enregistrée, les valeurs sont des instances de sonde.

**Autres estimations de sonde** :
- **(a)** énumération `Transfer` aWETH ≈ **1 412 getLogs/opérateur** ;
- **(b)** appels projetés `≈ N × (1 + k_coll + 2 + k_debt) × 2` ;
- **(c)** sonde getLogs large **Pocket L-5** (précondition POOL-RPC-1a L-3 branche B) ;
- **(d)** **1 `eth_call` `s_cutoffTime()` @B_fresh sous garde** (E-I-7 = OUI) ;
- **(e)** **distinct-par-OPÉRATEUR (`operatorOf`) ≥ 2/méthode** [C-3] — recorder avec `--operators` = 5 keyless + chainstack (§5a) : eth_call = **3 opérateurs distincts keyless** {drpc, mevblocker, pocket} ({nodies, pocket} = 1, `rpc2.ts:28-31`), getLogs = **4** {drpc, mevblocker, tenderly, pocket} — **≥ 2 même chainstack benchée** (marge de la « marge nulle » de -1a résolue) ; **part Chainstack projetée**, **plafond** (par compte, décision 121), **règle d'arrêt** (dépassement projeté ⇒ arrêt + consultation) ;
- **(f) Gel temporel (ruling Q11)** : sha LF de CE prereg (naît au commit, §8b) **ET `labeler-sha`** (blob HEAD de `u3-realized.mjs`, `755b3a38…`) **ET HEAD `0534551`** écrits **par l'orchestrateur** dans la sonde **ET un sidecar daté (PAS le brut, écrit par `record.ts` avec la seule provenance U-4)** **AVANT le premier appel** (marqueurs procéduraux, pas des flags de code) ;
- **(g) Compteurs d'abstention (ruling Q11)** : `labels_no_quorum` compté ; règle d'abstention = re-tirage sous budget jusqu'au quorum, sinon STOP + D-n, jamais d'exclusion silencieuse.
- **Discipline secret (A-7)** : jamais afficher une variable d'environnement ; contrôle par présence/longueur ; toute commande de **vérification** sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL …` (§8). La course LIVE du recorder utilise le vrai env (le transport gardé est le seul lecteur de clé, `record.ts:221-222`, `transport.ts:73`) — jamais imprimée ; **le labeler**, lui, tourne **KEYLESS-ONLY sous `env -u CHAINSTACK_ETH_URL`** (§5c, note (5)/CARTO-T1-1). **CGU lues avant tout appel d'API de données** (règle 2026-09-20).
- **Budget** : découverte comptée au budget [C-19]. Projection d'ordre : ~280 k appels (décision 91) × 2 RU/appel (recorder = méthodes 2 RU, A-1) ≈ **~560 k RU** (projection à raffiner par la sonde, ≪ cap par compte 16 M RU).

---

## (5) Lignes de commande FIGÉES (recorder final GARDE-HELIUS-2b-ii/iii ; `reconcile` ; labeler ; hors-ligne)

Les surfaces distinctes sont figées ci-dessous sur le **code fusionné** (`5394dfe`/`985fed9`). Chaque argument obligatoire est nommé ; les instances (chemins hors dépôt, block, floor, caps) sont marquées `<…>`. **Ordre du pool = `transport.ts:34-35` (source unique), PAS l'argument `--operators`** : `--operators` est une liste d'INCLUSION ; l'ordre effectif ETH_CALL = [drpc.org, mevblocker.io, nodies.app, pocket.network], GET_LOGS = [drpc.org, mevblocker.io, tenderly.co, pocket.network], `chainstack` **appended last** (`record.ts:255-256`, tiré seulement sur bench keyless ⇒ RU minimisés).

### (5a) Recorder de la course (`node apps/sentinel/src/ukemi/record.ts`)

Arguments REQUIS sans condition (`record.ts:223-248`, `parseUkemiArgs:130-174`) ; **`--exclude-operator` N'EXISTE PLUS** (2b-ii : ne pas lister un opérateur = l'exclure) ; **il n'y a PAS de flag `--labeler-sha`** (Q-B) ; `--prereg-sha` est **optionnel** et compare à `docs/PLAN-u4-prereg.md` (garde U-4 du LIVRE, `record.ts:239-241` — PAS ce prereg).

```
node apps/sentinel/src/ukemi/record.ts \
  --cluster weth \
  --block <B0 = B_first − 1 (§DISC), dérivé du brut de découverte> \
  --from-block <plancher d'énumération Transfer aWETH = max(reserveInitBlock, F) (record.ts:71) ; ≠ B_lo (22803459) de §DISC> \
  --operators drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack \   # NOMBRE DE KEYLESS FIGÉ = 5 (union transport.ts:34-35)
  --ledger-dir <F:\monark-ledger\<cycle>\ — hors dépôt, DOIT pré-exister (record.ts:224)> \
  --cycle <id unique par COMPTE (décision 121), même id pour tous les opérateurs demandés, keyless inclus (record.ts:226,264)> \
  --floor <FLOOR-INSTANCE — RU déjà consommés ce cycle, lu au dashboard = somme des réseaux (décision 121) ; DOIT être ≤ 16 000 000 (client.ts:74)> \
  --max-ru <MAX-RU-INSTANCE — plafond de COÛT du run, ≤ 16 000 000 − FLOOR-INSTANCE (Q7 ; deux plafonds séparés, client.ts:113/118)> \
  --max-calls <MAX-CALLS-INSTANCE — > 0, du go --filter-only : énumération + 9×n_at_risk_config + marge déclarée (record.ts:234-235,367)> \
  --method-caps eth_call=<cap>,eth_getLogs=<cap>,eth_getBlockByNumber=<cap> \   # REQUIS et NON VIDE (record.ts:232)
  --prereg-sha 9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb \   # LF sha de docs/PLAN-u4-prereg.md (U-4 LIVRE) ; OPTIONNEL ; recomputé au commit
  --concordance-out <hors dépôt — couture POOL-RPC-1a C-5/C-6 (record.ts:126,314-318,423)> \
  --resume <hors dépôt — cache request→result JSONL ; reprise après budget (record.ts:326-338)> \
  --out <hors dépôt — livre frais + provenance (record.ts:399-400)>
```
Le recorder ne lit **AUCUNE clé pour la sélection d'opérateur** (`record.ts:221-222` : `deps.env` passé AS-IS à `openGuardedClient`, transport = seul lecteur de clé) ⇒ « aucune sonde d'env » est vrai **du recorder**. Séquence de fin de course : voir §6 (le `finally` fait déjà N `unlock`).

### (5b) `reconcile` servi — sous-commande PROGRAMMATIQUE, PAS un binaire shell (Q-E)

`reconcile` est un sous-commande de `runCli(argv, deps)` (`cli.ts:17-34`) ; **au HEAD il n'existe AUCUN point d'entrée shell** (`cli.ts` n'a ni `main` ni run-guard `import.meta.url` ; `package.json` sans `bin` ; le SEUL appelant non-test de `runCli` est `record.ts:431`, pour `unlock`). Les `deps = { ledgerDir, floor, readSnapshot }` sont **INJECTÉS** (`cli.ts:10-14`), **pas lus depuis argv**. `argv` figé (signature `cli.ts:4,22-34` ; `--op` était MANQUANT dans le candidat ; `--mode` est un argument de `reconcile`, PAS du recorder) :

```
argv = ["reconcile",
        "--before", <snapshot dashboard AVANT>,          # lu via deps.readSnapshot (cli.ts:32)
        "--after",  <snapshot dashboard APRÈS (double lecture (ii))>,
        "--cycle",  <id du cycle Chainstack (décision 121)>,
        "--op",     "chainstack",
        "--mode",   "aggregate-calibration"]
deps = { ledgerDir, floor, readSnapshot }                 # INJECTÉS, pas argv (cli.ts:10-14,30-32)
```
**La surface servie qui invoque ce `reconcile` pour la course (et fournit `readSnapshot` des lectures dashboard before/after) N'EXISTE PAS en shell au HEAD** ⇒ **Q-E** (quel wrapper l'appelle ; déclencheur « avant la fin de course »).

### (5c) Labeler `u3-realized.mjs` — KEYLESS-ONLY pendant la course (note (5) / CARTO-T1-1)

**Ruling CARTO-T1-1 pré-enregistré** : `u3-realized.mjs` prépend une jambe Chainstack **HORS garde** si `CHAINSTACK_ETH_URL` est posée dans son env (`:273` `ENV_ARCHIVE`, `:274` `CALL_EPS`). Il tourne donc **KEYLESS quorum-2 SEULEMENT**, lancé avec `CHAINSTACK_ETH_URL` **absente** — vérifié par la ligne `providers`/`endpoints` du brut de découverte, qui ne doit lister **aucun hôte Chainstack**. **Sondes d'env du labeler à connaître** (contrairement au recorder) : `CHAINSTACK_ETH_URL` (`:273`) et `U3_MIN_INTERVAL_MS` (`:282`).

```
env -u CHAINSTACK_ETH_URL \                                  # FORCE keyless-only (CARTO-T1-1) — la SEULE course qui scrubbe cette clé
  node scripts/census/u3-realized.mjs \
  --rawlogs <A-rawlogs.jsonl de l'épisode FRAIS — hors dépôt, sha épinglé (u3-realized.mjs:400-404)> \
  --prereg-sha 835805ccc9941a101e760f4ca570f8bdb5ab30d5280e1897c473df7c788877d3 \   # LF sha de docs/PLAN-u3-prereg.md (garde U-3, :405-408)
  --max-calls <n — REQUIS, > 0 (fail-closed, :401)> \
  --raws-dir <hors dépôt (:390)> \
  --only <event-id de l'épisode frais (:391,:420)>
```
**PRÉCONDITION -1b (Q-D / condition (i-a))** : au HEAD, `EVENTS` (`:73-77`), `RAWLOGS_SHA` (`:43`) et le chemin prereg (`:405`) sont e2/e1/e3 **en dur** — le fichier ne peut PAS étiqueter l'épisode frais tel quel. Le paramétrage -1b doit être **CONFINÉ à la section LIVE** (`:269+`), le réducteur PUR (`:81-267`) inchangé ; la CLI finale est **confirmée à la sonde**, et le blob effectif est figé par le marqueur `labeler-sha` écrit dans la sonde/brut (§Y). Si le réducteur pur doit changer ⇒ (i-a) : extraction + 9ᵉ sha gelé AVANT le prereg.

### (5d) Hors-ligne (offline, après la course ; sous la vérification des 9 sha par l'orchestrateur)

Arguments TOUS obligatoires (épisode-agnostiques, C-12) ; aucune sonde d'env.
```
# réducteur driver (u4b-reduce.mjs:10-11,31-36) :
node scripts/census/u4b/u4b-reduce.mjs \
  --book-raw   <U4-book-<B>.raw.json FRAIS — hors dépôt (CA-11)> \
  --oracle-raw <U4-oracle-path-<tag>.raw.json FRAIS — hors dépôt> \
  --labels     <U3-realized.jsonl FRAIS (sortie 5c)> \
  --event-id   <episode_id> \
  --episode-tag <tag> \
  [--out <dir fixtures ; défaut apps/sentinel/test/fixtures/ukemi/u4b/>]

# scorer offline (runner ; u4b-scores.mjs:278-296) — book/oracle/u3 positionnels, TOUS requis :
node scripts/census/u4b/u4b-scores.mjs \
  <U4b-book-<B>.json> <U4b-oracle-path-<tag>.jsonl> <U3-realized.jsonl FRAIS>

# générateur de registre classe A (record-u4b-calib.mjs:9,64-69) :
node scripts/record-u4b-calib.mjs \
  --scores <U4b-scores-<tag>.jsonl> \
  [--scale 1]   # défaut 1, choix de méthode DÉCLARÉ (C-V-7), jamais un défaut d'épisode
```

---

## (6) Critères GO / STOP

**Séquence de fin de course** :
1. **`unlock` (N)** — au succès, au budget stop, ou sur un throw, le **`finally` du recorder fait déjà les N `unlock`** (`record.ts:429-432` : chaque opérateur demandé, payant ET keyless, une ligne `unlocked` chaînée). Le `unlock` **manuel** N'EST DÛ QU'APRÈS un **crash dur (SIGKILL)** qui laisse les verrous tenus (fail-closed, détectable ; `record.ts:426-428`) : le runbook fait alors N `unlock` AVANT `reconcile` (un `reconcile` sous verrou tenu ⇒ `LockHeldError`).
2. **`reconcile --op chainstack --mode aggregate-calibration`** (§5b) — **GO ssi `Δdashboard ≤ ledger_run`** (borne DURE ; `Δtotal_ru ≤ Σ ledger_run` en RU conservateurs). Bande souple `≤ max(50 RU, 0,5 % du run total)` (décision 113 / addendum C-1) : **CONSIGNÉE, non bloquante** en `aggregate-calibration`. `Δ > ledger_run` ⇒ **NO-GO dur** ; `Δ` négatif ⇒ **NO-GO `negative_delta`** ; rollover ⇒ NO-GO. **Le rapprochement lit le total du compte ET la ligne `ethereum-mainnet`** (décision 121).

**Plafonds anti-BUG fail-closed (décision 119, non levés par le GO durable ; décision 121 : PAR COMPTE)** : **Chainstack 16 M RU / cycle, PAR COMPTE** (décisions 115 + 121 ; `CHAINSTACK_CYCLE_CAP_RU`, `transport.ts:21`) ; `--max-ru` (run, fixé au commit depuis le floor lu sur place — ruling Q7) et `--method-caps`. **Plafond touché ⇒ STOP + retour investisseur** (« peu importe le coût » n'autorise pas une dépense par défaut logiciel — leçon HELIUS-1). Helius 8 M cr cité par 119 mais **inapplicable** (une course Ukemi ne verrouille jamais `helius`, A-2). Aucun gate suspendu (R-22) ; aucune règle de sécurité levée.

**GO durable amont (décision 119)** : la course U-4b-1b a le GO dès GARDE-HELIUS-2 fusionné (**SATISFAIT** : 2a/2b-i/2b-ii/2b-iii), prereg committé seul, rapprochement before/after — sans nouveau go.

**Journal de diagnostic durable sur course en ÉCHEC (C-R-b7, item G7 GARDE-HELIUS-2b-ii §5) — PRÉ-ENREGISTRÉ + TROU DE CODE nommé (Q-C).** Exigence : sur une course qui échoue, `rpc_errors` (par `e.name` : `http:` payant, `code:` keyless ; sans secret, `record.ts:40,288-312`), `errors_by_operator` (`errByOp`, moniteur règle-5 %) et le tally `calls/byOperator/byMethod` sont **persistés durablement** (hors dépôt). **État mesuré (`record.ts:407-434`)** : seul `BudgetExceededError` produit un rapport (stderr, code 2) ; **tout autre throw** (désaccord de quorum, `AbiMismatchError`) remonte à `main` → `FATAL` stderr, et le **JSON de provenance qui porte `rpc_errors` n'est écrit QUE sur les chemins de succès** (`:371`/`:400`) ; le `finally` ne flush que la concordance + `unlock`. ⇒ au HEAD, une course en échec **NON budgétaire PERD** `rpc_errors`/`errByOp`/tally. Pré-enregistré : l'orchestrateur **capture stderr dans le runbook** et écrit un artefact de diagnostic ; le durcissement de `record.ts` (écrire la provenance de diagnostic sur TOUT échec) est un **item formé** (record.ts hors gel) — Q-C.

---

## (7) Ce que le prereg NE décide PAS + préconditions du commit

- **Hors décision 119** : contre-vérification **Bell** (~5,4 M cr) et C-F-4 ; **live U-6** ; mise en ligne du site (décision 101) ; DNS Bell ; tout achat/action de compte. **Q7** : la **réservation Bell est exprimée en RU au TEMPS 2 seulement** (Bell hors temps 1) ; à fixer alors, unité RU, dans le même plafond par compte (décision 121). Ne pas présumer que Bell n'utilise pas Chainstack (ADR-GARDE-HELIUS D5 : « leg ETH budgété » Bell, `collect.ts:638`).
- **Le q̂ et les régions (bornes hautes)** : produits par la course, jamais pré-décidés.
- **L'épisode frais** : découvert mécaniquement (P-EPI) ; le prereg fige la RÈGLE.
- **Le résultat H-3** : mesuré (bêta-binomial 5 %), non pré-décidé.
- **La classe servie en -2** : A seule (décision 108, E-I-3 close).
- **(b) CA chemin natif** : item formé « calibration suivante », non rétroactif.
- **Neutralité de version** si v3.6.0 : `PR-U4-3-bis` (H-1).
- **L'outil de la passe §DISC (getLogs LiquidationCall) et le paramétrage du prober D_e frais** : Q-D.

**Go U-6 conditionnel PRÉ-ENREGISTRÉ (décision 122, item 3 ; note (2)/(4))** : « **GO U-6 sans nouveau tour ssi** `reconcile` = GO (Δdashboard ≤ ledger_run, bande souple décision 113) **ET** aucune strate servie en NON au test H-3 (bêta-binomial 5 %) **ET** `labels_no_quorum` non résolus = 0 ; **sinon retour investisseur avec les chiffres** ». Cette clause ne change rien de ce qui est servi ; elle ne pré-enregistre que la condition du go (elle n'est PAS un go rendu ici).

**Préconditions dures AVANT le commit** (items formés à déclencheur — zéro dette nue) :
1. **GARDE-HELIUS-2b-ii + 2b-iii fusionnés** (arguments recorder finaux, §5a) — **SATISFAIT** (`5394dfe` `docs/G7-lot-garde-helius-2b-ii.md` ; `985fed9` `docs/G7-lot-garde-helius-2b-iii.md`).
2. **C-15 (Mondrian 2003 [lu])** : SATISFAITE (note orchestrateur G0-lot-u4b `:358`).
3. **`PR-U4-3-bis`** si impl ≠ v3.5.0 (H-1).
4. **Procurement `PR-U4-4-a`** (chapitre Mondrian 2022, ISBN 978-3-031-06648-1) : formé, non bloquant (substitut 2003 [lu]).
5. **Contrainte d'ordre NARABI-OPS-1d (ruling Q10, amendement 2026-09-21 §3)** : `apps/sentinel/src/rpc.ts` au gel D4 ; **NARABI-OPS-1d NE fusionne PAS entre le commit du prereg et la clôture de la course** (sinon `rpc.ts` change ⇒ gel rompu ⇒ re-gel + re-prereg). Cohérent décision 118 (-1d après temps 1). `record.ts`/`rpc2.ts` sont HORS gel ⇒ l'ordre 2b-ii ↔ prereg ne crée pas de conflit.
6. **Condition (i-a)** : si -1b touche le réducteur pur de `u3-realized.mjs` (`:81-267`), extraire le réducteur + 9ᵉ sha au gel D4 AVANT le prereg (§Y, §5c).
7. **Paramétrage -1b du labeler et du prober D_e frais** (Q-D) : outil gardé de la passe §DISC + `u4-oracle-path.mjs` reparamétré (ses `B0`/`BLAST`/`PROXY` sont e2 en dur, `:33,:36`).

---

## (8) Preuve d'intégrité sous régime B (commandes)

**Principe (AM-1)** : « `git status` propre » n'est PAS une preuve ; la preuve est « **blobs HEAD inchangés** ». Toute commande sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (A-7).

**(8a) Recompute des 8 sha gelés + labeler** (à rejouer au commit ; divergence vs §2 = ÉCART = STOP) :
```
for f in \
  scripts/census/u4b/u4b-scores.mjs scripts/census/u4b/u4b-reduce.mjs scripts/record-u4b-calib.mjs \
  apps/sentinel/src/ukemi/wadray.ts apps/sentinel/src/ukemi/abi.ts packages/hikae/src/l1-split.ts \
  apps/sentinel/src/rpc.ts packages/contracts/src/calib-digest.ts scripts/census/u3-realized.mjs ; do
  echo "$(git -C F:/Monark show "HEAD:$f" | tr -d '\r' | sha256sum | cut -d' ' -f1)  $f"
done
```

**(8b) sha LF de CE prereg — procédure, PAS de valeur circulaire (mission 8)** : la valeur naît au commit ; l'orchestrateur la recompute APRÈS commit et l'écrit dans la sonde + le **sidecar daté** (jamais dans le brut, écrit par `record.ts:400`) :
```
git -C F:/Monark show HEAD:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum
```
(aucun garde de code ne consomme cette valeur au HEAD — enforcement procédural, Q-A.)

**(8c) `labeler-sha`** = sha256 LF du blob HEAD de `u3-realized.mjs` (= `755b3a38…` aujourd'hui), écrit par l'orchestrateur dans la sonde + le **sidecar daté** (PAS le brut) avant le premier appel (marqueur, PAS un flag recorder — Q-B) :
```
git -C F:/Monark show HEAD:scripts/census/u3-realized.mjs | tr -d '\r' | sha256sum
```

**(8d) Invariants réassertés inchangés au commit** (numéros re-mesurés ce tour) : `book_digest 034fbff9…` (`ukemi.test.ts:33`) ; `PINNED_DIGEST 267cd991…` (`ukemi-u4-scores.test.ts:24`) ; **`U3-realized.jsonl b4d93590…`** (`PROVENANCE-u3.md:10`, ruling Q11) ; digests de cellule U-4b (après re-gel 126) A `2feb4ab0…` / B `07bb8e3b…` ; fixture `U4b-scores-e2.jsonl 301d39fa…` ; fixtures `u4/` et `u4b/` sha-pinnées (`PROVENANCE-u4b.md`) ; ordre des fournisseurs (`transport.ts:34-35`, `rpc2.ts:248-249`).

---

## QUESTIONS OUVERTES (liste FERMÉE — ce que le worker ne peut pas fixer sans décision ; jamais une valeur devinée)

- **Q-A — enforcement du gel U-4b par code ou procédure ?** Au HEAD, aucun script ne lie la course au blob de `PLAN-u4b-prereg.md` (le garde `--prereg-sha` du recorder vise `PLAN-u4-prereg.md`, U-4 LIVRE). Ce prereg pré-enregistre l'enforcement **procédural** (commit seul + recompute des 9 sha + marqueurs sonde). **Décision due** : (α) accepter le procédural tel quel, ou (β) petit lot avant la course ajoutant un garde de code liant la course à `PLAN-u4b-prereg.md` (`record.ts` hors gel). *Conséquence β* : re-tester le recorder. **La phrase D4 de l'ADR-U4b (« le script refuse sans --prereg-sha == sha de ce fichier ») est à AMENDER par l'orchestrateur (R-20)** — elle décrit un garde qui vise l'autre prereg.
- **Q-B — `--labeler-sha` : flag recorder ou marqueur ?** La MISSION liste `--labeler-sha` comme argument du recorder ; `record.ts` (`parseUkemiArgs`) n'en a pas. Ce prereg le traite comme **marqueur écrit par l'orchestrateur** dans la sonde/brut. **Décision due** : (α) marqueur suffit, ou (β) ajouter `--labeler-sha` à `record.ts` pour qu'il figure dans la provenance (petit lot, hors gel).
- **Q-C — journal de diagnostic sur échec non budgétaire.** Au HEAD, une course qui jette (désaccord, ABI) **perd** `rpc_errors`/`errByOp`/tally (§6). Ce prereg pré-enregistre la capture stderr par le runbook. **Décision due** : durcir `record.ts` pour écrire la provenance de diagnostic sur TOUT échec (item formé, hors gel) — ou accepter la capture runbook.
- **Q-D — outil de la passe §DISC (getLogs LiquidationCall) et paramétrage du prober D_e frais.** Aucun script nommé n'exécute la sélection d'épisode (`u4b-discover.mjs` absent) ; `u4-oracle-path.mjs` fait la série `AnswerUpdated` avec `B0/BLAST/PROXY` e2 **en dur** (`:33,:36`). **Décision due** : quel outil gardé exécute §DISC, et le reparamétrage de `u4-oracle-path.mjs` (déclencheur « avant la course ») — sans quoi la découverte de l'épisode frais n'a pas d'outil figé.
- **Q-E — surface qui invoque le `reconcile` servi de la course.** `reconcile` est programmatique (`runCli`, `cli.ts:17`) : **aucun binaire/`main` shell au HEAD** ; le seul appelant non-test de `runCli` est `record.ts:431` (`unlock`). Le rapprochement A-4/§6 (`--before`/`--after`, `readSnapshot` du dashboard, `deps.floor`) n'a **pas** de surface d'invocation figée. **Décision due** : quel wrapper servi appelle `runCli(["reconcile", …], { ledgerDir, floor, readSnapshot })` pour la course (déclencheur « avant la fin de course ») ; §5b fige l'`argv`, pas l'invocation.

---

## Annexe A — Provenance des rulings (traçabilité datée ; ex-« NOTE ORCHESTRATEUR » du candidat, dé-brouillonnée)

- **Source des rulings** : `docs/CHANTIERS.md`, puce « 2026-09-21 ~21:1x UTC — prereg U-4b-1b : avis advisor-defi Q11/Q4/Q6 reçu … rulings orchestrateur » (CHANTIERS:604) ; avis verbatim `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\AVIS-advisor-defi-prereg-u4b-1b-2026-09-21.md` et `…AVIS-advisor-defi-vacuite-region-A-options-2026-09-22.md` (advisor-defi `claude-fable-5-1`, conseil jamais verdict).
- **Q1** périmètre = 8 sections + §DISC/H-n/sonde (G0 §7). **Q2** `rpc.ts` `0e232519…` figé (amendement ADR-U4b 2026-09-21 §1, complet). **Q3** (constat DRAFT « amendement jamais atterri ») **périmé** : substance EN LIGNE dans ADR-U4b D4/D5 depuis `8ba2cbc` (`798b4e9`) ; amendement C-7 `2d1d685`. **Q4** = (a) confirmé, formulation C-V-7 verbatim ; (b) item « calibration suivante » non rétroactif. **Q5** item « agrégat ≠ Σ jambes » CLOS (ceil par jambe, v3.5.0). **Q6** H-3 → bêta-binomial exact 5 % par strate ; H-4 → 5 % + e2 11,1 %/12,7 % ⇒ NON attendu + part de Y post-premier-appel ; H-5 → dérivé de nMin. **Q7** `--max-ru` fixé depuis le floor lu sur place ; réservation Bell en RU au temps 2. **Q8** E-I-3 close par 108. **Q9** créneaux à reconfirmer au journal sentinel. **Q10** contrainte d'ordre NARABI-OPS-1d (amendement §3). **Q11** convention Y = ADR-U3 D1/D2 + pin `b4d93590…` + `labeler-sha` + règle d'abstention + confinement section live (condition (i-a)).
- **Décision 126 (2026-09-22 01:03 UTC, CHANTIERS:646-652)** : score unilatéral `max(Y − ŷ, 0)`, re-gel du sha #1 AVANT le prereg (fenêtre ouverte : prereg non committé, 2b-iii non fusionné au moment de la décision → aujourd'hui 2b-iii fusionné, prereg toujours non committé, fenêtre ouverte tant que ce fichier n'est pas committé et qu'aucune donnée fraîche n'existe) ; 4 clauses (H-3 conservateur, n≥199, rapport compteurs, région borne haute) ; lot U-4b-SCORE-1 fusionné `6652ed0` (G7 `docs/G7-lot-u4b-score-1.md`).
- **Décision 122 (2026-09-21 ~22:5x UTC, CHANTIERS:607-610)** item 3 : go U-6 conditionnel pré-enregistré (ci-dessus §7). **Décision 121 (CHANTIERS:602-603)** : plafond Chainstack par compte. **Décision 123 (CHANTIERS:622-627)** : `cascade` = option D, retrait déplacé à U-5 (hors périmètre servi -1b). **CARTO-T1-1 (CHANTIERS:614)** : labeler keyless-only en course (§5c).
- **Décisions investisseur amont** : 91 (premier franchissement), 108 (classe A seule), 110/111 (anti-close / hors miroir), 113 (rapprochement), 115 (16 M RU), 118 (NARABI-OPS-1d après temps 1), **119** (GO durable, plafonds non levés). ADR-U3 D1/D2 (`docs/adr/ADR-U3-realized-labels.md`, adoptée 2026-09-20). ADR-U4b (`docs/adr/ADR-U4b-calibration-episode-frais.md`, D1-D5 + amendements 2026-09-21 et 2026-09-22).
- **Modèle** : worker `claude-opus-4-8[1m]`, effort max. **R-20** : le worker ne committe pas ; **R-21** : sortie vérifiée adversarialement par l'orchestrateur avant consommation. Mesures : `MESURES.md`.
