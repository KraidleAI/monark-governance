Modèle résolu : claude-opus-5-5[1m]

# RENDU PLI-2 (micro-pli post-G2 / post-cp-2) — GARDE-FSYNC-1 — C-G2-1..C-G2-4 (= C-V-2, C-V-3)

> Écrit AU FIL DE L'EAU. Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1, décision 133), effort max, contexte
> FRAIS (pas la session du G1). Worktree `F:\Monark-wt-gfsync1`, branche `lot/garde-fsync-1` @ `d141413` ; AUCUN commit
> (R-20) ; aucune écriture dans `F:\Monark` ni dans un autre worktree ; TEMP/TMP/TMPDIR = `F:\tmp\gfsync1-pli\os-tmp` ;
> ceinture A-7 (`env -u` des 8 clés) sur tout oracle/test/mutant/sonde. État du fichier : voir « Journal d'avancement ».

## Résumé (données brutes pour l'orchestrateur ; preuves aux sections citées)
- Liste fermée pliée : **C-G2-1 = C-V-2** (test jumeau par le BIN, producteur réel), **C-V-3** (frontière), variantes
  (ii) agrégé et (iii) non numérique, **C-G2-2(a)-(d)**, **C-G2-3(a)-(d)** (RUNBOOK §3.6, §3 « Interrupted repair »,
  §4 étape 5, §5 ; docstring `reconcile.ts:43-47`, 5 lignes ⇒ 5 lignes), **C-G2-4** (règle d'import RÉSOLUE, D-P2-1).
  AUCUN changement de comportement du code (seule la docstring de `reconcile.ts` bouge) ; aucun défaut réel révélé.
- Mutants : worker **37/37**, G2 **19/21** (N6, N16 survivants DÉCLARÉS équivalent/quasi-équivalent), cp-2 **10/10**
  (MV-3 tué), propres **13/13** — tous byIntended, restaurés (§5).
- Oracle worktree **7 × exit 0, 951/949/0/2** (§6.2) ; arbre fusionné (`7154d18` + lot + pli) **7 × exit 0,
  1014/1012/0/2** (§6.1) ; R-25 cumulé **819** (< 1 150) ; A-6 9/9 ; (d) relatif **×0,969 / ×1,050** (§8) ;
  `DELIVERED-pli2.sha256` 12/12 (§7).
- **Constat nouveau, bloquant G7 si ignoré** : le scan livré à `d141413` ROUGIT sur l'arbre fusionné avec
  `lot/etude-suite` ≥ `2c276bb` (seam propre de Bell) — prouvé par fusion à blanc (§4) ; fermé par ce pli (I-P2-1).
- Points ouverts FORMÉS (orchestrateur) : I-P2-1 (committer le pli avant fusion), I-P2-2 (textes ADR §13 ; copie prête
  à insérer `F:\tmp\gfsync1-pli\ADR-amendement-pli2.md` + diff, l'original `f3bfa680…` intact), I-P2-3 (`head_action`
  d'un record manuel) — §12.

## 0. Entrées lues (intégralement)
- G2 `F:\tmp\g2-gfsync1\G2.md` (PASS-AVEC-CORRECTIONS, C-G2-1..C-G2-5) ; ses calques `scratch\exp.mjs` (E1-E10) et
  `scratch\e11.mjs` (E11) + journaux `exp-run1.log`, `e11.log`.
- Checkpoint-2 `F:\Monark\docs\CHECKPOINT2-lot-garde-fsync-1.md` (ACCEPTE-AVEC-CORRECTIONS, C-V-1..C-V-6).
- Dans le worktree : `docs/CONSIGNE-STANDARD-G1.md` (A-1..A-12 ; A-13 lu sur `lot/etude-suite`), `docs/G1-lot-garde-fsync-1.md`,
  `docs/PLI-lot-garde-fsync-1.md`, `docs/RUNBOOK-rpc-guard.md`, `packages/rpc-guard/src/{ledger,repair,reconcile,cli,lock}.ts`,
  `bin/rpc-guard.mjs`, `test/{repair-tail.test,durable.test,harness,no-fsync}.ts`.
- Harnais à rejouer : worker `F:\tmp\gfsync1\mutants.mjs` (37), G2 `F:\tmp\g2-gfsync1\mutants-g2.mjs` (20 + X1),
  cp-2 `F:\tmp\cp2-gfsync1\mutants\mutants.mjs` + `mv10.mjs` (10).

## 1. Orientation mesurée (04:41-04:55 UTC)
- `git status` du worktree : propre, HEAD `d141413808363d133aca47c9a6a427a20c98c90d`, branche `lot/garde-fsync-1`.
- A-2 : `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-gfsync1\packages\rpc-guard\src\index.ts`.
- Ligne de base des deux fichiers visés (`baseline-2files.tap`, 04:53:47Z, ceinture A-7) : 16/16 verts, 1,5 s.
- **CONSTAT NOUVEAU (hors listes G2/cp-2, mesuré) — le scan structurel ACTUEL rougit sur la cible de fusion.**
  `lot/etude-suite` a avancé à `2c276bb` (« G7 BELL-SHORTPAGE-1: merge lot/bell-shortpage-1 (f5fc682) »), APRÈS la fusion à
  blanc du cp-2 (`8d12ef2`, où `apps/bell/src/rebase-crosscheck.ts` comptait 0 `DURABLE_FS`). Ce fichier porte désormais le
  seam PROPRE de Bell (`export const DURABLE_FS: DurableFs = …`, :652) et, :664, le commentaire
  « `rename is DURABLE_FS.renameSync = renameWithBoundedRetry (R-SP-A)` ». Rejeu de la regex du test livré
  `/DURABLE_FS\.\w+\s*=[^=]/` sur `git show lot/etude-suite:apps/bell/src/rebase-crosscheck.ts` (copie
  `scratch/rc-tip.ts`) : **1 hit, ligne 664** (le commentaire). Donc `durable_production_path_…` (partie 2, racine
  `apps/bell/src`) rougirait APRÈS la fusion G7 — et la règle littérale de C-G2-4 (« tout jeton `DURABLE_FS` hors
  `packages/rpc-guard/{src,test}` = hit ») rougirait aussi (14 occurrences du jeton, seam de Bell = autre objet).
  Conséquence de conception pour C-G2-4 : voir §2 (advisor avant code), D-P2-1 (§11) et la preuve par fusion à blanc
  (§4).
- Importeurs de `@monark/rpc-guard` hors paquet (non-tests), à `HEAD` et à `lot/etude-suite` : 18 fichiers, tous sous
  `apps/bell/src`, `apps/sentinel/src`, `scripts/census/**` (racines déjà scannées). Extensions sous `scripts/`,
  `apps/*/src`, `packages/*/src` : `ts` 103, `mjs` 30, `mts` 19 (le scan livré ne lit que `.ts`/`.mjs`).
- `heliusCredits("getTransaction")` = 1 (`tariff.ts:19,28`) : Δ tableau de bord = nombre d'appels ⇒ sans drapeau, les
  fenêtres des vecteurs ci-dessous sont GO (le mutant qui supprime le drapeau est donc observable).

## 2. Advisor intégré AVANT le code (04:5x UTC) — conseil, pas verdict
Plan soumis (approche « B » : vecteurs unitaires + test jumeau par le bin ; scan durci). Recommandations retenues :
(1) C-G2-4 : **abandonner la règle « jeton `DURABLE_FS` = hit »** (intenable sur la cible de fusion, §1) au profit d'une
règle d'import **résolue** (`posix.normalize(posix.join(dirname(fichier), spéc))`, pas une regex sur le texte) ; écart à
la lettre déclaré D-P2-1 ; preuve par fusion à blanc sur la pointe notée (faite à `7154d18`, descendant de
`2c276bb`, §4) ; constat écrit comme bloqueur G7 hors pli.
(2) Harnais cp-2 : il restaure par `git checkout d141413 -- <f>` ⇒ JAMAIS sur le worktree (écraserait la docstring
`reconcile.ts`) : clone jetable @ `d141413` + pli SANS le hunk `reconcile.ts` ; MV-10 via `mv10.mjs` (A-13).
(3) Vecteurs unitaires : chaque vecteur REMPLACE le journal (la ligne illisible existante empoisonne toute fenêtre) ;
N17 exige un record PARSEABLE non numérique ; en agrégé, Δ = ledgerTotal pour que N2 rende GO (pas `hard:total`).
(4) Numéros de ligne cités par G2/cp-2/ADR (`reconcile.ts:53`, `:74` ; `RUNBOOK:6,28,36`) : docstring tenue à 5 lignes
(43-47) ⇒ aucune dérive (vérifié : `>=` toujours ligne 53 ; RUNBOOK lignes 1-53 intactes).
(5) RUNBOOK §4 : le record manuel minimal est exactement la forme `{"lines_after":2}` du test unitaire ; `head_action`
d'un record manuel = décision orchestrateur, **déclarée ouverte** (I-P2-3, §12), non tranchée.
(6) `realWriter` extrait dans `harness.ts`, consommé aussi par le test de composition existant (D-4 annoté).
Écart assumé : variante (i) sur le MÊME cycle avec un 2ᵉ VRAI écrivain (0 appel) et l'étape RUNBOOK `bak_exists` par le
bin, plutôt qu'un verrou fabriqué sur un cycle frais (même coût en lignes, mesuré ; couvre en plus la 2ᵉ réparation du
même cycle et la ligne `bak_exists` du tableau RUNBOOK par le chemin servi).

## 3. Livré (worktree, non committé) — 05:09 UTC
`git diff --stat` : 5 fichiers, 188 insertions, 34 suppressions (docs compris) :
- `packages/rpc-guard/test/harness.ts` : + `realWriter(dir, cycle, n)` (écrivain réel = processus enfant, meurt verrou
  tenu ; code enfant OCTET-IDENTIQUE à l'ancien bloc de `repair_tail_composition_…` pour `("cut", 3)`).
- `packages/rpc-guard/test/repair-tail.test.ts` :
  - composition existante : bloc enfant (6 lignes) remplacé par `realWriter(dir, "cut", 3)` (D-4 : aucune assertion
    touchée) ;
  - C-G2-2(a) : record COMPLET du heal, chaque valeur recalculée indépendamment (`sha_after.head` = sha de
    `es[2].entry_sha256`, `sha_after.jsonl` = sha du préfixe durable) ;
  - C-G2-2(b) : cas `unterminated` (ligne JSON complète sans `\n`, head = pénultième, + 64 NUL ⇒ `torn_tail`, 0 octet) ;
  - C-G2-2(d) : bin sans `--cycle` / `--op` / `--reason` ⇒ `[2, "", "rpc-guard: <flag> required (fail-closed)\n"]`,
    instantané du dossier inchangé ;
  - vecteurs unitaires (i)/(ii)/(iii) ajoutés en FIN de `reconcile_reads_the_repair_journal_per_window` (tournent aussi
    dans le miroir public, sans bin) ;
  - NOUVEAU `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` (bin, `spawnSync`, skip miroir).
- `packages/rpc-guard/test/durable.test.ts` : C-G2-2(c) cas (4) EACCES/EBUSY ; C-G2-4 scan réécrit (règle d'import
  résolue).
- `packages/rpc-guard/src/reconcile.ts` : docstring 43-47 seule (5 lignes ⇒ 5 lignes ; aucun changement de code).
- `docs/RUNBOOK-rpc-guard.md` : §3 étape 6, §3 « Interrupted repair », §4 nouvelle étape 5 (renumérotation 5→6, 6→7,
  7→8 ; aucune référence externe aux numéros d'étape : `git grep` joint), §5.
Contrôles immédiats : A-13 recompte node (`f.replace(/\\/g, "/")` : 1 occurrence, attendu 1) ; 0 octet non-ASCII et
0 NUL dans les 4 sources ; les deux fichiers : **17/17 verts** (`pli2-2files-run1.tap`, 05:05:37Z ; nouveau test
7,08 s — 16 exécutions du bin + 3 écrivains) ; `typecheck` exit 0 ; `eslint` (4 fichiers) exit 0 ; `lint:ratchet`
69/69.

## 4. Fusion à blanc — le constat §1 est un BLOQUEUR G7 à `d141413`, fermé par ce pli (mesuré)
Clone jetable `F:\tmp\gfsync1-pli\merge-clone` (`git clone --no-hardlinks --no-checkout F:/Monark`, lecture seule de
`F:\Monark`), `node_modules` par `mk-nm.ps1` (220 entrées, 10 `@monark`, 0 échec ; `require.resolve` = le clone). La
pointe de `lot/etude-suite` a encore avancé pendant ce pli : **`7154d18`** (descend de `2c276bb` ; le commentaire Bell
`:664` y est toujours). `git merge --no-commit --no-ff origin/lot/garde-fsync-1` ⇒ exit 1, UN conflit
(`docs/G1-lot-garde-fsync-1.md`, AA — le même que cp-2 C-V-5(a)), code fusionné sans conflit ; AUCUN commit.
- **(A) sans le pli** (`merge-A-prepli.tap`, en-tête A-12 : HEAD `7154d187…`, MERGE_HEAD `d1414138…`, 05:12:25Z) :
  durable + repair-tail ⇒ **15/16, exit 1** — `not ok 7 - durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch`,
  hit unique `'apps/bell/src/rebase-crosscheck.ts: assigns the DURABLE_FS seam'`. ⇒ Fusionner `d141413` seul rend
  l'oracle ROUGE sur l'arbre fusionné (fait nouveau, postérieur à la fusion à blanc cp-2 `8d12ef2`).
- **(B) avec le pli** (`git apply pli2-full.patch`, sha `091d9742…` ; `merge-B-pli2.tap`, 05:12:53Z) : **17/17, exit 0** ;
  les 5 fichiers du pli y sont octet-identiques au worktree (sha comparés). Le scan durci ne rougit ni sur le seam
  propre de Bell ni sur les scripts arrivés sur la pointe depuis (`u4b-probe-cutoff`, etc.).

## 5. Rejeu des mutants (A-11 byIntended, A-12 en-têtes, A-7)
### 5.1 cp-2 (10) — clone jetable, restauration `git checkout d141413` (jamais sur le worktree)
Clone `F:\tmp\gfsync1-pli\cp2-clone` @ `d141413` + `pli2-no-reconcile.patch` (sha `1c155417…` : les 4 fichiers du pli
SAUF la docstring `reconcile.ts`, que la restauration `git checkout d141413` écraserait) ; fichiers du pli octet-identiques
au worktree (sha comparés : `durable.test.ts` `5333ee13…`, `repair-tail.test.ts` `de8880b8…`, `harness.ts` `9188c606…`,
RUNBOOK `2323c569…`). Harnais = copie du harnais cp-2 (`daa3e087…`) où SEUL `TEMP/TMP/TMPDIR` passe de `F:/tmp` à
`F:/tmp/gfsync1-pli/os-tmp` (diff 1 ligne joint) ; MV-10 : ABORT « hunk count=0 » reproduit à l'identique (piège A-13 du
harnais cp-2), puis rejoué par `mv10-replay.mjs` qui appelle `mv10.mjs` INCHANGÉ (sha `94680cd2…`), comme le cp-2.
Journal `mutants-cp2-run1.log` (05:14:14Z), TAP sous `cp2-out\` : **10/10 tués byIntended, restaurés** (pré == post) —
dont **MV-3 (le survivant du cp-2, `n >= start` → `n > start`, sha muté `ee539af9…` identique au cp-2) : TUÉ** par
`reconcile_reads_the_repair_journal_per_window` (tueur nommé par le cp-2) ET par le nouveau test par le bin. MV-10 :
`hunk count=1`, sha muté `79efb6c3…` (= cp-2), tué par `durable_append_writes_the_line_then_the_head_in_order`,
`restored=true`. `git status` du clone identique avant/après.

### 5.2 Worker G1/pli (37) — worktree, chemins seuls
`mutants-worker.mjs` = `F:\tmp\gfsync1\mutants.mjs` (sha `21f6474f…`) où SEULS changent `GUARD`, `TEMP/TMP` et deux
chaînes d'usage/en-tête (diff 4 lignes joint ; recompte des `\\` source/copie 5/5). Journal `mutants-worker-run1.log`
(en-tête 05:13:28Z, HEAD `d141413`, pré-sha = état du pli : `reconcile.ts` `6e62cd6a…`, les autres = sha livrés G1) :
**37/37 KILLED par leur test NOMMÉ, restaurés octet pour octet** (« ALL MUTANTS KILLED … files byte-identical to pre:
true », exit 0 ; garde vide ; `git status` = les 5 fichiers du pli). NB : l'en-tête du journal porte la chaîne héritée
« (worktree dirty: the G1 change set) » — texte FIGÉ du harnais d'origine, conservé par la règle « chemins seuls » ;
l'état réel était le change set du pli-2 (pré-sha ci-dessus, `reconcile.ts` `6e62cd6a…`).

### 5.3 G2 (20 + X1) — worktree, chemins seuls
`mutants-g2-replay.mjs` = `F:\tmp\g2-gfsync1\mutants-g2.mjs` (sha `72f969cd…` = harnais du run3 du G2) où SEULS
changent `WT` (clone du G2 → worktree), `GUARD`, `OSTMP` et la chaîne d'usage/en-tête (diff joint ; `\\` 1/1) ;
`--check` : 21/21 FIND-OK. Journal `mutants-g2-run1.log` (en-tête 05:18:17Z, HEAD `d141413`, `dirty_files=5`) :
**19/21 KILLED byIntended, restaurés** (post-sha == pré pour les 6 fichiers, « files byte-identical to pre: true ») :
- les **7 survivants non équivalents du G2 sont TUÉS** par leur tueur nommé : N1, N2, N17
  (`reconcile_reads_the_repair_journal_per_window` ET le test jumeau par le bin), N4
  (`repair_tail_heals_a_head_one_behind_after_the_strip`), N5 (`repair_tail_refuses_torn_or_clean_or_inner_nul_tails`),
  N11 (`durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff`), N15 (`repair_tail_is_served_by_the_bin`) ;
- **X1** (`scripts/census/u4-guard.mjs` : `import { DURABLE_FS as SEAM } …` + `Object.assign(SEAM, …)`) : **TUÉ** par
  `durable_production_path_…` (hit de la règle d'import résolue) ;
- les 11 déjà tués au G2 le restent (N3, N7, N8, N9, N6+N16, N10, N18, N19, N12, N13, N14 ; N3 par le test unitaire) ;
  11 + 7 + X1 = 19 ;
- **SURVIVANTS DÉCLARÉS (inchangés, comme exigé)** : **N16** (heal explicite `repair.ts:64` retiré) — ÉQUIVALENT (la
  réouverture `:65` exécute le même heal, même séquence) ; **N6** (réouverture de contrôle `:65` retirée) —
  quasi-équivalent (ne diffère que sur un orphelin `.tmp` dans l'état « head == recalculé + NUL + orphelin »,
  inatteignable par coupure, bénin sinon). La paire est couverte collectivement (N6+N16 TUÉ). Aucun test n'est ajouté
  pour un état inatteignable (texte ADR de la garde redondante proposé §13).

### 5.4 Mutants PROPRES du pli (13) — tueurs = les tests/vecteurs ajoutés
`mutants-pli2.mjs` (sha `dc567371…`, même protocole que le harnais worker ; `--check` 13/13 FIND-OK). Journal
`mutants-pli2-run1.log` (05:19:37Z) : **13/13 KILLED byIntended, restaurés** (post == pré pour les 5 fichiers ; garde
vide). Détail (tueur nommé ; autres tests rouges) :
- C9a′ (`reconcile` ignore le journal), C9b′ (fenêtre ignorée, drapeau permanent), N1′ (`>` au lieu de `>=`), N2′
  (drapeau seulement en `per-method`), N17′ (record sans `lines_after` numérique ignoré), **N20** (le NO-GO
  `repaired_in_window` ne FERME PAS la fenêtre : résultat rendu sans ligne `reconciled`) ⇒ tueur
  `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` (C-V-2 : « C9a doit rougir CE test » — FAIT) ;
  chacun rougit aussi le test unitaire ;
- N11b (EACCES retiré de la liste), N11c (EBUSY retiré) ⇒ `durable_head_rename_retries_…` : chaque code déclaré est
  épinglé seul ;
- N15b (`--cycle` optionnel), N15c (`--op` optionnel) ⇒ `repair_tail_is_served_by_the_bin` : chaque drapeau requis est
  épinglé seul (N15 = `--reason`, harnais G2) ;
- X2 (script de course : `await import(new URL("../../packages/rpc-guard/src/ledger.ts", import.meta.url).href)` puis
  `SEAM.fsyncSync = () => {}`), X3 (script : import de `../../packages/rpc-guard/test/harness.ts` + `journal({ fsyncSync })`),
  X4 (le BIN servi importe `../test/harness.ts` + `journal({ fsyncSync })`) ⇒ `durable_production_path_…`.

### 5.5 Bilan des 81 exécutions de mutants
worker 37/37 ; G2 19/21 (N6, N16 survivants DÉCLARÉS équivalent/quasi-équivalent, inchangés) ; cp-2 10/10 (dont MV-3,
l'ancien survivant) ; propres 13/13. Aucun survivant non équivalent. Aucun changement de CODE (seule la docstring de
`reconcile.ts` bouge) : aucun test exigé n'a révélé de défaut réel ⇒ pas de STOP.

## 6. Oracle 7 gates (A-3, A-7, A-12)
### 6.1 Arbre FUSIONNÉ (clone jetable : `lot/etude-suite` `7154d18` + `merge --no-commit` `d141413` + pli-2 ; conflit docs
résolu DANS LE CLONE par la version complète du lot, `e2d61b98…`, comme cp-2 C-V-5(a) le recommande ; aucun commit)
`oracle-merged.sh m1` (en-tête : HEAD `7154d187…`, MERGE_HEAD `d1414138…`, `pli2-full.patch`, node v24.15.0, win32-x64,
05:20:39Z → 05:23:13Z) : **gate:vocab 0 (224 fichiers), typecheck 0, test 0, lint 0, lint:ratchet 0 (69/69),
lang:gate 0, export:check 0 (« 0 forbidden path, 0 non-exempt French hit »)** ; tests **1014 / pass 1012 / fail 0 /
skipped 2** (skips pré-existants nommés : `sentinel_run_releases_chainstack_lock_on_sigterm` win32 ;
`u4b_labels_replay_via_main_real_artifact` artefacts e2 absents d'un clone) ; `duration_ms` 111 555 (pendant ce run,
aucun harnais ne tournait ; machine partagée, autres agents non contrôlés). Cohérence : 996 (tests de l'arbre fusionné U-4b-1b-4,
selon le message du commit `5219e3a` ; les 3 commits suivants jusqu'à `7154d18` ne touchent que des docs, `git diff
--stat` : 3 fichiers `docs/`) + 17 (lot) + 1 (pli-2) = 1014. Donnée pour le G7 (qui rejouera l'oracle sur l'arbre fusionné RÉEL,
cp-2 C-V-5(b)) ; ne remplace pas cet acte.

### 6.2 Worktree (état livré du pli : `d141413` + 5 fichiers modifiés) — RÉFÉRENCE
`oracle.sh p2` (en-tête : HEAD `d1414138…`, `dirty_files=5`, node v24.15.0, win32-x64, 05:23:14Z → 05:26:11Z,
`dirty_files_after=5`) : **gate:vocab 0, typecheck 0, test 0, lint 0, lint:ratchet 0, lang:gate 0, export:check 0** ;
tests **951 / pass 949 / fail 0 / skipped 2** (= 950 du G2 + le test jumeau ; skips = les 2 pré-existants nommés ;
le test jumeau S'EXÉCUTE dans le dépôt) ; `duration_ms` 137 041 (machine partagée). Journaux
`F:\tmp\gfsync1-pli\oracle\p2-*.log`.

## 7. R-25 (A-5), A-6, DELIVERED (A-4) — 05:22 UTC
- **R-25** (`r25.sh` → `r25-pli2.log` ; pathspec extrait VERBATIM de `ci.yml:65` par `sed` ; 0 fichier non suivi, 5
  modifiés, aucun index écrit) : **cumulé du lot (arbre = `d141413` + pli-2) vs `66f75c2` : 11 fichiers,
  801 + 18 = 819** (< 1 150 STOP A-5 ; < 1 205 CI). Partie committée (forme CI `66f75c2...HEAD`) : 677 + 18 = 695
  (= valeur G2/cp-2). Pli-2 seul (arbre vs HEAD) : 4 fichiers, 149 + 25 = 174 (le RUNBOOK est exclu par
  `docs/**/*.md`). Le cumulé (819) < 695 + 174 : des lignes ajoutées au `d141413` puis remplacées par le pli (bloc du
  scan) ne comptent qu'une fois contre la base — c'est la forme que la CI calculera sur le commit final. Détail :
  `durable.test.ts` 238/0, `repair-tail.test.ts` 324/0, `harness.ts` 38/3, `reconcile.ts` 22/3, autres inchangés.
- **A-6** (`a6.sh` → `a6-pli2.txt`) : 9/9 `SAME` (blob base `66f75c2` = blob HEAD = arbre), valeurs = table ADR-U4b
  (`2f9a31f6` `a5e66cd3` `5733daeb` `7bee76fc` `3376eb08` `9206df91` `0e232519` `3603265d` `cb020425`).
- **DELIVERED** : `F:\tmp\gfsync1-pli\DELIVERED-pli2.sha256` (sha `a45c2c5b…`), 12 fichiers (même ensemble que le
  `DELIVERED.sha256` du pli-1), `sha256sum -c` 12/12 OK. Changés vs pli-1 : RUNBOOK `7ab57190…` → `2323c569…`,
  `reconcile.ts` `e42de49c…` → `6e62cd6a…` (docstring seule : **écart aux sha cités par G2/cp-2 déclaré**),
  `durable.test.ts` `ad5cb1a2…` → `5333ee13…`, `harness.ts` `44b690a8…` → `9188c606…`, `repair-tail.test.ts`
  `69c92415…` → `de8880b8…`. Inchangés : `ledger.ts` `625c759f…`, `repair.ts` `e997c6fd…`, `cli.ts` `dccbe95f…`,
  `lock.ts` `6655a9c8…`, bin `aadd8983…`, `no-fsync.ts` `45a6597f…`, `ukemi-guard-record.test.ts` `5c1d1b5e…`.

## 8. Critère (d) RELATIF (ruling I-10) — paires ABBA base/lot
`pairs.sh` (base = clone jetable `F:\tmp\gfsync1-pli\base-clone` @ `66f75c2c…`, `git status` 0, `node_modules` par
`mk-nm.ps1` ; lot = worktree, `d141413` + 5 fichiers du pli) ; `npm test` sous `env -u` des 8 clés ; ordre ABBA ;
journal `pairs\pairs.log` (sha `c6c4373b…`), exécutions `run1-base.log` `1901ef75…`, `run2-lot.log` `0f1f7e68…`,
`run3-lot.log` `5fae9ffc…`, `run4-base.log` `e7cb4d66…`. AUCUN autre acte lourd de ma part pendant les 4 exécutions
(édition de texte seulement).

| Exécution | Arbre | Fenêtre UTC | exit | tests / pass / fail / skip | `duration_ms` |
|---|---|---|---|---|---|
| run1 | base `66f75c2` | 05:26:26-05:27:57 | 0 | 933 / 931 / 0 / 2 | 87 949 |
| run2 | lot (pli-2) | 05:27:58-05:29:25 | 0 | 951 / 949 / 0 / 2 | 85 241 |
| run3 | lot (pli-2) | 05:29:25-05:31:05 | 0 | 951 / 949 / 0 / 2 | 97 570 |
| run4 | base `66f75c2` | 05:31:06-05:32:40 | 0 | 933 / 931 / 0 / 2 | 92 882 |

Ratios (`node -e` sur les valeurs ci-dessus) : paire A (run2/run1) **×0,969** ; paire B (run3/run4) **×1,050** ;
moyennes base 90 416 / lot 91 405 ⇒ **×1,011**. **(d) relatif TENU (≤ ×2) sur les deux paires.** Lecture honnête :
la base elle-même met 88-93 s (58-68 s aux paires du G2) — la charge de la machine partagée domine la variance ; ces
ratios ne mesurent PAS un coût nul du lot (G2 : ×1,57 / ×1,37 ; pli-1 : ×1,37 / ×1,83), ils montrent seulement que le
pli-2 ne fait pas sortir la suite de la borne. Le test jumeau a pris 4,9 s et 6,3 s dans la suite (run2, run3).

## 9. Consigne standard (A-1..A-13) : point par point, pour ce pli
| Point | État | Preuve / motif |
|---|---|---|
| A-1 | fait | 1ʳᵉ ligne du rendu ; `claude-opus-5-5[1m]` |
| A-2 | fait | `node_modules` du worktree déjà construit (G1) ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-gfsync1\packages\rpc-guard\src\index.ts` ; clones jetables par `mk-nm.ps1` (résolution = chaque clone) ; retrait par `rm-nm.ps1` en fin de pli (§ journal) |
| A-3 | fait | `oracle.sh` : `$U npm run <s> > log 2>&1; echo "<s> exit=$?"` (jamais après un pipe), 7 gates (§6) |
| A-4 | fait | `DELIVERED-pli2.sha256` (§7) ; rendu sous `F:\tmp\gfsync1-pli\` ; 0 commit ; rien sur C: ; aucun réseau (fetch bouchonné dans les enfants, clé factice, hôte `.invalid`) |
| A-5 | fait | `r25.sh`, pathspec extrait VERBATIM de `ci.yml:65` (§7) |
| A-6 | fait | `a6.sh` : 9 gelés, blob base / blob HEAD / arbre (§7) ; aucun fichier du gel U-4b touché |
| A-7 | fait | tout oracle/test/mutant/sonde sous `env -u` des 8 clés (harnais : retrait par liste ou par motif) ; aucune variable affichée |
| A-8 | fait | le journal consommé par `reconcile` dans le test jumeau est celui que PRODUIT `repair-tail` (bin) après un écrivain réel ; les variantes manuelles sont dans la forme décrite par le RUNBOOK |
| A-9 | n-a | aucune phrase servie au public ; verdicts CLI fermés inchangés |
| A-10 | fait (CLI) | sorties du bin assertées EXACTEMENT (`[code, stdout]` ; stderr exact pour C-G2-2(d)) |
| A-11 | fait | 4 harnais TAP, CRLF normalisé, tué ⇔ rouge ET `not ok … - <tueur attendu>` ET restauré |
| A-12 | fait | en-têtes (HEAD, MERGE_HEAD, node, plateforme, commande, date, sha de harnais/patch) sur chaque journal de preuve ; exceptions déclarées : `baseline-2files.tap` et `pli2-2files-run1.tap` (contrôles rapides de développement, heure imprimée hors fichier), supplantés par l'oracle `p2` et les TAP de fusion à en-tête |
| A-13 | fait | sources écrites par Edit/Write ; recompte node (`f.replace(/\\/g, "/")` = 1) ; harnais copiés par `sed` sur des chemins sans barre oblique inverse, recompte des `\\` source/copie égal (5/5, 1/1) |
| B-4 | fait | `--cycle/--op/--reason` REQUIS : désormais épinglés un à un (C-G2-2(d), N15/N15b/N15c) |
| C-1..C-4, B-1..B-3, B-5, B-6 | n-a | aucune classe d'erreur, aucun corps d'opérateur, aucune lecture de clé, aucun hôte touché |
| D-1 | fait | chaque test/vecteur ajouté a au moins un mutant nommé ROUGE (§10) |
| D-2 | fait | record du heal : liste de valeurs recalculées indépendamment (sha du préfixe, sha de `es[2].entry_sha256`) |
| D-3 | fait | test d'intégration non-LLM par le bin du tuyau `<op>.repair.jsonl` → `reconcile` (seul `globalThis.fetch` bouchonné, dans l'enfant) |
| D-4 | fait | diff des tests annoté §11 : aucune assertion retirée ; seule règle remplacée = la règle textuelle hors paquet du scan (D-P2-1) |
| E-1..E-3 | n-a | verrou, ledger, backoff inchangés |
| F-1 | fait (proposé) | lignes ADR proposées à l'orchestrateur (§13) : tuyau `<op>.repair.jsonl`, D-FS-5, D-FS-6 ; aucun renvoi `F:\tmp` dans ces textes |
| F-2 | fait | 0 octet non-ASCII dans les sources touchées ; `gate:vocab` (§6) |
| F-3 | fait | D-P2-1..D-P2-7 (§11) ; advisor consulté avant code et avant clôture (journal) |
| G-1 | n-a | aucune pièce publique touchée (`@monark/rpc-guard` reste `upcoming`) |

## 10. Tableau correction ↔ test ↔ mutant tué ↔ `error_origin` (proposé ; assigné au G7)
| Correction | Test (fichier) | Mutants TUÉS byIntended (harnais) | `error_origin` proposé |
|---|---|---|---|
| **C-G2-1 = C-V-2** tuyau `<op>.repair.jsonl` → `reconcile` composé depuis le producteur RÉEL, par le BIN servi | NOUVEAU `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` (`repair-tail.test.ts`) : écrivain réel mort → 4 096 NUL → `repair-tail` → `unlock` → `reconcile` `NO-GO repaired_in_window` → mêmes instantanés `NO-GO hard:getTransaction` (E11) → instantanés chaînés `GO` | C9a′, C9b′, N20 (pli2) | worker G1 : D-3 déclaré « fait » alors que la composition s'arrêtait à `unlock` ; le tuyau n'était prouvé que par un journal ÉCRIT À LA MAIN (A-8, CA-11 durci) |
| C-G2-1 (i) **= C-V-3** frontière `lines_after ==` début de fenêtre | test jumeau, étape (2) (2ᵉ écrivain réel à 0 appel après un `reconciled`, `lines_after` asserté == début de fenêtre) + vecteur (i) du test unitaire | **MV-3** (cp-2, ex-survivant), **N1** (G2), N1′ (pli2) | worker G1 : vérification incomplète (aucun mutant du harnais ne visait la borne `>=`) |
| C-G2-1 (ii) mode `aggregate` | test jumeau, étape (4) (cycle `agg`, `--mode aggregate`, `total_ru`) + vecteur (ii) unitaire | **N2** (G2), N2′ (pli2) | worker G1 (idem, mode chainstack non composé) |
| C-G2-1 (iii) record parseable sans `lines_after` numérique | test jumeau, étape (3) (NO-GO deux fenêtres de suite, puis LEVÉE ⇒ GO) + vecteur (iii) unitaire | **N17** (G2), N17′ (pli2) | worker G1 |
| **C-G2-2(a)** record complet après heal | `repair_tail_heals_a_head_one_behind_after_the_strip` (+ record recalculé) | **N4** (G2) | worker G1 (D-2 appliqué au seul cas `none`) |
| **C-G2-2(b)** ligne JSON complète sans `\n` + NUL ⇒ `torn_tail`, 0 octet | `repair_tail_refuses_torn_or_clean_or_inner_nul_tails` (+ cas `unterminated`) | **N5** (G2) | worker G1 |
| **C-G2-2(c)** retry EPERM/EACCES/EBUSY | `durable_head_rename_retries_…` (+ cas (4)) | **N11** (G2), N11b, N11c (pli2) | worker G1 (ADR D-FS-2/E-3 déclare 3 codes, test sur EPERM seul) |
| **C-G2-2(d)** `--cycle`/`--op`/`--reason` requis ⇒ exit 2, 0 octet | `repair_tail_is_served_by_the_bin` (+ 3 cas par le bin) | **N15** (G2), N15b, N15c (pli2) | worker G1 (B-4 « fait » sans test) |
| **C-G2-3(a)-(d)** RUNBOOK §3 étape 6, §3 « Interrupted repair », §4 étape 5, §5 ; docstring `reconcile.ts:43-47` | textes ; énoncés exécutables épinglés par le test jumeau (NO-GO une fois / fermeture de fenêtre = N20 ; E11 ; non numérique ⇒ toutes les fenêtres + levée = N17′) et par le vecteur unitaire du record minimal `{"lines_after":…}` | N20, N17′ (pli2) pour les énoncés exécutables ; le reste = texte (déclaratif, D-1) | worker G1 (textes écrits sans exécuter les chemins manuel/E7/E8/E11) |
| **C-G2-4** scan contournable (X1) | `durable_production_path_…` partie (2) réécrite (règle d'import résolue) | **X1** (G2), X2, X3, X4 (pli2) ; P1/P2/P3/P5 (worker) et MV-1/MV-2 (cp-2) toujours tués | worker pli-1 (règle textuelle `DURABLE_FS.x =`) |
| **Constat nouveau** : scan livré ROUGE sur l'arbre fusionné (`lot/etude-suite` ≥ `2c276bb`) | idem ; preuve fusion à blanc §4 (A rouge / B vert) | — (faux positif, pas un mutant) | worker pli-1 (règle textuelle sur les sources d'un AUTRE paquet) ; indétectable au G2/cp-2 (fusion Bell postérieure à leur fusion à blanc `8d12ef2`) |

## 11. D-4 (diff des tests annoté) et déviations D-P2-n (F-3)
Lignes RETIRÉES des tests (`git diff d141413 -- packages/rpc-guard/test/ | grep "^-"`), une à une :
- `durable.test.ts` `import { join } from "node:path";` → `import { join, posix } …` (ajout de `posix`, résolution).
- `durable.test.ts` bloc (2) du scan : commentaire 3 lignes, `const hits…, scanned…`, boucle des 5 racines, filtre
  `.ts`/`.mjs`, règle `DURABLE_FS\.\w+\s*=[^=]` sur TOUTES les racines, règle `process.env` limitée à `src` ⇒ remplacés
  par : racines `scripts` + `{apps,packages}/*/{src,scripts,bin}` (sur-ensemble des 5), extensions `.[mc]?[jt]s`,
  règle d'import RÉSOLUE (nouvelle), règle `no-fsync` INCHANGÉE (toutes racines), règles affectation + `process.env`
  sur `packages/rpc-guard/{src,bin}` (le bin s'ajoute). **Seul affaiblissement formel** : la règle textuelle
  `DURABLE_FS.x =` ne s'applique plus HORS du paquet — motif mesuré (§1, §4 A : elle rougit sur un COMMENTAIRE du seam
  PROPRE de Bell à la cible de fusion) ; pour le seam de CE paquet, la règle d'import la remplace (le seam n'est
  atteignable que par un import de `src/ledger.ts` ; X1 l'esquivait sous l'ancienne règle, `Object.assign` sur alias).
  Résidu déclaré, identique pour les deux règles : un spécificateur CALCULÉ ou une ré-exportation par un module hors
  racines échappe au scan statique ; la partie (1) (processus neuf, spécificateur de production) reste la preuve.
  Non-vacuité : ligne existante conservée octet pour octet + 2 ajouts (résolveur ; bin).
- `repair-tail.test.ts` : 2 lignes d'import élargies (`copyFileSync`, `mkdirSync`, `renameSync` ; `realWriter`) ;
  bloc enfant de 6 lignes de `repair_tail_composition_…` déplacé dans `harness.ts` `realWriter` (code enfant généré
  OCTET-IDENTIQUE pour `("cut", 3)` ; `assert.equal(child.status, 0, child.stderr)` et toutes les assertions suivantes
  inchangées) ; helper `rec` : paramètre optionnel `extra` ajouté (appels existants inchangés).
- Aucune assertion retirée ni affaiblie ailleurs ; `harness.ts` : ajouts seulement.

Déviations déclarées :
- **D-P2-1 — C-G2-4, écart à la lettre** : pas de règle « jeton `DURABLE_FS` hors paquet = hit » (la lettre du G2) ;
  règle d'import résolue à la place. Motif MESURÉ : `lot/etude-suite` porte depuis `2c276bb` le seam propre de Bell
  (14 occurrences du jeton dans `apps/bell/src/rebase-crosscheck.ts`) ; la lettre rendrait le test rouge à la fusion
  (et l'ancienne règle textuelle l'est déjà : §4 A). Conseillé par l'advisor ; X1 du G2 est tué (§5.3) ; X2/X3/X4
  ajoutés. Phrase ADR de repli fournie (§13, « heuristique déclarée »).
- **D-P2-2 — harnais cp-2 rejoué sur clone jetable** (restauration `git checkout d141413`) avec le pli SANS la
  docstring `reconcile.ts` ; `TEMP` repointé (chemin seul) ; MV-10 par `mv10.mjs` inchangé (procédure du cp-2).
- **D-P2-3 — variante (i) sur le même cycle avec un 2ᵉ VRAI écrivain** (0 appel, meurt verrou tenu) + étape RUNBOOK
  `bak_exists` par le bin, au lieu du verrou fabriqué d'E10 (préféré par l'advisor pour R-25 ; coût en lignes égal,
  mesuré ; couvre en plus la 2ᵉ réparation d'un même cycle et la ligne `bak_exists` du tableau RUNBOOK).
- **D-P2-4 — record manuel sans `head_action`** : le RUNBOOK prescrit le record MINIMAL
  (`iso, cycle, op, reason, lines_after`) ; `reconcile` ne lit que `lines_after` ; la valeur éventuelle de
  `head_action` d'un record manuel reste une décision orchestrateur (G2 C-G2-3(a)) — point ouvert formé I-P2-3 (§12).
- **D-P2-5 — harnais worker et G2 rejoués avec chemins seuls changés** (diffs joints, sha des copies : worker
  `7928402f…`, G2 `f1bbbf08…`, cp-2 `84d8c1fc…`).
- **D-P2-7 — ligne « tuyaux » de l'ADR (C-G2-1 nomme le WORKER porteur)** : `F:\tmp\gfsync1\ADR-amendement.md` est
  hors worktree et hors TEMP du pli, et son insertion au dépôt est un acte orchestrateur (cp-2 C-V-1) ⇒ je ne touche pas
  l'original (sha `f3bfa680…` inchangé, = sha cité par le G2) ; je fournis le texte (§13) ET une copie prête à insérer
  `F:\tmp\gfsync1-pli\ADR-amendement-pli2.md` (sha `c9911d4c…`, 33 281 o) = original + §13 appliqué, diff
  `ADR-amendement-pli2.diff` (sha `62dfafe6…`, 7 lignes `<`/`>` : D-FS-4 + garde redondante, D-FS-5, D-FS-6 scan,
  ligne tuyaux), `grep -c "F:\tmp"` = 0. Motif du risque fermé : insérer l'original tel quel décrirait l'ANCIEN scan et
  citerait le test à journal fabriqué comme preuve de branchement.
- **D-P2-6 — coût** : le test jumeau lance 16 fois le bin et 3 écrivains (7,1 s mesurés seul) ; effet mesuré sur la
  suite par paires ABBA (§8). Il SAUTE dans le miroir public (pas de `bin/`) : la CI publique garde les vecteurs
  unitaires (i)/(ii)/(iii).

## 12. Items formés et points ouverts (zéro dette nue)
- **I-P2-1 — bloqueur G7 (hors listes G2/cp-2, mesuré §4)** : fusionner `d141413` SANS ce pli rend l'oracle ROUGE sur
  l'arbre fusionné (`durable_production_path_…`, faux positif sur le seam propre de Bell). Porteur : orchestrateur.
  Déclencheur : G7, AVANT la fusion — committer le pli-2 sur `lot/garde-fsync-1` puis rejouer l'oracle sur l'arbre
  fusionné réel (déjà exigé par cp-2 C-V-5(b)). Preuve de fermeture fournie : fusion à blanc B (17/17) + oracle de
  l'arbre fusionné (§6).
- **I-P2-2 — textes ADR** (§13 : tuyau `<op>.repair.jsonl`, D-FS-5, D-FS-6, garde redondante ; copie prête
  `ADR-amendement-pli2.md` + diff, D-P2-7). Porteur : orchestrateur (C-V-1, C-G2-3(d) volet ADR, C-G2-5).
  Déclencheur : insertion de l'amendement au G7 (insérer la copie pli-2, pas l'original).
- **I-P2-3 — décision orchestrateur, formée** : valeur de `head_action` d'un record MANUEL (G2 C-G2-3(a)). Options :
  (a) absente — **défaut appliqué** au RUNBOOK §4 étape 5 (record minimal), **amendable sans effet sur `reconcile`** ;
  (b) `"manual"` (hors de l'ensemble servi `none|heal_penultimate`) ; (c) autre valeur fermée. Effet sur `reconcile` :
  AUCUN dans les trois options (il ne lit que `lines_after` ; le vecteur unitaire lui donne `{"lines_after":2}` seul).
  Déclencheur : insertion ADR au G7.
- Résidu déjà formé, rappelé (non nouveau) : la branche POSIX des tests (dont le test jumeau et les cas EACCES/EBUSY)
  n'a tourné ici que sous win32 ; première exécution à la CI ubuntu (item CI de l'amendement, décision 136).

## 13. Textes ADR PROPOSÉS à l'orchestrateur (C-G2-1 tuyau, C-G2-3(d) ADR, C-G2-5) — donnée, non insérée
Le worker n'édite pas l'amendement original (hors worktree, inséré par l'orchestrateur au G7, C-V-1) ; les quatre
textes ci-dessous sont appliqués dans la copie `F:\tmp\gfsync1-pli\ADR-amendement-pli2.md` (D-P2-7). Aucun renvoi
`F:\tmp` dans ces textes.
- **Tuyaux, ligne `<op>.repair.jsonl`** (remplace la ligne actuelle) :
  `| <op>.repair.jsonl | repair-tail ; record minimal manuel (RUNBOOK §4 étape 5) ; record reconstitué (RUNBOOK §3,
  réparation interrompue) | reconcile (NO-GO repaired_in_window, une fois par fenêtre) ; RUNBOOK + ancre (humain) |
  <cycle>/<op>.repair.jsonl | repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile (bin spawnSync :
  écrivain réel mort → NUL → repair-tail → unlock → reconcile NO-GO → mêmes instantanés NO-GO hard:getTransaction →
  instantanés chaînés GO ; (i) frontière lines_after == début de fenêtre, (ii) agrégé, (iii) lines_after non numérique
  jusqu'à la levée) ; reconcile_reads_the_repair_journal_per_window (unitaire, journal écrit à la main, miroir public ;
  ne vaut pas « branché ») |`
- **D-FS-5** (phrase « La ligne `reconciled` appendée roule la fenêtre (drapeau par fenêtre, jamais permanent) ; une
  ligne illisible compte (fail-closed) » remplacée par) : « Ce NO-GO est émis UNE fois : la ligne `reconciled` qu'il
  appende ferme la fenêtre réparée, indépendamment de l'orchestrateur ; l'outil ne calcule donc jamais la borne
  numérique de cette fenêtre (calcul à la main, RUNBOOK §3 étape 6 ; les mêmes instantanés rejoués voient une fenêtre
  vide ⇒ `NO-GO hard:<method>`, mesuré). Un record à `lines_after` NUMÉRIQUE signale une seule fenêtre ; une ligne
  illisible ou sans `lines_after` numérique signale TOUTES les fenêtres (fail-closed, jamais roulée) jusqu'à sa levée
  (RUNBOOK §5). `reconcile` ne voit une réparation que par ce journal : une réparation MANUELLE n'est vue que si son
  record minimal est appendé (RUNBOOK §4 étape 5) ; une réparation interrompue entre la troncature et son record doit le
  reconstituer (RUNBOOK §3). »
- **D-FS-6**, phrase du scan (remplace « Scan structurel des sources … `process.env` dans les sources du paquet ») :
  « Scan structurel, HEURISTIQUE déclarée : chaque source sous `scripts/` et `{apps,packages}/*/{src,scripts,bin}`
  (`.ts .mts .cts .js .mjs .cjs`) ; chaque spécificateur de module (`from`, `import`, `require`, `new URL`) est RÉSOLU
  (relatif au fichier ; `@monark/rpc-guard/<x>` → `packages/rpc-guard/<x>`) : hors `packages/rpc-guard/{src,bin}`, une
  cible sous `packages/rpc-guard/src/` ou `test/` = hit ; dans `src`/`bin` : cible sous `test/`, affectation
  `DURABLE_FS.x =`, lecture `process.env` = hit ; toute mention `no-fsync` = hit. Pas de règle sur le jeton nu : le seam
  PROPRE de Bell (`apps/bell/src/rebase-crosscheck.ts`, BELL-SHORTPAGE-1) est un autre objet — l'ancienne règle
  textuelle rougissait sur son commentaire à la fusion (mesuré). Un spécificateur calculé échappe au scan : la partie (1)
  reste la preuve. Mutants : P1, P2, P3, P5, H1, X1, X2 (`new URL`), X3 (script → `test/harness.ts`), X4 (bin →
  `../test/harness.ts`). »
- **Garde redondante déclarée** (C-G2-5 ; le G1 §6 écrit « aucune ») : « heal explicite `repair.ts:64` + réouverture de
  contrôle `repair.ts:65` : N16 ÉQUIVALENT, N6 quasi-équivalent (survivants, rejoués au pli-2), N6+N16 tué. »

## Journal d'avancement (UTC)
- 04:41 début ; lecture des entrées ; orientation (§1).
- 04:53 ligne de base 16/16 ; constat « scan vs `lot/etude-suite` 2c276bb » mesuré.
- 04:5x advisor (avant code) ; 04:58-05:08 code + RUNBOOK + docstring ; 05:05 17/17 ; typecheck/eslint/ratchet verts.
- 05:10-05:12 clones jetables (`cp2-clone` @ `d141413`, `merge-clone` @ `7154d18`, `base-clone` @ `66f75c2`) + `mk-nm.ps1` ;
  05:12:25 fusion à blanc A (rouge, 15/16) ; 05:12:53 B (vert, 17/17).
- 05:13:28-05:18 harnais worker 37/37 ; 05:14:14-05:15 cp-2 10/10 (clone) ; 05:18:17 G2 19/21 (N6/N16 déclarés) ;
  05:19:37 propres 13/13.
- 05:20:39-05:23:13 oracle arbre fusionné 7 × 0 (1014/1012/0/2) ; 05:22 R-25 819, A-6 9/9, DELIVERED 12/12 ;
  05:23:14-05:26:11 oracle worktree 7 × 0 (951/949/0/2) ; 05:26:26-05:32:40 paires ABBA ×0,969 / ×1,050.
- 05:33:22 contrôle : worktree HEAD `d141413`, `git status` = les 5 fichiers du pli, aucun fichier ignoré parasite,
  `sha256sum -c DELIVERED-pli2.sha256` 12/12 ; gardes de mutants vides. `F:\Monark` : aucune écriture de ma part
  (lectures : `git clone`/`show`/`grep`/`log`/`branch`/`rev-parse`/`count-objects`) ; son HEAD a avancé pendant le pli
  (`ec68fdf`, commits orchestrateur) et `docs/sec-4927/*` non suivis y sont apparus (autres agents), sans effet ici.
- 05:3x **advisor intégré consulté AVANT clôture (conseil, pas verdict)** : travail jugé complet ; trois actes de
  clôture exigés et FAITS : (1) retrait des `node_modules` à jonctions des 3 clones par `rm-nm.ps1` (05:38:44Z ;
  `F:\Monark\node_modules` : 220 entrées `ls -A` AVANT == APRÈS, `@monark` 10 ; jamais `Remove-Item -Recurse`) ;
  (2) déviation D-P2-7 déclarée + copie ADR prête à insérer (`ADR-amendement-pli2.md`, diff, 0 `F:\tmp`) ; (3) cette
  ligne. Précisions non bloquantes appliquées : chaîne héritée de l'en-tête du harnais worker (§5.2) ; I-P2-3 « défaut
  appliqué (a), amendable sans effet sur `reconcile` ».
- État laissé : worktree = `d141413` + 5 fichiers modifiés (non committés, R-20), `node_modules` du worktree INTACT
  (retrait = acte orchestrateur, A-2) ; clones jetables SANS `node_modules`, conservés pour re-vérification
  (`merge-clone` en état `merge --no-commit` + pli appliqué, conflit docs résolu dans le clone, AUCUN commit ;
  `cp2-clone` = `d141413` + `pli2-no-reconcile.patch` ; `base-clone` = `66f75c2` propre) ; re-vérification :
  `mk-nm.ps1 -Tree <clone>` puis les commandes citées. Aucun commit nulle part (R-20).
