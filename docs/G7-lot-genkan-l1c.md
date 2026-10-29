# G7 du lot 1c de Genkan, partie 1 : les enregistrements d'axiomes de `main` et de chaque théorème, écrits depuis le noyau construit et lus par l'audit

- **Base** : `b116393f`. **PR** : #346, branche `lot/genkan-l1c`, tête `bfee742d`, un commit. **Fusion au tronc** : `57f03e43`, tronc
  avant fusion `b116393f`.
- **Plan** : partie 1 de Genkan, lot 1c (item GENKAN-AXIOMS-ALL-1), sous l'accord du fondateur pour la partie (2026-10-28 16:38 UTC)
  et sa directive du 2026-10-29 03:40 UTC. La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

- `apps/genkan/scripts/records.mjs` (neuf ; modules intégrés de Node seuls) demande les racines à l'audit (`audit.mjs --roots` :
  `Main main`, puis chaque théorème des deux fichiers de théorèmes avec son module). Il écrit une source Lean sur l'entrée standard de
  `lake.mjs env lean --stdin` : un `import` par module, une fois chacun dans l'ordre de première apparition, puis un `#print axioms` par
  racine. Si Lean sort à 0, il écrit sa sortie dans `--out`, octet pour octet. Sortie 2 : un argument inconnu ou répété, un `--out`
  manquant, vide ou sur le disque C. Sortie 1, avant que Lean ne tourne : une ligne de racine qui n'est pas `<module> <nom>`, dont le
  module n'est pas `Main`, `Genkan` ou l'un de ses modules simples, ou dont le nom n'est pas simple (composantes ASCII pointées). Si
  l'audit ou Lean échoue, ce qu'ils ont imprimé va sur stderr et rien n'est écrit.
- `apps/genkan/scripts/audit.mjs` :
  - `--source-only` juge les sources seules, et sa ligne de succès le dit ;
  - `--roots` imprime les racines dont les enregistrements sont dus et sort à 0 quoi que tiennent les sources ;
  - ces deux modes et `--axioms-from` s'excluent ;
  - nu, l'audit exige les enregistrements : aucun n'est donné, `main` n'en a pas, l'audit échoue ;
  - le mot `private` est refusé dans les deux fichiers de théorèmes : le nom d'un théorème privé est déformé, et `#print axioms` ne le
    trouve pas sous son nom écrit (mesuré).
- CI, job `g3-genkan`, dans cet ordre : `audit.mjs --source-only` avant que Lean ne tourne ; la construction ;
  `records.mjs --out "$RUNNER_TEMP/genkan/axioms.txt"` ; `audit.mjs --axioms-from` sur ce fichier ; les tests, ceux du noyau sous la
  chaîne épinglée (`ELAN_HOME`). `scripts/oracle/run.mjs` retire des gates locales ces deux commandes, sur les chemins du runner
  seulement (`CI_ONLY`), comme la construction.
- Tests :
  - `apps/genkan/test/records.test.ts` (neuf, 3 tests) : `records.mjs` mené par des enfants factices, sans Lean, dont un `--out`
    qu'on ne peut écrire, un drapeau inconnu suivi d'une valeur, le disque C après une espace et, sous Windows, depuis un répertoire
    courant sur C ;
  - `apps/genkan/test/records.kernel.test.ts` (neuf, 2 tests, `test:genkan` seul) : les trois vrais scripts sous Lean 4.32.1, sur un
    noyau planté et sur le vrai noyau ;
  - `apps/genkan/test/audit.test.ts` : 2 tests neufs (les modes, `private`), et le cas (7) de `audit_refuses_foreign_axiom` suit la
    règle nue ;
  - `test/oracle-run.test.ts` : 1 test neuf (les deux commandes `CI_ONLY` et leurs quasi-homonymes) ; le test du job s'allonge des
    deux commandes et épingle sa composition dans le vrai `ci.yml` : l'audit des sources avant que Lean ne soit chargé, la
    construction, les enregistrements, leur audit, et `ELAN_HOME` dans l'env de l'étape des tests ;
  - `apps/genkan/test/export.test.ts` nomme `records.mjs`.
- Hors du paquet et de la CI, seules des lignes tueuses changent (`test/bell-handoff-perms.test.ts`, `test/test-count-check.test.ts`,
  `test/verifier-tool-ci.test.ts` : les lignes de `ci.yml` sous le job descendent de 7), avec les deux enregistrements de tests.

## Écarts au plan

- **La preuve de clôture de GENKAN-AXIOMS-ALL-1.** L'item demandait « un noyau dont seul l'enregistrement montre l'axiome ». Le noyau
  planté du test porte aussi le mot `native`. Depuis le lot 1b, toutes les formes mesurées qui ajoutent un axiome sur la chaîne épinglée
  portent un mot banni (`native`, `config`, `native_decide`, `set_option`) : aucune forme sans mot n'est connue. Le test prouve ceci :
  le refus par l'enregistrement est une ligne à elle (`audit: main: foreign axiom big._native.decide.ax_1`), à côté de celle du mot
  (`audit: Main.lean:2: banned native`), et chacune fait échouer l'audit seule. La composition (construction, enregistrements, audit des
  enregistrements) est celle de `g3-genkan`. La recherche d'une forme sans mot est l'item neuf GENKAN-RECORD-ONLY-1.
- **Le mode nu.** Le lot 1b passait un noyau sans théorème, nu. Nu, l'audit exige désormais les enregistrements, et le cas (7) du
  test le dit.
- **La règle du nom simple de `records.mjs`**, ajoutée en cours de lot après lecture du code. L'audit garde les guillemets d'un nom de
  théorème, et un nom entre guillemets peut tenir un saut de ligne, une espace et un `#` (mesuré). Lean exécute une commande écrite
  après `#print axioms` sur la même ligne (mesuré : `#print axioms #eval(IO.println<|"injected")` imprime `injected`). Sur la chaîne
  entière, sans la règle, un théorème nommé sur trois lignes n'exécute rien : le guillemet replie les lignes en un seul nom, inconnu,
  sortie 1, rien d'écrit (mesuré). La règle ne ferme donc pas une faille qui marchait ; elle borne l'entrée de Lean à des lignes
  `import <module>` et `#print axioms <nom simple>`. Sondes, sur Lean 4.32.1, le 2026-10-29 entre 05:27 et 05:32 UTC (sha256,
  huit premiers chiffres) : `names.lean` `64377faf`, `inject.lean` `6d185ff6`, `inject2.lean` `4e0e60d4`, `plain.lean` `00fa958b` ;
  le noyau de sonde, `Main.lean` `27a5e912`, `Genkan/Theorems.lean` `56cf1176`, `lakefile.lean` avec `lean_lib Genkan` `f8a2309e` ;
  `records.mjs` sans la règle `55d0b685`, avec la règle `37067b25` (celui du lot) ; le relevé `5f509cd2`.
- **Les noms des tests.** Le plan (§6, ligne de L1c) mettait les cas `private` dans `audit_refuses_banned_construct`. Ils ont leur
  propre test, `audit_refuses_private_in_theorem_files`. Quatre tests s'ajoutent à ceux que le plan nomme :
  `records_writes_nothing_when_lean_fails`, `records_refuses_bad_arguments_and_bad_roots`, `records_kernel_passes_the_real_kernel` et
  `oracle_ci_only_withdraws_the_two_records_steps_of_the_genkan_job`.
- **`export.test.ts`** est vert à la base aussi : le dossier `apps/genkan/scripts` est exporté en entier depuis le lot 1a ; l'entrée
  épingle le fichier par son nom.

## Vérification

- Sur l'arbre du commit (empreinte des changements `2bcdb67b…`) : red-proof, les 10 tests jugés rouges à la base par une assertion et
  verts ici, les 3 tueurs tirés tués (`RED-PROOF.json` `89b6a9ac…`) ; eslint et tsc propres ; le diff reste dans la zone déclarée.
- Mutants, en trois campagnes :
  - la première, sur un arbre qui ne différait du commit que par des lignes de test : 239 mutants, 235 tués (`RESULTS.json`
    `79f4f6d1…`). Les deux survivants, RC-8 et son tueur K35, étaient le même mutant, équivalent : `NAME`, ancré, refuse déjà toute
    espace que `(.+)$` laissait dans le second champ. RC-8 est devenu le mutant qui ôte l'ancre de fin, que trois lignes de la
    partie (3) de `records_refuses_bad_arguments_and_bad_roots` tuent ;
  - une sonde de 11 lignes neuves de la table, sur des règles que le lot ajoute ou déplace et qu'aucun mutant ne visait : 6 tuées,
    5 survivantes (`RESULTS.json` `e6cf4ed3…`). Les cinq : l'argument inconnu suivi d'une valeur, le disque C après une espace, le
    répertoire courant sur C, le `--out` qu'on ne peut écrire, l'audit nu à l'étape des sources. Chacune est tuée depuis par un cas de
    test neuf ; CY-5 (l'`ELAN_HOME` de l'étape des tests) s'y est ajouté ;
  - la dernière, sur l'arbre du commit : 257 mutants, 255 tués, aucun survivant ; les 2 non conclus sont les tueurs de `bell_handoff_permissions_on_linux` et de `oracle_lock_alive_reads_a_zombie_as_dead`, deux tests sautés sous Windows, comme aux lots 1a et 1b (`RESULTS.json` `d97466f3…`).
  Les deux tueurs du test du noyau (`audit.mjs` l.482, `records.mjs` l.80) sont hors des globs des campagnes (`!(*.kernel)`) : AU-60
  porte le mutant de l.482 et RC-17 celui de l.80.
- Sur la branche : `test:main` vert (3363 tests, 3316 passés, 0 échec, 47 sautés) ; les enregistrements de tests égaux à ce passage (336 fichiers, 3363 tests).
- CI de #346 : 15 contrôles sur 15 verts à `bfee742d` (run 40880088108).
- Rejeu Windows à la fusion : les fichiers de test que le lot change, 50 tests, 48 réussis, 0 échec, 2 sautés (les deux tests réservés à Linux).
- Oracle G7 sur `57f03e43`, base `b116393f` : vert, 14 gates sur 14 (enregistrement `57f03e4384199017201d17bff1ab9414cd8c74f6-G7-20261029T132604Z-10892.json`, sha256 `9569f749…`) ; 3363 tests, 3316 réussis, 0 échec, 47 sautés ; 980 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run
  test:genkan` a joué les deux tests du noyau sous la chaîne épinglée (`ELAN_HOME`) : 13 tests, 13 réussis, 0 sauté, dont `records_kernel_refuses_the_planted_native_axiom` et `records_kernel_passes_the_real_kernel`.

## Ce qui reste

- **GENKAN-THEOREM-NAMES-1** (neuf) : `--source-only` passe un nom de théorème entre guillemets dans un fichier de théorèmes.
  `records.mjs` le refuse avant que Lean ne tourne, et la CI échoue à l'étape des enregistrements. Mais la forme de l'audit
  (`Genkan.«a»`) n'est pas celle de l'enregistrement de Lean (`Genkan.a`, mesuré). Construction : une règle de source qui refuse, dans
  les fichiers de théorèmes, un nom de théorème qui n'est pas simple, avec les tests du modèle de `private`. Déclencheur : avant le lot 2.
- **GENKAN-RECORD-ONLY-1** (neuf) : chercher, sur la chaîne épinglée, une forme qui ajoute un axiome étranger sans mot banni
  (tactiques d'`Init` et leurs configurations, attributs, instances, `deriving`, théorèmes d'`Init` qui dépendent déjà d'un tel
  axiome). Si une forme est trouvée, l'audit gagne son mot, et le test du noyau la plante comme noyau que seul l'enregistrement refuse.
  Déclencheur : la G2 de la partie 1.
- **GENKAN-PANIC-1** et **GENKAN-MAIN-IO-1** restent ouverts (`docs/ETAT.md`). Déclencheur : avant le lot 2 et au lot 2.
- Les lots 2 à 7 de la partie et la G2 de la partie.
