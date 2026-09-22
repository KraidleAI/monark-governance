# G1 — lot U-4b-STATS-1 (outils hors ligne H-3/H-4/H-6 + rapport clause :359 ; couture 1a/1b) — worker Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# G1 — lot U-4b-STATS-1 (ruling R-K) — outils hors ligne H-3 / H-4 / H-6 + rapport d'entrée de la clause prereg :359

> **En-tête A-12 (rendu écrit au fil de l'eau, consigne investisseur 22:1x UTC ; chaque section est ajoutée au moment où elle est acquise, `fsync` après chaque ajout).**
> Worker `claude-opus-5-5[1m]`, effort max (décision 133) ; réviseur = orchestrateur (R-21) ; aucun commit, aucun workflow (R-20).
> Arbre : worktree `F:/Monark-wt-u4bstats1`, branche `lot/u4b-stats-1`, HEAD = base `50f78b01f7b8d3ed5e83d39cef6436cd39bf998d` (fichiers du lot NON committés).
> `lot/etude-suite` à la rédaction : `b6e0b63` (a bougé pendant le lot : `a703e24` à 22:0x UTC). node `v24.15.0`, win32. Ouverture du rendu : 2026-09-22T22:13Z.
> Corrections appliquées : checkpoint-1 C-1..C-12 (`docs/CHECKPOINT1-lot-u4b-stats-1.md`, lu intégralement après la coupure 1). Consigne : `docs/CONSIGNE-STANDARD-G1.md` (52 lignes, relue après la coupure 2).
> Preuves : `F:/tmp/u4bstats1/` (journaux à en-tête auto-identifiant : `oracle-1a/`, `oracle-full/`, `mutants-run-1a.log`, `mutants-run-full.log`, `r25-*.log`, `fsck.log`, `frozen-*.txt`).

## 0. Résultat (état acquis à 22:13Z ; la section finale « Verdict worker » clôt le rendu)

- **STOP A-5 déclaré, couture 1a/1b.** Le lot entier mesure **R-25 = 1 385** contre la base (au-delà du seuil STOP de 1 150 et de `VIBEGATES_PR_LIMIT` = 1 205). Il n'est donc **pas** rendu en une unité. La couture pré-déclarée donne deux unités mesurées et **vertes chacune SEULE** :
  - **1a** (cœur exact H-3, dans le worktree) : **R-25 = 640** ; oracle 7/7 à exit 0 ; **933 / 932 / 0 / 1** ; **16/16** mutants tués byIntended.
  - **1b** (H-4, H-6, labels, sous-commande `report`, CLI, RUNBOOK ; patch `F:/tmp/u4bstats1/seam/1b.patch` appliqué sur 1a) : **R-25 = 771** (contre l'arbre 1a) ; oracle 7/7 à exit 0 sur 1a+1b ; **941 / 940 / 0 / 1** ; **42/42** mutants tués byIntended.
- **Incident coupure 2 (~21:37 UTC)** : l'outil `scripts/census/u4b/u4b-hyp.mjs` a été trouvé **intégralement NUL** (44 997 octets). Il a été restauré depuis la copie hors dépôt vérifiée, et le `git fsck` du magasin d'objets est vert. Toutes les preuves ont été **régénérées après restauration**. Détail au §1.
- Oracles antérieurs reproduits (C-5 i-v) : masses Q6 3,6 / 6,3 / 5,8 / 10,4 % ; H-6 = 179 / 177 / 2 / 0 ; H-4 = 11/99 et 24/189 ; rapprochement exact de 194/194 positions ; rapport e2 de bout en bout avec `body_digest` épinglé.
- Entrée de la clause :359 sur e2-vs-e2 (preuve de forme, pas une décision) :
  - `h3_no_NON_on_served_strata = true` ;
  - `labels_no_quorum_unresolved = 0` ;
  - `condition_satisfied = true` ;
  - H-3 poolé `OUI`, hors condition.
  - Aucun jeton de décision n'est émis (décision 137).

## 1. Incident — coupure de courant n°2 (~21:37 UTC) : constat, restauration, intégrité

| Constat (mesuré à la reprise) | Valeur |
|---|---|
| `scripts/census/u4b/u4b-hyp.mjs` (non suivi `??`) | **44 997 octets, 44 997 NUL**, dernier octet `\0` |
| les 4 autres fichiers du lot | sha256 = état complet attendu (`5a019059…`, `067e890c…`, `fe1fc948…`, `cb729fef…`), 0 NUL, fin `\n` |
| taille 44 997 | ne correspond à aucun état livré. **Hypothèse** cohérente avec la taille, NON mesurée : la métadonnée de taille d'un état muté antérieur (M01, `5n`→`10n`, +1 octet) a été rejouée par NTFS, et les données n'ont jamais été vidées sur disque |
| copies hors dépôt `F:/tmp/u4bstats1/seam/{full,1a}/*`, `1b.patch`, harnais, journaux | 0 NUL, fin `\n`, sha = valeurs relevées avant la coupure |

- **Contradiction à signaler (R-21)** : `docs/CHANTIERS.md` @ `a703e24` (+34) affirme « 0 octet NUL dans leurs worktrees » pour les agents relancés. Or l'outil de ce lot était un fichier **non suivi** entièrement NUL. Le contrôle ne couvrait vraisemblablement que les fichiers suivis (`git diff`).
  - **Recommandation** (tous les worktrees relancés : 1b-4, GFSYNC-1, …) : compter les NUL sur `git ls-files -z -m -o --exclude-standard` (fichiers modifiés **et** non suivis), et pas seulement sur `git diff`.
- **Restauration** : copie de `F:/tmp/u4bstats1/seam/full/u4b-hyp.mjs` (44 996 octets, sha `07e25e19…`, 0 NUL), puis vidage sur disque par `fs.fsyncSync` (FlushFileBuffers ; `F:/tmp/u4bstats1/fsync.mjs`). Même vidage après **chaque** écriture ultérieure : fichiers du lot, patch, journaux, rendu.
- **Magasin d'objets git (partagé avec `F:/Monark`)** : mes mesures R-25 par index temporaire ont écrit des objets non référencés (blobs et arbres ; aucun ref, aucun commit, R-20).
  - Les 8 blobs d'état et l'arbre `tree-1a` (`f6670e0c903c35060f89ed2ac6fd8f5f8e65b722`) sont présents et lisibles, avec un contenu de sha exact.
  - `git fsck --no-progress --no-dangling` : **exit 0, 0 ligne** (`F:/tmp/u4bstats1/fsck.log`).
  - Risque écarté : un objet corrompu de même id aurait pu être réutilisé silencieusement par un futur `git add` de l'orchestrateur.
- `node_modules` du worktree : 220 entrées (= `F:/Monark`) ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-u4bstats1\packages\rpc-guard\src\index.ts` (A-2).
- **Conséquence** : oracles, mutants et R-25 **régénérés après restauration**. Les preuves d'avant la coupure sont conservées à part (`oracle-1a-precut/`, `oracle-full-v1/`, `mutants-*-precut*`, `mutants-*-full-v1*`) et ne sont pas citées comme preuves finales.

## 2. Couture (A-5), fichiers livrés, sha, R-25

**Motif** : un premier jet d'une seule pièce mesurait 1 375, puis 1 385 dans la version finale. C'est au-delà du seuil STOP A-5 (1 150) et de `VIBEGATES_PR_LIMIT` = 1 205, et bien au-delà de la borne de mission (< 800). La couture suit la ligne naturelle du prereg : **1a** = la seule statistique qui entre dans la clause :359 (H-3 exact) ; **1b** = tout ce qui est rapporté à côté (H-4, H-6, labels, census) et le branchement (`report`, CLI, RUNBOOK). La couture est **pré-déclarée ici** ; ce n'est jamais un dépassement rendu.

**Unité 1a — état du worktree** (à committer en premier) :

| Fichier | État | Lignes | sha256 (octets) |
|---|---|---|---|
| `scripts/census/u4b/u4b-hyp.mjs` | nouveau | 254 | `50436e8f4a027a60a2d62278f078d0579cdc72dbb314edd8c3357d2900a6b8bd` |
| `scripts/census/u4b/u4b-hyp.d.mts` | nouveau | 69 | `6297540c1410b048553708b5343000e11d01b6a0a633dad8eb7c3d2c17560ba2` |
| `apps/sentinel/test/u4b-hyp.test.ts` | nouveau | 312 | `6778c22bab80a05e24dd968605b749a4ace11f6f1b79256d9c6aaca3446705ff` |
| `scripts/export-exclude-tests.json` | modifié (+3/−2 ; union : 1 test ajouté + phrase de motif) | — | `cb729fef992d4ac8d58e64abe89fd71179654bc5f4e28c022a4e57b96e0b8e9a` |

**Unité 1b** = `F:/tmp/u4bstats1/seam/1b.patch` (sha256 `503c186a68b6ea9b73a94a47fb21866b4c3a1eaffb3e5d254fd2712c49dcd7e6`, 891 lignes). Il s'applique sur l'arbre 1a (`git apply --check` puis `git apply`, vérifié dans les deux sens) et produit :

| Fichier | Lignes | sha256 après 1b |
|---|---|---|
| `scripts/census/u4b/u4b-hyp.mjs` | 692 | `07e25e197f1c57fe3ea14fe1c4c50e4ceeda476fd6150e39be8cf04a2760393e` |
| `scripts/census/u4b/u4b-hyp.d.mts` | 154 | `5a019059af4292169725f3cb1a48436f53cd4feb57530d865b293d954000f6d6` |
| `apps/sentinel/test/u4b-hyp.test.ts` | 534 | `040f179ea1c03f0bbe2400ae9c9532ea10c7ef119246313b52fc1bd9c1c9b17b` |
| `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md` | :439-440, :444, :488 réécrits (C-8) | `fe1fc9481062d0716cc039192cc80e50a84b8aa5750d20888ea0dd8811a41187` |
| `scripts/export-exclude-tests.json` | inchangé par 1b | `cb729fef…` |

**R-25**, mesuré avec le pathspec **VERBATIM** de `.github/workflows/ci.yml:65` (docs exclus). La mesure passe par un index temporaire (`git read-tree HEAD && git add -A` sous `GIT_INDEX_FILE`) : les fichiers non suivis sont comptés, l'index réel n'est jamais touché. Script : `F:/tmp/u4bstats1/r25.sh` ; journaux : `r25-1a.log`, `r25-1b.log`, `r25-full.log`.

| Mesure | Base | Insertions | Suppressions | **R-25** |
|---|---|---|---|---|
| 1a | `50f78b0` | 638 | 2 | **640** |
| 1b | arbre 1a `f6670e0c903c35060f89ed2ac6fd8f5f8e65b722` | 758 | 13 | **771** |
| 1a+1b (NON rendu d'un bloc) | `50f78b0` | 1 383 | 2 | 1 385 |

**Ordre d'application pour l'orchestrateur** :
1. Committer l'état 1a du worktree. Au G7 1a, vérifier `DELIVERED.sha256`.
2. `git apply --check F:/tmp/u4bstats1/seam/1b.patch && git apply F:/tmp/u4bstats1/seam/1b.patch`.
3. Vérifier `DELIVERED-1b.sha256`, puis committer 1b.

Le patch n'a pas été rebasé (R-20). Vérifié : le RUNBOOK est **inchangé** sur `lot/etude-suite` entre `50f78b0` et la pointe (`git log 50f78b0..HEAD -- <RUNBOOK>` = vide), donc son hunk s'applique tel quel.

## 3. Oracles (A-3 : `cmd > log 2>&1; echo exit=$?`, jamais après un pipe ; 8 variables payantes RETIRÉES du processus, A-7)

Commande : `bash F:/tmp/u4bstats1/oracle.sh <label>`. Chaque journal porte un en-tête A-12 : HEAD, branche, `git status --porcelain`, sha des 5 fichiers du lot, node, commande exacte.

| Gate | base `50f78b0` (avant lot) | **1a** (après restauration) | **1a+1b v2** (après restauration) |
|---|---|---|---|
| `gate:vocab` | — | exit 0 | exit 0 |
| `typecheck` | — | exit 0 | exit 0 |
| `test` (tests / pass / fail / skip) | 921 / 920 / 0 / 1 | **933 / 932 / 0 / 1** | **941 / 940 / 0 / 1** |
| `lint` | — | exit 0 | exit 0 |
| `lint:ratchet` | 69/69 | 69/69, exit 0 | 69/69, exit 0 |
| `lang:gate` | — | exit 0 | exit 0 |
| `export:check` | — | exit 0 | exit 0 |

- Le seul skip est pré-existant et nommé à la base : `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent »). Les écarts de compte sont exactement les tests neufs : +12 en 1a, +20 en 1a+1b.
- Journaux : `F:/tmp/u4bstats1/oracle-1a/*.log`, `F:/tmp/u4bstats1/oracle-full/*.log` ; base : `F:/tmp/u4bstats1/base/test.log`.
- Le ratchet reste à 69 : le test passe par les interfaces typées du `.d.mts`, sans aucun `any`. Les 6 règles du ratchet ont été vérifiées à 0 violation sur le fichier de test (`eslint --rule …`, exit 0).

## 4. Mutants (D-1 ; A-11 byIntended ; A-12)

- **Harnais** `F:/tmp/u4bstats1/mutants.mjs` (sha256 `619b620c7f0e641afadf113d44b54d0e66f2207121ee4d135f3fbaa4caec109d`) :
  - chaque mutation est textuelle et doit correspondre **exactement une fois** ;
  - `node --test --test-reporter=tap apps/sentinel/test/u4b-hyp.test.ts`, variables payantes retirées du processus enfant, TAP normalisé CRLF ;
  - un mutant est compté tué **seulement** si le TAP porte `not ok N - <test visé>` ;
  - restauration à l'octet vérifiée par sha après chaque mutant ;
  - en-tête A-12 (HEAD, `git status`, sha de l'outil et du test, commande) ; par mutant : diff, sha muté, sha restauré, tests rouges.
- **1a (worktree)** : **16/16 tués byIntended**, outil restauré à `50436e8f…` (`F:/tmp/u4bstats1/mutants-run-1a.log`, `mutants-result-1a.json`).
- **1a+1b v2** : **42/42 tués byIntended**, outil restauré à `07e25e19…` (`mutants-run-full.log`, `mutants-result-full.json`).
- **Couverture D-1** (table « test ← mutants qui le rougissent » dans chaque journal) : **chacun des 12 tests de 1a et des 20 tests de 1a+1b a au moins un mutant rouge ; 0 test déclaratif**.

| Mutant | Test visé (byIntended) | Objet |
|---|---|---|
| M01 niveau 5 % → 10 % | `u4b_hyp_h3_one_sided_lower_tail_at_5_percent` | constante pré-enregistrée |
| M02 unilatéral → bilatéral | idem | sens (C-10) |
| M03 queue haute | idem | sens inversé (C-10) |
| M04 `<=` → `<` | `u4b_hyp_bb_hand_cases_exact_rationals` (p-value = 1/20 exactement) | frontière (C-3 ii) |
| M05 flottant au lieu du BigInt | idem (1/20 n'est pas dyadique) | exactitude |
| M06 cellule poolée oubliée | `u4b_hyp_h3_e2_vs_e2_strata_and_pooled` | poolé (C-3 i) |
| M07 strate n < 100 servie | `u4b_hyp_h3_verdict_enumeration_precedence_and_predicate` | UNDER_CALIB |
| M08 UNDER_CALIB compté NON | idem | C-1 |
| M09 NON_TESTABLE_E2 compté NON | idem | C-1 |
| M10 `p` de la méta non asserté | `u4b_hyp_h3_reads_frozen_meta_and_refuses_inconsistency` | C-3 iii |
| M11 sha de la fixture e2 ignoré | `u4b_hyp_e2_comparison_fixture_sha_enforced` | C-10 |
| M12 deficit dans le numérateur H-4 | `u4b_hyp_h4_synthetic_first_call_deficit_and_abstention` | C-6 |
| M13 « premier appel » = dernier | idem | C-6 |
| M14 retard 4 accepté | `u4b_hyp_h6_synthetic_lag_bound_membership_and_anchor` | C-7 |
| M15 couverture ouverte `<` | `u4b_hyp_h3_e2_vs_e2_strata_and_pooled` | couverture fermée |
| M16 sur-revendication au lieu de la phrase C-11 | `u4b_hyp_summary_vocabulary_gate_and_c11_sentence` | C-9 / C-11 |
| M17 jeton de décision injecté | idem | C-4 |
| M18..M33 « confidence » injecté dans CHACUNE des 16 constantes servies | idem | A-9 |
| M34 compteur labels pris sur `residual` | `u4b_hyp_labels_no_quorum_counts_null_repayment_only` | C-2 |
| M35 sha de l'outil absent de la provenance | `u4b_hyp_report_e2_end_to_end_deterministic_body_digest` | C-4 |
| M36 sha du prereg non vérifié | `u4b_hyp_c11_sentence_read_verbatim_from_pinned_prereg` | C-11 |
| M37 loi miroir a↔b | `u4b_hyp_atoms_keep_the_lower_tail_test_conservative` | loi nulle |
| M38 `price_prev` ignoré | `u4b_hyp_h6_reproduces_adr_u4_on_e2` | C-7 |
| M39 garde des flags interdits retirée | `u4b_hyp_cli_refuses_forbidden_unknown_and_in_repo_flags` | C-10 |
| M40 `--out` dans le dépôt accepté | idem | sortie hors dépôt |
| M41 queue stricte (`j < k`) | `u4b_hyp_bb_reproduces_advisor_q6_masses` | loi nulle |
| M42 forme `b` décalée | `u4b_hyp_bb_total_mass_and_strict_monotone_tail` | masse totale |

En 1a, les mutants actifs sont M01-M11, M15, M36, M37, M41 et M42. Les autres ciblent du code de 1b.

**Effet de bord trouvé et corrigé (R-21)** : au premier run à 42 mutants, M40 a laissé un fichier `hyp-report-inrepo.json` à la racine du worktree (créé à 23:01:19 heure locale par l'outil muté, sha outil `3fa9c114…` ; absent de `F:/Monark`).
- Cause : T19 passait un `--out` dans le dépôt dont le répertoire parent existe. Une régression de la garde aurait donc écrit dans le dépôt.
- Correction (1b v2) : le `--out` du test vise `<racine>/u4b-hyp-no-such-dir/…` (parent absent, donc même une garde régressée échoue sans écrire), et le test ajoute `assert.equal(existsSync(inRepoOut), false)`.
- Le fichier parasite a été supprimé. Le patch 1b a été régénéré (v1 `seam/1b-v1.patch` conservé), oracle complet et mutants rejoués (v2 : 42/42, M40 toujours tué par T19, `git status` propre après le run).

## 5. Conception livrée, sources, oracles antérieurs (C-5)

### 5.1 H-3, unité 1a (`u4b-hyp.mjs` : `bbDistribution`, `bbLowerTail`, `rejectsAtLevel`, `pOfN`, `parseScores`, `h3Cell`, `computeH3`)

- **Statistique** (prereg :100) : K = #{ s dans les lignes `score_a` de la fixture e2 (sha LF `301d39fa…`, vérifié à l'exécution, fail-closed) de la cellule : s ≤ q̂_frais }. La couverture est **fermée** (`s <= qhat`).
- **Loi nulle** : BetaBinomial(N = n_e2, a = p, b = n + 1 − p), avec n = taille fraîche de la cellule et p = ⌈(n+1)(1 − α)⌉, α = 1/100.
- **Dérivation exacte** (dans l'ADR proposé ; aucune formule de mémoire) : sous échangeabilité des n + N scores à valeurs distinctes, la position des N valeurs e2 parmi les n + N statistiques d'ordre est uniforme sur C(n+N, N) configurations. On a K = j ssi exactement j valeurs e2 précèdent la p-ième valeur fraîche, soit C(p−1+j, j)·C(n−p+N−j, N−j) configurations. D'où P(K = j) = C(p−1+j, j)·C(n−p+N−j, N−j) / C(n+N, N). C'est la pmf de BB(N, p, n+1−p), puisque a + b − 1 = n. C'est exactement ce que calcule `bbDistribution`, qui vérifie **exactement** masse totale = 1 (sinon refus nommé).
  - Concordance [lu] avec Angelopoulos & Bates (arXiv:2107.07511v6) :
    - p.14 : couverture conditionnelle ~ Beta(n+1−l, l), l = ⌊(n+1)α⌋, donc n+1−l = p ; attribuée à Vovk [14] ;
    - p.49 : le compte suit une BetaBinom(n_val, n+1−l, l) ;
    - p.50 : moments ; Var(K) = N·l·(n+1−l)·(n+1+N) / ((n+1)²(n+2)) avec R = 1, testé à l'égalité exacte (T3).
- **Atomes** (prereg :100 : 509/565 scores e2 exactement nuls). On départage les ex æquo par des uniformes indépendantes ; les rangs lexicographiques sont alors uniformes, et K_départagé suit exactement BB. Or K_fermé ≥ K_départagé point par point, car (s_j, u_j) < (q̂, u\*) implique s_j ≤ q̂. Donc P(K ≤ k) ≤ BB_CDF(k) : la p-value de queue basse calculée avec BB est **super-uniforme sous H0**, et le test est **valide et conservateur** (perte de puissance, jamais anti-conservateur ; prereg :100).
  - Analogue primaire [lu] : **Vovk 2012, §3, Prop. 2b** (PMLR 25:475-490, p. 478-479 ; texte local `docs/biblio/M012-h/_txt/vovk-2012.txt:197-258`, PDF sha `7687a3be…` = README ; fiche en dépôt `docs/biblio/M012-h/fiche-vovk-2012.md`). Le critère binomial y est suffisant en général, et nécessaire et suffisant **seulement si** le score est continu. La preuve : E′ = E″ sauf sur un atome.
  - Preuve exécutable : T6 fait une énumération exacte avec atomes et relève une inégalité stricte, ce qui prouve que le test n'est pas vacuous.
- **Décision** : p-value = P(K′ ≤ K), rationnel **exact** (BigInt). NON ssi p ≤ 5/100.
  - Justification [lu] A&B A.1.1 : une p-value valide satisfait P_H(p ≤ t) ≤ t ; rejeter à p ≤ α donne une erreur ≤ α.
  - La **queue basse** correspond à l'hypothèse « couverture trop basse » (prereg :100).
  - Aucun lissage ni tie-break aléatoire : l'alternative « smoothed » du prereg :100 n'est PAS adoptée, et n'existe pas dans l'outil.
- **Verdicts** (C-1) : ensemble fermé {OUI, NON, UNDER_CALIB, NON_TESTABLE_E2}, avec la précédence UNDER_CALIB > NON_TESTABLE_E2 > test.
  - UNDER_CALIB : n_frais < 100 ; q̂ null chez le producteur gelé, `u4b-scores.mjs:63-71`.
  - NON_TESTABLE_E2 : n_e2 < 50, prereg :100 ; c'est toujours le cas des strates 2 et 3 d'e2 (46 et 8).
- **Épinglages C-3** (cités un par un) :
  - (i) poolé = `meta.cell_a.{n, p, qhat}` du producteur gelé (`u4b-scores.mjs:266-270`, `...qhatOf(rows)`) ;
  - (ii) frontière p ≤ 5/100 (`rejectsAtLevel`) ;
  - (iii) `n`, `p`, `q̂` **lus** dans la méta et **assertés** :
    - `p` = ⌈99(n+1)/100⌉ en BigInt, égal à `Math.ceil((n+1)*0.99)` (expression gelée `u4b-scores.mjs:65`) ; 0 divergence pour n ∈ [1, 20 000], **recomputé par moi** (`F:/tmp/u4bstats1/pOfN-check.log`, même mesure que le cp-1) ;
    - `n` = nombre de lignes fraîches de la cellule ;
    - `q̂` = p-ième plus petit score frais ;
    - `strate` = `strateOf(yhat)`, importée du fichier gelé ;
    - `cell_a.alpha === 0.01` et `n_min === 100` (garde de dérive du producteur).
- **Sur NON** (C-11) :
  - l'outil rapporte k, n_e2, E[K] = n_e2·p/(n+1), la couverture observée, nominale (99/100) et attendue sous H0 (p/(n+1)), le manque (E[K] − k), l'écart à la nominale et la p-value ;
  - `barber_thm2_bound: "not_estimated"` : Barber et al. 2023, Thm 2, borne Σ w̃·d_TV [lu], texte local `docs/biblio/ukemi-modeL/_txt/barber-candes-ramdas-tibshirani-2023.txt:755-767`, fiche en dépôt `L-lecture-tibshirani2019-barber2023.md`. Aucun estimateur n'est pré-enregistré ; jamais un estimateur improvisé.
- **Phrase C-11** : lue **verbatim** dans le prereg :100 (sha LF `1971d9b1…` vérifié, fail-closed ; unique occurrence exigée ; sha256 de la phrase `b76dc988…`). Elle n'est tapée dans **aucun** fichier source (sinon `lang:gate` rougirait) et est présente sur **chaque** ligne OUI, et seulement là (T18).

### 5.2 Unité 1b (`computeH4`, `computeH6`, `computeLabels`, `computeCensusHyps`, `clause359`, `buildSummary`, CLI `h3|h4|h6|report`)

- **H-4** (C-6) :
  - les appels de l'épisode sont ordonnés par (block, log_index) ;
  - chaque remboursement est calculé en `floorDiv` (ADR-U3 D1), et **chaque position** (user, dette, collatéral) est **rapprochée exactement** de `repayment_base` de U3-realized ; tout écart est refusé ; les positions `repayment_base: null` sont exclues et **comptées** ;
  - numérateur = Σ des appels APRÈS le premier ; dénominateur = `y` du JSONL de scores ; deficit rapporté **à part** ;
  - médiane exacte (deux valeurs centrales rapportées) et Σ par strate, sous-ensemble multi-appels en secondaire étiqueté ;
  - fractions multi-appels (cellule A **et** tous les liquidés) comparées à 5/100 (NON ssi > 5/100).
- **H-6** (C-7) :
  - valeurs servies = lignes `kind:"price"` WETH de U3-inputs aux blocs des appels de l'épisode : `price` au bloc b **et** `price_prev` à b−1, dédoublonnées par bloc (deux valeurs différentes au même bloc ⇒ refus) ;
  - série = ancre p0 + lignes `update` du oracle-path **réduit** ;
  - NON ssi une valeur ∉ events ∪ {p0}, ou retard > 3 events, ou retard non défini ;
  - `anchor.source` est rapporté : `book_weth_price_base_8dec` signale le chemin D-n de repli (R-I ; libellés du réducteur gelé `u4b-reduce.mjs:68-69`) ;
  - biais d'échantillon (valeurs prises aux seuls blocs de liquidation) déclaré, comme ADR-U4:106-107.
- **Labels et :359** (C-2) :
  - `labels_no_quorum_unresolved` = #lignes (épisode, `repayment_base === null`) (`u3-realized.mjs:226`) ; `residual ∋ no_quorum` est compté à part ;
  - `clause_359` = {`h3_no_NON_on_served_strata`, `labels_no_quorum_unresolved`, `condition_satisfied`, `h3_pooled_verdict_outside_condition`}.
  - **Observation** : `u4b-scores.mjs:120` fait `BigInt(p.repayment_base)` sur **chaque** ligne de l'épisode. Le scoreur gelé lève donc une exception dès qu'un label est `null` (étape 6b). Si un rapport existe, ce compteur vaut structurellement 0 **pour le même fichier de labels** : c'est une ceinture, dite telle quelle.
- **Census** :
  - H-2 : n par strate, UNDER_CALIB ;
  - H-2bis : intérieur ssi p < n, i.e. n ≥ 199 ; sinon q̂ = max de la strate, asserté `qhat === max_score` ;
  - clause 3 à côté de q̂₀ : `crossed_yhat_zero` et {ŷ=0 ∧ liquidés} avec Y, sous-divisé par `pstar` ;
  - H-5 : population = comptes − `no_aweth` − `non_evaluable_x` − `non_evaluable_emode`, assertée = `crossed + no_crossing` ;
  - H-7 : `pstar_is_anchor` ; l'identité HF == hf0 est couverte par les tests du scoreur gelé, `ukemi-u4b-scores.test.ts:68` et :118-124.
- **Rapport** (C-4) :
  - forme `{schema, kind, provenance:{tool:{rel, sha256_lf}, node, inputs (sha LF par rôle, e2 + prereg épinglés), event_id}, body, body_digest}` ;
  - `body_digest` = sha256 du JSON canonique du **seul** corps : la provenance, dont le sha de l'outil, est hors digest ;
  - aucune horloge, aucun chemin absolu : deux exécutions produisent des octets identiques (testé) ;
  - `--out` est refusé dans le dépôt, son parent doit exister, et il n'est jamais écrasé (`wx`) ;
  - tous les arguments sont REQUIS ; un argument inconnu, en double ou interdit (`--alpha`, `--level`, `--side`, `--ref`, `--reference`, `--smoothed`, `--seed`, `--tie-break`, `--two-sided`, `--n-min`) provoque un refus ;
  - **jamais** de jeton de décision (décision 137) ;
  - l'outil est PUR : il n'importe que `node:fs`, `node:crypto`, `node:url`, `node:path` et `./u4b-scores.mjs` (grep : 0 `fetch(`, `node:http`, `undici`, `child_process` ou `process.env`).

### 5.3 Chiffres e2-vs-e2 (preuve de forme, sortie de `report` sur les fixtures committées)

Le corps du rapport a pour `body_digest` `49b138c3b0ea1c4debfd6276df898cb9e1379a93b676f0a9fe04fd04fb441d5f` : épinglé par T17, et **recalculé** par un `canon` indépendant sur `F:/tmp/u4bstats1/smoke/hyp-report-e2-final.json`.
- Ce fichier a été **régénéré avec l'outil LIVRÉ** : 1b appliqué puis retiré, 1a re-vérifié par `sha256sum -c`. Sa provenance porte `tool.sha256_lf = 07e25e19…` ; sha du fichier `5179f3de379b374ded9f53ea30d2c8ab8bf68da921cfb2f14d9095dabc3be432`.
- L'ancien `smoke/hyp-report-e2.json` portait l'outil d'avant les correctifs ASCII (`36f1dc99…`). Son corps est identique (même digest), mais il n'est pas cité comme preuve finale.

| H-3 | n frais | p | q̂ | n_e2 | K | atomes à 0 | p-value exacte | verdict |
|---|---|---|---|---|---|---|---|---|
| strate 0 | 363 | 361 | 23169870364 | 363 | 361 | 344 | 120214/174725 ≈ 0,688 | OUI |
| strate 1 | 148 | 148 (q̂ = max, H-2bis) | 3609978241254 | 148 | 148 | 120 | 1/1 | OUI |
| strate 2 | 46 | — | null | 46 | — | — | — | UNDER_CALIB |
| strate 3 | 8 | — | null | 8 | — | — | — | UNDER_CALIB |
| poolée A | 565 | 561 | 1861718113769 | 565 | 561 | 509 | 1951057469/3061898805 ≈ 0,637 | OUI (hors :359) |

- **H-4** : cellule A **11/99** (0,111), tous liquidés **24/189** (0,127), NON contre 5/100 dans les deux cas (attendu, prereg :101). Rapprochement exact de **194/194** positions ; 0 abstention ; 239 appels, tous dans la fenêtre. Part de Y après le premier appel :

| Strate | Liquidés | Multi-appels | Σ | Médiane | Sous-ensemble multi-appels : Σ / médiane |
|---|---|---|---|---|---|
| 0 | 24 | 2 | 0,00838 | 0 | 0,485 / 0,478 |
| 1 | 51 | 7 | 0,10810 | 0 | 0,446 / 0,351 |
| 2 | 21 | 1 | 0,05664 | 0 | 0,685 / 0,685 |
| 3 | 3 | 1 | 0,33901 | 0 | 0,626 / 0,626 |
| poolé | 99 | 11 | 0,16693 | 0 | 0,613 / 0,446 |

  Deficit à part : 0.
- **H-6** : OUI. 179 valeurs servies : **177** dans la série, **2 = p0**, **0** hors série. Retards {0 : 111, 1 : 49, 2 : 13, 3 : 6}, max 3. Sur les 107 valeurs `price` : {0 : 70 (dont 1 sur l'ancre), 1 : **26**, 2 : **6**, 3 : **5**}. min servi = min events = 345670460000. Ancre = repli book, donc chemin D-n en course si `pre_b0_anchor` n'est pas capturé.
- **H-5** : 9 452 ≥ 100. **H-7** : `pstar_is_anchor` = 52. **Labels** : 194 lignes, 0 `null`, 0 `no_quorum`.
- **:359** : `{true, 0, true}`, poolé OUI hors condition.

### 5.4 Oracles indépendants et ANTÉRIEURS à l'outil (C-5), chacun en test

| # | Oracle (source antérieure) | Reproduit | Test |
|---|---|---|---|
| i | Avis advisor-defi Q6 :71 : masses de faux-NON de la règle `k=2` sous BB(565, p, n+1−p) = 3,6 / 5,8 / 6,3 / 10,4 % (n = 150 / 565 / 300 / 1000) | exact : 0,035769 / 0,058016 / 0,063183 / 0,103824 (arrondi à 0,1 pt) | T4 |
| ii | ADR-U4 :104-112 : 179 valeurs, 177 ∈ events, 2 = p0, retards 26 / 6 / 5 | identique | T15 |
| iii | Avis Q6 :76 : 11/99 cellule A, 24/189 tous | identique | T13 |
| iv | U3-realized épinglé (`b4d93590…`) : Σ par appel `floorDiv` == `repayment_base` | 194/194 exact ; refus nommé sur écart (synthétique) | T13, T14 |
| v | `report` e2 de bout en bout | octets identiques sur 2 runs ; `body_digest` épinglé | T17 |
| + | formes closes : hockey-stick C(k+a, k)/C(N+a, N) (b = 1), P(K ≤ N−1) = N/(N+a), p-value = 1/20 exactement | exact | T1, T8 |
| + | moments A&B p.50 (R = 1) | égalité exacte | T3 |
| + | implémentation lgamma indépendante (Lanczos) | écart < 1e-9 sur 8 cas ; une divergence exacte/lgamma rougit | T5 |
| + | énumération exacte avec atomes | P(K ≤ k) ≤ BB CDF partout, strict quelque part | T6 |

**Modes MAST** (C-10 ; catégories MAST selon le doc 06 §2.4/§6.4, arXiv:2503.13657 ; libellés de mode = ceux du cp-1) :
- **dérive de spécification** (catégorie spécification) : niveau, sens et couverture sont des constantes, et aucun flag ne les change (refus nommé) ; M01, M02, M03, M15 ;
- **vérification circulaire** (catégorie vérification) : oracles antérieurs et indépendants (i)-(v), lgamma indépendant, énumération exacte ;
- **acceptation silencieuse d'argument** : un argument inconnu, en double, manquant ou interdit provoque un refus ; M39, M40 ;
- **vérification incomplète** (catégorie vérification) : table D-1 test ← mutant, 0 test déclaratif ;
- **perte d'historique** (reprise après les coupures 1 et 2) : l'état a été reconstitué depuis les sha consignés sur disque, jamais de mémoire ; toutes les preuves ont été régénérées.

**Index des tests** (`apps/sentinel/test/u4b-hyp.test.ts`, ordre du fichier final ; T1-T12 = unité 1a, T13-T20 = unité 1b)

| T | Nom | T | Nom |
|---|---|---|---|
| T1 | `u4b_hyp_bb_hand_cases_exact_rationals` | T11 | `u4b_hyp_h3_e2_vs_e2_strata_and_pooled` |
| T2 | `u4b_hyp_bb_total_mass_and_strict_monotone_tail` | T12 | `u4b_hyp_c11_sentence_read_verbatim_from_pinned_prereg` |
| T3 | `u4b_hyp_bb_moments_match_angelopoulos_bates_p50` | T13 | `u4b_hyp_h4_e2_counts_reconciliation_and_shares` |
| T4 | `u4b_hyp_bb_reproduces_advisor_q6_masses` | T14 | `u4b_hyp_h4_synthetic_first_call_deficit_and_abstention` |
| T5 | `u4b_hyp_bb_exact_agrees_with_independent_lgamma` | T15 | `u4b_hyp_h6_reproduces_adr_u4_on_e2` |
| T6 | `u4b_hyp_atoms_keep_the_lower_tail_test_conservative` | T16 | `u4b_hyp_h6_synthetic_lag_bound_membership_and_anchor` |
| T7 | `u4b_hyp_h3_verdict_enumeration_precedence_and_predicate` | T17 | `u4b_hyp_report_e2_end_to_end_deterministic_body_digest` |
| T8 | `u4b_hyp_h3_one_sided_lower_tail_at_5_percent` | T18 | `u4b_hyp_summary_vocabulary_gate_and_c11_sentence` |
| T9 | `u4b_hyp_h3_reads_frozen_meta_and_refuses_inconsistency` | T19 | `u4b_hyp_cli_refuses_forbidden_unknown_and_in_repo_flags` |
| T10 | `u4b_hyp_e2_comparison_fixture_sha_enforced` | T20 | `u4b_hyp_labels_no_quorum_counts_null_repayment_only` |

## 6. Corrections checkpoint-1 C-1..C-12 : état

| # | Exigence (cp-1) | État | Où, et preuve |
|---|---|---|---|
| C-1 | Verdict fermé {OUI, NON, UNDER_CALIB, NON_TESTABLE_E2} par strate et poolé ; :359 compte NON sur les seules strates servies | **fait** (1a ; clause en 1b) | `h3Cell`, `computeH3` (`non_on_served_strata`) ; T7 + M07/M08/M09 ; niveau clause : T20 (served NON ⇒ `false`, UNDER_CALIB/NON_TESTABLE_E2 ⇒ `true`) |
| C-2 | `report --u3-realized` ; compteur = lignes (EP, `repayment_base === null`) ; `residual ∋ no_quorum` à part ; l'ADR nomme le compteur | **fait** (1b) | `computeLabels` ; `--u3-realized` REQUIS (T19) ; T20 + M34 ; ADR proposé §4. « Depuis `census` » est remplacé (clé absente, mesuré au cp-1) |
| C-3 | n/p/q̂ lus dans la méta + assert ; poolé = `meta.cell_a` ; frontière ≤ 0,05 ; arithmétique exacte ; épinglages cités un par un dans l'ADR | **fait** (1a) | §5.1 ; T9, T11, T1 + M10, M06, M04, M05 ; ADR proposé §2. Le ruling d'orchestrateur **journalisé** pré-donnée est un acte de l'orchestrateur : C-1..C-12 transmis, consignés dans `docs/CHANTIERS.md` @ `a703e24`. « Pré-donnée » vérifié à la livraison : `F:/course-ukemi/` ne contient que `discover/` (17:43) et `select/` (18:09) heure locale ; ni `reduce/`, ni `label/`, ni `offline/` |
| C-4 | Ordre pré-donnée : fusion + sha LF de l'outil dans la provenance ET au sidecar 6 AVANT l'étape 6 ; brut frais avant fusion ⇒ D-n ; jamais « GO » | **fait côté worker** (1b + RUNBOOK) ; l'ordre de fusion est un acte de l'orchestrateur | `provenance.tool.sha256_lf` (T17 + M35) ; jeton de décision absent (T17, T18 + M17) ; RUNBOOK 6d : commande `git show HEAD:… \| tr -d '\r' \| sha256sum` → sidecar 6 AVANT 6a. **Avec la couture**, le sha à consigner est celui du blob APRÈS la fusion de 1b |
| C-5 | Oracles indépendants et antérieurs (i)-(v) ; exacte vs lgamma divergentes ⇒ ROUGE | **fait** | §5.4 ; T4, T15, T13, T14, T17, T5 |
| C-6 | H-4 : ordre (block, log_index) ; numérateur après le premier ; dénominateur `y` ; deficit à part ; médiane sur les liquidés de la strate (0 pour mono-appel) ; multi-appels en secondaire | **fait** (1b) | `computeH4` ; T13 (recalcul indépendant par strate) ; T14 (synthétique : 6/13, 1/3, 2/3, abstention) + M12, M13 |
| C-7 | H-6 : `price` ET `price_prev` WETH aux blocs de EP ; série `update` + ancre ; NON ssi ∉ events ∪ {p0} ou retard > 3 ; dépendance `pre_b0_anchor` déclarée ; repli book = D-n ; biais d'échantillon déclaré | **fait** (1b) | `computeH6` ; T15 + M38 ; T16 (retard 3 OK, 4 NON, hors série NON) + M14 ; `anchor.book_fallback_d_n_path` |
| C-8 | RUNBOOK :439-440, :444, :488 réécrits dans le lot ; l'ADR déclare les tuyaux | **fait** | 1b (RUNBOOK) ; `F:/tmp/u4bstats1/RUNBOOK-DELTA.md` ; ADR proposé §5 (Tuyaux) |
| C-9 | Test A-9 par la VRAIE gate (`scanText` + motifs globaux) sur le texte généré ; phrase C-11 sur tout OUI ; mutant de sur-revendication ROUGE | **fait** (1b) | T18 : `compilePatterns` + `scanText` de `scripts/grep-forbidden.mjs` (global + portées harness, site, sentinel + motifs A-9/C-4/C-11) sur chaque ligne servie de 2 états servis et sur chaque constante ; C-11 sur chaque OUI et seulement là ; M16, M17, M18..M33 |
| C-10 | MAST nommés + contre-mesures ; ≥ 8 mutants dont les 8 listés | **fait** | §5.4 (MAST) ; 42 mutants, dont M03 (sens), M04 (`<` vs `≤`), M10 (p sans assert), M09 (strate 2/3 comptée NON), M08 (UNDER_CALIB compté NON), M11 (sha ignoré), M12 (deficit), M14 (retard 4) |
| C-11 | Sur NON : k, n_e2, E[K], couvertures observée et nominale, p-value, manque ; borne de Barber « non estimée » ; item formé si voulu | **fait** (1a : champs ; 1b : texte) | `h3Cell` (champs), `H3_NON` (texte) ; T7 asserte `barber_thm2_bound === "not_estimated"` ; item au §10 |
| C-12 | Aucun octet dans les 9 gelés ni dans le labeler ; sha recomputés ; aucune écriture dans `F:/course-ukemi/` | **fait** | §8 (13 invariants) ; `F:/course-ukemi/` lu par `ls` seulement |

## 7. Consigne standard G1 : point par point (fait / n-a avec motif)

**A. Environnement et preuve**
- **A-1** fait : la première ligne du rendu est `claude-opus-5-5[1m]`.
- **A-2** fait : `node_modules` à 220 entrées (= `F:/Monark`) ; `require.resolve('@monark/rpc-guard')` = worktree (§1). Je ne l'ai pas reconstruit moi-même (il l'était déjà) : la vérification a été faite après chaque coupure.
- **A-3** fait (§3).
- **A-4** fait :
  - `F:/tmp/u4bstats1/DELIVERED.sha256` (1a) et `DELIVERED-1b.sha256` ; rendu sous `F:/tmp/u4bstats1/` ;
  - 0 commit ; rien écrit sur `C:` (le doc 06 du référentiel y a seulement été lu) ;
  - 0 réseau : outil et tests purs (grep §5.2), aucune recherche web.
- **A-5** fait : STOP + couture pré-déclarée (§2) ; aucun dépassement rendu.
- **A-6** fait : 13 invariants AVANT == APRÈS (§8).
- **A-7** fait : les 8 variables payantes sont retirées de chaque oracle, test ou mutant (`env -u …` ; le harnais refuse de démarrer si l'une est présente) ; aucune variable affichée.
- **A-8** fait : les tests d'intégration lisent les VRAIES fixtures committées dans leur forme de production (`U4b-scores-e2.jsonl`, `U3-inputs.jsonl`, `U3-realized.jsonl`, `U4b-oracle-path-e2.jsonl`). Les vecteurs synthétiques reprennent les clés réelles.
- **A-9** fait : injection rejouée sur chacune des 16 constantes servies (M18..M33) et sur la sortie composée (`buildSummary`, lignes du rapport écrit).
- **A-10** fait : liage de sortie. T17 asserte les VALEURS du fichier de rapport écrit (`clause_359` complet, H-5, clause 3, digest) ; M35 préserve la lecture et altère la sortie (sha vide), et il rougit.
- **A-11** fait : TAP + byIntended.
- **A-12** fait : en-têtes des journaux d'oracle, de mutants, de R-25 et de ce rendu.

**B. Secrets** — **n-a** (motif : l'outil n'a ni opérateur, ni réseau, ni clé ; aucun `process.env`, `fetch(`, `node:http`, `undici` ou `child_process` ; grep §5.2). B-1..B-6 ne trouvent aucun objet.

**C. Identités et erreurs**
- **C-1** n-a (aucune erreur RPC). Les refus de l'outil utilisent une classe unique `HypError`, exportée et testée par `instanceof` (T10).
- **C-2..C-4** n-a (aucun budget, retry ni classifieur).

**D. Tests qui prouvent**
- **D-1** fait : 42/42 et 16/16 byIntended ; 0 test déclaratif (§4).
- **D-2** fait : vecteurs synthétiques non vides ; clés fermées (`deepEqual` de `clause_359`, verdicts) ; valeurs recomputées indépendamment (H-4 par strate, K recompté depuis la fixture brute, formes closes).
- **D-3** fait pour le tuyau déclaré : T17 exécute `report` de bout en bout sur les fixtures committées, sans aucun bouchon. « built » seulement à la première course rapprochée : item §10.
- **D-4** fait (diff annoté) :
  - (+) T20 gagne 2 cas de clause (NON servi ⇒ `false` ; UNDER_CALIB/NON_TESTABLE_E2 ⇒ `true`), déplacés depuis T7 pour tenir la couture ; aucune assertion retirée ;
  - (+) T19 : chemin dans le dépôt à parent absent + `assert.equal(existsSync(…), false)` ;
  - (−) aucune suppression d'assertion.

**E. Concurrence et état** — **n-a** (aucun verrou, ledger ni cooldown). La seule écriture est un fichier unique écrit une fois (`wx`) : déterministe, régénérable, vérifiable par `body_digest` (§10, observation durabilité).

**F. Rédaction**
- **F-1** fait :
  - l'ADR proposé porte sa table Tuyaux ;
  - sources en dépôt : `fiche-vovk-2012.md`, `L-lecture-tibshirani2019-barber2023.md`, prereg, avis cités par l'ADR existant ;
  - A&B est hors dépôt (`F:/PRODUITS/…/noyau-conforme/`, sha PDF `c69aa191…`) : déclaré, item de versement §10 ;
  - aucun renvoi vers `F:/tmp` dans le texte d'ADR.
- **F-2** fait : sources ASCII (0 octet non-ASCII dans les 3 fichiers ; les guillemets de la regex C-11 sont échappés `\u00ab`/`\u00bb`) ; `gate:vocab` et `lang:gate` verts.
- **F-3** fait : D-n au §9 ; les blocages ont été tranchés avec l'outil advisor intégré (plan, R-25), aucun contournement.

**G-1** n-a pour ce worker : aucune pièce publique touchée. L'outil est hors export (`scripts/census/**` non exporté, test listé dans `export-exclude-tests.json`, `export:check` vert).

## 8. A-6 — invariants byte-identiques AVANT / APRÈS (sha256 LF ; APRÈS = worktree 1a ET blob HEAD `50f78b0`)

| # | Fichier | AVANT (`frozen-before.txt`) = APRÈS (`frozen-after.txt`) |
|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` |
| 8 | `packages/contracts/src/calib-digest.ts` | `3603265d0a1f1a4e3e1a1d57b4b568fcadf4f6861351c2ca49b38dc794c42380` |
| 9 | `scripts/census/u3-realized.mjs` (labeler) | `cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af` |
| 10 | `scripts/census/u4b/u4b-select-episode.mjs` | `225d2304e65b3e175eef1c33a06f9425c57fe140b088f07aeb9f36b51e349447` |
| 11 | `scripts/census/u4-oracle-path.mjs` | `a2b39d0edf0d7ba4612ba67ddad0857faa61352198092ef6dad69953486975a8` |
| 12 | `docs/PLAN-u4b-prereg.md` (GELÉ) | `1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49` |
| 13 | `docs/adr/ADR-U4b-calibration-episode-frais.md` (@ base) | `6863104a10eafbf005023831eb5e8e41b11fb1cf3ccdff92a4635f692f62ebda` |

- `diff frozen-before.txt frozen-after.txt` = vide.
- L'état 1b ne touche aucun de ces 13 fichiers (le patch ne modifie que les 3 fichiers du lot et le RUNBOOK).
- À la pointe `lot/etude-suite` `eab911a`, les 12 premiers sont identiques. Le n°13 y diffère (`24bb0a6c…`) à cause des amendements ajoutés par l'orchestrateur (NARABI-OPS-1d, …), hors de ce lot. C'est pourquoi l'amendement STATS-1 est livré en texte PROPOSÉ (§9 D-5).

## 9. Déviations déclarées (D-n ; F-3)

- **D-1 — couture R-25** (A-5) : 1 385 > 1 150, donc deux unités, 1a (640) + 1b (771), vertes chacune seule. **1a n'est pas branché** avant la fusion de 1b : son consommateur est le test seul (règle Branchement), d'où l'item au §10. Le G7 du lot ne clôt qu'après 1b.
- **D-2 — `--alpha` et `--reference` de la mission n'existent pas** (C-10) : le niveau 5/100 est une constante, et la référence e2 un chemin fixe sha-vérifié. `--alpha 0.05` provoque le refus nommé « forbidden » (T19 + M39).
- **D-3 — H-6 lit `--oracle-path` (le oracle-path RÉDUIT : ancre + `update`)** et non `--oracle-raw` (C-5 ii / C-7). Seul le fichier réduit porte l'ancre et sa `source`, et c'est le fichier que consomme le scoreur gelé.
- **D-4 — `labels_no_quorum` est lu dans `--u3-realized` (lignes `repayment_base: null`), non dans `census`** (C-2 ; la clé est absente de `census`, mesuré au cp-1).
- **D-5 — l'amendement ADR est livré en texte PROPOSÉ** (`F:/tmp/u4bstats1/ADR-U4b-amendement-STATS-1.md`, prêt à être ajouté en fin de fichier), non édité dans le worktree. ADR-U4b a reçu, sur `lot/etude-suite` après la base, un amendement NARABI-OPS-1d ajouté en fin de fichier : un ajout dans le lot entrerait en conflit à la fusion. C'est le patron NARABI-OPS-1d : texte proposé au G1, insertion par l'orchestrateur SEUL (R-20).
- **D-6 — ajouts hors liste littérale, déclarés** :
  - (a) mutants M37-M42, pour qu'aucun test ne reste déclaratif (D-1) ;
  - (b) durcissement de T19 après l'effet de bord de M40 (§4) ;
  - (c) sous-commandes `h3`, `h4` et `h6` isolées, en plus de `report` (forme « h3/h4/h6/report » consignée dans `docs/CHANTIERS.md` pour ce lot) ;
  - (d) dans l'état 1a, l'en-tête du `.d.mts` et la phrase de motif de `scripts/export-exclude-tests.json` décrivent le **lot** (outils H-3/H-4/H-6 et rapport), pas l'unité 1a. Je les laisse tels quels : les corriger rouvrirait 1a (sha, patch, oracle, mutants), et 1b complète le lot décrit.

## 10. Demandes formées, items (déclencheur ; propriétaire) et observations — zéro dette nue

**Q-1 — demande de consultation formée (orchestrateur ; ruling journalisé pré-donnée)**
- *Problème* : le prédicat :359 compte-t-il le verdict H-3 de la **cellule A poolée** ?
- *Faits* :
  - :100 teste « par strate SERVIE ET sur la cellule A poolée » ;
  - :359 dit « aucune strate servie en NON au test H-3 » ;
  - le q̂ poolé n'est servi nulle part (le service est par strate : voie α + `strateOf` serveur, G0-lot-u4b C-10) ;
  - le cp-1 C-1/C-4 nomme le champ `h3_no_NON_on_served_strata`.
- *Options* :
  - **(a)** poolé HORS condition, rapporté (`h3_pooled_verdict_outside_condition`) : **implémenté**, lecture littérale de :359 ;
  - **(b)** poolé DANS la condition (plus strict : un NON poolé ⇒ retour investisseur) : 1 ligne dans `clause359` (unité 1b) + 1 assertion de test.
- *Déclencheur* : avant l'étape 6a (après, ce serait un choix a posteriori). *Propriétaire* : orchestrateur.

**Procurement non bloquant (confort de citation, aucune dette)**
- *Objet* : une référence standard [lu] pour la pmf bêta-binomiale. La pmf est **établie ici** par dérivation combinatoire complète (rangs uniformes, §5.1) et par tests exacts (Σ = 1, moments A&B p.50, lgamma indépendant, masses Q6). La demande ne vise qu'une citation.
- *Tentatives* : recherche locale de « beta-binomial » (`docs/biblio`, `F:/PRODUITS/…/_txt`, `F:/Clawpumptech/…/_txt`). Seul A&B est trouvé, et il renvoie aux « standard references » (p.49).
- *Identité candidate* : N. L. Johnson, A. W. Kemp, S. Kotz, *Univariate Discrete Distributions*, 3e éd., Wiley, 2005, chapitre des lois hypergéométriques (hypergéométrique négative / bêta-binomiale). **ISBN, DOI et section NON vérifiés par moi** : à résoudre par un chercheur ; aucun de ces identifiants n'est cité comme fait.
- *Usage prévu* : citation de la pmf dans l'ADR. *Déclencheur* : G7 du lot, optionnel. *Propriétaire* : orchestrateur.

**Items formés**

| # | Item | Déclencheur | Propriétaire |
|---|---|---|---|
| I-1 | Estimateur de la borne Barber 2023 Thm 2 (Σ w̃·d_TV) pour un NON servi (C-11) : recherche de solutions, aucun estimateur pré-enregistré ni improvisé | premier NON sur une strate servie | orchestrateur |
| I-2 | Verser la source Angelopoulos & Bates (copie locale `F:/PRODUITS/communication-2026-09-21/pitch-clawpump/biblio/noyau-conforme/`, PDF sha `c69aa191…`) au dépôt `docs/biblio/` (F-1) | G7 1a | orchestrateur |
| I-3 | Ordre C-4 : fusion 1a + 1b, puis sha LF (blob HEAD) de `u4b-hyp.mjs` au sidecar 6, **avant 6a**. Mesure à 22:0x UTC : `F:/course-ukemi/` = `discover/` + `select/` seulement, donc tenable | avant l'étape 6a | orchestrateur |
| I-4 | Statut « built » de l'outil (consigne D-3) | première exécution de 6d sur l'épisode frais | orchestrateur |
| I-5 | **Contrôle NUL des worktrees relancés, fichiers NON SUIVIS compris** : compter les octets NUL sur `git ls-files -z -m -o --exclude-standard`, pas sur `git diff`. Mesuré ici : outil non suivi à 44 997 NUL, alors que l'affirmation était « 0 NUL » | immédiat (1b-4, GFSYNC-1, autres relancés) | orchestrateur |

**Observations**
- **O-1 (outillage des workers)** : le transport des commandes Bash réduit `\\` à `\`, **même dans un heredoc entre guillemets**. Mesuré 2 fois : correctif des guillemets de la regex C-11, puis script d'extension du harnais (ancre contenant un vrai saut de ligne ; échec fermé, aucune écriture). Parade : écrire les scripts avec l'outil Write, ou `String.fromCharCode(92)`. À porter dans la consigne si récidive.
- **O-2 (durabilité du rapport)** : le rapport est écrit une fois (`wx`), il est déterministe et porte un `body_digest`. Une coupure produit donc un échec **détectable** (JSON illisible ou octets différents), jamais une entrée fausse silencieuse. Il est hors du périmètre de GARDE-FSYNC-1 (ce n'est pas un fichier réécrit). Contrôle recommandé à 6d : rejouer la commande vers un second `--out` et comparer les octets.
- **O-3 (hors lot, déjà relevée au cp-1)** : `ADR-U4b…md:207` porte le labeler `755b3a38…`, alors que le prereg §Y :83 épingle `cb020425…`.
- **O-4** : mes mesures R-25 par index temporaire ont écrit des objets git non référencés dans le magasin partagé (aucun ref, aucun commit ; `gc` les élimine). `git fsck` est vert.
- **O-5** : `lot/etude-suite` a bougé pendant le lot (`a703e24`, puis `b6e0b63`, puis `eab911a`). RUNBOOK inchangé ; 12 invariants identiques ; ADR-U4b amendé par l'orchestrateur, d'où D-5.

## 11. Pièces livrées hors dépôt (sous `F:/tmp/u4bstats1/`)

| Pièce | Rôle | sha256 |
|---|---|---|
| `G1-lot-u4b-stats-1.md` | ce rendu (écrit au fil de l'eau) | donné dans le message final |
| `ADR-U4b-amendement-STATS-1.md` | texte PROPOSÉ de l'amendement ADR-U4b (99 lignes ; tuyaux, sources, épinglages C-3, MAST, D-n, items) | `3f3029d99bacd63e79811afb42f3c594f4813c9c93f8169c3d8a604cbc943e5a` |
| `RUNBOOK-DELTA.md` | delta RUNBOOK (C-8) : table de portée + diff mécanique | `ffe655fda89fea6b169c96cbc386d8f44dad4723f6a4779fc05217a5017f8ea4` |
| `seam/1b.patch` | unité 1b | `503c186a68b6ea9b73a94a47fb21866b4c3a1eaffb3e5d254fd2712c49dcd7e6` |
| `DELIVERED.sha256` / `DELIVERED-1b.sha256` | fichiers du worktree (1a), puis après 1b | voir le fichier |
| `MANIFEST-u4bstats1.sha256` | sha de tous les artefacts de preuve (régénéré en fin de rendu) | — |

## 12. Reproductibilité (depuis n'importe quel répertoire ; les 8 clés payantes retirées ; TEMP sur `F:`)

```
bash F:/tmp/u4bstats1/oracle.sh <label>                       # 7 gates, journaux a en-tete A-12 sous F:/tmp/u4bstats1/oracle-<label>/
env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node F:/tmp/u4bstats1/mutants.mjs 1a      # ou: full (apres 1b)
bash F:/tmp/u4bstats1/r25.sh 50f78b0 1a                          # 1b: bash F:/tmp/u4bstats1/r25.sh f6670e0c903c35060f89ed2ac6fd8f5f8e65b722 1b
cd F:/Monark-wt-u4bstats1 && git apply --check F:/tmp/u4bstats1/seam/1b.patch && git apply F:/tmp/u4bstats1/seam/1b.patch   # retour: git apply -R
node scripts/census/u4b/u4b-hyp.mjs report --scores apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl --inputs apps/sentinel/test/fixtures/ukemi/u3/U3-inputs.jsonl --u3-realized apps/sentinel/test/fixtures/ukemi/u3/U3-realized.jsonl --oracle-path apps/sentinel/test/fixtures/ukemi/u4b/U4b-oracle-path-e2.jsonl --event-id e2-2025-10-10-weth --out <fichier hors depot>   # apres 1b ; body_digest 49b138c3...
git -C F:/Monark fsck --no-progress --no-dangling               # exit 0, 0 ligne
```

## 13. Verdict worker (clôture du rendu ; le verdict G7 appartient à l'orchestrateur, R-21)

**STOP A-5 déclaré : le lot n'est PAS livré d'un bloc.** Le lot entier mesure R-25 = **1 385** (au-delà de 1 150 et de 1 205). La couture est pré-déclarée en deux unités, **vertes chacune SEULE**, après restauration de la coupure 2 :

| Unité | Où | R-25 | Oracle (7 gates) | Tests | Mutants byIntended |
|---|---|---|---|---|---|
| **1a** — cœur exact H-3 | worktree `F:/Monark-wt-u4bstats1` (`DELIVERED.sha256`, 4/4 OK) | **640** | 7 × exit 0 | **933 / 932 / 0 / 1** | **16/16** |
| **1b** — H-4, H-6, labels, census, `report`, CLI, RUNBOOK | `F:/tmp/u4bstats1/seam/1b.patch` (`503c186a…`) sur 1a | **771** | 7 × exit 0 (1a+1b) | **941 / 940 / 0 / 1** | **42/42** |

- **Le G7 du lot n'a lieu qu'après la fusion de 1b** : avant, 1a n'est pas branché (règle Branchement).
- **Coupure 2** :
  - outil trouvé entièrement NUL (fichier non suivi), restauré depuis la copie vérifiée ;
  - `git fsck` vert ;
  - toutes les preuves ont été régénérées après restauration ;
  - l'affirmation « 0 octet NUL » de `docs/CHANTIERS.md` est **contredite** pour ce worktree (I-5).
- **Aucun écart** aux 13 invariants A-6 ; aucun commit ; aucun workflow ; aucune écriture dans `F:/course-ukemi/` ; aucun réseau.

**Actes attendus de l'orchestrateur, dans l'ordre :**
1. **I-5**, immédiat : recompter les NUL sur les fichiers **non suivis** des autres worktrees relancés.
2. **Q-1** : ruling journalisé sur la cellule poolée dans :359, **avant l'étape 6a**.
3. G2 et checkpoint-2 de **1a**, puis commit de 1a (vérifier `DELIVERED.sha256`).
4. `git apply --check`, puis `git apply F:/tmp/u4bstats1/seam/1b.patch` ; G2-delta et checkpoint-2 de **1b** ; commit de 1b (vérifier `DELIVERED-1b.sha256`).
5. Ajouter `F:/tmp/u4bstats1/ADR-U4b-amendement-STATS-1.md` à `docs/adr/ADR-U4b-calibration-episode-frais.md` (insertion par l'orchestrateur seul ; ajout pur).
6. **I-3 / C-4** : sha LF du blob `u4b-hyp.mjs` **après 1b**, écrit au sidecar 6 **avant 6a** (à 22:0x UTC, `F:/course-ukemi/` ne contenait que `discover/` et `select/`).
7. G7 du lot. Statut « built » à la première exécution de 6d (I-4).

Clôture du rendu : 2026-09-22, après régénération du manifeste. Le sha256 de ce fichier est donné dans le message final : un fichier ne peut pas porter son propre sha.

---

**Fichier du rendu** : `F:\tmp\u4bstats1\G1-lot-u4b-stats-1.md` (467 lignes, 0 NUL), sha256 `b9bff9b838d1c59173bfc15f9c64d5e2169b222930b1eba127fbac2561301b1d`.

**Manifeste** : `F:\tmp\u4bstats1\MANIFEST-u4bstats1.sha256` (53 entrées, toutes OK à `sha256sum -c`), sha256 `e167ad057dc31ecc82ddd1c6f5c3cc02959075f86953d47322b42d0c6d785392`.

Fichiers :
- **Worktree (état 1a)** :
  - `F:\Monark-wt-u4bstats1\scripts\census\u4b\u4b-hyp.mjs`
  - `F:\Monark-wt-u4bstats1\scripts\census\u4b\u4b-hyp.d.mts`
  - `F:\Monark-wt-u4bstats1\apps\sentinel\test\u4b-hyp.test.ts`
  - `F:\Monark-wt-u4bstats1\scripts\export-exclude-tests.json`
- **Unité 1b** : `F:\tmp\u4bstats1\seam\1b.patch`
- **Textes proposés** :
  - `F:\tmp\u4bstats1\ADR-U4b-amendement-STATS-1.md`
  - `F:\tmp\u4bstats1\RUNBOOK-DELTA.md`
- **Empreintes** :
  - `F:\tmp\u4bstats1\DELIVERED.sha256`
  - `F:\tmp\u4bstats1\DELIVERED-1b.sha256`
