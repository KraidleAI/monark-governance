# G7 du lot 1b de Genkan, partie 1 : l'audit des sources Lean du noyau et de ses enregistrements d'axiomes

- **Base** : `1c8208cc`. **PR** : #343, branche `lot/genkan-l1b`, tête `1ae353a0`, trois commits : `0f44c91a` (le lot), `90db661c` (le
  correctif de la seconde revue de sécurité), `1ae353a0` (le tronc `9d4b13a9` fusionné). **Fusion au tronc** : `a8031e89`, tronc avant
  fusion `9d4b13a9`.
- **Plan** : partie 1 de Genkan, lot 1b, sous l'accord du fondateur pour la partie (2026-10-28 16:38 UTC). La relecture des lots de la
  partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

- `apps/genkan/scripts/audit.mjs` (neuf ; modules intégrés de Node seuls, il ne lance jamais Lean ni lake) lit chaque `.lean` du
  dossier du noyau, en toute casse, hors du seul dossier de construction `.lake` de sa racine. Son lexeur suit la chaîne épinglée :
  commentaires imbriqués, chaînes, chaînes brutes, caractères, noms entre guillemets, et les parties de code des chaînes interpolées,
  celle de `dbg_trace` comprise. En position de code, il refuse :
  - un ouvrant collé à un caractère ;
  - un mot banni, comme nom d'une seule composante : parmi eux `init`, `builtin_init`, `export`, `set_option`, `native`, `config`,
    `dbg_trace`, `idbg` et les six termes nommés de la forme de `throwNamedError` ;
  - les douze autres axiomes de Lean 4.32.1 et les six fonctions de débogage d'`Init`, comme composante de tout nom ;
  - une commande `#` autre que `#check` et `#print`, tout `skipKernelTC`, un théorème hors de `Genkan/Theorems.lean` et
    `Genkan/Vectors.lean` ;
  - un import autre que `Genkan` et ses modules simples.

  Puis il refuse tout `lakefile.toml` et un `lakefile.lean` dont le sha256 n'est pas l'épinglé. Avec des enregistrements
  (`--axioms-from`, la sortie de `#print axioms`), `main` et chaque théorème des deux fichiers de théorèmes en ont un, dans `propext`,
  `Classical.choice` et `Quot.sound`.
- `apps/genkan/test/audit.test.ts` (neuf, 3 tests) : l'ensemble exact des constats sur un noyau planté, chacun à son fichier et à sa
  ligne ; les mêmes mots là où l'audit passe (commentaires, chaînes, quasi-homonymes) ; le `lakefile.lean` épinglé ; les enregistrements,
  celui de `main` compris. Le noyau planté porte mot pour mot les sondes mesurées sur la chaîne épinglée.
- CI : `g3-genkan` lance la partie source de l'audit d'abord, avant que Lean ne tourne. Aucune étape n'écrit encore les enregistrements.
- Hors du paquet et de la CI, seules des lignes tueuses changent (`test/bell-handoff-perms.test.ts`, `test/test-count-check.test.ts`,
  `test/verifier-tool-ci.test.ts`), avec les deux enregistrements de tests.

## Écarts au plan

- L'audit passe avant la construction dans `g3-genkan`, et non après : un module planté ne tourne pas avant d'être lu (un `@[init]`
  exécute son code à la compilation d'un module qui l'importe, mesuré).
- L'enregistrement de `main` est exigé en plus de celui de chaque théorème. La configuration d'une tactique peut ajouter un axiome
  qu'aucun mot ne montre (le mode natif de `decide`, mesuré) ; l'enregistrement de `main` le voit. Les règles de source filtrent, les
  enregistrements décident.

## Vérification

- Sur l'arbre du second commit (empreinte des changements `e7b3f24c…`) : red-proof, les 3 tests jugés rouges à la base par une assertion
  et verts ici, les 3 tueurs tirés tués (`RED-PROOF.json` `a84d527f…`) ; mutants : 135, 50 sur `audit.mjs` (la table et les tueurs du
  test), 9 sur `ci.yml`, 76 venus des autres tueurs des tests touchés ; 134 tués, 0 survivant, 1 non conclu (le tueur de
  `bell_handoff_permissions_on_linux`, test Linux sauté sous Windows, tué au rejeu de tout l'ensemble) (`RESULTS.json` `4d9307db…`) ;
  eslint et tsc propres.
- Sur la branche, le tronc fusionné : `test:main` vert (3357 tests : 3310 réussis, 0 échec, 47 sautés) ; les enregistrements de tests
  égaux à ce passage (335 fichiers) ; le lot reste dans sa zone.
- CI de #343 : 15 contrôles sur 15 verts à `1ae353a0` (run 40810846496).
- Rejeu Windows à la fusion : les cinq fichiers de test que le lot change, 20 tests, 19 réussis, 0 échec, 1 sauté.
- Oracle G7 sur `a8031e89`, base `9d4b13a9` : vert, 14 gates sur 14 (enregistrement
  `a8031e894a304dd1dfb29b18f4da666d8fc7766f-G7-20261029T034358Z-45916.json`, sha256 `d740bf4f…`) ; 3357 tests, 3310 réussis, 0 échec,
  47 sautés ; 1006 lignes changées au compte de R-25 (borne 1205). La gate neuve de l'audit, sur le vrai noyau : 2 fichiers Lean,
  0 théorème, aucun constat.

## Ce qui reste

- **GENKAN-AXIOMS-ALL-1** : aucune étape n'écrit encore les enregistrements d'axiomes, seul le test en donne à l'audit. Un lot 1c les
  écrit après la construction (`#print axioms main` et une ligne par théorème) et les donne à l'audit, en CI et en local
  (`docs/ETAT.md`). Déclencheur : avant le lot 2, premier module du noyau après `Main`.
- **GENKAN-PANIC-1** : mesurer `panic!` et les accès qui paniquent (`get!`, `xs[i]!`) dans le code compilé, puis les refuser dans le
  noyau ou prouver qu'ils ne sont pas atteints (`docs/ETAT.md`). Déclencheur : avant le lot 2.
- **GENKAN-MAIN-IO-1** : borner les entrées et sorties de `Main` à l'entrée et à la sortie standard, et refuser ailleurs `IO.Process`,
  `IO.FS` et le réseau (`docs/ETAT.md`). Déclencheur : le lot 2.
- Le lot 1c, puis les lots 2 à 7 de la partie et la G2 de la partie.
