# G7 du lot RPC-GUARD-LOCK-WRITE-LEAK-1 : un verrou créé puis non écrit ne reste plus sur le disque

- **Demande** : MONARK, message 9fd1ae1 (§3), item H-1 de la G2 de #137. Lot prioritaire : il conditionne le redéploiement de la sentinelle (décision de l investisseur, `e754a863`).
- **Branche** : `recherches/rpc-guard-lock-write-leak-1`, partie de `115fc65a`, tronc fusionné ensuite (`e754a863`, avec #137) par le commit de fusion `bbcf4333`, puis `633bcb4a` et `721b1d50` (voir Commits). Poussée sur `origin` (`recherches/rpc-guard-lock-write-leak-1`) ; aucune PR ouverte par ce lot.
- **Zone** : `packages/rpc-guard/src/lock.ts`, `packages/rpc-guard/test/lock.test.ts` ; ce G7 et le G0 ; pour la décision de MONARK sur m-2 (identité dégénérée), deux membres de lecture ajoutés au seam `DURABLE_FS` dans `packages/rpc-guard/src/ledger.ts`, sur des lignes existantes (aucun décalage). Rien d autre (le mode de `packages/rpc-guard/bin/rpc-guard.mjs` n est pas touché).

## Commits

| Commit | Contenu |
|---|---|
| `3ca03847` | G0 (`docs/G0-lot-rpc-guard-lock-write-leak-1.md`) |
| `4763f683` | tests rouges (4 tests dans `lock.test.ts`) |
| `a3904dbf` | gel : `sealOwnLock` dans `lock.ts` |
| `bbcf4333` | fusion de `origin/lot/etude-suite` (`e754a863`), sans conflit |
| `81dc8538` | G7 (premier état) |
| `633bcb4a` | fusion de `origin/lot/etude-suite` (`56be78ea`) |
| `f466e1d1` | pli de la G2 : B-1 (verrou étranger recréé au même chemin) et m-1 (retrait en échec EPERM), tests seuls, `lock.ts` inchangé |
| `bfbd1eae` | décision de MONARK sur m-2 (message `5ac3905`, §3) : identité dégénérée → garder ; une clause à `lock.ts:59`, lectures d identité par le seam, deux tests |
| `5b500db0` | fusion de `origin/lot/etude-suite` (`721b1d50`), sans conflit |
| `e5352190` | lint : assertion de type inutile retirée du test d identité dégénérée |
| (ce commit) | G7 mis à jour (section G2) |

## Construction (conforme au G0)

- `lock.ts:26` : l écriture `{pid, iso}` et son fsync restent sur la même ligne, passés à `sealOwnLock(lockPath, fd, write)`.
- `sealOwnLock` (`lock.ts:51-63`, après `runUnlock`) : identité lue par `DURABLE_FS.fstatSync(fd)` (bigint) avant l écriture (l.52) ; écriture et fsync (l.53) ; fermeture toujours, première erreur gardée (l.55) ; sur erreur, `DURABLE_FS.lstatSync` du chemin (l.58) et retrait par `DURABLE_FS.unlinkSync` seulement si l identité lue n est pas dégénérée (`ino` et `birthtimeNs` non nuls) et si `dev`, `ino` et `birthtimeNs` sont les mêmes (l.59-60) ; l erreur d origine relevée (l.62). Retrait au mieux : identité illisible ou dégénérée, `lstat` ou `unlink` en échec laissent le fichier (fail-closed, comportement d avant), sans masquer l erreur d origine.
- Les deux lectures d identité passent par le seam `DURABLE_FS` (`ledger.ts:48` et `:58`, membres `fstatSync` et `lstatSync` ajoutés en fin de ligne : aucune ligne de `ledger.ts` ne bouge, ses tueurs restent ancrés). Ce sont des lectures ; `harness.journal` ne les journalise pas, la séquence `open:wx`, `write`, `fsync`, `close` est inchangée. Sans ce seam, l identité dégénérée n était pas testable (G2 m-2 : « `fstatSync` hors seam »).
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
| `lock_failure_never_removes_a_foreign_lock` | `// killer: packages/rpc-guard/src/lock.ts:59 CONST "own !== undefined && own.ino !== 0n && own.birthtimeNs !== 0n && now.dev === own.dev && now.ino === own.ino && now.birthtimeNs === own.birthtimeNs" -> "own !== undefined"` | F2P, tueur tué (tueur mis à jour avec la ligne 59) |
| `lock_failure_never_removes_a_foreign_lock_recreated_at_the_same_path` (G2 B-1) | `// killer: packages/rpc-guard/src/lock.ts:59 CONST " && now.birthtimeNs === own.birthtimeNs" -> ""` | vert à la base par construction (code inchangé, `f466e1d1`) ; tueur appliqué à la main à la tête : tué, seul ce test rougit |
| `lock_failed_removal_never_masks_the_original_error` (G2 m-1) | `// killer: packages/rpc-guard/src/lock.ts:61 CONST "} catch { /* best effort: the removal never masks the original error */ }" -> "} finally { }"` | vert à `633bcb4a` par construction ; tueur appliqué à la main : tué, seul ce test rougit ; F2P contre le tronc |
| `lock_failure_keeps_a_lock_whose_ino_is_degenerate` (m-2) | `// killer: packages/rpc-guard/src/lock.ts:59 CONST "own.ino !== 0n && " -> ""` | F2P contre `f466e1d1`, tueur tué |
| `lock_failure_keeps_a_lock_whose_birth_time_is_degenerate` (m-2) | `// killer: packages/rpc-guard/src/lock.ts:59 CONST "own.birthtimeNs !== 0n && " -> ""` | F2P contre `f466e1d1`, tueur tué |

Le tueur de B-1 proposé par la G2 était `SDL` ; `SDL` vide toute la ligne 59 (erreur de syntaxe, mutant invalide), il est donc écrit `CONST` (retrait de la seule clause).

Les fautes passent par le seam `DURABLE_FS` (`harness.journal`), jamais une vraie panne de disque. Le verrou étranger est vérifié sous deux formes : préexistant (`EEXIST`, `LockHeldError`, fichier et contenu intacts) et substitué au chemin entre la fermeture et le nettoyage, de deux façons : un fichier distinct renommé sur le chemin (inode distinct), et (B-1) notre fichier retiré puis le `wx` d un autre écrivain au même chemin. Les tests d identité dégénérée remplacent les deux lectures du seam par des lectures réelles dont un seul champ (`ino` ou `birthtimeNs`) vaut `0n`, comme sur un FS qui ne le fournit pas : verrou gardé, aucun `unlink` au journal, erreur d origine relevée.

Mutants hors tueurs, mesurés à la main au gel (copie de travail jetable) : retirer `now.ino === own.ino` rougit `lock_failure_never_removes_a_foreign_lock` ; retirer `now.dev === own.dev` survit (non tenu, déclaré : le fichier substitué du test est sur le même volume). Phrase corrigée (G2 B-1) : la date de naissance est la seule garde sur ext4 et XFS, où un inode libéré est réutilisé aussitôt (même `dev`, même `ino`) ; elle est tenue par `lock_failure_never_removes_a_foreign_lock_recreated_at_the_same_path`, dont le pouvoir de tuer dépend du FS (ext4, XFS : oui, mesuré ici sur ext4 ; tmpfs, qui ne réutilise pas l inode : non ; le test reste vert partout avec le code juste). Remplacer `fstatSync` (l.53) par une identité inconnue rougit les quatre tests (aucun retrait).

## Preuves

### Premier état (gel `a3904dbf`, fusion `bbcf4333`)

- **red-proof** : `--base e754a863 --gel bbcf4333 --draw 4 --seed 37` : 4 jugés, 4 F2P, 4 tueurs tirés, 4 tués, sortie 0 ; `RED-PROOF.json` sha256 `a67d0f7bc821bff9f5bcc51c7655cd0815d8e54cc3a366d924d1a5fcc02313e5`. Même verdict contre `115fc65a` (gel `a3904dbf`, sha256 `d1bb7f88…c80b`).

### État final (tête `e5352190` puis ce commit ; tronc `721b1d50`)

- **red-proof de la décision m-2** contre le pli de la G2 : `node scripts/red-proof.mjs --base f466e1d1 --gel <bfbd1eae + e5352190> --repo /home/user/monark-governance-rgl --draw 2 --seed 37` (gel : arbre de travail de `bfbd1eae` avec le correctif de lint, donc sans la fusion du tronc) : 2 jugés, **2 F2P** (rouges à la base par assertion : la base retire le verrou), 8 inchangés, 2 tueurs tirés, **2 tués**, sortie 0 ; `RED-PROOF.json` sha256 `c19f73ad088a2f206444733435ccf39410c865b1c485113f96ed9bf177ff0f49`.
- **red-proof du lot entier** contre la tête du tronc : `--base 721b1d50 --gel e5352190 --draw 8 --seed 37` : 8 jugés, **5 F2P** (les quatre du premier état et m-1), 5 tueurs tirés, 5 tués ; **3 refusés « vert à la base »**, attendu par construction : le code d avant le lot ne retire jamais rien, donc les tests qui prouvent « ne pas retirer » (B-1, les deux identités dégénérées) y sont verts. Leurs preuves sont ailleurs : F2P contre `f466e1d1` (identités dégénérées) et tueurs appliqués à la main (B-1, m-1, ci-dessous). Sortie 1 (refus attendus) ; `RED-PROOF.json` sha256 `4e79c6340f8766181f78c806747c5c2d51585b91e2cdf998a482ec71519aba38`.
- **Tueurs à la main** (worktree jetable à la tête, `node --test packages/rpc-guard/test/lock.test.ts`, 10 tests) : B-1 `lock.ts:59` sans `&& now.birthtimeNs === own.birthtimeNs` → 9/10, seul `…recreated_at_the_same_path` rouge ; m-1 `lock.ts:61` `catch` → `finally` → 9/10, seul `lock_failed_removal_never_masks_the_original_error` rouge ; les deux tueurs m-2 → 9/10 chacun, seul leur test rouge. Fichier restauré après chaque mutant.
- **Ancres** : `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` : 8 tueurs, **8 ANCRE**, 0 DERIVE, 0 PERDU. Arbre entier : 839 tueurs, 830 ANCRE, 0 DERIVE, 9 PERDU (les mêmes 9, hors zone et antérieurs au lot) ; les tueurs sur `ledger.ts` restent ancrés (aucune ligne décalée).
- **Suites** (Node 24.21.0, Linux, ext4, proxys retirés, TMPDIR propre) : `packages/rpc-guard`, `apps/sentinel`, `test/dojo-collect-deploy.test.ts` : 421 tests, 419 verts, 0 échec, 2 sautés. `npm test` complet à `5b500db0` : 2 179 tests, 2 157 verts, **0 échec**, 22 sautés, test 42 vert ; les tests du lot figurent au rapport (l écart de compte avec le premier état vient des rapports perdus sous `--test-force-exit`, TEST-FORCE-EXIT-REPORT-LOSS-1, hors lot).
- **tsc** `--noEmit` 0 ; **lint** 0 (après `e5352190`) ; **lint:ratchet** 69/69 ; **gate:vocab** OK ; **lang:gate** OK.
- **R-25** (`scripts/oracle/r25.mjs`, base `721b1d50`, tête = ce commit) : 175 insertions, 9 suppressions, **184** au total (borne `VIBEGATES_PR_LIMIT` = 1205, lue dans `ci.yml` à cette tête) ; contenu 0 ; GREEN. Premier état : 120 (borne 547 alors).

## G2 (`G2-rpc-guard-lock-write-leak-1.md`, APPROUVÉ SOUS RÉSERVE de B-1) : suites données

- **B-1 (levée, `f466e1d1`)** : test `lock_failure_never_removes_a_foreign_lock_recreated_at_the_same_path` : notre fichier retiré (comme par un `unlock` servi, `lock.ts:42`) puis le `wx` d un autre écrivain au même chemin, entre la fermeture et le nettoyage ; le verrou étranger reste, contenu intact. Phrase du G7 corrigée : sur ext4 et XFS l inode libéré est réutilisé aussitôt, la date de naissance y est la seule garde, et elle est désormais tenue ; le pouvoir de tuer du test dépend du FS (ext4/XFS oui, tmpfs non), déclaré. Tueur `lock.ts:59` en `CONST` (le `SDL` proposé viderait la ligne).
- **m-1 (levé, `f466e1d1`)** : `unlinkSync` en échec EPERM par le seam : l erreur d écriture (ENOSPC) est relevée, jamais l EPERM ; le retrait a été tenté (journal) ; le verrou reste (fail-closed). Tueur `lock.ts:61` `catch` → `finally`.
- **m-2 (décidé par MONARK : garder, `bfbd1eae`)** : une identité dégénérée (`ino` ou `birthtimeNs` à `0n` : FS sans date de naissance, `statx` sans `STATX_BTIME`, certains volumes réseau ou FUSE, certains volumes réseau sous Windows) ne prouve pas que le fichier est le nôtre : le verrou est gardé. Raison : on ne retire jamais un verrou dont on ne prouve pas qu il est le nôtre ; le coût est un `lock_held` jusqu à l acte du RUNBOOK (`unlock` servi), dans le sens sûr, alors que le sens inverse (retirer sur `dev`+`ino` seuls là où l inode est réutilisé aussitôt) pourrait retirer le verrou vivant d un autre écrivain et fourcher la chaîne (C-9). Une clause au code (`lock.ts:59`), deux tests par le seam `DURABLE_FS`, deux tueurs.
- **m-3 (résidu déclaré, rien au code)** : sous Windows, libuv rend `ino` = `FileIndex` 64 bits (référence MFT avec numéro de séquence sous NTFS), `dev` = numéro de série du volume, naissance = `CreationTime`. Le « tunneling » NTFS redonne à un fichier recréé sous le même nom dans les 15 s la date de création de l ancien : sous NTFS la naissance ne distingue rien, c est le numéro de séquence de `FileIndex` qui porte l identité (correct). Sous FAT/exFAT, l index dérive de l entrée de répertoire et peut revenir identique : les trois champs peuvent coïncider et un verrou étranger recréé au même chemin pourrait être retiré. Résidu : le registre ne doit pas vivre sur un volume FAT/exFAT. Un `fstat` qui échoue ou un `lstat` sur un fichier en suppression (EPERM) donnent « ne pas retirer ».
- **m-4 (résidu déclaré, acceptable)** : entre `lstatSync` (l.58) et `unlinkSync` (l.60), un autre processus peut substituer un fichier ; pire cas, retrait d un verrou étranger vivant. Préconditions cumulées : notre fichier retiré par un tiers (`unlock` ou `releaseLock` par chemin, `lock.ts:34`, `:42`, sans contrôle d identité) ET une création `wx` étrangère, dans une fenêtre synchrone de quelques microsecondes. Strictement plus étroit que le risque déjà porté par `runUnlock`/`releaseLock` ; non réductible de façon portable (ni Node ni POSIX n offrent de retrait conditionné à l inode ou par descripteur). Le point 3 du G0 (« jamais un verrou d autrui ») se lit donc « jamais, hors la course `lstat` → `unlink`, déclarée ». La construction qui l annule (écrire `{pid, iso}` dans un fichier temporaire fsyncé puis `linkSync` exclusif vers `<op>.lock`) change la séquence du seam et la sémantique win32 : item ultérieur, pas ce lot.
- **m-5 (appelants et document)** : le correctif profite aussi à `cli.ts:44` (`reconcile`) et `repair.ts:58` (`repair-tail` sans verrou), où `acquireLock` est appelé hors du `try` qui relâche : avant le lot, un échec d écriture y laissait aussi le verrou. Pour la liste documentaire de MONARK : `docs/RUNBOOK-rpc-guard.md:117` (`lock_unreadable`, « the lock's `{pid}` never reached the disk ») reste juste ; ce cas se réduit désormais à la coupure de courant, au retrait en échec et à l identité dégénérée gardée ; rien à changer.

## Documents qui décrivent le verrou (hors zone, pour MONARK, rien de modifié)

Aucun document ne décrit la fuite H-1 elle même. Relus :

- `docs/RUNBOOK-rpc-guard.md:18` (modèle de fautes) : la ligne « Process crash » dit « lock held by a dead pid ». Toujours juste. Option : une ligne « échec d écriture, fsync ou fermeture du verrou (ENOSPC, EIO) : erreur relevée, verrou retiré s il est le nôtre (RPC-GUARD-LOCK-WRITE-LEAK-1) ; s il ne peut l être, verrou vide ou partiel, `unlock` servi ».
- `docs/RUNBOOK-rpc-guard.md:117` (`lock_unreadable`) : voir G2 m-5 ; toujours juste, rien à changer.
- `docs/RUNBOOK-sentinel.md:412` : « `.lock` résiduel après `Deactivated` sans SIGKILL ⇒ STOP + rollback » devient plus vrai ; seul résidu, un retrait qui échoue lui même (disque en faute), ce qui reste un STOP légitime. Rien à changer.
- `docs/RUNBOOK-sentinel.md:423` et `docs/adr/ADR-NARABI-OPS-1.md:225` citent `{pid, iso}` à `packages/rpc-guard/src/lock.ts:25` : l écriture est à `:26` (déjà le cas à la base, la l.25 est son commentaire). Dérive antérieure, inchangée par ce lot ; correction possible au prochain passage : `lock.ts:26`. `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:72`, `:305` : source figée, à laisser.
- `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md:41-44` (verrou exclusif) et `:180-181` (rollback des k-1) : toujours justes. Option : une phrase datée « 2026-10-04, RPC-GUARD-LOCK-WRITE-LEAK-1 : un échec d écriture, de fsync ou de fermeture après la création exclusive retire le fichier créé (identité `dev`/`ino`/naissance), jamais un verrou d autrui, et relève l erreur d origine ».
- Citations historiques (`docs/PLI-lot-u4b-1b-3.md:41` `lock.ts:17-26`, `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:266` `lock.ts:17-27`) : `acquireLock` occupe toujours `17-28` ; documents datés, à ne pas réécrire.

## Questions à MONARK

1. Réglée (message `5ac3905`, §3) : les deux choix déclarés sont approuvés par la G2 et notés par MONARK.
3. Les lectures d identité passent désormais par `DURABLE_FS` (`ledger.ts:48`, `:58`, sur des lignes existantes) : c est le seul moyen d injecter une identité dégénérée par le seam. Ce débord sur `ledger.ts` te convient il, ou préfères tu un seam propre à `lock.ts` ?
2. Veux tu la ligne du modèle de fautes de `RUNBOOK-rpc-guard.md` et la phrase datée de l ADR GARDE-HELIUS (texte ci-dessus), dans ce lot (zone à ouvrir) ou au prochain passage ?
