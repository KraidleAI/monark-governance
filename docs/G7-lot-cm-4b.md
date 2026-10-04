# G7 du lot CM-4b-a (contrat 1.1.0) : chemin kata pur et non servi

- **Plan** : `docs/G0-lot-cm-4b.md` amendé (commit `58f0d8bb`), sur la décision déléguée C-1 à C-11 (`recherches` `29fb1c2`), les réponses de MONARK Z-1 à Z-6 (`fd9a6a9`, `0cc319c`) et l'arbitrage du fondateur sur D (**D = 7 jours**).
- **Base** : `e6dc5542` (`origin/base/chantier-moteur-2026-10-03`, refetchée : inchangée, aucune fusion). **Gel** : `871b2965`. Commits : `e592d469` (G0 initial), `58f0d8bb` (G0 amendé), `095b7792` (tests rouges), `871b2965` (code, gel), ce commit (G7). Branche `recherches/cm-4b` ; rien n'est poussé, aucune PR ouverte.
- **Statut** : prêt pour la G2 et le contrôle par diff de MONARK (Z-6 : `policy-guard.ts` de B2 change).

## Ce que le lot change

Tout dans `apps/harness/` ; aucun fichier de `packages/`, `schemas/`, `apps/site/`, `scripts/`, ni de `apps/harness/src/tools/`.

- `apps/harness/src/kata-path.ts` (126 lignes, neuf, non servi) :
  - `assertKataProducedAt` : grille sur les champs de la chaîne, puis péremption avec `nowMs` ;
  - `assertKataRequest` : contrat de requête dans l'ordre du G0 (grille et péremption, type, `features_digest`, clé, domaine, `alpha` et `nMin` imposés, `tau` ≤ 1) ;
  - `kataVerdictFields` : clé, panier au double, ligne, région, raisons ;
  - `kataPath` : le contrat d'abord, puis la recherche ; `non_evaluable` après tous les 400 ;
  - `servedPolicyTables` (C-10) ;
  - type local `KataVerdictFields` et `KATA_REASONS` (9 raisons).

  Les exports de `tools/gate.ts` (`HarnessToolError`, `rfc3339Instant`, `PRODUCED_AT_FUTURE_TOLERANCE_MS`) ne sont lus qu'à l'appel.
- `apps/harness/src/policy-classes.ts` (+16) : `kataKeyProblem`, la grammaire de clé partagée (C-5), ajoutée en fin de fichier.
- `apps/harness/src/policy-guard.ts` (+6/−2) :
  - la ligne 51 appelle `kataKeyProblem`. Elle est réécrite sur place, et le symbole est désormais borné à 2..20 ; `kataId` et `venue` sont bornés à 1..64 et suivent leur grammaire ;
  - `guardKataTable` exige, après les lignes à tueurs épinglés, trois paniers et des seuils égaux par côté (C-8).
- `apps/harness/test/helpers/synthetic-registry.ts` (+4/−4, même nombre de lignes) : le registre prend les seuils de `b1` pour les trois paniers d'un côté. Les tirages sont gardés, donc les autres champs ne changent pas. Les adresses de tueurs de support (`policy-table-file.test.ts:83`, `:99`) ne bougent pas.
- `apps/harness/test/kata-path.test.ts` (327 lignes, neuf) : 16 tests, un tueur chacun.

**Écarts au G0 amendé** : aucun. Le premier passage du support ajoutait trois lignes et faisait dériver deux ancres de support. Il a été refait à nombre de lignes égal avant le gel (le commit de tests a été recréé, rien n'était poussé).

## Différences servies : aucune (preuve)

- **Diff** : `git diff e6dc5542 871b2965` ne touche ni `apps/harness/src/tools/`, ni `http.ts`, `server.ts`, `openapi.ts`, `schema-projection.ts`, `calibration.ts`, `class-policy.ts`, ni `apps/site/`, `scripts/`, `packages/`, `schemas/`, `docs/deploy-CA-harness.json` (diff vide sur ces chemins).
- **Graphe servi** : `kata_path_is_not_served` (ce lot) et `guard_modules_are_not_served` (B2) verts. `kata-path.ts`, `policy-classes.ts` et `policy-guard.ts` sont hors du graphe d'import servi.
- **Octets servis, base contre gel** : harnais en processus, script hors dépôt.

  | Surface | sha256 (base = gel) |
  |---|---|
  | `GET /openapi.json` (miroir JSON, 19 920 octets) | `d605b912916cc679d4347299bf7d22bb77bf8e1af4c502dd18e2213e6d2a38d7` |
  | `tools/list` (MCP, 16 488 octets) | `7dfcbd9eed4640b86a9b9b362ba4ec8393b18007d1c9516b96158c0500a29eac` |
  | `apps/site/data/harness-served.json` | `77d7b9143e8b6c03bb9f5670941f2550499fbc7cf687fb8bf76ff5542cf61fb1` |
  | corps de la CA : `scripts/verify-harness.mjs` | `8f540258751de979df320c477c6a3dcb34eb1151de549cd65b73f69e3d66af8d` |
  | corps de la CA : `docs/deploy-CA-harness.json` | `edbe345d82bb62094601d5a9405e897fa654c16a106dc7ce5954a20388794a4d` |

  Les cinq empreintes sont **identiques** entre `e6dc5542` et `871b2965`.
- **Tests épinglés** : `harness_served_data_matches_in_process_harness`, `served-replay-cm3`, `contracts_frozen` (sans toucher `test/contracts-frozen.manifest.json`) et le reste de `npm test` sont verts (section « Oracle »). Aucun instantané en attente n'est requis.

## Oracle (Node 24.21.0, variables de proxy retirées, TMPDIR propre, effacé à la fin)

- **red-proof** : `node scripts/red-proof.mjs --base e6dc5542 --gel 871b2965 --repo /home/user/monark-governance-c4b --draw 16 --seed 37` : **OK**, sortie 0. **16 jugés, tous new-module**, 0 inchangé, **16 tueurs tirés, 16 tués**. `RED-PROOF.json` sha256 `3a786cefaf56693080183ddd33d5ef384604c1b2e26f7ae3e0a3d9764a828e17` (dépend des chemins).
- **Tueurs** (forme fermée, un par test, tous tués) :
  - `kata-path.ts` :
    - `:50 CONST` (pas de grille), `:51 ROR` (péremption `>` → `>=`) ;
    - `:60 SDL` (`features_digest`), `:63 ROR` (borne du lean) ;
    - `:64 SDL` (`alpha` imposé), `:66 ROR` (`tau` > 1 → > 2) ;
    - `:79 ROR` (`<=` → `<` sur t1), `:82 CONST` (sha256 de `[]`) ;
    - `:91 CONST` (`abstain` des raisons `calib_*`), `:106 SDL` (contrat avant `non_evaluable`), `:122 CONST` (ordre liq) ;
  - `policy-classes.ts:42 CONST` (horizon de la clé) ;
  - `policy-guard.ts` : `:51 CONST` (prédicat partagé), `:124 SDL` (C-8) ;
  - `server.ts:31 CONST` (graphe servi) ;
  - `tools/gate.ts:927 CONST` (cliquet).
- **Ancres** (`verifie-ancres.mjs`) :
  - `. --touched e6dc5542 HEAD` : 16 tueurs, 16 ancrés, 0 dérivé, 0 perdu ;
  - arbre entier : 903 tueurs, 893 ancrés, 0 dérivé, 10 perdus. Ce sont **les mêmes 10 qu'à la base**, mesurés à `e6dc5542` : 887, 877, 0, 10, dans `test/oracle-run.test.ts` et ailleurs hors du harnais. Aucun ne vient de ce lot.
- `tsc --noEmit` vert ; `eslint .` sortie 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK.
- **`npm test` complet au gel** : **2 292 tests, 2 269 verts, 22 sautés, 1 rouge**, sortie 1. Le seul rouge est le test 42 (`export_public_no_governance_no_french`), avec le message « exported CI ran an implausibly small suite ». C'est un effet de charge : le red-proof tournait en même temps sur la même machine.
  - Relancé seul (mode EXPORT-TEST42-SUMMARY-1), au même gel : 1 test, 1 vert, 0 rouge.
  - La suite a donc 0 rouge imputable au lot.
- **Rejeu de `wave1.json`** (`811fcd57…`, hors dépôt ; script en dossier de travail, effacé ; épingles du G7 de B2 : sha256 des octets, générateur `kata/bench/write-p2.ts@207f021f`, attestation synthétique `verifier-b`) :
  - 280 lignes ; **32 tables sur 32** admises par `guardKataTable` changée (grammaire de clé C-5 et seuils C-8 compris) ; statuts `silence` 276, `region` 2, `vetoed` 2, inchangés ;
  - en plus, pour chacune des 280 lignes, `kataVerdictFields` sur un `yhat` pris au milieu de son panier (ou de son support) retrouve la `cell_key` de la ligne : **280 sur 280**.

  Aucune série ni valeur brute n'est versée dans un dépôt.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, contre `e6dc5542`) : STAT **485** (+479/−6) ≤ 547 ; CONTENT_STAT 0.
- `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas indexé ; aucun `git add -A`.

## Décisions C-1 à C-11 : tenue au gel

| # | Tenue |
|---|---|
| C-1 | non servi (preuve ci-dessus) ; type local ; ordre grille et péremption avant le type, la clé et le domaine, testé (`kata_grid_on_string_fields`, `kata_stale_bound_is_300_s`) |
| C-3 | `PENDING` exact = `input_invalid`, `json_invalid`, `kata_key_invalid`, `kata_yhat_domain`, `features_digest_required`, `policy_tau_cap`, `produced_at_off_grid`, `produced_at_stale` ; tout autre code sauf `output_invalid` a son littéral dans le graphe servi ; un lanceur de `kata-path.ts` ne compte pas |
| C-4 | forme pure : `calib_silence`, `calib_vetoed`, `calib_retired` rendent `{up, down}`, q̂ 1, `abstain` vrai (direction) ; aucune région, `abstain` vrai (bande) |
| C-5 | un prédicat, deux appelants ; parité requête/garde sur 7 clés, dont un symbole de 21 caractères et un `venue` en majuscules (acceptés par la garde de base, refusés des deux côtés au gel) |
| C-6 | vecteurs `0.1` et `0.2` (doubles au-dessus de leurs décimales) avec `nextUp` ; côté `down` aux seuils du registre |
| C-7 | lean ±0 ⇒ `cell_key` = `predictor_id`, `non_evaluable`, champs de la classe ; refusé d'abord par chaque 400 |
| C-8 | garde : trois paniers et seuils égaux ; service : seuils de la première ligne `current` du côté, testé sur une table où `b2` et `b3` portent d'autres seuils |
| C-9 | péremption à 300 s par `PRODUCED_AT_FUTURE_TOLERANCE_MS` (même source que B-4) |
| C-10 | 35 tables, triées, déterministes ; empreinte épinglée sur textes synthétiques seulement ; changer le texte d'une classe ne change que son empreinte |
| C-11 | `features_digest` : présence seule ; `"x"` passe en appel direct |
| C-2 | rien ici : B-14 va en D |

## Entrée de SPEC-PUBLISH-PIPELINE-1 (C-10 condition 3)

- **Fonction** : `servedPolicyTables(texts)` de `apps/harness/src/kata-path.ts`, au commit `871b2965` de la base de travail. Une fois fusionné, le commit de fusion sur `base/chantier-moteur-2026-10-03` fait foi.
- **Forme des textes** :
  - `classText(taskClass) => string` donne le `text` de chacune des 35 entrées de classe ;
  - `marginal = { registry_file, registry_sha256, generator, text }` donne la `source` et le `text` des lignes stable-run et liquidation ;
  - les octets sont fixés par la ligne datée de MONARK avant F-5a (Z-3).
- **Sortie** : `[{ task_class, table, policy_table_sha256 }]`, 35 entrées triées par `task_class`, `policy_table_sha256` = sha256 de `canonicalJson(table)`. La CI de publication recalcule cette empreinte et la compare au servi (en D, la même fonction alimente `runGate`).

## Pour le bloc C et le bloc D

- **G0 du bloc C** :
  - nommer « ce que D attend du paquet gelé » (C-1 condition 2) et la parité `KATA_REASONS` ⊆ `COVERAGE_REASONS` ;
  - nommer la forme L3 du tueur « a `calib_*` row defers » (C-4) ;
  - conclure la forme de LATE-CALL-WINDOW-1 (C-9) ;
  - retirer `input_invalid` et `json_invalid` de `PENDING` dans le lot qui les lance (`apps/harness/test/kata-path.test.ts`, constante `PENDING`).
- **Bloc D** (G0 amendé, section « Bloc D ») :
  - B-14 avec le motif réduit exact et les deux tests inversés de `gate-byo-confusable.test.ts` ;
  - le branchement de `kataPath` dans `runGate` ; la clause kata ; les 6 lanceurs ; B-15 et B-9 précisée servies ; l'instantané en attente ; le tueur de bout en bout ;
  - le cliquet dynamique au G7 du dernier lot ;
  - le commentaire `gate.ts:275`, devenu faux.

  Le cycle d'import `gate.ts` ↔ `kata-path.ts` que D créera est sûr, puisque `kata-path.ts` ne lit les exports de `gate.ts` qu'à l'appel. D peut aussi déplacer ces trois symboles.

## Questions

Aucune question de contrat neuve. Deux lectures déclarées au G0 sont à confirmer par la G2 ou par MONARK :
1. **Cliquet au lot a.** La décision le place « dès le lot b de CM-4b », qui n'existe plus. Sa condition 3 exige qu'il existe avant C. **Défaut** : lot a (fait).
2. **Verdict d'une région kata servie.** Un ensemble `{side}` suit la règle servie de `byoVerdict` : `abstain` = |C| > `tau`, `set_too_large`, sinon `covered`. Il n'y a de différence qu'avec `tau` < 1. Une bande suit `conformInterval` : `abstain` faux, `covered`. **Défaut** : ces règles servies (faites). Si l'advisor préfère `covered` et `abstain` faux pour tout `{side}`, le changement tient en une ligne (`kata-path.ts:93`) et une assertion.
