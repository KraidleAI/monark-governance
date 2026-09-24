Modèle résolu : claude-opus-5-5[1m]

# G1 — lot HARNESS-DESC-1 (CARTO-T1C-2) : description servie de `gate` conditionnelle à l'état du registre liq

- Worker : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, décision 133), effort max. Date : 2026-09-22 (horloge des
  logs : baseline 20:48Z, oracle final 21:09Z, arbres fusionnés 21:12Z / 21:15Z).
- Base : `lot/etude-suite` @ `153582f` ; branche `lot/harness-desc-1` ; worktree `F:\Monark-wt-hdesc1` (créé par la
  commande de la mission ; reprise après la coupure de courant 20:3x UTC : worktree trouvé propre @ `153582f`,
  `node_modules` reconstruit). **Aucun commit** (R-20) : `lot/harness-desc-1` = `153582f`, `F:\Monark` porcelain vide.
- Corrections du checkpoint-1 (`docs/CHECKPOINT1-lot-harness-desc-1.md`, APPROUVE-AVEC-CORRECTIONS) intégrées AVANT le
  code ; elles priment sur la mission (D-1, D-2 ci-dessous).
- Advisor intégré consulté avant le code (plan + pièges) ; consulté à nouveau avant ce rendu (§10).

## 0. Résultat en une phrase

Sur registre vide (état livré), la description servie de `gate` (MCP `tools/list` et `GET /openapi.json`) porte
désormais `LIQ_EMPTY_REGISTRY_SENTENCE` + `LIQ_REQUIREMENTS_SENTENCE` + `LIQ_CONDITIONAL_SENTENCE` et plus jamais
`LIQ_UPPER_BOUND_SENTENCE` ni `LIQ_H3_SENTENCE` ; à la première entrée liq committée elle bascule sur le texte
pré-lot, byte-identique ; aucune autre phrase servie ne change ; oracle vert (927/926/0/1 nommé), 25/25 mutants tués
par leur test attendu, R-25 = 350.

Clause liq servie aujourd'hui (mesurée, `F:\tmp\hdesc1\logs\probe-after.log`) :
`For 'liquidation-eligible-coverage' (Ukemi: a per-account liquidable-amount class, class A only) no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction; this class requires alpha = 0.01, nMin = 100; the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH account at the first crossing, which the gate does not check. `

## 1. Corrections cp-1 C-1..C-9 : état

| # | Exigence | État | Preuve |
|---|---|---|---|
| C-1 (+ ruling) | vide ⇒ EMPTY + REQ + COND ; jamais UPPER ni H3 ; non vide ⇒ UPPER ; REQ ; H3 ; COND (texte actuel) | **fait** | `gate.ts:194-197` ; clause servie exacte ci-dessus ; `sha256(describeGate(true))` = `5574450432b7…ed77` = sha256 de l'ancienne `GATE_TOOL_DESCRIPTION` (3 193 car.) — `logs/check-describe.log` vs `logs/probe-before.log` |
| C-2 | `describeGate(registryHasLiq)` pure ; `GATE_TOOL_DESCRIPTION = describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE))` ; tests (i) chemin réel, (ii) fonction pure deux états, (iii) « interval » absent dans les deux états ; (ii) déclaré non-preuve CA-11 de -2b | **fait** | `gate.ts:194,220` ; (i) `hdesc_served_gate_description_is_the_empty_registry_clause` (`gate-liq.test.ts:313`) : descripteur + `tools/list` réel in-process (`createHarnessHandler().fetch`) + `GET /openapi.json` (`handleJsonMirror`), égaux entre eux et à `describeGate(état)`, clause EXACTE construite depuis les constantes, liste fermée d'absences sur la tranche, phrases committées absentes de TOUTES les feuilles servies ; (ii) `hdesc_describe_gate_two_states` (`:347`, commentaire « NOT the CA-11 proof of U-4b-2b ») ; (iii) `hdesc_liq_clause_never_says_interval_in_both_states` (`:367`) |
| C-3 | ≥ 6 mutants nommés avec tueur ; `:185` re-scopé sur `describeGate(true)`, jamais affaibli | **fait** | 25 mutants, 25/25 tués par le test attendu (TAP `not ok … - <nom>`), 25/25 restaurés byte-exact, sur le worktree ET sur l'arbre `etude-suite`+A-9+lot (§3.4) ; `:185` → `gate-liq.test.ts:195` `describeGate(true).includes(LIQ_UPPER_BOUND_SENTENCE)` (tué par `rescoped-185-upper-dropped`) + absence servie assertée par (i) |
| C-4 | item formé 2b-7 | **formé** | ADR-amendement §4 (déclencheur G1 -2b ; propriétaire orchestrateur) : test du chemin réel re-scopé sur registre FRAIS, re-pin h5, bascule des 2 contrôles CA, kill du survivant R-HD-1 ; + ligne site à former au G0 -2b |
| C-5 | CA `gate_liq_call` + `mcp_gate_description_liq` DANS CE LOT | **fait** | `scripts/verify-harness.mjs:53-63,233-255` ; test racine `test/verify-harness-liq.test.ts` : liage des littéraux (`:24`) + CA bout en bout contre le harness in-process (`:48`) ; exécution unique : 12/12 OK sur le lot (`logs/ca-worktree.log`) ; **la même CA contre le harness PRÉ-LOT (`071b3ee`) : `mcp_gate_description_liq` FAIL (`empty_registry_sentence=false h3_sentence=true`)**, `gate_liq_call` OK (`logs/ca-base-harness-new-ca.log`) ⇒ le contrôle discrimine l'état réel R-10, pas seulement un mutant |
| C-6 | re-pin h5 mesuré sur l'arbre fusionné ; PROVENANCE : raison + delta d'octets | **fait** | fusion à blanc (clone `lot/etude-suite` @ `071b3ee` + patch du lot, trace NON copiée) : recorder ⇒ 21 943 octets, LF sha `90a21adf…8252`, **byte-identique** à la trace du lot (`logs/record-h5-merged.log`) ; idem sur `etude-suite` @ `1744b6f` + A-9 (`649db8b`) + lot (`logs/record-h5-merged-a9.log`) ; diff de trace = UN champ (`response_sha256` `b88cd066…` → `6b78a420…`), taille inchangée ; PROVENANCE `:28-33,74-80` |
| C-7 | MAST : présence seule ⇒ absences + mutants ; dérive de périmètre ⇒ invariance des 3 autres descriptions | **fait** | dump servi avant/après (`logs/served-diff.log`) : `tools/list` gate diffère en `["description"]` SEUL ; cascade/attest/calibrate BYTE-IDENTICAL ; openapi `/gate` diffère en `["description"]` seul, les 3 autres chemins et `info/servers/openapi` byte-identiques ; ADR-amendement §6 |
| C-8 | amendement ADR-U4b daté, `error_origin` générateur ET vérification | **rédigé** | `F:\tmp\hdesc1\ADR-amendement.md` (§5) — insertion par l'orchestrateur (R-20) |
| C-9 | liste fermée des porteurs mesurée | **fait** | grep des lignes non commentaires de `apps/harness/src` : phrases de couverture liq servies = `gate.ts` seul (`:140-142` UPPER, `:149-151` H3, compositions `:163` et branche pleine de `describeGate`) ; COND `:156-158` = règle ; `schema-projection.ts` = **0** ; `ukemi-predict.ts:63` = négation dans un outil non enregistré (non porteur) ; `honestyText` déjà conditionnel (`gate.ts:667` après lot). Aucune modification de `schema-projection.ts` |
| non bloquant | ADR-M012 item (i) | **clos** | déclencheur atteint, dédup déjà faite (`gate.test.ts:535`), vraie dans les deux états (ADR-amendement §8) |

## 2. Livrables (9 fichiers ; `F:\tmp\hdesc1\DELIVERED.sha256`, chemins relatifs au worktree, `sha256sum -c` 9/9 OK sur le worktree ; les 8 fichiers de code/test/fixture vérifiés 8/8 aussi sur le clone fusionné, avant l'ajout du RUNBOOK)

| Fichier | Nature | numstat (+/−) |
|---|---|---|
| `apps/harness/src/tools/gate.ts` | `describeGate` + `GATE_TOOL_DESCRIPTION` liée au registre ; bloc ré-indenté dans le corps de fonction (`git diff -w` : 26/5) | 39/18 |
| `apps/harness/test/gate-liq.test.ts` | `:185` re-scopé ; 4 tests `hdesc_*` | 144/1 |
| `apps/harness/test/gate.test.ts` | contrôle probatif étendu à `describeGate(true)` (D-5) | 6/2 |
| `test/h5-e2e-probe.test.ts` | re-pin `TRACE_SHA256_PINNED` + commentaire daté (calque `:62-66`) | 7/1 |
| `fixtures/h5-e2e-trace.json` | régénéré par le recorder (1 champ) — exclu R-25 | 1/1 |
| `fixtures/PROVENANCE-h5-e2e-trace.md` | raison + delta d'octets (0) | 13/3 |
| `scripts/verify-harness.mjs` | `gate_liq_call`, `mcp_gate_description_liq`, `GATE_LIQ_BODY`, 2 littéraux servis | 44/0 |
| `test/verify-harness-liq.test.ts` (neuf, racine privée) | liage des littéraux + CA bout en bout hors réseau | 72/0 |
| `docs/RUNBOOK-harness.md` | étape 6 : énumération des contrôles de la CA complétée par les 2 contrôles neufs (D-7) — exclu R-25 (`docs/**/*.md`) | 6/1 |

Hors dépôt : `F:\tmp\hdesc1\ADR-amendement.md` (à insérer dans `docs/adr/ADR-U4b-calibration-episode-frais.md` par
l'orchestrateur, après l'amendement NARABI-OPS-1d), `mutants.mjs`, `survivors.mjs`, `DELIVERED.sha256`, `logs\`, `work\`.

## 3. Preuves mesurées (toutes rejouables, §7)

1. **Constat avant** (`logs/probe-before.log`, `153582f`) : registre vide ; description contient UPPER=true, H3=true,
   EMPTY=false ; `tools/list` sha `b88cd066…` ; openapi `/gate` = même texte. **Après** (`logs/probe-after.log`) :
   UPPER=false, H3=false, EMPTY=true, REQ=true, COND=true ; `tools/list` sha `6b78a420…` (= recorder) ; openapi == tools/list.
2. **Oracle** (`env -u` des 8 clés, TEMP sur F:, codes capturés directement ; `logs/*/exits.txt`) :
   | Arbre | gate:vocab | typecheck | test (tests/pass/fail/skip) | lint | lint:ratchet | lang:gate | export:check |
   |---|---|---|---|---|---|---|---|
   | base `153582f` | 0 | 0 | 921/920/0/1 | 0 | 0 (69/69) | 0 | 0 |
   | **lot** | 0 | 0 | **927/926/0/1** | 0 | 0 (69/69) | 0 | 0 |
   | `etude-suite` `071b3ee` + lot | 0 | 0 | 939/937/0/2 | 0 | 0 | 0 | 0 |
   | `etude-suite` `1744b6f` + A-9 `649db8b` + lot | 0 | 0 | 943/941/0/2 | 0 | 0 | 0 | 0 |
   Skip nommé du lot : `u4b_labels_replay_via_main_real_artifact` (artefacts e2 gitignorés). Second skip des clones :
   `sentinel_run_releases_chainstack_lock_on_sigterm` (win32, déclaré par NARABI-OPS-1d, pré-existant). 927 = 921 + 6
   tests neufs. Sur l'arbre A-9, `harness_tool_descriptions_pass_vocab` (scan des feuilles servies + injection V5) et
   `harness_served_honesty_carriers_pass_vocab` passent sur la nouvelle description.
3. **Octets servis** : seul `gate.description` change (§1 C-7) ; `describeGate(true)` byte-identique au texte pré-lot.
4. **Mutants** (`F:\tmp\hdesc1\mutants.mjs`, A-11 : `--test-reporter=tap`, CRLF normalisé, tué ⇔ `not ok … - <tueur
   attendu>` ; A-12 : en-tête arbre/HEAD/node/commande, diff de mutation, sha golden/muté/restauré) — **25/25 tués par
   le test attendu, 25/25 restaurés** sur le worktree (`logs/mutants.log`) ET sur l'arbre `etude-suite`+A-9+lot
   (`logs/mutants-merged-a9.log`) :
   | Mutant | Tueur attendu |
   |---|---|
   | `true-hard-coded` (C-3) | `hdesc_served_gate_description_is_the_empty_registry_clause` |
   | `false-hard-coded` (C-3) | `hdesc_describe_gate_two_states` |
   | `branches-inverted` (C-3 + A-10 : lecture du registre préservée, sortie servie altérée) | `hdesc_served_…` |
   | `empty-sentence-dropped` / `req-dropped-from-empty` (C-3) | `hdesc_served_…` |
   | `h3-dropped-from-full` / `req-dropped-from-full` (C-3) | `hdesc_describe_gate_two_states` |
   | `interval-in-empty-clause` / `interval-in-full-clause` (C-3 (iii)) | `hdesc_liq_clause_never_says_interval_in_both_states` |
   | `empty-clause-keeps-coverage` (mission : phrase vide ajoutée sans retirer la couverture) | `hdesc_served_…` |
   | `openapi-unconditioned` (mission) | `hdesc_served_…` |
   | `registry-served-description-altered` (A-10 : `GATE_TOOL_DESCRIPTION` intacte, descripteur servi altéré dans `registry.ts`) | `hdesc_served_…` |
   | `h5-pin-not-updated` (mission : ancien pin `4ad9b340…`) / `h5-fixture-not-regenerated` | `probe_harness_records_real_decision` |
   | `vocab-empty-sentence` / `vocab-requirements-sentence` / `vocab-conditional-sentence` / `vocab-composed-empty-clause` (A-9 : injection sur CHAQUE constante servie du chemin livré + la clause composée) | `harness_tool_descriptions_pass_vocab` + CLI `gate:vocab` exit 1 (4/4) |
   | `vocab-committed-branch` (l'état -2b reste policé) | `hdesc_both_description_states_pass_vocab` (+ CLI exit 1) |
   | `probative-committed-branch` (« live », non banni par le vocabulaire) | `gate_description_makes_no_probative_claim` |
   | `rescoped-185-upper-dropped` | `u4b_liq_class_text_says_upper_bound_never_interval` |
   | `ca-catches-true-hard-coded` (C-5 : la CA voit la sur-revendication sur la surface servie) / `ca-description-check-inverted` / `ca-liq-body-alpha` | `verify_harness_ca_passes_on_the_in_process_harness` |
   | `ca-literal-drift` | `verify_harness_liq_literals_equal_served_constants` |
   **Survivant déclaré** (`F:\tmp\hdesc1\survivors.mjs`, `logs/survivors.log`) : site d'appel codé en dur
   `GATE_TOOL_DESCRIPTION = describeGate(false)` ⇒ 5 fichiers de test verts (SURVIVES=true, restauré) — inobservable sur
   registre vide (un état par processus, cp-1 C-2) ; tué à -2b par l'item C-4 (R-HD-1).
5. **R-25** (pathspec VERBATIM `ci.yml:65`) : worktree `153582f` : 6 fichiers suivis 253/25 + fichier neuf 72 = **350** ;
   clone fusionné (`git add -A` dans le clone de travail) vs `071b3ee` : 7 fichiers, 325+/25− = **350** (`logs/r25*.log`).
   < 400 (mission), < 1 205 (`VIBEGATES_PR_LIMIT`). `fixtures/h5-e2e-trace.json` exclu par `fixtures/**/*.json`.
6. **Gel (A-6)** : 9 sha LF AVANT (blobs `153582f`, `frozen-before-blob.txt`) == APRÈS disque (`frozen-after-disk.txt`)
   == arbre fusionné (`frozen-after-merged.txt`) : `2f9a31f6… a5e66cd3… 5733daeb… 7bee76fc… 3376eb08… 9206df91…
   0e232519… 3603265d… cb020425…`. Aucun fichier du gel ni `docs/adr/ADR-U4b…` dans le diff.
7. **A-2** : `mk-nm.ps1` ⇒ `entries: 220 monark: 10 fail: 0` ; `require.resolve('@monark/rpc-guard')` =
   `F:\Monark-wt-hdesc1\packages\rpc-guard\src\index.ts` (idem sous chaque clone de travail).
8. **Fusion** : `git merge --no-commit --no-ff origin/lot/a9-outille` propre, puis `git apply --3way` du patch du lot
   propre (7/7 « Applied patch cleanly », `gate.ts` compris) — hunks disjoints des commentaires A-9 (`gate.ts:160-162,174`
   intacts). Ordre recommandé par le cp-2 A-9 (A-9 d'abord) : mesuré vert.

## 4. Consigne standard : point par point

- **A-1** fait : première ligne. **A-2** fait (§3.7). **A-3** fait : 7 scripts, codes directs (`work/oracle.sh`), comptes §3.2.
- **A-4** fait : `DELIVERED.sha256` ; rendu sous `F:\tmp\hdesc1\` ; aucun commit ; aucun réseau (in-process ou
  loopback `127.0.0.1` éphémère, TLS sauté). Note : le harness Claude Code a persisté deux sorties d'outil volumineuses
  (lectures de fichiers) sous `C:\Users\KACIMI\.claude\projects\…` (stockage de transcript de l'outil, pas un artefact du lot).
- **A-5** fait : 350 (§3.5). **A-6** fait (§3.6).
- **A-7** fait : tout oracle/test/mutant/recorder/CA sous `env -u` des 8 clés (mutants : clés retirées de l'env enfant
  par nom, jamais lues ni imprimées) ; aucune variable affichée.
- **A-8** n-a au sens « source externe » (aucune API tierce) ; l'entrée des tests est la réponse RÉELLE du serveur
  (SDK MCP SSE/JSON, miroir HTTP) et la CA tourne sur les octets réels.
- **A-9** fait : injection rejouée sur chaque constante servie du chemin livré (EMPTY, REQ, COND) et sur la clause
  COMPOSÉE, tuée sur le texte SERVI (`harness_tool_descriptions_pass_vocab`) + CLI ; `honestyText` inchangé par le lot
  (couvert par A-9-OUTILLE `honestytext-liq-composed-percent`, vert sur l'arbre fusionné A-9).
- **A-10** fait : liage descripteur == `tools/list` == openapi == `describeGate(état)` ; mutants
  `branches-inverted` et `registry-served-description-altered` (lecture préservée, sortie altérée) rouges ; littéraux CA liés.
- **A-11** fait (§3.4). **A-12** fait : en-têtes dans chaque log (`probe-*`, `record-h5-*`, `ca-*`, `mutants*`, `survivors`).
- **B-1..B-6** n-a : aucun opérateur payant, aucune clé, aucun hôte, aucun appel réseau ajouté ; `verify-harness.mjs`
  n'ajoute qu'un `wiredCheck`/`httpCheck` vers la cible fournie en argument (motif existant).
- **C-1..C-4** n-a : aucune classe d'erreur, aucun retry, aucun classifieur touché.
- **D-1** fait (25 mutants + 1 survivant déclaré, jamais compté). **D-2** fait : vecteurs non vides (clause exacte,
  ≥ 50 feuilles servies scannées, ancres de tranche assertées). **D-3** fait : composition servie
  (`hdesc_served_…`, `verify_harness_ca_…`) ; rien n'est déclaré `built` par ce lot.
- **D-4** fait — diff des tests annoté : `gate-liq.test.ts:185` (−) présence d'UPPER dans la description SERVIE →
  (+) présence dans `describeGate(true)` + absence servie assertée par (i) : re-scopé, non affaibli (cp-1 C-3) ;
  `gate.test.ts:832` (−) un contrôle → (+) boucle sur deux états (renforcé) ; `h5-e2e-probe.test.ts:67` : valeur du
  pin seulement ; aucune autre assertion retirée.
- **E-1..E-3** n-a (aucun verrou, ledger, backoff).
- **F-1** fait : ADR avec ligne Tuyaux, résidus à déclencheur, aucun renvoi `F:\tmp` dans l'ADR. **F-2** fait :
  `gate:vocab` 0 ; aucun caractère non-ASCII NOUVEAU (`git diff -w`) — un tiret cadratin pré-existant de PROVENANCE
  reporté sur une ligne re-coupée ; les octets non-ASCII du bloc ré-indenté de `gate.ts` sont des octets servis
  inchangés (sha, §3.3). **F-3** fait (§5).
- **G-1** (relu pour contexte) : décision 51 Q2 (changement de CONTENU dans le set de 4, pas de bump) ; 59 (description
  intérimaire de `cascade`, portée `cascade` — sans objet ici ; le re-pin h5 de ce lot suit ADR-M017 C'-3 : tout lot
  changeant `tools/list` porte son re-pin, cp-1 (c)) ; 101 (texte du site : non touché) ; 123/126 (texte -2b) ;
  127 (mise à jour majeure ⇒ skill/MCP : ce lot n'ajoute aucune classe ; `skills/`, `README.md`,
  `apps/harness/README.md` = 0 mention de la classe liq, grep) ; 130/137 (redéploiement après ce lot).

## 5. Déviations déclarées (F-3)

- **D-1** Mission (b) « fixture e2 injectée par le mécanisme existant de test de `calibration.ts` » : **ce mécanisme
  n'existe pas** (`COMMITTED_CALIBRATIONS` = constante de module non exportée, `calibration.ts:195` ; grep : 0 couture
  d'injection). Remplacé par cp-1 C-2 (ii) (fonction pure, deux états) + item C-4 ; aucun mécanisme d'injection créé.
- **D-2** Mission « registre vide ⇒ `LIQ_EMPTY_REGISTRY_SENTENCE` » : appliqué cp-1 C-1 + ruling (EMPTY + REQ + COND).
- **D-3** `gate_liq_call` asserte EN PLUS que le texte `content` porte `LIQ_EMPTY_REGISTRY_SENTENCE` (plus strict que la
  lettre de C-5 ; lie à la sortie servie la phrase que `/ukemi` cite comme état servi).
- **D-4** Le bloc de description est ré-indenté (déplacé dans le corps de `describeGate`) : octets servis inchangés
  (sha `describeGate(true)`), diff sémantique lisible par `git diff -w`.
- **D-5** Contrôle probatif (`gate.test.ts`) et contrôle vocabulaire (`hdesc_both_description_states_pass_vocab`)
  étendus à `describeGate(true)` : sinon l'état -2b, sorti du texte servi, n'était plus policé (D-4 de la consigne).
- **D-7** `docs/RUNBOOK-harness.md` (étape 6, qui énumère NOMMÉMENT les contrôles de la CA, `:165-176` après lot) complété par
  `gate_liq_call` / `mcp_gate_description_liq` dans ce lot (au lieu d'un item docs) : sans cela le RUNBOOK décrirait une
  CA plus étroite que le script. Anglais, ASCII ; `gate:vocab`/`lang:gate`/`export:check` rejoués 0 après l'édition
  (`logs/post-runbook/exits.txt`) ; aucun test ne lit ce fichier (grep) ; hors R-25.
- **D-6** C-6 mesuré sur `etude-suite` @ `071b3ee` puis `1744b6f` (la branche a avancé pendant le lot : fusion
  NARABI-OPS-1d + docs) — intersection avec les fichiers du lot vide.

## 6. Items formés / résidus (zéro dû nu)

- **C-4 / 2b-7** (déclencheur G1 -2b ; propriétaire orchestrateur) — ADR-amendement §4.
- **R-HD-1** survivant déclaré (appel `describeGate(false)` codé en dur) — représentant d'une CLASSE : toute expression
  fausse sur le registre livré au site d'appel (ex. `hasCommittedCalibrationForClass(TASK_CASCADE)`) survit de même ;
  la classe entière est tuée en bloc par l'item C-4 (d) (test du chemin réel sur registre FRAIS) ; garde structurelle
  par lecture de source écartée (déclarative au sens D-1, fragile au formatage).
- **R-HD-2** observation, **pré-existence MESURÉE** : sous win32, une CA en ÉCHEC sort avec l'assertion libuv
  `src\win\async.c` (code 3221226505) au lieu de 1 — mesuré sur le script du lot (`logs/ca-base-harness-new-ca.log`)
  ET sur le script PRÉ-LOT (blob `153582f`, sha `4746f0dc…`), échec provoqué hors réseau (Host `mcp.` sur les
  contrôles api), **3/3 runs** (`logs/ca-base-script-fail.log`, `work/run-ca-base-fail.mjs`). Non nul donc fail-closed,
  JSON imprimé avant ; même assertion déjà documentée à `test/h5-e2e-probe.test.ts:165` ; le RUNBOOK couvre déjà le cas
  (`docs/RUNBOOK-harness.md:179-181` après lot : « Treat ANY non-zero exit as RED and read the JSON `checks` array »).
  Aucun item : aucun consommateur ne lit le code exact.
- **CA AVANT redéploiement (à lire par l'orchestrateur)** : le processus EN LIGNE est antérieur à -2a (CARTO-T1C-1 ;
  `gate.ts` à `1447c05` : 0 mention de la classe, `unknown task_class` levé `:551`, `HarnessToolError` ∈
  `TOOL_ERROR_NAMES` `http.ts:36` ⇒ 400). Contre lui, **les DEUX contrôles neufs sont ROUGES par construction**
  (`gate_liq_call` ⇒ 400 ; `mcp_gate_description_liq` ⇒ description sans la phrase registre-vide) : attendu, ce n'est
  pas un défaut du lot ; ils passent au vert au redéploiement à un SHA contenant ce lot.
- **Ligne G0 -2b (2b-5/2b-7)** : faire rougir le site quand le registre se remplit (note cp-1 (d)).
- **Insertion ADR** : `F:\tmp\hdesc1\ADR-amendement.md` → `docs/adr/ADR-U4b-calibration-episode-frais.md` (orchestrateur, R-20).
- **Ordre de production** (hors lot, rappel cartographie) : redéploiement harness à un SHA ≥ ce lot + CA
  `verify-harness.mjs` (dont les 2 contrôles neufs) + entrée JOURNAL (CARTO-T1C-1, décisions 130/137).
- Non bloquant (cp-1) : `docs/carto/graph|flows-2026-09-22.json` porteront une revendication périmée — instantané daté, aucune action.

## 7. Reproduction (toutes sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`, TEMP=F:\tmp\hdesc1\os-tmp)

```
bash F:/tmp/hdesc1/work/oracle.sh F:/Monark-wt-hdesc1 <logdir>                  # oracle complet, codes directs
node F:/tmp/hdesc1/mutants.mjs F:/Monark-wt-hdesc1                                # 25/25, exit 0
node F:/tmp/hdesc1/survivors.mjs F:/Monark-wt-hdesc1                              # survivant déclaré, exit 0
node F:/tmp/hdesc1/work/probe-served.mjs F:/Monark-wt-hdesc1                      # état servi (tools/list, openapi)
node F:/tmp/hdesc1/work/check-describe.mjs F:/Monark-wt-hdesc1                    # sha describeGate(true) == pré-lot
node F:/tmp/hdesc1/work/run-ca.mjs <tree>                                         # CA contre le harness in-process
node F:/tmp/hdesc1/work/dump-served.mjs <tree> <out.json>; node F:/tmp/hdesc1/work/dump-served.mjs --diff <a> <b>
(cd <tree> && node scripts/record-h5-e2e-trace.mjs)                               # LF sha 90a21adf…8252, 21943 octets
```

## 8. Artefacts

`F:\tmp\hdesc1\G1.md` (ce rendu), `F:\tmp\hdesc1\DELIVERED.sha256`, `F:\tmp\hdesc1\mutants.mjs`,
`F:\tmp\hdesc1\survivors.mjs`, `F:\tmp\hdesc1\ADR-amendement.md`, `F:\tmp\hdesc1\frozen-before-blob.txt`,
`frozen-after-disk.txt`, `frozen-after-merged.txt`, `F:\tmp\hdesc1\logs\` (baseline, final, merged, merged-a9,
mutants, mutants-merged-a9, survivors, probe-before/after, check-describe, record-h5-worktree/merged/merged-a9,
ca-worktree, ca-base-harness-new-ca, ca-base-script-fail, post-runbook, dump-before/after, served-diff, r25, r25-merged), `F:\tmp\hdesc1\work\`
(scripts d'édition et de mesure, `served-before.json`, `served-after.json`, `lot-tracked.patch`,
`h5-e2e-trace.BEFORE.json`). Clones de travail : `F:\tmp\hdesc1\merge-tree` (`071b3ee`+lot, index mis à jour par
`git add -A` pour le R-25), `F:\tmp\hdesc1\merge-a9` (`1744b6f`+A-9+lot, fusion non committée) — à retirer par
`rm-nm.ps1` puis suppression, jamais `Remove-Item -Recurse` sur un `node_modules` de jonctions.

## 9. Provenance

Généré par `claude-opus-5-5[1m]` (effort max), 2026-09-22, contexte : mission HARNESS-DESC-1 + checkpoint-1
HARNESS-DESC-1 (corrections C-1..C-9 + ruling COND). Réviseurs : orchestrateur (R-21), G2, checkpoint-2.
`error_origin` de ce lot : aucun incident ; la déviation corrigée est celle de -2a (générateur + vérification,
ADR-amendement §5).

## 10. Advisor (R-26)

Consultation 1 (avant le code) : plan confirmé ; apports retenus — forme `function` insérée hors des lignes A-9,
branche vide sans « the served region is », négations par TRANCHE, police de `describeGate(true)` (D-5), littéraux
CA liés par test texte (script zéro dépendance), harnais A-11 calqué sur A-9, aucun mécanisme d'injection.
Consultation 2 (rendu durable avant l'appel) : aucun blocage ; précisions intégrées — R-HD-2 re-mesuré sur le
script PRÉ-LOT (3/3), note « CA avant redéploiement », classe d'équivalence du survivant R-HD-1, grep RUNBOOK/ADR-M005
(le RUNBOOK énumère nommément les contrôles ⇒ complété, D-7 ; ADR-M005 : aucune liste nommée des contrôles, 0 hit).
