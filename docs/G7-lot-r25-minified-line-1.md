# G7 - lot R25-MINIFIED-LINE-1 (un refus avant le compte de R-25 : aucune ligne de plus de 2 000 octets, hors `.json` valide et un blob mesuré, jamais `package.json` ; chemins des refus nommés en ASCII échappé)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-minified-line-1`, depuis le tronc `lot/etude-suite` à `c1460fd6` (fusion de #170), puis le tronc `ae460d28` fusionné (`23712236`, commit de fusion ; son message nomme `ebcbad15`, le tronc avait avancé d un commit de `docs/` au moment du `fetch` ; deux fichiers de `docs/`, aucun conflit, aucun fichier du lot touché). Aucun rebase, aucune PR ouverte (à la main de MONARK).
- **Plan** : G0 `docs/G0-lot-r25-minified-line-1.md` (commits `48a74bc1`, `a5f969ae`). Q-1, Q-3 et Q-8 tranchés par RECHERCHES (délégation technique) et **accordés par MONARK** (message `7abb582`) ; Q-4 à Q-6 formés en items chiffrés (section 8). Pli de la G2 fraîche (verdict **BLOQUANT**) : section 11.
- **Item fermé côté code** : **R25-MINIFIED-LINE-1** (G7 de R25-GUARDS-2, section 8.2, variante par refus à liste inversée), et **N-1** de la G2 de R25-GUARDS-2. Leur état dans `docs/ETAT.md` reste à la main de MONARK.
- **Intention tenue** : avant tout compte de R-25, `refusals` (donc `pin` en CI et l oracle par son propre module) refuse `long-line` un chemin texte changé sous l un des deux pathspecs dont une ligne dépasse 2 000 octets, hors un `.json` qui se lit comme du JSON (jamais un `package.json`) et le blob exact de la liste mesurée ; chaque refus nomme son chemin sur une seule ligne ASCII qui ne peut former aucune commande de workflow. `ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs` et le workflow public dérivé ne changent pas d un octet.

## 1. Commits

| Commit | Rôle |
|---|---|
| `48a74bc1` | G0 et tests rouges (six `r25m_`, huit assertions de chemin aux guillemets, un tueur ré-ancré) |
| `a5f969ae` | deux tests `r25h_` attendent aussi `long-line` sur leurs fixtures d une seule ligne |
| `0a3b64f4` | gel : module, `.d.mts`, ligne d ADR D9 quaterdecies |
| `a8f22733` | G7 (premier état) |
| `9ebd4f7f` | test rouge de Q-8 (`r25m_a_long_line_json_must_parse`) ; tueurs de la l.229 et de `pin --base` (`:266` -> `:267`) |
| `9610efbc` | gel de Q-8 : un `.json` à ligne longue n est admis que si son blob se lit comme du JSON |
| `abae864c` | G7 (Q-8, décisions) ; tête relue par la G2 |
| `23712236` | fusion du tronc `ae460d28` (journal et HANDOFF), aucun conflit |
| `5be82605` | tests rouges du pli : B-1, R-2, N-3, N-4 |
| `b7cb95b2` | gel du pli : `package.json` hors exemption (l.229), noms échappés en ASCII (l.232), commentaires |
| `8dfb9255` | tueur du test du dépôt lui-même ré-ancré sur la l.229 |
| `f55474ba` | D9 quaterdecies pliée (B-1, R-1, R-2, N-2) |
| ce commit | G7 à jour |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.229 (nouvelle, dans la boucle de `refusals`) : `if (LONG_LINE_PATHS[p] !== id && overlong(b) && !(p.endsWith(".json") && !/(^|\/)package\.json$/.test(p) && isJson(b))) out.push(...)` ; l.232 (sur place) : chaque refus rendu `<motif> <nom>`, le nom étant `JSON.stringify` du chemin UTF-8 puis `[` et tout caractère au-delà de U+007E échappés en `\uXXXX` ; l.235-244 (nouvelles, après `refusals`, avant le bloc principal) : commentaire, `LINE_MAX = 2000`, `LONG_LINE_PATHS` (une entrée, chemin et blob), `overlong`, `isJson` ; l.201 et l.271 (sur place) : commentaire de `refusals`, message de `pin` (`D9 terdecies, quaterdecies`) |
| `scripts/lot-size-integration.d.mts` | `LINE_MAX`, `LONG_LINE_PATHS` |
| `docs/adr/ADR-M003-phase2-integration.md` | **Addendum D9 quaterdecies** (lettre libre : `terdecies` était la dernière dans `docs/adr`) |

`overlong(b)` : un pas `b.indexOf(10, at)` par ligne sur le `Buffer` du blob (déjà lu par le `cat-file --batch` de `refusals`), longueur `nl - at` (CR compris), la dernière ligne mesurée jusqu à la fin du blob ; aucune chaîne construite. `isJson(b)` décode en revanche le blob entier, et n est appelé que sur un `.json` à ligne longue (N-2, section 11).

Workflow public dérivé : **identique** à celui du tronc (`derivePublicWorkflow` des deux `ci.yml`, égalité stricte, mesurée). Le module n est pas exporté dans le dépôt public.

## 3. Tests et tueurs

### 3.1 Tests nouveaux

| Test | Gel | Base | Tueur (tiré à la main, tué) |
|---|---|---|---|
| `r25m_ci_refuses_code_on_one_long_line` (bloc `run:` réel et oracle) | `src/one.cjs`, `apps/site/app/docs/one.tsx` refusés, job rouge sans compte, oracle `refused` | `Changed` 1, `Content` 1, vert | `:229` `&& overlong(b) &&` -> `&& false &&` |
| `r25m_line_length_is_bytes_between_line_feeds` | 2 000 admis ; 2 001 refusés en tête, au milieu, en fin sans LF ; 2 000 + CR LF refusé ; 1 001 `é` refusés ; 1 999 + CR LF admis ; vide et 5 000 lignes courtes admis | rien de refusé | `:241` `>` -> `>=` ; `:241` `nl = b.length` -> `break` ; `:241` CR retiré du compte (N-3) |
| `r25m_only_json_and_the_measured_blob_keep_a_long_line` | `.json` admis ; `.JSON`, `.jsonl`, `.csv` refusés ; le `.txt` listé (lu à `HEAD`) admis à son chemin, un octet de plus refusé | rien de refusé | `:229` `p.endsWith(".json")` -> `/\.(json|jsonl|csv)$/i.test(p)` ; `:229` blob -> chemin seul |
| `r25m_long_line_cap_is_the_measured_list` | `LINE_MAX` 2 000, une entrée | exports absents | `:239` `2000` -> `4000` |
| `r25m_the_repository_itself_passes_the_long_line_cap` | dépôt lui-même : `[]` ; mesure indépendante (octets lus en latin1) = la liste, à ses blobs | liste absente | `:229` `p.endsWith(".json") && !/` -> `false && !/` (36 refus) |
| `r25m_a_long_line_json_must_parse` (Q-8) | `src/code.json` (3 000 instructions sur une ligne) refusé ; ligne longue de JSON valide et `.json` invalide court admis | rien de refusé | `:229` ` && isJson(b))` -> `)` |
| `r25m_package_json_is_never_exempt` (B-1) | `package.json` et `apps/tool/package.json` (JSON valide, `"pretest"` de 3 000 instructions sur une ligne) refusés ; `src/notpackage.json` (mêmes octets) et un `package.json` court admis | rien de refusé | `:229` ` && !/(^|\/)package\.json$/.test(p)` retiré |
| `r25m_a_refused_path_is_named_as_a_json_string` (N-1 ; sauté sous `win32`, motif nommé : `core.protectNTFS`) | `src/new\n::warning::forged "q" é.cjs` nommé sur une ligne, `\n`, `\"` et `é` échappés, par `pin` et par l oracle | la ligne se coupe | `:232` `JSON.stringify(...)` retiré |
| `r25m_a_refused_path_cannot_form_a_workflow_command` (R-2 ; court aussi sous `win32` : `#`, `[`, `]` y sont des noms admis) | `src/##[add-mask]refused.cjs`, `src/##[warning title=forged]ok é.cjs` nommés `src/##[…`, sans `##[` dans le journal ni dans le log de l oracle | noms bruts | `:232` `[` retiré de la classe échappée |

### 3.2 Tests ajustés (N-1)

Les huit tests qui nomment un refus (`r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory`, `r25h_ci_refuses_a_bare_cr_and_keeps_crlf`, `r25h_ci_refuses_the_js_line_separators`, `r25h_ci_refuses_a_gitlink_under_both_pathspecs`, `r25h_ci_refuses_a_symlink`, `oracle_r25_refuses_what_the_job_refuses`, `r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore`, `r25h_ci_refuses_a_utf16_or_utf32_bom`) attendent le chemin entre guillemets : rouges à la base (F2P). `r25h_ci_refuses_a_bare_cr_and_keeps_crlf` et `r25h_ci_refuses_the_js_line_separators` attendent aussi `long-line` (leurs fixtures n ont aucun `0a`) ; leurs tueurs `:227`, `:228` restent tués. Le tueur de `r25h_pin_requires_the_workflow_and_the_base` passe de `:255` à `:267` ; tué.

## 4. Vérifications (worktree `/home/user/monark-governance-r25m`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests ; tronc `ae460d28`, gel `f55474ba`)

| Vérification | Résultat |
|---|---|
| red-proof `--base ae460d28 --gel f55474ba --repo . --draw 30 --seed 37` | **OK** : 17 jugés, **17 F2P**, 0 refusé ; 41 inchangés ; 17 tueurs tirés (la population), **17 tués**. `RED-PROOF.json` sha256 `f969854c16f564016b8b26b2ca9b631c0287ccd295c23c8fae019757c5c4acbf` |
| tueurs tirés à la main au gel (un test seul, fichier restauré, sha256 vérifié) | les **quatorze** du lot (section 3.1 et `:267`) tués par assertion. Au premier gel `0a3b64f4` : 19 sur 19, dont les dix tueurs voisins des tests `r25h_` et de l oracle (`:206` deux, `:213`, `:216` deux, `:226`, `:227`, `:228` deux, `oracle/r25.mjs:33`), lignes inchangées depuis |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` | 78 tueurs, 78 ANCRE, 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration` 58, `ci-gates`, `oracle-run`, `dojo-render`, `export-public`, `byte-guard`) | 143/143 |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| `npm run test:main` (worktree jetable, `node_modules` copié, pas lié) | tête `f55474ba` : **2 483 tests, 2 461 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| workflow public dérivé | identique au tronc `ae460d28` ; `.github/` et `scripts/oracle/` inchangés sur la plage |

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite` (`ae460d28`), tête `f55474ba` : `STAT 133 insertions, 12 deletions, changed 145`, `CONTENT_STAT 0`, GREEN (mode `unproven`), **sous 547**. `refusals` a tourné sur la plage du lot : aucun refus.

## 6. Mesures

| Mesure | Résultat |
|---|---|
| Tronc, chemins texte sous les pathspecs à ligne de plus de 2 000 octets | 37 : 36 `.json` (tous du JSON valide, aucun `package.json`) et `tradexyz_llms_full.txt` (blob `3989315d…`, plus longue ligne 59 631 octets) |
| `package.json` sous les pathspecs | 12, au plus 569 octets par ligne (G2) |
| `.jsonl`, `.csv` concernés | 0 |
| Node sur `.jsonl`, `.csv`, `.txt` (`node f`, `require`) | exécutés en CommonJS ; `.json` lu comme donnée |
| `pin`, plage avec 200 Mio sur une ligne, 2 000 000 de lignes courtes et `one.cjs` | deux refus, sortie 2, 776 ms |
| `refusals` du dépôt lui-même | `[]`, 233 ms |

## 7. Windows

Contrôle sur objets seuls : indifférent à `autocrlf`, aux liens, à la casse de NTFS. Fixtures par la plomberie, en mémoire ; chemins par `join` ; aucun nom réservé. Un seul saut nommé : `r25m_a_refused_path_is_named_as_a_json_string` (git pour Windows refuse un caractère de contrôle dans un chemin, `core.protectNTFS` ; le runner du job est Linux). Le cas `##[` (R-2) a son propre test, sans saut : `#`, `[`, `]`, `=`, l espace et `é` sont des noms admis sous NTFS, et le chemin n est jamais extrait. `r25m_only_json_and_the_measured_blob_keep_a_long_line` lit le `.txt` listé à `HEAD`, présent à toute profondeur de clone (N-4).

## 8. Résidus formés en items (règle PAROXYSME : une limite déclarée n est jamais une fin)

Portés par RECHERCHES, déclencheur « avant T0 », état dans `docs/ETAT.md` à la main de MONARK.

| Item | Résidu, dit tel quel | Options et prix |
|---|---|---|
| **R25-LINE-CAP-2000-1** (Q-4) | du code découpé en lignes de 2 000 octets : un facteur 25 environ sur le compte, borné | (a) seuil de 1 000 octets : 8 chemins hors `.json` et hors la liste au-delà (au plus 1 795 octets), donc 8 blobs de plus dans `LONG_LINE_PATHS`, une ligne de module et un test ajusté ; (b) le plancher `ceil(octets/80)` du G7 de R25-GUARDS-2 (section 8.2) : change le compte et les lignes `STAT=` (≈ 6 fichiers de code, ligne d ADR) |
| **R25-JSON-STRING-CODE-1** (R-1 de la G2) | du code rangé dans une chaîne d un `.json` valide et appelé par une ligne comptée (`new Function(require("./c.json").c)()`, mesuré par la G2 : `STAT` 2, exécuté), **sans borne de taille** ; la ligne d appel est comptée et relue | (a) plafonner à `LINE_MAX` octets chaque valeur chaîne d un `.json` (un parcours de l objet rendu par `JSON.parse`, ≈ 3 lignes, un test) : 19 des 36 `.json` à ligne longue du tronc la dépassent (fixtures `apps/dojo/test/fixtures/history/*.json` jusqu à 50 068 octets, `apps/site/data/narabi-capture.json`, `apps/site/data/manifest.sha256.json`, `scripts/export-exclude-tests.json`, `docs/carto/openapi-live-2026-09-22.json`), à lister par chemin et blob, et chaque mise à jour de ces fixtures devient une ligne du module ; (b) rien : la relecture de la ligne d appel |
| **R25-REFUSAL-NAMES-1** (Q-5) | fermé au pli (R-2) : noms en ASCII, `[` et tout au-delà de U+007E échappés ; reste un nom ASCII imprimable sans `[` ni saut de ligne, qui ne peut porter aucune commande (`::` exige la tête de ligne, `##[` exige `[`) | aucune option ouverte ; à clore par MONARK |
| **R25-WIN32-CONTROL-PATH-1** (Q-6) | le test N-1 (saut de ligne dans un chemin) est sauté sous `win32` | (a) `-c core.protectNTFS=false` sur la mise en index de la fixture, non mesuré sous Windows : 1 ligne, à rejouer par MONARK ; (b) garder le saut : le runner du job est Linux, et le cas `##[` court sous `win32` |
| **R25-ASSET-POLYGLOT-1** (existant, complété : N-1 de la G2) | un actif déclaré qui porte la vraie tête de son format passe, compte 0 s il a un NUL, **ou ses lignes s il n en a pas, sans aucun contrôle de texte** : `out/tool.png` = tête PNG puis 5 000 `x` sur une ligne compte 3 et échappe à `long-line` et `bare-cr` | celles de Q-c (G7 de R25-GUARDS-2 section 8.1 et le message de MONARK : validation structurelle stricte par format, à chiffrer) |

## 9. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Addendum D9 quaterdecies**, pliée sur la G2 (B-1, R-1, R-2, N-2), à contrôler par MONARK au diff.

## 10. Décisions

| Question | Décision | Par |
|---|---|---|
| Q-1 (extensions admises) | `.json` seul, casse comprise : **resserrement** du G7 de R25-GUARDS-2 (`.jsonl`, `.csv` exécutés par Node, mesuré), coût au tronc nul | RECHERCHES, accordé par MONARK (`7abb582`) |
| Q-2 (unité) | octets, CR compté (tenu par un tueur depuis N-3), dernière ligne sans LF mesurée | défaut |
| Q-3 (liste exacte) | chemin **et** blob exact, aucun plafond séparé : **resserrement** | RECHERCHES, accordé par MONARK |
| Q-4 (seuil) | 2 000 octets ; item R25-LINE-CAP-2000-1 (section 8) | MONARK : item chiffré |
| Q-5 (nommage) | échappement ASCII (pli R-2) ; item R25-REFUSAL-NAMES-1 | MONARK : item chiffré |
| Q-6 (N-1 sous `win32`) | saut nommé ; item R25-WIN32-CONTROL-PATH-1 | MONARK : item chiffré |
| Q-7 (lettre d ADR) | D9 quaterdecies | défaut |
| Q-8 (`.json` à ligne longue) | admis seulement si `JSON.parse` du blob réussit, **jamais `package.json`** (B-1) | RECHERCHES, accordé par MONARK ; B-1 au pli |

## 11. Pli de la G2

G2 : `/home/user/recherches/coordination/pieces/2026-10-04-G2-recherches/G2-r25-minified-line-1.md`, verdict **BLOQUANT** (B-1), tête relue `abae864c`. Tests d abord (`5be82605`), puis code (`b7cb95b2`), chaque point avec son tueur de forme fermée, tiré à la main et tué.

| Point | Disposition | Test (tueur) |
|---|---|---|
| **B-1** (npm exécute les chaînes de `package.json`, sans ligne d appel) | **fermé** : un `package.json` à toute profondeur (nom de base exact) n est jamais exempt, même JSON valide (l.229). Prémisse corrigée dans le commentaire l.235-238, `isJson` l.244, D9 quaterdecies et ce G7. 0 refus au tronc (12 `package.json`, au plus 569 octets par ligne). Variante plus large : item R25-JSON-STRING-CODE-1 | `r25m_package_json_is_never_exempt` (`:229` le test du nom retiré) |
| **R-1** (code rangé dans une chaîne d un `.json` valide, appelé par une ligne comptée) | **rétabli comme résidu** dans D9 quaterdecies et en item R25-JSON-STRING-CODE-1 (section 8), option chiffrée (19 blobs) ; « même appelé par `eval` » précisé (l `eval` du fichier entier) | sans objet |
| **R-2** (`##[cmd]` lu n importe où dans la ligne) | **fermé** : le nom passe par `JSON.stringify`, puis `[` et tout caractère au-delà de U+007E (DEL, C1, U+2028, U+2029) en `\uXXXX` (l.232) : une ligne ASCII sans `[`, qui commence par `r25-integration:` ; ni `::cmd::` ni `##[` possibles | `r25m_a_refused_path_cannot_form_a_workflow_command` (`:232` `[` retiré de la classe) ; `r25m_a_refused_path_is_named_as_a_json_string` attend `é` |
| **N-1** (un actif à sa tête magique saute aussi `long-line` et `bare-cr`) | ajouté à l item R25-ASSET-POLYGLOT-1 (section 8) | sans objet |
| **N-2** (`isJson` construit une chaîne ; 300 Mo de JSON valide font tomber V8 ; une BOM UTF-8 est refusée) | D9 quaterdecies corrigée : « sans chaîne construite » pour la seule mesure des lignes ; le crash V8 est fail-closed sans refus nommé ; la BOM UTF-8 d un `.json` à ligne longue est un refus voulu, fail-closed, 0 au tronc | sans objet |
| **N-3** (« CR compris » sans tueur) | cas `2 000 + CR LF` refusé ajouté à T-2 | `:241` `nl - at > LINE_MAX` -> `nl - at - (b[nl - 1] === 13 ? 1 : 0) > LINE_MAX` |
| **N-4** (T-3 lisait un blob historique par son id) | T-3 lit `HEAD:<chemin>` du `.txt` listé ; T-4 et T-5 tiennent l id | sans objet |
