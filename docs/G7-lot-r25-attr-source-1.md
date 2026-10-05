# G7 - lot R25-ATTR-SOURCE-1 (le `W` de la CI lu sous la lecture épinglée du module : O-1 fermé côté CI)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-attr-source-1`, depuis la tête de 1b `76cd1a9a` ; tronc `lot/etude-suite` fusionné à `023801ec` (#155 et #153), commit de fusion, aucun rebase. Aucune PR ouverte (à la main de MONARK).
- **G2 pliée** : `G2-r25-attr-source-1.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, aucun bloquant, trois mineurs m-1 à m-3, deux observations O-a et O-b, avis sur Q-1 à Q-3. Pli : section 9. Tronc fusionné à nouveau à `171d6b2f`.
- **Plan** : G0 `docs/G0-lot-r25-attr-source-1.md` (commit `240b0904`). Contexte : G7 `docs/G7-lot-r25-integration-rule-1.md`, sections 8 (O-1, m-h), 12 et 13.4.
- **Intention tenue** : les deux comptes `W` du job `r25-taille-de-lot` sont lus sous le `PIN`, le `GIT_ENV` du module et les attributs de l arbre vide. Une seule source : `scripts/lot-size-integration.mjs`.

## 1. Commits

| Commit | Rôle |
|---|---|
| `240b0904` | G0 |
| `0b736d3e` | tests rouges (quatre) |
| `5ac483ed` | fusion du tronc `023801ec` (#155 1b, #153 L2-P1-C5), aucun conflit, aucun fichier du lot touché par le tronc |
| `ad1baff9` | gel |
| `e1f4b1aa` | G7 et ligne d ADR D9 undecies |
| `96f77186` | tests du pli de la G2 (m-1, m-2), resserrements : verts au gel, tueurs tirés à la main |
| `ab93ac77` | fusion du tronc `171d6b2f` (#156, #159, docs), commit de fusion ; seul fichier commun : `test/ci-gates.test.ts`, fusion automatique sans conflit |
| ce commit | G7 : pli de la G2 (section 9) |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.34 : `GIT_ENV = (base = process.env) => …` (même ligne ; `GIT_ENV({})` rend les seules surcharges) ; l.170-183 : `pinShell(cwd)` ; l.204 : commande `pin` ; commentaire l.31 |
| `.github/workflows/ci.yml` | l.90-97, juste avant `STAT=` : trois lignes de commentaire, `R25_PIN=$(node scripts/lot-size-integration.mjs pin) || { ::error:: ; exit 1 }`, `eval "$R25_PIN"`. Les lignes `STAT=` et `CONTENT_STAT=` ne changent pas |
| `scripts/oracle/r25.mjs` | commentaire d en-tête l.10 seulement (la lecture à l arbre vide est désormais celle de la CI) |
| `test/ci-gates.test.ts`, `test/dojo-render.test.ts` | tueurs `ci.yml` ré-ancrés de +8 (`:106` -> `:114` ×2, `:113` -> `:121`, `:190` -> `:198` ; `dojo-render` `:252` -> `:260`) |

Sortie de `pin` (sur cette machine) : `unset GIT_DIFF_OPTS`, `export LC_ALL='C'`, `export GIT_ATTR_NOSYSTEM='1'`, `unset GIT_CONFIG_PARAMETERS`, `export GIT_ATTR_SOURCE='4b825dc6…'`, `export GIT_CONFIG_COUNT='8'` et les huit paires `GIT_CONFIG_KEY_n` / `GIT_CONFIG_VALUE_n` du `PIN` (dont `core.attributesFile` vide et `core.bigFileThreshold=512m`). Refus (sortie 2, rien sur la sortie standard, le job rouge) : git < 2.40, `$GIT_DIR/info/attributes` non vide, toute erreur.

**Ce qui ne change pas** : `R25_DIFF_RE` (module, oracle, test 38), `specsOf`, `boundsOf`, `run.mjs`, le test 38 (4quater) et le contrôle M-42f′ lisent les mêmes lignes ; aucun de ces tests n est modifié. Le workflow public dérivé est **identique** à celui du tronc `023801ec` (mesuré : `derivePublicWorkflow` des deux `ci.yml`, égalité stricte ; 0 occurrence de `r25`, ni `R25_PIN` ni `eval`).

## 3. Tests et tueurs

| Test | Gel | Base `76cd1a9a` (mesuré) | Tueur |
|---|---|---|---|
| `r25a_ci_w_counts_the_real_lines_under_measured_attributes` | `* -diff`, `* binary`, `*.x diff=foo` (pilote de machine `textconv = head -1`, `binary = true`), `* -text`, `* text eol=crlf` : 3 001 et rouge, chacun | 0 vert, 0 vert, 1 vert, 3 001, 3 001 : rouge par assertion | `scripts/lot-size-integration.mjs:180 CONST "GIT_ATTR_SOURCE: EMPTY_TREE, " -> ""` |
| `r25a_ci_w_fails_closed_without_the_pinned_read` | `$GIT_DIR/info/attributes` `* -diff`, puis `git` factice `2.39.5` : aucun compte, `::error::Gate R-25: pinned git read not obtained`, sortie 1 | 0 vert ; 3 000 rouge sans le message | `scripts/lot-size-integration.mjs:178 CONST "if (infoAttributes(cwd)) throw" -> "if (false) throw"` |
| `r25a_ci_w_reads_under_the_module_pin` | reproducteur m-g côté CI (`GIT_CONFIG_PARAMETERS` `diff.renames=copies`) : 3 002 ; sous la sortie de `pin`, exactement les huit options du `PIN` en portée `command`, `LC_ALL=C`, `GIT_ATTR_NOSYSTEM=1`, `GIT_ATTR_SOURCE` = arbre vide, `GIT_DIFF_OPTS` absent | 2 | `scripts/lot-size-integration.mjs:180 CONST "GIT_CONFIG_PARAMETERS: undefined, " -> ""` |
| `ci_r25_counts_read_under_the_module_pin` (`ci-gates`) | `pin`, son repli, `eval`, puis `STAT=`, contigus ; aucun appel git du job avant ; un seul `eval` ; `R25_PIN` posé une fois | lignes absentes | `.github/workflows/ci.yml:97 CONST "eval \"$R25_PIN\"" -> "true"` |

Les trois premiers lancent **le bloc `run:` réel** du job sous bash (`ciBlock`), sans payload : le compte reste `W`. Le témoin `-text` / `eol` est vert à la base comme au gel : un diff entre deux arbres ne convertit pas les fins de ligne (mesuré au G0) ; il reste dans le test pour qu une régression qui le ferait compter moins rougisse.

## 4. Vérifications (gel `ad1baff9`, worktree `/home/user/monark-governance-r25a`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| red-proof `--base 76cd1a9a --gel ad1baff9 --draw 4 --seed 37` | **OK** : 27 jugés (les 4 du lot et les 23 de #153 entrés par la fusion du tronc), tous F2P ; 88 inchangés ; 4 tueurs tirés, 4 tués. `RED-PROOF.json` sha256 `8c63fca242ca514045d158d41d871aa8bdd1b09bb462e193a6b89a7fb7ff0b5a` |
| red-proof `--base 023801ec --gel ad1baff9 --draw 4 --seed 37` (le lot seul) | **OK** : 4 jugés, F2P ; 67 inchangés ; les 4 tueurs du lot tirés, 4 tués. sha256 `1f47592879af48ca3c34547b637145a474b2a12cf38bd222551d815bb4d9030d` |
| tueurs `ci.yml` ré-ancrés, à la main | 6 sur 6 tués (`:114` ×2, `:121`, `:198`, `:48`, `dojo-render` `:260`) |
| ancres `verifie-ancres.mjs . --touched 76cd1a9a HEAD` | 115 tueurs, 115 ANCRE, 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration`, `ci-gates`, `oracle-run`, `dojo-render`) | 87/87 |
| `npm run test:export` (job `g3-export`) | vert (1/1) |
| `gate:vocab && typecheck && test:main` (job `g3-verification`) | vert : 2 373 tests, 2 351 verts, 0 rouge, 22 sautés |
| `npm test` complet (ADR D9 undecies dans l arbre) | **2 374 tests, 2 352 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `lang:gate` ; `export:check` | OK ; OK |

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` sur le `ci.yml` du gel :

- **contre `023801ec`** (le tronc, la mesure de la CI pour la future PR) : `STAT 110 insertions, 10 deletions, changed 120`, `CONTENT_STAT 0`, GREEN, sous 547 ;
- contre `76cd1a9a` (base demandée) : 663 (628 + / 35 −), GREEN sous 1 205, mais **au-dessus de 547** : la fusion du tronc y ajoute les 543 lignes de #153 (`scripts/l2/**`, `scripts/record-binance-l2.*`, `test/l2-*.test.ts`), qui ne sont pas du lot. Le lot seul est 120 dans les deux cas (le tronc ne touche aucun fichier du lot).

## 6. Relation exacte avec l oracle, désormais

- `W` de la CI = la lecture à l arbre vide sous `PIN` et `GIT_ENV` = la première des deux lectures de `W` de l oracle (`scripts/oracle/r25.mjs:27`).
- `W` de l oracle = le plus grand de cette lecture et de la lecture aux attributs mesurés : **≥** `W` de la CI, égal sauf quand un attribut mesuré force le texte (`diff`) sur un contenu binaire (reproducteur de m-h : la CI compte 0, comme le contenu sans l attribut au tronc ; l oracle 3 001). Aucun vert nouveau.
- En mode `integration`, le compte est `min(module, W)` des deux côtés, avec le même module : l oracle n est jamais sous la CI.

## 7. Ligne d ADR (versée dans `docs/adr/ADR-M003-phase2-integration.md`, à contrôler par MONARK au diff)

Lettre libre après `decies` : `undecies` (aucune `D9 undecies` dans `docs/adr`).

> **Addendum D9 undecies — 2026-10-05 (fermeture d O-1 côté CI : le `W` du job lu sous la lecture épinglée du module ; lot R25-ATTR-SOURCE-1, formé par MONARK le 2026-10-05 après 1b ; règle inchangée)** : les deux comptes `W` du job `r25-taille-de-lot` (lignes `STAT=` et `CONTENT_STAT=`, inchangées d un octet, lues comme avant par `R25_DIFF_RE` et le test 38) sont lus sous la même lecture que le module et l oracle. Le job évalue d abord la sortie de la commande `pin` de `scripts/lot-size-integration.mjs`, construite depuis `PIN` et `GIT_ENV` du module, sans liste recopiée : les options épinglées en portée commande (`GIT_CONFIG_COUNT` ; `GIT_CONFIG_PARAMETERS`, lu après lui, retiré), `LC_ALL=C`, `GIT_ATTR_NOSYSTEM=1`, sans `GIT_DIFF_OPTS`, et `GIT_ATTR_SOURCE` = l arbre vide. Un `.gitattributes` de l arbre mesuré (`-diff`, `binary`, pilote `diff=` déclaré binaire) n abaisse plus `W` : 3 000 lignes sous `* -diff` comptaient 0 au tronc, elles comptent 3 001. Sans lecture épinglée (git antérieur à 2.40, `$GIT_DIR/info/attributes` non vide, erreur du module), le job est rouge (fail-closed). Le `W` de l oracle reste le plus grand de sa lecture à l arbre vide, désormais celle du job, et de sa lecture aux attributs mesurés : jamais sous celui du job. Ni la borne, ni les pathspecs, ni D9 nonies ne changent ; le job reste interne (`derivePublicWorkflow` le retire, le workflow public dérivé est identique). Tests : `r25a_ci_w_counts_the_real_lines_under_measured_attributes`, `r25a_ci_w_fails_closed_without_the_pinned_read`, `r25a_ci_w_reads_under_the_module_pin` (bloc `run:` réel du job sous bash) et `ci_r25_counts_read_under_the_module_pin`. `error_origin` : interne (trou préexistant au tronc, observation O-1 de la G2 delta du lot R25-INTEGRATION-RULE-1). **Livré par** : lot R25-ATTR-SOURCE-1 (G0 `docs/G0-lot-r25-attr-source-1.md`, G7 `docs/G7-lot-r25-attr-source-1.md`).

## 8. Questions ouvertes pour MONARK

- **Q-1** (G0) : une lecture en CI (défaut) ou le plus grand des deux comme l oracle ; ou retirer la seconde lecture de l oracle pour l égalité stricte. **Avis de la G2** : une lecture, d accord avec le défaut ; garder le maximum côté oracle pour l instant (gratuit, jamais sous la CI), puis le retirer quand O-a sera traité, pour une égalité stricte CI = oracle, plus simple à auditer.
- **Q-2** (G0) : `eval` d une sortie du module de l arbre mesuré. Même confiance que `count` et `ci.yml` (`GATE_FILES`, garde de l oracle, contrôle par diff). Défaut : accepté. **Avis de la G2** : accepté ; même confiance que `count` (déjà capable de rendre vert, voir O-b) et que `ci.yml` sous `pull_request` ; quoting mesuré étanche ; m-1 et m-2 pliés pour que cette étanchéité soit gardée par un test.
- **Q-3** (G0) : un `info/attributes` non vide sur le runner rendrait toute PR rouge. Défaut : accepté (fail-closed). **Avis de la G2** : accepté ; `actions/checkout` n en écrit pas, un fichier vide passe, la cause est imprimée sur stderr ; rouge pour toute PR est visible tout de suite, jamais un vert silencieux.
- **O-a** et **O-b** : items proposés à MONARK, section 9.2.
- **Rejeu Windows** : `pin` n est appelé que par le job (Linux) ; l oracle Windows (git 2.55.0) ne l exécute pas. Le rejeu des tests du lot y lance `bash` et un `git` factice en script `sh` (T-2) : à vérifier par MONARK, un saut de plateforme pourrait être nécessaire.

## 9. Pli de la G2 (`G2-r25-attr-source-1.md`, APPROUVE SOUS RÉSERVE)

### 9.1 Mineurs

| Point | Devenu | Test | Tueur (tiré à la main au gel, et par red-proof contre `171d6b2f`) |
|---|---|---|---|
| **m-1** sortie de `pin` non épinglée en entier (mutant `GIT_ENV({})` -> `GIT_ENV()` survivant : tout l environnement du runner, `R25_READ_TOKEN` compris, imprimé puis réexporté) | **plié** : la liste exacte et ordonnée des noms imprimés est épinglée ; chaque ligne est un `unset` ou un `export` de l un d eux ; le jeton n apparaît pas. Test à part de T-3, pour garder un tueur par test | `r25a_pin_prints_exactly_the_pinned_names` (environnement avec `R25_READ_TOKEN` et une variable de runner) | `scripts/lot-size-integration.mjs:180 CONST "GIT_ENV({})" -> "GIT_ENV()"` : **tué** (assertion) |
| **m-2** quoting non testé contre une valeur hostile | **plié** : le reproducteur de la G2 à l identique (une entrée `PIN` `x.y=` avec `'`, `"`, `$( )`, apostrophe inverse, saut de ligne, `'\''`, `${IFS}*? !!`), sortie de `pinShell` évaluée sous `bash -e`, relue par `git config --get x.y` à l octet, aucun fichier créé | `r25a_pin_quotes_any_value` | `scripts/lot-size-integration.mjs:181 CONST "x.replaceAll(\"'\", \"'\\\\''\")" -> "x"` : **tué** (assertion) |
| **m-3** git du runner non mesuré (lot mesuré sous 2.43) | **noté** : `GIT_ATTR_SOURCE` existe depuis 2.40, et un arbre source introuvable donne « aucun attribut » (mesuré par la G2), donc sens sûr. Le premier run réel de la PR vaut preuve : MONARK y lit `Changed lines: 142` (`R-25 mode: written` ou `unproven`). C est le compte de `r25()` contre le tronc `171d6b2f`, et le même que la lecture épinglée faite ici (`eval "$(node scripts/lot-size-integration.mjs pin)"` puis la ligne `STAT=` : 131 + / 11 −). Le 120 de la G2 était mesuré avant m-1 et m-2 (+22) | - | - |

Ces deux tests sont des resserrements : verts au gel dès leur commit (`96f77186`), sans changement de code, donc sans gel nouveau. Contre le tronc `171d6b2f`, qui n a pas `pin`, ils sont F2P (sortie vide : assertion).

### 9.2 Items proposés à MONARK (hors de ce lot)

- **R25-NUL-BINARY-1 (O-a)**, devenu le principal contournement restant de `W` maintenant qu O-1 est fermé. Mesuré par la G2 : un `code.mjs` exécutable de 3 002 lignes dont la première est `// <NUL>` s exécute et compte **0** (`Bin 0 -> 72829 bytes`), avant comme après le lot (détection binaire de git, sans attribut). Les sous-modules (gitlink) sont à traiter dans le même item. Pistes : compter un fichier binaire changé sous le pathspec CODE comme ses lignes (lecture `--numstat --text`), ou le refuser hors d une liste d extensions binaires déclarées. Le retrait de la seconde lecture de l oracle (Q-1) suivrait.
- **R25-COUNT-CAP-1 (O-b)** : le bash du job ne borne pas la sortie de `count` par `W`. Il accepte `integration/<n>/<m>` pour tout `n`, `m` numériques, et seul le module applique `min(…, W)`. Un module modifié par la PR peut donc imprimer `integration 0 0`. Un `[ "$NEW_CHANGED" -le "$CHANGED" ]` en bash (et de même pour CONTENT) rendrait le job robuste à ce cas. Coût : le test 38 / le test de câblage et la forme lue par l oracle. Hors de ce lot.

### 9.3 Vérifications du pli (tête `ab93ac77` + ce commit de docs ; Node 24.21.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| red-proof `--base 171d6b2f --gel ab93ac77 --draw 6 --seed 37` | **OK** : 6 jugés, tous F2P ; 67 inchangés ; les 6 tueurs du lot tirés, 6 tués. `RED-PROOF.json` sha256 `1fbb240c55636bfc27a0f941d935ebeb806117fa523085fd2a3eac779961521f` |
| tueurs m-1 et m-2, à la main au commit `96f77186` | 2 sur 2 tués, par assertion ; fichier restauré (`cmp`) |
| ancres `--touched 76cd1a9a HEAD` ; `--touched 171d6b2f HEAD` | 143/143 ANCRE ; 73/73 ANCRE ; 0 DERIVE, 0 PERDU |
| tests du lot (`r25-integration`, `ci-gates`, `oracle-run`, `dojo-render`) | 89/89 |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` | 0 ; 0 |
| R-25, `r25()` contre `171d6b2f` | `STAT 131 insertions, 11 deletions, changed 142`, `CONTENT_STAT 0`, GREEN, sous 547 |

## 10. Rejeu Windows de MONARK (2026-10-05) : un cas sauté, nommé

Au rejeu Windows de `3fda80bb` (75/76), `r25a_ci_w_fails_closed_without_the_pinned_read` rendait `git 2.39.5: 3000 false 1`. La cause est dans le test : le faux `git` est un script `sh` sans extension, placé sur un `PATH` joint par `:`. `execFileSync` ne le lance jamais sous win32 (`PATHEXT`, séparateur `;`), et c est le vrai git, 2.55, qui répond.

Le cas « git 2.39.5 » est donc sauté sous win32 seul, avec sa raison écrite dans le test. Le cas `info/attributes` tourne partout. Sous Linux, les deux cas restent jugés (27/27) et le tueur `:178` est inchangé.
