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
- **`test:main`** : 2 751 tests, 2 725 verts, 22 ignorés, 4 rouges. Les quatre sont rouges à l'identique à `b7d0cb84` sur cet hôte, qui tourne en root : `sentinel_sigterm_after_lock_acquired_before_handler_releases_lock`, `sentinel_sigterm_while_lock_acquiring_releases_lock`, `ukemi_guard_record_skipped_the_platter_flush_nonvacuous` et `dojo_history_collect_to_verify_end_to_end`. Le §3 en comptait 3 : le compte juste est 4.
- **R-25** contre `febf7735` : voir le rapport de clôture (STAT ≤ 547).
