# G1 — lot GARDE-FSYNC-1 (fsync du ledger de cycle rpc-guard, repair-tail servi, rename-retry) — worker Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# Rendu G1 — lot GARDE-FSYNC-1 (fsync du ledger de cycle `@monark/rpc-guard` + `repair-tail` servi)

Tout est écrit, fsyncé et haché. Aucun commit (R-20) : worktree `F:\Monark-wt-gfsync1`, branche `lot/garde-fsync-1`, HEAD `66f75c2`, 10 fichiers modifiés ou nouveaux. Ma session a été coupée deux fois : par la coupure de courant de ~21:37 UTC, puis par la limite de session (reprise 23:2x). À chaque reprise, j'ai vérifié sur disque : 0 octet NUL et toutes mes éditions présentes.

## Livrables (sha256)
| Fichier | sha256 |
|---|---|
| `F:\tmp\gfsync1\G1.md` (rendu complet) | `592bf378…` |
| `F:\tmp\gfsync1\ADR-amendement.md` (amendement proposé à ADR-GARDE-HELIUS) | `600501e6…` |
| `F:\tmp\gfsync1\DELIVERED.sha256` (10 fichiers, `sha256sum -c` 10/10 OK) | `72686d41…` |
| `F:\tmp\gfsync1\mutants.mjs` | `b9cffe68…` |
| `F:\Monark-wt-gfsync1\docs\RUNBOOK-rpc-guard.md` | `7ab57190…` |

Fichiers du worktree :
- **Code :** `ledger.ts` `625c759f…`, `lock.ts` `6655a9c8…`, `repair.ts` (nouveau) `e997c6fd…`, `cli.ts` `dccbe95f…`, `reconcile.ts` `e42de49c…`, `bin/rpc-guard.mjs` (commentaire seul).
- **Tests :** `harness.ts`, `durable.test.ts` (nouveau, 6 tests), `repair-tail.test.ts` (nouveau, 9 tests).

## Résultats
- **Oracle final** (sur les octets de `DELIVERED.sha256`, 8 clés payantes retirées) : les 7 gates sortent à 0. 948 tests : 946 réussis, 0 échec, 2 ignorés. Les 2 tests ignorés existaient déjà : le test SIGTERM ne tourne pas sous win32, et les artefacts e2 manquent dans le worktree. La base en avait déjà 2 (D-5).
- **Mutants :** 32 sur 32 rougis par leur test nommé, fichiers restaurés octet pour octet.
- **Les 9 fichiers gelés** (ADR-U4b) sont identiques avant et après.
- **R-25 = 630**, au-dessus de la cible de 600 (voir D-8).
- **Rejeu sur copies des vraies sauvegardes** des deux coupures : l'outil refuse `helius` deux fois (`REFUSED tail_truncation`, head en avance puis head de 64 octets NUL) sans modifier un seul octet. La règle C-1 tient sur les cas réels.

## Corrections cp-1 C-1..C-13 : état
| # | État | Preuve |
|---|---|---|
| C-1 | FAIT | Après retrait des NUL : head = recalculé ⇒ `none` ; head = pénultième ⇒ `heal_penultimate` ; tout autre cas ⇒ `REFUSED tail_truncation`. Aucun autre moyen de réécrire le head. Test `repair_tail_refuses_a_head_ahead_or_nul_filled_and_changes_no_byte` et mutant R1 rouge. |
| C-2 | FAIT | Refus `no_nul_tail`, `torn_tail`, `malformed_line`, `writer_alive` (`kill(pid,0)` : succès ou EPERM ⇒ vivant ; mesuré `kill(4,0)` = EPERM), `lock_unreadable`. Sans `.lock`, l'outil le prend puis le relâche (déclaré, testé). Mutants R2, R3, R5, R5b, R7, R7b rouges. |
| C-3 | FAIT | L'outil crée lui-même `.jsonl.bak` et `.head.bak` (ouverture exclusive `wx`, fsyncés avant la troncature) ; `bak_exists` si l'un existe déjà. Enregistrement fermé de 13 clés, valeurs recalculées dans le test. Mutants R4 et R4b rouges. |
| C-4 | FAIT | Le heal passe par tmp + fsync + rename. Un `.head.tmp` orphelin est supprimé seulement après vérification de la paire. Mutants M5, M8, M8b rouges. |
| C-5 | FAIT | Head absent : refus maintenu, à l'ouverture et dans `repair-tail`. Mutant R6 rouge. |
| C-6 | FAIT + précision | `/malformed/` est vérifié sur `runCli unlock` et sur `openOperatorLedger`. Verrou tenu, `openGuardedClient` jette `LockHeldError` avant d'ouvrir le ledger (`guarded.ts:43` puis `:53`) : c'est ce qui est vérifié. |
| C-7 | FAIT | Le `fs` injecté journalise la séquence des opérations. Mutants d'ordre M1a, M1b, M2, M3, M4, M5, M6 rouges. Aucun export ni aucune valeur d'`Outcome` ajoutés. |
| C-8 | FAIT | L'écrivain est un vrai processus enfant qui meurt verrou tenu. Enchaînement : NUL ajoutés ⇒ `/malformed/` ⇒ `repair-tail` ⇒ `unlock` exit 0 ⇒ réouverture ⇒ `verifyCycleLedger` vert. Toutes les variantes demandées sont couvertes, et le bin est testé par `spawnSync`. |
| C-9 | FAIT | `reconcile` lit `<op>.repair.jsonl` : une réparation dans la fenêtre donne `NO-GO repaired_in_window`, et la ligne `reconciled` ferme la fenêtre. Mutants C9a et C9b rouges. RUNBOOK §3.5-3.6. |
| C-10 | FAIT, 3 dépassements déclarés | Seuil : moyenne ≤ 10 % de l'intervalle nominal entre appels. Bell à 250 ms : tenu. Dépassé pour Bell au rythme observé du r1 (2 passes sur 3), Ukemi un domaine (1/3), Ukemi à politesse maximale (3/3). Le poste dominant est la création du `head.tmp` à chaque append. Item I-2. |
| C-11 | FAIT | Sondes mesurées sous win32 : fsync de répertoire `"r"` ⇒ EPERM, `"r+"` ⇒ OK ; rename sous lecteur ⇒ 452 EPERM sur 2 000 ; verrou `wx` exclusif. La CI ubuntu ne couvre pas win32 (déclaré). |
| C-12 | FAIT | Amendement ADR D-FS-1..5 : modèle de faute, tuyaux, passage « procédure manuelle ⇒ sous-commande servie » déclaré, posture C-V-8 confirmée. |
| C-13 | FAIT | Quatre modes MAST nommés avec leur contre-mesure. |

## Exigences ajoutées par l'orchestrateur
- **Retry borné du rename : FAIT.**
  - Sur EPERM, EACCES ou EBUSY, attente de `min(10·k, 100)` ms jusqu'à 3 000 ms cumulées (35 tentatives), puis erreur nommée. Jamais de réécriture en place.
  - Test déterministe avec un vrai lecteur `openSync(head,"r")` :
    - lecteur relâché ⇒ succès, nouveau head, `.tmp` absent ;
    - lecteur jamais relâché ⇒ erreur au plafond, ancien head intact, transport non appelé.
  - Mutants M9, M9b, M9c (retry infini) et M9d (repli en place) rouges.
- **Head en retard d'une entrée : FAIT.** Le head avance vers la dernière entrée durable, jamais en arrière, sans double compte (prior = 1 + 10 + 100). Mutants B1 (tête reculée), B2 (double compte) et B3 (ligne ré-appendée) rouges.
- **FAITS `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md` cité** dans le code, le RUNBOOK §2 et l'ADR. Formulation retenue : « ancien OU nouveau fichier complet, jamais déchiré ; persistance du renommage NON garantie ». Je n'écris nulle part que NTFS journalise les métadonnées.

## Trois décisions de fusion qui vous reviennent
1. **Coût C-10 (I-2) :** trois dépassements du seuil déclaré.
2. **Durée des tests (I-10) :**
   - suite complète ×7,4 à ×8,1 (388 s contre 50 s) ;
   - le test le plus lourd prend 86,6 s pour un plafond de 120 s ; il fait 2 945 appends, et le fsync occupe 44 à 57 s de sa durée ;
   - le test 42 (`export_public_no_governance_no_french`) passe de 37,9 s à 380,6 s : il est synchrone (le plafond de 120 s ne l'arrête pas) et relance en imbriqué la CI exportée, plafonnée à 600 s ;
   - la vitesse du fsync sur les runners CI n'est pas mesurée (décision 136).
3. **R-25 = 630 (D-8).**

## Déviations déclarées
- **D-1 :** le `fs` est injecté par un objet interne non exporté plutôt que par un paramètre `deps`. Un paramètre sur l'API publique aurait permis de désactiver la durabilité.
- **D-2 :** deux points de la mission sont remplacés par le cp-1 : le `.bak` est créé par l'outil (C-3), et un head en avance est refusé (C-1).
- **D-3 :** la mission disait le fsync de répertoire indisponible sous Windows ; il fonctionne avec `"r+"`. Je ne l'ai pas implémenté (item I-1).
- **D-4 :** la lettre de C-8 est inatteignable verrou tenu (voir C-6).
- **D-5 :** 2 tests ignorés, pré-existants. Nouveau : `repair_tail_is_served_by_the_bin` sera ignoré sur le miroir public, où `bin/` n'est pas exporté.
- **D-6 :** la mission et l'INCIDENT disent `openCycleLedger` ; la fonction réelle est `openOperatorLedger`.
- **D-7 :** les dépassements C-10 sont renvoyés à l'orchestrateur, sans contournement.
- **D-8 :** R-25 = 630 au lieu de moins de 600 (544 avant les deux exigences ajoutées en cours de lot). Aucun test compacté ni affaibli. Découpe possible si vous l'exigez : `repair-tail` et C-9 en second lot, environ 335 lignes.

Corrections faites en cours de route :
- L'oracle n°1 a échoué sur `no_cash_cross_provider_name_in_export` : mon test exporté écrivait un nom de clé du fournisseur de cash. Je filtre désormais les clés par motif.
- Les bancs de coût ont tourné sur `ledger.ts` `399a6166…`. L'écart avec le livré (`625c759f…`) n'est qu'un commentaire, prouvé par reconstruction (`recon.log` : MATCH).

## Items formés (propriétaire : orchestrateur)
- **I-1 :** fsync du répertoire parent. Déclencheur : avant le 2ᵉ redéploiement VPS.
- **I-2 :** coût au-delà du seuil. Options : group commit, sidecar à deux emplacements alternés, ou accepter. Déclencheurs : `mint_start-NVDAx` et la course recorder U-4b-1b.
- **I-3 :** même retry du rename pour les JSON du sink Bell (BELL-SHORTPAGE-1).
- **I-4 :** RUNBOOK de course Ukemi §0.6 : sha attendus du bin à re-mesurer ; fusionner hors de la fenêtre étapes 1→6.
- **I-5 :** prereg U-4b §5c : le nouveau motif `repaired_in_window` donne une D-n au PLI s'il survient.
- **I-6 :** consigner la coupure n°2 dans l'INCIDENT (valeurs revérifiées par moi : 13 776 NUL, 10 866 lignes, head de 64 NUL).
- **I-7 :** demandes de lecture RQ-1..RQ-6. Les identités RQ-3..RQ-6 sont citées de mémoire, sans DOI : à confirmer avant toute acquisition.
- **I-8 :** un pid réutilisé après redémarrage fait refuser l'outil (sens sûr).
- **I-9 :** un antivirus peut faire échouer ponctuellement le test de séquence en local.
- **I-10 :** durée de la suite (options : neutraliser le flush dans les seuls tests lourds via le seam, relever les plafonds, ou accepter). Déclencheur : avant le prochain avis CI et avant la fusion.

Tous les autres détails sont dans `F:\tmp\gfsync1\G1.md` : consigne standard point par point, table des mutants, mesures des sondes, bancs, journal horodaté.
