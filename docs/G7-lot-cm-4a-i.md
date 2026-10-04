# G7 du lot CM-4a-i (contrat 1.1.0, bloc B1)

- **Plan** : `docs/G0-lot-cm-4a-i.md` (commits `92c170ec` et `9f9c59de`, reprise sur les réponses de MONARK) ; plan r3 §8.3 (ligne B1), §5.2.1, §5.3 ; A-2 r3 §2.2 point 1 ; table « colonne | type | obligatoire | source » et projection §1.4 de `avis/AVIS-advisor-PolicyRow-Q1-Q3.md`, décision `avis/DECISION-PolicyRow-Q1-Q3.md`.
- **Réponses de MONARK** : `recherches` `2c723d2` (Q-1 voie (a), Q-2 L-1 acceptée, Q-3 valeurs par défaut pour B1, Q-4 à l'étape 7) et `491e3b3` (ligne P0 publiée).
- **Porte d'ordre (Q-1)** : addendum 8 de l'ADR 0006, `0006-ADR-addendum-8-guard-recomputes-from-counts.md`, sha256 `4d03a7e2e3cf2e9f745acc75048dfc0d9527ae8ccff7a97aa4a11250afed517b`, publié en ligne P0 dans `KraidleAI/monark-precommitments`, commit **`ec202d00`** (16:57:45Z). Fichier gelé ; ce lot ne le touche pas.
- **Base** : `880654ed` (`base/chantier-moteur-2026-10-03`, refetchée à la reprise : inchangée, aucun rebase). **Gel** : `bddb5a3a` (branche `recherches/cm-4a-i`, non poussée). Commits : `92c170ec` (G0), `9f9c59de` (G0 repris), `afce32a5` (tests rouges), `bddb5a3a` (code, gel), ce commit (G7).
- **Statut** : G2 reçue le 2026-10-04 (approuvé avec corrections, 1 bloquante B-1) et pliée : **nouveau gel `4e6d2b35`** (section « Pli de la G2 »). En attente du contrôle par diff de MONARK. Rien n'est poussé.

## Ce que le lot change

Tout dans `apps/harness/` ; **aucun fichier existant modifié** ; aucun fichier de `packages/contracts/src/` ni de `schemas/` ; manifeste figé fermé (`contracts_frozen` vert sans ré-épinglage).

- `apps/harness/src/policy-projection.ts` (118 lignes) :
  - `readRegistryCell` : lecteur fermé d'une case (`FORMAT.md`, « Row fields », 26 champs ; `calib` 13 clés, `test` 5 dont `months` `{n, k}` fermé, `drops`, `calibSupport`, `thresholds` fermés ; `live1` nul). Refus nommé au chemin de la case : clé en trop ou absente, type ou littéral hors liste, `key` non recomposée de ses champs, champs de direction et d'échelle mêlés, `factorTableSha256` différent de `sha256Canonical(hourOfWeekFactors)`.
  - `readRegistry` : `{plan, engine, trialRegistryHead, rows}` fermé, chaque case par le lecteur.
  - `projectCell` : la table du G0, colonne par colonne. `n_min` par `zeroErrorFloor`, `marginal_alpha` par `ceilDecimal4((n + 1 − rank) / (n + 1))`, `misses` lu de `calib.misses` seulement, `miss_bound` et `bound_on` sur `region` seulement, `status_reason` `vetoed: test` sur `vetoed`, `runs_*` `n/a` → `null`, `runs_level` `"0.05"`, `recompute` requis sur toute case calibrée (refus sinon), `source.wave` 1. **L-1** : une direction sans seuils ne rend aucune ligne si la case est `under_calib` de raison `empty bucket (no thresholds on this side)` ; sinon refus. Chaque ligne projetée passe `assertClosedPolicyRow` avant d'être rendue.
- `apps/harness/src/policy-table-file.ts` (75 lignes) : `kataClassEntries(text)` (les 32 entrées de la spec §9, `n_min` recalculé par `zeroErrorFloor`) ; `assertPolicyTableFile` (contrôle fermé du bloc A, lignes de la seule classe, tri strict par (`task_class`, `cell_key`, `calib_attempt`) en unités de code, une seule ligne `current` par case) ; `buildPolicyTable` ; `policyTableSha256` = `sha256Canonical(table)` ; `assertTableMatchesRegistry(table, registryBytes, inputs)` (sha256 des octets = épingle ; chaque ligne égale colonne par colonne, en écriture canonique, la projection de sa case ; aucune ligne sans case ; aucune case projetable sans ligne ; premier écart nommé par classe, clé et colonne).
- `apps/harness/test/helpers/synthetic-registry.ts` (89 lignes) : registre synthétique de même forme que `wave1.json`, graine 37 (mulberry32), aucune donnée de marché. 32 classes, 8 katas, 72 cases (48 de direction, 24 d'échelle, tables de 168 et 42 facteurs) ; 69 lignes projetées : `region` 20, `silence` 30 (`misses … above k* …` et `dependence check rejects`), `vetoed` 10, `under_calib` 9 (`n … below n0 …`), plus 3 cases L-1 sans ligne (côté `down` de `eth-dir-4h`). k* par `riskControlMaxExceedances`, `rank` = n − k*, U et `UTest` par `missUpperBound`, veto TEST conditionnel d'A-2 §2.2 point 5 par le comparateur exact (`testVetoFires`). Rien de généré n'est commité.
- Tests : `apps/harness/test/policy-projection.test.ts` (9) et `apps/harness/test/policy-table-file.test.ts` (7).

**Écarts au G0, déclarés** : le test `table_file_sorted_unique_one_current` est coupé en `table_file_sorted_and_keyed` et `table_file_one_current_per_cell` ; les refus d'altération de `table_matches_registry_byte_for_byte` passent dans `table_refuses_rows_off_the_projection` ; 16 tests au lieu de 14. Tueurs : ceux du G0, sauf le `SDL` de la mise à `null` de `miss_bound` (couverte par les assertions de `projection_silence_and_vetoed_rows` et par le contrôle fermé), remplacé par les tueurs de `hour-of-week`, `n/a`, `recompute.scores_sha256`, de l'absence de ligne et du registre synthétique.

## Différences servies

**Aucune.** Les deux modules neufs ne sont importés par aucun module servi : `policy_modules_are_not_served` parcourt les imports relatifs depuis `server.ts`, `http.ts`, `openapi.ts`, `schema-projection.ts` et `tools/*.ts` (il atteint `class-policy.ts`, pas les modules neufs). `calibration.ts`, `class-policy.ts` et `gate.ts` inchangés ; `served-replay-cm3` vert sans changement.

## Oracle (Node 24.21.0, variables de proxy retirées)

- `node scripts/red-proof.mjs --base 880654ed --gel bddb5a3a --repo /home/user/monark-governance-c3c2 --draw 16 --seed 37` : **OK**, sortie 0 ; **16 jugés, tous new-module**, 0 inchangé ; **16 tueurs tirés, 16 tués** ; `RED-PROOF.json` sha256 `5a560fa7b7b52727dad60ab6cec65637f7ea9428ea6e4aa0000279780d60dfe9` (dépend des chemins du passage).
- Tueurs (forme fermée, un par test) : `policy-projection.ts:101 CONST "commit"→"region"` ; `:97 CONST "hour-of-week"→"us-profile"` ; `:110 CONST "vetoed: test"→"vetoed: bridge"` ; `:104 CONST c.misses→c.kObs` ; `:79 CONST "n/a"→"n/b"` ; `:87 SDL` (refus L-1) ; `:113 CONST` (`recompute.scores_sha256` lu de `auxSha256`) ; `:58 SDL` (recomposition de `key`) ; `:107 CONST "0.05"→"0.5"` (`runs_level`) ; `policy-table-file.ts:19 CONST "0.45"→"0.46"` ; `:39 ROR ">= 0"→"> 0"` (tri) ; `:42 SDL` (deux `current`) ; `:63 SDL` (sha256 du registre) ; `:74 SDL` (case sans ligne) ; `test/helpers/synthetic-registry.ts:75 CONST n - kStar→n - kStar + 1` (module de support importé statiquement) ; `apps/harness/src/server.ts:32 CONST "./version.ts"→"./policy-table-file.ts"` (graphe servi).
- `verifie-ancres.mjs --ref 880654ed` : gel 840 tueurs, 830 ANCRE, DERIVE 0, PERDU 10 ; base 824 tueurs, 814 ANCRE, PERDU 10 ; **les 10 PERDU sont les mêmes** (`hikae` `l1-split`, `ci.yml`, `scripts/oracle/run.mjs`). Aucune ancre existante ne bouge.
- `tsc --noEmit` vert ; `eslint` (5 fichiers neufs) propre ; `lint:ratchet` 69/69 ; `gate:vocab` OK (340 fichiers) ; **`lang:gate` vert**. Le risque du G0 (`auxSeq`, `auxSha256`) ne s'est pas réalisé ; le seul mot attrapé en cours de lot était un suffixe de chaîne `:aux` de l'aide de test, renommé `:second`. `lang-exempt.json` non touché.
- `npm test` complet : **2 215 tests, 2 193 verts, 22 sautés, 0 rouge** (test 42 compris).
- **R-25** (`r25()` de `scripts/oracle/r25.mjs` contre `880654ed`) : STAT **539** (+539/−0, 5 fichiers), borne du lot 547, borne de PR 1 205 ; CONTENT_STAT 0. La coupe déclarée au G0 (entrées de classe kata vers B2) n'a pas été nécessaire.

## Questions

**Q-1 (information, pour la G2 et B2) : lignes remplacées.** `assertTableMatchesRegistry` compare une ligne par case (vague 1 : une calibration par case, `current` vrai). Une table qui garde une ligne remplacée (`current` faux, spec §10) pour la même case serait refusée (« a row without a registry cell ») : la projection d'une recalibration A-1 (`calib_attempt` > 1, `calib_parent`) n'a pas de source dans le format du registre de la vague 1. À régler avec la voie de recalibration (A-1) ou en CM-4c, pas en B1.

**Q-2 (information) : clés partagées entre classes.** Dans `wave1.json`, une même `key` d'échelle porte plusieurs classes (par exemple `kata:ewma-vol-hw-v1@binance/BTCUSDT/1h/b0` en `range`, `mae-down` et `mae-up`) : la case est la paire (`taskClass`, `key`), comme le dit `FORMAT.md`. La comparaison se fait classe par classe ; le synthétique ne reproduit pas ce partage (une kata d'échelle par classe), ce que le test sur `wave1.json` dans le rejeu de la G2 couvrira.

**Q-3 (rappel, avant F-5a)** : valeurs publiées des entrées hors registre (`source.registry_file`, `source.generator`, vérificateurs, textes de ligne et de classe) : paramètres dans ce lot, ligne datée de MONARK avant F-5a.

## Pli de la G2 (2026-10-04)

- **Revue** : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-4a-i.md`, réviseur neuf. Verdict : approuvé avec corrections, **1 bloquante (B-1)**, 5 mineures (m-1 à m-5). A-2 relu : §2.2 point 3, §5.
- **Commits** (sur `a59dd757`, non poussés) : `aefaa0fc` (test rouge de B-1), **`4e6d2b35` (code, nouveau gel)**, ce commit (G7, et une ligne au G0 pour la coupe). Base inchangée : `880654ed`.

### B-1 (bloquante) : pliée

- **Tests d'abord** : `aefaa0fc` ajoute `synthetic_registry_counts_follow_a2` (`policy-table-file.test.ts`). Sur chaque case calibrée du registre de graine 37 : en direction, `qhat` = 1 ssi misses > k\*, et `kObs` = 0 si `qhat` = 1, sinon `misses` ; en bande, `kObs` = `misses` ; sur une case CALIB `region`, `check1` = `empty` ssi misses = 0 ; une case `silence` à misses <= k\* porte un `reject` (`check1` ou `check2`), qui justifie sa raison. **Rouge sur l'aide d'alors** (mesuré : 7 verts, 1 rouge, `[1, 0]` contre `[0, 30]` sur `btc-dir-1h …/1h/up-b3`).
- **Écart déclaré** : les assertions sont dans un test neuf, pas dans `synthetic_registry_is_seeded_and_shaped`, pour garder un tueur par test (convention de `red-proof.mjs`) : le tueur de l'ancien test reste, le neuf a le sien.
- **Code** (`4e6d2b35`, `apps/harness/test/helpers/synthetic-registry.ts`) : `qhat` de direction tiré de (misses, k\*) (l.58), `kObs` qui en suit (l.62), `check1` `empty` ssi `kObs` = 0 (l.63) ; `check2` reste `reject` sur le plan `silence-runs`. Les 7 cases de la G2 ont maintenant `qhat` 0, `kObs` = misses, `check2` `reject` et gardent la raison `dependence check rejects`. Registre de graine 37 : sha256 des octets `077e580e0f0f64bc8ecb0f338489f8ec8d0a34d6bcc548295418d1765978c090` (avant : `39468a3c…f118`) ; 21 cases de direction `silence` (14 à `qhat` 1 et misses > k\*, 7 à `qhat` 0 et `check2` `reject`). Statuts projetés inchangés (69 lignes, 3 cases L-1).

### Coupe R-25 du G0 : appliquée

B-1 seul portait R-25 à **551** (> 547). Comme le G0 le prévoit, `kataClassEntries` (`policy-table-file.ts`) et `kata_class_entries_match_spec_section_9` **passent au bloc B2**. Les tests de B1 prennent leurs entrées de classe de `syntheticClassEntry` (aide de test, forme de la spec §9) ; B2 apportera les 32 entrées publiées, leur test et leur tueur (`CONST "0.45" -> "0.46"`).

### Mineures prises (dans B1, sous la borne)

- **m-4** : `assertTableMatchesRegistry(table, registryBytes, inputs, expected)` prend l'entrée de classe attendue et refuse une table dont `class` diffère en écriture canonique (`policy-table-file.ts:47`). Test `table_class_entry_is_the_expected_one` (`alpha` `0.46`, `n_min` 7 refusés), tueur `:47 SDL`. Les entrées attendues publiées viennent de B2 (ci-dessus).
- **m-2** : `projectCell` refuse `calib.rank` ≠ n − k\* (et `rank` non nul sans k\*) (`policy-projection.ts:94`). Test `projection_rank_is_n_minus_k_star` (chaque case calibrée, `rank` + 1 refusé), tueur `:94 SDL`.
- **m-3** : le lecteur refuse `hourOfWeekFactors` d'une longueur autre que 168 à 1h, 42 à 4h (`:61`).
- **m-1** (en partie) : le lecteur refuse des `thresholds` sur une case d'échelle (`:59`), `calibAttempt` ≠ 1 (littéral `1`, `:43`), un `taskClass` dont l'horizon ou la famille (`-dir-` ssi `side` non nul) ne suit pas la case (`:60`) ; `readRegistry` refuse une paire (`taskClass`, `key`) répétée (`:70`). Une direction classée sous `sol-range-4h` est donc refusée à la lecture.
- **m-5** : `scale_table.sha256` sans repli `?? ""` (`as string` ; `assertClosedPolicyRow` refuserait un nul).
- **Tueurs** : m-4 et m-2 ont chacun le leur ; m-3 et m-1 sont des refus assertés dans `registry_cell_closed_reader` (4 cases forgées) et le test de `rank` (paire répétée), sans tueur propre (un tueur par test, borne R-25).

### Mineures non prises, et leur porteur

- **m-1, reste** : grammaire `YYYY-MM` des clés de `test.months` (non projetées, liées par la sha256 du registre) ; lien `taskClass` ↔ `symbol` ; dans `assertPolicyTableFile`, `row.region_rule` = `class.region_rule` et `horizon` ↔ `h_ms` (pour une table comparée au registre, couverts par le lien lu et par m-4). **Porteur : G0 de B2 (CM-4a-ii), garde d'import.**
- **m-2, compagnons** : `status` `vetoed` avec `test.vetoed` faux ; `calib.status` jamais comparé à `status`. **Porteur : B2** (recalcul du statut, A-2 §2.2 point 4).
- **m-4, constantes** : les 32 entrées de classe kata publiées, leur test (spec §9) et l'épinglage des constantes de classe (A-2 §2.2 point 2). **Porteur : B2** (coupe ci-dessus).

### Oracle du pli (Node 24.21.0, variables de proxy retirées, TMPDIR dans un dossier de travail propre)

- `tsc --noEmit` vert ; `eslint` (5 fichiers) propre ; `lint:ratchet` 69/69 ; `gate:vocab` OK (340 fichiers) ; `lang:gate` OK.
- `node --test` des deux fichiers neufs : **18/18** (10 + 8).
- `node scripts/red-proof.mjs --base 880654ed --gel 4e6d2b35 --repo /home/user/monark-governance-c3c2 --draw 18 --seed 37` : **OK**, 18 jugés, tous new-module, 0 inchangé, **18 tueurs tirés, 18 tués** ; `RED-PROOF.json` sha256 `3d0231547462beb712af336cafa0b54808f4571499376fdc8d85982561f043fa` (dépend des chemins du passage).
- `verifie-ancres.mjs --ref 880654ed` : 842 tueurs, 832 ANCRE, DERIVE 0, PERDU 10 (les 10 mêmes qu'au premier gel).
- `npm test` complet : passages (1) et (2) : 1 rouge chacun, le test 42 au seul mode connu (EXPORT-TEST42-SUMMARY-1 : `npm run ci` exporté sorti à 0, ligne de synthèse non capturée) ; test 42 seul : vert ; passage (3) : **2 243 tests, 2 221 verts, 22 sautés, 0 rouge**.
- **Rejeu sur `wave1.json`** (`811fcd57…d9cb`, hors dépôt, script en dossier de travail puis effacé) : 280 cases lues (nouveaux refus du lecteur compris), **280 lignes**, **32 tables sur 32** passent `assertTableMatchesRegistry` avec l'entrée attendue ; 0 case de direction hors de la règle d'A-2 §2.2 point 3.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs` contre `880654ed`) : STAT **547** (+547/−0, 5 fichiers), borne du lot 547 (égalité verte), borne de PR 1 205 ; CONTENT_STAT 0.
