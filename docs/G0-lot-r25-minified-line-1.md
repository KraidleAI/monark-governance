# G0 - lot R25-MINIFIED-LINE-1 (un refus avant le compte de R-25 : aucune ligne de plus de 2 000 octets, hors données `.json` et une liste fermée de blobs mesurés ; chemins des refus nommés en JSON)

- **Mission** : item **R25-MINIFIED-LINE-1**, formé au G7 de R25-GUARDS-2 (`docs/G7-lot-r25-guards-2.md` section 8.2, variante par refus à liste inversée, ordre accepté par MONARK le 2026-10-05 : ce lot d abord, R25-ASSET-POLYGLOT-1 ensuite). Porte aussi **N-1** de la G2 de R25-GUARDS-2 (un chemin à saut de ligne écrit des lignes arbitraires dans le journal du job), reporté à ce lot par le G7 (section 11.1).
- **Branche** : `recherches/r25-minified-line-1`, depuis le tronc `origin/lot/etude-suite` = `c1460fd6` (fusion de #170). Aucun rebase ; une avance du tronc entre par un commit de fusion. Aucune PR ouverte (à la main de MONARK).
- **Statut** : G0 et tests rouges. Le gel n est pas poussé.
- **Contexte lu** : `docs/G7-lot-r25-guards-2.md` (sections 8.2, 10, 11) ; `docs/G0-lot-r25-guards-2.md` ; ADR-M003 D9 terdecies ; `scripts/lot-size-integration.mjs` (`refusals`, `pin`) ; `scripts/oracle/r25.mjs` ; `test/r25-integration.test.ts` ; la G2 de R25-GUARDS-2 (N-1) et sa G2 delta ; le message de MONARK du 2026-10-05 (#169, #170, Q-c).

## 1. Existant mesuré

Mesures du 2026-10-05, Node 24.21.0, git 2.43.0, tronc `c1460fd6`, dépôts jetables sous le scratchpad.

### 1.1 Le tronc

| Mesure | Résultat |
|---|---|
| Fichiers sous l union des deux pathspecs (arbre vide -> tronc) | 1 038, dont 45 actifs déclarés et 993 chemins texte |
| Chemins texte dont une ligne (octets entre deux `0a`) dépasse 1 000 / 2 000 / 4 000 octets | 65 / **37** / 29 |
| Dont hors `.json` | 9 / **1** / 1 |
| Le seul au-delà de 2 000 hors `.json` | `docs/biblio/procurements-M015/_raw/tradexyz_llms_full.txt` : 222 458 octets, plus longue ligne 59 631 octets, blob `3989315d68addc8ea3bb6e5cd0ee7dcd6f8bf326`, un seul commit l a touché (`41f3f79c`) |
| Les huit autres au-delà de 1 000 hors `.json` | au plus 1 795 octets (`apps/site/lib/bell-served-load.ts`) |
| `.jsonl` et `.csv` sous les pathspecs avec une ligne de plus de 2 000 octets | **0** (les `.jsonl` et `.csv` des fixtures sont hors du pathspec CODE) |

### 1.2 Ce que Node exécute (un fichier `console.log("RAN")`, puis `node f`, `require("./f")`, `import("./f")`)

| Extension | `node f` | `require` | `import` |
|---|---|---|---|
| `.json` | refusé (JSON lu) | refusé (JSON lu) | `ERR_IMPORT_ATTRIBUTE_MISSING` |
| `.jsonl` | **exécuté** | **exécuté** | `ERR_UNKNOWN_FILE_EXTENSION` |
| `.csv` | **exécuté** | **exécuté** | `ERR_UNKNOWN_FILE_EXTENSION` |
| `.txt` | **exécuté** | **exécuté** | `ERR_UNKNOWN_FILE_EXTENSION` |

Le G7 de R25-GUARDS-2 (section 8.2) rangeait `.jsonl` et `.csv` parmi les « extensions de données que Node ne peut pas exécuter » : **c est faux**, mesuré. Node charge toute extension inconnue en CommonJS. Seul `.json` est lu comme donnée (question Q-1).

### 1.3 L attaque, et le coût du contrôle

| Cas | Mesure |
|---|---|
| `src/one.cjs` : 3 000 instructions sur une ligne | compte 1 ; `node src/one.cjs` : `ONE-LINE-RAN` |
| prototype du gel, `pin` sur une plage qui ajoute `src/huge.txt` (200 Mio, une seule ligne), `src/many.txt` (2 000 000 de lignes courtes) et `src/one.cjs` | `refused long-line "src/huge.txt"`, `refused long-line "src/one.cjs"`, sortie 2, **776 ms** au total |
| prototype, `refusals` du dépôt lui-même (arbre vide -> tronc) | `[]`, 233 ms |

## 2. Construction

### 2.1 Le refus `long-line`

Dans `refusals` (module `scripts/lot-size-integration.mjs`), même plage, mêmes pathspecs, mêmes blobs (le `cat-file --batch` déjà lu) que les refus de D9 terdecies. Un chemin **texte** (pas un actif déclaré) est refusé `long-line` si l une de ses lignes est plus longue que `LINE_MAX` = **2 000 octets**, sauf :

- un chemin qui finit par `.json` (casse comprise : `x.JSON` n est pas lu comme JSON par Node sous Linux, il s exécute) ;
- un chemin de la liste fermée `LONG_LINE_PATHS` **à son blob exact** mesuré au tronc (une entrée : le `.txt` de la section 1.1).

Les lignes `STAT=` et `CONTENT_STAT=` ne changent pas d un octet ; `ci.yml` ne change pas ; l oracle appelle déjà `refusals` de son propre module : il refuse pareil, sans une ligne de plus.

### 2.2 Décisions de mesure

- **Octets, pas caractères.** Une ligne est la suite d octets entre deux `0a`. 1 001 `é` (2 002 octets UTF-8) sont refusés. Aucun décodage : un blob non UTF-8 se mesure pareil (Q-2).
- **CR** : compté dans la ligne (1 999 octets puis CR LF : 2 000, admis). Le tronc n a aucun CR LF (`text=auto eol=lf`), et un CR seul est déjà refusé `bare-cr`.
- **Dernière ligne sans `0a` final** : mesurée comme les autres (de `0a` à la fin du blob).
- **Performance** : un pas `Buffer.indexOf(10)` (memchr) par ligne, aucune chaîne construite, aucun `split` ; une ligne unique de 200 Mio coûte un seul appel (section 1.3). La borne reste celle du `cat-file --batch` (1 Gio, au-delà : levée, rouge).
- **Liste exacte et plafond séparé** : la liste porte le **blob**, pas seulement le chemin. Tout autre contenu à ce chemin repasse sous le plafond de 2 000 octets : aucun plafond séparé n est nécessaire, et un PR ne peut pas glisser du code d une ligne dans le `.txt` admis. Prix : changer ce fichier exige de changer une ligne du module (contrôlée au diff) ; il n a changé qu une fois (Q-3).

### 2.3 N-1 : chemins nommés en JSON

`refusals` rend chaque refus sous la forme `<motif> <chemin en chaîne JSON>` (`JSON.stringify` du chemin décodé en UTF-8). La ligne de `pin` (`r25-integration: refused …`) et le log de l oracle (`refused …`) tiennent sur une ligne, quel que soit le nom : un `\n` dans un chemin ne peut plus ouvrir une ligne lue par le runner comme une commande de workflow (`::warning::`, `::add-mask::`). Les assertions des sept tests `r25h_` et de `oracle_r25_refuses_what_the_job_refuses` qui nomment un chemin passent aux guillemets.

### 2.4 Ce qui reste (à dire tel quel)

- Du code découpé en lignes de 2 000 octets : un facteur 25 environ sur le compte, borné (Q-4).
- Un `.json` appelé autrement que comme donnée : `bash x.json`, `python3 x.json`, `eval(readFileSync(...))`, ou `require("./x.JSON")` sur un système de fichiers insensible à la casse (NTFS, APFS ; non mesuré ici, Linux) : l appel est une ligne comptée et relue, comme pour les polyglottes (Q-8).

## 3. Fichiers touchés

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | une ligne dans la boucle de `refusals` (après la l.228, le refus `long-line`) ; la ligne de retour de `refusals`, sur place (N-1) ; après `refusals`, avant le bloc principal : `LINE_MAX`, `LONG_LINE_PATHS`, `overlong` ; le message de refus de `pin` et le commentaire de `refusals`, sur place |
| `scripts/lot-size-integration.d.mts` | `LINE_MAX`, `LONG_LINE_PATHS` |
| `test/r25-integration.test.ts` | six tests `r25m_` ; huit assertions de chemin aux guillemets ; le tueur de `r25h_pin_requires_the_workflow_and_the_base` ré-ancré de `:255` à `:266` (onze lignes insérées avant) |
| `docs/adr/ADR-M003-phase2-integration.md` | ligne datée D9 quaterdecies (au G7) |

`ci.yml`, `scripts/oracle/r25.mjs` : **inchangés**.

## 4. Tests rouges d abord, puis tueurs (numéros de ligne du gel)

| # | Test | Attendu au gel | À la base | Tueur |
|---|---|---|---|---|
| T-1 | `r25m_ci_refuses_code_on_one_long_line` | `src/one.cjs` et `apps/site/app/docs/one.tsx` (3 000 instructions sur une ligne) refusés `long-line` ; job rouge sans compte ; oracle `refused` rouge | `Changed` 1, `Content` 1, vert | `:229` `&& overlong(b)) out.push` -> `&& false) out.push` |
| T-2 | `r25m_line_length_is_bytes_between_line_feeds` | 2 000 octets admis, 2 001 refusés (en tête, au milieu, en dernière ligne sans LF final) ; 1 001 `é` refusés ; 1 999 + CR LF admis ; fichier vide et 5 000 lignes courtes admis | rien de refusé | `:241` `nl - at > LINE_MAX` -> `>=` ; `:241` `if (nl < 0) nl = b.length;` -> `if (nl < 0) break;` |
| T-3 | `r25m_only_json_and_the_measured_blob_keep_a_long_line` | `src/data.json` admis ; `upper.JSON`, `rows.jsonl`, `rows.csv` refusés ; le blob du tronc du `.txt` admis à son chemin, un octet de plus refusé | rien de refusé | `:229` `!p.endsWith(".json")` -> `!/\.(json|jsonl|csv)$/i.test(p)` ; `:229` `LONG_LINE_PATHS[p] !== id` -> `!Object.hasOwn(LONG_LINE_PATHS, p)` |
| T-4 | `r25m_long_line_cap_is_the_measured_list` | `LINE_MAX` = 2 000, `LONG_LINE_PATHS` = l entrée mesurée | exports absents | `:239` `LINE_MAX = 2000` -> `LINE_MAX = 4000` |
| T-5 | `r25m_the_repository_itself_passes_the_long_line_cap` | le dépôt lui-même (arbre de `HEAD` sur un commit vide) : `refusals` = `[]` ; mesuré à part (octets lus en latin1), les chemins texte hors `.json` à ligne de plus de 2 000 octets sont exactement la liste, à ses blobs | liste absente | `:229` `!p.endsWith(".json") && ` retiré (36 `.json` refusés) |
| T-6 | `r25m_a_refused_path_is_named_as_a_json_string` | un chemin `src/new\n::warning::forged "q" é.cjs` (CR seul) nommé en JSON sur une ligne par `pin` et par l oracle ; aucune ligne du journal ne commence par `::warning::` | la ligne se coupe | `:232` `JSON.stringify(…)` retiré |

Tests ajustés (N-1) : `r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory`, `r25h_ci_refuses_a_bare_cr_and_keeps_crlf`, `r25h_ci_refuses_the_js_line_separators`, `r25h_ci_refuses_a_gitlink_under_both_pathspecs`, `r25h_ci_refuses_a_symlink`, `oracle_r25_refuses_what_the_job_refuses`, `r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore`, `r25h_ci_refuses_a_utf16_or_utf32_bom` : rouges à la base (guillemets attendus), leurs tueurs inchangés et toujours ancrés (lignes 206 à 228 non décalées). Deux d entre eux attendent en plus `long-line` : `src/cr-only.cjs` (3 001 instructions séparées par CR seul) et `src/ls-sep.cjs`, `src/ps-sep.cjs` (300 instructions séparées par U+2028 ou U+2029) n ont aucun `0a` et forment chacun une ligne de plus de 2 000 octets ; leurs tueurs (`:227`, `:228`) restent tués, le motif propre de chacun étant attendu.

## 5. R-25 du lot

Prévu : module ≈ 17 (14 insertions, 3 lignes sur place), `.d.mts` 2, tests ≈ 100 (six nouveaux, huit assertions et un tueur sur place) : **≈ 120**, sous 547. Docs hors pathspec. Le lot passe son propre contrôle : aucune ligne de plus de 2 000 octets dans ses fichiers (les fixtures longues sont construites en mémoire).

## 6. Windows

- Le contrôle lit des objets seuls : indifférent à `autocrlf` et à NTFS. Les longueurs sont celles des blobs, pas de l arbre de travail.
- Fixtures par la plomberie (`hash-object -w --no-filters`, `update-index --cacheinfo`) ; chemins par `join` ; aucun nom réservé (`nul`, `con`, `prn`, `aux`, `com1` à `com9`, `lpt1` à `lpt9`).
- T-6 est **sauté sous `win32`, motif nommé** : git pour Windows refuse un caractère de contrôle dans un nom de chemin (`core.protectNTFS`), et le runner du job est Linux. Les cinq autres tests courent partout ; T-3 lit le blob du `.txt` dans le dépôt par son id (`cat-file blob`).

## 7. Questions pour MONARK (avec mes défauts)

- **Q-1 (extensions admises)** : le G7 (section 8.2) admettait `.json`, `.jsonl`, `.csv`. Mesuré (section 1.2) : Node exécute `.jsonl` et `.csv` en CommonJS. **Défaut : `.json` seul**, casse comprise ; coût au tronc nul (0 `.jsonl`/`.csv` concerné). L autre choix (l accord du G7 tel quel) est un mot du module.
- **Q-2 (unité)** : **défaut : octets**, CR compté, dernière ligne sans LF mesurée.
- **Q-3 (liste exacte)** : **défaut : chemin et blob exact**, donc aucun plafond séparé. Variantes : chemin seul avec plafond à la mesure (59 631 octets : 59 Ko de code sur une ligne y passeraient), ou chemin seul sans plafond (tout y passe).
- **Q-4 (seuil)** : **défaut : 2 000 octets** (1 795 au plus hors `.json` sous les pathspecs, hors la liste). Résidu borné : des lignes de 2 000 octets.
- **Q-5 (N-1)** : **défaut : `JSON.stringify`**, comme convenu. Il n échappe ni U+2028/U+2029, ni les commandes C1, ni DEL ; le runner coupe ses lignes sur LF et CR, que `JSON.stringify` échappe.
- **Q-6 (T-6 sous `win32`)** : **défaut : sauté, motif nommé**. Variante non mesurée : `-c core.protectNTFS=false` sur la mise en index.
- **Q-7 (lettre d ADR)** : **D9 quaterdecies**, lettre libre après `terdecies` (à vérifier au G7).
- **Q-8 (résidu `.json`)** : **défaut : dit tel quel**. Option chiffrée : n admettre un `.json` à ligne longue que s il est du JSON valide (`JSON.parse` du blob, ≈ 1 ligne et un cas de test) ; du JSON valide exécuté en JS ne fait rien. Mesuré : les 36 `.json` concernés au tronc sont du JSON valide (0 refus).
