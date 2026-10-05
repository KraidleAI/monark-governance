# G7 du lot CI-WORKFLOWS-SET-1 : l ensemble des workflows suivis par git est `{ci.yml}`

- **Plan** : `docs/G0-lot-ci-workflows-set-1.md` (commit `242f428e`).
- **Base** : `e4aac057` (`origin/lot/etude-suite`, fusion de #173 ; #177 non fusionnée au moment du lot). **Gel** : branche `recherches/ci-workflows-set-1`, test `d5e3f055`.
- **Mode** : `red-proof: test-only`. Aucun code de production, aucun fichier sous `.github/` touché.
- **Node** : 24.21.0, installé hors dépôt ; Linux ; suites lancées sans proxy, `TMPDIR` privé.

## Ce qui a changé

`test/ci-gates.test.ts` :

- un test ajouté en fin de fichier, `ci_workflows_set_is_exactly_ci_yml` ;
- `spawnSync` importé de `node:child_process` ;
- `CI_WORKFLOW_PATH` ajouté à l import existant de `../scripts/export-public.mjs`.

Le test lit git (`git -C <racine>`), jamais le disque :

- (a) `git rev-parse --show-prefix` rend une ligne vide : la racine du test est celle du dépôt ;
- (b) `git ls-files -z -- .github/workflows` (l index) vaut `[".github/workflows/ci.yml"]` ;
- (c) `git ls-tree -r -z --name-only HEAD -- .github/workflows` (l arbre de HEAD) vaut la même liste ;
- (d) cette liste vaut `[CI_WORKFLOW_PATH]`, le chemin que l export dérive ;
- (e) l ensemble des noms de base vaut `{ci.yml}`, en littéral.

Un échec de git rougit le test (fail-closed). Les chemins viennent avec `-z` et ne sont jamais cités. Aucun `join` : git rend des `/` sous Windows aussi. Aucun saut win32.

## CodeQL

Configuration par défaut de GitHub, sans fichier : `gh api …/actions/workflows` liste `gates` (`.github/workflows/ci.yml`) et `CodeQL` (`dynamic/github-code-scanning/codeql`). Les check-runs du tronc `e4aac057` portent `Analyze (javascript-typescript)` et `Analyze (actions)`. L API `code-scanning/default-setup` répond 403 à cette session. Aucun fichier de workflow ajouté.

## Preuve rouge (mesurée, non commitée)

Clone jetable du gel `d5e3f055`, sous le dossier de travail de la session ; `node --test --test-name-pattern=ci_workflows_set test/ci-gates.test.ts`.

| Cas | Résultat | Assertion qui rougit |
|---|---|---|
| gel tel quel | vert | |
| `.github/workflows/release.yml` non suivi | **vert** (le disque ne compte pas) | |
| le même, `git add` sans commit | rouge | (b) index : `+ '.github/workflows/release.yml'` |
| le même, commité (commit de brouillon) | rouge | (b) |
| `.github/workflows/sub/x.yml` commité | rouge | (b) : `+ '.github/workflows/sub/x.yml'` |
| `release.yml` commité puis `git rm --cached` (index propre, arbre non) | rouge | (c) arbre de HEAD |
| `git rm --cached .github/workflows/ci.yml` | rouge | (b) : `[]` |

Le clone a été remis à `d5e3f055` après chaque cas ; aucun de ces commits n est dans la branche.

## Tueur, tiré à la main

`scripts/export-public.mjs:425 CONST "ci.yml" -> "gates.yml"` : **tué**. L assertion (d) rougit : `+ '.github/workflows/ci.yml'` contre `- '.github/workflows/gates.yml'`. Le chargement du module passe ; le rouge vient d une assertion.

- sha256 avant : `7c37516ba3b14fbebfe091485b3e674895d184fc25ce836d95d386f955d26b74` ;
- muté : `d103a43fac0ad080f1b6271d8ae9b69ad23ffd1e098c5a70d8441f39ba002da8` ;
- après restauration : `7c37516b…26b74`, égal à l avant.

## Red-proof

`node scripts/red-proof.mjs --test-only --base e4aac057 --gel . --repo . --seed 37` : **OK**, exit 0.

- 1 test jugé, 36 inchangés ;
- `pinned` : `ci_workflows_set_is_exactly_ci_yml` ;
- `killer killed` : `scripts/export-public.mjs:425 CONST`.

`RED-PROOF.json` sha256 `70b0e638ddb6b059…` (horodaté). `--draw` n est pas passé : l outil le refuse en mode test-only, où il tire chaque tueur listé.

## Portes

- `verifie-ancres.mjs . --touched e4aac057 HEAD` : tueurs 9, ANCRE 9, **DERIVE 0, PERDU 0**.
- R-25, par `scripts/oracle/r25.mjs` sur `e4aac057` : CODE 26 insertions, 1 suppression, **27** (borne du lot : 547) ; CONTENT 0 ; GREEN.
- `npm run test:main` : 2 486 tests, 2 464 verts, **0 échec**, 22 sautés (804 s).
- `tsc --noEmit` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` 0.
- Export public : `test/ci-gates.test.ts` n est pas exporté (la racine `test/` hors de la liste blanche, sauf `test/helpers/blocking-stdout.cjs`). Le miroir ne reçoit donc pas ce test. `npm run export:check` : OK. `CI_WORKFLOW_PATH` était déjà exporté, et déjà déclaré dans `scripts/export-public.d.mts`.

## Questions ouvertes (restes, avec options et prix)

1. **Le miroir public n a pas ce verrou.** Le test vit dans la racine `test/`, non exportée. Le miroir reçoit un seul workflow, le dérivé, par la liste blanche (`.github/workflows/ci.yml` seul). Un second workflow ne peut donc pas y arriver par l export. Il peut seulement y arriver par un push direct sur le miroir, que la protection de `main` encadre.
   - **Défaut : rien à faire.**
   - Option : un test exporté de même forme. Prix : environ 20 lignes et un lot F2P sur la liste blanche. Gain faible.
2. **CodeQL en configuration avancée.** Si MONARK passe CodeQL à un `codeql.yml` commité, ce test rougit, par construction. Le fichier devra alors entrer dans les juges de `ci-gates.test.ts` (permissions, épinglage SHA, `if:` / `continue-on-error`), et l égalité passera à `{ci.yml, codeql.yml}`.
   - **Défaut : rester en configuration par défaut.**
   - Prix du passage : un lot, environ 150 lignes. Il faut généraliser les juges à une liste de fichiers.
3. **Workflows sans fichier.** Ni les workflows dynamiques de GitHub (CodeQL par défaut, Dependabot) ni les règles d organisation (« required workflows » des rulesets) ne laissent de fichier dans le dépôt. Ce test ne peut pas les voir.
   - **Défaut : contrôle par MONARK**, par `gh api repos/KraidleAI/monark-governance/actions/workflows` (aujourd hui : `gates` et `CodeQL`).
   - Option : un test en ligne qui lit cette liste. Prix : un jeton `actions: read` et un appel réseau dans la CI. Rejeté par défaut : la CI resterait dépendante du réseau.
4. **Sensibilité à la casse.** Sur un système de fichiers insensible à la casse, `.github/Workflows/x.yml` serait un chemin distinct pour git. GitHub, lui, ne lit que `.github/workflows`. Un tel fichier n est donc pas exécuté, et le test ne le voit pas, ce qui est cohérent. Défaut : rien.

## Écarts

- Node 24 installé hors dépôt.
- La commande de red-proof de la mission (`--draw n --seed 37`) est incompatible avec `--test-only`. J ai lancé `--test-only --seed 37`, qui tire le tueur unique listé.
