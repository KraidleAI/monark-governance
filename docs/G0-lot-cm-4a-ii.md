# G0 du bloc B2 (contrat 1.1.0) : lots CM-4a-ii-a (garde d'import des lignes kata de la vague 1, entrées de classe kata) et CM-4a-ii-b (lignes USDe et liq, LIQ-BAND-EXACT-GUARD-1, queues de la vague 2)

- **Sources** (sha256 des octets LF ; `sha256sum -c` des deux `SHA256SUMS` du dossier r3 : 8 sur 8 et 4 sur 4 OK) :
  - plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` (`3e0da1a6…653c`) : §4 (garde de bande), §5.1, §5.2, §5.2.1, §5.3, §8.3 (ligne B2 : « gardes §5.3 (dont §4), LIQ-BAND-EXACT-GUARD-1, lignes USDe et liq construites et gardées depuis `calibration.ts` », ~400), §8.6 (ordre : A → B1 → **B2** → W2E-TAIL-1 et addendum 8 en parallèle → SERVED-PENDING-1 → C → D) ; plan v1 §5.3 points 1 à 8 (gardés par r3) ;
  - `SPEC-1-1-0-brouillon.md` §9 (table du registre des classes), §10, §11 ;
  - A-2 r3 `recherches:decisions/0004-ADR-amendment-A-2-import-guard.md` (`d883725a…7d12`) : §2.1, §2.2 points 1 à 8, §2.3, §5 (tueurs) ;
  - A-1 `0004-ADR-amendment-A-1.md` (`e96db6fc…e352`) : `calib_cause`, `calib_parent`, dépense ;
  - addendum 8 de l'ADR 0006 `0006-ADR-addendum-8-guard-recomputes-from-counts.md` (`4d03a7e2…b517b`), **gelé**, ligne P0 `ec202d00` dans `KraidleAI/monark-precommitments` : la garde recalcule les queues depuis les comptes ; `tail_m`, `tail_a`, `miss_adj_a` attestés hors ligne ; « the zone exception of Q-F3 stands (MONARK writes `tail.ts` and the guard; the W2-E tests and killers stay with RECHERCHES) » ;
  - ADR 0006 `0006-ADR-draft-wave2.md` v8.1 (`fe48c03a…b4be6`) : D2 (loi exacte de A), D6 (blocs pont et FWD-2) ;
  - décision déléguée `avis/DECISION-PolicyRow-Q1-Q3.md` et table finale de `avis/AVIS-advisor-PolicyRow-Q1-Q3.md` (§1.2 à §1.5) : condition 2, « Garde (B1, B2, CM-4c) : projection et arithmétique ; grammaires de `status_reason`, `calib_cause`, `retire.cause` et `source.*` ; longueur de `scale_table.values` par `kind` ; couplages avec `source.wave` ; refus d'une queue réduite (tueur B2) » ;
  - `recherches:kata/registry/FORMAT.md` (`dc1ec944…03b0`), « Written forms » (littéraux de `calib.reason`, ordre d'évaluation) ;
  - G0 et G7 du bloc B1 (`docs/G0-lot-cm-4a-i.md`, `docs/G7-lot-cm-4a-i.md` sur la base) : ce que B1 passe à B2 (section « Reçu de B1 ») ;
  - G2 de B1 `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-4a-i.md` (`8d99ee9c…e2c3`) : m-1 à m-4 ;
  - message de MONARK `2026-10-04-MONARK-vers-RECHERCHES-131-132-base.md` : #131 (B1) et #132 fusionnées, « B2 et UKEMI-PENDING-1 partent de `7a0b1a49` ».
- **Base** : `origin/base/chantier-moteur-2026-10-03` = **`7a0b1a49`** (refetchée : `+refs/heads/base/chantier-moteur-2026-10-03`). Branche `recherches/cm-4a-ii`, arbre `/home/user/monark-governance-b2c`. Auteur : RECHERCHES. Borne R-25 de lot : 547 (`r25()` de `scripts/oracle/r25.mjs`, pathspec de `ci.yml:82`) ; borne de PR : 1 205.
- **Statut** : G0 écrit avant tout code. Aucune question de contrat ouverte (section « Questions ») : le lot CM-4a-ii-a part de ce G0. La question Q-1 (zone de la garde des queues de la vague 2) ne touche que CM-4a-ii-b.

## Reçu de B1

1. **Coupe R-25 de B1** (G7 de B1, « Coupe R-25 du G0 : appliquée ») : les **32 entrées de classe kata publiées** (`kataClassEntries`), leur test contre la spec §9 et leur tueur `CONST "0.45" -> "0.46"`. B1 construit ses tables avec `syntheticClassEntry` (aide de test).
2. **m-1, reste** : grammaire `YYYY-MM` des clés de `test.months` ; lien `taskClass` ↔ `symbol` ; `row.region_rule` = `class.region_rule` et `horizon` ↔ `h_ms`.
3. **m-2, compagnons** : statut `vetoed` avec `test.vetoed` faux ; `calib.status` jamais comparé au statut (recalcul du statut, A-2 §2.2 point 4).
4. **m-4, constantes** : les 32 entrées, leur test, l'épinglage des constantes de classe (A-2 §2.2 point 2).
5. **Mineures de la G2 de CM-3c-1 (m-1)**, nommées au G0 de B1 pour B2 : `source.trial_id` et `source.wave` nuls sur une ligne `marginal` ; `calib_support.min ≤ max` ; `strata_cuts` non vide ; `qhat` `-0` ; `test_delta < 0.25`.
6. **G7 de B1, Q-1 (lignes remplacées)** et **m-3 (longueur de `scale_table.values`)** : voir plus bas (chaîne A-1, longueurs par `kind`).

## Périmètre exact du bloc B2

Plan §8.3, ligne B2, avec la décision Q-1 condition 2 et le reçu de B1. Tout dans `apps/harness/` (zone RECHERCHES). **Aucun fichier de `packages/contracts/src/` ni de `schemas/`** ; aucun fichier servi ne change (le service lit encore `calibration.ts` et `class-policy.ts`).

| Poste | Source | Lot |
|---|---|---|
| G-1. Entrées de classe kata (32), constantes épinglées | spec §9, plan §5.2.1, A-2 §2.2 point 2 ; reçu 1 et 4 | **a** |
| G-2. Garde d'une ligne kata de la vague 1 : arithmétique depuis les comptes, statut, raison, veto TEST conditionnel, `recompute` et vérificateurs, garde de bande, grammaires, couplages `source.wave` | A-2 §2.2 points 2 à 5, 7, 8 ; plan §4, §5.3 ; décision Q-1 condition 2 ; reçu 2, 3, 5 (part kata) | **a** |
| G-3. Garde d'une table kata : comparaison au registre de B1, puis G-2 sur chaque ligne, contrôles de case (m-1, m-2) | A-2 §2.2 point 1 ; reçu 2, 3 | **a** |
| G-4. Entrées de classe USDe, liq, cascade ; lignes `marginal` construites depuis `calibration.ts` et gardées ; leurs tables | plan §5.1, §5.2.1, A-2 §2.3 ; reçu 5 (part marginale) | ~~b~~ **a** (passé au lot a, section « Mesure au code ») |
| G-5. LIQ-BAND-EXACT-GUARD-1 | plan v1 §5.3 point 6, ADR-CM §10 | ~~b~~ **a** (passé au lot a, section « Mesure au code ») |
| G-6. Vague ≥ 2 : queues recalculées depuis les comptes (addendum 8), refus d'une queue réduite, `tail_m ≤ n − r`, support de A, queue vide ou ≤ `runs_level` sur une ligne `region`, blocs pont et FWD-2, chaîne A-1 au-delà de l'essai 1 | addendum 8 §1, §4 ; A-2 §2.2 points 3, 5, 6 ; décision Q-1 condition 2 | **b**, sous Q-1 |

### G-1. Entrées de classe kata (lot a)

`kataClassEntries(text)` : les 32 `ClassEntry` de la vague 1, telles que le G0 de B1 les décrivait (item 3) : `{btc,eth,bnb,sol}-dir-{1h,4h}` (`set`, `sign-set`, `score`, `label_schema` `up|down`, `alpha` `0.45`, `n_min` 6) et `{btc,eth,bnb,sol}-{range,mae-down,mae-up}-{1h,4h}` (`interval`, `scaled-band`, `scale`, `label_schema` `null`, `alpha` `0.01`, `n_min` 299) ; toutes `per-calibration`, `risk-control`, `test_delta` `0.05`, `h_ms` 3 600 000 ou 14 400 000, `grid` `true`, `kata-bucket`, `cell_key_base` et `strata_cuts` `null`. `n_min` est recalculé par `zeroErrorFloor` ; chaque nom entre dans le motif réservé de la spec §9 ; `text` est un paramètre (Q-3 de B1, valeurs publiées avant F-5a). C'est l'entrée attendue que la garde de table (G-3) passe à `assertTableMatchesRegistry` de B1 : une table dont l'entrée diffère est refusée (m-4).

### G-2. Garde d'une ligne kata (lot a)

`guardKataRow(row, cls, pins)`, `pins` = entrées de projection de B1 (`registryFile`, `registrySha256`, `generator`) plus la **liste fermée des vérificateurs**. Lève au premier écart, en nommant la clé et la règle. Chaque valeur attendue est recalculée par le comparateur exact de `@monark/hikae` (`riskControlMaxExceedances`, `zeroErrorFloor`, `missUpperBound`, `ceilDecimal4`, `splitRankExact`, `binomCdfLeq`, `bandEdge`).

1. **Classe et constantes (A-2 point 2)** : `task_class`, `region_rule`, `statement` (`per-calibration`), `alpha` = ceux de l'entrée de classe ; `horizon` ↔ `h_ms` ; `runs_level` `"0.05"` ; `test_delta` = `spendDelta("0.05", 1)` = `"0.05"` (vague 1 : essai 1, voir 9) et `< 0.25` (`parseTestDelta`) ; `n_min` = `zeroErrorFloor(alpha, test_delta)` ; `aux_seq` = `label` sur `sign-set`, `score` sur bande ; `bound_on` = `commit` (`sign-set`) ou `region` (bande) sur une ligne `region`, `null` ailleurs.
2. **Arithmétique depuis (n, alpha, test_delta) (A-2 point 3)** : `k_star` = k\* exact (`null` s'il n'existe pas) ; sur une ligne calibrée, `p_served` = n − k\* et `p_served` ≥ `splitRankExact(n, alpha)` ; `marginal_alpha` = `ceilDecimal4((n + 1 − p_served) / (n + 1))` ; `miss_bound` = U(n, k\*, test_delta) sur `region`, `null` ailleurs. Direction : `qhat` = 0 si `misses` ≤ k\*, sinon 1 ; `k_obs` = `misses` si `qhat` = 0, sinon 0. Bande : `k_obs` = `misses`. `misses` n'est jamais lu de `k_obs`.
3. **Statut (A-2 point 4), dans l'ordre** : n < n0 (dont n = 0) → `under_calib`, et alors `k_star`, `p_served`, `k_obs`, `misses`, `qhat`, `miss_bound`, `marginal_alpha`, `runs_*`, `recompute` sont nuls ; sinon `misses` > k\*, `runs_aux` ≠ `pass` ou `runs_miss` = `reject` → `silence` ; sinon veto TEST → `vetoed` ; sinon `region`. `row.status` égale ce résultat. Sur une ligne calibrée, `runs_miss` = `empty` ssi `k_obs` ∈ {0, n} (l'indicatrice 1{score > qhat} est constante), ce qui contient « `empty` sur une ligne `region` ssi misses = 0 ».
4. **Raison (grammaire de `status_reason`, FORMAT.md « Written forms », ordre d'évaluation de FORMAT)** : recalculée exactement : n = 0 → `empty bucket` ; n < n0 → `n <n> below n0 <n0>` ; un contrôle `reject` → `dependence check rejects` ; `runs_aux` `empty` → `auxiliary sequence constant (fails closed)` ; `misses` > k\* → `misses <m> above k* <k>` ; sinon `""` ; sur `vetoed`, `vetoed: test` ; sur `retired`, `retired: <retire.cause>`. `empty bucket (no thresholds on this side)` n'a pas de ligne (L-1 de B1).
5. **Veto TEST conditionnel (A-2 point 5)** : sur une ligne dont le statut CALIB (point 3 sans le veto) est `region`, avec `n_test` ≥ 1 et `k_test` non nul : `vetoes.test` = [P(Bin(`n_test`, alpha) ≥ `k_test`) ≤ 0,05] ; sur toute autre ligne, `vetoes.test` = `false` quoi que dise la formule. `u_test` recalculé : `null` si `n_test` = 0 ou `k_test` nul ; `"1"` si `k_test` = `n_test` ; sinon U(`n_test`, `k_test`, 0,05), au niveau du veto (mesuré égal sur les 280 cases de `wave1.json`).
6. **`recompute` (A-2 point 7)** : non nul ssi la ligne est calibrée ; `recompute.scores_sha256` = `scores_sha256` ; `recompute.verifier` dans la liste fermée épinglée ; **identité** du vérificateur ≠ identité de `source.generator`. Lecture déclarée de « identities, not strings » : identité = la chaîne avant le premier `@` (révision ôtée), en minuscules ASCII (`asciiLower` de `calibration.ts`) ; ainsi `kata/bench/write-p2.ts@207f021f` et `KATA/bench/write-p2.ts@other` sont la même identité. La preuve acceptée du rapport (`report_sha256`) est hors ligne (A-2 point 7), non recalculée ici.
7. **Bande (A-2 point 8, plan §4, m-1 de 3c-1)** : sur une ligne de bande calibrée, `qhat` est un double normal (≥ 2^−1022, fini) ; `calib_support` non nul, `min` > 0, `max` fini, `min` ≤ `max` ; `bandEdge(qhat, min)` > 0 ; `bandEdge(qhat, max)` ≠ `null`. Sur toute ligne, `qhat` `-0` est refusé (l'écriture canonique écrit `0` : l'empreinte ne le voit pas).
8. **Longueurs et formes de vague 1 (décision Q-1 condition 2, m-3)** : `scale_table.kind` = `hour-of-week` (`us-profile` : vague 2b, longueur non fixée, refusée) et `values` de 168 à 1h, 42 à 4h ; `fit_sha256` nul.
9. **Couplages avec `source.wave` et A-1 (vague 1)** : `source.wave` = 1, sinon refus nommé « wave ≥ 2 rows need the wave 2 guard » (G-6, lot b) ; en vague 1 : `bridge`, `fwd`, `vetoes.bridge`, `vetoes.fwd`, `tail_frac` et toutes les colonnes `tail_*` et `miss_adj_*` nuls ; `runs_miss` et `runs_aux` non nuls ssi la ligne est calibrée ; `calib_attempt` 1, `calib_cause` `initial`, `calib_parent` `none` (A-1 : `initial` seulement à l'essai 1 ; une ligne de la vague 1 est l'essai 1, FORMAT). **Époque** : `epoch` = 1 tant qu'aucun journal d'événements d'époque n'est épinglé (FORMAT : « from 1 » ; `kata/registry/epoch-events.json` n'existe pas) ; une cause exemptée (`epoch:<id>`, `refresh:<schedule>@<ADR>`) est refusée pour la même raison (A-1 point 4 : « refuses an exemption whose instance id is not in the log »). La chaîne au-delà de l'essai 1 (dépense, parent) n'a aucune ligne admissible en vague 1 : elle va avec G-6.
10. **`source.*` (grammaires)** : `registry_file`, `registry_sha256`, `generator` égaux aux épingles ; `trial_id` = `<task_class>|<kata_id>|<venue>|<symbol>|<horizon>|CALIB` (FORMAT « Written forms »), recomposé des colonnes de la ligne.
11. **`retire` (grammaire, décision Q-1 point 2)** : une ligne `retired` porte `retire.cause` ∈ `live:<k>` (k ≥ 1), `epoch:<id>`, `adr:<fichier .md>` ; comptes non nuls ssi `live:` ; `status_reason` = `retired: <cause>` ; le statut recalculé sans retrait doit être `region` (seule une ligne servie se retire) ; sur `live:`, la règle binomiale du veto s'applique aux comptes du bloc et doit tirer, `u_test` recalculé ; `epoch:` est refusée (aucun journal). Ce qu'une ligne retirée porte au-delà (sort de `qhat` sur une bande) reste à CM-4c (avis §1.2 condition 4).

### G-3. Garde d'une table kata (lot a)

`guardKataTable(table, registryBytes, pins, expected)` (les vérificateurs sont dans `pins` ; signature corrigée après la G2 du lot a, m-6) :
- `assertTableMatchesRegistry` de B1, avec l'entrée attendue de G-1 pour la classe (m-4) ;
- G-2 sur chaque ligne ;
- sur chaque case du registre de la classe (m-1, m-2) : clés de `test.months` en `YYYY-MM` (mois 01 à 12) ; `symbol` = majuscules ASCII, préfixé du symbole de la classe en majuscules (`btc-…` ↔ `BTC…`) ; `calib.status` égal au statut CALIB recalculé de sa ligne ; `test.vetoed` égal à `vetoes.test` recalculé (un `vetoed` à `test.vetoed` faux est refusé par G-2 point 5, la projection recopiant `test.vetoed`).

### G-4 et G-5 (lot b, décrits pour la G2 du bloc)

- **Entrées de classe** (plan §5.2.1) : USDe `stable-run-velocity-24h` (`interval`, `additive-band`, `label`, `marginal`, `split`, `alpha`, `n_min`, `test_delta` nuls (la clé commise impose par sa ligne), `h_ms` nul, `grid` faux, `committed-key`) ; liq (`upper-bound`, `label`, `marginal`, `split`, `alpha` `0.01`, `n_min` 100, `liq-stratum`, `cell_key_base` = `UKEMI_LIQ_PREDICTOR_BASE`, `strata_cuts` = `STRATA_CUTS_SERVED`, non vide, < 2^53) ; cascade (`additive-band`, `committed-key`, aucune ligne).
- **Lignes `marginal`** (A-2 §2.3) construites depuis `calibration.ts` (`CommittedCalibration` et `class-policy.ts`) : `n`, `p_served` = `splitRankExact`, `qhat` = `splitQuantileExact`, `marginal_alpha`, `scores_sha256` = `scoresSha256` du tableau stocké dans son ordre déclaré (`time` pour USDe ; `ascending` pour liq, et le tableau stocké doit alors être croissant) ; liste fermée de colonnes (contrôle fermé du bloc A) ; `source.trial_id` et `source.wave` nuls ; `cell_key` USDe = la clé commise, liq = `${base}/s<k>` égale à la clé commise ; `status` `region`, `status_reason` `""`, `calib_attempt` 1. `source.registry_file`, `registry_sha256`, `generator` et les textes : paramètres (Q-3 de B1).
- **LIQ-BAND-EXACT-GUARD-1** : pour la strate k, max ŷ = `strata_cuts[k] − 1`, ou 2^53 − 1 pour la dernière strate (domaine `liq_yhat_domain` : entier sûr ≥ 0) ; refus si `qhat` > 2^53 − max ŷ (comparaison exacte : les deux membres sont des entiers ≤ 2^53, représentables). s0 passe (q̂ = 126 184 298 996) ; une ligne s3 forgée de même q̂ est refusée.
- Tueurs prévus (A-2 §5) : q̂ ou `scores_sha256` altéré ; empreinte USDe sur une copie triée ; `k_star`, `k_obs` ou `miss_bound` non nul ; `p_served` ou `order` nul ; la ligne s3.

### G-6 (lot b, sous Q-1)

Addendum 8 §1 : r = ceil(n × `tail_frac`) ; `tail_m` ≤ n − r ; A dans max(0, 2m − n − 1) ≤ A ≤ m − 1 ; `tail_tail_num/den` et `miss_adj_tail_num/den` recalculés (loi exacte de D2, P(A ≥ a) = Σ_{j=1}^{m−a} C(m − 1, j − 1) C(n − m + 1, j) / C(n, m)), **non réduits** (`den` = C(n, m)) : une queue réduite par le PGCD est refusée ; queue vide (`tail_m` = 0) ou queue ≤ `runs_level` sur une ligne `region` refusée ; `tail_frac` épinglé (0.95 à 1h, 0.90 à 4h) ; blocs pont et FWD-2 par la règle du veto ; chaîne A-1 (parents, dépense) au-delà de l'essai 1.

## Lecture déclarée (aucun choix de contrat)

- **« A row whose status is not `region` and that carries a servable region (a `qhat` that would serve, or a `miss_bound`) is refused »** (A-2 point 4). `qhat` d'une ligne est fixé par le point 3 (direction : 0 ou 1 selon misses et k\* ; bande : la valeur du registre) ; une ligne `silence` de direction à misses ≤ k\* (contrôle `reject`) porte donc `qhat` 0, comme les 7 cases du pli de B-1 de B1. Le service ne lit la région que par le statut (spec §9 : `silence`, `vetoed`, `retired` → `{up, down}`, `qhat` 1, ou aucune région) : la garde refuse `miss_bound` et `bound_on` hors `region` (G-2 points 1 et 2) et la valeur de `qhat` contraire au point 3. C'est la lecture que la G2 de B1 a appliquée (B-1).
- **Vague ≥ 2 au lot a** : refusée en bloc (fail-closed), en nommant le lot qui la garde. Aucune ligne de vague 2 n'existe ni n'est servie avant CM-4c (bloc E, après T0).

## Différences servies

**Aucune.** Les modules neufs ne sont importés par aucun module servi ; le test `policy_modules_are_not_served` de B1 (`policy-table-file.test.ts`) n'est pas modifié ; un test du lot étend la même vérification aux modules neufs. `calibration.ts`, `class-policy.ts`, `gate.ts` et les modules de B1 inchangés.

## Tests prévus et tueurs en forme fermée (lot a)

Fichiers neufs (new-module au red-proof) : `apps/harness/src/policy-classes.ts`, `apps/harness/src/policy-guard.ts`, `apps/harness/test/policy-guard.test.ts`. Tables bâties sur le registre synthétique de graine 37 de B1 (aucune régénération), entrées de G-1, vérificateur `verifier-b`, générateur `synthetic-generator`. Un tueur par test (adresses fixées au gel) :

| Test | Contenu | Tueur (forme ; tueur d'A-2 §5 couvert) |
|---|---|---|
| `kata_class_entries_match_spec_section_9` | 32 entrées, valeurs de la spec §9, `n_min` = `zeroErrorFloor`, motif réservé, `assertClosedClassEntry` | `CONST "0.45" -> "0.46"` |
| `guard_admits_every_synthetic_table` | les 32 tables du synthétique passent `guardKataTable` ; statuts `region`, `silence`, `vetoed`, `under_calib` présents | `SDL` d'un contrôle de case (m-1 `test.months`) |
| `guard_refuses_arithmetic_off_the_counts` | `k_star` ± 1, `miss_bound` changé, `marginal_alpha` changé, `p_served` changé, `n_min` 7 refusés | `CONST` de la comparaison de `k_star` (« an altered k_star, miss_bound or marginal_alpha is admitted ») |
| `guard_direction_qhat_and_misses` | `misses` lu de `k_obs` : direction silencieuse forgée `k_obs` 0, `misses` 306, n 728 en `region` refusée ; direction à misses ≤ k\* et `qhat` 1 refusée | `CONST` lecture `misses` → `k_obs` (deux tueurs d'A-2 §5) |
| `guard_status_and_reason_recomputed` | `silence` ou `vetoed` relabellisée `region` refusée ; `silence` à `miss_bound` refusée ; raison altérée refusée ; `under_calib` (n < n0) **admise** ; `calib.status` incohérent refusé (m-2) | `SDL` du refus de statut |
| `guard_test_veto_conditional` | `region` dont le veto tire refusée ; `silence` dont la formule « vetoerait » **admise** avec `vetoes.test` faux ; `vetoed` à `vetoes.test` faux refusée ; `u_test` altéré refusé | `CONST` de la condition (`"region"` → `"silence"`) |
| `guard_recompute_and_verifiers` | `recompute` nul sur ligne calibrée ; `recompute.scores_sha256` différent ; vérificateur hors liste ; vérificateur = générateur à la casse près ou à une autre révision ; `recompute` non nul sur `under_calib` | `CONST` de l'identité (`asciiLower` ôté) |
| `guard_band_edges_and_support` | `bandEdge(qhat, min)` = 0 refusée (`qhat` 1e-300 et `calib_support.min` 1e-30 ; `qhat` 2^−1022 et `min` 1e-20 ; `qhat` sous-normal refusé) ; `max` sans bord fini ; `min` > `max` ; `qhat` `-0` refusé | `ROR "> 0" -> ">= 0"` (plan §4) |
| `guard_wave_couplings_and_grammars` | `source.wave` 2 refusée ; `bridge` non nul en vague 1 ; `tail_frac` non nul ; `scale_table` de 7 valeurs ou `us-profile` ; `epoch` 2 ; `calib_cause` `epoch:EE-1/x` ; `trial_id` altéré ; `region_rule` ou `horizon` contraire à la classe ; `retire` : grammaire, comptes, `epoch:` refusée, `live:` admise quand la règle tire | `SDL` du refus de `source.wave` |
| `guard_modules_are_not_served` | graphe d'import servi n'atteint ni `policy-classes.ts` ni `policy-guard.ts` | `CONST` d'un import de `server.ts` |

## Rejeu sur `wave1.json` (hors dépôt, plan §5.3 point 8)

Dans un dossier de travail effacé après : lecture de `recherches:kata/registry/wave1.json` (`811fcd57…d9cb`), projection de B1 (épingles : sha256 des octets, `generator` `kata/bench/write-p2.ts@207f021f`, attestation synthétique `verifier-b`), 32 tables bâties avec G-1, `guardKataTable` sur chacune. Attendu : 280 lignes, 32 tables sur 32 admises. Mesure préalable (sonde du G0) : k\*, U et `UTest` égaux au recalcul sur 280 cases ; les 40 lignes de bande calibrées passent la garde de bande ; raisons et contrôles dans les 7 combinaisons que G-2 point 4 dérive (230 `misses … above k* …` à `check1` `empty`, 9 `dependence check rejects` de direction, 37 de bande, 2 `region`, 2 `vetoed`) ; `epoch` = 1 partout ; clés de `test.months` en `YYYY-MM` partout.

## Oracle

`tsc --noEmit`, `eslint` (fichiers changés), `lint:ratchet`, `gate:vocab`, `lang:gate`, `npm test` complet à 0 échec (Node 24.21.0, variables de proxy retirées, TMPDIR propre ; test 42 relancé seul s'il est seul rouge), `node scripts/red-proof.mjs --base 7a0b1a49 --gel <gel> --repo /home/user/monark-governance-b2c --draw <n> --seed 37`, R-25 ≤ 547.

## R-25 (estimation) et coupe

| Poste | Lot a | Lot b |
|---|---|---|
| G-1 entrées kata | ~25 | — |
| G-2, G-3 garde kata (vague 1) | ~150 | — |
| G-4 entrées USDe, liq, cascade ; lignes `marginal` et leur garde | — | ~70 |
| G-5 LIQ-BAND-EXACT-GUARD-1 | — | ~10 |
| G-6 vague 2 (queues, blocs, chaîne A-1) | — | ~60 |
| tests | ~290 | ~190 |
| **Total** | **~465** | **~330** |

Le bloc entier (~795) dépasse 547 : **coupe en deux lots empilés d'une même PR** (plan §8.3 : un bloc est une PR ≤ 1 205, un lot ≤ 547), CM-4a-ii-a puis CM-4a-ii-b. La coupe suit la seule dépendance ouverte : G-6 attend Q-1 ; G-4 et G-5 n'attendent rien et partent avec G-6 dans le lot b. Si la mesure du lot a dépasse 547, `guard_wave_couplings_and_grammars` perd la part `retire` (G-2 point 11), qui passe au lot b.

## Questions

**Q-1 (pour MONARK ; non bloquante pour le lot a, bloquante pour G-6 du lot b) : zone de la garde des queues de la vague 2.**
- La décision Q-1 (condition 2) met « le refus d'une queue réduite (tueur B2) » au bloc B2, et A-2 §5 liste à CM-4a le tueur « a wave 2 region row with a tail at or below runs_level, or an empty tail, is admitted ».
- L'addendum 8 (gelé, P0 `ec202d00`) garde l'exception de zone de Q-F3 : « MONARK writes `tail.ts` and the guard; the W2-E tests and killers stay with RECHERCHES ». Le plan v1 §5.3 point 5 (gardé par r3) dit « appel de la garde `class-policy-v2` de MONARK », et le plan r3 §9.3 M-3 met l'entrée en comptes dans `tail.ts` (W2E-TAIL-1, MONARK), en parallèle après B2 (§8.6). Ni `tail.ts` ni cette garde ne sont sur la base (`git ls-files` à `7a0b1a49` : 0).
- Ce n'est pas un choix de contrat (la règle est fixée par l'addendum 8 : comptes, support de A, queues non réduites, `den` = C(n, m)), mais une question de zone et d'ordre.
- **Proposition (a), par défaut** : W2E-TAIL-1 livre dans `@monark/hikae` l'entrée en comptes (par exemple `adjacencyTailFromCounts(n, m, a)` → `{num, den}` non réduits, `bigint`) ; le lot b l'appelle depuis la garde du harnais et porte les tests et tueurs W2-E (queue réduite, `tail_m` > n − r, A hors support, queue vide ou ≤ `runs_level` sur `region`). (b) MONARK lève l'exception pour l'arithmétique des comptes côté garde, et le lot b l'écrit. Jusqu'à la réponse, le lot a refuse toute ligne de vague ≥ 2.

**Q-2 (information, pour la G2) : identité d'un vérificateur.** Lecture du G-2 point 6 (chaîne avant `@`, minuscules ASCII). Les identités publiées et la liste fermée restent à la ligne datée de MONARK avant F-5a (Q-3 de B1) ; le lot les prend en paramètre.

**Q-3 (information) : époque et causes exemptées.** Tant qu'aucun journal `epoch-events.json` n'est épinglé, `epoch` = 1 et toute cause `epoch:` ou `refresh:` est refusée (A-1 point 4). La grammaire des identifiants d'instance sera fixée par le lot qui épingle le journal (EPOCH-EVENTS-1, CM-4c) ; aucune ligne de la vague 1 n'en dépend (mesuré : `epoch` = 1 sur 280).

## Mesure au code : G-4 et G-5 passent au lot a (2026-10-04)

Après G-1 à G-3 (commits `066e8021`, `f4394af3`), R-25 mesuré contre `7a0b1a49` : **312** (estimation du G0 : ~465). G-4 et G-5 n'attendent aucune réponse ; ils entrent donc au lot a (commits `371fa31e`, `b85da486`), sous la borne : **464**. Le lot b ne porte plus que **G-6** (vague ≥ 2, sous Q-1). Tests et tueurs ajoutés : `apps/harness/test/policy-marginal.test.ts` (4 tests, un tueur chacun ; tueurs d'A-2 §5 pour USDe et liq) ; `guard_modules_are_not_served` couvre aussi `policy-marginal.ts`. Écart déclaré à G-4 : la classe cascade prend `region_rule` `additive-band`, lu du verdict servi (`cascadeVerdict` → `conformInterval`, intervalle symétrique), le plan §5.2.1 ne nommant que `committed-key`.

## Pli de la G2 du lot a (2026-10-04)

G2 `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-4a-ii-lot-a.md` : **APPROUVE**, mineures m-1 à m-6. Base refetchée : `origin/base/chantier-moteur-2026-10-03` toujours à `7a0b1a49` (#133 pas encore poussée sur la base), aucune fusion. Chaque pli de code a son test rouge d'abord (commit `d6894e3a`) et son tueur en forme fermée :

| Mineure | Pli | Test (tueur) |
|---|---|---|
| m-1 | `order` = `time` et `current` épinglés sur une ligne kata de vague 1 (`policy-guard.ts:48`) | `guard_pins_order_time_and_current` (`:48 CONST`) |
| m-2 | refus nommé « k_test above its n_test » sur `test` et `retire`, avant tout appel binomial (`:56`) ; refus nommé « misses outside 0..n » (`:64`) | `guard_names_k_test_above_n_test` (`:56 SDL`), `guard_names_misses_above_n` (`:64 SDL`) |
| m-3 | la liste épinglée des vérificateurs doit être faite d'identités (minuscules, sans révision), sinon refus nommé (`:88`) ; choix : exiger, pas normaliser en silence | `guard_requires_verifier_pins_as_identities` (`:88 SDL`) |
| m-4 | `adr:` restreint à `adr:decisions/<nom>.md`, `..` refusé (`:80`) | `guard_adr_cause_under_decisions_only` (`:80 CONST`) |
| m-5 | motifs resserrés : `/declares the order ascending…/` ; bord LIQ à `edge + 1` ; clause propre de la garde (`miss_bound or bound_on off the region rule`) ; `miss_bound` sur `silence` : redondance déclarée, le bloc A refuse d'abord (motif du bloc A) ; message de `source.wave` qui nomme la valeur (nulle : ligne marginale) | tests existants, tueurs inchangés |
| m-6 | signature de G-3 corrigée ; table du périmètre : G-4 et G-5 au lot a | docs |

**Ligne pour la révision suivante des pièces** (non éditées ici) : le choix `region_rule` = `additive-band` pour la classe cascade (lu de `cascadeVerdict` → `conformInterval`, jugé « justifié » par la G2) doit entrer au plan §5.2.1 et à la spec §9-§10 **avant que le bloc C publie l'entrée de classe** avec son fichier de table ; MONARK le contrôle au G0 du bloc C.
