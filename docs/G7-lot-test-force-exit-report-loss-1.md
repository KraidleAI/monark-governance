# G7 du lot TEST-FORCE-EXIT-REPORT-LOSS-1 : ni les fichiers de tests ni le lanceur de `node --test` ne taisent plus la fin de leur sortie

- **Plan** : `docs/G0-lot-test-force-exit-report-loss-1.md` (commit `9667da4f`, corrigé au commit `9f89c787` pour la mesure du lanceur).
- **Base** : `318a3238`, puis le tronc `0effb5b2` (#136 et #130, fusion `91932df0`), puis le tronc `721b1d50` (fusion `db33dd55`), puis le tronc `0b04be9b` (fusion `7928d903` ; le tronc n y ajoute que trois lignes de `docs/HANDOFF-2026-10-02-publication.md`). Branche `recherches/test-force-exit-report-loss-1`.
- **Commits du lot** : tests `1ec64248`, gel des fichiers `c451666c` ; tests du lanceur `4cbc1998`, gel du lanceur `aad6a63f` ; tests de la ligne d export `520481a3`, gel de l export `16fe6075` ; tueur du test du lanceur recalé `6c7f86cb` ; correction du G0 `9f89c787` ; G7 précédent `b889b930` ; les quatre gardes d export `d8531b40`.
- **Zones ouvertes par MONARK** : les scripts de test de `package.json`, `.github/workflows/ci.yml` et un test garde (G0) ; `test/helpers/blocking-stdout.cjs` (message 96aeca9) ; une ligne de `WHITELIST_FILES` dans `scripts/export-public.mjs`, sa ligne de `docs/PRODUCT-BOUNDARY.md` et l addendum ADR-M004 D7 undecies (message 5ac3905) ; une ligne dans chacun de `test/bell-anchors.test.ts:167`, `test/no-cash-provider-name.test.ts:44`, `test/site-build-fleet.test.ts:813` et `test/release-public-flow.test.ts:31`, qui nomment `test/helpers/blocking-stdout.cjs` comme seule exception exportée (message 64f458c). `ci.yml` n est pas modifié.
- **Node** : 24.21.0, installé hors dépôt ; Linux ; suites lancées sans proxy, avec un `TMPDIR` propre.

## Construction

Deux pièces, une par processus qui appelle `process.exit()` sous `--test-force-exit`.

1. **Chaque fichier de tests (l enfant)** : un préchargement en ligne, `"--import=data:text/javascript,…"`, juste après `--test-force-exit` dans `test`, `test:main` et `test:export`. `node --test` le passe à chaque enfant par son `execArgv`. Il rend stdout bloquant, et sa garde de sortie change un code 0 en 70 si stdout garde des octets en file. Le lanceur marque alors le fichier rouge, par son nom. La garde ne touche qu un code 0 : elle ne peut pas verdir un rouge.
2. **Le lanceur** : `node -r ./test/helpers/blocking-stdout.cjs --test …` dans les trois mêmes scripts. Node 24.21 ne charge pas les modules `--import` dans le processus `--test` lui-même, mais il y charge un `--require` de fichier. `--require` ne lit pas d URL `data:`, d où un fichier. Ce fichier tient en quatre lignes en anglais et ne fait que `setBlocking(true)` sur stdout. Il n a pas de garde de sortie : le code du lanceur vient de son résumé interne, pas de ce qu il écrit, et il reste juste. Le `./` est requis, car `-r test/…` se résout comme un nom de paquet.
3. **Export** : le `package.json` exporté charge ce fichier. Il entre donc dans `WHITELIST_FILES` (une ligne), avec sa ligne de `docs/PRODUCT-BOUNDARY.md` (exigée par `product_boundary_matches_export_list`) et l addendum ADR-M004 D7 undecies. C est le seul fichier exporté de `test/**` racine.
4. **Le test de #130** (`test/ci-gates.test.ts`) : les gardes verrouillées de `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` lisent la tête `node -r ./test/helpers/blocking-stdout.cjs --test` puis le préchargement. (a) et (b) restent des égalités. Le tueur `package.json:18` de #130 se ré-ancre sur la même ligne, avec le même sens.

Tests (5, dans `test/test-force-exit-report.test.ts`) et leurs tueurs :

| Test | Tueur |
|---|---|
| `test_scripts_carry_the_report_preload` | `package.json:16 CONST "--import=data:text/javascript," -> "--import=data:text/plain,"` |
| `report_preload_delivers_every_byte_before_force_exit` | `package.json:16 CONST "setBlocking(true)" -> "setBlocking(false)"` |
| `report_preload_reds_a_child_that_would_drop_bytes` | `package.json:16 ROR "writableLength>0" -> "writableLength<0"` |
| `launcher_delivers_every_byte_before_force_exit` | `package.json:16 CONST "node -r ./test/helpers/blocking-stdout.cjs --test" -> "node --test"` |
| `exported_tree_ships_every_preload_its_test_scripts_load` | `scripts/export-public.mjs:76 SDL "  \"test/helpers/blocking-stdout.cjs\"," -> ""` |

Le tueur du test du lanceur porte sur `package.json`, pas sur le fichier : le red-proof refuse un tueur sur `test/helpers/**`, qu il compte comme du code de test.

## Mesures avant et après

### Les enfants

Synthétique : 24 fichiers de 400 tests, 9 600 attendus, 8 boucles de calcul en fond, rapporteur TAP vers un fichier.

| Ligne de commande | 5 exécutions (tests rapportés) | exit |
|---|---|---|
| `node --test --test-force-exit` (base) | 8 870, 8 806, 8 863, 8 805, 9 054 | 0 à chaque fois |
| idem + le préchargement de `scripts.test` | 9 600 × 5 | 0 |

Suite complète au gel des fichiers (`c451666c`), 4 boucles de calcul en fond :

| Ligne | Passage 1 | Passage 2 |
|---|---|---|
| `scripts.test` de la base | 2 187 tests, 0 échec, exit 0 | 2 130 tests, 0 échec, exit 0 |
| `scripts.test` du gel | 2 224 tests, 0 échec, exit 0 | 2 224 tests, 0 échec, exit 0 |

La garde seule (`setBlocking` neutralisé par un `--import` placé avant) : 3 exécutions, 8 646, 8 907 et 8 922 tests rapportés ; 22, 22 et 19 fichiers rouges nommés ; aucun fichier à moins de 400 rapports sans rouge. La suite sort 1.

La construction ne cache pas d échec. Fixture : un fichier dont le dernier de 400 tests échoue, un fichier qui pose `process.exitCode = 3`, un fichier vert. À la base, exit 1, mais le rapport du test qui échoue est perdu : le fichier n est rouge que par son code. Au gel, exit 1, le test est nommé (`✖ t399`), et le fichier au code 3 reste rouge.

### Le lanceur

**Correction d une première mesure.** Mon premier harnais lisait la sortie du lanceur après sa sortie. Or `child_process` jette les octets non lus d un tuyau quand l enfant sort. Les « 171 à 228 résultats sur 3 200, à chaque essai » du G7 précédent et de mon message de demande de zone venaient surtout de là ; ils sont retirés. Le trou reste réel.

Remesuré avec un lecteur attaché tôt : un tuyau créé par Node, comme le `spawnSync` du test 42, lu après 3 s ; 8 fichiers de 400 tests, sous charge.

| Lanceur | Exécutions qui perdent | Perte | exit |
|---|---|---|---|
| sans `-r` | 3 à 6 sur 10 | jusqu à 2 478 lignes et le résumé `ℹ tests` | 0 |
| avec `-r ./test/helpers/blocking-stdout.cjs` | 0 sur 20 | aucune | 0 |

Une sonde sur le `process.exit` du lanceur relève 12 à 46 Kio encore en file dans les exécutions qui perdent.

Test rouge du lot (`launcher_delivers_every_byte_before_force_exit`) : une sonde chargée dans le lanceur seul écrit 1 Mio juste avant sa sortie forcée, et le parent ne lit qu après la sortie ou 2 s. À la base, **146 176 octets** arrivent ; au gel, le Mio entier, le résumé et exit 0 (3 essais sur 3).

Portée : le code de sortie du lanceur restait juste. Une perte du lanceur ne rendait jamais vert un rouge ; elle coupait la fin du journal (récapitulatif `failing tests`, dernières lignes `✖`). Dans le test 42, elle coupait le résumé du `npm run ci` imbriqué, d où `exported CI ran an implausibly small suite` par intermittence.

## Red-proof

### Au gel des quatre gardes (`d8531b40`), contre le tronc `0b04be9b`

`node scripts/red-proof.mjs --base 0b04be9b --gel HEAD --repo /home/user/monark-governance-tfe --draw 5 --seed 37` (HEAD = `d8531b40`) : **REFUSED** (exit 1), 10 jugés, 78 inchangés, 5 tueurs tirés, tous **tués**. `RED-PROOF.json` sha256 `cd0650d98d7653fc…` (horodaté).

- **6 F2P**, comme au gel précédent : les 5 tests du lot et le test (a)-(f) de #130 élargi.
- **5 tueurs tués** : `package.json:16` ROR `writableLength>0` ; `package.json:16` CONST `setBlocking(true)` ; `package.json:16` CONST `data:text/javascript,` ; `package.json:16` CONST `node -r ./test/helpers/blocking-stdout.cjs --test` ; `scripts/export-public.mjs:76` SDL.
- **4 refus, par construction** : les quatre gardes touchées (`bell_publication_anchors_source_holds_no_fixture`, `no_cash_cross_provider_name_in_export`, `site_names_no_data_source`, `release_public_flow`), motif « no killer declared on the line above the test ». Ce ne sont pas des tests F2P : chaque ligne élargit une garde d une exception nommée, la garde est verte à la base (rien de `test/` n y est exporté) et au gel. Un tueur déclaré n y changerait rien (« green at base: a self-confirming test »), et la zone ouverte est d une ligne par fichier. Précédents de refus expliqués : `docs/G7-lot-harness-loopback-ports-1.md`, `docs/G7-lot-lint-untracked-tmp-1.md`.

Que les gardes gardent leur sens, je l ai vérifié à la main au gel : une seconde entrée `test/ci-gates.test.ts` ajoutée à `WHITELIST_FILES` (non commise) rougit les trois gardes d export (`bell-anchors`, `no-cash-provider-name`, `site-build-fleet`), 3 échecs sur 54. `release_public_flow` n est qu une fixture de copie : la vraie release lit l arbre entier.

**Limite du red-proof, relevée par MONARK (64f458c)** : il ne lance que les fichiers de tests que le lot touche. Une garde qui code une règle d export dans un autre fichier lui échappe : au gel `16fe6075`, les quatre gardes rouges étaient parmi les 33 inchangés, et le red-proof disait OK. **La suite complète reste la preuve** (voir « Suite et portes »).

Ancres : `verifie-ancres.mjs . --touched 0b04be9b HEAD` → 10 tueurs, **10 ANCRE**, 0 DERIVE, 0 PERDU (les fichiers touchés comptent désormais les quatre gardes).

### Étapes précédentes

Contre `721b1d50` (HEAD = `9f89c787`, même code que `6c7f86cb`) : **OK**, 6 jugés, 33 inchangés, 6 F2P, 5 tueurs tirés, tous tués ; `RED-PROOF.json` sha256 `c9bb81740862042f…` ; ancres 8/8. Mode F2P, pas `--test-only` : le lot change `package.json` et `scripts/export-public.mjs`.

Contre `318a3238` (3/3 tueurs tués) et contre `0effb5b2` (4 F2P, 3 tueurs tués, dont `ci.yml:164` de #130). Le tueur ré-ancré de #130 (`package.json:18`) a été appliqué à la main : `ci_jobs_have_timeout_and_test_flags_locked` et `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` rougissent.

## Suite et portes (`d8531b40`)

Les quatre fichiers seuls : **55 tests, 55 verts**.

Lancements en série, sans porte en parallèle, hôte sans autre charge.

| Lancement | Tests / verts / échecs / sautés | exit | Durée |
|---|---|---|---|
| `npm test`, passage 1 | 2 242 / 2 220 / **0** / 22 | 0 | 276 s |
| `npm test`, passage 2 | 2 242 / 2 220 / **0** / 22 | 0 | 324 s |
| `npm run test:main` | 2 241 / 2 219 / **0** / 22 | 0 | 171 s |
| `npm run test:export` (test 42 seul) | 1 / 1 / 0 / 0 | 0 | 114 s |

**Le test 42 est vert dans les deux `npm test` complets** (`export_public_no_governance_no_french`, 119 s et 122 s), résumé imbriqué compris. Le rouge intermittent d EXPORT-TEST42-SUMMARY-1 ne revient pas. `test:main` + `test:export` = 2 242, le compte de `npm test`.

Portes : `export:check` 0, `tsc --noEmit` 0, `lint` 0, `lint:ratchet` 69/69, `gate:vocab` OK (335 fichiers), `lang:gate` 0.

### Au gel précédent (`9f89c787`) : quatre rouges, causés par la ligne d export (`16fe6075`)

`npm test` 2 242 / 2 216 / 4 / 22 (deux passages), `test:main` 2 241 / 2 215 / 4 / 22, `test:export` 1/1. Les mêmes quatre tests rougissaient à chaque lancement :

| Test | Fichier | Cause |
|---|---|---|
| `bell_publication_anchors_source_holds_no_fixture` | `test/bell-anchors.test.ts:167` | exige qu aucune entrée de `WHITELIST_FILES` ne commence par `test/` |
| `no_cash_cross_provider_name_in_export` | `test/no-cash-provider-name.test.ts:44` | exige qu aucun fichier exporté ne soit sous `test/` (ses littéraux de fournisseurs ne doivent pas fuir) |
| `site_names_no_data_source` | `test/site-build-fleet.test.ts:813` | même règle, pour les littéraux de noms de sources |
| `release_public_flow` | `test/release-public-flow.test.ts:31` | sa copie de l arbre exclut `test/` ; l export de la release échoue alors, fermé : `required whitelist entr(ies) missing: test/helpers/blocking-stdout.cjs` |

Les trois premiers verrouillent D7 octies (f) : « `test/` racine n est pas exporté ». L addendum D7 undecies fait une exception d un fichier, que ces gardes ignoraient.

### Les quatre lignes (`d8531b40`, zone ouverte par MONARK, 64f458c)

Une exception nommée par garde, une ligne par fichier :

- `bell-anchors.test.ts:167` : `f.startsWith("test/") && f !== "test/helpers/blocking-stdout.cjs"` ;
- `no-cash-provider-name.test.ts:44` et `site-build-fleet.test.ts:813` : `f.rel.startsWith("test/") && f.rel !== "test/helpers/blocking-stdout.cjs"` ;
- `release-public-flow.test.ts:31` : le filtre de `cpSync` laisse passer `test`, `test/helpers` et `test/helpers/blocking-stdout.cjs` (`/^test(\/helpers(\/blocking-stdout\.cjs)?)?$/`), et rien d autre de `test/`.

Chaque garde garde son sens : les fichiers qui portent des littéraux (`test/*.test.ts`) restent hors de l export, et le seul fichier exporté de `test/` n en porte aucun.

## R-25

`scripts/oracle/r25.mjs` (fonction `r25`, `ci.yml` du gel) contre `0b04be9b`, au gel `d8531b40` : `STAT` 129 insertions, 11 suppressions, **140** (borne `VIBEGATES_PR_LIMIT` = 1 205) ; `CONTENT_STAT` 0 (borne 8 000). VERT. (Contre `721b1d50`, avant les quatre lignes : 132.) Ce G7 est hors du compte (`docs/**/*.md`).

## Interaction avec #130 (CI-G3-DURATION-1)

- #130 est au tronc. `ci.yml` ne change pas : g3 lance `npm run test:main`, `g3-export` lance `npm run test:export`. Les deux scripts portent la tête `-r` et le préchargement.
- Le test de #130 verrouille la forme des deux scripts ; il lit désormais la tête `-r` et le préchargement avant les gardes (voir « Construction », point 4).
- Le test 42 de #130 lance le `npm run ci` exporté. Celui-ci porte les deux pièces : ni ses enfants ni son lanceur ne perdent leur fin, et le résumé arrive. Il est vert dans les deux `npm test` complets.

## Items clos

Les quatre gardes sont réconciliées (`d8531b40`) et la suite complète est verte.

- **TEST-FORCE-EXIT-REPORT-LOSS-1** : une CI verte ne peut plus taire la fin d un fichier de tests (cause retirée par `setBlocking` ; garde par fichier si le blocage manque).
- **EXPORT-TEST42-SUMMARY-1** : la sortie imbriquée du test 42 n est plus tronquée (le lanceur exporté bloque).
- **Le trou du lanceur** (limite dite au G7 précédent, question 1) : couvert par `test/helpers/blocking-stdout.cjs`.

## Suites (items formés par MONARK, message 96aeca9, hors de ce lot)

- **TEST-FORCE-EXIT-NEED-1** : mesurer, fichier par fichier, ce qui ne sortirait pas sans `--test-force-exit`, et retirer le drapeau s il n y a plus rien. Le lot le garde.
- **MUTANTS-RUN-EXIT-CODE-1** : `scripts/mutants/run.mjs` juge sur la sortie, pas sur le code de sortie. Un rapport d échec perdu y donne « survit » au lieu de « tué » ; le sens est sûr, la mesure est fausse. Tests d abord, avec un tueur.
- Les tests jamais enregistrés (`await` de premier niveau, question 2 du G0) restent hors de la garde.

## Windows

Les tuyaux y bloquent déjà : les deux pièces y sont sans effet sur les rapports. Mais `-r ./test/helpers/blocking-stdout.cjs` et le préchargement en ligne passent par `cmd.exe`. Ce n est pas vérifié ici : **à la fusion, MONARK lance l oracle Windows, puis `npm run test:main` et `npm run test:export` sous `cmd.exe`** (64f458c).

## Écarts

- Node 24 installé hors dépôt.
- Red-proof REFUSED au gel `d8531b40`, par les seules quatre gardes élargies (voir « Red-proof ») ; les 6 F2P et les 5 tueurs du lot tiennent.
- Le commentaire de `scripts/red-proof.mjs` (« Loaded in the runner and, through its execArgv, in the child ») surestime la portée de son `--import` : le lanceur ne le charge pas. Le red-proof lit le TAP de l enfant ; le lot ne le touche pas.
- Le mode de `packages/rpc-guard/bin/rpc-guard.mjs` n est pas touché.

## Sortie

**LIVRÉ.** Les quatre lignes ouvertes par MONARK (64f458c) sont commises (`d8531b40`). Les quatre fichiers : 55/55. `npm test` deux fois, `test:main` et `test:export` : 0 échec, test 42 vert dans les deux `npm test`. Portes vertes. Red-proof contre `0b04be9b` : 6 F2P, 5/5 tueurs tués, 4 refus par construction (gardes élargies, vertes à la base) ; ancres 10/10 ; R-25 140. Reste à la fusion : l oracle Windows, puis `test:main` et `test:export` sous `cmd.exe` (MONARK). Rien poussé.
