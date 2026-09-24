# Checkpoint-2 U-4b-1b-2 (validateur-humain Fable 5.1) — ACCEPTE-AVEC-CORRECTIONS

Modèle résolu : claude-fable-5-1

# CHECKPOINT-2 — LIVRABLE — lot U-4b-1b-2 (préconditions de course Ukemi : réducteur de sélection, prober D_e paramétré, discover v2)

Validateur-humain, instance neuve, contexte frais (aucun fil de travail lu ; artefacts seuls). Indépendant du G2 parallèle : tout ci-dessous est **re-exécuté par moi** (AM-2 / AM-2 ter), pas lu dans le G1.

## 1. Artefacts lus et rejeu

- Mission : `F:\tmp\u4b1b2\MISSION-G2-CP2.md`, `F:\tmp\u4b1b2\MISSION-G1-u4b-1b-2.md` ; rendu G1 `F:\tmp\u4b1b2\G1-lot-u4b-1b-2.md` ; `DELIVERED.sha256` (13) ; `mutants.mjs` (19) ; `ADR-amendement-1b-2.md`.
- Code : `lot/u4b-1b-2` @ `cec927e` (PR-C `6e7b2f1` → PR-B `7c3fa36` → PR-A `cec927e`, fourche `e60ea07`) ; sources `scripts/census/u4b/{u4b-select-episode,u4b-discover,liquidation-logs}.mjs`, `scripts/census/{u4-oracle-path,u4-guard}.mjs`, `apps/sentinel/src/windows.ts`, `scripts/census/u3-realized.mjs` (labeler gelé) ; tests `apps/sentinel/test/{u4b-select-episode,u4b-oracle-path,u4b-discover}.test.ts`, `test/guard-scripts-u4.test.ts` ; `docs/PLAN-u4b-prereg.md` §DISC/§2/§5d ; `docs/adr/ADR-U4b-calibration-episode-frais.md` (table Tuyaux).
- **Checkpoint-1 de ce lot : INTROUVABLE** — `…\tasks\a6aa59678bf97f57b.output` est VIDE (0 octet), aucun `docs/CHECKPOINT1-lot-u4b-1b-2.md` à `9644696`, memstack sans entrée. Voir C-V-6.
- Chemin de rejeu (AM-2 ter) : clone `F:\tmp\cp2-u4b1b2\` (`git clone --no-hardlinks --branch lot/u4b-1b-2`, HEAD `cec927e`, node_modules par `mk-nm.ps1`, `require.resolve('@monark/rpc-guard')` → `F:\tmp\cp2-u4b1b2\packages\rpc-guard\src\index.ts`) ; worktrees du clone `F:\tmp\cp2-u4b1b2-prb` (7c3fa36) et `-prc` (6e7b2f1) ; branche scratch `cp2-merge` dans le clone ; harnais `F:\tmp\cp2-u4b1b2\cp2-harness\{chain.test.ts,my-mutants.mjs,calls.test.ts}` ; logs `F:\tmp\cp2-u4b1b2-logs\`. `TEMP/TMP/TMPDIR=F:/tmp`. Tout oracle sous `env -u` (8 variables).

## 2. Vérifications refaites (mission §1–8)

| # | Vérification | Résultat mesuré |
|---|---|---|
| 1 | 9 sha gelés §2 (`git show cec927e:… \| tr -d '\r' \| sha256sum`) | `2f9a31f6 / a5e66cd3 / 5733daeb / 7bee76fc / 3376eb08 / 9206df91 / 0e232519 / 3603265d / cb020425` = base `e60ea07` = table prereg §2 lignes 116-124. **AUCUN ÉCART**. `liquidation-logs.mjs` `bf4eb293` identique base ; prereg `770413d9` intact. `canon`/`sha256Hex` de `u4-guard.mjs` : sha des corps de fonction identiques à `liquidation-logs.mjs` (`13a0182e…` / `ef9223d2…`). DELIVERED 13/13 OK. |
| 2 | Fidélité §DISC | e2 `[23545088,23557060]` exclu toutes collatérales (`:31`) ; clustering par `clusterWethLiquidations` PURE sur l'ensemble e2-exclu ; éligibilité WETH ∧ `b_last <= bHi` (`window_truncated` compté) ∧ `n_distinct >= 50` ; `argmin b_first` + tie-break ; `B0 = B_first − 1` ; `events[].collateral` = ADRESSE WETH ; `rawlogs_sha256` = sha brut des octets ; `selection_sha256` hors `version_check`/`selection_sha256` ; `--check-version` = **2 appels mesurés** (`version_check.calls == 2`, harnais `calls.test.ts`), v3.5.0 ⇒ true, sinon false + STOP sans `--version-neutral-ref`, `neutral_ref` en provenance. Conforme. |
| 3 | Réducteur hors ligne | 0 fetch (bouchon rejetant) ; ts manquant ⇒ `SelectError` nommé. Conforme — mais voir C-V-2 (le refus nommé est un cul-de-sac). |
| 4 | Discover v2 | `block_ts` sous `brut_sha256` ; `--block-operators` fail-closed ; échec témoin ⇒ `clusters:null` + `cluster_error` scrubbé + exit 0 (test A-8 vert). **« brut écrit AVANT le témoin » : FAUX au code** — voir C-V-3. |
| 5 | Prober | grep `23545087\|23552238\|23550406` dans `u4-oracle-path.mjs` = 0 ; `process.env` uniquement à l'entrée CLI (`:230`) ; `--usdt-blocks` omis ⇒ `{}` + `"omitted"` ; `--emode-categories\|--book` fail-closed ; `run(argv, deps)` exporté ; A-8 corps hex réels ; `selection_sha256` vérifié 0 fetch. Conforme. |
| 6 | Mutants | **19/19 KILLED** rejoués par moi (`mutants-g1.log`, restauration byte-exacte). **9 à moi** (`my-mutants.mjs`) : V-M1 borne e2 `>=`→`>`, V-M2 `B0=B_first`, V-M3 `--b-hi` défaut `from_block`, V-M4 prober `B0:=B_first`, V-M5 `block_ts` jamais rempli, V-M6 sha AVEC `version_check` → **6/6 KILLED** ; V-M7 `preV33:true`, V-M8 tri A-rawlogs retiré, V-M9 union phase-change réduite → **3 SURVIVANTS** (voir C-V-5). |
| 7 | Oracle env -u @ `cec927e` | gate:vocab 0, typecheck 0, lint 0, ratchet 69/69, lang:gate 0, export:check 0, **test 887 / 886 / 0 fail / 1 skip** = `u4b_labels_replay_via_main_real_artifact` (pré-existant, nommé). **Fusion à blanc** avec `lot/etude-suite` @ `9644696` (branche `cp2-merge`) : typecheck 0, **887/886/0/1**. R-25 pathspec `ci.yml:65` : PR-C 125, PR-B 514, PR-A 683 (< 1 150 mission, < 1 205 `ci.yml:43`) ; total 1 322 > les deux ⇒ trois PR contre bases successives, jamais un squash. |
| 8 | Amendement ADR | Tuyaux 4 lignes `upcoming`, lignes figées §4, D-n, MAST. Deux inexactitudes sur pièces : C-V-3 (« PHASE 1 écrit ») et C-V-2 (caveat §3 « loin de e2 donc couvert »). |

**Chaîne réelle discover → sélecteur (CA-11 durci, aucun test committé ne la joue)** — `cp2-harness/chain.test.ts` : (a) sortie RÉELLE de `runDiscover` (fetch bouchonné, pool gardé réel) passée telle quelle à `runSelect` loin de e2 ⇒ **vert** (gagnant B_first, B0, n_eligible attendus, 0 fetch sélecteur) ; (b) un enregistrement WETH à `E2_HI − 100` + un à `E2_HI + 500` ⇒ **`brut has no ts for block 23557560 - u4b-discover must persist block_ts["23557560"]`**.

## 3. Checklist

- **CA-1** conforme : chaque livrable a des critères falsifiables (tests nommés, mutants rouges) ; reformulation : A = « applique §DISC au brut hors ligne, sortie sha-liée » ; B = « prober lit B0/B_last de l'épisode, e2 supprimé » ; C = « brut durable + `block_ts` ». 
- **CA-2** conforme : aucune décision de valeur nouvelle (défaut `--feed-proxy` §DISC:28 conservé et documenté ; N_min/e2 = prereg).
- **CA-3** conforme : amendement ADR daté fourni ; gates non suspendus.
- **CA-4** n-a (mono-worker + relecteur + validateur ; pas de fan-out).
- **CA-5** conforme : MAST C-9 §6 de l'amendement (dérive de format, vérification non indépendante, sélection sur l'issue) avec contre-mesures.
- **CA-6** conforme : oracle rejoué par moi + G2 en cours (l'acceptation reste conditionnée au G2, jamais l'un sans l'autre).
- **CA-7** correction : C-V-2 (refus nommé sans chemin de résolution = dette sans item formé), C-V-6.
- **CA-8** correction : `claude-opus-4-8[1m]` déclaré (préfixe conforme) ; générateur ≠ relecteur ; MAIS checkpoint-1 non persisté (C-V-6) et deux phrases ADR/commit inexactes (C-V-2, C-V-3).
- **CA-9** conforme : rejeu en instance/clone séparés, imposé par le système.
- **CA-10** conforme : aucun argument de vitesse.
- **CA-11** : registre public (site/README/skill/ADR) — **aucune revendication `built`**, 4 tuyaux `upcoming` ⇒ conforme sur l'axe registre. **Correction** sur l'axe composition (C-V-4) : la revendication ADR §2 « le triplet A-8 est le test d'intégration de bout en bout » est surclaimée — le test du sélecteur construit le brut à la main, et le tuyau `events → --events` du labeler n'est pas exécutable tel qu'écrit.
- **Anti-close** : n-a (Ukemi ; les littéraux `23545087/23552238` des tests sont des numéros de bloc = état on-chain public).

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée C-V-1..C-V-7)

**C-V-1 — BLOQUANTE (séquence de fusion, pas le code).** PR-B `7c3fa36` **seule est ROUGE** : `test/export-public.test.ts` `export_public_no_governance_no_french` lance `npm run ci` dans l'arbre exporté ⇒ `TS2307` ×2 sur `apps/sentinel/test/u4b-oracle-path.test.ts` (`u4-oracle-path.mjs`, `u4-guard.mjs` absents de l'export) parce que son entrée `export-exclude-tests.json` n'arrive qu'en PR-A `cec927e`. Mesuré `F:\tmp\cp2-u4b1b2-prb` : racine **207 / 205 / 1 fail** ; PR-C seule verte. A dépend de B (`canon`), donc l'ordre C→B→A est le seul ; **PR-B doit porter sa propre entrée d'exclusion** (le G1 §R-25 la plaçait en PR-B ; la couture appliquée a mis les deux en PR-A). Re-couture par l'orchestrateur, puis gates verts PR par PR.

**C-V-2 — BLOQUANTE avant la relance du discover et la course (item formé + code).** Le témoin de discover clusterise l'ensemble COMPLET ; le sélecteur re-clusterise l'ensemble e2-EXCLU ; `firstBlockAtOrAfter` (`windows.ts`) sonde des blocs qui dépendent de `bFirst`. Tout cluster dont le départ change une fois e2 retiré sonde des blocs que le témoin n'a jamais lus ⇒ refus nommé — et **discover n'a aucun chemin de code pour persister ces blocs** : le message « u4b-discover must persist block_ts[N] » est un cul-de-sac. Le prereg §Y (« résidu `outside_window` (e2 : 29) ») établit qu'il existe des enregistrements WETH dans `(23552238, 23557060]` ⇒ le témoin ouvre là un cluster dont la fenêtre 24 h SORT de e2 ; le premier WETH liquidé après `23557060` dans cette fenêtre déclenche le refus, et le décalage peut cascader (B_last décalé ⇒ départ suivant décalé) jusqu'au premier trou > 24 h. Le brut réel tranchera ; je n'affirme pas que cela se produira, j'affirme que le chemin de secours n'existe pas. Exigé : (i) item formé, propriétaire orchestrateur, déclencheur « avant la relance du discover (G1 item 4) », avec code — au choix : le témoin capture aussi les `block_ts` du re-clustering e2-exclu (D-n : collecte de ts seulement, pas de sélection), ou une sous-commande gardée `--fill-ts` du sélecteur (quorum-2 keyless, sidecar sha-lié, `--block-ts-extra`) ; **critère d'acceptation** : mon harnais (b) vert avec 0 réseau dans le sélecteur ; (ii) correction de la phrase ADR §3 « en pratique l'épisode frais est loin de e2, donc `block_ts` le couvre » — inexacte : le refus frappe TOUT cluster, pas le seul gagnant — AVANT insertion de l'amendement.

**C-V-3 — correction (CA-8, honnêteté ADR/commit).** « Brut écrit AVANT le témoin » (message PR-C, mission §4, ADR §3 « PHASE 1 écrit brut = {…, block_ts} ») est **infaisable tel qu'écrit** : `block_ts` est produit PAR le témoin ; le code fait UN seul `writeFileSync(out, …)` (`u4b-discover.mjs:122`) après le témoin best-effort. Le test prouve « écrit même si le témoin lève (exception capturée) », pas « avant » ; un kill dur pendant les sondes `eth_getBlockByNumber` perd encore les ~650 getLogs. Résolution au choix : (a) écriture durable pré-témoin (brut v2 `block_ts:{}` + `phase:"getlogs-only"`, puis réécriture finale — à vérifier que le test de sha v2 reste vert ; si oui, c'est gratuit) ; (b) reformuler ADR + commit et former l'item. Je recommande (a) : c'est le motif même du schéma v2.

**C-V-4 — correction (CA-11 durci).** Aucun test committé n'enchaîne la sortie RÉELLE de `runDiscover` vers `runSelect` (le test du sélecteur construit le brut à la main) ; mon `cp2-harness/chain.test.ts` (a) est la forme committable de ce test manquant. De plus, le tuyau « `events` → §5d `--events` » **n'est pas exécutable tel qu'écrit** : `parseEventsFile` (`u3-realized.mjs:401-403`) exige un FICHIER contenant un TABLEAU ; `episode-selection.json` est un objet — passé à `--events` il serait refusé ; le test C-2 extrait `file.events` à la main. Exigé : le sélecteur écrit `<out>/events-<episode_id>.json` (le tableau) référencé dans `episode-selection.json`, la ligne figée §4/§5d le nomme, et le test chaîné lit ce fichier via `parseArgs(["--events", <fichier écrit>])`. Pliable en PR-A (quelques lignes).

**C-V-5 — correction (force des tests).** Survivant V-M7 : `events[].preV33` basculé à `true` passe le test C-2 ; or `preV33=true` fait SAUTER au labeler gelé la lecture `DeficitCreated` (`u3-realized.mjs:599`) ⇒ Y silencieusement amputé de `deficit_base`. Ajouter `assert.equal(parsed[0].preV33, false)` dans `u4b_select_events_compose_with_the_labeler_parseArgs_and_predicate`. V-M8 (tri A-rawlogs, entrée déjà triée) et V-M9 (union phase-change, bouchon sans changement de phase) : faiblesses déclarées, non bloquantes.

**C-V-6 — correction (CA-8 provenance).** Persister le checkpoint-1 de ce lot dans `docs/CHECKPOINT1-lot-u4b-1b-2.md` (docs-only), comme tout autre lot. Vérifié par citation dans G1/ADR/mission : C-1 (`block_ts` v2), C-2 (adresse WETH + `parseArgs`), C-3 (sha brut A-rawlogs + forme `decodeLiquidationCall`), C-4 (`B_last` == recalcul labeler), C-5 (sha hors `version_check`, STOP H-1), C-7 (`usdt_blocks_status "omitted"`), C-9 (MAST) — **pliées**. **C-6 et C-8 : invérifiables** sans le texte source (les jetons « C-5/C-6 », « C-8 » des commentaires de code peuvent porter la numérotation de lots antérieurs et ne valent pas preuve).

**C-V-7 — nit, non bloquant.** `assertOutDir` (`u4b-select-episode.mjs`) annonce « OUT of the repo AND not under fixtures » mais n'impose que fixtures (lettre de la mission) ; aligner le commentaire ou ajouter le contrôle hors dépôt que le prober applique déjà à `--raws-dir`.

Pas d'ESCALADE : aucune décision de valeur/périmètre, G7 non rendu, toutes les corrections sont des items techniques propriétaire orchestrateur. Items formés G1 (prereg §5b `--block-operators` stale, §5b-bis/§5a/§5e, ordre labeler→prober, relance discover) : reçus, à l'orchestrateur.

## 5. Preuve AM-2 ter (dépôt intact)

- `F:\Monark` HEAD `9644696` avant = après ; `F:\Monark-wt-u4b1b2` HEAD `cec927e`, status 0 ligne avant = après. Blobs `lot/u4b-1b-2` : `u4b-select-episode.mjs 81b839f8…`, `u4-oracle-path.mjs a2b39d0e…`, `u4b-discover.mjs 63caa853…` = DELIVERED avant = après.
- `git -C F:\Monark status --porcelain` : 0 ligne au départ, **1 ligne à l'arrivée : `?? docs/token/SOURCES-coingecko.md`** (écrit 16:12:43 par un chercheur Sonnet 5 « dossier CoinGecko » — **pas moi**, non touché, non bloquant, déclaré).
- Mes écritures : uniquement `F:\tmp\cp2-u4b1b2\` (+ `cp2-harness/`, branche `cp2-merge`, worktrees `-prb`/`-prc`) et `F:\tmp\cp2-u4b1b2-logs\`. Aucun `git` dans `F:\Monark`, aucune installation.

## 6. AM-1 — ce que la checklist a attrapé

PR-B rouge seule (export-exclude en PR-A) ; refus e2-adjacent nommé sans chemin de résolution (mesuré par chaîne réelle) ; « brut AVANT le témoin » ≠ code ; chaîne A-8 surclaimée + `--events` non exécutable sans extraction manuelle ; survivant `preV33` (Y amputé en silence) ; checkpoint-1 non persisté.

Modèle résolu : claude-fable-5-1 (effort high).
