# G2 de SPEC-1-1-0-RELEASE : delta de la partie a, et G2 neuve de la partie b

- **Objets** :
  - a : `git diff c85f352e..4ff932be` (tête `4ff932be`) ;
  - b : `git diff faed7218..f9290ecc` et tout le lot `-b` (`4ff932be..f9290ecc`).
- **Arbres** : trois arbres jetables (`git worktree add --detach`) dans le répertoire de travail de la revue, à `4ff932be`, `f9290ecc` et `8aea2299`. Node v24.21.0, sans réseau, variables de proxy retirées pour les commandes de test.
- **Racines du rejeu** : `recherches` = `le clone local de recherches`, `previous` = `le clone local du dépôt de la spécification` (propre, `HEAD` = `ddfee9e076d9…`).
- **Arbre d'origine** : le worktree du lot reste sur `recherches/spec-1-1-0-release-b` à `f9290ecc`, et `git status` est vide avant comme après.

---

## Partie a (delta après le repli) : **non bloquant**

### Clôture des constats de la G2 précédente

| Constat | État | Preuve |
|---|---|---|
| N-1 `$id` | **clos** | Voir le détail sous le tableau. |
| N-2 lien symbolique | **clos** | Par un lien dans le répertoire de travail : l'écrivain sort **1** (`REFUSED`) sur une racine vide, et `spec-publish` sort **2** (usage). Les deux tests de lien sont verts, et leurs tueurs déclarés (`realpathSync` → `resolve`) sont tués. |
| N-3 `recompute` | **clos dans b** | La garde est dans `tableText`, et la ligne datée est dans `ETAT.md`. Voir la partie b, B/N. |
| N-4 « return paid » | **clos** | Le texte devient `never an investment return or income paid to anyone.`, avec 0 problème au sens de `contentProblems`. |
| M-1 K3 | **clos** | K3 refait à la main : remplacement → `", a yield."`, puis `--write`. Le test `published_schemas_differ…` passe au rouge (4/5). Après restauration, les sha256 sont identiques : écrivain `9add2893…`, copie `b6db2d36…`. |
| M-2 fichier en trop | **clos** | `tree()` est récursif sous `spec/contract-1.1.0/`. Le test voit `extra …/stray.json` et `extra …/policy/x.json`. |
| M-3 écriture atomique | **partiel**, voir M-1 (a) | Les temporaires sont retirés, une seule ligne `REFUSED` est affichée et la sortie vaut 1. Mais l'ensemble des fichiers n'est pas atomique. |
| M-4 « spec section N » | **clos** | Les titres du texte sont bien §5 « Coverage verdict », §10 « Policy table files » et §13 « Errors » (`CONTRACT-1.1.0.md:121, 349, 511`). |
| M-5 formulation | **clos** | G0 l.50 et l.83, ainsi que le G7. |
| M-6 LF, `--check` de a | **clos** | Sur `4ff932be`, `--check` affiche `OK: 5 file(s)` et sort 0. Le test épingle les 5 sha256 et `includes("\r") === false`. |

**Détail de N-1** :
- Les 5 `$id` sont en `https://github.com/KraidleAI/monark-kata-spec/raw/main/contract-1.1.0/schemas/<n>.schema.json`.
- `checkPublicText` sur chaque `$id` donne 0 violation : `URL_ALLOW` est respecté, avec un seul `://`.
- Ajv 2020 hors ligne :
  - `gate-decision` chargé seul lève `MissingRefError … from id …/raw/main/contract-1.1.0/schemas/gate-decision.schema.json` ;
  - avec les 5 schémas, une décision servie est valide, et un `alpha` altéré est refusé par `schemaPath` `coverage-verdict.schema.json/properties/alpha/type`. Le `$ref` est donc bien suivi ;
  - avec `loadSchema` espion, Ajv demande exactement `…/raw/main/contract-1.1.0/schemas/coverage-verdict.schema.json`, qui est le chemin `out` déclaré.

Suite de a : `node --test test/spec-1-1-0-release.test.ts` passe 5/5 sur `4ff932be`.

### N-1 (a) : la regex du chemin de table admet des chemins qu'elle ne devrait pas

La ligne visée est `scripts/spec-publish.mjs:129`, `out.replace(/^[\w.-]+\/(?=policy\/)/, "")`. Elle a été posée par `a3af81d0` dans `-b`, et elle est annoncée au G0 §8.

**Sonde** : `contentProblems(out, "policy-table", btc-dir-1h)`, puis `parseInputs` sur une entrée avec ce même `out`.

| `out` | `contentProblems` | `parseInputs` |
|---|---|---|
| `contract-1.1.0/policy/btc-dir-1h.json` | OK | OK |
| `policy/policy/btc-dir-1h.json` | **OK** | **OK** |
| `.../policy/btc-dir-1h.json` | **OK** | **OK** |
| `-/policy/btc-dir-1h.json` | **OK** | **OK** |
| `reports/policy/btc-dir-1h.json` | **OK** | **OK** |
| `contract-9.9.9/policy/btc-dir-1h.json` | **OK** | **OK** |
| `../policy/…`, `./policy/…`, `.git/policy/…` | **OK** | refusé (seulement par `okPath`) |
| `/policy/…` (version vide), `a/b/policy/…`, `…/policy/x/…`, `Policy/`, `\` | refusé | — |

- La version vide et les répertoires imbriqués à plus d'un niveau sont bien refusés.
- En revanche, n'importe quel premier segment est admis, y compris `policy/`, `...` et une autre version.
- `..` n'est arrêté que par `okPath`, pas par la porte de contenu, qui est exportée et testée seule.
- **Tueur** Kb3, regex rendue permissive (`/^(?:[^/]*\/)*(?=policy\/)/`) : il **survit** à `spec-1-1-0-release.test.ts` (10/10) et à `spec-publish.test.ts` (14/14).

**Correctif** :
- Remplacer la ligne par un appariement fermé, par exemple `const m = /^(?:(contract-\d+\.\d+\.\d+)\/)?policy\/([a-z0-9-]+)\.json$/.exec(out)`.
- Exiger `m !== null && m[2] === v.class.task_class`.
- Si possible, exiger aussi `m[1] === undefined || m[1] === release` : `plan` passe alors l'identifiant de version à `contentProblems`.
- Ajouter au test les lignes `policy/policy/…`, `.../policy/…`, `contract-9.9.9/policy/…` et `../policy/…`, toutes attendues `policy_table_invalid`.
- Tueur : la regex permissive ci-dessus.

### N-2 (a) : « un même `$id` ne nomme jamais deux contenus » n'est tenu par aucun fil

- **Preuve** : le G0 §8 l'affirme, et le `$id` est sur `raw/main`, une référence mobile. Or `plan` ne contrôle que `withdrawn` (`spec-publish.mjs:163-167`), c'est-à-dire qu'aucun fichier publié n'est retiré.
- Rien n'empêche une version ultérieure de déclarer `contract-1.1.0/schemas/<n>.schema.json` (racine `governance`) avec d'autres octets. Le `$id` publié changerait alors de contenu en silence.
- **Impact** : nul pour 1.1.0, qui est la première version à publier ce répertoire. La promesse vaut pour toutes les suivantes.
- **Correctif** :
  - dans `plan`, pour chaque chemin de `git ls-files` du `previous` qui commence par `contract-` et qui est aussi une sortie, exiger que les octets soient égaux à `git show HEAD:<p>` ; sinon, nouveau code `rewritten` ;
  - test avec une racine `previous` fabriquée, et tueur.
  - Sinon, poser une étiquette immuable et passer le `$id` en `/raw/contract-1.1.0/…`.
  - Remarque : le texte (§15) prévoit des révisions datées qui remplacent des lignes de table « by new table files ». Les tables n'ont pas de `$id`, mais il faut trancher si `contract-1.1.0/policy/*.json` est mutable. Voir M-2 (b).

### M-1 (a) : `--write` est atomique par fichier, pas en tant qu'ensemble

- **Preuve** :
  - J'ai préparé une racine où les 5 copies sont périmées (un LF ajouté), et où `tool-error.schema.json` est un répertoire non vide.
  - `--write` sort 1 avec `REFUSED: EISDIR … rename`, et les temporaires sont retirés.
  - Un `--check` lancé ensuite ne signale **que** `missing …/tool-error.schema.json` : les 4 autres fichiers ont déjà été remplacés. L'arbre est mi-neuf, mi-ancien.
  - L'en-tête dit pourtant « renames them all into place (nothing half written) ».
- **Correctif** : soit changer l'en-tête et le G7 en « chaque fichier est remplacé atomiquement ; sur un échec, relancer `--write` puis `--check` », soit écrire un répertoire frère complet puis échanger les répertoires. La première solution suffit, puisque le système reste fermé : sortie 1, et `--check` rouge.

---

## Partie b (G2 neuve) : **non bloquant**

Les octets de la version sont justes : tables = servi, déclaration exacte, rejeu reproduit, aucune fuite. Mais les deux gardes ne vivent que dans l'écrivain. `spec-publish`, l'outil qui produit la version, publie une table qui les viole (N-1 b), et le câblage même de la garde dans l'écrivain n'est tenu par aucun test (N-2 b). Ces deux points et N-3 b sont à replier avant le go de publication.

Suite de b : `node --test test/spec-1-1-0-release.test.ts` passe 10/10 sur `f9290ecc`.

### 1. Tables = servi (35/35)

J'ai lancé `runGate` en processus, une requête par classe :
- 32 classes kata : clé `kata:g2probe@venue/<SYM>USDT/<h>`, `produced_at` sur la grille, `nowMs` fixé, `alpha` et `nMin` imposés par la classe ;
- 3 classes marginales : USDe avec son `predictor_id` engagé, liquidation avec `alpha` 0.01, `nMin` 100 et un `yhat` entier.

| Contrôle | Résultat |
|---|---|
| `sha256(fichier)` = `verdict.policy_table_sha256` reçu = `t.policy_table_sha256` | **35/35** |
| CR dans un fichier | 0 |
| LF final | 0 |
| `served_tables` de `vectors-1.1.0.json` = sha256 des 35 fichiers | 35/35 |

### 2. La déclaration `contract-1.1.0`

- **sha256** : les 48 entrées sont toutes justes. `plan` contrôle `input_digest` sur chacune, et le rejeu est vert.
- **`previous_commit`** : `ddfee9e076d979081fa7b21ec27940e3556bacf7` est égal au `HEAD` du clone. Le clone est propre (`status` vide).
- **Rien n'est retiré** : `git ls-files` à `ddfee9e` donne `KATA-SPEC.md`, `reports/README.md`, `reports/wave1-report.md` et `vectors.json`. Les 4 sont reportés depuis la racine `previous`, avec les mêmes `kind` et sha256 que `kata-wave1`, et aucun `withdrawn` n'est signalé.
- **Sorties** : elles sont uniques, puisque `parseInputs` refuse toute collision, casse comprise. Tout ce qui est neuf est sous `contract-1.1.0/`. Seuls les 4 fichiers reportés restent à la racine, à leur chemin publié.
- **Kinds** :
  - `policy-table` × 35 et `schema` × 5 ;
  - `text` pour `CONTRACT.md` et pour les deux `.md` reportés ;
  - `json` pour `vectors.json` et `vectors-1.1.0.json`.

  Ils sont justes.
- **Rejeu hors ligne** : `spec-publish --release contract-1.1.0 --date 2026-10-06 --out <répertoire de travail>/rel1 --root recherches=… --root previous=…`.
  - Sortie 0, **48 fichiers** ;
  - `MANIFEST.sha256` vaut `ec5c4fa8e50f9ec94898c93cea0e5aaadef2a5ff43213bab270a94347ce30bb9`, égal au G7 ;
  - `sha256sum -c --strict MANIFEST.sha256` est vert, avec 0 ligne non OK ;
  - aucun fichier exécutable.

### 3. Les gardes

- **F-1** (n ≤ 30 refusé) :
  - la règle est conforme au texte §10, l.360 : « No published table file carries the digest of a 0/1 sequence of 30 points or fewer » ;
  - les lignes publiées ont n 613 et 170, avec `p_served` 553 et 170 : elles passent ;
  - 30 est refusé, et 31 est admis (test).
- **Câblage de la garde** : `tableText` est appelée par `expectedFiles`, donc la garde joue en `--write` **et** en `--check`. Elle n'est **pas** dans `spec-publish`.
- **`recompute`** : même câblage. `!== null` refuse aussi une clé absente (`undefined`), ce qui est le bon côté.

#### N-1 (b) : `spec-publish` publie une table qui viole les deux gardes

- **Preuve** : dans une racine `governance` de travail (copie de `spec/contract-1.1.0`), j'ai modifié la table `stable-run-velocity-24h` à la main, réécrit les octets canoniques, puis réépinglé son sha256 dans une copie de la déclaration (`--inputs`).

  | Modification | `spec-publish` | Fichier publié |
  |---|---|---|
  | `n: 30` | **OK**, sortie 0, `MANIFEST` `af0a3f66…` | `"n":30` |
  | `recompute: {verifier: "someone@1", …}` | **OK**, sortie 0, `MANIFEST` `000791e1…` | `"recompute":{…}` |

- Seul un `--check` de l'écrivain sur cette racine verrait l'écart (`differ …/stable-run-velocity-24h.json`, sortie 1), et seulement comme dérive, sans nommer la règle. Or ce contrôle n'est câblé ni à `package.json` ni à `spec-publish`.
- Une entrée `policy-table` de racine `recherches` ou `previous` échappe entièrement à l'écrivain.
- `ETAT.md` dit pourtant « gardé ».
- **Correctif** :
  - déplacer les deux règles dans `contentProblems` pour `kind === "policy-table"`, avec les nouveaux codes `recompute_held` et `short_digest` et un seul `SHORT_N` exporté par `spec-publish.mjs` ;
  - `tableText` appelle cette même fonction ;
  - test : `plan` sur une racine `governance` de travail dont la table est modifiée attend `short_digest`, puis `recompute_held` ;
  - tueurs : supprimer chaque règle dans `contentProblems`.

#### N-2 (b) : le câblage de la garde dans l'écrivain n'est tenu par aucun test

- **Preuve** : le tueur Kb2, `text: tableText(t.table)` → `text: canonicalJson(t.table)` (`spec-policy-tables.mjs:62`), **survit** : 10/10 verts.
- Les tests appellent `tableText` directement, et les tables servies sont conformes. Le chemin `--write`/`--check` peut donc perdre la garde sans qu'aucun test rougisse.
- **Correctif** : ajouter le paramètre `expectedFiles(root, tables = SERVED_POLICY_TABLES)` ; asserter que `expectedFiles(root, [table avec n 30])` est refusée par `SHORT-DIGEST-INVERSION-1`, et faire de même pour `recompute`. Kb2 doit être tué. Si N-1 (b) est replié, ce test peut porter sur `plan`.

#### N-3 (b) : le texte 1.1.0 et ses vecteurs ne sont dans aucun commit

- **Preuve** : `git -C le clone local de recherches status` donne `?? kata/spec/CONTRACT-1.1.0.md` et `?? kata/spec/vectors-1.1.0.json`. `git log --all -- kata/spec/CONTRACT-1.1.0.md` est vide.
- La racine `recherches` lit l'arbre de travail sans contrôler de commit, à l'inverse de `previous`, qui contrôle `previous_commit` et `previous_dirty`.
- Le sha256 épinglé garantit les octets, mais aucun commit ne les porte. La version n'est reproductible qu'à partir de ce clone local.
- **Correctif** :
  - committer les deux fichiers dans le dépôt de recherche, après la G2 du texte ;
  - noter le commit dans le `note` de la déclaration et au G7 ;
  - en option, faire refuser par `plan` une entrée `recherches` non suivie ou modifiée (`git ls-files --error-unmatch` et `git diff --quiet HEAD -- <path>`, nouveau code `input_untracked`).

  C'est un **préalable au go de publication**, pas à la fusion du lot.

#### M-1 (b) : la garde « courte » ne lit que `n`

- **Constat** : une ligne porte aussi `aux_sha256` et `series_sha256` (`aux_seq` = `label`, soit une suite 0/1 sur une classe `dir`) et `p_served`. Ces empreintes peuvent couvrir une suite plus courte que `n`.
- Aujourd'hui, elles sont nulles sur les deux lignes, et il n'y a aucune ligne kata. `ETAT.md` affirme pourtant que « la garde couvre plus que la promesse ». C'est vrai pour `n`, pas en général.
- **Correctif** : refuser aussi `p_served ≤ 30` et toute ligne où `aux_sha256` ou `series_sha256` est non nul, jusqu'à la révision kata. Ou bien reformuler la ligne `ETAT.md`.

#### M-2 (b) : chemins du texte, à remonter à la G2 du texte

- **Constat** :
  - `CONTRACT.md` est publié en `contract-1.1.0/CONTRACT.md`. Il dit « published under `schemas/` » (l.22) et « `policy/<task_class>.json` in this repository » (l.350), alors que ces chemins sont relatifs au répertoire de version.
  - Les descriptions des schémas citent `contract-1.1.0/CONTRACT.md`, relatif à la racine.
  - Le §15 dit qu'une révision datée change des lignes « by new table files », alors que la règle est d'un fichier par classe.
- **Correctif** : écrire « next to this file » ou `contract-1.1.0/policy/<task_class>.json`, et trancher au §15 la mutabilité de `contract-1.1.0/policy/*.json` (lien avec N-2 a).

### 3b. Fuites

Aucune fuite trouvée.
- **Recherche** sur les 35 tables : adresses e-mail, `http(s)://`, adresses IP, `/home`, `recherches`, `monark-*`, `localhost`, ainsi que les mots `price`, `usd`, `tvl` et `market`. Zéro résultat, hormis ce qui suit.
- **`source.generator`** : seulement `scripts/record-usde-calib.mjs` et `scripts/record-u4b-calib.mjs`.
- **`registry_file`** : `fixtures/usde-calib-scores.json` et `sha256:fd6fab7e…`. Aucun hôte, aucune adresse e-mail, aucun nom de dépôt privé.
- **`qhat` 126184298996** : c'est le quantile calibré déjà servi par le verdict. **L'adresse `0x4c9e…68b3`** est celle du contrat USDe. Ce sont des valeurs publiques ou déjà servies, pas des prix de marché.
- `contentProblems` donne 0 problème sur les 40 fichiers de gouvernance (test).

### 4. Tueurs tirés à la main (application, exécution, restauration)

- **Avant** : écrivain `407aeba4…`, `spec-publish.mjs` `15173250…`.
- **Après** : identiques.
- `git status` de l'arbre jetable est vide.

| Tueur | Résultat |
|---|---|
| Kb1 `r.n <= SHORT_N` → `r.n < SHORT_N` | tué (9/10) |
| Kb5 `r.recompute !== null` → `false` | tué (9/10) |
| Kb4 regex → `out`, sans retrait de la version | tué (9/10) |
| Kb2 `tableText` → `canonicalJson` dans `expectedFiles` | **survit** (10/10), voir N-2 (b) |
| Kb3 regex permissive | **survit** (10/10, et 14/14 pour `spec-publish.test.ts`), voir N-1 (a) |

### 5. R-25

Je l'ai mesuré avec le pathspec exact du job (`ci.yml:98`), en diff à trois points.

| Branche | Contre | Mesure |
|---|---|---|
| `-a` | `8aea2299` | **537** (+536/−1), 9 fichiers |
| `-b` | `-a` (`4ff932be`, base de fusion) | **212** (+197/−15), 40 fichiers |
| les deux | `8aea2299` | 723 |

Les chiffres du G7 sont exacts, et la scission est saine sous deux conditions.

#### M-3 (b) : conditions de la scission R-25

- **Preuve** : `-a` est à 537 pour une borne de 547 (G0 §5), soit une marge de **10 lignes**. `-b` mesuré contre le tronc donnerait 723.
- **Correctif** :
  - fusionner `-a` par un vrai commit de fusion, sans squash ni rebase, puis ouvrir `-b` contre le tronc qui contient `-a` ; sinon la mesure de `-b` reprend les lignes de `-a` ;
  - ranger tout repli de cette G2 dans `-b` (N-1 a vit déjà dans `-b` ; N-2 a et M-1 a y tiennent aussi) et ne plus toucher `-a`.

### 6. Windows

- **Chemins** : `join` partout, et chemins logiques en `/` des deux côtés de `differences`.
- **Point d'entrée** : `isMain` par `realpathSync`, casse repliée sous win32.
- **Liens** : le saut sous win32 sans privilège est nommé (`throughLink`).
- **Remplacement** : `renameSync` sur un fichier existant fonctionne sous Windows, sauf si le fichier est ouvert (`EPERM`). Le système reste alors fermé, voir M-1 (a).
- **Fins de ligne** : `.gitattributes` porte `* text=auto eol=lf`. Les tables n'ont aucun LF, et les copies ne contiennent aucun CR (épinglé).

#### M-4 (b) : `okPath` admet un segment `...` (antérieur au lot)

- **Constat** : `okPath` admet un segment fait de points seuls, et N-1 (a) en dépend pour `.../policy/…`. Sous Win32, les points finaux d'un segment sont retirés à la normalisation, donc un tel chemin ne désigne pas ce qu'il écrit.
- **Correctif** : refuser dans `okPath` tout segment `/^\.+$/` (et en option les noms réservés `CON`, `AUX`, `NUL`, etc.), avec un test.

---

## Synthèse

| Partie | Verdict | Constats |
|---|---|---|
| a (delta) | **non bloquant** | N-1 à N-4 et M-1, M-2, M-4, M-5, M-6 de la G2 précédente : clos. M-3 : partiel. Nouveaux : N-1 (regex du chemin de table), N-2 (immuabilité du `$id` non tenue), M-1 (`--write` atomique par fichier seulement). |
| b | **non bloquant** | Tables = servi 35/35 ; déclaration exacte ; rejeu 48 fichiers, `MANIFEST` `ec5c4fa8…`, `sha256sum -c --strict` vert ; aucune fuite. Nouveaux : N-1 (gardes absentes de `spec-publish` : table n 30 ou `recompute` publiée en sortie 0), N-2 (câblage de la garde non testé, Kb2 survit), N-3 (texte et vecteurs non commités), M-1 à M-4. |

À replier avant le go de publication : N-1 (a), N-1 (b), N-2 (b) et N-3 (b), tous dans `-b` (M-3 b).
