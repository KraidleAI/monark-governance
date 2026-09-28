claude-opus-5-5[1m]

# G1 — lot M-4 « preuve F2P et killers » (ADR-METHODE-2 D2, ligne M-4, C-6, décision 267 (b))

- **Modèle résolu** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1), worker, contexte frais ; effort de la mission : max.
- **Mission** : `F:/tmp/methode/mission-g1-m4.md` (10 l., sha256 `fa8739261be27671dcef64e50f852f4c2eac080876f52eaef4077718fded094c`, recomputé égal à la valeur de la tâche avant toute lecture) ; lue en entier à 05:11:54Z (`date -u`).
- **Base** : worktree `F:/Monark-wt-m4`, branche `lot/methode-m4`, HEAD `0d54280d213bb37c9c67fa9d3bf67a85a73c83a1` ; `git status --short` à l'ouverture : **vide**.
- **Classification D-4 (e)** : **bounded** (script neuf, test racine, aucun fichier existant touché).
- **Pièces lues en entier** (sha256) : `docs/adr/ADR-METHODE-2.md` (190 l., `9c71fc53…85c2` : D2, D6, lignes M-4 et M-6, C-6, décision 267 (b), formules l.58) ; `F:/tmp/methode/C-outillage.md` (70 l., `8e127f73…0a1c` : §(2), §(5)) ; `docs/methode/FAITS-superpowers-2026-09-28.md` (30 l., `d1ac03fa…6b5c`) ; `F:/tmp/methode/A-defauts.md` (53 l., `47c0161e…60be` : classe R de (2), 211) ; `F:/Monark/docs/G1-lot-dojo-pr4a1.md` (398 l., `f926c8f6…dbff7`, journal G1 réel à mutants nommés) ; `scripts/lang-gate.mjs` (`45e4420f…abf1`, forme) ; `test/no-secret-in-repo.test.ts` (`3e430d1b…643a`, forme). `F:/Monark-wt-m1/docs/G1-lot-methode-m1.md` **n'existe pas** (M-1 en cours, mesuré) : non lu. Outils d'hôte relus : `F:/tmp/dojo/drand-1a/mk-nm.ps1` (`d70d8aea…fbe4`), `rm-nm.ps1` (`b51b5d22…8749`), `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (`140be120…d3bf`).

## 0. Horaires (`date -u`)

| Heure | Acte |
|---|---|
| 05:11:54Z | sha de la mission vérifié, mission lue ; worktree propre |
| 05:12Z → 05:3xZ | lecture des pièces ; mesures sur Node v24.15.0 : forme du TAP (verts sans `location`, échec de chargement = entrée au nom du fichier avec `exitCode`, stderr en `# `), OOM (`exitCode: 134` + « Reached heap limit »), jonctions (`Dirent`/`lstat` = lien, `rmSync` récursif ne traverse pas, témoin intact), clone `--no-local` de F:/Monark (6,5 s), `--test-name-pattern` ancré (parent + sous-tests), clone depuis un worktree lié ; advisor consulté (§15) |
| 05:3xZ → 05:40:17Z | `scripts/red-proof.mjs`, `scripts/red-proof.d.mts`, `test/red-proof.test.ts` écrits ; 1er passage du test : 3 rouges (`NODE_TEST_CONTEXT` hérité, §3 d-m) |
| 05:41Z | crochet PreToolUse de l'hôte : `git commit --no-verify` refusé (R-22/G7) ; `--no-verify` et `commit.gpgsign=false` retirés de la fixture (§3 d-o) |
| 05:41:46Z | correctifs `NODE_TEST_CONTEXT` et `core.autocrlf` ; test 12/12 |
| 05:44Z → 05:46:51Z | compaction 288 → 279 l. ; F2P manuscrite et `red-proof` sur ce lot, version à 12 tests (traces) |
| 05:47:19Z → 05:48:45Z | clone d'oracle, `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`), six portes statiques (`static-1`, 0) ; `.d.mts` retiré ⇒ `typecheck` rouge (§3 d-q) |
| 05:49:13Z → 05:49:44Z | R-25 = 487 ; essai sur le lot réel PR-4a-1 (trace, rejoué §8) ; advisor (§15) |
| 05:53Z → 06:06:02Z | test porté à 15 : fichier **modifié** (M), killer ambigu, test 42, runs `weak`/`empty`, ligne « inconclusive », digest, tête du worktree ; compaction 279 → 261 l. |
| 06:00:51Z → 06:04:23Z | mutants supplémentaires, passe 1 : 24/26 (E16, E24 survivants ⇒ tests ajoutés) |
| 06:06:15Z → 06:13:09Z | passe 2 des mutants (26/26), `red-proof` sur ce lot, portes `static-2`, F2P manuscrite, lot réel PR-4a-1 rejoué : faits sur l'avant-dernier état du test (en-tête faux : « eight … three ») — traces |
| 06:15Z | en-tête du test corrigé (« eleven case tests in four new files », « two linked worktrees ») : état final, 15/15 |
| 06:16:20Z → 06:16:29Z | **F2P manuscrite** sur le test final (§6) |
| 06:16:37Z → 06:17:52Z | **F2P outillée n° 1** : `red-proof` sur ce lot, 15/15 killers tirés tués (§6) |
| 06:18:01Z → 06:21:07Z | mutants supplémentaires, passe 3 (fichiers finaux) : **26/26** (§7) |
| 06:21:14Z → 06:22:01Z | six portes statiques sur les fichiers finaux (`static-3`, 0) |
| §10 bis | oracle sous verrou d'hôte |

## 1. Livrables

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `scripts/red-proof.mjs` | créé (non suivi) | 261 | `9bf54a99fa7a30b5b055b39d62772c053c0bd792d41a76d2965ca21c9ed84048` |
| `scripts/red-proof.d.mts` | créé (non suivi) | 21 | `a26cb754e97cd0b56c5c17be6bda47787274ff39d00cd52df4b6651148540f62` |
| `test/red-proof.test.ts` | créé (non suivi) | 235 | `ac8193b26d82632485c9f2810803ebcfc54d8d72f45cb1886059b4dcc37e099a` |
| `docs/G1-lot-methode-m4.md` | ce journal (hors R-25) | — | rendu hors du fichier (`DELIVERED.sha256`) |

Aucun fichier existant modifié ; aucun fichier exporté (`scripts/` et `test/` hors liste blanche de `export-public.mjs`, `export:check` vert). Copies : `F:/tmp/methode/m4-deliver/`.

## 2. Interface

- CLI : `node scripts/red-proof.mjs --base <sha> --gel <dossier worktree | sha> [--repo <dossier>] [--out <dossier>] [--draw <n> --seed <entier>]` ; exit 0 = preuve acceptée, 1 = refusée, 2 = usage ou erreur d'outil.
- Sorties dans `--out` (défaut `tmpdir()/red-proof-out`, jamais le cwd) : `RED-PROOF.json` (`schema: "red-proof-v1"`, `at`, `node`, `repo`, `base`, `gel: {ref, mode: worktree|commit, head, digest}`, `files: {tests, support, added}`, `tests: [{name, file, line, base, gel, module, killer, killerProblem, verdict, reason}]`, `unchanged`, `draw: {seed, requested, population, drawn: [{name, file, killer, status, outcome, sha256_before, sha256_after, tap: {path, sha256}}]} | null`, `tap: {base, gel: {path, sha256}}`, `ok`), `base.tap`, `gel.tap` (flux TAP par fichier, chacun après une ligne `# red-proof file: <chemin>`), `killer-<n>.tap`.
- Statuts (fermés) : `pass | skip | assert-fail | import-fail | other-fail | missing | inconclusive`. Verdicts : `F2P | new-module | refused | inconclusive`. Issues de killer : `killed | stillborn | invalid | inconclusive`.
- **Convention killer (fermée, documentée en tête du script)** : sur la ligne au-dessus d'un `test(` ou `it(` de niveau 0 : `// killer: <fichier>:<ligne> <OP> "<avant>" -> "<après>"`, OP ∈ COR, ROR, SDL, CONST ; `<avant>` présent **exactement une fois** sur la ligne du gel ; SDL vide la ligne (`<après>` = `""`).
- Recette du `digest` : lignes `<statut> <chemin> <sha256 du fichier au gel | ->` des changements base..gel triés par chemin, jointes par `\n`, puis sha256 (recomputée par T8).
- `scripts/red-proof.d.mts` : surface de types pour le test racine (`parseTap`, `classify`, `drawKillers`, types du JSON).

## 3. Décisions de ce G1 hors texte de la mission (déclarées ; questions §14)

- **d-a** : le gel tourne dans un **clone reconstruit** (mode worktree : clone de la base + diff du worktree recopié, suppressions comprises ; mode commit : clone au sha du gel), pas « en place » dans le worktree : aucune écriture dans le worktree, arbre identique au futur commit.
- **d-b** : fichiers de support = fichiers du diff (A/M) hors `*.test.ts` sous un dossier `test/`, copiés dans la base avec les tests (« leurs fixtures listées ») ; listés dans `files.support`. `fixtures/` racine (données de contrat) non copié.
- **d-c** : test **jugé** = test de niveau 0 dont l'intervalle (de sa déclaration à la suivante) porte une ligne changée (`git diff -U0`), **lignes `// killer:` exclues** ; fichier ajouté ⇒ tous ses tests jugés ; hunk de pure suppression attribué à la ligne qui le précède. Sans cette règle, tout ancien test d'un fichier modifié serait « vert à la base ⇒ refus ».
- **d-d** : une exécution `node --test` **par fichier** (les verts n'ont pas de `location` dans le TAP de Node 24 : la correspondance nom → fichier n'est sûre que fichier par fichier) ; correspondance nom TAP ↔ déclaration statique (`^(test|it)\("…"`), les 1 440 tests de niveau 0 du dépôt ayant cette forme (mesuré : aucun `describe`, aucun nom en gabarit ou entre apostrophes, aucun doublon dans un fichier).
- **d-e** : statuts étendus au-delà de `assert-fail|import-fail|pass` de la mission : `other-fail` (rouge hors assertion : TypeError, délai, plantage) ⇒ refus (rouge tautologique, FM-3.3) ; `missing` (absent du TAP) ; `skip` ; `inconclusive` (enfant tué : `exitCode` 134, signal, « heap out of memory », délai de `spawnSync`), jamais « vert » ni « tué ».
- **d-f** : exit 0 exige ≥ 1 test jugé (diff sans test ⇒ 1) et tous les killers tirés tués.
- **d-g** : issue d'un killer : `killed` = rouge avec ses modules chargés (échec d'assertion ou d'exécution) ; `stillborn` = toujours vert ; `invalid` = échec de chargement sous le mutant (mutant qui casse la syntaxe ou retire un export : trivial) ; `inconclusive` = enfant tué, test absent ou sauté.
- **d-h** : validation statique de **tous** les killers des tests jugés (chemin relatif au dépôt sans `..`, fichier du gel, ligne dans la plage, `<avant>` une fois, SDL ⇒ `<après>` vide) ; invalide ⇒ refus, avant tout tirage.
- **d-i** : population du tirage = tests admis (F2P, new-module), ordre (fichier, ligne) ; PRNG mulberry32 + Fisher-Yates partiel ; `--seed` exigé dès que `--draw` > 0.
- **d-j** : clés JSON en anglais (`name`, `file`) : la portée racine est sous `lang:gate`, « fichier » y est un mot détecté ; `gel` gardé (CLI de la mission).
- **d-k** : `--repo` par défaut = le dossier du gel (clone depuis un worktree lié mesuré fonctionnel), sinon le cwd.
- **d-l** : `node_modules` de `--repo` lié dans chaque clone en Node (jonctions), liens d'espace de travail (`@monark/*`, seuls liens de F:/Monark/node_modules, mesuré) re-pointés vers les `packages/*` et `apps/*` du clone : effet de `mk-nm.ps1`, sans dépendre d'un chemin d'hôte ; nettoyage par `rmSync` (ne traverse pas les jonctions, mesuré avec témoin).
- **d-m** : `core.autocrlf=false` au clone (octets des blobs ; l'hôte convertit en CRLF, mesuré) ; `NODE_TEST_CONTEXT` retiré des enfants (sinon un `node --test` imbriqué rend compte au parent et n'écrit pas de TAP : mesuré, 3 rouges au 1er passage) ; `GIT_OPTIONAL_LOCKS=0` (aucune écriture d'index dans le worktree).
- **d-n** : `--test-timeout=120000` (borne de `package.json`), délai de `spawnSync` 30 min ; `--test-skip-pattern=\(test 42\)` : le test 42 n'est jamais lancé hors verrou (C-V-4) ; mesuré : un test filtré est **absent** du TAP (`missing`, pas `skip`) ; un test jugé nommé « (test 42) » est refusé.
- **d-o** : le crochet PreToolUse de l'hôte a refusé `git commit --no-verify` (R-22/G7, « interdit sans exception ») sur une fixture sous TEMP : `--no-verify` et `-c commit.gpgsign=false` retirés du test ; mesuré : aucun `core.hooksPath`, `init.templateDir` ni `commit.gpgsign` global ou système sur cet hôte.
- **d-p** : l'étiquette `<OP>` est déclarative : appartenance à la liste fermée vérifiée, sens non vérifié (ex. CONST pour un remplacement de chaîne).
- **d-q** : `.d.mts` exigé par **`typecheck`** (retiré du clone : TS7016 + TS7006, mesuré), non par `lint` (ESLint ignore `**/*.d.mts`).

## 4. Tuyaux (règle Branchement, CA-11)

| # | Entrée | Sortie | État | Test non-LLM | Statut |
|---|---|---|---|---|---|
| TP-1 | `git diff base..gel` (+ non suivis du worktree) → clones base et gel | `RED-PROOF.json` + `base.tap` + `gel.tap` + `killer-<n>.tap`, sha dans le JSON | fichiers sous `--out` ; sha au journal G1 | `test/red-proof.test.ts` (15 tests, dépôt fixture, modes commit et worktree) | **composé en test** ; exécuté sur ce lot (preuve n° 1, §6) et sur un lot réel clos (§8) |
| TP-2 | `RED-PROOF.json` du G1 + gel commis | G2 rejoue `red-proof.mjs --base <base> --gel <sha du gel> --draw 3 --seed <graine du G2>`, recompute les sha | rapport G2 | — | **absent** : consommateur réel = prochain G2 ; item METHODE-M4-G2-WIRE-1 |
| TP-3 | idem | cp-2 rejoue | rapport cp-2 | — | **absent** : item METHODE-M4-CP2-WIRE-1 |

- La pièce reste **upcoming** jusqu'au premier G2 qui la consomme (règle Branchement) ; aucun registre public ne la cite.

## 5. Tests (`test/red-proof.test.ts`, 15 tests, chacun précédé de son killer)

Dépôt fixture sous TEMP (`git init`, `package.json` minimal, `node_modules` avec un paquet ordinaire `fx-dep` et un lien d'espace de travail `@fx/w` en jonction, comme npm) : commit **base** (dont `test/old.test.ts`), commit **gel** (onze cas dans quatre fichiers neufs : `cases.test.ts` = `f2p_true`, `green_at_base`, `no_killer`, `stillborn`, `stale_killer`, `ambiguous_killer`, `red_at_gel`, `slow (test 42)` ; `existing.test.ts` = `import_existing` ; `fresh.test.ts` = `new_module` ; `dies.test.ts` = `dies`), worktree lié à la base (`good.test.ts` non suivi, `old.test.ts` **modifié**, helper `test/helpers/h.ts`), second worktree lié au gel (`weak.test.ts` : admis, killer mort-né). Runs du CLI mis en cache par clé : commit `--draw 3 --seed 7`, worktree `--draw 2 --seed 1`, weak `--draw 1 --seed 1`, empty (base = gel).

| # | Test (ordre du fichier) | Attendu | Killer (`scripts/red-proof.mjs`) |
|---|---|---|---|
| T1 | `red_proof_admits_an_assertion_red_at_base_through_a_workspace_link` | `f2p_true` : assert-fail / pass / F2P (via `@fx/w` re-pointé) | l.135 COR `!ent.isSymbolicLink()` → `ent.isSymbolicLink()` |
| T2 | `red_proof_refuses_a_test_green_at_base_or_red_at_gel` | `green_at_base` refusé (vert base) ; `red_at_gel` refusé (« not green at gel (assert-fail) ») | l.166 SDL |
| T3 | `red_proof_refuses_an_import_red_on_a_module_that_exists_at_base` | import-fail, module `lib/old.ts`, refusé | l.164 COR `&& t.newModule` → `\|\| t.newModule` |
| T4 | `red_proof_admits_a_new_module_with_its_killer` | import-fail, module `lib/fresh.ts`, new-module | l.234 COR `&& added.has(module)` → `&& !added.has(module)` |
| T5 | `red_proof_refuses_a_test_without_killer` | `no_killer` refusé | l.160 SDL |
| T6 | `red_proof_refuses_a_stale_or_ambiguous_killer` | `<avant>` absent / trois fois ⇒ refusé | l.161 SDL |
| T7 | `red_proof_refuses_a_stillborn_killer_among_the_drawn` | issues {killed, stillborn, killed} ; exit 1 | l.188 CONST `"stillborn"` → `"killed"` |
| T8 | `red_proof_tap_sha256_recomputes_equal` | sha des TAP recomputés égaux ; base, tête, mode ; **digest recomputé par sa recette** | l.247 CONST `sha(baseTap)` → `sha(gelTap)` |
| T9 | `red_proof_restores_each_mutated_file_and_removes_its_clones` | sha avant = après = octets du gel ; TEMP vide ; dépôt fixture propre, HEAD inchangé ; paquet lié intact | l.255 SDL `rmSync(work` |
| T10 | `red_proof_counts_a_killed_child_as_inconclusive` | 4 formes « non conclu » (134 + tas, tas seul, 134 seul, SIGKILL) ; TypeError ⇒ other-fail ; parents `subtestsFailed` ; ligne `dies` (sortie 134) inconclusive | l.92 SDL |
| T11 | `red_proof_draw_is_reproducible_at_a_fixed_seed` | même graine ⇒ même tirage ; graines différentes ⇒ tirages différents ; tirage du CLI = `drawKillers(admis, 3, 7)` | l.172 CONST `seed >>> 0` → `0` |
| T12 | `red_proof_worktree_gel_counts_untracked_files_and_exits_zero` | 3 F2P (dont le non suivi), exit 0, tête = base, 2 killers tués | l.210 SDL `ls-files` |
| T13 | `red_proof_judges_only_the_changed_tests_of_a_modified_file` | `unchanged` = 1, support = `test/helpers/h.ts`, jugés = `old_green` (pure suppression) et `twice_new` | l.110 SDL `set.add(l)` |
| T14 | `red_proof_never_runs_test_42_outside_the_host_lock` | `slow (test 42)` : missing / missing / refusé « host lock » | l.158 SDL |
| T15 | `red_proof_fails_on_a_stillborn_draw_or_an_empty_diff` | weak : F2P, stillborn, `ok` faux, exit 1 ; diff vide : 0 test, exit 1 | l.241 COR `&& drawn.every(` → `\|\| drawn.every(` |

Worktree : `node --test test/red-proof.test.ts` **15/15** (5 à 14 s selon la charge de l'hôte).

## 6. Preuve F2P de ce lot

- **Manuscrite** (06:16:20Z → 06:16:29Z) : clone `--no-local` `F:/tmp/methode/m4/f2p-manual/base` à `0d54280d`, **seul** le test final copié (`cmp` égal ; `scripts/red-proof.mjs` absent, mesuré) : `node --test --test-reporter=tap test/red-proof.test.ts` ⇒ **exit 1**, une entrée de fichier `not ok 1 - test\\red-proof.test.ts`, `ERR_MODULE_NOT_FOUND` sur `scripts/red-proof.mjs` (TAP `b370213a4d70d897e4cb0a36c69e0a2563db7f4de167e8b36058bc813492669e`). Gel (worktree) : **exit 0, 15/15** (TAP `56922d7bc46b4566fd7365f5ff5edeed226c2b14487d771f89c99565f00f6679`). Lecture : rouge d'**import** sur un **module neuf** (cas C-6), pas un échec d'assertion : la preuve sémantique est portée par les killers.
- **Outillée n° 1** (06:16:37Z → 06:17:52Z, 19 `node.exe` au lancement, hors verrou : un seul fichier de test) : `node scripts/red-proof.mjs --repo F:/Monark --base 0d54280d --gel F:/Monark-wt-m4 --out F:/tmp/methode/m4/red-proof-own --draw 15 --seed 20260928` ⇒ **exit 0**, `red-proof OK: 15 judged, 0 unchanged, 15 killer(s) drawn`.
  - `RED-PROOF.json` **`2355816a61683c3b0661b9c417a09c010b1a3d54b36f516a274c98d6889ef8b9`** ; `base.tap` `fb22ad601940f1fb0c77f10298d0bc6670002db5b9b28bbe461edb6aa8c34e9b` ; `gel.tap` `f884a0fae92c4aedce78b126090bfe3d0e8db62cc48e19261b62ae3cf3c1e3ae`.
  - `gel` : mode worktree, tête `0d54280d…`, `digest` `b0c7d677f092db44a5252da572cec48c41583e1f349ba9650f5bfa607d897319` sur `files.added` = les trois fichiers de code **et ce journal à son état de 06:17Z** (réécrit ensuite : un rejeu sur le gel commis donnera un autre `digest` sans changement de code, Q-M4-3).
  - 15 tests jugés, tous **new-module** (base `import-fail`, module `scripts/red-proof.mjs`, ajouté ; gel `pass`) ; tirage graine 20260928, population 15, **15/15 killers tués** : 14 par échec d'assertion, 1 (l.160, SDL « no killer declared », `killer-2.tap`) par ENOENT : sous ce mutant, la ligne sans killer est admise puis tirée, `fire()` plante sur `null`, le CLI de la fixture sort en 2 sans `RED-PROOF.json`, le test rougit à l'exécution. `sha256_before` = `sha256_after` = `9bf54a99…4048` pour les 15.
  - Traces remplacées : 05:45:41Z (version à 12 tests, `ae2a9782…54b6`), 06:09:02Z (avant la correction d'en-tête du test, `a9660c7c…e811`) : mêmes verdicts, tous killers tués.

## 7. Mutants

- **15 killers déclarés, tirés par l'outil** (§6) : 15/15 tués, fichier restauré à son sha après chacun.
- **26 mutants supplémentaires** (`F:/tmp/methode/m4/mutants/extra-mutants.mjs`, `5763b669…a59e`) sur le clone `F:/tmp/methode/m4/mutants/probe` (`0d54280d` + les trois fichiers, `cmp` égaux) ; un mutant à la fois, `<avant>` présent une fois dans le fichier, test du lot seul rejoué, octets remis et sha `9bf54a99…` vérifié après chacun ; `git status` de la sonde : les trois `??` seuls. Passe 1 (06:00:51Z) : 24/26, **E16 et E24 survivants** (aucun test rouge au gel ; aucun hunk de pure suppression) ⇒ cas `red_at_gel` et `old_green` ajoutés. Passe 2 (06:06:15Z) : 26/26. **Passe 3 (06:18:01Z → 06:21:07Z, fichiers finaux) : 26/26 tués** (`RESULTS.json` `966818cf58a725e42c1fa38ae8d884c48fabbc04f0e7fffc8747c96687bde6cd` ; `RESULTS.txt` `20c47bab93fc2573363e5515d9f9603e0f15e9a66612d94ee41261ea509b27fe`, identique à la passe 2).

| Id | Mutant | Tué par |
|---|---|---|
| E1 | lignes killer non exclues de l'attribution | T12, T13 |
| E2 | support : `test/` non reconnu | T12, T13 |
| E3 | test 42 plus sauté | T14 |
| E4 | fichier ajouté reconnu par préfixe | T4, T7, T9 |
| E5 | fichier muté jamais restauré | T1 à T15 (ENOENT, EEXIST) |
| E6 | liens d'espace de travail laissés sur le dépôt source | T1, T5, T6, T7, T9, T12 |
| E7 | une assertion parmi d'autres échecs suffit | T10 |
| E8 | parents `subtestsFailed` comptés | T10 |
| E9 | code 134 ignoré | T10 |
| E10 | signal ignoré | T10 |
| E11 | note « heap limit » ignorée | T10 |
| E12 | `<avant>` multiple accepté | T6 |
| E13 | `<avant>` absent accepté | T6 |
| E14 | population du tirage = toutes les lignes | T7, T11 |
| E15 | exit 0 sans test jugé | T15 |
| E16 | contrôle du gel réduit à « missing » | T2 |
| E17 | chemin du module perdu (export manquant) | T3 |
| E18 | export manquant non lu comme import | T3 |
| E19 | killer lu deux lignes au-dessus | T1, T2, T4, T5, T6, T7, T9, T12, T15 |
| E20 | `NODE_TEST_CONTEXT` hérité | T1 à T7, T9, T10, T12, T15 |
| E21 | clone à l'`autocrlf` de l'hôte (dépend de l'hôte) | T8, T9 |
| E22 | tirage sans mélange | T11 |
| E23 | ligne « inconclusive » lue « refused » | T10 |
| E24 | hunk de pure suppression non attribué | T12, T13 |
| E25 | digest sur les chemins seuls | T8 |
| E26 | tête du worktree non relevée | T12 |

- E21 n'est tué que parce que cet hôte convertit en CRLF : sur un hôte sans conversion, il survivrait (déclaré ; pas d'« équivalent sur cet hôte », DOCTRINE C3) ; item METHODE-M4-LINUX-1.

## 8. Essai sur un lot réel clos (PR-4a-1, `ceeb8cd` → `88f8861`, dépendances et `node_modules` réels)

- 06:12:52Z → 06:13:09Z (17 s), script final (`9bf54a99…`) : `--repo F:/Monark --base ceeb8cd --gel 88f8861` (mode commit) ⇒ **exit 1** : 4 tests jugés (`test/dojo-served.test.ts`), base `import-fail` sur `apps/site/lib/dojo-served-load.ts` (ajouté par le lot : module neuf), gel `pass` 4/4 (liaison et re-pointage réels fonctionnels), verdict **refused — no killer declared** (attendu : la convention n'existait pas). `RED-PROOF.json` `87a1136c…554a`, `base.tap` `a31b90c5…1d66`, `gel.tap` `f4323e7f…b206` ; `digest` `e6b009cc…a8b2e1`, **identique** au passage de 05:49Z (version antérieure du script) : digest reproductible à gel égal. Le test ne dépend pas du fichier de test de ce lot : l'essai vaut pour le script final.

## 9. R-25

- `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (`140be120…d3bf`, inchangé), pathspec de `ci.yml:82` (20 jetons), métrique `ci.yml:90`, base `0d54280d`, sans écriture : **517** (261 + 21 + 235 ; fichiers neufs : insertions = insertions + suppressions, R25-UNIT-1 sans effet). Journal hors pathspec.
- **Sous le STOP 547** : aucune scission M-4b due. **Au-dessus de l'attendu 250-350** de la mission et de l'estimation ADR (160 + ≤ 280 = 440). Motifs mesurables : en-tête de convention fermée (19 l.) ; parse du TAP par blocs de diagnostic et exécution par fichier (les verts n'ont pas de `location`) ; liaison `node_modules` avec re-pointage des espaces de travail (hors estimation C) ; sélection des tests jugés par lignes changées (fichiers M) ; 15 tests = 15 killers, dont 4 ajoutés après la campagne de mutants et la revue de l'advisor (fichier M, E16, E24, contrats d'exit). Marge restante : 30 lignes pour les corrections G2 ; au-delà, scinder les killers (M-4b).

## 10. Oracle

- **Portes statiques hors verrou** (D3 ; mission : verrou pour la suite complète seulement), clone `F:/tmp/methode/m4/oracle-clone` (`--no-local`, `0d54280d`, les trois fichiers copiés, `cmp` égaux ; `mk-nm.ps1 -Tree` : `entries: 220  monark: 10  fail: 0`), script `F:/tmp/methode/m4/oracle/gates.sh` (`662b9b3b…ec69` : huit variables payantes retirées par `env -u`, TEMP et cache npm sur F:, sha du lot avant/après, `node.exe` comptés) : passage **`static-3`** (06:21:14Z → 06:22:01Z, fichiers finaux, 21 `node.exe`) : `gate:vocab` 0, `typecheck` 0, `lint` 0, `lint:ratchet` 0 (**69/69**, plafond inchangé), `lang:gate` 0, `export:check` 0 ; `exits.txt` `81ec9573…d72a`, sha du lot égaux avant et après. Traces : `static-1` (05:47Z) et `static-2` (06:10Z), mêmes résultats sur des états antérieurs.
- **Suite complète et test 42 sous verrou** : §10 bis.

## 11. Review Focus (≤ 5 classes d'entrée non couvertes par les tests)

1. **Rouge tautologique par sous-processus** : un test qui lance un CLI absent de la base échoue par assertion (`status !== 0`) et se lit F2P ; l'outil ne peut pas le distinguer (le test de ce lot importe le script pour y échapper). Seuls le killer et le tirage du G2 le couvrent (item METHODE-M4-SPAWN-TAUTO-1).
2. **Noms de tests à métacaractères** (` — `, parenthèses, `'`) dans `--test-name-pattern` : échappement non exercé par un tirage réel (noms de la fixture nus ; « (test 42) » filtré, jamais lancé par nom) (item METHODE-M4-NAME-PATTERN-1).
3. **Parents à sous-tests** (`subtestsFailed`, 4 fichiers du dépôt) : classés sur TAP synthétique seulement (T10).
4. **Hôte Linux** (CI) : jonction → lien symbolique, forme des chemins dans les notes TAP : non mesuré (item METHODE-M4-LINUX-1).
5. **Lot qui change les dépendances** : `node_modules` pris de `--repo` (installation courante), pas du lockfile du lot : base et gel non hermétiques (item METHODE-M4-DEP-HERMETIC-1).

## 12. MAST (risques résiduels)

- **FM-3.3 test auto-confirmant** : vert à la base ⇒ refus (T2) ; rouge hors assertion ⇒ refus (`other-fail`, T10) ; import sur module existant ⇒ refus (T3) ; nouveau : rouge tautologique par sous-processus (Review Focus 1).
- **Killer trivial** : validation statique « exactement une fois » (T6) ; mutant qui casse le chargement ⇒ `invalid`, jamais `killed` ; **tirage par le G2** à sa propre graine (le G1 ne peut pas la prévoir).
- **FM-1.2 outil qui fermerait un gate** : l'outil rend une preuve et un code de sortie ; il ne committe, n'accepte ni ne ferme rien (R-20).
- **FM-3.2 ciblage incomplet** : l'outil ne lance que les fichiers de test du diff, hors verrou ; la suite complète reste à l'oracle sous verrou.
- **FM-2.6 « vert » lu « juste »** : `ok` ne dit rien des tests non jugés (`unchanged`) ; le G2 lit `tests[]`, `unchanged` et les issues du tirage.

## 13. `error_origin` proposés (assignés au G7)

| Défaut | Trouvé par | `error_origin` proposé |
|---|---|---|
| `NODE_TEST_CONTEXT` hérité : `node --test` imbriqué sans TAP | test du lot (1er passage) | G1 (IMPLÉMENTEUR), corrigé avant livraison |
| clone converti en CRLF par la config de l'hôte | mesure du G1 | OUT (hôte), contourné par `-c core.autocrlf=false` au clone |
| `--no-verify` dans la fixture | crochet de l'hôte | G1 |
| E16, E24 survivants (tests faibles) ; fichiers M non testés ; en-tête du test faux | mutants, advisor, relecture du G1 | G1 (TEST-FAIBLE), corrigés avant livraison |
| clés « nom/fichier » de la mission contre `lang:gate` ; « dans le gel » ; statuts limités à trois | lecture de la mission | ORCH (mission), décisions d-a, d-e, d-j |

## 14. Items formés et questions

**Items (règle Dettes ; propriétaire : orchestrateur)**

| Id | Objet | Déclencheur |
|---|---|---|
| METHODE-M4-G2-WIRE-1 | mission et checklist G2 citent `red-proof.mjs` : rejouer sur le gel commis, `--draw 3 --seed <graine du G2>`, lire `ok`, `tests[]`, `unchanged`, recomputer les sha ; premier consommateur servi (Branchement) | mission G2 de M-4 |
| METHODE-M4-CP2-WIRE-1 | amendement daté du fichier du validateur : le cp-2 rejoue `red-proof.mjs` | avant le cp-2 de M-4 |
| METHODE-M4-SPAWN-TAUTO-1 | rouge tautologique par sous-processus lu F2P : recherche d'une détection (test qui référence un fichier ajouté ⇒ killer vérifié d'office), règle PAROXYSME | G0 de M-6 |
| METHODE-M4-NAME-PATTERN-1 | tirage sur des noms à ` — `, parenthèses, `'` (échappement du motif) | G2 de M-4 (tirage sur un lot réel) |
| METHODE-M4-LINUX-1 | comportement sur Linux (liens, chemins des notes TAP, E21) | premier passage CI du test (fenêtre de fusion, CI-PRIVATE-BILLING-1) |
| METHODE-M4-DEP-HERMETIC-1 | lot qui change le lockfile : installation hermétique par clone (coût mesuré) | premier lot à lockfile modifié |

**Questions**
- **Q-M4-1** : un ancien test modifié (hors ligne killer) est jugé, donc refusé sans killer ou s'il reste vert à la base : règle de la mission appliquée à la lettre. Confirmer (l'adoption de la convention ne rend jugé qu'un test dont le corps change).
- **Q-M4-2** : un export ajouté à un module existant rougit la base par « does not provide an export named » = import sur module existant ⇒ refus : le test doit rougir par assertion (import d'espace de noms + assertion). Confirmer la lecture littérale de M-4.
- **Q-M4-3** : le `digest` couvre tous les changements, journal compris : un journal réécrit après le run change `added` et `digest` au rejeu G2. Exclure `docs/**/*.md` comme le pathspec R-25, ou garder et comparer le code seul ?
- **Q-M4-4** : statuts étendus, exit 1 sans test jugé, killers tirés tous tués exigés (d-e, d-f, d-g) : confirmer.
- **Q-M4-5** : gel exécuté dans un clone reconstruit plutôt qu'en place (d-a) : confirmer.
- **Q-M4-6** : R-25 = 517 (≤ 547, > 440 estimé) : confirmer l'absence de scission ; M-4b (killers) si une correction dépasse la marge de 30.
- **Q-M4-7** : population du tirage = tests admis seulement (d-i) ; ou « 3 killers tirés par G2 » parmi tous les déclarés ?
- **Q-M4-8** : fixture sans `--no-verify` ni surcharge de signature (d-o) : sur un hôte à `hooksPath` ou `gpgsign` global, le test lancerait ces crochets ou signerait. Accepter, ou isoler la configuration git du test (`GIT_CONFIG_GLOBAL` vers un fichier vide) ?
- **Observation** : la ligne 1 de `docs/adr/ADR-METHODE-2.md` porte `claude-opus-5-5[1m]`, conservée et déclarée par C-24 : rien à décider.

## 15. Advisor

- Consulté par l'outil intégré après l'orientation, avant toute écriture : ordre de travail, `ls-files --others` obligatoire (le lot n'existe qu'en non suivis), exécution par fichier, `ERR_ASSERTION` exigé, bloc `#` associé à l'entrée qui suit, OOM par `exitCode` 134, dé-échappement des chemins, exclusion des lignes killer de l'attribution, verdict « new-module » de ce lot à dire tel quel, import d'un export pur par le test, `lint:ratchet` à 69/69, `lang:gate` sur la portée racine, re-pointage des espaces de travail à couvrir par la fixture, zéro test jugé ⇒ exit 1. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation (livrables écrits, preuve n° 1 faite, avant l'oracle sous verrou) : trou porteur des fichiers modifiés (M) — appliqué (T13, `old.test.ts`, helper) ; ordre de clôture (journal avant l'oracle, divergence déclarée, `DELIVERED.sha256` en dernier) ; recette du digest et Q-M4-3 ; R-25 dit en ces termes ; décisions hors mission déclarées (§3) ; Review Focus ; mécanique du killer l.160 ; ménage par `rm-nm.ps1`. Conseil, jamais verdict.

## 16. `git status --short` et ménage

(relevé final : §16 bis)

## 10 bis. Oracle sous verrou d'hôte (écrit après la prise)

- **Divergence déclarée** : le journal testé par l'oracle est l'état `d9b06fe66259c0e18f7e41e3431c4ce3b7eb0263abee576853312cf3d24b1be9` (copié dans le clone ; copie livrée : `oracle/journal-at-oracle.md`) ; le présent fichier n'en diffère que par les sections ajoutées à partir de celle-ci (préfixe identique octet pour octet). Code et test : inchangés depuis l'oracle.
- Scripts `F:/tmp/methode/m4/oracle/` : `locked.sh` (`8fc5fedb…f128` : `mkdir F:/tmp/oracle-lock` atomique, propriétaire « G1 M-4 », attente 60 s jusqu'à 90 min, `rmdir` dans le piège EXIT), `pass.sh` (`e7025bc2…849c` : sha des trois fichiers **et du journal** avant et après, `node.exe` comptés, sept portes `npm run`, huit variables payantes retirées, TEMP et cache npm sur F:), `t42.sh` (`7271a5df…576f`), `run-all.sh` (`1d4d5bf0…22ca` : passage puis test 42, une prise). Clone `F:/tmp/methode/m4/oracle-clone` (`--no-local`, HEAD `0d54280d`, Node v24.15.0), les trois fichiers et le journal copiés (`cmp` égaux) ; `lot-sha-before.txt` = `lot-sha-after.txt`.
- **Prise unique** (`locked-run.log` `a6c354eae4f5d93be9ec463ca1e0ccb69a9b1a117596c0f717c344bc127bf33d`) : lancée 06:24:44Z, attente 480 s (verrou tenu par « G2 M-1 », prise de 06:14:37Z, propriétaire au format JSON avec pid), **verrou pris 06:32:45Z**, **rendu 06:44:04Z** (`rmdir`, piège EXIT ; répertoire absent ensuite, mesuré).
- **Sept portes** (`out-1`, 06:32:45Z → 06:40:30Z ; **15 `node.exe`** au lancement ; `exits.txt` `c89af87c2969e342ef2596a37c43344a0c1dfdc4ade8b2c3fab7f06c1be179f9`) : **7/7 exit 0** : `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet` (**69/69**), `lang:gate`, `export:check`.
- **`test`** (`test.log` `2c406462fa8487eed75ecf3b036454c3b56cdafc55b6b25af102fecf39135657`) : **1 464 tests, 1 461 pass, 0 fail, 0 annulé, 3 skipped**, préexistants (`sentinel_run_releases_chainstack_lock_on_sigterm` sous win32, `sentinel_instrument_out_win32_short_name` sans nom 8.3, `u4b_labels_replay_via_main_real_artifact` sans artefacts), 415,9 s ; les **15 `red_proof_*` ✔** ; `no_secret_in_repo` ✔ ; `site_names_no_kitchen` ✔ ; **test 42 ✔ dans la suite** (`export_public_no_governance_no_french`, 401,7 s).
- **Test 42 à part, même prise** (`t42`, 06:40:30Z → 06:44:04Z ; 15 `node.exe` au lancement ; `test42.log` `d6d6ad435664efaa0a44105ad03e656c196ce4490049afafd4f31e30cce61864`) : exit 0, **2/2 ✔** (213,2 s). Une prise, une passe, jamais relancé.
- C-V-4 : aucune suite complète hors verrou ; hors verrou seulement : le fichier de test du lot, les runs de `red-proof` (fichiers de test du diff seuls, test 42 exclu), les mutants (un fichier de test), `tsc`, `eslint` et les portes statiques.
- **Résidus** : la suite complète a laissé **384 entrées** dans mon TEMP (`t1b-crash-*` 90, `t1b-state-*` 37, `t1b-lbl-*` 32, `bell-*`, `u2c-snap-*`, `atelier-vocab-*` ; 4 529 fichiers, 0 lien) : tests préexistants, aucun `red-proof-*` ; supprimées à 06:44:56Z ; le comptage des résidus est porté par M-3 (C-outillage §(3), « résidus comptés »).

## 16 bis. `git status --short` final et ménage

Relevé à 06:44:37Z (HEAD `0d54280d` inchangé ; `git diff --stat HEAD` vide ; `--ignored` : rien d'autre) :

```
?? docs/G1-lot-methode-m4.md
?? scripts/red-proof.d.mts
?? scripts/red-proof.mjs
?? test/red-proof.test.ts
```

- Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; `git` en lecture seule dans le worktree (`status`, `rev-parse`, `diff`, `log`, `ls-files`, `branch --show-current`) ; le **premier** `git status` (05:11Z) a tourné sans `--no-optional-locks` (rafraîchissement d'index possible, aucun contenu changé), tous les suivants avec, et l'outil pose `GIT_OPTIONAL_LOCKS=0`. `git clone --no-local` seulement sous `F:/tmp/methode/m4/` ; commits uniquement dans les dépôts fixture jetables du test, sous TEMP, sans `--no-verify`.
- Aucun réseau ; rien sur C: (TEMP/TMP/TMPDIR `F:/tmp/methode/m4/tmp`, cache npm `F:/tmp/npm-cache`).
- Ménage : jonctions du clone d'oracle retirées par `rm-nm.ps1 -Tree` (`removed`) **avant** suppression ; `F:/Monark/node_modules` intact (220 entrées, cachées comprises) ; clones `oracle-clone`, `mutants/probe`, `f2p-manual/base` vérifiés sans lien puis supprimés ; mes sondes (`dbg1`, `jprobe*`, `probe1`, `mut`) supprimées après relevé de leurs liens (internes à leurs arbres). Restent sous `F:/tmp/methode/m4/` : `red-proof-own/`, `red-proof-pr4a1/`, TAP manuels, résultats de mutants, scripts et sorties d'oracle, tous copiés dans `F:/tmp/methode/m4-deliver/`.

## 17. Ajouts après l'oracle (texte seul)

- **Q-M4-9** : l'outil suppose `--gel` = **racine** du worktree (`git ls-files --others` rend des chemins relatifs au dossier courant, `git diff` à la racine) : résoudre `--show-toplevel` dans l'outil au prochain tour (une ligne), ou l'écrire dans la mission G2 ?
- **Mesure pour la Review Focus 2** (06:4xZ, `name-meta.mjs` `afbbfed96c780fb850e216c326764f7a1999e10368830f734d973d0d9b85602d`, lecture seule par `git show 0d54280d:<fichier>`) : à `0d54280d`, **514 des 1 440** noms de tests de niveau 0 (170 fichiers) portent au moins un caractère parmi `— ( ) ' . * + ? ^ $ { } | [ ] \` (433 avec ` — `, 403 avec des parenthèses, 62 avec une apostrophe) : le premier tirage d'un G2 sur un lot réel rencontrera probablement l'échappement du motif (METHODE-M4-NAME-PATTERN-1, à mesurer d'emblée).
- **Constat pour le G2** : le `owner.txt` du verrou vu à 06:14Z (« G2 M-1 ») est au format JSON avec pid, mes scripts et les précédents écrivent du texte : le protocole `mkdir` reste compatible, un lecteur de `owner.txt` doit accepter les deux formes (M-3).
- Le `digest` de `RED-PROOF.json` (`b0c7d677…`) est **périmé par construction** : il couvre ce journal à son état de 06:17Z ; la comparaison utile au G2 est celle des trois fichiers de code et de leurs sha (`9bf54a99…`, `a26cb754…`, `ac8193b2…`), égaux dans `lot-sha-after.txt` de l'oracle (Q-M4-3). La preuve n° 1 n'est pas rejouée : le journal a changé depuis, rejouer entrerait dans la boucle de Q-M4-3.
- Livrables : `F:/tmp/methode/m4-deliver/` (`files/` = les quatre fichiers du lot ; `red-proof-own/`, `red-proof-pr4a1/`, `f2p-manual/`, `mutants/` dont `name-meta.mjs`, `oracle/` dont `journal-at-oracle.md`) ; `DELIVERED.sha256` écrit en dernier, hors de lui-même.
