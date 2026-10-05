# G7 du lot L2-P1-c5-bis-a (socle de la boucle et scellé à part), par RECHERCHES

Base `f330ab1c` (tête de `recherches/l2-p1-c5`, PR #153 empilée sur #151, toutes deux ouvertes ; `origin/lot/etude-suite` relu avant le
push : toujours `ab8084fb`, #151 et #153 non fusionnées, aucune fusion) ; branche `recherches/l2-p1-c5-bis` ; commits `958ebe9f` (G0), `93c7ee40` (tests rouges et `.d.mts`), `1f6be714` (gel),
`dc679b7d` (pli des mutants du lot : un cas de test ajouté), puis ce commit (G7). Poussé sur `origin/recherches/l2-p1-c5-bis`, aucune PR.
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
  arrêté au-delà de la borne.
