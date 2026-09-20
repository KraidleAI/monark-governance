# PLI — lot CI-site (G1, implémenteur `claude-opus-4-8[1m]`)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, contexte 1M), effort max. Worker G1, 2026-09-20
(`date -u` 19:53 → clôture). **R-20** : le worker ne committe pas, ne déclenche aucun workflow, aucune action
sortante (pas de push, PR, réglage GitHub, déploiement). **R-21** : sortie écrite pour être vérifiée
adversarialement. **Base** `c9e7b4b`, worktree EXCLUSIF `F:\Monark-wt-cisite` (branche `lot/ci-site`).
**Offline** : build + oracles dans la copie `F:\tmp\cisite\build\` (`git archive HEAD` + `npm ci`), jamais dans
`F:\Monark` ni sur `C:`. Le **G0 plié + §Amendement checkpoint-1 fait foi** ; L-5 RETIRÉ (décision 77) ;
C-1..C-14 honorées (C-1..C-5 bloquantes). Aucune contradiction G0/checkpoint rencontrée (le checkpoint est déjà
plié dans le G0).

## 1. Fichiers touchés + sha256 (mesuré, worktree)
| Fichier | Statut | R-25 | sha256 |
|---|---|---|---|
| `.github/workflows/ci.yml` | modifié | compté (25) | `abd1962a8c211eba5451a0068bcebc89371dc5fee6891dbaf827c2f128570fd7` |
| `scripts/assert-fleet-html.mjs` | nouveau | compté (108) | `9d69f4e58da472590f36aa0189f2cfaa01706f0e270b9915ad374054532dc3b5` |
| `scripts/assert-fleet-html.d.mts` | nouveau | compté (26) | `551b4e22c507d8377f31b9bdfc41c29c94edfdd9dc0bf346d21baea412f7af37` |
| `scripts/export-public.mjs` | modifié | compté (5) | `8343f30661d8bedfe47bda68887ef84aee32f0d3559f7eb0b5216dee9e4f2d33` |
| `scripts/export-public.d.mts` | modifié | compté (7) | `40287cd7d6957f8e6d262c962ede29ba89bb9a74312d893d8d42f9602468eaca` |
| `test/site-build-fleet.test.ts` | nouveau | compté (121) | `610338c63d4616fbea664964178787fd58447136affb3ba71a01ee9e26b06607` |
| `test/no-cash-provider-name.test.ts` | nouveau | compté (63) | `505c1ed25cee2432655ca64d59b7d62894d8e951845ff9955fe21833a4d3805a` |
| `test/ci-gates.test.ts` | modifié | compté (33) | `fc9e44f234dde67507e22cada4b77db267fb947a6864a24167271847c1465b23` |
| `test/export-public.test.ts` | modifié | compté (68) | `accbbf620a9d646889ecc97e99ea6e9d49377060c59f3aa2eb59e1244f560c8e` |
| `vocab-banned.json` | modifié | compté (2 = +1/−1) | `d93a8ebc07d7b162097be78b3be5dd3592a657e31b8e32b153070d0985e76a76` |
| `apps/sentinel/README.md` | nouveau | compté (46) | `796ba2b3230f467239e76a667532ae5cf591fdb65865c004cba0f6f06992933b` |
| `docs/PRODUCT-BOUNDARY.md` | modifié | **exclu** (`docs/**/*.md`) | `a8f61b2c5d1c212348d68cb2aefcd825bd356dd0314a8c9d1ce894a77d707087` |
| `docs/adr/ADR-M003-phase2-integration.md` | modifié (D9 octies) | **exclu** | `b62a77bf004f454da2eeaea2a09aa5670b73437295b7679325b676d867700471` |
| `docs/adr/ADR-M004-infrastructure-plateforme.md` | modifié (D7 ter am.) | **exclu** | `9e802544df170a0ea7cd7e4c7f621d23dec5a4ea6f53d04bfdfbbdbc8d853123` |
| `docs/PLI-lot-ci-site.md` | nouveau (ce fichier) | **exclu** | (calculé au gel) |

## 2. Correspondance C-n → fichier → test nommé → mutant
| C-n | Ce qui change | Fichier(s) | Test nommé (non-LLM) | Mutant ROUGE |
|---|---|---|---|---|
| **C-1** branché LOCALEMENT (jamais « en CI ») | constante `SITE_BUILD_RUN` == ligne `run:` du build ; commentaire d'état g3-site | `scripts/assert-fleet-html.mjs`, `.github/workflows/ci.yml` | `g3_site_build_run_line_is_pinned` (site-build-fleet) | **M-C1-runline** : `run:` du build corrompu ⇒ rouge |
| **C-2** « bloquant » CONDITIONNEL | titre/commentaire « blocking CONDITIONAL » ; item required-check | `.github/workflows/ci.yml` | n-a (gouvernance) | n-a (action sortante orchestrateur) |
| **C-3** ADR D9 octies + D7 ter amendé | addendum + amendement | `docs/adr/ADR-M003-*.md`, `docs/adr/ADR-M004-*.md` | n-a (docs) | n-a |
| **C-4** O-2 sur le CORPS RENDU | `assertFleetBody` (retire `<script>`, décode entités, tolère `<!-- -->`, vacuité, fail-closed) | `scripts/assert-fleet-html.mjs`, `test/site-build-fleet.test.ts` | `fleet_html_assertion_is_sound` (+ `fleet_page_renders_the_served_header` tripwire) | **M-O2a/b/c/d** (in-test + artefact) |
| **C-5** présence ET ORDRE des étapes | job g3-site : build PUIS O-2, même job | `.github/workflows/ci.yml`, `test/ci-gates.test.ts` | `g3_site_builds_then_asserts_fleet_html` | **M-C5-order** : étape retirée ⇒ rouge ; ordre inversé ⇒ rouge |
| **C-6** chemins du workflow dérivé ⊂ export | `assert-fleet-html.mjs` ∈ `WHITELIST_FILES` | `scripts/export-public.mjs`, `test/site-build-fleet.test.ts` | `derived_workflow_run_paths_are_exported` | retrait de `WHITELIST_FILES` ⇒ rouge |
| **C-7** déclencheur vendoring durci | item formé (fontes `next/font/local`) ; `layout.tsx` NON touché | (item) | n-a | n-a |
| **C-8** PRODUCT-BOUNDARY + éviter `r25` | ligne `assert-fleet-html.mjs` ; g3-site sans sous-chaîne `r25` | `docs/PRODUCT-BOUNDARY.md`, `.github/workflows/ci.yml` | `product_boundary_matches_export_list` (cra-b) ; 42(f) `grep -c r25 = 0` | drop de la ligne ⇒ rouge |
| **C-9** décision 69 non auto-destructeur | test racine NON exporté ; motifs `\bmassive\b`/i, `polygon\.io`/i, `POLYGON_API_KEY` ; JAMAIS dans `vocab-banned.json` | `test/no-cash-provider-name.test.ts` | `no_cash_cross_provider_name_in_export` | **M-dec69** : forme dans un fichier exporté ⇒ rouge ; contrôle `Polygon` nu ⇒ vert |
| **C-10** README ∈ `collectFiles().kept` | membership (modèle SECURITY.md) | `apps/sentinel/README.md`, `test/ci-gates.test.ts` | `sentinel_readme_is_a_kept_export` | README retiré/français ⇒ non kept ⇒ rouge |
| **C-11** ordre de fusion APRÈS narabi-ops-1b-i | 1 ligne touchée `vocab-banned.json:111` (`scan.sentinel.files` + README) | `vocab-banned.json` | `vocab_sentinel_scope_scans_src_test_deploy` reste vert (n'asserte pas la liste `files` par égalité) | **M-vocab-sentinel** : « adaptive coverage » dans README ⇒ `gate:vocab` rouge |
| **C-12** écart d'ordre décision 46 | déclaré (§6) ; à porter CHANTIERS | (déclaration) | n-a | n-a |
| **C-13** `timeout-minutes: 5` sourcé | 4-espaces (job) | `.github/workflows/ci.yml` | `ci_jobs_have_timeout_and_test_flags_locked` (couvre le 6ᵉ job, ≤ 20) | `timeout` > 20 ⇒ rouge (test existant) |
| **C-14** items dans CHANTIERS | §7 (l'orchestrateur porte, R-20) | (déclaration) | n-a | n-a |
| **L-4/42(f′)** corps de job retenus byte-identiques | `export_public_derived_jobs_are_byte_identical` | `test/export-public.test.ts` | 42(f′) | **M-42f′** : commentaire col-2 dans r25 ⇒ 42(f′) rouge / 42(f) vert ; octet modifié ⇒ rouge |
| **L-6** décision 69 (= C-9) | (voir C-9) | | | |

## 3. Mutants rejoués ROUGES (harnais mémoire / copie scratch, restauration byte-exacte, JAMAIS `git checkout`)
| Mutant | Type | Résultat mesuré | Restauration |
|---|---|---|---|
| **M-build** | `next build` réel : `const _typeErr: number = "…"` dans `apps/site/app/fleet/page.tsx` | build **exit 1**, `page.tsx(57,9) TS2322: Type 'string' is not assignable to type 'number'` | sha256 avant==après ✔ |
| **M-O2a** (artefact) | en-tête cassé dans le corps de `fleet.html` | O-2 **exit 1** « header absent from the rendered /fleet body » | sha ✔ |
| **M-O2a** (in-test) | corps sans note render | `assert.throws /absent from the rendered/` ✔ | — |
| **M-O2b** (in-test) | vacuité : liste vide / note blanche / corps vide | `assert.throws /vacuity/ /body empty/` ✔ | — |
| **M-O2c** (in-test) | corps `&#x27;` sans payload ⇒ vert APRÈS décodage, faux sans | décodage load-bearing prouvé ✔ | — |
| **M-O2d** (artefact) | note cassée dans le CORPS, gardée dans le payload `<script>` | O-2 **exit 1** « 1 served note(s) absent » (le payload ne sauve pas) | sha ✔ |
| **M-O2d** (in-test) | note SEULEMENT dans le payload | `assert.throws /absent from the rendered/` ✔ | — |
| **O-2 fail-closed** | `fleet.html` absent | O-2 **exit 1** « FAIL-CLOSED — … not found » | — |
| **M-C5-order** | étapes build/O-2 inversées dans `ci.yml` | `g3_site_builds_then_asserts_fleet_html` **FAIL** | sha ✔ |
| **M-C1-runline** | ligne `run:` du build corrompue | `g3_site_build_run_line_is_pinned` **FAIL** | sha ✔ |
| **M-42f′** (in-test) | commentaire col-2 dans corps r25 | 42(f′) détecte (orphelin absorbé) ; `grep -c r25` reste vert ✔ | — |
| **M-vocab-sentinel** | « adaptive coverage » dans README | `gate:vocab` **exit 1** (FORBIDDEN VOCAB README:48) | sha ✔ |
| **M-dec69** | `polygon.io` dans README (fichier exporté) | `no_cash_cross_provider_name_in_export` **FAIL** | sha ✔ |

## 4. Oracles exécutés (un à un, copie `F:\tmp\cisite\build\` avec `npm ci`)
- `npm run typecheck` → **exit 0** (le TSX du site reste invisible du tsc racine ; `.mjs`→`.ts` résolu par les `.d.mts`).
- `node --test` sur `site-build-fleet` (4) + `no-cash-provider-name` (1) + `ci-gates` (29) + `export-public` (2, dont le test lourd 42 = export réel + `npm ci` + CI exportée + lang-gate) → **tous verts** ; passe consolidée finale **36/36** sur les 4 fichiers touchés.
- `test/cra-b.test.ts` → **6/6** (dont `product_boundary_matches_export_list` avec la nouvelle entrée whitelist, `ci_publishes_sbom`).
- `npm run gate:vocab` → **OK, 177 fichiers** (README sentinel inclus, propre).
- `npm run lint` (eslint) → **exit 0** ; `npm run lint:ratchet` → **69/69, exit 0**.
- `npm run export:check` (**DÉFAUT, tous scopes**) → **check OK, 0 hit, exit 0** sur mon arbre ET sur la pristine `c9e7b4b` (`/f/tmp/cisite/orig`) ; `npm run lang:gate` (**DÉFAUT**) → **OK, 0 hit, exit 0** sur les deux (mesuré). **AUCUN hit French de baseline** : les 3 (export:check) / 7 (lang:gate) hits observés AVANT correction étaient TOUS mes propres « fait » (7 occurrences sur 4 fichiers ; export:check n'en voyait que 3, dans l'unique fichier EXPORTÉ `assert-fleet-html.mjs` ; lang:gate voyait aussi les 4 des fichiers de test non exportés) — remplacés par « finding », re-mesuré 0/0. Le scopé `root,…,sentinel` est aussi **check OK, 0 hit**. Les autres tests à périmètre changé par le README/le littéral décision-69 (`public_surfaces_make_no_probative_claim` 2/2, `harness-export` 1/1, `skills` 5/5, `no-secret-in-repo` 1/1 — le littéral `POLYGON_API_KEY` sans `=valeur` ne déclenche pas la garde de secret) sont **verts**.
- `next build` réel de `apps/site` (`npm run build -w @monark/site`) → **exit 0**, `fleet.html` 61 163 o ; puis **commande O-2 EXTRAITE de `ci.yml`** (`node scripts/assert-fleet-html.mjs`) → **exit 0** « header + 4 served note(s) present in the rendered /fleet body (34099 body chars) » (CA-11 : composition depuis l'artefact réel).
- **Hypothèses G1 mesurées** : (5) `.mjs` importe `.ts` sous Node 24.15.0 (statique ET dynamique, apostrophe préservée) — VÉRIFIÉE ; forme de build `npm run build -w @monark/site` — VÉRIFIÉE ; piège fait-8 (corps `testimony&#x27;s` encodé 1× / payload `testimony's` littéral 1× / 1 bloc `<script>`) — VÉRIFIÉ empiriquement.

## 5. R-25 (pathspec `STAT=` de `ci.yml:65` INCHANGÉE, base `c9e7b4b`, après `git add -N` des 5 nouveaux fichiers)
**504 lignes changées** (503 insertions + 1 suppression), 11 fichiers COMPTÉS — **sous 1 205**, sous la cible souple 1 100, dans la bande projetée du G0 (~408-648). Répartition : `ci.yml` 25, `assert-fleet-html.mjs` 108, `.d.mts` 26, `export-public.mjs` 5, `export-public.d.mts` 7, `site-build-fleet.test.ts` 121, `no-cash-provider-name.test.ts` 63, `ci-gates.test.ts` 33, `export-public.test.ts` 68, `vocab-banned.json` 2, `README.md` 46. Docs (`docs/**/*.md`) EXCLUS (PRODUCT-BOUNDARY, ADR-M003/M004, ce PLI). **L-5 RETIRÉ (décision 77)** : aucune modification de la pathspec `STAT=`/`NON_SERIES_GLOB` ; la prose PROVENANCE des séries reste comptée (D9 sexies).

## 6. Déviations déclarées
- **C-11 (ligne touchée `vocab-banned.json:111`)** : j'ajoute `"apps/sentinel/README.md"` en fin du tableau `scan.sentinel.files`. C'est la SEULE ligne touchée de `vocab-banned.json`. **Conflit CERTAIN de fusion** avec `lot/narabi-ops-1b-i` (qui ajoute 3 chemins probe à la même ligne) : fusion CI-site APRÈS narabi-ops-1b-i, résolution en gardant les DEUX ajouts, puis rejeu `gate:vocab` sur l'arbre fusionné (orchestrateur seul).
- **C-12 (écart d'ordre décision 46)** : CI-site est exécuté AVANT T-1b et la cartographie totale finale — ordre orchestrateur, plus conservateur (gater `next build` plus tôt). Assumé, déjà partiellement en décision 77.
- **Décision 69 — sur-appariement conservateur** : `\bmassive\b` (insensible à la casse) attraperait aussi l'adjectif anglais « massive ». Accepté (base mesurée 0 hit sur le set exporté RÉEL, y compris `.sh/.yml/.css/.html/.js/.txt`) ; le domaine (`polygon.io`) et la clé d'env (`POLYGON_API_KEY`) sont spécifiques ; un `Polygon` nu (chaîne blockchain) et un « massive » non-mot restent VERTS (contrôle imposé). Motifs confinés au SEUL fichier NON exporté `test/no-cash-provider-name.test.ts` (self-check : aucun `test/` ∈ `collectFiles().kept`).
- **Placement des tests** (avis advisor intégré, canal 1) : décision 69 dans un **fichier dédié** (audit « motifs uniquement ici » par un seul grep + self-check crisp) ; C-5/C-10 dans `ci-gates.test.ts` ; 42(f′) dans `export-public.test.ts` ; O-2/run-line/C-6 dans `site-build-fleet.test.ts`.
- **Anglais (D0.5)** : le mot français « fait » (des « Faits mesurés » du G0) remplacé par « finding » — **7 occurrences sur 4 fichiers** (assert-fleet-html.mjs 3, site-build-fleet 2, export-public 1, no-cash 1). `assert-fleet-html.mjs` étant EXPORTÉ, `export:check` en voyait 3 (root scope) et `lang:gate` les 7 (fichiers de test inclus, non exportés) ; après correction, `export:check` DÉFAUT et `lang:gate` DÉFAUT sont **0 hit sur mon arbre ET la pristine `c9e7b4b`** (mesuré, §4). Aucun hit French de baseline.
- **Décision 69 — littéraux confinés (adjudication G0)** : les motifs de match (`\bmassive\b`/i, `polygon\.io`/i, `POLYGON_API_KEY`) vivent UNIQUEMENT dans `test/no-cash-provider-name.test.ts` (non exporté). Dans l'ADR-M003 D9 octies et ce PLI, ils sont **décrits par forme** (marque mot-entier insensible-casse, domaine API, nom de clé d'env), pas recopiés en littéral — `docs/` est de toute façon blacklisté structurellement (non exporté, zéro risque de publication), mais l'adjudication distingue « nom en prose licite » de « motifs de match confinés au test ».
- **Durcissement `renderedBody`** (avis advisor) : retrait des `<script>` AVANT les `<!-- -->` (un `<!--` dans un payload ne peut plus s'apparier avec un `-->` du corps). Pas de bug aujourd'hui (Next échappe `<` en `<` dans les scripts inline — mesuré sur l'artefact), durcissement d'une ligne. +3 lignes (R-25 501→504, assert-fleet-html.mjs 105→108) ; re-testé vert (site-build-fleet 4/4, O-2 réel).
- **`.d.mts` non prévu au G0** : `scripts/export-public.d.mts` a dû recevoir les déclarations `derivePublicWorkflow`/`CI_WORKFLOW_PATH` (le `.d.mts` est la surface de type que le tsc racine consomme, pas le `.mjs`) — sinon TS2305 sur mes imports. +7 lignes comptées.
- **Placement de `g3-site`** : en FIN de `ci.yml` (après g6), clé nue `  g3-site:` (le regex `ci_jobs_have_timeout` exige `\s*$`).

## 7. Items formés (déclencheur + propriétaire ; C-14 — à porter dans `docs/CHANTIERS.md` par l'orchestrateur, déjà amorcé `CHANTIERS.md:221`)
1. **Required status check `g3-site`** — ajouter `g3-site` à la liste fermée de 4 required checks (gouvernance ET miroir) ; **action sortante réservée à l'orchestrateur** ; déclencheur : avant la première PR post-fusion / liste release ; propriétaire orchestrateur. Tant qu'absent, le job est « bloquant (conditionnel) ».
2. **Premier run réel sur runner Linux `g3-site`** — la composition est branchée localement (Windows) ; premier passage `ubuntu-latest` dû ; résiduel : casse d'imports invisible sous Windows ; déclencheur : première PR séquentielle / fenêtre de push ; propriétaire orchestrateur.
3. **Vendoring des fontes OFL** (`next/font/local`, ADR-M004 (e) décidé mais implémenté sur aucune branche ; `layout.tsx` INTERDIT dans ce lot) — déclencheur : premier rouge `g3-site` attribuable au fetch des fontes (`error_origin` externe) OU la fenêtre publique, au premier des deux ; propriétaire orchestrateur.
4. **`export:check` et `lang:gate` absents de CI** — un README français serait retiré de l'export EN SILENCE (`export-public.mjs:263`) sans rougir la CI ; d'ici là `sentinel_readme_is_a_kept_export` protège CE README ; déclencheur : durcissement CI / avant fenêtre publique ; propriétaire orchestrateur.
5. **Resserrement `timeout-minutes`** — valeur POSÉE = 5 ; 10 SEULEMENT par re-mesure sourcée si le premier run à froid dépasse 100 s ; déclencheur : premier run CI de `g3-site` ; propriétaire orchestrateur.
6. **Gate décision 69 sur la surface servie `/bell/`** — l'oracle « fichiers exportés » atterrit ICI (L-6) ; l'item T-1b RESTE pour la surface servie `/bell/` (déclencheur : G0 T-1b / ajout `apps/bell` à l'export) ; propriétaire orchestrateur.

## 8. Blocs verbatim à porter au G7 (orchestrateur seul, R-20)
### CHANTIERS (note de progression du lot)
> **2026-09-20 — lot CI-site : G1 rendu** (worker `claude-opus-4-8[1m]`, offline). `next build` branché en job CI
> `g3-site` SÉPARÉ (build `npm run build -w @monark/site` PUIS O-2 `node scripts/assert-fleet-html.mjs`, même job,
> `timeout-minutes: 5`, sans sous-chaîne `r25`, « bloquant (conditionnel) »). O-2 asserte le CORPS RENDU de
> `apps/site/.next/server/app/fleet.html` (retrait `<script>`, décodage entités, vacuité, fail-closed). Dettes
> soldées : `apps/sentinel/README.md` (décision 29 a), test 42(f′) (ADR-M004 D7 ter, tous corps retenus
> byte-identiques), oracle décision 69 `no_cash_cross_provider_name_in_export` (test racine NON exporté).
> R-25 = 504/1205. 8 tests nommés + 13 mutants rouges rejoués byte-exact. L-5 retiré (décision 77). Fusion
> APRÈS `lot/narabi-ops-1b-i` (conflit `vocab-banned.json:111`) puis rejeu `gate:vocab`. Zéro dette.

### JOURNAL-PROVENANCE (provenance G7 ; `error_origin` assigné au G7 par l'orchestrateur)
> **lot CI-site** — modèle `claude-opus-4-8[1m]` effort max, 2026-09-20, worktree `F:\Monark-wt-cisite`
> (`lot/ci-site`, base `c9e7b4b`), offline. 14 fichiers (11 code + 3 docs ; + PLI) — sha256 en §1 du PLI.
> R-25 504/1205 (pathspec `ci.yml:65`, `git add -N`). Oracles : typecheck 0, tests 36/36 touchés + cra-b 6/6 +
> ci-gates 29/29 + export 42/42(f′), gate:vocab 177, lint 0, lint:ratchet 69/69, export:check scopé OK,
> `next build` réel + O-2 extraite verts (CA-11). ADR-M003 D9 octies, ADR-M004 D7 ter amendé.
> `error_origin` (trou « `next build` absent de CI ») = **orchestrateur** (formé checkpoint-2 E-registre V-3/O-2).

## 9. Reste dû
**Zéro dette nue.** Tous les points ouverts sont soit un **item formé avec déclencheur + propriétaire** (§7,
tous propriétaire orchestrateur, aucune écriture worker), soit une **déviation déclarée sourcée** (§6). Aucun
papier introuvable (aucune source de seconde main consommée ; les chiffres — TS2322, 61 163 o, 34099 chars,
177 fichiers, 501 lignes, 36/36 — sont mesurés first-hand et rejouables sous `F:\tmp\cisite\`). Actions
réservées à l'orchestrateur (R-20, non faites) : commit, fusion `--no-ff` après `lot/narabi-ops-1b-i`, rejeu
`gate:vocab` sur l'arbre fusionné, portage des textes CHANTIERS/JOURNAL, ajout du required status check.
