# G7 du lot SPEC-1-1-0-RELEASE : la version `contract-1.1.0` du dépôt de la spécification

**Rien n'est publié ni poussé.**

- **Plan** : `docs/G0-lot-spec-1-1-0-release.md` (`c3e52972`), et son bloc daté §7 (`a33c1495`, réponses de MONARK, avant les tests rouges).
- **Base** : `597a986d`. Tronc fusionné : `lot/etude-suite` `8aea2299` (fusion de T0, #192). Il ne diffère de la base que par quatre documents.
- **Scission R-25** : la mesure entière vaut 568, au-delà de 547. Le lot passe donc en deux branches empilées, comme au §7 du G0.
- **En attente** : l'entrée du texte `CONTRACT-1.1.0.md` (racine `recherches`), dernier pas, quand son chemin et son sha256 sont donnés.


## État courant (2026-10-06, 03:2x UTC, après la G2 delta b ; seule source des valeurs courantes)

Les sections qui suivent sont des relevés datés, dans l'ordre du lot : leurs empreintes, leurs comptes et leurs têtes sont ceux de leur moment. Les valeurs courantes sont celles-ci :

| Élément | Valeur |
|---|---|
| tête de `-a` | `4ff932be` (inchangée depuis le repli de sa G2) |
| tête de `-b` | `7485b648` (repli de la G2 delta b), puis le commit qui porte ce G7 |
| recherches | `1107e12` (contient `3712fc8` et `54fd670`) |
| `contract-1.1.0/CONTRACT.md` | `ac8187fa76626256d3e4c16bb484257b5247a9faf1a40ed1dc1247f7374332aa` |
| `contract-1.1.0/vectors-1.1.0.json` | `190b9fd8f48815c10db2ff62be2961e601388f20b1d4a6e8dfb44ca139214d53` |
| `README.md` (racine) | `71f64c8af6c47bb4c1b9f532de9d38845824abf68e580bfccdbcd2f15bed4ecd` |
| rejeu hors ligne (`previous` = clone propre de `ddfee9e`) | **49 fichiers** ; `sha256sum -c --strict` vert ; aucun `withdrawn` ni `rewritten` |
| `MANIFEST.sha256` | `66d31d82122587a9da8725f3e19b39b43f371de826c1e9f311ea6a1755d4eb16` |
| R-25 | `-a` 537 contre `8aea2299` ; `-b` 466 contre `-a` |
| tests touchés | 45/45 ; ancres 33/33 ; red-proof `-b` OK (19 jugés, 19 tueurs tués) |
| b M-2 | réglé dans le texte à `1107e12` (l.441, 449, 587) |

## Commits

| Branche | Commits |
|---|---|
| `recherches/spec-1-1-0-release-a` | G0 `c3e52972`, bloc daté `a33c1495` ; tests rouges `07b232fc` ; gel `c85f352e` (écrivain, surface de types, cinq copies de schémas) ; fusion du tronc `e8fb1a8a` |
| `recherches/spec-1-1-0-release-b` (sur `-a`) | tests rouges `29ae484a` ; gel `d0f686b6` (35 tables, déclaration `contract-1.1.0`) ; fusion du tronc `21f09456` ; fusion de `-a` `4e69d6d8`, qui rend `e8fb1a8a` ancêtre (une seule base de fusion) ; ce G7 |

## Ce que le lot livre

- **`scripts/spec-policy-tables.mjs`** `--write | --check [--root <rép>]` :
  - il lit `SERVED_POLICY_TABLES` de `apps/harness/src/tools/gate.ts`, la valeur servie, et n'en construit pas une seconde ;
  - il écrit `canonicalJson` de chaque table sous `spec/contract-1.1.0/policy/` ;
  - il écrit les copies des schémas par la liste fermée du §3 du G0 ;
  - il ne lit ni horloge ni réseau.
- **`spec/contract-1.1.0/`** : 5 schémas (disposition gelée, lisibles) et 35 tables (une ligne canonique chacune).
- **`scripts/spec-publish-inputs.json`** : la version `contract-1.1.0`, ajoutée après `kata-wave1`, dont les lignes, et donc les tueurs existants, ne bougent pas.
  - `previous_commit` `ddfee9e` ;
  - quatre fichiers reportés de `previous` ;
  - 40 entrées de gouvernance, toutes épinglées.
- **`test/spec-1-1-0-release.test.ts`**, 5 tests :
  - `-a` : copies de schémas = transformation fermée, données inchangées ; `--write` et `--check` sur une copie temporaire (écart, manquant, en trop, sorties 0, 1 et 2) ;
  - `-b` : déclaration épinglée ; table servie = fichier = `policy_table_sha256` = `sha256Canonical` ; `plan` hors ligne sur la seule racine de gouvernance, où seules les racines absentes sont nommées ; porte à 0 problème sur les 40 fichiers.

## Oracle

- **red-proof** `--base 597a986d --seed 37` :
  - `-a`, gel `c85f352e`, `--draw 2` : **OK**. 2 F2P, 2 tueurs tirés, 2 tués. `RED-PROOF.json` sha256 `6834a7285a11c4ca…`.
  - `-b`, gel `d0f686b6`, `--draw 5` : **OK**. 5 F2P, 5 tueurs tirés, 5 tués. `RED-PROOF.json` sha256 `c1df4699ccf2ffc7…`.
- **R-25** :

  | Branche | Contre | Mesure |
  |---|---|---|
  | `-a` | `8aea2299` | **442** (+442/−0), contenu 0 |
  | `-b` | `-a` (`e8fb1a8a`) | **128** (+127/−1) |
  | `-b` | `8aea2299` | 568 |

  Les deux branches restent sous 547 chacune.
- **Ancres** (`verifie-ancres.mjs --touched 597a986d HEAD`) : 5 tueurs, ANCRE 5, DERIVE 0, PERDU 0.
- **Contrôles statiques** : `tsc` vert ; eslint du test vert (les `.mjs` et `.d.mts` sont hors eslint par configuration) ; `lint:ratchet` 69/69 ; `gate:vocab`, `lang:gate` et `export:check` verts.
- **Tests touchés** : `spec-1-1-0-release`, `spec-publish`, `contracts-frozen`, `export-public` hors test 42 et `public-text-deny` : 31/31.
- **Octets servis** :
  - `buildOpenApi()` en processus : sha256 `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`, inchangé ;
  - aucun fichier sous `apps/`, `packages/` ou `schemas/` n'est touché ;
  - aucun fichier réservé à T0-TOOLING-1 n'est touché.

## Rejeu hors ligne

Relevé daté du premier gel (`9d19e842`), remplacé par l'« État courant » : `--release contract-1.1.0 --date 2026-10-06` produit **46 fichiers** dans le répertoire de travail temporaire, avec `previous` le clone local propre de `ddfee9e` et `recherches` le clone local.
- `MANIFEST.sha256` vaut `e39372ca…1df3` ;
- `sha256sum -c --strict` est vert ;
- aucun `withdrawn`.

Le texte de la spécification n'est pas encore dans la liste : le manifeste changera avec lui.

## Pour MONARK

- **VERIFIERS-LIST-F5A-1** : non touché par cette version (aucune ligne kata, `recompute` nul sur les lignes marginales). Il vaut toutefois pour toute ligne kata avec `recompute`, pas seulement pour la vague 2 (G0 §7).
- **Dernier pas** : une entrée `{"out": "CONTRACT-1.1.0.md", "root": "recherches", "path": "kata/spec/CONTRACT-1.1.0.md", "kind": "text", "sha256": …}`, avec son test (R-1 étendu), puis le rejeu.

## Repli de la G2 (partie a)

Rapport : `docs/G2-lot-spec-1-1-0-release-a.md`. Verdict **non bloquant**. Tout est replié, mineurs compris (règle « pas de dette » du fondateur). Les décisions de MONARK sont au bloc daté §8 du G0. Ce bloc remplace, là où ils diffèrent, les chemins, les empreintes et les mesures des sections précédentes.

### Commits (sans réécriture : ni amend, ni rebase)

| Branche | Tête | Commits du repli |
|---|---|---|
| `-a` | `4ff932be` | tests `9958d812` ; gel `d526d629` ; G0 §8 et rapport G2 `4ff932be` |
| `-b` | ce G7, sur la fusion `faed7218` | fusion de `-a` `67cbb7b5` ; tests `2dd90163` ; gel `a3af81d0` ; `ETAT.md` `4d4375b4` ; texte 1.1.0 (test `57f892d2`, entrées `83357af4`) ; fusion de `-a` `faed7218` |

### Constats repliés

| Constat | Repli |
|---|---|
| N-1 | Sorties versionnées : `contract-1.1.0/{schemas,policy}/…`, `contract-1.1.0/CONTRACT.md`, `contract-1.1.0/vectors-1.1.0.json`. `$id` en `…/raw/main/contract-1.1.0/schemas/<nom>.schema.json`, qui passe `URL_ALLOW`. Test Ajv 2020 : les 5 copies chargées ensemble valident une `GateDecision` servie (et refusent un `alpha` altéré à travers le `$ref`), et valident les 35 tables. |
| N-2 | Point d'entrée par chemin réel, casse repliée sous win32, dans l'écrivain et dans `spec-publish.mjs:243`. Deux tests lancent chaque script par un lien symbolique, avec un saut nommé sous win32 sans privilège. |
| N-3 | `tableText` refuse une ligne dont `recompute` est non nul, en nommant VERIFIERS-LIST-F5A-1. Ligne datée dans `docs/ETAT.md` : le déclencheur devient la première ligne publiée qui porte un `recompute`. |
| N-4 | `, never an investment return or income paid to anyone.` : 0 problème. |
| M-1 | Les 5 sha256 des copies sont épinglés dans la partie a. Le tueur K3 de la G2 (texte remplacé, copie régénérée) est tué. |
| M-2 | `--check` parcourt tout `spec/contract-1.1.0/`. |
| M-3 | `--write` écrit des temporaires puis renomme ; il les retire en cas d'échec ; une seule ligne `REFUSED` et la sortie 1. |
| M-4 | `spec section N` devient `contract-1.1.0/CONTRACT.md section N` (5, 10, 13 : titres vérifiés dans le texte). |
| M-5 | G0 et G7 parlent désormais de « 0 problème au sens de `contentProblems` ». `checkPublicText` brut ne voit, par copie, que l'URL du méta-schéma du `$schema`, que `spec-publish` excepte. |
| M-6 | La partie a n'écrit et ne contrôle que les schémas (5 fichiers ; LF épinglé). La partie b ajoute les tables (40 fichiers). |
| F-1 (texte 1.1.0) | `tableText` refuse toute ligne de n ≤ 30 (SHORT-DIGEST-INVERSION-1, §10 du texte). Une empreinte ne dit pas si ses points valent 0/1, donc la garde couvre plus que la promesse. La garde vit en `-b`, avec les tables (M-6). |

`spec-publish.mjs` admet aussi une table rangée sous un répertoire de version : `[<version>/]policy/<class>.json`, sur la même ligne.

### Texte 1.1.0

Il est déclaré par deux entrées de racine `recherches`, toutes deux épinglées et à 0 problème :
- (relevé daté, remplacé : voir l'« État courant ») `contract-1.1.0/CONTRACT.md`, source `kata/spec/CONTRACT-1.1.0.md`, sha256 `642ac97e…bfbca0` ;
- (relevé daté, remplacé) `contract-1.1.0/vectors-1.1.0.json`, source `kata/spec/vectors-1.1.0.json`, sha256 `1210637f…c347`.

Si la G2 du texte change un octet, seuls ces deux sha256 et le test bougent.

### Oracle

- **red-proof** `--base 597a986d --seed 37` :
  - `-a` au gel `4ff932be`, `--draw 5` : **OK**. 5 F2P, 5 tués. `RED-PROOF.json` `ee631ca97d2c8a3c…`.
  - `-b` à `faed7218`, `--draw 10` : **OK**. 10 F2P, 10 tués. `RED-PROOF.json` `82f4db453046e24c…`.
- **Tueurs tirés à la main**, avec sha256 vérifié avant et après chaque restauration : 6/6 tués sur `-a` (K3 de la G2 compris), 11/11 sur `-b`.
- **R-25** :

  | Branche | Contre | Mesure |
  |---|---|---|
  | `-a` | `8aea2299` | **537** (+536/−1) |
  | `-b` | `-a` (`4ff932be`) | **212** (+197/−15) |
  | les deux | `8aea2299` | 723 |

  Chaque branche reste sous 547.
- **Ancres** : `-a` 5/5, `-b` 10/10 ANCRE ; 0 DERIVE, 0 PERDU.
- **Contrôles statiques** : `tsc`, eslint du test, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` verts.
- **Tests touchés** : `spec-1-1-0-release`, `spec-publish`, `contracts-frozen`, `export-public` hors test 42 et `public-text-deny` : 36/36.
- **Octets servis** : `buildOpenApi()` vaut `61c9df97…8ccbf0`, inchangé. Hors `spec/`, `docs/`, le test du lot et `scripts/spec-*`, rien n'est touché.
- **Rejeu hors ligne**, relevé daté du repli de la G2 de a, remplacé par l'« État courant » (`previous` = clone propre de `ddfee9e`, `recherches` = clone local, `--out` temporaire) : **48 fichiers** ; `MANIFEST.sha256` `ec5c4fa8…0bb9` ; `sha256sum -c --strict` vert ; aucun `withdrawn`.

## Repli des G2 (delta a, b)

Rapport : `docs/G2-lot-spec-1-1-0-release-delta-a-et-b.md`. Les deux parties sont **non bloquantes**, et tout est replié (règle « pas de dette »).
- Tous les commits sont sur `-b`. `-a` reste à `4ff932be`, soit 537 lignes R-25 pour une borne de 547 (M-3 b).
- Aucune réécriture d'historique.

### Commits

| Commit | Contenu |
|---|---|
| `12a7ff7f` | tests rouges |
| `7872ed0f` | gel : porte, écrivain, déclaration |
| `4777cfbf` | test du répertoire de version `contract-<x.y.z>` |
| `921a3dbd`, `4c61e1f2` | tests rendus rouges par assertion à la base, et non par import ou ENOENT ; demandé par red-proof |
| commit suivant | `ETAT.md` et rapport de G2 |
| ce commit | ce G7 |

### Constats repliés

| Constat | Repli |
|---|---|
| b N-1 | Les deux gardes vivent dans la porte : `tableRowProblems` de `spec-publish.mjs`, codes `short_digest` et `recompute_held`. `contentProblems` l'applique à toute entrée `policy-table`, quelle que soit sa racine, et `tableText` de l'écrivain appelle la même fonction. Les sondes de la G2 (`hack.mjs`, table modifiée à la main puis réépinglée), rejouées sur la déclaration réelle, sont refusées, sortie **1**, avec un seul problème chacune : `short_digest` et `recompute_held`. Un test refait les deux sondes, par `plan` et par la CLI. |
| b M-1 | La règle « courte » refuse une ligne si `n` ≤ 30, si `p_served` ≤ 30, ou si `aux_sha256` ou `series_sha256` est non nul (la ligne n'écrit pas le nombre de points de ces deux empreintes). Elle tient la promesse du §10 à `3712fc8` : « No published table file carries a row of 30 points or fewer ». |
| b N-2 | `expectedFiles(root, tables)` : un test passe par `expectedFiles` une table de n 30, puis une table avec un `recompute`. Le tueur Kb2 (`tableText` → `canonicalJson`) est tué. |
| a N-1 | Appariement fermé `^(?:(contract-\d+\.\d+\.\d+)/)?policy/([^/]+)\.json$`. Le répertoire, s'il est présent, doit égaler l'identifiant de la version. Sont refusés : `policy/policy/…`, `.../policy/…`, `-/policy/…`, `reports/policy/…`, `contract-9.9.9/policy/…`, `../policy/…`, `…/policy/x/…`, une autre classe, et `kata-wave1/policy/…` sur `kata-wave1`. |
| a N-2 | Nouveau code `rewritten` dans `plan` : un fichier de l'arbre `previous` rangé sous `contract-*/` et republié avec d'autres octets est refusé. `KATA-SPEC.md`, à la racine, reste révisable. Test sur un arbre `previous` fabriqué. |
| a M-1 | `--write` écrit tous les temporaires, puis renomme. Si un renommage échoue, il rend leurs octets précédents aux fichiers déjà remplacés. Le test injecte un échec au dernier renommage (le 40e) : les 39 fichiers remplacés reviennent à leurs octets d'avant. |
| b M-4 | `okPath` refuse tout segment fait de points seuls (`...`, `....`). |
| b N-3 | Le texte, les vecteurs et le README racine sont commités dans le dépôt de recherche, à `3712fc8`, et la déclaration les épingle (relevé daté ; `CONTRACT.md` est réépinglé depuis à `ac8187fa…`, recherches `1107e12`) : `b02b0599…`, `190b9fd8…` (vecteurs sur une ligne) et `71f64c8a…` (sortie `README.md`). |
| M-3 b | Tout dans `-b`. `-a` doit être fusionnée par un vrai commit de fusion avant que `-b` soit ouverte contre le tronc. |

### b M-2 : lignes du texte à aligner (dépôt de recherche, non modifié ici)

Relevé daté, à `3712fc8` (réglé depuis à `1107e12`, voir l'« État courant ») ; `kata/spec/CONTRACT-1.1.0.md` :
- l.22 et §10 l.350 disent déjà « in this directory » : alignés.
- l.441 « Rows are added, superseded and retired only by new table files. » et §15 l.587 « add, supersede or retire policy table rows, and add classes, by new table files; » contredisent a N-2 : un fichier `contract-1.1.0/policy/<classe>.json` n'est plus jamais réécrit.

  Proposition pour l.587 : « …and add classes, by table files published under a new directory of this repository (a file under `contract-1.1.0/` is never rewritten); ». Le texte de l.441 serait à aligner de même.

  La forme du nouveau répertoire (version datée, ou `contract-1.1.0/policy-<date>/`) est à trancher par MONARK. Elle détermine aussi ce que le serveur sert après une recalibration.
- l.449 « A table file published in this repository is never withdrawn. » : proposition « …is never withdrawn and never rewritten. »

### Oracle

- **red-proof** `-b` `--base 597a986d --gel 4c61e1f2 --draw 16 --seed 37` : **OK**.
  - 15 tests jugés, 15 tueurs tirés, 15 tués. Les 14 tests de `spec-publish.test.ts`, dont seules les lignes de tueur ont bougé, sont « unchanged ».
  - `RED-PROOF.json` `7e062077c5ad480e…`.
  - Deux refus intermédiaires sont corrigés : `tableRowProblems` importé statiquement, et `ENOENT` à la base.
- **Tueurs tirés à la main** (sha256 vérifié avant et après) : 20/20 tués.
  - Les 15 tueurs déclarés, plus K3 de la G2 et quatre tueurs supplémentaires : restauration de `--write`, `p_served`, `aux_sha256`, et l'élargissement du groupe de version.
  - Ce dernier survivait d'abord : il est tué par le test `kata-wave1` (`4777cfbf`).
- **R-25** :

  | Branche | Contre | Mesure |
  |---|---|---|
  | `-b` | `-a` (`4ff932be`) | **392** (+346/−46) |
  | les deux | `8aea2299` | 885 |

  `-a` reste à 537.
- **Ancres** : 29 tueurs, ANCRE 29, DERIVE 0, PERDU 0. Les lignes des tueurs de `spec-publish.test.ts` suivent le code déplacé.
- **Contrôles statiques** : `tsc`, eslint (les deux tests), `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` verts.
- **Tests touchés** : `spec-1-1-0-release`, `spec-publish`, `contracts-frozen`, `export-public` hors test 42 et `public-text-deny` : 41/41.
- **Octets servis** : `/openapi.json` en processus vaut `61c9df97…8ccbf0`. Hors `spec/`, `docs/`, `test/spec-*` et `scripts/spec-*`, rien n'est touché.
- **Rejeu hors ligne**, relevé daté du repli des G2 (delta a, b), avant le réglage de b M-2, remplacé par l'« État courant » (`previous` = clone propre de `ddfee9e`, `recherches` = clone local à `54fd670`, qui contient `3712fc8`) : **49 fichiers** ; `MANIFEST.sha256` `509283bd1189d0b79614a9aa1da4b2a921a4abc7883af793f2bac244ccfe8b6f` ; `sha256sum -c --strict` vert ; aucun `withdrawn` ni `rewritten`.

## Repli de la G2 delta b

Rapport : `docs/G2-lot-spec-1-1-0-release-delta-b.md`. Verdict **non bloquant**, et tout est replié.
- Tous les commits sont sur `-b` : tests `35f4c254`, gel `243ce4b9`, `ETAT.md` et rapport `7485b648`, puis ce G7.
- `-a` reste à `4ff932be`.

### Constats repliés

| Constat | Repli |
|---|---|
| N-1 | `contentProblems` refuse en `policy_table_kind` toute sortie `policy/*.json`, à toute profondeur, et toute valeur dont la **racine** est une table `class-policy-v2`, si elles ne sont pas déclarées `policy-table`. Les tables imbriquées dans un fichier de vecteurs restent des données. Une table reportée à l'octet depuis l'arbre `previous`, au même chemin, peut être rangée sous un répertoire de version plus ancien, et ses lignes passent quand même `tableRowProblems`. Une table neuve reste sous le répertoire de sa propre version. |
| N-1, contournement | Le contournement de la G2 (`n` 30, entrée en `kind: "json"` puis `"text"`, réépinglée, sur la déclaration réelle avec les trois racines) est rejoué : sortie **1**, un seul problème (`policy_table_kind`), `--out` absent. |
| M-1 | Ligne datée dans `ETAT.md` : « table publiée » se lit **fichier de table** publié. Les deux tables synthétiques de `vectors-1.1.0.json` portent `recompute`, mais elles ne sont pas des fichiers de table. |
| M-2 | La restauration de `--write` rend aussi le mode. Test sous POSIX, saut nommé sous win32. |
| M-3 | Voir la proposition ci-dessous. Une version qui ajoute un fichier sous un répertoire de version déjà publié est refusée (`added_to_published`). Le nom d'un répertoire de version a une forme fermée (`version_dir_invalid`). |
| M-4 | `tableRowProblems` refuse : une ligne qui n'est pas un objet (`policy_table_invalid`) ; un `n` absent ou qui n'est pas un entier sûr ; un `p_served` non nul qui n'est pas un entier sûr (`short_digest`). |

### M-3 : proposition à MONARK (répertoires de version)

- **Grammaire** :
  - `contract-<major>.<minor>.<patch>` pour une version du contrat ;
  - `contract-<x.y.z>-tables-<YYYY-MM-DD>` pour une révision datée qui ne publie que des tables, sans changer `schema_version`. Exemple : `contract-1.1.0-tables-2026-11-01/policy/<classe>.json`.

  Une version (`--release`) qui publie des tables neuves porte comme identifiant le nom de son répertoire.
- **Pourquoi cette forme** :
  - la version du contrat reste en tête, si bien que le tri lexical regroupe les révisions de 1.1.0 ;
  - la date est celle de la note de version, que le texte nomme déjà (l.441 à `1107e12` : « a new directory of this repository that the release notes name ») ;
  - un compteur `-r<n>` demanderait un registre, et la date est déjà l'unique temps de l'outil (`VERSION`).
- **Règles tenues par la porte** :
  - un répertoire publié est fermé : aucun fichier n'y est réécrit (`rewritten`) ni ajouté (`added_to_published`) ;
  - une version ajoute seulement sous un répertoire neuf, ou à la racine (`KATA-SPEC.md`, `README.md`) ;
  - les tables 1.1.0 sont reportées à l'octet dans les versions suivantes.
- **Ce que MONARK décide** : retenir cette forme, ou en nommer une autre (seule `VERSION_DIR` change), avant la première recalibration publiée.

### Oracle

- **red-proof** `-b` `--base 597a986d --gel 7485b648 --draw 20 --seed 37` : **OK**. 19 tests jugés, 19 tueurs tirés, 19 tués. `RED-PROOF.json` `969b2bb83604cac6…`.
- **Tueurs tirés à la main** (sha256 vérifié avant et après) : **25/25 tués**. Ce sont les 19 tueurs déclarés, plus six : la grammaire de `VERSION_DIR`, la garde des lignes non objets, `n` et `p_served` en entier sûr, la détection par `row_format` et le contrôle `version_dir_invalid`.
- **R-25** : `-b` contre `-a` vaut **466** (+418/−48), sous 547 ; `-a` reste à 537.
- **Ancres** : 33/33, 0 DERIVE, 0 PERDU.
- **Contrôles statiques** : `tsc`, eslint, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` verts.
- **Tests touchés** : 45/45.
- **Octets servis** : `/openapi.json` `61c9df97…`, inchangé.
- **Rejeu hors ligne** (`previous` = clone propre de `ddfee9e`, recherches `1107e12`) : **49 fichiers** ; `MANIFEST.sha256` `66d31d82122587a9da8725f3e19b39b43f371de826c1e9f311ea6a1755d4eb16`, inchangé, puisque les octets de la version n'ont pas bougé ; `sha256sum -c --strict` vert.
