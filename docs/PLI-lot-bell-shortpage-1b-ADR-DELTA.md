## ADR-DELTA-1b — à insérer dans D1-nonies (`docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md`) — micro-pli BELL-SHORTPAGE-1b

> **NOTE D'INSERTION — NON insérée dans l'ADR** (à l'usage de l'orchestrateur seul, R-20) : ce fichier livre des blocs
> prêts à insérer dans l'amendement D1-nonies ; le brouillon D1-nonies du lot (`F:\tmp\bellsp1\ADR-amendement.md`) n'est
> PAS modifié par ce micro-pli (C-G2-4 et le checkpoint-2 y sont portés par l'orchestrateur). Les blocs (a)-(d) ci-dessous
> ne citent que des sources en dépôt (F-1), sauf le rendu du micro-pli, à persister en dépôt au G7 (ex.
> `docs/PLI-lot-bell-shortpage-1b.md`) : c'est la source des chiffres « mesurés par le micro-pli ».

**Provenance (à reprendre dans l'en-tête de D1-nonies)** : worker `claude-opus-5-5[1m]` (préfixe conforme, décision 133),
effort max, 2026-09-22 (UTC ; journaux 23:2x-23:5xZ), branche `lot/bell-shortpage-1` @ `e5dfbb4` + diff du micro-pli,
réviseur = orchestrateur (R-21). **Autorité** : G2 PASS-AVEC-CORRECTIONS (`docs/G2-lot-bell-shortpage-1.md` §2,
C-G2-1/2/3) ; exigence orchestrateur R-SP-A (fait mesuré, `docs/course-bell/RUNBOOK-supervision-tirage.md` §1 et §3 item
BELL-RENAME-RETRY-1) ; FAITS `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md` (en dépôt `7cdfb7c`).

### (a) Paragraphe à ajouter au §4 (après « Couture de test : `DURABLE_FS` ») — « Retry borné du rename (R-SP-A) »

- **Fait.** Sous win32, `fs.renameSync(tmp, cible)` échoue `EPERM` tant qu'un lecteur QUELCONQUE tient la cible ouverte
  (Node `openSync(cible,"r")`, Git-Bash, Python, PowerShell ; mesuré par l'orchestrateur, RUNBOOK §1 [lu]). Motif [lu,
  FAITS §3-§4] : `fs.renameSync` = libuv 1.51.0 `MoveFileExW(…, MOVEFILE_REPLACE_EXISTING)` **seul** (`src/win/fs.c:2266-2267`),
  sans `MOVEFILE_WRITE_THROUGH` ni sémantique POSIX ; aucun chemin Node ne remplace une cible ouverte. Le micro-pli a
  re-mesuré le fait **dans le même processus** (lecteur `openSync(cible,"r")` tenu ⇒ `EPERM`, cible = ancien contenu, `.tmp`
  présent ; lecteur fermé ⇒ rename OK), et le test (i) ci-dessous le rejoue à chaque exécution de l'oracle sous win32.
- **Décision.** Le rename de `writeDurable` passe par `renameWithBoundedRetry` (`DURABLE_FS.renameSync`) :
  - UNE tentative brute (`DURABLE_FS.renameAttemptSync` = `fs.renameSync`) ;
  - réessai sur `RENAME_RETRY_CODES = ["EPERM", "EACCES", "EBUSY"]` **seulement**, après une attente BLOQUANTE
    (`DURABLE_FS.sleepSync` = `Atomics.wait` ; le chemin durable est synchrone, `onPage` est synchrone) ;
  - attentes `RENAME_RETRY_FIRST_WAIT_MS = 10` ms, doublées jusqu'à `RENAME_RETRY_MAX_WAIT_MS = 200` ms, la dernière rognée
    au plafond ; plafond TOTAL `RENAME_RETRY_TOTAL_MS = 3000` ms compté sur les attentes DEMANDÉES (déterministe) :
    20 tentatives et 19 attentes au plus (10, 20, 40, 80, 160, 13 × 200, 90) ;
  - plafond épuisé ⇒ **`DurableWriteError`** (classe nommée exportée ; champs `code`, `attempts`, `waitedMs`, `cause` ;
    message préfixé `bell/collect:`, donc restitué verbatim par `fatalMessage`, `apps/bell/src/collect.ts:829-831` ; nom de
    base du fichier et compteurs seulement) : STOP fail-closed, **le fichier précédent est intact**, le `.tmp` peut rester
    (réécrit `"w"` au prochain appel ; aucun lecteur n'accepte un nom `*.tmp`) ;
  - tout autre code (`ENOENT`, …) est relancé tel quel, sans attente (comportement d'avant R-SP-A) ;
  - **jamais de repli `writeFileSync`** : une troncature + écriture en place perdrait la durabilité C-6.
- **Conséquences.** Sans contention, une seule tentative : coût C-6 inchangé (G2 §4). Un lecteur tenu retarde la page
  d'au plus ≈ 3 s puis STOP fail-closed ; l'ordre ADR §4 (`budget.json` avant la ligne) garantit que ni `budget.json` ni le
  ledger n'avancent sur ce STOP (reprise sans perte). Temps réel : une attente dure au moins sa demande et peut la dépasser
  d'environ un tick d'horloge win32 (mesuré par le micro-pli : 10 → 24,1 ms, 25 → 30,7 ms, 100 → 108,9 ms), soit un
  plafond réel ≤ ≈ 3,3 s. Le RUNBOOK de supervision reste en vigueur (défense en profondeur).
- **Précédent de forme [lu]** : graceful-fs 4.2.11 (épinglé par `package-lock.json`), `polyfills.js:86-123` : sous win32,
  `rename` réessayé sur `EACCES`/`EPERM`/`EBUSY` jusqu'à 60 s, backoff +10 ms plafonné à 100 ms (motif : antivirus) — **mais
  seulement si la cible est ABSENTE** (`fs.stat(to)` ⇒ `ENOENT`) ; cible présente ⇒ erreur rendue sans réessai. graceful-fs
  ne couvre donc pas notre cas (cible présente tenue par un lecteur) : il fournit la forme (codes, backoff court, plafond),
  pas une preuve de comportement.
- **Preuves** (composition `runMain` de bout en bout, fichiers réels ; lecteur RÉEL `openSync(cible,"r")` : sous win32 le
  vrai rename échoue seul, sous POSIX — CI `ubuntu-latest` — la couture émule le refus win32 mesuré TANT QUE le même lecteur
  est tenu) :
  - `bell_durable_rename_retry_reader_released_then_succeeds` : lecteur libéré par le crochet `sleepSync` après ≥ 300 ms
    d'attentes ⇒ succès, `budget.json` = nouveau contenu, `.tmp` absent, attentes `[10, 20, 40, 80, 160]`, ≥ 2 tentatives,
    attentes réelles ≥ 250 ms, tirage complet `equal` ;
  - `bell_durable_rename_retry_cap_exhausted_fails_closed_named` : lecteur jamais relâché, plafond abaissé à 300 ms par la
    couture ⇒ `DurableWriteError` (6 tentatives, 300 ms), attentes exactes `[10, 20, 40, 80, 150]` × 2 (écriture de `onPage`
    puis `finally` du CLI), `budget.json` et ledger byte-identiques, durée bornée, coupe-circuit anti-emballement ; l'erreur
    qui remonte de `runMain` est celle du `finally` (elle remplace celle de `onPage`, masquage préexistant ; toutes deux
    portent 6 tentatives / 300 ms) ;
  - `bell_durable_rename_retry_codes_schedule_and_real_wait` : `EACCES`/`EBUSY` réessayés, `ENOENT` relancé tel quel sans
    attente, plafond PAR DÉFAUT ⇒ 20 tentatives et l'échéancier déclaré, `sleepSync` de production réellement bloquant,
    défaut de la couture = constante nommée.
- **Mutants** (harnais TAP `byIntended`, rendu du micro-pli) : R01 « pas de retry » (rename brut) ; R02 « retry infini »
  (plafond retiré) ; R03 « repli `writeFileSync` » ; R04 « autres codes réessayés » ; R05 « sommeil de production no-op » ;
  R06 « codes réduits à EPERM » ; R07 « plafond par défaut non lié à la constante » — chacun rouge par son test désigné.
  R02 est tué dans le test (ii) par le coupe-circuit du crochet `sleepSync` (plus de 40 attentes ou plus de 1 200 ms
  demandées ⇒ erreur « runaway » ⇒ le prédicat `DurableWriteError` de `assert.rejects` est faux), non par la borne de
  durée `< 2 × plafond + 3 000 ms`, qui n'est qu'un garde-fou.

### (b) Lignes Tuyaux (§6) et MAST (§7) — prêtes à insérer

- **Tuyaux — retry borné du rename (R-SP-A)** :
  - **Entrée** : `writeDurable`, pour les 8 sites d'écriture entière du module (troncature C-B-5 du ledger, `budget.json` du
    crosscheck et de la densité, `candidates/<MINT>/*.json`, `crosscheck-<MINT>.json` / `-attempt.json`,
    `crosscheck-report.json`, `sonde-report.json`) → `DURABLE_FS.renameSync` = `renameWithBoundedRetry`.
  - **Sortie** : le fichier remplacé, lu par `readPriorCalls` / `readPriorBudget` / `readPriorByMethod` (`budget.json`),
    `resumeFromLedger` (ledger tronqué), le contrôle `sealed` (artefact), l'orchestrateur et les manifestes d'ancre ; OU
    `DurableWriteError`, qui remonte `runMain` → `fatalMessage` (verbatim) → exit 1 (STOP fail-closed, reprise sans perte).
  - **État** : aucun état persistant nouveau ; `.tmp` résiduel possible (jamais lu, réécrit `"w"`).
  - **Preuves** : les trois tests ci-dessus (runMain, fichiers réels) ; C-G2-3 épingle les 8 sites (5 avant ce micro-pli :
    ledger, `budget.json` du crosscheck, candidats, artefact, rapport ; + troncature
    `bell_crosscheck_nul_tail_truncated_durably_on_resume`, + densité `bell_density_writes_are_durable`) et l'ordre
    `bell_crosscheck_budget_durable_before_each_ledger_line`.
- **Tuyaux — ancre C-8 (C-G2-2, complément à la ligne existante)** : la requête desc est ENREGISTRÉE et épinglée
  (`bell_shortpage_anchor_request_pinned_on_both_paths`), la comparaison par signature épinglée contre une autre tx au même
  slot (`bell_shortpage_anchor_same_slot_other_sig_refuses`), le passage par `retry` épinglé sur les deux chemins
  (`bell_shortpage_anchor_transient_error_is_retried_on_both_paths`) ; la sonde non vide AVEC token (A-8) épinglée
  (`bell_shortpage_probe_nonempty_with_token_stops_uncommitted`).
- **MAST (§7), ligne à ajouter** :
  - **Répétition d'étape** — risque : retry infini, ou réessai d'une erreur non transitoire ; contre-mesures : plafond nommé
    3 000 ms compté sur les attentes demandées, codes fermés, coupe-circuit dans le test ; mutants R02, R04, R07.
  - **Terminaison prématurée** — risque : abandonner à la première collision (pas de retry) ou « attendre » sans attendre
    (sommeil fictif) ⇒ STOP du tirage ; contre-mesures : tests (i) et (iii) ; mutants R01, R05, R06.
  - **Vérification incorrecte** — risque : un test qui fabrique le refus sans lecteur ; contre-mesure : lecteur RÉEL, vrai
    `EPERM` sous win32 (le poste du tirage), émulation POSIX seulement pendant que ce même lecteur est tenu ; échéancier
    et compteurs exacts assertés ; la requête de l'ancre C-8 enregistrée, jamais supposée (C-G2-2).
  - **Rétention d'information** — risque : un repli silencieux qui masquerait la perte de durabilité, ou une erreur anonyme ;
    contre-mesures : `DurableWriteError` nommée, message `bell/collect:` verbatim, champs `code`/`attempts`/`waitedMs` ;
    mutant R03.

### (c) Reformulations dues aux FAITS win32 (§8, à la même insertion)

- **R-C6-1** (remplace la première phrase) : « le `fsync` du répertoire parent n'est pas fait. Après une coupure, l'état
  visible est l'ancien fichier complet OU le nouveau fichier complet, jamais un fichier déchiré (le `.tmp` est `fsync`é avant
  le rename) ; la persistance du renommage lui-même n'est pas garantie par l'API appelée (`MoveFileExW` sans
  `MOVEFILE_WRITE_THROUGH`, FAITS §2-§4) ». **Retirer** « NTFS journalise la méta », présenté comme un fait : non sourcé
  (FAITS §4 : ce qui est sourcé, c'est l'ABSENCE de garantie). Le reste de R-C6-1 (rename perdu ⇒ `budget.json` à N−1,
  sous-compte borné, déclencheur GARDE-FSYNC-1) est inchangé.
- **R-C6-2** (remplace « Déclencheur : première occurrence (retry borné du `rename` à concevoir alors) ») : « contre-mesure
  code LIVRÉE par ce micro-pli (R-SP-A, retry borné, item BELL-RENAME-RETRY-1 du RUNBOOK §3 clos) ; contre-mesure procédure
  maintenue (RUNBOOK §2) ; résidu : un lecteur tenu plus de ≈ 3 s provoque un STOP fail-closed sans perte ». La mention
  « lecteur non-Node » est fausse (RUNBOOK §1 : tout lecteur) et est retirée.

### (d) Items formés (zéro dû nu)

- **R-SP-A-1** (résidu, propriétaire orchestrateur ; déclencheur : première `DurableWriteError` dans un tirage réel) :
  revoir le plafond de 3 000 ms. graceful-fs [lu] documente des verrous antivirus « for up to a minute » sur des entrées
  neuves ; notre `.tmp` est une entrée neuve à chaque écriture. Le plafond actuel reprend l'expérience mesurée de
  l'orchestrateur (retry toutes les 100 ms, plafond 3 s, RUNBOOK §1) ; tout relèvement est une décision de valeur (durée de
  blocage d'une page) ⇒ orchestrateur.
- **DURABLE-FS-UNIFY** (C-1, propriétaire orchestrateur ; déclencheur : G7 du second des deux lots {BELL-SHORTPAGE-1b,
  GARDE-FSYNC-1}) : GARDE-FSYNC-1 (en G1, lot séparé) reçoit la même exigence de retry borné pour la garde rpc-guard
  (RUNBOOK §3) ; deux primitives durables et deux erreurs de plafond coexisteront alors. Unifier la primitive et la classe
  d'erreur (une seule classe canonique, ré-exportée, mutant « classe locale restaurée », consigne C-1).
- **cp-2 C-1 (déclencheur atteint)** : le checkpoint-2 (`docs/CHECKPOINT2-lot-bell-shortpage-1.md` §5 C-1) forme un item
  « commentaire `:761` et JSDoc `:214-220` (sémantique de `short_final_page_probe: null`) au prochain toucher du fichier ».
  Ce micro-pli touche `rebase-crosscheck.ts` mais son périmètre est FERMÉ (« toute autre modification de code » exclue) :
  l'item n'est pas traité ici. Choix de l'orchestrateur : (1) l'ajouter à ce micro-pli (commentaires seulement, aucun
  octet de code exécutable) avant la fusion, ou (2) re-déclencher au prochain lot de code Bell.
