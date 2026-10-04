# G7 du lot d'outil RED-PROOF-JUNCTION-1 : `scripts/red-proof.mjs` lancé, ou nourri, par des jonctions

- **Plan** : `docs/G0-lot-red-proof-junction-1.md`. **Base** : `0c8f8177` (`origin/lot/etude-suite`). Branche
  `recherches/red-proof-junction-1`. Commits : `d491eaa` (G0), `0a83894` (tests rouges), `34c4d55` (code, premier gel), `75ca967`
  (G7) ; pli de la G2 : `92d3dc8` (tests), `4cf8134` (code, **gel**), puis ce G7 révisé.
- Hôte de mesure : Linux, Node v22.22.2 ; jonctions reproduites par des liens symboliques de répertoire (`symlinkSync(…, "junction")`).

## Échecs reproduits, mécanisme, correctif, test

| Cas | Mécanisme (à la base) | Correctif (gel) | Test (rouge à la base par assertion) | Tueur tué |
|---|---|---|---|---|
| 1. Garde d'entrée | lancé par un lien, `argv[1]` = chemin du lien, `import.meta.url` = chemin réel : `main` ne tourne pas, **exit 0 muet** (sans argument : 0 et rien, au lieu de 2 et `usage`) | l.266 `if (import.meta.main !== false)` (forme de `oracle/run.mjs` l.40) | `red_proof_launched_through_a_junction_records_or_refuses_never_a_silent_exit_0` | l.266, l'ancienne garde |
| 2. `node_modules` en jonctions (C-4 de CM-2a, `mk-nm.ps1`) | `place` omet toute entrée-lien hors espace de travail (`fx-dep`) ; une portée `@fx` qui est une jonction n'est pas `isDirectory()`, omise aussi : `ERR_MODULE_NOT_FOUND` à la base et au gel, 17 lignes en `import-fail`, preuve REFUSED | l.142 : entrée-lien hors espace de travail liée à sa cible réelle si celle-ci est un répertoire **sous un répertoire `node_modules`** (B-1) ; l.145 : portée reconnue par `isDir` (suit le lien), ses espaces de travail re-pointés vers le clone | `red_proof_links_the_real_target_of_a_junctioned_module_and_repoints_a_junctioned_scope` : mêmes lignes, statuts et verdicts que le dépôt d'origine | l.142, le lien vers la cible réelle retiré ; la moitié l.145 seule défaite rougit aussi le test |
| 3. Worktree gel dont `node_modules` est un lien | `node_modules/` du `.gitignore` ne vise que les répertoires ; git liste le lien en non suivi, `put` fait `copyFileSync` : `EISDIR`, exit 2, aucune preuve | l.217 : un non suivi qui est **un lien** vers un répertoire n'est pas une modification ; il est inscrit dans `files.skipped` (m-1) | `red_proof_worktree_gel_with_a_junctioned_node_modules_is_judged` (sans `--repo`, exit 0, F2P, tueur tué) | l.217, `skipped.push(p)` remis en `changes.set(p, "A")` |

Non reproduits sur Linux, sans changement : `repo = resolve(".")` sans `--repo` (POSIX : `process.cwd()` est déjà réel ; un `--repo`
par lien marche aussi, mesuré) ; le contrôle de portée par `realpathSync` des deux côtés ; un `node_modules` de `--repo` qui est
lui-même un lien (`readdirSync` le suit).

## Pli de la G2 (APPROUVE-AVEC-CORRECTIONS), correction par correction, avec son tueur

| Correction | Changement | Test | Tueur vérifié tué |
|---|---|---|---|
| **B-1** (bloquante) : le premier gel liait aussi le lien npm d'un espace de travail que l'arbre n'a pas (paquet ajouté par le lot) vers la copie de travail de `--repo` : la base chargeait du code qui n'est pas la base, **faux F2P** (exp2 du relecteur) | l.142 : `isDir(from) && realpathSync(from).split(sep).includes("node_modules")` ; une cible de paquet est toujours sous un `node_modules` (`F:\Monark\node_modules\<x>` pour `mk-nm.ps1`), une cible d'espace de travail jamais | `red_proof_never_loads_a_workspace_the_base_lacks_from_the_repo_working_copy` : le lot ajoute `packages/v` (`@fx/v`), la copie de travail de `--repo` a dérivé (`x + x + 1`) ; attendu `v_dbl` base `import-fail`, gel `pass`, `refused`, exit 1. Rouge au premier gel `34c4d55` (F2P faux) et à la base | condition `node_modules` retirée |
| **m-3** : « un lien cassé ou vers un fichier reste omis » sans test | aucun code (affirmation du premier gel, désormais épinglée) | `red_proof_leaves_out_a_broken_link_and_a_link_to_a_file_in_node_modules` : même dépôt, `node_modules` porte `fx-broken` (lien cassé) et `fx-file` (lien vers un fichier sous `node_modules`) ; l'outil ne s'arrête pas, le test du lot `links_kept_out` lit `["@fx", "fx-dep"]` dans le clone, vert à la base et au gel. Rouge à la base `0c8f8177` (`fx-dep` en jonction omis) ; vert au premier gel par nature | `isDir(from)` → `true` (déclaré : ENOENT, exit 2) ; `→ existsSync(from)` tué aussi, à la main (`fx-file` lié) |
| **m-1** : le premier gel écartait en silence tout non suivi qui est un répertoire (dépôt imbriqué `vendor/sub/` compris) | l.217 : seul un **lien** (`lstatSync(…).isSymbolicLink()`) vers un répertoire est écarté, et inscrit dans `files.skipped` du `RED-PROOF.json` (l.214, l.252, `red-proof.d.mts`) ; un dépôt imbriqué non suivi s'arrête encore en `EISDIR`, exit 2 | `red_proof_records_a_skipped_linked_directory_and_still_stops_on_an_untracked_nested_repo` : lien `linked` → `files.skipped` = `["linked"]` ; dépôt imbriqué → exit 2, `EISDIR`, aucune preuve. Rouge au premier gel et à la base | `lstatSync(…).isSymbolicLink() && ` retiré |
| **m-2** : `import.meta.main !== false` est vrai quand `import.meta.main` est `undefined` (Node < 22.18, et 24.0 à 24.1) : un import lance alors `main` | aucun code, `engines` inchangé (`>=24`) ; **exige Node 24.2 ou plus** (ou 22.18 et plus sur la ligne 22) ; même précédent qu'`oracle/run.mjs` l.40 et `mutants/run.mjs` l.250 | — | question Q-RPJ-3 |
| **m-4** : le mutant l.266 `true` n'est tué qu'au niveau du fichier (dans `test/mutants-run.test.ts`, et dans `test/red-proof.test.ts` lancé filtré) ; dans un passage complet du fichier sous Node 22, le rouge préexistant du test 15 le masque | noté ; aucun test nommé ne porte cette propriété (item à former si MONARK le veut : un test qui importe le module et affirme `exitCode` inchangé) | — | — |
| **m-5** : la question du G0 « la commande de C-4 prise à la lettre passait-elle par une jonction ? » manquait au G7 | rétablie (Q-RPJ-4) | — | — |

Les 22 lignes `// killer:` de `test/red-proof.test.ts` sont relues contre le script du gel (`parseKiller`, `<before>` exactement une
fois sur la ligne citée, ligne au-dessus d'une déclaration) : 22/22. Aucune ligne du script ajoutée ni retirée par le lot (l.27, 142,
145, 214, 217, 252, 266 modifiées en place) : les 16 adresses existantes restent sur leur code ; seule l'adresse du test 19
(l.217) est réécrite, la ligne ayant changé.

## Oracle

- `node scripts/red-proof.mjs --base 0c8f8177d9d54005b71a01a4b0e4a9fecd0ca72c --gel 4cf8134 --repo /home/user/monark-governance-rp --draw 6 --seed 37` :
  **OK**, exit 0 : 6 tests jugés F2P, 16 inchangés, 6 tueurs tirés (la population entière), 6 tués ; `RED-PROOF.json` sha256
  `a0ec1ffd…`, digest `31add566…`.
- Premier gel : même commande avec `--gel 34c4d55 --draw 3` : OK, 3 F2P, 3 tués (digest `56ac0dc0…`) ; lancé aussi par un lien
  vers le worktree, `--repo` par ce lien : OK.
- `npx tsc --noEmit` vert ; eslint vert sur `test/red-proof.test.ts` ; `lint:ratchet` 69/69 ; `gate:vocab` OK ;
  `test/mutants-run.test.ts` (qui importe `DENY`) vert.
- `test/red-proof.test.ts` : 21/22 au gel. L'échec, `red_proof_fails_on_a_stillborn_draw_or_an_empty_diff`, est **déjà rouge à la
  base** sur cet hôte (`vi_hangs` lu `killed` au lieu d'`inconclusive` : le tueur « promesse jamais résolue » ne finit pas en délai
  dépassé sous Node 22 ; confirmé par la G2) ; ce lot n'y touche pas ; à relire sous Node 24 (MONARK).
- R-25 par `r25()` (`scripts/oracle/r25.mjs`, pathspec de `ci.yml`) : +85/−10, **95 lignes comptées**, sous 547 (G0 et G7 hors
  compte, `docs/**/*.md`).

## Autocontrôle

- L'import de `fileURLToPath` reste : le tueur du cas 1 le réutilise (comme le tueur K19 de `mutants/run.mjs`).
- Un lien cassé ou vers un fichier dans `node_modules` reste omis (`isDir` suit le lien et rend faux) : épinglé par le test de m-3.
- Un lien vers un fichier non suivi d'un worktree reste copié (son contenu), comme avant.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis. Rien n'est poussé.

## Écarts au plan

- G0 point 1 : « import de `fileURLToPath` retiré » ; il reste (motif ci-dessus).
- Le test de m-3 est vert au premier gel `34c4d55` par nature (il épingle une affirmation déjà vraie) ; il est rouge à la base
  `0c8f8177`, ce que demande l'outil.
- `scripts/red-proof.d.mts` (type `files.skipped`) est commis avec les tests du pli, pour que `tsc` reste vert à ce commit.
- Taille : script 7 lignes modifiées (+7/−7), test +77/−2, types +1/−1 ; total compté 95.

## Questions pour MONARK (à confirmer sous Windows)

- **Q-RPJ-1** (cas 3 ; seulement quand `node_modules` est **lui-même** une jonction, la disposition « une seule jonction »
  `node_modules -> F:\Monark\node_modules` de `docs/CHECKPOINT2-lot-dojo-pr1a.md:79` ; la disposition `mk-nm.ps1`, un vrai
  répertoire de jonctions, ignoré par `node_modules/`, n'est pas concernée) : Git pour Windows liste-t-il cette jonction en non
  suivi ? Mesure : `git ls-files --others --exclude-standard` dans un tel worktree. Si non, le cas 3 n'existe que pour un lien
  symbolique, et le correctif l.217 est sans effet sous Windows.
- **Q-RPJ-2** (cas 2) : rejouer la commande de C-4 prise à la lettre (sans `--repo`) sur le clone `mk-nm.ps1` avec l'outil du gel ;
  attendu : **les mêmes lignes et les mêmes verdicts** qu'avec `--repo F:/Monark` (`at` et `repo` diffèrent). Rejouer aussi un lot
  qui **ajoute un paquet d'espace de travail** (B-1) : sous `mk-nm.ps1`, le lien `@monark/<neuf>` pointe vers la copie de travail du
  clone ; attendu : la base ne le charge pas (import rouge, `refused`), jamais un F2P. Le correctif suppose que, sous Windows,
  `Dirent.isSymbolicLink()` d'une jonction est vrai, `isDirectory()` faux et `realpathSync` rend sa cible (ce que libuv fait selon
  la G2) ; non mesuré ici.
- **Q-RPJ-3** (cas 1, m-2) : version exacte de Node sur l'hôte (`node --version`) ? `import.meta.main` exige Node 24.2 ou plus ;
  sous 24.0 ou 24.1, un import du script lancerait `main` (`engines` dit `>=24`, laissé tel quel). Si la version est ≥ 24.2 et que
  `mutants/run.mjs` passe son test 19, rien à refaire.
- **Q-RPJ-4** (cas 1, m-5 ; question du G0) : la commande de C-4 prise à la lettre appelait-elle le script **par une jonction**
  (sortie 0 muette à la base) ? Le contournement `--repo F:/Monark` ne corrige que le cas 2 ; la réponse dit si le cas 1 faisait
  partie de l'échec signalé.
- Hors Linux, non mesuré : `process.cwd()` d'un cwd atteint par une jonction (Windows peut rendre le chemin de la jonction) ; sans
  effet attendu, git et le clone acceptant ce chemin.

## Sortie

Prêt pour le contrôle par diff de MONARK. Items RED-PROOF-JUNCTION-1 et RED-PROOF-JUNCTION-GUARD-1 clos au gel `4cf8134` sous
réserve de Q-RPJ-1 à Q-RPJ-4.
