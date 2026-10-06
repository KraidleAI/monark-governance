# G7 du lot L2-P1-c1 (jour et scellé), par RECHERCHES

Base `721b1d50` (`lot/etude-suite`) ; branche `recherches/l2-p1-c1` ; commits `b41710d8` (G0), `6fde6d07` (tests rouges et
`day.d.mts`), `dc533ac1` (gel), `115b1342` (correction de `lang:gate`, une ligne de commentaire). Aucun push, aucune PR. Node v24.21.0.
Aucun réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système, horloges injectées ; données synthétiques,
aucune série brute dans le dépôt. Tronc relu au G7 : `origin/lot/etude-suite` toujours en `721b1d50`, aucune fusion à faire.

## Périmètre livré (`scripts/l2/day.mjs`, `scripts/l2/day.d.mts`, `test/l2-day.test.ts`)

- Couture `sealDay({ out, symbol, day, nowUs, closed, config })`, appelée par c5 (horaires) et c6 (rejeu `--from-raw`) ; arrêts nommés
  `bad_symbol`, `bad_day`, `place_time_unsafe`, `day_sealed` (`DayStop`).
- Jour d'une trame spot par son `E` lu en microsecondes (l'URL pose `timeUnit=MICROSECOND`, a3), jamais d'après sa grandeur ; garde
  `Number.isSafeInteger` (condition (2)) : arrêt `place_time_unsafe` (`symbol`, `cid`, `seg`, `rank`), aucun dossier du jour, brut
  intact, les autres symboles se scellent.
- `@bookTicker` (Q-9, TL-4) : jour de la différence de la même connexion dont `[U;u]` (bornes fermées) contient son `u`, sinon jour de
  réception marqué `recv_day`. `/market` : jour de réception marqué `recv_day` (Q-C1-1) ; les `@forceOrder` d'un autre symbole sont
  écartés, une trame sans flux va à chaque symbole.
- Trames tardives (D24-5, `GRACE_US` = 120 s) : reçue à fin + grâce, dans son jour ; une microseconde après, à l'index du jour de
  réception, `late`, `of` = son jour, comptée. (Le plan §8.2 dit « une milliseconde » ; le G0 et le test tiennent la microseconde,
  plus fine.)
- Index du jour, `missing.json` (trous de liaison et événements de `MISSING_EVENTS`), manifeste (§3 point 19), puis `SHA256SUMS` en
  dernier (drapeau `wx`, format de `sha256sum -c`, segments par chemin relatif) ; un jour scellé n'est jamais réécrit.
- Écart au G0 : aucun sur le fond. Le gel citait en français le titre de §2.3 dans l'en-tête de `day.mjs` (l.2), touche de
  `lang:gate` ; corrigé en `115b1342` sur la même ligne, sans décalage : les sept tueurs gardent leur ancre.

## Lectures déclarées : questions pour MONARK (non bloquantes)

- **Q-C1-1** : tant que FAITS-L2-ACCESS-3-E-1 est ouvert, le jour d'une liquidation est-il bien son jour de réception, marqué
  `recv_day`, avec `time_unit` de `/market` nul au manifeste (plutôt que lire `E` en ms par déduction, ou arrêter le dérivé de
  `/market`) ? Un rejeu `--from-raw` réindexera ces trames quand l'unité sera établie.
- **Q-C1-2** : `missing.json` peut-il lire le journal (entrée enregistrée) pour les ruptures de chaîne que b2 journalise en ligne,
  index et jour venant du brut seul (Q-P1-8) ?
- **Q-C1-3** : la règle de Q-9 cherche-t-elle bien l'intervalle dans les différences de la MÊME connexion seulement (deux connexions
  en chevauchement portent chacune les leurs ; égalité des bornes entre hôtes renvoyée à M-5) ?
- **Q-C1-4** : contrat pour c5 accepté ? Une queue trouvée à la reprise (`checkTail` de a2) est journalisée `tail_marked` avec les
  champs de `Tail` ; c1 la passe au lecteur comme marque et la reporte au `missing.json`.
- **Q-C1-5** : `closed(cid, seg)` est-il bien à fournir par c5 (le disque seul ne dit pas qu'un fichier est encore ouvert) ?
- **Q-C1-6** : la fenêtre de lecture [début − 1 h ; fin + grâce] par heure de segment suffit-elle ? Limite : une trame dont l'heure de
  place **suit** sa réception de plus d'une heure n'est pas lue au scellé de son jour ; depuis le pli du G2 (B-3), elle est rangée au
  jour de son segment (second G2 R-1), marquée `early`, `of` = son jour, comptée ; item proposé L2-DAY-SCAN-WINDOW-1, mesure en M-6.
- **Q-C1-7** : amorce et ancres restent-elles hors de c1 (c2 rejoue, c5 écrit les ancres), `SHA256SUMS` listant tout fichier présent
  au dossier du jour au scellé, ancres comprises ?
- **Q-C1-8** : `script_sha256` = empreintes des cinq modules `scripts/l2/*.mjs` (`book`, `day`, `links`, `rest`, `segments`) jusqu'à la
  commande de c4, qui s'y ajoutera : d'accord ?
- **Q-C1-9** : l'index d'un jour tenu en mémoire au scellé, compact depuis le pli du G2 (trois int32 par trame, plafond
  `INDEX_BOUND` = 4 194 304 trames depuis le second G2, arrêt `index_bound` ; mesures à la section G2), est-il acceptable, sa taille réelle mesurée en M-1
  (c5 scelle dans un fil de travail, Q-5 de a2) ?
- **Q-C1-10** (pli du G2, B-1) : contrat pour c5 accepté ? À chaque lancement, avant toute ouverture, c5 journalise
  `{"event":"start","symbol":"ALL","cid":null}` (avec `host_us`, `mono_ns`) ; c1 y lit l'arrêt du processus : chaque connexion encore
  ouverte au journal est close d'office, trou `process_restart` jusqu'à la première trame de la connexion suivante.

## Preuves

- `node scripts/red-proof.mjs --base 721b1d50 --gel dc533ac1 --repo /home/user/monark-governance-c1 --draw 7 --seed 37` : sortie 0,
  « red-proof OK: 7 judged, 0 unchanged, 7 killer(s) drawn » ; `RED-PROOF.json` sha256 `e2f565d5781cf712…`. Rejoué au HEAD
  `115b1342` (`--gel 115b1342`, mêmes tirage et graine) : même verdict, sha256 `cc8dcb1a3a4b685f…`.
- Les sept tests F2P (rouges par assertion à la base : l'import dynamique de `day.mjs` est affirmé) ; tueurs tirés, tous tués :
  `:130` CONST (`l2_day_index_by_event_time`), `:118` ROR (`l2_bookticker_day_rule`), `:137` ROR (`l2_day_late_frame_marked`), `:129`
  ROR (`l2_day_seal_waits_grace_and_segments`), `:67` CONST (`l2_day_missing_from_journal_and_chain`), `:103` CONST
  (`l2_manifest_time_unit_per_source`), `:104` SDL (`l2_place_time_unsafe_integer_named_stop`).
- Ancres : `verifie-ancres.mjs . --touched 721b1d50 HEAD` : 7 tueurs, 7 ANCRE, 0 DERIVE, 0 PERDU.
- Mutants à la main sur `day.mjs` (chacun seul, `l2-day` lancé, fichier restauré) :

| Mutant | Résultat |
|---|---|
| Q-9 sur les différences de toutes les connexions (l.115) | tué : `l2_bookticker_day_rule` |
| borne haute de Q-9 ouverte (`list[mid][1] < f.u` → `<=`, l.117) | tué : `l2_bookticker_day_rule` |
| `@forceOrder` d'un autre symbole gardé (l.99) | tué : `l2_day_seal_waits_grace_and_segments` |
| trou de liaison finissant pile au début du jour gardé (`h.to_us > start` → `>=`, l.73) | survit : borne non testée |

  Le survivant n'est pas équivalent : un trou fermé exactement à minuit ne coupe pas le jour (intervalle semi-ouvert) et le code
  l'écarte, mais aucun test ne le fixe. Proposé au G2 ou à c5 : un cas de `l2_day_missing_from_journal_and_chain` avec `to_us` = début
  du jour.
- `npm test` : `test:main` 2 218 tests, 2 196 réussis, 0 échec, 22 ignorés (sortie 0) ; `test:export` 1 sur 1 (sortie 0). Un
  premier passage de `test:main` a rougi `keep_cause_names_the_test_and_counts` (`test/keep-cause.test.ts`, hors du lot, inchangé
  depuis la base : la fixture a attribué l'exception « entre les tests » au lieu du test « b ») ; vert trois fois seul, puis vert au
  passage complet suivant : instabilité de minutage sous charge, signalée, non attribuable à c1.
- `tsc` 0 ; `lint` 0 erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK (après `115b1342`).
- R-25 du lot (`scripts/oracle/r25.mjs`, base `721b1d50`) : `STAT` 373 (373 insertions, 0 suppression ; `day.mjs` 157, `day.d.mts`
  48, tests 168), borne du lot 547 (borne CI `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0. Estimation du plan : 288 à 376, dans la
  fourchette.

## Notes pour la suite

- c5 : fournir `closed(cid, seg)` depuis les `closed` de ses écrivains, journaliser `tail_marked` (Q-C1-4), sceller dans un fil de
  travail (Q-C1-9).
- c6 : `--from-raw` rappelle `sealDay` ; à la clôture de FAITS-L2-ACCESS-3-E-1, `TIME_UNITS.market` et la lecture de `E` sur `/market`
  changent ensemble, et les jours de liquidations se réindexent depuis le brut.
- MAST FM-1.5 (jour scellé trop tôt) : preuve `l2_day_seal_waits_grace_and_segments`.

## G2 (2026-10-04, REFUSE, trois bloquants) : pli

Rapport : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c1.md`. Le tronc avait bougé (`origin/lot/etude-suite`
en `0b04be9b`, une note de `docs/HANDOFF-2026-10-02-publication.md`) : fusionné d'abord, commit de fusion `489255fe`. Puis
`fc85d60d` (tests rouges et `day.d.mts`), `416e3733` (gel), et ce commit (G0 et G7). Aucun push.

### Bloquants

- **B-1 (journal après un arrêt brutal)** : un événement `start` de c5 (contrat **Q-C1-10**, déclaré au G0) vide l'ensemble des
  connexions ouvertes de chaque liaison et ouvre un trou `process_restart` (`cid` nul), de la dernière trame des connexions mortes (à
  défaut, du dernier événement journalisé de la liaison) à la première de la connexion suivante. Cas au test
  `l2_day_missing_from_journal_and_chain` : `c` ouverte sans fermeture, `start`, puis `d` ouverte et fermée par le chien de garde :
  les deux trous sont au `missing.json`.
- **B-2 (scellé d'un jour chargé)** : une trame tenue au scellé est un triplet d'int32 (numéro de segment, rang, marque + 4 × son jour)
  dans le seau de son flux ; les trames sont classées au fil de la lecture (seules celles du jour sont gardées), les `@bookTicker`
  d'une connexion attendent la fin de ses segments (Q-9). Au-delà de `INDEX_BOUND` = 8 388 608 trames tenues : arrêt nommé
  `index_bound`, rien écrit (plus de `RangeError`). `index.jsonl` est écrit par morceaux de 64 Ki caractères (`writeSync`), chaque
  fichier haché par morceaux de 64 Kio. Test `l2_day_index_bound_named_stop` (borne abaissée par la couture `bound` ; 2 000 trames,
  seuils de morceau franchis à l'écriture et au hachage).
  **Mesures** (jour synthétique écrit hors dépôt sous le `TMPDIR` du pli, effacé ; une connexion, 20 segments, ¼ différences, ¼
  `@bookTicker`, ½ transactions ; Node v24.21.0) :

| Trames | Brut | Code | Durée | RSS de pointe | `index.jsonl` |
|---|---|---|---|---|---|
| 4 000 000 | 591 Mo | gel `61f79238` | 42,6 s | 2 190 Mio | 397 Mio |
| 4 000 000 | 591 Mo | pli | 42,1 s | 246 Mio | 397 Mio |
| 8 388 600 (borne du premier pli) | 1,3 Go | pli | 76,0 s | 388 Mio | 836 Mio |

  À la borne, l'index (836 Mio) dépasse `MAX_STRING_LENGTH` de V8 (536 870 888 caractères) : le gel y tombait sur `RangeError`.
  Hors de la borne : les différences d'une connexion gardées pour Q-9 (24 octets chacune, ≈ 21 Mo pour 25 h à 100 ms) et le
  journal (m-8). 388 Mio valent pour un quart de `@bookTicker` seulement ; pire cas (99,9 % de `@bookTicker`, en attente à 32 octets) :
  529 Mio sous l'ancienne borne, au-dessus du `MemoryMax=512M` de D24-4 (second G2 R-2) ; borne abaissée à 4 194 304, pire cas
  320 Mio : tableau de la section du second G2.
- **B-3 (trame hors fenêtre)** : une trame non marquée dont le segment précède la fenêtre de son jour va à l'index de son jour de
  réception, `mark: "early"`, `of` = son jour, comptée `counts.early` (miroir de `late`). Cas au test `l2_day_index_by_event_time`
  (reçue à J 21:30, `E` = J+1 00:10). Libellé de Q-C1-6 corrigé au G0 et ci-dessus (« précède » → « suit »).

### Mineurs

- **m-1** : les trois changements du rapport appliqués (trou fermé pile à minuit, événement à minuit, trou ouvert pile à la fin) ; les
  trois survivants (`:107` deux fois, `:108` au pli) sont tués.
- **m-2** : trame `/market` sans flux, attendue pour BTCUSDT et ETHUSDT (`l2_day_seal_waits_grace_and_segments`) ; phrase sur le cas
  spot (`!serverShutdown` : règle de `E`, sinon `place_time_unsafe`) au G0, point 5.
- **m-3** : `bad_symbol` (`../x`), `bad_day` (`2026-02-30`, `2026-2-03`) dans le test du scellé.
- **m-4** : segment réel à queue tronquée, journalisé `tail_marked` par les champs de `checkTail`, lu sous sa marque (`frames: 1`) ;
  `anchor-close.json` posé avant le scellé et attendu au `SHA256SUMS` ; tardive dont `E` est à 13:00 UTC.
- **m-5 (item proposé L2-DAY-CHAIN-SPAN-1, renvoyé au G0 de c2 ou de c5)** : une rupture de chaîne ouverte à J 23:59 et refermée à J+1
  n'apparaît pas au `missing.json` de J+1, et le tout premier départ n'ouvre aucun trou de 00:00 au premier `open`. Non corrigé :
  c2 rejoue la chaîne depuis le brut (rien n'est perdu). Question Q-G2-2.
- **m-6 (corrigé)** : [A] « Chien de garde » est explicite (« de la dernière trame reçue à la première de la connexion neuve ») :
  c'était un écart à l'ADR, corrigé. `from_us` = `recv_us` de la dernière ligne d'index de la connexion fermée, `to_us` = celui de la
  première de la connexion ouverte, lus au bord des index (64 Kio au plus par fichier) ; à défaut de trame au disque, l'heure du
  journal (lecture déclarée). Test `l2_day_hole_bounds_from_frames`.
- **m-7 (corrigé)** : `index.jsonl`, `missing.json`, `manifest.json` puis `SHA256SUMS` chacun synchronisé (`fsyncSync`), le dossier
  du jour synchronisé avant et après `SHA256SUMS` ; un nom hors de la liste fermée `DAY_FILES` arrête le scellé (`stray_file`). Les
  segments bruts eux-mêmes ne sont pas synchronisés par a2 : hors de c1, à dire au G0 de c5.
- **m-8 (item proposé L2-DAY-JOURNAL-STREAM-1)** : `journal.jsonl` est encore lu en entier à chaque scellé ; lecture par lignes (le
  `linesOf` de a2, à exporter) renvoyée à c5 ou c6, qui fixeront aussi la coupe du journal.
- **m-9 (renvoyé aux G0 de c2, c3 et c6)** : les dérivés de c2 (minutes, parité) et de c3 (deux empreintes, D-20) doivent entrer au
  manifeste et au dossier avant `SHA256SUMS` : `sealDay` prendra des dérivés (ou une fonction) avant le scellé ; `DAY_FILES` porte
  déjà `minutes.jsonl`, les noms de c3 s'y ajouteront. `config` est écrit dans l'ordre de clés de l'appelant : c5 et c6 le passent
  dans le même ordre (rejeu à l'octet), à écrire au G0 de c6.

### Mutants rejoués au pli (copie de travail, un à la fois, fichier restauré)

Tués : les neuf tueurs ; les survivants du G2 `:107` (`to_us > start`, `from_us < end`), `:108`, flux nul sur `/market` (`:158`), garde
`bad_symbol` (`:175`), aller-retour `dayOf` de `bad_day` (`:177`), marque de queue jamais passée (`:155`), noms fixes au lieu de
`readdirSync` ; au pli : `start` ignoré (`:87`), `open.clear()` retiré (`:92`), repli `seen` (`:91`), bord haut lu au journal (`:102`),
garde `stray_file` (`:184`), remise à zéro du morceau (`text = ""`, `:201`), early retiré (`:132`). Équivalents, déclarés : `Math.floor`
→ `Math.round` dans `dayOf` (`:60`) : `dayOf` n'est appelé que sur des multiples du jour (`of` vient de `dn × DAY_US`, `bad_day` de
minuit), le cas « `E` après midi » de m-4 ne peut pas le tuer ; regex de `bad_day` retirée (l'aller-retour la couvre) ; écriture du
morceau dans la boucle retirée (même sortie, mémoire seule) ; `"wx"` → `"w"` (`day_sealed` garde avant). Le tri des différences
du gel a disparu : non pas équivalent, mais **borné et marqué** (second G2) : `u` croissant par connexion est la règle documentée
de la place, non garantie par b2 (A1, `book.mjs:73`, ignore un `u` en arrière sans le journaliser) ; un `u` en arrière trouve un
intervalle qui le contient (jour juste à minuit près) ou aucun (`recv_day`) : défaut nommé, jamais silencieux, sortie déterministe.

### Preuves du pli

- `node scripts/red-proof.mjs --base 61f79238 --gel 416e3733 --repo /home/user/monark-governance-c1 --draw 7 --seed 37` : sortie 0,
  « red-proof OK: 7 judged, 2 unchanged, 7 killer(s) drawn » ; `RED-PROOF.json` sha256 `db965d40f1081595…`. Les sept tests touchés
  sont F2P (rouges par assertion au gel), les deux intacts (`l2_bookticker_day_rule`, `l2_place_time_unsafe_integer_named_stop`)
  gardent leur tueur, ré-ancré.
- Lot entier, contre le tronc fusionné `0b04be9b` : `--base 0b04be9b --gel 416e3733 --draw 9 --seed 37` : sortie 0, « red-proof OK:
  9 judged, 0 unchanged, 9 killer(s) drawn » ; sha256 `b5deab205b877b07…`. Tueurs : `:180` CONST, `:148` ROR, `:131` ROR, `:179` ROR,
  `:103` CONST, `:104` CONST, `:162` CONST, `:163` SDL, `:129` ROR.
- Ancres : `verifie-ancres.mjs . --touched 0b04be9b HEAD` et `--touched 61f79238 HEAD` : 9 tueurs, 9 ANCRE, 0 DERIVE, 0 PERDU.
- R-25 (`scripts/oracle/r25.mjs`, base `0b04be9b`) : `STAT` 477 (477 insertions, 0 suppression ; `day.mjs` 214, `day.d.mts` 52, tests
  211), borne du lot 547 ; `CONTENT_STAT` 0 ; GREEN.
- `npm test` : `test:main` 2 199 tests, 2 178 réussis, 0 échec, 21 ignorés (sortie 0 ; le G7 du gel relevait 2 218 : écart de
  19 non analysé ici, hors du lot, qui ne touche que `test/l2-day.test.ts`, 9 tests, tous verts) ; `test:export` 1 sur 1 (sortie 0).
  `tsc` 0 ; `lint` 0 erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.

### Questions pour MONARK (pli du G2)

- **Q-G2-1** (prémisse corrigée au second G2) : au pire cas (99,9 % de `@bookTicker`), 8 388 608 trames montaient à 529 Mio de pointe,
  au-dessus de `MemoryMax=512M` ; `INDEX_BOUND` est abaissé à 4 194 304 (pire cas 320 Mio, composition du G7 238 Mio). Le garder
  jusqu'à M-1, ou faire sceller c5 dans une unité à part (et relever la borne) ? Un jour qui dépasse s'arrête nommé (`index_bound`) et
  se rejoue par c6 après relèvement.
- **Q-G2-2** : m-5 (ruptures de chaîne à cheval sur minuit, premier départ) à c2 ou à c5 ?
- **Q-G2-3** : Q-C1-10 (événement `start`) accepté comme contrat de c5 ?
- **Q-G2-4** : à défaut de trame au disque, les bornes d'un trou tombent sur l'heure du journal (m-6) : d'accord ?

## Second G2 (2026-10-04, APPROUVE SOUS RÉSERVE, R-1 et R-2) : pli du 2026-10-05

Rapport : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c1-bis.md`. Pas de nouvelle G2 demandée : `red-proof`,
ancres et R-25 rejoués. Commits : `b384022c` (tests rouges), `ea4971f2` (gel) ; le tronc avait bougé (`origin/lot/etude-suite` en
`53c7f15d` : rpc-guard, sentinelle, `ETAT`, `HANDOFF`), fusionné après le gel, commit de fusion `e4592386` ; puis ce commit (G0 et
G7). `packages/rpc-guard/bin/rpc-guard.mjs` non touché. Poussé sur `origin/recherches/l2-p1-c1` (autorisé), aucune PR.

### Réserves

- **R-1 (trame hors de tout index après un recul d'horloge de plus d'une heure)** : correctif du rapport, en nombres (`day.mjs:133`
  à `:136`). L'heure de début de chaque segment est calculée une fois ; une trame dont le segment commence après la fin de son jour
  plus la grâce est tardive ; tardives et précoces vont au jour de leur **segment**, seul scellé qui lit ce segment. Sans recul
  d'horloge, jour du segment et jour de réception coïncident : `index.jsonl` et `missing.json` identiques à l'octet à ceux de
  `0b90c2ba` sur deux jours de 20 000 trames (99,9 % `@bookTicker` ; composition du G7). Cas au test `l2_day_late_frame_marked` : la
  sonde P-A (deux `push` de l'`openWriter` du test, horloge reculée de 2 h, trame de J au segment `20261005T01`) est rangée à J+1,
  `late`, `of` J, comptée. G0 points 4 et 9 et Q-C1-6 corrigés (« jour de son segment »).
- **R-2 (mémoire au pire cas)** : `INDEX_BOUND` abaissé à 4 194 304 plutôt que compter un `@bookTicker` en attente à son poids. Raison :
  le poids seul laisse la composition du G7 à 388 Mio à 8 388 608 ; la borne abaissée tient les deux compositions sous 330 Mio. Les
  `@bookTicker` en attente comptent déjà à la borne (`hold(tickers.n / 4 + 1)`) ; test par la couture `bound` : deux `@bookTicker`
  du lendemain en attente arrêtent un scellé de borne 1 (le mutant `hold(1)` survivait). Constante fixée au test.
  **Mesures** (jours synthétiques écrits directement au format de a2 sous le `TMPDIR` du pli, effacés ; une connexion, 20 segments ;
  scellé en processus seul ; RSS de pointe par `process.resourceUsage().maxRSS` ; Node v24.21.0) :

| Trames | Composition | Brut (trames et index) | Borne | Durée | RSS de pointe | `index.jsonl` |
|---|---|---|---|---|---|---|
| 4 194 190 | 99,9 % `@bookTicker` | 992 Mio | 4 194 304 (défaut) | 39,6 s | 320 Mio (328 au second passage) | 426 Mio |
| 4 194 300 | ¼ différences, ¼ `@bookTicker`, ½ transactions | 1,1 Gio | 4 194 304 (défaut) | 38,5 s | 238 Mio | 417 Mio |
| 8 388 000 | 99,9 % `@bookTicker` | 2,0 Gio | 8 388 608 (couture) | 74,3 s | 529 Mio | non relevé |
| 8 388 000 | 99,9 % `@bookTicker` | 2,0 Gio | 4 194 304 (défaut) | 35,2 s | 219 Mio, arrêt `index_bound`, rien écrit | — |

  La troisième ligne reproduit le constat du rapport (534 Mio) : au-dessus de `MemoryMax=512M`. Pire cas retenu : 320 à 328 Mio, marge
  de 184 Mio sous le plafond de l'unité.

### Mineurs

- **m-1 (corrigé)** : deux connexions mortes au `start` (chevauchement D-8), l'une sur deux segments (`l2_day_late_frame_marked`) :
  `Math.max` → `Math.min` et `names.reverse()` retiré tués ; borne basse lue en queue d'un index d'environ 150 Kio
  (`l2_day_index_bound_named_stop`) : lecture au début du fichier tuée.
- **m-2 (corrigé)** : une connexion `/market` de seuls `ethusdt@forceOrder`, absente du `SHA256SUMS` de BTCUSDT : `[...used]` →
  `[...segs.keys()]` tué.
- **m-3 (corrigé)** : `/market` et un `@bookTicker` `recv_day` reçus à 13:00 UTC, index exact au test du scellé : les deux
  `Math.round` du jour de réception tués (depuis R-1, ils rangeaient la trame `early` au même jour : seul l'index exact les voit).
- **m-4 (corrigé)** : `SHA256SUMS` écrit entier dans `../.<jour>.SHA256SUMS.tmp` (hors du dossier, donc hors de `DAY_FILES`),
  synchronisé, lié (`linkSync`, `EEXIST` comme `wx`), temporaire retiré, dossier synchronisé : une coupure ne laisse jamais un jour
  scellé à `SHA256SUMS` vide. Un temporaire laissé par une coupure avant le lien est réécrit au scellé suivant (test). Une coupure
  entre le lien et le retrait laisse un temporaire inerte à côté d'un jour scellé.
- **m-5 (item L2-DAY-MISSING-REPLAY-1, renvoyé au G0 de c6)** : `missing.json` dépend de l'heure du scellé (journal lu jusqu'au bout,
  `edgeOf` sur un `open` dont la première trame n'est pas encore au disque) ; correctif proposé : ne lire que les lignes de journal et
  les bords d'heure ≤ `segmentOf(fin + grâce)` + 1 h. Même G0 : un rejeu d'une période où l'enregistreur est mort sans `start`
  ultérieur n'a pas de trou ; à dire.
- **m-6 (rattaché à L2-DAY-JOURNAL-STREAM-1, c5 et c6)** : `edgeOf` lit un dossier et deux index par `open` et `close` de tout
  l'historique ; ne calculer les bords que des trous qui coupent le jour.

### Mutants rejoués au second pli (copie de travail, un à la fois, fichier restauré, empreinte vérifiée)

Tués : segment postérieur retiré de `late` ; jour de réception au lieu du jour du segment ; `recv > end` → `>=` ; précoce retirée,
`<` → `<=` ; `Math.max` → `Math.min` ; `names.reverse()` retiré ; queue lue au début ; `[...used]` → `[...segs.keys()]` ; les deux
`Math.round` du jour de réception ; écriture directe de `SHA256SUMS` en `wx` (ancien code) ; retrait du temporaire supprimé ;
`hold(tickers.n / 4 + 1)` → `hold(1)` ; `INDEX_BOUND` remis à 8 388 608. Équivalent, déclaré : `hours[s] > end` → `>=` (un début de
segment est un multiple de l'heure, `end` porte les 120 s de grâce : jamais égaux).

### Preuves du second pli

- Pli : `node scripts/red-proof.mjs --base 0b90c2ba --gel ea4971f2 --repo /home/user/monark-governance-c1 --draw 3 --seed 37` :
  « red-proof OK: 3 judged, 6 unchanged, 3 killer(s) drawn » ; `RED-PROOF.json` sha256 `b3a67c5e278a52a2…`. F2P :
  `l2_day_late_frame_marked`, `l2_day_seal_waits_grace_and_segments`, `l2_day_index_bound_named_stop` ; tueurs `:135`, `:182`, `:131`
  tués.
- Lot entier, contre le tronc `53c7f15d` : `--base 53c7f15d --gel e4592386 --draw 9 --seed 37` : « red-proof OK: 9 judged, 0
  unchanged, 9 killer(s) drawn » ; sha256 `3d40f08bf4eb06ca…`. Tueurs ré-ancrés : `:183` CONST, `:151` ROR, `:135` ROR (`recv > end`),
  `:182` ROR, `:105` CONST, `:106` CONST, `:165` CONST, `:166` SDL, `:131` ROR.
- Ancres : `verifie-ancres.mjs . --touched 53c7f15d HEAD` : 9 tueurs, 9 ANCRE, 0 DERIVE, 0 PERDU.
- R-25 (`scripts/oracle/r25.mjs`, base `53c7f15d`) : `STAT` 504 (504 insertions, 0 suppression ; `day.mjs` 220, `day.d.mts` 52, tests
  232), borne du lot 547, marge 43 ; `CONTENT_STAT` 0 ; GREEN.
- `npm test` : `test:main` 2 238 tests, 2 216 réussis, 0 échec, 22 ignorés (sortie 0 ; nombre sujet à TEST-FORCE-EXIT-REPORT-LOSS-1,
  9 tests `l2-day` verts) ; `test:export` 1 sur 1. `tsc` 0 ; `lint` 0 erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ;
  `lang:gate` OK.

### Questions pour MONARK (second G2)

- **Q-G2B-1** : R-2 par la borne abaissée (4 194 304) plutôt que par le poids des `@bookTicker` en attente : d'accord ? Le poids seul
  garderait 8 388 608 trames ordinaires, mais 388 Mio de pointe pour la composition du G7.
- **Q-G2B-2** : m-5 (`missing.json` dépendant de l'heure du scellé, L2-DAY-MISSING-REPLAY-1) au G0 de c6, avec TL-4
  `l2_replay_byte_identical` ?
- **Q-G2B-3** : un temporaire `../.<jour>.SHA256SUMS.tmp` laissé par une coupure entre le lien et le retrait reste inerte à côté du jour
  scellé ; c5 le retire-t-il à son `start`, ou le laisse-t-on ?

## Rouge à l'oracle Windows et condition de Q-G2-4 : pli du 2026-10-05

Messages : `2026-10-05-MONARK-vers-RECHERCHES-143-rouge-windows.md` (oracle Windows de la fusion `b1c319c7` : les 9 tests de
`l2-day` rouges sur `EPERM: operation not permitted, fsync`, fusion retirée) et `…-143-reponses.md` (Q-G2-4 acceptée « si
`missing.json` nomme la source de la borne »). Base du pli `b1964ed9`. Commits : `9a00bcfd` (tests rouges), `e080325c` (gel),
`19c4291e` (compactage pour R-25, sans changement de comportement) ; le tronc avait bougé (`origin/lot/etude-suite` en `d305ae15`,
#142), fusionné après, commit de fusion `31d1d725` ; puis ce commit (G7). `packages/rpc-guard/bin/rpc-guard.mjs` non touché.

### Correctif Windows (fsync du dossier du jour)

- **Cause** : `day.mjs:196` ouvrait le dossier du jour en `"r"` pour son fsync ; sous win32, un dossier ouvert en `"r"` refuse le
  fsync (`EPERM`). La CI Linux ne le voyait pas.
- **Correctif, en place (même ligne `:196`, aucune ancre déplacée)** : `openSync(dir, process.platform === "win32" ? "r+" : "r")`.
  Voie mesurée au dépôt : `packages/rpc-guard/src/ledger.ts:76` (« measured feasible on win32 with flag "r+" only ») et
  ADR-GARDE-HELIUS item I-1 (win32 `"r"` ⇒ EPERM, `"r+"` ⇒ OK, p50 0,105 ms, N=500). Le chemin de l'hôte de course (Linux) est
  inchangé : `"r"`. Pas de saut nommé : le fsync est fait sur les deux systèmes. Effet de durabilité sous NTFS non vérifié (comme I-1).
- **Test `l2_day_folder_fsync_per_platform`** : `fs.openSync` et `fs.fsyncSync` enveloppés (`module.syncBuiltinESMExports`, comme
  `test/record-binance-klines.test.ts`) ; il relève, pour chaque ouverture du dossier du jour suivie d'un fsync, son drapeau.
  Sur l'hôte : deux fsync du dossier, `"r"` sous Linux (`"r+"` sous win32). Sur un hôte POSIX, une seconde passe déclare
  `process.platform` à `win32` (rétabli en `finally`) : deux fsync, drapeau `"r+"` (l'enveloppe ouvre alors le dossier en `"r"`,
  seul possible sous POSIX). Tueur : `:211` SDL `sync();` (un mutant qui retire le fsync meurt sous Linux). Mutants rejoués à la
  main, tués : `:218` `sync();` retiré ; `:196` drapeau ramené à `"r"` pour tous (passe win32 simulée). Juge du point : l'oracle
  Windows de MONARK.

### Source de chaque borne d'un trou (Q-G2-4, condition de MONARK)

- `missing.json` : chaque trou porte `from_src` et `to_src`, `"frame"` (le `recv_us` d'une trame au disque, ADR « watchdog ») ou
  `"journal"` (le `host_us` de la ligne du journal, faute de trame de la connexion au disque) ; `to_src` nul tant que `to_us` l'est.
  Ordre des clés : `link, cid, cause, from_us, from_src, to_us, to_src`.
- Code, lignes changées en place : `:87` (`gap` prend `from_src`, le trou naît `to_src: null`), `:93` (`process_restart`), `:104`
  (`open` : `to_us`, `to_src`), `:106` (`close` : `from_us`, `from_src`). `day.d.mts` : type `DayHole`. En-tête `:15` : une mention.
- Test `l2_day_hole_bound_source_named` : les quatre combinaisons (`close` trame → `open` journal, `close` journal → `open` trame,
  redémarrage trame → journal, redémarrage journal → trame). Tueur fermé : `:106` CONST `us === null ? "journal" : "frame"` →
  `"frame"`. Mutants rejoués à la main, tués aussi : même mutant à `:104` et à `:93`. Les quatre tests qui lisent des trous
  (`l2_day_late_frame_marked`, `l2_day_missing_from_journal_and_chain`, `l2_day_hole_bounds_from_frames`,
  `l2_day_index_bound_named_stop`) attendent les deux champs.
- Tueur ré-ancré : `l2_day_hole_bounds_from_frames`, `:106` CONST `"us ?? l.host_us"` → `"l.host_us"` (même ligne, même mutation :
  la borne basse lue au journal au lieu de la trame).
- **Le mini-lot proposé L2-DAY-BOUND-SOURCE-1 est abandonné** : plié ici
  (`2026-10-05-RECHERCHES-vers-MONARK-143-Q-G2-4.md`).

### Preuves du pli

- Pli : `node scripts/red-proof.mjs --base b1964ed9 --gel 19c4291e --repo /home/user/monark-governance-c1 --draw 6 --seed 37` :
  « red-proof OK: 6 judged, 5 unchanged, 6 killer(s) drawn » ; `RED-PROOF.json` sha256 `80f09d0042a3c151…`. F2P :
  `l2_day_late_frame_marked`, `l2_day_missing_from_journal_and_chain`, `l2_day_hole_bounds_from_frames`,
  `l2_day_index_bound_named_stop`, `l2_day_hole_bound_source_named`, `l2_day_folder_fsync_per_platform` ; six tueurs tués.
- Lot entier, contre le tronc `d305ae15` : `--base d305ae15 --gel 31d1d725 --draw 11 --seed 37` : « red-proof OK: 11 judged, 0
  unchanged, 11 killer(s) drawn » ; sha256 `0c6ae9fe0acf5141…`.
- Ancres : `verifie-ancres.mjs . --touched d305ae15 HEAD` : 11 tueurs, 11 ANCRE, 0 DERIVE, 0 PERDU.
- R-25 (`scripts/oracle/r25.mjs`, base `d305ae15`) : `STAT` 547 (547 insertions, 0 suppression ; `day.mjs` 220, `day.d.mts` 56,
  tests 271), borne du lot 547, marge 0 ; `CONTENT_STAT` 0 ; GREEN.
- `node --test test/l2-day.test.ts` : 11 sur 11, huit passages. `test:main` 2 261 tests, 2 239 réussis, 0 échec, 22 ignorés
  (sortie 0) ; `test:export` 1 sur 1. `tsc` 0 ; `lint` 0 erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
