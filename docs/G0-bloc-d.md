# G0 du bloc D (contrat 1.1.0) : le bloc kata (B-14, chemin kata servi, B-9 précisée, B-15, LATE-CALL-WINDOW-1)

- **Statut** : G0 écrit avant tout code, arrêté sur les questions de la section 11. Documentation seulement : aucun code, aucun test, aucune PR. Auteur : RECHERCHES.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = **`bc8deef3`** (fusion de #167, lot 3c-4b ; C' entier dans la base avec #164). Elle porte A, B1, B2, W2E-TAIL-1, SERVED-PENDING-1, UKEMI-PENDING-1 et UKEMI-PENDING-SNAPSHOT-1, CM-4b lot a (#141), C1, C2 et C'. Oracle Windows de MONARK à cette tête : 2 546 tests, 0 échec (`recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-167-fusionnee.md`, commit `924176b`, §1). Branche `recherches/bloc-d`, arbre `/home/user/monark-governance-bd`.
- **Sources lues** (lignes citées à `bc8deef3` sauf mention) :
  - ADR-CM (`docs/adr/ADR-CM-chantier-moteur-audit-P3.md`) : §3 l.66 (ligne CM-4), §5 l.99 (B-9), amendement 9 « 2026-10-04 (3) » l.250 (B-9 précisée), l.254 (B-14), l.259 et l.263 (lectures renversées de l.63 et de B-4), l.261 (R-25 en blocs A, B1, B2, C, D), l.293 (LATE-CALL-WINDOW-1) ; lignes datées 2026-10-05 (6) l.310 (« les 32 tables kata restent synthétiques jusqu'à F-5a ») et (8) l.316 (trois échéances de LATE-CALL-WINDOW-1).
  - Plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` (`3e0da1a6…653c`) : §2.2.1, §2.4 (effet de B-14 sur B-10), §5.2.1, **§5.4** (chemin servi), §7, **§8.3 ligne D** (« 4b-i, 4b-ii : chemin kata (§5.4), B-14, B-15 ; instantané en attente régénéré ; servi : B-9 précisée, B-14 ; ~520 en deux lots »), §8.5 (« Le bloc D ajoute la clause kata de la description »), §8.6 (ordre), §9.2, §9.4.
  - Décision déléguée `recherches:coordination/pieces/2026-10-04-CM-4b-avis/DECISION-CM-4b-C1-C11.md` (`bee35dbc…bb5a`) : C-1 à C-11, et la table « Hors délégation ».
  - Réponses de MONARK Z-1 à Z-6 : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-CM-4b-Z.md` (`fd9a6a9`). Z-1 : « Ce qui est servi reste en D, après C » (B-14, câblage, clause, 6 lanceurs, B-15, B-9 précisée ; les deux tests inversés de `gate-byo-confusable.test.ts`). Z-3 : RECHERCHES rédige les 32 textes de classe kata, les textes de ligne et la clause kata ; MONARK fixe les octets par ligne datée avant F-5a. Z-5 : seul le message 400 servi porte le motif réservé.
  - `docs/G0-lot-cm-4b.md`, section « Bloc D (après C) » ; `docs/G7-lot-cm-4b.md`, sections « Pour le bloc C et le bloc D » et « G2 » (m-5).
  - `docs/G0-bloc-c-cm-3c-2.md` : §2 (ordre « C' → D → temps (i) final → actes 2 et 3 → T0 → E »), **§7 bis** (« Ce que le bloc D attend du paquet gelé »), §8, §11 (forme de LATE-CALL-WINDOW-1).
  - `docs/G0-lot-c-prime.md` l.66 (« B-14 et tout le kata (bloc D) ; LATE-CALL-WINDOW-1 (code avec D) ») ; G7 des lots 3c-4a et 3c-4b (`docs/G7-lot-c-prime-a.md`, `docs/G7-lot-c-prime-b.md`) pour la forme des ré-épinglages.
  - Liste r4 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md` : lignes 7, 8, 9, 13, 14, 16, 22.
  - `docs/ETAT.md` : CM-5-PLAN-1 (l.462), CONTRACT-1-1-0 (liste de T0 de MONARK, l.846-860).
  - Code : `apps/harness/src/kata-path.ts`, `policy-classes.ts`, `policy-served.ts`, `tools/gate.ts`, `tools/registry.ts`, `http.ts` ; tests `apps/harness/test/kata-path.test.ts`, `policy-guard.test.ts`, `gate-byo-confusable.test.ts`, `gate-byo-lookalike.test.ts`, `error-code.test.ts` ; `test/harness-served.test.ts` ; `scripts/sync-harness-served.mjs`.
- **Note sur la consigne** : la consigne cite « §8 / §8.1 » de l'ADR-CM pour l'ordre des blocs. L'ADR-CM n'a pas d'ordre de blocs au §8 (c'est « Remède ou raison écrite ») ; l'ordre est au plan r3 §8.3 et §8.6, repris par le G0 du bloc C §2. Ce G0 suit le plan.

## 1. Constat principal

Le plan r3 §8.3 voyait D comme tout CM-4b (~520 lignes R-25, deux lots). Depuis, Z-1 a sorti le non servi en avance : le lot a de CM-4b (#141, R-25 512) a posé le chemin pur `kata-path.ts`, la grammaire de clé partagée, la garde C-8, `servedPolicyTables` et le cliquet statique. **Il reste à D tout ce qui change un octet servi**, plus les fermetures que les décisions renvoient au « dernier lot de D ». Recensé à `bc8deef3`, ce reste pèse environ 600 lignes R-25 (section 5) : une seule PR (≤ 1 205), trois lots (chacun ≤ 547).

Trois points ne sont pas réglés par les documents et bloquent le gel du lot servi (section 11) :
1. **Textes kata et empreintes de table avant F-5a.** Dès que `servedPolicyTables` sert, le `content` et le `policy_table_sha256` de chaque réponse kata portent le texte de classe. La ligne datée (6) de l'ADR-CM (l.310) et C-10 (conditions 1 et 4) veulent les 32 tables kata synthétiques jusqu'à F-5a. Or l'ordre écrit met D avant le temps (i) final et avant F-5a, et l'acte 3 exige à F-5a une empreinte publiée égale au `policy_table_sha256` servi. Les deux textes ne tiennent ensemble que par un go du fondateur, comme Q-F1 pour les trois tables marginales, ou par un lot de textes après F-5a qui rompt l'ordre écrit (Q-D1).
2. **La clause kata de la description** entre dans `/openapi.json` et `tools/list`. `scripts/sync-harness-served.mjs:210-211` exige que les `For '<classe>'` de la description égalent la liste fermée de trois classes : une clause de forme `For 'btc-dir-1h' …` ferait échouer `--pending` (Q-D2).
3. **Le « code » de LATE-CALL-WINDOW-1** n'est défini nulle part : la forme (constante de 300 s) est conclue, la valeur est due avant F-5a, et « le code et les vecteurs » sont dus au G7 du lot de D qui sert `produced_at_stale` (ADR-CM l.316). Le prix écrit à l.293 du plan (« une mesure de latence sur les appels servis, environ 40 lignes d'outil ») suppose des appels servis, qui n'existeront pas avant T0 (Q-D4).

## 2. Périmètre fermé

### 2.1 Lignes B et items servis par D

| # | Source | Ce qui change | Lieu (à `bc8deef3`) |
|---|---|---|---|
| B-14 | ADR-CM l.254 ; C-2 ; Z-1 point 2 | motif kata réservé large `^[a-z0-9]{2,10}-(dir\|range\|mae-down\|mae-up)-(15m\|1h\|4h\|24h)$` (B-1) ; motif réduit exact `^(?:m\|[a-hj-km-z2-9ol]{2,10})-(dlr\|range\|mae-down\|mae-up)-(l5m\|lh\|4h\|24h)$` (B-10), à la place de l'ensemble fini des 32 noms réduits ; message 400 `byo_reserved_kata`, qui cite `KATA_CLASS_RE.source` | `apps/harness/src/tools/gate.ts:737-738` (motif), `:760-765` (`KATA_CLASSES_REDUCED` et son commentaire « exact set, no reduced regex »), `:774` (`.has(cls)`), `:797` (message, octets changés par le seul `.source`) |
| B-14, effets écrits | plan §2.4 points 2 et 3 ; BYO-LOOKALIKE-RESIDUAL-1 (a) (ADR-CM l.231) | refus BYO neufs (`my-range-1h`, `ab-dir-4h`, `doge-dir-1h`, `so1-dir-1h` en `byo_reserved_kata` ; `my_range_1h` en `byo_lookalike_confusable`) ; faux refus i/l étendu à tout `<symbole>-dlr-<h>` (mesuré, déclaré) ; `btc-dir-15m` garde `task_class_retired` sans calibration ; un nom large non enregistré sans calibration garde `task_class_unknown` (C-2 condition 2) ; `a-dir-1h` décide, `rn-dir-1h` rend `byo_reserved_kata` (C-2 condition 1) | `apps/harness/test/gate-byo-confusable.test.ts:56` (`so1-dir-1h` passe de `byo_lookalike_confusable` à `byo_reserved_kata`) et `:64` (`doge-dir-1h` ne décide plus). Le G0 de CM-4b cite `:55` et `:63` : décalage d'une ligne, mêmes tests |
| B-9 précisée et B-15 | ADR-CM l.250 ; plan §5.4 points 1 à 9 ; C-1 condition 4 | les 32 classes kata de la vague 1 deviennent servies, registre de lignes vide : toute requête bien formée rend `under_calib` ; contrat de requête fermé servi (`kata_key_invalid`, `kata_yhat_domain`, `features_digest_required`, `policy_tau_cap`, `policy_alpha_mismatch`, `policy_nmin_mismatch`, `produced_at_off_grid`, `produced_at_stale`) ; lean nul `non_evaluable` après tous les 400 (C-7) | `gate.ts:919-951` (aiguillage de `runGate` : branche kata avant la branche `task_class_unknown` de `:946-951`, après celle de `btc-dir-15m`) ; `nowMs` déjà injecté par `http.ts:102` et `tools/registry.ts:150` |
| verdict kata 1.1.0 | C-1 condition 2 ; G0 du bloc C §7 bis | `KataVerdictFields` et `KATA_REASONS` supprimés ; le verdict servi est un `CoverageVerdict` (raisons, champs neufs, `region: null`, `method: risk-control` déjà dans le paquet gelé) | `apps/harness/src/kata-path.ts:17-37` (type local), `:1-7` (en-tête « No served module imports this file before block D ») ; assemblage du verdict (section 3, point 3) |
| tables servies | C-10 ; Q-C3 (bloc C) | une seule constante `SERVED_POLICY_TABLES = servedPolicyTables(SERVED_TABLE_TEXTS)`, construite une fois au chargement ; `servedCell`, `admittedSplit` et `honestyText` lisent cette constante | `gate.ts:990-998` (`SERVED_TABLE_TEXTS`, `SERVED_MARGINAL_TABLES`), `:1002`, `:1022`, `:703` |
| textes kata (Z-3) | Z-3 ; liste r4 ligne 7 | `SERVED_TABLE_TEXTS.classText` rend aujourd'hui `CASCADE_UNCALIBRATED_SENTENCE` pour toute classe autre qu'USDe et liq (`gate.ts:991`) : sans texte kata, une réponse kata dirait « no cascade calibration is committed ». D ajoute les 32 textes de classe (octets fixés par MONARK, Q-D1) ; tout texte qui cite les durées d'A-1 nomme l'alpha | `gate.ts:991` ; `honestyText` (`gate.ts:701-710`) rend alors `class.text` ou `row.text`, suivi de `; B_t is caller-carried.` |
| clause kata de la description | plan §5.4 point 9 ; §8.5 ; Z-3 | `describeGate` gagne une clause kata qui dit la vérité de la décision C-2 du fondateur (tout `attested` refusé, aucune classe kata n'a de sujet) et le registre vide ; texte fixé par MONARK (Q-D1, Q-D2) | `gate.ts:206-227` |
| 6 lanceurs kata | C-3 condition 3 ; G2 de CM-4b lot a, m-5 | au commit où `gate.ts` importe `kata-path.ts`, les 6 littéraux entrent ensemble dans le graphe servi : `PENDING` devient vide **dans ce commit** ; le même commit inverse `kata_path_is_not_served` et retire `policy-classes.ts` de la liste de `guard_modules_are_not_served` ; `policy-guard.ts` reste hors du graphe servi | `apps/harness/test/kata-path.test.ts:339` (`PENDING`), `:342-349` (cliquet ; l'assertion « a thrower outside the served graph does not count » change d'objet), `:324-328` ; `apps/harness/test/policy-guard.test.ts:179` |
| commentaire C-3 | G0 de CM-4b, section « Bloc D » | « 6 reserved for block D and thrown by nothing yet » et « at the latest at the G7 of CM-4b » deviennent faux ; nombre de lignes du bloc gardé (adresses de tueurs en dessous) | `gate.ts:273-276` |
| C-3 condition 2 | décision C-3 ; liste r4 ligne 8 | au G7 du **dernier** lot de D : `PENDING` vide et cliquet **dynamique** (pour chaque code sauf `output_invalid`, une requête servie en processus rend ce code) | test neuf (section 4) |
| C-4 condition 3 | décision C-4 | forme « de bout en bout » du tueur « a `calib_*` row defers » : par `runGate`, sur une table synthétique à ligne `silence` ; le G7 du dernier lot de D déclare le tueur couvert en entier | test neuf (section 4) ; demande un point d'injection de table (Q-D5) |
| LATE-CALL-WINDOW-1, code et vecteurs | ADR-CM l.316 ; C-9 | au lot qui sert `produced_at_stale` : vecteurs de bord au service (HTTP et MCP, horloge injectée), lecture du « code » selon Q-D4 | `kata-path.ts:51` (péremption, même constante que B-4 : `gate.ts:803`) |
| instantané en attente | plan §8.3 ligne D ; SERVED-PENDING-1 | `/openapi.json` et `tools/list` bougent (clause kata) : `harness-pending.json` régénéré par `--pending` | section 6 |

### 2.2 Ce que D ne fait pas (gelé, ou à d'autres)

- **Paquet gelé** : `packages/contracts/src/`, `schemas/`, `test/contracts-frozen.*` ne changent pas. D9-ter n'admet que deux ré-épinglages (blocs A et C) ; la décision PolicyRow Q-3 le dit (« Le bloc D n'a pas de ré-épinglage »). Tout ce dont D a besoin y est déjà (G0 du bloc C §7 bis, vérifié à `bc8deef3` : `REASONS_WITHOUT_REGION` contient `non_evaluable` et les raisons `calib_*`, `packages/contracts/src/enums.ts:33-34` ; le contrôle fermé admet un ensemble `{up, down}` sous `calib_*`, `closed-check.ts:146-150`).
- **Moteur** : `packages/hikae/` ne change pas. `buildVerdict` calcule `n_calib` et `scores_sha256` depuis des scores (`packages/hikae/src/verdict.ts:43-62`), que le harnais n'a pas pour une ligne kata (CALIB-SEQ-IMPORT-1) : le verdict kata est assemblé dans le harnais depuis les champs de la ligne, puis passe le contrôle fermé (section 3, point 3).
- **Chemins servis USDe, liq, cascade, BYO** : octets inchangés, hors des seuls noms BYO de B-14. Preuve : le rejeu de 111 appels et la projection (`apps/harness/test/served-replay-cm3.test.ts`) ne bougent pas.
- `policy-guard.ts` et `policy-wave2.ts` restent hors du graphe servi ; `calibration.ts`, `class-policy.ts`, `http.ts`, `server.ts`, `openapi.ts`, `schema-projection.ts` ne changent pas (la description passe par `GATE_TOOL_DESCRIPTION`).
- Les horizons 15m et 24h ne sont que **réservés** par B-14 : `KATA_H_MS` (`policy-classes.ts:12`) reste 1h et 4h, et une classe 15m demande sa propre borne de retard par révision datée (plan §5.4 point 4).
- **Hors D** : vague 2 et `policy-wave2.ts` (bloc E, après T0) ; CM-5 et la surveillance (CM-5-PLAN-1) ; ATTEST-KATA-SUBJECT-1 ; le go de service de la vague 1 (Q-F5) et l'ordre « Range and path rows ship before direction rows » ; `HARNESS_VERSION`, la CA de l'hôte, les pages du site, le skill, `apps/harness/README.md` (liste de T0 de MONARK) ; NOTICE-1-1-0 (RECHERCHES la finalise après le gel du lot servi, hors lot).
- **E-10** : l'ADR-CM §8 (l.124) donne comme raison écrite « CM-4 apporte sa propre fonction de label avec `flat` explicite (`kataLabel`) ». Aucun `kataLabel` n'existe à `bc8deef3`, et aucun lot servi n'en a besoin (un label sert à juger une issue, pas à rendre un verdict). D ne l'ajoute pas ; la raison reste à porter par CM-5 (Q-D8).

## 3. Choix de conception (défauts, à confirmer à la G2)

1. **Aiguillage.** Une classe est kata quand elle a une table dans `SERVED_POLICY_TABLES` dont l'entrée de classe porte `cell_key_rule = "kata-bucket"` (appartenance au registre des classes, plan §5.4 point 1 ; jamais le motif réservé). Branche placée après `btc-dir-15m` et avant `task_class_unknown`. L'ordre reste : schéma de version, `produced_at` (B-4, futur compris), gardes BYO (une calibration sur un nom kata rend `byo_reserved_kata` avant toute chose kata), cohérence d'`attested` (un `attested` sur une classe kata rend `attested_inconsistent`), puis le contrat kata (grille et péremption d'abord, C-1 condition 5).
2. **Message `task_class_unknown`.** La liste `known:` (`gate.ts:950`, épinglée par `apps/harness/test/error-code.test.ts:47`) reste inchangée : la changer serait un octet servi hors de la liste fermée (Q-D3).
3. **Verdict kata.** Une fonction du harnais (`kataVerdict`, dans `kata-path.ts`) compose `KataVerdictFields` avec `schema_version`, `task_class`, `residual: []` et `produced_at`, en `CoverageVerdict` ; `nCalib` = `n_calib` de la ligne (0 sans ligne) ; `evaluable` reste `deriveEvaluable` (un lean nul est fini, il passe par la raison `non_evaluable` du verdict, que l'étape 4 de L3 rend telle quelle, `packages/hikae/src/l3-gate.ts:93-94`). `assertClosedGateDecision` (`gate.ts:984`) contrôle le tout.
4. **Cycle d'import.** `gate.ts` importe `kataPath` et `servedPolicyTables` ; `kata-path.ts` ne lit `HarnessToolError`, `rfc3339Instant` et `PRODUCED_AT_FUTURE_TOLERANCE_MS` qu'à l'appel (G7 de CM-4b, « cycle d'import sûr »). Mais `SERVED_POLICY_TABLES` est construite **au chargement** de `gate.ts` : `servedPolicyTables` n'appelle aucun export de `gate.ts`, donc le cycle reste sûr ; le lot le vérifie par un test de chargement à froid de `server.ts`.
5. **Lignes et adresses de tueurs.** Le code neuf de `gate.ts` est placé sous les lignes à tueurs ou à nombre de lignes égal ; ce qui décale une adresse est ré-ancré dans un commit « lignes de tueurs seulement » (précédent : `26fdf987` de 3c-4b), contrôlé par `verifie-ancres.mjs --touched`.

## 4. Lots, tests rouges et tueurs

Trois lots dans une PR « D », empilés en branches, chaque tête verte ; un G0 court, une G2 et un G7 par lot (méthode NB-3). Tueurs en forme fermée `// killer: fichier:ligne OP "avant" -> "après"`, un par test ; adresses indicatives à `bc8deef3`, fixées au gel.

### 4.1 Lot D-1 (CM-4b-b) : B-14

Fichiers : `apps/harness/src/tools/gate.ts` (l.737-738, l.760-765, l.774) ; tests `apps/harness/test/gate-byo-confusable.test.ts` (l.56, l.64) et un fichier neuf `apps/harness/test/gate-byo-kata-wide.test.ts`. Zone RECHERCHES seule.

| # | Test | Rouge à la base parce que | Tueur prévu |
|---|---|---|---|
| T-1 | `byo_wide_kata_names_reserved` : `my-range-1h`, `ab-dir-4h`, `doge-dir-1h`, `so1-dir-1h`, `btc-range-24h`, `eth-mae-up-15m`, `rn-dir-1h` ⇒ `byo_reserved_kata` ; `a-dir-1h`, `my-btc-dir-1h-clone`, `btc-dir-1h-v2` décident | le motif fini ne les réserve pas | `// killer: apps/harness/src/tools/gate.ts:738 CONST "(15m\|1h\|4h\|24h)" -> "(1h\|4h)"` |
| T-2 | `byo_reduced_kata_pattern_is_the_exact_image` : sûreté (tout nom large réduit tombe dans le motif réduit) et exactitude (tout nom réduit qui y tombe a un antécédent large), sur une énumération bornée et un tirage à graine 37 ; `rn` → `m` est le seul symbole d'une lettre | le motif réduit n'existe pas (export neuf) | `// killer: apps/harness/src/tools/gate.ts:761 CONST "(?:m\|" -> "(?:"` |
| T-3 | `byo_confusable_wide_kata_names_refused` : `my_range_1h`, `ab.dir.4h`, `doge_dir_1h` ⇒ `byo_lookalike_confusable` ; faux refus i/l déclaré et mesuré : `abc-dlr-1h`, `usd-dlr-24h` refusés (BYO-LOOKALIKE-RESIDUAL-1 (a)) | l'ensemble fini ne les contient pas | `// killer: apps/harness/src/tools/gate.ts:774 CONST "KATA_CLASS_REDUCED_RE.test(cls)" -> "false"` |
| T-4 | `byo_reserved_kata_body_names_the_wide_pattern` : corps HTTP 400 exact, octet pour octet | le message cite l'ancien motif | `// killer: apps/harness/src/tools/gate.ts:738 CONST "[a-z0-9]{2,10}" -> "(btc\|eth\|bnb\|sol)"` |
| T-5 | `byo_confusable_kata_names_and_keys_refused` (existant, l.54-65) : `so1-dir-1h` passe au code `byo_reserved_kata`, `doge-dir-1h` ne décide plus | les deux assertions inversées | tueur existant (`gate.ts:775`) gardé |
| T-6 | `wide_kata_names_keep_their_class_answer` : `btc-dir-15m` sans calibration ⇒ `task_class_retired` ; `doge-dir-1h` sans calibration ⇒ `task_class_unknown` (C-2 condition 2) | **vert à la base** : épingle de non-régression, déclarée, tueur tiré à la main | à la main : `gate.ts:927 CONST "\"task_class_retired\"" -> "\"byo_reserved_kata\""` |

Octets servis changés (C-2 condition 5, listés au G7 et rejoués par MONARK) : le corps 400 `byo_reserved_kata` (motif cité), et les codes des noms BYO de T-1 et T-3. Aucune empreinte de `/openapi.json` ni de `tools/list` ne bouge ; aucun instantané en attente à régénérer (mesuré au gel).

### 4.2 Lot D-2 (CM-4b-c) : le chemin kata servi

Fichiers : `apps/harness/src/tools/gate.ts` (import, l.206-227, l.273-276, l.701-710, l.919-951, l.990-998, l.1002, l.1022), `apps/harness/src/kata-path.ts` (l.1-37 et l.104-115) ; tests `apps/harness/test/kata-path.test.ts`, `policy-guard.test.ts:179`, fichier neuf `apps/harness/test/gate-kata-served.test.ts` ; ré-épinglages hors zone (section 6).

| # | Test | Rouge à la base parce que | Tueur prévu |
|---|---|---|---|
| T-7 | `kata_path_is_served` (inverse `kata_path_is_not_served`) : `kata-path.ts` et `policy-classes.ts` dans le graphe servi, `policy-guard.ts` hors ; `guard_modules_are_not_served` ne liste plus que `policy-guard.ts` ; chargement à froid de `server.ts` sans erreur de cycle | `gate.ts` n'importe pas `kata-path.ts` | `// killer: apps/harness/src/tools/gate.ts:60 SDL "import { kataPath, kataVerdict, servedPolicyTables } from \"../kata-path.ts\";" -> ""` |
| T-8 | `served_kata_request_contract` : les 8 refus de B-9 précisée en HTTP (miroir en processus) et en MCP, code et message, sur une classe de direction et une classe de bande | `task_class_unknown` à la base | `// killer: apps/harness/src/tools/gate.ts:946 CONST "kataTableOf(taskClass)" -> "undefined"` |
| T-9 | `served_kata_no_row_verdict_and_decision` : 16 champs du verdict sans ligne (plan §2.2.1), direction et bande ; décision `abstain under_calib` ; lean nul ⇒ `abstain non_evaluable` ; `content` = texte de classe suivi de `; B_t is caller-carried.` puis la ligne de résumé | idem | `// killer: apps/harness/src/kata-path.ts:<kataVerdict> CONST "policy_table_sha256: f.policy_table_sha256" -> "policy_table_sha256: null"` |
| T-10 | `served_kata_late_call_window` (LATE-CALL-WINDOW-1) : horloge injectée ; `produced_at` = maintenant − 300 000 ms admis, − 300 001 ⇒ `produced_at_stale` ; + 300 001 ⇒ `produced_at_future` (B-4 d'abord) ; appel direct sans `nowMs` : grille seule, pas de péremption ; même résultat en HTTP et en MCP | idem | `// killer: apps/harness/src/tools/gate.ts:<branche kata> CONST "options.nowMs" -> "undefined"` |
| T-11 | `served_kata_order_against_byo_attested_version` : nom kata avec calibration ⇒ `byo_reserved_kata` ; `attested` ⇒ `attested_inconsistent` ; prédiction 1.0.0 ⇒ `schema_version_unsupported` | **vert à la base** (ces refus précèdent l'aiguillage) : épingle d'ordre déclarée, tueur à la main | à la main : branche kata déplacée avant les gardes BYO |
| T-12 | `describe_gate_kata_clause` : la clause de la ligne datée de MONARK à l'octet ; `liqStateOf` et le contrôle `For '…'` de `sync-harness-served.mjs` tiennent sur la description (Q-D2) | clause absente | `// killer: apps/harness/src/tools/gate.ts:<clause> CONST "<premier mot de la clause>" -> ""` |
| T-13 | `kata_class_text_is_table_text_plus_suffix` : composition Z-3 sur les 32 classes kata (texte servi = texte de classe de la table + suffixe) ; aucun texte kata n'est la phrase cascade | `honestyText` lit `SERVED_MARGINAL_TABLES` | `// killer: apps/harness/src/tools/gate.ts:703 CONST "SERVED_POLICY_TABLES" -> "SERVED_MARGINAL_TABLES"` |
| T-14 | `every_listed_code_has_a_served_thrower_or_is_pending` (existant) : `PENDING` = `[]` | 6 codes en attente | tueur existant (`gate.ts:927`), ré-ancré si besoin |

Test retiré, déclaré : `kata_reasons_within_coverage_reasons` (`kata-path.test.ts:330-337`), son objet (`KATA_REASONS`) disparaît ; le typage par `CoverageReason` le remplace (contrôlé par `tsc`). Empreinte synthétique de `kata_served_tables_digests` (`d32cf528…`) : inchangée si les textes du test restent synthétiques (C-10 condition 1).

### 4.3 Lot D-3 (CM-4b-d) : fermetures du dernier lot

Fichiers : `apps/harness/src/tools/gate.ts` (`RunGateOptions`, l.837-839, si Q-D5 est pris), tests neufs.

| # | Test | Rouge à la base parce que | Tueur prévu |
|---|---|---|---|
| T-15 | `every_code_but_output_invalid_is_thrown_by_a_served_request` (C-3 condition 2) : pour chacun des 31 codes, une requête servie (HTTP en processus, MCP pour les seuls codes que le SDK ne voit pas) rend ce code | les 6 codes kata ne sont rendus par aucune requête | `// killer: apps/harness/src/kata-path.ts:63 CONST "\"kata_yhat_domain\"" -> "\"param_invalid\""` |
| T-16 | `served_calib_row_abstains_never_defers` (C-4, forme de bout en bout) : `runGate` sur une table synthétique dont une ligne de direction est `silence` (et une `vetoed`, une `retired`) ⇒ `abstain calib_*`, jamais `defer set_too_large` ; une ligne `region` ⇒ `commit` ou `defer` selon `tau` ; les points d'entrée HTTP et MCP ne passent jamais de table (Q-D5) | aucun point d'injection | `// killer: packages/hikae/src/l3-gate.ts:93 CONST "REASONS_WITHOUT_REGION.includes(input.verdict.reason)" -> "false"` |

Au G7 de D-3 : `PENDING` vide et cliquet dynamique (C-3) ; tueur « a `calib_*` row defers » déclaré couvert sous ses trois formes (C-4 condition 3) ; LATE-CALL-WINDOW-1 fermé pour son échéance « code » (selon Q-D4).

## 5. R-25 (estimation, `r25()` de `scripts/oracle/r25.mjs` contre la base de chaque lot)

Recensement au code de `bc8deef3`, sans prototype. Incertitude ±25 % (les deux lots de C' ont dépassé leur estimation : 3c-4a ~200 estimé, 344 mesuré).

| Lot | Postes | Code | Tests | Total |
|---|---|---|---|---|
| D-1 | motif large et motif réduit, `.test`, commentaire (nombre de lignes gardé) | ~20 | T-1 à T-6 ~120 | **~140** |
| D-2 | import, `SERVED_POLICY_TABLES`, aiguillage et `kataVerdict` ~35 ; 32 textes de classe ~15 (forme générée par famille et horizon ; ~40 si 32 littéraux) ; clause ~5 ; `honestyText` ~2 ; commentaire C-3 ~3 ; `kata-path.ts` (type local retiré, en-tête) ~30 | ~90 | T-7 à T-14 ~230 ; ré-épinglages ~12 | **~330** (~355 avec 32 littéraux) |
| D-3 | point d'injection ~5 | ~5 | T-15 ~70, T-16 ~35 | **~110** |
| **PR D** | | | | **~580** (≤ 1 205) |

- Le plan r3 §8.3 estimait D à ~520 pour tout CM-4b ; le lot a en a pris 512, et C-3, C-4 et LATE-CALL-WINDOW-1 ont ajouté des postes au dernier lot de D.
- **Coupes nommées** : D-2 > 547 au gel ⇒ la moitié MCP de T-8 (~30) passe en D-3. D-3 > 547 : impossible au vu des postes. Variante : D-3 replié dans D-2 si la mesure de D-2 au gel laisse plus de ~150 de marge (Q-D6) ; la condition « au G7 du dernier lot de D » est alors tenue par D-2.
- `docs/**/*.md` hors du compte. Si R25-GUARDS-2 change `r25()` avant un gel, la mesure suit l'outil de la base du lot.

## 6. Ré-épinglages attendus

Règle de 3c-3b2, reprise par C' : un lot qui change un octet servi met à jour les épingles dans son commit de tests et nomme chaque changement dans son G7 (champ, appels touchés, raison).

- **D-1** : aucune empreinte de surface attendue. Le message 400 `byo_reserved_kata` n'est ni dans `/openapi.json`, ni dans `tools/list`, ni dans les corps de `PENDING_BODIES_SHA256` (`/gate` y est la requête USDe de la CA). Rejeu de 111 appels et projection : inchangés (aucun appel kata ni BYO à nom large), à mesurer au gel.
- **D-2** :
  - `/openapi.json` et `tools/list` (la description gagne la clause kata) : `PENDING_BODIES_SHA256["/openapi.json"]` (`test/harness-served.test.ts:664`) ;
  - `node scripts/sync-harness-served.mjs --pending` : `harness-pending.json`, attendus `written_at` et `openapi_sha256` seuls si la clause n'a pas la forme `For '…'` (Q-D2) ; `pending_since` gardé, `harness-served.json` inchangé ;
  - entrée de `apps/site/data/manifest.sha256.json` et `PINNED` (`test/harness-served.test.ts:49`) ;
  - `node scripts/sync-ukemi-served.mjs --pending` lancé puis annulé si seul `written_at` bouge (aucun champ partagé attendu : `liq_clause` et la phrase cascade ne changent pas) ;
  - tests `hdesc_*` de `apps/harness/test/gate-liq.test.ts` : ils épinglent des clauses, pas la description entière ; à mesurer ;
  - rejeu de 111 appels, projection, bande USDe, traces BYO et H5, 9 décisions de `fixtures/` : inchangés.
- **D-3** : aucun, si le point d'injection ne change aucun octet servi (preuve au G7 : `/openapi.json`, `tools/list` et les corps épinglés égaux entre la base de D-3 et son gel).
- **Lignes datées et empreintes** : D-2 fait bouger du texte servi (32 textes de classe, clause kata). Comme Z-3 pour C', **MONARK écrit une ligne datée avant le gel de D-2**, avec les empreintes UTF-8 complètes des 32 textes de classe et de la clause. RECHERCHES rédige les textes (Z-3), les mesure au G0 court de D-2 et les lui transmet. Si Q-D1 est pris, l'ADR-CM reçoit une ligne datée du go du fondateur (comme la ligne (6) pour Q-F1), rédigée par RECHERCHES, contrôlée par MONARK. B-14 : le G7 de D-1 liste les octets du message (C-2 condition 5) ; pas de ligne datée par défaut (Q-D7).
- **Paquet gelé** : aucun ré-épinglage (`contracts_frozen` vert sans toucher le manifeste).

## 7. Préconditions

- **P-1. Base.** C' entier dans la base (`bc8deef3`, #164 et #167) : **rempli**. Le code de chaque lot part de la tête de la base au moment de son G0 court.
- **P-2. Réponse du fondateur à Q-D1** (publication des 32 textes de classe kata et des empreintes des 32 tables kata vides avant F-5a), portée par RECHERCHES (règle 8) et relayée par MONARK : **avant le gel de D-2**. Hors délégation (C-10 condition 4).
- **P-3. Ligne datée de MONARK (Z-3 de D)** : octets et empreintes des 32 textes de classe kata et de la clause kata de la description, après passage par la porte de vocabulaire (aucun nom de lieu : `\bbinance\b` est un motif du site, `vocab-banned.json:55`), **avant le gel de D-2** ; seconde ligne si un texte change avant F-5a.
- **P-4. Réponses de MONARK** à Q-D2, Q-D3, Q-D5, Q-D6, Q-D7 ; contrôle par diff de chaque lot ; oracle Windows à chaque tête.
- **P-5. Ouvertures de zone** (par nom et durée ; les ouvertures de C' ont pris fin à la fusion de #167) :

  | Fichiers | Lot | Durée |
  |---|---|---|
  | `apps/site/data/harness-pending.json` (réécrit par `--pending`), `apps/site/data/manifest.sha256.json` (une entrée) | D-2 | jusqu'à la fusion de la PR D |
  | `test/harness-served.test.ts` (`PINNED` l.49 et `PENDING_BODIES_SHA256` l.663-668 seulement) | D-2 | idem |
  | `apps/site/data/ukemi-pending.json` et son entrée de manifeste | D-2 | seulement si un champ partagé bouge (attendu : non) |
  | `scripts/sync-harness-served.mjs` (et `.d.mts`, et son test) | D-2 | seulement si MONARK veut les classes kata dans `classes` (Q-D2, défaut : non) |

- **P-6. Décision LATE-CALL-WINDOW-1** (Q-D4) avant le G7 de D-2 ; si la lecture proposée est prise, ligne datée de l'ADR-CM qui ferme l'échéance « code », contrôlée par MONARK.
- **P-7. NOTICE-1-1-0** : la phrase sur l'élargissement des noms réservés, avec un nom BYO accepté aujourd'hui et refusé à T0 (C-2 condition 4), est vérifiée dans le brouillon de RECHERCHES avant le G7 de D-1 ; finalisation après le gel de D-2. Pas de condition de code.
- **P-8.** Z-5 répondu (aucune surface publique ne liste les noms réservés) : rien à faire côté MONARK pour B-14 avant T0.

## 8. Windows (oracle de MONARK)

- Les tests de graphe d'import (`kata_path_is_served`, `guard_modules_are_not_served`) comparent des chemins construits par `join` des deux côtés ; aucun séparateur `/` écrit en dur dans une comparaison de chemin.
- Le test de propriété de T-2 est déterministe (graine 37, énumération bornée) et court (cible < 2 s sous charge) : précédents de charge (#157, MUTANTS-LIVE-WAITER-AHEAD-1, TEST-FORCE-EXIT-REPORT-LOSS-1).
- Aucune horloge réelle : `nowMs` injecté partout (K-8), grille et instants calculés en UTC par `rfc3339Instant` ; aucun test ne dépend du fuseau de la machine.
- Requêtes en processus (`handleJsonMirror`, serveur MCP en mémoire) : aucun port, aucun processus fils.
- Aucun nom de fichier réservé sous Windows (`nul`, `con`, `aux` : précédent #166) ; aucun lien symbolique ; aucune fixture binaire.
- Octets épinglés calculés sur LF (`harness-pending.json`, manifeste du site) par les écrivains existants (`sync-harness-served.mjs`) ; aucun fichier épinglé écrit à la main.
- Tout saut `win32` est nommé et justifié dans le test (précédent #153) ; aucun n'est prévu.

## 9. Preuve et oracle (par lot)

Commits : G0 court ; tests rouges ; code (gel) ; lignes de tueurs seulement si besoin ; G7. `node scripts/red-proof.mjs --base <base du lot> --gel <gel> --repo /home/user/monark-governance-bd --draw n --seed 37` ; `verifie-ancres.mjs . --touched <base> HEAD` (0 dérivé, 0 perdu) ; `tsc --noEmit`, `eslint .`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check` ; `npm test` complet (0 rouge attendu ; Node 24.21.0, variables de proxy retirées, TMPDIR propre) ; octets servis base contre gel (`/openapi.json`, `tools/list`, corps épinglés, CA) ; rejeu de `wave1.json` hors dépôt par le chemin servi (32 tables, 280 lignes, `cell_key` retrouvée) au G7 de D-2. `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé ; jamais `git add -A`.

## 10. Désaccords entre documents, relevés

- **`policy-marginal.ts` dans `guard_modules_are_not_served`** : le G0 de CM-4b (section « Bloc D ») et son G7 disent que D retire `policy-classes.ts` **et `policy-marginal.ts`** de cette liste. À `bc8deef3`, la liste est `["policy-classes.ts", "policy-guard.ts"]` (`policy-guard.test.ts:179`) : `policy-marginal.ts` en est sorti au bloc C, quand `policy-served.ts` l'a fait entrer dans le graphe servi. Lecture retenue : D retire `policy-classes.ts` seul ; `policy-guard.ts` reste.
- **Lignes des tests inversés** : `gate-byo-confusable.test.ts:55` et `:63` dans Z-1 et le G0 de CM-4b ; `:56` et `:64` à `bc8deef3` (mêmes assertions).
- **Lots de D** : le plan r3 §8.3 dit « 4b-i, 4b-ii, ~520 » pour tout CM-4b ; après Z-1, le lot a de CM-4b (512) en a pris la partie pure. Les noms D-1, D-2, D-3 de ce G0 remplacent 4b-i et 4b-ii.
- **Textes kata et ordre des blocs** : section 1, point 1 (Q-D1).
- **Échéance de LATE-CALL-WINDOW-1** : « avant le G7 de CM-4b » (ADR-CM l.293, plan §9.4) est remplacée par les trois échéances de la ligne datée (8) (l.316) ; ce G0 suit l.316.
- **E-10** (`kataLabel`) : section 2.2, dernier point.

## 11. Questions (défaut proposé entre parenthèses)

### Pour le fondateur (porté par RECHERCHES, relayé par MONARK)

- **Q-D1. Les 32 tables kata réelles avant F-5a.** À partir de D-2, le code du dépôt public sert les 32 textes de classe kata, donc l'empreinte réelle de chaque table kata vide (`policy_table_sha256`), avant le go F-5a. Tout le reste de ces tables est déjà public (constantes de `policy-classes.ts`, registre de lignes vide) ; le texte est la seule donnée neuve, et MONARK en fixe les octets (Z-3). (**Oui**, comme Q-F1 pour les trois tables marginales. Sans ce go, il faut soit servir en D-2 des textes synthétiques puis poser les vrais textes dans un lot après F-5a et avant T0, ce qui rompt l'ordre écrit « D → temps (i) final → actes 2 et 3 → T0 » et l'acte 3, soit retarder le gel de D-2 jusqu'à F-5a.)

### Pour MONARK

- **Q-D2. Forme de la clause kata.** `sync-harness-served.mjs:210-211` refuse toute classe `For '<x>'` hors de sa liste de trois. (Clause rédigée sans la forme `For '…'`, qui nomme la règle des 32 noms servis et renvoie à la spécification §9 : la synchro ne change pas, `classes` garde trois entrées jusqu'à T0. Variante : les classes kata entrent dans `classes`, avec une ouverture de zone sur la synchro et son test.)
- **Q-D3. Message `task_class_unknown`.** (Inchangé : la liste `known:` garde trois classes. La changer serait un octet servi hors de la liste fermée du §5.)
- **Q-D5. Point d'injection de table pour le tueur de bout en bout (C-4).** Le registre servi n'a aucune ligne ; une ligne `silence` n'atteint `runGate` que par une table injectée. (`RunGateOptions.policyTables`, optionnel, jamais passé par `http.ts` ni `tools/registry.ts`, ce que T-16 vérifie. Variante : une fabrique `makeRunGate(tables)` exportée pour les tests seulement.)
- **Q-D6. Découpe.** (Trois lots, D-1 ~140, D-2 ~330, D-3 ~110, une PR ~580. Variante : D-3 replié dans D-2 si la marge mesurée au gel de D-2 dépasse ~150.)
- **Q-D7. Ligne datée pour le message de B-14.** (Non : le message cite le motif de la ligne B-14 acceptée, à l'octet ; le G7 de D-1 liste les octets changés et MONARK les rejoue, C-2 condition 5.)

### Lectures (sous la délégation ; défaut entre parenthèses)

- **Q-D4. Le « code » de LATE-CALL-WINDOW-1.** (Le code est le contrôle de péremption servi, déjà écrit en pur à `kata-path.ts:51` et branché en D-2 sur l'horloge injectée par `http.ts:102` et `tools/registry.ts:150` ; les vecteurs sont ceux de T-10. Le remède de l'item (borne par classe tirée de la latence mesurée, ou DECIDED-AT-1) reste un résidu déclaré en spécification §12 : aucun appel kata servi n'existe avant le go Q-F5, donc aucune latence à mesurer. L'échéance « code » se ferme au G7 de D-2 par une ligne datée de l'ADR-CM ; l'item reste ouvert pour la mesure, déclencheur : service de la vague 1.)
- **Q-D8. E-10.** (Pas en D ; la raison écrite de l'ADR-CM §8 passe à CM-5 (CM-5-PLAN-1), qui juge les issues et aura besoin d'un label avec `flat` explicite.)
- **Q-D9. Assemblage du verdict kata.** (Dans le harnais, depuis les champs de la ligne, contrôlé par le contrôle fermé ; aucun changement de `packages/hikae`. Variante : un constructeur `cellVerdict` dans `hikae` qui prend `n_calib` et `scores_sha256` tels quels ; elle touche le moteur pour un seul appelant.)
