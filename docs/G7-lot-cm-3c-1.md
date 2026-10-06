# G7 du lot CM-3c-1 (contrat 1.1.0, bloc A)

- **Plan** : `docs/G0-lot-cm-3c-1.md` (commit `49b64c33`) ; plan r3 §8.3 (ligne A) et §8.4. Réponses à Q-1 et Q-3 : `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/avis/DECISION-PolicyRow-Q1-Q3.md` et `AVIS-advisor-PolicyRow-Q1-Q3.md` (table « colonne | type | obligatoire | source »), approuvées par MONARK (`recherches` `3e2fe0c`). Q-2 réglée par l'avance de la base.
- **Base** : `43d90ac9` (`base/chantier-moteur-2026-10-03`). **Gel** : `6bd1d1df` (branche `recherches/cm-3c-1`, non poussée).
- **Statut** : clos. G2 faite (APPROUVE-AVEC-CORRECTIONS), pliée : B-1 par Q-L voie 1, C-1 par le gel `b0dc5b8d` (section « Plis du 2026-10-04 »). Contrôle par diff de MONARK tenu, puis fusion `--no-ff` de `be5ca9a1` sur la base `base/chantier-moteur-2026-10-03` : `880654ed`, oracle G7 Windows vert (2 232 tests, 0 échec ; `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-126-base-127-rejeu.md`, commit `8e5ac53`). Ligne pliée au premier commit de documentation du lot suivant (CM-4a-i), à la demande de MONARK (`recherches` `17b2196`, §3).

## Ce que le lot change

Tout dans `packages/contracts/src/`, aucun fichier de `schemas/`, aucun octet servi :
- `canonical.ts` : `canonicalJson`, `sha256Canonical`, `scoresSha256`, `requestSha256` (spec §2). Écart déclaré avec `canonicalRow` de `hikae` jusqu'au bloc C : seule la clé non ASCII les distingue.
- `tool-error-codes.ts` : `TOOL_ERROR_CODES`, 32 codes (les 24 de `HARNESS_ERROR_CODES` dans leur ordre, puis les 8 réservés). `gate.ts` réexporte la liste (`HARNESS_ERROR_CODES = TOOL_ERROR_CODES`, import l.36) ; le bloc l.266-279 garde ses 14 lignes, le commentaire nomme les 8 codes réservés et leur lot. `HarnessErrorCode` passe à 32 sans casse sous `tsc`.
- `policy-table.ts` : `QHAT_UNITS`, `REGION_RULES`, `ROW_STATUSES`, `STATEMENTS`, `CELL_KEY_RULES`, `SCORE_ORDERS`, `CHECK_OUTCOMES` ; `ClassEntry` (16 clés) et `PolicyRow` (60 clés), types dérivés des formes du contrôle ; `POLICY_ALLOWED_KEYS` ; `assertClosedClassEntry`, `assertClosedPolicyRow`, `assertClosedPolicyTable`. Un seul type de bloc pour `test`, `bridge` et `fwd`. Couplages de l'avis §1.5 tenus ; grammaires de valeurs laissées au garde.
- `index.ts` exporte le tout ; `calibDigest` et les types 1.0.0 restent.
- `test/contracts-frozen.manifest.json` ré-épinglé dans le même commit (D9-ter, ré-épinglage 1) : 3 fichiers neufs, `index.ts` changé ; compte de 7 schémas inchangé.

## Oracle

- `node scripts/red-proof.mjs --base 43d90ac9 --gel 6bd1d1df --repo /home/user/monark-governance-c3c1 --draw 15 --seed 37` (Node 24.21.0) : **OK**, 15 tests jugés (1 F2P, `harness_error_codes_are_a_closed_pinned_list` ; 14 new-module, `canonical.test.ts` et `policy-table.test.ts`), 5 inchangés, 15 tueurs tirés, **15 tués** ; `RED-PROOF.json` sha256 `01b11d7f…0490e`.
- Tueur `gate.ts:273` de `error-code.test.ts` ré-ancré en `packages/contracts/src/tool-error-codes.ts:8`, tué. `verifie-ancres.mjs` (`--ref 43d90ac9`) : 782 tueurs, 773 ANCRE, DERIVE 0, PERDU 9, les 9 déjà PERDU à la base (768 tueurs, 759 ANCRE). Aucune ancre existante ne bouge.
- `tsc --noEmit`, `eslint` (fichiers changés), `lint:ratchet` 69/69, `gate:vocab` (338 fichiers) : verts.
- `npm test` complet (Node 24.21.0, variables de proxy retirées) : 2 130 tests, 2 107 verts, 22 sautés, **1 rouge** : `export_public_no_governance_no_french` (test 42), même cause que `lang:gate`. `contracts_frozen` (les deux tests), `served-replay-cm3`, `harness-served` et `narabi-live` verts.
- `lang:gate` : **rouge**, 11 occurrences du mot `aux` dans `aux_seq`, `runs_aux` et `aux_sha256` (`policy-table.ts` l.75, 76, 83 ; `policy-table.test.ts`). Mesuré : avec ces trois termes dans `terms` de `scripts/lang-exempt.json`, `lang:gate` et le test 42 sont verts (essai annulé, fichier non touché).
- **R-25** (`r25()` contre `43d90ac9`) : **481 lignes comptées** (+464/−17, 9 fichiers ; borne du lot 547) ; contenu 0.

## Différences servies

Aucune. La liste des codes n'est servie nulle part ; les 24 premiers codes gardent leur ordre ; aucun lanceur neuf.

## Questions

**Q-L (MONARK) : exemption de langue de trois colonnes figées.** `aux_seq`, `runs_aux` et `aux_sha256` sont des noms de colonne fixés par la décision Q-1 (spec §10), donc gelés. Le mot `aux` est un mot français de la liste du garde. `lang-exempt.json` relève de la plume de l'orchestrateur (ADR-M004 D7 quater) ; je ne l'ai pas modifié, et je n'ai ni renommé ni masqué les colonnes. Proposition : ajouter les trois termes à `terms`, comme D7 quater l'a fait pour les identifiants gelés en collision. Sans cela, le bloc C (`schemas/policy-row.schema.json`, portée `schemas`) rougira aussi.

## Plis du 2026-10-04 (après la G2 et la réponse de MONARK à Q-L)

- **Sources** : G2 fraîche `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-3c-1.md` (APPROUVE-AVEC-CORRECTIONS) ; réponse de MONARK à Q-L, voie 1 (`recherches` `4da9bcd`, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-Q-L-voie-1.md`).
- **Commits** (nouveaux, sans réécriture) : `52ff9814` (Q-L : `lang-exempt.json` et ADR-M004 D7 decies) ; `b0dc5b8d` (C-1, code, test et ré-épinglage ; **nouveau gel**) ; ce commit (G7).

### B-1 / Q-L, voie 1 (zone ouverte par MONARK)

- `scripts/lang-exempt.json` : exactement trois entrées ajoutées à `terms`, `aux_sha256`, `runs_aux` et `aux_seq`, rangées selon l'ordre du fichier (longueur décroissante, puis alphabétique) ; rien d'autre, `$comment` inchangé.
- `docs/adr/ADR-M004-infrastructure-plateforme.md` : addendum **D7 decies** daté (style de D7 quater) : les trois termes, le motif (colonnes figées par la décision déléguée Q-1, `DECISION-PolicyRow-Q1-Q3.md`, approuvée par MONARK ; « aux » abrège « auxiliary », faux positif du mot français), le test 42 comme tueur, l'héritage par le bloc C (`schemas/policy-row.schema.json`) sans nouvel addendum si les noms sont les mêmes.
- **Tueur vérifié** : retirer un terme rougit `lang:gate` (portée `contracts`, sortie 1 : sans `aux_sha256` 3 occurrences, sans `runs_aux` 3, sans `aux_seq` 5) ; sans `runs_aux`, le test 42 seul est rouge (« 3 non-exempt French hit(s) »). Fichier restauré, puis `lang:gate` et le test 42 verts.

### C-1 : grammaire de `alpha` (forme (a))

- `policy-table.ts:71` : `alpha: dec` devient `alpha: re(/^0\.[0-9]{0,3}[1-9]$/)`, soit l'écriture aller-retour la plus courte d'un nombre de ]0, 1[ à au plus 4 décimales (table de l'avis : « string (aller-retour le plus court, au plus 4 décimales) »). Même ligne : aucune autre adresse de tueur ne bouge.
- Test neuf `policy_row_alpha_grammar` : refuse `"-0.1"`, `"2"`, `"1e-7"`, `"0.12345"`, `"0"`, `"1"`, `"0.450"`, `"NaN"`, `".5"` et le nombre `0.5` ; admet `0.1`, `0.45`, `0.01`, `0.0001`, `0.9999`, `0.1234`. Tueur fermé : `policy-table.ts:71 CONST "[0-9]{0,3}[1-9]" -> "[0-9]{0,4}[1-9]"`, tué. Les deux refus de `alpha` de `policy_row_value_grammars` passent au test neuf ; la grammaire `dec` y reste couverte par `thresholds.t1 = "0.50"`.
- `ClassEntry.alpha` reste `string | null` (`dec`), comme le dit la table de l'avis pour `ClassEntry`.
- `test/contracts-frozen.manifest.json` : empreinte de `policy-table.ts` ré-épinglée dans le même commit (D9-ter, ré-épinglage du bloc A) ; `contracts_frozen` vert.

### Mineures de la G2 laissées aux blocs suivants

- **m-1** (règles de la table pour une ligne marginale ou un format : `source.trial_id` et `source.wave` nuls sur une ligne marginale, `calib_support.min <= max`, `strata_cuts` non vide, `qhat` `-0`) : matière du garde (§1.5), pour B1 et B2. Aussi pour le garde : `test_delta < 0.25` (A-2 §2.2 point 3).
- **m-2** (titre de `test/contracts-frozen.test.ts:61` sans D9-ter) : bloc C, qui touche ce fichier.
- **m-3** (`requestSha256` avec `attested: undefined` lève `RangeError`) : impossible sous `exactOptionalPropertyTypes`, échoue fermé ; bloc C, enveloppe par étalement conditionnel. Le corriger ici déplacerait le texte du tueur `canonical.ts:59`.
- **m-4**, **m-5** : informations. Les totaux de `npm test` varient d'un passage à l'autre dans cet environnement (voir ci-dessous) ; le sha256 de `RED-PROOF.json` dépend des chemins du passage.

### Résultats rejoués (Node 24.21.0, variables de proxy retirées, tête `b0dc5b8d`)

- `tsc --noEmit` vert ; `npm run lint` propre ; `lint:ratchet` 69/69 ; `gate:vocab` OK (338 fichiers) ; **`lang:gate` vert** (0 occurrence non exemptée, toutes portées).
- `npm test` complet, trois passages : (1) 2 093 tests, 1 rouge ; (2) 2 185 tests, 1 rouge ; (3) **2 165 tests, 2 143 verts, 22 sautés, 0 rouge**. Les rouges de (1) et (2) sont le test 42 au seul mode déjà signalé (EXPORT-TEST42-SUMMARY-1, message RECHERCHES du 2026-09-30 « test-42-instable ») : `npm run ci` exporté sorti à 0, ligne de synthèse non capturée, « implausibly small suite ». La porte de langue du test 42 est passée dans les trois. Test 42 seul (`node --test test/export-public.test.ts`) : 4/4 verts.
- `node scripts/red-proof.mjs --base 43d90ac9 --gel b0dc5b8d --repo /home/user/monark-governance-c3c1 --draw 16 --seed 37` : **OK**, sortie 0 ; 16 jugés (1 F2P, `harness_error_codes_are_a_closed_pinned_list` ; 15 new-module, dont `policy_row_alpha_grammar`), 5 inchangés, 16 tueurs tirés, **16 tués** (dont `policy-table.ts:71`) ; `RED-PROOF.json` sha256 `11be967b…ba27`.
- `verifie-ancres.mjs --ref 43d90ac9` : 783 tueurs, 774 ANCRE, DERIVE 0, PERDU 9 (les 9 de la base, `hikae` `l1-split` et `scripts/oracle/run.mjs`).
- **R-25** (`r25()` de `scripts/oracle/r25.mjs` contre `43d90ac9`, règles de `ci.yml`) : STAT **489** (+472/−17), borne du lot 547, borne de PR 1 205 ; CONTENT_STAT 0. `lang-exempt.json` compte ; l'ADR et le G7 (`docs/**/*.md`) sont exclus.
- **Statut** : B-1 levé (Q-L close, voie 1), C-1 plié. Reste le contrôle par diff de MONARK sur `lang-exempt.json` et ADR-M004 D7 decies, puis la PR sur `base/chantier-moteur-2026-10-03`.
