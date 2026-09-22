# RUNBOOK — supervision d'un tirage Bell sous écritures durables (C-6) — 2026-09-22

Origine : checkpoint-2 du lot BELL-SHORTPAGE-1, correction **C-4** (`docs/CHECKPOINT2-lot-bell-shortpage-1.md`), ré-écrite
après le fait mesuré ci-dessous par l'orchestrateur (`claude-fable-5-1`). Déclencheur : **avant le premier tirage sous le
code C-6** (`DURABLE_FS` : tmp + fsync + rename pour tout fichier réécrit en entier). Pas « première occurrence ».

## 1. Fait mesuré [lu, première main] — 2026-09-22 21:5x–22:0x UTC, poste du tirage, disque F: (NTFS), node v24.15.0, Windows 10 19045

Expérience `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\renamex\{ren.mjs, ren-retry.mjs}` :
`fs.renameSync("target.json.tmp", "target.json")` (tmp écrit + `fsyncSync` + `closeSync`, puis rename) pendant qu'un
lecteur tient `target.json` ouvert.

| Lecteur qui tient la cible ouverte | Résultat du `renameSync` |
|---|---|
| aucun (contrôle) | OK |
| Node `fs.openSync(cible, "r")` (même version de Node que le tirage) | **EPERM** |
| Git-Bash `exec 3<cible` | **EPERM** |
| Python `open(cible)` | **EPERM** |
| PowerShell `[IO.File]::Open(cible, Open, Read, ReadWrite)` | **EPERM** |
| après fermeture du lecteur | OK |
| retry toutes les 100 ms, plafond 3 s, lecteur Node tenu 1,2 s | OK au 4ᵉ essai, 328 ms |

Conséquences :
- La phrase de l'ADR D1-nonies R-C6-2 (« lecteur **non-Node** ») et la ligne C-4 telle que proposée (« lire avec Node ou
  Git-Bash seulement ») sont **fausses sur ce poste** : tout handle ouvert sur la cible, quel que soit l'outil, fait échouer le
  rename. L'ancien code (`writeFileSync` : troncature + écriture) tolérait les lecteurs concurrents ; le code C-6 échange cette
  tolérance contre la durabilité et STOPPE fail-closed à la première collision (reprise sans perte, mais tirage interrompu).
- La fenêtre par page est courte (≈ 3 ms par `writeDurable`, ADR §4) mais répétée ~50 k fois (AAPLx) à ~296 k fois (SPYx) :
  une lecture périodique de `budget.json` finit par entrer en collision.

## 2. Règles de supervision (non discrétionnaires) pendant un tirage sous C-6

1. **Aucun outil n'ouvre les fichiers RÉÉCRITS du `--out` vivant** : `budget.json`, `crosscheck-<MINT>.json`,
   `crosscheck-<MINT>-attempt.json`, `crosscheck-report.json`, `candidates/<MINT>/*.json`, `sonde-report.json`. Ni `cat`, ni
   `cp` (une copie ouvre aussi la cible), ni Python, ni PowerShell, ni Node, ni un éditeur.
2. La supervision lit **seulement les fichiers append-only** : `ledger-<MINT>.jsonl` (`wc -l`, `tail`), les logs
   `F:\course-bell\go1\<MINT>-rN.{out,err}.log`, et la présence du processus (`tasklist //FI "PID eq <pid>"`). Le compteur de
   pages est le nombre de lignes du ledger, pas `budget.json`.
3. Les ledgers de cycle rpc-guard (`F:\monark-ledger\<cycle>\<op>.jsonl`) sont append-only ; leur **tête** `<op>.head` est
   réécrite à chaque appel : **ne pas l'ouvrir pendant un tirage** (même règle, lot GARDE-FSYNC-1).
4. `budget.json`, les artefacts `crosscheck-*` et les manifestes d'ancre se lisent **après la sortie du processus** (fin de
   mint, STOP, ou crash constaté par `tasklist`). Une ancre `mint_end` / `mint_resume` est toujours posée processus arrêté.
5. Le code reçoit de son côté un **retry borné du rename** (item BELL-RENAME-RETRY-1 ; même exigence transmise à
   GARDE-FSYNC-1) : EPERM/EACCES/EBUSY ⇒ réessai à backoff court sous un plafond explicite, puis échec fail-closed — jamais
   un repli `writeFileSync` qui perdrait la durabilité. Le runbook reste en vigueur même avec le retry (défense en profondeur).

## 3. Items formés

- **BELL-RENAME-RETRY-1** (code, micro-lot séparé ; déclencheur : G7 de BELL-SHORTPAGE-1, à livrer AVANT tout tirage sous C-6) :
  retry borné de `renameSync` dans `writeDurable` ; test déterministe en processus (`fs.openSync(cible, "r")` tenu ~300 ms
  pendant le premier rename ⇒ succès, `.tmp` absent, contenu neuf ; lecteur jamais relâché ⇒ erreur nommée après plafond,
  cible ancienne INTACTE, ledger non avancé) ; mutants « pas de retry », « retry infini », « repli writeFileSync ».
  Propriétaire : orchestrateur (worker Opus 5.5).
- **GARDE-FSYNC-1** (en G1 le 2026-09-22) : reçoit la même exigence pour `<op>.head` et les JSON réécrits (message de
  l'orchestrateur au worker, 22:0x UTC).
