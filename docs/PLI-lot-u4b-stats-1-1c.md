Modèle résolu : claude-opus-5-5[1m]

# Micro-pli 1c — lot U-4b-STATS-1 (C-G2D-1..6 + C-W-1) — rendu AU FIL DE L'EAU

> **En-tête A-12.** Worker `claude-opus-5-5[1m]` (effort max), 2026-09-23. Worktree `F:\Monark-wt-u4bstats1`, branche `lot/u4b-stats-1` @ `4c5fa8dcc71d54d07250cc025331f2c8b7b02f65` (segments 1a `564292d`, 1a-corr `66141fb`, 1b `4c5fa8d` ; base `50f78b0`). Ouverture `date -u` : 2026-09-23T01:42:20Z. Temporaires : `F:\tmp\u4bstats1\` uniquement. **0 commit, 0 workflow (R-20)** ; aucun autre worktree ni `F:\Monark` touché. Ceinture `env -u` des 8 variables payantes sur toute commande node/npm ; aucune variable affichée (A-7).

## 0. Avancement
- [x] §1 prototype : sha vérifié, `git apply --check` puis `git apply` VERBATIM
- [x] §2 couverture C-W-1 (VY-2 / VY-6 / `VERDICTS`) + tests `cw1_*` si manque
- [x] §3 oracle 7 gates (+ §3 bis reprise après coupure 429)
- [x] §4 mutants : G2 phase F (15), VY-1..8, worker v46, cw1 (4)
- [x] §5 R-25 ; §6 A-6 + sha outil ; §7 export ; §8 DELIVERED + restes — RENDU COMPLET (sections dans l'ordre d'exécution : §4 mutants avant §3 oracle). Clôture `date -u` : 2026-09-23T04:31Z (dernier contrôle de l'arbre contre `DELIVERED-1c` à 04:30:46Z : OK ×2, HEAD `4c5fa8d`, les 2 `M` seulement).

## 1. Prototype G2 appliqué verbatim (journal `F:\tmp\u4bstats1\apply-1c.log`)
- `sha256sum F:\tmp\g2-u4bstats1\logs\g2-proto-1b.diff` = `137b0b11b551b0bebe47b7cd1146d8b5cf6f12564272dbbb399c2a7dd98f4b07` (= attendu).
- Avant : `git status --porcelain` vide, HEAD `4c5fa8d` ; blobs = worktree (test `e7742dc9…`, outil `07e25e19…`), LF (attribut `eol=lf`, 0 CR).
- `git apply --check --verbose` exit 0 ; `git apply --verbose` exit 0 (« Applied patch … cleanly » ×2). Aucune retouche.
- Après : `M apps/sentinel/test/u4b-hyp.test.ts` (+130/−1), `M scripts/census/u4b/u4b-hyp.mjs` (+3/−2) = +133/−3.
- sha256 (octets = LF, 0 CR) : test `2ea990ba163707fe167e7436d304583fc567e8e7bd7014694027789cf9bb9de3` ; **outil `65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25` = valeur du prototype G2 (`65b0d8f9…`)**.
- Fichier de test seul après application : `node --test --test-reporter=tap apps/sentinel/test/u4b-hyp.test.ts` → **37/37**, exit 0 (`t-1c-proto.tap`) ; aucune sonde `..u4b*` laissée à la racine du worktree.

## 2. Couverture C-W-1 — mesurée AVANT tout test `cw1_*` (état = prototype seul)
### 2.1 `vy-mutants.mjs` du cp-2, copie CHEMINS SEULS (`vy-mutants-1c.mjs`, sha `560c469e…` ; source `ad21d889…` ; `diff` = TREE, TEMP, 2 sorties ; générée par `mk-vy-copy-1c.mjs`, comptes d'occurrence vérifiés) — journal `vy-mutants-1c-proto.{log,json}` :
| VY | cp-2 @4c5fa8d | prototype seul | test tueur |
|---|---|---|---|
| VY-1 `&&`→`\|\|` | tué | KILLED(byIntended) | T20 `u4b_hyp_labels_no_quorum…` |
| **VY-2** H-4 `> 0`→`>= 0` | **SURVIT** | **tué** (KILLED-BY-OTHER : l'`intended` du cp-2 = T14, non repointé) | `g2proto1b_h4_boundaries_and_guards` (1/20 ⇒ OUI) |
| VY-3 H-6 `lag >= 3` | tué | KILLED(byIntended) | T16 (+T15, T17) |
| VY-4 `canon` non trié | tué | KILLED(byIntended) | T17 |
| VY-5 rapprochement retiré | tué | KILLED(byIntended) | T14 |
| **VY-6** poolé constant `"OUI"` | **SURVIT** | **tué** (KILLED-BY-OTHER, `intended` cp-2 = T20) | `g2proto1b_clause359_pooled_non_outside_the_condition_q1a` |
| VY-7 garde « already exists » retirée | survit (équivalent `wx`) | **tué** (KILLED-BY-OTHER) | `g2proto1b_out_with_dotdot…` (refus NOMMÉ `HypError`) |
| VY-8 multi-appel `> 2` | tué | KILLED(byIntended) | T13 (+T14, T17, `g2proto1b_h4…`) |
Outil restauré `65b0d8f9…` (== original : true).

### 2.2 Lecture C-W-1 contre le prototype
- **(a)** `clause359`, poolé NON sans strate servie NON ⇒ `h3_pooled_verdict_outside_condition === "NON"` et `condition_satisfied` inchangé : **couvert** par `g2proto1b_clause359_…` (`deepEqual` de l'objet entier `{true, 0, true, "NON"}` ; tue VY-6 et D15/D16 du G2).
- **(b)** frontière H-4 : « exactement 5/100 ⇒ OUI » **couvert** (`g2proto1b_h4_…`, 1/20 sur `class_a_liquidated` ET `all_liquidated` ; tue VY-2) ; « **au-dessus ⇒ NON** » : **NON couvert à la frontière** — seuls T13 (e2 1/9, 8/63) et aucun cas proche de 5/100.
- **(c)** `VERDICTS` : consommé par `g2proto1b_verdicts_closed_set_c1` (`deepEqual` des 4 issues + appartenance de chaque cellule du cas synthétique T7 et du calcul réel de T11) ; **les cellules du rapport ÉCRIT de T17 ne sont PAS couvertes** (le cp-2 demande « T11/T17 »).

### 2.3 Sonde de nécessité (`cw1-mutants.mjs` phase `before`, harnais `eeb1a497…`, journal `cw1-mutants-before.{log,json}`) — 4/4 **SURVIVENT** au prototype + tests livrés :
- CW1-M1/M2/M3 : le seuil de DÉCISION H-4 glisse au-dessus de 5/100 (5/99, 6/100, 10/100) alors que le champ rapporté `threshold` lit toujours « 5/100 » ⇒ le digest T17 ne voit rien (e2 1/9 et 8/63 restent NON), 1/20 reste OUI.
- CW1-M4 : le rapport ÉCRIT porte un verdict poolé hors ensemble fermé (`"INCONCLUSIVE"`) alors que le digest (calculé sur le corps en mémoire), la clause et le résumé sont inchangés.

### 2.4 Tests ajoutés (tests SEULS, 0 octet d'outil au-delà du correctif du prototype), en fin de fichier après les `g2proto1b_*`
Fragment ajouté tel quel (`cw1-tests.fragment.ts`, sha `ceb381f0…`, 42 lignes, ASCII, 0 CR, 0 `\`) par `cat >>` ; types vérifiés contre `u4b-hyp.d.mts` (`VERDICTS: readonly string[]`, `body.h3?`/`clause_359?` optionnels ⇒ garde `assert.ok`).
- `cw1_h4_boundary_just_above_5_over_100_is_NON` — (b) côté AU-DESSUS : 99 comptes classe A liquidés, 5 à deux appels ⇒ `class_a_liquidated` ET `all_liquidated` = `[99, 5, "5", "99", "NON"]`, `threshold === "5/100"`. 5/99 = plus petite fraction strictement > 1/20 avec moins de 100 comptes, choisie pour tuer aussi CW1-M1 (seuil 5/99) — un 1/19 l'aurait laissé survivre.
- `cw1_verdicts_membership_on_the_written_report_t17` — (c) côté T17 : `runCli report` sur les 4 fixtures committées vers un `mkdtemp`, `JSON.parse` du fichier ÉCRIT, `VERDICTS.includes` sur les 5 cellules H-3 (4 strates + poolé) et sur `clause_359.h3_pooled_verdict_outside_condition` ; `finally rmSync`.
- Aucun `cw1_*` pour (a) : couvert par `g2proto1b_clause359_…` (§2.2).
- Fichier seul : **39/39**, exit 0 (`t-1c-cw1.tap`) ; `npx eslint` des 2 fichiers : exit 0, 0 erreur (l'outil `.mjs` est ignoré par la configuration existante : avertissement pré-existant) ; test `f8d8f3a61e8acf565f85282a55889859833bd1b98c27a07d7c4f0f9add4f05b3` (+172/−1 vs `4c5fa8d`).
- **Sonde de suffisance** (`cw1-mutants.mjs` phase `after`, même harnais `eeb1a497…`, journal `cw1-mutants-after.{log,json}`) : **4/4 KILLED(byIntended)**, chacun rouge sur SON seul test `cw1_*` (M1/M2/M3 → `cw1_h4_…` ; M4 → `cw1_verdicts_…`) ; outil restauré `65b0d8f9…`.

## 4. Mutants sur l'arbre FINAL (prototype + `cw1_*` ; outil `65b0d8f9…`, test `f8d8f3a6…`) — restauration octet-exacte par sha après chaque mutant ; `git status --porcelain` = les 2 `M` seulement après chaque harnais ; 0 fichier `..u4b*` à la racine
| Harnais | Copie / sha | Résultat | Journal |
|---|---|---|---|
| G2 `g2-mutants-1b.mjs` (`d4421f50…`), phase **F** (15 visés) | `g2-mutants-1b-1c.mjs` `8400251b…` — **chemins seuls** (`diff` : TREE F → ce worktree ; TREE E → chemin sentinelle INEXISTANT `F:/tmp/u4bstats1/NO-PHASE-E-IN-1C` pour qu'aucune copie ne puisse muter le clone du G2 ; `OUT_LOG`/`OUT_JSON`/TEMP → `F:\tmp\u4bstats1\` ; commentaires intacts ; `g2-mutants-1b-1c-vs-g2.diff`) | **15/15 KILLED(byIntended)** (D02, D03, D04, D07, D08, D11, D12, D13, D15, D16, D19, D21, D22, D24, D23) | `g2-mutants-1b-1c-F.{log,json}` |
| cp-2 `vy-mutants.mjs` (`ad21d889…`) | `vy-mutants-1c.mjs` `560c469e…` (chemins seuls, §2.1) | **8/8 tués** : VY-1/3/4/5/8 KILLED(byIntended) ; **VY-2** → `g2proto1b_h4_boundaries_and_guards` ; **VY-6** → `g2proto1b_clause359_pooled_non_outside_the_condition_q1a` ; VY-7 → `g2proto1b_out_with_dotdot…` (les trois en KILLED-BY-OTHER : `intended` du cp-2 NON repointé — consigne « chemins seuls » ; même lecture que le cp-2 §3.3 pour VX-3/5/6) ; VY-8 aussi rouge sur `cw1_h4_…` | `vy-mutants-1c-final.{log,json}` (+ `vy-mutants-1c-proto.*` §2.1) |
| worker v46 `mutants.mjs` (`9722de92…`, NON modifié) | `mutants-1c.mjs` `7ca83ff9…` — **D-1 : ancre de M40 ré-ancrée**, seule ligne changée (`mutants-1c-vs-v46.diff`) | **46/46 KILLED(byIntended)** ; M40 rouge sur T19 (`intended`) + `g2proto1b_out_…` | `mutants-run-full-1c.log`, `mutants-result-full-1c.json`, `mutants-stdout-full-1c.log` |
| cw1 (`cw1-mutants.mjs` `eeb1a497…`) | — | `before` 0/4 (4 SURVIVED) → `after` **4/4 KILLED(byIntended)** | `cw1-mutants-{before,after}.{log,json}` |

- **D-1 (déviation déclarée, nécessaire)** : le correctif C-G2D-1 réécrit la ligne sur laquelle M40 s'ancre (`if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) fail(` → `const outside = …; if (rel === "" || !outside) fail(`). Le harnais v46 tel quel lève donc « pattern found 0 times » et s'arrête sans journal. Copie `mutants-1c.mjs` (générée par `mk-mutants-1c.mjs`) : seule l'ancre `from` de M40 change → `  if (rel === "" || !outside) fail(`. Le `to` (`  if (false) fail(`, garde retirée), l'`intended` (T19) et les 45 autres mutants sont octet-identiques. Contrôles faits par le script : ancienne ancre 1× dans le harnais ; nouvelle ancre 1× et ancienne ancre 0× dans l'outil. `mutants.mjs` reste à `9722de92…`, le sha cité par le cp-2 et le G2.
- Couverture D-1 du v46 : 2 tests sans mutant v46 qui les fasse rougir, `g2proto1b_labels_deficit_base_no_price_non_usdt_only` et `cw1_h4_boundary_just_above_5_over_100_is_NON`. Aucun n'est déclaratif au global : le premier est discriminé par D13 (G2 phase F), le second par CW1-M1..M3.

## 3. Oracle 7 gates — `bash F:/tmp/u4bstats1/oracle.sh 1c` (script du lot, inchangé ; `env -u` des 8 clés ; TEMP sur F:) — `oracle-1c\` + `oracle-1c.stdout`
- En-tête de chaque journal : HEAD `4c5fa8d`, `git status` = les 2 `M`, outil `65b0d8f9…`, `.d.mts` `5a019059…` (= blob `4c5fa8d`), test `f8d8f3a6…`, node v24.15.0.
- `exits.txt` : **gate:vocab 0 · typecheck 0 · test 0 · lint 0 · lint:ratchet 0 · lang:gate 0 · export:check 0** (7 × exit 0, 02:01:23Z).
- `test.log` : **tests 960 / pass 959 / fail 0 / cancelled 0 / skipped 1**. Le skip est pré-existant et nommé : `u4b_labels_replay_via_main_real_artifact`, « real e2 artifacts absent ». Le G2 attendait 958/957/0/1 ; les 2 tests de plus sont les `cw1_*`. Les 9 tests du pli (7 `g2proto1b_*` + 2 `cw1_*`) sont ✔ dans le run complet.
- `lint_ratchet.log` : **69/69**. vocab : 221 fichiers, 0 revendication interdite. lang-gate et export:check : 0 occurrence non exemptée.

## 5. R-25 — `bash F:/tmp/u4bstats1/r25.sh 4c5fa8d 1c` (pathspec VERBATIM `ci.yml:65`, index TEMPORAIRE retiré ensuite, index réel non touché : 0 fichier indexé) — `r25-1c.log`
- `2 files changed, 175 insertions(+), 3 deletions(-)` : test +172/−1, outil +3/−2. **R-25 du segment `4c5fa8d..travail` = 178**, soit 136 (prototype) + 42 (fragment `cw1_*`). Borne STOP A-5 1 150, CI 1 205.
- Fusion prévue en trois segments first-parent : 735 (`50f78b0..66141fb`), 826 (`66141fb..4c5fa8d`), 178 (ce pli). Aucun ne dépasse 1 205.

## 3 bis. Reprise après coupure 429 (message du coordinateur)
- Dernière écriture avant la coupure : `r25-1c.log` à 02:01:46Z. Reprise à 04:23:47Z.
- Chaque journal se termine par sa ligne finale (horodatages mtime) : apply 01:46:54Z, VY proto 01:47:45Z, cw1 `before` 01:50:10Z, cw1 `after` 01:55:45Z, v46 01:57:21Z, G2 F 01:58:13Z, VY final 01:58:39Z, oracle 02:01:23Z, R-25 02:01:46Z.
- Contrôles à 04:23–04:24Z :
  - aucun `node.exe` dont la ligne de commande contient `u4bstats1` ou `u4b-hyp` (9 `node.exe` sans rapport) ;
  - `git status --porcelain --untracked-files=all` = les 2 `M`, 0 non suivi, 0 indexé ;
  - outil `65b0d8f9…` et test `f8d8f3a6…` : mêmes octets que ceux sur lesquels l'oracle et les 4 harnais ont tourné, donc **aucun mutant resté appliqué** ;
  - aucun fichier `..u4b*` à la racine ;
  - vivacité : fichier de test seul **39/39** (`t-1c-postcut.tap`).
- L'oracle, les mutants et R-25 avaient fini avant la coupure et je n'ai rien rejoué : les octets sont identiques et les journaux complets.

## 6. A-6 et sha de l'outil (item I-G2D-1)
- **A-6 : 13/13** (`a6-invariants-1c.log`, 04:25:03Z). Méthode du G2 : pour chaque chemin, `git show HEAD:<chemin>` sans CR puis `sha256sum`, et le fichier de travail en LF, comparés à la colonne 1 de `frozen-before.txt` mesurée à `50f78b0`. Blob `HEAD`, fichier de travail et valeur attendue sont égaux pour les 13 chemins : les 9 gelés du prereg §2, `u4b-select-episode.mjs`, `u4-oracle-path.mjs`, le prereg `1971d9b1…` et ADR-U4b `6863104a…`. `git diff --name-only HEAD` sur ces 13 chemins donne 0.
- **sha256 LF de l'outil après le pli : `65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25`** (0 CR, octets = LF). C'est la valeur du prototype G2 : les `cw1_*` ne touchent pas l'outil. **Elle remplace `07e25e19…` (I-3 du G1) au sidecar 6** (item I-G2D-1, propriétaire orchestrateur, avant l'étape 6a).
- **`report` CLI réel** lancé sur les 4 fixtures committées, sortie hors dépôt `report-1c\hyp-report-e2.json` (sha `21daeaec…`), exit 0 :
  - `provenance.tool.sha256_lf` = `65b0d8f9…` ;
  - **`body_digest` = `49b138c3…`**, identique à l'épingle T17 ;
  - `clause_359` = `{true, 0, true, "OUI"}` ; H-3 = OUI, OUI, UNDER_CALIB, UNDER_CALIB, poolé OUI ; H-4 = NON, NON, seuil `5/100` ; H-6 = OUI ;
  - 0 jeton « go », 0 chemin absolu.
- `diff` avec le rapport du cp-2 à `4c5fa8d` (`5179f3de…`) : **une seule ligne**, `provenance.tool.sha256_lf` (`07e25e19…` → `65b0d8f9…`). La provenance est hors digest, comme l'a établi le G2 (`report-1c\diff-vs-cp2-4c5fa8d.txt`).

## 7. Export réel
- `node scripts/export-public.mjs --out F:/tmp/u4bstats1/export-1c`, lancé depuis le worktree sous ceinture : exit 0, « 327 file(s) » + manifeste = **328 fichiers** sur disque (`export-1c.log`, `export-compare-1c.log`).
- `diff -r` avec l'export du cp-2 à `4c5fa8d` : exit 0. Avec l'export G2 `export-1b` : exit 0. **Manifeste `5d5f8fbddde0cafc46fee4270d669bfb8bccea278af84940466a4320ee57a451`**, identique au cp-2, au G2 et à la référence worker.
- L'empreinte agrégée `f69c8e74…` du cp-2 n'a pas été recalculée (je n'ai pas sa méthode). Elle est forcément identique puisque les arbres sont octet-identiques, ce que `diff -r` établit plus fortement.
- Contre la base G2 `export-base` (`50f78b0`) : seul `EXPORT-MANIFEST.json` diffère, d'une ligne `"apps/sentinel/test/u4b-hyp.test.ts",` dans `excluded_tests` (1642a1643). C'est le **327/328 + ligne `excluded_tests`** attendu par le G2.
- 0 fuite : `u4b-hyp`, `scripts/census` et le RUNBOOK sont absents des fichiers exportés ; `files[]` = 327 ; le test figure dans `excluded_tests`. `export:check` de l'oracle : exit 0.

## 8. Livraison, correspondances, restes
### 8.1 Fichiers livrés (NON committés — R-20)
`DELIVERED-1c.sha256` (sha `d24db9d9…`, `sha256sum -t` depuis le worktree ; `sha256sum -c` → OK ×2) :
```
65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25  scripts/census/u4b/u4b-hyp.mjs
f8d8f3a61e8acf565f85282a55889859833bd1b98c27a07d7c4f0f9add4f05b3  apps/sentinel/test/u4b-hyp.test.ts
```
- Les 3 autres fichiers du lot sont inchangés depuis `4c5fa8d` : `.d.mts` `5a019059…`, `export-exclude-tests.json` `cb729fef…`, RUNBOOK `fe1fc948…` (= DELIVERED-1b-v3).
- `1c.patch` (sha `14a6f294…`, `git diff --full-index 4c5fa8d`, 0 CR) :
  - `git apply --check --cached` sur un index TEMPORAIRE lu depuis `4c5fa8d` : exit 0 ;
  - hunk outil = hunk du prototype ;
  - les lignes de test du prototype forment le préfixe du hunk de test 1c, suivies des 42 lignes du fragment (égalité de texte vérifiée).
- Commit proposé (acte de l'orchestrateur) : un commit test + correctif sur `lot/u4b-stats-1` après `4c5fa8d`, avec ces 2 fichiers (R-25 178).

### 8.2 C-G2D-n / C-W-1 ↔ test tueur ↔ mutant (arbre final ; tous tués)
| Item | Objet | Test tueur | Mutants tués |
|---|---|---|---|
| C-G2D-1 **(code)** | `outOfRepo` : `<ROOT>/..x` est DANS le dépôt ; refus d'écrasement NOMMÉ | `g2proto1b_out_with_dotdot_named_child_is_inside_the_repository` | D23 (correctif annulé), D19, VY-7 ; M40 v46 (+ T19) |
| C-G2D-2 (i) | Q-1 (a) au niveau `clause359` | `g2proto1b_clause359_pooled_non_outside_the_condition_q1a` | D15, D16, VY-6 |
| C-G2D-2 (ii) | phrase RUNBOOK `:501` | — (docs, orchestrateur, §8.3) | — |
| C-G2D-3 | H-4 : départage `log_index`, frontière 1/20, 3 gardes | `g2proto1b_h4_boundaries_and_guards` | D02, D03, D04, D07, D08, VY-2 |
| C-G2D-4 | H-6 : retard indéfini, conflit au même bloc | `g2proto1b_h6_future_value_and_same_block_conflict` | D11, D12 |
| C-G2D-5 | gardes H-5 / H-2bis ; compteur non-USDT | `g2proto1b_census_guards_refuse` ; `g2proto1b_labels_deficit_base_no_price_non_usdt_only` | D21, D22 ; D13 |
| C-G2D-6 | `VERDICTS` consommé (ensemble fermé C-1) | `g2proto1b_verdicts_closed_set_c1` | D24 |
| **C-W-1 (a)** | poolé NON hors condition, `condition_satisfied` inchangé | `g2proto1b_clause359_…` (couvert par le prototype) | VY-6, D15, D16 |
| **C-W-1 (b)** égalité | exactement 5/100 ⇒ OUI | `g2proto1b_h4_…` (couvert par le prototype) | VY-2, D04 |
| **C-W-1 (b)** au-dessus | > 5/100 ⇒ NON, à la frontière (5/99) | **`cw1_h4_boundary_just_above_5_over_100_is_NON`** | CW1-M1, CW1-M2, CW1-M3 |
| **C-W-1 (c)** T11 + synthétique | appartenance à `VERDICTS` | `g2proto1b_verdicts_…` (couvert par le prototype) | D24 |
| **C-W-1 (c)** T17 | appartenance sur le rapport ÉCRIT | **`cw1_verdicts_membership_on_the_written_report_t17`** | CW1-M4 |
- `error_origin` des manques de C-W-1 restés après le prototype : ce sont les volets (b) « au-dessus » et (c) « T17 » de C-W-1, déjà assignés par le cp-2 (worker pour (b) ; item I-G2-1 pour (c)). Le prototype du G2 visait ses propres mutants (D04 = `>=`) et ne revendiquait pas ces volets. Aucune nouvelle origine.

### 8.3 Ce qui reste — rien sur le pli. Chaque point est porté par l'orchestrateur, avec un déclencheur déjà formé au G2-delta ou au cp-2
1. **C-G2D-2 (ii) + C-W-3** (docs, hors R-25) : phrase RUNBOOK `:501` du ruling Q-1 (a) — « poolé rapporté hors condition ; s'il vaut NON, porté à l'investisseur avant l'application mécanique de U-6 (information, pas STOP) », en remplacement de « demande formée Q-1 du G1 ». Insertion de l'ADR : Q-1 daté (a), renvoi `:207 → :402`, chiffres R-25 735 / 826 / 178, comptes de mutants 46 (v46 via `mutants-1c.mjs`) + 15 (G2 F) + 8 (VY) + 4 (CW1). Porteur : orchestrateur (consigne de mission).
2. **C-W-2** : fusion en **trois segments first-parent 735 / 826 / 178** (commit du pli, puis fusions ; preuve `git log --first-parent` + R-25 par segment). Porteur : orchestrateur.
3. **I-G2D-1** : sidecar 6 = `65b0d8f9…`. Le pli doit être fusionné **avant 6a**. Porteur : orchestrateur.
4. **C-W-4** (procurement JKK, I-2 versement A&B, I-G2-2 au G0 de NARABI-OPS-1d) : inchangé par ce pli. Porteur : orchestrateur.
5. **Consigne de rejeu** : tout rejeu du harnais v46 sur un arbre qui contient C-G2D-1 (fusion comprise) doit utiliser `mutants-1c.mjs`, car `mutants.mjs` s'arrête sur l'ancre de M40 (D-1).

### 8.4 Déviations, incidents, AM-2
- **D-1** : ré-ancrage de M40 dans la copie du harnais v46 (§4). C'est la seule déviation. Les copies G2 et VY sont en chemins seuls ; dans la copie G2, la phase E pointe vers un chemin sentinelle inexistant.
- **Incidents sans effet** :
  - (i) une première commande `git apply` a été rejetée par l'analyseur shell (parenthèse orpheline) : rien d'exécuté, arbre revérifié propre, relance ;
  - (ii) deux écritures par heredoc (harnais `cw1-mutants.mjs`, puis cette partie du rendu) ont été rejetées par l'enveloppe Bash avant exécution : rien d'écrit (vérifié), fichiers écrits avec l'outil Write (précédent A-13), cette partie ajoutée par `cat >>` ;
  - (iii) coupure 429 de 02:01:46Z à 04:23:47Z : voir §3 bis.
- **Hors périmètre, préexistant, pas une dette du pli** : la suite complète laisse sous le TEMP que j'ai dirigé vers `F:\tmp\u4bstats1\tmp` des répertoires d'AUTRES lots (`bell-*`, `atelier-*` : 101 nouveaux, et 736 plus anciens laissés par les oracles 1a/1b). Du pli lui-même : 0 `u4b-hyp-*`, 0 sur C:.
- **AM-2** :
  - `F:\Monark` : à l'ouverture de session, HEAD `56e7730` + `?? docs/G2-lot-u4b-stats-1-1b.md` ; à 04:26:48Z, `fbaa79d` et status vide (commits de l'orchestrateur). Aucune écriture de ma part : lectures seules (`cat`, `git rev-parse/status/worktree list` sous `GIT_OPTIONAL_LOCKS=0`).
  - Worktree : HEAD `4c5fa8d` inchangé, les 2 `M` seulement, 0 indexé, 0 non suivi, **0 commit, 0 workflow**.
  - Autres worktrees non touchés. `F:\tmp\g2-u4bstats1\` et `F:\tmp\cp2-u4bstats1\` : lecture seule ; leurs harnais ont été copiés, jamais exécutés en place.
- **Advisor** : appelé deux fois (canal intégré, aucun extrait de document sous droits dans le transcript).
  - Avant l'écriture des tests : 8 points, vérifiés sur pièces avant d'être suivis (ancre M40, fraction 5/99, lecture du `.d.mts`, lint précoce, copies en chemins seuls, chiffres attendus 960/959/0/1).
  - Avant la clôture : relecture du rendu, aucune correction de fond. Deux retouches d'exactitude appliquées : ce paragraphe, qui disait « une fois », et les apostrophes de §0 avec l'horodatage de clôture.

### 8.5 Pièces (`F:\tmp\u4bstats1\`, sha256 à 16 caractères)
- **Livrables** : `DELIVERED-1c.sha256` d24db9d92f5ffe39 · `1c.patch` 14a6f294fd4d021b · `cw1-tests.fragment.ts` ceb381f047acc060.
- **Harnais et générateurs** :
  - `cw1-mutants.mjs` eeb1a4974f91782a ;
  - `mutants-1c.mjs` 7ca83ff9b6788530 (+ `mutants-1c-vs-v46.diff` fdc476884a46958c, `mk-mutants-1c.mjs` ad7ed3dec5471e2d) ;
  - `g2-mutants-1b-1c.mjs` 8400251b47ab3029 (+ `g2-mutants-1b-1c-vs-g2.diff` 79d61b05a8732ad0, `mk-g2-copy-1c.mjs` 37d444d47c7bd4e6) ;
  - `vy-mutants-1c.mjs` 560c469ef428c6ba (+ `mk-vy-copy-1c.mjs` 3c6627a43f248334).
- **Journaux de mutants** :
  - cw1 : `cw1-mutants-before.log` 2cacd40251ed9edc / `.json` d7aea0d994650e76 · `cw1-mutants-after.log` bf64fdd8d803c03a / `.json` 78d87757a48457fb ;
  - v46 : `mutants-run-full-1c.log` 4d2e97aca37a60a3 · `mutants-result-full-1c.json` 064051f2d8163748 ;
  - G2 F : `g2-mutants-1b-1c-F.log` 5aa05b48a4fc5f67 / `.json` 4c150efc24e4e681 ;
  - VY : `vy-mutants-1c-proto.log` 38a579d46306be29 / `.json` 2650f5df5f13aa41 · `vy-mutants-1c-final.log` c7156dc74438d7f0 / `.json` c8421de122d45cf1.
- **Autres journaux** :
  - application et tests : `apply-1c.log` 24ab77673c52b66d · `t-1c-proto.tap` 02099f9f4e083f7e · `t-1c-cw1.tap` dd824d6019ce6c42 · `t-1c-postcut.tap` f40475f8a6b5e1a6 · `eslint-1c-files.log` e6fcc4d1eeb0b52d ;
  - oracle : `oracle-1c.stdout` 8c91783059ae8fe3 · `oracle-1c\exits.txt` 3943c3b38a627da5 · `oracle-1c\test.log` 3f5c2f13c455a896 ;
  - R-25 et A-6 : `r25-1c.log` cba951df6177660c · `a6-invariants-1c.log` f46e1d9a496e48fa ;
  - rapport : `report-1c\hyp-report-e2.json` 21daeaecda2f078c · `report-1c\diff-vs-cp2-4c5fa8d.txt` 8da606fd9b0940bd ;
  - export : `export-1c.log` 77c4e249bd1657b0 · `export-compare-1c.log` ea379dec0b8cce09 · `export-1c\EXPORT-MANIFEST.json` 5d5f8fbddde0cafc.
- Modèle résolu (R-1) : `claude-opus-5-5[1m]`.
