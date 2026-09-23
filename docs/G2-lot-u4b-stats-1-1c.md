# Re-G2-delta micro-pli U-4b-STATS-1 1c (c1e9e30) — relecteur claude-opus-5-5, 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

**Verdict : PASS-AVEC-CORRECTIONS.** Le pli 1c est conforme et aucune correction ne vise le worker. Un seul point manque son attendu, le point 4 : à la pointe fetchée `3bbbb06` (05:08:17Z), la fusion du segment 1 (`66141fb`) entre en conflit sur `scripts/export-exclude-tests.json`. La cause est U-4b-1b-4, fusionné à 05:01:58Z (`da5d6e1`) : la pointe et le lot ont chacun ajouté une phrase en fin de `reason` et une entrée en fin de `tests`. Avec une résolution par union, les segments 2 et 3 sont propres et l'oracle de l'arbre fusionné passe. C'est la correction C-R1, portée par vous à la fusion. Le rendu intégral est reproduit ci-dessous, avec son sha256 à la fin.

---

Modèle résolu : claude-opus-5-5[1m]

# re-G2-delta — micro-pli 1c du lot U-4b-STATS-1 : `lot/u4b-stats-1` @ `c1e9e30` (parent `4c5fa8d`)

> **En-tête A-12 (rendu au fil de l'eau ; chaque section est ajoutée au moment où elle est acquise).**
> - Relecteur : `claude-opus-5-5[1m]` (effort max), **contexte frais** (instance distincte du G2 1b, du cp-2 1b et du worker 1c) ; rôle re-G2-delta (doc 02), revue 3 étapes.
> - Ouverture : 2026-09-23T04:43:42Z (`date -u`).
> - Plateforme : win32 10.0.19045, Git Bash 5.3.15, git 2.55.0.windows.5, node v24.15.0, npm 11.12.1.
> - Objet : `4c5fa8d..c1e9e30` (segment 3 du lot ; segments 1 `50f78b0..66141fb` = 735, 2 `66141fb..4c5fa8d` = 826).
> - Contraintes : aucun commit (R-20), aucun workflow ; aucune écriture dans `F:\Monark` ni dans un worktree `F:\Monark-wt-*` (lectures git sous `GIT_OPTIONAL_LOCKS=0`) ; toutes les écritures sous `F:\tmp\g2-u4bstats1-1c\` ; ceinture A-7 (`env -u` des 8 variables payantes) sur toute commande node/npm ; aucune variable affichée.
> - Les harnais des passes précédentes (G2 1b, cp-2, worker) ne sont **jamais exécutés en place** : ils visent des arbres qui ne sont pas les miens (le harnais `cw1-mutants.mjs` du worker vise `F:/Monark-wt-u4bstats1`, interdit) ; ils sont recopiés en **chemins seuls**, diff de la copie publié.
> - AM-2 avant : `logs\am2-before-1c.log` (04:43:42Z) — `F:\Monark` HEAD `435aec0` (`lot/etude-suite` = `origin/lot/etude-suite`), status vide ; worktree `F:\Monark-wt-u4bstats1` HEAD `c1e9e30`, status vide ; `F:\Monark\node_modules` 220 entrées, `@monark` 10.

## 0. Journal de progression

- 04:44Z — clone isolé `F:\tmp\g2-u4bstats1-1c\clone` (`git clone --no-hardlinks -b lot/u4b-stats-1 F:/Monark …` puis `checkout c1e9e30`) : HEAD `c1e9e30abc3e…`, parent `4c5fa8dcc71d…`, status vide (`logs\clone-1c.log`). `npm ci --ignore-scripts` sous ceinture A-7, TEMP sur F: : exit 0, 283 paquets, 0 vulnérabilité, `node_modules` 220 entrées / `@monark` 10, jonctions `@monark/*` vers le clone lui-même (`require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-u4bstats1-1c\clone\packages\rpc-guard\src\index.ts`) (`logs\npm-ci-1c.log`).
- 04:46Z — **§1 composition du pli** (`scripts\step1-diff.sh` v2, `logs\step1-diff.log`) : voir §1.
- 04:49Z→04:51Z — **oracle 7 gates** sur `clone` (`scripts\oracle-1c.sh` = copie CHEMINS SEULS de `oracle-g2.sh`, diff `logs\oracle-copy.diff`) : voir §2.
- 04:50Z — **R-25** (copie octet-identique de `r25-g2.sh`, sha `bda8cdfd…`) et **A-6** (`scripts\a6-1c.sh`) : voir §2.
- 04:52Z — second clone isolé `clone-mut` (même commande, `c1e9e30`, `npm ci --ignore-scripts` exit 0 ; outil `65b0d8f9…`, test `f8d8f3a6…`, status vide ; `logs\clone-mut-1c.log`) : les mutants ne touchent jamais le clone de l'oracle. Copies CHEMINS SEULS des trois harnais antérieurs (`scripts\mk-harness-copies.mjs`, remplacements comptés exactement une fois ; diffs `logs\{g2-mutants-1b-copy1c,vy-mutants-copy1c,cw1-mutants-copy1c}.diff`) : TREE → `clone-mut` (phase E du G2 → chemin sentinelle inexistant), sorties et TEMP → `F:\tmp\g2-u4bstats1-1c\`. Le harnais `cw1-mutants.mjs` du worker vise `F:/Monark-wt-u4bstats1` : jamais exécuté en place.
- 05:02Z→05:04Z — **mutants** (`scripts\run-mutants.sh`, séquentiel sur `clone-mut`, A-7 ; `logs\run-mutants.log`) : voir §3.
- 05:03Z — **CLI réel** (`scripts\cli-1c.mjs` sur `clone`) : voir §5. 05:04Z–05:05Z — sondes d'alias de chemin (`scripts\alias-probe.mjs`, `scripts\realpath-probe.mjs`) : voir §5 et O-A. Incident de méthode : une première sonde d'alias lancée depuis bash (`logs\alias-probe.log`) a vu son double antislash initial réduit à un seul par la couche de citation de l'outil Bash (chemin devenu `F:\?\F:\…`, refus « parent directory does not exist ») : **sonde invalide, non citée comme preuve** ; refaite en construisant les chemins par `String.fromCharCode(92)` (`logs\alias-probe-v2.log`). Les fragments de ce rendu et les scripts contenant des antislashs sont écrits avec l'outil Write (heredoc rejeté par l'enveloppe Bash, précédent A-13).
- 05:08Z→05:12Z — **fusion à blanc** sur la pointe fetchée `3bbbb06` (`scripts\merge-1c.sh`, clone jetable `clone-merge`, remote `origin` retiré) : conflit au segment 1, résolution par union proposée, segments 2–3 propres, oracle de l'arbre fusionné : voir §4.

## 1. Composition du pli `4c5fa8d..c1e9e30` (point 1 de la mission) — `logs\step1-diff.log`

| Contrôle | Résultat |
|---|---|
| Fichiers touchés (tous chemins) | 3 : `M apps/sentinel/test/u4b-hyp.test.ts` (+172/−1), `M scripts/census/u4b/u4b-hyp.mjs` (+3/−2), `A docs/PLI-lot-u4b-stats-1-1c.md` (+173) ; rien d'autre |
| Partie OUTIL de `git diff 4c5fa8d c1e9e30 -- scripts apps` vs partie outil du prototype `g2-proto-1b.diff` (sha `137b0b11…` vérifié) | **identiques à l'octet** (`cmp`), ligne `index fb494f8..b6ca42f` comprise ; sha256 de la section `47ba3bcf…` des deux côtés (23 lignes) |
| Partie TEST | = section test du prototype à deux lignes près (ligne `index 07a129f..8242f84` au lieu de `..d593779`, en-tête `@@ -682,3 +682,174 @@` au lieu de `+682,132`), suivie de 42 lignes `+` = le fragment `cw1-tests.fragment.ts` (sha `ceb381f0…`) préfixé de `+` (`cmp` identique) |
| Reconstruction indépendante depuis les blobs `4c5fa8d` (`git apply` du prototype en dépôt jetable, `core.autocrlf=false`, puis `cat` du fragment) | outil reconstruit = blob `c1e9e30` (`cmp`, sha256 `65b0d8f9…`) ; test reconstruit = blob `c1e9e30` (`cmp`, sha256 `f8d8f3a6…`) ; test après prototype seul `2ea990ba…` (= valeur du worker §1) ; `head -n -42` du test `c1e9e30` = test après prototype (`cmp`) |
| Fragment | 42 lignes, 0 CR, 0 octet non-ASCII, 0 antislash |
| **sha256 LF de `scripts/census/u4b/u4b-hyp.mjs` à `c1e9e30`** | **`65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25`** (`git show … \| tr -d '\r' \| sha256sum`) = fichier de travail (0 CR) — attendu `65b0d8f9…` : **OK** |
| `docs/PLI-lot-u4b-stats-1-1c.md` | = `F:\tmp\u4bstats1\RENDU-MICROPLI-1c.md` à l'octet (sha `f7a923b3…`) ; hors pathspec R-25 (`:(exclude,glob)docs/**/*.md`) |

Incident de méthode (sans effet sur le verdict) : la v1 du script reconstruisait dans un dépôt jetable avec `core.autocrlf=true` hérité ; `git apply` y avait écrit des CRLF (les `git hash-object` normalisés concordaient déjà, les `cmp` non). La v2 force `core.autocrlf=false` ; les deux `cmp` sont identiques. Une première extraction « naïve » par diff-de-diffs donnait un faux « NO » (alignement des lignes de fermeture communes `+});`) : remplacée par la comparaison exacte ci-dessus.

**Point 1 : CONFORME** — prototype G2 à l'octet (outil), tests du prototype à l'octet, fragment `cw1` à l'octet, aucune autre modification de code ; outil `65b0d8f9…`.

## 2. Oracle, R-25, A-6 (point 2)

**Oracle 7 gates** (`clone` @ `c1e9e30`, `scripts\oracle-1c.sh`, A-7, TEMP sur F: ; `logs\oracle-1c\`, `logs\oracle-1c.stdout`) — en-tête de chaque journal : HEAD `c1e9e30`, status vide, outil `65b0d8f9…`, `.d.mts` `5a019059…`, test `f8d8f3a6…`, `export-exclude-tests.json` `cb729fef…`, node v24.15.0.

| Gate | exit | détail |
|---|---|---|
| gate:vocab | 0 | 221 fichiers, 0 revendication interdite |
| typecheck | 0 | `tsc --noEmit` |
| test | 0 | **tests 960 / pass 959 / fail 0 / cancelled 0 / skipped 1** (skip pré-existant nommé `u4b_labels_replay_via_main_real_artifact`, « real e2 artifacts absent ») ; les 9 tests du pli (7 `g2proto1b_*` + 2 `cw1_*`) ✔ ; 39 tests du lot ✔ |
| lint | 0 | `eslint .` |
| lint:ratchet | 0 | 69/69 |
| lang:gate | 0 | 0 occurrence non exemptée |
| export:check | 0 | 0 chemin interdit |

Status du clone après : vide ; 0 fichier `..u4b*` à la racine ; 0 entrée `u4b*` dans mon TEMP (102 répertoires `bell-*`/`atelier-*` laissés par les tests d'AUTRES lots — hygiène préexistante, déjà relevée par le worker, hors pli). **Attendu 960/959/0/1 : OK.**

**R-25** (`scripts\r25-g2-copy.sh` = `r25-g2.sh` octet pour octet, sha `bda8cdfd…` ; pathspec lu VERBATIM à `ci.yml:65` du clone, sha256 de la ligne `fdff3620…`, identique pour les 4 mesures ; diff trois-points comme la CI) :

| Segment | shortstat sous pathspec | R-25 |
|---|---|---|
| `50f78b0...66141fb` | 4 fichiers, +733/−2 | 735 |
| `66141fb...4c5fa8d` | 3 fichiers, +813/−13 | 826 |
| **`4c5fa8d...c1e9e30`** | **2 fichiers, +175/−3** (test +172/−1, outil +3/−2 ; le `.md` exclu) | **178** (attendu 178 : OK) |
| lot entier `50f78b0...c1e9e30` | 4 fichiers, +1 705/−2 | 1 707 > 1 205 ⇒ fusion en TROIS segments first-parent obligatoire |

**A-6 : 13/13** (`scripts\a6-1c.sh`, `logs\a6-invariants-1c.log`) — méthode du G2 1b (`git show <rev>:<path> | tr -d '\r' | sha256sum` contre la colonne 1 de `F:\tmp\u4bstats1\frozen-before.txt`, sha `accfd5b2…`) : identiques sur `50f78b0`, `66141fb`, `4c5fa8d`, `c1e9e30` ET sur le fichier de travail du clone ; 0 fichier du lot parmi les 13. Sur la pointe `lot/etude-suite` (`38c767e` à 04:50:51Z) : `u4b-select-episode.mjs` (`20e1cf9d`) et l'ADR-U4b (`2675e543`) diffèrent — hors lot, déjà relevé au G2 1b, non touchés par le lot.

## 3. Mutants (point 3) — clone `clone-mut` @ `c1e9e30`, restauration octet-exacte par sha après CHAQUE mutant

Contrôle global du lanceur (`logs\run-mutants.log`) : avant/après chaque harnais, outil `65b0d8f9…`, test `f8d8f3a6…`, `git status --porcelain --untracked-files=all` vide, 0 fichier `..u4b*` à la racine.

| Harnais (copie CHEMINS SEULS, sha de la copie) | Arbre / test | Résultat | Journal |
|---|---|---|---|
| G2 1b `g2-mutants-1b.mjs` (`d4421f50…`) → `g2-mutants-1b-copy1c.mjs` (`201256cd…`), **phase F** | test `f8d8f3a6…`, baseline 39/39 | **15/15 KILLED(byIntended)** : D02, D03, D04, D07, D08 → `g2proto1b_h4_…` ; D11, D12 → `g2proto1b_h6_…` ; D13 → `g2proto1b_labels_…` (+ T17) ; D15, D16 → `g2proto1b_clause359_…` ; D19, D23 → `g2proto1b_out_…` ; D21, D22 → `g2proto1b_census_…` ; D24 → `g2proto1b_verdicts_…` | `logs\g2-mutants-1b-copy1c-F.{log,json}` |
| cp-2 `vy-mutants.mjs` (`ad21d889…`) → `vy-mutants-copy1c.mjs` (`7fb4b000…`) | idem | VY-1, VY-3, VY-4, VY-5, VY-8 : KILLED(byIntended) ; **VY-2 : `KILLED-BY-OTHER(g2proto1b_h4_boundaries_and_guards)`** ; **VY-6 : `KILLED-BY-OTHER(g2proto1b_clause359_pooled_non_outside_the_condition_q1a)`** ; VY-7 : `KILLED-BY-OTHER(g2proto1b_out_with_dotdot_named_child_is_inside_the_repository)` ; VY-8 aussi rouge sur `cw1_h4_…`. Les trois « BY-OTHER » sont rapportés tels quels (l'`intended` du cp-2 vise des tests antérieurs ; copie en chemins seuls, non repointée). **VY-2 et VY-6 : tués** (ils survivaient au cp-2) | `logs\vy-mutants-copy1c.{log,json}` |
| worker `cw1-mutants.mjs` (`eeb1a497…`, vise le worktree : jamais lancé en place) → `cw1-mutants-copy1c.mjs` (`f1a08b11…`), phase **before** | test SANS `cw1_*` = `4c5fa8d` + prototype (`2ea990ba…`, reconstruit indépendamment au §1), baseline 37/37 | **0/4 tués, 4 SURVIVED** (nécessité des tests `cw1_*` confirmée) ; test restauré `f8d8f3a6…` vérifié | `logs\cw1-mutants-copy1c-before.{log,json}` |
| idem, phase **after** | test `f8d8f3a6…`, baseline 39/39 | **4/4 KILLED(byIntended)** : CW1-M1/M2/M3 → `cw1_h4_…` seul ; CW1-M4 → `cw1_verdicts_…` seul | `logs\cw1-mutants-copy1c-after.{log,json}` |
| **mes mutants propres** `g2-1c-mutants.mjs` (`d90be544…`), phase **N** | test `f8d8f3a6…`, baseline 39/39 | **9/12 KILLED(byIntended)** ; 3 SURVIVED attendus et classés ci-dessous | `logs\g2-1c-mutants-N.{log,json}` |
| idem, phase **A** (ablation : `cw1_verdicts` relit T17 SANS `VERDICTS`) | test ablaté `d7fdb5b9…`, restauré `f8d8f3a6…` | R09 et X-CW1-M4 SURVIVED ; R10 rouge par T17 seul ; R13 rouge par `g2proto1b_verdicts_…` seul ; R11 tué (assertion de cardinalité, non ablatée) | `logs\g2-1c-mutants-A.{log,json}` |

**Mutants propres (phase N)** — les `edits` exacts, sha mutés/restaurés et tests rouges sont dans le journal :

| Mutant | Cible | Résultat | Tests rouges |
|---|---|---|---|
| R01 `outOfRepo` : `rel.startsWith("..")` sans séparateur | correctif C-G2D-1 | **KILLED(byIntended)** | `g2proto1b_out_…` seul |
| R02 `outOfRepo` : `isAbsolute(rel)` retiré | correctif C-G2D-1 (branche inter-lecteurs) | **SURVIVED** — classement O-B | aucun ; sonde inter-lecteurs (lecture seule sur C:) : original ⇒ « parent directory does not exist: C:\u4b-hyp-g2-1c-no-such-dir » ; mutant ⇒ « … is inside the repository » ; 0 écriture, 0 répertoire créé dans les deux cas |
| R03 `outOfRepo` : séparateur POSIX `"../"` codé en dur | correctif C-G2D-1 (portabilité win32) | **KILLED(byIntended)** (T17) | 9 tests qui écrivent sous `tmpdir()` (T17, T19, VX-3/5/6, résumé, `g2proto1b_out`, `g2proto1b_census`, `cw1_verdicts`) — équivalent sous POSIX, tué sous win32 |
| R05 H-4 : seule la cellule `all_liquidated` décidée à 5/99 | `cw1_h4` (les DEUX cellules) | **KILLED(byIntended)** | `cw1_h4_…` seul |
| R06 H-4 : seule la cellule `class_a_liquidated` décidée à 5/99 | `cw1_h4` | **KILLED(byIntended)** | `cw1_h4_…` seul |
| R07 H-4 : seuil de décision 6/119 (strictement entre 1/20 et 5/99) | `cw1_h4` (frontière 5/99) | **SURVIVED** — limite intrinsèque, O-C | aucun |
| R08 H-4 : fraction classe A de dénominateur `liqA + 1` | `cw1_h4` (fraction 5/99) | **KILLED(byIntended)** | `cw1_h4_…`, T17 |
| R09 rapport ÉCRIT : `UNDER_CALIB` réécrit `PENDING` (après le digest) | `cw1_verdicts` (strates) | **KILLED(byIntended)** | `cw1_verdicts_…` seul |
| R10 rapport ÉCRIT : `clause_359.h3_pooled_verdict_outside_condition` = `INCONCLUSIVE` | `cw1_verdicts` (dernière assertion) | **KILLED(byIntended)** | `cw1_verdicts_…`, T17 (`deepEqual` de la clause écrite) |
| R11 rapport ÉCRIT : une strate retirée | `cw1_verdicts` (cardinalité 5) | **KILLED(byIntended)** | `cw1_verdicts_…` seul |
| R12 rapport ÉCRIT : poolé `NON` (dans l'ensemble fermé) alors que le corps digéré dit `OUI` | `cw1_verdicts` | **SURVIVED** — résidu O-2 du G2 1b, O-D | aucun |
| R13 `VERDICTS` perd `UNDER_CALIB` (l'outil en produit toujours) | `cw1_verdicts` (T17 relu AVEC `VERDICTS`) | **KILLED(byIntended)** | `cw1_verdicts_…`, `g2proto1b_verdicts_…` |

**Ablation « T17 relu sans `VERDICTS` » (phase A)** : les deux `VERDICTS.includes(…)` de `cw1_verdicts` remplacés par `typeof … === "string"`. R09 et CW1-M4 (emprunté au worker) **survivent** : l'appartenance à `VERDICTS` est le SEUL élément qui les voit (preuve de nécessité côté test, complémentaire de la phase `before` du worker). R10 reste rouge par T17 seul, R13 par `g2proto1b_verdicts_…` seul, R11 par l'assertion de cardinalité : chacun a un second gardien indépendant. (Les libellés « expected » imprimés en phase A sont ceux de la phase N ; l'attendu de l'ablation est celui énoncé ici.)

**Classement des 3 survivants (liste fermée)** :
- **O-B — R02 (`isAbsolute` retiré) : branche non atteignable dans tout environnement de test mesuré, pas équivalente.** Sous win32, `path.relative` ne rend un chemin absolu qu'entre lecteurs ou vers un chemin UNC/espace de noms (`logs\path-semantics-probe.log`) ; tous les `--out` des tests passent par `tmpdir()` = TEMP sur F: (même lecteur que ROOT), et sous POSIX (CI) `relative()` n'est jamais absolu. Le sens de la régression est **fail-closed** (le mutant refuse un chemin inter-lecteurs légitime ; il n'écrit jamais dans le dépôt). La clause `isAbsolute` existait déjà dans l'outil 1b d'origine ; le pli ne l'a ni introduite ni revendiquée. Épingle possible, sans écriture : sous `process.platform === "win32"`, `--out C:/<inexistant>/x.json` doit être refusé « parent directory does not exist » (preuve : sonde ci-dessus). **Pas une correction du pli** ; durcissement facultatif proposé à l'orchestrateur.
- **O-C — R07 (seuil 6/119) : limite intrinsèque de tout test à moins de 119 comptes.** 1/20 et 5/99 sont voisins de Farey (5·20 − 1·99 = 1) : aucune fraction de dénominateur ≤ 118 ne s'intercale, la médiante 6/119 est la première. `cw1_h4` épingle donc la frontière à la meilleure résolution possible pour n < 100 comptes (ce qu'il déclare). Un test à 119 comptes (6 multi-appels ⇒ NON) réduirait l'intervalle à (1/20, 6/119) sans le fermer : aucun jeu fini ne le ferme. Sur e2, les fractions H-4 sont 11/99 et 24/189 (marge large). **Pas un défaut.**
- **O-D — R12 (divergence écrite DANS l'ensemble fermé)** : C-W-1 (c) demande l'appartenance, que `cw1_verdicts` assure ; aucun test ne lie le corps ÉCRIT au `body_digest` (T17 compare le champ `body_digest` écrit, calculé sur le corps en mémoire). Champ non porteur : la clause :359 écrite, seule entrée de l'application mécanique de U-6, est épinglée par le `deepEqual` de T17 (R10 le prouve). C'est le durcissement facultatif O-2 du G2 1b (recompute indépendant du digest depuis le fichier écrit, dans T17) ; `cli-1c.mjs` montre que ce recompute est égal sur le rapport réel. **Pas une correction du pli.**

**Point 3 : CONFORME** — G2 phase F 15/15 ; VY-2 et VY-6 tués (VY 8/8 tués, dont 3 en BY-OTHER rapportés tels quels) ; cw1 : `before` 4 SURVIVED puis `after` 4/4 ; mutants propres : 9/12 tués byIntended (R01, R03, R05, R06, R08, R09, R10, R11, R13), 3 survivants classés O-B/O-C/O-D sans correction.

## 4. Fusion à blanc en TROIS segments first-parent sur la pointe FETCHÉE (point 4) — `clone-merge` jetable

Méthode (`scripts\merge-1c.sh`, `logs\merge-dry-1c.log`) : clone `--no-hardlinks` de `F:\Monark`, **remote `origin` retiré avant tout** (aucune poussée possible) ; `git fetch F:/Monark lot/etude-suite lot/u4b-stats-1` à 05:08:17Z ⇒ **pointe `3bbbb06636be34967af074aa97fbff7ad8241597`** (= `lot/etude-suite` ET `origin/lot/etude-suite` ET HEAD de `F:\Monark` à la même seconde ; sujet « Sidecar ligne A … G7 commit 5219e3a ») ; `merge-base(pointe, 66141fb)` = `50f78b0` (base du lot) ; aucun des 4 commits du lot n'est ancêtre de la pointe ; 82 commits first-parent sur la pointe depuis `50f78b0`, dont deux fichiers du lot touchés côté pointe : `scripts/export-exclude-tests.json` et le RUNBOOK. Les trois commits de fusion n'existent QUE dans ce clone jetable (nécessaires pour `git log --first-parent`), identité passée par `-c` (aucune écriture de configuration), messages « DRY-RUN … never pushed » ; R-20 vise le dépôt du projet et ses worktrees, rien n'y est poussé ni recopié.

| Segment | `merge --no-ff` | Résultat | Commit (clone jetable) |
|---|---|---|---|
| 1 | `66141fb` | **CONFLIT de contenu sur `scripts/export-exclude-tests.json`** (exit 1) — les deux côtés ont AJOUTÉ une phrase en fin de `reason` et une entrée en fin de `tests` : pointe = U-4b-1b-4 (`u4b-probe-cutoff.test.ts`, fusionné par `da5d6e1` à 05:01:58Z, G7 `5219e3a` à 05:07:57Z), lot = U-4b-STATS-1 (`u4b-hyp.test.ts`, depuis `564292d`) ; les 3 autres fichiers ajoutés sans conflit | résolution PROPOSÉE (`scripts\resolve-exclude-union.mjs`) : **UNION**, côté pointe d'abord ; le script vérifie que chaque côté n'a fait qu'ajouter (préfixe = base) et que le format `JSON.stringify(x, null, 2) + LF` reproduit les trois étages à l'octet ; fichier résolu sha256 `0b648e14…` (`logs\merge-seg1-resolve.log`) ⇒ `a2271f5` (parents `3bbbb06` + `66141fb`) |
| 2 | `4c5fa8d` | propre (RUNBOOK fusionné automatiquement par `ort`) | `e9dc370` (parents `a2271f5` + `4c5fa8d`) |
| 3 | `c1e9e30` | propre | `287f07c` (parents `e9dc370` + `c1e9e30`) |

`git log --first-parent` (`logs\merge-seg3.log`) : `287f07c` → `e9dc370` → `a2271f5` → `3bbbb06` ; **3 fusions** sur la chaîne first-parent `3bbbb06..HEAD` (3 commits, 3 fusions).

**R-25 par segment** (copie octet-identique de `r25-g2.sh`, `ci.yml:65` de l'arbre fusionné = ligne STAT, sha256 de la ligne `fdff3620…` inchangé, blob `ci.yml` identique pointe/lot ; `logs\merge-r25-blobs-1c.log`, `logs\r25-merged-seg{1,2,3}.log`, `logs\r25-merged-whole.log`) : `3bbbb06...a2271f5` **735** · `a2271f5...e9dc370` **826** · `e9dc370...287f07c` **178** — chacun ≤ 1 205 (la résolution par union garde 735 : −2/+3 dans le registre des deux façons). Bloc `3bbbb06...287f07c` = 1 707 : une PR unique vers `lot/etude-suite` (CI `origin/base...HEAD`) serait refusée ; seules les fusions locales first-parent tiennent (C-W-2, déjà formé).

**Blobs de l'arbre fusionné vs `c1e9e30`** : outil (`b6ca42f…`, sha256 LF `65b0d8f9…`), `.d.mts`, test (`8242f84…`) et `docs/PLI-…-1c.md` **identiques** ; `scripts/export-exclude-tests.json` = l'union (attendu, diffère du blob du lot) ; RUNBOOK = fusion automatique qui porte À LA FOIS les changements de la pointe et ceux du lot (les lignes de changement `50f78b0..pointe` = `c1e9e30..fusion`, et `50f78b0..c1e9e30` = `pointe..fusion` : sha `2f9e8adf…` et `efe6a1af…` égaux deux à deux). `package-lock.json` identique pointe/lot/fusion.

Conséquence documentaire : dans l'arbre fusionné, la phrase RUNBOOK de C-G2D-2 (ii) / C-W-3 (« demande formée Q-1 du G1 », `:501` à `c1e9e30`) est à la **ligne 533** (décalage de +32 dû aux ajouts de la pointe) et dit toujours « demande formée » : l'item de l'orchestrateur reste ouvert, seul son numéro de ligne change sur la pointe courante.

**Oracle de l'arbre fusionné** (`287f07c`, `npm ci --ignore-scripts` exit 0, `scripts\oracle-1c.sh`, A-7 ; `logs\oracle-merged-1c\`, `logs\oracle-merged-1c.stdout`) : **7 × exit 0** (gate:vocab 224 fichiers OK, typecheck, test, lint, lint:ratchet 69/69, lang:gate, export:check) ; **tests 1 035 / pass 1 033 / fail 0 / cancelled 0 / skipped 2** (deux skips nommés préexistants de la pointe : `sentinel_run_releases_chainstack_lock_on_sigterm` et `u4b_labels_replay_via_main_real_artifact`) ; les **39 tests du lot** ✔, dont les 9 du pli ; gardes d'export `export_exclude_data_no_exported_consumer` et `export_excluded_tests_leave_no_orphan_fixture` ✔ avec le registre unifié (`0b648e14…`) ; status du clone vide après.

**Point 4 : NON CONFORME à l'attendu « 0 conflit »** — 1 conflit (segment 1, `scripts/export-exclude-tests.json`) à la pointe fetchée `3bbbb06`, apparu avec la fusion de U-4b-1b-4 (`da5d6e1`, 05:01:58Z) après le commit du pli (04:35:09Z) et après les fusions à blanc du G2 1b et du cp-2 (`fad24ab`, 0 conflit). Avec la résolution par union : segments 2 et 3 propres, 3 fusions first-parent, R-25 735/826/178, oracle 7 × 0 et 1 035/1 033/0/2. ⇒ correction **C-R1** (§6).

## 5. Rapport CLI réel (point 5) — `clone` @ `c1e9e30`, `scripts\cli-1c.mjs`, sous-processus `node scripts/census/u4b/u4b-hyp.mjs …`, A-7 ; `logs\cli-1c.log`

| Contrôle | Résultat |
|---|---|
| `report` sur les 4 fixtures committées (`apps/sentinel/test/fixtures/ukemi/{u4b/U4b-scores-e2.jsonl, u3/U3-inputs.jsonl, u3/U3-realized.jsonl, u4b/U4b-oracle-path-e2.jsonl}`, `--event-id e2-2025-10-10-weth`), `--out F:/tmp/g2-u4bstats1-1c/report/hyp-report-e2-{a,b}.json` (hors dépôt) | exit 0 ×2 ; **les deux sorties identiques à l'octet** (sha256 `21daeaec…`) |
| `body_digest` | **`49b138c3b0ea1c4debfd6276df898cb9e1379a93b676f0a9fe04fd04fb441d5f`** = épingle T17 = **recompute indépendant** (mon sérialiseur canonique, sans import de l'outil) sur le corps ÉCRIT ; `canon(corps + provenance)` = `31964e9c…` ≠ digest ⇒ provenance hors digest |
| `provenance.tool` | `{rel: "scripts/census/u4b/u4b-hyp.mjs", sha256_lf: "65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25"}` ; node v24.15.0 |
| Contenu | `clause_359 = {true, 0, true, "OUI"}` ; H-3 : OUI, OUI, UNDER_CALIB, UNDER_CALIB, poolé OUI ; H-4 : seuil `5/100`, classe A `[99, 11, NON]`, tous `[189, 24, NON]` ; H-6 : OUI ; labels : 194 lignes, 0 non résolue, `deficit_base_no_price_non_usdt` 0 |
| Jeton de décision / chemins / horloge | **0** occurrence `\bgo\b` (insensible à la casse) ; 0 chemin absolu à lettre de lecteur ; 0 chemin de l'arbre ; 0 horodatage ISO |
| Ancre 1 : rapport du cp-2 à `4c5fa8d` (`5179f3de…`) | même nombre de lignes ; **une seule ligne diffère** (L7, `sha256_lf` `07e25e19…` → `65b0d8f9…`) |
| Ancre 2 : rapport du worker sur l'arbre 1c (`report-1c\hyp-report-e2.json`, `21daeaec…`) | **identique à l'octet** |
| Status du clone après les deux exécutions | vide |

**Refus `--out`** (7 cas ; pour chacun : exit, message nommé, cible créée ?, `git status --porcelain --untracked-files=all`) :

| Cas | exit | message | écrit ? | status |
|---|---|---|---|---|
| `<ROOT>/u4b-g2-1c-inrepo.json` (`h3`) | 1 | « … is inside the repository (refused; reports live out of repo) » | non | vide |
| `<ROOT>/u4b-g2-1c-inrepo-report.json` (`report`) | 1 | idem | non | vide |
| **C-G2D-1** `<ROOT>/..x/r.json` (parent absent) | 1 | idem (la garde « dans le dépôt » passe AVANT le contrôle du parent) | non (ni fichier ni répertoire `..x`) | vide |
| **C-G2D-1** `<ROOT>/..probe.json` (parent = ROOT, existe ; le défaut du 1b y ÉCRIVAIT) | 1 | idem | non | vide |
| **C-G2D-1** graphie antislash `F:\tmp\g2-u4bstats1-1c\clone\..g2probe.json` | 1 | idem | non | vide |
| casse différente `F:/tmp/g2-u4bstats1-1c/CLONE/…` | 1 | idem | non | vide |
| fichier existant hors dépôt | 1 | « … already exists (never overwritten) » (refus NOMMÉ `HypError`, pas l'`EEXIST` de Node) | contenu intact `{}\n` | vide |

0 entrée ajoutée à la racine du clone ; `report\` ne contient que `existing.json` et les deux rapports. **Point 5 : CONFORME.**

**Observation O-A (préexistante, hors du périmètre de C-G2D-1 ; même famille que O-4 du G2 1b)** — la garde `outOfRepo` est LEXICALE (`resolve` + `relative`) : un chemin du dépôt écrit via l'espace de noms de périphériques ou un partage UNC administratif est jugé « hors dépôt ». **Mesuré** dans mon clone jetable (`logs\alias-probe-v2.log`, chemins construits par `String.fromCharCode(92)`) : `\\?\F:\…\clone\x.json`, `\\.\F:\…\clone\x.json` et `\\localhost\F$\…\clone\x.json` ⇒ **exit 0, rapport ÉCRIT DANS le clone** (3 fichiers retirés aussitôt, status revenu vide). Le calcul lexical est identique avant et après le correctif (`logs\path-semantics-probe.log` : `pre_fix_outside` = `fixed_outside` = true pour ces trois formes) : le pli n'a rien régressé. Modèle de menace de la garde : prévention d’une erreur d’opérateur — motif énoncé pour les gardes `--out` sœurs du lot U-4b (« Plus de footgun `--out` », `docs/adr/ADR-U4b-calibration-episode-frais.md:430` à `c1e9e30`, garde C-6 du labeler) ; message de l’outil : « reports live out of repo » ; le RUNBOOK n’emploie que des chemins `F:/course-ukemi/…` ; ces graphies ne sont pas des fautes de frappe plausibles. Direction mesurée pour qui voudrait fermer la famille (`logs\realpath-probe.log`) : `fs.realpathSync.native` sur le parent existant ramène `\\?\` et `\\.\` à `F:\…` (garde alors correcte), **mais pas** `\\localhost\F$\…` (reste UNC) — il faudrait en plus refuser les préfixes UNC/périphériques. **Pas une correction du pli** ; item formé pour l'orchestrateur (déclencheur : toute extension du modèle de menace de la garde, ou réemploi du motif `outOfRepo` dans un nouveau lot).

## 6. Verdict re-G2-delta du micro-pli 1c (`c1e9e30`) : **PASS-AVEC-CORRECTIONS**

**Le pli lui-même est conforme.**
- Le prototype du G2 1b est appliqué à l'octet, avec les 2 tests `cw1_*` et rien d'autre ; outil `65b0d8f9…` (§1).
- Oracle : 7 gates à 0, 960/959/0/1 ; R-25 du segment = 178 ; A-6 13/13 (§2).
- Mutants (§3) : G2 phase F 15/15 ; VY-2 et VY-6 tués ; cw1 nécessaires (4 SURVIVED en phase `before`) puis suffisants (4/4 en phase `after`) ; mes mutants propres : 9/12 tués, les 3 survivants sont classés sans correction.
- Rapport CLI conforme (§5) : `body_digest` `49b138c3…`, provenance `65b0d8f9…`, 0 jeton, refus C-G2D-1 à exit 1 sans aucune écriture.
- **Aucune correction ne vise le worker.**

**Une correction vise la fusion.** L'attendu « 0 conflit » du point 4 est faux à la pointe courante.

**Liste FERMÉE :**

| # | Constat | Preuve | Correction demandée | Porteur / déclencheur | `error_origin` |
|---|---|---|---|---|---|
| **C-R1** | À la pointe fetchée `3bbbb06` (05:08:17Z), la fusion `--no-ff` du **segment 1** (`66141fb`) **CONFLICTE** sur `scripts/export-exclude-tests.json`. La pointe (U-4b-1b-4, `u4b-probe-cutoff.test.ts`) et le lot (U-4b-STATS-1, `u4b-hyp.test.ts`) ajoutent chacun une phrase en fin de `reason` et une entrée en fin de `tests`. Les segments 2 et 3 sont propres. La pointe a ensuite avancé jusqu'à `7154d18` (05:14Z) par deux commits `docs/*.md` seulement, qui ne touchent aucun fichier du lot, ni `ci.yml`, ni `package-lock.json` : le constat est inchangé | `logs\merge-dry-1c.log` ; `logs\merge-seg1-resolve.log` ; `logs\merge-seg{2,3}.log` ; `logs\merge-r25-blobs-1c.log` ; `logs\oracle-merged-1c\` ; `logs\am2-after-1c.log` | (a) Résoudre dans le commit de fusion du segment 1 par **UNION**, entrée de la pointe d'abord. Le script `resolve-exclude-union.mjs` refuse si un côté a fait autre chose qu'ajouter, et vérifie le format à l'octet ; fichier résolu : sha256 `0b648e14…`.<br>(b) À refaire à l'heure de la fusion réelle, car la pointe bouge.<br>(c) Preuves au G7 : 0 conflit résiduel, 3 fusions first-parent, R-25 par segment (735/826/178), oracle de l'arbre fusionné. Mesuré à blanc : 7 × 0, 1 035/1 033/0/2, 39 tests du lot ✔, gardes d'export ✔.<br>(d) Pour C-W-3, la phrase RUNBOOK `:501` est à la **ligne 533** de l'arbre fusionné | orchestrateur, à la fusion C-W-2, **avant 6a** (I-G2D-1) | orchestrateur : l'attendu « 0 conflit » de la mission vient des fusions à blanc du G2 1b et du cp-2 à `fad24ab` ; il n'a pas été re-mesuré après la fusion de U-4b-1b-4 (`da5d6e1`, 05:01:58Z), qui touche le même registre. Cause structurelle : O-E |

**Items déjà formés, inchangés par ce re-G2** (porteur : orchestrateur) :
- **C-G2D-2 (ii) + C-W-3** : phrase RUNBOOK, ligne 533 après fusion.
- **C-W-2** : fusion en trois segments, désormais avec C-R1.
- **I-G2D-1** : sidecar 6 = `65b0d8f9…`, confirmé ici par le rapport réel et par l'arbre fusionné.
- **C-W-4** : procurement JKK, I-2, I-G2-2.
- **Consigne de rejeu du worker** : `mutants-1c.mjs` pour tout arbre contenant C-G2D-1.

### Table `error_origin` (tous les constats de ce re-G2)

| Constat | Nature | `error_origin` |
|---|---|---|
| C-R1 | correction (fusion) | orchestrateur (attendu non re-mesuré après `da5d6e1`) ; cause structurelle O-E |
| O-A | observation : alias `\\?\` / `\\.\` / UNC acceptés par la garde lexicale | worker 1b d'origine. La garde lexicale existe depuis 1b ; C-G2D-1 la corrige pour `..x` sans rien régresser. Hors modèle de menace (même famille que O-4 du G2 1b) |
| O-B | observation : branche `isAbsolute` jamais atteinte par les tests | worker 1b d'origine (clause non épinglée depuis 1b) ; épingle win32 facultative |
| O-C | observation : écart de Farey (1/20, 5/99) | aucun — limite intrinsèque des tests finis |
| O-D | observation : corps écrit non lié au digest | aucun nouveau — c'est O-2 du G2 1b (durcissement facultatif) |
| O-E | observation : format du registre `export-exclude-tests.json` | structurel. Une ligne `reason` unique et un tableau alimenté par ajout en fin : chaque paire de lots concurrents qui excluent un test entre en conflit |
| Incident M-1 : `step1` v1 (CRLF du dépôt jetable) | méthode | relecteur (moi) ; corrigé par la v2, jamais cité comme preuve |
| Incident M-2 : première sonde d'alias (antislash réduit) | méthode | relecteur (moi) : citation de l'outil Bash ; sonde refaite en v2, v1 jamais citée |

## 7. Observations (sans correction du pli), MAST, consultation

Toutes sont démontrées plus haut. Voici leur disposition, sans dette :
- **O-A** (§5) : alias de chemin. Pas une correction du pli. **Item formé** pour l'orchestrateur. Déclencheur : extension du modèle de menace de la garde, ou réemploi du motif `outOfRepo` dans un nouveau lot. Direction mesurée : `realpathSync.native` suffit pour `\\?\` et `\\.\` ; il faut en plus refuser les chemins UNC.
- **O-B** (§3) : branche `isAbsolute`. **Durcissement facultatif** proposé : une épingle win32 sans écriture, `--out C:/<inexistant>/x.json` ⇒ « parent directory does not exist ». Décision : orchestrateur, au G7.
- **O-C** (§3) : écart de Farey. **Aucune action** : c'est une limite intrinsèque, déclarée par le test lui-même.
- **O-D** (§3) : c'est O-2 du G2 1b. **Durcissement facultatif** déjà formé : recompute indépendant du digest dans T17, depuis le fichier écrit.
- **O-E** (§4) : format du registre `scripts/export-exclude-tests.json`. **Item formé**, décision d'architecture hors pli. Déclencheur : le prochain lot qui exclut un test. Deux options :
  - (i) résoudre par union documentée au G7 ; coût : un conflit par paire de lots concurrents ;
  - (ii) restructurer le registre en une entrée `{test, reason}` par test, dans un ordre trié.
- **O-F** : hygiène préexistante des tests d'AUTRES lots. 102 répertoires `bell-*` et `atelier-*` restent sous TEMP après la suite (0 `u4b*`). C'était déjà consigné par le worker 1c, §8.4. **Hors lot**, information.

**MAST — risques résiduels :**
- **FM-2.x Coordination / FM-1.4 Loss of history : SIGNALÉ (C-R1).** Deux lots concurrents écrivent dans le même registre. L'attendu de la mission était daté d'avant la fusion concurrente.
- **FM-3.3 Incorrect verification : SIGNALÉ, puis rattrapé.** L'attendu « 0 conflit » reposait sur des fusions à blanc périmées. Le contrôle sur pointe FETCHÉE, exigé par la mission, l'a détecté avant la fusion réelle.
- **FM-3.2 No/incomplete verification : résiduel nul sur le pli.** Les 3 mutants propres survivants sont classés (O-B, O-C, O-D).
- **FM-1.1 Disobey task spec : n/a.** Le pli applique le prototype verbatim et C-W-1 (a)(b)(c) est couvert :
  - (a) par `g2proto1b_clause359_…` ;
  - (b) par `g2proto1b_h4_…` (égalité) et `cw1_h4_…` (au-dessus, 5/99) ;
  - (c) par `g2proto1b_verdicts_…` (T11 et synthétique) et `cw1_verdicts_…` (T17 écrit).
- **FM-2.4 Information withholding : n/a.** Le rendu du worker déclare la déviation D-1 (ré-ancrage de M40).
- FM-1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.5, 2.6, 3.1 : n/a.

**Consultation (R-26) :**
- J'ai appelé l'advisor intégré **deux fois**, et il a répondu les deux fois. Premier appel avant les mutants (~04:55Z) ; j'ai vérifié ses points sur pièces avant de les suivre :
  - ordre d'exécution et clones séparés ;
  - pointe fetchée au moment de la fusion, avec commits à blanc dans le clone jetable ;
  - phase `before` du harnais cw1 avec permutation du test ;
  - VY en BY-OTHER rapportés tels quels ;
  - classement de R02 ;
  - idées de mutants, dont l'écart de Farey (vérifié : 5·20 − 1·99 = 1).
- Second appel avant la clôture (~05:16Z), sur le rendu écrit : aucune correction de fond ; verdict et classement O-B/O-C/O-D confirmés. Deux retouches d'exactitude appliquées : ce compte d'appels (qui disait « une fois ») et l'horodatage de clôture. L'advisor a en outre rectifié son premier avis (« la RUNBOOK, seul candidat à conflit ») : c'est `scripts/export-exclude-tests.json` qui a conflicté ; c'est le contrôle préalable de `merge-1c.sh` (fichiers du lot touchés côté pointe) qui a fait foi, rien n'a été ajusté pour réconcilier.
- Aucun extrait de document sous droits dans le transcript.
- Aucune demande de consultation formée restante, aucun procurement nouveau.

**Indépendance :** le cp-2 de 1c (`docs/CHECKPOINT2-lot-u4b-stats-1-1c.md`), committé par l'orchestrateur pendant ce re-G2 (`7154d18`), n'a pas été ouvert.

## 8. AM-2, périmètre d'écriture, pièces

**AM-2 avant** (`logs\am2-before-1c.log`, 04:43:42Z) :
- `F:\Monark` : `435aec0`, status vide.
- Worktree `F:\Monark-wt-u4bstats1` : `c1e9e30`, status vide.
- `F:\Monark\node_modules` : 220 entrées, `@monark` 10.

**AM-2 après** (`logs\am2-after-1c.log`, 05:14:08Z) :
- `F:\Monark` : **`7154d18`**. Tous les commits intermédiaires sont de l'orchestrateur (auteur Kraidle) : `0cf3171`, `2c276bb`, `31a2b89`, `38c767e`, `da5d6e1`, `5219e3a`, `3bbbb06`, `b87e018`, `7154d18`.
- Plus 2 fichiers non suivis d'un tiers, non ouverts : `docs/sec-4927/LETTRE-4-927-v2.md` et `docs/sec-4927/RENDU-v2.md`.
- Worktree : **`c1e9e30`, status vide (inchangé)**.
- `node_modules` : 220 / 10, inchangé.
- C: : le répertoire sondé `C:/u4b-hyp-g2-1c-no-such-dir` n'existe pas (lectures seules).

**Périmètre :**
- Toutes mes écritures sont sous `F:\tmp\g2-u4bstats1-1c\` : clones `clone`, `clone-mut`, `clone-merge` ; `work1`, `tmp`, `report`, `scripts`, `logs` ; ce rendu.
- Sur `F:\Monark` et le worktree : `git rev-parse/status/log/diff/clone` sous `GIT_OPTIONAL_LOCKS=0`, `git fetch` DEPUIS `F:\Monark` vers mes clones, et des lectures.
- **0 commit dans le dépôt du projet, 0 workflow, 0 poussée.** Les trois commits de fusion à blanc n'existent que dans `clone-merge`, dont le remote `origin` a été retiré.
- Les harnais antérieurs n'ont jamais été exécutés en place : j'ai lancé des copies en chemins seuls, avec leur diff.
- A-7 sur toute commande node/npm.

**Pièces** (sous `F:\tmp\g2-u4bstats1-1c\`, sha256 à 16 caractères) :
- **Scripts :**
  - `step1-diff.sh` 38a31a02… ; `mk-oracle-copy.mjs` 2ffc42fe… ; `oracle-1c.sh` 9982bc45… ; `r25-g2-copy.sh` bda8cdfd… ; `a6-1c.sh` dd43184d… ;
  - `mk-harness-copies.mjs` 20b616d6… ; `g2-mutants-1b-copy1c.mjs` 201256cd… ; `vy-mutants-copy1c.mjs` 7fb4b000… ; `cw1-mutants-copy1c.mjs` f1a08b11… ;
  - `g2-1c-mutants.mjs` d90be544… ; `probe-crossdrive.mjs` 613ae342… ; `run-mutants.sh` 70f38978… ;
  - `cli-1c.mjs` 2f76fbdb… ; `alias-probe.mjs` d7ccb7a0… ; `realpath-probe.mjs` a1f2e7de… ;
  - `merge-1c.sh` ed869543… ; `resolve-exclude-union.mjs` e4eb5d04….
- **Journaux :**
  - composition, oracle, invariants : `step1-diff.log` 687281cc… ; `oracle-1c\exits.txt` c8fa80ee… ; `oracle-1c\test.log` 4db1cd72… ; `a6-invariants-1c.log` 80ee3f65… ; `r25-seg3-1c.log` 58bc86bf… ;
  - mutants : `g2-mutants-1b-copy1c-F.log` adf29dfb… ; `vy-mutants-copy1c.log` f59fac8e… ; `cw1-mutants-copy1c-before.log` f29afd32… ; `cw1-mutants-copy1c-after.log` 222d0e96… ; `g2-1c-mutants-N.log` 41a8287d… ; `g2-1c-mutants-A.log` 1959dbe5… ; `run-mutants.log` 7928f4b0… ;
  - CLI et sondes : `cli-1c.log` 7aa0bfdf… ; `alias-probe-v2.log` 7fe9e46f… ; `realpath-probe.log` efea25ec… ; `path-semantics-probe.log` 75ae80ac… ;
  - fusion : `merge-dry-1c.log` 49567f89… ; `merge-seg1-resolve.log` 8c7c9931… ; `merge-seg2.log` a5c38f57… ; `merge-seg3.log` 7abab34b… ; `merge-r25-blobs-1c.log` d63a4f60… ; `oracle-merged-1c\exits.txt` c8fa80ee… ; `oracle-merged-1c\test.log` ff66dcda… ;
  - AM-2 : `am2-before-1c.log` 3b79579e… ; `am2-after-1c.log` b5a65abf….
- **Sortie :** `report\hyp-report-e2-a.json` 21daeaec… (= `-b`, = le rapport du worker).
- **Invalide, non cité :** `logs\alias-probe.log`.

Clôture du rendu : 2026-09-23T05:18:13Z (`date -u`, dernière modification de ce fichier) ; sha256 de ce fichier dans le message final.

---

`F:\tmp\g2-u4bstats1-1c\G2-1c.md` — sha256 `4ba3f05af35018bd31f7e0a454fecafa0a50088e5a28b3ff9ae45f1a3c0e1a09` (LF, 0 CR, 0 NUL, 269 lignes).

Fichiers utiles :
- `F:\tmp\g2-u4bstats1-1c\scripts\resolve-exclude-union.mjs` — le prototype de résolution pour C-R1.
- `F:\tmp\g2-u4bstats1-1c\scripts\merge-1c.sh`
- `F:\tmp\g2-u4bstats1-1c\scripts\g2-1c-mutants.mjs`
- `F:\tmp\g2-u4bstats1-1c\logs\`
- `F:\tmp\g2-u4bstats1-1c\clone-merge` — la fusion à blanc à `287f07c`, sans remote.
