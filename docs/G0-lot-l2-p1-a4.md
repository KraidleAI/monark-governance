# G0 du lot P1-a4 du chantier L2 : continuité et `/market`

- **Rattachement** : ADR-L2-CAPTURE-1 (D-5, D-8, D-21, D-27 : 547 lignes par lot au gel ; TL-6, part brute ; TL-7a, liaison `/market`) ;
  plan `docs/G0-partie-l2-p1.md` §3 points 3 à 7, §8.2 (ligne P1-a4), §8.3 (a4 sur a3 ; prérequis du G1 : FAITS-L2-ACCESS-3 (b), (c),
  (e)) ; faits `docs/marche/FAITS-L2-ACCESS-3-2026-10-04.md` (b), (c), (e) ; `docs/marche/FAITS-L2-ACCESS-1-2026-10-03.md` l.16-17,
  l.45-51 ; `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md` l.62-67.
- **Auteur** : RECHERCHES, en partage de charge (message de MONARK `2026-10-04-MONARK-vers-RECHERCHES-bascule-de-charge.md` §3, point
  2 ; « a4 est à toi », `2026-10-04-MONARK-vers-RECHERCHES-reponses-G2-L2-Q1-CM-4a.md` l.37). Base : `0effb5b2` (`lot/etude-suite`,
  a1, a2, a3, b1, b2 et P1-B1-BIS fusionnés). Branche `recherches/l2-p1-a4`. Aucun réseau : place factice de P1-a1 et sockets pilotées à
  la main ; aucune trame réelle ; aucune valeur de marché.

## FAITS-L2-ACCESS-3 (b), (c), (e) : état au G1

- **(b), levé** (FAITS-L2-ACCESS-3 l.43-51) : base des futures et route `/market` ; forme combinée `/market/stream?streams=<s1>/<s2>/…`,
  enveloppe `{"stream":…,"data":…}` ; `@forceOrder` relève de `/market` ; connexion valide 24 h, ping toutes les 3 min. L'origine entre
  dans la liste fermée `ORIGINS` (§3 point 4) ; une liaison `/market` n'admet que les URL de cette origine sous `/market/`, une liaison
  spot que celles de l'origine spot (Q-P1-3) : toute autre URL est refusée avant la fabrique (`host_refused`).
  Lecture déclarée : les noms de flux en minuscules (`btcusdt@forceOrder`), comme la forme combinée lue pour le spot (FAITS-L2-ACCESS-2
  l.28-29, même enveloppe) ; les lignes lues des futures écrivent `<symbol>@forceOrder` sans en dire la casse. Précédent : Q-7 de a3
  (une ligne de FAITS montrant la forme entière est due avant M-1). Point Q-A4-1 ci-dessous.
- **(c), levé** (FAITS-L2-ACCESS-3 l.52-54) : forme brute `{"e":"serverShutdown","E":…}`, combinée
  `{"stream":"!serverShutdown","data":{…}}`. L'abonnement à `!serverShutdown` n'est pas écrit : aucune URL ne l'ajoute (jamais
  déduit) ; s'il arrive, il est reconnu sous ses deux formes. Il est lu APRÈS la remise du message à l'écrivain (plan §8.2 : « lu après
  écriture ») : la trame est au brut comme toute autre, puis la reconnexion part aussitôt (§3 point 6).
- **(e), non établi, réglé par le repli du plan** (FAITS-L2-ACCESS-3 l.60-64 ; plan §3 point 3 ; MONARK, bascule de charge §3 point 2 :
  « garde aucun `timeUnit` sur `/market` comme dit le plan ») : l'URL `/market` ne porte aucun `timeUnit` ; le journal écrit
  `time_unit: null` à l'ouverture d'une connexion `/market` ; aucune heure n'est lue ni convertie par ce lot. L'unité de `@forceOrder` au
  manifeste reste à c1 (`l2_manifest_time_unit_per_source`), sous FAITS-L2-ACCESS-3-E-1, qui reste ouvert.

Aucune question n'arrête le G1 : (b) et (c) sont lus, (e) a son repli décidé ; les points ci-dessous sont des lectures déclarées.

## Contenu (fichiers de §8.2 : `scripts/l2/links.mjs`, `scripts/l2/links.d.mts`, `test/l2-continuity.test.ts`)

1. **Deux genres de liaison** : `openLink({ symbol, url, out, kind })`, `kind` = `spot` (défaut, a3 inchangé) ou `market` ;
   `marketUrl()` = les quatre `@forceOrder` sur `/market`, sans `timeUnit` ; une liaison `market` a le symbole `ALL` (`<cid>`
   `market-ALL-…`, forme de `segments.mjs` l.28) ; autre genre : arrêt nommé `bad_kind` ; autre symbole : `bad_symbol`.
2. **Chien de garde** (D24-1) : k = 3 intervalles du genre, 20 s en spot, `FUTURES_PING_MS` = 180 s sur `/market` (§3 point 5 ;
   FAITS-L2-ACCESS-1 l.47), soit 540 s.
3. **Reconnexion planifiée** (§3 point 6) : à `RENEW_AGE_MS` = 23 h d'âge plus `RENEW_STAGGER_MS` = 5 min × rang (0 à 3 pour les
   symboles dans l'ordre de `SYMBOLS`, 4 pour `/market`), au plus 23 h 20 min ; l'âge part de la tentative d'ouverture de la connexion
   (son `<cid>`), lecture prudente ; sur `serverShutdown` de la connexion suivie, aussitôt. Journal : `renew`, `cause` = `age` ou
   `server_shutdown`.
4. **Chevauchement** (§3 point 7, D-8) : la neuve s'ouvre par la porte de a3 ; l'ancienne reste ouverte ; elle se ferme, cause
   `renewed`, quand la neuve est ouverte depuis `OVERLAP_MS` = 60 s ET que le carnet a basculé : `link.switched(cid)` (appelé par c5
   après `switchTo` de b2 ; rend `false` sans rien changer hors d'un chevauchement ou pour un autre `<cid>` que la neuve ouverte).
   Une liaison `/market` ne nourrit aucun carnet : 60 s suffisent. Sans bascule, aucun basculement de secours (pas de « failover ») :
   l'ancienne reste ouverte jusqu'à ce que la place la coupe (ou son chien de garde), puis rupture nommée `overlap_break` (`to` = le
   `<cid>` de la neuve, `null` si elle n'est pas encore ouverte). L'ancienne n'est jamais rouverte : seule la connexion suivie a une
   reprise (§3 point 8, inchangé). Un chevauchement à la fois : une reconnexion demandée pendant un chevauchement attend sa fin.
5. **Journal** : liste de a3 plus `renew` et `overlap_break`, même tête, même filtre PLAIN (l.39, ligne gardée : `book.mjs` l.27 y
   renvoie) ; aucune adresse.

## Tests (`test/l2-continuity.test.ts`), tueurs (un par test, convention de `scripts/red-proof.mjs`)

Le fichier appelle `keepCause` au chargement et fait son dossier temporaire dans `before()` (L2-LINKS-FILE-CRASH-1) ; il importe
`links.mjs` par un espace de noms, pour qu'à la base (sans les exports neufs) chaque test rougisse par assertion, jamais au chargement.
- `l2_overlap_planned_raw` (TL-6, part brute ; MAST FM-2.4) : liaison BNBUSDT (rang 2) ; rien à 23 h 10 min − 1 ms ; à 23 h 10 min,
  `renew` puis une neuve ; trames des deux au brut, chacune sous son `<cid>` ; l'ancienne ouverte à 60 s − 1 ms, puis encore à 60 s
  sans bascule ; `switched` la ferme (`renewed`) ; ouverture de la neuve avant la fermeture de l'ancienne, écart ≥ 60 s ; aucune
  reprise de l'ancienne. Tueur : `OVERLAP_MS`.
- `l2_renewal_age_staggered_by_rank` : cinq liaisons (quatre symboles et `/market`) ; chacune renouvelée à 23 h + 5 min × rang, rien
  1 ms avant. Tueur : `RENEW_STAGGER_MS` ; `RENEW_AGE_MS` vérifié à la main (même test).
- `l2_server_shutdown_renews_at_once` : la trame `serverShutdown` écrite au brut, `renew` au même instant ; un faux ami (le mot dans une
  autre charge) ne renouvelle rien ; l'ancienne coupée par la place sans bascule : `overlap_break` nommé, aucune reprise d'elle.
  Tueur : la lecture de `serverShutdown`.
- `l2_market_link_futures_watchdog` (TL-7a, liaison) : `marketUrl()` exacte, sans `timeUnit` ; chemin servi par la place factice ;
  `time_unit` nul au journal ; trames au brut sous `market-ALL-…` ; rien à 540 s − 1 ms de silence, fermeture `watchdog` à 540 s ;
  refus croisés des origines (`host_refused`), `bad_kind`, `bad_symbol`. Tueur : `FUTURES_PING_MS`.
- `test/l2-links.test.ts` : seules ses lignes de tueur suivent les lignes déplacées de `links.mjs` (texte visé inchangé).

## Preuve rouge, contrôles

- Commit des tests seuls (rouges), puis gel ; `node scripts/red-proof.mjs --base 0effb5b2 --gel <gel> --repo <worktree> --draw n --seed
  37` : chaque test jugé F2P (rouge par assertion à la base), chaque tueur tiré tué ; ancres par `verifie-ancres.mjs --touched`.
- Suite complète, `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; R-25 du lot ≤ 547 (estimation du plan : 151 à 197).

## Lectures déclarées (non bloquantes, à confirmer au contrôle de MONARK)

- **Q-A4-1** : casse des flux `/market` en minuscules (ci-dessus, (b)) ; une ligne de FAITS montrant la forme entière, due avant M-1,
  comme Q-7 de a3.
- **Q-A4-2** : `serverShutdown` sur `/market` n'est pas documenté pour les futures ; il y est reconnu de même (lecture seule, sans effet
  s'il n'arrive pas).
- **Q-A4-3** : contrat de `switched(cid)` pour c5 : c5 obtient le `<cid>` de la neuve en branchant les trames vers le carnet (crochet
  à poser par c5, a3 n'en ayant pas) ; a4 ne pose pas ce crochet.
