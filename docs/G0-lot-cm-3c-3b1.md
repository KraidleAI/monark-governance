# G0 du lot CM-3c-3b1 (contrat 1.1.0, bloc C, PR C2a) : le harnais se charge et se type

- **Choix** : nouveau fichier. Le G0 court `docs/G0-lot-cm-3c-3b.md` reste la mesure de 3c-3b entier (prototype, section 4) et la source des questions Q-3b-1 à Q-3b-5 ; ce G0 coupe 3c-3b en **3c-3b1** (ce lot) et **3c-3b2** (lot suivant, PR C2b), et ne change aucune décision.
- **Décisions de cellule appliquées** (message de MONARK `2026-10-05-MONARK-vers-RECHERCHES-C2-integration.md`, ligne datée (9) de l'ADR-CM, commit `418a421f` de la base) :
  - **Q-3b-1** : C2 passe par `base/c2-integration`, créée depuis `418a421f`. **C2a** = 3c-3a + 3c-3b1 ; **C2b** = 3c-3b2 + 3c-3c. Chaque PR ≤ 1 205, chaque lot ≤ 547. La tête de C2a ne porte que la liste rouge fermée de son G7, comparée test par test par MONARK ; la tête de C2b est verte en entier.
  - **Q-3b-2** : les épingles C5 restent des valeurs de provenance ; `scoresSha256` est contrôlé au chargement contre trois épingles neuves, hors du bloc généré : USDe `e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28` (sha256 de `fixtures/usde-calib-scores.json`), liq s0 `a927722276941a4f8f677bab3625b8ee3128ecf84d2d078da0a316b42a6ee3c8`, btc-dir `bb438031be5ca37ab62eedcb8044ea63969fa6314287019b4e68c235c473afd6`.
  - **Q-3b-3** : deux lignes de `WHITELIST_FILES` (`scripts/lib/calib-digest-provenance.mjs` et son `.d.mts`) et leurs deux lignes de `docs/PRODUCT-BOUNDARY.md` (lecture datée de D7 duodecies, même commit `418a421f`).
  - **Q-3b-4** : valeurs de `source` des trois tables, celles du G0 de 3c-3b (section 5, point 3). **Q-3b-5** : le test des 63 caractères va en C', avec la coupe des corps 400 à `code`. **Coupe (a)** maintenue : test de composition Z-3 et liste fermée de l'écart liq en C'.
- **Remis par la G2 de 3c-3a** (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-3c-3a.md`) : **m-5** entre dans 3c-3b1 ; **m-6** va en 3c-3b2.
- **Branche** : `recherches/cm-3c-3b1`, partie de `recherches/cm-3c-3b` (`71ee94f3`) ; base `418a421f` fusionnée par un commit de fusion avant tout test. Base de mesure du lot : la tête de 3c-3a, `cbf2ca26`.
- **Statut** : G0 écrit avant les tests rouges de 3c-3b1. Auteur : RECHERCHES.

## 1. La coupe

Règle : **3c-3b1 fait charger et typer le harnais** (`apps/harness/src/`), écrit les deux lignes d'export, et ne touche aux tests existants que pour qu'ils **se chargent**. Tout le reste du harnais va en 3c-3b2.

### 3c-3b1 (ce lot, C2a)

1. **Sources du prototype** (`apps/harness/src/`, mesurées au G0 de 3c-3b, 225 lignes) :
   - `calibration.ts` : `scoresSha256` à la place de `calibDigest` ; épingles neuves de Q-3b-2 ; garde de chargement par entrée engagée, sortie en fonction exportée `assertCommittedScores` (testable sans processus fils) ;
   - `policy-served.ts` (neuf, Q-C3) : `servedMarginalTables`, appelé par `kata-path.ts` (`servedPolicyTables`) et par `tools/gate.ts` (`SERVED_MARGINAL_TABLES`, construit au chargement) ; `ServedTableTexts.marginal` devient une fonction de la classe (écart 2 du G0 de 3c-3b) ;
   - `tools/gate.ts` : `SCHEMA_VERSION` de `@monark/contracts` ; `cell` sur chaque verdict (BYO selon Q-C1 ; USDe, liq, cascade par `servedCell`) ; `labelSchema` retiré ; `requestSha256` sur le `GateInput`, calculé sur l'enveloppe reçue, avec le refus I-JSON nommé (400 `param_invalid`, Q-C2) ; ligne de résumé `region=null` et `scores_sha256=` ; textes Z-3 en un seul paramètre (`SERVED_TABLE_TEXTS`) ; en-tête mis à la version 1.1.0 ;
   - `tools/calibrate.ts`, `schema-projection.ts`, `tools/registry.ts` : B-17 (`scores_sha256` à la place de `set_digest`) ; `tools/ukemi-predict.ts` : `SCHEMA_VERSION` du paquet.
2. **Export** : les deux lignes de `scripts/export-public.mjs` et les deux de `docs/PRODUCT-BOUNDARY.md` (Q-3b-3).
3. **Tests existants, chargement seul** : les six fichiers du harnais qui importent `calibDigest` du paquet (`calibrate`, `calibration-liq`, `gate-liq-artifact`, `gate`, `http`, `usde-calibration`) l'importent de l'outil de provenance. Une ligne d'import par fichier, aucune assertion changée.
4. **Tests rouges neufs** (section 2).

### 3c-3b2 (lot suivant, C2b)

- Conversions des tests existants du harnais : renommages de champs (`calib_digest`, `set_digest` vers `scores_sha256`, en remplaçant l'outil de provenance par `scoresSha256` là où le fil est visé) ; `numeric_under_calib_region_is_not_directional` inversé et commentaire de `packages/hikae/src/region.ts:27-34` ; boucle d'audit à trois égalités ; permutation de `calibrate.test.ts:110` inversée ; forme de `ServedTableTexts` dans `kata-path.test.ts` (empreinte `d32cf528…` inchangée) ; liste des modules servis (`policy-served.ts`) ; `served-replay-cm3` remplacé par la projection ; dérive par strate (`u4b_calib_registry_digest_guard_per_stratum`, mode `digest`) vers l'épingle neuve ; erreurs `tsc` et `lint:ratchet` des tests du harnais.
- Tests neufs restants : champs de case des quatre chemins et tueur de la clé liq ; Q-C1 (quatre verdicts BYO) ; Q-C2 (cinq vecteurs I-JSON en HTTP et MCP, refus existants gardés, trois paires de même empreinte) ; LIQ-BAND-EXACT-GUARD-1 au chargement servi ; Q-C3 (modules servis et parité des empreintes) ; `scores_sha256` USDe dans l'ordre `time`.
- **m-6 de la G2 de 3c-3a** : sur chaque verdict servi du rejeu par projection, (c) `n_calib === scores.length` quand `scores` est présent ; (d) et (e) `scores` présent ⇒ `cell_key === null` et `qhat_unit !== "scale"` ; (a) et (b) dits « l'étape 4 décide » à la ligne r4. Aucun ré-épinglage du contrôle fermé.
- Message du refus 1.0.0 (Q-F2) : le texte exact attend la ligne datée de MONARK ; le message actuel nomme déjà la version parlée (`SCHEMA_VERSION`, donc `1.1.0`).

3c-3c reste celui du G7 de 3c-3a (lecteurs du format du site, `atelier`, épingles et instantanés, tests racine, test 42).

## 2. Tests rouges de 3c-3b1

| Test | Fichier | Tueur |
|---|---|---|
| `served_gate_body_validates_the_frozen_decision_schema` (m-5) : corps `/gate` HTTP et `tools/call` MCP, chemins BYO ensemble, BYO intervalle, USDe, liq, cascade ; ajv contre `gate-decision.schema.json` ; `request_sha256 = sha256(canonicalJson(JSON.parse(corps)))`, corps écrit hors forme canonique | `apps/harness/test/gate-request-sha256.test.ts` (neuf) | SDL de la ligne `requestSha256:` du `GateInput` (l'oubli) |
| `request_sha256_is_the_digest_of_the_received_envelope` : même empreinte à l'ordre des clés près, autre empreinte si `intent` ou `yhat` change | même fichier | CONST qui vide `params` dans `envelopeSha256` |
| `committed_scores_sha256_load_guard_against_the_new_pins` (Q-3b-2) : les trois épingles par valeur, USDe = sha256 de la fixture ; dérive, réordonnancement et entrée sans épingle refusés par nom | `apps/harness/test/calibration-scores-pins.test.ts` (neuf) | SDL du `throw` de `assertCommittedScores` |
| `kata_reasons_within_coverage_reasons` (Q-3a-2) | `apps/harness/test/kata-path.test.ts` | CONST qui ajoute une raison hors `COVERAGE_REASONS` à `KATA_REASONS` |

Adresses des tueurs fixées au gel. Le harnais ne se charge pas à la tête de 3c-3a : `red-proof` refusera ces tests (« import red on a file that exists at base ») ; chaque tueur est tiré à la main au gel, et le G7 le dit. Le tueur ré-ancré de `served-replay-cm3` (`l3-gate.ts:90`) est tiré à la main au gel.

## 3. R-25 prévu

- 3c-3b1 : sources ~230, export 2, chargement des tests ~15, tests neufs ~215 : **~470 ≤ 547**.
- **C2a** = 510 + ~470 ≈ **980 ≤ 1 205**.
- 3c-3b2 : conversions ~160, tests neufs ~90 : ~250 ; **C2b** = ~250 + ~285 ≈ **535**.

## 4. Liste rouge attendue à la tête de 3c-3b1

Les 27 fichiers du harnais se chargent, les 7 de la sentinelle aussi. Restent rouges : les tests du harnais que 3c-3b2 convertit (mesurés au G7), et ce que 3c-3c possède (lecteurs du format du site, `atelier`, tests racine qui importent `calibDigest` du paquet ou lisent `calib_digest`, test 42). Le G7 écrit la liste exacte, test par test.
