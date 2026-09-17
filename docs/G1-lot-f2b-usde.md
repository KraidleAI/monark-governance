# G1 — Génération tracée, Lot F2-B (1re calibration committée `stable-run-velocity-24h`, population USDe)

- **Générateur** : worker implémenteur **`claude-opus-4-8[1m]`** (R-1 vérifié, préfixe `claude-opus-4-8`, effort max),
  dispatché par l'orchestrateur `claude-fable-5-1`. Branche `main`, base `3cfc4d2` (M011). 2026-09-17. **Aucun commit
  par le worker (R-20), aucun push.**
- **Spec** : `docs/PLAN-m008-f2b-usde.md` (checkpoint-1 ACCEPTE-AVEC-CORRECTIONS, C-1..C-9 foldées) ; ADR-M008 D7bis
  amendé 2026-09-17 + **Amendement bis** (clé `(task_class, predictor_id)`, option (i') advisor-defi) ; ADR-M011 NDG-1.
- **Données** : fixture `usde-calib-series.json` sha `7c33027a…9ef1` (695 calm + 6 run, 0 err, 0 C1-fail, deploy
  `18571358`) ; recorder critère pré-enregistré (S_floor 1e25, θ_stress 0.01, ρ≥0.30, nMin 50, α 0.10).

## Déroulé (deux passages)
1. **Passage 1 — STOP anti-circularité (correct)** : la mission imposait de retrouver le digest `2b5834e3…` par
   `calibDigest(@monark/contracts)` ; ça divergeait. Cause : le recorder scratchpad de l'orchestrateur calculait
   `sha256(JSON.stringify(scores))` ≠ `calibDigest` C5 (`SHA-256(float64_be trié)`). Le worker a refusé de pinner
   une valeur unilatéralement (P5) et a rendu une demande de consultation formée (digest + fork C-10).
   **`error_origin` = orchestrateur (recorder).**
2. **Nods orchestrateur** (après advisor-defi R-26) : (1) digest = `calibDigest` C5 sur les scores **régénérés via
   l'adaptateur** ; (2) C-10 = **option (i')**. Plus **A1** (advisor) : les scores recorder étaient à l'échelle 1e6
   (`usde-full-pull.mjs:120`) vs adaptateur 1e12 ⇒ régénération obligatoire, mesure AVANT code.
3. **Passage 2 — A1 puis (a)–(i)** : scores régénérés via `fromAttestedFlow` sur des `AttestedFlow` construits depuis
   la fixture ; n=613 (set identique) ; écart max|Δ|=4.11e-8, mean 1.22e-8 (troncature) ; q̂=1.3119228e-4 (support 61),
   q99=3.40093727e-4 (support 6) — jeu pré-enregistré **tient** ; q̂ croisé `splitQuantile` exact ; **digest final
   `c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c`** (`2b5834e3…` JSON et `0cbc7d5a…` scores-1e6
   écartés, présents seulement en `assert.notEqual`).

## Livrables (file:line)
- `packages/monark/src/adapter-narabi.ts` : `NARABI_FORMULA` + **`narabiPredictorId(chain, subject)`** (l.58 ; lowercase
  C5, rejette `|` B-3) ; `predictor_id` émis = `narabiPredictorId(flow.source.chain, flow.subject)` ; `NARABI_PREDICTOR_ID`
  retiré. `packages/monark/src/index.ts` : exports.
- `apps/harness/src/calibration.ts` : `USDE_STABLE_RUN_CALIB` (613), `USDE_STABLE_RUN_PREDICTOR_ID` (l.74),
  `USDE_STABLE_RUN_CALIB_DIGEST_PINNED` (l.158) + `calibDigest` recomputé + **assertion fail-closed à l'import**,
  `USDE_STABLE_RUN_CALIB_PROVENANCE` mesurée, **`lookupCommittedCalibration`** (l.207, registre UNIQUE). Aucune 2ᵉ garde.
- `apps/harness/src/tools/gate.ts` : `STABLE_RUN_COMMITTED_SENTENCE` (l.69) + `STABLE_RUN_UNCALIBRATED_SENTENCE`
  population-scopée ; `GATE_TOOL_DESCRIPTION` clause USDe keyée ; **`stableRunVerdict` keyé** (l.397) ;
  **`honestyText(taskClass, predictorId, isByo)`** (l.449) ; **garde BYO key-aware `overridesCommitted`** (l.505, A6).
  `registry.ts` : `honestyText(…, env.prediction.predictor_id, …)`.
- **h5** : `GATE_TOOL_DESCRIPTION` changée ⇒ `node scripts/record-h5-e2e-trace.mjs` ⇒ pin `09cd5b370808a43dfe5bac122ac71191485cd813449973ff3a8053ffa4693bf3`.
- **Fixtures** : `fixtures/usde-calib-series.json`, `fixtures/usde-calib-scores.json`, `fixtures/PROVENANCE-usde.md`,
  `scripts/record-usde-calib.mjs` (adaptateur 1e12 + `calibDigest` + auto-contrôle `[0,1]` + croisement L1 ; C-12 purgé).
- **Vocab** : `vocab-banned.json` scope `narabi_docs` + `scripts/grep-forbidden.mjs` (PROVENANCE + CLOTURE).
- **Clôture** : `docs/CLOTURE-lot-f2b-usde.md` — COMMITTABLE, C-13 (3 issues), rétrospective témoin, CAVEAT exclusion,
  résidus R-1..R-4, Barber 2023 NON cité (procurement dû).

## Tests (+10 → 222) et discrimination
`narabi_predictor_id_key_is_canonical_and_pipe_free` ; `gate_stable_run_usde_committed_region_A7b` ;
`gate_stable_run_family_isolation_fail_closed_A7acde` (mutant C-10 ⇒ 3 rouges, A7b vert) ;
`gate_stable_run_honesty_text_is_keyed_A2_A7f` ; `gate_stable_run_byo_anti_override_is_key_aware_A6` (mutants
class-only / lookup-retiré ⇒ rouges) ; `gate_stable_run_ndg1_zero_width_is_under_calib_reused` ;
`…noncommitted_key_abstains_under_calib`, `…task_class_matches_registry`, `…rejects_a_non_numeric_yhat` ;
`usde-calibration.test.ts` (5 : sha série, scores==fixture, digest C5, stats 613/61/6, clé exacte).

## Oracle (worker)
`npm run ci` : gate:vocab OK, tsc 0, **222/222** ; `lint-ratchet` **69/69** ; `lang:gate` 0 ; `export:check` 0.

## Findings
1. **Hors-lot** : `packages/hikae/src/interval-conformer.ts:85` commentaire FRANÇAIS introduit par M011 `3cfc4d2` ⇒
   `lang:gate` rouge au HEAD (oracle M011 = `npm run ci` sans `lang:gate`). Corrigé commentaire seul.
   **`error_origin` = G7 orchestrateur M011.**
2. Entrée `JOURNAL-PROVENANCE.md` = action G7 orchestrateur (faite).
3. R-2 (résidu) : helper de test `narabiFlow` hash placeholder ; payload canonique A3 exercé par le recorder.
4. Barber-Candès-Ramdas-Tibshirani 2023 : corps [abs], NON cité, procurement formé si cité.
