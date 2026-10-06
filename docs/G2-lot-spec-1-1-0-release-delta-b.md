# G2 delta de SPEC-1-1-0-RELEASE partie b : repli de la G2 (delta a, b)

> Rapport daté du 2026-10-06, tel que rendu par la revue : ses empreintes, comptes et têtes sont ceux de son moment. Les valeurs courantes sont dans `docs/G7-lot-spec-1-1-0-release.md`, section « État courant ».

- **Objet** : `git diff f9290ecc..3e073fee` (commits `12a7ff7f`, `7872ed0f`, `4777cfbf`, `921a3dbd`, `4c61e1f2`, `a3c3e00c`, `c5b7e09d`, `4f647297`, `3e073fee`). `-a` inchangée à `4ff932be`.
- **Arbre** : un arbre jetable (`git worktree add --detach`) à `3e073fee` dans `g2specc/wt`, retiré à la fin. Node v24.21.0, sans réseau, variables de proxy retirées pour les commandes de test.
- **Racines du rejeu** : `recherches` = `le clone local de recherches` à `1107e12` (statut de `kata/spec` vide), `previous` = `le clone local du dépôt de la spécification` à `ddfee9e076d9…` (statut vide).
- **Arbre d'origine** : le worktree du lot reste sur `recherches/spec-1-1-0-release-b` à `3e073fee`. Les sha256 des 2329 fichiers suivis sont identiques avant et après, et `git status` est vide.
- **Sondes** : `probe-b.mjs`, `probe-v.mjs`, `probe-n2.mjs` et `mut.py`, dans ce même répertoire.

## Verdict : **non bloquant**

Les octets de la version sont justes, et chaque constat replié est clos : le rejeu donne 49 fichiers et `MANIFEST.sha256` `66d31d82…`. Il reste un contournement de la porte par le `kind` de l'entrée (N-1). Il ne touche pas la version déclarée, que les tests épinglent, mais il contredit le « gardé » d'`ETAT.md`. Je recommande de le replier avant le go de publication. Les autres points sont mineurs.

Suites : `node --test test/spec-1-1-0-release.test.ts test/spec-publish.test.ts` passe **29/29**, et `spec-policy-tables --check` affiche `OK: 40 file(s)`.

---

## Clôture des constats repliés

| Constat | État | Preuve |
|---|---|---|
| b N-1 gardes dans la porte | **clos** (voir N-1 ci-dessous pour un nouveau contournement) | Voir le détail sous le tableau. |
| b M-1 règle et §10 | **clos** | La règle est plus stricte que le §10 et ne le contredit pas. Voir le détail sous le tableau. |
| b N-2 câblage de l'écrivain | **clos** | Le tueur Kb2 (`text: tableText(t.table)` → `text: canonicalJson(t.table)`) est **tué** par `the_writer_refuses_through_expected_files_what_the_gate_refuses` (28/29). |
| a N-1 regex de chemin | **clos** | Voir le détail sous le tableau. |
| a N-2 `rewritten` | **clos** | Voir le détail sous le tableau. |
| a M-1 écriture d'ensemble | **clos** | Voir le détail sous le tableau, et le point M-2. |
| b M-4 segments de points | **clos** | `.../policy/…`, `contract-1.1.0/../…` et `a/.../b.md` sont refusés par `parseInputs` (`inputs_invalid`). Le tueur `!/^\.+$/` → `!/^\.\.?$/` est **tué**. |

**Détail de b N-1** : j'ai rejoué `hack.mjs` de la G2 précédente sur la déclaration **réelle** (CLI complète, trois racines).
- `n: 30` : sortie **1**, avec un seul problème, `short_digest`. `--out` reste absent.
- `recompute` non nul : sortie **1**, avec un seul problème, `recompute_held`.

Nouvelles sondes par `plan` sur la déclaration réelle :

| Sonde | Résultat |
|---|---|
| `n` 31, `p_served` 30 | `short_digest` |
| `aux_sha256` non nul | `short_digest` |
| `series_sha256` non nul | `short_digest` |
| `recompute` absent (clé retirée) | `recompute_held` |
| entrée sous la racine `recherches` (`kata/spec/hacked.json`), `n` 30 | `short_digest` |
| sortie `policy/<classe>.json` (sans répertoire de version), `n` 30 | `short_digest` |
| sortie `contract-1.1.0/policy/<classe>.json`, **`kind: "json"`**, `n` 30 | **accepté**, voir N-1 |

**Détail de b M-1** : le §10 (`CONTRACT-1.1.0.md:360`, `1107e12`) dit : « No published table file carries a row of 30 points or fewer… The tool that writes the published table files refuses any row of 30 points or fewer. »
- La règle refuse `n` ≤ 30 (ou `n` non numérique), `p_served` ≤ 30, et tout `aux_sha256` ou `series_sha256` non nul. Elle est donc plus stricte que le texte, et ne le contredit pas.
- Les deux lignes publiées passent : `n` 613 et 170, `p_served` 553 et 170, empreintes auxiliaires nulles.
- Le G7 l.168 cite la promesse « à `3712fc8` ». La phrase est inchangée à `1107e12`, puisque `git diff 3712fc8 1107e12` ne touche pas l.360. Ce n'est donc pas une valeur périmée.

**Détail de a N-1** : sonde `contentProblems(out, "policy-table", …, "contract-1.1.0")`, puis `parseInputs`.
- Sont refusés en `policy_table_invalid` :
  - `policy/policy/…` et `contract-9.9.9/…` ;
  - `kata-wave1/…` ;
  - `../…`, aussi refusé en `inputs_invalid` ;
  - `a/contract-1.1.0/…` et `…/policy/x/…` ;
  - `Contract-1.1.0/…`, `…/Policy/…` et `….JSON` ;
  - `…json/`, aussi refusé en `inputs_invalid` ;
  - `contract-1.1.0//policy/…`, aussi refusé en `inputs_invalid` ;
  - `contract-01.1.0/…`.
- Sont admis seulement `contract-1.1.0/policy/<classe>.json` et `policy/<classe>.json`.
- Les tueurs `&& at[1] !== release` → `&& false` et le groupe élargi `(?:([^/]+)\/)?` sont **tués**.

**Détail de a N-2** : j'ai construit une fausse version suivante, `contract-1.2.0`. Son arbre `previous` est le rejeu `contract-1.1.0` commité.

| Sonde | Résultat |
|---|---|
| tout reporté | accepté (49) |
| révision de `KATA-SPEC.md` à la racine | **acceptée** |
| `contract-1.1.0/CONTRACT.md` réécrit, avec `KATA-SPEC.md` révisé | `rewritten contract-1.1.0/CONTRACT.md` (seul problème) |
| table reportée à l'octet depuis une autre racine | acceptée |
| `Contract-1.1.0/CONTRACT.md` en remplacement | `withdrawn contract-1.1.0/CONTRACT.md` |

Le tueur `!now.bytes.equals(` → `now.bytes.equals(` est **tué**.

**Détail de a M-1** : j'ai pris une racine écrite par `--write`, puis je l'ai modifiée :
- `policy-row.schema.json` reçoit un `x` ;
- `btc-dir-1h.json` reçoit un LF ;
- `bnb-dir-1h.json` est supprimé ;
- `tool-error.schema.json` est remplacé par un répertoire non vide.

`--write` sort alors **1** (`EISDIR … rename`), et aucun temporaire ne reste. Les sha256 de tous les fichiers sont **identiques** avant et après : les octets précédents sont rendus, et le fichier absent est retiré. Le tueur SDL de la boucle de restauration est **tué**.

---

## Constats

### N-1 : le `kind` déclaré décide si les gardes jouent, et une table déclarée `json` ou `text` les contourne

**Preuve** :
- Racine `governance` de travail, avec `hack.mjs` (`n: 30` sur `stable-run-velocity-24h`, réépinglé). Seul changement : l'entrée passe de `"kind": "policy-table"` à `"kind": "json"`.
- `spec-publish --release contract-1.1.0 … --inputs in-kj.json` sort **0** et publie 49 fichiers, avec `MANIFEST` `fd55e7f4…`. Le fichier publié `contract-1.1.0/policy/stable-run-velocity-24h.json` porte `"n":30`.
- Même résultat avec `kind: "text"`, ou avec une sortie `contract-1.1.0/other.json`.
- `contentProblems` n'applique `tableRowProblems` qu'à `kind === "policy-table"`. Rien ne lie le `kind` au contenu (`row_format: "class-policy-v2"`) ni au chemin (`…/policy/*.json`).

**Aggravant** : la version suivante ne peut pas reporter les tables 1.1.0 en `policy-table`.
- J'ai reporté les 35 tables dans une fausse `contract-1.2.0` : elles tombent toutes en `policy_table_invalid`, puisque `at[1]` vaut `contract-1.1.0` et non la version courante.
- La seule déclaration possible est donc `kind: "json"`, c'est-à-dire la voie qui saute les gardes. Ce chemin deviendra l'usage normal dès la prochaine version.

**Impact** :
- Nul sur les octets déclarés aujourd'hui : `contract_1_1_0_declares_every_published_file_pinned` épingle `kind: "policy-table"` pour toute sortie `/policy/`, et les tables égalent le servi.
- En revanche, `ETAT.md` (SHORT-DIGEST-INVERSION-1, VERIFIERS-LIST-F5A-1) dit la règle « gardée » par la porte, et cela ne vaut que si le déclarant choisit le bon `kind`.

**Correctif** :
- dans `contentProblems`, pour tout `kind` JSON (`json`, `schema`, `policy-table`), lorsque la valeur décodée est un objet avec `row_format === "class-policy-v2"`, ou lorsque `out` apparie `(^|/)policy/[^/]+\.json$` : exiger `kind === "policy-table"`, avec un nouveau code `policy_table_kind` ;
- dans `plan`, admettre `at[1] !== release` pour une table qui figure dans l'arbre `previous` avec les mêmes octets (`rewritten` le tient déjà). `contentProblems` reçoit alors un drapeau `carried`, ou bien `plan` saute ce seul contrôle pour un report à l'octet ;
- test : `kind: "json"` et `kind: "text"` sur une table de n 30 attendent `policy_table_kind`, et un report 1.1.0 dans une 1.2.0 fabriquée passe en `policy-table` ;
- tueurs : retirer l'exigence de `kind`, puis retirer l'exception du report.

### M-1 : les tables synthétiques de `vectors-1.1.0.json` portent `recompute` et `aux_sha256`

**Constat** :
- `vectors-1.1.0.json` (`synthetic_kata.tables`) publie deux objets `class-policy-v2`, de 6 lignes et d'une ligne. Leurs lignes portent `recompute` (`verifier-b`), `aux_sha256` et `series_sha256`.
- `tableRowProblems` les refuserait (`recompute_held`, `short_digest`).
- Le §10 reste tenu : `n` vaut au moins 92 et `p_served` au moins 59, et le texte ne parle que des fichiers de table.
- Mais `ETAT.md` l.511-516 dit « bloquant à la première **table publiée** dont une ligne porte `recompute` non nul… La version `contract-1.1.0` n'en publie aucune ». Les vecteurs en publient deux, synthétiques.

**Correctif** :
- écrire « premier **fichier de table** publié (hors tables synthétiques de `vectors-*.json`) » dans `ETAT.md` ;
- si N-1 est replié par le contenu (`row_format`), n'appliquer l'exigence qu'à la racine de la valeur, pour ne pas refuser les vecteurs.

### M-2 : la restauration de `--write` rend les octets, pas le mode

**Preuve** : dans la sonde a M-1, `eth-dir-1h.json` est d'abord passé en mode `600`. Après l'échec et la restauration, il est en `644` : `writeFileSync` réécrit le fichier renommé, sans reprendre le mode. Un lien symbolique serait de même remplacé par un fichier ordinaire.

**Impact** : faible. L'en-tête ne promet que les octets, et `--check` ne lit pas les modes.

**Correctif** : facultatif. Relever `statSync(f.at).mode` avec `old`, puis faire `chmodSync` après la restauration. Ou bien écrire dans l'en-tête « previous bytes (not modes) ».

### M-3 : l'immuabilité ne ferme pas `contract-1.1.0/`, et la forme du répertoire d'une révision datée n'est pas fixée

**Constat** :
- Une fausse `contract-1.2.0` qui **ajoute** `contract-1.1.0/NOTE.md` est acceptée (50 fichiers). Le §15 (l.587) et l.441 disent qu'une révision publie ses nouvelles tables « in a new directory ». Un ajout sous `contract-1.1.0/` n'est donc pas interdit par le texte, mais il change le contenu d'un répertoire présenté comme figé.
- La regex fermée n'admet comme répertoire de table que `contract-<x.y.z>` **égal à l'identifiant de version**. Une révision datée *sans* changement de version (§15) ne peut donc pas publier de tables dans un répertoire neuf. Le G7 laisse d'ailleurs cette forme « à trancher par MONARK ».
- Par ailleurs, l.441 dit « A file already published is never rewritten », sans restriction, alors que l.449 et la porte se limitent aux répertoires versionnés. La racine `KATA-SPEC.md` reste révisable, comme voulu. La phrase l.441 est à préciser à la G2 du texte.

**Correctif** :
- avant la première révision datée, fixer la grammaire du répertoire (par exemple `contract-1.1.0-r<date>/`) et l'admettre dans la regex ;
- en option, refuser en `plan` toute sortie neuve sous un `contract-*/` déjà présent dans `previous` (nouveau code `added_to_published`) ;
- à remonter à MONARK : rien à faire pour 1.1.0.

### M-4 : `p_served` non numérique et lignes non objets passent la règle

**Preuve** :
- `n` 31 avec `p_served: "30"` (une chaîne) est **accepté** par `plan`.
- Une ligne qui n'est pas un objet (`rows: [ …, [{ "n": 5 }] ]`) est ignorée par `rows.filter(isObj)`, et la table est acceptée.
- `n` 30.000001 est accepté.
- Le schéma `policy-row` (entier ≥ 1) les refuserait, mais `spec-publish` ne valide pas les lignes contre ce schéma.

**Impact** : nul aujourd'hui, puisque les tables publiées sont le servi et sont validées par Ajv dans le test.

**Correctif** :
- dans `tableRowProblems`, traiter `p_served` absent ou non entier comme un problème `short_digest` (`p_served` est « not null » sur une ligne marginale, selon le §10) ;
- exiger `Number.isInteger(n)` ;
- faire de toute ligne non objet un `policy_table_invalid`.

---

## Contrôles demandés

### Déclaration (`contract-1.1.0`, 47 entrées + `VERSION` + `MANIFEST.sha256`)

- `plan` contrôle `input_digest` sur chaque entrée, et le rejeu est vert : **les 47 sha256 sont justes**.
- `git show 1107e12:<chemin>` | `sha256sum` donne :
  - `CONTRACT-1.1.0.md` : `ac8187fa7662…` ;
  - `vectors-1.1.0.json` : `190b9fd8f488…` ;
  - `README-spec-root.md` : `71f64c8af6c4…`.

  Ces valeurs sont égales aux épingles et aux fichiers du rejeu. Les trois fichiers sont suivis : `ls-files --error-unmatch` réussit.
- `previous_commit` `ddfee9e0…` est égal au `HEAD` du clone propre. Les 4 fichiers de `ddfee9e` sont reportés, et **aucun `withdrawn` ni `rewritten`** n'est signalé.
- `served_tables` des vecteurs est égal au sha256 des 35 fichiers de table : **35/35**.

### Rejeu hors ligne

`spec-publish --release contract-1.1.0 --date 2026-10-06 --out g2specc/rel/r1 --root recherches=… --root previous=…` :
- sortie **0**, **49 fichiers** ;
- `MANIFEST.sha256` `66d31d82122587a9da8725f3e19b39b43f371de826c1e9f311ea6a1755d4eb16` ;
- `sha256sum -c --strict MANIFEST.sha256` donne 0 ligne non OK ;
- 0 fichier exécutable ;
- `VERSION` vaut `2026-10-06`.

### Docs

- L'« État courant » du G7 porte `1107e12`, `ac8187fa…`, `190b9fd8…`, `71f64c8a…`, 49 fichiers et `66d31d82…`. Toutes ces valeurs sont vérifiées.
- Les anciennes valeurs (`642ac97e`, `1210637f`, `ec5c4fa8`, 48 fichiers) ne figurent que dans des relevés marqués « relevé daté, remplacé ».
- Aucune valeur périmée n'est présentée comme courante. Seuls réserves : la portée de « gardé » (N-1) et « aucune table publiée » (M-1).

### R-25

Mesuré avec le pathspec du job (`.github/workflows`, l.98) :
- `-b` contre `-a` : `4ff932be...3e073fee` donne +346/−46 = **392** ;
- `-a` contre `8aea2299` : +536/−1 = **537** ;
- `4ff932be` est ancêtre de `3e073fee`.

Les deux valeurs sont conformes.

### Tueurs tirés à la main (application, exécution des deux suites, restauration)

| Tueur | Résultat | sha256 avant = après |
|---|---|---|
| Kb2 `tableText` → `canonicalJson` (écrivain l.60) | tué (1 échec) | `86400d05…` = |
| `rewritten` : `!now.bytes.equals(` → `now.bytes.equals(` | tué | `cb503b24…` = |
| `okPath` : `!/^\.+$/` → `!/^\.\.?$/` | tué | `cb503b24…` = |
| répertoire de version : `&& at[1] !== release` → `&& false` | tué | `cb503b24…` = |
| restauration de `writeAll` supprimée (SDL) | tué | `86400d05…` = |
| `p_served` ≤ 30 → `false` | tué | `cb503b24…` = |
| groupe de version élargi `([^/]+)` | tué | `cb503b24…` = |

7/7 tués. L'arbre jetable n'a laissé aucun fichier suivi modifié.
