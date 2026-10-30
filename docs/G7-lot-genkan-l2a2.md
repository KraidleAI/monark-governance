# G7 du lot 2a de Genkan, partie 1, seconde PR : les règles de l'audit qui bornent les effets du noyau à l'entrée et à la sortie standard

- **Base** : `bb760f8d`. **PR** : #351, branche `lot/genkan-l2a`, tête `ad39591d`, deux commits sur le tronc `bb760f8d` : le lot
  (`756a4479`) et les enregistrements de tests (`ad39591d`). **Fusion au tronc** : `a99292da`, tronc avant fusion `bb760f8d`.
- **Plan** : partie 1 de Genkan, lot 2a (item GENKAN-MAIN-IO-1), sous l'accord du fondateur pour la partie (2026-10-28 16:38 UTC) et
  sa directive du 2026-10-29 03:40 UTC. C'est la seconde des deux PR du lot sous une rangée de zone ; la première, #350, a porté les
  formats du noyau. La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que la PR livre

- `apps/genkan/scripts/audit.mjs`, dans tous les fichiers du noyau sauf `lakefile.lean` :
  - un nom dont la première composante (lue sans guillemets, après un `_root_` initial) est `IO`, `EIO`, `BaseIO`, `EST`, `ST` ou
    `System` est refusé ;
  - le sont aussi un nom dont une composante est `timeit`, `allocprof`, `unsafeIO`, `unsafeEIO` ou `unsafeBaseIO`, la tête
    `println!`, et un point initial qui n'est pas collé après un terme (`.getStderr` contre le type attendu `IO _` nomme
    `IO.getStderr` sans écrire `IO`) ;
  - `Main.lean` seul (son nom en toute casse) peut écrire les quatre jetons `IO`, `IO.getStdin`, `IO.getStdout` et `IO.FS.Stream`,
    écrits ainsi ; il y refuse `open` et `namespace`, et un `main` qui n'est pas déclaré `def main : IO UInt32` ;
  - les constats d'un fichier s'impriment par ligne, puis par texte.
- `apps/genkan/README.md` dit ces règles, et qu'elles ne lisent que les sources : avant `main`, la bibliothèque `Init` que le noyau
  lie exécute son propre initialiseur de `IO.stdGenRef`, qui amorce un générateur aléatoire par `IO.getRandomBytes 8`.
- `scripts/lang-exempt.json` et `docs/adr/ADR-M004-infrastructure-plateforme.md` : le nom de monade Lean `EST`, que `lang:gate` lit
  comme le mot français « est », est exempté, avec l'addendum D7 quattuordecies. Le masque respecte la casse : seul le jeton entier
  `EST` est masqué.
- Tests :
  - `audit_bounds_main_io_to_stdin_and_stdout` (neuf) : 43 constats à leur fichier et à leur ligne exacts dans un `Main.lean` et un
    `Genkan/Bytes.lean` ; les mêmes constats avec l'enregistrement de `main` et sans rien ; `--roots` inchangé ; la forme de `main`
    lue sur les jetons (un lieur, `IO Unit`, aucun `main`, un `abbrev`, `_root_.IO`, un `main.lean` en minuscules).
  - `audit_refuses_banned_construct` : ses sondes et ses rangées qui écrivent un nom `IO` ou `println!` hors de `Main.lean` portent
    aussi ce constat (8 dans les sondes, 6 dans son noyau).
  - Deux tests changent de fixtures, pas d'affirmations (écarts ci-dessous).
  - Les lignes tueuses qui nomment `audit.mjs` suivent ses nouveaux numéros.

## Mesures

- Le vrai noyau passe les nouvelles règles : `audit.mjs --source-only`, 5 fichiers Lean, aucun constat.
- Sans le terme `EST`, `lang:gate` trouve 6 occurrences dans le lot et sort 1 ; avec lui, il sort 0 (mesuré à 22:1x UTC sur la
  branche).
- La sonde de l'IR de la première PR, faite sur le noyau du commit `9b4a1660`, vaut pour celle-ci : elle ne change aucun fichier de
  `apps/genkan/kernel/`.

## Écarts au plan

- Le lot passe en deux PR sous la rangée de zone qui en annonçait une : le lot entier comptait 1244 lignes pour R-25 (borne 1205) ;
  celle-ci en compte 313.
- La rangée de zone complémentaire, posée avant le premier commit, ajoute `scripts/lang-exempt.json` et l'addendum d'ADR-M004 : le nom
  `EST` rougissait `lang:gate` dans les tests du lot.
- L'ordre des constats : `auditFile` rend ceux d'un fichier par ligne, puis par texte, et l'en-tête de `audit.mjs` le dit. C'est le
  choix 7 de l'instance du code, hors des six règles : un cas du test neuf (« main of `_root_.IO` ») attend ses deux lignes de la
  ligne 2 triées, quand les jetons les donnent dans l'autre ordre. Aucun constat ni aucun compte ne change, et les autres tests qui
  lisent la sortie d'erreur ligne à ligne passent.
- Deux tests changent de fixtures pour les nouvelles règles, pas d'affirmations : `audit_refuses_foreign_axiom` (son noyau réduit à
  `Main.lean` déclare `def main : IO UInt32 := pure 3`) et `audit_refuses_panics_in_the_kernel` (ses `main` écrivent
  `(← IO.getStdout).putStrLn` au lieu de `IO.println`, et son noyau propre perd la rangée qui écrivait `println!` hors de
  `Main.lean`). Verts à la base, red-proof les refuse comme des tests qui se confirment eux-mêmes ; ils sont déclarés ici, et leurs
  lignes tueuses sont tuées par les mutants.
- Correction de l'orchestrateur avant le commit : l'addendum d'ADR-M004 citait les lignes du fichier des tests tel que l'instance des
  tests l'a livré (l.827 et l.850) et une occurrence à venir dans `audit.mjs` ; il porte aussi la mesure sur le lot livré.

## Vérification

- Sur la branche (`ad39591d`, sur le tronc `bb760f8d`) :
  - `test:main` vert : 3411 tests, 3364 réussis, 0 échec, 47 sautés ; les enregistrements de tests égaux à ce passage (342 fichiers,
    3411 tests), et `test-count-check` contre le tronc ne trouve aucune perte ;
  - `test:genkan` sous la chaîne épinglée (`ELAN_HOME`) : 21 tests, 21 réussis, 0 sauté ;
  - red-proof contre `bb760f8d` : des 4 tests jugés, 2 sont rouges à la base par une assertion et verts ici
    (`audit_refuses_banned_construct`, `audit_bounds_main_io_to_stdin_and_stdout`), et ses 2 tueurs tirés sont tués ; il refuse les
    deux tests déclarés, verts à la base, et eux seuls (`RED-PROOF.json` `7d6152bf…`) ;
  - mutants des lignes tueuses : 27, tous tués, aucun survivant, aucun non conclu, dont celles des deux tests déclarés
    (`RESULTS.json` `b231ccba…`) ;
  - eslint et tsc propres ; `lang-gate`, `gate:vocab` et `export:check` passent ;
  - lot-check, sortie 0 : le diff reste dans la zone déclarée ; les 25 fichiers de test hors de la zone qui nomment un fichier de la
    zone (la plupart par le nom `README.md`) sont inchangés et passent dans `test:main`.
- CI de #351 : 15 contrôles sur 15 verts à `ad39591d` (run 40965324794, et l'analyse CodeQL, run 40965319393).
- Rejeu Windows à la fusion : les 2 fichiers de test que la PR change (`audit.test.ts`, `records.kernel.test.ts`), sous la chaîne
  épinglée : 12 tests, 12 réussis, 0 échec.
- Oracle G7 sur `a99292da`, base `bb760f8d` : vert, 14 gates sur 14 (enregistrement
  `a99292daf31c1d5485ac9a9e6e8956be2c9b94e3-G7-20261030T003347Z-41508.json`, sha256 `b7ebde91…`) ; 3411 tests, 3364 réussis, 0 échec,
  47 sautés ; 313 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les tests du noyau sous la
  chaîne épinglée (`ELAN_HOME`) : 21 tests, 21 réussis, 0 sauté.

## Ce qui reste

- **GENKAN-MAIN-IO-1** se clôt avec cette PR, dans `docs/ETAT.md`.
- Le lot 2a est complet ; sa rangée de zone se ferme, à deux PR.
- **GENKAN-PANIC-2** (déclencheur : le lot 2b), **GENKAN-PANIC-3** (le lot 4) et **GENKAN-RUNTIME-1** (le lot 3b) restent ouverts.
- **HARNESS-VERIFY-TLS-FLAKE-1** reçoit son prix dans `docs/ETAT.md`, sur la remarque de HIKAE : une mesure sous un passage complet,
  puis environ 15 lignes et un cas. Il reste ouvert.
- Le lot 2b : `mutants.mjs` et `decoder_mutants_killed`, les modes `--modules`, `--replay` et `--reach` de `records.mjs`.
- Les lots 3a à 7 de la partie et la G2 de la partie.
