# PLI — lot CI-site (G1, implémenteur `claude-opus-4-8[1m]`)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, contexte 1M), effort max. Worker G1, 2026-09-20
(`date -u` 19:53 → clôture). **R-20** : le worker ne committe pas, ne déclenche aucun workflow, aucune action
sortante (pas de push, PR, réglage GitHub, déploiement). **R-21** : sortie écrite pour être vérifiée
adversarialement. **Base** `c9e7b4b`, worktree EXCLUSIF `F:\Monark-wt-cisite` (branche `lot/ci-site`).
**Offline** : build + oracles dans la copie `F:\tmp\cisite\build\` (`git archive HEAD` + `npm ci`), jamais dans
`F:\Monark` ni sur `C:`. Le **G0 plié + §Amendement checkpoint-1 fait foi** ; L-5 RETIRÉ (décision 77) ;
C-1..C-14 honorées (C-1..C-5 bloquantes). Aucune contradiction G0/checkpoint rencontrée (le checkpoint est déjà
plié dans le G0).

## 1. Fichiers touchés + sha256 (mesuré `sha256sum`, **worktree post-pli G2**, non commité ; `.gitattributes` `eol=lf` ⇒ ces sha valent aussi pour le contenu git après commit. Recalculés au pli G2 : `assert-fleet-html.mjs`, `.d.mts`, `site-build-fleet.test.ts`, `ci-gates.test.ts`, `ADR-M003` — les 9 autres re-mesurés, inchangés)
| Fichier | Statut | R-25 | sha256 |
|---|---|---|---|
| `.github/workflows/ci.yml` | modifié | compté (25) | `abd1962a8c211eba5451a0068bcebc89371dc5fee6891dbaf827c2f128570fd7` |
| `scripts/assert-fleet-html.mjs` | nouveau | compté (119) | `9aec50dfbff9b17ea79f9ecf9ef7e0261296a0c3eb828fe88d669679a15dbc62` |
| `scripts/assert-fleet-html.d.mts` | nouveau | compté (27) | `01689b4e5691ba5187d53a13d264f02acc696f0c3614e812effcd6a2e9fcfecb` |
| `scripts/export-public.mjs` | modifié | compté (5) | `8343f30661d8bedfe47bda68887ef84aee32f0d3559f7eb0b5216dee9e4f2d33` |
| `scripts/export-public.d.mts` | modifié | compté (7) | `40287cd7d6957f8e6d262c962ede29ba89bb9a74312d893d8d42f9602468eaca` |
| `test/site-build-fleet.test.ts` | nouveau | compté (183) | `22798272df18871d56776afc38353c167e1c0aad84f52c0809320e8858e68936` |
| `test/no-cash-provider-name.test.ts` | nouveau | compté (63) | `505c1ed25cee2432655ca64d59b7d62894d8e951845ff9955fe21833a4d3805a` |
| `test/ci-gates.test.ts` | modifié | compté (56) | `ac16bb03ba714c3fd872976f46b3c0ab34391d7dcb18db545443e67c9b1d6aae` |
| `test/export-public.test.ts` | modifié | compté (68) | `accbbf620a9d646889ecc97e99ea6e9d49377060c59f3aa2eb59e1244f560c8e` |
| `vocab-banned.json` | modifié | compté (2 = +1/−1) | `d93a8ebc07d7b162097be78b3be5dd3592a657e31b8e32b153070d0985e76a76` |
| `apps/sentinel/README.md` | nouveau | compté (46) | `796ba2b3230f467239e76a667532ae5cf591fdb65865c004cba0f6f06992933b` |
| `docs/PRODUCT-BOUNDARY.md` | modifié | **exclu** (`docs/**/*.md`) | `a8f61b2c5d1c212348d68cb2aefcd825bd356dd0314a8c9d1ce894a77d707087` |
| `docs/adr/ADR-M003-phase2-integration.md` | modifié (D9 octies ; titre + sous-note pli G2) | **exclu** | `c94eb21f0e8402ef92fe253e055d92a1dc63578d63ce4ff97d5a1b8a82039c49` |
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
| **C-9** décision 69 non auto-destructeur | test racine NON exporté ; les trois formes définies dans `test/no-cash-provider-name.test.ts` ; JAMAIS dans `vocab-banned.json` | `test/no-cash-provider-name.test.ts` | `no_cash_cross_provider_name_in_export` | **M-dec69** : forme dans un fichier exporté ⇒ rouge ; contrôle `Polygon` nu ⇒ vert |
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
| **M-dec69** | une forme fournisseur (cf. `test/no-cash-provider-name.test.ts`) dans README (fichier exporté) | `no_cash_cross_provider_name_in_export` **FAIL** | sha ✔ |

## 4. Oracles exécutés au G1 (un à un, copie `F:\tmp\cisite\build\` avec `npm ci` ; **post-pli G2 : voir §10.3** — les compteurs G1 ci-dessous, dont 36/36, sont la mesure G1)
- `npm run typecheck` → **exit 0** (le TSX du site reste invisible du tsc racine ; `.mjs`→`.ts` résolu par les `.d.mts`).
- `node --test` sur `site-build-fleet` (4) + `no-cash-provider-name` (1) + `ci-gates` (29) + `export-public` (2, dont le test lourd 42 = export réel + `npm ci` + CI exportée + lang-gate) → **tous verts** ; passe consolidée finale **36/36** sur les 4 fichiers touchés.
- `test/cra-b.test.ts` → **6/6** (dont `product_boundary_matches_export_list` avec la nouvelle entrée whitelist, `ci_publishes_sbom`).
- `npm run gate:vocab` → **OK, 177 fichiers** (README sentinel inclus, propre).
- `npm run lint` (eslint) → **exit 0** ; `npm run lint:ratchet` → **69/69, exit 0**.
- `npm run export:check` (**DÉFAUT, tous scopes**) → **check OK, 0 hit, exit 0** sur mon arbre ET sur la pristine `c9e7b4b` (`/f/tmp/cisite/orig`) ; `npm run lang:gate` (**DÉFAUT**) → **OK, 0 hit, exit 0** sur les deux (mesuré). **AUCUN hit French de baseline** : les 3 (export:check) / 7 (lang:gate) hits observés AVANT correction étaient TOUS mes propres « fait » (7 occurrences sur 4 fichiers ; export:check n'en voyait que 3, dans l'unique fichier EXPORTÉ `assert-fleet-html.mjs` ; lang:gate voyait aussi les 4 des fichiers de test non exportés) — remplacés par « finding », re-mesuré 0/0. Le scopé `root,…,sentinel` est aussi **check OK, 0 hit**. Les autres tests à périmètre changé par le README/le littéral décision-69 (`public_surfaces_make_no_probative_claim` 2/2, `harness-export` 1/1, `skills` 5/5, `no-secret-in-repo` 1/1 — le nom de clé d'env du fournisseur (défini dans `test/no-cash-provider-name.test.ts`) sans `=valeur` ne déclenche pas la garde de secret) sont **verts**.
- `next build` réel de `apps/site` (`npm run build -w @monark/site`) → **exit 0**, `fleet.html` 61 163 o ; puis **commande O-2 EXTRAITE de `ci.yml`** (`node scripts/assert-fleet-html.mjs`) → **exit 0** « header + 4 served note(s) present in the rendered /fleet body (34099 body chars) » (CA-11 : composition depuis l'artefact réel).
- **Hypothèses G1 mesurées** : (5) `.mjs` importe `.ts` sous Node 24.15.0 (statique ET dynamique, apostrophe préservée) — VÉRIFIÉE ; forme de build `npm run build -w @monark/site` — VÉRIFIÉE ; piège fait-8 (corps `testimony&#x27;s` encodé 1× / payload `testimony's` littéral 1× / 1 bloc `<script>`) — VÉRIFIÉ empiriquement.

## 5. R-25 (pathspec `STAT=` de `ci.yml:65` INCHANGÉE, base `c9e7b4b`, mesure worktree post-pli G2 — deux-points `c9e7b4b`, sans `git add -N` : le pli n'ajoute aucun fichier)
**601 lignes changées** (600 insertions + 1 suppression), 11 fichiers COMPTÉS — **sous 1 205**, sous la cible souple 1 100 (G1 = 504 ; pli G2 = +97 sur 4 fichiers touchés : `assert-fleet-html.mjs` +11, `.d.mts` +1, `site-build-fleet.test.ts` +62, `ci-gates.test.ts` +23). Répartition : `ci.yml` 25, `assert-fleet-html.mjs` 119, `.d.mts` 27, `export-public.mjs` 5, `export-public.d.mts` 7, `site-build-fleet.test.ts` 183, `no-cash-provider-name.test.ts` 63, `ci-gates.test.ts` 56, `export-public.test.ts` 68, `vocab-banned.json` 2, `README.md` 46. Docs (`docs/**/*.md`) EXCLUS (PRODUCT-BOUNDARY, ADR-M003/M004, ce PLI). **L-5 RETIRÉ (décision 77)** : aucune modification de la pathspec `STAT=`/`NON_SERIES_GLOB` ; la prose PROVENANCE des séries reste comptée (D9 sexies).

## 6. Déviations déclarées
- **C-11 (ligne touchée `vocab-banned.json:111`)** : j'ajoute `"apps/sentinel/README.md"` en fin du tableau `scan.sentinel.files`. C'est la SEULE ligne touchée de `vocab-banned.json`. **Conflit CERTAIN de fusion** avec `lot/narabi-ops-1b-i` (qui ajoute 3 chemins probe à la même ligne) : fusion CI-site APRÈS narabi-ops-1b-i, résolution en gardant les DEUX ajouts, puis rejeu `gate:vocab` sur l'arbre fusionné (orchestrateur seul).
- **C-12 (écart d'ordre décision 46)** : CI-site est exécuté AVANT T-1b et la cartographie totale finale — ordre orchestrateur, plus conservateur (gater `next build` plus tôt). Assumé, déjà partiellement en décision 77.
- **Décision 69 — sur-appariement conservateur** : la forme marque (mot entier, insensible à la casse) attraperait aussi l'adjectif anglais homonyme. Accepté (base mesurée 0 hit sur le set exporté RÉEL, y compris `.sh/.yml/.css/.html/.js/.txt`) ; les formes domaine API et nom de clé d'env sont spécifiques ; un `Polygon` nu (chaîne blockchain, PAS l'une des trois formes) et un mot non entier restent VERTS (contrôle imposé). Les trois formes littérales sont confinées au SEUL fichier NON exporté `test/no-cash-provider-name.test.ts` (self-check : aucun `test/` ∈ `collectFiles().kept`).
- **Placement des tests** (avis advisor intégré, canal 1) : décision 69 dans un **fichier dédié** (audit « motifs uniquement ici » par un seul grep + self-check crisp) ; C-5/C-10 dans `ci-gates.test.ts` ; 42(f′) dans `export-public.test.ts` ; O-2/run-line/C-6 dans `site-build-fleet.test.ts`.
- **Anglais (D0.5)** : le mot français « fait » (des « Faits mesurés » du G0) remplacé par « finding » — **7 occurrences sur 4 fichiers** (assert-fleet-html.mjs 3, site-build-fleet 2, export-public 1, no-cash 1). `assert-fleet-html.mjs` étant EXPORTÉ, `export:check` en voyait 3 (root scope) et `lang:gate` les 7 (fichiers de test inclus, non exportés) ; après correction, `export:check` DÉFAUT et `lang:gate` DÉFAUT sont **0 hit sur mon arbre ET la pristine `c9e7b4b`** (mesuré, §4). Aucun hit French de baseline.
- **Décision 69 — littéraux confinés (adjudication G0 ; contradiction PLI:87 corrigée au pli G2, C-G2-4)** : les trois motifs de match (forme marque mot-entier insensible-casse, forme domaine API, forme nom de clé d'env) vivent UNIQUEMENT dans `test/no-cash-provider-name.test.ts` (non exporté). Dans l'ADR-M003 D9 octies et ce PLI, ils sont **décrits par forme**, jamais recopiés en littéral (les littéraux retirés de §2/§3/§4/§6 au pli G2 pour lever l'auto-contradiction) — `docs/` est de toute façon blacklisté structurellement (non exporté, zéro risque de publication), mais l'adjudication distingue « nom en prose licite » de « motifs de match confinés au test ».
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
> **2026-09-20 — lot CI-site : G1 rendu, revue G2 (PASS-avec-corrections) pliée** (worker `claude-opus-4-8[1m]`, offline). `next build` branché LOCALEMENT en job CI
> `g3-site` SÉPARÉ (build `npm run build -w @monark/site` PUIS O-2 `node scripts/assert-fleet-html.mjs`, même job,
> `timeout-minutes: 5`, sans sous-chaîne `r25`, « bloquant (conditionnel) »). O-2 asserte le CORPS RENDU de
> `apps/site/.next/server/app/fleet.html` (retrait `<script>`/`<noscript>`/`<template>` attrs+casse, décodage entités dont décimal, vacuité, fail-closed sur `<script>` non fermé). Dettes
> soldées : `apps/sentinel/README.md` (décision 29 a), test 42(f′) (ADR-M004 D7 ter, tous corps retenus
> byte-identiques), oracle décision 69 `no_cash_cross_provider_name_in_export` (test racine NON exporté).
> R-25 = 601/1205. 9 tests nommés + 23 mutants rouges byte-exact (13 G1 + 10 pli G2 : 3× `if:`-skip, O-1, 6× renderedBody). L-5 retiré (décision 77). Fusion
> APRÈS `lot/narabi-ops-1b-i` (conflit `vocab-banned.json:111`) puis rejeu `gate:vocab`. Zéro dette.

### JOURNAL-PROVENANCE (provenance G7 ; `error_origin` assigné au G7 par l'orchestrateur)
> **lot CI-site** — modèle `claude-opus-4-8[1m]` effort max, 2026-09-20, worktree `F:\Monark-wt-cisite`
> (`lot/ci-site`, base `c9e7b4b`), offline. 14 fichiers (11 code + 3 docs ; + PLI) — sha256 recalculés post-pli en §1 du PLI.
> R-25 601/1205 (pathspec `ci.yml:65`, worktree vs base ; G1 504 + pli G2 97). Oracles (copie `git archive` + `npm ci`) :
> typecheck 0, tests touchés 37/37 (site-build-fleet 5, no-cash 1, ci-gates 29, export-public 2) + cra-b 6/6,
> gate:vocab 177, lint 0 + lint:ratchet 69/69, export:check + lang:gate 0 hit, `next build` réel + O-2 extraite verts (CA-11, 34099 body chars).
> ADR-M003 D9 octies, ADR-M004 D7 ter amendé. `error_origin` : trou « `next build` absent de CI » = **orchestrateur** (checkpoint-2 E-registre V-3/O-2) ; C-G2-1/3/4 = **worker** ; C-G2-2 = **classe préexistante de l'invariant CI** (job) + **spécification C-5 checkpoint-1** (étape O-2).

## 9. Reste dû
**Zéro dette nue.** Tous les points ouverts sont soit un **item formé avec déclencheur + propriétaire** (§7,
tous propriétaire orchestrateur, aucune écriture worker), soit une **déviation déclarée sourcée** (§6). Aucun
papier introuvable (aucune source de seconde main consommée ; les chiffres — TS2322, 61 163 o, 34099 chars,
177 fichiers, 601 lignes, 37/37 — sont mesurés first-hand et rejouables sous `F:\tmp\cisite\`). Actions
réservées à l'orchestrateur (R-20, non faites) : commit, fusion `--no-ff` après `lot/narabi-ops-1b-i`, rejeu
`gate:vocab` sur l'arbre fusionné, portage des textes CHANTIERS/JOURNAL, ajout du required status check.

## 10. PLI G2 (pli des corrections de la revue G2 — worker `claude-opus-4-8[1m]` effort max, 2026-09-20, offline)

Revue `docs/G2-lot-ci-site.md` : **PASS-AVEC-CORRECTIONS**. C-G2-1..4 **et** les observations O-1..O-3 sont pliées
(adjudication orchestrateur : zéro dette). Rejeu offline dans `F:\tmp\cisite\pli\build\` (`git archive HEAD` +
overlay des 4 fichiers de code touchés + `npm ci`), jamais dans `F:\Monark`/`F:\Monark-wt-cisite` ni sur `C:`
(`TMP/TEMP=F:\tmp\cisite\pli\tmp`, cache `F:\cache\npm`).

### 10.1 Table des corrections (défaut → fichier:ligne → test → mutant)
| Défaut | Ce qui change | Fichier:ligne | Test nommé (non-LLM) | Mutant ROUGE rejoué |
|---|---|---|---|---|
| **C-G2-1** | sha256 ADR-M003 corrigé ; TOUS les sha §1 recalculés post-pli | `docs/PLI-lot-ci-site.md` §1 | n-a (traçabilité ; CA-9) | n-a |
| **C-G2-2** (job) | invariant général : aucun `if:` (job ni étape) dans `ci.yml` | `test/ci-gates.test.ts` test 38 | `ci_gates_blocking_no_continue_on_error` | `if: false` job ⇒ rouge ; `if: ${{ false }}` ⇒ rouge |
| **C-G2-2** (étape O-2) | bloc g3-site sans `if:` (job ni étape) | `test/ci-gates.test.ts` | `g3_site_builds_then_asserts_fleet_html` | `if: false` étape O-2 ⇒ rouge |
| **C-G2-3** | « branché **LOCALEMENT** » (§8 CHANTIERS) ; titre ADR aligné sur le corps | `docs/PLI-lot-ci-site.md:102`, `docs/adr/ADR-M003-phase2-integration.md:116` | n-a (fidélité C-1 ; docs) | n-a |
| **C-G2-4** | littéraux fournisseur retirés de §2/§3/§4/§6 (→ « les trois formes définies dans `test/no-cash-provider-name.test.ts` ») ; PLI:87 rendu vrai | `docs/PLI-lot-ci-site.md:42/66/74/84/87` | `no_cash_cross_provider_name_in_export` (inchangé) | n-a (docs non exportés) |
| **O-1** | tripwire durci : en-tête exigé en position RENDUE (AST `renderedTexts`), pas un commentaire JSX | `test/site-build-fleet.test.ts` | `fleet_page_renders_the_served_header` | retrait du `<div>` d'en-tête (commentaire :125 gardé) ⇒ rouge |
| **O-2** | `renderedBody` retire aussi `<noscript>`/`<template>` (attrs+casse) et **fail-closed** sur `<script>` non fermé | `scripts/assert-fleet-html.mjs` `renderedBody`, `test/site-build-fleet.test.ts` | `rendered_body_strips_hidden_surfaces_and_fails_closed` | noscript/template strip retiré ⇒ rouge ; fail-closed retiré ⇒ rouge ; `<SCRIPT type=…>` (casse) ⇒ rouge |
| **O-3** | fixtures qui tuent N2 (branche décimale) et N3 (`[^>]*`) | `test/site-build-fleet.test.ts` (même test) | `rendered_body_strips_hidden_surfaces_and_fails_closed` | branche décimale `/&#(\d+);/` retirée ⇒ rouge ; `[^>]*` retiré (`<script>` nu) ⇒ rouge |

### 10.2 Mutants du pli G2 (tous ROUGES ; copie mémoire `.bak`, restauration byte-exacte vérifiée par sha256, JAMAIS `git checkout`)
| # | Mutant | Cible | Test rougi (mesuré) | Restauration |
|---|---|---|---|---|
| **G2-1** | `if: false` sur le JOB g3-site | `ci.yml` | test 38 + C-5 rouges ; **42(f′) reste VERT** (derive copie verbatim) | sha == avant ✔ |
| **G2-2** | `if: false` sur l'ÉTAPE O-2 | `ci.yml` | test 38 + C-5 rouges | sha ✔ |
| **G2-3** | `if: ${{ false }}` sur le JOB g3-site | `ci.yml` | test 38 + C-5 rouges | sha ✔ |
| **G2-4** | retrait du `<div>` d'en-tête rendu (commentaire :125 gardé) | `apps/site/app/fleet/page.tsx` | `fleet_page_renders_the_served_header` rouge | sha ✔ |
| **G2-5** | branche décimale `/&#(\d+);/` retirée de `decodeEntities` | `assert-fleet-html.mjs` | `rendered_body_strips_hidden_surfaces_and_fails_closed` rouge | sha ✔ |
| **G2-6** | `[^>]*` retiré du strip `<script>` (nu) | `assert-fleet-html.mjs` | idem rouge | sha ✔ |
| **G2-7** | drapeau `i` retiré du strip `<script>` | `assert-fleet-html.mjs` | idem rouge (`<SCRIPT type=…>` non retiré) | sha ✔ |
| **G2-8** | strip `<noscript>` désactivé | `assert-fleet-html.mjs` | idem rouge | sha ✔ |
| **G2-9** | strip `<template>` désactivé | `assert-fleet-html.mjs` | idem rouge | sha ✔ |
| **G2-10** | fail-closed `<script>` non fermé retiré | `assert-fleet-html.mjs` | idem rouge | sha ✔ |
| **re-M-O2d** (artefact) | note du CORPS de `fleet.html` corrompue, payload gardé | `apps/site/.next/…/fleet.html` | O-2 extraite **exit 1** « 1 served note absent » ; **raw `includes` note = TRUE** (le payload ne sauve pas) | sha ✔ |
| **re-M-C5** | ordre g3-site inversé (O-2 avant build) | `ci.yml` | `g3_site_builds_then_asserts_fleet_html` rouge | sha ✔ |
| **re-M-C1-runline** | ligne `run:` du build corrompue | `ci.yml` | `g3_site_build_run_line_is_pinned` rouge | sha ✔ |

### 10.3 Oracles (un à un, PAS `npm run ci` ; copie `git archive HEAD` + overlay + `npm ci`, cache `F:\cache\npm`)
`npm ci` **0** (282 pkgs) ; `next build` **EXTRAIT de `ci.yml`** **exit 0** (22 s, `fleet.html` 61 163 o, 13 pages
`○ Static` dont `/fleet`) ; O-2 **EXTRAITE de `ci.yml`** **exit 0** « header + 4 served note(s) … (34099 body
chars) » — **le fail-closed ne se déclenche PAS sur l'artefact réel** (13 `<script>` équilibrés, 0 `<noscript>`,
0 `<template>` — mesuré ; corps identique aux 34099 chars du G2). Tests touchés un à un : site-build-fleet **5/5**,
ci-gates **29/29**, no-cash **1/1**, export-public **2/2**, cra-b **6/6**. typecheck **0** ; gate:vocab **0** (177
fichiers) ; export:check DÉFAUT **0 hit** ; lang:gate DÉFAUT **0 hit** ; eslint fichiers touchés **0 erreur** ;
lint:ratchet **69/69** (aucune dette de typage différé ajoutée). Réseau : fetch fontes Google au `next build`
(item C-7 déclaré, `layout.tsx` NON touché) ; aucun autre accès sortant.

### 10.4 `error_origin` (récap G7)
- **C-G2-1** (sha ADR-M003) = **worker** ; **C-G2-3** (prose C-1) = **worker** ; **C-G2-4** (auto-contradiction PLI) = **worker**.
- **C-G2-2** = **SCINDÉ** : `if:` au niveau **JOB** = **classe préexistante de l'invariant CI** (g1/r25/g3-verification/g4/g6 la partagent ; g3-site en hérite ; aucune régression du lot) ; `if:` sur l'**ÉTAPE O-2** = angle non couvert de la **spécification C-5 (checkpoint-1)** (sa liste de mutants n'énumérait que « retirée / inversée »).
- **O-1/O-2/O-3** = **worker** (couverture perfectible : faiblesse de tripwire, trous de fixture) — **aucun faux-vert sur l'artefact réel** (mesuré), donc pas de régression de correction.

### 10.5 Items formés (déclencheur + propriétaire ; C-14, portés par l'orchestrateur, R-20)
7. **Job CI portant légitimement un `if:`** — l'invariant test 38 « aucun `if:` » bannit tout job/étape conditionnel
   (doctrine `ci.yml:3` « EVERY job is BLOCKING ») ; un futur job qui a réellement besoin d'un `if:`
   (p.ex. `if: github.event_name == 'push'`) passe par un **ADR** mettant à jour `ci_gates_blocking_no_continue_on_error`
   ET `g3_site_builds_then_asserts_fleet_html` ; déclencheur : premier job conditionnel envisagé ; propriétaire
   orchestrateur. (Aujourd'hui : **0 job avec `if:`**, vérifié `grep -E '^\s*if\s*:' ci.yml` ⇒ vide.)

### 10.6 Reste dû (pli G2) — zéro dette nue
Grep de vérification C-G2-4 (les trois formes : nom de clé d'env, domaine API, marque en mot entier ; insensible à la
casse ; + le mot marque nu) sur `docs/PLI-lot-ci-site.md`, `docs/PRODUCT-BOUNDARY.md` et l'addendum D9 octies
(`ADR-M003:116`) et l'amendement D7 ter (`ADR-M004`) = **0 hit** (mesuré). **HORS PÉRIMÈTRE, justifié (pas une dette)** : `docs/G2-lot-ci-site.md`
(artefact du RELECTEUR, qui CITE les littéraux pour NOMMER le défaut — comme un commentaire de garde cite ce
qu'il interdit) et `docs/adr/ADR-T1aii-*` / `ADR-B0-*` (docs du **lot Bell**, hors CI-site ; le fournisseur y est
autorisé, décision 69). Actions réservées à l'orchestrateur (R-20, non faites) : commit, fusion `--no-ff` après
`lot/narabi-ops-1b-i` (conflit `vocab-banned.json:111`, résolution par union) + rejeu `gate:vocab`, portage
CHANTIERS/JOURNAL, ajout du required status check `g3-site`.
