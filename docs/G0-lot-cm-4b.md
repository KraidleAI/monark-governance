# G0 du lot CM-4b (contrat 1.1.0) : chemin kata, contrat de requête kata, recherche de case dans la table de classe, motif réservé B-14

- **Sources** (sha256 des octets LF ; `sha256sum -c` des deux `SHA256SUMS` du dossier r3 : OK) :
  - plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` (`3e0da1a6…653c`) : §2.2 et §2.2.1 (verdict sans ligne), §2.4 (B-14 et son effet sur B-10), §4 (garde de bande), §5.2.1 (registre des classes), **§5.4 (chemin servi, CM-4b, points 1 à 10)**, §7 (lignes B-9 précisée, B-14, B-15), §8.3 (ligne D : « chemin kata (§5.4), B-14, B-15 ; instantané en attente régénéré », ~520 en deux lots), §8.5, §8.6, §9.2 (D fixé avant le G0 de CM-4b), §9.4 (NOTICE-1-1-0 déclenché au G0 de CM-4b ; LATE-CALL-WINDOW-1 avant le G7 de CM-4b) ;
  - `SPEC-1-1-0-brouillon.md` (`975bb40c…`) : §3 (grammaire de `produced_at`), §4 (`alpha`, `nMin`, `tau`), §5, §6, §8, **§9 (classes kata sur le gate)**, §11 (recalcul, verdict sans ligne), §13 (catalogue), §16 ;
  - `AMENDEMENT-ADR-CM-r3.md` (`774a5601…`) : lignes B-9 précisée et B-14 (lot CM-4b), B-4 relu (« la grille des classes kata est fixée … en CM-4b »), « D est fixé … avant le G0 de CM-4b », items NOTICE-1-1-0, SPEC-PUBLISH-PIPELINE-1, LATE-CALL-WINDOW-1 ;
  - décision déléguée `avis/DECISION-PolicyRow-Q1-Q3.md` (`117eb289…`), **Q-3 condition 2** : « Avant T0, au plus tard au G7 de CM-4b, un test exige un lanceur pour chacun des 32 codes » (l'avis précise : sauf `output_invalid`, qui a son chemin 500) ; condition 1 : les 6 codes kata réservés « au bloc D » ;
  - liste r4 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md` (`d85d6504…`, commit `2e61655`) : lignes 6 (« dependence check rejects » dans la liste fermée des raisons, avant F-5a) et 7 (texte servi qui cite les durées d'A-1 : nommer l'alpha) ;
  - A-2 r3 `recherches:decisions/0004-ADR-amendment-A-2-import-guard.md` (`d883725a…`) §5, dernier tueur : « a `calib_*` row defers » ;
  - `KraidleAI/monark-kata-spec` `KATA-SPEC.md` à `ddfee9e` (`b32a4062…`) §1 (t multiple de h), §2, §5 (paniers, seuils en écriture aller-retour la plus courte, clé d'exemple `kata:vote4-v1@<venue>/BTCUSDT/1h/up-b3`) ;
  - addendum D9-ter de l'ADR-M001 (`docs/adr/ADR-M001-phase0-depot-langage-contrats.md:242-256` sur la base) : **deux ré-épinglages seulement, bloc A et bloc C** ;
  - G0 et G7 des blocs précédents, sur la base : `docs/G0-lot-cm-3c-1.md`, `docs/G7-lot-cm-3c-1.md` (bloc A) ; `docs/G0-lot-cm-4a-i.md`, `docs/G7-lot-cm-4a-i.md` (B1) ; `docs/G0-lot-cm-4a-ii.md`, `docs/G7-lot-cm-4a-ii.md`, `docs/G0-lot-cm-4a-ii-b.md`, `docs/G7-lot-cm-4a-ii-b.md` (B2, lots a et b) ; `docs/G0-lot-served-pending-1.md`, `docs/G0-lot-ukemi-pending-1.md` ;
  - messages de MONARK : `2026-10-04-MONARK-vers-RECHERCHES-138-139-fusionnees.md` (`recherches` `b623867` : « #138 … fusion `e6dc5542` sur la base … Tes lots de CM-4b et de CM-4c partent de là » ; colonne : « … c1 de L2 P1, CM-4b, … ») ; `…-138-139.md` (m-1 `calib_parent`, « dependence check rejects », `n_test` à borner au G0 de CM-4c).
- **Le tueur « a `calib_*` row defers »** : aucun message de MONARK ne le place nommément. Sa place vient du G7 du bloc B2 (`docs/G7-lot-cm-4a-ii.md:19` : « Tueurs d'A-2 §5 couverts : tous, sauf … « a `calib_*` row defers » (chemin servi, CM-4b) »), que le contrôle par diff de MONARK sur #138 a tenu (`…-138-139.md` §1). Voir C-4 : dans la séquence retenue, il ne peut pas être servi en CM-4b.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = **`e6dc5542`** (fusion de #138, refetchée : `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`). Elle porte le bloc A (`880654ed`), B1 (`b4e63a55`), SERVED-PENDING-1 (`7a0b1a49`), UKEMI-PENDING-1 (`944053b7`), `tail.ts` (#135, `abe14e6b`) et B2 (#138). Elle **ne porte pas** le bloc C : `SCHEMA_VERSION` vaut encore `"1.0.0"` (`apps/harness/src/tools/gate.ts:62`), `COVERAGE_REASONS` n'a ni `calib_*` ni `out_of_support` ni `region_degenerate` (`packages/contracts/src/enums.ts:7-21`), `CoverageVerdict` n'a ni `cell_key` ni `policy_table_sha256`. Branche `recherches/cm-4b`, arbre `/home/user/monark-governance-c4b`. Auteur : RECHERCHES. Borne R-25 : 547 par lot, 1 205 par PR (`scripts/oracle/r25.mjs`, pathspec de `ci.yml:82`).
- **Statut** : G0 écrit avant tout code. **Le code ne part pas** avant les réponses à C-1 (séquence et périmètre servi) et Z-1 (ordre des blocs) ; les autres questions ont une proposition par défaut.

## Séquence retenue et conséquences (lecture déclarée, à confirmer : C-1, Z-1)

La séquence de la consigne est **A → B1 → B2 → CM-4b → CM-4c → C → D**, et D9-ter n'ouvre le manifeste figé (`test/contracts-frozen.manifest.json` : `schemas/` et `packages/contracts/src/`) qu'aux **blocs A et C**. Le message de MONARK de `b623867` va dans ce sens : CM-4b part de `e6dc5542`, sans le bloc C.

Le plan r3 dit autre chose : §8.3 met le chemin kata au bloc **D** (« 4b-i, 4b-ii »), **après** C, et CM-4c au bloc E, après T0 ; §8.6 : « … → C → D → temps (i) final → … → T0 → E ». Je lis la séquence de la consigne ainsi : CM-4b est la **partie du chemin kata qui ne dépend pas du format 1.1.0** ; le bloc D, après C, porte le branchement servi. Conséquences mesurées sur la base :

1. **CM-4b ne ré-épingle rien.** Aucun fichier de `packages/contracts/src/` ni de `schemas/`. Les types 1.1.0 dont le lot a besoin et que le bloc A a déjà figés sont lus tels quels : `ClassEntry`, `PolicyRow`, `QHAT_UNITS`, `ROW_STATUSES`, `TOOL_ERROR_CODES` (dont les 6 codes kata, `packages/contracts/src/tool-error-codes.ts:15-16`), `sha256Canonical`, `scoresSha256`.
2. **Un verdict kata 1.1.0 n'est pas exprimable avant C.** `region: null`, `cell_key`, `policy_row_sha256`, `policy_table_sha256`, `qhat_unit`, `scale` et les raisons `calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate` arrivent au bloc C (ré-épinglage 2). Le lot produit donc les **champs** du verdict kata dans un type local du harnais (hors manifeste) ; D les verse dans `CoverageVerdict` 1.1.0.
3. **L'étape L3 « toute raison `calib_*` → abstention »** est l'étape insérée par CM-3c-2 (plan §3, « Règle 1.1.0 »), au bloc C, dans `packages/hikae/src/l3-gate.ts`. Avant C, une ligne `silence` de direction (`{up, down}`, q̂ 1) avec `tau` 1 et l'horloge ouverte rend `defer set_too_large` dans le L3 1.0.0 (`l3-gate.ts` @base, chemin ensemble). Le tueur d'A-2 « a `calib_*` row defers » ne peut donc être tué **sur le chemin servi** qu'après C (C-4).
4. **Un changement servi avant C passe par l'instantané en attente**, qui n'entre qu'avec la PR du bloc C (`docs/G0-lot-served-pending-1.md:20`, Q-SP1-6). Tout octet de `/openapi.json`, `tools/list` ou des corps de la CA qui bougerait en CM-4b rougirait `harness_served_data_matches_in_process_harness` sans cet instantané. Le seul changement servi proposé (B-14, C-2) n'en touche aucun (mesure plus bas).

## Périmètre proposé (par défaut, sous C-1 et C-2)

Tout dans `apps/harness/` (zone RECHERCHES). Aucun fichier de `packages/contracts/src/`, de `schemas/`, de `packages/hikae/src/`, de `apps/site/` ni de `scripts/`.

### Lot CM-4b-a : chemin kata pur, non servi

Module neuf `apps/harness/src/kata-path.ts`, pur (aucune E/S, aucune horloge : `nowMs` injecté comme pour `runGate`), **importé par aucun module servi** (test de graphe, sur le modèle de `guard_modules_are_not_served`). Il n'importe pas `tools/gate.ts`, pour que D puisse l'importer depuis `gate.ts` sans cycle ; ses refus portent un code de `TOOL_ERROR_CODES` et le nom d'erreur que `http.ts` mappe en 400 (forme exacte fixée au code, sans déplacer une ligne de `gate.ts`, dont les adresses de tueurs sont épinglées).

1. **Contrat de requête kata** (`assertKataRequest(prediction, params, cls, nowMs?)`, plan §5.4 points 2 à 7, spec §4 et §9), dans un ordre déclaré (l'ordre entre deux refus n'est pas contractuel, spec §13, dernier alinéa ; seul celui du point 4 du plan l'est : grille et péremption après `produced_at_invalid` et `produced_at_future`, avant clé, domaine et ligne) :
   - type de `yhat` : nombre, sinon `yhat_type_mismatch` (code servi existant) ;
   - **grille** (B-15, pure, aussi sans horloge) sur les champs de la chaîne : secondes `00`, fraction entièrement nulle (toute longueur), puis l'instant (décalage appliqué) multiple de `cls.h_ms` ; sinon `produced_at_off_grid`. `…T04:00:00.0004Z` et `…T23:59:60Z` hors grille ;
   - **péremption** (avec `nowMs` seulement) : `nowMs − t > 300 000` ⇒ `produced_at_stale` ; exactement 300 s admis. Même constante que `PRODUCED_AT_FUTURE_TOLERANCE_MS` (B-4), lue, pas recopiée ;
   - `features_digest` absent ⇒ `features_digest_required` (sa forme hex reste au schéma d'entrée, C-11) ;
   - **clé** `kata:<kataId>@<venue>/<SYMBOL>/<h>`, `<h>` égal à l'horizon de la classe, sans panier ; sinon `kata_key_invalid` (grammaire des composantes : C-5) ;
   - **domaine** : direction, `yhat` fini dans [−1, 1], sinon `kata_yhat_domain` ; `yhat` = 0 donne `non_evaluable` (décision, pas un 400 ; champs : C-7) ; échelle, σ̂ fini et > 0, sinon `kata_yhat_domain` ;
   - **paramètres imposés** (option (c), décision déléguée Q1) : `params.alpha === Number(cls.alpha)` sinon `policy_alpha_mismatch` ; `params.nMin === cls.n_min` sinon `policy_nmin_mismatch`, **même sans ligne** ;
   - **`tau`** sur une classe d'ensemble : `tau > 1` ⇒ `policy_tau_cap`.
2. **Registre des tables servies** (`servedPolicyTables(texts)`) : les 32 tables kata de la vague 1, **sans ligne** (B-9 : aucune ligne kata au déploiement), construites par `buildPolicyTable` de B1 avec `kataClassEntries` de B2, et les tables USDe, liq, cascade de `policy-marginal.ts` (B2). Rend, par `task_class`, la table et `policy_table_sha256` (= `sha256Canonical(table)`). Textes de classe et de ligne en paramètres (Z-3) ; les tests les remplissent de valeurs synthétiques. Forme de publication : C-10.
3. **Recherche de case et champs du verdict kata** (`kataVerdictFields(table, prediction)`, spec §9 et §11, plan §2.2.1 et §5.4 points 6 et 8) :
   - **côté et panier** (direction) : côté = signe de m ; seuils lus sur les lignes `current` du côté (cohérence : C-8) ; `b1` si |m| ≤ t1, `b2` si t1 < |m| ≤ t2, `b3` sinon (comparaison : C-6) ; `cell_key` = `<predictor_id>/<side>-b<k>` ; **côté sans seuils** (aucune ligne du côté) : `cell_key` = `<predictor_id>/<side>`, `under_calib` ; échelle : `cell_key` = `<predictor_id>/b0` ;
   - **sans ligne** (verdict de §2.2.1, le seul servi au déploiement) : `region` nulle, `qhat` nul, `abstain` vrai, raison `under_calib`, `method` et `qhat_unit` de la classe, `alpha` de la classe, `n_calib` 0, `scores_sha256` = sha256 de `[]`, `scale` = σ̂ sur une classe d'échelle, `policy_row_sha256` nul, `policy_table_sha256` de la classe ;
   - **avec ligne** : `policy_row_sha256` = `sha256Canonical(row)`, `alpha` = `Number(row.alpha)`, `n_calib` = `row.n` (0 si nul), `scores_sha256` de la ligne (sha256 de `[]` sur une ligne `under_calib` sans calibration), `method` `risk-control` ; région selon `region_rule` et `status` : `sign-set` `region` ⇒ `{side}`, q̂ 0 ; `silence`, `vetoed`, `retired` ⇒ `{up, down}`, q̂ 1, raison `calib_*` et `abstain` vrai ; `scaled-band` : σ̂ hors [`calib_support.min`, `calib_support.max`] ⇒ aucune région, `out_of_support` ; sinon `region` ⇒ [0, h\*] par `bandEdge(row.qhat, σ̂)` (nul ⇒ `region_degenerate`, inatteignable sous la garde §4 de B2) ; autre statut ⇒ aucune région, sa raison ; ligne `under_calib` ⇒ aucune région, `under_calib`.
   - Raisons 1.1.0 dans un type local (`KataReason`), égal à la liste de la spec §6 ; le bloc C le remplace par `COVERAGE_REASONS` ré-épinglé (dette déclarée, nommée au G0 de C).
4. **Vecteurs** (dette « TBD (RECHERCHES, CM-4 tests ; MONARK publishes) » de la spec §8, §11 et §16) : paniers aux bords (|m| = t1, |m| = t2, m = ±1), h\* sur deux couples (q̂, σ̂), un appel kata sans ligne recalculé champ par champ (§11 point 4), sur la table synthétique de graine 37 de B1. Dans les tests ; la publication reste à MONARK.

### Lot CM-4b-b : B-14 servi, cohérence des seuils, cliquet des lanceurs

5. **B-14** (`apps/harness/src/tools/gate.ts`, sous C-2) : `KATA_CLASS_RE` (`gate.ts:738`) devient `^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$` ; `KATA_CLASSES_REDUCED` (`gate.ts:760-765`, « exact set, no reduced regex ») devient le **motif réduit** du plan §2.4 point 1 (familles `dlr`, `range`, `mae-down`, `mae-up` ; horizons `l5m`, `lh`, `4h`, `24h` ; symbole `[a-hj-km-z2-9ol]{1,10}`), avec un test de propriété : tout nom du motif large, réduit, tombe dans le motif réduit. Même nombre de lignes dans `gate.ts` si possible (ancres) ; sinon ré-ancrage nommé au G7 par `verifie-ancres.mjs`. `btc-dir-15m` garde `task_class_retired` (ordre `gate.ts:880-927` inchangé).
6. **Cohérence des seuils dans la garde de table** (`apps/harness/src/policy-guard.ts`, `guardKataTable`, sous C-8) : les lignes `current` d'un même (`task_class`, `kata_id`, `venue`, `symbol`, `horizon`, `side`) portent les mêmes `thresholds`, et un côté à seuils a ses trois paniers.
7. **Cliquet des lanceurs** (Q-3 condition 2, sous C-3) : test neuf `every_listed_code_has_a_served_thrower_or_is_pending` : pour chaque code de `TOOL_ERROR_CODES` sauf `output_invalid`, soit un site `new HarnessToolError(…, "<code>")` (ou un lanceur de défaut d'outil) existe dans le **graphe d'import servi**, soit le code est dans une liste fermée `PENDING` ; et aucun code de `PENDING` n'a de lanceur servi (la liste ne peut que diminuer, par le lot qui sert le code). À CM-4b : `PENDING` = `input_invalid`, `json_invalid` (bloc C) et les 6 codes kata (bloc D). Le G7 du dernier lot de D exige `PENDING` vide.

## Différences servies

**Lot a : aucune.** `kata-path.ts` n'est importé par aucun module servi ; `gate.ts`, `http.ts`, `openapi.ts`, `schema-projection.ts`, `tools/**`, `calibration.ts`, `class-policy.ts` inchangés. Toute requête kata reste servie comme à la base : sans `calibration`, `task_class_unknown` (`gate.ts:950`) ; avec, `byo_reserved_kata`.

**Lot b (B-14) : exactement ces octets servis changent, rien d'autre** (à rejouer au G7) :
- un appel BYO (`params.calibration` présent) dont la classe, en minuscules ASCII, entre dans le motif large sans entrer dans l'ancien (symbole de 2 à 10 caractères `[a-z0-9]` autre que `btc`, `eth`, `bnb`, `sol`, ou horizon `15m` ou `24h`) rend **400 `byo_reserved_kata`** au lieu d'une décision (exemples : `doge-dir-1h`, `ab-dir-4h`, `my-range-1h`, `eth-dir-24h`) ;
- un appel BYO dont la classe se réduit dans le motif réduit élargi rend **400 `byo_lookalike_confusable`** au lieu d'une décision (exemple : `my_range_1h`) ;
- un nom qui était refusé `byo_lookalike_confusable` parce que sa réduction tombait dans l'ensemble des 32 noms, et qui entre maintenant **directement** dans le motif large, passe à **`byo_reserved_kata`** (B-1 tourne avant B-10) : `so1-dir-1h` (`apps/harness/test/gate-byo-confusable.test.ts:55`) ;
- le **message** de tout 400 `byo_reserved_kata` (`gate.ts:797`), qui cite `KATA_CLASS_RE.source` (le texte d'un message n'est pas contractuel, spec §13) ;
- **inchangés**, mesuré sur la base : `apps/site/data/harness-served.json` (aucun champ ne cite le motif ni un nom kata ; `refusal`, `classes`, `byo_clause`, `honesty`, `gate_request` lus), `/openapi.json`, `tools/list`, la description du gate (aucun nom kata), les corps de la CA (`scripts/verify-harness.mjs`, `docs/deploy-CA-harness.json` : aucun nom du motif élargi), `apps/site/**` (grep `reserved`, `eth-dir`, `mae-down` : 0). Donc ni instantané en attente ni `pending_since` à écrire dans ce lot.
- B-14 est accepté (« oui aux deux », ligne B-14 de l'amendement, lot CM-4b) ; ce lot l'applique sur la base, servi à T0 seulement (ADR-PUBLIC-CADENCE-1 §17 : les lots 1.1.0 fusionnent sur la base jusqu'à T0).

**Ré-épinglage sous D9-ter : interdit à CM-4b, et non requis.** `gate.ts`, `policy-guard.ts` et les modules neufs sont hors du manifeste figé. `contracts_frozen` doit rester vert sans toucher `test/contracts-frozen.manifest.json` (test du G7).

**Reste au bloc D (après C), sous C-1** : branchement de `kataVerdictFields` dans `runGate` (classe servie = appartenance au registre des classes, plan §5.4 point 1) ; le verdict kata 1.1.0 ; la clause kata de `describeGate` (plan §5.4 point 9, texte servi) ; les 6 lanceurs kata servis ; le tueur servi « a `calib_*` row defers » ; la régénération de l'instantané en attente (plan §8.3, ligne D) ; `PENDING` vidé.

## Tests prévus et tueurs en forme fermée (un tueur par test, adresses fixées au gel)

Fichiers neufs : `apps/harness/test/kata-path.test.ts`, `apps/harness/test/kata-pattern-b14.test.ts`, `apps/harness/test/error-code-throwers.test.ts`. Table synthétique : registre de graine 37 de B1, non régénéré, gardé par `guardKataTable` de B2 avant usage.

| Test | Contenu | Tueur (forme) |
|---|---|---|
| `kata_grid_on_string_fields` | `T04:00:00Z` admis à 1h et à 4h ; `T05:00:00Z` admis à 1h, refusé à 4h ; `.0004`, `.000` admis/refusé selon la fraction ; `23:59:60Z` refusé ; `+05:30` appliqué ; sans `nowMs`, la grille s'applique | `ROR` du test de multiple de h (`!== 0` → `> 1`) |
| `kata_stale_bound_is_300_s` | t + 300 000 ms admis, t + 300 001 refusé `produced_at_stale` ; sans `nowMs`, pas de péremption | `ROR "> "` → `">= "` |
| `kata_key_grammar` | clé valide admise ; panier en trop, horizon autre que la classe, symbole d'une autre classe, préfixe absent, composante vide refusés `kata_key_invalid` | `CONST` du contrôle d'horizon |
| `kata_yhat_domain_and_zero_lean` | m = ±1 admis, 1 + 2^−52 refusé, NaN refusé, 0 ⇒ `non_evaluable` ; σ̂ 0, −1, Infinity refusés | `ROR` de la borne de la direction |
| `kata_imposed_params_without_row` | `alpha` 0.46 et `nMin` 7 refusés sur une table vide (aucune ligne) | `SDL` du contrôle d'`alpha` |
| `kata_tau_cap_on_set_classes` | `tau` 1 admis, 1.5 refusé sur `dir` ; `tau` 5 admis sur `range` | `ROR "> 1"` → `"> 2"` |
| `kata_features_digest_required` | absent refusé ; présent admis | `SDL` du refus |
| `kata_bucket_edges` | \|m\| = t1 ⇒ `b1`, = t2 ⇒ `b2`, > t2 ⇒ `b3`, côté `down` ; côté sans seuils ⇒ `<pid>/<side>` et `under_calib` | `ROR "<="` → `"<"` sur t1 |
| `kata_no_row_verdict_fields` | les 13 champs du verdict sans ligne, recalculés comme la spec §11 point 4 (direction et échelle) | `CONST` de `scores_sha256` (`[]` → `[0]`) |
| `kata_row_statuses_map_to_regions` | `region` ⇒ `{side}` q̂ 0 ; `silence`, `vetoed`, `retired` ⇒ `{up, down}` q̂ 1, raison `calib_*`, **`abstain` vrai** (forme pure du tueur d'A-2 « a `calib_*` row defers », C-4) ; bande : `out_of_support` aux deux bords exclus, [0, h\*] à l'intérieur | `CONST` `abstain: true` → `false` sur `calib_*` |
| `kata_served_tables_digests` | 32 + 3 tables, une par classe ; la table d'une classe ne dépend d'aucune autre ; empreintes épinglées sur les textes synthétiques | `CONST` d'une entrée de classe |
| `kata_path_is_not_served` | graphe d'import servi n'atteint pas `kata-path.ts` | `CONST` d'un import de `server.ts` |
| `b14_wide_pattern_reserved` (lot b, F2P) | `doge-dir-1h`, `ab-dir-4h`, `my-range-1h`, `eth-dir-24h`, `btc-range-15m` ⇒ `byo_reserved_kata` ; `my_range_1h` ⇒ `byo_lookalike_confusable` ; `btc-dir-15m` ⇒ `task_class_retired` sans calibration | `CONST` du motif (`(15m\|1h\|4h\|24h)` → `(1h\|4h)`) |
| `b14_reduced_pattern_property` (lot b) | 10 000 noms tirés à graine du motif large, réduits, tombent dans le motif réduit ; noms voisins hors motif décident | `CONST` du symbole réduit |
| `guard_thresholds_agree_per_side` (lot b) | deux paniers d'un côté à seuils différents refusés ; un côté à deux paniers refusé | `SDL` du contrôle |
| `every_listed_code_has_a_served_thrower_or_is_pending` (lot b) | cliquet du point 7 | `CONST` d'un code de `PENDING` retiré |

Tests existants modifiés (lot b), déclarés : `apps/harness/test/gate-byo-confusable.test.ts:55` (`so1-dir-1h` passe à `byo_reserved_kata`) et `:62-63` (`doge-dir-1h` ne décide plus) ; le commentaire « The 32 reserved kata class names, reduced (exact set, no reduced regex) » (`gate.ts:760`) devient faux et change.

## Plan de preuve rouge

- `node scripts/red-proof.mjs --base e6dc5542 --gel <gel du lot> --repo /home/user/monark-governance-c4b --draw <n> --seed 37`, un passage par lot (base du lot b = gel du lot a).
- Lot a : tous les tests de `kata-path.test.ts` sont **new-module** (module neuf, rouges à la base par import) ; chacun a son tueur tiré et tué.
- Lot b : `b14_wide_pattern_reserved` et les deux lignes modifiées de `gate-byo-confusable.test.ts` sont **F2P** (rouges à `e6dc5542` : `doge-dir-1h` décide). `b14_reduced_pattern_property`, `guard_thresholds_agree_per_side` et le cliquet sont F2P ou new-module selon leur fichier ; un test vert à la base par construction (resserrement de motif) est traité comme au lot a de B2 : substitut « pinned », rejoué à la main, tueur rouge par une assertion.
- Ancres : `verifie-ancres.mjs . --touched e6dc5542 HEAD` : 0 dérivé, 0 perdu, sinon ré-ancrage nommé au G7.
- `contracts_frozen` vert **sans** ré-épinglage, et `served-replay-cm3`, `harness-served`, `narabi-live` verts sans changement : preuve que rien du manifeste ni des surfaces épinglées ne bouge.

## Oracle

`tsc --noEmit`, `eslint` (fichiers changés), `lint:ratchet`, `gate:vocab`, `lang:gate`, `npm test` complet à 0 échec (Node 24.21.0, variables de proxy retirées, TMPDIR propre ; test 42 relancé seul s'il est seul rouge, mode EXPORT-TEST42-SUMMARY-1), red-proof ci-dessus, R-25 ≤ 547 par lot et ≤ 1 205 pour la PR. `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé (mode du fichier).

## R-25 (estimation, `r25()` contre `e6dc5542`)

| Poste | Lot a | Lot b |
|---|---|---|
| contrat de requête kata (grille, péremption, clé, domaine, paramètres, `tau`, empreinte) | ~75 | — |
| tables servies et registre | ~25 | — |
| recherche de case, panier, champs du verdict | ~70 | — |
| B-14 (motif large, motif réduit, message) | — | ~15 |
| cohérence des seuils (garde) | — | ~12 |
| tests et vecteurs | ~280 | ~170 |
| **Total** | **~450** | **~200** |

Bloc CM-4b : ~650, au-dessus de 547 : **deux lots empilés sur une même PR** (≤ 1 205), CM-4b-a puis CM-4b-b. La coupe suit le seul octet servi : le lot a ne sert rien, le lot b porte B-14. Si le lot a mesure plus de 547, les vecteurs (point 4) passent au lot b. Le plan estimait ~520 pour le bloc D entier ; l'écart vient de ce que le branchement servi reste à D (C-1) et que les vecteurs de la spec entrent ici.

## Items liés (hors R-25 du lot)

- **NOTICE-1-1-0** : son déclencheur est ce G0 (plan §9.4). RECHERCHES ouvre le brouillon comme pièce de `recherches:coordination/pieces/`, hors du dépôt (Z-4).
- **LATE-CALL-WINDOW-1** : dû « avant le G7 de CM-4b » ; la péremption n'est servie qu'en D (C-9).
- **SPEC-PUBLISH-PIPELINE-1** (MONARK) : déclenché après le G7 de CM-4b ; il consomme `servedPolicyTables` (C-10).
- **CM-4c** (lot suivant) : garde de table de la vague 2, test de table mixte, bornes de `n_test` (TEST de vague 1 et `retire` `live:`), `calib_parent` sous forme de table (liste r4, ligne 5). Rien de CM-4c n'entre ici.
- Liste r4, ligne 7 : un texte de classe ou de ligne qui citerait les durées d'A-1 nomme l'alpha (Z-3).

## Questions de contrat (pour l'advisor du coordinateur ; aucune n'est tranchée ici)

**C-1 (bloquante) : CM-4b avant C sert-il le chemin kata ?** Proposition par défaut : **non**. CM-4b livre le chemin kata pur et non servi (lot a) et B-14 (lot b) ; le branchement servi, le verdict kata, la clause de description et les 6 lanceurs kata vont au bloc D, après C. Raisons : (1) avant C, le format 1.0.0 ne peut pas porter un verdict kata vrai (pas de `region: null`, de `cell_key`, de `policy_table_sha256`, de raison `calib_*` ni `out_of_support`) ; servir un `under_calib` kata en 1.0.0 serait un sens de plus, hors avis aux appelants ; (2) le servir ferait bouger `/openapi.json` (description), donc rougir g3-verification tant que l'instantané en attente n'est pas versé, ce qui n'arrive qu'avec la PR du bloc C ; (3) l'amendement dit déjà « aucun changement contre le servi : aucune classe kata n'y existe » et « CM-3c … se déploie à T0 avec CM-4b » : l'effet servi est au même T0 dans les deux lectures. Lecture à écrire dans la révision r4 du plan : les lignes B-9 précisée et B-15 de l'amendement (lot CM-4b) sont servies au bloc D.

**C-2 : B-14 dans CM-4b (lot b) ou au bloc D ?** Proposition par défaut : **CM-4b, lot b**. B-14 s'exprime en 1.0.0 (plus de noms BYO refusés, codes existants), ne touche aucune surface épinglée (mesure de la section « Différences servies »), et allège D, déjà proche de la borne de PR après C. Contre : un changement servi de plus sur la base avant C, à rejouer par le contrôle par diff.

**C-3 : échéance de la condition 2 de Q-3.** « Au plus tard au G7 de CM-4b » est intenable dans cette séquence : `input_invalid` et `json_invalid` sont lancés au bloc C, après CM-4b, et les 6 codes kata au bloc D. Proposition par défaut : garder « avant T0 », déplacer « au plus tard » au **G7 du dernier lot du bloc D**, et poser dès CM-4b le cliquet du point 7 (`PENDING` fermé, qui ne peut que diminuer), pour qu'aucun code ne reste mort sans être nommé. Un lanceur dans un module non servi ne compte pas : l'objet de la condition est qu'aucun code mort ne soit publié à T0.

**C-4 : place du tueur d'A-2 « a `calib_*` row defers ».** Proposition par défaut : forme pure en CM-4b (`kata_row_statuses_map_to_regions` : toute ligne `calib_*` rend `abstain` vrai et sa raison) ; forme servie, de bout en bout par `runGate`, au bloc D, une fois l'étape L3 de CM-3c-2 en place. Le G7 de B2 (« chemin servi, CM-4b ») est relu ainsi.

**C-5 : grammaire de la clé kata.** La spec §9 dit « `kata:<kataId>@<venue>/<SYMBOL>/<h>` … the `<h>` equal to the class's » sans alphabet. Proposition par défaut : `kataId` `^[a-z0-9]+(-[a-z0-9]+)*$` ; `venue` `^[a-z0-9]+(-[a-z0-9]+)*$` ; `SYMBOL` `^[A-Z0-9]{2,20}$` **et** préfixé du symbole de la classe en majuscules (`btc-…` ↔ `BTC…`, même lien que la garde de B2, m-1 de B1) ; `<h>` = horizon de la classe ; grammaire seulement, pas d'appartenance à la liste des katas enregistrés. Raisons : le lien symbole ↔ classe et l'horizon sont des propriétés de la classe, donc une clé qui les contredit ne peut jamais avoir de ligne, et un `under_calib` la ferait passer pour « pas encore calibrée » (P-3) ; un kata neuf, lui, arrive comme données (forme finale, §0 point 3) et doit rendre `under_calib`, pas un 400.

**C-6 : comparaison de |m| aux seuils.** KATA-SPEC §5 : « Compare |m| to the number they denote ». Proposition par défaut : comparer au **double** `Number(t)`, non au rationnel décimal exact. Raisons : t1 et t2 sont des |m| observés (rang ⌈n/3⌉, ⌈2n/3⌉), écrits en aller-retour le plus court, donc la chaîne dénote ce double par construction ; en décimal exact, le lean égal au seuil tomberait dans le panier supérieur dès que le double dépasse sa chaîne décimale, ce qui contredit « b1 : |m| ≤ t1 » pour la valeur même qui l'a fixé. Écart déclaré avec B-12 (α lu en décimal exact) : α est un paramètre écrit par un humain, le seuil un double mesuré. La spec §9 et KATA-SPEC §5 le diraient en une phrase.

**C-7 : champs du verdict d'un lean nul (`non_evaluable`).** Aucune case n'est cherchée. Proposition par défaut : `cell_key` = `<predictor_id>` (la clé sans côté), `policy_table_sha256` = table de la classe, `policy_row_sha256` nul, `region` et `qhat` nuls, `abstain` vrai, raison `non_evaluable`, `n_calib` 0, `scores_sha256` = sha256 de `[]`, `method`, `qhat_unit` et `alpha` de la classe. Raisons : le couplage `cell_key = null ⇔ policy_table_sha256 = null` réserve `null` au BYO ; la clé sans côté est la clé « recherchée » la plus longue que la requête détermine. Alternative : `<predictor_id>/none`, refusée (grammaire neuve).

**C-8 : seuils d'un côté portés par trois lignes.** La spec dit « the bucket … from `yhat` and the row's thresholds », alors que le panier choisit la ligne. Proposition par défaut : la garde de table (B2, lot b de CM-4b) exige que les lignes `current` d'un même côté portent les mêmes `thresholds` et qu'un côté à seuils ait ses trois paniers ; le service lit les seuils sur n'importe laquelle. Raisons : la projection de la vague 1 les donne égaux (une table de seuils par côté, KATA-SPEC §5) ; refuser à l'import évite un choix de ligne au service.

**C-9 : échéance de LATE-CALL-WINDOW-1.** Proposition par défaut : « avant le G7 de CM-4b » devient « avant le G7 du lot de D qui sert `produced_at_stale` ». Raison : avant D, la fenêtre de 300 s n'est servie à aucun appel kata.

**C-10 : forme des tables servies.** Proposition par défaut : les tables sont **construites en processus** par `servedPolicyTables` (code de B1, B2 et CM-4b), leurs empreintes épinglées par un test ; aucun fichier JSON de table n'est versé dans `monark-governance` (public) avant le go F-5a ; SPEC-PUBLISH-PIPELINE-1 publie les octets de la même fonction et teste « table servie = table publiée ». Raison : une seule source des octets, comme `canonicalJson` ; les 32 tables kata sont vides au déploiement, mais leurs textes ne sont pas encore fixés (Z-3).

**C-11 : `features_digest` mal formé sur un appel direct.** Proposition par défaut : le chemin pur ne contrôle que la présence (`features_digest_required`) ; la forme (64 hex minuscules) reste au schéma d'entrée (400 `input_invalid` aux points d'entrée HTTP et MCP), et un appel direct sans schéma l'accepte telle quelle, liée par `request_sha256`. Déclaré comme pour la grille et l'horloge (spec §3). Raison : P-3, `features_digest_required` serait une raison fausse pour une empreinte présente.

## Questions de zone et d'ordre (pour MONARK)

**Z-1 (bloquante) : ordre des blocs.** La consigne donne A → B1 → B2 → CM-4b → CM-4c → C → D ; le plan r3 §8.3 et §8.6 donnent C → D (= 4b) → T0 → E (= 4c) ; ton message de `b623867` fait partir CM-4b et CM-4c de `e6dc5542`. Confirmes-tu que CM-4b et CM-4c passent avant C, et que D, après C, porte le branchement servi du chemin kata (C-1) ? Si oui, la révision r4 du plan l'écrit (§8.3, §8.6, §9.4).

**Z-2 : D (au moins 7 jours) n'est pas fixé.** L'amendement le veut « avant le G0 de CM-4b ». Proposition : comme CM-4b avant C ne sert ni le chemin kata ni l'avis, la condition se lit « avant le G0 du bloc D » ; sinon, fixer D maintenant avec le fondateur (proposition : 7 jours, le plancher).

**Z-3 : textes servis de classe et de ligne.** Les 32 `text` de classe kata, les textes de ligne kata et la clause kata de `describeGate` sont des textes servis (porteurs K-1, porte de vocabulaire). Qui les écrit, et quand ? Proposition : RECHERCHES les rédige en paramètres (valeurs synthétiques en test dans ce lot) ; ta ligne datée en fixe les octets avant F-5a (Q-3 de B1) ; ils nomment l'alpha s'ils citent les durées d'A-1 (liste r4, ligne 7).

**Z-4 : NOTICE-1-1-0.** Déclenché par ce G0. Proposition : brouillon de RECHERCHES dans `recherches:coordination/pieces/` (hors dépôt, hors R-25), soumis à ton contrôle et à la porte de vocabulaire, publié par toi à T − D. Confirmes-tu le lieu ?

**Z-5 : B-14 et tes surfaces.** Mesuré sur la base : aucune page du site, aucun fichier de `skills/`, aucun corps de CA ne cite l'ancien motif ni un nom qu'il élargit. Confirmes-tu qu'aucune surface de ta zone (pages hors `.ts/.tsx/.mdx`, textes du miroir) ne liste les noms réservés ?

**Z-6 : `policy-guard.ts` au lot b.** La cohérence des seuils (C-8) modifie la garde de B2 (zone RECHERCHES, `apps/harness/`). Aucune ouverture de zone n'est nécessaire ; je le note pour ton contrôle par diff, puisque #138 vient d'être fusionnée.
