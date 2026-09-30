claude-opus-5-5

# G1 lot Dōjō PR-2b-4 — historique : phase C, reprise, intégration (journal de l'implémenteur)

- **Rôle** : implémenteur G1, instance fraîche, modèle résolu `claude-opus-5-5` (R-1), effort max. Aucun commit, aucun git écrivant,
  aucun réseau, aucune clé réelle, rien sur C: ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`.
- **Mission** : `F:/tmp/dojo/mission-g1-pr2b4.md`, sha256 recalculé à l'ouverture `fbdb0c20725230f1c0c8ca7262f6b85a50ab2460e074b8b4e989c3a30dea980b`
  = reçu `F:/tmp/dojo/mission-g1-pr2b4.recu.json` (verdict vert, lint 12 codes à 0) ; règles `F:/Monark/docs/methode/REGLES-MISSION.md`
  (sha256 `c5a3c674…1f5b`), lues en entier.
- **Arbre** : worktree `F:/Monark-wt-dojo-pr2b4`, branche `lot/dojo-pr2b4`, HEAD = base `5b92681cafe597c79aeceee8a0aab1eb0450d885`,
  `git status --short` vide à 01:23:08Z (`date -u`). Décisions portées : 275, 291 (mission, « Décisions de l orchestrateur »).

## 1. Sources lues avant tout code ([lu], sha256 relevés à 01:50:40Z)

| Source | sha256 | Lecture |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-2B.md` (worktree = tronc, `cmp` égal) | `82c7ad18…f3e6` | 990 l., en entier |
| `F:/Monark/docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` | `6883cea9…d14a` | 220 l., en entier (plis 1a, 1b, 1c, DRAND-1a) |
| `apps/dojo/src/history-collect.ts` (base) | `6bfd79e7…de3f` | en entier |
| `apps/dojo/test/dojo-history-collect.test.ts` (base) | `2e0c6879…0e62` | en entier |
| `apps/dojo/test/helpers/history-chain.ts` (base) | `75be4b01…0cc7` | en entier |
| `apps/dojo/scripts/dojo-verify.mjs` (tronc = worktree) | `d768df16…49cb` | en entier |
| `F:/Monark/docs/CHANTIERS.md` | `a94dede8…0a0d` | l.1889, 1922, 1941, 2108, 2126 (entrées 2026-09-27/29/30) |
| `docs/G1-lot-dojo-pr2b3.md` | `420a83cb…44d4` | l.314-319, 345-378 (QV-2, QW-1, C-V-5) |
| `F:/tmp/cp2-pr2b3/CP2-report.md` | `9d4feb58…04d8` | l.124, 130 (C-V-5 = QC-5) |
| `history-build.ts`, `history-read.ts`, `layout.ts`, `bundle.ts` | `e42db6a8…46e4`, `f9f1463e…8651`, `75abccd6…6f2e`, `03b9a910…f06e` | API lues |
| `apps/dojo/test/helpers/dojo-fixture.ts` | `aa4151bc…7d51` | en entier (aide de PR-1b-1) |
| `F:/Monark/scripts/red-proof.mjs`, `mutants/run.mjs`, `oracle/r25.mjs` | `6579b550…ab36`, `2606e7da…3b19`, `4d0544df…27f0` | en entier |
| `.github/workflows/ci.yml` l.40-100 | `0f401ae2…949a` | pathspec R-25 |

## 2. Compte ascendant AVANT tout code (tâche 1)

Méthode : lignes à écrire, fichier par fichier ; une ligne existante modifiée compte **2** (une suppression, une insertion : c'est ce que
mesure `r25()` de `scripts/oracle/r25.mjs`, `ins + del` hors `docs/**/*.md`). Facteurs de dérive appliqués ensuite, par prudence :
×1,98 (ADR D-14) et ×2,31 (item R25-FACTOR-DRIFT-1, facteur mesuré le plus haut).

| Fichier | Poste | Neuves | Modifiées (×2) | Total |
|---|---|---|---|---|
| `apps/dojo/src/history-collect.ts` | en-tête (phase C, reprise, premier jour lu, bornes anticipées) | 2 | 3 | 8 |
| | imports (`readDayLayout`, `recordBytes`, `firstRead`) | 2 | 1 | 4 |
| | argv fermée : `--phase A|B|C`, `--first-read`, doc | 1 | 6 | 13 |
| | contexte, `setup` (lecture du jour, contrôle de coupe, refus si complet) | 4 | 3 | 10 |
| | journal : entrées (sha B1R, D_LAST), clôture de compte, élagage des pages | 2 | 2 | 6 |
| | `fetcher` (403 = arrêt), `indexOf` (compte, phase C) | 0 | 5 | 10 |
| | `collectBodies` : comptes vus, bornes anticipées, point fixe de phase C | 18 | 6 | 30 |
| | `secretForms` (trois alignements base64) | 1 | 1 | 3 |
| | course : ouverture différée, phase C, D à F, `publish/`, statut `complete` | 9 | 5 | 19 |
| | **sous-total** | | | **103** |
| `apps/dojo/test/helpers/history-chain.ts` | en-tête, imports | 5 | 2 | 9 |
| | `Tx` (sans mint, vérité), monde à options (pas de temps, transfert sans mint, fermeture) | 5 | 5 | 15 |
| | index par compte, exclusion des tx sans mint (index du mint, pages gTFA) | 1 | 2 | 5 |
| | `rowsAt`, `firstReadDay` (écrivain de PR-2 : `readingRecord`, `writeDayBundle`, `closeLayout`) | 11 | 0 | 11 |
| | **sous-total** | | | **40** |
| `apps/dojo/test/dojo-history-collect.test.ts` | en-tête, import, aides `fresh`/`argv`/`stopOf` hors corps | 5 | 4 | 13 |
| | x10 : ligne `--phase C` → `D`, cas `--first-read`, ligne `// killer:` | 1 | 1 | 3 |
| | `dojo_history_per_account_pages_until_fixpoint` | 18 | 0 | 18 |
| | `dojo_history_resume_from_last_complete_unit` | 22 | 0 | 22 |
| | bornes anticipées et 403 (DOJO-HISTORY-EARLY-BOUNDS-1) | 10 | 0 | 10 |
| | alignements base64 et plancher d'URL (KEY-ALIGNMENT-1, QW-1 (a)) | 9 | 0 | 9 |
| | **sous-total** | | | **75** |
| `test/dojo-history-e2e.test.ts` (neuf) | montage, collecte, oracle recodé, paquet, vérificateur, mutations, frappe après SIG0 | 60 | 0 | **60** |
| **Total ascendant** | | | | **278** |

- **Borne de la mission** : 278 ≤ 547 : on continue (aucune coupe pré-déclarée). Projeté ×1,98 = 550 ; ×2,31 = 642 ; STOP mesuré 1 150.
- Budget de l'ADR (D-14) : 240 ascendantes pour « phase C, reprise, intégration ». Écart +38 : les items de déclencheur « G1 de PR-2b-4 »
  nés après l'ADR (CUT-CHECK-1, EARLY-BOUNDS-1, KEY-ALIGNMENT-1, QW-1 (a), §3) et l'écrivain de premier jour lu de la chaîne simulée.
- Hors R-25 : ce journal (`docs/G1-lot-*.md`, exclu par `ci.yml:82`).

## 3. Items de déclencheur « G1 de PR-2b-4 » ou « G7 de PR-2b-4 » : traités ou ré-routés (règle Dettes)

| Item (source) | Décision | Motif |
|---|---|---|
| DOJO-HISTORY-CUT-CHECK-1 (ADR l.968, l.974 Q-4) | **traité** | `--first-read` à toutes les phases ; 1re ligne : sha B1R, D_LAST ; `--cut` = max E_e |
| DOJO-HISTORY-EARLY-BOUNDS-1 (ADR §8) | **traité** (forme en Q-G1-2) | phase C par admission ; phase B par page ; 403 = arrêt de course |
| DOJO-HISTORY-KEY-ALIGNMENT-1 (CHANTIERS l.1889, cp-2 C-V-5) | **traité** | trois alignements : trois courses et assertions, un test |
| QW-1 (a) (CHANTIERS l.1941 ; journal PR-2b-3 l.375) | **traité** | deux courses de phase A, URL de 8 et de 7 caractères |
| DOJO-HISTORY-CHECKS-COMPOSITION-1 (ADR §3, §8 ; G7) | **traité** | frappe après SIG0 ⇒ `partial` en B et en C, dans le test e2e |
| DOJO-HISTORY-JOURNAL-TAIL-1 (ADR §8) | **ré-routé**, Q-G1-4 | point d'entrée servi et « verrou vivant » non fixés par l'ADR |
| DOJO-HISTORY-REASONS-FOLD-1 (ADR l.955) | **ré-routé**, Q-G1-5 | `history-build.ts` hors des sorties déclarées (MISSION-LINT-OUTPUTS-1) |
| DOJO-HISTORY-METHODS-HOME-1 (ADR l.970) | **ré-routé**, Q-G1-5 | `dojo-methods.ts` (PR-2-2, au tronc) hors des sorties déclarées |
| DOJO-HISTORY-ACTE-1 (ADR §8) | ré-routé (acte de l'orchestrateur) | après le G7 de ce lot ; bloqué aussi par RG-SNAPSHOT-NONNEG-INT-1 (ci-dessous) |
| RG-SNAPSHOT-NONNEG-INT-1 (ADR RG, pli G7 1a) | signalé | `reconcile.ts` porte encore `Number.isFinite` (l.124, l.146) : bloque l'acte 1 |
| DOJO-GTFA-TOKENACCOUNTS-1 (ADR §8) | signalé | sonde réseau (déclencheur « avant le G0 de PR-2b-4 ») : acte de l'orchestrateur |

Non déclenchés par ce lot (lus, laissés à leur déclencheur) : ORDERED-HOLE-1, UNORDERED-CIRCUIT-1, NOQUORUM-BLOCKTIME-1, INDEX-DAY-1
(borne relevée au-dessus de 0), CANON-LOCK-1 et THROUGHPUT-1 (avant tout acte), SETTLED-PAGES-1 (test budget non modifié ici),
OUTSIDE-REPO-SEGMENT-1 (DRAND-1b, Bell), BOUNDS-SOURCE-1 (procurement de l'orchestrateur).

## 4. Conception retenue (avant code ; les choix ouverts sont les Q-G1-n du §9)

- **Argv fermée, neuf drapeaux** : `--phase A|B|C` et `--first-read <jour fermé de PR-2>`, lu par `readDayLayout` (lecteur de PR-2,
  C-29), textes par `recordBytes`, fenêtre par `firstRead` (history-build) ; `--cut` ≠ max E_e ⇒ refus `inputs_mismatch` (Q-G1-1).
- **Phase C = une course (acte 2)** : A et B rejoués depuis l'évidence hors ligne avant tout verrou (unité non close ⇒ `phase_order`) ;
  si une borne monotone de (vii) est déjà franchie par B rejouée, la course ne s'ouvre pas (aucun verrou, aucun appel) ; sinon point
  fixe par compte (D-3), puis D et E (`buildHistory`) dans la course, puis F. Refus `phase_order` si `publish/SHA256SUMS` existe.
- **Unité de reprise = compte** (D-11) : ligne de journal de clôture après les pages des deux opérateurs et les nouveaux corps ; à
  l'ouverture, les pages de phase C d'un compte sans clôture sont écartées (relues depuis la première) ; les corps restent servis.
- **Ordre d'écriture** : course, déverrouillage, `run.json`/`checks.json`/`SHA256SUMS` de l'évidence, puis `publish/` par
  `closeHistory` (lien `evidence_sha256sums_sha256`), `SHA256SUMS` en dernier, puis `status.json` `complete`.
- **Chaîne simulée** : le monde par défaut reste identique à l'octet (options en fin de signature, suite `rnd()` inchangée), hors
  les clés invalides corrigées par É-G1-3 (§5).
- **Tests** : aucun corps de test existant n'est modifié, sauf la ligne `--phase C` du test x10 (jugée : ligne `// killer:` au-dessus) ;
  les tests neufs échouent d'abord par assertion à la base (courses enveloppées), aucun import nommé neuf depuis `history-collect.ts`.

## 5. Écarts consignés en cours de passe (aucun n'est corrigé en silence)

- **É-G1-1 (règle du verrou d'hôte)** : le lancement ciblé `node --test apps/dojo/test/dojo-history-collect.test.ts` de 02:22:51Z
  (fin 02:24:16Z, 14/14 verts, `F:/tmp/dojo/pr2b4/runs/collect-5.log`) a eu lieu alors que le verrou `F:/tmp/oracle-lock` était tenu
  par un cp-2 (`owner.txt` : rôle `cp-2`, pid 66844, pris à 02:20:46Z). La commande affichait le propriétaire sans conditionner le
  lancement. Effet possible : concurrence de CPU avec la suite de ce cp-2 (aucune écriture commune : TEMP et racines sous
  `F:/tmp/dojo/pr2b4/`). Parade dès 02:26Z : tout lancement passe par `F:/tmp/dojo/pr2b4/guarded.sh`, qui refuse (sortie 99) si le
  répertoire de verrou existe et contrôle C-V-4. `error_origin` : G1.
- **É-G1-2 (chemins en barres obliques)** : la jonction `node_modules` du clone de base a été créée à 02:25Z par une commande
  PowerShell à chemins en barres inverses (entre apostrophes, donc sans séquence d'échappement ; cible relue :
  `F:/Monark/node_modules`, `typescript/package.json` présent). Les commandes suivantes utilisent des barres obliques. `error_origin` : G1.
- **É-G1-3 (monde par défaut de la chaîne simulée)** : `b58` omettait les octets nuls de tête ; une clé tirée sur 256 environ décodait en
  31 octets (mesure `F:/tmp/dojo/pr2b4/debug-first.ts` : 1 ligne pour 1 060 transactions, 2 pour 2 100 et pour 300 × 2), et le lecteur
  de PR-2 refusait l'énumération du premier jour lu (`enumeration_value`). Corrigé en base58 standard (un « 1 » par octet nul de
  tête) : les signatures sont inchangées (leur bourrage par « 1 » donne les mêmes octets) ; seules ces clés invalides changent ; les
  dix tests existants restent verts. L'engagement « monde par défaut identique à l'octet » du §4 est donc tenu hors de ces clés.
- **É-G1-4 (première ligne des livrables)** : `DELIVERED.sha256` garde le format `sha256sum` pur, vérifiable par `sha256sum -c`
  (précédents `F:/tmp/dojo/pr1a-deliver/`, `F:/tmp/dojo/drand-1a-deliver/`) ; le modèle résolu est en tête de `REPONSE.md` et de ce
  journal. `error_origin` : G1.
- **Fait (non un écart)** : la preuve F2P lancée à 02:30:31Z (garde passée à 02:30:32Z, verrou libre) a tourné jusqu'à 02:34:14Z alors
  qu'un cp-2 a pris le verrou à 02:30:37Z (pid 73892) : concurrence de CPU de 3 min 30 ; résultats F2P et killers inchangés (§8).

## 6. Tâches → fichiers → tests → mutants (sha256 des fichiers livrés au §14)

| Tâche (ADR, item) | Lieu (`history-collect.ts` sauf mention) | Test | Mutants |
|---|---|---|---|
| Phase C, pages par compte jusqu'au point fixe (D-3 l.255-262) | `collectBodies`, `indexOf` ; chaîne : index par compte | T1 | M-Y5, K2 |
| Reprise, unité = compte (D-11) | `openJournal` (ligne de clôture, élagage des pages) | T2 | M-Y24a, M-Y24b, N2 à N5, K3 |
| D à F, `publish/` puis statut `complete` (D-12) | `runHistoryCollect` | T1, T2, T3 | N11, N12, K6 |
| Intégration collecte → vérificateur (§3) | `test/dojo-history-e2e.test.ts` ; chaîne : vérité, `firstReadDay` | T3 | K6 |
| DOJO-HISTORY-CUT-CHECK-1 | argv, `setup`, `openJournal` | x10, T2 | N1, N2, N3, K1 |
| DOJO-HISTORY-EARLY-BOUNDS-1 (et un 403) | `collectBodies`, `fetcher` | T4 | N6, N7, N13, K4 |
| DOJO-HISTORY-KEY-ALIGNMENT-1 | `b64`, `secretForms` | T5 | N10, K5 |
| QW-1 (a) (plancher d'URL, QVN-6 et QVN-7) | aucun code (test seul) | T5 | N8, N9 |
| DOJO-HISTORY-CHECKS-COMPOSITION-1 (assertion) | composition de PR-2b-3, inchangée | T3 (frappe après SIG0) | K6 |

- T1 `dojo_history_per_account_pages_until_fixpoint` ; T2 `dojo_history_resume_from_last_complete_unit` ; T3
  `dojo_history_collect_to_verify_end_to_end` ; T4 `dojo_history_early_bounds_and_a_403_stop_the_course_at_once` ; T5
  `dojo_history_secret_forms_cover_every_alignment_and_the_url_floor` ; x10 `dojo_history_x10_guard_refuses_before_any_lock`.
- K1 à K6 : lignes `// killer:` des six tests jugés (x10, T1, T2, T4, T5, T3), dans cet ordre.
- **Tuyaux (règle Branchement, ADR §3)** : TU-12a (chaîne → évidence) et TU-12b (évidence + premier jour lu → `publish/`) sont composés
  en test par T3 sur la chaîne simulée et le vrai `openGuardedClient` ; TU-12d (fichier d'historique → `dojo-verify`) composé en test par
  T3 via le signataire de fixture ; TU-1h (premier jour lu → collecteur) lu par `readDayLayout`, le jour étant écrit par l'écrivain de
  PR-2 (`firstReadDay`) ; TU-12c (`publish/` → éditeur, PR-3a) **absent**, tuyau formé de l'ADR (déclencheur : G7 de PR-3a) ; aucun
  chemin servi ne consomme la sortie de ce lot : la pièce reste `upcoming`. Aucun registre public n'est touché.

## 7. Tests (tâche 3)

- **Nommés par l'ADR** : `dojo_history_per_account_pages_until_fixpoint` (transfert sans mint absent de l'index et des pages du mint,
  trouvé par les pages de ses comptes et lu chez les deux ; compte fermé et compte découvert paginés, ce dernier après la lecture du
  corps qui le révèle ; comptes du manifeste ; lien d'évidence), `dojo_history_resume_from_last_complete_unit` (arrêt `run_calls` après
  la page de a d'un compte ; première ligne du journal : sha B1R et D_LAST ; réponse brute altérée ⇒ `evidence_corrupt` avec son chemin ;
  autre premier jour lu ⇒ `inputs_mismatch` ; reprise = exactement la suite de référence depuis la première page du compte non clos ;
  identité à l'octet ; phase C refusée sur un historique complet), `dojo_history_collect_to_verify_end_to_end` (sous `test/`).
- **Neufs, pour les items** : `dojo_history_early_bounds_and_a_403_stop_the_course_at_once`,
  `dojo_history_secret_forms_cover_every_alignment_and_the_url_floor`. Test existant modifié : le seul x10 (ligne `--phase C`, deux cas).
- **Courses ciblées** (garde de verrou) : 15/15 (`runs/lot-6.log`, 02:29:20Z → 02:30:03Z) ; `tsc --noEmit` 0 et ESLint 0 sur les quatre
  fichiers (02:30:11Z, 02:30:19Z) ; `lint:ratchet` 69/69 (02:18Z) ; `gate:vocab` et `lang:gate` verts (02:20Z) ; 143/143 sur
  `apps/dojo/test/*.test.ts` et cinq tests racine (02:19:43Z, avant les derniers renforcements des tests). La suite complète fait foi
  par l'oracle (§10).

## 8. F2P (tâche 4)

- Commande (02:30:31Z → 02:34:14Z, garde passée) : `node F:/Monark/scripts/red-proof.mjs --base 5b92681c --gel F:/Monark-wt-dojo-pr2b4
  --repo F:/tmp/dojo/pr2b4/base --out F:/tmp/dojo/pr2b4/f2p --draw 3 --seed 2026` ; `--repo` = clone `--no-local` de `F:/Monark` détaché
  à la base, `node_modules` = une seule jonction vers `F:/Monark/node_modules`.
- `F:/tmp/dojo/pr2b4/f2p/RED-PROOF.json`, sha256 `ac2d5156348f3f34e7c77dc75d1c1796fcf21c57a471aa7e4f1159b736f92c5c` ; `ok: true` ;
  gel `worktree`, tête `5b92681c`, empreinte des changements `9e78fae2…a160` ; 6 jugés, 9 inchangés.
- Les six tests jugés : F2P, rouges à la base par `ERR_ASSERTION`, verts au gel. Killers tirés (graine 2026) : K3 (SDL l.213), K1
  (CONST l.156), K5 (CONST l.128), tous `killed`, fichier restauré au sha256.

## 9. Mutants (tâche 5)

- Commande (02:54:13Z, après la libération du verrou ; `held(F:/tmp)` nul ; C-V-4 : 14 `node.exe`, 18 169 Mo physiques, 36 081 Mo
  virtuels) : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/pr2b4/mrepo --base 5b92681c --out F:/tmp/dojo/pr2b4/mutants
  --table F:/tmp/dojo/pr2b4/mutants-table.mjs --killers --file apps/dojo/src/history-collect.ts --targets
  apps/dojo/test/dojo-history-collect.test.ts,test/dojo-history-e2e.test.ts --lock-root F:/tmp --min-free-mb 4096` ; `mrepo` = clone
  `--no-local` du worktree à `5b92681c` plus les quatre fichiers du lot recopiés (`cmp` égal, aucun commit) ; `node_modules` de `mrepo`
  par `mk-nm.ps1`, celui du dossier de sortie = une jonction vers lui ; résolution de `@monark/rpc-guard` vérifiée avant le lancement.
- `F:/tmp/dojo/pr2b4/mutants/RESULTS.json`, sha256 `d7b0c1feab5b4b250418c669ee61b6a5a13de918776c1a613a4e3219b293506f` ;
  `RESULTS.txt` `c376cb3d…2979` ; outil sha256 `2606e7da…3b19` ; table sha256 `40299801…4a52` ; module initial `0b3eda0c…1820`.
- Base verte (15 tests, 44,8 s). **22 / 22 tués**, tous stricts (`ERR_ASSERTION` seul), sha256 restaurés : de l'ADR M-Y5, M-Y24a,
  M-Y24b ; neufs N1 à N13 (`why` dans la table) ; killers K1 à K6. Aucun survivant, aucun non conclu, aucune ancre perdue ; fin 02:56:21Z.

## 10. Oracle et R-25 (tâche 6)

- Commande : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr2b4 --base 5b92681c --key PR-2b-4` (lancée
  02:37:30Z ; portes statiques hors verrou ; verrou pris à 02:38:54Z après 20 s de file ; fin 02:47:02Z).
- Enregistrement : `F:/tmp/oracle-results/5b92681cafe597c79aeceee8a0aab1eb0450d885-f7561b6eb56cb813-G1-20260930T023730Z-134140.json`,
  sha256 `41ce192fe7cf8195218f5a138c32cafe2c79e50eb6079d8df975e16e3f9b2369` ; `exit` 0, `static_only` false, `served_from` nul (rejoué) ;
  arbre `dirty` `f7561b6e…31eb5`, objet `a19c01ab744f764fa362a8152aed80b268d87e4e`.
- Portes : épinglage des modèles, r25, `lang:gate`, `export:check`, `gate:vocab`, typecheck, lint, `lint:ratchet`, test : toutes à 0.
  Suite : 1 726 tests, 1 723 verts, **0 rouge**, 3 sautés ; test 42 vert dans la suite (454 s) ; les six tests jugés du lot verts ;
  journal de la porte `09-test.log` sha256 `d75920e36688de40551d86298c50d025493642197c9874a416339857350f5322`. C-V-4 de l'oracle :
  14 `node.exe`, 19 114 Mo libres.
- **R-25** (calcul exporté `r25()` de `scripts/oracle/r25.mjs`, dans l'oracle) : `STAT` 411 insertions, 60 suppressions, **471**
  changées (borne `VIBEGATES_PR_LIMIT` 1 205 ; STOP 1 150 non atteint) ; `CONTENT_STAT` 0. Rapport au compte ascendant du §2 :
  471 / 278 = ×1,69 (sous ×1,98 et ×2,31).
- Seul ce journal (`docs/*.md`, hors R-25, hors code) change depuis l'arbre de l'oracle.

## 11. MAST (modes du lot, contre-mesure écrite)

- FM-1.1 (spécification non suivie) : unité de reprise = compte, formes fermées du D-2 en phase C (même `sigsForm`, `txForm`) ;
  tests resume et per_account. FM-1.3 (répétition d'étapes) : la reprise ne rappelle rien de clos (suite de référence exacte).
- FM-1.5 (condition d'arrêt ignorée) : point fixe = plus aucun compte non clos ; pages bornées par `cursor_stalled` (C-G2-1).
- FM-2.2 (clarification non demandée) : neuf questions formées au §13. FM-2.4 (rétention d'information) : l'identité à l'octet
  exclut le lien d'évidence du manifeste, dit en Q-G1-3 et dans le message d'assertion.
- FM-3.1 (terminaison prématurée) : l'arrêt anticipé ne porte que sur les bornes monotones ; `complete` seulement après `publish/`.
- FM-3.2 (vérification incomplète) : F2P, mutants, oracle ; trous comblés avant la campagne (lien d'évidence, X_a).
- FM-3.3 (vérification incorrecte) : oracle de l'e2e recodé depuis les soldes de vérité de la chaîne ; premier jour lu écrit par
  l'écrivain de PR-2 et relu par son lecteur, jamais construit à la main (C-29).

## 12. `error_origin` proposés (à assigner au G7)

- É-G1-1, É-G1-2, É-G1-4 : G1 (cette passe). É-G1-3 : G1 de PR-2b-3 (`b58` de la chaîne simulée), révélé par le premier jour lu.
- Q-G1-3 : G0 (D-3 « rejeu à l'octet » face au lien d'évidence de D-12). Q-G1-6 : G0 (§3 étape 3) et orchestrateur (ligne datée Q-2
  qui porte la borne `noQuorum` à 0 sans pli du §3).

## 13. Questions formées (Q-G1-n, options et recommandation ; l'orchestrateur les soumet à un advisor)

- **Q-G1-1 (refus du premier jour lu)** : un jour illisible, sans lecture à deux énumérations, ou un `--cut` ≠ max E_e refusent
  `inputs_mismatch` (détail `--first-read` ou `--cut`). Options : (a) garder ce code (entrées fixes de D-11, liste fermée inchangée) ;
  (b) deux codes neufs (`first_read_malformed`, `cut_mismatch`) par ligne datée. Recommandé : (a). De même, `phase_order` est réemployé
  pour refuser une phase C sur un historique déjà complet (D-12 « jamais écrasé ») : même question, même recommandation.
  Lecture déclarée de DOJO-HISTORY-KEY-ALIGNMENT-1 (« un test par alignement ») : un seul `test()` porte trois courses et trois
  assertions, un décalage modulo 3 par course et par message ; trois tests nommés sont possibles au prix de six lignes.
- **Q-G1-2 (DOJO-HISTORY-EARLY-BOUNDS-1, granularité)** : phase C, contrôle avant chaque admission (= après la précédente) ; phase B,
  après chaque page ; un 403 arrête toute phase. Motif de la phase B (mesuré) : un contrôle par admission change deux valeurs assertées
  par PR-2b-3 (`noQuorum: 2` du test disque ; `bound_exceeded` devenu `creation_mismatch` quand SIG0 n'est pas encore lu), et ces tests,
  jugés par `red-proof`, échouent à la base sans assertion (argv refusée) : refusés. Coût borné : au plus une page (≤ 100 corps) après
  la première faute. Options : (a) garder ; (b) par admission en B dans un lot qui réécrit ces deux tests. Recommandé : (a).
- **Q-G1-3 (identité à l'octet et lien d'évidence)** : `evidence_sha256sums_sha256` lie le manifeste au `SHA256SUMS` de la course
  finale (horodatages, dépense) ; une course reprise et une course continue ne peuvent le partager. Asserté : fichier d'historique,
  `eve.json` et manifeste hors ce champ, identiques. Options : (a) garder et plier D-3 (« rejeu à l'octet » hors lien) ; (b) lien
  déterministe (empreinte des réponses brutes admises), qui ne nomme plus la course finale ; (c) retirer le lien (D-12, history-build).
  Recommandé : (a) par ligne datée.
- **Q-G1-4 (DOJO-HISTORY-JOURNAL-TAIL-1, ré-routé)** : la forme donnée (troncature au dernier LF, consignée, refus si un verrou est
  vivant) laisse ouverts le point d'entrée servi et le verrou qui dit « vivant » (le journal n'a pas de verrou propre : seuls ceux du
  garde, `<state>/ledger/<cycle>/<op>.lock`, portent un pid). Options : (a) sous-commande fermée `repair-tail --state <dir>` du
  collecteur, calque de `rpc-guard repair-tail` (`.bak` en création exclusive, ligne de réparation, refus si un `.lock` du garde porte un
  pid vivant), ≈ 30 lignes et un test ; (b) réparation automatique à la reprise (rejetée : masque une queue déchirée que le test de
  PR-2b-3 épingle `evidence_corrupt`) ; (c) procédure manuelle du RUNBOOK seule (rejetée : TY-6 exige un chemin servi). Recommandé :
  (a), déclencheur neuf « avant le go de l'acte 1 ».
- **Q-G1-5 (DOJO-HISTORY-REASONS-FOLD-1, DOJO-HISTORY-METHODS-HOME-1, ré-routés)** : `history-build.ts` et `dojo-methods.ts` sont hors
  des sorties déclarées de la mission (MISSION-LINT-OUTPUTS-1). Options : (a) mini-lot de l'orchestrateur (≈ 10 lignes, la liste des
  motifs et la liste de méthodes repliées) ; (b) premier lot qui touche ces fichiers, au plus tard avant le go de l'acte 1.
  Recommandé : (a).
- **Q-G1-6 (fenêtre `null` de l'e2e, limite déclarée ⇒ PAROXYSME)** : §3 étape 3 attend « `null` sur la fenêtre de la transaction sans
  quorum simulée » ; inatteignable de bout en bout tant que la borne `noQuorum` vaut 0 (ligne datée Q-2) : l'e2e asserte l'arrêt
  `partial bound_exceeded`, la fenêtre restant couverte par le test pur de PR-2b-2. Item formé **DOJO-HISTORY-E2E-NULL-WINDOW-1** :
  l'e2e asserte la fenêtre `null` dès qu'une ligne datée relève la borne (même déclencheur que DOJO-HISTORY-INDEX-DAY-1).
- **Q-G1-7 (condition de l'acte portée par le code)** : D-13 fait refuser l'acte si les extensions du mint du premier jour lu diffèrent
  de la création ; le collecteur lit B1R sans ce contrôle (le jour de test s'abstient, `mint_unchecked`). Options : (a) item
  **DOJO-HISTORY-B1R-MINT-CHECK-1** : refus structurel d'un B1R dont `mint_check` n'est pas `ok` (déclencheur : avec
  DOJO-MINT-EXTENSIONS-1, avant le go de l'acte 1) ; (b) précondition de l'acte seule. Recommandé : (a).
- **Q-G1-8 (comptes de la fusion en phase C)** : F ← F ∪ (F_a ∖ R) (une signature lue sous quorum reste lue ; D-3 écrit F ∪ F_a) ;
  X ← X + X_a au pied de la lettre (une signature contestée dans deux comptes compte deux fois : mesuré, 2 dans le test des bornes).
  Options : (a) garder (plus strict, fail-closed) ; (b) X en signatures distinctes. Recommandé : (a).
- **Q-G1-9 (forme de `--first-read`)** : un jour fermé de PR-2 (`publish/SHA256SUMS` relu par `readDayLayout`) ; la première ligne
  épingle le sha256 de ce `SHA256SUMS` (il fixe `day.json`, `eve.json` et les lectures). Option : épingler `day.json`. Recommandé :
  garder `SHA256SUMS` (point d'entrée unique du lecteur).
- **Items proposés (règle PAROXYSME : chaque limite déclarée ci-dessus reçoit sa construction et son prix)** :
  DOJO-HISTORY-E2E-NULL-WINDOW-1 (Q-G1-6 ; ≈ 5 lignes de test ; déclencheur : relèvement de la borne `noQuorum`) ;
  DOJO-HISTORY-EVIDENCE-LINK-1 (Q-G1-3 : un fichier déterministe de l'évidence, la liste triée des sha256 bruts des unités admises,
  que le manifeste lierait en plus du `SHA256SUMS` de course, rendant `publish/` identique à l'octet après reprise ; ≈ 8 lignes de code
  et une assertion ; D-12 à plier ; déclencheur : avant le go de l'acte 2) ; DOJO-HISTORY-EARLY-BOUNDS-B-1 (Q-G1-2 : contrôle par
  admission en phase B, deux tests de PR-2b-3 réécrits ; ≈ 10 lignes ; déclencheur : avant le go de l'acte 1) ;
  DOJO-HISTORY-JOURNAL-TAIL-1 et DOJO-HISTORY-B1R-MINT-CHECK-1 (Q-G1-4, Q-G1-7, prix au texte ; déclencheur : avant le go de l'acte 1).

## 14. Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte | Générateur | Réviseur |
|---|---|---|---|---|---|---|
| 2026-09-30 | G1 PR-2b-4 : code, chaîne, cinq tests, journal | `claude-opus-5-5` | max | mission `fbdb0c20…980b`, REGLES, §1 | worker | orchestrateur, G2 |

- Fichiers livrés (sha256 au §10 après l'oracle ; ceux de 02:35Z : `history-collect.ts` `0b3eda0c…1820`, `history-chain.ts`
  `4a88317d…d39f`, `dojo-history-collect.test.ts` `5905bac2…3f3a`, `dojo-history-e2e.test.ts` `9077aec1…9da0`).
- Hors dépôt : `F:/tmp/dojo/pr2b4/` (`guarded.sh` `3835b3b8…fa87`, `mutants-table.mjs` `40299801…4a52`, `check-killers.mjs`,
  `check-table.mjs`, scripts de diagnostic `debug-*.ts` jamais livrés, `runs/*.log`, clones `base` et `mrepo`, `f2p/`, `mutants/`).
- Git en lecture seule (`status`, `diff`, `rev-parse`, `log`, `worktree list`, `count-objects`, `clone --no-local` vers `F:/tmp`) ;
  aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun commit, aucun réseau, aucune clé réelle, rien écrit sur C:.
- Advisor intégré consulté deux fois : avant le code (approche, pièges F2P, collisions d'EARLY-BOUNDS) ; avant le rendu, livrables
  durables (trois déclarations ajoutées : É-G1-4, cette ligne, la lecture de KEY-ALIGNMENT-1 en Q-G1-1). Conseil, jamais verdict.
- Jonctions `node_modules` (worktree, `mrepo`, clone de base, dossier des mutants) retirées par `rm-nm.ps1` à 02:57:20Z ;
  `F:/Monark/node_modules` relu intact ; `git status --short` du worktree : les trois fichiers modifiés et les deux neufs, rien d'autre.

## 15. Verdict proposé du G1 (l'orchestrateur rend le sien, R-21)

**LIVRE-AVEC-RESERVES** : la ligne PR-2b-4 de l'ADR est livrée (phase C jusqu'au point fixe, reprise par compte, D à F, test
d'intégration), vérifiée par F2P (6 / 6), mutants (22 / 22 stricts) et oracle vert (1 723 / 1 726, 0 rouge, test 42 vert), R-25 471.
Réserves : les neuf questions Q-G1-1 à Q-G1-9 (choix à trancher, dont l'identité à l'octet hors lien d'évidence et la granularité de
l'arrêt anticipé en phase B) ; trois items ré-routés avec motif (JOURNAL-TAIL-1, REASONS-FOLD-1, METHODS-HOME-1) ; cinq items
proposés (§13) ; l'écart É-G1-1 (une course ciblée sous un verrou tenu par un cp-2).

## 16. Corrections post-G2 (correcteur, 2026-09-30)

- **Rôle** : correcteur post-G2, instance fraîche, modèle résolu `claude-opus-5-5` (R-1), effort max ; distinct du générateur G1 et du
  relecteur G2. Mission `F:/tmp/dojo/mission-corr-pr2b4.md`, sha256 recalculé AVANT lecture
  `e7c43633618aaddc47ad6985274c18bf95767abd3f997acbf33303203262fea5` = reçu `mission-corr-pr2b4.recu.json` (verdict vert, 12 codes à 0) ;
  règles `F:/Monark/docs/methode/REGLES-MISSION.md` (`12d5f2df…0335`, 18 l.) lues en entier. Ouverture 05:49:30Z (`date -u`).
- **Entrées lues en entier, dans l'ordre** : rapport G2 `F:/tmp/dojo/g2-pr2b4/G2-report.md` (`ad955bea…de1a`, 329 l.) ; mission G1
  (`fbdb0c20…980b`) ; ce journal (`b11ebe57…a47f`, 297 l.) ; `ADR-DOJO-PR-2B.md` (`82c7ad18…f3e6`, 990 l., tronc = worktree) ;
  `history-collect.ts` (`0b3eda0c…1820`), `history-read.ts` (`f9f1463e…8651`, `checkBounds` l.207-213), les deux fichiers de tests
  (`5905bac2…3f3a`, `9077aec1…9da0`) et la chaîne simulée (`4a88317d…d39f`, hors des sorties déclarées : non modifiée).
- **Arbre** : worktree au gel 1 `30ef4ac4`, `git status --short` vide et `git diff --stat 30ef4ac4` vide à l'ouverture.

### 16.1 Compte ascendant prévu, AVANT tout code (06:07Z)

Règle de coût (celle de `r25()`, `ins + del` hors `docs/**/*.md`) : ligne neuve = 1 ; ligne de la BASE modifiée = 2 ; ligne ajoutée par
le lot (gel 1) modifiée = 0. Lignes de base relevées par `git diff -U0 5b92681c` : `history-collect.ts` l.289-291, l.315, l.316, l.320 ;
test l.21 (import de `bundle.ts`). Les dix tests non jugés du fichier ne sont pas touchés (sinon jugés sans killer).

| Fichier | Poste | Neuves | Base ×2 | Total |
|---|---|---|---|---|
| `history-collect.ts` | C-G2-1 : X = `Set` (l.292 lot), site `extra` (l.315 base), `ma.contested` (l.333 lot), `X.size` (l.346 lot) | 0 | 1 | 2 |
| | C-G2-2 : l.158 (lot) sans `a.phase === "C" &&` | 0 | 0 | 0 |
| | C-G2-3 : (a) une ligne neuve avant la ligne de lecture l.331, gardée à l'octet ; (b) `else X.add(s)` sur l.332 (lot) | 1 | 0 | 1 |
| test collecteur | imports : `writeDayBundle` (l.21 base), `closeLayout`, aides de `dojo-fixture.ts` | 2 | 1 | 4 |
| | G2-8 : écrivain local du premier jour lu à deux emplacements (écrivain de PR-2, C-29) ; x10 : min refusé, max accepté | 14 | 0 | 14 |
| | T1 : corps lus en C = le seul transfert sans mint, chez a et chez b (G2-10) | 1 | 0 | 1 |
| | T2 : A, B et C refusées, `status.json` intact (C-G2-2) ; second arrêt juste après le premier corps de C (G2-11) | 5 | 0 | 5 |
| | T4 : X = 1 et hx lue chez a et chez b (C-G2-1) ; C relancée après une B au-delà d'une borne (G2-7) | 3 | 0 | 3 |
| | test neuf (killer, P8 (b), C-G2-3 (a) et (b), G2-4) | 19 | 0 | 19 |
| `dojo-history-e2e.test.ts` | arbre servi rendu depuis `publish/` (Q-G2-3) ; killer réaligné (ligne du lot) | 1 | 0 | 1 |
| **Total prévu** | | | | **50** |

- Borne : 471 + 50 = 521 ≤ 547 ; solde prévu 26 (≥ 10 : aucune scission, aucune compaction, C-V-6). STOP mesuré 1 150 non concerné.
- Écart au chiffrage de la mission (≈ 10 lignes pour G2-7, G2-8, G2-10, G2-11) : la forme du G2 pour G2-8 (une ligne dans
  `history-chain.ts`) sort des sorties déclarées ; l'écrivain local coûte ≈ 14 lignes (Q-C-1, §16.8).

### 16.2 Tâche → ligne → test → mutant (lignes du fichier corrigé)

| Tâche (décision) | `history-collect.ts` | Test | Mutants |
|---|---|---|---|
| C-G2-1 : X = signatures DISTINCTES (D-4 l.304) | l.292, l.315, l.334, l.347 | T4 (hx : X = 1, lue chez a et b) ; test neuf (P8 (b)) | N13, G2-2, CG-1, CG-1b |
| C-G2-2 : A ou B relancée sur un historique complet refusée `phase_order` | l.158 | T2 (A, B, C refusées ; `status.json` intact) | N4, CG-2 |
| C-G2-3 (a) : s ∈ F ∩ R_a comptée | l.331 (ligne neuve ; lecture l.332 gardée à l'octet) | test neuf, cas (a) (et F jamais lue) | CG-3a, G2-3 |
| C-G2-3 (b) : s ∈ R ∩ F_a comptée | l.333 (`else X.add(s)`) | test neuf, cas (b) | killer du test neuf |
| C-G2-4 / G2-7 : C n'ouvre aucune course après une B rejouée au-delà d'une borne | l.326 | T4 (`run.json.unlocked` = `{}`, 0 appel) | G2-7 |
| C-G2-4 / G2-8 : S_CUT = max E_e | l.155 | x10 (jour lu à deux emplacements, `twoSlots`) | G2-8 |
| C-G2-4 / G2-10 : NOUVEAUX = R_a ∖ (R ∪ F) | l.332 | T1 (corps de C = le seul transfert sans mint, chez a et b) | G2-10 |
| C-G2-4 / G2-11 : un corps de C lu avant l'arrêt est servi à la reprise | l.213 | T2 (second arrêt juste après le premier corps de C) | G2-11 |
| C-G2-4 / G2-4 : F ← F ∪ F_a | l.333 | test neuf, cas z (`failed_excluded` = échecs + 1) | G2-4 (CONST) |
| Q-G2-3 : arbre servi rendu depuis `publish/` | e2e l.88-89 | T3 | killer de T3 (l.433) |

- T1 = `dojo_history_per_account_pages_until_fixpoint`, T2 = `dojo_history_resume_from_last_complete_unit`, T4 =
  `dojo_history_early_bounds_and_a_403_stop_the_course_at_once`, T3 = `dojo_history_collect_to_verify_end_to_end`, x10 =
  `dojo_history_x10_guard_refuses_before_any_lock` ; test neuf = `dojo_history_x_counts_each_signature_once_and_every_index_disagreement`
  (killer `history-collect.ts:333 CONST "else X.add(s)" -> "else void s"`).
- C-G2-1 en détail : l.292 `const X = new Set(m.contested)` (remplace `xc`) ; l.315 `X.add(b.signature)` au site `extra` (ligne de base,
  `extra` gardé pour `gtfa.extra`) ; l.334 `for (const s of ma.contested) X.add(s)` ; l.347 `contested: X.size`. En phase B, X a la même
  taille qu'avant (contestées de la fusion du mint et signatures `extra`, disjointes) : aucun test de PR-2b-3 ne change de valeur.
- Killers réalignés : seul celui de T3 bouge (l.432 → l.433, une ligne insérée à la l.331) ; les six autres visent des lignes
  inchangées. Contrôle `F:/tmp/dojo/pr2b4-corr/check-killers.mjs` (logique de `killerProblem`) : 7 / 7 valides.
- Mesure R-25 en lecture seule après le code (06:11Z, pathspecs de `ci.yml:82`) : 461 + 62 = **523** (prévu 521 ; +2 : écrivain
  local 12 lignes, test neuf 20) ; solde 24.

### 16.3 Courses ciblées, contrôles statiques, rouge au gel 1

- Toutes les courses passent par `F:/tmp/dojo/pr2b4-corr/guard.mjs` (`held()` de `oracle/lock.mjs` sur `F:/tmp`, C-V-4 par
  `Get-CimInstance`, mémoire virtuelle ≥ 8 192 Mo), relue à chaque lancement : verrou tenu par deux G1 d'un autre lot de 05:54Z à
  06:18:53Z, aucune course pendant. Lanceurs `nt.mjs` et `rf.mjs` : noms `DENY` de `red-proof.mjs` retirés de l'environnement (13 noms,
  valeurs jamais lues), TEMP `F:/tmp/dojo/pr2b4-corr/tmp`. Courses sur le clone `F:/tmp/dojo/pr2b4-corr/run` (`--no-local` du worktree
  au gel 1, trois fichiers corrigés recopiés, sha256 égaux), jamais sur le worktree.
- Les deux fichiers de tests (06:18:59Z → 06:19:46Z) : **16 / 16 verts**, 0 rouge (`logs/tests-1.log`, `2e9c425c…aae1`) ; le test
  neuf et les six jugés compris. `tsc --noEmit` (746 fichiers, dont les trois du tour) : 0 ; ESLint sur les trois fichiers : 0 erreur,
  0 avertissement ; `lint:ratchet` 69 / 69 (`logs/ratchet-1.log`, `bf35ba72…fd8`).
- **Rouge au gel 1** (06:21Z) : le fichier de tests corrigé contre le `history-collect.ts` du gel 1 (`0b3eda0c…1820`, clone
  `probe-gel1`) : 12 verts, **3 rouges par `ERR_ASSERTION`**, exactement les trois visés (`logs/gel1-red.log`, `b641f321…c88c`) :
  T2 (A et B acceptées sur l'historique complet, `status.json` réécrit `partial` : C-G2-2) ; T4 (X = 2 : C-G2-1) ; test neuf, cas (a)
  (X = 0 et `complete` : C-G2-3). Les assertions de C-G2-4 y sont vertes : trous de test, prouvés par mutants (§16.5).

### 16.4 F2P (06:22:35Z → 06:23:50Z)

- Commande de la mission : `node F:/Monark/scripts/red-proof.mjs --base 5b92681c --gel F:/Monark-wt-dojo-pr2b4 --repo
  F:/tmp/dojo/pr2b4-corr/base --out F:/tmp/dojo/pr2b4-corr/f2p --draw 3 --seed 2026` ; `--repo` = clone `--no-local` de `F:/Monark`
  détaché à `5b92681c` (ancêtre du tronc vérifié), `node_modules` = UNE jonction vers `F:/Monark/node_modules`.
- `F:/tmp/dojo/pr2b4-corr/f2p/RED-PROOF.json`, sha256 `dd4cbc96fac1a7b733f46c64ab34b0977d1660e44db4ba56b9f85f5438cf989a`, `ok: true` ;
  gel `worktree`, tête `30ef4ac4`, empreinte des changements `3ff68243…3274` ; **7 jugés, 7 F2P** (rouges à la base par assertion, verts
  au gel), 9 inchangés. Killers tirés (graine 2026, population 7) : l.238 (T4), l.213 (T2), l.333 (test neuf) : **3 tués**
  (`assert-fail`), fichier restauré (`11a45354…e7a0` avant et après).

### 16.5 Mutants, par l'outil du tronc (`2606e7da…3b19`)

- Commande commune : `--repo F:/tmp/dojo/pr2b4-corr/run --base 5b92681c --file apps/dojo/src/history-collect.ts --targets
  apps/dojo/test/dojo-history-collect.test.ts,test/dojo-history-e2e.test.ts --lock-root F:/tmp --min-free-mb 4096` ; `<out>/node_modules`
  = jonction vers `run/node_modules` ; garde passée avant chaque campagne, aucune course pendant ; ancres vérifiées avant lancement
  (`check-anchors.mjs` : 33 / 33). Base verte (16 tests) aux deux campagnes ; module initial `11a45354…e7a0`.
- **Campagne 1** (06:24:19Z → 06:26:23Z) : table du G1 ré-ancrée `F:/tmp/dojo/pr2b4-corr/mutants-g1-corr.mjs` (`551aa29a…debc` ; N13
  réécrit : `for (const s of ma.contested) X.add(s);` retiré) plus `--killers` (7). `mutants-g1/RESULTS.json`
  **`6dc0c013a2486d99ea2d47b82ea6d52bc7383f59e6abb3ce27cb09e38f3f5c35`** : **23 / 23 tués, tous stricts**, restaurés ; sortie 0.
- **Campagne 2** (06:26:32Z → 06:29:19Z) : les treize du G2 ré-ancrés plus CG-1, CG-1b, CG-2, CG-3a
  (`mutants-g2-corr.mjs`, `5a7ecf72…fa93` ; G2-4 passé de SDL à CONST sur `F.add(s)`, sa ligne portant aussi C-G2-3 (b)).
  `mutants-g2/RESULTS.json` **`f43e388553a129730b6a62c984b2f1c8083ed1e039e6169818284f156449ee8e`** : **16 / 17 tués, tous stricts** ;
  sortie 1 pour le seul survivant **G2-9** (ordre des comptes de C), rejoué sur les deux fichiers entiers : disposition déclarée par
  renvoi à Q-G2-1 (ordre déclaré libre : acte du G7, hors de ma charge), aucune assertion d'ordre ajoutée.
- **G2-2 (M-Y8 en phase C), mesure demandée** : tué par l'assertion neuve de T4 (« the contested signature is read at a and at b »,
  `mutants-g2/tap/G2-2.tap`) : le décompte X = 1 ne le distinguait plus, comme le G2 l'avait prévu.
- G2-3, G2-4, G2-7, G2-8, G2-10, G2-11 (six des sept survivants du G2) sont tués ; `tool_tree` diffère entre les deux campagnes
  (`7ca7bac0`, `2ba5df8e` : le tronc a avancé entre elles), `tool_sha256` est le même.

### 16.6 Oracle et R-25

- Commande : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-dojo-pr2b4 --base 5b92681c --key PR-2b-4`, lancée en
  arrière-plan à 06:30:38Z (garde passée), jamais interrompue ; verrou pris à 06:31:50Z ; aucune course de ma part pendant sa suite.
- Enregistrement `F:/tmp/oracle-results/30ef4ac49bcb5e5f8abb33af890d7e86e0b8007a-fae2aeea64cb4358-corr-20260930T063038Z-110324.json`,
  sha256 **`c800cd2bc7d4146b6214fae09962e6c71e026f195c1f8e3e80cfad5728d3ac60`** (recalculé égal à la ligne `oracle-result`) ; `exit` 0,
  `static_only` false, `served_from` nul (arbre modifié : rejoué, M-9) ; arbre `dirty` `fae2aeea…710a`, objet `6d98b1e3…6041` ; fin 06:40:17Z.
- Portes 9 / 9 à 0 (épinglage, `r25`, `lang:gate`, `export:check`, `gate:vocab`, typecheck, lint, `lint:ratchet`, test). Suite : **1 727
  tests, 1 724 verts, 0 rouge, 3 sautés** (le G1 : 1 726 ; +1 = le test neuf) ; **test 42 vert dans la suite** (l.1897 de `09-test.log`,
  sha256 `137ad4d2…c1ff`) ; les sept tests jugés verts (l.464, l.473-477, l.1879). C-V-4 de l'oracle : 16 725 Mo libres, 9 `node.exe`.
- **R-25** par le calcul exporté `r25()` de `F:/Monark/scripts/oracle/r25.mjs`, dans la porte `r25` de l'oracle : `STAT` **461 + 62 =
  523** (borne `VIBEGATES_PR_LIMIT` 1 205 ; STOP 1 150 non atteint) ; `CONTENT_STAT` 0 ; égal à la pré-mesure du §16.2. Borne de la
  mission 547 : tenue, solde **24** (≥ 10, C-V-6). Rapport au compte prévu : 523 − 471 = 52 lignes pour 50 prévues.
- Seul ce journal (`docs/*.md`, hors R-25, hors code) change depuis l'arbre de l'oracle (§16.6 à §16.9 écrits après son gel).

### 16.7 MAST (risque résiduel après correction)

- FM-1.1 (spécification non suivie) : X en signatures distinctes (D-4 l.304), mesuré 1 là où les incidences donnaient 2 ou 3 (T4, P8 (b),
  rouge au gel 1). FM-1.5 (condition d'arrêt ignorée) : toute phase refusée sur un historique complet, statut intact (T2, CG-2).
- FM-2.4 (rétention d'information) : les deux intersections du G2 sont comptées (C-G2-3) ; deux classes voisines restent silencieuses,
  MESURÉES par sonde : Q-C-3 (item formé). FM-3.2 (vérification incomplète) : six des sept survivants du G2 tués ; G2-9 déclaré (Q-G2-1).
- FM-3.3 (vérification incorrecte) : l'e2e sert à `dojo-verify` les octets lus dans `publish/` (Q-G2-3), plus ceux de l'oracle recodé ;
  G2-2 est tué par une assertion de lecture, non plus par l'artefact des incidences.

### 16.8 Questions formées (Q-C-n, options et recommandation) et items

- **Q-C-1 (coût de G2-8)** : la forme du G2 (une ligne dans `history-chain.ts`) sortait des sorties déclarées de la mission ; le jour lu
  à deux emplacements est écrit dans le fichier de tests par l'écrivain de PR-2 (`twoSlots`, 12 lignes, C-29 tenu). Options : (a) garder ;
  (b) item **DOJO-HISTORY-FIRSTREAD-TWO-SLOTS-1** : `firstReadDay` reçoit un emplacement optionnel pour b (1 ligne) et `twoSlots` est
  retiré (−12 lignes) ; déclencheur : premier lot qui touche `apps/dojo/test/helpers/history-chain.ts`. Recommandé : (b).
- **Q-C-2 (dénominateur de X)** : X peut compter des signatures hors de R (C-G2-3 (a), F ∩ R_a ; une contestée d'un index de compte qui
  est dans F), alors que `checkBounds` rapporte X à |R| (`history-read.ts` l.211) : plus strict, fail-closed. Options : (a) garder |R| et
  le déclarer par ligne datée ; (b) rapporter X aux signatures distinctes comparées. Recommandé : (a).
- **Q-C-3 (deux classes voisines silencieuses, MESURÉES)** : sonde hors livraison `F:/tmp/dojo/pr2b4-corr/run/apps/dojo/test/
  zz-corr-probe.test.ts` (`e0e2e956…0150`), journal `logs/probe-qc3.log` (`e3167176…0963`, 06:41:08Z), sur le code corrigé : (i) une
  signature de R que les index de ses deux comptes omettent chez les deux opérateurs (omission concordante) : `complete`, X = 0 ; (ii) une
  signature de R listée par les index d'un compte qu'elle ne touche pas (a0 = `6tW6…`, vérifié) : `complete`, X = 0. Aucune perte de corps
  (la signature vient de l'index du mint), mais un index de compte infidèle ne laisse aucune trace. Options : (a) les compter (X ou un
  compteur borné `index_omissions`), ≈ 3 lignes et un test par `sim.override`, avec **DOJO-HISTORY-CROSS-INDEX-1** (même déclencheur :
  avant le go de l'acte 2 ; Q-G2-4 : avant le go de l'acte 1 s'il touche le collecteur) ; (b) les déclarer hors du modèle de menace.
  Recommandé : (a) (règle PAROXYSME).
- **Q-C-4 (information, mesurée)** : cas z du test neuf : un transfert sans mint que les index de compte des deux opérateurs disent en
  échec n'est jamais lu (F ← F ∪ F_a) ; la course s'arrête `enumeration_mismatch` par (ii) : fail-closed, aucun faux historique. Rien à
  trancher.
- **DOJO-HISTORY-CROSS-INDEX-1** garde pour objet la lecture des corps de F ∩ R_a (forme complète), déclencheur avant le go de l'acte 2
  (décision de la mission) ; son inscription au registre est un acte du G7.
- Hors de ma charge (actes du G7, mission) : Q-G2-1, Q-G2-2, Q-G2-4, lignes datées Q-G1-3 (D-3), EVIDENCE-LINK-1, B1R-MINT-CHECK-1,
  EARLY-BOUNDS-B-1. Conséquence de Q-G2-4 constatée : ce tour touche `history-collect.ts`, épinglé par `collector_sha256`.

### 16.9 Écarts, `error_origin`, provenance

- **É-C-1** : R-25 mesuré 523 pour 521 prévus (+2) : écrivain local et test neuf chacun sous-estimés d'une ligne. Borne tenue.
- **É-C-2** : premier lancement de `check-killers.mjs` refusé par Node (import par chemin `F:/…` au lieu d'une URL `file:///`) : erreur de
  mon script, corrigée avant tout résultat ; aucun effet.
- **É-C-3 (déclaré, hors sorties listées mais sous la racine déclarée)** : clone `probe-gel1` (rouge au gel 1) et sonde Q-C-3 dans le clone
  `run`, tous deux sous `F:/tmp/dojo/pr2b4-corr/`, jamais livrés au dépôt.
- **É-C-4 (nommage des sorties)** : la mission déclare `mutants/` ; deux campagnes exigent deux dossiers (un lancement par clone) :
  `mutants-g1/` et `mutants-g2/`, plus `logs/` et les scripts (`guard.mjs`, `nt.mjs`, `rf.mjs`, `check-*.mjs`) sous la même racine. La
  sonde Q-C-3 a été ajoutée au clone `run` APRÈS les deux campagnes : l'état actuel de `run` ne redonne plus leur `dirty` (`13dfea42…7596`,
  mesuré à leur lancement et juste) ; un rejeu doit retirer ce fichier non suivi, ou partir d'un clone neuf.
- `error_origin` proposés (au G7) : C-G2-1 : G0 (D-3 l.264 contre D-4 l.304 ; décision 291) ; C-G2-2 : G1 ; C-G2-3 : G0 (aucun
  désaccord entre fusions défini par D-3, D-4) ; C-G2-4 et Q-G2-3 : G1 (tests) ; Q-C-1 : orchestrateur (sorties déclarées sans la chaîne
  simulée, chiffrage repris de la forme du G2) ; Q-C-3 : G0 (même lacune que C-G2-3) ; É-C-1, É-C-2, É-C-4 : correcteur.
- Git : lecture seule sur le worktree et sur `F:/Monark` (`status`, `diff`, `rev-parse`, `merge-base --is-ancestor`, `clone --no-local`
  depuis eux) ; écritures seulement dans mes clones sous `F:/tmp/dojo/pr2b4-corr/` (clone, `checkout --detach`). **Aucun `GIT_DIR`,
  aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun commit, aucun workflow. Aucun réseau (chaîne simulée, pièges armés) ; aucune clé
  réelle (noms `DENY` retirés de tout enfant) ; rien écrit sur C:. Fichiers du tour écrits par les outils d'édition (aucune séquence barre
  inverse par heredoc) ; commandes Bash toutes sous 6 Ko.
- Advisor intégré consulté après l'orientation, avant tout code (plan, forme à deux boucles, cas « mint et deux comptes », G2-8 hors
  `history-chain.ts`) ; puis avant le rendu. Conseil, jamais verdict.

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte | Générateur | Réviseur |
|---|---|---|---|---|---|---|
| 2026-09-30 | corrections post-G2 : code, tests, §16 | `claude-opus-5-5` | max | mission `e7c43633…fea5`, G2 `ad955bea…` | correcteur | orchestrateur, cp-2 |
