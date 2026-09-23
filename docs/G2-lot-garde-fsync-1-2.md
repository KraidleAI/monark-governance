# Re-G2 — pli 2 du lot GARDE-FSYNC-1 (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:\tmp\g2-gfsync1-2\G2-2.md` (sha256 55573dcb21e3855909857286c64ed384dbb5df934e4327523371b94f2682a0f7). Verdict : PASS-AVEC-CORRECTIONS (C-G2b-1, C-G2b-2 → pli 3 `9d85fb1`).

---

Modèle résolu : claude-opus-5-5[1m]

# re-G2 (contexte frais) — pli 2 du lot GARDE-FSYNC-1 — `lot/garde-fsync-1` @ `ae9e73c` (parent `d141413`, base `66f75c2`)

Relecteur : worker G2 à contexte frais (pas la session du G2 ni du pli), modèle résolu ci-dessus (préfixe `claude-opus-5-5`, R-1, décision 133), effort max. Aucune écriture dans `F:\Monark` ni dans un worktree `F:\Monark-wt-*` (lecture seule : `git log/show/diff/rev-parse/branch`, lecture de `docs/`) ; aucun commit (R-20). Tout le travail est sous `F:\tmp\g2-gfsync1-2\` (TEMP/TMP/TMPDIR = `F:/tmp/g2-gfsync1-2/os-tmp`), ceinture A-7 (`env -u` des 8 clés) sur tout oracle, test, mutant et sonde.

État : CLOS le 2026-09-23 à 06:27:55Z (`date -u`) ; écrit au fil de l'eau (voir « Journal d'avancement »). **Verdict : PASS-AVEC-CORRECTIONS, liste fermée C-G2b-1 (bloquante dans sa forme minimale (B)) et C-G2b-2 (non bloquante)** — détail au §11.

## 0. Orientation et entrées lues

- Début 2026-09-23T05:47:39Z (`date -u`, `start.txt`).
- Clone isolé : `git clone --no-hardlinks -b lot/garde-fsync-1 F:/Monark F:/tmp/g2-gfsync1-2/clone` (exit 0) puis `git checkout ae9e73c` (exit 0) ; `git rev-parse HEAD` = `ae9e73c14ed0e435dab19500a152d6bccf4f9de2` ; parents mesurés : `ae9e73c` → `d141413808363d133aca47c9a6a427a20c98c90d` → `66f75c2c4907f92f272fdbe7c28aa6bc417f36f8` (`git log -1 --format='%H %P'`) ; `git status --porcelain` = 0.
- `npm ci --ignore-scripts --cache F:/tmp/g2-gfsync1-2/npm-cache` sous ceinture A-7 : exit 0 (`npm-ci.log`) ; `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-gfsync1-2\clone\packages\rpc-guard\src\index.ts` ; node v24.15.0.
- Entrées lues intégralement : G2 `docs/G2-lot-garde-fsync-1.md` (branche `lot/etude-suite`, C-G2-1..C-G2-5) ; cp-2 `docs/CHECKPOINT2-lot-garde-fsync-1.md` (C-V-1..C-V-6) ; rendu du pli 2 committé `docs/PLI-lot-garde-fsync-1-2.md` et intégral `F:\tmp\gfsync1-pli\RENDU-PLI-2.md` (sha256 identiques : `4556bb0b2578f2e4…`, 41 498 o chacun) ; `DELIVERED-pli2.sha256` ; harnais G2 `F:\tmp\g2-gfsync1\mutants-g2.mjs`, expériences `scratch\exp.mjs` (E1-E10) et `scratch\e11.mjs` + journaux `exp-run1.log`, `e11.log` ; harnais cp-2 `F:\tmp\cp2-gfsync1\mutants\{mutants,mv10}.mjs` ; harnais propre du pli `F:\tmp\gfsync1-pli\mutants-pli2.mjs` ; `CONSIGNE-STANDARD-G1.md` A-11..A-13 (version `lot/etude-suite`) ; sources `packages/rpc-guard/src/{reconcile,repair,ledger,lock,cli}.ts`, `bin/rpc-guard.mjs`, tests `{durable,repair-tail}.test.ts`, `harness.ts` ; RUNBOOK complet à `ae9e73c`.

## 1. Diff `d141413..ae9e73c` — périmètre et absence de changement de comportement (point 1)

`git diff --name-status d141413..ae9e73c` : 6 fichiers — `A docs/PLI-lot-garde-fsync-1-2.md` (401 lignes, = rendu intégral, sha256 identique `4556bb0b…`), `M docs/RUNBOOK-rpc-guard.md` (+39/−9), `M packages/rpc-guard/src/reconcile.ts` (+5/−5), `M packages/rpc-guard/test/durable.test.ts` (+34/−10), `M packages/rpc-guard/test/harness.ts` (+11/−0), `M packages/rpc-guard/test/repair-tail.test.ts` (+99/−10).

sha256 (octets bruts, `git show <rev>:<f> | sha256sum` ; arbre de travail du clone identique) :

| Fichier | `d141413` | `ae9e73c` | État |
|---|---|---|---|
| `src/ledger.ts` | `625c759f…` | `625c759f…` | inchangé (= sha du G2) |
| `src/repair.ts` | `e997c6fd…` | `e997c6fd…` | inchangé (= G2) |
| `src/lock.ts` | `6655a9c8…` | `6655a9c8…` | inchangé (= G2) |
| `src/cli.ts` | `dccbe95f…` | `dccbe95f…` | inchangé (= G2) |
| `bin/rpc-guard.mjs` | `aadd8983…` | `aadd8983…` | inchangé (= G2) |
| `src/index.ts`, `src/client.ts`, `test/no-fsync.ts`, `package.json`, `apps/sentinel/test/ukemi-guard-record.test.ts` | `d46514ba…`, `6553556c…`, `45a6597f…`, `72305973…`, `5c1d1b5e…` | idem | inchangés |
| `src/reconcile.ts` | `e42de49c…` | **`6e62cd6a67400197…`** | docstring seule (ci-dessous) |

- `reconcile.ts` : `git diff -U0` = 10 lignes changées (5 − / 5 +), **toutes** dans le bloc `/** … */` des lignes 43-47 ; contrôle indépendant : le texte des deux versions privé de ses commentaires (`/\/\*[\s\S]*?\*\//`, `^\s*\/\/.*$`) est **identique** (`node`, 113 lignes chacune) ; `n >= start` toujours ligne 53, appel `repairedInWindow` toujours ligne 74. **CONFORME** : aucun changement de comportement du code.
- `DELIVERED-pli2.sha256` : `sha256sum -c` dans le clone = **12/12 OK**.

## 2. Oracle 7 gates, R-25, A-6 (point 2)

Oracle `bash F:/tmp/g2-gfsync1-2/oracle.sh o1` (script sha `6568abb4…` ; chaque gate lancé `$U npm run <gate> > log 2>&1; echo "<gate> exit=$?"` — code capturé directement ; `$U` = `env -u` des 8 clés). En-tête A-12 (`oracle/o1-header.log`) : `HEAD=ae9e73c14ed0e435dab19500a152d6bccf4f9de2 MERGE_HEAD=none dirty_files=0 node=v24.15.0 platform=win32-x64 date_u=2026-09-23T05:53:37Z` ; fin 05:57:07Z, `dirty_files_after=0`.

| Gate | exit | Sortie mesurée |
|---|---|---|
| `gate:vocab` | 0 | « scanned 223 file(s), no forbidden claim » |
| `typecheck` | 0 | sans diagnostic |
| `test` | 0 | **tests 951 / pass 949 / fail 0 / skipped 2** ; `duration_ms` 156 237 (machine partagée) |
| `lint` | 0 | sans diagnostic |
| `lint:ratchet` | 0 | 69/69 |
| `lang:gate` | 0 | « 0 non-exempt French hit(s) » |
| `export:check` | 0 | « 0 forbidden path, 0 non-exempt French hit » |

- **951/949/0/2 = attendu.** Skips = les 2 pré-existants nommés (`o1-test.log:390` `sentinel_run_releases_chainstack_lock_on_sigterm`, win32 ; `:1338` `u4b_labels_replay_via_main_real_artifact`, artefacts e2 absents d'un clone).
- Tests du pli verts (lignes `o1-test.log`) : `:818` `durable_head_rename_retries_…` ; `:821` `durable_production_path_…` (5,0 s) ; `:876` `repair_tail_heals_…` ; `:878` `repair_tail_refuses_torn_…` ; `:882` `repair_tail_is_served_by_the_bin` (8,9 s) ; `:883` `reconcile_reads_the_repair_journal_per_window` ; `:884` **`repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` : 29 671 ms** (le pli mesurait 4,9-7,1 s ; ici sous la charge de la suite complète et d'une machine partagée ; `--test-timeout=120000` du script `test` de `package.json` ⇒ marge ×4,0 — observation O-2).
- sha256 (préfixes) des journaux : exits `b5965f60`, test `22ea9a7d`, header `7b1e2a60`.
- **R-25** (`r25.log`) : pathspec extrait VERBATIM de `ci.yml:65` par `sed -E "s/.*HEAD\" -- (.*)\) \|\| \{.*/\1/"` (15 éléments : `.` + 14 exclusions dont `':(exclude,glob)docs/**/*.md'`). Forme CI trois-points `66f75c2...ae9e73c` : **11 fichiers, 801 + 18 = 819** (< 1 150 STOP A-5 ; < 1 205 `VIBEGATES_PR_LIMIT`) ; deux-points identique ; part `d141413` : 677 + 18 = 695 (= G2/cp-2) ; pli 2 seul : 4 fichiers, 149 + 25 = 174 (RUNBOOK et rendu exclus par `docs/**/*.md`). **CONFORME à l'attendu 819.**
- **A-6** (`a6.log`) : `tr -d '\r' | sha256sum` des 9 gelés à `66f75c2`, `ae9e73c` et dans l'arbre : **9/9 SAME** (`2f9a31f6` `a5e66cd3` `5733daeb` `7bee76fc` `3376eb08` `9206df91` `0e232519` `3603265d` `cb020425` = table ADR-U4b `:199-206` et `:74`).

## 3. Mutants (point 3)

Protocole commun (A-11, A-12, A-7) : harnais copiés **chemins seuls** (diffs ci-dessous), `--test-reporter=tap`, CRLF normalisé, tué ⇔ rouge ET `not ok … - <tueur nommé>` ET restauration sha ; en-tête A-12 par exécution (HEAD, `dirty_files`, node, date, sha du harnais) ; clone `git status --porcelain` = 0 avant et après chaque harnais. Recompte A-13 des barres obliques inverses source/copie par `node` (le caractère est construit par `String.fromCharCode(92)`, jamais écrit dans la commande transportée) : G2 22/22 (doubles 1/1), pli 15/15, cp-2 37/37, `mv10-replay` 6/6. Piège A-13 **reproduit deux fois ici** et corrigé : (1) un `grep -o` dont le motif était DEUX barres obliques inverses est arrivé à bash avec UNE seule (« grep: Trailing backslash », compte 0 en silence) — recompte refait en `node` ; (2) le présent paragraphe, d'abord écrit par heredoc Bash, avait perdu ses barres doublées (texte devenu absurde) — réécrit par l'outil Edit, sans caractère doublé.

### 3.1 Harnais G2 (20 + X1) — `mutants/mutants-g2-replay.mjs`
Copie de `F:\tmp\g2-gfsync1\mutants-g2.mjs` (sha `72f969cd…` = harnais du run3 du G2) ; diff = 4 lignes (`WT` → `F:/tmp/g2-gfsync1-2/clone`, `GUARD`, `OSTMP`, chaîne `cmd=` de l'en-tête) ; copie sha `c0bdcfc5…` ; `--check` 21/21 FIND-OK. Journal `mutants-g2-run1.log` (sha `bdf2ce20…`, en-tête `tree_HEAD=ae9e73c14ed0… dirty_files=0 … date_u=2026-09-23T06:03:20.409Z`), pré-sha = sha livrés (`reconcile.ts` `6e62cd6a…`, `repair.ts` `e997c6fd…`, `ledger.ts` `625c759f…`, `lock.ts` `6655a9c8…`, `cli.ts` `dccbe95f…`, `u4-guard.mjs` `e3f5c70d…`) ; post-sha == pré pour les 6 fichiers ; exit 0.

| Mutant | Résultat | Tests rouges (TAP `not ok`) |
|---|---|---|
| **N1** `>=` → `>` | **TUÉ** | `reconcile_reads_the_repair_journal_per_window` ET `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` |
| **N2** drapeau seulement `per-method` | **TUÉ** | idem (les deux) |
| N3 ligne illisible ignorée | TUÉ | unitaire seul |
| **N17** record sans `lines_after` numérique ignoré | **TUÉ** | les deux |
| **N4** `sha_after.head` = head avant | **TUÉ** | `repair_tail_heals_a_head_one_behind_after_the_strip` |
| **N5** `torn_tail` accepte `}` final | **TUÉ** | `repair_tail_refuses_torn_or_clean_or_inner_nul_tails` |
| N6 réouverture de contrôle retirée | SURVIVANT | aucun — quasi-équivalent DÉCLARÉ (G2), inchangé |
| N7, N8, N9, N10, N12, N13, N14, N18, N19, N6+N16 | TUÉS | N9 et **N13** rougissent aussi le test par le bin (N13 = pid du verrou = `ppid` vivant ⇒ `writer_alive`) |
| N16 heal explicite retiré | SURVIVANT | aucun — ÉQUIVALENT DÉCLARÉ (G2), inchangé |
| **N11** retry EPERM seul | **TUÉ** | `durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff` |
| **N15** `--reason` optionnel | **TUÉ** | `repair_tail_is_served_by_the_bin` |
| **X1** alias + `Object.assign` dans `u4-guard.mjs` | **TUÉ** | `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` |

**Bilan G2 : 19/21 tués byIntended ; les 8 visés par la mission (N1, N2, N17, N4, N5, N11, N15, X1) sont TUÉS ; N6/N16 survivants équivalents déclarés.** CONFORME.

### 3.2 Mutants propres du pli (13) — `mutants/mutants-pli2-replay.mjs`
Copie de `F:\tmp\gfsync1-pli\mutants-pli2.mjs` (sha `dc567371…`, = sha cité par le rendu §5.4) ; diff = 4 lignes (`WT` : worktree `F:/Monark-wt-gfsync1` → clone, `GUARD`, `OSTMP`, chaîne `cmd=`) ; copie `23c89e8b…` ; `--check` 13/13. Journal `mutants-pli2-run1.log` (sha `245fd19c…`, en-tête `tree_HEAD=ae9e73c… dirty_files=0 … 06:06:32.275Z` — la chaîne « (the pli-2 change set) » est un texte figé du harnais d'origine) ; post == pré ; exit 0 ; « ALL MUTANTS KILLED BY THEIR NAMED TEST + RESTORED BYTE-EXACT ».
- `C9a′` (ligne `if (repairedInWindow(ledger)) …` supprimée = « `reconcile` ignore le journal »), `C9b′`, `N1′`, `N2′`, `N17′`, `N20` : **TUÉS par `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile`** (et aussi par l'unitaire).
- `N11b`, `N11c` : TUÉS par `durable_head_rename_retries_…` ; `N15b`, `N15c` : TUÉS par `repair_tail_is_served_by_the_bin` ; `X2`, `X3`, `X4` : TUÉS par `durable_production_path_…`.
**Bilan : 13/13.** CONFORME au rendu §5.4.

### 3.3 Harnais cp-2 (10) — `mutants/mutants-cp2-replay.mjs` + `mutants/mv10-replay.mjs`
Copie de `F:\tmp\cp2-gfsync1\mutants\mutants.mjs` (sha `daa3e087…`) ; diff = 2 lignes : `TEMP/TMP/TMPDIR` (`F:/tmp` → `F:/tmp/g2-gfsync1-2/os-tmp`) et **la référence de restauration `git checkout d141413 -- <f>` → `git checkout ae9e73c -- <f>`** (exigée par la mission : restaurer `reconcile.ts` à `d141413` écraserait la docstring ; pour les 4 autres fichiers mutés, les blobs `d141413` et `ae9e73c` sont identiques, point 1) ; copie `11d58c39…`. MV-10 : ABORT « hunk count=0 » **reproduit à l'identique** (piège A-13 du harnais cp-2 : le `"\n"` de son `find` est un vrai saut de ligne), puis rejoué par `mv10-replay.mjs` = copie du pilote du pli (`F:\tmp\gfsync1-pli\mv10-replay.mjs`) où seuls `OSTMP`, la chaîne `cmd=` et la même référence de restauration changent (diff 3 lignes), qui appelle `F:\tmp\cp2-gfsync1\mutants\mv10.mjs` INCHANGÉ (sha `94680cd2…`). Journaux `cp2-run1.stdout` (sha `3697946a…`, `tree=ae9e73c14ed0… 06:08:42.478Z`), `mv10-run1.log` (sha `28fad328…`, 06:09:10.622Z), TAP sous `mutants/cp2-out/` ; `git status --porcelain` du clone = 0 avant et après.

| # | Résultat | `not ok` |
|---|---|---|
| MV-1, MV-2 | TUÉS | `durable_production_path_…` |
| **MV-3** (`n >= start` → `n > start`, sha muté `72100882…` — ≠ `ee539af9…` du cp-2 parce que la docstring a changé ; même mutation) | **TUÉ** | `reconcile_reads_the_repair_journal_per_window` **ET** `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` |
| MV-4 … MV-9 | TUÉS (tueurs nommés du cp-2) | — |
| MV-10 (par `mv10.mjs`, `hunk count=1`, sha muté `79efb6c3…` = cp-2) | TUÉ | `durable_append_writes_the_line_then_the_head_in_order` (+ 2 tests de rename) ; `restored=true` |

**Bilan cp-2 : 10/10 tués byIntended (9 + MV-10 par le pilote) ; MV-3, l'ancien survivant fail-open, est TUÉ.** CONFORME (C-V-3).

### 3.4 Mutants NOUVEAUX du re-G2 (16) — `mutants/mutants-new.mjs`
Harnais écrit par l'outil Write (A-13 : 28 barres obliques inverses simples, 0 double, recompte `node`), même protocole que le harnais du pli, avec une PRÉDICTION par mutant ; sha `917a7387…` ; `--check` 16/16 FIND-OK. Journal `mutants-new-run1.log` (sha `e2da322e…`, en-tête `tree_HEAD=ae9e73c14ed0… dirty_files=0 … 2026-09-23T06:09:45.121Z`) ; post-sha == pré pour les 6 fichiers ; clone `git status --porcelain` = 0 après ; **16/16 conformes à la prédiction**. Contrôle de non-vacuité des survivants : `durable.test.ts` seul, non muté, en TAP (`mutants/durable-baseline.tap`) = 7 tests, 7 ok, 1,3 s — les exécutions survivantes (1,2-1,7 s, exit 0) ont bien exécuté les 7 tests.

**(A) Le tuyau `repair-tail → <op>.repair.jsonl → reconcile`** (tueur visé : `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile`) :

| Mutant | Mutation | Résultat | Tests rouges |
|---|---|---|---|
| P1 | producteur : record écrit dans `${op}.repairs.jsonl` (tuyau coupé côté producteur) | **TUÉ** | composition, heal, **test par le bin** — l'unitaire `reconcile_reads_the_repair_journal_per_window` reste VERT |
| P2 / P2b | producteur : `lines_after` = `entries.length ± 1` | **TUÉS** | idem ; unitaire VERT |
| P3 | producteur : `lines_after` en chaîne | **TUÉ** | idem ; unitaire VERT |
| P4 | consommateur : lit `${ledger.op}.repairs.jsonl` | **TUÉ** | unitaire + test par le bin |
| P5 | consommateur : ne lit que le 1ᵉʳ record (`.slice(0, 1)`) | **TUÉ** | unitaire + test par le bin (étape (2), 2ᵉ réparation du même cycle) |

Lecture : les mutants du PRODUCTEUR (P1-P3) laissent l'unitaire à journal fabriqué vert et rougissent le test par le bin — la preuve que ce test consomme l'artefact réellement produit par `repair-tail`.

**(B) Le scan par résolution d'imports** (tueur visé : `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch`) :

| Mutant | Forme injectée (+ affectation du seam) | Fichier | Prédit | Résultat |
|---|---|---|---|---|
| S1 | `import { DURABLE_FS as SEAM } from "../../packages/rpc-guard/src/ledger.ts"` (littéral de la mission ; se résout en `apps/packages/…`, chemin inexistant, attrapé par l'ancre `(?:^|\/)`) + `Object.assign` | `apps/harness/src/version.ts` | tué | **TUÉ** |
| S1b | même import au chemin exact `../../../packages/rpc-guard/src/ledger.ts` | `apps/harness/src/version.ts` | tué | **TUÉ** |
| S2 | `const require = createRequire(import.meta.url); require("../../packages/rpc-guard/src/ledger.ts")` | `scripts/census/u4-guard.mjs` | tué | **TUÉ** |
| S3 | `const req = mkReq(import.meta.url); req("../../packages/rpc-guard/src/ledger.ts")` (`createRequire` sous alias) | `u4-guard.mjs` | survit | **SURVIVANT** |
| S4 | `await import(import.meta.resolve("../../packages/rpc-guard/src/ledger.ts"))` | `u4-guard.mjs` | survit | **SURVIVANT** |
| S5 | `import { DURABLE_FS as SEAM } from "../../node_modules/@monark/rpc-guard/src/ledger.ts"` + `Object.assign` | `u4-guard.mjs` | survit | **SURVIVANT** |
| S6 | `import { DURABLE_FS as SEAM } from "../src/ledger.ts"; Object.assign(SEAM, { fsyncSync: () => {} })` | **`packages/rpc-guard/bin/rpc-guard.mjs`** (le bin servi) | survit | **SURVIVANT** |
| S7 | `await import(new URL("../../../packages/rpc-guard/src/ledger.ts", import.meta.url).href)` | `apps/site/lib/utils.ts` (hors racines) | survit | **SURVIVANT** |
| S8 | `await import("../../packages/rpc-guard/" + "src/ledger.ts")` (spécificateur calculé) | `u4-guard.mjs` | survit | SURVIVANT — résidu DÉCLARÉ |
| S9 | `await import(new  URL("../../packages/rpc-guard/src/ledger.ts", import.meta.url).href)` (deux espaces) | `u4-guard.mjs` | survit | **SURVIVANT** |

Classement des survivants : point 3.5 (effet à l'exécution mesuré).

### 3.5 Effet À L'EXÉCUTION des survivants du scan (`scratch/exp2.mjs`, bloc R*) et classement
Script `scratch/exp2.mjs` (Write, sha `b219ae18…`), journal `exp2.log` (sha `74577bda…`, en-tête `clone_HEAD=ae9e73c… dirty_files=0 … 2026-09-23T06:11:11.440Z` ; clone `dirty_files_after=0` ; dossier d'expérience supprimé). Méthode = celle de la partie (1) du test : processus NEUF (`--input-type=module -e`, base `[eval]` = racine du clone), compteur autour du `fsyncSync` de `node:fs` (`syncBuiltinESMExports`), la forme de contournement, PUIS `openGuardedClient` par le spécificateur de production et 2 appels : 5 = flush intact, 0 = flush éteint dans ce processus.

| Forme | Compte réel de `fsync` | Scan (mutant) |
|---|---|---|
| R0 sans contournement | **5** | — |
| R1b import relatif résolu `./packages/rpc-guard/src/ledger.ts` | **0** | S1b TUÉ |
| R3 `createRequire` sous alias | **0** | S3 SURVIVANT |
| R4 `import(import.meta.resolve(…))` | **0** | S4 SURVIVANT |
| R5 `./node_modules/@monark/rpc-guard/src/ledger.ts` (lien → `packages/rpc-guard`, même instance après `realpath`) | **0** | S5 SURVIVANT |
| R8 spécificateur calculé | **0** | S8 SURVIVANT (déclaré) |
| R6 bin : `unlock` servi, émulé depuis `packages/rpc-guard/bin` (`../src/ledger.ts` puis `../src/cli.ts`) — sans alias | **2** (1 ligne + 1 `head.tmp`) | — |
| R6 bin : même chose AVEC les deux lignes de S6 | **0** | S6 SURVIVANT |

Classement :
- **S3, S4, S5, S9** : spécificateurs LITTÉRAUX, non calculés, qui atteignent le seam par une forme hors de la grammaire du résolveur (`createRequire` sous alias, `import.meta.resolve`, un chemin par `node_modules/@monark/rpc-guard/` que la résolution lexicale ne normalise pas, `new` suivi de plusieurs espaces : la regex exige `\bnew URL` à une espace) ; tous **effectifs à l'exécution** (R3/R4/R5 = 0 ; S9 = même mécanisme que X2). Ils ne relèvent PAS du résidu déclaré (« un spécificateur CALCULÉ », commentaire du test `durable.test.ts:213` et texte ADR D-FS-6 proposé ; le rendu §11 ajoute « une ré-exportation par un module hors racines »). Aucun fichier des racines scannées n'utilise aujourd'hui `createRequire`, `import.meta.resolve` ni un chemin `node_modules/@monark` (`grep -rlE` sur les racines : 0 fichier) ⇒ les étendre au scan ne coûterait aucun faux positif.
- **S6 (le bin servi)** : le bin est « propre » (`own`) pour la règle d'import ; la seule règle d'affectation y est TEXTUELLE (`DURABLE_FS\.\w+\s*=[^=]`), que l'alias + `Object.assign` esquive — exactement le motif X1 du G2, déplacé dans le bin. La partie (1) ne charge PAS le bin (elle importe `index.ts` ; `index.ts` n'importe pas `bin/`). Effet mesuré R6 : les écritures servies (`unlock`, et par le même mécanisme `reconcile`, `repair-tail`) perdent leur flush (2 → 0) sans qu'aucun test ne rougisse. Ce n'est pas une régression (à `d141413` le bin n'était pas scanné du tout) mais un reste du remplacement accepté (D-P2-1) : son motif (le seam PROPRE de Bell) ne concerne que `apps/bell/src` ; le bin n'a aucune raison légitime de nommer `DURABLE_FS` ni d'importer `src/ledger.ts`.
- **S7** (hors racines, `apps/site/lib`) : effectif seulement dans le processus qui charge ce module (le site Next.js, qui n'écrit aucun ledger) ou par import transitif depuis une racine — c'est le résidu « module hors racines » du rendu §11, absent du texte ADR D-FS-6 proposé et du commentaire du test.
- **S8** : résidu DÉCLARÉ (spécificateur calculé) — n'est pas un trou.
- Conséquence sur le texte : « Un spécificateur calculé échappe au scan : la preuve reste le comportement ci-dessus (processus neuf, spécificateur de production) » (ADR proposé D-FS-6) et « part (1) is the proof on the production path » (`durable.test.ts:213`) sont **inexacts** pour tout ce qui n'est pas chargé par `index.ts` : les scripts de course et le bin ne sont couverts QUE par le scan. ⇒ correction C-G2b-1 (liste fermée).

## 4. CA-11 — la composition `repair-tail → <op>.repair.jsonl → reconcile` par le BIN depuis un artefact RÉEL (point 4)

Lecture du test `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` (`repair-tail.test.ts:265-324`) et de `realWriter` (`harness.ts:42-49`), puis mesures :
- **Par le bin servi** : `bin = fileURLToPath(new URL("../bin/rpc-guard.mjs", import.meta.url))` (`:269`) ; les TROIS sous-commandes passent par `spawnSync(process.execPath, [bin, "--ledger-dir", led, sub, …])` (`:276-278`) ; instantanés écrits sur disque et lus par le bin (`JSON.parse(readFileSync(p))`, `bin/rpc-guard.mjs:26`). Skip conditionnel sur le miroir public seulement (`:270`, pas de `bin/`), comme `repair_tail_is_served_by_the_bin` ; dans le dépôt il S'EXÉCUTE (`o1-test.log:884`, 29,7 s ; fusion `merge-B-2files.tap` ok 17).
- **Écrivain réel mort** : `realWriter(led, "w", 3)` (`:289`) = processus enfant `openGuardedClient` + 3 appels (fetch bouchonné dans l'enfant), sortie SANS `unlock`. Mesuré par moi avec la fonction MÊME du test (import de `harness.ts`, pas une copie) : **Q4a** — exit 0, 3 lignes, `lock.pid` = pid de l'enfant = 70420, `process.kill(pid, 0)` ⇒ ESRCH (mort) ; **Q4b** — `realWriter(…, 0)` (étape (2)) : verrou pris à la construction (`guarded.ts:43` `acquireLock` avant `openOperatorLedger` `:53`), AUCUNE ligne appendée (sha du `.jsonl` inchangé), pid mort ⇒ le commentaire « a new writer dies before its FIRST line reached the disk » est exact. Seule la queue NUL est simulée (`appendFileSync(jsonl, Buffer.alloc(4096))`, `:290`) — comme le test de composition du G1 et l'E1 du G2 (aucun banc de coupure).
- **Artefact consommé = celui du producteur** : à l'étape (1), aucun journal n'est écrit à la main ; le `NO-GO repaired_in_window` vient du record écrit par `repair-tail` ; l'étape (2) asserte `lastRecord().lines_after == start` sur le record réel (`:303`) ; la ligne manuelle de l'étape (3) est une variante déclarée, puis le journal réel est restauré octet pour octet (`writeFileSync(journalPath, kept)`, `:313`).
- **Mutants** : `C9a′` (= `C9a` du worker, même `find`/`replace` : la ligne `if (repairedInWindow(ledger)) …` supprimée, « `reconcile` ignore le journal ») **rougit CE test** (§3.2, byIntended) ; les mutants PRODUCTEUR P1 (record écrit sous un autre nom), P2/P2b, P3 le rougissent aussi **alors que l'unitaire à journal fabriqué reste vert** (§3.4) ; N13 (pid du verrou = `ppid`, vivant) le rougit (`writer_alive`) ⇒ le verrou d'un écrivain MORT est porteur dans ce test.
- Écart de forme (sans effet) : le test n'écrit pas `--floor 0` ; le bin prend 0 par défaut (`bin/rpc-guard.mjs:20`) ; la commande RUNBOOK (qui l'écrit) a été rejouée au mot près par le G2.

**Verdict point 4 : CONFORME** — la composition est exécutée par le bin depuis l'artefact réel d'un écrivain enfant mort, et C9a la rougit (C-V-2 fermé).

## 5. Fusion à blanc sur la pointe FETCHÉE de `lot/etude-suite` (point 5)

Clone jetable `F:/tmp/g2-gfsync1-2/merge-clone` (`git clone --no-hardlinks --no-checkout F:/Monark …`, exit 0 ; lecture seule de `F:\Monark`). **Pointe fetchée = `origin/lot/etude-suite` = `b8a724f584789ce9cc427c33e0b85a7c78c546d2`** (elle a avancé pendant la revue : `18d335b` au début de la session, `0ee3df8` à 06:0xZ, `b8a724f` au clonage). Contenu vérifié : BELL-SHORTPAGE-1 (`git merge-base --is-ancestor 2c276bb HEAD` : oui), le seam PROPRE de Bell (`apps/bell/src/rebase-crosscheck.ts` : 14 occurrences de `DURABLE_FS` sur 10 lignes, `export const DURABLE_FS: DurableFs` `:652`, le commentaire `:664` « rename is DURABLE_FS.renameSync = … »), U-4b-1b-4 (`da5d6e1`, `5219e3a`), STATS-1 3 segments (`28ffb5b`, `aeeed70`, `b9964ee`) ; `git merge-base HEAD ae9e73c` = `66f75c2`.
- NB d'indépendance : `b8a724f` = « re-cp-2 GARDE-FSYNC-1 pli 2 persisted », 1 fichier `docs/CHECKPOINT2-lot-garde-fsync-1-2.md` (`git show --stat`) ; **je ne l'ai PAS lu** ; j'en ai vu la ligne d'objet à 06:13:03Z (`date -u`), APRÈS mes mutants de scan (06:09:45Z) et mes sondes d'exécution (06:11:11Z) — mes constats du §3.4-3.5 ne lui doivent rien.

`git checkout -b g2m origin/lot/etude-suite` ; `git merge --no-commit --no-ff ae9e73c` ⇒ **exit 1, UN conflit : `docs/G1-lot-garde-fsync-1.md` (AA)** (`merge.log`) — le seul fichier que les deux côtés touchent depuis `66f75c2` (`comm -12` des `--name-only`). Résolu DANS LE CLONE par la version du lot (`git checkout --theirs` : sha `e2d61b98…`, 36 779 o, contre 9 907 o côté `lot/etude-suite`) ; aucun commit. Contrôles : `git diff --stat ae9e73c -- packages/rpc-guard apps/sentinel/test/ukemi-guard-record.test.ts docs/RUNBOOK-rpc-guard.md docs/PLI-lot-garde-fsync-1*.md docs/G1-lot-garde-fsync-1.md` = vide (fichiers du lot = `ae9e73c`) ; `git diff --stat HEAD` hors fichiers du lot = vide (le reste = la pointe). `npm ci --ignore-scripts` exit 0 ; `require.resolve('@monark/rpc-guard')` = le clone de fusion.

- **Les deux fichiers du lot sur l'arbre fusionné** (`merge-B-2files.tap`, en-tête A-12 `HEAD=b8a724f… MERGE_HEAD=ae9e73c…`) : **17/17 ok, exit 0** — dont `ok 7 - durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` (le scan passe malgré le seam propre de Bell) et `ok 17 - repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile`. **Le « 17/17 » du pli est CONFIRMÉ sur une pointe plus récente que la sienne (`7154d18`).**
- **Contrôle R-21 de l'affirmation I-P2-1** (même clone, `merge --abort` puis `merge --no-commit --no-ff d141413`, même résolution ; `merge-A-d141413-2files.tap`) : **15/16, exit 1** — `not ok 7 - durable_production_path_…`, hit unique `'apps/bell/src/rebase-crosscheck.ts: assigns the DURABLE_FS seam'` (`durable.test.ts:213`). Fusionner `d141413` sans le pli rendrait l'oracle ROUGE : constat du pli CONFIRMÉ ; `ae9e73c` le ferme.
- **Oracle 7 gates de l'arbre fusionné** (`oracle.sh m1 F:/tmp/g2-gfsync1-2/merge-clone` ; en-tête `HEAD=b8a724f… MERGE_HEAD=ae9e73c… dirty_files=15` (= les 15 entrées indexées de la fusion) `… 06:16:01Z`, fin 06:19:38Z, `dirty_files_after=15`) : **gate:vocab 0 (225 fichiers), typecheck 0, test 0, lint 0, lint:ratchet 0 (69/69), lang:gate 0, export:check 0** ; tests **1053 / pass 1051 / fail 0 / skipped 2** (les 2 skips nommés, `m1-test.log:439`, `:1635`) ; `duration_ms` 157 492. sha (préfixes) : exits `cb9dc94c`, test `9758ef97`, header `23b32aef`.
- **Cohérence du compte** : la pointe SEULE (`merge --abort`, `dirty=0`, `npm test` sous ceinture A-7, `tip-alone-test.log` sha `3b5132e1…`, 06:20:34Z) = **1035 / 1033 / 0 / 2**, exit 0 ⇒ la fusion ajoute exactement **18 tests** (17 du lot + 1 du pli 2), tous verts. État laissé : le clone de fusion est remis en `merge --no-commit` de `ae9e73c` (conflit docs résolu par la version du lot, 15 entrées indexées, AUCUN commit) pour re-vérification.
- **Verdict point 5 : CONFORME** — conflit unique attendu (G1 AA, garder la version du lot) ; oracle de l'arbre fusionné vert ; le scan passe sur l'arbre fusionné (17/17) et le constat I-P2-1 du pli (rouge sans le pli) est reproduit sur la pointe courante.

## 6. C-G2-3 — les textes (RUNBOOK §3/§4/§5, docstring `reconcile.ts:43-47`) contre les mesures (point 6)

**Rejeu à `ae9e73c`** des calques exécutables du G2, chemins seuls (`sed 's#F:/tmp/g2-gfsync1/#F:/tmp/g2-gfsync1-2/#g'` ; diffs : `CLONE`, `OSTMP`, `ROOT`/`DIR`, chaîne `cmd=` d'en-tête et un commentaire ; recompte des barres obliques inverses `node` 6/6 et 1/1) :
- `scratch/exp-replay.mjs` → `exp-replay.log` (sha `d94ac85f…`, en-tête `clone_HEAD=ae9e73c… dirty_files=0 … 06:11:01.804Z`, sha de code = sha livrés) : **21/21 OK**, dont **E7** (réparation interrompue : tronqué + `.bak`, AUCUN record ⇒ relance `REFUSED no_nul_tail`, `reconcile` ⇒ `GO`) et **E8** (record sans `lines_after` numérique ⇒ 3 × `NO-GO repaired_in_window`).
- `scratch/e11-replay.mjs` → `e11-replay.log` (sha `bc816eba…`, 06:11:10.173Z) : **E11 identique** — `REPAIRED nul_bytes_removed=256` → `unlock` 0 → `NO-GO repaired_in_window` → mêmes instantanés `NO-GO hard:getTransaction` ; chaîne `attempted ×3, unlocked, reconciled(repaired_in_window), reconciled(hard:getTransaction)`.

**Mesures nouvelles** (`scratch/exp2.mjs`, `exp2.log`, 14/14 conformes à la prédiction ; écrivains = `realWriter` du test ; sous-commandes par le bin avec `--floor 0`) :
- **E12** (jumeau agrégé d'E11) : `NO-GO repaired_in_window` → mêmes instantanés `NO-GO hard:total` → chaînés `GO`.
- **E13** (rollover) : réparation → `unlock` → premier `reconcile` avec `before.cycle ≠ --cycle` ⇒ **`NO-GO rollover`** (contrôle `reconcile.ts:73`, AVANT le drapeau `:74`) ; la ligne `reconciled(rollover)` ferme la fenêtre réparée ; le `reconcile` suivant (chaîné) ⇒ `GO` ; **`repaired_in_window` n'est JAMAIS émis** (chaîne `… unlocked, reconciled(rollover), reconciled`).
- **E14** (§4 manuel) : head EN AVANCE ⇒ l'outil `REFUSED tail_truncation` ; troncature + head à la main + record minimal de §4 étape 5 (`{"iso","cycle","op","reason","lines_after":2}`) + `unlock` ⇒ `NO-GO repaired_in_window` une fois, puis `GO`.
- **E15** (§3 « Interrupted repair ») : état E7 ⇒ sha(`.jsonl`) ≠ sha(`.bak`), aucun record ; `lines_after` = lignes complètes du `.bak` avant sa queue NUL = 3 ; record reconstitué ⇒ `NO-GO repaired_in_window` une fois, puis `GO`.

Confrontation phrase par phrase :

| Texte (`ae9e73c`) | Mesure | Verdict |
|---|---|---|
| §3.6 « the next `reconcile` … answers `NO-GO repaired_in_window` … before any numeric bound, in every mode » | E1/E5a, E6, E11, E12 ; code `:74` avant la branche de mode `:77` | exact, **sauf rollover** (E13 : la réponse est `NO-GO rollover`) |
| §3.6 « That NO-GO is emitted ONCE … closes the repaired window at once, whatever the orchestrator does next » | E11, E12 (chaînes) | exact (même réserve E13 : zéro émission) |
| §3.6 « The tool therefore NEVER computes the numeric bound … hand computation … `Sigma credits_derived` of the `attempted` lines between the previous `reconciled` line and the `reconciled` line of reason `repaired_in_window` » | code `ledgerRunSinceLastReconciled` `:57-65` ; E11 | exact ; E13 : dans le cas rollover, cette ligne n'existe pas (la fenêtre finit au `reconciled(rollover)`) |
| §3.6 « re-run with the SAME snapshots … `NO-GO hard:<method>` (`hard:total` in aggregate mode) … (measured: G2 E11; pinned by the test …) » | E11 (per-method) ; le test l'épingle `:294` ; **agrégé : mesuré ici seulement (E12)** | exact ; citation incomplète pour `hard:total` (O-3) |
| §3 « Interrupted repair » : identification (`.bak` sans record dont `bak_sha256.jsonl` = sha du `.bak`) ; « Equal: nothing was truncated » (`.bak` écrits AVANT la troncature, `repair.ts:60-63`) ; « Different … `reconcile` does NOT see this repair (it would answer GO: measured, G2 E7) » ; reconstitution | E7 rejoué (GO) ; E15 (reconstitution ⇒ NO-GO une fois) | exact ; « would answer GO » vaut pour les instantanés d'E7 (Δ = ledger_run) — strictement « ne signale pas la fenêtre » (O-3) |
| §4 étape 5 : record minimal, `lines_after` NOMBRE ; « `reconcile` reads `lines_after` only » ; « WITHOUT this record, `reconcile` does NOT see a manual repair » ; pas de `head_action` (ruling I-P2-3) | E14 ; code `:53` ; unitaire `{"lines_after":2}` | exact (réserve E13) |
| §5 « `reconcile` sees a repair ONLY through the repair journal » | code `:48-55` (seule entrée) | exact |
| §5 « The first reconcile whose window contains a recorded repair answers `NO-GO repaired_in_window` exactly ONCE » | E5a/E5c, E11, E14, E15 ; **E13** | **inexact dans un cas** : si ce premier `reconcile` est un rollover, la réponse est `NO-GO rollover` et `repaired_in_window` est émis ZÉRO fois |
| §5 « unreadable … or no NUMERIC `lines_after` … flags EVERY window — fail-closed, it never rolls (measured: G2 E8) — until it is lifted: copy … then rewrite … or remove … » | E8 rejoué (3 × NO-GO) ; levée épinglée par le test (`:310-314` ⇒ `GO`) | exact |
| docstring `:43-47` : consommateur ; réparation MANUELLE vue seulement si son record est appendé ; `>=` ⇒ NO-GO avant toute borne ; « a NUMERIC lines_after flags ONE window (never bounded by this tool) » ; non numérique/illisible ⇒ EVERY window jusqu'à levée | code ; E8, E11, E14 ; **E13** | exact, sauf « ONE window » (zéro dans le cas rollover) |

**Verdict point 6 : les textes disent exactement ce qu'E7, E8 et E11 ont mesuré** (rejoués identiques à `ae9e73c`) ; les exigences C-G2-3(a)-(d) sont remplies pour le RUNBOOK et la docstring (le volet ADR est l'insertion orchestrateur, I-P2-2). **Un écart nouveau, hors E7/E8/E11** : la préséance du contrôle `rollover` (E13) contredit « exactly ONCE » / « ONE window » / « the next reconcile answers `NO-GO repaired_in_window` » dans ce seul cas — fail-closed (NO-GO quand même), mais le calcul à la main de §3.6 perd son repère ⇒ correction éditoriale non bloquante C-G2b-2.

## 7. Sécurité (A-7) et forme du diff du pli

- `git diff d141413 ae9e73c` : 0 ligne ajoutée portant une URL (`grep -E '^\+.*https?://'` vide) ; 0 `api-key=`/`token=`/`bearer` ; seul hex ≥ 40 ajouté = le sha de commit `d1414138…` cité par le rendu ; 0 `process.env` ajouté sous `packages/rpc-guard/{src,bin}` ; 0 `TODO/FIXME/XXX` ajouté. Processus enfants des tests : `childEnv()` (retrait par motif `/_API_KEY$|^CHAINSTACK_\w+_URL$/`), inchangé.
- Tests : aucune assertion retirée (lignes `-` des tests = 2 imports élargis, le bloc du scan remplacé (D-P2-1 acceptée), le bloc enfant de 6 lignes déplacé dans `realWriter` — code enfant généré identique pour `("cut", 3)` : `JSON.stringify("cut")` et `String(3)` rendent le même texte, `new URL("../src/index.ts", import.meta.url)` depuis `test/harness.ts` = même cible —, et la signature du helper `rec`) ; appels `assert.*` : `durable.test.ts` 42 → 46, `repair-tail.test.ts` 43 → 70. Les racines du nouveau scan (`scripts` + `{apps,packages}/*/{src,scripts,bin}`) sont un sur-ensemble des 5 anciennes ; la règle `process.env` passe de `src` à `src`+`bin`.

## 8. Revue 3 étapes (AgileCoder) et checklist G2, appliquées au diff du pli

- **Exigences ↔ code** : C-G2-1 = C-V-2 (point 4 : conforme), variante (i) = C-V-3 (MV-3/N1 tués par l'unitaire ET le test par le bin), (ii) (N2), (iii) (N17) ; C-G2-2(a) N4, (b) N5, (c) N11/N11b/N11c, (d) N15/N15b/N15c — tous tués (§3) ; C-G2-3(a)-(d) RUNBOOK + docstring (point 6 : conformes, écart nouveau E13) ; C-G2-4 : X1 tué, mais résidu du scan inexact (§3.5) ; rulings orchestrateur appliqués : D-P2-1 (résolution d'imports), I-P2-3 (record manuel sans `head_action`, RUNBOOK §4 étape 5), I-P2-2 (ADR = copie pli-2, hors dépôt : non inséré à `ae9e73c`, `git grep -c "D-FS-" ae9e73c -- docs/adr/` à faire au G7 — acte orchestrateur, cp-2 C-V-1).
- **Défauts** : aucun défaut de CODE (le code servi est byte-identique à `d141413`, seule la docstring change) ; deux écarts de TEXTE/TEST (C-G2b-1, C-G2b-2 ci-dessous).
- **Tests** : négatifs imposés par mutants (§3) ; le test par le bin consomme l'artefact du producteur (P1-P3 : unitaire vert, test par le bin rouge) ; aucune assertion retirée (§7).
- Checklist (template G2) : compréhension ✔ ; validation d'entrée (`--cycle/--op/--reason` requis, épinglés un à un) ✔ ; logique booléenne (`>=`, `typeof … !== "number"`) couverte ✔ ; dépendances : aucune nouvelle ✔ ; R-25 819 ✔ ; provenance (rendu committé = intégral, sha égal) ✔ ; TODO nus 0 ✔ ; MAST : « vérification incomplète » — instance résiduelle mesurée = le scan (S3-S6, S9) ; « hypothèse d'environnement » — la charge étire le test par le bin à 29,7 s (O-2).

## 9. Corrections — liste FERMÉE

- **C-G2b-1 — Scan structurel (2) : résidu déclaré inexact, bin servi non couvert.** Constat (§3.4-3.5) : S3 (`createRequire` sous alias), S4 (`import.meta.resolve`), S5 (chemin `node_modules/@monark/rpc-guard/…`), S9 (`new` + deux espaces + `URL`) — spécificateurs LITTÉRAUX, non calculés — et S6 (alias du seam + `Object.assign` DANS le bin servi) survivent au scan et éteignent réellement le flush (R3/R4/R5 : 5 → 0 ; R6 bin : 2 → 0) ; la partie (1) ne charge ni les scripts de course ni le bin ; S7 (module hors racines) n'est déclaré que dans le rendu §11, pas dans le texte ADR proposé ni dans le commentaire du test. Deux formes admissibles (choix orchestrateur, comme pour C-G2-4) :
  - **(A) durcir, test seulement** (`durable_production_path_…` partie (2)) : (i) sous `packages/rpc-guard/bin/`, toute mention du jeton `DURABLE_FS` ou toute cible résolue `packages/rpc-guard/src/ledger.ts` = hit (le motif de D-P2-1 — le seam propre de Bell — ne concerne pas le bin ; le bin actuel ne nomme ni l'un ni l'autre) ⇒ S6 rouge ; (ii) normaliser une cible `(^|/)node_modules/@monark/rpc-guard/` en `packages/rpc-guard/` ⇒ S5 rouge ; (iii) ajouter `import.meta.resolve` et `new\s+URL` à la grammaire des spécificateurs ⇒ S4, S9 rouges ; (iv) `createRequire` dans une source scannée = hit (0 fichier aujourd'hui, mesuré) ⇒ S3 rouge ; preuve : rejouer `mutants-new.mjs` (S3-S6, S9 ROUGES ; S1/S1b/S2 toujours rouges), X1-X4, MV-1/MV-2, puis `durable.test.ts` sur l'arbre fusionné (vert).
  - **(B) déclarer exactement** (ADR D-FS-6 de la copie pli-2 à l'insertion, ET commentaire `durable.test.ts:207-213`) : le scan ne voit pas (1) un spécificateur littéral atteint par `createRequire` sous alias, `import.meta.resolve`, un chemin par `node_modules/@monark/rpc-guard/`, ou `new` suivi de plusieurs blancs puis `URL` ; (2) un alias du seam dans `packages/rpc-guard/{src,bin}` (la règle d'affectation y est textuelle) ; (3) un module hors racines, directement ou par import transitif ; (4) un spécificateur calculé ; et restreindre « la preuve reste le comportement ci-dessus » / « part (1) is the proof on the production path » au graphe de modules chargé par `index.ts` — les scripts de course et le bin ne sont couverts QUE par le scan.
  - Recommandation (avis, non verdict) : (A)(i) au minimum — le bin est le chemin servi de CA-11 et la règle ne coûte aucun faux positif : le bin actuel ne nomme ni le seam ni `ledger.ts` (`grep -c DURABLE_FS packages/rpc-guard/bin/rpc-guard.mjs` = 0 ; `grep -c 'ledger.ts' …` = 0, mesuré à `ae9e73c`) — puis (B) pour ce que (A) ne ferme pas (S7, S8).
  - Coût de chaque forme : (B) se ferme entièrement par le texte ADR à l'insertion (acte orchestrateur déjà dû, cp-2 C-V-1) et par un commentaire de `durable.test.ts` (pli test-only) ; (A) ne touche que `durable.test.ts`. **Aucune des deux ne touche `ledger.ts`/`lock.ts`/`reconcile.ts`/`cli.ts` ni le bin** (la fermeture d'exécution du recorder Ukemi, cp-2 C-V-4) ; et un pli sur `lot/garde-fsync-1` AVANT le G7 n'ajoute aucun événement de gel : l'événement est la fusion elle-même, déjà encadrée par C-V-4. « Bloquant » ne veut donc pas dire « rouvrir le gel ».
  - **Porteur** : worker (pli test-only : (A) et/ou le commentaire de (B)) ; orchestrateur (texte ADR à l'insertion, I-P2-2). **Déclencheur** : avant le G7 de GARDE-FSYNC-1. **Bloquant** : oui dans sa forme minimale (B) — un résidu déclaré inexact n'est pas « zéro dette » ; (A) au choix de l'orchestrateur. `error_origin` proposé : worker pli 2 (portée de la règle `own` plus large que le motif de D-P2-1 ; résidu écrit « spécificateur calculé » sans avoir essayé les autres formes ; « part (1) is the proof » étendu à ce qu'elle ne charge pas).
- **C-G2b-2 — Préséance `rollover` absente des nouveaux textes (E13).** RUNBOOK §3 étape 6 et §5, docstring `reconcile.ts:43-47`, ADR D-FS-5 (copie pli-2) : ajouter « sauf si ce `reconcile` est un rollover (contrôlé d'abord, `reconcile.ts:73`) : il répond alors `NO-GO rollover`, sa ligne `reconciled` ferme la fenêtre réparée et `repaired_in_window` n'est jamais écrit — le calcul à la main de §3 étape 6 s'arrête alors à cette ligne `reconciled(rollover)` ». Profiter du même passage pour les deux précisions O-3. **Porteur** : orchestrateur (ADR D-FS-5 à l'insertion) ; worker (RUNBOOK, dans le pli de C-G2b-1, qui a lieu dans ses deux formes puisque (B) comprend aussi un commentaire de test). **La docstring** est dans `reconcile.ts`, fichier de la fermeture d'exécution du recorder Ukemi (cp-2 C-V-4) : la corriger dans ce même pli AVANT le G7 n'ajoute pas d'événement de gel (l'événement est la fusion) mais change encore le sha attendu de `reconcile.ts` (`6e62cd6a…` → nouveau) que le G7/SIDECAR re-mesure ; au choix de l'orchestrateur : dans ce pli, ou en item formé au **déclencheur** « le prochain pli qui touche `reconcile.ts` OU le premier `reconcile` servi après une réparation dans une course réelle, le premier des deux ». **Bloquant** : non (fail-closed : la réponse reste NO-GO). Alternative nommée, NON tranchée (choix de conception, pas un oubli) : inverser `reconcile.ts:73`/`:74` (drapeau de réparation AVANT le rollover) rendrait « exactly ONCE » vrai sans exception, mais change le CODE de `reconcile.ts` (comportement servi, nouvelle revue) et le motif affiché d'un rollover réparé ⇒ si l'orchestrateur la préfère, elle devient un item formé au même déclencheur ; la recommandation reste le texte seul. `error_origin` proposé : worker pli 2 (« exactly ONCE » / « ONE window » écrits sans le cas du contrôle qui précède).

Aucune autre correction : points 1, 2, 4, 5 CONFORMES ; point 3 CONFORME pour les harnais G2/cp-2/pli (tous les mutants visés tués, N6/N16 équivalents déclarés) — ses survivants nouveaux sont C-G2b-1 ; point 6 CONFORME pour E7/E8/E11 — l'écart nouveau est C-G2b-2.

## 10. Observations (aucune correction exigée ; aucune dette nue)

- **O-1** Rulings consommés tels quels (D-P2-1, I-P2-3, I-P2-2) ; l'insertion de l'ADR (cp-2 C-V-1) reste l'acte orchestrateur du G7 : `ae9e73c` n'a aucun `D-FS-` sous `docs/adr/` (`git grep`, 0 fichier) ; la copie `F:\tmp\gfsync1-pli\ADR-amendement-pli2.md` (sha `c9911d4c…`, 33 281 o) a 0 renvoi `F:\tmp` / `F:/tmp` (compté en `node`) et 7 occurrences de `D-FS-`.
- **O-2** Durée du test par le bin : 29,7 s dans la suite complète sous charge (`o1-test.log:884`), 9,3 s dans l'oracle de fusion, 4,9-7,1 s au pli ; `--test-timeout=120000` ⇒ marge ×4,0 au pire mesuré. Pas d'item (la borne (d) relative du pli n'a pas été re-mesurée ici).
- **O-3** Deux précisions de citation, textes exacts : §3.6 « (measured: G2 E11 …) » couvre `hard:<method>` ; `hard:total` est mesuré ici (E12) ; §3 « it would answer GO (… E7) » vaut pour les instantanés d'E7 (Δ = ledger_run) — la formulation stricte est « ne signale pas la fenêtre ». À replier dans le passage de C-G2b-2.
- **O-4** Le test par le bin n'écrit pas `--floor 0` (défaut 0 du bin, `bin/rpc-guard.mjs:20`) ; la commande du RUNBOOK l'écrit et a été rejouée au mot près par le G2.
- **O-5** Indépendance et convergence : un re-cp-2 du pli 2 a été persisté sur `lot/etude-suite` (`b8a724f`) pendant cette revue ; NON lu (ligne d'objet seule vue à 06:13:03Z, après mes mutants de scan et mes sondes d'exécution). Cette ligne d'objet nomme « C-V2-2 re-export residue of the import-resolution scan » : le siège d'acceptation semble avoir touché, indépendamment, le résidu du même scan ; à réconcilier par l'orchestrateur avec C-G2b-1 (qui ajoute, mesurés, les formes littérales S3-S5/S9 et le bin S6).

## 11. Verdict

**PASS-AVEC-CORRECTIONS — liste fermée C-G2b-1 (bloquante dans sa forme minimale (B) : texte exact du résidu ; (A) au choix de l'orchestrateur) et C-G2b-2 (non bloquante, éditoriale).**

Motifs :
- Point 1 CONFORME : 6 fichiers ; code servi byte-identique à `d141413` (`ledger.ts` `625c759f`, `repair.ts` `e997c6fd`, `lock.ts` `6655a9c8`, `cli.ts` `dccbe95f`, bin `aadd8983`) ; `reconcile.ts` `6e62cd6a…` = docstring seule (texte sans commentaires identique) ; DELIVERED 12/12.
- Point 2 CONFORME : oracle 7 × exit 0, **951/949/0/2** ; R-25 cumulé **819** (pathspec `ci.yml:65` verbatim) ; A-6 **9/9**.
- Point 3 : G2 **19/21** (N1, N2, N17, N4, N5, N11, N15, X1 TUÉS ; N6/N16 équivalents déclarés) ; cp-2 **10/10** (MV-3 TUÉ, restauration à `ae9e73c`) ; pli **13/13** ; nouveaux **16/16 conformes à la prédiction** — 9 tués (P1-P5 : le tuyau ; S1, S1b, S2 : le scan) et 7 survivants de scan (S3-S9), dont 5 non déclarés et effectifs à l'exécution ⇒ C-G2b-1.
- Point 4 CONFORME (CA-11) : composition exécutée par le bin depuis l'artefact d'un écrivain enfant mort (Q4a/Q4b) ; C9a′ rougit CE test ; P1-P3 le rougissent quand l'unitaire reste vert.
- Point 5 CONFORME : pointe fetchée `b8a724f` ; conflit unique `docs/G1-lot-garde-fsync-1.md` (AA, version du lot gardée) ; arbre fusionné 7 × exit 0, **1053/1051/0/2** (= 1035 de la pointe + 18) ; scan vert sur l'arbre fusionné (**17/17**) ; `d141413` seul ⇒ 15/16 rouge (I-P2-1 reproduit).
- Point 6 : textes exacts pour E7/E8/E11 (rejoués identiques) et pour mes E12/E14/E15 ; écart nouveau E13 (rollover) ⇒ C-G2b-2.
- Pas FAIL : aucun défaut de code, aucune régression (le bin n'était pas scanné du tout à `d141413` ; le scan livré est strictement plus fort que l'ancien sur les formes qu'il vise) ; pas PASS : un résidu déclaré inexact (zéro dette) et une phrase « exactly ONCE » contredite par une exécution.

`error_origin` proposés (assignés au G7) : C-G2b-1 → worker pli 2 ; C-G2b-2 → worker pli 2.

## Demande de consultation formée
Aucune : pas de blocage ; l'outil advisor intégré a été consulté après l'orientation (journal) et avant clôture.

## Journal d'avancement (UTC, `date -u` et en-têtes des journaux)
- 05:47:39 début ; `F:\tmp\g2-gfsync1-2` créé ; clone isolé @ `ae9e73c`, `npm ci` exit 0 ; lecture intégrale des entrées (G2, cp-2, rendu pli 2, harnais, calques E1-E11).
- 05:53:37-05:57:07 oracle o1 : 7 × 0, 951/949/0/2 ; point 1 (sha, docstring seule) ; R-25 819 (06:02:30), A-6 9/9 (06:02:40).
- ~05:5x **advisor intégré consulté après l'orientation (conseil, non verdict)** : pièges de harnais (WT des harnais G2/pli pointant l'ancien clone ou le worktree ; restauration cp-2 à `d141413`), mutants discriminants « composition réelle vs journal fabriqué », contrôles Q4a/Q4b, contrôle `d141413` seul à la fusion — tous appliqués.
- 06:03:20 harnais G2 19/21 ; 06:06:32 harnais pli 13/13 ; 06:08:42-06:09:10 harnais cp-2 9/10 + MV-10 par le pilote = 10/10 ; 06:09:45 nouveaux 16/16 conformes à la prédiction ; clone propre après chaque harnais.
- 06:11:01 rejeu E1-E10 21/21 ; 06:11:10 rejeu E11 identique ; 06:11:11 exp2 14/14 (Q4a/Q4b, E12-E15, R0-R8, R6).
- 06:13:03 clone de fusion @ `b8a724f` (re-cp-2 persisté pendant la revue : non lu) ; fusion `ae9e73c` : conflit G1 AA seul ; 17/17 ; 06:16:01-06:19:38 oracle m1 7 × 0, 1053/1051/0/2 ; contrôle `d141413` seul 15/16 rouge ; 06:20:34 pointe seule 1035/1033/0/2 ; fusion `ae9e73c` remise en place (sans commit).
- Piège A-13 rencontré deux fois (compte `grep` ; paragraphe du rendu) : corrigés (recompte `node`, outil Edit).
- ~06:2x **advisor intégré consulté avant clôture (conseil, non verdict)** : verdict et liste fermée maintenus ; demandés et faits : contrôles de clôture ci-dessous ; coût de la forme (B) de C-G2b-1 écrit (ne rouvre pas le gel Ukemi) ; alternative « inversion `:73`/`:74` » nommée dans C-G2b-2 comme choix non tranché ; convergence avec la ligne d'objet du re-cp-2 notée en O-5 ; précondition de S6 rendue reproductible (`grep -c` = 0).
- 06:27:55 **clôture** : gardes de mutants `guard-g2`, `guard-pli2`, `guard-new` vides (0 entrée) ; clone HEAD `ae9e73c`, `git status --porcelain` = 0 ; clone de fusion HEAD `b8a724f` + `MERGE_HEAD` `ae9e73c`, 15 entrées indexées, 0 non fusionnée, 0 commit ; dossiers d'expérience `exp/`, `exp2/` vides ; `node_modules` laissés dans les deux clones (220 entrées chacun) pour re-vérification (retrait par `rm-nm.ps1` si voulu, jamais `Remove-Item -Recurse`). `F:\Monark` : AUCUNE écriture de ma part — commandes : `git log/show/diff/rev-parse/branch/ls-tree/merge-base/status`, `git clone` (lecture), `cat`/`grep` de `docs/` ; `git status` (une fois à la clôture, + celui du harnais en début de session) peut rafraîchir le cache stat de l'index sans changer aucun contenu suivi (déclaré) ; son HEAD a avancé pendant la revue (`18d335b` → `b89ad29`, commits d'autres agents) et deux fichiers non suivis `docs/sec-4927/LETTRE-4-927-v3.md`, `RENDU-v3.md` y sont apparus (autres agents). Worktree `F:\Monark-wt-gfsync1` : lu à la clôture seulement (`rev-parse` = `ae9e73c`, `status` = 0), rien d'autre. Aucun commit, aucun workflow (R-20).
