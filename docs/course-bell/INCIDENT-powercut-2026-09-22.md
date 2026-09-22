# INCIDENT — coupure de courant pendant le tirage AAPLx (2026-09-22, ~20:32 UTC)

Orchestrateur `claude-fable-5-1`. Toutes les valeurs ci-dessous sont mesurées (commandes rejouables, sauvegardes `F:\course-bell\go1\powercut-2026-09-22\` avec `SHA256SUMS.txt`, rapport `repair-report.json`).

## 1. Faits
- Coupure d'alimentation de la machine de l'orchestrateur vers 20:32 UTC (dernière écriture durable : `ledger-AAPLx.jsonl` et `budget.json` mtime 21:32 locale = 20:32 UTC). Session Claude, 12 agents et le processus de tirage AAPLx (r1, lancé 20:03:18 UTC, pid 77188) tués.
- Au redémarrage (20:38 UTC) :
  - `F:\course-bell\bell-b3d-run\ledger-AAPLx.jsonl` : **593 lignes durables** + **760 298 octets NUL** en queue (NTFS : région allouée, données jamais flushées). `budget.json` (498 octets, intact) porte `pages: 1222`, `calls_used: 10084` ⇒ **~629 pages écrites par `appendFileSync` mais PERDUES** (jamais sur le plateau). Chaîne `prev_entry_sha256` des 593 lignes : cohérente. Dernière page durable 593, `slot_hi 417506336`, `entry_sha256 4920a57a…`.
  - Ledger de cycle rpc-guard `F:\monark-ledger\helius-2026-09-19\helius.jsonl` : **9 460 lignes durables** + **211 008 octets NUL** ; sidecar `helius.head` = `ef556085…` = sha d'une entrée PERDUE (head EN AVANCE sur le ledger durable) ⇒ `openCycleLedger` refuserait (« tail truncation, fail-closed, C-V-8 », `ledger.ts:121`) — cas « runbook manual repair » prévu par `ledger.ts:15-16`. `solana-foundation.jsonl` : 17 lignes, intact, head == dernière entrée.
  - Verrous tenus : `helius.lock` et `solana-foundation.lock` (pid 77188, 20:03:18Z) — conséquence attendue d'un kill dur (C-9).
- Cause racine (design) : les appends de ledger (`appendFileSync`, rpc-guard `ledger.ts:138` + sink Bell `rebase-crosscheck.ts:681`) et les écritures de sidecar/JSON ne sont **pas suivis d'un `fsync`** ; une perte d'alimentation perd le cache d'écriture du système. Le « write-ahead » tient contre un crash de PROCESSUS, pas contre une perte d'ALIMENTATION.

## 2. Réparation (manuelle, journalisée, 20:39-20:41 UTC)
1. Sauvegardes : `helius.jsonl`, `helius.head`, `solana-foundation.jsonl`, `solana-foundation.head`, `ledger-AAPLx.jsonl`, `budget.json` → `F:\course-bell\go1\powercut-2026-09-22\*.bak` + `SHA256SUMS.txt` (6 fichiers).
2. `repair.py` : suppression des queues NUL (aucune ligne partielle : la queue était purement NUL) —
   - `helius.jsonl` sha avant `09124f17…` → après `a53044c6…`, 211 008 octets retirés, 9 460 lignes, chaîne `prev_entry_sha256` cohérente, dernière entrée `1ff1cad0…` ;
   - `ledger-AAPLx.jsonl` sha avant `99a03ac0…` → après `2c58900b…`, 760 298 octets retirés, 593 lignes, chaîne cohérente, dernière entrée `4920a57a…` ;
   - `helius.head` réécrit `ef556085…` → `1ff1cad0…` (= dernière entrée durable ; le head en avance référençait une ligne perdue).
3. Déverrouillage SERVI (`packages/rpc-guard/bin/rpc-guard.mjs unlock`, `env -u` des 8 clés) pour `helius` et `solana-foundation`, motif consigné, exit 0 ×2 ; ligne `unlocked` chaînée écrite ; 0 `.lock` restant.
4. Ancre `mint_resume-AAPLx` (`f841311`, manifest `9086f0e3…`, OTS) sur `budget.json` + `ledger-AAPLx.jsonl` réparé.
5. Relance AAPLx r2 (20:41:49 UTC, mêmes paramètres, reprise depuis la page 593) ; 60 s après : vivant, 622 pages.

## 3. Conséquences comptables (déclarées)
- Crédits Helius DÉPENSÉS mais NON ledgérés par rpc-guard : ~420 lignes `attempted` perdues (211 008 octets / ~500 octets par ligne) ≈ **~420 appels `getTransactionsForAddress` ≈ 4 200 crédits pire cas** ; en plus, les ~629 pages perdues du ledger AAPLx sont re-tirées par r2 (dépense doublée sur cette plage). Le `priorFrozen = max(floor, Σ attempted)` de la garde sous-compte d'autant ⇒ la lecture Helius n°3 (dashboard, par méthode) et le rapprochement A-4 sont la source de vérité ; l'écart attendu est consigné ici pour le reconcile.
- `budget.json` (intact) porte le compte réel des appels du processus r1 (10 084) : la reprise r2 repart de ce compte (readPriorBudget), donc le plafond `--max-calls 51300` reste conservateur.
- Aucune donnée fausse n'entre : les pages perdues n'existaient sur aucun plateau ; la chaîne durable est un PRÉFIXE valide ; r2 re-tire depuis `slot_hi` de la page 593.

## 4. Items formés (zéro dette)
- **GARDE-FSYNC-1** (lot, propriétaire orchestrateur, déclencheur : avant `mint_start-NVDAx`) : `fsyncSync` après chaque append de ledger et après l'écriture du head sidecar dans `packages/rpc-guard/src/ledger.ts` (+ `lock.ts` si écriture de ligne), écriture `tmp + fsync + rename` pour les JSON entiers ; tests avec `fs` injecté comptant les `fsync` ; mutants « fsync retiré » / « fsync avant write » rouges. Le sink Bell (`rebase-crosscheck.ts:681`, `budget.json`, `crosscheck-*.json`) reçoit le même traitement dans BELL-SHORTPAGE-1 (ruling C-6 transmis au worker, même fichier).
- **RUNBOOK rpc-guard réparation manuelle** : ce document vaut procédure (sauvegarde + sha, suppression de queue NUL, head = dernière entrée durable, unlock servi, ancre, journal) — à porter dans `docs/RUNBOOK-rpc-guard.md` avec GARDE-FSYNC-1.
- `error_origin` : infrastructure (alimentation) + design (absence de fsync, résidu non attrapé par les revues GARDE-HELIUS-1b : la durabilité sous perte d'alimentation n'était pas dans le modèle de faute — MAST « hypothèse d'environnement non vérifiée »).
