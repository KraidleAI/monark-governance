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
