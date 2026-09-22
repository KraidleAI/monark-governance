# PLAN-u4b-prereg — Pré-enregistrement U-4b-1b : calibration conforme sur épisode FRAIS (ŷ close factor v3.5.0 au premier franchissement, deux cellules Mondrian, gel du code de score AVANT les données)

> **Cible de commit** (par l'orchestrateur, SEUL — R-20) : `docs/PLAN-u4b-prereg.md`, committé **SEUL** (aucun code, exclu R-25) **avant tout appel réseau**, à la minute où le lot **U-4b-1b-0** (« outillage de course », décision 128) est **fusionné** — ce fichier est aligné sur ses outils RÉELS.
> **Anti « post-hoc » — mécanisme par CODE (lot U-4b-1b-0, décision 128 Q-A) + ceinture procédurale.** Le recorder **lie la course à CE fichier par code** : `--prereg-file docs/PLAN-u4b-prereg.md` (défaut, `parseUkemiArgs:172`) + un `--prereg-sha` fourni est **refusé s'il diffère du sha256 LF de `--prereg-file`** (`record.ts:268-271`) ; fichier absent = **refus NOMMÉ** (`:269`), jamais un ENOENT nu. **Portée exacte (ruling orchestrateur 2026-09-22 04:4x UTC, CHANTIERS ; tenu « à la lettre par code » — FUSIONNÉ dans -1b-0 `5d58a8a`)** : les corrections de pli du lot U-4b-1b-0 rendent `--prereg-sha` ET `--labeler-sha` **OBLIGATOIRES par code dès que `--prereg-file` (défaut `docs/PLAN-u4b-prereg.md`) EXISTE sur disque** (leur omission est refusée) ; l'usage générique hors U-4b (U-1/susde) passe `--no-prereg-binding` explicite (écrit dans la provenance) ; **le prereg -1b INTERDIT `--no-prereg-binding` pour la course weth**. Comme ce prereg committé fait EXISTER le fichier, les DEUX clauses de D4 (« == sha de CE fichier » ET « refuse **sans** `--prereg-sha` ») sont **VRAIES par code** pour la course weth (mutant « flags absents acceptés » ROUGE). La **ceinture procédurale** (l'orchestrateur passe toujours les flags) DOUBLE le code en défense-en-profondeur : (i) ce fichier committé SEUL ; (ii) **recompute des 9 sha (§2) depuis les blobs HEAD par l'orchestrateur AVANT `u4b-reduce`/`u4b-scores`** ; (iii) sha LF de ce fichier + `labeler-sha` + **HEAD du commit du prereg** écrits par l'orchestrateur dans la sonde go/no-go **ET un fichier SIDECAR daté**. **Où vivent les marqueurs (corrigé vs candidat, mesuré blob HEAD arbre fusionné)** : le recorder **écrit lui-même** `prereg_sha` / `prereg_file` / `labeler_sha` dans la **provenance du brut** (`record.ts:403` filter-only, `:432` book) et dans le diag (`:466-467`) — aucune injection de l'orchestrateur dans le brut du recorder n'est requise ni faite. Le **SIDECAR daté** reste utile pour lier le **brut de DÉCOUVERTE** (`u4b-discover.mjs` écrit une provenance SANS ces marqueurs, `u4b-discover.mjs:98-104`) à (`prereg_sha`, `labeler_sha`, HEAD), et pour le `book_digest` du recorder.
> **Provenance de la rédaction** : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22 — **passe de RÉ-ALIGNEMENT post-labeler (QF-2 tranchée α)**. Base LECTURE SEULE : clone `--no-hardlinks` de `F:\Monark` `lot/etude-suite` (`fef167d`) **fusionné avec `lot/u4b-1b-1` (@ `298e04a`, fusion -1b-1 sans conflit)** = l'arbre que la course verra après le G7 du labeler ; **HEAD réel au commit du prereg : `lot/etude-suite` @ `fef167d` (substitué par l'orchestrateur, R-20)**. `record.ts` / `u4b-discover.mjs` / `liquidation-logs.mjs` **FUSIONNÉS** via **U-4b-1b-0 `5d58a8a`** (G7 `ee51e56`, checkpoint-2 ACCEPTE-AVEC-CORRECTIONS `5c97c34`) ; `packages/rpc-guard/bin/rpc-guard.mjs` **FUSIONNÉ** (GARDE-HELIUS-1b-0, `6a639e8`) ; **labeler paramétré FUSIONNÉ** via la fusion -1b-1 (G2 PASS-AVEC-CORRECTIONS `docs/G2-lot-u4b-1b-1.md`, checkpoint-2 ACCEPTE-AVEC-CORRECTIONS). Ce fichier réalise **C-4 (« prereg draft realignment »)** + la mise en cohérence -1b-1 (QF-2, décision 129, floor lu sur place). Les 9 fichiers gelés recomputés à l'arbre fusionné (§2, reproductible). Aucun réseau, aucun commit, aucun workflow. Réviseur = orchestrateur (vérification adversariale R-21).
> **Rulings orchestrateur appliqués** (Q1–Q11 + QF-1/QF-2) : voir l'**Annexe A (datée)**. Décisions investisseur/orchestrateur appliquées : 91, 108, 110, 111, 113, 115, 118, 119, 121, 122, 123, 126, **128, 129** — voir Annexe A.
> **Périmètre (ruling Q1)** : 8 sections de fond **+** §DISC (P-EPI), définitions, H-0..H-7 chiffrées, sonde go/no-go — G0 §7 [C-12] (sinon le prereg ne fige pas la règle de sélection de l'épisode).
> **Note de gel D4 (régime B / AM-1)** : les sha du §2 sont **recomputés à l'identique au commit réel** depuis les blobs HEAD (`git show HEAD:… | tr -d '\r' | sha256sum`), jamais depuis `git status`. Toute divergence au commit = ÉCART = STOP. Les **8 fichiers gelés (hors labeler)** ne sont touchés ni par U-4b-1b-0 ni par la fusion -1b-1 (preuve byte-identique, §2) ; le **labeler `u3-realized.mjs` est re-gelé par -1b-1** (`cb020425…`, §2, QF-2 α). Leur sha à l'arbre fusionné (base `fef167d` + fusion -1b-1 `298e04a`) = leur sha au commit du prereg (l'orchestrateur substitue le HEAD réel du commit).

---

## (1) Objet et régime (D4)

**Objet.** Figer AVANT tout appel : (i) la règle mécanique de découverte de l'épisode FRAIS (P-EPI, §DISC) ; (ii) toutes les définitions et choix de méthode à effet mesuré (liste fermée C-V-7, §3) ; (iii) la **convention d'étiquetage Y et son gel (déféré puis LEVÉ par la fusion -1b-1, QF-2 α)** (ruling Q11, §Y) ; (iv) H-0..H-7 avec critères de NON ; (v) le protocole de budget/rapprochement Chainstack sous garde (A-4 + décision 121, §4-§Sonde) ; (vi) le **GEL par sha du code de score et de sa fermeture transitive** (§2) ; (vii) les **lignes de commande FIGÉES** de la course et du hors-ligne (§5). Objectif anti « sélection sur l'issue » : le code qui produira les scores frais (ŷ) ET la convention qui produira Y sont figés AVANT que la donnée fraîche existe ; ni le score-code ni le labeler ne peuvent être ajustés après avoir vu un q̂ flatteur.

**Régime (D4, régime B, ADR-C01 amendement cadence 2026-09-21).** Prereg committé SEUL ; preuve d'intégrité = **blobs HEAD** (AM-1). U-4b-0 (« consommer `@monark/rpc-guard` ») est **SUBSUMÉ par GARDE-HELIUS-2** (ADR-U4b D5) : le discover/calib consomme le recorder GARDÉ, aucun second compteur de budget. **État de livraison à l'arbre fusionné (mesuré, merges) : GARDE-HELIUS-2a `e98b54f`, 2b-i `8ba2cbc`, 2b-ii `5394dfe`, 2b-iii `985fed9`, GARDE-HELIUS-1b-0 `6a639e8`, U-4b-1b-0 `5d58a8a` (G7 `ee51e56`), U-4b-SCORE-1 `6652ed0`, U-4b-2a `88b20d2`, labeler paramétré (fusion -1b-1 `298e04a`) — TOUS FUSIONNÉS.** Le recorder GARDÉ (`record.ts`) est final ; ses arguments sont fixés sur le code fusionné + les **flags ajoutés par U-4b-1b-0** (`--prereg-file`/`--prereg-sha` lié à CE prereg, `--labeler-sha`, diag durable ; §5a), lot committé SEUL avant ce prereg. **`bin/rpc-guard.mjs` (1b-0) est le POINT D'ENTRÉE SERVI du `reconcile`** (§5c, Q-E RÉSOLU). Les scripts payants `u4-*` sont sous garde (2b-iii) ; `u4-probe.mjs` a été **supprimé** (`d311809`). Amendements ADR-U4b EN LIGNE : 2026-09-21 (C-7 : `rpc.ts` au gel D4, U-4b-0 subsumé en D5, NARABI-OPS-1d, plafond par compte) ; 2026-09-22 (décision 126 : score unilatéral, re-gel du sha #1, région servie = borne haute) ; 2026-09-22 (U-4b-2a). **À INSÉRER par l'orchestrateur (R-20)** : (a) l'amendement daté **2026-09-22 (décision 128) de D4** (les DEUX clauses « == sha de CE fichier » ET « refuse sans le flag » VRAIES par code, ruling 04:4x ; texte joint `ADR-U4b-amendement-D4-128.md`) ; (b) l'**amendement QF-2** (re-gel du labeler au blob effectif `cb020425…`, gel déféré LEVÉ ; texte joint `ADR-amendement-labeler.md` portant le tableau AVANT/APRÈS) ; (c) l'**amendement décision 129** (le rapprochement Chainstack est une GATE SÉPARÉE de comptabilité, PAS une condition de clôture de course — §5c/§4/§6/§7).

**Préconditions dures du commit** (récap §7, chacune un item formé à déclencheur) : GARDE-HELIUS-2b-ii + 2b-iii fusionnés (**SATISFAIT**, `5394dfe` / `985fed9`) ; **lot U-4b-1b-0 FUSIONNÉ `5d58a8a`** (apporte `--prereg-file`/`--labeler-sha`/diag/`u4b-discover.mjs`) **ET labeler paramétré FUSIONNÉ (fusion -1b-1 `298e04a`, QF-2 α)** ⇒ condition « committable SEUL » **SATISFAITE** ; C-15 (Mondrian 2003 [lu]) satisfaite ; `PR-U4-3-bis` si l'impl de l'épisode découvert ≠ v3.5.0 (H-1) ; **paramétrage du prober D_e** (§DISC, Q-D — précondition de COURSE, non du commit). Condition (i-a) **mesurée NON déclenchée** (réducteur pur byte-identique `1c7574ac…`, §Y) ⇒ pas de 9ᵉ sha gelé.

---

## §DISC — Règle de sélection de l'épisode FRAIS, PRÉ-ENREGISTRÉE (G0 §2, [C-5]/[C-6])

Contrainte de fond (mesurée, `scripts/census/u3-realized.mjs:7-9` (commentaire des trois événements) et `:74-78` (`EVENTS`, désormais DÉFAUTS de la section live paramétrée -1b-1)) : le census A n'a observé que trois clusters (e1 sUSDe, **e2 WETH = CONCEPTION**, e3 sUSDe) ; seul e2 est WETH-collatéral (`clusterLo=23545088, clusterHi=23557060`, `:76`). U-4b **découvre** un nouveau cluster WETH (~280 k appels, décision 91). Règle fixée avant tout appel :

```
# Entrées : B_lo, B_hi_rule, e2_window=[23545088,23557060], N_min (=50, ruling E-I-2)
B_lo        = 22803459                      # bascule feed WETH → proxy SVR 0x5424384b… (PR-U4-1:41,45) : sémantique D_e == e2
B_hi        = finalized - 64                # RÈGLE : finalized lu à l'exécution, horodaté dans le brut de découverte
logs        = getLogs(Pool, [LIQ_TOPIC], B_lo, B_hi)      quorum-2   # LIQ_TOPIC = u3-realized.mjs:53 — COMPTÉ AU BUDGET [C-19]
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

**Outil de la passe getLogs LiquidationCall : FIGÉ par le lot U-4b-1b-0 (Q-D — TÉMOIN, pas sélection).** `scripts/census/u4b/u4b-discover.mjs` (décision 128 Q-D ; §5b) est un **TÉMOIN keyless-only GARDÉ** : il exécute **§DISC:30** (`getLogs(Pool,[LIQ_TOPIC],from,to)` quorum-2 keyless via `@monark/rpc-guard`, [C-19]) + décodage + **§DISC:34-40** (clustering WETH par la règle de fenêtre D2, via la fonction PURE exportée `clusterWethLiquidations` de `scripts/census/u4b/liquidation-logs.mjs`). **Précision (checkpoint-2 C-3(c))** : `clusterWethLiquidations` implémente la règle GLOUTONNE de **§DISC** (U-3 D2) — le **labeler** (`u3-realized.mjs`), lui, applique la fenêtre à des bornes `clusterLo/clusterHi` **fournies par `--events`** (l'épisode frais ; défauts = e2/e1/e3, `:74-78`) et ne clusterise PAS ; le commentaire `liquidation-logs.mjs:58` (« VERBATIM … labeler :439-447 ») surclaime et est corrigé au pli du lot (édite le `.mjs`, hors des 9 gelés). Il **N'IMPLÉMENTE PAS** : **§DISC:31** (exclusion de la fenêtre e2 `[23545088,23557060]` — la plage `[B_lo, finalized-64]` de §5b l'INCLUT), **:42-46** (éligibilité WETH ∧ fenêtre complète ∧ `N_min=50` ∧ `version_ok`), **:49** (`argmin B_first`). Ces lignes = **RÈGLE pré-enregistrée**, appliquée par le **réducteur de SÉLECTION d'épisode AVAL** (tuyau ADR `u4b_episode_selection_is_deterministic`, `episode-selection.json` reproductible depuis `(prereg_sha, brut)`), qui re-exécute `clusterWethLiquidations` **sur l'ensemble e2-EXCLU** — le clustering AUTORITATIF. **Conséquence pré-enregistrée** : le champ `clusters` du brut de discover (calculé SANS exclusion e2, `u4b-discover.mjs:94`) est un **TÉMOIN CONSULTATIF** ; il ne sélectionne pas l'épisode. Le réducteur de sélection est un **item formé, propriétaire orchestrateur, déclencheur « avant la course »** (§7). Le paramétrage du prober D_e `u4-oracle-path.mjs` (feed frais ; `B0/BLAST/PROXY` e2 en dur, `:33,:36`) est l'autre moitié de Q-D (précondition de course, §7).

---

## Définitions pré-enregistrées (ADR-U4b D1/D2/D3)

- **Unité** = compte **mono-collatéral WETH** à B₀ : `collat_non_WETH_base(p0)/total_collateral_base(p0) ≤ X`, **X = 0** (lecture stricte, décision 91). e-mode hors {0,1} ⇒ fail-closed. LST = catégorie e-mode 1 ∧ ≠ WETH (rsETH hors) ; dette LST tenue à p0 (`lst_debt_at_p0`). Ancre pré-B₀ = `AnswerUpdated ≤ B₀` réel.
- **ŷ** (ADR-U4b D2, règle v3.5.0 [lu] `PR-U4-3`, tag `6138e1fda…`) = **maximum liquidable en UN appel au PREMIER FRANCHISSEMENT p\*** : `ŷ = max_r min(CF(HF), C_r/m_r)` (multi-dettes = **max**, jamais Σ), `CF_base = min(D_r, 0,5·D_tot)` si `C_r ≥ 2000e8 ET D_r ≥ 2000e8 ET HF(p*) > 0,95e18` (strict) sinon `D_r` ; `CA = floor(C·1e4/bonus)` ; `MustNotLeaveDust` en **OU** ; `m` (bonus) lu de la **réserve** / de `emode_raw` (C-14), **non figé par le prereg** — valeurs mesurées sur e2 : 10 100 (e-mode) / 10 500. Convention **`D_tot(p*) = total_debt_base − vWETH@p0 + vWETH@p*`** (agrégat on-chain autoritaire, ADR-U1 C-2). Score/ŷ en **devise de base 8-dec**, convention floor partagée avec `toBase` de Y. (Code mesuré, fichier gelé : `u4b-scores.mjs:89-90` réserve WETH requise ; `:113` throw `deficit_base_no_price` hors USDT.)
- **Score, α, nMin, Mondrian** (ADR-U4b D3, amendement 2026-09-22 décision 126) : `s = max(Y − ŷ, 0)` (**exceedance UNILATÉRALE**, base 8-dec, clipée à 0 ; ligne mesurée `u4b-scores.mjs:245` : `const score = Y > yhat ? Y - yhat : 0n;`), tri canonique ; `q̂` = p-ᵉ plus petit, `p = ⌈(n+1)(1−α)⌉`, **α = 0,01**, **nMin = 100** par strate (Dunn 2022 Thm 11 strict) ; strates de la classe A par taille de ŷ aux frontières **du code** (`STRATA_CUTS`, `u4b-scores.mjs:54`) : `< 2000e8`, `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$`. **Région servie = borne haute `[0, ŷ + q̂_k]`, jamais un intervalle** (décision 126 ; texte servi « upper bound » ; le champ de fil `region.kind` reste le littéral `"interval"` du contrat gelé `CoverageVerdict` — `packages/contracts/src/types.ts:207`, `schemas/coverage-verdict.schema.json` — la borne haute est une FORME, `lo = 0` par construction, pas un nouveau `kind`). En **couverture**, jamais en probabilité (vocabulaire gaté). Précondition C-15 (Mondrian 2003 [lu], κ fixée A PRIORI) satisfaite.
- **Classes** : **A** `liquidation-eligible-coverage` = {ŷ > 0 sous D_e} ∪ {liquidés} — **la seule SERVIE** (décision 108) ; **B** `liquidation-realized-given-liquidated` = liquidés — **calculée hors ligne, JAMAIS servie**. Le code gelé émet les DEUX cellules sur toute donnée (`u4b-scores.mjs:248-274`) ; -2 décide seul ce qui est servi. **E-I-3 close par la décision 108** (ruling Q8).

---

## §Y — Convention d'étiquetage Y, gel (déféré puis LEVÉ par -1b-1, QF-2 α) et règle d'abstention (ruling Q11 : option (ii))

**Convention de Y = ADR-U3 D1/D2 (adoptée le 2026-09-20, ANTÉRIEURE à toute donnée -1b), VERBATIM `docs/adr/ADR-U3-realized-labels.md:22-33`** :
> **D1 — Étiquettes réelles.** Y_{i,e} est **mesurée on-chain**, par position `(user, debtAsset, collateralAsset)`, agrégée sur la fenêtre 24 h, décomposée : `repayment_base = Σ floor(debtToCover × getAssetPrice(debt)@bloc / 10^dec)` ; `seized_base = Σ floor(liquidatedCollateralAmount × getAssetPrice(coll)@bloc / 10^dec)` (frais protocole exclu) ; `deficit_base` = Σ `DeficitCreated(user, debtAsset, amount)` de la fenêtre joints par `(user, debtAsset)` (toute tx ; D-5). Montants base en `BASE_CURRENCY_UNIT()` (8 déc., **lu on-chain**, jamais codé). Sommes natives conservées. **Prix au bloc du log**, jamais un prix moyen (résidu `price_moved_in_block` si l'oracle a bougé dans le bloc).
> **D2 — Fenêtre ancrée bloc, jamais horodatée.** `B_first` = premier `LiquidationCall` du cluster (A-rawlogs, déterministe) ; `B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`apps/sentinel/src/windows.ts`, ts de bloc en quorum-2). Lignes de bloc > B_last comptées en résidu `outside_window` (e2 : 29). Le cluster e2 = collatéral WETH, bloc ∈ [23545088, 23557060] (M-2b, sha-pinné). *(clause e2 = jeu de conception ; l'épisode frais applique la même RÈGLE avec ses propres `B_first`/`B_last`.)*

**Règle d'agrégation servie** : `Y = Σ_user (repayment_base + deficit_base)` + complétion USDT — **déjà GELÉE** dans `u4b-scores.mjs:103-121` (sha `2f9a31f6…`, re-gel décision 126 ; logique d'agrégation inchangée). `toBase` de Y = **floorDiv** (mesuré blob arbre fusionné, `u3-realized.mjs:102` `floorDiv`, `:104-105` `toBase = floorDiv(BigInt(amount)·BigInt(price), 10n**BigInt(dec))`).

**Gel du labeler LEVÉ par -1b-1 (QF-2 α) — le blob effectif de la course est gelé par le §2, avant que la donnée fraîche existe (propre)** :
- **Paramétrage -1b RÉALISÉ (fusion -1b-1, mesuré).** Au blob pré-lot, `u3-realized.mjs` ne pouvait pas étiqueter l'épisode frais tel quel (`EVENTS`, `RAWLOGS_SHA`, chemin prereg codés e2/e1/e3 en dur). La fusion -1b-1 a **paramétré la SECTION LIVE** (`:271+` : `--events`/`--rawlogs`/`--rawlogs-sha`/`--prereg-file`/`--operators`/`--episode-tag`/`--out`/`--raws-dir` ; défauts = valeurs e2 : `EVENTS :74-78`, `RAWLOGS_SHA :44`, prereg défaut `docs/PLAN-u3-prereg.md :416`) SANS toucher le **réducteur PUR** (`:83-270`). **Condition de bascule (i-a) : mesurée NON déclenchée** — tranche `sed -n '/^\/\/ PURE REDUCER (exported/,/^\/\/ LIVE PULL (run-guarded/p' | tr -d '\r' | sha256sum` = **`1c7574acd325ab75e6760f50d6743e3d9d39cd5565abbf3d497d4884317a6ada`** sur le blob fusionné (== `git show a56e739:` , RENDU-PLI §3) ⇒ **PAS de 9ᵉ sha gelé**.
- **`labeler-sha` (FLAG RÉEL du recorder, lot U-4b-1b-0 Q-B)** = sha256 **LF** du blob de `scripts/census/u3-realized.mjs`. **QF-2 TRANCHÉE (α, décision orchestrateur, CHANTIERS)** : le lot de paramétrage -1b du labeler **FUSIONNE AVANT le commit du prereg** (fusion -1b-1 `298e04a`) ⇒ le **§2 pinne la valeur effective de la course `cb020425…`** et **le blob que la course lie EST gelé par le prereg committé** (le gel a lieu avant que la donnée fraîche existe — propre). `--labeler-sha` est **OBLIGATOIRE par code** dès que le prereg existe (`record.ts:267`) et **vérifié contre le blob effectif** (`record.ts:276-280`) ; l'orchestrateur écrit **AUSSI** `cb020425…` dans la sonde go/no-go. `record.ts` la persiste dans la provenance du brut (`:403`/`:432`) et le diag (`:467`). Changement postérieur au commit = **D-n**, labels re-dérivés = post-hoc non servables (**ÉCART = STOP**).
> **(β) écartée** : committer le prereg à la seule fusion -1b-0 (labeler non encore paramétré) aurait laissé le gel du labeler à la **sonde seule**, le blob changeant entre commit et course ; QF-2 a choisi **(α)** — le §2 committé gèle le blob effectif `cb020425…`. C'était la seule décision que l'orchestrateur devait ce fichier : **tranchée**.
- **Invariant behavioural (mesuré, fusion -1b-1)** : `u4b_labels_replay` (le réducteur paramétré reproduit e2 byte-identique depuis `U3-inputs.jsonl`) ET **`u4b_labels_replay_via_main_real_artifact` (C-1, CA-11 durci)** — le VRAI `main()` rejoué sur le brut A-rawlogs réel + copie du raws pinné produit `U3-realized.jsonl` LF **`b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923`** (pin `PROVENANCE-u3.md:10`, ruling Q11 ; 2 fetch `finalized`, tout le reste cache-hit). SKIP NOMMÉ hors CI si les bruts hors dépôt sont absents (RENDU-PLI §4).

**Règle d'abstention PRÉ-ENREGISTRÉE (VERBATIM avis advisor-defi §Q11 l.44, le point clé anti-« rustine labeler »)** :
> « ligne de label abstenue (`no_quorum`, `repayment_base: null`) ou `deficit_base_no_price` sur un actif ≠ USDT ⇒ **re-tirage sous budget jusqu'au quorum** ; sinon **STOP + D-n** ; **jamais d'exclusion silencieuse d'un compte liquidé de la cellule A** ; le code gelé jette, et c'est voulu. »
Les deux chemins fail-closed qui jettent (avis §Q11 l.23 ; **mesurés blob arbre fusionné**) : `u3-realized.mjs:226` (`repayment_base: abstain ? null : repayBase.toString()`) et `u4b-scores.mjs:113` (`throw … deficit_base_no_price on non-USDT asset … (fail-closed)`). Compteur `labels_no_quorum` au census. **Portée** : la convention de Y est fixe pour la **vie de la calibration servie** (la région servie est jugée contre un Y futur étiqueté par la même convention), pas seulement jusqu'à la course (Barber-Candès-Ramdas-Tibshirani 2023 **[lu par advisor-defi sur texte local `_txt/`, avis §Q11 l.26]** : la fonction raw→Y fait partie de la fonction de non-conformité S, qui doit être pré-fixée et indépendante du jeu de calibration).

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

Méthode (régime B) : `git -C <arbre fusionné> show HEAD:<path> | tr -d '\r' | sha256sum` — arbre fusionné = `lot/etude-suite` @ `fef167d` (U-4b-1b-1 fusionné à `506db2d`, G7 `761839f` ; blobs recomputés à l'identique par l'orchestrateur sur ce HEAD, 9/9 concordants). Recomputé au commit réel (D4) ; **ÉCART = STOP**. Recompute complet + comparaison ligne à ligne dans `CHECK.md`.

| # | Fichier | sha256 LF recomputé (arbre fusionné, cf. supra) | Référence ADR | Verdict |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` (**re-gelé décision 126** ; était `9ad20666…f83feacf`) | **ADR-U4b amendement 2026-09-22 (décision 126) §3** (`ADR:194-214`) `2f9a31f6…f51445c0` | **CONCORDANCE (re-gel)** |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | ADR-U4b D4 / amendement (déc.126) §3 | **CONCORDANCE** |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | ADR-U4b D4 / amendement (déc.126) §3 | **CONCORDANCE** |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | ADR-U4b D4/C-V-2 (`7bee76fc…`) | **CONCORDANCE (préfixe)** |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | ADR-U4b D4/C-V-2 (`3376eb08…`) | **CONCORDANCE (préfixe)** |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | ADR-U4b D4/C-V-2 (`9206df91…`) | **CONCORDANCE (préfixe)** |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | **ADR-U4b amendement 2026-09-21 §1 (complet)** `0e232519…c1c65ca0` | **CONCORDANCE** (ruling Q2) |
| 8 | `packages/contracts/src/calib-digest.ts` (`contracts_frozen`) | `3603265d0a1f1a4e3e1a1d57b4b568fcadf4f6861351c2ca49b38dc794c42380` | ADR-U4b amendement (déc.126) §3 (`3603265d…94c42380`) | **CONCORDANCE (déjà `contracts_frozen`)** |
| 9 | `scripts/census/u3-realized.mjs` (**labeler, re-gelé QF-2 α**) | `cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af` | **ADR-U4b amendement QF-2** (re-gel labeler, gel déféré LEVÉ) `cb020425…a205b41a1af` | **CONCORDANCE (re-gel QF-2)** — *blob effectif de la course, gelé par le §2 ; vérifié par `--labeler-sha` (record.ts:267 obligatoire, :276-280)* |

**Bilan : les 8 sha gelés + le labeler (sha #9, re-gelé QF-2 α) concordent (ligne à ligne) avec les références ADR — sha #1 vs l'amendement daté 2026-09-22 (décision 126) §3, sha #7 vs l'amendement 2026-09-21 §1, sha #9 (labeler) vs l'amendement QF-2, les autres vs D4/C-V-2 et l'amendement (déc.126) §3. AUCUN ÉCART. PAS DE STOP.** (Recompute reproduit sous `env -u …` dans `CHECK.md` ; valeurs complètes mesurées à l'arbre fusionné, cf. RENDU.)

> **Note décision 126 (2026-09-22, lot U-4b-SCORE-1, fusion `6652ed0`)** : le sha #1 `u4b-scores.mjs` est **re-gelé** `9ad20666…` → `2f9a31f6…` (score unilatéral `max(Y − ŷ, 0)`) ; les 6 autres gelés + le labeler + `calib-digest.ts` restent **inchangés** *à ce lot SCORE-1* (le labeler est **re-gelé ensuite par QF-2, fusion -1b-1** — sha #9 ci-dessus ; tableau AVANT/APRÈS SCORE-1 : `ADR-U4b` amendement 2026-09-22 (décision 126) §3, `ADR:197-207`). Cette table est **recomputée au commit réel du prereg** (régime B, blobs HEAD) ; toute divergence = ÉCART = STOP. La seule édition de code du lot SCORE-1 : la ligne `u4b-scores.mjs:245` (avant l'insertion du commentaire : `:244`) + commentaire `:29-30`.

**Fermeture transitive (mesurée, `CHECK.md`)** : sur `apps/**/src` + `packages/**/src`, hors builtins `node:*` et `@monark/contracts` (= `calib-digest.ts`, `contracts_frozen`, gelé sha #8), le jeu gelé {u4b-scores, u4b-reduce, record-u4b-calib, wadray, abi→rpc, rpc, l1-split} est **fermé** : `abi.ts:7` importe `TRANSFER_TOPIC` de `../rpc.ts` (constante littérale `rpc.ts:15`) ; `wadray.ts`, `l1-split.ts`, `rpc.ts` sont des feuilles (`rpc.ts` n'importe que `node:crypto`). Le **labeler** `u3-realized.mjs` est désormais gelé **par sha in-repo au §2 (`cb020425…`, sha #9, QF-2 α)** ET vérifié par le marqueur `--labeler-sha` (record.ts:276-280) — double ancrage ; sa section live paramétrée n'affecte pas le réducteur pur (byte-identique `1c7574ac…`).

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

**Mode et nœud** : `reconcile --mode aggregate-calibration` (`packages/rpc-guard/src/reconcile.ts:50,58-76` ; `AGGREGATE_ONLY_OPERATORS` `:34`) ; **1ʳᵉ course Chainstack = ÉTALONNAGE** ; **nœud Global CONFIRMÉ** (console Statistics, A-1). Borne dure BLOQUE (NO-GO `hard:total` si `Δtotal_ru > ledger_run`, `reconcile.ts:67`) ; écart souple **CONSIGNÉ** (`calibration_soft:<n>`, exit 0, `:69-73`) ⇒ pré-enregistre la bande de la 2ᵉ course. `AGGREGATE_ONLY_OPERATORS = {chainstack}` (`reconcile.ts:34` ; garde `cli.ts:28`) ⇒ `reconcile` sur `chainstack` **fail-closed** sans `--mode aggregate|aggregate-calibration`.

**Statut (décision 129, 2026-09-22 05:2x UTC, CHANTIERS:701-704) : ce rapprochement A-4 est une GATE de comptabilité SÉPARÉE, PAS une condition de clôture de la course.** La course -1b **clôt sur les données (H-1..H-4)** ; le hors-ligne (reduce → scores → registre) et -2b/U-5/U-6/U-7 s'enchaînent **sans l'attendre**. Le protocole A-4 ci-dessous (fenêtre-jour, double lecture, créneaux exclus) est **inchangé (même procédure)** ; seul son statut bascule : item formé, propriétaire orchestrateur, **déclencheur = colonne du jour visible au dashboard (≥ 24 h)**, conditionnant UNIQUEMENT (1) le statut `built` de `@monark/rpc-guard` au registre interne (jamais une surface publique du temps 1) et (2) toute NOUVELLE dépense Chainstack (aucune course Chainstack suivante avant GO).

**Décision 121 — plafond Chainstack PAR COMPTE (portée orchestrateur, CHANTIERS:602-603 ; verbatim investisseur : « A »)** : le cap 16 M RU (décision 115) est **par COMPTE, tous réseaux confondus** (`ethereum-mainnet` Ukemi + `solana-mainnet` Bell + autre). Conséquences portées ici : **un seul ledger** de cycle Chainstack, **une seule clé de cycle**, **floor = somme des réseaux** lu au tableau de bord ; le rapprochement **A-4 lit le total du compte ET la ligne `ethereum-mainnet`** (le job Narabi et une éventuelle sonde Bell comptent dans le même plafond) ; la ventilation par réseau est un **attribut du journal (`network`), jamais un second plafond**.

**Protocole A-4 (couche règles ; INSTANCES épinglées par sha au prereg)** :
- **(i)** fenêtre d'une **JOURNÉE entière** ;
- **(ii)** **double lecture de stabilité** de `after` APRÈS le délai de mise à jour (« Data updates every few hours », FAITS pt 10) — deux lectures identiques espacées ; **espacement = INSTANCE à remplir à la course** ;
- **(iii)** **aucune fenêtre before/after de rapprochement ne chevauche l'heure d'un créneau du job Narabi** (addendum C-4 verbatim) ;
- **(iv)** le résiduel Narabi soustrait = **MINORANT** (borne inférieure), lu au **journal du sentinel** (nombre d'appels Chainstack du jour, réseau `ethereum-mainnet`) — un résiduel surestimé cacherait un contournement.

**Instances portées par le prereg** : jour ; heures des deux lectures (ii) ; floor (`--floor`, lu au dashboard = somme des réseaux, décision 121) ; chiffre du résiduel Narabi ; **sha du journal du sentinel** ; **les deux instantanés `--before`/`--after`** (§5c).

**Créneaux exclus — CALCULÉS depuis les créneaux fournis** (donnée orchestrateur : Narabi 00:30 / 03:30 / 06:30 / 09:30 UTC, durée + 30 min ; **à RECONFIRMER au journal du sentinel à la course**, ruling Q9 — le worker n'a mesuré que « publiant 00:48 UTC » + « 4 créneaux/jour », addendum C-4). Fenêtres d'exclusion des **instants de lecture** before/after (UTC) : **00:30–01:00, 03:30–04:00, 06:30–07:00, 09:30–10:00**. Les deux lectures (ii) se placent hors de ces 4 fenêtres, après le délai de mise à jour. (00:48 mesuré ∈ [00:30–01:00], cohérent.)

**Corollaires** : overage DÉSACTIVÉ (A-5) ⇒ à quota atteint Chainstack ARRÊTE le service (dont Narabi), pas de facture ; le cap protège la disponibilité. Quota mensuel exact / prix d'overage : NON LU (procurement si une course approche 16 M RU).

**Floor Chainstack lu SUR PLACE (règle 2026-09-20 ; décision 121 ; instance `<FLOOR-CHAINSTACK>`)** : lecture n°1 par l'orchestrateur (Claude in Chrome, session investisseur, console Chainstack `Statistics`), `docs/course-ukemi/FAITS-floor-chainstack-2026-09-22.md` [lu, 1ʳᵉ main] — cycle **19 sep → 19 oct 2026** ; **total compte = 12 904 RU** au 2026-09-22 **05:22 UTC** (546 full + 12 358 archive ; ligne `ethereum-mainnet` = 4 278 ; marge ~15,99 M sous le cap 16 M) ; **colonne du 22 non encore postée** (« Data updates every few hours »). Cette valeur est une **valeur du jour, JAMAIS réutilisée comme LE floor** : l'instance `<FLOOR-CHAINSTACK>` (§5a `--floor`, §5c) est renseignée par la **lecture n°2 de l'investisseur IMMÉDIATEMENT avant le go** (jamais devinée) — c'est aussi le `--before` du `reconcile` (§5c) ; la lecture n°1 (12 904 RU) n'en est que la **candidate** (le fichier FAITS la nomme ainsi). Les deux lectures de stabilité (ii) = n°2 (avant go) et n°3 (après course, espacées), hors des 4 créneaux Narabi.

---

## Sonde AVANT la course (go/no-go, G0 §6 + ruling Q11) — dont GO EN DEUX TEMPS `--filter-only`

**Go en deux temps du recorder (dérive `--max-calls`, mesuré `record.ts:384-414`)** :
- **Temps 1 — `--filter-only`** : énumère les holders aWETH puis lit `getUserConfiguration` (quorum-2, sans lecture par compte) ⇒ `n_at_risk_config` et `projection_remaining_calls = 9 × n_at_risk_config` (`record.ts:406`). **Le temps 1 porte les MÊMES 6 arguments requis** (`--ledger-dir --cycle --floor --max-ru --method-caps --max-calls`) + `--operators` : les throws `record.ts:239-250` sont AVANT la branche `filterOnly` (`:384`). Son `--max-calls` = énumération getLogs (sonde (a), ~1 412/opérateur) + `holders × 2` (config quorum-2) + marge déclarée. **MÊME `--resume` aux deux temps** (`record.ts:360-373`) : les lectures de config sont mises en cache ⇒ le temps 2 les rejoue à **0 budget**.
- **Temps 2 — course complète** : `--max-calls` = énumération (temps 1) + `9 × n_at_risk_config` + **marge déclarée** (instance de sonde, écrite dans le go/no-go) ; `--method-caps` fixés sur les trois méthodes du recorder (`eth_call`, `eth_getLogs`, `eth_getBlockByNumber`). Aucune valeur devinée : la RÈGLE est pré-enregistrée, les valeurs sont des instances de sonde.

**Autres estimations de sonde** :
- **(a)** énumération `Transfer` aWETH ≈ **1 412 getLogs/opérateur** ;
- **(b)** appels projetés `≈ N × (1 + k_coll + 2 + k_debt) × 2` ;
- **(c)** sonde getLogs large **Pocket L-5** (précondition POOL-RPC-1a L-3 branche B) ;
- **(d)** **1 `eth_call` `s_cutoffTime()` @B_fresh sous garde** (E-I-7 = OUI) ;
- **(e)** **distinct-par-OPÉRATEUR (`operatorOf`) ≥ 2/méthode** [C-3] — recorder avec `--operators` = 5 keyless + chainstack (§5a) : eth_call = **3 opérateurs distincts keyless** {drpc, mevblocker, pocket} ({nodies, pocket} = 1, `rpc2.ts:28-30`), getLogs = **4** {drpc, mevblocker, tenderly, pocket} — **≥ 2 même chainstack benchée** (garde `record.ts:297-298`) ; **part Chainstack projetée**, **plafond** (par compte, décision 121), **règle d'arrêt** (dépassement projeté ⇒ arrêt + consultation) ;
- **(f) Gel temporel (ruling Q11)** : sha LF de CE prereg (naît au commit, §8b) **ET `--labeler-sha`** (blob effectif de `u3-realized.mjs` = `cb020425…`, §2) **ET HEAD du commit du prereg** écrits **par l'orchestrateur** dans la sonde **ET un sidecar daté**, AVANT le premier appel. `record.ts` les persiste EN PLUS dans la provenance du brut du recorder (`:403`/`:432`) et le diag (`:466-467`) — le sidecar lie le **brut de DÉCOUVERTE** (sans marqueurs) à (`prereg_sha`, `labeler_sha`, HEAD) ;
- **(g) Compteurs d'abstention (ruling Q11)** : `labels_no_quorum` compté ; règle d'abstention = re-tirage sous budget jusqu'au quorum, sinon STOP + D-n, jamais d'exclusion silencieuse.
- **Discipline secret (A-7)** : jamais afficher une variable d'environnement ; contrôle par présence/longueur ; toute commande de **vérification** sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL …` (§8). La course LIVE du recorder utilise le vrai env (le transport gardé est le seul lecteur de clé, `record.ts:318`, `transport.ts`) — jamais imprimée ; **le labeler**, lui, tourne **KEYLESS-ONLY sous `env -u CHAINSTACK_ETH_URL`** (§5d, note (5)/CARTO-T1-1). **CGU lues avant tout appel d'API de données** (règle 2026-09-20).
- **Budget** : découverte comptée au budget [C-19]. Projection d'ordre : ~280 k appels (décision 91) × 2 RU/appel (recorder = méthodes 2 RU, A-1) ≈ **~560 k RU** (projection à raffiner par la sonde, ≪ cap par compte 16 M RU).

---

## (5) Lignes de commande FIGÉES (recorder ; discover ; `reconcile` servi ; labeler ; hors-ligne)

Les surfaces distinctes sont figées ci-dessous sur le **code fusionné** (`5394dfe`/`985fed9`/`6a639e8`, **U-4b-1b-0 `5d58a8a`** pour `record.ts`/`u4b-discover.mjs`, **labeler paramétré fusion -1b-1 `298e04a`**). Chaque argument obligatoire est nommé ; les instances (chemins hors dépôt, block, floor, caps) sont marquées `<…>`. **Ordre chronologique de course** : (5b) discover → (5a) recorder → prober D_e → (5d) labeler → (5c) reconcile → (5e) hors-ligne. **Ordre du pool = `transport.ts:36-37` (source unique), PAS l'argument `--operators`** : `--operators` est une liste d'INCLUSION ; l'ordre effectif ETH_CALL = [drpc.org, mevblocker.io, nodies.app, pocket.network], GET_LOGS = [drpc.org, mevblocker.io, tenderly.co, pocket.network], `chainstack` **appended last** (`record.ts:291-295`, tiré seulement sur bench keyless ⇒ RU minimisés).

### (5a) Recorder de la course (`node apps/sentinel/src/ukemi/record.ts`)

Arguments REQUIS sans condition (`record.ts:239-250`, `parseUkemiArgs:139-184`) ; **`--exclude-operator` N'EXISTE PLUS** (2b-ii : ne pas lister un opérateur = l'exclure). **Flags U-4b-1b-0 (FUSIONNÉS)** : `--prereg-file` (défaut `docs/PLAN-u4b-prereg.md`, `:172`) lie la course à CE prereg ; `--prereg-sha` fourni est vérifié contre le sha LF de `--prereg-file` (`record.ts:268-271`) ; `--labeler-sha` fourni est vérifié contre le sha LF de `u3-realized.mjs` (`:276-280`) ; les DEUX sont **OBLIGATOIRES par code** dès que le prereg existe (`:266-267`). Sur ÉCHEC, `<out>.diag.json` est écrit (diag durable, `:446-470`).

```
node apps/sentinel/src/ukemi/record.ts \
  --cluster weth \
  --block <B0 = B_first − 1 (§DISC), dérivé du brut de découverte> \
  --from-block <plancher d'énumération Transfer aWETH = max(reserveInitBlock, F) (record.ts:77) ; ≠ B_lo (22803459) de §DISC> \
  --operators drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack \   # NOMBRE DE KEYLESS FIGÉ = 5 (union transport.ts:36-37)
  --ledger-dir <F:\monark-ledger\<cycle>\ — hors dépôt, DOIT pré-exister (record.ts:239)> \
  --cycle <id unique par COMPTE (décision 121), même id pour tous les opérateurs demandés, keyless inclus (record.ts:241,300)> \
  --floor <FLOOR-CHAINSTACK — RU déjà consommés ce cycle, lu au dashboard = somme des réseaux (décision 121), instance de la lecture investisseur n°2 juste avant le go (§4, jamais devinée) ; DOIT être ≤ 16 000 000 (client.ts:74)> \
  --max-ru <MAX-RU-INSTANCE — plafond de COÛT du run, ≤ 16 000 000 − FLOOR-CHAINSTACK (Q7 ; deux plafonds séparés : runCaps client.ts:41 vs cycleFloor :43)> \
  --max-calls <MAX-CALLS-INSTANCE — > 0, du go --filter-only : énumération + 9×n_at_risk_config + marge déclarée (record.ts:249-250,406)> \
  --method-caps eth_call=<cap>,eth_getLogs=<cap>,eth_getBlockByNumber=<cap> \   # REQUIS et NON VIDE (record.ts:247)
  --prereg-file docs/PLAN-u4b-prereg.md \                                       # DÉFAUT (parseUkemiArgs:172) ; lie la course à CE prereg ; --no-prereg-binding INTERDIT pour la course weth (ruling 2026-09-22 04:4x)
  --prereg-sha <sha256 LF de docs/PLAN-u4b-prereg.md, calculé APRÈS le commit du blob (naît au commit, §8b) ; vérifié vs --prereg-file (record.ts:268-271) ; OBLIGATOIRE par code (record.ts:266) dès que le fichier existe ; fichier absent = refus NOMMÉ (:269)> \
  --labeler-sha <sha256 LF de scripts/census/u3-realized.mjs = cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af (blob effectif gelé au §2, QF-2 α, fusion -1b-1 ; recomputé au commit, ÉCART = STOP), écrit AUSSI dans la sonde ; vérifié vs le blob (record.ts:276-280) ; OBLIGATOIRE par code (record.ts:267)> \
  --concordance-out <hors dépôt — couture POOL-RPC-1a C-5/C-6 (record.ts:135,353-355,489)> \
  --resume <hors dépôt — cache request→result JSONL ; reprise après budget (record.ts:360-373)> \
  --out <hors dépôt — livre frais + provenance ; <out>.diag.json écrit sur TOUT échec (record.ts:233,470)>
```
**INTERDICTION pré-enregistrée (ruling 2026-09-22 04:4x)** : `--no-prereg-binding` **NE FIGURE PAS** dans cette ligne et est **INTERDIT pour la course weth** — sa présence dans la CLI/provenance = **D-n déclarée**, course **non servable** (l'opt-out n'est licite que pour l'usage générique hors U-4b, U-1/susde). Le recorder ne lit **AUCUNE clé pour la sélection d'opérateur** (`record.ts:318` : `deps.env` passé AS-IS à `openGuardedClient`, transport = seul lecteur de clé ; en-tête `:22-24`) ⇒ « aucune sonde d'env » est vrai **du recorder**. Séquence de fin de course : voir §6 (le `finally` fait déjà N `unlock` servi via `runCli`, `:486-499`).

### (5b) Discover de l'épisode (§DISC, keyless-only, gardé — TÉMOIN)

`scripts/census/u4b/u4b-discover.mjs` (lot U-4b-1b-0 Q-D) exécute §DISC:30 (getLogs) + §DISC:34-40 (clustering `clusterWethLiquidations`), **keyless-only via le client GARDÉ** ; il ne fait PAS l'exclusion e2 / l'éligibilité / l'argmin (§DISC). Son `clusters` est un **TÉMOIN CONSULTATIF** ; la SÉLECTION est faite par le réducteur AVAL (`episode-selection.json`, item formé §7).

```
node scripts/census/u4b/u4b-discover.mjs \
  --from-block 22803459 \                          # B_lo (§DISC : bascule feed WETH → SVR), borne getLogs basse (fromBlock, u4b-discover.mjs:60)
  --to-block <finalized − 64 (§DISC B_hi), horodaté dans le brut> \   # toBlock, :61 ; to >= from (:62)
  --event-id <id de travail, ex. weth-discover-<date>> \              # eventId req, :63
  --operators drpc.org,mevblocker.io,tenderly.co,pocket.network \     # KEYLESS-ONLY (assertKeylessOperators :35-38 refuse chainstack/helius)
  --ledger-dir <F:\monark-ledger\<cycle>\ — hors dépôt, DOIT pré-exister (assertLedgerDir :68)> \
  --cycle <même id de cycle par compte (:69)> \
  --max-calls <> 0 — budget fail-closed (:70-71)> \
  --out <hors dépôt — brut déterministe (tri canonique + brut_sha256 :103) + clusters témoins> \
  [--method-caps '{"eth_getLogs":<cap>,"eth_getBlockByNumber":<cap>}'] [--min-interval-ms 50]     # method-caps = objet JSON (:43-49), défaut min-interval 50 (:73)
```
> **Deux formats `--method-caps` dans le runbook, à NE PAS unifier** : le recorder (5a) prend `k=v,k=v` (`record.ts`) ; `u4b-discover` (5b) prend un **objet JSON** (`u4b-discover.mjs:43-49`). Chaque outil garde son format. Le brut de discover NE porte PAS `prereg_sha`/`labeler_sha` (`u4b-discover.mjs:98-104`) ⇒ le sidecar daté les lie à son `brut_sha256`.

### (5c) `reconcile` servi — via `bin/rpc-guard.mjs` (Q-E RÉSOLU) — GATE SÉPARÉE de comptabilité (décision 129), PAS une condition de clôture de course

**Décision 129 (CHANTIERS:701-704) : gate de comptabilité SÉPARÉE** — la course clôt sur les données (H-1..H-4) ; le hors-ligne (reduce → scores → registre) et -2b/U-5/U-6/U-7 s'enchaînent **sans l'attendre** (§4). La forme SERVIE reste `bin/rpc-guard.mjs reconcile` (snapshots `{cycle,total_ru}` pour Chainstack, agrégat).

`reconcile` est un sous-commande de `runCli(argv, deps)` (`cli.ts:17-34`, branche `:22-34`). Le **point d'entrée servi EXISTE à l'arbre fusionné** : `packages/rpc-guard/bin/rpc-guard.mjs` (GARDE-HELIUS-1b-0, `6a639e8` ; `package.json` `bin.rpc-guard`) câble `process.argv` → `runCli(rest, { ledgerDir, floor, readSnapshot })` où **`--ledger-dir`/`--floor` sont des args explicites du bin** (dépouillés, `bin:13,24`), `readSnapshot = (p) => JSON.parse(readFileSync(p, "utf8"))` (`bin:25`) et **`--before`/`--after` sont des CHEMINS de fichier** lus par `readSnapshot` (`cli.ts:32`). Le **code de sortie / verdict imprimé EST la sortie consommée** (`bin:26-27`, `reconcile.ts:8`). Ligne de commande figée :

```
node packages/rpc-guard/bin/rpc-guard.mjs \
  --ledger-dir <F:\monark-ledger\<cycle>\ — hors dépôt (bin:15-16)> \
  --floor <FLOOR-CHAINSTACK — même valeur que la course, par cohérence (voir NOTE floor) ; défaut 0 (bin:18-19)> \
  reconcile \
  --before <snapshot-before.json — hors dépôt : {"cycle":"<id>","total_ru":<n>} lu au dashboard AVANT (need --before, cli.ts:32)> \
  --after  <snapshot-after.json  — hors dépôt : {"cycle":"<id>","total_ru":<n>} double lecture (ii) APRÈS> \
  --cycle  <id du cycle Chainstack (décision 121) — DOIT == snapshot.cycle sinon rollover (reconcile.ts:55)> \
  --op     chainstack \
  --mode   aggregate-calibration
```
- **Forme du snapshot (mode agrégat)** : `{"cycle":"<id>","total_ru":<number>}` ; `byMethod` **ABSENT** (sinon NO-GO `aggregate_mode_rejects_by_method`, `reconcile.ts:63`) ; `total_ru` **REQUIS** (sinon `aggregate_mode_needs_total_ru`, `:62`) ; `cycle` == `--cycle` (sinon `rollover`, `:55`).
- **Verdict** : **GO ssi exit 0**. `Δtotal_ru > ledger_run` ⇒ NO-GO `hard:total` (exit 1, `:67`) ; `Δ < 0` ⇒ NO-GO `negative_delta` (`:66`) ; rollover ⇒ NO-GO (`:55`). En `aggregate-calibration`, le sur-comptage souple est **CONSIGNÉ** `calibration_soft:<softOver>` (exit 0, `:69-73`) ⇒ pré-enregistre la bande de la 2ᵉ course. **Le rapprochement lit le total du compte** (`ledgerTotal` sans filtre réseau, `reconcile.ts:64` ; décision 121). **Décision 129 : ce verdict conditionne UNIQUEMENT (1) le statut `built` de `@monark/rpc-guard` au registre interne et (2) toute NOUVELLE dépense Chainstack — PAS la clôture de la course ni la chaîne de release ; une course Chainstack ultérieure (ex. U-6 live) re-enclenche cette gate (item formé, propriétaire orchestrateur).**
- **NOTE floor (mesuré, pas deviné)** : `openOperatorLedger(cycleDir, op, floor)` (`ledger.ts:94`) n'utilise `floor` que pour `frozenPrior = max(floor, Σ attempted)` (`:128`, `priorAtOpen`) ; `runReconcile` **NE consomme PAS** `priorAtOpen` (le verdict lit `ledgerRunSinceLastReconciled`, `reconcile.ts:37-48,56`, indépendant du floor) ⇒ un `--floor` différent de la course **ne jette pas** et **ne change pas le verdict**, mais la cohérence 121 impose la même valeur.

> **ITEM FORMÉ résiduel (Q-E — le bin suffit pour le reconcile ; ce qui reste)** : `bin/rpc-guard.mjs` est **`upcoming`** jusqu'à ce qu'une course SERVIE consomme son code de sortie (règle de Branchement ; en-tête `bin:6-7` ; G7-1b-0 §4). Ce qui n'est PAS dans le bin : (a) la **production des deux fichiers `{cycle,total_ru}`** par l'orchestrateur lisant le dashboard (double lecture (ii), « lecture sur place » 2026-09-20) ; (b) le **wrapper de course** qui lit le dashboard, lance le bin et consomme le verdict comme go/no-go = **item formé 1b-i** (G7-1b-0 §5, « wrapper reconcile de course `--before/--after` »). Propriétaire orchestrateur, **déclencheur = colonne du jour visible au dashboard (≥ 24 h, décision 129 ; FAITS : colonne du 22 non encore postée au 05:22 UTC)** — hors du chemin de clôture de la course.

### (5d) Labeler `u3-realized.mjs` — KEYLESS-ONLY pendant la course (note (5) / CARTO-T1-1)

**Ruling CARTO-T1-1 pré-enregistré + gardes de course par CODE (pli checkpoint-2, fusion -1b-1).** Le labeler `u3-realized.mjs` tourne **KEYLESS quorum-2 SEULEMENT** : `--archive-operator` (jambe Chainstack payante) est **ABSENT** de la ligne de course, et la ceinture `env -u CHAINSTACK_ETH_URL` scrubbe la clé. **Toute sonde d'env au scope module a été SUPPRIMÉE** (`process.env` n'apparaît **qu'une fois** — l'injection `main({ env: process.env, argv })` `:719`, `grep -c 'process.env'` = 1) ⇒ le script ne lit **ni URL ni clé** (`--archive-operator` résolu uniquement dans `@monark/rpc-guard`). Vérifiable par la ligne `providers` du brut (`meta.providers` `:667`), qui ne doit lister **aucun hôte Chainstack**.

```
env -u CHAINSTACK_ETH_URL \                                  # FORCE keyless-only (CARTO-T1-1) — la SEULE course qui scrubbe cette clé
  node scripts/census/u3-realized.mjs \
  --events      <episode FRAIS .json — [{id,collateral,clusterLo,clusterHi,preV33}] hors dépôt (parseEventsFile :405-406)> \
  --rawlogs     <A-rawlogs.jsonl de l'épisode FRAIS — hors dépôt> \
  --rawlogs-sha <sha256 BRUT du fichier ci-dessus — vérifié pré-fetch (:482, abort si écart)> \
  --prereg-file docs/PLAN-u4b-prereg.md \                 # RULING (3) FIXÉ : lie les labels frais au prereg -1b (défaut du script docs/PLAN-u3-prereg.md :416, ici SURCHARGÉ)
  --prereg-sha  <sha256 LF de docs/PLAN-u4b-prereg.md — vérifié (:483-486)> \
  --operators   drpc.org,mevblocker.io,pocket.network,publicnode.com,blxrbdn.com \  # 1rpc.io EXCLU par code (C-7)
  --out         <dossier FRAIS HORS DÉPÔT> \              # OBLIGATOIRE par code (C-6, :491) ; sous apps/sentinel/test/fixtures/ => refus (:495)
  --raws-dir    <bruts concordants HORS DÉPÔT> \          # OBLIGATOIRE par code (C-6, :492) ; sous fixtures/ => refus (:496)
  --episode-tag <tag de l'épisode frais> \
  --max-calls   <n — REQUIS, entier > 0 (budget fail-closed, :479)>
```
**Gardes de course PAR CODE (pli checkpoint-2, liste (B) ; fusion -1b-1, mesuré blob arbre fusionné)** : (C-6) `--out`/`--raws-dir` **OBLIGATOIRES sans défaut** (`:491`/`:492`) + un chemin résolu **sous `apps/sentinel/test/fixtures/`** est **refusé fail-closed** (`:495`/`:496`, ferme P14 : l'ancien défaut écrasait les 4 séries pinnées) ; (C-7) `EXCLUDED_OPERATORS = ["1rpc.io"]` (`:283`) **retiré du pool keyless par défaut** (`:505`) ET un `--operators` qui le nomme est **refusé** (`:502`) ; **payant refusé fail-closed sans `--allow-paid`** — `isPaidOperator = !KEYLESS_WITNESS_LABELS.has(label)` (`:280`), refus `:509-511`, **variantes de casse** couvertes (`chainstack`/`Chainstack`/`HELIUS`, test C-3) ; `--rawlogs-sha` **vérifié AVANT tout fetch** (`:482`). **`--archive-operator` ABSENT de la ligne de course** (keyless-only servi) : la jambe payante n'existe que via `--archive-operator chainstack --allow-paid` + budget gardé (`:509-511` ; `meta.archive_operator`/`allow_paid` à la provenance `:669`). **PRÉCONDITION -1b RÉALISÉE (fusion -1b-1)** : le réducteur PUR (`:83-270`) byte-identique (`1c7574ac…`, §Y) ⇒ condition (i-a) NON déclenchée, pas de 9ᵉ sha gelé. Sortie `--out/U3-realized.jsonl` FRAIS consommée par `u4b-reduce --labels` (§5e ; test de composition `u4b_labels_replay_via_main_real_artifact`).

### (5e) Hors-ligne (offline, après la course ; sous la vérification des 9 sha par l'orchestrateur)

Arguments TOUS obligatoires (épisode-agnostiques, C-12) ; aucune sonde d'env.
```
# réducteur driver (u4b-reduce.mjs:10-11,31-36) :
node scripts/census/u4b/u4b-reduce.mjs \
  --book-raw   <U4-book-<B>.raw.json FRAIS — hors dépôt (CA-11)> \
  --oracle-raw <U4-oracle-path-<tag>.raw.json FRAIS — hors dépôt> \
  --labels     <U3-realized.jsonl FRAIS (sortie 5d)> \
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

**Séquence de fin de course (la course a déjà CLÔT sur H-1..H-4 ; le `reconcile` est une gate de comptabilité SÉPARÉE, décision 129)** :
1. **`unlock` (N)** — au succès, au budget stop, ou sur un throw, le **`finally` du recorder fait déjà les N `unlock`** (`record.ts:486-499` : chaque opérateur demandé, payant ET keyless, une ligne `unlocked` chaînée). Le `unlock` **manuel** N'EST DÛ QU'APRÈS un **crash dur (SIGKILL)** qui laisse les verrous tenus (fail-closed, détectable ; `record.ts:493`) : le runbook fait alors N `unlock` AVANT `reconcile`. **Surface servie du unlock manuel (Q-E)** : `node packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir <…> --floor <…> unlock --cycle <id> --op <label> --reason <texte>` (`cli.ts:36-42`).
2. **`reconcile --op chainstack --mode aggregate-calibration`** via `bin/rpc-guard.mjs` (§5c) — **GATE de comptabilité SÉPARÉE (décision 129), exécutée APRÈS la clôture ; ne retient PAS la release.** **GO ssi exit 0** (`Δtotal_ru ≤ ledger_run`, RU conservateurs). Bande souple : en `aggregate-calibration` le sur-comptage est **CONSIGNÉ** `calibration_soft:<n>` (exit 0, `reconcile.ts:69-73`) et pré-enregistre la bande de la 2ᵉ course. `Δ > ledger_run` ⇒ **NO-GO `hard:total`** ; `Δ` négatif ⇒ **NO-GO `negative_delta`** ; rollover ⇒ NO-GO. **Le rapprochement lit le total du compte ET la ligne `ethereum-mainnet`** (décision 121). Ce verdict conditionne UNIQUEMENT le statut `built` de `@monark/rpc-guard` + toute nouvelle dépense Chainstack (§5c) — jamais la clôture -1b.

**Plafonds anti-BUG fail-closed (décision 119, non levés par le GO durable ; décision 121 : PAR COMPTE)** : **Chainstack 16 M RU / cycle, PAR COMPTE** (décisions 115 + 121 ; `CHAINSTACK_CYCLE_CAP_RU = 16_000_000`, `transport.ts:23`) ; `--max-ru` (run, fixé au commit depuis le floor lu sur place — ruling Q7) et `--method-caps`. **Plafond touché ⇒ STOP + retour investisseur** (« peu importe le coût » n'autorise pas une dépense par défaut logiciel — leçon HELIUS-1). Helius 8 M cr cité par 119 mais **inapplicable** (une course Ukemi ne verrouille jamais `helius`, A-2). Aucun gate suspendu (R-22) ; aucune règle de sécurité levée.

**GO durable amont (décision 119)** : la course U-4b-1b a le GO dès GARDE-HELIUS-2 fusionné (**SATISFAIT** : 2a/2b-i/2b-ii/2b-iii) + U-4b-1b-0 fusionné (`5d58a8a`) + labeler paramétré fusionné (fusion -1b-1 `298e04a`) + prereg committé seul — sans nouveau go. Le rapprochement before/after est une **gate de comptabilité SÉPARÉE** (décision 129), pas une condition du go de course.

**Journal de diagnostic durable sur course en ÉCHEC (C-R-b7 — RÉSOLU par le lot U-4b-1b-0, Q-C).** Exigence : sur une course qui échoue, `rpc_errors` (par `e.name` : `http:` payant, `code:` keyless ; sans secret, `record.ts:47-51,324-345`), `errors_by_operator` (`errByOp`, moniteur règle-5 %) et le tally `calls/byOperator/byMethod` sont **persistés durablement** (hors dépôt). **État FUSIONNÉ (à la fusion de -1b-0, `record.ts:446-470`)** : le `catch` écrit `<out>.diag.json` sur **TOUT** chemin d'échec (BudgetExceededError, TransportError, RpcError, quorum, ABI, autre) — `{ts, error:{name, message scrubbée}, calls_total, by_operator_method, rpc_errors, errors_by_operator, n_at_risk_seen, prereg_sha, labeler_sha, ukemi_sha}` (`:458-467`), AVANT le comportement existant (return 2 / rethrow). Zéro clé (scrub transport + `stripUrls` local `:51`). Le TROU du candidat (« seul `BudgetExceededError` rapportait ; tout autre throw perdait `rpc_errors`/tally ») est **fermé**. **Diag durable nommé** : `<out>.diag.json`.

---

## (7) Ce que le prereg NE décide PAS + préconditions du commit

- **Hors décision 119** : contre-vérification **Bell** (~5,4 M cr) et C-F-4 ; **live U-6** ; mise en ligne du site (décision 101) ; DNS Bell ; tout achat/action de compte. **Q7** : la **réservation Bell est exprimée en RU au TEMPS 2 seulement** (Bell hors temps 1) ; à fixer alors, unité RU, dans le même plafond par compte (décision 121). Ne pas présumer que Bell n'utilise pas Chainstack (ADR-GARDE-HELIUS D5 : « leg ETH budgété » Bell, `collect.ts:638`).
- **Le q̂ et les régions (bornes hautes)** : produits par la course, jamais pré-décidés.
- **L'épisode frais** : découvert mécaniquement (P-EPI) ; le prereg fige la RÈGLE ; le **réducteur de SÉLECTION** (`episode-selection.json`) est un item formé (ci-dessous).
- **Le résultat H-3** : mesuré (bêta-binomial 5 %), non pré-décidé.
- **La classe servie en -2** : A seule (décision 108, E-I-3 close).
- **(b) CA chemin natif** : item formé « calibration suivante », non rétroactif.
- **Neutralité de version** si v3.6.0 : `PR-U4-3-bis` (H-1).

**Go U-6 conditionnel PRÉ-ENREGISTRÉ (décision 122 item 3, AMENDÉE par la décision 129)** : la décision 129 **supersède la clause 1 (« `reconcile` = GO »)** — le rapprochement Chainstack ne retient PLUS la chaîne de release (§5c/§4). Clause pré-enregistrée : « **GO U-6 sans nouveau tour ssi** aucune strate servie en NON au test H-3 (bêta-binomial 5 %) **ET** `labels_no_quorum` non résolus = 0 ; **sinon retour investisseur avec les chiffres** ». Le `reconcile` reste une **gate de comptabilité séparée** (décision 129) et **une NOUVELLE dépense Chainstack en U-6 live re-enclenche cette gate** (item formé, propriétaire orchestrateur). Cette clause ne change rien de ce qui est servi (elle n'est PAS un go rendu ici).

**Préconditions dures AVANT le commit** (items formés à déclencheur — zéro dette nue) :
1. **GARDE-HELIUS-2b-ii + 2b-iii fusionnés** (arguments recorder finaux, §5a) — **SATISFAIT** (`5394dfe` / `985fed9`).
2. **Lot U-4b-1b-0 FUSIONNÉ `5d58a8a`** (`--prereg-file`/`--prereg-sha` lié/`--labeler-sha`/diag/`u4b-discover.mjs` ; G7 `ee51e56`) **ET labeler paramétré FUSIONNÉ (fusion -1b-1 `298e04a`)** — la condition « committable SEUL » est **SATISFAITE**.
3. **C-15 (Mondrian 2003 [lu])** : SATISFAITE (note orchestrateur G0-lot-u4b `:358`).
4. **`PR-U4-3-bis`** si impl ≠ v3.5.0 (H-1).
5. **Procurement `PR-U4-4-a`** (chapitre Mondrian 2022, ISBN 978-3-031-06648-1) : formé, non bloquant (substitut 2003 [lu]).
6. **Contrainte d'ordre NARABI-OPS-1d (ruling Q10, amendement 2026-09-21 §3)** : `apps/sentinel/src/rpc.ts` au gel D4 ; **NARABI-OPS-1d NE fusionne PAS entre le commit du prereg et la clôture de la course** (sinon `rpc.ts` change ⇒ gel rompu ⇒ re-gel + re-prereg). Cohérent décision 118 (-1d après temps 1). `record.ts`/`rpc2.ts` sont HORS gel ⇒ l'ordre 2b-ii/-1b-0 ↔ prereg ne crée pas de conflit.
7. **Condition (i-a) : mesurée NON déclenchée** — le réducteur pur de `u3-realized.mjs` (`:83-270`) est byte-identique après -1b-1 (`1c7574ac…`, §Y) ⇒ pas de 9ᵉ sha gelé.

**Préconditions de COURSE (déclencheur « avant la course », PAS du commit)** :
- **Paramétrage -1b du labeler : FAIT** (fusion -1b-1 `298e04a`, §5d/§Y) ⇒ `--labeler-sha` = `cb020425…` (QF-2 α, §2). **N'est plus une précondition de course ouverte.**
- **Réducteur de SÉLECTION d'épisode** (`episode-selection.json`, tuyau `u4b_episode_selection_is_deterministic`) : applique §DISC:31 (exclusion e2), :42-46 (éligibilité), :49 (argmin) sur le brut de discover, en re-exécutant `clusterWethLiquidations` sur l'ensemble e2-EXCLU (item formé, propriétaire orchestrateur).
- **Paramétrage du prober D_e** (`u4-oracle-path.mjs` : `B0/BLAST/PROXY` e2 en dur `:33,:36` → feed frais) (Q-D).
- **Wrapper reconcile de course** (production des instantanés `{cycle,total_ru}` + consommation du verdict du bin, §5c ; item 1b-i G7-1b-0 §5).

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

**(8b) sha LF de CE prereg — procédure, PAS de valeur circulaire (mission 8)** : la valeur naît au commit ; l'orchestrateur la recompute APRÈS commit, l'écrit dans la sonde + le **sidecar daté**, ET la passe en `--prereg-sha` à la course (`record.ts:268-271` la consomme, défaut `--prereg-file docs/PLAN-u4b-prereg.md`) :
```
git -C F:/Monark show HEAD:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum
```
(Un garde de code — `record.ts:266-271`, lot U-4b-1b-0 — consomme cette valeur ; **OBLIGATOIRE par code dès que `docs/PLAN-u4b-prereg.md` existe** (ruling 04:4x), `--no-prereg-binding` interdit pour la course weth ; l'enforcement procédural DOUBLE le code en défense-en-profondeur, Q-A.)

**(8c) `--labeler-sha`** = sha256 LF du blob de `u3-realized.mjs` = **`cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af`** (blob effectif gelé §2, QF-2 α ; recomputé au commit, ÉCART = STOP), écrit par l'orchestrateur dans la sonde + le **sidecar daté** ET passé en `--labeler-sha` (flag RÉEL, `record.ts:276-280` le vérifie ; **OBLIGATOIRE par code** `:267` dès que le fichier prereg existe — Q-B) :
```
git -C F:/Monark show HEAD:scripts/census/u3-realized.mjs | tr -d '\r' | sha256sum   # = cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af (blob effectif ; inchangé par le commit docs-only du prereg)
```

**(8d) Invariants réassertés inchangés au commit** (numéros re-mesurés ce tour) : `book_digest 034fbff9…` (`ukemi.test.ts:33`) ; `PINNED_DIGEST 267cd991…` (`ukemi-u4-scores.test.ts:24`) ; **`U3-realized.jsonl b4d93590…`** (`PROVENANCE-u3.md:10`, ruling Q11) ; digests de cellule U-4b (après re-gel 126) A `2feb4ab0…` / B `07bb8e3b…` ; fixture `U4b-scores-e2.jsonl 301d39fa…` ; fixtures `u4/` et `u4b/` sha-pinnées (`PROVENANCE-u4b.md`) ; ordre des fournisseurs (`transport.ts:36-37`, `rpc2.ts:248-249`).

---

## POINTS RÉSOLUS PAR LE LOT U-4b-1b-0 + ITEMS FORMÉS RÉSIDUELS (liste FERMÉE — jamais une valeur devinée)

**Résolus par le lot U-4b-1b-0 (décision 128) / le bin fusionné :**
- **Q-A — enforcement du gel U-4b : RÉSOLU par CODE.** Le recorder lie la course à CE prereg : `--prereg-file` (défaut `docs/PLAN-u4b-prereg.md`, `record.ts:172`) + `--prereg-sha` vérifié vs ce fichier (`:268-271`). **QF-1 TRANCHÉE (ruling orchestrateur 2026-09-22 04:4x UTC)** : les corrections de pli du lot rendent `--prereg-sha` ET `--labeler-sha` **OBLIGATOIRES par code dès que `--prereg-file` (défaut `docs/PLAN-u4b-prereg.md`) EXISTE sur disque** ; `--no-prereg-binding` explicite pour les usages génériques hors U-4b (U-1/susde), écrit dans la provenance, **INTERDIT pour la course weth** ; mutant « flags absents acceptés » ROUGE. Les DEUX clauses de D4 sont donc VRAIES par code pour la course weth (le prereg committé fait exister le fichier). Amendement joint `ADR-U4b-amendement-D4-128.md` (libellé exact).
- **Q-B — `--labeler-sha` : RÉSOLU (flag RÉEL).** `record.ts:124,172,267,276-280` : `--labeler-sha` fourni est vérifié vs le sha LF de `u3-realized.mjs`, obligatoire par code (`:267`), écrit dans la provenance (`:403`/`:432`) et le diag (`:467`). **QF-2 TRANCHÉE (α)** : le paramétrage -1b du labeler **fusionne AVANT le commit** (fusion -1b-1 `298e04a`) ⇒ le §2 gèle le blob effectif `cb020425…` que la course lie (gel avant que la donnée fraîche existe — propre). Plus de résiduel ouvert (§Y).
- **Q-C — journal de diagnostic sur échec : RÉSOLU.** `<out>.diag.json` écrit sur TOUT échec (`record.ts:446-470`). C-R-b7 fermé.
- **Q-E — surface d'invocation du `reconcile` : RÉSOLU par `bin/rpc-guard.mjs`.** Il prend `--ledger-dir`/`--floor` (bin) + `reconcile --before <path> --after <path> --cycle --op --mode` (`cli.ts:22-34`) ; `--before`/`--after` = chemins lus par `readSnapshot` (`bin:25`). **Le bin SUFFIT pour le reconcile** ; ligne de commande §5c.

**Q-D — partiellement résolu (l'outil de découverte existe ; la SÉLECTION reste un item).** `u4b-discover.mjs` (TÉMOIN keyless-only gardé) + `liquidation-logs.mjs` (`clusterWethLiquidations` PUR exporté) existent. **Items formés (propriétaire orchestrateur, déclencheur « avant la course ») :** (a) **réducteur de SÉLECTION d'épisode** (`episode-selection.json`, tuyau `u4b_episode_selection_is_deterministic` ; applique §DISC:31/:42-46/:49 sur le brut, e2-EXCLU) ; (b) **paramétrage du prober D_e** `u4-oracle-path.mjs` (feed frais).

**Items formés résiduels (zéro dette nue) :**
- **Amendements ADR à INSÉRER par l'orchestrateur (R-20)** : (a) D4 (décision 128) `ADR-U4b-amendement-D4-128.md` ; (b) **QF-2** (re-gel labeler `cb020425…`, gel déféré LEVÉ) `ADR-amendement-labeler.md` (`F:\tmp\u4b1b1\`, tableau AVANT/APRÈS) ; (c) **décision 129** (reconcile = gate de comptabilité séparée, §5c/§4/§6/§7).
- **Wrapper reconcile de course** (production des instantanés `{cycle,total_ru}` + consommation du verdict du bin) : item 1b-i (G7-1b-0 §5) ; le bin reste `upcoming` jusqu'à ce consommateur. **Décision 129** : ce wrapper sert la gate de comptabilité SÉPARÉE (déclencheur = colonne du jour au dashboard), hors du chemin de clôture de course.
- **QF-2 (labeler) : TRANCHÉE (α)** — le paramétrage -1b fusionne AVANT le commit (fusion -1b-1 `298e04a`), le §2 gèle `cb020425…` ; gel déféré LEVÉ (§Y). **QF-1 (flags obligatoires)** : TRANCHÉE par le ruling 2026-09-22 04:4x (ci-dessus).

---

## Annexe A — Provenance des rulings (traçabilité datée ; ex-« NOTE ORCHESTRATEUR » du candidat, dé-brouillonnée)

- **Source des rulings** : `docs/CHANTIERS.md`, puce « 2026-09-21 ~21:1x UTC — prereg U-4b-1b : avis advisor-defi Q11/Q4/Q6 reçu … rulings orchestrateur » (CHANTIERS:604) ; avis verbatim `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\AVIS-advisor-defi-prereg-u4b-1b-2026-09-21.md` et `…AVIS-advisor-defi-vacuite-region-A-options-2026-09-22.md` (advisor-defi `claude-fable-5-1`, conseil jamais verdict).
- **Q1** périmètre = 8 sections + §DISC/H-n/sonde (G0 §7). **Q2** `rpc.ts` `0e232519…` figé (amendement ADR-U4b 2026-09-21 §1, complet). **Q3** (constat DRAFT « amendement jamais atterri ») **périmé** : substance EN LIGNE dans ADR-U4b D4/D5 depuis `8ba2cbc`. **Q4** = (a) confirmé, formulation C-V-7 verbatim ; (b) item « calibration suivante » non rétroactif. **Q5** item « agrégat ≠ Σ jambes » CLOS (ceil par jambe, v3.5.0). **Q6** H-3 → bêta-binomial exact 5 % par strate ; H-4 → 5 % + e2 11,1 %/12,7 % ⇒ NON attendu + part de Y post-premier-appel ; H-5 → dérivé de nMin. **Q7** `--max-ru` fixé depuis le floor lu sur place ; réservation Bell en RU au temps 2. **Q8** E-I-3 close par 108. **Q9** créneaux à reconfirmer au journal sentinel. **Q10** contrainte d'ordre NARABI-OPS-1d (amendement §3). **Q11** convention Y = ADR-U3 D1/D2 + pin `b4d93590…` + `--labeler-sha` + règle d'abstention + confinement section live (condition (i-a) mesurée NON déclenchée). **QF-1** flags obligatoires par code (ruling 04:4x). **QF-2** re-gel labeler `cb020425…` (α, gel déféré LEVÉ, fusion -1b-1).
- **Décision 128 (2026-09-22 03:00 UTC, CHANTIERS:659+)** : ingénierie de course U-4b-1b, rulings Q-A..Q-E. Lot U-4b-1b-0 « outillage de course » (`--prereg-file`/`--prereg-sha` lié, `--labeler-sha`, diag durable, `u4b-discover.mjs`, tests non-LLM ; 9 sha gelés byte-identiques ; le prereg -1b se committe SEUL après ce lot, lignes de commande alignées sur les flags réels).
- **Décision 129 (2026-09-22 05:2x UTC, CHANTIERS:701-704)** : le rapprochement Chainstack est une GATE de comptabilité SÉPARÉE (item formé, deux lectures investisseur sur place), PAS une condition de clôture de course ; la course clôt sur H-1..H-4 ; conditionne uniquement le statut `built` de `@monark/rpc-guard` + toute nouvelle dépense Chainstack. **QF-2 (2026-09-22, ruling QF-2 α + pli checkpoint-2 -1b-1)** : re-gel du labeler (`cb020425…`, gel déféré LEVÉ, fusion -1b-1 `298e04a` ; G2 PASS-AVEC-CORRECTIONS + checkpoint-2 ACCEPTE-AVEC-CORRECTIONS).
- **Décision 126 (2026-09-22 01:03 UTC, CHANTIERS:646-658)** : score unilatéral `max(Y − ŷ, 0)`, re-gel du sha #1 AVANT le prereg ; 4 clauses (H-3 conservateur, n≥199, rapport compteurs, région borne haute) ; lot U-4b-SCORE-1 fusionné `6652ed0`.
- **Décision 122 (2026-09-21 ~22:5x UTC, CHANTIERS:607-610)** item 3 : go U-6 conditionnel pré-enregistré (§7). **Décision 121 (CHANTIERS:602-603)** : plafond Chainstack par compte. **Décision 123 (CHANTIERS:622-627)** : `cascade` = option D, retrait déplacé à U-5 (hors périmètre servi -1b). **CARTO-T1-1 (CHANTIERS:614)** : labeler keyless-only en course (§5d).
- **Décisions investisseur amont** : 91 (premier franchissement), 108 (classe A seule), 110/111 (anti-close / hors miroir), 113 (rapprochement), 115 (16 M RU), 118 (NARABI-OPS-1d après temps 1), **119** (GO durable, plafonds non levés). ADR-U3 D1/D2 (`docs/adr/ADR-U3-realized-labels.md`, adoptée 2026-09-20). ADR-U4b (`docs/adr/ADR-U4b-calibration-episode-frais.md`, D1-D5 + amendements 2026-09-21, 2026-09-22 (décision 126), 2026-09-22 (U-4b-2a), et à venir 2026-09-22 (décision 128, D4 ; QF-2 re-gel labeler ; décision 129 reconcile gate séparée)).
- **Modèle** : worker `claude-opus-4-8[1m]`, effort max. **R-20** : le worker ne committe pas ; **R-21** : sortie vérifiée adversarialement par l'orchestrateur avant consommation. Mesures : `CHECK.md`.
