# G0 court du lot D-3 (bloc D, contrat 1.1.0) : fermetures du dernier lot

- **Statut** : addendum au G0 du bloc (`docs/G0-bloc-d.md`, §4.3, §5, §6), écrit avant le code. Auteur : RECHERCHES.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `753a23a9` (D-1 par #169, D-2 par #171). Branche `recherches/bloc-d-3`.
- **Lectures** :
  - `docs/G0-bloc-d.md` §4.3 ;
  - `docs/G7-lot-d-2.md` §7 (reportés en D-3) ;
  - G2 de D-1 et de D-2 (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-bloc-d-lot-d-1.md`, `G2-bloc-d-lot-d-2.md`) ;
  - décision déléguée CM-4b, C-3 et C-4.
- **Constat** : la couture de test (Q-D5) est déjà posée par D-2 (`RunGateOptions.policyTables`, `gate.ts:875`), avec le test qui épingle que HTTP et MCP ne la passent jamais. Le poste « point d'injection ~5 » du G0 du bloc est donc fait. D-3 garde ses tests et ses fermetures, et prend les points reportés.

## 1. Ce que le lot change (aucun octet servi)

- **N-2 (G2 de D-2)** : `honestyText` prend un quatrième paramètre facultatif, les tables lues (par défaut `SERVED_POLICY_TABLES`). Sous la couture, T-16 lit donc la phrase de la table injectée. Les appelants servis (`registry.ts:76`) ne le passent pas : la phrase servie ne change pas.
- **N-5 (G2 de D-2)** : constante `KATA_DIR_TAU_CAP = 1` dans `policy-classes.ts`, lue par le contrôle `policy_tau_cap` (`kata-path.ts:62`) et par la clause. La règle des noms (`{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}`) est tirée des entrées de classe, avec un contrôle de produit (la forme en accolades ne ment pas). `kataClause(entries, tauCap)` prend ses deux sources en paramètres, avec les valeurs servies par défaut. La clause rendue reste à l'octet : 723 octets, `022756c3…`.
- **N-6 (G2 de D-2)** : fil-piège de KATA-CLAUSE-COMMITTED-STATE-1. `kataTablesHoldNoRow(tables)` (dans `kata-path.ts`) échoue si une table kata porte une ligne ; la construction servie passe par lui (`SERVED_POLICY_TABLES = kataTablesHoldNoRow(servedPolicyTables(…))`). Le fil est à la construction des tables et non dans `kataClause()` : la description est calculée au chargement **avant** `SERVED_POLICY_TABLES` (`gate.ts:262` contre `:1042`), donc `kataClause()` ne peut pas lire les tables sans déplacer du code (Q-D3-4).

## 2. Tests (rouges à la base par assertion, ou verts déclarés)

| # | Test (fichier) | À la base | Tueur prévu (adresse fixée au gel) |
|---|---|---|---|
| T-15 | `every_code_but_output_invalid_is_thrown_by_a_served_request` (`error-code.test.ts`) : pour chaque code sauf `output_invalid`, une requête HTTP en processus rend ce code (400, `code`) ; pour chaque code d'outil, la même requête en MCP le porte dans `_meta`. Les codes sans requête possible sont une liste fermée, épinglée exactement (Q-D3-1). Un code ajouté à la liste sans requête rougit (cliquet dynamique, C-3 condition 2) | **vert déclaré** : D-2 a servi les 6 codes kata ; le tueur est tiré à la main | `kata-path.ts:59 CONST "\"kata_yhat_domain\"" -> "\"param_invalid\""` |
| T-16 | `served_calib_row_abstains_never_defers` (`gate-kata-served.test.ts`) : `runGate` par la couture, sur `btc-dir-1h` avec une ligne `silence`, puis `vetoed`, puis `retired` : `abstain` et la raison `calib_*`, jamais `defer set_too_large` (tau 1, horloge ouverte, intention dans l'ensemble) ; une ligne `region` donne `commit covered` à tau 1 et `defer set_too_large` à tau 0 ; la phrase d'honnêteté lue sur les tables de la couture est le texte de la ligne (N-2) | **rouge** : `honestyText` ignore les tables passées et rend le texte de classe | `packages/hikae/src/l3-gate.ts:93 CONST "REASONS_WITHOUT_REGION.includes(input.verdict.reason)" -> "false"` |
| N6 | `kata_tables_hold_no_row_tripwire` (`gate-kata-served.test.ts`) : les tables servies passent ; une table kata avec une ligne échoue en nommant KATA-CLAUSE-COMMITTED-STATE-1 ; une table marginale avec lignes (USDe) passe | **rouge** : l'export n'existe pas | `kata-path.ts:<fil> CONST "t.table.rows.length > 0" -> "false"` |
| N5 | `kata_clause_reads_its_names_and_tau_cap` (`gate-kata-served.test.ts`) : `kataClause` sur 8 entrées (`btc`, `eth`, `1h`) et tau 0.5 nomme `{btc,eth}-{dir,range,mae-down,mae-up}-{1h}` et « tau at most 0.5 » ; `KATA_DIR_TAU_CAP` vaut 1 et le refus `policy_tau_cap` la cite | **rouge** : la clause ignore ses arguments | `gate.ts:232 CONST "\`${parts(0)}-" -> "\`{btc,eth,bnb,sol}-"` |
| N3 | `kata_path_and_server_load_cold` (`kata-path.test.ts`) : `kata-path.ts`, puis `server.ts`, chargés chacun en premier dans un processus enfant neuf, sans erreur ; 35 tables servies | **vert déclaré** (la G2 de D-2 l'a mesuré) ; tueur à la main | `kata-path.ts:118 CONST "kataClassEntries(texts.classText)" -> "kataClassEntries(TIME_FIELDS.global ? texts.classText : texts.classText)"` (lecture d'une constante de `kata-path.ts` pendant le chargement de `gate.ts`) |
| N2 | `byo_one_letter_m_is_a_lookalike_of_rn` (`gate-byo-kata-wide.test.ts`) : `m-dir-1h` et `m_dir_1h` rendent `byo_lookalike_confusable` (imitation de `rn-dir-1h`), `a-dir-1h` décide | **vert déclaré** ; tueur à la main | `gate.ts:799 CONST "(?:m\|" -> "(?:"` |

- Attendu au `red-proof` : 3 F2P (T-16, N5, N6) ; 3 tests refusés « verts à la base », déclarés, tueurs tirés à la main.
- Tueurs dont le texte change avec le code, ré-ancrés dans un commit « lignes de tueurs seulement » :
  - T-13 : `gate.ts:740` lit désormais `tables.find(…)` ; tueur sur le défaut du paramètre (`= SERVED_POLICY_TABLES` → `= SERVED_MARGINAL_TABLES`) ;
  - `kata_tau_cap_on_set_classes` : `kata-path.ts:62` lit `KATA_DIR_TAU_CAP`.

## 3. Fermetures déclarées au G7

- **C-3 condition 2** : `PENDING` vide (depuis D-2) et cliquet dynamique (T-15).
- **C-4 condition 3** : le tueur « a `calib_*` row defers » est couvert sous ses trois formes : verdict pur (`kata_row_statuses_map_to_regions`), décision L3 (bloc C, lot 3c-2), de bout en bout (T-16).
- **LATE-CALL-WINDOW-1, échéance « code »** (Q-D4, réponse de MONARK « d'accord ») : contrôle servi depuis D-2, vecteurs de T-10. Le remède de latence reste un résidu jusqu'au service de la vague 1.
- **N-4 (G2 de D-1)** : taille du faux refus i/l, mesurée et écrite au G7.
- **N-3 (G2 de D-2)** : chargement à froid (N3).

## 4. Octets servis

Aucun ne bouge. Preuve au G7 : empreintes en processus à la base et au gel de `/openapi.json` (`61c9df97…`), de la réponse `tools/list`, des 4 corps de `PENDING_BODIES_SHA256`, de `/health`, de la description, de la clause (`022756c3…`), des 35 paires de tables (`8da5dd42…`), des 35 phrases d'honnêteté et de 10 appels kata en HTTP et en MCP. Aucune ligne Z-3, aucun ré-épinglage, aucune ouverture de zone.

## 5. R-25 (estimation contre `753a23a9`, plafond 547)

| Poste | Lignes |
|---|---|
| code : `honestyText` (2), clause (~10), tau (~4), fil-piège (~8) | ~25 |
| T-15 | ~60 |
| T-16 | ~35 |
| N5, N6 | ~25 |
| N3, N2 | ~20 |
| lignes de tueurs | ~3 |
| **Total** | **~170** |

## 6. Questions (défaut entre parenthèses)

- **Q-D3-1. Deux codes sans requête servie possible.** `attest_refused` : `attest` n'a pas d'entrée, il projette un témoin engagé et ne refuse que si ces octets engagés échouent. `ukemi_predict_input_invalid` : l'outil `ukemi-predict` n'est pas enregistré (U-5b). C-3 condition 2 dit « pour chaque code sauf `output_invalid` ». (Liste fermée `NO_SERVED_REQUEST`, épinglée exactement, chaque code avec sa raison écrite dans le test ; le statique de `every_listed_code_has_a_served_thrower_or_is_pending` les garde. La lecture est sous la délégation de C-3 et je la signale à MONARK au G7.)
- **Q-D3-2. Ligne datée pour LATE-CALL-WINDOW-1.** (Le G7 déclare l'échéance « code » tenue et propose le texte ; MONARK l'écrit à l'ADR-CM s'il le veut. D-3 ne touche pas l'ADR.)
- **Q-D3-3. N-2.** (Paramètre facultatif de `honestyText`, défaut servi. Variante : T-16 ne lit que la décision et déclare l'écart.)
- **Q-D3-4. Place du fil-piège.** (À la construction de `SERVED_POLICY_TABLES`, dans `kata-path.ts` ; le chargement du serveur échoue. Variante : `kataClause(tables)` avec la description déplacée après les tables, ce qui décale ~800 lignes de tueurs.)
