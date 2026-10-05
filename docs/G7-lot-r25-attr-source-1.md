# G7 - lot R25-ATTR-SOURCE-1 (le `W` de la CI lu sous la lecture épinglée du module : O-1 fermé côté CI)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-attr-source-1`, depuis la tête de 1b `76cd1a9a` ; tronc `lot/etude-suite` fusionné à `023801ec` (#155 et #153), commit de fusion, aucun rebase. Aucune PR ouverte (à la main de MONARK).
- **Plan** : G0 `docs/G0-lot-r25-attr-source-1.md` (commit `240b0904`). Contexte : G7 `docs/G7-lot-r25-integration-rule-1.md`, sections 8 (O-1, m-h), 12 et 13.4.
- **Intention tenue** : les deux comptes `W` du job `r25-taille-de-lot` sont lus sous le `PIN`, le `GIT_ENV` du module et les attributs de l arbre vide. Une seule source : `scripts/lot-size-integration.mjs`.

## 1. Commits

| Commit | Rôle |
|---|---|
| `240b0904` | G0 |
| `0b736d3e` | tests rouges (quatre) |
| `5ac483ed` | fusion du tronc `023801ec` (#155 1b, #153 L2-P1-C5), aucun conflit, aucun fichier du lot touché par le tronc |
| `ad1baff9` | gel |
| ce commit | G7 et ligne d ADR D9 undecies |

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

- **Q-1** (G0) : une lecture en CI (défaut) ou le plus grand des deux comme l oracle ; ou retirer la seconde lecture de l oracle pour l égalité stricte.
- **Q-2** (G0) : `eval` d une sortie du module de l arbre mesuré. Même confiance que `count` et `ci.yml` (`GATE_FILES`, garde de l oracle, contrôle par diff). Défaut : accepté.
- **Q-3** (G0) : un `info/attributes` non vide sur le runner rendrait toute PR rouge. Défaut : accepté (fail-closed).
- **O-a** (hors lot) : un fichier qui commence par un octet NUL compte 0 ligne, avant comme après le lot (détection binaire de git, sans attribut). À former en item si MONARK le juge utile.
- **Rejeu Windows** : `pin` n est appelé que par le job (Linux) ; l oracle Windows (git 2.55.0) ne l exécute pas. Le rejeu des tests du lot y lance `bash` et un `git` factice en script `sh` (T-2) : à vérifier par MONARK, un saut de plateforme pourrait être nécessaire.
