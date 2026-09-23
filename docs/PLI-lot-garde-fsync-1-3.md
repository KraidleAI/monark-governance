Modèle résolu : claude-opus-5-5[1m]

# RENDU PLI-3 (test-only + RUNBOOK) — GARDE-FSYNC-1 — C-G2b-1 (A)+(B), C-G2b-2 + O-3, réconciliation C-V2-2

> Écrit AU FIL DE L'EAU. Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1, décision 133), effort max,
> contexte frais. Worktree `F:\Monark-wt-gfsync1`, branche `lot/garde-fsync-1` @ `ae9e73c` ; AUCUN commit, nulle part
> (R-20) ; aucune écriture dans `F:\Monark` (lectures `git` seulement, `--no-optional-locks` dans le worktree) ;
> TEMP/TMP/TMPDIR = `F:\tmp\gfsync1-pli3\os-tmp` ; ceinture A-7 (`env -u` des 8 clés) sur tout oracle, test, mutant et
> sonde ; fichiers écrits par Write/Edit (A-13), jamais par heredoc. État : CLOS (voir « Journal d'avancement »).

## Résumé (données brutes pour l'orchestrateur ; preuves aux sections citées)
- Livré, non committé : `packages/rpc-guard/test/durable.test.ts` (+25/−10, sha `dcdb1964…`) et
  `docs/RUNBOOK-rpc-guard.md` (+19/−12, sha `32a66f72…`). Rien d'autre (`src/`, `bin/`, `reconcile.ts` : 0 octet, §6).
- **C-G2b-1 (A) complète** : (i) bin (jeton `DURABLE_FS` ou cible `src/ledger.ts` = hit), (ii) `node_modules/@monark/
  rpc-guard/` normalisé, (iii) `import.meta.resolve` et `new\s+URL` dans la grammaire, (iv) `createRequire` = hit ; chaque
  règle tire SEULE sur sa forme (attribution lue dans le TAP, §4.3). re-G2 **S3, S4, S5, S6, S9 : TUÉS** ; S1/S1b/S2,
  P1-P5, X1-X4, MV-1/MV-2, MV-13/MV-15 : toujours TUÉS ; S7/S8 : survivants DÉCLARÉS.
- **C-G2b-1 (B)** : le commentaire du test déclare le résidu EXACT, par classes (a)-(e), chacune prouvée par un mutant
  survivant ET par un effet d'exécution mesuré (flush réel éteint). **Écart signalé (D-P3-2)** : la mesure donne PLUS que
  les deux classes attendues par le ruling ((3) S7, (4) S8) — s'y ajoutent (b) élargi (alias de `import.meta.resolve` /
  de `URL`, `URL.parse`, `path.join`), (c) ré-export par `src/` (dont MV-14), (d) écriture de la couture dans `src/` hors
  du chemin exécuté par la partie (1), (e) patch de `node:fs` lui-même. « Part (1) is the proof » restreint au graphe
  chargé par `index.ts`.
- **C-V2-2 réconcilié (§5)** : ré-export depuis un fichier scanné = COUVERT (RX1, RX2 tués) ; par `index.ts` (MV-14 = RX3,
  RX4 `export *`) = non vu par le scan, **mais ROUGE dans `exports.test.ts` `public_export_set_is_closed`** (mesuré) ;
  par un autre module de `src/` vers le bin (RX5) = **vu par AUCUN test de la suite** (suite complète verte sous la
  mutation, flush du bin servi éteint : `0:0` contre `0:2`). Idem D3 (module de `src/` chargé par le seul bin).
- **C-G2b-2 + O-3** : RUNBOOK §3 étape 6 et §5 (préséance `rollover`, `reconcile.ts:73` avant `:74`), « measured »
  précisé (E11 `hard:<method>`, E12 `hard:total`), §3 « Interrupted repair » : « does not flag the window ».
- Oracle worktree **7 × exit 0, 951 / 949 / 0 / 2** (aucun test ajouté) ; R-25 : forme CI `66f75c2...HEAD` = **819**
  (committé) ; arbre de travail vs base = **834** (= ce que la CI calculera au commit du pli ; 819 + 15) ; pli seul 35 ;
  A-6 **9/9** ; `DELIVERED-pli3.sha256` 2/2.
- **Fait nouveau G7 (I-P3-1)** : la pointe de `lot/etude-suite` (`0383e5b`) ajoute un 2ᵉ conflit de fusion,
  `apps/sentinel/test/ukemi-guard-record.test.ts` (UU, `dd44604` UKEMI-RETRY-2/3) ; résolution CANDIDATE mesurée dans un
  clone jetable (les deux blocs, celui du lot en dernier) : arbre fusionné 7 × exit 0, **1060 / 1058 / 0 / 2** = pointe
  seule 1042 + 18.
- Options de fermeture du résidu mesurées à **0 faux positif** (worktree ET arbre fusionné), NON appliquées (ruling 1),
  formées avec déclencheur (§8) ; delta ADR D-FS-5/D-FS-6 prêt et vérifié mécaniquement 7/7
  (`F:\tmp\gfsync1-pli3\ADR-D-FS-5-6-delta.md`).

## 0. Entrées lues (intégralement)
- re-G2 `F:\tmp\g2-gfsync1-2\G2-2.md` (§3.4, §3.5, §9 C-G2b-1/C-G2b-2, §10 O-3) ; harnais `mutants\mutants-new.mjs`
  (S1..S9, P1..P5, sha `917a7387…`) + journal `mutants-new-run1.log` ; sondes `scratch\exp2.mjs`.
- re-cp-2 `docs/CHECKPOINT2-lot-garde-fsync-1-2.md` lu par `git -C F:/Monark show lot/etude-suite:…` (dernier commit du
  fichier `b8a724f`) — C-V2-2 = MV-14 ; son harnais `F:\tmp\cp2-gfsync1-2\mutants\mutants-new.mjs` (MV-11..MV-15).
- G2 `docs/G2-lot-garde-fsync-1.md` (C-G2-4 : portée « jeton `DURABLE_FS` / import de `rpc-guard/src/ledger.ts` »).
- Worktree : `packages/rpc-guard/test/durable.test.ts`, `docs/RUNBOOK-rpc-guard.md`, `docs/PLI-lot-garde-fsync-1-2.md`,
  `docs/CONSIGNE-STANDARD-G1.md` (A-1..A-12 ; A-13 lu sur `lot/etude-suite`, commit `147d50f`),
  `packages/rpc-guard/src/{index,ledger,reconcile,repair}.ts`, `bin/rpc-guard.mjs`, `test/{harness,exports.test}.ts`,
  `package.json` ; `scripts/{grep-forbidden,lang-gate,export-public}.mjs` (périmètres) ; copie ADR
  `F:\tmp\gfsync1-pli\ADR-amendement-pli2.md` (sha `c9911d4c…`, LUE, NON modifiée).

## 1. Orientation mesurée (06:33-06:41 UTC)
- Worktree : HEAD `ae9e73c14ed0e435dab19500a152d6bccf4f9de2`, `git status --porcelain` = 0 au départ.
- A-2 : `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-gfsync1\packages\rpc-guard\src\index.ts` (218 entrées
  `node_modules`, 10 `@monark`). Tous les paquets sont `"type": "module"` (0 fichier `.cjs`/`.cts` dans les racines).
- `index.ts:13-14` ré-exporte `runReconcile` et `runCli` : la partie (1) charge TOUT `src/` (13 modules) ; ni le bin ni
  un script de course. `ledger.ts:48` : `fsyncSync: (fd) => { fsyncSync(fd); }` appelle la liaison VIVANTE de `node:fs`.
- Racines scannées (`scratch/measure-roots.mjs`, sha `7703dead…` → `measure-roots-wt.log`, sha `f50ae37f…`, en-tête
  06:39:34.863Z) : 13 racines, **154 fichiers** ; **0** `createRequire`, **0** `import.meta.resolve`, **0**
  `node_modules/@monark`, **0** `syncBuiltinESMExports`, **0** `require.resolve`, **0** `export *` ; `new URL` dans 20
  fichiers, **0** à blancs multiples ou saut de ligne ; jeton `DURABLE_FS` : `ledger.ts`, `lock.ts`, `repair.ts`
  seulement, **0 dans le bin** ; 613 spécificateurs lus, 38 résolus sous `packages/rpc-guard/`, tous depuis `src/`/`bin/`
  (le bin : `src/cli.ts` seul). Ruling 3 : aucun cas légitime ⇒ aucune exemption proposée.
- Sondes d'EXÉCUTION (`scratch/probe-forms.mjs`, sha `79837b4d…` → `probe-forms-1.log`, sha `5d62f66c…`, 06:41:18Z ;
  méthode de la partie (1) : processus neuf, `fsyncSync` de `node:fs` compté, la forme, puis `openGuardedClient` par le
  spécificateur de production, 2 appels ; 5 = intact, 0 = éteint) : 9/9 conformes.

| Forme | Compte réel | Lecture |
|---|---|---|
| F0 aucune / F1 import relatif de `ledger.ts` + `Object.assign` (témoin) | 5 / 0 | référence |
| F2 même fichier, autre casse (win32) ; F3 suffixe `?v=2` | **5 ; 5** | SECONDE instance de module : PAS un contournement (hors (B)) |
| F4 `fs.fsyncSync = () => {}` + `syncBuiltinESMExports()` (aucun import du paquet) | **0** | classe (e) |
| F5 alias de `import.meta.resolve` ; F6 `pathToFileURL(join(…))` ; F7 alias de `URL` ; F8 `URL.parse` | **0 ; 0 ; 0 ; 0** | classe (b) |

## 2. Advisor intégré APRÈS l'orientation (~06:42 UTC) — conseil, jamais verdict
Retenu : « EXACTEMENT » est le mot contraignant du ruling 1 (toute forme mesurée survivante entre dans (B)) ; D-1 : chaque
règle et chaque résidu ont leur mutant de FICHIER (les sondes prouvent l'effet, pas la détection) ; R-25 sous deux formes
étiquetées ; RUNBOOK en anglais, lignes 1-53 intactes, `reconcile.ts:73/:74` relus avant citation ; portée de la partie
(1) écrite comme mesurée ; aucune règle hors de `durable_production_path_…`. NON retenu (D-P3-1, motif) : ajouter des
règles AU-DELÀ de (A)(i)-(iv) et fermer MV-14 dans ce pli — le ruling 1 fixe (A) = (i)+(ii)+(iii)+(iv) et route
explicitement un ré-export non couvert vers (B) (« à appliquer, pas à rediscuter ») ; ces fermetures sont fournies en
OPTIONS mesurées et formées (§8). Ajout de sûreté (moi) : les harnais qui restaurent par `git checkout` (cp-2, re-cp-2)
ne tournent QUE sur un clone jetable (un `git checkout` dans le worktree écrirait son index, sous `F:\Monark\.git`).

## 3. Livré (worktree, NON committé)
`git --no-optional-locks diff --numstat ae9e73c` : `durable.test.ts` **+25/−10** ; `RUNBOOK-rpc-guard.md` **+19/−12**.

### 3.1 `durable.test.ts`, partie (2) de `durable_production_path_…` (sha final `dcdb1964…`, 253 lignes)
- **(i)** `inBin = rel.startsWith("packages/rpc-guard/bin/")` ; dans le bin : TOUT jeton `\bDURABLE_FS\b` = hit (« the
  served bin names the DURABLE_FS seam ») ; toute cible résolue `(?:^|\/)packages\/rpc-guard\/src\/ledger\.ts` = hit
  (« the served bin imports … », `else if` après la règle d'import existante, qui exempte `own`).
- **(ii)** après résolution : `.replace(/^(?:.*\/)?node_modules\/@monark\/rpc-guard\//, "packages/rpc-guard/")` (couvre
  aussi un chemin absolu ou `file:///…`).
- **(iii)** grammaire `(?:\bfrom|\bimport\s*\.\s*meta\s*\.\s*resolve|\bimport|\brequire|\bnew\s+URL)\s*\(?\s*["'\`]…`
  (sur-ensemble strict de l'ancienne : `new URL` à une espace reste lu).
- **(iv)** `/\bcreateRequire\b/` dans TOUTE source scannée = hit (« mentions createRequire (a require under any alias) »).
- **(B)** commentaire `:207-224` (18 lignes, remplace les 7 de `:207-213`) — objet restreint à CE paquet ; grammaire et
  règles exactes ; « A static heuristic, declared - it does NOT see (a) a module outside these roots, loaded directly or
  through a scanned one (re-G2 S7); (b) a specifier its grammar does not read, e.g. computed (re-G2 S8; path.join +
  pathToFileURL) or handed over by an alias of import.meta.resolve or of URL, or by URL.parse; (c) the seam re-exported
  by src/ under any name, then reached by a specifier that is no hit (re-cp-2 MV-14: index.ts + the bare
  @monark/rpc-guard - not checked here; exports.test.ts public_export_set_is_closed pins index.ts's exports, not another
  src/ module's); (d) in src/, a seam write not spelled `DURABLE_FS.<x> =` that part (1) does not run (a function it does
  not call, a module only the bin loads); (e) a patch of node:fs itself (e.g. fsyncSync replaced +
  module.syncBuiltinESMExports). Part (1) proves the module graph index.ts loads (all of src/, run through
  openGuardedClient) and nothing else: the served bin (unlock, repair-tail, reconcile) and the course scripts are covered
  ONLY by this scan. »
- D-4 (diff annoté, code seul) : 3 lignes retirées, chacune remplacée par un SUR-ENSEMBLE strict (`own` + `inBin` ;
  grammaire ; cible + normalisation, qui ne peut transformer aucun hit ancien en non-hit) ; 4 lignes de code ajoutées
  (suite de la normalisation, `else if` bin/`ledger.ts`, `createRequire`, jeton du bin) ; 7 lignes de commentaire → 18 ;
  **0 ligne `assert` touchée** (`grep -c '^[-+].*assert'` = 0) ; les 4 assertions de non-vacuité inchangées.
- A-13 (`scratch/a13-recount.mjs`, `node`) : barres obliques inverses HEAD 29 → 50, **delta 21 = attendu 21** (8
  grammaire, 4 normalisation, 5 cible du bin, 2 `createRequire`, 2 jeton du bin) ; paire doublée 1 → 1
  (`f.replace(/\\/g, "/")`, inchangée) ; 0 non-ASCII, 0 CR.
- `durable.test.ts` seul, état final (`durable-alone-2.tap`, sha `6f2a098e…`, en-tête `durable_sha=dcdb1964…`) :
  **7/7 ok, exit 0**.

### 3.2 `RUNBOOK-rpc-guard.md` — C-G2b-2 (texte seul) + O-3 (sha final `32a66f72…`)
- §3 étape 6 : « … in every mode), UNLESS that `reconcile` is a rollover (a `--before` or `--after` whose `cycle` is not
  `--cycle`), checked FIRST (`packages/rpc-guard/src/reconcile.ts:73`; the repair flag is `:74`): it then answers
  `NO-GO rollover`, its `reconciled` line closes the repaired window, and `repaired_in_window` is never written
  (measured: re-G2 E13). Either NO-GO is emitted ONCE … `reconciled` line of reason `repaired_in_window` (in the rollover
  case the hand computation stops at the `reconciled` line of reason `rollover`) … After a `repaired_in_window` NO-GO,
  the NEXT reconcile … (measured: G2 E11 for `hard:<method>`, re-G2 E12 for `hard:total`; pinned by the test …) ».
- §3 « Interrupted repair » : « (it would answer GO: measured, G2 E7) » → « (it does not flag the window: measured, G2
  E7) ».
- §5 : « … exactly ONCE, unless that reconcile is a rollover, checked first (`reconcile.ts:73`): it then answers
  `NO-GO rollover` and `repaired_in_window` is never written (measured: re-G2 E13). Either way, the `reconciled` line it
  appends closes that window, … (§3 step 6; in the rollover case it stops at that `reconciled` line of reason
  `rollover`) ».
- Contrôles : `reconcile.ts:73` = `if (before.cycle !== cycle || after.cycle !== cycle) return finish("NO-GO",
  "rollover");`, `:74` = `if (repairedInWindow(ledger)) …` (relus) ; lignes 1-79 identiques 79/79 (renvois ADR
  `RUNBOOK:6,28,36` intacts) ; 12 lignes retirées, toutes dans les 3 zones ; non-ASCII 44 → 44 (aucun nouveau) ;
  `lang:gate` saute `docs/` (`lang-gate.mjs:105`), `gate:vocab` ne scanne pas `docs/` (`grep-forbidden.mjs:2-4`),
  `export-public.mjs` exclut `docs/`. §4 étape 5 dit « as after §3 » : elle hérite de l'exception. NON touchés
  (ruling 2) : `reconcile.ts` (docstring comprise, sha `6e62cd6a…` inchangé), tout `src/`/`bin/`.

## 4. Mutants (A-11 byIntended, A-12 en-têtes, A-7, restauration octet pour octet) — état FINAL
Les premières exécutions (06:57-07:18Z) ont précédé une retouche de COMMENTAIRE de `durable.test.ts` (07:19Z ; code sans
commentaires identique, 201 lignes = 201, prouvé en `node`) : TOUTES les preuves ci-dessous ont été REJOUÉES sur le sha
final `dcdb1964…` ; les journaux antérieurs (`*-run1.log`, `mutants-pli3-run{1,2,3}.log`) sont conservés comme
historique, aux résultats identiques.

### 4.1 re-G2 `mutants-new.mjs` — `mutants/mutants-new-replay.mjs` (copie `7d5b5779…`)
Copie par `sed` des seules lignes de chemins (diff 4 lignes : `WT` → `F:/Monark-wt-gfsync1`, `GUARD`, `OSTMP`, chaîne
`cmd=` ; prédictions NON retouchées) ; A-13 source/copie 28/28, 0/0 doublée ; `--check` 16/16. Journal final
`mutants-new-run2.log` (sha `e546e4a7…`) ; 6 fichiers post == pré ; exit 0 ; « as predicted: 11 » = exactement les 5
basculements voulus.

| Mutant | Résultat | Lecture |
|---|---|---|
| P1, P2, P2b, P3, P4, P5 | TUÉS (`repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile`) | tuyau inchangé |
| S1, S1b, S2 | TUÉS (`durable_production_path_…`) | inchangé |
| **S3** / **S4** / **S5** / **S6** / **S9** | **TUÉS** (`as_predicted=false`, prédits « survit » contre le pli 2) | (iv) / (iii) / (ii) / (i) / (iii) |
| S7 (hors racines), S8 (calculé) | SURVIVANTS | résidus DÉCLARÉS (a), (b) |

### 4.2 X1 (G2), X2-X4 (pli 2), MV-1/MV-2 (cp-2), MV-13/14/15 (re-cp-2)
- `mutants-g2-replay.mjs` (de `F:\tmp\g2-gfsync1\mutants-g2.mjs` `72f969cd…`, diff 4 lignes de chemins, A-13 22/22 et
  1/1) `--only X1_…` → `g2-X1-run2.log` (sha `57915e7f…`) : **X1 TUÉ**, restauré.
- `mutants-pli2-replay.mjs` (de `F:\tmp\gfsync1-pli\mutants-pli2.mjs` `dc567371…`, diff 3 lignes, A-13 15/15 ; la
  chaîne « (the pli-2 change set) » de l'en-tête est un texte figé de l'original) `--only X2,X3,X4` →
  `pli2-X2X4-run2.log` (sha `2c8bc7ca…`) : **X2, X3, X4 TUÉS**, restaurés.
- cp-2 `cp2-mutants-replay.mjs` (de `F:\tmp\cp2-gfsync1\mutants\mutants.mjs` `daa3e087…`, diff 2 lignes :
  TEMP → os-tmp, restauration `d141413` → `ae9e73c` comme le re-G2) et re-cp-2 `cp2-2-mutants-new-replay.mjs` (de
  `F:\tmp\cp2-gfsync1-2\mutants\mutants-new.mjs` `a1c5ec16…`, diff 1 ligne : TEMP), A-13 37/37 et 5/5, exécutés sur le
  **clone jetable** `F:\tmp\gfsync1-pli3\clone` (`git clone --no-hardlinks -b lot/garde-fsync-1 F:/Monark`, HEAD
  `ae9e73c…`, les 2 fichiers du pli copiés, sha = worktree ; `node_modules` par `mk-nm.ps1` : 220 entrées, 10 `@monark`,
  0 échec) ; statut du clone identique avant/après. **MV-1 TUÉ, MV-2 TUÉ** (pré == post `625c759f`, `d46514ba`) ;
  **MV-13 TUÉ, MV-15 TUÉ ; MV-14 SURVIVANT** (sha muté `533abcf7…` = mon RX3) — journaux `cp2-MV-{1,2}-run2.stdout`
  (`e17604c1…`, `36c90d0c…`), `cp2-2-MV-{13,14,15}-run2.stdout` (`76b14723…`, `9916f8f1…`, `d3bfaf3f…`).

### 4.3 Mutants PROPRES du pli 3 — `mutants/mutants-pli3.mjs` (Write, sha final `8d4e3830…`, A-13 : 14 simples, 1 paire doublée voulue `\\d` dans un gabarit passé à `RegExp`)
Protocole de 4.1 étendu : plusieurs fichiers par mutant ; fichiers NOUVEAUX (absents avant, effacés après) ; `hit`/`nohit`
= règle qui a tiré (byRule, lue dans le TAP) ; `also` / `alsoFull` = un 2ᵉ fichier / la suite ENTIÈRE (globs du script
`test` de `package.json`), pour information ; `probe` = effet d'EXÉCUTION sous la mutation (processus neuf, vrai
`fsyncSync` compté ; fixtures produites AVANT la mutation par `realWriter` du test ; bin servi lancé sous
`node --import scratch/fsync-counter.mjs`, sha `cceb40c1…`). Journal final `mutants-pli3-run4.log` (sha `17f42ca0…`,
en-tête `tree_HEAD=ae9e73c… durable_test_sha=dcdb1964… 07:27:22.145Z`) : **24/24 conformes à la prédiction** ; 5
fichiers post == pré, 3 fichiers nouveaux absents après, fixtures supprimées, gardes vides ; exit 0 ; 30 TAP sous
`mutants/out-pli3/`. Références NON mutées : consommateur public `false:5` ; bin `unlock` `0:2` ; bin `repair-tail`
`0:4` ; import puis mesure `5`.

| Mutant | Forme | Résultat (tueur `durable_production_path_…`) | Règle (TAP) / autres tests / effet d'exécution |
|---|---|---|---|
| Ai (= S6) | bin : `import { DURABLE_FS as SEAM } from "../src/ledger.ts"` + `Object.assign` | TUÉ | jeton du bin ET cible `ledger.ts` du bin |
| Ai | bin : `import * as LEDGER from "../src/ledger.ts"` ; `LEDGER["DURABLE" + "_FS"]` | TUÉ | cible `ledger.ts` SEULE (nohit jeton) |
| Ai | bin : `await import("../src/" + "ledger.ts")` + jeton | TUÉ | jeton SEUL (nohit cible) |
| Aii (= S5) | script : `../../node_modules/@monark/rpc-guard/src/ledger.ts` | TUÉ | `imports packages/rpc-guard/src/ledger.ts` |
| Aiii (= S4) ; Aiii | `import.meta.resolve("…")` ; `import . meta . resolve("…")` | TUÉ ; TUÉ | idem |
| Aiii (= S9) ; Aiii | `new  URL(` ; `new` + saut de ligne + `URL(` | TUÉ ; TUÉ | idem |
| Aiv (= S3) | `createRequire as mkReq` + `req("…")` | TUÉ | `mentions createRequire` SEUL (nohit import) |
| RX1 ; RX2 | script : `export { DURABLE_FS } from "…/src/ledger.ts"` ; `export * from "…"` | **TUÉ ; TUÉ** | règle d'import (le `from` d'un ré-export est lu) |
| **RX3 (= MV-14)** | `index.ts` + `export { DURABLE_FS } from "./ledger.ts"` ; `apps/sentinel/src/zz-pli3-rx.ts` : import nu + affectation | **SURVIT** | `exports.test.ts` ROUGE (`public_export_set_is_closed`) ; consommateur public **`true:0`** |
| **RX4** | `index.ts` + `export * from "./ledger.ts"` ; même consommateur | **SURVIT** | `exports.test.ts` ROUGE ; **`true:0`** |
| **RX5** | `repair.ts` + `export { DURABLE_FS as FS_SEAM } …` ; bin : `import { FS_SEAM } from "../src/repair.ts"` + `Object.assign` | **SURVIT** | `exports.test.ts` vert ; **suite ENTIÈRE verte (951/949/0/2)** ; bin `unlock` **`0:0`** |
| D1 | `cli.ts`, niveau module : alias + `Object.assign` | **TUÉ** | par la partie (1) (« the production path flushes through node:fs itself ») |
| **D2** | `repair.ts`, DANS `runRepairTail` : `Object.assign(DURABLE_FS, { fsyncSync: () => {} })` | **SURVIT** | `repair-tail.test.ts` ROUGE (`repair_tail_heals_a_head_one_behind_after_the_strip`, `repair_tail_without_lock_takes_and_releases_it`) ; bin `repair-tail` **`0:0`** |
| **D3** | nouveau `src/zz-pli3-d3.ts` (alias + `Object.assign`), chargé par le SEUL bin | **SURVIT** | **suite ENTIÈRE verte (951/949/0/2)** ; bin `unlock` **`0:0`** |
| B1 ; B2 ; B3 ; B4 ; B5 | alias `import.meta.resolve` ; `pathToFileURL(join(…))` ; `const U = URL` ; `URL.parse` ; gabarit `${"src"}` | SURVIT ×5 | effets : F5, F6, F7, F8 = 0 ; B5 calculé (classe de S8) |
| O1 | script : `import "../../apps/site/lib/zz-pli3-o1.ts"` ; ce module (hors racines) atteint la couture | SURVIT | import puis mesure **`0`** |
| E1 | script : `nodeFs.fsyncSync = () => {}` + `syncBuiltinESMExports()` | SURVIT | effet : F4 = 0 |

Lecture : (A)(i)-(iv) tirent chacune SEULE sur sa forme ; tout survivant est effectif à l'exécution et appartient à une
classe déclarée (a)-(e) ; deux survivants du CHEMIN SERVI du bin (RX5, D3) ne sont vus par AUCUN test de la suite.

## 5. Réconciliation C-V2-2 (ré-export) avec C-G2b-1 — ruling 1
- Ré-export depuis un fichier SCANNÉ hors paquet : **couvert** — RX1 (`export { DURABLE_FS } from`) et RX2
  (`export * from`) TUÉS par la règle d'import (le `from` d'un ré-export est lu par la grammaire).
- Ré-export par `index.ts` puis spécificateur nu (MV-14 = RX3 ; RX4 `export *`) : **non couvert par (A)** ⇒ rejoint (B),
  classe (c), comme le ruling l'ordonne. Mesure complémentaire : **ROUGE dans `exports.test.ts`
  `public_export_set_is_closed`** (`:49-60`, liste exacte des exports de valeur) ⇒ la prémisse « `index.ts` n'exporte pas
  la couture » EST épinglée par la suite, pas par ce scan. Le commentaire le dit.
- Ré-export par un AUTRE module de `src/` vers le bin (RX5) : non couvert, et vu par AUCUN test (suite entière verte) ⇒
  classe (c) ; fermeture proposée O-1/O-2/O-6 (§8).
- C-V2-2 (b) du re-cp-2 (« assertion d'une ligne : `index.ts` ne mentionne pas `DURABLE_FS`, au prochain pli touchant
  `durable.test.ts` ») : ce pli touche `durable.test.ts` ; NON appliquée (le ruling 1 route le ré-export vers (B)).
  Données pour la décision de l'orchestrateur (item I-P3-3) : l'assertion textuelle serait redondante avec
  `public_export_set_is_closed` pour `index.ts`, et ne verrait ni RX4 sous un autre nom (`export *` ne nomme pas le
  jeton) ni RX5.

## 6. Oracle, R-25, A-6, DELIVERED, périmètre — état FINAL
- Oracle `oracle.sh w2` (copie de l'`oracle.sh` du pli 2 : chemins, arbre en argument, `MERGE_HEAD` à l'en-tête,
  `git --no-optional-locks` ; chaque gate `$U npm run <s> > log 2>&1; echo "<s> exit=$?"`) — en-tête
  `HEAD=ae9e73c… MERGE_HEAD=none dirty_files=2 node=v24.15.0 win32-x64 07:32:05Z`, fin 07:34:04Z : **gate:vocab 0
  (223 fichiers), typecheck 0, test 0, lint 0, lint:ratchet 0 (69/69), lang:gate 0, export:check 0** ; tests
  **951 / pass 949 / fail 0 / skipped 2** (skips nommés : `sentinel_run_releases_chainstack_lock_on_sigterm` `:390`,
  `u4b_labels_replay_via_main_real_artifact` `:1338`) ; `durable_production_path_…` ✔ `:821`, test par le bin ✔
  `:884`. sha (préfixes) : header `198eb508`, exits `93da644a`, test `73726590`. (Premier oracle `w1`, 07:07-07:09Z,
  avant la retouche de commentaire : même résultat.)
- **R-25** (`r25.sh`, pathspec extrait VERBATIM de `ci.yml:65` par le `sed` du pli 2 ; ligne 65 sha LF `20f7aab9…` ;
  `r25-final.log` sha `a0033465…`, 07:36:51Z) : (1) forme CI trois-points `66f75c2...HEAD` (committé seul) = 11
  fichiers, **801 + 18 = 819** ; (2) arbre de travail vs base (ce que la CI calculera au commit du pli) = 11 fichiers,
  **816 + 18 = 834** (= 819 + 15 : `durable.test.ts` est un fichier NOUVEAU depuis la base, 238 → 253 lignes) ; (3) pli 3
  seul = **25 + 10 = 35** (RUNBOOK exclu par `docs/**/*.md`). < 1 150 (STOP A-5) et < 1 205.
- **A-6** (`a6.sh`, `tr -d '\r' | sha256sum`, blob `66f75c2` / blob HEAD / arbre) : **9/9 SAME** avant (06:53:01Z) et
  après (07:36:5xZ), identiques (`2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91 0e232519 3603265d cb020425`).
- `git diff --stat ae9e73c -- packages/rpc-guard/src packages/rpc-guard/bin` : **VIDE** (0 ligne). `sha-before.txt` vs
  `sha-after.txt` (13 sources du paquet + bin + 4 tests + RUNBOOK + 3 fichiers mutés) : seuls `durable.test.ts` et le
  RUNBOOK changent.
- `DELIVERED-pli3.sha256` (sha `701d513e…`) : `dcdb19648ae373c0ca88e600489f9de0484932220b09b0417613a48963fc6101
  packages/rpc-guard/test/durable.test.ts`, `32a66f7280e67351969be11008daade01b51850e48ea757a588bf443d44cfe85
  docs/RUNBOOK-rpc-guard.md` ; `sha256sum -c` 2/2 OK. `DELIVERED-pli2.sha256` contre le worktree : 10/12 OK, les 2
  écarts = exactement ces 2 fichiers (`reconcile.ts` `6e62cd6a…` OK).
- `git --no-optional-locks status --porcelain` du worktree = ` M docs/RUNBOOK-rpc-guard.md`,
  ` M packages/rpc-guard/test/durable.test.ts` ; aucun fichier non suivi ni ignoré hors `node_modules` ; aucun `zz-*`.

## 7. Arbre FUSIONNÉ (pointe fetchée de `lot/etude-suite`) — donnée G7 et fait nouveau I-P3-1
- Clone jetable `F:\tmp\gfsync1-pli3\merge-clone` (`git clone --no-hardlinks --no-checkout F:/Monark`, lecture seule) ;
  `origin/lot/etude-suite` = **`0383e5b6109cf295d55cff22b8fb823db0ccb821`** ; `merge-base` avec le lot = `66f75c2` ;
  `git merge --no-commit --no-ff origin/lot/garde-fsync-1` ⇒ exit 1, **DEUX conflits** : `docs/G1-lot-garde-fsync-1.md`
  (AA, attendu, C-V-5 (a)) et **`apps/sentinel/test/ukemi-guard-record.test.ts` (UU, NOUVEAU)**.
- Origine du nouveau conflit : côté `lot/etude-suite`, `dd44604` (2026-09-23T07:08:32+01:00, UKEMI-RETRY-2/3 +
  HEARTBEAT-1, fusionné par `12b6dcd`) ajoute +225/−2 lignes EN FIN de fichier ; côté lot, `d141413` ajoute au même
  endroit `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`, commenté « LAST test of the file » (il asserte
  `flushesSkipped() > 0` sur les appends des tests qui le précèdent). Une seule région de conflit.
- Résolution CANDIDATE, dans le clone seulement (`scratch/resolve-ukemi.mjs`, sha `31fc45b8…`) : les deux blocs, celui
  de la pointe d'abord, celui du lot EN DERNIER ; 0 marqueur restant ; fichier résolu sha `c05791b2…`. G1 : version du
  lot (`git checkout --theirs`, sha `e2d61b98…` = `ae9e73c`). Puis les 2 fichiers du pli copiés (sha = worktree) ;
  `packages/rpc-guard` = lot + pli 3 exactement ; `node_modules` par `mk-nm.ps1` ; AUCUN commit.
- Mesures : racines de l'arbre fusionné (`measure-roots-merged-2.log`, sha `764fbd31…`) : 158 fichiers, 0
  `createRequire` / `import.meta.resolve` / `node_modules/@monark` / `new` à blancs multiples ; jeton `DURABLE_FS` aussi
  dans `apps/bell/src/rebase-crosscheck.ts` (couture PROPRE de Bell, hors bin : aucune règle ne la vise). Les 3 fichiers
  (`durable`, `repair-tail`, `ukemi-guard-record`) en TAP (`merged-3files-2.tap`, sha `6cb2fc71…`, en-tête
  `HEAD=0383e5b… MERGE_HEAD=ae9e73c…`) : **47/47 ok**, dont `durable_production_path_…` (aucun faux positif du scan
  durci) et le test `nonvacuous` du lot, 30ᵉ et dernier du fichier Ukemi. Oracle `oracle.sh m2` (07:34:11-07:36:41Z) :
  **7 × exit 0**, gate:vocab 225 fichiers, 69/69, tests **1060 / 1058 / 0 / 2** (mêmes 2 skips) ; pointe SEULE
  (`git archive` du clone → `tip-tree`, `npm run test`, `tip-alone-test.log` sha `2a2b1726…`) : **1042 / 1040 / 0 / 2**
  ⇒ 1060 = 1042 + 18 (17 du lot + 1 du pli 2) : la résolution candidate ne perd aucun test. Cohérence avec le re-G2 :
  pointe `b8a724f` = 1035 ; `git diff b8a724f 0383e5b -- '*.test.ts'` = +7 lignes `test(`, 0 retirée (`dd44604`,
  « 7 composition tests ») ⇒ 1042.

## 8. Options de fermeture du résidu — mesurées, NON appliquées (ruling 1), formées (item I-P3-2)
Faux positifs des RÈGLES DE SCAN (O-1, O-3, O-4, O-5, O-6) mesurés par `scratch/measure-options.mjs` (sha `7cd987ad…`)
sur le worktree (`…-Monark-wt-gfsync1.log`, sha `55a01724…`) ET sur l'arbre fusionné (`…-merge-clone.log`, sha
`eb15062c…`) : **0 hit pour chacune, sur les deux**. O-2 n'est pas une règle de scan mais une preuve comportementale :
sans faux positif par construction ; références mesurées (harnais pli-3, arbre non muté) `unlock` `0:2`,
`repair-tail` `0:4`.

| Option | Règle | Ferme (mesuré par mutant) | Coût |
|---|---|---|---|
| O-1 | bin : toute cible résolue autre que `packages/rpc-guard/src/cli.ts` = hit | RX5, D3 (leur import dans le bin) | 0 FP ; ~2 lignes |
| O-2 | preuve comportementale étendue au BIN servi : processus neuf `node --import <compteur>` (un `data:` URL suffit, aucun fichier nouveau) sur `unlock` d'un écrivain réel mort, compte == 2 (mesuré ici `0:2`) ; idem `repair-tail` (`0:4`) | RX5, D3, D2 et TOUTE forme (calculée, aliasée) dans le graphe du bin | ~1-2 s ; ~8 lignes |
| O-3 | jeton `import.meta.resolve` = hit partout (comme (iv)) | B1 | 0 FP ; 1 ligne |
| O-4 | tout littéral RELATIF d'une source hors paquet résolu sous `packages/rpc-guard/{src,test}/` = hit, quel que soit l'appel | B1, B3, B4 (et S3/S4/S9 en double) ; 291 (worktree) / 297 (fusion) littéraux lus, 0 hit | 0 FP ; ~2 lignes |
| O-5 | jeton `syncBuiltinESMExports` = hit partout | E1 (forme ESM d'un patch de `node:fs`) | 0 FP ; 1 ligne |
| O-6 | dans `src/` hors `ledger.ts` : `export { … DURABLE_FS … }` ou `export * from "./ledger.ts"` = hit | RX5 (RX3/RX4 déjà rouges dans `exports.test.ts`) | 0 FP ; 1 ligne |

Non fermables par un scan statique en général : (a) module hors racines et (b) spécificateur calculé — pour le graphe
d'`index.ts` la partie (1) les voit déjà, pour celui du bin O-2 les verrait ; pour les scripts de course (courses
payantes, jamais exécutées en test) le scan reste la seule garde (résidu déclaré). **Recommandation (avis, non
verdict)** : O-2 (+ O-1) en priorité — le bin est le chemin servi de CA-11 et RX5/D3 y éteignent le flush sans qu'aucun
test ne rougisse. **Porteur** : orchestrateur (choix), puis worker (pli test-only). **Déclencheur** : le prochain pli qui
touche `packages/rpc-guard/{src,bin}` ou `durable.test.ts`, ou la première course servie qui consomme le bin (passage
`upcoming` → `built`), le premier des deux.

## 9. Consigne standard (A-1..A-13) : point par point
| Point | État | Preuve / motif |
|---|---|---|
| A-1 | fait | 1ʳᵉ ligne ; `claude-opus-5-5[1m]` |
| A-2 | fait | `require.resolve` = worktree ; clones par `mk-nm.ps1` (résolution = chaque clone) ; retrait par `rm-nm.ps1` à la clôture (journal) |
| A-3 | fait | `oracle.sh` : code capturé directement, 7 gates (§6) |
| A-4 | fait | `DELIVERED-pli3.sha256` ; rendu sous `F:\tmp\gfsync1-pli3\` ; 0 commit ; rien sur C: ; aucun réseau (fetch bouchonné dans les enfants, clé factice, hôte `.invalid`) |
| A-5 | fait | R-25 834 (pathspec verbatim `ci.yml:65`) |
| A-6 | fait | 9/9 avant/après |
| A-7 | fait | tout oracle/test/mutant/sonde sous `env -u` des 8 clés ; enfants : retrait par liste ou par motif ; aucune variable affichée |
| A-8 | n-a | aucun test d'intégration ajouté ; les fixtures des sondes viennent de l'écrivain réel du test (`realWriter`) |
| A-9, A-10 | n-a | aucune phrase ni sortie servie touchée |
| A-11 | fait | 7 harnais TAP, CRLF normalisé, tué ⇔ rouge ET `not ok … - <tueur>` ET restauré |
| A-12 | fait | en-têtes (HEAD, MERGE_HEAD, node, plateforme, commande, date, sha de harnais/du test) sur chaque journal ; les harnais tiers gardent leur format d'en-tête (cp-2 : `tree=… node=… date=…`) |
| A-13 | fait | sources et scripts par Write/Edit ; recomptes `node` (test : delta 21/21 ; harnais : 12→14 simples, 1 doublée voulue ; copies `sed` sur lignes sans barre oblique inverse : 28/28, 22/22+1/1, 15/15, 37/37, 5/5) |
| B-*, C-*, E-* | n-a | aucun secret, classe d'erreur, verrou ni backoff touché |
| D-1 | fait | chaque règle (i)-(iv) a son mutant tué byRule ; chaque classe de résidu a son mutant survivant + effet d'exécution |
| D-2 | fait | non-vacuité inchangée (4 assertions) + racines mesurées (154 / 158 fichiers) |
| D-3 | n-a (constat) | aucun tuyau nouveau ; résidu du chemin servi du bin signalé (RX5, D3) et formé (O-2) |
| D-4 | fait | diff annoté §3.1 : 0 assertion touchée, 3 lignes remplacées par des sur-ensembles |
| F-1 | fait | delta ADR, 0 `F:\tmp`, résidus nommés avec porteur et déclencheur |
| F-2 | fait | test ASCII (0 non-ASCII) ; RUNBOOK sans nouveau non-ASCII ; `gate:vocab` OK |
| F-3 | fait | D-P3-1..8 (§11) ; advisor avant et avant clôture |
| G-1 | n-a | aucune pièce publique touchée (`@monark/rpc-guard` reste `upcoming`) |

## 10. Tableau correction ↔ test ↔ mutant ↔ `error_origin` (proposé ; assigné au G7)
| Correction | Test / texte | Mutants tués (harnais) | Résidu déclaré (mutant survivant) | `error_origin` proposé |
|---|---|---|---|---|
| C-G2b-1 (A)(i) | `durable_production_path_…` (2) | S6 (re-G2), Ai ×3 (pli-3) | — | worker pli 2 (portée `own` du bin plus large que le motif de D-P2-1) |
| C-G2b-1 (A)(ii) | idem | S5, Aii | — | worker pli 2 |
| C-G2b-1 (A)(iii) | idem | S4, S9, Aiii ×4 | B1, B3, B4 (classe (b)) | worker pli 2 |
| C-G2b-1 (A)(iv) | idem | S3, Aiv | — | worker pli 2 |
| C-G2b-1 (B) | commentaire `:207-224` ; delta ADR S6-1 | — | S7, O1 (a) ; S8, B1-B5 (b) ; RX3-RX5 (c) ; D2, D3 (d) ; E1 (e) | worker pli 2 (« spécificateur calculé » seul, sans essayer les autres formes ; « part (1) is the proof » étendu à ce qu'elle ne charge pas) |
| C-V2-2 (réconciliation) | commentaire (c) ; `exports.test.ts` existant | RX1, RX2 ; MV-13, MV-15 | RX3 (= MV-14), RX4, RX5 | worker pli 2 (prémisse de D-P2-1 écrite sans la mesurer) |
| C-G2b-2 | RUNBOOK §3 étape 6, §5 ; delta ADR S5-1..S5-4 | texte (déclaratif, D-1) ; mesure re-G2 E13 | — | worker pli 2 (« exactly ONCE » écrit sans le contrôle qui précède) |
| O-3 | RUNBOOK §3 étape 6, « Interrupted repair » ; delta ADR S5-3 | texte ; mesures G2 E11/E7, re-G2 E12 | — | worker pli 2 (citation incomplète) |
| I-P3-1 (conflit UU nouveau) | — | — | — | n-a : concurrence de branches (`dd44604` postérieur au re-G2) |

## 11. Déviations déclarées (F-3)
- **D-P3-1** — conseils de l'advisor non appliqués (règles au-delà de (i)-(iv), fermeture de MV-14) : ruling 1 littéral ;
  fermetures fournies en options mesurées (§8). Si l'orchestrateur les veut dans ce lot : un pli test-only de quelques
  lignes, preuves prêtes (mutants B1, B3, B4, E1, RX5, D2, D3 du harnais pli-3).
- **D-P3-2** — la liste (B) est plus longue que l'énumération du ruling ((3) S7, (4) S8) : exigé par « EXACTEMENT » ;
  chaque ajout est un survivant mesuré ET effectif à l'exécution (§4.3). Ce n'est pas une rediscussion du ruling.
- **D-P3-3** — les harnais cp-2 et re-cp-2 (restauration par `git checkout`) tournent sur un clone jetable, pas sur le
  worktree (motif §2) ; fidèles à leur protocole (diffs 2 et 1 lignes).
- **D-P3-4** — retouche de COMMENTAIRE après les premières preuves (07:19Z, classe (c) précisée après la mesure
  `exports.test.ts`) ; code identique prouvé ; TOUT rejoué sur le sha final.
- **D-P3-5** — RUNBOOK : au-delà des phrases du ruling, trois conséquences éditoriales nécessaires à l'exactitude :
  « Either NO-GO is emitted ONCE », « After a `repaired_in_window` NO-GO, the NEXT reconcile … » (rejoués tels quels, des
  instantanés de rollover redonnent `NO-GO rollover`), « Either way » en §5.
- **D-P3-6** — contrôle sur l'arbre fusionné fait avec une résolution CANDIDATE d'un conflit nouveau, dans un clone
  jetable ; ce n'est pas une décision : la résolution reste l'acte G7 de l'orchestrateur (I-P3-1).
- **D-P3-7** — `git --no-optional-locks` pour mes commandes `git` sur le worktree (oracle, R-25, A-6, statut,
  harnais pli-3, recompte A-13) ; EXCEPTIONS déclarées : les harnais tiers copiés « chemins seuls » (re-G2, G2, pli 2)
  et mes deux scripts de mesure `measure-roots.mjs` / `probe-forms.mjs` lancent `git rev-parse` / `git status
  --porcelain` NUS sur le worktree : cela peut rafraîchir le cache stat de son index (sous
  `F:\Monark\.git\worktrees\`) sans changer aucun contenu suivi. Sur `F:\Monark` même : `git show/log/rev-parse/clone`
  (lecture) seulement.
- **D-P3-8** — `mutants-new-replay.mjs` garde les prédictions du re-G2 (règle « chemins seuls ») : « as predicted: 11 »
  y est le basculement voulu de S3-S6/S9, écrit comme tel.

## 12. Items formés et points ouverts (zéro dette nue)
- **I-P3-1 — fait G7 nouveau (mesuré §7)** : 2ᵉ conflit de fusion `apps/sentinel/test/ukemi-guard-record.test.ts` (UU)
  avec `lot/etude-suite` ≥ `12b6dcd` ; résolution candidate prouvée (les deux blocs, celui du lot en dernier ; oracle
  fusionné 7 × 0, 1060 = 1042 + 18). Porteur : orchestrateur. Déclencheur : G7, à la fusion (avec C-V-5 (a)/(b) : rejouer
  l'oracle sur l'arbre fusionné RÉEL).
- **I-P3-2 — options de fermeture O-1..O-6** (§8) : choix orchestrateur ; porteur worker (pli test-only) ; déclencheur
  écrit au §8 et dans le delta ADR (S6-1).
- **I-P3-3 — C-V2-2 (b)** du re-cp-2 : son déclencheur textuel (« prochain pli touchant `durable.test.ts` ») coïncide
  avec ce pli ; le ruling 1 l'a routé vers (B) ; données de décision au §5 (redondante avec
  `public_export_set_is_closed` pour `index.ts`, aveugle à RX4-sous-autre-nom et RX5 ; O-6 la remplacerait). Porteur :
  orchestrateur (clore ou re-dater).
- Rappels non nouveaux, NON portés par ce pli : insertion ADR (cp-2 C-V-1 / I-P2-2, avec le delta
  `ADR-D-FS-5-6-delta.md`) ; docstring `reconcile.ts:43-47` (C-G2b-2, item formé par l'orchestrateur, sha figé C-V-4).

## 13. Verdict du worker
**PRÊT** — liste fermée du pli faite : C-G2b-1 (A) complète + (B) exact ; C-G2b-2 + O-3 ; C-V2-2 réconcilié ; toutes les
preuves exigées recomputées sur l'état final (mutants re-G2, X1-X4, MV-1/MV-2 ; 7 gates 951/949/0/2 ; R-25 ; A-6 ;
DELIVERED ; périmètre). Aucun blocage ; aucune demande de consultation formée. Points à trancher par l'orchestrateur :
D-P3-2 (liste (B) élargie par la mesure), I-P3-1 (conflit nouveau), I-P3-2 (options), I-P3-3 (C-V2-2 (b)).

## Journal d'avancement (UTC, `date -u`)
- 06:33:37 début ; worktree propre @ `ae9e73c` ; `F:\tmp\gfsync1-pli3\` créé.
- 06:34-06:39 lecture des entrées ; 06:39:34 mesure des racines ; 06:41:18 sondes F0-F8 (9/9).
- ~06:42 **advisor intégré consulté après l'orientation** (conseil, non verdict) : §2.
- 06:53:01 A-6 AVANT 9/9 ; sha du paquet figés. 06:54 `durable.test.ts` (Edit) ; 06:54:24 seul 7/7 ; A-13 21/21.
- 06:5x RUNBOOK (Edit, 3 zones). 06:57:18 re-G2 rejoué (run1). 07:01:56 `--check` pli-3 24/24 ; 07:02:08 run1 24/24.
- 07:02:59 X1 ; 07:03:00 X2-X4 ; 07:03:36 clone jetable ; 07:03:53-58 MV-1, MV-2, MV-13, MV-15 tués, MV-14 survit.
- 07:05:23 clone de fusion @ `0383e5b` : 2 conflits (G1 AA + Ukemi UU nouveau) ; résolution candidate ; 07:06:33 racines
  fusionnées ; 07:06:43 3 fichiers 47/47 ; 07:07:28-07:09:43 oracle w1 7 × 0, 951/949/0/2 ; 07:10:00 R-25, A-6.
- 07:10:33-07:13:31 oracle m1 7 × 0, 1060/1058/0/2 ; 07:13:47 pointe seule 1042/1040/0/2.
- 07:16:52 run2 pli-3 (+ `exports.test.ts`) : RX3/RX4 rouges là ; 07:18:41 run3 (+ suite entière) : RX5/D3 verts partout.
- 07:19 retouche du commentaire (classe (c)) ; 07:24 options O-1..O-6 : 0 FP ×2 ; 07:25 delta ADR 7/7.
- 07:2x-07:36 REJEU sur l'état final : seul 7/7 ; re-G2 ; X1-X4 ; run4 24/24 ; MV-1/2/13/14/15 ; fusion 47/47 ;
  07:32:05-07:34:04 oracle w2 7 × 0 (951/949/0/2) ; 07:34:11-07:36:41 oracle m2 7 × 0 (1060/1058/0/2) ; 07:36:51 R-25
  834, A-6 9/9, DELIVERED 2/2, périmètre ; 07:3x rendu complet écrit.
- ~07:38 **advisor intégré consulté avant clôture** (conseil, non verdict) : verdict PRÊT tenu ; il retire lui-même son
  conseil d'élargir (A) (D-P3-1 confirmée) ; appliqués : disposition des `node_modules`, état laissé, D-P3-7 précisée
  (git nu des harnais tiers), parenthèse O-2 du delta ADR (re-contrôle 7/7, sha `831f4577…`), cohérence 1035 + 7 = 1042,
  sha du rendu calculé APRÈS cette ligne.
- 07:4x retrait des `node_modules` à jonctions des 3 arbres jetables par `rm-nm.ps1` (jamais `Remove-Item -Recurse` :
  un dossier de jonctions serait traversé DANS `F:\Monark\node_modules`) ; 1ʳᵉ tentative : piège A-13 reproduit (le
  `\\` d'un argument `-Tree` réduit à `\` avant bash ⇒ `$t` littéral ⇒ « absent », RIEN retiré) ; relancé avec des
  barres obliques simples : 3 × « removed » ; `F:\Monark\node_modules` 220 entrées (10 `@monark`) AVANT == APRÈS ;
  `node_modules` du worktree conservé (220, A-2). Re-vérification : `mk-nm.ps1 -Tree <arbre>`.
- **Clôture 2026-09-23T07:45:53Z** (`date -u`) — état laissé : worktree HEAD `ae9e73c`,
  2 fichiers modifiés non committés (R-20) ; `clone` = `ae9e73c` + les 2 fichiers (non committés) ; `merge-clone` = HEAD
  `0383e5b`, `MERGE_HEAD` `ae9e73c`, 15 entrées (fusion non committée, 0 non fusionnée, conflits G1 et Ukemi résolus
  DANS LE CLONE, 0 commit) ; `tip-tree` = export de `0383e5b` ; gardes de mutants vides ; fixtures supprimées ;
  `os-tmp` : 1 051 dossiers temporaires laissés par la suite de tests elle-même au fil des 6 exécutions complètes
  (`bell-univ-cyc` 99, `bell-sp-s` 48, `atelier-vocab` 18, …), 0 lien au premier niveau, laissés en place. Aucun
  commit, aucun workflow (R-20) ; aucune écriture dans `F:\Monark`.
