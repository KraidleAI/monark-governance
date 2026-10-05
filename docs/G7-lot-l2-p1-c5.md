# G7 du lot L2-P1-c5 (composition du scellé et prise de la sortie), par RECHERCHES

Base `854daf8f` (tête de `recherches/l2-p1-c4`, PR #151 ouverte, non fusionnée : `origin/lot/etude-suite` relu avant le push, toujours
`ab8084fb`, aucune fusion) ; branche `recherches/l2-p1-c5` ; commits `693272da` (G0), `2c4eae86` (tests rouges, `seal.d.mts`, types de la
commande et de `day.d.mts`), `d752b166` (gel), puis ce commit (G7). Poussé sur `origin/recherches/l2-p1-c5`, aucune PR. Node v24.21.0.
Aucun réseau : rien ne s'ouvre vers une place ; sorties sous le dossier temporaire du système, hors de tout arbre git ; trames
synthétiques seules, aucune série de marché au dépôt. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Scission

c5 du plan (186 lignes) plus les onze points que c1 à c4 lui renvoient dépassent 547 (700 à 790 estimées au G0). Le plan ne pré-déclare
pas de point de scission pour c5 ; le G0 le déclare avant tout code commis (Q-C5-1) : **ce lot**, composition du scellé et prise de la
sortie ; **P1-c5-bis**, la boucle d'enregistrement (horaires, liaisons, REST, chaîne, scellés dans un fil de travail, arrêt propre ;
tests `l2_record_loop_schedules` et `l2_record_loop_clean_stop`). La commande s'arrête encore `not_built` après ses gardes.

## Périmètre livré

- `scripts/l2/seal.mjs` (36 lignes, neuf) et `scripts/l2/seal.d.mts` (16) : `hookOf(scale, bounds)`, crochet de `sealDay` qui compose
  `bestTap`, `deriveDay` avec le `tap`, `canonDay` avec son résultat, à une seule échelle ; `mergeDerived` (clés de manifeste et de
  `missing.json` disjointes, sinon `stray_file`) ; `SEAL_BOUNDS` provisoires (64 Mio, 32 Mio) ; `sealOf`, la couture de c5-bis et de c6 ;
  modules `seal` et la commande hachés au `script_sha256` du jour (Q-C4-5).
- `scripts/record-binance-l2.mjs` (+49, −5) et `.d.mts` (+8) : `appendLine` (un ajout par descripteur `O_NOFOLLOW` dont `nlink` vaut 1 ;
  `ELOOP` nommé), `adopt` (journal d'une sortie reprise de cet enregistreur ; `--out` créé, chemin réel fixé, ligne `start` ; `check()` :
  chemin réel inchangé, gardes de `--out` refaites, `nlink` des deux journaux, puis le quota), m-8 dans `guardOut` (ligne changée en
  place), l'alarme de quota par `appendLine` (ligne changée en place). `run` inchangé.
- Changés en place, aucune ligne ajoutée : `scripts/l2/day.mjs` (`:23` import de `posix`, `:35` `snapshot_reload` aux `STOPS`, `:191`
  noms des modules par `posix.join`), `scripts/l2/derive.mjs` (`:13` en-tête, `:106` relecture vérifiée), `scripts/l2/day.d.mts` (un
  commentaire). `test/l2-record.test.ts` : la seule ligne du tueur de `l2_main_runs_by_real_path` renumérotée (`:197` → `:241`).
- `test/l2-loop.test.ts` (12 tests, 238 lignes, un tueur chacun).
- Écart au G0 : aucun.

## Points renvoyés à c5

| Point | Suite | Preuve |
|---|---|---|
| L2-MINUTES-SIZE-1 | mesure conjointe faite (G0 point 3) : échoue au pire cas sans plafond de tas ; bornes provisoires posées ; plafond du tas à c5-bis (Q-C5-3) ; item ouvert | `l2_seal_bounds_provisional` |
| L2-SNAPSHOT-RELOAD-1 | `snapshot_reload`, rien d'écrit ; item fermé par ce test | `l2_snapshot_reload_named` |
| n-5 de c3, ordre de composition | une `scale` ; clés disjointes ; `bestTap`, `deriveDay`, `canonDay` | `l2_seal_composes_replay_then_canon`, `l2_seal_parts_keys_disjoint` |
| n-3 de c3 | durée chiffrée : 45 s (index seul) à 190 s (composition, tas plafonné) au ras de la borne | G0 point 3 |
| n-6, n-7 de c3 | re-différés à M-1 (Q-C5-8) | — |
| Q-C4-5 | la commande et `seal.mjs` au `script_sha256` | `l2_seal_hashes_the_command` |
| m-8 de c4 | parent fichier : `out_not_l2` | `l2_guard_out_parent_file` |
| n-5 de c4 | première ligne du journal = `start` de cet enregistreur | `l2_adopt_journal_of_this_recorder` |
| n-5bis de c4 | `nlink` 1 aux ajouts de la commande et à chaque `check()` | `l2_append_single_link`, `l2_check_single_links` |
| n-7 de c4 | chemin réel fixé, revérifié (Q-C5-6) | `l2_check_real_path_pinned` |
| n-2 de c4 | gardes de `--out` à chaque `check()` | `l2_check_git_tree_again` |
| n-8 de c4 | `ELOOP` nommé `out_not_l2` | `l2_append_link_named` |
| n-3 de c4 | re-différé à c5-bis (horaire de la boucle) | — |

Re-différés à c5-bis, avec leur raison, au G0 (section « Re-différés ») : Q-P1-6 et Q-B1-3, Q-A4-3, Q-8 de a3, Q-C1-4, Q-C1-5, Q-5 de a2
et Q-C1-9 (avec le plafond de tas de Q-C5-3), Q-G2B-3 de c1, L2-TLS-PEER-UNATTESTED-1, m-7 du G7 de c1.

## Mesures de mémoire (L2-MINUTES-SIZE-1, G0 point 3)

Jour synthétique au ras de `INDEX_BOUND` (4 193 304 trames, 99,96 % de `@bookTicker`), `minutes.jsonl` de 58,6 Mio, passage de même clé
de 15 Mio ; `sealOf` ; cgroup v1 enfant à 512 Mio ; VmHWM (lecture corrigée au repli du G2, m-5 : VmHWM compte des pages de fichiers
que le cgroup ne facture pas forcément, d'où 525 Mio sur la dernière ligne au-dessus de la limite sans mort ; ce n'est pas la métrique
du budget, la mesure de clôture lit celle du cgroup, `memory.max_usage_in_bytes` en v1, `memory.peak` en v2) :

| Cas | Sous le cgroup | Hors cgroup |
|---|---|---|
| index seul | scellé, 45 s, 374 Mio | 44 s, 315 Mio |
| index et minutes (`deriveDay`) | scellé, 94 s, 361 Mio | 81 s, 390 Mio |
| composition complète, bornes provisoires, tas par défaut (8 195 Mio) | **tuée (OOM)** à 129 s | 153 s, 566 Mio |
| la même, tas plafonné à 256 Mio / 192 Mio | scellé, 192 s, 467 Mio / 186 s, 476 Mio | — |
| bornes par défaut (minutes 128 Mio, passage 31 Mio), tas 256 Mio | **tuée (OOM)** | — |
| moitié de la borne d'index, bornes provisoires, tas par défaut | scellé, 87 s, 525 Mio | 81 s, 480 Mio |

Les données vivantes tiennent sous 512 Mio avec les bornes provisoires ; le tas par défaut de V8 ignore le cgroup et ne ramasse qu'à la
pression. D'où Q-C5-3 : le scellé de c5-bis tourne dans un `Worker` au tas plafonné par `resourceLimits`, jamais par un drapeau de node
(la garde d'`execArgv` de c4 refuserait le lancement). La G2 contredit la prémisse de ce plafond (m-5, section « G2 ») : c5-bis le
mesure. Données synthétiques effacées après la mesure, cgroup retiré.

## Preuves

- `node scripts/red-proof.mjs --base 854daf8f --gel d752b166 --repo /home/user/monark-governance-c5 --draw 12 --seed 37` : « red-proof
  OK: 12 judged, 21 unchanged, 12 killer(s) drawn » ; `RED-PROOF.json` sha256 `e53b7c2adf838e02…`. Douze tests F2P (rouges par
  assertion à la base : `seal.mjs` absent, `adopt` absent, relecture non vérifiée) ; les douze tueurs tirés, tous tués. Les 21
  « unchanged » sont les tests de c4, dont seule une ligne de tueur a changé.
- Tueurs appliqués à la main avant le gel, un à la fois, le test seul rejoué, fichier restauré et sha256 vérifié : les douze rougissent
  par assertion (`ERR_ASSERTION`).
- Ancres : `verifie-ancres.mjs . --touched 854daf8f HEAD` : 33 tueurs (12 neufs, 21 de c4), 33 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts,test/l2-record.test.ts,test/l2-loop.test.ts` : 77 tueurs, 77 ANCRE.
- `node --test test/l2-*.test.ts` : 128 sur 128. `npm test` complet, une fois, dans le worktree : 2 334 tests, 2 312 réussis, 0 échec,
  22 ignorés, sortie 0 (un premier passage rougissait 50 tests d'outils hors L2 parce que `node_modules` était un lien non suivi que
  l'outil des mutants lit comme un fichier ; refait avec un dossier de liens, ignoré par git : vert).
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml`, base `854daf8f`) : `STAT` 366 (354 insertions,
  12 suppressions) ; borne du lot 547, marge 181 ; `CONTENT_STAT` 0 ; GREEN. Plan : c5 186 ; écart déclaré au G0 (scission, points
  renvoyés).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C5-1 (scission c5 / c5-bis), Q-C5-2 (module neuf `seal.mjs`), Q-C5-3 (bornes provisoires ; scellé de c5-bis dans un `Worker` au tas
plafonné, 256 Mio mesurés), Q-C5-4 (`recorder` dans la ligne `start`), Q-C5-5 (n-5 dans `adopt` ; reste déclaré : l'alarme à 70 % au
départ peut précéder le refus ; fermé au repli du G2), Q-C5-6 (n-7 par chemin réel fixé ; prémisse « pas d'`openat` » corrigée au repli
du G2), Q-C5-7 (n-5bis des modules contrôlé au rythme
de `check()`), Q-C5-8 (n-6 et n-7 de c3 à M-1), Q-C5-9 (`snapshot_reload`, nom dédié).

## Notes pour la suite

- c5-bis :
  - `run` : `prepare`, puis `adopt` (ligne `start` avant toute ouverture), puis la boucle ; `check()` à son rythme (n-3 de c4 : environ
    1 s à 300 000 fichiers, synchrone) ;
  - scelle par `sealOf({ scale, ... })` hors du fil des liaisons ; le `Worker` à `resourceLimits` n'est pas un plafond dur (m-5 de la
    G2, section « G2 » ci-dessous : mesure à refaire, processus enfant à envisager) ; un scellé dure
    jusqu'à environ 190 s par symbole au ras des bornes : jamais sur le fil des liaisons ;
  - l'échelle passée à `sealOf` est celle d'`exchangeInfo` de la veille (Q-C2-8) ;
  - reste la liste « Re-différés » du G0.
- c6 : `--from-raw` appelle `sealOf` avec la même échelle et les mêmes bornes : le manifeste porte les mêmes `script_sha256`.
- Items : L2-SNAPSHOT-RELOAD-1 fermé par `l2_snapshot_reload_named` ; L2-MINUTES-SIZE-1 ouvert (mesure faite, échec sans plafond de tas ;
  clôture : la même mesure dans le fil de travail de c5-bis, puis sous l'unité en P3).
- MAST FM-1.1 de la ligne c5 du plan : la preuve `l2_record_loop_schedules` est à c5-bis.

## G2

Revue G2 du 2026-10-05 (`recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c5.md`) : **APPROUVE SOUS RÉSERVE**, aucun
bloquant, mineurs m-1 à m-5, notes n-1 à n-6. Repli sur la même branche, avant que c5-bis branche `adopt` dans `run`. PR #151 toujours
ouverte (`origin/lot/etude-suite` relu : `ab8084fb`, aucune fusion) : la base reste `854daf8f`. Commits du repli : `b4f83b39` (tests
rouges et `.d.mts`), `9833534d` (gel), puis ce commit (G0 corrigé et G7).

### Repli

| Point | Correctif | Test | Tueur |
|---|---|---|---|
| m-1 | `adopt` appelle `guardOut(plan.out)` avant `mkdirSync`, puis de nouveau juste avant la ligne `start` (après `realpath`, l'ouverture et l'horodatage) | `l2_adopt_guards_again` : la reproduction de la G2 (après `prepare`, le parent échangé contre un lien vers un dossier qui porte `.git`) : `out_in_git_tree`, le dossier ne contient que `.git` (ni `o`, ni journal) | `scripts/record-binance-l2.mjs:219 SDL "  guardOut(plan.out);" -> ""` |
| m-1 | idem, seconde garde | `l2_adopt_guards_before_start` : le même échange pendant l'horodatage de la ligne `start` (`--out` déjà créé) : `out_in_git_tree`, aucune ligne nulle part | `:236 SDL "  guardOut(plan.out);" -> ""` |
| m-2 | `createQuota` : `check({ at, journal, pin })` compte et écrit sous `at` ; `adopt` passe sa racine fixée ; sous Linux, `--out` ouvert une fois (`O_RDONLY \| O_DIRECTORY \| O_NOFOLLOW`, sur le chemin réel) et racine `/proc/self/fd/<fd>` ; ailleurs, racine = chemin réel ; `pin` (chemin réel, puis `dev` et `ino`) juste avant chaque ajout, ligne `start` comprise | `l2_check_walk_pinned` : le lien parent échangé atomiquement (`ln -s` puis `rename`, comme `mv -T`) pendant `check()`, avant le parcours ; la sortie fixée à 75 %, l'étrangère à 90 % : le parcours compte la sortie fixée, le `pin` arrête avant l'alarme (`out_not_l2`), le journal étranger inchangé | `:146 CONST "bytesUnder(at)" -> "bytesUnder(out)"` |
| m-2 | idem | `l2_check_alarm_pinned` : l'échange entre le `pin` et l'ajout : l'alarme atterrit dans la sortie fixée, le journal étranger inchangé | `:152 CONST "join(at, \"journal.jsonl\")" -> "join(out, \"journal.jsonl\")"` |
| m-2 (Linux) | idem | `l2_check_through_descriptor` (sauté hors Linux) : `--out` renommé puis refait à son chemin réel entre le `pin` et l'ajout : l'alarme suit le descripteur (dossier renommé), rien au chemin | ``:222 CONST "`/proc/self/fd/${fd}`" -> "real"`` |
| n-2 | `dev` et `ino` de `--out` fixés à la prise (`fstat` du descripteur sous Linux, `stat` du chemin réel ailleurs), comparés dans `pin` | `l2_check_directory_pinned` : `--out` renommé, un dossier neuf au même chemin : `out_not_l2`, `why: "another directory"` | `:227 CONST "now.dev !== id.dev \|\| now.ino !== id.ino" -> "false"` |
| m-3 | `ENOENT`, `ENOTDIR`, `ELOOP` levées dans `adopt` (ligne `start`) ou `check()` : `out_not_l2`, `why: "real path changed"`, `error` le code | `l2_check_path_vanished_named` : `--out` supprimé entre le `pin` et l'ajout : `out_not_l2`, pas d'`ENOENT` brut | `:231 CONST "RACED.includes(e?.code)" -> "false"` |
| m-4 (a) | aucun changement de code | `l2_seal_one_scale` : la seconde différence pose un nouveau meilleur prix (100.50) que le ticker tient : `crosscheck` exact | `scripts/l2/seal.mjs:28 CONST "bestTap({ scale, start" -> "bestTap({ scale: 3, start"` (le mutant `scale: 1` de la G2 est tué aussi, vérifié à la main) |
| m-4 (b) | aucun changement de code | `l2_check_journal_single_link` : `journal.jsonl` lié physiquement après la prise : `check()` arrête, `hard link` | `:241 CONST "[\"journal.jsonl\", \"requests.jsonl\"]" -> "[\"requests.jsonl\"]"` |
| n-4 (Q-C5-5) | `prepare` compte (et arrête à 85 %) sans journaliser (`check({ journal: false })`) ; `adopt` finit par un premier `check()`, qui journalise l'alarme après `ownJournal` et la ligne `start` | `l2_quota_alarm_at_adopt` : le `journal.jsonl` d'un autre outil seul, à 75 % : refusé par `adopt`, octets inchangés ; une sortie de cet enregistreur à 75 % : `start` puis `quota_alarm` | `:174 CONST "check({ journal: false })" -> "check()"` |
| n-3 | ajouts ouverts en `O_NONBLOCK` ; `fstat().isFile()` exigé avant `nlink` (`why: "not a regular file"`) ; `ENXIO` (FIFO sans lecteur) nommé de même ; `ownJournal` ouvre aussi en `O_NONBLOCK` (une FIFO y rend `out_not_l2`) | `l2_append_not_a_file` (sauté sous win32) : `journal.jsonl` FIFO, sans lecteur puis avec : `out_not_l2` deux fois, jamais bloqué | `:192 CONST "!fstatSync(fd).isFile()" -> "false"` |
| m-5 | documentaire : G0 point 3, Q-C5-3, table des mesures ci-dessus, « Suite » ci-dessous | — | — |

Tueurs existants : renumérotés au gel `9833534d` (l2-loop `:207`, `:193`, `:241`, `:240`, `:196` ; l2-record `:147`, `:148`, `:175`,
`:269`, `:170`, `:161`) ; celui de `l2_check_real_path_pinned` porte désormais sur la condition du chemin réel (`:225 CONST
"(existsSync(plan.out) ? realpathSync.native(plan.out) : null) !== real" -> "false"`) : `adopt` fixe et revérifie dès la prise, et
l'ancien mutant (`=== real`) arrêtait `adopt` lui-même, rouge sans assertion ; celui de `l2_check_single_links` suit le texte
`join(at, name)`.

**Reproductions de la G2, désormais fermées** :
- m-1 (`toctou` de la G2) : parent échangé contre un lien vers un dépôt après `prepare` : `out_in_git_tree`, ni `mkdir -p` ni journal
  dans le dépôt ;
- m-2 (`race.mjs`, 5 sur 5) : l'échange atomique du lien parent pendant le parcours : le parcours et l'ajout passent par le descripteur
  (Linux) ou le chemin réel ; le `pin` arrête avant l'ajout ; aucune `quota_alarm` dans le journal étranger ;
- m-3 (E2) : un chemin qui disparaît en plein `check()` sort `out_not_l2`, plus d'`ENOENT` brut ;
- n-2 (E5) : `--out` renommé puis recréé : `another directory`, plus un `check()` à 0 ;
- n-4 (E3, Q-C5-5) : plus aucune ligne dans le journal d'un autre outil avant le refus ;
- n-3 : une FIFO à la place de `journal.jsonl` ne bloque plus.

**Reste déclaré** :
- win32 (pas de `/proc`) : la racine est le chemin réel, revérifié (chemin et `dev`/`ino`) juste avant chaque ajout ; un échange entre
  ce `pin` et l'`open` de l'ajout reste possible (fenêtre de l'ordre d'un appel système) ; la cible de l'enregistreur est Linux
  (systemd, `MemoryMax`) ;
- `mkdirSync(plan.out, { recursive: true })` suit le chemin donné : un échange entre la première garde et `mkdir` peut créer des
  dossiers vides à travers un lien ; la seconde garde arrête avant toute ligne ;
- le descripteur de `--out` reste ouvert pour la vie du processus (un par `adopt` ; c5-bis adopte une fois) ;
- mutant survivant : le `pin()` avant la ligne `start` retiré. Sous Linux, l'écriture passe par le descripteur et atterrit dans le dossier
  fixé ; le `pin` n'y fait qu'arrêter plus tôt ; il n'est observable que sous win32. Mutants vérifiés à la main et tués : `pin()` retiré
  avant l'alarme (trois tests), `ENXIO` non nommé, premier `check()` d'`adopt` retiré (cinq tests).

### Preuves

- Tueurs à la main, un à la fois, au gel `9833534d`, le test seul rejoué, fichier restauré et sha256 vérifié : les 44 tueurs des deux
  fichiers touchés (23 de `l2-loop`, 21 de `l2-record`) rougissent leur test par assertion (trois par un `deepEqual` dont le diff porte
  une fonction, que TAP rapporte `ERR_TEST_FAILURE` avec le diff d'assertion : `l2_adopt_journal_of_this_recorder`,
  `l2_guard_out_links_refused`, comme à l'ancien gel).
- Tests de resserrement contre l'ancien gel (les nouveaux tests avec la commande de `f30874d8`) : huit rouges (`guards_again`,
  `guards_before_start`, `walk_pinned`, `alarm_pinned`, `through_descriptor`, `directory_pinned`, `path_vanished_named`,
  `alarm_at_adopt`) ; `append_not_a_file` y bloque sur la FIFO (le défaut n-3 lui-même, arrêté par délai) ; deux verts, qui épinglent un
  comportement déjà là et que leur tueur tue (`seal_one_scale`, `check_journal_single_link`).
- `node scripts/red-proof.mjs --base 854daf8f --gel 9833534d --repo /home/user/monark-governance-c5 --draw 23 --seed 37` : « red-proof
  OK: 23 judged, 21 unchanged, 23 killer(s) drawn » ; 23 F2P, les 23 tueurs tués ; `RED-PROOF.json` sha256 `b760e73fd9e1b004…`.
- Ancres : `verifie-ancres.mjs . --touched 854daf8f HEAD` : 44 tueurs, 44 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts,test/l2-record.test.ts,test/l2-loop.test.ts` : 88 tueurs, 88 ANCRE.
- `node --test test/l2-*.test.ts` : 139 sur 139. `npm test` complet, une fois, dans le worktree : 2 345 tests, 2 323 réussis, 0 échec, 22 ignorés, sortie 0.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml`, base `854daf8f`) : `STAT` 543 (518 insertions,
  25 suppressions) ; borne du lot 547, marge 4 ; `CONTENT_STAT` 0 ; GREEN.

### Avis de la G2 sur Q-C5-1 à Q-C5-9, et suite

- Q-C5-1, Q-C5-2, Q-C5-4, Q-C5-8, Q-C5-9 : accord de la G2, défauts maintenus.
- Q-C5-3 : décision appliquée ; la G2 ajoute que le mécanisme `Worker` ne tient pas sa promesse sous ce node (m-5) : c5-bis la mesure.
- Q-C5-5 : accepté comme déclaré par la G2 ; fermé par ce repli (n-4).
- Q-C5-6 : désaccord de la G2 sur la prémisse, retenu : `/proc/self/fd/<fd>/…` est l'équivalent d'`openat` sous Linux, et la fenêtre
  réelle comprenait l'écriture de la commande dans `check()` ; corrigé ici (m-2), prémisse corrigée au G0.
- Q-C5-7 : accepté par la G2 pour les modules ; le test de `journal.jsonl` manquant est ajouté (m-4 b).

### Suite (notes et réserve de la G2)

- **m-5, G0 de c5-bis** : sous node v24.21.0, `resourceLimits.maxOldGenerationSizeMb` n'est pas un plafond dur (tas d'un `Worker`
  plafonné à 64 ou 256 Mio monté à environ 1,95 Gio sans erreur, `ERR_WORKER_OUT_OF_MEMORY` après 54 à 71 s ; 221 Mio tenus sous 64 Mio
  jusqu'au bout), et les `ArrayBuffer`/`Buffer` n'y comptent pas (index et canon, environ 224 Mio externes au ras d'`INDEX_BOUND` ;
  passage de canon en `Buffer`). Sous `MemoryMax=512M`, un scellé qui déborde tue toute l'unité. c5-bis : (1) refaire L2-MINUTES-SIZE-1
  dans le fil de scellé, sous le cgroup, boucle vivante, en lisant `memory.peak` (v2) ou `memory.max_usage_in_bytes` (v1), jamais
  VmHWM ; (2) chiffrer le budget : tas plafonné, plus externes bornés par `INDEX_BOUND`, plus tas de la boucle, sous 512 Mio ; (3) si le
  budget ne tient pas, sceller dans un processus enfant plafonné par drapeau (`--max-old-space-size`), le dépassement fatal à l'enfant
  seul, à confronter à SERIES-ENV-ALLOWLIST-1 (la garde d'`execArgv` vise le processus de l'enregistreur) ; (4) `OOMPolicy` de l'unité
  (P3).
- **c5-bis, racine fixée** : passer la racine d'`adopt` (descripteur sous Linux) aux modules a3, b1 et b2, qui écrivent encore par
  chemin (Q-C5-6, Q-C5-7). Avec m-3, un fichier qui disparaît sous `days/` pendant un scellé concurrent du parcours (lien puis
  déliaison de `day.mjs`) arrêterait l'enregistrement (`out_not_l2`, `ENOENT`) : c5-bis compte une entrée disparue entre la liste et le
  `lstat` comme absente, ou ne lance pas `check()` pendant un scellé.
- **n-1 (M-1 ou c6)** : `snapshot_reload` ne compare que le `lid` ; un corps de même `lid` et d'autres niveaux passe. Fermer : hacher les
  octets lus à la pose, les confronter à `SHA256SUMS`. Hors du contrat de b1 (`wx`). Affirmation du G0 (point 2) corrigée.
- **n-2** : fermé ici (`dev`, `ino`).
- **n-5 (RUNBOOK de M-1)** : un `journal.jsonl` vide (coupure entre sa création et la ligne `start`) rend la sortie non reprenable
  (`out_not_l2`) ; échec fermé ; la reprise demande de retirer ce fichier vide à la main.
- **n-6** : survivants équivalents de la G2 (M8b, M23, M27) sans test ; M14, M20 et M28 étaient couverts en course par m-1 et m-2.

## Rejeu Windows de MONARK (2026-10-05) : deux sauts nommés

`l2_check_walk_pinned` et `l2_check_alarm_pinned` rendaient `EPERM` sous Windows : leur échange atomique du lien parent de `--out` (`swap()` de `staged()`, un `renameSync` sur un lien de dossier existant) n existe pas sous win32, qui refuse ce renommage même sans descripteur ouvert (mesure de MONARK). Le code rend l `EPERM` tel quel, ce qui est juste. Les deux tests sont sautés sous win32 avec leur raison écrite, comme `l2_append_link_named` ; ils restent jugés sous Linux, où l épinglage par descripteur qu ils prouvent existe (sous win32, la fenêtre est déclarée plus haut, risques déclarés). Test seul, deux lignes ; aucune ligne visée par un tueur ne bouge ; R-25 547.
