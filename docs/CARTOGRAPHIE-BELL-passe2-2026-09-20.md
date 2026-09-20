claude-opus-4-8[1m]

# CARTOGRAPHIE DE BRANCHEMENT — MONARK Bell — passe 2 (delta sur l'arbre fusionné `f654151`)

> Worker Opus 4.8 à contexte frais. Sortie = donnée brute pour l'orchestrateur (R-21 : vérifiée
> adversarialement avant consommation). Lecture + rejeu de tests en **lecture seule** ; aucun fichier du
> dépôt modifié ; aucun commit ; aucun appel réseau. Jetons de close en clair **jamais** publiés : les
> nombres de close des fixtures de test sont **synthétiques** et masqués `[masqué]` ; les sha de digest sont
> des hachages, pas des closes.

## 0. Provenance & méthode (reproductible)

| Élément | Valeur |
|---|---|
| Modèle résolu (R-1) | **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` — vérifiable par l'orchestrateur) |
| Date | 2026-09-20 ; horloge lue `date -u` au démarrage **19:31:12 UTC**, à l'écriture **19:48:22 UTC** |
| Dépôt | `F:\Monark`, branche `lot/etude-suite`, HEAD **`f6541514c4dd5ea896f6de37d48fc4f2f7570bad`** (`f654151`) |
| Lot cartographié | -b1-bis-i, fusionné `--no-ff` `bda5805` (G7 `docs/G7-lot-t1a-ii-b1-bis.md` ACCEPTED) ; état courant `f654151` |
| Passe 1 (référence delta) | `docs/CARTOGRAPHIE-BELL-passe1-2026-09-20.md`, état `a81d4b3` (8 dettes CARTO-B-1..8) |
| Copie de rejeu | `git -C F:\Monark archive f654151 \| tar -x -C /f/tmp/carto-bell-2/` (extraction exit 0) ; `npm ci --cache F:/tmp/npm-cache` exit 0, node **v24.15.0** ; `TMP/TEMP=F:\tmp` |
| sha256 sources ajoutées | `rebase-produce.ts` = `9a4d234498b4b033d238d4703e4b1aa3ad7c729a9f0be9321f024d1c2378a230` ; `discover.ts` = `c033ea4d0717cafe5b8256a3dfc8bc7f5063d18f8b9533f3cf1744d73c4cdca3` |

**Tests rejoués (copie de rejeu, non-LLM ; rapporteur `spec` = `✔`/`ℹ`, PAS TAP) :**
- Suite Bell `node --test apps/bell/test/*.test.ts` ⇒ **94 pass / 0 fail** (exit 0, ≈ 0,50 s). *(La forme répertoire `node --test apps/bell/test/` échoue exit 1 — Node tente de charger le répertoire comme module « Cannot find module …apps\bell\test » : artefact d'invocation, PAS un échec de test ; la forme glob est autoritaire et reproduit la méthode passe 1.)*
- Portes racine `node --test test/ci-gates.test.ts test/export-public.test.ts test/lang-gate-routing.test.ts` ⇒ **30 pass / 0 fail** (exit 0) ; **`fleet_register_built_set_is_frozen`** VERT (built == {Shōgen,Hikae,Ukemi,Narabi}, 12 upcoming) + **`series_pinned_are_declared_and_hashed`** VERT.
- **CI complet indépendant** `npm run ci` sur la copie ⇒ **477 pass / 0 fail** (exit 0, 33,2 s) — confirme de première main le headline du G7 (477/477).
- **Vérification de première main CARTO-B-3** : `loadTrajectories("apps/bell/test/fixtures/series/rebase/rebase-SPYx.json")` ⇒ `keys: []` (série épinglée DROP ⇒ `{}` ⇒ `rebase_unverified`).

**Verdict d'ensemble.** Le lot -b1-bis-i **couvre effectivement CARTO-B-1, B-2 et B-3** (code au seam servi + tests d'intégration non-LLM exécutant la composition, tous verts) et **le cœur de B-7** (scanner d'autorité désormais in-repo). **B-7 reste PARTIELLE** (le volet `tslax-weekend-fills.jsonl` n'a pas de reproducteur committé). **B-4/B-5/B-6/B-8 sont hors périmètre du lot et inchangés.** Bell reste **entièrement `upcoming`** : aucune pièce du lot n'a de chemin servi, le registre public est **EXACT dans les deux sens**. Cette passe forme **une** nouvelle dette d'observation, **CARTO-B-9** (e2e mono-invocation producteur→`runMain` absent), portée par un lot du plan existant. **Aucun « dû » nu.**

---

## 1. Tableau des 8 dettes de la passe 1 — statut aujourd'hui (`f654151`)

| # | Statut | Preuve (fichier:ligne) | Test qui l'EXÉCUTE (rejoué) |
|---|---|---|---|
| **CARTO-B-1** (fail-open C-3 sur seam servi) | **CLOSE** | L'ancrage C-3 est réel : `buildSolanaSymbol` `collect.ts:513` calcule `anchored = trajectory && mint ? await stateAnchorMatches(...) : false` ; `:514-518` n'accorde `rebaseGateFromTrajectory` **que si `anchored`**, sinon `{status:"unverified"}`. `stateAnchorMatches` `collect.ts:468-489` lit `ScaledUiAmountConfig` base64 **quorum-2** et compare `replayTriplet(events, MAX)` à l'état live **sur les 3 champs de bits** (`mulBits`, `newBits`, `effTs`) ; toute divergence / `no_quorum` / décode illisible ⇒ `false`. Le commentaire faux « the C-3 oracle anchor » de la passe 1 a disparu. | ✔ **`bell_c3_anchor_stale_trajectory_is_unverified`** (`collect.test.ts:727`) : concordance ⇒ `trajectory_known` + 2 résiduels ; **stale** (update programmé posté après le scan, `newBits`/`effTs` diffèrent) ⇒ `unverified` ; **mulDiverge** (bits du multiplicateur courant diffèrent) ⇒ `unverified` (tue MINE1) ; état illisible ⇒ `unverified`. VERT. *(Réserve entrée : les cas de divergence utilisent un `TrajectoryInput` façonné `collect.test.ts:738` — coverage-équivalent car `loadTrajectories` est un parse pur et l'ancre vit dans le seam quelle que soit la provenance ; la concordance est EN PLUS prouvée depuis le fichier produit, `rebase-produce.test.ts:93-110`.)* |
| **CARTO-B-2** (`scanMethod` non passé + résiduels non comptés) | **CLOSE** | `TrajectoryInput.scanMethod:"authority"` **requis** `collect.ts:461` ; `loadTrajectories` `:536` accepte **seulement** `o.scanMethod === "authority"` (sinon DROP) ; `buildSolanaSymbol` `:516` **passe** `trajectory.scanMethod` au gate ; `collect()` aspire les résiduels : `:166` `gateResiduals = rb.status==="trajectory_known" ? rb.residuals : []`, `:174` `for (const r of gateResiduals) bump(r)`, `:177` liste `rebase_residuals` sur le gap (hors `CLOSE_KEY`). | ✔ **`bell_gate_residuals_counted_in_state`** (`collect.test.ts:775`) : `d.residuals.authority_scan_mono_operator == 1`, `set_authority_unscanned == 1`, `g.rebase_residuals == [...]`, `assertNoClose` OK. **CA-11 (composition depuis fichier produit)** : ✔ `bell_trajectory_producer_composition_from_file:123-125` compte les 2 codes dans `digest.residuals` via `collect()`. ✔ `bell_trajectory_producer_scanmethod_map_and_loader` (loader fail-closed). VERTS. *(Réserve : l'ADR §339 ne cite que le test à `SymbolInput` façonné ; le pendant CA-11 est le test de composition.)* |
| **CARTO-B-3** (producteur absent + série shape-incompatible) | **CLOSE** (cœur) — résidu = CARTO-B-9 | Producteur in-repo **présent** : `rebase-produce.ts` (`produceTrajectories:95`, `writeTrajectoryFile:148`, `runRebaseProduceCli:161`) écrit `{symbol:{events,scanComplete,scanMethod}}` hors dépôt ; `scanMethod` vient de la table fermée `SCAN_METHOD_MAP` `rebase-produce.ts:40-45` (jamais une sous-chaîne). `runMain --rebase-produce` câblé `collect.ts:575-577`. | ✔ **`bell_trajectory_producer_composition_from_file`** (`rebase-produce.test.ts:64`) : exécute **`runMain --rebase-produce` → FICHIER produit → `loadTrajectories` → `buildSolanaSymbol` (ancre C-3) → gate → `collect`** ; assert `multiplierUsed=="1.0039"`, `rebase_residuals`, compteurs. **Aucune conversion à la main** : l'entrée de `loadTrajectories` est le fichier RAW du producteur. VERT. (Données RPC synthétiques = frontière CI offline, cf. §8.) |
| **CARTO-B-4** (MWCB absent) | **OUVERTE** — inchangée, HORS périmètre -b1-bis-i | `apps/bell/**` : aucune constante MWCB, aucun test ; ADR-T1aii `:320` « ABSENT (item formé, bloquant release) ». Procurement **PR-B-8** (§7). CHANTIERS l.73 : « inchangé ». | (aucun — tuyau T-1b) |
| **CARTO-B-5** (census Ondo non 1re main) | **OUVERTE** — inchangée, HORS périmètre -b1-bis-i | Procurement **PR-B-ONDO** (§7). ADR-B0 `:123` (API GM 403). Le census v3 est **committé en docs** (`docs/CENSUS-ACTIONS-TOKENISEES-v3-2026-09-19.md` ; `CENSUS_V3_SHA256` `pools.ts:64`), mais **aucun univers Ondo GM** établi 1re main dans `pools.ts`/collecteur. | (aucun — procurement + census T-1a-ii) |
| **CARTO-B-6** (jambe ETH live jamais composée) | **OUVERTE** — inchangée, HORS périmètre -b1-bis-i | `ethereum.liveEthSwaps`→`makeUkemiPool.getLogsRange` importé mais **aucun `runMain --eth` piloté** ; seuls des tests de `parseArgs` `collect.test.ts:434,440`. Décodeur v3 seul exécuté. | (couverture -b2b) |
| **CARTO-B-7** (preuves dépendantes d'un runner hors dépôt) | **PARTIELLE** | **Volet rebase = CLOSE** : `rebase-produce.ts` est le scanner in-repo (C-G2-2 « lost runner » fermé) ; C-8 « reproduit 4/4 » vérifié **first-hand hors CI** (G2/checkpoint-2/G2-delta), producteur exercé en CI par 3 tests. **Volet fills = OUVERT** : `tslax-weekend-fills.jsonl` produit par une **capture ad-hoc** (`PROVENANCE-tslax-series.md:13-18` : `getSignaturesForAddress`+`getTransaction` jsonParsed, single-provider, 2026-09-19), **pas** par un `runMain` committé ; aucun item ne couvre sa reproduction in-repo. Mitigant : la logique d'extraction (`rpc.ts extractPoolSwap`/`liveSolanaFills`) EST in-repo et exercée ⇒ le résidu est plus faible que le gap rebase ne l'était. **Résidu formé** (obs.) : porteur **T-1b RUNBOOK** (procédure de capture ; le reproducteur in-repo est `runMain` mode défaut / `liveSolanaFills`, le gap est la provenance-de-capture, pas du code) — cf. §5. | ✔ `bell_rebase_course_replays_bit_identical` (rebase) ; ✔ `bell_collector_replays_fixture_bit_identical` (weekend-fills consommé). VERTS. |
| **CARTO-B-8** (1 wiring-proof regex-sur-source) | **OUVERTE** — inchangée, observation | Le proof regex-seul a **survécu** au lot (déplacé) : `assert.match(SRC, /main\(\)\.catch.*fatalMessage\(e\)/s)` **`collect.test.ts:485`** (était `:473` en passe 1 ; décalé par les insertions). `main()` = entrypoint process, difficilement pilotable offline ; les 7 autres wiring-proofs restent doublés d'une exécution. | (proof regex ; lot -b1-bis ou ultérieur) |

**Rejeu : 0 rouge.** Les 12 tests nommés des dettes/tuyaux du lot sont VERTS : `bell_c3_anchor_stale_trajectory_is_unverified`, `bell_gate_residuals_counted_in_state`, `bell_trajectory_producer_composition_from_file`, `bell_trajectory_producer_scanmethod_map_and_loader`, `bell_trajectory_producer_pager_counts_pages`, `bell_discover_founding_vault_from_tally`, `bell_founding_registry_equals_discovery_measure`, `bell_discover_confirm_vault_executable_and_system_owned`, `bell_discovery_lean_reducer_shape`, `bell_rebase_course_replays_bit_identical`, `bell_rebase_authority_residuals_named_and_gated`, `bell_gt_trajectory_known_integration`.

### 1.bis Question B-3 tranchée de première main — les 4 séries `rebase-*.json` épinglées de -b3a

- **Forme actuelle : inchangée, snake_case, per-mint.** Clés de tête de `rebase-SPYx.json` : `symbol, mint, method, oracle_slot, oracle_triplet, initialize_authority, …, events, …, scan_complete, …` — porte **`scan_complete`** (snake), **pas** `scanComplete`, **pas** `scanMethod`. **Toujours shape-incompatibles avec `loadTrajectories`** (qui exige, par symbole en tête, `{events(array), scanComplete(bool), scanMethod==="authority"}`).
- **Preuve exécutée** : `loadTrajectories(rebase-SPYx.json)` renvoie `keys: []` (première main, ci-dessus) ⇒ `{}` ⇒ chaque symbole retombe en `rebase_unverified`. La chute d'exactement la forme « `method` sans `scanMethod` » est aussi assertée par `rebase-produce.test.ts:148-150`.
- **Consommateur** : `rebase-course.test.ts` **uniquement** (`bell_rebase_course_replays_bit_identical:37`, `bell_rebase_authority_residuals_named_and_gated:66`) — rejeu bit-à-bit via les fonctions de PROD (`replayTriplet`/`multiplierAtSec`/`overwrittenPending`/`rebaseGateFromTrajectory`), **PAS** `loadTrajectories`/`collect()`. C'est **par conception** : ces 4 séries sont la **preuve de rejeu** de la course d'autorité -b3a, jamais une entrée de `loadTrajectories`.
- **Où l'identité de méthode -b3a est honorée** : dans le **producteur**, pas le loader — `SCAN_METHOD_MAP` `rebase-produce.ts:40-41` mappe la chaîne littérale `method` de la série (`"hybrid-authority-scan (pending R-26 ratification)"`) → `"authority"`. Le producteur, à son écriture, convertit `method`→`scanMethod` ; le loader ne fait jamais confiance à `method`.
- **Conclusion B-3** : le producteur RÉEL émet la **forme `loadTrajectories`** et cette forme est **consommée par une composition exécutée** (fichier produit → loader → seam → gate → collect), **sans conversion à la main**. Les `rebase-*.json` restent une preuve de rejeu -b3a séparée, correctement consommée par la gate.

---

## 2. Graphe d'arêtes mis à jour (producteur → artefact → consommateur) + DELTA vs passe 1

Barème (règle de branchement CA-11 durcie, investisseur 2026-09-19 + décision 75) : **câblé** = chemin servi + test d'intégration exécutant la composition depuis l'artefact réel ; **fixture** = consommé par un test/oracle (sous-grade : *série-réelle-exécutée* / *entrée-synthétique-exécutée* / *regex-seul*) ; **absent** = tuyau annoncé sans code.

### 2.0 Graphe d'imports internes (delta mesuré vs passe 1 §1.1)
- **Hub `collect.ts` : 15 → 17 imports internes** — ajoute `runRebaseProduceCli from "./rebase-produce.ts"` (`collect.ts:28`) et `runDiscoverCli from "./discover.ts"` (`:29`) ; câblés dans `runMain` `:577`/`:582` (+ 1 cross-app `../../sentinel` inchangé).
- **`rebase-produce.ts`** importe `operators/rpc/quorum/pools` + `rebase-scan` (`base58Decode`, `eventsFromTx`, `pinOracleState`, `bodyEventKey`) + `rebase-trajectory` (`replayTriplet`) (`:26-31`) — réutilise les décodeurs -b3a, pas de copie.
- **`discover.ts`** importe `pools.ts` (`DEX_BY_PROGRAM_ID`, `USD_STABLE_MINTS`, `FOUNDING_DISCOVERY_THRESHOLD`, `FoundingPoolRef`, `AuthorityKind`) (`:18`) + `rpc`/`quorum`/`operators`.
- **Arête inverse inchangée** : RIEN hors `apps/bell` n'importe `apps/bell` ni ne lit sa donnée (seules les portes scannent son source comme périmètre).

### 2.A Câblé (portes CI) — **4, inchangé**
`apps/bell/src/**`→`grep-forbidden.mjs` (`gate:vocab`) ; `apps/bell/**`→`lang-gate.mjs` ; `test/fixtures/series/**`→exclusion R-25 (`ci.yml`) + hash same-dir ; `apps/bell`→**exclusion** de l'export public. Preuves : `bell_vocab_scope_reddens`, `lang-gate-routing`, `series_pinned_are_declared_and_hashed`, `export-public.test.ts` — tous VERTS (30/30 portes racine + `npm run ci` 477/477). Ce sont les seuls consommateurs **servis** d'un artefact Bell (source/fixtures comme entrée de porte), jamais la **donnée** de `collect()`.

### 2.B DELTA d'arêtes fixture (ce que le lot a ajouté / déplacé)

| Arête (producteur → consommateur) | Passe 1 | Passe 2 | Test exécutant |
|---|---|---|---|
| producteur trajectoire `{symbol:{events,scanComplete,scanMethod}}` → `loadTrajectories`→seam→gate→`collect` | **ABSENTE** (§2.C p1) | **fixture / synthétique-exécutée** | `bell_trajectory_producer_composition_from_file` |
| ancre C-3 divergence (stale/mulDiverge/illisible) → `rebase_unverified` au seam `buildSolanaSymbol` | défaut B-1 sur arête existante (seam), non comptée absente en p1 | **fixture / synthétique-exécutée** | `bell_c3_anchor_stale_trajectory_is_unverified` |
| `gate.residuals` → `state.residuals` + `rebase_residuals` sur le gap | **NON comptée** (§3.bis 15/17) | **fixture / synthétique-exécutée** | `bell_gate_residuals_counted_in_state` + composition |
| `runMain --discover` → `discovery-<MINT>.json` (+ `discover-report.json`) | (discover.ts absent de `a81d4b3`) | **fixture / synthétique-exécutée** | `bell_discover_cli_writes_measure_from_runMain` |
| `FOUNDING_POOLS` registre == mesure committée `discovery-*.json` (champ à champ) | — | **fixture / série-committée-exécutée** | `bell_founding_registry_equals_discovery_measure` (C-4) |
| `confirmVault` executable/authority_kind (4 branches A/B/C/D) | — | **fixture / synthétique-exécutée** | `bell_discover_confirm_vault_executable_and_system_owned` |
| `leanFromDiscovery(brut)` → forme lean committée | — | **fixture / synthétique-forme** (réel hors CI, item C-G2D-7) | `bell_discovery_lean_reducer_shape` |
| 4 séries `rebase-*.json` → gate (replay bit-à-bit) | fixture / réelle-exécutée | **inchangée** | `bell_rebase_course_replays_bit_identical` |

### 2.C Comptes d'arêtes + delta

| Statut | Passe 1 | Passe 2 | Delta |
|---|---|---|---|
| **câblé** (portes CI) | 4 | **4** | = |
| **fixture** (exécutée + regex-seul) | 11 | **18** | +7 arêtes exécutées (producteur-composition, ancre-C-3, gate.residuals→state, discover-CLI, FOUNDING_POOLS==mesure, confirmVault, lean-forme) ; dont **1 relocalisée** de « absent » (producteur-composition) |
| **absent** (tuyau annoncé sans code) | 7 | **6** | −1 : le producteur de trajectoire n'est plus absent |
| dont regex-seul résiduel | 1 (`:473`) | **1** (`:485`) | = (CARTO-B-8) |

**Absentes restantes (6)** : panneau site `/bell/` (T-1b) ; parité→timeline (T-2) ; `fromSessionGap`→gate `tsv-offhours-gap-24h` (T-3) ; entrée `fleet.ts` « Kane » upcoming (T-1b) ; VPS `bell.monarkgate.tech`/DNS (T-1b) ; **MWCB**→fichier séance (T-1b, PR-B-8, CARTO-B-4). Toutes des tuyaux **de plan** (T-1b/T-2/T-3) ou un procurement (MWCB), aucun « dû » nu.

**§3.bis résiduels (faits témoins) : 15/17 → 17/17 comptés.** Les 2 codes d'autorité (`authority_scan_mono_operator`, `set_authority_unscanned`) sont désormais comptés dans `state.residuals` sur le chemin servi `collect()` (`collect.ts:166/174/177`), enum fermé `residuals.ts`, hors `CLOSE_KEY` (`assertNoClose` vert). C'était le double-blocage de CARTO-B-2.

---

## 3. Nouvelles pièces du lot — qui les consomme aujourd'hui ? (test-seul = `upcoming`, légitime si déclaré)

| Pièce | Consommateur(s) réel(s) aujourd'hui | Consommateur servi déclaré | Statut |
|---|---|---|---|
| **`rebase-produce.ts`** (`produceTrajectories`, `writeTrajectoryFile`, `runRebaseProduceCli`, `SCAN_METHOD_MAP`) | `runMain --rebase-produce` (CLI, hors dépôt) + 3 tests (`bell_trajectory_producer_*`) | course **-b1-bis-ii** (ADR-T1aii `:337`) | **upcoming** — déclaré |
| **`discover.ts`** (`discoverFounding`, `tallyFoundingVault`, `confirmVault`, `runDiscoverCli`, `quoteClass`, `dexForProgram`, `leanFromDiscovery`) | `runMain --discover` (CLI) + `discover.test.ts` | course **-ii** (ADR-T1aii `:340`) | **upcoming** — déclaré |
| **`FOUNDING_POOLS`** (`pools.ts:166-176`, mesuré RUN 2, non `null`) | `discover.test.ts` (C-4 registre==mesure ; distinct census) | course **-ii** ; `bell-report --founding` (item registre #11) | **upcoming** — déclaré, measure-gated |
| **`leanFromDiscovery`** | `bell_discovery_lean_reducer_shape` (brut **synthétique**) + `runDiscoverCli` (interne) | reproduction réelle hors CI (item **C-G2D-7**) | **upcoming** — déclaré |
| **`discover-report.json`** (auto-descriptif : `calls_by_method`/`calls_by_operator`/params/crédits) | `bell_discover_cli_writes_measure_from_runMain` (assert) | observabilité course -ii | **upcoming** — déclaré (CLOS C-G2-6 au pli G2) |
| **`state.residuals` (2 codes autorité)** / **`rebase_residuals`** (champ gap) | `bell_gate_residuals_counted_in_state` + composition | `state.json` publié à T-1b | **upcoming** — déclaré |

**Orphelin non déclaré : AUCUN.** Toutes les nouvelles pièces ont ≥ 1 consommateur test + un consommateur servi **déclaré** (course -ii / T-1b) ⇒ `upcoming` légitime. **Observation mineure (non-dette)** : `discover.measureNote` (`discover.ts:208`) est **exporté** mais utilisé **uniquement en interne** par `leanFromDiscovery` (`:218`) — sur-export cosmétique, pas de code mort.

---

## 4. Registre public — EXACT dans les deux sens ?

| Surface | Ce qu'elle dit de Bell | Exact ? |
|---|---|---|
| `apps/site/lib/fleet.ts` | **RIEN** (0 occurrence `bell`/`kane`) ; `fleet_register_built_set_is_frozen` VERT (built == {Shōgen,Hikae,Ukemi,Narabi}, 12 upcoming) | **EXACT** — aucune pièce Bell n'a de chemin servi ⇒ ni built ni registré ; « Kane » upcoming prévu à T-1b |
| `README.md` | 0 mention Bell/Kane (`\bbell\b`/`\bkane\b` = 0) | **EXACT** |
| `skills/`, `apps/site/**bell**`, `deploy/**` | aucun fichier/route/déploiement Bell (glob = 0) | **EXACT** |
| `scripts/export-public.mjs` | `apps/bell` absent de `APP_PACKAGE_DIRS`/`WHITELIST_DIRS` ; `export:check` OK au `npm run ci` | **EXACT** — Bell non public avant T-1b |
| G7 `-b1-bis` + ADR-T1aii | « rien n'est built ; Bell reste `upcoming` partout » ; couvre B-1/B-2/B-3/B-7 « à confirmer passe 2 » | **EXACT** — confirmé ici |

**Aucun écart** de sur- ni de sous-déclaration. Du code Bell substantiel et vert (94 tests) **entièrement `upcoming`** est **correct** au regard de la règle de branchement (aucun chemin servi). Registre **exact dans les deux sens**.

---

## 5. Registre durable des items (ADR-T1aii §346-367) — couvre-t-il chaque tuyau annoncé/manquant ?

**OUI.** Chaque tuyau -b1-bis-i annoncé (ADR-T1aii `:334-342`) est soit **livré+testé**, soit un **item à déclencheur** (jamais un dû nu) :
- Livrés+testés : producteur→fichier ; fichier→gate ancré C-3 ; `gate.residuals`→state ; découverte→registre ; brut→lean (forme).
- Items formés (déclencheur CONTRAIGNANT sauf « optionnel »), tous exigences d'entrée du **G0 -b1-bis-ii** : #1 `PR-B-DISCOVER-DEDUP` (dédup silencieuse re-tirée avant course), #1a `PR-B-DEDUP-OBSERVABLE`, #2 `PR-B-CONFIRMVAULT-UNREAD` (2ᵉ branche `unread` non testée — la branche (D) « autorité illisible » EST testée `discover.test.ts:202-204`, mais la branche « autorité non-System lue + compte programme au quorum raté » ne l'est pas, mutant M-B1 survit), #4 `C-G2D-8` (optionnel), #5 **`C-G2D-7`** (test CI rejouant `leanFromDiscovery` sur les 4 bruts RÉELS ; aujourd'hui forme sur brut synthétique + byte-for-byte hors CI ×3), #11 `bell-report --founding` + consommateur servi de `coverage.ts`.
- Items repris inchangés : `PR-B-8` (MWCB), `PR-B-ONDO`/-b3c, `PR-B-CAL`, `PR-B-DBN #8`, `set_authority_unscanned`, extension population/fenêtre.
- Items CLOS déclarés : `calls_by_method` (C-G2-6) ; `C-G2-2` runner in-repo (« CLOS RUN 1 : le scanner reproduit les 4 séries ») ; `PR-B-GTFA-SHAPE`.

**Écart relevé (léger)** : le volet **`tslax-weekend-fills.jsonl` de CARTO-B-7** (§1) n'a **pas** d'item dédié dans le registre -b1-bis-i (le registre ne forme que le volet rebase, C-G2-2). C'est le motif du statut **PARTIELLE** de B-7 : **item formé** (observation) — porteur **T-1b RUNBOOK** (procédure de capture ; reproducteur in-repo = `runMain` mode défaut / `liveSolanaFills`, donc le gap est la **provenance-de-capture**, pas du code) ; l'orchestrateur peut le juger inhérent à toute fixture réelle et clore. Pas de dû nu.

---

## 6. Nouvelles dettes + rappel B-4/B-5 (procurements)

### CARTO-B-9 (NOUVELLE — observation)
- **Sévérité** : observation (complétude de test ; ni bloquant release ni bloquant avant T-1b).
- **Constat** : **aucun test ne pilote une SEULE invocation `runMain --rebase-trajectory <fichier-produit>` → `state.json`.** `bell_trajectory_producer_composition_from_file` assemble `loadTrajectories → buildSolanaSymbol → collect` **à la main** (étapes 2-4) après `runMain --rebase-produce` ; et l'unique pilote de `runMain --rebase-trajectory` (`collect.test.ts:678`) consomme une trajectoire **écrite à la main** (constant m=1, `:672`), jamais la sortie du producteur. La glu de `runMain` qui câble `loadTrajectories`→boucle `buildSolanaSymbol` (`collect.ts:586-593`) n'est donc exercée qu'avec une entrée façonnée à la main et seulement sur la branche `constant` — exactement le libellé résiduel de CARTO-B-3.
- **Preuve** : `collect.test.ts:672` (traj à la main) + `:678` (`--rebase-trajectory trajPath`) ; `rebase-produce.test.ts:88-127` (composition assemblée manuellement) ; grep = 1 seul pilote `--rebase-trajectory`.
- **Lot porteur (plan existant)** : **-b1-bis-ii** (la course fondatrice réelle enchaîne naturellement producteur → consommation ; y ajouter l'e2e mono-invocation). Code, compté R-25.

**Aucune autre nouvelle dette.** (CARTO-B-8 reste ouverte inchangée — observation, `collect.test.ts:485`.)

### Rappel B-4 (MWCB) — procurement **PR-B-8**
- **Identité (ADR-B0-programme-bell.md:124)** : « **Flux MWCB (market-wide circuit breaker status)** — message SIP CTS/UTP *Market-Wide Circuit Breaker Decline Level / Status* (`UtpBinaryOutputSpec` l.273 ; CTS spec équivalente) ; le CSV NYSE `trade-halts` porte **0** ligne market-wide (mesuré) ».
- **Tentatives / à procurer** : CSV NYSE (0) ; pages NYSE/Nasdaq MWCB (historique 2020-03 seulement, [abs]) ; **à procurer** = feed SIP ou archive tierce (Polygon `v2/…/status`, Nasdaq Data Link).
- **À qui** : **procurement investisseur/mainteneur** (bloquant release, décision 19) ; propriétaire livraison = T-1b.
- **Statut** : **inchangé** (CHANTIERS l.73 « bloquant release, inchangé ; aucune constante committée »). **Précision pour l'orchestrateur** : le *sourcing* a évolué depuis la passe 1 — CHANTIERS l.78 note MWCB « RÉSOLU 2026-09-19, lecture navigateur » (0 ligne = normal, 5 déclenchements historiques 27/10/1997 + 9/12/16/18-03-2020 ; sources gratuites nyse.com/nasdaqtrader.com ; option payante Databento schéma `status` seulement pour l'intra-séance). Le **livrable** (fichier séance avec niveaux + halts par titre + 5 dates) reste **absent** (T-1b). ⇒ Question à poser à l'investisseur : confirmer la voie (gratuite historique + Databento intra-séance) et le déclenchement du fichier séance.

### Rappel B-5 (census Ondo) — procurement **PR-B-ONDO**
- **Identité (ADR-B0-programme-bell.md:123)** : « **Clé API Ondo Global Markets** (`api.gm.ondo.finance/v1/assets/all/addresses`) — **403 mesuré** (auth-gated, 2026-09-19) ; en attendant, TSLAon résolu via GeckoTerminal + confirmation on-chain (`pools.ts`) » ; usage = **univers Ondo (395 [abs] retiré) + supply (D2 iv)**.
- **À qui** : **procurement investisseur/mainteneur** (bloquant release, décision 19).
- **Statut** : **inchangé côté code Bell** (aucun census Ondo GM committé dans `pools.ts`/collecteur ; -b1-bis-i n'y touche pas). **Précision pour l'orchestrateur** : la situation a **beaucoup évolué** depuis la passe 1 (décision investisseur **35**, CHANTIERS l.93) — la clôture PoR a été **tranchée par recherche** : aucune PoR on-chain (Chainlink = prix), mais **attestation quotidienne publique Ankura Trust** (Dropbox Ondo, PDF 1 page, 20:00 ET) **agrégée** (ratio 108,72 % le 15/09) **sans détail par token** ⇒ résidu Bell **`por_daily_report_aggregate`** (parser = item lot **-b3c**, fixture `f46e35db` **reçue**, CHANTIERS l.70) ; une **API publique** `app.ondo.finance/api/v2/assets` (452 actifs) a été trouvée et transmise au census. ⇒ Question à poser à l'investisseur : la clé GM `api.gm.ondo.finance` (403) reste-t-elle requise, ou l'API publique + attestation Ankura suffisent-elles pour le census Ondo GM et le fait (iv) ?

---

## 7. Limites (ce que cette cartographie n'a PAS établi)

1. **Données on-chain réelles** : aucun appel réseau. Toutes les compositions du lot (`bell_trajectory_producer_composition_from_file`, `bell_discover_cli_writes_measure_from_runMain`, ancre C-3) s'exécutent sur des **corps RPC synthétiques déclarés** (frontière CI offline). Les compositions sont RÉELLEMENT exécutées depuis l'artefact **produit** (non façonné à la main) ; c'est la donnée *source* qui est synthétique, comme pour toute la suite Bell (aucun test ne touche le réseau).
2. **Reproduction réelle du producteur (C-8) et du lean réel** : « reproduit 4/4 » et le byte-for-byte de `leanFromDiscovery` sont **first-hand hors CI** (relecteurs G2/checkpoint-2/G2-delta). Un pendant CI exigerait de committer des bruts réels (hors dépôt par CA-11/R-25) ⇒ **limite, pas dette** : le producteur est `upcoming`, sa course réelle est -b1-bis-ii. Asymétrie déclarée : le lean a un item CI différé (#5 C-G2D-7), le producteur est « CLOS RUN 1 » ; à l'orchestrateur d'apprécier si un item CI symétrique est dû (une phrase, non formable en CI sans committer des bruts).
3. **Couverture des mutants** : je rejoue les tests (verts), je ne relance pas la campagne de mutation du G2/checkpoint-2 (3 survivants déclarés sur branches défensives, exigences d'entrée -ii).
4. **R-25 = 1 201 ≤ 1 205** et l'anti-close (3 759 jetons) : **non recomputés** de première main (métriques/scripts spécifiques ; concern G7 de l'orchestrateur). Le `npm run ci` (477/477) et `export:check`/`gate:vocab` OK sont confirmés.
5. **Worktrees/lots hors périmètre** : B-4/B-5/B-6 non instruits au-delà du rappel ; le fond des lots -b3c/-b2b/-ii n'est pas cartographié (hors -b1-bis-i).

---

### RAPPORT FINAL (résumé machine)
- **Modèle résolu** : `claude-opus-4-8[1m]`
- **Arbre cartographié** : `f654151` (`lot/etude-suite`, lot -b1-bis-i fusionné `bda5805`)
- **8 dettes passe 1** : B-1 **CLOSE**, B-2 **CLOSE**, B-3 **CLOSE** (résidu = B-9), B-4 **OUVERTE** (PR-B-8, hors périmètre), B-5 **OUVERTE** (PR-B-ONDO, hors périmètre), B-6 **OUVERTE** (obs., -b2b), B-7 **PARTIELLE** (rebase CLOSE / weekend-fills ouvert), B-8 **OUVERTE** (obs., `:485`)
- **Arêtes** : câblé **4** (=) · fixture **18** (+7 exécutées) · absent **6** (−1) ; §3.bis résiduels **17/17** comptés (était 15/17)
- **Registre public** : EXACT dans les deux sens (Bell entièrement `upcoming`)
- **Nouvelle dette** : **CARTO-B-9** (observation, e2e mono-invocation producteur→`runMain` absent ; lot -b1-bis-ii)
- **Procurements** : **PR-B-8** = flux MWCB SIP CTS/UTP (ADR-B0:124), investisseur, bloquant release, sourcing gratuit+Databento résolu, livrable T-1b ; **PR-B-ONDO** = clé API Ondo GM 403 (ADR-B0:123), investisseur, bloquant release, contourné par Ankura + API publique (décision 35)
- **Tests rejoués** : suite Bell **94/94** VERTS ; portes racine **30/30** VERTS ; **`npm run ci` 477/477** VERTS ; `loadTrajectories(rebase-SPYx.json)` = `{}` (1re main) — **0 rouge**
