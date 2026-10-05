# G7 du lot CI-G3-DURATION-1 : le test 42 dans son propre job, `g3-export` ; g3 lance `test:main`

- **Plan** : `docs/G0-lot-ci-g3-duration-1.md` (commit `f5c1a0d6`).
- **Base** : `04c97744` (`origin/lot/etude-suite`). **Gel** : branche `recherches/ci-g3-duration-1` ; tests `6b5b811c`, changement `6776f1fb`.
- **Zone ouverte** : `.github/workflows/ci.yml`, zone de MONARK, pour ce lot seulement, sur son assignation (`…-L2-fusionnee-ci-20.md` §2). J y ai changé une ligne `run:` de g3 et ajouté le job `g3-export`. Aucun autre job n est touché.
- **Node** : 24.21.0, installé hors dépôt ; Linux, 4 coeurs ; suites lancées sans proxy.

## Ce qui a changé

1. `package.json` :
   - `test:main` = `test` exactement, plus `--test-skip-pattern="\(test 42\)"` ;
   - `test:export` = mêmes gardes, `--test-name-pattern="\(test 42\)"`, sur `test/export-public.test.ts` ;
   - `test` ne change pas : `npm test` lance toujours tout.
2. `ci.yml` :
   - g3 lance `npm run gate:vocab && npm run typecheck && npm run test:main` ; sa borne reste à 20 ;
   - le job `g3-export` fait checkout, setup-node 24 avec cache npm, `npm ci`, puis `npm run test:export`. `timeout-minutes: 10`, soit (15 s + 151 s) × 3 arrondi, au-dessus des 5 min de `--test-timeout`.
3. `derivePublicWorkflow` retire une liste fermée de jobs internes, `["r25-taille-de-lot", "g3-export"]`, fail-closed sur chacun. L en-tête dérivé le dit. Le workflow public garde g3 avec `test:main`, ce qui est sans effet dans le miroir : le test 42 n y est pas.
4. Une adresse de tueur déplacée par les lignes insérées : `test/dojo-render.test.ts:326`, `ci.yml:204` devient `ci.yml:226`. Elle était déjà fausse à la base, où la ligne visée était la 206 depuis `04c97744`.

## Tests

- `ci_jobs_have_timeout_and_test_flags_locked` (étendu) : chaque lancement de tests du workflow passe par un script de `package.json` ; l ensemble lancé vaut `{test:export, test:main}` ; chacun porte `--test-timeout` et `--test-force-exit` ; aucun `node --test` nu n apparaît dans le workflow. Les bornes ≤ 20 de chaque job sont inchangées et couvrent `g3-export`.
- `ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it` (neuf) vérifie six points :
  - (a) `test:main` = `test` plus le seul drapeau de saut ;
  - (b) `test:export` exact ;
  - (c) le motif ne nomme qu une déclaration de test dans les globs, le test 42. Les déclarations sont lues en début de ligne : `test/red-proof.test.ts:41` porte un `test("slow (test 42)"` dans une chaîne de fixture, qui n est pas un test de la suite ;
  - (d) l ordre `npm ci` puis `test:export`, et aucun `if:` ni `continue-on-error` ;
  - (e) la borne du job dépasse `--test-timeout` ;
  - (f) le workflow dérivé n a ni `g3-export` ni `test:export`.
- 42(f') : les jobs retirés forment la liste fermée `{r25-taille-de-lot, g3-export}`. Chacun est présent à la source et absent du dérivé, et l identité octet par octet des jobs gardés tient.

## Red-proof

`node scripts/red-proof.mjs --base 04c97744 --gel <arbre> --repo <arbre> --draw 3 --seed 37` : **OK**, exit 0. 3 tests jugés, 45 inchangés, 3 F2P, et 3 tueurs tirés, tous **tués** :

- `ci.yml:164` (`npm run test:export` devient `npm run test:main`) ;
- `scripts/export-public.mjs:427` (`, "g3-export"]` devient `]`) ;
- `package.json:18` (`--test-force-exit` retiré de `test:export`).

Mode F2P et non `--test-only` : le lot change du code hors des tests. `RED-PROOF.json` sha256 `736c86e5f766954f…` (horodaté).

## Mesures au gel (même hôte)

| Lancement | Mur | Tests / verts / échecs / sautés |
|---|---|---|
| `npm run test:main` | 325 s | 2 192 / 2 170 / 0 / 22 |
| `npm run test:export` (test 42 seul) | 71 s (hôte calme ; 233 s plus tôt, sous charge) | 1 / 1 / 0 / 0 |
| `npm test`, passage 1 (charge 8 à 11) | 383 s | 2 207 / 2 184 / **1** / 22 : le test 42, sortie imbriquée tronquée (voir plus bas) |
| `npm test`, passage 2 | 200 s | 2 218 / 2 196 / **0** / 22 |

Les totaux de la suite varient d un passage à l autre (2 137 à 2 218 sur ce lot, base comprise) : c est le point ouvert 3 du G7 de MUTANTS-RUN-TEST-DURATION-1, sans lien avec ce lot. L égalité « main + export = suite » ne se lit donc pas sur ces totaux. Le test (c) la porte au niveau des déclarations.

Sur le runner, attendu d après les mesures du G0 :

- g3 perd les 151 s du test 42, et la charge de sa CI imbriquée ;
- `g3-export` devrait prendre environ 3 min, sous sa borne de 10 ;
- la première exécution sur une PR est la vraie mesure (question 3).

## Portes

`tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` 0 ; `export:check` 0. `npm test` complet : 0 échec au passage 2 (voir le tableau).

## R-25

`git diff --shortstat 04c97744...HEAD` avec les exclusions de la CI (`docs/**/*.md` hors du compte) : 137 insertions, 22 suppressions, **159** (borne : 547).

## Questions ouvertes

1. **`g3-export` n est pas un statut requis.** Sur `main`, la protection exige `g1-controle-generation`, `r25-taille-de-lot`, `g3-verification`, `g4-architecture`, `g6-compliance` et `CodeQL` (lu par `gh api …/branches/main`). Sans ajout de `g3-export` à cette liste, un test 42 rouge ne bloquerait plus une fusion vers `main` : c est ton geste, comme pour g3-site. Le tronc `lot/etude-suite` n est pas protégé. Autre choix possible, si tu préfères ne pas toucher à la protection : mettre l étape dans `r25-taille-de-lot`, déjà requis et déjà retiré du miroir. Ce job devrait alors faire `npm ci`, et sa borne passerait de 5 à 10.
2. **Test 42 rouge sous charge sous Linux, à former en item (proposé : EXPORT-TEST42-TRUNCATION-1).** J ai vu 4 rouges sur 6 passages de la suite complète ici, base et gel confondus, et aucun sur 2 passages du test seul. La forme est toujours la même : `npm run ci` imbriqué sort à 0, mais sans résumé (ligne 383, « implausibly small suite »). Cause probable : `--test-force-exit` appelle `process.exit()` avant que stdout, un tube non bloquant sous POSIX, soit vidé. C est la classe que règle le préchargement de `red-proof.mjs` (`setBlocking(true)`). Plusieurs rouges de g3 sur le runner (32 entre le 03/10 et le 04/10, autour de 150 à 260 s) pourraient en venir ; je ne peux pas lire les journaux pour le confirmer. Le job séparé réduit la charge autour du test, mais il ne règle pas la cause.
3. **Borne de g3.** Je la laisse à 20. Après une première série de runs avec `test:main`, la règle × 3 pourrait la ramener vers 15. C est à toi, sur mesure.
4. **Mesure sur ta CI et sous Windows.** `test:main` et `test:export` sous Windows (cmd) : les guillemets et `\(` passent tels quels à Node (règles CRT), mais ce n est pas vérifié ici.

## Écarts

- Node 24 installé hors dépôt.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` est présent dans l arbre de travail, mais il n est pas commité.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
