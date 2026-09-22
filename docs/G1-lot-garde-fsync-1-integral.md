Modèle résolu : claude-opus-5-5[1m]

# G1 — Lot GARDE-FSYNC-1 — durabilité du ledger de cycle `@monark/rpc-guard` sous perte d'alimentation (fsync) + `repair-tail` servi

> Rendu écrit AU FIL DE L'EAU (consigne investisseur 22:1x UTC). État du fichier : voir la dernière section « Journal d'avancement ».

## 0. En-tête (A-12, R-1, provenance)
- Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, effort max ; `claude-opus-5` banni non utilisé).
- Worktree `F:\Monark-wt-gfsync1`, branche `lot/garde-fsync-1`, base `lot/etude-suite` @ `66f75c2c4907f92f272fdbe7c28aa6bc417f36f8` (créé par `git worktree add`, AUCUN commit — R-20). Node v24.15.0, libuv 1.51.0, win32 x64, volume NTFS `F:`. TEMP/TMP = `F:\tmp\gfsync1\os-tmp` (rien sur C:).
- Entrées : mission G1 (orchestrateur), `docs/CONSIGNE-STANDARD-G1.md` A-1..A-12, **checkpoint-1 `docs/CHECKPOINT1-lot-garde-fsync-1.md` C-1..C-13 (primant sur la mission ; ruling C-1)**, exigence orchestrateur 22:0x UTC (retry borné du rename), consigne investisseur 22:1x UTC (rendu progressif).
- Incidents pendant le lot : **seconde coupure de courant ~21:37 UTC — mon processus a été tué**. Reprise : contrôle d'intégrité du worktree (`git diff` relu intégralement, 0 octet NUL sur les 8 fichiers, dernières éditions présentes) et des preuves `F:\tmp\gfsync1` (0 NUL, sauf 3 NUL de `probes/win32-probe.log` = le libellé P7 qui imprime `"\0\0".trim()` et `JSON.parse("\0")` par construction, vérifié par `od`). Depuis : chaque lot d'écritures est fsyncé (`F:\tmp\gfsync1\fsync-files.mjs`, open `r+` → fsync → close, fichiers + dossiers).
- Advisor intégré : consulté AVANT le code (conception) et AVANT le rendu (22:2x UTC ; recommandations appliquées, §12) ; contrôle final : §12.

## 1. Livré (fichiers du worktree, non committés)
| Fichier | Nature |
|---|---|
| `packages/rpc-guard/src/ledger.ts` | seam `DURABLE_FS` (non exporté), `writeDurable` (open→write→fsync→close), `replaceDurable` (tmp→fsync→rename, retry borné `min(10k,100)` ms ≤ 3 000 ms puis erreur nommée), `parseEntries` (ex-`readEntries`), heal durable (C-4), suppression d'un `.head.tmp` orphelin APRÈS vérification (C-4) |
| `packages/rpc-guard/src/lock.ts` | `acquireLock` : open(`wx`)→write `{pid, iso}`→**fsync**→close via le seam |
| `packages/rpc-guard/src/repair.ts` (NOUVEAU) | `runRepairTail` — `repair-tail` (C-1/C-2/C-3/C-5) |
| `packages/rpc-guard/src/cli.ts` | dispatch `repair-tail --cycle --op --reason` |
| `packages/rpc-guard/src/reconcile.ts` | C-9 : consommateur de `<op>.repair.jsonl` ⇒ `NO-GO repaired_in_window` (fenêtre) |
| `packages/rpc-guard/bin/rpc-guard.mjs` | commentaire seul (le bin sert déjà tout `runCli`) : `reconcile | unlock | repair-tail` |
| `packages/rpc-guard/test/harness.ts` | + `FAKE_HELIUS_ENV`, `ONE_METHOD_LIMITS`, `okFetch`, `journal()` (journal de SÉQUENCE du seam, injection de faute, restauration) |
| `packages/rpc-guard/test/durable.test.ts` (NOUVEAU) | 6 tests (séquence, heal, orphelin, retry borné, VRAI lecteur, tête en retard d’une entrée) |
| `packages/rpc-guard/test/repair-tail.test.ts` (NOUVEAU) | 9 tests (composition C-8 à écrivain réel mort, variantes, bin servi, C-9) |
| `docs/RUNBOOK-rpc-guard.md` (NOUVEAU) | modèle de faute, faits win32 mesurés, procédure A (`repair-tail`), procédure B (manuelle, INCIDENT §2), comptabilité |
Hors worktree : `F:\tmp\gfsync1\ADR-amendement.md` (amendement PROPOSÉ à ADR-GARDE-HELIUS), `F:\tmp\gfsync1\mutants.mjs`, `DELIVERED.sha256`, ce rendu, les journaux.

Aucun fichier de `apps/bell/**` ni des 9 gelés touché ; `index.ts` inchangé (set d'export fermé) ; `client.ts:17` `Outcome` inchangé ; `ledger-format-lock.test.ts` inchangé.

## 2. Corrections cp-1 C-1..C-13 : état
| # | État | Preuve |
|---|---|---|
| C-1 (bloquant) | FAIT | `repair.ts` : après strip, head == recalculé ⇒ `none` ; == pénultième ⇒ `heal_penultimate` ; sinon `REFUSED tail_truncation` ; AUCUN autre mode d'écriture du head. Test `repair_tail_refuses_a_head_ahead_or_nul_filled_and_changes_no_byte` (head en avance ET head de 64 NUL de la coupure n°2 ; 0 octet écrit) ; mutant R1 « head en avance réécrit » ROUGE. Rejeu RÉEL sur copies des sauvegardes des deux coupures : `helius` ⇒ `REFUSED tail_truncation` (§7.4). |
| C-2 | FAIT | refus `no_nul_tail` (0 NUL), `torn_tail` (ligne partielle avant les NUL), `malformed_line` (NUL interne), `writer_alive` (pid du `.lock` vivant, `process.kill(pid,0)` : succès ou EPERM ⇒ vivant, ESRCH ⇒ mort ; mesuré `kill(4,0)`=EPERM), `lock_unreadable` ; `.lock` absent ⇒ pris (`wx`, fsync) le temps de la réparation puis relâché (déclaré, testé). Mutants R2, R3, R5, R5b ROUGES. |
| C-3 | FAIT | l'outil crée `<op>.jsonl.bak` (octets endommagés, NUL compris) + `<op>.head.bak` en `wx`, fsyncés AVANT la troncature ; `bak_exists` si l'un existe ; record fermé `iso, pid, cycle, op, reason, sha_before{jsonl,head}, sha_after{jsonl,head}, nul_bytes_removed, lines_after, head_after, bak_path{…}, bak_sha256{…}, head_action` (liste de clés ET valeurs recalculées assertées, D-2). Mutants R4, R4b ROUGES. |
| C-4 | FAIT | heal via `replaceDurable` ; orphelin `.head.tmp` supprimé à l'ouverture APRÈS vérification (refus = aucun effet de bord). Tests `durable_heal_…`, `durable_orphan_…` ; mutants M5, M8, M8b ROUGES. |
| C-5 | FAIT | head absent : REFUS MAINTENU (ouverture ET `repair-tail` `head_absent`) ; ADR D-FS-3 ; tests `durable_orphan_…` (partie C-5) et `repair_tail_never_overwrites_evidence_and_refuses_head_absent` ; mutant R6 ROUGE. |
| C-6 | FAIT (+ précision) | `/malformed/` asserté sur `runCli unlock` (le geste SERVI de l'incident, `cli.ts:39` ouvre sans verrou) ET sur `openOperatorLedger`. **Précision** : `openGuardedClient` ne peut PAS jeter `/malformed/` verrou tenu — `guarded.ts:43` `acquireLock` ⇒ `LockHeldError` AVANT `openOperatorLedger` (`:53`) ; asserté tel quel (`LockHeldError`). INCIDENT déjà amendé par l'orchestrateur (erratum C-6). |
| C-7 | FAIT | seam = journal de SÉQUENCE (`open:<flags>:<f>`, `write`, `fsync`, `close`, `rename`, `ftruncate`, `unlink`, `sleep`) ; mutants d'ordre ROUGES : fsync retiré (M1a/M1b), fsync avant write (M2), head avant ligne (M3), rename avant fsync tmp (M4), heal non durable (M5), head en place (M6) ; `index.ts` inchangé ; aucune valeur d'`Outcome`. |
| C-8 | FAIT | `repair_tail_composition_power_cut_signature_to_unlock_and_reopen` : écrivain = VRAI processus enfant (`openGuardedClient` + 3 `call`, fetch bouchonné dans l'enfant) qui meurt SANS unlock (pid mort, verrou tenu) → 4 096 NUL ajoutés → `unlock` et `openOperatorLedger` jettent `/malformed/`, `openGuardedClient` jette `LockHeldError` → `runCli repair-tail` REPAIRED (`head_action=none`, aucune opération sur `helius.head.tmp`) → `runCli unlock` exit 0 → `openGuardedClient` rouvre et mètre → `verifyCycleLedger` vert ; variantes : head pénultième ⇒ heal ; ligne tordue + NUL ⇒ refus ; 0 NUL ⇒ refus ; head en avance post-strip ⇒ refus. `bin/rpc-guard.mjs` : `repair_tail_is_served_by_the_bin` (`spawnSync` du bin : `REFUSED no_nul_tail` exit 1 puis `REPAIRED nul_bytes_removed=64 head_action=none` exit 0). |
| C-9 | FAIT | `reconcile.ts` lit `<op>.repair.jsonl` : `lines_after` ≥ début de fenêtre ⇒ `NO-GO repaired_in_window` avant toute borne ; la ligne `reconciled` roule la fenêtre ; ligne illisible ⇒ compte. Test `reconcile_reads_the_repair_journal_per_window` ; mutants C9a, C9b ROUGES. Consommateur humain : RUNBOOK §3.5-3.6. ADR D-FS-5 (lignes `attempted` perdues ⇒ Δ > ledger_run ⇒ NO-GO dur C-V-7). |
| C-10 | FAIT — **3 DÉPASSEMENTS DÉCLARÉS** | §7.2 : p50/p99 des 3 opérations sur ledger de taille réelle (10 866 lignes), 4 passes ; seuil déclaré (occupation du fil ≤ 10 %) ; TENU pour Bell au rythme nominal 250 ms, DÉPASSÉ pour Bell au rythme observé du r1 (2/3), Ukemi un domaine (1/3), Ukemi politesse maximale (3/3). Item I-2 ; décision de fusion : orchestrateur. |
| C-11 | FAIT | sonde mesurée win32 (§7.1) : fsync de RÉPERTOIRE `"r"` ⇒ EPERM, `"r+"` ⇒ OK ; rename sous lecteur ⇒ EPERM 452/2 000 ; lock `wx` exclusif ; CI ubuntu seul ne couvre pas win32 (déclaré ADR + RUNBOOK §2). |
| C-12 | FAIT | amendement ADR (D-FS-1..5, modèle de faute crash/alimentation/disque menteur, tuyaux, extension de périmètre « procédure manuelle → sous-commande servie » déclarée, posture C-V-8 confirmée). |
| C-13 | FAIT | MAST nommés + contre-mesures (ADR) : hypothèse d'environnement non vérifiée ×4 (mesurées), vérification incomplète (séquence + 32 mutants byIntended), dérive de périmètre (R1/R2/R11), fin prématurée (C-10 mesuré, dépassements déclarés). |

## 3. Exigence orchestrateur 22:0x UTC (rename retry) : état — FAIT
- (1) `replaceDurable` : sur `EPERM`/`EACCES`/`EBUSY` seulement, attentes synchrones `min(10·k, 100)` ms via le seam (`DURABLE_FS.sleepSync`) tant que le cumul ≤ `RENAME_MAX_WAIT_MS = 3000` (35 tentatives, 2 950 ms), puis erreur NOMMÉE `rpc-guard: rename of '<op>.head.tmp' refused 35 times over 2950 ms (<code>: another handle holds '<op>.head'; fail-closed, no in-place fallback)` (`.code` + `cause`) ; **aucun repli** `writeFileSync`.
- (2) Test DÉTERMINISTE en processus `durable_head_rename_outlasts_a_real_reader_then_fails_closed_without_fallback` : VRAI lecteur `fs.openSync(head,"r")` tenu pendant le premier rename (sous win32 le vrai rename échoue EPERM de lui-même ; sous POSIX, où renommer sur un fichier ouvert réussit, le refus est émulé tant que le lecteur est tenu) ; (a) relâché après ≥ 300 ms d'attente RÉELLE (≥ 8 attentes) ⇒ succès, cible = NOUVEAU head, `.tmp` absent, rien de perdu ; (b) jamais relâché ⇒ erreur nommée au plafond, cible = ANCIEN head INTACT, **transport NON appelé** (`fetches` inchangé), ligne write-ahead présente (sur-compte d'une requête non envoyée, côté sûr), la réouverture soigne le head et consomme l'orphelin. Précision : « ledger non avancé » vaut pour le HEAD ; la ligne `.jsonl` est durable avant le rename (ordre C-V-8) — voulu.
- (3) Mutants : « pas de retry » (M9), « retry infini » (M9c — garde de 1 000 attentes dans le test : rouge au lieu de tourner sans fin), « repli writeFileSync » (M9d, écriture en place au plafond), + « retry sur tout code » (M9b) : ROUGES par leur test nommé.
- Source orchestrateur citée : expérience `…\scratchpad\renamex\ren.mjs` (sha `7ec79ea1…`), `ren-retry.mjs` (sha `dc9610a3…`) — lus ; valeurs (4 essais / 328 ms sous lecteur de 1,2 s) = message orchestrateur, non re-mesurées par moi ; mes propres mesures : §7.1.
- Portée : dans CE lot, le seul chemin tmp+fsync+rename est `replaceDurable` (head, heal, heal de `repair-tail`). Les JSON Bell (`budget.json`, `crosscheck-*.json`) relèvent de BELL-SHORTPAGE-1 ⇒ item I-3.

## 4. Consigne standard : point par point
| Point | État | Preuve / motif |
|---|---|---|
| A-1 | fait | 1ʳᵉ ligne ; `claude-opus-5-5[1m]` |
| A-2 | fait | `mk-nm.ps1 -Tree F:\Monark-wt-gfsync1` : 220 entrées, 10 `@monark`, 0 échec ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-gfsync1\packages\rpc-guard\src\index.ts` (re-vérifié après la coupure). Retrait = `rm-nm.ps1` (acte orchestrateur à la clôture du worktree) |
| A-3 | fait | `F:\tmp\gfsync1\oracle.sh` : `$U npm run <s> > log 2>&1; echo "<s> exit=$?"` (jamais après un pipe) ; 7 gates (§5) |
| A-4 | fait | `DELIVERED.sha256` (chemins relatifs) ; rendu sous `F:\tmp\gfsync1\` ; 0 commit ; rien écrit sur C: ; 0 réseau (fetch bouchonné, clé factice `FAKEKEY-9z9z9z` du paquet, hôte `example.invalid`) ; sources externes lues sur COPIES LOCALES sha-identifiées |
| A-5 | fait | §8 : pathspec extrait VERBATIM de `ci.yml:65` par `sed` (`F:\tmp\gfsync1\r25.sh`), index TEMPORAIRE (l'index du worktree n'est pas touché) |
| A-6 | fait | §8 : 9 gelés AVANT/APRÈS (blob HEAD et arbre), identiques à la table ADR-U4b ; aucun fichier du gel U-4b touché |
| A-7 | fait | tout oracle/test/mutant/banc/sonde sous `env -u` des 8 clés (harnais : `childEnv()` les retire) ; aucune variable affichée |
| A-8 | fait | ledger PRODUIT par le vrai client dans un vrai processus enfant + signature octet de l'incident ; rejeu sur copies des sauvegardes RÉELLES des deux coupures (§7.4) |
| A-9 | n-a | aucune phrase SERVIE au public touchée ; les sorties du lot sont des verdicts CLI fermés (`REPAIRED …`, `REFUSED <jeton>`, `NO-GO repaired_in_window`) ; `gate:vocab` exit 0 |
| A-10 | fait (CLI) | aucune surface publique ; liage de sortie du bin : `repair_tail_is_served_by_the_bin` asserte le stdout EXACT du bin servi (`REFUSED no_nul_tail\n`, `REPAIRED nul_bytes_removed=64 head_action=none\n`) et son code de sortie |
| A-11 | fait | `mutants.mjs` : `--test-reporter=tap`, CRLF normalisé, tué ⇔ rouge ET `not ok … - <tueur attendu>` ET restauré par sha |
| A-12 | fait | en-têtes (sha d'arbre, node, plateforme, commande, date) sur sondes, bancs, rejeu, mutants ; par mutant : diff, sha muté, sha restauré |
| B-1..B-3 | n-a | aucun corps de réponse d'opérateur payant, aucune expurgation touchée (`transport.ts` intact) |
| B-4 | fait | aucune lecture d'env ajoutée ; `--cycle/--op/--reason` REQUIS sans défaut (`need()`) |
| B-5 | fait | le grep CI `fetch_only_inside_client` couvre `packages/*/src` (dont `repair.ts`) : vert dans l'oracle (aucun `fetch(`, `child_process`, lecture de clé dans les sources ; le test enfant vit sous `test/`, hors portée par construction du grep) |
| B-6 | n-a | aucun hôte ajouté |
| C-1 | fait | aucune classe d'erreur nouvelle ; `LockHeldError` réutilisée ; l'échec du rename est une `Error` fs (code + cause), pas une erreur RPC |
| C-2 | fait | un refus de budget n'est jamais réessayé : le seul retry ajouté est celui du `rename` fs sur EPERM/EACCES/EBUSY, sous `replaceDurable`, jamais autour d'un appel |
| C-3 | fait | une seule couche de retry RPC (appelant) inchangée |
| C-4 | n-a | classifieurs non touchés |
| D-1 | fait | 32 mutants, chacun avec son test tueur NOMMÉ (§6) ; chaque test nouveau a au moins un mutant qui le rougit |
| D-2 | fait | vecteurs non vides ; listes FERMÉES de clés (ligne de ledger 7 clés ; record de réparation 13 clés) ; valeurs recalculées (sha des octets, `lines_after`, `head_after`) |
| D-3 | fait | composition bout en bout non-LLM : écrivain réel (processus enfant) → coupure simulée par octets → `repair-tail` → `unlock` → `openGuardedClient` ; seul `globalThis.fetch` bouchonné (le seam fs y est un OBSERVATEUR qui délègue au vrai fs ; l'injection de faute n'est utilisée que dans les tests unitaires de retry) ; `built` inchangé (`upcoming`) |
| D-4 | fait | diff des tests : AJOUTS seulement (`harness.ts` +helpers ; 2 fichiers neufs) ; aucune assertion existante modifiée ni affaiblie |
| E-1 | fait | verrou `wx` inchangé ; verrou périmé détectable (pid mort) et récupérable (`repair-tail` puis `unlock`) ; `writer_alive` si vivant |
| E-2 | fait | `ensureCycleDir` intact ; `repair-tail` ne crée aucun dossier (`ledger_absent`) |
| E-3 | fait | backoff du rename déclaré avec sa valeur (`min(10·k,100)` ms, plafond 3 000 ms) dans l'amendement ADR |
| F-1 | fait | table des tuyaux par pièce dans l'amendement ; aucun renvoi `F:\tmp` dans l'ADR (grep : 0) ; résidus nommés avec déclencheur |
| F-2 | fait | sources ASCII (grep non-ASCII : 0 sur `src/`, `test/`, bin) ; `gate:vocab` propre ; aucune clé réelle |
| F-3 | fait | déviations D-1..D-7 (§9) ; advisor consulté (conception ; rendu) |
| G-1 | fait | pièce non publique (`@monark/rpc-guard` `upcoming`, décision 129 citée dans l'ADR : `built` conditionné par la gate reconcile séparée) ; aucun registre public touché |

## 5. Oracle complet (A-3, env -u des 8 clés)
- **Base** (arbre intact, 21:26Z, `oracle/base-*.log`) : 7 gates exit 0 ; tests 933 / pass 931 / fail 0 / skip 2 (nommés, D-5) ; `duration_ms` 50 312 ; ratchet 69/69.
- **Final n°1** (22:11Z, 10 fichiers modifiés, `oracle/final-*.log`) : gate:vocab 0, typecheck 0, **test 1**, lint 0, lint:ratchet 0 (69/69), lang:gate 0, export:check 0 ; tests 947 / pass 944 / **fail 1** / skip 2 ; `duration_ms` **373 619**. Échec : `no_cash_cross_provider_name_in_export` (décision 69) — mon test EXPORTÉ `packages/rpc-guard/test/repair-tail.test.ts:16` écrivait en clair le nom de variable de clé du fournisseur de cash croisé (liste des 8 clés retirées de l'env des processus enfants). `error_origin` : worker G1. Correctif : filtrage par MOTIF (`/_API_KEY$|^CHAINSTACK_\w+_URL$/`), aucun nom de fournisseur écrit, les 8 clés A-7 toujours retirées ; vérifié : `test/no-cash-provider-name.test.ts` + `repair-tail.test.ts` 10/10.
- **Final n°2** (après correctif, 22:18:57Z, `oracle/final2-*.log`) : **7/7 gates exit 0** ; tests **947 / pass 945 / fail 0 / skip 2** (les 2 skips nommés pré-existants, D-5) ; `duration_ms` 408 932 ; ratchet 69/69 ; `export:check` « 0 forbidden path, 0 non-exempt French hit ».
- **Final n°3 — RÉFÉRENCE** (état final = `DELIVERED.sha256`, 23:25:30Z, `oracle/final3-*.log`, `dirty_files=10`) : **gate:vocab 0, typecheck 0, test 0, lint 0, lint:ratchet 0 (69/69), lang:gate 0, export:check 0** ; tests **948 / pass 946 / fail 0 / skip 2** (= base 933 + 15 nouveaux ; skips : `sentinel_run_releases_chainstack_lock_on_sigterm` win32, `u4b_labels_replay_via_main_real_artifact` artefacts e2 absents du worktree — tous deux pré-existants, D-5) ; `duration_ms` 388 412 ; `gate:vocab` « 223 file(s), no forbidden claim » ; `export:check` « 0 forbidden path, 0 non-exempt French hit » ; `lang:gate` « 0 non-exempt French hit ».
- **Durée de la suite** : 373,6 s contre 50,3 s à la base (×7,4) — voir §8.1 (tests Ukemi « full-book » : des milliers d'appends à ~10 ms). Risque CI déclaré (item I-10).

## 6. Mutants (A-11 byIntended, A-12)
Harnais `F:\tmp\gfsync1\mutants.mjs` ; exécution de référence sur l'ÉTAT FINAL : `mutants-final2.log` (23:24:00Z ; pré-sha `ledger.ts` `625c759f…`, `lock.ts` `6655a9c8…`, `repair.ts` `e997c6fd…`, `cli.ts` `dccbe95f…`, `reconcile.ts` `e42de49c…` ; post == pré ; garde d'interruption vide) : **32/32 KILLED par leur test NOMMÉ, restaurés octet pour octet**, exit 0. (Exécutions antérieures, code intermédiaire : 24/24 `mutants.log`, 26/26 `mutants-final.log`.)

| Mutant | Fichier | Test tueur (byIntended) |
|---|---|---|
| M1a durable write sans fsync | ledger | `durable_append_writes_the_line_then_the_head_in_order` |
| M1b ligne appendée sans fsync (comportement pré-lot) | ledger | idem |
| M2 fsync avant write | ledger | idem |
| M3 head avant ligne | ledger | idem |
| M4 rename avant fsync du tmp (fsync du fichier final après rename) | ledger | idem |
| M5 heal non durable (en place, sans fsync) | ledger | `durable_heal_of_a_head_one_behind_is_tmp_fsync_rename` |
| M6 head écrit en place | ledger | `durable_append_…` |
| M7 lock non fsyncé | lock | `durable_append_…` |
| M8 orphelin `.tmp` non supprimé | ledger | `durable_orphan_head_tmp_is_removed_once_the_pair_verifies` |
| M8b orphelin supprimé AVANT les contrôles (effet de bord sur refus) | ledger | idem |
| M9 pas de retry du rename | ledger | `durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff` |
| M9b retry sur tout code | ledger | idem |
| M9c retry infini | ledger | `durable_head_rename_outlasts_a_real_reader_then_fails_closed_without_fallback` |
| M9d repli en place au plafond | ledger | idem |
| B1 tête reculée / ligne abandonnée | ledger | `durable_head_one_entry_behind_advances_to_the_last_durable_entry_never_back_never_double_counted` |
| B2 prior double-compté | ledger | idem |
| B3 ligne ré-appendée | ledger | idem |
| R1 head en avance réécrit (C-1) | repair | `repair_tail_refuses_a_head_ahead_or_nul_filled_and_changes_no_byte` |
| R2 ligne tordue acceptée | repair | `repair_tail_refuses_torn_or_clean_or_inner_nul_tails` |
| R3 0 NUL accepté | repair | idem |
| R4 garde `.bak` retirée | repair | `repair_tail_never_overwrites_evidence_and_refuses_head_absent` |
| R4b `.bak` ouvert `w` au lieu de `wx` | repair | `repair_tail_heals_a_head_one_behind_after_the_strip` (séquence) |
| R5 écrivain vivant non contrôlé | repair | `repair_tail_refuses_a_live_writer_or_an_unreadable_lock` |
| R5b EPERM lu comme « mort » | repair | idem |
| R6 head absent non refusé | repair | `repair_tail_never_overwrites_evidence_and_refuses_head_absent` |
| R7 verrou non pris s'il est absent | repair | `repair_tail_without_lock_takes_and_releases_it` |
| R7b verrou non relâché | repair | idem |
| R9 troncature non fsyncée | repair | `repair_tail_heals_a_head_one_behind_after_the_strip` |
| R11 retire plus que des NUL (le `\n` final) | repair | `repair_tail_composition_power_cut_signature_to_unlock_and_reopen` |
| CLI1 `repair-tail` non dispatché | cli | `repair_tail_is_served_by_the_bin` |
| C9a reconcile ignore le journal de réparation | reconcile | `reconcile_reads_the_repair_journal_per_window` |
| C9b fenêtre ignorée (drapeau permanent) | reconcile | idem |

Garde redondante déclarée (non comptée comme couverture) : aucune — R4b (le `wx`) est tué par l'assertion de SÉQUENCE (`open:wx:…`) bien que le pré-contrôle `bak_exists` le masque fonctionnellement.

## 7. Mesures
### 7.1 Sondes win32 (C-11) — `F:\tmp\gfsync1\probes\*.log` (en-têtes A-12 : tree `66f75c2`, node v24.15.0, win32)
- P1 `openSync(dir,"r")` ⇒ fd, fsync ⇒ **EPERM** ; `openSync(dir,"r+")` ⇒ fd, fsync ⇒ **OK** ; Q1 fsync de répertoire `"r+"` N=500 : p50 0,105 ms, p99 0,170 ms.
- P2 open(`a`)+write+fsync+close OK ; fsync après close ⇒ EBADF.
- P3 tmp+fsync+rename ×2 000 SANS retry sous lecteur concurrent (processus enfant, `readFileSync` en boucle) : **1 548 OK / 452 EPERM** ; lecteur : 153 714 lectures, 0 déchirée/vide.
- Q2 même banc AVEC retry 20×5 ms : 0/2 000 échec (histogramme de reprises 0:1751, 1:189, 2:40, 3:14, 4:4, 5:2) ; 50×2 ms : 0/2 000.
- P4 lock `wx` + write + fsync OK ; 2ᵉ `wx` ⇒ EEXIST.
- P5/flush : `appendFileSync(str)` p50 0,051 ms ; `appendFileSync(str,{flush:true})` 1,246 ms ; `{encoding:"utf8",flush:true}` p50 **0,064 ms** (flush ignoré : chemin rapide C++ `binding.writeFileUtf8`, lu dans `fs.writeFileSync.toString()`) vs `{flush:true}` sans encodage 1,358 ms.
- P6/pid : `kill(self,0)` true ; `kill(enfant sorti,0)` ESRCH ; `kill(4,0)` EPERM.
- P7 `"\0\0".trim()===""` ⇒ false ; `JSON.parse("\0")` ⇒ SyntaxError (cause de `malformed` avant réparation).

### 7.2 Coût C-10 — `F:\tmp\gfsync1\bench\bench-final-f{1..4}.log`
**Sha du code benché (R-21)** : les passes f1-f4 (22:06-22:09Z) ont tourné sur `ledger.ts` `399a6166…` (pré-sha du harnais `mutants-final.log`, 22:04Z) ; le livré est `625c759f…`. Écart = la docstring de `replaceDurable` seule (citation FAITS, 5+/3−) : `F:\tmp\gfsync1\recon\recon.mjs` restaure l'ancienne docstring sur une COPIE du livré et obtient exactement `399a6166…` (`recon.log` : MATCH) ; `git diff --no-index recon/ledger.benched.ts <livré>` ne montre que ces lignes de commentaire. Machine partagée : autres agents en vol ; l'état du tirage Bell pendant les bancs n'a PAS été vérifié par moi.
Voir l'amendement ADR §« Coût mesuré (C-10) » (table complète). Résumé code final, 2 000 appends sur ledger de 10 866 lignes : total p50 8,6-10,1 ms ; moyenne 14,2 / 18,4 / 24,4 ms (f1, f2, f4 ; f3 contaminée par mes propres gates, écartée) ; p99 122-422 ms ; max ≤ 1,9 s ; phases p50 : ligne 2,7-2,9, head.tmp 5,3-5,7 (création de fichier), rename 0,35-0,44 ; pré-lot moyenne 0,22-0,33 ms ; ouverture 52-73 ms. Seuil déclaré : moyenne ≤ 10 % de l'intervalle nominal. **Verdicts : Bell nominal 250 ms TENU ; Bell rythme r1 observé (170,8 ms/appel) DÉPASSÉ 2/3 ; Ukemi un domaine (200 ms) DÉPASSÉ 1/3 ; Ukemi politesse maximale (40 ms agrégé) DÉPASSÉ 3/3.** Passes antérieures (variante de retry 20×5 ms, même chemin sans contention) : moyenne 13,0 / 24,8 / 24,5 ms.

### 7.3 Seconde coupure — faits revérifiés par moi sur la sauvegarde orchestrateur `F:\course-bell\go1\powercut-2026-09-22-b\` (`sha256sum -c` 7/7 OK ; coupure n°1 : 6/6 OK)
`helius.jsonl.bak` 3 665 204 o, sha `6ff0e269…`, 13 776 NUL terminaux ; `helius.head.bak` = 64 octets NUL (pas « vide » : taille durable, données jamais écrites — réécriture en place pré-lot) ; `repair-report.json` : 10 866 lignes, dernière entrée `3450f18e…`.

### 7.4 Rejeu en forme RÉELLE (A-8) — `F:\tmp\gfsync1\replay\replay.log`
`repair-tail` LIVRÉ sur copies des sauvegardes (jamais sur les originaux) : coupure n°1 `helius` (3 389 883 o, sha `09124f17…`, 211 008 NUL, head `ef556085…` en avance) ⇒ `REFUSED tail_truncation` ; coupure n°2 `helius` (13 776 NUL, head 64 NUL) ⇒ `REFUSED tail_truncation` ; `solana-foundation` (0 NUL) ⇒ `REFUSED no_nul_tail` ×2 ; fichiers inchangés ×4. Conforme au ruling C-1 : ledgers pré-lot ⇒ RUNBOOK §4.

## 8. R-25 (A-5), invariants (A-6), résolution (A-2)
- **A-6** (`F:\tmp\gfsync1\a6.sh`, `git show HEAD:<f> | tr -d '\r' | sha256sum` ET arbre de travail) : AVANT (`a6-before.txt`, 21:25:48Z) == APRÈS (`a6-after.txt`) — 9/9 `SAME`, valeurs = table ADR-U4b (`2f9a31f6` `a5e66cd3` `5733daeb` `7bee76fc` `3376eb08` `9206df91` `0e232519` `3603265d` `cb020425`).
- **A-2** : `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-gfsync1\packages\rpc-guard\src\index.ts`.
- **R-25** (`F:\tmp\gfsync1\r25.sh` → `r25-final.log` ; pathspec extrait VERBATIM de `ci.yml:65` ; base `66f75c2` ; fichiers non suivis inclus via un index TEMPORAIRE) : **9 fichiers, 612 insertions + 18 suppressions = 630** (docs exclus par le pathspec : `docs/RUNBOOK-rpc-guard.md` non compté). Détail : bin 2/1, cli 3/0, ledger 69/7, lock 5/4, reconcile 22/3, repair 75/0, durable.test 174/0, harness 24/3, repair-tail.test 238/0. **Au-dessus de la cible mission (< 600) de 30 lignes ; sous le seuil STOP A-5 (1 150) et la borne CI (1 205)** ⇒ déviation D-8 (§9). Mesure antérieure aux deux exigences ajoutées en cours de lot : 544 (`r25-1.log`).
- **DELIVERED** : `F:\tmp\gfsync1\DELIVERED.sha256` (10 fichiers, chemins relatifs au worktree ; sha identiques à ceux de l'oracle n°3 et du harnais : `ledger.ts` `625c759f…`, `repair.ts` `e997c6fd…`, `reconcile.ts` `e42de49c…`, `cli.ts` `dccbe95f…`, `lock.ts` `6655a9c8…`).

### 8.2 Nombre d'appends par test lent (mesure I-10, `probes/seam-count.log`, préchargement `--import` comptant le seam, test lancé seul, 23:33-23:35Z)
| Test (`apps/sentinel/test/ukemi-guard-record.test.ts`) | appends (`open[a]`) | fsync | temps fsync / durée du test |
|---|---|---|---|
| `ukemi_record_journal_maps_paid_5xx_to_http_and_keyless_rpc_to_code` | 2 945 | 5 896 | 44,2 s / 49,5 s |
| `ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go` | 2 942 | 5 890 | 56,5 s / 63,1 s |
| `ukemi_record_then_unlock_then_reconcile_end_to_end` | 1 475 | 2 957 | 15,6 s / 18,2 s |
Projection (formule, pas une mesure CI) : durée ≈ n_appends × 2 × t_fsync(runner). Plafond par test 120 s ⇒ t_fsync(runner) ≤ ~20 ms pour le test le plus lourd ; au-delà, rouge CI. t_fsync des runners ubuntu : NON mesuré (décision 136).

### 8.1 Effet mesuré sur la durée de la suite de tests (constat en cours d'oracle, 22:14 UTC)
Les tests qui font des milliers d'appends par `@monark/rpc-guard` paient le fsync réel : `ukemi_record_journal_maps_paid_5xx_to_http_and_keyless_rpc_to_code` 86,4 s, `ukemi_record_then_unlock_then_reconcile_end_to_end` 39,9 s, `ukemi_record_finally_unlocks_each_operator_under_its_own_cycle` 22,4 s, `ukemi_record_resume_hits_cost_zero_ru` 17,2 s, `sentinel_chainstack_caps_cover_the_g0_m7_stress_bound` 13,1 s — tous < 3 s à la base. Limite par test : 120 s (`package.json` `--test-timeout=120000`) ; la CI (`g3-verification`, `timeout-minutes: 10`, ubuntu) n'est pas mesurée ici. Voir §5 pour le total. Oracle n°3 (référence), tests les plus longs : **Test 42 `export_public_no_governance_no_french`** (`test/export-public.test.ts:115`) : 380,6 s à l'oracle n°3 contre 37,9 s à la base — ce test SYNCHRONE lance la CI du miroir exporté en imbriqué (`spawnSync("npm run ci", { timeout: 600_000 })`, `:293-308`), qui ré-exécute les tests Ukemi lourds (exportés : `apps/sentinel` n'exclut pas `ukemi-guard-record.test.ts`) ; le plafond de 120 s par test ne l'interrompt pas (test synchrone), son plafond effectif est celui du `spawnSync` imbriqué (600 s, 63 % consommés ici) ; en CI, le job `g3-verification` entier est plafonné à 10 min. Puis `ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go` 86,6 s, `ukemi_record_journal_maps_paid_5xx_to_http_and_keyless_rpc_to_code` 64,6 s, `ukemi_record_then_unlock_then_reconcile_end_to_end` 30,3 s.

## 9. Déviations déclarées (F-3)
- **D-1 — seam `fs`** : objet mutable module-level `DURABLE_FS` (calque du `DURABLE_FS` Bell de BELL-SHORTPAGE-1, même ruling C-6) plutôt qu'un paramètre `deps` : C-8 exige le VRAI `openGuardedClient`/`runCli`, et une injection de `fs` dans la signature PUBLIQUE permettrait à un appelant de désactiver la durabilité (C-V-2). Non exporté (set fermé intact) ; atteint par import relatif dans les tests, restauré en `finally`.
- **D-2 — livrable 2 de la mission supplanté par le cp-1** : « exige un `.bak` préalable (refus sinon) » ⇒ l'outil CRÉE le `.bak` et refuse s'il existe (C-3) ; « head avancé ⇒ réécrit » ⇒ REFUSÉ (C-1, ruling orchestrateur).
- **D-3 — prémisse de mission falsifiée par mesure** : « fsync du RÉPERTOIRE non disponible sous Windows » ⇒ disponible avec `"r+"` (P1/Q1) ; effet de durabilité non vérifié ; non implémenté (avis advisor : branche plateforme non exercée par la CI) ⇒ item I-1.
- **D-4 — C-8 littéral** : « `openGuardedClient` jette `/malformed/` » inatteignable verrou tenu (voir C-6) ; asserté sur `runCli unlock` + `openOperatorLedger` + `LockHeldError`.
- **D-5 — comptes de tests** : la mission attend « 933+n / 0 / 1 skip nommé » ; sur CE worktree la base mesure 933 / 931 / 0 / **2 skips** pré-existants et nommés (`sentinel_run_releases_chainstack_lock_on_sigterm` win32 ; `u4b_labels_replay_via_main_real_artifact` : artefacts e2 gitignorés absents du worktree). Sur l'arbre principal `F:\Monark` le second s'exécute (G7 NARABI-OPS-1d : 933/932/0/1). **Nouveau skip CONDITIONNEL déclaré** : `repair_tail_is_served_by_the_bin` saute si `bin/` est absent — c'est le cas sur le MIROIR PUBLIC (`PACKAGE_SUBPATHS = [src, test, package.json, README.md]`, `scripts/export-public.mjs:36`), même motif que `ledger_format_locked_to_rebase_crosscheck` ; dans le dépôt et sur ce worktree il S'EXÉCUTE (0 effet sur 948/946/0/2).
- **D-6 — nommage** : `openCycleLedger` (mission, INCIDENT) = `openOperatorLedger` (code).
- **D-7 — C-10** : trois verdicts DÉPASSÉ ⇒ item I-2, décision de fusion renvoyée à l'orchestrateur (aucun contournement).
- **D-8 — R-25 = 630 > 600 (cible mission)**, sous le seuil STOP 1 150. Cause : deux exigences orchestrateur postérieures au plan — retry borné du rename avec test DÉTERMINISTE à vrai lecteur (22:0x UTC) et test « tête en retard d'une entrée » (22:2x UTC) : 544 → 630 (+86, dont `durable.test.ts` 101 → 174). Aucune compaction cosmétique des tests (ce serait jouer la métrique) ni aucune assertion retirée (D-4). Découpe possible si l'orchestrateur l'exige : aucune sans séparer un test de son code (le seam pré-déclarable serait `repair.ts` + `repair-tail.test.ts` + C-9 en second lot, ~335 lignes) — non retenue par le worker, décision orchestrateur.

## 10. Items formés (zéro dette nue) — détail et sources dans l'amendement ADR
I-1 fsync du répertoire parent ; I-2 coût au-delà du seuil (group commit / sidecar à emplacements alternés — vise le poste dominant mesuré, la création du `head.tmp` — / accepter) ; I-3 exigence rename pour le sink Bell (BELL-SHORTPAGE-1) ; I-4 RUNBOOK course Ukemi §0.6 (sha attendus du bin, gel d'outillage étapes 1→6 : fusion hors fenêtre) ; I-5 prereg U-4b §5c (nouveau motif `repaired_in_window`, D-n au PLI s'il survient) ; I-6 INCIDENT : consigner la coupure n°2 ; I-7 demandes de lecture RQ-1..RQ-6 ; I-8 pid réutilisé (sens sûr) ; I-9 test de séquence vs antivirus (échec parasite local possible) ; **I-10 durée de la suite (×7,4) et des oracles de TOUS les lots en vol (~1 min → 6+ min), test le plus lent 86,6 s pour un plafond de 120 s, test 42 380,6 s (CI exportée imbriquée, plafond `spawnSync` 600 s), CI ubuntu non mesurée (décision 136) — options (i) neutraliser le flush dans les seuls tests lourds d'`apps/sentinel/test` via le seam (ruling orchestrateur, hors lot), (ii) relever les plafonds (gouvernance), (iii) accepter ; mesure jointe §8.2.**

## 11. Couplages déclarés
- Fermeture d'exécution : `ledger.ts`, `lock.ts`, `reconcile.ts`, `cli.ts` sont chargés par le recorder Ukemi (`record.ts` → `@monark/rpc-guard`), par Bell (`collect.ts`, `universe-cli.ts`), par le sentinel (`run.ts`), et, dans sa branche payante `--archive-operator` seulement, par le labeler gelé `u3-realized.mjs` (import dynamique ; la ligne de course figée est keyless-only). Aucun des 9 gelés n'est modifié (§8).
- Le tirage Bell en cours tourne sur `F:\Monark` (code chargé en mémoire) : non affecté par ce worktree ; fusion visée à une frontière ancrée (avant `mint_start-NVDAx`), sous réserve de la décision C-10/I-2.

## 12. Journal d'avancement (horodaté UTC)
- 21:0x-21:30 orientation, sondes P1-P7/Q1-Q2/flush, advisor (conception), oracle de base (933/931/0/2, 7 gates exit 0), code ledger/lock/repair/cli/reconcile.
- ~21:37 seconde coupure (processus tué) ; reprise : intégrité vérifiée.
- 21:4x-22:0x tests (14), mutants 24/24 puis exigence retry ⇒ code + tests + mutants 26/26 (code final), rejeu réel, bancs C-10 (7 passes), RUNBOOK, amendement ADR.
- 22:1x oracle final lancé ; rendu progressif ouvert.
- 22:1x oracle n°1 : 1 échec (`no_cash_cross_provider_name_in_export`, mon test exporté) ⇒ correctif par motif ; oracle n°2 : 7/7 exit 0, 947/945/0/2.
- 22:2x advisor consulté AVANT le rendu (recommandations appliquées : RUNBOOK §2 corrigé, I-10 formé, poste dominant `head.tmp` écrit dans l'ADR, harnais rejoué en entier, `seam-count` à mesurer).
- 22:2x FAITS orchestrateur `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md` (commit `7cdfb7c`, sha `9fb5b07c…`) intégré : commentaire `replaceDurable`, RUNBOOK §2, ADR D-FS-2 et résidu (« ancien OU nouveau fichier complet, jamais déchiré ; persistance du renommage NON garantie » — aucune hypothèse de journalisation NTFS écrite comme un fait) ; test « tête en retard d'une entrée » ajouté (6/6 verts).
- ~22:3x → 23:22 UTC : **interruption de session (limite 429)**. Reprise 23:2x : `git status` + sha + 0 NUL sur les 10 fichiers ; toutes les éditions antérieures présentes (citation FAITS coupée sur deux lignes ⇒ remise sur une ligne) ; ajout des mutants B1/B2/B3 ; harnais complet (32) relancé sur l'état final.
- 23:24 harnais final : 32/32 tués par leur test nommé, restaurés (post == pré). 23:25 oracle n°3 : 7/7 exit 0, 948/946/0/2. R-25 final 630 (D-8). 23:33-23:35 `seam-count` (I-10). A-6 final 9/9 identique. `DELIVERED.sha256` 10/10 `sha256sum -c` OK. Aucune écriture dans le worktree après l'oracle n°3 (sha de `DELIVERED.sha256` == sha de l'oracle n°3 et du harnais).
- Clôture : contrôle final de l'advisor — 5 finitions rendu/ADR, aucune bloquante, appliquées (sha du code benché prouvé par reconstruction ; formulation « machine partagée » ; identités RQ citées de mémoire ; skip conditionnel du test du bin sur le miroir ; cette ligne). Aucune écriture dans le worktree depuis l'oracle n°3.
