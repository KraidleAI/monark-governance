# Revue G2 — Lot H (`packages/hikae`, HAC-CP Phase 1)

- **Verdict : ACCEPTÉ-AVEC-CORRECTIONS** (5 corrections, liste fermée §3).
- **Réviseur** : relecteur G2, instance séparée, contexte frais. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`**
  (préfixe `claude-opus-4-8` conforme au roster 2026-08-14 ; effort max ; ≠ générateur, P6). Non `claude-opus-5` (banni).
- **Date** : 2026-09-04 · **Worktree** : `F:\Monark-wt-hikae` · **Branche** : `phase1/hikae`.
- **Spec de rattachement** : `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md` (D3-D8, D11 tests 1-17, CA-H1..H5).
- **Checklist appliquée à 100 %** : `…/compiliance et ingénierie locielle et architecturale/templates/checklist-revue-G2.md`.
- **Périmètre relu** : `packages/hikae/src/**` (9 fichiers), `packages/hikae/test/**` (6 `*.test.ts` + `fixtures.manifest.json`),
  `packages/hikae/README.md`, `packages/hikae/docs/S2-RAPPORT-fixtures-synth.md`. Contrats gelés `packages/contracts/src/**`
  relus en **dépendance** (vérif. non-réimplémentation), non re-revus au fond (revue G2 Phase 0 = `docs/adr/G2-review-M001.md`).
- **R-21** : chaque affirmation porte sa preuve reproductible (fichier:ligne + commande). Oracle **reproduit, pas cru**
  (§4). Je ne committe pas, je n'ai modifié aucun fichier hors ce présent artefact (mutations §4 restaurées à l'octet).

---

## 1. Résultat des vérifications adversariales imposées par la mission (R-21)

| # | Exigence | Résultat | Preuve |
|---|---|---|---|
| 1 | Les 17 tests nommés D11 existent, bon nom, aucun vacuous | **⚠ 17/17 présents & PASS ; 1 vacuous (test 7)** | CI 64/64 (§4.1) ; mapping §2.1 ; test 7 vacuité **prouvée par mutant** (§4.2) → **corr. 2** |
| 2 | L2 = MONITEUR, aucune garantie type (ii) revendiquée (D4 b) | **✓** | `src/l2-monitor.ts:1-16,25` ; `README.md:13` ; `src/index.ts:6` — « garantie » n'apparaît qu'en **négation** (grep §4.3) |
| 3a | Aucun `p_correct` émis, aucun mot du gate vocab | **✓** | `npm run gate:vocab` OK, 19 fichiers, 0 claim (§4.1) ; grep `p_correct` = commentaires disciplinaires seuls (§4.3) |
| 3b | Aucune réimplémentation des contrats gelés (imports `@monark/contracts`) | **✓** | Tous les imports contrat = specifier nu `@monark/contracts` (grep §4.3) ; `verdict.ts:88-90` **délègue** à `serializeVerdict` |
| 4a | `GATED_TOOLS` nommés, jamais appelés | **✓** | `src/l3-gate.ts:29` const ; `gate()` pose `tool: input.tool` (donnée, `l3-gate.ts:97`), n'invoque jamais l'outil ; seule autre occurrence = valeur `tool:` `instrument.ts:225` |
| 4b | Région `interval` → lève « Phase 2 » | **✓** (chemin **non testé**, §5) | `src/l3-gate.ts:62-66` throw explicite (D9) |
| 5 | strict TS ; pas de TODO/FIXME nu (R-13) ; sources [lu] page/ligne | **✓** | `tsconfig.json:9-13` (`strict`+`exactOptionalPropertyTypes`+`noUncheckedIndexedAccess`) ; grep TODO/FIXME = 0 (§4.3) ; `l1-split.ts:6-10`, `l2-monitor.ts:11-13` citent Thm/p./ligne d'archive |
| 6 | `npm run ci` vert depuis la racine | **✓** | Exit 0 reproduit 2× (§4.1) |

---

## 2. Checklist G2 — 100 % des fichiers

### 2.1 Correspondance des 17 tests nommés D11 (Lot H)

| # D11 | Test | Fichier:ligne | PASS | Non-vacuous |
|---|---|---|---|---|
| 1 | `under_calib_abstains` | `test/l1.test.ts:6` | ✓ | **oui** (mutant (n+1)→n : FAIL, §4.2) |
| 2 | `intent_not_in_region_denied` | `test/l3.test.ts:40` | ✓ | oui (littéral gelé `enums.ts:11`) |
| 3 | `timeout_is_deny` | `test/l3.test.ts:49` | ✓ | oui |
| 4 | `no_p_correct_field` | `test/contracts-integration.test.ts:36` | ✓ | oui (exerce le closed-check gelé, `serialize.ts:29-33`) |
| 5 | `empty_set_not_allow` | `test/l1.test.ts:39` | ✓ | **vacuous au score 0/1 — DÉCLARÉ** (ADR D11 §5, étiqueté) ; noté §5 |
| 6 | `set_too_large_defers` | `test/l3.test.ts:57` | ✓ | **oui** (mutant defer→commit : FAIL, §4.2) |
| 7 | `deferral_preserves_miscover` | `test/l3.test.ts:69` | ✓ | **NON — vacuous** (mutant defer→commit : reste PASS, §4.2) → **corr. 2** |
| 8 | `quantile_formula_n_plus_1` | `test/l1.test.ts:16` | ✓ | **oui** (mutant (n+1)→n : FAIL cas `scores3`, §4.2) |
| 9 | `imocp_update_direction` | `test/l2.test.ts:8` | ✓ | oui (assertions de signe strict) |
| 10 | `budget_ignores_pending_label` | `test/l2.test.ts:19` | ✓ | oui pour l'assertion no-peek delay=0 (`l2.test.ts:27-31`) ; disjonction `l2.test.ts:34` quasi-vacuous — noté §5 |
| 11 | `budget_exhausted_refuses_commit` | `test/l2.test.ts:71` | ✓ | oui |
| 12 | `commit_error_not_alpha_is_labelled` | `test/contracts-integration.test.ts:58` | ✓ | oui (exécute `grep-forbidden.mjs`, exit 1 attendu) — **effet de bord** `.tmp-vocab/` → **corr. 3** |
| 13 | `calib_digest_matches_contracts` | `test/contracts-integration.test.ts:47` | ✓ | oui (oracle figé `1e47bee…`, cross-langage non re-dérivé par moi — §5) |
| 14 | `fixtures_hash_stable` | `test/s2.test.ts:21` | ✓ | oui (répartition 3/2/3/1 + sha256 == `fixtures.manifest.json`) |
| 15 | `interval_lo_le_hi` | `test/region-predictor.test.ts:15` | ✓ | oui (throw M5 + intervalle dégénéré) |
| 16 | `unbounded_is_abstain` | `test/region-predictor.test.ts:29` | ✓ | oui (±Inf/NaN ⇒ abstain) |
| 17 | `features_strictly_before_t` | `test/region-predictor.test.ts:45` | ✓ | oui (look-ahead ⇒ throw) |

Tests **supplémentaires** (hors 17, bénins, étiquetés « garde ») : `build_set_region_defensive_copy`
(`region-predictor.test.ts:64`), `s2_campaign_deterministic_and_coherent` (`s2.test.ts:45`). Non-comptés en défaut
(R-25 : un sujet ; ce sont des gardes de non-régression, pas du périmètre en trop nuisible).

### 2.2 Items de la checklist du corpus

| Rubrique / item | État | Preuve (fichier:ligne) |
|---|---|---|
| **Compréhension** — expliquer chaque bloc (P3) | ✓ | src relu intégralement ; chaîne predictor→verdict→gate cohérente (`src/index.ts:1-14`) |
| **Compréhension** — intention ↔ ADR (G0) | ✓ | mappe D3 (`l1-split.ts`), D4 (`l2-monitor.ts`), D5 (`l3-gate.ts`), D7/D8 (`predictor.ts`), D9/C4 (`region.ts`), D10 (`s2/`) |
| **Pièges** — aucune branche/validation d'entrée supprimée | ✓ | fail-closed complet `l3-gate.ts:69-84` ; `splitQuantile` `l1-split.ts:36-41` |
| **Pièges** — aucune inversion booléenne non couverte par un test | ⚠ | gate/quantile couverts (mutants §4.2) ; **inversion du DEFER non couverte** (test 7 aveugle) → **corr. 2** |
| **Pièges** — TS `this` (extraction de fonction) | N/A | fonctions pures, aucune classe/`this` |
| **Pièges** — correction fonctionnelle ≠ preuve de sécurité | ✓ | aucune surface sécurité (0 réseau, 0 credential) ; PRNG **seedé** `instrument.ts:27-36` |
| **Pièges** — aléa / crypto / chemins-symlinks | ⚠ | `mulberry32` seedé, pas de `Math.random`/`new Date()` (`predictor.ts:11`, `instrument.ts:9-11`) ✓ ; **chemin** : test 12 écrit dans `<racine>/.tmp-vocab/` → **corr. 3** |
| **Pièges** — XSS / injection de logs | N/A | Lot H sans HTML/DOM (l'écran = Lot D, hors périmètre) |
| **Dépendances (R-8)** — dépendance nouvelle vérifiée registre | ✓ | Lot H : **0 dépendance** (`package.json:1-8` sans `dependencies`) ; imports = `@monark/contracts` (workspace) + builtins Node |
| **Dépendances** — lockfile mis à jour et committé | ✓ | `package-lock.json` présent ; **non modifié** par Lot H (git status §4.1 : pas de `M package-lock.json`, aucune devDep ajoutée) |
| **Structure (G4)** — pas de duplication (R-3) | ⚠ | `report.ts:94,103` **hardcode** `"internal:momentum-4c"`/`"internal:oracle-didactique"` au lieu d'importer `MOMENTUM_4C_ID`/`ORACLE_DIDACTIQUE_ID` (`predictor.ts:16-17`) → fondu dans **corr. 1** |
| **Structure** — taille de lot (R-25) | ✓ | un sujet : moteur HIKAE + instrument S2 |
| **Traçabilité** — entrée de provenance renseignée | ✗ | `docs/JOURNAL-PROVENANCE.md:93-134` = G0/planification + fichiers racine ; **aucune ligne de provenance du CODE Lot H, aucun Gate-0 (R-1) du worker Lot H** → **corr. 5** |
| **Traçabilité** — aucun TODO/FIXME nu (R-13) | ✓ | grep TODO/FIXME/XXX/HACK = 0 (§4.3) |
| **AgileCoder — Étape 1** contrôles de base | ⚠ | imports résolus, docstrings présentes, tsc OK ; **mais** `oracleDidactique` (`predictor.ts:103`) **exporté, jamais appelé, 0 couverture** → **corr. 1** |
| **AgileCoder — Étape 2** conformité au backlog | ⚠ | 17 tests + rapport présents ; **mais** l'instrument S2 **ne câble pas** les prédicteurs déclarés (D7/D10 C9) → **corr. 1** |
| **AgileCoder — Étape 3** CA + cas limites | ⚠ | CA-H1 ✓ (17 PASS) ; CA-H3 ✓ (vocab) ; CA-H4 ✓ (`no_p_correct_field`, `calib_digest`) ; CA-H5 ✓ (`interval_lo_le_hi`,`unbounded_is_abstain`) ; **CA-H2 partiel** : blocs 2 (journal) et 6 (tête) = stubs + provenance mal étiquetée → **corr. 1 & 4** |
| **Scripts de workflow** | N/A | le diff Lot H ne contient aucun script `Workflow` (`export const meta`+await module) |

---

## 3. Corrections demandées (liste fermée — zéro dette à la clôture)

**1. Provenance mal étiquetée : les prédicteurs déclarés ne sont pas câblés dans l'instrument S2 (D7, D10 C9, CA-H2).**
- Fichiers/lignes : `src/s2/instrument.ts:15-20` (imports **omettent** `momentum4c`/`oracleDidactique`/`extractMomentumFeatures`/`labelOf`),
  `:174-181` (commentaire « les COMMIT viennent de l'oracle didactique » + `GOOD_SCORES` = 47×0 **+ 3×1**), `:184-198` (`commitVerdict` à scores **codés en dur**),
  `:232-263` (`demoStates`) ; `src/s2/report.ts:94-101` (§6a « Silence réel `internal:momentum-4c` », « Prédicteur momentum ≈ pièce »),
  `:103-104` (§6b « Oracle didactique (ŷ=y) ») ; `src/predictor.ts:103` (`oracleDidactique` jamais appelé).
- Défaut : le rapport S2 **attribue** ses chiffres à `internal:momentum-4c` (§6a) et `internal:oracle-didactique` (§6b),
  mais `momentum4c` n'est exécuté **que** par le test 17 (garde look-ahead) et `oracleDidactique` **jamais**. §6a
  (`silenceReal`) provient d'un **tirage synthétique (ŷ,y)** `generateLabeledSeries({accuracy:0.5})`, pas de `momentum4c`
  sur une série de bougies ; §6b tient ses COMMIT de `GOOD_SCORES` (3 miscovers), ce qu'un oracle `ŷ=y` (0 miscover)
  **ne peut pas** produire — contredit `instrument.ts:175` et `report.ts:104`. Plus fondamental : l'instrument n'émet
  **aucune** `Prediction` — il entre dans la chaîne gelée (`predictor → Prediction → HIKAE conforme → CoverageVerdict`,
  `src/index.ts:4`) **à l'étape 3**, en assemblant des `CoverageVerdict` depuis des scores codés en dur (`CoverageVerdict`
  ne porte d'ailleurs **pas** de `predictor_id` — ce champ vit sur `Prediction`, `contracts/src/types.ts:74-83`). D10 C9
  exige explicitement le jeu « produit … **via l'oracle didactique et des mutants** ». Étiqueter une provenance non
  exécutée dans un artefact d'acceptation = **statut d'un chiffre sans source** (D0/D10). « Câbler » (option a) =
  produire une `Prediction` via `momentum4c`/`oracleDidactique`, puis la conformer.
- Correction proposée — au choix de l'orchestrateur : **(a) câbler** (fidèle à l'ADR) : générer une série de bougies
  synthétique seedée, calculer ŷ par `extractMomentumFeatures→momentum4c` et y par `labelOf` dans la campagne §6a, et
  utiliser `oracleDidactique` sur ces mêmes bougies pour les COMMIT de §6b ; **(b) ré-étiqueter** : §6a → « tirage
  synthétique accuracy 0.5, **tenant lieu de** momentum-4c (non exécuté en `fixtures-synth`) » ; §6b → retirer « ŷ=y »
  ou poser `GOOD_SCORES` tout-zéros. Dans les deux cas, importer `MOMENTUM_4C_ID`/`ORACLE_DIDACTIQUE_ID` au lieu des
  littéraux (R-3, ferme aussi la ligne « duplication »).

**2. Test 7 `deferral_preserves_miscover` vacuous vis-à-vis de l'implémentation (D5 H3, CA-H1, MAST « revue complaisante »).**
- Fichier/lignes : `test/l3.test.ts:69-86`.
- Défaut : le test n'exerce **aucun** code `src` pour H3 — il somme les miscovers sur un littéral local `seq` via un
  helper qui **jette** l'argument de politique (`void policy`, `l3.test.ts:80`) ; `miscover("commit-always") ===
  miscover("defer-large")` est donc une tautologie (x===x), et la seule assertion porteuse (`=== 2`, `l3.test.ts:85`)
  ne lit que le littéral local. **Prouvé par mutant** (§4.2) : en mutant `l3-gate.ts:80` `defer`→`commit`,
  `set_too_large_defers` **ÉCHOUE** tandis que `deferral_preserves_miscover` **reste vert**.
- Correction proposée : implémenter **deux** fonctions de décision **réellement distinctes** — π⁰ (COMMIT dès intent∈C,
  via `gate()`) et π^H (politique `gate()` complète) — dérivant toutes deux `E_t = 1{y∉C_t}` du **même** `C_t` (L1),
  puis asserter Σ E identique **et** ancrer le compte. Le test devient rouge si la politique corrompt la comptabilité
  du miscover.

**3. La suite de tests salit le worktree avec un `.tmp-vocab/` non suivi (R-25 arbre propre, MAST « conflit racine »).**
- Fichier/lignes : `test/contracts-integration.test.ts:84-88` (`const scratch = process.env["CLAUDE_SCRATCH"] ??
  join(root, ".tmp-vocab"); mkdirSync(scratch,…); writeFileSync(tmp,…)`).
- Défaut : quand `CLAUDE_SCRATCH` est absent (cas CI par défaut), le test 12 écrit dans `<worktree>/.tmp-vocab/`,
  laissant un répertoire **non suivi** dans l'arbre (constaté au git status de référence, §4.1 : `?? .tmp-vocab/`).
  `.tmp-vocab` n'est pas gitignoré. Cela salit l'arbre que l'orchestrateur doit committer et menace un contrôle
  d'arbre-propre / mutant.
- Correction proposée : écrire dans `fs.mkdtempSync(join(os.tmpdir(), "hikae-vocab-"))` (et nettoyer), **ou** ajouter
  `.tmp-vocab/` au `.gitignore`. Préférence : `os.tmpdir()`, pour que `node:test` laisse le worktree intact.

**4. Rapport S2 : blocs 2 (« Journal brut ») et 6 (« tête ») = stubs ; chiffres non recalculables (D10, CA-H2, ligne D10 de D0).**
- Fichiers/lignes : `docs/S2-RAPPORT-fixtures-synth.md:8-9` (§2 = une phrase), `:50` (tête = phrase-gabarit),
  `:6` (paramètres : α/n_min/τ/graines **seuls** — pas de n/accuracy/nCalib/nonEvaluableRate par campagne), chiffres
  `:12,:17-19,:27,:34`.
- Défaut : D10 exige « **journal brut par point** … tout chiffre se recalcule **sans croire HIKAE** » et CA-H2 liste 6
  blocs dont « journal ». Le bloc 2 est une phrase sans lignes-par-point ; le bloc 6 « tête » nomme trois chiffres sans
  les donner. Les valeurs concrètes (S2a 95.3 %, S2b 100 %, M2 0.983→0.017) ne sont **reproduites par aucun** appel de
  harnais committé (seul `scripts/grep-forbidden.mjs` existe ; le test 12 utilise d'autres graines/paramètres) et ne
  portent **ni date ni hash** du journal (ligne D10 de D0 = n, étiquette, date, hash). **Non reproduit par moi** (§5).
- Correction proposée : committer le journal brut par point (ou un script générateur seedé sous `scripts/` **plus** un
  test liant les chiffres du doc au harnais), énoncer les paramètres par campagne, et ajouter la ligne D10 (n, étiquette
  de provenance, date, hash du journal brut) sous chaque chiffre.

**5. Entrée de provenance / Gate-0 du Lot H absente du journal (G1, D12, checklist Traçabilité). — Propriétaire : l'ORCHESTRATEUR (R-20 : le journal est orchestrateur-owned ; un worker ne l'écrit pas).**
- Fichier/lignes : `docs/JOURNAL-PROVENANCE.md:93-134` (section « Lot Phase 1 » : G0/planification + fichiers racine
  seulement ; pas de ligne du **tableau de provenance** pour le code Lot H, pas de **Gate-0 (R-1)** du worker Lot H).
- Défaut : P4/R-9 exige « une entrée par lot de code généré » ; D12 exige « Gate-0 au premier worker de chaque lot ».
  La section Phase 1 consigne le G0 de l'orchestrateur et l'écriture des fichiers racine, mais ni le modèle résolu /
  effort / contexte du worker Lot H, ni une ligne G1.
- Correction proposée (orchestrateur, **avant clôture G7**) : ajouter une ligne Lot H (date, modèle `claude-opus-4-8`,
  effort max, contexte, générateur, réviseur = cette revue G2, verdict G2) et consigner la déclaration Gate-0 (R-1) du
  worker Lot H. Ce n'est **pas** un défaut du code Lot H ; c'est un manque de traçabilité à fermer.

---

## 4. Reproductibilité (R-21 — oracle reproduit, pas cru)

Environnement : `node v24.15.0`, `npm 11.12.1` (type-stripping `.ts`). Toutes commandes depuis `F:\Monark-wt-hikae`.

### 4.1 `npm run ci` — vert
- `npm run ci` → **exit 0** (reproduit 2×). `gate:vocab` OK **19 fichiers, 0 claim** ; `tsc --noEmit` (strict) sans
  sortie ; `node --test` → **tests 64 / pass 64 / fail 0** (les 17 nommés Lot H + 2 gardes S2 + 2 racine CA-0 +
  43 tests `contracts`).
- git status de référence (12 entrées) : ` M packages/hikae/src/index.ts` ; `?? .tmp-vocab/` (préexistant, effet de
  bord du test 12 — corr. 3) ; `?? packages/hikae/{README.md,docs/,src/l1-split.ts,l2-monitor.ts,l3-gate.ts,predictor.ts,region.ts,s2/,verdict.ts,test/}`.

### 4.2 Test de mutation (démonstration de charge des tests ; fichiers restaurés à l'octet)
Sauvegarde `cp` (les fichiers Lot H sont **non suivis** ⇒ `git checkout --` serait un no-op). sha256 de référence :
`l3-gate.ts` = `c6f8cc298f0fd4ee96e97ca6fb83d0acb7072b49464eeecfd219d4f95acfc5ea` ;
`l1-split.ts` = `9543f161973028b04717345fe399d917fb50d083d83b115d6dba2a5ba576a479`.

- **Mutant A** — `l3-gate.ts:80` `defer`/`set_too_large` → `commit`/`covered`. `node --test test/l3.test.ts` :
  `set_too_large_defers` **✖ FAIL** ; `deferral_preserves_miscover` **✔ PASS** (⇒ test 7 aveugle, **corr. 2**) ;
  `intent_not_in_region_denied`, `timeout_is_deny` PASS. Exit 1. **Restauré** ⇒ sha256 `c6f8cc29…` (identique).
- **Mutant B** — `l1-split.ts:37` `(n + 1)` → `n`. `node --test test/l1.test.ts` : `quantile_formula_n_plus_1`
  **✖ FAIL** (cas `scores3`), `under_calib_abstains` **✖ FAIL** (branche `p>n`), `empty_set_not_allow` **✔ PASS**.
  Exit 1. **Restauré** ⇒ sha256 `9543f161…` (identique).
- **État final** : `git status --porcelain` = **12 entrées identiques** au référentiel ; sha256 des deux fichiers =
  référence. Arbre revenu identique. Sauvegardes hors-worktree (`$TMPDIR/g2bak`) **supprimées** — rien laissé derrière.
- **Après écriture de cet artefact** : `git status` = **13 entrées** = les 12 de référence **+ `?? docs/G2-lot-H.md`**
  (seul ajout, le livrable de mission ; aucun fichier `src`/`test` du Lot H touché). C'est l'état que verra la re-run R-21.

### 4.3 Greps de discipline
- `TODO|FIXME|XXX|HACK` sous `packages/hikae` → **0**.
- `p_correct|confidence|hallucination|guaranteed|garantie` sous `src` → uniquement **commentaires disciplinaires**
  (« JAMAIS `p_correct` », « aucune garantie revendiquée », « PAS la garantie CP ») — aucun champ émis, aucune garantie vendue.
- Imports contrat sous `src` → tous `from "@monark/contracts"` (nu) ; **aucun** import relatif vers `contracts` internes, **aucun** `require(`.
- `oracleDidactique`/`ORACLE_DIDACTIQUE_ID` → **définis + ré-exportés seulement** (`predictor.ts:103`, `index.ts:44,50`) — **jamais appelés**.
- `momentum4c` → appelé **uniquement** `test/region-predictor.test.ts:59` (garde). `MOMENTUM_4C_ID` → ré-export seul, jamais utilisé.

---

## 5. Ce que je n'ai PAS pu vérifier (nommé)

- **Chiffres du rapport S2 committé** (`docs/S2-RAPPORT-fixtures-synth.md` : S2a 95.3 %, S2b 100 %, M2 0.983→0.017) :
  **non reproduits**. Les paramètres par campagne (n, accuracy, nCalib, nonEvaluableRate) et le journal brut ne sont pas
  committés ; aucun script générateur n'existe ; le test 12 emploie d'autres graines. Une reproduction exigerait une
  sonde non committée à paramètres devinés — non faite (cf. corr. 4).
- **Chemin `interval` → throw** (`l3-gate.ts:62-66`) : vérifié **par lecture**, **aucun test** ne lui passe un verdict
  à région `interval` (D11 ne l'exige pas côté Lot H ; test 27 `perps_stubs_throw` est Lot D). Observation, pas correction.
- **Oracle cross-langage `calibDigest`** (test 13, hash `1e47bee…`) : vérifié **côté TS** (CI vert) ; je n'ai **pas**
  re-dérivé le SHA-256 en Python/Rust (le journal Phase 0 revendique une re-dérivation Python — `JOURNAL-PROVENANCE.md:87`).
- **ajv sur un verdict émis par Lot H (CA-H4)** : les tests Lot H exercent `serialize*` (closed-check + forbidden-keys),
  **pas** ajv ; ajv est exercé par `test/fixtures-root.test.ts` et `contracts/test/schema.test.ts` sur leurs propres
  fixtures. Je n'ai pas exécuté ajv sur l'objet **littéral** renvoyé par `underCalibVerdict()`. **Résolu par lecture +
  fixture** (pas une dette) : `schemas/coverage-verdict.schema.json:36` n'impose **aucun** `minItems` sur `region.labels`,
  et la fixture racine `fixtures/09-under-calib.gate-decision.json` porte **exactement** la forme émise par Lot H
  (`{kind:"set", labels:[], label_schema:"up|down"}`, cf. `verdict.ts:77`) — forme **ajv-validée** par le test racine
  (CI vert). La forme `under_calib` du Lot H est donc schéma-valide. **Pas de correction #6.**
- **Fichiers de test racine CA-0** (`test/contracts-frozen.test.ts`, `test/fixtures-root.test.ts`) : **hors** de
  `tsconfig.json:23` (`include` = `packages/*/src`+`packages/*/test` seulement) ⇒ **jamais typés par `tsc --noEmit`**
  (ils tournent par type-stripping sous `node --test`). Hors périmètre Lot H ; nommé pour l'orchestrateur (CA-0/racine).
- **Chemin de mission `docs/S2-RAPPORT-fixtures-synth.md`** : n'existe **pas** à la racine du worktree ; le seul fichier
  de ce nom est `packages/hikae/docs/S2-RAPPORT-fixtures-synth.md` — c'est celui que j'ai relu.
- **Lots U et D** (`packages/ukemi`, `packages/atelier`) : hors périmètre de cette revue Lot H (worktrees distincts).

---

## 6. Verdict

**ACCEPTÉ-AVEC-CORRECTIONS** — 5 corrections (§3). Aucun déclencheur de refus : les 17 tests nommés existent et
passent, L2 ne vend aucune garantie, aucun `p_correct`/mot du gate vocab, aucun contrat réimplémenté, `GATED_TOOLS`
nommés jamais appelés, `npm run ci` vert. Les corrections portent sur la **fidélité de provenance du harnais/rapport**
(1, 4, 5), un **test vacuous** (2) et un **effet de bord d'arbre** (3) — aucune ne concerne la mécanique gelée
(quantile, gate, région, sérialisation), qui est correcte et éprouvée (mutants §4.2). Verdict final et G7 :
orchestrateur (R-21).
