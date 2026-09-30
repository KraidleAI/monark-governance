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
