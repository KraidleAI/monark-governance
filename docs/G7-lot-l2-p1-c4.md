# G7 du lot L2-P1-c4 (commande et gardes), par RECHERCHES

Base `d90bbf77` (tête de `recherches/l2-p1-c3`) ; branche `recherches/l2-p1-c4` ; commits `da94d8e5` (G0), `b961f49d` (tests rouges,
`record-binance-l2.d.mts`), `d711eb8b` (gel), `527eca6e` (fusion de `origin/lot/etude-suite` en `c31a6819` : PR #149 de c3 fusionnée
pendant le lot ; commit de fusion seul, arbre identique à `d90bbf77`, aucun changement), puis ce commit (G7). Poussé sur
`origin/recherches/l2-p1-c4`, aucune PR. Node v24.21.0. Aucun réseau : la commande n'ouvre rien dans ce lot ; sorties sous le dossier
temporaire du système, hors de tout arbre git ; aucune donnée de marché. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Périmètre livré

- `scripts/record-binance-l2.mjs` (180 lignes), `scripts/record-binance-l2.d.mts` (45), `test/l2-record.test.ts` (12 tests, 196 lignes).
  Aucun autre fichier de code touché : `scripts/l2/*` inchangés, les 44 tueurs de c1 à c3 gardent leur ligne.
- En-tête de discipline (modèle [K] l.1-30) ; arrêts nommés en liste fermée (`STOPS`, douze codes) ; drapeaux fermés des deux modes
  (point 23) ; liste admise d'environnement par plateforme (Q-P1-10 : win32 `SYSTEMROOT`, `TEMP`, `TMP` ; vide ailleurs), `execArgv` non
  vide et variables de mandataire refusés (`proxy_refused`), valeurs jamais écrites ; sortie hors de tout arbre git, telle que donnée et
  telle que résolue, racine absente comprise ; reprise admise dans une sortie L2 seule (`OUT_ENTRIES`, `journal.jsonl` présent) ;
  quota : alarme journalisée une fois à 70 %, arrêt `quota_stop` à 85 %, espace libre au départ (`disk_short`) ; parcours de `--out`
  borné en profondeur (`WALK_DEPTH` = 3, `out_too_deep`), une entrée à la fois ; départ par chemins réels ; après les gardes, arrêt nommé
  `not_built` (Q-C4-1).
- Écart au G0 : aucun.

## Preuves

- `node scripts/red-proof.mjs --base d90bbf77 --gel d711eb8b --repo /home/user/monark-governance-c4 --draw 12 --seed 37` : « red-proof
  OK: 12 judged, 0 unchanged, 12 killer(s) drawn » ; `RED-PROOF.json` sha256 `8c4c89ff3e6118c7…`. Douze tests F2P (rouges par assertion
  à la base : l'import dynamique de la commande est affirmé) ; les douze tueurs tirés, tous tués.
- Contre le nouveau tronc : `--base c31a6819 --gel HEAD --draw 12 --seed 37` (HEAD = `527eca6e`) : « red-proof OK: 12 judged,
  0 unchanged, 12 killer(s) drawn » ; sha256 `839f622fd60ef9b9…` ; douze F2P, douze tués.
- Ancres : `verifie-ancres.mjs . --touched c31a6819 HEAD` (et `d90bbf77 HEAD`) : 12 tueurs, 12 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts,test/l2-record.test.ts` : 56 tueurs, 56 ANCRE.
- Tueurs appliqués à la main avant le gel, un à la fois, le test seul rejoué, fichier restauré : les douze rougissent par assertion
  (`ERR_ASSERTION`).
- `node --test test/l2-*.test.ts` : 107 sur 107. `npm test` complet, une fois, dans le worktree : 2 313 tests, 2 291 réussis, 0 échec,
  22 ignorés, sortie 0.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()` de `scripts/oracle/r25.mjs`, base `c31a6819`, puis `d90bbf77`, même compte) : `STAT` 421 (421 insertions,
  0 suppression) ; détail : commande 180, `.d.mts` 45, tests 196. Borne du lot 547, marge 126 ; `CONTENT_STAT` 0 ; GREEN. Plan : 301 à
  394 ; écart déclaré au G0 (reprise L2, racine absente, borne du parcours ; douze tests à un tueur).
- Mesures du parcours de `--out` (G0, point 6) : mémoire constante (+8,8 à +13,1 Mo de RSS maximal de 1 001 à 400 001 fichiers),
  environ 3,3 µs par fichier (1,3 s à 400 001).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C4-1 (`not_built` après les gardes, jamais une sortie 0 vide), Q-C4-2 (reprise par les noms de `OUT_ENTRIES` et `journal.jsonl` ; la
garde de sortie neuve du rejeu à c6), Q-C4-3 (tailles apparentes, pas les blocs ; écart à mesurer avec L2-DISK-QUOTA-1), Q-C4-4 (`exists`
et `real` de l'appelant pour le seul test de la racine absente), Q-C4-5 (empreinte de la commande au `script_sha256` du jour en c5),
Q-C4-6 (alarme une fois par processus, arrêt sans écriture), Q-C4-7 (le rejeu ne passe pas la garde d'environnement).

## Notes pour la suite

- c5 :
  - remplace la ligne `not_built` de `run` par la boucle, à partir du plan de `prepare` (couture inchangée) ;
  - écrit la ligne `start` (Q-C1-10) avant toute ouverture, puis appelle `check()` du quota à son rythme (un parcours coûte environ
    3,3 µs par fichier) et journalise son arrêt propre sur `quota_stop` ;
  - ajoute la commande au `script_sha256` du manifeste du jour (Q-C1-8, Q-C4-5) ;
  - reprend du G7 de c3 : n-5 (une seule `scale`, garde de clés disjointes), n-7, n-3 (durée du scellé), et L2-MINUTES-SIZE-1 (mesure
    conjointe sous `MemoryMax=512M`, ou bornes provisoires `MINUTES_BOUND` 64 Mio et `bound` de `canonDay` 32 Mio) ; du G7 de c2 :
    L2-SNAPSHOT-RELOAD-1 (contrat d'écriture de `rest/`) et L2-REPLAY-INTERLEAVE-1 (M-1).
- c6 : la garde de sortie du rejeu (sortie neuve) et la vérification des empreintes avant toute écriture ; `parseArgs` rend déjà
  `fromRaw`, `symbol`, `day`, `out`.
- P3 : liste admise linux mesurée sous l'unité (Q-P1-10) ; d'ici là, un lancement sous une unité s'arrête, `env_refused`.
- Items : SERIES-ENV-ALLOWLIST-1 et SERIES-PROXY-GUARD-1 (construits pour l'enregistreur L2 : `l2_guard_env_allowlist`,
  `l2_guard_proxy_and_flags_refused`) ; SERIES-ABSENT-ROOT-TEST-1 (`l2_guard_out_absent_root`, sous POSIX par simulation) ;
  MAIN-GUARD-REALPATH-1 (`l2_main_runs_by_real_path`) ; L2-DISK-QUOTA-1 (seuils de Q-11 en place, quota fixé sur M-1).
- MAST FM-1.2 : `l2_guard_env_allowlist`, `l2_guard_out_outside_git`, `l2_quota_alarm_and_stop`, `l2_main_runs_by_real_path`.

## G2

Revue G2 du 2026-10-05 (`recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c4.md`) : **REFUSE**, un bloquant (B-1),
mineurs m-1 à m-7, notes n-1 à n-6. Repli sur la même branche. Le tronc a avancé en `ab8084fb` (documentation seule : `ETAT`, `HANDOFF`,
journal) ; il est reçu par la fusion `662c3926`, et toutes les mesures ci-dessous sont prises contre `ab8084fb`. Commits du repli :
`bfef6e3f` (tests rouges et `.d.mts`), `83205f9d` (gel), puis ce commit (G0 corrigé et G7).

### Repli

| Point | Correctif | Test | Tueur |
|---|---|---|---|
| B-1 (a) | `bytesUnder` : une entrée ni fichier ni dossier par son type de `Dirent` (qui ne suit pas les liens) arrête, `out_not_l2`, à toute profondeur | `l2_guard_out_links_refused` : `journal.jsonl` lié à un fichier d'un dépôt, `days/BTCUSDT` lié à un de ses dossiers, `conn/c/s.frames` lié à un de ses fichiers ; `prepare` : `out_not_l2` trois fois ; le dépôt garde ses octets et ses noms | `scripts/record-binance-l2.mjs:131 CONST "!e.isFile() && !e.isDirectory()" -> "false"` |
| B-1 (b) | `guardOut` : chaque entrée de son type (`conn`, `days`, `rest` dossiers ; `journal.jsonl`, `requests.jsonl` fichiers ; `OUT_DIRS`) ; couvre aussi le rejeu, qui ne parcourt pas | `l2_guard_out_entry_types` : `journal.jsonl` dossier, `conn` fichier, `days` lien vers un dossier : `out_not_l2`, détail `why: "not of its type"` | `:112 CONST "!typed" -> "false"` |
| B-1 (c) | G0 point 6 : « un lien, à toute profondeur, arrête » ; `l2_quota_walk_depth_bound` n'a plus de lien (fichier `rest/BTCUSDT/x.json`) | — | inchangé (`:132`) |
| B-1, en plus | l'ajout de `quota_alarm` s'ouvre avec `O_WRONLY \| O_CREAT \| O_APPEND \| O_NOFOLLOW` : un `journal.jsonl` devenu lien après le parcours lève `ELOOP` (vérifié à la main) au lieu d'écrire à travers. Sous win32, `constants.O_NOFOLLOW` n'existe pas (`?? 0`) : la garde y repose sur le type de `Dirent`, où un lien ou une jonction n'est ni fichier ni dossier. Sans test : inatteignable sans course, le parcours refuse le lien avant ; le mutant « `O_NOFOLLOW` retiré » survit, déclaré | — | — |
| m-1 | remontée de `guardOut` : un chemin absent en `stat` mais présent en `lstat` (lien pendant, ou boucle) arrête, `out_not_l2`, `why: "dangling link"` | `l2_guard_out_dangling_link` : `dl` → cible absente ; `dl` et `dl/out` refusés, cible non créée | `:96 CONST "linked(near)" -> "false"` |
| m-2 | aucun changement de code | `l2_args_flag_once` : `--out` deux fois avec `--quota-bytes` présent, détail `{ flag: "--out" }` ; `["--out", "--quota-bytes", "--quota-bytes", "5"]` : `usage` | `:58 CONST "a.has(flag)" -> "false"` |
| m-3 | `value === ""` : `usage` | `l2_args_empty_value` | `:58 CONST "value === \"\"" -> "false"` |
| m-4 | aucun changement de code | `l2_replay_skips_env_guard` : rejeu sous `FOO=1` et `--x` : le plan exact, `fromRaw` résolu, `resume: false` ; sortie dans un dépôt : `out_in_git_tree` | `:167 CONST "args.mode === \"record\"" -> "true"` |
| m-5 | `freeBytes` exporté (et en `.d.mts`), écrit sur plusieurs lignes | `l2_free_bytes_default` : `freeBytes(ROOT/absent/x)` est un nombre, à 64 blocs près de `bavail × bsize` de `statfsSync(ROOT)` | `:158 SDL "while (!existsSync(p) && dirname(p) !== p) p = dirname(p);" -> ""` |
| m-6 | noms comparés par `new RegExp("^(SYSTEMROOT\|TEMP\|TMP)$", "i")`, sans `u` (la canonicalisation sans `u` ne replie jamais un non-ASCII sur un ASCII) ; `toUpperCase` retiré ; liste vide : `(?!)` | `l2_guard_env_names_ascii` : `ſYSTEMROOT` (U+017F) sous win32 : `env_refused` | `:80 CONST "\"i\"" -> "\"iu\""` (avec `u`, `ſ` se replie sur `s` et passe) |
| m-7 | ligne ci-dessous (« Suite ») | — | — |
| n-6 | aucun changement de code | `l2_stops_closed_list` : les codes de `stop("…")` du source égalent `STOPS` | `:29 CONST "\"disk_short\", " -> ""` |

Le tueur de `l2_guard_env_allowlist` suit le nouveau code : `:81 CONST "!admitted.test(name)" -> "false"` ; les onze autres gardent leur
texte, renumérotés au gel `83205f9d` (`:83`, `:85`, `:100`, `:98`, `:110`, `:145`, `:146`, `:172`, `:132`, `:63`, `:197`). L'en-tête
de la commande dit aussi la limite de n-1 et les liens refusés.

Ligne de commande réelle (`env -i node scripts/record-binance-l2.mjs`, dossier jetable) : le scénario de B-1 (`journal.jsonl` et `days`
liés dans un dépôt, quota 80) sort `out_not_l2` (`days`, `not of its type`), code 1, et le fichier du dépôt garde son octet ; `--out`
sous un lien pendant : `out_not_l2`, `dangling link`, code 1 ; `--out ""` : `usage`, code 2.

### Preuves

- Tueurs à la main, un à la fois, au gel `83205f9d`, `test/l2-record.test.ts` filtré sur le seul test, fichier restauré et sha256
  vérifié : les 21 rougissent par assertion (`ERR_ASSERTION`), chaque `<avant>` une seule fois sur sa ligne.
- Tests de resserrement contre l'ancien gel (`bfef6e3f` : les nouveaux tests avec la commande de `18abb678`) : six rouges
  (`links_refused`, `entry_types`, `dangling_link`, `empty_value`, `free_bytes_default`, `env_names_ascii`) ; trois verts, qui épinglent
  un comportement déjà là et que leur tueur tue (`flag_once`, `replay_skips_env_guard`, `stops_closed_list`).
- Survivants de la G2 rejoués : `value.startsWith("--") ||` retiré, retour du rejeu retiré, `fromRaw` non résolu, `bavail` → `bfree`
  (sur ce système) : tués. Restent : `resume` de `not_built` forcé à `false` (sans portée, n-6), la regex `AAAA-MM-JJ` retirée
  (équivalent), `O_NOFOLLOW` retiré (ci-dessus).
- `node scripts/red-proof.mjs --base ab8084fb --gel 83205f9d --repo /home/user/monark-governance-c4 --draw 21 --seed 37` : « red-proof
  OK: 21 judged, 0 unchanged, 21 killer(s) drawn » ; 21 F2P, 21 tués ; `RED-PROOF.json` sha256 `0af41d0b8cc7146f…`.
- Ancres : `verifie-ancres.mjs . --touched ab8084fb HEAD` : 21 tueurs, 21 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts,test/l2-record.test.ts` : 65 tueurs, 65 ANCRE.
- `node --test test/l2-*.test.ts` : 116 sur 116. `npm test` complet, une fois, dans le worktree : 2 322 tests, 2 300 réussis, 0 échec,
  22 ignorés, sortie 0.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml`, base `ab8084fb`) : `STAT` 525 (525 insertions,
  0 suppression : commande 198, `.d.mts` 47, tests 280) ; borne du lot 547, marge 22 ; `CONTENT_STAT` 0 ; GREEN.

### Avis sur Q-C4-1 à Q-C4-7 après la G2

- Q-C4-1, Q-C4-4, Q-C4-5, Q-C4-6 : accord de la G2, défauts maintenus.
- Q-C4-2 : défaut amendé comme la G2 le demande : noms **et types** des entrées, liens refusés à toute profondeur. La ligne `start` à
  vérifier avant d'adopter une sortie est pour c5 (n-5).
- Q-C4-3 : maintenu ; il n'a de sens qu'une fois les liens refusés, ce qui est fait.
- Q-C4-7 : maintenu, désormais tenu par `l2_replay_skips_env_guard`. Pour c6 : affirmer une sortie identique sous deux environnements
  (`TZ`, `LANG`).

### Suite (notes de la G2)

- **m-7, M-1** : sous win32, libuv donne à tout enfant les noms de son environnement de base (`PATH`, `USERNAME`, `WINDIR`… : [K]
  l.71-74, `DOJO_CA_CHILD_ENV` de `scripts/verify-dojo.mjs`), quel que soit le bloc passé : un lancement depuis un parent node sortirait
  toujours `env_refused`. À mesurer au lancement de M-1 avec un enfant lancé par node sous win32, revue de Q-P1-10 comprise (liste et
  forme des valeurs : `win32.isAbsolute` admet `\` et `/tmp`, [K] exige aussi `SYSTEMROOT` = `WINDIR`).
- **n-1** : un `--require` de `NODE_OPTIONS` s'exécute avant toute garde et peut effacer sa trace ; la garde ferme l'accident, pas un
  code déjà exécuté. Dit dans l'en-tête de la commande.
- **n-2 (c5)** : refaire la remontée « aucun `.git` » de `guardOut` à chaque scellé de jour ou à chaque `check()`.
- **n-3 (c5)** : `check()` est synchrone, environ 1 s à 300 000 fichiers : rythme bas, ou compte incrémental (octets écrits) avec un
  parcours complet rare.
- **n-4 (RUNBOOK de M-1)** : un arbre de travail sans `.git` (`core.worktree` d'un dépôt nu) est indétectable, comme dans [K].
- **n-5 (c5)** : liens physiques non détectés (`nlink > 1` ne peut être imposé : `day.mjs` lie puis délie au scellé) ; vérifier que la
  première ligne de `journal.jsonl` est un `start` de cet enregistreur avant d'adopter une sortie.
- **n-6** : fait (`l2_stops_closed_list`) ; le détail `resume` de `not_built` reste sans portée.
