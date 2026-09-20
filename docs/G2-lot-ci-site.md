# G2 — RELECTEUR (revue adversariale) lot `CI-site`

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, contexte 1M), effort max. Instance séparée à contexte
frais — je n'ai PAS écrit ce code. R-20 : je ne committe pas, ne déclenche aucun workflow, aucune action
sortante. R-21 : rapport écrit pour être re-vérifié.

**Horloge** (`date -u`) : ouverture **2026-09-20 20:53:22 UTC** → clôture **2026-09-20 21:24:34 UTC**.
**Base** `c9e7b4b`, **HEAD** `03e7b6c`, worktree `F:\Monark-wt-cisite` (`lot/ci-site`).
**Rejeu offline** dans la copie jetable `F:\tmp\cisite\g2\build\` (`git archive 03e7b6c` + `npm ci`), jamais
dans `F:\Monark`, `F:\Monark-wt-cisite` ni sur `C:` (`TEMP/TMP=F:\tmp\cisite\g2\tmp`, cache `F:\cache\npm`).

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le lot est fonctionnellement solide : les 3 oracles bloquants marchent sur l'artefact RÉEL, tous les mutants
du worker rejouent ROUGE byte-exact, R-25=504 confirmé, la décision 69 ne fuit AUCUNE forme du fournisseur sur
l'arbre exporté, le README est honnête, le conflit C-11 est exactement celui déclaré. Les corrections sont
**non bloquantes** : 1 sha de provenance faux, 2 lapsus de prose C-1, 1 auto-contradiction de doc, et **1 trou
de couverture résiduel** (`if: false`) que la tâche a explicitement sondé. Aucune ne casse la correction du
code ni une affirmation de couverture du worker. Aucun critère de FAIL rencontré (aucun mutant-artefact
annoncé-rouge trouvé vert ; aucune forme fournisseur dans un fichier exporté ; aucun sha faux sur un fichier de
CODE ; `apps/site/lib/fleet.ts` ∈ kept).

### Déclaration réseau (contrainte)
`apps/site/app/layout.tsx:3` (UNTOUCHED par le diff, vérifié) importe `next/font/google` : le build **récupère
les fontes chez Google au build** (item connu **C-7**, `layout.tsx:12` le documente). J'ai buildé avec réseau
disponible ; un fetch de fontes Google a très probablement eu lieu (build vert requiert les fontes). `npm ci`
avec `--prefer-offline` sur cache chaud F: (« added 282 packages in 15s », aucun hit registre visible),
`NEXT_TELEMETRY_DISABLED=1`. **Aucun autre accès sortant.** = exactement le fait C-7 déclaré.

---

## Défauts numérotés

### C-G2-1 (provenance ; `error_origin` proposé : **worker**) — sha256 PLI faux pour ADR-M003
- **Fichier:ligne** : `docs/PLI-lot-ci-site.md` §1, ligne 27 (table sha256, entrée `docs/adr/ADR-M003-phase2-integration.md`).
- **Constat** : la table déclare `b62a77bf004f454da2eeaea2a09aa5670b73437295b7679325b676d867700471`. Le contenu
  COMMITÉ à `03e7b6c` mesure `270fae888206bf50437472515a219ba52e777b8a07515cbc80028772df49a817` (blob git
  `c34e459`, concordant avec l'en-tête du diff `index 7f1d908..c34e459`). La valeur déclarée ne correspond **ni**
  à la version commitée **ni** à la version antérieure (`c9e7b4b` = `a5255715…`) : c'est un sha fantôme.
- **Portée** : ADR-M003 est un DOC (exclu R-25) ; le CONTENU est correct (l'addendum D9 octies est bien présent).
  Défaut de **traçabilité** uniquement. Les 13 autres entrées sha (11 code + PRODUCT-BOUNDARY + ADR-M004)
  concordent EXACTEMENT (re-mesuré). Le checkpoint-2 (CA-9, recompute des sha) l'attraperait aussi.
- **Correction minimale** : remplacer le sha de la ligne ADR-M003 par `270fae88…`.

### C-G2-2 (trou de couverture résiduel ; `error_origin` proposé : **SCINDÉ** — job-level = classe préexistante de l'invariant CI ; **step-level O-2 = spécification C-5 (checkpoint-1)**) — `if: false` désactive silencieusement le job ou l'étape O-2, aucun test ne le tue
- **Fichier:ligne** : `.github/workflows/ci.yml` (job `g3-site`, lignes 129-152) + `test/ci-gates.test.ts`
  (`g3_site_builds_then_asserts_fleet_html`, test 38 `ci_gates_blocking_no_continue_on_error:40`) +
  `test/site-build-fleet.test.ts` (`g3_site_build_run_line_is_pinned`).
- **Constat (mesuré, mes mutants N1)** : ajouter `if: false` au **job** g3-site ⇒ `pass=33 fail=0` (SURVIVANT) ;
  ajouter `if: false` à l'**étape O-2** ⇒ `pass=33 fail=0` (SURVIVANT). Aucun des tests g3-site n'inspecte la
  clé `if:`. Test 38 ne garde QUE `continue-on-error` (scan `/^\s*continue-on-error\s*:/` sur tout le fichier —
  vérifié, il attrape bien un `continue-on-error` sur g3-site, RIEN pour `if:`).
- **Significativité** : GitHub compte un required check **SKIPPÉ comme PASSANT**. Dès que g3-site rejoint la liste
  fermée de required checks (**item ouvert C-2**), un `if: false` désactiverait la gate en restant VERT ; un
  `if: false` sur l'étape O-2 rend le job vert avec **zéro assertion**. C'est la même classe « déblocage
  silencieux » que test 38 mécanise pour `continue-on-error` — mais le skip par `if:` n'est pas couvert, et il
  est sans doute PIRE (skip d'un required = pass).
- **error_origin scindé** : (i) `if: false` sur le **JOB** = trou de CLASSE **préexistant** (g1/r25/g3-verification/
  g4/g6 le partagent tous ; g3-site en hérite ; le lot ne régresse AUCUNE couverture annoncée). (ii) `if: false`
  sur l'**étape O-2** = drop silencieux de l'étape MÊME que C-5 fut écrit pour protéger — la liste de mutants de
  C-5 (checkpoint-1:19) n'énumérait que « retirée / inversée » (toutes deux tuées) ; le skip par `if:` est un
  angle non couvert de **la spécification C-5 (checkpoint-1)**.
- **Atténuations** : (a) g3-site est « bloquant CONDITIONNEL » aujourd'hui (pas encore required). (b) Le risque
  est **borné par les items déjà formés** C-1 (premier run réel sur runner) et C-2 (required check) — il ne se
  matérialise qu'au run CI réel et/ou à la promotion en required.
- **Correction minimale** : dans le test C-5 (ou test 38), asserter que le bloc `g3-site` ne porte **aucune** clé
  `if:` (idéalement, classe entière : aucun job sous `jobs:` ne porte `if:`). ~2-3 lignes.
- Non bloquant (conditionnel, préexistant, borné par C-1/C-2), mais à corriger (zéro dette) puisque la tâche l'a
  explicitement sondé.

### C-G2-3 (fidélité C-1 ; `error_origin` proposé : **worker**) — 2 formulations « en CI » que C-1 interdit, dans du texte destiné à se propager
- **(a)** `docs/PLI-lot-ci-site.md:102` (bloc §8 CHANTIERS que l'orchestrateur PORTE verbatim) : «`next build`
  **branché en job CI** `g3-site`». C-1 impose l'état « branché **LOCALEMENT** ». (Le bloc porte bien «`bloquant
  (conditionnel)`», donc la moitié `bloquant` est correcte ; seul le `branché` dérape.)
- **(b) BORDERLINE** — `docs/adr/ADR-M003-phase2-integration.md:116` (TITRE de l'addendum D9 octies) : « **brancher
  `next build` en CI** ». Tension titre/corps : le corps dit correctement « Branché LOCALEMENT, jamais « en CI »
  (C-1/C-2) », et « brancher next build en CI » peut se lire comme « ajouter le job au fichier CI » (le validateur
  checkpoint-1 a accepté la formule du TITRE G0 « brancher `next build` (job CI `g3-site`) »). Contrairement à
  (a), ce n'est pas une affirmation d'ÉTAT. **Appréciation orchestrateur au G7** (ne pas sur-compter). (a)
  PLI:102 reste le défaut ferme (affirmation d'état destinée à CHANTIERS verbatim).
- Les deux contredisent l'état du code (`ci.yml` commentaire « Wired LOCALLY ») et la ligne PLI:34 (conforme).
  Les occurrences de « branché en CI » dans G0:150 / CHECKPOINT1:15,39 sont LÉGITIMES (elles citent la chose
  interdite pour l'interdire) — non concernées.
- **Correction minimale** : PLI:102 → «`next build` branché **LOCALEMENT** en job CI `g3-site`» ; ADR-M003:116
  titre → « ajouter `next build` au workflow CI (job g3-site, exécuté localement) ».
- Non bloquant (prose ; code correct), mais C-1 est une correction de classe bloquante ⇒ fidélité due, surtout
  pour le bloc destiné à CHANTIERS.

### C-G2-4 (exactitude de doc, auto-contradiction ; `error_origin` proposé : **worker**) — le PLI affirme que les littéraux de match décision-69 ne sont « pas recopiés en littéral » dans le PLI, mais ils le sont
- **Fichier:ligne** : `docs/PLI-lot-ci-site.md:87` affirme que les motifs « vivent UNIQUEMENT dans
  `test/no-cash-provider-name.test.ts` … Dans l'ADR-M003 D9 octies et ce PLI, ils sont décrits par forme … **pas
  recopiés en littéral** ». Or **PLI:42, PLI:66, PLI:84** recopient `\bmassive\b`/i, `polygon\.io`/i,
  `POLYGON_API_KEY` en littéral.
- **Portée** : **INOFFENSIF pour l'invariant de non-fuite** — `docs/` n'est pas exporté (mesuré : 0 fichier
  `test/` et 0 `apps/bell/` dans `kept` ; l'oracle décision-69 ne scanne que `kept`). L'invariant de sécurité
  tient (0 forme fournisseur dans tout fichier exporté — confirmé indépendamment). Le défaut est **la fausse
  affirmation** PLI:87 seule. À distinguer du « nom en prose » (Massive/Polygon dans CHANTIERS:41, G0 fait 16),
  adjugé LICITE par l'orchestrateur (docs non exportés).
- **Correction minimale** : corriger PLI:87 (reconnaître que les littéraux figurent dans les tables du PLI,
  licite car docs non exportés) OU retirer les motifs littéraux de PLI:42/:66/:84.
- Non bloquant.

### Observations mineures (non numérotées — signalées, corrections optionnelles)
- **O-1 (faiblesse de tripwire, démontrée par mon mutant N4)** : `fleet_page_renders_the_served_header`
  (`test/site-build-fleet.test.ts:80`) asserte `page.tsx.includes(FLEET_HEADER)`, satisfiable par le COMMENTAIRE
  JSX `apps/site/app/fleet/page.tsx:125` seul. **Mesuré (N4)** : retirer le `<div>` d'en-tête rendu (128-131) en
  gardant le commentaire ⇒ tripwire VERT + garde (6) VERTE, mais **O-2-sur-artefact ROUGE** « header absent ». La
  composition reste protégée par O-2 (les vraies dents). Durcissement optionnel : tripwire sur l'occurrence
  RENDUE (hors `{/* */}`). Non bloquant (O-2 couvre déjà).
- **O-2 (renderedBody = heuristique de strip)** : strippe `<script>` et `<!-- -->` mais **pas** `<noscript>`/
  `<template>`, et exige un `</script>` fermé. **Sur l'artefact RÉEL c'est sans effet** (mesuré : `<noscript>`=0,
  `<template>`=0, scripts équilibrés 13 ouverts / 13 fermés, le payload-note est un `<script>` NU). Résidu
  documenté : une note logée dans un `<noscript>`/`<template>` (non produit par Next aujourd'hui) serait une
  surface de faux-vert. Item candidat (strip aussi ces balises, ou parseur réel). Non bloquant.
- **O-3 (couverture de fixture — mes mutants N2/N3)** : N2 (retrait de la branche décimale `/&#(\d+);/g` de
  `decodeEntities`) SURVIT — aucune fixture/artefact n'exerce une entité purement décimale (la fixture
  `site-build-fleet.test.ts:77` `&#39;` est aussi captée par la règle nommée `&#39;` ; l'artefact réel n'a que de
  l'hex `&#x27;`, décimal mesuré = 0). N3 (retrait de `[^>]*` de la regex `<script>`) survit sur l'artefact
  (payload-note = `<script>` NU ; les 10 scripts attribués ne portent aucune note). Faux-verts **absents sur
  l'artefact réel** — simples trous de fixture, non bloquants.

---

## Tableau des mutants

### Mutants du worker (rejoués — attendus ROUGE), restauration **byte-exacte** (jamais `git checkout`)
| Mutant | Cible | Attendu | Mesuré (G2) | Restauration |
|---|---|---|---|---|
| M-build | `const _t: number = "…"` dans `apps/site/app/fleet/page.tsx` ; `next build` | ROUGE | build exit 1, `page.tsx(57,9) TS2322: Type 'string' is not assignable to type 'number'` | sha == base ✔ |
| M-O2d (artefact) | note cassée dans le CORPS, gardée dans le payload `<script>` | ROUGE | O-2 exit 1 « 1 served note absent » ; **raw file `includes` note = TRUE** (payload ne sauve pas) | sha == base ✔ |
| M-O2a header (artefact) | en-tête cassé dans le corps | ROUGE | O-2 exit 1 « header absent » | sha == base ✔ |
| M-O2a note (artefact) | note cassée partout | ROUGE | O-2 exit 1 « 1 served note absent » | sha == base ✔ |
| O-2 fail-closed | `fleet.html` absent | ROUGE | O-2 exit 1 « FAIL-CLOSED — … not found » | — |
| M-C5 retrait étape O-2 | `ci.yml` g3-site | ROUGE | 3 tests rouges (builds_then_asserts + run_line + derived_paths) | sha == base ✔ |
| M-C5 ordre inversé | build/O-2 permutés | ROUGE | `g3_site_builds_then_asserts` rouge (buildIdx<o2Idx) | sha == base ✔ |
| M-C1-runline | ligne `run:` build corrompue | ROUGE | `run_line_is_pinned` + `builds_then_asserts` rouges | sha == base ✔ |
| continue-on-error | `continue-on-error: true` sur g3-site | ROUGE | test 38 rouge | sha == base ✔ |
| timeout retiré | `timeout-minutes` retiré | ROUGE | `ci_jobs_have_timeout` rouge | sha == base ✔ |
| M-O2b / M-O2c (in-test) | vacuité / `&#x27;` décodage | ROUGE/VERT | couverts par `fleet_html_assertion_is_sound` (vert) | — |
| M-42f′ (in-test) | commentaire col-2 dans r25 / octet retenu modifié | ROUGE | `export_public_derived_jobs_are_byte_identical` vert (mutants internes rouges) | — |
| **M-vocab-sentinel** (rejoué G2, fichier réel) | « adaptive coverage » ajouté à `apps/sentinel/README.md` | ROUGE | `gate:vocab` **exit 1** « FORBIDDEN VOCAB README:49 … surclaim » (README bien dans le scope) | sha == base ✔ |
| **M-dec69** (rejoué G2, fichier réel) | `polygon.io` ajouté au README (fichier EXPORTÉ) | ROUGE | `no_cash_cross_provider_name_in_export` **exit 1 ✖** (l'oracle mord sur un vrai FICHIER exporté) | sha == base ✔ |

### Mes 4 NOUVEAUX mutants (de mon cru)
| # | Mutant | Résultat mesuré | Verdict |
|---|---|---|---|
| **N1** | `if: false` sur le JOB g3-site **ET** sur l'étape O-2 | **pass=33 fail=0 (SURVIVANT ×2)** — aucun test n'inspecte `if:` | **→ C-G2-2** (trou réel) |
| **N2** | retrait de la branche décimale `/&#(\d+);/g` de `decodeEntities` | SURVIVANT — fixture `&#39;` captée par la règle nommée ; artefact décimal=0 | → O-3 (trou de fixture, pas de faux-vert artefact) |
| **N3** | regex `<script>` sans `\b[^>]*` (nu seulement) | SURVIVANT — payload-note = `<script>` nu ; 10 scripts attribués sans note | → O-3 (trou de fixture) |
| **N4** | retrait du `<div>` en-tête rendu (128-131), commentaire :125 gardé, rebuild | tripwire VERT + garde(6) VERTE, **O-2-artefact ROUGE** « header absent » | → O-1 (faiblesse tripwire ; O-2 couvre) |

### Contrôles (timeout=21 en plus)
`timeout-minutes: 21` sur g3-site ⇒ `ci_jobs_have_timeout` ROUGE (borne ≤20). Contrôle non-muté : O-2 vert
(34099 body chars) ; 42 tests touchés verts.

---

## Oracles exécutés (un à un, copie `F:\tmp\cisite\g2\build\`, **jamais `npm run ci`**)
| Oracle | Résultat |
|---|---|
| `npm ci` (`--prefer-offline`, cache F:) | exit 0, 15 s, 282 pkgs (cache chaud) |
| `next build` via ligne `run:` **EXTRAITE** de `ci.yml` | exit 0, 19,4 s, `fleet.html` 61163 o, 13 pages `○ Static` dont /fleet |
| O-2 **EXTRAITE** de `ci.yml` (`node scripts/assert-fleet-html.mjs`) | exit 0 « header + 4 served note(s) present … (34099 body chars) » (CA-11) |
| `typecheck` (`tsc --noEmit`) | **exit 0** (TSX site invisible du tsc racine ; `.mjs`→`.ts` via `.d.mts`) |
| tests touchés `site-build-fleet`+`no-cash-provider-name`+`ci-gates`+`export-public`+`cra-b` | **42/42 pass, 0 fail** (dont 42(f′), decision-69, run-line, ordre, README-kept, product-boundary) |
| `gate:vocab` | exit 0 — 177 fichiers, README sentinel inclus, propre |
| `lint` (eslint) | exit 0 |
| `lint:ratchet` | 69/69, exit 0 |
| `export:check` (défaut) | exit 0 — 0 chemin interdit, 0 hit FR ; scope sentinel GATED propre |
| `lang:gate` (défaut) | exit 0 — 0 hit FR |
| `public-surfaces-honesty`+`no-secret-in-repo`+`skills` | **8/8 pass** (README passe `public_surfaces_make_no_probative_claim` ; `POLYGON_API_KEY` sans valeur ne trippe pas la garde de secret) |

## Décision 69 — recoupement indépendant
- Oracle `no_cash_cross_provider_name_in_export` : VERT. Base = **0 hit** sur `collectFiles(ROOT).kept`.
- `git grep` indépendant des 3 formes sur tout l'arbre suivi (hors le fichier de test) → classées par
  appartenance à `kept` : **TOUTES privées, 0 KEPT** :
  - mot entier `massive` (toute casse) : hits en `apps/bell/**` (non exporté), `docs/**` (non exporté),
    `test/no-secret-in-repo.test.ts` (`test/`, non exporté). **0 exporté.**
  - `POLYGON_API_KEY` : `apps/bell/**`, `docs/**`, `test/no-secret-in-repo.test.ts`. **0 exporté.**
  - `polygon.io` : `apps/bell/**`, `docs/**`. **0 exporté.**
- `apps/bell/` dans `kept` = **0** (confirmé non exporté). Le nom en PROSE des docs = adjugé licite (docs non
  exportés).
- **Faux positifs de `\bmassive\b` sur l'arbre exporté : 0 (mesuré).**
- `vocab-banned.json` / le nom : le fichier est EXPORTÉ (∈ kept) ⇒ le mécanisme « test racine non exporté » est
  correct (y écrire le nom le publierait) — confirmé.

## R-25
`git diff --shortstat c9e7b4b...03e7b6c` avec la pathspec `STAT=` de `ci.yml:65` (docs `.md`, lockfile, séries
data exclus) = **11 fichiers, 503 insertions + 1 suppression = 504 lignes changées** — **= 504 annoncé au PLI**,
**sous 1 205**. Fichiers comptés : `ci.yml`, `apps/sentinel/README.md`, `assert-fleet-html.{mjs,d.mts}`,
`export-public.{mjs,d.mts}`, `ci-gates.test.ts`, `export-public.test.ts`, `no-cash-provider-name.test.ts`,
`site-build-fleet.test.ts`, `vocab-banned.json`. Docs (PRODUCT-BOUNDARY, ADR-M003/M004, PLI) exclus. L-5 retiré
(décision 77) ⇒ pathspec `STAT=`/`NON_SERIES_GLOB` INCHANGÉE (vérifié : le diff ne touche pas `ci.yml:65`).

## Autres vérifications
- **sha256** : 13/14 entrées PLI §1 concordent EXACTEMENT ; seule ADR-M003 est fausse (**C-G2-1**).
- **`layout.tsx` non touché** : confirmé (`git diff --name-only` vide) ; toujours `next/font/google` (item C-7).
- **C-6** : le workflow PUBLIC dérivé exécute `npm run build -w @monark/site` — les 3 entrées critiques
  `apps/site/lib/fleet.ts`, `apps/site/app/fleet/page.tsx`, `apps/site/package.json` sont **∈ kept** (77 fichiers
  `apps/site/**` exportés) ; `assert-fleet-html.mjs` ∈ kept, son `.d.mts` correctement ABSENT ; 0 `test/` exporté.
  Le public build a ses entrées. Non-défaut.
- **42(f′)** : `export_public_derived_jobs_are_byte_identical` VERT ; **5** corps de job retenus (g1,
  g3-verification, g4, g6, g3-site) sauf r25 ; mutants internes (commentaire col-2 r25 ⇒ 42(f′) rouge / 42(f)
  vert ; octet retenu modifié ⇒ rouge) verts.
- **Conflit `lot/narabi-ops-1b-i`** (`git merge-tree --write-tree`, lecture seule) : **UN SEUL** fichier en
  recouvrement = **`vocab-banned.json`** (CONFLICT content, ligne 111 `scan.sentinel.files`) — narabi-ops y
  ajoute 4 chemins probe, CI-site y ajoute `apps/sentinel/README.md` ; résolution par UNION des deux ajouts, puis
  rejeu `gate:vocab` (orchestrateur, R-20). narabi-ops **ne touche PAS** `ci.yml`/`assert-fleet`/README. = **C-11
  exactement**. Fusion CI-site APRÈS narabi-ops (décision 77).
- **C-1/C-2** : « bloquant » = CONDITIONNEL (g3-site pas dans les required checks) — correct dans `ci.yml` et
  ADR ; items C-1 (premier run réel) et C-2 (required check) ouverts, propriétaire orchestrateur.
- **Balayage « bloquant/blocking »** (moitié C-1/C-2 de l'exigence de qualificatif) : tous les hits SPÉCIFIQUES à
  g3-site portent « CONDITIONAL/conditionnel » (`ci.yml:135-136`, `PLI:35,93,104`) ; les hits non qualifiés sont
  l'invariant GÉNÉRAL (« EVERY job is BLOCKING », `ci.yml:3`), des labels de correction (« C-1..C-5 bloquantes »),
  un nom de test (`ci_gates_blocking_no_continue_on_error`) ou du texte pré-existant — aucun n'affirme g3-site
  bloquant inconditionnel. **Moitié « bloquant » propre** ; seul le « branché en CI » (C-G2-3) dérape.
- **`r25` hors job r25 (42(f))** : dans `ci.yml` de gouvernance, `r25` (minuscule) n'apparaît qu'en `:13`
  (commentaire d'en-tête, retiré à la dérivation) et `:34` (clé du job r25) ; le job g3-site n'en porte AUCUN.
  Workflow dérivé : count `/r25/` = **0** (42(f) satisfait), trigger `push` présent, g3-site conservé.
- **Artefact** : 4 notes `built` INDÉPENDANTES (0 paire sous-chaîne mesurée) ; en-tête + 4 notes dans le CORPS ;
  payload RSC = 1 `<script>` nu portant l'apostrophe littérale.

## error_origin proposés (récap pour le G7)
- Trou fonctionnel initial « `next build` absent de CI » : **orchestrateur** (formé checkpoint-2 E-registre) — inchangé.
- C-G2-1 (sha PLI ADR-M003) : **worker**. C-G2-3 (prose C-1) : **worker**. C-G2-4 (auto-contradiction PLI) : **worker**.
- C-G2-2 (`if: false`) : **classe préexistante de l'invariant CI**, héritée par g3-site (pas une régression du lot).
