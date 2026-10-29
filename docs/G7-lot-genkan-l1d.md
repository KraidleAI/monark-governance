# G7 du lot 1d de Genkan, partie 1 : l'audit du noyau refuse les paniques et les noms de théorèmes qui ne sont pas simples, et `--source-only` refuse un dossier de construction à la racine du noyau

- **Base** : `16e8697b`. **PR** : #347, branche `lot/genkan-l1d`, tête `69364e97`, un commit. **Fusion au tronc** : `2c8a6ec4`, tronc
  avant fusion `16e8697b`.
- **Plan** : partie 1 de Genkan, lot 1d (items GENKAN-PANIC-1, GENKAN-THEOREM-NAMES-1 et GENKAN-LAKE-DIR-1), sous l'accord du
  fondateur pour la partie (2026-10-28 16:38 UTC) et sa directive du 2026-10-29 03:40 UTC. La relecture des lots de la partie est la
  G2 de la partie, à sa fin.

## Ce que le lot livre

- `apps/genkan/scripts/audit.mjs`, dans tous les fichiers du noyau. Ses règles ne lisent que les positions de code : les
  commentaires, le texte des chaînes et les caractères sont blanchis, et les parties `{...}` d'une chaîne interpolée sont du code.
  - Un `]` collé à `!` (`getElem!`, la seule graphie qui s'analyse) donne `banned ]!`, à la ligne du `]`.
  - Une composante de nom, lue sans ses guillemets, qui porte `!` ou contient `panic` quelle que soit la casse : `get!`, `head!`,
    `toNat!`, `panic!`, `assert!`, `unreachable!`, `get!Internal`, `panicCore`, `sliceOrPanic`, `«PANIC»`, et les formes `!` des
    tactiques (`simp!`, `simp_all!`, `dsimp!`, `simp_arith!`, `simp_all_arith!`, `simpa!`, `grind!`, `getElem!_pos`). Le constat
    nomme la première composante ainsi faite, en partant de la gauche. Deux exemptions :
    - les têtes d'interpolation `s!`, `f!` et `println!` écrites seules (`Foo.s!` et `«s!»` sont refusés) ;
    - le mot collé à un `#`, que la règle des `#` juge déjà.
  - La composante `outOfBounds` est refusée comme les fonctions de débogage.
- Dans les deux fichiers de théorèmes, un théorème dont le nom complet n'est pas simple est refusé à son mot-clé :
  `theorem name <nom> is not plain`. Le nom complet est celui que `--roots` imprime. La règle reprend le littéral `NAME` de
  `records.mjs`, qui refuse une telle racine avant que Lean ne tourne. Un test lit les deux fichiers et compare les deux littéraux.
- `--source-only` refuse une entrée `.lake`, de toute casse, à la racine du noyau : un dossier, un fichier ou un lien, même pendant
  (`audit: <nom>: build dir refused under --source-only`).
  - La CI lance ce mode sur les sources extraites, avant que Lean ne tourne. Un `.lake` à la racine ne peut alors tenir que des
    fichiers du dépôt, que lake réutiliserait et qu'aucune règle ne lit.
  - Les autres modes sautent toujours ce dossier, `--roots` ne change pas, et un `.lake` imbriqué est lu comme avant.
- Tests (`apps/genkan/test/audit.test.ts`), quatre neufs :
  - `audit_refuses_panics_in_the_kernel` plante 36 constats, à leurs lignes. Son noyau propre tient les formes totales (les index en
    `?`, `!` en négation, dans `!=` et après un `]` espacé), les têtes exemptées, les mots dans les commentaires et les chaînes, et les
    voisins d'`outOfBounds`.
  - `audit_refuses_theorem_names_that_are_not_plain`.
  - `audit_name_rule_is_the_records_rule`.
  - `audit_source_only_refuses_the_root_build_dir`.
- Le cas `a!sorry` d'`audit_refuses_banned_construct` passe de son noyau propre à son noyau sale. C'est un seul nom, refusé comme nom
  de panique et jamais lu comme `sorry` ; `a?sorry` reste le témoin propre. `apps/genkan/README.md` dit les nouvelles règles.
- Les nouvelles constantes font descendre les lignes d'`audit.mjs`. Les lignes tueuses qui les nomment suivent : 15 dans
  `audit.test.ts`, 1 dans `apps/genkan/test/records.kernel.test.ts`.

## Mesures avant le code

Sur la chaîne épinglée (Lean 4.32.1), le 2026-10-29 entre 14:51 et 14:56 UTC, avec trois petits noyaux construits par lake (sha256 des
`Main.lean` : `be0fa30b` pour `b[i]!`, `9abcece3` pour `panic!`, `e0ce2383` pour `get!`) :
- `b[i]!` hors bornes, `panic!` et `Option.get!` sur `none` écrivent chacun `PANIC at …` sur stderr. Le programme continue avec la
  valeur par défaut du type (`value 0`) et sort comme si de rien n'était.
- Avec `LEAN_ABORT_ON_PANIC=1`, le premier avorte : sortie `0xC0000409` sous Windows, rien sur stdout.
- L'audit d'avant le lot passait les trois noyaux sous `--source-only`, et un fichier de théorèmes qui pose `theorem «a»` et
  `theorem «b c»` aussi (`Genkan/Theorems.lean` `9e2eea07`).

Une règle par l'atteignabilité des constantes a été écartée sur mesure :
- un `main` sans aucun `!` atteint `panicCore` par l'instance de `GetElem?` de `ByteArray` ;
- `a[i]!` sur `Array` panique dans le C de `lean_array_get`, sans aucun nom de panique dans le graphe.

La règle de mots est donc retenue. Les paniques qu'elle ne voit pas sont les items GENKAN-PANIC-2 et GENKAN-PANIC-3. Son prix :
- ni `simp!` et ses formes, ni les lemmes `getElem!_*` dans les preuves ;
- aucun nom du noyau ne contient `panic` ;
- un nom de théorème s'écrit en ASCII.

## Écarts au plan

- `apps/genkan/test/records.kernel.test.ts` n'est pas dans la ligne du lot au plan. Une de ses lignes tueuses nommait la ligne 482
  d'`audit.mjs`, que le lot fait descendre à 507 ; elle a suivi, sous un complément de zone déclaré avant le commit.
- `audit_refuses_banned_construct` change de corps : son témoin `a!sorry` est devenu un constat. Avec le seul témoin `a?sorry`, le
  test serait resté vert à la base, et le red-proof l'aurait refusé comme un test qui se confirme lui-même. Le cas passe donc au noyau
  sale.

## Vérification

- Sur l'arbre du commit :
  - red-proof contre `16e8697b` : les 5 tests jugés (les 4 neufs et `audit_refuses_banned_construct`) sont rouges à la base par une
    assertion et verts ici, et les 4 tueurs tirés sont tués (`RED-PROOF.json` `80d7e563…`) ;
  - eslint et tsc propres ;
  - lot-check, sortie 0 : le diff reste dans la zone déclarée ;
  - les critères du plan : copiés sans leur `.lake`, les trois noyaux et le fichier de théorèmes mesurés avant le code sont refusés
    sous `--source-only` (`banned ]!`, `banned panic!`, `banned get!`, puis `theorem name Genkan.«a» is not plain` et
    `Genkan.«b c»`) ; l'audit de la base les passe tous les quatre. Laissés avec le `.lake` que lake y a construit, les trois noyaux
    reçoivent en plus le constat du dossier de construction.
- Mutants, en deux campagnes :
  - La première : 51 mutants, 47 tués (`RESULTS.json` `9c80925b…`). Quatre ont survécu : un `]` suivi d'un `!` espacé, un `#`
    espacé, une composante de panique avant un point, et la première de deux composantes de panique. Chacun est tué depuis par un cas
    de test neuf. Deux lignes de la table s'y sont ajoutées avec leurs cas : un `.lake` qui est un lien pendant, et un nom de théorème
    à la ligne qui suit son mot-clé.
  - La dernière, sur l'arbre du commit : 53 mutants, tous tués, aucun survivant, aucun non conclu (`RESULTS.json` `de6a406a…`). Ce
    sont les 27 lignes de la table et les 26 lignes tueuses des deux fichiers de test touchés, dont les 2 du test du noyau, joués sous
    la chaîne épinglée.
- Sur la branche :
  - `test:main` vert : 3375 tests, 3328 réussis, 0 échec, 47 sautés ;
  - les enregistrements de tests égaux à ce passage (337 fichiers, 3375 tests) ;
  - le vrai noyau passe `audit.mjs --source-only`.
- CI de #347 : 15 contrôles sur 15 verts à `69364e97` (run 40910398379, et l'analyse CodeQL, run 40910391577).
- Rejeu Windows à la fusion : les deux fichiers de test que le lot change, 11 tests, 11 réussis, 0 échec, aucun sauté.
- Oracle G7 sur `2c8a6ec4`, base `16e8697b` : vert, 14 gates sur 14 (enregistrement `2c8a6ec46da660b15ac58dfc106143c5214461bc-G7-20261029T163936Z-9988.json`, sha256 `439671e1…`) ; 3375 tests, 3328 réussis, 0 échec, 47 sautés ; 331 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run
  test:genkan` a joué les tests du noyau sous la chaîne épinglée (`ELAN_HOME`) : 17 tests, 17 réussis, 0 sauté, dont `records_kernel_refuses_the_planted_native_axiom` et `records_kernel_passes_the_real_kernel`.

## Ce qui reste

- **GENKAN-PANIC-2** (neuf) : savoir si le code compilé de `main` (son IR, pas son terme) appelle une fonction qui panique. Il peut
  s'agir de `panicCore` ou de `lean_panic_fn`, ou d'un extern dont le C panique (`lean_array_get_panic`, `lean_array_set_panic`, un
  `lean_internal_panic` ; la liste est à lire dans `include/lean/lean.h` de la chaîne épinglée).
  - Déclencheur : le lot-check du lot 2, par une sonde sur ses vrais `Bytes`, `Format` et `Main`.
  - Si la sonde trouve une panique atteinte, la règle avance au lot 2. Sinon, elle se construit au lot 3b, avec le contrôle croisé
    des axiomes par l'énumération des déclarations du noyau.
- **GENKAN-PANIC-3** (neuf) : `genkan-core` lance le noyau avec `LEAN_ABORT_ON_PANIC=1`. Une panique que les mots laissent passer tue
  alors le noyau au lieu de rendre la valeur par défaut, et le cœur s'abstient. Un test plante un noyau qui panique et attend
  l'abstention ; le code de sortie se mesure sur la CI Linux. Déclencheur : le lot 4 (`src/kernel.ts`).
- Dans `docs/ETAT.md`, ce commit clôt GENKAN-PANIC-1, GENKAN-THEOREM-NAMES-1 et GENKAN-LAKE-DIR-1 (trouvé et clos par le lot), et
  ouvre GENKAN-PANIC-2 et GENKAN-PANIC-3.
- **GENKAN-MAIN-IO-1** et **GENKAN-RECORD-ONLY-1** restent ouverts (`docs/ETAT.md`). Déclencheurs : le lot 2 et la G2 de la partie 1.
- Les lots 2 à 7 de la partie et la G2 de la partie.
