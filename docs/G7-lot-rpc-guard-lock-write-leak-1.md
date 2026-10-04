# G7 du lot RPC-GUARD-LOCK-WRITE-LEAK-1 : un verrou créé puis non écrit ne reste plus sur le disque

- **Demande** : MONARK, message 9fd1ae1 (§3), item H-1 de la G2 de #137. Lot prioritaire : il conditionne le redéploiement de la sentinelle (décision de l investisseur, `e754a863`).
- **Branche** : `recherches/rpc-guard-lock-write-leak-1`, partie de `115fc65a`, tronc fusionné ensuite (`e754a863`, avec #137) par le commit de fusion `bbcf4333`. Aucun push, aucune PR.
- **Zone** : `packages/rpc-guard/src/lock.ts`, `packages/rpc-guard/test/lock.test.ts` ; ce G7 et le G0. Rien d autre (le mode de `packages/rpc-guard/bin/rpc-guard.mjs` n est pas touché).

## Commits

| Commit | Contenu |
|---|---|
| `3ca03847` | G0 (`docs/G0-lot-rpc-guard-lock-write-leak-1.md`) |
| `4763f683` | tests rouges (4 tests dans `lock.test.ts`) |
| `a3904dbf` | gel : `sealOwnLock` dans `lock.ts` |
| `bbcf4333` | fusion de `origin/lot/etude-suite` (`e754a863`), sans conflit |
| (ce commit) | G7 |

## Construction (conforme au G0)

- `lock.ts:26` : l écriture `{pid, iso}` et son fsync restent sur la même ligne, passés à `sealOwnLock(lockPath, fd, write)`.
- `sealOwnLock` (`lock.ts:51-63`, après `runUnlock`) : identité lue par `fstatSync(fd, { bigint: true })` avant l écriture (l.53) ; écriture et fsync (l.54) ; fermeture toujours, première erreur gardée (l.55) ; sur erreur, `lstatSync` du chemin et retrait par `DURABLE_FS.unlinkSync` seulement si `dev`, `ino` et `birthtimeNs` sont les mêmes (l.58-60) ; l erreur d origine relevée (l.62). Retrait au mieux : identité illisible, `lstat` ou `unlink` en échec laissent le fichier (fail-closed, comportement d avant), sans masquer l erreur d origine.
- Les lignes 1 à 44 de `lock.ts` gardent leurs numéros : le tueur `test/dojo-collect-deploy.test.ts:261` (`lock.ts:42`) reste ancré, les citations `lock.ts:20`, `:39-44` des ADR restent justes.
- Chemin heureux inchangé : séquence du seam `open:wx`, `write`, `fsync`, `close` (`durable.test.ts:34`, `repair-tail.test.ts:209` verts) ; le comptage de fsync réels du chemin de production reste à 6 (`durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` vert).
- `guarded.ts` inchangé : le retour arrière des k-1 verrous déjà pris reste celui de `openGuardedClient` ; le k-ième, en échec d écriture, nettoie désormais son propre fichier.
- Choix déclarés au G0, appliqués : une fermeture seule en échec retire le verrou (il n est pas rendu) ; quand écriture et fermeture échouent, c est l erreur d écriture qui sort (avant : celle de la fermeture).

## Tests et tueurs

| Test | Tueur (forme close) | Verdict |
|---|---|---|
| `lock_write_failure_removes_the_created_lock_and_rethrows` | `// killer: packages/rpc-guard/src/lock.ts:60 SDL "if (same) DURABLE_FS.unlinkSync(lockPath);" -> ""` | F2P, tueur tué (le retrait demandé par MONARK) |
| `lock_fsync_failure_through_openGuardedClient_leaves_no_lock` | `// killer: packages/rpc-guard/src/lock.ts:62 SDL "throw failure.error;" -> ""` | F2P, tueur tué |
| `lock_close_failure_after_write_failure_surfaces_the_write_error` | `// killer: packages/rpc-guard/src/lock.ts:55 CONST "failure ??= { error: e }" -> "failure = { error: e }"` | F2P, tueur tué |
| `lock_failure_never_removes_a_foreign_lock` | `// killer: packages/rpc-guard/src/lock.ts:59 CONST "own !== undefined && now.dev === own.dev && now.ino === own.ino && now.birthtimeNs === own.birthtimeNs" -> "own !== undefined"` | F2P, tueur tué |

Les fautes passent par le seam `DURABLE_FS` (`harness.journal`), jamais une vraie panne de disque. Le verrou étranger est vérifié sous deux formes : préexistant (`EEXIST`, `LockHeldError`, fichier et contenu intacts) et substitué au chemin entre la fermeture et le nettoyage (fichier distinct renommé sur le chemin, donc un inode distinct : pas de réutilisation d inode possible dans le test).

Mutants hors tueurs, mesurés à la main au gel (copie de travail jetable) : retirer `now.ino === own.ino` rougit `lock_failure_never_removes_a_foreign_lock` ; retirer `now.dev === own.dev` ou `now.birthtimeNs === own.birthtimeNs` survit (non tenus, déclarés : le fichier substitué du test est sur le même volume, et l inode suffit à le distinguer ; la date de naissance ne sert que contre une réutilisation d inode, que le test ne peut provoquer de façon sûre). Remplacer `fstatSync` (l.53) par une identité inconnue rougit les quatre tests (aucun retrait).

## Preuves

- **red-proof** contre le tronc à jour : `node scripts/red-proof.mjs --base e754a863 --gel bbcf4333 --repo /home/user/monark-governance-rgl --draw 4 --seed 37` : 4 jugés, 4 F2P, 2 inchangés, 4 tueurs tirés, 4 tués, sortie 0 ; `RED-PROOF.json` sha256 `a67d0f7bc821bff9f5bcc51c7655cd0815d8e54cc3a366d924d1a5fcc02313e5`. Même verdict contre `115fc65a` avant la fusion (gel `a3904dbf`, sha256 `d1bb7f88…c80b`).
- **Ancres** : `verifie-ancres.mjs . --touched e754a863 HEAD` : 4 tueurs, 4 ANCRE. Sur tout l arbre : 828 tueurs, 819 ANCRE, 9 PERDU, tous hors zone et antérieurs au lot (`packages/hikae/test/l1.test.ts`, `oracle-l1-split.test.ts` sur `l1-split.ts` ; `test/oracle-run.test.ts:129`, `:182` sur `scripts/oracle/run.mjs`) ; le tueur `dojo-collect-deploy.test.ts:261` sur `lock.ts:42` est ANCRE.
- **Suite** (Node 24.21.0, Linux, proxys retirés, TMPDIR propre) : après fusion (`bbcf4333`), `npm test` : 2 228 tests, 2 206 verts, 0 échec, 22 sautés (test 42 compris, vert) ; `test:export` seul : 1/1 vert. Avant fusion (`a3904dbf`) : `test:main` 2 198 tests, 0 échec, 21 sautés ; le test 42 y était rouge une fois (« exported CI ran an implausibly small suite » : la CI exportée sortait 0, mais son résumé était perdu, forme de TEST-FORCE-EXIT-REPORT-LOSS-1, sans lien avec le lot) ; rejoué vert à la tête fusionnée et au tronc `e754a863`. Les quatre tests du lot figurent dans chaque rapport.
- **tsc** `--noEmit` 0 ; **lint** 0 ; **lint:ratchet** 69/69 ; **gate:vocab** OK ; **lang:gate** OK.
- **R-25** (`scripts/oracle/r25.mjs`, base `e754a863`) : 114 insertions, 6 suppressions, 120 au total (≤ 547) ; contenu 0.

## Documents qui décrivent le verrou (hors zone, pour MONARK, rien de modifié)

Aucun document ne décrit la fuite H-1 elle même. Relus :

- `docs/RUNBOOK-rpc-guard.md:18` (modèle de fautes) : la ligne « Process crash » dit « lock held by a dead pid ». Toujours juste. Option : une ligne « échec d écriture, fsync ou fermeture du verrou (ENOSPC, EIO) : erreur relevée, verrou retiré s il est le nôtre (RPC-GUARD-LOCK-WRITE-LEAK-1) ; s il ne peut l être, verrou vide ou partiel, `unlock` servi ».
- `docs/RUNBOOK-sentinel.md:412` : « `.lock` résiduel après `Deactivated` sans SIGKILL ⇒ STOP + rollback » devient plus vrai ; seul résidu, un retrait qui échoue lui même (disque en faute), ce qui reste un STOP légitime. Rien à changer.
- `docs/RUNBOOK-sentinel.md:423` et `docs/adr/ADR-NARABI-OPS-1.md:225` citent `{pid, iso}` à `packages/rpc-guard/src/lock.ts:25` : l écriture est à `:26` (déjà le cas à la base, la l.25 est son commentaire). Dérive antérieure, inchangée par ce lot ; correction possible au prochain passage : `lock.ts:26`. `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:72`, `:305` : source figée, à laisser.
- `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md:41-44` (verrou exclusif) et `:180-181` (rollback des k-1) : toujours justes. Option : une phrase datée « 2026-10-04, RPC-GUARD-LOCK-WRITE-LEAK-1 : un échec d écriture, de fsync ou de fermeture après la création exclusive retire le fichier créé (identité `dev`/`ino`/naissance), jamais un verrou d autrui, et relève l erreur d origine ».
- Citations historiques (`docs/PLI-lot-u4b-1b-3.md:41` `lock.ts:17-26`, `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:266` `lock.ts:17-27`) : `acquireLock` occupe toujours `17-28` ; documents datés, à ne pas réécrire.

## Questions à MONARK

1. Les deux choix déclarés (fermeture seule en échec : verrou retiré ; première erreur relevée) te conviennent ils ?
2. Veux tu la ligne du modèle de fautes de `RUNBOOK-rpc-guard.md` et la phrase datée de l ADR GARDE-HELIUS (texte ci-dessus), dans ce lot (zone à ouvrir) ou au prochain passage ?
