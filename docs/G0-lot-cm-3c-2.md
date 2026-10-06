# G0 du lot CM-3c-2 (contrat 1.1.0, bloc C, PR C1) : préparation sans bascule, aucun octet servi

- **G0 du bloc** : `docs/G0-bloc-c-cm-3c-2.md` (sections 3.1, 5, 6, 8, 9 et 13 ; amendement du 2026-10-05, section 14). Ce G0 court en reprend le lot CM-3c-2 et dit **exactement ce que C1 contient après la coupe nommée**. Rien ici ne remplace une décision du G0 du bloc.
- **Sources lues** : décision déléguée `recherches:coordination/pieces/2026-10-05-bloc-C-avis/DECISION-bloc-C-QC1-QC5.md` (Q-C4, Q-C5) ; réponses de MONARK `2026-10-05-MONARK-vers-RECHERCHES-bloc-C-reponses.md` (Q-M1 : lecture de D9-ter, ré-épinglage 2 en deux commits, CM-3c-2 = les deux schémas neufs et le compte 7 → 9 ; Q-M3 : tableau P-4 ouvert par nom ; Q-M14 : RECHERCHES mesure et propose, MONARK écrit), `…-bloc-C-hors-delegation.md` (schémas neufs sur le site à T0, par MONARK), `…-docs-tronc.md` (lecture D9-ter et ligne Z-3 au tronc, `63603285`), `…-145-144-143.md` (#145 fusionnée sur la base).
- **Base** : `origin/base/chantier-moteur-2026-10-03` = **`7af2ad63`**, fusion de #145 (amendement 9 de l'ADR-CM, tête `43c49885`) ; `git merge-base --is-ancestor 43c49885 origin/base/…` vérifié avant tout commit de code. Fusion de la base dans `recherches/cm-3c-2` : `fa3ebe27` (docs seules, aucun conflit). **P-3 et P-10 remplies** : l'amendement 9, avec la ligne de la liste fermée du refus I-JSON (Q-C2), est sur la base, contrôlé par MONARK.
- **Branche** `recherches/cm-3c-2`, arbre `/home/user/monark-governance-blc`. Rien n'est poussé, aucune PR ouverte. Auteur : RECHERCHES.

## Coupe nommée : appliquée

La réestimation du G0 du bloc (section 9, 2026-10-05) donne C1 à ~585, au-dessus de 547. **La coupe nommée s'applique : le rejeu par projection (point 8 de la section 3.1, ~55) passe en 3c-3b (C2).** Elle n'est pas « rendue inutile par la mesure » : la mesure au gel (section R-25 ci-dessous) laisse moins de 10 lignes de marge sans la projection.

## Contenu exact de C1 après la coupe

| # | Poste (G0 du bloc, section 3.1) | Fichiers | Zone |
|---|---|---|---|
| 1 | `schemas/policy-row.schema.json` (Q-C4) | neuf | D9-ter |
| 2 | `schemas/tool-error.schema.json` (Q-C5) | neuf | D9-ter |
| 3 | parités schéma ↔ contrôle fermé et schéma ↔ catalogue | `packages/contracts/test/policy-row-schema.test.ts`, `packages/contracts/test/tool-error-schema.test.ts` (neufs) ; corpus admis : `apps/harness/test/policy-row-schema-corpus.test.ts` (neuf) | RECHERCHES |
| 4 | manifeste et compte 7 → 9, titre qui nomme D9-ter | `test/contracts-frozen.manifest.json` (deux entrées), `test/contracts-frozen.test.ts` (compte et titre seulement) | D9-ter, P-4 |
| 5 | outil de provenance de `calibDigest` | `scripts/lib/calib-digest-provenance.mjs` et `.d.mts` (neufs), `test/calib-digest-provenance.test.ts` (neuf) ; `scripts/emit-u4b-calibration.mjs` l'importe | P-4 |
| 6 | FIXTURES-GATE-DECISION-GEN-1 | `scripts/gen-gate-decision-fixtures.mjs` et `.d.mts` (neufs), `test/gate-decision-fixtures-gen.test.ts` (neuf) ; les 9 `fixtures/*.gate-decision.json` et `fixtures/manifest.json` **inchangés** (le générateur les reproduit à l'octet) | P-4 |
| 7 | constante de version dans les tests du harnais | 15 fichiers de `apps/harness/test/` : 29 littéraux `"1.0.0"` lisent `SCHEMA_VERSION` de `src/tools/gate.ts` | RECHERCHES |
| ~~8~~ | ~~rejeu par projection~~ | **coupé, en 3c-3b** | — |

**Aucun fichier servi ne change** : ni `apps/harness/src/`, ni `http.ts`, `openapi.ts`, `schema-projection.ts`, ni `apps/site/`, ni `packages/*/src/`. Les deux schémas neufs ne sont lus par aucune projection servie ; le site les liste au disque (`frozen-contracts.ts`), mais ne les affiche qu'à T0 (MONARK, hors délégation, point 3).

## Écarts au G0 du bloc, mesurés au code (déclarés, avec défaut)

1. **`scripts/record-usde-calib.mjs` n'est pas repointé en C1.** Il est **exporté au miroir public** (`scripts/export-public.mjs:79`, `WHITELIST_FILES`, ADR-M008 Amendement bis C-18 sous ADR-M004 D7). Son import vers `./lib/calib-digest-provenance.mjs` casserait la commande publique « Reproduce » de `PROVENANCE-usde.md` §6 tant que l'outil n'est pas nommé dans la liste blanche, ce qui est une ligne d'ADR-M004 D7 et un fichier de MONARK (`export-public.mjs`, hors P-4). **Q-1 (MONARK)**, section Questions.
2. **`scripts/record-u4b-calib.mjs` (et `.d.mts`) n'est pas repointé.** C'est le **générateur gelé** d'ADR-U4b D4 (sha256 LF `5733daeb…fbc31a3`, épinglé par `apps/harness/test/calibration-liq.test.ts:56`, A-6 d'U-4b-2b : « le générateur gelé n'est pas modifié ») ; D4 nomme `calib-digest.ts` parmi ses imports gelés (« déjà sous `contracts_frozen` »). Le changer est un re-gel d'ADR-U4b. **Q-2 (MONARK)**.
3. **Constante de version : 29 lignes, pas 42.** Recensement à `7af2ad63` : 43 lignes `"1.0.0"` dans `apps/harness/test/`. Restent en littéral, par lecture ligne à ligne :
   - 4 lignes d'attestation (`AttestedPrice`, `AttestedFlow`), qui restent en 1.0.0 (G0 du bloc, section 4, « Ne change pas ») : `error-code.test.ts:53`, `gate.test.ts:461`, `gate.test.ts:714`, `gate-liq.test.ts:73` ;
   - 4 commentaires de `server.test.ts` (l.190-194, `HARNESS_VERSION`) ;
   - 3 appels directs du moteur (`buildVerdict`, `underCalibVerdict`, `GateInput` de `@monark/hikae`) : `gate-empty-set.test.ts:101`, `:118`, `gate.test.ts:448` ; ils gardent leur paramètre, comme les tests de `packages/hikae` (section 3.1 point 7) ;
   - `kata-path.test.ts:47` (chemin kata non servi ; vert sous la bascule simulée) ;
   - `served-replay-cm3.test.ts:25`, `:76` (fichier remplacé par la projection en C2).
   L'import est ajouté sur une ligne à part (`import { SCHEMA_VERSION } from "../src/tools/gate.ts";`) : une ligne R-25 par fichier au lieu de deux.

## Tests et tueurs (forme fermée, adresses au gel)

| Test | Tueur |
|---|---|
| `policy_row_schema_keys_equal_the_closed_check_keys_and_it_admits_the_admitted_tables` | `schemas/policy-row.schema.json:45 CONST "\"kata_id\": {" -> "\"kata_ix\": {"` (CONST d'une clé) |
| `policy_row_schema_parity_key_by_key_with_a_closed_list_of_gaps` | `schemas/policy-row.schema.json:49 CONST "\"4h\", " -> "\"4x\", "` (CONST d'une énumération) |
| `policy_row_schema_admits_the_synthetic_kata_tables_and_the_served_tables` | `schemas/policy-row.schema.json:12 CONST "{7}" -> "{6}"` (motif `u_test` à 6 décimales) |
| `tool_error_schema_codes_equal_the_closed_catalogue` | `schemas/tool-error.schema.json:11 CONST "\"attest_refused\", " -> ""` (un code retiré) |
| `tool_error_schema_branches_by_error` | `schemas/tool-error.schema.json:15 CONST "\"code\", \"issues\"]" -> "\"code\"]"` |
| `calib_digest_provenance_equals_the_contract_function` | `scripts/lib/calib-digest-provenance.mjs:16 CONST "s === 0 ? 0 : s" -> "s"` |
| `gate_decision_fixtures_generator_reproduces_the_committed_files` | `scripts/gen-gate-decision-fixtures.mjs:35 CONST "\"down\", 0.06" -> "\"down\", 0.07"` |
| `contracts_frozen` (deux tests) | mutant nommé de D9-ter, à la main : modifier un fichier du paquet gelé sans ré-épingler ⇒ rouge ; retirer une entrée neuve du manifeste ⇒ le compte rougit |
| constante de version (refactor, vert à la base par construction) | à la main : `apps/harness/src/tools/gate.ts:62 CONST "\"1.0.0\"" -> "\"1.1.0\""`, rouges comptés à la base et au gel |

Liste fermée des écarts de Q-C4 (condition 3), épinglée par refus du contrôle : écriture décimale la plus courte (`-0`, `0.10000000000000001`), `strata_cuts` croissantes, `scale_table.sha256`, couplages de Q-1 condition 1 (vetos et blocs, `retire` et statut, queues, `side` et `bucket`, `miss_bound` et `bound_on`, colonnes `sign-set`, colonnes d'une ligne `marginal`), règles de fichier (`assertPolicyTableFile`), surrogate isolée (écriture canonique).

## Oracle prévu

red-proof (`--base 7af2ad63 --gel <gel> --draw n --seed 37`) ; refactor et tests verts à la base par construction : tueurs appliqués à la main ; empreintes servies base / gel (`/openapi.json`, `tools/list`, réponses du miroir `/gate`, `harness-served.json`, corps de la CA) ; ancres ; mutant D9-ter rejoué ; `npm test`, test 42, `tsc`, `eslint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check`.

## R-25

Mesure au code avant le gel (contre `7af2ad63`, pathspec de `ci.yml:82`) : **~538** ≤ 547, PR C1 = ce seul lot ≤ 1 205. Le G7 donne la mesure de `r25()`.

## Questions (pour MONARK ; aucune n'est un choix de contrat)

- **Q-1. `record-usde-calib.mjs` et la liste blanche d'export.** Défaut : MONARK nomme `scripts/lib/calib-digest-provenance.mjs` dans `WHITELIST_FILES` par une ligne d'ADR-M004 D7, et le repointage de `record-usde-calib.mjs` (une ligne d'import) part en C2 (3c-3c), au plus tard dans le commit qui retire `calib-digest.ts` du paquet gelé.
- **Q-2. Générateur gelé d'U-4b.** Défaut : C2 le repointe dans le commit qui retire `calib-digest.ts` (sinon son import casse), sous une ligne datée d'ADR-U4b qui re-gèle son sha256 LF (seul l'import change ; sortie identique prouvée par `u4b_committed_registry_equals_generator_output` et le rejeu du journal `registry-A`), et `GENERATOR_SHA256_LF` de `calibration-liq.test.ts` est ré-épinglé dans le même commit.
