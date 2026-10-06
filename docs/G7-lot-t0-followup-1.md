# G7 du lot T0-FOLLOWUP-1 : blobs de `previous` et marqueurs du modèle de notes

- **Branche** : `recherches/t0-followup-1` sur `origin/lot/etude-suite` (`b7d0cb84`), worktree `monark-governance-t0fu`. Commits locaux, sans push.
- **Zones** : `scripts/spec-publish.mjs` (après la fusion de SPEC-1-1-0-RELEASE), `scripts/public-text-deny.mjs` (porte V-1 de MONARK, option A accordée), `docs/public-notes/TEMPLATE.md`, `docs/ETAT.md`.

## 1. SPEC-PUBLISH-PREVIOUS-BLOBS-1

- **Constat de T0** (acte 8, Windows, `core.autocrlf=true`) : le clone `previous` portait des CRLF dans son arbre de travail, et `input_digest` refusait, fermé.
- **Correction** :
  - chaque entrée `root: "previous"` est lue dans l'objet git de `previous_commit` (`git cat-file blob <commit>:<chemin>`, `execFileSync`, sans shell). `cat-file blob` est retenu plutôt que `git show` : il ne passe par aucun filtre (textconv, CRLF) ;
  - le contrôle « carried » et le contrôle `rewritten` lisent le même objet ;
  - un chemin absent du commit est nommé `previous_blob_missing`.
- **Test** `previous_entries_are_read_from_the_pinned_commit_not_the_working_tree` :
  - un clone extrait en CRLF (`core.autocrlf=true`, statut propre) donne les fichiers et le `MANIFEST.sha256` du clone LF ;
  - une retouche de l'arbre de travail, cachée au statut, est ignorée ;
  - un chemin absent du commit est nommé.
- **Tests existants ajustés** : la liste des commandes git en lecture seule, et une racine `previous` placée dans un sous-répertoire, qui nomme aussi l'objet absent.

## 2. TEMPLATE-MARKERS-SOURCE-1 (option A)

- **Modèle** : `docs/public-notes/TEMPLATE.md`, sur la forme des notes `v0.8.0` ; marqueurs `{T0}`, `{SPEC_URL}` et `{OPENAPI_SHA256}`.
  - `{SPEC_URL}` reste : c'est le marqueur de l'acte « avis » nommé par `docs/ETAT.md`. Il est écrit dans le modèle, si bien que la liste se dérive sans rien taper.
- **Dérivation** : `TEMPLATE_MARKERS` vaut `templateMarkers(TEMPLATE.md)`, lu au chargement. Un modèle absent fait échouer l'import, par son nom.
- **Choix retenu : la porte ne refuse pas le modèle, car le modèle n'est pas un texte public.**
  - `kindForPath` ne lui donne aucun genre ;
  - `public_notes_pass_the_gate` le sort de la liste et exige qu'il soit engagé ;
  - le test du modèle vérifie que toutes les autres règles de la porte `notes` passent, et que `ph` ne nomme que ses marqueurs ;
  - l'export n'a rien à retirer : `docs/` n'est jamais exporté.
- **Test** `template_markers_follow_the_committed_template` : un marqueur ajouté à une copie entre dans la liste. Les tests de cas de `ph` restent verts.
- **Le test du flux de release** recopie l'arbre sans `docs/`. Il garde maintenant ce seul fichier, puisque la porte le lit.

## 3. Vérifications

- **red-proof** (`--seed 37`, base `b7d0cb84`) : OK, 6 jugés (6 F2P), 6 tueurs tirés, 6 tués.
- **Tueurs tirés à la main**, fichier restauré (sha256) : 41 sur 41 tués dans les fichiers de test touchés, dont la lecture par blob (`spec-publish.mjs:181`). Le tueur « carried » est gardé dans son sens d'origine.
- **Ancres** : 54 sur 54 sur les fichiers touchés (`--touched b7d0cb84 HEAD`) ; correction de la G2, F-7 : la version précédente disait 53.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **`test:main`** : 2 745 tests, 3 rouges connus de l'hôte.
- **R-25** : voir le rapport.

## 4. Repli de la G2 (2026-10-06)

G2 neuve non bloquante ; tous les constats sont repliés, F-1 à F-7.

- **F-1** : chaque appel git de `spec-publish` (`git()` et `blob()`) tourne avec `GIT_NO_REPLACE_OBJECTS=1`. Un objet de remplacement (`git replace`) ne peut plus masquer une réécriture. Test : un `git replace` dans le clone `previous` donne toujours `rewritten`.
- **F-2** : un objet publié que git ne lit pas comme blob est refusé par son nom, `previous_blob_missing`, au lieu d'être comparé à des octets vides (`?? Buffer.alloc(0)` retiré). Test : un gitlink sous `contract-1.0.0/`.
- **F-3** : test `a_published_contract_file_is_compared_with_its_committed_object`, avec un fichier `contract-*/` dans l'arbre précédent. Un fichier reporté reste égal sur une extraction CRLF et sous une retouche cachée. Le tueur qui ramène le contrôle `rewritten` à l'arbre de travail est déclaré et tué.
- **F-4** : le refus porte la première ligne du stderr de git (par exemple « path … does not exist in … ») ; chaque entrée `previous` est lue une seule fois.
- **F-5** : les marqueurs sont lus avec la forme de la règle `ph` (espaces internes, trait d'union). Un modèle sans marqueur est refusé par son nom, au chargement.
- **F-6** : un cas `${SPEC_URL}` refusé, qui vérifie aussi que `SPEC_URL` est bien un marqueur du modèle.
- **F-7** : décompte des ancres corrigé (§3).

**Vérifications** :
- **red-proof** (`--seed 37`, base `b7d0cb84`) : OK, 9 jugés (9 F2P), 9 tueurs tirés, 9 tués.
- **Tueurs tirés à la main** : 45 sur 45 dans les fichiers de test touchés, plus le tueur hors liste « `GIT_NO_REPLACE_OBJECTS` retiré », tué lui aussi. Chaque fichier est restauré (sha256).
- **Ancres** : 57 sur 57.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests ciblés** : 87 sur 87.
- **R-25** : 238 contre `b7d0cb84`.

## 5. Clôture du lot (2026-10-06, après l'arrêt de l'agent précédent)

- **Contrôle du repli** : les constats F-1 à F-7 de la G2 sont repliés dans le code (`e2ce958d`) et les tests. Il manquait un tueur déclaré par constat : un même test portait F-1, F-2 et F-3 sous un seul tueur (F-3), et F-4 n'avait que son assertion.
  - Le test est coupé en quatre, un tueur chacun : `a_published_contract_file_is_compared_with_its_committed_object` (F-3, `:205`), `a_replace_object_does_not_hide_a_rewrite` (F-1, `:159`, `GIT_NO_REPLACE_OBJECTS` ôté), `an_unreadable_published_object_is_refused_never_read_as_empty` (F-2, `:164`, un objet illisible lu comme vide), `a_refused_previous_entry_carries_the_reason_git_gives` (F-4, `:180`, la raison de git ôtée).
  - red-proof a refusé la première coupe : le test F-1 était vert à la base (la base lisait l'arbre de travail, qu'un objet de remplacement ne touche pas), et le test F-2 levait une exception à la base. Le test F-1 tourne maintenant sur un clone CRLF qui reporte un second fichier de contrat : une seule réécriture doit être nommée. Le test F-2 change une exception en valeur : une exception et une lecture vide échouent toutes deux par assertion.
- **Tronc fusionné** : `origin/lot/etude-suite` `febf7735` (actes 7 à 9 de T0), avant l'édition de l'ETAT. Base des mesures : `febf7735`.
- **ETAT** : trois items avec porteur et déclencheur (KATA-CLAUSE-COMMITTED-STATE-1 ; DECIDED-AT-1, clos par raison écrite ; FORMAT-W2, à figer avant E-1) ; la ligne datée de l'écart au plan du mois, après la l.25 (les l.14-25, consigne verbatim, ne bougent pas ; dates accordées par MONARK : vague 1 vers le 2026-10-20, vague 2 visée au 2026-11-16) ; la ligne du bloc E réécrite ; le repli de la G2 sous SPEC-PUBLISH-PREVIOUS-BLOBS-1 ; l'état du G0 d'ENGINE-ROW-RETIRE-PATH-1 (brouillon remis le 2026-10-06). Textes : annexe A et §5 du message de RECHERCHES du 2026-10-06 (plan d'après T0).

**Vérifications finales** (base `febf7735`) :
- **red-proof** (`--draw 6 --seed 37`) : OK, 12 jugés (12 F2P), 6 tueurs tirés, 6 tués.
- **Tueurs tirés à la main** : 60 sur 60 tués dans les quatre fichiers de test touchés, chaque fichier restauré (sha256). 59 par assertion ; `spec-policy-tables.mjs:39` (test `the_published_schemas_load_together_and_validate_a_served_decision`, antérieur au lot) rougit par une erreur de chargement du schéma.
- **Ancres** : 60 sur 60 sur les fichiers touchés (`--touched febf7735 HEAD`). Sur tout le dépôt, 8 PERDU, tous antérieurs et hors du lot : le lot ANCHORS-DRIFT-1 les ferme.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests ciblés** (`spec-publish`, `spec-1-1-0-release`, `public-text-deny`, `release-public-flow`, `release-public`) : 71 sur 71.
- **`test:main`** : 2 751 tests, 2 725 verts, 22 ignorés, 4 rouges. Les quatre sont rouges à l'identique à `b7d0cb84` sur cet hôte : `sentinel_sigterm_after_lock_acquired_before_handler_releases_lock`, `sentinel_sigterm_while_lock_acquiring_releases_lock`, `ukemi_guard_record_skipped_the_platter_flush_nonvacuous` et `dojo_history_collect_to_verify_end_to_end`. Le §3 en comptait 3 : le compte juste est 4. Cause par test : voir le §6 (correction de la G2, T-7).
- **R-25** contre `febf7735` : voir le rapport de clôture (STAT ≤ 547).

## 6. Repli de la G2 delta (2026-10-06, T-1 à T-7)

G2 delta non bloquante sur `2827819f` ; ses sept constats sont repliés. T-8 (variables `GIT_DIR` héritées) n'était pas reproduit ici ; la G2 du repli l'a reproduit, et le §7 le corrige.

- **T-1** : test `template_markers_skip_a_shell_variable_of_the_template`. Un `${HOME}` écrit dans le modèle n'est pas un marqueur. Tueur déclaré `public-text-deny.mjs:130 CONST "(?<!\\$)" -> ""`, tué par assertion.
- **T-2** : l'échappement de `-` dans `MARKER_VARIABLE` (`:135`) est retiré. Il était mort : un nom de marqueur est `[A-Z0-9_-]`, et `-` est littéral hors d'une classe. Il serait même nuisible, puisque `\-` est une erreur de syntaxe sous le drapeau `u`. Le mutant inverse (remettre l'échappement) est équivalent : aucun test ne peut le tuer, et le constat ne demande pas de tueur.
- **T-3** : la G7 disait « chaque entrée `previous` est lue une seule fois », et ce n'était pas vrai. Une entrée publiée sous son propre chemin était lue trois fois : par l'entrée, par le contrôle « carried » et par le contrôle `rewritten`. `plan()` garde maintenant chaque objet lu (`once`, `spec-publish.mjs:171`), si bien que l'affirmation est vraie : chaque objet de `previous_commit` est lu une seule fois par plan.
  - Test `each_object_of_the_previous_commit_is_read_once` : `plan()` tourne dans un processus enfant avec `GIT_TRACE2_EVENT`. Il compte les `cat-file` dans les événements `start` de git, sans enveloppe, donc sur tout OS. Il est rouge à `2827819f` : `reports/README.md` est lu deux fois, `contract-1.0.0/t.md` trois fois.
  - Tueur `:171 CONST "if (!objects.has(k)) " -> ""`, tué. Le tueur F-3 (`:205`) vise maintenant `once(prev, …)`. Il reste tué, par les trois tests F-1, F-2 et F-3.
- **T-4** : la ligne datée de TEMPLATE-MARKERS-SOURCE-1 (`docs/ETAT.md`) note maintenant le repli de F-5, F-6, T-1 et T-2. Celle de SPEC-PUBLISH-PREVIOUS-BLOBS-1 note T-3.
- **T-5** : la ligne d'écart au plan du mois ne dit plus que le fondateur et l'investisseur ont été prévenus. Elle dit seulement ce que MONARK a écrit (`034a528`) : il prévient l'investisseur des deux dates le 2026-10-06.
- **T-6** : la ligne d'ENGINE-ROW-RETIRE-PATH-1 porte le repli accordé (plan d'après T0, §4 ; `034a528`). Si la partie harnais n'est pas fusionnée quand part le G0 court de E-1a, E-1 passe d'abord, et le retrait s'écrit après E-1b.
- **T-7** : les quatre rouges de `test:main` n'ont pas une cause commune « root ».
  - `dojo_history_collect_to_verify_end_to_end` manque de place libre dans le tmpdir. Le collecteur refuse `disk_space` (`apps/dojo/src/history-collect.ts:184-185`) : il faut ≈ 1,27 Go, et l'hôte en a ≈ 0,95 Go. Le lot DOJO-E2E-DISK-1 rend ce test indépendant du disque de l'hôte.
  - Les deux rouges SIGTERM de sentinel et le rouge ukemi ont une autre cause, hors de ce lot, qui ne dépend pas de la place disque.

**Vérifications** (base `febf7735`) :
- **red-proof** (`--draw 6 --seed 37`) : OK, 14 jugés (14 F2P), 6 tueurs tirés, 6 tués.
- **Tueurs neufs ou changés tirés à la main**, fichier restauré (sha256) : T-1 `:130`, T-3 `:171` et F-3 `:205`, tous tués par assertion. Le mutant T-2 inverse survit, comme attendu : il est équivalent.
- **Ancres** : 62 sur 62 sur les fichiers touchés. Sur tout le dépôt, les 8 PERDU antérieurs restent (ANCHORS-DRIFT-1 les ferme).
- **R-25** contre `febf7735` : STAT 238+/58- = 296 (≤ 547), CONTENT 0, GREEN.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests ciblés** (`spec-publish`, `public-text-deny`, `spec-1-1-0-release`, `release-public-flow`, `release-public`) : 73 sur 73.

## 7. Repli de la G2 du repli (2026-10-06, T-8 et A-3)

G2 non bloquante sur `61ab3567`. Elle reproduit T-8 (A-1), et A-3 durcit un test. A-2 est un message à MONARK, sans code.

- **T-8, reproduit et corrigé** : lancé depuis un hook `pre-commit` d'un worktree lié, `spec-publish` héritait de `GIT_DIR` et d'un `GIT_INDEX_FILE` absolu. L'acte 8 refusait alors un arbre `previous` propre, avec un message trompeur (`previous_blob_missing … exists on disk, but not in …`). Le refus était fermé : le contenu reste épinglé par `<commit>:<chemin>`.
  - Test `a_caller_s_git_location_never_stands_in_for_the_previous_tree`, rouge à `61ab3567` par assertion. `plan()` tourne dans un processus enfant, une fois par cas, avec un autre dépôt nommé par l'environnement :
    - la paire du hook (`GIT_DIR` et `GIT_INDEX_FILE`) et `GIT_DIR` seul donnent `previous_blob_missing` et `previous_commit` ;
    - `GIT_OBJECT_DIRECTORY` donne `previous_blob_missing` et `previous_dirty` ;
    - `GIT_WORK_TREE` donne `previous_commit` ;
    - `GIT_INDEX_FILE` donne `previous_dirty`.
  - Correction, `spec-publish.mjs:159` : chaque appel git perd les variables de position du dépôt, la moitié « position » de `git rev-parse --local-env-vars`, sans égard à la casse (Windows). `GIT_CONFIG_*` est gardé. Le test le vérifie : sous `GIT_TEST_ASSUME_DIFFERENT_OWNER=1`, git refuse l'arbre (prémisse), et un `safe.directory=*` passé par `GIT_CONFIG_*` le fait accepter. L'explication occupe la ligne vide `:158`, si bien qu'aucune ancre ne bouge.
  - Tueurs déclarés, tués par assertion : `:159 CONST "!GIT_LOCATION.test(k)" -> "true"` (les cinq cas) et `:159 CONST "^GIT_(?:DIR|" -> "^GIT_(?:CONFIG_COUNT|DIR|"` (le cas `safe.directory`). Le tueur F-1 (`a_replace_object_does_not_hide_a_rewrite`) suit le nouveau texte de la ligne : `", GIT_NO_REPLACE_OBJECTS: \"1\" }" -> " }"`. Il reste tué.
- **A-3** : `each_object_of_the_previous_commit_is_read_once` ne compte que les processus git de premier niveau (un `sid` sans `/`), et l'enfant ne reçoit pas `GIT_TRACE2_PARENT_SID`. Un lanceur instrumenté par trace2 qui relance git ne compte donc qu'une lecture.

**Vérifications** (tronc `82cf6980` fusionné, base `82cf6980`) :
- **red-proof** (`--draw 6 --seed 37`) : OK, 15 jugés (15 F2P), 6 tueurs tirés, 6 tués, dont le tueur T-8.
- **Tueurs tirés à la main**, fichier restauré (sha256) : les 22 de `test/spec-publish.test.ts`, tous tués par assertion.
- **Ancres** : 64 sur 64 sur les fichiers touchés. Sur tout le dépôt, les 8 PERDU antérieurs restent (ANCHORS-DRIFT-1 les ferme).
- **R-25** contre `82cf6980` : STAT 275+/59- = 334 (≤ 547), CONTENT 0, GREEN.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests ciblés** (`spec-publish`, `public-text-deny`, `spec-1-1-0-release`, `release-public-flow`, `release-public`) : 74 sur 74.
