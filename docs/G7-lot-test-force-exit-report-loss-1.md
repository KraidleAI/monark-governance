# G7 du lot TEST-FORCE-EXIT-REPORT-LOSS-1 : les enfants de `node --test` ne taisent plus la fin d un fichier ; le lanceur reste à couvrir

- **Plan** : `docs/G0-lot-test-force-exit-report-loss-1.md` (commit `9667da4f`, mis à jour à ce G7).
- **Base** : `318a3238`, puis le tronc `0effb5b2` (#136 et #130), fusionné dans la branche (commit de fusion `91932df0`). Branche `recherches/test-force-exit-report-loss-1`. Tests `1ec64248`, gel `c451666c`.
- **Zone ouverte par MONARK** : les scripts de test de `package.json`, `.github/workflows/ci.yml`, un test garde. `ci.yml` n est pas modifié.
- **Node** : 24.21.0, installé hors dépôt ; Linux ; suites lancées sans proxy, avec un `TMPDIR` propre.

## Ce qui a changé

1. `package.json` : `test`, `test:main` et `test:export` portent, juste après `--test-force-exit`, le même argument en ligne `"--import=data:text/javascript,…"`. Il rend stdout bloquant, et sa garde de sortie change un code 0 en 70 si stdout garde des octets en file.
2. `test/test-force-exit-report.test.ts` (neuf, 3 tests, voir le G0).
3. À la fusion du tronc, deux retouches du test de #130 (`test/ci-gates.test.ts`) :
   - les gardes verrouillées de `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` s élargissent d un jeton, le préchargement : `/^node --test (--test-timeout=\d+ --test-force-exit "--import=[^"]+") /`. (a) et (b) restent des égalités ;
   - le tueur `package.json:18` de #130 se ré-ancre sur la même ligne, avec le même sens : `CONST "--test-timeout=300000 --test-force-exit " -> "--test-timeout=300000 "`.

`ci.yml` ne change pas : g3 lance `npm run test:main`, `g3-export` lance `npm run test:export`, et les deux scripts portent le préchargement.

## Mesures

### La perte, à la base et au gel (rapports des enfants)

Synthétique : 24 fichiers de 400 tests, 9 600 attendus, 8 boucles de calcul en fond, rapporteur TAP vers un fichier.

| Ligne de commande | 5 exécutions (tests rapportés) | exit |
|---|---|---|
| `node --test --test-force-exit` (base) | 8 870, 8 806, 8 863, 8 805, 9 054 | 0 à chaque fois |
| idem + le préchargement de `scripts.test` | 9 600 × 5 | 0 |

Suite complète, même arbre (gel `c451666c`), 4 boucles de calcul en fond. La ligne de base est le `scripts.test` de `318a3238`, la ligne du gel celle de `c451666c` :

| Ligne | Passage 1 | Passage 2 |
|---|---|---|
| `scripts.test` de la base | 2 187 tests, 0 échec, exit 0 | 2 130 tests, 0 échec, exit 0 |
| `scripts.test` du gel | 2 224 tests, 0 échec, exit 0 | 2 224 tests, 0 échec, exit 0 |

Hôte calme, `npm test` au gel : 2 224 tests, 2 202 verts, 0 échec, 22 sautés, exit 0 (7 min 25). L ancien total attendu de 2 211 vient d une base antérieure. Ici, 2 224 = 2 221 à la base, sans perte, plus les 3 tests du lot.

### La garde seule nomme chaque fichier qui perd

`setBlocking` est neutralisé par un `--import` placé avant le préchargement. Il ne reste alors que la garde. Les tests du synthétique portent le numéro de leur fichier.

| Exécution | Tests rapportés | Fichiers rouges nommés (`not ok … t/fN.test.mjs`) | Fichiers à moins de 400 sans rouge |
|---|---|---|---|
| 1 | 8 646 | 22 | 0 |
| 2 | 8 907 | 22 | 0 |
| 3 | 8 922 | 19 | 0 |

Sur 72 fichiers lancés, chaque fichier qui a perdu un rapport est rouge et nommé. Chaque fichier vert a ses 400 rapports. La suite sort 1.

### La construction ne cache pas d échec

Fixture : un fichier dont le dernier de 400 tests échoue, un fichier qui pose `process.exitCode = 3`, un fichier vert.

- Base : exit 1. Le rapport du test qui échoue est **perdu** ; le fichier n est rouge que par son code (`✖ f/lastfail.test.mjs`).
- Gel : exit 1. Le test est nommé (`✖ t399`), et le fichier au code 3 reste rouge.
- La garde ne touche qu un code 0 : le test 3 vérifie qu un enfant sorti à 3 garde 3, et qu un enfant sans octet en file reste à 0.

### Limite trouvée : le lanceur n est pas couvert

En vérifiant le test 42 (voir la suite plus bas), j ai mesuré que **le processus lanceur de `node --test` ne charge pas les modules `--import`**. Seuls les enfants les chargent : un préchargement qui note son pid n en note qu un par fichier, jamais celui du lanceur. Un `--require` de fichier, lui, est chargé dans le lanceur. Le G0 disait le contraire ; il est corrigé.

Le lanceur appelle lui aussi `process.exit()` sous `--test-force-exit`. Son stdout n est bloquant que selon ce qui le lit :

- sortie vers un tuyau de shell, lu 3 s en retard : aucune perte (3 essais) ;
- sortie vers un tuyau créé par `spawn` de Node, lu après la sortie du lanceur (8 fichiers de 400 tests, 3 essais par ligne) :

| Lanceur | Tests rapportés | Résumé `ℹ tests` | exit |
|---|---|---|---|
| sans préchargement | 171, 171, 228 sur 3 200 | perdu | 0 |
| préchargement du lot (enfants seulement) | 171, 171, 171 | perdu | 0 |
| préchargement + `-r <fichier setBlocking>` | 3 200 × 3 | présent | 0 |

Portée :

- Le code de sortie du lanceur reste juste : il vient de `process.exitCode`, posé sur le résumé interne, et pas de la sortie écrite. Une perte du lanceur ne rend donc jamais vert un rouge. Un enfant qui perd est rouge par la garde, et le lanceur sort alors 1.
- En revanche, la fin du journal peut manquer : le récapitulatif `failing tests` et les dernières lignes `✖`. La CI est rouge, mais le nom peut manquer au journal.
- C est la forme du rouge du test 42 : `npm run ci` imbriqué tourne sous `spawnSync`, sort 0 et n a pas de résumé. Le lot ne la règle pas (question 1).

## Red-proof

1. Avant la fusion : `node scripts/red-proof.mjs --base 318a3238 --gel c451666c --repo /home/user/monark-governance-tfe --draw 3 --seed 37`. **OK**, 3 jugés, 3 F2P, 3 tueurs tirés et **tués** (`package.json:16` CONST `setBlocking(true)`, ROR `writableLength>0`, CONST `data:text/javascript,`). `RED-PROOF.json` sha256 `e3e0f50be5f9505d…` (horodaté).
2. Après la fusion, contre le tronc : `--base 0effb5b2 --gel HEAD` (`91932df0`), mêmes options. **OK**, 4 jugés, 33 inchangés, 4 F2P (les 3 du lot et le test (a)-(f) de #130 élargi), 3 tueurs tirés, tous **tués** :
   - `package.json:16` CONST `setBlocking(true)` ;
   - `package.json:16` ROR `writableLength>0` ;
   - `ci.yml:164` CONST `npm run test:export` (tueur de #130).

   `RED-PROOF.json` sha256 `4cfa0f0a3c05d364…`.
3. Le tueur ré-ancré de #130 (`package.json:18`) n a pas été tiré. Je l ai appliqué à la main : `ci_jobs_have_timeout_and_test_flags_locked` et `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` rougissent.

Mode F2P et non `--test-only` : le lot change `package.json`.

Ancres : `verifie-ancres.mjs . --touched 318a3238 HEAD` → 3 tueurs, 3 ANCRE ; `--touched 0effb5b2 HEAD` → 6 tueurs, 6 ANCRE, 0 DERIVE, 0 PERDU.

## Suite et portes, après la fusion (`91932df0`)

| Lancement | Tests / verts / échecs / sautés | exit |
|---|---|---|
| `npm test` | 2 230 / 2 207 / **1** / 22 | 1 : le test 42, `exported CI ran an implausibly small suite` (sortie imbriquée sans résumé, la limite du lanceur ci-dessus ; portes lancées en parallèle) |
| `npm run test:main` | 2 229 / 2 207 / 0 / 22 | 0 |
| `npm run test:export` (test 42 seul) | 1 / 1 / 0 / 0 | 0 |

Portes : `tsc --noEmit` 0, `lint` 0, `lint:ratchet` 69/69, `gate:vocab` OK, `lang:gate` 0, `export:check` 0.

## R-25

`git diff --shortstat 0effb5b2 HEAD`, sans `docs/**/*.md` : 3 fichiers, 69 insertions, 6 suppressions, **75** (borne : 547). Contre `318a3238`, avant la fusion : 65.

## Questions ouvertes

1. **Le lanceur (à former en item, ou rattacher à EXPORT-TEST42-TRUNCATION-1).** Mesuré ci-dessus : un `-r <fichier>` qui rend stdout bloquant, placé avant `--test`, couvre le lanceur. Il demande un fichier, car `--require` ne lit pas d URL `data:`. Ce serait par exemple un `.cjs` d une ligne sous `test/helpers/`, exporté avec `test/**`. Ce fichier est hors de la zone ouverte : je ne l ai pas créé. Il réglerait le rouge intermittent du test 42 (sortie imbriquée tronquée) et la fin du journal de g3.
2. **`--test-force-exit` est-il encore utile ?** (question 1 du G0) Non mesuré ici.
3. **Les tests jamais enregistrés** (`await` de premier niveau, question 2 du G0) restent hors de la garde.
4. **`scripts/mutants/run.mjs`** lance `--test-force-exit` sans préchargement, et juge sur le TAP seul, pas sur le code de sortie. Un rapport d échec perdu y donne « survit » au lieu de « tue ». C est le sens prudent : un mutant n est jamais déclaré tué à tort. Hors zone.
5. **Windows** (question 3 du G0) : la ligne passe par `cmd.exe` ; ce n est pas vérifié ici.

## Écarts

- Node 24 installé hors dépôt.
- Le commentaire de `scripts/red-proof.mjs` (« Loaded in the runner and, through its execArgv, in the child ») surestime la portée de son `--import`, comme le G0 de ce lot. Le red-proof lit le TAP de l enfant ; le lot ne le touche pas.
- Le mode de `packages/rpc-guard/bin/rpc-guard.mjs` n est pas touché.

## Sortie

LIVRÉ pour contrôle par MONARK, avec la limite du lanceur dite. Rien poussé.
