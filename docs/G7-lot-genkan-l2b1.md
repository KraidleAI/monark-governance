# G7 du lot 2b de Genkan, partie 1, première PR : les mutants du décodeur, et le rejeu de chaque module du noyau par le `leanchecker` de la chaîne épinglée

- **Base** : `8824d25d`. **PR** : #354, branche `lot/genkan-l2b1`, tête `3829d7b4`, deux commits sur le tronc `8824d25d` : le lot
  (`12bb13aa`) et les enregistrements de tests (`3829d7b4`). **Fusion au tronc** : `928895ae`, tronc avant fusion `3332e7ab` (le tronc
  `8824d25d` et le premier lot de pli de Hikae, #352, qui ne touche que `packages/hikae/test/suivi-mc.test.ts`).
- **Plan** : partie 1 de Genkan, lot 2b (le test `decoder_mutants_killed` de la rangée L2, et l'item GENKAN-REPLAY-1), sous l'accord
  du fondateur pour la partie (2026-10-28 16:38 UTC) et sa directive du 2026-10-29 03:40 UTC. Le lot 2b passe en deux PR, chacune
  sous sa rangée de zone : celle-ci, 2b-i ; la seconde, 2b-ii, porte le mode `--reach` de `records.mjs` (GENKAN-PANIC-2). La
  relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que la PR livre

- `apps/genkan/scripts/records.mjs --replay` : il liste les modules du noyau par `audit.mjs --modules`, tient chaque nom à la forme
  d'un module et refuse une liste vide avant tout enfant Lean, puis lance `lake.mjs env leanchecker <module>` pour chacun, relaie sa
  sortie et s'arrête au premier refus ; sur un succès, il imprime `records: <N> modules replayed by leanchecker` et n'écrit aucun
  fichier. `--out` et `--replay` s'excluent, et l'un des deux est requis. Le rejeu revérifie chaque déclaration d'un module dans le
  noyau de Lean contre l'environnement de ses imports : il détecte la manipulation d'environnement ; ce n'est pas un vérificateur
  externe.
- `apps/genkan/scripts/audit.mjs --modules` : une ligne par module du noyau (chaque fichier Lean sauf `lakefile.lean`, son chemin sans
  `.lean`, une barre lue comme un point), dans l'ordre de la marche, imprimée avant toute lecture de fichier ; sortie 0.
- `.github/workflows/ci.yml`, job `g3-genkan` : le rejeu tourne juste après la construction ; l'étape de la requête vide donne
  `/dev/null` au noyau ; le commentaire du job tient en quatre lignes. `scripts/oracle/run.mjs` retire de la passe locale de l'oracle,
  comme étapes du runner, l'étape du rejeu et la nouvelle forme de l'étape de la requête vide.
- `apps/genkan/README.md` et `apps/genkan/package.json` disent le rejeu.
- Tests :
  - les mutants du décodeur : `apps/genkan/test/helpers/mutants.ts` (neuf) écrit les mutants d'une source Lean par huit opérateurs, en
    position de code seulement (un littéral décimal n vers n + 1 et n - 1, `<` vers `≤` et retour, `==` vers `!=`, `&&` vers `||` et
    retour, `some <atome>` vers `none` hors d'un motif de `match`), un mutant par position et par opérateur ;
  - `mutants_operators_are_exact` (`mutants.test.ts`, neuf) : 22 mutants listés à la main, chacun des huit opérateurs présent, le texte
    de chaque mutant vérifié à sa place ; une source vide n'en donne aucun ;
  - `decoder_mutants_killed_in_bytes` et `decoder_mutants_killed_in_format` (`mutants.kernel.test.ts`, neuf) : chaque mutant de
    `Genkan/Bytes.lean` et de `Genkan/Format.lean` qui se construit doit répondre à une entrée des formats autrement que le vrai noyau,
    ou dépasser son délai. Les 4 qu'aucune entrée ne distingue sont listés dans `apps/genkan/kernel/vectors/mutants-equivalent.json`,
    chacun avec le sha256 de son fichier source et sa raison ; chaque entrée doit répondre à un survivant et chaque survivant à une
    entrée. Un mutant de `Format.lean` (`n < 10` vers `n < 9`) est tué par une entrée écrite pour lui, un TRANSFER de montant 9, dont la
    réponse par les formats est écrite à côté ;
  - `audit_modules_lists_each_kernel_module` (`audit.test.ts`, neuf) ;
  - `records_replays_each_module_with_leanchecker`, `records_replay_stops_at_the_first_refusal` et
    `records_replay_refuses_bad_arguments_and_bad_modules` (`records.test.ts`, neufs), sur un faux `lake` qui enregistre ses appels ;
  - `replay_refuses_the_planted_environment_hack`, `replay_refuses_an_unbuilt_module` et `replay_passes_the_real_kernel`
    (`records.kernel.test.ts`, neufs), sous la chaîne épinglée : un module planté qui se construit, et dont `#print axioms` se lit
    propre, est refusé par le rejeu ;
  - `oracle_ci_only_withdraws_the_replay_step_of_the_genkan_job` (`test/oracle-run.test.ts`, neuf) ; les étapes du runner du job, dans
    le test voisin, tiennent maintenant le rejeu ;
  - `export_omits_lake_build` liste le nouveau fichier de vecteurs ;
  - chaque test neuf porte sa ligne tueuse ; les lignes tueuses qui nomment les scripts changés suivent leurs nouvelles lignes.

## Mesures

- Les mutants du décodeur, sous la chaîne épinglée : `Bytes.lean`, 59 écrits, 9 ne se construisent pas, 47 tués, 3 survivants ;
  `Format.lean`, 56 écrits, 2 ne se construisent pas, 53 tués, 1 survivant. Durées sous Windows, sur la passe de `test:genkan` de la
  vérification : 221,9 s et 189,1 s, soit 3,76 s et 3,38 s par mutant.
- Le même générateur écrit 75 mutants pour `Genkan/Sha256.lean` et 12 pour `Main.lean`, que ce lot ne mute pas (item ci-dessous).
- Le rejeu par `leanchecker` passe sur le vrai noyau (`replay_passes_the_real_kernel`) et refuse le module planté.
- Sous Linux, sur la CI de #354 (run 41011367077) : le job `g3-genkan` dure 4 min 1 s, sous son `timeout-minutes` de 20 ; le rejeu
  par `leanchecker`, 4 modules, 4,3 s ; les mutants, 114,6 s pour `Bytes.lean` et 89,0 s pour `Format.lean`, soit 1,94 s et 1,59 s
  par mutant ; `test:genkan`, 31 tests, 31 réussis, en 204,2 s.

## Écarts au plan

- Le lot 2b passe en deux PR, chacune sous sa rangée de zone : celle-ci compte 1201 lignes pour R-25 (borne 1205) ; `--reach`
  (GENKAN-PANIC-2) va à la seconde, 2b-ii.
- La rangée L2 du plan nomme `scripts/mutants.mjs` ; le générateur est `apps/genkan/test/helpers/mutants.ts`, du côté des tests, et le
  test `decoder_mutants_killed` du plan est coupé en deux par fichier (`_in_bytes`, `_in_format`), sur la mesure de leurs durées.
- `Genkan/Sha256.lean` et `Main.lean` ne sont pas mutés : item ci-dessous, avec son prix mesuré.
- Deux tests vérifiés verts à la base sont déclarés ici, et eux seuls : `mutants_operators_are_exact`, qui ne demande aucun changement
  hors du dossier des tests (son module `test/helpers/mutants.ts` est copié dans la base avec les tests), et
  `oracle_ci_only_withdraws_the_two_records_steps_of_the_genkan_job`, que cette PR ne change pas : le diff place le test neuf, ajouté
  juste après lui, dans son corps, et son bloc est le même en octets à la base et ici (sha256 `d059df96…`). La spec attendait aussi
  vertes à la base les deux moitiés de `decoder_mutants_killed` ; elles y sont rouges par une assertion (« the list of equivalent
  mutants must exist ») : `mutants-equivalent.json` est du côté du noyau et n'existe pas à la base.
- Les lignes tueuses des onze tests neufs sont écrites par l'orchestrateur, comme la mission des tests le lui laissait. Un premier
  commit du lot les avait omises ; il n'a pas été poussé : le lot a été repris au tronc et commité de nouveau avec elles (`12bb13aa`).
  Les lignes tueuses des scripts changés ont été recalées par l'outil des tueurs : 52 réécrites dans 4 fichiers, aucune ambiguë.
- Les choix de l'instance du code, là où la spec en laissait un : (1) `--modules` imprime juste après la marche, avant toute lecture
  de fichier ; (2) le nom d'un module se calcule comme celui de `--roots` ; (3) dans `run.mjs`, l'alternative du rejeu est groupée
  avec celle de la construction sous un seul préfixe, pour que les tueurs de `oracle-run.test.ts` gardent leur texte une fois sur leur
  ligne ; (4) l'exclusion des deux modes de `records.mjs` se juge après la lecture des arguments, et le rejeu est une fonction appelée
  de `main()` qui garde les codes de retour ; (5) le commentaire du job tient en quatre lignes : « measured job wall-time » y devient
  « measured wall-time » ; (6) le README dit d'un module qu'il est « named by its path ».
- Mutants des lignes tueuses : 1 non conclu, le tueur de `oracle_lock_alive_reads_a_zombie_as_dead`, qui lit `/proc` et que Windows
  saute.

## Vérification

- Sur la branche (`3829d7b4`, sur le tronc `8824d25d`) :
  - `test:main` vert : 3417 tests, 3370 réussis, 0 échec, 47 sautés ; les enregistrements de tests égaux à ce passage (343 fichiers,
    3417 tests), et `test-count-check` contre le tronc ne trouve aucune perte ;
  - `test:genkan` sous la chaîne épinglée (`ELAN_HOME`) : 31 tests, 31 réussis, 0 échec, 0 sauté ;
  - red-proof contre `8824d25d` : des 13 tests jugés, 11 sont rouges à la base par une assertion et verts ici, et ses 2 tueurs tirés
    sont tués ; il refuse les deux tests déclarés, verts à la base, et eux seuls (`RED-PROOF.json` `5967fa47…`) ;
  - mutants des lignes tueuses des fichiers de test que la PR change, sur l'arbre exact de `3829d7b4` : 141, 140 tués, aucun
    survivant, 1 non conclu (ci-dessus) ; la passe de base est verte sur 45 fichiers de test (`RESULTS.json` `86a73ddc…`) ;
  - eslint et tsc propres ; `lang-gate`, `gate:vocab` et `export:check` passent ;
  - lot-check, sortie 0 : le diff reste dans la zone déclarée ; les 50 fichiers de test hors de la zone qui nomment un fichier de la
    zone (la plupart par son nom de base) sont inchangés et passent dans `test:main`.
- CI de #354 : 15 contrôles sur 15 verts à `3829d7b4` (run 41011367077, et l'analyse CodeQL, run 41011363355), lue après la fin
  de la passe.
- Rejeu Windows à la fusion : les fichiers de test que la PR touche hors du noyau (`apps/genkan/test/audit.test.ts`,
  `apps/genkan/test/export.test.ts`, `apps/genkan/test/mutants.test.ts`, `apps/genkan/test/records.test.ts`,
  `test/oracle-run.test.ts`), `test/test-count-check.test.ts` et `test/ci-gates.test.ts` : 91 tests, 90 réussis, 0 échec, 1 sauté
  (`oracle_lock_alive_reads_a_zombie_as_dead`, qui lit `/proc`). Ceux du noyau (`apps/genkan/test/mutants.kernel.test.ts`,
  `apps/genkan/test/records.kernel.test.ts`) passent sous la chaîne épinglée dans la gate `test:genkan` de l'oracle G7, sur le même
  arbre.
- Oracle G7 sur `928895ae`, base `3332e7ab` : vert, 14 gates sur 14 (enregistrement
  `928895ae08764945f4a1cefe1db3cd99b3738df3-G7-20261030T070357Z-39828.json`, sha256 `9c1b7d55…`) ; 3417 tests, 3370 réussis, 0 échec,
  47 sautés ; 1201 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les tests du noyau de Genkan
  sous la chaîne épinglée (`ELAN_HOME`) : 31 tests, 31 réussis, 0 sauté, en 404,2 s, dont 215,1 s et 188,2 s pour les mutants de
  `Bytes.lean` et de `Format.lean`.

## Ce qui reste

- **GENKAN-REPLAY-1** se clôt pour son étape de CI ; sa recherche d'un vérificateur externe devient GENKAN-EXTERNAL-1, dans
  `docs/ETAT.md`.
- Ouverts dans `docs/ETAT.md` par ce G7 : GENKAN-EXTERNAL-1 (déclencheur : le plan du lot 3a), GENKAN-MUTANTS-SHA-MAIN-1
  (`Sha256.lean` et `Main.lean` mutés ; le lot 3b), RED-PROOF-TEST-ONLY-REGISTRIES-1 (placé avec RED-PROOF-PIN-1) et RED-PROOF-BLOCK-ALIGN-1 (le bloc
  d'un test jugé par ses octets, pas par les bornes du diff).
- **GENKAN-PANIC-2** : son déclencheur devient le lot 2b-ii.
- Déclaré pour la suite, sans item : `--fresh` pour `Genkan.Theorems` au lot 3a, quand ce module existera. Lus sur la CI de #354 :
  `leanchecker` rejoue les 4 modules du noyau sous Linux ; le `timeout-minutes` de `g3-genkan`, 20, tient sa durée mesurée, 4 min 1 s,
  et se revoit avec GENKAN-MUTANTS-SHA-MAIN-1 (lot 3b).
- Le lot 2b-ii, puis les lots 3a à 7 de la partie et la G2 de la partie.
