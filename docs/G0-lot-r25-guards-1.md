# G0 - lot R25-GUARDS-1 (deux gardes de R-25 : un contenu binaire compte ses lignes ; le job plafonne lui-même le compte d intégration)

- **Mission** : lot formé par MONARK, fermant deux items de `docs/ETAT.md` portés par RECHERCHES, déclencheur « avant T0 » :
  - **R25-NUL-BINARY-1** (O-a de la G2 de R25-ATTR-SOURCE-1, `docs/G7-lot-r25-attr-source-1.md` section 9.2) ;
  - **R25-COUNT-CAP-1** (O-b de la même G2).
- **Branche** : `recherches/r25-guards-1`, depuis le tronc `origin/lot/etude-suite` à `f35ec9b1` (fusion de #157, après #162). Aucun rebase ; une avance du tronc entre par un commit de fusion.
- **Statut** : G0 seul. Aucun code, aucun test dans ce commit.
- **Contexte lu** : ETAT l.515-519 ; G7 R25-ATTR-SOURCE-1 section 9 (O-a, O-b) et section 8 (Q-1) ; ADR-M003 D9 nonies, decies, undecies ; `scripts/oracle/r25.mjs` ; `scripts/lot-size-integration.mjs` ; le job `r25-taille-de-lot` de `.github/workflows/ci.yml` ; `test/r25-integration.test.ts`.

## 1. Existant mesuré (tronc `f35ec9b1`, git 2.43.0)

- **O-a** : git juge un contenu binaire dès qu un octet NUL paraît dans ses 8 000 premiers octets (`buffer_is_binary`), sans attribut. `git diff --shortstat` compte alors 0 ligne pour ce fichier. Sous la lecture épinglée de R25-ATTR-SOURCE-1 (`GIT_ATTR_SOURCE` = arbre vide), rien ne force le texte : un `src/code.mjs` exécutable de 3 001 lignes dont la première est `// <NUL>` compte **0**, sous le pathspec CODE comme sous CONTENT (mesuré, `--numstat` : `- - code.mjs`). Même trou dans le module (`gitIn`, `--attr-source` = arbre vide : un commit non prouvé d un tel fichier compte 0 en mode `integration`) et dans l oracle (ses deux lectures de `W` rendent 0, faute d attribut mesuré).
- **Mesure de la piste** : sous un arbre d attributs `* diff`, le même fichier compte 3 001 lignes (`--numstat` : `3001 0 code.mjs`), et un `--attr-source` vers cet arbre comme `GIT_ATTR_SOURCE` le lisent pareil. L attribut `diff` posé force le texte (pilote `diff=true`, `binary = 0`), même au-delà de `core.bigFileThreshold`.
- **Binaires réels du tronc** : 45 fichiers jugés binaires par git (`--numstat` contre l arbre vide), d extensions `ots` (37), `ttf` (5), `cbor`, `jpg`, `png` (1 chacune). Le `.gitattributes` du dépôt déclare `binary` : `png`, `pdf`, `cbor`, `ots`, `ttf` (pas `jpg`). Compter leurs « lignes » (octets `\n`) rendrait rouge tout lot qui ajoute une police : il faut une liste d exceptions.
- **Sous-modules** : un gitlink ajouté sous CODE compte 1 ligne (`Subproject commit …`, mesuré) ; son contenu vit dans un autre dépôt, que `actions/checkout` ne tire pas. Hors des deux items (question Q-3).
- **O-b** : le bash du job (`ci.yml:114-123`) accepte `integration/<n>/<m>` pour tout `n`, `m` numériques de moins de 10 chiffres ; seul le module applique `min(…, W)`. Un module qui rend plus que `W` n est vu par personne (le compte retenu monte : jamais un vert, mais un état que le job ne vérifie pas).
- **Ce que le plafond ne ferme pas** (à dire tel quel) : un module modifié par la PR qui imprime `integration 0 0` reste sous `W` ; aucun test en bash ne le voit, puisque `ci.yml` est lui aussi lu de la PR (`pull_request`). Ce cas reste couvert par la garde de l oracle (son propre module, octets identiques, G2 B-3), par `GATE_FILES` et par le contrôle par diff de MONARK (A-12), comme avant.

## 2. Constructions

### 2.1 R25-NUL-BINARY-1 : un arbre d attributs « tout texte, sauf les binaires déclarés »

Le module gagne `attrTree(cwd)`, `ATTRIBUTES` et `BINARY_ASSETS` (liste fermée : `cbor`, `jpg`, `ots`, `pdf`, `png`, `ttf`, les binaires que le dépôt contient). `attrTree` écrit dans le magasin d objets de `cwd` un blob `.gitattributes` :

```
* diff
*.cbor !diff
*.jpg !diff
…
```

puis l arbre qui le porte (`git hash-object -w --no-filters --stdin`, `git mktree` : deux objets, mêmes octets à chaque appel, id stable), et rend son id. Cet arbre remplace l arbre vide partout où un compte est lu :

- **job** : `pin` exporte `GIT_ATTR_SOURCE` = `attrTree(cwd)` au lieu de l arbre vide ; les lignes `STAT=` et `CONTENT_STAT=` ne changent pas d un octet (`R25_DIFF_RE`, test 38, `specsOf`, `boundsOf`, `run.mjs` intacts) ;
- **module** : `gitIn(cwd)` lit `--attr-source=<attrTree(cwd)>` (toutes ses lectures : `effective`, `provenSet`, remerge-diff) ;
- **oracle** : sa première lecture de `W` passe de l arbre vide à `attrTree(clone)` ; il garde le plus grand de ses deux lectures (Q-1 de #162, question Q-1 ci-dessous).

Effet : tout fichier jugé binaire par détection compte ses lignes, sous les deux pathspecs ; les binaires déclarés restent à la détection de git (`!diff` : non spécifié), donc à 0 s ils sont binaires, et comptés s ils sont du texte (un `run.png` de 300 lignes de shell compte 300, comme au tronc). Une extension hors liste (`woff2`, `.PNG` en majuscules) compte ses lignes : le sens sûr. Ajouter une extension est un changement du module (`GATE_FILES`), contrôlé par diff.

Refus (fail-closed) : `attrTree` qui échoue (magasin d objets non inscriptible, git absent) fait échouer `pin` (job rouge, message existant) et `effective` (mode `error`, `W`).

**Pourquoi pas `--text` sur les deux lignes de compte** : il change la forme que lisent `R25_DIFF_RE` (module, oracle, `ci-gates`), le test 38 (4quater) et `run.mjs`, et il compterait chaque police en octets `\n` (aucune exception possible par drapeau). **Pourquoi pas un refus des chemins binaires** : il faut un appel git de plus dans le job (`--numstat` sur la plage), une sortie et un test de câblage de plus ; compter est plus simple et ferme le même trou.

### 2.2 R25-COUNT-CAP-1 : le plafond en bash, et le même dans l oracle

Dans le job, après les deux gardes `case` et avant `CHANGED=$NEW_CHANGED` :

```bash
[ "$NEW_CHANGED" -le "$CHANGED" ] && [ "$NEW_CONTENT" -le "$CONTENT_CHANGED" ] || {
  echo '::error::Gate R-25: integration count above the written count. Fail-closed.'
  exit 1
}
```

En mode `written`, les deux comparaisons sont des égalités (vraies). Les deux valeurs sont déjà numériques et de moins de 10 chiffres (gardes existantes), donc `-le` ne peut pas échouer sur la forme.

Dans l oracle (`integration()`), une réponse `integration` au-dessus de `W` rend le mode `above-written`, garde `W` et marque l issue rouge (`red: true`), comme le job ; le `Math.min` reste (identité en deçà).

## 3. Fichiers touchés

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | `BINARY_ASSETS`, `ATTRIBUTES`, `attrTree(cwd)` (après `pinShell`, pour ne pas décaler les tueurs) ; `gitIn` et `pinShell` lisent `attrTree` ; commentaires l.30 et l.172 |
| `scripts/oracle/r25.mjs` | `attrTree(clone)` pour la première lecture (`EMPTY_TREE` retiré) ; le plafond (`above-written`, rouge) ; en-tête l.10 |
| `.github/workflows/ci.yml` | 5 lignes dans le job r25 (1 de commentaire) ; commentaire l.90-92 réécrit sur place. Le job est retiré entier du workflow public dérivé (`derivePublicWorkflow`) : aucun mot interne n en sort |
| `test/r25-integration.test.ts` | sept tests (section 4) ; deux tests existants ajustés ; tueurs ré-ancrés |
| `test/ci-gates.test.ts`, `test/dojo-render.test.ts` | tueurs `ci.yml` ré-ancrés de +5 (`:198` -> `:203`, `:260` -> `:265`) |
| `docs/adr/ADR-M003-phase2-integration.md` | ligne datée D9 duodecies (au G7) |

## 4. Tests rouges d abord, puis tueurs (un par test, numéros de ligne au gel)

| # | Test | Attendu au gel | À la base |
|---|---|---|---|
| T-1 | `r25g_ci_w_counts_a_nul_first_line_under_both_pathspecs` (bloc `run:` réel sous bash) | `src/code.mjs` et `apps/site/app/docs/nul.ts`, `// <NUL>` puis 3 000 lignes : `Changed` 3 001, `Content` 3 001, rouge | 0, 0, vert |
| T-2 | `r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection` | `f.ttf` binaire 0, `run.png` texte 300, `f.woff2` binaire 41 : 341 | 300 |
| T-3 | `r25g_integration_counts_a_nul_first_line` (module, `effective`) | mode `integration`, 3 001 et 11 | 0 et 0 |
| T-4 | `oracle_r25_w_counts_a_nul_first_line` | `r25()` : 3 001 et 11, rouge | 0 et 0, vert |
| T-5 | `r25g_ci_refuses_an_integration_code_count_above_w` | module de l arbre mesuré qui répond `integration W+1 …` : aucun compte, `::error::` nommé, sortie 1 | `Changed lines: 4`, vert |
| T-6 | `r25g_ci_refuses_an_integration_content_count_above_w` | idem pour CONTENT | `Content changed lines: 1`, vert |
| T-7 | `oracle_r25_is_red_on_an_integration_count_above_w` | oracle copié avec un module qui répond au-dessus (mêmes octets dans le clone) : `above-written`, `W`, rouge | `integration`, 3, vert |

Tueurs prévus : T-1 `ATTRIBUTES` sans `* diff` ; T-2 `"ttf"` retiré de `BINARY_ASSETS` ; T-3 `src = attrTree(cwd)` -> `src = EMPTY_TREE` ; T-4 l arbre de l oracle remis à l arbre vide ; T-5 et T-6 chacun sa moitié de la ligne de plafond de `ci.yml` ; T-7 `if (n.some(…)) return` -> `if (false) return`.

Tests existants ajustés : `r25a_ci_w_reads_under_the_module_pin` (le `GIT_ATTR_SOURCE` attendu devient l id de l arbre d attributs ; rouge à la base) ; `oracle_r25_w_is_never_below_the_ci_read` (le binaire forcé par un attribut mesuré devient un `.ttf`, seul cas où les deux lectures de l oracle diffèrent encore ; vert à la base : resserrement, tueur `, []]` tiré à la main).

Windows : aucun faux `git`, ni `/proc`, ni FIFO ; un fichier à octet NUL s écrit partout ; les chemins par `join`. Aucun saut de plateforme prévu.

## 5. R-25 du lot

Prévu : module ≈ 15, oracle ≈ 8, `ci.yml` ≈ 8, tests ≈ 120, ré-ancrages 2 : **≈ 155** (borne du lot 547). Les docs sont hors pathspec. Mesure au gel par `r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite`.

## 6. Questions pour MONARK (avec mes défauts)

- **Q-1 (seconde lecture de l oracle)** : l avis de la G2 de #162 était de la retirer quand O-a serait traité. Elle ne diffère plus de la première que si un attribut mesuré force le texte sur un binaire **déclaré** (un `.ttf` sous `*.ttf diff`). **Défaut : la garder** (gratuit, jamais sous la CI) ; la retirer donnerait l égalité stricte CI = oracle, dans un lot à part.
- **Q-2 (liste des binaires)** : `cbor`, `jpg`, `ots`, `pdf`, `png`, `ttf`, fermée dans le module. **Défaut : accepté** ; une extension nouvelle compte ses lignes jusqu à son ajout (sens sûr).
- **Q-3 (gitlinks)** : un sous-module ajouté compte 1 ligne ; son code n est pas dans ce dépôt. **Défaut : hors lot**, noté ; à former en item (refus d un mode `160000` sous les deux pathspecs) si MONARK le juge utile.
- **Q-4 (écriture d objets)** : `attrTree` écrit deux objets dans le dépôt mesuré (runner, clone de l oracle, dépôts de test). **Défaut : accepté** (objets inertes, non référencés, mêmes octets).
