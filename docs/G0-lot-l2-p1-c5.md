# G0 du lot P1-c5 du chantier L2 : composition du scellé et prise de la sortie (première moitié de la boucle d'enregistrement)

- **Rattachement** : ADR-L2-CAPTURE-1 (D-11, D-20, D24-4, Q-11) ; plan `docs/G0-partie-l2-p1.md` §3 points 14, 19 et 22, §8.1 (scission
  au point pré-déclaré, jamais de compaction), §8.2 (ligne P1-c5), §8.3 (c5 sur a4, b1, c1, c2, c3 et c4) ; G0 et G7 de c1 à c4 ; G2 de
  c2 et de sa re-revue, de c3, de c4 et de sa re-revue (`recherches/coordination/pieces/2026-10-04-G2-recherches/`).
- **Base** : `854daf8f` (tête de `recherches/l2-p1-c4`, PR #151 ouverte sur `lot/etude-suite`, non fusionnée à l'ouverture). Branche
  `recherches/l2-p1-c5`. Auteur : RECHERCHES. Aucun réseau : rien ne s'ouvre vers une place ; sorties sous le dossier temporaire du
  système, hors de tout arbre git ; trames synthétiques seules, aucune série de marché au dépôt.

## Scission (§8.1 du plan)

Le plan chiffre c5 à 186 lignes (c 50, d 16, t 120 : deux tests de composition à 60). Les lots c1 à c4 lui ont renvoyé onze points
(liste ci-dessous) ; la boucle elle-même compose cinq liaisons (a3, a4 : `switched(cid)` après `switchTo`, contrainte de Q-A4-3), le REST
(b1 : écart d'horloge à la minute 30, `exchangeInfo` à 23:58, suspension de Q-P1-6 « code et test en c5 »), la chaîne (b2), les ancres
(23:59:10), les coupes, les scellés dans un fil de travail (Q-5 de a2, Q-C1-9), `closed(cid, seg)` (Q-C1-5), `tail_marked` (Q-C1-4),
la borne de `stop()` sur un disque bloqué (Q-8 de a3) et l'arrêt propre. Estimation : points renvoyés 366 lignes (mesurées au brouillon,
détail plus bas), boucle 330 à 420 (c 150 à 190, d 30, t 150 à 200) : 700 à 790, au-dessus de 547. Le plan ne pré-déclare pas de point
de scission pour c5 ; ce G0 le déclare, avant tout code commis :

- **P1-c5 (ce lot) : composition du scellé et prise de la sortie.** Le crochet de scellé qui compose c2 et c3, l'empreinte de la commande
  au manifeste, L2-SNAPSHOT-RELOAD-1, L2-MINUTES-SIZE-1 (mesure faite, bornes provisoires posées), et la manière dont un enregistrement
  prend `--out` (m-8, n-5, n-5bis, n-7, n-2, n-8 des G2 de c4). La commande s'arrête encore `not_built` après ses gardes : `run` est
  inchangé.
- **P1-c5-bis (lot suivant) : boucle d'enregistrement.** Contenu de la ligne P1-c5 du plan : composition des liaisons, du REST, de la
  chaîne et du jour, horaires (§3 points 6, 13, 14, 15), coupes, scellés, arrêt propre ; tests `l2_record_loop_schedules` et
  `l2_record_loop_clean_stop` ; plus les points renvoyés à la boucle (section « Re-différés »). Mêmes fichiers, plus ce qu'écrit ce lot.

Q-C5-1 porte cette scission ; elle ne touche ni la zone de MONARK ni une surface servie ou publique (l'enregistreur est hors de la liste
d'export).

## Points renvoyés à c5 : traités ici, ou re-différés avec leur raison

| Point | Source | Ici |
|---|---|---|
| L2-MINUTES-SIZE-1 | G2 de c2 (m-b), étendu au G2 de c3 (m-1) | mesure conjointe faite sous cgroup 512 Mio (point 3) ; bornes provisoires posées : `minutes.jsonl` 64 Mio, `canonDay` 32 Mio |
| L2-SNAPSHOT-RELOAD-1 | re-revue de c2, m-c | `derive.mjs:106` : arrêt nommé `snapshot_reload` (point 2) |
| n-5 de c3 | G2 de c3 | une seule `scale` pour `bestTap` et `deriveDay` ; clés de manifeste et de `missing.json` disjointes à la fusion (point 1) |
| ordre de composition | G7 de c3, Q-C3-4 | `bestTap`, puis `deriveDay` avec le `tap`, puis `canonDay` avec son résultat (point 1) |
| n-3 de c3 | G2 de c3 | durée du scellé chiffrée au calendrier (point 3) ; le calendrier lui-même est de c5-bis |
| n-6 de c3 | G2 de c3 | re-différé : recoupement de valeur du ticker, item de M-1 (il faut des trames réelles) |
| n-7 de c3 | G2 de c3 | re-différé à M-1 : `bestTap` compare les quantités telles que reçues, la parité les normalise ; sans effet tant que la place écrit à précision fixe, ce que M-1 vérifie ; la composition n'y change rien |
| Q-C4-5 | G0 et G2 de c4 | l'empreinte de la commande (et de `seal.mjs`) au `script_sha256` du jour (point 1) |
| m-8 | re-revue de c4 | `guardOut` : un parent fichier ordinaire arrête, `out_not_l2` (point 4) |
| n-5 | G2 de c4 | une sortie reprise n'est adoptée que si la première ligne de son journal est un `start` de cet enregistreur (point 5) |
| n-5bis | re-revue de c4 | écritures de la commande par un descripteur dont `nlink` vaut 1 ; `journal.jsonl` et `requests.jsonl` contrôlés à chaque `check()` (point 5) |
| n-7 | re-revue de c4 | chemin réel de `--out` fixé à la prise, revérifié à chaque `check()` (point 5) ; node n'a pas d'`openat`, mais sous Linux `/proc/self/fd/<fd>/…` en tient lieu (prémisse corrigée au repli du G2 ; Q-C5-6, point 5) |
| n-2 | G2 de c4 | les gardes de `--out` refaites à chaque `check()`, `.git` compris (point 5) |
| n-8 | re-revue de c4 | `ELOOP` d'un ajout nommé `out_not_l2` (point 5) |
| n-3 de c4 | G2 de c4 | re-différé à c5-bis : le rythme de `check()` est un horaire de la boucle ; donnée : 3,3 µs par fichier, environ 1 s à 300 000 fichiers |

## Contenu

Fichiers : `scripts/l2/seal.mjs` et `scripts/l2/seal.d.mts` (neufs), `scripts/record-binance-l2.mjs` et `.d.mts`, `test/l2-loop.test.ts`
(neuf, le fichier de tests de c5 au plan) ; changés en place, sans ligne ajoutée : `scripts/l2/day.mjs` (`:23`, `:35`, `:191`),
`scripts/l2/derive.mjs` (`:13`, `:106`), `scripts/l2/day.d.mts` (un commentaire) ; `test/l2-record.test.ts` : la ligne du tueur de
`l2_main_runs_by_real_path` renumérotée (`:197` → `:241`), aucun corps de test touché.

1. **Crochet de scellé** (`seal.mjs`, Q-C5-2) : `hookOf(scale, bounds)` rend le crochet `derive` de `sealDay` : `bestTap({ scale, start,
   end })`, puis `deriveDay({ ...ctx, scale, bound: bounds.minutes, tap })`, puis `canonDay({ ...ctx, best: result(), bound:
   bounds.canon })` ; une seule variable `scale` pour les deux (n-5 de c3). `mergeDerived(symbol, day, parts)` réunit fichiers,
   références et modules dans l'ordre des parties ; une clé de manifeste de deux parties, ou de `missing.json` de deux parties, arrête
   (`stray_file`, `keys`), jamais un écrasement. Modules ajoutés : `seal` et la commande (`COMMAND` = `../record-binance-l2`) ;
   `day.mjs:191` nomme chaque module par `posix.join("scripts/l2", …)`, d'où la clé `scripts/record-binance-l2.mjs` (Q-C4-5, Q-C1-8) ;
   les clés des modules de `scripts/l2/` ne changent pas. `sealOf({ scale, bounds, ...spec })` = `sealDay` avec ce crochet : la couture
   de c5-bis (horaires) et de c6 (rejeu).
2. **L2-SNAPSHOT-RELOAD-1** (contrat d'écriture de `rest/` : b1 écrit chaque instantané une fois, `flag: "wx"`, jamais réécrit) : à la
   pose du carnet, l'instantané relu dont le `lastUpdateId` diffère de celui lu à la liste, ou illisible, arrête le dérivé du symbole,
   nommé `snapshot_reload` (aux `STOPS` de `day.mjs`), rien d'écrit (Q-C5-9). Plus de `TypeError` hors des `STOPS`. Limite (n-1 du G2 de
   c5) : seul le `lastUpdateId` est comparé ; un corps réécrit avec le même `lastUpdateId` et d'autres niveaux passe, et `SHA256SUMS`
   hache le fichier en fin de scellé. Fermer demande de hacher les octets lus à la pose (M-1 ou c6).
3. **L2-MINUTES-SIZE-1, mesure conjointe** (Node v24.21.0, ce poste, 2026-10-05 entre 06:30 et 07:10 UTC). Jour synthétique au ras de
   `INDEX_BOUND` (4 193 304 trames, dont 4 191 664 `@bookTicker`, pire cas de c1), `minutes.jsonl` de 58,6 Mio (820 niveaux par côté
   dans ±100 pb, une différence par minute), un passage de même clé de 15 Mio (200 trames de `t` égal) ; scellé par `sealOf` ; cgroup v1
   enfant, `memory.limit_in_bytes` = 512 Mio (l'équivalent de `MemoryMax=512M` de D24-4 sur ce poste) ; VmHWM lu à la fin :
   - sans plafond de tas (tas de V8 à 8 195 Mio par défaut, cgroup ignoré) : index seul, scellé en 45 s, 374 Mio ; index et minutes,
     94 s, 361 Mio ; composition complète (avec `canonDay`) : **tuée par le noyau** (OOM) à 129 s. Hors cgroup, la même composition
     monte à 566 Mio en 153 s ; `canonDay` ajoute environ 42 octets par trame (cinq colonnes, la permutation, les tickers) ;
   - même jour, tas plafonné à 256 ou 192 Mio : scellé sous le cgroup, VmHWM 467 et 476 Mio, 186 à 192 s ;
   - bornes par défaut (minutes au ras de 128 Mio, 1 680 niveaux par côté ; passage de 31 Mio), tas plafonné à 256 Mio : tuée (OOM) ;
   - moitié de la borne d'index (2 096 152 trames), bornes provisoires, sans plafond : scellé sous le cgroup, VmHWM 525 Mio.

   Lecture du VmHWM (repli du G2, m-5) : VmHWM compte des pages de fichiers que le cgroup ne facture pas forcément ; 525 Mio au-dessus
   d'une limite de 512 Mio n'est donc pas une contradiction, mais ce n'est pas non plus la métrique du budget. La mesure de clôture lit
   celle du cgroup (`memory.max_usage_in_bytes` en v1, `memory.peak` en v2).

   Lecture : la mesure conjointe échoue au pire cas sans plafond de tas, même avec les bornes provisoires ; elle passe avec elles et un
   tas plafonné ; elle échoue aux bornes par défaut. Ce lot pose donc les bornes provisoires (`SEAL_BOUNDS` : 64 Mio et 32 Mio) et
   renvoie le plafond du tas à c5-bis, qui scelle dans un fil de travail (Q-5 de a2) : `resourceLimits.maxOldGenerationSizeMb` du
   `Worker` plafonne le tas sans drapeau de node (la garde d'`execArgv` de c4 reste entière), et un dépassement y devient
   `ERR_WORKER_OUT_OF_MEMORY`, nommable, au lieu d'une mort du processus (Q-C5-3). **Prémisse contredite par la G2 (m-5)** : sous node
   v24.21.0, `maxOldGenerationSizeMb` n'est pas un plafond dur (tas d'un `Worker` plafonné à 64 Mio monté à environ 1,95 Gio ;
   `ERR_WORKER_OUT_OF_MEMORY` après 54 à 71 s) et ne compte ni les `ArrayBuffer` ni les `Buffer` : les colonnes de l'index et de canon
   (environ 224 Mio au ras d'`INDEX_BOUND`) et le passage de canon sont externes. c5-bis doit donc mesurer, pas supposer (G7, « G2 »). L'item reste ouvert : sa clôture est la même mesure,
   faite dans le fil de travail de c5-bis, puis sous l'unité (P3). Durée (n-3 de c3) : un scellé au ras de la borne prend de 45 s (index
   seul) à 190 s (composition, tas plafonné) par symbole : c5-bis ne scelle jamais sur le fil des liaisons.
4. **m-8** (`record-binance-l2.mjs:104`, changée en place) : `--out` absent dont l'ancêtre existant le plus proche n'est pas un dossier :
   `out_not_l2`, `why: "not a directory"`, `entry` cet ancêtre ; la racine absente simulée de c4 n'est pas touchée (`exists` de
   l'appelant).
5. **Prise de la sortie** (`adopt(plan, io)`, après `prepare`, avant toute ouverture) :
   - n-5 : une sortie reprise n'est adoptée que si la première ligne de `journal.jsonl` (lue dans ses 4 096 premiers octets, sans
     suivre de lien) est un `start` de cet enregistreur, sinon `out_not_l2` ; la ligne `start` de Q-C1-10 gagne `recorder` =
     `scripts/record-binance-l2.mjs` (Q-C5-4) : `{ host_us, mono_ns, symbol: "ALL", cid: null, event: "start", recorder }`, écrite la
     première dans une sortie neuve ;
   - n-7 : `--out` créé, son chemin réel fixé (`realpathSync.native`) ; `check()` arrête (`out_not_l2`, `why: "real path changed"`) si
     le chemin réel de `--out` a changé ou n'existe plus ;
   - n-2 : `check()` refait `guardOut(--out)` : `.git` au-dessus du chemin donné et du chemin réel, types des entrées ;
   - repli du G2 (m-1 à m-4, n-2 à n-4 ; détail au G7) : `guardOut` refait au début d'`adopt` et juste avant la ligne `start` ; sous
     Linux, `--out` ouvert une fois (`O_DIRECTORY | O_NOFOLLOW`), et tout parcours ou ajout de la commande passe par
     `/proc/self/fd/<fd>/…`, l'équivalent d'`openat` (ailleurs : le chemin réel, fenêtre déclarée) ; dossier fixé par `dev` et `ino` ;
     le chemin réel et le dossier revérifiés juste avant chaque ajout ; `ENOENT`, `ENOTDIR`, `ELOOP` en chemin : `out_not_l2` ;
     `prepare` compte sans journaliser, l'alarme part au premier `check()` d'`adopt` ; ajouts en `O_NONBLOCK`, fichier ordinaire exigé ;
   - n-5bis : `appendLine(path, line)` écrit une ligne par un descripteur ouvert `O_APPEND | O_NOFOLLOW` dont `fstat().nlink` vaut 1,
     sinon `out_not_l2`, rien d'écrit ; l'alarme de quota de c4 passe par elle (`:149`, changée en place) ; `check()` contrôle aussi
     `nlink` de `journal.jsonl` et de `requests.jsonl` ;
   - n-8 : un `ELOOP` à l'ouverture devient `out_not_l2`, `why: "a link"`.
   - `check()` rend les octets du quota de c4 ; son rythme est de c5-bis.

## Tests (`test/l2-loop.test.ts`), tueurs (un par test, forme close ; lignes du gel)

Chaque test affirme ce qu'il charge : `seal.mjs` par un import dynamique, `adopt` présent dans la commande ; la base, qui n'a ni l'un ni
l'autre, rougit par assertion. Le test de `derive.mjs` rougit à la base par son assertion (relecture non vérifiée).

- `l2_seal_composes_replay_then_canon` : un jour (ancre d'ouverture, deux différences, un ticker, une transaction) ; manifeste avec
  `replay`, `parity`, `canon`, et `crosscheck.ii` venu du `tap` du même rejeu (`changes` 1, `unjudged` 1). Tueur : `// killer:
  scripts/l2/seal.mjs:30 CONST "best: best.result()" -> "best: null"`.
- `l2_seal_hashes_the_command` (Q-C4-5) : clés exactes de `script_sha256`, la commande et `seal.mjs` à leur empreinte. Tueur : `// killer:
  scripts/l2/seal.mjs:31 CONST "\"seal\", COMMAND" -> "\"seal\""`.
- `l2_seal_parts_keys_disjoint` (n-5 de c3) : deux manifestes, deux `missing.json` de même clé : `stray_file`, `keys` ; fusion de parties
  disjointes. Tueur : `// killer: scripts/l2/seal.mjs:19 CONST "keys.length > 0" -> "false"`.
- `l2_seal_bounds_provisional` (L2-MINUTES-SIZE-1) : `SEAL_BOUNDS` = 64 Mio et 32 Mio ; chaque borne atteint son module
  (`minutes_bound`, `canon_bound`), rien d'écrit. Tueur : `// killer: scripts/l2/seal.mjs:29 CONST "bound: bounds.minutes" -> "bound:
  undefined"`.
- `l2_snapshot_reload_named` (L2-SNAPSHOT-RELOAD-1) : le `tap` du rejeu réécrit le second instantané gardé entre sa liste et sa pose
  (autre `lastUpdateId` ; illisible) : `snapshot_reload` deux fois, rien d'écrit. Tueur : `// killer: scripts/l2/derive.mjs:106 CONST
  "full?.lid !== s.lid" -> "false"`.
- `l2_guard_out_parent_file` (m-8) : sous un fichier, refusé, détail exact par `prepare` ; sous un dossier, sortie neuve. Tueur :
  `// killer: scripts/record-binance-l2.mjs:104 CONST "!statSync(near).isDirectory()" -> "false"`.
- `l2_adopt_journal_of_this_recorder` (n-5) : sortie neuve, la ligne `start` exacte ; reprise, un second `start` ; un `start` sans
  `recorder`, un journal sans `start` : `out_not_l2`, rien d'écrit. Tueur : `// killer: scripts/record-binance-l2.mjs:199 CONST
  "first.recorder !== RECORDER" -> "false"`.
- `l2_append_single_link` (n-5bis) : `journal.jsonl` lien physique d'un fichier d'ailleurs : `out_not_l2`, `hard link`, le fichier
  d'ailleurs inchangé. Tueur : `// killer: scripts/record-binance-l2.mjs:186 CONST "fstatSync(fd).nlink !== 1" -> "false"`.
- `l2_check_single_links` (n-5bis) : `requests.jsonl` lié physiquement après la prise : `check()` arrête. Tueur : `// killer:
  scripts/record-binance-l2.mjs:214 CONST "lstatSync(join(real, name)).nlink !== 1" -> "false"`.
- `l2_check_real_path_pinned` (n-7) : le parent de `--out` remplacé par un lien vers une autre sortie à 75 % du quota : `check()` arrête,
  `real path changed`, rien n'est écrit là-bas. Tueur : `// killer: scripts/record-binance-l2.mjs:212 CONST "!== real" -> "=== real"`.
- `l2_check_git_tree_again` (n-2) : un `.git` posé au-dessus de `--out` après la prise : `out_in_git_tree` au `check()` suivant. Tueur :
  `// killer: scripts/record-binance-l2.mjs:213 SDL "    guardOut(plan.out);" -> ""`.
- `l2_append_link_named` (n-8 ; sauté sous win32, sans `O_NOFOLLOW`) : `journal.jsonl` remplacé par un lien : `out_not_l2`, `a link`.
  Tueur : `// killer: scripts/record-binance-l2.mjs:189 CONST "e.code === \"ELOOP\"" -> "false"`.

Repli du G2 (2026-10-05) : onze tests de plus, un tueur chacun ; les lignes des tueurs existants renumérotées au nouveau gel, celui de
`l2_check_real_path_pinned` porté sur la condition du chemin réel ; liste et tueurs au G7, section « G2 ».

## Preuve rouge, contrôles, taille

- Commit de ce G0 ; commit des tests seuls (rouges, avec les `.d.mts`) ; gel ; avant le push, tronc relu, fusionné par un commit de
  fusion si #151 l'est ; puis `node scripts/red-proof.mjs --base <tête de c4 ou tronc fusionné> --gel <gel> --repo
  /home/user/monark-governance-c5 --draw n --seed 37` ; ancres par `verifie-ancres.mjs --touched`, puis avec les fichiers de test de c1 à
  c4 ; tests L2 ; `npm test` une fois dans le worktree ; `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.
- **R-25** (`r25()`, insertions plus suppressions, hors `docs/**/*.md`) : estimation au brouillon 366 : `seal.mjs` 36, `seal.d.mts` 16,
  tests 238, commande 49/5, `.d.mts` 8, `day.mjs` 3/3, `derive.mjs` 2/2, `day.d.mts` 1/1, `l2-record.test.ts` 1/1. Borne 547, marge
  environ 180. Écart au plan : c5 du plan (186) devient c5 et c5-bis (scission ci-dessus).

## Re-différés à c5-bis (la boucle), avec leur raison

- n-3 de c4 (rythme de `check()`) : un horaire de la boucle.
- Q-P1-6 et Q-B1-3 (suspension nommée sous 4 000 de poids par minute, « code et test en c5 ») : lue sur `exchangeInfo` du jour par la
  boucle.
- Q-A4-3 (`switched(cid)` après `switchTo`, crochet posé) ; Q-8 de a3 (borne de `stop()` sur un disque bloqué) ; Q-C1-4 (`tail_marked`)
  et Q-C1-5 (`closed(cid, seg)`) : la boucle tient les écrivains et les liaisons.
- Q-5 de a2 et Q-C1-9 (scellé dans un fil de travail) avec le plafond du tas de Q-C5-3 ; L2-MINUTES-SIZE-1 mesuré à nouveau là.
- Q-G2B-3 de c1 (temporaire `../.<jour>.SHA256SUMS.tmp` après une coupure) : la ligne `start` de ce lot ne le touche pas ; c5-bis
  décide au calendrier du scellé (défaut proposé : le laisser, inerte).
- L2-TLS-PEER-UNATTESTED-1 (déclencheur M-1 puis c5) : la boucle compose le REST ; rien à faire ici.
- m-1 du G7 de c1 (segments bruts non synchronisés par a2) : à dire au G0 de c5-bis, qui ferme les écrivains.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie)

- **Q-C5-1** : scission de c5 en c5 (composition du scellé, prise de la sortie) et c5-bis (boucle), point déclaré ici faute de point
  pré-déclaré au plan ; c6 attend c5-bis. (défaut : oui)
- **Q-C5-2** : le crochet composé vit dans un module neuf `scripts/l2/seal.mjs`, hors des fichiers du plan pour c5 : la boucle (c5-bis)
  et le rejeu (c6) l'appellent tous deux, et la commande garde ses lignes (les 21 tueurs de c4 restent ancrés, un seul renuméroté).
  (défaut : oui)
- **Q-C5-3** : bornes provisoires posées (64 Mio, 32 Mio) ; le scellé de c5-bis tourne dans un `Worker` au tas plafonné par
  `resourceLimits` (valeur mesurée : 256 Mio passe au pire cas), jamais par un drapeau de node ; `ERR_WORKER_OUT_OF_MEMORY` devient un
  arrêt nommé du dérivé du symbole. `INDEX_BOUND` inchangé. (défaut : oui ; prémisse du `Worker` contredite par la G2, m-5 : à mesurer
  en c5-bis, voir G7)
- **Q-C5-4** : la ligne `start` porte `recorder` en plus du contrat de Q-C1-10 ; `missingOf` de c1 ne lit que `event`. (défaut : oui)
- **Q-C5-5** : la vérification de n-5 est dans `adopt`, pas dans `guardOut` ni `prepare` : les fixtures de c4 (journaux de quelques
  octets) restent valides, et `prepare` n'écrit que l'alarme de quota, désormais par `appendLine` (aucun lien suivi, un seul lien
  physique). Le reste déclaré à l'ouverture (à 70 % au départ, l'alarme pouvait s'ajouter au journal d'un dossier étranger avant que
  `adopt` le refuse) est fermé au repli du G2 (n-4) : `prepare` ne journalise plus, l'alarme part au premier `check()` d'`adopt`. (défaut : accepté)
- **Q-C5-6** : n-7 par chemin réel fixé et revérifié à chaque `check()`. Prémisse corrigée au repli du G2 : node n'a pas d'`openat`,
  mais sous Linux `/proc/self/fd/<fd>/…` donne l'écriture relative à un dossier ouvert (vérifié sous node v24.21.0) ; la commande y passe
  désormais. Hors Linux (win32) : chemin réel fixé, revérifié avant chaque ajout, fenêtre résiduelle déclarée. Les modules a3, b1 et b2
  écrivent encore par chemin (`appendFileSync`) : c5-bis peut leur passer cette racine. (défaut : accepté, déclaré)
- **Q-C5-7** : n-5bis pour les écritures des modules : contrôlé à chaque `check()` (`journal.jsonl`, `requests.jsonl`), pas à chaque
  ajout de a3, b1, b2. (défaut : accepté, déclaré)
- **Q-C5-8** : n-6 et n-7 de c3 re-différés à M-1 (trames réelles nécessaires). (défaut : oui)
- **Q-C5-9** : `snapshot_reload`, nom dédié aux `STOPS` de `day.mjs`, plutôt que `stray_file`. (défaut : oui)
