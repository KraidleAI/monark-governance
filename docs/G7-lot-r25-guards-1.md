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
| ce commit | G7, ligne d ADR D9 duodecies, tabulations du G0 remplacées (byte guard) |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.184-193 : `BINARY_ASSETS` (`cbor`, `jpg`, `ots`, `pdf`, `png`, `ttf`), `ATTRIBUTES` (`* diff` puis `*.<ext> !diff`), `attrTree(cwd)` (`hash-object -w --no-filters --stdin`, `mktree`) ; l.34 : `gitIn(cwd, raw, src = attrTree(cwd))` lit `--attr-source=${src}` ; l.180 : `pin` exporte `GIT_ATTR_SOURCE` = `attrTree(cwd)` ; commentaires l.30 et l.172 |
| `scripts/oracle/r25.mjs` | l.27 : première lecture de `W` sous `attrTree(clone)` (`EMPTY_TREE` retiré) ; l.48 : réponse `integration` au-dessus de `W` : mode `above-written`, `W` gardé, `red: true` ; l.35 : `red` en tient compte ; en-tête l.10 |
| `.github/workflows/ci.yml` | l.123-127 (job r25 seul) : une ligne de commentaire, le plafond `[ "$NEW_CHANGED" -le "$CHANGED" ] && [ "$NEW_CONTENT" -le "$CONTENT_CHANGED" ] \|\| { echo '::error::Gate R-25: integration count above the written count. Fail-closed.'; exit 1 }` ; commentaire l.90-92 réécrit sur place |

L arbre d attributs a l id `c37f07346ae83e5a741cf9bcba3c717bd7de3e14` (SHA-1, mêmes octets à chaque appel). Les lignes `STAT=` et `CONTENT_STAT=` ne changent pas : `R25_DIFF_RE`, `specsOf`, `boundsOf`, `run.mjs`, le test 38 et M-42f′ lisent la même forme. Workflow public dérivé : **identique** à celui du tronc (`derivePublicWorkflow` des deux `ci.yml`, égalité stricte, mesurée ; aucune occurrence de `r25`, `R25` ni `R-25`).

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
- Mode `integration` : `min(module, W)` des deux côtés, et une réponse au-dessus de `W` est rouge des deux côtés (job : `::error::`, sortie 1 ; oracle : `above-written`, rouge).

## 7. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Addendum D9 duodecies** (lettre libre après `undecies`, aucune occurrence antérieure dans `docs/adr`), à contrôler par MONARK au diff.

## 8. Questions ouvertes pour MONARK

- **Q-1** (seconde lecture de l oracle) : gardée, comme demandé. Elle ne diffère plus de la première que sur un binaire déclaré forcé en texte par un attribut mesuré. La retirer donnerait l égalité stricte CI = oracle (avis de la G2 de #162) ; alors `oracle_r25_w_is_never_below_the_ci_read` change de sens. Défaut : gardée, lot à part si MONARK le veut.
- **Q-2** (liste `BINARY_ASSETS`) : `cbor`, `jpg`, `ots`, `pdf`, `png`, `ttf`, fermée dans le module (`GATE_FILES`). `jpg` y est parce qu un `.jpg` est dans le dépôt, bien que le `.gitattributes` ne le déclare pas `binary`. Résidu nommé : un fichier binaire (NUL) portant une de ces six extensions compte 0, comme au tronc ; un fichier texte qui les porte compte ses lignes.
- **Q-3** (gitlinks) : hors lot. Un sous-module ajouté compte 1 ligne (`Subproject commit …`, mesuré) ; son code vit dans un autre dépôt, non tiré par `actions/checkout`. À former en item (refus d un mode `160000` sous les deux pathspecs) si MONARK le juge utile.
- **Q-4** (ce que le plafond ne ferme pas) : le plafond de R25-COUNT-CAP-1 rend rouge une réponse au-dessus de `W` ; il ne voit pas un module modifié qui imprime `integration 0 0` (sous `W`), puisque `ci.yml` vient lui aussi de la PR. Ce cas reste aux gardes de D9 nonies : le module propre de l oracle (octets identiques, sinon `gate-files`), `GATE_FILES`, et le contrôle par diff de MONARK.
- **Q-5** (écriture d objets) : `attrTree` écrit deux objets inertes (un blob, un arbre) dans le dépôt mesuré : runner, clone de l oracle, dépôts de test. Échec d écriture : `pin` refuse (job rouge), `effective` rend `W`.
