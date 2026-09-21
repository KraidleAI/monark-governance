MODELE RESOLU: claude-opus-4-8[1m]

# G0 (BROUILLON — PROPOSÉ) — Sprint backlog lot Ukemi **U-4b-2** : branchement SERVI de la calibration Ukemi (classe A seule, décision 108) — le registre `calibration.ts` consommé par le `gate` servi, après la course U-4b-1b

> **STATUT : BROUILLON DE WORKER — NON COMMITTÉ, NON VÉRIFIÉ.** Sortie brute pour l'orchestrateur (R-21). **Tout est « proposé ».** Aucun code, aucun réseau, aucun commit, aucun workflow dans ce G0 (plan seul).
> **Provenance** : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-21. Mission DOCS SEULEMENT. `F:\Monark` lu en **lecture seule** ; écriture confinée à `F:\tmp\u4b-2\` ; rien sur `C:`. Mesures reproductibles dans `MESURES.md` (même dossier).
> **Base mesurée** : branche `lot/etude-suite`, HEAD `b38a3993bef8e30e4371c6c5ebd6e57cda36ef6a` (`git log -1` ce tour ; `git status` = clean). Chaque `fichier:ligne` cité a été OUVERT ce tour (liste au §Provenance ; détail `MESURES.md`).
> **R-20** : le worker ne committe pas, ne déclenche aucun workflow ; verdict/commit = orchestrateur `claude-fable-5-1`. **R-21** : chaque affirmation porte sa preuve reproductible (fichier:ligne / grep). **R-1** : modèle résolu déclaré première ligne.
> **Cadre** : décision **108** (`CHANTIERS.md:468`, verbatim « Classe A seule au release » — U-4b sert la seule classe A ; classe B calculée hors ligne en -1a, item formé ; **amende la décision 91** ; **E-I-3 close** ; le prereg de -1b peut être committé) ; décision **99** (absorber U-4a-ii = A-5/A-6/A-7) ; décision **117** (release en deux temps ; temps 1 = Narabi + Ukemi) ; décision **101** (SITE hors gates, backend d'abord) ; décision **119** (HORS portée : U-6, course live, site, DNS, achats) ; ADR-U4b D1..D5 ; ADR-M020 (programme Ukemi, D1(b)/D3/D4) ; ADR-M019 D2/D4 (vacuité mesurée du tuyau cascade → gate ; Ukemi `built` maintenu) ; règle de **Branchement** (CLAUDE.md global : « built » ⇔ chemin servi + test d'intégration non-LLM) ; CA-11 durci.
> **Précondition DURE (pas une question — item à déclencheur)** : -2 **ne démarre pas** sans la fixture FRAÎCHE `U4b-scores-<épisode>.jsonl` (produite, réduite et **sha-pinnée in-repo** par U-4b-1b) + `PROVENANCE-u4b-<épisode>.md`. Le `predictor_id` base FRAIS (meta `cell_a.predictor_id` de cette fixture) devient le **littéral committé** `UKEMI_LIQ_PREDICTOR_BASE` de `calibration.ts`. Sans course -1b close, -2 est bloqué (prérequis dur, cf. Q-1).

---

## §0. Ce que U-4b-2 sert, à qui, par quel tuyau — chemin servi RÉEL mesuré (branchement — CA-11)

**But (une phrase).** U-4b-2 **branche** la calibration conforme d'Ukemi (classe A `liquidation-eligible-coverage`, Mondrian par taille de ŷ, décision 108) dans l'outil **`gate` déjà servi**, de sorte qu'un appelant portant un ŷ (montant liquidable éligible d'un compte mono-collatéral WETH au premier franchissement, base 8-déc) reçoive une **région conforme `[ŷ − q̂_k, ŷ + q̂_k]`** où **k = `strateOf(ŷ)` calculé SERVEUR** et q̂_k est le quantile split-conformal **committé** de la strate k (α=0,01) — et une **abstention `under_calib`** honnête sur toute strate non committée (n < nMin) — **jamais une probabilité**. La couverture est **conditionnelle et non vérifiée serveur** : elle vaut pour un ŷ **produit par la règle close-factor GELÉE** (`u4b-scores.mjs` sha `9ad20666…`) sur un compte **mono-collatéral WETH au premier franchissement**, en **base 8-déc entière** ; le `gate` ne voit qu'un nombre et **ne vérifie pas** le ŷ de l'appelant (clause BYO-label, D-1/D-7). C'est ce lot qui rend l'effet servi d'Ukemi **non vacue** (il DÉPEND de ŷ), remplaçant l'abstention constante du tuyau `cascade → gate` (ADR-M019 D2 : vacuité mesurée ; ADR-M020 « mode L au paroxysme »).

**Chemin servi RÉEL (mesuré, deux surfaces, un seul registre de données).** La cible « servie » n'est PAS une nouvelle surface : c'est l'outil `gate` existant, exposé par **DEUX** chemins qui consomment le **même** registre `HARNESS_TOOLS` (`apps/harness/src/tools/registry.ts:58-122`, `run: (args) => runGate(...)` `:66-74`) :
- **MCP `gate`** — serveur MCP stateless `createHarnessHandler` (`apps/harness/src/server.ts:89-98`, `registerTools` `:93`), écoutant `127.0.0.1:3001`, fronté par Caddy sur `mcp.monarkgate.tech` (`server.ts:9-15`) ;
- **Miroir HTTP/JSON** — `POST /gate` sur `api.monarkgate.tech` (`apps/harness/src/http.ts:50-106`, table de routes = `REGISTERED_TOOL_NAMES` `:32-33`, appelle `tool.run(validated.value)` `:97`).

Les deux passent par `runGate(prediction, params, attested)` (`apps/harness/src/tools/gate.ts:538-637`) qui **dispatche sur `prediction.task_class`** (`:584-604`). U-4b-2 ajoute une branche `liquidation-eligible-coverage` à ce dispatch. **Motif exact réutilisé** : `stableRunVerdict` (`gate.ts:446-489`) — `lookupCommittedCalibration(task_class, predictor_id)` (`calibration.ts:207-209`, exact-match) → `splitQuantile` → `buildIntervalRegion` → `buildVerdict`. La **seule** différence de fond : la strate (donc le `predictor_id` committé) est **dérivée serveur de ŷ** (`strateOf`), l'appelant ne la choisit pas ([C-10]).

**Registre committé.** `apps/harness/src/calibration.ts` (`COMMITTED_CALIBRATIONS` `:195-203`, `lookupCommittedCalibration` `:207-209`, garde de digest à l'import — motif BTC `:35-40`, USDe `:165-170`). U-4b-2 y **ajoute K entrées `CommittedCalibration`** (une par strate Mondrian committable de l'épisode FRAIS).

**Conformeur.** `splitQuantile` (L1, `packages/hikae/src/l1-split.ts`, **GELÉ** U-4b, sha `9206df91…`), `buildIntervalRegion`, `buildVerdict` de `@monark/hikae` — **réutilisés sans réécriture** (une seule implémentation de quantile).

**Générateur (GELÉ, -1a).** `scripts/record-u4b-calib.mjs` (sha D4 `5733daeb…`, `export function buildRegistryEntries` `:27-60`) : lit les lignes `score_a` de `U4b-scores-<épisode>.jsonl`, groupe par strate, échelle bigint→number (`--scale`, défaut 1, `:28`), **borne 2^53/strate fail-closed** (`:40`), q̂ via `splitQuantile` L1 (`:45`), `calib_digest` par strate (`:56`), **classe A UNIQUEMENT** (décision 108, `:6-8,:81`). Il **n'écrit PAS** `calibration.ts` : il imprime un rapport et dit « The orchestrator pins these in calibration.ts in -2 from the FRESH episode (R-20) » (`:83`). U-4b-2 CONSOMME ce générateur gelé ; il ne le modifie pas.

**Règle de branchement (non négociable).** `built` ssi la sortie est consommée par un chemin **servi** (MCP `gate` + miroir HTTP) couvert par un **test d'intégration non-LLM** rejouant scores → registre → région servie (`u4b_gate_serves_region_from_real_artifact`). **Surface visuelle du site** (`apps/site/components/ukemi-panel.tsx`, panneaux, logo, upload) = **hors gates, en dernier** (décision 101) ⇒ item formé **SITE-U4B** ; mais le **registre `fleet.ts`** (source de vérité du gel `built`, oracle-porteur) est traité au §12 Q-6 (câblage vs retouche visuelle).

---

## §1. Objet du lot

Livrer, en un chemin servi **branché et testé non-LLM**, la classe A `liquidation-eligible-coverage` calibrée sur l'épisode FRAIS de U-4b-1b :

1. **Registre** `calibration.ts` : K entrées `CommittedCalibration` Mondrian (une par strate committable, α=0,01, nMin=100), produites **depuis `U4b-scores-<épisode>.jsonl`** par le générateur gelé `buildRegistryEntries` (classe A seule), avec garde de digest à l'import par strate. `q̂` par **strate servie**.
2. **Dispatch servi** `gate.ts` : branche `liquidation-eligible-coverage` (motif `stableRunVerdict`) avec **`strateOf(yhat)` SERVEUR** et **α/nMin imposés serveur** ([C-10]) ; honnêteté keyée présence-de-calib ; texte servi ([C-11]) ; garde anti-override class-lock ; `attestation-binding` : ligne de la nouvelle classe.
3. **Adaptateur** `fromRealizedBook` (A-6, `packages/monark/src/adapter-book.ts`) : construit le `Prediction` (ŷ) depuis l'artefact de book réalisé, `binding_broken` fail-closed ; **`fromAttestedBook` existant intact** (`:88-189`).
4. **Classe réelle hikae** (A-7, `packages/hikae/src/liquidable-24h.ts`) : classe réelle (retrait de la docstring « no source exists » `:9-13`, `NMIN 99→100` `:32`) — ou item formé si hors périmètre R-25 (voir §7 / Q-8).
5. **Retrait `cascade-liquidable-24h`** ([C-18]) : l'outil `cascade` et sa classe fixture disparaissent (footprint mesuré §7) ; re-pin trace h5 ; `fleet.ts` re-câblé sur la nouvelle jambe servie.
6. **Test d'intégration non-LLM** `u4b_gate_serves_region_from_real_artifact` : charge la calib committée, construit un `Prediction` depuis l'artefact RÉEL via `fromRealizedBook`, `strateOf` serveur, asserte `covered` `[ŷ−q̂,ŷ+q̂]` + digest pour n≥nMin, `under_calib` pour n<nMin.

**Scission pré-déclarée -2a / -2b** (R-25, §7) : **-2a** = registre + dispatch servi + `strateOf` + adaptateur + test d'intégration (le cœur « branchement servi » de la mission) ; **-2b** = retrait `cascade` (footprint large mesuré) + re-pin h5 + re-câblage `fleet.ts` + textes publics. La scission est **imposée** (pas seulement conditionnelle) par le footprint mesuré du retrait cascade (§7).

---

## §2. Livrables (liste fermée par sous-lot ; test/oracle) — PROPOSÉS

### -2a — branchement servi (cœur)

| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| 2a-1 | `apps/harness/src/calibration.ts` | K entrées `CommittedCalibration` classe A (une/strate committable), `taskClass="liquidation-eligible-coverage"`, `predictorId=<base>/s<k>` ; `UKEMI_LIQ_*_CALIB` (number[]), `_DIGEST_PINNED`, garde de digest à l'import par strate (motif USDe `:165-170`), provenance MEASURED (α, n, nMin, q̂, sha séries, coupes, caveat K=2). Constante `UKEMI_LIQ_PREDICTOR_BASE` (base épisode frais, du meta `cell_a.predictor_id` de la fixture -1b). | `u4b_calib_registry_digest_guard_per_stratum` |
| 2a-2 | `apps/harness/src/calibration.ts` + `apps/harness/src/ukemi-strata.ts` (**neuf, pur**) | `STRATA_CUTS_SERVED = [2e11, 1e13, 1e14]` (number, committés serveur) + `strateOf(yhat:number)` pur ; pin-test croise la valeur GELÉE `STRATA_CUTS` du scorer (voir D-4). | `u4b_served_strata_cuts_match_frozen` |
| 2a-3 | `apps/harness/src/tools/gate.ts` | `TASK_LIQ_ELIGIBLE="liquidation-eligible-coverage"` ; `liqEligibleVerdict()` (motif `stableRunVerdict:446-489`) : `Number.isSafeInteger(yhat)` fail-closed → `k=strateOf(yhat)` serveur → `predictorId=UKEMI_LIQ_PREDICTOR_BASE+"/s"+k` → `lookupCommittedCalibration` → `splitQuantile(scores, 0.01, 100)` **α/nMin serveur** → `buildIntervalRegion(yhat−q̂, yhat+q̂)` → `buildVerdict` (region `interval`) ; sinon `under_calib`. Dispatch `runGate:596-604` étendu. **Anti-override class-lock** de la classe (`:555-565`). Honnêteté `honestyText:500-510` + constantes servies. | `u4b_gate_dispatch_serves_committed_stratum`, `u4b_gate_abstains_uncommitted_stratum`, `u4b_strate_of_is_server_side`, `u4b_committed_class_alpha_nmin_server_side`, `u4b_byo_cannot_override_committed_liq_class` |
| 2a-4 | `apps/harness/src/attestation-binding.ts` | Ligne `["liquidation-eligible-coverage", []]` (aucun sujet `attested` accepté dans ce lot ; le book n'est pas un feed de prix attesté — D-5). | `u4b_attested_not_accepted_for_liq_class` |
| 2a-5 | `packages/monark/src/adapter-book.ts` (A-6) | `fromRealizedBook(...)` : book réalisé (+ D_e, `emode_raw`) → `Prediction` `{task_class:"liquidation-eligible-coverage", yhat, predictor_id, produced_at}` ; **`yhat` = ENTIER base 8-déc** (devise de base Aave, = unité des scores committés à scale=1, D-1) ; **lie par `book_digest`** ; `binding_broken` fail-closed (compte non mono-collatéral WETH / non_evaluable ⇒ AUCUN ŷ émis, jamais estimé). `predictor_id` émis = **provenance seule** : le `gate` re-dérive la clé committée serveur (`UKEMI_LIQ_PREDICTOR_BASE`+`/s`+`strateOf(yhat)`) et **ignore** le `predictor_id` de l'appelant pour le lookup (C-10, l'appelant ne choisit ni sa strate ni sa clé). **`fromAttestedBook`/`toAttestedBook` intacts**. | `u4b_adapter_from_realized_book_binds_and_fail_closes`, `u4b_yhat_is_base8dec_integer` (ŷ en décimales-USD ⇒ strate fausse ⇒ ROUGE), `adapter_book_existing_pins_unchanged` |
| 2a-6 | `apps/harness/test/` (ou `apps/sentinel/test/`, voir Q-7) | **`u4b_gate_serves_region_from_real_artifact`** : artefact réel → `fromRealizedBook` → `runGate` (MCP `registry.run`) → asserte `covered [ŷ−q̂,ŷ+q̂]` + `calib_digest` (n≥nMin) et `under_calib` (n<nMin). | branchement prouvé bout en bout (non-LLM) |
| 2a-7 | `scripts/emit-u4b-calibration.mjs` (**neuf**) OU rapport orchestrateur | Émetteur du bloc source `calibration.ts` depuis `buildRegistryEntries` gelé (motif `record-usde-calib.mjs` : le worker n'écrit pas le dépôt, l'orchestrateur épingle — R-20). Voir D-3 / Q-3. | `u4b_registry_recomputes_from_scores_jsonl` (existe déjà, `ukemi-u4b-scores.test.ts:215`) — rejoué sur le JSONL FRAIS |

### -2b — retrait cascade + re-pin + re-câblage (scindé par R-25)

| # | Fichier(s) | Contenu | Test / oracle |
|---|---|---|---|
| 2b-1 | `apps/harness/src/tools/{cascade.ts (suppr.), gate.ts, registry.ts, schema-projection.ts, openapi.ts}`, `apps/harness/src/http.ts` | Retrait de l'outil `cascade` et de la classe fixture `cascade-liquidable-24h` : `ALLOWED_TOOL_NAMES` 4→3 (`registry.ts:32`), retrait du descripteur, schémas cascade, route miroir, `TOOL_ERROR_NAMES` `CascadeToolError` (`http.ts:36`), constantes `TASK_CASCADE`/`CASCADE_*`. | `no_cascade_class_in_harness` (grep=0 hors fixtures/site), suites `registry`/`http`/`openapi`/`server` mises à jour |
| 2b-2 | `packages/ukemi/**` | Décision : retirer aussi les primitives cascade v0 (`lattice.ts`, `index.ts`, tests, fixtures) OU garder `@monark/ukemi` (treillis U-2a) et ne retirer que le tool. Voir Q-5. | `lattice.test.ts` ajusté ; item « `@monark/ukemi` sans consommateur servi » (D-9) |
| 2b-3 | `fixtures/h5-e2e-trace.json` + `fixtures/PROVENANCE-h5-e2e-trace.md` + `test/h5-trace-builder.ts` + `apps/harness/test/h5-e2e-probe.test.ts` | Re-pin trace h5. **Proposé (défaut)** : l'étape 4 `cascade-gate` (vacue) est **REMPLACÉE par une étape `liquidation-eligible-coverage`** portant un ŷ committé ⇒ la jambe servie d'Ukemi est prouvée sur le fil h5 aussi (ADR-M020 D3 « h5 re-pin » ; l'anti-vacuité y est visible : la région DÉPEND de ŷ). L'étape `gate` **portant `attested`** (ADR-M019 item 1) reste un **item formé séparé** (§11), sauf go orchestrateur pour la joindre ici. `h5-e2e-trace.json` est EXCLU R-25 (fixture) ; le builder/probe COMPTENT. | `probe_harness_records_real_decision` (re-pinné) |
| 2b-4 | `scripts/verify-harness.mjs`, `skills/monark/{SKILL.md,INTEGRATION.md,DEMO.md}`, `apps/harness/README.md`, `README.md`, `test/skills.test.ts`, `vocab-banned.json`/`scripts/grep-forbidden.mjs` | « Four tools » → « three tools » {attest, gate, calibrate} ; retrait des mentions `cascade-liquidable-24h` ; ajout honnête de la classe `liquidation-eligible-coverage` servie. | `test/skills.test.ts`, `gate:vocab`, `lang:gate` |
| 2b-5 | `apps/site/lib/fleet.ts` (registre, oracle-porteur) | Re-câblage `Ukemi.wiring` : `served_by` = « MCP gate / liquidation-eligible-coverage (committed Mondrian region per stratum) » ; `integration_test` = `["u4b_gate_serves_region_from_real_artifact"]` ; `note` digit-free honnête. **Voir Q-6** (câblage registre gaté vs retouche visuelle 101). | `fleet_register_built_set_is_frozen` (`test/ci-gates.test.ts:800`) |
| 2b-6 | `scripts/export-exclude-tests.json` / `export-exclude-data.json` | Ajouter les tests/données U-4b servis restants au périmètre d'exclusion si `upcoming` ; retirer ce qui devient servi (motif C-V-8). | `export:check`, `harness-export.test.ts` |

---

## §3. Décisions PROPOSÉES (D-n) — le worker ne tranche pas les décisions de valeur ; il propose, l'orchestrateur/validateur/investisseur tranchent

- **D-1 — Ce qui est SERVI : une région conforme par strate, JAMAIS une probabilité.** Pour un ŷ **porté par l'appelant**, le `gate` renvoie une **région intervalle `[ŷ − q̂_k, ŷ + q̂_k]`**, k = `strateOf(ŷ)` **serveur**, q̂_k = quantile split-conformal committé de la strate k (α=0,01). **Unité de ŷ (à épingler, D-7/2a-5)** : **entier, base 8-déc** (devise de base Aave, 8 décimales), **même unité que les scores committés à `scale=1`** — seule unité où `strateOf` (coupes `[2e11,1e13,1e14]`) et `[ŷ−q̂,ŷ+q̂]` sont cohérents ; un ŷ en décimales-USD (÷1e8) mettrait strate et région en unité indéfinie (mutant unité §6). **Couverture CONDITIONNELLE, non vérifiée serveur** : la garantie vaut **uniquement si ŷ a été produit par la règle close-factor GELÉE** (`u4b-scores.mjs` sha `9ad20666…`) sur un compte mono-collatéral WETH au premier franchissement ; MONARK ne le vérifie pas (motif `CALIBRATE_LABEL` « does not validate that the supplied numbers are nonconformity scores of any model », `tools/calibrate.ts`). **Cette clause DOIT figurer dans le texte servi** (son absence = sur-revendication, mutant h §6). La déclaration de couverture suit **Barber–Candès–Ramdas–Tibshirani 2023 Thm 2** (poids unitaires, motif USDe `gate.ts:90-97`), avec le **caveat K=2** (aucune couverture revendiquée sur un nouvel événement ; échangeabilité H-3 non supposée). **Aucune** clé interdite (`FORBIDDEN_KEYS`, `packages/contracts/src/forbidden-keys.ts:11-31` : `p_depeg`, `confidence`, … ; `assertNoForbiddenKey` re-asserté à la sortie `gate.ts:635`). « never a probability of being right » (skill `SKILL.md:11`).
- **D-2 — La classe B reste HORS SERVICE.** `liquidation-realized-given-liquidated` est calculée hors ligne (-1a, `CELL_B_DIGEST` gelé) mais **jamais servie** (décision 108) : **aucune** branche de dispatch, **aucune** clé committée, **aucune** phrase d'honnêteté. Le générateur gelé n'émet que A (`record-u4b-calib.mjs:6-8,:78-81`). Test : grep `liquidation-realized-given-liquidated` dans `apps/harness/src` = 0.
- **D-3 — Comment `calibration.ts` est écrit (R-20).** Le générateur gelé imprime un rapport SANS les tableaux de scores (`record-u4b-calib.mjs:80` — le rapport omet `scores`). Deux voies : **(a)** un émetteur neuf `scripts/emit-u4b-calibration.mjs` important le `buildRegistryEntries` gelé, qui **imprime le bloc source TS** (tableaux + digests + entrées) que l'orchestrateur colle (motif `record-usde-calib.mjs:183-187`, « the orchestrator commits — R-20 ») ; **(b)** l'orchestrateur épingle à la main depuis la sortie de `buildRegistryEntries`. **Proposé : (a)** (K strates, tableaux volumineux). Dans les deux cas, `u4b_registry_recomputes_from_scores_jsonl` (existe, `ukemi-u4b-scores.test.ts:215-242`) **recompute depuis le JSONL FRAIS in-repo** et asserte les digests committés (anti fixture-auto-enregistrée). **Voir Q-3.**
- **D-4 — `strateOf` serveur : re-déclaration pincée, PAS import du scorer gelé.** Le scorer gelé (`u4b-scores.mjs:50-59`) exporte `strateOf`/`STRATA_CUTS` avec le commentaire « imported by gate.ts » (`:51`). **Mais** `u4b-scores.mjs` importe `node:fs` (`:31`) et `apps/sentinel/src/ukemi/{wadray,abi}.ts` (`:35-36`) ; `gate.ts` (et tout `src/tools/**`) est **K-8 pur** (« imports no `node:fs`/…, calls no `fetch` » `gate.ts:5-8` ; scan mesuré §MESURES). Importer le scorer dans `gate.ts` casserait K-8 + la frontière apps/harness↔apps/sentinel. **Proposé** : re-déclarer `STRATA_CUTS_SERVED = [2e11, 1e13, 1e14]` (number, exactement représentables en float64) + `strateOf(yhat:number)` dans un module pur du harness ; un **test** (dans `apps/sentinel/test/`, où le cross-import du scorer est déjà prouvé — `ukemi-u4b-scores.test.ts:14`) importe la valeur GELÉE `STRATA_CUTS` et asserte `Number(c)` par index + les cas frontières (`u4b_strate_boundaries:203-213`). **Écart déclaré** vs le commentaire du fichier gelé (le fichier gelé ne peut être édité).
- **D-5 — `attested` non accepté pour la classe liq (ce lot).** Ligne `["liquidation-eligible-coverage", []]` dans `attestation-binding.ts` (motif `cascade → []` `:33`, `stable-run → []` `:32`) : un `attested` (prix) sur cette classe échoue proprement (`checkAttestedConsistency:51-53`). Le **témoin résiduel oracle/marché** (book attesté → `attested.residual`) est **U-5** (ADR-M020 D3 ligne 4), HORS lot.
- **D-6 — α/nMin IMPOSÉS serveur ([C-10]).** La classe committée utilise **α=0,01, nMin=100** dans le dispatch (constantes serveur, PAS `params.alpha`/`params.nMin` que l'appelant contrôle `gate.ts:466`). **Interaction L3 réelle** : `GateInput.nMin = params.nMin` (`gate.ts:623`) et `nCalib = verdict.n_calib` sont lus par le L3 `gate()` (`:632`). Si `liqEligibleVerdict` force nMin=100 en interne MAIS que l'appelant passe `params.nMin=5` au L3, le L3 peut atteindre une **action différente** de l'`under_calib` du verdict (le L3 décide DEFER/ABSTAIN sur `nCalib` vs `nMin`). **Proposé (défaut) : refuser (400)** un `params.alpha ≠ 0,01` ou `params.nMin ≠ 100` sur cette classe committée ⇒ `GateInput` cohérent, région servie = calib committée exacte. Mutant : appelant α=0,5 change q̂ servi ⇒ ROUGE (doit NE PAS changer). **Voir Q-4** (refuser 400 vs ignorer les params en forçant les constantes serveur dans `GateInput`).
- **D-7 — ŷ porté par l'appelant, borné 2^53, non re-vérifié serveur (ce lot).** Le chemin servi calcule uniquement `strateOf` + la région (K-8 : ni book, ni D_e, ni réseau au call time) ; ŷ = `prediction.yhat`, lié à un `book_digest` par `fromRealizedBook`. `Number.isSafeInteger(yhat)` fail-closed (la région base-8-déc `[ŷ−q̂,ŷ+q̂]` n'est exacte que < 2^53, cohérent avec la borne des scores C-9). MONARK **ne vérifie pas** le ŷ de l'appelant (clause BYO-label). Le **calcul serveur de ŷ** (adaptateur wiré côté serveur depuis un book attesté) est **U-5**, HORS lot (§10).
- **D-8 — Échelle (`scale`) : défaut 1 servi, STOP déclaré si > 2^53.** Les scores committés sont `s/scale` (`record-u4b-calib.mjs:39`) ; sur e2, `scale=1` tient (max score < 2^53, `ukemi-u4b-scores.test.ts:234`). Si l'épisode FRAIS force `scale>1` pour une strate (whale ≥ 1 M$), c'est un **STOP déclaré au G1 de -2** : `CommittedCalibration` (`calibration.ts:185-191`) n'a pas de champ `scale` ; l'ajouter change l'interface partagée du registre. **On déclare le déclencheur, on ne pré-résout pas.** (Alternative : la région servie mult. q̂ par `scale` avant `[ŷ−q̂·scale, …]` — décision d'interface, voir Q-9.)
- **D-9 — `@monark/ukemi` perd son seul consommateur servi** après retrait du tool cascade (précédent ADR-M019 D5 : dépendance déclarée que rien n'importe = dérive M018). Item formé (§11), pas résolu ici.
- **D-10 — Ordre de fusion.** -2a AVANT -2b (le nouveau chemin servi existe AVANT que l'ancien soit retiré ⇒ aucune fenêtre sans jambe servie pour Ukemi ; ADR-M020 U-2 amendement décision 51 « aucune fenêtre sans chemin servi »). -2b re-pin h5 et re-câble `fleet.ts` dans la même fusion que le retrait (atomicité de l'oracle).

---

## §4. Tuyaux (ADR-M018 D3 ; entrée → sortie → état → test NON-LLM) — PROPOSÉS

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration NON-LLM |
|---|---|---|---|---|
| scores FRAIS → registre | `U4b-scores-<épisode>.jsonl` (fixture -1b, sha-pinnée, in-repo) → `buildRegistryEntries` GELÉ (classe A) | entrées committées `calibration.ts` (K strates) | committé ; garde digest/strate fail-closed à l'import | `u4b_registry_recomputes_from_scores_jsonl` (recompute in-repo, n/p/q̂/digest ; > 2^53 ⇒ throw) |
| ŷ réalisé → Prediction | artefact book réalisé (+D_e, `emode_raw`) → `fromRealizedBook` (A-6) | `Prediction` `{liquidation-eligible-coverage, yhat, <base>}` lié `book_digest` | pur ; `binding_broken` fail-closed | `u4b_adapter_from_realized_book_binds_and_fail_closes` |
| **région SERVIE** | `calibration.ts` (K entrées) + `strateOf(yhat)` **serveur** + α/nMin serveur | **MCP `gate` + miroir HTTP `POST /gate` → `GateDecision`** (region `interval` [ŷ−q̂,ŷ+q̂] si n≥nMin ; `under_calib` sinon) | **`built`** ssi test servi vert ; sinon `upcoming` | **`u4b_gate_serves_region_from_real_artifact`** + `probe_harness_records_real_decision` (re-pinné) |
| cascade retrait | outil `cascade` + classe fixture + treillis (Q-5) | classe fixture disparue ; `ALLOWED_TOOL_NAMES` 4→3 | -2b | `no_cascade_class_in_harness` (grep=0 hors fixtures/site) |
| registre public re-câblé | `fleet.ts` `Ukemi.wiring` (registre, source de vérité) | `/roadmap`, `/fleet`, panneau (surface visuelle = SITE-U4B, 101) | -2b (registre gaté) / SITE (visuel ungated) | `fleet_register_built_set_is_frozen` |

---

## §5. Invariants (à réasserter inchangés ; blobs HEAD / pins de test) — PROPOSÉS

- **Code GELÉ U-4b intact** : `scripts/census/u4b/u4b-scores.mjs` (`9ad20666…`), `u4b-reduce.mjs` (`a5e66cd3…`), `scripts/record-u4b-calib.mjs` (`5733daeb…`), + fermeture transitive `wadray.ts` (`7bee76fc…`), `abi.ts` (`3376eb08…`), `l1-split.ts` (`9206df91…`), `rpc.ts` (`0e232519…`) — **byte-identiques** (ADR-U4b D4 ; le prereg -1b les fige ; U-4b-2 les **consomme** sans éditer). `u4b-reduce.mjs` **NE DOIT PAS** être modifié (mission).
- **`book_digest`** (recorder PIN) = `034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921` (`apps/sentinel/test/ukemi.test.ts:29` ; `fromRealizedBook` lie par lui — A-6 ne recalcule pas le book).
- **Fixtures `u4/` byte-identiques** (`743e9499…/97035715…/8b84e095…`, `ukemi-u4b-scores.test.ts:244-248`) ; **fixtures `u4b/`** sha-pinnées ; `U4-*` e2 intactes.
- **Digests de cellule -1a** : A `dc9ab572…` (`ukemi-u4b-scores.test.ts:26`), B `89897a61…` (`:27`) — inchangés (le générateur gelé les reproduit). Les digests **committés** en -2 viennent de l'épisode FRAIS (≠ e2, jamais servi).
- **Contrats gelés (5) intacts** : `task_class` est un **string libre** (`schemas/prediction.schema.json:11`, `schemas/coverage-verdict.schema.json:24`, `packages/contracts/src/types.ts:182,212`) ⇒ **ajouter la classe et retirer cascade ne touchent AUCUN enum gelé** (les occurrences « cascade » des schémas sont des **descriptions**, `coverage-verdict.schema.json:5`). `method` enum `["split","hac-cp"]` (`:25`) : la classe sert `"split"`. `assertClosedGateDecision`/`assertNoForbiddenKey` (`gate.ts:634-635`) inchangés.
- **Anti-close bis (décision 110)** : les valeurs committées sont des scores `|Y−ŷ|` (dérivés de logs on-chain publics), constantes on-chain exemptées ; aucune probabilité, aucun `Λ=0` (ADR-M020 D2).

---

## §6. Tests imposés + mutants nommés (tueurs non tautologiques) — PROPOSÉS

**Tests d'intégration / dispatch (non-LLM)** :
1. `u4b_gate_serves_region_from_real_artifact` — artefact réel → `fromRealizedBook` → `runGate` → `covered [ŷ−q̂,ŷ+q̂]`+digest (n≥nMin) et `under_calib` (n<nMin). **Branchement bout en bout.**
2. `u4b_gate_dispatch_serves_committed_stratum` / `u4b_gate_abstains_uncommitted_stratum` — un ŷ dans une strate committée ⇒ région ; dans une strate n<nMin ⇒ `under_calib`.
3. `u4b_strate_of_is_server_side` — l'appelant ne choisit pas sa strate ; deux ŷ de strates différentes ⇒ deux `predictor_id` ⇒ deux q̂.
4. `u4b_committed_class_alpha_nmin_server_side` — `params.alpha`/`params.nMin` de l'appelant n'altèrent pas la région committée (D-6).
5. `u4b_byo_cannot_override_committed_liq_class` — une calibration BYO sur `liquidation-eligible-coverage` (même avec un `predictor_id` nu) est refusée 400 (class-lock, D anti-override).
6. `u4b_served_strata_cuts_match_frozen` — `STRATA_CUTS_SERVED` == `Number(STRATA_CUTS)` gelé, par index + frontières.
7. `u4b_registry_recomputes_from_scores_jsonl` — (existe, `:215`) rejoué sur le JSONL FRAIS : n/p/q̂/digest/under_calib ; **+ asserte `meta.cell_a.predictor_id` (JSONL FRAIS) === `UKEMI_LIQ_PREDICTOR_BASE` committé** (mutant : base dérivée/drift ⇒ lookup miss serveur ⇒ ROUGE).
8. `u4b_calib_registry_digest_guard_per_stratum` — drift d'un tableau de scores ⇒ throw à l'import.
9. `u4b_adapter_from_realized_book_binds_and_fail_closes` — book conforme ⇒ Prediction liée `book_digest` ; envelope non-conforme ⇒ `binding_broken`.
10. `no_cascade_class_in_harness` — grep `cascade-liquidable-24h` dans `apps/harness/src` = 0 (hors fixtures/site).
11. `u4b_liq_description_makes_no_probability_claim` — la description/le texte servi ne porte aucun token de probabilité/score (motif `cascade_description_makes_no_probability_claim`) ; passe `gate:vocab`, `lang:gate` (anglais, ASCII — note diacritique `gate.ts:86-88`).

**Mutants nommés (chacun ROUGE)** :
- (a) **α/nMin de l'appelant appliqués** au lieu des constantes serveur ⇒ q̂ servi change ⇒ ROUGE (test 4).
- (b) **`strateOf` côté appelant** (predictor_id porté par l'appelant, non re-dérivé) ⇒ un appelant atteint une strate flatteuse ⇒ ROUGE (test 3).
- (c) **BYO admis sur la classe liq** (garde anti-override sans class-lock) ⇒ ROUGE (test 5).
- (d) **coupe off-by-one** dans `STRATA_CUTS_SERVED` ⇒ ROUGE (test 6, `u4b_strate_boundaries`).
- (e) **garde digest/strate retirée** ⇒ drift silencieux ⇒ ROUGE (test 8).
- (f) **`fromRealizedBook` ne lie pas `book_digest`** (anti-vacuité : ŷ varié ⇒ décision varie, ADR-M020 D3) ⇒ ROUGE (test 1/9).
- (g) **classe B servie** (branche de dispatch ajoutée) ⇒ ROUGE (grep D-2).
- (h) **texte de sur-revendication** : servir la région SANS la **clause conditionnelle** (« couverture valable seulement si ŷ produit par la règle close-factor gelée, non vérifié serveur », D-1), ou avec une probabilité / un adjectif « calibrated » / plus que la calib committée ⇒ ROUGE (test 11, motif A7(f) `gate.ts:498`).
- (i) **`Number.isSafeInteger(yhat)` retiré** ⇒ ŷ > 2^53 sert une région fausse ⇒ ROUGE (test D-7).
- (j) **ligne `attestation-binding` liq absente** ⇒ `attested` glisse sur un chemin non voulu ⇒ ROUGE (test 2a-4).
- (k) **unité de ŷ** : `fromRealizedBook` émet ŷ en décimales-USD (÷1e8) au lieu de base 8-déc ⇒ `strateOf` classe faux, région en unité indéfinie ⇒ ROUGE (`u4b_yhat_is_base8dec_integer`, test 2a-5).
- (l) **base `predictor_id` dérivée** ≠ `UKEMI_LIQ_PREDICTOR_BASE` committé ⇒ lookup serveur rate ⇒ ROUGE (test 7).

**Contrôle live indépendant (G2-delta, contexte frais)** : rejeu de `u4b_gate_serves_region_from_real_artifact` + recompute du registre depuis le JSONL FRAIS, digests byte-identiques ; anti-vacuité (ŷ ∈ {petit, grand, hors strate} ⇒ décisions distinctes pour les strates committées).

---

## §7. R-25 estimé (grep des sites) + scission — PROPOSÉ

**Garde R-25** (`.github/workflows/ci.yml:43,65`, plafond **1205**) : pathspec = base **`.`** MOINS `{docs/**/*.md, docs/G1|G2-lot-*.md, packages/*/docs/S2-*, package-lock.json, fixtures/**/*.{json,jsonl,csv}, apps/sentinel/test/fixtures/**, apps/bell/test/fixtures/series/**}` (mesuré, `ci.yml:65`). ⇒ **tout le reste COMPTE** : `apps/site/**` (dont `fleet.ts` — **PAS** `src`-gated), `scripts/**`, tous les `*.test.ts`, ET les **tableaux de scores** de `calibration.ts` (précédent USDe : 613 scores ≈ 79 lignes, `:77-155`). **EXCLUS utiles ici** : `fixtures/h5-e2e-trace.json` (re-pin gratuit R-25), les `U4b-*.jsonl` sous `apps/sentinel/test/fixtures/**`. **Conséquence Q-6** : `fleet.ts` étant compté ET oracle-porteur, son re-câblage est naturellement **gaté** dans -2b.

**Footprint mesuré `cascade` (grep, hors `docs/`)** : **379 occurrences / 54 fichiers** (MESURES). Le retrait entier de l'outil (pas seulement la classe) touche : `cascade.ts` (suppr., 29), `gate.ts` (21), `registry.ts` (`ALLOWED_TOOL_NAMES`), `schema-projection.ts` (20), `openapi.ts`, `http.ts` (2), + tests `cascade.test.ts` (53), `gate.test.ts` (32), `http.test.ts` (15), `registry.test.ts` (7), `openapi.test.ts` (5), `server.test.ts` (11), `calibrate.test.ts`, `packages/ukemi/**` (Q-5), `scripts/verify-harness.mjs` (6), `skills/**` (8), `README.md` (6), `apps/harness/README.md` (8), fixtures h5 (28+7, exclues R-25), `apps/site/**` (fleet.ts 9 + fleet-presentation 3 + ukemi-panel 5 + gate-sim 3 + …). **La cascade.ts:53 déclare déjà « Removed with the cascade tool at U-4 »** ⇒ retrait ENTIER du tool est l'intention.

**Estimation (ins+del gatés)** :

| Sous-lot | Contenu | Est. |
|---|---|---|
| **-2a** | `calibration.ts` (K tableaux + gardes ; ~120-160 selon n/strate FRAIS) + `gate.ts` dispatch (~70) + `ukemi-strata.ts` (~25) + `adapter-book.ts` A-6 (~70) + `attestation-binding.ts` (~4) + émetteur (~60) + tests/mutants (~250) | **≈ 550-650** |
| **-2b** | retrait cascade (src ~200 + tests ~250) + re-pin h5 + `fleet.ts` re-câblé + skills/README/verify + export-exclude | **≈ 450-600** |

**Projection** : -2a + -2b ≈ 1000-1250 ⇒ **2 PR** (scission **imposée**). **Incertitude déclarée** : le n par strate committable dépend de l'épisode FRAIS (U-4b-1b non couru) ⇒ la taille des tableaux `calibration.ts` (donc R-25 de -2a) est un **estimé conditionnel** ; si -2a > 1205 (whales nombreux, strate ≥1M$ committable et volumineuse), scinder -2a par famille de strates (registre / dispatch). A-7 (`liquidable-24h.ts`) peut être un item séparé si le budget serre (Q-8).

---

## §8. Oracle — PROPOSÉ

`npm run ci` sur l'arbre FUSIONNÉ (base + nouveaux) : `gate:vocab`, typecheck 0, **tous tests verts**, `lang:gate` 0, `export:check` 0, lint 0, ratchet, `series_pinned`, `no_secret_in_repo`. Oracle ciblé par graphe de dépendances : `apps/harness` (gate/registry/http/openapi/calibration), `packages/monark` (adapter), `packages/hikae` (A-7), `test/ci-gates.test.ts` (`fleet_register_built_set_is_frozen`), `test/h5-e2e-probe.test.ts`, `test/skills.test.ts`. Restauration sha-exacte des mutants (PRE==POST, preuve **blobs HEAD** sous régime B, AM-1). Aucun réseau (fixtures committées).

---

## §9. Critères d'acceptation — PROPOSÉS

1. `npm run ci` vert ; oracles §8 verts.
2. **Branchement (CA-11)** : rien de nouveau `built` tant que `u4b_gate_serves_region_from_real_artifact` n'est pas vert ; la région servie **DÉPEND de ŷ** (anti-vacuité, ADR-M020 D3) pour les strates committées ; `under_calib` en chiffres pour les strates n<nMin.
3. Mutants **≥ 10** rouges (§6), restauration sha-exacte.
4. **Honnêteté** : jamais « probabilité de liquidation » ni `Λ=0` ; aucune clé interdite ; texte servi porte le caveat K=2 et « un OUI de H-3 ne licencie rien de plus » ([C-11]) ; « never a probability of being right » conservé.
5. **Invariants §5** réassertés (code gelé U-4b byte-identique, `book_digest`, contrats gelés, fixtures).
6. R-25 ≤ 1205/PR (scission -2a/-2b ; -2a re-scindable, Q-8).
7. **Registre ⇔ chemin servi** : `fleet.ts` `Ukemi.wiring` re-câblé sur la jambe réelle avec un `integration_test` existant sous `WIRING_TEST_ROOTS` (`test/ci-gates.test.ts:773-779`) ; site visuel intact (101) ou item SITE-U4B formé.
8. Provenance : modèle résolu `claude-opus-4-8[1m]` (G1/G2), générateur ≠ relecteur, `error_origin` assigné au G7 ; contrôle live G2-delta contexte frais.

---

## §10. HORS lot (déclaré, chacun un item à déclencheur — jamais un « dû » nu)

- **U-5 — outil servi COMPLET** (dashboard §3 `:48` ; ADR-M020 D4 U-5) : calcul serveur de ŷ (adaptateur wiré côté serveur depuis un book attesté), **témoin résiduel oracle/marché** (`attested.residual`, ADR-M020 D3 ligne 4 ; D-5 ci-dessus). U-4b-2 ne sert que la **région** sur un ŷ porté par l'appelant.
- **U-6 — course LIVE** (dashboard §3 `:49` ; décision 119 HORS portée ; ADR-M020 D4 U-6 : `sentinel-2` → `/ukemi/` servi, book complet, `wiring` (c)) : go investisseur, go conditionnel pré-enregistré (décision 122).
- **U-7 — biblio paginée / rejeu public / papier** (dashboard §3 `:50` ; ADR-M020 D4 U-7 : *Eligible is not liquidated…*).
- **Classe B servie** : item formé (décision 108 : servie « quand un 3ᵉ épisode existera »).
- **Classe shortfall** `cluster-shortfall-given-oracle-path-24h` (ADR-M020 D5, seconde classe) : hors décision 108 (classe A seule au release).
- **Surface visuelle du site** (`ukemi-panel.tsx`, panneaux, logo `concept 3`, upload) : item **SITE-U4B**, décision 101 (backend branché d'abord, retouche conjointe investisseur ensuite).

---

## §11. Items formés (déclencheur, propriétaire) — PROPOSÉS

1. **`@monark/ukemi` sans consommateur servi** après retrait du tool cascade (D-9 ; précédent ADR-M019 D5). Déclencheur : G1 de -2b. Propriétaire : orchestrateur.
2. **`scale > 2^53` sur une strate FRAÎCHE** (D-8) : STOP déclaré ; ajout d'un champ `scale` au registre = décision d'interface (Q-9). Déclencheur : G1 de -2 si l'épisode l'impose.
3. **A-7 `liquidable-24h.ts` (classe réelle)** en item séparé si R-25 de -2a serre (Q-8). Déclencheur : G1 de -2a.
4. **SITE-U4B** (surface visuelle, décision 101). Déclencheur : backend branché (fin -2b), retouche conjointe investisseur.
5. **Classe B / classe shortfall servies** (décision 108 / ADR-M020 D5). Déclencheur : 3ᵉ épisode / décision investisseur.
6. **Écart au commentaire du fichier gelé** (« imported by gate.ts » `u4b-scores.mjs:51`) : le fichier gelé ne peut être édité ; la re-déclaration pincée (D-4) est l'implémentation réelle. Consigné, non une dette (le pin-test prouve l'équivalence).

---

## §12. QUESTIONS pour l'orchestrateur (choix/écarts NON couverts par les sources — le worker ne tranche pas)

- **Q-1 — Épisode FRAIS (déjà posé en PRÉCONDITION DURE, header).** U-4b-2 CONSOMME `U4b-scores-<épisode>.jsonl` (produit par U-4b-1b, non couru). Ce n'est **pas** une question ouverte mais un **prérequis dur** (header) : -2 ne démarre pas sans la fixture FRAÎCHE sha-pinnée in-repo + PROVENANCE. **À confirmer par l'orchestrateur** : (a) le déclencheur (clôture de la course -1b) ; (b) que le littéral `meta.cell_a.predictor_id` FRAIS est committé tel quel comme `UKEMI_LIQ_PREDICTOR_BASE` (test 7 l'asserte).
- **Q-2 — Nom de classe servie.** Le générateur gelé émet `task_class:"liquidation-eligible-coverage"` (`record-u4b-calib.mjs:55`), ADR-U4b l'emploie ; ADR-M020 D1(b) nomme `liquidation-realized-given-oracle-path-24h`. **Confirmer** que la classe SERVIE est `liquidation-eligible-coverage` (nom gelé par le générateur) — l'évolution de nommage M020→U4b est-elle actée ?
- **Q-3 — Écriture de `calibration.ts` (D-3).** Émetteur `scripts/emit-u4b-calibration.mjs` (proposé) vs épinglage à la main par l'orchestrateur (motif USDe) ? (Le worker n'écrit pas le dépôt — R-20.)
- **Q-4 — α/nMin appelant (D-6).** Sur la classe committée : **refuser 400** un `params.alpha≠0,01`/`params.nMin≠100`, ou **ignorer** les params et forcer les constantes serveur ? (Impact sur `GateInput.nMin` lu par le L3.)
- **Q-5 — Portée du retrait cascade (§7, D-9).** **Proposé (défaut) : garder `packages/ukemi/**`** (treillis Eisenberg-Noe/Rogers-Veraart, LIVRÉ en U-2a, `ADR-U2-clearing-lattice.md`, tests propres, annexe citée par ADR-M020 D1(a)) et **ne retirer que l'outil `cascade` + sa classe fixture** (`cascade.ts` + dispatch + schémas + route + `ALLOWED_TOOL_NAMES`). `@monark/ukemi` devient « sans consommateur servi, conservé comme annexe par ADR-U2 » (item 1, D-9). **Un lot U-4b-2 ne supprime pas le code d'un lot déjà livré.** **Confirmer** (ou : retirer aussi les primitives ? décision investisseur/ADR).
- **Q-6 — `fleet.ts` : câblage gaté vs décision 101.** Le re-câblage `Ukemi.wiring` est **oracle-porteur** (`fleet_register_built_set_is_frozen`, `test/ci-gates.test.ts:800`) : retirer cascade **casse** l'`integration_test` annoncé si `fleet.ts` n'est pas mis à jour dans la même fusion (le test reste vert avec un `served_by` périmé — seule la règle Branchement l'attrape, « un G7 ne clôt pas un lot dont un tuyau annoncé manque »). **Proposé** : le **registre** `fleet.ts` (câblage) est **gaté dans -2b** ; la **retouche visuelle** (`ukemi-panel.tsx`, panneaux, upload) reste **ungated / SITE-U4B (101)**. **Confirmer** cette scission registre/visuel.
- **Q-7 — Emplacement de `u4b_gate_serves_region_from_real_artifact`.** `apps/harness/test/` (importe la calib + gate) ou `apps/sentinel/test/` (importe le harness + fixtures u4b) ? Les deux sont dans `WIRING_TEST_ROOTS` (`test/ci-gates.test.ts:773-779`). Impact sur `fleet.ts.integration_test`.
- **Q-8 — A-7 dans -2a ou item séparé ?** Si R-25 de -2a serre (tableaux FRAIS volumineux), `liquidable-24h.ts` (A-7) devient un lot séparé. **Confirmer** la préférence (unitarité vs regroupement A-6/A-7).
- **Q-9 — Interface `scale` (D-8).** Si l'épisode FRAIS force `scale>1` : ajouter un champ `scale` à `CommittedCalibration` (change l'interface partagée) OU dé-scaler q̂ dans le dispatch (q̂·scale) OU STOP + retour investisseur ?
- **Q-10 — Ré-scinder -2a par famille de strates ?** Si -2a > 1205, scinder « registre + strateOf » / « dispatch + adaptateur + intégration » (ligne pré-déclarée, motif -2a/-2b).

---

## §Provenance (règle de branchement — tuyaux déclarés de CE brouillon)
**Entrées lues ce tour (lecture seule, `fichier:ligne` ouverts)** : `docs/G0-lot-u4b.md` (plié), `docs/adr/ADR-U4b-calibration-episode-frais.md`, `docs/G7-lot-u4b-1a.md`, `docs/CHECKPOINT2-lot-u4b-1a.md`, `docs/PLAN-u4b-prereg.DRAFT.md`, `docs/adr/ADR-M019-…md`, `docs/adr/ADR-M020-programme-ukemi.md`, `docs/CHANTIERS.md` (décisions 108/117/119, ~05:30 UTC), `docs/TABLEAU-DE-BORD.md` §3 ; code : `apps/harness/src/{calibration.ts,tools/gate.ts,tools/cascade.ts,tools/registry.ts,server.ts,http.ts,attestation-binding.ts}`, `scripts/record-u4b-calib.mjs`, `scripts/record-usde-calib.mjs`, `scripts/census/u4b/u4b-scores.mjs:1-70`, `packages/monark/src/adapter-book.ts`, `packages/hikae/src/liquidable-24h.ts`, `packages/contracts/src/forbidden-keys.ts`, `schemas/{prediction,coverage-verdict}.schema.json`, `apps/sentinel/test/ukemi-u4b-scores.test.ts`, `apps/site/lib/fleet.ts`, `test/ci-gates.test.ts` (extraits), `skills/monark/SKILL.md` ; greps (MESURES). **Sortie** : ce brouillon + `MESURES.md`, consommés par l'orchestrateur (vérification adversariale R-21), puis worktrees -2a/-2b. **État** : plan (aucun code, aucun réseau, aucun commit). **Réviseur** : orchestrateur `claude-fable-5-1` (R-21). Modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-21.
