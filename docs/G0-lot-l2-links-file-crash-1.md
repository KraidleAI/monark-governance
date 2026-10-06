# G0 du lot L2-LINKS-FILE-CRASH-1 : un plantage de `test/l2-links.test.ts` rendu lisible, le travail de chargement mis dans un crochet

- **Demande** : message #130 de MONARK (`2026-10-04-MONARK-vers-RECHERCHES-130-l2-links-crash.md`), item `L2-LINKS-FILE-CRASH-1` : rendre le plantage lisible, le reproduire sous la suite complète (Linux d abord), corriger la cause, les tests d abord.
- **Base** : `050da36d` (`origin/lot/etude-suite`), branche `recherches/l2-links-file-crash-1`. Auteur : RECHERCHES.
- **Zone** : `test/helpers/keep-cause.ts` (ajouté), `test/keep-cause.test.ts` (ajouté), `test/l2-links.test.ts` (lignes 8 et 19 à 24) ; ce G0 et le G7. Aucun code de production : `scripts/` est inchangé, l outil `node --test` et l oracle aussi.

red-proof: test-only

## Constat

- Le relevé de l oracle G7 sur `1f66ddda` montre, dans `test:main`, `✖ test\l2-links.test.ts (363.1417ms)` et `'test failed'` : un échec au niveau du fichier, aucun de ses 12 tests rapporté, aucune ligne de stderr, aucun code. Seul, le fichier passe 6 fois sur 6 sous Windows.
- Le rapporteur `spec` n imprime jamais le code de sortie ni le signal d un fichier planté. L erreur `ERR_TEST_FAILURE` du fichier les porte (`exitCode`, `signal`) et le rapporteur TAP les imprime ; `spec` n imprime que `'test failed'` (mesuré sous Node 24.21.0 : `process.exit(1)` au chargement, `SIGKILL`, `process.exitCode = 1` sans test donnent tous trois cette forme exacte).
- Le lanceur lit deux tuyaux de l enfant. Il attend la fin de stdout et la sortie de l enfant, puis ferme son lecteur de stderr (`lib/internal/test_runner/runner.js`, `runTestFile`, Node 24.21.0) : des lignes de stderr arrivées après sont perdues.
- Conséquence à mesurer : « aucune ligne de stderr » n exclut pas une erreur levée au chargement. Cette erreur ne s écrit que sur stderr, puisque le harnais, encore en démarrage, la relance (`harness.js:124`, sortie 7, aucun événement `exit`).
- Le fichier fait deux choses au chargement, hors de tout test et de tout crochet : `trap()` (ligne 20) et `mkdtempSync` du `ROOT` (ligne 21). Une erreur de l une ou de l autre n est rapportée que par stderr.

## Règle

1. **Témoin** : `test/helpers/keep-cause.ts` exporte `keepCause(file)`, appelé au chargement avant tout autre travail du fichier, mais après l évaluation de ses imports statiques : une erreur levée pendant cette évaluation n a aucun témoin et reste sur stderr seul (revue G2, m-4). Il écrit sur **stdout**, que le lanceur lit jusqu à sa fin, des lignes `# keep-cause <file>: ...`. Le rapporteur `spec` les imprime telles quelles.
   - Chaque exception non attrapée, et chaque rejet que nul écouteur ne prend, est écrit par `uncaughtExceptionMonitor`, avec l étape en cours : `load`, `test "<nom>"` ou `between tests`. Un moniteur ne change rien à la suite : le harnais rapporte l erreur comme avant.
   - À une sortie non nulle, il écrit le code, l étape, et le nombre de tests commencés et finis.
   - Rien n est écrit pour un fichier vert. L écriture va droit au fd 1 quand rien n est en file (un gestionnaire de sortie n a plus de tour de boucle), sinon elle se met en file derrière les rapports.
   - Un `kill` ou un plantage natif n exécute aucun gestionnaire. Pour eux, seul le code ou le signal du lanceur reste, imprimé par TAP (voir « Hors lot »).
2. **Travail de chargement dans un crochet** : dans `test/l2-links.test.ts`, `trap()` et `mkdtempSync` passent dans un `before()`. Leur échec devient l échec de chacun des 12 tests, avec sa cause, rapporté par stdout. `after` supprime `ROOT` seulement s il a été créé, avec `rmSync(..., { maxRetries: 5, retryDelay: 100 })`, comme `l2-rest` et `l2-book` (lot L2-REST-TEST-TMP-1).
3. **Aucune ligne déplacée** dans `test/l2-links.test.ts` : l import de `before` va sur la ligne 8, celui du témoin sur la ligne vide 19, et les lignes 20 à 24 sont remplacées sur place. Les lignes `// killer:` gardent leur numéro, et leurs cibles dans `scripts/l2/links.mjs` ne changent pas.
4. Le témoin est un fichier de support **ajouté** sous `test/helpers/`. Il ne lie aucun port, n est nommé par aucun fichier de production, et n utilise que des modules intégrés. `test/l2-fake-place.ts` n est pas modifié : `--test-only` refuse la modification d un support existant.

## Reproduction (avant le correctif)

Hôte Linux, Node 24.21.0, `TMPDIR` privé. Les mesures sont rangées au G7.

- **Fichier seul sous charge** : `node --test test/l2-links.test.ts` lancé 300 fois, 16 à la fois, sous 8 boucles de calcul.
- **Suite complète** : `npm test` lancé plusieurs fois.
- **Injections au chargement**, par un module `--import` actif dans le seul enfant de `l2-links`, à côté de quatre autres fichiers L2, sous charge. Pour chaque faute, on compte les exécutions de la forme exacte « fichier rouge, aucun test, aucune cause » :
  - `mkdtempSync` qui lève ;
  - `trap()` qui lève ;
  - rejet non attrapé avant le premier test ;
  - exception non attrapée avant le premier test ;
  - aucun port libre (`listen` toujours en erreur) ;
  - chargement lent de 2 s ;
  - `process.exit(1)` ;
  - `SIGKILL` ;
  - `abort`.
- **Perte de stderr par le lanceur** : 40 fichiers qui lèvent au chargement, 30 exécutions sous charge. On compte les fichiers dont la ligne d erreur manque.
- Les mêmes injections sont rejouées au gel : la cause doit apparaître pour chaque faute que le témoin peut voir.

## Tueurs (listés pour `--test-only`)

Les cinq tests de `test/keep-cause.test.ts`, chacun avec un tueur dans son support `test/helpers/keep-cause.ts` :

- `test/helpers/keep-cause.ts:36 CONST "${origin} during ${step}" -> "${origin}"` (`keep_cause_a_throw_at_load_reaches_stdout`)
- `test/helpers/keep-cause.ts:32 CONST "begun += 1" -> "begun += 0"` (`keep_cause_names_the_test_and_counts`)
- `test/helpers/keep-cause.ts:38 CONST "if (code !== 0)" -> "if (code > 7)"` (`keep_cause_an_exit_inside_a_test_names_it`)
- `test/helpers/keep-cause.ts:38 CONST "code !== 0" -> "code !== 1"` (`keep_cause_silent_on_a_green_file`)
- `test/helpers/keep-cause.ts:17 CONST "slice(0, 6)" -> "slice(0, 1)"` (`keep_cause_describes_on_one_line`)

Dans `test/l2-links.test.ts`, aucun corps de test ne change : aucun test n y est jugé, et ses 12 tueurs restent inchangés.

## Vérification du lot

- Le tableau de reproduction et les injections, à la base puis au gel.
- `node scripts/red-proof.mjs --base 050da36d --gel <worktree> --test-only`.
- `verifie-ancres.mjs` sur `test/l2-links.test.ts` et `test/keep-cause.test.ts`.
- `npm test` complet, `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, et R-25.

## Hors lot

- **L oracle et les scripts de test** (outil de MONARK, et `test:main` de #130, pas au tronc) : un second rapporteur, par exemple `--test-reporter=spec --test-reporter-destination=stdout --test-reporter=tap --test-reporter-destination=<fichier>`, garderait pour chaque fichier planté son `exitCode` et son `signal`. Ce sont les seules traces d un `kill` ou d un plantage natif, et `spec` les tait. Ce changement d outil est proposé, pas fait ici.
- La perte de stderr est un comportement du lanceur de Node : elle est mesurée ici, pas corrigée.

## Taille

Un support de 40 lignes, un test de 58 lignes, 6 lignes de test changées. Borne R-25 : 547.
