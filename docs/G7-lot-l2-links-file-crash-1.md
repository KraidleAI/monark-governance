# G7 du lot L2-LINKS-FILE-CRASH-1 : un plantage de `test/l2-links.test.ts` rendu lisible

- **Plan** : `docs/G0-lot-l2-links-file-crash-1.md`. **Base** : `050da36d` (`origin/lot/etude-suite`). Branche `recherches/l2-links-file-crash-1`.
- **Commits** :
  - `4ee0bc85` : le G0 ;
  - `4bbc4d14` : le témoin et son test ;
  - `4abf0065` : `l2-links` ;
  - `79f63392` : stdout bloquant, c est le **gel** ;
  - puis ce G7.
- **Hôte de mesure** : Linux, Node 24.21.0, 4 cœurs, `TMPDIR` privé. L hôte était chargé par d autres sessions : charge moyenne de 20 à 48.
- **Demande** : message #130 de MONARK, item `L2-LINKS-FILE-CRASH-1`.

## Résultat en bref

- **Plantage non reproduit sous Linux** :
  - 3 suites complètes : 0 plantage ;
  - 700 exécutions du fichier sous charge : 0 échec.
- **La forme exacte « fichier rouge, aucun test, aucune cause » a été reproduite par injection**, de deux façons :
  - toujours, par une sortie du processus (`process.exit`), un `SIGKILL` ou un `abort` ;
  - par une erreur levée au chargement (`mkdtempSync` du `ROOT`, `trap()`), dès que le lanceur perd le stderr de l enfant.
- **Le lanceur perd ce stderr** sous charge : c est mesuré, 33 fichiers sur 1 200. Donc « aucune ligne de stderr » n écarte pas les deux candidats de chargement.
- **Ce qui ne donne jamais cette forme** : un rejet ou une exception non attrapés avant le premier test, l épuisement des ports, ou un chargement lent. Les tests sont alors rapportés.
- **Cause sous Windows : non prouvée.** Les candidats restants sont, dans l ordre :
  - le travail de chargement du fichier (`mkdtempSync` dans `%TEMP%` puis `trap()`) ;
  - une mort sans gestionnaire (kill, plantage natif).
- **Le correctif rend chacun lisible, sauf la mort sans gestionnaire** :
  - le travail de chargement est passé dans `before()` : 12 rouges nommés, avec la cause ;
  - une sortie est nommée avec son étape et son code par le témoin `keep-cause`, sur stdout ;
  - pour un kill ou un plantage natif, seul un rapporteur TAP garde le code ou le signal (voir « Pour MONARK »).

## Changement (tests seuls)

| Fichier | Changement |
|---|---|
| `test/helpers/keep-cause.ts` (ajouté, 40 lignes) | `keepCause(file)` : stdout rendu bloquant (comme le préchargement de `scripts/red-proof.mjs`). Écrit sur stdout chaque exception non attrapée par `uncaughtExceptionMonitor`, avec son étape (`load`, `test "<nom>"`, `between tests`), puis, à une sortie non nulle, le code, l étape, et les tests commencés et finis. Rien pour un fichier vert. `describeCause` met la pile sur une ligne (6 lignes au plus). |
| `test/keep-cause.test.ts` (ajouté, 58 lignes) | 5 tests. Chaque fixture tourne comme l enfant du lanceur (`NODE_TEST_CONTEXT=child-v8`), **stderr jeté** : la cause doit arriver par stdout seul. |
| `test/l2-links.test.ts` | Ligne 8 : `before` importé. Ligne 19 : import du témoin. Ligne 20 : `keepCause(...)`. Ligne 21 : `trap()` et `mkdtempSync` dans `before()`. Ligne 24 : `rmSync` seulement si `ROOT` existe, avec `maxRetries: 5, retryDelay: 100`. Aucune ligne déplacée. |

## Reproduction

### Exécutions naturelles (aucune injection)

| Mesure | Arbre | Exécutions | Plantage de `l2-links` |
|---|---|---|---|
| `node --test test/l2-links.test.ts`, 16 à la fois, 8 boucles de calcul | base | 300 | 0 |
| `node --test l2-links l2-book`, 16 à la fois, 4 boucles, pendant `npm test` | base | 400 | 0 |
| `npm test` complet | base | 1 (2206 tests, 0 échec, 549 s) | 0 |
| `npm test` complet | gel | 2 (0 échec ; 910 s et 581 s) | 0 |

### Perte du stderr par le lanceur

Le lanceur de Node 24.21.0 (`runTestFile`) attend la sortie de l enfant et la fin de son stdout, puis ferme son lecteur de stderr. Les lignes de stderr arrivées après sont perdues. La mesure porte sur 40 fichiers qui lèvent au chargement, 16 à la fois :

| Mesure | Fichiers | stderr perdu |
|---|---|---|
| 8 boucles de calcul, 30 exécutions | 1 200 | **33** (2,75 %), chacun montré `✖ <fichier>` puis `'test failed'`, rien d autre |
| 8 boucles, `l2-links` à côté, 150 exécutions | 6 000 | **24** (0,4 %) |

### Injections au chargement

Un module `--import` est actif dans le seul enfant de `l2-links`, qui tourne à côté de `l2-book`, `l2-segments`, `l2-fake-place` et `loopback`. La charge vient de 6 à 8 boucles de calcul.

Lecture des colonnes :

- **vert** : le fichier passe ;
- **rouge, tests rapportés** : des tests du fichier sont rapportés ; entre parenthèses, les exécutions où la cause est lisible ;
- **aucun test, cause lue** : le fichier est rouge sans test rapporté, mais la cause est dans le journal ;
- **FORME** : la forme de #130, un fichier rouge sans test rapporté et sans cause.

On lit la cause au texte de la faute ou à une ligne `# keep-cause test/l2-links`.

**A. Base, stderr intact** (24 exécutions par faute) :

| Faute | vert | rouge, tests rapportés | aucun test, cause lue | FORME |
|---|---|---|---|---|
| aucune | 24 | 0 | 0 | 0 |
| `mkdtempSync` lève | 0 | 0 | 24 | 0 |
| `trap()` lève | 0 | 0 | 24 | 0 |
| rejet avant le 1er test | 0 | 24 (24) | 0 | 0 |
| exception avant le 1er test | 0 | 24 (24) | 0 | 0 |
| aucun port libre | 0 | 24 | 0 | 0 |
| chargement lent de 2 s | 24 | 0 | 0 | 0 |
| `process.exit(1)` à 120 ms | 0 | 0 | 0 | **24** |
| `SIGKILL` à 150 ms | 0 | 0 | 0 | **24** |
| `abort` (message sur stderr) | 0 | 0 | 24 | 0 |

**B. stderr perdu à coup sûr** (fd 2 fermé dans l enfant, ce que fait la perte du lanceur), 16 exécutions par faute, base puis gel :

| Faute | base : rouge (cause) | base : FORME | gel : rouge (cause) | gel : aucun test, cause lue | gel : FORME |
|---|---|---|---|---|---|
| aucune | vert 16 | 0 | vert 16 | 0 | 0 |
| `mkdtempSync` lève | 0 | **16** | **16 (16)** | 0 | 0 |
| `trap()` lève | 0 | **16** | **16 (16)** | 0 | 0 |
| rejet avant le 1er test | 16 (16) | 0 | 16 (16) | 0 | 0 |
| exception avant le 1er test | 16 (16) | 0 | 16 (16) | 0 | 0 |
| aucun port libre | 16 | 0 | 16 (15) | 0 | 0 |
| chargement lent de 2 s | vert 16 | 0 | vert 16 | 0 | 0 |
| `process.exit(1)` | 0 | **16** | 0 | **16** | 0 |
| `SIGKILL` | 0 | **16** | 0 | 0 | **16** |
| `abort` | 0 | **16** | 0 | 0 | **16** |

- **Une ligne mise en file était perdue** : au gel `4abf0065`, la ligne de sortie d une exécution sur 16 (« aucun port libre ») manquait. Le stdout non bloquant de POSIX l avait gardée en file à la sortie. D où `79f63392`, qui rend stdout bloquant.
- **Mesure au gel `79f63392`**, 32 exécutions par faute, stderr perdu :
  - aucun port libre : 32 rouges, 32 avec la cause ;
  - `process.exit(1)` : 32 sans test, 32 avec la cause ;
  - `mkdtempSync` : 32 rouges, 32 avec la cause.
- **Exemples de lignes au gel** :
  - `# keep-cause test/l2-links.test.ts: exit code 1 during test "l2_capture_raw_as_served", tests begun 1, ended 0` ;
  - `mkdtempSync` qui lève : 12 rouges `Error: INJECTED EPERM mkdtemp`, puis `exit code 1 during between tests, tests begun 0, ended 12` (un `before` en échec n exécute pas `beforeEach` ; `afterEach` s exécute).

## Cause

- 363 ms et aucun test rapporté : l enfant est mort au chargement ou pendant le premier test.
- Sous Linux, aucune exécution naturelle n a planté. La cause sous Windows n est donc pas prouvée.
- Les mesures excluent trois des pistes :
  - un rejet non attrapé ;
  - un port ;
  - une lenteur.
- Il reste deux familles :
  - **le travail de chargement**. `mkdtempSync` dans `%TEMP%` peut échouer, par exemple sur un EPERM ou un EBUSY passager sous antivirus. Ce fichier est le seul des fichiers L2 à créer son dossier au chargement : `l2-rest` et `l2-book` le créent dans un test. `trap()` ne lève que si `WebSocket` manque. Une telle erreur n était dite que sur stderr, perdu de temps en temps ;
  - **une mort sans gestionnaire** : `TerminateProcess`, une violation d accès, ou un `process.exit`.
- Le correctif traite la première famille : l erreur devient 12 rouges nommés, quel que soit le sort de stderr. Pour la seconde, le témoin nomme toute sortie qui passe par `exit`. Un kill ou un plantage natif reste muet dans `spec`.

## Oracle

- **Red-proof** : `node scripts/red-proof.mjs --base 050da36d --gel /home/user/monark-governance-llc --repo /home/user/monark-governance-llc --test-only` donne **OK**, exit 0.
  - 5 tests jugés, 12 inchangés ; `files.production` est vide.
  - `RED-PROOF.json` : sha256 `5c10537cde10…`, digest du gel `8d9162b8008e…`.
  - Les 5 tests de `test/keep-cause.test.ts` sont `pinned`. Chaque tueur du G0, tiré au gel, est **tué** par une assertion : `keep-cause.ts` lignes 36, 32, 38 (deux tueurs) et 17.
- **`verifie-ancres.mjs`** : `. --files test/l2-links.test.ts,test/keep-cause.test.ts --ref 050da36d` donne **17 tueurs, 17 ANCRE, 0 DERIVE, 0 PERDU**.
- **`npm test` complet au gel**, deux exécutions :
  - 2116 tests, 0 échec ;
  - 2170 tests, 0 échec.
  - Le test 42 n a pas rougi. Les 12 tests de `l2-links` et les 5 de `keep-cause` sont verts dans les deux exécutions.
- **Contrôles** : `tsc --noEmit`, `lint` et `gate:vocab` sont verts ; `lint:ratchet` donne 69/69 ; `lang:gate` est OK.
- **R-25** (`scripts/oracle/r25.mjs`, `050da36d...HEAD`) :
  - STAT : +103/−5, **108 lignes** (sous 547 ; borne de la CI 1205) ;
  - CONTENT_STAT : 0.

## Constat annexe : des rapports perdus sans échec sous Linux (hors lot)

- **Ce qu on voit** : les comptes de tests des suites complètes varient. On en mesure 2206 à la base, puis 2116 et 2170 au gel (2211 attendus). Aucun échec n est rapporté.
- **Où les tests manquent** : c est toujours **la fin** d un fichier. Par exemple, `apps/sentinel/test/sentinel.test.ts` n a que 17 tests sur 34, et plus rien après `sentinel_state_T_zero_before_J0`. Même chose pour `red-proof.test.ts` (27 sur 47), `lot-retire.test.ts` (16 sur 38), `gate.test.ts` (18 sur 31), et d autres.
- **Mécanisme** :
  - avec `--test-force-exit`, l enfant appelle `process.exit()` à la fin ;
  - sous POSIX, son stdout de tuyau n est pas bloquant ;
  - sous charge, les derniers rapports encore en file sont perdus, et le fichier sort 0.
  - C est la raison donnée par le préchargement de `scripts/red-proof.mjs` : « POSIX pipes are non-blocking; Windows already blocks ».
- **Mesure** : 24 fichiers de 400 tests, 24 à la fois, 8 boucles de calcul, 9 600 tests attendus.
  - Avec `--test-force-exit` : **9574, 9571 et 9585** sur trois exécutions, exit 0.
  - Sans `--test-force-exit` : **9600 et 9600**.
- **Portée** : sous Windows, les tuyaux bloquent, donc ce n est pas la forme de #130. En revanche, la CI Linux et cet hôte peuvent lire comme verte une suite dont une partie n a pas été rapportée.
- **Correctif proposé** (outil, hors lot) : un préchargement qui rend stdout bloquant dans le script `test`, ou le retrait de `--test-force-exit`. `keepCause` le fait déjà pour les fichiers qui l appellent.
- **Item proposé** : `TEST-FORCE-EXIT-REPORT-LOSS-1`.

## Pour MONARK (Windows)

1. **Tronc fusionné** : `node --test test/keep-cause.test.ts test/l2-links.test.ts`, 17 sur 17 attendus. Le premier test vérifie que la cause passe par stdout avec stderr jeté, sur les tuyaux de Windows.
2. **Relancer l oracle `test:main`** sur la tête fusionnée, plusieurs fois. Si `l2-links` rougit de nouveau, chercher dans le journal une ligne `# keep-cause test/l2-links.test.ts: ...` :
   - **12 rouges `l2_*` avec une erreur** : c est la cause du chargement, lue (par exemple `EPERM` de `mkdtemp`) ;
   - **`exit code N during <étape>`** : une sortie, nommée avec son étape ;
   - **ni test, ni ligne `keep-cause`** : une mort sans gestionnaire. Seul un second rapporteur garde alors le code ou le signal. Par exemple `--test-reporter=spec --test-reporter-destination=stdout --test-reporter=tap --test-reporter-destination=<fichier>` sur la ligne `node --test` de `test:main` : le bloc YAML du fichier y porte `exitCode` et `signal`. Ainsi, `3221225477` est une violation d accès et `1` un `TerminateProcess`. C est un changement d outil, proposé et non fait.
3. **Le constat annexe ne concerne pas Windows**, puisque les tuyaux y bloquent. Il concerne la CI Linux (`g3-verification`).

## Écarts au plan

- **Commit ajouté** : `79f63392` rend stdout bloquant. L injection a montré qu une ligne mise en file pouvait se perdre à la sortie. Les tueurs du G0 gardent leurs lignes.
- **Comportement de `before`** : quand le crochet `before` échoue, le témoin compte `tests begun 0, ended 12` (`beforeEach` ne s exécute pas, `afterEach` si). Ce compte est noté tel quel.
- **Cause sous Windows non prouvée** : la partie lisibilité est livrée ; la cause attend la prochaine occurrence.
