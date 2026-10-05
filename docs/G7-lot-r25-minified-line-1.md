# G7 - lot R25-MINIFIED-LINE-1 (un refus avant le compte de R-25 : aucune ligne de plus de 2 000 octets, hors `.json` et un blob mesuré ; chemins des refus nommés en JSON)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-minified-line-1`, depuis le tronc `lot/etude-suite` à `c1460fd6` (fusion de #170). Aucun rebase, aucune PR ouverte (à la main de MONARK).
- **Plan** : G0 `docs/G0-lot-r25-minified-line-1.md` (commits `48a74bc1`, `a5f969ae`). Questions Q-1 à Q-8 tranchées par RECHERCHES (délégation technique), MONARK informé : section 10. L option de Q-8 est versée (section 2).
- **Item fermé côté code** : **R25-MINIFIED-LINE-1** (G7 de R25-GUARDS-2, section 8.2, variante par refus à liste inversée), et **N-1** de la G2 de R25-GUARDS-2. Leur état dans `docs/ETAT.md` reste à la main de MONARK.
- **Intention tenue** : avant tout compte de R-25, `refusals` (donc `pin` en CI et l oracle par son propre module) refuse `long-line` un chemin texte changé sous l un des deux pathspecs dont une ligne dépasse 2 000 octets, hors `.json` et le blob exact de la liste mesurée ; chaque refus nomme son chemin en chaîne JSON. `ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs` et le workflow public dérivé ne changent pas d un octet.

## 1. Commits

| Commit | Branche | Rôle |
|---|---|---|
| `48a74bc1` | `recherches/r25-minified-line-1` (poussée) | G0 et tests rouges (six `r25m_`, huit assertions de chemin aux guillemets, un tueur ré-ancré) |
| `a5f969ae` | idem (poussée) | deux tests `r25h_` attendent aussi `long-line` sur leurs fixtures d une seule ligne |
| `0a3b64f4` | `wip/r25-minified-line-1-gel`, puis poussé en avance rapide | gel : module, `.d.mts`, ligne d ADR D9 quaterdecies |
| `a8f22733` | idem | G7 (premier état) |
| `9ebd4f7f` | idem | test rouge de Q-8 (`r25m_a_long_line_json_must_parse`) ; tueurs de la l.229 et de `pin --base` (`:266` -> `:267`) aux lignes du nouveau gel |
| `9610efbc` | idem | gel de Q-8 : un `.json` à ligne longue n est admis que si son blob se lit comme du JSON ; D9 quaterdecies complétée |
| ce commit | idem | G7 à jour |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.229 (nouvelle, dans la boucle de `refusals`) : `if (LONG_LINE_PATHS[p] !== id && overlong(b) && !(p.endsWith(".json") && isJson(b))) out.push(...)` ; l.232 (sur place) : chaque refus rendu `<motif> <JSON.stringify(chemin UTF-8)>` ; l.235-244 (nouvelles, après `refusals`, avant le bloc principal) : commentaire, `LINE_MAX = 2000`, `LONG_LINE_PATHS` (une entrée, chemin et blob), `overlong`, `isJson` (`JSON.parse` du blob décodé en UTF-8, appelé seulement sur un `.json` à ligne longue) ; l.201 et l.271 (sur place) : commentaire de `refusals`, message de `pin` (`D9 terdecies, quaterdecies`) |
| `scripts/lot-size-integration.d.mts` | `LINE_MAX`, `LONG_LINE_PATHS` |
| `docs/adr/ADR-M003-phase2-integration.md` | **Addendum D9 quaterdecies** (lettre libre : aucune occurrence antérieure dans `docs/adr`, `terdecies` étant la dernière) |

`overlong(b)` : un pas `b.indexOf(10, at)` par ligne sur le `Buffer` du blob (déjà lu par le `cat-file --batch` de `refusals`), longueur `nl - at`, la dernière ligne mesurée jusqu à la fin du blob. Aucune chaîne construite, aucun `split`.

Workflow public dérivé : **identique** à celui du tronc (`derivePublicWorkflow` des deux `ci.yml`, égalité stricte, mesurée ; `ci.yml` inchangé). Le module n est pas exporté dans le dépôt public.

## 3. Tests et tueurs

### 3.1 Tests nouveaux

| Test | Gel | Base `c1460fd6` | Tueur (tiré à la main, tué) |
|---|---|---|---|
| `r25m_ci_refuses_code_on_one_long_line` (bloc `run:` réel et oracle) | `src/one.cjs`, `apps/site/app/docs/one.tsx` refusés, job rouge sans compte, oracle `refused` | `Changed` 1, `Content` 1, vert | `:229` `&& overlong(b) &&` -> `&& false &&` |
| `r25m_line_length_is_bytes_between_line_feeds` | 2 000 admis ; 2 001 refusés en tête, au milieu, en fin sans LF ; 1 001 `é` refusés ; 1 999 + CR LF admis ; vide et 5 000 lignes courtes admis | rien de refusé | `:241` `>` -> `>=` ; `:241` `nl = b.length` -> `break` |
| `r25m_only_json_and_the_measured_blob_keep_a_long_line` | `.json` admis ; `.JSON`, `.jsonl`, `.csv` refusés ; blob du tronc admis au chemin du `.txt`, un octet de plus refusé | rien de refusé | `:229` `p.endsWith(".json")` -> `/\.(json|jsonl|csv)$/i.test(p)` ; `:229` blob -> chemin seul |
| `r25m_long_line_cap_is_the_measured_list` | `LINE_MAX` 2 000, une entrée | exports absents | `:239` `2000` -> `4000` |
| `r25m_the_repository_itself_passes_the_long_line_cap` | dépôt lui-même : `[]` ; mesure indépendante (octets lus en latin1) = la liste, à ses blobs | liste absente | `:229` `!(p.endsWith(".json") && isJson(b))` -> `true` (36 refus) |
| `r25m_a_long_line_json_must_parse` (Q-8) | `src/code.json` (3 000 instructions sur une ligne, pas du JSON) refusé ; `src/data.json` (ligne longue de JSON valide) et `src/short.json` (invalide, lignes courtes) admis | rien de refusé | `:229` ` && isJson(b))` -> `)` |
| `r25m_a_refused_path_is_named_as_a_json_string` (sauté sous `win32`, motif nommé) | `src/new\n::warning::forged "q" é.cjs` nommé en JSON sur une ligne, par `pin` et par l oracle ; aucune ligne `::warning::` | la ligne se coupe | `:232` `JSON.stringify(...)` retiré |

### 3.2 Tests ajustés (N-1)

Les huit tests qui nomment un refus (`r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory`, `r25h_ci_refuses_a_bare_cr_and_keeps_crlf`, `r25h_ci_refuses_the_js_line_separators`, `r25h_ci_refuses_a_gitlink_under_both_pathspecs`, `r25h_ci_refuses_a_symlink`, `oracle_r25_refuses_what_the_job_refuses`, `r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore`, `r25h_ci_refuses_a_utf16_or_utf32_bom`) attendent le chemin entre guillemets : rouges à la base (F2P). `r25h_ci_refuses_a_bare_cr_and_keeps_crlf` et `r25h_ci_refuses_the_js_line_separators` attendent aussi `long-line` (leurs fixtures n ont aucun `0a`) ; leurs tueurs `:227`, `:228` restent tués. Le tueur de `r25h_pin_requires_the_workflow_and_the_base` passe de `:255` à `:267` (douze lignes insérées avant) ; tué.

## 4. Vérifications (worktree `/home/user/monark-governance-r25m`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| red-proof `--base c1460fd6 --gel 9610efbc --repo . --draw 16 --seed 37` | **OK** : 15 jugés, **15 F2P**, 0 refusé ; 41 inchangés ; 15 tueurs tirés (la population), **15 tués**. `RED-PROOF.json` sha256 `e428121f64751916fde93c8d85ed0a47180bb4dc2335bd2f95e14d7a6ff334c1`. (Premier gel `0a3b64f4` : 14 F2P, 14 tués, sha256 `0eec7afa…`) |
| tueurs tirés à la main au gel (un test seul, fichier restauré, sha256 vérifié) | au gel `9610efbc` : les **dix** du lot (section 3.1 et `:267`) tués ; au gel `0a3b64f4` : **19 sur 19 tués** par assertion, les neuf du lot d alors, et les dix tueurs des tests `r25h_` et de l oracle sur les lignes voisines (`:206` deux, `:213`, `:216` deux, `:226`, `:227`, `:228` deux, `oracle/r25.mjs:33`) |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` | 75 tueurs, 75 ANCRE, 0 DERIVE, 0 PERDU (tête `9610efbc`) |
| tests du lot (`r25-integration` 56, `ci-gates`, `oracle-run`, `dojo-render`, `export-public`, `byte-guard`) | 141/141 (tête `9610efbc`) |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| `npm run test:main` | non rejoué après Q-8 (le changement ne touche que `refusals`, couvert par les tests du lot) ; tête `0a3b64f4` : **2 480 tests, 2 458 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 (section 4.1) |
| workflow public dérivé | identique au tronc |

### 4.1 `npm run test:main`

Tête `0a3b64f4`, dans un worktree jetable dont `node_modules` est une copie réelle : **2 480 tests, 2 458 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0. Un premier passage, `node_modules` en lien symbolique vers un autre worktree, avait 50 rouges, **les mêmes au tronc `c1460fd6`** dans le même montage : `.gitignore` (`node_modules/`) n ignore pas un lien, que `mutants/run.mjs` lit alors comme un fichier non suivi (`EISDIR`), et les liens de paquets du lien résolvent vers l autre worktree (deux instances de modules, `sentinel`, `ukemi`). Environnement, pas le lot.

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite` (`c1460fd6`), tête `9610efbc` : `STAT 112 insertions, 12 deletions, changed 124`, `CONTENT_STAT 0`, GREEN (mode `unproven`), **sous 547** (estimé au G0 : ≈ 120). `refusals` a tourné sur la plage du lot : aucun refus.

## 6. Mesures

| Mesure | Résultat |
|---|---|
| Tronc `c1460fd6`, chemins texte sous les pathspecs à ligne de plus de 2 000 octets | 37 : 36 `.json` (tous du JSON valide) et `tradexyz_llms_full.txt` (blob `3989315d…`, plus longue ligne 59 631 octets) |
| `.jsonl`, `.csv` concernés | 0 |
| Node sur `.jsonl`, `.csv`, `.txt` (`node f`, `require`) | exécutés en CommonJS ; `.json` lu comme donnée |
| `pin`, plage avec 200 Mio sur une ligne, 2 000 000 de lignes courtes et `one.cjs` | deux refus, sortie 2, 776 ms |
| `refusals` du dépôt lui-même | `[]`, 233 ms |

## 7. Windows

Contrôle sur objets seuls : indifférent à `autocrlf`, aux liens, à la casse de NTFS. Fixtures par la plomberie, en mémoire ; chemins par `join` ; aucun nom réservé. `r25m_a_refused_path_is_named_as_a_json_string` est **sauté sous `win32`** avec son motif (git pour Windows refuse un caractère de contrôle dans un chemin, `core.protectNTFS` ; le runner du job est Linux). Les cinq autres courent partout. `r25m_only_json_and_the_measured_blob_keep_a_long_line` lit le blob du `.txt` dans le dépôt par son id : il suppose ce blob présent (vrai pour tout clone du tronc qui contient le fichier).

## 8. Résidus (règle PAROXYSME : une limite déclarée n est jamais une fin)

| Résidu | Options et prix |
|---|---|
| Code découpé en lignes de 2 000 octets : un facteur 25 environ sur le compte, borné | (a) seuil plus bas : mesuré au tronc, 8 chemins hors `.json` et hors la liste au-delà de 1 000 octets (au plus 1 795), donc un seuil de 1 000 coûte 8 blobs de plus dans la liste ; (b) le plancher `ceil(octets/80)` du G7 de R25-GUARDS-2 (section 8.2), qui change le compte et les lignes `STAT=` |
| ~~Un `.json` exécuté autrement que comme donnée~~ : **fermé** par Q-8 (un `.json` à ligne longue n est admis que s il se lit comme du JSON ; du JSON valide exécuté en JS ne fait rien). Reste `bash x.json` ou `python3 x.json` sur du JSON valide, sans effet de code | les 36 `.json` concernés du tronc sont valides, 0 refus |
| `JSON.stringify` n échappe ni U+2028/U+2029, ni les contrôles C1, ni DEL | sans effet mesuré sur le runner (lignes coupées sur LF et CR, échappés) ; échapper tout hors ASCII imprimable coûte une ligne |

## 9. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Addendum D9 quaterdecies**, à contrôler par MONARK au diff.

## 10. Décisions (RECHERCHES, délégation technique ; MONARK informé)

| Question | Décision | Nature |
|---|---|---|
| Q-1 (extensions admises) | `.json` seul, casse comprise | **resserrement** du G7 de R25-GUARDS-2 (`.jsonl`, `.csv` exécutés par Node, mesuré) ; coût au tronc nul |
| Q-2 (unité) | octets, CR compté, dernière ligne sans LF mesurée | défaut |
| Q-3 (liste exacte) | chemin **et** blob exact, aucun plafond séparé | **resserrement** ; changer le `.txt` exige une ligne du module |
| Q-4 (seuil) | 2 000 octets ; le reste est le résidu de l item (section 8), option 1 000 octets chiffrée à 8 blobs de plus | défaut |
| Q-5 (N-1) | `JSON.stringify` | défaut |
| Q-6 (N-1 sous `win32`) | sauté, motif nommé | défaut |
| Q-7 (lettre d ADR) | D9 quaterdecies | défaut |
| Q-8 (`.json` à ligne longue) | **option versée** : admis seulement si `JSON.parse` du blob réussit (test rouge d abord, tueur tiré et tué) | resserrement ; 0 refus au tronc |
