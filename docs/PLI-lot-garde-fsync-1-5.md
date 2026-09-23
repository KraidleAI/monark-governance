Modèle résolu : claude-opus-5-5[1m]

# RENDU PLI-5 (test-only + RUNBOOK) — GARDE-FSYNC-1 — C-G2d-1 (résidu par HYPOTHÈSES + règle Q), C-G2d-3 (rollover E13e), delta ADR (C-G2d-2)

> Persisté par l'orchestrateur `claude-fable-5-1` le 2026-09-23 sur `lot/garde-fsync-1` depuis `F:/tmp/gfsync1-pli5/RENDU-PLI-5.md` (sha256 04c8997b42c2ea91172adc74adfa8c553d4a2ccab0431410f9c4acc5014da300) — rendu du pli 5 (commit de code `3524eb6`). R-25 corrigé par le re-G2-delta du pli 5 : 881, non 876 (C-G2e-1).


> Écrit AU FIL DE L'EAU. Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1, décision 133), effort max,
> contexte frais. Worktree `F:\Monark-wt-gfsync1`, branche `lot/garde-fsync-1` @ `9ea2e8b` ; AUCUN commit (R-20) ;
> aucune écriture dans `F:\Monark` (lectures `git --no-optional-locks` seulement) ; TEMP/TMP/TMPDIR sous
> `F:\tmp\gfsync1-pli5\` ; npm cache `F:/tmp/npm-cache` ; ceinture A-7 (`env -u` des 8 clés) sur tout oracle, test,
> mutant et sonde ; aucune variable d'environnement affichée ; processus de course : jamais touchés. GARDE-FSYNC-BIN-1
> et les autres items du fold restent ouverts (renvois). État : **CLOS le 2026-09-23 (dernière mesure 13:43Z UTC ; delta re-ciblé sur le fold vivant `377c2763` après régénération du fold par l'orchestrateur).**

Livré (worktree, NON committé) : `packages/rpc-guard/test/durable.test.ts` (sha `009c1568…`) et
`docs/RUNBOOK-rpc-guard.md` (sha `ae0c283a…`) ; rien d'autre (`src/`/`bin/` byte-identiques, `reconcile.ts`
`6e62cd6a…` figé). Delta ADR `F:\tmp\gfsync1-pli5\ADR-D-FS-6-delta-pli5.md` (sha `235e5108…`), **re-ciblé sur le fold
VIVANT `377c2763…`** (voir Constat de dérive ci-dessous).

## Constat de dérive (deux entrées ont bougé PENDANT la mission ; consigné, non contourné)
1. **Le fold a été régénéré par l'orchestrateur** (mtime 2026-09-23 14:22 locale = 13:22Z) : la mission épinglait
   `9f45e0fb…` (15 marqueurs `<<PLI-4:>>`) ; l'orchestrateur a fait sa moitié du ruling 11:45 (C-G2d-2 → fold) —
   delta pli 4 APPLIQUÉ, marqueurs 5/6 renommés `<<POINTE_LOT>>` / `<<R25_POINTE_LOT>>`, D-FS-5 portant « texte repris
   au pli 5 ». Cible vivante = `377c2763…`. **Décision (advisor) : re-cibler le delta sur `377c2763`** (un delta contre
   l'ancien sha ferait refaire le travail). Le delta contre `9f45e0fb` (vérifié 18/18 à ~13:0xZ ; **journal écrasé par
   la course suivante, non rejouable, `9f45e0fb` n'existe plus sur disque** — consigné tel quel) est conservé
   superseded : `ADR-D-FS-6-delta-pli5-vs-9f45e0fb-SUPERSEDED.md` (`3dbcc850…`).
2. **La pointe `lot/etude-suite` a avancé** : `68dcb50` (début) → `0b19e76` → **`9d285491`** (clôture), UKEMI-REVERT-1
   et BELL-ADV-1 docs + **9 fichiers de code hors `docs/`** dont `packages/rpc-guard/src/{classify,index}.ts`. J'ai
   re-fusionné et re-scané l'arbre fusionné contre `9d285491` (§4.5). Les preuves WORKTREE (4 harnais, oracle
   951/949/0/2, R-25, A-6) ne dépendent NI du fold NI de la pointe : intactes.

## 0. Entrées lues
- Re-G2-delta du pli 4 `F:\tmp\g2-gfsync1-4\G2-4.md` (sha `cf8ab523…` vérifié ; persisté `lot/etude-suite:docs/G2-lot-garde-fsync-1-4.md` par `9101c4a`) : C-G2d-1/2/3, O-1..O-9.
- Ruling orchestrateur `docs/CHANTIERS.md` « 2026-09-23 11:45 UTC » : résidu par HYPOTHÈSES (regex ; 4 liaisons ; 5 champs `package.json` ; realpath ; casse), règle « guillemet fermant différent = hit », BIN-1 pour le bin ; C-G2d-2 fold ; C-G2d-3 RUNBOOK/S5-1 ; chaîne « pli 5 → re-G2-delta pli 5 (texte seul, périmètre fermé) → G7 ».
- Rendu pli 4 `docs/PLI-lot-garde-fsync-1-4.md` (319 l.) ; delta ADR pli 4 (intégral) ; fold `ADR-amendement-GARDE-FSYNC-1-final.md` (sha `9f45e0fb…`, 134 l., 15 marqueurs `<<PLI-4:` tous entre accents graves) ; `durable.test.ts`@`9ea2e8b` (277 l., sha `3cb79616…`) ; `RUNBOOK-rpc-guard.md` (161 l., sha `8bb3f526…`) ; `reconcile.ts` `6e62cd6a…` ; CONSIGNE + amendements A-13/D-1-bis/REVIEW-TAP-1 ; harnais `mutants-g2-4.mjs` (`74fb222f…`) et originaux.

## 1. Orientation
- Début 2026-09-23T11:57:43Z. HEAD `9ea2e8b6…`, `status --porcelain` = 0 (avant travail). `core.symlinks` false. node v24.15.0. `require.resolve('@monark/rpc-guard')` = `…\packages\rpc-guard\src\index.ts` (A-2). Pointe `lot/etude-suite` = **`9d285491`** à la clôture (≥ `8dcbf5d` ; a avancé pendant la mission, voir Constat de dérive).
- La phrase « part (1) is the proof on the production path » n'est plus au texte depuis le pli 3 ; le texte courant la restreint déjà au graphe de `index.ts` (`:240-242`, renforcé au pli 5, §2.1). Le message `:205` « the production path flushes through node:fs itself » est la sous-chaîne `PART1` du harnais `mutants-pli3.mjs:46` (mutant D1) : NON modifié.

## 2. Livré — texte du test et du RUNBOOK

### 2.1 `durable.test.ts` (sha `009c1568…`, +39/−21 vs `9ea2e8b`)
- **(a) Règle Q, étiquetée et retirable** (ruling C-G2d-1), une ligne `if` juste après la règle absolu/`data:` :
  `if (m[0].at(-2 - spec.length) !== m[0].at(-1)) hits.push(\`${rel}: a specifier literal cut by a quote of another kind ${JSON.stringify(m[0].slice(-2 - spec.length))} (rule Q)\`);`
  Le message ne commence PAS par « imports » (le `fired()` du harnais g2-4 le classe donc `other`, attribution lisible) et ne contient aucune sous-chaîne des messages de règle existants. **La REGEX de la grammaire n'est pas touchée** (`block_sha` identique, §4.4) ; les messages `HIT_*` des harnais restent valides. `m[0]` finit par `<ouvrant><spec><fermant>` ; `spec` est non vide (quantificateur `+`) ; `at(-2 - spec.length)` = l'ouvrant, `at(-1)` = le fermant.
- **(b) Commentaire du résidu réécrit par HYPOTHÈSES** (`:207-249`, aucune énumération présentée comme exhaustive ; les exemples sont « measured: … », jamais « the residue is: … ») :
  - En-tête : « A static heuristic, DECLARED by its own hypotheses, each a FINITE list (no residue by example: three enumerations were refuted in a row - S3-S9 pli-2, H1-H17 pli-3, ten forms pli-4 - so the closure is the hypotheses, not the cases). »
  - **(b)** défini par (hypothèse 1) « the regex IS the whole reading: a keyword, an optional "(", blanks, one quote, then a capture up to the first quote of ANY kind or a LF » ; et (hypothèse 2) « the reading calls that are BINDINGS, not syntax … exactly four: require (the CJS wrapper parameter); URL (a global); import.meta.resolve (a property); and import.meta.url (the base the new URL rule accepts) - whereas import(...) and `import ... from` are syntax, not rebindable ». Exemples en « measured: … ».
  - **(f)** défini par (hypothèse 3) les 5 champs `package.json` que Node lit — « node reads exactly "name", "main", "type", "exports" and "imports" » ; (hypothèse 4) l'étape realpath ; (hypothèse 5) la casse (`node_modules/@monark/rpc-guard/` sensible, système de fichiers non). Exemples en « measured: … ».
  - **(e)** étendue (D-P5-1, mesuré W10) : « … or node's RESOLUTION ENVIRONMENT the scan cannot read - NODE_PATH / GLOBAL_FOLDERS resolve a BARE require() specifier that is no hit … likewise --preserve-symlinks / --conditions / a preload (measured: pli-5 W10 …; the deployment's environment, NOT the repository's - item D-P5-1) ».
  - Q ajoutée au paragraphe des règles de hit : « a capture whose CLOSING quote is not its opening one (rule Q, pli-5, labelled and removable …) ».
  - **Restriction « part (1) »** (mission point 1) : « Part (1) is the BEHAVIOURAL proof for the module graph index.ts loads ONLY (all of src/, run through openGuardedClient - a real fsyncSync count in a fresh process). It does NOT prove the served bin (unlock, repair-tail, reconcile) or the course scripts, covered here ONLY by this scan; their behavioural proof - a real fsync counted under node --import on the bin - is item GARDE-FSYNC-BIN-1. »
  - **0 assertion ajoutée/retirée** (D-4 : `git diff HEAD -- durable.test.ts | grep -cE '^[-+].*assert'` = 0) ; les 4 non-vacuités et `deepEqual(hits, [])` inchangées ; tsc 0 ; ASCII (0 non-ASCII) ; largeur des commentaires ≤ 125.

### 2.2 `docs/RUNBOOK-rpc-guard.md` (sha `ae0c283a…`, C-G2d-3)
- §3 étape 6 (l.91-95) et §5 (l.158-161) : la phrase « `--after` minus `--before` spans two cycles » / « its two snapshots belong to two cycles » est REMPLACÉE par « one or both of that reconcile's snapshots carry a `cycle` other than `--cycle` (`reconcile.ts:73`, together or separately - measured: re-G2 E13 …, re-G2-delta pli-4 E13e …, `docs/G2-lot-garde-fsync-1-4.md`), and a snapshot of another cycle never subtracts against this ledger (D4, C-7) ». Résiduel « spans/belong to two cycles » = **0** (grep). La réponse reste **NO-GO** (fail-closed) ; §3.6 l.82-84 (« a `--before` or `--after` whose `cycle` is not `--cycle` ») était déjà exact, inchangé.

### 2.3 Sonde W10 (D-P5-1, NODE_PATH) — mesurée AVANT de déclarer
`scratch/probe-nodepath.mjs` (sha `9a32abf9…`) → `probe-nodepath.log` (sha `cbdd5dc3…`) : processus neuf, `node:fs.fsyncSync` compté (compte puis délègue). **R0** (NODE_PATH posé, sans patch) = **5** (flush intact) ; **W10** (`require("ledger.ts")` sous `NODE_PATH=<pkg>/src`, couture patchée) = **0** (flush éteint) ; **CONTROL** (même `require` SANS NODE_PATH) = `MODULE_NOT_FOUND` (c'est NODE_PATH qui résout le littéral nu). Le scan lit le littéral nu `"ledger.ts"` et la règle interne exige `packages/rpc-guard/(src|test)/` contigu : **aucun hit**. Déclaré comme extension de la classe (e) (node-le-runtime hors source) ; **D-P5-1** formée (§6).

### 2.4 `block_sha` — le commentaire ne change pas l'exécutable
Le bloc exécutable du scan (de `const hits` à la ligne avant la 1re `assert.ok(scanned.includes(`), extrait à l'exécution) a le sha **`72f7f4e3…`** aux deux étapes (Q seule, puis Q + commentaire (e)-env) : les éditions de commentaire n'ont PAS touché le code. Preuve : `scan-standalone-pli5.mjs` (§4.4) imprime `block_sha=72f7f4e3` sur les deux arbres.

## 3. Delta ADR `F:\tmp\gfsync1-pli5\ADR-D-FS-6-delta-pli5.md` (sha `235e5108…`) — RE-CIBLÉ sur `377c2763…`
- **12 remplacements de spans de PROSE** du fold vivant (R1-R12 ; les 15 marqueurs `<<PLI-4:>>` n'existent plus, appliqués
  par l'orchestrateur). Déjà fait par l'orchestrateur (NON retouché) : Statut/Chaîne/G7 pli 4, `<<POINTE_LOT>>`/`<<R25_POINTE_LOT>>`
  (C-G2d-2 marqueurs 5/6), (a) sans extension, **M9 déjà correct** (« ces DEUX règles : déviation D-P4-1 » ; canon =
  (A'')(i)), restriction « part (1) » au graphe de `index.ts` + renvoi **GARDE-FSYNC-BIN-1** (mission point 1 déjà
  satisfait), « redéclare le résidu exact » retiré, S6-3 pointant vers le pli 5. **Reste au pli 5** : R6 règle Q au
  paragraphe des règles (« les trois règles » → « les QUATRE règles ») ; R7 (b) par hypothèses 1+2 (l'énumération « non
  exhaustive (C-G2d-1) » devient « MESURÉE, non la définition ») ; R8 (e) étendue à l'environnement de résolution (D-P5-1),
  « (e) un patch de `node:fs` » (CV1) intact ; R9 (f) par hypothèses 3/4/5 (la réaffectation → (b) hyp 2) ; R10 S6-2 Q non
  vacante (G1/G2/B5) ; R11 S6-3 « déclaration par hypothèses FAITE au pli 5 » ; R4/R5 D-FS-5 rollover (E13e, C-G2d-3 : la
  phrase « enjambe deux cycles » ET le renvoi RUNBOOK→pli 5) ; R1 Statut, R2 chaîne (maillon pli 5), R3 R-25 (876) ; R12
  puce des corrections C-G2d-*. Clés : on ADOPTE `<<POINTE_LOT>>`/`<<R25_POINTE_LOT>>` de l'orchestrateur ; `<<SHA_PLI5>>`
  seulement comme commit nommé (chaîne, renvoi RUNBOOK) « = `<<POINTE_LOT>>` si le pli 5 est le dernier » ; 876 en clair ;
  `<<RE_G2_DELTA_PLI5>>` à la chaîne. Pas de `<<R25_PLI5>>`.
- **Contrôle d'insertion** (`scratch/apply-adr-delta-pli5.mjs`, sha `fab3ebf3…` → log `apply-adr-delta-pli5.log`,
  `mdast-util-from-markdown` du worktree ; **gardes lues dans le VRAI `F:\tmp\gfsync1-fold\insert.py`**, plus par
  transcription) : cible relue `377c2763…` (sha réimprimé — dérive visible) ; **12/12** paires `split(Ancien) − 1 === 1` ;
  **0** marqueur `<<PLI-4:` ; 15 clés G7 (dont `<<POINTE_LOT>>`, `<<R25_POINTE_LOT>>`, `<<SHA_PLI5>>`, `<<RE_G2_DELTA_PLI5>>`) ;
  gardes : 0 chemin `tmp` (regex `[a-z]:[\\/]+tmp`), 0 URL (`[a-z][a-z0-9+.-]*://`), 0 secret (mirror `SECRET_PATTERNS`),
  20 jetons `<<…>>` tous `<<[A-Z0-9_]+>>`, 1 H1, 0 « Modèle résolu », `CV1_PHRASES` 3/3, comptes **D-FS- 15→17 (≥ 7),
  GARDE-FSYNC-BIN-1 4→5 (≥ 1), reconcile.ts:43 2 (≥ 1)** (guards `>=`, non exacts) ; rendu CommonMark AVANT/APRÈS : spans de
  code prose (≥ 6 mots) APRÈS = 5 = AVANT (les 5 pré-existants légitimes), **0 span prose neuf** ⇒ aucune prose devenue
  code. Texte appliqué `scratch/adr-applied-pli5.md` (`dbf46212…`, information ; `insert.py` exigera son `--text-sha`).

## 4. Preuves (toutes sous ceinture A-7, `--test-reporter=tap`, restauration durable D-1-bis, TAP conservés REVIEW-TAP-1)

### 4.1 Rejeu des mutants sur le fichier LIVRÉ (`durable_test_sha=009c1568…` dans chaque en-tête A-12)
Copies « chemins seuls » des originaux (diff = chemins + `cmd=` seulement ; recompte A-13 des barres obliques inverses par `node`, EGAL : g2-4 26=26, g2-3 18=18, new 31=31, pli3 14=14) : `mutants-g2-4-replay.mjs` (`8854e44c…`), `mutants-g2-3-replay.mjs` (`fd84146d…`), `mutants-new-replay-tap.mjs` (`624a2302…`, version REVIEW-TAP du re-G2), `mutants-pli3-replay.mjs` (`c794b9d0…`) ; `fsync-counter.mjs` (`cceb40c1…`, identique).

| Harnais (log) | Résultat | Basculements dus au pli 5 | src / fichiers |
|---|---|---|---|
| `mutants-g2-4-replay` (`g24-final.log` `74d4b5a1…`) | **30 ; as predicted 27** | **G1, G2 TUÉS par Q** (G2 = bin servi) ; **A5** tué, `byRule=false` (Q co-tire avec abs) ; F3 tué par artefact (re-G2 O-2) ; G3-G7, B7-B9 SURVIVENT (hyp. 1/2) ; F1-F5 survivent (hyp. 3/4/5) | 13 src ==pre, 29 chemins neufs absents, 0 jonction |
| `mutants-pli3-replay` (`pli3-final.log` `82345700…`) | **24 ; as predicted 23** | **B5 `new URL(\`…${"src"}…\`)` TUÉ par Q** (capture ouverte au backtick, fermée au `"` de `${"`) ; RX3/RX4/RX5, D2/D3, B1-B4, O1, E1 survivent | byte-identical pre, 0 ENOTEMPTY |
| `mutants-g2-3-replay` (`g23-final.log` `cd7cb468…`) | **24 ; as predicted 7** | aucun (H* n'ont pas de guillemet de coupure) : H1-H17, K1-K3 TUÉS, B6-B9 (b) | byte-identical pre |
| `mutants-new-replay-tap` (`new-final.log` `8d71be0e…`) | **16 ; as predicted 11** | aucun (S8 = `"…"+"…"`, même guillemet) : S3-S6/S9 tués, S7/S8 (a)/(b) | 16 TAP conservés `out-new/` |

- **Attribution lue dans le TAP** : G1 `fired=[other@…zz-g24-g1.mjs]`, G2 `fired=[other@…bin/rpc-guard.mjs]` (Q seule) ; A5 `fired=[abs@… other@…]` (Q co-tire) ; B5 (pli3) hit `` `…/${\\"` (rule Q) `` lu.
- **Prédictions écrites AVANT** (`PREDICTIONS.md`) : conformes, à un détail assumé — j'avais écrit « g2-4 as predicted 28 » (G1, G2) en OUBLIANT que F3 reste un écart d'artefact connu (comme au re-G2) ; le mesuré **27** = 30 − G1 − G2 − F3. Aucun autre écart.
- **Deux passes** (esprit re-G2) : run1 sur `eb58bdaa…` (Q seule) puis run2 sur `009c1568…` (Q + commentaire (e)-env) — résultats IDENTIQUES (le `block_sha` prouve l'exécutable inchangé) ; les logs cités sont ceux de la passe FINALE `009c1568`.

### 4.2 Oracle 7 gates (A-3, exits directs)
- **Worktree** `oracle.sh wf` (`wf-header.log` `durable_sha=009c1568…` ; `wf-test.log` `3d746c70…`) : **7 × exit 0** ; gate:vocab 0, typecheck 0, **test 951 / 949 / 0 / 2**, lint 0, lint:ratchet 0, lang:gate 0, export:check 0 ; `durable_production_path_…` ✔.
  - Un premier passage (`w1`) avait 6 gates exit 0 et le gate `test` **rouge une fois** : `ledger_persists_and_fail_closes` (`ledger.test.ts`, fichier NON touché), `EPERM` au `rmSync` de nettoyage d'un dossier temporaire partagé (course FS Windows). TAP conservé `oracle/w1-test-RED-KEPT.log` (REVIEW-TAP-1). Rejeu sur `os-tmp` frais (`w2-test.log`) : **951 / 949 / 0 / 2** vert. Même famille que l'O-3 documenté.
- **Arbre fusionné** — oracle complet exécuté contre la pointe `68dcb50` (avant que UKEMI-REVERT-1 n'entre) : `oracle.sh mf` (`mf-header.log` `HEAD=68dcb50 MERGE_HEAD=9ea2e8b durable_sha=009c1568…` ; `mf-test.log` `8e0875f1…`) : **7 × exit 0** ; **tests 1076 / 1074 / 0 / 2** ; `durable_production_path_…` ✔, `ukemi…nonvacuous` ✔. La pointe ayant ensuite avancé à `9d285491` (9 fichiers code, dont `rpc-guard/src`), l'arbre fusionné a été re-FUSIONNÉ et re-SCANNÉ contre `9d285491` (§4.5, 0 hit) ; l'oracle complet fusionné n'a PAS été relancé contre `9d285491` (cible mouvante ; le scan couvre la question des faux positifs) — N(pointe `9d285491`) inféré ≈ 1074 (UKEMI-REVERT-1 « 16 tests », `68dcb50`=1058 → +16), arbre fusionné ≈ 1092 = N + 18 ; étiqueté INFÉRÉ, non mesuré.
  - Premier passage (`m1`, sur `68dcb50`) : 6 gates exit 0, `test` **rouge une fois** = `export_public_no_governance_no_french` (test 42, ~355 s ; sa sous-CI du miroir 491/484/1) — famine d'E/S concurrente (flake « m2 » documenté au pli 4). TAP conservé `oracle/m1-test-RED-KEPT.log`. Rejeu seul (`m2-test.log`, `os-tmp3`) : **1076 / 1074 / 0 / 2** vert, 0 échec. Confirmé au passage final `mf` (vert d'emblée).

### 4.3 R-25 (A-5) et A-6
- `r25.sh` (pathspec VERBATIM de `ci.yml:65`) : (1) forme CI committée `66f75c2...HEAD` = **858** (840 + 18, = pli 4, pli 5 non committé) ; (2) arbre de travail vs base = **876** (858 + le pli 5 : `durable.test.ts` +39/−21 ; les 21 retraits portent sur des lignes ajoutées depuis la base, suppressions vs base = 18 ; RUNBOOK exclu par `docs/**/*.md`) ; (3) pli 5 seul = `durable.test.ts` +39/−21. **876 < 1 150** (STOP A-5) et < 1 205. `<<R25_PLI5>>` = 876.
- `a6.sh` : **9/9 SAME** base `66f75c2` = HEAD `9ea2e8b` = worktree (`2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91 0e232519 3603265d cb020425`). `src/`/`bin/` INTACTS (`git diff --stat 9d85fb1 -- …/src …/bin` et `… HEAD -- …` = vides) ; `reconcile.ts` = `6e62cd6a…` (figé, C-V-4). `DELIVERED-pli5.sha256` (`386dd49f…`) : **2/2 OK**.

### 4.4 Faux positifs — 0 hit sur worktree + arbre fusionné
Scan VERBATIM (`scratch/scan-standalone-pli5.mjs`, sha `814d8a96…` = byte-identique au scanner du re-G2 ; bloc extrait à l'exécution de `durable.test.ts`) :
| Arbre | HEAD / MERGE_HEAD | Fichiers | `HITS_VERBATIM` | `new URL` lus / base ≠ import.meta.url | absolu/data: | CAND Q / RB / IP | package.json / sans ext / dotfiles |
|---|---|---|---|---|---|---|---|
| worktree (`scan-wt-final.log` `e7d8b69e…`) | `9ea2e8b` / — | 154 | **0** | 18 / **0** | 0 | **0 / 0 / 0** | 0 / 0 / 0 |
| arbre fusionné @ `68dcb50` (`scan-merge-final.log` `078d8ebf…`) | `68dcb50` / `9ea2e8b` | 160 | **0** | 18 / **0** | 0 | **0 / 0 / 0** | 0 / 0 / 0 |
| arbre fusionné @ `9d285491` (RE-SCAN, `scan-merge-9d28.log` ; pointe de clôture, avec `rpc-guard/src` de UKEMI-REVERT-1) | `9d285491` / `9ea2e8b` | 160 | **0** | 18 / **0** | 0 | **0 / 0 / 0** | 0 / 0 / 0 |

`block_sha=72f7f4e3…` (Q comprise) et `test_sha=009c1568…` sur les deux ; la règle Q (candidate mesurée) ajoute **0 hit**. `durable.test.ts` seul : `durable-alone-FINAL.tap` (`7201c8d1…`) **7/7 ok**.

### 4.5 Fusion à blanc contre la pointe fetchée
- Clone jetable `F:/tmp/gfsync1-pli5/merge-clone` (`git clone --no-hardlinks --no-checkout F:/Monark`, lecture seule). Deux fusions à blanc successives (la pointe a avancé) : @ `68dcb50` (`b48311d..68dcb50` = 0 fichier hors `docs/` ⇒ N inchangé, oracle complet §4.2) puis, à la clôture, re-fusion @ **`9d285491`** (`git fetch` + `checkout origin/lot/etude-suite` + `merge --no-commit`) ; `origin/lot/garde-fsync-1` = `9ea2e8b` ; `merge-base` = `66f75c2`. `68dcb50..9d285491` = **9 fichiers hors `docs/`** (UKEMI-REVERT-1 : `packages/rpc-guard/src/{classify,index}.ts`, `test/{bare-revert,exports}.test.ts`, `apps/sentinel/…`).
- Les DEUX fusions donnent exit 1, **exactement 2 conflits** : `UU apps/sentinel/test/ukemi-guard-record.test.ts`, `AA docs/G1-lot-garde-fsync-1.md` (UKEMI-REVERT-1 ne touche PAS `ukemi-guard-record.test.ts`). Résolution du ruling I-P3-1 : **G1 `--ours`** (sha `ff259423…` = blob de la pointe) ; **Ukemi** deux blocs, celui du lot EN DERNIER (`scratch/resolve-ukemi-pli5.mjs` `7122d13d…` = celui du re-G2 : bloc pointe 221 l., bloc lot 4 l., dernier test `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`, 0 marqueur, **sha `c05791b2…`** = re-G2 pli 3/pli 4, aux deux fusions) ; les 2 fichiers du pli COPIÉS depuis le worktree (`durable.test.ts` `009c1568…`, RUNBOOK `ae0c283a…`) ; 0 non fusionnée. **AUCUN commit.**
- **N(pointe `68dcb50`) = 1058** (inféré : `b48311d..68dcb50` docs seuls ; re-G2 avait mesuré 1058 à `b48311d`) ⇒ **1076 = 1058 + 18** (oracle fusionné @ `68dcb50`, §4.2). À la pointe de clôture `9d285491` : re-scan 0 hit (§4.4) ; N inféré ≈ 1074 (+16 tests UKEMI-REVERT-1), arbre fusionné ≈ 1092 = N + 18 (INFÉRÉ, oracle complet non relancé sur cette cible mouvante).

## 5. Consigne standard G1 — point par point
- A-1 `claude-opus-5-5[1m]` (1re ligne) ✔ ; A-2 `require.resolve('@monark/rpc-guard')` = worktree ✔ ; A-3 exits directs (oracle) ✔ ; A-4 rendu sous `F:\tmp\gfsync1-pli5\`, aucun commit, rien sur `C:`, réseau = seulement lecture doc Node (§Provenance), fetch bouchonné/clé factice/hôte `.invalid` dans les sondes ✔ ; A-5 R-25 876 < 1 150 ✔ ; A-6 9/9 + gel U-4b intact ✔ ; A-7 `env -u` des 8 clés partout ✔ ; A-11 byIntended (tueur nommé) ✔ ; A-12 en-têtes auto-identifiants par exécution ✔ ; A-13 fichiers par Write/Edit, recompte `node` des barres obliques inverses (copies = chemins seuls) ✔ ; **D-1-bis** harnais restaurent durablement (`durableWrite` = write + `fsyncSync` sur `r+` + relecture) ✔ ; **REVIEW-TAP-1** TAP des deux suites rouges conservés (`w1`, `m1`) ✔. B-*/C-*/E-* : n-a (pli test-only, aucun code servi touché). F-1 : delta ADR sans renvoi `F:\tmp`, résidus nommés avec déclencheur ; F-2 ASCII, `gate:vocab` 0 ; F-3 déviations D-P4-1/2/3 + D-P5-1 déclarées, aucune consultation R-26 due (pas de blocage).

## 6. Divergences et items formés (zéro dette nue)
- **D-P5-1 (NOUVELLE, mesurée W10)** : l'environnement de résolution (`NODE_PATH`/`GLOBAL_FOLDERS` pour `require`, `--preserve-symlinks`/`--conditions`, un préchargement) est une entrée du résolveur hors source ; déclaré en extension de la classe (e) (commentaire `:243-245`, marqueur 12) ; 0 instance dans le dépôt. **Porteur** : orchestrateur (placement final : extension (e) — retenu — ou classe distincte). **Déclencheur** : prochain lot touchant `packages/rpc-guard`, ou une course servie fixant `NODE_PATH`. `error_origin` proposé : n-a (durcissement mesuré, additif ; racine : le scan est une heuristique de SOURCE, déclarée).
- **D-P4-1/2/3** : reconduites (2 règles additives ; H12 tué / (f) résidu profond / Option B ; (e) étendue dans le test) — l'orchestrateur tranche D-P4-3 (test vs ADR) et l'Option A/B au marqueur 12.
- **GARDE-FSYNC-BIN-1** (existant) : la règle Q ferme G1/G2 (bin compris) par le SCAN ; la preuve COMPORTEMENTALE du bin servi (F1b/F5/G2/G4, `unlock` 0:2→0:0) reste cet item (vrai `fsync` compté sous `node --import`). Inchangé, renvoi.
- **`error_origin` proposés** (assignés au G7) : C-G2d-1 → **re-G2 du pli 2 + workers plis 3 et 4** (méthode d'énumération par l'exemple) + **orchestrateur** (mission « (B) exactement ») — conforme au ruling 11:45 ; C-G2d-2 → **worker pli 4** (contrôle d'insertion sans rendu du texte appliqué) ; C-G2d-3 → **re-G2 du pli 2 + worker pli 3** (sténographie de D4).

## 7. Sécurité, forme, hygiène
- Diff du pli relu : 0 URL ajoutée dans le code, 0 `api-key=`/`token=`/`bearer`, 0 `TODO/FIXME/XXX`, 0 assertion ajoutée/retirée (D-4) ; le seul `process.env` ajouté est dans un COMMENTAIRE (règle (a) inchangée) ; sondes : ledgers/fixtures sous `os-tmp`, supprimés ; enfants sous A-7 ; `fetch` bouchonné, hôte `.invalid`, clé factice ; aucune variable d'environnement affichée ; processus de course jamais touchés.
- Harnais et oracles STRICTEMENT séquentiels sur le worktree (les deux flakes = suites concurrentes/`os-tmp` partagé) ; `GIT_OPTIONAL_LOCKS=0` sur tout `git` interne ; aucune écriture dans `F:\Monark` (que des lectures `git --no-optional-locks`). Worktree à la clôture : `status --porcelain` = **exactement 2** (`durable.test.ts`, `RUNBOOK`), 0 `zz-*`, 0 jonction, gardes des 4 harnais 0 entrée, src 13 ==pre ; `merge-clone` laissé indexé (16, 0 non fusionnée, 0 commit) pour re-vérification.

## 8. Verdict du worker
Livré, non committé : `durable.test.ts` (`009c1568…`) et `RUNBOOK` (`ae0c283a…`) ; `src/`/`bin/` byte-identiques, `reconcile.ts` `6e62cd6a…` figé. **C-G2d-1** : résidu (b)/(f) déclaré par HYPOTHÈSES (listes finies, sourcées Node v24.15.0), exemples en « measured: … », « part (1) » restreinte au graphe de `index.ts` + renvoi BIN-1 ; **règle Q** ajoutée (étiquetée, retirable) — G1/G2 (bin compris) et B5 (pli3) désormais TUÉS, **0 faux positif** (worktree + arbre fusionné). **C-G2d-3** : RUNBOOK/S5-1 reformulés (E13e), réponse NO-GO inchangée. **Delta ADR RE-CIBLÉ sur le fold vivant `377c2763…`** (la mission épinglait `9f45e0fb`, régénéré par l'orchestrateur pendant la session — Constat de dérive) : 12 remplacements de spans de prose (R1-R12), **12/12 insérables**, gardes réelles d'`insert.py` (D-FS- ≥ 7, BIN-1 ≥ 1, reconcile.ts:43 ≥ 1, CV1 3/3, H1=1, 0 secret/tmp/url), **0 prose-devenue-code** (C-G2d-2 fermé), clés `<<POINTE_LOT>>`/`<<R25_POINTE_LOT>>` de l'orchestrateur adoptées, `<<SHA_PLI5>>`/`<<RE_G2_DELTA_PLI5>>` ajoutés (pas de `<<R25_PLI5>>`). **D-P5-1** (NODE_PATH) mesurée (W10) et déclarée en extension de (e). Oracle worktree 951/949/0/2, fusionné 1076/1074/0/2 = 1058 + 18 (@ `68dcb50`) ; scan de l'arbre fusionné re-lancé @ la pointe de clôture `9d285491` (0 hit) ; R-25 858/876 ; A-6 9/9 ; DELIVERED 2/2.

## Provenance
- Worker : `claude-opus-5-5[1m]` (R-1), effort max, 2026-09-23 ; contexte : mission orchestrateur (Fable 5.1) « PLI 5 GARDE-FSYNC-1 » ; réviseur : l'orchestrateur (R-21).
- **Sources primaires lues (première main, ≤ 25 mots)** — Node **v24.15.0** (la version exécutée, `node --version` ; les « package maps » de la doc 24.21 sont ABSENTES de 24.15 — mesuré « package-map false » — je cite donc la version qui régit le comportement mesuré), copies locales `F:\tmp\gfsync1-pli5\sources\node24150-*.{html,txt}` (curl, 2026-09-23T12:04:59Z, sha des HTML consignés) :
  - **[lu]** « Modules: Packages » `nodejs.org/docs/v24.15.0/api/packages.html` : les champs `package.json` que Node lit = « "name", "main", "type", "exports", and "imports" » (hypothèse 3).
  - **[lu]** « Modules: CommonJS » `…/modules.html` : « Node.js looks up the realpath of any modules it loads (that is, it resolves symlinks) » (hypothèse 4) ; enveloppe « function ( exports , require , module , __filename, __dirname ) » (hypothèse 2, `require` = paramètre) ; NODE_PATH « search those paths for modules if they are not found elsewhere », GLOBAL_FOLDERS `$HOME/.node_modules`… (D-P5-1).
  - **[lu]** « Modules: ECMAScript modules » `…/esm.html` : « Set resolved to the real path of resolved » (realpath dans ESM_RESOLVE) ; « NODE_PATH is not part of resolving import specifiers » (l'import ESM ignore NODE_PATH — D-P5-1).
  - Héritées (citées par le test, non re-lues ; [2nd] pour ce worker) : ECMA-262 §12.9.4/§12.9.6.2, WHATWG URL §4.4.
  - Le contrôle CommonMark utilise l'ANALYSEUR exécutable `mdast-util-from-markdown` (du worktree), pas une citation de spec.
- **Preuves** (sha256 préfixes, sous `F:\tmp\gfsync1-pli5\`) : `durable.test.ts` `009c1568…`, `RUNBOOK` `ae0c283a…`, `DELIVERED-pli5.sha256` `386dd49f…` (2/2 OK) ; delta RE-CIBLÉ `ADR-D-FS-6-delta-pli5.md` `235e5108…` (cible `377c2763…`), superseded `ADR-D-FS-6-delta-pli5-vs-9f45e0fb-SUPERSEDED.md` `3dbcc850…` ; applieur `apply-adr-delta-pli5.mjs` `fab3ebf3…` / log `apply-adr-delta-pli5.log` (12/12, gardes lues dans `insert.py`), texte appliqué `adr-applied-pli5.md` `dbf46212…` ; sonde W10 `probe-nodepath.mjs` `9a32abf9…` / log `cbdd5dc3…` ; scans `scan-standalone-pli5.mjs` `814d8a96…`, `scan-wt-final.log` `e7d8b69e…`, `scan-merge-final.log` `078d8ebf…` (@ `68dcb50`), `scan-merge-9d28.log` (@ `9d285491`) ; harnais `mutants-g2-4-replay.mjs` `8854e44c…`, `mutants-g2-3-replay.mjs` `fd84146d…`, `mutants-new-replay-tap.mjs` `624a2302…`, `mutants-pli3-replay.mjs` `c794b9d0…` ; logs `g24-final.log` `74d4b5a1…`, `g23-final.log` `cd7cb468…`, `new-final.log` `8d71be0e…`, `pli3-final.log` `82345700…`, TAP `out-g24/`, `out-new/`, `out-pli3/` ; oracle `wf-test.log` `3d746c70…`, `mf-test.log` `8e0875f1…` (@ `68dcb50`), rouges conservés `w1-test-RED-KEPT.log`, `m1-test-RED-KEPT.log` ; `durable-alone-FINAL.tap` `7201c8d1…`, `durable-alone-merge-9d28.tap` ; `resolve-ukemi-pli5.mjs` `7122d13d…` ; `PREDICTIONS.md` ; scripts `oracle.sh`, `r25.sh`, `a6.sh`.
- sha256 du présent rendu : calculé APRÈS sa dernière écriture et donné dans le message de clôture (un fichier ne porte pas son propre sha).

## Journal (UTC)
- 11:57:43 début ; lectures (re-G2-delta pli 4, ruling 11:45, rendu/delta pli 4, fold, test, RUNBOOK, reconcile, harnais).
- ~12:00 advisor (après orientation) : Q sans toucher la regex, prédictions avant run, (b)/(f) par hypothèses, [lu] Node de première main.
- 12:04 curl doc Node v24.15.0 + latest. 12:06-12:10 règle Q éditée, durable 7/7 (Q seule) ; PREDICTIONS.md.
- 12:10-12:20 g2-4 (27/30, G1/G2 par Q, A5 byRule=false), g2-3 (7), new (11), pli3 (23/24, B5 par Q) — passe Q seule.
- 12:16 commentaire (B) réécrit par hypothèses + restriction part(1) + renvoi BIN-1 ; RUNBOOK C-G2d-3 (E13e) ; tsc 0.
- ~12:2x advisor : angle mort NODE_PATH (je l'avais lu, laissé tomber). 12:23-12:26 W10 mesuré (R0=5, W10=0, control MODULE_NOT_FOUND) ; (e) étendue ; tsc 0 (sha final `009c1568`).
- 12:26-12:27 scans worktree/fusion (eb58bdaa) 0 hit ; merge-clone construit (pointe `68dcb50`, conflits AA+UU, G1 `--ours`, Ukemi `c05791b2…`) ; A-6 9/9 ; R-25.
- 12:27-12:30 oracle worktree w1 (test flake EPERM `ledger.test.ts`, TAP gardé), rejeu w2 951/949/0/2 ; oracle fusionné m1 (test 42 flake, TAP gardé), rejeu m2 1076/1074/0/2.
- 12:55-13:15 **passe FINALE `009c1568`** : durable 7/7, g2-4 27/30, g2-3 7, new 11, pli3 23/24 ; 2 scans 0 hit (`block_sha 72f7f4e3` inchangé) ; oracle wf 951/949/0/2, mf 1076/1074/0/2 (verts d'emblée).
- 13:0x-13:1x delta ADR pli 5 (v1) écrit contre `9f45e0fb` + applieur 18/18 ; DELIVERED 2/2 ; rendu ; **advisor avant clôture**.
- ~13:2x l'advisor signale : dérive de pointe + je n'avais pas lu `insert.py`. Mesure : la pointe a bougé (`0b19e76` puis `9d285491`, 9 fichiers code) ET **le fold a été régénéré par l'orchestrateur** (`9f45e0fb` → `377c2763`, marqueurs `<<PLI-4:>>` appliqués). Lecture de `insert.py` (gardes réelles). **Advisor de reconciliation** : re-cibler sur le fold vivant `377c2763`.
- 13:3x-13:43 re-fusion + re-scan @ `9d285491` (0 hit) ; delta RE-CIBLÉ (12 spans de prose R1-R12) ; applieur avec gardes réelles d'`insert.py` : 12/12, 0 marqueur, gardes OK, 0 prose-code ; superseded conservé ; rendu mis à jour (Constat de dérive, §3, §4.4/§4.5, Provenance) ; sha du rendu ensuite.
