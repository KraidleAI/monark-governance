# G0 du lot d'outil LINT-UNTRACKED-TMP-1 : la copie des dépôts de test de `test/journal-index.test.ts` sous charge

- **Rattachement** : item LINT-UNTRACKED-TMP-1 de `docs/ETAT.md` (l.396, critique K-5 des contrôles de #107 à #112). Zone MONARK
  ouverte à RECHERCHES par le message « bascule de charge » du 2026-10-04 (§3, point 3).
- **Base** : `71363ef1` (`origin/lot/etude-suite`, tronc). Branche `recherches/lint-untracked-tmp-1`, worktree propre. Auteur : RECHERCHES.
- **Fichiers** : `test/journal-index.test.ts`, ce G0 et le G7. Aucun code de production.

## Le rouge

CI Linux de #110, run `37169648100`, job `g3-verification` (`111339807999`), Node v24.21.0, git 2.55.0, `ubuntu-24.04` :

```
✖ LINT-UNTRACKED: replayed at recu_head, … (20.425928ms)
  Error: ENOENT, No such file or directory '/tmp/monark-journal-l8JSkV/w106/.git/objects'
      at copyDir (node:internal/fs/cp/cp-sync:145:22)
      …
      at generated (file:///…/test/journal-index.test.ts:84:3)
  { errno: 2, code: 'ENOENT', path: '/tmp/monark-journal-l8JSkV/w106/.git/objects', syscall: 'cp' }
```

## Recensement des causes possibles (mesuré à la base)

1. **Nettoyage concurrent de `/tmp`** : écarté. Le préfixe `monark-journal-` n'est employé que par ce fichier (`git grep`). Sa racine
   `T` vient de `mkdtempSync` : elle est propre au processus. Aucun test ne lit `tmpdir()` pour en effacer des entrées. Le seul `rmSync`
   de `T` est le `after` de ce fichier, qui tourne après le dernier test. `w106` n'est donc écrit par personne d'autre.
2. **Copie native de Node 24** : sans `filter`, `cpSync` fait toute la copie d'un répertoire en C++ (`fsBinding.cpSyncCopyDir`,
   `cp-sync` l.145). Quand une entrée de la source disparaît entre la lecture du répertoire et sa copie, l'erreur porte le chemin
   du **répertoire de destination**, avec `syscall: 'cp'`. Mesuré sous Node v24.21.0 : un dépôt de 30 commits est copié 2 000 fois
   pendant qu'un processus crée puis efface `.git/objects/maintenance.lock`. Résultat : **316 échecs sur 2 000**, tous du message exact
   de la CI (`ENOENT, No such file or directory 'd4/.git/objects'`, `cp`).
3. **Qui fait apparaître puis disparaître un fichier dans `.git/objects` de la source** : la maintenance automatique de git.
   - `git commit` lance `git maintenance run --auto` (`builtin/commit.c` l.1965, `run_auto_maintenance`).
   - Depuis git 2.47, ce lancement se fait avec `--detach` par défaut (`maintenance.autoDetach`, sinon `gc.autoDetach`, sinon vrai ;
     `run-command.c` l.1974-1982 de git 2.55.0).
   - `maintenance_run_tasks` prend le verrou `<objects>/maintenance.lock` (`builtin/gc.c` l.1791). Il se détache (`daemonize`,
     l.1817) et ne rend le verrou qu'**après** le retour de `git commit` (l.1826).
   - Or `generated()` copie `g` (l.84) juste après `sh(g, "commit", …)` (l.83). La copie lit `.git/objects` pendant que le démon
     y efface `maintenance.lock` : c'est le rouge de la CI.
   - Les copies de `TPL` (l.50) juste après les commits du module, et celle de `w` (build après le commit l.85), sont exposées de la
     même façon.
4. **Pourquoi vert ailleurs** :
   - L'hôte de RECHERCHES a git 2.43 : la maintenance automatique y tourne au premier plan, donc elle est finie au retour du commit.
   - Sous Windows, `daemonize` n'existe pas : la maintenance reste au premier plan.
   - ~~Sous Node 22, `cpSync` copie en JS (`opendir` puis `lstat`) : la fenêtre existe aussi, mais elle est plus étroite.~~
     Ligne datée 2026-10-04 (m4 de la G2 neuve) : c'est faux pour Node 22.22.2, qui a aussi le chemin natif. Le G7 mesure le même
     rouge 3/3 qu'avec Node 24, et le même message.

## Contenu

1. **Cause** : le fichier de configuration globale du test (`T/gitconfig`, jusqu'ici vide) porte `maintenance.auto = false`. Aucun
   processus git ne survit alors à sa commande. Cela ne touche ni les objets, ni les empreintes C1 et C2 (le test doré les vérifie).
2. **Copie** : un seul outil de copie pour `repo()` et `generated()`.
   - Chaque copie va dans un répertoire neuf de `mkdtempSync` sous `T`, la racine propre au test.
   - Les fichiers verrou de git (`*.lock`) sont écartés par le `filter` **avant** tout `lstat`. Un verrou qui disparaît pendant la
     copie n'est donc jamais lu, et une copie ne porte jamais un verrou périmé.
   - Le nettoyage reste celui de `T` seul, par le `after` du fichier.
3. **Cas de rejeu sous charge** :
   - Il vérifie que l'environnement git du test lit `maintenance.auto = false`.
   - Il copie 100 fois le dépôt de `generated()` pendant qu'un processus enfant crée et efface en boucle
     `.git/objects/maintenance.lock`. Chaque copie doit résoudre la même tête.
   - Puis `build` sur ce dépôt rend le cas vert de LINT-UNTRACKED.
   - Tueur : `scripts/journal/index.mjs:120` `off.has(h.extract)` -> `false`.

La « copie atomique » proposée par l'item (copie puis renommage) est écartée : la destination n'est lue par personne d'autre. Le
défaut est une source qui change pendant la copie, et les points 1 et 2 le traitent.

## Preuve prévue

- Charge : `node --test test/journal-index.test.ts`, 40 fois, 8 à la fois, sous Node v24.21.0 et git 2.55.0, les versions de la CI
  (git compilé depuis les sources, dans le bloc-notes). Taux d'échec mesuré à la base, puis au gel.
- red-proof : un lot de test seul est vert à la base. L'outil le refusera (« green at base: a self-confirming test »), et le G7 le
  consignera. L'oracle est alors la mesure de charge, plus le cas de rejeu lancé avec l'ancienne copie (`cpSync` sans filtre), qui
  doit rougir sous Node 24. RED-PROOF-TEST-ONLY-1 est un lot distinct.
- Suite complète, puis R-25 par `r25()`, qui doit rester ≤ 547.

## Taille

Attendu : environ 25 lignes de test. Les docs sont hors compte R-25.
