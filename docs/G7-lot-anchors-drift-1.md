# G7 du lot ANCHORS-DRIFT-1 : les tueurs perdus du dépôt

- **Branche** : `recherches/anchors-drift-1`, partie de `b7d0cb84`, tronc `origin/lot/etude-suite` `febf7735` fusionné ; worktree `monark-governance-anchors`. Commits locaux, sans push.
- **Lot de tests seuls** (G0 : `docs/G0-lot-anchors-drift-1.md`, ligne `red-proof: test-only`). Aucun code de production n'est touché.

## 1. Ce que le lot ferme

- **G2 de T0-FOLLOWUP-1, §3** : 16 tueurs PERDU à `b7d0cb84`.
- **8 sont fermés par le tronc** : l'acte 9 de T0 (`febf7735`) retire de `ci.yml` les 8 lignes de la dérogation de la PR 198, et les tueurs de `ci.yml` retrouvent leurs lignes d'origine. Le ré-ancrage fait d'abord sur `b7d0cb84` (+1, +8, +1) est défait après la fusion du tronc.
- **6 dérives de ligne**, `packages/hikae/test/oracle-l1-split.test.ts` : chaque tueur suit son texte dans `l1-split.ts`, +2.
- **2 tueurs morts réécrits**, `test/oracle-run.test.ts` :
  - `:129` : `scripts/oracle/run.mjs:39 CONST` ôte le drapeau `i` de `DENY` ; le nom `fx_secret_1` atteint alors une porte. La première réécriture (la boucle de `:46`) survivait au tir à la main : pour les portes, `childEnv` filtre `DENY` lui aussi ;
  - `:182` : `scripts/oracle/run.mjs:83 SDL`, le saut d'un enregistrement rouge de même clé.
- **Test neuf** `oracle_git_children_see_no_foreign_credential` : la boucle de `:46` est la seule garde des enfants qui héritent de `process.env` (git). Tueur `:46 COR "DENY.test(k) || " -> ""`. Sa première forme (un enveloppeur de git, ignoré sous Windows) est remplacée au §3.

## 2. Vérifications (base `febf7735`)

- **Ancres, tout le dépôt** (`verifie-ancres.mjs .`) : 1 411 tueurs, 1 411 ANCRE, 0 DERIVE, **0 PERDU**. Avant le lot, sur le tronc : 8 PERDU.
- **red-proof `--test-only`** : OK, 1 jugé, épinglé (le test neuf ; son tueur tiré à la gel est tué). Les autres changements sont des lignes de tueur, que red-proof ne juge jamais.
- **Tueurs tirés à la main** : 9 sur 9 tués par assertion (les 6 de hikae, les 2 réécrits, celui du test neuf), chaque fichier restauré (sha256).
- **R-25** contre `febf7735` : 32 (STAT ; plafond du lot 547).
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests touchés** (`test/oracle-run.test.ts`, `packages/hikae/test/oracle-l1-split.test.ts`) : 23 sur 23.
- **`test:main`** : 2 744 tests, 2 718 verts, 22 ignorés, 4 rouges, les mêmes qu'à `b7d0cb84` sur cet hôte (`sentinel_sigterm_after_lock_acquired_before_handler_releases_lock`, `sentinel_sigterm_while_lock_acquiring_releases_lock`, `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`, `dojo_history_collect_to_verify_end_to_end`) ; aucun ne touche un fichier du lot. Cause par test : voir le §3 (correction de la G2 delta).

## 3. Repli de la G2 delta (2026-10-06, A-1 à A-3)

G2 delta non bloquante sur `32ba9957` ; ses trois constats sont repliés (A-4 confirmait les tueurs réécrits, sans action).

- **A-1** : le test `oracle_git_children_see_no_foreign_credential` n'a plus d'enveloppeur ni de saut win32. Git note lui-même les variables qu'il reçoit : `GIT_TRACE2_ENV_VARS` nomme les faux identifiants et un témoin `FX_VISIBLE`, et chaque processus git écrit un événement `def_param` par nom présent dans `GIT_TRACE2_EVENT` (lignes JSON, sous `fx.top`, que `withFx` efface).
  - Prémisse : git a tourné sous trace2 et note le témoin.
  - Assertion : aucun `def_param` ne nomme un faux identifiant, sans égard à la casse.
  - Git for Windows a trace2, donc le tueur `:46 COR "DENY.test(k) || "` est épinglable sur l'hôte de l'oracle comme sous Linux.
- **A-2** : il n'y a plus de lecture de `env | sed`. Chaque ligne de trace est lue par `JSON.parse`, et une ligne illisible est écartée. Le scénario de la G2 (`FX_MULTI=$'line1\nGH_NOT_A_NAME=1'` dans l'environnement du lanceur) reste vert.
- **A-3** : le tueur `:46 COR " || /^npm_config_(offline|logs_dir)$/i.test(k)"` ne mourait que sous Windows.
  - Le test `oracle_gates_see_no_foreign_credential` passe aussi `NPM_CONFIG_OFFLINE` et `NPM_CONFIG_LOGS_DIR` à l'oracle. Il exige que chaque porte ne voie que `npm_config_logs_dir` et `npm_config_offline`.
  - Sous Linux, le mutant laisse passer les deux noms en capitales : le test meurt par assertion. Sous Windows, il meurt déjà par `offline=true`.
  - Le tueur passe au-dessus de la déclaration du test, si bien que red-proof le lit. Plus aucun tueur du lot ne dépend de l'OS.
- **Correction (G2 de T0-FOLLOWUP-1, T-7)** : les quatre rouges de `test:main` n'ont pas une cause commune « root ».
  - `dojo_history_collect_to_verify_end_to_end` manque de place libre dans le tmpdir. Le collecteur refuse `disk_space` : il faut ≈ 1,27 Go, et l'hôte en a ≈ 0,95 Go. Le lot DOJO-E2E-DISK-1 traite ce test.
  - Les trois autres rouges ont une cause hors du lot, qui ne dépend pas de la place disque.

**Vérifications** (base `febf7735`) :
- **Ancres, tout le dépôt** : 1 411 tueurs, 1 411 ANCRE, 0 DERIVE, **0 PERDU** ; 34 sur 34 sur les fichiers touchés.
- **red-proof `--test-only`** : OK, 2 jugés, 2 épinglés (`oracle_gates_see_no_foreign_credential` par le tueur `npm_config`, `oracle_git_children_see_no_foreign_credential` par le tueur `DENY`), chacun tué à la gel sous Linux.
- **Tueurs tirés à la main**, fichier restauré (sha256) : les 6 de hikae, `:39`, `:83`, `:136` et les deux tueurs de `:46`. Les 11 sont tués, tous par assertion.
- **R-25** contre `febf7735` : STAT 31+/10- = 41 (≤ 547), CONTENT 0, GREEN.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests touchés** : `test/oracle-run.test.ts` 17 sur 17, sans saut. Aucun `/tmp/oracle-fx-*` neuf ne reste.

## 4. Reste ouvert

Rien dans le lot. Les quatre rouges de l'hôte sont antérieurs au lot et ne viennent pas de lui.
