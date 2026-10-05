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
  - ce commit (G7).
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` (mode changé par `npm ci`) jamais indexé.

## Ce que le lot écrit

- **`apps/harness/src/`** (sources du prototype mesuré au G0 de 3c-3b, plus la garde rendue testable) :
  - `calibration.ts` : `scoresSha256` à la place de `calibDigest` ; épingles C5 gardées comme valeurs de provenance (`digestPinned`, `USDE_STABLE_RUN_CALIB_DIGEST_PINNED`, `UKEMI_LIQ_S0_CALIB_DIGEST_PINNED`) ; garde de chargement `assertCommittedScores` (exportée), appelée sur chaque entrée engagée, contre trois épingles neuves hors du bloc généré : `USDE_STABLE_RUN_SCORES_SHA256_PINNED` = `e44a68b6…cfd28` (sha256 de `fixtures/usde-calib-scores.json`, vérifié par le test), `UKEMI_LIQ_SCORES_SHA256_PINNED` s0 = `a9277222…6ee3c8`, `CALIB_DIGEST_PINNED` btc-dir = `bb438031…73afd6` (voir écart 2) ;
  - `policy-served.ts` (neuf, Q-C3) : `servedMarginalTables`, appelé par `kata-path.ts` (`servedPolicyTables`) et par `tools/gate.ts` (`SERVED_MARGINAL_TABLES`, construit au chargement, en échec fermé par `guardMarginalTable`) ;
  - `tools/gate.ts` : `SCHEMA_VERSION` de `@monark/contracts` (réexporté) ; `cell` sur chaque verdict (BYO : `qhat_unit` du mode, `scale` et les trois champs de table nuls, Q-C1 ; USDe, liq, cascade : `servedCell`, clé recherchée, ligne courante si elle existe, empreinte de la table) ; `labelSchema` retiré ; `requestSha256: envelopeSha256(prediction, params, attested)` sur le `GateInput` (l.979), avec la conversion de la seule `RangeError` en 400 `param_invalid` (Q-C2) ; résumé `region=null` et `scores_sha256=` ; `SERVED_TABLE_TEXTS` (textes Z-3 et `source` de Q-3b-4) ; en-tête à la version du paquet ;
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
| `kata_reasons_within_coverage_reasons` (Q-3a-2) | `apps/harness/test/kata-path.test.ts` | `apps/harness/src/kata-path.ts:18 CONST "\"region_degenerate\"] as const" -> "\"region_degenerate\", \"kata_only\"] as const"` | **tué** |

Chaque mutant seul, test rejoué seul, fichier restauré, sha256 vérifié avant et après.

- **Tueur ré-ancré de `served-replay-cm3`** (`packages/hikae/src/l3-gate.ts:90 SDL` de la garde E-8), tiré maintenant que le harnais se charge : le test est rouge au gel sur son empreinte (prédictions écrites `"1.0.0"`, refusées `schema_version_unsupported` : conversion de 3c-3b2). Rejoué sur une copie de travail du test, hors dépôt et retirée ensuite, version écrite `"1.1.0"`, `requestSha256` posé sur l'entrée E-8 et l'assertion d'empreinte ôtée : **vert sans mutant, rouge par assertion avec le mutant** (tué).
- Le mode `attested` de l'empreinte n'est atteignable sur aucun chemin servi : tout `attested` est refusé `attested_inconsistent` avant le calcul (aucune classe servie n'a de sujet d'attestation). Le test ne le couvre donc pas ; la branche reste écrite pour la spécification.

## red-proof

`node scripts/red-proof.mjs --base be3e5210 --gel b4f26a41 --repo /home/user/monark-governance-c2b --draw 4 --seed 37` : sortie 1 (REFUSED, attendu) ; **4 jugés, 71 inchangés, 0 tueur tiré** ; `RED-PROOF.json` sha256 `faf13535…3db1` (dépend des chemins).
- **Refusés, 4, attendus** : les quatre tests neufs, « import red on a file that exists at base » : à `be3e5210`, le harnais ne se charge pas (`calibration.ts:16` importe `calibDigest`, liste fermée de 3c-3a). Aucun test du harnais ne peut être F2P à ce lot ; les quatre tueurs sont tirés à la main (ci-dessus), comme prévu au G0.
- Même résultat au premier gel, avant le pli et avant le placement des lignes (`--base 2585c2fe --gel a0ac692f`, commit local remplacé par `946e74e8` avant toute poussée) : 4 jugés, 4 refusés pour la même raison.

## Ancres

- `verifie-ancres.mjs . --touched be3e5210 HEAD` : **29 tueurs, 28 ancrés, 0 dérivé, 1 perdu** : `apps/harness/test/kata-path.test.ts:279` (`kata_served_tables_digests`, ancre `kata-path.ts:122 "\"ascending\", texts.marginal"`) ; la ligne a quitté `kata-path.ts` pour `policy-served.ts` (Q-C3). Le test est rouge au gel (forme de `ServedTableTexts`) et sa conversion, avec son tueur ré-ancré sur `policy-served.ts`, est à 3c-3b2.
- Arbre entier : 939 tueurs, 928 ancrés, 0 dérivé, 11 perdus : les **10 de la base** (relevés au G7 de 3c-3a) et celui ci-dessus.
- Premier gel mesuré : 18 tueurs de tests non touchés perdaient leur adresse (`gate.ts` +27 lignes, `kata-path.ts` −1, `export-public.mjs` +2). Plutôt que de réécrire 17 lignes de tueurs (34 lignes R-25), le gel garde le compte de lignes au-dessus de chaque adresse (section « Ce que le lot écrit »).

## Liste rouge fermée, mesurée à la tête

Passages complets `npm test` (Node 24.21.0, variables de proxy retirées, TMPDIR `/tmp/c3b1-1`). #142 n'est pas sur la base : les comptes varient d'un passage à l'autre.
- **Passage A**, à la tête du gel avant la fusion de `be3e5210` (arbre identique au gel `946e74e8` hors adresses de lignes) : 2 188 tests, 2 111 verts, **65 rouges**, 12 sautés ;
- **Passage B**, à `b4f26a41` : 2 275 tests, 2 189 verts, **66 rouges**, 20 sautés ;
- **Passage C**, à `b4f26a41` : 2 273 tests, 2 187 verts, **66 rouges**, 20 sautés ; **les mêmes 66 qu'au passage B, nom pour nom**.

Les 66 rouges du passage B (le passage A a les mêmes moins `how_page_rendered_vocab_has_no_numeric_hole`, absent de sa sortie), par propriétaire :

| Famille | Rouges | Propriétaire | Cause |
|---|---|---|---|
| Harnais, `apps/harness/test/` | **28** : `calibrate` × 4 (`calibrate_content_carries_verdict_summary`, `calibrate_fails_closed_on_insufficient_calibration`, `calibrate_schema_shapes_match_the_adr`, `calibrate_set_digest_is_calibDigest_and_deterministic`) ; `calibration-liq` × 1 (`u4b_calib_registry_digest_guard_per_stratum`) ; `cascade` × 1 (`cascade_returns_frozen_prediction`) ; `gate-cm2b` × 1 (`usde_band_edges_within_half_ulp_stated_and_band_unchanged`) ; `gate-empty-set` × 1 (`empty_set_never_commits_at_l3`) ; `gate-liq-artifact` × 1 (`u4b_gate_serves_region_from_real_artifact`) ; `gate-liq` × 1 (`u4b_gate_liq_serves_committed_stratum_and_abstains_elsewhere`) ; `gate` × 9 (`gate_byo_audit_calib_digest_closes_the_loop`, `gate_byo_honesty_text_is_wired_on_calibration_presence`, `gate_committed_classes_unchanged_without_calibration`, `gate_stable_run_byo_anti_override_is_key_aware_A6`, `gate_stable_run_family_isolation_fail_closed_A7acde`, `gate_stable_run_honesty_text_is_keyed_A2_A7f`, `gate_stable_run_noncommitted_key_abstains_under_calib`, `gate_stable_run_usde_committed_region_A7b`, `numeric_under_calib_region_is_not_directional`) ; `http` × 1 (`http_gate_byo_calibration`) ; `kata-path` × 3 (`kata_imposed_params_without_row`, `kata_no_row_verdict_fields`, `kata_served_tables_digests`) ; `openapi` × 1 (`openapi_generated_matches_frozen_schemas`) ; `policy-guard` × 1 (`guard_modules_are_not_served`) ; `policy-row-schema-corpus` × 1 ; `policy-table-file` × 1 (`policy_modules_are_not_served`) ; `served-replay-cm3` × 1 | **3c-3b2** | renommages (`calib_digest`, `set_digest`), région nulle, prédictions écrites `"1.0.0"`, forme de `ServedTableTexts`, module servi neuf `policy-served.ts`, schémas projetés, garde par strate en mode `digest` |
| `packages/atelier` | **5** (les 5 du fichier, inchangés depuis 3c-3a) | 3c-3c | fixtures racine 1.0.0 |
| Racine, lecteurs du format du site | **7** : `ci-gates` × 4, `sas-audit` × 2, `site-docs` × 1 (les mêmes qu'au G7 de 3c-3a) | 3c-3c | comptes et gloses lus sur les schémas |
| Racine, chargement | **2 fichiers** : `fixtures-root`, `narabi-live` | 3c-3c | importent `calibDigest` du paquet |
| Racine, harnais servi et instantanés (se chargent maintenant, rouges sur le format) | **22** : `harness-served` × 10, `site-ukemi` × 6, `verify-harness-liq` × 3, `h5-e2e-probe` × 2 (`h5_carries_attested`, `probe_harness_records_real_decision`), `byo-demo-probe` × 1 (`probe_byo_demo_loop_closes`) | 3c-3c | instantanés servis 1.0.0 (`calib_digest`, `set_digest`, région vide) |
| Test 42 | **1** : `export_public_no_governance_no_french` | C2b | `tsc` du miroir exporté : erreurs des tests du harnais (3c-3b2) et racine (3c-3c) |
| Garde d'export (a) | **1** : `export_exclude_data_no_exported_consumer` | **question Q-3b1-1** | `apps/harness/src/tools/gate.ts` (exporté) nomme `U4b-scores-weth-2025-09-22.jsonl`, donnée exclue du miroir (écart 1) |

- **Sortis de la liste de 3c-3a** : les 27 fichiers du harnais se chargent (28 tests rouges restent, à 3c-3b2) ; **les 7 fichiers de la sentinelle sont verts** ; 10 des 12 fichiers racine se chargent.
- **Hors liste, environnement** : aucun rouge d'environnement aux passages A et B (`dojo_history_collect_to_verify_end_to_end` vert aux deux).
- **0 rouge** dans `packages/contracts`, `packages/hikae`, `packages/ukemi`, `packages/monark`, `apps/sentinel`, `apps/bell`, `apps/dojo`.

## Contrôles

- **`tsc --noEmit`** : **0 erreur dans `apps/harness/src/`** (le harnais se type). Erreurs restantes : 60 dans `apps/harness/test/` (`gate` 16, `calibrate` 9, `ukemi-predict` 8, `gate-liq` 8, `gate-liq-artifact` 7, `gate-cm2b` 5, `kata-path` 3, `served-replay-cm3` 2, `gate-empty-set` 2, `policy-row-schema-corpus` 1 ; 3c-3b2) et 6 à la racine (`fixtures-root` 2, `narabi-live` 1, `site-ukemi` 1, `byo-demo-probe` 1 ; 3c-3c) — total 66, contre 84 au gel de 3c-3a.
- **`eslint .`** : **0 erreur** (18 au gel de 3c-3a, toutes levées).
- **`lint:ratchet`** : **84/69**, rouge. Les 15 de plus sont dans la famille : tests du harnais 10 (`calibrate` 6, `gate` 2, `gate-cm2b` 1, `ukemi-predict` 1 ; 3c-3b2), racine 5 (`narabi-live` 2, `fixtures-root` +1, `site-ukemi` 1, `byo-demo-probe` 1 ; 3c-3c). Le retour à 69 suit 3c-3b2 et 3c-3c.
- `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK (chemins et langue).

## R-25

`r25()` de `scripts/oracle/r25.mjs` :
- **lot contre `be3e5210`** (tête de 3c-3a pliée) : **STAT 469** (+363 / −106) ≤ 547 ; CONTENT_STAT 0. Sources 237 (`gate.ts` 89, `calibration.ts` 53, `policy-served.ts` 30, `calibrate.ts` 26, `kata-path.ts` 25, `schema-projection.ts` 8, `ukemi-predict.ts` 4, `registry.ts` 2), export 2, chargement des tests 15, tests neufs 215 (`gate-request-sha256` 148, `calibration-scores-pins` 55, parité kata 12 avec ses deux imports) ;
- **C2a cumulée** (3c-3a pliée + 3c-3b1) contre `418a421f` (= `base/c2-integration`) et contre `5a491fa6` : **STAT 1 014** ≤ 1 205 (545 + 469).
- **Reste pour C2b** : 3c-3b2 (~250 estimés au G0 de 3c-3b1, plus m-6 et la conversion de `kata_served_tables_digests` et de son tueur) et 3c-3c (~285).

## Écarts au G0 du lot

1. **Garde d'export (a) rouge** (non prévue) : la valeur de `source` de la table liq décidée en Q-3b-4 (`registry_file: "apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-weth-2025-09-22.jsonl"`) est écrite dans `apps/harness/src/tools/gate.ts`, fichier exporté, et nomme une donnée exclue du miroir par `scripts/export-exclude-data.json` (« decision 111 until item EXPORT-U4B-111-1 at the switch window »). Le test `export_exclude_data_no_exported_consumer` rougit. Le texte servi de la table nommerait aussi un fichier absent du miroir. Rien n'est contourné dans ce lot : la valeur décidée est gardée et le rouge est déclaré (Q-3b1-1). La même remarque vaut pour `generator: "scripts/record-u4b-calib.mjs"`, non exporté (la garde (a) ne regarde que les données).
2. **Épingle btc-dir remplacée en place** : `CALIB_DIGEST_PINNED` passe de l'empreinte C5 `fcebed27…` à `scoresSha256` `bb438031…` (classe retirée, hors bloc généré, aucun test ne vérifie l'empreinte C5 par l'outil ; `fcebed27…` reste dans les documents de provenance). USDe et liq gardent leurs épingles C5 de provenance à côté des épingles neuves.
3. **Garde de chargement exportée** (`assertCommittedScores`) : le prototype l'écrivait en boucle anonyme ; la fonction rend le test de Q-3b-2 possible sans processus fils. Le test par processus fils existant (`u4b_calib_registry_digest_guard_per_stratum`) est à 3c-3b2.
4. **Placement des lignes neuves de `gate.ts` et de `export-public.mjs`** pour garder les adresses des tueurs (section Ancres) : le diff diffère du prototype par l'ordre, pas par le contenu.
5. **Message du refus 1.0.0 (Q-F2)** : non écrit, le texte exact attend la ligne datée de MONARK (ligne (7) de l'ADR-CM) ; le message actuel nomme la version parlée par `SCHEMA_VERSION`. Reporté à 3c-3b2 ou à l'arrivée de la ligne.
6. **Commentaire C-3 de `gate.ts` (bloc des codes réservés)** non touché : `input_invalid` et `json_invalid` restent réservés (coupe des corps 400 vers C', Q-3a-5).

## Questions (pour MONARK)

- **Q-3b1-1 (garde d'export, écart 1, bloquante pour la tête de C2b).** La `source` liq décidée (Q-3b-4) nomme une donnée exclue du miroir. Choix :
  1. l'item EXPORT-U4B-111-1 (export de la série de scores fraîche, ligne D7 de MONARK) entre dans C2b ou avant elle ;
  2. ou `registry_file` de la table liq nomme une source exportée (par exemple la série par son seul sha256 `fd6fab7e…`, déjà dans le texte de provenance servi, sans le chemin), par une lecture datée de Q-3b-4.
  Défaut de RECHERCHES : 2, qui ne déplace aucune donnée et garde le contrôle par empreinte ; la valeur exacte passe par ta ligne. 3c-3b2 l'applique.
- **Q-3b1-2 (comparaison de la liste rouge).** La liste fermée ci-dessus compte des tests, et un fichier qui ne se charge pas compte pour un (`fixtures-root`, `narabi-live`). Les comptes de passage varient sans #142 (passage A : 65, sans la ligne `how_page_rendered_vocab_has_no_numeric_hole`). Défaut : tu compares par nom de test, et un rouge de la liste absent d'un passage n'est pas un écart.
