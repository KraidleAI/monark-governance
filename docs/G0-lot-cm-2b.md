# G0 du lot CM-2b : retrait de btc-dir (S-12), table F-7 pour USDe (S-1), écart d'un demi-ulp écrit (E-7)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, amendement daté « (nuit, 2) : plan de CM-2 » : CM-2b = S-12/B-5, S-1/B-2 (resserré), E-7/B-7. Aucune autre ligne B.
- **Base** : `f3b330c` (`recherches/cm-2a`, PR #105 non fusionnée ; CM-2b s'empile dessus). Auteur : RECHERCHES.

## Règles

### B-5 / S-12 : btc-dir retirée

1. `btc-dir-15m` sans BYO rend 400 `task_class_retired`, message `task_class 'btc-dir-15m' is retired (ADR 0005, decided 2026-09-30): it is no longer served; the name stays reserved against BYO`. Le refus a lieu à la répartition, après les gardes de paramètres, de `produced_at`, du BYO et d'`attested` (une requête invalide sur deux points garde le premier refus ; 400 reste 400).
2. Retirés de `gate.ts` : `btcDirVerdict`, ses branches de `deriveEvaluable` et de `honestyText`, la phrase « synthetic … plumbing fixture » de `describeGate`, `btc-dir-15m` de la liste `known:`.
3. Gardés : `TASK_BTC_DIR` dans `CLASS_LOCKED` et dans la garde BYO exacte (message inchangé octet pour octet, code `byo_overrides_committed`) ; `BTC_DIR_CALIB` et son empreinte épinglée dans `calibration.ts` ; la ligne btc-dir d'`attestation-binding.ts`.
4. La description dit : « The class 'btc-dir-15m' is retired and answers a named refusal. »

### B-2 / S-1 : F-7

1. Module de données `apps/harness/src/class-policy.ts` (pur : ni horloge, ni E/S ; à `src/`, pas sous `src/tools/`) : `LIQ_POLICY` (classe entière, α 0,01, nMin 100) et `USDE_POLICY` (clé commise seule, α 0,1, nMin 50), `CLASS_POLICY`, `policyFor`. Le nom évite `class-policy-v2-guard.ts`, réservé à MONARK (§4).
2. Une seule fonction `assertPolicy` dans `gate.ts`, égalité stricte, sert liq et USDe. Liq : messages identiques octet pour octet, même ordre (domaine de yhat, puis α, puis nMin). USDe, clé commise : `task_class 'stable-run-velocity-24h' with predictor_id '<clé>' requires params.alpha = 0.1 (server-imposed for the committed key), got <v>` (code `policy_alpha_mismatch`), de même pour nMin (`policy_nmin_mismatch`), avant `splitQuantile`.
3. Inchangés : les autres clés USDe (`under_calib` avec les valeurs de l'appelant), tau et `tauInterval` (appelant), cascade, BYO.
4. La description déclare les valeurs imposées à USDe (« on that key it requires alpha = 0.1, nMin = 50 »), comme elle le fait déjà pour liq.

### B-7 / E-7 : texte USDe

`STABLE_RUN_COMMITTED_CORE` (donc la description et le texte d'honnêteté de la clé commise) gagne : « each band edge is yhat - qhat or yhat + qhat rounded to the nearest double, so it can differ from the exact edge by up to half a unit in the last place of that edge; the band is not widened for it ». La bande ne change pas. Liq : rien (DEM-4, 0 ulp).

## Différences servies (liste fermée de CM-2b)

- **B-5** : `btc-dir-15m` sans BYO rend 400 `task_class_retired` (rendait `commit` ou `defer`). Le message de classe inconnue perd `btc-dir-15m` de `known:`.
- **B-2** : la clé USDe commise avec α ≠ 0,1 ou nMin ≠ 50 rend 400 nommé (rendait une décision ; α 0,5 rendait `commit`).
- **B-5, B-2, B-7** : la description du service change : empreinte sha256 `5574450432b7252bb82a31e51eb01b707d286fc9bf4af425a2bf5bce787aed77` → `cb4029d2e1bf183c69e4db97d9d9f112bdd030b44edcc4e1afc4f513d9e6d532` ; `JSON.stringify(buildOpenApi())` `9e3176eae8893f05e7168f3c1e1b9e4dd4a1170a8a8a8f3cd933c94ff657a2ff` → `fc746a604dc181e2e9b6dbbdbd728be5c16306a8487895829e474f753e1e33fb`. Le texte d'honnêteté de la clé USDe commise gagne la phrase de B-7.
- **Conséquence de B-5, acceptée par le fondateur le 2026-10-03** : la seule classe dont la table d'attestation a un sujet est btc-dir. Un `attested` concordant n'atteint donc plus aucune décision servie : la jointure `attest` → `gate` (ADR-M017, étape 7 de la trace h5) n'est plus atteignable au servi ; elle rend `task_class_retired`. Un `attested` discordant sur btc-dir rend toujours `attested_inconsistent` (garde avant la répartition).
- Rejeu : 12 décisions USDe (clé commise, α 0,1, nMin 50) identiques octet pour octet à la base (sha256 `06caef6b…`, mesuré à `f3b330c` et au gel).

## Tests

Dix-huit tests (quatre neufs, quatorze modifiés) sont F2P contre `f3b330c` (rouges par assertion, verts au gel), un tueur chacun ; les épingles (ce qui ne change pas) sont pliées dedans. Les autres changements de tests sont hors des corps (constantes de tête) ou des lignes tueuses ré-ancrées.

Neuf : `apps/harness/test/gate-cm2b.test.ts`
- R-1 `btc_dir_is_retired_with_a_named_400` : refus direct, HTTP (corps exact) et MCP (texte, `_meta`) ; garde BYO exacte inchangée octet pour octet ; imitation refusée ; `known:` ; description ;
- R-2 `usde_committed_key_imposes_alpha_and_nmin` : messages et codes USDe, égalité stricte (α + 1 ulp refusé), HTTP, α 0,1 et nMin 50 décident, tau et `tauInterval` de l'appelant, autre clé inchangée, message liq inchangé, lignes F-7 ;
- R-3 `usde_band_edges_within_half_ulp_stated_and_band_unchanged` : la phrase de B-7 ; pour 12 valeurs de yhat, chaque bord servi est à au plus un demi-ulp (du bord) du bord exact calculé en rationnel (BigInt) ; rejeu épinglé ;
- R-4 `attested_concordant_meets_the_btc_dir_retirement` : déplacé de `gate.test.ts` (`gate_attested_concordant_files_residual`, voir plus bas).

Attentes modifiées (corps changés, chacun rendu F2P par l'assertion du retrait ou de F-7) :
- `gate.test.ts` : `gate_tool_emits_frozen_gate_decision`, `gate_tool_never_calls_tool`, `gate_dispatches_on_task_class`, `gate_committed_classes_unchanged_without_calibration` : le chemin commis servi passe de btc-dir à la clé USDe (`covered`, empreinte USDe, n 613) ; btc-dir rend `task_class_retired`. `calibration_declared_synthetic` : la description ne sert plus le « plumbing fixture » et nomme le retrait (la provenance synthétique et l'empreinte restent). `numeric_under_calib_region_is_not_directional` : le cas « USDe, nMin > n » n'est plus servi (nMin imposé : 400 `policy_nmin_mismatch`) ; le témoin directionnel lit le défaut de `underCalibVerdict` directement. `gate_attested_concordant_files_residual` : retiré de `gate.test.ts` et remplacé par R-4 (un `attested` concordant sur btc-dir rend `task_class_retired` par `run()` du registre ; l'épingle du témoin reste ; les assertions du dépôt du résidu sont retirées, chemin non servi). Le nom change parce que le test ne prouve plus le dépôt du résidu ; il restait en fin de `gate.test.ts`, où `--test-force-exit` tronque parfois la sortie TAP des derniers tests (mesuré : 29 ou 32 tests rapportés sur trois exécutions identiques), ce qui faisait refuser `red-proof` par un « missing ».
- `oracle-fixtures.test.ts` : les deux oracles de littérature lisent les points de bascule sur les primitives du moteur (`splitQuantile`, `conformalSet`, `buildIntervalRegion`), et le `runGate` servi refuse les anciennes sondes (`task_class_retired` ; `policy_alpha_mismatch` aux α ≠ 0,1) ; USDe servi à α 0,1 égale le q̂ du moteur. Tueur de btc-dir déplacé sur `l1-split.ts:39`.
- `error-code.test.ts` : E-3 (`btc-dir number yhat` devient `cascade string yhat`, plus `btc-dir retired`) ; E-6 (véhicule USDe, btc-dir en 400). Constante de tête `UNKNOWN_MESSAGE` sans btc-dir (E-4, E-5).
- `gate-produced-at.test.ts` : P-1 et P-2 passent du véhicule btc-dir à la clé USDe ; btc-dir y est affirmé retiré.
- `registry.test.ts` `harness_served_honesty_carriers_pass_vocab` : l'appel btc-dir quitte la liste des porteurs (cinq branches distinctes au lieu de six) et devient une erreur d'outil `task_class_retired`.
- `gate-liq.test.ts` `hdesc_served_gate_description_is_the_committed_clause` : empreinte de la description déplacée (ci-dessus) ; la clause liq est inchangée.
- `http.test.ts` : constante de tête `GATE_BODY` passée à la clé USDe (hors corps).
- Tueurs ré-ancrés (ligne tueuse seulement) : `gate-byo-lookalike`, `gate-byo-tau-cap`, `gate-empty-set`, `error-code`, `gate-produced-at`.

## Rouges liés aux surfaces de MONARK (attendus jusqu'à BTC-DIR-RETIRE-SURFACES-1)

Ces tests de `test/` comparent le harnais en processus à des données commises par MONARK ; ils rougissent par construction tant que MONARK n'a pas appliqué la liste ci-dessous (R-6) : `h5-e2e-probe.test.ts` (`probe_harness_records_real_decision`, `h5_carries_attested`), `harness-served.test.ts` (`harness_served_data_matches_in_process_harness`, `harness_served_sync_liq_row_follows_the_served_state`), `narabi-live.test.ts` (`narabi_gate_facts_read_from_committed_sources`), `site-build-fleet.test.ts` (`registry_notes_track_served_descriptions`), `site-ukemi.test.ts` (`site_ukemi_course_served_stratum_status_bound_to_served_verdict`), `ci-gates.test.ts` (`fleet_register_built_set_is_frozen` : le registre de la flotte nomme `gate_attested_concordant_files_residual` comme test d'intégration de Shōgen ; correction proposée plus bas, statut `built` inchangé), `verify-harness-liq.test.ts` (`verify_harness_ca_passes_on_the_in_process_harness`, `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`).

## BTC-DIR-RETIRE-SURFACES-1 (pour MONARK, diff minimal proposé)

| Fichier:ligne | Changement minimal proposé |
|---|---|
| `scripts/verify-harness.mjs:39-44` | `GATE_BODY` : la clé USDe commise (`stable-run-velocity-24h`, `narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3`, yhat 0.0001, α 0.1, nMin 50, intent 0), comme `apps/harness/test/http.test.ts` ; ajouter un contrôle « btc-dir rend 400 `task_class_retired` » |
| `scripts/sync-harness-served.mjs:30, 51-52, 63, 70` | même `GATE_BODY` ; retirer `BTC_SYNTHETIC` et la ligne `TASK_BTC_DIR` de `BASE_CLASSES` (ou la passer à l'état `retired` avec la phrase servie) ; ajouter les clauses USDe servies neuves (exigences α/nMin, phrase de B-7) si la liste fermée doit les porter |
| `apps/site/data/harness-served.json:91-93` | régénérer par `sync-harness-served` (empreintes `/openapi.json` et description ci-dessus) ; ligne btc-dir retirée ou `retired` |
| `apps/site/components/hikae-panel.tsx:29, 79` | retirer « declared synthetic, a plumbing fixture… » ; dire que la classe de démonstration est retirée |
| `apps/site/lib/fleet.ts:133-140` | Shōgen garde `built` (décision du fondateur, 2026-10-03). `integration_test` : remplacer `gate_attested_concordant_files_residual` (qui n'existe plus) par les tests de la jointure au niveau unitaire qui restent : `gate_attested_is_frozen_attested_price` (`apps/harness/test/schema.test.ts:111`) et `gate_attested_discordant_is_tool_error` (`apps/harness/test/gate.test.ts:731`) ; le commentaire de preuve dit que la jointure est dormante au servi depuis le retrait de btc-dir. Rend vert `fleet_register_built_set_is_frozen` (`test/ci-gates.test.ts`) sans changer le statut |
| `apps/site/lib/fleet.ts:38, 150-165` | `served_by` et la note : retirer `btc-dir-15m committed decision` et la clause de fixture ; le chemin commis servi est USDe |
| `apps/site/lib/harness-served-load.ts:277-298` | l'étape `btc-dir-gate` de la trace n'est plus une décision : lire une étape USDe (ou l'erreur `task_class_retired`) |
| `apps/site/lib/sim.ts:218` | remplacer `btc-dir-15m` par la clé USDe ou une classe BYO |
| `fixtures/h5-e2e-trace.json` et `fixtures/PROVENANCE-h5-e2e-trace.md:62-63, 125` | régénérer la trace : étape 5 sur la clé USDe ; étape 7 (`attested-gate`) : soit retirée, soit gardée et ré-épinglée (elle montre alors le refus `task_class_retired`), avec une note de provenance disant la jointure dormante ; MONARK décide ; nouvelle empreinte dans `test/h5-e2e-probe.test.ts` et la provenance |
| `test/h5-trace-builder.ts:47-53, 222-234, 252, 278` | `BTC_DIR_PREDICTION` → la prédiction USDe ; notes et `honesty` sans « synthetic » |
| `skills/monark/SKILL.md:58-59` | « `btc-dir-15m` est retirée (400 nommé) » au lieu de la classe de démonstration synthétique |
| `apps/harness/README.md` | fait dans ce lot (zone RECHERCHES, décision du 2026-10-03) : ligne btc-dir retirée (400 `task_class_retired`), exigences α 0,1 et nMin 50 de la clé USDe et demi-ulp, `nCalib` sans btc-dir, calibration synthétique gardée et non servie |

## Écarts au dessin

- `honestyText` sans branche btc-dir rend la phrase cascade pour btc-dir ; ce chemin n'est pas atteignable (le retrait précède) ; déclaré.
- La description déclare les valeurs USDe imposées (miroir de liq) ; non demandé explicitement, conséquence de B-2.
- Les oracles de `oracle-fixtures.test.ts` passent du `runGate` servi au moteur (les sondes ne sont plus servies).

## Questions ouvertes

1. Tranchée par le fondateur le 2026-10-03 (amendement daté de l'ADR-CM) : la jointure `attest` → `gate` devient dormante, c'est accepté ; le statut public de Shōgen (`built`) ne change pas ; item ATTEST-KATA-SUBJECT-1 ouvert (ci-dessous).
2. Tranchée : MONARK livre BTC-DIR-RETIRE-SURFACES-1 avec CM-2b. Les dix rouges de `test/` listés plus haut sont attendus jusque-là (surfaces de la zone MONARK).

## Item ouvert

**ATTEST-KATA-SUBJECT-1** : un sujet attesté (Binance) pour les futures classes kata servies, qui rendrait la jointure `attest` → `gate` de nouveau atteignable. Propriétaire : RECHERCHES ; déclencheur : après CM-4 ; aucun travail maintenant. Toute ligne neuve de la table d'attestation est une ligne B neuve au §5 de l'ADR-CM.

## Taille et sortie

Code : `gate.ts`, `class-policy.ts` (neuf) ; documentation : `apps/harness/README.md`. Tests : un fichier neuf, huit modifiés. Une PR, R-25 sous 1 150. Oracle : `tsc`, eslint, `gate:vocab`, `lint:ratchet`, tests du harnais, `npm test` (échecs tolérés : `bell-served.test.ts:153` et les rouges liés aux surfaces de MONARK listés), `red-proof --base f3b330c --gel <sha> --draw 8 --seed 11`.

## Mesures (gel `77e825c`)

R-25 : 13 fichiers, +453/−225, soit 678 lignes (docs exclus). Tests du harnais : 123 → 126. `npm test` : 1 954 tests, 1 921 verts, 22 ignorés, 11 échecs : `bell-served.test.ts:153` (clone superficiel) et les dix rouges liés aux surfaces de MONARK listés plus haut. `red-proof --base f3b330c --gel 77e825c --draw 8 --seed 11` : OK, 18 jugés F2P, 8 tueurs tirés, 8 tués.
