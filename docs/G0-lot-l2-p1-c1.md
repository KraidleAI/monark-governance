# G0 du lot P1-c1 du chantier L2 : jour et scellé

- **Rattachement** : ADR-L2-CAPTURE-1 (D-3 lu sous D-17, D-7, D-9, D-11, D-17, D-20 amendée, D-27 : 547 lignes par lot au gel ; §2.3
  points 8 et 10, « Jour et scellé » ; TL-4, part `l2_bookticker_day_rule` ; Q-5 close, conditions (1) et (2) ; Q-9 et Q-10 closes) ;
  plan `docs/G0-partie-l2-p1.md` §2 (D24-3, D24-5), §3 points 3, 18 et 19, §7, §8.2 (ligne P1-c1), §8.3 (c1 sur a2 et b2 ; prérequis du
  G1 : Q-P1-8) ; faits `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md` (c), (d), FAITS-L2-FUTURES-2 (c) ; `docs/marche/FAITS-L2-ACCESS-3-2026-10-04.md`
  (e) ; `docs/marche/FAITS-L2-ACCESS-1-2026-10-03.md` l.49-51.
- **Base** : `721b1d50` (`lot/etude-suite`, a1 à a4, b1, b2 et P1-B1-BIS fusionnés ; a4 en `9fc9115e`). Branche `recherches/l2-p1-c1`.
  Auteur : RECHERCHES (colonne de MONARK, `2026-10-04-MONARK-vers-RECHERCHES-138-139-fusionnees.md` : « puis c1 de L2 P1 »). Aucun
  réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système, horloges injectées ; données synthétiques.

## Prérequis et faits

- **Q-P1-8, tranchée** (bloc daté du 2026-10-03 21:33 UTC du plan) : index, dérivés et parité d'un jour sont calculés au scellé par le
  code du rejeu, depuis le brut seul ; la chaîne en ligne ne sert qu'à détecter les ruptures et à décider des reprises. Ici : le scellé
  est une fonction du dossier `--out` (segments, journal) et de l'heure, sans état en mémoire ; c6 la rappelle pour `--from-raw`.
- **FAITS-L2-ACCESS-2 (d)** : `@bookTicker` ne porte aucune heure ; `depthUpdate` et `@trade` portent `E`. La règle de Q-9 s'applique.
- **FAITS-L2-ACCESS-3 (e), non établi ; FAITS-L2-ACCESS-3-E-1 reste ouvert** (G7 de a4 ; message de MONARK sur #139 : « reste ouvert
  pour c1 »). Repli de a4 (`time_unit: null` au journal) repris au manifeste : `time_unit` par source = `{ "spot": "us", "market": null }`.
  L'heure `E` de `@forceOrder` n'est ni lue ni convertie (jamais d'après sa grandeur) : le jour d'une liquidation est son jour de
  réception, marqué (lecture déclarée Q-C1-1). Tout dérivé se reconstruit depuis le brut (D-11) : quand E-1 établira l'unité, un
  rejeu `--from-raw` réindexe ces trames par leur heure, rien n'est perdu.

## Contenu (fichiers de §8.2 : `scripts/l2/day.mjs`, `scripts/l2/day.d.mts`, `test/l2-day.test.ts`)

Couture : `sealDay({ out, symbol, day, nowUs, closed, config })`, appelée par c5 (horaires) et c6 (rejeu) ; `closed(cid, seg)` dit
qu'un segment est clos (c5 le tient des `closed` de ses écrivains, a2) ; `config` est écrit tel quel au manifeste.

1. **Jour d'une trame** (§2.3 point 10) : jour UTC de son heure de place `E` (enveloppe combinée : `data.E`), lue en microsecondes
   sur les connexions spot (`timeUnit=MICROSECOND`, a3) parce que l'URL le pose, jamais d'après la grandeur ; `@bookTicker` : règle de
   Q-9 ; `/market` : jour de réception, marqué (Q-C1-1).
2. **Condition (2) de RECHERCHES** : sur une connexion spot, toute trame autre qu'un `@bookTicker` doit porter un `E` entier sûr
   (`Number.isSafeInteger`) ; sinon (flottant, au-delà de 2^53 − 1, chaîne, absent, trame illisible) le dérivé du symbole s'arrête,
   arrêt nommé `place_time_unsafe` (`symbol`, `cid`, `seg`, `rank`), rien n'est écrit pour ce jour ; le brut n'est ni lu en écriture ni
   touché, les autres symboles se scellent. Aucune heure n'est gardée en flottant.
3. **Règle de `@bookTicker`** (Q-9 close, TL-4) : jour de l'événement de différences de la MÊME connexion dont `[U;u]` contient son
   `u` (bornes fermées) ; sinon (rupture ouverte, avant la première différence, `u` illisible), jour de réception, marqué `recv_day`.
4. **Trames tardives** (D24-5, `GRACE_US` = 120 s ; O-1 du cp-1) : tardive ssi sa réception suit la fin de son jour de plus que la
   grâce (strictement : reçue à fin + grâce, elle est dans son jour ; une microseconde après, tardive) ; est aussi tardive une trame
   dont le segment suit la fenêtre de son jour (horloge de l'hôte reculée sur une connexion vivante, second G2 R-1) ; elle va à
   l'index du jour de son segment (le jour de sa réception, sauf recul d'horloge), seul scellé qui lit ce segment, marquée `late` avec
   son jour (`of`), et comptée.
5. **Index du jour** (`days/<SYMBOLE>/<AAAA-MM-JJ>/index.jsonl`, §7) : une ligne par trame, `stream`, `cid`, `seg`, `rank`, puis la
   marque s'il y en a une ; lignes ordonnées par flux, puis dans l'ordre de lecture (`cid`, `seg`, `rank`). Segments lus : ceux des
   connexions `spot-<SYMBOLE>-…` et `market-ALL-…` dont l'heure est dans [début du jour − 1 h ; fin + grâce] (Q-C1-6), par le lecteur
   partagé de a2, une queue lue sous sa marque (Q-C1-4). Sur `/market`, les `@forceOrder` d'un autre symbole sont écartés ; une trame
   sans flux de symbole (`serverShutdown`) va aux quatre jours. Sur le spot, une trame sans flux (`!serverShutdown`) suit la règle de
  `E` lu en µs (FAITS-L2-ACCESS-2 (c) pose l'unité pour les heures de la connexion) : sans `E` entier sûr, arrêt `place_time_unsafe`
  du symbole pour J et J+1 (pli du G2, m-2).
6. **`missing.json`** (Q-C1-2) : depuis `journal.jsonl`, pour la liaison du symbole et celle de `/market` (`ALL`) : (a) les trous de
   liaison, d'une fermeture qui laisse la liaison sans connexion ouverte à l'ouverture suivante (`to_us` nul si aucune), gardés s'ils
   coupent le jour ; (b) les événements nommés de la liste fermée `MISSING_EVENTS` (`writer_stop`, `overlap_break`, de a3 et a4 ;
   `chain_gap`, `sync_try_vain`, `sync_suspended`, `chain_stopped`, `buffer_trimmed`, de b2 ; `tail_marked`, Q-C1-4) dont `host_us`
   est dans le jour, recopiés tels quels. Pli du G2 : (c) un événement `start` (`symbol` `ALL`, `cid` nul), journalisé par c5 à chaque
   lancement (contrat Q-C1-10), vide l'ensemble des connexions ouvertes de chaque liaison et ouvre un trou `process_restart` (`cid`
   nul) fermé par l'`open` suivant (B-1) ; (d) bornes d'un trou ([A] « Chien de garde ») : de la dernière trame reçue de la connexion
   fermée (ou, sur `start`, des connexions mortes) à la première de la connexion neuve, lues au bord des index de segments ; à défaut
   de trame au disque, l'heure du journal (fermeture, dernier événement de la liaison, ouverture) (m-6).
7. **Scellé** (D-17, §7) : rien avant `nowUs` > fin + grâce (`wait: "grace"`) ; rien tant qu'un segment lu n'est pas clos
   (`wait: "segments"`, la liste) ; puis `index.jsonl`, `missing.json`, `manifest.json`, et en dernier `SHA256SUMS` (écrit entier à
   côté du dossier, `../.<jour>.SHA256SUMS.tmp`, synchronisé, puis lié, `EEXIST` comme `wx`, et le temporaire retiré, second G2 m-4) :
   chaque fichier du dossier du jour, et chaque `.frames` et `.index.jsonl` d'un segment utilisé par chemin relatif
   (`../../../conn/<cid>/<seg>.…`), format de `sha256sum -c` (empreinte, deux espaces, chemin), lignes triées. Un jour dont
   `SHA256SUMS` existe n'est jamais réécrit : arrêt nommé `day_sealed`. Pli du G2 : une trame tenue au scellé = trois int32 dans le
   seau de son flux, au plus `INDEX_BOUND` = 4 194 304 (index du jour plus `@bookTicker` en attente d'une connexion ; second G2 R-2 :
   abaissé de 8 388 608 pour qu'un jour à 99,9 % de `@bookTicker` tienne sous `MemoryMax=512M`), au-delà arrêt nommé `index_bound`,
   rien écrit (B-2) ; `index.jsonl` écrit par morceaux, jamais en une chaîne ; empreintes lues par morceaux ;
   chaque fichier et le dossier synchronisés (`fsync`) avant et après `SHA256SUMS` ; un nom du dossier hors de la liste fermée
   `DAY_FILES` (`index.jsonl`, `missing.json`, `manifest.json`, `anchor-open.json`, `anchor-close.json`, `minutes.jsonl`) arrête le
   scellé, `stray_file` (m-7).
8. **Manifeste** (§3 point 19) : `schema` `monark.l2.binance.v1`, `symbol`, `day`, `redistributable: false`, `time_unit` par source,
   `grace_us`, `period_us`, échantillonnage de `@forceOrder` (au plus la plus grosse par symbole et par 1 000 ms, FAITS-L2-ACCESS-1
   l.49-51), clés canoniques (§9 et Q-P1-9 : `(U,u)`, `u`, `t`, octets pour `@forceOrder` ; suite par octets exacts ordonnés par (clé,
   octets)), `node`, `undici`, `script_sha256` (Q-C1-8), `config`, comptes (trames par flux, tardives, précoces au pli du G2, `recv_day`).
9. **Trames précoces** (pli du G2, B-3) : une trame non marquée dont le segment précède la fenêtre de son jour (`seg` <
   `segmentOf(début de son jour − 1 h)` : son `E` suit sa réception de plus d'une heure) va à l'index du jour de son segment,
   `mark: "early"`, `of` = son jour, comptée `counts.early` (miroir de `late`). Avec le point 4, une trame est rangée au jour qu'elle
   a (segment dans la fenêtre) ou au jour de son segment (hors fenêtre, avant ou après), dont le scellé seul lit ce segment : jamais
   hors de tout index, recul d'horloge compris (second G2 R-1).

## Tests (`test/l2-day.test.ts`), tueurs (un par test, convention de `scripts/red-proof.mjs`)

Le fichier appelle `keepCause` au chargement et fait son dossier temporaire dans `before()` ; chaque test charge `day.mjs` par un
import dynamique qu'il affirme (précédent b2) : la base, sans le module, rougit par assertion. Segments écrits par `openWriter` de a2.
- `l2_day_index_by_event_time` : différences et transactions rangées par `E`, reçues avant minuit (segment de la veille) ou après
  (segment du lendemain) ; index exact ; pli du G2 : une transaction reçue à J 21:30 dont `E` est J+1 00:10, rangée à J, `early`,
  `of` J+1, comptée (B-3). Tueur : borne basse de la fenêtre des segments (`start - PERIOD_US` → `start`).
- `l2_bookticker_day_rule` (TL-4) : `u` aux bornes `U` et `u` d'un intervalle de la veille reçus après minuit : la veille ; `u` dans un
  intervalle du jour suivant : ce jour ; `u` hors de tout intervalle (rupture) et `u` sur une connexion sans différences : jour de
  réception, `recv_day`. Tueur : borne basse fermée de Q-9 (`<=` → `<`).
- `l2_day_late_frame_marked` : reçue à fin + grâce : dans son jour, sans marque ; une microseconde après : à l'index du jour de
  réception, `late`, `of` = son jour (son `E` après midi, pli du G2 m-4), comptée. Second G2 : horloge reculée de 2 h sur une connexion
  vivante, trame de J au segment J+1 01, rangée à J+1, `late`, `of` J (R-1) ; deux connexions mortes au `start`, l'une sur deux
  segments : trou depuis la dernière trame des deux (m-1). Tueur : borne de la grâce (`recv > end` → `>=`).
- `l2_day_seal_waits_grace_and_segments` (FM-1.5) : à fin + grâce, `wait: "grace"` ; une microseconde après, un segment ouvert :
  `wait: "segments"` ; clos : scellé, chaque ligne de `SHA256SUMS` vérifiée par recalcul, segments listés par chemin relatif, un segment
  de `/market` listé par deux symboles ; second appel : `day_sealed`, rien réécrit. Pli du G2 : trame `/market` sans flux aux deux
  symboles (m-2) ; `bad_symbol` (`../x`), `bad_day` (`2026-02-30`, `2026-2-03`) (m-3) ; `stray.tmp` refusé, puis `anchor-close.json`
  scellé au `SHA256SUMS` (m-7, m-4). Second G2 : `/market` et un `@bookTicker` `recv_day` reçus après midi, index exact (m-3) ;
  une connexion `/market` de seuls `ethusdt@forceOrder`, absente du `SHA256SUMS` de BTCUSDT (m-2) ; temporaire laissé par une coupure,
  réécrit puis retiré (m-4). Tueur : borne du scellé (`>` → `>=`).
- `l2_day_missing_from_journal_and_chain` : trou de liaison (fermeture par chien de garde, reprise), trou de `/market`, rupture et
  essai vain de la chaîne, queue marquée ; exclus : pings, autre symbole, hors du jour. Tueur : test de la liaison vide. Pli du G2 :
  `start` après une connexion jamais fermée, puis un trou de chien de garde de la même liaison (B-1) ; bornes de m-1 (trou fermé pile
  à minuit, événement à minuit, trou ouvert pile à la fin) ; segment réel à queue tronquée lu sous sa marque (m-4).
- `l2_day_hole_bounds_from_frames` (pli du G2, m-6) : trou de la dernière trame de la connexion fermée à la première de la neuve ;
  trou `process_restart` depuis la dernière trame de la connexion morte. Tueur : borne basse lue au journal (`edgeOf` retiré).
- `l2_day_index_bound_named_stop` (pli du G2, B-2) : 2 000 trames (seuils de morceau franchis à l'écriture et au hachage) ; borne
  `n − 1` : `index_bound`, aucun dossier ; borne `n` : index exact, `SHA256SUMS` vérifié. Second G2 : `INDEX_BOUND` = 4 194 304,
  `@bookTicker` en attente (du lendemain) comptés à la borne (R-2) ; trou dont la borne basse est lue en queue d'un index de plus de
  64 Kio (m-1). Tueur : `>` → `>=` de la borne.
- `l2_manifest_time_unit_per_source` (condition (1)) : manifeste exact ; heures de fixture d'une grandeur de millisecondes lues en µs
  (jour de 1970, donc tardives et marquées), jamais converties ; `@forceOrder` au jour de réception. Tueur : unité tirée d'une grandeur.
- `l2_place_time_unsafe_integer_named_stop` (condition (2)) : `E` flottant, au-delà de 2^53 − 1, en chaîne : `place_time_unsafe` nommé,
  aucun dossier du jour, segments intacts à l'octet, l'autre symbole se scelle. Tueur : garde `Number.isSafeInteger` retirée.

## Preuve rouge, contrôles

- Commit du G0 ; commit des tests seuls (rouges, avec `day.d.mts` pour `tsc`) ; gel ; `node scripts/red-proof.mjs --base 721b1d50
  --gel <gel> --repo <worktree> --draw 7 --seed 37` : chaque test F2P, chaque tueur tiré tué ; ancres par `verifie-ancres.mjs --touched`.
- `npm test` (`test:main`, `test:export`), `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; R-25 du lot ≤ 547 (plan : 288 à
  376, 436 avec les tests de C-5).

## Lectures déclarées (non bloquantes, à confirmer au contrôle de MONARK)

- **Q-C1-1** : jour d'une liquidation = jour de réception, marqué `recv_day`, tant que FAITS-L2-ACCESS-3-E-1 est ouvert ; `time_unit`
  de `/market` nul au manifeste. Écarté : lire `E` en ms (déduction) ; arrêter le dérivé de `/market` (aucun jour de liquidations en M-1).
- **Q-C1-2** : `missing.json` lit le journal (entrée enregistrée, non dérivée) ; les ruptures de la chaîne sont celles que b2 journalise
  en ligne (Q-P1-8) ; index et jour viennent du brut seul.
- **Q-C1-3** : Q-9 cherche l'intervalle dans les différences de la même connexion (deux connexions qui se chevauchent portent chacune
  les leurs ; égalité des bornes entre hôtes : M-5).
- **Q-C1-4** : contrat pour c5 : une queue trouvée à la reprise (`checkTail` de a2) est journalisée `tail_marked`, champs de `Tail` ;
  c1 la donne au lecteur comme marque et la porte au `missing.json`.
- **Q-C1-5** : `closed(cid, seg)` est fourni par c5 ; le disque seul ne dit pas qu'un fichier est encore ouvert.
- **Q-C1-6** : fenêtre de lecture [début − 1 h ; fin + grâce] par heure de segment ; une trame dont l'heure de place **suit** sa
  réception de plus d'une heure (horloge de l'hôte en retard de plus d'1 h) n'est pas lue au scellé de son jour : elle est rangée au
  jour de son segment, marquée `early` (point 9, pli du G2 B-3) ; une trame dont le segment suit la fenêtre (horloge reculée) est
  rangée de même, `late` (point 4, second G2 R-1) ; la fenêtre reste à mesurer en M-6 (item L2-DAY-SCAN-WINDOW-1).
- **Q-C1-7** : amorce et ancres hors de c1 (c2 rejoue, c5 écrit les ancres) ; `SHA256SUMS` liste tout fichier présent au dossier du
  jour au scellé, ancres comprises.
- **Q-C1-8** : `script_sha256` = empreintes des cinq modules `scripts/l2/*.mjs` jusqu'à la commande de c4, qui s'y ajoutera.
- **Q-C1-9** : l'index d'un jour est tenu en mémoire au scellé, compact (point 7) ; taille réelle mesurée en M-1 (c5 scelle dans un
  fil de travail, Q-5 de a2). Plafond déclaré au pli du G2 : `INDEX_BOUND` (4 194 304 au second G2), arrêt `index_bound` (mesures au
  G7, pire cas à 99,9 % de `@bookTicker`).
- **Q-C1-10** (pli du G2, B-1) : contrat pour c5 : à chaque lancement, avant toute ouverture, une ligne
  `{"event":"start","symbol":"ALL","cid":null}` (plus `host_us`, `mono_ns`) au `journal.jsonl` ; c1 y lit l'arrêt du processus.
