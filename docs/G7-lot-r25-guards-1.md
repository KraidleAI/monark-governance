# G7 - lot R25-GUARDS-1 (deux gardes de R-25 : un contenu binaire compte ses lignes ; le job plafonne lui-même le compte d intégration)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-guards-1`, depuis le tronc `lot/etude-suite` à `f35ec9b1` ; tronc fusionné à `ae24dded` (#165, L2 P1-c5-bis-c), commit de fusion, aucun rebase. Aucune PR ouverte (à la main de MONARK).
- **Plan** : G0 `docs/G0-lot-r25-guards-1.md` (commit `11019d00`). Items fermés côté code : **R25-NUL-BINARY-1** (O-a) et **R25-COUNT-CAP-1** (O-b) de `docs/ETAT.md` (G7 `docs/G7-lot-r25-attr-source-1.md`, section 9.2). L état des items dans `ETAT.md` reste à la main de MONARK.
- **Intention tenue** : (1) un contenu que git juge binaire compte ses lignes sous les deux pathspecs, partout où un compte est lu (job, module, oracle), sauf la liste fermée des binaires que le dépôt contient ; (2) le job refuse lui-même une réponse `integration` au-dessus du compte écrit, et l oracle de même.

## 1. Commits

| Commit | Rôle |
|---|---|
| `11019d00` | G0 |
| `a5d9a3af` | tests rouges (sept nouveaux, deux ajustés, tueurs ré-ancrés) |
| `0aa8cfa0` | gel |
| `e5325596` | fusion du tronc `ae24dded` (#165), aucun conflit, aucun fichier du lot touché par le tronc |
| `5c15f565` | G7, ligne d ADR D9 duodecies, tabulations du G0 remplacées (byte guard) |
| `fad7e0e1` | pli du G2 : tests rouges (quatre nouveaux, trois ajustés), section 9 |
| `27f91b97` | pli du G2 : gel (`BINARY_ASSETS` par répertoire, `core.ignorecase=false` dans `PIN`, contrôle positif de l arbre) |
| ce commit | pli du G2 : G7 (section 9 et retouches), ligne d ADR D9 duodecies mise à jour |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.184-193 : `BINARY_ASSETS` (`cbor`, `jpg`, `ots`, `pdf`, `png`, `ttf`), `ATTRIBUTES` (`* diff` puis `*.<ext> !diff`), `attrTree(cwd)` (`hash-object -w --no-filters --stdin`, `mktree`) ; l.34 : `gitIn(cwd, raw, src = attrTree(cwd))` lit `--attr-source=${src}` ; l.180 : `pin` exporte `GIT_ATTR_SOURCE` = `attrTree(cwd)` ; commentaires l.30 et l.172 |
| `scripts/oracle/r25.mjs` | l.27 : première lecture de `W` sous `attrTree(clone)` (`EMPTY_TREE` retiré) ; l.48 : réponse `integration` au-dessus de `W` : mode `above-written`, `W` gardé, `red: true` ; l.35 : `red` en tient compte ; en-tête l.10 |
| `.github/workflows/ci.yml` | l.123-127 (job r25 seul) : une ligne de commentaire, le plafond `[ "$NEW_CHANGED" -le "$CHANGED" ] && [ "$NEW_CONTENT" -le "$CONTENT_CHANGED" ] \|\| { echo '::error::Gate R-25: integration count above the written count. Fail-closed.'; exit 1 }` ; commentaire l.90-92 réécrit sur place |

L arbre d attributs avait l id `c37f07346ae83e5a741cf9bcba3c717bd7de3e14` au gel ; après le pli du G2 (section 9), il a l id `2336999e05d634b0d4c084c82db609f08edb0089` (SHA-1, mêmes octets à chaque appel, identique sous `core.autocrlf` `false`, `true` et `input` avec `core.eol=crlf` : `hash-object --no-filters`, mesuré). Les lignes `STAT=` et `CONTENT_STAT=` ne changent pas : `R25_DIFF_RE`, `specsOf`, `boundsOf`, `run.mjs`, le test 38 et M-42f′ lisent la même forme. Workflow public dérivé : **identique** à celui du tronc (`derivePublicWorkflow` des deux `ci.yml`, égalité stricte, mesurée ; aucune occurrence de `r25`, `R25` ni `R-25`).

## 3. Tests et tueurs

| Test | Gel | Base `11019d00` | Tueur |
|---|---|---|---|
| `r25g_ci_w_counts_a_nul_first_line_under_both_pathspecs` (bloc `run:` réel) | `Changed` 3 001, `Content` 3 001, sortie 1 | 0, 0, vert | `lot-size-integration.mjs:189 CONST "`* diff\\n${" -> "`${"` |
| `r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection` | `f.ttf` 0 + `run.png` 300 + `f.woff2` 41 = 341 | 300 | `lot-size-integration.mjs:188 CONST "\"ttf\"]" -> "]"` |
| `r25g_integration_counts_a_nul_first_line` (`effective`) | `integration` 3 001 et 11 | 0 et 0 | `lot-size-integration.mjs:34 CONST "src = attrTree(cwd)" -> "src = EMPTY_TREE"` |
| `oracle_r25_w_counts_a_nul_first_line` | 3 001 et 11, rouge | 0 et 0, vert | `oracle/r25.mjs:27 CONST "${attrTree(clone)}" -> "4b825dc6…"` |
| `r25g_ci_refuses_an_integration_code_count_above_w` | aucun compte, `::error::` nommé, sortie 1 | `Changed lines: 4`, vert | `ci.yml:124` moitié CODE retirée |
| `r25g_ci_refuses_an_integration_content_count_above_w` | idem | `Content changed lines: 1`, vert | `ci.yml:124` moitié CONTENT retirée |
| `oracle_r25_is_red_on_an_integration_count_above_w` | `above-written`, `[3, 0]`, rouge | `integration`, vert | `oracle/r25.mjs:48 CONST "if (n.some(…)) return" -> "if (false) return"` |
| `r25a_ci_w_reads_under_the_module_pin` (ajusté : `GIT_ATTR_SOURCE` attendu = `c37f0734…`) | vert | arbre vide : rouge | inchangé (`:180` `GIT_CONFIG_PARAMETERS`) |
| `oracle_r25_w_is_never_below_the_ci_read` (ajusté : `.dat` -> `.ttf`, seul cas où les deux lectures de l oracle diffèrent encore) | vert | vert : **resserrement** | `oracle/r25.mjs:27 CONST ", []]" -> "]"`, tiré à la main |

Les deux tests du plafond en CI remplacent, dans le clone, la ligne d impression de `count` du module par une réponse `integration` au-dessus de `W` (`raising`) ; le test de l oracle copie `r25.mjs` et ce module dans un dossier jetable (même disposition `scripts/oracle/`), et le clone en porte les mêmes octets. Windows : aucun faux `git`, ni `/proc`, ni FIFO, ni casse d extension (`core.ignorecase`) ; chemins par `join` ; aucun saut de plateforme.

## 4. Vérifications (worktree `/home/user/monark-governance-r25g`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| red-proof `--base 11019d00 --gel 0aa8cfa0 --repo . --draw 8 --seed 37` | 9 jugés : **8 F2P**, 1 refusé (`oracle_r25_w_is_never_below_the_ci_read`, « green at base: a self-confirming test » : le resserrement attendu) ; 74 inchangés ; 8 tueurs tirés, **8 tués**. Sortie `REFUSED` à cause du seul resserrement. `RED-PROOF.json` sha256 `aa8471f686dd770e5247d673f650f64c21cc84de31e7e030d72841ccea5d9892` |
| tueurs tirés à la main au gel (fichier restauré octet pour octet) | 7 sur 7 tués par assertion : le resserrement (`r25.mjs:27` `, []]`), et les six ré-ancrés : `r25.mjs:27` (`[--attr-source=${attrTree(clone)}], `), `lot-size-integration.mjs:34` (`--attr-source=${src}`), `r25.mjs:49` (`Math.min`), `lot-size-integration.mjs:180` (`GIT_ATTR_SOURCE: attrTree(cwd), `), `ci.yml:203` (`ci-gates`), `ci.yml:265` (`dojo-render`) |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` (tronc `ae24dded`) | 83 tueurs, 83 ANCRE, 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration` 34, `ci-gates` 36, `oracle-run` 16, `dojo-render` 13, `export-public` 4) | 103/103 |
| `npm run test:export` | vert (1/1) |
| `npm run test:main` | voir section 4.1 |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |

### 4.1 `test:main`

- Premier passage (tête `e5325596` + docs du G7 non commités) : 2 459 tests, 2 436 verts, **1 rouge**, 22 sautés : `byte_guard_tracked_tree_is_clean`, deux tabulations dans le G0 (l.12-13, sorties `--numstat` recopiées). Corrigées dans ce commit (espaces) ; `test/byte-guard.test.ts` 16/16.
- Second passage, après la correction : **2 459 tests, 2 437 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0.

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite` (`ae24dded`, après fusion) : `STAT 136 insertions, 24 deletions, changed 160`, `CONTENT_STAT 0`, GREEN, **sous 547**. (Même compte contre `f35ec9b1` avant la fusion : le tronc ne touche aucun fichier du lot.) Mesure faite sous l arbre d attributs du lot : le lot n ajoute aucun binaire.

## 6. Relation exacte avec l oracle, désormais

- `W` de la CI = la lecture sous `attrTree` + `PIN` + `GIT_ENV` = la première des deux lectures de l oracle (`r25.mjs:27`), aux mêmes options et au même arbre d attributs.
- `W` de l oracle = le plus grand de cette lecture et de la lecture aux attributs mesurés : **≥** `W` de la CI ; égal sauf quand un attribut mesuré force le texte (`diff`) sur un binaire **déclaré** (`*.ttf diff` sur un `.ttf` binaire : la CI 0, l oracle ses lignes). Aucun vert nouveau.
- Depuis le pli du G2 (R-3, section 9.1), la relation « l oracle n est jamais sous la CI » vaut aussi dans un clone en `core.ignorecase=true` (Windows) : `PIN` épingle `core.ignorecase=false` pour les deux lectures.
- Mode `integration` : `min(module, W)` des deux côtés, et une réponse au-dessus de `W` est rouge des deux côtés (job : `::error::`, sortie 1 ; oracle : `above-written`, rouge).

## 7. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Addendum D9 duodecies** (lettre libre après `undecies`, aucune occurrence antérieure dans `docs/adr`), à contrôler par MONARK au diff.

## 8. Questions ouvertes pour MONARK

- **Q-1** (seconde lecture de l oracle) : gardée, comme demandé. Elle ne diffère plus de la première que sur un binaire déclaré forcé en texte par un attribut mesuré. La retirer donnerait l égalité stricte CI = oracle (avis de la G2 de #162) ; alors `oracle_r25_w_is_never_below_the_ci_read` change de sens. Défaut : gardée, lot à part si MONARK le veut.
- **Q-2** (liste `BINARY_ASSETS`) : depuis le pli du G2 (R-1), neuf couples (répertoire, extension) mesurés au tronc, fermés dans le module (`GATE_FILES`), écrits `<rép>/*.<ext> !diff` (section 9.1). `jpg` y est parce qu un `.jpg` est dans `out/`, bien que le `.gitattributes` ne le déclare pas `binary` ; `pdf` en est sorti, aucun `.pdf` n étant au tronc. **Résidu, dit tel quel** : un fichier à octet NUL portant une extension déclarée, **dans un répertoire autorisé** (par exemple `out/tool.png`), compte 0, même s il porte du code exécutable : Node charge une extension inconnue comme du CommonJS (`require("./out/tool.png")`), et bash exécute un fichier dont le NUL n est pas en première ligne (mesures du G2). Hors de ces répertoires, le même fichier compte ses lignes. Un fichier texte d extension déclarée compte ses lignes partout. Item formé pour le reste : **R25-ASSET-DIR-MAGIC-1** (section 9.3).
- **Q-3** (gitlinks) : hors lot. Un sous-module ajouté compte 1 ligne (`Subproject commit …`, mesuré) ; son code vit dans un autre dépôt, non tiré par `actions/checkout`. Item formé au pli du G2 : **R25-GITLINK-SYMLINK-1** (section 9.3), avec les liens symboliques (N-8 du G2).
- **Q-4** (ce que le plafond ne ferme pas) : le plafond de R25-COUNT-CAP-1 rend rouge une réponse au-dessus de `W` ; il ne voit pas un module modifié qui imprime `integration 0 0` (sous `W`), puisque `ci.yml` vient lui aussi de la PR. Ce cas reste aux gardes de D9 nonies : le module propre de l oracle (octets identiques, sinon `gate-files`), `GATE_FILES`, et le contrôle par diff de MONARK.
  - **`W` vient lui aussi du module de la PR** (N-3 du G2, rien de neuf) : le job lance `node scripts/lot-size-integration.mjs pin` depuis le checkout de la PR. Une PR qui modifie `scripts/lot-size-integration.mjs` (`ATTRIBUTES`, `BINARY_ASSETS`, `PIN`) peut donc abaisser son propre `W` en CI, même sans rien d intégration, et `GATE_FILES` ne joue qu en mode `integration`. Seuls l oracle (son propre module, son propre `attrTree(clone)`) et le contrôle par diff le voient. Ce n est pas neuf : `ci.yml` vient déjà de la PR.
- **Q-5** (écriture d objets) : `attrTree` écrit deux objets inertes (un blob, un arbre) dans le dépôt mesuré : runner, clone de l oracle, dépôts de test. Échec d écriture : `pin` refuse (job rouge), `effective` rend `W`.

## 9. Pli du G2

G2 : `/home/user/recherches/coordination/pieces/2026-10-04-G2-recherches/G2-r25-guards-1.md`, verdict **APPROUVÉ AVEC RÉSERVES**, aucun bloquant. Décisions de cellule reçues de MONARK ; ce qui suit les applique. Les lignes `STAT=` et `CONTENT_STAT=` ne changent pas d un octet, `ci.yml` n est pas touché (permissions du job inchangées, workflow public dérivé identique).

### 9.1 Points pliés

| Point | Ce qui change | Test (tueur) |
|---|---|---|
| **R-3** (casse d extension sous Windows) | `PIN` gagne `"-c", "core.ignorecase=false"` (neuvième paire de `GIT_CONFIG_COUNT` dans `pin`) : un clone NTFS (`core.ignorecase=true`) ne fait plus correspondre `out/RUN.PNG` à `out/*.png`. Sans effet sur un diff arbre à arbre ni sur `--remerge-diff` | nouveau `r25g_upper_case_extension_counts_under_core_ignorecase` : clone en `core.ignorecase=true`, `out/RUN.PNG` (`// <NUL>` puis 300 lignes) : le job et l oracle lisent 301 (base : 0 et 0). Tueur `lot-size-integration.mjs:33` (l entrée retirée de `PIN`). Ajustés : `r25a_ci_w_reads_under_the_module_pin` (liste des options, id `2336999e…`) et `r25a_pin_prints_exactly_the_pinned_names` (neuf paires) |
| **R-1** (code exécutable sous une extension déclarée) | `BINARY_ASSETS` passe de six extensions à neuf couples (répertoire, extension), mesurés au tronc (section 9.2) ; `ATTRIBUTES` écrit `<rép>/*.<ext> !diff`. Motif le plus étroit : les 45 binaires sont tous des enfants directs de leur répertoire ; `*` ne traverse pas `/`, et un motif à `/` est ancré à la racine (`test/fixtures/*.ots` ne vise pas `apps/sentinel/test/fixtures/`) | nouveau `r25g_ci_w_counts_code_named_as_an_asset_outside_the_asset_directories` : `src/tool.png` à NUL compte 301, `out/real.png` (NUL puis 50 lignes) compte 0 : `W` 301 (base : 0). Tueur `:188` `"out/*.png"` -> `"*.png"`. Ajustés (resserrements, verts à la base) : `r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection` (la police passe dans `apps/site/app/fonts/`, tueur `:188` `"apps/site/app/fonts/*.ttf", ` retiré) et `oracle_r25_w_is_never_below_the_ci_read` (`apps/site/app/fonts/blob.ttf`) |
| **N-1** (id d arbre absent : aucun attribut, en silence) | `attrTree` vérifie, après `mktree`, `git check-attr diff` sous `PIN`, `GIT_ENV` et `GIT_ATTR_SOURCE=<id>` sur deux chemins sondes : `probe.mjs` doit lire `set`, `apps/site/app/fonts/probe.ttf` doit lire `unspecified` (`!diff` rend l attribut non spécifié, N-9 du G2 ; ce n est pas `unset`). Sinon `attrTree` lève : `pin` sort non nul (le job prend son `::error::` existant), `effective` rend le mode `error` (`W`), `r25()` de l oracle lève (`run.mjs` écrit `RED`). Un seul contrôle couvre les trois lectures : `--attr-source` de git pose `GIT_ATTR_SOURCE` lui-même | nouveau `r25g_attribute_tree_must_be_in_force` : un module dont `mktree` rend un id absent (`111…1`) : job sans compte et rouge, module `error 9 9`, oracle qui lève (base : `W` 0, `unproven 9 9`, oracle sans erreur). Tueur `:196` `if (read !== PROBES) throw` -> `if (false) throw` |
| **N-2** (contenu de `BINARY_ASSETS` épinglé par un hash seulement) | rien dans le code | nouveau `r25g_binary_assets_are_the_measured_list` : égalité exacte de `BINARY_ASSETS` et d `ATTRIBUTES`. Tueur `:188` `"fixtures/*.cbor", ` retiré |
| **N-3** | écrit sous Q-4 (section 8) | sans objet |

### 9.2 Liste (répertoire, extension) mesurée

Mesure : `git --attr-source=<arbre vide> diff --numstat <arbre vide> origin/lot/etude-suite` (tronc `ae24dded`), lignes `-` : 45 fichiers, les mêmes qu au G0 section 1. Sous le nouvel arbre (`2336999e…`), les 45 restent à `-`, et `check-attr diff` rend `unspecified` pour `out/x.png`, `set` pour `src/x.png` et pour `OUT/x.png`.

| Répertoire | Extension | Fichiers |
|---|---|---|
| `apps/site/app/fonts` | `ttf` | 5 |
| `apps/site/public/bell/anchors` | `ots` | 17 |
| `docs/bell-publications` | `ots` | 1 |
| `docs/course-bell` | `ots` | 16 |
| `docs/dojo-publications` | `ots` | 1 |
| `fixtures` | `cbor` | 1 |
| `out` | `jpg` | 1 |
| `out` | `png` | 1 |
| `test/fixtures` | `ots` | 2 |

Huit répertoires, neuf couples, comme le G2 l a compté. Un binaire nouveau hors de ces couples (un sous-répertoire, un répertoire neuf, une extension neuve) compte ses lignes jusqu à l ajout de son couple, qui est un changement du module : le sens sûr.

### 9.3 Points reportés (items formés, portés par RECHERCHES, déclencheur « avant T0 », état dans `docs/ETAT.md` à la main de MONARK)

- **R25-ASSET-DIR-MAGIC-1** (reste de R-1) : dans un répertoire autorisé, un fichier à NUL d extension déclarée compte 0, même s il porte du code (section 8, Q-2). Proposé : sous les deux pathspecs, refuser (fail-closed) un chemin d un couple autorisé, changé, dont les premiers octets ne sont pas le nombre magique du format (`\x89PNG`, `\xFF\xD8`, `\0\1\0\0` ou `OTTO` pour `ttf`, l en-tête OpenTimestamps pour `ots`, la forme CBOR attendue pour `cbor`) : un `--numstat -z` et une lecture de blob, dans le module et dans `pin`.
- **R25-CR-ONLY-LINES-1** (R-2) : le métrique de R-25 compte des `\n`. Un `src/cr.cjs` de 3 001 instructions séparées par `\r` seul compte 1 ligne, et `node src/cr.cjs` s exécute (mesures du G2). C est une limite du métrique de ligne, de la même famille que le code minifié sur une ligne, indépendante des attributs ; le lot ne l aggrave pas. Pistes du G2 : compter `\r` isolé comme une fin de ligne, ou un plancher `ceil(octets/80)` au-delà d un rapport octets/ligne.
- **R25-GITLINK-SYMLINK-1** (Q-3, N-8 du G2) : refuser sous les deux pathspecs un mode `160000` (gitlink, 1 ligne aujourd hui), et décider des liens symboliques (`120000`, 1 ligne, leur cible), dont la cible peut sortir du pathspec.

### 9.4 Vérifications du pli (Node 24.21.0, git 2.43.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| tronc | `origin/lot/etude-suite` toujours à `ae24dded` (déjà fusionné) : aucune fusion nouvelle |
| tests du lot (`r25-integration` 38, `ci-gates`, `oracle-run`, `dojo-render`, `export-public`) | 107/107 |
| red-proof `--base 5c15f565 --gel 27f91b97 --repo . --draw 7 --seed 37` | 8 jugés : **6 F2P**, 2 refusés « green at base » (les deux resserrements de R-1, attendus) ; 30 inchangés ; 6 tueurs tirés (tous ceux des tests admis), **6 tués**. `RED-PROOF.json` sha256 `7a4293de0fc212c45ac76193140ee2accd28f09783e3fed66e90b546a6baf1a9` |
| tueurs tirés à la main au gel (fichier restauré, sha256 vérifié) | 9 sur 9 tués par assertion : les deux resserrements (`:188` `"apps/site/app/fonts/*.ttf", ` ; `oracle/r25.mjs:27` `, []]`), les cinq tueurs des tests nouveaux ou ajustés, et `:189` (`* diff`, T-1) et `:180` (`GIT_CONFIG_PARAMETERS`, `GIT_ENV({})`), dont les lignes n ont pas bougé |
| Windows | aucun faux `git`, ni `/proc`, ni FIFO ; chemins par `join` ; le test R-3 pose `core.ignorecase=true` dans le clone et tourne pareil sous Linux et Windows ; l id de l arbre ne dépend pas d `autocrlf` (`hash-object --no-filters`, mesuré sous trois réglages) |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` | 87 tueurs, 87 ANCRE, 0 DERIVE, 0 PERDU |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` ; `gate:vocab` ; `lang:gate` | 0 ; 0 ; 69/69 ; OK ; OK |
| `npm run test:main` (gel `27f91b97` et docs du pli) | **2 463 tests, 2 441 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| R-25 (`r25()` contre `origin/lot/etude-suite`, `ae24dded`) | `STAT 200 insertions, 28 deletions, changed 228`, `CONTENT_STAT 0`, GREEN, **sous 547** |

## 10. Après la PR #166

- **CodeQL, alerte 46** (`js/incomplete-sanitization`, `scripts/lot-size-integration.mjs:190`) : le chemin de la sonde passe de `.replace("*", "probe")` à `.replaceAll("*", "probe")`. Chaque motif n a qu une `*`, la sonde reste `apps/site/app/fonts/probe.ttf`. Commit `1cc52781`, CI 10 sur 10.
- **Rejeu Windows de MONARK** (`890960d`) : `r25g_ci_w_counts_a_nul_first_line_under_both_pathspecs` échouait. Sa fixture `apps/site/app/docs/nul.ts` porte un nom de périphérique réservé sous Windows (`NUL`, quelle que soit l extension) : le fichier n existe jamais, et `git add` échoue. Elle devient `apps/site/app/docs/nul-first.ts` ; la ligne 74 du G0 la nomme encore `nul.ts`. Aucune autre fixture du lot ne porte de nom réservé (`nul`, `con`, `prn`, `aux`, `com1` à `com9`, `lpt1` à `lpt9`). Le test et son tueur ne changent pas de ligne.
