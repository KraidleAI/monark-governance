# G7 du lot D-3 (bloc D, contrat 1.1.0) : fermetures du dernier lot (C-3, C-4, LATE-CALL-WINDOW-1) et points reportés

- **Plan** :
  - `docs/G0-bloc-d.md` §4.3, §5, §6 ;
  - G0 court `docs/G0-bloc-d-3.md` ;
  - `docs/G7-lot-d-2.md` §7 (reportés en D-3) ;
  - G2 de D-1 et de D-2 (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-bloc-d-lot-d-1.md`, `G2-bloc-d-lot-d-2.md`).
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `753a23a9` (D-1 par #169, D-2 par #171).
- **Commits** sur la branche `recherches/bloc-d-3` (gel construit sur `wip/bloc-d-3-gel`, poussé en avance rapide) :
  - `467891c9` : G0 court ;
  - `ac9ee179` : tests rouges ;
  - `49e17dad` : **gel** ;
  - `677051b2` : lignes de tueurs seulement (3 tueurs dont le texte suit le code) ;
  - `470db08a` : le test de chargement à froid passe dans `gate-kata-served.test.ts` (§4, tueurs) ;
  - `79a92c08` : G7 ;
  - pli de la G2 de D-3 : `82db37e5` (tests N-1 et N-2), `da2098e7` (N-2, code) ;
  - ce commit (G7 complété, §8).
- **Aucun octet servi ne bouge** (§2). Pas de ligne Z-3, pas de ré-épinglage, pas d'ouverture de zone.

## 1. Ce que le lot change

**`apps/harness/src/tools/gate.ts`** (nombre de lignes inchangé : aucune adresse de tueur ne bouge hors des trois lignes ré-ancrées) :
- `kataClause(entries, tauCap)` : les deux sources de la clause deviennent des paramètres, avec les valeurs servies par défaut (N-5) :
  - la règle des noms est tirée des entrées : symboles, familles et horizons, dans l'ordre d'apparition ;
  - un contrôle de produit refuse un ensemble de classes qui n'est pas le produit de ses parties, donc la forme en accolades ne peut pas mentir ;
  - le plafond de `tau` vient de `KATA_DIR_TAU_CAP` ;
- `honestyText(taskClass, cellKey, isByo, tables = SERVED_POLICY_TABLES)` : les tables lues deviennent un paramètre facultatif (N-2). `registry.ts:76` ne le passe pas ;
- `SERVED_POLICY_TABLES = kataTablesHoldNoRow(servedPolicyTables(SERVED_TABLE_TEXTS))` : la construction servie passe par le fil-piège (N-6).

**`apps/harness/src/kata-path.ts`** :
- le refus `policy_tau_cap` lit `KATA_DIR_TAU_CAP` (message identique pour la valeur 1) ;
- `kataTablesHoldNoRow(tables)`, en fin de fichier : il échoue si une table kata porte une ligne, en nommant KATA-CLAUSE-COMMITTED-STATE-1 et les classes. Les tables marginales ne sont pas visées.

**`apps/harness/src/policy-classes.ts`** : `KATA_DIR_TAU_CAP = 1`, en fin de fichier.

**Tests** :
- `error-code.test.ts` : T-15 et la liste fermée `NO_SERVED_REQUEST` ;
- `gate-kata-served.test.ts` : T-16, `kata_tables_hold_no_row_tripwire`, `kata_clause_reads_its_names_and_tau_cap`, `kata_path_and_server_load_cold` ;
- `gate-byo-kata-wide.test.ts` : `byo_one_letter_m_is_a_lookalike_of_rn` ;
- `kata-path.test.ts` : une ligne de tueur ré-ancrée.

## 2. Octets servis : preuve d'égalité entre la base et le gel

Script hors dépôt, lancé en processus sur l'arbre de la base (`753a23a9`) puis sur le gel. Il calcule le sha256 et la taille de 64 artefacts. Les deux sorties sont **identiques, ligne pour ligne** (`diff` vide). Extrait :

| Artefact | sha256 | Octets |
|---|---|---|
| `/openapi.json` | `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0` | 29 643 |
| réponse MCP `tools/list` | `b634e7e142bb90558a0768801505c3d5ab7c7fd7203b89f8070b2a86729a1580` | 17 657 |
| corps `/gate` (`GATE_BODY`) | `701e9b068944aca7a9c49bb5415fa2af21006b4ba696c916108c4d326445a08c` | 1 912 |
| corps `/gate` (`GATE_LIQ_BODY`) | `e2bfb18be056b2ed6f0d1cdae681d9b9e38ede054c79509898243d327a105fe7` | 1 594 |
| corps `/calibrate` | `f169e9f6e333374a9d47a2010674ca789aba45bd126ef8764df2f0fb86a2cb90` | 1 162 |
| `/health` | `d754b2feb82a3c45588e379d4d343c140ee8229d63f6771c940c27121c90f441` | 97 |
| description de `gate` | `dd7287793b229a3e083286ac1a7333f646d3cc3a323071d129bff702c4551ef3` | 3 971 |
| clause kata, `kataClause()` | `022756c39c3f3aa381a39f313ebb92236d237d75e770febe3822de047898e803` | 723 |
| 35 paires `[task_class, policy_table_sha256]` | `8da5dd421260d96e4b3dafa48733185b377df64261480aa92cdbeec9b462d2eb` | 2 995 |

- Le reste : les 35 phrases d'honnêteté servies (`honestyText` sans tables), et 10 appels kata en HTTP et en MCP (2 bien formés sur une classe de direction, dont le lean nul, 1 sur une bande, et les 7 refus de T-8 hors `features_digest_required`).
- Les quatre corps de `PENDING_BODIES_SHA256` sont ceux de la base (`test/harness-served.test.ts:663-668`, test vert). `harness-pending.json`, le manifeste du site et la trace H5 ne sont pas touchés.

## 3. Fermetures

- **C-3 condition 2 (cliquet dynamique)** :
  - `PENDING` est vide depuis D-2 ;
  - T-15 envoie une requête servie par code de la liste ; chaque requête rend 400 et son code en HTTP en processus, et le même code dans `_meta` en MCP pour les 27 codes qu'un outil lance (le SDK répond lui-même à `input_invalid` et `json_invalid`, sans code) ;
  - la liste des codes sans requête est fermée et épinglée exactement. Un code ajouté sans requête ni raison rougit.
  - **Écart déclaré (Q-D3-1)** : la condition dit « pour chaque code sauf `output_invalid` ». Deux codes n'ont aucune requête servie possible :
    - `attest_refused` : `attest` n'a pas d'entrée ; il projette un témoin engagé et ne refuse que si ces octets échouent ;
    - `ukemi_predict_input_invalid` : l'outil `ukemi-predict` n'est pas enregistré (U-5b).
  - Ils sont dans `NO_SERVED_REQUEST`, chacun avec sa raison. Depuis le pli de N-1 (G2 de D-3), `no_served_request_reasons_hold` vérifie ces raisons : `ukemi-predict` absent de `REGISTERED_TOOL_NAMES`, `ATTEST_INPUT_SCHEMA` sans propriété et `additionalProperties: false`. Le contrôle statique ne les garde pas vraiment : il parcourt tous les `tools/*.ts`, `ukemi-predict.ts` compris. Lecture prise sous la délégation de C-3. Je la signale à MONARK : à U-5b, `ukemi_predict_input_invalid` doit sortir de la liste.
- **C-4 condition 3** : le tueur « a `calib_*` row defers » est couvert sous ses trois formes :
  - verdict pur : `kata_row_statuses_map_to_regions` (CM-4b, lot a) ;
  - décision L3 : bloc C, lot 3c-2 ;
  - de bout en bout : T-16 (`served_calib_row_abstains_never_defers`). Par la couture, une ligne `silence`, `vetoed` ou `retired` de `btc-dir-1h` donne `abstain` avec sa raison, à tau 1, horloge ouverte, intention dans `{up, down}`. Sans l'étape `calib_*` de L3, la décision serait `defer set_too_large` : le tueur `l3-gate.ts:93` est tué.
- **LATE-CALL-WINDOW-1, échéance « code »** (ligne datée (8), l.316 ; Q-D4, réponse de MONARK « d'accord ») :
  - **tenue** : le contrôle servi (`assertKataProducedAt`, `kata-path.ts:47`, sur l'horloge injectée par `http.ts:102` et `registry.ts:150`) est en place depuis D-2 ;
  - vecteurs de T-10 (`served_kata_late_call_window`) : − 300 000 ms admis, − 300 001 ms rend `produced_at_stale`, + 300 001 ms rend `produced_at_future` ;
  - T-15 rejoue `produced_at_stale` par une requête servie ;
  - l'item reste ouvert pour la mesure de latence ; déclencheur : service de la vague 1 ;
  - texte proposé pour la ligne datée, si MONARK la veut (Q-D3-2) : « LATE-CALL-WINDOW-1 : échéance « code » tenue au bloc D (D-2 sert `produced_at_stale` sur l'horloge injectée, contrôle `assertKataProducedAt` à `apps/harness/src/kata-path.ts:47` ; vecteurs du test `served_kata_late_call_window` (T-10) ; G7 de D-3). Reste ouvert : remède de latence, déclencheur le service de la vague 1. »

## 4. Points reportés de D-1 et D-2

| # | Point | Suite |
|---|---|---|
| D-1 N-2 | `m-dir-1h` | **épinglé** : `byo_one_letter_m_is_a_lookalike_of_rn`. `m-dir-1h`, `m_dir_1h`, `M-DIR-1H` et `m-range-4h` rendent `byo_lookalike_confusable` (imitation de `rn-<famille>-<h>`) ; `a-dir-1h`, `n-dir-1h` et `r-range-4h` décident |
| D-1 N-4 | taille du faux refus i/l | **mesurée**, voir ci-dessous |
| D-2 N-2 | la couture et `honestyText` lisaient des tables différentes | **plié** : `honestyText` prend les tables lues. T-16 vérifie que, sur les tables de la couture, la phrase est le texte de la ligne, et que sans elles c'est le texte de classe servi |
| D-2 N-3 | chargement à froid | **plié** : `kata_path_and_server_load_cold`. `kata-path.ts` puis `server.ts`, chacun importé en premier dans un processus enfant neuf, se chargent et servent 35 tables |
| D-2 N-5 | `tau` et règle des noms tapés dans la clause | **plié** : `KATA_DIR_TAU_CAP` et la règle tirée des entrées. `kata_clause_reads_its_names_and_tau_cap` rend la clause sur 8 entrées et tau 0.5 |
| D-2 N-6 | pas de fil-piège pour l'état engagé | **plié** : `kataTablesHoldNoRow` sur la construction servie (§1). Le fil est à la construction et non dans `kataClause()` : la description est calculée au chargement avant `SERVED_POLICY_TABLES` (`gate.ts:262` contre `:1042`) |

**Faux refus i/l (D-1 N-4).**
- Le faux refus déclaré par l'ADR (BYO-LOOKALIKE-RESIDUAL-1 (a)) est la famille `<s>-dlr-<h>`, avec s ∈ `[a-z0-9]{2,10}` et h ∈ {`15m`, `1h`, `4h`, `24h`}.
- Elle est en bijection avec la famille `dir` du motif large : `<s>-dir-<h>` est réservé par B-1, son jumeau `<s>-dlr-<h>` est refusé par B-10. Sa taille est donc celle de la famille `dir` : 4 × Σ_{k=2..10} 36^k = **15 042 480 439 116 096 noms**. C'est le quart des 60 169 921 756 464 384 noms du motif large.
- Mesure par `runGate` (script hors dépôt) :
  - les 5 184 noms `<s>-dlr-<h>` de symbole à 2 caractères rendent tous `byo_lookalike_confusable`, et leurs 5 184 jumeaux `<s>-dir-<h>` rendent tous `byo_reserved_kata` ;
  - un tirage à graine 37 de 20 000 noms à symbole de 3 à 10 caractères : 20 000 refusés.
- Les autres antécédents de la réduction (`lh`, `ih` ou `l5m` pour l'horizon, `d1r`, `0` pour `o`) imitent un jeton de famille ou d'horizon : ce sont des imitations fidèles, pas des faux refus.

## 5. Oracle (Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR dans le dossier de travail)

- **red-proof** : `node scripts/red-proof.mjs --base 753a23a9 --gel 470db08a --repo . --draw 3 --seed 37`.
  - 6 tests jugés : **3 F2P** (T-16, `kata_tables_hold_no_row_tripwire`, `kata_clause_reads_its_names_and_tau_cap`), 3 tueurs tirés, 3 tués.
  - 3 tests refusés « green at base », déclarés au G0 court : T-15, `kata_path_and_server_load_cold`, `byo_one_letter_m_is_a_lookalike_of_rn`. La sortie vaut 1 pour cette seule raison.
  - `RED-PROOF.json` : sha256 `e232c926c2dee83cd382213424437351af5b1ee73ea60029a5d328547b5e5448`.
- **Tueurs tirés à la main** (tous tuent par assertion ; fichier restauré et sha256 contrôlé après chaque tir) :
  - T-15 : `kata-path.ts:59 CONST "\"kata_yhat_domain\"" -> "\"param_invalid\""` ;
  - `kata_path_and_server_load_cold` : `kata-path.ts:118 CONST "kataClassEntries(texts.classText)" -> "kataClassEntries(TIME_FIELDS.global ? texts.classText : texts.classText)"`. La mutation lit une constante de `kata-path.ts` pendant le chargement de `gate.ts` : elle échoue (TDZ) quand `kata-path.ts` est chargé en premier. Placé d'abord dans `kata-path.test.ts`, le test rougissait par le chargement du fichier de test lui-même, qui importe `kata-path.ts` en premier. D'où `470db08a` : le test vit dans `gate-kata-served.test.ts`, qui charge `gate.ts` en premier, et rougit par assertion ;
  - `byo_one_letter_m_is_a_lookalike_of_rn` : `gate.ts:799 CONST "(?:m|" -> "(?:"` ;
  - T-13 ré-ancré : `gate.ts:738 CONST "tables: readonly ServedTable[] = SERVED_POLICY_TABLES" -> "tables: readonly ServedTable[] = SERVED_MARGINAL_TABLES"` ;
  - `kata_tau_cap_on_set_classes` ré-ancré : `kata-path.ts:62 CONST "!(params.tau <= KATA_DIR_TAU_CAP)" -> "!(params.tau <= 2)"` ;
  - en plus, hors forme fermée : le fil-piège retiré de la construction servie (`gate.ts:1042`) rougit `kata_tables_hold_no_row_tripwire` ; `honestyText` revenu à `SERVED_POLICY_TABLES.find` (`gate.ts:740`) rougit T-16 ; « tau at most 1 » tapé (`gate.ts:236`) et le contrôle de produit neutralisé (`gate.ts:230`) rougissent `kata_clause_reads_its_names_and_tau_cap`.
- **Ancres** : `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` donne 46 tueurs, 46 ancrés (au pli de la G2), 0 dérivé, 0 perdu. Sur l'arbre entier : 1 205 tueurs, 8 perdus, ceux de la base.
- **R-25** (`r25()` contre la base) : **198** (+176/−22) au gel, **219** (+196/−23) au pli de la G2, sous la borne de 547 ; CONTENT_STAT 0 ; GREEN. Estimation du G0 court : ~170.
- **Tests** : `npm test` complet à `470db08a` : 2 568 tests, 2 546 réussis, 22 sautés, 0 échec.
- **Contrôles statiques** : `tsc --noEmit` 0 ; `eslint .` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK.
- Windows :
  - le test à froid lance `process.execPath` avec `--input-type=module -e` et des URL `file:` construites par `pathToFileURL(join(…))` : aucun séparateur écrit en dur, aucun port ;
  - T-15 et T-16 tournent en processus, horloge injectée ;
  - aucun fichier de fixture neuf, aucun saut `win32`.
- `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé ; aucun `git add -A`.

## 6. Écarts au G0

- Le point d'injection (Q-D5) était posé dès D-2 : le poste « ~5 lignes » de D-3 est vide.
- T-15 est vert à la base (D-2 sert les six codes kata) : épingle déclarée, tueur tiré à la main. Les codes sans requête sont l'écart de Q-D3-1 (§3).
- Le tueur de T-15 prévu au G0 du bloc (`kata-path.ts:63`) est à `:59`, ligne du refus `kata_yhat_domain`.
- Le tueur de `kata_clause_reads_its_names_and_tau_cap` a été réécrit au gel sur le code réel (`${names.join("-")}`), dans `677051b2`.
- Le test de chargement à froid a changé de fichier (§5).

## 7. Questions ouvertes

- **Q-D3-1** (pour information de MONARK) : les deux codes sans requête servie, et la sortie de `ukemi_predict_input_invalid` de la liste à U-5b.
- **Q-D3-2** (MONARK) : la ligne datée de l'ADR-CM pour l'échéance « code » de LATE-CALL-WINDOW-1, si MONARK la veut ; texte proposé au §3.
- KATA-CLAUSE-COMMITTED-STATE-1 reste ouvert : le fil-piège le rend bloquant au chargement, et sa clause d'état engagé, avec sa ligne Z-3, vient avec la première ligne kata (vague 1).

## 8. Points de la G2 de D-3 et suite donnée

G2 : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-bloc-d-lot-d-3.md`. Verdict **APPROUVÉ**, aucun bloquant, aucune réserve.

| # | Point | Suite |
|---|---|---|
| N-1 | les raisons de `NO_SERVED_REQUEST` ne sont vérifiées par rien | **plié** : `no_served_request_reasons_hold` (`error-code.test.ts`). Vert à sa base, déclaré ; tueur tiré à la main, tué : `schema-projection.ts:266 CONST "additionalProperties: false" -> "additionalProperties: true"`. À U-5b, l'enregistrement de `ukemi-predict` le rougit |
| N-2 | le contrôle de produit de `kataClause` compare des cardinaux | **plié** : `gate.ts:230` refuse aussi un `task_class` en double (même ligne, aucune adresse décalée). Test `kata_clause_refuses_duplicate_classes` : `eth-dir-1h` en double à la place de `btc-dir-1h` lève ; rouge par assertion avant le code ; tueur tiré à la main, tué : `gate.ts:230 CONST "new Set(entries.map((e) => e.task_class)).size !== entries.length \|\| " -> ""` |
| N-3 | les lignes synthétiques de T-16 ne sont pas des `PolicyRow` valides | note portée à la vague 1 (avec KATA-CLAUSE-COMMITTED-STATE-1) : bâtir les lignes de la couture par `buildPolicyTable` sur des lignes complètes. Aujourd'hui `kataVerdictFields` ne lit que les champs posés, et T-16 ne lit pas `policy_row_sha256` |
| N-4 | le nom de T-15 n'exempte pas qu'`output_invalid` | déclaré : le nom est l'ancre du plan ; `NO_SERVED_REQUEST` et §3 disent les trois exemptions |

Au pli : octets servis remesurés par le même script, base contre tête, **identiques** sur les 64 artefacts ; tests touchés et suite harnais (`apps/harness/test/*.test.ts`, `test/harness-served`, `test/h5-e2e-probe`, `test/site-build-fleet`) 307 réussis, 0 échec ; `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate`, `export:check` OK. Base refetchée : inchangée (`753a23a9`).
