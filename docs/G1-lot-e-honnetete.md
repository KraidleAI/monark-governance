# G1 — Lot E-honnêteté (ADR-EC D1, régime site T0)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M context), effort `max`. Worker du lot E-honnêteté, orchestration `claude-fable-5-1`. R-20 respecté : aucun commit, aucun workflow déclenché.

**Base / branche** : worktree `F:\Monark-wt-ehonnetete`, branche `lot/e-honnetete`. Au démarrage HEAD = `3f69ef6` (= `lot/etude-suite`). Pendant la session `lot/etude-suite` a avancé de **11 commits docs-only** (T-1a-ii : bell/Helius/CRA/ADR-EC/CHANTIERS ; **aucun code/test/ci.yml**, aucun chevauchement de fichier avec le lot). `git merge --ff-only lot/etude-suite` exécuté → HEAD = `ac04d41`, mes 11 éditions préservées, CI re-vérifiée verte. Base de mesure R-25 = merge-base `3f69ef6` (= mes éditions seules).

**Régime (ADR-M013)** : **T0** pour la copie de vitrine (README, `shogen-panel.tsx`, `fleet-presentation.ts`, `skills/`) — commit à préfixer `site[T0]` par l'orchestrateur. Les autres fichiers (ADR-M009, ADR-M018, `index.ts`, `lang-gate.mjs`, tests) sont des changements gouvernance/outillage/test régis par G0–G7, **pas** la vitrine. Aucune bascule T2 automatique : aucun registre ni contrat gelé touché, `49,1 %` **n'est pas un chiffre nouveau** (préexistant ADR-M002:166), aucune dépendance, aucune marque nouvelle.

**CA-11 (branchement / registre)** : **`apps/site/lib/fleet.ts` INTACT** — `git status` : 0 occurrence de `fleet.ts`. Aucun registre touché. Le champ `wiring` reste au lot W-1.

---

## 1. Fichiers modifiés — sha256(LF) · lignes

| sha256 (LF-normalisé) | lignes | fichier |
|---|---:|---|
| `af0da9c12f939e5855404361bf7238287687b1b72ea234b1068c46a6fd7a6034` | 204 | `README.md` |
| `41ff95c49637701559b244ff1a28549a492ece7c0b8529f271456793761badd6` | 94 | `apps/site/components/shogen-panel.tsx` |
| `b4458bb571943f1a56a860765f98a74cdeec67d0a7684ce9109d701457ab6d3a` | 144 | `apps/site/lib/fleet-presentation.ts` |
| `bf17b560745cfb450a5601c24e1ada54115bdfbdfd3dfedb78b548ea26ec1705` | 136 | `docs/adr/ADR-M009-aci-tracker.md` |
| `9f327be059ac11d11cd565463fe500a5588a84dc645eae8fea015ba662d39fbc` | 47 | `docs/adr/ADR-M018-regle-branchement.md` |
| `45dc11b5eab635043e18db91bab582de5fb256618ec41e63dd8eb9c9d2fd920e` | 34 | `packages/monark/src/index.ts` |
| `cbf280547595127e7292e811c4649924efd0fb7d5ec525825475d5839c775eef` | 316 | `scripts/lang-gate.mjs` |
| `c022c807f3393f76a68edcdba40e3a7781799866b8ed53c9bc2b662c22bbf71f` | 104 | `skills/monark/DEMO.md` |
| `0ce50c04f69bf77532988650a48799ca591d14920bf5519f736af00de31f85c5` | 78 | `skills/monark/SKILL.md` |
| `8a1eb05d2d3586fb1d4ada51e6b544f3e61e1a48eb4599ec60282ea8bd456a10` | 316 | `test/export-public.test.ts` |
| `744be1f6bb6c53886b92a757d0af456fd85bc9142391b18ef2467ef92c9604a4` | 134 | `test/public-surfaces-honesty.test.ts` (**nouveau**) |

Pinned-string check avant édition (test/ + apps/site/test/) : `passing verdict|Rust verifier|a verified testimony, emitted|verified price testimony|A **verified** testimony|verified testimony proves` → **0 hit** (aucun test ne fige une phrase éditée ; ADR-W1 n'avait vérifié que les jumeaux :36/:42).

---

## 2. E7 — six sites « verified » (C-2) : avant → après (verbatim court)

| Site | Avant | Après |
|---|---|---|
| `shogen-panel.tsx:51` | « A Rust verifier emits **a verified testimony only after a passing verdict**, then projects it » | « …emits **an attested testimony only after its own verdict passes**, then projects it » (fait vrai conservé, P1) |
| `shogen-panel.tsx:57` | « **A verified testimony** proves what was said, that its bytes hash as recorded, and that the attestor signed it. » | « **An attested testimony** proves what was said… » (`verified`→`attested` ; « proves » CONSERVÉ : prouve origine+octets+signature, borné par la phrase suivante « does not claim the price is true » ; « proves » n'est pas dans la liste bannie proven/certified/guaranteed) |
| `shogen-panel.tsx:63` | « residual hypotheses are exactly what is **not verified**. » | **INTOUCHÉ** (négation honnête) |
| `fleet-presentation.ts:33` | « Cryptographic attestation: **a verified testimony**, emitted only after a passing verdict » | « …: **an attested testimony**, emitted only after a passing verdict » |
| `README.md:48` | « attested perception (**verified price testimony**) » | « attested perception (**an attested price testimony — origin and bytes, never truth**) » |
| `README.md:111` | « **A verified testimony** (bytes + hash + named residual hypotheses). » | « **An attested testimony** (bytes + hash + named residual hypotheses) **— origin and bytes, never truth.** » |
| `README.md:112` | « **A verified testimony** of redemption flow (…). » | « **An attested testimony** of redemption flow (…) **— origin and bytes, never truth.** » |

Formulation de référence appliquée : « attested testimony — origin and bytes, never truth ». Jamais « proven » / « certified » / « guaranteed » introduits.

**C-11 vi — README:98** : « sensors (attest) → the gate: Hikae + MONARK B_t → **acts (execute)** » → « …→ **acts (execute · upcoming)** ». Couche act nommée **upcoming** (aucun outil n'exécute : SKILL.md:10 « gate never executes the named tool », D0 no-trade), sans chiffre ni promesse. (Jumeau `shogen-panel.tsx:47` « act (execute) » **corrigé au pliage post-G2 (C-1)** → « act (execute · upcoming) » — voir §11.)

---

## 3. Oracle racine négation-aware (C-1) — `test/public-surfaces-honesty.test.ts`

**Périmètre scanné** (scan brut ligne à ligne, whole-file) : `README.md` + `apps/site/**/*.{ts,tsx,md}` (sources) + `skills/monark/*.md`. **Exclus (déclarés dans le test)** : `test/` racine, `docs/`, README.md de package, `apps/site/test/` + `apps/site/data/`, et la sortie de build `.next/.turbo/node_modules/dist`. Scan **whole-file** (pas rendered-position seul) : la copie rendue de Narabi vit dans des `const` string `.ts` qu'un scan AST rendu manquerait — un surclaim dans une const doit rougir aussi.

**Détecteur** : `PROBATIVE = /(?<!\bnot )(?<!\bno )(?<!\bnever )\b(?:verified|proven|certified)\b/gi` — **négation-aware** (un token précédé de not/no/never est un désaveu honnête, reste vert ; ADR-W1 D3 a décidé de NE PAS bannir `\bverified\b` précisément pour « what is not verified » ; même idiome que `vocab-banned.json` scope `bell`). `/i` car la copie est mixed-case.

**error_origin** : ADR-EC C-1 nommait **3 négations** (`how/page:62`, `shogen-panel:63`, `DEMO.md:86`) ; il **sous-mesurait** le census `proven`/`certified` + commentaires de code (25 occurrences réelles, pas 3). Masque reconstruit **par mesure** (census case-insensible ci-dessous). `error_origin = orchestrator` (rédaction ADR-EC C-1).

### Masque FERMÉ (liste des spans licites, chacun multi-mots, non-vacuité testée)

Les **4 négations** sont couvertes par le lookbehind (non listées comme spans). Les **15 usages honnêtes NON-négation** sont un masque fermé, chacun blanchi avant scan, chacun asserté présent ≥1× (une entrée morte rougit) :

| Catégorie | Span (exact) | Site |
|---|---|---|
| code-comment | `verified against the real schemas` | `apps/site/app/integrators/page.tsx:15` |
| code-comment | `then return the verified` | `apps/site/lib/load-committed.ts:41` |
| code-comment | `proven present by the` | `apps/site/lib/fleet-presentation.ts:136` |
| code-comment | `proven identical by the root test` | `apps/site/lib/fleet.ts:16` |
| code-comment | `composition proven here` | `apps/site/lib/fleet.ts:157` |
| code-comment | `proven by test/narabi-live.test.ts` | `apps/site/lib/narabi-live.ts:15` |
| code-comment | `proven by test 3` | `apps/site/lib/narabi-live.ts:447` |
| code-comment | `proven by the register test` | `apps/site/lib/visage.ts:12` |
| provenance | `npm registry, verified` | `apps/site/COMPONENTS-PROVENANCE.md:9` |
| provenance | `environment" is proven` | `apps/site/COMPONENTS-PROVENANCE.md:33` |
| provenance | `` `latest` verified `` | `apps/site/COMPONENTS-PROVENANCE.md:51` |
| mechanism | `commit proven faulty` | `apps/site/app/token/page.tsx:68` (slashing : commit prouvé FAUTIF) |
| mechanism | `a proven fault pays` | `apps/site/app/token/page.tsx:73` (slashing) |
| mechanism | `proven by recomputing the frozen decision` | `apps/site/app/token/page.tsx:122` (watcher) |
| skill-test | `verified end-to-end by` | `skills/monark/DEMO.md:86` (→ **:89** après mon insertion 3 l. en §2) |

**Négations couvertes par lookbehind (positives, testées vertes)** : `what is not verified` (`how/page:62` + `shogen-panel:63`), `not certified` (`narabi-copy:20`), `never certified` (`narabi-live:471`).

**Adjudication DEMO.md:86** (→ **:89** post-insertion §2) : « This exact loop is recorded… re-driven and **verified end-to-end by** `test/byo-demo-probe.test.ts` ». Parle d'un **test qui vérifie le pipeline** de bout en bout → **licite** (ADR-M017 D3) → **gardé dans le masque**, non reformulé. (Masque par span, insensible au décalage de ligne.)

**Hors périmètre du scrub (dit dans le test)** : `test/` racine, `docs/`, README.md de package.

**Census case-insensible (recomputé, `grep -rniE`)** : 25 occurrences des 3 tokens sur le périmètre = 6 sites E7 corrigés + 4 négations (lookbehind) + 15 spans licites (masque). Résidu après correction+masque = **0**.

### Tableau des tests

| Test | Ce qu'il prouve |
|---|---|
| `public_surfaces_make_no_probative_claim` | Après masque (négation-aware + 15 spans licites), **0 surclaim probatif résiduel** sur README + apps/site + skills. `filesScanned ≥ 10`. Non-vacuité : chaque span licite présent ≥1× ; les 3 négations présentes et vertes. |
| `public_surfaces_make_no_probative_claim — scrub is load-bearing (synthetic mutants)` | `A verified/proven/certified testimony` → rouge (dont **synonymes** proven/certified, mode MAST « swap de synonyme ») ; un span licite ne blanchit pas un surclaim nu voisin (`proven by test 3 and the price is verified` → rouge) ; `exactly what is not verified` → vert. Régression permanente in-test du mutant fichier. |

### Tableau des mutants

| Mutant | Attendu | Mesuré | Restauration |
|---|---|---|---|
| **Nommé (fichier)** : restaurer `README:111` → « A **verified** testimony » | oracle ROUGE | **ROUGE** : exit 1, `fail 1`, survivant `README.md:111  verified` | restauré bit-exact ; sha256(LF) `af0da9c12f939e5855404361bf7238287687b1b72ea234b1068c46a6fd7a6034` **AVANT == APRÈS** ; oracle re-vert (2 pass) |
| Synthétiques (in-test, permanents) : `verified`/`proven`/`certified testimony` | rouge chacun | vert (assertions passent) | n/a |

---

## 4. Point 3 — skill/DEMO (ADR-M017 D3, scope `skills` = ADR-M006)

- **`SKILL.md`** : nouvelle sous-section « The `gate` envelope: `{prediction, params}`, and the optional `attested` intake » : `{prediction, params}` **reste valide** (tous deux requis, inchangés) ; prise **OPTIONNELLE** `attested: AttestedPrice` — « an attested price testimony (origin and bytes, never truth) » ; **seul `attested.residual` est filé** dans `verdict.residual` ; `attested` n'entre pas dans le calcul de couverture et **ne revendique aucune vérité** ; `attested.subject` doit être une URL committée pour le `task_class` (**concordance déclarée**, jamais re-dérivation à l'appel) ; **aucune liaison temporelle en P1** ; **BYO + `attested` = refusé** (classe libre sans sujet committé), jamais accepté en silence (ADR-M017 D2 C'-8). Aucune revendication `verified`/`proven`/`certified`/`live`/`probative` nue.
- **`DEMO.md`** : une phrase après la section 2 (`gate` BYO) : « `attested` is not part of this BYO loop: `gate` here takes only `{prediction, params}`. A bring-your-own call that carries an `attested` intake is refused in this phase — see `SKILL.md`. » Aucun exemple `attested` ajouté (une jambe BYO+attested est refusée, ADR-M017 D2).
- **`INTEGRATION.md`** : **non touché** — rien n'y est faux sur l'outil `gate` (install + classes servies seulement, aucune description d'enveloppe erronée). Déclaré tel quel.
- **Gates skill verts** : `gate:vocab` scope `skills` OK (156 fichiers scannés) ; `lang:gate` scope `skills` OK (0 hit).

---

## 5. Point 4 — E8 : retrait `MONARK_PHASE` (`packages/monark/src/index.ts`)

Bloc JSDoc (l.18-22) + `export const MONARK_PHASE = "2-integration";` (l.23) **retirés** (espacement propre : `*/` → blanc → `// Adapter surface`). `grep -rn MONARK_PHASE` (ts/tsx/mjs/js, hors node_modules/.next) : **aucun importeur** — seule autre occurrence = `docs/cartographie-p1/import-graph.mjs:125` (chaîne d'une **liste SYMBOLS de mesure**, pas un importeur ; sous `docs/`, hors périmètre). `typecheck` vert après retrait. Partage `index.ts` avec U-1b-b déclaré (U-1b-b se rebase) : rien à faire. **Note** : ADR-M019 D3 l.38 disait `MONARK_PHASE` « conservé » — **superseded** par ADR-EC E8 (retrait), décision plus récente et gouvernante.

---

## 6. Point 5 — C-11 i : `lang-gate.mjs` SCOPES + `sentinel` + `bell` + test 42

**Mesure AVANT** (source tree, `node scripts/lang-gate.mjs`) : lang-gate GLOBAL **vert, 0 hit dans TOUS les scopes** ⇒ `apps/sentinel` et `apps/bell` (alors classés `root`) portaient **0 français**. Volume français à traiter = **0** (bien sous le seuil de ~40 lignes ; aucune exemption ni correction de texte nécessaire).

**Modifications** :
- `SCOPES` (l.114) : `+ "sentinel", "bell"`.
- `classifyScope` : `apps/sentinel/** → "sentinel"`, `apps/bell/** → "bell"` (2 branches).
- Commentaire de doc des scopes étendu (sentinel exporté ; bell source non exporté).
- **test 42** (`test/export-public.test.ts`) : (a) scope export `+ sentinel` (apps/sentinel est exporté package-style, `APP_PACKAGE_DIRS`) ; (b) **nouvel appel source-tree** `--scope sentinel,bell` sur ROOT. Motif : **`apps/bell` N'EST PAS dans la whitelist d'export** (`APP_PACKAGE_DIRS`/`WHITELIST_DIRS`) — gater `bell` sur l'export serait un **faux-vert** (0 fichier → 0 hit) ; le vrai gate pour la source bell est l'arbre source. Non-vacuité : `apps/bell/src` + `apps/sentinel/src` ont des fichiers (anglais).

**Mesure APRÈS** : `node scripts/lang-gate.mjs --scope root,contracts,schemas,site,skills,sentinel,bell` → **exit 0**, `sentinel 0 hit [GATED]`, `bell 0 hit [GATED]`. Root inchangé (0). Aucun retrait de scope.

---

## 7. C-11 iv — ADR-M009:124 « 47 % » → « 49,1 % »

Ligne 124 : « P(B_t < 0) 35 % (t°=30) → **47 %** (t°=365) par bruit binomial **[abs]** » → « …→ **49,1 %** (t°=365) par bruit binomial **[abs]** (binomiale au bord, ADR-M002 l.166 ; CHANTIERS §E) ». **Source du 49,1 %** : `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md:166` verbatim « 35,3 %→**49,1 %** [abs] (le [abs] est la binomiale au **bord**, `p̂ = alpha` ; reproduit exactement) » ; item de correction consigné `docs/CHANTIERS.md §E l.78` (post-ff `ac04d41` ; « ADR-M009 l.124 « 47 % » → 49,1 % à la prochaine édition ») ; mon édition ADR-M009 cite « CHANTIERS §E » **sans numéro** (robuste au décalage). Le chiffre est donc **sourcé [abs] reproductible**, jamais de seconde main. « 35 % » laissé tel quel (périmètre du task = seul 47 %→49,1 % ; ADR-M002:166 porte « 35,3 % » — **item formé** §8).

---

## 8. Nouveau scope — ratification ADR-M018 D2 (décision investisseur 23, 2026-09-19)

Bloc daté **« Amendement D2 — 2026-09-19, ratifié par l'investisseur (décision 23) »** ajouté **en fin** de `docs/adr/ADR-M018-regle-branchement.md` (sha `a01d16e1…`). L'énoncé original de D2 (l.22 « sa sortie n'est consommée par aucun chemin servi ⇒ à requalifier au G2 de P1-b3 ») **n'est pas réécrit** — il est **cité comme périmé** (prémisse « Ukemi non consommé » fausse). Texte ratifié **verbatim ADR-M019 D3** (l.78-81). Cartographie citée : `docs/CARTOGRAPHIE-P1-2026-09-19.md` §2 l.62 (`cascade → gate` **CÂBLÉ (servi), vacue**) + §3 l.86 (ligne registre Ukemi). Mesure [lu] `fixtures/h5-e2e-trace.json` étape 4 `cascade-gate`. **Fait de carte** : `a3f85f4` (« décisions 21-25 … ADR-M018 D2 ratified ») ne touche QUE `CHANTIERS`+`ADR-EC` — le **fichier** ADR-M018 n'avait PAS le bloc ; mon amendement ne double donc rien. Effet : Ukemi reste `built` (ADR-M019 D4) ; `wiring` W-1 dira « abstains under_calib by construction ».

---

## 9. Sorties chiffrées des gates (toutes vertes)

| Gate | Commande | Résultat |
|---|---|---|
| baseline | `npm run ci` (avant édition) | 326 tests / 326 pass / 0 fail |
| `gate:vocab` | `npm run gate:vocab` | OK — 156 fichiers, 0 forbidden claim |
| `lang:gate` | `--scope root,contracts,schemas,site,skills,sentinel,bell` | OK — 0 hit ; sentinel/bell GATED |
| `typecheck` | `npm run typecheck` (`tsc --noEmit`) | rc=0 |
| `lint` | `npm run lint` (`eslint .`) | rc=0 |
| `lint:ratchet` | `npm run lint:ratchet` | **69/69** (oracle ajoute 0 au plafond) |
| `export:check` | `npm run export:check` | OK — 0 forbidden path, 0 French ; sentinel/bell GATED |
| suite complète | `npm run ci` (après édition, base `ac04d41`) | **328 tests / 328 pass / 0 fail** (326 baseline + 2 oracle) |
| **R-25** | `git diff --shortstat ac04d41` + exclusions exactes `ci.yml:52` (cumulatif lot, oracle tracké à `d44b656`) | **203** lignes (11 fichiers, 185 ins + 18 del) — bound 1205 ✔ (pré-fold : 201) |

**Note R-25 D9 septies** : la décision « docs exclus de R-25 » (décision 25, a3f85f4 / ADR-EC / CHANTIERS §E) **n'est pas encore dans `ci.yml`** (commande opérante inchangée, docs comptés) ⇒ 201 mesuré avec docs comptés ; hors-docs (ADR-M018 9 + ADR-M009 1) il serait ~191. Item d'implémentation §10.

**Re-lecture post-ff (`3f69ef6..ac04d41`, docs-only)** : `git diff` sur ADR-EC + CHANTIERS relu — la **ligne D1 E-honnêteté est INCHANGÉE** (C-11 i/iv/vi intacts). Ajouts non liés à mon lot : ligne « Lots E-coûteux » (CHANTIERS §A), ligne K-1 annotée « décision 22 », **nouvelle ligne U-1a-hard** (décision 21), item CRA (§E), amendement décision 21/25. Décision **23 = « M018 D2 ratifié »** (confirme le libellé de mon amendement §8). Base R-25 = HEAD `ac04d41` post-ff = **jeu d'éditions identique** au merge-base pré-ff `3f69ef6` (avance docs-only, disjointe).

**Fusion README ⇔ U-1b-a** : `git diff -U0 $(git merge-base HEAD lot/u-1b-a) lot/u-1b-a -- README.md` = **aucun delta README** sur u-1b-a vs merge-base ⇒ pas de conflit ; mes lignes (48/98/111/112) disjointes des lignes déclarées U-1b-a (17/39/105/176). Fusion auto propre.

---

## 10. Items formés avec déclencheur (zéro dette nue, P5)

1. **ADR-M019 l.4 et l.76** portent encore « amendement ADR-M018 D2 **proposé, à ratifier** » — désormais **périmé** (ratifié décision 23, §8). **Déclencheur** : fold G7 de l'orchestrateur (mettre « proposé, à ratifier » → « ratifié 2026-09-19 »). Non édité ici (coordinateur : « aucun autre changement de scope »).
2. **ADR-M009 « 35 % » vs ADR-M002:166 « 35,3 % »** : le task ne scopait que 47 %→49,1 % ; le t°=30 reste « 35 % » (arrondi) alors que la source [abs] porte 35,3 %. **Déclencheur** : prochaine édition d'ADR-M009 (même cadence que CHANTIERS §E « à la prochaine édition »).
3. **`shogen-panel.tsx:47` « act (execute) »** : **RÉSOLU** au pliage post-G2 (C-1, §11) → « act (execute · upcoming) ». (Était : jumeau non corrigé de README:98 ; error_origin orchestrateur, cadrage C-11 vi sous-mesuré.)
4. **R-25 « D9 septies » (docs exclus)** décidé (a3f85f4/ADR-EC/CHANTIERS) mais **absent de `.github/workflows/ci.yml`** (gate opérant compte encore les docs). **Déclencheur** : lot d'implémentation de D9 septies dans `ci.yml` (hors E-honnêteté ; observé en mesurant R-25).
5. **Rebase du lot** : `lot/etude-suite` a avancé de 11 commits docs-only ; ff-merge exécuté vers `ac04d41` (worktree à jour, mes éditions préservées, CI verte). **Déclencheur** : commit/intégration par l'orchestrateur (R-20 : seul lui committe).
6. **`docs/cartographie-p1/import-graph.out.json` + `import-graph.mjs:125` SYMBOLS périmés** : le retrait de `MONARK_PHASE` (§5) rend stales `import-graph.out.json` (liste encore `MONARK_PHASE`, census 1) et la liste SYMBOLS de mesure. **Déclencheur** : cartographie pré-release (ADR-EC D2) régénère les deux en contexte frais.
7. **lang-gate scope `bell` couvre `apps/bell/test/**`** : `classifyScope` route `apps/bell/**` → `bell` et `collectTextFiles` ne skippe pas `test/` — alors que le scope **vocab** `bell` (grep-forbidden) exclut `test/` **exprès** (tokens de contrôle négatif). `apps/bell` porte **0 français aujourd'hui**, mais `lot/t-1a` en vol (`F:\Monark-wt-bell`) ajoute des tests bell ; une chaîne française de **contrôle négatif** (ex. « aurait alerté », « prix de référence » — motifs bannis sentinel/bell) y rougirait l'appel source-tree du test 42. **Remède** : entrée fermée dans `scripts/lang-exempt.json` (motif de `release-public.test.ts:17`), **jamais un retrait de scope** (interdit par le task). **Déclencheur** : G2 de T-1a-ii — à signaler à l'orchestrateur maintenant, pas à la fusion.

Aucun « dû » nu. Aucune dette ouverte au sens de la règle Dettes.


---

## 11. Pliage post-G2 (gel `d44b656`, verdict APPROUVÉ-AVEC-CORRECTIONS)

Correction **C-1** du G2 (`F:\Monark\docs\G2-lot-e-honnetete.md`) pliée :
- **`apps/site/components/shogen-panel.tsx:47`** (T0) : « … → **act (execute)**. » → « … → **act (execute · upcoming)**. » — jumeau exact du diagramme README:98, mis en cohérence (aucun outil n'exécute : SKILL.md:10, D0 no-trade). **error_origin = orchestrateur** (cadrage ADR-EC C-11 vi sous-mesuré : nommait README:98 + board.tsx:84→E-registre, manquait ce jumeau ; le worker était resté dans le périmètre donné). Nouveau sha256(LF) `41ff95c4…`.
- **Balayage `execute` complet** (grep README + apps/site src + skills) — après fix, aucun autre **libellé de couche act « execute » nu** dans le périmètre E-honnêteté :
  - **Corrigés** : README:98, `shogen-panel.tsx:47` (« execute · upcoming »).
  - **Prose de patron conceptuel, licite (adjugé par le G2 §C-1, gardé)** : `README.md:16`, `apps/site/app/page.tsx:72`, `apps/site/app/roadmap/page.tsx:50` (« …acts that **execute** ») + `board.tsx:234` (« an act **executes** ») — description de l'architecture (3 rôles), pas un libellé de statut ; « · upcoming » y serait grammaticalement faux. **Item formé** (adjudication orchestrateur pour page.tsx:72/roadmap:50, non nommés au G2 ; déclencheur : passe honnêteté vitrine dédiée).
  - **`board.tsx:377` « 02 · acts · execute » (eyebrow) + :84 (Ukemi)** : **fichier d'E-registre** (ADR-EC C-11 vi, règle fichiers-disjoints) — **NON édité ici** (collision de scope). **Item formé** ; propriétaire **E-registre** ; déclencheur : correction board.tsx d'E-registre (aligner le libellé de couche act sur « upcoming »).
  - **Négations licites** : `DEMO.md:78-79`, `SKILL.md:3,:10,:33,:34` (« NOT permission to execute », « never executes »).

Réserve 8 du G2 pliée : le bloc **Amendement D2** d'ADR-M018 porte désormais **`error_origin = planificateur`** (prémisse « Ukemi non consommé » écrite AVANT la mesure P1 du tuyau `cascade → gate`). Nouveau sha256(LF) `9f327be0…`.

**Re-mesure post-fold** (arbre de travail, base `ac04d41`) : `npm run ci` **328/328** (rc=0) ; oracle racine `public_surfaces_make_no_probative_claim` **2/2** ; `lang:gate` scope `root,contracts,schemas,site,skills,sentinel,bell` **0 hit** ; `gate:vocab` **OK** (156 fichiers) ; **R-25 = 203** (+2 vs pré-fold 201) < 1205. **CA-11** : `fleet.ts` toujours intact. R-20 : aucun commit (fold en arbre de travail sur `d44b656`, l'orchestrateur committe).
