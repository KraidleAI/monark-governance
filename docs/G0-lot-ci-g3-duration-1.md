# G0 du lot CI-G3-DURATION-1 : le test 42 sort de `g3-verification` dans son propre job, `g3-export`

- **Demande** : MONARK, `2026-10-04-MONARK-vers-RECHERCHES-L2-fusionnee-ci-20.md` §2 : « CI-G3-DURATION-1 est à toi : mesurer les fichiers sur le runner, et sortir le test 42 dans son propre job s il domine. Item à former dans ton G0. » Suite de `2026-10-04-RECHERCHES-vers-MONARK-g3-borne-10-min.md` (proposition 2).
- **Base** : `04c97744` (`origin/lot/etude-suite`, `timeout-minutes: 20` sur g3), branche `recherches/ci-g3-duration-1`. Auteur : RECHERCHES.

## Item formé

**CI-G3-DURATION-1.** Le test 42 (`export_public_no_governance_no_french`, `test/export-public.test.ts:142`) quitte le job `g3-verification` pour un job à lui, `g3-export`, avec sa propre borne. Aucune couverture n est perdue : chaque PR exécute toujours tous les tests, répartis sur deux jobs. `npm test` en local exécute toujours tout. Critère de sortie : g3 sans le test 42, et un job `g3-export` qui ne lance que lui ; tous deux sous leur borne avec marge ; la répartition est verrouillée par des tests.

## Zone

- **`.github/workflows/ci.yml` : zone de MONARK, ouverte pour ce lot par son assignation (§2 du message ci-dessus).** Le changement s y limite à deux points : la ligne `run:` de g3 (`npm test` devient `npm run test:main`) et un job ajouté, `g3-export`. Aucun autre job n est touché.
- `package.json` : deux scripts ajoutés, `test:main` et `test:export`. `test` ne change pas.
- `scripts/export-public.mjs` : `derivePublicWorkflow` retire du workflow public les jobs internes d une liste fermée, `r25-taille-de-lot` et désormais `g3-export`. La racine `test/` n est jamais exportée : un job `g3-export` gardé dans le miroir public y serait rouge.
- Tests : `test/ci-gates.test.ts` (le test verrou et un test neuf), `test/export-public.test.ts` (le test 42(f') seul ; le corps du test 42 ne change pas).

## Mesures

### Sur le runner GitHub (étapes de job, `gh api …/actions/runs/<id>/jobs`)

Je ne peux pas lire les journaux depuis cet hôte. Les durées viennent des horodatages des étapes, pour les 100 derniers runs (du 24/09 au 04/10). L étape mesurée est « Vocabulary gate + strict typecheck + tests » de g3, soit `gate:vocab`, `tsc` et `npm test`.

| Fenêtre | Runs g3 | Verts : min / médiane / max | Coupés à 10 min | Rouges |
|---|---|---|---|---|
| 24/09 → 01/10 | 27 | 19 : 101 / 119 / 173 s | 0 | 7 |
| 03/10 → 04/10 (blocs CM, L2, outils) | 64 | 16 : 146 / 236 / 526 s | 16, entre 584 et 601 s | 32 (cause illisible d ici ; beaucoup sont des relances de branches anciennes) |

- #125 (`9bed61ce`), vert : étape 409 s, job 426 s.
- b1 (`61b11e91`), relancé à 16:20 : étape 263 s et 258 s, verts. Les mêmes têtes étaient coupées à 15:17, quand six runs partaient dans la même minute.
- La distribution est bimodale : environ 150 à 260 s, ou plus de 590 s (coupé). Le même commit passe de l un à l autre selon le moment. La lenteur vient donc surtout du runner, pas d un seul test.
- **La lecture du journal de #126 par MONARK** (run `37212468472`) : test 42 **151 s** ; ensuite `ukemi_conc_n8…` 14 s, `u4_oracle_path_exclude…` 11 s, `risk_control_rank_beta…` 10 s. Le test 42 pèse donc environ **dix fois** le suivant.

### En local (Linux, 4 coeurs comme le runner public, Node 24.21.0, sans proxy, drapeaux de `npm test`)

Durées par fichier : un rapporteur `node:test` qui écrit, pour chaque test de niveau 0, son fichier et sa `duration_ms`. Dans un fichier, les tests s exécutent l un après l autre : leur somme est la durée du fichier, chargement exclu.

| Passage | Mur | Test 42 | Fichier suivant | Échecs |
|---|---|---|---|---|
| suite complète, rapporteur par fichier (1) | 237 s | 84 s (rouge, voir plus bas) | `ukemi-conc` 72 s | 1 (test 42) |
| suite complète, rapporteur par fichier (2) | 391 s | **274 s** (27 % de la somme) | `mutants-run` 86 s | 1 (test 42) |
| suite complète, TAP | 415 s | 221 s | (le TAP ne donne pas le fichier) | 1 (test 42) |
| `npm test` tel quel | 347 s | (non instrumenté) | | 0 |
| test 42 seul | **233 s** | 233 s | | 0 |
| suite sans le test 42 (`--test-skip-pattern`), 1 | 342 s | sauté | `ukemi-conc` 112 s | 0 |
| suite sans le test 42, 2 | 314 s | sauté | `ukemi-conc` 78 s | 0 |

- **Le test 42 domine** : il est le plus long test partout (221 à 274 s quand il va au bout, contre 47 s au plus pour le suivant), et le plus long fichier dans chaque passage où il va au bout.
- **Le gain sur le mur de g3 est modéré** : en local, environ 50 à 60 s sur 350 à 400 s, soit 15 %. Le test 42 tient un des trois créneaux de `node --test` pendant 150 à 270 s, et sa CI imbriquée charge les trois autres coeurs pendant ce temps. Le hors-g3 part en parallèle sur un autre runner.
- **Un rouge du test 42 sous charge, 3 passages sur 4 de la suite complète ici.** Les trois ont la même forme : `npm run ci` imbriqué sort à 0, mais sa sortie n a pas de résumé (`exported CI ran an implausibly small suite`, l assertion de la ligne 383). Seul, le test 42 est vert. Cause probable : la classe de RED-PROOF-TAP-TRUNCATION-1. `--test-force-exit` appelle `process.exit()` alors que stdout, un tube non bloquant sous POSIX, garde des écritures en file ; la fin de la sortie est perdue (le préchargement de `red-proof.mjs` règle ce cas pour ses propres enfants). Hors de ce lot ; voir la question 2. Sortir le test 42 de la suite chargée réduit l exposition.

## Construction

1. **`package.json`**, en plus de `test` qui ne change pas :
   - `test:main` = `test` exactement, plus `--test-skip-pattern="\(test 42\)"` juste après `--test-force-exit`. Mêmes globs, mêmes gardes (`--test-timeout=300000`, `--test-force-exit`). Le motif est celui que `red-proof.mjs` saute déjà (`--test-skip-pattern=\\(test 42\\)`) ;
   - `test:export` = mêmes gardes, `--test-name-pattern="\(test 42\)"`, sur `test/export-public.test.ts` seul.
   - Les drapeaux doivent précéder les globs : placés après, `node --test` les ignore (mesuré : `npm test -- --test-skip-pattern=…` lance tous les tests). D où deux scripts plutôt que `npm test -- <drapeau>`.
2. **`ci.yml`** :
   - g3 lance `npm run gate:vocab && npm run typecheck && npm run test:main` ;
   - `g3-export` : checkout, setup-node 24 avec cache npm, `npm ci`, puis `npm run test:export`. Pas de `if:`, pas de `continue-on-error` ;
   - **borne : `timeout-minutes: 10`**. La règle du fichier : temps mesuré × 3, plafonné à 20. (npm ci environ 15 s + 151 s) × 3 = 8,3 min, arrondi à 10. 10 min dépassent aussi les 5 min de `--test-timeout` : un test 42 trop lent rougit par son nom avant que le job soit coupé ;
   - la borne de g3 reste à 20. Le même calcul sans le test 42 donnerait moins, mais une seule observation ne suffit pas pour la baisser ; voir la question 3.
3. **`derivePublicWorkflow`** : une liste fermée `INTERNAL_JOBS = ["r25-taille-de-lot", "g3-export"]` remplace le seul nom de r25 ; chaque job de la liste doit être présent (fail-closed, comme avant pour r25). Les corps des jobs gardés restent identiques à l octet près (42(f')).

## Tests (d abord)

- **`ci_jobs_have_timeout_and_test_flags_locked`** (test verrou, étendu) : en plus des bornes ≤ 20 par job et des gardes de `scripts.test`, chaque lancement de tests du workflow passe par un script de `package.json` qui porte les deux gardes. L ensemble des scripts lancés vaut exactement `{test:export, test:main}`. Aucun `node --test` nu n apparaît dans le workflow.
- **`ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it`** (neuf) :
  - (a) `test:main` = `test` plus le seul drapeau de saut ;
  - (b) `test:export` porte les mêmes gardes, avec le même motif en filtre de nom, sur `test/export-public.test.ts` ;
  - (c) dans les globs de `npm test`, le motif ne nomme qu une déclaration de test, le test 42 lui-même. Ensemble, (a), (b) et (c) donnent : main + export = la suite entière ;
  - (d) g3 lance `test:main`, et `g3-export` lance `npm ci` puis `test:export`, dans cet ordre, sans `if:` ;
  - (e) la borne de `g3-export` dépasse `--test-timeout` ;
  - (f) le workflow dérivé n a ni `g3-export` ni `test:export`.
- **42(f')** (`export_public_derived_jobs_are_byte_identical`) : les jobs retirés sont la liste fermée `{r25-taille-de-lot, g3-export}`. Chacun doit être présent dans le workflow source (non-vacuité) et absent du dérivé.

Tueurs déclarés (lignes `killer:` au-dessus des déclarations ; numéros de ligne au gel) :

- verrou : `package.json` (ligne de `test:export`) `CONST "--test-force-exit --test-name-pattern" -> "--test-name-pattern"` ;
- neuf : `.github/workflows/ci.yml` (ligne `run: npm run test:export`) `CONST "npm run test:export" -> "npm run test:main"` ;
- 42(f') : `scripts/export-public.mjs` (ligne de `INTERNAL_JOBS`) `CONST ", \"g3-export\"]" -> "]"`.

## Preuve

- `node scripts/red-proof.mjs --base 04c97744 --gel <arbre> --repo <arbre> --draw 3 --seed 37`, en mode F2P et non `--test-only`, puisque le lot change `ci.yml`, `package.json` et `export-public.mjs`. Les trois tests jugés doivent être rouges à la base par assertion et verts au gel, et leurs tueurs tués. Le test 42 lui-même est sauté par l outil (verrou hôte) ; son corps ne change pas.
- `test:main` puis `test:export`, en local : à eux deux, autant de tests que `npm test`. Suite complète à 0 échec ; `tsc`, `lint`, `lint:ratchet`, `gate:vocab` et `lang:gate` verts.

## Taille

Environ 150 lignes de code et de tests. Borne R-25 : 547.
