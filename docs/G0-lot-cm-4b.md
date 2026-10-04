# G0 du lot CM-4b, lot a (contrat 1.1.0) : chemin kata pur et non servi, contrat de requête kata, recherche de case, tables servies construites en processus

- **Révision** : ce G0 amende celui du commit `e592d469` (sha256 LF `3ac1df0c…a991`), après la décision déléguée C-1 à C-11 et les réponses de MONARK à Z-1 à Z-6. Le G0 initial portait deux lots (a non servi, b servi avec B-14) ; **Z-1 redécoupe** : le lot a, non servi, se pose sur la base avant le bloc C ; tout ce qui est servi part au **bloc D**, après C (section « Bloc D »). Ce fichier ne décrit donc plus qu'un lot, le lot a.
- **Sources** (sha256 des octets LF) :
  - décision déléguée `recherches:coordination/pieces/2026-10-04-CM-4b-avis/DECISION-CM-4b-C1-C11.md` (`bee35dbc…bb5a`, commit `29fb1c2`) et l'avis lu en entier `AVIS-advisor-CM-4b-C1-C11.md` (`77de6c0a…16d9`) ;
  - messages de MONARK `…-MONARK-vers-RECHERCHES-CM-4b-Z.md` (`fd9a6a9`, `1b70d4ba…30df` : Z-1 à Z-6) et `…-CM-4b-croisement.md` (`0cc319c`, `6a0cbee7…96cc` : « Le code du lot a de CM-4b peut donc partir ») ;
  - notre message `…-RECHERCHES-vers-MONARK-D-arbitrage.md` (`29fb1c2`, `6d1efdbf…1661`) : arbitrage du fondateur, verbatim « **D = 7 jours** » ;
  - liste r4 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md` (`4c580b37…b5`, commit `29fb1c2`) : lignes 6 et 7, et lignes 8 à 15 (ajouts de la décision CM-4b) ;
  - inchangées depuis le G0 initial : plan r3 `PLAN-CM-3c-CM-4.md` (`3e0da1a6…653c`) §2.2, §2.2.1, §5.2.1, **§5.4**, §7, §8.3, §8.6, §9.2, §9.4 ; `SPEC-1-1-0-brouillon.md` (`975bb40c…`) §3 à §6, **§9**, §10, **§11**, §13, §16 ; `AMENDEMENT-ADR-CM-r3.md` (`774a5601…`) ; `avis/DECISION-PolicyRow-Q1-Q3.md` (`117eb289…`), Q-3 ; A-2 r3 §5 (tueur « a `calib_*` row defers ») ; `KATA-SPEC.md` à `ddfee9e` (`b32a4062…`) §1, §2, §5 ; addendum D9-ter de l'ADR-M001 (deux ré-épinglages seulement, blocs A et C) ; G0 et G7 des blocs A, B1, B2 et des lots SERVED-PENDING-1 et UKEMI-PENDING-1 sur la base.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = **`e6dc5542`** (refetchée au moment de cet amendement, `git fetch origin '+refs/heads/*:refs/remotes/origin/*'` : inchangée, aucune fusion à faire). Elle porte A, B1, SERVED-PENDING-1, UKEMI-PENDING-1, `tail.ts` et B2 ; **pas** le bloc C (`SCHEMA_VERSION` `"1.0.0"`, `COVERAGE_REASONS` sans `calib_*`). Branche `recherches/cm-4b`, arbre `/home/user/monark-governance-c4b`. Auteur : RECHERCHES. Borne R-25 : 547 par lot (`scripts/oracle/r25.mjs`).
- **Statut** : G0 amendé avant tout code du lot a. MONARK a levé la condition de départ (`0cc319c`). Rien n'est poussé, aucune PR n'est ouverte par ce lot.

## Séquence (Z-1, décidée par MONARK) et D (Z-2, arbitrée par le fondateur)

- **Ordre** : A → B1 → B2 → (W2E-TAIL-1) → SERVED-PENDING-1 → **C → D** → temps (i) final → … → T0 → **E**, comme au plan r3 §8.3 et §8.6. Avance permise par Z-1 point 1 : **ce qui ne change aucun octet servi se pose sur la base avant C**, en parallèle de C. C'est ce lot (CM-4b-a). Tout ce qui est servi reste en D, après C (Z-1 point 2). **CM-4c reste E**, la vague 2, après T0 (Z-1 point 3). Ma formulation du G0 initial (« CM-4b et CM-4c avant C ») était fausse ; elle est retirée.
- **D = 7 jours** : fixé par le fondateur le 2026-10-04, après arbitrage entre deux réponses croisées (« 1 jour » à MONARK vers 23:0x UTC, « 7 jours » à RECHERCHES quelques minutes plus tard) ; verbatim final : « D = 7 jours ». Conforme au plan r3 §9.2 (≥ 7 jours) : aucun écart, donc pas de ligne « D = 1 jour » dans la liste r4 ; la ligne 15 de la liste porte cet arbitrage. La condition « D fixé avant le G0 de CM-4b » est remplie.
- **Conséquences pour ce lot** :
  1. **Aucun octet servi ne change** (section « Différences servies », avec sa preuve au G7).
  2. **Aucun ré-épinglage** : aucun fichier de `packages/contracts/src/` ni de `schemas/` ; `contracts_frozen` reste vert sans toucher `test/contracts-frozen.manifest.json` (D9-ter).
  3. Les champs d'un verdict kata 1.1.0 (`region: null`, `cell_key`, `policy_table_sha256`, `qhat_unit`, `scale`, raisons `calib_*`, `out_of_support`, `region_degenerate`) n'existent pas avant C. Le lot les produit dans un **type local du harnais** (`KataVerdictFields`, `KATA_REASONS`), hors manifeste ; D les verse dans `CoverageVerdict` 1.1.0 et supprime le type local (C-1 condition 2).
  4. Rien de `apps/harness/src/tools/`, `http.ts`, `server.ts`, `openapi.ts`, `schema-projection.ts`, `calibration.ts`, `class-policy.ts` ne change : leurs lignes portent des adresses de tueurs épinglées.

## Périmètre du lot a (non servi)

Tout dans `apps/harness/` (zone RECHERCHES). Aucun fichier de `packages/`, `schemas/`, `apps/site/`, `scripts/`.

1. **Module neuf `apps/harness/src/kata-path.ts`**, pur (aucune E/S, aucune horloge : `nowMs` injecté), importé par **aucun module servi** (test `kata_path_is_not_served`). Il importe de `tools/gate.ts` la classe `HarnessToolError` (ses refus portent un code de `TOOL_ERROR_CODES` et le nom que `http.ts` mappe en 400), `rfc3339Instant` et `PRODUCED_AT_FUTURE_TOLERANCE_MS` (**une seule source** pour la grammaire et pour les 300 s, C-9). Il ne les utilise **qu'à l'appel**, jamais au chargement : quand D fera importer `kata-path.ts` par `gate.ts`, le cycle d'import sera sûr sous ESM. Écart déclaré au G0 initial, qui excluait cet import : recopier la grammaire RFC 3339 ou la constante créerait une seconde source.
2. **Contrat de requête kata** (`assertKataRequest(prediction, params, cls, nowMs?)`), dans cet ordre (**C-1 condition 5** : grille et péremption **avant** le type, la clé, le domaine et la ligne ; c'est le seul ordre contractuel, spec §9) :
   1. `produced_at` : grammaire (refus `produced_at_invalid`, comme B-4, pour un appel direct) ; **grille** sur les champs de la chaîne (secondes `00`, chiffres de fraction tous `0`, instant décalage appliqué multiple de `cls.h_ms`), sinon `produced_at_off_grid` ; **péremption** avec `nowMs` seulement (`nowMs − t > 300 000` ⇒ `produced_at_stale`, 300 s admis). Le futur reste à `runGate` (B-4) ;
   2. type de `yhat` (nombre, sinon `yhat_type_mismatch`) ;
   3. `features_digest` **présent**, sinon `features_digest_required` (**C-11** : présence seule ; la forme 64 hex reste au schéma d'entrée servi) ;
   4. **clé** par le prédicat partagé (point 3), sinon `kata_key_invalid` ;
   5. **domaine** : direction, `yhat` dans [−1, 1] (NaN et infinis refusés) ; échelle, σ̂ fini et > 0 ; sinon `kata_yhat_domain`. Un lean nul n'est **pas** refusé ici ;
   6. `params.alpha === Number(cls.alpha)` sinon `policy_alpha_mismatch` ; `params.nMin === cls.n_min` sinon `policy_nmin_mismatch`, **même sans ligne** (décision Q1, option (c)) ;
   7. classe d'ensemble : `params.tau > 1` ⇒ `policy_tau_cap`.

   `kataPath(prediction, params, table, nowMs?)` enchaîne le contrat puis la recherche de case : **`non_evaluable` n'est rendu qu'après tous les contrôles 400 (C-7 condition 1)**.
3. **Grammaire de clé partagée (C-5)** : `kataKeyProblem(key, taskClass)` dans `apps/harness/src/policy-classes.ts` (module de B2, hors graphe servi), seul prédicat, appelé par `assertKataRequest` **et** par `guardKataRow` (`policy-guard.ts:51`, ligne réécrite sur place pour garder les adresses de tueurs). Grammaire : préfixe `kata:` exact ; `kataId` et `venue` en `^[a-z0-9]+(-[a-z0-9]+)*$`, **1 à 64** caractères ; `SYMBOL` en `^[A-Z0-9]{2,20}$`, **2 à 20**, préfixé du symbole de la classe en majuscules ; `<h>` égal à l'horizon de la classe ; exactement quatre parties (un panier en trop rend `kata_key_invalid`). **Grammaire seulement** : un kata ou un lieu non enregistré rend `under_calib`. **Écart de la garde de B2, corrigé** : `policy-guard.ts:51` liait le symbole par `^[A-Z0-9]+$` **sans borne de longueur** et ne contrôlait ni `kataId` ni `venue` ; une ligne à symbole de 21 caractères y passait sans être jamais atteignable par une requête. Ambiguïté de préfixe déclarée (C-5 condition 2) : `ETHFIUSDT` sur une classe `eth-…` passe la grammaire et rend `under_calib`, raison vraie.
4. **Cohérence des seuils dans la garde de table (C-8)**, `guardKataTable` (lignes ajoutées **après** celles des tueurs épinglés) : les lignes `current` d'un même côté (`task_class`, `kata_id`, `venue`, `symbol`, `horizon`, `side`) sont ses **trois paniers** et portent les **mêmes `thresholds`** ; sinon refus nommé. Un côté sans seuils n'a aucune ligne (lecture L-1 de B1, inchangée) ; un panier structurellement vide (seuils à égalité) reste une ligne `under_calib` (le registre la donne, la garde exige sa présence). **Conséquence sur le registre synthétique de B1** (`apps/harness/test/helpers/synthetic-registry.ts`) : il tirait des seuils par panier ; il prend maintenant les seuils de `b1` pour les trois paniers du côté, comme la vague 1 (80 côtés sur 80, mesure M-1 de l'avis). Les tirages pseudo-aléatoires sont gardés un pour un (les paniers `b2` et `b3` tirent encore leurs seuils puis les écartent), donc tout autre champ du registre est inchangé ; son empreinte change, et aucun test ne l'épingle. Écart déclaré au G0 initial (« registre … non régénéré »).
5. **Tables servies construites en processus (C-10)** : `servedPolicyTables({ classText, marginal })`, pure et déterministe, rend **35 tables** triées par `task_class` : les 32 classes kata de la vague 1 **sans ligne** (B-9), par `kataClassEntries` et `buildPolicyTable` ; les tables stable-run (ligne USDe, ordre `time`), liquidation (lignes de `UKEMI_LIQ_COMMITTED`, ordre `ascending`) et cascade (vide), par `marginalClassEntries` et `marginalRow` de B2 ; chacune avec `policy_table_sha256` = `sha256Canonical(table)`. Les ordres sont ceux de la spec §10 et de la colonne `order` déjà fixée par B2. **Aucun fichier JSON de table n'entre dans le dépôt** ; les textes de classe et de ligne et les entrées `source` des lignes marginales sont des paramètres (Z-3 : MONARK fixe les octets par ligne datée avant F-5a).
6. **Recherche de case et champs du verdict kata** (`kataVerdictFields(table, prediction, tau)`, spec §9 et §11) :
   - **clé** : direction, côté = signe de m, seuils lus sur la **première ligne `current` du côté dans l'ordre de tri de la table** (C-8 condition 1), `b1` si |m| ≤ t1, `b2` si t1 < |m| ≤ t2, `b3` sinon, en comparant |m| au **double `Number(t)`** (**C-6** ; prémisse : le contrôle fermé `String(Number(t)) === t` du bloc A, `packages/contracts/src/policy-table.ts:36,68`, reste) ; `cell_key` = `<predictor_id>/<side>-b<k>` ; côté sans ligne : `<predictor_id>/<side>` ; échelle : `<predictor_id>/b0` ; **lean nul : `cell_key` = `<predictor_id>`**, aucune ligne cherchée (**C-7**) ;
   - **sans ligne** (le seul verdict servi au déploiement) : `region` et `qhat` nuls, `abstain` vrai, `under_calib`, `method`, `qhat_unit` et `alpha` de la classe, `n_calib` 0, `scores_sha256` = sha256 de `[]`, `scale` = σ̂ sur une classe d'échelle (nul sur la direction), `policy_row_sha256` nul, `policy_table_sha256` de la classe ; lean nul : les mêmes champs avec la raison `non_evaluable` ;
   - **avec ligne** : `policy_row_sha256` = `sha256Canonical(row)`, `alpha` = `Number(row.alpha)`, `n_calib` = `row.n`, `scores_sha256` de la ligne, `method` `risk-control` (`statement` `per-calibration`) ; `sign-set` : `region` ⇒ `{side}`, q̂ 0 ; `silence`, `vetoed`, `retired` ⇒ `{up, down}`, q̂ 1, **`abstain` vrai** et `calib_*` (**C-4, forme pure**) ; `under_calib` ⇒ aucune région ; `scaled-band` : σ̂ hors [`calib_support.min`, `calib_support.max`] ⇒ `out_of_support`, puis `calib_*` sans région, puis `region` ⇒ [0, h\*] par `bandEdge(row.qhat, σ̂)` (h\* nul ou absent ⇒ `region_degenerate`, inatteignable sous la garde de B2) ;
   - **lecture déclarée** (pas un choix neuf) : une région servie suit la règle de verdict servie aujourd'hui. Un ensemble `{side}` porte `abstain` = |C| > `tau` et `set_too_large`, sinon `covered`, comme le verdict d'ensemble servi (`byoVerdict`) ; il n'y a de différence qu'avec `tau` < 1, puisque `tau` ≤ 1 est imposé. Une bande porte `abstain` faux et `covered`, comme `conformInterval`. La décision L3 (§6) n'en dépend pas : `decide()` ne lit pas `verdict.abstain`.
7. **Cliquet des lanceurs (C-3)**, test `every_listed_code_has_a_served_thrower_or_is_pending`. Il est contrôlé statiquement sur le graphe d'import servi : un code a un lanceur servi quand son littéral figure dans un module servi, codes par défaut des autres outils compris (`attest_refused`, `calibrate_input_invalid`, `cascade_input_invalid`, `ukemi_predict_input_invalid`). `output_invalid` est exclu (chemin 500). `PENDING` est épinglé **exactement** : `input_invalid`, `json_invalid`, et les 6 codes kata. Aucun code de `PENDING` n'a de lanceur servi. **Placé au lot a**, non en D, pour deux raisons :
   - la décision le ferme « dès le lot b de CM-4b », et le lot b n'existe plus (Z-1) ;
   - sa condition 3 veut que le bloc C retire `input_invalid` et `json_invalid` de `PENDING` dans le lot qui les lance, donc le cliquet doit exister **avant C**.

   Le test ne change aucun octet servi (Z-1 point 1). Les lanceurs kata de `kata-path.ts` ne comptent pas, puisque le module n'est pas servi : le test le vérifie.
8. **Vecteurs** (dette « TBD (RECHERCHES, CM-4 tests ; MONARK publishes) » de la spec §8, §11, §16), dans les tests, publication à MONARK :
   - paniers aux bords sur des seuils dont le double est **au-dessus** de la chaîne décimale (`0.1`, `0.2`) : |m| = t et `nextUp(t)` ;
   - h\* vérifié comme plus grand double à fl(h/σ̂) ≤ q̂, sur toutes les lignes de bande `region` de la table synthétique, aux deux bords du support inclus ;
   - un appel kata sans ligne recalculé champ par champ (§11 point 4), direction et échelle ;
   - le lean nul (§11 point 3, C-7).

## Différences servies

**Aucune.** `kata-path.ts` n'est importé par aucun module servi ; `policy-classes.ts` et `policy-guard.ts` sont hors du graphe servi (`guard_modules_are_not_served`, et `kata_path_is_not_served` de ce lot) ; aucun fichier de `src/tools/`, `http.ts`, `server.ts`, `openapi.ts`, `schema-projection.ts`, `calibration.ts`, `class-policy.ts`, `apps/site/`, `scripts/`, `docs/deploy-CA-harness.json` ne change. Toute requête kata reste servie comme à la base (sans `calibration` : `task_class_unknown` ; avec : `byo_reserved_kata`). **Preuve au G7** : `apps/site/data/harness-served.json` inchangé (octets, et `harness_served_data_matches_in_process_harness` vert) ; `/openapi.json` et `tools/list` du harnais en processus, octet pour octet égaux entre la base et le gel (empreintes) ; corps de la CA (`scripts/verify-harness.mjs`, `docs/deploy-CA-harness.json`) inchangés ; `served-replay-cm3`, `narabi-live` et `contracts_frozen` verts sans changement.

## Bloc D (après C) : ce qui quitte CM-4b (Z-1 point 2)

Le bloc D porte, en lots à découper à son G0 :
- **B-14** (`apps/harness/src/tools/gate.ts`) : motif large `^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$` ; **motif réduit exact (C-2)** `^(?:m|[a-hj-km-z2-9ol]{2,10})-(dlr|range|mae-down|mae-up)-(l5m|lh|4h|24h)$` ; tests de propriété de sûreté et d'exactitude ; cas `a-dir-1h` (décide) et `rn-dir-1h` (`byo_reserved_kata`) ; `btc-dir-15m` garde `task_class_retired`, un nom large non enregistré sans calibration garde `task_class_unknown` ; **les deux tests inversés de `apps/harness/test/gate-byo-confusable.test.ts`** (`:55`, `so1-dir-1h` ⇒ `byo_reserved_kata` ; `:63`, `doge-dir-1h` ne décide plus) ; le commentaire `gate.ts:760` ; le message 400 servi qui cite le motif ; NOTICE-1-1-0 nomme l'élargissement (C-2 condition 4) ; liste des octets servis changés au G7 (C-2 condition 5). Z-5 répondu par MONARK (aucune surface ne liste les noms réservés).
- **Le branchement** de `kataPath` dans `runGate` (classe servie = appartenance au registre des classes, plan §5.4 point 1), sur les tables de `servedPolicyTables` ; le **verdict kata 1.1.0** dans `CoverageVerdict`, `KataReason` supprimé ; la **clause kata** de `describeGate` (texte servi, Z-3) ; les **6 lanceurs kata servis**, chacun retiré de `PENDING` dans son commit ; **B-15** et **B-9 précisée** servies ; l'**instantané en attente** régénéré (plan §8.3) ; le **tueur « a `calib_*` row defers » de bout en bout** par `runGate` sur une table synthétique à ligne `silence` (C-4) ; le commentaire `gate.ts:275` (« at the latest at the G7 of CM-4b »), devenu faux sous C-3.
- **G7 du dernier lot de D** : `PENDING` vide, et le cliquet **dynamique** (pour chaque code sauf `output_invalid`, une requête servie en HTTP en processus rend ce code ; C-3 condition 2) ; le tueur d'A-2 déclaré couvert en entier (C-4 condition 3) ; le code et les vecteurs de LATE-CALL-WINDOW-1 au lot de D qui sert `produced_at_stale` (C-9).

## Ce que le bloc C attend de ce lot (à nommer au G0 de C)

- La liste « ce que D attend du paquet gelé » (C-1 condition 2) : les 5 raisons (`calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate`) ; les 5 champs neufs du verdict (`cell_key`, `policy_row_sha256`, `policy_table_sha256`, `qhat_unit`, `scale`) ; `region: null` ; `method: risk-control` ; toute colonne de `ClassEntry` issue de C-9. Un test de parité `KATA_REASONS` ⊆ `COVERAGE_REASONS`.
- La forme L3 du tueur « a `calib_*` row defers » (C-4 : test de `l3-gate.ts` sur un verdict construit à la main, `{up, down}`, q̂ 1, `tau` 1, horloge ouverte ; mutant : retirer l'étape `calib_*`).
- La forme de LATE-CALL-WINDOW-1 (C-9 : constante de 300 s par défaut, sinon colonne de `ClassEntry` au bloc C) **avant le G0 de C**.
- Le retrait d'`input_invalid` et de `json_invalid` de `PENDING` dans le lot qui les lance (C-3 condition 3) ; le test d'une empreinte de 63 caractères (400 `input_invalid` en HTTP, erreur de validation sans code en MCP ; C-11 condition 2).

## Décisions C-1 à C-11 appliquées au lot a

| # | Décision | Ce que le lot a en fait |
|---|---|---|
| C-1 | CM-4b ne sert pas le chemin kata (Z-1 confirmé) | lot a non servi ; type local ; ordre grille et péremption avant type, clé, domaine, ligne (condition 5) ; `kata_path_is_not_served` ; aucun ré-épinglage |
| C-2 | B-14 avec motif réduit exact | **bloc D** (servi) ; rien dans ce lot |
| C-3 | condition 2 de Q-3 reportée au G7 du dernier lot de D, cliquet dès CM-4b | cliquet statique, `PENDING` exact, au lot a (voir point 7) ; forme dynamique au dernier lot de D |
| C-4 | tueur « a `calib_*` row defers » en trois formes | forme **pure** : `kata_row_statuses_map_to_regions` (`abstain` vrai sur toute raison `calib_*`) ; forme L3 au bloc C ; forme servie en D |
| C-5 | grammaire seule, un prédicat, bornes par partie | `kataKeyProblem` partagé requête/garde, `policy-guard.ts:51` aligné ; test de parité avec tueur |
| C-6 | \|m\| comparé au double `Number(t)` | vecteurs sur `0.1`, `0.2` et `nextUp` ; prémisse du bloc A citée |
| C-7 | lean nul : `cell_key` = `<predictor_id>`, après tous les 400 | `kataPath` ; tests `alpha` 0.46 ⇒ `policy_alpha_mismatch`, `tau` 1.5 ⇒ `policy_tau_cap` sur un lean nul |
| C-8 | trois paniers, seuils égaux, ligne de seuils fixée | garde de table ; lecture sur la première ligne `current` du côté ; registre synthétique aligné |
| C-9 | trois échéances de LATE-CALL-WINDOW-1 | la péremption lit la constante de B-4 (même source) ; forme avant le G0 de C, valeur avant F-5a, code et vecteurs en D ; la ligne datée de l'ADR-CM (condition 1) est à MONARK |
| C-10 | tables en processus, empreintes synthétiques | `servedPolicyTables` ; empreinte épinglée sur textes synthétiques seulement ; indépendance entre classes testée ; aucun JSON de table |
| C-11 | présence seule de `features_digest` sur le chemin pur | `features_digest_required` sur l'absence ; une empreinte libre passe en appel direct |

## Tests et tueurs (forme fermée, un par test ; adresses fixées au gel)

Fichier neuf `apps/harness/test/kata-path.test.ts` (tous **new-module** : il importe `kata-path.ts`, absent de la base). Tables : registre synthétique de graine 37 de B1 (seuils alignés par côté), projeté et passé par `guardKataTable` avant usage. Aucun test existant n'est modifié ; le support `helpers/synthetic-registry.ts` l'est (point 4).

| Test | Contenu | Tueur |
|---|---|---|
| `kata_grid_on_string_fields` | 1h et 4h, fraction nulle de toute longueur, `.0004`, `:01`, `23:59:60Z`, décalages ; grille avant type et clé | `CONST` du pas de grille |
| `kata_stale_bound_is_300_s` | t + 300 000 admis, + 300 001 refusé ; sans horloge, pas de péremption ; avant type et clé | `ROR` `>` → `>=` |
| `kata_key_grammar` | bornes 64 et 20, panier en trop, horizon, symbole, préfixe, casse, parties vides ; `ETHFIUSDT` ⇒ `under_calib` | `CONST` du contrôle d'horizon |
| `kata_key_predicate_is_shared_with_the_guard` | même verdict requête et garde sur 7 clés | `CONST` du prédicat dans `policy-guard.ts:51` |
| `kata_yhat_domain_and_zero_lean` | bornes du lean et de σ̂, NaN, infinis ; lean ±0 ⇒ champs de C-7 | `ROR` de la borne du lean |
| `kata_zero_lean_answers_after_every_400` | lean 0 avec chaque refus 400 | `SDL` du contrat dans `kataPath` |
| `kata_imposed_params_without_row` | `alpha`, `nMin` sur une table vide, direction et bande | `SDL` du contrôle d'`alpha` |
| `kata_tau_cap_on_set_classes` | `tau` 0 et 1 admis, 1.5 et 2 refusés ; 5 admis sur bande | `ROR` `> 1` → `> 2` |
| `kata_features_digest_required` | absent refusé ; forme libre admise (C-11) | `SDL` du refus |
| `kata_bucket_edges_compare_the_double` | vecteurs C-6, côté `down`, ligne de seuils fixée (C-8), côté sans seuils | `ROR` `<=` → `<` sur t1 |
| `kata_no_row_verdict_fields` | 13 champs recalculés (§11 point 4) sur les tables servies vides | `CONST` de sha256 de `[]` |
| `kata_row_statuses_map_to_regions` | toutes les lignes de direction et de bande synthétiques ; `retired` ; h\* ; `out_of_support` aux bords | `CONST` `abstain: true` → `false` sur `calib_*` |
| `kata_served_tables_digests` | 35 tables triées, lignes, empreintes, déterminisme, empreinte épinglée (textes synthétiques), indépendance | `CONST` de l'ordre liq |
| `guard_thresholds_agree_per_side` | seuils différents dans un côté refusés ; côté à deux paniers refusé | `SDL` du contrôle C-8 |
| `kata_path_is_not_served` | graphe servi sans `kata-path.ts`, `policy-classes.ts`, `policy-guard.ts` | `CONST` d'un import de `server.ts` |
| `every_listed_code_has_a_served_thrower_or_is_pending` | `PENDING` exact ; un lanceur hors du graphe servi ne compte pas | `CONST` du code `task_class_retired` de `gate.ts` |

## Plan de preuve rouge et oracle

- Commits : ce G0 ; tests rouges ; code (gel) ; G7.
- `node scripts/red-proof.mjs --base e6dc5542 --gel <gel> --repo /home/user/monark-governance-c4b --draw 16 --seed 37` : 16 tests jugés, tous new-module, 16 tueurs tirés et tués.
- Ancres : `verifie-ancres.mjs . --touched e6dc5542 HEAD` : 0 dérivé, 0 perdu (la ligne 51 de `policy-guard.ts` est réécrite sur place ; les lignes neuves suivent la ligne 121).
- `tsc --noEmit`, `eslint .`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `npm test` complet à 0 rouge (Node 24.21.0, variables de proxy retirées, TMPDIR propre) ; rejeu de `wave1.json` hors dépôt par la garde changée (32 tables sur 32 attendues : la vague 1 a ses seuils égaux par côté, ses symboles en `*USDT`, un seul lieu). `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé.

## R-25 (mesure du brouillon, `r25()` contre `e6dc5542`)

Code ~150 (`kata-path.ts` ~126, `policy-classes.ts` +16, `policy-guard.ts` +6/−2), tests ~330 (`kata-path.test.ts` ~327, support +4/−1) : **~482 ≤ 547**. Le lot b initial (~200) n'existe plus : B-14 et ses tests vont en D. Règle de coupe si le gel dépasse 547 : arrêt et proposition de découpe (vecteurs et cliquet en un second lot non servi).

## Items liés (hors R-25)

- **NOTICE-1-1-0** : brouillon de RECHERCHES en pièce de `recherches:coordination/pieces/` (Z-4), publié par MONARK à T − D (D = 7 jours). Contenu contractuel : contrat de requête kata, grammaire de clé (C-5), appel direct (C-11), et B-14 (servi en D).
- **SPEC-PUBLISH-PIPELINE-1** (MONARK) : son entrée exacte est donnée au G7 de ce lot (fonction `servedPolicyTables`, commit du gel, forme des textes) (C-10 condition 3).
- **Liste r4** : lignes 8 à 15 déjà portées par la décision ; ce lot n'en ajoute pas.

## Questions

Aucune question de contrat ouverte par cet amendement. Z-1 à Z-6 sont répondues par MONARK (`fd9a6a9`, `0cc319c`) ; Z-2 par le fondateur (D = 7 jours). Deux points restent à confirmer ; ce sont des lectures déclarées, pas des choix neufs :
- le placement du cliquet au lot a (point 7) ;
- la règle de verdict d'une région servie (point 6, dernier tiret).
