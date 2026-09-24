Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, contrôle R-1).

# CARTOGRAPHIE DU BRANCHEMENT : MONARK, HEAD `7224c79`, 2026-09-24

> Worker CARTOGRAPHE (passation `docs/PASSATION-2026-09-24.md` §1 ; règle Branchement du CLAUDE.md global, 2026-09-19).
> Lecture seule du dépôt ; seule écriture dans `F:\Monark` : ce fichier. Aucun commit, aucun workflow (R-20). Sortie = donnée
> brute pour l'orchestrateur, à vérifier adversarialement avant consommation (R-21) : chaque chiffre est mesuré dans cette
> session (commande au §10, donnée dans `F:\tmp\carto-0924\graph.json`) ou cité d'un document du dépôt avec `fichier:ligne`.
> Mise à jour, pas refonte, de `docs/etude-suite-2026-09-18/CARTOGRAPHIE-code.md`, `docs/etude-suite-2026-09-18/FICHES-pieces.md`,
> `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md` et `docs/carto/CARTOGRAPHIE-TEMPS-1-COURSE-2026-09-23.md` : leurs constats sont
> re-mesurés et marqués inchangé, changé ou clos. Dimension neuve par rapport aux cartes du 22 et du 23 : les chemins servis sont
> lus EN LIGNE (GET, `tools/list`), dans la liste d'hôtes permise par la mission.

## Needs from you (orchestrateur)

1. **CARTO-BR-3, avant l'étape 3 de la fenêtre W d'U-4b-2b** (`docs/adr/ADR-U4b-2b-classe-servie.md:246`) : le prochain
   redéploiement du harness redéploie aussi la sentinelle Narabi (arbre partagé), qui tourne aujourd'hui `bb41b6d` avec 8 fichiers
   de sa fermeture en retard sur HEAD (`packages/rpc-guard/src`, +201/−15) et changera encore avec `apps/harness/src/calibration.ts`
   (-2b) ; le témoin `sentinel_sha` ne couvre aucun de ces fichiers (`apps/sentinel/src/run.ts:157`). SENTINEL-DEPLOY-GUARD-1
   (déclencheur « avant tout prochain redéploiement harness ») n'est ni codé (`scripts/verify-harness.mjs` : 0 occurrence de
   « sentinel ») ni listé dans les préconditions de W (`docs/adr/ADR-U4b-2b-classe-servie.md:232`). Ruling demandé (§8.1).
2. **CARTO-BR-1, ruling orchestrateur** (acte investisseur seulement si l'option (a) est retenue) : la copie immuable servie de la
   provenance seq 1 (`https://bell.monarkgate.tech/provenance/4935a259….json`, `Cache-Control: immutable`) porte toujours
   `databento`, ce que l'ADR elle-même qualifie de « contradiction publique avec les Terms servis » (`docs/adr/ADR-BELL-CASH-LEG-1.md:10`,
   Terms `apps/site/data/bell-legal.json:56`). Seq 2 a corrigé la tête, pas la chaîne, que D3 garde servie en ajout seul
   (`docs/adr/ADR-BELL-CASH-LEG-1.md:20`). Les deux opérateurs RPC nommés par la provenance seq 2 sont hors périmètre par texte daté
   (`docs/adr/ADR-BELL-CASH-LEG-1.md:11`, « étiquette nue : conforme ») : pas un écart. Options au §8.1.
3. **Persistance** : je n'ai écrit que ce fichier. Si tu consommes le graphe et les paires comme preuve, copie
   `F:\tmp\carto-0924\graph.json` (sha256 `1ddc2e5871e2b07eadfbe3abb8267ff2ded43e509019a6c31db9492511d6208e`) et
   `F:\tmp\carto-0924\work\flows-2026-09-24.json` (sha256 `0a6ed1b59e5e9b034eeb8ffa25fae926a0eb3939e1be2798fe4128ab434e0e9b`) sous
   `docs/carto/`, comme aux cartes précédentes.
4. **Deux lectures SSH seules possibles (acte orchestrateur)** : `ls -l /var/lib/monark-sentinel/public/` sur l'hôte vitrine
   (ferme TIMELINE-PATH-1 : le chemin est déclaré `deploy/Caddyfile.monark-narabi.snippet:12` et `deploy/monark-sentinel.service:19`,
   le V-4 public est fait, §8.2) ; le champ d'état de `/var/lib/monark-probe/narabi.json` sur l'hôte Bell (résultat de la sonde,
   non servi publiquement, §9).
5. **CARTO-BR-2** : confirmer que l'item consolide SYNC-CHECK-MODE-1 et BELL-VERIFY-SCHEDULE-1 (un seul item, pas trois) et son
   déclencheur (§8.1).

## 0. Provenance, portée, méthode

| Élément | Valeur mesurée |
|---|---|
| Modèle (R-1) | `claude-opus-5-5[1m]`, effort max |
| Horloge (`date -u`) | début 2026-09-24T08:49:39Z ; lectures en ligne 08:58:08Z → 09:00:36Z ; contrôles `--check` 09:01:19Z et 09:01:20Z ; tests ciblés 09:05:29Z → 09:08:04Z ; fin au §10 |
| Arbre mesuré | clone `git clone --no-hardlinks --branch lot/etude-suite F:/Monark F:/tmp/carto-0924/clone`, HEAD `7224c79598687cfc027c875df9d2a835f4d9b52a` ; `git status --porcelain` = 0 ligne au début et après toutes les mesures ; `npm ci --offline --ignore-scripts --cache F:/tmp/npm-cache` : 283 paquets, 0 accès réseau, 10 jonctions `node_modules/@monark/*` toutes DANS le clone (mesuré par `Get-ChildItem … LinkType`) |
| Code vs passation | `git diff --stat e1a1e7e 7224c79` = `docs/CHANTIERS.md` seul ; `git log 3428dfa..7224c79` = 2 commits de journal ; 0 fichier de code (apps, packages, scripts, test, deploy, fixtures, schemas) depuis l'upload 16 |
| Réseau | 31 lectures enregistrées (`F:\tmp\carto-0924\live\index.tsv`, heure, statut, IP, taille, sha256 par corps) par `live-get.sh`, qui refuse tout hôte hors liste et tout POST autre que `tools/list` : 17 pages de `monarkgate.tech`, `/narabi/state.json`, `/narabi/timeline.jsonl`, `/bell/anchors/anchors.json`, 9 lectures `bell.monarkgate.tech` (racine, 4 fichiers courants, 4 copies immuables), `api.monarkgate.tech/openapi.json`, 1 POST `tools/list` sur `mcp.monarkgate.tech/mcp` (forme exacte de `scripts/verify-harness.mjs:219-221`, sans `initialize`). S'y ajoutent les GET internes des deux `sync-narabi-* --check` (mêmes hôtes). Aucun `/health`, aucun POST `/gate`, aucune clé lue ni affichée |
| Hôtes (IP lue par curl) | `monarkgate.tech`, `api.`, `mcp.` = `31.97.155.188` ; `bell.monarkgate.tech` = `178.16.131.29` |
| A-7 | toute commande node sous `env -u HELIUS_API_KEY … -u DATABENTO_API_KEY`, `TEMP/TMP/TMPDIR=F:/tmp/carto-0924/work/os-tmp` ; rien sur C: |
| Outils | `graph.mjs` sha256 `a772fd8d…` = `graph.mjs` `3d73ec99…` (cartes du 22 et du 23) + `patch-graph.mjs` (points d'entrée et pièces seulement : publieur Bell, vérificateur, CA, outils de synchro du site ; §4.3) ; `carto.mjs` `8bc5fd4f…` inchangé ; neufs sous `F:\tmp\carto-0924\work\` (sha au §10) |
| Livrables | ce fichier ; `graph.json` (434 nœuds, 1 321 arêtes AST avec lignes, 29 points d'entrée, paires et registre de `flows-2026-09-24.json`, 12 mesures embarquées avec leur sha256 ; 675 729 octets ; deux générations octet pour octet identiques) ; `flows-2026-09-24.json` (23 paires, 15 lignes de registre, **103 citations vérifiées mécaniquement par `graph.mjs --flows` : 64 `fichier:ligne:texte`, 39 titres de test, 0 échec**) ; corps lus en ligne sous `F:\tmp\carto-0924\live\` |
| Barème | repris de `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md` §0 sans redéfinition : **câblé** = consommateur sur un chemin SERVI et test d'intégration non-LLM nommé qui rejoue la composition ; **fixture:test** / **fixture:course** = aucun chemin servi (vaut `upcoming`) ; **absent** = tuyau annoncé sans code. Sous-label **câblé (acte opérateur)** : même définition, mais le transfert producteur → consommateur servi est un geste manuel non planifié ; appliqué à l'identique au collecteur Bell (bundle porté à la main vers le publieur servi) et aux 7 synchros servi → site (capture portée à la main vers le site servi). Paires de procédure pure (déploiement, CA) : présent / testé / non testé, hors barème servi. Colonne **déployé** : SHA qui tourne |
| Niveaux de preuve | **[lu]** = mesuré dans cette session (lecture en ligne, exécution, objets git ou fichier du clone). **[2nd]** = fait repris d'un document du dépôt (journal, CA committée, ADR) sans re-mesure, toujours avec `fichier:ligne` ; la voie qui le rendrait [lu] est donnée au §9 (lecture sur l'hôte par l'orchestrateur ; aucune source externe, donc aucun procurement). **[abs]** : non utilisé. Tout chiffre sans marque est [lu] |
| Oracle complet | lancé à 09:09Z puis **arrêté volontairement à 09:09:37Z** après 26 résultats (0 échec) : la machine porte des workers concurrents (implémentation U-4b-2b, checkpoint-2 bis CodeQL, G0 OTS) et le test 42 casse sous charge (T42-LOAD-1, passation §0) ; je n'ai pas voulu fausser leurs oracles. Non probant, non utilisé. Preuve retenue : exécution ciblée, fichier par fichier, seul (§2, §3) |

## 1. Verdict d'ensemble (données, pas verdict G7)

1. **Registre public concordant, dans le code, dans le déployé ET en ligne.** Les 4 agents `built` (Shōgen, Hikae, Ukemi, Narabi) et
   l'application `built` (MONARK Bell) ont chacun au moins un chemin servi **lu en ligne aujourd'hui** et des tests d'intégration
   non-LLM nommés qui passent : 35 fichiers de test exécutés seuls (un chemin périmé de ma liste, voir §3.6), **409 tests, 408 pass,
   0 échec, 1 skip** (SIGTERM win32 déclaré) ; **41 tests nommés sur 41 déclarés et verts**, dont les 8 identifiants distincts
   d'`integration_test` du registre (9 citations, `probe_harness_records_real_decision` sert Hikae et Ukemi) et les deux gardes du
   registre `fleet_register_built_set_is_frozen` et `registry_notes_track_served_descriptions` (le skip conditionnel de
   `verify_bell_ca_check5_runs_real_bell_verify` n'a pas joué : exécuté et vert).
   Les 12 pièces `upcoming` (7 agents, 5 applications) : 0 fichier de code backend (§2.2).
2. **Ce qui est servi égale ce qui est committé.** Bell : les 4 corps servis ont les sha256 de `docs/deploy-CA-bell.json` et de
   `apps/site/data/bell-served.json` ; le vérificateur committé, rejoué hors ligne sur les 8 fichiers lus en ligne avec le trousseau
   committé, rend `consistent_with_supplied_keyring` et une sortie **octet pour octet égale** à celle du contrôle c05 de la CA
   (sha256 `814b5794…12f1`). Harness : `openapi.json` servi = CA harness = trois fichiers du site (`ad437121…`) ; `tools/list` servi =
   `harness-served.json` (`8d3743c7…`). Narabi : `state.json` et `timeline.jsonl` servis = capture committée (sha égaux),
   `sync-narabi-capture --check` et `sync-narabi-served --check` verts. Les pages `/fleet` et `/ukemi` servies passent les
   assertions du dépôt (`assertFleetBody`, `assertUkemiBody`) appliquées au HTML lu en ligne. 17 pages sur 17 en 200, 0 nom de
   fournisseur, 0 mot de cuisine (décisions 69 et 168).
3. **Déployé contre HEAD, par processus servi** (fermetures d'exécution `graph.json` [lu] ; SHA déployés [2nd] sauf mention) :
   harness `bb41b6d` 0 fichier sur 46 (corps servis = CA [lu]) ; site `3428dfa` 0 sur 95 (rendu servi = registre HEAD [lu]) ; sonde
   `c0027cb` 0 sur 1 ; publieur Bell `1eaeef9` 1 sur 2, **commentaire seul** (2 lignes) ; **sentinelle `bb41b6d` 8 sur 46**
   (`packages/rpc-guard/src`, GARDE-FSYNC-1 et UKEMI-REVERT-1 exécutables, `transport.ts` commentaire). Pour la sentinelle, la part
   [lu] est que ses sources de tête (`apps/sentinel/src/*.ts`) sont celles du code -1d (`sentinel_sha` de la dernière ligne servie =
   calcul sur objets git) ; le SHA `bb41b6d` des autres fichiers de sa fermeture reste [2nd] (`docs/JOURNAL-PROVENANCE.md:358`).
4. **Trois écarts neufs, tous formés** (§8.1) : CARTO-BR-1 (contradiction publique Bell : la copie immuable de la provenance seq 1
   nomme `databento` contre les Terms servis), CARTO-BR-2
   (fraîcheur servi → site = acte opérateur non planifié, 5 outils de synchro sur 7 sans `--check`), CARTO-BR-3 (redéploiement
   couplé, bloquant pour la fenêtre W d'U-4b-2b). **Clos par mesure** : CARTO-T1C-9 (erratum), T1C-10, T1C-11, T1F-1 (V-4 public),
   T1F-3, FAULTS-PROVIDER-NAME-1 (b) pour la tête seq 2. **Ouverts, re-mesurés** : T1C-3 (déclencheur -2b), T1C-4, T1C-7, T1C-8
   (réduit), SENTINEL-DEPLOY-GUARD-1, TIMELINE-PATH-1 (reste la lecture sur l'hôte). Aucun « dû » nu.
5. **Réponses aux trois questions de la passation** (§7) : Ukemi, « classe calibrée non servie » : **toujours vrai**, et désormais
   dit sur le site avec les mots servis ; Narabi : `state.json` est rafraîchi par la **sentinelle** (la sonde observe), dernière
   fenêtre 2026-09-23 publiée à 00:52:37Z, fraîche ; Bell : seq 2 synchronisée (`read_at` 08:43:45Z), identique au servi à 08:58Z,
   mais la synchro reste un acte à refaire à chaque publication (CARTO-BR-2).

## 1 bis. Table de synthèse

| Pièce ou tuyau | Statut registre | Statut mesuré | Écart | Item |
|---|---|---|---|---|
| Shōgen | `built` | câblé (attest → gate servi) ; entrée = fixture committée unique | aucun | aucun |
| Hikae | `built` | câblé (gate, calibrate servis, = CA) | aucun | aucun |
| Ukemi | `built` | câblé, effet servi constant (abstention) ; classe calibrée absente | aucun au registre (réserve dite sur le site) | U-4b-2b en vol ; CARTO-T1C-3 |
| Narabi | `built` | câblé ; fenêtre du 2026-09-23 publiée à 00:52:37Z | aucun | aucun |
| MONARK Bell (application) | `built` | câblé (hôte, vérificateur, site) ; publication et synchro = actes opérateur | provenance immuable seq 1 contre Terms servis | CARTO-BR-1 ; CARTO-BR-2 |
| Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi, Genkan | `upcoming` | absent (0 code backend) | aucun | aucun |
| Firebreak, Warden, Softlanding, Verdict, Ballast | `upcoming` | absent (0 code backend) | aucun | aucun |
| Bell publieur | (Bell) | câblé ; déployé `1eaeef9` [2nd], écart commentaire seul [lu] | CA non planifiée | CARTO-BR-2 (consolide BELL-VERIFY-SCHEDULE-1) |
| Bell collecteur | (Bell) | câblé (acte opérateur) ; jambe cash en service (`no_close_ref` 0 servi) | aucun (pas de minuteur, déjà formé) | BELL-COLLECT-TIMER-1 (existant) |
| Bell vitrine | (Bell) | câblé (acte opérateur), à jour à 08:58Z | fraîcheur sans contrôle mécanique | CARTO-BR-2 |
| Ukemi course (recorder, prober, labeler, rapport) | non revendiqué | fixture:course ; rapport → site câblé (acte opérateur) | aucun | aucun |
| Ukemi gate liq | (Ukemi) | câblé, abstention constante (registre vide servi) | aucun | U-4b-2b |
| Narabi timeline | (Narabi) | câblé, frais | aucun | TIMELINE-PATH-1 (réduit) |
| Narabi sonde | (Narabi) | câblé ; résultat non lisible de l'extérieur | aucun | Needs from you 4 |
| Narabi site | (Narabi) | câblé (lecture navigateur + capture câblée par acte opérateur) | aucun | aucun |
| Harness MCP, HTTP, openapi | (Hikae, Shōgen, Ukemi) | câblé ; corps servis = CA [lu] | README du harness en retard ; version `0.4.0` contre tags | CARTO-T1C-3 ; passation §7 |
| Harness CA | procédure | présent, testé ; 0 contrôle sentinelle | redéploiement couplé non gardé | CARTO-BR-3 ; SENTINEL-DEPLOY-GUARD-1 |
| Arbre partagé harness et sentinelle | procédure | présent, non testé ; sentinelle en retard de 8 fichiers | oui, bloquant avant W d'U-4b-2b | CARTO-BR-3 |
| Garde budgétaire rpc-guard, ledgers | non revendiqué (interne) | fixture:course ; code dans la fermeture servie de la sentinelle, non exécuté (`unconfigured`) | aucun public | C-6 GARDE-FSYNC-1 (existant) |
| SKILL `skills/monark`, registre MCP | non revendiqué au registre | en retard (pas de Bell ; `0.4.0`) | déclaré | passation §7 (décision 163) |

## 2. Les pièces du registre public (`apps/site/lib/fleet.ts`)

### 2.1 Pièces `built`

| Pièce (rôle, statut) | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Chemin servi, mesuré en ligne | Tests non-LLM exécutés (tous verts) | Déployé | Verdict |
|---|---|---|---|---|---|---|---|
| **Shōgen** (sensor, `built`, `apps/site/lib/fleet.ts:133`) | la fixture committée UNIQUE `fixtures/s3-binance.*` (`apps/harness/src/shogen-fixture.ts:23`), projetée par `attest` ; le vérifieur n'est pas exécuté à l'appel (`apps/harness/src/tools/attest.ts:6`). Aucune arête d'exécution de `F:\Shogen` (campagne S2) vers MONARK | `gate` servi par la clé d'enveloppe `attested` (`apps/harness/src/tools/registry.ts:40`, `:68`) | sans état (serveur frais par requête) | `tools/list` contient `attest` et `gate` ; `/gate` de l'openapi a les clés `prediction`, `params`, `attested` (08:58:09Z) | `gate_attested_concordant_files_residual` (`apps/harness/test/gate.test.ts:762`) | `bb41b6d` [2nd] = HEAD sur la fermeture [lu] | **câblé** (entrée = fixture, déclarée « demonstrative, not probative » dans le texte servi) |
| **Hikae** (gate, `built`, `apps/site/lib/fleet.ts:148`) | une `Prediction` (appelant, `cascade`, `fromAttestedFlow`) + calibrations committées ou BYO | `GateDecision` au client MCP et au miroir HTTP | sans état ; calibrations = constantes committées | 4 outils (`attest`, `calibrate`, `cascade`, `gate`), 4 chemins openapi, `info.version` `0.4.0` = `apps/harness/src/version.ts:22` | `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:102`), `probe_byo_demo_loop_closes` (`test/byo-demo-probe.test.ts:78`), `gate_stable_run_honesty_text_is_keyed_A2_A7f` (`apps/harness/test/gate.test.ts:529`), `mcp_tools_have_no_side_effects` (`apps/harness/test/registry.test.ts:50`) | `bb41b6d` [2nd] = HEAD sur la fermeture [lu] | **câblé** |
| **Ukemi** (act, `built`, `apps/site/lib/fleet.ts:174`) | matrice portée par l'appelant → `runCascade` (`apps/harness/src/tools/registry.ts:85`) ; classe `liquidation-eligible-coverage` (`apps/harness/src/tools/gate.ts:77`) sur registre vide ; course U4b hors ligne (machine opérateur) → rapport | `gate` (abstention `under_calib` par construction sur les deux jambes) ; rapport → `/ukemi/course` par synchro | registre liq committé vide ; `apps/site/data/ukemi-served.json`, `apps/site/data/ukemi-course.json` | description `gate` servie (openapi ET `tools/list`, identiques) : clause registre vide présente, phrase H-3 et phrase de borne haute absentes ; `/ukemi` servi passe `assertUkemiBody` (0 jeton numérique, statut `built`) ; `/ukemi/course` 200 | `probe_harness_records_real_decision` ; `u4b_gate_serves_region_from_real_artifact` (`apps/harness/test/gate-liq-artifact.test.ts:44`) ; `site_ukemi_served_state_bound_to_harness_registry` (`test/site-ukemi.test.ts:608`) | `bb41b6d` [2nd] = HEAD sur la fermeture [lu] | **câblé, effet servi constant** (abstention) ; classe calibrée **absente** (lot U-4b-2b) |
| **Narabi** (sensor, `built`, `apps/site/lib/fleet.ts:204`) | pool RPC public (7 opérateurs servis, mode `unconfigured`) → `run.ts` ; `fromAttestedFlow` (`apps/sentinel/src/flow.ts:15`) | `timeline.jsonl` et `state.json` publiés, lus par les îlots navigateur du site (`apps/site/components/narabi/narabi-live.tsx:77`, `apps/site/app/fleet/narabi-freshness.tsx:36`) et par la sonde ; `gate` classe stable-run | `/var/lib/monark-sentinel` et `public/` (`deploy/monark-sentinel.service:19`, `deploy/Caddyfile.monark-narabi.snippet:12`) | 200, 7 lignes chaînées, dernière = jour 2026-09-23, T 6, `sentinel_sha` `e73866a8…`, 7 endpoints ; `Last-Modified` 00:52:37 GMT ; `state.digest` = `digest_T` de la dernière ligne ; description `gate` servie nomme `stable-run-velocity-24h` | `narabi_live_parses_real_state_shape` (`test/narabi-live.test.ts:184`), `gate_stable_run_usde_committed_region_A7b` (`apps/harness/test/gate.test.ts:483`), `narabi_gate_facts_read_from_committed_sources` (`test/narabi-live.test.ts:539`), `probe_state_mismatch_drives_smtp_alert_merged` (`test/probe-narabi.test.ts:720`) | sentinelle : sources de tête = code -1d [lu] (`sentinel_sha` servi), SHA `bb41b6d` [2nd], 8 fichiers de fermeture en retard ; sonde `c0027cb` [2nd] (`docs/JOURNAL-PROVENANCE.md:351`), fermeture = HEAD [lu] | **câblé** |
| **MONARK Bell** (application, `built`, `apps/site/lib/fleet.ts:349`) | collecteur `runMain` (`apps/bell/src/collect.ts:644`) lancé par l'opérateur (`apps/bell/ops/launch-q6.sh`), contrôles Q6 (C14 bloquant), bundle déposé à la main (RUNBOOK étapes 9-12) ; publieur démarré à la main, hors réseau, clé par `LoadCredential` (`deploy/monark-bell-publish.service:26`, `:27`, `:43`) | fichiers servis de `bell.monarkgate.tech` ; vérificateur côté lecteur ; site `/bell`, `/bell/method`, `/`, `/products` via `bell-served.json` | `/var/lib/monark-bell/public` (`deploy/Caddyfile.monark-bell:12`) ; trousseau committé `apps/bell/keys/bell-keyring.json` | 2 lignes (seq 1 ; seq 2 publiée 2026-09-24T08:41:21.864Z) ; 4 corps = CA = données du site ; racine `/` = 302 vers `https://monarkgate.tech/bell` ; vérificateur sur miroir des lectures : `consistent_with_supplied_keyring`, 0 rupture ; résidu `no_close_ref` = 0 sur les 3 runs de seq 2 (4 sur l'unique run de seq 1) : jambe cash en service | `verify_bell_ca_check5_runs_real_bell_verify` (`test/verify-bell.test.ts:227`), `bell_served_data_matches_deploy_ca` (`test/bell-served.test.ts:114`), `bell_publish_consumes_real_runmain_output_end_to_end` (`apps/bell/test/bell-served-e2e.test.ts:25`), `bell_deploy_config_publish_unit_least_privilege_offline` (`test/bell-deploy-config.test.ts:52`) | publieur `1eaeef9` [2nd] (CA committée : `g7`, contrôle c11 `tree=true`) ; HEAD = +2 lignes de commentaire [lu] ; corps servis = CA [lu] | **câblé** ; écart CARTO-BR-1 (§8.1) |

Aucune valeur de marché n'est recopiée : pour Bell, seuls des hachés, des comptes de résidus et des horodatages ; les `gT` servis
(chaînes) n'ont pas été lus.

### 2.2 Pièces `upcoming` (mesure : aucun code)

`grep -rli <nom>` sur `packages`, `apps/harness`, `apps/sentinel`, `apps/bell`, `scripts` (fichiers `.ts`, `.mjs`, `.tsx`) :

| Pièce | Statut registre | Fichiers backend | Fichiers `apps/site` (présentation) | Verdict |
|---|---|---|---|---|
| Mokugeki (sensor) | `upcoming` | 0 | 10 | absent, concordant |
| Kaihi (act) | `upcoming` | 0 | 10 | absent, concordant |
| Kessai (act) | `upcoming` | 0 | 9 | absent, concordant |
| Kamae (act) | `upcoming` | 0 | 10 | absent, concordant |
| Kyokusen (act) | `upcoming` | 0 | 10 | absent, concordant |
| Koyomi (act) | `upcoming` | 0 | 9 | absent, concordant |
| Genkan (distribution) | `upcoming` | 0 | 11 | absent, concordant |
| MONARK Firebreak, Warden, Softlanding, Ballast | `upcoming` | 0 chacune | 3 chacune | absent, concordant |
| MONARK Verdict | `upcoming` | 0 pour « MONARK Verdict » (le mot nu « Verdict » touche 82 fichiers par `CoverageVerdict`, contrat, pas l'application) | 21 | absent, concordant |

## 3. Les tuyaux internes, paire par paire

Les identifiants prolongent ceux du 22 et du 23 (`P-N*`, `P-U*`, `P-T*`, `P-B*`) ; `P-S*` = synchro servi → site (neuf). Chaque ligne a
ses citations vérifiées dans `flows-2026-09-24.json`.

### 3.1 Bell

| # | Producteur → artefact → consommateur | Verdict | Test non-LLM (vert) | Mesure en ligne / déployé |
|---|---|---|---|---|
| P-B1 | lanceur opérateur → `collect.ts runMain` → bundle (état, journal, provenance, timeline) → inbox du publieur (RUNBOOK 9-12) | **câblé (acte opérateur)** : consommateur = publieur servi, transfert à la main (RUNBOOK 9-12), aucun minuteur (item BELL-COLLECT-TIMER-1) ; composition collecteur → publieur rejouée par test (`bell_publish_consumes_real_runmain_output_end_to_end`, P-B4) | `bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs` (`apps/bell/test/bell-ops.test.ts:156`), `bell_cash_labels_are_generic` (`apps/bell/test/close.test.ts:163`) | seq 2 collectée sur l'arbre `77153d5` [2nd] (`docs/CHANTIERS.md:1406`, `:1416`) ; publiée à 08:41:21.864Z (ligne servie) [lu] |
| P-B4 | bundle → `bell-publish.mjs` (oneshot, main) → `/var/lib/monark-bell/public` → Caddy statique ; `/` → 302 | **câblé** | `bell_publish_consumes_real_runmain_output_end_to_end` (`apps/bell/test/bell-served-e2e.test.ts:25`), `bell_cash_fault_label_publishes_through_real_publisher` (`apps/bell/test/bell-served-e2e.test.ts:101`), `bell_caddyfile_root_redirects_to_site_bell_page` (`test/bell-deploy-config.test.ts:131`), `no_cash_cross_provider_name_on_bell_served_files` (`test/no-cash-provider-name.test.ts:69`) | 4 × 200 (08:58:10Z → 08:58:12Z), 302 + `Location` ; fermeture du publieur = `{bell-publish.mjs, bell-chain.mjs}`, 0 `@monark/*` (conforme à `deploy/monark-bell-publish.service:21`) ; déployé `1eaeef9`, écart commentaire seul |
| P-B7 | fichiers servis → `bell-verify.mjs` + trousseau committé | **câblé** (côté lecteur, exporté) | `verify_bell_ca_check5_runs_real_bell_verify` (`test/verify-bell.test.ts:227`) | rejoué hors ligne sur le miroir des 8 lectures : statut `consistent_with_supplied_keyring`, `lines` 2, `head_seq` 2, `breaks` [] ; sortie = sha du contrôle c05 |
| P-B8 | `scripts/verify-bell.mjs` (opérateur, à la main) → `docs/deploy-CA-bell.json` | présent, testé (procédure), **non planifié** | `verify_bell_ca_checks_named_and_fail_closed` (`test/verify-bell.test.ts:116`) | CA 12/12 à 2026-09-24T08:41:49Z, `g7` `1eaeef9` ; aucune exécution planifiée (BELL-VERIFY-SCHEDULE-1, rattaché à CARTO-BR-2) |
| P-B5 | hôte servi → `scripts/sync-bell-served.mjs` (`:39`, `:81`) → `apps/site/data/bell-served.json` → `/bell`, `/bell/method`, `/`, `/products` | **câblé (acte opérateur)** (données committées liées par test à la CA et à la dernière publication) ; **pas de `--check`** | `bell_served_data_matches_deploy_ca` (`test/bell-served.test.ts:114`), `bell_served_build_binds_the_latest_publication_not_the_first` (`test/bell-served.test.ts:321`), `bell_pages_render_served_values_never_typed` (`test/bell-served.test.ts:406`) | `read_at` 2026-09-24T08:43:45Z ; corps servis à 08:58Z = `bodies_sha256` ; `/bell` servi porte le haché de tête seq 2 (2 occurrences) ; la note Bell du registre est rendue sur `/bell`, `/products` et `/` |
| P-B6 | `docs/course-bell/ANCHORS.md` → `scripts/sync-bell-anchors.mjs` (`:25`) → `/bell/anchors` | **câblé (acte opérateur)** (ancrage amont procédural) | `bell_anchors_served_register_matches_source` (`test/bell-anchors.test.ts:28`) | `/bell/anchors` et `anchors.json` en 200 ; ancrage des têtes = G0 BELL-OTS-ANCHOR-1 en vol (décision 186) |
| P-B2 | têtes de ledger → OpenTimestamps | procédural (inchangé) | aucun (item B-code du 22) | G0 OTS en rédaction (fichier non suivi `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` présent dans `F:\Monark`, pas à moi) |
| P-B3 | contrôle planifié de l'hôte Bell | **absent** | aucun | BELL-VERIFY-SCHEDULE-1 (formé, lot suivant, `docs/G1-lot-bell-cash-leg-1.md:219`) |

### 3.2 Ukemi

| # | Producteur → artefact → consommateur | Verdict | Test (vert) | Mesure en ligne / déployé |
|---|---|---|---|---|
| P-U11 | `packages/ukemi` → `runCascade` → `Prediction` → `gate` | **câblé, vacue** | `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:102`) | `cascade` servi (description « v0 ») ; `bb41b6d` [2nd] = HEAD sur la fermeture [lu] |
| P-U9 | registre liq committé (vide) → `gate` classe `liquidation-eligible-coverage` | **câblé, abstention constante** | `u4b_gate_serves_region_from_real_artifact` (`apps/harness/test/gate-liq-artifact.test.ts:44`) | clause registre vide servie (openapi et `tools/list`) |
| P-U8 | réduits et scores frais → `record-u4b-calib` → entrées s0 de `calibration.ts` | **absent** (lot U-4b-2b en implémentation ; `lot/u4b-2b` = base `7957908`, 0 commit) | générateur seul (inchangé) | registre servi vide |
| P-S2 | openapi servi → `scripts/sync-ukemi-served.mjs` (`:91`) → `ukemi-served.json` → `/ukemi/course`, `/`, `/fleet` | **câblé (acte opérateur)** (lié au registre du dépôt) ; pas de `--check` | `site_ukemi_served_state_bound_to_harness_registry` (`test/site-ukemi.test.ts:608`) | `body_sha256` synchronisé (`read_at` 01:48:50Z) = openapi servi à 08:58:09Z |
| P-S3 | rapport de course (machine opérateur) → `scripts/sync-ukemi-course.mjs` (`:31`) → `ukemi-course.json` → `/ukemi/course` | **câblé (acte opérateur)** (copie liée à son digest de production) ; source = course | `site_ukemi_course_digest_bound_to_production_record` (`test/site-ukemi.test.ts:1025`) | `/ukemi/course` 200 |
| P-U1 à P-U7, P-U13 à P-U21 | chaîne de course (discover, select, prober, labeler, recorder, sonde (d), rapport) | **fixture:course**, inchangé | inchangés (verts dans l'oracle ciblé : `u4b_chain_select_to_oracle_path` (`apps/sentinel/test/u4b-chain.test.ts:158`), `ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go` (`apps/sentinel/test/ukemi-guard-record.test.ts:485`)) | relocalisation des citations du 23 : 145 gardées, 50 déplacées, 8 non résolues, toutes expliquées au §3.6 |

### 3.3 Narabi

| # | Producteur → artefact → consommateur | Verdict | Test (vert) | Mesure en ligne / déployé |
|---|---|---|---|---|
| P-N1 | `run.ts` (`apps/sentinel/src/run.ts:358`, `:360`) → `public/` → Caddy → îlots navigateur du site (lecture même origine) + capture committée | **câblé** | `narabi_live_parses_real_state_shape` (`test/narabi-live.test.ts:184`) | voir §2.1 ; déployé `bb41b6d` (preuve publique : `sentinel_sha` servi = calcul de `sentinel-sha.mjs` sur `bb41b6d`, `d0535cb` et `7224c79`, les trois égaux à `e73866a8…`) |
| P-N2 | fichiers servis → sonde (hôte Bell, `deploy/monark-probe.service:24`) → `narabi.json` → SMTP | **câblé** | `probe_state_mismatch_drives_smtp_alert_merged` (`test/probe-narabi.test.ts:720`), `probe_alert_composition_from_fixture` (`test/probe-narabi.test.ts:682`), `probe_chainstack_present_from_real_producer_line` (`test/probe-narabi.test.ts:314`) | résultat de la sonde non lisible de l'extérieur (§9) ; déployé `c0027cb` = HEAD ; échéance `10:30` (`scripts/probe-narabi.mjs:43`) postérieure à la publication de 00:52Z |
| P-N4 | `fromAttestedFlow` + calibration USDe → `gate` stable-run | **câblé** | `gate_stable_run_usde_committed_region_A7b` (`apps/harness/test/gate.test.ts:483`) | description `gate` servie nomme la classe |
| P-N5 | `run.ts` → `@monark/rpc-guard` (`apps/sentinel/src/run.ts:16`, `:285`, `:295`) | **câblé (code)**, exécuté en mode `unconfigured` | `sentinel_chainstack_origin_absent_is_unconfigured` (`apps/sentinel/test/sentinel-chainstack-guard.test.ts:289`), `sentinel_chainstack_url_alone_degrades_to_keyless` (`apps/sentinel/test/sentinel-retry.test.ts:245`) | ligne servie du 2026-09-23 : 7 endpoints, aucune origine payante |
| P-N7 | redéploiement harness (`apps/` et `packages/` entiers) → `/opt/monark-harness` → 2 unités (`deploy/monark-harness.service:50`, `deploy/monark-sentinel.service:39`) | présent, **non testé** (procédure) | aucun | fermeture sentinelle : 8 fichiers changés depuis `bb41b6d`, 0 couvert par le témoin (`apps/sentinel/src/run.ts:156-157`) ⇒ CARTO-BR-3 |
| P-S4 | openapi servi + minuteurs → `scripts/sync-narabi-served.mjs` (`:56`) → `narabi-served.json` → `/narabi`, ligne de fraîcheur de `/` et `/fleet` | **câblé (acte opérateur)** ; `--check` existe (`:102`) | `narabi_gate_facts_read_from_committed_sources` (`test/narabi-live.test.ts:539`) | `--check` vert à 09:01:20Z |
| P-S5 | 2 fichiers servis → `scripts/sync-narabi-capture.mjs` (`:27`) → `narabi-capture.json` → rendu serveur de `/narabi` (capture déclarée) | **câblé (acte opérateur)** ; `--check` existe (`:102`) | `narabi_live_parses_real_state_shape` | `--check` vert à 09:01:19Z (capture du 2026-09-24, T 6, préfixe tenu) ; périmée par construction au prochain créneau (2026-09-25 00:30Z + délai aléatoire), déclarée comme capture datée sur la page |

### 3.4 Harness (MCP, HTTP, openapi, CA)

| # | Producteur → artefact → consommateur | Verdict | Test (vert) | Mesure en ligne / déployé |
|---|---|---|---|---|
| P-T1 | `attest` (fixture) → clé `attested` → `gate` | **câblé** | `gate_attested_concordant_files_residual` (`apps/harness/test/gate.test.ts:762`) | clés `/gate` servies : `prediction`, `params`, `attested` |
| P-T2 | `packages/hikae` → `gate`, `calibrate` | **câblé** | `probe_harness_records_real_decision`, `probe_byo_demo_loop_closes`, `gate_stable_run_honesty_text_is_keyed_A2_A7f` | `tools/list` (SSE) = 4 outils ; description `gate` identique dans `tools/list` et l'openapi |
| P-T4 | `scripts/verify-harness.mjs` → `docs/deploy-CA-harness.json` | présent, testé (procédure) | `verify_harness_ca_passes_on_the_in_process_harness` (`test/verify-harness-liq.test.ts:52`), `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (`test/verify-harness-liq.test.ts:132`) | CA 12/12 à 2026-09-23T00:54:20Z ; son sha `openapi` = corps servi aujourd'hui ; 0 contrôle « sentinel » |
| P-S1 | corps servis → `scripts/sync-harness-served.mjs` (`:85`, `:38`) → `harness-served.json` → `/integrators`, `/console`, `/roadmap` | **câblé (acte opérateur)** ; pas de `--check` | `harness_served_data_matches_in_process_harness` (`test/harness-served.test.ts:76`), `harness_served_data_matches_deploy_ca` (`test/harness-served.test.ts:125`) | `read_at` 03:39:46Z ; openapi et `tools/list` servis = sha synchronisés ; entrée du registre MCP recopiée à la synchro : `tech.monarkgate/monark` `0.4.0` `active` (hôte hors liste permise, non relu) |

### 3.5 Garde budgétaire (`packages/rpc-guard`, ledgers)

| # | Producteur → artefact → consommateur | Verdict | Test (vert) | Remarque |
|---|---|---|---|---|
| P-U13 | ledger durable (GARDE-FSYNC-1, fusion `fd6d7d8`) → `reconcile` / `unlock` / `repair-tail` (CLI opérateur) | **fixture:course** ; présent dans la fermeture SERVIE de la sentinelle (13 fichiers) comme code seulement : la sentinelle tourne `unconfigured`, elle n'ouvre pas la garde | `ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go` (`apps/sentinel/test/ukemi-guard-record.test.ts:485`), `u4_oracle_path_ledger_reconciles_through_served_runcli` (`test/guard-scripts-u4.test.ts:474`), `repair_tail_composition_power_cut_signature_to_unlock_and_reopen` (`packages/rpc-guard/test/repair-tail.test.ts:42`) | `built` interne conditionné par C-6 « après SENTINEL-DEPLOY-GUARD-1 » (`docs/CHANTIERS.md:1190`) ; aucune surface publique ne nomme le paquet. Ledgers `F:/monark-ledger` non ouverts (§9) |

### 3.6 Relocalisation des paires du 23 et chemin périmé

`relocate-flows.mjs` sur `docs/carto/flows-2026-09-23.json` : 145 citations gardées, 50 déplacées (texte identique, ligne changée),
7 ambiguës (plus proche retenue), 8 non résolues, chacune expliquée par un changement mesuré :
`narabi-live.tsx` n'appelle plus `loadNarabi(… NARABI_SNAPSHOT)` (instantané remplacé par la capture, nœud
`apps/site/lib/narabi-snapshot.ts` supprimé) ; `packages/rpc-guard/src/ledger.ts` n'écrit plus par `appendFileSync` / `writeFileSync`
(écriture durable GARDE-FSYNC-1) ; `apps/site/app/narabi/page.tsx` ne lit plus le minuteur au build (T1C-10 clos) ; la ligne de
feuille de route sur AttestedBook a changé de forme (servie aujourd'hui : « six frozen contracts (AttestedBook upcoming until
served) ») ; deux commentaires de `fleet.ts` visés par T1C-8 ont disparu. Ma liste de fichiers ciblés portait un chemin périmé,
`packages/monark/test/cross-agent-gate.test.ts` : absent à HEAD, supprimé avec `crossAgentGate` au commit `0a21718` (P1-b3) ; son
code retour 1 est « Could not find », pas un échec de test.

## 4. Le graphe mesuré

### 4.1 Imports (AST) contre la carte du 23

| Mesure | `d0535cb` (carte du 23) | HEAD `7224c79` |
|---|---|---|
| Fichiers de code | 364 | **434** |
| Arêtes internes distinctes (AST) | 1 038 | **1 321** (import 1 080, import-type 170, export-from 40, export-type 27, dynamic-import 4) |
| Diff AST contre AST | | **+297 / −14 arêtes, +71 / −1 nœuds** (supprimé : `apps/site/lib/narabi-snapshot.ts`), 0 non attribuée |
| Contrôle croisé `carto.mjs` | only_in_ast 15 | only_in_ast 15 (angle mort connu, T1C-6) ; only_in_carto **1** : arête fantôme vue par l'expression régulière dans une CHAÎNE de code passée à un processus fils (`packages/rpc-guard/test/durable.test.ts:198`) ; l'AST a raison |
| Non résolus / imports non littéraux | 2 / 9 | 2 (assets) / 16 (dont `scripts/sync-bell-served.mjs:57`, `scripts/sync-narabi-capture.mjs:57-58`, `apps/bell/ops/q6-controls.mjs:105-107`) |

Attribution first-parent des arêtes (pickaxe sur le spécificateur, `diff-prev.mjs`) : SITE-5J-INT `26353e7` +116/−5 ; SITE-CHARTE-C
`d1b0c75` +41/−8 ; T-1b PR-2 `e73c36f` +23 ; SITE-LEGAL-1 `2dfad7e` +19 ; T-1b PR-1 `b9b3bc5` +18 ; SITE-NOYAU `b40b613` +16 ;
GARDE-FSYNC-1 `fd6d7d8` +14/−1 ; T-1b PR-3 `496a5a8` +14 ; BELL-ADV-1 `adc3260` +12 ; UKEMI-REVERT-1 `c74b53f` +11 ;
BELL-CASH-LEG-1 `77153d5` +5 ; SITE-BELL-BUILT `9a0a034` +4 ; `fb5b9e1` +3 ; `303b607` +1. Nœuds ajoutés : SITE-5J-INT 18,
SITE-CHARTE-C 13, SITE-LEGAL-1 8, T-1b PR-1 5, PR-2 5, PR-3 4, GARDE-FSYNC-1 4, SITE-BELL-BUILT 3, puis 2 ou 1 par lot.

### 4.2 Fermetures d'exécution (imports d'exécution, `import type` exclus)

| Point d'entrée | Fichiers | dont `packages/rpc-guard` | dont `apps/bell` | Au 23 |
|---|---|---|---|---|
| SERVI harness (`server.ts`) | 46 | 0 | 0 | 46 |
| SERVI sentinelle (`run.ts`) | 46 | 13 | 0 | 45 (+`repair.ts`) |
| SERVI sonde (`probe-narabi.mjs`) | 1 | 0 | 0 | 1 |
| SERVI site (`apps/site/app/**`) | 95 | 0 | 0 | 62 |
| SERVI publieur Bell (`bell-publish.mjs`) | **2** | 0 | 2 | non modélisé |
| LECTEUR vérificateur Bell | 2 | 0 | 2 | non modélisé |
| CA Bell / CA harness | 2 / 1 | 0 | 1 / 0 | non modélisé |
| Synchro : bell-served, bell-anchors, harness-served, narabi-capture, narabi-served, ukemi-course, ukemi-served | 3, 1, 33, 1, 2, 6, 32 | 0 | 2 (bell-served) | non modélisé |
| CLI de course : recorder, labeler, prober, discover, select, sonde (d) | 36, 18, 19, 20, 22, 23 | 13 chacun | 0 | 35, 17, 18, 19, 21, 22 |
| CLI Bell (collect, crosscheck, universe) | 37 | 13 | 22 | 36 |

Constat structurel : le site n'importe aucun moteur ni aucun code Bell (0 et 0) ; il consomme des **fichiers** : deux lectures
navigateur même origine de `/narabi/*` et, pour tout le reste, des **captures committées** écrites par des outils opérateur non
planifiés (§5, CARTO-BR-2). Les fermetures statiques des outils de synchro sous-estiment leur dépendance réelle (imports dynamiques
non littéraux listés ci-dessus).

### 4.3 Correction de l'outil (item T1C-6, « réutilise ou corrige »)

`graph.mjs` du 22 et du 23 déclarait les CLI Bell « course, not deployed » et ignorait le publieur servi, le vérificateur, les CA et
les synchros du site. `patch-graph.mjs` n'ajoute que 15 points d'entrée (29 au total), renomme celui des CLI Bell et ajoute 5
règles de pièce ; aucune règle de découverte, de
résolution ou d'extraction n'est touchée (le diff source est dans `F:\tmp\carto-0924\work\`, `graph-0923.mjs` contre `graph.mjs`),
donc les diffs AST contre AST avec la carte du 23 restent directs.

### 4.4 Lots en vol

| Lot | Pointe / base | Delta de graphe (AST, lot seul) | Effet de branchement |
|---|---|---|---|
| CODEQL-ALERTS-1 | `f33e6c5` (gel 2) / `e7af51c` ; 14 fichiers, +1 226/−36 | **0 arête, 0 nœud** | touche `packages/rpc-guard/src/transport.ts` (2 lignes ; dans la fermeture servie de la sentinelle et de toutes les CLI de course) et `scripts/assert-fleet-html.mjs` (CI `g3-site`) ; fusion = précondition de W d'U-4b-2b |
| U-4b-2b | `lot/u4b-2b` = base `7957908`, 0 commit (travail non commité dans `F:\Monark-wt-u4b2b`, non lu) | non mesurable | fera passer P-U8 d'absent à câblé à W ; voir CARTO-BR-3 |
| BELL-OTS-ANCHOR-1 | pas de branche ; G0 non suivi dans `F:\Monark` | aucun code | modifiera P-B2 et la phrase « not timestamp-anchored » |

## 5. Flux à l'exécution mesurés en ligne (liaisons servi = committé)

| Liaison | Résultat | Horloge |
|---|---|---|
| 4 corps Bell servis = `bell-served.json bodies_sha256` = `deploy-CA-bell.json bodies_sha256` | vrai ×4 | lus 08:58:10Z → 08:58:12Z ; CA 08:41:49Z ; synchro 08:43:45Z |
| vérificateur Bell (committé) sur le miroir des lectures, trousseau committé | `consistent_with_supplied_keyring`, sortie = sha c05 de la CA | 09:0xZ, hors ligne |
| copies immuables seq 1 et seq 2 (`/states/…`, `/provenance/…`) | 200 ×4, sha = nom | 09:00:34Z → 09:00:36Z |
| `/narabi/state.json` = capture `state_sha256` ; `/narabi/timeline.jsonl` = capture `served` (sha et longueur 9 884) | vrai, vrai | 08:58:08Z |
| `sync-narabi-capture --check`, `sync-narabi-served --check` | exit 0, exit 0 | 09:01:19Z, 09:01:20Z |
| openapi servi = `ukemi-served.json` = `narabi-served.json` = `harness-served.json` = CA harness | vrai ×4 (`ad437121…`) | 08:58:09Z |
| `tools/list` servi = `harness-served.json` | vrai (`8d3743c7…`) | 08:58:09Z |
| `/fleet` servi : `assertFleetBody` avec les notes du registre HEAD | OK, 4 notes | page lue 08:59:04Z |
| `/ukemi` servi : `assertUkemiBody` | OK, 0 jeton numérique, statut `built` | 08:59:08Z |
| 17 pages : statut, noms de fournisseur, mots de cuisine | 17 × 200, 0, 0 | 08:58:59Z → 08:59:10Z |
| `read_at` des données du site, contre la dernière modification du corps servi | Bell 08:43:45Z après `Last-Modified` 08:41:22 GMT ; Narabi (faits) 03:43:59Z, Ukemi 01:48:50Z et harness 03:39:46Z après la CA harness du 2026-09-23 00:54:20Z (openapi inchangé depuis) ; capture Narabi du 2026-09-24 à T 6 = servi (`Last-Modified` 00:52:37 GMT) | chaque capture est postérieure au dernier changement de son corps servi : aucune n'est périmée à 08:58Z |

## 6. Registre public contre mesure

| # | Surface : revendication | Mesure | Verdict |
|---|---|---|---|
| R-1 | `apps/site/lib/fleet.ts:137` Shōgen `built` par « MCP attest → gate » | P-T1 câblé et servi | concordant |
| R-2 | `apps/site/lib/fleet.ts:152` Hikae `built`, trois jambes | P-T2, P-N4 câblés et servis | concordant |
| R-3 | `apps/site/lib/fleet.ts:179` Ukemi `built` par « MCP cascade → gate », abstention par construction ; accroche « Liquidation coverage, gated. » | P-U11 câblé vacue ; la page d'accueil servie accole à l'accroche la clause servie « no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction » | concordant, réserve déclarée publiquement (jambe vacue) |
| R-4 | `apps/site/lib/fleet.ts:211` Narabi `built`, timeline publiée + `fromAttestedFlow` → gate | P-N1, P-N4 câblés, fraîcheur mesurée | concordant |
| R-5 | `apps/site/lib/fleet.ts:349` MONARK Bell `built`, `served_by` hôte + CA + données du site (`:353`), tests `:354` | P-B4, P-B7, P-B5 câblés, servis, tests verts | concordant ; CARTO-BR-1 oppose deux artefacts servis de Bell, pas le registre |
| R-6 | 12 entrées `upcoming` | 0 code backend | concordant |
| R-7 | accueil servi : « four built, seven on the roadmap · one built application ( MONARK Bell ) » | comptes du registre : 4, 7, 1 | concordant |
| R-8 | notes du registre rendues | `/fleet` : 4 notes (assertion du dépôt) ; note Bell sur `/bell`, `/products`, `/` | concordant |
| R-9 | `README.md:105` AttestedBook « under a keyless RPC quorum » | recorder à membre payant gardé (inchangé depuis le 23) | écart latent, T1C-4 ouvert |
| R-10 | `apps/harness/README.md:14` entrée `{ prediction, params }` | entrée servie `prediction, params, attested` | écart, T1C-3 ouvert (déclencheur -2b, ADR-U4b-2b N-5) |
| R-11 | `skills/monark/SKILL.md` (dernier changement 2026-09-19, `d44b656`) : aucune mention de Bell | Bell `built` et servi | écart déclaré (passation §7, décision 163, lot MCP), non re-formé |
| R-12 | version servie `0.4.0` (openapi, registre MCP recopié) | tags du miroir `v0.5.0`, `v0.6.0` | écart déclaré (passation §7), non re-formé |
| R-13 | feuille de route servie : « six frozen contracts (AttestedBook upcoming until served) » | AttestedBook : 0 consommateur servi | concordant |
| R-14 | commentaire `apps/site/lib/fleet.ts:122` : trois panneaux dédiés sur `/fleet` | `/fleet` en rend quatre (`apps/site/app/fleet/page.tsx:168`, `NarabiPanel`) ; commentaire non rendu | T1C-8 réduit à ce point |
| R-15 | statuts des panneaux | reçus du registre par `/fleet` : `built_panel_status_is_handed_from_the_register` (`test/site-build-fleet.test.ts:735`), `built_narabi_and_ukemi_panels_follow_h8_and_take_status_from_the_register` (`test/site-build-fleet.test.ts:945`) | concordant, T1C-11 clos |

Aucune surface publique ne revendique `built` pour une pièce non branchée.

## 7. Réponses aux questions de la passation

**7.1 Ukemi, « built mais classe calibrée non servie » : est-ce toujours vrai après SITE-5J-INT ? Oui.** Le registre liq servi est
vide : la description `gate` servie porte la clause registre vide (openapi et `tools/list`, 08:58:09Z) ; `ukemi-served.json`
(`registry_state` `empty`, `read_at` 01:48:50Z) a le sha du corps servi aujourd'hui. SITE-5J-INT n'a pas servi la classe : il a
synchronisé et rendu cet état vide, avec les mots servis, sur `/`, `/fleet`, `/ukemi` et `/ukemi/course`. Le `built` d'Ukemi repose
sur la jambe `cascade → gate` (abstention constante, dite). La classe calibrée sera servie à la fenêtre W d'U-4b-2b (P-U8 absent
aujourd'hui ; `lot/u4b-2b` sans commit).

**7.2 Narabi, `state.json` servi rafraîchi par la sonde ? Non, par la sentinelle ; la sonde observe.** La sentinelle (hôte
`31.97.155.188`, celui de `monarkgate.tech`) écrit `state.json` et la timeline ; la sonde tourne sur l'hôte Bell
(`deploy/monark-probe.service:2-3`, `docs/JOURNAL-PROVENANCE.md:351`) et relit la surface servie. `state.json` n'a pas de champ
`generated_at` (clés servies : `tracker`, `digest`, `projected_bound_leq_target_T`, `replay_q`) ; la fraîcheur se mesure donc par la
dernière ligne (jour 2026-09-23, dernier jour UTC complet à 08:58Z), `Last-Modified` 00:52:37 GMT (créneau 00:30 + délai aléatoire
≤ 30 min), et la liaison `state.digest` = `digest_T`. Fraîche. La dernière ligne porte le `sentinel_sha` du code -1d et 7
endpoints : c'est le V-4 public de CARTO-T1F-1, cohérent avec le ruling du 23 (`docs/CHANTIERS.md:1108`).

**7.3 Bell, `sync-bell-served` à relancer à chaque publication ?** Mesuré : seq 2 synchronisée (`read_at` 2026-09-24T08:43:45Z),
corps identiques au servi à 08:58Z, `/bell` servi porte la tête seq 2. Oui, il faut relancer à chaque publication : ni minuteur, ni
mode `--check` pour cet outil (0 occurrence), le site ne lit pas l'hôte Bell en direct (0 `fetch` vers Bell dans `apps/site`). Voir
CARTO-BR-2.

**7.4 Table §1 de la passation, ligne par ligne.** Publieur Bell : « seq 1 seulement » est **périmé** (2 lignes servies) ; « aucun
minuteur » et « CA non planifiée » restent **vrais** (unité sans `[Install]`, CA à la main 08:41:49Z). Collecteur Bell : « jambe
cash COUPÉE » est **périmé** (G7 `77153d5`, `no_close_ref` 0 sur les 3 runs servis) ; « `databento` dans la provenance servie » :
**vrai pour la copie immuable de seq 1, faux pour la tête** (CARTO-BR-1). Vitrine Bell : synchro et ancres faites. Ukemi : 7.1.
Narabi : 7.2 ; hôte de la sentinelle = `31.97.155.188`, hôte de la sonde = `178.16.131.29`. Garde budgétaire : §3.5. Shōgen S2 :
hors MONARK, non mesuré (§9).

## 8. Écarts → items (règle Dettes : forme, propriétaire, déclencheur)

### 8.1 Items neufs (préfixe CARTO-BR)

| Id | Écart mesuré | Forme | Propriétaire | Déclencheur |
|---|---|---|---|---|
| **CARTO-BR-1** (public, Bell ; résidu de FAULTS-PROVIDER-NAME-1 (b)) | La copie immuable de la provenance seq 1, servie à vie (`/provenance/4935a259b7d6c2ddd929b4ecd440b6918d103c76b8a42b364df1b505f041ea3b.json`, `Cache-Control: public, max-age=31536000, immutable`), contient `databento` (1 occurrence, lue 09:00:34Z) [lu]. L'ADR qualifie elle-même ce libellé de « contradiction publique avec les Terms servis » (`docs/adr/ADR-BELL-CASH-LEG-1.md:10` ; Terms : « any specific data provider's name » parmi les mots non utilisés, `apps/site/data/bell-legal.json:56`) ; D2 a corrigé les étiquettes de la tête (seq 2 : 0 `databento`, `massive`, `polygon` [lu]) et D3 garde seq 1 servie en ajout seul (`docs/adr/ADR-BELL-CASH-LEG-1.md:20`) : le résidu sur la chaîne n'est traité par aucun texte daté. Hors périmètre, donc pas un écart : les noms des deux opérateurs RPC de la provenance seq 2 (`docs/adr/ADR-BELL-CASH-LEG-1.md:11`, « étiquette nue : conforme » ; formes interdites du test = fournisseur de recoupement cash seul, `test/no-cash-provider-name.test.ts:30`) | **ruling orchestrateur documenté**, acte investisseur seulement si (a). Options : (a) amender les Terms pour dire qu'une copie historique antérieure au correctif porte un nom de source (texte validé par le juriste, TERMS-REDATE-1) ; (b) nouveau genre de ligne signée « erratum » qui annote seq 1 sans la réécrire : la chaîne ne connaît que `publication`, `key_rotation`, `key_revocation` (`apps/bell/scripts/bell-chain.mjs:102`), donc lot publieur, vérificateur, chaîne (G0) ; (c) acceptation datée du résidu (D-n) avec une phrase de méthode sur `/bell/method` ; (d) retirer ou réécrire la copie immuable : **refusé** (ajout seul, la ligne seq 1 lie son sha). Critères : aucun artefact servi ne contredit un texte servi sans le dire ; chaîne vérifiable intacte ; aucun fournisseur sur la vitrine (vrai, 0 sur 17 pages) | orchestrateur ; investisseur si (a) | avant le G7 de BELL-OTS-ANCHOR-1 (l'ancrage datera ces têtes), au plus tard avant la publication seq 3 |
| **CARTO-BR-2** (structurel, servi → site) | Hors les deux lectures navigateur `/narabi/*`, le site rend des captures committées écrites par 7 outils opérateur (`scripts/sync-*.mjs`) non planifiés ; `read_at` est la seule horloge ; 5 outils sur 7 n'ont pas de `--check` (bell-served, bell-anchors, harness-served, ukemi-served, ukemi-course : 0 occurrence ; présent dans narabi-capture et narabi-served, `:102`) ; la CA Bell n'est pas planifiée. Mesuré aujourd'hui : tout est à jour (§5) ; le risque est la prochaine publication ou le prochain déploiement sans synchro | **recherche de solutions** consolidant SYNC-CHECK-MODE-1 et BELL-VERIFY-SCHEDULE-1 (un item, pas trois). Options : (i) `--check` sur les 5 outils (lecture, comparaison des sha, aucune écriture) + exécution planifiée sur une machine opérateur (pas l'hôte Bell) avec `verify-bell.mjs` et alerte ; (ii) garde dans la procédure de téléversement : refus si un `--check` échoue ; (iii) lecture navigateur de l'hôte Bell (CORS `*` déjà servi, contrôle c06) : contraire au régime « valeurs committées et hachées » du site, à écarter sauf décision. Critère : un servi plus récent que sa capture est détecté par un contrôle non-LLM avant tout téléversement | orchestrateur | prochaine publication Bell (seq 3) ou étape 5 de la fenêtre W d'U-4b-2b, au premier des deux |
| **CARTO-BR-3** (déploiement, bloquant W) | Le redéploiement du harness expédie `apps/` et `packages/` entiers dans `/opt/monark-harness`, arbre `ExecStart` de la sentinelle (`deploy/monark-sentinel.service:39`). La sentinelle tourne `bb41b6d` ; sa fermeture servie (46 fichiers) a 8 fichiers changés depuis (`classify`, `index` : UKEMI-REVERT-1 ; `cli`, `ledger`, `lock`, `reconcile`, `repair` : GARDE-FSYNC-1 ; `transport` : commentaire), +201/−15, et -2b changera `apps/harness/src/calibration.ts`, importé par `apps/sentinel/src/timeline.ts:16`. Le témoin `sentinel_sha` ne hache que `apps/sentinel/src/*.ts` (`apps/sentinel/src/run.ts:157`) : aucun de ces changements ne le bouge. SENTINEL-DEPLOY-GUARD-1 (formé le 23, « avant tout prochain redéploiement harness ») n'est pas codé et n'est pas une précondition de W (`docs/adr/ADR-U4b-2b-classe-servie.md:232`), alors que l'ADR elle-même note le couplage (`docs/adr/ADR-U4b-2b-classe-servie.md:120`) | **correction de l'ADR -2b** (ajouter SENTINEL-DEPLOY-GUARD-1 aux préconditions de D8) **+ recherche déjà faite** (CARTO-T1F-2, options S-1 à S-4) complétée par une mesure : la garde doit hacher la **fermeture d'exécution entière** de `run.ts` (46 fichiers, `graph.json` → `reachability`), pas `apps/sentinel/src/*.ts` ; ajout d'un contrôle sentinelle à la CA harness et du V-4 public (dernière ligne servie : `sentinel_sha`, nombre d'endpoints) après W | orchestrateur | **avant l'étape 3 de D8** (`docs/adr/ADR-U4b-2b-classe-servie.md:246`) |

Aucune pièce introuvable : 0 demande de procurement.

### 8.2 Items existants re-mesurés (non re-formés)

| Item | État mesuré | Preuve |
|---|---|---|
| CARTO-T1C-3 | **ouvert** | `apps/harness/README.md` inchangé depuis `037cb6b` (2026-09-11), `:14` ; 0 mention d'`attested`, de stable-run, de la classe liq ; pris en charge par -2b (ADR-U4b-2b N-5) |
| CARTO-T1C-4 | **ouvert** | `README.md:105` et `README.md:182` « keyless RPC quorum » ; déclencheur G0 U-6 |
| CARTO-T1C-7 | **ouvert, inchangé** | 10 fichiers `scripts/census/**` sur 15 hors de toute racine CI ; 0 lecture de clé hors racine ; test de garde inchangé depuis `d0535cb` |
| CARTO-T1C-8 | **ouvert, réduit** | les références de ligne ont disparu ; reste `apps/site/lib/fleet.ts:122` (trois panneaux) contre quatre rendus ; déclencheur : prochain lot touchant `fleet.ts` (UKEMI-SITE-SWITCH-1 à W) |
| CARTO-T1C-9 | **traité** | erratum `docs/CHANTIERS.md:832` ; les 6 derniers en-têtes contrôlés (`7224c79`, `e1a1e7e`, `865c45f`, `c9b5b7a`, `d3e4573`, `7957908`) = heure de commit UTC à la minute ; seule anomalie : l'entrée « 03:15 UTC » est en fin de fichier (`docs/CHANTIERS.md:1419`, ajoutée à 03:15:21Z, les suivantes insérées au-dessus), ordre et non heure |
| CARTO-T1C-10 | **clos** | le site ne lit plus le minuteur au build (0 occurrence dans `apps/site`) ; horaires dans `narabi-served.json`, synchronisés depuis le minuteur et vérifiés par `narabi_gate_facts_read_from_committed_sources` ; les 4 créneaux sont dans la page `/narabi` servie |
| CARTO-T1C-11 | **clos** | voir R-15 |
| CARTO-T1F-1 | **clos** | ruling `docs/CHANTIERS.md:1108` ; V-4 public fait aujourd'hui (§7.2) |
| CARTO-T1F-2 / SENTINEL-DEPLOY-GUARD-1 | **ouvert** | `scripts/verify-harness.mjs` : 0 « sentinel » ; relié à CARTO-BR-3 |
| CARTO-T1F-3 | **clos** | `docs/TABLEAU-DE-BORD.md:4` : instantané daté, `docs/ETAT-REPRISE.md` = état vivant |
| TIMELINE-PATH-1 | **ouvert, réduit** | chemin déclaré (`deploy/Caddyfile.monark-narabi.snippet:12`, `deploy/monark-sentinel.service:19`) ; V-4 public fait ; reste la lecture sur l'hôte (Needs from you, 4) |
| FAULTS-PROVIDER-NAME-1 (b) | **clos pour la tête**, résidu en CARTO-BR-1 | provenance seq 2 : 0 `databento`, `massive`, `polygon` ; test `bell_cash_labels_are_generic` vert |
| BELL-VERIFY-SCHEDULE-1, SYNC-CHECK-MODE-1 | **ouverts**, consolidés en CARTO-BR-2 | §8.1 |
| Passation §7 (version harness `0.4.0`, SKILL, registre MCP) | **ouverts, déclarés** | R-11, R-12 |

### 8.3 Plomberie du 18 (T0 à T5) re-mesurée

| Tuyau du 18 | État au 24 |
|---|---|
| « `crossAgentGate` test seul ; `attest` terminal » | **dépassé** : `crossAgentGate` supprimé (`0a21718`) ; la couture attest → gate est servie par la clé `attested` (P-T1) |
| T0 jeton ↔ `B_t` | inchangé : `B_t` porté par l'appelant (texte servi : « remaining authorization capacity (caller-owned) », `harness-served.json`) ; adresse du jeton affichée (`apps/site/app/token/page.tsx:28`) ; aucune surface ne dit le contraire : absent, concordant |
| T1 Narabi → région du gate en direct | inchangé : région statique |
| T2 Ukemi ← livre en direct | recorder de course présent (fixture:course) ; AttestedBook `upcoming until served` |
| T3 Genkan | absent |
| T4 prise d'attestation dans `gate` | **fait** (clé `attested`) ; Mokugeki absent |
| T5 Koyomi | absent |

## 9. Ce que je n'ai pas pu confirmer, et où j'ai cherché

- **Résultat de la sonde** (`/var/lib/monark-probe/narabi.json`, hôte Bell) : hors de toute racine servie (la racine Caddy Bell est
  `/var/lib/monark-bell/public`, `deploy/Caddyfile.monark-bell:12`) ; seule une lecture SSH le donne (acte orchestrateur). Indice
  public cohérent avec « sain » : publication à 00:52Z, avant l'échéance 10:30Z.
- **Chemin de la timeline sur l'hôte vitrine** (TIMELINE-PATH-1) : déclaré dans `deploy/`, non vu sur l'hôte.
- **SHA exécuté par la sonde** (`c0027cb` selon `docs/JOURNAL-PROVENANCE.md:351`) : non observable de l'extérieur ; seul indice, le
  contrôle c12 de la CA Bell (digest de l'arbre de la sonde identique avant et après la D-n Bell).
- **SHA du site déployé** (`3428dfa` selon `docs/CHANTIERS.md:1417`) : aucun identifiant de build reconnu dans le HTML servi ;
  recoupement : les pages servies rendent les notes du registre HEAD et la tête seq 2, ce qui exclut un site antérieur à `3428dfa`.
- **Entrée du registre MCP officiel** : hôte hors liste permise, non relu ; valeur recopiée par `sync-harness-served` à 03:39:46Z.
- **Campagne Shōgen S2** (`F:\shogen-campagne`), **course Bell** (`F:\course-bell`), **course Ukemi** (`F:\course-ukemi`),
  **ledgers** (`F:\monark-ledger`) : non ouverts (un lecteur tenu peut faire échouer un renommage win32, R-C6-2) ; états = journal.
- **Contenu non commité des worktrees** (`F:\Monark-wt-u4b2b`, `F:\Monark-wt-codeql`) : non lu ; lots mesurés par leurs branches.
- **Oracle complet** : arrêté volontairement (§0) ; preuve = tests ciblés.
- **Valeurs de marché** : jamais lues ni recopiées (les `gT` servis sont des chaînes non ouvertes).

## 10. Commandes rejouables et sha256

```
E="env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY TEMP=F:/tmp/carto-0924/work/os-tmp TMP=F:/tmp/carto-0924/work/os-tmp TMPDIR=F:/tmp/carto-0924/work/os-tmp"
GIT_OPTIONAL_LOCKS=0 git clone --no-hardlinks --branch lot/etude-suite F:/Monark F:/tmp/carto-0924/clone          # HEAD 7224c79
cd F:/tmp/carto-0924/clone && $E npm ci --offline --ignore-scripts --cache F:/tmp/npm-cache --no-audit --no-fund  # 283 paquets
cd F:/tmp/carto-0924/work
./live-get.sh <nom> <url> [POST tools-list.json]            # 31 lectures -> ../live/<nom>.{hdr,body} + ../live/index.tsv
$E node carto.mjs F:/tmp/carto-0924/clone carto-out         # 434 fichiers (contrôle croisé)
node patch-graph.mjs                                          # graph-0923.mjs (3d73ec99) -> graph.mjs (a772fd8d)
$E node graph.mjs F:/tmp/carto-0924/clone _run1 --head 7224c79598687cfc027c875df9d2a835f4d9b52a --carto carto-out/edges.tsv --baseline /f/tmp/carto-t1/edges.tsv --baseline-nodes /f/tmp/carto-t1/nodes.tsv
node diff-prev.mjs F:/tmp/carto-0924/clone F:/tmp/carto-0924/clone/docs/carto/graph-2026-09-23.json _run1/graph.json d0535cb638ba87b78c56d48a061e220c1d6a1fd7 7224c79598687cfc027c875df9d2a835f4d9b52a > diff-prev.json   # +297/-14, +71/-1
node deploy-lag2.mjs F:/tmp/carto-0924/clone _run1/graph.json 7224c79598687cfc027c875df9d2a835f4d9b52a > deploy-lag2.json
node sentinel-sha.mjs F:/tmp/carto-0924/clone c4981d0 bb41b6d d0535cb 7224c79 > sentinel-sha.json    # e73866a8 x3
$E node harness-live.mjs ; $E node served-html-assert.mjs ; node site-scan.mjs ; node live-summary.mjs > live-summary.json
cd ../clone && $E node apps/bell/scripts/bell-verify.mjs --dir F:/tmp/carto-0924/live/bell-mirror --keyring apps/bell/keys/bell-keyring.json   # exit 0
cd ../clone && $E node scripts/sync-narabi-capture.mjs --check ; $E node scripts/sync-narabi-served.mjs --check      # exit 0, exit 0 ; git status 0 ligne
cd ../work && ./run-targeted.sh                              # 35 fichiers, 409 / 408 / 0 / 1 skip
node named-status.mjs > named-status.json                     # 41 nommés, 41 verts, 0 absent
node relocate-flows.mjs F:/tmp/carto-0924/clone F:/tmp/carto-0924/clone/docs/carto/flows-2026-09-23.json flows-relocated.json > relocate-report.json
node coverage2.mjs F:/tmp/carto-0924/clone > coverage2.out.json
$E node graph.mjs F:/tmp/carto-0924/clone F:/tmp/carto-0924 --head 7224c79598687cfc027c875df9d2a835f4d9b52a --carto carto-out/edges.tsv --baseline /f/tmp/carto-t1/edges.tsv --baseline-nodes /f/tmp/carto-t1/nodes.tsv --flows flows-2026-09-24.json --embed diff_prev_2026_09_23=diff-prev.json --embed deploy_lag=deploy-lag2.json --embed sentinel_sha=sentinel-sha.json --embed harness_live=harness-live.out.json --embed served_html_assert=served-html-assert.out.json --embed site_scan=site-scan.out.json --embed named_tests=named-status.json --embed targeted_tests=targeted-summary.json --embed coverage=coverage2.out.json --embed bell_verify_live_mirror=bell-verify-mirror.out.json --embed relocate_report=relocate-report.json --embed live=live-summary.json   # 0 citation en échec ; 2e exécution vers _det : octets identiques
node verify-md.mjs F:/tmp/carto-0924/clone F:/Monark/docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md
```

```
1ddc2e5871e2b07eadfbe3abb8267ff2ded43e509019a6c31db9492511d6208e  F:/tmp/carto-0924/graph.json
0a6ed1b59e5e9b034eeb8ffa25fae926a0eb3939e1be2798fe4128ab434e0e9b  work/flows-2026-09-24.json
a772fd8d9027dbc555a400100b0df17e9401f8522dda9b85767fb4cb59f37d73  work/graph.mjs
3d73ec9936d13e24de8ce849edfa513369dea4038c60bedda34b293d83001ded  work/graph-0923.mjs
15a02e2fed290acdaccbd8ef6037d79174e2fe2bcc4982874dea1f4dd517b3cb  work/patch-graph.mjs
8bc5fd4f422f9d4ec2ef72a63927ed8b0eee29ffe010990f5fc9c234032f7632  work/carto.mjs
b1fd09ab6f5cb3ea35e2539075664df180ee9311c197f42c754318f314917360  work/diff-prev.mjs
1c325cbc512e4e54f90cdd87d598b8f6d1df0e752e14aa9a9a269e8ed69cb858  work/deploy-lag2.mjs
c0fcc1834a2c004318772c04aab82e1ff3005e43a1176ac761ffdac8c78bde39  work/sentinel-sha.mjs
eb4cc7e7dde8abd4d08f79aa4d626fdae227c0bf45b376c0d26b9e2d1424e755  work/harness-live.mjs
6aa735ba3dfb8052fc096563d8b23f1a1429160393ef83f12c9db1f5d680aad4  work/served-html-assert.mjs
225e58e7c8e2488d6ca4fb340c1f30a5b2c3a93329594120c161a5b428a6fef3  work/site-scan.mjs
d7835dbe69976090bbe267c0a8f848911ac20713cb86a6dfff4a99d047888b88  work/live-summary.mjs
2f81447cb4d7707ec479d8e94d1cfd46a37a21010da32944713f365f8a8e4e2c  work/named-status.mjs
f392a41f18f77d27d7f0c0ac1b7e7d2abc8cecaf583d491fd66ffa2309c94ba5  work/coverage2.mjs
3178619f573ad9dce5ca53783de94aa572577a4f9635a8ec44d9df86f6d39ad6  work/relocate-flows.mjs
4831fbe364b516d098ec82d2455e88eb801885e958c8e7b00dad2be5904a9d78  work/live-get.sh
f427369e632f7c7c57928829ebe4a57733c908b146fef5f39f945d7331dd5f09  work/run-targeted.sh
d76d37bda75ecfb9d29c56589d91af8fdeabb88223db83e7b570a6e0a65f005a  live/index.tsv
f6f3e5755375ad4747bb0af80ede458fb2572558aa0cad03a53be7a28da4fb5c  work/live-summary.json
13dbc859dbd50b4d8c5136ee770bbdabd367dac388b736beaf13738b75b2383b  work/diff-prev.json
f0256b3bff499553c1540a2e91b7e4c6ebe82d5daaeb93c3fb73cf5a472d2830  work/deploy-lag2.json
5d3409254cb828c59c7a0b290843bd9beab69f4707ac881b5347bee2df98c732  work/named-status.json
4d966ebcf406f6e167d85a2d85175cb08673960feac3bd73bf5acfe38ac9dd3b  work/targeted-summary.json
814b5794f4243c2c0bc0d6fbb150f819afb0940dcca47e4c51dd4ef9ce2712f1  work/bell-verify-mirror.out.json   (= stdout_sha256 du contrôle c05 de docs/deploy-CA-bell.json)
8dc0e004d968e0058975e97b2e960e5ca818011868e2d6f81d5d1fd6b64b07b8  work/harness-live.out.json
cc5279c93f9e8b03b263013531c7ca75ee4756ee754203de3edeaf162fba6c1e  work/served-html-assert.out.json
64620a5db911374e6c287e9aedc9cbab5059a5284785475ceacdee56a388a6a8  work/site-scan.out.json
529395baea3999c5c7ea039bb606e59a6ad2fb7ea3f344519fc6a9711d22c0e5  work/relocate-report.json
```

**Clôture** (`date -u` 2026-09-24T09:25:46Z, re-contrôlée à 09:32:19Z après les dernières corrections du texte) : HEAD de `F:\Monark` = `7224c79` (0 commit depuis le HEAD mesuré, donc le graphe vaut
pour l'état courant) ; `git -C F:/Monark --no-optional-locks status --porcelain` = deux fichiers non suivis : ce document (ma seule
écriture) et `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` (G0 OTS d'un autre worker, pas à moi) ; clone : 0 ligne ; aucun processus de test
restant ; aucun worktree `F:\Monark-wt-*` touché.

**R-1** `claude-opus-5-5[1m]` · **R-20** aucun commit, aucun workflow · **R-21** chaque chiffre est rejouable par le §10 ; les
paires, le registre et 103 citations sont vérifiés mécaniquement dans `F:\tmp\carto-0924\graph.json`.
