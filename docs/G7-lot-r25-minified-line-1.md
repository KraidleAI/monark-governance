# G7 - lot R25-MINIFIED-LINE-1 (un refus avant le compte de R-25 : aucune ligne de plus de 2 000 octets, hors `.json` valide et un blob mesuré, jamais un JSON qu un outil exécute ; chemins des refus nommés en ASCII échappé)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-minified-line-1`, depuis le tronc `lot/etude-suite` à `c1460fd6` (fusion de #170), puis le tronc `ae460d28` fusionné (`23712236`, commit de fusion ; son message nomme `ebcbad15`, le tronc avait avancé d un commit de `docs/` au moment du `fetch` ; deux fichiers de `docs/`, aucun conflit, aucun fichier du lot touché). Aucun rebase, aucune PR ouverte (à la main de MONARK).
- **Plan** : G0 `docs/G0-lot-r25-minified-line-1.md` (commits `48a74bc1`, `a5f969ae`). Q-1, Q-3 et Q-8 tranchés par RECHERCHES (délégation technique) et **accordés par MONARK** (message `7abb582`) ; Q-4 à Q-6 formés en items chiffrés (section 8). Pli de la G2 fraîche (verdict **BLOQUANT**) : section 11 ; pli de sa G2 delta (verdict **BLOQUANT**) : section 12 ; pli de sa G2 delta-2 (verdict **BLOQUANT**) : section 13.
- **Item fermé côté code** : **R25-MINIFIED-LINE-1** (G7 de R25-GUARDS-2, section 8.2, variante par refus à liste inversée), et **N-1** de la G2 de R25-GUARDS-2. Leur état dans `docs/ETAT.md` reste à la main de MONARK.
- **Intention tenue** : avant tout compte de R-25, `refusals` (donc `pin` en CI et l oracle par son propre module) refuse `long-line` un chemin texte changé sous l un des deux pathspecs dont une ligne dépasse 2 000 octets, hors un `.json` qui se lit comme du JSON et dont le chemin est en ASCII imprimable (jamais un JSON qu un outil exécute : `package.json`, `devcontainer.json`, `.devcontainer.json`, `tasks.json`, `deno.json`, `turbo.json`, `vercel.json`, `composer.json`, casse ASCII comprise ; chemin non ASCII jamais exempt) et le blob exact de la liste mesurée ; chaque refus nomme son chemin sur une seule ligne ASCII qui ne peut former aucune commande de workflow. `ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs` et le workflow public dérivé ne changent pas d un octet.

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
| `649c5e43` | G7 (pli de la G2) ; tête relue par la G2 delta |
| `9de86c19` | tests rouges du pli delta : B-1 (casse), R-1 (noms d outils), N-1 (blob illisible), N-2 (DEL, C1, U+2028) ; noms de tests sans la forme dièse-dièse-crochet |
| `4d7c26b7` | gel du pli delta : liste fermée de noms jamais exempts, casse comprise (l.229) ; `named()` (l.245), appelé par les refus (l.232) et par l erreur de blob illisible (l.223) |
| `1689de88` | D9 quaterdecies pliée (delta) |
| `3a4c3182` | G7 (pli delta) ; tête relue par la G2 delta-2 |
| `a681e961` | tests rouges du pli delta-2 : chemins non ASCII repliés ou ignorés par APFS et HFS+ (B-1 bis), `.devcontainer.json` (R-1) |
| `7fc4b7c2` | gel du pli delta-2 : seul un chemin en ASCII imprimable peut être exempt ; `\.?devcontainer` (l.229) |
| `78afff89` | D9 quaterdecies pliée (delta-2) |
| ce commit | G7 à jour |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.229 (nouvelle, dans la boucle de `refusals`) : `if (LONG_LINE_PATHS[p] !== id && overlong(b) && !(p.endsWith(".json") && /^[\x20-\x7e]*$/.test(p) && !/(^|\/)(package|\.?devcontainer|tasks|deno|turbo|vercel|composer)\.json$/i.test(p) && isJson(b))) out.push(...)` ; l.223 et l.232 (sur place) : l erreur d un blob illisible et chaque refus nomment le chemin par `named()` ; l.235-245 (nouvelles, après `refusals`, avant le bloc principal) : commentaire, `LINE_MAX = 2000`, `LONG_LINE_PATHS` (une entrée, chemin et blob), `overlong`, `isJson`, `named` (`JSON.stringify` du chemin UTF-8, puis `[` et tout caractère au-delà de U+007E échappés en `\uXXXX`) ; l.201 et l.272 (sur place) : commentaire de `refusals`, message de `pin` (`D9 terdecies, quaterdecies`) |
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
| `r25m_the_repository_itself_passes_the_long_line_cap` | dépôt lui-même : `[]` ; mesure indépendante (octets lus en latin1) = la liste, à ses blobs | liste absente | `:229` `p.endsWith(".json") && /^` -> `false && /^` (36 refus) |
| `r25m_a_long_line_json_must_parse` (Q-8) | `src/code.json` (3 000 instructions sur une ligne) refusé ; ligne longue de JSON valide et `.json` invalide court admis | rien de refusé | `:229` ` && isJson(b))` -> `)` |
| `r25m_package_json_is_never_exempt` (B-1, B-1 bis) | `package.json`, `apps/tool/package.json`, `apps/case/Package.json`, `apps/kelvin/pac<U+212A>age.json`, `apps/t2/ta<U+017F>ks.json`, `apps/t3/package<U+200C>.json` (JSON valide, `"pretest"` de 3 000 instructions sur une ligne) refusés ; `apps/upper/PACKAGE.JSON` aussi, **par son extension** (il ne finit pas par `.json`, il n a jamais été exempt) ; `src/notpackage.json` (mêmes octets) et un `package.json` court admis | rien de refusé | `:229` le test des noms retiré ; `:229` drapeau `i` retiré (tué par `Package.json` seul) ; `:229` garde ASCII retirée (tuée par les trois chemins non ASCII) |
| `r25m_tool_run_json_is_never_exempt` (R-1 de la G2 delta) | `.devcontainer/devcontainer.json`, `.devcontainer.json`, `.vscode/Tasks.json`, `deno.json`, `apps/web/turbo.json`, `VERCEL.json`, `composer.json` (JSON valide, une commande de 3 000 instructions sur une ligne) refusés ; `src/data.json` admis | rien de refusé | `:229` `|\.?devcontainer|…|composer)` -> `)` |
| `r25m_an_unread_blob_names_its_path_escaped` (N-1 de la G2 delta) | une entrée `100644` qui pointe un arbre, à un chemin qui ouvre une commande dièse-dièse-crochet : `refusals` lève, `pin` nomme le chemin échappé (`\u005b`), aucune forme de commande dans le journal, job rouge | nom brut | `:223` `named(…)` -> `p` |
| `r25m_a_refused_path_is_named_as_a_json_string` (N-1 ; sauté sous `win32`, motif nommé : `core.protectNTFS`) | `src/new<LF>::warning::forged "q" é.cjs` et `src/del<DEL>.cjs` nommés sur une ligne, `\n`, `\"`, `\u00e9`, `\u007f` échappés, par `pin` et par l oracle | la ligne se coupe | `:245` `JSON.stringify(s)` retiré ; `:245` plage `\u007f` -> `\u0080` (DEL brut) |
| `r25m_a_refused_path_cannot_form_a_workflow_command` (R-2 ; court aussi sous `win32` : `#`, `[`, `]` y sont des noms admis) | deux chemins qui ouvrent une commande dièse-dièse-crochet (`add-mask`, `warning`), `src/ls<U+2028>.cjs` et `src/nel<U+0085>.cjs`, nommés avec `\u005b`, `\u00e9`, `\u2028`, `\u0085` ; aucune forme de commande et aucun caractère non ASCII dans le journal ni dans le log de l oracle | noms bruts | `:245` `[` retiré de la classe échappée ; `:245` plage arrêtée à `\u00ff` (U+2028 brut) |

### 3.2 Tests ajustés (N-1)

Les huit tests qui nomment un refus (`r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory`, `r25h_ci_refuses_a_bare_cr_and_keeps_crlf`, `r25h_ci_refuses_the_js_line_separators`, `r25h_ci_refuses_a_gitlink_under_both_pathspecs`, `r25h_ci_refuses_a_symlink`, `oracle_r25_refuses_what_the_job_refuses`, `r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore`, `r25h_ci_refuses_a_utf16_or_utf32_bom`) attendent le chemin entre guillemets : rouges à la base (F2P). `r25h_ci_refuses_a_bare_cr_and_keeps_crlf` et `r25h_ci_refuses_the_js_line_separators` attendent aussi `long-line` (leurs fixtures n ont aucun `0a`) ; leurs tueurs `:227`, `:228` restent tués. Le tueur de `r25h_pin_requires_the_workflow_and_the_base` passe de `:255` à `:268` ; tué.

## 4. Vérifications (worktree `/home/user/monark-governance-r25m`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests ; tronc `ae460d28`, inchangé aux `fetch` des plis delta et delta-2 ; gel `78afff89`)

| Vérification | Résultat |
|---|---|
| red-proof `--base ae460d28 --gel 78afff89 --repo . --draw 40 --seed 37` | **OK** : 19 jugés, **19 F2P**, 0 refusé ; 41 inchangés ; 19 tueurs tirés (la population), **19 tués**. `RED-PROOF.json` sha256 `d606a26a674edbf06006b88f14936804850b66197a6ebbbdd53c049617028324`. (Gel `1689de88` du pli delta : 19 F2P, 19 tués, sha256 `eb0ae18c…` ; gel `f55474ba` du pli : 17 et 17) |
| tueurs tirés à la main au gel (un test seul, fichier restauré, sha256 vérifié) | les **dix-neuf** du lot (section 3.1 et `:268`) tués par assertion au gel `78afff89`. Au premier gel `0a3b64f4` : 19 sur 19, dont les dix tueurs voisins des tests `r25h_` et de l oracle (`:206` deux, `:213`, `:216` deux, `:226`, `:227`, `:228` deux, `oracle/r25.mjs:33`), lignes inchangées depuis |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` | 84 tueurs, 84 ANCRE, 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration` 60, `ci-gates`, `oracle-run`, `dojo-render`, `export-public`, `byte-guard`) | 145/145 |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| `npm run test:main` (worktree jetable, `node_modules` copié, pas lié) | tête `f55474ba` (pli de la G2) : **2 483 tests, 2 461 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 ; non rejoué aux plis delta et delta-2 (le changement ne touche que `refusals`, couvert par les tests du lot) |
| workflow public dérivé | identique au tronc `ae460d28` ; `.github/` et `scripts/oracle/` inchangés sur la plage |

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite` (`ae460d28`), tête `78afff89` : `STAT 159 insertions, 13 deletions, changed 172`, `CONTENT_STAT 0`, GREEN (mode `unproven`), **sous 547**. `refusals` a tourné sur la plage du lot : aucun refus.

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

Contrôle sur objets seuls : indifférent à `autocrlf`, aux liens, à la casse de NTFS. Fixtures par la plomberie, en mémoire ; chemins par `join` ; aucun nom réservé. Un seul saut nommé : `r25m_a_refused_path_is_named_as_a_json_string` (git pour Windows refuse un caractère de contrôle dans un chemin, `core.protectNTFS` ; le runner du job est Linux) ; le cas DEL y est rangé pour la même raison. Les cas U+2028 et U+0085 courent sous `win32` avec le test R-2. `r25m_an_unread_blob_names_its_path_escaped` court partout (`#`, `[`, `]`, `=` et l espace sont admis sous NTFS, l entrée n est jamais extraite). Le cas dièse-dièse-crochet (R-2) a son propre test, sans saut : `#`, `[`, `]`, `=`, l espace et `é` sont des noms admis sous NTFS, et le chemin n est jamais extrait. `r25m_only_json_and_the_measured_blob_keep_a_long_line` lit le `.txt` listé à `HEAD`, présent à toute profondeur de clone (N-4).

## 8. Résidus formés en items (règle PAROXYSME : une limite déclarée n est jamais une fin)

Portés par RECHERCHES, déclencheur « avant T0 », état dans `docs/ETAT.md` à la main de MONARK.

| Item | Résidu, dit tel quel | Options et prix |
|---|---|---|
| **R25-LINE-CAP-2000-1** (Q-4) | du code découpé en lignes de 2 000 octets : un facteur 25 environ sur le compte, borné | (a) seuil de 1 000 octets : 8 chemins hors `.json` et hors la liste au-delà (au plus 1 795 octets), donc 8 blobs de plus dans `LONG_LINE_PATHS`, une ligne de module et un test ajusté ; (b) le plancher `ceil(octets/80)` du G7 de R25-GUARDS-2 (section 8.2) : change le compte et les lignes `STAT=` (≈ 6 fichiers de code, ligne d ADR) |
| **R25-JSON-STRING-CODE-1** (R-1 de la G2) | du code rangé dans une chaîne d un `.json` valide et appelé par une ligne comptée (`new Function(require("./c.json").c)()`, mesuré par la G2 : `STAT` 2, exécuté), **sans borne de taille** ; la ligne d appel est comptée et relue | (a) plafonner à `LINE_MAX` octets chaque valeur chaîne d un `.json` (un parcours de l objet rendu par `JSON.parse`, ≈ 3 lignes, un test) : 19 des 36 `.json` à ligne longue du tronc la dépassent (fixtures `apps/dojo/test/fixtures/history/*.json` jusqu à 50 068 octets, `apps/site/data/narabi-capture.json`, `apps/site/data/manifest.sha256.json`, `scripts/export-exclude-tests.json`, `docs/carto/openapi-live-2026-09-22.json`), à lister par chemin et blob, et chaque mise à jour de ces fixtures devient une ligne du module ; (b) rien : la relecture de la ligne d appel |
| **R25-TOOL-RUN-JSON-1** (R-1 de la G2 delta) | un JSON exécuté par un outil **hors de la liste fermée** (`package.json`, `devcontainer.json`, `.devcontainer.json`, `tasks.json`, `deno.json`, `turbo.json`, `vercel.json`, `composer.json`, casse ASCII comprise, chemin ASCII imprimable seul ; `deno.jsonc` ne finit pas par `.json` et reste sous le plafond) : un outil futur ou inconnu | (a) ajouter son nom de base à la liste : une ligne du module, 0 au tronc pour les noms connus ; (b) n admettre l exemption `.json` que sous une liste de répertoires de données (ceux des 36 `.json` du tronc), à tenir |
| **R25-REFUSAL-NAMES-1** (Q-5) | fermé au pli (R-2) et au pli delta (N-1 : l erreur de blob illisible passe par le même `named()`) : noms en ASCII, `[` et tout au-delà de U+007E échappés ; reste un nom ASCII imprimable sans `[` ni saut de ligne, qui ne peut porter aucune commande (`::` exige la tête de ligne, `##[` exige `[`) | aucune option ouverte ; à clore par MONARK |
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
| Q-8 (`.json` à ligne longue) | admis seulement si `JSON.parse` du blob réussit et que le chemin est en ASCII imprimable, **jamais un JSON qu un outil exécute** (liste fermée, casse ASCII comprise) | RECHERCHES, accordé par MONARK ; B-1 au pli, B-1 et R-1 au pli delta |

## 11. Pli de la G2

G2 : `/home/user/recherches/coordination/pieces/2026-10-04-G2-recherches/G2-r25-minified-line-1.md`, verdict **BLOQUANT** (B-1), tête relue `abae864c`. Tests d abord (`5be82605`), puis code (`b7cb95b2`), chaque point avec son tueur de forme fermée, tiré à la main et tué.

| Point | Disposition | Test (tueur) |
|---|---|---|
| **B-1** (npm exécute les chaînes de `package.json`, sans ligne d appel) | **fermé** (casse comprise depuis le pli delta, section 12) : un `package.json` à toute profondeur n est jamais exempt, même JSON valide (l.229). Prémisse corrigée dans le commentaire l.235-238, `isJson` l.244, D9 quaterdecies et ce G7. 0 refus au tronc (12 `package.json`, au plus 569 octets par ligne). Variante plus large : item R25-JSON-STRING-CODE-1 | `r25m_package_json_is_never_exempt` (`:229` le test du nom retiré) |
| **R-1** (code rangé dans une chaîne d un `.json` valide, appelé par une ligne comptée) | **rétabli comme résidu** dans D9 quaterdecies et en item R25-JSON-STRING-CODE-1 (section 8), option chiffrée (19 blobs) ; « même appelé par `eval` » précisé (l `eval` du fichier entier) | sans objet |
| **R-2** (`##[cmd]` lu n importe où dans la ligne) | **fermé** : le nom passe par `JSON.stringify`, puis `[` et tout caractère au-delà de U+007E (DEL, C1, U+2028, U+2029) en `\uXXXX` (l.232, puis `named()` l.245) : une ligne ASCII sans `[`, qui commence par `r25-integration:` ; ni `::cmd::` ni `##[` possibles | `r25m_a_refused_path_cannot_form_a_workflow_command` (`:232` `[` retiré de la classe) ; `r25m_a_refused_path_is_named_as_a_json_string` attend `é` |
| **N-1** (un actif à sa tête magique saute aussi `long-line` et `bare-cr`) | ajouté à l item R25-ASSET-POLYGLOT-1 (section 8) | sans objet |
| **N-2** (`isJson` construit une chaîne ; 300 Mo de JSON valide font tomber V8 ; une BOM UTF-8 est refusée) | D9 quaterdecies corrigée : « sans chaîne construite » pour la seule mesure des lignes ; le crash V8 est fail-closed sans refus nommé ; la BOM UTF-8 d un `.json` à ligne longue est un refus voulu, fail-closed, 0 au tronc | sans objet |
| **N-3** (« CR compris » sans tueur) | cas `2 000 + CR LF` refusé ajouté à T-2 | `:241` `nl - at > LINE_MAX` -> `nl - at - (b[nl - 1] === 13 ? 1 : 0) > LINE_MAX` |
| **N-4** (T-3 lisait un blob historique par son id) | T-3 lit `HEAD:<chemin>` du `.txt` listé ; T-4 et T-5 tiennent l id | sans objet |

## 12. Pli de la G2 delta

G2 delta : `/home/user/recherches/coordination/pieces/2026-10-04-G2-recherches/G2-r25-minified-line-1-delta.md`, verdict **BLOQUANT** (B-1), tête relue `649c5e43`. Tronc relu au `fetch` explicite : `ae460d28`, déjà fusionné. Tests d abord (`9de86c19`), puis code (`4d7c26b7`), chaque point avec son tueur de forme fermée, tiré à la main et tué.

| Point | Disposition | Test (tueur) |
|---|---|---|
| **B-1** (`Package.json` exempt ; sous NTFS ou APFS npm le lit comme `package.json`) | **fermé** : le nom est comparé **casse ASCII comprise** (`/i`, l.229 ; complété au pli delta-2, section 13, pour les chemins non ASCII). 0 refus au tronc (aucune variante de casse) | `r25m_package_json_is_never_exempt` : cas `apps/case/Package.json` (`:229` drapeau `i` retiré : tué par ce seul cas ; `apps/upper/PACKAGE.JSON` est refusé par son extension, pas par le drapeau, correction de la G2 delta-2 N-1) |
| **R-1** (autres JSON exécutés par un outil, hors CI) | **mis en œuvre** plutôt que dit : liste fermée de noms de base jamais exempts, casse comprise : `package.json`, `devcontainer.json`, `tasks.json`, `deno.json`, `turbo.json`, `vercel.json`, `composer.json` (`deno.jsonc` ne finit pas par `.json` : déjà sous le plafond). 0 au tronc. Reste l outil inconnu : item R25-TOOL-RUN-JSON-1 (section 8) | `r25m_tool_run_json_is_never_exempt` (`:229` liste réduite à `package`) |
| **N-1** (chemin brut dans l erreur `blob … unread`) | **fermé** : l échappement est une fonction, `named()` (l.245), appelée par les refus (l.232) et par cette erreur (l.223). Fixture bon marché : une entrée d index `100644` qui pointe un arbre | `r25m_an_unread_blob_names_its_path_escaped` (`:223` `named(…)` -> `p`) |
| **N-2** (DEL, C1, U+2028 sans tueur) | **fermé** : cas `src/del<DEL>.cjs` (test N-1, sauté sous `win32`), `src/ls<U+2028>.cjs` et `src/nel<U+0085>.cjs` (test R-2, courent partout), et l assertion « aucun caractère non ASCII dans le log de l oracle » | `:245` plage `\u007f` -> `\u0080` ; `:245` plage arrêtée à `\u00ff` |

Les noms des tests R-2 et N-1 ne contiennent plus la forme dièse-dièse-crochet : un nom de test est imprimé dans le journal de la CI. Correction au passage : la version précédente de ce G7 portait des échappements `\uXXXX` rendus en caractères (`é`, `[`) par l outil d écriture ; ils sont rétablis.

## 13. Pli de la G2 delta-2

G2 delta-2 : `/home/user/recherches/coordination/pieces/2026-10-04-G2-recherches/G2-r25-minified-line-1-delta-2.md`, verdict **BLOQUANT** (B-1 bis), tête relue `3a4c3182`. Tronc relu au `fetch` explicite : `ae460d28`, déjà fusionné. Test d abord (`a681e961`), puis code (`7fc4b7c2`), chaque point avec son tueur de forme fermée, tiré à la main et tué.

| Point | Disposition | Test (tueur) |
|---|---|---|
| **B-1 bis** (« casse comprise » ne tient que pour l ASCII : `pac<U+212A>age.json`, `ta<U+017F>ks.json`, `package<U+200C>.json` passent, et APFS ou HFS+ les lisent comme `package.json` ou `tasks.json`) | **fermé** : un `.json` n est exempt que si son chemin est en ASCII imprimable (`/^[\x20-\x7e]*$/`, l.229 ; `p` est la chaîne latin1 des octets, tout octet non ASCII l exclut). « casse ASCII comprise, chemin non ASCII jamais exempt » écrit dans D9 quaterdecies et ce G7. 0 chemin non ASCII au tronc (G2 delta-2 : 161 `.json`). Les trois noms sont admis sous NTFS et par git pour Windows (aucun contrôle, aucun caractère réservé) : le test court partout, sans saut | `r25m_package_json_is_never_exempt` : cas `apps/kelvin/pac<U+212A>age.json`, `apps/t2/ta<U+017F>ks.json`, `apps/t3/package<U+200C>.json` (`:229` garde ASCII retirée) |
| **R-1** (`.devcontainer.json` à la racine, que la spécification Dev Containers lit aussi) | **fermé** : `(^|\/)\.?devcontainer\.json` (l.229), 0 au tronc | `r25m_tool_run_json_is_never_exempt` : cas `.devcontainer.json` (`:229` liste réduite à `package`) |
| **N-1** (G7 : `PACKAGE.JSON` attribué au drapeau `i`) | **corrigé** (sections 3.1 et 12) : `PACKAGE.JSON` est refusé par son extension ; seul `Package.json` tue le tueur du drapeau `i` | sans objet |
| **N-2** (deux mutants sans enjeu survivent) | **dit** : `:229` `$` retiré de la liste des noms (la garde refuse alors davantage, jamais moins : `package.json.bak.json` serait refusé) ; `:223` `named(p)` sans décodage UTF-8 (le nom reste ASCII et échappé, seulement moins lisible : chaque octet non ASCII sort en `\u00XX`). Aucune promesse touchée ; pas de tueur ajouté | sans objet |
