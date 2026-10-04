# G0 du lot TEST-FORCE-EXIT-REPORT-LOSS-1 : une CI verte ne peut plus taire la fin d un fichier de tests

- **Demande** : MONARK, item `TEST-FORCE-EXIT-REPORT-LOSS-1`, issu du constat annexe de `docs/G7-lot-l2-links-file-crash-1.md` (lot L2-LINKS-FILE-CRASH-1). Citation : « une CI verte avec des tests non rapportés ne prouve rien sur ces tests ».
- **Base** : `318a3238` (`origin/lot/etude-suite`). Branche `recherches/test-force-exit-report-loss-1`. Auteur : RECHERCHES.
- **Zone ouverte par MONARK** : les scripts de test de `package.json`, `.github/workflows/ci.yml`, et un test garde.

## Constat (repris du lot L2-LINKS-FILE-CRASH-1)

- Avec `--test-force-exit`, l enfant de `node --test` appelle `process.exit()` à la fin de son fichier.
- Sous POSIX, son stdout est un tuyau non bloquant. Sous charge, les derniers rapports sont encore en file à cet instant ; ils sont perdus, et le fichier sort 0.
- Mesure synthétique : 24 fichiers de 400 tests, 9 600 attendus. Avec le drapeau : 9 571 à 9 585 rapportés, exit 0. Sans : 9 600.
- Suites complètes : 2 116 et 2 170 tests rapportés au lieu de 2 211, toutes vertes.
- Sous Windows, les tuyaux bloquent : ce mode n y existe pas.
- Le même mécanisme rougit le test 42 sous charge (PR #130, `docs/G0-lot-ci-g3-duration-1.md` : `npm run ci` imbriqué sort à 0 sans résumé).

Remesuré sur cette base (Node 24.21.0, 24 fichiers de 400 tests, 8 boucles de calcul, rapporteur TAP) :

| Ligne de commande | Exécution 1 | Exécution 2 | exit |
|---|---|---|---|
| `node --test --test-force-exit` | 8 952 | 8 930 | 0 |
| idem + le préchargement de ce lot | 9 600 | 9 600 | 0 |
| idem, `setBlocking` neutralisé avant le préchargement (la garde seule) | 8 968 réussis, **24 fichiers rouges nommés** | | 1 |

## Construction retenue

Un préchargement, en ligne dans `scripts.test`, juste après `--test-force-exit` :

```
"--import=data:text/javascript,process.stdout._handle&&process.stdout._handle.setBlocking(true);process.on('exit',function(c){if(c===0&&process.stdout.writableLength>0)process.exitCode=70})"
```

(Après la G2, m-4 : `setBlocking` n est appelé que si `typeof(process.stdout._handle.setBlocking)==='function'`, comme dans `test/helpers/blocking-stdout.cjs` ; voir le G7.)

`node --test` passe ses `--import` aux enfants par leur `execArgv` (mesuré, et c est déjà ce que fait `scripts/red-proof.mjs`). Le module tourne dans chaque enfant. **Correction après le gel (mesurée, voir le G7)** : il ne tourne pas dans le lanceur. Node 24.21 n initialise pas les modules `--import` du processus `--test` lui-même (un `--require` de fichier, lui, y est chargé). Il fait deux choses, dans chaque enfant. Le lanceur est traité à part : voir « Le lanceur » plus bas.

1. **La cause est corrigée** : stdout devient bloquant. Chaque écriture est remise au tuyau avant de rendre la main ; `process.exit()` n a plus rien à jeter. C est le correctif du préchargement de `red-proof.mjs`, ici dans le script de la suite.
2. **La garde** : à la sortie, si le code vaut 0 et que stdout garde encore des octets en file (`writableLength > 0`), ces octets vont être perdus. Le code devient alors 70. Le lanceur marque le fichier rouge, **par son nom** (`✖ <fichier>`, `'test failed'`), et la suite sort 1. Avec stdout bloquant, `writableLength` vaut 0 après chaque écriture : la garde ne joue que si le blocage manque (une autre plateforme, un Node futur, un `_handle` absent).

### Pourquoi cette construction ne peut pas cacher un échec

- Elle ne lit aucun résultat et ne réécrit aucun code non nul : la garde ne touche qu un code 0. Un fichier rouge reste rouge avec son code.
- Elle ne fait qu ajouter un rouge, au seul endroit où la perte se voit : l enfant, à sa sortie.
- Le bloquant ne change pas ce qui est écrit, seulement le moment.

### Constructions écartées

- **Compte des tests dans un fichier TAP (`--test-reporter=tap --test-reporter-destination=<fichier>`)** : le fichier est écrit par le lanceur, à partir du même flux d événements que `spec`. Un rapport perdu dans le tuyau de l enfant manque aux deux rapporteurs. Les deux comptes sont égaux, et l écart ne se voit pas.
- **Compte comparé à un plancher** : un plancher global laisse passer toute perte plus petite que sa marge, et ne nomme aucun fichier. Des planchers par fichier demandent une mise à jour à chaque lot qui ajoute ou retire un test. Les deux mesurent l effet ; le préchargement retire la cause.
- **Retrait de `--test-force-exit`** : il corrige aussi la perte (9 600 sur 9 600 sans le drapeau). Mais le drapeau est verrouillé par le checkpoint-2 V-1(b) (`ci_jobs_have_timeout_and_test_flags_locked`) : il fait sortir un fichier dont un handle fuit après les tests. Sans lui, une telle fuite pend le job jusqu à `timeout-minutes`, sans nom. Ce choix revient à MONARK (question 1). Le lot garde le drapeau et le rend sans danger pour les rapports.
- **Un module dans `scripts/`** : il faudrait l ajouter à la liste blanche de l export public (`scripts/export-public.mjs`), hors de la zone. Le `package.json` exporté porte le préchargement en ligne ; le miroir public en profite sans autre fichier.

### Contraintes du texte en ligne

- Pas de `?` ni de `#` : dans une URL `data:`, ils ouvrent la requête ou le fragment, et le chargeur ESM de Node ne lit que le chemin. D où `_handle&&…` au lieu de `?.`.
- Pas d espace, de `"`, de `$`, d accent grave ni de `%` : l argument passe tel quel par `sh` (Linux) et par `cmd.exe` (Windows), entre guillemets doubles. `&&`, `>`, `(`, `{` et `'` y sont littéraux.
- Le test garde vérifie ces contraintes.

### Hors de ce lot

- **Les tests jamais enregistrés** : un `await` de premier niveau placé après un `test()` laisse `--test-force-exit` finir le fichier avant l enregistrement des tests suivants (`test/bell-deploy-config.test.ts`, commentaire des lignes 24-26). Ce n est pas une perte de rapport : l enfant n a jamais connu ces tests, et aucune garde de sortie ne peut le voir. Ce mode reste couvert par la règle d écriture de ce commentaire (question 2).
- `scripts/red-proof.mjs` et `scripts/mutants/run.mjs` ont déjà leur propre préchargement ou n en ont pas besoin ; ils ne changent pas.
- `ci.yml` ne change pas : la CI lance la suite par `npm test` (et, après #130, par `npm run test:main` et `npm run test:export`), donc par les scripts.

## Le lanceur (ajout daté du 2026-10-04, zones ouvertes par MONARK : message 96aeca9 pour le fichier, 5ac3905 pour la ligne d export)

- **Constat** : le processus lanceur de `node --test` ne charge pas les modules `--import`, mais il appelle lui aussi `process.exit()` sous `--test-force-exit`. Son code de sortie reste juste ; seule la fin du journal peut se perdre. C est la forme du rouge du test 42 (EXPORT-TEST42-SUMMARY-1), dont le `npm run ci` imbriqué écrit dans un tuyau créé par Node (`spawnSync`).
- **Correction de la première mesure** : les chiffres annoncés d abord (171 à 228 résultats sur 3 200, à chaque essai) étaient surtout un artefact du harnais. Il lisait la sortie du lanceur après sa sortie, et `child_process` jette les octets non lus d un tuyau quand l enfant sort. Le trou reste réel. Remesuré avec un lecteur attaché tôt (lecture après 3 s) :
  - sans `-r` : 3 à 6 exécutions sur 10 perdent, jusqu à 2 478 lignes et le résumé, avec exit 0. Une sonde sur ce `process.exit` relève 12 à 46 Kio encore en file ;
  - avec `-r` : 0 exécution sur 20 perd.
- **Construction** : `test/helpers/blocking-stdout.cjs`, quatre lignes en anglais, qui ne font que `setBlocking(true)` sur stdout. Il est chargé par `node -r ./test/helpers/blocking-stdout.cjs --test` dans `test`, `test:main` et `test:export`. Sans garde de sortie : la garde reste dans le préchargement en ligne, par fichier. Sans stderr : le rapport et le résumé vont sur stdout. Le `./` est nécessaire, car `-r test/…` se résout comme un nom de paquet.
- **Export** : le `package.json` exporté charge le fichier. Il entre donc dans `WHITELIST_FILES`, avec sa ligne de `docs/PRODUCT-BOUNDARY.md` (exigée par `product_boundary_matches_export_list`) et l addendum ADR-M004 D7 undecies.
- **Tests** (d abord) :
  - `launcher_delivers_every_byte_before_force_exit` : une sonde chargée dans le lanceur seul écrit 1 Mio juste avant sa sortie forcée, et le parent ne lit qu après la sortie ou 2 s. À la base, sans `-r`, 146 176 octets arrivent ; au gel, avec `-r`, le Mio entier, le résumé et exit 0 (3 essais sur 3).
  - `exported_tree_ships_every_preload_its_test_scripts_load` : chaque fichier qu un script charge par `-r` est dans `collectFiles(ROOT).kept`.
  - Le test 1 exige le préfixe `-r` dans tout script à `--test-force-exit`.
- **Tueurs** :
  - `package.json:16 CONST "node -r ./test/helpers/blocking-stdout.cjs --test" -> "node --test"` ;
  - `scripts/export-public.mjs:76 SDL "  \"test/helpers/blocking-stdout.cjs\"," -> ""`.

  Le red-proof refuse un tueur sur `test/helpers/**`, qu il compte comme du code de test.
- **#130** : la vérification (a)-(b) lit la tête `node -r ./test/helpers/blocking-stdout.cjs --test` avant les gardes, et (b) s écrit `${tête} ${gardes} --test-name-pattern=…`.

## Composition avec la PR #130 (CI-G3-DURATION-1)

#130 ajoute `test:main` et `test:export`, et son test `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` verrouille leur forme :

- (a) `test:main` = `scripts.test` où `--test-skip-pattern="\(test 42\)"` suit les gardes `--test-timeout=\d+ --test-force-exit` ;
- (b) `test:export` = `node --test <gardes> --test-name-pattern="\(test 42\)" "test/export-public.test.ts"`, à l égalité près.

Le préchargement suit `--test-force-exit` : la regex des gardes de (a) se lit toujours au début de `scripts.test`. Rebasage, quel que soit l ordre de fusion :

1. **Le lot qui fusionne en second élargit les gardes de #130 d un jeton** : `/^node --test (--test-timeout=\d+ --test-force-exit "--import=[^"]+") /`. (a) et (b) restent des égalités, et le préchargement fait partie des gardes.
2. `test:main` et `test:export` portent alors le préchargement juste après `--test-force-exit` (avant le drapeau de saut ou de nom).
3. Le tueur de #130 `package.json:18 CONST "--test-force-exit --test-name-pattern" -> "--test-name-pattern"` perd son texte. Il se ré-ancre en `CONST "--test-timeout=300000 --test-force-exit " -> "--test-timeout=300000 "`, sur la même ligne et avec le même sens (la garde `--test-force-exit` retirée de `test:export`), sans guillemet échappé dans le texte cherché.
4. Le premier test de ce lot exige déjà le même préchargement dans **tout** script qui porte `--test-force-exit` : `test:main` et `test:export` y entrent d eux-mêmes.

**Fait** (mise à jour après le gel) : #130 est entré au tronc (`0effb5b2`). Le tronc a été fusionné dans la branche (commit de fusion `91932df0`), avec les points 1 à 3 ci-dessus. `ci.yml` ne change toujours pas : g3 lance `test:main`, `g3-export` lance `test:export`, et les deux portent le préchargement. Le red-proof et R-25 se lisent désormais contre `0effb5b2` (voir le G7).

Le test 42 de #130 profite du préchargement : le `package.json` exporté le porte, donc `npm run ci` imbriqué ne perd plus la fin de sa sortie.

## Tests (d abord)

Nouveau fichier `test/test-force-exit-report.test.ts`, trois tests au gel du plan. **Mise à jour (G2, m-2)** : le lot en livre cinq (plus le test du lanceur et celui de l export, voir « Le lanceur » plus haut), puis six après le pli de la G2, qui scinde le test 3 (voir le G7) :

1. **`test_scripts_carry_the_report_preload`** : `scripts.test` porte, juste après `--test-force-exit`, un argument `"--import=data:text/javascript,…"` unique, sans `?`, `#`, `%`, `$`, espace ni accent grave. Tout autre script qui porte `--test-force-exit` porte le même argument.
2. **`report_preload_delivers_every_byte_before_force_exit`** : un enfant écrit 4 Mio sur stdout puis appelle `process.exit(0)`, et le parent ne lit qu après la sortie de l enfant (ou 2 s au plus). Sans le préchargement, des octets sont perdus (non-vacuité de la fixture). Avec le préchargement pris dans `scripts.test`, les 4 Mio arrivent et le code vaut 0.
3. **`report_preload_reds_a_child_that_would_drop_bytes`** : même enfant, avec un `--import` placé avant qui neutralise `setBlocking`. La garde rend le code 70. Un enfant qui sort à 3 garde 3. Un enfant qui n écrit rien (0 octet) sort à 0 (pas de faux rouge).

Tueurs (lignes `killer:` au-dessus des déclarations ; `package.json` ligne 16, le script `test`, au gel) :

- test 1 : `package.json:16 CONST "--import=data:text/javascript," -> "--import=data:text/plain,"` ;
- test 2 : `package.json:16 CONST "setBlocking(true)" -> "setBlocking(false)"` ;
- test 3 : `package.json:16 ROR "writableLength>0" -> "writableLength<0"`.

## Preuve

- `node scripts/red-proof.mjs --base 318a3238 --gel <gel> --repo /home/user/monark-governance-tfe --draw 3 --seed 37`, en mode F2P : le lot change `package.json`, pas seulement des tests. À la base, `scripts.test` n a pas de préchargement : les trois tests rougissent par assertion. Au gel, ils sont verts, et chaque tueur doit être tué.
- `verifie-ancres.mjs . --touched 318a3238 HEAD` : 3 tueurs ANCRE.
- `npm test` complet au gel ; `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.
- Mesure synthétique du tableau plus haut, refaite au gel avec la ligne exacte de `scripts.test`.

## Taille

Environ 100 lignes (un script d une ligne, un fichier de test). Borne R-25 : 547.

## Questions pour MONARK

1. **`--test-force-exit` est-il encore utile ?** Le lot le garde. Une suite complète sans le drapeau dira si un fichier y pend ; la mesure est notée au G7 si elle est faite.
2. **Les tests jamais enregistrés** (await de premier niveau, voir plus haut) restent hors de la garde. Faut-il un item à part ?
3. **Windows** : le préchargement y est sans effet sur les rapports (les tuyaux bloquent déjà), mais la ligne doit passer par `cmd.exe`. MONARK rejoue `test:main` et `test:export` sous `cmd.exe` à la fusion.
