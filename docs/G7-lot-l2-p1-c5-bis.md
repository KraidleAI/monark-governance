# G7 du lot L2-P1-c5-bis-a (socle de la boucle et scellé à part), par RECHERCHES

Base `f330ab1c` (tête de `recherches/l2-p1-c5`, PR #153 empilée sur #151, toutes deux ouvertes ; `origin/lot/etude-suite` relu avant le
push : toujours `ab8084fb`, #151 et #153 non fusionnées, aucune fusion) ; branche `recherches/l2-p1-c5-bis` ; commits `958ebe9f` (G0), `93c7ee40` (tests rouges et `.d.mts`), `1f6be714` (gel),
`dc679b7d` (pli des mutants du lot : un cas de test ajouté), `b141e87c` (G7) ; puis le pli de la G2 (BLOQUE) : `155058dd` (tests rouges),
`6e3cff6a` (gel), et le commit qui complète ce G7 (section « Pli de la G2 »). Poussé sur `origin/recherches/l2-p1-c5-bis`, aucune PR.
Node v24.21.0. Aucun réseau vers une place : sockets menées à la main, place factice de la boucle locale pour la mesure ; sorties sous le
dossier temporaire du système, hors de tout arbre git ; trames synthétiques seules, aucune série de marché au dépôt.
`packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Scission

c5-bis (ligne P1-c5 du plan, plus les points renvoyés par c1 à c5) est estimé de 665 à 740 lignes, au-dessus de 547. Le G0 déclare la
scission avant tout code (Q-C5B-1) : **ce lot, P1-c5-bis-a**, ce que la boucle prend de ses modules et le scellé à part ;
**P1-c5-bis-b**, la boucle (horaires, REST, carnets et bascule, ancres, scellés au calendrier, rythme de `check()`, suspension de poids,
arrêt propre borné ; tests `l2_record_loop_schedules` et `l2_record_loop_clean_stop`). La commande s'arrête encore `not_built` après ses
gardes.

## Périmètre livré

- `scripts/l2/seal-child.mjs` (34 lignes, neuf) : l'enfant qui scelle un jour ; ses gardes d'abord (`execArgv` exactement un drapeau,
  `--max-old-space-size=<n>`, sinon `proxy_refused` ; `guardEnv(env, [])` de la commande), puis `sealOf` de la spécification ; une
  ligne JSON `{ result }` ou `{ stop, detail }`.
- `scripts/l2/seal.mjs` (+25, à la fin) et `.d.mts` (+8) : `SEAL_HEAP_MB` = 128, `sealApart(spec, { env, heapMb })` (`spawn` du node
  courant, un drapeau, l'environnement donné ; `closed` traverse comme la liste `open` ; rend le résultat ou `failed`, ne rejette
  jamais).
- `scripts/l2/links.mjs` (+4, quatre lignes changées en place) et `.d.mts` (+6) : `io.onText(text, cid)` après l'écrivain (Q-A4-3) ;
  `live` (`<cid>` → écrivain jusqu'à sa fermeture) ; `cut()` ; `closed(cid, seg)` (Q-C1-5) ; en-tête complété en place.
- `scripts/l2/segments.mjs` (une ligne en place) et `.d.mts` (+2) : `sync` puis `close` de chaque fichier d'un segment (m-7 de c1).
- `scripts/record-binance-l2.mjs` (+18, cinq lignes en place) et `.d.mts` (+3/−1) : la marche compte absent un fichier disparu
  (`:133`) ; `adopt` rend `at` (`:245`) ; `markTails(at, io)` (Q-C1-4) ; en-tête complété en place.
- `test/l2-loop.test.ts` : onze tests ajoutés à la fin, un tueur chacun ; `test/l2-record.test.ts` : la ligne du tueur de
  `l2_main_runs_by_real_path` renumérotée (`:269` → `:287`).
- Lignes des tueurs du G0 confirmées au gel, inchangées au pli. Écart au G0 : un cas ajouté à `l2_seal_child_flags_closed` au pli des mutants du lot (section « Mutants »).

## Points renvoyés à c5-bis

| Point | Suite | Preuve |
|---|---|---|
| Q-A4-3 | crochet `onText` ici ; règle de bascule et `switched` à c5-bis-b | `l2_link_feeds_its_hook` |
| Q-C1-5 | `closed(cid, seg)` des liaisons | `l2_link_closed_segments` |
| D24-3 (coupe sur ordre) | `cut()` ; l'appel à l'heure pleine est à c5-bis-b | `l2_link_cut_on_the_hour` |
| m-7 de c1 | segments synchronisés avant fermeture | `l2_segment_synced_before_close` |
| Q-C1-4 | `markTails`, une fois, dernier passage qui a ouvert une liaison | `l2_tails_marked_once`, `l2_tails_of_the_last_run_with_links` |
| scellé concurrent (G2 de c5) ; Q-G2B-3 | fichier disparu compté absent ; temporaire laissé, inerte | `l2_walk_vanished_entry_absent` |
| Q-5 de a2, Q-C1-9, m-5 de la G2 de c5 | scellé dans un enfant plafonné par drapeau, gardé ; mesure ci-dessous | `l2_seal_apart_as_in_process`, `l2_seal_child_flags_closed`, `l2_seal_child_env_closed`, `l2_seal_apart_heap_named` |
| racine fixée aux modules | `adopt` rend `at` ; passée par c5-bis-b | `l2_tails_marked_once` (écrit par `at`) |
| n-3 de c4, Q-P1-6 et Q-B1-3, Q-8 de a3 | c5-bis-b (horaires, suspension, arrêt) | — |
| L2-TLS-PEER-UNATTESTED-1 | re-différé après M-1 (Q-C5B-7) | — |

## Mesures de mémoire (L2-MINUTES-SIZE-1, G0 point 6)

Cgroup v1 à 512 Mio, boucle vivante (place factice, cinq liaisons, 1 000 messages par seconde et par connexion spot), jour synthétique au
ras d'`INDEX_BOUND` ; pic anonyme = maximum de `total_rss` échantillonné toutes les 100 ms ; `max_usage_in_bytes` vaut 512 Mio dès que
le jour est lu (cache de pages repris par le noyau, `failcnt` élevé), ce n'est donc pas la mesure du budget.

| Scellé | Résultat | Pic anonyme | Boucle |
|---|---|---|---|
| `Worker`, `resourceLimits` 256 Mio | processus entier tué par le noyau | — | morte |
| enfant sans plafond effectif (8 192) | enfant seul tué (`SIGKILL`) à 144 s | 503,5 Mio | vivante |
| enfant, 256 / 192 / 128 Mio | scellé en 212 / 216 / 191 s | 470,8 / 472,5 / 469,0 Mio | vivante |
| enfant, 128 Mio, 2 000 messages/s | scellé en 181 s | 470,6 Mio | vivante |
| enfant, 64 Mio | enfant arrêté par V8 (`SIGABRT`) à 88 s, échec nommé | 357,3 Mio | vivante |

Boucle seule : 56 Mio anonymes. Plafond retenu 128 Mio. Le budget tient à la charge mesurée (marge 43 Mio) ; il ne tient pas au pire de
D24-4 (80 Mio de files) en même temps qu'un jour au ras de la borne : le noyau tue alors l'enfant, le plus gros processus, et la boucle
continue ; P3 fixe `OOMPolicy=continue` (note du G0). Item ouvert, clôture sous l'unité (P3). Jour synthétique effacé, cgroups retirés.

## Preuves

- `node scripts/red-proof.mjs --base f330ab1c --gel dc679b7d --repo /home/user/monark-governance-c5b --draw 11 --seed 37` : « red-proof OK: 11 judged, 44 unchanged, 11 killer(s) drawn » ; onze F2P (rouges par assertion à la base), les onze tueurs tués ; `RED-PROOF.json` sha256 `43e624892ca1bc0e…` (au gel `1f6be714`, avant le pli : même verdict, `23b90d62ba7a0cdb…`). Les 44 « unchanged » sont les 23 tests de c5 et les 21 de c4, dont une ligne de tueur seule a changé.
- Tueurs appliqués à la main au gel, un à la fois, le test seul rejoué, fichier restauré et sha256 vérifié : les onze rougissent par
  assertion (`ERR_ASSERTION`). Base : le fichier de tests du lot à `f330ab1c` rend onze rouges par assertion, les 23 tests de c5 verts.
- Ancres : `verifie-ancres.mjs . --touched f330ab1c HEAD` : 55 tueurs (11 neufs, 23 de c5, 21 de c4), 55 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files` sur les quatorze fichiers `test/l2-*.test.ts` :
  150 tueurs, 150 ANCRE.
- `node --test test/l2-*.test.ts` : 150 sur 150. `npm test` complet, une fois, dans le worktree : 2 356 tests, 2 331 réussis, 3 échecs, 22 ignorés, sortie 1, au gel `1f6be714`. Les trois échecs sont hors du lot et préexistants : `sentinel_sigterm_after_lock_acquired_before_handler_releases_lock` et `sentinel_sigterm_while_lock_acquiring_releases_lock` (`apps/sentinel/test/sentinel-chainstack-guard.test.ts`), `ukemi_guard_record_skipped_the_platter_flush_nonvacuous` (`apps/sentinel/test/ukemi-guard-record.test.ts`) ; chacun de ces deux fichiers, rejoué seul, rend les mêmes rouges à la tête et à la base `f330ab1c` (2 et 1), aucun fichier de `apps/` ni de `packages/` touché par le lot : une cause de ce poste, à signaler à MONARK, pas une régression du lot.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml`, base `f330ab1c`) : `STAT` 299 (281 insertions, 18 suppressions), marge 248 ; borne du lot 547 ;
  `CONTENT_STAT` 0 ; GREEN. Estimation du G0 : environ 300.

## Mutants du lot (au-delà des tueurs)

- Tués : environnement hérité au lieu de l'environnement donné (`{ env, stdio` → `{ stdio` : l'enfant refuse, `l2_seal_apart_as_in_process`
  rougit) ; premier segment au lieu du dernier dans `markTails` ; `symbol` forcé à `ALL` ; `cut()` sur aucun écrivain.
- Trou trouvé et fermé au pli : `!HEAP.test(execArgv[0])` → `false` survivait (un seul drapeau, autre que le plafond, passait) ; cas
  `["--no-warnings"]` ajouté à `l2_seal_child_flags_closed`, le mutant y rougit.
- Survivants déclarés : `live.delete(c.cid)` retiré (équivalent pour `closed()`, un écrivain fermé tient tous ses segments clos ; seul
  l'oubli de la table croît, une entrée par connexion) ; `CID.test(l.cid)` → `true` dans `markTails` (défensif : un `<cid>` forgé au
  journal ne mène qu'à un chemin absent).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C5B-1 (scission a/b), Q-C5B-2 (enfant plafonné par drapeau, 128 Mio, plutôt qu'un `Worker` : Q-C5-3 révisée sur mesure), Q-C5B-3
(forme close de l'enfant ; win32 ne scelle pas jusqu'à M-1), Q-C5B-4 (`seal-child.mjs` hors du `script_sha256`), Q-C5B-5 (`markTails`
lit le journal en entier), Q-C5B-6 (temporaire de Q-G2B-3 laissé ; fichier disparu compté absent), Q-C5B-7 (L2-TLS-PEER-UNATTESTED-1
après M-1).

## Notes pour c5-bis-b

- `run` en enregistrement : `prepare`, `adopt` (rend `at`), `markTails(at, io)`, puis `createRest({ fetch, nowUs, out: at })`,
  `createBook({ ..., out: at })` par symbole, `openLink({ ..., out: at }, { ...io, onText })` (quatre spot, `/market`) ; `onText` →
  `book.feed(text, cid)` ; bascule : `book.switchTo(cid)` puis `link.switched(cid)` quand la connexion neuve a rejoint le carnet.
- Horaires : `link.cut()` à chaque heure pleine ; heure de la place à la minute 30 ; `exchangeInfo` à 23:58:00 + 10 s × rang (échelle
  et `rateLimits` du jour suivant ; plafond sous 4 000 : suspension nommée, Q-P1-6) ; ancres à 23:59:10 + 10 s × rang ; scellés par
  `sealApart(spec, { env })` après la fin du jour plus la grâce, un symbole à la fois, `open` = les `cid/seg` de la fenêtre que
  `closed()` d'une liaison dit tenus ; un échec (`failed`) journalisé, le jour laissé au rejeu ; `check()` à son rythme (n-3 de c4).
- Arrêt propre : liaisons arrêtées, attente bornée des écrivains (Q-8 de a3), carnets fermés, REST fermé, enfant de scellé attendu puis
  arrêté au-delà de la borne : `signal` de `sealApart` (un `AbortController` de l'arrêt), qui tue l'enfant et rend `seal_aborted`.
- Contrat de `sealApart` après le pli de la G2 (B-1, m-2, n-2, n-3) :
  `sealApart(spec: ApartSpec, io?: { env?: Record<string, string>; heapMb?: number; timeoutMs?: number; signal?: AbortSignal }): Promise<ApartResult>`,
  `env` vide par défaut, `heapMb` = `SEAL_HEAP_MB` (128), `timeoutMs` = `SEAL_TIMEOUT_MS` (900 000). `spec.out` est la racine `at`
  d'`adopt` : ouverte une fois par le parent, passée à l'enfant comme son fd 3, jamais un chemin re-résolu. Échecs nommés dans
  `failed.stop` : arrêt de l'enfant (`out_not_l2`, `proxy_refused`, `env_refused`, arrêts de `sealDay`), `root_refused`, `spec_refused`,
  `spawn_failed`, `seal_timeout`, `seal_aborted`, ou `null` à sa mort (`signal`, et `detail.stderr`, queue de 4 Kio) ; ne rejette jamais.
- Q-C5B-4 (avis de la G2) : c5-bis-b ajoute `scripts/l2/seal-child.mjs` au `script_sha256` du jour, des deux côtés (à part ou non).
- n-4 de la G2 : un enfant orphelin (parent tué) peut chevaucher le scellé du même jour au passage suivant. Sous systemd,
  `KillMode=control-group` (défaut, P3) l'évite ; hors systemd, c5-bis-b pose un verrou par jour (`wx` sous `days/<SYMBOLE>/`) avant
  `sealApart`. n-5 : la boucle marque la queue d'un écrivain arrêté sur `write_failed` à sa fermeture, ou le déclare.

## Pli de la G2 (verdict BLOQUE, `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c5-bis-a.md`)

Tests rouges `155058dd`, gel `6e3cff6a`. Douze tests neufs à la fin de `test/l2-loop.test.ts`, un tueur chacun ; un test resserré
(`l2_seal_apart_heap_named`) ; lignes des tueurs renumérotées en place pour `l2_seal_apart_as_in_process`, `l2_seal_child_flags_closed`,
`l2_seal_child_env_closed`, `l2_seal_apart_heap_named` (`seal-child.mjs` et `seal.mjs` grandis) et `l2_link_feeds_its_hook` (texte de la
ligne 181 changé). Les lignes portant les tueurs de a2, a3, a4, c4 et c5 ne bougent pas : `fed` et `syncDir` vont à la fin de leur fichier,
les deux appels changent leur ligne en place.

| Constat | Suite | Preuve (tueur) |
|---|---|---|
| **B-1** racine fixée hors de l'enfant ; promesse pendante | `sealApart` ouvre `spec.out` (la racine `at`) une fois en dossier et la passe en `stdio[3]` ; la spécification porte son `dev` et son `ino`. L'enfant, après ses gardes et avant toute donnée, vérifie fd 3 par `fstat` (dossier, `dev`, `ino`) et qu'aucun fichier, dossier ni socket n'est hérité au-delà (`/proc/self/fd` : seuls les descripteurs propres de node, `anon_inode:`, `pipe:`, `/dev/null`), sinon `out_not_l2` ; il scelle par `/proc/self/fd/3`, `dir` rendu sous `spec.out`. Échéance `SEAL_TIMEOUT_MS` (900 000 ms, environ quatre fois le plus lent mesuré, 216 s) et `signal` : l'enfant tué, `seal_timeout` ou `seal_aborted`, rendus tout de suite | `l2_seal_apart_through_the_pinned_root` (`seal.mjs:69` `, fd]`), `l2_seal_child_root_checked` (`seal-child.mjs:26` `ino`), `l2_seal_child_root_alone` (`seal-child.mjs:26` `extra.length === 0`), `l2_seal_apart_deadline` (`seal.mjs:71`), `l2_seal_apart_aborted` (`seal.mjs:72`) |
| reproducteur de B-1 (`/proc/self/fd/999`, aucun fd 3) | refusé à l'instant, nommé (`out_not_l2`) ; par l'API, scellé par `at` en quelques millisecondes | `l2_seal_child_root_checked`, `l2_seal_apart_through_the_pinned_root` |
| **m-1** note pour P3 sur `memory.peak` | G0 corrigé : `anon` de `memory.stat`, échantillonné, et `oom_kill` de `memory.events` (v2) | — (texte) |
| **m-2** `sealApart` rejette (`E2BIG`, spécification non JSON) | un seul `try` autour de l'ouverture, de la sérialisation et du `spawn` : `root_refused`, `spec_refused`, `spawn_failed`, détail `error` (code ou nom) | `l2_seal_apart_never_rejects` (`seal.mjs:70`) |
| **m-3** MA (`.sort()` de `markTails`) | test : `readdirSync` enveloppé rend l'ordre inverse des noms | `l2_tails_of_the_last_segment_by_name` (`record-binance-l2.mjs:257`), tueur appliqué à la main |
| **m-3** MD (`await` du fsync) | test : un `sync` qui se résout un tour plus tard ; `close` après sa résolution | `l2_segment_closed_once_synced` (`segments.mjs:70`), à la main |
| **m-3** MK (`cut()` en recouvrement) | test : deux écrivains tenus (renouvellement sur `serverShutdown`), les deux segments clos | `l2_link_cut_in_an_overlap` (`links.mjs:204`), à la main |
| **m-3** MC (`onText` avant `push`) | test : un crochet qui arrête la liaison ne perd pas le message | `l2_link_hook_after_the_writer` (`links.mjs:181`), à la main |
| **m-3** signal non épinglé | `l2_seal_apart_heap_named` épingle `failed.signal === "SIGABRT"`, `code` nul, et la queue de l'erreur standard (`/heap/`) | même test, F2P contre `b141e87c` |
| **m-4** crochet qui lève | `fed(io, note, text, cid)` (fin de `links.mjs`) : l'exception est prise, journalisée `hook_failed` (`error` : son nom), l'écrivain a déjà le message, le suivant est donné ; `.d.mts` le dit | `l2_link_hook_failure_named` (`links.mjs:212`) |
| n-1 | rien ; l'en-tête de l'enfant dit « avant toute donnée », les modules étant chargés : l'environnement explicite du parent est la première défense | — |
| n-2 | erreur standard de l'enfant en tube, queue de 4 096 caractères dans `failed.detail.stderr` quand l'enfant meurt sans ligne | `l2_seal_apart_heap_named` |
| n-3 | `env` vide par défaut | `l2_seal_apart_through_the_pinned_root` (appel sans `io`) |
| n-4 | `signal` et échéance livrés ici : l'arrêt propre de c5-bis-b tue l'enfant. Un parent tué net laisse l'enfant vivre : `KillMode=control-group` à P3, verrou par jour à c5-bis-b (notes ci-dessus) | `l2_seal_apart_aborted` |
| n-5 | c5-bis-b (notes ci-dessus) | — |
| n-6 | `syncDir(dir)` après la création des deux fichiers d'un segment (fin de `segments.mjs`, `r+` sous win32 comme `sealDay`) | `l2_segment_dir_synced` (`segments.mjs:67`) |
| n-7 | P3 : `OOMScoreAdjust=` de l'unité ne vise pas l'enfant seul ; l'enfant relèvera son `oom_score_adj` (une écriture, permise à la hausse) dans P3 avec la clôture de L2-MINUTES-SIZE-1, mesurée sous l'unité | — |
| n-8 | levé par B-1 : une racine absente n'est pas ouverte, `root_refused`, rien créé | `l2_seal_apart_never_rejects` |
| Q-C5B-4 | c5-bis-b ajoute `seal-child.mjs` au `script_sha256` (notes ci-dessus) | — |
| rouges sentinelle du G7 | cause précisée par la G2 : `node_modules` lié en bloc, liens `@monark/*` résolus dans un autre clone ; rien à signaler à MONARK | `npm test` ci-dessous |

Réserve déclarée : la vérification « rien d'hérité au-delà de fd 3 » ne distingue pas un tube ou `/dev/null` hérités des descripteurs
propres de node (même nature) ; un fichier, un dossier ou un socket sont refusés. Le parent ne passe que `["ignore", "pipe", "pipe", fd]`,
et libuv ouvre tout en `O_CLOEXEC`.

Survivants de la G2 sans suite : MF (`HEAP` relâché, le parent seul choisit la valeur), ME (`code === 0 &&`), MT (`symbol` forcé, un seul
symbole aux tests). MS (erreur standard héritée) est désormais tué par l'épingle `/heap/` de `l2_seal_apart_heap_named`.

### Preuves du pli

- `node scripts/red-proof.mjs --base b141e87c --gel 6e3cff6a --repo /home/user/monark-governance-c5b --draw 9 --seed 37` : 13 jugés,
  33 inchangés ; neuf F2P (`l2_seal_apart_heap_named`, `_through_the_pinned_root`, `l2_seal_child_root_checked`, `_root_alone`,
  `l2_seal_apart_deadline`, `_aborted`, `_never_rejects`, `l2_segment_dir_synced`, `l2_link_hook_failure_named`), leurs neuf tueurs tirés
  et tués ; quatre refusés « green at base » (les tests resserrants de m-3, attendus). Verdict de l'outil : REFUSED pour ces quatre seuls ;
  `RED-PROOF.json` sha256 `58dc8fe2a74d1325…`.
- Tueurs appliqués à la main au gel, un à la fois, le test seul rejoué, fichier restauré et sha256 vérifié : les quatre de m-3 et les
  quatre dont la ligne a été renumérotée (`l2_seal_child_flags_closed`, `_env_closed`, `l2_seal_apart_as_in_process`,
  `l2_link_feeds_its_hook`) rougissent par assertion (`ERR_ASSERTION`).
- Ancres : `verifie-ancres.mjs . --touched f330ab1c HEAD` : 67 tueurs, 67 ANCRE, 0 DERIVE, 0 PERDU ; `--files` sur les quatorze fichiers
  `test/l2-*.test.ts` : 162, 162 ANCRE.
- `node --test test/l2-*.test.ts` : 162 sur 162. `npm test` complet, une fois, au gel `6e3cff6a`, avec `node_modules/@monark/*` refaits en liens propres
  au worktree (vers ses `packages/` et `apps/`) : 2 368 tests, 2 346 réussis, 0 échec, 22 ignorés, sortie 0 (les trois rouges sentinelle
  du premier G7 ont disparu avec le montage, comme la G2 l'a montré).
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** du lot entier (`r25()`, `ci.yml`, base `f330ab1c`) : `STAT` 519 (499 insertions, 20 suppressions), `CONTENT_STAT` 0, GREEN ;
  borne du lot 547, marge 28 (le pli seul : 254 insertions, 38 suppressions contre `b141e87c`, dont des lignes déjà comptées au lot).
  c5-bis-b, estimé 365 à 440, tient seul sous 547.

## Pli de la G2 delta (verdict APPROUVE SOUS RESERVE, `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c5-bis-a-delta.md`)

Tests rouges `34435a3f`, gel `66be6dd1`. Trois tests neufs à la fin de la partie c5-bis-a de `test/l2-loop.test.ts`, un tueur chacun ;
aucun test existant modifié dans son corps ; lignes des tueurs de `seal.mjs` renumérotées en place (`l2_seal_apart_heap_named` et
`_through_the_pinned_root` 69 vers 71, `_deadline` 71 vers 72, `_aborted` 72 vers 73, `_never_rejects` 70 vers 74). Budget R-25 : 28
lignes, toutes prises (547 sur 547) ; le reste va à c5-bis-b, liste fermée ci-dessous.

| Constat | Suite | Preuve (tueur) |
|---|---|---|
| **r-1** racine fixée supprimée : l'enfant tourne à vide jusqu'à l'échéance | `unpinned` de l'enfant exige `st.nlink > 0n` : un dossier supprimé depuis son ouverture (`nlink` 0) est refusé à l'instant, `out_not_l2`, sortie 1 | `l2_seal_apart_root_deleted` (`seal-child.mjs:26` `st.nlink > 0n && `) : racine ouverte, supprimée, `sealApart` par `/proc/self/fd/<n>` refusé en environ 70 ms ; à la base, `seal_timeout` après 5 s |
| **r-2** `signal` non conforme : `sealApart` rejette, l'enfant sans observateur | `io` lu dans le `try` ; un `signal` qui n'est ni `undefined` ni `instanceof AbortSignal` lève avant toute ouverture : `spec_refused`, détail `TypeError`, aucun enfant, aucune minuterie. L'échéance et l'écouteur sont posés dans le `try`, après le `spawn` | `l2_seal_apart_io_refused` (`seal.mjs:64` `given === undefined ? undefined : null`) : le reproducteur `{}` et un `EventTarget` ; à la base, rejet (`removeEventListener is not a function`) et racine ouverte |
| **n-9** `io` nul ou accesseur qui lève : levée synchrone | `io ?? {}` : un `io` nul vaut aucun (défauts) ; un accesseur qui lève donne `spec_refused` (détail : nom de l'erreur) | même test : `null` donne `root_refused` sur une racine absente (défauts appliqués), un `get env()` qui lève `spec_refused`/`RangeError` |
| **r-3** M4 (`kill` retiré de `halt`) | test : un scellé à l'échéance (1 ms) et un scellé arrêté ; 3 s plus tard, aucun `SHA256SUMS` dans les deux jours | `l2_seal_apart_child_killed` (`seal.mjs:60` `child?.kill("SIGKILL")`) ; vert à la base (test resserrant, comme ceux de m-3), tueur appliqué à la main : rouge par assertion en 3 s, sans pendre (r-1 levé, l'enfant non tué ne boucle plus sous la racine supprimée) |
| r-3 M3, L8, L4, M10, M17 ; ajout de `timeoutMs` à `_through_the_pinned_root` | renvoyés à c5-bis-b (liste ci-dessous) | — |
| r-4 inondation `hook_failed` | renvoyé à c5-bis-b (liste ci-dessous) | — |
| n-10 à n-15 | renvoyés à c5-bis-b (liste ci-dessous) | — |

### Renvoyés à c5-bis-b (qui fusionne cette branche, marge d'environ 199 lignes)

1. **r-3 M3** : un test qui affirme que le parent ferme le descripteur de la racine après le `spawn` et sur échec (par exemple, compter
   `/proc/self/fd` avant et après N scellés, ou envelopper `closeSync`) ; tueur `seal.mjs:74` `finally { if (fd !== null) closeSync(fd); }`.
2. **r-3 L8** : un test qui passe un socket (par exemple un `net.Server` écoutant, ou une paire `socketpair` via un tube nommé) au-delà
   de fd 3 et attend `out_not_l2` ; tueur `seal-child.mjs:20`, `socket:` admis dans `OWN`.
3. **r-3 L4** : prouver l'ordre de `syncDir(dir)` dans `segments.mjs` (après la création des deux fichiers, pas après `mkdir`), par un
   `fs` enveloppé qui journalise l'ordre des appels.
4. **r-3 M10** : borner la queue de l'erreur standard (`TAIL` = 4 096) par un test (enfant qui écrit plus de 4 Kio sur l'erreur standard
   puis meurt) ; tueur `.slice(-TAIL)` retiré.
5. **r-3 M17** : `removeEventListener` dans `finish` affirmé (un `signal` partagé par N scellés n'accumule pas d'écouteur, par exemple via
   `getEventListeners` de `node:events`).
6. **r-3** : `timeoutMs` court dans `l2_seal_apart_through_the_pinned_root`, pour qu'une régression de la racine rougisse au lieu de
   pendre (non fait ici : modifier ce corps le ferait juger « green at base » par la preuve rouge).
7. **r-4** : un crochet qui lève toujours écrit une ligne `hook_failed` par message (10 000 messages, 1,59 Mo). Journaliser la première
   exception par `<cid>` puis compter les suivantes, ou ne plus nourrir ce `<cid>` ; la boucle de c5-bis-b réagit à `hook_failed`.
8. **n-10** : exception exotique d'un crochet (accesseur `name` qui lève, `name` en `BigInt`, `Proxy`) qui sort du `catch` de `fed` ;
   prendre `typeof x?.name === "string" ? x.name.slice(0, 64) : null` dans un `try` (borne aussi la longueur du nom).
9. **n-11** : `timeoutMs` non fini, négatif, nul, au-delà de 2^31-1 ou non numérique (échéance de 1 ms, `TimeoutOverflowWarning`) et
   `env: null` (hérite de tout l'environnement à `spawn`) : `spec_refused` dans le même `try`.
10. **n-12** : à l'échéance, la promesse se résout avant que l'enfant soit relevé (zombie bref) ; le verrou par jour de c5-bis-b (n-4)
    couvre le recouvrement, à défaut résoudre sur `close` après le `kill`.
11. **n-13** : la comparaison `dev`/`ino` de l'enfant est auto-référente ; passer l'identité d'`adopt` à `sealApart`, ou refuser sous Linux
    un `spec.out` qui n'est pas `/proc/self/fd/<n>`.
12. **n-14** : un descripteur hérité sans `O_CLOEXEC` par l'enregistreur n'atteint pas l'enfant (sonde verte) : rien à corriger, à noter
    dans l'en-tête de `seal-child.mjs`.
13. **n-15** : `fsync` de `conn/` après la création de `conn/<cid>/` (première connexion), à rattacher à n-6.

### Preuves du pli delta

- `node scripts/red-proof.mjs --base c6cf927a --gel 66be6dd1 --repo /home/user/monark-governance-c5b --draw 3 --seed 37` : 3 jugés,
  46 inchangés ; deux F2P (`l2_seal_apart_root_deleted`, `_io_refused`), leurs deux tueurs tirés et tués ; un refusé « green at base »
  (`l2_seal_apart_child_killed`, resserrant, attendu). Verdict de l'outil : REFUSED pour ce seul test ; `RED-PROOF.json` sha256
  `eec79e7813647f96…`.
- Les trois tueurs appliqués à la main au gel, un à la fois, le test seul rejoué, fichier restauré et sha256 vérifié : les trois
  rougissent (`root_deleted` en 5 s, `io_refused` à l'instant, `child_killed` en 3 s), aucun ne pend.
- Ancres : `verifie-ancres.mjs . --touched f330ab1c HEAD` : 70 tueurs, 70 ANCRE, 0 DERIVE, 0 PERDU.
- `node --test test/l2-*.test.ts` : 165 sur 165.
- `npm test` complet, une fois, au gel `66be6dd1`, `node_modules/@monark/*` en liens relatifs propres au worktree : 2 371 tests, 2 349
  réussis, 0 échec, 22 ignorés, sortie 0.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** du lot entier (`r25()`, `ci.yml`, base `f330ab1c`) : `STAT` 547 (527 insertions, 20 suppressions), `CONTENT_STAT` 0, GREEN ;
  borne du lot 547, marge 0 (le pli delta : +28 nettes). Toute ligne de code de plus va à c5-bis-b.
