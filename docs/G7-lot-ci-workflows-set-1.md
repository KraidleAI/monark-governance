# G7 du lot CI-WORKFLOWS-SET-1 : l ensemble des workflows suivis par git est `{ci.yml}`

- **Plan** : `docs/G0-lot-ci-workflows-set-1.md` (commit `242f428e`).
- **Base** : `e4aac057` (`origin/lot/etude-suite`, fusion de #173 ; #177 non fusionnée au moment du lot). **Gel** : branche `recherches/ci-workflows-set-1`, test `d5e3f055` ; pli de la G2 : tests rouges `854ad1ff`, gel `48c89747`. Tronc à la date du pli : `74120213` (#177) ; la branche n est pas rebasée, `git merge-tree` avec `74120213` et avec `7a0d8ef4` est propre.
- **Mode** : `red-proof: test-only`. Aucun code de production, aucun fichier sous `.github/` touché. Le pli de la G2 ajoute un module de support de test, `test/helpers/git-tracked.ts`, qu aucun fichier de production ne nomme.
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
4. **Casse.** Pour git, `.github/Workflows/x.yml` est un chemin distinct de `.github/workflows/`, sur tout système de fichiers. Sous Windows, le fichier atterrit pourtant dans le même dossier disque que `ci.yml`. GitHub ne lit que `.github/workflows`, au sens de git : ce fichier n est pas exécuté, et le test ne le voit pas, ce qui est cohérent (mesuré vert par la G2). Défaut : rien.
5. **Le verrou porte sur ce qui entre au tronc, pas sur l exécution (G2, N-4).** Un workflow ajouté sur une branche du dépôt s exécute quand même : au push de cette branche s il déclare `on: push`, et sur sa propre PR, avec le jeton par défaut du dépôt. Le test rougit la CI et empêche la fusion, pas l exécution. La parade relève des réglages Actions du dépôt : permissions par défaut du jeton en lecture seule, liste blanche d actions. `gh api repos/KraidleAI/monark-governance/actions/permissions[/workflow]` répond 403 à cette session : **non vérifié**.
   - **Défaut : contrôle de ces réglages par MONARK** (jeton par défaut en lecture, actions autorisées restreintes).
   - Rien à tester dans le dépôt.
6. **Réancrage du tueur du premier test (G2, N-1), item à porter.** `// killer: scripts/export-public.mjs:425 CONST "ci.yml" -> "gates.yml"`, au-dessus de `ci_workflows_set_is_exactly_ci_yml`, à la ligne **1962** de `test/ci-gates.test.ts` après le pli. La ligne 425 est juste sur le tronc (`e4aac057` et `74120213`), donc pas de réancrage maintenant.
   - **Déclencheur** : la fusion T0 de `base/chantier-moteur` dans le tronc, ou toute synchro qui apporte les 22 lignes de `export-public.mjs` de `7a0d8ef4` (en-tête +2, `WHITELIST_FILES` +2, `pendingSendBlockers` +18).
   - **Geste** : réancrer en `scripts/export-public.mjs:447`, puis `verifie-ancres.mjs . --touched <base de synchro> HEAD` à 0 PERDU et tir du tueur réancré (rouge par l assertion du `CI_WORKFLOW_PATH`).
   - Rien dans la CI ne détecte une ancre perdue : à inscrire dans la séquence de fusion ou la ligne de synchro de `docs/ETAT.md`.
   - Les trois tueurs du pli ne bougent pas avec `7a0d8ef4` : `ci.yml` y est inchangé (ligne 37 identique), et `test/helpers/git-tracked.ts` n existe que sur cette branche.
7. **Le juge `uses:` ne couvre que ce dépôt.** Le miroir public `KraidleAI/Monark`, ou un autre dépôt de l organisation, appelé par `uses:` à un SHA épinglé, passe le test 38 et ce juge. Aujourd hui, aucun `uses:` de `ci.yml` ne nomme `KraidleAI`.
   - **Défaut : rien** (ce sont des dépôts tiers épinglés, comme `actions/*`).
   - Option : étendre le juge à `KraidleAI/` entier. Prix : une ligne et un contrôle.

## Pli de la G2 (verdict : non bloquant)

| Constat | Décision | Changement | Test, tueur |
|---|---|---|---|
| N-1 ancre `:425` perdue à la synchro avec `7a0d8ef4` | pas de réancrage maintenant | item 6 ci-dessus | tueur inchangé, ligne 1962 |
| N-2 `git` hérite des `GIT_*` de l appelant | plié | `test/helpers/git-tracked.ts` : `gitOut` lance git avec l environnement sans aucune variable `GIT_*` (insensible à la casse, comme `dojo-render.test.ts`) ; le premier test passe par `tracked()` | `ci_workflows_set_reads_ignore_the_callers_git_env` : un dépôt leurre ne suivant que `decoy.yml`, posé par `GIT_DIR` puis par `GIT_INDEX_FILE`, ne remplace pas `ci.yml` ; rouge à `854ad1ff` (les deux lectures rendent `decoy.yml`) ; tueur `test/helpers/git-tracked.ts:11 CONST "env: bare(), " -> ""` |
| N-3 index non fusionné : `ci.yml` trois fois | plié | les deux lectures sont dédupliquées (`uniq`) ; l égalité reste stricte | `ci_workflows_set_reads_an_unmerged_index_once` : un dépôt jouet en conflit sur `ci.yml` (contrôle : trois étages) est lu une fois ; rouge à `854ad1ff` ; tueur `test/helpers/git-tracked.ts:16 CONST "[...new Set(xs)]" -> "xs"` |
| N-4 le verrou ne bloque pas l exécution | phrase | item 5 ci-dessus | aucun |
| N-5 action ou workflow réutilisable de ce dépôt par `uses:` | plié | juge `USES_SELF_RE` dans `ci-gates.test.ts` : aucune ligne non commentaire de `ci.yml` n a de clé `uses:` vers `KraidleAI/monark-governance/` ou `KraidleAI/monark-governance@`, en toute casse, entre guillemets ou non, en étape, au niveau du job ou en mapping en ligne | `ci_uses_nothing_of_this_repository` : vert sur `ci.yml`, cinq mutants refusés, trois contrôles verts (`actions/checkout`, ligne de commentaire, `monark-governance-other`) ; tueur `.github/workflows/ci.yml:37 CONST "actions/checkout@" -> "KraidleAI/monark-governance/.github/actions/checkout@"` |
| N-7 ligne de `WF` dans le G0, question 4 | corrigé | G0 : `WF` en 51 à la base, 54 au gel du pli ; question 4 reformulée | aucun |

Tueurs du pli tirés à la main (sha256 avant / muté / après restauration ; après égal à avant dans les quatre cas), chacun rouge par une assertion :

- `scripts/export-public.mjs:425` : `7c37516b…26b74` / `d103a43f…02da8` / `7c37516b…26b74` ;
- `test/helpers/git-tracked.ts:11` : `6d1b4458…6ff00b` / `16df5f13…46c1` / `6d1b4458…6ff00b` ;
- `test/helpers/git-tracked.ts:16` : `6d1b4458…6ff00b` / `333646a1…9e1f` / `6d1b4458…6ff00b` ;
- `.github/workflows/ci.yml:37` : `80d895bd…2eb1` / `53184cae…7e64d` / `80d895bd…2eb1`.

Après le pli :

- red-proof `--test-only --base e4aac057 --gel . --repo . --seed 37` : **OK**, 4 tests jugés, tous `pinned`, 4 tueurs `killed`, 36 inchangés ; `RED-PROOF.json` sha256 `5bd1d5f7…f34a2` ;
- ancres : tueurs 12, ANCRE 12, DERIVE 0, PERDU 0 ;
- R-25 : CODE 133 insertions, 2 suppressions, **135** (borne 547) ; CONTENT 0 ; GREEN ;
- `npm run test:main` : 2 489 tests, 2 467 verts, **0 échec**, 22 sautés (585 s) ;
- `tsc` 0, `lint` 0, `lint:ratchet` 69/69, `gate:vocab` OK, `lang:gate` 0, `export:check` OK. `test/helpers/git-tracked.ts` n est pas exporté (seul `test/helpers/blocking-stdout.cjs` est dans la liste blanche).

## Écarts

- Node 24 installé hors dépôt.
- La commande de red-proof de la mission (`--draw n --seed 37`) est incompatible avec `--test-only`. J ai lancé `--test-only --seed 37`, qui tire chaque tueur listé.
