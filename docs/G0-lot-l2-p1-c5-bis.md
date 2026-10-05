# G0 du lot P1-c5-bis du chantier L2 : scission, puis P1-c5-bis-a (ce que la boucle prend de ses modules, et le scellé à part)

- **Rattachement** : ADR-L2-CAPTURE-1 (D-8, D-11, D-21, D24-3, D24-4) ; plan `docs/G0-partie-l2-p1.md` §3 points 6, 13, 14, 15 et 22,
  §7, §8.1 (scission au point déclaré avant tout code, jamais de compaction), §8.2 (ligne P1-c5), §8.3 ; G0 et G7 de c1 à c5 ; G2 de c2
  (et delta), c3, c4 (et delta) et c5 (`recherches/coordination/pieces/2026-10-04-G2-recherches/`).
- **Base** : `f330ab1c` (tête de `recherches/l2-p1-c5`, PR #153 empilée sur #151, toutes deux ouvertes, non fusionnées à
  l'ouverture). Branche `recherches/l2-p1-c5-bis`. Auteur : RECHERCHES. Aucun réseau vers une place : liaisons sur des sockets menées à
  la main ou sur la place factice de la boucle locale ; sorties sous le dossier temporaire du système, hors de tout arbre git ; trames
  synthétiques seules, aucune série de marché au dépôt.

## Scission (§8.1 du plan)

c5-bis porte la ligne P1-c5 du plan (186 lignes au plan : boucle, horaires, arrêt propre, `l2_record_loop_schedules`,
`l2_record_loop_clean_stop`) et les points que c1 à c5 lui renvoient (liste ci-dessous). Estimation au brouillon : le socle (crochet des
trames, coupe et segments clos des liaisons, segments synchronisés, queues marquées au départ, marche du quota face à un scellé
concurrent, scellé dans un processus enfant plafonné et sa mesure) environ 300 lignes, mesurées sur le brouillon ; la boucle elle-même
(horaires, REST, carnets et bascule, ancres, scellés au calendrier, rythme de `check()`, suspension de poids, arrêt propre borné, les deux
tests du plan) 365 à 440 (c 150 à 180, d 15 à 20, t 200 à 240). Total 665 à 740, au-dessus de 547. Le plan ne pré-déclare pas de point
de scission pour c5-bis ; ce G0 le déclare avant tout code commis :

- **P1-c5-bis-a (ce lot)** : ce que la boucle prend de ses modules, et le scellé à part. Les liaisons livrent chaque message à un
  crochet de l'appelant (`onText`, Q-A4-3), coupent leurs segments sur ordre (`cut()`, D24-3) et disent si un segment est encore tenu
  ouvert (`closed(cid, seg)`, Q-C1-5) ; un segment est synchronisé avant d'être fermé (m-7 du G7 de c1) ; au départ, les queues des
  dernières connexions sont marquées une fois (`markTails`, Q-C1-4) ; la marche du quota compte absent un fichier qui disparaît sous
  elle (scellé concurrent, G2 de c5) ; `adopt` rend sa racine fixée (`at`) ; le scellé de la boucle tourne dans un processus enfant
  plafonné par un drapeau de node (`sealApart`, `scripts/l2/seal-child.mjs` ; Q-5 de a2, Q-C1-9, m-5 de la G2 de c5), mesuré sous
  cgroup avec des liaisons vivantes. La commande s'arrête encore `not_built` après ses gardes : `run` est inchangé.
- **P1-c5-bis-b (lot suivant)** : la boucle. `run` en enregistrement : `prepare`, `adopt`, `markTails`, puis REST (b1, écrit sous
  `at`), carnets (b2), liaisons (a3, a4 ; `onText` vers `feed`, règle de bascule `switchTo` puis `switched`), horaires (coupe à l'heure
  pleine par `cut()`, heure de la place à la minute 30, `exchangeInfo` à 23:58:00 + 10 s × rang, ancres à 23:59:10 + 10 s × rang,
  scellés par `sealApart` après la fin du jour plus la grâce, un symbole à la fois, `open` tiré des `closed()` des liaisons), rythme de
  `check()` (n-3 de c4), suspension de poids (Q-P1-6, Q-B1-3), arrêt propre sur signal borné (Q-8 de a3), tests
  `l2_record_loop_schedules` et `l2_record_loop_clean_stop`. Mêmes fichiers que c5, plus ceux de ce lot.

Q-C5B-1 porte cette scission ; elle ne touche ni la zone de MONARK ni une surface servie ou publique (l'enregistreur est hors de la liste
d'export).

## Points renvoyés à c5-bis : traités ici, renvoyés à c5-bis-b, ou re-différés avec leur raison

| Point | Source | Suite |
|---|---|---|
| n-3 de c4 (rythme de `check()`) | G2 de c4, G0 de c5 | c5-bis-b : un horaire de la boucle ; donnée : environ 1 s à 300 000 fichiers, synchrone |
| Q-P1-6, Q-B1-3 (plafond du jour sous 4 000 : suspension nommée) | plan §11, décisions du 2026-10-04 | c5-bis-b : lu sur `exchangeInfo` du jour par la boucle |
| Q-A4-3 (`switched(cid)` après `switchTo`, crochet des trames) | G7 de a4 | ici : le crochet `onText` (point 1) ; c5-bis-b : la règle de bascule et l'appel de `switched` |
| Q-8 de a3 (borne de `stop()` sur un disque bloqué) | G1 de a3 | c5-bis-b : l'arrêt propre borne l'attente des écrivains |
| Q-C1-5 (`closed(cid, seg)` fourni par c5) | G0 et G7 de c1 | ici (point 2) |
| Q-C1-4 (`tail_marked` à la reprise) | G0 et G7 de c1 | ici (point 4) |
| Q-5 de a2, Q-C1-9 (scellé hors du fil des liaisons) avec m-5 de la G2 de c5 | G1 de a2, G7 de c1, G2 de c5 | ici : processus enfant plafonné, mesure sous cgroup, liaisons vivantes (points 5 et 6) |
| L2-MINUTES-SIZE-1 | G2 de c2 et c3, G0 de c5 | ici : mesure refaite dans l'enfant, sous cgroup, boucle vivante, lue sur le cgroup (point 6) ; item ouvert jusqu'à la mesure sous l'unité (P3) |
| scellé concurrent (fichier disparu sous `days/`) | G2 de c5, suite | ici (point 3) |
| Q-G2B-3 de c1 (`../.<jour>.SHA256SUMS.tmp` après une coupure) | second G2 de c1 | ici, décidé au défaut : laissé, inerte ; s'il disparaît sous la marche, compté absent (point 3) |
| m-7 du G7 de c1 (segments bruts non synchronisés) | G7 de c1 | ici (point 2) |
| racine fixée passée aux modules a3, b1, b2 | G2 de c5 (Q-C5-6, Q-C5-7) | ici : `adopt` rend `at` ; c5-bis-b la passe à `openLink`, `createRest`, `createBook` |
| L2-TLS-PEER-UNATTESTED-1 | G7 de b1-bis | re-différé après M-1 : « porteur c5, après M-1 », le seuil se fixe sur la densité mesurée en M-1 |
| n-1 de la G2 de c5 (relecture par `lid` seul) | G2 de c5 | inchangé : M-1 ou c6 |
| n-5 de la G2 de c5 (journal vide après coupure) | G2 de c5 | inchangé : RUNBOOK de M-1 |

## Contenu

Fichiers : `scripts/l2/seal-child.mjs` (neuf) ; `scripts/l2/seal.mjs` et `.d.mts`, `scripts/l2/links.mjs` et `.d.mts`,
`scripts/l2/segments.mjs` et `.d.mts`, `scripts/record-binance-l2.mjs` et `.d.mts` ; `test/l2-loop.test.ts` (le fichier de tests de c5
au plan : onze tests ajoutés à la fin) ; `test/l2-record.test.ts` : la ligne du tueur de `l2_main_runs_by_real_path` renumérotée
(`:269` → `:287`), aucun corps de test touché. Les lignes portant les tueurs de a3, a4, a2, c4 et c5 ne bougent pas : les ajouts de
`links.mjs` vont à la fin de l'objet rendu, ceux de `seal.mjs` à la fin du fichier, les autres changent leur ligne en place.

1. **Crochet des trames** (Q-A4-3 ; `links.mjs:181`, changée en place) : chaque message texte, une fois que son écrivain l'a, va à
   `io.onText(text, cid)` s'il est fourni ; un message binaire jamais (il ferme la connexion, a3). La boucle (c5-bis-b) y branche
   `book.feed`.
2. **Coupe et segments clos** (D24-3, Q-C1-5, m-7 de c1) : la liaison tient `live`, `<cid>` → son écrivain jusqu'à sa fermeture
   complète (`:109`, `:146`, `:167`, changées en place) ; `cut()` coupe chaque écrivain tenu (le segment ouvert se ferme une fois son
   heure passée, sans attendre de trame) ; `closed(cid, seg)` est vrai sauf si un écrivain de la liaison tient ce segment ouvert (un
   `<cid>` qu'elle ne tient plus : vrai ; le disque seul ne le dit pas, Q-C1-5). `segments.mjs:70` (en place) : chaque fichier d'un
   segment est synchronisé (`FileHandle.sync`, fsync) puis fermé ; une fois par heure et par connexion.
3. **Marche du quota face à un scellé concurrent** (`record-binance-l2.mjs:133`, en place) : un fichier listé puis disparu avant son
   `lstat` compte zéro (`throwIfNoEntry: false`) au lieu d'arrêter l'enregistrement (`out_not_l2`, `ENOENT`, par m-3 de c5). C'est le
   temporaire `days/<SYMBOLE>/.<jour>.SHA256SUMS.tmp` que `sealDay` lie puis délie pendant que le parent compte. Le `pin` de `--out`
   (m-3) reste nommé ; seul un fichier sous la marche est absous.
4. **Queues marquées au départ** (Q-C1-4 ; `markTails(at, io)`, après `adopt`, avant toute liaison) : lit `journal.jsonl` ; retient
   les `<cid>` des lignes `open` du dernier passage qui en a (un passage mort avant ses liaisons, sa ligne `start` seule, renvoie au
   précédent) ; pour chacun, son dernier segment sur le disque (les précédents ont été fermés entiers) passe `checkTail` de a2 ; une
   queue trouvée, et pas encore marquée (`cid/seg` d'une ligne `tail_marked`), est journalisée une fois par `appendLine` : la tête de a3
   (`symbol` tiré du `<cid>`, `ALL` pour `/market`), `event: "tail_marked"`, puis les champs de `Tail`, que `sealDay` lit comme marque.
   Les passages antérieurs ont été vérifiés au départ qui les suit. `adopt` rend `{ real, at, check }` (`:245`, en place).
5. **Scellé à part** (Q-5 de a2, Q-C1-9, m-5 de la G2 de c5 ; Q-C5-3 révisée sur mesure, point 6) :
   - `sealApart(spec, { env, heapMb })` (`seal.mjs`) lance `process.execPath` avec deux arguments avant la spécification :
     `--max-old-space-size=<heapMb>` (par défaut `SEAL_HEAP_MB` = 128) et `scripts/l2/seal-child.mjs` ; `env` est celui que lui donne
     l'appelant, jamais hérité : la boucle passera l'environnement de l'enregistreur, déjà passé par `guardEnv` (vide sous Linux) ;
     sortie standard lue, une ligne JSON ; entrée et erreur ignorées. Rend le résultat de `sealOf`, ou `{ sealed: false, failed: {
     code, signal, stop, detail } }` (arrêt nommé de l'enfant, ou sa mort : `SIGABRT` au plafond du tas, `SIGKILL` du noyau) ; ne
     rejette jamais. `closed(cid, seg)` traverse la frontière comme la liste `open` des `cid/seg` que les écrivains tiennent ouverts.
   - **Gardes de c4 et enfant** (SERIES-ENV-ALLOWLIST-1, garde d'`execArgv`) : la garde d'`execArgv` vide vise le processus de
     l'enregistreur ; l'enfant n'est pas lancé par `fork` (qui recopierait `execArgv`) mais par `spawn`, avec son seul drapeau et un
     environnement explicite. L'enfant refait ses propres gardes avant toute lecture : son `execArgv` est exactement un élément, de forme
     `--max-old-space-size=<n>` (aucun, deux, ou un autre : `proxy_refused`, `why: "the heap cap alone"`) ; son environnement passe
     `guardEnv(env, [])` de la commande (liste fermée de la plateforme, vide sous Linux : une variable de mandataire, `NODE_OPTIONS` ou
     tout autre nom arrête, nommé, sans valeur). Une ligne `{ result }` (sortie 0) ou `{ stop, detail }` (sortie 1).
   - win32 : libuv donne à tout enfant les noms de son environnement de base (m-7 du G7 de c4) ; l'enfant les refuse (`env_refused`) :
     sous win32, la boucle ne scelle pas (échec nommé), jusqu'à la mesure de M-1 ; les tests qui lancent l'enfant y sont sautés, raison
     écrite. La cible est Linux (systemd).
6. **Mesure L2-MINUTES-SIZE-1, boucle vivante** (Node v24.21.0, ce poste Linux 6.18, 4 cœurs, 2026-10-05 entre 08:22 et 08:43 UTC ;
   harnais hors dépôt : `live.mts` sha256 `d73b9302a20477cb…`, `run-live.sh` `0b7cab687674a6a2…`, générateur de c5 `gen.mjs`
   `dcc628f8a50f510c…`). Jour synthétique de c5 au ras d'`INDEX_BOUND` (4 193 304 trames, `minutes.jsonl` de 820 niveaux par côté,
   passage de même clé de 15 Mio, 883 Mio sur le disque). Un processus porte la boucle vivante : la place factice de a1 sur la boucle
   locale et cinq liaisons (quatre spot, `/market`), écrivains de a2, 1 000 messages par seconde et par connexion spot (2 000 à la
   dernière ligne) ; après 5 s, il scelle le jour (`sealApart`, ou un `Worker` à `resourceLimits`). Cgroup v1 enfant,
   `memory.limit_in_bytes` 512 Mio (`MemoryMax=512M` de D24-4), processus et enfant dedans. Lu : `memory.max_usage_in_bytes` (compte le
   cache de pages, que le noyau reprend sous la limite : 512 Mio dès que le jour est lu, `failcnt` en dizaines de milliers de reprises),
   et, échantillonné toutes les 100 ms, `total_rss` de `memory.stat` (mémoire anonyme, celle que le noyau ne peut pas reprendre sans
   tuer) ; `oom_kill` de `memory.oom_control`. Boucle seule (avant le scellé) : 56 Mio anonymes.

   | Scellé | Résultat | Durée | Pic anonyme | `max_usage` | `oom_kill` | Boucle |
   |---|---|---|---|---|---|---|
   | `Worker`, `maxOldGenerationSizeMb` 256 | **processus entier tué** (sortie 137) | — | — | 512 | 1 | morte |
   | enfant, plafond 8 192 (aucun en fait) | enfant tué par le noyau (`SIGKILL`), jour non scellé | 144 s | 503,5 Mio | 512 | 1 | vivante |
   | enfant, plafond 256 | scellé | 212 s | 470,8 Mio | 512 | 0 | vivante |
   | enfant, plafond 192 | scellé | 216 s | 472,5 Mio | 512 | 0 | vivante |
   | enfant, plafond 128 | scellé | 191 s | 469,0 Mio | 512 | 0 | vivante |
   | enfant, plafond 128, 2 000 messages/s par connexion | scellé | 181 s | 470,6 Mio | 512 | 0 | vivante |
   | enfant, plafond 64 | enfant arrêté par V8 (`SIGABRT`), échec nommé | 88 s | 357,3 Mio | 408 | 0 | vivante |

   Lecture : le `Worker` ne protège pas la boucle (m-5 de la G2 de c5 confirmé : le noyau tue tout le processus) ; l'enfant la protège
   dans tous les cas mesurés. Le pic anonyme ne dépend pas du plafond entre 128 et 256 Mio : il est fait des colonnes externes de l'index
   et de canon (environ 224 Mio au ras de la borne) et du reste de l'enfant, pas du tas. Plafond retenu : **128 Mio** (`SEAL_HEAP_MB`),
   le plus bas qui scelle le pire cas mesuré, pour garder la plus grande part de 512 Mio aux files de la boucle. Budget : 469 Mio
   anonymes au pire jour avec la boucle vivante, marge 43 Mio sous 512. **Le budget ne tient pas** au pire de D24-4 (dix connexions à
   8 Mio de file, 80 Mio) en même temps qu'un jour au ras d'`INDEX_BOUND` ; le noyau tue alors le plus gros processus du cgroup, l'enfant
   (deuxième ligne), et la boucle continue. Sous systemd, `OOMPolicy=stop` (le défaut) arrêterait toute l'unité sur cette mort : P3 fixe
   `OOMPolicy=continue` (point (4) de m-5, renvoyé à P3, note pour le plan de P3). L2-MINUTES-SIZE-1 reste ouvert : clôture sous l'unité
   (P3), avec `MemoryMax` et `OOMPolicy`. Données synthétiques effacées après la mesure, cgroups retirés.

## Tests (`test/l2-loop.test.ts`, à la fin), tueurs (un par test, forme close ; lignes du brouillon, gel à confirmer)

Chaque test affirme ce qu'il charge (`sealApart`, `markTails`, `closed`, `cut` présents ; l'enfant lancé rend sa ligne) : la base, qui
n'a rien de cela, rougit par assertion (vérifié au brouillon : onze rouges par `ERR_ASSERTION`, les 23 tests de c5 verts).

- `l2_seal_apart_as_in_process` (Q-5 de a2, Q-C1-9) : un segment tenu ouvert : `wait: "segments"` ; sinon scellé, `SHA256SUMS` égal à
  l'octet à celui du scellé dans le processus. Tueur : `// killer: scripts/l2/seal-child.mjs:22 CONST "!open.includes(" ->
  "open.includes("`.
- `l2_seal_child_flags_closed` : l'enfant sans drapeau, avec un second drapeau après ou avant le plafond : `proxy_refused`, rien de
  scellé. Tueur : `// killer: scripts/l2/seal-child.mjs:19 CONST "execArgv.length !== 1 || " -> ""`.
- `l2_seal_child_env_closed` : `HTTPS_PROXY` : `proxy_refused` ; `LANG` : `env_refused` ; noms seuls. Tueur : `// killer:
  scripts/l2/seal-child.mjs:20 SDL "  guardEnv(env, []);" -> ""`.
- `l2_seal_apart_heap_named` (m-5) : quatre trames de 4 Mo, plafond 8 Mio : l'enfant meurt seul, `failed` sans arrêt nommé, sortie non
  nulle, rien de scellé, le processus du test vivant ; `SEAL_HEAP_MB` = 128. Tueur : `// killer: scripts/l2/seal.mjs:52 CONST
  "`--max-old-space-size=${heapMb}`, CHILD" -> "CHILD"`.
- `l2_walk_vanished_entry_absent` (scellé concurrent) : le temporaire du scellé délié entre la liste et son `lstat` : compté zéro.
  Tueur : `// killer: scripts/record-binance-l2.mjs:133 CONST ", { throwIfNoEntry: false }" -> ""`.
- `l2_link_feeds_its_hook` (Q-A4-3) : deux textes au crochet avec leur `<cid>`, un binaire jamais. Tueur : `// killer:
  scripts/l2/links.mjs:181 CONST "io.onText?.(e.data, cid)" -> "0"`.
- `l2_link_closed_segments` (Q-C1-5) : segment tenu : faux ; `<cid>` jamais tenu : vrai ; après `stop()` : vrai. Tueur : `// killer:
  scripts/l2/links.mjs:205 CONST "live.get(cid).closed.includes(seg)" -> "true"`.
- `l2_link_cut_on_the_hour` (D24-3) : `cut()` dans l'heure ne coupe rien ; à l'heure suivante, le segment se ferme sans trame, aucun
  segment neuf. Tueur : `// killer: scripts/l2/links.mjs:204 CONST "w.cut()" -> "0"`.
- `l2_segment_synced_before_close` (m-7 de c1) : chaque fichier synchronisé avant sa fermeture. Tueur : `// killer:
  scripts/l2/segments.mjs:70 CONST "f.sync?.()" -> "0"`.
- `l2_tails_marked_once` (Q-C1-4) : deux connexions coupées court : deux `tail_marked` exacts (champs de `checkTail`) ; un second
  appel n'en ajoute aucun. Tueur : `// killer: scripts/record-binance-l2.mjs:258 CONST "marked.has(`${cid}/${seg}`)" -> "false"`.
- `l2_tails_of_the_last_run_with_links` : deux passages morts avant leurs liaisons entre le passage coupé et ce départ : sa queue est
  trouvée. Tueur : `// killer: scripts/record-binance-l2.mjs:254 CONST "run.size > 0 ? run : last, new Set()" -> "run, new Set()"`.

## Preuve rouge, contrôles, taille

- Commit de ce G0 ; commit des tests seuls (rouges, avec les `.d.mts`) ; gel ; avant le push, tronc relu, fusionné par un commit de
  fusion si #151 et #153 le sont ; puis `node scripts/red-proof.mjs --base f330ab1c --gel <gel> --repo /home/user/monark-governance-c5b
  --draw n --seed 37` ; ancres par `verifie-ancres.mjs . --touched f330ab1c HEAD`, puis avec les fichiers de test L2 ; tests L2 ;
  `npm test` une fois dans le worktree ; `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.
- **R-25** (`r25()`, insertions plus suppressions, hors `docs/**/*.md`) : estimation au brouillon environ 300 : `seal-child.mjs` 36,
  `seal.mjs` 25, `seal.d.mts` 8, `links.mjs` +8/−6, `links.d.mts` 6, `segments.mjs` 1/1, `segments.d.mts` 2, commande +20/−4, `.d.mts`
  +3/−1, tests 175/4, `l2-record.test.ts` 1/1. Borne 547, marge environ 245. c5-bis-b, estimé 365 à 440, tient seul sous 547.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie)

- **Q-C5B-1** : scission de c5-bis en c5-bis-a (socle et scellé à part) et c5-bis-b (boucle), point déclaré ici faute de point
  pré-déclaré ; c6 attend c5-bis-b. (défaut : oui)
- **Q-C5B-2** : le scellé de la boucle tourne dans un processus enfant plafonné par `--max-old-space-size=128`, pas dans un `Worker` :
  Q-C5-3 (« `Worker` à `resourceLimits` ») est révisée sur la mesure du point 6, et « fil de travail » de Q-5 de a2 se lit « hors du fil
  des liaisons ». (défaut : oui)
- **Q-C5B-3** : forme close de l'enfant (un seul drapeau, le plafond ; environnement explicite, gardé par `guardEnv` sans drapeau) ;
  sous win32, l'enfant refuse les noms que libuv lui donne et la boucle n'y scelle pas jusqu'à M-1 (m-7 de c4). (défaut : accepté,
  déclaré)
- **Q-C5B-4** : `seal-child.mjs` n'entre pas au `script_sha256` du jour : il n'en change aucun octet (même `sealOf`,
  `l2_seal_apart_as_in_process`) ; `seal.mjs` y est déjà. (défaut : oui)
- **Q-C5B-5** : `markTails` lit `journal.jsonl` en entier au départ, comme `sealDay` à chaque scellé (L2-DAY-JOURNAL-STREAM-1, ouvert) ;
  ne vérifie que le dernier segment des connexions du dernier passage qui en a ouvert. (défaut : accepté, déclaré)
- **Q-C5B-6** : Q-G2B-3 de c1 : le temporaire laissé par une coupure reste, inerte ; la marche du quota compte absent un fichier
  disparu, jamais un dossier ni `--out`. (défaut : oui)
- **Q-C5B-7** : L2-TLS-PEER-UNATTESTED-1 re-différé après M-1 (le seuil se fixe sur la mesure). (défaut : oui)

## Note pour P3

- `OOMPolicy=continue` dans l'unité de l'enregistreur : sinon une mort de l'enfant de scellé par le noyau (budget dépassé au pire de
  D24-4 et d'`INDEX_BOUND` à la fois) arrête toute l'unité ; mesure de clôture de L2-MINUTES-SIZE-1 sous l'unité (cgroup v2), sur la
  mémoire anonyme : `anon` de `memory.stat`, échantillonné, et `oom_kill` de `memory.events` ; jamais `memory.peak`, qui compte le cache
  de pages comme `max_usage_in_bytes` sous v1 et lirait `MemoryMax` dès que le jour est lu (m-1 de la G2 de c5-bis-a, corrigé au pli).
