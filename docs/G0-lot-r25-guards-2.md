# G0 - lot R25-GUARDS-2 (trois refus avant le compte de R-25 : un actif déclaré porte le nombre magique de son format ; une ligne finit par LF ; ni gitlink ni lien symbolique)

- **Mission** : lot formé par MONARK, fermant trois items « avant T0 » portés par RECHERCHES, formés au pli de la G2 de R25-GUARDS-1 (`docs/G7-lot-r25-guards-1.md` section 9.3) :
  - **R25-ASSET-DIR-MAGIC-1** (reste de R-1) : dans un répertoire autorisé, un fichier à NUL d extension déclarée compte 0, même s il porte du code (`out/x.png`) ;
  - **R25-CR-ONLY-LINES-1** (R-2) : un fichier dont les lignes sont séparées par CR seul compte 1 ligne, et un JS de 3 001 instructions ainsi séparées s exécute ;
  - **R25-GITLINK-SYMLINK-1** (Q-3, N-8) : un sous-module ajouté (mode `160000`) compte 1 ligne, son code vit dans un autre dépôt ; décider des liens symboliques (mode `120000`).
- **Branche** : `recherches/r25-guards-2`, depuis `origin/recherches/r25-guards-1` à `d92de098` (PR #166, **non fusionnée** ; elle contient déjà le tronc `lot/etude-suite` à `b26fa106`). Le lot s appuie sur `attrTree`, `BINARY_ASSETS` et `PIN` de #166 : il ne se fusionne qu après elle. Aucun rebase ; une avance du tronc ou de #166 entre par un commit de fusion.
- **Statut** : G0 seul. Aucun code, aucun test dans ce commit.
- **Contexte lu** : `docs/G0-lot-r25-guards-1.md` ; `docs/G7-lot-r25-guards-1.md` (sections 8, 9, 10) ; la G2 de R25-GUARDS-1 (R-1, R-2, N-3, N-8) ; `scripts/lot-size-integration.mjs` (`PIN`, `GIT_ENV`, `pinShell`, `attrTree`, `BINARY_ASSETS`) ; `scripts/oracle/r25.mjs` ; `scripts/oracle/run.mjs` (appel de `r25()`) ; le job `r25-taille-de-lot` de `.github/workflows/ci.yml` ; ADR-M003 D9 nonies à duodecies ; `test/ci-gates.test.ts` (`ci_r25_counts_read_under_the_module_pin`) ; `test/r25-integration.test.ts` (appels de `pin`).

## 1. Existant mesuré

Mesures du 2026-10-05, Node 24.21.0, git 2.43.0, bash 5.2.21, Python 3 ; tronc `origin/lot/etude-suite` = `b26fa106` ; dépôts jetables sous le scratchpad. Le prototype de la section 2.5 n a servi qu à mesurer : il n est pas versé.

### 1.1 Le tronc

| Mesure | Résultat |
|---|---|
| Modes des entrées de l arbre (`git ls-tree -r`) | 2 170 entrées, **toutes `100644`** : 0 gitlink (`160000`), 0 lien symbolique (`120000`), 0 exécutable (`100755`). Pas de `.gitmodules` |
| Fichiers sous l union des deux pathspecs (`git diff --name-only <arbre vide> <tronc> -- <pathspec>`) | 1 038 : 990 sous CODE, 48 sous CONTENT, aucun sous les deux |
| Binaires (`--numstat` contre l arbre vide, sans attribut) | 45, les neuf couples de `BINARY_ASSETS` (G7 R25-GUARDS-1 section 9.2) |
| Fichiers suivis non binaires (2 125) contenant un CR non suivi de LF | **0** (et 0 sous les pathspecs) |
| Idem, une paire CR LF | 0 (le `.gitattributes` du dépôt pose `* text=auto eol=lf`) |
| Idem, U+2028 (`E2 80 A8`) ou U+2029 (`E2 80 A9`) | 0 et 0 |
| Idem, un octet NUL | 0 |
| Fichiers sous les pathspecs dont une ligne dépasse 500 / 1 000 / 2 000 / 4 000 / 10 000 octets | 125 / 65 / 37 / 29 / 19 ; la plus longue : 691 402 octets (`docs/biblio/procurements-M015/_raw/candle_15m_full.json`, une ligne JSON) |
| Commits du tronc qui ajoutent ou modifient un actif binaire | 32 commits (du 2026-09-22 au 2026-10-03) ; 20 modifications de fichiers d actif (des `.ots` en attente complétés) |

### 1.2 Les octets de tête des 45 binaires du tronc

| Extension | Fichiers | 8 premiers octets (hex) | Fin du fichier |
|---|---|---|---|
| `ttf` | 5 | `00 01 00 00` puis `00 12` ou `00 15` (nombre de tables) | sans objet |
| `ots` | 37 | les 32 premiers octets identiques pour les 37 : `00 4f 70 65 6e 54 69 6d 65 73 74 61 6d 70 73 00 00 50 72 6f 6f 66 00 bf 89 e2 e8 84 e8 92 94 01` (en-tête OpenTimestamps de 31 octets, puis la version `01`) | variable |
| `png` | 1 | `89 50 4e 47 0d 0a 1a 0a` | `49 45 4e 44 ae 42 60 82` (`IEND`) |
| `jpg` | 1 | `ff d8 ff db` | `ff d9` (EOI) |
| `cbor` | 1 | `a7 67 73 75 62 6a 65 63` : une table de 7 entrées (type majeur 5), première clé `"subject"` ; pas d étiquette d auto-description `d9 d9 f7` | sans objet |

Aucune police `OTTO` ni `true` au tronc : toutes les `ttf` commencent par `00 01 00 00`.

### 1.3 Les attaques, reproduites sous la lecture épinglée de #166 (`eval "$(node scripts/lot-size-integration.mjs pin)"`, puis `git diff --numstat main...pr`)

| Fichier ajouté | Compté | Exécution mesurée |
|---|---|---|
| `out/tool.png` : `// <NUL>` puis 300 lignes de JS | **0** (`- -`) | `require("./out/tool.png")` : `PNG-JS-RAN 300` |
| `src/cr.cjs` : 3 001 instructions séparées par CR seul | **1** | `node src/cr.cjs` : `CR-RAN 3000` |
| `src/ls.cjs` : 3 001 instructions séparées par U+2028 | **1** | `node src/ls.cjs` : `LS-RAN 3000` (U+2028 et U+2029 sont des fins de ligne pour JS, pas pour git) |
| `vendor/sub` : gitlink (`update-index --cacheinfo 160000,…`) | **1** | son code vit dans un autre dépôt ; `actions/checkout` ne le tire pas |
| `src/link.mjs` : lien symbolique vers `../docs/payload.md` | **1** (la cible) | la cible est hors pathspec (D9 septies) ; sous Windows (`core.symlinks=false`), le lien devient un fichier texte |
| `out/poly.png` : signature PNG valide, `\n`, 300 lignes de shell, puis `#<NUL>` | **0** | `bash out/poly.png` : `BASH-RAN 300` (bash ne refuse un fichier que si un NUL précède le premier LF) |
| `out/zip.png` : signature PNG valide, 20 NUL, puis une archive zip à `__main__.py` | **0** | `python3 out/zip.png` : `PY-ZIP-RAN` (Python lit une archive par sa fin) |
| `one.cjs` : 3 000 instructions sur une seule ligne | 1 | `node one.cjs` : `ONE-LINE-RAN` |

Ce que fait un nombre magique seul, mesuré pour chaque format (une tête valide, puis `\n echo SH-RAN \n JS…`) :

| Tête | `bash f` | `require(f)` (Node) |
|---|---|---|
| `ttf` `00 01 00 00` | refusé (`cannot execute binary file`) | `SyntaxError` |
| `ots` (en-tête de 31 octets + `01`) | refusé | `SyntaxError` |
| `png`, `jpg`, `cbor` (`a7`) | **exécuté** (le premier LF vient avant tout NUL) | `SyntaxError` (octet de tête non UTF-8, lu U+FFFD) |
| `ttf` `true` ou `OTTO` (formats admis par la spécification) | exécuté | **exécuté** : `true` est un littéral JS, et `OTTO` passe si le fichier déclare `var OTTO` plus bas (mesuré : `TRUE-TTF-RAN 300`, `OTTO-TTF-RAN 300`) |

## 2. Constructions

### 2.1 Principe : un refus avant le compte, dans `pin`, et le même dans l oracle

Les lignes `STAT=` et `CONTENT_STAT=` de `ci.yml` **ne changent pas d un octet** (`R25_DIFF_RE`, test 38, `specsOf`, `boundsOf`, `run.mjs`, M-42f′). Compter autrement (CR comme fin de ligne, gitlink compté comme le dépôt qu il désigne) exigerait de changer ces lignes ou d ajouter un second compte : rejeté. Les trois items se ferment par un **refus** (fail-closed), dont le tronc mesuré ne déclenche aucun cas (section 2.5).

Le module gagne une fonction exportée, `refusals(cwd, base, specs)`, qui rend la liste triée des chemins refusés, chacun avec son motif (`asset-magic`, `bare-cr`, `line-separator`, `gitlink`, `symlink`) :

1. **Entrées** : pour chaque pathspec de `specs` (les deux de `specsOf`), `git <PIN> diff --raw -z --no-renames --no-abbrev <base>...HEAD -- <pathspec>`, sous `GIT_ENV`. Même plage à trois points que `STAT=`, mêmes pathspecs. `--no-renames` : un renommage devient une suppression et un ajout, et l ajout porte le blob d arrivée (rien à apparier). Union par chemin, chemins lus en octets (`-z`).
2. **Modes d arrivée** : `000000` (suppression, y compris d un gitlink ou d un lien) : rien ; `160000` : refus `gitlink` ; `120000` : refus `symlink` ; `100644` et `100755` : examiné (étapes 3 et 4). Un changement de type (`T`) est jugé par son mode d arrivée.
3. **Actif ou texte** : `git <PIN> check-attr -z --stdin diff` sous `GIT_ATTR_SOURCE` = `attrTree(cwd)` (déjà prouvé en vigueur par ses sondes). `unspecified` = chemin d un couple de `BINARY_ASSETS` (`<rép>/*.<ext> !diff`) ; `set` = tout autre chemin. Le classement est donc **le même** que celui qui décide du compte, par le même moteur de motifs de git, sous `core.ignorecase=false` : aucune copie du filtrage en JS.
4. **Contenu** : les blobs d arrivée par un seul `git cat-file --batch` (pas une lecture de l arbre de travail : indifférent à `autocrlf`, à `core.symlinks`, à NTFS).
   - chemin d **actif** : refus `asset-magic` si ses premiers octets ne sont pas l un des nombres magiques de son extension (table `ASSET_MAGIC`, section 2.2) ;
   - chemin **texte** : refus `bare-cr` s il contient un octet `0d` non suivi de `0a` ; refus `line-separator` s il contient `e2 80 a8` ou `e2 80 a9` (section 2.3).

Toute erreur (git qui échoue, plage sans base de fusion, sortie illisible) lève : jamais une liste vide par défaut.

**Câblage CI** : la commande `pin` prend deux arguments **obligatoires**, `--ci <ci.yml>` et `--base <ref>`, appelle `refusals(process.cwd(), base, specsOf(ci))`, et, si la liste n est pas vide, écrit sur stderr une ligne par refus (`r25-integration: refused <motif> <chemin>`) et sort avec 2, sans rien imprimer sur stdout. Sans ses deux arguments, `pin` sort avec 2 (le job ne peut pas oublier le contrôle). Dans `ci.yml`, une seule ligne de code change, **sur place** (aucun décalage de ligne, donc aucun tueur `ci.yml:<n>` à ré-ancrer) :

```
R25_PIN=$(node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base "origin/$GITHUB_BASE_REF") || {
```

La cible vient de `$GITHUB_BASE_REF`, jamais d une expression (comme la ligne `count`). Le `::error::` existant devient, sur place : `Gate R-25: pinned git read not obtained, or a changed path refused (see the lines above). Fail-closed.` Le commentaire au-dessus de `R25_PIN` est réécrit sur place (même nombre de lignes). Le job reste retiré entier du workflow public dérivé (`derivePublicWorkflow`) : aucun mot interne n en sort ; la nouvelle ligne ne contient pas la sous-chaîne `r25`.

**Miroir dans l oracle** : `r25()` (`scripts/oracle/r25.mjs`) importe `refusals` de **son propre** module (`../lot-size-integration.mjs`, comme `attrTree`) et l appelle sur le clone, avec `base` et les pathspecs qu il lit déjà par `R25_DIFF_RE`. Une liste non vide rend le mode `refused`, une ligne `refused <motif> <chemin>` par refus dans le log, et l issue rouge (`exit 1`), les comptes `W` étant lus et enregistrés comme avant. Même fonction, mêmes entrées : l oracle refuse **au moins** ce que la CI refuse, et davantage si la PR a affaibli le module qu exécute la CI (N-3 de la G2 de #166 : le module de la CI vient de la PR, celui de l oracle non). L oracle n est donc jamais sous la CI.

**Le module en mode `integration`** (`effective`) ne fait pas le contrôle : le job s arrête à `pin`, avant `count`, et l oracle contrôle avant `integration()`. Une plage `<base>...HEAD` contient tout ce que la tête porte au-delà de la base de fusion ; un commit non prouvé dont le fichier est encore à la tête y est donc vu (question Q-8).

### 2.2 R25-ASSET-DIR-MAGIC-1 : le nombre magique des actifs déclarés

**Attaque** : `out/tool.png` (couple autorisé `out/*.png`), `// <NUL>` puis 3 000 lignes de JS : `!diff` le laisse à la détection de git, il compte 0 ; `require("./out/tool.png")` l exécute (Node charge une extension inconnue en CommonJS).

**Construction** : table fermée `ASSET_MAGIC` du module, par extension, réduite aux têtes **mesurées au tronc** :

| Extension | Têtes admises | Mesure |
|---|---|---|
| `png` | `89 50 4e 47 0d 0a 1a 0a` | 1 sur 1 |
| `jpg` | `ff d8 ff` | 1 sur 1 |
| `ttf` | `00 01 00 00` (ni `OTTO`, ni `true` : préfixes JS exécutables, mesurés ; absents du tronc) | 5 sur 5 |
| `ots` | les 31 octets de l en-tête OpenTimestamps puis la version `01` (32 octets) | 37 sur 37 |
| `cbor` | premier octet de type majeur 5, une table (`a0` à `bf`) | 1 sur 1 |

Une extension de `BINARY_ASSETS` absente de `ASSET_MAGIC` est une erreur du module (levée, donc job rouge), pas un passe-droit ; un test épingle l égalité des deux ensembles d extensions. Un fichier **texte** d un couple autorisé sans nombre magique (le `run.png` de 300 lignes de shell) est refusé lui aussi, bien qu il compte déjà ses lignes : règle plus simple, sans copie de la détection de git, et le tronc n en a aucun (question Q-2).

**Ce que le refus ferme, et ce qu il ne ferme pas (à dire tel quel)** :

- fermé : du code nommé en actif sans la tête du format. Avec la tête : Node rend `SyntaxError` pour les cinq formats (octet non UTF-8 ou NUL en tête) ; bash refuse `ttf` et `ots` (NUL avant le premier LF).
- **résidu** : un **polyglotte**, qui porte la vraie tête puis du code. Mesuré : `bash out/poly.png` (tête PNG, puis shell, puis un NUL) s exécute et compte 0 ; de même pour `jpg` et `cbor`, dont la tête ne contient pas de NUL avant un LF ; `python3 out/zip.png` (tête PNG, puis une archive zip) s exécute, pour tout format, Python lisant l archive par sa fin. Un nombre magique n est pas un format. Ce qui reste visible : l appel (`bash out/x.png`, `python3 out/x.png`, `require("./out/x.png")`) est une ligne de code comptée et relue.
- plus fort, écarté par défaut : (a) une validation de structure (PNG : morceaux, CRC, rien après `IEND` ; JPEG : `ff d9` final ; CBOR : un seul élément bien formé, sans octet de reste ; OTS : opérations jusqu à la fin) : environ 60 lignes de plus, et un PNG valide peut encore porter du shell dans un morceau `tEXt` ; (b) une liste fermée des blobs d actif admis (ids ou sha256) dans le module : ferme tout, mais chaque `.ots` complété (20 modifications en deux semaines) devient un changement du module. Question Q-1.

**Fail-closed** : refus nommé `asset-magic <chemin>` ; `attrTree` ou `check-attr` en échec : levée, job rouge.

### 2.3 R25-CR-ONLY-LINES-1 : une ligne finit par LF

**Attaque** : `src/cr.cjs`, 3 001 instructions séparées par `0d` seul : `git diff --shortstat` compte 1 ligne ; `node src/cr.cjs` s exécute. Variante mesurée, même famille : U+2028 ou U+2029 (fins de ligne pour JS, pas pour git).

**Construction** : sur un chemin **texte** changé sous l un des deux pathspecs (tout chemin qui n est pas un actif déclaré, NUL ou non : sous `* diff`, un fichier à NUL est du texte et compte ses lignes), refus `bare-cr` d un `0d` non suivi de `0a`, et `line-separator` d un `e2 80 a8` ou `e2 80 a9`. Le blob d arrivée entier est lu, pas seulement les lignes changées : un fichier qui a déjà un CR seul au tronc serait refusé à sa prochaine modification. Il n y en a **aucun** au tronc (0 sur 2 125 fichiers suivis non binaires, section 1.1) : aucune liste d exceptions. Une paire CR LF reste admise.

**Pourquoi pas compter CR comme fin de ligne** : `git diff` n a pas d option pour cela ; il faudrait un second compte hors des lignes `STAT=`, ou les changer. Le refus coûte zéro au tronc.

**Ce qui reste (à dire tel quel)** : la même famille sans séparateur, du code sur **une seule ligne** (`one.cjs`, 3 000 instructions, 1 ligne, exécuté). Un plafond de longueur de ligne n est pas tenable : 65 fichiers sous les pathspecs ont une ligne de plus de 1 000 octets (JSON de données, jusqu à 691 402). La piste de la G2 (un plancher `ceil(octets/80)` au-delà d un rapport octets/ligne) change le compte lui-même : hors lot (question Q-5).

**Fail-closed** : refus nommé `bare-cr <chemin>` ou `line-separator <chemin>`.

### 2.4 R25-GITLINK-SYMLINK-1 : ni gitlink, ni lien symbolique sous les pathspecs

**Attaque gitlink** : `vendor/sub` en mode `160000` compte 1 ligne (`Subproject commit …`) ; le code qu il désigne vit dans un autre dépôt, non tiré par `actions/checkout`, jamais mesuré.

**Attaque lien** : `src/link.mjs` en mode `120000` compte 1 ligne, sa cible ; la cible peut être hors pathspec (`docs/**/*.md`, D9 septies) ou hors du dépôt. Sous Windows, où MONARK rejoue chaque lot, `core.symlinks=false` écrit le lien comme un fichier texte : le même arbre ne s exécute pas pareil sur les deux plateformes.

**Construction** : refus `gitlink` de toute entrée d arrivée `160000` (ajout, modification du commit désigné, changement de type), et refus `symlink` de toute entrée d arrivée `120000`, sous les deux pathspecs. Les suppressions passent. **Décision proposée pour les liens : refuser** plutôt que compter : le tronc n en a aucun (0 sur 2 170 entrées), compter la cible ne mesure pas ce qu elle désigne, et le comportement Windows diverge. Ajouter un lien ou un sous-module devient un changement de la gate (une ligne du module), contrôlé par diff.

**Fail-closed** : refus nommé `gitlink <chemin>` ou `symlink <chemin>`.

### 2.5 Mesure du contrôle proposé (prototype jetable, hors dépôt, mêmes étapes que la section 2.1)

| Plage | Entrées | Actifs | Textes | Refus | Durée |
|---|---|---|---|---|---|
| arbre vide -> tronc `b26fa106` (tout le dépôt comme un ajout) | 1 038 | **45, tous à leur nombre magique** | 993 | **0** | 212 ms |
| `lot/etude-suite...recherches/r25-guards-1` (#166) | 7 | 0 | 7 | 0 | 49 ms |
| dépôt d attaque de la section 1.3 | 10 | 3 | 5 | 5 : `asset-magic out/tool.png`, `bare-cr src/cr.cjs`, `line-separator src/ls.cjs`, `gitlink vendor/sub`, `symlink src/link.mjs` ; `out/poly.png` et `out/zip.png` passent (résidu des polyglottes, section 2.2) | 36 ms |

### 2.6 Windows

- Le contrôle lit des objets (`diff --raw`, `check-attr`, `cat-file --batch`), jamais l arbre de travail : indifférent à `core.autocrlf`, à `core.symlinks`, à la casse de NTFS (`PIN` épingle `core.ignorecase=false` pour `check-attr`). Les chemins passent en `-z` et en octets.
- Fixtures **par la plomberie** : `git hash-object -w --no-filters --stdin` pour les octets exacts (un CR LF n est pas normalisé par un `text=auto` de passage), `git update-index --add --cacheinfo <mode>,<id>,<chemin>` pour les gitlinks et les liens. Aucun lien symbolique du système de fichiers, aucun sous-module cloné : **aucun saut de plateforme prévu**. Si un test venait à exiger un vrai lien, il serait sauté sous `win32` avec un motif nommé (`symlinks unavailable on win32`), jamais en silence.
- Aucun faux `git` en `sh`, ni `/proc`, ni FIFO ; chemins par `join`.
- Noms de fixtures hors des noms réservés de Windows (`nul`, `con`, `prn`, `aux`, `com1` à `com9`, `lpt1` à `lpt9`, quelle que soit l extension, et pas davantage comme nom de répertoire) : `out/tool.png`, `src/cr-only.cjs`, `src/crlf-ok.cjs`, `src/ls-sep.cjs`, `src/ps-sep.cjs`, `vendor/subrepo`, `apps/site/app/docs/subrepo`, `src/link.mjs`, `docs/notes-cr.md`.

## 3. Fichiers touchés

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | `ASSET_MAGIC` et `refusals(cwd, base, specs)` (après `attrTree`, pour ne pas décaler les tueurs existants) ; `pin` lit `--ci` et `--base` (obligatoires), appelle `refusals`, refuse ; en-tête et commentaire de `pinShell` |
| `scripts/oracle/r25.mjs` | import de `refusals` ; mode `refused`, log nommé, rouge ; en-tête |
| `.github/workflows/ci.yml` | ligne `R25_PIN=` et `::error::` réécrites sur place ; commentaire au-dessus réécrit sur place (même nombre de lignes). `STAT=` et `CONTENT_STAT=` inchangées |
| `test/r25-integration.test.ts` | tests de la section 4 ; deux tests ajustés (`pin` appelé avec ses arguments) |
| `test/ci-gates.test.ts` | `ci_r25_counts_read_under_the_module_pin` ajusté (la ligne `R25_PIN=` épinglée exactement) |
| `docs/adr/ADR-M003-phase2-integration.md` | ligne datée D9 terdecies (au G7) |

## 4. Tests rouges d abord, puis tueurs (numéros de ligne fixés au gel)

Préfixe `r25h_`. Les tests de la CI exécutent le bloc `run:` réel du job sous bash, comme ceux de #166.

| # | Test | Attendu au gel | À la base | Tueur prévu |
|---|---|---|---|---|
| T-1 | `r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory` | `out/tool.png` (`// <NUL>` puis 300 lignes) : aucun compte, stderr `refused asset-magic out/tool.png`, `::error::`, sortie 1 | `Changed lines: 0`, vert | la comparaison de tête rendue toujours vraie |
| T-2 | `r25h_asset_magics_are_the_measured_list` | égalité exacte de `ASSET_MAGIC` (section 2.2), et des extensions de `ASSET_MAGIC` avec celles de `BINARY_ASSETS` | export absent : rouge | une tête retirée (par exemple `"00010000"` -> `"4f54544f"`) |
| T-3 | `r25h_every_trunk_asset_passes_its_magic` | `refusals` du dépôt lui-même, arbre vide -> `HEAD`, sous ses deux pathspecs : `[]`, et 45 chemins classés actifs | fonction absente : rouge | la tête `ots` raccourcie d un octet à la fin (refus des 37 `.ots`) |
| T-4 | `r25h_ci_refuses_a_bare_cr_and_keeps_crlf` | `src/cr-only.cjs` (3 001 instructions, CR seul) refusé `bare-cr` ; `src/crlf-ok.cjs` (CR LF) et `docs/notes-cr.md` (CR seul, hors pathspec) non nommés | `Changed lines: 1` + lignes de `crlf-ok`, vert | `b[i + 1] !== 0x0a` -> `true` (nomme `crlf-ok`), et l appel sans pathspec (nomme `notes-cr.md`) |
| T-5 | `r25h_ci_refuses_the_js_line_separators` | `src/ls-sep.cjs` (U+2028) et `src/ps-sep.cjs` (U+2029) refusés `line-separator` | 1 + 1, vert | la recherche de `e2 80 a9` retirée |
| T-6 | `r25h_ci_refuses_a_gitlink_under_both_pathspecs` | `vendor/subrepo` (CODE) et `apps/site/app/docs/subrepo` (CONTENT) refusés ; un gitlink de la base supprimé par la PR passe | `Changed` 1, `Content` 1, vert | `"160000"` -> `"169999"` |
| T-7 | `r25h_ci_refuses_a_symlink` | `src/link.mjs` (`120000`) refusé `symlink` | 1, vert | `"120000"` -> `"129999"` |
| T-8 | `r25h_pin_requires_the_workflow_and_the_base` | `pin` sans `--base` ou sans `--ci` : sortie 2, stdout vide | sortie 0 | une base par défaut (`origin/lot/etude-suite`) |
| T-9 | `oracle_r25_refuses_what_the_job_refuses` | `r25()` sur le clone des cas T-1, T-4, T-6, T-7 : mode `refused`, quatre lignes nommées, rouge | mode `unproven`, vert | l appel de `refusals` de l oracle neutralisé (`if (r.length > 0)` -> `if (false)`) |

Tests existants ajustés : `r25a_ci_w_reads_under_the_module_pin` et `r25a_pin_prints_exactly_the_pinned_names` (`pin` appelé avec `--ci` et `--base`), `ci_r25_counts_read_under_the_module_pin` (la ligne `R25_PIN=` et le `::error::` épinglés à leur nouveau texte). Les tueurs de #166 dont la ligne ne bouge pas (`ci.yml:<n>`, `lot-size-integration.mjs:33`, `:34`, `:180`, `:188` à `:196`) restent ancrés : les ajouts se font après `attrTree`, et `ci.yml` ne change que sur place. Ancres vérifiées par `verifie-ancres.mjs` au gel.

## 5. R-25 du lot

Prévu : module ≈ 40 (table, `refusals`, arguments de `pin`, commentaires), oracle ≈ 8, `ci.yml` ≈ 6 (trois lignes réécrites sur place, comptées insertion et suppression), tests ≈ 190 (neuf nouveaux, trois ajustés) : **≈ 245**, sous la borne du lot (547). Les docs sont hors pathspec. Mesure au gel par `r25()` de `scripts/oracle/r25.mjs` contre la base de la PR. Le lot n ajoute ni binaire, ni CR seul, ni gitlink, ni lien : il passe son propre contrôle (les fixtures sont écrites par les tests dans des dépôts jetables, jamais suivies).

## 6. Questions pour MONARK (avec mes défauts)

- **Q-1 (polyglottes)** : le nombre magique ne ferme pas un fichier qui porte la vraie tête puis du code (bash après la tête `png`, `jpg`, `cbor` ; Python par une archive zip finale, pour tout format ; mesuré). **Défaut : nombre magique seul**, résidu écrit tel quel dans le G7 et l ADR ; l appel d un actif comme du code reste une ligne comptée et relue. Plus fort, au choix de MONARK : validation de structure (≈ 60 lignes, incomplète) ou liste fermée des blobs admis (complète, mais chaque `.ots` complété devient un changement du module).
- **Q-2 (actif texte sans tête)** : un fichier texte d un couple autorisé sans nombre magique est refusé, bien qu il compte déjà ses lignes. **Défaut : refusé** (une seule règle, aucun cas au tronc) ; l autre choix demande de recopier la détection de git (NUL dans les 8 000 premiers octets).
- **Q-3 (tête `cbor`)** : CBOR n a pas de signature ; la tête mesurée est une table (`a7`). **Défaut : premier octet `a0` à `bf`** (Node le refuse, bash non : Q-1). Variante : décodage complet d un seul élément sans reste (≈ 30 lignes).
- **Q-4 (U+2028, U+2029)** : hors de la lettre de l item, même attaque, 0 au tronc. **Défaut : refusés avec le CR seul.**
- **Q-5 (code sur une ligne)** : non fermé, et un plafond de longueur de ligne casserait 65 fichiers du tronc. **Défaut : hors lot**, écrit tel quel ; un item à former si MONARK le veut (plancher `ceil(octets/80)`, qui change le compte et donc les lignes `STAT=`).
- **Q-6 (liens symboliques)** : refuser ou compter. **Défaut : refuser** (0 au tronc, cible non mesurée, divergence Windows).
- **Q-7 (arguments de `pin`)** : `--ci` et `--base` obligatoires, `pin` seul sort avec 2. **Défaut : obligatoires.** L autre choix (lire `$GITHUB_BASE_REF` et le chemin de `ci.yml` en implicite) laisserait `ci.yml` intact, mais un `pin` lancé hors CI contrôlerait en silence une autre plage, ou rien.
- **Q-8 (mode `integration`)** : `effective` ne refait pas le contrôle. **Défaut : non** (le job s arrête à `pin`, l oracle contrôle avant `integration()`) ; le faire en mode `error` coûterait une lecture de plus par commit.
- **Q-9 (dépendance à #166)** : ce lot part de la tête de #166 non fusionnée. **Défaut : PR ouverte après la fusion de #166**, cible `lot/etude-suite`, la fusion de #166 entrant par un commit de fusion.
- **Q-10 (lettre d ADR)** : **D9 terdecies**, lettre libre après `duodecies` (à vérifier au G7 par une recherche dans `docs/adr`).
