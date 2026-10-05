# G7 du lot L2-BOOK-KEEP-CAUSE-1 : la cause d un plantage de `test/l2-book.test.ts` gardée sur stdout

- **Plan** : `docs/G0-lot-l2-book-keep-cause-1.md`. **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/l2-book-keep-cause-1`.
- **Demande** : `2026-10-05-MONARK-vers-RECHERCHES-l2book-trace.md`, section 2 : « Lot d instrumentation : oui ».
- **Commits** :
  - `f7a20590` : les deux tests, rouges par assertion à la base ;
  - `70663129` : `l2-book` installe le témoin, `trap()` passe dans `before()` ;
  - `c2906cc0` : le G0 (red-proof test-only, tueurs listés) ;
  - puis ce G7 ;
  - `c55995e8` et le repli du G2 : la fixture de `keep_cause_names_the_test_and_counts` rendue déterministe (R-1), et ce G7 complété.
- **Hôte de mesure** : Linux, Node 24.21.0, `TMPDIR` privé.

## Pourquoi

- **Le record Windows `6b7b6571`** de l oracle (#172) donne `✖ test\l2-book.test.ts (752.6856ms)`, `test at test\l2-book.test.ts:1:1`, `'test failed'`, et aucun des 6 tests.
- **Aucune cause n y est restée.** MONARK a cherché `ℹ Error`, `test:stderr`, code de sortie, signal, `EBUSY`, `EPERM`, `ENOENT` et `EMFILE` dans les 3 517 lignes de `09-test_main.log` : rien sur `l2-book`. Le stderr de la porte est dans le même fichier, donc la cause n est jamais sortie du lanceur.
- **Cette forme est celle d un enfant mort au chargement, ou dans son premier test, dont le stderr s est perdu.** C est la classe de L2-LINKS-FILE-CRASH-1 (#130) : le lanceur de Node 24.21.0 perd le stderr d un enfant sous charge (33 fichiers sur 1 200, G7 de ce lot).
- **`l2-book` n avait pas le témoin**, et il faisait un travail au chargement : `trap()`, ligne 18. Une erreur de `trap()`, ou d un test qui sort, n était dite que sur stderr.

## Ce que c est : de l instrumentation, pas un correctif

- **La cause du record `6b7b6571` n est pas trouvée.** Elle ne se reproduit pas sous Linux (message `l2book-cause-non-prouvee`, section 3), et ce lot ne la cherche pas.
- **Le lot rend lisible la prochaine occurrence.**
  - Une erreur de `trap()` donne 6 rouges nommés, chacun avec l erreur, sur stdout. Elle est suivie de la ligne `# keep-cause test/l2-book.test.ts: exit code 1 during between tests, tests begun 0, ended 6`.
  - Une sortie dans un test est nommée avec le test et le code, par exemple `exit code 9 during test "l2_h_steps_table", tests begun 1, ended 0`.
  - Une exception non attrapée est nommée avec son étape (`load`, `test "<nom>"`, `between tests`).
- **Aucun autre changement de comportement.**
  - Le piège reste posé avant le premier test : `before()` tourne avant lui.
  - `after` est inchangé.
  - Les 6 tests et leurs 6 tueurs sont inchangés, et aucune ligne n est déplacée (314 lignes avant et après).

## Changement (tests seuls)

| Fichier | Changement |
|---|---|
| `test/l2-book.test.ts` | Ligne 7 : `before` importé. Ligne 17 (vide) : import du témoin. Ligne 18 : `keepCause("test/l2-book.test.ts")` au lieu de `trap()`. Ligne 19 : `before(() => { trap(); })` ajouté sur la ligne de `places`. |
| `test/keep-cause.test.ts` | Ligne 12 (vide) : import de `node:url`. En fin de fichier : `runBook()` et deux tests. |

Les deux tests lancent `test/l2-book.test.ts` lui-même, comme le lanceur lance son enfant (`NODE_TEST_CONTEXT=child-v8`). Une faute est préchargée par `--import`, et le **stderr est jeté** : la cause doit donc arriver par stdout seul.

- `keep_cause_l2_book_a_throw_of_trap_is_named_on_stdout` : l affectation de `globalThis.fetch` lève `INJECTED at trap`, ce qui fait lever `trap()`. Attendu : sortie 1, la ligne `exit code 1 during between tests, tests begun 0, ended 6`, et `INJECTED at trap` présent sur stdout.
- `keep_cause_l2_book_an_exit_in_a_test_is_named_on_stdout` : `mkdtempSync` d un dossier `l2-book-` appelle `process.exit(9)`, donc dans le premier test. Attendu : sortie 9, la ligne `exit code 9 during test "l2_h_steps_table", tests begun 1, ended 0`.

**À la base**, les deux tests sont rouges par assertion. Le premier lit `[1, [], false]` : sortie 1, aucune ligne, **et la cause absente de stdout**. C est la forme du record `6b7b6571`, reproduite par injection.

## Oracle

### Tueurs, tirés à la main

Pour chaque tueur : application de la mutation, exécution du seul test visé, restauration, puis contrôle sha256 du fichier.

| Mutation | Test | Résultat | sha256 restauré |
|---|---|---|---|
| `test/helpers/keep-cause.ts:33 CONST "ended += 1" -> "ended += 2"` (tueur déclaré) | `..._a_throw_of_trap_...` | rouge, `ERR_ASSERTION` | oui |
| `test/helpers/keep-cause.ts:32 CONST "step = " -> "void "` (tueur déclaré) | `..._an_exit_in_a_test_...` | rouge, `ERR_ASSERTION` | oui |
| `test/l2-book.test.ts:18`, `keepCause(...)` retiré (contrôle, hors convention) | les deux | rouges, `ERR_ASSERTION` | oui |
| `test/l2-book.test.ts:19`, `before(() => { trap(); })` remis en `trap();` au chargement (contrôle, hors convention) | `..._a_throw_of_trap_...` | rouge, `ERR_ASSERTION` | oui |

La convention de `scripts/red-proof.mjs` interdit un tueur dans un `*.test.ts`. Les deux contrôles sur `l2-book` sont donc tirés à la main seulement, et ne figurent pas dans les lignes `// killer:`.

### Red-proof

- **Mode `f2p`** : `node scripts/red-proof.mjs --base origin/base/chantier-moteur-2026-10-03 --gel . --repo . --draw 2 --seed 37` donne **REFUSED**, exit 1.
  - Les 2 tests sont jugés « green at base: a self-confirming test », et 0 tueur est tiré.
  - L outil copie le `test/l2-book.test.ts` du gel dans le clone de la base, puisque c est un fichier de test du diff. Un lot qui ne change que des tests ne peut donc pas y être F2P.
  - `RED-PROOF.json` : sha256 `535813915b77…`.
- **Mode `--test-only`** (G0 « red-proof: test-only ») : la même commande, avec `--test-only` à la place de `--draw 2 --seed 37`, donne **OK**, exit 0.
  - 2 tests jugés, 11 inchangés, et `files.production` est vide.
  - Les 2 tests sont `pinned` : chaque tueur listé au G0, tiré au gel, est **tué** par une assertion (`keep-cause.ts` lignes 33 et 32).
  - `RED-PROOF.json` : sha256 `ee9e23bed86f…`, digest du gel `563b41441bac…`.
- La rougeur à la base, sur la vraie base de `l2-book`, est celle du commit `f7a20590` (section « Changement »).
- **Après le repli du G2** : `--test-only` donne **OK**, exit 0, avec 3 tests jugés et 10 inchangés. `keep_cause_names_the_test_and_counts` est jugé, puisque son corps change. Son tueur (`keep-cause.ts:32 CONST "begun += 1" -> "begun += 0"`) est ajouté à la liste du G0.
  - Les 3 tests sont `pinned`, et les 3 tueurs sont **tués**.
  - `RED-PROOF.json` : sha256 `240c6912dadd…`, digest du gel `7fc54d17d7c8…`.

### Autres contrôles

- **Ancres** : `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` donne **13 tueurs, 13 ANCRE, 0 DERIVE, 0 PERDU**.
- **R-25** (`scripts/oracle/r25.mjs`, base `origin/base/chantier-moteur-2026-10-03`) : STAT +30/−5, **35 lignes** (borne de la CI : 1205) ; CONTENT_STAT : 0 ; GREEN. Après le repli du G2 : STAT +31/−6, **37 lignes**, GREEN (la base n a pas bougé : `753a23a9`).
- **Fichiers L2** : `node --test --test-force-exit test/l2-*.test.ts test/keep-cause.test.ts` donne 172 tests, 172 verts, et aucun dossier `l2-*` laissé dans `TMPDIR`.
- **`npm run test:main` complet** : 2 563 tests, 2 541 verts, 0 échec, 22 sautés, exit 0 (486 s). Les 6 tests de `l2-book` et les 7 de `keep-cause` sont verts.
- **Outils** : `tsc --noEmit`, `eslint .` et `gate:vocab` sont verts ; `lint:ratchet` donne 69/69 ; `lang:gate` est OK.

## Limites du témoin (rappel de L2-LINKS-FILE-CRASH-1)

- **Les imports statiques de `l2-book`** sont évalués **avant** `keepCause` : `l2-fake-place.ts`, `links.mjs`, `rest.mjs` et `segments.mjs`. Une erreur levée pendant cette évaluation reste sur stderr seul.
- **Un kill ou un plantage natif** n exécute aucun gestionnaire, donc le témoin ne voit rien. On aurait de nouveau `'test failed'` sans ligne `# keep-cause`, et c est l item suivant qui le couvre.

## Items

- **ORACLE-CHILD-EXIT-TRACE-1** (noté par MONARK, `l2book-trace`, section 2) : un second rapporteur dans l oracle, par exemple `--test-reporter=tap --test-reporter-destination=<fichier>`. Il garde l `exitCode` et le `signal` de chaque enfant. C est un changement de la porte, à faire dans son propre lot.
  - **Déclencheur** : une deuxième perte de cause après le témoin, c est-à-dire un fichier rouge sans test rapporté et sans ligne `# keep-cause`.
- **L2-KEEP-CAUSE-REST-1** (proposé) : les fichiers L2 qui n ont pas encore le témoin. À la base, `l2-canon`, `l2-continuity`, `l2-day`, `l2-derive`, `l2-links`, `l2-loop` et `l2-record` l ont, et `l2-book` l a désormais. Il manque :

| Fichier | Tests | Travail au chargement |
|---|---|---|
| `test/l2-rest.test.ts` | 9 | `trap()`, ligne 15 |
| `test/l2-rest-tls.test.ts` | 3 | `trap()`, ligne 21 (après la lecture de `REAL`, ligne 20) |
| `test/l2-fake-place.test.ts` | 8 | `trap()`, ligne 10 |
| `test/l2-segments.test.ts` | 6 | `mkdtempSync` du `ROOT`, ligne 17, et `rmSync` avec `maxRetries: 3` dans `after` (comme `l2-links` avant #130) |

  - **Prix** : un petit lot de tests seuls, environ 12 lignes dans les 4 fichiers et 25 lignes de tests (un test par fichier, sur le modèle de `runBook`), soit environ 40 lignes de R-25.
  - Ce lot n a ni code de production ni tueur nouveau dans `keep-cause.ts`. La revue et l oracle Windows prennent environ une demi-journée.
  - **Déclencheur proposé** : à faire avec le prochain lot qui touche les tests L2, ou dès qu un de ces 4 fichiers donne la forme `'test failed'` sans test.

## Pour MONARK (Windows)

1. Sur la tête fusionnée, `node --test test/keep-cause.test.ts test/l2-book.test.ts` doit donner 13 sur 13. Les deux nouveaux tests vérifient que la cause passe par stdout avec stderr jeté, sur les tuyaux de Windows.
2. Lancer l oracle de la base avec ce lot, puis celui de #172 une fois, comme prévu. Si `l2-book` rougit, chercher `# keep-cause test/l2-book.test.ts:` dans `09-test_main.log` :
   - **6 rouges `l2_*` avec une erreur** : c est la cause de `trap()`, lue ;
   - **`exit code N during <étape>`** : une sortie, nommée avec son étape et ses compteurs ;
   - **`uncaughtException during <étape>: ...`** : l exception, avec sa pile sur une ligne ;
   - **ni test, ni ligne `keep-cause`** : un kill, un plantage natif ou une erreur d import statique. C est le déclencheur d ORACLE-CHILD-EXIT-TRACE-1.
   - **Un rouge ordinaire ajoute aussi une ligne** : avec des tests rouges nommés par une assertion, le témoin écrit `exit code 1 during between tests, tests begun N, ended N`. Cette ligne seule ne signale pas une cause perdue (G2, N-3).

## Écarts au plan

- **Mode de red-proof** : la commande `f2p` demandée (`--draw n --seed 37`) refuse par construction un lot de tests seuls. D où un G0 « red-proof: test-only » ajouté, comme pour L2-LINKS-FILE-CRASH-1, et la preuve donnée dans ce mode.

## G2

Revue adverse fraîche : `G2-l2-book-keep-cause-1.md` (tête revue `3867962b`), verdict **APPROUVÉ**, aucun bloquant.

| Constat | Ce que dit le G2 | Repli |
|---|---|---|
| **R-1** (préexistant, hors diff) | `keep_cause_names_the_test_and_counts` est aléatoire sous charge. La fixture lève dans un `setImmediate` et n attend qu un `setTimeout(…, 50)`. Si le minuteur passe avant l immédiat, `b` finit d abord, et le throw est nommé `between tests`. Mesuré : 4 rouges sur 36 à la tête, 3 sur 36 à la base. | `c55995e8` : `b` attend une promesse résolue par un second `setImmediate`, programmé dans l immédiat qui lève, juste avant le throw. `b` ne peut donc finir qu après le throw. L intention est gardée (une exception non attrapée dans `b` est nommée avec son test), et la sortie attendue est inchangée. Détail dans la sous-section suivante. |
| **N-1** | `runBook` lance l enfant sans `--test-force-exit` : un mutant qui laisse des poignées ouvertes ne rougit qu au délai de 120 s. | **Accepté tel quel** : c est rouge quand même, et `--test-force-exit` changerait la forme mesurée. |
| **N-2** | Les comptes `begun 0, ended 6` dépendent de la sémantique des crochets de Node 24.21.0, alors que la CI prend Node 24 flottant. | **Accepté tel quel** : c est le même risque que les tests existants du fichier. |
| **N-3** | Sur un rouge ordinaire, le témoin ajoute une ligne `exit code 1 … begun N, ended N`. | Une phrase ajoutée au guide de lecture (« Pour MONARK », point 2). |

### Preuve du repli de R-1

- **Reproduction forcée, avant le repli** : un préchargement (`NODE_OPTIONS=--import=<fichier>`, hérité par la fixture) fait passer par un `setTimeout(…, 200)` le seul `setImmediate` dont le rappel contient `boom in b`. Le test est alors rouge par assertion : `uncaughtException during between tests` au lieu de `during test "b"`, ce qui est la forme du G2.
- **Même préchargement, après le repli** : vert.
- **Tueur** `test/helpers/keep-cause.ts:32 CONST "begun += 1" -> "begun += 0"` : resté valide, tiré à la main. Le test est rouge par `ERR_ASSERTION`, et le sha256 est restauré.
- **Charge** : `keep-cause.test.ts` et `l2-book.test.ts`, 12 en parallèle, 3 tours, donnent **0 rouge sur 36**.
- **Fichiers L2 et `keep-cause`** (`--test-force-exit`), 3 passes : 172 sur 172 à chaque passe, et aucun dossier `l2-*` laissé.
- **`npm run test:main`**, deux exécutions :
  - **La première** : 2 563 tests, 2 540 verts, **1 échec**, 22 sautés, exit 1. L échec est `l2_seal_apart_child_killed` (`test/l2-loop.test.ts:633`), avec `[false,false,undefined,true,false]` au lieu de `[…,false,false]`. C est l aléa connu **L2-SEAL-APART-FLAKE-1**, pris en cause racine à part : `l2-loop` n est pas touché par ce lot. Le témoin de `l2-loop` l a bien nommé : `# keep-cause test/l2-loop.test.ts: exit code 1 during between tests, tests begun 49, ended 49`. C est un exemple de la ligne de N-3.
  - **La seconde** : 2 563 tests, 2 541 verts, 0 échec, 22 sautés, exit 0, et aucune ligne `# keep-cause`.
  - Les 7 tests de `keep-cause` et les 6 de `l2-book` sont verts dans les deux exécutions.
- **`tsc --noEmit`, `eslint .`, `gate:vocab`** : verts. **`lint:ratchet`** : 69/69. **`lang:gate`** : OK. **Ancres** : 13 tueurs, 13 ANCRE, 0 DERIVE, 0 PERDU.
