# G1 — Lot F-site-6 (Products & Fleet + VISAGE + Mod #1 panels + β Verdict)

## Gate 0 (R-1) — contrôle de résolution du modèle
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme ; **pas** `claude-opus-5`, banni).
- **Effort** : `max`. **Rôle** : worker Opus 4.8, IMPLÉMENTEUR mono-agent. **Ne committe pas, ne déclenche aucun workflow (R-20).**

## Provenance
- **Généré** : 2026-09-10, worker `claude-opus-4-8` effort max, contexte orchestrateur MONARK / référentiel Compliance G0–G7.
- **Worktree** : `F:\Monark-wt-fsite6`, branche `lot-fsite6`. **Base (merge-base)** : `855e61f` (F-site-1 shell + F-site-2 marques mergés).
- **Vérification** : toutes les affirmations d'ingénierie ci-dessous sont `[lu]` (lecture directe des fichiers/ADR cités, numéros de ligne portés). Aucun chiffre de seconde main. Sortie écrite pour vérification adversariale (R-21).
- **Advisor consulté** (outil intégré, 1×) avant écriture : corrections appliquées (self-contained data modules, retrait clause « signature verification » non ancrée, C-10 sur cartes produit, « (more details to come) » unique, mutants réels, R-25 three-dot). Détail infra.

## Topologie de branche (IMPORTANT pour l'orchestrateur)
- `HEAD` = `855e61f` (ma base ; aucun commit worker, R-20). `main` a **avancé** à `1eaf8a1` (**F-site-3 « Sim » mergé après le cut de ma base** : `apps/site/lib/sim.ts`, `lib/gate-enums.ts`, `components/gate-sim/*`, `docs/G1|G2-lot-fsite-3.md`, additions `test/ci-gates.test.ts`).
- `git merge-base main HEAD` = `855e61f` = ma base. **Mon lot est disjoint du sim** (aucun fichier commun ; je ne dépends pas de F-site-3, conforme au mandat « tu N'as PAS besoin du sim de F-site-3 »).
- **Conséquence R-25** : le compte CI three-dot (`origin/base_ref...HEAD`) mesure contre la merge-base `855e61f` ⇒ **mon lot seul** (voir §R-25). Un `git diff main` **deux-points** (tip = `1eaf8a1`) gonfle à tort le compte de ~1150 lignes (les fichiers F-site-3 apparaissent en suppressions). La fusion sera **propre** (fichiers disjoints) ; **CI à re-passer post-merge par l'orchestrateur**.

## Arbre des fichiers (11 fichiers, R-25 = 615 lignes vs base)
Créés :
- `apps/site/lib/visage.ts` (58) — registre VISAGE (3 artefacts, tous `upcoming`), **pure data self-contained** (déclare `VisageStatus` localement, aucun import de `./fleet`).
- `apps/site/lib/fleet-presentation.ts` (137) — `INSIDE` : les points « What's inside » (3 bâtis) / « What it will use » (8 agents + 5 produits + 3 visage), + `insideFor()` fail-closed. **Pure data self-contained**.
- `apps/site/components/what-inside.tsx` (28) — bloc Mod #1 rendu depuis `InsideBlock` ; statut = `block.kind` (jamais littéral) ; upcoming clôt par **un seul** « (more details to come) ».
- `apps/site/components/placeholder-panel.tsx` (86) — **UN** panneau générique data-driven (agents upcoming + visage) ; statut du registre.
- `apps/site/app/products/page.tsx` (70) — route `/products` (server) : 5 produits (`UpcomingPanel`) + 3 VISAGE (`PlaceholderPanel`).
- `apps/site/app/fleet/page.tsx` (113) — route `/fleet` (server) : 3 bâtis (panneaux réutilisés, contrats chargés server-side) + 8 agents upcoming (`PlaceholderPanel` + marques F-site-2).
- `test/visage-register.test.ts` (102) — test racine `visage_register_is_frozen` (C-7).

Modifiés (Mod #1 C-8, chacun +import + remplacement du bloc « Sourced bibliography » → `<WhatInside>`):
- `apps/site/components/shogen-panel.tsx`, `hikae-panel.tsx`, `ukemi-panel.tsx` (6 lignes ±/pièce).
- `apps/site/components/upcoming-panel.tsx` (+3) — ajout `<WhatInside block={insideFor(product.key)} />` (produits), `status={product.status}` inchangé (garde de consommation).

**Intouchés** : `apps/site/lib/fleet.ts` (registre gelé — byte-identique ; le set bâti et les invariants ne bougent pas), `schemas/`, `packages/`, `site-header.tsx` (la nav `/products` + `/fleet` **existe déjà** depuis F-site-1 — rien à faire).

## Sourcing Mod #1 « What's inside » (C-8) — chaque point Built → ligne ADR committée
Toutes les lignes ci-dessous sont `[lu]` dans les ADR du dépôt. Points = **techniques/algos/théorèmes** (pas de papier, 0 chiffre).

### Shōgen — ancré **ADR-M001 Décision 3** (`AttestedPrice`)
| Point rendu | Ancrage ADR (ligne [lu]) |
|---|---|
| Cryptographic attestation: a verified testimony, emitted only after a passing verdict | ADR-M001 **D3 L68** (« émis **uniquement après vérification `Ok(Verdict)`** — témoignage vérifié ») + **L86** (`attestor {identity, key: hex}[]`, minItems 1) |
| Recomputable byte hashing — anyone re-derives the same hash | ADR-M001 **D3 L69** (`octets_recalcules` **bool OBLIGATOIRE**) + **L89** (`utterance {hash: hex32}` — « hash = 32 octets, TOUJOURS ») |
| Named residual hypotheses: the transport assumptions, stated, not hidden | ADR-M001 **D3 L79-80** (« `residual` = **identifiants d'hypothèses résiduelles de transport** (registre des assumptions) ») + **L87** (`residual: string[]`, minItems 1, ordre porté) |

> **Point retiré/corrigé (per C-8 « ancrage M001 OU retrait »)** : la draft Mod #1 disait « Cryptographic attestation **& signature verification** ». Grep ADR-M001 `sign|signé|signer|signature` = seulement **L124** (« bit de **signe** » du ±0 float) et **L186** (« Commits **signés** », DevOps) — **aucune décision de vérification de signature**. Clause « & signature verification » **retirée** (non inventée) ; le point « Cryptographic attestation » reste, ancré L68/L86. (Je n'ancre PAS sur la copie du panneau existant « the attestor signed it » : sa source est G1-lot-F2b, pas une ligne ADR.)

### Hikae — ancré **ADR-M002 D3/D4** + **ADR-M001 D5** + **ADR-M003 D6.1**
| Point rendu | Ancrage ADR (ligne [lu]) |
|---|---|
| Conformal prediction (split-conformal calibration) | ADR-M002 **D3 L94** (« L1 : **split conformal** par classe de tâche ») + **L98** (`p=ceil((n+1)(1-alpha))`, `q̂`, `C(x)={y:s(x,y)≤q̂}`) + **L102-103** (validité **split-CP marginale** — Barber, Candès, Ramdas, Tibshirani 2020, Thm 2.1 p.5) |
| Finite-sample marginal coverage under exchangeability | ADR-M002 **D3 L107-108** (« Garantie déclarée : **marginale, échantillon-fini, sous échangeabilité** à l'intérieur de la classe ; pas de couverture conditionnelle ») |
| A closed gate policy that emits commit, defer, or abstain against the region and the budget | ADR-M001 **D5 L131-136** (`GateDecision {action: "commit"|"defer"|"abstain", …}`) + ADR-M003 **D6.1 L77** (« L3 : **COMMIT** si intention ∈ région et largeur ≤ τ, **DEFER** si largeur > τ, **ABSTAIN** sinon ») |
| Online monitoring of the remaining risk | ADR-M002 **D4 L113-114** (« D4 — L2 : **MONITEUR de risque restant** (mécanisme IM-OCP) » ; `r_t` statistique de monitoring) |

### Ukemi — ancré **ADR-M002 (noyau)** + **ADR-M003 D6.1** + **ADR-M001 D6**
| Point rendu | Ancrage ADR (ligne [lu]) |
|---|---|
| Network clearing fixed point (Eisenberg-Noe) | ADR-M002 **L188** (« Noyau : **vecteur de clearing Eisenberg-Noe** `p* = fix Phi(p) = (Pi^T p + e) ∧ p̄` — existence Thm 1, Tarski ») + ADR-M001 **D6** (`Prediction`, 4ᵉ contrat) |
| Fictitious-default sequence — each node pays what it can, in rounds | ADR-M002 **L189** (« algorithme **fictitious default ≤ n tours** ») + **L289** (test 19 `fictitious_default_le_n_rounds`) |
| Recovery rates for external and interbank assets, and contagion amplification | ADR-M003 **L46** (« **(α,β) Rogers-Veraart** dans `fictitiousDefault` ») + **L128** (test 36 `clearing_alpha_beta_regression_en`) + ADR-M001/M003 **D6**. *NB honnêteté : le point nomme la **technique** ; α,β sont **implémentés** (test 36) mais **non fondés empiriquement** avant Phase 2b (ADR-M003 L162) — aucune revendication de calibration.* |
| A conformal interval for the cascade, conformed by the gate | ADR-M003 **D6.1 L77** (conformeur **interval**, région `[ŷ−q̂, ŷ+q̂]`) + ADR-M002 **L184** (Ukemi = brique-moteur + cible régression que HIKAE conforme en `interval`) |

**Bilan C-8 : 11/11 points Built ancrés à une ligne ADR committée ; 0 point inventé ; 1 clause non ancrée retirée (Shōgen « signature verification »).**

## « What it will use » (upcoming) — sources
- **8 agents** : DESIGN-MODS-MONARK **Mod #1 L32-39** (investisseur 2026-09-09, noms de méthodes académiques autorisés) : Mokugeki (attestation docs/events + résidus), Narabi (redemption-run signals), Kaihi (LVR + toxicité, Glosten-Milgrom/VPIN), Kessai (TCA + implementation shortfall), Kamae (Avellaneda-Stoikov), Kyokusen (Nelson-Siegel), Koyomi (weekend-gap/thin-venue), Genkan (least-privilege dual control). Clôturés par **un** « (more details to come) ».
- **5 produits** : Mod #1 **L41** (héritent de leur agent-moteur) : Softlanding/Firebreak→Ukemi ; Warden→Genkan (uid 28b02686 « câblage δ Genkan-Safe ») ; Ballast→Kyokusen (uid 28b02686 « moteur = famille Kyokusen ») ; **Verdict→Mokugeki × Kamae** (décision β).
- **3 visage** : `what` = **restatement anglais fidèle** de la décision **memstack uid 28b02686** (traduit, non embelli) ; **aucun agent-moteur nommé** (la décision n'en assigne pas aux visage — seulement aux segments). « What it will use » = la description d'artefact + (pour The File) « the gate's decision ».

## β Verdict (décision 2026-09-10) — couche panneau UNIQUEMENT
Le point « What it will use » de MONARK Verdict nomme son moteur = **Mokugeki (attests the event) × Kamae (inventory quoting, Avellaneda-Stoikov)** (`fleet-presentation.ts` clé `verdict`, source décision β + Mod #1 L36). **`fleet.ts` reste inchangé** : le câblage Verdict y demeure **générique** (C-1 : « names NO engine agent ; sensor/act stay generic ») — le nommage β vit dans la **présentation/panneau**, jamais dans le registre gelé. Aucun test ne l'interdit dans la présentation ; le comportement C-1 de `fleet.ts` reste vrai.

## VISAGE (C-7) — registre + test
- **Copie & acheteurs** : décision investisseur **memstack uid 28b02686** (Attestation=**The File**, Hallmark=**The Seal**, Threshold=**The Trigger**), **PAS** les blurbs `CORE` du design (qui **inversent** le sens : le design appelle Threshold « the gate as a product » ; la décision = « The Trigger, index paramétrique déclenchant une créance »). Rendu hors `PRODUCTS` (préserve `PRODUCTS.length===5` + « 13 upcoming » ; `fleet_register_built_set_is_frozen` **reste vert**, prouvé §oracle).
- **Interprétation « compte global 16 » (D15/C-7) — rendue explicite et auditable (non devinée)** : `test/visage-register.test.ts` assert **les deux lectures**, re-dérivées des registres : (a) **upcoming global = 16** = 13 fleet-upcoming (8 agents + 5 produits) + 3 visage ; (b) le registre `fleet.ts` **reste 16 entrées** (11 agents + 5 produits). Le « 13 upcoming » du test existant est **inchangé** (fleet-only). Le « 16 » n'est **pas rendu** en copie (pas de contradiction avec « eight on the roadmap » / « 13 upcoming »).
- **Garde C-4 (numeric-hole)** : le test scanne **chaque chaîne rendue** de `visage.ts` **et** `fleet-presentation.ts` avec le détecteur test-44 (`scanText` de `honesty-lint.ts`) ⇒ 0 littéral numérique (les chaînes rendues via `{point}`/`{v.x}` échappent au lint AST ; ce scan ferme le trou).
- **Non-inertie** : le test assert `Object.keys(INSIDE)` = **exactement 19 clés** dérivées des registres (3 bâtis + 8 agents `name.toLowerCase()` + 5 `product.key` + 3 `visage.key`), et `kind` = built pour {shogen,hikae,ukemi}, upcoming pour les 16 autres.
- **Consommation** : les nouvelles surfaces (`products/page`, `fleet/page`, `placeholder-panel`, `what-inside`) ne codent **aucun** statut littéral (regex miroir de la garde F-2c).

## Choix douteux / tensions résolues (aucune dette nue, P5)
1. **Mapping produits design vs `fleet.ts`** : le design **inverse** (Softlanding↔Leverage/Firebreak↔Vault LP). **`fleet.ts` fait foi** (PLAN §2 + décision uid 28b02686) ⇒ je rends `PRODUCTS` tel quel, sans porter l'inversion du design. **Résolu** (correction d'erreur design sur fait lu).
2. **Picker 8 profils** : **hors lot** (F-site-4 / Home, per contrat). La page Products rend les **5 produits + 3 visage** (chaque cible du picker existe en panneau ici, mapping E-1). Copie intro **réécrite** sans « eight profiles » ni « its panel is complete » (C-10). **Résolu.**
3. **Mod #1 — agents upcoming ouvrables** : le design rend les 8 agents upcoming en `div` **non ouvrables** ; Mod #1 exige un bloc « What it will use » **par agent/panneau**. **Déviation assumée** : les 8 agents deviennent des `PlaceholderPanel` **ouvrables** (cohérent avec le patron `UpcomingPanel` déjà établi pour les produits). Fidélité de section préservée (mark + name + line + badge Upcoming). **Documenté**, pas une dette.
4. **Kanji (design AG)** : **omis** — précédent de l'app (les cartes bâties `AgentCard` et `/roadmap` n'en portent aucun) ; l'inclure créerait une incohérence bâti/upcoming. Présentation non sourcée, non contractuelle. **Choix documenté** (fidélité vs cohérence app), pas une dette.
5. **C-10 (pas de pastille « Built » sur un nœud de câblage)** : je **réutilise** `UpcomingPanel` tel quel (déjà C-10-safe, « exactly ONE status signal ») ; je **ne porte pas** `s.engineStatus` du design. **Résolu.**

## Oracle (exécuté depuis `F:\Monark-wt-fsite6`, exit codes authoritatifs)
| Commande | Résultat |
|---|---|
| `npm ci` | exit **0** (node v24.15.0, npm 11.12.1) |
| `npm run ci` (gate:vocab && typecheck && test) | exit **0** — **101/101 tests pass** (dont `visage_register_is_frozen`, `fleet_register_built_set_is_frozen`, `frozen_contract_fields_stay_dynamic`, test 44 `site_renders_only_committed_data (b)`, `vocab_site_confidence_exemption`, `no_coverage_level_alpha`) |
| `npm run gate:vocab` | exit **0** — 76 fichiers, no forbidden claim |
| `npm run lint` (eslint) | exit **0** |
| `npm run lint:ratchet` | **92/92** (plafond committé) |
| `cd apps/site && npx next build` | exit **0** — « Compiled successfully » ; `/products` + `/fleet` **prerendered static** |
| `node scripts/lang-gate.mjs --scope site` | exit **0** — 0 hit français (scope site GATED) ; tous scopes 0 |
| `node scripts/grep-forbidden.mjs` | exit **0** |
| `git diff <base 855e61f> -- schemas/ packages/` | **0 octet** |

### Mutants (preuve load-bearing, exit + sha256 avant/après)
- **Mutant A (VISAGE flip)** : `visage.ts` attestation `upcoming`→`built` ⇒ `visage_register_is_frozen` **ROUGE** (`AssertionError: visage MONARK Attestation must be upcoming`), exit **1**. Restauré ; **sha256 identique** (`169e04e1…d2d7d86` avant == après).
- **Mutant B (numeric-hole)** : injection « 72 » dans un point de `fleet-presentation.ts` ⇒ **ROUGE** (`AssertionError: a visage/presentation string carries a rendered numeric literal: ["72"]`), exit **1**. Restauré ; **sha256 identique** (`f6121e95…07cde7` avant == après).

## R-25 (borne 1205 ; three-dot / merge-base)
- **Compte** : `git diff --shortstat 855e61f` (merge-base = ma base, = CI three-dot) ⇒ **11 fichiers, 606 insertions + 9 suppressions = 615 lignes changées** < 1205. **Chaque fichier < 1205** (max `fleet-presentation.ts` = 137). **Aucun split nécessaire.**
- **Docs G1/G2 exclus** du compte (pathspec CI). *(Le `git diff main` deux-points donnerait 1767 à tort — artefact du tip `main`=`1eaf8a1` en avance ; voir §Topologie.)*
- **À RE-MESURER par l'orchestrateur sur la PR** (une fois committé ; `main` a déjà bougé une fois pendant ce lot, il peut rebouger) — commande CI-équivalente **three-dot vs `origin/main`** :
  ```
  git diff --shortstat "origin/main...HEAD" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude)package-lock.json'
  ```
  Le three-dot part de la merge-base (`855e61f`) ⇒ mesure mon lot seul, quel que soit l'avancement de `main`. Attendu : **615** (fichiers disjoints du sim).

## error_origin
- **Assigné au G7 (orchestrateur)**, per AgileGates. Côté implémentation, aucune erreur d'origine identifiée : les tensions design/registre sont des **corrections d'erreur du design sur fait lu** (mapping, CORE inversé) ou des **déviations Mod #1 documentées** (agents ouvrables), pas des défauts d'implémentation.

## Reste dû (P5) : néant
Aucune dette nue. Tension éventuelle signalée à l'orchestrateur : **fusion post-merge** (main a avancé, F-site-3 mergé) — fichiers disjoints, fusion attendue propre, **CI à re-passer par l'orchestrateur** (seul committeur, R-19/R-20).
