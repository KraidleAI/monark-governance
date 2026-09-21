MODELE RESOLU: claude-opus-4-8[1m]

# G0 — Sprint backlog lot Ukemi **U-4b** : calibration servie sur ÉPISODE FRAIS (ŷ close factor v3.5.0, classe mono-collatéral WETH, Mondrian), absorption U-4a-ii, révision du pool RPC (POOL-RPC-1), items d'outil

- **Rédacteur** : worker `claude-opus-4-8[1m]` (R-1, effort max). **AUCUN code, AUCUN appel réseau dans ce G0** (plan seul). **R-20** : le worker ne committe pas, ne déclenche aucun workflow ; verdict/commit = orchestrateur `claude-fable-5-1`. **R-21** : écrit pour vérification adversariale — chaque fait porte `fichier:ligne` ouvert ce tour.
- **Date** : 2026-09-21. **Base** : `lot/etude-suite`, HEAD `671b8f2` (U-4a fusionné `834a416`, G7 ACCEPTÉ `docs/CHANTIERS.md:392-396`). Dépôt `F:\Monark` lu en lecture seule.
- **Cadre** : décision investisseur **91** (`docs/CHANTIERS.md:273`, verbatim « refais la mesure avec chainstack ukemi » — re-périmétrage sur épisode FRAIS, Chainstack, ŷ à close factor, classe mono-collatéral WETH, deux classes Mondrian, e2 = jeu de conception seulement — **supersède P-6 du G0 U-4**) ; décision **99** (`docs/CHANTIERS.md:401`, « absorber dans U-4b » — le reliquat U-4a-ii = items d'outil ABSORBÉ ici, découpe R-25 par unité) ; item **POOL-RPC-1** (`docs/CHANTIERS.md:406`) ; décisions **100/102** (Pocket ajouté, Tenderly conservé, Blast/LlamaRPC retirés — `docs/CHANTIERS.md:409,416-418`) ; décision **101** (`docs/CHANTIERS.md:411-413`, tout le SITE hors gates, backend d'abord entièrement branché) ; entrées de pré-enregistrement U-4b (`docs/adr/ADR-U4-book-et-calibration.md:152-166`) et contenu G0 exigé au checkpoint-2 bis (`ADR-U4:167-188`).
- **Prérequis RENDUS** (lus ce tour) : `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\` — `SYNTHESE.md` (chercheur `claude-sonnet-5`), `PR-U4-3-liquidationlogic-close-factor.md` [lu], `PR-U4-1-agregateur-eth-usd-svr.md` [lu], `PR-U4-4-biblio-conformal-prediction.md` [abs+]. **Reste dû connu** : valeur COURANTE de `s_cutoffTime` @ le bloc de l'épisode (1 `eth_call` sous garde — `SYNTHESE.md:53-54`, `PR-U4-1:213-219,249`) ; chapitre exact Mondrian du livre Vovk-Gammerman-Shafer 2e éd. (procurement **PR-U4-4-a**, `SYNTHESE.md:71`, `PR-U4-4:111-114`).

---

## §0. Ce que U-4b sert, à qui, et par quel tuyau (branchement — CA-11)

**But (une phrase)** : le gate MONARK répond, sur la classe de liquidation réalisée le long d'un chemin d'oracle réalisé, une **région conforme** `[ŷ − q̂, ŷ + q̂]` calibrée sur un **épisode FRAIS** (jamais e2), avec ŷ à **close factor** (v3.5.0) sur la classe **mono-collatéral WETH**, **stratifiée Mondrian par taille**, et **abstient `under_calib`** partout ailleurs et sur toute strate `n < nMin` — servi par un **outil MCP** (backend), site exclu (décision 101).

**Consommateur SERVI (l'outil MCP qui consomme la région)** : `apps/harness/src/tools/gate.ts`. Il dispatche déjà `stable-run-velocity-24h` sur une entrée committée en cherchant `lookupCommittedCalibration(task_class, predictor_id)` (`gate.ts:446-489`, motif `stableRunVerdict`) et conforme par `splitQuantile → buildIntervalRegion → buildVerdict` ; U-4b **ajoute la classe de liquidation** au même motif. Le registre committé vit dans `apps/harness/src/calibration.ts` (`COMMITTED_CALIBRATIONS`, `calibration.ts:195-203` ; `lookupCommittedCalibration` exact-match sur `(taskClass, predictorId)`, `:207-209`). Le conformeur d'intervalle est `packages/hikae/src/interval-conformer.ts` (score `|y − ŷ|`, `q̂ = ⌈(n+1)(1−α)⌉`-ᵉ plus petit, `conformInterval`, `:54-106`) — **réutilisé sans réécriture** (une seule implémentation de quantile, L1).

**Tuyaux (ADR-M018 D3 ; entrée → sortie → état → test d'intégration NON-LLM)** :

| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État | Test d'intégration NON-LLM qui rejoue la composition |
|---|---|---|---|---|
| Découverte épisode FRAIS | prereg §DISC → `getLogs(Pool,[LiquidationCall],[B_lo,B_hi])` quorum-2 (bruts hors dépôt) → sélection mécanique | course book+D_e (aval réel) | brut hors dépôt sha-pinné + `episode-selection.json` in-repo | `u4b_episode_selection_is_deterministic` (rejeu offline : mêmes bruts ⇒ même épisode) |
| book B₀ + labels Y frais | recorder RPC quorum-2 + labeling paramétré → `U4b-book.raw.json` / `U4b-labels.jsonl` (hors dépôt) → réducteur | réducteur A-4 (test) + adaptateur `fromRealizedBook` | fixture réduite in-repo sha-pinnée + brut hors dépôt | `u4b_book_replays_bit_identical`, `u4b_labels_replay` (rejeu offline) |
| D_e chemin oracle réalisé (série SERVIE) | `u4-oracle-path.mjs` paramétré (getLogs `AnswerUpdated` de l'agrégateur résolu) → hors dépôt → réducteur | réducteur A-4 (test) | fixture in-repo sha-pinnée + brut hors dépôt | `u4b_oracle_path_monotone_and_served_membership` |
| réduction → scores close factor + strates | (book, D_e, labels) → `u4-scores.mjs` (ŷ close factor, Mondrian) → `U4b-scores.jsonl` + `calib_digest` par strate | **entrée committée `calibration.ts` → `gate.ts`** | fixture sha-pinnée ; entrée committée **fail-closed à l'import** | `u4b_calibrates_from_fresh_realized_labels` (n, q̂, `calib_digest` par strate reproduits offline) |
| **région SERVIE** | `calibration.ts` (scores committés, digest épinglé) → `gate.ts` dispatch classe + `fromRealizedBook` (ŷ appelant) | **outil MCP `gate` → `GateDecision` (région ou `under_calib`)** | **`built`** ssi ce test passe ; sinon `upcoming` | **`u4b_gate_serves_region_from_real_artifact`** (charge la calib committée, construit `Prediction` depuis l'artefact book réel via l'adaptateur, appelle le gate, asserte `covered` [ŷ−q̂, ŷ+q̂] + digest épinglé pour une strate `n≥nMin`, `under_calib` pour une strate `n<nMin`) + trace h5 `probe_harness_records_real_decision` |

**Règle de branchement (CLAUDE.md/ADR-M018)** : une pièce n'est `built` que si sa sortie est consommée par un chemin **servi** couvert par un **test d'intégration non-LLM** rejouant la composition de bout en bout. Ici le chemin servi = **outil MCP `gate`** ; le test = `u4b_gate_serves_region_from_real_artifact`. Consommateur = **le gate**, pas un test unitaire (e2 restait `upcoming` car son seul consommateur était un test — `ADR-U4:66-70`). **Surface SITE** (`apps/site/lib/fleet.ts` registre, page Ukemi, panneaux) = **hors gates, en dernier** (décision 101, `CHANTIERS.md:411-413`) ⇒ **item formé SITE-U4B** (déclencheur : passe site ungated après backend branché ; propriétaire orchestrateur+investisseur) ; la contrainte « registre `built` ⇔ branché » reste non négociable même hors gates (`CHANTIERS.md:413`).

---

## §1. Découpage R-25 (mesuré au plafond, décision 99 « par unité »)

**Garde R-25** (`.github/workflows/ci.yml`) : plafond `VIBEGATES_PR_LIMIT = 1205` (`ci.yml:46`) ; la pathspec `STAT=` (`ci.yml:65`) **exclut** `docs/**/*.md`, les séries `fixtures/**/*.{json,jsonl,csv}` et `apps/sentinel/test/fixtures/**` — mais **COMPTE** `scripts/census/*.mjs`, `apps/sentinel/src/**`, `apps/harness/src/**`, `packages/**/src/**`, tous les `*.test.ts` et `scripts/export-exclude-tests.json`. Estimations `ins+del` (chiffrées ci-dessous, révisées au G1) ⇒ **quatre sous-lots sérialisés**, chacun ≤ 1205, chacun une PR unitaire (R-25) :

- **U-4b-0 — pool RPC + items d'outil (AUCUN réseau)** : POOL-RPC-1 (révision `rpc2.ts:250-251` et `rpc.ts:19-23`) + les 4 items d'outil (`meta.model` fail-closed, `onRpcError`, EBUSY, 12 e-mode). **Est. ≈ 300** (code ~150 + tests/mutants ~150). Se justifie seul (dette d'outil + admissibilité opérateurs), **prérequis dur** des courses.
- **U-4b-1 — pré-enregistrement + découverte + labels frais + scores (RÉSEAU, sous garde)** : prereg committé seul (docs, exclu R-25) ; script de découverte ; labeling paramétré (réutilise le réducteur U-3) ; `u4-scores.mjs` étendu (ŷ close factor + Mondrian + réducteur book garde le bonus). **Est. ≈ 650** ; si > 1205 après mesure G1, scinder **U-4b-1a** (découverte+labels) / **U-4b-1b** (scores close factor + Mondrian).
- **U-4b-2 — chemin servi backend (harness + hikae + adaptateur)** : absorbe **U-4a-ii = A-5 (`calibration.ts` entrées Mondrian), A-6 (`packages/monark/src/adapter-book.ts` `fromRealizedBook`), A-7 (`packages/hikae/src/liquidable-24h.ts` classe réelle)** ; `gate.ts` dispatch de la classe + `attestation-binding.ts` ; retrait `cascade` (C-9 G0 U-4) ; re-pin trace h5 ; test d'intégration servi. **Est. ≈ 420**.
- **SITE (hors gates, décision 101)** : `fleet.ts`, page/panneaux Ukemi, logo (décision 103) — **PAS un sous-lot gaté** ; item formé SITE-U4B, en dernier.

**Projection totale** : les trois sous-lots gatés ≈ 300 + 650 + 420 ≈ 1370 `ins+del` cumulés ⇒ **impossible en une PR**, cohérent avec R-25 ⇒ trois PR. Aucune PR seule ne dépasse 1205. Séries JSONL, prereg et docs sont exclus (`ci.yml:53-64`).

---

## §2. Épisode FRAIS — règle de sélection PRÉ-ENREGISTRÉE (fixée AVANT toute donnée)

**Contrainte de fond mesurée** : le census A de U-3 n'a observé que **trois** clusters (`d0f4aa1e…`) — e1 2025-02-21 sUSDe (3 positions), **e2 2025-10-10/11 WETH (194 positions)**, e3 2026-01-19 sUSDe (1) — et `scripts/census/u3-realized.mjs:3-5` est **codé en dur sur ces trois événements**. **Seul e2 est WETH-collatéral et de taille utile.** Un épisode FRAIS WETH n'est donc **PAS pré-existant** ⇒ U-4b doit **découvrir** un NOUVEAU cluster de liquidations WETH et exécuter la chaîne U-3+U-4 dessus (~280 k appels, décision 91). La règle ci-dessous est **fixée avant tout appel**, **committée seule** (§7), et **jamais choisie après coup** (P5, MAST « sélection sur l'issue »).

**P-EPI (règle mécanique, déterministe, à ratifier au checkpoint-1)** :
1. **Fenêtre de découverte** `[B_lo, B_hi]` : `B_lo = 22803459` (bascule du feed WETH vers le proxy SVR `0x5424384b…`, `PR-U4-1:41,45` — pour que la sémantique D_e/DualAggregator soit **identique** à e2) ; `B_hi = finalized − 64` (marge de finalité, jamais le tag mutable, motif `rpc2.ts:9`) ; **MOINS** la fenêtre e2 `[23545088, 23557060]` (`ADR-U3:32`) — e2 est le jeu de conception, jamais l'épisode servi.
2. **Découverte** : `getLogs(Pool, [LiquidationCall topic], [B_lo,B_hi])` quorum-2 (topic auto-testé `scripts/census/u3-realized.mjs:49,54`), clustering **verbatim la règle U-3 D2** (`ADR-U3:30-31`) : cluster = `collateralAsset == WETH`, `B_first` = premier `LiquidationCall`, `B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`windows.ts`, bloc jamais horodaté), lignes hors [B_first,B_last] en résidu `outside_window`.
3. **Éligibilité d'un cluster candidat** (seuils pré-enregistrés) : (a) `collateralAsset == WETH` ; (b) `#comptes distincts liquidés ≥ N_min` (valeur = **question investisseur E-I-2**) ; (c) impl Pool @B_first résolue via slot EIP-1967 (`EIP1967_IMPL_SLOT`, `u3-realized.mjs:42`) **== v3.5.0** `0x97287a4f…` (voir **H-1**), sinon le cluster est **écarté** de la sélection (pas de mélange de version de règle close factor).
4. **Choix parmi les candidats** (tie-break pré-enregistré) : **option (i)** = premier cluster éligible **chronologiquement** (moindre sélection-sur-la-taille) ; **option (ii)** = plus grand par `#comptes liquidés` (plus de n) ; tie-break secondaire = `B_first` croissant. **Choix = question investisseur E-I-1.** L'`episode_id` retenu (`weth-<AAAA-MM-JJ>`), `B_first`, `B_last`, `B₀ = B_first − 1` sont écrits dans `episode-selection.json` **dérivé mécaniquement** des bruts (aucune main).
5. **Ordre** : prereg committé seul → découverte (réseau, cheap) → sélection **mécanique** → course book/D_e/labels. La découverte est elle-même un pas réseau, mais la **règle** est une fonction déterministe de sa sortie. **`B_hi = finalized − 64` est une RÈGLE, PAS un nombre** : `finalized` n'est connu qu'à l'exécution ⇒ le prereg ne le nomme pas ; le **brut de découverte enregistre le `finalized` lu**, et `episode-selection.json` est **reproductible depuis `(prereg_sha, brut de découverte)`** — c'est exactement ce qu'asserte `u4b_episode_selection_is_deterministic` (rejeu offline : mêmes bruts ⇒ même épisode). Ainsi « committé avant toute donnée » survit à une borne haute mobile : la règle est figée, la donnée est horodatée dans le brut.

**Hypothèses pré-enregistrées (chacune rapportée tenue/non tenue AVEC le chiffre ; critère de NON explicite)** :
- **H-0 (existence)** : ≥ 1 cluster WETH éligible existe dans `[B_lo,B_hi] \ e2`. **NON ⇒** U-4b **s'arrête** en `no_fresh_episode`, **item formé** (élargir la fenêtre / abaisser N_min = décision investisseur), **AUCUNE course** — jamais un épisode fabriqué.
- **H-1 (version de règle)** : impl Pool @B_first de l'épisode retenu **== v3.5.0** (`0x97287a4f…`, EIP-1967). **NON ⇒** course **EN PAUSE**, procurement **PR-U4-3-bis** (lire `LiquidationLogic.sol` de l'impl effective au niveau [lu] AVANT tout ŷ) — jamais une hypothèse silencieuse. *Nuance mesurée* : les 5 constantes sont **identiques** sur v3.3.0→v3.7.0 (`PR-U4-3:159-160`, `SYNTHESE.md:22`) ; le risque porte sur la **logique** (v3.6.0 = 79 lignes de diff, date d'upgrade mainnet NON établie), pas sur les constantes.

---

## §3. ŷ à **close factor** v3.5.0 — et ce que ça change vs U-4a

**U-4a** : `ŷ = total_debt_base` du compte si `HF(D_e) < 1e18` sinon 0 (`ADR-U4:42`) — soit « dette totale », un plafond grossier. **U-4b** remplace ŷ par le **maximum réellement liquidable en un appel** (règle exacte lue [lu] à `v3.5.0`, tag `6138e1fda…`, `PR-U4-3:69,94`, triple recoupement `POOL_REVISION=9`).

**Constantes [lu]** (`PR-U4-3:120-137`, `SYNTHESE.md:21-28`) : `DEFAULT_LIQUIDATION_CLOSE_FACTOR = 0.5e4` (50 %, l.44) ; `MAX_LIQUIDATION_CLOSE_FACTOR` **ABSENTE** de v3.5.0 (existait `1e4` en v3.2.0, retirée v3.3.0, l.140-153) ; `CLOSE_FACTOR_HF_THRESHOLD = 0.95e18` (comparaison **stricte** `>`, l.50/263) ; `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD = 2000e8` (l.57) ; `MIN_LEFTOVER_BASE = 1000e8` (dérivée `/2`, l.65).

**Forme de ŷ (notation propre, `PR-U4-3:262-267`)**, en devise de base 8 déc., pour la paire (réserve-dette `r_d`, réserve-collatéral `r_c`) :
```
ŷ_base = min( CF_base , C_r^base / m )
CF_base = min(D_r^base, 0,5·D_tot^base)  si  C_r^base ≥ 2000e8 ET D_r^base ≥ 2000e8 ET HF > 0,95
        = D_r^base                        sinon
```
où `m` = multiplicateur de bonus de liquidation de `r_c` (WETH, ou catégorie e-mode). **Éligibilité** : ŷ > 0 **ssi** `HF(D_e) < 1e18` (recompute WadRay au **p_min** du chemin D_e, jambes WETH au p_min, autres à p0 — motif U-4a `ADR-U4:42-48`). **Reliquat (`MustNotLeaveDust`, `PR-U4-3:206-232`, `SYNTHESE.md:27`)** : si l'appel ne clôt NI toute la dette NI tout le collatéral de la réserve ciblée, il **revert** sauf reliquat ≥ 1000e8 des deux côtés ⇒ **règle pré-enregistrée** : si `ŷ_base` tel que défini laisserait un reliquat < 1000e8 des deux côtés, **ŷ := clôture totale `D_r^base`** (le liquidateur clôt une jambe) — traité comme une **question investisseur E-I-4** (option a : cette règle ; option b : ŷ inchangé + résidu `dust_bounded` compté).

**`m` (bonus) est disponible SANS appel supplémentaire** : le recorder l'écrit déjà dans le book **BRUT** par réserve (`book.ts:157-158` `liquidation_bonus_bps`/`ltv_bps`/`reserve_emode_category`, décodé bits 32-47 `abi.ts:129,134`), et par catégorie e-mode (`getEModeCategoryData`, `abi.ts:172,181`). **C'est le RÉDUCTEUR qui l'élague** — `u4-reduce.mjs:39` ne garde que `asset, atoken, variable_debt_token, decimals, liquidation_threshold_bps, price_base_8dec` ⇒ **U-4b modifie `u4-reduce.mjs:39` pour GARDER `liquidation_bonus_bps`** ; **`book.ts` (recorder, PIN `034fbff9`, `ADR-U4:19`) reste INTACT** — changement de réducteur seul, aucun appel réseau supplémentaire.

**Ce que ça change (assumé, dit en chiffres au G1)** : ŷ passe de « dette totale » à « ≈ 50 % de la dette » quand les 3 conditions tiennent, plafonné par `C_r/m` ⇒ scores `|Y − ŷ|` **plus petits et plus informatifs** que U-4a (où la région couvrait 0 pour **790/797** comptes, `ADR-U4:117-126`). **Biais systématique déclaré (H-4)** : ŷ = max liquidable **en UN appel** ; Y = Σ de TOUS les remboursements sur 24 h (`ADR-U4:33-35`) ⇒ **sous-prédiction** pour un compte pris par plusieurs `LiquidationCall`. **H-4** = fraction des comptes liquidés avec > 1 `LiquidationCall` dans la fenêtre (calculable des lignes U-3) ; **NON (> seuil pré-enregistré) ⇒** le biais est déclaré load-bearing et la sous-prédiction rapportée par strate.

---

## §4. Méthode conforme — split-conformal, Mondrian, échangeabilité (hypothèses H-n avec critère de NON)

**Split-conformal** (motif U-4a, biblio [lu] `ADR-U4:122-124`) : score `s = |Y − ŷ|`, sans clipage, tri canonique ; `q̂ = p`-ᵉ plus petit score, `p = ⌈(n+1)(1−α)⌉` ; **α = 0,01** ; **nMin = 100** par paramètre de classe (choix conservateur Dunn 2022 Thm 11 `n₁ > 1/α − 1`, inégalité stricte — `ADR-U4:51-54`) ; **e2 = jeu de CONCEPTION** (fixe la forme du score et les coupes de strates, jamais servi), **épisode FRAIS = jeu de CALIBRATION** (produit q̂). Validité **marginale** (Barber 2023 Thm 2 poids unitaires ; Vovk 2012 Prop. 1/2 — **[lu] par `ADR-U4:122-124`**, [2nd] ici, à re-vérifier au niveau [lu] si load-bearing dans l'ADR-U4b). Biblio résolue (`PR-U4-4`) : CQR = Romano-Patterson-Candès NeurIPS 2019 **arXiv:1905.03222** ; Angelopoulos-Bates **arXiv:2107.07511**, FTML 16(4):494-591 (2023) ; Lei et al. JASA 113(523):1094-1111, DOI 10.1080/01621459.2017.1307116 ; scores normalisés Papadopoulos-Gammerman-Vovk AIA 2008 pp.64-69 ; **Mondrian** = Vovk-Gammerman-Shafer, *Algorithmic Learning in a Random World*, 2e éd. Springer Cham 2022 (ISBN 978-3-031-06648-1) + article fondateur « Mondrian Confidence Machine » 2003 (`alrw.net/old/04.pdf`, ouvert).

**Deux classes Mondrian (advisor-defi, `ADR-U4:161-163`) — en COUVERTURE, jamais en probabilité** :
- **Classe A — `liquidation-eligible-coverage`** : unité = compte de la population **mono-collatéral WETH** (option B, décision 91) ; cellule = {ŷ>0 sous D_e} ∪ {liquidés} ; score `|Y − ŷ_closefactor|` ; **Mondrian par taille de ŷ** avec coupes pré-enregistrées aux frontières **naturelles du code** : `< 2000e8` (sous le seuil `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD` ⇒ pas de réduction 50 %), `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$`. α et nMin par strate pré-enregistrés.
- **Classe B — `liquidation-realized-given-liquidated`** : unité = compte **liquidé** ; score `|Y − ŷ_closefactor|` (Y contre close-factor × dette).

**Strate ↔ clé de registre** : `lookupCommittedCalibration` est un **exact-match `(task_class, predictor_id)`** (`calibration.ts:207-209`). Deux voies : (**α**) encoder la strate dans `predictor_id` (`ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/<episode>/s<k>`) ⇒ K entrées committées, **zéro changement de lookup** (R-25 minimal) ; (**β**) lookup conscient des strates (changement de signature, R-25 +). **Reco (α)** — **question checkpoint-1 C-4**. **Strates `n < 99` pré-déclarées `under_calib`** (e2 : tranche ≥ 1 M$ n=35 `ADR-U4:139` ⇒ `under_calib`) — le gate abstient honnêtement, ce n'est PAS un défaut.

**Échangeabilité — hypothèses H-n avec critère de NON** :
- **H-2 (n par strate servie)** : n(strate) ≥ nMin. Rapporté par strate ; **NON ⇒** strate `under_calib` (comptée, pas comblée).
- **H-3 (échangeabilité INTER-épisodes, rendue falsifiable)** : appliquer le q̂ FRAIS à la cellule e2 ⇒ **couverture empirique** ; **critère de NON** : couverture < `0,99 − k·SE` (k pré-enregistré ; `SE` calculé de `Beta(p, n−p+1)` de l'épisode FRAIS lui-même, **pas** le `0,3 pt` d'e2 — motif `ADR-U4:124`). NON ⇒ l'écart inter-épisodes est **rapporté en chiffres** (Σ w̃·d_TV nommé, Barber 2023), **aucune revendication sur un nouvel événement** (K=2 épisodes ≪ 99 requis à α=0,01), et le texte d'honnêteté servi le dit. Biais déclaré : e2 a conçu le score ⇒ contrôle légèrement optimiste, dit tel quel.
- **H-6 (reformulée sur la série SERVIE, `ADR-U4:164`)** : la valeur d'oracle servie ∈ série `AnswerUpdated` (appartenance) + borne de retard 1–3 events (mesurée U-4a `ADR-U4:110-112`). Rapportée sur la fenêtre fraîche ; NON ⇒ borne d'usage de p_min re-défendue par encadrement (condition « toute valeur servie ∈ events ∪ {p0} », `ADR-U4:104-105`).
- **H-7 (identité de contrôle)** : à `p_min = p0`, `HF_min == hf0` EXACTEMENT (`ADR-U4:47`) — mutant LT_W←0 rouge.
- **H-5 (population option B)** : #comptes mono-collatéral WETH de l'épisode ≥ seuil ; rapporté (repricer le collatéral non-WETH hors ligne est impossible, le book n'itémise que aWETH — `ADR-U4:48`, d'où l'option B).

---

## §5. Absorption des items d'outil U-4a-ii (décision 99) — liste fermée depuis les docs

Reliquat U-4a-ii = **A-5/A-6/A-7** (chemin servi, `G0-lot-u4.md:5-6,26-28` ; renvoyés au G0 U-4b `ADR-U4:66,70`) + **4 items d'outil** (`ADR-U4:175-188`), **tous portés ci-dessous** (les toucher en U-4a aurait rouvert α / changé `ukemi_sha`) :

1. **`meta.model` en argument/variable d'env OBLIGATOIRE, fail-closed (C-VB-5 / réserve CA-8, `ADR-U4:180-184`)** : le champ `model` des bruts est un **littéral source** (`u4-redraw.mjs:111`, `record.ts:319,353,382`, `u4-probe.mjs:121,128`, `u4-oracle-path.mjs:125,140`, tous `"claude-opus-4-8[1m]"` en dur) ⇒ **non probant** de quel modèle a tourné ; le rendre un argument/env **fail-closed** (échec si absent) dans `record.ts` et les scripts census. **U-4b-0.**
2. **`onRpcError` (`ADR-U4:176-179`)** : `u4-redraw.mjs:88` construit `makeDefaultCall()` **sans** puits d'erreur ni retry (contrairement à `u4-oracle-path.mjs`) ⇒ une cause d'échec d'opérateur n'est pas enregistrée ; ajouter un **sink d'erreurs par-opérateur** au rapport de re-tirage. Déclencheur = ré-usage du re-tirage (contrôle live U-4b). **U-4b-0.**
3. **Durcissement append EBUSY (`ADR-U4:186`)** : `record.ts` (append l.~324) — réessai borné sur `EBUSY`/`EPERM` transitoire (cause D-7 du run 1 tué par verrou, `CHANTIERS.md:395`). **U-4b-0.**
4. **12 comptes e-mode non-cat-1 (`ADR-U4:187-188` ; {2:7, 11:3, 19:1, 23:1})** : lire le bitmap collatéral de la catégorie (1 champ v3.2 off-tool) pour confirmer WETH ∈ catégorie, OU les marquer `non_evaluable`. Sur l'épisode FRAIS mono-collatéral WETH, la plupart tombent hors classe ; **règle pré-enregistrée** : e-mode ≠ cat-1 avec WETH non confirmé ⇒ `non_evaluable` compté. **U-4b-1.**
5. **A-5 `calibration.ts`** (entrées committées Mondrian, motif `USDE_STABLE_RUN` `calibration.ts:173-203`), **A-6 `adapter-book.ts` `fromRealizedBook`** (ŷ appelant depuis l'`AttestedBook`/book canonique, C-6 `G0-lot-u4.md:61`), **A-7 `packages/hikae/src/liquidable-24h.ts`** (paires synthétiques supprimées, `LIQUIDABLE_24H_CLASS` → classe réelle, `NMIN 99→100`, docstring « no source exists » retirée — `liquidable-24h.ts:23-32`). **U-4b-2.**

**POOL-RPC-1 (`CHANTIERS.md:406`, décisions 100/102) — U-4b-0, choix posés à l'investisseur un par un (§12)** : `rpc2.ts:250` `ETH_CALL_PROVIDERS` = {drpc, mevblocker, blastapi, nodies} ; `rpc2.ts:251` `GET_LOGS_PROVIDERS` = {drpc, mevblocker, tenderly}. Verdicts CONF-SRC-2 (`CHANTIERS.md:405`) : **Blast API NON ADMIS** (retrait maintenu, décision 100), **LlamaRPC NON ADMIS** (retrait, `rpc.ts:20`), **Tenderly CONSERVÉ** (décision 102 A+), **1RPC ADMIS U1/NON ADMIS U2** (heavy) donc hors campagne U-4b, **mevblocker exclu de la course e2** (D-5, `PROVENANCE-u4.md:39`) ⇒ à ne PAS supposer en quorum U-4b. **Pocket** ADMIS SOUS CONDITIONS comme membre de quorum (jamais seul), archive OK (sonde : `getAssetPrice(WETH)@23545087 = 434687000000` IDENTIQUE au book committé, `getLogs@B₀` OK — `CHANTIERS.md:409`) ⇒ ajouter `eth.api.pocket.network` (`providerOf = pocket.network`) **après** la sonde getLogs large L-5. Chainstack = 9ᵉ opérateur à clé via `CHAINSTACK_ETH_URL` (env, jamais imprimé, `rpc.ts:52-77`), **distinct** (`providerOf = chainstack.com`). **Pool U-4b visé (aucun opérateur NON ADMIS, quorum-2 par opérateurs distincts)** : `eth_call` ← {drpc, nodies, pocket, chainstack} ; `getLogs` ← {drpc, tenderly, pocket, chainstack}. **TENDERLY-TOS** (clause « personal use ») = item formé, relecture à LEGAL-ATLAS, sans effet sur le plan (note investisseur « risque nul », `CHANTIERS.md:417-418`).

---

## §6. Budget d'appels chiffré et gardé — reprise, ledger, rapprochement (règle HELIUS-1)

**Chainstack est PAYANT** ⇒ la **règle HELIUS-1** s'applique VERBATIM (`CHANTIERS.md:390`, née de l'incident non-attribué de 49 675 crédits `CHANTIERS.md:386-389`) : « tout appel à un fournisseur PAYANT passe par le **garde de budget du dépôt avec ledger persistant** ; chaque course se termine par un **rapprochement avec le tableau de bord**, consigné ».

- **Garde du dépôt** : `--max-calls` fail-closed (`BudgetExceededError` re-jeté EN PREMIER, jamais benché en `no_quorum` — `rpc2.ts:17-23,178,197,237`) ; `--resume` (cache d'état **hors dépôt**, `mutant cache corrompu ⇒ holders_digest ≠ ⇒ abstention`, `ADR-U4:145`) ; politesse **par fournisseur** (`rpc2.ts:139-153`). Plafond pré-enregistré : **≤ 300 000 appels** toutes méthodes (motif U-4a : 279 000/300 000 consommés `CHANTIERS.md:394`) **ET** ≤ (quota Chainstack restant **lu au dashboard par l'orchestrateur** − **200 000 réservés Bell**) — motif `PLAN-u4-prereg.md:25`.
- **Sonde AVANT la course (go/no-go, écrite au PLI avant tout appel par compte)** : (a) énumération `Transfer` aWETH ≈ 1 412 `getLogs`/opérateur (`PLAN-u4-prereg.md:24`) ; (b) N détenteurs ⇒ appels projetés `≈ N × (1 + k_coll + 2 + k_debt) × 2` ; (c) **sonde getLogs large Pocket L-5** (concordance quorum-2 sur `eth_call@B_fresh` + `getLogs@B₀`, ensemble admis keyless **sans Blast**, drpc free-plan capé `rpc2.ts:57-61`) ; (d) **1 `eth_call` `s_cutoffTime()` @B_fresh sous garde** (reste dû `SYNTHESE.md:53-54`) + PR-U4-2 (3 `eth_call`) absorbés dans cette sonde. Dépassement PROJETÉ ⇒ **arrêt + consultation**, jamais un dépassement (`PLAN-u4-prereg.md:25`).
- **Ledger + rapprochement** : ledger persistant du budget (motif Bell `budget.json`) ; **à la fin de chaque course**, rapprochement `Σ calls_by_method` vs export dashboard Chainstack (lecture orchestrateur), consigné au PLI ; **GO conditionné** à la lecture du dashboard AVANT (attendu = base connue) et rapprochement APRÈS (motif condition GO HELIUS-1 `CHANTIERS.md:389`).
- **Discipline secret** : opérateur d'archive = label `archive-env`, jamais URL/clé (`no-secret-in-repo` vert ; motif `https?://|chainstack|p2pify|api-key = 0` sur bruts ET dépôt, `ADR-U4:148`) ; **CGU lues avant tout appel d'API de données** (règle 2026-09-20).

---

## §7. Pré-enregistrement committé SEUL avant tout appel

Motif U-4a (`PLAN-u4-prereg.md:2,30-34`, `ADR-U4:56`) : **`docs/PLAN-u4b-prereg.md` committé SEUL** (aucun code) **avant tout appel réseau** ; le script de course **refuse de démarrer** sans `--prereg-sha` == sha256 **LF** de ce fichier, et l'écrit dans `meta.prereg_sha` (garde `lfSha256`, `u4-redraw.mjs:62-64` ; U-4a prereg LF `9209cdab…` `ADR-U4:18`, `PROVENANCE-u4.md:36`). **Contenu du prereg** : §DISC (règle de sélection P-EPI), définitions (unité, Y, ŷ close factor, cellule, score, α, nMin, coupes de strates), H-0..H-7 avec critères de NON, plafonds/sonde (§6), ordre. **Toute déviation = D-n déclarée au PLI, jamais absorbée** (P5). L'épisode est choisi PAR la règle, jamais réécrit après 69/107-style (motif « alternative rejetée » U-4a `ADR-U4:208`).

---

## §8. Livrables (liste fermée par sous-lot ; test/oracle)

**U-4b-0 (aucun réseau)** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 0-1 | `apps/sentinel/src/ukemi/rpc2.ts` (l.250-251) ; **`rpc.ts` l.19-23 CONDITIONNEL E-I-6(a)** | `rpc2.ts` : Blast retiré, Pocket ajouté (après L-5), Tenderly conservé, quorum-2 par opérateurs distincts préservé ; `rpc.ts` (Narabi LIVE) touché **seulement si** E-I-6(a) retenu | `u4b_pool_admitted_operators_only`, `providerOf` distinct ≥ 2/méthode ; mutant : opérateur non-admis ⇒ rouge |
| 0-2 | `record.ts` + `u4-probe.mjs` + `u4-oracle-path.mjs` + `u4-redraw.mjs` | `meta.model` argument/env **fail-closed** (échec si absent) | `meta_model_required_fail_closed` (mutant : littéral restauré ⇒ rouge) |
| 0-3 | `u4-redraw.mjs:88` | sink d'erreurs `onRpcError` par-opérateur au rapport | `redraw_error_sink_records_operator_fault` |
| 0-4 | `record.ts` (append) | réessai borné EBUSY/EPERM | `append_retries_bounded_on_ebusy` |

**U-4b-1 (réseau, sous garde)** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 1-1 | `docs/PLAN-u4b-prereg.md` (committé SEUL) | §7 | garde `--prereg-sha` |
| 1-2 | `scripts/census/u4b-discover.mjs` (nouveau) | découverte + clustering U-3 D2 + sélection mécanique → `episode-selection.json` | `u4b_episode_selection_is_deterministic` (rejeu offline) |
| 1-3 | labeling paramétré (réutilise le réducteur `u3-realized.mjs` sans le figer sur e1/e2/e3) | Y_{i} de l'épisode frais | `u4b_labels_replay` (rejeu offline) ; mutant Y ⇒ rouge |
| 1-4 | `scripts/census/u4-scores.mjs` | ŷ **close factor** (§3) + Mondrian par strate + réducteur book **garde `liquidation_bonus_bps`** | `u4b_calibrates_from_fresh_realized_labels` (n, q̂, `calib_digest`/strate) ; mutants (ŷ dette-totale, close factor off, bonus omis, D_e ignoré, LT_W←0) rouges |
| 1-5 | fixtures réduites `apps/sentinel/test/fixtures/ukemi/u4b/**` + `PROVENANCE-u4b.md` | book, D_e, scores, inputs sha-pinnés (exclus R-25) | `series_pinned_are_declared_and_hashed` |

**U-4b-2 (chemin servi backend)** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 2-1 | `apps/harness/src/calibration.ts` | K entrées `CommittedCalibration` Mondrian (voie α), garde digest fail-closed à l'import (motif `:35-40,165-170`), provenance MEASURED (α, n, nMin, q̂, sha séries, K=2 caveat) | `calib_registry_digest_guard` (score altéré ⇒ throw import) |
| 2-2 | `apps/harness/src/tools/gate.ts` + `attestation-binding.ts` | dispatch de la classe (motif `stableRunVerdict:446-489`), honnêteté keyée présence-de-calib (`honestyText:500-510`) ; retrait `cascade-liquidable-24h` (C-9 G0 U-4) | `u4b_gate_dispatch_committed_class`, `gate_abstains_uncommitted_key` ; mutant sur-revendication ⇒ rouge |
| 2-3 | `packages/monark/src/adapter-book.ts` (A-6), `packages/hikae/src/liquidable-24h.ts` (A-7) | `fromRealizedBook` (ŷ appelant, fail-closed `binding_broken`) ; classe réelle | `adapter_from_realized_book_anti_vacuity`/`_fail_closed` ; grep « no source exists » = 0 |
| 2-4 | test d'intégration + trace h5 re-pinnée | **`u4b_gate_serves_region_from_real_artifact`** ; `record-h5-e2e-trace.mjs` re-pin + PROVENANCE | branchement prouvé bout en bout |

---

## §9. Critères d'acceptation, mutants, contrôle live indépendant

**Acceptation (par sous-lot, motif `G0-lot-u4.md:34-40`)** : (1) `npm run ci` = base + nouveaux tests verts ; `gate:vocab`, lint 0, ratchet, lang-gate 0, `export:check` 0, `series_pinned`, `no_secret_in_repo` verts. (2) mutants ≥ 8 rouges, restauration **sha-exacte** (PRE==POST, `git status` identique, motif `G2-lot-u4a.md:135`). (3) prereg committé **avant** le worker ; bruts hors dépôt ; aucune clé/URL ; sonde de coût + dashboard lu AVANT, plafond écrit, rapprochement APRÈS. (4) R-25 ≤ 1205 par PR (§1). (5) CA-11 : **rien de nouveau `built`** tant que `u4b_gate_serves_region_from_real_artifact` n'est pas vert ; site intact (décision 101). (6) jamais « probabilité de liquidation » ni « Λ=0 » ; abstentions en chiffres.

**Mutants (tueurs non tautologiques, motif `G2-lot-u4a.md:125-133`)** — chacun change une **propriété réelle**, pas seulement un digest : (a) ŷ dette-totale au lieu de close factor ⇒ scores changent ; (b) close factor 50 % appliqué sans les 3 conditions ⇒ éligibilité change ; (c) bonus `m` omis (ŷ non plafonné par `C_r/m`) ⇒ scores changent ; (d) D_e ignoré (`hfMin←hf0`) ⇒ population change ; (e) LT_W←0 ⇒ population change ; (f) reliquat `MustNotLeaveDust` non traité ⇒ ŷ change ; (g) strate mal bornée (coupe 2000e8 décalée) ⇒ `calib_digest`/strate change ; (h) `decInt256` non signé ; (i) sur-revendication d'honnêteté (phrase committée pour clé non committée) ⇒ test A7-style rouge ; (j) `meta.model` littéral restauré ⇒ rouge.

**Contrôle live indépendant — PLANIFIÉ DANS LA MISSION G2 DÈS LE DÉPART (checkpoint-2 bis)** : la **G2-delta** (instance séparée, contexte frais) rejoue `scripts/census/u4-redraw.mjs` (re-tirage ≥ 3 comptes + ≥ 3 `AnswerUpdated`, graine dérivée de `book_digest` — `u4-redraw.mjs:34-43`, jamais choisie à la main), `--max-calls ≤ 60` fail-closed (`:29,59-60`), opérateurs excludables **sans Blast/mevblocker**, avec le **sink `onRpcError`** de 0-3 actif ; brut hors dépôt, `all_match` attendu, cache inchangé (motif D-12 `ADR-U4:145`). La mission G2 le nomme comme livrable dès le départ, pas après coup.

---

## §10. Export public — tests/données « upcoming » exclus

Mécanisme `scripts/export-exclude-tests.json` (ADR-M004 D7 sexies) : y ajouter les tests U-4b qui lisent un module `scripts/census/**` non whitelisté ou le prereg exclu (motif existant : `ukemi-u4-scores.test.ts`, `ukemi-u4-governance.test.ts`, `export-exclude-tests.json:3`). Tant que la région n'est pas SERVIE, données/tests U-4b = **`upcoming`**, exclus du miroir (motif `ADR-U4:74-78`). **Item porté du G7 U-4a (`CHANTIERS.md:396`)** : exclusion des données orphelines `upcoming`, nettoyage `PROVENANCE-u3.md:42`, extension `export:check` aux chemins `[A-Z]:\` — **AVANT la prochaine publication du miroir**. La **recette de calibration publiquement rejouable** reste item G0 U-7 (`ADR-U4:77-78`). `scripts/export-exclude-tests.json` **compte** dans R-25 (non exclu par `ci.yml:65`).

---

## §11. Risques MAST (checklist de risque résiduel)

| Mode | Menace | Contre-mesure (mesurée) |
|---|---|---|
| **Sélection sur l'issue** | épisode frais choisi après avoir vu un q̂ flatteur | règle P-EPI committée SEULE avant tout appel (§7) ; sélection **mécanique** rejouable offline ; e2 = conception, jamais servi |
| **Fixture auto-enregistrée** | le test rejoue ce que le script a écrit | G2 fraîche (digests recalculés indépendamment) ; mutants source tueurs (§9) ; fixtures reproduites byte-exact ; **contrôle live** re-tirage (§9) |
| **Vérification incorrecte** | mutant non discriminant ; critère basculé après données | mutants changent une éligibilité RÉELLE (§9 a-g) ; H-0..H-7 avec critères de NON épinglés ; version de règle gardée par H-1 |
| **Terminaison prématurée** | lot présenté clos sans chemin servi | `built` ssi `u4b_gate_serves_region_from_real_artifact` vert ; site `upcoming` (décision 101) ; G7 au seul orchestrateur |
| **Fuite de secret** | URL/clé Chainstack/Pocket dans un log/brut | label `archive-env` ; `scrubUrls` ; `no-secret-in-repo` ; CGU lues avant appel |
| **Perte d'information** | book/labels partiels présentés complets | `no_quorum` ⇒ abstention ; résidus nommés/comptés ; `non_evaluable` e-mode non-cat-1 ; H-4 (multi-appels) déclaré |
| **Budget non attribué (HELIUS-1)** | consommation payante hors ledger | garde du dépôt + ledger persistant + dashboard lu AVANT/rapproché APRÈS (§6) |
| **Version de règle** | ŷ close factor lu pour v3.5.0 appliqué à une autre impl | H-1 (EIP-1967 @B_first == `0x97287a4f…`) ; sinon PAUSE + PR-U4-3-bis |
| **Zone gelée touchée** | `AttestedBook`/`ukemi_sha`/registre modifié par inadvertance | A-6 lie par `book_digest` (C-6, 0 octet `schemas/**`) ; re-pin `ukemi_sha`/h5 **déclaré**, diff vide vérifié G2 |

---

## §12. Questions checkpoint-1 (validateur) et questions investisseur (une par une, options + reco)

**Checkpoint-1 (design à ratifier par le validateur)** :
- **C-1** — task_class/predictor_id : `task_class = liquidation-realized-given-oracle-path-24h` inchangé ; `predictor_id = ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/<episode>/s<k>` (v2 = ŷ close factor + mono-collatéral + strate). Reco : **oui**.
- **C-2** — voie strate↔registre : **α (strate dans predictor_id, K entrées, lookup inchangé)** vs β (lookup conscient). Reco : **α** (R-25 minimal, `calibration.ts:207-209` intact).
- **C-3** — nMin/α imposés serveur (motif stable-run) pour la classe committée. Reco : **imposés serveur**.
- **C-4** — coupes de strates aux frontières du code (`< 2000e8`, `[2000e8,100k$)`, `[100k$,1M$)`, `≥1M$`) fixées AVANT données. Reco : **oui**.
- **C-5** — H-1 (version) : cluster impl ≠ v3.5.0 **écarté de la sélection** (P-EPI 3c) ET course en pause si l'épisode retenu diverge. Reco : **oui**.
- **C-6** — cascade→book : retrait `cascade-liquidable-24h`, pas d'alias (C-9 G0 U-4 conservé), même commit que le dispatch de la classe. Reco : **oui**.
- **C-7** — contrôle live nommé dans la mission G2 dès le départ (§9). Reco : **oui**.

**Questions INVESTISSEUR (posées une par une, options + recommandation)** :
- **E-I-1 — tie-break de sélection de l'épisode frais** : (i) **premier** cluster WETH éligible chronologiquement [moindre sélection-sur-la-taille] ; (ii) **plus grand** par #comptes liquidés [plus de n, meilleure calibration]. **Reco : (i)** (le n suffisant est garanti par N_min de E-I-2 ; (i) minimise le biais de sélection — MAST). *À trancher avant le prereg.*
- **E-I-2 — seuil `N_min` de comptes liquidés distincts pour qu'un cluster soit éligible** : options (a) `N_min = 100` [aligné nMin, mais risque H-0 NON si aucun cluster WETH ne l'atteint hors e2] ; (b) `N_min = 50` [plus de candidats, strates ≥1M$ resteront `under_calib`] ; (c) `N_min = 30`. **Reco : (b) 50** (compromis existence/informativité ; strates sous nMin abstiennent honnêtement). *Note : `N_min` borne le nombre de comptes LIQUIDÉS du cluster ; la cellule calibrée est plus large — elle inclut les éligibles-non-liquidés (608 en e2, `ADR-U4:87`) ⇒ n(strate) est dominé par ceux-ci, pas par `N_min`. Jugement de valeur — non deviné.*
- **E-I-3 — servir UNE classe ou DEUX (Mondrian)** : (a) **Classe A seule** (eligible-coverage, Mondrian par taille) [minimal, honnête] ; (b) **A + B** (B = sachant-liquidé) [plus riche, +R-25, plus de strates `under_calib`]. **Reco : (a) au release, B en item formé U-4c-adjacent** (K=2, la plupart des strates B < nMin).
- **E-I-4 — traitement du reliquat `MustNotLeaveDust`** dans ŷ : (a) si reliquat < 1000e8 des deux côtés ⇒ **ŷ := clôture totale `D_r`** ; (b) ŷ inchangé + résidu `dust_bounded` compté hors score. **Reco : (b)** (ne modifie pas la forme de close factor lue [lu] ; `PR-U4-3:279-284` note ce cas comme non prouvé exhaustivement).
- **E-I-5 — confirmation d'absorption A-5..A-7 (U-4a-ii annulé comme sous-lot)** : due au G0 U-4b (`CHANTIERS.md:396`, `ADR-U4:190-196`). **Reco : ABSORBER** (le chemin servi §0 en a besoin ; sinon rien de `built`).
- **E-I-6 — révision de `apps/sentinel/src/rpc.ts` (pool Narabi LIVE U1)** : POOL-RPC-1 vise AUSSI `rpc.ts:19-23` (`CHANTIERS.md:406`), mais ce pool est **servi et LIVE** (Narabi, ancre épinglée `rpc2.ts:2`) et ses endpoints sont **publiés en provenance** (`publishedEndpoints`, `rpc.ts:65-71`). Options (a) retirer Blast+LlamaRPC de `rpc.ts` **dans U-4b-0** [cohérence, mais touche une surface servie Narabi] ; (b) laisser `rpc.ts` à un **lot Narabi séparé**, U-4b ne touche que `rpc2.ts` (Ukemi U2). **Reco : (b)** — la barre d'admission U1 (Narabi servi) ≠ U2 (campagne Ukemi), et un retrait d'endpoint y change `PUBLIC_ENDPOINTS`/`publishedEndpoints` (surface servie). *Garde si (a) est retenu* : `hashedFields` **exclut** `endpoints` (`rpc.ts:67`) ⇒ le retrait ne touche PAS `line_hash` de Narabi, **à prouver au G2 avant tout retrait**. **Dans les deux cas U-4b ne dépend d'aucun opérateur non-admis** (son pool vit dans `rpc2.ts`, §5).
- **E-I-7 — `s_cutoffTime` courant** : 1 `eth_call` @B_fresh dans la sonde sous garde (reste dû `SYNTHESE.md:53`). **Reco : OUI** (l'ancre du retard D_e servi en dépend ; hors sonde, item procurement). *Confirmer le go de la sonde.*

**Procurement formé (aucun dû nu, règle Dettes)** : **PR-U4-4-a** — table des matières / chapitre exact Mondrian de *Algorithmic Learning in a Random World* 2e éd. (Vovk-Gammerman-Shafer, Springer Cham 2022, ISBN 978-3-031-06648-1, DOI présumé 10.1007/978-3-031-06649-8) ; 4 tentatives documentées (`SYNTHESE.md:71`, `PR-U4-4:111-114`, `:94-105`) ; usage : citer le chapitre exact dans l'ADR-U4b entrée « deux classes Mondrian ». Substitut ouvert de haute pertinence disponible (article fondateur 2003, `alrw.net/old/04.pdf`). **PR-U4-3-bis** (conditionnel H-1) — `LiquidationLogic.sol` de l'impl effective si ≠ v3.5.0.

---

### Provenance (règle de branchement — tuyaux déclarés de CE G0)
Entrée : décisions 91/99/100/101/102 + entrées prereg U-4b (`ADR-U4:152-188`) + prérequis rendus (`F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\`). Sortie : ce G0 (`F:\tmp\u4b\G0-lot-u4b.md`), consommé par le checkpoint-1 (validateur) puis les worktrees U-4b-0/1/2. État : plan (aucun code, aucun réseau). Réviseur : orchestrateur `claude-fable-5-1` (R-21, vérification adversariale avant consommation). Modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-21.
