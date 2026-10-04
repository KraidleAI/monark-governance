# G7 du lot d'outil RED-PROOF-JUNCTION-1 : `scripts/red-proof.mjs` lancé, ou nourri, par des jonctions

- **Plan** : `docs/G0-lot-red-proof-junction-1.md`. **Base** : `0c8f8177` (`origin/lot/etude-suite`). Branche
  `recherches/red-proof-junction-1`. Commits : `d491eaa` (G0), `0a83894` (tests rouges), `34c4d55` (code, **gel**), puis ce G7.
- Hôte de mesure : Linux, Node v22.22.2 ; jonctions reproduites par des liens symboliques de répertoire (`symlinkSync(…, "junction")`).

## Échecs reproduits, mécanisme, correctif, test

| Cas | Mécanisme (à la base) | Correctif (gel) | Test (rouge à la base par assertion) | Tueur tué |
|---|---|---|---|---|
| 1. Garde d'entrée | lancé par un lien, `argv[1]` = chemin du lien, `import.meta.url` = chemin réel : `main` ne tourne pas, **exit 0 muet** (sans argument : 0 et rien, au lieu de 2 et `usage`) | l.266 `if (import.meta.main !== false)` (forme de `oracle/run.mjs` l.40) | `red_proof_launched_through_a_junction_records_or_refuses_never_a_silent_exit_0` | l.266, l'ancienne garde |
| 2. `node_modules` en jonctions (C-4 de CM-2a, `mk-nm.ps1`) | `place` omet toute entrée-lien hors espace de travail (`fx-dep`) ; une portée `@fx` qui est une jonction n'est pas `isDirectory()`, omise aussi : `ERR_MODULE_NOT_FOUND` à la base et au gel, 17 lignes en `import-fail`, preuve REFUSED | l.142 : entrée-lien hors espace de travail vers un répertoire liée à sa cible réelle (`realpathSync`) ; l.145 : portée reconnue par `isDir` (suit le lien), ses espaces de travail re-pointés vers le clone | `red_proof_links_the_real_target_of_a_junctioned_module_and_repoints_a_junctioned_scope` : mêmes lignes, statuts et verdicts que le dépôt d'origine | l.142, le lien vers la cible réelle retiré ; la moitié l.145 seule défaite rougit aussi le test (`f2p_true` vert à la base, le paquet d'espace de travail lu dans le dépôt) |
| 3. Worktree gel dont `node_modules` est un lien | `node_modules/` du `.gitignore` ne vise que les répertoires ; git liste le lien en non suivi, `put` fait `copyFileSync` : `EISDIR`, exit 2, aucune preuve | l.217 : un non suivi qui est un répertoire (un lien vers un répertoire) n'est pas une modification | `red_proof_worktree_gel_with_a_junctioned_node_modules_is_judged` (sans `--repo`, exit 0, F2P, tueur tué) | l.217, filtre neutralisé |

Non reproduits sur Linux, sans changement : `repo = resolve(".")` sans `--repo` (POSIX : `process.cwd()` est déjà réel ; un `--repo`
par lien marche aussi, mesuré ci-dessous) ; le contrôle de portée par `realpathSync` des deux côtés ; un `node_modules` de `--repo`
qui est lui-même un lien (`readdirSync` le suit).

## Oracle

- `node scripts/red-proof.mjs --base 0c8f8177d9d54005b71a01a4b0e4a9fecd0ca72c --gel 34c4d55 --repo /home/user/monark-governance-rp --draw 3 --seed 37` :
  **OK**, exit 0 : 3 tests jugés F2P, 16 inchangés, 3 tueurs tirés (la population entière), 3 tués ; `RED-PROOF.json` sha256
  `896de788…`, digest `56ac0dc0…`.
- Le même outil du gel lancé par un lien vers le worktree, `--repo` par ce lien : **OK**, 3 F2P (sans tirage).
- `npx tsc --noEmit` vert ; eslint vert sur `test/red-proof.test.ts` ; `lint:ratchet` 69/69 ; `gate:vocab` OK ;
  `test/mutants-run.test.ts` (qui importe `DENY`) vert.
- `test/red-proof.test.ts` : 18/19 au gel. L'échec, `red_proof_fails_on_a_stillborn_draw_or_an_empty_diff`, est **déjà rouge à la
  base** sur cet hôte (`vi_hangs` lu `killed` au lieu d'`inconclusive` : le tueur « promesse jamais résolue » ne finit pas en délai
  dépassé sous Node 22) ; ce lot n'y touche pas ; à relire sous Node 24 (MONARK).
- R-25 par `r25()` (`scripts/oracle/r25.mjs`, pathspec de `ci.yml`) : +36/−6, **42 lignes comptées**, sous 547 (les G0 et G7
  sont hors compte, `docs/**/*.md`).

## Autocontrôle

- Aucune ligne du script ajoutée ni retirée : les 16 tueurs existants gardent leurs adresses (vérifié par l'outil : 16 inchangés,
  aucun tueur invalide).
- L'import de `fileURLToPath` reste : le tueur du cas 1 le réutilise (comme le tueur K19 de `mutants/run.mjs`).
- Un lien cassé ou vers un fichier dans `node_modules` reste omis, comme avant (`isDir` suit le lien et rend faux).
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis. Rien n'est poussé.

## Écarts au plan

- G0 point 1 : « import de `fileURLToPath` retiré » ; il reste (motif ci-dessus : le retirer décale toutes les lignes et casse les
  16 adresses de tueurs, et le tueur du cas 1 l'emploie).
- Taille : script 4 lignes modifiées (prévu ≈ 6), test +32/−2 (prévu ≈ 40).

## Questions pour MONARK (à confirmer sous Windows)

- **Q-RPJ-1** (cas 3) : Git pour Windows liste-t-il une **jonction** `node_modules` de worktree en non suivi ? Mesure :
  `git ls-files --others --exclude-standard` dans un tel worktree. Si non, le cas 3 n'existe que pour un lien symbolique, et le
  correctif est sans effet sous Windows.
- **Q-RPJ-2** (cas 2) : rejouer la commande de C-4 prise à la lettre (sans `--repo`) sur le clone `mk-nm.ps1` avec l'outil du gel ;
  attendu : la même preuve qu'avec `--repo F:/Monark`. Le correctif suppose que, sous Windows, `Dirent.isSymbolicLink()` d'une
  jonction est vrai et `isDirectory()` faux (ce que décrit l'item de `docs/ETAT.md` : une jonction hors espace de travail est omise),
  et que `realpathSync` d'une jonction rend sa cible ; non mesuré ici, à confirmer sur le clone réel.
- **Q-RPJ-3** (cas 1) : sous Node 24, lancé par une jonction, `import.meta.main` est vrai (mesuré en M-6) ; rien à refaire si
  `mutants/run.mjs` passe son test 19 sur l'hôte.
- Hors Linux, non mesuré : `process.cwd()` d'un cwd atteint par une jonction (Windows peut rendre le chemin de la jonction) ; sans
  effet attendu, git et le clone acceptant ce chemin.

## Sortie

Prêt pour le contrôle par diff de MONARK. Item RED-PROOF-JUNCTION-1 (et RED-PROOF-JUNCTION-GUARD-1) clos au gel `34c4d55` sous
réserve de Q-RPJ-1 et Q-RPJ-2.
