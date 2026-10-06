# G7 du lot L2-KEEP-CAUSE-REST-1 : la cause d un plantage au chargement des quatre derniers fichiers L2 gardée sur stdout

- **Plan** : `docs/G0-lot-l2-keep-cause-rest-1.md`. **Base** : `ec0e023d` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/l2-keep-cause-rest-1`. Fusion prévue après T0.
- **Demande** : item L2-KEEP-CAUSE-REST-1 du G7 de L2-BOOK-KEEP-CAUSE-1 (#174).
- **Commits** :
  - `4239a8c0` : les quatre tests, rouges par assertion à la base ;
  - `79bd9480` : le compte de `l2-rest` corrigé (13 tests, pas 9 : l item était périmé) ; toujours rouge à la base ;
  - `4725774b` : les quatre fichiers installent le témoin, leur travail de chargement passe dans `before()` ;
  - `9b1818c3` : le G0 (red-proof test-only, tueurs listés) ;
  - `94813804` : `l2-rest-tls` lit `REAL` avant d enregistrer son crochet (voir « Écart trouvé ») ;
  - puis le G0 mis à jour et ce G7.
- **Hôte de mesure** : Linux, Node 24.21.0, `TMPDIR` privé sous le scratchpad, proxys retirés pour les tests seulement.

## Pourquoi

Après #174, 8 des 12 fichiers `test/l2-*.test.ts` portent le témoin. Les 4 autres faisaient un travail au chargement sans lui : `trap()` (`l2-rest` l. 15, `l2-rest-tls` l. 21, `l2-fake-place` l. 10) et `mkdtempSync` du `ROOT` (`l2-segments` l. 17). Une erreur là tuait l enfant au chargement : sa cause n était dite que sur stderr, que le lanceur de Node 24.21.0 perd sous charge (L2-LINKS-FILE-CRASH-1). C est la forme `'test failed'` sans test de l oracle Windows.

## Changement (tests seuls)

| Fichier | Changement |
|---|---|
| `test/l2-rest.test.ts` | `before` importé (l. 5) ; l. 14 : import du témoin ; l. 15 : `keepCause(…); before(() => { trap(); });` au lieu de `trap();` |
| `test/l2-rest-tls.test.ts` | `before` importé (l. 6) ; l. 19 : import ; l. 20 : `keepCause(…)` ; l. 21 : `REAL` (inchangé, commentaire précisé) ; l. 22 : `before(() => { trap(); })` en fin de la ligne de `outs` |
| `test/l2-fake-place.test.ts` | `before` importé (l. 6) ; l. 9 : import ; l. 10 : `keepCause(…); before(() => { trap(); });` |
| `test/l2-segments.test.ts` | `before` importé (l. 6) ; l. 14 : import ; l. 16 : `keepCause(…)` ; l. 17 : `let ROOT = ""; before(() => { ROOT = mkdtempSync(…); });` ; l. 18 : `after` gardé par `ROOT !== ""`, `maxRetries: 5, retryDelay: 100` |
| `test/keep-cause.test.ts` | `runBook` devient `runFile(inject, file = BOOK)` (repli de la G2, M-3) ; en fin : `TRAP`, `MKDTEMP`, `seen`, `named` et quatre tests |

Nombre de lignes inchangé dans les 4 fichiers (348, 140, 130, 207) ; leurs tests et leurs lignes `// killer:` sont inchangés (mêmes numéros).

## Preuve : la cause perdue à la base, gardée au gel

### Par les tests (stderr jeté, enfant lancé comme par le lanceur)

| Test | Base (`4239a8c0`/`79bd9480`) | Gel |
|---|---|---|
| `keep_cause_l2_rest_a_throw_of_trap_is_named_on_stdout` | rouge, `[1, [], false]` | vert : `[1, ["test/l2-rest.test.ts: exit code 1 during between tests, tests begun 0, ended 13"], true]` |
| `keep_cause_l2_rest_tls_a_throw_of_trap_is_named_on_stdout` | rouge, `[1, [], false]` | vert, `ended 3` |
| `keep_cause_l2_fake_place_a_throw_of_trap_is_named_on_stdout` | rouge, `[1, [], false]` | vert, `ended 8` |
| `keep_cause_l2_segments_a_throw_of_its_root_is_named_on_stdout` | rouge, `[1, [], false]` | vert, `ended 6`, `INJECTED at mkdtemp` sur stdout |

`[1, [], false]` : sortie 1, aucune ligne `# keep-cause`, la cause absente de stdout. C est la forme du record Windows, reproduite par injection.

### Par le vrai lanceur (`node --test --test-force-exit --import=<faute> <fichier> 2>/dev/null`)

- **Base** : pour les 4 fichiers, `✖ test/<fichier>.test.ts`, `'test failed'`, `ℹ tests 1`, aucun test nommé, aucune ligne `# keep-cause`. Hors charge, le lanceur recopie encore le stderr de l enfant (`Error: INJECTED at trap … at test/l2-rest.test.ts:15:1`) : c est ce chemin-là que la charge coupe.
- **Gel** : chaque test est rouge et nommé avec `Error: INJECTED at …` (13, 3, 8, 6), puis `# keep-cause test/<fichier>.test.ts: exit code 1 during between tests, tests begun 0, ended N`. La cause passe par le stdout de l enfant (rapports sérialisés), que le lanceur lit jusqu au bout.

## Écart trouvé : un `before()` racine s exécute à l enregistrement

- **Constat** : la première version (`4725774b`) mettait `keepCause(…); before(() => { trap(); });` au-dessus de la ligne de `REAL` dans `l2-rest-tls`. Le premier `npm run test:main` a donné **1 échec** : `l2_tls_peer_only_from_own_connection`, `RestStop: network_error`. Sous charge (12 en parallèle, 3 tours) : **36 rouges sur 36** au gel, **0 sur 36** pour le fichier de la base.
- **Cause, mesurée et sourcée** : sous Node 24.21.0, un `before()` **racine** appelé au niveau du module exécute sa fonction **aussitôt** (source : `Test.prototype.createHook`, `if (name === 'before' && this.startTime !== null)`, « Test has already started, run the hook immediately » ; la racine est démarrée dès la création du harnais). Un `before` dans un `describe` n est pas concerné ; un crochet asynchrone ne s exécute ainsi que jusqu à son premier `await` (sonde : un drapeau posé dans le crochet vaut `true` sur la ligne suivante, en direct, en `child-v8` et sous `node --test`). `REAL.fetch` était donc déjà le piège (`tripwire: the global fetch is never called`).
- **Bissection** : `before` au-dessus de `REAL` sans `keepCause` : rouge 4/4 ; `REAL` au-dessus de `keepCause` et `before` : vert 4/4 ; `trap()` au chargement après `REAL` : vert.
- **Repli** (`94813804`) : `keepCause` reste premier, `REAL` est lu ensuite, `before(() => { trap(); })` vient sur la ligne de `outs`. Vert 3/3 seul, 0 rouge sur 36 sous charge.
- **Portée** : un `before()` racine synchrone ne retarde pas `trap()` (asynchrone : seulement la partie avant le premier `await`) ; il le fait passer par la machinerie des crochets, qui rend une erreur en rouges nommés. C est aussi vrai pour `l2-book` et `l2-links` (#174, #130), où rien n est lu après le crochet : sans effet là. La phrase du G7 de #174 « `before()` tourne avant lui » reste vraie.

## Oracle

### Tueurs, tirés à la main

Pour chaque mutation : application, exécution du seul test visé (`--test-name-pattern`), restauration, contrôle sha256.

| Mutation | Test | Résultat | sha256 restauré |
|---|---|---|---|
| `test/helpers/keep-cause.ts:31 CONST "ended = 0" -> "ended = 1"` (déclaré) | `…_l2_rest_…` | rouge, `ERR_ASSERTION` | oui |
| `test/helpers/keep-cause.ts:38 CONST "ended ${String(ended)}" -> "ended ${String(begun)}"` (déclaré) | `…_l2_rest_tls_…` | rouge, `ERR_ASSERTION` | oui |
| `test/helpers/keep-cause.ts:33 CONST "step = \"between tests\"" -> "void 0"` (déclaré) | `…_l2_fake_place_…` | rouge, `ERR_ASSERTION` | oui |
| `test/helpers/keep-cause.ts:38 CONST "${file}: exit code" -> "exit code"` (déclaré) | `…_l2_segments_…` | rouge, `ERR_ASSERTION` | oui |
| pour chacun des 4 fichiers, `keepCause(…)` retiré (contrôle, hors convention) | le test du fichier | rouge, `ERR_ASSERTION` (4/4) | oui |
| pour chacun des 4 fichiers, le travail remis au chargement (`trap();`, `ROOT = mkdtempSync(…)`) (contrôle) | le test du fichier | rouge, `ERR_ASSERTION` (4/4) | oui |

| pour `l2-rest`, `l2-rest-tls`, `l2-fake-place`, `before(() => {})` sans piège (contrôle, repli de la G2) | le test du fichier | rouge, `ERR_ASSERTION` (3/3) | oui |
| `test/helpers/keep-cause.ts:33 CONST "ended += 1" -> "ended += 2"` (déclaré, de #174) | `…_l2_book_a_throw_of_trap_…` | rouge, `ERR_ASSERTION` | oui |
| `test/helpers/keep-cause.ts:32 CONST "step = " -> "void "` (déclaré, de #174) | `…_l2_book_an_exit_in_a_test_…` | rouge, `ERR_ASSERTION` | oui |

**Ce que prouvent les tueurs déclarés (G2, N-1)** : chacun rougit les **quatre** nouveaux tests, plus des anciens. Mesuré sur tout `keep-cause.test.ts` :

| Tueur | Tests rouges |
|---|---|
| `:31 "ended = 0" -> "ended = 1"` | les 4 nouveaux + `an_exit_inside_a_test_names_it`, `names_the_test_and_counts`, `l2_book_*` ×2 |
| `:38 "ended ${String(ended)}" -> "ended ${String(begun)}"` | les 4 nouveaux + `an_exit_inside_a_test_names_it`, `l2_book_*` ×2 |
| `:33 "step = \"between tests\"" -> "void 0"` | les 4 nouveaux + `names_the_test_and_counts`, `l2_book_a_throw_of_trap_…` |
| `:38 "${file}: exit code" -> "exit code"` | les 4 nouveaux + `an_exit_inside_a_test_names_it`, `names_the_test_and_counts`, `l2_book_*` ×2 |

Ils prouvent donc le support commun, pas le câblage de chaque fichier. **Le câblage est prouvé par les 11 contrôles manuels** : `keepCause(…)` retiré (4), travail remis au chargement (4), `before(() => {})` sans piège (3) ; chacun rougit le seul test du fichier visé, 11 sur 11. La convention de `scripts/red-proof.mjs` interdit un tueur dans un `*.test.ts` : ces contrôles sont tirés à la main seulement.

**Présence de la cause (G2, M-4)** : l assertion vérifie la présence de la cause sur stdout, et `ended N` le nombre de tests finis ; compter les occurrences par test (4 par rouge, mesuré) figerait le format de sérialisation des rapports de Node : la présence suffit, et une autre erreur levée par le crochet rougit bien le test (G2, 1.4).

### Red-proof

- `node scripts/red-proof.mjs --test-only --base ec0e023d --gel . --repo . --seed 37` : **OK**, exit 0. 4 tests jugés, 37 inchangés, `files.production` vide ; les 4 tests `pinned`, les 4 tueurs listés au G0 **tués**. `RED-PROOF.json` : sha256 `63bbeae823a7…`, digest du gel `da0d8045c7d3…` (tête `94813804`, avant les docs).
- Le mode `f2p` refuse par construction un lot de tests seuls (le gel de chaque fichier de test est copié dans la base) : d où `red-proof: test-only` au G0.

### Autres contrôles

- **Ancres** : `verifie-ancres.mjs . --touched ec0e023d HEAD` : **41 tueurs, 41 ANCRE, 0 DERIVE, 0 PERDU**.
- **R-25** (`scripts/oracle/r25.mjs`, base `origin/base/chantier-moteur-2026-10-03`, tête avec les docs) : STAT +51/−19, **70 lignes** (les docs ne comptent pas), sous la borne demandée de 547 et celle de la CI (1205) ; CONTENT_STAT 0 ; GREEN.
- **Fichiers L2** : `node --test --test-force-exit test/l2-*.test.ts test/keep-cause.test.ts` : **222 sur 222**, aucune ligne `# keep-cause`, aucun dossier `l2-*` laissé.
- **Charge** : `keep-cause` et les 4 fichiers, 12 en parallèle, 3 tours : **0 rouge sur 36**.
- **`npm run test:main`** :
  - avant le repli : 2 684 tests, 2 661 verts, **1 échec** (`l2_tls_peer_only_from_own_connection`, l écart ci-dessus), 22 sautés, exit 1. Le témoin l a nommé : `# keep-cause test/l2-rest-tls.test.ts: exit code 1 during between tests, tests begun 3, ended 3` ;
  - après le repli : 2 684 tests, 2 662 verts, **0 échec**, 22 sautés, exit 0 (311 s), aucune ligne `# keep-cause`.
- **Outils** : `tsc --noEmit`, `eslint .`, `gate:vocab` verts ; `lint:ratchet` 69/69 ; `lang:gate` OK.

## Limites (résiduels)

- **Imports statiques** : une erreur levée pendant l évaluation d un import statique (`./l2-fake-place.ts`, `../scripts/l2/rest.mjs`, `../scripts/l2/segments.mjs`, `./helpers/loopback.ts`, et `./helpers/keep-cause.ts` lui-même) précède `keepCause` et reste sur stderr seul. Hors champ : **ORACLE-CHILD-EXIT-TRACE-1**.
- **Kill, plantage natif** : aucun gestionnaire ne tourne ; même item.
- **Comptes figés sur Node 24.21.0** (N-2 du G2 de #174) : `tests begun 0, ended N` et l exécution immédiate d un `before()` racine dépendent de la sémantique des crochets de cette version ; la CI prend `node-version: "24"` flottant. Une mineure qui changerait ce point rougirait ces tests sans régression du témoin.
- **Un rouge ordinaire ajoute une ligne** (N-3 du G2 de #174) : `exit code 1 during between tests, tests begun N, ended N` ; seule, avec des tests rouges nommés, elle ne signale pas une cause perdue.
- **Lecture après le crochet** : tout fichier L2 futur qui lit un global (`fetch`, `WebSocket`) pour le garder doit le lire **avant** `before(() => { trap(); })` ; et un `trap()` placé après un `await` dans le crochet n est posé qu au microtâche suivant. La l. 22 de `l2-rest-tls` le dit en commentaire (repli de la G2, M-2).
- **Pièges non vérifiés par leurs propres fichiers** (G2, observation hors lot, vraie à la base) : avec `before(() => {})`, c est-à-dire sans `trap()`, `l2-rest` reste vert 13/13 et `l2-rest-tls` 3/3 ; seul `l2-fake-place` rougit. Les nouveaux tests de `keep-cause.test.ts` couvrent désormais ce point : ils rougissent si le fichier n affecte plus `globalThis.fetch` (contrôles ci-dessus).

## Pour MONARK (Windows)

1. Sur la tête fusionnée, `node --test test/keep-cause.test.ts test/l2-rest.test.ts test/l2-rest-tls.test.ts test/l2-fake-place.test.ts test/l2-segments.test.ts` doit être vert (11 + 13 + 3 + 8 + 6). Les quatre nouveaux tests vérifient, sur les tuyaux de Windows, que la cause passe par stdout avec stderr jeté.
2. Si l un des 4 fichiers rougit dans l oracle, chercher `# keep-cause test/<fichier>.test.ts:` dans `09-test_main.log`, comme au G7 de #174 (« Pour MONARK », point 2). Ni test ni ligne `keep-cause` : import statique, kill ou plantage natif, déclencheur d ORACLE-CHILD-EXIT-TRACE-1.
3. Chemins faits par `fileURLToPath`, `join`, `pathToFileURL` ; aucun nom réservé ; aucun saut win32.

## Écarts au plan

- **Compte de `l2-rest`** : 13 tests, pas 9 comme le disait l item.
- **`l2-rest-tls`** : le crochet n est pas sur la ligne du `trap()` de la base mais sur celle de `outs` (l. 22), pour lire `REAL` avant lui.
- **R-25** : environ 40 lignes de tests annoncées ; les tests et en-têtes font +51/−19 (tests un par fichier, plus `seen`/`named`).
