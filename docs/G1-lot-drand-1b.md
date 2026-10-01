claude-opus-5-5

# G1 — journal du lot DRAND-RELAY-GET-1b (collecteur apte au premier pas réel ; partie 1 de la page)

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré à la session ; préfixe `claude-opus-5-5`). Rôle : G1 (implémenteur),
  instance fraîche, effort `max`. Ne committe pas (R-20), ne lance aucun workflow. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` :
  git en lecture seule dans le worktree et dans `F:/Monark` (`--no-optional-locks` : `status`, `rev-parse`, `branch`, `log`, `diff`).
- **Mission** : `F:/tmp/dojo/mission-impl-drand1b.md` (59 l.), sha256 `78b988857fe8540ad55918b789ee28376903d3d93b63a2a372c497d420c11a58`
  recalculé à 00:00:42Z, égal au champ `sha` du reçu `F:/tmp/dojo/mission-impl-drand1b.recu.json` (verdict `vert`, douze codes à 0,
  `base` `a21a65bf`, `head` `5d6b4eac`). Règles `docs/methode/REGLES-MISSION.md` lues en entier (sha256 `64700025…dd2ba`, celui de la mission).
- **Worktree** : `F:/Monark-wt-drand-1b`, branche `lot/drand-1b`, HEAD `5d6b4eac49a94c07ac23784cc3312aebfa230edb` ; `status --porcelain` vide
  et `diff --stat a21a65bf HEAD` = `docs/G0-lot-drand-1b.md` seul (285 insertions) à 00:00:42Z ; verrou d'hôte `F:/tmp/oracle-lock` absent.
- **Horloge (`date -u`, 2026-10-01)** : 00:00:42Z ouverture, sha256 et reçu ; 00:21:14Z relevé des sha256 ci-dessous ; 00:21:29Z répertoires
  `F:/tmp/dojo/drand1b/tmp` et `F:/tmp/dojo/drand1b-deliver` ; écriture de ce compte avant la première ligne de code.
- **Discipline** : aucun réseau réel, aucun outil de recherche distant, aucune clé réelle, rien sur C: ; TEMP `F:/tmp/dojo/drand1b/tmp` ;
  tests sur clone `--no-local` sous `F:/tmp/dojo/drand1b/` ; jonctions `node_modules` par `mk-nm.ps1`, retirées à la fin.

## 1. Lu (sha256 relevés à 00:21:14Z ; tous égaux à ceux du G0 quand il les cite)

| Entrée | sha256 | Lecture |
|---|---|---|
| `docs/ETAT.md` (58 l.) | `c5cd1451fdfb06e3906f3ce9e7032f6af19ea1f9a9ebda914d894f08bcd5f96c` | en entier |
| `docs/G0-lot-drand-1b.md` (285 l.) | `672b2267a2a28489471885d0c10ae8d16f6715b2a10f9f3479fd04e77434e751` | en entier |
| `apps/dojo/src/collect.ts` (274 l.) | `d257c08c259e16417852fb8d7eb782dcf7c210338dc622dd7f8f656933897352` | en entier |
| `apps/dojo/src/dojo-methods.ts` (29 l.) | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` | en entier |
| `apps/dojo/src/layout.ts` (97 l.) | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` | en entier |
| `apps/dojo/src/bundle.ts` (211 l.) | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` | en entier |
| `apps/dojo/src/reading.ts` (238 l.) | `b5908f852ca29d96c1d312caacfd64d43796fa62aae4e4bff2adc0491ceb01c8` | en entier |
| `apps/dojo/scripts/dojo-seed.mjs` (50 l.) | `6743aae1ccf37b2f9ee99d9bba7b23cc9877f7fa47f949d40e153f85d4aeb38a` | en entier |
| `packages/rpc-guard/src/client.ts` (173 l.) | `ef99818b3c996ceafb978fd8c73be628c73374aaa6f159666e0b1a10a488ba21` | en entier |
| `packages/rpc-guard/src/guarded.ts` (63 l.) | `e506d825fd1767ed79e3618963086194593e66984da106c2f2fdcf7f74ae5ff2` | en entier |
| `packages/rpc-guard/src/transport.ts` (301 l.) | `4ad8e9d9c450fff13cc9246783f9c31ec4d5614c54d2bb6889d6028c8f642ed6` | en entier |
| `packages/rpc-guard/src/ledger.ts` (221 l.) | `0a9699bc3bdf9abdac4df645340bd420acea2b45aa54853245f69279639afac4` | en entier |
| `packages/rpc-guard/src/lock.ts`, `cli.ts`, `errors.ts`, `index.ts` | `6655a9c8…`, `28cb5fb3…`, `8622947f…`, `3e1ae124…` | en entier |
| `packages/rpc-guard/src/tariff.ts`, `repair.ts`, `bell-methods.ts` | `06d2b664…`, `e997c6fd…`, `60a0b2f2…` | en entier |
| `packages/rpc-guard/src/classify.ts`, `reconcile.ts` | `49a08285…`, `d4b86972…` | en-têtes et exports |
| `apps/dojo/test/dojo-collect.test.ts` (509 l.) | `ad9e85561a259d54ee53b2168f87f0b47fe759afdf1976ef0f4050135c4cc602` | en entier |
| `apps/dojo/test/helpers/collect-chain.ts` (100 l.) | `89318fec03ceeda68602e051f3b7bd8e89a0a919fe2a8241ceccf0cff381227f` | en entier |
| `apps/dojo/test/helpers/dojo-fixture.ts` | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` | exports ; l.118-131 |
| `test/dojo-collect-deploy.test.ts` (316 l.) | `04f966e2845eb1db2d5409c7066e966dc7514f9894011979caf27f958e411954` | en entier |
| `packages/rpc-guard/test/drand-labels.test.ts` | `03f8f7c75c9cfb18aa70f0cc6ac634d4075070e040e2ac6ba49e5577f74a8368` | l.1-60 |
| `deploy/monark-dojo-collect.service` (52 l.) | `0144a937bd265de1a8d6eea9934d788480f4b639ec703d1664bf68f348c01ae8` | en entier |
| `docs/RUNBOOK-dojo.md` (315 l.) | `4135e84e158be8a05c6da419b26dd6f849a260ce55cad099876f324272822c04` | l.1-40, l.240-315 |
| `F:/Monark/scripts/red-proof.mjs` | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | l.1-200 (`parseKiller`, `classify`, `verdictOf`) |
| `F:/Monark/scripts/oracle/r25.mjs` | `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` | en entier |

Lus en plus pour le placement : `apps/sentinel/src/run.ts` l.268-350 (calque `release`, l.299-306, l.341-342) et
`apps/sentinel/test/sentinel-chainstack-guard.test.ts` l.290-340 ; `docs/adr/ADR-RPC-GUARD-DRAND-1.md` l.30-100 ;
`docs/adr/ADR-DOJO-PR-3.md` l.214-230, l.270-286 ; `docs/adr/ADR-DOJO-PR-2.md` l.254-258 ; `scripts/dojo-deploy.mjs` l.1-41 ;
`apps/dojo/test/dojo-publish.test.ts` l.185-215 (fermeture d'imports de l'éditeur, qui contient `dojo-methods.ts`) ; `.github/workflows/ci.yml` l.44-100 ;
`F:/Monark/scripts/oracle/run.mjs` l.1-20, l.95-110 ; `eslint.config.mjs`, `tsconfig.json`, `lint-ratchet.json` (plafond 69).
Diff du lot parallèle ENTRY-MAIN-LINK-1 (`lot/page-v1`, lecture `git diff a21a65bf lot/page-v1`) : il réécrit `collect.ts` l.9, l.12 et la
dernière ligne (l.274, plus deux lignes) et `dojo-seed.mjs` l.9, l.11, l.50 ; ce lot garde au moins une ligne inchangée entre ses hunks et les siens.

## 2. Compte ascendant par fichier (estimation AVANT tout code, jamais une mesure)

| Fichier | Détail | Asc. | Plan (G0 §6) |
|---|---|---|---|
| `apps/dojo/src/collect.ts` | en-tête 3 ; imports 2 ; refus 1 ; `RelayGet`, `relays` 5 ; marqueur 2 ; `course()` 17 ; `plan()` 8 ; `main` 3 | ≈ 41 | 34 |
| `apps/dojo/src/dojo-methods.ts` | en-tête 1 ; `DRAND_CYCLE_ATTEMPTS` 3 | ≈ 4 | 4 |
| `deploy/monark-dojo-collect.service` | commentaires : l.34 et enveloppe du pas d'avant 00:15 | ≈ 3 | 2 |
| `apps/dojo/test/helpers/collect-chain.ts` | en-tête 2 ; hôtes drand 1 ; type `override` 1 ; branche GET 4 ; `relays` et son import retirés 9 | ≈ 17 | 14 |
| `apps/dojo/test/dojo-collect.test.ts` | imports, `deps`, `planned`, aides 9 ; T1 ≈ 36 ; T3 5 ; T4 3 ; T2 2 ; T8 ≈ 18 ; killers 7 | ≈ 80 | ≈ 74 |
| `apps/dojo/test/dojo-collect-sigterm.test.ts` (neuf) | T7 : deux enfants, reprise en processus, sous-test du signal réel ; killer 1 | ≈ 45 | 41 |
| `apps/dojo/test/helpers/sigterm-hang.mjs` (neuf) | pièges socket et DNS, `Date.now` figé, `fetch` qui pend, émission, repli 99 | ≈ 15 | 15 |
| `apps/dojo/test/helpers/fs-trace.mjs` (neuf) | liste fermée des écrivains à chemin, enrobage, rebinding, trace | ≈ 15 | 15 |
| `test/dojo-collect-deploy.test.ts` | imports 2 ; T5 sans relais 3 ; T6 3 ; chaîne verrou 8 ; T9 ≈ 14 ; killers 2 | ≈ 32 | ≈ 28 |
| **Total** | | **≈ 252** | **≈ 226** |

Facteurs du G0 : ×2,1 ≈ 529 ; ×2,31 ≈ 582 ; borne 1 150 mesurées ; écart au plan +26, porté par T1 (cas du plan nommés un par un) et T9.

## 3. Décisions de l'orchestrateur appliquées (mission, « Décisions »)

- **Q-1 = (a)** : T7 par `process.emit("SIGTERM")` au premier `fetch` (préchargement `apps/dojo/test/helpers/sigterm-hang.mjs`), non vacant sur
  l'oracle Windows : sans gestionnaire, `process.emit` ne fait rien, le processus vit et sort 99 (repli à 2 s). Variante par vrai signal
  (`child.kill("SIGTERM")`) en sous-test sauté sous win32 avec motif nommé. **Item formé DOJO-SIGTERM-LINUX-PROOF-1** : preuve Linux du
  signal réel ; déclencheur : première fenêtre CI Linux (DE-03) ; propriétaire : orchestrateur ; non bloquant pour A-9 (7).
- **Q-2 = (a)** : aucune ligne de code ; cas `readings/1.json.tmp` ajouté à la boucle des refus de T2 (`layout_stray_file`) ; RUNBOOK §8 :
  résultat de la mesure, procédure inchangée. La partie « deux processus » de DOJO-TMP-STRAY-1 reste routée (G0 §10).
- **Q-3 = (a)** : OUTSIDE-REPO-SEGMENT-1 (partie `collect.ts`) routé, aucune ligne ; l'argv de l'unité reste épinglée et testée
  (`dojo_collect_unit_argv_is_the_tick_contract`, vert, corps inchangé).

## 4. Décision → fichier → test (lignes du gel du worktree)

| Décision (G0) | Fichier : lignes | Test(s) |
|---|---|---|
| TU-B : relais par le garde, cycle `drand-<AAAA-MM-JJ>`, `maxCalls` 2 × `TRIES`, `cycleAttempts` | `collect.ts` l.176-203 ; `dojo-methods.ts` l.14-17 | T1-T5 |
| Une seule voie : `course()` reçoit cycles et bornes, `send` = `g.call` | `collect.ts` l.119-166 ; lecture l.219-220 | tous les tests du collecteur |
| `release` unique, idempotente, chaque opérateur sur SON cycle, avant `runs.jsonl` | `collect.ts` l.134-141, l.160-164 | T1 (grand livre, verrous), T7 |
| « Aucun plan à ce passage » : `catch` autour des appels seuls | `collect.ts` l.188-190 ; ouverture l.130-132 hors `catch` | T1 ; G2 (TB-5) |
| Retraits `RunDeps.relays`, `RelayGet`, `relay_missing` | `collect.ts` l.27-28, l.37-38 ; ancien l.172 | T1, T2, T5 |
| SIGTERM : marqueur, gestionnaire dans `main`, ligne stderr synchrone, sortie 1 | `collect.ts` l.24, l.116-118, l.291-302 | T7 |
| Unité : commentaires seuls (SIGTERM, enveloppe) | `deploy/monark-dojo-collect.service` l.34-37 | T5 (T6) ; tests d'unité verts |
| TMP-STRAY, un processus (mesure, 0 ligne de code) | `layout.ts` lu, inchangé | T8 (épingle) ; T2 (cas de la boucle) |
| SEED-FS-TRACE (test seul) | `apps/dojo/test/helpers/fs-trace.mjs` (neuf) | T9 (épingle, contrôle positif) |
| UNLOCK-CHAIN (test seul, copie de l'arbre) | aucun code | T5 |
| Montage : branche GET par hôte, `override` → `Error` rejetée, `relays` retiré | `apps/dojo/test/helpers/collect-chain.ts` | tous |
| RUNBOOK : en-tête, §8, §9 (hors R-25) | `docs/RUNBOOK-dojo.md` | T5 (chaînes testées du RUNBOOK, vertes) |

Les l.9, l.12, l.13 et les deux dernières lignes de `collect.ts` sont identiques à la base (comparaison octet à octet, 00:3xZ) ; les hunks du lot
laissent au moins une ligne inchangée entre eux et ceux d'ENTRY-MAIN-LINK-1 (`git diff -U0` : -7,0 ; -14 ; -272 ; jamais 8-9, 12-13, 273-274).
La ligne stderr du gestionnaire passe par `writeSync(2, …)` (import séparé l.24 : la l.9 appartient au lot parallèle) : [lu]
`@types/node` 24.13.3 `process.d.ts` l.948-950, `process.exit()` peut perdre une écriture en cours vers `process.stderr`.

## 5. Tests (clone `--no-local` `F:/tmp/dojo/drand1b/clone`, base `5d6b4eac` + état du worktree, TEMP `F:/tmp/dojo/drand1b/tmp`)

- Environnement des tests filtré par la DENY de `red-proof.mjs` (aucune clé ne passe ; noms des variables sensibles de la session relevés,
  valeurs jamais lues) ; verrou d'hôte absent et C-V-4 relevé avant chaque course (mémoire libre ≥ 12 633 Mo, node.exe ≤ 16).
- Final (00:54:08Z-00:55:14Z), `apps/dojo/test/*.test.ts`, `test/dojo-*.test.ts`, `packages/rpc-guard/test/*.test.ts` : **301 tests,
  300 verts, 0 rouge, 1 sauté** (variante du signal réel, motif win32) ; journal `F:/tmp/dojo/drand1b/logs/final-tests-wide.log`
  sha256 `1221484e376408b5b56c6e2292507e8dcac11352a2c7fbc99807da9d09e295db`.
- Racine, sur l'état final (01:07:52Z-01:10:05Z, après les retouches de commentaire de l'unité et du RUNBOOK) : `test/*.test.ts` (67
  fichiers) et `apps/bell/test/bell-keys.test.ts` (épingle des libellés) : **677 tests, 676 verts, 0 rouge, 1 sauté** préexistant
  (`u4b_labels_replay_via_main_real_artifact`, artefacts e2 absents) ; « test 42 » écarté par nom (`--test-skip-pattern`), non exécuté ;
  journal `logs/final-tests-root.log` sha256 `7c8cb4fbe5ce13d7e56723f8a074ff951b1a22358e60d683d623c6a3790eda36`.
- Contrôlés par nom, verts : `error_preamble_carries_no_vocabulary_token`, `dojo_tick_is_idempotent`, `dojo_tick_fills_the_days_it_missed`,
  `dojo_tick_stops_on_a_missing_first_eve_after_the_plan`, `dojo_collect_tree_is_the_import_closure`,
  `dojo_collect_unit_argv_is_the_tick_contract`, `dojo_collect_timer_steps_inside_the_read_window`, `dojo_seed_init_prints_only_the_anchor`,
  les tests de `drand-labels.test.ts`, et les importeurs de `dojo-methods.ts` (`dojo-publish.test.ts` 18/18, `dojo-publish-e2e`, `dojo-served`).
- **Tests jugés** (ligne changée dans le corps ; règle `judgedOf` réimplémentée hors dépôt) : exactement neuf, chacun avec sa ligne
  `// killer:` validée par `parseKiller` du tronc et les contrôles de `killerProblem` (cible de production, `<before>` une seule fois).

| Test | Fichier | Tueur | Base |
|---|---|---|---|
| T1 `dojo_collect_beacon_is_all_day_or_nothing` | `dojo-collect.test.ts` | `collect.ts:189` CONST `return null` → `throw e` (M-D10) | F2P |
| T2 `dojo_collect_to_verify_end_to_end` | idem | `layout.ts:91` COR, `.tmp` ignoré (M-T2) | F2P |
| T3 `dojo_collect_calls_have_the_closed_forms` | idem | `collect.ts:195` CONST, un seul libellé (M-R1) | F2P |
| T3 `dojo_tick_before_0015_fetches_beacon_once` | idem | `collect.ts:195` CONST, `drand-cf` si `drand-pl` a répondu (M-R4) | F2P |
| T4 `dojo_collect_reads_only_inside_the_window` | idem | `collect.ts:191` CONST, cycle = `c.cycle` (M-R2) | F2P |
| T5 `dojo_collect_unit_runs_the_real_tick` (+ T6) | `test/dojo-collect-deploy.test.ts` | `lock.ts:42` SDL (M-U1) | F2P |
| T7 `dojo_collect_releases_locks_on_sigterm` | `dojo-collect-sigterm.test.ts` (neuf) | `collect.ts:297` SDL `process.on(` (M-S1) | F2P |
| T8 `dojo_close_absorbs_an_orphan_tmp` | `dojo-collect.test.ts` | `layout.ts:29` CONST, `.tmp` propre au pid (M-T1) | épingle |
| T9 `dojo_seed_writes_only_its_seed` | `test/dojo-collect-deploy.test.ts` | `dojo-seed.mjs:30` CONST, copie hors du dossier (P5b-i) | épingle |

- Première défaillance à la base (raisonnée, non exécutée) : T1, sa 1re assertion (`DRAND_CYCLE_ATTEMPTS`, lu par `import * as methods`) ;
  T2, T3, T3 (0015), T5 : l'assertion `codeOf(...)` = `none` qui enveloppe le premier appel levant `relay_missing` (T5 : après T6, vrai à la
  base) ; T4 : `planned()` asserte ; T7 : enfant A, `relay_missing` (sortie 1, ni ligne `sigterm` ni grand livre ; lectures défensives).
- T8 écrit le plan à la main (octets de `--plan`, instants recodés) et n'appelle que `--reading` et `--close-day` : vert à la base. T8 et T9
  sont des **épingles** (`<before>` présent à la base : `layout.ts:29`, `dojo-seed.mjs:30` inchangés), à compter à part (`pins`,
  RED-PROOF-PIN-1). Les tests non jugés qui passent par `planned()` rougissent à la base par assertion : non jugés, red-proof les ignore.
- Mesure TMP-STRAY (T8) : une panne entre le `.tmp` et son renommage (lecture, lecture manquée à la clôture, `readings/SHA256SUMS`)
  laisse `<cible>.tmp` ; l'écriture suivante de la même cible l'absorbe ; `readDayLayout` vert, zéro `*.tmp` : pas de STOP (G0 §4.3).
- Trace SEED-FS-TRACE mesurée hors test (00:42Z) : `openSync <graine>` et `openSync <dossier de la graine>` (drapeau `r+` sous win32),
  rien d'autre. Liste fermée : `open`, `writeFile`, `appendFile`, `copyFile`, `cp`, `rename`, `mkdir`, `mkdtemp`, `symlink`, `link`,
  `truncate`, `rm`, `unlink`, `rmdir`, `chmod`, `chown`, `utimes`, `lchown`, `lutimes` (rappel, `Sync`, `promises`), et `createWriteStream`.

Mutants nommés du G0, non exécutés, et le test qui doit les tuer : M-D9 (`collect.ts:138`, cycle de helius pour tous) : T1, T7 enfant A ;
M-D10 : T1 ; M-B3, M-B4, M-B5 : T1 ; M-R1 : T3, T1 ; M-R2 : T4, T1 ; M-R3 (`collect.ts:192`, `cycleAttempts` omis) : T1 ; M-R4 : T3 (0015) ;
M-S1 : T7 ; M-S2 (`collect.ts:293`, sortie sans `release`) : T7 ; « marqueur non effacé » : équivalent (idempotence), sans test ; M-T1 : T8 ;
M-T2 : T2 ; P5b-i : T9 ; M-F1 (`node:fs/promises`) : T9 (contrôle positif) ; M-U1 : T5 ; M-W1 (`transport.ts:83`, troisième libellé) :
T5 (T6 : 360 + 1 210 > 1 500) ; lecture G2 sans mutant : le `catch` hors de l'ouverture (TB-5).

## 6. Portes statiques (clone, 00:55:19Z-00:56:18Z ; journaux sous `F:/tmp/dojo/drand1b/logs/`)

Retouches postérieures (01:0xZ) limitées à des commentaires de l'unité et au RUNBOOK : ni TypeScript ni fichier balayé par `lang:gate`,
`export:check` ou `gate:vocab` (ni `deploy/` ni `docs/`) ; le passage racine de 01:07Z (§5) couvre les tests qui les lisent.

| Porte | Sortie | Journal (sha256) |
|---|---|---|
| `typecheck` (`tsc --noEmit`) | 0 | `final-typecheck.log` vide (`e3b0c442…`) |
| `lint` (`eslint .`) | 0 | `final-lint.log` vide (`e3b0c442…`) |
| `lint:ratchet` | 0, 69/69 (plafond inchangé) | `bf35ba72e61a4472777c999f3b2cc0006b5438a9d00e1439e97be8348bfecfd8` |
| `lang:gate` | 0 | `b7247d5bd76e1ebd46e57d635c015c9924ea1257230820c1da92a117b687270f` |
| `export:check` | 0 | `08affca00532e25c0b10d2007b0fdb786262ae67bd17398dde8cd3c42c839f3f` |
| `gate:vocab` | 0 | `fef5258063438b7344e880e87b986d400c4ad734a7cd41d2bad15468df35d7ef` |

## 7. R-25 (mesure, `r25()` exporté de `F:/Monark/scripts/oracle/r25.mjs`)

Clone jetable `F:/tmp/dojo/drand1b/r25clone` (`--no-local`), état du worktree recopié, **commit de gel dans ce clone seul** (calque de
`scripts/oracle/run.mjs` l.103 ; `4cc673c61176a49a6391fbb505571850b0424244`, arbre `2ae84e0a71df0728b99e65c5ffd7c28465156b4f`), base
`a21a65bf` : **STAT 369 insertions + 69 suppressions = 438** (borne `VIBEGATES_PR_LIMIT` 1 205 ; jugée 1 150 ; solde 712, aucune
scission) ; CONTENT 0 ; GREEN. Sortie `F:/tmp/dojo/drand1b/logs/r25.json`, sha256
`d74dbf5225f432e12d5342789de68731c99e083e4dd86e7b1d4d7372b3db57a2`. Par fichier : `collect.ts` 72, `dojo-methods.ts` 7,
`dojo-collect.test.ts` 155, `dojo-collect-sigterm.test.ts` 72, `collect-chain.ts` 25, `fs-trace.mjs` 27, `sigterm-hang.mjs` 20, unité 5,
`test/dojo-collect-deploy.test.ts` 55. Ascendant 252 (§2), mesure 438 (×1,74 ; plan : 226 × 2,1 ≈ 475). Second gel sur l'état final
(01:10Z, après la retouche du commentaire de l'unité, même nombre de lignes) : `29a2d9fa5718acf174d48121ff43c6bc7bb37336`, arbre
`2aacef09cae37890f31bac6313dc930343873541` : 438 inchangé, même `r25.json` (même sha256).

## 8. Corrections faites en G1 (mesurées, chacune avec sa preuve)

1. `fs-trace.mjs` : récursion infinie mesurée (`logs/tests-lot-1.log`, sha256 `5eb93b0c…`) : sous Node v24.15.0, `appendFileSync`
   rappelle le `writeFileSync` exporté (`node:fs:2496`), que le préchargement enrobe ; le contrôle positif l'a attrapée. Garde de réentrance.
2. `dojo-methods.ts` : un commentaire portant le mot « import » dans un module sans import rougissait la garde de non-vacuité de
   `dojo_publish_imports_no_network_module` (`dojo-publish.test.ts:204` ; `logs/tests-wide-1.log`, sha256 `6030b683…`) : reformulé.
3. `test/dojo-collect-deploy.test.ts` : la variable `un` rougissait `lang:gate` (`[fr-word] un`, l.321 et l.324) : renommée `served`.
4. T7 : l'environnement des enfants héritait de la session, qui porte de vraies clés (noms relevés, valeurs jamais lues) : environnement
   fermé (`PATH`, `SystemRoot`, `TEMP`, `TMP`, `TMPDIR`, clés simulées, horloge figée).
5. Revue de l'advisor (consultation 2) : le RUNBOOK §9 affirmait sans source qu'un arrêt ou un redémarrage de l'hôte laisse les verrous ;
   [lu] FAITS-SYSTEMD-TIMEOUT-1 (`docs/dojo/FAITS-systemd-timer-2026-09-27.md` l.29) : à l'échéance, `TimeoutStartFailureMode=` (défaut
   `terminate`, signal `KillSignal=`), dont la valeur par défaut relève de `systemd.kill(5)`, non lu (L-2). Phrase du §9 et commentaire de
   l'unité qualifiés en conséquence (`KillSignal=`, défaut à confirmer à L-2) ; seuls SIGKILL, OOM et coupure restent affirmés.

## 9. Écarts déclarés

1. **RUNBOOK §9, une ligne de commande de 629 caractères** (`for op in helius solana-foundation drand-pl drand-cf`) : seule ligne créée
   au-delà de 160 ; la convention du RUNBOOK (l.28, « Commands are ONE line each ») impose une commande d'une ligne, et l'appel de l'`unlock`
   servi dépasse seul 160 caractères. Q-G1-1.
2. **Transport Bash** : à 00:3xZ, une spécification hors dépôt (`F:/tmp/dojo/drand1b/spec-t7.json`) écrite par heredoc portait des
   échappements JSON (barres inverses), contre REGLES-MISSION ; contrôlée intacte (JSON valide, 22 barres inverses), supprimée et refaite sans
   barre inverse (`spec-t7.mjs`). Une commande `grep` dont le motif portait deux barres inverses en a reçu une seule (altération mesurée, grep
   a refusé). Une commande `node -e` hors dépôt, sans effet (sortie jetée), en portait aussi. Aucun fichier livré n'en dépend.
3. **Harnais** : un ajout au journal par heredoc de plus de 6 Ko a été refusé au lexage (HARNESS-BASH-8K-1) ; rien n'a été exécuté
   (journal relu : 70 lignes, sha256 inchangé `d3ac1286…`) ; refait par morceaux de moins de 6 Ko.
4. **Outil Edit** pour les fichiers existants : transport des barres inverses vérifié à l'octet sur un fichier jetable
   (`F:/tmp/dojo/drand1b/tmp/edit-probe.txt` : 8 attendues, 8 comptées, aucun octet de contrôle) ; fichiers neufs écrits par heredoc, sans
   barre inverse. Lignes ajoutées aux fichiers existants : 8 barres inverses au total, toutes suivies de la lettre n (fin de ligne dans une
   chaîne JavaScript ; comptage hors dépôt).

## 10. Demandes formées et items (règle Dettes ; PAROXYSME)

- **L-1 (G0 §11, étendue)**, lecture sur place par l'orchestrateur : documentation Node.js v24 (v24.15.0 installée), `process`, « A note on
  process I/O » (écritures de `process.stderr` synchrones ou non sur fichier, tube, terminal ; Linux et Windows), en plus de
  « subprocess.kill » et « Signal events ». Usage : fonder ou alléger le choix de `writeSync(2, …)` ; aujourd'hui [lu] la seule copie
  `@types/node` 24.13.3 (`process.d.ts` l.948-950). Tentative : aucune (réseau interdit par la mission).
- **L-2 (G0 §11)** inchangée (`systemd.kill(5)`, `systemd.timer(5)`).
- **DOJO-SIGTERM-LINUX-PROOF-1** (formé, §3) : sous-test du signal réel exécuté sur une CI Linux.
- Limites déclarées par ce lot, chacune rattachée : SIGKILL, OOM, coupure laissent les verrous → RUNBOOK §9 et T5 (DOJO-UNLOCK-CHAIN-TEST-1,
  clos ici), DRAND-STALE-LOCK-1 routé (procurement Gray et Cheriton, SOSP 1989, DOI 10.1145/74850.74870, inchangé) ; un `unlock` refusé
  dans le gestionnaire (grand livre refusé) laisse le verrou → RPC-GUARD-FIRST-APPEND-HEAD-1 (LC-08) ; deux lectures dans le pas d'avant
  00:15 → DOJO-COLLECT-STEP-COURSES-1 (routé) ; corps de réponse non borné → RPC-GUARD-BODY-TIMEOUT-1 (LC-08) ; `.tmp` de deux processus →
  DOJO-TMP-STRAY-1, partie deux processus (routée, Q-2 (a)).

## 11. Questions fermées pour l'orchestrateur

- **Q-G1-1 — ligne de commande du RUNBOOK §9** : **(a) proposée** : garder la commande d'une ligne (629 caractères) comme exception déclarée
  à « toute ligne créée ≤ 160 » (convention l.28 du RUNBOOK, commande copiée telle quelle sur l'hôte) ; (b) prose « remplacer la liste des
  opérateurs » sans toucher la ligne (risque d'erreur de l'opérateur) ; (c) une seconde commande d'une ligne pour les relais (même dépassement).
- **Q-G1-2 — import séparé de `writeSync` (`collect.ts` l.24)** : **(a) proposée** : garder deux lignes d'import de `node:fs` après
  l'intégration d'ENTRY-MAIN-LINK-1 (aucun conflit, aucun effet) ; (b) les fusionner à l'intégration (une ligne de plus à ce diff).
- **Q-G1-3 — épingles T8 et T9** : l'outil de la base les refuse « green at base » (RED-PROOF-PIN-1) ; **(a) proposée** : l'inspection les
  dérive en épingles avec leurs tueurs (§5) ; (b) les convertir en F2P par un artifice (refusé ici : leur code est inchangé par construction).

## 12. Advisor

- **Consultation 1** (après l'orientation, avant toute écriture) : suivie sur tous les points : adjacence (`DRAND_RELAY_LABELS` et
  `type RunLimits` sur la l.14, `finally` sur la l.272, l.273 intacte, contrôle `git diff -U0`) ; formes de la base (`planned()` asserte,
  import d'espace de noms, lectures défensives de T7, T8 par plan écrit à la main et `--reading`/`--close-day`, cas de T2 en ligne neuve
  après la l.467) ; mécanique de T7 (URL de fichier pour `--import`, émission dans `setImmediate` puis repli, aucun `unref`, noms d'env hors
  DENY, sous-test du signal réel, `stdio: "ignore"`, motif `dojo/collect: SIGTERM`) ; budget des tentatives de T1 et `override` rendant une
  `Error` rejetée (stub non `async`) ; recherche d'une β dont la dernière lecture chevauche minuit ; structure `course`/`release` ; jetons
  interdits ; lignes `// killer:` ; octets et longueurs ; gel R-25 dans un clone jetable seul ; contrôle positif de T9. Écarts : la ligne
  stderr du gestionnaire passe par `writeSync(2, …)` ([lu] `process.d.ts` l.948-950, hors de l'avis) ; l'environnement des enfants de T7
  est fermé (et non seulement privé de `CREDENTIALS_DIRECTORY`) après le relevé des clés réelles de la session.
- **Consultation 2** (livrables écrits, avant la remise) : verdict LIVRE-AVEC-RESERVES et réserve Q-G1-1 (a) confirmés ; tueurs et formes
  de la base relus. Suivie sur les trois demandes : phrase non sourcée du RUNBOOK §9 qualifiée (§8, point 5) ; passage des tests racine qui
  lisent les livrables (§5, 677 tests) ; preuves git horodatées et chemins des scripts de contrôle (§13). Aucun écart.

## 13. État à la remise (relevé 01:10:47Z)

- `git status --porcelain` : ` M` `apps/dojo/src/collect.ts`, `apps/dojo/src/dojo-methods.ts`, `apps/dojo/test/dojo-collect.test.ts`,
  `apps/dojo/test/helpers/collect-chain.ts`, `deploy/monark-dojo-collect.service`, `docs/RUNBOOK-dojo.md`, `test/dojo-collect-deploy.test.ts` ;
  `??` `apps/dojo/test/dojo-collect-sigterm.test.ts`, `apps/dojo/test/helpers/fs-trace.mjs`, `apps/dojo/test/helpers/sigterm-hang.mjs`,
  `docs/G1-lot-drand-1b.md`. Aucun autre fichier touché ; rien committé dans le worktree ni dans `F:/Monark`.
- sha256 : `collect.ts` `209c4870…264b` ; `dojo-methods.ts` `1fd754d1…150b` ; `dojo-collect.test.ts` `6f1340d9…8c3d` ;
  `dojo-collect-sigterm.test.ts` `88134db4…1682` ; `collect-chain.ts` `1a0eb876…78e4` ; `fs-trace.mjs` `f31d7fd1…f74e` ;
  `sigterm-hang.mjs` `4e58349c…faaf` ; unité `1b3aed5c…1aea` ; `RUNBOOK-dojo.md` `d87f481c…4178` ; `test/dojo-collect-deploy.test.ts`
  `92a621c0…b080` (valeurs entières dans `F:/tmp/dojo/drand1b-deliver/DELIVERED.sha256`) ; sha256 de ce journal : rendu hors du fichier.
- Garde d'octets sur les onze fichiers : 0 TAB, 0 CR, 0 octet de contrôle, 0 point de code C1 ; 0 barre inverse dans les quatre fichiers
  créés ; toute ligne créée ou modifiée ≤ 160 points de code, sauf la commande du RUNBOOK §9 (Q-G1-1).
- Jonctions `node_modules` retirées à 00:59:50Z puis, reposées pour le passage racine, à 01:10:15Z (`rm-nm.ps1` : « removed ») ;
  `F:/Monark/node_modules` intact (220 entrées, 11 `@monark`).
- Git à 01:10:47Z : `F:/Monark` sur `lot/etude-suite`, HEAD `c6ccb233` (avancé par l'orchestrateur depuis `a21a65bf`), `status --porcelain`
  vide ; worktree HEAD `5d6b4eac` inchangé, les onze entrées ci-dessus et rien d'autre, aucun stash. Lecture seule dans le worktree et dans
  `F:/Monark` (`--no-optional-locks`) ; écritures seulement dans deux clones jetables : `F:/tmp/dojo/drand1b/clone` (tests, sans jonction)
  et `F:/tmp/dojo/drand1b/r25clone` (gels `4cc673c6` puis `29a2d9fa`) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ;
  aucun réseau, aucune clé réelle, rien sur C:.
- Contrôles rejouables (hors dépôt, `F:/tmp/dojo/drand1b/`) : `guard.mjs` (octets, longueurs), `added.mjs` et `longlines.mjs` (lignes
  ajoutées), `killers.mjs` (lignes `// killer:`), `judged.mjs` (tests jugés), `overlay.mjs` (recopie), `run.mjs` (lanceur filtré par la DENY),
  `r25run.mjs` (R-25), `seedtrace.mjs` (trace de l'outil de graine), `hashcheck.mjs` (empreintes abrégées du §13).
