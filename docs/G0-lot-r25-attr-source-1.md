# G0 - lot R25-ATTR-SOURCE-1 (le `W` de la CI lu sous la lecture épinglée du module : O-1 fermé côté CI)

- **Mission** : lot formé par MONARK après 1b (G7 `docs/G7-lot-r25-integration-rule-1.md`, section 13.4 : « O-1 devient le lot à part R25-ATTR-SOURCE-1, à RECHERCHES, après 1b »). Contexte : G7 sections 8 (O-1, m-h), 11, 12 et 13 ; G2 `G2-r25-integration-rule-1-delta.md` (O-1), `…-delta2.md` (B-6, O-1), `…-delta3.md` (m-f, m-g, m-h, section 3 « une source de vérité »).
- **Branche** : `recherches/r25-attr-source-1`, depuis la tête de 1b `76cd1a9a5840e3ceefa1524eb834f35135175179` (PR #155, en voie de fusion dans le tronc `lot/etude-suite`). Quand #155 fusionne, le tronc est fusionné dans le lot par un commit de fusion (aucun rebase).
- **Statut** : G0 seul. Aucun code, aucun test dans ce commit.
- **Intention (une)** : les deux comptes `W` du job `r25-taille-de-lot` (lignes `STAT=` et `CONTENT_STAT=`) sont lus sous **la même lecture épinglée** que le module et l oracle : le `PIN` et le `GIT_ENV` exportés par `scripts/lot-size-integration.mjs`, et les attributs de l arbre vide. Un `.gitattributes` de l arbre mesuré n abaisse plus `W`. Une seule source : le module.

## 1. Existant mesuré (base `76cd1a9a`)

- **Le trou (O-1, préexistant au tronc)** : `W` est la sortie de `git diff --shortstat "origin/${{ github.base_ref }}...HEAD" -- <pathspecs>` (`.github/workflows/ci.yml:82` et `:86`), lancée par bash sans option. Git lit les attributs du `.gitattributes` de l arbre extrait, c est-à-dire de la PR elle-même. Le module (1a) lit déjà les attributs de l arbre vide (pli delta 2, B-6), mais il rend au plus `W` : il ne relève pas un `W` abaissé. L oracle (1b) lit `W` sous le `PIN` et le `GIT_ENV` du module, comme le plus grand de deux lectures (arbre vide, arbre mesuré) : il est fermé.
- **Mesure, bloc `run:` réel du job sous bash, PR qui ajoute `.gitattributes` et `src/big.x` (3 000 lignes), sans preuve** (le compte reste `W`) :

| `.gitattributes` de la PR | `W` à la base | `W` attendu |
|---|---|---|
| `* -diff` | **0** (vert) | 3 001 |
| `* binary` | **0** (vert) | 3 001 |
| `*.x diff=foo`, avec un pilote `diff.foo` de machine (`textconv = head -1`, `binary = true`) | **1** (vert) | 3 001 |
| `* -text` | 3 001 | 3 001 |
| `* text eol=crlf` | 3 001 | 3 001 |

- **Lecture** : seuls l attribut `diff` (unset par `-diff` ou la macro `binary`) et un pilote `diff=<nom>` déclaré `binary` abaissent `--shortstat`. Un `textconv` seul ne change pas `--shortstat` (mesuré : 3 001 avec `textconv = head -1` ou `true`). `-text`, `eol` et `merge=` ne changent rien à un diff entre deux arbres : la conversion de fin de ligne s applique à l extraction et à l ajout, pas aux blobs comparés ; `merge=` ne sert qu à une fusion (le module l ignore déjà, B-6). Ils restent dans le test comme témoins.
- **`GIT_ATTR_SOURCE`** : git 2.43 (cette machine) l honore comme `--attr-source` (`* -diff` : 0 sans, 3 001 avec ; mesuré). Les deux viennent de git 2.40.
- **Précédence de la configuration de commande** (mesuré, git 2.43) : `GIT_CONFIG_PARAMETERS` (ce que pose `git -c`) est lu **après** `GIT_CONFIG_COUNT` et l emporte : avec `GIT_CONFIG_PARAMETERS="'diff.renames'='copies'"` et `GIT_CONFIG_KEY_0=diff.renames`, `GIT_CONFIG_VALUE_0=true`, git lit `copies`. Une clé de valeur vide (`core.attributesFile=`) passe par `GIT_CONFIG_VALUE_n=""` (portée `command`, valeur vide).
- **Ce qui lit la forme des lignes de compte** : `R25_DIFF_RE` (module l.21, oracle `r25.mjs:17`, `test/ci-gates.test.ts:97`, égalité épinglée par `oracle-run` et `r25i_ci_block_and_oracle_agree`), `specsOf` et `boundsOf` du module, `run.mjs:131` (repère la porte r25), le test 38 (4quater : exactement deux lignes `git diff`, STAT puis CONTENT_STAT, pathspecs exacts, métriques, gardes, ordre des impressions). Le contrôle M-42f′ (`test/export-public.test.ts:455-463`) et le test 42 lisent le job r25 **entier** comme bloc retiré par `derivePublicWorkflow` (`scripts/export-public.mjs:430`) : ce qui est dans le corps du job ne passe pas dans le workflow public dérivé.

## 2. Conception

### 2.1 Une commande `pin` du module, évaluée par le job avant ses deux comptes

Le module gagne une fonction `pinShell(cwd)` et une commande `node scripts/lot-size-integration.mjs pin`. Elle imprime des lignes de shell, construites **depuis** `PIN` et `GIT_ENV` (aucune liste recopiée) :

- `PIN` en configuration de portée commande : `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_n`, `GIT_CONFIG_VALUE_n`, une paire par `-c` ; `unset GIT_CONFIG_PARAMETERS`, sinon il passerait devant (mesure ci-dessus) ;
- `GIT_ENV` : ses surcharges, lues par `GIT_ENV({})` (la fonction prend désormais sa base en paramètre, `process.env` par défaut, même ligne) : `unset GIT_DIFF_OPTS`, `LC_ALL=C`, `GIT_ATTR_NOSYSTEM=1` ;
- `GIT_ATTR_SOURCE` = l arbre vide, l équivalent de `--attr-source` du module.

Refus (sortie 2, rien sur la sortie standard) : git antérieur à 2.40 (`GIT_ATTR_SOURCE` y serait ignoré en silence), un `$GIT_DIR/info/attributes` non vide (que `GIT_ATTR_SOURCE` ne remplace pas, delta 3 m-f), toute erreur.

Dans le job, juste avant la ligne `STAT=` :

```bash
R25_PIN=$(node scripts/lot-size-integration.mjs pin) || {
  echo '::error::Gate R-25: pinned git read not obtained. Fail-closed.'
  exit 1
}
eval "$R25_PIN"
```

Les deux lignes de compte **ne changent pas d un octet** : `R25_DIFF_RE`, `specsOf`, `boundsOf`, `run.mjs`, le test 38 et l oracle les lisent comme avant. Le reste de l étape (commandes `proof` et `count`) hérite du même environnement ; le module y passe déjà les mêmes valeurs par `-c` et `--attr-source`.

### 2.2 Pourquoi pas une lecture de `W` dans le module

Remplacer les deux lignes bash par une commande `written` du module aurait été plus direct, mais aurait changé la forme que lisent `R25_DIFF_RE`, le test 38 (4quater), `specsOf`, `boundsOf` et `run.mjs`, et sorti les pathspecs de `ci.yml`. `pin` laisse cette forme intacte et ne fait que fixer l environnement dans lequel bash lance git. Question Q-2.

### 2.3 Relation exacte avec l oracle après le lot

- `W` de la CI = la lecture de l arbre vide, sous `PIN` et `GIT_ENV` : la **première** des deux lectures de l oracle (`scripts/oracle/r25.mjs:27`), aux mêmes options.
- `W` de l oracle = le plus grand de cette lecture et de la lecture aux attributs mesurés. Il reste donc **≥** `W` de la CI. Les deux sont égaux, sauf quand un attribut mesuré **force** le texte (`diff`) sur un contenu que git juge binaire (le reproducteur de m-h : `*.dat diff`, `src/blob.dat` = NUL puis 3 000 lignes) : la CI compte alors 0 (comme le contenu seul, sans la ligne `diff`, au tronc), l oracle 3 001. Ce cas n ouvre aucun vert que le contenu seul n aurait pas donné. L oracle n est pas modifié, hors son commentaire d en-tête (la phrase « la lecture du job » y devient fausse). Question Q-1.

## 3. Fichiers touchés

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | `GIT_ENV(base = process.env)` (même ligne) ; `pinShell(cwd)` ; commande `pin` ; commentaire l.31 |
| `.github/workflows/ci.yml` | 8 lignes dans le job r25, avant `STAT=` (3 de commentaire) |
| `scripts/oracle/r25.mjs` | commentaire d en-tête (l.10) seulement |
| `test/r25-integration.test.ts` | trois tests (section 5) |
| `test/ci-gates.test.ts` | un test de câblage ; tueurs `ci.yml` ré-ancrés (+8) |
| `test/dojo-render.test.ts` | tueur `ci.yml` ré-ancré (+8) |
| `docs/adr/ADR-M003-phase2-integration.md` | ligne datée D9 undecies (comme 1b a versé D9 nonies et decies) |

Le workflow public dérivé ne change pas : le job r25 est retiré entier, et aucune ligne hors de ce job ne change (aucun `r25` ajouté hors du job ; test 42 et 42(f′) verts).

## 4. Menaces

| # | Menace | Réponse | Test |
|---|---|---|---|
| O-1 | `.gitattributes` de la PR : `-diff`, `binary`, pilote `diff=` binaire | `GIT_ATTR_SOURCE` = arbre vide pour les deux comptes | T-1 |
| O-1′ | `-text`, `eol`, `merge=` | sans effet sur un diff entre arbres (mesuré) ; témoins | T-1 |
| m-f (CI) | `$GIT_DIR/info/attributes` non vide sur le runner | `pin` refuse ; le job est rouge, aucun compte lu | T-2 |
| m-e (CI) | git < 2.40 : `GIT_ATTR_SOURCE` ignoré en silence | `pin` refuse ; rouge | T-2 |
| m-g (CI) | configuration de commande de l environnement (`GIT_CONFIG_PARAMETERS`) | retirée ; `PIN` en portée commande | T-3 |
| câblage | `eval` retiré, déplacé, ou `pin` sans repli | test de câblage statique | T-4 |
| A-12 | une PR modifie le module ou `ci.yml` (sa propre gate) | inchangé : la garde `gate-files`, la porte r25 de l oracle (son propre module) et le contrôle MONARK par diff. Le lot n ouvre pas de classe nouvelle : `ci.yml` était déjà mesuré par l arbre de la PR | - |

## 5. Tests rouges d abord, puis tueurs

Les trois premiers exécutent **le bloc `run:` réel** du job (`ciBlock` de `test/r25-integration.test.ts`) sous bash, sur un dépôt jetable, sans preuve (pas de payload : mode `written`, le compte imprimé est `W`). Format des tueurs fermé, un par test ; numéros de ligne au gel.

| # | Test | Attendu au gel | À la base |
|---|---|---|---|
| T-1 | `r25a_ci_w_counts_the_real_lines_under_measured_attributes` | 3 001 et rouge pour `* -diff`, `* binary`, `*.x diff=foo` (pilote de machine `textconv` + `binary`), `* -text`, `* text eol=crlf` | 0, 0, 1 (verts) : rouge par assertion |
| T-2 | `r25a_ci_w_fails_closed_without_the_pinned_read` | `$GIT_DIR/info/attributes` `* -diff`, puis un `git` factice `2.39.5` sur le `PATH` : aucun `Changed lines`, `::error::Gate R-25: pinned git read not obtained`, sortie 1 | 0 vert ; 3 000 sans le message : rouge par assertion |
| T-3 | `r25a_ci_w_reads_under_the_module_pin` | reproducteur m-g (copie de 3 000 lignes, `GIT_CONFIG_PARAMETERS` `diff.renames=copies`) : 3 002 ; sous la sortie de `pin` évaluée, chaque option du `PIN` lue en portée `command`, rien d autre, et `LC_ALL=C`, `GIT_ATTR_NOSYSTEM=1`, `GIT_ATTR_SOURCE` = arbre vide, `GIT_DIFF_OPTS` absent | 2 : rouge par assertion |
| T-4 | `ci_r25_counts_read_under_the_module_pin` (`test/ci-gates.test.ts`) | les lignes `pin`, son repli `::error::` + `exit 1`, `eval "$R25_PIN"`, puis la ligne `STAT=` ; aucun appel git du job avant ; un seul `eval` dans le workflow ; `R25_PIN` posé une fois | absentes : rouge par assertion |

Tueurs prévus : T-1 `GIT_ATTR_SOURCE: EMPTY_TREE, ` -> `` ; T-2 `if (infoAttributes(cwd)) throw` -> `if (false) throw` ; T-3 `GIT_CONFIG_PARAMETERS: undefined, ` -> `` ; T-4 `ci.yml` `eval "$R25_PIN"` -> `true`. Les tests existants ne changent pas, hors les lignes de tueur ré-ancrées (`ci-gates` `ci.yml:106` ×2, `:113`, `:190` ; `dojo-render` `ci.yml:252`).

## 6. R-25 du lot

Prévu : module ≈ 20, `ci.yml` 8, oracle 1 à 2, tests ≈ 90, ré-ancrages 5 : **≈ 125** (borne du lot 547). Les docs sont hors pathspec. Mesure au gel par `r25()` de `scripts/oracle/r25.mjs` contre `76cd1a9a`.

## 7. Ligne d ADR

Projet de ligne datée **ADR-M003 D9 undecies** (lettre libre après `decies`, aucune occurrence de `D9 undecies` dans `docs/adr`), au G7, versée dans `docs/adr/ADR-M003-phase2-integration.md` comme 1b l a fait pour D9 nonies et decies ; contrôle par MONARK au diff.

## 8. Questions pour MONARK (avec mes défauts)

- **Q-1 (une lecture ou deux en CI)** : la CI lit la seule lecture de l arbre vide ; l oracle garde le plus grand des deux (≥ CI). **Défaut : une lecture.** La seconde ne sert qu à compter plus que le contenu (un `diff` mesuré sur un binaire), jamais à abaisser ; l ajouter en CI demanderait deux lignes `git diff` de plus, contre le test 38 (4quater). Alternative : retirer la seconde lecture de l oracle pour l égalité stricte (le test de m-h change alors).
- **Q-2 (`eval` d une sortie du module)** : la CI exécute du shell imprimé par le module de l arbre mesuré. C est la même confiance que le module lui-même (déjà exécuté par `count`) et que `ci.yml`, tous deux dans `GATE_FILES`. **Défaut : accepté**, avec le repli fail-closed et le test de câblage.
- **Q-3 (`info/attributes` du runner)** : non vide, le job serait rouge pour toute PR. **Défaut : accepté** (fail-closed ; `actions/checkout` n en écrit pas).
- **O-a (hors lot, noté)** : un fichier dont le contenu commence par un octet NUL compte 0 ligne, à la base comme après le lot (détection binaire de git, sans attribut). C est hors O-1 ; à former en item si MONARK le juge utile (par exemple un compte des fichiers binaires changés sous le pathspec CODE).
