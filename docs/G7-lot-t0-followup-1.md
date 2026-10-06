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
- **Ancres** : 53 sur 53.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **`test:main`** : 2 745 tests, 3 rouges connus de l'hôte.
- **R-25** : voir le rapport.
