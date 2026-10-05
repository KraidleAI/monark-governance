# G7 - lot R25-GUARDS-2 (trois refus avant le compte de R-25 : un actif déclaré porte le nombre magique de son format ; une ligne finit par LF ; ni gitlink ni lien symbolique)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-guards-2`, depuis `recherches/r25-guards-1` à `d92de098` (G0), puis le tronc `lot/etude-suite` fusionné à `e74d39ea` (fusion de #166) et à `e7f091b7` (ligne d ETAT), commits de fusion, aucun rebase. Aucune PR ouverte (à la main de MONARK).
- **Plan** : G0 `docs/G0-lot-r25-guards-2.md` (commit `69ac13be`). Défauts Q-1 à Q-10 du G0 acceptés par la cellule et par MONARK, à une condition (règle PAROXYSME : une limite déclarée n est jamais une fin) : les deux résidus sont formés en items de recherche, avec leurs options et leur prix (section 8).
- **Items fermés côté code** : **R25-ASSET-DIR-MAGIC-1**, **R25-CR-ONLY-LINES-1**, **R25-GITLINK-SYMLINK-1** (`docs/ETAT.md`, formés au G7 de R25-GUARDS-1, section 9.3). Leur état dans `ETAT.md` reste à la main de MONARK.
- **Intention tenue** : avant tout compte de R-25, la CI (commande `pin`) et l oracle (son propre module) refusent, sous les deux pathspecs de la plage des comptes, un gitlink, un lien symbolique, un actif déclaré sans le nombre magique de son format, et un chemin texte qui contient un CR seul ou un séparateur de ligne JS. Les lignes `STAT=` et `CONTENT_STAT=` ne changent pas d un octet.

## 1. Commits

| Commit | Rôle |
|---|---|
| `69ac13be` | G0 |
| `6516d743` | fusion du tronc `e74d39ea` (#166 fusionnée), aucun conflit |
| `8650fd07` | tests rouges (neuf nouveaux, sept ajustés), un tueur au-dessus de chaque test |
| `ade246c3` | gel : `refusals`, `ASSET_MAGIC`, `pin --ci --base`, miroir de l oracle, `ci.yml` sur place, `.d.mts`, ligne d ADR D9 terdecies |
| `f701cbbb` | tueur mort-né ré-ancré (section 3.2) |
| `9744ead0` | fusion du tronc `e7f091b7` (une ligne de `docs/ETAT.md`), aucun conflit, aucun fichier du lot touché |
| ce commit | G7 |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.200-231 (après `attrTree`, aucun tueur existant décalé) : `ASSET_MAGIC` (l.206) et `refusals(cwd, base, specs)` ; l.254-261 : `pin` exige `--ci` et `--base`, écrit `r25-integration: refused <motif> <chemin>` par refus sur stderr, sort avec 2 sans rien sur stdout ; en-tête l.14 complété sur place |
| `scripts/lot-size-integration.d.mts` | `ASSET_MAGIC`, `refusals` |
| `scripts/oracle/r25.mjs` | l.15 : import de `refusals` et `specsOf` de **son** module ; l.33 : refus non vide : mode `refused`, `W` gardé, `red: true` ; l.37 : une ligne `refused <motif> <chemin>` par refus dans le log ; en-tête l.10 complété sur place |
| `.github/workflows/ci.yml` | trois lignes réécrites **sur place** dans le job r25 seul (l.92 commentaire, l.93 `R25_PIN=$(node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base "origin/$GITHUB_BASE_REF") \|\| {`, l.94 `::error::Gate R-25: pinned git read not obtained, or a changed path refused (see the lines above). Fail-closed.`). Aucun décalage de ligne ; permissions du job inchangées |
| `docs/adr/ADR-M003-phase2-integration.md` | **Addendum D9 terdecies** (lettre libre : aucune occurrence antérieure dans `docs/adr`) |

`refusals` lit, pour chaque pathspec, `git <PIN> diff --raw -z --no-renames --no-abbrev <base>...HEAD -- <pathspec>` ; un mode d arrivée `160000` est refusé `gitlink`, `120000` `symlink`, `000000` (suppression) passe ; les autres chemins sont classés par `git check-attr -z --stdin diff` sous `GIT_ATTR_SOURCE` = `attrTree(cwd)` (`unspecified` = actif déclaré : le même moteur de motifs que le compte, sous `core.ignorecase=false`) et leurs blobs lus par un seul `cat-file --batch`. Actif : refus `asset-magic` si aucune tête de `ASSET_MAGIC[<ext>]` ne commence le blob ; une extension de `BINARY_ASSETS` sans entrée lève (jamais un passe-droit). Texte : refus `bare-cr` d un `0d` non suivi de `0a`, `line-separator` d un U+2028 ou U+2029. Toute sortie illisible lève. Chemins lus en octets (`latin1`), rendus en UTF-8.

`ASSET_MAGIC` (mesuré sur les 45 binaires du tronc, G0 section 1.2) : `png` `89504e470d0a1a0a` ; `jpg` `ffd8ff` ; `ttf` `00010000` seul (ni `OTTO` ni `true`, préfixes JS exécutables) ; `ots` les 32 octets de l en-tête OpenTimestamps et de la version `01` ; `cbor` un premier octet de table, `a0` à `bf`.

Workflow public dérivé : **identique** à celui du tronc (`derivePublicWorkflow` des deux `ci.yml`, égalité stricte, mesurée ; aucune occurrence de `r25`, `R25`, `R-25`, `terdecies` ni `refus`).

## 3. Tests et tueurs

### 3.1 Tests nouveaux

| Test | Gel | Base `6516d743` | Tueur |
|---|---|---|---|
| `r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory` (bloc `run:` réel) | `out/tool.png` (`// <NUL>` puis 300 lignes) : aucun compte, `refused asset-magic out/tool.png`, `::error::`, sortie 1 | `Changed lines: 0`, vert | `lot-size-integration.mjs:226` la comparaison de tête -> `.some(() => true)` |
| `r25h_asset_magics_are_the_measured_list` | égalité exacte de `ASSET_MAGIC` ; mêmes extensions que `BINARY_ASSETS` | export absent : assertion | `:206` `ttf: ["00010000"]` -> `ttf: ["4f54544f"]` |
| `r25h_every_trunk_asset_passes_its_magic` | l arbre de `HEAD` du dépôt, ajouté entier sur un commit vide (objets partagés par `alternates`, rien copié) : aucun refus ; actifs des cinq extensions présents | fonction absente : assertion | `:206` dernier octet de la tête `ots` `01` -> `02` (refus des 37 `.ots`) |
| `r25h_ci_refuses_a_bare_cr_and_keeps_crlf` | `src/cr-only.cjs` refusé `bare-cr` ; `src/crlf-ok.cjs` (CR LF) et `docs/notes-cr.md` (hors pathspec) non nommés | `Changed lines: 11`, vert | `:227` `if (b[i + 1] !== 10)` -> `if (true)` |
| `r25h_ci_refuses_the_js_line_separators` | `src/ls-sep.cjs` (U+2028) et `src/ps-sep.cjs` (U+2029) refusés | 2, vert | `:228` ` \|\| b.includes(" ")` retiré |
| `r25h_ci_refuses_a_gitlink_under_both_pathspecs` | `vendor/subrepo` (CODE) et `apps/site/app/docs/subrepo` (CONTENT) refusés ; un gitlink de la base supprimé passe | `Changed` 1, `Content` 1, vert | `:216` `"160000"` -> `"169999"` |
| `r25h_ci_refuses_a_symlink` | `src/link.mjs` (`120000`, vers `../docs/payload.md`) refusé | 1, vert | `:216` `"120000"` -> `"129999"` |
| `r25h_pin_requires_the_workflow_and_the_base` | `pin` seul, ou sans `--base`, sort avec 2, stdout vide, même si `origin/lot/etude-suite` existe | sortie 0, lecture imprimée | `:255` `[base] = opt("--base")` -> `[base = "origin/lot/etude-suite"] = opt("--base")` |
| `oracle_r25_refuses_what_the_job_refuses` | `r25()` : mode `refused`, quatre refus nommés (asset-magic, bare-cr, gitlink, symlink), rouge | `unproven`, vert | `oracle/r25.mjs:33` `...(refused.length > 0 ?` -> `...(false ?` |

Fixtures par la plomberie (`hash-object -w --no-filters --stdin`, `update-index --cacheinfo <mode>,<id>,<chemin>`) : octets exacts, aucun lien du système de fichiers, aucun sous-module cloné, aucun `autocrlf`. Aucun nom réservé de Windows (`nul`, `con`, `prn`, `aux`, `com1` à `com9`, `lpt1` à `lpt9`).

### 3.2 Tests ajustés

| Test | Ajustement | Base | Tueur |
|---|---|---|---|
| `ci_r25_counts_read_under_the_module_pin` (`ci-gates`) | ligne `R25_PIN=` et `::error::` épinglées à leur nouveau texte | rouge (F2P) | inchangé, `ci.yml:97` (`eval "$R25_PIN"`) |
| `r25a_ci_w_fails_closed_without_the_pinned_read` | `::error::` nouveau (constante `PIN_ERROR`) | rouge (F2P) | **ré-ancré** : `:178` (`if (infoAttributes(cwd)) throw`) était **mort-né**, au tronc aussi (mesuré sur `6516d743` : le test reste vert sous ce mutant), car la sonde d `attrTree` (N-1 de R25-GUARDS-1) refuse déjà `* -diff` dans `info/attributes`. Nouveau tueur `:177` `< 2040) throw` -> `< 0) throw`, tué par le cas git 2.39.5 |
| `r25g_attribute_tree_must_be_in_force` | `::error::` nouveau | rouge (F2P) | inchangé, `:196` |
| `r25a_ci_w_reads_under_the_module_pin` | `pin --ci … --base origin/<cible>` | vert : **resserrement** | inchangé, `:180` |
| `r25a_pin_prints_exactly_the_pinned_names` | idem, la référence `origin/<cible>` posée | vert : resserrement | inchangé, `:180` |
| `r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection` | `apps/site/app/fonts/f.ttf` commence par la tête TrueType `00 01 00 00` | vert : resserrement | inchangé, `:188` |
| `r25g_ci_w_counts_code_named_as_an_asset_outside_the_asset_directories` | `out/real.png` commence par la signature PNG | vert : resserrement | inchangé, `:188` |

Les deux fixtures d actif ajustées n avaient pas de nombre magique : sous le lot, elles sont refusées, ce qui est le but ; elles portent désormais la tête de leur format, comme les 45 actifs du tronc.

## 4. Vérifications (worktree `/home/user/monark-governance-r25h`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| red-proof `--base 6516d743 --gel f701cbbb --repo . --draw 12 --seed 37` | 16 jugés : **12 F2P**, 4 refusés « green at base: a self-confirming test » (les quatre resserrements de la section 3.2, attendus) ; 67 inchangés ; 12 tueurs tirés, **12 tués**. Sortie `REFUSED` à cause des seuls resserrements. `RED-PROOF.json` sha256 `24eba1d27c76b95dec4ef8f592c603685a243f668d3681aa4df5a11fca32539e` |
| Premier passage (`--gel ade246c3 --draw 9`) | 12 F2P, 4 resserrements, 8 tués sur 9 : **`:178` mort-né** (section 3.2), ré-ancré en `f701cbbb` |
| tueurs tirés à la main au gel (fichier restauré, sha256 vérifié) | **8 sur 8 tués** par assertion, un test seul à chaque passage : les quatre resserrements (`:180` `GIT_CONFIG_PARAMETERS: undefined, ` ; `:180` `GIT_ENV({})` ; `:188` `"apps/site/app/fonts/*.ttf", ` ; `:188` `"out/*.png"` -> `"*.png"`), et `:206` (ttf), `:216` (gitlink), `:177` (git 2.39.5), `ci.yml:97` (`ci-gates`) |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` (tronc `e7f091b7`, tête `9744ead0`) | 71 tueurs, 71 ANCRE, 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration` 47, `ci-gates` 36, `oracle-run` 16, `dojo-render` 13, `export-public` 4) | 116/116 |
| `test/byte-guard.test.ts` | 16/16 |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| `npm run test:main` | tête `f701cbbb` : **2 472 tests, 2 450 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 (la fusion `9744ead0` qui suit ne touche que `docs/ETAT.md`) |
| Contrôle du lot sur le dépôt lui-même | `refusals` du tronc entier (ajouté sur un commit vide) : `[]`, 208 ms ; le lot passe son propre contrôle (`r25()` ci-dessous lève sinon) |

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite` : `STAT 176 insertions, 20 deletions, changed 196`, `CONTENT_STAT 0`, GREEN (mode `unproven`), mesuré à la tête `9744ead0` contre `e7f091b7`, **sous 547** (estimé au G0 : ≈ 245). `refusals` a tourné sur la plage du lot : aucun refus.

## 6. Relation exacte avec l oracle, désormais

- La CI refuse par `refusals` du module **de la PR** ; l oracle par `refusals` de **son propre** module, sur le clone, aux mêmes entrées (`base`, les deux pathspecs du `ci.yml` mesuré, `HEAD` du clone). L oracle refuse donc au moins ce que refuse la CI, et davantage si la PR a affaibli son module (N-3 de la G2 de #166 : rien de neuf, `ci.yml` et le module de la CI viennent de la PR).
- Sur un refus, l oracle garde `W` (lu comme avant, enregistré), rend le mode `refused` et rouge ; la CI ne lit aucun compte et est rouge.
- Hors refus, rien ne change : `W` de la CI = la première lecture de l oracle ; `W` de l oracle = le plus grand de ses deux lectures ; mode `integration` : `min(module, W)` des deux côtés, au-dessus de `W` rouge des deux côtés.
- `effective` (mode `integration`) ne refait pas le contrôle (Q-8) : le job s arrête à `pin`, avant `count`, et l oracle contrôle avant `integration()`.

## 7. Windows

Le contrôle lit des objets seulement (`diff --raw`, `check-attr`, `cat-file --batch`) : indifférent à `core.autocrlf`, à `core.symlinks`, à la casse de NTFS (`PIN` épingle `core.ignorecase=false`). Les fixtures sont posées par la plomberie : aucun lien du système de fichiers, aucun saut de plateforme. Le test du dépôt lui-même lit `--git-common-dir` en chemin absolu pour `alternates`, et marche depuis un worktree. Aucun faux `git` nouveau, ni `/proc`, ni FIFO ; chemins par `join`. Le seul saut de plateforme du fichier reste celui de #166 (faux `git` 2.39.5, nommé).

## 8. Résidus formés en items (règle PAROXYSME : une limite déclarée n est jamais une fin)

Portés par RECHERCHES, déclencheur « avant T0 », état dans `docs/ETAT.md` à la main de MONARK.

### 8.1 R25-ASSET-POLYGLOT-1 (Q-1)

**Résidu, dit tel quel** : un actif déclaré qui porte la vraie tête de son format, puis du code ou une archive, passe le nombre magique et compte 0. Mesures (G0 section 1.3 et ce G7) : `out/poly.png` (signature PNG, puis 300 lignes de shell, puis un NUL) : `bash out/poly.png` s exécute (`BASH-RAN 300`) ; `out/zip.png` (signature, puis une archive zip à `__main__.py`) : `python3 out/zip.png` s exécute ; et même un PNG **structurellement valide** (signature, `IHDR`, un morceau `tEXt` de 300 lignes de shell, `IDAT`, `IEND`, chaque CRC juste, rien après `IEND`, 3 410 octets) s exécute sous bash (`PNG-TEXT-RAN 300`, mesuré). Node refuse les cinq têtes (`SyntaxError`) ; bash refuse `ttf` et `ots` (NUL avant le premier LF). Ce qui reste visible : l appel d un actif comme du code est une ligne comptée et relue.

| Option | Ce qu elle ferme | Prix exact |
|---|---|---|
| (a) Validation de structure par format | l archive ajoutée en fin (rien après `IEND`, `ff d9` final, fin de table TrueType, un seul élément CBOR sans reste, opérations OTS jusqu à la fin) ; **pas** un PNG valide qui porte du shell dans `tEXt` (mesuré ci-dessus), ni un bloc deflate « stocké » dans `IDAT`, qui porte des octets bruts arbitraires dans un PNG valide (G2 R-3), ni l équivalent JPEG (segment `COM`) : **ne ferme pas l item** | module ≈ 90 lignes (PNG ≈ 15 avec une table CRC-32 de 6 lignes, `zlib.crc32` n étant pas garanti sous le Node du runner avant `setup-node` ; JPEG ≈ 12 ; TrueType ≈ 12 ; OTS ≈ 30, format à opérations récursives ; CBOR ≈ 20) ; tests ≈ 130 (un par format valide, un par polyglotte) ; fichiers : `scripts/lot-size-integration.mjs`, `.d.mts`, `test/r25-integration.test.ts`, ligne d ADR. `STAT=` et `ci.yml` : **inchangés** (même fonction `refusals`, même appel `pin`). Windows : sans effet (objets seuls). Risque : un actif légitime d un encodeur inhabituel refusé (à mesurer sur les 45) |
| (b) Liste fermée des blobs d actif admis (ids), dans le module | **selon le régime de l oracle, que MONARK fixe** (pli de la G2, R-3) : la CI exécute le module **de la PR**, qui peut ajouter l id de son propre polyglotte à la liste : en CI, (b) ne ferme rien. (i) Oracle exécuté depuis le **tronc** (ou une installation figée) : ferme l item, mais **tout** PR légitime qui ajoute ou complète un actif est rouge à l oracle tant que son id n est pas déjà au tronc : un PR de liste, fusionné, puis le PR d actif, à chaque fois (au tronc, 32 commits ont ajouté ou modifié un actif en deux semaines, dont 20 `.ots` complétés : de l ordre de 30 séquences liste-puis-actif par mois). (ii) Oracle exécuté depuis la **branche relue** (le régime de la section 5 de ce G7) : la liste est sous la main de l auteur, et (b) ne vaut que par la relecture du diff, exactement comme la ligne d appel d un polyglotte aujourd hui | module : `ASSET_BLOBS`, 45 ids SHA-1 (≈ 47 lignes) et 2 lignes dans `refusals` ; tests ≈ 30 ; fichiers : module, `.d.mts`, test, ligne d ADR. `STAT=` et `ci.yml` : **inchangés**. Coût d usage : en (i), la séquence liste-puis-actif ci-dessus ; en (ii), un id par actif, relu. Windows : ids identiques (extensions déclarées `binary`, aucune conversion de fin de ligne) |

Avis : (a) ne ferme pas (mesuré, et confirmé par la G2). (b) ne ferme qu avec un oracle exécuté depuis le tronc, au prix d une séquence liste-puis-actif à chaque actif ; avec l oracle exécuté depuis la branche, (b) ne vaut que la relecture du diff. **Question ouverte pour MONARK : le régime de l oracle** (section 10, Q-c). L item attend cette décision.

### 8.2 R25-MINIFIED-LINE-1 (Q-5)

**Résidu, dit tel quel** : le métrique de R-25 compte des fins de ligne `\n`. Du code sur une seule longue ligne compte 1 : `one.cjs`, 3 000 instructions sur une ligne, s exécute (`ONE-LINE-RAN`, mesuré). Le refus du CR seul et des séparateurs JS ne le touche pas. Un plafond de longueur de ligne n est pas tenable : 65 fichiers sous les pathspecs ont une ligne de plus de 1 000 octets (jusqu à 691 402, du JSON de données).

| Option | Prix exact |
|---|---|
| Plancher de compte par octets : par fichier changé sous un pathspec, compter `max(lignes, ceil(octets/80))` | le compte ne vient plus de `git diff --shortstat` seul : les lignes `STAT=` et `CONTENT_STAT=` **changent** (par exemple `STAT=$(node scripts/lot-size-integration.mjs stat …)` qui imprime une ligne de même forme), donc `R25_DIFF_RE` (module, oracle, `ci-gates`), le test 38 (4quater), `specsOf`, `boundsOf`, `run.mjs` (`R25_DIFF_RE` pour trouver la gate) et le contrôle M-42f′ changent avec : ≈ 6 fichiers de code, ≈ 60 lignes de module et d oracle, ≈ 150 lignes de tests, et une **ligne d ADR** (changement du métrique de D9). Effet mesuré au tronc : 327 fichiers sous les pathspecs ont `ceil(octets/80)` au-dessus de leurs lignes, 33 193 lignes de plus en tout ; les pires : `docs/biblio/procurements-M015/_raw/candle_15m_full.json` +8 642, `candle_1h_full.json` +8 514, `tradexyz_llms_full.txt` +1 120, des fixtures `apps/dojo/test/fixtures/history/*.json` +625 chacune. Tout lot qui touche l un d eux devient rouge : il faut un seuil (ne compter le plancher qu au-delà d un rapport octets/ligne, par exemple 400) ou exclure les données (`*.json` de fixtures), à mesurer. Le compte d un diff modifié (pas un ajout) doit lire les octets des lignes changées, pas du fichier. Windows : sans effet si le module lit des objets |
| Variante sans toucher au compte, **à liste inversée** (pli de la G2, R-4) : un refus (comme ce lot) de **tout** chemin texte sous les pathspecs dont une ligne (octets entre deux `0a`) dépasse un seuil, par exemple 2 000 octets, **sauf** une liste fermée d extensions de données que Node ne peut pas exécuter (`.json`, `.jsonl`, `.csv`) et une liste fermée de chemins exacts mesurés à la tête relue (au tronc : le seul `docs/biblio/procurements-M015/_raw/tradexyz_llms_full.txt`, 59 631 octets ; `.txt` est exécutable par `require`, il ne peut entrer que par chemin). Une liste d extensions de code serait ouverte par construction (`.mts`, `.cts`, `.jsx`, scripts sans extension, et Node charge toute extension inconnue en CommonJS) | `STAT=` et `ci.yml` inchangés ; module ≈ 12 lignes dans `refusals`, tests ≈ 30 ; une ligne d ADR (nouveau motif de refus). Mesuré au tronc (`e7f091b7`, 1 038 fichiers sous les pathspecs) : hors actifs binaires, **65** fichiers ont une ligne de plus de 1 000 octets et **37** de plus de 2 000 ; hors `.json`/`.jsonl`/`.csv`, 9 au-delà de 1 000 octets (dont 7 de code, au plus 1 795 octets) et **1 seul** au-delà de 2 000 (le `.txt` ci-dessus) : à 2 000 octets, la liste de chemins exacts compte une entrée, et aucun refus au tronc. Elle ferme aussi la famille de R-1 (un UTF-16 ou toute autre forme sans `0a` forme une seule longue ligne). Reste : du code découpé en lignes de 1 999 octets (un facteur 25 sur le compte, borné). Windows : sans effet (objets seuls) |

Avis : la variante par refus à liste inversée garde la forme des lignes `STAT=`, ne refuse rien au tronc, n a aucun coût d usage récurrent, et ferme une attaque **sans ligne d appel visible** (le code d une seule ligne s exécute lui-même) ; le plancher par octets reste le correctif du métrique, avec ligne d ADR.

## 9. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Addendum D9 terdecies**, à contrôler par MONARK au diff. Elle nomme les deux résidus et leurs items.

## 10. Questions ouvertes pour MONARK

- **Q-a (tueur de `info/attributes`)** : réponse de la G2 : « non tel quel ». Pli : le tueur `:177` (git < 2.40) est gardé **et** celui de `:178` (`if (infoAttributes(cwd)) throw`) est rétabli, par un troisième cas du test, `info/attributes` = `*.cjs -diff`, qui épargne les sondes d `attrTree` : seul `:178` l arrête. Ce cas court partout, `win32` compris (aucun faux `git`). Section 11.
- **Q-b (ordre des items)** : **inversé** (G2 R-4) : d abord R25-MINIFIED-LINE-1, variante par refus à liste inversée ; ensuite R25-ASSET-POLYGLOT-1, une fois Q-c tranchée.
- **Q-c (régime de l oracle, pour R25-ASSET-POLYGLOT-1)** : ouverte. Oracle depuis le tronc (l option (b) ferme, une séquence liste-puis-actif à chaque actif) ou depuis la branche relue ((b) ne vaut que la relecture du diff). Aucun défaut proposé : décision de MONARK.

## 11. Pli du G2

G2 : `/home/user/recherches/coordination/pieces/2026-10-04-G2-recherches/G2-r25-guards-2.md` (commit `d91a93f`), verdict **BLOQUANT** (B-1), levé, selon la G2, par le correctif d un argument et son test. Tronc `origin/lot/etude-suite` relu par la référence explicite : `e7f091b7` au début du pli, puis `75c6bc52` (journal et HANDOFF, deux fichiers de `docs/`), fusionné en `1f3afb2b` (commit de fusion, aucun conflit, aucun fichier du lot touché).

### 11.1 Points pliés

| Point | Ce qui change | Test (tueur) |
|---|---|---|
| **B-1** (un `.gitmodules` à `ignore = all` cache le gitlink) | `refusals` lit `diff --raw` sous `--ignore-submodules=none` (`scripts/lot-size-integration.mjs:213`). `-c diff.ignoreSubmodules=none` ne l emporte pas sur le `.gitmodules` ; l option de ligne de commande, si. L oracle appelle la même fonction : le même argument le couvre. Aucune autre lecture du lot ne liste d entrées (le compte `W` cache aussi le gitlink, 0 au lieu de 1, sans effet une fois le refus tenu). Phrase dans D9 terdecies | nouveau `r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore` : `vendor/subrepo` et un `.gitmodules` de 4 lignes (`ignore = all`), posés par plomberie : `pin` nomme `gitlink vendor/subrepo` et sort avec 2, job rouge, oracle `refused` rouge (base : `Changed` 4, vert, oracle `unproven` vert). Tueur `:213` `"--ignore-submodules=none", ` retiré |
| **R-1** (UTF-16 avec BOM : séparateurs U+2028 hors UTF-8) | un chemin texte dont le blob commence par `ff fe`, `fe ff`, `ff fe 00 00` ou `00 00 fe ff` est refusé `utf16-bom` (`:228`, même ligne). 0 au tronc (mesuré : 0 sur 1 038). Phrase dans D9 terdecies | nouveau `r25h_ci_refuses_a_utf16_or_utf32_bom` : quatre chemins, un par BOM, refusés (base : `Changed` 4, vert). Tueur `:228` `fffe|feff|0000feff` -> `0000feff` |
| **R-2** (Q-a) | rien dans le code | `r25a_ci_w_fails_closed_without_the_pinned_read` : troisième cas `info/attributes *.cjs` (`src/a.cjs`, 300 lignes, `*.cjs -diff`) : `pin` refuse, job rouge ; tueur `:178` rétabli (`if (infoAttributes(cwd)) throw` -> `if (false) throw` : `pin` rc 0, `Changed lines: 0`, vert), `:177` gardé. Les deux cas `info/attributes` courent sous `win32` |
| **R-3**, **R-4**, Q-b | G7 seulement : section 8 réécrite (prix de (b) selon le régime de l oracle, (a) ne ferme pas ; variante à liste inversée et ses mesures), section 10 (ordre inversé, Q-c ouverte) | sans objet |
| **N-2** (la cause de git perdue) | une ligne : le `catch` du module ajoute la dernière ligne non vide de `e.stderr` (`:263`). Mesuré : `--base "origin/"` écrit maintenant `(fatal: bad revision 'origin/...HEAD')` à la fin de la ligne d erreur | sans test (message) |
| **N-1** (un chemin à saut de ligne écrit des lignes arbitraires dans le journal) | **reporté**, dit tel quel : le job est rouge de toute façon ; la ligne de refus peut être coupée par un nom de chemin à `\n` et sa suite lue par le runner comme une commande de workflow. Correctif connu : nommer le chemin par `JSON.stringify` (ligne de refus du module et log de l oracle), à verser avec R25-MINIFIED-LINE-1 | sans objet |

Un point de méthode : le test de R-1 portait d abord un U+2028 **littéral** dans sa source ; le test du lot sur le dépôt lui-même (`r25h_every_trunk_asset_passes_its_magic`) l a nommé `line-separator test/r25-integration.test.ts`. Écrit en échappement (`\u2028`) avant le gel (commit `45041729`). Le contrôle se garde lui-même.

### 11.2 Vérifications du pli (Node 24.21.0, git 2.43.0, proxy retiré pour les tests)

Commits du pli : `18e5f5e5` (tests rouges B-1, R-1, R-2), `45041729` (U+2028 du test échappé), `5641df4e` (gel du pli : `:213`, `:228`, `:263`, D9 terdecies), `02903247` (fixtures BOM renommées : `le16`/`be16` lus comme des mots français par `lang:gate`, devenus `little16`/`big16`/`little32`/`big32`, encodage `ucs2`), `1f3afb2b` (fusion du tronc `75c6bc52`), puis ce G7.

| Vérification | Résultat |
|---|---|
| red-proof `--base 30dbd11a --gel 02903247 --repo . --draw 4 --seed 37` | 3 jugés : **2 F2P** (`r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore`, `r25h_ci_refuses_a_utf16_or_utf32_bom`), 1 refusé « green at base » (`r25a_ci_w_fails_closed_without_the_pinned_read`, le resserrement R-2 attendu) ; 46 inchangés ; 2 tueurs tirés, **2 tués**. `RED-PROOF.json` sha256 `cf6369e0fcb988f19b411fd877e8a29d1d7f165d4eec0604b43126fb26efb6fb`. (Même verdict au gel `5641df4e`, sha256 `79986bdea00a42433f14a8684e6eba5f61da5b5c82985975f63a756f2e159ed6`.) |
| tueurs tirés à la main au gel (un test seul, fichier restauré, sha256 vérifié) | **4 sur 4 tués** par assertion : `:178` (`if (false) throw` : le cas `*.cjs` lit `0 false 0`, soit `Changed lines: 0`, sans `::error::`, sortie 0), `:177` (`< 0`, par le cas git 2.39.5, sauté sous `win32` : sous `win32`, c est `:178` qui meurt), `:213` (`--ignore-submodules=none` retiré), `:228` (`0000feff` seul) |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` (tronc `75c6bc52`, tête `1f3afb2b`) | 74 tueurs, 74 ANCRE, 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration` 49, `ci-gates` 36, `oracle-run` 16, `dojo-render` 13, `export-public` 4) | 118/118 |
| `test/byte-guard.test.ts` ; `npm run test:export` | 16/16 ; vert (1/1) |
| workflow public dérivé | identique à celui du tronc (`75c6bc52`) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` ; `gate:vocab` ; `lang:gate` | 0 ; 0 ; 69/69 ; OK ; OK (après `02903247`) |
| `npm run test:main` (tête `02903247`, la fusion qui suit ne touche que `docs/`) | **2 474 tests, 2 452 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| R-25 (`r25()` contre `origin/lot/etude-suite`, `75c6bc52`, tête `1f3afb2b`) | `STAT 209 insertions, 27 deletions, changed 236`, `CONTENT_STAT 0`, GREEN, **sous 547** |
| Mesures du pli au tronc | 0 BOM UTF-16/32 sur 1 038 fichiers sous les pathspecs ; refus du dépôt lui-même : `[]` (test `r25h_every_trunk_asset_passes_its_magic`) |
