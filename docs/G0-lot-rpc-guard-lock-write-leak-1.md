# G0 du lot RPC-GUARD-LOCK-WRITE-LEAK-1 : un verrou créé puis non écrit ne reste plus sur le disque

- **Demande** : MONARK, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-137-Q1-Q2-H1.md` (9fd1ae1, §3), d après l item H-1 de la G2 de #137 (`G2-sentinel-sigterm-startup-window-1.md`).
- **Base** : `115fc65a` (`origin/lot/etude-suite`), branche `recherches/rpc-guard-lock-write-leak-1`. Auteur : RECHERCHES.
- **Zone** : `packages/rpc-guard/` (le module du verrou `src/lock.ts` et ses tests `test/lock.test.ts`) ; ce G0 et le G7. `guarded.ts`, `ledger.ts`, le bin et tout document hors `packages/rpc-guard/` sont inchangés.

## Constat

- `acquireLock` (`src/lock.ts:17-28`) crée le verrou par `openSync(<cycle>/<op>.lock, "wx")` (l.20), puis écrit `{pid, iso}`, le fsynce et ferme le descripteur (l.26, `try … finally closeSync`).
- Si `writeSync` ou `fsyncSync` lève (ENOSPC, EIO), ou si `closeSync` lève, l exception sort d `acquireLock` APRÈS la création du fichier. Dans `openGuardedClient` (`src/guarded.ts:43-47`), `acquired.push` suit l appel : le verrou n est pas dans `acquired`, le retour arrière (l.60) ne le retire pas. Le fichier reste, vide ou partiel ; chaque passage suivant lit `EEXIST`, donc `lock_held`, jusqu à l acte manuel du RUNBOOK (`unlock` servi).
- Second défaut, de même lieu : si l écriture lève puis la fermeture lève aussi, le `finally` remplace l erreur d écriture par celle de la fermeture ; l erreur d origine est perdue.

## Construction

1. La ligne 26 garde l écriture et le fsync à la même place, mais les passe à une fonction interne `sealOwnLock(lockPath, fd, write)`, placée APRÈS `runUnlock`, pour que les lignes 1 à 44 gardent leurs numéros (le tueur `test/dojo-collect-deploy.test.ts:261` vise `lock.ts:42`, et des ADR citent `lock.ts:20`, `:39-44`).
2. `sealOwnLock` :
   - lit l identité du fichier créé par le descripteur, AVANT l écriture : `fstatSync(fd, { bigint: true })` (`dev`, `ino`, `birthtimeNs`) ; si cette lecture échoue, l identité est inconnue ;
   - exécute l écriture et le fsync, puis ferme toujours le descripteur ;
   - garde la PREMIÈRE erreur (écriture ou fsync, sinon fermeture) ;
   - sur erreur, et seulement si le chemin désigne encore le fichier créé par cet appel (`lstatSync` du chemin : mêmes `dev`, `ino` et `birthtimeNs`), retire le fichier par `DURABLE_FS.unlinkSync`, APRÈS la fermeture (un descripteur ouvert bloque `unlink` sous Windows) ;
   - relève l erreur d origine. Le retrait est au mieux : une identité inconnue, un `lstat` ou un `unlink` qui échoue laisse le fichier (fail-closed, comme aujourd hui), et ne masque jamais l erreur d origine.
3. Jamais un verrou d autrui : `EEXIST` lève avant toute création, rien n est retiré (inchangé) ; un fichier substitué au chemin entre la création et le nettoyage (notre fichier retiré par un `unlock`, le verrou d un autre écrivain en place) a une autre identité et reste. Trois champs plutôt que l inode seul : un système de fichiers peut réutiliser un numéro d inode libéré.
4. Chemin heureux inchangé à l octet près pour le disque et pour la séquence du seam : `open:wx`, `write`, `fsync`, `close` (`durable.test.ts:34`, `repair-tail.test.ts:209`). `fstatSync` et `lstatSync` passent par `node:fs`, pas par `DURABLE_FS` : ce sont des lectures, le seam ne porte que les écritures.

## Choix laissés à MONARK

Aucun ne bloque le lot ; les deux sont déclarés et réversibles.

- **Fermeture seule en échec** (écriture et fsync faits) : le verrou n est pas rendu (l appelant ne l a pas dans `acquired`), donc il est retiré. C est la lecture littérale de la consigne (« write/fsync/close »).
- **Première erreur relevée** : quand l écriture et la fermeture échouent toutes deux, l erreur d écriture sort (avant : celle de la fermeture). C est la consigne « rethrow the original error ».

## Tests (rouges à la base, injectés par le seam `DURABLE_FS` via `harness.journal`, jamais une vraie panne de disque)

| Test (`packages/rpc-guard/test/lock.test.ts`) | Ce qu il prouve | Tueur |
|---|---|---|
| `lock_write_failure_removes_the_created_lock_and_rethrows` | `writeSync` lève ENOSPC : la même erreur sort ; séquence `open:wx`, `write`, `close`, `unlink` (fermé PUIS retiré) ; aucun `.lock` ; la prise suivante passe | `lock.ts:60 SDL "if (same) DURABLE_FS.unlinkSync(lockPath);" -> ""` (le retrait, demandé par MONARK) |
| `lock_fsync_failure_through_openGuardedClient_leaves_no_lock` | chemin servi : le fsync du verrou lève EIO ; `openGuardedClient` relève EIO ; aucun `.lock`, aucun ledger ; l ouverture suivante n est pas `lock_held` | `lock.ts:62 SDL "throw failure.error;" -> ""` |
| `lock_close_failure_after_write_failure_surfaces_the_write_error` | écriture et fermeture lèvent : l erreur d écriture sort, verrou retiré ; fermeture seule en échec : son erreur sort, verrou retiré | `lock.ts:55 CONST "failure ??= { error: e }" -> "failure = { error: e }"` |
| `lock_failure_never_removes_a_foreign_lock` | (a) verrou étranger préexistant : `LockHeldError`, fichier et contenu intacts ; (b) notre échec : retiré ; (c) verrou étranger substitué au chemin avant le nettoyage (renommé sur le chemin après la fermeture) : gardé, contenu intact, erreur d origine | `lock.ts:59 CONST "own !== undefined && now.dev === own.dev && now.ino === own.ino && now.birthtimeNs === own.birthtimeNs" -> "own !== undefined"` |

Chaque test est rouge à la base par assertion (`ERR_ASSERTION`) : séquence sans `unlink`, `.lock` présent, ou erreur de fermeture au lieu de l erreur d écriture.

## Plan de preuve

- Commit rouge (tests seuls), puis commit gel (code).
- `node scripts/red-proof.mjs --base 115fc65a --gel <gel> --repo /home/user/monark-governance-rgl --draw 4 --seed 37` : 4 tests F2P, 4 tueurs tirés et tués.
- Ancres : `verifie-ancres.mjs . --touched 115fc65a HEAD`.
- `npm test` complet, `test:main`, `test:export`, `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; R-25 ≤ 547.

## Hors zone, à lister pour MONARK au G7

Les documents qui décrivent le verrou orphelin (RUNBOOK de rpc-guard et de la sentinelle, ADR) sont relus ; toute phrase rendue fausse ou incomplète est listée, jamais modifiée dans ce lot.

## Taille

Environ 25 lignes de production, 90 de tests, plus ce G0 et le G7. Borne R-25 : 547.
