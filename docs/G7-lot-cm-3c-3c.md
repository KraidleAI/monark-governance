# G7 du lot CM-3c-3c (contrat 1.1.0, bloc C, second et dernier lot de la PR C2b) : surfaces, épingles, instantanés

- **Plan** : `docs/G0-lot-cm-3c-3c.md`, sous `docs/G0-bloc-c-cm-3c-2.md` (section 3.4, P-4 à P-11) et `docs/G7-lot-cm-3c-3b2.md` (37 rouges par nom).
- **Bases** : partie de `662618d5` (tête de 3c-3b2) ; `base/c2-integration` (`689daea1`, #150) fusionnée par `c9a9704e` (arbre inchangé). **Base de mesure du lot : `662618d5`** ; de C2b : `ab732540`.
- **Commits** (branche `recherches/cm-3c-3c`, aucune PR) :
  - `c9a9704e` fusion de la base ;
  - `3cf57d6e` G0 ;
  - `f87a2f30` tests (rouges avant le gel) ;
  - **`3ca4fe7b` gel** (sources, données, traces, instantanés) ;
  - `47fccfed` et `aa6e44d9` : lignes de tueurs seules (ré-ancrage, voir « Tueurs ») ;
  - ce commit (G7).
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé.

## Ce que le lot écrit

- **Neuf décisions racine en 1.1.0** : `scripts/gen-gate-decision-fixtures.mjs` écrit des verdicts 1.1.0 (`region: null` et `qhat: null` pour les deux états sans région, `qhat_unit` `score`, `scale` nul, `scores_sha256`, champs de case nuls) et des décisions avec `request_sha256` (empreinte de l'enveloppe `{prediction, params}` déclarée dans le générateur). Fichiers et `fixtures/manifest.json` réécrits par `--write` ; épingle du manifeste dans `fixtures/PROVENANCE-fixtures-root.md` (D9 sexies, une ligne). Répartition 3/2/3/1 gardée.
- **Surfaces** :
  - `scripts/verify-harness.mjs` : `CA_SCHEMA_VERSION` `"1.1.0"` ; contrôle liq sur `scores_sha256` de s0 (`a9277222…`, épingle `UKEMI_LIQ_SCORES_SHA256_PINNED`) ; boucle BYO sur `scores_sha256` ; détail `scores_sha256=… calibrate_scores_sha256=…`.
  - `scripts/sync-ukemi-served.mjs` : `verdictFactsOf` lit `scores_sha256` et le compare à `scoresSha256` des scores engagés de la strate (N-1). La clé du site reste `calibration_digest`.
  - `scripts/sync-harness-served.d.mts` : les trois déclarations de Q-SP1-7 (`inProcessPending`, `pendingDiff`, `markPendingSince`) ; le test les lit typées.
  - `apps/site/lib/harness-served-load.ts` : `ByoLoop.scores_sha256 = { calibrate, verdict }` ; la boucle se ferme sur l'égalité de `scores_sha256`, `alpha` et `qhat` ; `KEY` admet les chiffres après la première lettre (`scores_sha256` est une clé servie). Nombre de lignes gardé.
  - `apps/site/components/sas/sas-audit.ts` : indices `SCORES_DIGEST` 12 et `PRODUCED_AT` 16 du `required[]` 1.1.0.
  - Les cinq raisons neuves reçoivent une glose et une chambre (`lib/how-copy.ts`, `lib/docs-gate.ts`, `components/sas/sas-model.ts`) : sans elles, les pages rendaient une carte vide (la grille lit l'énumération gelée). **Écart 2.**
  - Pages qui lisent `ByoLoop` (`/integrators`, `/docs/integrators` et son schéma) : `calib_digest`/`set_digest` → `scores_sha256`. **Écart 1.**
- **Traces réenregistrées** par leurs générateurs (prédictions en 1.1.0) : BYO `5c9b03e6…` (10 061 octets), H5 `8b05b4d4…` (22 472 octets) ; épingles des sondes, de `PINNED`, du manifeste du site, des deux PROVENANCE (ligne d'empreinte seule, leur texte va à T0) et de `skills/monark/DEMO.md:88` (citation tronquée exigée par `demo_md_cites_the_current_byo_trace_digest`).
- **Instantanés en attente** : `node scripts/sync-harness-served.mjs --pending` (`harness-pending.json` `e8bf9775…`, 126 lignes ; `pending_since` `2026-10-05` dans `harness-served.json`, `30afbec2…`), puis, après la bascule du registre et le renommage B-17, `node scripts/sync-ukemi-served.mjs --pending` (`ukemi-pending.json` `220c14c9…`, `calibration_digest` = `a9277222…` ; `pending_since` dans `ukemi-served.json`, `8a94c949…`). Entrée `harness-pending.json` posée après `harness-served.json` dans le manifeste du site (forme canonique, N-3). Seule différence des formes : le contrat `calibrate` (`scores_sha256` à la place de `set_digest`). Les fichiers servis et le CA restent 1.0.0 jusqu'à T0, hors la ligne `pending_since`.
- **m-5 rejoué** : `scanText` sur `ukemi-pending.json` et `harness-pending.json`, entiers et `$comment` seul, motifs GLOBAL plus site, puis GLOBAL plus harnais : **0 hit** dans les huit cas.
- **Q-F2** : le refus d'une prédiction 1.0.0 dit `unsupported prediction.schema_version '1.0.0': the harness speaks '1.1.0'; specification: https://github.com/KraidleAI/monark-kata-spec` (une ligne, `gate.ts:865` ; test neuf sur l'erreur et sur le corps 400). **La ligne datée de MONARK qui fixe le texte exact n'est pas sur la base** (seule la ligne (7), le go) : **précondition de fusion de C2b**.
- **Épingle d'octets 1.1.0** : `pending_bodies_are_pinned_byte_for_byte` épingle les sha256 des corps en processus aux requêtes du CA (`/openapi.json` = `openapi_sha256` de l'instantané, `/gate`, `/gate liquidation-eligible-coverage`, `/calibrate`), sous les clés de `bodies_sha256` du servi : ce que le CA enregistrera à T0. Message de la cellule reçu en cours de lot : le pli de 3c-3b2 ajoute des épingles d'octets du rejeu (111 appels) et de la bande USDe ; cette épingle-ci reste (contrôle de l'instantané). Si ce pli est fusionné ici, aucune décision servie de ses 111 appels ne change par ce lot (le seul octet servi changé est le message du refus 1.0.0, hors rejeu).
- **Test 42 (m-7)** : la ligne D7 duodecies (`0542cfca`) et les deux lignes d'export sont sur la base ; `tsc` est propre ; test 42 vert seul (4/4) et `export:check` vert.
- **Q-M14** : `frozen_contract_fields_stay_dynamic` passe avec les comptes 17, 9 et 5 et **aucune entrée neuve** de la liste fermée : aucune des clés neuves n'est écrite entre guillemets dans `apps/site`. Rien à proposer à MONARK.

## Liste des changements servis de ce lot (pour MONARK)

1. Message du 400 `schema_version_unsupported` (Q-F2), ci-dessus. Aucun autre octet servi ne change : les décisions, `openapi.json` et les descriptions sont celles de 3c-3b2.

## Tueurs (forme fermée)

| Test | Tueur | Tiré |
|---|---|---|
| `schema_version_refusal_names_the_spoken_version_and_the_spec_repository` (neuf) | `apps/harness/src/tools/gate.ts:865 CONST "; specification: https://github.com/KraidleAI/monark-kata-spec" -> ""` | tué |
| `pending_bodies_are_pinned_byte_for_byte` (neuf) | `apps/harness/src/tools/gate.ts:732 CONST "scores_sha256=${digest}`" -> "scores_sha256=${digest} `"` | tué |
| `byo_loop_closes_on_scores_sha256_alpha_and_qhat` (neuf) | `apps/site/lib/harness-served-load.ts:312 CONST " && cal.sc.qhat === verdict.qhat" -> ""` | tué (à la main) |
| `verify_harness_ca_schema_version_equals_the_harness_schema_version` (inversé) | `scripts/verify-harness.mjs:41 CONST "1.1.0" -> "1.0.0"` | tué (à la main) |
| `verify_harness_liq_literals_equal_served_constants` | `scripts/verify-harness.mjs:94 CONST "a927722276941a4f" -> "e7e673664c03e3c5"` | tué |
| `sas_audit_labels_from_required` | `apps/site/components/sas/sas-audit.ts:14 CONST "SCORES_DIGEST: 12" -> "SCORES_DIGEST: 10"` | tué |
| `demo_md_cites_the_current_byo_trace_digest` (ré-épinglé) | `skills/monark/DEMO.md:88 CONST "5c9b03e6…" -> "daf8d3ea…"` | tué (à la main) |
| `gate_decision_fixtures_generator_reproduces_the_committed_files` (ré-ancré) | `scripts/gen-gate-decision-fixtures.mjs:42 CONST "\"down\", 0.06" -> "\"down\", 0.07"` | tué (à la main) |
| `narabi_gate_facts_read_from_committed_sources` (ré-visé) | `apps/site/lib/harness-served-load.ts:192 CONST "!existsSync(…)" -> "true"` | tué |

- Le tueur ancien de `narabi_gate_facts_read_from_committed_sources` (`-> "false"`) est **mort-né** depuis que l'instantané existe (le mutant ne change plus rien) : premier red-proof ; ré-visé sur `"true"` (`aa6e44d9`).
- Quatre tueurs de `site-ukemi` ré-ancrés d'une ligne (`sync-ukemi-served.mjs:216`, `:225`, `:234`, `:239`) : une ligne d'import ajoutée au gel (`47fccfed`).

## red-proof

`node scripts/red-proof.mjs --base 662618d5 --gel aa6e44d9 --repo /home/user/monark-governance-c2d --draw 10 --seed 37` : sortie 1 (REFUSED, attendu) ; **20 jugés, 113 inchangés ; 7 F2P ; 7 tueurs tirés, 7 tués** ; `RED-PROOF.json` sha256 `d08c5142eb81…` (dépend des chemins). Le gel nommé est la tête des tests (`aa6e44d9`) : les deux commits après `3ca4fe7b` ne touchent que des lignes de tueurs.
- **F2P (7)** : les deux tests neufs Q-F2 et épingle d'octets, `probe_harness_records_real_decision`, `narabi_gate_facts_read_from_committed_sources`, `sas_audit_labels_from_required`, `site_ukemi_course_served_stratum_status_bound_to_served_verdict`, `verify_harness_liq_literals_equal_served_constants`.
- **Refusés (13), attendus** : 9 « no killer declared » (tests convertis seulement : `probe_byo_demo_loop_closes`, trois de `ci-gates`, `fixtures_root_valid`, `sas_audit_reasons_from_frozen_enum`, deux de `site-ukemi`, `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`) ; 3 « red at base without an assertion failure » (à la base, le chargeur lève une `Error` de forme sur la trace : `byo_trace_rendered_equals_trace`, `byo_loop_closes_on_scores_sha256_alpha_and_qhat`, `harness_pending_sync_writes_in_process_shapes` ; le troisième tueur du tableau est tiré à la main) ; 1 « green at base » (`harness_pending_promotion_compares_the_fixed_fields`, dont seul l'aide `nextShapes` change).

## Ancres

- `verifie-ancres.mjs . --touched 662618d5 HEAD` : **37 tueurs, 37 ancrés, 0 dérivé, 0 perdu**.
- Arbre entier : 954 tueurs, 944 ancrés, 0 dérivé, **10 perdus : les 10 de la base** (comme au G7 de 3c-3b2).

## Les 37 rouges, mesurés à la tête

Passage complet `npm test` (voir « Contrôles ») : 36 des 37 de la liste du G7 de 3c-3b2 sont **verts**, par nom ; le 37e, test 42, n'est plus rouge pour `tsc` (0 erreur) : il est vert seul et rouge au passage complet par troncature du résumé du miroir (voir « Contrôles ») ; 0 rouge hors liste. Ensemble mesuré sur les onze fichiers de la liste au gel : 138 tests, 0 échec.

## Contrôles

Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR `/tmp/c3c-1`.

- **`npm test`** à `aa6e44d9` : **2 332 tests, 2 309 verts, 1 rouge, 22 sautés, 0 annulé**. Le rouge est le test 42, « exported CI ran an implausibly small suite » : le `npm run ci` du miroir sort 0, mais son résumé TAP est tronqué (la sortie s'arrête au milieu de la liste des tests), donc le compte n'est pas lu. Même résultat au premier passage complet (avant les deux commits de tueurs : 2 337 tests, 2 314 verts, 1 rouge, le même). Le test 42 lancé seul, à la même tête : **4/4 verts**. Phénomène déjà noté au G7 d'UKEMI-PENDING-SNAPSHOT-1 (passage chargé) ; ici, une G2 de 3c-3b2 tournait sur la même machine. Le CI le dira ; si `g3-verification` le rougit, c'est un item d'outillage (troncature de la sortie du `npm run ci` imbriqué), pas une régression du lot.
- Hors test 42 : **0 rouge** ; les 37 de la liste sont verts.
- **`tsc --noEmit`** : **0 erreur**.
- **`eslint .`** : 0 erreur ; **`lint:ratchet` 69/69**.
- **`gate:vocab`** OK (346 fichiers) ; **`lang:gate`** OK ; **`export:check`** OK.
- **`npm run build -w @monark/site`** : **vert** (prérendu complet, `/integrators` et `/console` compris) : `g3-site` est vert à la tête.
- **Test 42** seul : 4/4 verts (export, `npm ci`, `npm run ci` du miroir).

## R-25

`r25()` de `scripts/oracle/r25.mjs` à la tête :
- **lot contre `662618d5`** : **STAT 546** (+399 / −147) ≤ 547 ; CONTENT_STAT 19 (pages et gloses de `/docs`). Données 157 (`harness-pending.json` 126, `ukemi-pending.json` 19, manifeste 10, deux `pending_since`), tests 266 (`harness-served` 90, `byo-demo-probe` 37, `site-ukemi` 27), sources 123.
- **C2b (3c-3b2 + 3c-3c) contre `ab732540`** : **STAT 971** ≤ 1 205.
- **Intégration (C2a + C2b) contre `418a421f`** : **2 001** (+1 460 / −541). R25-INTEGRATION-RULE-1 est désormais précondition de fusion de la PR d'intégration (message de la cellule) ; aucun test n'est coupé.

## Écarts au G0 du lot

1. **Pages qui lisent `ByoLoop`** (`/integrators`, `/docs/integrators`, `ByoLoopSchema`) : le nom des champs suit la trace 1.1.0 (`scores_sha256`), sans quoi le build du site rougit. Les pages gardent le servi pour tout fait servi (Q-SP1-2) ; elles rendent la trace enregistrée en processus, comme avant. La garde d'envoi du site (aucun envoi tant que `harness-pending.json` existe) couvre la fenêtre jusqu'à T0.
2. **Gloses des cinq raisons neuves** (site, texte anglais neuf, chiffres et tirets exclus) : exigées par trois tests et par la grille rendue depuis l'énumération gelée. Texte à relire par MONARK (Q-3c-1).
3. **`DEMO.md` et deux PROVENANCE** : seules les lignes d'empreinte bougent (tests de citation) ; leur texte, qui nomme encore `calib_digest` et `set_digest`, va à T0 avec le README du harnais.
4. **Épingle d'octets** gardée malgré le pli de 3c-3b2 (contrôle de l'instantané, 25 lignes).
5. **Métadonnées des traces** : le champ `generated_by` des deux traces, écrit par des lots antérieurs, est réécrit tel quel par les générateurs ; ce lot n'y ajoute rien.

## Questions (pour MONARK)

- **Q-3c-1** (écart 2) : accepter les cinq gloses (`how-copy.ts`, `docs-gate.ts`) et la chambre `calibrate` des cinq raisons (`sas-model.ts`) ? Défaut : oui, texte relu à la fusion.
- **Q-3c-2** (Q-F2) : la ligne datée qui fixe le texte du refus 1.0.0 ; proposition : le texte ci-dessus. Précondition de fusion de C2b.
- **Q-3c-3** (R-25) : le lot est à 546 pour 547 ; tout pli de la G2 qui ajoute des lignes hors docs dépasse la borne du lot. Défaut : un pli se mesure contre la tête de 3c-3b2 repliée, et R25-INTEGRATION-RULE-1 couvre l'intégration.
