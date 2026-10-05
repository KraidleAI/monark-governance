# G0 du lot P1-c5-bis-c du chantier L2 : les reliquats fermés de c5-bis-a et c5-bis-b (scellé à part, liaisons, segments, REST, boucle)

- **Rattachement** : liste fermée de 20 points du G7 de c5-bis-b (`docs/G7-lot-l2-p1-c5-bis-b.md`, « Pli de la delta », section
  « Renvoyés à c5-bis-c ») : points 1 à 13 = « Renvoyés à c5-bis-b » du G7 de c5-bis-a (`docs/G7-lot-l2-p1-c5-bis.md`) ; points 14 à 20 =
  r-2 (reste), r-3, r-4 (a, b, c), n-a de la G2 delta de c5-bis-b et le filet du `.catch` de `seals()`. Reproducteurs : G2 et G2 delta de
  c5-bis-a et de c5-bis-b dans `recherches/coordination/pieces/2026-10-04-G2-recherches/`.
- **Base** : `7d45fa54` (tête de `recherches/l2-p1-c5-bis-b`, PR #157). Branche `recherches/l2-p1-c5-bis-c`. Auteur : RECHERCHES. Si les
  PR #156 ou #157 reçoivent d'autres commits (correctifs Windows), ils sont fusionnés ici par un commit de fusion, jamais rebasés. Aucun
  réseau vers une place : `fetch` répondu en mémoire, sockets menées à la main ; la seule socket ouverte par un test écoute sur
  `127.0.0.1` (point 2), rien ne s'y connecte ; sorties sous le dossier temporaire du système ; trames synthétiques seules.

## Taille et point de scission

Mesure visée contre `7d45fa54` (insertions plus suppressions hors `docs/**/*.md`, `r25()` de `scripts/oracle/r25.mjs`) : environ 70 pour
le code (presque tout changé en place, aucune ligne de tueur décalée dans `record-binance-l2.mjs`), environ 250 pour les tests, soit
environ 320, sous la borne de 547. **Aucune scission.** Si la mesure au gel dépassait 547, les points 1 à 6 (tests seuls) partiraient
dans un lot c5-bis-d, déclaré au G7 avant le commit qui dépasse.

## Contenu, point par point

Fichiers : `scripts/l2/seal.mjs`, `seal-child.mjs` (en-tête), `links.mjs`, `segments.mjs`, `rest.mjs`, `scripts/record-binance-l2.mjs` et
leurs `.d.mts` ; `test/l2-loop.test.ts` (tests ajoutés à la fin, un corps resserré, deux lignes de tueurs réécrites) ;
`test/l2-rest.test.ts` (un test).

| # | Point | Suite prévue | Test |
|---|---|---|---|
| 1 | r-3 M3 (descripteur de la racine fermé par le parent) | test seul : `openSync`/`closeSync` enveloppés, chaque racine ouverte est fermée, après un `spawn` et après un `spawn_failed` | `l2_seal_apart_root_closed` |
| 2 | r-3 L8 (socket au-delà de fd 3) | test seul : un serveur TCP écoutant sur `127.0.0.1` passé en fd 4 : `out_not_l2`, `extra: [4]` (Linux seul : `/proc`) | `l2_seal_child_no_socket` |
| 3 | r-3 L4 (ordre de `syncDir`) | test seul : `conn/<cid>/` synchronisé après la création des deux fichiers du segment | `l2_segment_dir_synced_after_its_files` |
| 4 | r-3 M10 (queue de 4 096) | test seul : un enfant qui écrit plus de 4 Kio sur l'erreur standard et meurt (drapeau de tas illisible, sortie 9) : queue de 4 096 caractères | `l2_seal_apart_stderr_tail_bounded` |
| 5 | r-3 M17 (`removeEventListener`) | test seul : un `signal` partagé par deux scellés n'a plus d'écouteur (`getEventListeners`) | `l2_seal_apart_listener_removed` |
| 6 | `timeoutMs` court dans `_through_the_pinned_root` | corps resserré (`timeoutMs: 30_000`) ; vert à la base par nature, tueur `:71` appliqué à la main | `l2_seal_apart_through_the_pinned_root` |
| 7 | r-4 (inondation `hook_failed`) | une ligne `hook_failed` à la 1re, 10e, 100e… exception d'une connexion, avec son compte (`count`) | `l2_link_hook_failures_counted` |
| 8 | n-10 (exception exotique) | nom lu dans un `try`, chaîne seule, 64 caractères au plus, sinon `null` | `l2_link_hook_exotic_failure_named` |
| 9 | n-11 (`timeoutMs`, `env: null`) | `spec_refused` (`TypeError`) pour un `timeoutMs` non nombre, nul, négatif, `NaN`, infini ou ≥ 2³¹, et pour `env: null` | `l2_seal_apart_deadline_and_env_refused` |
| 10 | n-12 (résolu avant la relève) | à l'échéance ou à l'abandon, l'enfant tué, la promesse se résout sur son `close` (relevé), l'échec gardé | `l2_seal_apart_resolved_once_reaped` |
| 11 | n-13 (identité auto-référente) | `adopt` rend l'identité fixée (`root` : `dev`, `ino`) ; la boucle la passe à `sealApart`, dont le parent la compare au dossier qu'il ouvre : autre dossier, `root_refused` (`root_moved`) | `l2_seal_apart_root_identity`, `l2_record_seal_root_of_adopt` |
| 12 | n-14 (descripteur hérité sans `O_CLOEXEC`) | rien à corriger : noté dans l'en-tête de `seal-child.mjs` | — |
| 13 | n-15 (`fsync` de `conn/`) | `conn/` synchronisé quand `conn/<cid>/` y est créé | `l2_segment_conn_synced` |
| 14 | r-2 (reste : REST en vol à l'arrêt) | un `AbortController` de la boucle (`quit`) passé au client REST (`io.signal`), abandonné par `finish` : la requête en vol est abandonnée, sa réponse tardive n'écrit ni `requests.jsonl` ni `rest/` (`stopped`), aucune requête ne part après | `l2_record_rest_aborted_at_stop`, `l2_rest_aborted_writes_nothing` |
| 15 | r-3 (`note("stopped")`) | `tell("stopped", …)` : un journal en panne laisse sortir l'arrêt nommé (sonde JOURNAL) | `l2_record_broken_journal_named` |
| 16 | r-4 (a) tolérance `OVERDUE_US` | test seul (sonde JITTER) : 19 s de retard, la requête part ; 21 s, `event_skipped` ; tueur `> 0` à la main | `l2_record_overdue_tolerance` |
| 17 | r-4 (b) `tell` sans `try` | test : journal en panne, un horaire qui échoue (500 sur `time`) : aucun rejet non géré, la course s'arrête au signal | `l2_record_broken_journal_failure` |
| 18 | r-4 (c) rejet dans `within` | test : journal en panne, le `stop()` des liaisons rejette : l'arrêt propre finit sans attendre `STOP_BOUND_MS`, `links_closed: false` | `l2_record_broken_journal_links` |
| 19 | n-a (départ lent près de minuit) | une ancre en retard est sautée seulement si le jour corrigé a changé au `tick` ; **corrigé par le pli de la G2 (B-1)** : jugé au `tick` seul, ce critère laissait écrire comme clôture de D un `depth` envoyé après le minuit corrigé (requêtes chaînées) ; l'ancre est rejugée à l'envoi (`dayOf(sentUs + offset)`), sautée et nommée sinon ; `exchangeInfo` garde la tolérance de 20 s | `l2_record_slow_start_anchors` |
| 20 | filet `.catch` de `seals()` | retiré : depuis le `try` par clé (r-1), rien ne l'atteint ; une levée hors des clés (aucune connue) deviendrait un rejet non géré, que le filet du processus arrête nommé (`unhandled_rejection`) | — (code mort, déclaré) |

## Tueurs (un par test, forme close, ligne directement au-dessus de `test(` ; lignes du brouillon, gel à confirmer)

- 1 : `scripts/l2/seal.mjs:74 CONST "finally { if (fd !== null) closeSync(fd); }" -> "finally { }"`
- 2 : `scripts/l2/seal-child.mjs:20 CONST "(anon_inode|pipe):" -> "(anon_inode|pipe|socket):"`
- 3 : `scripts/l2/segments.mjs:67`, le `syncDir` avant la création du fichier d'index
- 4 : `scripts/l2/seal.mjs:76 CONST ".slice(-TAIL)" -> ""`
- 5 : `scripts/l2/seal.mjs:59`, `removeEventListener` retiré
- 7 : `scripts/l2/links.mjs`, le filtre `1, 10, 100…` en `true`
- 8 : `scripts/l2/links.mjs`, le nom lu sans `try` (`x?.name ?? null`)
- 9 : `scripts/l2/seal.mjs:64`, la condition de `timeoutMs` et d'`env` retirée
- 10 : `scripts/l2/seal.mjs:60`, la résolution immédiate rétablie
- 11 : `scripts/l2/seal.mjs:67`, la comparaison d'identité neutralisée ; `scripts/record-binance-l2.mjs:327`, `root` non passé
- 13 : `scripts/l2/segments.mjs:65`, le `syncDir` de `conn/` neutralisé
- 14 : `scripts/record-binance-l2.mjs:299`, `quit.abort()` retiré ; `scripts/l2/rest.mjs:129`, la garde après la lecture du corps neutralisée
- 15 : `scripts/record-binance-l2.mjs:399`, `tell` en `note`
- 16 : `scripts/record-binance-l2.mjs:378 CONST "now - e.at > OVERDUE_US" -> "now - e.at > 0"`
- 17 : `scripts/record-binance-l2.mjs:300`, le `try` de `tell` retiré
- 18 : `scripts/record-binance-l2.mjs:391`, la branche de rejet de `within` vidée
- 19 : `scripts/record-binance-l2.mjs:378`, le critère du jour en critère de retard

Les tests des points 1 à 6 et 16 sont verts à la base par nature (resserrements) : l'outil de preuve rouge les refuse « green at
base » ; leurs tueurs sont appliqués à la main au gel, fichier restauré, et nommés au G7. Les lignes de tueurs existantes qui bougent
(`links.mjs:181`, appel `fed` avec la connexion) sont réécrites en place, sans toucher les corps.

## Windows (rejeu de MONARK)

Aucun chemin POSIX écrit en dur dans une attente (chemins bâtis par `join`). Le test du point 2 (liste `/proc/self/fd` de l'enfant) porte
un saut nommé hors Linux ; ceux du scellé à part gardent le saut win32 nommé `APART` de c5-bis-a. Les tests du journal en panne (15, 17,
18) n'affirment pas le code d'erreur du système (`EISDIR` sous Linux).

## Preuve rouge, contrôles

Commit de ce G0 ; commit des tests (rouges, avec les `.d.mts`) ; gel ; `node scripts/red-proof.mjs --base 7d45fa54 --gel <gel> --repo
<worktree> --draw n --seed 37` (les refus « green at base » déclarés, tueurs à la main) ; ancres `verifie-ancres.mjs . --touched 7d45fa54
HEAD` ; `node --test test/l2-*.test.ts` ; `npm test` complet (`node_modules/@monark` en dossier de liens relatifs propres au worktree) ;
`tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; R-25 contre `7d45fa54`.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie ou publique)

- **Q-C5BC-1** (point 7) : compte en puissances de dix dans la ligne `hook_failed` (journal en O(log n)), plutôt que de ne plus nourrir le
  `<cid>` : le carnet garde son flux, la cause reste nommée. (défaut : oui)
- **Q-C5BC-2** (point 10) : la promesse attend la relève de l'enfant tué (`close`) ; un enfant bloqué en `D` après `SIGKILL` la retient
  jusqu'à sa fin : le contrat « jamais pendante au-delà de `timeoutMs` » devient « au-delà de `timeoutMs` et de la relève de l'enfant
  tué ». L'arrêt propre de la boucle borne déjà cette attente (`STOP_BOUND_MS`). (défaut : oui)
- **Q-C5BC-3** (point 11) : identité fixée par `adopt`, rendue avec `at` ; sous Linux elle ne peut différer (`at` est le descripteur), la
  comparaison ferme la fenêtre ailleurs (chemin réel re-résolu) et tout appel direct de `sealApart` avec `root`. Sans `root`, le
  comportement de c5-bis-a reste. (défaut : oui)
- **Q-C5BC-4** (point 19) : critère par tâche : ancre sautée si le jour corrigé a changé ; `exchangeInfo` sautée au-delà de 20 s (son
  jour est déjà lu au départ pour aujourd'hui et demain). (défaut : oui)
- **Q-C5BC-5** (point 20) : filet retiré plutôt que gardé sans preuve. (défaut : oui)
