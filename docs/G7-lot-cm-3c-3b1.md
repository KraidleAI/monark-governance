# G7 du lot CM-3c-3b1 (contrat 1.1.0, bloc C, second lot de la PR C2a) : le harnais se charge et se type

- **Plan** : `docs/G0-lot-cm-3c-3b1.md` (coupe de 3c-3b en 3c-3b1 et 3c-3b2), sous le G0 court `docs/G0-lot-cm-3c-3b.md` (mesure au prototype) et le G0 du bloc `docs/G0-bloc-c-cm-3c-2.md`. Décisions de cellule : Q-3b-1 à Q-3b-5 (message de MONARK `2026-10-05-MONARK-vers-RECHERCHES-C2-integration.md`, ligne datée (9) de l'ADR-CM au commit `418a421f`) ; m-5 et m-6 remis par la G2 de 3c-3a.
- **Bases** :
  - `origin/base/chantier-moteur-2026-10-03` = `418a421f` (ligne (9) de l'ADR-CM, lecture datée de D7 duodecies), fusionnée par `2585c2fe` avant tout test ;
  - `origin/base/c2-integration` = `418a421f` (base de la PR C2a) ;
  - `origin/recherches/cm-3c-3a` = **`be3e5210`** (pli de la G2 de 3c-3a, tests et docs seuls), fusionnée par `b4f26a41` après le gel. **Base de mesure du lot : `be3e5210`.**
- **Commits** (branche `recherches/cm-3c-3b1`, partie de `recherches/cm-3c-3b` à `71ee94f3` ; aucune PR) :
  - `2585c2fe` fusion de la base `418a421f` ;
  - `28b3b482` G0 de 3c-3b1 ;
  - `281f175d` tests rouges ;
  - **`946e74e8` gel** ;
  - `b4f26a41` fusion de `be3e5210` ;
  - `e4c51d7b` G7 ;
  - pli de la G2 (section « Pli de la G2 ») : `488ac0c0` test rouge de Q-3b1-1, `973704f3` gel du pli (source liq de Q-3b1-1, commentaires de m-2), puis le commit de docs qui porte cette section.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` (mode changé par `npm ci`) jamais indexé.

## Ce que le lot écrit

- **`apps/harness/src/`** (sources du prototype mesuré au G0 de 3c-3b, plus la garde rendue testable) :
  - `calibration.ts` : `scoresSha256` à la place de `calibDigest` ; épingles C5 gardées comme valeurs de provenance (`digestPinned`, `USDE_STABLE_RUN_CALIB_DIGEST_PINNED`, `UKEMI_LIQ_S0_CALIB_DIGEST_PINNED`) ; garde de chargement `assertCommittedScores` (exportée), appelée sur chaque entrée engagée, contre trois épingles neuves hors du bloc généré : `USDE_STABLE_RUN_SCORES_SHA256_PINNED` = `e44a68b6…cfd28` (sha256 de `fixtures/usde-calib-scores.json`, vérifié par le test), `UKEMI_LIQ_SCORES_SHA256_PINNED` s0 = `a9277222…6ee3c8`, `CALIB_DIGEST_PINNED` btc-dir = `bb438031…73afd6` (voir écart 2) ;
  - `policy-served.ts` (neuf, Q-C3) : `servedMarginalTables`, appelé par `kata-path.ts` (`servedPolicyTables`) et par `tools/gate.ts` (`SERVED_MARGINAL_TABLES`, construit au chargement, en échec fermé). Sur une table construite en processus, la comparaison de lignes de `guardMarginalTable` est une tautologie (la table et les lignes de contrôle viennent des mêmes entrées) ; les contrôles effectifs sont `assertPolicyTableFile` et `assertLiqBandExact` (condition de Q-C3, G0 du bloc ; m-5 de la G2 : le mutant qui retire l'appel de `guardMarginalTable` survit, ce qui le confirme) ;
  - **graphe servi** (m-4 de la G2, pour le contrôle par diff de C2) : la fermeture des imports depuis `server.ts` contient désormais **quatre** modules `policy-*` : `policy-served.ts`, `policy-marginal.ts`, `policy-table-file.ts` et `policy-projection.ts` (les deux derniers par transitivité) ; à `418a421f`, elle ne contenait que `class-policy.ts`. Aucun des quatre ne porte de littéral de code kata ou en attente, ni n'importe `kata-path`, `policy-classes` ou `policy-guard` (mesure de la G2). Les tests `policy_modules_are_not_served` et `guard_modules_are_not_served`, rouges, sont réécrits en 3c-3b2 avec cette liste exacte ;
  - `tools/gate.ts` : `SCHEMA_VERSION` de `@monark/contracts` (réexporté) ; `cell` sur chaque verdict (BYO : `qhat_unit` du mode, `scale` et les trois champs de table nuls, Q-C1 ; USDe, liq, cascade : `servedCell`, clé recherchée, ligne courante si elle existe, empreinte de la table) ; `labelSchema` retiré ; `requestSha256: envelopeSha256(prediction, params, attested)` sur le `GateInput` (l.979), avec la conversion de la seule `RangeError` en 400 `param_invalid` (Q-C2) ; résumé `region=null` et `scores_sha256=` ; `SERVED_TABLE_TEXTS` (textes Z-3 et `source` de Q-3b-4, relue pour liq en Q-3b1-1 : voir « Relecture datée de Q-3b-4 ») ; en-tête à la version du paquet ;
  - `tools/calibrate.ts`, `schema-projection.ts`, `tools/registry.ts` : B-17 (`scores_sha256` à la place de `set_digest`) ; `tools/ukemi-predict.ts` : `SCHEMA_VERSION` du paquet.
  - **Adresses des tueurs gardées** : les trois fonctions neuves de `gate.ts` sont en fin de fichier, les lignes de `cell` sont placées pour que le compte de lignes soit le même qu'à la base au-dessus de chaque adresse existante ; les deux lignes d'export sont en fin de `WHITELIST_FILES`. Aucun tueur d'un test non touché ne dérive (section Ancres).
- **Export (Q-3b-3)** : `scripts/export-public.mjs`, deux lignes de `WHITELIST_FILES` (`scripts/lib/calib-digest-provenance.mjs`, `scripts/lib/calib-digest-provenance.d.mts`) ; `docs/PRODUCT-BOUNDARY.md`, leurs deux lignes, sur le modèle de `record-usde-calib.mjs`.
- **Tests existants, chargement seul** : `calibrate`, `calibration-liq`, `gate-liq-artifact`, `gate`, `http`, `usde-calibration` importent `calibDigest` de l'outil de provenance au lieu du paquet (une ligne d'import par fichier, aucune assertion changée).
- **Aucun octet hors du harnais et de l'export** : `packages/`, `schemas/`, `apps/site/`, `fixtures/` inchangés.

## Tests rouges et tueurs (forme fermée, au gel)

| Test | Fichier | Tueur | Tiré à la main |
|---|---|---|---|
| `served_gate_body_validates_the_frozen_decision_schema` (m-5) : `/gate` HTTP et `tools/call` MCP sur cinq chemins (BYO ensemble, BYO intervalle, USDe, liq, cascade) ; ajv contre `gate-decision.schema.json` ; `request_sha256 = sha256(canonicalJson(JSON.parse(corps)))`, corps écrit hors forme canonique | `apps/harness/test/gate-request-sha256.test.ts` (neuf) | `apps/harness/src/tools/gate.ts:979 SDL "    requestSha256: envelopeSha256(prediction, params, attested), // contract 1.1.0: the envelope as received" -> ""` | **tué** (assertion) |
| `request_sha256_is_the_digest_of_the_received_envelope` | même fichier | `apps/harness/src/tools/gate.ts:1012 CONST "requestSha256({ prediction, params, " -> "requestSha256({ prediction, params: {}, "` | **tué** |
| `committed_scores_sha256_load_guard_against_the_new_pins` (Q-3b-2) | `apps/harness/test/calibration-scores-pins.test.ts` (neuf) | `apps/harness/src/calibration.ts:272 SDL` de la ligne `if (computed !== pinned) throw …` | **tué** |
| `liq_table_source_names_the_series_by_sha256_only` (Q-3b1-1, pli de la G2) | `apps/harness/test/calibration-scores-pins.test.ts` | `apps/harness/src/tools/gate.ts:993 CONST "registry_file: \"sha256:" -> "registry_file: \"apps/sentinel/test/fixtures/sha256:"` | **tué** (assertion) ; rouge au commit `488ac0c0`, vert au gel du pli `973704f3` |
| `kata_reasons_within_coverage_reasons` (Q-3a-2) | `apps/harness/test/kata-path.test.ts` | `apps/harness/src/kata-path.ts:18 CONST "\"region_degenerate\"] as const" -> "\"region_degenerate\", \"kata_only\"] as const"` | **tué** |

Chaque mutant seul, test rejoué seul, fichier restauré, sha256 vérifié avant et après.

- **Tueur ré-ancré de `served-replay-cm3`** (`packages/hikae/src/l3-gate.ts:90 SDL` de la garde E-8), tiré maintenant que le harnais se charge : le test est rouge au gel sur son empreinte (prédictions écrites `"1.0.0"`, refusées `schema_version_unsupported` : conversion de 3c-3b2). Rejoué sur une copie de travail du test, hors dépôt et retirée ensuite, version écrite `"1.1.0"`, `requestSha256` posé sur l'entrée E-8 et l'assertion d'empreinte ôtée : **vert sans mutant, rouge par assertion avec le mutant** (tué).
- Le mode `attested` de l'empreinte n'est atteignable sur aucun chemin servi : tout `attested` est refusé, par le schéma ou par `attested_inconsistent`, avant le calcul (aucune classe servie n'a de sujet d'attestation). Le test ne le couvre donc pas ; la branche reste écrite pour la spécification. Le mutant qui retire `attested` de l'enveloppe (`gate.ts:1012`, M12 de la G2) survit : il est **équivalent** sur la surface servie.

## red-proof

`node scripts/red-proof.mjs --base be3e5210 --gel b4f26a41 --repo /home/user/monark-governance-c2b --draw 4 --seed 37` : sortie 1 (REFUSED, attendu) ; **4 jugés, 71 inchangés, 0 tueur tiré** ; `RED-PROOF.json` sha256 `faf13535…3db1` (dépend des chemins).
- **Refusés, 4, attendus** : les quatre tests neufs, « import red on a file that exists at base » : à `be3e5210`, le harnais ne se charge pas (`calibration.ts:16` importe `calibDigest`, liste fermée de 3c-3a). Aucun test du harnais ne peut être F2P à ce lot ; les quatre tueurs sont tirés à la main (ci-dessus), comme prévu au G0.
- Même résultat au premier gel, avant le pli et avant le placement des lignes (`--base 2585c2fe --gel a0ac692f`, commit local remplacé par `946e74e8` avant toute poussée) : 4 jugés, 4 refusés pour la même raison.

## Ancres

- `verifie-ancres.mjs . --touched be3e5210 HEAD` : **29 tueurs, 28 ancrés, 0 dérivé, 1 perdu** : `apps/harness/test/kata-path.test.ts:279` (`kata_served_tables_digests`, ancre `kata-path.ts:122 "\"ascending\", texts.marginal"`) ; la ligne a quitté `kata-path.ts` pour `policy-served.ts` (Q-C3). Le test est rouge au gel (forme de `ServedTableTexts`) et sa conversion, avec son tueur ré-ancré sur `policy-served.ts`, est à 3c-3b2.
- Arbre entier : 939 tueurs, 928 ancrés, 0 dérivé, 11 perdus : les **10 de la base** (relevés au G7 de 3c-3a) et celui ci-dessus.
- **Au pli de la G2** (`973704f3`) : `--touched be3e5210 HEAD` : **30 tueurs, 29 ancrés, 0 dérivé, 1 perdu** (le même) ; le tueur neuf de Q-3b1-1 est ancré. Arbre entier : 940, 929, 0, 11. Les commentaires de m-2 sont réécrits en place : aucune adresse ne bouge.
- Premier gel mesuré : 18 tueurs de tests non touchés perdaient leur adresse (`gate.ts` +27 lignes, `kata-path.ts` −1, `export-public.mjs` +2). Plutôt que de réécrire 17 lignes de tueurs (34 lignes R-25), le gel garde le compte de lignes au-dessus de chaque adresse (section « Ce que le lot écrit »).

## Liste rouge fermée, mesurée à la tête

Passages complets `npm test` (Node 24.21.0, variables de proxy retirées). #142 n'est pas sur la base : les comptes varient d'un passage à l'autre.
- **Au G7** (TMPDIR `/tmp/c3b1-1`) : passage A, à la tête du gel avant la fusion de `be3e5210` : 2 188 tests, 2 111 verts, 65 rouges, 12 sautés (les 66 du passage B moins `how_page_rendered_vocab_has_no_numeric_hole`, absent de sa sortie) ; passages B et C, à `b4f26a41` : 2 275 et 2 273 tests, **66 rouges**, les mêmes nom pour nom ; la G2 (passage à `e4c51d7b`, 2 311 tests) : les mêmes 66.
- **Au pli de la G2** (TMPDIR `/tmp/c3b1fold-1`), à `973704f3` : 2 286 tests, 2 200 verts, **65 rouges**, 21 sautés. Le 66e, `export_exclude_data_no_exported_consumer` (garde d'export (a)), est vert : Q-3b1-1 (m-8 : il n'a plus de propriétaire). Les 65 sont **égaux, nom pour nom, à la liste ci-dessous** ; parmi eux, les 19 que la G2 a mesurés par nom (`harness-served` 10, `site-ukemi` 6, `verify-harness-liq` 3), égaux à ceux de la G2.

**Liste fermée, test par test (65)**, une ligne par rouge : chemin du fichier, puis nom du test (le texte après « — » d'un nom de test n'en fait pas partie). Un fichier qui ne se charge pas compte une fois, sous son chemin (`fixtures-root`, `narabi-live`).

```text
apps/harness/test/calibrate.test.ts calibrate_content_carries_verdict_summary
apps/harness/test/calibrate.test.ts calibrate_fails_closed_on_insufficient_calibration
apps/harness/test/calibrate.test.ts calibrate_schema_shapes_match_the_adr
apps/harness/test/calibrate.test.ts calibrate_set_digest_is_calibDigest_and_deterministic
apps/harness/test/calibration-liq.test.ts u4b_calib_registry_digest_guard_per_stratum
apps/harness/test/cascade.test.ts cascade_returns_frozen_prediction
apps/harness/test/gate-cm2b.test.ts usde_band_edges_within_half_ulp_stated_and_band_unchanged
apps/harness/test/gate-empty-set.test.ts empty_set_never_commits_at_l3
apps/harness/test/gate-liq-artifact.test.ts u4b_gate_serves_region_from_real_artifact
apps/harness/test/gate-liq.test.ts u4b_gate_liq_serves_committed_stratum_and_abstains_elsewhere
apps/harness/test/gate.test.ts gate_byo_audit_calib_digest_closes_the_loop
apps/harness/test/gate.test.ts gate_byo_honesty_text_is_wired_on_calibration_presence
apps/harness/test/gate.test.ts gate_committed_classes_unchanged_without_calibration
apps/harness/test/gate.test.ts gate_stable_run_byo_anti_override_is_key_aware_A6
apps/harness/test/gate.test.ts gate_stable_run_family_isolation_fail_closed_A7acde
apps/harness/test/gate.test.ts gate_stable_run_honesty_text_is_keyed_A2_A7f
apps/harness/test/gate.test.ts gate_stable_run_noncommitted_key_abstains_under_calib
apps/harness/test/gate.test.ts gate_stable_run_usde_committed_region_A7b
apps/harness/test/gate.test.ts numeric_under_calib_region_is_not_directional
apps/harness/test/http.test.ts http_gate_byo_calibration
apps/harness/test/kata-path.test.ts kata_imposed_params_without_row
apps/harness/test/kata-path.test.ts kata_no_row_verdict_fields
apps/harness/test/kata-path.test.ts kata_served_tables_digests
apps/harness/test/openapi.test.ts openapi_generated_matches_frozen_schemas
apps/harness/test/policy-guard.test.ts guard_modules_are_not_served
apps/harness/test/policy-row-schema-corpus.test.ts policy_row_schema_admits_the_synthetic_kata_tables_and_the_served_tables
apps/harness/test/policy-table-file.test.ts policy_modules_are_not_served
apps/harness/test/served-replay-cm3.test.ts served_replay_identical_and_nan_never_commits_in_the_served_gate
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

| Famille | Rouges | Propriétaire | Cause |
|---|---|---|---|
| Harnais, `apps/harness/test/` | **28** | **3c-3b2** | renommages (`calib_digest`, `set_digest`), région nulle, prédictions écrites `"1.0.0"`, forme de `ServedTableTexts`, modules servis neufs (m-4), schémas projetés, garde par strate en mode `digest` |
| `packages/atelier` | **5** (les 5 du fichier, inchangés depuis 3c-3a) | 3c-3c | fixtures racine 1.0.0 |
| Racine, lecteurs du format du site | **7** : `ci-gates` × 4, `sas-audit` × 2, `site-docs` × 1 (les mêmes qu'au G7 de 3c-3a) | 3c-3c | comptes et gloses lus sur les schémas |
| Racine, chargement | **2 fichiers** : `fixtures-root`, `narabi-live` | 3c-3c | importent `calibDigest` du paquet |
| Racine, harnais servi et instantanés (se chargent, rouges sur le format) | **22** : `harness-served` × 10, `site-ukemi` × 6, `verify-harness-liq` × 3, `h5-e2e-probe` × 2, `byo-demo-probe` × 1 | 3c-3c | instantanés servis 1.0.0 (`calib_digest`, `set_digest`, région vide) |
| Test 42 | **1** : `export_public_no_governance_no_french` | C2b | `tsc` du miroir exporté : erreurs des tests du harnais (3c-3b2) et racine (3c-3c) |

- **Comparaison (Q-3b1-2, B-1 de la G2), en forme fermée** : prendre, dans la section « failing tests » de la sortie de `npm test`, chaque paire « `test at <fichier>:<l>:<c>` » / « `✖ <nom> (<durée>)` », garder le fichier et le nom (sans la durée ni le texte après « — »), et comparer l'**ensemble** obtenu à l'ensemble des lignes du bloc ci-dessus. Un rouge du passage absent du bloc est un écart (refus) ; une ligne du bloc absente du passage, ou verte, n'en est pas un. Tueur : retirer une ligne du bloc (par exemple `test/harness-served.test.ts harness_trace_loaders_are_fail_closed`) fait refuser le passage. Mesuré au pli : ensembles égaux (65 = 65, différence vide dans les deux sens).
- **Sortis de la liste de 3c-3a** : les 27 fichiers du harnais se chargent (28 tests rouges restent, à 3c-3b2) ; **les 7 fichiers de la sentinelle sont verts** ; 10 des 12 fichiers racine se chargent.
- **Hors liste, environnement** : aucun rouge d'environnement (`dojo_history_collect_to_verify_end_to_end` vert aux passages A, B et au pli).
- **0 rouge** dans `packages/contracts`, `packages/hikae`, `packages/ukemi`, `packages/monark`, `apps/sentinel`, `apps/bell`, `apps/dojo`.

## Contrôles

- **`tsc --noEmit`** : **0 erreur dans `apps/harness/src/`** (le harnais se type). Erreurs restantes : 60 dans `apps/harness/test/` (`gate` 16, `calibrate` 9, `ukemi-predict` 8, `gate-liq` 8, `gate-liq-artifact` 7, `gate-cm2b` 5, `kata-path` 3, `served-replay-cm3` 2, `gate-empty-set` 2, `policy-row-schema-corpus` 1 ; 3c-3b2) et 6 à la racine (`fixtures-root` 2, `narabi-live` 1, `site-ukemi` 1, `byo-demo-probe` 1 ; 3c-3c) — total 66, contre 84 au gel de 3c-3a.
- **`eslint .`** : **0 erreur** (18 au gel de 3c-3a, toutes levées).
- **`lint:ratchet`** : **84/69**, rouge. Les 15 de plus sont dans la famille : tests du harnais 10 (`calibrate` 6, `gate` 2, `gate-cm2b` 1, `ukemi-predict` 1 ; 3c-3b2), racine 5 (`narabi-live` 2, `fixtures-root` +1, `site-ukemi` 1, `byo-demo-probe` 1 ; 3c-3c). Le retour à 69 suit 3c-3b2 et 3c-3c.
- `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK (chemins et langue).
- **Au pli de la G2** (`973704f3`) : mêmes résultats : `tsc` 66 erreurs, 0 dans `apps/harness/src/` (le test du pli se type) ; `eslint .` 0 ; `lint:ratchet` 84/69 ; `gate:vocab`, `lang:gate`, `export:check` OK.

## R-25

`r25()` de `scripts/oracle/r25.mjs` :
- **lot contre `be3e5210`** (tête de 3c-3a pliée) : **STAT 469** (+363 / −106) ≤ 547 ; CONTENT_STAT 0. Sources 237 (`gate.ts` 89, `calibration.ts` 53, `policy-served.ts` 30, `calibrate.ts` 26, `kata-path.ts` 25, `schema-projection.ts` 8, `ukemi-predict.ts` 4, `registry.ts` 2), export 2, chargement des tests 15, tests neufs 215 (`gate-request-sha256` 148, `calibration-scores-pins` 55, parité kata 12 avec ses deux imports) ;
- **C2a cumulée** (3c-3a pliée + 3c-3b1) contre `418a421f` (= `base/c2-integration`) et contre `5a491fa6` : **STAT 1 014** ≤ 1 205 (545 + 469).
- **Au pli de la G2** (`973704f3`, la docs hors du compte) : **lot 497** (+385 / −112) ≤ 547 contre `be3e5210` ; **C2a 1 042** (+765 / −277) ≤ 1 205 contre `418a421f`. Les 28 lignes de plus : le test de Q-3b1-1 et son import (16), les commentaires de m-2 (12, six lignes réécrites en place) ; la ligne de `source` liq, déjà neuve dans le lot, ne compte pas de plus.
- **Reste pour C2b** : 3c-3b2 (~250 estimés au G0 de 3c-3b1, plus m-6 et la conversion de `kata_served_tables_digests` et de son tueur) et 3c-3c (~285), soit **~535**.
- **Borne d'intégration (B-2 de la G2)** : la PR `base/c2-integration` → base porte le diff net de C2a et de C2b, borne de repli **1 400** (ligne datée (9), point 3 : « au-delà, refus »). 3c-3b2 et 3c-3c touchent presque uniquement des lignes que C2a ne touche pas, donc le net est proche de la somme. Projection de la G2 : **C2a 1 014 + C2b ~535 ≈ 1 550**, soit ~150 au-dessus de 1 400 (reste pour C2b nette : 1 400 − 1 014 = 386). Au pli, C2a mesure 1 042 : reste 358, dépassement projeté ~177. La ligne (9) supposait C2a ≈ 780. RECHERCHES pose **Q-3b1-3** à MONARK (message écrit par RECHERCHES) ; décision de cellule à la section Questions : passage par R25-INTEGRATION-RULE-1, 1 400 non relevée, sinon coupe de C2b vers C' mesurée au G0 court de 3c-3c. Contrôle fermé avant la PR d'intégration : `r25(clone, ci, "418a421f").counts[0].changed ≤ 1400` sur la tête de `base/c2-integration`, si la règle n'est pas sur la base.

## Écarts au G0 du lot

1. **Garde d'export (a) rouge au G7, levée au pli** (non prévue) : la valeur de `source` de la table liq décidée en Q-3b-4 (`registry_file: "apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-weth-2025-09-22.jsonl"`) est écrite dans `apps/harness/src/tools/gate.ts`, fichier exporté, et nomme une donnée exclue du miroir par `scripts/export-exclude-data.json` (« decision 111 until item EXPORT-U4B-111-1 at the switch window »). Le test `export_exclude_data_no_exported_consumer` rougit. Le texte servi de la table nommerait aussi un fichier absent du miroir. Au G7, rien n'était contourné : la valeur décidée était gardée et le rouge déclaré (Q-3b1-1). **Levé au pli de la G2** par la relecture datée de Q-3b-4 (section « Relecture datée de Q-3b-4 ») : le test est vert à `973704f3`. `generator: "scripts/record-u4b-calib.mjs"` reste : ce nom est déjà dans le texte de provenance servi de liq (provenance déjà publique au sens de Z-3), et la garde (a) ne regarde que les données.
2. **Épingle btc-dir remplacée en place** : `CALIB_DIGEST_PINNED` passe de l'empreinte C5 `fcebed27…` à `scoresSha256` `bb438031…` (classe retirée, hors bloc généré). **La provenance C5 de btc-dir n'est plus vérifiée** (m-3 de la G2, phrase corrigée) : aucun code ni test ne recalcule plus `calibDigest(BTC_DIR_CALIB)` ; avant le lot, c'était la garde de chargement elle-même qui le faisait. `fcebed27…` ne reste que dans `docs/G1-lot-H1.md` et `docs/G2-lot-H1.md`, qui sont des pièces de lot et non des documents de provenance. USDe (`usde-calibration.test.ts`) et liq (`u4b_committed_registry_equals_generator_output`) gardent leur oracle C5 à côté des épingles neuves ; btc-dir le perd, la classe étant retirée. Tout changement des scores que C5 verrait, la garde `scoresSha256` le voit déjà au chargement.
3. **Garde de chargement exportée** (`assertCommittedScores`) : le prototype l'écrivait en boucle anonyme ; la fonction rend le test de Q-3b-2 possible sans processus fils. Le test par processus fils existant (`u4b_calib_registry_digest_guard_per_stratum`) est à 3c-3b2.
4. **Placement des lignes neuves de `gate.ts` et de `export-public.mjs`** pour garder les adresses des tueurs (section Ancres) : le diff diffère du prototype par l'ordre, pas par le contenu.
5. **Message du refus 1.0.0 (Q-F2)** : non écrit, le texte exact attend la ligne datée de MONARK (ligne (7) de l'ADR-CM) ; le message actuel nomme la version parlée par `SCHEMA_VERSION`. Reporté à 3c-3b2 ou à l'arrivée de la ligne.
6. **Commentaire C-3 de `gate.ts` (bloc des codes réservés)** non touché : `input_invalid` et `json_invalid` restent réservés (coupe des corps 400 vers C', Q-3a-5).

## Relecture datée de Q-3b-4 pour la table liq (Q-3b1-1, décision de cellule, 2026-10-05)

- **Décision** : relecture datée de Q-3b-4, accord de MONARK (message `2026-10-05-MONARK-vers-RECHERCHES-3c-3b1.md`, « Q-3b1-1 : d accord »). La `source` de la table liq nomme la série de scores fraîche **par son seul sha256**, avec le générateur gelé, **sans chemin ni nom de fichier** de la série exclue du miroir :
  - `registry_file` : `"sha256:fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4"` ;
  - `registry_sha256` : `fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4` (sha256 LF de la série, la valeur du bloc généré de `calibration.ts` et du texte de provenance servi) ;
  - `generator` : `scripts/record-u4b-calib.mjs` (gelé) ; `trial_id` et `wave` nuls, comme avant.
- **Ce qui ne bouge pas** : la frontière d'export ; EXPORT-U4B-111-1 reste à sa place. La provenance reste vérifiable : la série est dans le dépôt de gouvernance, et les scores servis se recalculent par `scores_sha256`. La `source` de la table USDe est inchangée.
- **Effet** : `export_exclude_data_no_exported_consumer` passe au vert. La valeur déplace `policy_row_sha256` de liq s0 (`45266fb6…` à la G2) et `policy_table_sha256` de la table liq (`144a5566…` à la G2) : **aucune empreinte de la table liq n'est épinglée** (ni en test, ni dans l'instantané en attente, ligne r4 27) avant la ligne datée de MONARK.
- **Test** : `liq_table_source_names_the_series_by_sha256_only` (`calibration-scores-pins.test.ts`) : les entrées de la source liq par valeur, et sur chaque ligne de la table liq servie, ni séparateur de chemin ni extension de fichier, `registry_sha256` égal à la série. Le test ne nomme pas le fichier exclu (il est lui-même exporté). Tueur dans la table des tueurs.

## Surface servie mesurée (G2, m-6)

Mesure de la G2 (en processus, horloge fixe au 2026-10-03, `418a421f` contre `e4c51d7b`) : rejeu des 111 appels de `served-replay-cm3` et 15 corps HTTP bruts par `handleJsonMirror`. Pour la ligne datée de MONARK (ligne r4 21, contrôle par diff de C2).
- **Décisions** : **0 changement** de `action`, `allow` ou `reason` sur les 111 appels (107 décisions, 4 refus aux messages identiques). `intent`, `tool`, `remaining_budget`, `task_class`, `method`, `alpha`, `n_calib`, `qhat`, `abstain`, `residual` et `produced_at` identiques sur les 107.
- **Octets qui changent** (107 décisions sur 107) : `schema_version` et `verdict.schema_version` (1.1.0) ; `calib_digest` retiré ; `qhat_unit`, `scale`, `scores_sha256`, `cell_key`, `policy_row_sha256`, `policy_table_sha256` et `request_sha256` ajoutés. Sur **4** décisions `under_calib` (cascade × 3, USDe hors clé), la région `{kind:"set", labels:[], label_schema}` devient `null` et la ligne de résumé passe de `region={}` à `region=null` (seule autre différence de cette ligne : le jeton `scores_sha256=`). Le texte d'honnêteté est inchangé ; `calib_digest=` n'apparaît plus dans `content`.
- **Champs de case** : USDe engagée `label`, clé = `predictor_id` ; USDe hors clé, ligne nulle ; liq s0, clé = strate `…/A/s0` dérivée par le serveur ; cascade, ligne nulle ; BYO intervalle `label`, BYO ensemble `score`, les trois champs de table nuls (Q-C1). Valeurs servies égales aujourd'hui à la ligne de table (USDe `qhat` 0,00013119228083333334 ; liq `qhat` 126184298996, `n_calib` 170, `alpha` 0,01). Les empreintes de table liq mesurées à la G2 changent au pli (Q-3b1-1, ci-dessus).
- **Famille des refus I-JSON (ligne 9 de la liste fermée des changements servis, Q-C2)** :

  | Cas | Base `418a421f` | Tête du lot |
  |---|---|---|
  | `yhat` 1e400 (USDe, BYO intervalle), `yhat` −1e400 (cascade) | 200 `abstain/non_evaluable` | 400 `param_invalid` |
  | `intent` 1e400 (USDe) | 200 `abstain/intent_not_in_region` | 400 `param_invalid` |
  | surrogate isolée dans `params.intent` (BYO ensemble) | 200 | 400 `param_invalid` |
  | surrogate isolée dans `params.tool` | **500 `output_invalid`** | 400 `param_invalid` |

  Le dernier cas appartient à la même famille des refus I-JSON (lecture de MONARK) ; il était **un 500 à la base**, et non un 200 comme le dit la ligne r4 21 pour les autres cas. Les refus antérieurs gardent code et texte (liq 1e400 → `liq_yhat_domain` ; surrogate dans `predictor_id` → 400 `invalid_input` ; surrogate dans un libellé BYO → `byo_calibration_invalid` ; BYO ensemble à `tau` trop grand → `byo_set_tau_cap` avant `param_invalid`) : l'ordre « après tous les contrôles existants » du G0.
- **Parité HTTP et MCP** de `request_sha256` et des codes sur 7 vecteurs ; canonisation sur `validated.value` (ordre des clés, blancs, `1.0e-4`/`1e-4`, `-0`/`0` donnent la même empreinte). Hors plan : rien.

## Pli de la G2 (`G2-cm-3c-3b1.md`, APPROUVE SOUS RÉSERVE)

- **B-1** (19 rouges comptés, pas nommés) : la liste fermée nomme désormais chaque rouge, test par test, avec la comparaison d'ensembles de la G2 (section « Liste rouge fermée »).
- **B-2** (borne d'intégration) : section R-25. Q-3b1-3 posée et tranchée (décision de cellule ci-dessous).
- **m-1** (survivants sans tueur vert à la tête de C2a) : **remis à 3c-3b2**, un tueur fermé par survivant, à écrire au G0 de 3b2 :

  | Mutant | Adresse (G2) | Tueur dans 3c-3b2 |
  |---|---|---|
  | M1 | `gate.ts:1014` `RangeError` → `false` | vecteur Q-C2 1e400 en HTTP (400 `param_invalid`, pas 500) |
  | M2 | `gate.ts:1004` ligne courante → `false` | `policy_row_sha256` non nul et égal à `sha256Canonical` de la ligne courante, USDe et liq s0 |
  | M3 | `gate.ts:452` Q-C1 inversé | `qhat_unit` `label` en intervalle, `score` en ensemble |
  | M5 | `gate.ts:541` clé de cascade fixe | `cell_key` de la cascade = `predictor_id` reçu |
  | M6 | `calibration.ts:276` garde à l'import retirée | test par processus fils, mode `digest`, vers l'épingle neuve |
  | M7 | `policy-served.ts:27` `guardMarginalTable` retiré | LIQ-BAND-EXACT-GUARD-1 au chargement servi (table liq altérée ⇒ refus) |
  | M8 | `policy-served.ts:23` cascade sous `LIQ_POLICY` | parité des empreintes contre `servedPolicyTables` et épingle de la table cascade |
  | M9 | `gate.ts:991` texte de classe liq remplacé | relation `content` ↔ `text` sur USDe et cascade (condition 5 de Q-C3) |
  | M10 | `gate.ts:994` `registry_file` USDe changé | épingle des valeurs de `source` (USDe ; liq par la relecture de Q-3b1-1, déjà tenue par le test du pli) |
  | M11 | `kata-path.ts:114` parité kata rompue | `kata_served_tables_digests` ré-ancré sur `policy-served.ts` |

  M12 (`gate.ts:1012`, `attested` retiré) est équivalent sur la surface servie (section des tueurs).
- **m-2** (commentaires 1.0.0) : **fait au pli** (`973704f3`) : `calibrate.ts:35`, `:127-128`, `:153-154` nomment `scoresSha256`, `gate.ts:721` nomme `scores_sha256` ; comptes de lignes gardés, aucune adresse de tueur ne bouge. `grep -n "calibDigest\|calib_digest" apps/harness/src/tools/` rend 0 ligne.
- **m-3** : phrase de l'écart 2 corrigée (provenance C5 de btc-dir non vérifiée, classe retirée).
- **m-4** : les quatre modules `policy-*` du graphe servi, nommés à « Ce que le lot écrit ».
- **m-5** : la phrase de Q-C3 sur `guardMarginalTable`, à « Ce que le lot écrit » ; le test LIQ-BAND-EXACT-GUARD-1 (tueur M7) est à 3c-3b2.
- **m-6** : section « Surface servie mesurée », avec le cas surrogate dans `params.tool` (500 → 400) rangé dans la famille des refus I-JSON.
- **m-7** (valeurs servies non lues sur la ligne admise) : **remis à 3c-3b2** : test d'égalité `verdict.qhat === row.qhat`, `n_calib`, `alpha` et `scores_sha256` sur USDe et liq s0, tueur CONST sur le `qhat` écrit par `marginalRow` (`policy-marginal.ts`, adresse fixée au gel de 3b2). L'écart (G0 de 3c-3b, §5 point 6) est à poser dans la prochaine question à MONARK.
- **m-8** : propriétaire de la garde (a) : levée au pli (Q-3b1-1) ; plus dans la liste.

## Questions (pour MONARK)

- **Q-3b1-1 (garde d'export, écart 1)** : **tranchée**, accord de MONARK (message `2026-10-05-MONARK-vers-RECHERCHES-3c-3b1.md`) : relecture datée de Q-3b-4, appliquée au pli (section « Relecture datée de Q-3b-4 »).
- **Q-3b1-2 (comparaison de la liste rouge)** : **tranchée**, accord de MONARK (même message) : on compare par nom de test ; un rouge hors liste est un écart ; un rouge listé absent ou vert n'en est pas un. La liste est maintenant nommée en entier (B-1).
- **Q-3b1-3 (borne d'intégration, B-2)** : posée par RECHERCHES (message à MONARK écrit par RECHERCHES, hors de ce lot) et **tranchée en décision de cellule** : l'intégration de C2 passe par **R25-INTEGRATION-RULE-1** ; la borne de repli de 1 400 **n'est pas relevée** ; si la règle n'est pas sur la base à temps, **C2b est coupée vers C'**, avec la coupe mesurée au G0 court de 3c-3c.

## Jobs de CI rouges à la tête C2a (ajout après l'ouverture de #150)

La liste fermée ci-dessus compte des tests. Deux jobs de CI sont rouges à la tête, et aucun ne sort de cette liste ni des familles décidées (Q-3a-1) :

- **`g3-verification`** : il s'arrête à son étape `tsc` (sortie 2), avant l'étape des tests. Les erreurs sont les 66 erreurs `tsc` déjà comptées, toutes dans des fichiers de test : tests du harnais (3c-3b2) et tests racine (3c-3c). Il y en a 0 dans `apps/harness/src`. La comparaison des tests par nom vient donc du passage complet local et de l'oracle Windows.
- **`g3-site`** : `next build` échoue au prérendu de `/console` et de `/integrators`.
  - Message : `harness served: gate result does not match its schema (missing {request_sha256}, undeclared {})`, à `apps/site/lib/harness-served-load.ts:47`, depuis `:220` et `:300`.
  - Cause : le chargeur valide le fichier servi `apps/site/data/harness-served.json`, encore en 1.0.0 jusqu'à T0, contre le schéma `gate-decision` gelé, déjà en 1.1.0.
  - Même cause que les 10 rouges de `harness-served` de la liste.
  - Propriétaire : 3c-3c. `harness-served-load.ts` et `harness-pending.json` sont en C2 selon le G0 du bloc (l. 83 et l. 186).
  - Exigence pour 3c-3c : le chargeur lit le servi sous son propre schéma, 1.0.0 jusqu'à T0, et l'instantané en attente sous 1.1.0. La tête de C2b doit avoir `g3-site` vert.
