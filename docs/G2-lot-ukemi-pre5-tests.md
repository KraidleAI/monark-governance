# G2 — micro-lot UKEMI-PRE5-TESTS (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-pre5/G2.md` (sha256 d1ceda276851816f600dd92781dd524b8e2ca1c995bd8b98cc8b8d04923b1d5c). Verdict : PASS-AVEC-CORRECTIONS (C-G2-1 texte C-V4b-3 borné, C-G2-2 item GUARD-DOTDOT-1, C-G2-3 RUNBOOK :618 + roll-over C12-PIN ; item REVIEW-TAP-1).

---

Modèle résolu : claude-opus-5-5[1m]

# REVUE G2 — micro-lot test-only UKEMI-PRE5-TESTS : `lot/ukemi-pre5-tests` @ `bbe8538` (base `0383e5b`)

- Relecteur : claude-opus-5-5[1m], effort max (décision 133). Instance séparée, contexte frais. Aucun commit (R-20), aucun workflow.
- Clone isolé `F:\tmp\g2-pre5\clone` (`git clone --no-hardlinks -b lot/ukemi-pre5-tests F:/Monark`), HEAD `bbe8538b22e74d45e4263303e84c3c78817c3b66`. `npm ci --ignore-scripts --cache F:/tmp/npm-cache` : exit 0, 283 paquets (`F:\tmp\g2-pre5\npm-ci.log`). `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-pre5\clone\packages\rpc-guard\src\index.ts`.
- TEMP/TMP/TMPDIR = `F:\tmp\g2-pre5\tmp`. Ceinture A-7 : `env -u` des 8 clés sur chaque commande exécutante. Aucune variable affichée.
- Écritures : `F:\tmp\g2-pre5\` seulement. Rien dans `F:\Monark` ni `F:\Monark-wt-*`. Fichiers écrits par Write/Edit (A-13).
- Rendu au fil de l'eau (ce fichier).

## Journal (`date -u`)
- 09:04:03Z — orientation. Branches : `lot/ukemi-pre5-tests` = `bbe8538`, parent `0383e5b`. Pointe `lot/etude-suite` = `637dbb4` (local et `origin`).
- 09:0xZ — clone isolé et `npm ci` (exit 0).
- 09:0xZ — lectures :
  - rendu G1 `docs/G1-lot-ukemi-pre5-tests.md` (165 lignes) ;
  - `F:\tmp\pre5\ADR-amendement.md` (sha256 `62137dd4…` = valeur du G1) ;
  - `micropli.patch` (`9c566f0e…`), `mutants.mjs` v3 (`19f19ce9…`), `c12-probe.mjs` (`dfc8ea22…`) ;
  - définitions ADR-U4b `:990`, `:1442`, `:1444`, `:1446`, `:1750`, `:1751` ; `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md` §2 et §4 ; `docs/G2-lot-u4b-1b-4-4b.md` ; `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md` §3.1 et §5.3 ; `docs/G2-lot-u4b-stats-1-1c.md` §3 et §7 ;
  - sources exercées : `u4b-probe-cutoff.mjs:83-85`, `u4-guard.mjs:100-106`, `u4b-hyp.mjs:588-593` et `:626-687`, `u4b-select-episode.mjs:146-150`, `:223-233` et `:267-302`, `u4-oracle-path.mjs:92-100` et `:141-147`.
- 09:1xZ — premières mesures (§1). Appel advisor d'orientation : **timeout** (« The advisor timed out »), consigné. Je poursuis sans avis.
- 09:15Z environ — coupure de session (429). Reprise à 09:22:34Z : clone intact à `bbe8538`, `git status` vide.
- 09:23:36Z → 09:27:16Z — oracle 7 gates du lot (§3).
- 09:2xZ — `clone-mut` créé, puis copie « chemins seuls » du harnais G1 v3 (§5.1) ; rejeu APRÈS lancé à 09:28Z.
- 09:3xZ — pointe mesurée `f1ed77e`, `clone-merge` et fusion à blanc (0 conflit), `clone-tip` créé ; vérification du RUNBOOK de la pointe contre C12-PIN (§3).
- 09:34:4xZ → 09:43:23Z — oracles de la fusion puis de la pointe seule.
- 09:43Z — sonde D-2 (§4) ; harnais propre, phase AVANT lancée à 09:43:45Z (`clone-mut2`).
- 09:45:23Z — démonstration `..x` sur le code golden (§6.2).
- 09:48Z — R-25, renvois, A-6, A-7/D-4 (§3, §7) ; R02 ciblé à 09:51Z (§5.4).
- 09:5xZ — advisor de mi-parcours (§9).
- 09:58:05Z — rejeu G1 v3 clos : 11/11. 10:01:15Z — phase AVANT propre close (§5.3).
- 10:02:35Z — phase APRÈS propre, 1ʳᵉ tentative : baseline ROUGE sur un fichier étranger au pli, `apps\harness\test\server.test.ts` (plantage au niveau du fichier, compté comme 1046ᵉ « test »). Le harnais a refusé de muter (fail-closed voulu). Journal conservé : `g2m\logs\g2m-after-attempt1-baseline-flake.{log,json}`.
  - Diagnostic : rejoué seul, le fichier passe 6/6 (`logs\server-test-solo.tap`) ; il écoute sur un port éphémère (`startServer(0)`), donc aucune collision de port possible ; il passe dans toutes les autres baselines (5 suites complètes).
  - Classement (corrigé à la clôture selon `CHANTIERS:586`) : rouge **non signé**, hors pli, non reproduit ; item REVIEW-TAP-1 (O-G2-6).
  - 10:03:34Z (en-tête A-12 du journal) : phase APRÈS relancée, harnais INCHANGÉ (même sha `3ef2911e…`), puis MI-1 seul (rejeu G1), séquentiels, sans charge concurrente de ma part.
- 10:12:41Z — phase APRÈS propre close : 6/6 KILLED `byIntended`. 10:14:58Z — MI-1 seul : KILLED, 1 rouge (§5.3).
- 10:15:40Z — la pointe a avancé à `32875d5` (fusion G7 CONC-1, code `apps/sentinel/src/ukemi/*`). Seconde fusion à blanc (`clone-merge2`, 0 conflit) et A-6 sur son index (17/18, ADR déplacé par le tronc).
- 10:16:52Z → 10:21:47Z — oracles de la seconde fusion (1058/1056/0/2) et de la pointe `32875d5` seule (1055/1053/0/2) (§3).
- 10:22:21Z — état final des 6 clones relevé (§10). Rendu écrit (sha intermédiaire `34c923de…`) ; advisor de clôture vers 10:23Z (§9).
- 10:26:12Z — le pli ne touche ni `apps/harness` ni `test/probe-narabi.test.ts` ; rouges non signés reclassés selon `CHANTIERS:586` (O-G2-6).
- 10:27:30Z — clôture du relecteur. Verdict **PASS-AVEC-CORRECTIONS** (C-G2-1..3). Aucun commit ; les 6 clones restent en place pour le rejeu R-21.
- 10:28:48Z — dernière retouche, sans effet sur le verdict : la mesure CR/TAB du §10 est refaite sur les octets par node (incident A-13 de `grep -c $'\r'`, §9). Le sha256 du rendu est calculé APRÈS cette ligne.

## 1. Composition du pli (point 1)
- `git diff --name-status 0383e5b bbe8538` : 3 `M` sous `apps/sentinel/test/` (`u4b-chain.test.ts`, `u4b-hyp.test.ts`, `u4b-probe-cutoff.test.ts`) et 1 `A` `docs/G1-lot-ukemi-pre5-tests.md`. Stat : +330/−3 sur 4 fichiers.
- Le rendu committé `docs/G1-lot-ukemi-pre5-tests.md` (blob `bbe8538`) = `F:\tmp\pre5\RENDU.md` **octet pour octet** : sha256 `8cea2991404c86d645fdd2aec1ad4b490f9db896561ea3eb9a6edc594cf3961d` des deux côtés, `diff` LF vide.
- `git diff 0383e5b bbe8538 -- apps/` = `micropli.patch` **octet pour octet** : sha256 `9c566f0ec5069f2d164a9b82107a8bac3259f0e25f61ee384f3b63702a8dcec1` des deux côtés, 222 lignes, 0 CR (`F:\tmp\g2-pre5\pli-tests.diff`).
- `git diff --stat 0383e5b bbe8538 -- 'apps/*/src' packages scripts/census` : **VIDE** (0 ligne).
- RUNBOOK `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md` : blob `90bd99b293a603696bb398f85d1fb17419e619ec` à `0383e5b` ET à `bbe8538` ; diff vide.
- Les 3 lignes `-` sont des `import` élargis en sur-ensembles : 2 dans `u4b-chain.test.ts`, 1 dans `u4b-hyp.test.ts` (détail au point 6).
- A-6 (18 invariants) : voir §7.

## 2. Harnais d'origine : octets des 3 mutants verbatim (point 2, partie « verbatim »)
| mutant | harnais d'origine (sha256 du fichier) | paire find/repl d'origine | sha muté d'origine (journal) | sha muté G1 (`mutants-after.json`) |
|---|---|---|---|---|
| VX-L2 | `F:\tmp\cp2-u4b1b4\mutants-mine-4b.mjs:70-71` (`bc5938be…`) | `assertLedgerDir(ledgerArg, ROOT)` → `assertLedgerDir(ledgerArg, "Z:/nowhere-root")`, texte identique | `d52bfa3ecec99f7d371b9e6a74f12a4d0e5e7791044b5624007798748a970a69` (`logs\mutants-mine-4b.log`, SURVIVED) | identique |
| VZ-3 | `F:\tmp\cp2-u4bstats1-1c\vz-mutants.mjs:18-19` (`6099ca4c…`) | ligne `OUTSIDE` complète → `… \|\| false;` (commentaire de fin retiré), texte identique | `237e5f346d9f6872bb6bc2e6ef1d7e03fbae57c9b665323f7b3f08ad0953bfc1` (`vz-mutants.json`, SURVIVED) | identique |
| R12 | `F:\tmp\g2-u4bstats1-1c\scripts\g2-1c-mutants.mjs:76-78` (`d90be544…`) | `DOCBODY` → corps écrit `h3.pooled.verdict = "NON"`, texte identique | `2f17f1d3dab0217c677ee028ef9c2446b584c7e9af4a5257392526aa2ede8485` (`g2-1c-mutants-N.json`, SURVIVED) | identique |

- Observation (pas un défaut de preuve) : « VZ-3 = R02 » est vrai au sens **sémantique**, pas à l'octet. R02 (`g2-1c-mutants.mjs:49`) retire la clause sans la remplacer par `|| false` et garde le commentaire de fin de ligne ; son sha muté vaut `ed63971dcaa700ec34694b33929f67341c85a7d38b088a418bc9020dcdef2855` ≠ `237e5f34…`. Le G1 rejoue VZ-3 verbatim ; R02 n'a pas été rejoué en tant que tel. Je le rejoue moi-même (§5).

## 3. Oracle 7 gates, R-25, fusion à blanc (point 4)
Script `F:\tmp\g2-pre5\scripts\oracle.sh` (calque du G1, mes chemins ; codes capturés directement, A-3 ; `env -u` ×8 ; en-tête A-12). Journaux sous `F:\tmp\g2-pre5\logs\oracle-<tag>\`.

| arbre | HEAD | 7 gates | test (tests/pass/fail/skip) | skips |
|---|---|---|---|---|
| lot (`clone`) | `bbe8538` | 7 × exit 0 (09:23:36Z → 09:27:16Z) | **1045 / 1043 / 0 / 2** = attendu | SIGTERM (win32, déclaré) ; `u4b_labels_replay_via_main_real_artifact` (artefacts e2 absents d'un clone) |
| pointe seule (`clone-tip`) | `f1ed77e` | 7 × exit 0 (09:38:49Z → 09:43:23Z) | **1042 / 1040 / 0 / 2** = N(pointe) | mêmes 2 |
| fusion à blanc (`clone-merge`) | `f1ed77e` + `bbe8538` (index, `--no-commit`) | 7 × exit 0 (09:34:4xZ → 09:38:49Z) | **1045 / 1043 / 0 / 2 = N(pointe) + 3** | mêmes 2 |

- Les 5 tests visés sont ✔ dans le lot et dans la fusion : `u4b_chain_select_to_oracle_path`, `u4b_hyp_report_e2_end_to_end_deterministic_body_digest`, `iv1_…`, `u4b_probe_cutoff_refuses_before_any_fetch`, `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim`.
- `git status` vide avant et après l'oracle du lot et celui de la pointe ; clone de fusion = les 4 fichiers du lot indexés, rien d'autre.
- **Pointe au moment de la mesure : `f1ed77e`** (≥ `637dbb4` ; `637dbb4..f1ed77e` = 2 commits ETAT-REPRISE). Merge-base = `0383e5b`. Côté pointe, `0383e5b..f1ed77e` = 15 commits, 16 fichiers, tous sous `docs/` ; **0 fichier en commun** avec le lot. `git merge --no-ff --no-commit` : « Automatic merge went well », **0 conflit**, 0 chemin non fusionné (`logs\merge-dry-run.log`). Blobs indexés = blobs du lot pour les 4 fichiers.
- **Point de vigilance vérifié** : la pointe a modifié le RUNBOOK que lit le test C12-PIN (`ea9c8e3`, RUNBOOK-E2-46 ; sha256 `1c945d4d…` → `59081c65…`, 653 → 657 lignes). Relu par code avec la logique exacte du test (`scripts\c12-tip-check.mjs`, `logs\c12-tip-check.log`) : sur `0383e5b`, `637dbb4` et `f1ed77e`, **1 seule** ligne porte l'ancre `C-12 exit=$?` (`:620`) et son corps (452 caractères) `===` `C12`. La fusion garde donc C12-PIN vert (mesuré par l'oracle fusionné).
- **Seconde fusion à blanc, pointe `32875d5`** (mesurée à 10:15:40Z ; `f1ed77e..32875d5` = 6 commits, dont la fusion G7 UKEMI-CONC-1 `e1411cf`) :
  - la pointe touche du CODE que les nouveaux tests exercent indirectement : `apps/sentinel/src/ukemi/{pool,prefetch,record,resume,rpc2}.ts`, plus un test nouveau `ukemi-conc.test.ts`. `rpc2.ts` est importé par la sonde et par la chaîne. D'où la seconde mesure ;
  - le RUNBOOK n'est pas touché depuis `f1ed77e` ; 0 fichier en commun avec le lot ;
  - clone `clone-merge2`, branche jetable `g2-merge-dry-run-2`, `merge --no-ff --no-commit` : « Automatic merge went well », **0 conflit** (`logs\merge-dry-run-2.log`) ;
  - lignes d'ADR citées par l'amendement (`:990/:1442/:1444/:1446/:1750/:1751`) identiques à `0383e5b` sur `32875d5` : l'amendement v3 de CONC-1 est un ajout en fin de fichier (1859 → 2216 lignes) ;
  - oracles (§3 bis) :

| arbre (§3 bis) | HEAD | 7 gates | test (tests/pass/fail/skip) |
|---|---|---|---|
| pointe seule (`clone-tip`, `pull --ff-only`) | `32875d5` | 7 × exit 0 (10:19:41Z → 10:21:47Z) | **1055 / 1053 / 0 / 2** = N(pointe) |
| fusion à blanc (`clone-merge2`) | `32875d5` + `bbe8538` (index) | 7 × exit 0 (10:16:52Z → 10:19:05Z) | **1058 / 1056 / 0 / 2 = N(pointe) + 3** |

  - Mêmes 2 skips. Les 5 tests visés sont ✔ dans la fusion. `npm ci --offline` à exit 0 dans les deux clones (`logs\npm-ci-clone-{merge2,tip2}.log`).
  - Cohérence avec le G7 CONC-1 (message de `32875d5` : « merged-tree oracle … 1055/1054/0/1 » dans `F:\Monark`, avec les artefacts e2) : 1055 tests dans les deux mesures.
- **R-25** (`scripts\r25.mjs`, pathspec extrait par code de `ci.yml:65`, ligne sha256 `fdff3620ed4ed64a6617f7c5323216bd98401b9c2ec22fe0eb87d7df03050843`, 15 tokens ; seul le jeton de plage est substitué) : `0383e5b...bbe8538` = **168** (+165/−3 : `u4b-chain.test.ts` 114/2, `u4b-hyp.test.ts` 31/1, `u4b-probe-cutoff.test.ts` 20/0 ; le rendu G1 `docs/G1-lot-*.md` est exclu par le pathspec). Plafond CI `VIBEGATES_PR_LIMIT` = 1205 (`ci.yml:43`), STOP orchestrateur 1 150 : non atteints (`logs\r25.log`).

## 4. D-2 : I-V-1 sauté hors win32 (point 3)
Sonde `scripts\d2-probe.mjs` (sha256 `7fc75f19…`), journal `logs\d2-probe.log` (`82b28de1…`), dans `clone` inactif ; modifications transitoires restaurées et vérifiées par sha, `git status` vide en fin.
- **Il s'exécute sous win32** : TAP de `u4b-hyp.test.ts` sur l'arbre livré = `ok 40 - iv1_out_on_another_drive_with_missing_parent_is_refused_as_missing_parent_not_inside`, **sans** directive `# SKIP` (40/40, skipped 0). Idem dans la suite complète (✔ dans les deux oracles ; baseline du harnais : tueur « plainly ok »).
- **Le motif est exact** : « isAbsolute(rel) is reachable only across win32 drives (POSIX path.relative never returns an absolute path) ».
  - `path.posix.relative` sur 200 000 paires aléatoires de chemins absolus (segments `..`, `.`, `Z:`, `..x`…) : 0 résultat absolu.
  - Construction même du test sous POSIX (cwd = racine, comme `npm test`) : `resolve("Z:/u4b-hyp-iv1-no-such-dir")` donne `<repo>/Z:/…`, `rel` = `Z:/u4b-hyp-iv1-no-such-dir/hyp-report-iv1.json`, `isAbsolute(rel)` = false.
  - Donc un test dé-skippé sur la CI Linux échouerait sur sa précondition : **rouge, jamais vert à vide**. Le skip est nécessaire, pas une commodité.
- **Forme** : miroir exact du skip déclaré de `sentinel_run_releases_chainstack_lock_on_sigterm` (`{ skip: process.platform === "win32" ? "<motif>" : false }` ; ici `? false : "<motif>"`). Aucun registre fermé des skips n'existe dans le dépôt (recherche sur `test/`, `scripts/`, `.github/`, tests d'apps et de paquets).
- **Sonde « garde de skip inversée »** (test seul, transitoire) : `iv1_…` devient `# SKIP` sous win32 (39 pass / 1 skip), et avec VZ-3 appliqué en plus, `u4b-hyp.test.ts` reste vert (0 fail). Témoin : test livré + VZ-3 ⇒ `not ok 40 - iv1_…`. Conséquences :
  - l'exécution sous win32 est porteuse : c'est le seul endroit où VZ-3 est vu ;
  - une inversion de la garde de skip passerait inaperçue sous win32, mais rougirait la CI Linux (précondition), et le harnais du G1 la refuserait (sa baseline exige le tueur `ok` sans SKIP).
- D-2 : **acceptable**.

## 5. Mutants (point 2)
### 5.1 Rejeu du harnais G1 v3, chemins seuls
- Copie `F:\tmp\g2-pre5\replay\mutants.mjs` (sha256 `208bd2a96d3d81ae578e974dbcb26f77e37ca419b3a5dcb170ad15f187a19a75`), clone `F:\tmp\g2-pre5\clone-mut` @ `bbe8538`.
- `diff` avec l'original `19f19ce9…` (`logs\replay-harness.diff`, sha256 `b0a3d0f5…`) : 7 lignes changées, toutes des chemins : commentaire `Run:`, `TREE`, `TMPF`, `OUT_LOG`, `OUT_JSON`, les 2 lignes `backup`, l'auto-sha de l'en-tête. La liste `MUTANTS` (`:67-104`) est inchangée.
- Résultats : voir §5.3 (tableau consolidé).

### 5.2 Harnais propre du relecteur (indépendant, 6 mutants nouveaux)
- `F:\tmp\g2-pre5\harness\g2-mutants.mjs` (sha256 `3ef2911e4f0a562eca5672d9ef0847e4d6a13dcc576971d745bc29d15562c9e1`), écrit sans reprendre le code du G1 ; clone `F:\tmp\g2-pre5\clone-mut2` @ `bbe8538`.
- Discipline : ancre exactement 1 fois (comptée dans node, `logs\anchor-count.log`, 1/1 à `0383e5b` et à `bbe8538` pour les 5 ancres de fichiers) ; suite COMPLÈTE en TAP ; KILLED ssi `not ok N - <tueur visé>` ; écritures durables (fsync) ; après chaque mutant, sha golden re-vérifié, `git status` = attendu et ensemble des entrées de la racine inchangé ; A-7 (refus de démarrer si l'une des 8 clés est présente, retrait insensible à la casse chez chaque enfant).
- Phases : AVANT = les 3 tests remplacés transitoirement par leurs blobs `0383e5b` ; APRÈS = tests livrés.
- Interprétation des 5 mutants demandés (déclarée) :
  - **MG-CV** (CARTO-T1C-5, « chaîne coupée à `--check-version` ») : la réécriture 2c de `episode-selection.json` perd le lien sidecar (`block_ts_extra_file`/`_sha256` écrits `undefined`, donc absents), `selection_sha256` porté inchangé. Le fichier lu à l'étape 5 ne se vérifie plus. Variante écartée : « 2c écrit ailleurs ». Elle est déjà rouge sur la base (`u4b_check_version_true_on_v350_and_leaves_selection_sha_unchanged` relit `version_check`), donc sans valeur de nécessité.
  - **MG-C12** (C12-PIN, « constante altérée d'un caractère ») : dans le TEST, `deploy_value: r.deploy_value` devient `deploy_valuE: …` dans l'objet journalisé de `C12`. Les 3 assertions `c12()` ne lisent que le code de sortie (`:98`, `:115`, `:160` ; `stdout` jamais asserté), elles ne peuvent donc pas voir cette dérive. **MG-C12R** fait la même altération côté RUNBOOK (dérive cosmétique ; MP-1 couvre la décision).
  - **MG-IV1** (I-V-1, « garde inversée ») : `|| isAbsolute(rel)` devient `|| !isAbsolute(rel)` dans `outOfRepo`. Son RED-BEFORE est **structurel**, pas un raté :
    - l'inversion rend « dehors » tout enfant relatif du dépôt, donc aucun test existant de refus in-repo ne peut y survivre ;
    - une inversion confinée à la seule branche inter-lecteurs n'existe pas en une édition ; sa forme la plus proche, qui survit à la base, est MI-1 (`rel.startsWith(sep)`) du G1 ;
    - MG-IV1 vérifie donc que `iv1_…` voit aussi la polarité inversée, pas la nécessité.
  - **MG-OD** (O-D, « digest recomputé depuis un autre fichier ») : le fichier ÉCRIT diverge du document digéré après sérialisation. Le premier `"verdict": "OUI"` du texte (h3 stratum 0, `:58` du rapport e2, 4 occurrences mesurées, `logs\od-anchor.log`) est écrit `NON`, et `body_digest` reste calculé sur l'objet en mémoire. Mécanisme distinct de R12 (objet) et de MD-1 (replacer).
  - **MG-DD** (VX-L2, « racine du dépôt déguisée par `..` ») : au site d'appel de la sonde, la racine passée à `assertLedgerDir` devient `join(ROOT, "..", "nowhere-root")`, une sœur du dépôt dérivée de `ROOT` par `..`. Un `--ledger-dir` sous le dépôt y est vu comme `..\<repo>\…`, donc « dehors ». Branche `..` de la garde : VX-L2 exerce la branche « absolu », ML-1 une racine descendante. Voir aussi §6.2 : le déguisement par `..` du NOM de l'enfant fait fléchir le code golden lui-même.

### 5.3 Tableau consolidé
**Rejeu G1 v3** (`replay\logs\mutants-after.{log,json}`, sha256 `fb9e8395…` / `e95a02d9…`, 09:28Z → 09:58:05Z, sous charge concurrente) :
- baseline 1045/1043/0/2, les 5 tueurs « plainly ok » ;
- **11/11 KILLED `byIntended`** ;
- comparaison champ par champ avec `F:\tmp\pre5\logs\mutants-after.json` (`scripts\replay-compare.mjs`, `logs\replay-compare.log`) : verdict, `byIntended`, sha muté et sha restauré identiques **11/11** ; ensemble rouge identique **10/11** ;
- seul écart, MI-1 : rouge supplémentaire `probe_smtp_connect_deadline_bounds_handshake` (`test/probe-narabi.test.ts`, hors pli), sous 2 à 3 suites concurrentes (durées ×2 environ). Ce fichier n'importe pas `u4b-hyp.mjs` : seul `u4b-hyp.test.ts` l'importe (`git grep`). C'est un rouge non signé (O-G2-6) ;
- fin de phase : `golden_sources_intact=true delivered_tests_intact=true root_clean=true`, arbre `[]`.

**Rejeu isolé de MI-1** (sans charge concurrente ; `replay\logs\mutants-after-MI-1.{log,json}` sha256 `038afa68…` / `c7044e4b…`) : baseline 1045/1043/0/2, **KILLED, 1 seul rouge = `iv1_…`**, sha muté `5c205b2e…` = G1, restauré, arbre `[]`. Le rouge SMTP du rejeu complet ne se reproduit pas. Faute de TAP conservé, il reste un rouge non signé hors pli (O-G2-6, item REVIEW-TAP-1).

**Harnais propre** : AVANT `g2m\logs\g2m-before.{log,json}` sha256 `bbcd6437…` / `928b1f1d…` ; APRÈS `g2m\logs\g2m-after.{log,json}` sha256 `d572f8df…` / `738b053a…` (10:03:34Z → 10:12:41Z, baseline 1045/1043/0/2, tueurs `ok` sans SKIP).

| mutant | item | fichier muté | AVANT (suite complète, tests `0383e5b`, baseline 1042/1040/0/2) | APRÈS (suite complète, tests livrés) | sha muté (APRÈS) |
|---|---|---|---|---|---|
| MG-CV | CARTO-T1C-5 | `u4b-select-episode.mjs` | **SURVIVED** (0 rouge) | **KILLED**, seul `u4b_chain_select_to_oracle_path` | `7e5bf544356b35fc…` |
| MG-C12 | C12-PIN | `u4b-probe-cutoff.test.ts` (constante `C12`) | **SURVIVED** | **KILLED**, seul `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim` | `4cc4872d8fdf5fbb…` (AVANT `75a3ed9b…` : golden = blob de base) |
| MG-C12R | C12-PIN | RUNBOOK (copie C-12) | **SURVIVED** | **KILLED**, seul le test C12-PIN | `f1f92dc3a2c7c9fd…` |
| MG-IV1 | I-V-1 | `u4b-hyp.mjs` | RED-BEFORE : `u4b_hyp_cli_refuses_forbidden_unknown_and_in_repo_flags`, `g2proto1b_out_with_dotdot_named_child_is_inside_the_repository` (non compté pour la nécessité) | **KILLED** : `iv1_…` + les 2 mêmes | `171e8b2fb7540050…` |
| MG-OD | O-D | `u4b-hyp.mjs` | **SURVIVED** | **KILLED**, seul T17 `u4b_hyp_report_e2_end_to_end_deterministic_body_digest` | `2f4e7db0fe0f5e18…` |
| MG-DD | C-V4b-3 | `u4b-probe-cutoff.mjs` | **SURVIVED** | **KILLED**, seul `u4b_probe_cutoff_refuses_before_any_fetch` | `f2673d1f41adadd5…` |

- Bilan du harnais propre : **6/6 KILLED `byIntended`** ; 5/6 SURVIVED avant, donc nécessité prouvée par le pli pour MG-CV, MG-C12, MG-C12R, MG-OD et MG-DD. Fin de phase APRÈS : `sources_and_runbook_intact=true delivered_tests_intact=true`, arbre `[]`, racine inchangée ; `restored=true clean=true` après chacun des 6.
- Couverture « ≥ 1 mutant rougit chaque item » :

| item | mutants G1 (rejoués) | mutants G2 |
|---|---|---|
| CARTO-T1C-5 | MC5-1, MC5-4, MC5-2 | MG-CV |
| C-V4b-3 | VX-L2, ML-1 | MG-DD |
| I-V-1 | VZ-3, MI-1 | MG-IV1 + R02 ciblé |
| O-D | R12, MD-1 | MG-OD |
| C12-PIN | MP-1, MP-2 | MG-C12, MG-C12R |

- Fin de la phase AVANT : `sources_and_runbook_intact=true delivered_tests_intact=true`, arbre `[]` (départ `[]`), racine inchangée. Après chaque mutant : `restored=true clean=true`, 6/6.
- MG-IV1 : aucune écriture résiduelle. Le seul chemin qui passerait la garde inversée en écrivant, `<ROOT>\..u4b-hyp-inrepo-probe.json` (`u4b-hyp.test.ts:701-705`), est retiré par le `finally` du test ; `clean=true` mesuré.

### 5.4 Rejeux ciblés complémentaires
- **R02** (re-G2-delta 1c, verbatim : paire relue par code dans `g2-1c-mutants.mjs:39,:49`, jamais retapée ; `scripts\r02-targeted.mjs`, `logs\r02-targeted.log`) : sha muté `ed63971dcaa700ec34694b33929f67341c85a7d38b088a418bc9020dcdef2855` = sha d'origine. Rouge sur `u4b-hyp.test.ts` par **le seul** `iv1_…` (status 1). Outil restauré `65b0d8f9…`, `git status` vide. Rejeu CIBLÉ (fichier du tueur), pas suite complète.
- Sonde « garde de skip inversée » : §4.

## 6. Items : chaque test mesure-t-il ce que l'item demande ? (point 2)
### 6.1 Item par item
- **CARTO-T1C-5** (ADR `:990`, `:1444`). Définition : « `runSelect` → `episode-selection.json` → `run()` du prober, seul `fetch` bouchonné ».
  - Test `u4b_chain_select_to_oracle_path` (`u4b-chain.test.ts:158`) : chaîne réelle `runDiscover` → `runFillTs` → `runSelect --block-ts-extra` (fetch = `OFFLINE`, qui rejette) → `runCheckVersion` → `run()` du prober. Seul `globalThis.fetch` est substitué (helper `discover` compris, `:47-56`) ; `env: {}` et `now` sont des dépendances injectées.
  - Liage A-10 : `b0`, `b_last`, `episode_id` et `selection_sha256` de la provenance sont lus dans le fichier du sélecteur, jamais codés en dur. Fenêtre D_e = `[B0, B_last]` ×2 (quorum), rien au-delà de `B_last`. Bord : l'update À `B_last` est compté, celui à `B_last + 1` ne l'est pas. Le fichier est octet-identique après le prober.
  - D-1 (extension 2a/2c) : nécessaire. MC5-4 et MG-CV survivent à la base et ne sont vus que par cette chaîne. Le prober ne lit pas `version_check` (`u4-oracle-path.mjs:92-100`) : le lien 2c → 5 passe par le seul sha du payload, et c'est exactement ce que la chaîne teste.
  - P-U3 re-mesuré par `git grep` : fichiers de test important à la fois `u4b-select-episode.mjs` et `u4-oracle-path.mjs` : 0 à `0383e5b`, **1** à `bbe8538` (`u4b-chain.test.ts`).
  - **Conforme.**
- **C-V4b-3 / VX-L2** (ADR `:1442`). Définition : « épingler le refus d'un `--ledger-dir` SOUS la racine du dépôt pour la sonde, dans `u4b_probe_cutoff_refuses_before_any_fetch` ».
  - Assertion `:234-240`, placée AVANT le cas d'épisode altéré (`:241-244`) : refus NOMMÉ `/--ledger-dir is under the repo root/`. Le chemin n'existe pas, donc une garde neutralisée refuse sur « does not pre-exist » (rouge), et `readdirSync(ROOT)` n'y gagne rien.
  - Le `counter.n === 0` final du test couvre aussi ce cas (0 fetch). `bad()` remplace le drapeau en place (`splice`) : la surcharge est effective.
  - **Conforme à la lettre pour un enfant ordinaire. Portée incomplète au regard de la leçon ADR `:1729-1732`** : la forme limite `..x` n'est ni épinglée ni refusée par le code golden (§6.2).
- **I-V-1** (ADR `:1750`). Définition : « `--out` sur un autre lecteur, parent inexistant ⇒ “parent directory does not exist”, jamais “inside the repository”, sans écriture (tue VZ-3) ».
  - Test `iv1_…` (`u4b-hyp.test.ts:873`) : lecteur ≠ celui du dépôt (`Z`, ou `Y` si le dépôt est sur `Z:`). Préconditions assertées : `isAbsolute(rel) && !rel.startsWith("..")` (non-vacuité) et parent absent. Prédicat : `HypError`, message « parent directory does not exist » ET pas « inside the repository ». Puis `existsSync(out) === false`.
  - Tue VZ-3, MI-1 et R02 (ce dernier rejoué par moi) ; MG-IV1 : §5.3. Exécuté sous win32, skip exact hors win32 (§4).
  - **Conforme.**
- **O-D** (ADR `:1751`). Définition : « recompute indépendant de `body_digest` depuis le fichier écrit dans T17 ».
  - Assertions `u4b-hyp.test.ts:593-600` DANS T17 : `canonT` est défini dans le test (rien d'importé) et appliqué à `JSON.parse(t1)`, soit le fichier `o1` ÉCRIT. Liste fermée des clés hors digest : `schema`, `kind`, `provenance`.
  - Égalité vérifiée indépendamment, hors test (`scripts\od-anchor.mjs`) : rapport e2 golden `21daeaec…` (= octets du G2 1c), recalcul = `body_digest` = `49b138c3…`.
  - « Champ `undefined` détectable » : exact. `canon` en mémoire produit `"undefined"`, alors que le fichier JSON omet la clé.
  - **Conforme.**
- **C12-PIN** (ADR `:1446`). Définition : « épingle durable = un test qui lit le RUNBOOK et compare ».
  - Test `:345-356` : relit le RUNBOOK. Exactement 1 ligne porte l'ancre (non-vacuité), puis corps `===` `C12`. La regex `node -e '([^']*)' ` est sûre : `C12` ne contient aucune apostrophe (452 caractères, 0 antislash).
  - Vert sur la pointe `f1ed77e` malgré RUNBOOK-E2-46 (§3).
  - **Conforme.**

### 6.2 Constat de fond : la classe C-G2D-1 (`..x`) est présente dans les deux gardes de la sonde, et dans 6 autres
- **Mesure sur le code GOLDEN, sans mutation** (`scripts\dotdot-demo.mjs` sha256 `75d82eee…`, `logs\dotdot-demo.log` sha256 `ed73ac15…`, clone isolé `clone`, `fetch` bouchonné en forme réelle, env vide, 0 réseau) :
  - `assertLedgerDir(<ROOT>\u4bpc-g2-nosuch)` ⇒ refus « under the repo root » (témoin) ;
  - `assertLedgerDir(<ROOT>\..u4bpc-g2-nosuch)` ⇒ refus « does not pre-exist » : la garde « sous la racine » ne l'a PAS vu ;
  - `<ROOT>\..u4bpc-g2-ledger` existant ⇒ **ACCEPTÉ** ;
  - `runProbe` golden avec ce `--ledger-dir` : exit 0, GO. `git status` du clone : `?? ..u4bpc-g2-ledger/g2dd/{drpc.org,mevblocker.io}.{head,jsonl}`, soit **le ledger écrit DANS l'arbre de travail du dépôt** ;
  - `runProbe` golden avec `--out <ROOT>\..u4bpc-g2-out` : exit 0, `?? ..u4bpc-g2-out/cutoff-23600000.json`, soit **le rapport écrit DANS le dépôt** ;
  - nettoyage vérifié : entrées de la racine et `git status` identiques au départ.
- Cause : `relative(ROOT, <ROOT>\..x)` = `..x` et la règle est `!rel.startsWith("..")`, **sans séparateur**. C'est exactement le défaut C-G2D-1, corrigé dans `u4b-hyp.mjs:629` seulement (`rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)`).
- Même règle, mot pour mot, aux 8 sites suivants (`git grep`, `bbe8538`) :
  - `scripts/census/u4-guard.mjs:103` (`assertLedgerDir`, 7 appelants mesurés par `git grep` : `u4b-probe-cutoff.mjs:85`, `u4-oracle-path.mjs:177`, `u4b-select-episode.mjs:281` (`--check-version`) et `:347` (`--fill-ts`), `u4b-discover.mjs:86`, `u4-redraw.mjs:67`, `u3-realized.mjs:455` (labeler gelé §2)) ;
  - `scripts/census/u4b/u4b-probe-cutoff.mjs:79` (`--out`) ;
  - `scripts/census/u4-oracle-path.mjs:180` (`--raws-dir`) ;
  - `scripts/census/u4b/u4b-select-episode.mjs:160` (`--out` : fixtures et racine) ;
  - `scripts/census/u4b/u4b-reduce.mjs:37` ;
  - `scripts/census/u4-reduce.mjs:28` ;
  - `scripts/census/u3-realized.mjs:494` ;
  - `apps/bell/src/collect.ts:492` (`assertOutsideRepo`, main opérateur win32).
- Recherche d'un item existant, par grep dans `docs/` à la pointe : aucun item de propagation. La leçon ADR-U4b `:1729-1732` dit « toute garde de chemin se sonde sur ses formes limites (`..x`, `..`, absolu, autre lecteur, séparateur) avant d'être déclarée épinglée ». O-A (`CHANTIERS:1001`) vise l'UNC et les espaces de noms dans `outOfRepo` seulement.
- Exposition : nulle en course sous les commandes du RUNBOOK (chemins fixes `F:/course-ukemi/…`, hors dépôt). Il faudrait un nom de dossier commençant par `..` DANS le dépôt. Ce n'est pas un chemin servi. **Ce n'est pas un défaut du pli** (test-only, code non touché, défaut antérieur). Un test du refus `..x` serait ROUGE sur le code golden, il ne peut donc pas entrer dans ce pli test-only.
- Conséquence pour ce pli : le texte de clôture de C-V4b-3 (`ADR-amendement.md` §1 : « La sonde refuse NOMMÉMENT un `--ledger-dir` SOUS la racine du dépôt ») est vrai pour un enfant ordinaire, faux pour un enfant `..x`. Il doit porter sa portée. D'où C-G2-1 et C-G2-2 (§8).

## 7. Point 5 (amendement) et point 6 (A-7, D-4)
- **Renvois de l'amendement** (`scripts\cite-check.mjs`, `logs\cite-check.log`) :
  - **31/31** `fichier:ligne` exacts, dont tests `:158`, `:132-156`, `:234-240` (avant `:241-244`), `:873`, `:593-600`, `:345-356`, `:22`, `test/guard-scripts-u4.test.ts:221`, RUNBOOK `:620`, ADR `:990/:1442/:1444/:1446/:1750/:1751` (à `0383e5b`), CHANTIERS `:990/:1005`, carto `:157/:250`, ancres sélecteur `:228/:233` et prober `:145/:93` (à `0383e5b`), cp-2 4b `:15/:27`, cp-2 1c `:54/:88`, `export-public.mjs` « docs/** (not exported) » ;
  - **8/8** noms de tests cités existent à `bbe8538`.
- Comptes de l'amendement re-mesurés égaux : 1045/1043/0/2 et R-25 168 (114/2, 31/1, 20/0) au §3.
- **A-6** (`scripts\a6.mjs` sha256 `ebd041ea…`, `logs\a6.log` `a7177350…`, `logs\a6-merge2.log` `69b49c32…`) : les 18 sha LF de `INVARIANTS-BEFORE.txt` (9 gelés §2, prereg `1971d9b1`, ADR-U4b `e902fa6d`, 7 témoins) sont recalculés depuis les blobs.
  - **18/18** sur `0383e5b`, sur `bbe8538` et sur le disque du clone du lot ;
  - **18/18** sur l'index de la fusion `f1ed77e` + lot ;
  - **17/18** sur l'index de la fusion `32875d5` + lot. Le seul écart est ADR-U4b (`392a8442…`), déplacé par le TRONC (`32875d5`, amendement v3 CONC-1, +357/−0), pas par le lot ; les 9 gelés §2 et le prereg restent intacts. Même lecture que la note A-6 du cp-2 STATS-1 1c (« mouvements du TRONC »).
- La ligne 0.6 est intacte : 30 noms `.mjs`/`.ts` extraits des lignes `:91-100` (tokenisation différente des 21 du G1, même conclusion), 0 touché par le pli.
- **D-6 (registre d'exclusion) : acceptable.** Les 3 fichiers sont dans le TABLEAU `tests` (15 entrées, `logs\export-registry.log`), pas seulement dans la prose de `reason`. La clause générale de `reason` couvre « a governance doc excluded by the D7 blacklist » ; le RUNBOOK est sous `docs/**` (« not exported », `export-public.mjs:60`). Éditer la phrase unique `reason` toucherait un invariant A-6 (`0b648e14`) et rouvrirait le motif de conflit de O-E. `export:check` sort à exit 0 (lot et fusion).
- **A-7** (`scripts\a7-d4.mjs`, `logs\a7-d4.log`, sur les +165 lignes ajoutées) : 0 `process.env`, 0 URL http(s)/ws(s), 0 appel `fetch(`, 0 `env` non vide, 0 non-ASCII. Une seule touche « noms payants » : le commentaire `// sentinel_run_releases_chainstack_lock_on_sigterm.` (nom d'un test cité par le motif du skip), bénin. 9 lignes `globalThis.fetch =` : 4 bouchons (`chainStub`, `OFFLINE`, bouchon `eth_getStorageAt`, `proberStub`), chacun restauré en `finally`, plus une restauration finale.
- **D-4** : les 3 lignes retirées sont les 3 `import` élargis en sur-ensembles. Aucune ligne d'assertion de base ne manque verbatim dans `bbe8538`.

| fichier | `assert.` | `test(` |
|---|---|---|
| `u4b-chain.test.ts` | 12 → 26 | 2 → 3 |
| `u4b-hyp.test.ts` | 228 → 234 | 39 → 40 |
| `u4b-probe-cutoff.test.ts` | 76 → 80 | 12 → 13 |

## 8. Verdict G2 : **PASS-AVEC-CORRECTIONS** (liste fermée, 3 corrections docs/items, 0 correction de code ni de test)
Le pli est conforme sur les 6 points :
1. test-only, `src`/`packages`/`scripts/census` intouchés ;
2. 5 items clos par des tests qui mesurent leur définition, chacun rougi par ≥ 1 mutant, avec ≥ 5 mutants propres nouveaux ;
3. D-2 exact ;
4. oracle 7 × 0 à 1045/1043/0/2, R-25 = 168, et fusions à blanc à 0 conflit sur deux pointes, N + 3 à chaque fois (`f1ed77e` : 1042 → 1045 ; `32875d5` : 1055 → 1058) ;
5. amendement exact, D-6 acceptable ;
6. A-7 et D-4 tenus.

Les corrections portent sur des TEXTES et un ITEM, à la charge de l'orchestrateur. Aucune ne bloque la fusion.

- **C-G2-1** (docs ; orchestrateur ; à l'insertion de `ADR-amendement.md` dans ADR-U4b, avant le G7) : borner la clôture de **C-V4b-3**. À corriger : la ligne du tableau §1 (« La sonde refuse NOMMÉMENT un `--ledger-dir` SOUS la racine du dépôt… »). Formulation proposée :
  - épinglé pour un enfant ORDINAIRE de la racine ;
  - la forme limite `<racine>/..x` est ACCEPTÉE par la garde golden (`u4-guard.mjs:103`, règle `!rel.startsWith("..")` sans séparateur, classe C-G2D-1) ; mesuré par ce G2, ledger et `cutoff-*.json` écrits DANS le dépôt (§6.2) ;
  - renvoi à l'item de C-G2-2.

  Motif : la leçon ADR-U4b `:1729-1732` interdit de déclarer « épinglée » une garde non sondée sur `..x`. En l'état, le texte d'ADR déclarerait fermé un trou mesuré.
- **C-G2-2** (item formé ; orchestrateur, puis worker d'un pli de CODE) : **GUARD-DOTDOT-1**, à inscrire dans le tableau §6 (« Items formés et suites ») de l'amendement inséré.
  - Objet : propager le correctif C-G2D-1 (`rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)`, `u4b-hyp.mjs:629`) aux 8 sites de §6.2 : `u4-guard.mjs:103`, `u4b-probe-cutoff.mjs:79`, `u4-oracle-path.mjs:180`, `u4b-select-episode.mjs:160`, `u4b-reduce.mjs:37`, `u4-reduce.mjs:28`, `u3-realized.mjs:494`, `apps/bell/src/collect.ts:492`.
  - Tests : par site, un test des formes limites (`..x` présent et absent, `..`, absolu, autre lecteur, séparateur), plus des mutants. Le test `..x` est ROUGE aujourd'hui sur le code golden : c'est la preuve de nécessité.
  - **Contrainte de gel, deux régimes** (`INVARIANTS-BEFORE.txt`, re-mesurés §7) :
    - `u4b-reduce.mjs` (`a5e66cd3`) et `u3-realized.mjs` (`cb020425`) sont parmi les **9 sha gelés §2 du prereg**. Ils ne s'éditent pas sans déviation du prereg. Leur traitement (après la course, D-n pré-enregistrée, ou garde enveloppante hors fichier gelé) est une décision de l'orchestrateur, sources à l'appui, jamais un contournement ;
    - `u4-guard.mjs` (`e3f5c70d`), `u4-oracle-path.mjs` (`4ed4c31e`), `u4b-probe-cutoff.mjs` (`8bdb1478`) et `u4b-select-episode.mjs` (`20e1cf9d`) sont des témoins A-6 et des outils du gel 0.6 de la course : pas d'édition pendant une étape de course qui épingle ces sha.
    - `u4-reduce.mjs` et `apps/bell/src/collect.ts` sont hors de ces deux gels (absents de la section 0.6, lignes `:91-100`, `logs\runbook06-files.txt`).
    - Point de conception pour le ruling : corriger `u4-guard.mjs:103` corrige d'un coup la garde de ledger des 7 appelants. Cela inclut le labeler gelé `u3-realized.mjs:455`, dont le sha ne bouge pas mais dont le comportement changerait (dépendance importée). Sa propre garde `:494` (`--out`/`--raws-dir` vs fixtures) reste, elle, dans le fichier gelé.
    - Le calendrier du pli de code relève donc d'un ruling de l'orchestrateur.
  - Déclencheur proposé, au premier des deux : prochain pli qui touche l'un de ces 8 fichiers ; ou toute commande de course qui passerait à l'une de ces gardes un chemin choisi hors des chemins fixes du RUNBOOK.
  - Exposition actuelle : nulle (chemins `F:/course-ukemi/…`, hors dépôt).
  - `error_origin` proposé, à assigner au G7 : auteurs des gardes (défaut antérieur, par site) ; G7 U-4b-STATS-1 (leçon consignée `:1729-1732` sans item de propagation) ; G1 de ce pli (clôture C-V4b-3 déclarée sans la sonde `..x` exigée par `:1732`) ; relecteurs antérieurs de la sonde (G2/cp-2 U-4b-1b-4, qui ont sondé la racine, pas `..x`).
- **C-G2-3** (docs ; orchestrateur ; au G7) : C12-PIN est clos, deux textes à mettre à jour.
  - (i) `RUNBOOK-course-ukemi-2026-09-22.md:618` dit encore « égalité vérifiée à l'insertion ; item C12-PIN ». Il doit renvoyer au test d'épingle `u4b_probe_cutoff_c12_constant_is_the_runbook_control_verbatim`. Éditer `:618` ne touche pas la ligne ancrée `:620` que lit le test.
  - (ii) Consigner dans la ligne C12-PIN de l'amendement la règle de roll-over : l'épingle lit le RUNBOOK **par son nom daté**. Si l'ancien fichier est renommé ou supprimé, le test rougit (fail-closed). Mais si un nouveau RUNBOOK daté devient l'exécutable et que l'ancien reste, le test reste vert sur une copie morte. D'où la règle : tout roll-over du RUNBOOK de course Ukemi re-pointe ce test dans le même pli.

### Observations (sans correction)
- **O-G2-1** : « VZ-3 = R02 » est vrai sémantiquement, pas à l'octet (shas mutés `237e5f34…` et `ed63971d…`). Rejoué verbatim par moi, R02 est tué par le seul `iv1_…` (§5.4).
- **O-G2-2** : MI-1 avait un rouge supplémentaire, `probe_smtp_connect_deadline_bounds_handshake` (`test/probe-narabi.test.ts`), dans mon rejeu complet sous charge. Rejoué seul, MI-1 n'a que `iv1_…` (§5.3). Son verdict `byIntended` ne dépend pas de ce rouge. Statut du rouge lui-même : voir O-G2-6.
- **O-G2-3** : une inversion de la garde de skip de `iv1_…` serait muette sous win32, rouge sur la CI Linux (précondition) et refusée par la baseline du harnais G1 (§4). Aucune action.
- **O-G2-4** : MC5-2 (G1) et MG-IV1 (moi) sont RED-BEFORE. Tués après, ils ne prouvent pas la nécessité. Celle-ci repose :
  - pour CARTO-T1C-5, sur MC5-1 et MC5-4 (SURVIVED avant, G1) et MG-CV (SURVIVED avant, moi) ;
  - pour I-V-1, sur VZ-3 et MI-1 (SURVIVED avant, G1) et R02 (SURVIVED sur l'outil de même sha au G2 1c).
- **O-G2-5** : la pointe a bougé deux fois pendant la revue : `637dbb4` → `f1ed77e` (docs), puis → `32875d5` (fusion G7 CONC-1, code). Mes deux fusions à blanc sont mesurées (§3, §3 bis). Toute fusion réelle sur une pointe ultérieure se re-mesure.
- **O-G2-8** : `docs/CHECKPOINT2-lot-ukemi-pre5-tests.md` (cp-2 de ce lot) est apparu dans la pointe `32875d5` pendant ma revue. Je ne l'ai **pas lu** (indépendance G2 ‖ cp-2) ; je n'ai vu que son nom dans le `--stat` du commit.
- **O-G2-6 : deux rouges NON SIGNÉS, hors pli.**
  - Les rouges :
    - (a) baseline APRÈS de mon harnais, 1ʳᵉ tentative (10:01-10:02Z, `clone-mut2`, arbre `bbe8538` livré) : `apps\harness\test\server.test.ts` rouge au niveau du fichier entier ;
    - (b) rejeu G1, run de MI-1 (09:46-09:48Z, `clone-mut`) : `probe_smtp_connect_deadline_bounds_handshake`.
  - Règle applicable, ruling D4 (`CHANTIERS:586`, `nodejs/node#56645`) : « tout rouge non signé reste un rouge ». Aucun des deux harnais ne conserve le TAP : la signature n'est pas disponible, **je ne les classe donc pas comme flakes**.
  - Ce qui est mesuré :
    - les deux fichiers sont hors du diff du lot (`git diff 0383e5b bbe8538 -- apps/harness test/probe-narabi.test.ts` vide) ;
    - aucun des deux ne s'est reproduit : environ 30 suites complètes ont tourné pendant cette revue, dont 6 baselines ou oracles hors mutation sur l'arbre du lot ou les fusions, toutes vertes ;
    - `server.test.ts` passe 6/6 seul et écoute sur un port éphémère (`startServer(0)`) ;
    - aucun verdict de mutant ne repose sur une suite où ils rougissaient. La 1ʳᵉ baseline rouge a bloqué toute mutation, et les verdicts APRÈS viennent de la seconde baseline, verte.
  - **Item formé REVIEW-TAP-1** (porteur : orchestrateur, suivi du ruling D4) :
    - contenu : ces deux rouges non signés, avec les journaux disponibles (`g2m\logs\g2m-after-attempt1-baseline-flake.log`, `replay\logs\mutants-after.log` au bloc MI-1, noms seuls) ;
    - règle de harnais : tout harnais de revue conserve le TAP intégral d'une suite rouge (baseline comprise), pour que la signature exigée par `:586` soit disponible ;
    - déclencheur : prochain harnais de revue écrit, ou prochain rouge de l'un de ces deux noms, au premier des deux.
  - `error_origin` proposé : harnais de revue (G1 v3 et G2), qui jettent le TAP ; relecteur G2 pour son propre harnais.
- **O-G2-7** : le compte « 1045/1044/0/1 dans `F:\Monark` avec les artefacts e2 » (amendement §3) n'est **pas mesuré** par ce G2. Aucune exécution dans `F:\Monark` (périmètre d'écriture) ; mes clones n'ont pas les artefacts e2 non suivis. C'est une conséquence arithmétique (1 skip d'artefact en moins), à constater par l'orchestrateur après fusion.

### `error_origin` (proposé ; assignation au G7)
| constat | `error_origin` proposé |
|---|---|
| C-G2-1 (clôture C-V4b-3 sans portée) | worker G1 (texte de clôture qui généralise un test d'enfant ordinaire, sans la sonde `..x` exigée par ADR `:1732`) ; advisor d'orientation du G1 (avis C-V4b-3 « assertion AVANT le bloc », sans la forme `..x`) |
| C-G2-2 (GUARD-DOTDOT-1, défaut de code antérieur) | auteurs des 8 gardes (par site) ; G7 U-4b-STATS-1 (leçon `:1729-1732` consignée sans item de propagation) ; relecteurs antérieurs de la sonde (G2/cp-2 U-4b-1b-4 : racine sondée, pas `..x`) |
| C-G2-3 (i) (`RUNBOOK:618` périmé) | n-a en faute : texte écrit par l'orchestrateur à l'insertion du G7, avant l'épingle ; sa mise à jour est une conséquence de la clôture |
| C-G2-3 (ii) (règle de roll-over absente) | worker G1 (l'amendement clôt C12-PIN sans règle de roll-over pour une épingle liée à un nom de fichier daté) |
| O-G2-6 / REVIEW-TAP-1 (rouges non signés) | harnais de revue (G1 v3 et G2 propre) qui jettent le TAP |
| O-G2-1..5, 7, 8 | n-a (observations) |

### Items et suites (zéro « dû » nu)
- GUARD-DOTDOT-1 : C-G2-2, avec objet, porteur, déclencheur et `error_origin` proposé.
- Règle de roll-over de C12-PIN : C-G2-3 (ii).
- REVIEW-TAP-1 : O-G2-6 (porteur orchestrateur, déclencheur formé).
- Items déjà réglés par ruling, repris sans changement :
  - WORKTREE-DURABILITY-1 : commit orchestrateur, fait (`bbe8538`) ;
  - I-5 : amendement CONSIGNE D-1, porteur orchestrateur ;
  - observation 0.6 : RETRY-2/3.

## 9. Provenance
- Relecteur `claude-opus-5-5[1m]`, effort max (décision 133), instance séparée, contexte frais. Aucun commit, aucun workflow (R-20). Écritures sous `F:\tmp\g2-pre5\` seulement ; fichiers par Write/Edit (A-13).
- Écart consigné : l'environnement demandait de préférer Bash pour les écritures, A-13 prévaut pour ce projet. Deux incidents de transport Bash, tous deux rattrapés :
  - `\\` réduit dans un `node -e` (09:1xZ) : tout script est ensuite passé par Write ;
  - comptage `grep -c $'\r'` faux (344 au lieu de 0, 10:27Z) : les comptes d'octets sont faits par node (§10).
- Advisor :
  - orientation (09:1xZ) : **timeout**, consigné ;
  - mi-parcours (09:5xZ), après les mesures, avant verdict. Avis retenus :
    - constat `..x` ⇒ PASS-AVEC-CORRECTIONS avec correction docs + item ;
    - risque de pollution de `clone-mut2` par MG-IV1, vérifié : le `finally` du test nettoie, `clean=true` mesuré ;
    - MI-1 = flake de charge ;
    - registre `tests[]` confirmé ;
    - roll-over C12-PIN, que j'ai précisé : fail-closed seulement si l'ancien fichier disparaît ;
  - clôture, appelée après écriture durable du rendu (sha intermédiaire `34c923de…` dans `logs\G2.sha256`), vers 10:23Z. La forme PASS-AVEC-CORRECTIONS est confirmée. Avis retenus et appliqués :
    - table `error_origin` consolidée ;
    - identité du rendu G1 committé avec `RENDU.md` inscrite au §1 ;
    - RED-BEFORE de MG-IV1 expliqué comme structurel ;
    - note de persistance au §10 (précédent `047dfdf`) ;
    - rouges non signés sourcés par `CHANTIERS:586`. En relisant `:586`, j'ai trouvé la règle « tout rouge non signé reste un rouge ». J'ai donc RETIRÉ mon classement « flake » et formé REVIEW-TAP-1 : l'avis proposait de « sourcer le flake », la source lue impose au contraire de ne pas le déclarer.
- Leçon propre (AM) : mon harnais jetait le TAP. Une baseline rouge n'a donc pas pu être signée. Tout harnais de revue doit conserver le TAP de toute suite rouge (REVIEW-TAP-1).
- Processus de course : jamais touchés (aucun `kill`, aucune lecture de `F:\course-*`). `F:\Monark` : lecture de refs git seulement (`rev-parse`, `clone`, `fetch` vers mes clones).
- Clones créés sous `F:\tmp\g2-pre5\` et laissés en place pour le rejeu R-21 de l'orchestrateur, `node_modules` par `npm ci` réel, 0 jonction :
  - `clone` (lot, oracle, sondes) ;
  - `clone-mut` (rejeu G1) ;
  - `clone-mut2` (harnais propre) ;
  - `clone-merge` (fusion indexée `--no-commit`, branche jetable `g2-merge-dry-run`, aucun commit créé) ;
  - `clone-merge2` (seconde fusion indexée `--no-commit` sur `32875d5`, branche jetable `g2-merge-dry-run-2`, aucun commit) ;
  - `clone-tip` (pointe, avancée par `pull --ff-only` de `f1ed77e` à `32875d5`).
- Les états finaux git des 6 clones sont mesurés en fin de passe (§10).

## 10. État final et intégrité
État relevé à la clôture (voir la ligne horodatée du journal) :
- `clone`, `clone-mut`, `clone-mut2` : `bbe8538`, `git status` vide. Dans `clone-mut` et `clone-mut2`, les 5 goldens (`20e1cf9d`, `4ed4c31e`, `8bdb1478`, `65b0d8f9`, RUNBOOK `1c945d4d`) et les 3 tests livrés (`d077522b`, `fecb7a4a`, `d4f069a8`) sont re-hachés égaux.
- `clone-merge` (`f1ed77e`) et `clone-merge2` (`32875d5`) : seulement les 4 fichiers du lot indexés, 0 commit de fusion créé.
- `clone-tip` : `32875d5`, `git status` vide.
- sha256 de ce rendu : calculé APRÈS la dernière écriture, dans `F:\tmp\g2-pre5\logs\G2.sha256` et dans la sortie finale, jamais dans le fichier lui-même.
- **Persistance** (précédent `047dfdf` : `\t` littéral devenu TAB dans des en-têtes persistés) :
  - ce fichier compte **0 TAB** et **0 CR**, tous deux comptés **sur les octets par node** (`logs\lf-normalize.log` : 0 CRLF, 0 CR isolé ; puis comptage d'octets : CR 0, TAB 0, LF = nombre de lignes). Il contient de nombreux chemins `F:\tmp\…`.
  - Incident A-13 consigné : un `grep -c $'\r'` passé par le transport Bash a rendu 344 (faux). node sur les mêmes octets donne 0, et le sha est resté identique : la « renormalisation » LF de `scripts\lf-normalize.mjs` n'a rien changé, garde-fou « CR seuls » vérifié ;
  - le sha256 vaut pour les octets écrits par l'outil Write/Edit ;
  - toute transformation à la persistance (antislash, TAB, fins de ligne) change ce sha et doit être déclarée par l'orchestrateur, jamais silencieuse.
