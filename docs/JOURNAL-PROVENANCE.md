# Journal de provenance — MONARK

Exigence : P4/R-9 (référentiel doc 02) ; assise NIST SSDF 800-218/218A, AI Act, CRA. **Une entrée par lot de
code généré.** Un artefact sans entrée ne s'intègre pas.

| Date | PR/commit | Modèle (identifiant épinglé exact) | Effort | Contexte fourni | Générateur (agent) | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-04 | Phase 0 — commit **`357ef25`** (main, local-only ; commité par l'orchestrateur `claude-fable-5-1`, R-20) | `claude-opus-4-8` | max | ADR-M001 + ROADMAP-MONARK + ADR-CERT-MONARK + VERDICT-TASKCLASS-GROK + HERMES-FONDEMENTS + sources Shōgen/Grok | worker (session, Opus 4.8) | G2 (worker Opus 4.8 distinct, contexte frais) | **approuvé-avec-réserves** |

## Lot Phase 0 — squelette & gel des contrats (`F:\Monark`)

### Gate-0 (R-1) — contrôle du modèle résolu
- **Worker** : modèle résolu **`claude-opus-4-8`** (sélection investisseur via `/model` cette session, confirmée
  par la sortie `/model`), effort **`max`**. Préfixe conforme au roster (Opus 5 **banni**).
- **Divergence de roster nommée (C13, NON résolue — flag investisseur)** : l'orchestrateur/planificateur de
  session est **`claude-fable-5-1`** (Fable 5.1, id catalogue courant listé par l'environnement, sélectionné par
  l'investisseur via `/model`) ; le `CLAUDE.md` et les définitions d'agents (`validateur-humain`, `advisor`)
  épinglent encore **`claude-fable-5`**. **Roster scindé sur deux versions Fable.** Les deux passes validateur ont
  résolu `claude-fable-5` (leur épinglage). Propagation de la currency aux fichiers **maintainer-owned** = décision
  investisseur, **en attente**. Question formée à porter au prochain contact investisseur.

### Consultations
- **Advisor (canal intégré, Fable 5)** — **pré-gel** : 2 **bloquants-gel** (#1 objet-frontière Shōgen ; #2 verdict
  polymorphe) + 5 **cautions** (#3 champs Grok = input ; #4 le prédicteur n'a pas de contrat ; #5 `FORBIDDEN_KEYS`
  invariant ; #6 langage = décision G0 ; #7 emplacement dépôt). Tracés dans ADR-M001 (en-tête). **Post-build** :
  7 points (schémas jamais exécutés → `ajv` dev-dep + test ; journal de provenance ; R-13 TODO ; `-0` dans
  `calibDigest` ; ligne ADR stale ; G2 worker-pinned ; ligne de handoff) — **tous adressés**.
- **Validateur-humain (Fable 5, `claude-fable-5`) — checkpoint 1** : **ACCEPTE-AVEC-CORRECTIONS**, liste fermée de
  14 items (C1-C14) → intégrés → **quick-verify OK (14/14 PASS)**. C13/C14 = non-escalade (C13 « sous réserve » :
  question investisseur formée, ci-dessus).

### Grok comme INPUT DE CONCEPTION (jamais lifté — licence/marque Grok)
Le code MONARK est **le nôtre**, réimplémenté. Fonctions dont la **forme** a inspiré (ancrage
`Downloads/grok 1/src/lib/hac-cp.ts`, **non copié**) :
- `CoverageVerdict`/`GateDecision` (formes L22/L46) → nos types, **étendus** : région polymorphe `set|interval`,
  `calib_digest`, taxonomie `reason` amont/aval, `schema_version`.
- `FORBIDDEN_KEYS` (L77) + `hasForbiddenKey` **récursif** (L551) → notre `findForbiddenKey`/`assertNoForbiddenKey`,
  **avec suivi de chemin ajouté** ; on reprend la **récursion** (pas le `serializeVerdict` racine-seule L541).
- `serializeVerdict` (L541) → nos `serialize*` **par contrat**, couplés au closed-check.
- discipline « pas de `p_correct` » / `calibDigest` → réimplémentés ; l'encodage float64-BE + normalisation `-0`
  est **notre** spec.

### Réductions & compléments documentés (vs ADR-M001 D2/D8)
- **`ajv`/`ajv-formats` = dev-dependencies (test-only)** — conforme à D2 (qui les nomme) : exécutent les 4 schémas
  gelés (compile + `$ref` + rejets C4). **Runtime = zéro dépendance** (closed-check hand-rolled = clé-fermeture ;
  contraintes de valeur dans le schéma, exercées par ajv en test). R-8 : `typescript@7.0.2`, `@types/node@24.13.3`,
  `ajv@8.20.0`, `ajv-formats@3.0.1` — versions registre vérifiées **avant** installation ; lockfile committé.
- **Différés à la passe DEVOPS** (D8) : `eslint` (`tsc --strict` + gate vocab tiennent lieu) ; SHA-pinning des
  actions CI + commits signés (avant tout remote).

### Oracle d'exécution (G3/G4/G6) — CI locale verte
`npm run ci` = **gate:vocab** (11 fichiers, 0 claim interdit) → **typecheck** (`tsc --noEmit`, strict) → **41 tests**
(`node:test`) **pass, 0 fail**. Inclut : rejet récursif des clés interdites ; refus des clés inconnues à chaque rang
(`CleInconnue`) ; **exécution des 4 schémas gelés** par ajv (rejets C4 : minItems, uniqueItems, hash 63c, caractère
de contrôle, résidu vide/dupliqué, `oneOf` région) ; déterminisme `calib_digest` + oracle cross-langage `[0,1]`.

### `error_origin` — assigné au G7 (2026-09-04, orchestrateur `claude-fable-5-1`)
**Origine de toutes les erreurs relevées en Phase 0 = le GÉNÉRATEUR (worker Opus 4.8)** — aucune n'a échappé au
livrable gelé ; toutes attrapées par les gates **avant** clôture :
- (i) **Planification** (checkpoint 1, corrections C1-C14) : 3 champs Shōgen omis silencieusement ; fuite de l'union
  set|interval dans `GateDecision.intent` ; `calib_digest` sans algorithme ; G2/MAST non nommés ; id de roster
  incohérent ; pas de `schema_version`.
- (ii) **Implémentation** (advisor post-build) : schémas jamais exécutés ; journal de provenance absent ; TODO nu
  (R-13) ; trou de canonicité `-0` ; ligne ADR périmée.
- (iii) **Outillage** (oracle) : interop CJS vs `verbatimModuleSyntax` ; `allowUnionTypes` ajv ; littéral de test
  caractère-de-contrôle ; runner dir-vs-glob.
**Aucune erreur d'origine source** (Shōgen/Grok) **ni réviseur.** Détection : validateur (i), advisor (ii), oracle
non-LLM (iii), G2 (M1-M8). Le système de gates a fait son travail : premiers jets défectueux, défauts attrapés.

### Verdict G7 (2026-09-04, orchestrateur `claude-fable-5-1`) — **ACCEPTÉ**, conditionnel au checkpoint 2
**R-21 reproduit, pas cru** : oracle re-exécuté à frais (vocab OK · `tsc --strict` · 41/41 · exit 0) ; réserves G2
prouvées sur artefact (M3 `enums.ts` + test de dérive ; M4 test end-to-end ; R1 ratifiée, source ≡ copie dépôt
par md5 ; R-13 = 0 TODO) ; R-20/C14 (38 staged à la R-21, **39** après persistance de la revue G2 · 0 commit · 0 remote). **Bornes de portée tranchées** : (a) roadmap
« résidus de diversité » corrigée ✅ ; (b) « trois → quatre » objets ✅ ; (c) **ratification investisseur
d'ADR-CERT-MONARK = pendant formé, adressé à l'investisseur, à ratifier AVANT la Phase 3** (ne bloque pas la
Phase 0 : `remaining_budget: number` est agnostique du token) ; **intervalle non borné** (JSON sans ±∞) = **choix
de conception**, cohérent avec le refus Hikae des ensembles infinis (`under_calib` plutôt que +∞) — UKEMI émet un
intervalle borné ou s'abstient, à nommer au contrat d'intégration Phase 1 ; **C13 résolu** (flip global).
**Pendants formés** (zéro dette nue) : (c) ci-dessus ; M5 `lo≤hi` (invariant producteur, Phase 1) ;
orchestrateurs projet en tier nu `fable` → `claude-fable-5-1` (par projet).

### État des gates
| Gate | État |
|---|---|
| G0 (cadrage/ADR) | ✅ ADR-M001 accepté-avec-corrections + quick-verify OK |
| G1 (provenance) | ✅ ce journal |
| G2 (revue 100 %, réviseur ≠ générateur, **contexte frais**) | ✅ **approuvé-avec-réserves** (Opus 4.8 distinct ; oracle reproduit + `calib_digest` re-dérivé en Python + non-lift confirmé ; R1 ratifiée dans l'ADR, M3+M4 fermés, M5→Phase 1) |
| G3/G4/G6 (oracle) | ✅ CI verte locale (vocab + typecheck + 41 tests + schémas ajv) |
| G7 (verdict orchestrateur) | ✅ **ACCEPTÉ** (2026-09-04, `claude-fable-5-1`, R-21 reproduit) — conditionnel au checkpoint 2 |
| Acceptation validateur-humain (checkpoint 2, livrable) | ✅ **accepté-avec-corrections** (2026-09-04, `claude-fable-5-1` ; 4 corrections documentaires, appliquées : revue G2 persistée `docs/adr/G2-review-M001.md`, en-têtes ADR-M001/ADR-CERT, README « coverage-controlled ») — **premier commit autorisé** |
| Commit | ✅ **`357ef25`** (2026-09-04, orchestrateur `claude-fable-5-1`, R-19/R-20) — après advisor pré-commit (lockfile prouvé par `npm ci` à frais : 14 paquets, CI 41/41) ; hook `gate-commit` passé ; **0 remote** (C14). Ancrage de provenance = commit suivant (R-25). |

## Lot Phase 1 — moteurs HIKAE (HAC-CP `btc-dir-15m`) et UKEMI (noyau de clearing) — ADR-M002

### G0 (2026-09-04) — plan approuvé AVANT tout code
- **ADR-M002** rédigé par l'orchestrateur `claude-fable-5-1` après **advisor pré-rédaction** (périmètre ramené à deux
  lots ; gate cross-agent = Phase 2 ; réconciliation UKEMI/G7 ; sources sur nos archives [lu]).
- **Checkpoint 1 validateur-humain** : **ACCEPTE-AVEC-CORRECTIONS C1-C13** (13 items, dont 3 choix d'ingénierie
  tranchés par l'orchestrateur : C1 → L2 **moniteur**, aucune garantie (ii) revendiquée ; C4 → invariant `interval`
  dans `hikae` seul ; C6 → skill + atelier reportés Phase 2). **Quick-verify** : passage 2 = 13/13 PASS + 2
  incohérences inter-sections révélées ; passage 3 = 3 FAIL résiduels (dont un introduit par une correction) ;
  **passage 4 = QUICK-VERIFY OK, code autorisé**. Copie dépôt ≡ source (md5) à chaque passage.
- **Gate-0 validateur (mesuré)** : les quatre instances ont résolu **`claude-fable-5-1`** — la prédiction « cache de
  session → `claude-fable-5` » (Phase 0) était **fausse** cette fois ; consignée telle quelle.
- **Pendants investisseur formés (ADR-M002 §4)** : (a) venue + conditions d'usage endpoint prix ; (b) ratification
  ADR-CERT avant Phase 3 ; (c) lecture D9 UKEMI = brique-moteur ; (d) horizon 15 min ≠ objet payé ; (e) S2b baseline =
  silence calibré quasi total ; (f) skill/atelier reportés Phase 2.
- **Discipline** : workers `claude-opus-4-8` effort max (Gate-0 au premier de chaque lot) ; worktrees isolés ;
  zéro dépendance runtime ; `contracts_frozen` racine ; seul l'orchestrateur committe ; 0 remote.

### Amendements post-checkpoint (2026-09-04, décisions investisseur posées en langage simple)
- **Amendement 1** : les six questions (a)-(f) tranchées — Coinbase ; ADR-CERT **ratifié** ; UKEMI brique-moteur ;
  **horizon UKEMI 24 h** (contre 15 min proposé) ; présentation S2b « plus tard » (deux blocs étiquetés) ; skill →
  Phase 2. Quick-verify d'amendement : **OK** + 2 corrections de forme intégrées.
- **Amendement 2 — cap hackathon** (page `clawpump.tech/ansemhack` lue) : re-séquencement, deploy early, « on publie ce
  qui a tourné » (forme falsifiable = ligne D10), tracks pump.fun + UsePod, **Lot D écran de démo maintenant**,
  **pas de trading dans MONARK** (→ KAIZEN, produit futur). Quick-verify : **ACCEPTE-AVEC-CORRECTIONS, 10 items,
  intégrés** (tests 24-28 Lot D, CA-D1..D5 falsifiables, note MAST « pression de deadline », pendants (g)-(k)).
- **Premières relances** : les deux workers H/U initiaux sont morts sur **limite d'usage avant d'écrire** (un fichier
  sonde `_probe.ts` retiré) ; relancés sur la **source** ADR (`F:\Clawpumptech`) comme spec.
- **Fichiers racine écrits par l'ORCHESTRATEUR (`claude-fable-5-1`) — générateur ≠ worker, à relire au G2** :
  `vocab-banned.json` (liste `BANNED` exportée + motif « X % … corrects », mutant « 73 % de fills corrects » **attrapé**),
  `scripts/grep-forbidden.mjs` (lit le JSON, étend le parcours à `packages/atelier/**`, accepte des cibles en argument),
  `fixtures/` (9 `GateDecision` 3/2/3/1 générés par un script one-shot du scratchpad via `serializeGateDecision`
  + `calibDigest`, `manifest.json` sha256), `test/fixtures-root.test.ts` (ajv + gardes runtime + hash + répartition —
  1er jet faux sur le comptage `under_calib`/abstain, attrapé par l'oracle, corrigé), `test/contracts-frozen.test.ts`
  (mutant rouge vérifié). CI racine : **45/45**.

### Résolution C13 (2026-09-04) — roster currency
Décision investisseur **« Global — flip Kraidle too »** : `claude-fable-5-1` propagé aux fichiers **globaux**
(`~/.claude/CLAUDE.md` + les 4 agents globaux advisor/advisor-marché/lecture-advisor/validateur ; `advisorModel`
settings.json était déjà 5.1). **Carve-out Kraidle levé** (ADR-ROSTER 2026-09-01 amendé). Prise d'effet des
définitions d'agent = **redémarrage de session**. La divergence notée au Gate-0 ci-dessus est donc **résolue**
(plus de split : tous les projets = Fable 5.1 ; workers Opus 4.8 et lecteurs Sonnet 5 inchangés).

### G1/G2 (2026-09-04) — code des trois lots (worktrees `phase1/hikae`, `phase1/ukemi`, `phase1/atelier`, tous à `fcfa4cf` + main fusionné)

| Lot | Générateur (Gate-0, R-1) | Contexte | Artefacts | Réviseur G2 (contexte frais, ≠ générateur) | Verdict G2 | Corrections | CI après corrections |
|---|---|---|---|---|---|---|---|
| **H** `packages/hikae` | worker `claude-opus-4-8` effort max (modules `l1/l2/l3/predictor/region/verdict`) ; puis **orchestrateur en siège worker** ~~`claude-opus-4-8`~~ **`claude-fable-5-1`** (corrigé 2026-09-05, checkpoint 2 corr. 2 — déviation roster, voir puce ci-dessous) (index, instrument S2, report, tests, README — après 4 morts de workers background sur limite d'usage, consigné). Gate-0 du worker Opus des modules : déclaration **non conservée** (session morte avant sortie finale) — consigné tel quel, relecture G2 + delta Opus 4.8 = seule preuve de provenance | ADR-M002 D3-D8/D10/D11, contrats gelés, `fixtures/` racine, archives [lu] Barber/jackknife+/Wang | `src/**`, `src/s2/{instrument,report,run}.ts`, `scripts/s2-report.mjs`, `docs/S2-RAPPORT-fixtures-synth.md` + `docs/S2-journal-fixtures-synth.tsv`, `test/*.test.ts`, `README.md`, `test/fixtures.manifest.json` | `claude-opus-4-8[1m]` effort max → `docs/G2-lot-H.md` | ACCEPTÉ-AVEC-CORRECTIONS | 5 : (1) prédicteurs **câblés** (`labeledFromPredictor`, `Prediction` gelée par point, ids depuis constantes) ; (2) test 7 réécrit sur `gate()` à deux politiques τ=1/τ=2 (mutant `defer→commit` **rouge**, restauré sha `c6f8cc29…`) ; (3) scratch → `os.tmpdir()` (`.tmp-vocab/` retiré) ; (4) rapport régénéré par `runS2` + journal brut 2153 lignes + test `s2_report_reproducible` (mutant « m=388 » **rouge**) ; (5) cette ligne | **66/66**, gate vocab OK (20 fichiers), tsc 0 |
| **U** `packages/ukemi` | orchestrateur en siège worker ~~`claude-opus-4-8`~~ **`claude-fable-5-1`** (corrigé 2026-09-05, checkpoint 2 corr. 2) (clearing, liquidable, prediction, fixtures, 6 tests, README) après mort du worker U (sa note finale a déclenché la sonde non-expansivité) ; advisor consulté 2× (finding Lemme 5) | ADR-M002 D9/D11, [lu] `eisenberg2001.txt`, [lu-archive] K4, Knife-edge Eq. 3 | `src/{clearing,liquidable,prediction,index}.ts`, `test/**`, `README.md` | `claude-opus-4-8[1m]` effort max → `docs/G2-lot-U.md` | ACCEPTÉ-AVEC-CORRECTIONS | 3 : (C1) README conséquence (i) D9 ; (C2) « déclaré, non fondé » (C13d) ; (C3) ajv `prediction.schema.json` dans le test 23 (`allowUnionTypes`, miroir racine) | **51/51**, gate vocab OK (14), tsc 0 |
| **D** `packages/atelier` | worker `claude-opus-4-8` effort max (état pur, rendu, stubs perps, serveur, 5 tests) — Gate-0 cité : « Modèle résolu (R-1) : `claude-opus-4-8[1m]` » (première ligne de son rapport, reprise `docs/G2-lot-D.md:4,101`) | ADR-M002 D0/D1/D11 CA-D1..D5, contrats gelés, `fixtures/` racine | `packages/atelier/**` | `claude-opus-4-8[1m]` effort max → `docs/G2-lot-D.md` | ACCEPTÉ-AVEC-CORRECTIONS | 2 : (1) test 24 lie `hikae.{method,alpha,nCalib,qhat,region}` au verdict brut sur les 9 états (le swap `alpha:=n_calib` prouvé invisible devient rouge) ; (2) ADR-M002 D11 test 24 reformulé « B_t porté fidèlement » (source ≡ copie md5 `c7680901…`) | **50/50**, gate vocab OK (22), tsc 0 |

- **Écart source ↔ implémentation consigné (Lot U, test 21)** : E&N Lemme 5 énonce `e ↦ p*` « nonexpansive » ; réfuté par calcul sur systèmes réguliers `e ≫ 0` (ratios exacts 2 en L1, 3 en L∞). Croissance + concavité **tenues**. `error_origin` : **à assigner au G7** (pendant de lecture (l) formé, ADR-M002 §4). ADR-M002 D9/D11 amendés (barré + amendement daté, jamais réécrit).
- **DÉVIATION ROSTER consignée (R-1)** : les 10 corrections G2 ont été appliquées par l'**orchestrateur lui-même, modèle résolu `claude-fable-5-1`** (siège worker tenu par Fable — hors roster « workers = Opus 4.8 »), le Lot H (index, instrument, report, tests, README) et le Lot U ayant aussi été écrits par l'orchestrateur après 4 morts de workers background sur limite d'usage (la ligne « siège worker `claude-opus-4-8` » écrite le 2026-09-04 était **fausse** — corrigée ici, memstack invalidé `20399c71…`). Raison : limite d'usage session ; mitigation : **relecture delta par les trois relecteurs G2 Opus 4.8 (≠ générateur) avant G7**, mutants re-exécutés par eux.
- **Discipline** : aucun commit par un worker ; les artefacts G2 sont committés tels quels avec le code (R-25 : un commit par lot).

### G7 + checkpoint 2 (2026-09-05)
- **G7** : `docs/G7-phase1.md` — ACCEPTÉ (orchestrateur `claude-fable-5-1`). `error_origin` test 21 = **source** (E&N Lemme 5, page rendue [lu], `docs/lecture-EN-lemme5.md` ; divergence de lecture adjudiquée sur la mise en page p. 245, `F:\Clawpumptech\procurements-lectures\P-EN-249-eisenberg2001-p249.md`).
- **Checkpoint 2** (`validateur-humain`, `claude-fable-5-1`, sans Bash/Write) : ACCEPTE-AVEC-CORRECTIONS, 6 items — `docs/CHECKPOINT2-phase1.md`. Traitement : (1) **relecture delta-2** du diff post-delta Lot H par `claude-opus-4-8[1m]` effort max (première instance morte sur coupure de courant, relancée) → **CLOS**, `F:\Monark-wt-hikae\docs\G2-lot-H-delta2.md` (M2 : 120+120 lignes, 0.983/0.017 recalculés, sha256 TSV `16003409…` == cité, 2 mutants rouges restaurés, CI 66/66) ; (2) cellules l.140-141 barrées ; (3) ADR D10/D11-14 amendés, copie ≡ source ; (4) pendant (e) ; (5) `tsconfig include` + `test/**/*.ts` (tsc 0 partout) ; (6) CA-D1 visuel **confirmé par l'investisseur** (atelier lancé, 5 éléments vus, 2026-09-05).
- **Procurements** : 6 lus le même jour (P-K1-1, P-K4-1, P-K4-2, P-EN-249, P-HIKAE-2, P-HIKAE-3 ; lecteurs `claude-sonnet-5`, règle 4bis) — chiffre d'archive « 800 M$ de gains de liquidateurs » **réfuté** (807,46 M = volume liquidé ; profit 63,59 M USD, Qin IMC'21 p. 341).
- **Commits** : un par lot (`phase1/hikae`, `phase1/ukemi`, `phase1/atelier`), merge dans `main`, puis commit des documents `main` — par l'orchestrateur seul (R-19/R-20), 0 remote.

## Phase 2 — ouverture (2026-09-05)

| Artefact | Générateur (résolu) | Relecteur / validateur | Verdict |
|---|---|---|---|
| `docs/adr/ADR-M003-phase2-integration.md` | `claude-fable-5-1` (orchestrateur, effort high ; advisor intégré ×2) | `validateur-humain` `claude-fable-5-1` ×2 (checkpoint 1, quick-verify) | ACCEPTE-AVEC-CORRECTIONS 14/14 appliqués ; **D10 ESCALADE-INVESTISSEUR, non en vigueur** |
| `docs/CHECKPOINT1-phase2.md` | orchestrateur (avis verbatim persisté) | — | — |

Pré-vérifications machine (orchestrateur) : champs `AttestedPrice` ↔ `Temoignage`/`Verdict`/`Constat` Rust ; 0 `serde` dans `crates/` ; fixtures `s3-binance` ; mesure des lots Phase 1 (`0468cf4` 5131, `133aba9` 1205, `ca8a070` 826). `error_origin` des 14 items : **orchestrateur** (générateur du plan) ; item 3 second passage : orchestrateur. Aucun code écrit. Miroir `F:\Clawpumptech\ADR-M003-phase2-integration.md` md5 `12d8e26f`.
- **2026-09-05, escalade D10 tranchée** : investisseur, verbatim « escalade D10 option A, oui » → D10 en vigueur (addendum ADR-M003 D10 ; CHECKPOINT1-phase2.md §4). Consigné par l'orchestrateur `claude-fable-5-1`.
- **2026-09-05, pendant (i) partie 1** : investisseur, verbatim « crées le toi même le répertoire, tu as ma permission » → dépôt `KraidleAI/monark` créé **privé** par l'orchestrateur via `gh` (compte investisseur déjà authentifié, aucun secret saisi) ; remote `origin` enregistré localement ; **aucun push** (attend Lot V + clé de signature). Repositionnement investisseur du même jour (compagnie d'agents, plateforme public/live/console) consigné en memstack, à formaliser en ADR-M004.
- **2026-09-05, Lot K lancé** en parallèle du Lot V (isolation : `packages/ukemi/**` + `packages/hikae/src/{interval-conformer,l3-gate}` vs CI/eslint/vocab ; ADR-M003 D1). Worktree `F:\Monark-wt-ukemi2`, branche `lot-k-ukemi2`.
- **2026-09-05, dépôts** : investisseur « je suis ta recommandation des deux dépôts » → `KraidleAI/monark` renommé **`monark-governance`** (privé, remote `origin` de ce dépôt) ; nouveau **`KraidleAI/monark`** créé privé (public au lancement), destiné à l'export anglais. Règle « English only » sur tout artefact public (ADR-M003 D0.5). Aucun push.
- **2026-09-05, Lot K rendu** (worker `claude-opus-4-8[1m]`, CI 81/81, 4 mutants rouges/restaurés). **Finding** : oracle Ex. 3.3 « (2, 2.2) » = coquille du lecteur P-K4-1 (vrai : (2.2, 2.2), vérifié par l'orchestrateur sur rendu image pp. 885-886) ; `error_origin` = **lecteur**, propagation **orchestrateur** (ADR D6.3 non re-vérifié à la source). Addenda datés : lecture P-K4-1, ADR-M003 D6.3. Test 37 porte la valeur vraie.
- **2026-09-06, Lot K clos** : G2 `claude-opus-4-8[1m]` (instance séparée) CLOS-AVEC-RÉSERVES → arbitrage G7 partiel : R1 accepté tel que déclaré (pendant Lot I), R2 observation, R3 English-only reporté au lot transverse E avant export (D0.5). 5 mutants tués (4 G1 re-exécutés + 1 relecteur), sha256 restaurés. Commit `c05b7f6` (branche `lot-k-ukemi2`), merge `a68abfb` sur main, CI main 81/81 (encore TS 7 ; TS 6.0.3 arrive avec le Lot V). Deux instances Opus mortes sur limite d'usage ce jour (G2 K première tentative, V passe 2 en fin de course) — relancées, aucune écriture orchestrateur en siège worker (D10 non déclenché : pas deux morts sur un même lot).
- **2026-09-06, pendant (i) partie 2 — signature** : investisseur « configure la toi même la clé signature » → l'orchestrateur configure `monark-governance` (config locale, partagée par les worktrees) sur la **clé SSH ed25519 existante** `~/.ssh/shogen_signing` (créée 2026-07-30, enregistrée comme signing key du compte GitHub Kraidle via navigateur ce jour-là, memstack), `commit.gpgsign=true`, `allowed_signers` de Shōgen. Aucune clé créée, aucun secret saisi. Vérification GitHub côté API impossible sans scope `admin:ssh_signing_key` (refresh d'auth = action investisseur) ; vérifiée localement par `git log --show-signature`.
- **2026-09-06, R-P1 clos** (chercheur `claude-sonnet-5`, `docs/R-P1-clawpump-hermes.md`, 29 sources) : Hermes = Nous Research/`claw-agent` (track pump.fun) ≠ UsePod (proxy REST, jeton dans l'URL, track Inference Markets). `clawpump-hermes` retiré → `usepod-client` + `claw-agent`. Addendum D5. **P-HIKAE-1 clos** (lecteur Sonnet, `procurements-lectures/P-HIKAE-1-gibbs2021.md`) ; pendant P-HIKAE-1b DtACI.
