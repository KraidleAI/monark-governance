# G0 du lot R25-REGISTRY-ROOT-1 (PR 1 de 2) : D9 septdecies, les registres de vague du harnais hors du compte R-25

- **Demande** : décision du fondateur, 2026-10-06 vers 18:07 UTC, dans le fil de MONARK, choix verbatim « Règle générale (Recommandé) », à la
  question de l'addendum R-25 des registres (options du §8 du brouillon de RECHERCHES). Brouillon : `recherches:coordination/pieces/
  2026-10-06-brouillons-D9-live-k/ADDENDUM-D9-registres.md` (RECHERCHES, 2026-10-06). Le lot est construit par MONARK (relève) ; la G2 est
  faite par RECHERCHES.
- **Base** : `lot/etude-suite` = `a43b0126` (après #182, #186 et #187). **Branche** : `monark/r25-registry-root-1`. Runtime : Node 24.21.0.
- **Zone** :
  - `.github/workflows/ci.yml` : la ligne `STAT=` du job `r25-taille-de-lot`, et son commentaire ;
  - `scripts/registry-root.mjs` et ses types `scripts/registry-root.d.mts` : la racine, la déclaration et les refus (a) à (f), entrées lues
    par `lstat`, jamais à travers un lien ;
  - `test/ci-gates.test.ts` : le pathspec dérivé de la racine, le test racine et le test des refus ;
  - `docs/adr/ADR-M003-phase2-integration.md` : l'addendum D9 septdecies, après D9 sexdecies ;
  - `docs/ETAT.md` : l'item de la PR 2.

  Le service n'est pas touché. `scripts/oracle/r25.mjs` et `scripts/lot-size-integration.mjs` lisent les pathspecs dans `ci.yml` et ne
  changent pas (brouillon, §4). Les refus vivent dans un script, et non dans le fichier de test, pour que `scripts/red-proof.mjs` puisse
  juger les tests (module neuf à la base) et tirer leurs tueurs.

## Nom

`septdecies`. `quindecies` (l.203, R25-ASSET-STRUCTURE-1) et `sexdecies` (l.207 : l'exception de #198, renommée par `82cf6980`) sont pris ;
l'addendum entre à la l.209. Le doublon ancien `octies` (l.116 et l.189) reste porté par ADR-M003-SUFFIX-DUP-1.

## Construction (brouillon de RECHERCHES, §2 à §5, avec les choix de MONARK)

- **Racine fermée** `apps/harness/data/kata/registry`, sans sous-dossier ; seuls des fichiers `wave<k>.json` (k ≥ 1, sans zéro de tête) et
  une déclaration `PROVENANCE-kata-registry.md`, comptée.
- **Un seul pathspec** ajouté à la ligne `STAT=` : `':(exclude,glob)apps/harness/data/kata/registry/**/*.json'`, dérivé de la source de vérité
  du test.
- **Extensions par racine** dans `test/ci-gates.test.ts` : `SERIES_EXCLUDED_ROOTS` garde ses trois racines × trois extensions ; la racine des
  registres n'a que `.json`. L'égalité d'ensembles avec `ci.yml` et la liste exacte du test 38 (4quater) suivent.
- **Test racine** `kata_registry_root_is_wave_registries_only` : le job porte le pathspec dérivé de la racine ; si la racine existe, elle passe
  les refus (a) à (f) et contient `wave1.json` (g). **Test des refus** `kata_registry_root_problems_name_each_refusal` : chaque refus sur une
  racine construite dans un dossier temporaire, dont des octets qui ne sont pas de l'UTF-8 (G2 B-2 de #206).
- **Liens symboliques** (G2 B-1 de #206) : git compte le lien, pas sa cible ; un registre lié échapperait à la racine fermée et au compte.
  Refus (a) d'une racine atteinte par un lien et de toute entrée qui est un lien, fichier ou dossier. Tests
  `kata_registry_root_refuses_a_linked_root_or_directory` (jonctions, sans droit sous win32) et `kata_registry_root_refuses_a_linked_registry`
  (lien de fichier ; sauté seulement si l'hôte refuse le droit, mesuré présent sur l'hôte de travail).
  - **Choix de MONARK** : (c) refuse le CR, et aussi U+2028 et U+2029.
  - **Choix de MONARK, voie (A)** : deux PR. Cette PR 1 porte la porte, le test et l'addendum. L'ancre (g) se lit « si la racine existe,
    `wave1.json` est atteint ».
  - La PR 2 copie `wave1.json` (26 202 lignes, sha256 `811fcd57…`, `recherches` `a43ad70`) et sa déclaration, sous la nouvelle porte.
    L'ancre y devient inconditionnelle. (f) lit `wave1.json` par `readRegistry` (`apps/harness/src/policy-projection.ts:67`) et refuse
    `wave2.json` tant que le lecteur de FORMAT-W2 n'existe pas.
- **Export public** : `apps/harness/data/` n'est pas exporté. `PACKAGE_SUBPATHS` (`scripts/export-public.mjs:38`) ne prend du harnais que
  `src`, `test`, `package.json` et `README.md` ; l'export de `db778e2e` ne porte aucun fichier sous `apps/harness/data`. Le risque 4 du
  brouillon est levé.

## Preuve rouge

- **`scripts/red-proof.mjs --base a43b0126 --draw 4 --seed 7`** : sortie 0, « 4 judged, 40 unchanged ». Les quatre tests neufs sont
  « new-module » à la base (le script n'y existe pas) ; les quatre tueurs déclarés sont tués.
- **Avec le `ci.yml` de la base**, le script et les tests du lot : 3 tests rouges par assertion, 39 verts :
  - `series_pinned_are_declared_and_hashed` (« r25 job is missing exclusion pathspec(s) ») ;
  - le test 38 (4quater) ;
  - le test racine.
- **Après le lot** : `test/ci-gates.test.ts` 44 tests, 44 verts ; typecheck et lint à 0.

## Tueurs

Tueurs déclarés (un par test, tirés et tués par `red-proof`) : `scripts/registry-root.mjs:16` (racine élargie), `:30` (racine liée admise),
`:35` (entrée liée lue à travers) et `:45` (sha256 accepté n'importe où sur une ligne). Mutants à la main, chacun appliqué seul à une copie, mesurés (script hors dépôt
`F:/tmp/dojo/mutants-registry.cjs`) :

| Mutant | Rouge |
|---|---|
| M-a : sous-dossier admis (K-7) | `kata_registry_root_problems_name_each_refusal` |
| M-a2 : entrée liée lue à travers (B-1) | les deux tests des liens |
| M-a3 : racine liée admise (B-1) | `kata_registry_root_refuses_a_linked_root_or_directory` |
| M-b : autre fichier admis (K-1, K-2, K-10) | idem |
| M-c : CR, U+2028 et U+2029 admis (K-5) | `kata_registry_root_problems_name_each_refusal` |
| M-c2 : refus « not UTF-8 » retiré (B-2) | idem |
| M-c3 : décodeur non strict (B-2) | idem |
| M-d : sha256 accepté n'importe où sur une ligne (K-4, K-6) | idem |
| M-e : déclaration orpheline admise (K-11) | idem |
| M-f : `wave2.json` admis sans lecteur | idem |
| K-8 : pathspec retiré de `ci.yml` (la base) | `series_pinned_are_declared_and_hashed`, test 38 (4quater) |
| K-9 : racine élargie à `apps/harness/data/kata/**/*.json` | idem, et le test racine |

K-3 (un registre que `readRegistry` refuse) est un cas du test des refus. Les mêmes refus rejouent sur le vrai `wave1.json` à la PR 2.

## Questions

- Aucune : nom, voie (A) et refus de U+2028 et U+2029 tranchés par MONARK, le 2026-10-06 (message `20592c3`).
