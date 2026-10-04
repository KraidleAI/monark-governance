# G0 du lot CM-4a-i (contrat 1.1.0, bloc B1) : fichier de table de classe, projection registre → ligne, comparaison octet pour octet, table kata synthétique

- **Sources** :
  - plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` (sha256 `3e0da1a617cf5385f6567ec998b33a79fcde00e06d3de3392af47ff9ae07653c`) : §5.2, §5.2.1, §5.3, §8.3 (ligne B1), §8.6, §9.1, §9.3 (M-3). `sha256sum -c SHA256SUMS` du dossier : 6 pièces et 2 décisions OK ; `avis/SHA256SUMS` : 4 sur 4 OK ;
  - `SPEC-1-1-0-brouillon.md` (`975bb40c…7b9d`) §9, §10, §11, §16 ;
  - `AMENDEMENT-ADR-CM-r3.md` (`774a5601…d0d0`) §2 (R-25 en blocs A, B1, B2, C, D ; Q-F3, l.116) ;
  - A-2 r3 `recherches:decisions/0004-ADR-amendment-A-2-import-guard.md` (`d883725a…7d12`) §2.1, §2.2 points 1 et 4, §5 ;
  - addendum 3 de l'ADR 0005, `0005-ADR-addendum-3-contract-1-1-0.md` (`9647f743…586a`) ;
  - addendum 8 de l'ADR 0006, `0006-ADR-addendum-8-guard-recomputes-from-counts.md` (sha256 `4d03a7e2e3cf2e9f745acc75048dfc0d9527ae8ccff7a97aa4a11250afed517b`, octets du blob git, LF ; dernier commit `recherches` `fdd8744`) : contrôlé par MONARK et **publié en ligne P0** dans `KraidleAI/monark-precommitments`, commit **`ec202d00`** (`PRECOMMITMENTS.md`, push reçu par GitHub à 16:57:45Z le 2026-10-04). Fichier **gelé** : toute retouche passe par un addendum 9 ;
  - décision déléguée `avis/DECISION-PolicyRow-Q1-Q3.md` (`117eb289…37ba4`) et avis `AVIS-advisor-PolicyRow-Q1-Q3.md` (`d54c3443…12b0a`) : table « colonne | type | obligatoire | source » et projection §1.4, approuvées par MONARK (`recherches` `3e2fe0c`) ;
  - décision déléguée `avis/DECISION-Q-F3.md` ;
  - format du registre `recherches:kata/registry/FORMAT.md` (`dc1ec944…03b0`) ; forme lue sur `wave1.json` (`811fcd57…d9cb`), hors dépôt public (plan §5.3 point 8) ;
  - réponses de MONARK à ce G0 : `recherches` `2c723d2` (`coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-reponses-G2-L2-Q1-CM-4a.md`, Q-1 voie (a), Q-2 à Q-4) et `491e3b3` (`…-P0-publiee-sigterm.md`, ligne P0 `ec202d00` publiée, « le code de CM-4a-i (B1) peut partir ») ;
  - messages de MONARK `recherches` `17b2196` (pile L2 au tronc, contrôle de #126, correction de forme du G7 de CM-3c-1) et `8e5ac53` (#126 fusionnée sur la base en `880654ed`, « le bloc suivant part de `880654ed` »).
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `880654ed` (fusion de #126, CM-3c-1). Les lots 1.1.0 fusionnent sur cette base jusqu'à T0 (ADR-PUBLIC-CADENCE-1 §17). Branche `recherches/cm-4a-i`, arbre `/home/user/monark-governance-c3c2`. Auteur : RECHERCHES. Borne R-25 du lot : 547 lignes comptées contre `880654ed` (`scripts/oracle/r25.mjs`, pathspec de `ci.yml:82`).
- **Statut** : G0 écrit et arrêté avant le code (commit `92c170ec`), puis **repris le 2026-10-04 sur les réponses de MONARK** : Q-1 levée par la voie (a) (ligne P0 de l'addendum 8, `ec202d00`), Q-2 (lecture L-1) acceptée, Q-3 (valeurs par défaut) acceptée pour B1, Q-4 notée pour l'étape 7. Base remesurée à la reprise : `origin/base/chantier-moteur-2026-10-03` = `880654ed`, inchangée, aucun rebase. Le code part de ce G0 (section « Réponses de MONARK »).

## Pourquoi ce lot

Plan §8.6, ordre : B0 → actes de MONARK → **A** (CM-3c-1, fusionné, `880654ed`) → **B1** (CM-4a-i) → B2 (CM-4a-ii) → (W2E-TAIL-1 et addendum 8, en parallèle) → SERVED-PENDING-1 et acte §3 → C (CM-3c-2, CM-3c-3) → D. Le bloc qui suit A est donc B1, pas CM-3c-2. Le bloc C n'est pas prêt non plus : SERVED-PENDING-1 (MONARK, « avant le G0 du bloc C », plan §8.5) n'est pas sur la base (`git grep harness-pending\|pending_since 880654ed` : 0). L'acte §3 de `TEXTES-ACTES-MONARK.md` (ADR-M011 §7, deux lignes B-16 de l'ADR-M002) est en place depuis `43d90ac9`.

## Périmètre (plan §8.3, ligne B1, exactement)

« Fichier de table de classe, projection, comparaison octet pour octet, table kata synthétique. Servi : aucun (le service lit encore `calibration.ts` et `class-policy.ts`). » Tout dans `apps/harness/` (zone RECHERCHES). **Aucun fichier de `packages/contracts/src/` ni de `schemas/`** : D9-ter n'ouvre le manifeste figé qu'aux blocs A et C ; le lot lit `PolicyRow`, `ClassEntry`, `assertClosed*` et `sha256Canonical` du bloc A sans les changer.

1. **Lecteur fermé d'une case du registre** (`apps/harness/src/policy-projection.ts`). Les 26 champs de `FORMAT.md` (« Row fields »), tous présents, aucun en trop ; sous-objets `calib` (13 clés), `test` (5 clés), `drops` (2), `calibSupport` (2), `thresholds` (2) fermés de même. Types et littéraux de `FORMAT.md` : `status` ∈ {`under_calib`, `silence`, `region`, `vetoed`} ; `calib.check1`, `check2` ∈ {`pass`, `reject`, `empty`, `n/a`} ; `horizon` ∈ {`1h`, `4h`} ; `key` = `kata:<kataId>@<venue>/<symbol>/<horizon>/<bucket>`, recomposée des champs ; `factorTableSha256` = sha256 de l'écriture canonique de `hourOfWeekFactors` (parité 40 sur 40 mesurée par l'avis). Refus nommé (`Error`, le chemin de la case dans le message) : la projection ne lit jamais une case qui ne passe pas ce lecteur.
2. **Projection d'une case en ligne `class-policy-v2`** (A-2 §2.2 point 1 ; avis §1.4 et table finale), déterministe, colonne par colonne :

   | Ligne | Depuis la case |
   |---|---|
   | `row_format`, `current` | `"class-policy-v2"`, `true` (vague 1 : une calibration par case) |
   | `task_class`, `cell_key`, `region_rule` | `taskClass` ; `key` ; `sign-set` si `side` non nul, sinon `scaled-band` |
   | `kata_id`, `w`, `venue`, `symbol`, `horizon`, `side`, `bucket`, `thresholds` | `kataId`, `W`, `venue`, `symbol`, `horizon`, `side`, `bucket`, `thresholds` tels quels (480 seuils de la vague 1 déjà en écriture aller-retour la plus courte, mesuré) |
   | `scale_table` | `{kind: "hour-of-week", values: hourOfWeekFactors, sha256: factorTableSha256}` sur une case d'échelle, sinon `null` |
   | `calib_support`, `fit_sha256` | `calibSupport` ; `null` (vague 2b) |
   | `statement`, `alpha`, `test_delta`, `calib_attempt` | `per-calibration` ; `alpha` ; `testDelta` ; `calibAttempt` |
   | `calib_cause`, `calib_parent`, `epoch` | `initial`, `none` (A-1, vague 1) ; `epoch` |
   | `bound_on`, `tau_cap` | `commit` (`sign-set`) ou `region` (bande) sur une ligne `region`, sinon `null` ([W2] D7 (a)) ; `1` sur `sign-set`, sinon `null` |
   | `n_min` | n0 de la ligne, `zeroErrorFloor(alpha, testDelta)` de `@monark/hikae` (6 et 299 à 0.05) |
   | `n`, `k_star`, `p_served`, `k_obs`, `misses`, `qhat` | `calib.n`, `kStar`, `rank`, `kObs`, `misses`, `qhat` (`misses` jamais lu de `kObs`) |
   | `miss_bound` | `calib.U` si `status` = `region`, sinon `null` |
   | `marginal_alpha` | 1 − `rank` / (n + 1) arrondi vers le haut à 4 décimales (`ceilDecimal4`), si `rank` existe, sinon `null` |
   | `aux_seq`, `order` | `auxSeq` ; `order` (`time`) |
   | `runs_miss`, `runs_aux` | `calib.check1`, `check2`, `n/a` → `null` |
   | `tail_frac`, `tail_*`, `miss_adj_*` | `null` (vague 1) |
   | `runs_level` | `"0.05"` (A-2 §2.2 point 2) |
   | `test`, `bridge`, `fwd`, `vetoes` | `{k_test: kTest, n_test: nTest, u_test: UTest}` ; `null` ; `null` ; `{test: test.vetoed, bridge: null, fwd: null}` |
   | `status`, `status_reason`, `retire` | `status` ; `calib.reason`, ou `vetoed: test` sur `vetoed` (avis §1.4) ; `null` |
   | `scores_sha256`, `aux_sha256`, `series_sha256` | `calib.scoresSha256`, `calib.auxSha256`, `seriesSha256` |
   | `source` | `{registry_file, registry_sha256, trial_id: trialId, wave: 1, generator}` |
   | `recompute` | sur une ligne calibrée (statut ≠ `under_calib`) : `{verifier, scores_sha256: calib.scoresSha256, report_sha256}` de l'attestation de la case ; sinon `null` |
   | `text` | le texte de la ligne pour sa `region_rule` |

   **Entrées hors registre** (ni `FORMAT.md` ni `wave1.json` ne les portent) : `registry_file`, `registry_sha256` (sha256 des octets du fichier), `generator`, l'attestation `recompute` par case (`verifier`, `report_sha256` ; rapport du recalcul aveugle de MONARK, A-2 §2.2 point 7) et le texte par `region_rule`. Ce sont des **paramètres** de la projection : le lot n'en fixe aucune valeur publiée (Q-3). La projection lève si une case calibrée n'a pas d'attestation.

   **Côté sans seuils** (lecture L-1, ci-dessous) : une case de direction à `thresholds` nul ne donne **aucune ligne**. Elle doit être `under_calib`, de raison `empty bucket (no thresholds on this side)` ; sinon refus.
3. **Entrées de classe kata** (`apps/harness/src/policy-table-file.ts`) : les 32 `ClassEntry` de la vague 1, depuis la table de la spécification §9 et le plan §5.2.1 : `{btc,eth,bnb,sol}-dir-{1h,4h}` (`region_kind` `set`, `sign-set`, `qhat_unit` `score`, `label_schema` `up|down`, `alpha` `0.45`, `n_min` 6) et `{btc,eth,bnb,sol}-{range,mae-down,mae-up}-{1h,4h}` (`interval`, `scaled-band`, `scale`, `label_schema` `null`, `alpha` `0.01`, `n_min` 299) ; toutes `statement` `per-calibration`, `method` `risk-control`, `test_delta` `0.05`, `h_ms` 3 600 000 ou 14 400 000, `grid` `true`, `cell_key_rule` `kata-bucket`, `cell_key_base` et `strata_cuts` `null`. Le `text` de classe est un paramètre (Q-3). `n_min` est recalculé par `zeroErrorFloor` et comparé à la table (tueur). Les entrées USDe, liq et cascade vont au bloc B2, avec leurs lignes.
4. **Fichier de table de classe** (spec §10) : `buildPolicyTable(class, rows)` rend `{row_format: "class-policy-v2", class, rows}` ; lignes triées par (`task_class`, `cell_key`, `calib_attempt`), ordre des unités de code (celui de `canonicalJson`) ; refus d'une clé de tri en double, de deux lignes `current` pour un même (`task_class`, `cell_key`), d'une ligne d'une autre classe ; `assertClosedPolicyTable` du bloc A sur le résultat ; `policyTableSha256(table)` = `sha256Canonical(table)`. Une table par classe : le fichier d'une classe ne dépend d'aucune autre (test).
5. **Comparaison octet pour octet** (A-2 §2.2 point 1, plan §5.3 « Projection (B-2) ») : `assertTableMatchesRegistry(table, registryBytes, pins)`. La sha256 des octets du registre égale l'épingle et `source.registry_sha256` de chaque ligne ; pour chaque ligne, `canonicalJson(row)` égale `canonicalJson(projection de sa case)` ; chaque case projetable de la classe a exactement une ligne ; aucune ligne sans case ; les cases sans ligne sont exactement celles de L-1. Le premier écart est nommé (classe, clé, colonne).
6. **Table kata synthétique** (`apps/harness/test/helpers/synthetic-registry.ts`, plan §5.3 point 8 et BLQ-DEP-6) : un registre de même forme que `wave1.json`, généré à graine (graine 37, générateur pseudo-aléatoire déterministe, aucune donnée de marché) : 32 classes, 8 katas, cases de direction et d'échelle, tables de 168 et 42 facteurs, et les cinq statuts utiles au garde : `region`, `silence` (deux raisons), `vetoed`, `under_calib` (dont un côté sans seuils). Ses valeurs sont **arithmétiquement cohérentes** avec la règle exacte : k* par `riskControlMaxExceedances`, `rank` = n − k*, U par `missUpperBound`, `UTest` et `vetoed` par la règle conditionnelle d'A-2 §2.2 point 5 ; le bloc B2 y branche ses gardes sans régénérer. Ses octets sont le registre de test, avec leur sha256 calculée au test ; aucun fichier généré n'est commité.

Rien d'autre : ni arithmétique de garde (B2), ni bande (§4, B2), ni LIQ-BAND-EXACT-GUARD-1 (B2), ni lignes USDe et liq (B2), ni chemin servi (CM-4b), ni queues de vague 2 (W2E-TAIL-1, MONARK).

## Différences servies

**Aucune.** Les deux modules neufs ne sont importés par aucun module servi (`server.ts`, `http.ts`, `tools/**`, `openapi.ts`, `schema-projection.ts`) ; un test le vérifie sur le graphe d'import. `calibration.ts`, `class-policy.ts` et `gate.ts` ne changent pas. Le rejeu épinglé de CM-3a (`apps/harness/test/served-replay-cm3.test.ts`) reste vert sans changement ; `contracts_frozen` reste vert sans ré-épinglage.

## Lecture L-1 (acceptée par MONARK, Q-2) : pas de ligne pour un côté sans seuils

- Plan §5.4 point 6 : « Direction sans seuils (aucune ligne du côté) : `cell_key` = `<predictor_id>/<side>` et `under_calib` ».
- Spec §9 (« With no row for the side (no thresholds) ») et §11 point 4 : le recalcul d'un verdict sans ligne vérifie qu'« aucune ligne courante n'a de `cell_key` qui commence par `<cell_key>-` ».
- Si la projection écrivait une ligne `under_calib` pour les cases `…/up-b1` à `…/up-b3` d'un côté sans seuils, ce contrôle du §11 échouerait sur un verdict servi correct. A-2 §2.2 point 1 dit « chaque ligne égale la projection de sa case », pas « chaque case a une ligne » ; et les seuils sont gelés au SELECT, avant la CALIB, donc l'absence de ligne ne dépend d'aucune issue de calibration (`FORMAT.md` : « none removed for its outcome »).
- La vague 1 n'a aucune case de ce genre (0 sur 280, mesuré). La lecture ne change donc aucun octet de la vague 1 ; elle fixe la règle pour la suite, et la comparaison exige que les cases sans ligne soient exactement celles-là.

## Tests prévus (new-module, un tueur en forme fermée chacun)

`apps/harness/test/policy-projection.test.ts` :
- `projection_direction_region_row` : `sign-set`, `tau_cap` 1, `bound_on` `commit`, `miss_bound` = U, `status_reason` `""`, `vetoes` `{test: false, bridge: null, fwd: null}`, `n_min` 6, `marginal_alpha` recalculé ;
- `projection_band_region_row` : `scale_table` (`hour-of-week`, 168 ou 42 valeurs, `sha256` = `factorTableSha256` = `sha256Canonical(values)`), `calib_support`, `bound_on` `region`, `tau_cap` `null`, `n_min` 299 ;
- `projection_silence_and_vetoed_rows` : `miss_bound` et `bound_on` nuls ; `status_reason` recopié, ou `vetoed: test` ;
- `projection_misses_never_from_k_obs` : direction silencieuse, `kObs` 0 et `misses` 324 → `misses` 324 ;
- `projection_under_calib_row` : `n/a` → `null`, `recompute` `null`, `k_star`, `p_served` et `marginal_alpha` nuls quand k* n'existe pas ;
- `projection_side_without_thresholds_has_no_row` (L-1) ;
- `projection_inputs_outside_the_registry` : `recompute.scores_sha256` = celle de la case ; une case calibrée sans attestation lève ; `source` et `text` repris des paramètres ;
- `registry_cell_closed_reader` : clé en trop, clé absente, littéral hors liste, `key` incohérente avec ses champs, `factorTableSha256` faux : refusés ;
- `projected_rows_pass_the_closed_check` : toutes les lignes projetées du registre synthétique passent `assertClosedPolicyRow`.

`apps/harness/test/policy-table-file.test.ts` :
- `kata_class_entries_match_spec_section_9` : 32 entrées, valeurs de la table, `n_min` = `zeroErrorFloor`, noms dans le motif réservé, `assertClosedClassEntry` vert ;
- `table_file_sorted_unique_one_current` : ordre (`task_class`, `cell_key`, `calib_attempt`), refus d'une clé en double, de deux `current`, d'une ligne d'une autre classe ; `policy_table_sha256` = `sha256Canonical` ; le fichier d'une classe ne bouge pas quand une autre change ;
- `table_matches_registry_byte_for_byte` : vert sur le synthétique ; refus de chaque altération des tueurs d'A-2 §5 qui relèvent de la projection (`k_test`, `calib_support`, `thresholds`, `n`, `alpha` `0.46` sur une direction), d'une ligne en trop, d'une ligne manquante, d'octets du registre dont la sha256 diffère ;
- `synthetic_registry_is_seeded_and_shaped` : même graine, mêmes octets ; forme de `FORMAT.md` ; les cinq statuts présents ; k*, `rank` et U cohérents ;
- `policy_modules_are_not_served` : le graphe d'import des modules servis n'atteint pas les deux modules neufs.

Tueurs prévus (formes ; les adresses sont fixées au gel) : `CONST "commit" -> "region"` (`bound_on`) ; `SDL` de la mise à `null` de `miss_bound` hors `region` ; lecture `calib.misses` → `calib.kObs` ; `CONST "vetoed: test"` ; `CONST "0.05"` de `runs_level` ; `ROR` du comparateur de tri ; `SDL` du refus de deux `current` ; `CONST "0.45" -> "0.46"` d'une entrée de classe ; `SDL` du contrôle de la sha256 du registre ; `SDL` du refus d'une ligne pour un côté sans seuils.

## Oracle

`tsc --noEmit`, `lint` (fichiers changés), `lint:ratchet`, `gate:vocab`, `lang:gate`, `npm test` complet à 0 échec (Node 24.21.0, variables de proxy retirées), `node scripts/red-proof.mjs --base 880654ed --gel <gel> --repo /home/user/monark-governance-c3c2 --draw <n> --seed 37`, `verifie-ancres.mjs --ref 880654ed` (aucune ancre existante ne bouge : aucun fichier existant n'est modifié hors des docs), R-25 ≤ 547.

Risque `lang:gate` : le lecteur nomme les clés du registre `auxSeq` et `auxSha256` (format gelé par `FORMAT.md`), qui ne sont pas les trois termes de D7 decies (`aux_seq`, `runs_aux`, `aux_sha256`). Si le garde les attrape, je ne touche pas `lang-exempt.json` (plume de MONARK) : je le signale au G7 avec la mesure, comme Q-L au bloc A.

## R-25 (estimation)

| Poste | Lignes |
|---|---|
| lecteur fermé du registre | ~45 |
| projection | ~75 |
| entrées de classe kata | ~30 |
| fichier de table et comparaison | ~55 |
| registre synthétique (aide de test) | ~110 |
| tests | ~210 |
| **Total** | **~525** |

Le plan estimait ~540. La marge sous 547 est mince. **Coupe déclarée si la mesure dépasse** : les entrées de classe kata et leur test (~60) passent au bloc B2 (~400 au plan), qui les lit de toute façon pour `alpha` et `n_min` ; le reste de B1 ne change pas.

## Questions

**Q-1 (bloquante, pour MONARK) : porte d'ordre avant le G0 de CM-4a.**
- Le plan r3 §9.1 point 2 et §9.3 (M-3), A-2 r3 §2.2 point 6, `AMENDEMENT-ADR-CM-r3.md` §2 (Q-F3, l.116) et `DECISION-Q-F3.md` (« Suite ») placent tous l'addendum 8 de l'ADR 0006, **contrôlé par MONARK et publié en ligne P0**, avant le premier G0 de CM-4a.
- État mesuré : `KraidleAI/monark-precommitments` (tête `36c0982`, 2026-10-01) ne porte qu'une ligne, ADR 0005 v3.1. L'addendum 8 est un brouillon, en contrôle léger chez toi (`…-P1-a3-livre.md` l.30) ; aucune issue de ce contrôle dans la boîte.
- Le §8.6 du même plan met l'addendum « en parallèle » après B2. C'est un écart interne du plan ; je retiens la règle écrite trois fois (avant le G0 de CM-4a).
- Ce lot ne touche aucune queue de la vague 2 : il ne lit ni ne fixe rien de ce que règle l'addendum 8 (les colonnes `tail_*` et `miss_adj_*` valent `null` en vague 1 et leur forme est figée depuis le bloc A).
- **Deux voies** : (a) tu contrôles l'addendum 8 et tu publies sa ligne P0 (avec celles d'A-2 r3, d'A-1 et des addenda de l'ADR 0005 que A-2 §5 liste), puis je reprends ce G0 au code ; (b) tu déclares que la porte vaut pour le G0 de CM-4a-ii (B2, qui porte les gardes et le point 6 d'A-2) et non pour celui de CM-4a-i, et je reprends tout de suite. Je n'écris pas de code avant ta réponse.

**Q-2 (non bloquante, pour MONARK) : L-1.** Si tu lis le §11 autrement (une ligne `under_calib` par case sans seuils, et le contrôle « sans ligne » du §11 réécrit), c'est un choix de contrat : je le porterais à un advisor sous la délégation du fondateur avant le G0 de B2. Défaut du lot : L-1, avec refus fermé de toute autre forme ; aucun octet de la vague 1 n'en dépend.

**Q-3 (non bloquante, avant F-5a) : valeurs publiées des entrées hors registre.** `source.registry_file` (proposé : `wave1.json`, le nom dans le dépôt de la spécification), `source.generator` (proposé : `kata/bench/write-p2.ts@207f021f`, l'`engine` du registre), la liste fermée des vérificateurs (A-2 §2.2 point 7, épinglée par le garde en B2), le `text` de chaque ligne et de chaque classe (spec §10 ; textes servis, porte de vocabulaire de MONARK, CM-4b). Le lot les prend en paramètres et n'en publie aucune ; le test les remplit de valeurs synthétiques.

**Q-4 (information, pour MONARK) : registre de l'ADR-CM.** `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` s'arrête à l'amendement « 2026-10-04 (2) », sur la base comme au tronc. L'amendement « 2026-10-04 (3) » (contrat 1.1.0, `AMENDEMENT-ADR-CM-r3.md` §2), que citent déjà l'ADR-M001 (D9-ter), l'ADR-M002, l'ADR-M011 §7 et ADR-PUBLIC-CADENCE-1 §17, n'y est pas, ni la réparation du registre (plan §8.1 étape 7, §9.3 M-1). Il porte entre autres la règle R-25 en blocs, que ce lot applique. Ce n'est pas un rouge de ce lot ; je le note pour que la PR de documentation de l'étape 7 le reprenne.

**Mineures de la G2 de CM-3c-1 (m-1)** : `source.trial_id` et `source.wave` nuls sur une ligne `marginal`, `calib_support.min ≤ max`, `strata_cuts` non vide, `qhat` `-0`, `test_delta < 0.25` : toutes au bloc B2 (lignes `marginal`, arithmétique et garde). B1 n'en porte aucune.

## Réponses de MONARK (2026-10-04, `recherches` `2c723d2` et `491e3b3`)

- **Q-1 : voie (a).** MONARK a contrôlé l'addendum 8 (support de A, r = ceil(n × tail_frac), comptes dépendant de l'ordre liés par `scores_sha256` et vérifiés hors ligne, D2 inchangé) et, sur le go de l'investisseur (« Publier maintenant (Recommandé) »), a publié sa ligne P0 : `KraidleAI/monark-precommitments` commit **`ec202d00`**, fichier `0006-ADR-addendum-8-guard-recomputes-from-counts.md`, sha256 `4d03a7e2e3cf2e9f745acc75048dfc0d9527ae8ccff7a97aa4a11250afed517b`. La porte d'ordre du plan (§9.1 point 2, §9.3 M-3) est franchie ; le code de B1 part. Le fichier est gelé : ce lot ne le touche pas et ne le lit pas (aucune queue de vague 2 en B1).
- **Q-2 : lecture L-1 acceptée.** Une direction sans seuils n'a pas de ligne ; tout autre cas est refusé (la case doit être `under_calib`, de raison `empty bucket (no thresholds on this side)`).
- **Q-3 : valeurs par défaut acceptées pour B1.** Les entrées hors registre restent des paramètres ; les tests les remplissent de valeurs synthétiques. Les valeurs publiées seront arrêtées par une ligne datée avant F-5a.
- **Q-4 : notée.** L'amendement ADR-CM « 2026-10-04 (3) » entre par la PR de documentation de l'étape 7 (item ADR-CM-AMEND-3-1 d'ETAT), pas par ce lot.
