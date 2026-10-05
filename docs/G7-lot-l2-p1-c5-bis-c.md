# G7 du lot L2-P1-c5-bis-c (reliquats fermés de c5-bis-a et c5-bis-b), par RECHERCHES

Base `7d45fa54` (tête de `recherches/l2-p1-c5-bis-b`, PR #157) ; branche `recherches/l2-p1-c5-bis-c` ; commits `89651d18` (G0), `3f894ef0`
(tests rouges et `.d.mts`), `62bca0a8` (gel), `9f2d792c` (pli des contrôles : texte d'un tueur, `tsc`, `lint`), `9e4a11b4` (pli des
mutants : le signal propre du `fetch` épinglé), `fa78b937` (pli de la suite complète : la socket du point 2 écoute sur un port tiré par
`test/helpers/loopback.ts`, jamais le port 0, que `loopback_guard_every_bind_of_a_test_file_goes_through_the_helper` refusait), puis ce
commit (G7). Poussé sur `origin/recherches/l2-p1-c5-bis-c`, aucune PR. Les PR #156
et #157 n'ont reçu aucun commit depuis `3d464be5` et `7d45fa54` (vérifié par `git fetch` à refspecs explicites) : aucune fusion. Node
v24.21.0. Aucun réseau vers une place : `fetch` répondu en mémoire, sockets menées à la main ; la seule socket d'un test écoute sur
`127.0.0.1`, rien ne s'y connecte ; sorties sous le dossier temporaire du système ; trames synthétiques seules.
`packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Périmètre livré, point par point (liste fermée du G7 de c5-bis-b)

| # | Point | Suite | Test ; tueur |
|---|---|---|---|
| 1 | r-3 M3 | test seul : `openSync` et `closeSync` enveloppés ; les deux racines ouvertes (un scellé, un `spawn_failed` `E2BIG`) sont fermées | `l2_seal_apart_root_closed` ; `seal.mjs:74 CONST "finally { if (fd !== null) closeSync(fd); }" -> "finally { }"`, à la main |
| 2 | r-3 L8 | test seul : un serveur TCP écoutant sur `127.0.0.1` en fd 4 de l'enfant : `out_not_l2`, `extra: [4]` ; saut nommé hors Linux | `l2_seal_child_no_socket` ; `seal-child.mjs:20 CONST "(anon_inode\|pipe):" -> "(anon_inode\|pipe\|socket):"`, à la main |
| 3 | r-3 L4 | test seul : ordre `frames`, `index.jsonl`, puis `syncDir(conn/<cid>/)` | `l2_segment_dir_synced_after_its_files` ; `segments.mjs:67`, `syncDir` avant l'index, à la main |
| 4 | r-3 M10 | test seul : un drapeau de tas de 6 000 caractères fait sortir l'enfant en 9 avec plus de 4 Kio d'erreur : queue de 4 096 | `l2_seal_apart_stderr_tail_bounded` ; `seal.mjs:76 CONST ".slice(-TAIL)" -> ""`, à la main |
| 5 | r-3 M17 | test seul : deux scellés sur un même `signal` : aucun écouteur `abort` restant (`getEventListeners`) | `l2_seal_apart_listener_removed` ; `seal.mjs:59`, `removeEventListener` retiré, à la main |
| 6 | `timeoutMs` court | `l2_seal_apart_through_the_pinned_root` passe `timeoutMs: 30_000` | son tueur `seal.mjs:71 CONST ", fd]" -> "]"`, à la main : rouge par assertion en 0,4 s |
| 7 | r-4 `hook_failed` | une ligne à la 1re, 10e, 100e… levée d'une connexion, avec `count` (1 000 levées : 4 lignes) | `l2_link_hook_failures_counted` ; `links.mjs:212 CONST "/^10*$/.test(String(c.hooks))" -> "true"` |
| 8 | n-10 | `nameOf` : nom lu dans un `try`, chaîne seule, 64 caractères au plus, sinon `null` (accesseur qui lève, `BigInt`, un million de caractères) | `l2_link_hook_exotic_failure_named` ; `links.mjs:214`, le `try` en `return x?.name ?? null;` |
| 9 | n-11 | `spec_refused` (`TypeError`) pour `timeoutMs` 0, -1, `Infinity`, 2³¹, `NaN`, `"5"` et pour `env: null`, avant toute ouverture | `l2_seal_apart_deadline_and_env_refused` ; `seal.mjs:64`, la condition retirée |
| 10 | n-12 | à l'échéance et à l'abandon, l'échec est gardé (`killed`) et la promesse se résout sur le `close` de l'enfant tué : relevé, plus de zombie à la résolution | `l2_seal_apart_resolved_once_reaped` (`signalCode` `SIGKILL` à la résolution) ; `seal.mjs:60 CONST "killed ??= failed(stop, detail);" -> "finish(failed(stop, detail));"` |
| 11 | n-13 | `adopt` rend `root` (`dev`, `ino` fixés) ; `record` le passe dans l'unique appel `apart` ; `sealApart` compare `spec.root` au dossier qu'il ouvre : autre dossier, `root_refused` (`root_moved`), rien scellé ; sans `root`, inchangé | `l2_seal_apart_root_identity` ; `seal.mjs:67 CONST "spec.root !== undefined && " -> "false && "` ; `l2_record_seal_root_of_adopt` ; `record-binance-l2.mjs:327 CONST ", root }" -> " }"` |
| 12 | n-14 | rien à corriger : noté dans l'en-tête de `seal-child.mjs` (un descripteur hérité sans `O_CLOEXEC` n'atteint pas l'enfant : `spawn` ne passe que son `stdio`) | — |
| 13 | n-15 | `conn/` synchronisé quand `mkdir` y crée `conn/<cid>/` (première connexion) | `l2_segment_conn_synced` ; `segments.mjs:65 CONST "!== undefined) await syncDir(" -> "=== null) await syncDir("` |
| 14 | r-2 (reste) | `quit`, `AbortController` de la boucle, passé au client REST (`io.signal`) et abandonné par `finish` ; le client : aucune requête ne part une fois abandonné, le `fetch` reçoit le signal joint à son échéance de 30 s (`AbortSignal.any`), une réponse lue après l'abandon n'écrit ni `requests.jsonl` ni `rest/` (`stopped`) | `l2_record_rest_aborted_at_stop` (`exchangeInfo` en vol à 23:58:01, réponse après l'arrêt) ; `record-binance-l2.mjs:299 CONST "quit.abort(); " -> ""` ; `l2_rest_aborted_writes_nothing` ; `rest.mjs:129 CONST "} if (io.signal?.aborted) stop(" -> "} if (false) stop("` |
| 15 | r-3 `note("stopped")` | `tell("stopped", …)` : la course sort sur l'arrêt nommé (sonde JOURNAL : `unhandled_rejection`, `{ code: "EIO" }`), plus sur `EISDIR` brut | `l2_record_broken_journal_named` ; `record-binance-l2.mjs:399 CONST "tell(\"stopped\"" -> "note(\"stopped\""` |
| 16 | r-4 (a) | test seul, sonde JITTER : `exchangeInfo` en retard de 19 s part, de 21 s est sautée (`late_us` 21 000 000) | `l2_record_overdue_tolerance` ; `record-binance-l2.mjs:378 CONST "now - e.at > OVERDUE_US" -> "now - e.at > 0"`, à la main |
| 17 | r-4 (b) | test : journal en panne, `time` répondu 500 à 10:30 : `schedule_failed` perdu en silence, aucun rejet non géré, la course finit au signal | `l2_record_broken_journal_failure` ; `record-binance-l2.mjs:300`, le `try` de `tell` retiré |
| 18 | r-4 (c) | test : journal en panne, le `stop()` des liaisons rejette (leurs lignes `close`) : l'arrêt propre continue aussitôt, `links_closed: false` | `l2_record_broken_journal_links` ; `record-binance-l2.mjs:391 CONST ", () => { clearTimer(t); r(false); }" -> ", () => undefined"` |
| 19 | n-a | critère par tâche : une ancre est sautée si le jour corrigé a changé (au `tick`, puis à l'envoi depuis le pli de B-1 ci-dessous : jamais écrite d'un `depth` **envoyé** un autre jour corrigé ; une requête à cheval sur minuit, envoyée en D et reçue en D + 1, reste écrite comme clôture de D, fenêtre déclarée au pli du G2 delta, L2-ANCHOR-MIDNIGHT-STRADDLE-1), `exchangeInfo` au-delà de `OVERDUE_US` ; sonde SLOWSTART : les quatre ancres de D prises | `l2_record_slow_start_anchors` ; `record-binance-l2.mjs:378 CONST "dayOf(now + offset) !== dayOf(e.at + offset)" -> "now - e.at > OVERDUE_US"` |
| 20 | `.catch` de `seals()` | retiré (code mort depuis le `try` par clé) : une levée hors des clés, aucune connue, deviendrait un rejet non géré que le filet du processus arrête nommé | — (déclaré, Q-C5BC-5) |

Les lignes de tueurs existantes ne bougent pas (code changé en place) ; deux lignes de tueurs suivent l'appel `fed(io, note, e.data, c)`
(`l2_link_feeds_its_hook`, `l2_link_hook_after_the_writer`), corps inchangés.

## Preuves

- **Preuve rouge** : `node scripts/red-proof.mjs --base 7d45fa54 --gel fa78b937 --repo /home/user/monark-governance-c5bc --draw 20 --seed
  37` : « red-proof REFUSED: 20 judged, 73 unchanged, 13 killer(s) drawn » ; `RED-PROOF.json` sha256 `e9dcf7d280c08d72…` (même verdict à `9f2d792c`). Treize F2P (rouges par assertion à la base, verts au gel) :
  `l2_link_hook_failures_counted`, `l2_link_hook_exotic_failure_named`, `l2_seal_apart_deadline_and_env_refused`,
  `l2_seal_apart_resolved_once_reaped`, `l2_seal_apart_root_identity`, `l2_record_seal_root_of_adopt`, `l2_segment_conn_synced`,
  `l2_record_rest_aborted_at_stop`, `l2_record_broken_journal_named`, `l2_record_broken_journal_failure`,
  `l2_record_broken_journal_links`, `l2_record_slow_start_anchors`, `l2_rest_aborted_writes_nothing` ; leurs treize tueurs tirés et tués.
  Sept refus « green at base », déclarés au G0 (resserrements des points 1 à 6 et 16) : `l2_seal_apart_through_the_pinned_root`,
  `l2_seal_apart_root_closed`, `l2_seal_child_no_socket`, `l2_segment_dir_synced_after_its_files`, `l2_seal_apart_stderr_tail_bounded`,
  `l2_seal_apart_listener_removed`, `l2_record_overdue_tolerance`.
- **Tueurs à la main** (au gel, un à la fois, le test seul rejoué, fichier restauré et sha256 vérifié) : les sept tueurs des refus, tous
  rouges par assertion (0,3 à 0,5 s, aucun ne pend ; celui du point 2 rejoué après `fa78b937`). Plus, hors des lignes de tueurs : `rest.mjs:115` (`|| io.signal?.aborted` retiré),
  `rest.mjs:123` (signal de la boucle non joint au `fetch`), `record-binance-l2.mjs:297` (`signal: quit.signal` retiré) et `:367` (garde
  `finished ||` du `catch` de `fire` retirée : un `schedule_failed` suit `stopped`) : rouges par `l2_rest_aborted_writes_nothing` et
  `l2_record_rest_aborted_at_stop`.
- **Mutants du lot** (rejoués sur leur test, fichier restauré) : tués : `killed ??` du `close` (`l2_seal_apart_deadline`), `env === null`
  retiré, identité d'`adopt` faussée (`ino` `"0"`), `count` figé à 1, `syncDir(dir)` au lieu de `conn/`, filtre `exchangeInfo` du saut
  retiré (`l2_record_overdue_skipped` : la coupe et le scellé seraient sautés), `.slice(0, 64)` retiré.
- **Ancres** (`verifie-ancres.mjs`) : `. --touched 7d45fa54 HEAD` : 93 tueurs, 93 ANCRE, 0 DERIVE, 0 PERDU ; `--files` sur les douze
  `test/l2-*.test.ts` : 200, 200 ANCRE.
- Un premier `npm test` complet (tête `9e4a11b4`) avait un échec, hors L2 : `loopback_guard_every_bind_of_a_test_file_goes_through_the_helper`
  refusait le `listen(0, …)` du test du point 2 ; plié en `fa78b937` (`startLoopback`), suite complète verte ensuite.
- `node_modules/@monark` vérifié avant la suite complète : dossier réel de liens relatifs vers `packages/` et `apps/` de cet arbre ; les
  autres dépendances liées depuis `/home/user/monark-governance-c5bb/node_modules`.

| Vérification (tête `fa78b937`, Node v24.21.0) | Résultat |
|---|---|
| `node --test test/l2-*.test.ts` | 200 sur 200, 0 échec, 0 sauté |
| `npm test` complet | 2 406 tests : 2 384 verts, 0 échec, 22 sautés (raisons nommées), sortie 0 |
| `tsc --noEmit` (`typecheck`) | 0 |
| `lint` | 0 |
| `lint:ratchet` | 69/69 |
| `gate:vocab` | OK (335 fichiers) |
| `lang:gate` | OK (0 occurrence hors exemption) |
| preuve rouge contre `7d45fa54` | 20 jugés : 13 F2P, 13 tueurs tirés tués ; 7 resserrements refusés, tueurs à la main tués |
| ancres | 93/93 (touchés), 200/200 (`l2-*`) |
| R-25 contre `7d45fa54` | 313, GREEN, borne du lot 547 |

- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `ci.yml` du worktree) : contre `7d45fa54`, `STAT` 313 (274 insertions, 39 suppressions),
  `CONTENT_STAT` 0, GREEN ; borne du lot 547, marge 234. Code 72 (dont `.d.mts` 13), tests 241. Pas de scission (estimation du G0 : environ
  320).

## Survivants déclarés

- Les gardes `if (finished) return;` après chaque réponse REST de `fire` (`time` `:352`, `exchangeInfo` `:354`, ancre `:360`) : depuis le
  point 14, une réponse arrivée après l'arrêt est refusée par le client lui-même (`stopped`) avant d'atteindre la garde ; leur retrait ne
  rougit plus aucun test (le tueur `:352` du G7 de c5-bis-b, rouge à la main par `l2_record_stop_during_start`, survit désormais). Gardées en
  second filet : une réponse lue entièrement avant l'abandon, dont la suite s'exécuterait après lui, reste couverte.
- `killed ??` dans l'écouteur `error` de l'enfant (`seal.mjs:77`) : une erreur d'`spawn` après un `kill` n'a pas de chemin de test.
- Point 20 : le filet retiré n'a pas de test (aucune levée connue ne l'atteignait).

## Risques déclarés

- Point 10 (Q-C5BC-2) : un enfant tué mais bloqué en `D` (un `fsync` lent) retient la promesse jusqu'à sa relève. La boucle borne cette
  attente à son arrêt propre (`STOP_BOUND_MS`, puis sortie bornée `EXIT_GRACE_MS`) ; en cours de route, le scellé suivant attend (un seul
  à la fois), ce qui est le but de n-12. Le contrat écrit devient : « jamais pendante au-delà de `timeoutMs`, sauf la relève de l'enfant tué ».
- Point 7 : les levées entre deux puissances de dix ne sont que comptées ; le nom de la levée journalisée est celui de la 1re, 10e, 100e…
- Point 19 : une ancre en retard dans son jour est prise même très tard (un saut d'horloge en avant à l'intérieur du jour D) : c'est encore le
  carnet de D ; l'`exchangeInfo` garde la tolérance de 20 s.
- Point 11 : sous Linux, `at` est le descripteur fixé, l'identité ne peut différer ; la comparaison ferme la fenêtre ailleurs (chemin réel
  re-résolu) et tout appel direct de `sealApart` avec `root`.
- n-c (Windows, MONARK) : les tests du journal en panne (15, 17, 18) remplacent `journal.jsonl` par un dossier ; sous Linux l'ajout lève
  `EISDIR` ; aucun test n'affirme ce code, seulement que la course finit nommée ou au signal. À confirmer au rejeu Windows, avec
  `l2_segment_dir_synced_after_its_files` et `l2_segment_conn_synced` (`syncDir` d'un dossier en `r+` sous win32, déjà le cas de
  `l2_segment_dir_synced`). `l2_seal_child_no_socket` porte un saut nommé hors Linux ; les autres tests du scellé à part gardent `APART`.

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C5BC-1 (compte en puissances de dix), Q-C5BC-2 (résolution à la relève de l'enfant tué), Q-C5BC-3 (identité fixée rendue par `adopt`),
Q-C5BC-4 (critère du saut par tâche), Q-C5BC-5 (filet de `seals()` retiré).

## Notes pour la suite

- c6 : le rejeu reprend toujours les jours non scellés ; le verrou par jour (n-2 de c5-bis-b) et `root_moved` sont des arrêts nommés qu'il
  lit comme tels.
- P3 : n-6 et n-b de c5-bis-b inchangés ; la résolution à la relève (point 10) ne change pas les bornes de l'arrêt (30 s + 30 s + 5 s).

## Pli de la G2 (BLOQUE, 2026-10-05)

G2 lue : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c5-bis-c.md` (tête relue `212ddd30` ; un bloquant B-1, six
mineurs m-1 à m-6). Commits, sans rebase :
- `c603dd10` : fusion de `recherches/l2-p1-c5-bis-b` à `f8bedc17` (PR #157 : fusions de c5-bis-a et du tronc `32aba758`), avant le gel ;
  aucun fichier du lot touché par elle ; tests L2 200 sur 200 après la fusion. Base de la PR désormais `f8bedc17`.
- `b4cd4bdd` (tests rouges et `.d.mts`), `b3e07862` (gel), `9cff69dd` (pli des contrôles : `lint` des faux du REST), `240cea36` (pli des
  mutants : le test de l'échéance du `fetch` borné à 1 s), puis ce commit (G7).

| Point de la G2 | Suite | Preuve (test ; tueur) |
|---|---|---|
| **B-1** (ancre envoyée après le minuit corrigé) | dans la branche `anchor` de `fire`, après la réponse : `if (dayOf(sentUs + offset) !== dayOf(t + offset))`, rien n'est écrit, `event_skipped` (`late_us` = `sentUs - t`, `at_send: true`). Phrases du G0 et du G7 (point 19) corrigées | `l2_record_slow_place_anchors`, reproducteur de la G2 (départ 23:59:00, chaque réponse 10 s plus tard, écart lu +5 s) : seule `BTCUSDT` (envoyée à 23:59:55 corrigé) écrit `anchor-close.json` de D ; `ETHUSDT`, `BNBUSDT`, `SOLUSDT` sautées à l'envoi. Tueur `record-binance-l2.mjs:360 CONST "if (dayOf(sentUs + offset) !== dayOf(t + offset)) return" -> "if (false) return"` |
| m-1 (attente sans ligne) | `sealApart` appelle `io.onKill(échec)` une fois, au `kill` (échéance ou abandon), puis se résout au `close` ; la boucle journalise `seal_killed` (symbole, jour, `stop`) aussitôt. Le `.d.mts` dit « résolu au `close` de l'enfant tué » (non plus « relevé ») | `l2_seal_apart_kill_told` (`onKill` avant la fin de l'appel) ; `seal.mjs:60 CONST "if (first) try {" -> "if (false) try {"` ; `l2_record_seal_kill_named` ; `record-binance-l2.mjs:327 CONST "tell(\"seal_killed\"" -> "void (\"seal_killed\""` |
| m-2 (`fetch` abandonné nommé `network_error`) | dans le `catch` du `fetch` : signal de la boucle abandonné, `stopped` | `l2_rest_aborted_fetch_named` (faux qui honore `init.signal`, rejet `AbortError`) ; `rest.mjs:125 CONST "if (io.signal?.aborted) stop(\"stopped\", { kind, symbol }); stop(\"network_error\"" -> "stop(\"network_error\""` |
| m-3 (échéance de 30 s) | test seul : `AbortSignal.timeout` espionné (`TIMEOUT_MS`), son signal joint à celui du `fetch` | `l2_rest_fetch_deadline` ; `rest.mjs:123 CONST "AbortSignal.timeout(TIMEOUT_MS), " -> ""`, à la main : rouge par assertion en 1,2 s |
| m-4 (`offset` du critère) | test seul, deux courses : place 5 s en avance, horloge sautée de 23:59 à 23:59:58 (jour hôte D, corrigé D + 1) : aucune ancre, quatre `event_skipped` ; place 30 s en retard, ancres au-delà du minuit hôte (corrigé D) : quatre `anchor-close.json` de D | `l2_record_anchor_day_corrected` ; `record-binance-l2.mjs:378 CONST "dayOf(now + offset) !== dayOf(e.at + offset)" -> "dayOf(now + offset) !== dayOf(e.at)"`, à la main ; M13 (`dayOf(now) !== dayOf(e.at)`) et l'autre côté seul (`dayOf(now) !== dayOf(e.at + offset)`) à la main : tous rouges par assertion |
| m-5 (abandon pendant la lecture du corps) | test seul : corps en flux, abandon entre deux morceaux : `stopped`, rien écrit | `l2_rest_aborted_during_body` ; `rest.mjs:129 CONST "} if (io.signal?.aborted) stop(" -> "} if (false) stop("`, à la main ; M21 (garde déplacée avant la lecture) à la main : rouges par assertion |
| m-6 (journal en panne dans `fed`) | la ligne `hook_failed` écrite dans un `try` : une levée du journal ne sort plus de `onmessage` | `l2_link_hook_failure_journal_broken` (journal en dossier) ; `links.mjs:212 CONST "catch { /* m-6" -> "catch (z) { throw z; /* m-6"` |
| notes n-1 à n-7 | n-1, n-2, n-4, n-5, n-7 : sans suite ; n-3 : `rest.stopped` n'est pas posé par l'abandon (le carnet fait au plus ses essais vains, désormais nommés `stopped` et non `network_error`, jusqu'à `b.close()`) ; n-6 : rejeu Windows de MONARK (`_broken_journal_links` et `_hook_failure_journal_broken` supposent que l'ajout sur un dossier lève) | — |

Survivants de la G2 gardés déclarés : M4 (`killed ??=` en `killed =`, nom seul), M5 (`killed ??` de l'écouteur `error`), M7 (`dev` non
comparé : un seul système de fichiers aux tests), M17 (`syncDir(conn/)` à chaque segment : coût seul), M18 (`.catch` remis : code mort),
M19 (garde `finished` de `time`).

### Preuves du pli

- **Preuve rouge du pli** : `node scripts/red-proof.mjs --base c603dd10 --gel 9cff69dd --repo /home/user/monark-governance-c5bc --draw 10
  --seed 37` : « red-proof REFUSED: 8 judged, 93 unchanged, 5 killer(s) drawn » ; `RED-PROOF.json` sha256 `ffef32d2e79de2f7…`. Cinq F2P
  (`l2_record_slow_place_anchors`, `l2_seal_apart_kill_told`, `l2_record_seal_kill_named`, `l2_link_hook_failure_journal_broken`,
  `l2_rest_aborted_fetch_named`), leurs cinq tueurs tirés et tués ; trois refus « green at base », déclarés (m-3, m-4, m-5 sont des
  resserrements), leurs tueurs tués à la main (ci-dessus). `240cea36` ne change que le corps de `l2_rest_fetch_deadline` (borné à 1 s :
  son tueur pendait jusqu'au `timeout` du lanceur avant).
- **Ancres** : `--touched f8bedc17 HEAD` : 101 tueurs, 101 ANCRE, 0 DERIVE, 0 PERDU ; `--files` sur les douze `test/l2-*.test.ts` : 208, 208 ANCRE. `--touched 7d45fa54
  HEAD` : 195 tueurs, 193 ANCRE, dont 2 PERDU hérités de la fusion du tronc (`test/oracle-run.test.ts:129` et `:182`, déjà PERDU sur `7d45fa54..f8bedc17`,
  hors du lot).

| Vérification (tête `240cea36`, Node v24.21.0) | Résultat |
|---|---|
| `node --test test/l2-*.test.ts` | 208 sur 208, 0 échec, 0 sauté |
| `npm test` complet | 2 439 tests : 2 417 verts, 0 échec, 22 sautés (raisons nommées), sortie 0 |
| `tsc --noEmit`, `lint` | 0, 0 |
| `lint:ratchet` | 69/69 |
| `gate:vocab`, `lang:gate` | OK, OK |
| preuve rouge du pli contre `c603dd10` | 8 jugés : 5 F2P, 5 tueurs tués ; 3 resserrements, tueurs à la main tués |
| R-25 contre `f8bedc17` (base de la PR) | 437 (394 insertions, 43 suppressions), GREEN, borne du lot 547, marge 110 |
| R-25 contre `7d45fa54` | 1 398, dont 961 de la fusion du tronc par `f8bedc17` (hors du lot) : plus la base de cette PR ; le lot seul y valait 313 avant le pli |

### Fusion du correctif de l'oracle Windows de c5-bis-b

- `bc29c3e7` : fusion de `recherches/l2-p1-c5-bis-b` à `7117e271` (le blocage de `l2_record_stopped_line_last` sous charge, refus de
  MONARK sur #157 : l'hôte mené jusqu'à ce que la course se règle, `settles()` de `test/helpers/host-clock.ts`). Les deux côtés ajoutaient
  à la fin de `test/l2-loop.test.ts` : `l2_record_stop_bound_armed_late` gardé avant les tests de c5-bis-c. Le pli de B-1 touche les chemins
  de l'arrêt (abandon du REST, `seal_killed`) : le correctif tient. Le seul test du lot qui attendait la borne du scellé à un instant fixe,
  `l2_record_seal_kill_named` (scellé sans fin), mène désormais l'hôte par `settles()` lui aussi.
- Charge : huit exécutions parallèles de `test/l2-loop.test.ts` sur quatre cœurs : 89 sur 89 chacune.

| Vérification (tête `bc29c3e7`) | Résultat |
|---|---|
| `node --test test/l2-*.test.ts` | 209 sur 209 |
| `npm test` complet | 2 440 tests : 2 418 verts, 0 échec, 22 sautés, sortie 0 |
| `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` | 0, 0, 69/69, OK, OK |
| ancres | `--touched 7117e271 HEAD` et `--touched f8bedc17 HEAD` : 102/102 ; `l2-*` : 209/209 |
| R-25 contre `7117e271` (base de la PR) | 436, GREEN, borne du lot 547 (contre `f8bedc17` : 464) |

## Pli du G2 delta (APPROUVE SOUS RESERVE, 2026-10-05)

G2 delta lue : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c5-bis-c-delta.md` (tête relue `32e9ce44` ; aucun
bloquant, cinq mineurs d-1 à d-5). Commits, sans rebase : `a0f92fcd` (fusion du tronc `lot/etude-suite` à `f35ec9b1`, qui porte #157 =
c5-bis-b et `7117e271` ; sans conflit ; base de la PR désormais le tronc), `7c32df74` (tests de d-2 et d-3), puis ce commit (G7).

| Mineur | Suite | Preuve (test ; tueur) |
|---|---|---|
| d-1 (requête d'ancre à cheval sur minuit) | aucun code : fenêtre déclarée, item L2-ANCHOR-MIDNIGHT-STRADDLE-1 ci-dessous ; phrase du point 19 corrigée | — (`l2_record_slow_place_anchors` épingle le choix `sentUs`) |
| d-2 (`offset` retiré des deux côtés du contrôle à l'envoi, K3c) | test seul : place 30 s en retard, chaque `depth` répondu 25 s plus tard ; `ETHUSDT` décidée à 23:59:50 hôte (D), envoyée à 00:00:05 hôte (D + 1, corrigé 23:59:35, D) : gardée ; `BNBUSDT` et `SOLUSDT`, envoyées à partir du minuit corrigé : sautées à l'envoi | `l2_record_anchor_sent_day_corrected` ; `record-binance-l2.mjs:360 CONST "if (dayOf(sentUs + offset) !== dayOf(t + offset)) return" -> "if (dayOf(sentUs) !== dayOf(t)) return"`, à la main : rouge par assertion (`[true, false, true, true]`, `ETHUSDT` sautée, `BNBUSDT` et `SOLUSDT` écrites) ; restauré, vert. `l2_record_anchor_day_corrected` et `l2_record_slow_place_anchors` restent verts sous ce mutant (le constat) |
| d-3 (« dit au `kill` » non épinglé au niveau de `sealApart`, K6b, K6) | test seul : abandon juste après l'appel, `onKill` déjà appelé au retour (synchrone) de `abort()` ; une échéance de 1 ms échue avant le `close` de l'enfant tué (la boucle tenue 20 ms) : `onKill` une fois | `l2_seal_apart_told_at_the_kill` ; `seal.mjs:60 CONST "try { io?.onKill?.(killed); }" -> "try { child?.once(\"close\", () => io?.onKill?.(killed)); }"`, à la main : rouge par assertion (3 sur 3), `l2_seal_apart_kill_told` vert sous ce mutant (le constat) ; restauré, vert. K6 (`if (first)` en `if (true)`) : rouge par assertion 10 sur 10. K6c (`try` retiré) : survit, déclaré (faible portée, un `onKill` qui lève est l'erreur de l'appelant) |
| d-4 (gestionnaires de socket et journal en panne) | reporté : item L2-JOURNAL-BROKEN-HANDLERS-1 | — |
| d-5 (`late_us` du saut à l'envoi, nom `"23"`) | noté : item L2-LATE-US-PIN-1 | — |

- **Deux lignes par échéance du scellé, voulu** : une échéance (ou un abandon) d'un scellé à part donne deux lignes au journal, `seal_killed`
  au `kill` (m-1 : l'attente est dite aussitôt, même si l'enfant tué tarde à être relevé) puis `seal_failed` au `close` de l'enfant (la
  résolution), mêmes champs d'échec.
- **Lot L2-STOP-SETTLE-1**, porté par la PR #157 (fusionnée dans le tronc `f35ec9b1`) : plage `f8bedc17..7117e271`, tests seuls
  (`settles()` de `test/helpers/host-clock.ts`, régression `l2_record_stop_bound_armed_late`, tueur `host-clock.ts:8`) ; R-25 mesuré seul
  30 ; revue : contrôle du diff par MONARK (message `e56a024`) plus le G2 delta de c5-bis-c, qui a trouvé `settles()` juste (« ne masque
  aucun blocage du code », K12 tué). La G2 de la partie couvre les deux lots.
- **Note Windows** : les tests du journal en panne (`l2_link_hook_failure_journal_broken`, `l2_record_broken_journal_*`) supposent que
  l'ajout sur un dossier lève sous win32 (`EISDIR` ou `EPERM`) ; aucun n'affirme le code ; s'il ne levait pas, `_hook_failure_journal_broken`
  resterait vert à vide, jamais un faux rouge. À confirmer au rejeu de MONARK. `l2_seal_apart_told_at_the_kill` est sous `APART`.

### Items ouverts

- **L2-ANCHOR-MIDNIGHT-STRADDLE-1** (d-1) : une ancre dont la requête chevauche minuit (envoyée avant le minuit corrigé, reçue après) est
  écrite comme `anchor-close.json` de D ; l'instantané a pu être pris par la place en D + 1. Portée : une ancre au plus (les suivantes
  partent après minuit et sont sautées), dans la latence d'une requête (`TIMEOUT_MS`, 30 s au pire), seulement si la chaîne REST a déjà
  20 à 50 s de retard. Effet dans `derive.mjs` : la parité de D rapportée absente, `chain_open` (aucun événement de D n'atteint le
  `lastUpdateId` de l'ancre), plus un trou nommé du début de D + 1 jusqu'à lui ; jamais une parité fausse. Option : juger sur
  `receivedUs` (ne coûte aucune ancre légitime à latence normale, sonde 5 du G2 delta), en ajustant `l2_record_slow_place_anchors`.
- **L2-JOURNAL-BROKEN-HANDLERS-1** (d-4, antérieur au lot) : sur un journal en panne, trois gestionnaires de `openLink` laissent sortir la
  levée : `onmessage` d'un message binaire (`end` puis `note("close")`), `onmessage` de `serverShutdown` (`renew` puis `note("renew")`),
  `onclose` (`end` puis `note("close")`) ; sur un vrai `WebSocket`, `uncaughtException`. Suite : `note` de `openLink` sous `try` (ou
  chaque gestionnaire).
- **L2-LATE-US-PIN-1** (d-5) : `late_us` du saut à l'envoi non épinglé (K14 survit) ; l'échéance du `fetch` est nommée `error: "23"` (le
  `code` du `DOMException` `TimeoutError`, lu avant `name` par `errorName`), comme l'abandon valait `"20"` : antérieur, sans portée.

### Preuves du pli delta

| Vérification (tête `7c32df74`, Node v24.21.0) | Résultat |
|---|---|
| `node --test test/l2-*.test.ts` | 211 sur 211, 0 échec, 0 sauté |
| `tsc --noEmit`, `lint` | 0, 0 |
| `lint:ratchet` | 69/69 |
| `gate:vocab`, `lang:gate` | OK, OK |
| ancres | `--touched origin/lot/etude-suite HEAD` : 104/104 ; `--files` des douze `test/l2-*` : 211/211 |
| R-25 contre `origin/lot/etude-suite` (`f35ec9b1`, base de la PR) | 465 (422 insertions, 43 suppressions ; inchangé par ce G7), `CONTENT_STAT` 0, GREEN, borne du lot 547, marge 82 |
