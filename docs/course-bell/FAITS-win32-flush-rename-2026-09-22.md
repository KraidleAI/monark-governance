# FAITS — durabilité des écritures sous win32 : `FlushFileBuffers`, `MoveFileExW`, et ce que Node/libuv appelle réellement — 2026-09-22

Lecture SUR PLACE par l'orchestrateur (`claude-fable-5-1`), navigateur interne, en réponse à la demande formée du G2
BELL-SHORTPAGE-1 (§5 « lecture des pages Microsoft Learn `FlushFileBuffers` et `MoveFileExW` ; déclencheur GARDE-FSYNC-1 ;
usage : qualifier R-C6-1 »). Niveaux : **[lu]** = page primaire lue à l'heure indiquée ; citations ≤ 25 mots.

## 1. `FlushFileBuffers` (fileapi.h) — [lu] 2026-09-22 22:23 UTC
URL : `https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-flushfilebuffers` (page « Last updated on 10/13/2021 »).
- Objet : « Flushes the buffers of a specified file and causes all buffered data to be written to a file. »
- Le handle doit avoir `GENERIC_WRITE`.
- Remarque de coût : « can be inefficient when used after every write to a disk drive device when many writes are being performed separately » ;
  l'alternative documentée est l'I/O non bufferisée (`CreateFile` avec `FILE_FLAG_NO_BUFFERING` et `FILE_FLAG_WRITE_THROUGH`), qui
  « flushes the metadata to disk with each write ».
- Conséquence pour C-6 : `fs.fsyncSync(fd)` (→ `FlushFileBuffers`) après chaque ligne est le chemin documenté pour les DONNÉES du
  fichier ; le coût par appel mesuré par le G2 (p50 ≈ 7,8 ms par page, `docs/G2-lot-bell-shortpage-1.md` §4) est cohérent avec la
  remarque de coût. Aucune API Node n'expose `FILE_FLAG_WRITE_THROUGH`.

## 2. `MoveFileExW` (winbase.h) — [lu] 2026-09-22 22:24 UTC
URL : `https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw` (page « Last updated on 06/01/2023 »).
- `MOVEFILE_REPLACE_EXISTING` (0x1) : « If a file named lpNewFileName exists, the function replaces its contents with the contents of the
  lpExistingFileName file » (sous réserve des ACL).
- `MOVEFILE_WRITE_THROUGH` (0x8) : « The function does not return until the file is actually moved on the disk. » et « guarantees that a
  move performed as a copy and delete operation is flushed to disk before the function returns ».
- Sans `MOVEFILE_WRITE_THROUGH`, la page ne donne AUCUNE garantie de persistance du renommage au retour de la fonction.
- Droits : « To delete or rename a file, you must have either delete permission on the file or delete child permission in the parent directory. »

## 3. Ce que `fs.renameSync` appelle réellement (libuv, version de l'exécutable du tirage) — [lu] 2026-09-22 22:24 UTC
- `node -p process.versions.uv` sur le poste du tirage (node v24.15.0) : **`1.51.0`**.
- Source primaire : `https://raw.githubusercontent.com/libuv/libuv/v1.51.0/src/win/fs.c` (sha256 du fichier lu
  `60c76976514f427fa0be21c1c7986c2ab1d9e2e77b9d5bcf8c7ab99ed36b0693`), lignes 2266-2267 :
  `static void fs__rename(uv_fs_t* req) { if (!MoveFileExW(req->file.pathw, req->fs.info.new_pathw, MOVEFILE_REPLACE_EXISTING)) {`
- Donc `renameSync(tmp, cible)` = `MoveFileExW(…, MOVEFILE_REPLACE_EXISTING)` **seul** : ni `MOVEFILE_WRITE_THROUGH`, ni sémantique
  POSIX (`FILE_RENAME_FLAG_POSIX_SEMANTICS`). Le fichier `fs.c` ne contient aucune occurrence de `MOVEFILE_WRITE_THROUGH` ni de
  `FileRenameInformation` (grep sur le fichier lu).

## 4. Conséquences (qualification de R-C6-1 et R-C6-2 — pour GARDE-FSYNC-1, BELL-SHORTPAGE-1 D1-nonies §4, BELL-RENAME-RETRY-1)
- **R-C6-2 expliqué** : le remplacement d'une cible OUVERTE par `MoveFileExW(MOVEFILE_REPLACE_EXISTING)` échoue (mesuré EPERM
  pour tout lecteur, `docs/course-bell/RUNBOOK-supervision-tirage.md` §1) ; il n'existe pas de chemin Node vers la sémantique POSIX.
  Le retry borné (BELL-RENAME-RETRY-1) est donc la seule contre-mesure côté code ; le runbook de supervision, la contre-mesure côté procédure.
- **R-C6-1 précisé** : la persistance du RENOMMAGE lui-même n'est pas garantie au retour de `renameSync` (pas de write-through) ; après
  une coupure, l'état visible peut être « ancien fichier complet » OU « nouveau fichier complet », jamais un fichier déchiré (le
  contenu du `.tmp` a été `fsync`é avant le rename). L'affirmation « NTFS journalise la méta » de l'ADR reste une hypothèse
  NON sourcée par ces pages : ce qui est sourcé, c'est l'ABSENCE de garantie. La reprise doit donc tolérer un `budget.json`
  (ou `<op>.head`) en retard d'une page/entrée sur le ledger durable — c'est exactement ce que la réparation du 22/09 a fait
  (`INCIDENT-powercut-2026-09-22.md` §5 : `budget.json` reconstruit depuis les ledgers de cycle).
- Item formé pour GARDE-FSYNC-1 / BELL-SP : la réconciliation « head/budget en retard sur le ledger durable » doit être
  MESURÉE par un test (tête = entrée N−1, ledger à N ⇒ reprise fail-closed ou réparation nommée, jamais un double compte).
