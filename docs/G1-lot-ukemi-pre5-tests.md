Modèle résolu : claude-opus-5-5[1m]

# RENDU — MICRO-PLI TEST-ONLY « pré-étape 5 » (CARTO-T1C-5, C-V4b-3 / VX-L2, I-V-1 = O-B, O-D)

- Worker : claude-opus-5-5[1m], effort max (décision 133). Aucun commit (R-20), aucun workflow.
- Worktree : `F:\Monark-wt-pre5`, branche `lot/ukemi-pre5-tests`, base `0383e5b6109cf295d55cff22b8fb823db0ccb821` (= pointe `lot/etude-suite` au lancement).
- Rendu au fil de l'eau (ce fichier). Temporaires : `F:\tmp\pre5\` (TEMP/TMP/TMPDIR = `F:\tmp\pre5\tmp`), cache npm `F:/tmp/npm-cache`.
- Consigne : `docs/CONSIGNE-STANDARD-G1.md` A-1..A-13 (section « point par point » en fin de rendu).

## Journal horodaté (`date -u`)

- 2026-09-23T07:11:20Z — orientation : worktree présent à `0383e5b`, branche `lot/ukemi-pre5-tests`, `git status` vide.
- 07:1xZ — lectures (définitions exactes des items) :
  - ADR-U4b `:990` et `:1444` (CARTO-T1C-5 : test `u4b_chain_select_to_oracle_path`, `runSelect` -> `episode-selection.json` -> `run()` du prober, seul `fetch` bouchonné) ; ruling G7 `docs/CHANTIERS.md:990` (a) : micro-pli test-only AVANT l'étape 5, portant aussi C-V4b-3 ; cartographie `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md:157` (paire P-U3, « aucune composition réelle ») et `:250`.
  - ADR-U4b `:1442` + `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md` §2/§4 (C-V4b-3 : épingler le refus `--ledger-dir` SOUS la racine pour la sonde, DANS `u4b_probe_cutoff_refuses_before_any_fetch` ; mutant VX-L2 du validateur). Mutant exact relu dans le harnais du validateur `F:\tmp\cp2-u4b1b4\mutants-mine-4b.mjs` : `assertLedgerDir(ledgerArg, ROOT)` -> `assertLedgerDir(ledgerArg, "Z:/nowhere-root")`, tueur visé `u4b_probe_cutoff_refuses_before_any_fetch`, SURVIVED au cp-2 (`logs/mutants-mine-4b.log:18`).
  - ADR-U4b `:1750` + `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md` §3.1 VZ-3 / §5.3 + `docs/G2-lot-u4b-stats-1-1c.md` O-B (I-V-1 : `--out` sur un autre lecteur, parent inexistant => « parent directory does not exist », jamais « inside the repository », 0 écriture ; tue VZ-3). Mutant exact : `F:\tmp\cp2-u4bstats1-1c\vz-mutants.mjs:18-19` (`|| isAbsolute(rel)` -> `|| false`) ; R02 du G2 identique (`F:\tmp\g2-u4bstats1-1c\scripts\g2-1c-mutants.mjs:47-49`).
  - ADR-U4b `:1751` + G2 1c O-D (recompute indépendant de `body_digest` depuis le fichier ÉCRIT, dans T17 = `u4b_hyp_report_e2_end_to_end_deterministic_body_digest`) ; mutant exact R12 : `F:\tmp\g2-u4bstats1-1c\scripts\g2-1c-mutants.mjs:76-78` (corps écrit `h3.pooled.verdict = "NON"`, digest sur le corps en mémoire), SURVIVED au G2 1c.
  - Ruling G7 STATS-1 `docs/CHANTIERS.md:1005` (e) : I-V-1 et O-D = items formés, prochain pli test-only.
  - O-E (`docs/CHANTIERS.md:1001`, ADR `:1753`) : format du registre d'exclusion ; déclencheur « prochain lot qui exclut un test ».
- 07:21:27Z — invariants AVANT (sha256 LF et brut, fichiers LF) : `F:\tmp\pre5\INVARIANTS-BEFORE.txt` ; 9 gelés §2 = préfixes RUNBOOK 0.6 (`2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91 0e232519 3603265d cb020425`), prereg `1971d9b1`, ADR-U4b `e902fa6d`, prober `4ed4c31e`, sélecteur `20e1cf9d`, sonde `8bdb1478`, `u4b-hyp.mjs` `65b0d8f9`, `u4-guard.mjs` `e3f5c70d`, `liquidation-logs.mjs` `bf4eb293`, `export-exclude-tests.json` `0b648e14`.
- 07:22:04Z — `npm ci --ignore-scripts --offline --cache F:/tmp/npm-cache` (mission ; `env -u` x8, TEMP sur F:) : exit 0, 283 paquets, 0 réseau (`--offline`) ; journal `F:\tmp\pre5\logs\npm-ci.log`. `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-pre5\packages\rpc-guard\src\index.ts` (liens `@monark/*` -> le worktree).
- 07:23:23Z–07:25:44Z — oracle 7 gates de BASE (`F:\tmp\pre5\oracle.sh`, codes capturés directement) sur `0383e5b` intact : 7 x exit 0 ; test **1042 / 1040 / 0 / 2** (2 skips : `sentinel_run_releases_chainstack_lock_on_sigterm` win32, `u4b_labels_replay_via_main_real_artifact` artefacts e2 absents d'un worktree ; `F:\Monark` = 1042/1041/0/1 avec les artefacts). Journaux `F:\tmp\pre5\oracle-base\`.
- ~07:27Z — advisor intégré (après orientation, avant écriture). Avis retenus : (1) MC5-3 (« `--check-version` annote `episode` ») serait ROUGE AVANT par `u4b_check_version_false_stops_H1_unless_neutral_ref` (2e appel sur le fichier réécrit) ⇒ abandonné, MC5-1 et MC5-2 seuls pour la nécessité ; (2) I-V-1 : `skip` déclaré hors win32 (sous POSIX `C:\…` se résout DANS le dépôt, branche inatteignable), précondition `isAbsolute(rel)` assertée dans le test ; (3) C-V4b-3 : assertion AVANT le bloc d'altération de l'épisode (sinon le sha refuse d'abord) ; (4) O-D : sérialiseur canonique INLINE, égalité vérifiée sur le golden avant revendication ; (5) `test/guard-scripts-u4.test.ts` relu : aucun ensemble fermé test -> script (il scanne les scripts, pas les tests).
- 07:3xZ — écriture des tests (outil Edit, A-13) ; rejeu ciblé TAP : `u4b-chain` 3/3, `u4b-hyp` 40/40, `u4b-probe-cutoff` 12/12 (`F:\tmp\pre5\logs\{chain-1,u4b-hyp-1,u4b-probe-cutoff-1}.tap`) ; gates statiques `gate:vocab`, `typecheck`, `lint`, `lint:ratchet` (69/69, plafond inchangé), `lang:gate` : exit 0 (`F:\tmp\pre5\logs\pre-*.log`). `git status` : 3 fichiers de test modifiés, rien d'autre ; aucun lecteur `Z:` sur la machine (`ls Z:/` : absent).
- 07:40:32Z — harnais `F:\tmp\pre5\mutants.mjs` phase AVANT lancé (suite COMPLÈTE par mutant, les 3 fichiers de test remplacés transitoirement par leurs blobs `0383e5b`, restauration vérifiée par sha).
- 07:53:24Z — phase AVANT close (v1, sha256 `02791cfc…`, copie `F:\tmp\pre5\mutants-v1-before.mjs` ; journaux `F:\tmp\pre5\logs\mutants-before.{log,json,stdout}`) : baseline 1042/1040/0/2 ; **SURVIVED sur la suite complète à `0383e5b`** : MC5-1, VX-L2, ML-1, VZ-3, MI-1, R12, MD-1 (7/8) ; **MC5-2 RED-BEFORE** : déjà tué par `u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data` (`test/guard-scripts-u4.test.ts:221`, rejeu e2 dont `B_last != B0 + 7199`) ⇒ MC5-2 n'est PAS une preuve de nécessité (l'advisor l'avait cru équivalent sur les tests prober/sonde : vrai pour eux, faux pour ce rejeu e2) ; conservé en phase APRÈS, non compté. Restaurations : 8/8 sha golden, 3/3 tests livrés intacts, racine du dépôt propre, `git status` = 3 ` M`.
- 07:5xZ — renforcement CARTO-T1C-5 (D-n D-1) : la chaîne suit le chemin RÉEL du fichier de course (RUNBOOK étapes 1 `--fill-ts` -> 2a `runSelect --block-ts-extra` -> 2c `--check-version` -> 5 prober) : le fichier de course porte `block_ts_extra_file` / `block_ts_extra_sha256` DANS le payload couvert par `selection_sha256` ; la version précédente (sans sidecar) ne l'exerçait pas. Mutant ajouté MC5-4 (ordre : sha calculé AVANT l'ajout du lien sidecar au payload). Harnais v2 : écritures durables (fsync, item I-5, déclencheur « tout G1 > 1 h » atteint par ce G1) + MC5-4 ; liste des 8 autres mutants inchangée (diff v1/v2 au rendu).
- 07:5xZ — chaîne réécrite rejouée seule : 3/3 (`F:\tmp\pre5\logs\chain-2.tap` : `--fill-ts` n_extra=17, sélection `block_ts_extra_sha256=c6f36c13…`, `--check-version` 2/9 appels, prober `n_updates=2`, `last_block=23707199` = B_last, B0 = 23699999).
- 07:58:06Z — phase AVANT de MC5-4 seul (harnais v2, `F:\tmp\pre5\logs\mutants-before-MC5-4.{log,json,stdout}`) : baseline 1042/1040/0/2 ; **MC5-4 SURVIVED** sur la suite complète à `0383e5b` ; restaurations vérifiées. Phase APRÈS (9 mutants, harnais v2) lancée à la suite.
- 08:16:00Z — phase APRÈS close (`F:\tmp\pre5\logs\mutants-after.{log,json,stdout}`) : baseline **1044/1042/0/2**, les 4 tueurs visés `ok` ; **9/9 KILLED byIntended** (TAP A-11, suite complète) ; chaque mutant rouge par SON seul test visé, sauf MC5-2 (+ `u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data`, attendu) ; restaurations 9/9 = sha golden, arbre = 3 ` M`, racine propre, tests livrés intacts.
- 08:16Z — oracle 7 gates FINAL lancé (`F:\tmp\pre5\oracle-final\`).
- 08:19:23Z — oracle FINAL clos : 7 x exit 0, test **1044 / 1042 / 0 / 2**, `lint:ratchet` 69/69 (détail §B).
- 08:19:37Z — R-25 (`F:\tmp\pre5\r25.mjs`, pathspec extrait VERBATIM de `ci.yml:65` par code) : `0383e5b...HEAD` = 0 (rien de committé, R-20) ; arbre vs `0383e5b` = **155** (+152/−3) ; `git diff --stat 0383e5b -- apps/*/src packages scripts/census` = **VIDE** (`F:\tmp\pre5\logs\r25.log`).
- 08:19:47Z — mesure P-U3 (`F:\tmp\pre5\carto-pu3.mjs`, lecture seule) : fichiers de test important sélecteur ET prober 0 -> 1 (`F:\tmp\pre5\logs\carto-pu3.json`).
- 08:2xZ — A-6 APRÈS = AVANT, 18/18 (`F:\tmp\pre5\INVARIANTS-AFTER.txt`, `diff` vide) ; `F:\tmp\pre5\DELIVERED.sha256` ; copie durable du pli `F:\tmp\pre5\micropli.patch` (`git diff 0383e5b`, sha256 `6140344796be71243175b28c9a880da60bae58990db4c149f5bf64d01dcb3459`, 205 lignes) ; preuve verbatim : octets mutés de VX-L2 / VZ-3 / R12 identiques à ceux des harnais d'origine (§A).
- 08:22:28Z — texte d'amendement `F:\tmp\pre5\ADR-amendement.md` écrit ; rédaction des sections de synthèse ci-dessous.
- 08:2xZ (entre 08:22:28Z et 08:27:09Z) — **advisor intégré AVANT clôture**, livrables durables. Avis : aucune correction de fond ; 5 actes de clôture, faits ci-dessous. (1) Horodater cet appel. (2) Provenance de l'amendement « 08:2x ». (3) F-1 vérifié par grep. (4) Diff v1 -> v2 du harnais persisté. (5) sha du rendu en DERNIER, hors du rendu. Point non bloquant : gel 0.6 du RUNBOOK re-mesuré. L'advisor reconnaît que sa prédiction « MC5-2 équivalent » était fausse. **C12-PIN : aucun avis contraire au maintien hors périmètre** ⇒ reste une demande de ruling formée (§D), non appliquée.
- 08:27:09Z — ligne 0.6 du RUNBOOK (21 fichiers), blob `0383e5b` contre l'arbre du pli : **21/21 OK** (`F:\tmp\pre5\logs\runbook-06.log`). Observation hors pli : `record.ts` = `8b5074f3` à `0383e5b`, contre `afa20f8c` dans le texte 0.6. C'est un mouvement du tronc (UKEMI-RETRY-2/3), pas de ce pli.
- 08:27Z — `F:\tmp\pre5\logs\harness-v1-v2.diff` (sha256 `bf3b99854357a41d99c942bf7e27e02ac5fcb820197d331887c34476a0d41289`, 28 lignes `<`/`>`). Les 7 lignes retirées sont l'import fs et 6 `writeFileSync` remplacés par `writeDurable`. La seule définition de mutant ajoutée est MC5-4 ; aucune autre n'est retirée ni modifiée.
- 08:28:06Z — F-1 : `grep -c 'F:\\tmp\|F:/tmp' ADR-amendement.md` = **0**. `F:\tmp\pre5\ADR-amendement.md` sha256 `7393b8f54bff2b7bfdcf84551b4a5c8a82f6461750c8dc4fcaf0ae5ab2ad2bce` (état final ; toute retouche ultérieure est notée ici).
- 08:28:42Z — CLÔTURE du worker. HEAD = `0383e5b` (0 commit). `git status` = 3 ` M` sous `apps/sentinel/test/`, plus `node_modules/` ignoré. `sha256sum -c DELIVERED.sha256` : 3/3 OK. `F:\tmp\pre5\tmp\` (TEMP des suites, 3 383 entrées résiduelles de tests tiers) est laissé en place. Le sha256 de ce rendu est calculé APRÈS cette ligne et figure dans la sortie finale du worker, jamais dans le fichier.

### Reprise — ruling orchestrateur C12-PIN (a) (reçu vers 08:30Z)
Ruling reçu : **C12-PIN option (a)**, test seul dans le même worktree, même discipline, attendu 1045/1043/0/2. Autres rulings : D-1 à D-4 ACCEPTÉES ; I-5 -> amendement CONSIGNE D-1 (item, porteur orchestrateur) ; observation 0.6 (`8b5074f3` contre `afa20f8c`) = mouvement RETRY-2/3 attendu (D-n au Sidecar, hors pli). **Compte pré-déclaré : 1045 / 1043 / 0 / 2** (un test nouveau, win32).
- 08:30:42Z — pré-mesure en lecture seule (`F:\tmp\pre5\c12-probe.mjs`). RUNBOOK sha256 `1c945d4d475c1950de6a1ae1ebf6f8eb3c888848ca9a9ae2cc9d8c99014c9d93`, identique au blob `0383e5b`, LF. Une seule ligne porte l'ancre `C-12 exit=$?` (`:620`). Corps extrait par la regex du test : 452 caractères ; littéral `C12` du test : 452 caractères, sans antislash. **Égalité constatée**. Les deux ancres de mutants sont présentes 1 fois chacune dans le RUNBOOK. Aucun test existant ne lit le RUNBOOK (grep `RUNBOOK-course-ukemi` dans les `.ts`/`.mjs` de `test`, `apps`, `packages`, `scripts` : 0).
- 08:3xZ — test `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim` ajouté EN FIN de `apps/sentinel/test/u4b-probe-cutoff.test.ts` (outil Edit, A-13 ; texte du rendu §D, commentaire d'en-tête ajouté ; les imports existants suffisent). Rejeu du fichier : 13/13 (`logs\u4b-probe-cutoff-2.tap`) ; `typecheck` et `lint` exit 0 ; ASCII seul, LF.
- 08:3xZ — harnais v3 (`mutants.mjs` sha256 `19f19ce9fd9d03e3f50325b139fe13d408cd8df719b2fd6e7a0684fb2846a4ad` ; v2 conservé en `mutants-v2.mjs` `c0346f08…` ; diff `logs\harness-v2-v3.diff` `c578715f…`). Ajouts : golden RUNBOOK (`1c945d4d…`), MP-1 (le `===` de `r.c_fresh === r.c_e2` devient `==` dans la copie RUNBOOK) et MP-2 (l'ancre `echo "C-12 exit=$?"` devient `echo "exit=$?"` : non-vacuité). Les 9 autres mutants sont inchangés. Anciens journaux APRÈS (9 mutants, v2) conservés sous `logs\mutants-after-v2-9m.*` (`.log` `da03b4f6…`, `.json` `a7b6cf1d…`). Phase AVANT pour MP-1 et MP-2, puis phase APRÈS complète (11 mutants, arbre final) lancées.
- 08:35:03Z / 08:38:28Z — phase AVANT (suite complète, tests de `0383e5b`) : baselines 1042/1040/0/2. **MP-1 SURVIVED** (0 rouge ; octets mutés `a3f577b968ea…`). **MP-2 SURVIVED** (0 rouge ; `6780af4c65f6…`). RUNBOOK restauré à `1c945d4d…` après chacun ; arbre = 3 ` M`, racine propre. Journaux `logs\mutants-before-MP-1.{log,json}` (`902572ac…`, `b55290c8…`) et `logs\mutants-before-MP-2.{log,json}` (`93a4906a…`, `65cf56c7…`). Test livré à ce stade : `u4b-probe-cutoff.test.ts` `d4f069a8…`.
- 08:57:18Z — phase APRÈS FINALE (harnais v3, arbre livré ; `logs\mutants-after.{log,json,stdout}`, `.log` `fbad532e…`, `.json` `b71f2dfb…`) : baseline **1045/1043/0/2**, les 5 tueurs visés `ok` ; **11/11 KILLED byIntended**. Chaque mutant est rouge par son SEUL test visé, sauf MC5-2 (+ rejeu e2, attendu). Restaurations 11/11 = sha golden (RUNBOOK compris, `1c945d4d…`), `golden_sources_intact=true delivered_tests_intact=true`, arbre = 3 ` M`, racine propre.
- 08:57:35Z–08:59:31Z — oracle 7 gates FINAL v2 (`F:\tmp\pre5\oracle-final\` ; l'oracle v1 à 1044 est conservé sous `oracle-final-v1-1044\`) : 7 x exit 0, test **1045 / 1043 / 0 / 2** = compte pré-déclaré ; `lint:ratchet` 69/69.
- 08:59Z — R-25 (`logs\r25-c12.log`) : `0383e5b...HEAD` = 0 ; arbre vs `0383e5b` = **168** (+165/−3 ; 114/2, 31/1, 20/0) ; `git diff --stat 0383e5b -- apps/*/src packages scripts/census` = **VIDE**. A-6 **18/18** (`INVARIANTS-AFTER.txt` régénéré, `diff` vide). RUNBOOK = blob `0383e5b` (`1c945d4d…`). P-U3 re-mesuré 0 -> 1 (`logs\carto-pu3-final.json`).
- 09:00Z — `DELIVERED.sha256` mis à jour (sha256 du fichier `f0d43d2ddf31f2efaea058401ba3bc25c3f8aca8738e63d0640da24635ea415c` ; 3/3 OK à `sha256sum -c`) ; `micropli.patch` régénéré (sha256 `9c566f0ec5069f2d164a9b82107a8bac3259f0e25f61ee384f3b63702a8dcec1`, 222 lignes ; lignes retirées = les 3 mêmes `import` ; 161 lignes ajoutées ; 0 non-ASCII) ; copie durable de `u4b-probe-cutoff.test.ts` `d4f069a8` écrite avec fsync par le harnais v3 dans `F:\tmp\pre5\backup\`.
- 09:01:15Z — `ADR-amendement.md` v2 (C12-PIN clos, rulings intégrés, D-5/D-6, comptes finaux) : sha256 `62137dd48d00feccfe227b8fbf84ffdaa8e6228a73073088c8cb826794f39b16` ; F-1 : 0 renvoi `F:\tmp`.
- 09:02:49Z — CLÔTURE v2 du worker. HEAD = `0383e5b` (0 commit). `git status` = 3 ` M` sous `apps/sentinel/test/`, plus `node_modules/` ignoré. `sha256sum -c DELIVERED.sha256` : 3/3 OK. Le `git diff 0383e5b` recalculé est égal à `micropli.patch` (`9c566f0e…`). Aucun nom de sonde à la racine. Le sha256 de ce rendu est calculé APRÈS cette ligne et figure dans la sortie finale, jamais dans le fichier. Aucun appel advisor supplémentaire pour cette reprise : ruling explicite, même discipline, aucun choix ouvert ; l'appel de clôture de 08:2xZ reste le dernier.

## A. Livrables par item (test nommé, mutants, `error_origin`)

Fichiers touchés (3, tests seuls ; `F:\tmp\pre5\DELIVERED.sha256`, état FINAL après C12-PIN) :
- `apps/sentinel/test/u4b-chain.test.ts` `d077522b3cbbad3eae09a3e1a23392f9544302d12834e34db9313084b90e4c97`
- `apps/sentinel/test/u4b-hyp.test.ts` `fecb7a4a53d278cc19d7ddd0f853792a5c45bff2a44843e511ef96a591889f76`
- `apps/sentinel/test/u4b-probe-cutoff.test.ts` `d4f069a8c20ed3f0212cbf49c79d3b78a5af695293b457af62e803caa3b7d515` (rendu v1 : `1ec5c484…`, PÉRIMÉ ; +13 lignes = C12-PIN)

Le tableau reprend la phase APRÈS FINALE (harnais v3, 11 mutants, arbre livré, 1045 tests).

| item | test nommé (emplacement) | mutant (origine) | AVANT : suite complète, tests `0383e5b` | APRÈS : tueurs (TAP) | sha muté |
|---|---|---|---|---|---|
| CARTO-T1C-5 | `u4b_chain_select_to_oracle_path` (`u4b-chain.test.ts:158`) | MC5-1 sélecteur `sha256Hex(canon(payload))` -> `sha256Hex(JSON.stringify(payload))` (propre) | SURVIVED (0 rouge / 1042) | KILLED, seul `u4b_chain_select_to_oracle_path` | `15dd65bd2a42…` |
| CARTO-T1C-5 | idem | MC5-4 sélecteur : `selectionSha(payload)` calculé AVANT l'ajout de `block_ts_extra_*` (propre) | SURVIVED (0 / 1042) | KILLED, seul le test visé | `1fb69f1ab5f5…` |
| CARTO-T1C-5 | idem | MC5-2 prober : `bLast: ep.B0 + 7199` (propre) | RED-BEFORE (`u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data`) — non compté | KILLED (test visé + ce rejeu e2) | `d0e77b77e536…` |
| C-V4b-3 / VX-L2 | `u4b_probe_cutoff_refuses_before_any_fetch` (`u4b-probe-cutoff.test.ts:234-240`) | VX-L2 racine `"Z:/nowhere-root"` (validateur re-cp-2 4b, verbatim) | SURVIVED | KILLED, seul le test visé | `d52bfa3ecec99f7d…` = sha muté du validateur (`F:\tmp\cp2-u4b1b4\logs\mutants-mine-4b.log:20`) |
| C-V4b-3 / VX-L2 | idem | ML-1 racine `HERE` (propre) | SURVIVED | KILLED, seul le test visé | `c476a68295d1…` |
| I-V-1 (= O-B) | `iv1_out_on_another_drive_with_missing_parent_is_refused_as_missing_parent_not_inside` (`u4b-hyp.test.ts:873`) | VZ-3 `|| isAbsolute(rel)` -> `|| false` (validateur cp-2 1c = R02 du G2, verbatim) | SURVIVED | KILLED, seul le test visé | `237e5f346d9f…` = sha muté du validateur (`F:\tmp\cp2-u4bstats1-1c\vz-mutants.json`) |
| I-V-1 (= O-B) | idem | MI-1 `isAbsolute(rel)` -> `rel.startsWith(sep)` (propre) | SURVIVED | KILLED, seul le test visé | `5c205b2e9e24…` |
| O-D | T17 `u4b_hyp_report_e2_end_to_end_deterministic_body_digest` (`u4b-hyp.test.ts:593-600`) | R12 corps écrit `h3.pooled.verdict = "NON"` (re-G2-delta 1c, verbatim) | SURVIVED | KILLED, seul le test visé | `2f17f1d3dab0…` = sha muté du G2 (`F:\tmp\g2-u4bstats1-1c\logs\g2-1c-mutants-N.json`) |
| O-D | idem | MD-1 replacer JSON : chaque `n` écrit + 1 (propre) | SURVIVED | KILLED, seul le test visé | `eb6849d46792…` |
| C12-PIN (ruling (a)) | `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim` (`u4b-probe-cutoff.test.ts:345-356`) | MP-1 dans la copie RUNBOOK de C-12, `r.c_fresh === r.c_e2` -> `==` (propre, proposé au rendu v1 §D) | SURVIVED | KILLED, seul le test visé | `a3f577b968ea…` |
| C12-PIN (ruling (a)) | idem | MP-2 ancre `echo "C-12 exit=$?"` -> `echo "exit=$?"` (propre, non-vacuité) | SURVIVED | KILLED, seul le test visé | `6780af4c65f6…` |

- Restauration : après CHAQUE mutant, sha = golden (`20e1cf9d` sélecteur, `4ed4c31e` prober, `8bdb1478` sonde, `65b0d8f9` `u4b-hyp.mjs`, `1c945d4d` RUNBOOK). `git status` = 3 ` M`, et `u4bpc-ledger-under-repo-no-such-dir` est absent de la racine. En fin de phase : `golden_sources_intact=true delivered_tests_intact=true`.
- Harnais : v1 `02791cfcaad8218c2a6918de38f993e0b6b707dfa61f4e0144b535d552eee9c8`, v2 `c0346f087380647bc25178d6eb25c3bd58944880cb015123a3d3d0992aa8f6dd`, v3 `19f19ce9fd9d03e3f50325b139fe13d408cd8df719b2fd6e7a0684fb2846a4ad`.
  - v1 -> v2 (`logs\harness-v1-v2.diff` `bf3b9985…`) : import fs, `writeDurable` et remplacement de 6 `writeFileSync` dans l'arbre, plus l'ajout de MC5-4.
  - v2 -> v3 (`logs\harness-v2-v3.diff` `c578715f…`) : golden RUNBOOK, `K_C12`, ajout de MP-1 et MP-2.
- Journaux :
  - AVANT : `mutants-before.log` `a0558824…` / `.json` `dec579ce…` ; `mutants-before-MC5-4` `4b17f8ba…` / `7302b3d2…` ; `mutants-before-MP-1` `902572ac…` / `b55290c8…` ; `mutants-before-MP-2` `93a4906a…` / `65cf56c7…`.
  - APRÈS FINAL (v3, 11 mutants) : `mutants-after.log` `fbad532ec46ac00fa28ef894d5bfbae957713cb1bf36d38cc03c27c776a0289c`, `.json` `b71f2dfb85e5f46ae81718877f046d85e4c88c2ec2140ea5b8acd0fb1f649240`.
  - APRÈS intermédiaire (v2, 9 mutants, arbre avant C12-PIN) : `mutants-after-v2-9m.{log,json}` `da03b4f6…` / `a7b6cf1d…`.
  - En-têtes A-12 : HEAD, branche, arbre, node 24.15.0, uv 1.51.0, win32/x64, commande enfant exacte, sha des goldens et des tests.
- Forme réelle (A-8) du test de composition :
  - `aggregator()` et `eth_getStorageAt` = un mot ABI de 32 octets ;
  - `AnswerUpdated` : prix dans `topics[1]` (int256), roundId dans `topics[2]`, `updatedAt` dans `data` ;
  - enveloppe JSON-RPC telle que la renvoie un nœud ;
  - le bouchon honore `fromBlock`/`toBlock` et l'adresse de l'agrégateur ;
  - l'horloge est linéaire : `ts = 12·bloc`.
- Mesuré au rejeu : B0 = 23699999, B_last = 23707199 = B0 + 7200, `--fill-ts` n_extra = 17, `--check-version` 2/9 appels, prober 12 appels, `n_updates = 2`, `last_block = B_last`.
- `error_origin` des items (déjà assignés, repris) :
  - CARTO-T1C-5 : G1 de U-4b-1b-2, composition non rejouée ;
  - C-V4b-3 : worker, trou de test du G1 U-4b-1b-4 ;
  - I-V-1 : trou de preuve d'auteur, prototype G2 + worker ;
  - O-D : worker 1b d'origine ;
  - C12-PIN : n-a (duplication de conception, déclarée au G1 ; ADR-U4b `:1446`).
- `error_origin` propre au pli :
  - aucun défaut connu à la remise ;
  - l'hypothèse MC5-2 « équivalent sur la suite » était fausse, mesurée rouge AVANT ; `error_origin` = advisor (prédiction de l'avis d'orientation), relevé par la phase AVANT du worker ; sans effet sur la preuve ;
  - l'assignation finale est faite au G7.

## B. Preuves de clôture
- **Oracle 7 gates FINAL** (`F:\tmp\pre5\oracle-final\`, en-tête A-12, codes capturés directement, arbre livré avec C12-PIN) : `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate` et `export:check` sortent tous à exit 0. Test : **1045 / 1043 / 0 / 2**, égal au compte pré-déclaré. L'oracle v1 sans C12-PIN (1044/1042/0/2) est conservé sous `oracle-final-v1-1044\`.
- **N** = 1042 (base mesurée, `F:\tmp\pre5\oracle-base\`) + **3** tests nouveaux (`u4b_chain_select_to_oracle_path`, `iv1_…`, `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim`) = 1045. C-V4b-3 et O-D sont des assertions ajoutées dans deux tests existants (0 test en plus).
  - Attendu dans `F:\Monark` avec les artefacts e2 : 1045/1044/0/1.
  - Sur la CI Linux : `iv1_…` est skippé (déclaré) et le test SIGTERM tourne.
- **A-6** : 18/18 sha LF identiques AVANT == APRÈS (9 gelés §2 + prereg + ADR-U4b + 7 témoins ; `INVARIANTS-{BEFORE,AFTER}.txt`, `diff` vide). Témoin supplémentaire : le RUNBOOK, muté transitoirement par le harnais, est égal au blob `0383e5b` (`1c945d4d…`).
- **`git diff --stat 0383e5b -- apps/*/src packages scripts/census`** : VIDE. `git diff --name-status 0383e5b` : 3 `M` sous `apps/sentinel/test/`.
- **R-25** (pathspec VERBATIM `ci.yml:65`, ligne sha256 `fdff3620…`, 15 tokens) :
  - forme `0383e5b...HEAD` = 0 : rien n'est committé (R-20), c'est la forme que la CI mesurera après le commit de l'orchestrateur ;
  - arbre contre `0383e5b` = **168** (+165/−3 : 114/2, 31/1, 20/0), à comparer au STOP 1 150 ; rendu v1 : 155, delta C12-PIN = +13.
- **D-4 (diff annoté)** : 3 lignes retirées, 3 `import` élargis en sur-ensembles (`u4b-chain.test.ts` : `+ runCheckVersion, IMPL_V350` ; `+ SEL, ANSWER_UPDATED_TOPIC0` ; `u4b-hyp.test.ts` : `+ isAbsolute, relative, resolve`). C12-PIN : 0 ligne retirée. 0 assertion retirée ou affaiblie.
- **F-2** : 0 caractère non-ASCII dans les lignes ajoutées ; `gate:vocab` vert.
- **Registre d'exclusion de l'export** : aucune entrée à ajouter. Les 3 fichiers touchés figurent déjà dans `scripts/export-exclude-tests.json` (sha `0b648e14` inchangé) et aucun fichier de test n'est créé, donc le déclencheur de O-E n'est PAS atteint. `u4b-probe-cutoff.test.ts` lit désormais aussi un `docs/**` non exporté (D-6). `export:check` : exit 0.
- **P-U3 (cartographie, « table »)** :

| paire | état | test d'intégration non-LLM | « composition_gap » | ancres à `0383e5b` |
|---|---|---|---|---|
| P-U3 select -> `episode-selection.json` -> prober `--episode-file` | fixture:course (inchangé : paire de course, NON servie ; registre public inchangé) | `u4b_chain_select_to_oracle_path` (chemin RUNBOOK 1 -> 2a -> 2c -> 5) ; avant : prober seul sur fichier synthétique (`u4b_oracle_path_composes_real_form_bodies_and_reads_episode_bornes`) | fichiers de test important les deux modules : 0 -> **1** ⇒ FERMÉ | sélecteur `:228`, `:233` ; prober `:145`, `:93` (la carto du 22/09 cite `:219,:224` / `:90,:54`, décalés depuis) |

## C. Déviations (D-n)
- **D-1** : la chaîne CARTO-T1C-5 va au-delà de la lettre de l'item. Elle ajoute `--fill-ts` et `--block-ts-extra` (étapes 1-2a) ainsi que `--check-version` (étape 2c), soit le chemin réel du fichier lu à l'étape 5. Nécessité mesurée : MC5-4 SURVIT sans elle.
- **D-2** : I-V-1 est skippé hors win32, avec un motif déclaré dans le test. Même forme que le précédent `sentinel_run_releases_chainstack_lock_on_sigterm`.
- **D-3** : le harnais passe de v1 à v2 entre les phases (durabilité I-5 et MC5-4). MC5-3 est abandonné à l'orientation (advisor : déjà rouge avant).
- **D-4** : A-2 est réalisé par `npm ci --ignore-scripts --offline` (ordre de mission) et non par `mk-nm.ps1`. Retrait non fait : `node_modules` est gardé pour le rejeu R-21 de l'orchestrateur, et c'est un vrai `npm ci`, pas des jonctions, donc `rm-nm.ps1` est sans objet.
- D-1 à D-4 : **ACCEPTÉES** par le ruling de l'orchestrateur (vers 08:30Z).
- **D-5 (C12-PIN, ajout au pli par ruling (a))** : le test reprend le texte proposé au rendu v1 §D, avec un commentaire d'en-tête en plus ; les imports existants suffisent. Harnais v3 : MP-1 (proposé au v1) et MP-2 (ajouté pour la non-vacuité). Mutant d'un fichier `docs/**` (le RUNBOOK) : TRANSITOIRE, restauration vérifiée au sha du blob `0383e5b` après chaque mutant et en fin de phase.
- **D-6 (registre d'exclusion)** : la raison propre à `u4b-probe-cutoff.test.ts` n'est pas complétée par la lecture du RUNBOOK. Le fichier est déjà exclu ; la clause générale « reads or imports a file the public export omits » couvre ce `docs/**` non exporté (`scripts/export-public.mjs` : « docs/** (not exported) »). Éditer le texte unique `reason` rouvrirait le motif de conflit de O-E.

## C-bis. C12-PIN — clos par ruling (a)
- **Test** : `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim` (`apps/sentinel/test/u4b-probe-cutoff.test.ts:345-356`, en fin de fichier). Il relit `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md` et asserte qu'une et une seule ligne porte l'ancre `C-12 exit=$?` (`:620`). Il asserte ensuite que le corps `node -e '…'` de cette ligne `===` la constante `C12` du fichier. C'est la même constante que les autres tests de la sonde exécutent en processus enfant (`c12()`, GO ⇒ 0, STOP ⇒ 3).
- **Pré-mesure (08:30:42Z)** : égalité constatée, 452 caractères de chaque côté ; le littéral `C12` ne porte aucun antislash, donc la valeur à l'exécution est égale au texte source.
- **Mutants** : MP-1 (`===` -> `==` dans la copie RUNBOOK) et MP-2 (ancre relabellisée). Tous deux SURVIVENT à la suite complète de la base, puis sont TUÉS par le seul test visé dans la phase APRÈS finale. RUNBOOK restauré `1c945d4d…`.
- **Comptes** : 1045/1043/0/2 (pré-déclaré), R-25 168, A-6 18/18, `src`/`packages`/`scripts/census` intouchés.
- **Portée** : l'égalité RUNBOOK ⇔ `C12` est désormais épinglée par un test ; ce n'est plus une mesure ponctuelle du script d'insertion du G7.
- **Lien de continuité** : toute future édition du corps C-12 dans le RUNBOOK (docs) sans le test, ou l'inverse, est rouge en CI.

## D. Non clos ici / demandes formées (propriétaire : orchestrateur)
- **C12-PIN** — **CLOS** au rendu v2 par le ruling (a) (§C-bis). Pour mémoire, le texte proposé au rendu v1 (repris à l'identique dans le test, plus un en-tête) :
```ts
// C12-PIN (ADR-U4b amendment U-4b-1b-4 section 8): the node -e body of control C-12 in the RUNBOOK annex C is, to the
// byte, the constant C12 of this file (two copies of one text; the G7 insertion measured the equality once).
test("u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim", () => {
  const rb = readFileSync(join(ROOT, "docs", "course-ukemi", "RUNBOOK-course-ukemi-2026-09-22.md"), "utf8").split(/\r?\n/);
  const lines = rb.filter((l) => l.includes("C-12 exit=$?"));
  assert.equal(lines.length, 1, "exactly one C-12 command line in the RUNBOOK (non-vacuous)");
  assert.equal(/node -e '([^']*)' /.exec(lines[0]!)?.[1], C12, "RUNBOOK C-12 body === C12, byte for byte");
});
```
- **WORKTREE-DURABILITY-1**. Déclencheur ATTEINT (G1 > 1 h). Le commit est un acte de l'orchestrateur (R-20), annoncé au retour de ce rendu. Côté worker, copies durables hors worktree :
  - `F:\tmp\pre5\micropli.patch`, régénéré : `9c566f0e…` ; le v1 `61403447…` est remplacé et périmé ;
  - `F:\tmp\pre5\backup\` : copies des tests LIVRÉS écrites avec fsync par le harnais (`…u4b-chain.test.ts.d077522b`, `…u4b-hyp.test.ts.fecb7a4a`, `…u4b-probe-cutoff.test.ts.d4f069a8`, sha = DELIVERED final) ;
  - dans le même dossier, deux versions périmées : `…u4b-probe-cutoff.test.ts.1ec5c484` (rendu v1) et la première version de la chaîne `…u4b-chain.test.ts.3c01d0ed`, écrite par v1 sans fsync.
- **I-5**. APPLIQUÉ au harnais de ce pli (v2/v3). Ruling : **amendement de la CONSIGNE D-1**, item porté par l'orchestrateur.
- **Observation 0.6** (`record.ts` `8b5074f3` contre `afa20f8c`) : réglée par ruling (mouvement RETRY-2/3 attendu, D-n au Sidecar, hors pli).
- **O-E** : non atteint (aucune exclusion nouvelle). **I-7 / OBS-1** : inchangés (le prober n'est pas modifié).
- Aucun item de la mission ni du ruling ne reste ouvert. Aucun n'a exigé de code.

## E. Consigne standard : point par point
- **A-1** fait (ligne 1). **A-2** fait, D-4 (`require.resolve` -> worktree). **A-3** fait (oracle.sh : `cmd > log 2>&1; echo exit=$?`). **A-4** fait : `DELIVERED.sha256`, rendu sous `F:\tmp\pre5\`, 0 commit, rien sur `C:` (le test I-V-1 vise une lettre ABSENTE `Z:` : aucune lecture de `C:`), réseau : 0 (npm `--offline`, `fetch` bouchonné). **A-5** fait (verbatim par code ; 168 au final, 155 au v1). **A-6** fait (18/18, + RUNBOOK témoin). **A-7** fait : `env -u` x8 partout ; le harnais REFUSE de démarrer si une clé est présente et retire les clés de chaque enfant ; aucune variable affichée. **A-8** fait (corps en forme réelle, test de composition). **A-9** n-a (aucune phrase servie touchée). **A-10** fait (liage prober == sélecteur ; mutants qui préservent la lecture et altèrent la sortie : MC5-1, MC5-4, MC5-2). **A-11** fait (TAP, CRLF normalisé, `byIntended`). **A-12** fait (en-têtes des journaux de harnais, d'oracle, de R-25). **A-13** fait : fichiers par Write/Edit ; ancres de mutants comptées dans node (exactement 1) ; aucun `\\` dans les tests ajoutés ; un `grep` Bash à `\\n` a compté 0 par réduction du transport, remplacé par un comptage node.
- **B-1..B-6** n-a (aucun code de clé, d'opérateur payant ni de grep CI touché). **C-1..C-4** n-a. **D-1** fait (§A, 11 mutants). **D-2** fait (vecteurs non vides : épisode réel de 50 comptes + sidecar de 17 ts ; rapport e2 réel ; liste fermée des champs hors digest ; C12-PIN : ligne unique assertée avant la comparaison). **D-3** : la composition P-U3 est non-LLM, seul `fetch` est bouchonné ; statut `fixture:course` INCHANGÉ (paire non servie). **D-4** fait (§B). **E-1..E-3** n-a. **F-1** fait (texte d'amendement avec ligne Tuyaux ; aucun renvoi `F:\tmp` dans le texte d'ADR). **F-2** fait. **F-3** fait (§C). **G-1** n-a (aucune pièce publique).
