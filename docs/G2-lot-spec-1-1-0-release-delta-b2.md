# G2 delta b2 : SPEC-1-1-0-RELEASE partie b (`3e073fee..f1ac48c9`)

> Rapport daté du 2026-10-06, tel que rendu par la revue : ses empreintes, comptes et têtes sont ceux de son moment. Les valeurs courantes sont dans `docs/G7-lot-spec-1-1-0-release.md`, section « État courant ».

- **Dépôt** : KraidleAI/monark-governance, branche `recherches/spec-1-1-0-release-b`. Commits du delta : `35f4c254` (tests), `243ce4b9` (code), `7485b648` (ETAT et rapport), `f1ac48c9` (G7).
- **Arbre** : un arbre jetable (`git worktree add --detach`) à `f1ac48c9` dans `g2specd/wt`, retiré à la fin. Le worktree le worktree du lot n'a pas bougé : même empreinte de ses fichiers suivis avant et après, statut vide, même HEAD.
- **Racines du rejeu** : `recherches` = `git archive 1107e12 kata/spec` de `le clone local de recherches`, extrait dans `g2specd/rech` (le HEAD local est à `b06906b`). `previous` = `le clone local du dépôt de la spécification` à `ddfee9e` (statut vide).
- **Environnement** : Node v24.21.0, sans réseau. Les variables de proxy sont retirées pour les commandes de test.
- **Sondes** : `g2specd/probe-d.mjs` (N-1, M-4, noms de répertoires) et `g2specd/probe-next.mjs` (fausse version suivante, report, fichier ignoré).

## Verdict : **non bloquant**

Les quatre constats du delta b sont repliés pour ce qu'ils visaient :

- Le contournement par `kind` est rejoué et refusé.
- Le mode est rendu après un échec d'écriture.
- Les types des lignes sont contrôlés.
- Un répertoire publié est fermé aux ajouts.

La déclaration réelle passe, et le rejeu donne toujours 49 fichiers et `66d31d82…`.

Il reste des trous :

- La garde N-1 ne voit qu'une table **à la racine**, nommée exactement, ou sous un chemin `policy/*.json` en minuscules.
- La grammaire des répertoires de version accepte des zéros en tête et des dates impossibles.
- Une version peut écrire sous n'importe quel répertoire `contract-*` neuf, pas seulement le sien.
- Deux tueurs neufs survivent.

Aucun de ces trous ne touche les octets de la version 1.1.0. Tous demandent un déclarant qui contourne exprès, ou une version future. Je recommande de les replier avant la prochaine version publiée, et de préciser dès maintenant la phrase d'`ETAT.md` sur N-1.

## Contrôles

### N-1 : `policy_table_kind`

Le rejeu a été fait sur la déclaration réelle avec `plan` et les trois racines. L'entrée `stable-run-velocity-24h` est réépinglée avec `n` 30.

| Cas | Résultat |
|---|---|
| référence | accepté (49) |
| `kind: "json"`, `n` 30 (rejeu) | **refusé** `policy_table_kind` |
| `kind: "text"`, `n` 30 (rejeu) | **refusé** `policy_table_kind` |
| `json`, `policy/x.JSON` (table v2) | refusé (par `row_format`) |
| `json` puis `text`, `policy/x.json.txt` (table v2) | refusé (par `row_format`) |
| `schema` avec `$schema` ajouté, sous `schemas/` ou `policy/` | refusé |
| `json`, `contract-1.1.0/other.json`, table enveloppée `[t]` | **accepté (49)**, `n` 30 publié |
| `json`, enveloppe `{tables:[t]}` ou `{table:t}` | **accepté (49)** |
| `json`, `row_format` = `"class-policy-v2 "`, `"class-policy-v3"` ou absent | **accepté (49)** |
| `text`, `policy/x.JSON`, `row_format` altéré | **accepté (49)** : le chemin ne joue pas, car l'expression est sensible à la casse |

Le report depuis `previous` a été testé sur une fausse version `contract-1.2.0`. Son `previous` est le rejeu 1.1.0 commité, avec `stable-run-velocity-24h` publiée à `n` 30 :

- reportée en `policy-table`, elle est refusée en `short_digest` ;
- reportée en `json`, elle est refusée en `policy_table_kind`.

Les lignes d'une table reportée sont donc bien contrôlées.

### M-3 : `added_to_published` et `version_dir_invalid`

Cas de la fausse version `contract-1.2.0`, tout reporté :

| Cas | Résultat |
|---|---|
| tout reporté | accepté (49) |
| `+ contract-1.1.0/new.md` | **refusé** `added_to_published` |
| `+ contract-1.2.0/new.md` | accepté (50) |
| `+ contract-9.9.9/x.md` | **accepté (50)**, voir constat 2 |
| `+ contract-01.1.0/x.md` | **accepté (50)** |
| `+ Contract-1.1.0/x.md` | **accepté (50)** |
| version `contract-1.1.0-tables-2026-13-40` avec sa table | **accepté (50)** |
| version `contract-01.1.0` avec sa table | **accepté (50)** |

Noms de répertoires passés à `contentProblems` :

| Nom | Résultat |
|---|---|
| `contract-1.1` | refusé `version_dir_invalid` |
| `contract-1.1.0-tables-20261006` | refusé `version_dir_invalid` |
| `contract-1.1.0` suivi d'une espace insécable | refusé `version_dir_invalid` |
| `contract-01.1.0` | **accepté** |
| `contract-1.1.0-tables-2026-13-40` | **accepté** |
| `contract-1.1.0-tables-2026-02-30` | **accepté** |
| `contract-1.1.0-tables-0000-00-00` | **accepté** |
| `Contract-1.1.0` | **accepté** pour un `.md` (pas contrôlé) |

### M-2 : mode après un échec d'écriture

Sur une racine écrite par `--write` :

1. `eth-dir-1h.json` passe en `stale` mode `600`, et `btc-dir-1h.json` en mode `755`.
2. `bnb-dir-1h.json` devient un lien vers `x-target`.
3. `tool-error.schema.json` est remplacé par un répertoire.
4. `--write` échoue en `EISDIR`.

Après l'échec :

- `eth` est rendu en `stale`, mode `600` : **clos** ;
- `btc` est rendu en mode `755` ;
- aucun fichier `.tmp-spec-policy-tables` ne reste ;
- le lien `bnb` est devenu un fichier ordinaire, avec les octets de sa cible (constat 5, mineur).

Le `done.pop()` est juste : `done.push` précède `renameSync`. Le tueur K3 ci-dessous le confirme.

### M-4 : types des lignes

`tableRowProblems` refuse en `short_digest` chacun de ces cas :

- `n` `"31"`, 31.5, 2^53 ou -1 ;
- `p_served` absent, `"31"`, `true` ou 30 ;
- `series_sha256` `""` ;
- `aux_sha256` `false`.

Il refuse aussi un `recompute` absent (`recompute_held`) et `rows: [r0, null]` (`policy_table_invalid`). `rows` en objet passe `tableRowProblems`, mais `contentProblems` le refuse déjà (`Array.isArray`). **Clos.**

### Régression

- `spec-publish --release contract-1.1.0 --date 2026-10-06` avec les trois racines : sortie **0**, **49 fichiers**, `MANIFEST.sha256` `66d31d82122587a9da8725f3e19b39b43f371de826c1e9f311ea6a1755d4eb16`. Les valeurs sont égales au G7.
- `test/spec-1-1-0-release.test.ts` et `test/spec-publish.test.ts` : 33/33 verts.

### Tueurs tirés à la main

L'empreinte sha256 du fichier est vérifiée égale avant et après chaque tir.

| Tueur | Résultat |
|---|---|
| K1 `spec-publish.mjs:118` : `-tables-\d{4}-\d{2}-\d{2}` → `-tables-\d{4}-?\d{2}-?\d{2}` | **survit** (0 échec) |
| K2 `spec-publish.mjs:130` : `/(^\|\/)policy\/[^/]+\.json$/` → `/^policy\/[^/]+\.json$/` | **survit** (0 échec) |
| K3 `spec-policy-tables.mjs:87` : `done.pop();` retiré | tué (2 échecs, dont `a_failed_write_gives_back_the_mode_of_the_files_it_replaced`) |

## Constats

### 1. N-1 résiduel : la garde ne voit qu'une table racine nommée exactement (moyen)

**Preuve** : tableau N-1. Une table à `n` 30 est publiée (49 fichiers, sortie acceptée) dans chacun de ces cas :

- elle est enveloppée (`[t]`, `{tables:[t]}`, `{table:t}`) ;
- son `row_format` est altéré ou retiré ;
- en `text`, sous `policy/x.JSON`, avec un `row_format` altéré.

Le G7 dit « toute sortie `policy/*.json`, à toute profondeur », ce qui est vrai seulement en minuscules. `ETAT.md` l.521-522 dit « la garde ne dépend plus du `kind` choisi », ce qui est vrai seulement pour une table racine en `class-policy-v2` exact.

**Correctifs** :

- Rendre la garde de chemin insensible à la casse, et l'étendre à tout fichier sous un segment `policy/`, quelle que soit son extension : `/(^|\/)policy\//i` impose `kind: "policy-table"`.
- Détecter la table par sa forme et non par son nom : un objet racine qui a `rows` (tableau) et `class.task_class`, ou un `row_format` qui répond à `/^class-policy-/`.
- Pour les tables imbriquées, refuser hors d'une liste fermée de fichiers de vecteurs (`contract-*/vectors-*.json`, `vectors.json`) tout objet décodé, à toute profondeur, qui porte `series_sha256` ou `aux_sha256` non nul, ou `n` ≤ 30 à côté d'une empreinte.
- À défaut, écrire dans `ETAT.md` la portée exacte : garde à la racine, et enveloppes à la charge du déclarant et de la revue des épingles.

### 2. M-3 : la grammaire est trop large, et une version écrit sous un répertoire qui n'est pas le sien (moyen)

**Preuve** : tableau M-3.

- `contract-01.1.0`, `-tables-2026-13-40`, `-tables-2026-02-30` et `-tables-0000-00-00` passent `VERSION_DIR`.
- La version `contract-1.2.0` peut ajouter `contract-9.9.9/x.md`. Ce répertoire devient alors « publié » et se ferme : il est préempté pour la vraie 9.9.9.
- `Contract-1.1.0/x.md` échappe à `version_dir_invalid`, qui teste `startsWith("contract-")`, et à `added_to_published`, dont l'expression est en minuscules. Sur un système de fichiers insensible à la casse, ce fichier tombe dans `contract-1.1.0/`, qui est publié.
- `--release` n'est pas contrôlé contre `VERSION_DIR`.

**Correctifs** :

- `VERSION_DIR = /^contract-(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-tables-(\d{4}-\d{2}-\d{2}))?$/`, et la date passe par `validDate`, comme `--date`.
- Comparer le premier segment sans casse (`/^contract-/i`) pour `version_dir_invalid` et pour `dirs`.
- Dans `plan`, tout répertoire `contract-*` d'une sortie qui n'est pas dans `previous` doit être égal à `release`. Sinon, renvoyer un code neuf, `foreign_version_dir`.
- Exiger que `release` réponde à `VERSION_DIR` dès qu'une sortie est sous `contract-*`.

### 3. `carried` est lu dans l'arbre de travail de `previous`, pas dans son commit (mineur)

**Preuve** : `previous` a un `.gitignore` `contract-0.9.0/` et un fichier ignoré `contract-0.9.0/policy/btc-dir-1h.json`. `git status --porcelain` est vide, donc `previous_dirty` ne joue pas. Une table **neuve** sous `contract-0.9.0/` est alors acceptée (51 fichiers), parce que `carried` vaut vrai. Sans le fichier ignoré, elle est refusée en `policy_table_invalid`.

L'arbre réel `monark-kata-spec` n'a pas de `.gitignore`, ce qui fait de ce constat une faiblesse de principe.

**Correctif** : `carried` = `ls.includes(e.out)` et octets égaux à `git show <previous_commit>:<out>`. On peut aussi calculer `carried` après les contrôles `previous_commit`, `previous_dirty` et `ls-files`.

### 4. Deux tueurs survivent : trous de tests (mineur)

**Preuve** : K1 et K2 survivent.

- K1 : aucun test ne donne une date sans tirets. Le cas `contract-1.1.0-tables-20261006` est absent.
- K2 : la moitié « chemin » de `policy_table_kind` n'est pas testée en profondeur. Le test `a_table_declared_json_or_text_is_refused_by_its_path_or_its_row_format` donne toujours un contenu qui porte `row_format` `class-policy-v2`, si bien que la détection par contenu masque celle par chemin.

**Correctifs** :

- Ajouter `contract-1.1.0-tables-20261006` (et `contract-01.1.0`, `-2026-13-40` après le constat 2) aux noms refusés.
- Ajouter un cas `contract-1.1.0/policy/x.json` en `json` dont le contenu n'a pas de `row_format`, attendu `["policy_table_kind"]`, plus le cas `.JSON` après le constat 1.

### 5. M-2 : un lien symbolique est rendu en fichier ordinaire (mineur)

**Preuve** : M-2, cas `bnb-dir-1h.json` : après l'échec, le lien est devenu un fichier avec les octets de sa cible. L'en-tête dit « previous bytes and mode », donc le texte n'est pas faux. Mais l'ensemble n'est pas rendu à l'identique.

**Correctif** : `lstatSync` dans `writeAll`, et refuser d'avance une cible qui est un lien symbolique (`--write` sortie 1, rien écrit). On peut aussi garder `readlinkSync` et refaire le lien à la restauration.

## Clos dans ce delta

- **b N-1** : le contournement rejoué (`json` et `text`) est refusé.
- **b M-2** : le mode est rendu.
- **b M-3** : `added_to_published` joue, et `contract-1.1` ainsi que `-tables-20261006` sont refusés.
- **b M-4** : les types des lignes sont contrôlés.

Les points restants sont les constats 1 à 5 ci-dessus.
