# G7 du lot SERVED-PENDING-1 (instantané en attente du harnais servi)

- **Plan** : `docs/G0-lot-served-pending-1.md` (`bdc946b2`, puis section 5 en `de44cbea`) ; plan r3 §8.5. Décisions de MONARK sur Q-SP1-1 à Q-SP1-5 : `recherches` `0058bfe` (`coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-SERVED-PENDING-1-Q.md`).
- **Base** : `880654ed` (`base/chantier-moteur-2026-10-03`, re-mesurée à la reprise, inchangée). **Gel** : `73a35063` (branche `recherches/served-pending-1`, non poussée).
- **Commits** : `bdc946b2` (G0) ; `de44cbea` (G0, décisions) ; `94024c77` (tests rouges) ; `73a35063` (code, gel) ; ce commit (G7).
- **Statut** : code écrit, oracle vert. Reste la G2.

## Ce que le lot change

Zone : les cinq fichiers décidés. `test/site-ukemi.test.ts` n'est pas touché (UKEMI-PENDING-1) ; `apps/site/data/harness-served.json`, son entrée de manifeste et `PINNED` non plus (Q-SP1-6).
- `scripts/sync-harness-served.mjs` :
  - `shapesFrom` : les contrôles fermés et les douze champs partagés, tirés des corps (servis ou en processus) ; la synchro servie l'appelle, octets écrits inchangés (même ordre des clés, même format) ;
  - `--pending` : `inProcessPending` (`handleJsonMirror` sur les corps de la CA, `HARNESS_TOOLS` pour `tools/list`), écrit `apps/site/data/harness-pending.json` (schéma `monark-site-harness-pending-v1`), puis `markPendingSince` insère `pending_since` après `read_at` dans le servi, aucun autre octet touché, gardé s'il est déjà posé ;
  - promotion par défaut : `pendingDiff` nomme chaque champ partagé (et l'empreinte de `/openapi.json`) où le nouveau servi diffère de l'instantané en attente ; non vide, rien n'est écrit ; vide, le servi est écrit sans `pending_since`, l'instantané en attente est retiré et la sortie dit de retirer son entrée du manifeste.
- `apps/site/lib/harness-served-load.ts` : `HarnessShapes` (champs partagés) et `shapesOf` ; `loadHarnessServed` admet `pending_since` et ne le rend pas ; `loadHarnessPending` (null sans fichier ; lu après contrôle du manifeste ; clés fermées, donc refus de `read_at`, `registry`, `deploy_check`, `bodies_sha256` ; existe si et seulement si le servi porte `pending_since` ; `pending_since` pas postérieur à `written_at`) ; `loadByoTrace` et `loadH5Trace` suivent `loadHarnessPending(root) ?? loadHarnessServed(root)`. Les pages ne changent pas.
- Tests : `:76` et `:539` re-cadrés (les phrases des `TRAPS` de `site-ukemi` y restent mot pour mot) ; trois tests neufs ; `harness_trace_loaders_are_fail_closed` copie l'instantané en attente quand il existe, plus T7. Deux lignes de tueur existantes ré-ancrées sur les lignes déplacées du chargeur (`:335`, `:329`).

## Oracle (Node 24.21.0, variables de proxy retirées)

- `node scripts/red-proof.mjs --base 880654ed --gel 73a35063 --repo /home/user/monark-governance-sp1 --draw 6 --seed 37` : **OK**, 6 tests jugés, **6 F2P** (`harness_served_data_matches_in_process_harness`, `harness_trace_loaders_are_fail_closed`, `harness_pending_snapshot_is_fail_closed`, `trace_loaders_follow_the_pending_snapshot_only`, `harness_pending_sync_writes_in_process_shapes`, `narabi_gate_facts_read_from_committed_sources`), 37 inchangés, 6 tueurs tirés, **6 tués** ; digest du gel `4368c8dc…8d1f5a`.
- Tueurs en forme fermée :
  - tueur 1 (harnais différent des deux) : `harness-served-load.ts:192 CONST "!existsSync(join(root, HARNESS_PENDING_REL))" -> "true"`, sur `:76` ; le même en `-> "false"` sur `:539` ;
  - tueur 2 (en attente sans `pending_since`) : `harness-served-load.ts:196 SDL`, sur `harness_pending_snapshot_is_fail_closed` ;
  - tueur 3 (trace BYO qui ne suit pas l'instantané en attente) : `harness-served-load.ts:293 CONST "loadHarnessPending(root) ?? loadHarnessServed(root)" -> "loadHarnessServed(root)"`, sur `trace_loaders_follow_the_pending_snapshot_only` ;
  - promotion : `sync-harness-served.mjs:260 ROR "=== pending.openapi_sha256" -> "!=="`, sur `harness_pending_sync_writes_in_process_shapes`.
- `verifie-ancres.mjs --ref 880654ed` : 829 tueurs, 819 ANCRE, DERIVE 0, PERDU 10 ; les 10 PERDU sont ceux de la base (824 tueurs, 814 ANCRE).
- `tsc --noEmit`, `npm run lint`, `lint:ratchet` 69/69, `gate:vocab` (338 fichiers), `lang:gate`, `export:check` : verts.
- `npm test` complet : 2 194 tests, 2 175 verts, 19 sautés, **0 rouge**.
- **R-25** (pathspec de `ci.yml`, contre `880654ed`) : **460 lignes** (+367/−93, 4 fichiers ; borne 547).

## Bloc C simulé (mesure, essai annulé)

Une phrase ajoutée à la description de la réponse 200 dans `apps/harness/src/openapi.ts` (comme au G0 §2), sur `harness-served`, `narabi-live`, `site-ukemi` :
- **avec** `--pending` lancé (instantané écrit, `pending_since` posé, deux entrées de manifeste mises à jour à la main) : 1 rouge sur 70, `harness_served_data_is_listed_and_hash_pinned` (l'épingle `PINNED`, ré-épinglée par le bloc C) ; `:76`, `:539` et les tests neufs verts. Une seconde écriture `--pending` garde le premier `pending_since`.
- **sans** instantané en attente : `:76`, `:539` et `harness_pending_sync_writes_in_process_shapes` rouges, comme voulu.
- Arbre restauré (`git status` propre).

## Différences servies

Aucune. Aucun instantané en attente n'est versé ; sans lui, chargeur, pages et synchro par défaut se comportent comme à la base.

## Questions

- **Q-SP1-6 (MONARK) : `pending_since` dans ce lot.** Le point 5 de `0058bfe` ré-épingle le servi « dans ce lot ». Or, sans instantané en attente versé, le chargeur refuse un `pending_since` (fermeture sûre, dans les deux sens). Je n'ai donc touché ni `harness-served.json`, ni son entrée de manifeste, ni `PINNED` : ils changent avec le bloc C, par `--pending`. Confirmer cette lecture.
- **Q-SP1-7 (MONARK) : `scripts/sync-harness-served.d.mts`.** Les déclarations de la synchro sont hors de la zone décidée ; le test type localement `inProcessPending`, `pendingDiff` et `markPendingSince`. Proposition : trois déclarations ajoutées par le bloc C, qui rouvre la synchro, ou une ouverture de zone d'un fichier.
- **Information, pour l'ordre des blocs** : `--pending` envoie au harnais en processus les corps de la CA (`GATE_BODY` de `scripts/verify-harness.mjs`, `GATE_LIQ_BODY` de la synchro, `schema_version: "1.0.0"`). Si le bloc C refuse ces corps, `--pending` échoue fermé tant que UKEMI-PENDING-1 ne les a pas passés en 1.1.0.
- **Information, choix du dessin hors de la lettre des décisions** : nom de schéma `monark-site-harness-pending-v1` (l'option (b) ; abrégé `harness-pending-v1` dans `0058bfe`) ; `mcp` absent de l'instantané en attente ; `openapi_sha256` à la place de `bodies_sha256` ; refus de `pending_since` sans instantané en attente.

## Pli de la G2 (2026-10-04)

- **Revue** : G2 fraîche, `recherches` `coordination/pieces/2026-10-04-G2-recherches/G2-served-pending-1.md` (sur `cb607a03`) : CHANGES REQUESTED, un bloquant (B1), mineurs m1 à m7.
- **Gel du pli** : `e966c496` (un commit sur `cb607a03`, non poussé). Zone inchangée : `apps/site/lib/harness-served-load.ts`, `scripts/sync-harness-served.mjs`, `test/harness-served.test.ts`. Aucune ligne du chargeur ni de la synchro n'est ajoutée ni retirée : toutes les adresses de tueurs restent valides.

### B1 (bloquant) : les pages gardent le servi tant qu'un instantané en attente existe

- Test neuf `harness_pages_keep_the_served_snapshot_while_pending` : un instantané en attente dont `gate_request` (un param requis de plus) **et** `calibrate_contract` (une clé requise de plus au résultat) diffèrent du servi ; `loadHarnessServed(t)` rend les valeurs servies et la projection entière de `ROOT` ; contrôle : `loadH5Trace(t)` suit bien l'instantané en attente (rouge). Les deux variantes (`pending`, `nextGate`) passent dans `nextShapes()`, partagé avec `trace_loaders_follow_the_pending_snapshot_only`.
- Tueur en forme fermée : `harness-served-load.ts:183 CONST "servedFile(root).out" -> "{ ...servedFile(root).out, ...loadHarnessPending(root) }"` : **tué** (ERR_ASSERTION).
- Mutant du relecteur (le chargeur prend `gate_request` et `calibrate_contract` de l'instantané en attente), tiré à la main : **rouge** sur le test neuf (il survivait à 105/105).

### m1 : la promotion compare la liste fixe

- `pendingDiff` itère `SHAPES` du chargeur (désormais exporté, même ligne), nomme toute clé que l'instantané en attente ne peut pas porter et un schéma autre que `monark-site-harness-pending-v1`. Un fichier en attente sans `gate_request` ne promeut plus en silence.
- Test neuf `harness_pending_promotion_compares_the_fixed_fields` (contrôle vide ; tronqué -> `gate_request`, `calibrate_contract` ; `read_at` en trop ; schéma servi). Tueur : `sync-harness-served.mjs:259 CONST "SHAPES.filter" -> "Object.keys(pending).filter"` : **tué**. L'ancien `pendingDiff` (clés ouvertes), rejoué à la main : rouge.

### Autres mineurs

- **m2, pris** : une phrase sur la même ligne de commentaire de `loadHarnessServed` (le « si et seulement si » est tenu par `loadHarnessPending`, que les chargeurs de trace et `:76` appellent).
- **m7, pris** : la sortie de `--pending` dit de ré-épingler l'entrée de manifeste de l'instantané en attente, `written_at` neuf à chaque passage.
- **m3, laissé** : la branche de promotion de `main()` lit le réseau ; sa partie pure (`pendingDiff`) est maintenant testée sur la liste fixe, et un `pending_since` laissé après promotion rougit la CI par le refus dans les deux sens.
- **m4, laissé** : la date de `pending_since` n'est jamais rendue et n'est comparée qu'en chaîne à `written_at` ; un contrôle de calendrier n'est pas une correction triviale (`Date.parse` admet des jours hors mois).
- **m5, laissé** : les deux tueurs `:192` tuent par un refus fermé, valide pour red-proof ; la sémantique est tenue par les cas 2 et 3 de `:76` (ERR_ASSERTION), comme le note la G2.
- **m6, laissé (hors zone)** : `inProcessPending` poste les corps 1.0.0 de la CA ; à porter dans la liste de contrôle du G0 du bloc C (ordre avec UKEMI-PENDING-1).

### Questions, suite

- **Q-SP1-6** : la G2 partage la lecture ; `pending_since` arrive avec le bloc C, par `--pending` (servi, entrée de manifeste et `PINNED` ré-épinglés dans le lot qui l'écrit). MONARK confirme.
- **Q-SP1-7** : la G2 préfère la première option ; les déclarations de `inProcessPending`, `pendingDiff` et `markPendingSince` entrent dans `scripts/sync-harness-served.d.mts` au bloc C, qui rouvre la synchro. Le test garde son typage local d'ici là.
- Nom de schéma `monark-site-harness-pending-v1` : accepté par la G2 ; un mot de MONARK suffit.

### Oracle du pli (Node 24.21.0, variables de proxy retirées, TMPDIR propre)

- `tsc --noEmit`, `npm run lint`, `lint:ratchet` 69/69, `gate:vocab` (338 fichiers), `lang:gate`, `export:check` : verts.
- `test/harness-served.test.ts`, `test/narabi-live.test.ts`, `test/site-ukemi.test.ts` : **72/72**.
- `npm test` complet : trois passages sur `e966c496` : (1) 2 236 tests, 1 rouge ; (2) 2 206 tests, 1 rouge ; (3) 2 212 tests, 2 189 verts, 22 sautés, 1 rouge. Le rouge est chaque fois le seul test 42 (`export_public_no_governance_no_french`), hôte local sous charge ; tout le reste est vert. Les trois fois, c'est le mode connu EXPORT-TEST42-SUMMARY-1 : le `npm run ci` exporté sort à 0, mais sa ligne de synthèse n'est pas capturée (« implausibly small suite »). Un passage du fichier seul a rougi autrement, par `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow`, un test de concurrence d'`ukemi`, dans le CI exporté (sortie 1). Un autre passage du test 42 seul est vert. Aucun de ces fichiers n'est dans la zone : le pli ne change de l'export que l'`export` de `SHAPES`. Sur une copie de `cb607a03` hors git, le test 42 est vert. **Pas de passage complet à 0 rouge sur cet hôte** : à rejouer sous verrou d'hôte ou en CI.
- `node scripts/red-proof.mjs --base 880654ed --gel e966c496 --repo /home/user/monark-governance-sp1 --draw 8 --seed 37` : **OK**, 8 jugés, **8 F2P** (les six du gel, plus `harness_pages_keep_the_served_snapshot_while_pending` et `harness_pending_promotion_compares_the_fixed_fields`), 37 inchangés, 8 tueurs tirés, **8 tués** (`load.ts:183`, `:192` deux fois, `:196`, `:293`, `:335`, `sync.mjs:259`, `:260`) ; digest `78974219…88ca`.
- `verifie-ancres.mjs --ref 880654ed` : 831 tueurs, 821 ANCRE, DERIVE 0, PERDU 10 (les dix de la base, hors lot).
- **R-25** (contre `880654ed`) : **504 lignes** (+410/−94 ; borne 547).
