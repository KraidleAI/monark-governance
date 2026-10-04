# G7 du lot d'outil LINT-UNTRACKED-TMP-1 : la copie des dépôts de test de `test/journal-index.test.ts` sous charge

- **Plan** : `docs/G0-lot-lint-untracked-tmp-1.md`. **Base** : `71363ef1` (`origin/lot/etude-suite`). Branche
  `recherches/lint-untracked-tmp-1`.
- **Commits** : `5ff4d181` (G0), `0792314e` (test : correctif et cas de rejeu, **gel**), puis ce G7. Rien n'est poussé.
- **Hôte de mesure** : Linux, 4 cœurs.
  - Les versions de la CI de #110 : Node v24.21.0 (binaire officiel) et git 2.55.0 (compilé depuis les sources). Les deux sont
    dans le bloc-notes, hors arbre.
  - La version de l'hôte : Node v22.22.2 et git 2.43.0.

## Cause, mesurée

Ce n'est pas un nettoyage concurrent de `/tmp`.
- Le préfixe `monark-journal-` n'appartient qu'à ce fichier, et sa racine vient de `mkdtempSync`.
- Personne ne vide `tmpdir()`.

La cause est un **processus git détaché qui modifie la source pendant la copie**.
1. `git commit` lance `git maintenance run --auto --quiet --detach`. Mesuré : `GIT_TRACE=1` sous git 2.55.0. Le détachement est le
   défaut depuis git 2.47.
2. Ce processus tient `.git/objects/maintenance.lock` et ne le rend qu'après le retour du commit. Mesuré : le verrou est encore
   présent juste après le retour de `git commit` dans **12 commits sur 50**. Sous git 2.43, la maintenance tourne au premier plan,
   et ce verrou n'est jamais vu.
3. `generated()` copie `g` par `cpSync` juste après son commit (l.83-84 à la base). Si la copie liste le verrou puis que le démon
   l'efface, elle échoue. Sans `filter`, la copie native de Node rapporte alors le **répertoire de destination**, et c'est
   exactement le message de la CI.
   - Mesuré en isolant la copie : 316 échecs sur 2 000 copies pendant qu'un processus crée puis efface ce verrou.
   - Sous Node 22.22.2, c'est la même chose (le chemin natif y existe aussi).
4. Hors de ce fichier : sous charge, un dépôt qui atteint le seuil de `gc --auto` fait tomber `cpSync` dans une exception C++ non
   rattrapée, et le processus avorte (`std::filesystem::filesystem_error … directory iterator cannot open directory`). Ce cas n'est
   pas atteint par ce test, qui fait peu de commits. Il est noté pour qui copie un dépôt vivant ailleurs.

## Correctif (test seul, aucun code de production)

- `T/gitconfig`, la configuration globale propre au test (jusqu'ici vide), porte `maintenance.auto = false`. Aucun processus git
  ne survit plus à sa commande. Les empreintes C1 et C2 sont inchangées (le test doré est vert).
- `copy(from, prefix)` est le seul outil de copie, pour `repo()` et `generated()` :
  - Chaque copie va dans un répertoire neuf de `mkdtempSync` sous `T`. Le compteur `seq` est retiré.
  - Un `filter` écarte les `*.lock` situés sous `.git/` (restriction de m3, `53eeed5f`) **avant** tout `lstat`. Un verrou qui disparaît pendant la copie n'est donc jamais lu, et une
    copie ne porte jamais de verrou périmé.
  - Le nettoyage reste celui de `T` seul, par le `after` du fichier.
- Cas neuf `LINT-UNTRACKED-TMP-1: …` (async, environ 7 s sous Node 24 en charge) :
  - Il lit `maintenance.auto = false` dans l'environnement git du test.
  - Il copie 100 fois le dépôt de `generated()` pendant qu'un enfant Node crée et efface en boucle `.git/objects/maintenance.lock`.
    Chaque copie doit résoudre le même `HEAD^{tree}`. L'enfant est tué et attendu, puis le verrou est effacé.
  - Puis `build` rend le cas vert de LINT-UNTRACKED (`docs/new.md`, listé `(non suivi)`, n'est pas un hit R-PATH).
  - Tueur : `scripts/journal/index.mjs:120 CONST "off.has(h.extract)" -> "false"`. Il ne couvre que la partie `build` du cas
    (m1). La copie et la configuration sont du code de test : un lot de test seul n'a pas de tueur de production pour elles, et
    leur oracle est la table des mutations ci-dessous (filtre retiré, configuration vidée).

La « copie atomique » de l'item (copie puis renommage) est écartée : la destination n'est lue par personne d'autre. Le défaut est
la source qui change.

## Oracle

### red-proof : refusé, comme prévu

`node scripts/red-proof.mjs --base 71363ef1 --gel 0792314e` (Node 24.21.0) rend **REFUSED** :
- 1 test jugé (le cas neuf), refusé avec le motif « green at base: a self-confirming test » ;
- 27 tests inchangés, 0 tueur tiré ;
- `RED-PROOF.json` sha256 `af781ecc…`.

Le motif est attendu : le lot ne change que le fichier de test, que l'outil exécute aussi sur l'arbre de base. Un lot de test seul
qui est vert à la base ne peut donc pas sortir F2P. RED-PROOF-TEST-ONLY-1 traite ce cas à part. L'oracle est ici la mesure de
charge ci-dessous, avec les mutations du cas neuf.

### Le cas neuf rougit sur chaque défaut qu'il vise

Chaque mutation a été appliquée au gel, puis rejouée par `--test-name-pattern="TMP-1"`.

| Mutation au gel | Résultat |
|---|---|
| Copie remise à la forme de la base (`cpSync` sans `filter`), Node 24 | rouge 3/3, `ENOENT … loadXXXX/.git/objects` (le message de la CI) |
| La même, Node 22.22.2 | rouge 3/3, même message |
| `T/gitconfig` remis vide | rouge, par assertion (`""` au lieu de `"false"`) |
| Tueur l.120 `-> "false"` | rouge, par assertion (il rougit aussi `LINT-UNTRACKED` : il garde `build`, pas la copie) |

Les 37 tueurs de la base (dont celui de LINT-UNTRACKED, l.120 `-> "true"`) gardent leurs adresses : le code de production
n'est pas touché.

### Charge, avant et après (Node 24.21.0, git 2.55.0)

| Mesure | Base `71363ef1` | Gel `0792314e` |
|---|---|---|
| Séquence de `generated()` isolée (dépôt neuf, deux commits, copie aussitôt) : 8 processus parallèles × 300 | **6 / 2 400** copies en échec (0,25 %), toutes `ENOENT … wNN/.git/objects`, `cp` | **0 / 2 400** |
| La même, un seul processus × 300 | 3 / 300 | 0 / 300 |
| `node --test test/journal-index.test.ts` : 80 lancements, 8 à la fois (charge moyenne de 25 sur 4 cœurs) | **1 / 80** en échec : `LINT-UNTRACKED` à `generated` l.84, `ENOENT '/tmp/monark-journal-FxNOJs/w106/.git/objects'`, la CI à l'identique | **0 / 80** |
| La même, 40 lancements, 8 à la fois (premier essai, avant le gel) | 0 / 40 | — |

À la base, le fichier lancé tel quel donne environ 1 échec pour 80 lancements. Seul le cas neuf, qui accélère la fenêtre, rend la
race visible à chaque lancement.

### Suite complète

Au gel, sous Node 24.21.0 et git 2.55.0, avec les six motifs de `npm test` et `--test-skip-pattern=^export_public_no_governance_no_french`
(le test 42 fait `npm ci` sur le réseau, comme au K-7) :
- **2 019 tests, 1 996 réussis, 2 échecs, 21 ignorés** ; TAP sha256 `cac74099…` ;
- les 28 tests de `journal-index` sont verts.

Les deux échecs sont étrangers au lot :
- `bell_served_collector_revision_is_a_collector_commit` (`test/bell-served.test.ts:153`) : `git cat-file -t 3bda2cad…` échoue
  parce que le dépôt de cet hôte est **superficiel** (`--is-shallow-repository` vrai). C'est un fait d'environnement, sans lien avec
  le lot.
- `sentinel_run_releases_chainstack_lock_on_sigterm` : rouge sous la charge de la suite, vert 3/3 seul. C'est le mode connu de
  SENTINEL-SIGTERM-LOCK-FLAKE-1 / SENTINEL-SIGTERM-LOAD-1.

Autres vérifications :
- `npx tsc --noEmit` vert ;
- eslint vert sur le fichier ;
- `gate:vocab` OK, `lint:ratchet` 69/69, `lang:gate` OK ;
- le fichier seul est vert sous Node 22.22.2 et git 2.43.0 (28/28) comme sous Node 24.21.0 et git 2.55.0 (28/28).

### R-25

Par `r25()` (`scripts/oracle/r25.mjs`, pathspec de `ci.yml`), base `71363ef1` : +23/−8, **31 lignes comptées**, ≤ 547. Le G0 et
le G7 sont hors compte.

## Autocontrôle

- Le périmètre est respecté : `test/journal-index.test.ts`, le G0 et le G7.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis.
- La copie temporaire du fichier de base utilisée pour la mesure (`test/zz-lu-base-journal-index.test.ts`) a été effacée avant le
  G7 ; elle n'a jamais été commise.
- Les noms des répertoires de copie passent de `rN`/`wN` à `rXXXXXX`/`wXXXXXX` (`mkdtemp`). Aucune assertion ne lisait ces noms :
  28/28 verts.

## Écarts au plan

- Le G0 prévoyait environ 25 lignes ; il y en a 31 (+23/−8).
- La mesure de charge de la base a été faite sur une copie non suivie du fichier de base, placée dans `test/` du worktree le temps
  de la mesure, puis effacée. Je n'ai pas créé de second worktree.
- La suite complète a été lancée une fois, sous les versions de la CI. Elle n'a pas été rejouée sous Node 22.
- Le dépôt superficiel n'a pas été approfondi (`fetch --unshallow`), parce qu'il est partagé avec les autres worktrees.

## Plis de la G2 neuve (ACCEPTE, 4 mineurs)

Rapport : `G2-lint-untracked.md` (bloc-notes de RECHERCHES). Plis au commit `53eeed5f` (test) et au commit de ce texte (docs).

- **m1** : la portée du tueur l.120 est écrite plus haut (§ Correctif) ; l'oracle de la copie et de la configuration est la table
  des mutations.
- **m2** : l'enfant qui crée et efface le verrou doit être vivant.
  - Le cas attend la ligne `churning` de l'enfant (écrite après 100 cycles) avant les 100 copies. Une erreur de lancement
    (`error`) ou une sortie précoce (`exit`) rejette cette attente ; rien n'est avalé.
  - Après la dernière copie, il exige `exitCode` et `signalCode` nuls.
  - Le `finally` ne tue et n'attend l'enfant que s'il tourne encore.
  - Mutations mesurées : exécutable absent, rouge (`spawn /nonexistent/node ENOENT`) ; `process.exit(0)` en tête de l'enfant,
    rouge (`churn exited 0 null`). Aucune des deux ne passe à vide.
- **m3** : le filtre ne vise plus que les `*.lock` dont le chemin contient un segment `.git`. Une assertion d'une ligne copie un
  `Cargo.lock` hors de `.git/` et exige qu'il soit présent. Mutation : l'ancien filtre (`!p.endsWith(".lock")`) rougit par
  assertion.
- **m4** : le G0 §4 disait que Node 22 copie en JS. C'est faux pour 22.22.2, qui a aussi le chemin natif (rouge 3/3, même
  message que la CI). Le G0 est corrigé par une ligne datée.
- Après les plis : `npx tsc --noEmit` vert ; eslint vert sur le fichier ; le cas seul est vert sous Node 24.21.0 et git 2.55.0.
- Charge après les plis : `node --test test/journal-index.test.ts`, 8 lancements à la fois, sous Node 24.21.0 et git 2.55.0. Résultat : **0 / 8** en échec, 28/28 tests verts dans chaque lancement, aucun `ENOENT`.
- R-25 après les plis : par `r25()` contre `71363ef1`, +28/−8, **36 lignes**, ≤ 547.

## Item d'information

- **CPSYNC-LIVE-REPO-ABORT-1** (propriétaire MONARK ; déclencheur : tout test neuf qui copie un dépôt git vivant). Un `cpSync`
  natif sans `filter` d'un dépôt vivant peut faire **avorter tout le processus de test**, par une exception C++ non rattrapée
  (`std::filesystem::filesystem_error … directory iterator cannot open directory`). Cela arrive quand `gc --auto` réécrit
  `.git/objects` pendant la copie : mesuré sous Node 24.21.0 et git 2.55.0, à 300 commits dans un même dépôt. Aucun test ne peut
  rattraper cette erreur. Ce fichier n'y est plus exposé, car toute copie y passe par un `filter`, donc par le chemin JS. Une
  recherche rapide de la G2 n'a trouvé aucun autre test qui copie un dépôt vivant sans filtre ; cette recherche n'est pas
  exhaustive.

## Branchement

L'outil `scripts/journal/index.mjs` est inchangé : registre inchangé.

## Sortie

Prêt pour la G2 neuve de RECHERCHES, puis pour le contrôle par diff de MONARK. Item LINT-UNTRACKED-TMP-1 clos au gel `0792314e`.
À relire sur la CI Linux de la PR, sous git ≥ 2.47.
