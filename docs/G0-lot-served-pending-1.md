# G0 du lot SERVED-PENDING-1 : instantané servi en attente, lu par les épingles en ligne et par le chargeur du site

- **Sources** : plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` (sha256 `3e0da1a617cf5385f6567ec998b33a79fcde00e06d3de3392af47ff9ae07653c`), §8.3 (ligne C : « instantané en attente (SERVED-PENDING-1) » ; ligne D : « instantané en attente régénéré »), §8.5 (définition, « Choix : SERVED-PENDING-1 étendu au chargeur du site »), §8.6 (ordre : « SERVED-PENDING-1 et acte §3 → C »), §9.2 (« À T0 … instantané en attente promu »), §9.4 (MONARK, « avant le G0 du bloc C ») ; proposition d'origine, plan r2 §8 (c) (`…-r2/PLAN-CM-3c-CM-4.md` l.307) ; `AMENDEMENT-ADR-CM-r3.md` l.113 ; contrôle de r3 par MONARK, `…-MONARK-vers-RECHERCHES-r3-controle-CM-3c-1.md`, verdict APPROUVE. Attribution à RECHERCHES : `…-MONARK-vers-RECHERCHES-bascule-de-charge.md` §3 n° 5 (« ta proposition (zone MONARK ouverte : les tests qui épinglent l état servi) ») ; `coordination/TABLEAU.md`, « À prendre — RECHERCHES » n° 6 ; `…-MONARK-vers-RECHERCHES-reponses-G2-L2-Q1-CM-4a.md` §2 (commit `2c723d2` de `recherches`) : « SERVED-PENDING-1 est à toi … La zone est ouverte : les tests qui épinglent l état servi. Il doit atterrir sur la base avant le bloc C. »
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `880654ed` (fusion de #126, CM-3c-1). Branche `recherches/served-pending-1`, arbre `/home/user/monark-governance-sp1`. Auteur : RECHERCHES. Borne R-25 : 547 lignes contre `880654ed`.
- **`docs/ETAT.md`** de la base : l'item n'y figure pas (`grep SERVED-PENDING-1` : 0 ligne).
- **Statut : repris.** Arrêté au G0 avec Q-SP1-1 à Q-SP1-5 (section 3) ; MONARK les a décidées (commit `0058bfe` de `recherches`, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-SERVED-PENDING-1-Q.md`). Les décisions et le dessin qui en suit sont à la section 5 ; ils priment sur les sections 1 à 4.

## 1. Ce que l'item exige (plan r3 §8.5, texte approuvé)

1. Un instantané **en attente** `apps/site/data/harness-pending.json`, « de même forme que `harness-served.json` », écrit **hors ligne, en processus**, par `scripts/sync-harness-served.mjs --pending`, au temps (i) de chaque bloc qui change une surface servie.
2. Les tests de g3-verification de la liste §8.5 comparent le harnais en processus à l'instantané en attente **quand il existe**, et exigent alors que l'instantané servi porte `pending_since` (date) ; sinon ils comparent au servi, comme aujourd'hui. Liste du plan :
   - `harness_served_data_matches_in_process_harness` (`test/harness-served.test.ts:76`) ;
   - `harness_served_data_matches_deploy_ca` (`:125`) ;
   - `narabi_gate_facts_read_from_committed_sources` (`test/narabi-live.test.ts:539`) ;
   - `byo_trace_rendered_equals_trace` (`test/harness-served.test.ts:268`) ;
   - les comparaisons en processus de `test/site-ukemi.test.ts:1198` et `:1438`.
3. `loadHarnessServed` (lu par `loadByoTrace`, `loadH5Trace` et les pages) lit le contrat `calibrate` et `gate_request` dans l'instantané en attente quand il existe ; le **texte rendu** des faits servis (empreintes, dates) reste celui du servi.
4. Le temps (ii), à T0, promeut l'instantané en attente en servi (après la CA), puis l'efface.
5. Tueurs : un harnais qui diffère des deux instantanés rougit ; un instantané en attente sans `pending_since` sur le servi rougit ; une trace BYO dont `calibrate` ne suit ni l'un ni l'autre rougit.
6. **Zone** nommée par l'item : `scripts/sync-harness-served.mjs`, `apps/site/lib/harness-served-load.ts`, `test/harness-served.test.ts`, `test/narabi-live.test.ts`, `test/site-ukemi.test.ts`. L'instantané en attente lui-même, et donc tout `pending_since` dans le servi, entre dans la PR du bloc C.
7. **Rien de servi ne bouge** dans ce lot : sans fichier en attente, tout se comporte comme aujourd'hui (pages, octets du site, sync par défaut).

## 2. Mesure du G0 (2026-10-04, Node 24.21.0, variables de proxy retirées)

- **Base verte** sur les quatre fichiers touchés ou voisins (`harness-served`, `narabi-live`, `site-ukemi`, `site-build-fleet`) : 102 tests, 0 rouge.
- **Bloc C simulé sur le texte servi** : une phrase ajoutée à la description de la réponse 200 dans `apps/harness/src/openapi.ts` (l'`openapi.json` en processus change, rien d'autre). Rouges : **2 sur 102** :
  - `harness_served_data_matches_in_process_harness` (`:76`) ;
  - `narabi_gate_facts_read_from_committed_sources` (`:539`).

  Restent verts : `harness_served_data_matches_deploy_ca` (`:125`) et les deux tests de `site-ukemi.test.ts` (l.1175 et l.1397).
- **Lecture du code** :
  - `:125` compare le servi à la CA (`docs/deploy-CA-harness.json`). Ce sont deux fichiers du temps (ii), et **aucun ne lit le harnais en processus** : le bloc C ne le fait pas rougir.
  - Les tests de `site-ukemi` l.1175 et l.1397 lisent `apps/site/data/ukemi-served.json` (écrit par `scripts/sync-ukemi-served.mjs`) et la CA, **pas** `harness-served.json`. Leur rouge au bloc C, recensé par MONARK, vient d'ailleurs : le corps `GATE_LIQ_BODY` de la CA (`scripts/verify-harness.mjs`, `schema_version: "1.0.0"`), envoyé au harnais en processus, est refusé dès le bloc C. Un `harness-pending.json` ne le couvre pas.
  - `byo_trace_rendered_equals_trace` rougit au bloc C parce que `loadByoTrace` lève (`shaped()` du résultat `calibrate` contre `served.calibrate_contract`, l.255-256). Il lit aussi `cal.sc.set_digest` et `verdict.calib_digest` par nom (l.266-267) : avec la trace 1.1.0 (`scores_sha256`), il lève quand même, instantané en attente ou non.
  - Les pages rendent `served.gate_request` : `/integrators` l.169-177 et `/docs/integrators` l.112-127 rendent `required`, `optional` et le texte de chaque paramètre.

## 3. Questions (réponse de MONARK demandée avant les tests rouges)

**Q-SP1-1 : zone.** L'item (§8.5, approuvé) nomme cinq fichiers, dont deux hors tests : `scripts/sync-harness-served.mjs` (mode `--pending`) et `apps/site/lib/harness-served-load.ts` (chargeur de `next build`). Ton ouverture de `2c723d2` §2 dit « les tests qui épinglent l état servi ». Les deux fichiers non tests sont-ils ouverts ?
- **Proposition** : oui, les cinq fichiers du §8.5, sans aucun autre ; le chargeur reste inchangé tant qu'aucun fichier en attente n'existe.

**Q-SP1-2 : chargeur, pages et traces.** Le §8.5 dit que `loadHarnessServed`, lu par les pages, lit `gate_request` et le contrat `calibrate` dans l'instantané en attente. Il dit aussi que le texte rendu des faits servis reste celui du servi. Or les pages rendent `gate_request` (§2). Prendre le premier point à la lettre ferait afficher le contrat 1.1.0 sur `/integrators` avant T0, ce qui contredit le second point et le §9.2 (« pages du site » à T0).
- **Proposition** :
  - `loadHarnessServed` reste tel quel pour les pages (servi seul) ;
  - un lecteur neuf des formes, utilisé seulement par `loadByoTrace` et `loadH5Trace`, prend `gate_request` et `calibrate_contract` dans l'instantané en attente quand il existe, sinon dans le servi.
- **Sous-question** : le tueur « une trace BYO dont `calibrate` ne suit ni l'un ni l'autre » admet-il une trace qui suit l'**un ou l'autre** ? Ou bien, quand l'instantané en attente existe, la trace (enregistrée en processus) doit-elle suivre **celui-là seul** ?
  - **Proposition** : celui-là seul, car une trace qui suit encore le servi est une trace non réenregistrée.
- Le renommage `set_digest` / `calib_digest` dans la projection `ByoLoop` reste au bloc C, qui rouvre ce fichier.

**Q-SP1-3 : contenu de l'instantané en attente.** « De même forme » que le servi. Mais quatre champs du servi ne peuvent pas s'écrire hors ligne et en processus sans mentir sur leur origine :
- `read_at` ;
- `registry` (entrée du registre MCP public) ;
- `deploy_check` (résumé de la CA) ;
- `bodies_sha256` (empreintes des corps servis, égales à la CA).

Le chargeur exige en plus que la CA soit verte et que la version du registre égale la version servie. Deux options :
- **(a)** même schéma `monark-site-harness-served-v1` :
  - `registry` et `deploy_check` sont copiés du servi ;
  - `bodies_sha256` donne les empreintes des corps en processus (mêmes corps que la CA) ;
  - `read_at` est l'instant d'écriture.

  La forme est identique, mais deux champs copiés n'ont jamais été lus sur le servi en attente.
- **(b)** schéma propre `monark-site-harness-pending-v1`, avec les seuls champs dérivés en processus (`version`, `api`, `mcp`, `tools`, `gate_request`, `calibrate_contract`, `response_required`, `bounds`, `refusal`, `honesty`, `classes`, `byo_clause`, `attest`, `bodies_sha256` en processus) et `written_at` ; ni `registry` ni `deploy_check`. Les tests comparent champ par champ ce qui existe dans les deux.
- **Proposition** : (b), qui ne porte aucun fait servi qu'il n'a pas lu. Elle s'écarte de la lettre « de même forme ».

**Q-SP1-4 : liste des tests.** D'après la mesure du §2, `:125` (CA) et les deux tests de `site-ukemi` ne comparent pas le harnais en processus à `harness-served.json`. Un `harness-pending.json` ne les touche donc pas.
- **Proposition** :
  - SERVED-PENDING-1 touche `:76`, `:539` et `byo_trace_rendered_equals_trace` (par le chargeur) ;
  - `:125` reste tel quel (servi contre CA, tous deux du temps (ii)) ;
  - pour `site-ukemi`, choisir entre :
    - **(i)** un item neuf, UKEMI-PENDING-1 (instantané en attente de `ukemi-served.json` et corps de la CA en 1.1.0), avant le bloc C ;
    - **(ii)** l'étendre dans ce lot, au-delà de la liste de fichiers du §8.5 (`scripts/sync-ukemi-served.mjs` et `scripts/verify-harness.mjs` entreraient dans la zone) ;
    - **(iii)** le laisser au bloc C, avec sa zone.
  - Je propose **(i)** : ce lot reste sous R-25 et ne touche pas aux corps de la CA.

**Q-SP1-5 : `pending_since` et promotion.** Le §8.5 met `pending_since` **dans le servi**. Écrit au temps (i) par `--pending`, il change les octets de `harness-served.json`, donc :
- son entrée de `manifest.sha256.json` ;
- l'épingle `PINNED` de `harness-served.test.ts`.

Ce fichier était exclu de la zone de #111.
- **Proposition** :
  - `--pending` écrit l'instantané en attente et ajoute au servi `pending_since` (date du jour, UTC, `AAAA-MM-JJ`), sans toucher à un autre octet ;
  - le chargeur admet cette seule clé facultative et ne la rend pas ;
  - au temps (ii), la sync par défaut refuse d'écrire (fermeture sûre) si l'instantané en attente existe et diffère du servi relu sur les champs qu'ils partagent. Sinon, elle écrit le servi sans `pending_since`, efface l'instantané en attente et dit de retirer son entrée du manifeste (la sync n'écrit pas le manifeste aujourd'hui).
- Confirme ce partage, ou dis si la promotion reste un acte manuel de MONARK.

## 4. Plan, une fois les réponses reçues (propositions retenues)

- **Tests rouges d'abord** (`test/harness-served.test.ts`, `test/narabi-live.test.ts`), sur un arbre temporaire qui porte un instantané en attente, et avec un harnais simulé changé (description de l'`openapi.json`, comme au §2) :
  - le harnais égal à l'instantané en attente passe ;
  - le harnais qui diffère des deux rougit ;
  - un instantané en attente sans `pending_since` sur le servi rougit ;
  - une trace BYO qui ne suit pas l'instantané en attente rougit ;
  - sans instantané en attente, le comportement d'aujourd'hui est inchangé (contrôle).
- **Changement (gel)** : `--pending` dans la sync (en processus : `buildOpenApi`, `tools/list` du registre, appels en processus avec les corps de la CA, `runAttest`) ; lecteur des formes dans le chargeur ; clé `pending_since`.
- **Oracle** :
  - `node scripts/red-proof.mjs --base 880654ed --gel <gel> --repo /home/user/monark-governance-sp1 --draw <n> --seed 37` ;
  - `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ;
  - `npm test` complet à 0 échec ;
  - tueurs en forme fermée.
- **R-25 estimé** : sync ~90, chargeur ~45, tests ~200 : **~335**. Avec (ii) de Q-SP1-4 : ~520.

## 5. Décisions de MONARK (`0058bfe` de `recherches`) et dessin retenu

- **Base** re-mesurée à la reprise : `origin/base/chantier-moteur-2026-10-03` = `880654ed`, inchangée ; pas de rebase.
- **Q-SP1-1 (zone)** : les cinq fichiers du §1 point 6, et eux seuls. Plus, pour le seul champ `pending_since`, `apps/site/data/harness-served.json` avec son entrée de manifeste et l'épingle `PINNED` (Q-SP1-5).
- **Q-SP1-2 (pages ou traces)** : les pages gardent le servi. Seuls `loadByoTrace` et `loadH5Trace` lisent l'instantané en attente quand il existe ; une trace suit alors **celui-là seul** (sous-question : la proposition est retenue). La garde d'envoi du site (`docs/RUNBOOK-vitrine.md`, « aucun envoi du site tant que `harness-pending.json` existe dans l'arbre exporté, sauf au temps (ii), après promotion ») est l'acte de MONARK (`d1cf7a1b`), hors de ce lot.
- **Q-SP1-3 (contenu)** : (b), un schéma propre, avec les seuls champs en processus. Un test refuse dans ce fichier `read_at`, `registry`, `deploy_check` et `bodies_sha256`.
- **Q-SP1-4 (liste)** : `:125` inchangé. Les deux tests de `site-ukemi` sont l'item UKEMI-PENDING-1 (hors de ce lot) ; `test/site-ukemi.test.ts` n'est pas touché. Ses pièges `TRAPS` (l.1438-1441) lisent dans les corps de `:76` et `:539` des phrases qui y restent mot pour mot.
- **Q-SP1-5** : `pending_since` dans le servi, accepté ; promotion par la synchro par défaut (première option), lancée par MONARK au temps (ii).

### 5.1 Dessin

- **Instantané en attente** `apps/site/data/harness-pending.json`, schéma `monark-site-harness-pending-v1` (le nom de l'option (b) ; le message de MONARK l'abrège en `harness-pending-v1`). Clés, closes : `$comment`, `schema`, `written_at`, les douze champs que les deux instantanés partagent (`version`, `api`, `tools`, `gate_request`, `calibrate_contract`, `response_required`, `bounds`, `refusal`, `honesty`, `classes`, `byo_clause`, `attest`), et `openapi_sha256`.
  - Ni `read_at`, ni `mcp` (son URL et son type viennent du registre), ni `registry`, ni `deploy_check`, ni `bodies_sha256` : rien de ce qui n'est lu que sur le serveur.
  - `openapi_sha256` est l'empreinte du document `/openapi.json` **en processus** ; elle remplace, sous un nom qui ne prétend pas avoir été servie, la seule empreinte que `:76` et `:539` comparent.
  - Il est lu, comme les trois autres fichiers, après le contrôle de son empreinte dans `manifest.sha256.json` : son entrée de manifeste entre avec lui, au bloc C.
- **`pending_since`** (`AAAA-MM-JJ`) dans le servi : le chargeur l'admet, ne le rend pas (`loadHarnessServed` rend la même projection), et exige, en fermeture sûre, qu'un instantané en attente existe **si et seulement si** le servi le porte, et que `pending_since` ne soit pas postérieur au jour de `written_at`. Une seconde écriture `--pending` (bloc D) garde le `pending_since` déjà posé.
- **Chargeur** : `loadHarnessPending(root)` (null sans fichier) ; `loadByoTrace` et `loadH5Trace` prennent `gate_request` et `calibrate_contract` dans `loadHarnessPending(root) ?? loadHarnessServed(root)`. `loadHarnessServed` et les pages : inchangés hors de la clé admise.
- **Synchro** :
  - `--pending` : en processus seulement (`handleJsonMirror` sur les corps de la CA, `HARNESS_TOOLS` pour `tools/list`), les mêmes contrôles fermés que la synchro servie sur ces corps ; écrit l'instantané en attente et insère `pending_since` dans le servi après `read_at`, sans toucher à un autre octet ; imprime les deux empreintes à reporter au manifeste et à `PINNED`.
  - par défaut (promotion, temps (ii)) : si l'instantané en attente existe et que le nouveau servi en diffère sur un champ partagé ou sur l'empreinte de `/openapi.json`, elle refuse d'écrire ; sinon elle écrit le servi (sans `pending_since`), retire l'instantané en attente et dit de retirer son entrée du manifeste.
  - Les corps de la CA (`GATE_BODY`, `GATE_LIQ_BODY`) restent ceux de `scripts/verify-harness.mjs` : leur passage en 1.1.0 est UKEMI-PENDING-1 et le bloc C, pas ce lot.
- **Tests** :
  - `:76` compare le harnais en processus à l'instantané en attente quand il existe, sinon au servi ; il rejoue sur un arbre temporaire les cas « en attente égal au harnais, servi plus ancien » (vert) et « harnais différent des deux » (rouge, tueur 1).
  - `:539` compare l'`openapi.json` en processus à `openapi_sha256` de l'instantané en attente quand il existe, sinon à la CA, comme aujourd'hui.
  - Neuf, `harness_pending_snapshot_is_fail_closed` : en attente sans `pending_since` sur le servi (tueur 2), `pending_since` sans instantané en attente, `pending_since` postérieur, les quatre champs refusés, un instantané non listé ; contrôle : le servi qui porte `pending_since` rend la même projection.
  - Neuf, `trace_loaders_follow_the_pending_snapshot_only` : une trace BYO dont `calibrate` suit le servi et non l'instantané en attente rougit, une trace qui suit l'instantané en attente passe avec lui et rougit sans lui (tueur 3) ; même chose pour les paramètres de `/gate` dans la trace de bout en bout.
  - `harness_trace_loaders_are_fail_closed` (même fichier) copie l'instantané en attente quand l'arbre en porte un ; T7 : une clé interdite rougit encore quand il existe. Sans cela, ce test rougirait au bloc C pour une raison d'instantané.
  - Neuf, `harness_pending_sync_writes_in_process_shapes` : l'instantané que `--pending` écrirait aujourd'hui égale le servi sur les champs partagés ; la comparaison de promotion ne trouve rien entre eux et nomme chaque champ changé ; l'insertion de `pending_since` ne touche aucun autre octet.
- **Aucun instantané en attente n'est versé** dans ce lot ; les tests le créent dans des répertoires temporaires. `harness-served.json`, son entrée de manifeste et `PINNED` ne bougent pas : sans instantané en attente, `pending_since` y serait refusé ; ils changent avec le bloc C (question Q-SP1-6 du compte rendu).
