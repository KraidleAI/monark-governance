# G0 du lot d'outil RED-PROOF-JUNCTION-1 : `scripts/red-proof.mjs` lancé, ou nourri, par des jonctions

- **Rattachement** : item RED-PROOF-JUNCTION-1 de `docs/ETAT.md` (C-4 du contrôle de CM-2a par MONARK, mesuré le 2026-10-03 :
  « la commande de red-proof, prise à la lettre, échoue sur un clone atteint par des jonctions ; contournement : `--repo F:/Monark` ») ;
  item RED-PROOF-JUNCTION-GUARD-1 (G1 M-6, l.509 ; ADR-METHODE-2 l.62, point (5)) pour la garde d'entrée ; précédent de la garde :
  `scripts/oracle/run.mjs` l.40 et `scripts/mutants/run.mjs` l.250 (`if (import.meta.main !== false)`, C-G2-1 de M-6, test 19
  `mutants_launched_through_a_junction_records_or_refuses_never_a_silent_exit_0`).
- **Base** : `0c8f8177` (`origin/lot/etude-suite`, tronc). Branche `recherches/red-proof-junction-1`, worktree propre. Auteur : RECHERCHES.
  Aucun réseau. Sur Linux, une jonction Windows est reproduite par un lien symbolique de répertoire (`symlinkSync(cible, lien, "junction")`,
  que Node traite comme `"dir"` hors Windows), comme le font déjà `test/mutants-run.test.ts` et `test/compare-coinbase-passes.test.ts`.

## Recensement : où un chemin atteint par un lien change le comportement

Chaque cas a été lancé à la base, par un lien puis par le chemin réel.

1. **Garde d'entrée** (l.266) : `resolve(process.argv[1]) === fileURLToPath(import.meta.url)`. Lancé par un lien, `argv[1]` est le
   chemin du lien, `import.meta.url` le chemin réel : la garde est fausse, `main` ne tourne pas, **sortie 0 muette**. Mesuré :
   `node <lien vers scripts>/red-proof.mjs` sans argument sort 0 sans rien écrire ; par le chemin réel, 2 et `usage`.
2. **`linkModules`** (l.135-149, cas mesuré par MONARK) : un `node_modules` dont chaque entrée est une jonction (`mk-nm.ps1`) ; `place`
   ne lie une entrée-lien que si c'est un espace de travail, toute autre est **omise** ; un répertoire de portée (`@x`) qui est lui-même
   une jonction n'est pas un répertoire pour `Dirent.isDirectory()`, il est donc traité comme une entrée et omis aussi. Le test qui
   importe un paquet hors espace de travail rend `ERR_MODULE_NOT_FOUND` à la base comme au gel : preuve REFUSED. Le contournement
   `--repo F:/Monark` marche parce que le `node_modules` de `F:/Monark` est un vrai répertoire.
3. **Fichiers non suivis d'un worktree gel** (l.217) : un `node_modules` qui est lui-même un lien dans le worktree n'est pas pris par
   le motif `node_modules/` du `.gitignore` (un motif à barre finale ne vise que les répertoires, un lien n'en est pas un pour git) ;
   `git ls-files --others --exclude-standard` le liste, `put` le copie par `copyFileSync` : `EISDIR`, sortie 2. Mesuré sur Linux ;
   sur Windows, cela dépend de la façon dont Git pour Windows voit une jonction (question Q-RPJ-1).
4. **Non reproduits, sans changement** : `repo = resolve(".")` quand `--gel` est un sha et `--repo` absent (sur POSIX `process.cwd()`
   rend déjà le chemin réel ; sur un chemin de lien, git, le clone et la lecture de `node_modules` marchent pareil) ; le contrôle de
   portée `realpathSync(...).startsWith(realpathSync(tree) + sep)` (les deux côtés passent par `realpathSync`, un `TEMP` atteint par
   un lien ne change rien) ; un `node_modules` de `--repo` qui est lui-même un lien (`readdirSync` le suit : lu comme la cible).

## Contenu

`scripts/red-proof.mjs`, `test/red-proof.test.ts`, ce G0 et le G7.

1. Garde d'entrée : `if (import.meta.main !== false)`, forme de `oracle/run.mjs` l.40 ; import de `fileURLToPath` retiré.
2. `linkModules` : un répertoire de portée se reconnaît par `isDir` (qui suit le lien), ses entrées sont parcourues comme avant (un
   espace de travail est re-pointé vers le clone) ; une entrée-lien hors espace de travail qui mène à un répertoire est liée à sa
   **cible réelle** (`realpathSync`) ; un lien cassé ou vers un fichier reste omis, comme avant.
3. Fichiers non suivis : un chemin listé qui est un répertoire (un lien vers un répertoire) n'est pas une modification du lot ; il est
   écarté.

## Tests (trois neufs, rouges à la base par assertion), tueurs

- `red_proof_launched_through_a_junction_records_or_refuses_never_a_silent_exit_0` : lien vers `scripts/` ; sans argument, 2 et
  `usage` ; avec un diff vide, 1 et un `RED-PROOF.json`. Tueur : la garde remise en `resolve(argv[1]) === import.meta.filename`.
- `red_proof_links_the_real_target_of_a_junctioned_module_and_repoints_a_junctioned_scope` : un clone du dépôt de test dont le
  `node_modules` est un vrai répertoire dont chaque entrée est un lien (`fx-dep`, et la portée `@fx` entière) ; mêmes lignes jugées,
  mêmes statuts, mêmes verdicts que le dépôt d'origine. Tueur : le lien vers la cible réelle retiré.
- `red_proof_worktree_gel_with_a_junctioned_node_modules_is_judged` : un worktree gel dont `node_modules` est un lien, sans `--repo` ;
  sortie 0 et la preuve. Tueur : le filtre des répertoires non suivis neutralisé.

## Taille

Attendu : script ≈ 6 lignes, test ≈ 40, docs hors compte R-25 (`docs/**/*.md`). Bien sous 547.

## Questions pour MONARK

- **Q-RPJ-1** : Git pour Windows liste-t-il une jonction `node_modules` d'un worktree comme fichier non suivi (cas 3) ? Le correctif
  est sans effet si git la voit comme un répertoire ignoré ; à confirmer par `git ls-files --others --exclude-standard` dans un
  worktree dont `node_modules` est une jonction.
- **Q-RPJ-2** : la commande prise à la lettre de C-4 portait-elle le chemin du script par une jonction (cas 1) ? Le contournement
  `--repo` ne corrige que le cas 2 ; le cas 1 sortait 0 sans rien écrire.

## Pli de la G2 (instance neuve : APPROUVE-AVEC-CORRECTIONS ; tests rouges au premier gel `34c4d55`, puis code)

- **B-1** (bloquante), l.142 : la cible réelle n'est liée que si elle est sous un répertoire `node_modules`
  (`realpathSync(from).split(sep).includes("node_modules")`) ; sinon (lien npm vers un espace de travail que l'arbre n'a pas, paquet
  ajouté par le lot) le lien reste omis, comme à la base : la base ne charge jamais la copie de travail de `--repo`. Test
  `red_proof_never_loads_a_workspace_the_base_lacks_from_the_repo_working_copy` (exp2 du relecteur : copie de travail dérivée) ;
  tueur : la condition `node_modules` retirée.
- **m-1**, l.217 : seul un lien vers un répertoire est écarté (`lstatSync(…).isSymbolicLink()`), inscrit dans `files.skipped` du
  `RED-PROOF.json` (l.214, l.252, `red-proof.d.mts`) ; un dépôt imbriqué non suivi s'arrête encore (`EISDIR`, exit 2). Test
  `red_proof_records_a_skipped_linked_directory_and_still_stops_on_an_untracked_nested_repo` ; tueur : le contrôle `lstatSync` retiré.
  Le tueur du test du cas 3 devient `skipped.push(p)` → `changes.set(p, "A")`.
- **m-3** : test `red_proof_leaves_out_a_broken_link_and_a_link_to_a_file_in_node_modules` (lien cassé, lien vers un fichier) ;
  tueurs `isDir(from)` → `true` (déclaré) et → `existsSync(from)` (à la main), tués.
- **m-2** : `import.meta.main !== false` exige Node 24.2 ou plus ; `engines` inchangé ; question Q-RPJ-3 du G7.
- **m-4**, **m-5** : notés au G7 ; la question « la commande de C-4 passait-elle par une jonction ? » (Q-RPJ-2 ci-dessus) devient
  Q-RPJ-4 au G7, dont Q-RPJ-1 à Q-RPJ-3 sont reformulées selon la G2.
- Aucune ligne du script ajoutée ni retirée : les adresses des tueurs existants restent justes.
