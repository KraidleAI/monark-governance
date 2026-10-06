# G7 du lot CM-3c-3b2 (contrat 1.1.0, bloc C, premier lot de la PR C2b) : le harnais se convertit et se teste

- **Plan** : `docs/G0-lot-cm-3c-3b2.md`, sous `docs/G0-lot-cm-3c-3b1.md` et `docs/G7-lot-cm-3c-3b1.md` (liste fermée de 65 au pli, tueurs de m-1 et m-7). m-6 de la G2 de 3c-3a ; m-1, m-3, m-4, m-7 de la G2 de 3c-3b1.
- **Bases** : partie de `e4c51d7b` ; pli de 3c-3b1 `ab732540` fusionné par `5f3e0748`, puis `903257ba` (docs seuls) par `1735be3f`. **Base de mesure : `ab732540`.**
- **Commits** (branche `recherches/cm-3c-3b2`, aucune PR) :
  - `3ff2f22d` G0 ;
  - `5f3e0748` fusion de `ab732540` ;
  - `2a292c95` tests (conversions et tests neufs) ;
  - **`330a4c52` gel** (trois fichiers de sources, nombre de lignes gardé) ;
  - `1735be3f` fusion de `903257ba` ;
  - `d865f2fd` G7 ; `662618d5` fusion de `3487f9f3` (docs de 3c-3b1 seuls) ;
  - **pli de la G2** (`G2-cm-3c-3b2.md`, APPROUVE SOUS RÉSERVE : B-1, B-2, m-1 à m-5) : `af505243` fusion de `base/c2-integration` (`689daea1`, C2a fusionnée par #150, aucun octet de contenu neuf) ; `46a3bacf` tests ; ce commit (G7 plié). Aucun gel neuf : le pli ne touche aucune source.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé.

## Ce que le lot écrit

- **Gel** (sources, comptes de lignes gardés, aucune adresse de tueur ne bouge) :
  - `packages/ukemi/src/prediction.ts:13` et `packages/monark/src/adapter-narabi.ts:25-26` : la version de la `Prediction` produite est `SCHEMA_VERSION` de `@monark/contracts` (Q-3 de C1 : une seule constante ; `AttestedFlow` reste en 1.0.0). **Écart 1** ;
  - `packages/hikae/src/region.ts:28-34` : commentaire de `NUMERIC_LABEL_SCHEMA` en 1.1.0 (aucune région, aucun `label_schema` sur le fil).
- **Conversions** des 28 rouges du harnais : `scores_sha256` à la place de `calib_digest` et `set_digest` ; `calibrate_scores_sha256_is_ordered_and_deterministic` (renommé) : une permutation garde q̂ et change l'empreinte ; `gate_byo_audit_scores_sha256_closes_the_loop` (renommé) : trois égalités dans l'ordre de l'appelant ; `numeric_under_calib_region_is_not_directional` inversé ; garde par strate, mode `digest` vers `UKEMI_LIQ_SCORES_SHA256_PINNED` ; `ServedTableTexts.marginal` en fonction (empreinte `d32cf528…` inchangée) ; `served_policy_modules_are_the_four_marginal_ones` (renommé de `policy_modules_are_not_served`) : les quatre modules `policy-*` du graphe servi, exactement (`policy-marginal`, `policy-projection`, `policy-served`, `policy-table-file`, m-4) ; `guard_modules_are_not_served` : `policy-classes` et `policy-guard` seuls.
- **Projection indépendante de la version** (action, raison, `allow`, région ou nulle si q̂ nul, q̂, `n_calib`, `alpha` ; un refus par son code) à la place des empreintes d'octets 1.0.0 : `served_replay_identical_and_nan_never_commits_in_the_served_gate` (111 appels) **`c9db863c…28a3`** et la bande USDe de `usde_band_edges_within_half_ulp_stated_and_band_unchanged` **`f99eddb8…ed5d`**, chacune mesurée **égale à la base `418a421f`** (copie par `git archive`, harnais 1.0.0) et au lot : **aucune décision servie ne change**.
- **Épingles d'octets 1.1.0 (B-1 de la G2)** : à côté de chaque projection, le sha256 des octets servis complets des mêmes appels (`JSON.stringify` de la `GateDecision` entière ; un refus par `{error, message}`), mesuré à la tête après la fusion de la base :
  - `served_replay_full_bytes_are_pinned_at_1_1_0` (111 appels) : **`cb6a4e4f7fddff49e2ad7f951b19e1c24072b5487c3aed8e1cdc97a47fcfa528`**, égale à la mesure de la G2 à `662618d5` ;
  - `usde_band_full_bytes_are_pinned_at_1_1_0` (grille de la bande USDe) : **`50ccc9fdda33f942c258e8bb5f4cac8481853654ed841279c2cb4d33b280a7ca`**.

  La projection prouve l'égalité des décisions avec la base 1.0.0 ; l'épingle tient les octets 1.1.0 (méthode, résidu, `schema_version`, champs de case, messages) de 3c-3b2 à T0. **Règle pour 3c-3c** : un lot qui change un octet servi de ces appels met à jour ces deux épingles dans son commit de tests et **nomme chaque changement** dans son G7 (champ, appels touchés, raison), à côté de la liste des changements servis ci-dessous ; une épingle qui bouge sans ligne déclarée est un rouge.
- **Tests neufs** : `apps/harness/test/gate-cell.test.ts` (six tests), Q-C2 dans `gate-request-sha256.test.ts`, m-6 dans `served-replay-cm3.test.ts`, provenance C5 de btc-dir (m-3) dans `calibration-scores-pins.test.ts`.
- **Q-C3, G7 honnête** : sur une table construite en processus, la comparaison de lignes de `guardMarginalTable` est une tautologie ; les contrôles effectifs sont `assertPolicyTableFile` et `assertLiqBandExact`. `liq_band_exact_guard_at_the_served_load` le prouve : un processus fils renomme la strate s0 engagée en s3 (mêmes scores, même q̂, épingle renommée) ; le chargement de `gate.ts` lève `LIQ-BAND-EXACT-GUARD-1` ; sans renommage il charge. **LIQ-BAND-EXACT-GUARD-1 est fermé.**

## Tueurs (forme fermée)

Tirés à la main, un mutant à la fois, test rejoué seul (`--test-name-pattern`, TAP), fichier restauré, sha256 vérifié avant et après. **76 tueurs dans les fichiers de test touchés (73 du lot, 3 du pli), 76 tués** (73 par assertion ; 3 tests de `policy-guard.test.ts` dont le corps n'est pas touché, par une erreur levée hors assertion, comme avant le lot).

| Test (neuf ou réécrit) | Tueur | Survivant de la G2 |
|---|---|---|
| `byo_qhat_unit_is_fixed_by_the_mode` | `apps/harness/src/tools/gate.ts:452 CONST "\"label\" : \"score\"" -> "\"score\" : \"label\""` | M3 |
| `served_cell_carries_the_current_row_of_the_key` | `apps/harness/src/tools/gate.ts:1004 CONST "r.current && r.cell_key === cellKey" -> "false"` | M2 |
| `cascade_cell_key_is_the_received_predictor_id` | `apps/harness/src/tools/gate.ts:541 CONST "servedCell(TASK_CASCADE, prediction.predictor_id)" -> "servedCell(TASK_CASCADE, TASK_CASCADE)"` | M5 |
| `served_values_equal_the_admitted_row` | `apps/harness/src/policy-marginal.ts:44 CONST "qhat: split.qhat," -> "qhat: split.qhat * 2,"` | m-7 |
| `served_tables_texts_and_sources` | `apps/harness/src/tools/gate.ts:994 CONST "registry_file: \"fixtures/usde-calib-scores.json\"" -> "registry_file: \"fixtures/usde.json\""` ; à la main : `gate.ts:991` texte de classe liq remplacé par celui de cascade, **tué** | M10, M9 |
| `liq_band_exact_guard_at_the_served_load` | `apps/harness/src/policy-served.ts:27 SDL "    guardMarginalTable(table, cls, committed, policy, order, inp);" -> ""` | M7 |
| `i_json_envelopes_are_param_invalid_and_existing_refusals_keep_their_code` | `apps/harness/src/tools/gate.ts:1014 CONST "if (e instanceof RangeError)" -> "if (false)"` | M1 |
| `u4b_calib_registry_digest_guard_per_stratum` (converti, tueur ajouté) | `apps/harness/src/calibration.ts:276 SDL "for (const c of COMMITTED_CALIBRATIONS) assertCommittedScores(c);" -> ""` | M6 |
| `kata_served_tables_digests` (tueur ré-ancré) | `apps/harness/src/policy-served.ts:23 CONST "[liq, LIQ_POLICY, \"ascending\"]" -> "[liq, LIQ_POLICY, \"time\"]"` ; à la main : `kata-path.ts:114` `.slice(1)`, **tué** | M11 |
| `served_policy_modules_are_the_four_marginal_ones` | `apps/harness/src/policy-served.ts:12 CONST "import { buildPolicyTable" -> "import \"./policy-guard.ts\"; import { buildPolicyTable"` | m-4 |
| `served_replay_full_bytes_are_pinned_at_1_1_0` (pli, B-1) | `apps/harness/src/tools/gate.ts:617 CONST "method: \"split\"" -> "method: \"hac-cp\""` ; à la main : `gate.ts:619` `residual: []` → `["x"]`, **tué** ; la projection reste verte sous les deux | X1, X5 |
| `usde_band_full_bytes_are_pinned_at_1_1_0` (pli, B-1) | même tueur `gate.ts:617` ; à la main : `gate.ts:619` résidu `["x"]`, **tué** | X1, X5 |
| `gate_summary_states_null_region_and_qhat_on_cascade` (pli, m-1) | `apps/harness/src/tools/gate.ts:728 CONST "? \"null\"" -> "? \"{}\""` | Y9 |
| `served_replay_verdicts_hold_the_implicit_constraints_c_d_e` (m-6) | `apps/harness/src/tools/gate.ts:619 CONST "schemaVersion: SCHEMA_VERSION, cell," -> "schemaVersion: SCHEMA_VERSION, cell, includeScores: true,"` | — |

- **M8** (`policy-served.ts:23`, cascade sous `LIQ_POLICY`) : **équivalent**, tiré à la main, survit. La table cascade n'a aucune ligne engagée ; la politique n'est lue que par `marginalRow`, jamais appelée pour cette classe. **M12** : équivalent (G7 de 3c-3b1).
- **m-6** : (c) et (d) ne s'appliquent aujourd'hui à aucun verdict servi (le harnais ne pose jamais `includeScores`) ; le test les tient sous condition, et (e) porte sur chaque verdict BYO du rejeu ; il exige des verdicts BYO et engagés (non vide). Le tueur ci-dessus met `scores` sur le verdict USDe engagé : (d) rougit. (a) et (b) : « l'étape 4 décide » (ligne r4 de RECHERCHES).
- **m-3** : `calibDigest(BTC_DIR_CALIB) === "fcebed27…"` par l'outil de provenance, dans `committed_scores_sha256_load_guard_against_the_new_pins`.
- **Pli, m-3 de la G2** : `u4b_gate_liq_serves_committed_stratum_and_abstains_elsewhere` compare l'empreinte servie de s0 à `UKEMI_LIQ_SCORES_SHA256_PINNED`, constante indépendante du tableau de scores (lisibilité ; la garde de chargement tient déjà la dérive, aucun tueur neuf).
- **Pli, m-5 de la G2** : dans `i_json_envelopes_…`, un commentaire dit que le vecteur « tau 1e400 » n'est pas un vecteur I-JSON (refusé avant l'enveloppe par le contrôle des paramètres, « expected a finite number », même code avec ou sans le tueur) ; deux refus anciens gardés sont ajoutés : `byo_set_tau_cap` (tau 5 sur deux candidats, `intent` en surrogate seul) et `liq_yhat_domain` (yhat liq 1e400). Le tueur `gate.ts:1014` tue toujours.

## red-proof

`node scripts/red-proof.mjs --base ab732540 --gel 330a4c52 --repo /home/user/monark-governance-c2c --draw 6 --seed 37` : sortie 1 (REFUSED, attendu) ; **37 jugés, 100 inchangés, 0 tueur tiré** ; `RED-PROOF.json` sha256 `cb945c55b655…` (dépend des chemins).
- **Refusés, 37, attendus** : **21 « green at base »** (les sources servies sont celles de 3c-3b1 : les tests du lot les épinglent, verts à la base par construction) ; **16 « no killer declared »** (partage corrigé par m-2 de la G2 ; le G7 initial écrivait 22 / 15) ; tests anciens sans ligne de tueur, convertis seulement. Parmi ces derniers, `gate_stable_run_usde_committed_region_A7b`, `gate_stable_run_family_isolation_fail_closed_A7acde` et `gate_stable_run_byo_anti_override_is_key_aware_A6` sont **rouges à la base et verts au gel** (la version des prédictions produites) ; avec `cascade_returns_frozen_prediction` et `gate_stable_run_honesty_text_is_keyed_A2_A7f` (corps non touchés, non jugés), ce sont les cinq F2P du gel.
- **Au pli** (`--gel 46a3bacf`, même base, même tirage) : sortie 1 (REFUSED, attendu) ; **40 jugés, 100 inchangés, 0 tueur tiré** ; 24 « green at base » (les 21 ci-dessus et les trois tests neufs du pli, qui épinglent des octets déjà servis à la base de mesure) ; 16 « no killer declared » (`u4b_gate_liq_serves_committed_stratum_and_abstains_elsewhere`, touché par m-3, y était déjà). `RED-PROOF.json` sha256 `4ff5320092e4…`.
- Les tueurs sont tirés à la main (section précédente).

## Ancres

- `verifie-ancres.mjs . --touched ab732540 HEAD` : **73 tueurs, 73 ancrés, 0 dérivé, 0 perdu** ; au pli (`46a3bacf`) : **76, 76, 0, 0**.
- Arbre entier : 949 tueurs, 939 ancrés, 0 dérivé, **10 perdus : les 10 de la base** ; au pli : 952, 942, 0, 10 (les mêmes). Le perdu de 3c-3b1 (`kata_served_tables_digests`) est ré-ancré sur `policy-served.ts:23`.

## Liste rouge fermée, mesurée à la tête

Passage complet `npm test` au gel fusionné (`1735be3f`, arbre égal au gel hors docs ; Node 24.21.0, variables de proxy retirées, TMPDIR `/tmp/c3b2-1`) : **2 292 tests, 2 234 verts, 37 rouges, 21 sautés, 0 annulé**.

**Au pli** (`46a3bacf`, Node 24.21.0, variables de proxy retirées, TMPDIR `/tmp/c3b2fold-1`) : 2 244 tests, 2 186 verts, **37 rouges**, 21 sautés, 0 annulé (rapporteur `spec` avec `--test-force-exit` : le total varie d'un passage à l'autre, comme la G2 l'a noté ; les trois tests neufs du pli sont passés verts). Rouges **égaux par nom** à la liste ci-dessous, 0 dans `apps/harness`.

Comparaison par nom (Q-3b1-2, forme fermée du G7 de 3c-3b1) : l'ensemble des rouges du passage est **égal** aux 65 de la liste fermée moins les 28 du harnais (37 = 37, différence vide dans les deux sens). **0 rouge dans `apps/harness`**, 0 rouge hors liste. Tous à **3c-3c** :

```text
packages/atelier/test/atelier.test.ts atelier_no_forbidden_vocab
packages/atelier/test/atelier.test.ts atelier_no_network
packages/atelier/test/atelier.test.ts atelier_replays_root_fixtures
packages/atelier/test/atelier.test.ts atelier_state_oracle
packages/atelier/test/atelier.test.ts perps_stubs_throw
test/byo-demo-probe.test.ts probe_byo_demo_loop_closes
test/ci-gates.test.ts frozen_contract_fields_stay_dynamic
test/ci-gates.test.ts gate_action_enum_order_is_frozen
test/ci-gates.test.ts how_page_rendered_vocab_has_no_numeric_hole
test/ci-gates.test.ts sim_emitted_reason_codes_subset_of_frozen_enum
test/export-public.test.ts export_public_no_governance_no_french
test/fixtures-root.test.ts test/fixtures-root.test.ts
test/h5-e2e-probe.test.ts h5_carries_attested
test/h5-e2e-probe.test.ts probe_harness_records_real_decision
test/harness-served.test.ts byo_trace_rendered_equals_trace
test/harness-served.test.ts harness_pages_render_identifier_values_only_as_declared_prose
test/harness-served.test.ts harness_pages_render_served_values_never_typed
test/harness-served.test.ts harness_pending_snapshot_is_fail_closed
test/harness-served.test.ts harness_pending_sync_writes_in_process_shapes
test/harness-served.test.ts harness_served_data_carries_no_provider_name_nor_market_value
test/harness-served.test.ts harness_served_data_matches_in_process_harness
test/harness-served.test.ts harness_served_sync_liq_row_follows_the_served_state
test/harness-served.test.ts harness_trace_loaders_are_fail_closed
test/harness-served.test.ts trace_loaders_follow_the_pending_snapshot_only
test/narabi-live.test.ts test/narabi-live.test.ts
test/sas-audit.test.ts sas_audit_labels_from_required
test/sas-audit.test.ts sas_audit_reasons_from_frozen_enum
test/site-docs.test.ts docs_reason_glosses_track_the_frozen_enum
test/site-ukemi.test.ts site_ukemi_count_wording_says_what_the_wire_serves
test/site-ukemi.test.ts site_ukemi_course_served_stratum_status_bound_to_served_verdict
test/site-ukemi.test.ts site_ukemi_digest_note_says_what_the_gate_returns
test/site-ukemi.test.ts site_ukemi_prose_claims_conditional
test/site-ukemi.test.ts ukemi_in_process_pins_follow_the_pending_snapshot
test/site-ukemi.test.ts ukemi_pending_sync_writes_in_process_facts
test/verify-harness-liq.test.ts verify_harness_ca_liq_checks_red_on_overclaiming_surfaces
test/verify-harness-liq.test.ts verify_harness_ca_passes_on_the_in_process_harness
test/verify-harness-liq.test.ts verify_harness_ca_schema_version_equals_the_harness_schema_version
```

| Famille | Rouges | Propriétaire |
|---|---|---|
| `packages/atelier` | 5 | 3c-3c |
| Racine, lecteurs du format du site | 7 (`ci-gates` 4, `sas-audit` 2, `site-docs` 1) | 3c-3c |
| Racine, chargement | 2 fichiers (`fixtures-root`, `narabi-live`) | 3c-3c |
| Racine, harnais servi et instantanés | 22 (`harness-served` 10, `site-ukemi` 6, `verify-harness-liq` 3, `h5-e2e-probe` 2, `byo-demo-probe` 1) | 3c-3c |
| Test 42 | 1 (`export_public_no_governance_no_french`) : `tsc` du miroir, 5 erreurs racine | 3c-3c |

- **Jobs CI rouges à la tête** (G7 de 3c-3b1, `903257ba`) : `g3-verification` (`tsc`, 5 erreurs, toutes racine) et `g3-site` (prérendu de `/console` et `/integrators` : `apps/site/lib/harness-served-load.ts:47` valide le `harness-served.json` servi, 1.0.0 jusqu'à T0, contre le schéma de décision 1.1.0). **Les deux restent à 3c-3c** : la coupe de ce G0 ne met pas `harness-served-load.ts` dans 3c-3b2. La tête de C2b doit les rendre verts.

## Contrôles

- **`tsc --noEmit`** : **5 erreurs**, 0 dans `apps/harness/` (60 au G7 de 3c-3b1) : `fixtures-root` 2, `narabi-live` 1, `site-ukemi` 1, `byo-demo-probe` 1 (3c-3c).
- **`eslint .`** : 0 erreur.
- **`lint:ratchet`** : **74/69**, rouge ; **partie harnais revenue à la base (0)** ; les 5 restants : `narabi-live` 2, `fixtures-root` +1, `site-ukemi` 1, `byo-demo-probe` 1 (3c-3c).
- `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK.
- **Au pli** (`46a3bacf`) : mêmes valeurs (`tsc` 5 erreurs racine, `eslint` 0, ratchet 74/69, `gate:vocab`, `lang:gate`, `export:check` OK).

## R-25

`r25()` de `scripts/oracle/r25.mjs` :
- **lot contre `ab732540`**, à la tête pliée : **STAT 463** (+341 / −122) ≤ 547 ; CONTENT_STAT 0. Au G7 initial : 425 (+302 / −123) ; le pli coûte 38 lignes, toutes de tests (commit `46a3bacf` : épingles B-1 +27, m-1 +9, m-5 +6/−2, m-3 +3/−3), aucune source. Tests 443, sources 20 (`region.ts` 14, `adapter-narabi.ts` 4, `prediction.ts` 2) ; le G0 en prévoyait ~430.
- **C2b courante** : 463 ; reste ≤ 742 pour 3c-3c sous 1 205 (estimée ~270) : **C2b ≈ 735**.
- **Intégration** (C2a + C2b) contre `418a421f` à la tête pliée : **1 493** (+1 100 / −393), au-dessus de la borne de repli 1 400 ; projection avec 3c-3c : **~1 765**.
- **R25-INTEGRATION-RULE-1 est une précondition de fusion de la PR d'intégration C2 (B-2 de la G2)**, et non un choix parmi deux. Le repli écrit au G7 de 3c-3b1 (Q-3b1-3, « C2b coupée vers C' ») n'est plus réalisable : l'intégration mesure déjà 1 455 à la tête de 3c-3b2 (1 493 au pli), et couper C2b laisserait C2a seule, dont la tête porte la liste rouge (65), alors que la tête d'intégration doit être verte (Q-3b-1). Aucune coupe n'est à la fois verte et sous 1 400. Sans la règle sur la base, il faut une relecture datée de la borne (option (a) de B-2 de la G2 de 3c-3b1).
  - **Contrôle en forme fermée**, avant d'ouvrir la PR d'intégration : `r25(clone, ci, "418a421f").counts[0].changed ≤ 1400 ∨ R25-INTEGRATION-RULE-1 présente sur base/c2-integration`. Tueur : la tête `662618d5`, à 1 455 sans la règle.

## Changements servis du lot (contrôle par diff de MONARK, ligne r4 21)

Complète la liste mesurée au G7 de 3c-3b1 (section « Surface servie mesurée »), pour le contrôle par diff de C2 :
- **`prediction.schema_version` passe de 1.0.0 à 1.1.0** dans la sortie de l'outil `ukemi_predict` (`apps/harness/src/tools/ukemi-predict.ts:197`) et de l'outil `cascade` (`apps/harness/src/tools/cascade.ts:203`, par `emitPrediction` de `packages/ukemi/src/prediction.ts:13`), par l'écart 1 (Q-3b2-1). Prévu par B-11 (« 1.1.0 pour la prédiction ») ; tenu par `cascade_returns_frozen_prediction` (`cascade.test.ts:67`). Aucun autre octet de ces deux sorties ne bouge ; `AttestedFlow` reste en 1.0.0 (`apps/sentinel/src/flow.ts:50`, `scripts/record-usde-calib.mjs:57`) et aucun octet de la sentinelle ne bouge (m-4 de la G2).
- **Octets des décisions du gate** : aucun changement au pli au-delà de la liste de 3c-3b1 ; ils sont désormais épinglés (B-1, section « Ce que le lot écrit »).

## Écarts au G0 du lot

1. **Version des prédictions produites dans 3c-3b2** (G0, point 2 ; Q-3b2-1) : deux lignes que MONARK a ouvertes « en C2 (3c-3c) » passent dans 3c-3b2, même PR C2b, zone ouverte jusqu'à la fusion de C2. Sans elles, cinq tests du harnais rangés à 3c-3b2 par le G7 de 3c-3b1 restaient rouges. Effet mesuré : aucun rouge neuf (`packages/monark`, `packages/ukemi`, `apps/sentinel`, harnais verts ; la racine garde ses 37).
2. **Source liq** : l'assertion du chemin liq de `served_tables_texts_and_sources` est retirée au profit du test du pli de 3c-3b1 (`liq_table_source_names_the_series_by_sha256_only`), qui la tient déjà.
3. **Trois tests renommés** (noms faux en 1.1.0) : `calibrate_set_digest_is_calibDigest_and_deterministic`, `gate_byo_audit_calib_digest_closes_the_loop`, `policy_modules_are_not_served`. Leurs anciens noms sortent de la liste (Q-3b1-2 : un rouge listé absent n'est pas un écart).
4. **Q-F2** : la ligne datée de MONARK qui fixe le texte du refus 1.0.0 n'est pas sur la base ; le message reste à 3c-3c.

## Questions (pour MONARK)

- **Q-3b2-1** (écart 1) : garder les deux lignes de version dans 3c-3b2 ? Défaut : oui.
- **Q-3b2-2** (m-7) : valeurs servies (`qhat`, `n_calib`, `alpha`) calculées depuis les scores de `calibration.ts`, d'où la ligne admise est construite ; leur égalité avec la ligne est maintenant tenue par un test. Défaut : accepter l'écart jusqu'à C'.
- **Q-3b2-3** (R-25) : l'intégration passe 1 400 dès la tête de 3c-3b2 (1 455 ; 1 493 au pli) ; la projection avec 3c-3c est ~1 765. Défaut : R25-INTEGRATION-RULE-1, comme décidé par la cellule, **précondition de fusion** de la PR d'intégration (B-2).

### Avis de la G2 (`G2-cm-3c-3b2.md`)

- **Q-3b2-1** : d'accord, oui. Effet mesuré : seuls les cinq F2P bougent, rien dans `monark`, `ukemi` ou `sentinel`, `AttestedFlow` reste en 1.0.0. Le seul octet servi qui bouge est prévu par B-11 et doit être déclaré : il l'est (section « Changements servis du lot », m-4).
- **Q-3b2-2** : d'accord pour accepter l'écart jusqu'à C'. L'égalité entre valeurs servies et ligne admise est tenue par un test dont le tueur tue (`policy-marginal.ts:44`).
- **Q-3b2-3** : d'accord pour R25-INTEGRATION-RULE-1, à condition de lever B-2 : la règle doit être sur la base avant la PR d'intégration, aucune coupe ne gardant une tête verte sous 1 400. B-1 coûte quelques lignes de plus (38 mesurées), sans changer la conclusion.
