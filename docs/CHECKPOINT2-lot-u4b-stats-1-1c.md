# Re-checkpoint-2 (LIVRABLE) — lot U-4b-STATS-1, micro-pli 1c (c1e9e30) — validateur-humain claude-fable-5-1, 2026-09-23

Modèle résolu : claude-fable-5-1

Rendu au fil de l'eau : `F:\tmp\cp2-u4bstats1-1c\CP2-1c.md` — sha256 `eed97909a4eb975fb9fa29aa8a5c2f6df3b41e3db1494eaede5272c5ef8341c6` (116 lignes, LF, 0 CR). Contenu intégral ci-dessous.

Note de clôture (hors fichier, mesurée après le sha) : à 05:0x Z `F:\Monark` est à `da5d6e1` avec 4 lignes de status (commits et fichiers de l'orchestrateur, lot Bell, jamais touchés par moi) ; `lot/u4b-stats-1` = `c1e9e30` inchangé.

---

Modèle résolu : claude-fable-5-1

# Re-checkpoint-2 (LIVRABLE) — lot U-4b-STATS-1, micro-pli 1c (`lot/u4b-stats-1` @ `c1e9e30` ; parent 1b `4c5fa8d` ; 1a-corr `66141fb` ; base `50f78b0`) — rendu AU FIL DE L'EAU

> Validateur-humain, contexte intact des cp-2 de 1a et 1b (`CP2-1b.md`, C-W-1..C-W-4). **Re-G2 de 1c : NON lu** (en cours, non fourni — CA-9). Le G2-delta de 1b (`docs/G2-lot-u4b-stats-1-1b.md`) est lu, comme prescrit par ma condition CA-6 du cp-2 1b. Ouverture 2026-09-23T04:47Z (horloge machine).
> Rejeux sous `F:\tmp\cp2-u4bstats1-1c\` (AM-2 ter) : `clone` (c1e9e30, puis branche jetable `cp2-merge-1c`), `clone-mut` (4c5fa8d puis c1e9e30), `tmp\` (TEMP/TMP/TMPDIR). Ceinture A-7 `env -u` des 8 clés sur tout node/npm. Aucune écriture dans `F:\Monark` ni dans un `F:\Monark-wt-*` ; `F:\Monark-wt-u4bstats1` jamais entré (une lecture `git -C … rev-parse/status` sous `GIT_OPTIONAL_LOCKS=0` à la clôture, §9).

## 0. Avancement
- [x] §1 artefacts lus ; prototype G2 + fragment `cw1` RECONSTRUITS et comparés à l'octet aux blobs `c1e9e30`
- [x] §2 oracle 7 gates `c1e9e30` ; §2 bis oracle de l'arbre fusionné
- [x] §3 mutants : VY-1..8, G2 phase F (15), cw1 before/after, v46 ré-ancré (D-1), mes VZ-1..7
- [x] §4 C-G2D-1 rejoué AVANT/APRÈS ; `report` CLI réel (CA-11) ; export ; A-6 ; R-25 des 3 segments ; fusion à blanc 3 segments
- [x] §5 D-1, ruling 826, items ouverts ; §6 checklist ; §7 décision ; §8 AM-1 ; §9 AM-2 ter — RENDU COMPLET

## 1. Artefacts lus et reconstruction
- Lus : `docs/CHECKPOINT2-lot-u4b-stats-1-1b.md` (mon cp-2 1b, intégral `F:\tmp\cp2-u4bstats1\CP2-1b.md`), `docs/G2-lot-u4b-stats-1-1b.md` (C-G2D-1..6, I-G2D-1), `F:\tmp\u4bstats1\RENDU-MICROPLI-1c.md` (173 l., intégral), `docs/PLI-lot-u4b-stats-1-1c.md` @ `c1e9e30`, `F:\tmp\g2-u4bstats1\logs\g2-proto-1b.diff`, `F:\tmp\u4bstats1\{DELIVERED-1c.sha256, 1c.patch, cw1-tests.fragment.ts, cw1-mutants.mjs, mutants-1c.mjs, mutants-1c-vs-v46.diff}`, le diff complet `4c5fa8d..c1e9e30` (outil +3/−2, test +172/−1, PLI +173).
- **PLI committé = rendu du worker à l'octet** : `git show c1e9e30:docs/PLI-lot-u4b-stats-1-1c.md | sha256sum` = `f7a923b3…` = `sha256sum RENDU-MICROPLI-1c.md` (aucune retouche non marquée — CA-8).
- **Prototype appliqué à l'octet, prouvé par RECONSTRUCTION** (pas par lecture de hunks) : sur `clone-mut` @ `4c5fa8d` (outil `07e25e19…`, test `e7742dc9…`), `git apply --check` puis `git apply` de `g2-proto-1b.diff` (sha `137b0b11…` = G2) donne outil **`65b0d8f9…`**, test `2ea990ba…` (= §1 du rendu) ; puis `cat cw1-tests.fragment.ts >>` (sha `ceb381f0…`) donne test **`f8d8f3a6…`** ; `cmp` avec `git show c1e9e30:<fichier>` : **tool IDENTICAL, test IDENTICAL**. Restauration `git checkout -- .`, status 0.
- **DELIVERED-1c** (`d24db9d9…`) : `sha256sum -c` sur le clone @ `c1e9e30` = **OK ×2**. `1c.patch` (`14a6f294…`) : `git apply --cached --check` sur un index temporaire lu depuis `4c5fa8d` = OK ; l'arbre obtenu diffère de l'arbre de `c1e9e30` d'UN fichier, `docs/PLI-lot-u4b-stats-1-1c.md` (+173, acte de l'orchestrateur), rien d'autre.
- Le hunk outil du commit = les 2 lignes du prototype (import `sep` ; `const outside = rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)` ; `if (rel === "" || !outside) fail(…)`) — lu dans `git show c1e9e30 -- scripts/census/u4b/u4b-hyp.mjs`.

## 2. Oracle 7 gates — REJOUÉ (`clone` @ `c1e9e30`, `oracle-1c\`, 04:49Z)
**7 × exit 0** (gate:vocab, typecheck, test, lint, lint:ratchet, lang:gate, export:check) ; **tests 960 / pass 959 / fail 0 / cancelled 0 / skipped 1** (skip pré-existant nommé `u4b_labels_replay_via_main_real_artifact`) ; ratchet **69/69** ; en-tête : outil `65b0d8f9…`, test `f8d8f3a6…`, node v24.15.0, status vide. Les 9 tests du pli (7 `g2proto1b_*` + 2 `cw1_*`) ✔ dans le run complet. = attendu 960/959/0/1 = rendu §3 = message de commit.

### 2 bis. Oracle de l'arbre FUSIONNÉ (`cp2-merge-1c` = `92256d8`, §4.5) : **7 × exit 0 ; 1016 / 1014 / 0 / 2** (2 skips nommés pré-existants : `sentinel_run_releases_chainstack_lock_on_sigterm` win32, `u4b_labels_replay_via_main_real_artifact`) ; 9 tests du pli ✔ ; outil `65b0d8f9…` sur l'arbre fusionné.

## 3. Mutants (`clone-mut` @ `c1e9e30`, `mutants-chain.log`, 04:53:07Z à 04:54:17Z ; outil restauré `65b0d8f9…` après chaque harnais ; status 0 ; 0 fichier `..u4b*` à la racine)
Copies « chemins seuls » vérifiées par `diff` contre les sources (TREE vers mon `clone-mut`, sorties vers mon dossier, TEMP vers `F:\tmp\cp2-u4bstats1-1c\tmp`) ; `grep Monark|/u4bstats1/` sur les copies = 0 hors le commentaire d'usage de la ligne 8 (`mk-copies.mjs`, sha `d38537d1…`).

| Harnais | Résultat mesuré | Concordance |
|---|---|---|
| **VY-1..8** (mon harnais cp-2 1b `ad21d889…`, copie `e09aa5ba…`) | **8/8 tués** : VY-1/3/4/5/8 byIntended ; **VY-2** par `g2proto1b_h4_boundaries_and_guards` ; **VY-6** par `g2proto1b_clause359_pooled_non_outside_the_condition_q1a` ; **VY-7** par `g2proto1b_out_with_dotdot_named_child_is_inside_the_repository` (refus NOMMÉ `HypError`, plus seulement `EEXIST`) | verdict + `mutated_sha256` + ensemble des tests rouges **identiques 8/8** au `vy-mutants-1c-final.json` du worker |
| **cw1 `after`** (harnais worker `eeb1a497…`, copie `5abd1153…`) | **4/4 KILLED(byIntended)** (M1/M2/M3 par `cw1_h4_boundary_just_above_5_over_100_is_NON` ; M4 par `cw1_verdicts_membership_on_the_written_report_t17`) | identiques 4/4 au worker |
| **cw1 `before`** (rejoué par moi : `4c5fa8d` + prototype seul, test `2ea990ba…`) | **0/4 tués, 4 SURVIVENT** : les deux tests `cw1_*` sont NÉCESSAIRES (M1..M3 : seuil de décision 5/99, 6/100, 10/100 invisibles au digest T17 ; M4 : verdict hors ensemble fermé dans le rapport ÉCRIT) | = worker (4 survivants) |
| **v46 ré-ancré** (worker `mutants-1c.mjs` `7ca83ff9…`, copie `94a0600c…`), mode `full` | **46/46 KILLED(byIntended)** ; M40 rouge sur T19 (+ `g2proto1b_out_…`) | verdict + `mutated_sha256` + ensemble rouge **identiques 46/46** au `mutants-result-full-1c.json` ; `declarative` = les 2 mêmes tests (`g2proto1b_labels_deficit_base_no_price_non_usdt_only`, `cw1_h4_boundary_…`), chacun discriminé ailleurs (D13 G2 ; CW1-M1..M3) |
| **G2 phase F** (harnais G2 `g2-mutants-1b-1c.mjs` `8400251b…`, copie chemins seuls `g2-mutants-F-cp2.mjs` `68b59b03…`, sentinelle E inexistante conservée), rejoué APRÈS l'avis de l'advisor (05:0x Z, `g2F-F.{log,json}`) | **15/15 KILLED(byIntended)** (D02, D03, D04, D07, D08, D11, D12, D13, D15, D16, D19, D21, D22, D24, D23) ; outil restauré `65b0d8f9…`, status 0 | verdict + `mutated_sha256` + ensemble rouge **identiques 15/15** au `g2-mutants-1b-1c-F.json` du worker |
| **Mes VZ-1..7** (`vz-mutants.mjs` `6099ca4c…`, sur `outOfRepo` après C-G2D-1 et sur la frontière 5/99 vs 5/100) | tableau §3.1 | — |

### 3.1 Mutants propres VZ (1 édition exacte chacun ; `vz-mutants.{log,json}`)
| VZ | Mutation | Résultat | Lecture |
|---|---|---|---|
| VZ-1 | `outside` : branche `rel === ".."` retirée | **SURVIT** | **équivalent de comportement** : `rel === ".."` signifie `--out` = le répertoire parent du dépôt, qui existe toujours, donc refus `already exists` (original) contre refus `is inside the repository` (mutant) : exit 1 sans écriture dans les deux cas ; seul le MESSAGE change. Observation, non compté. |
| VZ-2 | `startsWith(".." + sep)` remplacé par `startsWith("..")` (RÉGRESSION C-G2D-1) | **tué** (`g2proto1b_out_with_dotdot_…`) | le défaut C-G2D-1 est pinné : sa réintroduction est rouge |
| VZ-3 | `isAbsolute(rel)` retiré | **SURVIT** | **fail-CLOSED, non exercé** : `path.relative` ne rend un absolu que pour un `--out` sur un AUTRE lecteur ; TEMP sur F: (AM-2 ter) et le chemin servi (`F:/course-ukemi/offline/…`, dépôt `F:\Monark`, RUNBOOK :440/:501) sont sur le même lecteur, donc jamais atteint en course. Sous le mutant, un `--out` cross-drive légitime serait REFUSÉ (« inside the repository »), jamais écrit dans le dépôt. Test tueur sans écriture sur C: : `--out C:\<inexistant>\r.json` doit échouer sur « parent directory does not exist », pas sur « inside the repository » (assertion sur le message) ; ma sonde §4.1 (4) l'a fait à la main : message correct sur `c1e9e30`. Item **I-V-1** (test-only, §5.3), non bloquant. |
| VZ-4 | `sep` remplacé par `"/"` | **tué** (T17 + tous les tests écrivant sous `tmpdir()`) | sur Windows `relative()` rend `..\`, tout `--out` hors dépôt deviendrait « inside » : pinné |
| VZ-5 | seuil de décision 5/101 (frontière par en DESSOUS : 1/20 donne NON) | **tué** (`g2proto1b_h4_boundaries_and_guards`) | frontière pinnée par en dessous (1/20 = OUI) |
| VZ-6 | `H4_THRESHOLD` = `{1n, 20n}` (même valeur, autre étiquette) | **tué** (`cw1_h4_boundary_…` : `threshold === "5/100"` ; + T17 digest) | l'étiquette RAPPORTÉE est pinnée |
| VZ-7 | `> 0` remplacé par produit croisé `+ 1n` | **SURVIT** | **équivalent arithmétique** : pour den = 100, tout écart de produits croisés `f.num·100 − 5·f.den` est multiple de 5, donc `> 0` équivaut à `> 1`. Non compté. |
Bilan VZ : 4 tués, 3 survivants dont 2 équivalents (VZ-1 comportement, VZ-7 arithmétique) et **1 survivant réel fail-closed hors chemin servi (VZ-3)** : item I-V-1, pas de correction bloquante. Avec le prototype + `cw1`, la frontière H-4 est désormais pinnée des DEUX côtés (1/20 donne OUI par `g2proto1b_h4_…`, 5/99 donne NON par `cw1_h4_…`) et par en dessous (VZ-5).

## 4. C-G2D-1 AVANT/APRÈS, CA-11 durci, export, A-6, R-25, fusion à blanc
### 4.1 Défaut C-G2D-1 rejoué (`probe.sh`, `probe-BEFORE.log` / `probe-AFTER.log`, même `clone-mut`, fixtures committées, `env -u`)
| Sonde `--out` | AVANT `4c5fa8d` (outil `07e25e19…`) | APRÈS `c1e9e30` (outil `65b0d8f9…`) |
|---|---|---|
| (1) `<ROOT>\..x` | **exit 0, fichier `..x` ÉCRIT à la racine du dépôt** (`git status` = `?? ..x`, 7 712 octets) : **défaut reproduit** ; retiré par moi | **exit 1 « is inside the repository »**, `..x` absent, status vide |
| (2) `<ROOT>\..u4b-probe\r.json` | exit 1 « parent directory does not exist » (refus par la 2e garde seulement) | exit 1 « is inside the repository » (refus par la garde nommée) |
| (3) `<ROOT>\scripts\x.json` | exit 1 « inside » | exit 1 « inside », rien écrit |
| (4) `C:\no-such-dir-u4b-cp2\r.json` (autre lecteur, parent absent) | exit 1 « parent directory does not exist » | idem ; `isAbsolute` opère, 0 écriture sur C: |
| (5) `F:\tmp\cp2-u4bstats1-1c` (= `..` exactement) | exit 1 « already exists » | idem |
| (6) `report` réel (4 fixtures) vers hors dépôt | exit 0, `5179f3de…` (= mon cp-2 1b, = fumée worker) | exit 0, **`21daeaec…` = octets IDENTIQUES au `report-1c\hyp-report-e2.json` du worker** (`cmp`) |
| (7) 2e `report` même `--out` | exit 1 « already exists (never overwritten) », fichier intact | idem |
- Rapport APRÈS : **`body_digest` `49b138c3…`** (= constante T17 = 1b), **`provenance.tool.sha256_lf` `65b0d8f9…`**, `clause_359 = {true, 0, true, "OUI"}`, H-3 OUI/OUI/UNDER_CALIB/UNDER_CALIB/poolé OUI, H-4 NON/NON seuil `5/100`, H-6 OUI ; 0 jeton « go », 0 chemin absolu. `diff` BEFORE/AFTER = **une seule ligne** (`sha256_lf` `07e25e19…` vers `65b0d8f9…`) : la provenance est hors digest (I-G2D-1 du G2 confirmé par mesure).
### 4.2 CA-11 (durci) : composition EXÉCUTÉE depuis les artefacts committés réels (`U4b-scores-e2.jsonl`, `U3-inputs.jsonl`, `U3-realized.jsonl`, `U4b-oracle-path-e2.jsonl`) jusqu'au fichier de sortie consommé (`body.clause_359`), par T17, par `cw1_verdicts_membership_on_the_written_report_t17` (lit le fichier ÉCRIT) et par mon rejeu CLI (6). Consommateur aval = application mécanique par l'orchestrateur à l'étape 6d (RUNBOOK :440 « précondition d'ordre C-4 : lot fusionné + sha LF au sidecar 6 AVANT 6a », :501) ; le sidecar de course en est à « Sidecar 3 (suite) », donc statut **upcoming** maintenu jusqu'à la première 6d (I-4). Registre public @ `c1e9e30` : `git grep` `u4b-hyp|U-4b-STATS-1` hors docs/scripts/tests = `scripts/export-exclude-tests.json` seulement ; **export réel rejoué** (`export-c1e9e30\`, exit 0) : 328 fichiers, manifest **`5d5f8fbd…`** = cp-2 1b = G2 = worker ; `diff -r` avec mon export `4c5fa8d` = **0 ligne** ; 0 fichier `u4b-hyp*`, `scripts/census/**` ou RUNBOOK présent ; 0 mention `u4b-hyp` ; les 4 fichiers mentionnant `scripts/census` (`ukemi-strata.ts`, `record.ts`, `PROVENANCE-u3.md`, `adapter-book.ts`) sont des commentaires pré-existants, identiques à 1b.
### 4.3 A-6 : **13/13** invariants recomputés LF depuis les blobs `c1e9e30` = `frozen-before.txt` (mesuré à `50f78b0`). Sur l'arbre FUSIONNÉ `92256d8` : 11/13 ; les 2 écarts (`u4b-select-episode.mjs`, `ADR-U4b-calibration-episode-frais.md`) viennent du TRONC (G7 U-4b-1b-3 `b9eb62b`/`f28a184`, G7 HARNESS-DESC-1 `bb41b6d`), pas du lot (`c1e9e30` = `50f78b0` pour ces 2 fichiers) ; les 9 gelés du prereg §2 (tableau `PLAN-u4b-prereg.md:114-124` lu @ `c1e9e30`, lignes 1-9 : `u4b-scores.mjs`, `u4b-reduce.mjs`, `record-u4b-calib.mjs`, `wadray.ts`, `abi.ts`, `l1-split.ts`, `rpc.ts`, `calib-digest.ts`, `u3-realized.mjs`) sont 9/9 sur l'arbre fusionné ; les 4 autres du gel A-6 du lot (sélecteur, `u4-oracle-path.mjs`, prereg, ADR-U4b) sont un gel de LOT, hors prereg. Pas un défaut du pli ; à consigner au G7 (le gel A-6 de STATS-1 a été mesuré avant le G7 1b-3).
### 4.4 R-25 (pathspec VERBATIM `ci.yml:65` @ `c1e9e30`, qui EXCLUT `docs/**/*.md`) sur les COMMITS : `50f78b0..66141fb` = **735** (+733/−2) ; `66141fb..4c5fa8d` = **826** (+813/−13) ; `4c5fa8d..c1e9e30` = **178** (+175/−3 : test 172/1, outil 3/2 ; PLI exclu). Aucun ne dépasse 1 205 ; d'un bloc `50f78b0..c1e9e30` = **1 707** mesuré (+1 705/−2, 4 fichiers) > 1 205, donc la fusion en 3 segments first-parent est OBLIGATOIRE (C-W-2 mise à jour à 3).
### 4.5 Fusion à blanc (`clone`, branche jetable `cp2-merge-1c` sur `origin/lot/etude-suite` fetchée = **`38c767e`**, `merge-blanc.log`) : trois `merge --no-ff` réels `66141fb`, `4c5fa8d`, `c1e9e30` : **0 conflit ×3** ; `git log --first-parent` = 3 merges ; R-25 par segment first-parent (même pathspec) = **735 / 826 / 178** ; les 5 blobs du lot + PLI sur l'arbre fusionné = `c1e9e30` (`cmp` ×5) ; oracle §2 bis vert. `git log 50f78b0..38c767e -- <5 fichiers du lot>` = vide.

## 5. D-1, ruling 826, items
### 5.1 D-1 (ré-ancrage M40) : **acceptée comme déviation nécessaire et minimale**. (i) `diff mutants.mjs mutants-1c.mjs` = **1 ligne** (83 : ancre `from` de M40), identique au `mutants-1c-vs-v46.diff` du worker ; `to` (`if (false) fail(`) et `intended` (T19) inchangés ; (ii) nécessité prouvée statiquement : ancienne ancre 1 fois dans l'outil `4c5fa8d`, **0 fois** dans `c1e9e30` ; nouvelle ancre 1 fois ; (iii) `mutants.mjs` reste `9722de92…` ; (iv) M40 tue encore (T19 + `g2proto1b_out_…`) ; 46/46 identiques au worker. Condition : l'ADR du lot (C-W-3) nomme `mutants-1c.mjs` `7ca83ff9…` comme harnais de rejeu v46 pour tout arbre contenant C-G2D-1 (sinon la « consigne de rejeu » §8.3-5 du rendu est un dû nu).
### 5.2 Vocabulaire 826 : **oui, cela règle ma réserve.** Mon cp-2 1b disait déjà (§4, CA-3) : « borne de MISSION, pas un gate (STOP A-5 1 150, CI 1 205) ; déviation déclarée D-4 ; pas une dérogation R-22 ». La lecture G7 « dépassement déclaré de la cible de mission (D-4) » (CHANTIERS :958, ruling journalisé) est la même. Condition de forme : le journal G7 porte STOP 1 150 / CI 1 205 comme gates NON touchés, `error_origin` = dimensionnement du plan (déjà assigné au cp-2 1a). Pas d'ESCALADE.
### 5.3 Ce qui reste (chacun avec porteur + déclencheur ; aucun dû nu)
| Item | Objet | Porteur | Déclencheur | Preuve d'ouverture |
|---|---|---|---|---|
| C-W-2 (mise à jour) | fusion en **3** segments first-parent 735 / 826 / 178 ; preuve `git log --first-parent` + R-25 par segment | orchestrateur | fusion | §4.5 (rejouée à blanc, 0 conflit) |
| C-W-3 + C-G2D-2 (ii) | ADR du lot : Q-1 (a) daté, `:207` vers `:402`, chiffres 735/826/178, mutants 46 (via `mutants-1c.mjs` `7ca83ff9…`) + 15 G2 F + 8 VY + 4 CW1 (+ 7 VZ de cet avis) ; RUNBOOK `:501` « demande formée Q-1 du G1 » vers « ruling Q-1 (a), CHANTIERS 2026-09-22 » + phrase « poolé NON : porté à l'investisseur avant l'application de U-6 » | orchestrateur | insertion / G7 (docs, hors R-25) | `git show c1e9e30:RUNBOOK` :501 porte encore « demande formée Q-1 du G1 » |
| I-G2D-1 | sidecar 6 = sha LF du blob HEAD fusionné = **`65b0d8f9…`** (mesuré §4.1 (6)) ; pli fusionné AVANT 6a (RUNBOOK :440 C-4) | orchestrateur | étape 6a | sidecar de course à « Sidecar 3 (suite) » ; aucune ligne 6 |
| C-W-4 | procurement JKK (ISBN/DOI ou « non requis ») ; I-2 versement A&B ; I-G2-2 au G0 NARABI-OPS-1d | orchestrateur | G7 / G0 | inchangé par le pli |
| **I-V-1** (nouveau, test-only) | pinner `isAbsolute(rel)` : `--out C:\<inexistant>\r.json` donne `HypError` « parent directory does not exist » (pas « inside the repository »), 0 écriture (VZ-3) | worker, au prochain pli test-only du lot OU au prochain toucher d'`outOfRepo` | premier des deux | `vz-mutants.log` VZ-3 SURVIVED |
| Note G7 | A-6 sur l'arbre fusionné = 11/13 par mouvements du TRONC (1b-3, HARNESS-DESC-1) ; 9/9 prereg §2 | orchestrateur | journal G7 | §4.3 |

## 6. Checklist (règle par règle)
| Règle | Verdict | Preuve |
|---|---|---|
| **CA-1** | conforme | C-W-1 (a)/(b)/(c) FERMÉES par des tests nommés qui tuent les mutants qui les motivaient : (a) VY-6 par `g2proto1b_clause359_…` ; (b) VY-2 par `g2proto1b_h4_…` (1/20 donne OUI) et CW1-M1..M3 par `cw1_h4_…` (5/99 donne NON) ; (c) D24 par `g2proto1b_verdicts_…`, CW1-M4 par `cw1_verdicts_…` sur le rapport ÉCRIT. C-G2D-1..6 fermées (15/15 G2 phase F rejoués PAR MOI, identiques au worker ; D19/D23 recoupés par mon VZ-2 et VY-7 ; D15/D16 par VY-6 ; D04 par VY-2/VZ-5). Chaque tâche du pli est falsifiable et a été falsifiée AVANT (`cw1 before` 0/4, sonde (1) exit 0) puis APRÈS. |
| **CA-2** | conforme | aucune décision de valeur nouvelle : C-G2D-1 est un correctif de garde (fail-closed renforcé), C-G2D-6 tranche un item technique (consommer `VERDICTS`), la frontière H-4 reste un seuil de RAPPORT (prereg :106). |
| **CA-3** | conforme, C-W-3 reconduite | 13 gelés intacts ; prereg non modifié ; ADR du lot toujours à insérer avec les chiffres à jour ; 826 = dépassement déclaré de la cible de mission, aucun gate suspendu (§5.2). |
| **CA-4** | conforme | mono-worker ; G2 instance séparée ; validateur ; pas de fan-out. |
| **CA-5** | conforme | MAST : « perte d'historique » (coupure 429 02:01 à 04:23Z) traitée par sha des octets avant/après (§3 bis du rendu), vérifié par moi : mêmes octets `65b0d8f9…`/`f8d8f3a6…` que ceux que j'ai rejoués ; « dérive de vérification » écartée par reconstruction à l'octet (§1). |
| **CA-6** | conforme SOUS CONDITION | oracle + 46+15+8+4+4+7 = 84 mutants + CLI + export rejoués par moi ; **re-G2 de 1c non rendu à l'heure de cet avis**, donc acceptation conditionnée à un re-G2 rendu et concordant au G7 (même forme qu'en 1b). |
| **CA-7** | conforme | aucun dû nu : 6 items de §5.3 avec porteur + déclencheur ; VZ-3 devient I-V-1 ; VZ-1/VZ-7 déclarés équivalents avec la raison. |
| **CA-8** | conforme | rendu ligne 1 `claude-opus-5-5[1m]` ; générateur, relecteur et validateur distincts ; PLI = rendu à l'octet ; `error_origin` (d) ci-dessous ; provenance du rapport = blob réel. |
| **CA-9** | conforme | clones propres, node_modules isolés (junctions, `@monark` repointé) ; reconstruction du prototype ; 77 mutants rejoués (46 v46 + 15 G2 F + 8 VY + 4+4 cw1) + 7 propres ; CLI AVANT/APRÈS ; export ; A-6 ; fusion à blanc ; re-G2 non lu. |
| **CA-10** | conforme | aucun argument de vitesse ; 3 segments mesurés séparément (178 pour le pli). |
| **CA-11 (durci)** | conforme, statut **upcoming** | §4.2 : composition exécutée depuis les artefacts committés réels jusqu'au fichier consommé ; refus `<ROOT>/..x` rejoué AVANT (défaut) / APRÈS (refus, 0 écriture) ; export identique ; « built » à la première 6d (I-4). |

### (d) `error_origin`
- C-G2D-1 (code) : worker 1b (garde `startsWith("..")` sans séparateur) ; attrapé par le G2, pas par mon cp-2 1b (VY-7 avait effleuré la garde d'écrasement, pas celle du `..x`) : AM-1 « manqué ».
- C-G2D-2 (ii) RUNBOOK :501 : orchestrateur (RUNBOOK-DELTA antérieur au ruling) ; docs, au G7.
- D-1 : conséquence mécanique du correctif C-G2D-1 sur l'ancre M40 ; aucune faute.
- VZ-3 (I-V-1) : trou de preuve d'auteur (prototype G2 + worker) sur une branche non exercée ; fail-closed, non bloquant.
- Aucun incident d'infrastructure sur mes rejeux (0 NUL, 0 écriture sur C:, coupure 429 du worker sans effet mesuré).

## 7. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée = §5.3 : C-W-2 (3 segments), C-W-3 + C-G2D-2 (ii), I-G2D-1, C-W-4, I-V-1, note G7 A-6), **conditionnée à un re-G2 de 1c rendu et concordant au G7 (CA-6)**. Pas d'ESCALADE-INVESTISSEUR : aucune décision de valeur ; 826 n'est pas une dérogation de gate (§5.2) ; ma checklist et le G7 annoncé concordent.
Le pli lui-même (2 fichiers, 178) est propre : prototype G2 appliqué à l'octet, les 3 survivants de mon cp-2 1b (VY-2, VY-6, VY-7) tués, le défaut C-G2D-1 reproduit puis fermé, `body_digest` inchangé, provenance = nouveau blob.

## 8. AM-1
- Attrapé : rien de nouveau de bloquant. VZ-3 (`isAbsolute` non pinné, fail-closed) ; VZ-1/VZ-7 équivalents documentés ; R-25 vérifié sur les COMMITS (le PLI +173 est bien exclu par le pathspec, ce que le worker avait mesuré sur un arbre sans le PLI) ; A-6 11/13 sur l'arbre fusionné expliqué par le tronc ; D-1 minimale prouvée (1 ligne, ancres 0 fois / 1 fois).
- Manqué (mon cp-2 1b, signal a posteriori = G2-delta 1b) : **C-G2D-1**, un défaut de CODE réel (écriture dans le dépôt via `..x`) que ma checklist n'a pas vu ; j'avais muté la garde d'écrasement (VY-7) et conclu « équivalent grâce à `wx` » sans sonder la garde de périmètre par un chemin adversarial. Leçon : pour toute garde de chemin, sonder les formes limites (`..x`, `..`, absolu, autre lecteur, séparateur) AVANT de la déclarer pinnée ; c'est ce que VZ-1..4 font désormais.
- Manqué également : C-G2D-3/4/5 (gardes H-4/H-6/census non assertées), trous de preuve « présence de code sans test », même leçon qu'au cp-2 1a.

## 9. Preuve AM-2 ter et modèle
- `F:\Monark` : AVANT (04:47:14Z) HEAD `2c276bb`, `git status --porcelain` = 3 lignes (` M docs/adr/ADR-T1aii-…`, `?? docs/PLI-lot-bell-shortpage-1b*.md` : fichiers de l'orchestrateur, lot Bell, jamais touchés) ; APRÈS (04:56:39Z) HEAD `38c767e`, status **vide** (commits de l'orchestrateur entre-temps) ; blobs `c1e9e30` outil `65b0d8f9…` / test `f8d8f3a6…` identiques AVANT/APRÈS ; `lot/u4b-stats-1` = `c1e9e30` inchangé. `F:\Monark-wt-u4bstats1` : HEAD `c1e9e30`, status 0, jamais entré (lecture `git -C` seule à la clôture).
- **Incident sans effet, consigné** : à 04:52:13Z j'ai lancé `git fetch -q .` DANS `F:\Monark` (commande d'orientation avant le fetch dans mon clone) ; c'est un no-op sur les refs (fetch de soi-même, aucun refspec) mais il a réécrit `F:\Monark\.git\FETCH_HEAD` (mtime 05:52:13 +0100 = 04:52:13Z, 44 octets). Aucune ref, aucun fichier de l'arbre modifié (`git status` vide et blobs identiques APRÈS, ci-dessus). C'est une écriture dans `.git` hors clause AM-2 (qui n'autorise `git` que dans les clones jetables) : déviation déclarée, `error_origin` validateur.
- Rejeux : `F:\tmp\cp2-u4bstats1-1c\{clone (c1e9e30 puis cp2-merge-1c 92256d8), clone-mut (4c5fa8d puis c1e9e30, status 0), tmp\ (249 entrées, tout sur F:)}` ; `%LOCALAPPDATA%\Temp` : 0 entrée `u4b-hyp|cp2-`. Écritures uniquement sous `F:\tmp\cp2-u4bstats1-1c\`.
- Journaux : `am2-before.log`, `am2-after.log`, `oracle-1c\` + `oracle-1c.stdout`, `oracle-merged-1c\` + `.stdout`, `probe.sh` + `probe-{BEFORE,AFTER}.log`, `hyp-report-e2-{BEFORE-4c5fa8d,AFTER-c1e9e30}.json` (`5179f3de…` / `21daeaec…`), `mutants-chain.{sh,log}`, `vy-mutants-1c.{mjs,log,json}`, `cw1-{before,after}.{log,json}`, `vz-mutants.{mjs,log,json}`, `g2-mutants-F-cp2.mjs` + `g2F-F.{log,json}` + `g2F.stdout`, `v46-run-1c.log` + `v46-result-1c.json`, `mutants-1c-cp2.mjs`, `cw1-mutants-cp2.mjs`, `mk-copies.mjs`, `merge-blanc.{sh,log}`, `export-and-merged-oracle.{sh,log}`, `export-c1e9e30\` + `export-diff-vs-1b.txt`, `g2-proto-1b.diff`, `oracle.sh`, `mk-nm.ps1`/`rm-nm.ps1`.
- Modèle résolu (R-1) : `claude-fable-5-1`.

---

sha256 `F:\tmp\cp2-u4bstats1-1c\CP2-1c.md` = `eed97909a4eb975fb9fa29aa8a5c2f6df3b41e3db1494eaede5272c5ef8341c6`
