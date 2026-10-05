# G0 du lot CI-WORKFLOWS-SET-1 : l ensemble des workflows suivis par git est `{ci.yml}`, épinglé par une égalité d ensemble

- **Demande** : item de `docs/ETAT.md` (restes formés de R25-INTEGRATION-RULE-1) : « CI-WORKFLOWS-SET-1 (m-1 de la même G2) : aucun test ne lit un second fichier sous `.github/workflows/` ; l ensemble des workflows est `{ci.yml}`, à épingler par une égalité d ensemble. » Origine : m-1 de la G2 du pli Q-2 de R25-INTEGRATION-RULE-1b.
- **Base** : `e4aac057` (`origin/lot/etude-suite`, fusion de #173), branche `recherches/ci-workflows-set-1`. Auteur : RECHERCHES.
- **Zone** : `test/ci-gates.test.ts` (un test ajouté en fin de fichier, deux imports ; trois tests de plus au pli G2) ; `test/helpers/git-tracked.ts` (ajouté au pli G2, lu par le seul `ci-gates.test.ts`) ; ce G0 et le G7. Aucun code de production, aucun fichier sous `.github/` touché.

red-proof: test-only

## Constat

Tous les tests de la porte CI lisent un seul fichier, `.github/workflows/ci.yml` (`test/ci-gates.test.ts`, constante `WF` : ligne 51 à la base, 54 au gel du pli G2, après les imports ajoutés). Le juge des permissions `problems()` (`ci_workflow_declares_least_privilege_permissions`), les tests `if:` / `continue-on-error`, l épinglage des actions par SHA, les bornes `timeout-minutes` et le job r25 ne jugent que ce texte. L export public ne transforme que `CI_WORKFLOW_PATH` (`scripts/export-public.mjs:425`). Un second fichier sous `.github/workflows/` (par exemple un `release.yml` avec `permissions: write-all` ou une action non épinglée) serait exécuté par GitHub et échapperait à tous ces juges : la CI resterait verte.

Mesure à la base : `git ls-files -- .github/workflows` et `git ls-tree -r --name-only HEAD -- .github/workflows` rendent tous deux la seule ligne `.github/workflows/ci.yml`. `.github/` ne suit par ailleurs que `PULL_REQUEST_TEMPLATE.md`.

## CodeQL : configuration par défaut, sans fichier

CodeQL tourne en « default setup » de GitHub, sans fichier dans le dépôt. Lu par `gh api repos/KraidleAI/monark-governance/actions/workflows` : deux workflows, `gates` (`.github/workflows/ci.yml`) et `CodeQL` (`dynamic/github-code-scanning/codeql`, actif depuis le 2026-09-09). Le chemin `dynamic/…` est celui des workflows gérés par GitHub, sans fichier. Les check-runs du tronc `e4aac057` portent `Analyze (javascript-typescript)` et `Analyze (actions)`. L API `code-scanning/default-setup` répond 403 à cette session ; la liste des workflows suffit à le confirmer. L égalité d ensemble ne gêne donc pas CodeQL, et ce lot n ajoute aucun fichier de workflow. Le passage de CodeQL en « advanced setup » (un `codeql.yml` commité) rougirait ce test : c est voulu, ce fichier devrait alors entrer dans les juges (question ouverte 2 du G7).

## Choix : l index et l arbre de HEAD de git, pas le système de fichiers

Le test lit les chemins suivis par git, par deux lectures, et exige que chacune vaille exactement `[".github/workflows/ci.yml"]` :

1. `git ls-files -z -- .github/workflows` : l index. C est ce qui sera commité. Un workflow ajouté par `git add` rougit le test avant même le commit.
2. `git ls-tree -r -z --name-only HEAD -- .github/workflows` : l arbre du commit testé. Sur le runner, `actions/checkout` extrait le commit de fusion de la PR, l index égale cet arbre, et c est exactement l ensemble que GitHub exécute. Localement, l arbre couvre le cas où l index diverge (`git rm --cached` d un workflow commité).

Pourquoi pas `readdirSync` :

- un fichier non suivi (brouillon local, sortie d outil) rougirait le test chez un développeur sans jamais atteindre GitHub ;
- un fichier ignoré par `.gitignore` mais forcé dans l index (`git add -f`) serait, lui, poussé.

C est l index et l arbre qui décident de ce que GitHub lit, pas le disque. Les lectures sont récursives : GitHub n exécute que les fichiers du premier niveau, mais un sous-dossier n a aucune raison d exister, et l égalité stricte le refuse aussi.

Garde-fous du test :

- `-z` : aucun chemin cité ni échappé, quel que soit `core.quotepath` ;
- `git rev-parse --show-prefix` doit rendre une ligne vide : la racine du test est la racine du dépôt, et non un sous-dossier d un dépôt parent, ce qui fausserait les chemins ;
- un échec de git (pas de dépôt, git absent) rougit le test : fail-closed.

Sous Windows, git rend des chemins avec `/` ; la comparaison porte sur ces chaînes, sans `join`. Aucun saut win32.

## Construction

Un test ajouté en fin de `test/ci-gates.test.ts`, au style du fichier :

- `ci_workflows_set_is_exactly_ci_yml - the git index and the HEAD tree track one workflow, .github/workflows/ci.yml, the one file every gate test and the export read (CI-WORKFLOWS-SET-1)`.
- Assertions :
  - (a) la racine est celle du dépôt ;
  - (b) l index vaut `[".github/workflows/ci.yml"]` ;
  - (c) l arbre de HEAD vaut la même liste ;
  - (d) cette liste est aussi `[CI_WORKFLOW_PATH]`, le chemin que l export dérive (couplage : le seul workflow suivi est celui que l export transforme) ;
  - (e) les noms de base valent `["ci.yml"]`, en littéral, comme le demande l item.
- Imports : `spawnSync` de `node:child_process` ; `CI_WORKFLOW_PATH` ajouté à l import existant de `../scripts/export-public.mjs`.

## Tueurs (listés pour `--test-only`)

Un tueur, au-dessus de la déclaration du test :

- `scripts/export-public.mjs:425 CONST "ci.yml" -> "gates.yml"` : l export dériverait un autre chemin que le seul workflow suivi ; l assertion (d) rougit.

Pli de la G2 (N-2, N-3, N-5), un tueur par test ajouté :

- `test/helpers/git-tracked.ts:11 CONST "env: bare(), " -> ""` : git hériterait des `GIT_*` de l appelant ; le test au leurre `GIT_DIR` / `GIT_INDEX_FILE` rougit. Le module est un support importé statiquement par le fichier de test (MUTANTS-TEST-SUPPORT-1).
- `test/helpers/git-tracked.ts:16 CONST "[...new Set(xs)]" -> "xs"` : un index non fusionné listerait `ci.yml` trois fois ; le test de l index non fusionné rougit.
- `.github/workflows/ci.yml:37 CONST "actions/checkout@" -> "KraidleAI/monark-governance/.github/actions/checkout@"` : une étape appellerait une action de ce dépôt ; le juge `uses:` rougit.

Un tueur sur une seule ligne de production ne peut pas ajouter de fichier à l index : la preuve rouge de l égalité d ensemble est mesurée à part (ci-dessous).

## Preuve rouge (mesurée, non commitée)

Dans un clone jetable du gel, sous le dossier de travail de la session :

1. un commit de brouillon qui ajoute `.github/workflows/release.yml` : rouge attendu, par (b) puis (c) ;
2. le même fichier, ajouté à l index seulement (`git add`, sans commit) : rouge attendu, par (b) ;
3. le même fichier, non suivi : vert attendu (le disque ne compte pas) ;
4. le fichier renommé dans un sous-dossier (`.github/workflows/sub/x.yml`, commité) : rouge attendu.

Aucun de ces commits n entre dans la branche.

## Vérification du lot

- `node scripts/red-proof.mjs --test-only --base e4aac057 --gel <gel> --repo . --seed 37` : test-only, sans `--draw` (l outil refuse `--draw` en mode test-only et tire chaque tueur listé). Le test doit être épinglé.
- Tueur tiré à la main, avec contrôle sha256 avant et après restauration.
- `verifie-ancres.mjs . --touched e4aac057 HEAD` : 0 DERIVE, 0 PERDU.
- R-25 par l oracle `scripts/oracle/r25.mjs` : au plus 547.
- `npm run test:main` à 0 échec ; `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.
- Export public : `test/ci-gates.test.ts` n est pas dans la liste blanche (la racine `test/` n est pas exportée) ; `npm run export:check` doit rester vert.

## Taille

Environ 40 lignes de test. Borne R-25 : 547.
