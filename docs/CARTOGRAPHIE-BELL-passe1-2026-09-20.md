claude-opus-4-8[1m]

# CARTOGRAPHIE DE BRANCHEMENT — MONARK Bell — passe 1

> Worker Opus 4.8 à contexte frais. Sortie = donnée brute pour l'orchestrateur (R-21 : vérifiée
> adversarialement avant consommation). Lecture + rejeu de tests en **lecture seule** ; aucun fichier du
> dépôt modifié ; aucun commit ; aucun appel réseau payant. Jetons de close en clair masqués `[masqué]`
> (jamais un close publié — les nombres masqués ici sont des **fixtures synthétiques de test**, pas des
> closes réels ; les sha de digest sont des hachages, pas des closes).

## 0. Provenance & méthode (reproductible)

| Élément | Valeur |
|---|---|
| Modèle résolu (R-1) | **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` — vérifiable par l'orchestrateur) |
| Date | 2026-09-20 |
| Dépôt | `F:\Monark`, branche `lot/etude-suite` |
| Commit cartographié | `a81d4b3991a88e995e8494fde061ba57b8fdaa3e` (`git rev-parse lot/etude-suite` == `git rev-parse HEAD`) |
| Dérive arbre de travail | 2 chemins **non suivis** (`??`) : `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md`, `docs/biblio/narabi/` — **hors périmètre Bell** (ni `apps/bell`, ni les 2 ADR, ni `fleet.ts`). `git archive` sérialise l'**arbre committé** ⇒ copie de rejeu == HEAD `a81d4b3`, indépendante de cette dérive. |
| Worktree `-b1-bis-i` (NON fusionné) | `F:\Monark-wt-bellb1bis`, branche `lot/t-1a-ii-b1-bis`, HEAD `73077bb9e10fbfc81b80c2ce05895e8e6efceb36` ; merge-base avec `lot/etude-suite` = `5c29871` |
| Copie de rejeu | `git archive lot/etude-suite \| tar -x -C /f/tmp/carto-bell/` ; `npm ci --cache /f/tmp/npm-cache` (exit 0, 282 pkgs, node **v24.15.0**) ; `TMP/TEMP=F:\tmp` |
| Extraction des imports (mesurée) | `grep -rhn -E 'from "(\.\|\.\.)' apps/bell/src/` (**capte les imports multi-lignes** via la ligne `from` ; un premier `grep import.*from` ratait `close.ts`/`digest.ts` dans `collect.ts`, lignes 19-22/28-29 multi-lignes — corrigé) |

**Tests rejoués (copie de rejeu, non-LLM) :**
- Suite Bell ciblée `node --test "apps/bell/test/*.test.ts"` ⇒ **81 pass / 0 fail** (duration ≈ 1,55 s ; exit 0).
- Portes racine `test/ci-gates.test.ts` + `test/export-public.test.ts` + `test/lang-gate-routing.test.ts` ⇒ exit 0 ; notamment **`fleet_register_built_set_is_frozen`** vert (built == {Shōgen,Hikae,Ukemi,Narabi} ; 12 autres upcoming) et **`series_pinned_are_declared_and_hashed`** vert.

**Verdict d'ensemble (thèse cartographiée) :** Bell est **entièrement `upcoming`**. AUCUN chemin servi n'existe
aujourd'hui (pas de route site `/bell/`, pas d'entrée `fleet.ts`/`Kane`, pas de VPS/DNS, `apps/bell` exclu de
l'export public). Le pipeline interne de collecte (faits i-iv + résidus) est **réellement exécuté** par un
oracle non-LLM (81 tests verts), mais son seul consommateur est un test/l'oracle ⇒ par la **règle de
branchement (KACIMI 2026-09-19, CA-11 durcie)**, aucune pièce de Bell n'est « built » : c'est cohérent et
**exact** avec tout registre public. La valeur de cette passe = (a) confirmer l'exactitude du registre dans
les deux sens, (b) grader chaque paire producteur→consommateur, (c) chiffrer les tuyaux **absents/annoncés**
et les dettes ouvertes sur l'arbre fusionné (toutes déjà des **items formés** dans les G7 fusionnés, et
toutes en cours de correction dans `-b1-bis-i` non fusionné).

---

## 1. Graphe réel des composants Bell (imports MESURÉS + flux à l'exécution)

### 1.1 Arêtes d'import internes `apps/bell/src/*` (mesurées, arbre committé)

Producteur (module importé) → consommateur (module importateur) :

| Module (exporte) | Importé par (dans `apps/bell/src`) |
|---|---|
| `pools.ts` (POOLS, XSTOCKS, PoolRef) | `collect.ts`, `rpc.ts`(type), `ethereum.ts`(type), `rebase-scan.ts` (importeurs DIRECTS mesurés ; transitif non compté) |
| `sessions.ts` (classifySession, refCloseDateOf, etWallClockToUtcMs) | `collect.ts`, `close.ts`, `halts.ts` |
| `reason-canon.ts` (canonReason) | `halts.ts` |
| `rpc.ts` (signaturesUntil, extractPoolSwap, swapsForPool, SwapFill) | `collect.ts`, `gap.ts`, `halts.ts`(type), `volume.ts`, `ethereum.ts`(type), `rebase-scan.ts` |
| `gap.ts` (sessionGap, sessionGapRebase, exceeds, vwapDecimal, GAP_PRECISION) | `collect.ts`, `ethereum.ts`, `volume.ts` |
| `halts.ts` (rowsFromCsv, haltDelta, census, haltsSince, HaltResidue) | `collect.ts`, `residuals.ts`(type) |
| `volume.ts` (poolVolumeBase, consolidatedAdv, volumeToAdvRatio) | `collect.ts` |
| `rebase-trajectory.ts` (multiplierAtMs/Sec, replayTriplet, overwrittenPending, constantMultiplierOver, f64BitsHexLE) | `collect.ts`, `supply.ts` |
| `supply.ts` (readMintToken2022, porStatus, wrapperStatus, rebaseForMint, rebaseGate, rebaseGateFromMint, rebaseGateFromTrajectory, RebaseGate) | `collect.ts` |
| `residuals.ts` (newResidualCounts, RESIDUAL_CODES, Residual) | `collect.ts`, `supply.ts`(type) |
| `digest.ts` (buildDigest, bellSha, assertNoClose, canonical, provenance, CashCross) | `collect.ts`, `close.ts` |
| `close.ts` (readReferenceCloses, earliestPublishUtc, databentoGet, polygonGet, DatabentoGet, PolygonGet) | `collect.ts` |
| `quorum.ts` (quorum2, statusOf, signaturesSetKey, BudgetExceededError, NoQuorumError…) | `collect.ts`, `close.ts`, `rebase-scan.ts` |
| `operators.ts` (operatorOf) | `collect.ts`, `quorum.ts`, `rebase-scan.ts` |
| `rebase-scan.ts` (runRebaseScanCli, eventsFromTx…) | `collect.ts` |
| `ethereum.ts` (liveEthSwaps, decodeV3Swap, ethSwapToFill, ethVwap) | `collect.ts` |
| `coverage.ts` (coverageDecision, foundingCourseCostFloorSigs) | **AUCUN module src** — seulement `test/collect.test.ts` (orphelin servi, cf. §6) |

**Hub** = `collect.ts` (importe **15** modules internes, `collect.ts:15-33` + 1 cross-app `:31`). C'est le seul point où les faits i-iv sont
assemblés en digest/state (fonction pure `collect()`, `collect.ts:98-260`) et où le pipeline live est composé
(`runMain` `collect.ts:501-575`, `main` `:578-579`).

### 1.2 Arêtes cross-app (Bell → sentinel ; mesurées)

| Import | Fichiers Bell | Ce qui est réutilisé |
|---|---|---|
| `../../sentinel/src/rpc.ts` (`providerOf`, type `RpcCall`) | `collect.ts:31`, `operators.ts:11`, `quorum.ts:15`, `rebase-scan.ts:18`, `ethereum.ts:17` | dérivation domaine fournisseur (anti-fuite clé) |
| `../../sentinel/src/ukemi/rpc2.ts` (`makeUkemiPool`, `GET_LOGS_PROVIDERS`, `RpcError`, `LogEntry`) | `ethereum.ts:16` | quorum `getLogsRange` EVM (jambe Uniswap v3) |

**Arête inverse (mesurée) : RIEN hors `apps/bell` n'importe `apps/bell` ni ne lit sa sortie.** Les seules
références externes sont des **portes** qui scannent `apps/bell/src` comme périmètre (`scripts/grep-forbidden.mjs`,
`scripts/lang-gate.mjs`), l'exclusion de séries R-25 (`.github/workflows/ci.yml`, `test/ci-gates.test.ts:1114`)
et l'exclusion explicite de l'export (`test/export-public.test.ts:263`). Aucune surface ne consomme la **donnée**
de Bell.

### 1.3 Flux à l'exécution (qui écrit / lit quel fichier)

| Producteur | Artefact | Où il vit | Consommateur réel |
|---|---|---|---|
| `collect()`/`runMain` | `state.json`, `timeline.jsonl`, `journal.json`, `provenance.json` | **hors dépôt** (`--out`, défaut `F:/tmp/bell-out` ; `assertOutsideRepo` `collect.ts:504`) | (test) `bell_close_databento_replays_synthetic_fixture` les relit ; `bell-report.mjs` lit les `state.json` — **aucune surface servie** |
| `runRebaseScanCli` | `rebase-probe.json` | hors dépôt (`rebase-scan.ts:246-248`) | **aucun in-repo** — sonde seule ; **s'arrête AVANT les corps** (C-V-2) |
| Course scan d'autorité (décision 60, hors dépôt `F:\PRODUITS\…\bell-b3a-raws`) | `test/fixtures/series/rebase/rebase-{TSLAx,SPYx,NVDAx,AAPLx}.json` (committés, sha-pinnés) | dépôt (racine séries exclue R-25) | `rebase-course.test.ts` (rejeu via le **gate**) — **PAS** `loadTrajectories`/`collect()` (incompatibilité de forme, cf. §6/CARTO-B-3) |
| Course réduite week-end (hors dépôt) | `test/fixtures/series/tslax-weekend-fills.jsonl` + `tslax-mint-token2022.json` (committés) | dépôt (exclu R-25) | `collect()` via `bell_collector_replays_fixture_bit_identical` (rejeu bit-identique → sha épinglé) |
| Spike `-b1` (hors dépôt) | `test/fixtures/series/spike/spike-*.json` | dépôt (exclu R-25) | docs d'escalade + `series_pinned_are_declared_and_hashed` |
| `bell-report.mjs` | `docs/MESURE-FONDATRICE-bell-2026-09.md` | **non produit** (aucune course fondatrice fusionnée) | T-3 (absent) |

---

## 2. Statut par paire producteur → consommateur

Barème (règle de branchement, CA-11 durcie) : **câblé** = chemin **servi** + test d'intégration non-LLM
exécutant la composition depuis l'artefact d'entrée réel ; **fixture** = consommé seulement par un
test/fixture (sous-gradé : *série-réelle-exécutée* / *entrée-synthétique-exécutée* / *regex-sur-source*) ;
**absent** = tuyau annoncé sans code.

### 2.A Arêtes CÂBLÉES (chemin servi = porte CI ; consommateur réel d'un artefact Bell aujourd'hui)

| Producteur → consommateur | Statut | Preuve (test qui EXÉCUTE la composition) |
|---|---|---|
| `apps/bell/src/**` → `scripts/grep-forbidden.mjs` (porte `gate:vocab`, interdits D1/D5) | **câblé** | `bell_vocab_scope_reddens` (`apps/bell/test/bell.test.ts`) exécute le scanner sur `apps/bell/src` et prouve le rougissement ; servi par le job CI `g3` (`npm run gate:vocab`) ; périmètre déclaré `vocab-banned.json:123-133` (`dirs:["apps/bell/src"]`) |
| `apps/bell/**` → `scripts/lang-gate.mjs` (scope anglais « bell ») | **câblé** | `test/lang-gate-routing.test.ts:21,27,30` exécute `classifyScope("apps/bell/src/x.ts")=="bell"` (+ mutant : supprimer la branche `apps/bell` re-route en `root`) ; servi par CI |
| `apps/bell/test/fixtures/series/**` → exclusion R-25 (`ci.yml`) + déclaration/hash same-dir | **câblé** | `series_pinned_are_declared_and_hashed` (racine, **rejoué VERT**) ; pathspecs `ci.yml:63-65` |
| `apps/bell` → **exclusion** de l'export public (`scripts/export-public.mjs`) | **câblé (négatif)** | `test/export-public.test.ts:263-266` : `apps/bell` absent de `APP_PACKAGE_DIRS`/`WHITELIST_DIRS` ⇒ un token français dans `apps/bell/src` rougit en CI |

> Ces 4 arêtes consomment le **source/les fixtures** de Bell comme entrée de porte (lint/gate), **pas** la
> **donnée** produite par `collect()`. Ce sont les seuls consommateurs servis d'un artefact Bell à ce jour.

### 2.B Arêtes INTERNES du pipeline de données (statut = **fixture** ; aucun chemin servi en aval)

| Producteur → consommateur | Sous-grade | Preuve |
|---|---|---|
| série réduite `tslax-weekend-fills.jsonl`(+mint) → `collect()` → digest | **fixture / série-réelle-exécutée** | `bell_collector_replays_fixture_bit_identical` (`collect.test.ts:71`) : `collect()` sur la série réelle sha-pinnée → `bellSha == PINNED_BELL_SHA` ; un octet ⇒ rouge |
| `halts.ts` (`rowsFromCsv`/`haltDelta`) + fills réels → `collect()` → `halt_deltas` | **fixture / série-réelle-exécutée** | `bell_halt_delta_brackets_real_fills_integration` (`collect.test.ts:599`) : CSV synth réel-formé + fills série → `collect()`, 1 bracket/token-chaîne, mutant borne +30 s |
| `rebase-*.json` (course d'autorité) → `rebaseGateFromTrajectory` | **fixture / série-réelle-exécutée** | `bell_rebase_course_replays_bit_identical` (`rebase-course.test.ts`) : rejeu bit-à-bit des 4 séries via fonctions de prod (`replayTriplet`/gate). **Ne passe PAS** par `collect()` (cf. CARTO-B-3) |
| `close.ts`(`readReferenceCloses`) + `rpc.ts` + trajectoire fichier → `runMain` → `state.json`/`provenance.json` | **fixture / entrée-synthétique-exécutée** | `bell_close_databento_replays_synthetic_fixture` (`collect.test.ts:634`) : **exécute `runMain(argv, deps)`** offline (corps RPC synthétiques déclarés + trajectoire **écrite à la main** `:654` + CSV halts) et **assert sur les artefacts produits** (`state.json`/`provenance.json`), jamais regex sur le source |
| `supply.ts` (`readMintToken2022`/`porStatus`/`wrapperStatus`/`rebaseForMint`) → `collect()` (iv + gate) | **fixture / entrée-synthétique-exécutée** | `bell_por_staleness_and_wrapper_rate`, `bell_mint_read_failure_abstains_fail_closed`, `bell_abstentions_counted` (SymbolInput façonnés en test) |
| `volume.ts` (`volumeToAdvRatio`) → `collect()` (iii) | **fixture / entrée-synthétique-exécutée** | `bell_ratio_killer_adv_and_unit` (`collect.test.ts:338`) + wiring dans `collect()` `:178-190` ; `bell_volume_dedup_by_signature` (`bell.test.ts:133`) exécute `swapsForPool` avec un `call` injecté (dédup sig ⇒ 2 fills) |
| `gap.ts` (`sessionGap`) → digest (i) | **fixture / entrée-synthétique-exécutée** | `bell_session_gap_identical_to_replay` (`bell.test.ts:159`) : `digestFrom([masqué])` ×2 ⇒ `bellSha` égal, aucun champ `close` |
| `buildSolanaSymbol` (seam live) → `collect()` | **fixture / entrée-synthétique-exécutée** | `bell_symbol_build_mint_quorum_fail_unverified` (`rebase-gate-gt.test.ts:107`) exécute `buildSolanaSymbol` avec stub (mint no-quorum ⇒ `rebase_unverified`, pas de gT) |
| `digest.ts` `assertNoClose`/`bellSha`/`canonical` → tous | **fixture / entrée-synthétique-exécutée** | `bell_close_field_reddens`, `bell_canonical_key_order_invariant`, `bell_close_guard_catches_camelcase`, re-pin par soustraction `bell_pinned_sha_reduces_to_b3a_by_subtraction` |
| `residuals.ts` (`newResidualCounts`/`RESIDUAL_CODES`) → `collect()` (compteur unique) | **fixture / entrée-synthétique-exécutée** | `bell_residual_map_is_single_source` : `collect()` exécuté ⇒ map résiduel du digest ET du state == set fermé (source runtime unique) |

**Résiduel regex-sur-source :** sur 8 « wiring proofs » `assert.match(SRC,…)` dans `collect.test.ts`, **7 ont
désormais un pendant exécutant** (`runMain` `:661`, `buildSolanaSymbol` `rebase-gate-gt:107`) ; **il reste 1**
purement regex : `collect.test.ts:473` (`main().catch(...fatalMessage)`). Observation, pas dette (CARTO-B-8).

### 2.C Arêtes ABSENTES (tuyau annoncé, aucun code sur l'arbre fusionné)

| Tuyau annoncé (ADR) | Statut | Preuve d'absence |
|---|---|---|
| publication `state.json`/`timeline.jsonl` → **panneau site `/bell/`** (T-1b, ADR-B0 D4) | **absent** | aucun fichier `apps/site/**bell**` (glob = 0) ; test `bell_panel_reads_published_state` **absent** (grep) |
| parité rebase/surplus → `timeline` (T-2, ADR-B0 D4) | **absent** | test `bell_parity_surplus_matches_recompute` **absent** ; jambe T-2 |
| `fromSessionGap` → **gate** classe `tsv-offhours-gap-24h` (T-3, ADR-B0 D3/D4) | **absent** | aucun adaptateur ; sérialisé après U-4 |
| entrée `fleet.ts` capteur **« Kane »** `upcoming` (T-1b, ADR-B0 D4 décision 11) | **absent** | `fleet.ts` : 0 occurrence bell/kane ; `fleet_register_built_set_is_frozen` VERT (11 agents, Kane non inscrit) |
| VPS `bell.monarkgate.tech` / Caddy / DNS (T-1b, ADR-B0 D8) | **absent** | `deploy/**` : 0 occurrence `bell` |
| **producteur** de la forme trajectoire `{SYMBOL:{events,scanComplete}}` de `loadTrajectories` | **absent (fusionné)** | `runRebaseScanCli` écrit `rebase-probe.json` seulement (`rebase-scan.ts:221,248`) — cf. CARTO-B-3 ; ajouté dans `-b1-bis-i` (`rebase-produce.ts`, non fusionné) |
| flux **MWCB** (condition H) → fichier séance (T-1b) | **absent** | ADR-T1aii tuyau -b3b = « ABSENT (item formé, bloquant release) » ; PR-B-8 — cf. CARTO-B-4 |

**Comptes d'arêtes :** câblé = **4** (portes CI, dont 1 négative) ; fixture = **11** (série-réelle-exécutée 3 =
§2.B lignes 1-3 ; entrée-synthétique-exécutée 7 = §2.B lignes 4-10 ; regex-seul 1 = `collect.test.ts:473`) ;
absent = **7** (tuyaux T-1b/T-2/T-3 + producteur trajectoire + MWCB).

---

## 3. Faits témoins D2 (i-iv) + résiduels : producteur / fichier publié / surface / test e2e

Tests cités **rejoués VERTS** (suite Bell, 81/81). « fichier publié » et « surface » sont **NON** partout : la
publication est T-1b (aucune sortie sous l'arbre, `--out` hors dépôt, CA-11).

| Élément | (a) producteur réel | (b) fichier publié | (c) surface qui lit | (d) test d'intégration e2e (rejoué) |
|---|---|---|---|---|
| **i — écart de session g_t** | `gap.ts sessionGap/sessionGapRebase` via `collect()` `:171-174/165-168` | **non** (hors dépôt) | **non** | ✔ `bell_collector_replays_fixture_bit_identical` (série réelle→collect→sha) ; ✔ `bell_session_gap_identical_to_replay` ; ✔ `bell_close_databento_replays_synthetic_fixture` (runMain, gT = ln([masqué]/[masqué])) ; g_t **rebase-aware** ✔ `bell_gt_trajectory_known_integration` / `bell_gt_rebase_direction_m2` / `bell_gt_constant_m_neq_1_defect` — mais depuis trajectoire **façonnée** (CARTO-B-3) |
| **ii — delta de halt** | `halts.ts haltDelta/haltsSince` via `collect()` `:211+` | **non** | **non** | ✔ `bell_halt_delta_brackets_real_fills_integration` (CSV réel-formé + fills série → `collect()`) ; ✔ même chemin via `runMain`/`BELL_HALTS_CSV` (`collect.test.ts:675-677`). N.B. témoin **n = 0** sur l'univers 24/7 recensé (position, pas mesure) — CSV de test synthétique déclaré |
| **iii — volume par pool vs plafond** | `volume.ts poolVolumeBase/consolidatedAdv/volumeToAdvRatio` via `collect()` `:178-190` | **non** (ratio seul, ADV jamais en clair, C-6) | **non** | ✔ `bell_ratio_killer_adv_and_unit` (ADV≠⇒ratio≠ ; `multiplier_unit`) ; ✔ `bell_volume_dedup_by_signature` (dédup par signature) |
| **iv — supply vs PoR / parité** | `supply.ts readMintToken2022/porStatus/wrapperStatus` via `collect()` `:192-203` | **non** | **non** | ✔ `bell_por_staleness_and_wrapper_rate` ; ✔ `bell_mint_readout_preserves_scaled_fields`. **Structurellement abstenu** : `por_unavailable` (aucune source PoR 1re main) + `no_wrapper` + TSLAon Ondo = abstention (API 403) — honnête par conception |

### 3.bis Résiduels publiés — enum fermé `RESIDUAL_CODES` (17 codes) : compté dans `state.json` ?

Source unique `residuals.ts` (5 halt + 12 collector), liée au type `HaltResidue` (`residuals.ts:51-57`) ;
`bell_residual_map_is_single_source` + `bell_abstentions_counted` (état == digest) VERTS.

| Résiduel | Producteur | Compté dans `state.json` (chemin servi `collect()`) ? | Test (rejoué) |
|---|---|---|---|
| `rebase_unverified` | `supply.rebaseForMint/rebaseGate` | **OUI** `collect.ts:129` | ✔ `bell_rebase_unverified_abstains_sessions`, `bell_mint_read_failure_abstains_fail_closed` |
| `cash_cross_mismatch` | `close.readReferenceCloses` | **OUI** `collect.ts:142` | ✔ `bell_cash_cross_mismatch_is_a_named_residual`, `bell_read_reference_closes_cross_matched_mismatch_unavailable`, `bell_close_databento_replays_synthetic_fixture` |
| `cash_cross_unavailable` | idem | **OUI** `collect.ts:154` | ✔ mêmes |
| `no_close_ref` (V-7) | `collect()` | **OUI** `collect.ts:149` | ✔ `bell_no_close_ref_is_a_named_residual` |
| `no_quorum`, `quorum_sampled` | reader/`quorum2` | **OUI** via `s.fillsResidues` `collect.ts:110` | ✔ `bell_no_quorum_on_single_provider`, `bell_abstentions_counted` |
| `por_unavailable`/`por_stale`/`no_wrapper`/`multiplier_unit` | `supply`/`volume` | **OUI** `:190/198/199/202` | ✔ `bell_abstentions_counted` |
| halts (`resume_time_missing`, `resume_date_gt_halt_date`, `no_fill_in_window`, `reason_unknown`, `block_ts_vs_submission`) | `halts.haltDelta` | **OUI** `:219-224` | ✔ `bell_abstentions_counted` |
| **`authority_scan_mono_operator`** | `supply.rebaseGateFromTrajectory(...,"authority")` `supply.ts:173` | **NON** — jamais incrémenté (cf. CARTO-B-2) | émission testée par ✔ `bell_rebase_authority_residuals_named_and_gated` (**appel direct**, hors `collect()`) |
| **`set_authority_unscanned`** | idem | **NON** — jamais incrémenté (CARTO-B-2) | idem |

⇒ **15/17 résiduels comptés sur le chemin servi ; 2 (authority) dans l'enum fermé mais structurellement
jamais comptés** dans un `state.json` (double blocage : `buildSolanaSymbol` ne passe pas `scanMethod` ⇒
`residuals=[]` ; et `collect()` n'aspire jamais `rb.residuals`). Preuve = CARTO-B-2.
`projection_not_computable` (émis par `coverage.ts`) est un enum **distinct** (décision de couverture), **hors**
`RESIDUAL_CODES` — cohérent (coverage = fixture-only, cf. §6), pas une fuite.

---

## 4. Comparaison au registre public (exact ? écarts dans les deux sens)

| Registre / surface | Ce qu'il dit de Bell | Exact vs graphe ? |
|---|---|---|
| `apps/site/lib/fleet.ts` | **RIEN** — 11 agents {Shōgen,Hikae,Ukemi(built), Narabi(built), Mokugeki,Kaihi,Kessai,Kamae,Kyokusen,Koyomi,Genkan(upcoming)} + 5 produits upcoming ; Kane/Bell **non inscrit** | **EXACT** — Bell n'a aucun chemin servi ⇒ ni « built » ni même « upcoming » registré (l'ADR B0 prévoit l'ajout de « Kane » upcoming **à T-1b**). `fleet_register_built_set_is_frozen` VERT |
| `README.md` | ligne 41 : « **4 built · Narabi runs · 7 named** » ; aucune mention Bell/Kane (les hits grep « bell » = « la**bell**ed »/« em**bell**ished », faux positifs) | **EXACT** — pas de sur-déclaration ; le compte 4/7 reste vrai tant que T-1b n'a pas ajouté Kane |
| `skills/` | 1 seul skill `monark` ; **aucun** skill/mention Bell | **EXACT** |
| `scripts/export-public.mjs` | `apps/bell` **absent** de `APP_PACKAGE_DIRS=[apps/harness,apps/sentinel]` et `WHITELIST_DIRS=[schemas,fixtures,enforcement,apps/site,skills]` | **EXACT** — Bell non public avant T-1b (test `export-public.test.ts`) |
| `deploy/**` | rien pour `bell.monarkgate.tech` | **EXACT** — VPS = action sortante T-1b sous go |
| G7 fusionnés (`-b1`,`-b3a`,`-b3b`) | « Nothing declared built ; Bell stays `upcoming` (absent de fleet.ts/README/site/skills) » ; items formés déclarés | **EXACT** — les 3 G7 déclarent les mêmes lacunes que §7, comme items formés |
| ADR-B0 / ADR-T1aii | Bell `upcoming` jusqu'à la Définition de fini (≥ après T-2) ; MWCB/census Ondo bloquants release | **EXACT** |

**Aucun écart de sur-déclaration.** Aucun écart de sous-déclaration constituant un défaut : le fait que du code
Bell substantiel et vert (81 tests) soit **entièrement `upcoming`** est **correct** au regard de la règle de
branchement (pas de chemin servi). Le registre public est **exact dans les deux sens**.

---

## 5. Tuyaux DÉCLARÉS vs RÉELS (par ADR/G0 de lot fusionné)

| Tuyau déclaré (entrée→sortie/état/test) | Source | Réel sur `lot/etude-suite` | Verdict |
|---|---|---|---|
| collecte→digest T-1a (`bell_session_gap_identical_to_replay`, `bell_volume_dedup_by_signature`, `bell_por_staleness_and_wrapper_rate`) | ADR-B0 D4 | Les 3 existent + verts (le 1er aussi renommé `bell_collector_replays_fixture_bit_identical`) | **CÂBLÉ-fixture** (série réelle exécutée) — mais sortie hors dépôt, non servie |
| collecteur→`state.json`/`timeline.jsonl` (`bell_collector_replays_fixture_bit_identical`, `bell_abstentions_counted`, `bell_no_close_ref_is_a_named_residual`, `bell_journal_and_provenance_carry_no_key`) | ADR-T1aii -a | tous présents + verts | **fixture** (exécutée) |
| gate rebase→g_t (`bell_gt_trajectory_known_integration`, producteur trajectoire, C-3 anchor) | ADR-T1aii -b3a | flag `--rebase-trajectory` consommé (`collect.ts:524-531`) ; **producteur in-repo ABSENT** ; C-3 anchor **manquant** ; `scanMethod` **non passé** | **PARTIEL** — items formés CARTO-B-1/2/3 |
| close Databento→collect + croisement Massive (`bell_close_databento_replays_synthetic_fixture`, `bell_cash_cross_mismatch_is_a_named_residual`) | ADR-T1aii -b3b | présents + verts ; `runMain` exécuté e2e | **fixture** (entrée synthétique exécutée) |
| halt CSV+fills→bracket (`bell_halt_delta_brackets_real_fills_integration`) ; séances→calendrier NYSE (`bell_sessions_match_primary_nyse_calendar`) | ADR-T1aii -b3b | présents + verts | **fixture** (série réelle exécutée) |
| MWCB→fichier séance (T-1b) | ADR-T1aii -b3b | « ABSENT (item formé, bloquant release) » | **ABSENT** = CARTO-B-4 (item formé PR-B-8) |
| publication→panneau `/bell/` (`bell_panel_reads_published_state`) | ADR-B0 D4 (T-1b) | absent | **ABSENT** par plan (T-1b) |
| parité→timeline (`bell_parity_surplus_matches_recompute`) | ADR-B0 D4 (T-2) | absent | **ABSENT** par plan (T-2) |
| Prediction→gate (T-3) | ADR-B0 D4 (T-3) | absent | **ABSENT** par plan (T-3, après U-4) |

**Aucun tuyau annoncé manquant sans item formé** : gate→g_t (producteur/C-3/scanMethod), MWCB et census Ondo
sont **pré-formés** (déclencheur+propriétaire dans les G7/ADR ; cf. §7). Pas de « dû » nu. (La jambe EVM **live**
non composée en test n'est pas un tuyau ADR manquant mais une lacune de couverture **formée par cette passe**,
CARTO-B-6.)

---

## 6. Pièces orphelines / code mort / runners hors dépôt

1. **`coverage.ts`** (`coverageDecision`, `foundingCourseCostFloorSigs`) — importé par **aucun module src**,
   seulement `collect.test.ts:16`. Consommateur servi = décision de couverture de `-b1-bis` (règle de
   branchement). État : **`upcoming` (fixture-only)** — déclaré tel quel ADR-T1aii D1-ter. Test vert
   `bell_c5_coverage_projection_over_threshold_top20`. **Pas mort** (item avec consommateur aval nommé).
2. **Jambe Ethereum LIVE orpheline** — `ethereum.liveEthSwaps` → `sentinel/ukemi/rpc2.makeUkemiPool.getLogsRange`
   est **importé mais aucun test ne pilote `runMain --eth`** (le test `runMain` utilise `--pools TSLAx`).
   Seuls `decodeV3Swap`/`ethSwapToFill`/`ethVwap` sont exécutés (`bell_eth_v3_swap_decode_and_vwap`, vecteur
   TSLAon/USDC réel). ⇒ **décode = fixture-exécuté ; composition live EVM = jamais exécutée.** Observation
   CARTO-B-6 (lot porteur -b2b, qui possède déjà C-G2-7 budget EVM).
3. **`runRebaseScanCli`** — écrit `rebase-probe.json` et **s'arrête avant les corps** (C-V-2, coût crédit/appel
   `getTransactionsForAddress` non trouvé) ; ne produit **pas** la trajectoire consommée par le chemin servi.
   Sonde-seule ; consommateur = producteur `-b1-bis`. Non mort, mais **producteur manquant** (CARTO-B-3).
4. **Runners hors dépôt dont dépend une preuve (précédent C-G2-2 -b3a, « runner off-repo sha-pin »)** :
   `rebase-*.json` et `tslax-weekend-fills.jsonl` sont des preuves dont le **producteur** est une course hors
   dépôt (scan d'autorité `F:\PRODUITS\…\bell-b3a-raws` ; `runRebaseScanCli` fusionné s'arrête à la sonde). G7-b3a
   liste « runner off-repo sha-pin » comme item formé. ⇒ CARTO-B-7 (corrigé dans `-b1-bis-i` : « in-repo scanner
   reproduces the 4 pinned series », commit `9033670`).
5. **Champs de série non consommés par le chemin servi** — `rebase-*.json` porte `multiplier_at`, `founding_window_gate`,
   `gate_detail`, `quorum_reads`, `oracle_triplet`… lus seulement par `rebase-course.test.ts` (type `Series`
   snake_case). Métadonnées de preuve, pas orphelines au sens code mort, mais **shape-incompatibles** avec
   `loadTrajectories` (CARTO-B-3).
6. **Flags CLI (rien de mort)** — tous les flags de `parseArgs` sont déstructurés/consommés dans `runMain`
   (`collect.ts:502`) ; `--eth`/`--eth-from-block`/`--eth-to-block` consommés mais **jamais exercés par un
   test** (→ CARTO-B-6) ; `--rebase-scan` consommé ⇒ `runRebaseScanCli` sonde-seule ; `--rebase-trajectory`
   consommé par `loadTrajectories`. **Aucun flag CLI mort.**

Aucun **export mort** trouvé (tous les exports src sont importés par ≥ 1 module src ou test) hormis le cas
`coverage.ts`/jambe EVM ci-dessus.

---

## 7. Dettes — liste fermée CARTO-B-n

> **CARTO-B-1..5 et B-7 sont PRÉ-formés** (items avec déclencheur + propriétaire déjà dans les G7/ADR
> fusionnés) ; **CARTO-B-6 et B-8 sont formés PAR CETTE PASSE** (constats nouveaux — déclencheur + lot
> porteur assignés ici). Aucun « dû » nu. La cartographie mesure toutes ces lacunes **encore ouvertes sur
> l'arbre fusionné** et constate la **correction en cours** dans le worktree `-b1-bis-i` (non fusionné).

| # | Sévérité | Constat (preuve fichier:ligne) | Correction proposée | Lot porteur |
|---|---|---|---|---|
| **CARTO-B-1** | à corriger **avant -b1-bis** (aucune g_t fondatrice avant) | **Fail-open C-3 sur le seam servi** : `collect.ts:467-469` — quand `trajectory` (fichier) ET `mint` (lecture live) sont présents, le gate est décidé sur `trajectory.events` **seuls** ; les bits du multiplicateur du mint live ne sont **jamais** comparés (`trajectory && mint` = simple test de présence). Le commentaire `:465` « the C-3 oracle anchor » est **FAUX** (item ADR-T1aii `:283-290`, `error_origin` rédacteur -b3a). | Ancrer C-3 dans `buildSolanaSymbol` (état mint base64 quorum-2, `replayTriplet(events)` == état, comparaison sur les bits ; divergence ⇒ `rebase_unverified`) | **-b1-bis-i** (diff ajoute `stateAnchorMatches`/`decodeStateConfig`/`replayTriplet`) |
| **CARTO-B-2** | à corriger **avant -b1-bis** | **`scanMethod` non passé + `gate.residuals` non aspirés** : `collect.ts:468` appelle `rebaseGateFromTrajectory(events,…)` **sans** `scanMethod` ⇒ `supply.ts:173` renvoie `residuals=[]` ; et `collect()` `:160-170` ne fait **aucun** `for(r of rb.residuals) bump(r)`. ⇒ `authority_scan_mono_operator` + `set_authority_unscanned` (enum `residuals.ts:34-38`) **jamais comptés** dans un `state.json`. | Rendre `scanMethod:"authority"` requis dans `TrajectoryInput`/`loadTrajectories`, le passer au gate, aspirer `rb.residuals` en compteur + `rebase_residuals` par gap | **-b1-bis-i** (diff ajoute `scanMethod` requis + `for(r of gateResiduals) bump(r)`) |
| **CARTO-B-3** | à corriger **avant -b1-bis** (CA-11 durcie : entrée façonnée à la main interdite) | **Producteur de trajectoire absent + série réelle shape-incompatible** : `loadTrajectories` `collect.ts:479-488` exige `{SYMBOL:{events(array),scanComplete(bool)}}` (camelCase) ; la série réelle `rebase-*.json` est un **objet par-mint** avec `scan_complete` (snake_case) + métadonnées ⇒ rejetée ⇒ `{}` ⇒ `rebase_unverified`. Aucun producteur in-repo n'émet la forme attendue (`runRebaseScanCli` = sonde seule). Le g_t-de-trajectoire e2e n'est prouvé que depuis une trajectoire **écrite à la main** (`collect.test.ts:654`). | Producteur in-repo qui convertit la série scan → forme `loadTrajectories` (+ `scanMethod`) + test d'intégration exécutant série réelle → `collect()` → g_t | **-b1-bis-i** (diff ajoute `rebase-produce.ts` + `discover.ts` + fixtures `founding/discovery-*.json`) |
| **CARTO-B-4** | **BLOQUANT release** | **MWCB (condition H) ABSENT** : ADR-T1aii tuyau -b3b = « ABSENT (item formé, bloquant release) » ; aucune constante, aucun test ; le CSV NYSE ne porte 0 ligne market-wide. | Procurement **PR-B-8** (feed SIP CTS/UTP MWCB ou archive tierce) puis fichier séance T-1b | procurement mainteneur → T-1b |
| **CARTO-B-5** | **BLOQUANT release** (décision 19) | **Census Ondo non établi 1re main** : API Ondo 403 (PR-B-ONDO, ADR-B0 §Procurement) ; univers Ondo GM non recensé ⇒ part de marché non publiée. | Procurement **PR-B-ONDO** (clé API) + Polygon `v3/reference/tickers` | procurement mainteneur → census T-1a-ii |
| **CARTO-B-6** | observation (**formée par cette passe** ; avant publication de la jambe EVM) | **Jambe Ethereum live jamais composée en test** : `ethereum.liveEthSwaps`→`makeUkemiPool.getLogsRange` importé, aucun `runMain --eth` piloté ; seul le décodeur v3 est exécuté (§6.2). | Test d'intégration `runMain --eth` sur logs Uniswap v3 façonnés hors ligne | **-b2b** (livre la course EVM ; C-G2-7 y couvre le budget `--max-calls` de la jambe ETH, **PAS** cette couverture de test) |
| **CARTO-B-7** | observation | **Preuves dépendantes d'un runner hors dépôt** (précédent C-G2-2) : `rebase-*.json`/`tslax-weekend-fills.jsonl` produits hors dépôt ; `runRebaseScanCli` fusionné s'arrête à la sonde. | Scanner in-repo reproduisant les séries sha-pinnées | **-b1-bis-i** (commit `9033670` : « in-repo scanner reproduces the 4 pinned series ») |
| **CARTO-B-8** | observation (mineure, **formée par cette passe**) | **1 wiring-proof résiduel regex-sur-source** : `collect.test.ts:473` (`main().catch(...fatalMessage)`), non doublé d'une exécution. | Couvrir via l'exécution `runMain` (le reste des 8 regex est déjà doublé) | -b1-bis ou ultérieur |

**État de correction (worktree `-b1-bis-i`, NON fusionné — cartographié « à venir ») :** le diff restreint à
`apps/bell` vs merge-base `5c29871` = **14 fichiers, +1292 / −27** (ajouts : `discover.ts` 255 l.,
`rebase-produce.ts` 176 l., `collect.ts` +92, tests `discover.test.ts`/`rebase-produce.test.ts`, fixtures
`founding/discovery-*.json`). Les lignes **ajoutées** ciblent CARTO-B-1 (`stateAnchorMatches` lit
`ScaledUiAmountConfig` base64 quorum-2 et compare `replayTriplet(events)` à l'état), CARTO-B-2
(`TrajectoryInput.scanMethod:"authority"` requis ; `loadTrajectories` DROP sans lui ; `for(r of gateResiduals)
bump(r)` + `rebase_residuals` par gap), CARTO-B-3 (`rebase-produce.ts` producteur + `discover.ts`), CARTO-B-7
(scanner in-repo). **Cette passe vérifie que le diff AJOUTE ce code (lignes citées) ; la couverture réelle
(ex. un test pilotant trajectoire-contredit-mint-live ⇒ `rebase_unverified` via `buildSolanaSymbol`) est à
établir au G2/checkpoint-2 de `-b1-bis-i` (94 tests annoncés, `docs/G2-lot-t1a-ii-b1-bis.md`), PAS ici.**
CARTO-B-4/5 (MWCB, census Ondo) restent des procurements bloquants **non** couverts par `-b1-bis-i`.

---

## 8. Ce que cette cartographie n'a PAS pu établir (limites)

1. **Couverture réelle du worktree `-b1-bis-i`** : je n'ai pas fait `npm ci`/tests dans `F:\Monark-wt-bellb1bis`
   (worktree séparé, non fusionné). J'ai vérifié que le **diff ajoute** le code ciblant CARTO-B-1/2/3/7 (lignes
   citées) mais **pas** que ses tests exercent bien la contradiction trajectoire↔mint. → checkpoint-2 -b1-bis-i.
2. **Validité on-chain des faits** : je n'ai lancé aucun appel réseau (Helius/Chainstack/Polygon/Databento). Les
   séries `rebase-*.json`/spike/founding sont prises telles que committées (sha-pinnées) ; leur exactitude
   first-hand relève des courses -b1/-b3a (hors dépôt), non re-mesurée ici.
3. **Sortie live de `collect()`** : le seul e2e `runMain` utilise des **corps RPC synthétiques déclarés** + une
   trajectoire **écrite à la main** + un CSV halts synthétique ; aucune exécution contre la donnée fondatrice
   réelle (par conception : CI offline). Le g_t fondateur n'existe pas encore (aucune course fusionnée).
4. **Portes CI complètes non toutes rejouées** : j'ai rejoué la suite Bell (81) + `ci-gates`/`export-public`/
   `lang-gate-routing`. Je n'ai **pas** rejoué `npm run lint`/`typecheck`/`gate:vocab` complet ni la suite
   racine entière (harness/sentinel), hors périmètre Bell.
5. **Contenu détaillé de `close.ts`/`digest.ts`/`quorum.ts`/`rebase-scan.ts`** lu partiellement (signatures +
   sections clés + tests verts), pas ligne à ligne intégralement — les affirmations portent sur ce qui est cité
   fichier:ligne et sur le comportement observé aux tests.
6. **Lecture des G0/PLI/CHECKPOINT de chaque sous-lot** faite par extraction ciblée (grep + G7 + ADR qui les
   plient), non intégrale ; les 2 ADR (B0, T1aii) et les 3 G7 fusionnés ont été lus en entier.

---

### RAPPORT FINAL (résumé machine)
- **Modèle résolu** : `claude-opus-4-8[1m]`
- **Commit cartographié** : `a81d4b3` (`lot/etude-suite`) ; worktree `-b1-bis-i` = `73077bb` (non fusionné)
- **Arêtes** : câblé **4** (portes CI) · fixture **11** (série-réelle 3 / synthétique-exécutée 7 / regex-seul 1) · absent **7** (T-1b/T-2/T-3 + producteur trajectoire + MWCB)
- **Registre public** : EXACT dans les deux sens (Bell entièrement `upcoming`, aucune sur/sous-déclaration défaut)
- **Dettes** : CARTO-B-1..8 (2 bloquants release : MWCB PR-B-8, census Ondo PR-B-ONDO ; 3 à corriger avant -b1-bis ; 3 observations) — toutes items formés
- **Tests rejoués** : 81/81 suite Bell VERTS + `fleet_register_built_set_is_frozen` + `series_pinned_are_declared_and_hashed` VERTS (0 rouge)
