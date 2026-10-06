# G0 du lot CM-3c-3b2 (contrat 1.1.0, bloc C, premier lot de la PR C2b) : le harnais se convertit et se teste

- **Plan** : `docs/G0-lot-cm-3c-3b1.md` (coupe de 3c-3b, liste « 3c-3b2 ») ; `docs/G7-lot-cm-3c-3b1.md` (liste rouge fermée, 28 tests du harnais à ce lot) ; `docs/G0-lot-cm-3c-3b.md` (mesure au prototype) ; m-6 de la G2 de 3c-3a ; m-1 et m-7 de la G2 de 3c-3b1 (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-3c-3b1.md`). Décisions de cellule : Q-3b-1 (C2b = 3c-3b2 + 3c-3c, chaque PR ≤ 1 205, chaque lot ≤ 547, tête de C2b verte), Q-3b1-1 (source liq par son seul sha256, tenue par le pli de 3c-3b1), Q-3b1-2 (comparaison des rouges par nom de test).
- **Branche** : `recherches/cm-3c-3b2`, partie de `origin/recherches/cm-3c-3b1` (`e4c51d7b`) ; le pli de 3c-3b1 (`ab732540`) est fusionné par un commit de fusion après ce G0. **Base de mesure du lot : `ab732540`.** Aucune PR.
- **Statut** : G0 écrit avant le commit des tests. Le contenu a été prototypé dans l'arbre de travail puis mis de côté, pour mesurer le R-25 (section 3). Auteur : RECHERCHES.

## 1. Ce que le lot écrit

1. **Conversions des tests du harnais** (les 28 rouges de 3c-3b2 au G7 de 3c-3b1) : `calib_digest` et `set_digest` vers `scores_sha256` ; permutation de `calibrate` inversée (un autre ordre donne une autre empreinte, même q̂) ; boucle d'audit à trois égalités ; `numeric_under_calib_region_is_not_directional` inversé (aucune région, aucun `label_schema` sur le fil) et commentaire de `packages/hikae/src/region.ts:27-34` (même nombre de lignes) ; garde par strate en mode `digest` vers l'épingle neuve ; forme de `ServedTableTexts` (empreinte `d32cf528…` inchangée) ; modules servis (les quatre `policy-*` du graphe servi, m-4 de la G2 de 3c-3b1) ; `served-replay-cm3` et la bande USDe de `gate-cm2b` passent à une **projection indépendante de la version** (action, raison, `allow`, région ou nulle, q̂, `n_calib`, `alpha` ; un refus par son code), mesurée égale à la base `418a421f` et au lot ; erreurs `tsc` et `lint:ratchet` des tests du harnais.
2. **Version des prédictions produites** : `cascade_returns_frozen_prediction` et les quatre `gate_stable_run_*` (A6, A7b, A7acde, A2/A7f) sont rouges parce que `packages/ukemi/src/prediction.ts:13` et `packages/monark/src/adapter-narabi.ts:26` écrivent encore `"1.0.0"`. Les deux lignes lisent `SCHEMA_VERSION` de `@monark/contracts` (Q-3 de C1 : une seule constante ; `AttestedFlow` reste en 1.0.0), à nombre de lignes égal. **Écart** : la zone est ouverte « en C2 (3c-3c) » ; elle l'est jusqu'à la fusion de C2, et la ligne passe de 3c-3c à 3c-3b2 dans la même PR C2b, parce que le G7 de 3c-3b1 range ces cinq tests à 3c-3b2. Question Q-3b2-1.
3. **Tests neufs** (un tueur fermé par test) : Q-C1 (quatre verdicts BYO) ; champs de case servis (ligne courante de la clé ; cascade sur le `predictor_id` reçu) ; m-7 (valeurs servies égales à la ligne admise) ; Q-C3 (parité kata, textes et sources) ; Q-C2 (cinq vecteurs I-JSON en HTTP et MCP, refus existants gardés, trois paires de même empreinte) ; LIQ-BAND-EXACT-GUARD-1 au chargement servi (processus fils) ; m-6 (c)(d)(e) sur le rejeu ; provenance C5 de btc-dir (m-3 de la G2 de 3c-3b1).
4. **Tueurs de m-1** (G2 de 3c-3b1), un par survivant :

| Mutant | Test tueur |
|---|---|
| M1 `gate.ts:1014` | `i_json_envelopes_are_param_invalid_and_existing_refusals_keep_their_code` |
| M2 `gate.ts:1004` | `served_cell_carries_the_current_row_of_the_key` |
| M3 `gate.ts:452` | `byo_qhat_unit_is_fixed_by_the_mode` |
| M5 `gate.ts:541` | `cascade_cell_key_is_the_received_predictor_id` |
| M6 `calibration.ts:276` | `u4b_calib_registry_digest_guard_per_stratum` (converti, tueur déclaré) |
| M7 `policy-served.ts:27` | `liq_band_exact_guard_at_the_served_load` |
| M8 `policy-served.ts:23` | équivalent : la table cascade n'a aucune ligne, la politique n'y est jamais lue (dit au G7) |
| M9 `gate.ts:991` | `served_tables_texts_and_sources` (à la main) |
| M10 `gate.ts:994` | `served_tables_texts_and_sources` |
| M11 `kata-path.ts:114` | `kata_served_tables_digests` (tueur ré-ancré sur `policy-served.ts:23`) |

5. **Hors du lot** : message du refus 1.0.0 (Q-F2) : la ligne datée de MONARK qui fixe le texte n'est pas sur la base (`418a421f` n'a que la ligne (7), le go) ; il reste à 3c-3c. Coupes déjà prises : corps 400 avec `code` et test des 63 caractères (C'), composition Z-3 et liste de l'écart liq (C'), README et PROVENANCE (T0).

red-proof : les tests du lot sont verts à la base par construction (les sources de 3c-3b1 sont déjà là) : refus « green at base » attendus, tueurs tirés à la main.

## 2. Liste rouge attendue à la tête de 3c-3b2

Les 65 du G7 de 3c-3b1 moins les 28 du harnais : **37**, tous à 3c-3c (`atelier` 5, lecteurs du format du site 7, chargement racine 2, instantanés servis et sondes 22, test 42). Le G7 l'écrit test par test.

## 3. R-25

- **3c-3b2** (prototype mesuré contre `e4c51d7b`) : conversions ~300, tests neufs ~150 : **~430 ≤ 547**.
- **3c-3c** (estimation fraîche) : atelier et 9 décisions régénérées ~60, lecteurs du site ~40, tests racine et instantanés ~150, test 42 et Q-F2 ~20 : **~270**.
- **C2b ≈ 700 ≤ 1 205.** Avec C2a à 1 042, la PR d'intégration (C2a + C2b) se projette à ~1 740, au-dessus de la borne de repli 1 400 : la cellule a décidé que la règle R25-INTEGRATION-RULE-1 passe d'abord ; aucun test n'est coupé ici.

## 4. Questions (pour MONARK)

- **Q-3b2-1** : les deux lignes de version des prédictions produites (`ukemi/src/prediction.ts:13`, `monark/src/adapter-narabi.ts:26`) dans 3c-3b2 plutôt que 3c-3c, même PR C2b, zone ouverte jusqu'à la fusion de C2. Défaut : oui (sinon les cinq tests restent rouges à la tête de 3c-3b2 et passent à 3c-3c).
- **Q-3b2-2** (m-7, écart du G0 de 3c-3b §5 point 6) : les valeurs servies (`qhat`, `n_calib`, `alpha`) restent calculées depuis les scores de `calibration.ts`, d'où la ligne est construite ; le test neuf tient l'égalité avec la ligne admise. Défaut : accepter l'écart jusqu'à C'.
