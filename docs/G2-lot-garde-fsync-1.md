# G2 — lot GARDE-FSYNC-1 (d141413) — relecteur claude-opus-5-5, 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# G2 — relecture indépendante, lot GARDE-FSYNC-1 (`lot/garde-fsync-1` @ `d141413`, base `lot/etude-suite` @ `66f75c2`)

Relecteur : worker G2 à contexte frais, modèle résolu ci-dessus (préfixe `claude-opus-5-5`, R-1), effort max. Aucune écriture dans F:\Monark ni dans un worktree `F:\Monark-wt-*` (lecture seule : `git log/show`, lecture de `docs/`, lecture et copie des sauvegardes de coupure) ; aucun commit (R-20). Tout le travail est sous `F:/tmp/g2-gfsync1/` (rien sur C:, TEMP/TMP redirigés).

**Verdict (détail en fin de rendu) : PASS-AVEC-CORRECTIONS — liste fermée C-G2-1..C-G2-5.** Aucun défaut de code bloquant : l'ordre durable est correct, `repair-tail` ne réécrit jamais un head en avance, tous les refus vérifiés ne changent aucun octet, la composition servie bin → `repair-tail` → `unlock` → `reconcile` fonctionne de bout en bout (rejouée ici). Les corrections portent sur des TESTS manquants (7 mutants survivants non équivalents, dont le tuyau `<op>.repair.jsonl` → `reconcile` jamais composé en test), sur des textes RUNBOOK/ADR inexacts (réparation manuelle invisible de `reconcile`, drapeau « jamais permanent » faux dans un cas, borne numérique de la fenêtre réparée jamais calculée par l'outil sans que le RUNBOOK le dise), et sur un scan structurel contournable.

## Étape 0 — Orientation et entrées lues

- Clone isolé : `git clone --no-hardlinks -b lot/garde-fsync-1 F:/Monark F:/tmp/g2-gfsync1/clone` puis `checkout d141413` ; `git rev-parse HEAD` = `d141413808363d133aca47c9a6a427a20c98c90d` ; parent = `66f75c2` (`git log --oneline -2`).
- `git diff --stat 66f75c2 d141413` : **14 fichiers, 1 111 insertions, 18 suppressions** (conforme à l'attendu 14).
- `npm ci --ignore-scripts` : exit 0 (`npm-ci.log`). Résolution (A-2 équivalent) : `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-gfsync1\clone\packages\rpc-guard\src\index.ts` (idem `import.meta.resolve`). Node v24.15.0, libuv 1.51.0, win32-x64, volume F: NTFS.
- Entrées lues intégralement :
  - `docs/CONSIGNE-STANDARD-G1.md` — version du clone = A-1..A-12 ; la version courante de `lot/etude-suite` porte en plus **A-13** (commit `147d50f`, transport Bash `\\` → `\`) : lue et appliquée. **Mesuré pendant cette revue** : une insertion faite par `node -e` inline a transformé un `\\n` en vrai saut de ligne dans mon harnais (chaîne JS cassée) ; corrigé par l'outil Edit, `node --check` vert — même famille que la récidive fondatrice d'A-13.
  - `docs/CHECKPOINT1-lot-garde-fsync-1.md` : **absent de la branche du lot** (persisté sur `lot/etude-suite` en `266c840`, enfant de la base, non ancêtre de `d141413` : `git merge-base --is-ancestor` négatif) ; lu depuis `F:/Monark/docs/` (sha `14fdea72…` = blob de `lot/etude-suite`). C-1..C-13 lus.
  - `docs/G1-lot-garde-fsync-1.md` (sha `e2d61b98…`) et `docs/PLI-lot-garde-fsync-1.md` du commit (rulings : I-2 accepté avec déclencheur mesuré ; I-10 corrigé, option Y, critère (d) relatif ; D-8 R-25 accepté ; I-6 erratum).
  - `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (Glob : un seul fichier) : C-V-7 (:136), C-V-8 (:140-142), réserve C-G-5/E-1 (:448-456), 1b0-D (:639-651).
  - Amendement ADR PROPOSÉ : **hors commit** (`F:/tmp/gfsync1/ADR-amendement.md`, sha `f3bfa680…`, « insertion par l'orchestrateur SEUL au G7 ») ; lu comme texte proposé pour C-9/C-12/C-13.
  - `docs/course-bell/INCIDENT-powercut-2026-09-22.md` version courante (`663f974`, erratum I-6 §5 : `helius.head` = 64 octets NUL).
  - `docs/RUNBOOK-rpc-guard.md` (commit, 120 lignes) ; `packages/rpc-guard/src/client.ts:95-140` (ordre write-ahead).
  - Template `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\templates\checklist-revue-G2.md` (étape 4-bis).

## Étape 1 — Oracle 7 gates (A-3, A-7, A-12)

Commande : `bash F:/tmp/g2-gfsync1/oracle.sh g2base` ; chaque gate lancé par `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY npm run <gate> > log 2>&1; echo "<gate> exit=$?"` (code capturé directement, jamais après un pipe) ; TEMP/TMP/TMPDIR = `F:/tmp/g2-gfsync1/os-tmp`.
En-tête (A-12, `oracle/g2base-header.log`) : `tree HEAD=d141413808363d133aca47c9a6a427a20c98c90d dirty_files=0 node=v24.15.0 platform=win32-x64 date_u=2026-09-23T01:40:08Z` ; fin 01:43:16Z, `dirty_files_after=0`.

| Gate | exit | Sortie mesurée |
|---|---|---|
| `gate:vocab` | 0 | « scanned 223 file(s), no forbidden claim » |
| `typecheck` | 0 | `tsc --noEmit` sans diagnostic |
| `test` | 0 | **tests 950 / pass 948 / fail 0 / skipped 2** ; `duration_ms` 139 826 (machine partagée) |
| `lint` | 0 | `eslint .` sans diagnostic |
| `lint:ratchet` | 0 | 69/69 |
| `lang:gate` | 0 | « 0 non-exempt French hit(s) » |
| `export:check` | 0 | « 0 forbidden path, 0 non-exempt French hit » |

- Skips (2, pré-existants, nommés — ceux de D-5 du G1) : `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) ; `u4b_labels_replay_via_main_real_artifact` (artefacts e2 gitignorés absents d'un clone).
- Les 17 tests du lot sont exécutés et verts (lignes 612, 815-821, 875-883 de `oracle/g2base-test.log`) : 7 `durable_*`, 8 `repair_tail_*` + `reconcile_reads_the_repair_journal_per_window`, 1 `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`. 933 (base mesurée directement, étape 1-bis) + 17 = 950 : cohérent.
- Test 42 `export_public_no_governance_no_french` (CI du miroir imbriquée, option Y : `no-fsync.ts` exporté avec son importeur) : vert, 118 293,9 ms sous charge.
- sha256 (préfixes) des journaux : exits `6b98978a`, test `5e2465c9`, header `9fc923bf`.
- Critère (d) relatif du ruling I-10 : paires ABBA base/lot mesurées ci-dessous (étape 1-bis).

## Étape 1-bis — Critère (d) RELATIF (ruling I-10) — paires ABBA

Base mesurée sur un second clone isolé `F:/tmp/g2-gfsync1/base-clone` @ `66f75c2c4907f92f272fdbe7c28aa6bc417f36f8` (`git clone --no-hardlinks` + `npm ci --ignore-scripts` exit 0, `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-gfsync1\base-clone\packages\rpc-guard\src\index.ts`). Script `F:/tmp/g2-gfsync1/pairs.sh` (sha `b22944a5…`) : `npm test` sous `env -u` des 8 clés, ordre ABBA base → lot → lot → base, `dirty=0` avant chaque exécution (`pairs/pairs.log`, sha `0872b183…`).

| Exécution | Arbre | Fenêtre UTC | exit | tests / pass / fail / skip | `duration_ms` |
|---|---|---|---|---|---|
| run1 | base `66f75c2` | 01:56:25-01:57:24 | 0 | 933 / 931 / 0 / 2 | 57 878 |
| run2 | lot `d141413` | 01:57:24-01:58:56 | 0 | 950 / 948 / 0 / 2 | 90 874 |
| run3 | lot `d141413` | 01:58:56-02:00:31 | 0 | 950 / 948 / 0 / 2 | 93 606 |
| run4 | base `66f75c2` | 02:00:32-02:01:45 | 0 | 933 / 931 / 0 / 2 | 68 133 |

Ratios (calculés par `node -e` sur les journaux) : paire A (run2/run1) **×1,570** ; paire B (run3/run4) **×1,374** ; moyennes ABBA base 63 006 ms, lot 92 240 ms, **×1,464**. **(d) relatif TENU (≤ ×2)**, cohérent avec les paires du pli (×1,37 et ×1,83).
- Base mesurée directement : **933 / 931 / 0 / 2** ⇒ le lot ajoute exactement 17 tests (950 − 933), tous verts.
- Déclaration de charge (machine partagée, non contrôlée) : deux actes du relecteur ont chevauché les paires — la mesure d'isolation du lanceur de tests (2 fichiers triviaux, < 1 s, pendant run3 = côté lot, sens conservateur) et le rejeu RUNBOOK (un écrivain enfant + 2 exécutions du bin, pendant run4 = côté base, sens défavorable) ; sensibilité calculée : run4 amputé de 3 000 ms ⇒ paire B ×1,437, toujours ≤ ×2. Autres actes pendant les paires : lectures/écritures de fichiers texte et `sha256sum` de petits journaux (négligeables). Charge des autres agents de la machine : non contrôlée, non mesurée.
- Journaux : `pairs/run1-base.log` `746205f3…`, `run2-lot.log` `4b085328…`, `run3-lot.log` `66887b8e…`, `run4-base.log` `fc63d369…`.

## Étape 2 — Contrôle des rendus G1/PLI contre les pièces (R-21)

| Affirmation du rendu | Vérifiée par | Résultat |
|---|---|---|
| 14 fichiers au diff ; `export-exclude-tests.json` restauré (option Y) | `git diff --stat` | 14 fichiers ; `scripts/export-exclude-tests.json` absent du diff : CONFORME |
| `index.ts` et `client.ts` (`Outcome`) inchangés (C-7) | `git diff --stat` | absents du diff : CONFORME |
| sha livrés `ledger.ts 625c759f` `repair.ts e997c6fd` `reconcile.ts e42de49c` `cli.ts dccbe95f` `lock.ts 6655a9c8` | pré-sha de mon harnais (`mutants-g2-run1.log`) | identiques : CONFORME |
| R-25 final 695 | étape 3 | 695 : CONFORME |
| 7/7 gates, 950/948/0/2 | étape 1 | CONFORME |
| Rejeu réel : coupure n°1 et n°2 `helius` ⇒ `REFUSED tail_truncation`, `solana-foundation` ⇒ `REFUSED no_nul_tail`, fichiers inchangés (G1 §7.4) | rejeu indépendant par le BIN sur copies (`replay.log`, sha `3a93361e…`) ; `sha256sum -c SHA256SUMS.txt` 6/6 et 7/7 OK sur les sources | cut1 `helius` : 211 008 NUL, `REFUSED tail_truncation` exit 1 ; cut2 `helius` : 13 776 NUL, `REFUSED tail_truncation` exit 1 ; `solana-foundation` : 0 NUL, `REFUSED no_nul_tail` ×2 ; digest des deux dossiers AVANT == APRÈS : CONFORME |
| Sonde win32 P1 : fsync de répertoire `"r"` ⇒ EPERM, `"r+"` ⇒ OK | `scratch/probe-win32.mjs` (`probe-win32.log`, sha `c150a25c…`) | `fsync EPERM` / `fsync OK` : CONFORME |
| Sonde P5 : `writeFileSync` UTF-8 = chemin rapide sans `flush` | source de la fonction du binaire exécuté | `binding.writeFileUtf8(path, data, stringToFlags(flag), parseFileMode(options.mode, 'mode', 0o666))` — aucun argument `flush` : CONFORME |
| « Garde redondante déclarée : aucune » (G1 §6) | mutants N6, N16, N6+N16 (étape 5) | INEXACT : la paire « heal explicite `repair.ts:64` + réouverture de contrôle `repair.ts:65` » est redondante (N16 équivalent, N6 quasi-équivalent, N6+N16 tué) ⇒ C-G2-5 |
| ADR D-FS-6 : scan structurel de `packages/rpc-guard/src`, `apps/sentinel/src`, `apps/bell/src` ; mutants P1/P2/P5/H1 | `durable.test.ts:201` | le test scanne AUSSI `apps/harness/src` et `scripts` et le mutant P3 existe (pli2) : texte ADR en retard ⇒ C-G2-5 |
| ADR tuyaux : `<op>.repair.jsonl` prouvé par `reconcile_reads_the_repair_journal_per_window` | `repair-tail.test.ts:220-235` | le test FABRIQUE le journal (`{lines_after: 2}`), jamais produit par `repair-tail` : pas une composition ⇒ C-G2-1 |

## Étape 3 — R-25 (A-5) et invariants (A-6)

Pathspec extrait VERBATIM de `.github/workflows/ci.yml:65` par `sed -E "s/.*HEAD\" -- (.*)\) \|\| \{.*/\1/"` (15 éléments imprimés : `.` + 14 exclusions dont `':(exclude,glob)docs/**/*.md'`).
`git diff --numstat 66f75c2 d141413 -- <pathspec>` (`r25-numstat.txt`) :

| Fichier | + | − |
|---|---|---|
| apps/sentinel/test/ukemi-guard-record.test.ts | 10 | 0 |
| packages/rpc-guard/bin/rpc-guard.mjs | 2 | 1 |
| packages/rpc-guard/src/cli.ts | 3 | 0 |
| packages/rpc-guard/src/ledger.ts | 69 | 7 |
| packages/rpc-guard/src/lock.ts | 5 | 4 |
| packages/rpc-guard/src/reconcile.ts | 22 | 3 |
| packages/rpc-guard/src/repair.ts | 75 | 0 |
| packages/rpc-guard/test/durable.test.ts | 214 | 0 |
| packages/rpc-guard/test/harness.ts | 27 | 3 |
| packages/rpc-guard/test/no-fsync.ts | 15 | 0 |
| packages/rpc-guard/test/repair-tail.test.ts | 235 | 0 |

**R-25 = 677 + 18 = 695** (11 fichiers ; `--shortstat` en forme trois-points `66f75c2...d141413` : identique). Sous le seuil 1 150 et la borne CI 1 205. Docs exclus par le pathspec (RUNBOOK, G1, PLI non comptés). Marge pour le pli des corrections : 455 lignes.
**A-6 (9 gelés)** : `git show <rev>:<f> | tr -d '\r' | sha256sum` à `66f75c2` et `d141413` : 9/9 SAME (`2f9a31f6` `a5e66cd3` `5733daeb` `7bee76fc` `3376eb08` `9206df91` `0e232519` `3603265d` `cb020425` = table ADR-U4b :394-402) ; aucun des 14 fichiers du diff n'est gelé.

## Étape 4 — Revue 3 étapes (AgileCoder) sur le diff complet

### 4(a) — Exigences C-1..C-13 (checkpoint-1, prime) ↔ code

| # | Exigence | Code (d141413) | Preuve G2 | État |
|---|---|---|---|---|
| C-1 | jamais réécrire un head en avance | `repair.ts:52-55` : `none` / `heal_penultimate` / sinon `REFUSED tail_truncation` ; aucun autre chemin d'écriture du head | E3b (head deux entrées en arrière + NUL ⇒ refus, 0 octet) ; rejeu réel cut1/cut2 ⇒ `tail_truncation`, 0 octet | CONFORME |
| C-2 | refus 0 NUL / queue non-NUL / pid vivant ; verrou absent déclaré | `repair.ts:46` `no_nul_tail`, `:47` `torn_tail`, `:49` `malformed_line`, `:36-42` `lock_unreadable`/`writer_alive` (`pidAlive` `:22-24`, ESRCH seul = mort), `:58`/`:73` verrou pris puis rendu | E4a (ligne JSON complète sans son `\n` + NUL ⇒ `torn_tail`) ; E1c ; mutant N7 tué | CONFORME (bord N5 non testé ⇒ C-G2-2(b)) |
| C-3 | `.bak` créés par l'outil, `wx`, jamais écrasés ; record fermé | `:56-57` `bak_exists`, `:60-61` `writeDurable(..., "wx", ...)` AVANT troncature, `:66-72` 13 clés | E1e/E1f (2ᵉ coupure ⇒ `bak_exists`, procédure RUNBOOK ⇒ REPAIRED) ; N8 tué ; E2c (record après heal cohérent) | CONFORME (record du cas heal non asserté ⇒ C-G2-2(a), N4) |
| C-4 | heal durable ; orphelin `.tmp` toléré/nettoyé | `ledger.ts:178` `replaceDurable` ; `:188` unlink APRÈS vérification | E2a (head 1 en arrière + orphelin au NOUVEAU contenu ⇒ `unlock` soigne, 0 orphelin) ; N18 tué | CONFORME |
| C-5 | head absent : décision explicite | refus maintenu `ledger.ts:160`, `repair.ts:34` | tests G1 (R6) | CONFORME |
| C-6 | `/malformed/` avant réparation | `parseEntries` `ledger.ts:122-129` | N10 (parse tolérant aux NUL) tué par le test de composition | CONFORME |
| C-7 | journal de SÉQUENCE, mutants d'ordre ; aucun export/Outcome nouveau | `harness.ts journal()` ; `index.ts`/`client.ts` hors diff | N12, N19 tués | CONFORME |
| C-8 | composition depuis un écrivain réel ; bin expose `repair-tail` | `repair-tail.test.ts:41-98` (écrivain = processus enfant) ; `cli.ts:45` ; bin `:3` | E1a-f par le BIN ; N14 tué | CONFORME (D-4 : `LockHeldError` au lieu de `/malformed/` pour `openGuardedClient`, justifié `guarded.ts:43`) |
| C-9 | consommateur de `<op>.repair.jsonl` | `reconcile.ts:48-55`, appel `:74` avant toute borne | E5a/E5b/E5c, E6, E10 : CODE correct (les deux modes, frontière `>=`) | CODE CONFORME ; TEST non composé ⇒ C-G2-1 ; textes ⇒ C-G2-3 |
| C-10 | coût mesuré, seuil déclaré | G1 §7.2, ruling I-2 | non re-mesuré (hors G2) ; ruling appliqué dans l'ADR proposé | CONFORME (ruling) |
| C-11 | résidu win32 mesuré | RUNBOOK §2 | P1 et P5 re-vérifiés (étape 2) | CONFORME |
| C-12 | amendement ADR (modèle de faute, tuyaux, périmètre, C-V-8) | proposé hors commit | lu ; retards de texte ⇒ C-G2-5 | CONFORME sous C-G2-5 |
| C-13 | MAST nommés | ADR proposé « Modes MAST contrés » | 4 modes + contre-mesures | CONFORME |

Rulings du pli : option Y (support exporté avec son importeur, liste d'exclusion inchangée) — CONFORME ; (d) relatif — étape 1-bis ; I-6 — erratum présent dans l'INCIDENT §5 courant ; D-8 — 695 < 1 150.

### 4(b) — Défauts (durabilité réelle)

Expériences E1-E10 : `F:/tmp/g2-gfsync1/scratch/exp.mjs` (sha `29db95d1…`), journal `exp-run1.log` (sha `836d59d6…` ; en-tête A-12 : clone `d141413`, `dirty_files=0`, node v24.15.0, 01:52:45Z, sha des 6 fichiers de code = sha livrés) ; écrivains = vrais processus enfants (`openGuardedClient` + `call`, fetch bouchonné dans l'enfant, clé factice, hôte `.invalid`) ; sous-commandes par le BIN (`spawnSync`) sauf E7 ; 8 clés retirées ; **21/21 conformes** ; dossier d'expérience supprimé en fin d'exécution. E11 : point 12.

1. **fsync du fichier** : oui, chaque écriture passe par `writeDurable` (open → write en boucle → fsync → close, `ledger.ts:56-59`) ; la voie de production appelle le VRAI `node:fs` `fsyncSync` (test (c), 5 flush exacts ; mon N19 « seule la ligne est flushée » rougit ce test : sans fsync ⇒ rouge, prouvé).
2. **fsync du répertoire** : NON (ni après le rename du head, ni après la création du `.jsonl`, du verrou, des `.bak`, du journal de réparation). Résidu DÉCLARÉ (RUNBOOK §1, ADR I-1) et ACCEPTÉ par ruling (déclencheur : avant le 2ᵉ redéploiement VPS). Conséquence fail-closed vérifiée : head deux entrées en arrière ⇒ `tail_truncation` (E3a/E3b), jamais une acceptation silencieuse.
3. **Ordre write → fsync → rename** : `replaceDurable` (`:71-82`) écrit `<op>.head.tmp` durablement PUIS renomme ; la ligne est durable AVANT le head (`:198-200`). Tests de séquence ; mutants d'ordre G1 + N18/N19 tués.
4. **Coupure entre l'append du `.jsonl` et l'écriture du `.head`** : état réaliste (ligne durable, `head.tmp` fsyncé au NOUVEAU contenu, rename perdu) reproduit en E2a : l'ouverture par `unlock` soigne le head (heal une entrée), écrase puis renomme le `.tmp`, aucun orphelin, 4 lignes exactes ; avec en plus une queue NUL (E2b) : `repair-tail` ⇒ `heal_penultimate`, head = dernière entrée durable, 0 orphelin ; record cohérent (E2c).
5. **`repair-tail` idempotent** : oui — la 2ᵉ exécution ⇒ `REFUSED no_nul_tail`, instantané sha du dossier identique (E1c). Une 2ᵉ COUPURE ⇒ `REFUSED bak_exists` tant que les `.bak` de la 1ʳᵉ réparation sont là (E1e, voulu par C-3), procédure RUNBOOK « déplacer les deux `.bak` » ⇒ REPAIRED (E1f).
6. **Jamais au-delà d'une entrée valide** : la troncature s'arrête au dernier octet non-NUL, qui doit être `\n` (`:45-47`) ; préfixe durable byte-identique (E1b) ; N9 (`end - 1`) tué ; ligne JSON complète privée de son `\n` ⇒ refus (E4a), et E4b montre pourquoi : accepter cet état (mutant N5) colle l'`unlocked` suivant sur la ligne non terminée et le ledger ne s'ouvre plus (`malformed`).
7. **`reconcile` sans double compte** : `ledger_run` est recalculé depuis la chaîne (une réparation ne retire que des NUL et le heal n'ajoute aucune entrée) ; le drapeau est un booléen par fenêtre (E5a NO-GO puis E5b GO ; 2ᵉ réparation signalée dans SA fenêtre, `lines_after` = [3, 8], E5c). Frontière `lines_after == début de fenêtre` avec sortie réelle : signalée (E10).
8. **Verrou sur coupure** : jamais libéré automatiquement (C-9, voulu) ; `repair-tail` le laisse si le pid est mort ; `unlock` servi le libère avec une ligne chaînée (E1d). Seul `cli unlock` ouvre le ledger SANS verrou (`git grep openOperatorLedger(` : `cli.ts:41`) ; l'effacement d'orphelin `ledger.ts:188` pourrait alors retirer le `.tmp` d'un écrivain VIVANT (rename ⇒ ENOENT, non réessayé ⇒ appel en échec, fail-closed) — hors protocole (unlock d'un verrou vivant), observation O-3.
9. **Invariant comptable post-lot** : `commit` append la ligne `attempted` (écriture durable, synchrone) AVANT `transport` dans `call` (`client.ts:123`, `:131-135`) ; `tick` (compteur sans transport) n'a aucun appelant du garde en production : `git grep -n -E "\.tick\b" d141413 -- 'apps/*/src/*' 'apps/*/src/**' 'packages/*/src/**' 'scripts/**'` ne rend que `apps/bell/src/collect.ts:635-636`, branche HORS-LIGNE `makeBudgetedCall` (`collect.ts:630`), qui suit d'ailleurs le même motif `tick(); return get(…)`. Donc une queue NUL post-lot ne peut contenir que la ligne dont la requête n'était pas partie : `repair-tail` ne peut pas masquer une requête envoyée.
10. **Journal de réparation non write-ahead** (E7) : coupure simulée entre la troncature et l'écriture du record (injection de faute EN PROCESSUS : `DURABLE_FS.openSync` du journal jette, `runCli repair-tail` appelé directement) ⇒ ledger tronqué + `.bak`, AUCUN record ; relance ⇒ `no_nul_tail` ; `reconcile` ⇒ **GO** (fenêtre non signalée). Neutre comptablement par le point 9 ; le RUNBOOK §3 « Interrupted repair » détecte l'état mais ne dit pas de reconstituer le record ⇒ C-G2-3(c).
11. **Réparation MANUELLE invisible de `reconcile`** : RUNBOOK §4 (le cas où des requêtes ENVOYÉES sont perdues — la motivation même de D-FS-5) n'écrit aucun record dans `<op>.repair.jsonl` ; §5 affirme pourtant « In both cases the first reconcile after a `repair-tail` is NO-GO repaired_in_window ». Et un record sans `lines_after` numérique (une note manuelle) signale TOUTES les fenêtres : E8, 3 reconcile successifs ⇒ 3 × `NO-GO repaired_in_window`, contredisant « drapeau par fenêtre, jamais permanent » (ADR D-FS-5, docstring `reconcile.ts:47`) ⇒ C-G2-3(a)(b)(d).
12. **Fenêtre réparée jamais bornée par l'outil** (E11, `scratch/e11.mjs` sha `7ccb5187…`, `e11.log` sha `8d37ec2d…`, 04:30:03Z, bin + écrivain réel) : `repair-tail` REPAIRED → `unlock` exit 0 → `reconcile` (Δ = 3 = les 3 `attempted` de la fenêtre) ⇒ `NO-GO repaired_in_window` ; le MÊME `reconcile` relancé ⇒ `NO-GO hard:getTransaction` (fenêtre vide après le `reconciled` du premier) ; chaîne : `attempted ×3, unlocked, reconciled(repaired_in_window), reconciled(hard:getTransaction)`. Fail-closed (voulu : l'orchestrateur tranche au tableau de bord) ; RUNBOOK §3.6/§5 muets ou inexacts sur cette conséquence ⇒ C-G2-3(b).

### 4(c) — Tests

- **Le négatif est imposé** : sans fsync ⇒ rouge (N19 : `durable_production_path_…` + 3 tests de séquence rouges) ; ordre ⇒ rouge (N12, N18 et les mutants G1).
- **`no-fsync.ts` est un double d'injection de TEST, pas une option publique** : fichier sous `test/` ; agit à l'import par la couture non exportée `DURABLE_FS` ; `package.json` n'exporte que `"."` (`./src/index.ts`) ⇒ `@monark/rpc-guard/src/ledger.ts` inatteignable par le spécificateur public ; aucune variable d'environnement, aucun paramètre ; `node --test` isole par fichier — mesuré ici (`F:/tmp/g2-gfsync1/scratch/iso/`, deux fichiers `a.test.mjs`/`b.test.mjs` lancés ensemble : pids 85004 et 86864, marqueur global posé par A `undefined` dans B, 2/2 ok) ⇒ le no-op ne vaut que dans le processus de `ukemi-guard-record.test.ts` ; non-vacuité assertée (`flushesSkipped() > 0`). Conforme à I-10 (a). Limite : la couture reste mutable par import RELATIF ; le scan structurel (c)(2) ne voit que `DURABLE_FS.x =` et `no-fsync` (mutant X1 survivant) ⇒ C-G2-4.
- **Trous de test** (mutants survivants non équivalents, étape 5) : N1, N2, N17 (consommateur `reconcile`), N4 (record du cas heal), N5 (bord `torn_tail`), N11 (codes EACCES/EBUSY du retry), N15 (`--reason` requis) ⇒ C-G2-1 et C-G2-2.
- **A-8 / D-3 (forme réelle, composition)** : le seul test du tuyau `<op>.repair.jsonl` → `reconcile` écrit `{"lines_after":2}` à la main (forme attendue par l'aval), jamais le record produit par `repair-tail` ⇒ C-G2-1.
- D-4 : diff des tests = ajouts seulement ; la reconstruction G1 → pli du rendu (`childEnv` déplacé) n'a pas été rejouée par moi (non nécessaire au verdict).

### 4-bis — Checklist G2 (template)

- Compréhension : chaque bloc expliqué ci-dessus ; intention = checkpoint-1 + rulings. ✔
- Branche conditionnelle / validation d'entrée : `--reason` requis mais non testé (N15) ; `--cycle/--op` joints sans validation de chemin (`join(ledgerDir, cycle)`), même motif pré-existant que `unlock`/`reconcile` (arguments d'opérateur, pas d'entrée non fiable) — O-4. ✔ sous C-G2-2(d)
- Logique booléenne non couverte : frontière `>=` (N1) et `typeof … !== "number"` (N17) ⇒ C-G2-1.
- `this` : n-a (fonctions libres). Crypto : sha256 de `node:crypto` uniquement. Chemins/symlinks : `.bak` en `wx` (un lien pré-existant ⇒ EEXIST ⇒ exit 2, rien d'écrasé).
- Correction fonctionnelle ≠ sécurité : modèle de menace C-V-8 inchangé (le heal reste « exactement une entrée », une troncature présente un head en avance ⇒ refus ; l'ajout de NUL ne blanchit rien : qui écrit les deux fichiers gagnait déjà).
- Dépendances : aucune nouvelle ; `package-lock.json` hors diff. ✔
- Duplication : `repair.ts` réutilise `parseEntries`/`verifyCycleLedger`/`ledgerHeadSha` ; seul doublon : heal explicite + heal de la réouverture (N16) ⇒ C-G2-5.
- R-25 695 ✔ ; provenance G1/PLI ✔ ; TODO/FIXME nus : `git diff … | grep -nE "^\+.*\b(TODO|FIXME|XXX)\b"` ⇒ 0. ✔
- Scripts de workflow : n-a.

## Étape 5 — Mutants PROPRES (non repris des 37 du G1)

Harnais `F:/tmp/g2-gfsync1/mutants-g2.mjs` (A-11 : `--test-reporter=tap`, CRLF normalisé, tué ⇔ rouge ET `not ok … - <tueur nommé>` ET restauration sha ; A-12 : en-tête par exécution, diff, sha muté, sha restauré ; A-7 : 8 clés retirées ; A-13 : fichier écrit par Write/Edit). Pré-sha = sha livrés (`ledger.ts 625c759f…`, `repair.ts e997c6fd…`, `reconcile.ts e42de49c…`, `lock.ts 6655a9c8…`, `cli.ts dccbe95f…`) ; post-sha == pré pour tous les fichiers à chaque exécution ; `git status --porcelain` du clone = 0 après chaque exécution ; garde d'interruption vide.
Exécutions : run1 (`mutants-g2-run1.log`, sha `e372eb1c…`, harnais `2b9c5590…`, 01:47:49Z, 19 mutants), run2 (`…-run2.log`, `4e7a9cde…`, harnais `0166b46a…`, N6+N16), run3 (`…-run3.log`, `e794d6d5…`, harnais `72f969cd…`, N19).

| Mutant | Fichier | Mutation | Test tueur nommé | Résultat | Classement |
|---|---|---|---|---|---|
| N1 | reconcile | `n >= start` → `n > start` | `reconcile_reads_the_repair_journal_per_window` | SURVIVANT | trou de test (frontière réelle atteignable : E10) ⇒ C-G2-1 |
| N2 | reconcile | drapeau seulement en mode `per-method` | idem | SURVIVANT | trou de test (mode agrégé = chainstack, item I-5 ; code correct : E6) ⇒ C-G2-1 |
| N3 | reconcile | ligne illisible ignorée | idem | TUÉ | — |
| N17 | reconcile | record sans `lines_after` numérique ignoré | idem | SURVIVANT | trou de test ⇒ C-G2-1 |
| N4 | repair | `sha_after.head` = sha du head AVANT réparation | `repair_tail_heals_a_head_one_behind_after_the_strip` | SURVIVANT | trou de test (record menteur après heal ; valeur réelle correcte : E2c) ⇒ C-G2-2(a) |
| N5 | repair | `torn_tail` accepte une ligne JSON complète sans `\n` | `repair_tail_refuses_torn_or_clean_or_inner_nul_tails` | SURVIVANT | trou de test (corruption latente démontrée E4b) ⇒ C-G2-2(b) |
| N6 | repair | réouverture de contrôle `openOperatorLedger` retirée | `repair_tail_composition_…` | SURVIVANT | quasi-équivalent : ne diffère que par l'effacement d'un orphelin `.tmp` en état `head == recalculé` + NUL + orphelin, inatteignable par coupure (un orphelin implique un rename perdu ⇒ head pénultième ⇒ heal explicite qui écrase le `.tmp`) et, s'il était atteint (disque menteur, manipulation), bénin (l'orphelin est retiré à l'ouverture suivante, `unlock`) ⇒ garde défensive à déclarer, C-G2-5 |
| N7 | repair | verrou pris APRÈS les écritures de preuve | `repair_tail_without_lock_takes_and_releases_it` | TUÉ | — |
| N8 | repair | `.bak` du jsonl = octets réparés | `repair_tail_composition_…` | TUÉ | — |
| N9 | repair | `ftruncate(end - 1)` | `repair_tail_composition_…` | TUÉ | voisin de R11 du G1 (même effet visé, le `\n` final perdu ; site différent : argument de `ftruncate` après contrôles, contre boucle de scan qui déclenche `torn_tail`) |
| N16 | repair | heal explicite (`:64`) retiré | `repair_tail_heals_a_head_one_behind_after_the_strip` | SURVIVANT | ÉQUIVALENT : la réouverture `:65` exécute le même heal (même condition, même séquence `open:w`/`write`/`fsync`/`close`/`rename` — séquence du test inchangée) ⇒ C-G2-5 |
| N6+N16 | repair | les deux retirés | `repair_tail_heals_a_head_one_behind_after_the_strip` | TUÉ | la paire redondante est couverte collectivement |
| N10 | ledger | `parseEntries` tolère une queue NUL (fail-open) | `repair_tail_composition_…` | TUÉ | — |
| N11 | ledger | retry du rename sur EPERM seul | `durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff` | SURVIVANT | trou de test (EACCES/EBUSY déclarés ADR D-FS-2/E-3, non épinglés) ⇒ C-G2-2(c) |
| N18 | ledger | `head.tmp` ouvert en `wx` | `durable_head_rename_outlasts_a_real_reader_then_fails_closed_without_fallback` | TUÉ | l'état « orphelin + head 1 en arrière » est couvert |
| N19 | ledger | `writeDurable` ne fsynce plus que les ouvertures `a` (ligne, journal) : `head.tmp` et `.bak` non (le verrou garde son fsync propre, `lock.ts:26`, hors `writeDurable`) | `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` | TUÉ | + 3 tests de séquence rouges |
| N12 | lock | verrou ouvert en `w` (non exclusif) | `durable_append_writes_the_line_then_the_head_in_order` | TUÉ | — |
| N13 | lock | pid du verrou = `process.ppid` | `repair_tail_composition_…` | TUÉ | — |
| N14 | cli | `--cycle`/`--op` permutés | `repair_tail_is_served_by_the_bin` | TUÉ | — |
| N15 | cli | `--reason` optionnel | `repair_tail_is_served_by_the_bin` | SURVIVANT | trou de test (B-4 : REQUIS sans défaut, non épinglé) ⇒ C-G2-2(d) |
| X1 (informatif, hors des 5 fichiers) | `scripts/census/u4-guard.mjs` | `import { DURABLE_FS as SEAM } …; Object.assign(SEAM, { fsyncSync: () => {} })` | `durable_production_path_…` | SURVIVANT | trou du scan structurel (c)(2) ⇒ C-G2-4 |

Bilan sur les 5 fichiers : **20 mutants, 11 tués par leur test nommé, 9 survivants = 2 équivalents/quasi-équivalents (N16, N6) + 7 trous de test (N1, N2, N17, N4, N5, N11, N15)** ; aucun survivant n'est un défaut de CODE (chaque comportement visé est correct à l'exécution : E6, E10, E2c, E4a, et lecture du code pour N11/N15). sha mutés complets dans les journaux (ex. N1 `ee539af9b0a3e215…`, N19 `7ca69ab8ccd8948f…`).

## Étape 6 — Branchement (règle du 2026-09-19)

- **Chemin servi** : `bin/rpc-guard.mjs` → `runCli` → `repair-tail` (`cli.ts:45`) ; RUNBOOK §3 donne la commande exacte (`… --ledger-dir <d> --floor 0 repair-tail --cycle <c> --op <l> --reason "<…>"`).
- **Test d'intégration non-LLM du bin** : `repair_tail_is_served_by_the_bin` (bin → `repair-tail`, stdout exact et code). Composition `repair-tail` → `unlock` → réouverture : `repair_tail_composition_…` (par `runCli`).
- **RUNBOOK §3.2-§3.4 rejoué AU MOT PRÈS** (`scratch/runbook-verbatim.mjs`, sha `9386b637…`, `runbook-verbatim.log`, 02:00:35Z ; cwd = racine du clone, chemin relatif `packages/rpc-guard/bin/rpc-guard.mjs`, `--floor 0`, écrivain réel mort + 1 000 NUL) : `repair-tail` ⇒ exit 0 `REPAIRED nul_bytes_removed=1000 head_action=none` ; contrôle §3.3 `sha256(<op>.jsonl) == sha_after.jsonl` ⇒ true ; `unlock` §3.4 ⇒ exit 0, verrou retiré. La procédure servie est exécutable telle qu'écrite.
- **Tuyau `<op>.repair.jsonl` → `reconcile` : AUCUN test du dépôt ne compose le producteur réel et le consommateur** — `git grep -n -E "repaired_in_window|repair-tail|runRepairTail" d141413 -- '*.test.ts' '*.test.mjs'` : le verdict `repaired_in_window` n'est asserté qu'en `repair-tail.test.ts:230,233`, sur un journal FABRIQUÉ (`{"lines_after":2}`). Rejoué ici par le BIN (E1/E5 : `repair-tail` → `unlock` → `reconcile` ⇒ `NO-GO repaired_in_window` puis `GO` ; 2ᵉ réparation signalée dans sa fenêtre ; mode agrégé E6) : la composition FONCTIONNE ; il manque sa preuve au dépôt, exigée par CONSIGNE D-3 (« Test d'intégration non-LLM de bout en bout par tuyau déclaré ») et par la règle Branchement (chemin couvert par un test d'intégration qui rejoue la composition) ⇒ **C-G2-1**.
- **Registre** : `@monark/rpc-guard` et le bin restent `upcoming` (en-tête du bin ; ADR proposé « État ») — aucune revendication `built`, aucun registre public touché : conforme.

## Étape 7 — Sécurité (A-7)

- `git diff 66f75c2 d141413 | grep -nE "https?://[^ ]*(helius|chainstack)"` ⇒ exit 1 (aucune occurrence) ; RUNBOOK : `grep -nE "https?://"` ⇒ exit 1.
- Seule URL ajoutée : `https://example.invalid/HELIUS` avec la clé factice `FAKEKEY-9z9z9z` (`harness.ts` `FAKE_HELIUS_ENV`) = calque exact de `packages/rpc-guard/test/exports.test.ts:10` à la base (`git grep` sur `66f75c2`).
- Aucun `api-key=`/`token=`/`bearer` ajouté ; seul hex ≥ 40 = le sha de commit `66f75c2c…` dans le rendu G1 ; aucun `process.env` ajouté sous `packages/rpc-guard/src` ni dans le bin (`grep` exit 1).
- Processus enfants des tests : `childEnv()` retire par MOTIF `/_API_KEY$|^CHAINSTACK_\w+_URL$/` — couvre les 8 clés A-7 ; aucune variable affichée par moi (contrôle par commande `env -u` uniquement).

## Corrections — liste FERMÉE

- **C-G2-1 — Tuyau `<op>.repair.jsonl` → `reconcile` composé en test (D-3, A-8, Branchement).** Ajouter un test d'intégration non-LLM PAR LE BIN SERVI (le chemin servi est le bin, checkpoint-1 CA-11 ; `spawnSync` des trois sous-commandes, skip conditionnel sur le miroir public comme `repair_tail_is_served_by_the_bin`, D-5) : écrivain réel mort (processus enfant, comme `repair-tail.test.ts:47-52`) → queue NUL → `repair-tail` → `unlock` → `reconcile` ⇒ `NO-GO repaired_in_window`, puis fenêtre suivante `GO` (mon expérience E1/E5 en est le calque exécutable) ; variantes : (i) frontière `lines_after ==` début de fenêtre (réparation juste après une ligne `reconciled`, cf. E10) ; (ii) mode `aggregate` (`total_ru`, cf. E6) ; (iii) record parseable sans `lines_after` numérique. Mutants à rendre ROUGES : N1, N2, N17. Mettre à jour la ligne « `<op>.repair.jsonl` » de la table des tuyaux de l'ADR. **Porteur** : worker (pli G2). **Déclencheur** : avant le G7 de GARDE-FSYNC-1.
- **C-G2-2 — Tests manquants sur des comportements déjà corrects.** (a) asserter le record complet dans `repair_tail_heals_a_head_one_behind_after_the_strip` (`sha_after.head` = sha du head soigné, `head_after`, `head_action`) ⇒ N4 rouge ; (b) ajouter le cas « ligne JSON complète dont le `\n` n'a pas atteint le disque + NUL » ⇒ `torn_tail`, 0 octet (E4a) ⇒ N5 rouge ; (c) paramétrer le cas (1) du test de retry sur `EPERM`, `EACCES`, `EBUSY` (liste déclarée ADR D-FS-2) ⇒ N11 rouge ; (d) `repair-tail` sans `--reason` (et sans `--cycle`, sans `--op`) ⇒ échec, 0 octet ⇒ N15 rouge. **Porteur** : worker (même pli). **Déclencheur** : avant le G7. (Estimation hors mesure : quelques dizaines de lignes ; R-25 actuel 695, seuil 1 150.)
- **C-G2-3 — Textes RUNBOOK / ADR / docstring sur la réparation manuelle et la permanence du drapeau.** (a) RUNBOOK §4 : après une réparation MANUELLE, ajouter un record à `<op>.repair.jsonl` avec `lines_after` numérique (= lignes après la troncature manuelle) pour que `reconcile` signale la fenêtre — sinon écrire explicitement que `reconcile` ne voit PAS une réparation manuelle et que l'orchestrateur traite le prochain rapprochement comme NO-GO (le choix de la valeur `head_action` d'un record manuel, aujourd'hui fermée à `none|heal_penultimate`, est une décision orchestrateur) ; (b) RUNBOOK §5 : réécrire « In both cases … after a `repair-tail` » (faux pour §4) et « until the orchestrator has read the dashboard » (le NO-GO est émis UNE fois et ferme la fenêtre, indépendamment de l'orchestrateur) ; RUNBOOK §3.6 : écrire que l'outil ne calcule JAMAIS la borne numérique de la fenêtre réparée (le `reconciled` du NO-GO la ferme aussitôt), que l'orchestrateur la calcule à la main (Δ_dashboard contre Σ `credits_derived` des lignes `attempted` de cette fenêtre), et qu'un nouveau `reconcile` avec les mêmes instantanés évalue une fenêtre VIDE et rend `NO-GO hard:<method>` sans dépassement réel (mesuré E11) ; (c) RUNBOOK §3 « Interrupted repair » : si la troncature a eu lieu sans record, reconstituer le record (E7 : sinon `reconcile` ⇒ GO) ; (d) ADR D-FS-5 et docstring `reconcile.ts:43-47` : un record illisible ou sans `lines_after` numérique signale TOUTES les fenêtres (E8) — le dire, avec la procédure de levée (déplacer le record, avec son sha, vers le dossier de sauvegarde). **Porteur** : worker (RUNBOOK + docstring, même pli) ; orchestrateur (ADR, à l'insertion). **Déclencheur** : avant le G7.
- **C-G2-4 — Scan structurel I-10 (c)(2) contournable (X1).** Durcir `durable_production_path_…` (2) : toute occurrence du jeton `DURABLE_FS` ou d'un import de `rpc-guard/src/ledger.ts` hors `packages/rpc-guard/src` et `packages/rpc-guard/test` = hit ; rejouer X1 ⇒ rouge. À défaut, déclarer dans l'ADR D-FS-6 que le scan est une heuristique (l'appel réel du flush reste prouvé par la partie (1), sur le spécificateur de production). **Porteur** : worker (même pli). **Déclencheur** : avant le G7.
- **C-G2-5 — Éditorial à l'insertion de l'ADR et au rendu.** ADR D-FS-6 : racines du scan (+ `apps/harness/src`, `scripts`) et mutant P3 ; table des tuyaux : test de C-G2-1 ; déclarer la garde redondante « heal explicite `repair.ts:64` + réouverture de contrôle `repair.ts:65` » (N16 équivalent, N6 quasi-équivalent, N6+N16 tué) — le G1 §6 écrit « Garde redondante déclarée : aucune ». **Porteur** : orchestrateur (insertion ADR). **Déclencheur** : insertion de l'amendement au G7.

## Observations (sans correction exigée ; aucune dette nue)

- **O-1** Répertoire non fsyncé : résidu I-1 accepté par ruling avec déclencheur (avant le 2ᵉ redéploiement VPS) ; le code est fail-closed sur ses conséquences (E3). Rien à ajouter.
- **O-2** Branche POSIX du test à vrai lecteur jamais exécutée (déclarée) ; lecture du code : 8 attentes de 10..80 ms = 360 ms ≥ 300 ms, puis rename réel — cohérent ; première exécution à la CI ubuntu (décision 136). Déjà formé (ADR proposé, résidu CI).
- **O-3** `cli unlock` ouvre le ledger sans verrou ; l'effacement d'orphelin à l'ouverture peut faire échouer (fail-closed) un écrivain VIVANT dont le `.tmp` disparaît — seulement si un opérateur lance `unlock` contre un verrou vivant, hors protocole (C-9, RUNBOOK §3.0 « Stop the course »). Pas d'item.
- **O-4** `--cycle`/`--op` joints sans validation de chemin : motif pré-existant de `unlock`/`reconcile` (arguments d'opérateur). Pas d'item.

## Verdict

**PASS-AVEC-CORRECTIONS** — liste fermée C-G2-1..C-G2-5 (porteurs et déclencheurs ci-dessus ; C-G2-1..C-G2-4 portés par un pli worker AVANT le G7, C-G2-5 par l'orchestrateur à l'insertion de l'ADR).
Motifs : oracle 7 × exit 0 (950/948/0/2) ; R-25 695 < 1 150 ; A-6 9/9 ; A-7 propre ; critère (d) relatif tenu (×1,57 / ×1,37) ; C-1..C-13 conformes dans le code ; durabilité réelle prouvée (le négatif « sans fsync ⇒ rouge » est imposé : N19) ; `repair-tail` idempotent, borné à la queue NUL, sans réécriture d'un head en avance (rejeu réel des deux coupures : refus, 0 octet) ; composition servie rejouée de bout en bout par le bin. Pas FAIL : aucun des 9 survivants n'est un défaut de code (2 équivalents/quasi-équivalents, 7 trous de test sur des comportements vérifiés corrects à l'exécution). Pas PASS : un tuyau déclaré sans test de composition (C-G2-1), 7 mutants survivants non équivalents (C-G2-1/C-G2-2), textes RUNBOOK/ADR contredits ou muets face à l'exécution (C-G2-3, E7/E8/E11), scan I-10 contournable (C-G2-4).

## Demande de consultation formée
Aucune : pas de blocage ; l'outil advisor intégré est consulté une fois avant clôture (voir journal).

## Journal d'avancement
- 2026-09-23 01:35:54 UTC — début de mission ; `F:/tmp/g2-gfsync1` créé ; rendu initialisé.
- 01:36-01:40 — clone, `npm ci` (exit 0), lecture des entrées ; checkpoint-1 localisé sur `lot/etude-suite` (`266c840`).
- 01:40:08-01:43:16 — oracle 7 gates : 7 × exit 0, 950/948/0/2.
- 01:44-01:47 — R-25 (695), A-6 (9/9), A-7 ; harnais de mutants écrit (Write), `--check` 19/19 FIND-OK.
- 01:47:49 — run1 (19 mutants) : 9 tués, 10 survivants (dont X1) ; clone propre après.
- 01:51:19 — run2 (N6+N16) : tué. Piège A-13 rencontré et corrigé (Edit).
- 01:52:45 — expériences E1-E10 (bin, écrivains réels) : 21/21 conformes aux prédictions ; dossier d'expérience supprimé.
- 01:53:48 — sonde win32 P1/P5 : conforme. 01:54:41 — run3 (N19) : tué. 01:55:04 — rejeu réel cut1/cut2 : conforme, 0 octet changé.
- 01:56:25 — paires ABBA base/lot lancées (étape 1-bis). Rédaction du rendu complet.
- ~01:59:4x — mesure d'isolation du lanceur `node --test` (pids distincts). 02:00:35 — rejeu RUNBOOK §3.2-§3.4 au mot près : conforme. 02:01:45 — fin des 4 exécutions ABBA (exit 0 ×4).
- ~02:1x — **session coupée (limite 429)** avant la mise à jour de ce fichier ; reprise sur relance du coordinateur à 04:23:05 UTC : clone `git status --porcelain` = 0 (HEAD `d141413`), clone de base = 0 (HEAD `66f75c2`), garde de mutants vide, sha des 5 fichiers = sha livrés ; rien de consigné n'a été refait.
- 04:23-04:3x — ratios ABBA calculés (×1,570 / ×1,374) ; vérifications : `git grep` des tests `repaired_in_window` (composition absente confirmée), `git grep` des appelants `.tick` (branche hors-ligne seulement) ; étape 1-bis, étape 6, C-G2-1 et verdict écrits.
- 04:2x — **outil advisor intégré consulté (une fois, conseil et non verdict)** : verdict maintenu ; trois actions recommandées et faites : (1) vérifier RUNBOOK §3.6 sur la fenêtre réparée ⇒ E11 exécuté à 04:30:03Z (bin, écrivain réel : 2ᵉ `reconcile` aux mêmes instantanés ⇒ `NO-GO hard:getTransaction`), C-G2-3(b) étendu, point 4(b)12 ajouté ; (2) passe de cohérence complète du fichier ⇒ 5 corrections de rendu (ligne N19 : le verrou garde son fsync propre `lock.ts:26` ; commande `git grep .tick` citée telle qu'exécutée ; provenance E1-E10 et nature en processus d'E7 ; N9 déclaré voisin de R11 du G1 ; E11 dans l'intro et le verdict) ; (3) clôture ci-dessous.
- 2026-09-23 04:31:58 UTC (`date -u`) — clôture : clone `git status --porcelain` = 0 (HEAD `d141413`), clone de base = 0, garde de mutants vide ; F:\Monark : aucune écriture de ma part (lectures `git log/show/grep`, lecture de `docs/`, lecture et copie des sauvegardes de coupure vers `F:/tmp/g2-gfsync1/replay/`), `git status --porcelain` = 0, son HEAD a avancé pendant la mission (`fbaa79d`, commits de l'orchestrateur) sans effet sur le clone. Clones et journaux laissés sous `F:/tmp/g2-gfsync1/` pour re-vérification (retrait éventuel des `node_modules` par `rm-nm.ps1`, A-2, jamais `Remove-Item -Recurse`). Aucun commit (R-20).
