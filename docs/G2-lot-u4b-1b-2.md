# G2 U-4b-1b-2 (relecteur Opus 4.8, contexte frais) — PASS-AVEC-CORRECTIONS

Modèle résolu : claude-opus-4-8[1m]

Relecteur G2 (contexte frais), lot U-4b-1b-2 @ `cec927e`. Mission `F:\tmp\u4b1b2\MISSION-G2-CP2.md` exécutée intégralement (rôle G2). Clone lecture-seule `F:\tmp\g2-u4b1b2\`. Verdict **PASS-AVEC-CORRECTIONS**. Rendu intégral ci-dessous (aussi écrit dans `F:\tmp\g2-u4b1b2\G2-lot-u4b-1b-2.md`).

---

# G2 — lot U-4b-1b-2 : préconditions de COURSE (réducteur de SÉLECTION d'épisode + prober D_e paramétré + discover schéma v2)

Modèle résolu : claude-opus-4-8[1m]

Relecteur G2 `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22, contexte frais. Clone LECTURE-SEULE `git clone --no-hardlinks --branch lot/u4b-1b-2 F:\Monark F:\tmp\g2-u4b1b2` @ `cec927e` + `mk-nm.ps1` (node_modules isolé, `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-u4b1b2\packages\rpc-guard\src\index.ts`). Aucun commit, aucune écriture dans `F:\Monark`/`F:\Monark-wt-*`, aucun workflow (R-20). Tout oracle/mutant sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (A-7 ; aucune variable d'env affichée). Advisor consulté avant conception des mutants et avant le verdict (R-26 : avis, jamais verdict).

## VERDICT G2 : **PASS-AVEC-CORRECTIONS**

Le CODE des 3 livrables est conforme et intégralement vérifié (oracle vert 887/886/0/1 ; 9/9 sha gelés byte-identiques ; 19/19 mutants G1 + 6/6 mutants G2 tués ; R-25 par PR empilée ; fusion à blanc propre). Les corrections sont **documentaires** (dont une porteuse d'une affirmation technique fausse dans l'amendement ADR — bloquante à l'insertion telle quelle) et deux items de durcissement de test **formés, à déclencheur** (P5, zéro dette nue). Aucune n'invalide le code livré. (Le siège checkpoint-2 CA-1..CA-11 relève du validateur-humain, instance séparée — hors de ce rendu G2.)

Chaîne de commits vérifiée : fourche `e60ea07` → PR-C `6e7b2f1` (discover v2) → PR-B `7c3fa36` (prober + u4-guard) → PR-A `cec927e` (sélecteur). HEAD consommé = `cec927e0ebf019047854bddcf93217c0b2607842`.

---

## 1. Diff par PR ; 9 sha gelés ; `liquidation-logs.mjs` intact ; parité `canon`/`sha256Hex`

**R-25 par PR** (pathspec verbatim `ci.yml:65`, `git diff --shortstat <parent> <PR> -- <exclusions>`, borne 1 150) :

| PR | vs parent | lignes | fichiers |
|---|---|---|---|
| PR-C discover `6e7b2f1` | `e60ea07` | **125** | `u4b-discover.{mjs,d.mts,test.ts}` (3, M) |
| PR-B prober `7c3fa36` | `6e7b2f1` | **514** | `u4-oracle-path.{mjs,d.mts}`, `u4-guard.{mjs,d.mts}`, `u4b-oracle-path.test.ts`, `guard-scripts-u4.test.ts` (6) |
| PR-A sélecteur `cec927e` | `7c3fa36` | **683** | `u4b-select-episode.{mjs,d.mts,test.ts}`, `export-exclude-tests.json` (4) |
| **Total lot** | `e60ea07` | **1322** | **13** (= `DELIVERED.sha256`) |

Chaque PR < 1 150. **`DELIVERED.sha256` : 13/13 OK** (octets bruts, working tree). Les 4 lignes « étrangères » Bell signalées par le G1 sont **absentes** du diff du lot.

**CONSÉQUENCE DE L'EMPILEMENT (C-4)** : mesuré NON empilé — PR-B = **639**, PR-A = **1322 (> 1 150)**. Les 3 PR **DOIVENT** être empilées C→B→A (ce que fait la couture de l'orchestrateur) ; l'ordre est **aussi** requis par la dépendance `PR-A ⟶ u4-guard.canon` (fournie par PR-B).

**9 sha gelés (§2 prereg, régime B) — concordent ET inchangés vs fork** : u4b-scores `2f9a31f6…`, u4b-reduce `a5e66cd3…`, record-u4b-calib `5733daeb…`, wadray `7bee76fc…`, abi `3376eb08…`, l1-split `9206df91…`, rpc `0e232519…`, calib-digest `3603265d…`, u3-realized (labeler) `cb020425…`. **AUCUN ÉCART. PAS DE STOP D4.** `liquidation-logs.mjs` **INTACT** vs fork (`bf4eb293…`). Prereg LF sha = `770413d992b584fd846b87663f1f8c17867ac5f764852dcc24a44d814ded4598` (conforme, non modifié).

**Parité `canon`/`sha256Hex` (u4-guard ⇔ liquidation-logs)** : corps extraits, comparés **byte-à-byte** → `canon` sha `13a0182e…` identique des deux côtés ; `sha256Hex` byte-identique. Test `u4guard_canon_matches_liquidation_logs_canon` vert. Producteur (réducteur) et vérificateur (prober, allowlist fermée) partagent la MÊME sérialisation.

## 2. Fidélité §DISC (prereg lignes 27-57)

- **Exclusion e2** `[23545088,23557060]` — `kept = records.filter(!inE2)` avant clustering (§DISC:31) ; `DEFAULT_E2_WINDOW` pinné. Test `u4b_select_excludes_the_e2_window`.
- **Clustering par la fonction PURE** — `clusterWethLiquidations` **importée** de `liquidation-logs.mjs`, ré-exécutée sur l'ensemble e2-EXCLU (autoritaire) ; `clusters` du brut discover = témoin consultatif.
- **Éligibilité §DISC:42-46** — `WETH` ∧ `b_last <= bHi` (sinon `window_truncated`) ∧ `n_distinct_liquidated >= nMin` (défaut 50) ∧ `version_ok` (hors ligne ⇒ `"pending"`).
- **argmin B_first + tie-break §DISC:50** — `compareCandidates` : b_first croissant ; puis n_distinct décroissant ; puis addr_min. Test `u4b_select_argmin_and_tiebreak_comparator` (défensif, inatteignable par construction — honnêteté D-2).
- **`B0 = B_first − 1`** (§DISC:52). Test asserte `B0 === B1-1` (mutant G2-M1 tue).
- **`events[].collateral` = ADRESSE WETH (C-2)** — `collateral: WETH` (l'adresse), jamais `"WETH"`. Composition prouvée par le **VRAI** `u3-realized.parseArgs(--events)` : `parsed.length===1`, `collateral===WETH`, et le prédicat labeler **`:548`** retourne un cluster **NON VIDE de taille `n_members`** (prédicat inline vérifié littéralement identique à `:548`).
- **`B_last` == recalcul labeler (C-4)** — recalcul indépendant `firstBlockAtOrAfter(ts+86400)-1` asserté égal.
- **`rawlogs_sha256` = sha BRUT des octets d'A-rawlogs (C-3)** — comparé au sha des octets du fichier (`update(rawBuf)`). Forme des records == `decodeLiquidationCall` (clés == labeler `:614`).
- **`selection_sha256` HORS `version_check` (C-5)** — `selectionSha(payload)` sans `version_check`/`selection_sha256` ; `--check-version` remplit sans changer le sha ; symétrie côté prober (`parseEpisodeFile`). Mutants G2-M2/G2-M3 tuent toute rupture.
- **`--check-version`** — **1 slot** `eth_getStorageAt(POOL, EIP1967_IMPL_SLOT, B_first)` lu à **quorum-2 keyless** (donc **≥ 2 appels RPC** sur opérateurs distincts, `storageAtQuorum2`), metered/budgeté ; `impl == 0x97287a4f…` ⇒ true ; sinon **STOP H-1** (`PR-U4-3-bis`, nommé, jamais d'avance silencieuse) sauf `--version-neutral-ref` (§DISC:56). `neutral_ref` **écrit en provenance**. Tests `u4b_check_version_true_on_v350…` / `…false_stops_H1_unless_neutral_ref`.

## 3. Réducteur HORS LIGNE

- **0 fetch** — mode `select` sans réseau ; le test injecte un `fetch` qui rejette et asserte `fetches===0` sur deux runs ; `tsOf` lit exclusivement `brut.block_ts`.
- **ts manquant ⇒ refus NOMMÉ** — `SelectError("brut has no ts for block N - u4b-discover must persist block_ts[…]")`, jamais un appel réseau. Test `u4b_select_refuses_by_name_a_brut_missing_a_block_ts`.

## 4. Discover schéma v2

- **`block_ts` sous `brut_sha256`** — `brut = {…, records, block_ts}` puis `brut_sha256 = sha256Hex(canon(brut))` ⇒ couvert. Mutant C-M2 rouge.
- **`--block-operators`** — pool keyless SÉPARÉ pour `blockAt`, pocket-free (pocket élague : « available from block 25771356 »), quorum-2 distinct exigé, fail-closed.
- **Échec témoin ⇒ `clusters:null` + `cluster_error` (URL-scrubbé) + exit 0** — clustering en try/catch ; brut écrit quand même. Test `u4b_discover_writes_the_brut_even_when_the_witness_clustering_fails` : brut présent, records préservés, `cluster_error` matche `/quorum|providers|pruning/` et **aucune URL**. A-8 : stub répond getLogs puis échoue HTTP 400 sur getBlockByNumber ⇒ brut écrit, sha stable. Mutant C-M1 rouge.
- **RÉSERVE (Correction C-1)** : « brut écrit AVANT le témoin » (mission v.4, G1, ADR §3, commentaires `u4b-discover.mjs:16-18,107-115`) est **imprécis**. Mesuré `:116-133` : le témoin tourne à `:119`, **peuple `block_ts`** via `tsOf`, PUIS le brut (records **+ block_ts**) est assemblé (`:122`) et écrit **UNE fois, INCONDITIONNELLEMENT** (`:133`), après la tentative. `block_ts` est **produit par le témoin (PHASE 2)**, non écrit « en PHASE 1 ». L'invariant réel qui ferme le FATAL est « écriture inconditionnelle après la tentative » (prouvé par C-M1), pas un ordre « avant ». **Le code est CORRECT et testé** ; c'est la DESCRIPTION à corriger avant insertion ADR.

## 5. Prober D_e paramétré

- **Défauts e2 SUPPRIMÉS** — `grep -E '23545087|23552238|23550406' u4-oracle-path.mjs` = **0** (les autres occurrences sont dans `u4-redraw/u4-reduce/u4-scores.mjs`, scripts U-4 hors lot, + fixtures/commentaires). L'usage e2 repasse par les flags explicites (`guard-scripts-u4.test.ts`).
- **`--episode-file` + `selection_sha256` vérifié** — `parseEpisodeFile` recompute (hors `version_check`) et **refuse fail-closed, 0 fetch** en écart (`counter.n===0`). Lit `episode.B0`/`B_last` (mutant B-M1 rouge).
- **`--usdt-blocks` omis ⇒ `usdt_prices {}` + `usdt_blocks_status "omitted"`** (le scorer gelé fait `?? {}`). Test `…omits_usdt_when_flag_absent`. Mutant B-M3 rouge.
- **`--emode-categories | --book` fail-closed** ; `--raws-dir` absent ⇒ throw nommé. Mutants B-M4/B-M5 rouges.
- **`run(argv, deps)`** exporté ; `deps.env` seule source (0 `process.env` dans le corps). A-8 corps hex réels (`resolved === body`). A-10 liage `selection_sha256`/`episode_id`/`prereg_sha`/`feed_proxy_source` en provenance.

## 6. Mutants

- **19 mutants G1 rejoués** (`F:\tmp\u4b1b2\mutants.mjs`) : **19/19 KILLED + restaurés byte-exact**, exit 0.
- **8 mutants G2 indépendants** (`F:\tmp\g2-mymutants.mjs`, invariants DIFFÉRENTS) : **6 KILLED + 2 SURVIVED attendus**, tous restaurés byte-exact, exit 0 :
  - G2-M1 `B0 != B_first-1` → KILLED. G2-M2 check-version recalcule le sha AVEC `version_check` (rompt C-5) → KILLED. G2-M3 prober garde `version_check` dans le recompute → KILLED. G2-M4 `p_min` inversé en max → KILLED. G2-M5 borne e2 stricte (`> && <`) → KILLED (`n_excluded_e2`→1). G2-M6 date d'`episode_id` en secondes → KILLED.
  - **G2-M7 [lacune] éligibilité sur `n_members`** → SURVIVED attendu : aucune fixture `n_members≥50 ∧ n_distinct<50` ⇒ item **H-1** (code correct). **G2-M8 [lacune] garde `distinct(blockLabels)<2` supprimée** → SURVIVED attendu : aucun test < 2 block-operators ⇒ item **H-2** (code correct).

## 7. Oracle complet (env -u, A-3) + fusion à blanc

| Gate | exit | note |
|---|---|---|
| gate:vocab | 0 | |
| typecheck | 0 | `tsc --noEmit` |
| test | 0 | **887 / 886 pass / 0 fail / 1 skip** |
| lint | 0 | |
| lint:ratchet | 0 | 69/69 |
| lang:gate | 0 | |
| export:check | 0 | 2 nouveaux tests ajoutés à l'union `export-exclude-tests.json` |

Seul skip = `u4b_labels_replay_via_main_real_artifact` (real e2 artifacts absent) — **pré-existant -1b-1**, non touché par ce lot. **Concorde avec l'attendu 887/886/0/1.**

**Fusion à blanc avec `lot/etude-suite` HEAD `96446966`** : **PROPRE, 0 conflit**, fichiers = **docs seuls** (CHANTIERS, CHECKPOINT1-u5a, G1-lot, course-bell/*, token/*), aucun code. Test sur arbre fusionné : **887/886/0/1, 0 fail**. Fusion abandonnée (HEAD restauré `cec927e`, arbre propre).

## 8. Amendement ADR (`F:\tmp\u4b1b2\ADR-amendement-1b-2.md`)

Présents et concordants : table **Tuyaux** (4, entrée/sortie/état/test) ; **lignes de commande FIGÉES** (§4) ; **D-n** (§5) ; **MAST** (§6) ; **items formés à déclencheur** (§5b `--block-operators` stale, §5b-bis, ordre de course, relance discover) ; **recompute des 9 sha** (§7). **DÉFAUT (C-1, bloquant à l'insertion)** : §3 « PHASE 1 écrit `brut = {…, block_ts}` où `block_ts` = chaque `eth_getBlockByNumber` lu par LE TÉMOIN » est **auto-contradictoire** (le témoin = PHASE 2).

---

## CORRECTIONS (documentaires ; propriétaire = orchestrateur, R-20 ; aucune ne touche le code livré)

- **C-1 (ADR §3 — AVANT insertion)** : reformuler « le brut (`records` + `block_ts`) est écrit **UNE fois, INCONDITIONNELLEMENT, APRÈS la TENTATIVE de clustering témoin** ; `block_ts` porte les ts lus avant toute faute ; en faute : `clusters:null` + `cluster_error`, exit 0, brut écrit ». Ajouter le **coût de reprise** : si le témoin échoue avant tout `blockAt`, `block_ts = {}` ⇒ le réducteur **refuse NOMMÉment** ce brut (inutilisable pour la SÉLECTION) ⇒ **relance complète du discover** (re-paiement getLogs). (Aligner aussi les commentaires `u4b-discover.mjs:16-18,107-115`, non bloquant.)
- **C-2 (commentaire — non bloquant)** : le test C-2 dit « the labeler :548 predicate » mais **réimplémente** le prédicat inline (vérifié **littéralement identique** à `:548` ; `parseArgs` est le vrai parseur). Preuve de composition **tient** ; « calque du prédicat » serait exact.
- **C-3 (commentaire — non bloquant)** : `u4b-select-episode.mjs:144` — `assertOutDir` dit « OUT of the repo AND not under fixtures » mais n'impose QUE le refus fixtures (`:149`). Conforme à l'exigence ; incohérent avec le prober `--raws-dir` (hors-dépôt, `:120-121`). Aligner le commentaire.
- **C-4 (empilement R-25 — action orchestrateur)** : PR empilées C→B→A (non empilé, PR-A = 1322 > 1 150) ; confirmer que PR-A cible la branche de PR-B.

## ITEMS DE DURCISSEMENT (formés, à déclencheur ; code correct — P5)

- **H-1** : fixture avec cluster `n_members ≥ N_min ∧ n_distinct < N_min` pour épingler que l'éligibilité compte les users **distincts** (G2-M7 survit sinon). Déclencheur : prochaine passe touchant le réducteur.
- **H-2** : test passant < 2 `--block-operators` distincts pour épingler la garde quorum-2 `blockAt` (G2-M8 survit sinon). Déclencheur : prochaine passe touchant discover.

## Mapping gate G2

- **G2 (revue 100 %)** : 13 fichiers + prereg §DISC/§2/§5 + amendement ADR relus intégralement ; 3 étapes AgileCoder couvertes.
- **G3** : oracle vert 887/886/0/1 + 7 gates 0. **G4** : imports fermés, parité `canon` épinglée, `.d.mts` = exports (4/4), branchement réel (réducteur → labeler/prober/recorder) prouvé par fusion à blanc + tests de composition. **G5** : zéro dette nue (4 corrections formées + 2 items à déclencheur).
- **Mutation (D-1)** : 27 mutants (19 G1 + 8 G2) ; 25 tués, 2 survivants **documentés** (lacunes de test, pas de code).

---

Fichiers pertinents (chemins absolus) :
- `F:\tmp\g2-u4b1b2\G2-lot-u4b-1b-2.md` — ce rendu G2 (durable).
- `F:\tmp\g2-mymutants.mjs` — harnais de mutants G2 rejouable (8 mutants).
- `F:\tmp\g2-u4b1b2\` — clone lecture-seule @ `cec927e` (arbre propre, HEAD restauré après fusion à blanc).
- Logs : `F:\tmp\g2-u4b1b2-test.log`, `F:\tmp\g2-mergetest.log`, `F:\tmp\g2-{vocab,lint,ratchet,lang,export,tc}.log`.

Décision d'advisor tracée (R-26 : avis, jamais verdict) : orientation confirmée (approche checklist + mutants + fusion à blanc), 5 angles morts fermés (ADR §3 = discriminateur PASS/PASS-AVEC-CORRECTIONS ; fidélité `:548` ; re-baseline golden honnête ; commentaire `assertOutDir` ; conséquence R-25 empilement), précision budgétaire `--check-version` (≥2 appels RPC) intégrée. Le verdict G2 reste chez moi (relecteur) ; la clôture G7 et l'acceptation checkpoint-2 restent chez l'orchestrateur et le validateur-humain.
