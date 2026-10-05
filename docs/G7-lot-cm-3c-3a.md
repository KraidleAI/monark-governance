# G7 du lot CM-3c-3a (contrat 1.1.0, bloc C, premier lot de la PR C2) : paquet gelé et moteur en 1.1.0

- **Plan** : `docs/G0-lot-cm-3c-3a.md` (G0 `ae41768b`, section 9 « Décisions reçues » au commit `c7434307`), sous le G0 du bloc `docs/G0-bloc-c-cm-3c-2.md` (sections 3.2, 5, 6, 9, 13, 14) ; décisions de cellule Q-1 à Q-3 (#147) et Q-3a-1 à Q-3a-7 (messages de MONARK du 2026-10-05, `…-147.md` et `…-3c-3a.md`).
- **Base du lot** : `5a491fa6` (`origin/base/chantier-moteur-2026-10-03`, #146 puis #147), fusionnée dans la branche par le commit de fusion `69c27fbe` avant tout test. Synchro du tronc (`25f61a68`) refusée par R-25 et retirée : pas de synchro du tronc avant C2 (décision de cellule). **Base refetchée avant ce G7 : inchangée (`5a491fa6`)**, aucune seconde fusion.
- **Commits** (branche `recherches/cm-3c-3a`, aucune PR ; C2 ne s'ouvre qu'après 3c-3b et 3c-3c) :
  - `69c27fbe` fusion de la base ;
  - `c7434307` G0, section 9 (décisions) ;
  - `e6cc9c18` tests rouges T1 à T10 ;
  - **`64e75e66` gel** ;
  - ce commit (G7).
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` (mode changé par `npm ci`) jamais indexé.

## Ce que le lot écrit

- **Schémas** (D9-ter, ré-épinglage 2, seconde moitié) :
  - `schemas/coverage-verdict.schema.json` : `schema_version` constante `"1.1.0"` ; `method` + `risk-control` ; `region` = ensemble, intervalle ou `null` (troisième branche `{ "type": "null" }` du `oneOf`) ; 17 champs requis (+ `qhat_unit`, `scale`, `scores_sha256`, `cell_key`, `policy_row_sha256`, `policy_table_sha256` ; − `calib_digest`) ; 18 raisons (+ `calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate`) ; la description nomme les couplages de la spec §5 tenus hors schéma ;
  - `schemas/gate-decision.schema.json` : constante `"1.1.0"`, `request_sha256` (9 requis), mêmes 18 raisons ;
  - `schemas/prediction.schema.json` : description seule (motif de version gardé, refus nommé `schema_version_unsupported`, spec §3).
  - Empreintes LF avant → après : `coverage-verdict` `203591de…8d88` → `99ac30ab…3120` ; `gate-decision` `ed725b73…fea9` → `2b0ee599…1115` ; `prediction` `f304e072…d3cc` → `3ca09b90…3013`.
- **`packages/contracts/src/`** :
  - `enums.ts` : `SCHEMA_VERSION = "1.1.0"` (constante unique, Q-3a-4) ; 5 raisons ; `risk-control` ; `REASONS_WITHOUT_REGION` (11 raisons : colonne « Region » none ou any de la spec §6, lecture Q-3a-6) ;
  - `types.ts` : `CoverageVerdict` 1.1.0 (`region` nullable, `qhat_unit: QhatUnit` de `policy-table.ts`, `scale`, `scores_sha256`, `cell_key`, `policy_row_sha256`, `policy_table_sha256`) ; `GateDecision.request_sha256` ;
  - `closed-check.ts` : clés 1.1.0 ; `region: null` admis ; couplages de la spec §5 (`assertVerdictCouplings`, l.145-151), donc portés aussi par `serializeVerdict` et `assertClosedGateDecision` ;
  - `calib-digest.ts` **retiré**, et son export de `index.ts` ; `index.ts` exporte `SCHEMA_VERSION` et `REASONS_WITHOUT_REGION`.
  - `test/contracts-frozen.manifest.json` ré-épinglé **dans le commit du gel** : 7 entrées changées (3 schémas, `enums.ts`, `types.ts`, `closed-check.ts`, `index.ts`), 1 retirée (`calib-digest.ts`). Compte des schémas inchangé (9).
- **`packages/hikae/src/`** :
  - `verdict.ts` : `buildVerdict` reçoit `cell: VerdictCell` (`{ qhatUnit, scale, cellKey, policyRowSha256, policyTableSha256 }`, requis) et écrit `scores_sha256 = scoresSha256(scores)` dans l'ordre donné ; `noRegionVerdict(reason, params)` (région et q̂ nuls, `abstain`) ; `underCalibVerdict(params)` = `noRegionVerdict("under_calib", params)`, nom gardé ;
  - `interval-conformer.ts` : `cell` requis et transmis ; sous-calibration sans région ;
  - `l3-gate.ts` : **étape 4 de la spec §6**, une seule ligne insérée à la place de la garde `under_calib` (l.94 ; ancienne l.92), sans réordonner : `nCalib < nMin`, `region === null` ou raison de `REASONS_WITHOUT_REGION` ⇒ `abstain` avec la raison du verdict si elle est sans région, sinon `under_calib` ; la ligne NDG-1 de `decideInterval` est inchangée (B-16 en C') ; `GateInput.requestSha256` (neuf) écrit `request_sha256` (écart 1) ;
  - `s2/instrument.ts` : `SCHEMA_VERSION` lu du paquet, `cell` des verdicts de démonstration (`score`, sans table), `requestSha256` de l'enveloppe déclarée de chaque état ; `packages/hikae/test/fixtures.manifest.json` ré-épinglé (`7729800…4306` → `08d646a2…343f`) ; les 9 décisions S2 gardent action et raison (distribution 3/2/3/1 du test).
- **Imports de `calibDigest` hors paquet** : `scripts/record-usde-calib.mjs:23` et `scripts/record-u4b-calib.mjs:13` lisent l'outil de provenance (une ligne chacun ; `.d.mts` inchangé, il ne nomme pas le paquet) ; `packages/hikae/test/risk-control-quantile.test.ts:17`, `runs.test.ts:14` aussi, **empreintes épinglées inchangées** ; `packages/contracts/test/calib-digest.test.ts` → `test/calib-digest-vectors.test.ts` par `git mv` (import seul changé, renommage détecté, 2 lignes R-25).
- **Re-gel d'ADR-U4b (Q-2)** : amendement daté du 2026-10-05 en fin de `docs/adr/ADR-U4b-calibration-episode-frais.md` (sha256 LF `5733daeb…31a3` → `aa81dbca…7c41`), et `GENERATOR_SHA256_LF` de `apps/harness/test/calibration-liq.test.ts:41` ré-épinglé dans le même commit. **Sortie identique** : `buildRegistryEntries` lancé directement, base (`git archive 5a491fa6`) et gel, sur `U4b-scores-weth-2025-09-22.jsonl` versé : 4 strates, mêmes empreintes C5 (s0 `e7e67366…f334`, égale à l'épingle du registre, s1 à s3 `e3cd7a61…`, `6626856f…`, `66687aad…`), q̂ s0 `126184298996`, sha256 de la sortie JSON `6639ea70…35d4` des deux côtés.
- **Tests des paquets au format 1.1.0** : `packages/contracts/test/fixtures.ts` (deux verdicts, une décision) ; `cell` sur les appels de `buildVerdict` et `conformInterval`, `requestSha256` sur les `GateInput` de `packages/hikae/test/` (une ligne par site) ; `interval-conformer.test.ts` (verdict validé par ajv en `"1.1.0"`). Les littéraux `"1.0.0"` des tests de `packages/hikae` qui ne passent pas par un schéma restent.
- **Aucune surface servie touchée** : `git diff 5a491fa6 64e75e66` est vide sous `apps/harness/src/`, `apps/site/`, `fixtures/`, `packages/{ukemi,atelier,monark}/src/`. Le générateur des 9 décisions (`gate-decision-fixtures-gen`) reste vert : `request_sha256` absent de ses entrées est omis par `JSON.stringify`, et l'étape 4 rend les mêmes décisions sur ses verdicts.

## Liste rouge fermée, mesurée à la tête (gel `64e75e66`)

Deux passages complets `npm test` au gel (Node 24.21.0, variables de proxy retirées, TMPDIR `/tmp/c3a-1`). Un fichier qui ne se charge pas compte pour un test, et #142 n'est pas sur la base : le compte varie d'un passage à l'autre.
- **Passage 1** : 1 964 tests, 1 881 verts, **63 rouges**, 20 sautés (59 de la liste close + 4 de la ligne « Environnement ») ;
- **Passage 2** : 1 952 tests, 1 874 verts, **60 rouges**, 18 sautés (59 de la liste close + `dojo_history_collect_to_verify_end_to_end`), aucun `ENOSPC`.

Les rouges, par famille :

| Famille | Rouges | Cause mesurée |
|---|---|---|
| Harnais, `apps/harness/test/` | **27 fichiers** : `attest`, `calibrate`, `calibration-liq`, `cascade`, `error-code-sites`, `error-code`, `gate-byo-confusable`, `gate-byo-lookalike`, `gate-byo-tau-cap`, `gate-cm2b`, `gate-empty-set`, `gate-liq-artifact`, `gate-liq`, `gate-produced-at`, `gate`, `http`, `kata-path`, `openapi`, `oracle-fixtures`, `policy-marginal`, `policy-row-schema-corpus`, `registry`, `schema`, `served-replay-cm3`, `server`, `ukemi-predict`, `usde-calibration` | liaison ESM : `apps/harness/src/calibration.ts:16` et `tools/calibrate.ts:27` importent `calibDigest` (Q-3a-1) |
| Sentinelle, `apps/sentinel/test/` | **7 fichiers** : `sentinel-catchup-budget`, `sentinel-chainstack-guard`, `sentinel-exclude-hosts`, `sentinel-instrument-replay`, `sentinel-retry`, `sentinel`, `ukemi-u4b-fresh` | même liaison, par import transitif du harnais |
| Racine, chargement | **12 fichiers** : `byo-demo-probe`, `cra-b`, `fixtures-root`, `h5-e2e-probe`, `harness-deploy-config`, `harness-served`, `narabi-live`, `probe-narabi`, `site-build-fleet`, `site-ukemi`, `skills`, `verify-harness-liq` | import du harnais ou de `calibDigest` du paquet |
| Racine, lecteurs du format (site) | **7 tests** : `ci-gates` × 4 (`frozen_contract_fields_stay_dynamic`, `gate_action_enum_order_is_frozen`, `sim_emitted_reason_codes_subset_of_frozen_enum`, `how_page_rendered_vocab_has_no_numeric_hole` ; messages : 17 requis ≠ 12, 18 raisons ≠ 13, 5 raisons sans glose), `sas-audit` × 2 (`sas_audit_reasons_from_frozen_enum`, `sas_audit_labels_from_required`), `site-docs` × 1 (`docs_reason_glosses_track_the_frozen_enum`) | comptes et gloses du site lus sur les schémas : 3c-3c |
| `packages/atelier` | **5 tests** (tous ceux du fichier) : `atelier_state_oracle`, `atelier_replays_root_fixtures`, `atelier_no_forbidden_vocab`, `perps_stubs_throw`, `atelier_no_network` | `loadRootFixtures` passe les 9 `fixtures/*.gate-decision.json` 1.0.0 par `assertClosedGateDecision` : clé `calib_digest` inconnue (régénérées en 3c-3c) |
| Test 42 | **1** : `export_public_no_governance_no_french` | la CI du miroir exporté lance `tsc` (rouge de la famille, ci-dessous) |
| Environnement (hors liste) | passage 1 : `J-HEADER`, `LINT-UNTRACKED-TMP-1`, `TIER-FROM-HEADER` (`test/journal-index.test.ts`) ; passages 1 et 2 : `dojo_history_collect_to_verify_end_to_end` (`test/dojo-history-e2e.test.ts`) | passage 1 : `ENOSPC` du disque partagé (1,2 Go libres) ; le test Dojo rend les codes de sortie `[1, 1, 1]` sous la charge du passage complet, il ne lit ni le paquet gelé ni le moteur (`apps/dojo`, `out/mint.txt`) ; les deux fichiers relancés seuls, deux fois : **29/29 verts** |

Hors environnement : **59 rouges, les mêmes aux deux passages, tous dans la liste close** ; **0 rouge** dans `packages/contracts`, `packages/hikae`, `packages/ukemi`, `packages/monark` et les autres paquets hors `atelier` (passage des paquets : 342 tests avec `contracts_frozen`, les deux tests de provenance et `gate-decision-fixtures-gen` ; seuls les 5 d'`atelier` rouges). `contracts_frozen` vert.

- **`tsc --noEmit`** : 84 erreurs, toutes dans la famille : `apps/harness/src/` (`gate.ts` 25, `calibration.ts` 1, `tools/calibrate.ts` 1), `apps/harness/test/` (`gate` 16, `gate-liq` 8, `gate-liq-artifact` 8, `ukemi-predict` 8, `gate-cm2b` 5, `gate-empty-set` 2, `served-replay-cm3` 2, `calibrate`, `calibration-liq`, `http`, `usde-calibration` 1 chacun), racine (`fixtures-root` 2, `narabi-live` 1, `site-ukemi` 1). `tsc` sur `packages/contracts` et `packages/hikae` : 0.
- **`eslint .`** : 18 erreurs, toutes `no-unsafe-*` sur `apps/harness/src/{calibration,tools/calibrate,tools/gate}.ts` (types non résolus de `calibDigest`).
- **`lint:ratchet`** : 111/69 ; les 42 de plus sont tous dans la famille (mesure fichier par fichier, base contre gel : `apps/harness/src/` 18, `apps/harness/test/` 20, `fixtures-root` +1, `narabi-live` +2, `site-ukemi` +1). Une hausse de 3 dans `packages/contracts/test/schema.test.ts` (lectures `any` du schéma dans T6) a été corrigée avant le gel (lecture typée).

## Tueurs (forme fermée, au gel)

| # | Test | Tueur | Tiré par `red-proof` |
|---|---|---|---|
| T1 | `verdict_1_1_0_region_null_iff_qhat_null_and_abstains` | `packages/contracts/src/closed-check.ts:145 SDL "if ((region === null) !== (qhat === null)) fail(\"region\", \"qhat\");" -> ""` | tué |
| T2 | `verdict_1_1_0_calib_reason_abstains` | `closed-check.ts:147 SDL "if (reason.startsWith(\"calib_\") && abstain !== true) fail(\"reason\", \"abstain\");" -> ""` | tué |
| T3 | `verdict_1_1_0_scale_iff_scale_unit` | `closed-check.ts:148 SDL "if ((scale !== null) !== (unit === \"scale\")) fail(\"scale\", \"qhat_unit\");" -> ""` | tué |
| T4 | `verdict_1_1_0_cell_key_couplings` | `closed-check.ts:150 SDL "if ((cellKey === null) !== (tableSha === null)) fail(\"cell_key\", \"policy_table_sha256\");" -> ""` | tué |
| T5 | `verdict_1_1_0_scores_digest_matches_scores` | `closed-check.ts:151 CONST "scoresSha256(scores as number[])" -> "scoresSha256([...(scores as number[])].sort((a, b) => a - b))"` | tué |
| T6 | `verdict_and_decision_schemas_are_1_1_0` | `schemas/gate-decision.schema.json:16 SDL "    \"request_sha256\"," -> ""` | tué |
| T7 | `l3_calib_and_regionless_reasons_abstain_with_the_verdict_reason` | `packages/hikae/src/l3-gate.ts:94 SDL` de la ligne de l'étape 4 (le mutant rend `defer set_too_large`) | tué |
| T8 | `no_region_verdict_has_null_region_and_qhat` | `packages/hikae/src/verdict.ts:71 CONST "region: null," -> "region: { kind: \"set\", labels: [], label_schema: \"up|down\" },"` | tué |
| T9 | `verdict_scores_sha256_is_over_the_declared_order` (remplace `calib_digest_matches_contracts`) | `verdict.ts:57 CONST "scoresSha256(params.scores)" -> "scoresSha256([...params.scores].sort((a, b) => a - b))"` | tué |
| T10 | `calib_digest_provenance_keeps_the_c5_vectors` (remplace `calib_digest_provenance_equals_the_contract_function`) | `scripts/lib/calib-digest-provenance.mjs:16 CONST "s === 0 ? 0 : s" -> "s"` (tueur de C1, gardé) | tué |

T6 lit aussi la constante `SCHEMA_VERSION` par l'espace de noms et exige que la `const` des deux schémas l'égale et que le motif de `prediction` l'admette (parité de Q-3a-4). T10 épingle `de78a2a7…73b7` (sha256 des 27 empreintes jointes par `\n`, calculé à `5a491fa6` par `calibDigest` du contrat) et vérifie que le paquet n'exporte plus `calibDigest`.

**Tueurs à la main, au gel** (chaque mutant seul, test rejoué seul, fichier restauré, sha256 vérifié avant et après) : tous **tués**.
- Ré-ancrés dans le gel : `l3-gate.ts:166 CONST "Number.isFinite(v)"` (`nan_and_infinity_never_commit`, refusé « vert à la base » par `red-proof`, seule sa ligne de tueur change) ; `l3-gate.ts:130 ROR "<" -> "<="` (`oracle_l3_interval_path_reason_order_exhaustive`, adresse inchangée) ; `interval-conformer.ts:87` et `:57` (`oracle_interval_width_is_two_qhat_for_every_yhat`, `oracle_interval_marginal_coverage_seeded_exchangeable`) ; `l3-gate.ts:94 CONST "input.nCalib < input.nMin" -> "false"` (`oracle_l3_set_path_reason_order_exhaustive`, écart 4).
- Mutants supplémentaires des tests du lot : `closed-check.ts:146` sans `abstain !== true ||` (T1) ; `closed-check.ts:149` vidée (T4, `policy_row_sha256` sans `cell_key`) ; `l3-gate.ts:94` raison forcée à `under_calib` (T7) ; `request_sha256: input.requestSha256` retiré de `gate()` (T7) ; `SCHEMA_VERSION = "1.0.0"` (T6).
- Tests existants sans tueur neuf : `enums.test.ts` (`region_degenerate` retiré de `enums.ts` seul ⇒ `reason enum` rouge) ; `fixtures_hash_stable` (ancien manifeste S2 contre le nouveau code ⇒ rouge) ; `calib-digest-vectors` (tueur `-0` ⇒ « negative zero » rouge ; tri retiré de l'outil ⇒ « order-independent » rouge).
- **Mutant D9-ter** : `title` de `coverage-verdict.schema.json` changé, ou une espace ajoutée à `closed-check.ts`, sans ré-épingler ⇒ `contracts_frozen` rouge ; `calib-digest.ts` remis sans entrée ⇒ rouge « file added or removed in the frozen zone ».
- Non rejouable à ce lot : le tueur ré-ancré de `apps/harness/test/served-replay-cm3.test.ts` (`l3-gate.ts:90 SDL` de la garde E-8 ; ancré, 0 dérivé) ; le harnais ne se charge pas avant 3c-3b.

## red-proof

`node scripts/red-proof.mjs --base 5a491fa6 --gel 64e75e66 --repo /home/user/monark-governance-c2a --draw 10 --seed 37` : sortie 1 (REFUSED, attendu : la porte est le `red-proof` de la PR entière au gel de 3c-3c, Q-M2) ; **24 jugés, 66 inchangés** ; `RED-PROOF.json` sha256 `f0a4ef11…995d` (dépend des chemins).
- **F2P, 10** : T1 à T10 ; **10 tueurs tirés, 10 tués**.
- **Refusés, 14, attendus** : `nan_and_infinity_never_commit` (vert à la base, tueur ré-ancré, tué à la main) ; 5 tests dont le corps ne reçoit que `cell` ou `requestSha256` (`interval_conformer_coverage`, `interval_gate_commit_defer_abstain`, trois `interval_nondegenerate_*`), sans tueur déclaré ; les 8 tests de `test/calib-digest-vectors.test.ts` (déplacés, verts à la base, sans tueur ; deux mutants de l'outil tués à la main).

## Ancres

- `verifie-ancres.mjs . --touched 5a491fa6 HEAD` : **32 tueurs, 32 ancrés, 0 dérivé, 0 perdu**.
- Arbre entier : 930 tueurs, 920 ancrés, 0 dérivé, 10 perdus ; les **mêmes 10** à `5a491fa6` (921 tueurs, 911 ancrés : `packages/hikae/test/l1.test.ts:16`, six de `oracle-l1-split.test.ts`, `test/dojo-render.test.ts:326`, deux de `test/oracle-run.test.ts`), aucun du lot.

## Contrôles

- `contracts_frozen` vert (ré-épinglage dans le commit du gel) ; `gate:vocab` OK (345 fichiers) ; `lang:gate` OK ; `export:check` OK (chemins et langue).
- `tsc`, `eslint .`, `lint:ratchet` : rouges de la seule famille du harnais (ci-dessus).
- `npm test` : section « Liste rouge fermée ».

## R-25

`r25()` de `scripts/oracle/r25.mjs` contre `5a491fa6` : **STAT 510** (+345/−165) ≤ 547 ; CONTENT_STAT 0. Code 268 (schémas 45, `packages/contracts/src/` 92 dont `calib-digest.ts` −30, `packages/hikae/src/` 127, scripts 4), tests et épingles 242 (manifeste gelé 15, manifeste S2 2, tests 225).
- G0 du lot : ~430 ; écart +80 : `verdict.ts` (69, en-tête et `underCalibVerdict` réécrits), tests des couplages (49) et du moteur (`contracts-integration` 44, `l3` 21), `GateInput.requestSha256` (écart 1).
- **C2 réestimée** : 510 + ~515 (3c-3b) + ~300 (3c-3c) − 45 (corps 400 avec `code`, coupe vers C') − 15 (`apps/harness/README.md`, `fixtures/PROVENANCE-*.md` à T0) ≈ **1 265**, au-dessus de 1 205 de ~60 (Q-3a-8).

## Écarts au G0 du lot

1. **`GateInput.requestSha256`** (non prévu au G0) : `GateDecision.request_sha256` est requis en 1.1.0, et `gate()` de `packages/hikae` n'a pas l'enveloppe ; le champ entre dans `GateInput` (non gelé) et `gate()` le recopie. Le harnais le calcule en 3c-3b (`requestSha256` de l'enveloppe reçue). Effet nul sur les 9 `fixtures/*.gate-decision.json` (générateur vert).
2. **`underCalibVerdict` perd `labelSchema`** : sans ensemble vide, le nom du schéma d'étiquettes n'a plus d'objet. Les 7 appels du harnais perdent donc `labelSchema:` en plus de gagner `cell` (3c-3b) ; le commentaire de `NUMERIC_LABEL_SCHEMA` (`packages/hikae/src/region.ts:27-34`) est à reprendre avec l'inversion de `numeric_under_calib_region_is_not_directional` (3c-3b).
3. **Liste close plus large que les noms du G0**, dans les familles décidées (Q-3a-1) : sentinelle (7 fichiers, import transitif du harnais), `cra-b`, `skills`, `probe-narabi`, `site-build-fleet`, `harness-deploy-config` (chargement) ; lecteurs du format du site `site-docs` (gloses des 5 raisons) en plus de `ci-gates` et `sas-audit` ; **tous** les tests d'`atelier` (fixtures racine 1.0.0), pas seulement l'état S2 ; test 42 (par `tsc`).
4. **Tueur O-7 changé d'opérateur** : `oracle_l3_set_path_reason_order_exhaustive` portait `l3-gate.ts:92 COR "||" -> "&&"` ; la ligne de l'étape 4 porte deux `||`, le tueur n'y est plus unique. Remplacé par `l3-gate.ts:94 CONST "input.nCalib < input.nMin" -> "false"`, tué à la main.
5. **R-25** : 510 au lieu de ~430 (section R-25).

## Préconditions de fusion (C2)

- **Ligne d'ADR-M004 D7 de MONARK** ajoutant `scripts/lib/calib-digest-provenance.mjs` à `WHITELIST_FILES` : **absente de la base à `5a491fa6`**. `scripts/record-usde-calib.mjs` (exporté) l'importe depuis le gel ; `scripts/export-public.mjs` non touché (Q-1).
- Contrôle par diff de MONARK sur l'amendement daté d'ADR-U4b écrit dans le gel (Q-2, « même commit »).

## Questions (pour MONARK)

- **Q-3a-8 (R-25 de C2).** 3c-3a mesure 510 ; C2 se réestime à ~1 265 avec les deux coupes déjà prises (Q-3a-5), soit ~60 au-dessus de 1 205. Une troisième coupe nommée est nécessaire avant le code de 3c-3b. Candidats sans octet servi neuf à ce stade, à confirmer au G0 court de 3c-3b sur la mesure : le test de composition préfixe + suffixe de Z-3 (Q-C3 condition 5) et la liste close de l'écart liq vers C' (C' ferme S-8) ; ou les vecteurs I-JSON de Q-C2 et leur conversion vers C' (changement servi 200 → 400 déplacé de C2 à C'). Défaut : aucun, la cellule tranche.
- **Q-3a-9 (ADR-U4b).** L'amendement daté qui re-gèle `record-u4b-calib.mjs` est écrit par RECHERCHES dans le commit du gel, pour tenir « même commit » de Q-2. Le garder tel quel au contrôle par diff, ou le réécrire ? Défaut : garder.

- **Q-3a-10 (Dojo, hors lot).** `dojo_history_collect_to_verify_end_to_end` rougit dans les deux passages complets de cette machine et passe seul (2/2) ; le lot ne touche ni `apps/dojo` ni ce qu'il importe. Non rejoué à la base dans un passage complet (disque partagé à 1,2 Go). Défaut : flottement de charge sans #142, à regarder à l'oracle Windows de la tête de C2.

## Notes pour 3c-3b

- `apps/harness/src/` : `calibration.ts:16`, `tools/calibrate.ts:27` vers `scoresSha256` ou l'outil de provenance (le harnais se recharge) ; `cell` sur chaque `buildVerdict`, `underCalibVerdict`, `conformInterval` ; `labelSchema` retiré (écart 2) ; `requestSha256` sur chaque `GateInput` (écart 1) ; `gate.ts:62` lit `SCHEMA_VERSION` de `@monark/contracts` (le tueur `CONST "1.1.0" -> "1.0.0"` passe sur `enums.ts`).
- L'étape 4 fait abstenir tout verdict à raison sans région, avec cette raison : un verdict servi aujourd'hui avec une région et `non_evaluable` ou `upstream_timeout` comme raison changerait de raison de décision ; à vérifier par la projection de C1.
- `u4b_committed_registry_equals_generator_output` et le test du générateur gelé rejouent le ré-épinglage de `GENERATOR_SHA256_LF` dès que le harnais se charge.
- Le tueur ré-ancré de `served-replay-cm3.test.ts` (`l3-gate.ts:90`) est à tirer à la main.
- Parité `KATA_REASONS` ⊆ `COVERAGE_REASONS` (Q-3a-2) ; `lint:ratchet` revient à 69 quand le harnais se type.

## Notes pour 3c-3c

- Site : gloses et comptes des 5 raisons (`site-docs`, `ci-gates` l.853-855 et indices de la simulation, `sas-audit`).
- `atelier` : régénération des 9 décisions (générateur de C1) et `regionText` sur `region: null`.
- `fixtures-root`, `narabi-live:540-547`, `site-ukemi` : `scoresSha256` ou l'outil de provenance à la place de `calibDigest` du paquet.
- Test 42 revient au vert avec `tsc` ; `export:check` du miroir avec la ligne d'ADR-M004 D7 (précondition).
