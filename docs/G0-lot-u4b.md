MODELE RESOLU: claude-opus-4-8[1m]

# G0 — Sprint backlog lot Ukemi **U-4b** (PLI checkpoint-1) : calibration servie sur ÉPISODE FRAIS (ŷ close factor v3.5.0 au PREMIER FRANCHISSEMENT, classe mono-collatéral WETH, Mondrian), absorption U-4a-ii, items d'outil

> **Statut** : PLAN PLIÉ au checkpoint-1 (validateur `claude-fable-5-1`, verdict ACCEPTE-AVEC-CORRECTIONS — 15 bloquantes C-1..C-15, 5 non bloquantes C-16..C-20 ; rulings E-I-1(i)/E-I-2=50/E-I-4(b)/E-I-7=oui, E-I-5/E-I-6 closes ; **E-I-3 escaladée à l'investisseur**, en attente). Ce fichier **remplace** `docs/G0-lot-u4b.md`. Chaque correction est pliée dans les sections marquées `[C-n]` ; la **table des plis** est au §13.
> **Provenance de l'avis** : l'avis intégral du validateur (`…/tasks/a9cc07cbd6d6dd504.output`) est **0 octet** (mesuré ce tour, 05:25). Les corrections sont pliées depuis (a) le brief de mission d'orchestrateur (énumération détaillée C-1..C-20 + rulings) et (b) `docs/CHANTIERS.md:448-449` (résumé checkpoint-1, verdict et rulings). **Aucun texte n'est présenté comme verbatim du validateur** ; l'avis persisté est `F:\tmp\u4b\pli-cp1\CHECKPOINT1-lot-u4b.md`.

- **Rédacteur du pli** : worker `claude-opus-4-8[1m]` (R-1, effort max). **AUCUN code, AUCUN appel réseau dans ce G0** (plan seul). **R-20** : le worker ne committe pas, ne déclenche aucun workflow ; verdict/commit = orchestrateur `claude-fable-5-1`. **R-21** : chaque `fichier:ligne` a été OUVERT ce tour (liste au §Provenance).
- **Date** : 2026-09-21. **Base** : branche `lot/etude-suite` ; checkpoint-1 U-4b clos au HEAD `9b61430` (`git status` de session : « U-4b checkpoint-1 ACCEPT-WITH-CORRECTIONS … + escalation E-I-3 ») ; `git log -1` ce tour = `49e738b`. Dépôt `F:\Monark` lu en **lecture seule**. **[C-20]** en-tête et chemin corrigés : source = `docs/G0-lot-u4b.md` ; remplaçant plié = `F:\tmp\u4b\pli-cp1\G0-lot-u4b.md` ; la ligne d'auto-référence `F:\tmp\u4b\G0-lot-u4b.md` et la base périmée `671b8f2` du G0 d'origine sont supprimées.
- **Cadre** : décision investisseur **91** (`CHANTIERS.md:273`, « refais la mesure avec chainstack ukemi » — épisode FRAIS, Chainstack, ŷ close factor, mono-collatéral WETH, **deux classes Mondrian**, e2 = conception seule) ; décision **99** (`CHANTIERS.md:401`, absorber U-4a-ii) ; **POOL-RPC-1** (`CHANTIERS.md:406`) désormais **traité par le lot POOL-RPC-1a** (`docs/G0-lot-pool-rpc-1.md` **fait foi pour le pool**) — **[C-2]** ; décisions **100/102** (Pocket ajouté, Tenderly conservé, Blast/LlamaRPC retirés) ; décision **101** (SITE hors gates, backend d'abord) ; entrées de pré-enregistrement U-4b (`ADR-U4:152-166`) + contenu G0 exigé au checkpoint-2 bis (`ADR-U4:167-188`).
- **Prérequis RENDUS** (lus, `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\`) : `SYNTHESE.md`, `PR-U4-3-liquidationlogic-close-factor.md` [lu], `PR-U4-1-agregateur-eth-usd-svr.md` [lu], `PR-U4-4-biblio-conformal-prediction.md` [abs+]. **Précondition [C-15]** : lecture **[lu] de « Mondrian Confidence Machine » (2003)** (`alrw.net/old/04.pdf`) **AVANT le commit du prereg** — acte lecteur `claude-sonnet-5` **lancé séparément par l'orchestrateur** (hors ce worker) ; référencée ici comme **précondition dure de U-4b-1b** (le prereg ne se committe pas sans elle). **Reste dû connu** : `s_cutoffTime` COURANT @ bloc épisode (1 `eth_call` sous garde — E-I-7 = **OUI**, dans la sonde) ; chapitre exact Mondrian du livre 2e éd. (procurement **PR-U4-4-a**, substitut ouvert 2003 en cours de lecture [lu]).

---

## §0. Ce que U-4b sert, à qui, et par quel tuyau (branchement — CA-11)

**But (une phrase)** : le gate MONARK répond, sur la classe de liquidation réalisée le long d'un chemin d'oracle réalisé, une **région conforme** `[ŷ − q̂, ŷ + q̂]` calibrée sur un **épisode FRAIS** (jamais e2), avec ŷ à **close factor** (v3.5.0) évalué au **PREMIER FRANCHISSEMENT** (C-1) sur la classe **mono-collatéral WETH**, **stratifiée Mondrian par taille**, et **abstient `under_calib`** partout ailleurs et sur toute strate `n < nMin` — servi par un **outil MCP** (backend), site exclu (décision 101).

**Consommateur SERVI** : `apps/harness/src/tools/gate.ts` — motif `stableRunVerdict` (`gate.ts:446-489`) : `lookupCommittedCalibration(task_class, predictor_id)` (`calibration.ts:207-209`, exact-match) → `splitQuantile → buildIntervalRegion → buildVerdict`. U-4b **ajoute la classe de liquidation** au même motif. Registre committé : `apps/harness/src/calibration.ts` (`COMMITTED_CALIBRATIONS`, `:195-203`, garde de digest à l'import `:165-170`). Conformeur : `packages/hikae/src/interval-conformer.ts` (`|y − ŷ|`, `q̂ = ⌈(n+1)(1−α)⌉`-ᵉ plus petit, `:54-106`) — **réutilisé sans réécriture** (une seule implémentation de quantile, L1).

**Tuyaux (ADR-M018 D3 ; entrée → sortie → état → test NON-LLM)** — **[C-9]** le maillon scores→registre porte désormais un **générateur nommé** et un **test non-LLM** ; **[C-17]** le réducteur U-4b est un **fichier neuf `u4b-reduce` sous `u4b/`** (le réducteur e2 `u4-reduce.mjs` et les fixtures e2 restent **byte-identiques**) :

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration NON-LLM |
|---|---|---|---|---|
| Découverte épisode FRAIS | prereg §DISC → `getLogs(Pool,[LiquidationCall],[B_lo,B_hi])` quorum-2 (**compté au budget, [C-19]**) → sélection mécanique | course book+D_e | brut hors dépôt sha-pinné + `episode-selection.json` in-repo | `u4b_episode_selection_is_deterministic` (rejeu offline : mêmes bruts ⇒ même épisode) |
| book B₀ + labels Y frais | recorder RPC quorum-2 (pool **POOL-RPC-1a**, C-2) + labeling paramétré → bruts hors dépôt → **`u4b-reduce`** | réducteur A-4 (test) + adaptateur `fromRealizedBook` | fixture réduite in-repo sha-pinnée + brut hors dépôt | `u4b_book_replays_bit_identical`, `u4b_labels_replay` |
| D_e chemin oracle réalisé (SERVIE) + **ancre pré-B₀ [C-8]** | `u4-oracle-path.mjs` (getLogs `AnswerUpdated` de l'agrégateur résolu) + `emode_raw` → hors dépôt → **`u4b-reduce`** | réducteur A-4 (test) ; ŷ au **premier franchissement** | fixture in-repo sha-pinnée + brut hors dépôt | `u4b_oracle_path_monotone_and_served_membership`, `u4b_first_crossing_is_deterministic` |
| réduction → scores close factor + strates | (book, D_e, labels, `emode_raw`) → **`u4b-scores` (code GELÉ par sha, [C-12])** → `U4b-scores.jsonl` + `calib_digest`/strate | **générateur `record-u4b-calib.mjs` [C-9]** → entrées committées `calibration.ts` | fixture sha-pinnée ; entrée committée fail-closed à l'import | `u4b_calibrates_from_fresh_realized_labels`, **`u4b_registry_recomputes_from_scores_jsonl`** (n, q̂, `calib_digest`, échelle bigint→number, **borne 2^53/strate**) |
| **région SERVIE** | `calibration.ts` (K entrées Mondrian, digest épinglé) → `gate.ts` dispatch classe + `strateOf(yhat)` **serveur [C-10]** + `fromRealizedBook` | **outil MCP `gate` → `GateDecision`** | **`built`** ssi test vert ; sinon `upcoming` | **`u4b_gate_serves_region_from_real_artifact`** (charge la calib, construit `Prediction` depuis l'artefact réel, `strateOf` serveur, asserte `covered` [ŷ−q̂,ŷ+q̂] + digest pour `n≥nMin`, `under_calib` pour `n<nMin`) + trace h5 `probe_harness_records_real_decision` |

**Règle de branchement** : `built` ssi sortie consommée par un chemin **servi** (outil MCP `gate`) couvert par un **test d'intégration non-LLM** rejouant la composition. **Surface SITE** (`apps/site/lib/fleet.ts`, page Ukemi, panneaux) = **hors gates, en dernier** (décision 101) ⇒ **item formé SITE-U4B** (déclencheur : passe site ungated après backend branché ; propriétaire orchestrateur+investisseur). La contrainte « registre `built` ⇔ branché » reste non négociable même hors gates.

---

## §1. Découpage R-25 — RESTRUCTURÉ par le pli (C-2 / C-4 / C-12 / C-18)

**Garde R-25** (`.github/workflows/ci.yml`) : plafond `VIBEGATES_PR_LIMIT = 1205` ; la pathspec `STAT=` exclut `docs/**/*.md`, `fixtures/**/*.{json,jsonl,csv}`, `apps/sentinel/test/fixtures/**` — mais **COMPTE** `scripts/census/**`, `apps/**/src/**`, `packages/**/src/**`, tous les `*.test.ts`, `docs/**/*.mjs`, `scripts/export-exclude-tests.json`. **Cinq sous-lots sérialisés** (estimations révisées au G1) :

- **U-4b-0 — items d'outil + garde de budget (AUCUN réseau)** — **[C-2] : plus de révision de pool ici** (POOL-RPC-1a possède `rpc.ts:19-23` et `rpc2.ts:250-251`). Contenu : (1) `meta.model` fail-closed ; (2) `onRpcError` sink ; (3) durcissement EBUSY ; (4) **[C-4] garde de budget qui compte les TENTATIVES HTTP + ledger persistant cumulatif hors dépôt append-only par méthode ET par opérateur + plafond global fail-closed + critère de rapprochement pré-enregistré (RU vs requêtes = E-2)**. **Est. ≈ 400** (code ~180 + tests/mutants ~220). **Prérequis dur des courses.** **Aléa de fusion (à écrire, pas un défaut de pli)** : U-4b-0 et POOL-RPC-1a éditent tous deux `record.ts` (U-4b-0 : budget `:79-155`, `meta.model` `:319/353`, EBUSY `~:324` ; POOL-RPC-1a L-4 : `--concordance-out` dans `main` `:276-307`) ⇒ **ordre de fusion à fixer par l'orchestrateur ; le second rebase sur `record.ts:main`**.
- **U-4b-1a — code de score + réducteur, OFFLINE, GELÉ par sha [C-12/C-17/C-9]** : `u4b-scores` (ŷ **close factor au premier franchissement**, Mondrian, multi-réserves) + `u4b-reduce` (**neuf, sous `u4b/`**, garde `liquidation_bonus_bps` réserve + bonus e-mode depuis `emode_raw`) + générateur `record-u4b-calib.mjs` (code) ; **validés sur e2** (jeu de conception), **mutants**, **sha du code figé DANS le prereg**. **Aucun réseau, e2 intact.** **Est. ≈ 450**.
- **U-4b-1b — prereg + découverte + labels + course fraîche (RÉSEAU, sous garde) — dépend de la FUSION de POOL-RPC-1a [C-2]** : prereg committé seul (docs, exclu R-25) portant le sha gelé de -1a ; `u4b-discover.mjs` (découverte **comptée au budget [C-19]**) ; labeling paramétré ; course book/D_e/labels frais → `U4b-scores.jsonl`. **Est. ≈ 350**.
- **U-4b-2 — chemin servi backend [C-18 : R-25 révisé]** : absorbe **U-4a-ii = A-5/A-6/A-7** ; `calibration.ts` K entrées Mondrian + générateur committé + `u4b_registry_recomputes_from_scores_jsonl` [C-9] ; `gate.ts` dispatch + `strateOf(yhat)` serveur [C-10] + honnêteté [C-11] ; **retrait `cascade-liquidable-24h` (8 fichiers gatés, [C-18])** ; re-pin trace h5 ; test d'intégration servi. **Est. ≈ 620** ⇒ **ligne de scission pré-déclarée** si G1 > 1205 : **U-4b-2a** (registre + générateur + `strateOf`) / **U-4b-2b** (dispatch gate + adaptateur A-6 + hikae A-7 + retrait cascade + intégration).
- **SITE (hors gates, décision 101) — [C-18]** : `apps/site/lib/fleet.ts` (**9ᵉ fichier du retrait cascade, sous décision 101**), page/panneaux Ukemi, logo — **PAS un sous-lot gaté** ; item formé SITE-U4B, en dernier.

**Projection** : 400 + 450 + 350 + 620 ≈ 1820 `ins+del` gatés ⇒ 4-5 PR, aucune > 1205. Séries JSONL, prereg, docs exclus.

---

## §2. Épisode FRAIS — règle de sélection PRÉ-ENREGISTRÉE (fixée AVANT toute donnée)

**Contrainte de fond** : census A de U-3 n'a observé que **trois** clusters (`RAWLOGS_SHA=d0f4aa1e…`, `u3-realized.mjs:40`) — e1 2025-02-21 sUSDe (3), **e2 2025-10-10/11 WETH (194 lignes / 189 comptes)**, e3 2026-01-19 sUSDe (1) — et `u3-realized.mjs:3-5` est **codé en dur** sur ces trois. **Seul e2 est WETH-collatéral et de taille utile.** Un épisode FRAIS WETH n'est **PAS pré-existant** ⇒ U-4b **découvre** un NOUVEAU cluster WETH et exécute la chaîne U-3+U-4 dessus (~280 k appels, décision 91). Règle **fixée avant tout appel**, **committée seule** (§7).

**[C-5] P-EPI — partition en PSEUDO-CODE EXACT (G2 réimplémente depuis ce texte seul ; relaxation après H-0 NON = D-n déclarée)** :
```
# Entrées : B_lo, B_hi_rule, e2_window=[23545088,23557060], N_min (=50, ruling E-I-2)
B_lo        = 22803459                      # bascule feed WETH → proxy SVR 0x5424384b… (PR-U4-1:41,45) : sémantique D_e == e2
B_hi        = finalized - 64                # RÈGLE, pas un nombre : finalized lu à l'exécution, horodaté dans le brut de découverte
logs        = getLogs(Pool, [LIQ_TOPIC], B_lo, B_hi)      quorum-2   # LIQ_TOPIC = u3-realized.mjs:54 (auto-testé)  — COMPTÉ AU BUDGET [C-19]
logs        = { L in logs : block(L) not in e2_window }            # e2 exclu : conception, jamais servi

# clustering VERBATIM la règle U-3 D2 (ADR-U3:30-31) :
for each L in logs ordered by (block, logIndex):
    if collateralAsset(L) != WETH: continue
    if L not yet assigned to a cluster:
        B_first = block(L)
        B_last  = firstBlockAtOrAfter( ts(B_first) + 86400 ) - 1     # windows.ts ; bloc jamais horodaté
        cluster = { M in logs : collateralAsset(M)==WETH and B_first <= block(M) <= B_last }
        residual_outside_window += { M : block(M) not in [B_first,B_last] }   # nommé, compté

# éligibilité d'un cluster candidat (seuils pré-enregistrés) :
eligible(cluster) :=
      collateralAsset == WETH
  AND B_last <= B_hi                                                          # fenêtre 24h COMPLÈTE ; sinon count PARTIEL ⇒ cluster écarté, résidu window_truncated compté [C-5]
  AND count(distinct liquidated accounts in cluster) >= N_min                 # N_min = 50 (E-I-2)
  AND version_ok(impl(Pool @ B_first))                                        # voir [C-6] ci-dessous
candidats = { cluster : eligible(cluster) }

# choix (tie-break pré-enregistré, ruling E-I-1 = (i)) :
episode = argmin over candidats of B_first          # (i) PREMIER éligible chronologiquement (moindre sélection-sur-la-taille)
# tie-break secondaire (B_first égal, improbable) : plus grand count(distinct liquidated), puis address min

episode_id = "weth-" + date(B_first)
B_first, B_last, B0 = B_first - 1                    # écrits dans episode-selection.json, DÉRIVÉS des bruts (aucune main)
```
`episode-selection.json` est **reproductible depuis `(prereg_sha, brut de découverte)`** — c'est ce qu'asserte `u4b_episode_selection_is_deterministic`. La borne haute mobile survit : la **règle** est figée, la **donnée** (`finalized`) est horodatée dans le brut.

**[C-6] Éligibilité de VERSION (règle atteignable — v3.6.0 publié 2026-01-08 ⇒ la plupart des clusters frais post-`B_lo` sont v3.6.0)** :
```
version_ok(impl) :=  (impl == v3.5.0  0x97287a4f…)                                   # cas nominal
                 OR  (impl_diff_LiquidationLogic_sol_lu_et_declare_NEUTRE(impl))     # cas frais réaliste
```
- Les **5 constantes** close factor sont **identiques v3.3.0→v3.7.0** (`PR-U4-3:159-160`, `SYNTHESE.md:22`) ; le risque porte sur la **logique** (v3.6.0 = 79 lignes de diff, date mainnet établie = 2026-01-08). ⇒ **procurement `PR-U4-3-bis` (lire `LiquidationLogic.sol` de l'impl effective au niveau [lu] et déclarer le diff NEUTRE pour le close factor) est de fait une PRÉCONDITION, pas un conditionnel** : tout épisode frais v3.6.0 exige ce [lu] **AVANT tout ŷ**. Plage census A déclarée : **découverte `[B_lo=22803459, finalized−64] \ e2`** ; **énumération détenteurs aWETH `16496792 → 23545087`, chunk 9 990, ≈ 1 412 getLogs/opérateur** (`CHECKPOINT1-lot-u4:34`, `PLAN-u4-prereg.md:24`).

**Hypothèses (chiffre + critère de NON explicites)** :
- **H-0 (existence)** : ≥ 1 cluster WETH éligible dans `[B_lo,B_hi] \ e2`. **NON ⇒** arrêt `no_fresh_episode`, **item formé** (élargir la fenêtre / abaisser N_min = décision investisseur), **AUCUNE course**. **[C-5]** toute relaxation post-NON (fenêtre, N_min) = **D-n déclarée au PLI**, jamais un ajustement silencieux.
- **H-1 (version)** : impl @B_first `== v3.5.0` OU diff [lu]-neutre (C-6). **NON (diff non lu) ⇒** course **EN PAUSE**, `PR-U4-3-bis`.

---

## §3. ŷ à **close factor** v3.5.0 au **PREMIER FRANCHISSEMENT** [C-1] — et ce que ça change vs U-4a

**U-4a** : `ŷ = total_debt_base` si `HF(D_e) < 1e18` sinon 0 (`ADR-U4:42`) — plafond grossier, HF recomputé à **p_min** (`ADR-U4:44`). **U-4b [C-1]** : ŷ = **maximum liquidable en UN appel** (règle lue [lu] `v3.5.0`, tag `6138e1fda…`, `PR-U4-3:69,94`) évalué **au premier franchissement p\*** (décision 91 + advisor-defi Q3) — **PAS à p_min** (le conserver = REFUS).

**Définition de p\*** :
```
p*  =  premier AnswerUpdated le long de D_e, parcouru depuis l'ANCRE pré-B₀ [C-8 entrée 7] dans l'ordre (block, logIndex),
       tel que HF(p*) < 1e18.
HF(p*) = recompute WadRay ; jambes WETH (collat aWETH ET dette vWETH) au prix p* ; autres actifs figés à p0 (limitation D2 déclarée) ;
         LT_WETH = LT réserve si emode=0, sinon LT de la catégorie e-mode (decodeEModeCategoryData, emode_raw) ; identité H-7 : à p*=p0, HF==hf0.
Cas de bord : HF(p0) < 1e18 déjà à l'ancre (e2 : 64 eligible_static_b0, ADR-U4:91)  ⇒  p* = p0 (l'ancre).
              jamais de franchissement le long de D_e                               ⇒  ŷ = 0 (non éligible), Y compté.
```
**Conditions du close factor, `C_r`, `D_r` évalués À p\*** (`PR-U4-3:262-267`, notation propre, base 8 déc.) :
```
ŷ_base = min( CF_base , C_r^base(p*) / m )
CF_base = min( D_r^base(p*), 0,5·D_tot^base(p*) )   si  C_r^base(p*) >= 2000e8  ET  D_r^base(p*) >= 2000e8  ET  HF(p*) > 0,95e18
        = D_r^base(p*)                               sinon
```
Constantes [lu] (`PR-U4-3:120-137`) : `DEFAULT_LIQUIDATION_CLOSE_FACTOR=0,5e4` (l.44) ; `MAX_LIQUIDATION_CLOSE_FACTOR` **ABSENTE** de v3.5.0 (retirée v3.3.0) ; `CLOSE_FACTOR_HF_THRESHOLD=0,95e18` (comparaison **stricte** `>`) ; `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD=2000e8` ; `MIN_LEFTOVER_BASE=1000e8` (`/2`). **Effet du premier franchissement** : à p\* (juste sous 1e18, souvent `0,95e18 < HF(p*) < 1e18`), la **réduction 50 % s'applique** ; à p_min (HF plus bas), le close factor pourrait être plein — d'où le **mutant C-1 non tautologique**.

**[C-7] Règle multi-réserves de dette** (classe mono-collatéral WETH ⇒ `r_c = WETH` ; le book itémise TOUS les vDebt, `ADR-U4:47`) :
```
ŷ = max over r_d in {réserves de dette du compte} of  ŷ_base( r_d , WETH )     # un appel liquide UNE paire (r_d, r_c)
```
Le liquidateur choisit la **meilleure paire en un appel** ⇒ **max**, jamais Σ. Mutant : **Σ sur les réserves (multi-appels) ⇒ ROUGE** ; mutant : **D_tot au lieu de D_r par réserve ⇒ ROUGE**.

**[C-13] `MustNotLeaveDust` en OU** (`PR-U4-3:206-232`) : l'appel **revert** si
```
( 0 < debt_left_of_reserve  < 1000e8 )   OU   ( 0 < coll_left  < 1000e8 )
```
(clôture totale d'une jambe, sinon reliquat ≥ 1000e8 des DEUX côtés requis). **Ruling E-I-4 = (b)** : **ŷ inchangé** (on ne modifie pas la forme close factor lue [lu]) **+ résidu `dust_bounded` compté hors score** sur le côté déclenchant. Mutant : traiter le reliquat « des deux côtés » (AND, l'erreur du G0 d'origine) ⇒ ROUGE.

**[C-14] bonus e-mode depuis `emode_raw`** : `m` = multiplicateur de bonus. Non-e-mode : `liquidation_bonus_bps` de la **réserve** (décodé `abi.ts:134`, gardé par `u4b-reduce`). E-mode : `liquidationBonusBps` de la **catégorie e-mode**, décodé de **`emode_raw`** via `decodeEModeCategoryData` (`abi.ts:181`) — motif `u4-reduce.mjs:52` (qui n'en extrait aujourd'hui que le LT). **`emode_raw` est dans le brut du chemin oracle** (`oRaw.emode_raw`, `u4-reduce.mjs:52`) ⇒ **hors book, AUCUN appel réseau supplémentaire** ; `book.ts` (recorder, PIN `034fbff9`) reste **INTACT**. Mutant : **bonus e-mode pris sur la réserve au lieu d'`emode_raw` (ou omis) ⇒ ROUGE** (scores changent).

**Ce que ça change (chiffres au G1)** : ŷ passe de « dette totale » à « ≈ 50 % au premier franchissement, plafonné `C_r/m` » ⇒ scores `|Y − ŷ|` **plus petits et informatifs** (U-4a couvrait 0 pour 790/797, `ADR-U4:117-126`). **Biais H-4** : ŷ = un appel ; Y = Σ des remboursements 24 h ⇒ **sous-prédiction** pour un compte multi-`LiquidationCall` ; H-4 = fraction des comptes liquidés avec > 1 `LiquidationCall`, **NON (> seuil k_H4, C-11) ⇒** biais déclaré load-bearing, sous-prédiction par strate.

---

## §4. Méthode conforme — split-conformal, Mondrian, échangeabilité (H-n avec critère de NON)

**Split-conformal** (motif U-4a) : `s = |Y − ŷ|`, sans clipage, tri canonique ; `q̂ = p`-ᵉ plus petit, `p = ⌈(n+1)(1−α)⌉` ; **α = 0,01** ; **nMin = 100** par strate (conservateur Dunn 2022 Thm 11 `n₁ > 1/α − 1`, strict, `ADR-U4:51-54`) ; **e2 = conception** (forme du score + coupes, jamais servi), **épisode FRAIS = calibration** (produit q̂). Biblio résolue (`PR-U4-4`) : CQR arXiv:1905.03222 ; Angelopoulos-Bates arXiv:2107.07511 ; Lei et al. JASA DOI 10.1080/01621459.2017.1307116 ; Papadopoulos-Gammerman-Vovk AIA 2008 ; **Mondrian** Vovk-Gammerman-Shafer 2e éd. Springer Cham 2022 (ISBN 978-3-031-06648-1) + fondateur 2003 (`alrw.net/old/04.pdf`, **[lu] précondition C-15**).

**Deux classes Mondrian (décision 91, `ADR-U4:161-163`) — en COUVERTURE, jamais en probabilité** :
- **Classe A — `liquidation-eligible-coverage`** : unité = compte **mono-collatéral WETH** ; cellule = {ŷ>0 sous D_e au premier franchissement} ∪ {liquidés} ; score `|Y − ŷ_closefactor|` ; **Mondrian par taille de ŷ**, coupes aux frontières **naturelles du code** : `< 2000e8` (sous `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD`), `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$`.
- **Classe B — `liquidation-realized-given-liquidated`** : unité = compte **liquidé** ; score `|Y − ŷ_closefactor|`.

**[C-8] Tolérance mono-collatéral `X` (chiffrée, choix de conception proposé à ratification — doc 03, non présenté comme fait sourcé)** :
```
mono_collateral_WETH(compte) :=  collat_non_WETH_base(p0) / total_collateral_base(p0)  <=  X
```
`X` **proposé = 0** (strict mono-collatéral) ; le book n'itémise qu'aWETH ⇒ le collat non-WETH ne peut être repricé hors ligne (`ADR-U4:48`), donc un compte avec collat non-WETH > X est **`non_evaluable` compté**, jamais estimé. `X` à ratifier au prereg.

**[C-8] entrée 4 — LST (jetons de staking liquide, ex. wstETH/weETH)** : repricer un LST exige son taux LST/ETH (donnée hors book) ⇒ **par défaut résidu `lst_debt_at_p0`** (dette/collat LST tenu à p0, non repricé) **compté, avec effet mesuré sur e2** (e2 : 7 lignes de dette wstETH, `CHECKPOINT1-lot-u4:13` ; effet chiffré au G1). Option de repricing = item formé si l'effet e2 dépasse un seuil déclaré.

**Strate ↔ registre — [C-10] voie α AVEC contrôle serveur, sinon β** :
- (**α**) strate encodée dans `predictor_id` (`ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/<episode>/s<k>`) ⇒ K entrées committées, `lookupCommittedCalibration` **intact** (`calibration.ts:207-209`) — **MAIS admise UNIQUEMENT avec un contrôle SERVEUR `strateOf(yhat)`** : le gate calcule la strate depuis `yhat` (les coupes committées) et sélectionne le `predictor_id` correspondant ; l'appelant **ne choisit pas sa strate**. **α et nMin IMPOSÉS serveur** pour la classe committée (jamais affaiblis par `params.*` de l'appelant, contrairement au chemin BYO `gate.ts:455-456`). Sans `strateOf` serveur ⇒ **repli β** (lookup conscient des strates, signature changée). **Reco : α + `strateOf`.**
- **Strates `n < nMin` pré-déclarées `under_calib`** (e2 : ≥ 1 M$ n=35, `ADR-U4:139`) — abstention honnête, pas un défaut.

**Échangeabilité — H-n avec critère de NON** :
- **H-2 (n/strate)** : n(strate) ≥ nMin ; **NON ⇒** strate `under_calib` (comptée).
- **H-3 (échangeabilité INTER-épisodes, falsifiable)** : appliquer le q̂ FRAIS à la cellule e2 ⇒ **couverture empirique** ; **critère de NON : couverture `< 0,99 − k·SE`**, `k` **proposé = 2** (choix de conception, ratification), `SE` de `Beta(p, n−p+1)` de l'épisode FRAIS (pas le 0,3 pt d'e2). NON ⇒ écart inter-épisodes **en chiffres** (Σ w̃·d_TV, Barber 2023), **aucune revendication sur un nouvel événement** (K=2 ≪ 99 à α=0,01). **[C-11] texte servi** : « **un OUI de H-3 ne licencie rien de plus** » (H-3 tenu ne licencie AUCUNE revendication additionnelle) ; **mutant de sur-revendication** (servir une phrase revendiquant plus que la calib committée) ⇒ ROUGE (motif A7(f), `gate.ts:498`).
- **H-4 (multi-appels)** : seuil `k_H4` **proposé = 5 %** (conception, ratification) ; NON ⇒ sous-prédiction déclarée (§3).
- **H-5 (population option B)** : #comptes mono-collatéral WETH ≥ seuil `k_H5` **proposé = nMin=100** (conception) ; rapporté.
- **H-6 (série SERVIE)** : valeur d'oracle servie ∈ série `AnswerUpdated` + borne de retard 1–3 events (`ADR-U4:104-112`) ; NON ⇒ p_min re-défendu par encadrement (condition « toute valeur servie ∈ events ∪ {p0} »).
- **H-7 (identité)** : à p\*=p0, `HF==hf0` EXACT (`ADR-U4:47`) — mutant LT_W←0 ROUGE.

> **[C-11] note doc 03** : `k=2`, `k_H4=5 %`, `k_H5=100`, `X=0` sont des **choix de conception avec rationale, proposés à ratification** — **jamais des faits sourcés**. `N_min=50` (E-I-2), tie-break (i) (E-I-1), `α=0,01`, `nMin=100`, coupes `{2000e8, 100k$, 1M$}` sont des **rulings/constantes du code** établis.

---

## §5. Absorption U-4a-ii (décision 99) + POOL-RPC-1a en dépendance dure

Reliquat U-4a-ii = **A-5/A-6/A-7** (`ADR-U4:66,70`) + **items d'outil** (`ADR-U4:175-188`) :
1. **`meta.model` fail-closed** : le champ `model` est un **littéral** (`record.ts:319,353` `"claude-opus-4-8[1m]"` en dur, idem `u4-redraw.mjs:111`, `u4-probe.mjs`, `u4-oracle-path.mjs`) ⇒ non probant ; le rendre argument/env **fail-closed**. **U-4b-0.**
2. **`onRpcError`** : `u4-redraw.mjs:88` `makeDefaultCall()` sans sink ni retry ⇒ ajouter un sink par-opérateur (motif `record.ts:305` `errByOp`). **U-4b-0.**
3. **EBUSY append** : `record.ts` (append) — réessai borné EBUSY/EPERM (cause D-7). **U-4b-0.**
4. **12 e-mode non-cat-1** (`{2:7, 11:3, 19:1, 23:1}`, `ADR-U4:93-94`) : confirmer WETH ∈ catégorie via `emode_raw` **[C-14]** OU `non_evaluable` compté. **U-4b-1a/1b.**
5. **A-5 `calibration.ts`** (K entrées Mondrian), **A-6 `adapter-book.ts` `fromRealizedBook`** (ŷ appelant, `binding_broken` fail-closed), **A-7 `packages/hikae/src/liquidable-24h.ts`** (classe réelle, `NMIN 99→100`, docstring « no source exists » retirée). **U-4b-2.**

**[C-2] Pool = POOL-RPC-1a (`docs/G0-lot-pool-rpc-1.md` fait foi)** : U-4b **n'édite NI `rpc.ts:19-23` NI `rpc2.ts:250-251`**. POOL-RPC-1a livre : `ETH_CALL_PROVIDERS` = {drpc, mevblocker, nodies, **pocket**} (−blast, L-2) ; `GET_LOGS_PROVIDERS` = branche investisseur gatée par sonde L-5 (Q1) ; `record.ts:main --concordance-out` (L-4). **U-4b-1b dépend de la FUSION de POOL-RPC-1a** (déclencheur dur). Verdicts CONF-SRC-2 hérités : Blast/LlamaRPC NON ADMIS, Tenderly conservé, mevblocker exclu de la course (D-5), 1RPC hors campagne lourde, Chainstack 9ᵉ à clé (`CHAINSTACK_ETH_URL`, jamais imprimé).

**[C-3] distinctness par GROUPE d'opérateurs `{nodies, pocket} = 1`** : `providerOf` (`rpc.ts:28-36`) traite `nodies` et `pocket` comme **deux** domaines ⇒ `record.ts:299-301` (`distinct = new Set(map(providerOf)).size < 2`) et `rpc2.ts:quorum2:164-188` (`seen` sur `providerOf`) les compteraient comme deux fournisseurs indépendants. POOL-RPC-1a CA-2 déclare pocket **distinct de tout provider existant** — **la règle de GROUPE n'y est PAS**. ⇒ **item formé contre POOL-RPC-1a** (déclencheur : son checkpoint/amendement) : mapping de groupe `{nodies, pocket}→1` dans le test d'admission ET `record.ts:300-301`. **La sonde go/no-go de U-4b-1b asserte `distinct-par-groupe ≥ 2` par méthode, fail-closed** (ne suppose PAS que le code fusionné le porte). **[C-3/C-4/C-19]** la sonde écrit aussi : **part Chainstack projetée** (Σ appels payants / total), **plafond** (≤ quota restant − 200 000 Bell), **règle d'arrêt** (dépassement projeté ⇒ arrêt + consultation).

---

## §6. Budget d'appels chiffré et gardé — [C-4] compter les TENTATIVES, ledger persistant, rapprochement (HELIUS-1)

**Chainstack est PAYANT** ⇒ **règle HELIUS-1 VERBATIM** (`CHANTIERS.md:390`) : « tout appel PAYANT passe par le **garde de budget du dépôt avec ledger persistant** ; chaque course se termine par un **rapprochement avec le tableau de bord**, consigné ».

**[C-4] Défaut mesuré (= hypothèse H-B d'HELIUS-1)** : `makeBudgetedCall` (`record.ts:142-155`) incrémente `n += 1` **une fois par appel logique** (`:148`), en **enveloppant** `hardened` = `makeDefaultCall` dont la **boucle de retry est INTERNE** (`record.ts:87-97`, `fetch` `:92`, retry `:97`). ⇒ **un appel qui réessaie R fois consomme 1 unité de budget mais émet R+1 tentatives HTTP** — le budget **sous-compte** les tentatives (exactement le résidu HELIUS-1 : `throw BudgetExceeded` retiré / `Infinity` / ledger « reset-on-missing », `CHANTIERS.md:444`). De plus `byOperator/byMethod` (`record.ts:154`) sont **en mémoire seule** (aucune persistance cumulative).

**Livrable de garde de budget (U-4b-0)** :
- **Compter les TENTATIVES HTTP** : la primitive budgétée est consommée **DANS** la boucle de retry (chaque `fetch` de `makeDefaultCall` décrémente le budget), pas en enveloppe externe ⇒ `total()` = tentatives réelles. `BudgetExceededError` re-jeté **EN PREMIER** (motif `rpc2.ts:17-23,178,197`), jamais benché en `no_quorum`.
- **Ledger persistant cumulatif HORS dépôt, append-only, par méthode ET par opérateur, plafond GLOBAL fail-closed** : motif Bell `budget.json` + GARDE-HELIUS (`CHANTIERS.md:446`, cap **par méthode**) ; clés = `(method, operatorLabel)` (labels/domaines, jamais URL — `operatorLabel`, `record.ts:149`) ; **jamais reset-on-missing** (mutant dédié) ; plafond pré-enregistré **≤ 300 000** toutes méthodes **ET** ≤ (quota Chainstack restant lu au dashboard − 200 000 réservés Bell).
- **Critère de rapprochement pré-enregistré (unité RU vs requêtes = E-2)** : Chainstack facture en **RU** ; le ledger compte des **requêtes**. `record.ts:294` note déjà « RU/call undocumented, E-2 ». ⇒ rapprochement `Σ requêtes_par_méthode × coût_RU_par_méthode(modèle déclaré)` **vs** export dashboard (lecture orchestrateur), **tolérance et modèle de coût RU déclarés au prereg** ; GO conditionné à la lecture du dashboard AVANT, rapprochement APRÈS (condition GO HELIUS-1).
- **Tests + mutants** : `budget_counts_http_attempts` (R retries ⇒ budget = R+1) ; mutant **« budget enveloppe hardened (retries non comptés) ⇒ ROUGE »** ; mutant **« ledger reset-on-missing ⇒ ROUGE »** ; mutant **« cap non fail-closed-first ⇒ ROUGE »**.

**[C-19] Découverte comptée au budget** : les `getLogs(LiquidationCall)` de §2 (~centaines) sont **imputés au ledger et au plafond**, pas gratuits.

**Sonde AVANT la course (go/no-go, écrite au PLI avant tout appel par compte)** : (a) énumération `Transfer` aWETH ≈ 1 412 `getLogs`/opérateur ; (b) appels projetés `≈ N × (1 + k_coll + 2 + k_debt) × 2` ; (c) sonde getLogs large Pocket **L-5** (précondition de POOL-RPC-1a L-3 branche B) ; (d) **1 `eth_call` `s_cutoffTime()` @B_fresh sous garde** (E-I-7 = OUI) ; (e) **distinct-par-groupe ≥ 2/méthode [C-3]**, part Chainstack projetée, plafond, règle d'arrêt. **Discipline secret** : `archive-env`, jamais URL/clé ; **CGU lues avant tout appel d'API de données** (règle 2026-09-20).

---

## §7. Pré-enregistrement committé SEUL avant tout appel [C-12 : gel du code de score avant les données]

Motif U-4a (`PLAN-u4-prereg.md:2,30-34`, `ADR-U4:56`) : **`docs/PLAN-u4b-prereg.md` committé SEUL** (aucun code) **avant tout appel réseau** ; le script refuse de démarrer sans `--prereg-sha` == sha256 **LF** (garde `lfSha256`, `record.ts:158`). **Contenu du prereg** :
- §DISC (P-EPI en pseudo-code, §2) ; définitions (unité, Y, **ŷ close factor au premier franchissement p\* [C-1]**, **règle multi-réserves [C-7]**, cellule, score, α, nMin, coupes, **tolérance X [C-8]**, **LST/`lst_debt_at_p0` [C-8]**, **ancre pré-B₀ [C-8 entrée 7]**) ; H-0..H-7 avec critères de NON et **valeurs chiffrées [C-11]** ; plafonds/sonde/**rapprochement RU-vs-requêtes [C-4]** ; ordre.
- **[C-12] GEL par sha** : le prereg **fige le sha256 du code de score `u4b-scores` + `u4b-reduce` + `record-u4b-calib.mjs`** (livrés et **validés sur e2 en -1a, OFFLINE**, mutants verts) ⇒ le code qui produira les scores frais est **figé AVANT que la donnée fraîche existe** (anti « sélection sur l'issue » — le score-code ne peut être ajusté après avoir vu un q̂ flatteur).
- **[C-15] précondition** : lecture **[lu] Mondrian 2003** achevée (rapport lecteur) **avant** ce commit.

**Toute déviation = D-n déclarée au PLI, jamais absorbée** (P5).

---

## §8. Livrables (liste fermée par sous-lot ; test/oracle)

**U-4b-0 (aucun réseau)** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 0-1 | `record.ts` (budget) | **[C-4]** primitive budgétée DANS la boucle retry ⇒ compte les tentatives ; ledger persistant hors dépôt append-only `(method, operatorLabel)`, plafond global fail-closed, jamais reset-on-missing ; rapprochement RU-vs-requêtes (E-2) | `budget_counts_http_attempts`, `ledger_persists_and_fail_closes`, mutants (enveloppe hardened / reset-on-missing / cap non-first) ROUGES |
| 0-2 | `record.ts` + `u4-probe.mjs` + `u4-oracle-path.mjs` + `u4-redraw.mjs` | `meta.model` argument/env **fail-closed** | `meta_model_required_fail_closed` (littéral restauré ⇒ ROUGE) |
| 0-3 | `u4-redraw.mjs:88` | sink `onRpcError` par-opérateur | `redraw_error_sink_records_operator_fault` |
| 0-4 | `record.ts` (append) | réessai borné EBUSY/EPERM | `append_retries_bounded_on_ebusy` |
| — | (PAS de pool) | **[C-2]** `rpc.ts`/`rpc2.ts:250-251` = POOL-RPC-1a | — |

**U-4b-1a (OFFLINE, code gelé par sha [C-12])** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 1a-1 | `scripts/census/u4b/u4b-scores.mjs` (**neuf**) | ŷ **close factor au premier franchissement** [C-1] + multi-réserves [C-7] + `MustNotLeaveDust` OU + `dust_bounded` [C-13] + Mondrian ; **produit les lignes des DEUX cellules — A (éligibles∪liquidés) ET B (liquidés seuls) — sur e2, `calib_digest` PAR cellule** (le gel par sha précède la donnée ET l'escalade E-I-3 ; -2 décide seul ce qui est SERVI) | `u4b_scores_on_e2` (design set, 2 cellules) ; mutants (CF@p_min, close factor sans 3 conditions, bonus omis/emode-réserve [C-14], D_e ignoré, LT_W←0, dust AND, Σ-réserves) ROUGES |
| 1a-2 | `scripts/census/u4b/u4b-reduce.mjs` (**neuf, [C-17]**) | garde `liquidation_bonus_bps` réserve + bonus e-mode depuis `emode_raw` [C-14] ; **ne re-génère PAS la fixture e2** (`u4-reduce.mjs` + `U4-*-e2` intacts) | `u4b_reduce_keeps_bonus`, `u4_e2_fixtures_byte_identical` |
| 1a-3 | `scripts/record-u4b-calib.mjs` (**neuf, [C-9]**) | générateur `U4b-scores.jsonl` → entrées `calibration.ts` : échelle/arrondi **bigint→number**, **borne 2^53/strate fail-closed** | `u4b_registry_recomputes_from_scores_jsonl` (recompute depuis le fichier IN-REPO ; > 2^53 ⇒ throw) |

**U-4b-1b (réseau, sous garde ; dépend de la FUSION de POOL-RPC-1a)** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 1b-1 | `docs/PLAN-u4b-prereg.md` (committé SEUL) | §7, **sha du code -1a gelé**, précondition Mondrian 2003 [C-15] | garde `--prereg-sha` |
| 1b-2 | `scripts/census/u4b-discover.mjs` (neuf) | P-EPI §2 + sélection mécanique → `episode-selection.json` ; **découverte comptée au budget [C-19]** ; distinct-par-groupe [C-3] | `u4b_episode_selection_is_deterministic` |
| 1b-3 | labeling paramétré (réutilise `u3-realized.mjs` sans le figer sur e1/e2/e3) | Y_i frais | `u4b_labels_replay` ; mutant Y ⇒ ROUGE |
| 1b-4 | fixtures `apps/sentinel/test/fixtures/ukemi/u4b/**` + `PROVENANCE-u4b.md` | book, D_e (+ancre pré-B₀), `U4b-scores.jsonl`, inputs sha-pinnés (exclus R-25) | `series_pinned_are_declared_and_hashed` |

**U-4b-2 (chemin servi backend ; R-25 révisé [C-18], scission -2a/-2b si G1>1205)** :
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 2-1 | `apps/harness/src/calibration.ts` | K entrées `CommittedCalibration` Mondrian (α), garde digest à l'import (`:165-170`), provenance MEASURED (α, n, nMin, q̂, sha séries, K=2 caveat) | `calib_registry_digest_guard` |
| 2-2 | `apps/harness/src/tools/gate.ts` + `attestation-binding.ts` | dispatch classe (motif `:446-489`) + **`strateOf(yhat)` serveur, α/nMin imposés serveur [C-10]** ; honnêteté keyée présence-calib (`:500-510`) + **texte « un OUI de H-3 ne licencie rien de plus » [C-11]** ; **retrait `cascade-liquidable-24h`** | `u4b_gate_dispatch_committed_class`, `gate_abstains_uncommitted_key`, `strate_of_is_server_side` ; mutant sur-revendication ⇒ ROUGE |
| 2-3 | `packages/monark/src/adapter-book.ts` (A-6), `packages/hikae/src/liquidable-24h.ts` (A-7) | `fromRealizedBook` (`binding_broken` fail-closed) ; classe réelle | `adapter_from_realized_book_anti_vacuity`/`_fail_closed` ; grep « no source exists » = 0 |
| 2-4 | **retrait cascade [C-18]** (8 fichiers gatés) : `apps/harness/src/tools/cascade.ts`, `.../tools/gate.ts`, `.../attestation-binding.ts`, `apps/harness/test/cascade.test.ts`, `.../test/gate.test.ts`, `packages/ukemi/test/lattice.test.ts`, `scripts/verify-harness.mjs`, `skills/monark/SKILL.md` (+ re-pin `fixtures/h5-e2e-trace.json` & `PROVENANCE`, `apps/harness/README.md`, `test/skills.test.ts`) | classe synthétique disparaît ; `apps/site/lib/fleet.ts` = **9ᵉ, sous décision 101 (SITE, ungated)** | `no_cascade_class_in_harness` (grep=0 hors fixtures/site) |
| 2-5 | test d'intégration + trace h5 re-pinnée | **`u4b_gate_serves_region_from_real_artifact`** ; `record-h5-e2e-trace.mjs` re-pin + PROVENANCE | branchement prouvé bout en bout |

---

## §9. Critères d'acceptation, mutants, contrôle live indépendant

**Acceptation (par sous-lot)** : (1) `npm run ci` vert (base + nouveaux) ; `gate:vocab`, lint 0, ratchet, lang-gate 0, `export:check` 0, `series_pinned`, `no_secret_in_repo` verts. (2) mutants **≥ 10** rouges, restauration **sha-exacte** (PRE==POST, `git status` identique). (3) prereg committé **avant** le worker ; **sha du code -1a gelé DANS le prereg [C-12]** ; bruts hors dépôt ; sonde de coût + dashboard AVANT, plafond écrit, rapprochement APRÈS. (4) R-25 ≤ 1205/PR. (5) CA-11 : rien de nouveau `built` tant que `u4b_gate_serves_region_from_real_artifact` n'est pas vert ; site intact (décision 101). (6) jamais « probabilité de liquidation » ni « Λ=0 » ; abstentions en chiffres.

**Mutants (tueurs non tautologiques)** : (a) ŷ dette-totale ; (b) **CF/C_r/D_r à p_min au lieu de p\* [C-1]** ⇒ éligibilité/regime change (vérifié sur e2 en -1a) ; (c) close factor 50 % sans les 3 conditions ; (d) bonus `m` omis / e-mode pris sur réserve **[C-14]** ; (e) D_e ignoré (`hfMin←hf0`) ; (f) LT_W←0 ; (g) `MustNotLeaveDust` en AND au lieu de OU **[C-13]** ; (h) Σ-réserves au lieu de max **[C-7]** ; (i) strate mal bornée ; (j) `meta.model` littéral restauré ; (k) **budget enveloppe hardened (retries non comptés) / ledger reset-on-missing [C-4]** ; (l) **sur-revendication d'honnêteté [C-11]** ; (m) **scores > 2^53 acceptés silencieusement [C-9]**.

**Contrôle live indépendant — PLANIFIÉ DÈS LE DÉPART (mission G2, checkpoint-2 bis)** : la G2-delta (instance séparée, contexte frais) rejoue `u4-redraw.mjs` (re-tirage ≥ 3 comptes + ≥ 3 `AnswerUpdated`, graine dérivée de `book_digest`, `--max-calls ≤ 60` fail-closed, opérateurs excludables sans Blast/mevblocker, sink `onRpcError` de 0-3 actif) ; brut hors dépôt, `all_match`, cache inchangé.

---

## §10. Export public — tests/données « upcoming » exclus

`scripts/export-exclude-tests.json` (ADR-M004 D7 sexies) : y ajouter les tests U-4b lisant `scripts/census/**` non whitelisté ou le prereg exclu (motif `ukemi-u4-scores.test.ts`). Tant que la région n'est pas SERVIE, données/tests U-4b = `upcoming`. **Item porté du G7 U-4a (`CHANTIERS.md:396`)** : exclusion des données orphelines, nettoyage `PROVENANCE-u3.md:42`, extension `export:check` aux chemins `[A-Z]:\` — AVANT la prochaine publication. `scripts/export-exclude-tests.json` **compte** R-25.

---

## §11. Risques MAST

| Mode | Menace | Contre-mesure (mesurée) |
|---|---|---|
| **Sélection sur l'issue** | épisode / score-code choisi après un q̂ flatteur | P-EPI committée SEULE (§2, pseudo-code C-5) ; **code de score GELÉ par sha avant la donnée [C-12]** ; e2 = conception |
| **Fixture auto-enregistrée** | le test rejoue ce que le script a écrit | G2 fraîche ; mutants source (§9) ; fixtures byte-exact ; contrôle live re-tirage ; **`u4b_registry_recomputes_from_scores_jsonl` recompute in-repo [C-9]** |
| **Vérification incorrecte** | mutant non discriminant ; critère basculé | mutants changent une éligibilité RÉELLE ; **mutant CF@p_min non tautologique [C-1]** ; H-0..H-7 chiffrés |
| **Budget non attribué (HELIUS-1, H-B)** | retries non comptés, ledger volatil | **compter les tentatives + ledger persistant + cap par méthode fail-closed + rapprochement RU-vs-requêtes [C-4]** ; **découverte comptée [C-19]** |
| **Version de règle** | close factor v3.5.0 appliqué à v3.6.0 | H-1 (EIP-1967) ; **v3.6.0 2026-01-08 ⇒ `PR-U4-3-bis` de fait obligatoire [C-6]** |
| **Fuite de secret** | URL/clé dans un log/brut | `archive-env` ; `scrubUrls` (`record.ts:95`) ; ledger = labels seuls |
| **Perte d'information** | book/labels partiels présentés complets | `no_quorum` ⇒ abstention ; résidus `non_evaluable`/`dust_bounded`/`lst_debt_at_p0` comptés ; H-4 déclaré |
| **Terminaison prématurée** | lot clos sans chemin servi | `built` ssi test servi vert ; site `upcoming` ; G7 au seul orchestrateur |
| **Zone gelée touchée** | `AttestedBook`/`ukemi_sha` modifié | A-6 lie par `book_digest` ; re-pin h5 déclaré, diff vide vérifié G2 ; **e2 fixtures byte-identiques [C-17]** |

---

## §12. Décisions du checkpoint-1 (validateur) et questions investisseur

**Questions de conception du G0 d'origine — RENOMMÉES `Q-1..Q-7` (collision avec les C-n du validateur levée) et RÉSOLUES par les rulings** :
- **Q-1** (ex-C-1 du G0) task_class/predictor_id `ukemi:realized-v2@…/weth-mono/<episode>/s<k>` → **retenu** (superseded par [C-10]).
- **Q-2** (ex-C-2) voie strate↔registre → **α + `strateOf` serveur** ([C-10]).
- **Q-3** (ex-C-3) nMin/α imposés serveur → **oui** ([C-10]).
- **Q-4** (ex-C-4) coupes de strates aux frontières du code → **oui** ([C-11]).
- **Q-5** (ex-C-5) H-1 version → **v3.5.0 ∪ diff [lu]-neutre** ([C-6]).
- **Q-6** (ex-C-6) cascade→book retrait → **oui, 8 fichiers gatés + fleet.ts décision 101** ([C-18]).
- **Q-7** (ex-C-7) contrôle live nommé dès le départ → **oui** (§9).

**Rulings investisseur (checkpoint-1)** :
- **E-I-1 tie-break** → **(i) premier cluster WETH éligible chronologiquement** (moindre sélection). *Appliqué §2.*
- **E-I-2 `N_min`** → **50**. *Appliqué §2.*
- **E-I-4 `MustNotLeaveDust`** → **(b) ŷ inchangé + `dust_bounded` compté**. *Appliqué §3 [C-13].*
- **E-I-5 absorption A-5..A-7** → **CLOSE : ABSORBER** (le chemin servi §0 en dépend). *Appliqué §5.*
- **E-I-6 révision `rpc.ts`** → **CLOSE** : U-4b **ne touche NI `rpc.ts` NI `rpc2.ts:250-251`** (POOL-RPC-1a possède le pool, [C-2]). *Appliqué §5.*
- **E-I-7 `s_cutoffTime` courant** → **OUI** (1 `eth_call` @B_fresh dans la sonde sous garde). *Appliqué §6.*

**E-I-3 — ESCALADE INVESTISSEUR EN ATTENTE (les deux options écrites ; bloque la clôture du choix « une vs deux classes », pas le démarrage de -0/-1a)** :
> La décision **91** dit « **deux classes Mondrian** ». Le G0 recommandait de ne servir que la Classe A au release. Le validateur **ne peut pas reporter en silence** la 2ᵉ classe (CA-2). **Question** :
> - **(a) Servir la seule Classe A au release** (`liquidation-eligible-coverage`, Mondrian par taille) — minimal, honnête ; la Classe B (`given-liquidated`) devient un **item formé U-4c-adjacent** (K=2 ⇒ la plupart des strates B < nMin, `under_calib`). **Coût : moindre** (une famille de clés committées).
> - **(b) Servir A + B** (les deux classes Mondrian de la décision 91) — plus riche ; **+R-25**, **plus de strates `under_calib`**, **deux familles de clés + deux re-pins**. Fidèle au verbatim « les deux ».
>
> **Sans réponse** : -0 et -1a démarrent — **-1a produit les lignes des DEUX cellules (A : éligibles∪liquidés ; B : liquidés seuls) sur e2, `calib_digest` PAR cellule**, donc le **gel par sha précède la donnée ET l'escalade** (le code figé n'omet aucune cellule) ; **E-I-3 ne tranche que ce qui est SERVI en -2** (coupes/clés committées), à décider **avant le commit du prereg de -1b**.

**Procurement formé (règle Dettes)** : **PR-U4-4-a** (chapitre exact Mondrian, *Algorithmic Learning in a Random World* 2e éd., ISBN 978-3-031-06648-1 ; 4 tentatives documentées ; usage : citer le chapitre dans l'ADR-U4b ; substitut ouvert 2003 en lecture [lu] [C-15]) ; **PR-U4-3-bis** (`LiquidationLogic.sol` de l'impl effective si ≠ v3.5.0 — **de fait obligatoire**, [C-6]).

---

## §13. Table des plis C-1..C-20 → sections (correction → où pliée)

| C | Objet | Section(s) pliée(s) | Bloquante |
|---|---|---|---|
| **C-1** | ŷ au PREMIER FRANCHISSEMENT p\* (pas p_min) ; conditions/C_r/D_r à p\* ; mutant CF@p_min | §0 (tuyaux), §3, §7, §9(b) | oui |
| **C-2** | retirer le pool de U-4b-0 ; dépend de la FUSION POOL-RPC-1a ; n'édite ni `rpc.ts:19-23` ni `rpc2.ts:250-251` | §1(U-4b-0/1b), §5, §8, §12(E-I-6) | oui |
| **C-3** | distinctness par GROUPE `{nodies,pocket}=1` (admission + `record.ts:300-301`) ; Chainstack part/plafond/arrêt dans la sonde | §5, §6 | oui |
| **C-4** | budget compte les TENTATIVES ; ledger persistant hors dépôt append-only méthode+opérateur, cap global fail-closed ; rapprochement RU-vs-requêtes (E-2) ; tests+mutants | §1(U-4b-0), §6, §8(0-1), §9(k) | oui |
| **C-5** | partition des clusters en PSEUDO-CODE exact ; relaxation post-H-0-NON = D-n | §2 | oui |
| **C-6** | éligibilité version = v3.5.0 ∪ diff `LiquidationLogic.sol` [lu]-neutre AVANT ŷ ; plage/critère census A ; v3.6.0 2026-01-08 | §2, §11 | oui |
| **C-7** | règle multi-réserves de dette (max sur r_d, pas Σ) | §3, §7 | oui |
| **C-8** | entrées prereg 4 (LST `lst_debt_at_p0` + effet e2) et 7 (ancre pré-B₀) ; tolérance X mono-collatéral chiffrée | §0, §3, §4, §7 | oui |
| **C-9** | générateur `U4b-scores.jsonl`→`calibration.ts` (échelle bigint→number, borne 2^53/strate) + test non-LLM in-repo | §0, §1(1a-3), §8(1a-3/2-1) | oui |
| **C-10** | voie α + contrôle serveur `strateOf(yhat)` sinon β ; α/nMin imposés serveur | §0, §4, §8(2-2) | oui |
| **C-11** | valeurs chiffrées (k,H-4/H-5,X,N_min,tie-break,coupes) + texte « un OUI de H-3 ne licencie rien de plus » + mutant sur-revendication | §3, §4, §8(2-2) | oui |
| **C-12** | scission -1a OFFLINE (score sur e2, mutants, GEL par sha dans le prereg) / -1b RÉSEAU | §1, §7, §8, §11 | oui |
| **C-13** | `MustNotLeaveDust` en OU (pas AND) ; E-I-4(b) `dust_bounded` | §3 | oui |
| **C-14** | bonus e-mode depuis `emode_raw` (`u4-reduce.mjs:52`) + mutant | §3, §5(4), §8(1a-1/1a-2) | oui |
| **C-15** | lecture [lu] Mondrian 2003 avant le prereg (précondition, orchestrateur) | En-tête, §4, §7 | oui |
| **C-16** | ADR-U4b nommé avec table de tuyaux | §14 (ci-dessous) | non |
| **C-17** | réducteur `u4b-reduce` sous `u4b/` (ne pas re-générer la fixture e2) | §0, §1(1a), §8(1a-2) | non |
| **C-18** | lister les 9 fichiers `cascade-liquidable-24h` ; `fleet.ts` sous décision 101 ; R-25 de U-4b-2 révisé | §1, §8(2-4) | non |
| **C-19** | découverte comptée au budget | §2, §6 | non |
| **C-20** | en-tête/chemin corrigés | En-tête | non |

---

## §14. [C-16] ADR-U4b nommé + table de tuyaux (livrable A-8 du lot)

**ADR à créer** : `docs/adr/ADR-U4b-calibration-episode-frais.md` (statut « proposé au G0 → adopté au G1 », motif ADR-U4). Il porte : D1 cellule/étiquette (mono-collatéral WETH, X, LST) ; D2 ŷ close factor **au premier franchissement** (C-1/C-7/C-13/C-14) ; D3 score/α/nMin/Mondrian (C-10/C-11) ; D4 ordre pré-enregistré + **gel de sha** (C-12) ; D5 budget/ledger/rapprochement (C-4) ; MAST (§11) ; **table de tuyaux** :

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| score-code gelé | `u4b-scores`/`u4b-reduce`/`record-u4b-calib` (sha figé prereg) | `U4b-scores.jsonl` → `calibration.ts` | -1a `upcoming` (consommé par un test seul, offline e2 ; C-V-5) | `u4b_scores_on_e2`, `u4b_registry_recomputes_from_scores_jsonl` |
| épisode frais | `u4b-discover.mjs` (P-EPI, budget) | book/D_e/labels frais | -1b (dépend POOL-RPC-1a) | `u4b_episode_selection_is_deterministic` |
| région servie | `calibration.ts` K entrées + `strateOf` serveur | outil MCP `gate` → `GateDecision` | `built` ssi test servi vert | `u4b_gate_serves_region_from_real_artifact` |
| cascade retrait | 8 fichiers gatés + fleet.ts (déc.101) | classe synthétique disparue | -2 (fleet.ts au SITE) | `no_cascade_class_in_harness` |

---

### Provenance (règle de branchement — tuyaux déclarés de CE pli)
Entrée : G0 source `docs/G0-lot-u4b.md` + avis checkpoint-1 (persisté `F:\tmp\u4b\pli-cp1\CHECKPOINT1-lot-u4b.md`, reconstruit du brief + `CHANTIERS.md:448-449` — fichier d'avis 0 octet) + fichiers rouverts ce tour : `docs/G0-lot-pool-rpc-1.md`, `scripts/census/u4-reduce.mjs`, `apps/sentinel/src/ukemi/record.ts:79-97,142-155,276-409`, `apps/sentinel/src/ukemi/rpc2.ts:1-30,160-205`, `apps/sentinel/src/ukemi/abi.ts:129-184`, `apps/harness/src/calibration.ts:160-209`, `apps/harness/src/tools/gate.ts:440-510`, `docs/adr/ADR-U4-book-et-calibration.md:30-118`, `scripts/census/u3-realized.mjs:1-60`, `docs/CHECKPOINT1-lot-u4.md`, `docs/CHANTIERS.md:440-449`, grep `cascade-liquidable-24h`. Sortie : ce G0 plié (`F:\tmp\u4b\pli-cp1\G0-lot-u4b.md`), consommé par l'orchestrateur (verdict) puis les worktrees U-4b-0/1a/1b/2. État : plan (aucun code, aucun réseau). Réviseur : orchestrateur `claude-fable-5-1` (R-21). Modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-21.

## Notes de l'orchestrateur après le pli (2026-09-21)
- **C-15 SATISFAITE** : lecture [lu] intégrale de Vovk, Lindsay, Nouretdinov, Gammerman, « Mondrian Confidence Machine », OCM Working Paper #4, 2003-03-28, 24 p. (`http://alrw.net/old/04.pdf`), lecteur `claude-sonnet-5`. Retenu pour le prereg : garantie de validité par catégorie exacte, non asymptotique, par essai (Th. 1 p. 6), sous échangeabilité intra-catégorie ; **aucune taille minimale** (Cor. 1 exige seulement Num→∞) ; taxonomie « attribute-conditional » (§4.4 p. 9) = strates sur x (taille de ŷ), pas sur l'étiquette — **κ doit être fixée A PRIORI** (p. 3) ⇒ coupes de strates figées avant les données (déjà C-11/C-12) ; le papier traite des régions = ensembles de labels discrets, pas d'intervalle continu [0, q̂] (not_found) ⇒ la forme intervalle est justifiée par la lecture split-conformal du corpus (`docs/biblio/ukemi-modeL/L-lecture-tibshirani2019-barber2023.md`), à citer dans l'ADR-U4b ; PR-U4-4-a (chapitre du livre 2022) reste formé.
- **Ordre de fusion** : POOL-RPC-1a fusionne AVANT U-4b-0 ; U-4b-0 rebase sur `record.ts:main`.
- **E-I-3** : ESCALADE INVESTISSEUR EN ATTENTE (les deux options écrites) ; -0 et -1a peuvent démarrer ; le prereg de -1b attend la réponse.

- **Note orchestrateur (checkpoint-2 POOL-RPC-1a, C-6)** : la commande de course de U-4b-1b DOIT passer `--concordance-out <chemin hors dépôt>` (couture `runRecorder` de POOL-RPC-1a) — c'est le déclencheur réel du producteur de concordance (décision 100, pas 2) ; à écrire dans le prereg de -1b.
